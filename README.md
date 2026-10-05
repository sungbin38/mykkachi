# 마이까치 MY KKACHI

**내 이야기를 듣고, 내일을 함께 살피다.**

개인 사주 상담 브랜드의 한국어·번체 중국어 사이트입니다. "AI가 아닌 사람이 직접 읽는" 1:1 상담을 중심으로, 상담 예약(계좌이체 입금 확인), 방문 추적, 무료 사주와 오행 풀이, 저널을 제공합니다.

## 배포 구조

- 저장소: https://github.com/sungbin38/mykkachi
- 고객용 사이트: Next.js, Vercel 프로젝트 `mykkachi` (`sungbin3833@gmail.com` 개인 계정)
- 공개 주소: https://mykkachi.vercel.app
- 상담 예약: https://mykkachi.vercel.app/book
- 관리자: https://mykkachi.vercel.app/admin — 관리자 비밀번호로 로그인합니다. 사이트 메뉴에는 노출하지 않습니다.
- 데이터베이스: Neon PostgreSQL **Free** 요금제, `mykkachi-db` (개인 Vercel 팀 소유).
- DB 관리 화면: https://vercel.com/d/dashboard/integrations/neon/icfg_zuO0VD8MxWpFAiWguP6hsFnI/resources/store_eyd7BfF6w8ny1l8Q
- `studio/`에는 이전 Sites 소스만 보관하며 현재 빌드·업로드 대상에서 제외합니다.

## 데이터베이스

