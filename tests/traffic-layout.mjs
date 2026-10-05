// Read-only browser regression: API fixtures include deliberately long URLs.
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { chromium } from '@playwright/test';
const origin=process.env.TEST_ORIGIN || 'http://localhost:3109';
assert.ok(['localhost','127.0.0.1'].includes(new URL(origin).hostname));
const secret=process.env.ADMIN_SESSION_SECRET;
assert.ok(secret);
const payload=String(Math.floor(Date.now()/1000)+600);
const token=payload+'.'+createHmac('sha256',secret).update(payload).digest('base64');
const long='/book?utm_source=threads&fbclid='+'a'.repeat(500);
const overview={metrics:[{day:'2026-10-05',event:'page_view',source:'threads',locale:'ko',count:17}],jobs:[],settings:{},connections:{database:true,analytics:true}};
const report={days:30,totals:{sessions:4,visitors:3,booked:1,page_views:17},bySource:[{source:'threads.net',sessions:4,booked:1}],byLanding:[{path:long,sessions:4,booked:1}],byDevice:[{device:'mobile',sessions:4}],byDay:[],funnel:[['방문',4],['예약 완료',1]],recent:[{id:'fixture',startedAt:new Date().toISOString(),source:'threads',pageViews:17,trail:long+' → '+long,referrer:'https://example.com/'+long}]};
const browser=await chromium.launch({channel:'chrome'});
try {
 const page=await browser.newPage();
 await page.context().addCookies([{name:'mk_admin',value:encodeURIComponent(token),url:origin}]);
 await page.route('**/api/admin/**',r=>{
  assert.equal(r.request().method(),'GET');
  const path=new URL(r.request().url()).pathname;
  return r.fulfill({json:path.endsWith('/traffic')?report:path.endsWith('/content')?{items:[]}:overview});
 });
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:1000});
  await page.goto(origin+'/admin');
  await page.locator('.metric-card strong').first().waitFor();
  assert.equal(await page.locator('.metric-card strong').first().innerText(),'17');
  await page.getByRole('button',{name:'방문 분석',exact:true}).click();
  await page.locator('.traffic-table').first().waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'viewport overflow at '+width);
  assert.ok(await page.locator('.traffic-table').evaluateAll(tables=>tables.every(t=>t.getBoundingClientRect().right<=t.closest('.studio-panel').getBoundingClientRect().right)),'table outside card at '+width);
 }
 console.log('PASS connected overview count and long URL layout at desktop/mobile widths');
} finally {await browser.close();}
