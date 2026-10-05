# 마이까치 MY KKACHI

**내 이야기를 듣고, 내일을 함께 살피다.** 개인 사주 상담 브랜드. 카카오톡 1:1 대화와 계좌이체 상담 안내, 무료 사주·오행 풀이, 한국어·번체 중국어 저널, 콘텐츠 운영 스튜디오.

## 바로가기

- 한국어 `/` · 번체 중국어 `/zh-TW`
- 브랜드 이야기 `/#story` · 상담 안내 `/#consultation`
- 무료 사주 `/read` · `/zh-TW/read`
- 까치의 편지 `/journal` · `/zh-TW/journal`
- 운영 스튜디오 `/admin` — 브랜드 패널에서 소개 문구 복사와 로고·일러스트 다운로드

배포 공개 범위는 기존 소유자 전용으로 유지합니다. 공개 검색 유입은 사이트 공개와 검색엔진 등록 이후 가능합니다. 현재 사이트 주소는 기존 주소를 유지하며, `lib/brand.ts`의 `ORIGIN`을 canonical·sitemap·공유 링크에서 사용합니다.

## 브랜드 기준

- 이름: **마이까치**, 띄어쓰기 없이 통일. 영문 **MY KKACHI**.
- 의미: My는 나를 위한 상담, Kkachi는 한국의 까치. 좋은 소식을 기다리는 마음 곁에서 이야기를 듣는 작은 새.
- 중심 문구: **내 이야기를 듣고, 내일을 함께 살피다.**
- 보조 문구: **내 곁의 작은 까치, 마이까치.** / **돌아가는 마음에, 작은 여유가 남기를.**
- 영문: **A little bird, by your side.**
- 번체: **聽你說故事，陪你看明天。**
- 색: 크림 `#F8F5ED`, 먹색 `#243B3B`, 청록 `#517C73`, 살구 `#D9936E`.
- 글꼴: 본문 Pretendard, 제목 고운바탕, 영문 DM Sans, 번체 Noto Sans TC.
- 어조: 천천히 듣고 쉬운 일상어로 설명하기. 상담자의 이력·상담 건수·후기·결과 보장 문구를 지어내지 않기.

### 브랜드 이야기

