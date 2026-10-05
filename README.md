# 마이까치 MY KKACHI

**내 이야기를 듣고, 내일을 함께 살피다.**

개인 사주 상담 브랜드의 한국어·번체 중국어 사이트입니다. 까치 브랜드 스토리, 카카오톡 상담·계좌이체 안내, 무료 사주와 오행 풀이, 저널을 제공합니다.

## 배포 구조

- 저장소: https://github.com/sungbin38/mykkachi
- 고객용 사이트: Next.js, Vercel 프로젝트 `mykkachi` (`sungbin3833@gmail.com` 개인 계정)
- 공개 주소: https://mykkachi.vercel.app
- `/admin`은 기존 비공개 Sites 관리자 화면으로 이동합니다. 해당 사이트의 로그인과 권한 검사를 그대로 사용합니다.
- `studio/`에는 기존 Sites 애플리케이션의 소스를 보관했습니다. Vercel 빌드·업로드 대상이 아닙니다.

고객용 사이트에는 Cloudflare D1이나 ChatGPT 인증 헤더를 연결하지 않습니다. 데이터베이스·관리자 기능은 기존 Sites에 유지됩니다. **기존 관리자에서 발행한 새 원고는 Vercel에 자동 동기화되지 않습니다.** Vercel 저널은 `lib/knowledge.ts`의 원고를 Git으로 관리하며 배포 시 갱신됩니다. 이전 시점에 기존 운영 데이터베이스의 콘텐츠 테이블은 비어 있었습니다.

Vercel 사이트에서는 기존 Sites 방문 이벤트 집계를 실행하지 않습니다. 사주 입력은 브라우저 안에서만 처리합니다.

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
