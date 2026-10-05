import { runtime, apiError, runAutomation, HttpError } from "@/lib/server";
export async function POST(req: Request) {
  try {
    const expected = runtime().AUTOMATION_KEY,
      actual = req.headers.get("x-luun-job-key");
    if (!expected || !actual)
      throw new HttpError(401, "실행기 인증이 필요합니다.");
    const a = new Uint8Array(
        await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(expected),
        ),
      ),
      b = new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(actual)),
      );
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    if (diff) throw new HttpError(401, "실행기 인증이 필요합니다.");
    return Response.json(await runAutomation("scheduled"));
  } catch (e) {
    return apiError(e);
  }
}
