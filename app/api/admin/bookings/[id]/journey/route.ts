import { getBooking } from "@/lib/booking";
import { journey } from "@/lib/tracking";
import { admin, apiError } from "@/lib/server";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await admin();
    const { id } = await params;
    const b = await getBooking(id);
    return Response.json(await journey(b.sessionId, b.visitorId), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return apiError(e);
  }
}
