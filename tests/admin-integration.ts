import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { db } from '../lib/db';
const origin=process.env.TEST_ORIGIN || 'http://localhost:3000';
const id=crypto.randomUUID(),slug=`database-check-${id}`;
const title='데이터베이스 연결 검증 원고';
const body='검토한 원고만 공개되는지 데이터베이스 저장과 조회를 검증합니다.';
const token=(expiry:number)=>`${expiry}.${createHmac('sha256',process.env.ADMIN_SESSION_SECRET!).update(String(expiry)).digest('base64')}`;
const cookie=`mk_admin=${encodeURIComponent(token(Math.floor(Date.now()/1000)+600))}`;
async function request(path:string,method='GET',payload?:unknown,auth=true,requestOrigin=origin){
  return fetch(origin+path,{method,redirect:'manual',headers:{...(auth?{cookie}:{}),origin:requestOrigin,'content-type':'application/json'},body:payload?JSON.stringify(payload):undefined});
}
const originalIds = (await db().prepare("SELECT id FROM content WHERE topic='birth-time' AND locale='ko'").all<{id:string}>()).results.map(r=>r.id);
try {
  assert.equal((await request('/api/admin/content','GET',undefined,false)).status,401);
  assert.equal((await request('/api/admin/content','POST',{},true,'https://wrong.example')).status,403);
  const expired=await fetch(origin+'/api/admin/content',{headers:{cookie:`mk_admin=${encodeURIComponent(token(1))}`}});
  assert.equal(expired.status,401);
  const forged=await fetch(origin+'/api/admin/content',{headers:{'oai-authenticated-user-email':'fake@example.com',cookie:'mk_admin=123.invalid'}});
  assert.equal(forged.status,401);
  assert.equal((await request('/api/admin/overview')).status,200);
  const generated=await request('/api/admin/content','POST',{topic:'birth-time',locale:'ko'});
  assert.equal(generated.status,200);
  const generatedData=await generated.json();
  assert.equal(generatedData.items.filter((i:{topic:string;locale:string})=>i.topic==='birth-time'&&i.locale==='ko').length,3);
  const repeat=await (await request('/api/admin/content','POST',{topic:'birth-time',locale:'ko'})).json();
  assert.equal(repeat.created,false);assert.equal(repeat.createdCount,0);
  const now=new Date().toISOString();
  await db().prepare(`INSERT INTO content (id,channel,locale,topic,title,slug,excerpt,body,keyword,slides,status,created_at,updated_at)
    VALUES (?,'seo','ko','five-elements',?,?,?,?,?,'[]','draft',?,?)`).bind(id,title,slug,'검증용 설명',body,'검증',now,now).run();
  const items=await (await request('/api/admin/content')).json();
  assert.ok(items.items.some((i:{id:string})=>i.id===id));
  assert.equal((await request('/journal/'+slug,'GET',undefined,false)).status,404,'draft leaked');
  let payload={title,body,excerpt:'검증용 설명',slides:[],status:'published',updatedAt:now};
  assert.equal((await request('/api/admin/content/'+id,'PATCH',payload)).status,409,'unreviewed publication accepted');
  const approval=await request('/api/admin/content/'+id,'PATCH',{...payload,status:'approved'});
  assert.equal(approval.status,200);payload.updatedAt=(await approval.json()).updatedAt;
  const published=await request('/api/admin/content/'+id,'PATCH',payload);
  assert.equal(published.status,200);payload.updatedAt=(await published.json()).updatedAt;
  let publicPage=await request('/journal/'+slug,'GET',undefined,false);
  assert.equal(publicPage.status,200);assert.ok((await publicPage.text()).includes(title));
  const changedTitle='미발행 변경 내용이 공개되면 안 됩니다';
  const edit=await request('/api/admin/content/'+id,'PATCH',{...payload,title:changedTitle,status:'draft'});
  assert.equal(edit.status,200);
  const publicText=await (await request('/journal/'+slug,'GET',undefined,false)).text();
  assert.ok(publicText.includes(title));assert.ok(!publicText.includes(changedTitle),'draft replaced published snapshot');
  assert.equal((await request('/api/admin/content/'+id,'PATCH',payload)).status,409,'stale update accepted');
  const logout=await request('/api/admin/logout','POST');assert.equal(logout.status,200);assert.ok(logout.headers.get('set-cookie')?.includes('Max-Age=0'));
  console.log('PASS authorization, origin protection, DB persistence, review/publish, draft isolation, optimistic locking, logout');
 } finally {
  await db().prepare('DELETE FROM content WHERE id=?').bind(id).run();
  const rows=(await db().prepare("SELECT id FROM content WHERE topic='birth-time' AND locale='ko'").all<{id:string}>()).results;
  for(const row of rows)if(!originalIds.includes(row.id))await db().prepare('DELETE FROM content WHERE id=?').bind(row.id).run();
}

