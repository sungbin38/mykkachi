"use client";
import { useEffect } from "react";
export function trackEvent(event: "page_view" | "reading_complete") {
  try {
    const allowed = ["instagram", "threads", "google", "naver"];
    const raw = new URLSearchParams(location.search).get("utm_source") || "";
    let referrer = "";
    try {
      referrer = new URL(document.referrer).hostname;
    } catch {}
    const inbound = allowed.includes(raw)
      ? raw
      : /(^|\.)google\.[a-z.]+$/.test(referrer)
        ? "google"
        : /(^|\.)naver\.com$/.test(referrer)
          ? "naver"
          : "";
    let stored = "";
    try {
      if (inbound) sessionStorage.setItem("luun-source", inbound);
      stored = sessionStorage.getItem("luun-source") || "";
    } catch {}
    const source = inbound || (allowed.includes(stored) ? stored : "direct");
    void fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        source,
        locale: location.pathname.startsWith("/zh-TW") ? "zh-TW" : "ko",
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {}
}
export function Tracking() {
  useEffect(() => {
    document.documentElement.lang = location.pathname.startsWith("/zh-TW")
      ? "zh-Hant"
      : "ko";
    if (!location.pathname.startsWith("/admin")) trackEvent("page_view");
  }, []);
  return null;
}
