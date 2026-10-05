import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { allArticles, articleBody, getArticle, TOPICS } from '../lib/knowledge';
import { SAJU_ENTRIES } from '../lib/saju-library';
import { articleSchema, jsonLd, journalSchema } from '../lib/journal-seo';
import { toJournalCard } from '../lib/journal-card';
import { seoChecks } from '../lib/content';

test('all 24 adapted topics have substantive paired translations and an existing generated image', () => {
  assert.equal(Object.keys(SAJU_ENTRIES).length, 24);
  assert.equal(TOPICS.length, new Set(TOPICS).size);
  for (const locale of ['ko', 'zh-TW'] as const) {
    const collection = allArticles(locale);
    assert.equal(collection.length, 30);
    for (const article of collection) {
      assert.ok(existsSync(`public${article.image.src}`), `${locale}/${article.slug}: image missing`);
      assert.ok(article.image.alt.length > 10);
      assert.ok(article.sections.length >= 3);
      if (locale === 'zh-TW') assert.doesNotMatch(articleBody(article), /[가-힣]/);
      if (article.slug in SAJU_ENTRIES) {
        for (const check of seoChecks({ ...article, body: articleBody(article) })) {
          assert.ok(check.ok, `${locale}/${article.slug}: ${check.label}`);
        }
      }
    }
  }
  const manifest = JSON.parse(readFileSync('public/images/journal/prompts.json', 'utf8'));
  assert.equal(manifest.prompts.length, 12);
  const usedImages = new Set(allArticles('ko').map((a) => a.image.src));
  assert.equal(usedImages.size, 12);
});

test('article and collection schema point to localized pages and actual editorial artwork', () => {
  const a = getArticle('luck-cycles', 'zh-TW')!;
  const [post, crumbs] = articleSchema(a);
  assert.equal(post.inLanguage, 'zh-Hant-TW');
  assert.ok(post.url?.endsWith('/zh-TW/journal/luck-cycles'));
  assert.ok(post.image?.url.endsWith(a.image.src));
  assert.equal(crumbs.itemListElement?.length, 3);
  const schema = journalSchema(allArticles('zh-TW').map(toJournalCard), 'zh-TW');
  assert.equal(schema.mainEntity.numberOfItems, 30);
  assert.ok(schema.mainEntity.itemListElement.every((x) => x.url.includes('/zh-TW/journal/')));
  const payload = { headline: '</script><script>alert(1)</script>' };
  assert.ok(!jsonLd(payload).includes('<'));
  assert.deepEqual(JSON.parse(jsonLd(payload)), payload);
});
