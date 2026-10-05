import {
  admin,
  sameOrigin,
  readJson,
  apiError,
  allContent,
  makePackage,
} from "@/lib/server";
export async function GET() {
  try {
    await admin();
    return Response.json(
      { items: await allContent() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    await admin();
    const p = await readJson(req);
    return Response.json(await makePackage(p.topic, p.locale));
  } catch (e) {
    return apiError(e);
  }
}
