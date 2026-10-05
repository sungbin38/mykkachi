import { allSlots, listBookings, markSeen, notificationConfigured, todaySeoul, unseenCount } from "@/lib/booking";
import { admin, apiError } from "@/lib/server";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  try {
    await admin();
    const url = new URL(req.url);
    if (url.searchParams.get("summary") === "1")
      return Response.json({ unseen: await unseenCount() }, { headers: { "Cache-Control": "no-store" } });
    const today = todaySeoul();
    const from = url.searchParams.get("from") || today;
    const to = url.searchParams.get("to") || new Date(Date.parse(today) + 90 * 86400000).toISOString().slice(0, 10);
    const [bookings, slots] = await Promise.all([listBookings(), allSlots(from, to)]);
    const unseen = bookings.filter((b) => !b.seenAt).length;
    if (unseen && url.searchParams.get("ack") === "1") await markSeen();
    return Response.json({ bookings, slots, unseen, notifications: notificationConfigured() }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return apiError(e);
  }
}
