import {
  adminPasswordHash,
  createSessionToken,
  sessionCookie,
  verifyPassword,
} from "@/lib/admin-auth";
import { createHmac } from "node:crypto";
import { db } from "@/lib/db";
import { apiError, HttpError, readJson, sameOrigin } from "@/lib/server";

export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const body = await readJson(req);
    const password = typeof body.password === "string" ? body.password : "";
    const stored = adminPasswordHash();
    if (!stored || !process.env.ADMIN_SESSION_SECRET)
      throw new HttpError(503, "관리자 비밀번호가 아직 설정되지 않았습니다.");
    const ip = req.headers.get("x-vercel-forwarded-for") || req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const key = createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(ip).digest("hex");
    // Database-backed limit works across serverless instances. Never save raw IPs.
    await db().prepare("DELETE FROM admin_login_attempts WHERE expires_at < NOW()").run();
    const attempt = await db().prepare(`INSERT INTO admin_login_attempts (key,attempts,expires_at)
      VALUES (?,1,NOW()+INTERVAL '15 minutes')
      ON CONFLICT (key) DO UPDATE SET attempts=admin_login_attempts.attempts+1
      RETURNING attempts`).bind(key).first<{attempts:number}>();
    if (!attempt || attempt.attempts > 10)
      throw new HttpError(429, "로그인 시도가 많습니다. 15분 뒤 다시 시도해 주세요.");
    const ok = password.length > 0 && password.length <= 256 && (await verifyPassword(password, stored));
    if (!ok) {
      await new Promise((r) => setTimeout(r, 400));
      throw new HttpError(401, "비밀번호가 올바르지 않습니다.");
    }
    await db().prepare("DELETE FROM admin_login_attempts WHERE key=?").bind(key).run();
    const token = await createSessionToken();
    const secure = new URL(req.url).protocol === "https:";
    return Response.json(
      { ok: true },
      { headers: { "Set-Cookie": sessionCookie(token, secure), "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
