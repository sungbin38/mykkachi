import { setSlots } from "@/lib/booking";
import { admin, apiError, readJson, sameOrigin } from "@/lib/server";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    await admin();
    const p = await readJson(req);
    return Response.json({ slots: await setSlots(p.date, p.hours, p.action) });
  } catch (e) {
    return apiError(e);
  }
}
