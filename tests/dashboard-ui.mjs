// Run against a local dev server with matching TEST_ADMIN_SESSION_SECRET.
// API responses are intercepted in this browser; no database is read or written.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:3107";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(origin).hostname));
const secret = process.env.TEST_ADMIN_SESSION_SECRET;
assert.ok(secret, "Set TEST_ADMIN_SESSION_SECRET to the local server's session secret");
const payload = String(Math.floor(Date.now() / 1000) + 600);
const signature = createHmac("sha256", secret).update(payload).digest("base64");
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
let state = "empty";
const overview = {
  metrics: [], jobs: [],
  settings: { enabled: false, locale: "ko", time: "09:00", publishSeo: false },
  connections: { database: true, analytics: false, scheduler: false, threads: false, instagram: false },
  collectedAt: new Date().toISOString(),
};
const item = {
  id: "ui-only-item", channel: "seo", locale: "ko", topic: "five-elements",
  title: "저장된 원고 확인", slug: "ui-only-article", excerpt: "테스트 중에만 사용하는 응답입니다.",
  body: "검토 중인 원고", keyword: "원고", slides: [], status: "draft",
  scheduledAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
};
try {
  await page.context().addCookies([{ name: "mk_admin", value: encodeURIComponent(`${payload}.${signature}`), url: origin }]);
  await page.route("**/api/admin/**", async (route) => {
    assert.equal(route.request().method(), "GET", "UI check must not mutate server state");
    if (state === "error") return route.fulfill({ status: 503, json: { error: "연결 확인 중" } });
    if (new URL(route.request().url()).pathname.endsWith("/content")) {
      return route.fulfill({ json: { items: state === "saved" ? [item] : [] } });
    }
    return route.fulfill({ json: state === "saved" ? {
      ...overview, connections: { ...overview.connections, analytics: true },
      metrics: [{ day: "2026-10-05", event: "page_view", source: "threads", locale: "ko", count: 7 }],
    } : overview });
  });
  await page.goto(origin + "/admin");
  await page.getByText("방문 집계 연결을 기다리고 있어요.").waitFor();
  assert.deepEqual(await page.locator(".metric-card strong").allTextContents(), ["—", "—", "0", "0"]);
  assert.equal(await page.locator(".traffic-row").count(), 0);
  assert.equal(await page.getByText("한국어 6편 · 번체 6편").count(), 0);
  await page.locator(".social-profile-image").evaluate((img) => img.decode());
  assert.equal(await page.locator(".social-profile-image").evaluate((img) => getComputedStyle(img).borderRadius), "50%");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "프로필 사진 PNG" }).click(),
  ]);
  assert.equal(download.suggestedFilename(), "mykkachi-social-profile.png");
  assert.equal(await download.failure(), null);
  await page.getByRole("button", { name: "콘텐츠 만들기", exact: true }).first().click();
  await page.getByRole("dialog").waitFor();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "자동화 설정", exact: true }).click();
  await page.getByRole("button", { name: "규칙 저장", exact: true }).waitFor();
  await page.getByRole("button", { name: "SEO 관리", exact: true }).click();
  await page.getByText("아직 저장된 SEO 원고가 없습니다.").waitFor();
  assert.equal(await page.locator("tbody tr").count(), 1);

  state = "saved";
  await page.getByRole("button", { name: "새로고침", exact: true }).click();
  await page.getByText(item.title, { exact: true }).waitFor();
  assert.equal(await page.locator("tbody tr").count(), 1);
  await page.getByRole("button", { name: "원고 검토", exact: true }).waitFor();
  assert.equal(await page.getByRole("link", { name: "페이지 열기" }).count(), 0);
  await page.getByRole("button", { name: "대시보드", exact: true }).click();
  assert.deepEqual(await page.locator(".metric-card strong").allTextContents(), ["7", "0", "0", "0"]);

  state = "error";
  await page.getByRole("button", { name: "새로고침", exact: true }).click();
  await page.getByText("운영 데이터를 불러오지 못했어요.").waitFor();
  assert.equal(await page.locator(".metric-card").count(), 0);
  assert.equal(await page.getByText(item.title, { exact: true }).count(), 0);
  assert.ok(await page.getByRole("button", { name: "콘텐츠 만들기", exact: true }).isDisabled());
  await page.getByRole("link", { name: "프로필 사진 PNG" }).waitFor();

  state = "empty";
  await page.getByRole("button", { name: "다시 연결하기", exact: true }).click();
  await page.getByText("방문 집계 연결을 기다리고 있어요.").waitFor();
  await mkdir("outputs/qa", { recursive: true });
  await page.screenshot({ path: "outputs/qa/social-dashboard-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "Mobile overflow");
  await page.screenshot({ path: "outputs/qa/social-dashboard-mobile.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log("PASS empty records, disconnected analytics, saved records, connection failure/retry, profile download, content/automation entry points, mobile layout");
} finally {
  await browser.close();
}
