"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ids, track } from "@/lib/track-client";

// React StrictMode runs effects twice in development; ignore a repeat of the same path within a second.
let last = { key: "", at: 0 };

/** Mounted once in the root layout. Starts a session on first load, logs each page view
 *  and booking CTA clicks. Admin pages are never tracked. */
export function Tracking() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const key = pathname + location.search;
    if (last.key === key && Date.now() - last.at < 1000) return;
    last = { key, at: Date.now() };
    const { fresh } = ids();
    if (fresh) {
      const q = new URLSearchParams(location.search);
      const utm: Record<string, string> = {};
      for (const k of ["source", "medium", "campaign", "content", "term"]) { const v = q.get(`utm_${k}`); if (v) utm[k] = v; }
      track("session_start", undefined, { landing: { path: location.pathname + location.search, referrer: document.referrer || undefined, utm, language: navigator.language, screen: `${screen.width}x${screen.height}` } });
    }
    track("page_view");
  }, [pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href^='/book'], [data-track]") as HTMLElement | null;
      if (!a) return;
      const label = (a.getAttribute("data-track") || a.textContent || "").trim().slice(0, 60);
      track(a.getAttribute("data-track-event") || "cta_click", { label, href: a.getAttribute("href") || undefined, section: a.closest("section")?.id || undefined });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
