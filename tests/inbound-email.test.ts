import test from "node:test";
import assert from "node:assert/strict";
import { Webhook } from "svix";
import { handleInboundWebhook, prepareForward, INBOUND_FORWARD_TO } from "../lib/inbound-email";
const secret = `whsec_${Buffer.from("test-signing-key-never-used-in-production").toString("base64")}`;
process.env.RESEND_WEBHOOK_SECRET = secret;
process.env.RESEND_API_KEY = "test-no-network";
const id = "12345678-1234-1234-1234-123456789abc";
function request(body: string, when = new Date(), invalid = false) {
  const signature = new Webhook(secret).sign("test-event", when, body);
  return new Request("https://mykkachi.com/api/webhooks/resend", { method: "POST", body, headers: { "svix-id": "test-event", "svix-timestamp": String(Math.floor(when.getTime()/1000)), "svix-signature": invalid ? "v1,invalid" : signature } });
}
test("signed receiving events forward once per handler; forged and stale requests never send", async () => {
  let calls=0;
  const forward = async (value: string) => { assert.equal(value,id); calls++; return { forwarded:true,id:"sent" }; };
  const body=JSON.stringify({type:"email.received",data:{email_id:id}});
  assert.equal((await handleInboundWebhook(request(body,new Date(),true),forward)).status,400);
  assert.equal((await handleInboundWebhook(request(body,new Date(Date.now()-600000)),forward)).status,400);
  assert.equal(calls,0);
  assert.equal((await handleInboundWebhook(request(JSON.stringify({type:"email.sent"})),forward)).status,200);
  assert.equal(calls,0);
  assert.equal((await handleInboundWebhook(request(body),forward)).status,200);
  assert.equal(calls,1);
});
test("forward preserves attachment bytes and directs replies to the original sender",async()=>{
  const raw=['From: Customer <customer@example.com>','To: hello@mykkachi.com','Subject: question','MIME-Version: 1.0','Content-Type: multipart/mixed; boundary="test"','','--test','Content-Type: text/plain; charset=utf-8','','Hello from customer','--test','Content-Type: application/pdf','Content-Disposition: attachment; filename="test.pdf"','Content-Transfer-Encoding: base64','','aGVsbG8=','--test--',''].join('\r\n');
  const message=await prepareForward(new TextEncoder().encode(raw).buffer,'question');
  assert.ok(message);assert.deepEqual(message.to,[INBOUND_FORWARD_TO]);assert.equal(message.replyTo,'customer@example.com');
  assert.match(message.text!,/Hello from customer/);assert.equal(message.attachments[0].content,'aGVsbG8=');
  assert.equal(message.attachments[0].filename,'test.pdf');
  assert.equal(await prepareForward(new TextEncoder().encode('X-MyKkachi-Forwarded: 1\r\n'+raw).buffer,'question'),null);
});
