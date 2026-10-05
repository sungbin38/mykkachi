"use client";
// Browser-side visitor/session identity and event beacons. No personal data is sent here;
// the server only receives anonymous ids, paths, referrer/UTM and coarse device info.
const VID_KEY = "mk_vid", SID_KEY = "mk_sid", SID_AT = "mk_sid_at", SESSION_MINUTES = 30;
const rid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().replace(/-/g, "") : Math.random().toString(36).slice(2) + Date.now().toString(36));
function get(store: Storage, k: string) { try { return store.getItem(k); } catch { return null; } }
function set(store: Storage, k: string, v: string) { try { store.setItem(k, v); } catch {} }
export function ids(): { vid: string; sid: string; fresh: boolean } {
  if (typeof window === "undefined") return { vid: "", sid: "", fresh: false };
  let vid = get(localStorage, VID_KEY);
  if (!vid) { vid = rid(); set(localStorage, VID_KEY, vid); }
  let sid = get(sessionStorage, SID_KEY);
  const at = Number(get(sessionStorage, SID_AT) || 0);
  let fresh = false;
  if (!sid || Date.now() - at > SESSION_MINUTES * 60000) { sid = rid(); set(sessionStorage, SID_KEY, sid); fresh = true; }
  set(sessionStorage, SID_AT, String(Date.now()));
  return { vid, sid, fresh };
}
export function track(event: string, meta?: Record<string, unknown>, extra?: Record<string, unknown>) {
  if (typeof window === "undefined" || location.pathname.startsWith("/admin")) return;
  const { vid, sid } = ids();
  const body = JSON.stringify({ vid, sid, event, path: location.pathname + location.search, meta, ...extra });
  try {
    if (navigator.sendBeacon && navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }))) return;
  } catch {}
  fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
}
