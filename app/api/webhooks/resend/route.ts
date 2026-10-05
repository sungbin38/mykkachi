import { handleInboundWebhook } from "@/lib/inbound-email";
export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(request: Request) {
  return handleInboundWebhook(request);
}
