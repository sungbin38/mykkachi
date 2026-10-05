import {spawn} from 'node:child_process';
import {createHmac,pbkdf2Sync,randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
import {neon} from '@neondatabase/serverless';
const secret=process.env.ADMIN_SESSION_SECRET;
const password=randomBytes(24).toString('hex'),salt=randomBytes(16);
const hash=`pbkdf2-sha256:100000:${salt.toString('base64')}:${pbkdf2Sync(password,salt,100000,32,'sha256').toString('base64')}`;
// Override credentials for this local test process only. Never alter deployed credentials.
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3101'],{env:{...process.env,ADMIN_PASSWORD_HASH:hash},stdio:'ignore'});
const origin='http://localhost:3101',ip=`test-${randomBytes(16).toString('hex')}`;
const sql=neon(process.env.DATABASE_URL);
try {
  for(let i=0;i<100;i++){try{if((await fetch(origin+'/admin/login')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  const login=(value,headers={})=>fetch(origin+'/api/admin/login',{method:'POST',headers:{origin,'content-type':'application/json','x-vercel-forwarded-for':ip,...headers},body:JSON.stringify({password:value})});
  assert.equal((await login(password,{origin:'https://wrong.example'})).status,403);
  assert.equal((await login('wrong')).status,401);
  const good=await login(password);assert.equal(good.status,200);
  const cookie=good.headers.get('set-cookie');assert.ok(cookie.includes('HttpOnly'));assert.ok(cookie.includes('SameSite=Lax'));
  assert.equal((await fetch(origin+'/api/admin/content',{headers:{cookie:cookie.split(';')[0]}})).status,200);
  const key=createHmac('sha256',secret).update(ip).digest('hex');
  await sql`INSERT INTO admin_login_attempts (key,attempts,expires_at) VALUES (${key},10,NOW()+INTERVAL '15 minutes') ON CONFLICT(key) DO UPDATE SET attempts=10`;
  assert.equal((await login(password)).status,429);
  console.log('PASS password verification, session cookie, authenticated query, origin rejection, persistent login limit');
} finally {
  const key=createHmac('sha256',secret).update(ip).digest('hex');
  await sql`DELETE FROM admin_login_attempts WHERE key=${key}`;
  child.kill('SIGTERM');
}
