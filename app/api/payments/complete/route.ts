import { completePayment } from "@/lib/payments";
import { apiError, readJson, sameOrigin } from "@/lib/server";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    return Response.json(await completePayment((await readJson(req)).paymentId));
  } catch (e) {
    return apiError(e);
  }
}
