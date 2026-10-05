import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
const origin = process.env.TEST_ORIGIN || 'http://localhost:3000';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  for (const route of ['/', '/zh-TW', '/read', '/journal', '/journal/five-elements', '/zh-TW/journal/five-elements']) {
    const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, route);
    assert.ok(!/루운|LUUN/.test(await page.locator('body').innerText()), route);
    const width = await page.evaluate(() => ({ screen: innerWidth, content: document.documentElement.scrollWidth }));
    assert.ok(width.content <= width.screen + 1, `${route}: mobile overflow`);
  }
  await page.goto(origin, { waitUntil: 'networkidle' });
  assert.ok(await page.locator('.hero-art img').evaluate(img => img.complete && img.naturalWidth > 0));
  assert.equal(JSON.parse(await page.locator('script[type="application/ld+json"]').textContent()).name, '마이까치');
  const sent = [];
  page.on('request', request => sent.push(request.url() + (request.postData() || '')));
  await page.locator('#quick-birth').fill('1994-04-17');
  await page.getByRole('button', { name: '무료로 내 사주 보기', exact: true }).click();
  await page.waitForURL('**/read');
  await page.waitForFunction(() => document.querySelector('input[type=date]')?.value === '1994-04-17');
  await page.getByRole('checkbox', { name: '태어난 시간을 몰라요' }).check();
  await page.getByRole('button', { name: '나의 사주 펼쳐보기' }).click();
  await page.locator('.pillars').waitFor();
  assert.ok(!sent.some(request => request.includes('1994-04-17')), 'birth date leaked to a request');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '나의 카드 저장' }).click();
  assert.equal((await download).suggestedFilename(), 'mykkachi-my-reading.png');
  const admin = await page.request.get(origin + '/admin', { maxRedirects: 0, headers: { 'oai-authenticated-user-email': 'fake@example.com', 'oai-authenticated-user-id': 'fake' } });
  assert.ok([307, 308].includes(admin.status()));
  assert.equal(admin.headers().location, 'https://luun-saju.luke3833.chatgpt.site/admin');
  assert.equal((await page.request.get(origin + '/api/admin/content')).status(), 404);
  for (const route of ['/robots.txt', '/sitemap.xml']) {
    const response = await page.request.get(origin + route);
    assert.equal(response.status(), 200);
    assert.ok(!(await response.text()).includes('luun-saju'));
  }
  assert.deepEqual(errors, []);
  console.log('PASS public routes, mobile layout, reading, private input, download, studio boundary, SEO');
} finally {
  await browser.close();
}
