# 마이까치 MY KKACHI

**내 이야기를 듣고, 내일을 함께 살피다.**

개인 사주 상담 브랜드의 한국어·번체 중국어 사이트입니다. 까치 브랜드 스토리, 카카오톡 상담·계좌이체 안내, 무료 사주와 오행 풀이, 저널을 제공합니다.

## 배포 구조

- 저장소: https://github.com/sungbin38/mykkachi
- 고객용 사이트: Next.js, Vercel 프로젝트 `mykkachi` (`sungbin3833@gmail.com` 개인 계정)
- 공개 주소: https://mykkachi.vercel.app
- 관리자: https://mykkachi.vercel.app/admin — 기존에 설정한 관리자 비밀번호로 로그인합니다.
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

```sh
npm run db:migrate  # 테이블 생성, 없는 기본 저널만 추가; 기존 수정 내용 유지
npm run test:db     # 실제 DB의 바인딩·트랜잭션 롤백 확인
# 로컬 서버 실행 후
npm run test:admin  # 관리자 권한, 저장, 검토/발행, 초안 격리 확인
```

`db/001_initial.sql`에 콘텐츠·운영 설정·실행 이력·로그인 시도 제한 테이블을 정의합니다. 기존 한국어·번체 저널 12개를 이관했습니다. 관리자가 검토 완료한 글을 발행하면 재배포 없이 공개 저널에 반영됩니다. 발행 후 초안을 수정해도 마지막 발행본만 공개됩니다. 동시 수정은 충돌로 안내합니다.

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

## 상담 오픈

`lib/brand.ts`의 `KAKAO_URL`에 확인된 카카오톡 채널이나 오픈채팅 링크를 넣습니다. 아직 링크가 없어 '1:1 상담 오픈 준비 중'으로 표시하며 예약·입금을 받지 않는다고 안내합니다. 금액이나 계좌번호는 임의로 만들지 않았습니다.

상담 비용·일정·범위·취소 및 환불·개인정보 이용 안내를 준비한 뒤 실제 상담을 오픈하세요. 사이트 내 자동 결제·자동 입금 확인 기능은 없습니다.

## 브랜드

- 한글: **마이까치** / 영문: **MY KKACHI**
- 중심 문구: **내 이야기를 듣고, 내일을 함께 살피다.**
- 보조 문구: **내 곁의 작은 까치, 마이까치.**
- 영문: **A little bird, by your side.**
- 크림 `#F8F5ED`, 먹색 `#243B3B`, 청록 `#517C73`, 살구 `#D9936E`
- 본문 Pretendard, 제목 고운바탕, 영문 DM Sans, 번체 Noto Sans TC

작은 까치가 밤의 창가에 내려앉아 마음속 이야기를 듣는 서사는 한국의 까치 상징에서 영감을 얻은 브랜드 창작입니다. 실제 전래 설화나 고객 상담 사례로 소개하지 않습니다.

로고는 `public/brand/`, 메인 일러스트는 `public/images/mykkachi-magpie.webp`에 있습니다. 자세한 브랜드 이야기와 일러스트 생성 프롬프트는 [기존 브랜드 가이드](studio/README.md)에 보관했습니다.
