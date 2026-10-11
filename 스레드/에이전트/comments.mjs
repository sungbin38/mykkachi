#!/usr/bin/env node
// 무료 사주풀이 글(format_id 12)의 댓글을 찾아 일정 시간 뒤 답글을 단다.
//   node 스레드/에이전트/comments.mjs due [--min-age=11] [--days=3] [--wait=540]
//   node 스레드/에이전트/comments.mjs reply <comment_id> <text.txt> [--execute]
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { checkAccount, createApi, writeJsonAtomic } from './threads.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
const required = (ok, message) => { if (!ok) throw new Error(message); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MAX_REPLY = 500;

async function freePosts(days) {
  const dir = join(root, '스레드/초안');
  const since = Date.now() - days * 86400000;
  const out = [];
  for (const name of existsSync(dir) ? await readdir(dir) : []) {
    if (!name.endsWith('.json')) continue;
    const d = await readJson(join(dir, name));
    if (d.format_id !== '12' || d.publication?.status !== 'published') continue;
    if (Date.parse(d.created_at) < since) continue;
    out.push({ draft_id: d.id, ids: d.publication.posts.map(p => p.id).filter(Boolean) });
  }
  return out;
}

async function dueComments(api, me, minAge, days) {
  const due = [];
  for (const post of await freePosts(days)) {
    const root_id = post.ids[0];
    const res = await api(`/v1.0/${root_id}/conversation`, { params: { fields: 'id,text,username,timestamp,replied_to,is_reply_owned_by_me', reverse: 'false', limit: '100' } });
    const items = res.data || [];
    const answered = new Set(items.filter(x => x.username === me || x.is_reply_owned_by_me).map(x => x.replied_to?.id).filter(Boolean));
    for (const c of items) {
      if (c.username === me || c.is_reply_owned_by_me || answered.has(c.id)) continue;
      // 우리 본문·신청 댓글에 직접 단 댓글만 대상 (다른 사람끼리의 대화는 제외)
      if (!post.ids.includes(c.replied_to?.id)) continue;
      const age = (Date.now() - Date.parse(c.timestamp)) / 60000;
      if (age < minAge) continue;
      due.push({ post: post.draft_id, comment_id: c.id, username: c.username, age_min: Math.round(age), text: c.text || '' });
    }
  }
  return due;
}

async function reply(api, config, token, commentId, text, execute) {
  required(/^\d+$/.test(commentId), 'comment_id must be numeric.');
  required(text.trim() && Array.from(text).length <= MAX_REPLY, `Reply must be 1-${MAX_REPLY} characters.`);
  if (!execute) return { mode: 'dry-run', comment_id: commentId, chars: Array.from(text).length };
  await checkAccount(api, config, token);
  const dir = join(root, '.codex/threads-replies');
  await mkdir(dir, { recursive: true });
  const path = join(dir, `${commentId}.json`), lock = `${path}.lock`;
  try { await mkdir(lock); } catch { throw new Error('Reply lock exists for this comment.'); }
  try {
    const state = existsSync(path) ? await readJson(path) : { comment_id: commentId, stage: 'pending' };
    required(!['creating', 'publishing'].includes(state.stage), `Uncertain ${state.stage} state; inspect the conversation, do not repost.`);
    const save = () => writeJsonAtomic(path, { ...state, updated_at: new Date().toISOString() });
    if (state.stage === 'pending') {
      state.stage = 'creating'; await save();
      const c = await api('/v1.0/me/threads', { method: 'POST', params: { media_type: 'TEXT', text, reply_to_id: commentId } });
      required(c.id, 'No container id.');
      state.container_id = c.id; state.stage = 'created'; await save();
    }
    if (state.stage === 'created') {
      let ready = false;
      for (let i = 0; i < 10 && !ready; i++) {
        const s = await api(`/v1.0/${state.container_id}`, { params: { fields: 'status' } });
        ready = s.status === 'FINISHED';
        if (!ready) { required(s.status === 'IN_PROGRESS', `Container status ${s.status}.`); await sleep(2000); }
      }
      required(ready, 'Container still processing; rerun later.');
      state.stage = 'publishing'; await save();
      const p = await api('/v1.0/me/threads_publish', { method: 'POST', params: { creation_id: state.container_id } });
      required(p.id, 'Publish returned no id.');
      state.media_id = p.id; state.stage = 'published'; await save();
    }
    if (!state.permalink) {
      const post = await api(`/v1.0/${state.media_id}`, { params: { fields: 'permalink' } });
      state.permalink = post.permalink; await save();
    }
    return { mode: 'published', comment_id: commentId, id: state.media_id, url: state.permalink };
  } finally { await rm(lock, { recursive: true, force: true }); }
}

async function main([command, ...rest]) {
  const flags = Object.fromEntries(rest.filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
  const args = rest.filter(a => !a.startsWith('--'));
  required(['due', 'reply'].includes(command), 'Usage: comments.mjs due [--min-age=11] [--days=3] [--wait=540] | reply <comment_id> <text.txt> [--execute]');
  createRequire(import.meta.url)('@next/env').loadEnvConfig(root, false, { info() {}, error() {} });
  const config = await readJson(join(here, '운영설정.json'));
  const token = process.env.THREADS_ACCESS_TOKEN;
  const api = createApi(token);
  if (command === 'due') {
    const minAge = Number(flags['min-age'] ?? 11), days = Number(flags.days ?? 3), wait = Number(flags.wait ?? 0);
    const deadline = Date.now() + wait * 1000;
    let due;
    // --wait: 처리할 댓글이 생길 때까지 60초 간격으로 확인 (최대 wait초)
    for (;;) {
      due = await dueComments(api, config.account, minAge, days);
      if (due.length || Date.now() + 60000 > deadline) break;
      await sleep(60000);
    }
    console.log(JSON.stringify({ checked_at: new Date().toISOString(), due }, null, 2));
  } else {
    required(args.length === 2, 'reply needs <comment_id> <text.txt>.');
    const text = (await readFile(resolve(args[1]), 'utf8')).trim();
    console.log(JSON.stringify(await reply(api, config, token, args[0], text, Boolean(flags.execute)), null, 2));
  }
}

main(process.argv.slice(2)).catch(e => { console.error(e.message); process.exitCode = 1; });
