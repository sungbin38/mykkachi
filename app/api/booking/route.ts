import { createBooking, validateBooking } from "@/lib/booking";
import { apiError, readJson, sameOrigin } from "@/lib/server";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const b = await createBooking(validateBooking(await readJson(req)));
    return Response.json({ id: b.id, product: b.product, date: b.date, hour: b.hour, name: b.name, email: b.email, amount: b.amount, marketingConsent: b.marketingConsent, holdUntil: b.holdUntil, depositName: b.depositName || b.name });
  } catch (e) {
    return apiError(e);
  }
}
