#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const readJson = async path => JSON.parse(await readFile(path, 'utf8'));
const count = text => Array.from(text).length;
const cleanHandle = name => String(name || '').replace(/^@/, '').toLowerCase();
const required = (ok, message) => { if (!ok) throw new Error(message); };

export function campaignActive(config, now = new Date()) {
  const c = config.campaign;
  if (c?.status !== 'active' || c.capacity_reached) return false;
  if (c.starts_at && (!Number.isFinite(Date.parse(c.starts_at)) || now < new Date(c.starts_at))) return false;
  if (c.ends_at && (!Number.isFinite(Date.parse(c.ends_at)) || now >= new Date(c.ends_at))) return false;
  if (c.activation === 'user_confirmed') {
    return Number.isFinite(Date.parse(c.confirmed_at)) && new Date(c.confirmed_at) <= now;
  }
  return Number.isFinite(Date.parse(c.starts_at)) && Number.isFinite(Date.parse(c.ends_at));
}

export function validateDraft(draft, config, now = new Date()) {
  required(draft.schema_version === 1, 'schema_version must be 1.');
  required(/^[a-z0-9][a-z0-9_-]{2,100}$/.test(draft.id || ''), 'Use a unique lowercase slug for id.');
  required(cleanHandle(draft.account) === cleanHandle(config.account), 'Draft account differs from operating settings.');
  for (const key of ['title', 'topic_key', 'format_id', 'created_at']) {
    required(typeof draft[key] === 'string' && draft[key].trim(), `Missing ${key}.`);
  }
  required(Number.isFinite(Date.parse(draft.created_at)), 'Invalid created_at.');
  required(['evergreen', 'campaign'].includes(draft.cta_mode), 'cta_mode must be evergreen or campaign.');
  const isReply = draft.reply_to_id !== undefined;
  if (isReply) required(typeof draft.reply_to_id === 'string' && /^\d+$/.test(draft.reply_to_id), 'reply_to_id must be a numeric post id string.');
  required(Array.isArray(draft.posts) && draft.posts.length >= (isReply ? 1 : 2), 'Provide content and a final CTA reply.');
  for (const [i, post] of draft.posts.entries()) {
    required(typeof post === 'string' && post.trim(), `Post ${i + 1} is empty.`);
    required(count(post) <= 500, `Post ${i + 1} exceeds 500 characters (${count(post)}).`);
    required(!/https?:\/\/\S*…/.test(post), `Post ${i + 1} has a truncated URL.`);
  }
  const last = draft.posts.at(-1);
  const urls = last.match(/https?:\/\/[^\s<>]+/g) || [];
  required(urls.some(raw => {
    try {
      const url = new URL(raw);
      return url.origin + url.pathname === config.booking_url &&
        url.searchParams.get('utm_source') === 'threads' &&
        url.searchParams.get('utm_medium') === 'post' &&
        url.searchParams.get('utm_content') === draft.id;
    } catch { return false; }
  }), 'Final reply needs the full booking URL with threads/post UTM and this draft id.');
  required(urls.includes(config.kakao_channel_url), 'Final reply needs the full Kakao channel URL.');
  if (config.default_cta_mode === 'campaign' && campaignActive(config, now)) {
    required(draft.cta_mode === 'campaign', 'The current default is the free-report campaign; update the final CTA.');
  }
  if (draft.cta_mode === 'campaign') {
    required(draft.campaign_id === config.campaign?.id, 'Campaign id differs from operating settings.');
    required(campaignActive(config, now), 'Campaign is not active now; use the evergreen CTA.');
    for (const phrase of config.campaign.required_cta_phrases || []) {
      required(last.includes(phrase), `Campaign CTA is missing a required detail: ${phrase}`);
    }
  } else {
    required(!/무료|입금\s*없이|선착순|3일간/.test(last), 'Promotional CTA needs an active campaign, not evergreen mode.');
  }
  return { id: draft.id, account: draft.account, counts: draft.posts.map(count), cta_mode: draft.cta_mode, ...(isReply ? { reply_to_id: draft.reply_to_id } : {}) };
}

