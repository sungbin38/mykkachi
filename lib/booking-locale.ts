import type { Locale } from "./brand";

export const bookingZone = (locale: Locale) => locale === "zh-TW" ? "Asia/Taipei" : "Asia/Seoul";
export const bookingZoneLabel = (locale: Locale) => locale === "zh-TW" ? "台灣標準時間（UTC+8）" : "한국 표준시 (KST, UTC+9)";
/** Storage and admin schedules always use KST; convert only at the customer boundary. */
export function bookingSlotLocal(date: string, hour: number, locale: Locale) {
  const instant = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00+09:00`);
  const timeZone = bookingZone(locale);
  const day = new Intl.DateTimeFormat("sv-SE", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(instant);
  const clock = new Intl.DateTimeFormat("en-GB", { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  return { date: day, start: clock.format(instant), end: clock.format(new Date(instant.getTime() + 3600000)) };
}
export function bookingDay(date: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "zh-TW", { timeZone: "UTC", month: "long", day: "numeric", weekday: "short" }).format(new Date(`${date}T12:00:00Z`));
}
export function bookingSlotLabel(date: string, hour: number, locale: Locale) {
  const local = bookingSlotLocal(date, hour, locale);
  return `${bookingDay(local.date, locale)} ${local.start}–${local.end} · ${bookingZoneLabel(locale)}`;
}
export const bookingMoney = (amount: number, locale: Locale) => locale === "zh-TW" ? `${amount.toLocaleString("zh-TW")} 韓元` : `${amount.toLocaleString("ko-KR")}원`;
