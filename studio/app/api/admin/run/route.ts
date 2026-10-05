import { admin, sameOrigin, apiError, runAutomation } from "@/lib/server";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    await admin();
    return Response.json(await runAutomation("manual"));
  } catch (e) {
    return apiError(e);
  }
}