export function createApi(token, request = fetch) {
  required(token, 'THREADS_ACCESS_TOKEN is missing.');
  return async (path, { method = 'GET', params = {} } = {}) => {
    const url = new URL(path, 'https://graph.threads.net/');
    const init = { method, headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000) };
    if (method === 'GET') url.search = new URLSearchParams(params).toString();
    else init.body = new URLSearchParams(params);
    let response;
    try { response = await request(url, init); }
    catch { throw new Error(`Threads ${method} request did not return a response; inspect the publish journal before retrying.`); }
    let data;
    try { data = await response.json(); }
    catch { throw new Error(`Threads returned unreadable JSON (HTTP ${response.status}).`); }
    if (!response.ok || data.error) {
      // API errors can echo request data. Only allowlisted error metadata leaves this function.
      throw new Error(`Threads HTTP ${response.status}, code ${data.error?.code ?? 'unknown'}, subcode ${data.error?.error_subcode ?? 'none'}.`);
    }
    return data;
  };
}

export async function checkAccount(api, config, token) {
  const me = await api('/v1.0/me', { params: { fields: 'id,username' } });
  required(cleanHandle(me.username) === cleanHandle(config.account), `Token belongs to @${me.username}; expected @${config.account}. No posts sent.`);
  // In cloud runs a network proxy injects the real token, so debug_token cannot inspect it; /me already proved the account.
  if (process.env.THREADS_TOKEN_INJECTED === '1') return { id: me.id, username: me.username, valid: true, scopes: null, expires_at: null, token: 'proxy-injected' };
  const debug = await api('/debug_token', { params: { input_token: token } });
  const data = debug.data || {};
  required(data.is_valid, 'Threads access token is not valid.');
  required(data.scopes?.includes('threads_content_publish'), 'Token lacks threads_content_publish.');
  return { id: me.id, username: me.username, valid: data.is_valid, scopes: data.scopes,
    expires_at: data.expires_at ? new Date(data.expires_at * 1000).toISOString() : null };
}

