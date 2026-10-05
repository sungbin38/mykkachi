"use client";
import { useState, useEffect, useRef } from "react";
import { Sparkles, Download, Copy, LockKeyhole, Loader2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster, toast } from "sonner";
import { SiteHeader, SiteFooter } from "./site";
import { BrandMascot } from "./brand-mascot";
import {
  calculateSaju,
  ELEMENTS,
  KOREAN_CHAR,
  readingText,
  type BirthInput,
  type SajuResult,
} from "@/lib/saju";
import { type Locale } from "@/lib/brand";
import { downloadCard } from "@/lib/cards";
export function ReadingPage({ locale }: { locale: Locale }) {
  const zh = locale === "zh-TW";
  const [input, setInput] = useState<BirthInput>({
    date: "",
    time: "12:00",
    unknown: false,
    region: zh ? "TW" : "KR",
    name: "",
  });
  const [result, setResult] = useState<SajuResult | null>(null);
  const [submitted, setSubmitted] = useState(input);
  const [focus, setFocus] = useState("self");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    try {
      const birth = sessionStorage.getItem("luun-start-birth");
      if (birth) {
        setInput((v) => ({ ...v, date: birth }));
        sessionStorage.removeItem("luun-start-birth");
      }
    } catch {}
    const f = new URLSearchParams(location.search).get("focus");
    if (f && ["self", "love", "work", "daily"].includes(f)) setFocus(f);
  }, []);
  function run(value: BirthInput = input) {
    try {
      setError("");
      const next = calculateSaju(value);
      setSubmitted({ ...value, name: value.name.slice(0, 30) });
      setResult(next);
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      );
      return {
        dayElement: ELEMENTS[next.dayElement].han,
        pillars: next.pillars,
        counts: next.counts,
      };
    } catch (e) {
      const code = e instanceof Error ? e.message : "";
      setError(
        code === "DST_AMBIGUOUS"
          ? zh
            ? "夏令時間切換時段可能不存在或出現兩次，請確認出生記錄。"
            : "서머타임 전환으로 중복되거나 존재하지 않는 시각입니다. 출생 기록을 확인해 주세요."
          : zh
            ? "請確認日期與時間。支援 1970 年以後的陽曆生日。"
            : "날짜와 시간을 확인해 주세요. 1970년 이후 양력 생일을 지원합니다.",
      );
      throw e;
    }
  }
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: { registerTool: (tool: unknown, opts: unknown) => void };
      }
    ).modelContext;
    if (!context) return;
    const life = new AbortController();
    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: "calculate_luun_reading",
            title: "마이까치 사주 계산",
            description:
              "Calculate a free birth chart and show the reading. Birth data stays in the browser.",
            inputSchema: {
              type: "object",
              properties: {
                date: { type: "string" },
                time: { type: "string" },
                region: { type: "string", enum: ["KR", "TW"] },
                unknown: { type: "boolean" },
                name: { type: "string" },
              },
              required: ["date", "region", "unknown"],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false },
            execute: async (value: BirthInput) => {
              if (
                !value ||
                typeof value.date !== "string" ||
                typeof value.unknown !== "boolean" ||
                !["KR", "TW"].includes(value.region)
              )
                throw new Error("Invalid birth information");
              const next = {
                ...value,
                time: value.time || "12:00",
                name:
                  typeof value.name === "string" ? value.name.slice(0, 30) : "",
              };
              setInput(next);
              return run(next);
            },
          },
          { signal: life.signal },
        ),
      ).catch(() => {});
    } catch {}
    return () => life.abort();
  }, []);
  const e = result ? ELEMENTS[result.dayElement] : null;
  const blocks = result ? readingText(result, locale, focus) : [];
  async function share() {
    if (!result || !e) return;
    try {
      await navigator.clipboard.writeText(
        `MY KKACHI · ${e.title[zh ? 1 : 0]}\n${blocks[0].text}\n${location.origin}${zh ? "/zh-TW" : ""}/read`,
      );
      toast.success(
        zh
          ? "已複製，不包含出生資料。"
          : "출생 정보 없이 소개 문구를 복사했어요.",
      );
    } catch {
      toast.error(
        zh
          ? "請使用圖片下載。"
          : "복사 권한을 확인하거나 이미지로 저장해 주세요.",
      );
    }
  }
  async function download() {
    if (!result || !e) return;
    setBusy(true);
    try {
      await downloadCard(
        {
          title: e.title[zh ? 1 : 0],
          body: e.description[zh ? 1 : 0],
          label: zh ? `我的五行 · ${e.han}` : `나의 오행 · ${e.ko}(${e.han})`,
          footer: "MY KKACHI · A little bird, by your side.",
          index: 0,
        },
        "mykkachi-my-reading.png",
      );
      toast.success(zh ? "圖片已儲存" : "결과 카드를 저장했어요.");
    } catch {
      toast.error(
        zh
          ? "下載失敗，請重試。"
          : "다운로드하지 못했어요. 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <SiteHeader locale={locale} />
      <main className="shell">
        <div className="page-heading">
          <p className="eyebrow">
            <Sparkles size={16} />
            {zh ? "YOUR OWN STORY · 免費" : "YOUR OWN STORY · 무료 사주"}
          </p>
          <h1 className="serif">
            {zh ? "你的故事，慢慢讀。" : "나의 이야기, 천천히 읽어볼까요?"}
          </h1>
          <p>
            {zh
              ? "從出生的那一刻，認識自己的五種能量。"
              : "태어난 순간의 여덟 글자에서, 나를 이루는 다섯 가지 기운까지."}
          </p>
        </div>
        <div className="reading-layout">
          <form
            className="panel"
            onSubmit={(event) => {
              event.preventDefault();
              try {
                run();
              } catch {}
            }}
          >
            <h2>{zh ? "出生資料" : "나를 알려주세요"}</h2>
            <label className="field">
              <span className="field-label">
                {zh ? "暱稱（選填）" : "닉네임 (선택)"}
              </span>
              <input
                className="input-control"
                placeholder={zh ? "怎麼稱呼你？" : "어떻게 불러드릴까요?"}
                value={input.name}
                maxLength={30}
                onChange={(e) => setInput({ ...input, name: e.target.value })}
              />
            </label>
            <label className="field">
              <span className="field-label">
                {zh ? "出生日期 · 陽曆" : "생년월일 · 양력"}
              </span>
              <input
                className="input-control"
                type="date"
                required
                min="1970-01-01"
                max={new Date().toISOString().slice(0, 10)}
                value={input.date}
                onChange={(e) => setInput({ ...input, date: e.target.value })}
              />
            </label>
            <div className="field-row">
              <label className="field">
                <span className="field-label">
                  {zh ? "出生時間" : "태어난 시간"}
                </span>
                <input
                  className="input-control"
                  type="time"
                  required={!input.unknown}
                  disabled={input.unknown}
                  value={input.time}
                  onChange={(e) => setInput({ ...input, time: e.target.value })}
                />
              </label>
              <div className="field">
                <label className="field-label" htmlFor="birth-region">
                  {zh ? "出生地區" : "출생 지역"}
                </label>
                <Select
                  value={input.region}
                  onValueChange={(v) =>
                    setInput({ ...input, region: v as "KR" | "TW" })
                  }
                >
                  <SelectTrigger id="birth-region" className="choice-control">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KR">
                      {zh ? "韓國" : "대한민국"}
                    </SelectItem>
                    <SelectItem value="TW">{zh ? "台灣" : "대만"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <label className="checkbox-label">
              <Checkbox
                checked={input.unknown}
                onCheckedChange={(v) => setInput({ ...input, unknown: !!v })}
              />
              {zh ? "我不知道出生時間" : "태어난 시간을 몰라요"}
            </label>
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}
            <button className="primary-button form-submit" type="submit">
              <Sparkles size={17} />
              {zh ? "免費解讀我的八字" : "나의 사주 펼쳐보기"}
            </button>
            <p className="form-subtext">
              <LockKeyhole size={12} className="inline" />{" "}
              {zh
                ? "出生資料只在瀏覽器計算，不傳送至伺服器。1970 年至今的陽曆，韓國或台灣出生。"
                : "출생 정보는 브라우저에서만 계산해요. 1970년 이후 양력·한국/대만 출생을 지원합니다."}
            </p>
          </form>
          <div
            ref={resultRef}
            style={{ scrollMarginTop: 25 }}
            aria-live="polite"
          >
            {!result || !e ? (
              <div className="result-empty">
                <BrandMascot size={200} className="reading-mascot" />
                <span className="tiny-label">A LITTLE BIRD, BY YOUR SIDE</span>
                <h2>
                  {zh
                    ? "每個人，都有自己的節奏。"
                    : "우리는 저마다의 속도로 자라요."}
                </h2>
                <p>
                  {zh
                    ? "填寫出生資訊，看看你的日主、八字與五行分布。"
                    : "출생 정보를 입력하면 나의 일간과 사주 명식, 오행의 분포를 함께 보여드려요."}
                </p>
              </div>
            ) : (
              <div className="panel">
                <div className="result-header">
                  <div>
                    <p className="tiny-label muted">YOUR READING</p>
                    <h2>
                      {submitted.name
                        ? `${submitted.name}${zh ? " 的八字" : "님의 사주"}`
                        : zh
                          ? "我的八字"
                          : "나의 사주"}
                    </h2>
                  </div>
                  <span className="pill">
                    {e.ko} · {e.han}
                  </span>
                </div>
                <p className="result-lead">{e.title[zh ? 1 : 0]}</p>
                <div className="pillars">
                  {result.pillars.map((p, i) => (
                    <div className={`pillar ${i === 2 ? "mine" : ""}`} key={i}>
                      <small>
                        {
                          (zh
                            ? ["年柱", "月柱", "日柱・我", "時柱"]
                            : ["연주", "월주", "일주 · 나", "시주"])[i]
                        }
                      </small>
                      <strong>
                        {p ? p[0] : "—"}
                        <br />
                        {p ? p[1] : "—"}
                      </strong>
                      <span>
                        {p
                          ? zh
                            ? ""
                            : KOREAN_CHAR[p[0]] + KOREAN_CHAR[p[1]]
                          : zh
                            ? "不確定"
                            : "미상"}
                      </span>
                    </div>
                  ))}
                </div>
                {result.termUncertain && (
                  <div className="notice">
                    {zh
                      ? "生日在節氣交接日，出生時間不明，因此未確定的年柱或月柱不列入計算。"
                      : "절입일에 태어나 연주 또는 월주를 확정할 수 없어 해당 기둥은 분포에서 제외했어요."}
                  </div>
                )}
                <h3>{zh ? "五行分布" : "나를 이루는 오행"}</h3>
                <div className="element-bars">
                  {ELEMENTS.map((el, i) => (
                    <div key={el.han} className="element-bar">
                      <span>
                        {Math.round((result.counts[i] / result.total) * 100)}%
                      </span>
                      <div
                        className="element-bar-fill"
                        style={{
                          height: Math.max(
                            3,
                            (result.counts[i] / result.total) * 160,
                          ),
                          background: el.color,
                        }}
                      />
                      <span>{zh ? el.han : `${el.ko} ${el.han}`}</span>
                    </div>
                  ))}
                </div>
                <p className="form-subtext">
                  {zh
                    ? `以已知的 ${result.total} 字平均計數，未含藏干與季節權重。缺少某元素不代表缺陷。`
                    : `확인된 ${result.total}글자의 대표 오행을 같은 비중으로 셌어요. 지장간·계절 가중치는 포함하지 않으며, 적은 오행이 결함을 뜻하지 않아요.`}
                </p>
                {blocks.map((b) => (
                  <section className="reading-paragraph" key={b.key}>
                    <h3>{b.title}</h3>
                    <p>{b.text}</p>
                  </section>
                ))}
                <div className="result-actions">
                  <button
                    className="primary-button"
                    onClick={download}
                    disabled={busy}
                  >
                    {busy ? (
                      <Loader2 className="loading-ring" size={16} />
                    ) : (
                      <Download size={16} />
                    )}{" "}
                    {zh ? "儲存我的卡片" : "나의 카드 저장"}
                  </button>
                  <button className="outline-button" onClick={share}>
                    <Copy size={16} />
                    {zh ? "複製分享文字" : "소개 문구 복사"}
                  </button>
                </div>
                <details className="result-disclaimer">
                  <summary>
                    {zh ? "計算與解讀方式" : "계산 및 해석 기준"}
                  </summary>
                  <p>
                    {zh
                      ? "以 lunar-typescript 1.8.6 為基礎；年、月按 UTC+8 節氣時刻判定，日、時使用出生地標準時，午夜換日（23 時沿用當日日干）。反映歷史夏令時間，不校正經度或真太陽時。解讀為日主五行對應的編輯內容，不是 AI 個別預言或醫療、投資建議。"
                      : "lunar-typescript 1.8.6 기반. 연·월은 UTC+8 절기 시각과 대조하며, 일·시는 출생지 표준시 및 자정 환일 기준(23시 자시는 당일 일간)입니다. 역사적 서머타임을 반영하고, 경도·진태양시 보정은 하지 않습니다. 해석은 일간 오행에 대응하는 편집 콘텐츠로, AI 개인 예언이나 의료·투자 조언이 아닙니다."}
                  </p>
                  <p>
                    {result.unknown
                      ? zh
                        ? "時柱不計算。"
                        : "시간 미상으로 시주는 제외합니다."
                      : `${zh ? "標準時" : "표준시"}: ${result.standardTime}`}
                  </p>
                </details>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter locale={locale} />
      <Toaster position="bottom-center" />
    </>
  );
}
