import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { campaignActive, createApi, publishThread, validateDraft } from '../스레드/에이전트/threads.mjs';

const config = {
  account: 'don.ssaem', booking_url: 'https://mykkachi.com/book',
  kakao_channel_url: 'https://pf.kakao.com/_xfeQxiX',
  campaign: { id: 'event', status: 'pending_dates' },
};
const makeDraft = () => ({
  schema_version: 1, id: '2026-10-08-test', account: 'don.ssaem', title: '새 소재',
  topic_key: '새로운-상황', format_id: '08', created_at: '2026-10-08T12:00:00+09:00',
  cta_mode: 'evergreen', posts: ['첫 글', '이어지는 글',
    '돈쌤 상담·리포트 신청\nhttps://mykkachi.com/book?utm_source=threads&utm_medium=post&utm_content=2026-10-08-test\nhttps://pf.kakao.com/_xfeQxiX'],
});

function mockApi({ username = 'don.ssaem', parentUsername = 'don.ssaem', uncertainPublish = false, linkFailure = false } = {}) {
  const writes = [];
  let created = 0;
  let published = 0;
  let failLink = linkFailure;
  const api = async (path, options = {}) => {
    if (path === '/v1.0/me') return { id: 'owner', username };
    if (path === '/debug_token') return { data: { is_valid: true, scopes: ['threads_basic', 'threads_content_publish'] } };
    if (options.params?.fields === 'id,username') return { id: path.split('/').at(-1), username: parentUsername };
    if (options.method === 'POST') {
      writes.push({ path, params: options.params });
      if (path === '/v1.0/me/threads') return { id: `container${++created}` };
      if (uncertainPublish) throw new Error('Uncertain network response');
      return { id: `media${++published}` };
    }
    if (path.includes('container')) return { status: 'FINISHED' };
    if (failLink) { failLink = false; throw new Error('Temporary permalink failure'); }
    return { id: path.split('/').at(-1), permalink: `https://www.threads.com/@don.ssaem/post/${path.split('/').at(-1)}` };
  };
  return { api, writes, pause: async () => {} };
}

