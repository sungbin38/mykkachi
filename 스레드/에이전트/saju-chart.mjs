#!/usr/bin/env node
// 댓글 사주풀이용 명식 계산기. 해석은 하지 않고 근거 데이터만 JSON으로 낸다.
// node 스레드/에이전트/saju-chart.mjs --date=1980-02-17 --calendar=solar|lunar [--leap] [--time=20:30] --gender=M|F
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Lunar, Solar } from 'lunar-typescript';

const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';
const STEM_KO = '갑을병정무기경신임계';
const BRANCH_KO = '자축인묘진사오미신유술해';
const ELEMENT_KO = ['목', '화', '토', '금', '수'];
const STEM_EL = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
const BRANCH_EL = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
// 지지 본기(정기) 천간
const BRANCH_MAIN = '癸己甲乙戊丙丁己庚辛戊壬';
const CLASH = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];
const COMBINE = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];

const ko = gz => gz ? STEM_KO[STEMS.indexOf(gz[0])] + BRANCH_KO[BRANCHES.indexOf(gz[1])] : null;
function tenGod(day, stem) {
  const d = STEMS.indexOf(day), s = STEMS.indexOf(stem);
  const rel = (STEM_EL[s] - STEM_EL[d] + 5) % 5;
  const same = d % 2 === s % 2;
  return [['비견', '겁재'], ['식신', '상관'], ['편재', '정재'], ['편관', '정관'], ['편인', '정인']][rel][same ? 0 : 1];
}
const pair = (list, a, b) => list.some(([x, y]) => (x === a && y === b) || (x === b && y === a));

function parse(args) {
  const o = Object.fromEntries(args.map(a => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(o.date || '')) throw new Error('--date=YYYY-MM-DD 필요');
  if (!['solar', 'lunar'].includes(o.calendar)) throw new Error('--calendar=solar|lunar 필요');
  if (!['M', 'F'].includes(o.gender)) throw new Error('--gender=M|F 필요');
  if (o.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(o.time)) throw new Error('--time=HH:MM (24시간)');
  return o;
}

// 한국 표준시 벽시계 → UTC 순간 (1987~88 서머타임 포함)
function kstToInstant(y, m, d, h, mi) {
  const wall = Date.UTC(y, m - 1, d, h, mi);
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  for (const off of [9, 10, 8.5]) {
    const t = new Date(wall - off * 3600000);
    const p = Object.fromEntries(fmt.formatToParts(t).map(x => [x.type, x.value]));
    if (+p.year === y && +p.month === m && +p.day === d && +p.hour === h && +p.minute === mi) return t;
  }
  return new Date(wall - 9 * 3600000);
}
const eightAt = t => Solar.fromYmdHms(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate(), t.getUTCHours(), t.getUTCMinutes(), 0).getLunar().getEightChar();

export function chart(o) {
  let [y, m, d] = o.date.split('-').map(Number);
  if (o.calendar === 'lunar') {
    const s = Lunar.fromYmd(y, o.leap ? -m : m, d).getSolar();
    [y, m, d] = [s.getYear(), s.getMonth(), s.getDay()];
  }
  const known = Boolean(o.time);
  const [h, mi] = (o.time || '12:00').split(':').map(Number);
  const instant = kstToInstant(y, m, d, h, mi);
  const terms = eightAt(new Date(instant.getTime() + 8 * 3600000)); // 절기는 순간 기준
  const kst = new Date(instant.getTime() + 9 * 3600000);
  const local = eightAt(kst); local.setSect(2);
  const day = local.getDay();
  const hb = Math.floor((kst.getUTCHours() + 1) / 2) % 12;
  const time = known ? STEMS[((STEMS.indexOf(day[0]) % 5) * 2 + hb) % 10] + BRANCHES[hb] : null;
  const pillars = { year: terms.getYear(), month: terms.getMonth(), day, time };
  const dm = day[0];
  const counts = [0, 0, 0, 0, 0];
  const detail = {};
  for (const [k, gz] of Object.entries(pillars)) {
    if (!gz) { detail[k] = null; continue; }
    counts[STEM_EL[STEMS.indexOf(gz[0])]]++; counts[BRANCH_EL[BRANCHES.indexOf(gz[1])]]++;
    detail[k] = { ganji: gz, ko: ko(gz), stem_god: k === 'day' ? '일간' : tenGod(dm, gz[0]), branch_god: tenGod(dm, BRANCH_MAIN[BRANCHES.indexOf(gz[1])]) };
  }
  const yun = terms.getYun(o.gender === 'M' ? 1 : 0);
  const daeun = yun.getDaYun().filter(x => x.getGanZhi()).slice(0, 9).map(x => ({ start_age: x.getStartAge(), start_year: x.getStartYear(), ganji: x.getGanZhi(), ko: ko(x.getGanZhi()), stem_god: tenGod(dm, x.getGanZhi()[0]), branch_god: tenGod(dm, BRANCH_MAIN[BRANCHES.indexOf(x.getGanZhi()[1])]) }));
  const now = new Date().getUTCFullYear();
  const natal = Object.values(pillars).filter(Boolean).map(gz => BRANCHES.indexOf(gz[1]));
  const seun = [now, now + 1, now + 2].map(yr => {
    const gz = Solar.fromYmd(yr, 6, 1).getLunar().getYearInGanZhiExact();
    const b = BRANCHES.indexOf(gz[1]);
    return { year: yr, ganji: gz, ko: ko(gz), stem_god: tenGod(dm, gz[0]), branch_god: tenGod(dm, BRANCH_MAIN[b]),
      clashes_natal: natal.filter(n => pair(CLASH, n, b)).map(n => BRANCH_KO[n]), combines_natal: natal.filter(n => pair(COMBINE, n, b)).map(n => BRANCH_KO[n]) };
  });
  return {
    input: { solar_date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`, time_known: known, gender: o.gender, calendar: o.calendar },
    day_master: { stem: dm, ko: STEM_KO[STEMS.indexOf(dm)], element: ELEMENT_KO[STEM_EL[STEMS.indexOf(dm)]] },
    pillars: detail,
    elements: Object.fromEntries(ELEMENT_KO.map((e, i) => [e, counts[i]])),
    daeun_start: { years: yun.getStartYear(), months: yun.getStartMonth() },
    daeun, seun,
    notes: known ? [] : ['시간 미상: 시주 제외, 해석 범위 제한'],
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(chart(parse(process.argv.slice(2))), null, 2)); }
  catch (e) { console.error(e.message); process.exitCode = 1; }
}
