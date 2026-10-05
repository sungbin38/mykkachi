"use client";
import { useState } from "react";
// Year / month / day selects instead of a native date picker: faster on phones and
// no calendar scrolling back decades. Emits "YYYY-MM-DD" or "" while incomplete.
const THIS_YEAR = new Date().getFullYear();
const pad = (n: number) => String(n).padStart(2, "0");
const daysIn = (y: number, m: number) => (y && m ? new Date(y, m, 0).getDate() : 31);

export function BirthFields({ value, onChange, minYear = 1930, zh = false, required = true, idPrefix = "birth" }: {
  value: string; onChange: (date: string) => void; minYear?: number; zh?: boolean; required?: boolean; idPrefix?: string;
}) {
  // Keep partial selections locally until all three fields form a complete date.
  const [draft, setDraft] = useState({ value, parts: value ? value.split("-").map(Number) : [0, 0, 0] });
  if (draft.value !== value) {
    setDraft({ value, parts: value ? value.split("-").map(Number) : [0, 0, 0] });
  }
  const [y, m, d] = draft.parts;
  const emit = (ny: number, nm: number, nd: number) => {
    const max = daysIn(ny, nm);
    const day = nd > max ? max : nd;
    const next = ny && nm && day ? `${ny}-${pad(nm)}-${pad(day)}` : "";
    setDraft({ value: next, parts: [ny, nm, day] });
    onChange(next);
  };
  const years = Array.from({ length: THIS_YEAR - minYear + 1 }, (_, i) => THIS_YEAR - i);
  return <div className="birth-fields" role="group" aria-label={zh ? "出生日期" : "생년월일"}>
    <label><span className="sr-only">{zh ? "年" : "년"}</span>
      <select id={`${idPrefix}-year`} className="input-control" required={required} value={y || ""} onChange={(e) => emit(Number(e.target.value), m, d)}>
        <option value="">{zh ? "年" : "년"}</option>{years.map((yy) => <option key={yy} value={yy}>{yy}</option>)}
      </select></label>
    <label><span className="sr-only">{zh ? "月" : "월"}</span>
      <select id={`${idPrefix}-month`} className="input-control" required={required} value={m || ""} onChange={(e) => emit(y, Number(e.target.value), d)}>
        <option value="">{zh ? "月" : "월"}</option>{Array.from({ length: 12 }, (_, i) => i + 1).map((mm) => <option key={mm} value={mm}>{mm}{zh ? "月" : "월"}</option>)}
      </select></label>
    <label><span className="sr-only">{zh ? "日" : "일"}</span>
      <select id={`${idPrefix}-day`} className="input-control" required={required} value={d || ""} onChange={(e) => emit(y, m, Number(e.target.value))}>
        <option value="">{zh ? "日" : "일"}</option>{Array.from({ length: daysIn(y, m) }, (_, i) => i + 1).map((dd) => <option key={dd} value={dd}>{dd}{zh ? "日" : "일"}</option>)}
      </select></label>
  </div>;
}

const HOUR_LABELS = ["子 자시", "丑 축시", "丑 축시", "寅 인시", "寅 인시", "卯 묘시", "卯 묘시", "辰 진시", "辰 진시", "巳 사시", "巳 사시", "午 오시", "午 오시", "未 미시", "未 미시", "申 신시", "申 신시", "酉 유시", "酉 유시", "戌 술시", "戌 술시", "亥 해시", "亥 해시", "子 자시"];
/** Hour-only select emitting "HH:00" (the minute rarely changes a chart). */
export function BirthTimeField({ value, onChange, disabled = false, required = true, zh = false, id = "birth-hour" }: {
  value: string; onChange: (time: string) => void; disabled?: boolean; required?: boolean; zh?: boolean; id?: string;
}) {
  const hour = value ? Number(value.slice(0, 2)) : -1;
  return <select id={id} className="input-control" disabled={disabled} required={required && !disabled} value={hour >= 0 ? hour : ""} onChange={(e) => onChange(e.target.value === "" ? "" : `${pad(Number(e.target.value))}:00`)}>
    <option value="">{zh ? "選擇時辰" : "시간 선택"}</option>
    {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{zh ? `${pad(h)}:00–${pad(h)}:59` : `${h < 12 ? "오전" : "오후"} ${h % 12 === 0 ? 12 : h % 12}시 (${pad(h)}:00–${pad(h)}:59) · ${HOUR_LABELS[h].slice(2)}`}</option>)}
  </select>;
}
