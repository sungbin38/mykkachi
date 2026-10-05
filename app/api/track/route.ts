import { parseTrack, recordTrack } from "@/lib/tracking";
import { apiError, readJson, sameOrigin } from "@/lib/server";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    await recordTrack(parseTrack(await readJson(req)), req.headers);
    return new Response(null, { status: 204 });
  } catch (e) {
    return apiError(e);
  }
}
