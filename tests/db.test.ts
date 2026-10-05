import { test } from 'node:test';
import assert from 'node:assert/strict';
import { db, sqlClient } from '../lib/db';

test('bound values cannot change SQL; failed transactions roll back', async () => {
  const key = `test:${crypto.randomUUID()}`;
  const value = "' ); DROP TABLE settings; --";
  try {
    await db().prepare('INSERT INTO settings (key,value) VALUES (?,?)').bind(key,value).run();
    assert.equal((await db().prepare('SELECT value FROM settings WHERE key=?').bind(key).first<{value:string}>())?.value,value);
    await assert.rejects(db().batch([
      db().prepare('UPDATE settings SET value=? WHERE key=?').bind('should roll back',key),
      db().prepare('INSERT INTO table_that_does_not_exist (value) VALUES (?)').bind('fail'),
    ]));
    assert.equal((await db().prepare('SELECT value FROM settings WHERE key=?').bind(key).first<{value:string}>())?.value,value);
  } finally {
    await db().prepare('DELETE FROM settings WHERE key=?').bind(key).run();
  }
});

test('journal seeds are published and both locales exist', async () => {
  const result=await sqlClient().query('SELECT locale,count(*)::int AS count FROM content WHERE published_at IS NOT NULL GROUP BY locale');
  assert.equal(result.rows.length,2);
  for(const row of result.rows)assert.ok(row.count>=6);
});
