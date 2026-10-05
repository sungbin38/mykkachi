import { trafficReport } from "@/lib/tracking";
import { admin, apiError } from "@/lib/server";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    await admin();
    const days = Math.min(90, Math.max(1, Number(new URL(req.url).searchParams.get("days")) || 30));
    return Response.json(await trafficReport(days), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return apiError(e);
  }
}
