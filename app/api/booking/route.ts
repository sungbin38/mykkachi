import { bookingSummary, createBooking, validateBooking } from "@/lib/booking";
import { portoneConfigured } from "@/lib/payments";
import { apiError, HttpError, readJson, sameOrigin } from "@/lib/server";
// Saves the order as awaiting payment. The browser then opens the PortOne window and reports back to /api/payments/complete.
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const input = validateBooking(await readJson(req));
    if (!portoneConfigured()) throw new HttpError(503, "카드 결제를 준비하고 있어요. 잠시 뒤 다시 시도해 주세요.");
    return Response.json(bookingSummary(await createBooking(input)));
  } catch (e) {
    return apiError(e);
  }
}
