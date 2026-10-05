import { readFile, readdir } from "node:fs/promises";
import { sqlClient, db } from "../lib/db";
import { allArticles, articleBody } from "../lib/knowledge";

// Use the existing direct connection for schema changes when available.
if (process.env.DATABASE_URL_UNPOOLED) process.env.DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
const sql = sqlClient();
// Apply every db/*.sql in name order. All statements are idempotent (IF NOT EXISTS).
const dir = new URL('../db/', import.meta.url);
for (const file of (await readdir(dir)).filter(f => f.endsWith('.sql')).sort()) {
  const schema = await readFile(new URL(file, dir), 'utf8');
  await sql.transaction(schema.split(';').map(s => s.trim()).filter(Boolean).map(s => sql.query(s)));
  console.log('applied', file);
}
// Only seed missing articles. Re-running never overwrites editorial changes.
const now = new Date().toISOString();
const items = ['ko', 'zh-TW'].flatMap(locale => allArticles(locale as 'ko' | 'zh-TW'));
await db().batch(items.map(a => db().prepare(`INSERT INTO content
(id,channel,locale,topic,title,slug,excerpt,body,keyword,slides,status,published_snapshot,published_at,created_at,updated_at)
VALUES (?,'seo',?,?,?,?,?,?,?,'[]','published',?,?,?,?) ON CONFLICT DO NOTHING`).bind(
  crypto.randomUUID(), a.locale, a.slug, a.title, a.slug, a.excerpt, articleBody(a), a.keyword,
  JSON.stringify({title:a.title,excerpt:a.excerpt,body:articleBody(a)}),a.date+'T00:00:00.000Z',now,now,
)));
console.log('Schema ready. Journal seeds inserted if missing:', items.length);
