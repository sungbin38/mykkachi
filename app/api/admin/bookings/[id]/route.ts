import { updateBooking } from "@/lib/booking";
import { admin, apiError, readJson, sameOrigin } from "@/lib/server";
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    sameOrigin(req);
    await admin();
    const { id } = await params;
    return Response.json({ booking: await updateBooking(id, await readJson(req)) });
  } catch (e) {
    return apiError(e);
  }
}
