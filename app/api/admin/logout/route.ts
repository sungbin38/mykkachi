import { clearSessionCookie } from "@/lib/admin-auth";
import { apiError, sameOrigin } from "@/lib/server";

export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const secure = new URL(req.url).protocol === "https:";
    return Response.json(
      { ok: true },
      { headers: { "Set-Cookie": clearSessionCookie(secure), "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