export async function writeJsonAtomic(path, data) {
  await mkdir(dirname(path), { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(data, null, 2) + '\n', { mode: 0o600 });
  await rename(temp, path);
}

export async function publishThread({ draft, config, api, token, stateDir, execute = false, pause = ms => new Promise(r => setTimeout(r, ms)) }) {
  const validation = validateDraft(draft, config);
  if (!execute) return { mode: 'dry-run', ...validation };
  const account = await checkAccount(api, config, token);
  if (draft.reply_to_id) {
    const parent = await api(`/v1.0/${draft.reply_to_id}`, { params: { fields: 'id,username' } });
    required(cleanHandle(parent.username) === cleanHandle(account.username), 'The reply target must belong to the configured account.');
  }
  // Preserve existing journal hashes for normal threads; replies also bind to their parent.
  const identity = [account.id, draft.posts];
  if (draft.reply_to_id) identity.push(draft.reply_to_id);
  const digest = createHash('sha256').update(JSON.stringify(identity)).digest('hex');
  await mkdir(stateDir, { recursive: true });
  const path = join(stateDir, `${digest}.json`);
  const lock = `${path}.lock`;
  try { await mkdir(lock); }
  catch { throw new Error('This thread has a publish lock. Check for a running process before removing a stale lock.'); }
  try {
    const state = existsSync(path) ? await readJson(path) : {
      draft_id: draft.id, account: account.username, account_id: account.id, digest, reply_to_id: draft.reply_to_id,
      posts: draft.posts.map(() => ({ stage: 'pending' })), created_at: new Date().toISOString(),
    };
    required(state.digest === digest && state.posts.length === draft.posts.length, 'Publish journal does not match draft.');
    const save = () => writeJsonAtomic(path, { ...state, updated_at: new Date().toISOString() });
    await save();
    for (let i = 0; i < draft.posts.length; i++) {
      const item = state.posts[i];
      if (item.stage !== 'published') {
        required(!['creating', 'publishing'].includes(item.stage), `Post ${i + 1} has an uncertain ${item.stage} result. Inspect the account and journal; do not repost.`);
        if (item.stage === 'pending') {
          item.stage = 'creating';
          await save();
          const params = { media_type: 'TEXT', text: draft.posts[i] };
          if (i > 0) params.reply_to_id = state.posts[i - 1].media_id;
          else if (draft.reply_to_id) params.reply_to_id = draft.reply_to_id;
          const container = await api('/v1.0/me/threads', { method: 'POST', params });
          required(container.id, 'Container request did not return an id.');
          item.container_id = container.id;
          item.stage = 'created';
          await save();
        }
        required(item.stage === 'created' && item.container_id, 'Unexpected publish journal stage.');
        let ready = false;
        for (let attempt = 0; attempt < 10; attempt++) {
          const container = await api(`/v1.0/${item.container_id}`, { params: { fields: 'status' } });
          if (container.status === 'FINISHED') { ready = true; break; }
          required(container.status === 'IN_PROGRESS', `Container status is ${container.status}; inspect before continuing.`);
          await pause(2000);
        }
        required(ready, 'Container is still processing. The saved container can be checked on a later run.');
        // Persist before the remote mutation. An uncertain response must never cause an automatic repost.
        item.stage = 'publishing';
        await save();
        const published = await api('/v1.0/me/threads_publish', { method: 'POST', params: { creation_id: item.container_id } });
        required(published.id, 'Publish request returned no media id; inspect the journal.');
        item.media_id = published.id;
        item.stage = 'published';
        await save();
      }
      if (!item.permalink) {
        const post = await api(`/v1.0/${item.media_id}`, { params: { fields: 'id,permalink' } });
        required(post.permalink, 'Published id saved, but permalink is not available yet.');
        item.permalink = post.permalink;
        await save();
      }
    }
    return { mode: 'published', account: account.username, journal: path, posts: state.posts.map(p => ({ id: p.media_id, url: p.permalink })) };
  } finally { await rm(lock, { recursive: true, force: true }); }
}

async function main(args) {
  const [command, file, ...flags] = args;
  if (!command || command === '--help') {
    console.log('Usage: node 스레드/에이전트/threads.mjs status | topics | recent [--limit=N≤100] | validate <draft.json> | publish <draft.json> [--execute]\nPublish defaults to a local dry run. --execute is only for an explicit user publishing request.');
    return;
  }
  required(['status', 'topics', 'recent', 'validate', 'publish'].includes(command), 'Unknown command.');
  required(flags.every(flag => flag === '--execute') && flags.length <= 1, 'Unknown or duplicate flags.');
  const config = await readJson(join(here, '운영설정.json'));
  if (command === 'topics') {
    const dir = join(root, '스레드/초안');
    const names = existsSync(dir) ? (await readdir(dir)).filter(n => n.endsWith('.json')) : [];
    const drafts = await Promise.all(names.map(name => readJson(join(dir, name))));
    const recent = drafts.filter(d => !d.reply_to_id).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 20);
    console.log(JSON.stringify({ references: (await readJson(join(here, '최근이력.json'))).items,
      drafts: recent.map(({ id, title, topic_key, format_id, created_at }) => ({ id, title, topic_key, format_id, created_at })) }, null, 2));
    return;
  }
  const draft = ['validate', 'publish'].includes(command) ? await readJson(resolve(file || '')) : null;
  if (command === 'validate' || (command === 'publish' && !flags.includes('--execute'))) {
    console.log(JSON.stringify({ mode: command === 'validate' ? 'validated' : 'dry-run', ...validateDraft(draft, config) }, null, 2));
    return;
  }
  const require = createRequire(import.meta.url);
  require('@next/env').loadEnvConfig(root, false, { info() {}, error() {} });
  const token = process.env.THREADS_ACCESS_TOKEN;
  const api = createApi(token);
  if (command === 'status') {
    const account = await checkAccount(api, config, token);
    console.log(JSON.stringify({ ...account, configured_username_matches: cleanHandle(process.env.THREADS_USERNAME) === cleanHandle(account.username), campaign_active: campaignActive(config) }, null, 2));
  } else if (command === 'recent') {
    await checkAccount(api, config, token);
    const result = await api('/v1.0/me/threads', { params: { fields: 'id,text,timestamp,permalink', limit: String(Math.min(100, Math.max(1, Number(([file, ...flags].find(f => f?.startsWith('--limit=')) || '--limit=25').slice(8)) || 25))) } });
    // Do not print paging URLs: they can contain the access token.
    console.log(JSON.stringify({ posts: (result.data || []).map(({ id, text, timestamp, permalink }) => ({ id, text, timestamp, permalink })) }, null, 2));
  } else {
    console.log(JSON.stringify(await publishThread({ draft, config, api, token, stateDir: join(root, '.codex/threads-publish'), execute: true }), null, 2));
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch(error => { console.error(error.message); process.exitCode = 1; });
}