한국에서 까치는 반가운 소식을 알리는 새로 여겨져 왔습니다. [문화적 배경: 한국민족문화대백과](https://encykorea.aks.ac.kr/Article/E0011213).

마이까치의 작은 까치는 누군가 잠들지 못하는 밤이면 창가에 내려앉아요. 재촉하지 않고, 말을 끊지 않고, 마음속에 접어둔 이야기가 한 문장씩 펼쳐지기를 기다립니다. 우리의 상담도 그렇게 시작해요. 사주를 실마리 삼아 지금의 마음을 듣고, 내일의 선택을 함께 살피는 일. 그 시간이 당신에게 작은 쉼이 되었으면 합니다.

작은 까치의 행동과 서사는 **브랜드 창작**입니다. 실제 전래 설화나 고객 상담 사례로 소개하지 않습니다.

### 상담 연결

카카오톡 URL은 아직 제공되지 않아 `lib/brand.ts`의 `KAKAO_URL`을 빈 값으로 둡니다. 빈 값이면 상담은 '오픈 준비 중'이며 예약·입금을 받지 않는다고 표시합니다. 소유자가 확인한 채널 또는 오픈채팅 링크를 넣으면 실제 상담 문의 링크가 나타납니다.

계좌번호·금액·상담 일정은 임의로 만들지 않았습니다. 상담 오픈 전 카카오톡에서 비용·범위·시간·취소 및 환불·개인정보 이용 안내를 확인할 수 있도록 준비해야 합니다. 사이트 내 결제나 예약 확정, 자동 입금 확인 기능은 없습니다.

### 채널 표기

추천 핸들: `@mykkachi`, 번체 채널 `@mykkachi.tw`. 계정 확보 여부는 확인하지 않았으며 사이트에서 미확인 소셜 계정으로 연결하지 않습니다.

> 내 곁의 작은 까치, 마이까치
>
> 내 이야기를 듣고, 내일을 함께 살피다.
>
> 1:1 카카오톡 사주 상담 · 무료 오행 풀이 ↓

## 실제 구현 범위

- 양력 생일과 출생 시간을 이용한 연·월·일·시 명식 계산. 한국/대만 시간대, 역사적 서머타임, 절입일의 미확정 기둥 처리.
- 일간과 오행 단순 분포를 구분. 자기 이해·관계·일·일상별 편집 해석, 1080×1350 결과 카드 다운로드.
- 사주 입력은 브라우저 내부에서만 계산. 홈페이지에서 입력한 생일은 세션 저장소로 다음 화면에 잠시 전달한 뒤 제거합니다. 생일을 URL이나 서버에 보내지 않습니다.
- 한국어 6편, 번체 중국어 6편의 서버 렌더링 저널. canonical, 언어 대체 링크, Article JSON-LD, sitemap, robots.
- 주제별 SEO 원고·Threads 글·Instagram 5장 카드뉴스 생성. 콘텐츠는 D1에 저장되고 새로고침 뒤에도 유지됩니다.
- 원고/캡션/카드 문구 편집, 미리보기, 검토 완료, SEO 즉시 발행·예약. 발행 스냅샷을 따로 보관해 초안 편집 중에도 기존 공개 원고가 유지됩니다.
- 실제 PNG 5장과 캡션 TXT를 ZIP으로 다운로드. Threads 문구 복사, UTM 링크.
- 일정 캘린더, 익명 이벤트 집계, 주제별 중복 방지, 일 단위 자동화 실행 중복 방지, 실행 기록.
- 서버에서 관리자 권한 검사, 변경 요청 Origin 검사, 동시 수정 충돌 감지, 검토 전 발행 차단.

## 아직 연결하지 않은 것

현재 버전은 **유료 판매 전 MVP**입니다. 아래 기능을 실제로 연결한 것처럼 표시하지 않습니다.

- Instagram/Threads OAuth 및 실제 게시 API. 현재는 초안 생성·검토·내보내기를 지원합니다. 계정과 Meta 앱 권한 연결이 필요합니다.
- 백그라운드 실행 스케줄러. 규칙 저장·수동 실행·인증된 실행 API는 구현했으며, 실행기 연결 전에는 예약이 자동으로 처리되지 않습니다.
- 카카오톡 상담 연결 및 실제 예약·계좌 안내, 결제와 유료 상세 리포트, 음력 입력, 대운·용신·십성.
- 생성형 AI의 개인별 장문 해석. 현재 해석은 실제 명식의 일간 오행에 연결한 편집 원고이며, 콘텐츠 제작도 6개 주제의 편집 템플릿입니다.
- Google Search Console, 네이버 서치어드바이저, 실제 SNS 성과 조회.
- 대만 현지 편집자 감수 및 유료화에 필요한 현지 결제·정책.

## 계산 기준

지원 범위: 1970년 이후부터 현재까지의 양력, 한국 또는 대만 출생. `lunar-typescript@1.8.6`을 사용합니다.

출생지 IANA 시간대를 사용해 기록 시각을 UTC로 변환합니다. 연·월주는 UTC+8 기준의 라이브러리 절기 시각과 비교하고, 일·시주는 출생지 표준시를 사용합니다. 일주는 자정에 바뀌며 23시 자시는 당일의 일간으로 시주를 계산합니다. 경도·진태양시 보정은 하지 않습니다. 중복되거나 존재하지 않는 서머타임 전환 시각은 임의 선택하지 않고 확인을 요청합니다.

출생 시간이 없으면 시주를 제외합니다. 절입일처럼 시간에 따라 연·월주가 달라지는 경우 그 기둥도 제외합니다. 오행 비율은 확인된 각 글자의 대표 오행을 같은 비중으로 집계하며, 지장간·계절 가중치·합충·강약 판정은 포함하지 않습니다.

해석은 문화적 경험과 자기 성찰을 위한 내용이며 예측 정확도나 결과를 보장하지 않습니다.

## 개발

Node 22.13 이상, npm. Vinext/React + Cloudflare Workers + D1/Drizzle.

```sh
npm ci
npm run build
# 신규 로컬 DB에만 각 파일을 순서대로 한 번 적용
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_clumsy_fallen_one.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_volatile_madame_masque.sql
npm run dev
```

기본 로컬 주소는 `http://127.0.0.1:5173`입니다. 로컬 `/signin-with-chatgpt?return_to=/admin`은 개발용 `seedy@sites.test` 계정을 사용합니다. 이 개발용 허용은 production에서 비활성화됩니다.

실제 관리자 이메일은 배포 환경의 `ADMIN_EMAILS`로 제한합니다. 작업 공간의 계정 주소를 기준으로 `admin@example.com`을 설정했습니다. ChatGPT 로그인 주소가 다르면 해당 값을 수정해야 합니다. 비밀 키는 `.env` 또는 배포 환경의 secret에만 두고 저장소에는 커밋하지 않습니다.

`.env.example`에 환경 키가 있습니다. 이미 적용한 `drizzle/` 마이그레이션은 수정하지 않고 `npm run db:generate`로 새 마이그레이션을 추가합니다. 배포 시 Sites가 D1을 연결하고 마이그레이션을 적용합니다.

## 자동화 연결

1. 관리자에서 생성 언어·일일 기준 시각·SEO 예약 발행 여부를 설정합니다. 시각은 Asia/Seoul입니다.
2. 배포 환경에 충분히 긴 임의의 `AUTOMATION_KEY`를 비밀 값으로 설정합니다.
3. 스케줄러가 15분 간격으로 `POST /api/automation/run`을 호출하도록 연결합니다. `X-Luun-Job-Key` 헤더로 동일한 비밀 값을 전달합니다.
4. 생성할 주제가 남아 있으면 하루 한 번 3개 채널 초안을 생성합니다. 주제가 모두 준비된 경우 중복 콘텐츠를 만들지 않습니다.
5. SEO 발행은 검토 후 예약한 원고만 처리합니다. Instagram/Threads를 자동 게시하지 않습니다.

실행 키의 존재만으로 실제 스케줄러가 동작한다고 판단하지 않습니다. 실행 기록을 확인해야 합니다. 현재 배포에는 실행기를 연결하지 않았으며 기본 규칙은 꺼져 있습니다.

## 검증

```sh
npm run typecheck
npm test
# 개발 서버와 로컬 DB가 준비된 상태, Google Chrome 설치 필요
npm run test:e2e
```

계산 검증은 라이브러리 공식 테스트의 알려진 명식, 입춘 경계의 한·대만 시간차, 한국의 과거 서머타임, 시간 미상, 자정 경계, 잘못된 날짜를 포함합니다.

브라우저 검증은 입력 정보의 네트워크 비전송, 한국어/번체 계산, 실제 PNG/ZIP 크기, 관리자 인증, DB 저장, 중복 방지, 원고 승인/발행, 발행본 보존, 충돌 처리, 모바일 가로 넘침, SSR 메타데이터를 포함합니다. 결과 파일은 Git에서 제외된 `outputs/qa/`에 있습니다.

WebMCP `calculate_luun_reading`을 지원 여부 탐지 후 등록합니다. 현재 Chrome에는 네이티브 WebMCP 실행 환경이 없어 해당 브라우저 통합은 검증하지 않았습니다. 일반 웹 UI에는 영향이 없습니다.

## 리서치 메모 — 2026-10-05

공개 근거로 현재 매출 1위를 확정하지 않았습니다. 시장 규모와 대표 서비스의 제품 흐름을 분리해서 조사했습니다.

| 서비스 | 확인한 특징 | 마이까치의 선택 |
| --- | --- | --- |
| [하얀옥](https://www.hayaknock.com/) | 빠른 생년월일 진입, 사주·타로·궁합, 저가 리딩 메시지 | 회원가입 없는 첫 경험, 간결한 진입 |
| [운명도감](https://destinybook.co.kr/) | 커리어·관계 등 생활 문제별 리포트 | 자기 이해·관계·일의 맥락별 해석 |
| [점신](https://www.jeomsin.co.kr/) | 대중적인 무료 운세 진입 | 무료 명식·오행을 유입의 중심으로 |
| [포스텔러](https://forceteller.com/) | 시즌·관계·다양한 주제의 콘텐츠 | SEO 저널과 채널별 재가공 |
| [科技紫微網](https://m.click108.com.tw/fortune/index.php) | 八字·合盤·事業 등 현지 용어와 세부 주제 | 번체 중국어, 대만 시간대, 八字·五行 표현 |

[2025-02-03 보도](https://news.nate.com/view/20250203n02153)가 인용한 MobileIndex의 **2024년 12월** MAU는 점신 967,363명, 포스텔러 628,208명입니다. 과거 한국 모바일 집계이며 2026년 현재 순위·매출·전 세계 이용자를 뜻하지 않습니다. 하얀옥과 운명도감은 동적 화면이어서 웹 문서와 서버 HTML의 공개 메타·설명을 함께 확인했습니다.

마이까치는 무료 리딩과 저널로 자신을 살펴본 방문자가 개인 상담을 알아볼 수 있게 구성합니다. 경쟁사 카피·이미지·후기는 복제하지 않았습니다.

## 이미지 자산

- `public/brand/mykkachi-mark.svg`: 코드로 제작한 편집 가능한 까치 심볼.
- `public/brand/mykkachi-logo.svg`: 심볼과 한글·영문 워드마크. SVG 텍스트는 지정 글꼴이 설치되어 있어야 동일하게 표시됩니다.
- `public/favicon.svg`: 크림색 바탕의 까치 심볼.
- `public/images/mykkachi-magpie.webp`: built-in `image_gen__imagegen`으로 한 번 생성하고 확인한 메인 일러스트. 원본 1254×1254를 크기 변경 없이 WebP로 인코딩했습니다.
- 사주 결과 및 Instagram 카드는 편집 가능한 canvas 타이포그래피로 만듭니다.

### 일러스트 생성 프롬프트

Use case: illustration-story
Asset type: one original 1024x1024 square raster illustration for the right-hand homepage hero of Korean personal fortune consultation brand 마이까치 / MY KKACHI.
Primary request: A friendly Korean magpie perched on an organic persimmon twig beside a small blank cream envelope tied with a thin muted apricot ribbon. The magpie has a black head, cream-white belly, deep ink and blue-green wings, and a distinctive elegant long tail. A soft muted sun circle sits behind the bird. The brand idea is a little bird listening to your story and keeping you company as you face tomorrow.
Scene/backdrop: Warm ivory paper with soft light-cream paper edges and lots of quiet breathing room.
Style/medium: Original modern Korean minhwa-inspired editorial gouache illustration, sophisticated adult warmth, delicate irregular painted shapes, subtle rice-paper texture.
Composition/framing: Square composition; the main magpie and its full distinctive tail stay centered within the middle 60% for safe homepage cropping. Keep the envelope small and blank, the twig organic, the scene uncluttered, and all main elements comfortably inside the frame.
Lighting/mood: Serene, reassuring, thoughtful warmth.
Color palette: Warm ivory #F8F5ED, ink #243B3B, subdued teal #517C73, apricot #D9936E, sage #CCD3BE.
Constraints: Generate exactly one finished illustration. No humans, no letters or words anywhere, no watermark, no photorealism, no toy or 3D appearance, no zodiac collage.
