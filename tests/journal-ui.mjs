import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
const origin = process.env.TEST_ORIGIN || 'http://localhost:3100';
const output = 'outputs/journal-check';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
// Keep visual checks from creating synthetic production analytics.
await page.route('**/api/track', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
try {
  const urls = [];
  for (const prefix of ['', '/zh-TW']) {
    const route = `${prefix}/journal`;
    const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, route);
    assert.equal(await page.locator('.journal-card').count(), 30);
    assert.equal(await page.locator('.journal-card img').count(), 30);
    for (const image of await page.locator('.journal-card img').all()) {
      await image.scrollIntoViewIfNeeded();
      await image.evaluate((img) => img.decode());
      assert.ok(await image.evaluate((img) => img.naturalWidth > 0));
    }
    await page.evaluate(() => scrollTo(0, 0));
    const paths = await page.locator('.journal-card').evaluateAll((cards) => cards.map((c) => c.getAttribute('href')));
    urls.push(...paths);
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://mykkachi.vercel.app' + route);
    const schema = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    assert.equal(schema.mainEntity.numberOfItems, 30);
    await page.screenshot({ path: `${output}/${prefix ? 'taiwan' : 'korean'}-desktop.png`, fullPage: true });
    await page.getByRole('button', { name: prefix ? '十神筆記' : '십성 이야기' }).click();
    assert.equal(await page.locator('.journal-card').count(), 6);
    await page.locator('.journal-filters button').first().click();
    await page.getByRole('searchbox').fill(prefix ? '大運與流年' : '대운과 세운');
    assert.equal(await page.locator('.journal-card').count(), 1);
    await page.getByRole('searchbox').fill('not-an-existing-topic-9382');
    assert.equal(await page.locator('.journal-card').count(), 0);
    await page.locator('.journal-empty button').click();
    assert.equal(await page.locator('.journal-card').count(), 30);
    console.log('PASS library, artwork, localized metadata, filters and search', route);
  }
  for (const route of ['/journal/luck-cycles', '/zh-TW/journal/luck-cycles']) {
    await page.goto(origin + route, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(await page.locator('.article-prose h2').count(), 4);
    assert.equal(await page.locator('.article-toc a').count(), 4);
    assert.equal(await page.locator('.related-letters .journal-card img').count(), 3);
    assert.ok(await page.locator('.article-art img').evaluate((img) => img.complete && img.naturalWidth > 0));
    const [post, crumbs] = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    assert.equal(post['@type'], 'BlogPosting');
    assert.equal(post.url, 'https://mykkachi.vercel.app' + route);
    assert.equal(crumbs.itemListElement.length, 3);
    assert.equal(await page.locator('meta[property="og:image"]').getAttribute('content'), post.image.url);
    assert.equal(await page.locator('meta[name="twitter:card"]').getAttribute('content'), 'summary_large_image');
    assert.equal(await page.locator('.language').getAttribute('href'), route.startsWith('/zh-TW') ? '/journal/luck-cycles' : '/zh-TW/journal/luck-cycles');
    await page.screenshot({ path: `${output}/${route.startsWith('/zh-TW') ? 'taiwan' : 'korean'}-article.png`, fullPage: true });
  }
  for (const width of [390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['/', '/zh-TW', '/journal', '/zh-TW/journal', '/journal/ten-gods', '/zh-TW/journal/ten-gods']) {
      await page.goto(origin + route, { waitUntil: 'networkidle' });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `overflow ${width}: ${route}`);
      const images = page.locator('.journal-card img');
      assert.ok(await images.count() >= 3);
      if (width === 390 && route === '/zh-TW/journal') await page.screenshot({ path: `${output}/taiwan-mobile.png`, fullPage: true });
      if (width === 390 && route === '/') {
        for (const img of await page.locator('.journal-card img').all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate((el) => el.decode()); }
        await page.locator('.journal-section').screenshot({ path: `${output}/home-letters-mobile.png` });
      }
    }
  }
  // Check every real article's server-rendered body without executing JavaScript.
  for (let index = 0; index < urls.length; index += 4) {
    await Promise.all(urls.slice(index, index + 4).map(async (route) => {
      const response = await page.request.get(origin + route);
      assert.equal(response.status(), 200, route);
      const html = await response.text();
      assert.ok(html.includes('article-prose') && html.includes('application/ld+json'), route);
    }));
  }
  assert.equal((await page.request.get(origin + '/journal/not-a-real-letter')).status(), 404);
  const sitemap = await (await page.request.get(origin + '/sitemap.xml')).text();
  for (const route of urls) assert.ok(sitemap.includes('https://mykkachi.vercel.app' + route + '<'), `sitemap ${route}`);
  assert.equal((sitemap.match(/<image:image>/g) || []).length, 60);
  assert.deepEqual(errors, []);
  console.log('PASS 60 SSR article routes, two locales, images, article SEO, TOC, related cards, responsive layouts, 404, and image sitemap');
} finally {
  await browser.close();
}
