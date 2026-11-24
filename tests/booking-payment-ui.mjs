// Card-payment flow in a real browser. PortOne's script and our APIs are mocked: no order, payment or email is created.
// Usage: TEST_ORIGIN=http://localhost:3111 node tests/booking-payment-ui.mjs [screenshot-dir]
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const origin = process.env.TEST_ORIGIN || 'http://localhost:3102';
const shots = process.argv[2];
const browser = await chromium.launch({ channel: 'chrome' });
const p = await browser.newPage();
const errors = []; p.on('pageerror', e => errors.push(e.message));
const shot = name => shots ? p.screenshot({ path: `${shots}/${name}.png`, fullPage: true }) : null;
await p.route('**/api/track', r => r.fulfill({ status: 204 }));
await p.route('**/api/booking/slots', r => r.fulfill({ json: { slots: [{ id: 'kst-18', date: '2030-01-10', hour: 18 }] } }));
const orders = []; let payRequest; let approve = false;
await p.route('**/api/booking', r => {
  const body = r.request().postDataJSON(); orders.push(body);
  return r.fulfill({ json: { id: `0000000${orders.length}-0000-4000-8000-000000000000`, product: body.product, date: null, hour: null, name: body.name, email: body.email, amount: body.marketingConsent ? 5000 : 10000, marketingConsent: body.marketingConsent, orderName: '사주 리포트' } });
});
await p.exposeFunction('__pay', q => { payRequest = q; return approve ? { transactionType: 'PAYMENT', txId: 't', paymentId: q.paymentId } : { transactionType: 'PAYMENT', txId: 't', paymentId: q.paymentId, code: 'USER_CANCEL', message: '결제를 취소했어요.' }; });
await p.route('https://cdn.portone.io/**', r => r.fulfill({ contentType: 'text/javascript', body: 'window.PortOne={requestPayment:q=>window.__pay(q)}' }));
let verified;
await p.route('**/api/payments/complete', r => { verified = r.request().postDataJSON().paymentId; return r.fulfill({ json: { state: 'paid', booking: { id: 'x', product: 'report', date: null, hour: null, name: '테스트', email: 'test@example.invalid', amount: 5000, marketingConsent: true, orderName: '사주 리포트' } } }); });
try {
  for (const width of [1280, 390]) {
    await p.setViewportSize({ width, height: 900 });
    for (const path of ['/terms', '/privacy', '/zh-TW/privacy']) {
      await p.goto(origin + path, { waitUntil: 'networkidle' });
      assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${path} overflows at ${width}`);
    }
    await p.goto(origin + '/terms#refund', { waitUntil: 'networkidle' });
    assert.ok((await p.locator('#refund').innerText()).includes('청약철회'));
    await shot(`terms-${width}`);
  }
  await p.goto(origin + '/privacy', { waitUntil: 'networkidle' });
  assert.ok((await p.locator('main').innerText()).includes('토스페이먼츠'));
  // Footer: business details exactly as registered, and policy links that are real URLs.
  const footer = await p.locator('.site-footer').innerText();
  for (const text of ['상호: 돈쌤 | 대표자: 안성빈 | 사업자등록번호: 611-56-01112', '주소: 경기도 고양시 일산동구 위시티4로 46, 206동 1502호 (식사동, 위시티 일산자이2단지)', '전화: 010-9737-3833 | 이메일: sungbin3833@gmail.com', '통신판매업 신고: 간이과세자 신고 면제'])
    assert.ok(footer.includes(text), `Footer missing: ${text}`);
  assert.deepEqual(await p.locator('.footer-legal a').evaluateAll(a => a.map(x => x.getAttribute('href'))), ['/terms', '/privacy', '/terms#refund']);

  await p.goto(origin + '/book?product=report', { waitUntil: 'networkidle' });
  const page = await p.locator('body').innerText();
  for (const gone of ['사이트에서 결제하지 않아요', '하나은행', '입금', '자동 결제는 제공하지']) assert.ok(!page.includes(gone), `Still shown: ${gone}`);
  assert.equal(await p.locator('.payment-agreements input').count(), 3);
  assert.ok((await p.locator('.refund-summary').innerText()).includes('전액 환불'));
  await p.getByPlaceholder('어떻게 불러드릴까요?').fill('테스트');
  await p.getByPlaceholder('name@example.com').fill('test@example.invalid');
  await p.getByPlaceholder('010-0000-0000').fill('010-1234-5678');
  await p.locator('#birth-year').selectOption('1990'); await p.locator('#birth-month').selectOption('1'); await p.locator('#birth-day').selectOption('1');
  await p.getByRole('checkbox', { name: '태어난 시간을 몰라요' }).check();
  await p.getByRole('radio', { name: '여성', exact: true }).click();
  await p.locator('textarea').fill('이직을 고민하고 있어서 올해 흐름이 궁금합니다.');
  await p.locator('.consent-card input').check();
  // Each required consent blocks payment on its own.
  await p.locator('.booking-submit').click();
  await p.locator('.error-message').waitFor();
  const boxes = await p.locator('.payment-agreements input').all();
  await boxes[0].check(); await p.locator('.booking-submit').click();
  assert.ok((await p.locator('.error-message').innerText()).includes('이용약관'));
  await boxes[1].check(); await p.locator('.booking-submit').click();
  assert.ok((await p.locator('.error-message').innerText()).includes('청약철회'));
  assert.equal(orders.length, 0);
  await boxes[2].check();
  assert.ok((await p.locator('.booking-submit').innerText()).includes('5,000원'));
  await shot('book-report-payment-step');
  // Cancelled in the payment window: stay on the form with the message; the retry releases the first attempt.
  await p.locator('.booking-submit').click();
  await p.locator('.error-message').waitFor();
  assert.ok((await p.locator('.error-message').innerText()).includes('결제를 취소했어요'));
  assert.deepEqual([orders[0].termsAgreed, orders[0].withdrawalAgreed, orders[0].replaces, 'amount' in orders[0]], [true, true, undefined, false]);
  assert.deepEqual([payRequest.totalAmount, payRequest.payMethod, payRequest.currency, payRequest.orderName, payRequest.customer.phoneNumber], [5000, 'CARD', 'CURRENCY_KRW', '사주 리포트', '01012345678']);
  assert.match(payRequest.paymentId, /^00000001000040008000000000000000-[a-z0-9]+$/);
  assert.ok(payRequest.redirectUrl.endsWith('/book/complete'));
  approve = true;
  await p.locator('.booking-submit').click();
  await p.locator('.booking-done').waitFor();
  assert.equal(orders[1].replaces, '00000001-0000-4000-8000-000000000000');
  assert.equal(verified, payRequest.paymentId);
  assert.ok((await p.locator('.booking-done').innerText()).includes('확정'));
  await shot('book-done');
  // Mobile return page: failure offers a retry, success shows the same confirmation.
  await p.goto(origin + '/book/complete?paymentId=abc&code=FAILURE&message=' + encodeURIComponent('카드 승인이 거절됐어요.'), { waitUntil: 'networkidle' });
  assert.ok((await p.locator('.booking-done').innerText()).includes('카드 승인이 거절됐어요.'));
  assert.ok(await p.getByRole('button', { name: '다시 결제하기' }).isVisible());
  await shot('complete-failed');
  await p.goto(origin + '/book/complete?paymentId=' + payRequest.paymentId, { waitUntil: 'networkidle' });
  await p.locator('.booking-done-amount').waitFor();
  assert.deepEqual(errors, []);
  console.log('PASS policy pages, footer business details, removed transfer wording, required consents, PortOne request, cancel/retry with release, verified confirmation, mobile return page');
} finally { await browser.close(); }
