import {test} from 'node:test';
import assert from 'node:assert/strict';
import {calculateSaju,type BirthInput} from '../lib/saju';
import {generatePackage} from '../lib/content';
const birth=(date:string,time='12:00',region:'KR'|'TW'='TW',unknown=false):BirthInput=>({date,time,region,unknown,name:''});
test('matches an independently published upstream EightChar daytime fixture',()=>{
 // https://github.com/6tail/lunar-typescript/blob/master/src/test/EightCharTest.ts#L5
 const r=calculateSaju(birth('2005-12-23','08:37'));
 assert.deepEqual(r.pillars,['乙酉','戊子','辛巳','壬辰']);assert.equal(r.dayElement,3);assert.equal(r.total,8);
});
test('Korean and Taiwan clocks map to the same instant around Li Chun',()=>{
 const beforeKR=calculateSaju(birth('2024-02-04','17:00','KR'));
 const beforeTW=calculateSaju(birth('2024-02-04','16:00','TW'));
 const afterKR=calculateSaju(birth('2024-02-04','18:00','KR'));
 assert.equal(beforeKR.pillars[0],'癸卯');assert.equal(afterKR.pillars[0],'甲辰');
 assert.deepEqual(beforeKR.pillars.slice(0,2),beforeTW.pillars.slice(0,2));
});
test('unknown time excludes hour and uncertain solar-term pillars',()=>{
 const ordinary=calculateSaju(birth('2005-12-23','12:00','TW',true));
 assert.equal(ordinary.total,6);assert.equal(ordinary.pillars[3],null);
 const boundary=calculateSaju(birth('2024-02-04','12:00','TW',true));
 assert.equal(boundary.termUncertain,true);assert.equal(boundary.pillars[0],null);assert.equal(boundary.pillars[1],null);assert.equal(boundary.total,2);
});
test('midnight day rollover has a consistent late-zi hour stem',()=>{
 const late=calculateSaju(birth('1988-02-15','23:30'));
 const next=calculateSaju(birth('1988-02-16','00:30'));
 assert.equal(late.pillars[2],'庚子');assert.equal(late.pillars[3],'丙子');assert.equal(next.pillars[2],'辛丑');assert.equal(next.pillars[3],'戊子');
});
test('historical Korean summer time is removed before standard-time pillars',()=>{
 const r=calculateSaju(birth('1988-06-01','12:00','KR'));assert.equal(r.standardTime,'1988-06-01 11:00');
 assert.throws(()=>calculateSaju(birth('1988-05-08','02:30','KR')),/DST_AMBIGUOUS/);
 assert.throws(()=>calculateSaju(birth('1988-10-09','02:30','KR')),/DST_AMBIGUOUS/);
});
test('invalid dates, future births and invalid clock input are rejected',()=>{
 for(const input of [birth('2023-02-29'),birth('1969-12-31'),birth('2090-01-01'),birth('2000-01-01','24:00')])assert.throws(()=>calculateSaju(input));
 assert.equal(calculateSaju(birth('2000-02-29')).total,8);
});
test('content package includes usable captions, tracked links and five bounded cards in each locale',()=>{
 for(const locale of ['ko','zh-TW'] as const){const p=generatePackage('five-elements',locale);assert.equal(p.length,3);assert.equal(p.find(i=>i.channel==='instagram')!.slides.length,5);assert.ok(p.every(i=>i.status==='draft'));assert.match(p.find(i=>i.channel==='threads')!.body,/utm_source=threads/);assert.ok(p.find(i=>i.channel==='threads')!.body.length<=500);assert.ok(p.find(i=>i.channel==='seo')!.body.includes('## '));assert.ok(p.find(i=>i.channel==='instagram')!.slides.every(s=>s.body.length<600));}
});
