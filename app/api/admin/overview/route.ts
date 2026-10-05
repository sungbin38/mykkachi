import { admin, db, getSettings, apiError, runtime } from "@/lib/server";
export async function GET() {
  try {
    await admin();
    const [metrics, jobs, settings] = await Promise.all([
      db()
        .prepare(
          "SELECT day,event,source,locale,count FROM event_totals WHERE day>=to_char(CURRENT_DATE - 29, 'YYYY-MM-DD') ORDER BY day",
        )
        .all(),
      db()
        .prepare("SELECT * FROM job_runs ORDER BY started_at DESC LIMIT 10")
        .all(),
      getSettings(),
    ]);
    return Response.json(
      {
        metrics: metrics.results,
        jobs: jobs.results,
        settings,
        connections: {
          scheduler: false,
          database: true,
          analytics: false,
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
