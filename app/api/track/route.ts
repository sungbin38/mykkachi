import { isExcludedVisitor, NO_TRACK_COOKIE, parseTrack, recordTrack } from "@/lib/tracking";
import { apiError, readJson, sameOrigin } from "@/lib/server";
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    if (isExcludedVisitor(req.headers)) {
      // Mark the browser so later visits from another network (phone, cafe) stay out of the stats too.
      return new Response(null, { status: 204, headers: { "Set-Cookie": `${NO_TRACK_COOKIE}=1; Path=/; Max-Age=31536000; SameSite=Lax; HttpOnly${process.env.NODE_ENV === "production" ? "; Secure" : ""}` } });
    }
    await recordTrack(parseTrack(await readJson(req)), req.headers);
    return new Response(null, { status: 204 });
  } catch (e) {
    return apiError(e);
  }
}
