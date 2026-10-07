import { Resend } from "resend";
import PostalMime from "postal-mime";
import { Webhook } from "svix";
import { db } from "./db";
import { CONTACT_EMAIL } from "./brand";

export const INBOUND_FORWARD_TO = "sungbin3833@gmail.com";
const mailbox = (value: string) => (value.match(/<([^<>]+)>/)?.[1] || value).trim().toLowerCase();

export async function prepareForward(raw: ArrayBuffer, subject: string) {
  const parsed = await PostalMime.parse(raw, { attachmentEncoding: "base64" });
  if (parsed.headers.some(h => h.key.toLowerCase() === "x-mykkachi-forwarded")) return null;
  return {
    from: `돈쌤 문의 <${CONTACT_EMAIL}>`,
    to: [INBOUND_FORWARD_TO],
    replyTo: parsed.from?.address,
    subject: `[돈쌤 문의] ${(subject || "(제목 없음)").replace(/[\r\n]/g, " ").slice(0, 240)}`,
    text: parsed.text || (parsed.html ? "" : "(본문 없음)"),
    html: parsed.html || undefined,
    headers: { "X-MyKkachi-Forwarded": "1" },
    attachments: parsed.attachments.map(a => ({
      filename: a.filename || "attachment",
      content: a.content as string,
      contentType: a.mimeType,
      contentId: a.contentId?.replace(/^<|>$/g, ""),
    })),
  };
}

export async function forwardInboundEmail(id: string) {
  const prior = await db().prepare("SELECT sent_email_id FROM inbound_email_forwards WHERE received_email_id=?").bind(id).first<{ sent_email_id: string }>();
  if (prior) return { forwarded: true, duplicate: true, id: prior.sent_email_id };
  const resend = new Resend(process.env.RESEND_API_KEY);
  const received = await resend.emails.receiving.get(id);
  if (received.error) throw new Error(`Receiving API: ${received.error.name}`);
  const email = received.data;
  if (![...email.to, ...(email.cc || []), ...(email.bcc || [])].some(address => mailbox(address) === CONTACT_EMAIL)) return { forwarded: false, ignored: true };
  if (!email.raw?.download_url) throw new Error("Raw email unavailable");
  const response = await fetch(email.raw.download_url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Raw email download: ${response.status}`);
  const message = await prepareForward(await response.arrayBuffer(), email.subject);
  if (!message) return { forwarded: false, ignored: true };
  // Provider idempotency covers concurrent webhook attempts; the database covers later replays.
  const sent = await resend.emails.send(message, { idempotencyKey: `inbound-forward/${id}` });
  if (sent.error) throw new Error(`Forward API: ${sent.error.name}`);
  await db().prepare("INSERT INTO inbound_email_forwards (received_email_id,sent_email_id) VALUES (?,?) ON CONFLICT (received_email_id) DO NOTHING").bind(id, sent.data.id).run();
  return { forwarded: true, id: sent.data.id };
}

export async function handleInboundWebhook(request: Request, forward = forwardInboundEmail) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret || !process.env.RESEND_API_KEY) return new Response("Not configured", { status: 503 });
  const payload = await request.text();
  if (payload.length > 1000000) return new Response("Payload too large", { status: 413 });
  let event: { type?: string; data?: { email_id?: string } };
  try {
    new Webhook(secret).verify(payload, {
      "svix-id": request.headers.get("svix-id") || "",
      "svix-timestamp": request.headers.get("svix-timestamp") || "",
      "svix-signature": request.headers.get("svix-signature") || "",
    });
    event = JSON.parse(payload);
    if (!event || typeof event !== "object") throw new Error("Invalid event");
  } catch { return new Response("Invalid signature", { status: 400 }); }
  if (event.type !== "email.received") return Response.json({ ignored: true });
  const id = event.data?.email_id;
  if (!id || !/^[a-f0-9-]{36}$/i.test(id)) return new Response("Invalid email ID", { status: 400 });
  try { return Response.json(await forward(id)); }
  catch (error) {
    console.error("Inbound forwarding failed", id, error instanceof Error ? error.message : "unknown error");
    return new Response("Forwarding failed; retry required", { status: 503 });
  }
}