async function tempState(t) {
  const dir = await mkdtemp(join(tmpdir(), 'donssaem-threads-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

test('draft validation catches length, incorrect UTM, missing CTA and account mismatch', () => {
  assert.deepEqual(validateDraft(makeDraft(), config).counts.slice(0, 2), [3, 6]);
  const long = makeDraft(); long.posts[0] = '가'.repeat(501);
  assert.throws(() => validateDraft(long, config), /500/);
  const wrong = makeDraft(); wrong.account = 'someone.else';
  assert.throws(() => validateDraft(wrong, config), /account/);
  const missing = makeDraft(); missing.posts = ['내용만'];
  assert.throws(() => validateDraft(missing, config), /CTA/);
  const utm = makeDraft(); utm.posts[2] = utm.posts[2].replace('utm_source=threads', 'utm_source=other');
  assert.throws(() => validateDraft(utm, config), /UTM/);
});

test('campaign must have a current window and cannot hide in evergreen mode', () => {
  const now = new Date('2026-10-08T12:00:00+09:00');
  const c = { ...config, campaign: { id: 'event', status: 'active', starts_at: '2026-10-08T00:00:00+09:00', ends_at: '2026-10-11T00:00:00+09:00' } };
  const draft = makeDraft(); draft.cta_mode = 'campaign'; draft.campaign_id = 'event';
  assert.doesNotThrow(() => validateDraft(draft, c, now));
  assert.throws(() => validateDraft(draft, config, now), /not active/);
  assert.equal(campaignActive(c, new Date(c.campaign.ends_at)), false);
  assert.equal(campaignActive({ ...c, campaign: { ...c.campaign, capacity_reached: true } }, now), false);
  draft.cta_mode = 'evergreen'; draft.posts[2] = '무료 리포트\n' + draft.posts[2];
  assert.throws(() => validateDraft(draft, c, now), /Promotional CTA/);
});

test('publish defaults to dry run without any network requests', async () => {
  const result = await publishThread({ draft: makeDraft(), config, api: () => { throw new Error('Network must not run'); } });
  assert.equal(result.mode, 'dry-run');
});

test('owner-confirmed event is usable without invented dates, but respects closure and any end time', () => {
  const now = new Date('2026-10-08T12:00:00+09:00');
  const c = { ...config, campaign: { id: 'event', status: 'active', activation: 'user_confirmed', confirmed_at: '2026-10-08T10:00:00+09:00' } };
  assert.equal(campaignActive(c, now), true);
  assert.equal(campaignActive({ ...c, campaign: { ...c.campaign, status: 'closed' } }, now), false);
  assert.equal(campaignActive({ ...c, campaign: { ...c.campaign, ends_at: now.toISOString() } }, now), false);
  assert.equal(campaignActive({ ...c, campaign: { ...c.campaign, confirmed_at: null } }, now), false);
  assert.equal(campaignActive({ ...c, campaign: { ...c.campaign, confirmed_at: '2026-10-09T00:00:00+09:00' } }, now), false);
});

test('active default campaign blocks stale paid CTA and missing application instructions', () => {
  const now = new Date('2026-10-08T12:00:00+09:00');
  const c = { ...config, default_cta_mode: 'campaign', campaign: { id: 'event', status: 'active', activation: 'user_confirmed', confirmed_at: '2026-10-08T10:00:00+09:00', required_cta_phrases: ['스레드 팔로우, 카톡 친구추가 완료', '입금하지 않아도 돼', '하루 뒤', '이메일', '10만원 상당'] } };
  const draft = makeDraft();
  assert.throws(() => validateDraft(draft, c, now), /current default/);
  draft.cta_mode = 'campaign'; draft.campaign_id = 'event';
  assert.throws(() => validateDraft(draft, c, now), /required detail/);
  draft.posts[2] += '\n스레드 팔로우, 카톡 친구추가 완료를 적으면 입금하지 않아도 돼. 하루 뒤 이메일로 10만원 상당 리포트.';
  assert.doesNotThrow(() => validateDraft(draft, c, now));
});

test('single correction reply is attached only to the existing post; rerun does not duplicate it', async t => {
  const mock = mockApi();
  const draft = makeDraft(); draft.reply_to_id = '18073858748736201'; draft.posts = [draft.posts.at(-1)];
  const options = { draft, config, ...mock, stateDir: await tempState(t), execute: true };
  await publishThread(options);
  await publishThread(options);
  assert.equal(mock.writes.length, 2);
  assert.equal(mock.writes[0].params.reply_to_id, draft.reply_to_id);
  const other = { ...draft, reply_to_id: '18137316925651021' };
  await publishThread({ ...options, draft: other });
  assert.equal(mock.writes.length, 4);
  assert.equal(mock.writes[2].params.reply_to_id, other.reply_to_id);
});

test('correction reply cannot accidentally target another account', async t => {
  const mock = mockApi({ parentUsername: 'someone.else' });
  const draft = makeDraft(); draft.reply_to_id = '123'; draft.posts = [draft.posts.at(-1)];
  await assert.rejects(publishThread({ draft, config, ...mock, stateDir: await tempState(t), execute: true }), /target must belong/);
  assert.equal(mock.writes.length, 0);
});

test('wrong token account stops before remote mutation', async t => {
  const mock = mockApi({ username: 'mykkachi.official' });
  await assert.rejects(publishThread({ draft: makeDraft(), config, ...mock, stateDir: await tempState(t), execute: true }), /expected @don.ssaem/);
  assert.equal(mock.writes.length, 0);
});

test('publishes sequential replies including CTA; rerun performs no duplicate writes', async t => {
  const mock = mockApi();
  const options = { draft: makeDraft(), config, ...mock, stateDir: await tempState(t), execute: true };
  const first = await publishThread(options);
  const creates = mock.writes.filter(w => w.path.endsWith('/threads'));
  assert.equal(creates.length, 3);
  assert.equal(creates[0].params.reply_to_id, undefined);
  assert.equal(creates[1].params.reply_to_id, 'media1');
  assert.equal(creates[2].params.reply_to_id, 'media2');
  assert.equal(creates[2].params.text, makeDraft().posts[2]);
  assert.equal(first.posts.length, 3);
  assert.equal(mock.writes.length, 6);
  const second = await publishThread(options);
  assert.deepEqual(second.posts, first.posts);
  assert.equal(mock.writes.length, 6);
});

test('ambiguous publish response persists state and blocks blind retries', async t => {
  const mock = mockApi({ uncertainPublish: true });
  const stateDir = await tempState(t);
  const options = { draft: makeDraft(), config, ...mock, stateDir, execute: true };
  await assert.rejects(publishThread(options), /Uncertain/);
  const files = await readdir(stateDir);
  assert.equal(files.length, 1);
  const journal = JSON.parse(await readFile(join(stateDir, files[0]), 'utf8'));
  assert.equal(journal.posts[0].stage, 'publishing');
  assert.equal(journal.posts[0].container_id, 'container1');
  await assert.rejects(publishThread(options), /uncertain publishing/);
  assert.equal(mock.writes.length, 2);
});

test('permalink lookup failure resumes from saved media id without reposting', async t => {
  const mock = mockApi({ linkFailure: true });
  const options = { draft: makeDraft(), config, ...mock, stateDir: await tempState(t), execute: true };
  await assert.rejects(publishThread(options), /permalink failure/);
  const result = await publishThread(options);
  assert.equal(result.posts.length, 3);
  assert.equal(mock.writes.length, 6);
});

test('API adapter sends token in header and never echoes remote error text', async () => {
  let request;
  const api = createApi('secret-token', async (url, init) => {
    request = { url, init };
    return { ok: false, status: 400, json: async () => ({ error: { code: 190, message: 'secret-token' } }) };
  });
  await assert.rejects(api('/v1.0/me/threads', { method: 'POST', params: { text: 'text & 한글', media_type: 'TEXT' } }), error => {
    assert.equal(error.message.includes('secret-token'), false);
    assert.match(error.message, /190/);
    return true;
  });
  assert.equal(request.url.search, '');
  assert.equal(request.init.headers.Authorization, 'Bearer secret-token');
  assert.equal(request.init.body.get('text'), 'text & 한글');
});

test('soft sets publish without any link or offer even while a campaign is active', () => {
  const draft = makeDraft(); draft.cta_mode = 'soft';
  draft.posts = ['첫 글', '마지막 정리'];
  assert.doesNotThrow(() => validateDraft(draft, config));
  draft.posts[1] = 'https://mykkachi.com/book';
  assert.throws(() => validateDraft(draft, config), /must not contain a link/);
  draft.posts[1] = '10월 특가 1만원';
  assert.throws(() => validateDraft(draft, config), /must not contain an offer/);
});
