import { openSlots } from "@/lib/booking";
import { apiError } from "@/lib/server";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json({ slots: await openSlots() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return apiError(e);
  }
}
