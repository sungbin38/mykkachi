"use client";
import { useEffect, useState } from "react";
import { Clock3 } from "lucide-react";
import { REPORT_PROMO_END } from "@/lib/booking-shared";
import type { Locale } from "@/lib/brand";

const pad = (n: number) => String(n).padStart(2, "0");

/** Live D-day countdown to the end of the report promotion. Renders a static deadline until mounted to avoid hydration drift. */
export function PromoCountdown({ locale = "ko", className = "" }: { locale?: Locale; className?: string }) {
  const zh = locale === "zh-TW";
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => { clearTimeout(first); clearInterval(id); };
  }, []);
  const left = now === null ? null : Math.max(0, REPORT_PROMO_END - now);
  if (left === 0) return null;
  const s = left === null ? 0 : Math.floor(left / 1000);
  const days = Math.floor(s / 86400);
  const clock = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return <span className={`promo-countdown ${className}`.trim()} role="timer" aria-live="off">
    <Clock3 size={15} aria-hidden="true" />
    <span>{zh ? "10月特價結束倒數" : "10월 특가 마감까지"}</span>
    {left === null
      ? <strong>{zh ? "10/31 23:59（韓國時間）" : "10월 31일 23:59까지"}</strong>
      : <strong><span className="promo-dday">{days > 0 ? `D-${days}` : "D-DAY"}</span>{clock}</strong>}
  </span>;
}
