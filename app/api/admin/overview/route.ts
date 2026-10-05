import { overviewMetrics } from "@/lib/tracking";
import { admin, db, getSettings, apiError } from "@/lib/server";
export async function GET() {
  try {
    await admin();
    const [metrics, jobs, settings] = await Promise.all([
      overviewMetrics(),
      db()
        .prepare("SELECT * FROM job_runs ORDER BY started_at DESC LIMIT 10")
        .all(),
      getSettings(),
    ]);
    return Response.json(
      {
        metrics,
        jobs: jobs.results,
        settings,
        connections: {
          scheduler: false,
          database: true,
          analytics: true,
          threads: false,
          instagram: false,
        },
        collectedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return apiError(e);
  }
}