운영 DB 호스트: `ep-shiny-rain-b8xp5u84-pooler.c-14.us-east-1.aws.neon.tech`, DB명: `neondb`.
Vercel 함수와 같은 미국 동부 리전을 사용합니다. [Neon 요금제](https://neon.com/pricing)의 무료 한도 내에서 사용하며 유료 요금제는 활성화하지 않았습니다.

실제 접속 URL·사용자·비밀번호는 저장소 루트의 **`.env`와 `.env.local`**에만 저장합니다. 두 파일은 Git 및 Vercel 소스 업로드에서 제외하고 파일 권한을 `600`으로 설정했습니다. `.env.example`은 비밀 값 없는 양식입니다. Vercel 운영 환경에는 Neon 연동이 `DATABASE_URL` 등을 관리하고 관리자 인증 변수는 별도로 등록합니다. `NEXT_PUBLIC_` 접두사로 DB 정보를 설정하지 마세요.

- `DATABASE_URL`: 연결 풀을 사용하는 서버용 접속 URL
- `DATABASE_URL_UNPOOLED`: 직접 연결 URL
- `PGHOST`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`: 개별 접속 정보
- `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`: 비밀번호 검증과 관리자 세션 서명
- `NEXT_PUBLIC_BANK_NAME`, `NEXT_PUBLIC_BANK_ACCOUNT`, `NEXT_PUBLIC_BANK_HOLDER`: 예약 후 고객에게 보여주는 입금 계좌. 계좌번호가 비어 있으면 "확인 메일로 안내"로 표시합니다.
- `RESEND_API_KEY`, `NOTIFY_EMAIL`, `FROM_EMAIL`: 선택. 새 예약 알림 메일(사장님)과 접수 메일(고객). 없으면 스튜디오에서만 확인합니다.

```sh
npm run db:migrate  # 테이블 생성, 없는 기본 저널만 추가; 기존 수정 내용 유지
npm run test:db     # 실제 DB의 바인딩·트랜잭션 롤백 확인
# 로컬 서버 실행 후
npm run test:admin  # 관리자 권한, 저장, 검토/발행, 초안 격리 확인
```

`db/001_initial.sql`에 콘텐츠·운영 설정·실행 이력·로그인 시도 제한 테이블을, `db/002_bookings_tracking.sql`에 예약 슬롯·예약·방문자·세션·이벤트 테이블을, `db/003_pricing.sql`에 마케팅 동의 컬럼과 기본 금액을 정의합니다. `npm run db:migrate`는 `db/*.sql`을 이름순으로 모두 적용합니다. 기존 한국어·번체 저널 12개를 이관했습니다. 관리자가 검토 완료한 글을 발행하면 재배포 없이 공개 저널에 반영됩니다. 발행 후 초안을 수정해도 마지막 발행본만 공개됩니다. 동시 수정은 충돌로 안내합니다.

사주 입력(생년월일·출생시간·닉네임)은 계속 브라우저에서만 계산하며 DB에 수집하지 않습니다. 방문 집계·SNS 직접 게시·정기 실행기는 아직 연결하지 않았습니다. 자동화 규칙 저장과 수동 실행은 지원합니다. 로그인 시도는 원본 IP 대신 키를 사용해 15분 동안 제한하며, 관리자 API는 세션 인증과 동일 출처 확인을 적용합니다.

기존 관리자 비밀번호 해시를 사용합니다. `scripts/admin-password.mjs`로 새 해시를 만들 수 있습니다. 비밀번호 변경 시 로컬 파일과 Vercel의 `ADMIN_PASSWORD_HASH`를 함께 갱신하고, 기존 세션을 끊으려면 `ADMIN_SESSION_SECRET`도 새 무작위 값으로 변경한 뒤 재배포하세요.

## 개발 및 확인

Node.js 22, npm.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build
npm start
# 다른 터미널에서 실행 중인 사이트를 확인
npm run test:e2e
```

기본 개발 주소는 `http://localhost:3000`입니다. 환경 변수는 `.env.example`을 참고하세요. 도메인을 바꾸면 `NEXT_PUBLIC_SITE_URL`을 설정한 뒤 다시 배포해야 canonical·sitemap·공유 링크에 반영됩니다.

Vercel은 저장소 루트에서 `npm ci`와 `npm run build`를 실행합니다. GitHub 연동이 완료되면 `main` 변경으로 자동 배포합니다. 비밀 값과 `.env.local`, `.vercel/`, 생성 결과는 커밋하지 않습니다.

## 상담 예약과 입금

1. `/book`에서 상담자가 열어 둔 1시간 단위 시간을 고르고, 이름·이메일·연락처(선택)·생년월일(년/월/일 선택, 양력/음력)·태어난 시간(시 단위, 모름 가능)·성별(선택)·사연(선택, 예시 제공)·입금자명을 남깁니다.
2. 요청 즉시 슬롯이 잠기고 예약은 `requested`(입금 대기) 상태가 됩니다. 비용은 **20만원**, 폼에서 마케팅 활용(소식·이벤트 안내, 이름 없는 후기·콘텐츠 활용)에 동의하면 **15만원**입니다(`marketing_consent`, `amount`에 기록). 상담은 회당 **최대 1시간**이며 더 일찍 끝날 수 있습니다. 입금 계좌는 하나은행(`NEXT_PUBLIC_BANK_*`). 예약 직후 바로 입금해야 하며 30분(`HOLD_MINUTES`) 안에 입금 확인이 없으면 `expired`로 바뀌고 슬롯이 다시 열립니다. 만료 처리는 슬롯 조회·예약 목록 조회 때 자동으로 실행됩니다.
3. 스튜디오 **상담 예약** 탭에서 시간을 열고 닫고, 새 요청(NEW)을 확인하고, "입금 확인 · 확정"을 누르면 `confirmed`와 `paid_at`이 기록됩니다. 상담 완료·취소·메모·리포트 발송 표시도 여기서 합니다.
4. 상담 뒤 사주 리포트(PDF)는 상담자가 이메일로 직접 보냅니다. 사이트 내 자동 결제·자동 입금 확인·리포트 자동 생성은 없습니다.

## 방문 추적

`components/tracking.tsx`가 모든 공개 페이지에서 방문자 ID(localStorage)와 세션 ID(sessionStorage, 30분)를 만들고 `/api/track`으로 보냅니다. 기록하는 것: 세션 시작(첫 페이지, 리퍼러, UTM 5종, 언어, 화면 크기), 페이지 보기, 예약 버튼 클릭, 시간 선택, 예약 제출, 예약 완료. 서버는 User-Agent로 기기 종류를, Vercel 헤더로 국가·도시를 저장합니다. **IP 주소는 저장하지 않습니다.** 관리자 페이지는 추적하지 않습니다.

예약이 생기면 그 세션의 유입 정보가 예약에 스냅샷으로 붙고, 스튜디오 예약 상세에서 "이 사람은 어떻게 들어왔나"(유입·첫 페이지·기기·지역·몇 번째 방문·이동 경로 타임라인)를 볼 수 있습니다. **방문 분석** 탭은 기간별 세션·방문자·전환율, 일별 추이, 예약 퍼널, 유입원·첫 페이지·기기별 집계, 최근 방문 60건의 이동 경로를 보여줍니다.

## 상담 이야기

한국어 메인에는 상담 대화 3편을, `/reviews`에는 총 31편을 보여줍니다. 민*님의 제공된 실제 이직 상담 1편은 그대로 보존하고, 나머지 30편은 이직·연애·결혼·재회·건강·자녀·학업 등을 소재로 새로 만든 예시입니다. `고민 → 까치 선생님의 구체적인 조언 → 소감과 감사` 순서로 읽으며, 창작 대화는 카드와 상세 화면에 예시임을 표시합니다.

모든 카드는 파란 대화창, 흰색 고객 말풍선, 노란 선생님 말풍선을 사용합니다. 이름은 `민*`, `지*`처럼 가리고, 호칭은 까치 선생님·까치쌤·선생님으로 구성했습니다. 메인에서는 모바일로 옆으로 넘길 수 있고, 전체 보기에서는 상세 대화를 펼칠 수 있습니다. 외부 출처는 표시하지 않으며 `/reviews`는 검색 색인에서 제외합니다. 실제 대화는 `lib/reviews-actual.ts`, 예시 30편은 `lib/reviews.ts`에서 수정할 수 있습니다.

## 브랜드

- 한글: **마이까치** / 영문: **MY KKACHI**
- 중심 문구: **내 이야기를 듣고, 내일을 함께 살피다.**
- 보조 문구: **내 곁의 작은 까치, 마이까치.**
- 영문: **A little bird, by your side.**
- 크림 `#F8F5ED`, 먹색 `#243B3B`, 청록 `#517C73`, 살구 `#D9936E`
- 본문 Pretendard, 제목 고운바탕, 영문 DM Sans, 번체 Noto Sans TC

작은 까치가 밤의 창가에 내려앉아 마음속 이야기를 듣는 서사는 한국의 까치 상징에서 영감을 얻은 브랜드 창작입니다. 실제 전래 설화나 고객 상담 사례로 소개하지 않습니다.

대표 캐릭터는 사용자가 선택한 `public/brand/mykkachi-social-profile-v2-3d.png`입니다. `lib/brand-assets.ts`에서 경로를 공유하고, `components/brand-mascot.tsx`로 로고의 얼굴, 메인 이미지, 브랜드 이야기, 무료 사주 안내, 푸터에 표시합니다. 한국어·번체 사이트와 공유 미리보기, 스튜디오의 소셜 프로필에 같은 이미지를 사용하며, 웹에서는 Next.js Image로 표시 크기에 맞춰 최적화합니다. PNG 다운로드는 원본을 제공합니다.

캐릭터 생성 프롬프트는 같은 폴더의 `mykkachi-social-profile-v2-3d.prompt.txt`에 있습니다. 기존 SVG 로고는 `public/brand/`, 이전 일러스트는 `public/images/mykkachi-magpie.webp`, 브랜드 창작 이야기와 초기 프롬프트는 [기존 브랜드 가이드](studio/README.md)에 보관했습니다.
