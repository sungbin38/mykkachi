import { Solar } from "lunar-typescript";
import type { Locale } from "./brand";

export type BirthInput = {
  date: string;
  time: string;
  unknown: boolean;
  region: "KR" | "TW";
  name: string;
};
const STEMS = "甲乙丙丁戊己庚辛壬癸";
const BRANCHES = "子丑寅卯辰巳午未申酉戌亥";
const STEM_ELEMENTS = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
const BRANCH_ELEMENTS = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];
export const ELEMENTS = [
  {
    han: "木",
    ko: "목",
    zh: "木",
    color: "#769276",
    title: ["자신만의 방향으로 자라는 나무", "朝著自己的方向生長"],
    description: [
      "목은 자람과 확장의 상징입니다. 일간이 목인 명식은 새로운 것을 배우고 방향을 세우는 성향으로 읽습니다. 성장을 서두르기보다 이미 잘하고 있는 일도 함께 돌아보세요.",
      "木象徵生長與伸展。日主屬木，常以學習、規劃與成長來理解。探索新方向的同時，也別忘了看見已經累積的成果。",
    ],
    love: [
      "함께 성장하는 대화를 소중히 여기는 관점이에요. 해결책을 말하기 전, 상대가 지금 원하는 것이 공감인지 조언인지 물어보세요.",
      "用一起成長的角度理解關係。提出建議前，先問對方需要的是陪伴，還是解決方法。",
    ],
    work: [
      "새로운 기획을 작은 실행으로 옮겨보세요. 계획 하나를 완벽하게 만들기보다 이번 주 확인할 수 있는 단계로 나눠보는 것이 좋겠습니다.",
      "把新的想法化為小小的實驗。與其等待完美計畫，不如拆成這週就能完成的一步。",
    ],
    daily: [
      "오늘 새로 배우고 싶은 것 하나를 적어보세요. 성장을 숫자로만 재지 않아도 괜찮아요.",
      "寫下一件今天想學的事。成長不一定要用數字衡量。",
    ],
  },
  {
    han: "火",
    ko: "화",
    zh: "火",
    color: "#d88b6e",
    title: ["마음을 밝히는 따뜻한 불빛", "照亮彼此的一束光"],
    description: [
      "화는 표현과 온기의 상징입니다. 일간이 화인 명식은 감정을 나누고 분위기를 밝히는 성향으로 읽습니다. 바깥으로 향하는 에너지에 쉼을 더해보세요.",
      "火象徵表達與溫暖。日主屬火，常以交流、熱情與感染力來理解。照亮別人的同時，也留一點安靜給自己。",
    ],
    love: [
      "마음을 표현하는 속도가 상대와 다를 수 있어요. 반응을 재촉하기보다 서로 편안한 연락과 대화의 간격을 찾아보세요.",
      "表達心意的速度不一定相同。與其催促回應，不如一起找到舒服的聯絡節奏。",
    ],
    work: [
      "생각을 사람들에게 설명하거나 연결하는 일을 돌아보세요. 모든 모임에 에너지를 쓰기보다 중요한 대화에 집중해보세요.",
      "觀察自己在說明想法與串連夥伴時的感受。把心力留給真正重要的溝通。",
    ],
    daily: [
      "좋았던 순간 하나를 누군가에게 전해보세요. 그 뒤에는 알림을 잠시 끄고 나만의 시간도 가져요.",
      "把今天美好的一刻分享給一個人，然後關掉通知，留一點時間給自己。",
    ],
  },
  {
    han: "土",
    ko: "토",
    zh: "土",
    color: "#c4a574",
    title: ["흔들림 속에서도 중심을 지키는 땅", "在變動中，留住自己的重心"],
    description: [
      "토는 중심과 연결의 상징입니다. 일간이 토인 명식은 꾸준함과 안정감을 중시하는 성향으로 읽습니다. 다른 사람의 기대를 돌보는 만큼 내 마음도 확인해보세요.",
      "土象徵承接與穩定。日主屬土，常以耐心、信任與持續累積來理解。照顧別人期待的同時，也聽聽自己的需要。",
    ],
    love: [
      "안정감을 만드는 작은 약속이 마음의 언어가 될 수 있어요. 혼자 책임지려 하지 말고 원하는 도움을 구체적으로 말해보세요.",
      "日常的小約定能傳達安全感。不需要獨自扛下所有責任，試著說出希望得到的支持。",
    ],
    work: [
      "과정을 정리하고 꾸준히 쌓아온 능력을 떠올려보세요. 익숙한 방식을 지키면서도 작은 변화 하나는 실험해볼 수 있어요.",
      "看看自己在整理流程與長期累積上的能力。保留穩定的步調，也容許一點新的嘗試。",
    ],
    daily: [
      "오늘 나를 편안하게 해준 공간이나 습관을 기록해보세요. 해야 할 일 하나를 덜어내는 것도 선택이에요.",
      "記錄一個讓你安心的空間或習慣。少安排一件事，也是一種照顧自己。",
    ],
  },
  {
    han: "金",
    ko: "금",
    zh: "金",
    color: "#929ba1",
    title: ["소중한 것을 알아보는 단단한 기준", "清楚知道，什麼值得珍惜"],
    description: [
      "금은 구분과 정돈의 상징입니다. 일간이 금인 명식은 기준을 세우고 완성도를 높이는 성향으로 읽습니다. 분명한 기준에 유연함을 더하면 여유가 생길 수 있어요.",
      "金象徵分辨與整理。日主屬金，常以原則、清晰與完成度來理解。讓標準保留一點彈性，可能更自在。",
    ],
    love: [
      "솔직함에 온기를 더하는 연습을 해보세요. 판단을 먼저 전하기보다 상대가 그렇게 느낀 이유를 들어보는 것이 도움이 됩니다.",
      "在坦率中加入溫度。先聽聽對方為什麼有這樣的感受，再分享自己的想法。",
    ],
    work: [
      "복잡한 정보를 정리하거나 품질을 다듬는 경험을 떠올려보세요. 충분히 좋은 지점을 정해두면 완벽을 기다리는 시간을 줄일 수 있어요.",
      "回想自己整理資訊或打磨品質的經驗。設定「已經足夠好」的界線，能讓成果更快落地。",
    ],
    daily: [
      "책상 위에서 필요 없는 물건 하나를 정리해보세요. 오늘의 나에게도 너무 엄격하지 않은 기준을 선물해요.",
      "整理桌上一件不再需要的物品，也為今天的自己留下一個不太苛刻的標準。",
    ],
  },
  {
    han: "水",
    ko: "수",
    zh: "水",
    color: "#6b93a9",
    title: ["깊이 듣고 유연하게 흐르는 물", "靜靜聆聽，也自在流動"],
    description: [
      "수는 관찰과 흐름의 상징입니다. 일간이 수인 명식은 깊이 생각하고 상황에 적응하는 성향으로 읽습니다. 생각을 마음속에만 두지 말고 한 문장으로 꺼내보세요.",
      "水象徵觀察與流動。日主屬水，常以思考、感受與適應力來理解。試著把心裡的想法化成一句話。",
    ],
    love: [
      "말하지 않아도 알아주길 바라기보다 마음을 조금씩 나눠보세요. 조용히 함께하는 시간과 솔직한 대화는 함께할 수 있어요.",
      "不必等對方猜中你的心意。安靜的陪伴與坦誠的對話，可以同時存在。",
    ],
    work: [
      "리서치하고 맥락을 읽는 과정에서 강점을 발견할 수 있어요. 충분히 살펴봤다면 작은 결정에 마감 시간을 정해보세요.",
      "在研究與理解脈絡的過程中觀察自己的優勢。蒐集足夠資訊後，為小決定設下一個期限。",
    ],
    daily: [
      "머릿속에 머무는 생각 세 가지를 종이에 내려놓아 보세요. 모든 생각에 당장 답을 내리지 않아도 괜찮아요.",
      "把腦中的三個想法寫在紙上，不需要馬上為每個問題找到答案。",
    ],
  },
];
export const KOREAN_CHAR: Record<string, string> = Object.fromEntries(
  [..."甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥"].map((c, i) => [
    c,
    [
      "갑",
      "을",
      "병",
      "정",
      "무",
      "기",
      "경",
      "신",
      "임",
      "계",
      "자",
      "축",
      "인",
      "묘",
      "진",
      "사",
      "오",
      "미",
      "신",
      "유",
      "술",
      "해",
    ][i],
  ]),
);
export type SajuResult = {
  pillars: (string | null)[];
  dayElement: number;
  counts: number[];
  total: number;
  termUncertain: boolean;
  standardTime: string;
  unknown: boolean;
};
function parts(date: Date, zone: string) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((x) => [x.type, x.value]),
  );
}
function wallToUTC(
  y: number,
  m: number,
  d: number,
  h: number,
  min: number,
  region: "KR" | "TW",
) {
  const base = region === "KR" ? 9 : 8;
  const wall = Date.UTC(y, m - 1, d, h, min);
  const valid = [base, base + 1]
    .map((offset) => new Date(wall - offset * 3600000))
    .filter((date) => {
      const p = parts(date, region === "KR" ? "Asia/Seoul" : "Asia/Taipei");
      return (
        +p.year === y &&
        +p.month === m &&
        +p.day === d &&
        +p.hour === h &&
        +p.minute === min
      );
    });
  if (valid.length !== 1) throw new Error("DST_AMBIGUOUS");
  return valid[0];
}
function solarAt(date: Date) {
  return Solar.fromYmdHms(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    0,
  )
    .getLunar()
    .getEightChar();
}
export function calculateSaju(input: BirthInput): SajuResult {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new Error("INVALID_DATE");
  const [y, m, d] = input.date.split("-").map(Number);
  const check = new Date(Date.UTC(y, m - 1, d));
  if (
    y < 1970 ||
    check.getUTCFullYear() !== y ||
    check.getUTCMonth() + 1 !== m ||
    check.getUTCDate() !== d ||
    input.date > new Date().toISOString().slice(0, 10)
  )
    throw new Error("INVALID_DATE");
  if (!["KR", "TW"].includes(input.region)) throw new Error("INVALID_REGION");
  if (!input.unknown && !/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time))
    throw new Error("INVALID_TIME");
  const [h, min] = (input.unknown ? "12:00" : input.time)
    .split(":")
    .map(Number);
  const instant = wallToUTC(y, m, d, h, min, input.region);
  const base = input.region === "KR" ? 9 : 8;
  const standard = new Date(instant.getTime() + base * 3600000);
  const terms = solarAt(new Date(instant.getTime() + 8 * 3600000));
  const local = solarAt(standard);
  local.setSect(2);
  const day = local.getDay();
  const dayIndex = STEMS.indexOf(day[0]);
  const hourBranch = Math.floor((standard.getUTCHours() + 1) / 2) % 12;
  // With midnight day rollover, late-zi (23:00) uses the current day's stem.
  const time =
    STEMS[((dayIndex % 5) * 2 + hourBranch) % 10] + BRANCHES[hourBranch];
  const pillars: (string | null)[] = [
    terms.getYear(),
    terms.getMonth(),
    day,
    input.unknown ? null : time,
  ];
  if (input.unknown) {
    const edges = [0, 23].map((hour) => {
      const utc = wallToUTC(y, m, d, hour, hour === 23 ? 59 : 0, input.region);
      return solarAt(new Date(utc.getTime() + 8 * 3600000));
    });
    if (edges[0].getYear() !== edges[1].getYear()) pillars[0] = null;
    if (edges[0].getMonth() !== edges[1].getMonth()) pillars[1] = null;
  }
  const counts = [0, 0, 0, 0, 0];
  for (const pillar of pillars) {
    if (!pillar) continue;
    counts[STEM_ELEMENTS[STEMS.indexOf(pillar[0])]]++;
    counts[BRANCH_ELEMENTS[BRANCHES.indexOf(pillar[1])]]++;
  }
  return {
    pillars,
    dayElement: STEM_ELEMENTS[dayIndex],
    counts,
    total: counts.reduce((a, b) => a + b, 0),
    termUncertain: pillars[0] === null || pillars[1] === null,
    standardTime: standard.toISOString().slice(0, 16).replace("T", " "),
    unknown: input.unknown,
  };
}
export function readingText(
  result: SajuResult,
  locale: Locale,
  focus = "self",
) {
  const e = ELEMENTS[result.dayElement],
    i = locale === "ko" ? 0 : 1;
  const blocks = [
    {
      key: "self",
      title: i ? "我的五行" : "나의 기질",
      text: e.description[i],
    },
    { key: "love", title: i ? "關係中的我" : "관계 속의 나", text: e.love[i] },
    { key: "work", title: i ? "工作的方式" : "나답게 일하기", text: e.work[i] },
    {
      key: "daily",
      title: i ? "今天的小練習" : "오늘의 작은 실천",
      text: e.daily[i],
    },
  ];
  return blocks.sort(
    (a, b) => Number(b.key === focus) - Number(a.key === focus),
  );
}
