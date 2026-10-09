"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Files,
  CalendarDays,
  Workflow,
  Search,
  Settings2,
  Globe2,
  Plus,
  ExternalLink,
  RefreshCw,
  Check,
  Clock3,
  Camera as Instagram,
  AtSign,
  BookOpen,
  Sparkles,
  Download,
  Copy,
  Play,
  Loader2,
  ChartNoAxesCombined,
  Leaf,
  ShieldCheck,
  Link2,
  LogOut,
  CalendarCheck,
  Activity,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Toaster, toast } from "sonner";
import { Logo } from "./site";
import {
  CHANNEL_NAMES,
  seoChecks,
  type ContentItem,
  type Channel,
  type ContentStatus,
} from "@/lib/content";
import { TOPICS, getArticle } from "@/lib/knowledge";
import { ORIGIN, localPath, type Locale } from "@/lib/brand";
import { downloadCarousel, type CardSlide } from "@/lib/cards";
import { SocialProfile } from "./social-profile";
import { MASCOT_IMAGE } from "@/lib/brand-assets";
import { BookingsPanel } from "@/components/admin-bookings";
import { TrafficPanel } from "@/components/admin-traffic";
import "./admin.css";

type Section =
  | "overview"
  | "bookings"
  | "traffic"
  | "content"
  | "calendar"
  | "automation"
  | "seo"
  | "brand"
  | "settings";
type Automation = {
  enabled: boolean;
  locale: Locale;
  time: string;
  publishSeo: boolean;
};
type Overview = {
  metrics: {
    day: string;
    event: string;
    source: string;
    locale: string;
    count: number;
  }[];
  jobs: { id: string; started_at: string; summary: string; mode: string }[];
  settings: Automation;
  connections: {
    scheduler: boolean;
    instagram: boolean;
    threads: boolean;
    database?: boolean;
    analytics?: boolean;
  };
  collectedAt: string;
};
const NAV = [
  { id: "bookings", label: "상담 예약", icon: CalendarCheck },
  { id: "overview", label: "대시보드", icon: LayoutDashboard },
  { id: "traffic", label: "방문 분석", icon: Activity },
  { id: "content", label: "콘텐츠 스튜디오", icon: Files },
  { id: "calendar", label: "콘텐츠 캘린더", icon: CalendarDays },
  { id: "automation", label: "자동화 워크플로", icon: Workflow },
  { id: "seo", label: "SEO 관리", icon: Search },
  { id: "brand", label: "브랜드 & 대만 진출", icon: Globe2 },
  { id: "settings", label: "채널 연결", icon: Settings2 },
] as const;
const STATUS: Record<ContentStatus, { name: string; className: string }> = {
  draft: { name: "초안", className: "gray" },
  approved: { name: "검토 완료", className: "blue" },
  scheduled: { name: "예약됨", className: "orange" },
  published: { name: "발행됨", className: "" },
};
const CHANNEL_ICON = { seo: BookOpen, threads: AtSign, instagram: Instagram };
const blank: Overview = {
  metrics: [],
  jobs: [],
  settings: { enabled: false, locale: "ko", time: "09:00", publishSeo: false },
  connections: { scheduler: false, instagram: false, threads: false },
  collectedAt: "",
};
async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok)
    throw new Error(data.error || "요청을 처리하지 못했습니다.");
  return data;
}
const formatTime = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
function ContentTable({ list, onSelect, onCreate }: {
  list: ContentItem[];
  onSelect: (item: ContentItem) => void;
  onCreate: () => void;
}) {
    return list.length ? (
      <Table className="content-table">
        <TableHeader>
          <TableRow>
            <TableHead>콘텐츠</TableHead>
            <TableHead>채널</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>언어</TableHead>
            <TableHead>수정일</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {list.map((i) => {
            const Icon = CHANNEL_ICON[i.channel];
            return (
              <TableRow key={i.id}>
                <TableCell>
                  <button
                    className="content-title"
                    onClick={() => onSelect(i)}
                  >
                    {i.title}
                  </button>
                  <span className="table-sub">{i.keyword}</span>
                  <span className="table-sub mobile-channel">
                    {CHANNEL_NAMES[i.channel]} ·{" "}
                    {i.locale === "ko" ? "한국어" : "繁體中文"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="channel-label">
                    <Icon size={15} />
                    {CHANNEL_NAMES[i.channel]}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`pill ${STATUS[i.status].className}`}>
                    {STATUS[i.status].name}
                  </span>
                </TableCell>
                <TableCell>
                  {i.locale === "ko" ? "한국어" : "繁體中文"}
                </TableCell>
                <TableCell className="table-date">
                  {formatTime(i.updatedAt)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    ) : (
      <div className="studio-empty">
        <Files size={30} />
        <h3>첫 번째 콘텐츠를 기다리고 있어요.</h3>
        <p>주제를 고르면 SEO 글, Threads 문구, 카드뉴스를 함께 준비합니다.</p>
        <button
          className="secondary-button"
          onClick={onCreate}
        >
          <Plus size={15} />
          콘텐츠 만들기
        </button>
      </div>
    );
  }

export function AdminDashboard({ name }: { name: string }) {
  const router = useRouter();
  const [section, setSection] = useState<Section>("bookings"),
    [items, setItems] = useState<ContentItem[]>([]),
    [data, setData] = useState<Overview>(blank),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [generateOpen, setGenerateOpen] = useState(false),
    [generating, setGenerating] = useState(false),
    [topic, setTopic] = useState(TOPICS[0]),
    [locale, setLocale] = useState<Locale>("ko"),
    [channel, setChannel] = useState("all"),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState<ContentItem | null>(null),
    [settings, setSettings] = useState<Automation>(blank.settings),
    [busy, setBusy] = useState(false),
    [unseen, setUnseen] = useState(0),
    [month, setMonth] = useState(
      () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    );
  const loadData = useCallback((signal?: AbortSignal) =>
      Promise.all([
        api<{ items: ContentItem[] }>("/api/admin/content", { signal }),
        api<Overview>("/api/admin/overview", { signal }),
      ]).then(([c, o]) => {
      if (signal?.aborted) return;
      setError("");
      setItems(c.items);
      setData(o);
      setSettings(o.settings);
      api<{ unseen: number }>("/api/admin/bookings?summary=1").then((b) => setUnseen(b.unseen)).catch(() => {});
    }).catch((e: unknown) => {
      if (signal?.aborted) return;
      setItems([]);
      setData(blank);
      setError(
        e instanceof Error ? e.message : "데이터를 불러오지 못했습니다.",
      );
    }).finally(() => {
      if (!signal?.aborted) setLoading(false);
    }), []);
  async function refresh() {
    setLoading(true);
    setError("");
    await loadData();
  }
  useEffect(() => {
    const controller = new AbortController();
    void loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);
  const counts = useMemo(
    () => ({
      views: data.metrics
        .filter((m) => m.event === "page_view")
        .reduce((a, b) => a + b.count, 0),
      readings: data.metrics
        .filter((m) => m.event === "reading_complete")
        .reduce((a, b) => a + b.count, 0),
      ready: items.filter(
        (i) => i.status === "approved" || i.status === "scheduled",
      ).length,
      published: items.filter((i) => i.channel === "seo" && i.status === "published").length,
    }),
    [data, items],
  );
  const filtered = items.filter(
    (i) =>
      (channel === "all" || i.channel === channel) &&
      (!search || i.title.includes(search) || i.keyword.includes(search)),
  );
  const seoItems = items.filter((i) => i.channel === "seo");
  async function generate() {
    setGenerating(true);
    try {
      const result = await api<{ created: boolean; items: ContentItem[] }>(
        "/api/admin/content",
        { method: "POST", body: JSON.stringify({ topic, locale }) },
      );
      await refresh();
      setGenerateOpen(false);
      setSection("content");
      toast.success(
        result.created
          ? "세 채널의 초안을 준비했어요."
          : "이미 준비된 주제입니다. 기존 초안을 이어서 편집하세요.",
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }
  async function saveSettings() {
    setBusy(true);
    try {
      await api("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      await refresh();
      toast.success("자동화 규칙을 저장했어요.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function run() {
    setBusy(true);
    try {
      const r = await api<{ summary: string }>("/api/admin/run", {
        method: "POST",
      });
      await refresh();
      toast.success(r.summary);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const go = (id: Section) => {
    setSection(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "244px" } as React.CSSProperties}
    >
      <Sidebar className="studio-sidebar">
        <SidebarHeader className="studio-brand">
          <Link href="/" aria-label="돈쌤 홈페이지">
            <Logo />
          </Link>
          <span className="studio-word">STUDIO</span>
        </SidebarHeader>
        <SidebarContent>
          <div className="studio-workspace">
            <span className="workspace-icon">
              <Leaf size={19} />
            </span>
            <div>
              <strong>돈쌤 워크스페이스</strong>
              <p>시간이 걸리더라도, 제대로 봐드리겠습니다</p>
            </div>
          </div>
          <SidebarGroup>
            <SidebarGroupLabel>WORKSPACE</SidebarGroupLabel>
            <SidebarMenu>
              {NAV.slice(0, 7).map((n) => (
                <SidebarMenuItem key={n.id}>
                  <SidebarMenuButton
                    isActive={section === n.id}
                    onClick={() => go(n.id)}
                    className="studio-nav-button"
                  >
                    <n.icon />
                    <span>{n.label}</span>
                    {n.id === "content" && items.length > 0 && (
                      <span className="nav-count">{items.length}</span>
                    )}
                    {n.id === "bookings" && unseen > 0 && (
                      <span className="nav-count">{unseen}</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>GROWTH & SETTINGS</SidebarGroupLabel>
            <SidebarMenu>
              {NAV.slice(7).map((n) => (
                <SidebarMenuItem key={n.id}>
                  <SidebarMenuButton
                    isActive={section === n.id}
                    onClick={() => go(n.id)}
                    className="studio-nav-button"
                  >
                    <n.icon />
                    <span>{n.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="sidebar-tip">
            <span>✧ LITTLE BY LITTLE</span>
            <p>
              좋은 이야기가 쌓이면,
              <br />
              새로운 인연이 찾아와요.
            </p>
          </div>
          <div className="admin-user">
            <span className="admin-avatar">L</span>
            <div>
              <strong>{name}</strong>
              <p>브랜드 관리자</p>
            </div>
            <button
              type="button"
              className="studio-nav-button"
              aria-label="로그아웃"
              title="로그아웃"
              onClick={async () => {
                await fetch("/api/admin/logout", { method: "POST" });
                router.push("/admin/login");
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="studio-main">
        <header className="studio-topbar">
          <div className="topbar-breadcrumb">
            <SidebarTrigger />
            <span>워크스페이스</span>
            <span className="muted">/</span>
            <strong>{NAV.find((n) => n.id === section)?.label}</strong>
          </div>
          <div className="topbar-actions">
            <span className="country-tag">
              <Globe2 size={14} />
              한국 · KST
            </span>
            <a href="/" target="_blank" className="text-link" rel="noreferrer">
              사이트 보기 <ExternalLink size={14} />
            </a>
          </div>
        </header>
        <main className="studio-body">
          <div className="studio-heading">
            <div>
              <span className="tiny-label muted">
                {section === "overview"
                  ? "YOUR BRAND, IN BLOOM"
                  : "DON SSAEM CONTENT STUDIO"}
              </span>
              <h1>
                {section === "overview"
                  ? "돈쌤의 오늘을 한눈에."
                  : NAV.find((n) => n.id === section)?.label}
              </h1>
              <p>
                {
                  {
                    overview: "콘텐츠를 쌓고, 새로운 인연을 연결하세요.",
                    bookings: "상담 시간을 열고, 입금을 확인하고, 들어온 이야기를 살피세요.",
                    traffic: "누가 언제 어디서 들어와 어떻게 예약까지 갔는지 보세요.",
                    content:
                      "하나의 이야기, 세 개의 채널. 돈쌤의 목소리로 전해요.",
                    calendar: "발행을 준비하는 콘텐츠의 일정을 확인하세요.",
                    automation:
                      "반복되는 준비는 줄이고, 중요한 검토에 집중하세요.",
                    seo: "검색에서 시작되는 첫 만남을 준비하세요.",
                    brand: "한국에서 시작해, 대만의 일상으로.",
                    settings: "콘텐츠가 사람들에게 닿는 길을 연결하세요.",
                  }[section]
                }
              </p>
            </div>
            <div className="heading-actions">
              <button
                className="icon-button"
                onClick={refresh}
                disabled={loading}
                aria-label="새로고침"
              >
                <RefreshCw
                  size={17}
                  className={loading ? "loading-ring" : ""}
                />
              </button>
              <button
                className="primary-button"
                onClick={() => setGenerateOpen(true)}
                disabled={loading || !!error}
              >
                <Plus size={17} />
                콘텐츠 만들기
              </button>
            </div>
          </div>
          {error && (
            <div
              className="error-message"
              role="alert"
              style={{ marginBottom: 22 }}
            >
              {error} <button onClick={refresh}>다시 불러오기</button>
            </div>
          )}
          {loading ? (
            <div className="studio-empty">
              <Loader2 className="loading-ring" />
              <p>돈쌤의 기록을 불러오고 있어요.</p>
            </div>
          ) : error && section !== "brand" ? (
            <>
              <div className="studio-empty">
                <Link2 size={30} />
                <h2>운영 데이터를 불러오지 못했어요.</h2>
                <p>연결이 확인되면 저장된 콘텐츠와 실제 집계를 표시합니다.</p>
                <button className="secondary-button" onClick={refresh}>
                  <RefreshCw size={15} /> 다시 연결하기
                </button>
              </div>
              <SocialProfile />
            </>
          ) : (
            <>
              {section === "overview" && (
                <>
                  <SocialProfile
                    onCreate={() => setGenerateOpen(true)}
                    onAutomation={() => go("automation")}
                  />
                  <div className="welcome-banner">
                    <div>
                      <span className="pill">작은 시작, 꾸준한 성장</span>
                      <h2>
                        {items.length
                          ? "준비한 이야기를, 세상과 만날 이야기로."
                          : "돈쌤의 첫 이야기를 시작해볼까요?"}
                      </h2>
                      <p>
                        {items.length
                          ? "초안을 검토하고, 채널에 맞게 다듬어보세요."
                          : "주제 하나를 골라 세 채널의 콘텐츠 패키지를 만들어보세요."}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        items.length ? go("content") : setGenerateOpen(true)
                      }
                      className="welcome-button"
                    >
                      {items.length ? "초안 살펴보기" : "첫 패키지 만들기"}{" "}
                      <Sparkles size={17} />
                    </button>
                    <span className="welcome-star" aria-hidden="true">
                      ✧
                    </span>
                  </div>
                  <div className="metric-grid">
                    {[
                      {
                        label: "페이지 조회",
                        value: data.connections.analytics ? counts.views : null,
                        icon: ChartNoAxesCombined,
                        note: data.connections.analytics ? "최근 30일 · 익명 이벤트" : "방문 집계 미연결",
                      },
                      {
                        label: "사주 계산 완료",
                        value: data.connections.analytics ? counts.readings : null,
                        icon: Sparkles,
                        note: data.connections.analytics ? "최근 30일 · 실행 횟수" : "실행 집계 미연결",
                      },
                      {
                        label: "준비된 콘텐츠",
                        value: counts.ready,
                        icon: Files,
                        note: "검토 완료 + 예약",
                      },
                      {
                        label: "발행한 콘텐츠",
                        value: counts.published,
                        icon: BookOpen,
                        note: "스튜디오에서 발행한 SEO 글",
                      },
                    ].map((m) => (
                      <div className="metric-card" key={m.label}>
                        <div>
                          <span>{m.label}</span>
                          <m.icon size={17} />
                        </div>
                        <strong className="en">
                          {m.value === null ? "—" : m.value.toLocaleString()}
                        </strong>
                        <p>{m.note}</p>
                      </div>
                    ))}
                  </div>
                  <div className="studio-two-col">
                    <section className="studio-panel">
                      <div className="panel-heading">
                        <h2>채널별 유입</h2>
                        <span>최근 30일 · 페이지 조회</span>
                      </div>
                      {data.connections.analytics ? <><div className="channel-traffic">
                        {[
                          { id: "google", label: "Google", color: "#779b75" },
                          { id: "naver", label: "Naver", color: "#aec397" },
                          { id: "threads", label: "Threads", color: "#44625c" },
                          {
                            id: "instagram",
                            label: "Instagram",
                            color: "#d39379",
                          },
                          {
                            id: "direct",
                            label: "직접 / 기타",
                            color: "#bdc6b9",
                          },
                        ].map((c) => {
                          const count = data.metrics
                            .filter(
                              (m) =>
                                m.source === c.id && m.event === "page_view",
                            )
                            .reduce((a, b) => a + b.count, 0);
                          return (
                            <div className="traffic-row" key={c.id}>
                              <span>{c.label}</span>
                              <div className="traffic-track">
                                <div
                                  style={{
                                    width: `${counts.views ? (count / counts.views) * 100 : 0}%`,
                                    background: c.color,
                                  }}
                                />
                              </div>
                              <strong className="en">{count}</strong>
                            </div>
                          );
                        })}
                      </div>
                      <p className="panel-footnote">
                        {counts.views ? "UTM·리퍼러 기반 조회 집계입니다. 고유 방문자 수와 다를 수 있어요." : "실제 조회 기록이 쌓이면 채널별 유입을 표시합니다."}
                      </p>
                      </> : (
                        <div className="quiet-empty">
                          <ChartNoAxesCombined size={29} />
                          <p>방문 집계 연결을 기다리고 있어요.</p>
                        </div>
                      )}
                    </section>
                    <section className="studio-panel">
                      <div className="panel-heading">
                        <h2>발행 준비</h2>
                        <span className="pill orange">
                          {items.filter((i) => i.status === "draft").length}개
                          검토 대기
                        </span>
                      </div>
                      {items.length ? (
                        <div className="up-next">
                          {items
                            .filter((i) => i.status !== "published")
                            .slice(0, 3)
                            .map((i) => (
                              <button key={i.id} onClick={() => setSelected(i)}>
                                <span className={`channel-avatar ${i.channel}`}>
                                  {i.channel === "seo" ? (
                                    <BookOpen size={18} />
                                  ) : i.channel === "threads" ? (
                                    <AtSign size={18} />
                                  ) : (
                                    <Instagram size={18} />
                                  )}
                                </span>
                                <span>
                                  <strong>{i.title}</strong>
                                  <small>
                                    {CHANNEL_NAMES[i.channel]} ·{" "}
                                    {i.locale === "ko" ? "한국어" : "繁體中文"}
                                  </small>
                                </span>
                              </button>
                            ))}
                        </div>
                      ) : (
                        <div className="quiet-empty">
                          <CalendarDays size={29} />
                          <p>아직 준비된 콘텐츠가 없어요.</p>
                          <button
                            className="text-link"
                            onClick={() => setGenerateOpen(true)}
                          >
                            새로운 이야기 준비하기
                          </button>
                        </div>
                      )}
                    </section>
                  </div>
                  <div className="channel-status-grid">
                    {(["seo", "threads", "instagram"] as Channel[]).map((c) => {
                      const Icon = CHANNEL_ICON[c];
                      return (
                        <button
                          className="channel-status"
                          key={c}
                          onClick={() => go(c === "seo" ? "seo" : "settings")}
                        >
                          <span className={`channel-avatar ${c}`}>
                            <Icon size={21} />
                          </span>
                          <div>
                            <h3>{CHANNEL_NAMES[c]}</h3>
                            <p>
                              {c === "seo"
                                ? `저장된 원고 ${seoItems.length}편`
                                : c === "threads"
                                  ? "게시글 작성 · 문구 복사"
                                  : "1080 × 1350 · 5장 카드뉴스"}
                            </p>
                          </div>
                          <span className={`pill ${c === "seo" ? "" : "gray"}`}>
                            {c === "seo" ? "콘텐츠 관리" : data.connections[c] ? "계정 연결됨" : "미연결"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <section className="studio-panel">
                    <div className="panel-heading">
                      <h2>최근 콘텐츠</h2>
                      <button
                        className="text-link"
                        onClick={() => go("content")}
                      >
                        전체 보기
                      </button>
                    </div>
                    <ContentTable list={items.slice(0, 5)} onSelect={setSelected} onCreate={() => setGenerateOpen(true)} />
                  </section>
                </>
              )}
              {section === "content" && (
                <section className="studio-panel">
                  <div className="content-toolbar">
                    <div className="journal-filters">
                      {[
                        ["all", "전체"],
                        ["seo", "SEO 저널"],
                        ["threads", "Threads"],
                        ["instagram", "Instagram"],
                      ].map(([id, label]) => (
                        <button
                          className={`filter-button ${channel === id ? "active" : ""}`}
                          key={id}
                          onClick={() => setChannel(id)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                    <div className="search-field">
                      <Search size={17} />
                      <input
                        aria-label="콘텐츠 검색"
                        placeholder="제목, 키워드 검색"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <ContentTable list={filtered} onSelect={setSelected} onCreate={() => setGenerateOpen(true)} />
                  <p className="panel-footnote">
                    자동 생성은 편집부가 준비한 주제별 원고를 사용합니다. 새로
                    생성한 문구는 발행 전 직접 확인하세요.
                  </p>
                </section>
              )}
              {section === "calendar" && (
                <section className="studio-panel">
                  <div className="panel-heading">
                    <h2>
                      {month.getFullYear()}년 {month.getMonth() + 1}월
                    </h2>
                    <div className="inline-actions">
                      <button
                        className="outline-button"
                        onClick={() =>
                          setMonth(
                            new Date(
                              month.getFullYear(),
                              month.getMonth() - 1,
                              1,
                            ),
                          )
                        }
                      >
                        이전 달
                      </button>
                      <button
                        className="outline-button"
                        onClick={() =>
                          setMonth(
                            new Date(
                              month.getFullYear(),
                              month.getMonth() + 1,
                              1,
                            ),
                          )
                        }
                      >
                        다음 달
                      </button>
                    </div>
                  </div>
                  <div className="calendar-grid">
                    {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                      <div className="calendar-day-name" key={d}>
                        {d}
                      </div>
                    ))}
                    {Array.from({ length: month.getDay() }, (_, i) => (
                      <div className="calendar-cell empty" key={"e" + i} />
                    ))}
                    {Array.from(
                      {
                        length: new Date(
                          month.getFullYear(),
                          month.getMonth() + 1,
                          0,
                        ).getDate(),
                      },
                      (_, i) => {
                        const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
                        const scheduled = items.filter(
                          (c) =>
                            c.scheduledAt &&
                            new Intl.DateTimeFormat("sv-SE", {
                              timeZone: "Asia/Seoul",
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            }).format(new Date(c.scheduledAt)) === key,
                        );
                        return (
                          <div className="calendar-cell" key={i}>
                            <span>{i + 1}</span>
                            {scheduled.map((c) => (
                              <button key={c.id} onClick={() => setSelected(c)}>
                                {c.title}
                              </button>
                            ))}
                          </div>
                        );
                      },
                    )}
                  </div>
                  <p className="panel-footnote">
                    서울 시간 기준입니다. SEO 글을 검토 완료한 뒤 날짜를
                    지정하면 일정에 나타납니다. 실행기가 연결되기 전에는 자동
                    발행되지 않습니다.
                  </p>
                </section>
              )}
              {section === "automation" && (
                <>
                  <div className="workflow-strip">
                    {[
                      ["01", "주제 선택", "아직 만들지 않은 주제"],
                      ["02", "채널별 초안", "SEO · Threads · 카드뉴스"],
                      ["03", "관리자 검토", "문구 확인 후 검토 완료"],
                      ["04", "발행 / 내보내기", "SEO 발행 · SNS 파일 준비"],
                    ].map(([n, t, d]) => (
                      <div key={n}>
                        <span>{n}</span>
                        <h3>{t}</h3>
                        <p>{d}</p>
                      </div>
                    ))}
                  </div>
                  <div className="studio-two-col">
                    <section className="studio-panel">
                      <div className="panel-heading">
                        <h2>자동화 규칙</h2>
                        <span
                          className={`pill ${data.connections.scheduler ? "blue" : "orange"}`}
                        >
                          {data.connections.scheduler
                            ? "실행 키 설정됨"
                            : "실행기 미연결"}
                        </span>
                      </div>
                      <div className="setting-row">
                        <div>
                          <h3>하루 한 주제, 초안 만들기</h3>
                          <p>아직 준비하지 않은 주제를 순서대로 사용해요.</p>
                        </div>
                        <Switch
                          aria-label="매일 초안 생성"
                          checked={settings.enabled}
                          onCheckedChange={(enabled) =>
                            setSettings({ ...settings, enabled })
                          }
                        />
                      </div>
                      <div className="field-row">
                        <label className="field">
                          <span className="field-label">
                            실행 기준 시간 · KST
                          </span>
                          <input
                            className="input-control"
                            type="time"
                            value={settings.time}
                            onChange={(e) =>
                              setSettings({ ...settings, time: e.target.value })
                            }
                          />
                        </label>
                        <div className="field">
                          <label className="field-label" htmlFor="auto-locale">
                            콘텐츠 언어
                          </label>
                          <Select
                            value={settings.locale}
                            onValueChange={(locale) =>
                              setSettings({
                                ...settings,
                                locale: locale as Locale,
                              })
                            }
                          >
                            <SelectTrigger
                              id="auto-locale"
                              className="choice-control"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ko">한국어</SelectItem>
                              <SelectItem value="zh-TW">
                                繁體中文 · 대만
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="setting-row">
                        <div>
                          <h3>검토된 SEO 글 예약 발행</h3>
                          <p>검토 완료 후 예약한 글만 발행해요.</p>
                        </div>
                        <Switch
                          aria-label="SEO 예약 발행"
                          checked={settings.publishSeo}
                          onCheckedChange={(publishSeo) =>
                            setSettings({ ...settings, publishSeo })
                          }
                        />
                      </div>
                      <div className="notice">
                        규칙 저장만으로 백그라운드 실행이 시작되지는 않습니다.
                        실행기를 연결하거나 ‘지금 실행’을 눌러 처리하세요. SNS는
                        자동 게시하지 않습니다.
                      </div>
                      <div className="inline-actions" style={{ marginTop: 20 }}>
                        <button
                          className="primary-button"
                          onClick={saveSettings}
                          disabled={busy}
                        >
                          규칙 저장
                        </button>
                        <button
                          className="outline-button"
                          onClick={run}
                          disabled={busy}
                        >
                          <Play size={15} />
                          저장된 규칙 지금 실행
                        </button>
                      </div>
                    </section>
                    <section className="studio-panel">
                      <div className="panel-heading">
                        <h2>실행 기록</h2>
                        <Clock3 size={17} />
                      </div>
                      {data.jobs.length ? (
                        <div className="job-log">
                          {data.jobs.map((j) => (
                            <div key={j.id}>
                              <span className="job-check">
                                <Check size={14} />
                              </span>
                              <div>
                                <h3>{j.summary}</h3>
                                <p>
                                  {formatTime(j.started_at)} ·{" "}
                                  {j.mode === "manual"
                                    ? "직접 실행"
                                    : "예약 실행"}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="quiet-empty">
                          <Workflow size={32} />
                          <p>아직 실행 기록이 없어요.</p>
                        </div>
                      )}
                    </section>
                  </div>
                </>
              )}
              {section === "seo" && (
                <>
                  <div className="seo-summary">
                    <div>
                      <ShieldCheck size={28} />
                      <h2>검색에 읽히는 기본 구조를 갖췄어요.</h2>
                      <p>
                        서버에서 읽히는 본문 · 고유 메타 정보 · 언어별 URL ·
                        hreflang · Article 구조화 데이터
                      </p>
                    </div>
                    <div className="inline-actions">
                      <a
                        className="outline-button"
                        href="/sitemap.xml"
                        target="_blank"
                        rel="noreferrer"
                      >
                        사이트맵
                      </a>
                      <a
                        className="outline-button"
                        href="/robots.txt"
                        target="_blank"
                        rel="noreferrer"
                      >
                        robots.txt
                      </a>
                    </div>
                  </div>
                  <div className="notice" style={{ marginBottom: 22 }}>
                    저장한 SEO 원고의 준비 상태를 확인하세요. 실제 검색 노출과
                    유입은 검색 도구를 연결한 뒤 확인할 수 있습니다.
                  </div>
                  <section className="studio-panel">
                    <div className="panel-heading">
                      <h2>콘텐츠 검색 준비도</h2>
                      <span>한국어 · 번체 중국어</span>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>페이지 / 키워드</TableHead>
                          <TableHead>언어</TableHead>
                          <TableHead>원고 체크</TableHead>
                          <TableHead>확인</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {seoItems.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4}>
                              <div className="quiet-empty">
                                <BookOpen size={29} />
                                <p>아직 저장된 SEO 원고가 없습니다.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        {seoItems.map((v) => {
                            const checks = seoChecks(v);
                            return (
                              <TableRow key={v.id}>
                                <TableCell>
                                  <strong>{v.title}</strong>
                                  <span className="table-sub">{v.keyword}</span>
                                </TableCell>
                                <TableCell>
                                  {v.locale === "ko" ? "한국어" : "繁體中文"}
                                </TableCell>
                                <TableCell>
                                  <span className="pill">
                                    {checks.filter((c) => c.ok).length} /{" "}
                                    {checks.length}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {v.status === "published" ? <a
                                    className="text-link"
                                    href={localPath(v.locale, "/journal/" + v.slug)}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    페이지 열기 <ExternalLink size={13} />
                                  </a> : <button className="text-link" onClick={() => setSelected(v)}>원고 검토</button>}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                    <p className="panel-footnote">
                      저장된 원고만 점검합니다. 기본 예시 원고는 운영 데이터에 포함하지 않습니다.
                    </p>
                  </section>
                </>
              )}
              {section === "bookings" && <BookingsPanel onSeen={() => setUnseen(0)} />}
              {section === "traffic" && <TrafficPanel />}
              {section === "brand" && <BrandPanel />}
              {section === "settings" && (
                <>
                  <div className="connection-grid">
                    {[
                      {
                        name: "돈쌤 SEO 저널",
                        icon: BookOpen,
                        status: "사이트 연결됨",
                        copy: "검토 완료한 콘텐츠를 저널에 바로 발행할 수 있어요.",
                        meta: "/journal · /zh-TW/journal",
                      },
                      {
                        name: "Threads",
                        icon: AtSign,
                        status: "계정 연결 필요",
                        copy: "@mykkachi를 추천합니다. 앱 등록과 계정 승인을 마친 뒤 Threads API 연결이 필요해요.",
                        meta: "현재: 글 생성 · 복사 · UTM 링크",
                      },
                      {
                        name: "Instagram",
                        icon: Instagram,
                        status: "계정 연결 필요",
                        copy: "비즈니스/크리에이터 계정과 Meta 앱 승인이 필요해요. 계정 이름의 사용 가능 여부는 직접 확인해야 합니다.",
                        meta: "현재: 5장 PNG ZIP · 캡션 다운로드",
                      },
                    ].map((c) => (
                      <section
                        className="studio-panel connection-card"
                        key={c.name}
                      >
                        <c.icon size={30} />
                        <h2>{c.name}</h2>
                        <span
                          className={`pill ${c.name.includes("SEO") ? "" : "orange"}`}
                        >
                          {c.status}
                        </span>
                        <p>{c.copy}</p>
                        <span className="connection-meta">{c.meta}</span>
                      </section>
                    ))}
                  </div>
                  <section className="studio-panel" style={{ marginTop: 24 }}>
                    <div className="panel-heading">
                      <h2>예약 실행기 연결</h2>
                      <span className="pill orange">외부 스케줄러 필요</span>
                    </div>
                    <p className="muted">
                      배포 환경에 <code>AUTOMATION_KEY</code>를 비밀 값으로
                      설정하고, 스케줄러에서 아래 경로를 주기적으로 호출하면
                      저장한 규칙을 실행합니다. 하루 초안 생성은 중복 실행을
                      막고, 예약 SEO 글은 예정 시각이 지난 경우에만 발행합니다.
                    </p>
                    <div className="endpoint-code">
                      POST {ORIGIN}/api/automation/run
                      <br />
                      X-Luun-Job-Key: [서버에 설정한 비밀 값]
                    </div>
                    <p className="panel-footnote">
                      권장 실행 간격: 15분. 토큰은 웹 화면이나 저장소에 입력하지
                      말고 배포 환경의 비밀 값으로 보관하세요.
                    </p>
                  </section>
                  <section className="studio-panel" style={{ marginTop: 24 }}>
                    <div className="panel-heading">
                      <h2>유입 링크</h2>
                      <Link2 size={17} />
                    </div>
                    {["instagram", "threads"].map((c) => (
                      <div className="utm-row" key={c}>
                        <strong>
                          {c === "instagram"
                            ? "Instagram 프로필"
                            : "Threads 프로필"}
                        </strong>
                        <code>
                          {ORIGIN}/?utm_source={c}
                          &utm_medium=social&utm_campaign=profile
                        </code>
                        <button
                          className="icon-button"
                          aria-label={c + " 유입 링크 복사"}
                          onClick={() =>
                            navigator.clipboard
                              .writeText(
                                `${ORIGIN}/?utm_source=${c}&utm_medium=social&utm_campaign=profile`,
                              )
                              .then(() => toast.success("링크를 복사했어요."))
                              .catch(() =>
                                toast.error("복사 권한을 확인해 주세요."),
                              )
                          }
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    ))}
                  </section>
                </>
              )}
            </>
          )}
          <footer className="studio-footer">
            <span>DON SSAEM STUDIO · 작은 이야기들이, 더 큰 인연으로.</span>
            <span>Asia/Seoul · 실제 기록만 표시</span>
          </footer>
        </main>
      </SidebarInset>
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="generate-dialog">
          <DialogHeader>
            <DialogTitle>하나의 주제, 세 개의 이야기.</DialogTitle>
            <DialogDescription>
              돈쌤 편집부의 주제별 원고를 바탕으로 채널에 맞는 초안을 만듭니다.
            </DialogDescription>
          </DialogHeader>
          <label className="field-label" htmlFor="generate-topic">
            이야기할 주제
          </label>
          <Select value={topic} onValueChange={setTopic}>
            <SelectTrigger id="generate-topic" className="choice-control">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TOPICS.map((t) => (
                <SelectItem value={t} key={t}>
                  {getArticle(t, "ko")!.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <label className="field-label" htmlFor="generate-locale">
            언어
          </label>
          <Select value={locale} onValueChange={(l) => setLocale(l as Locale)}>
            <SelectTrigger id="generate-locale" className="choice-control">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ko">한국어 · 대한민국</SelectItem>
              <SelectItem value="zh-TW">繁體中文 · 台灣</SelectItem>
            </SelectContent>
          </Select>
          <div className="generation-includes">
            <span>
              <BookOpen size={17} />
              SEO 저널 1편
            </span>
            <span>
              <AtSign size={17} />
              Threads 글 1개
            </span>
            <span>
              <Instagram size={17} />
              카드뉴스 5장
            </span>
          </div>
          <p className="panel-footnote">
            같은 언어·주제의 패키지가 있으면 기존 초안을 사용합니다. 자동으로
            게시되지는 않아요.
          </p>
          <button
            className="primary-button"
            onClick={generate}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="loading-ring" size={17} />
            ) : (
              <Sparkles size={17} />
            )}{" "}
            {generating ? "초안을 준비하고 있어요" : "콘텐츠 패키지 만들기"}
          </button>
        </DialogContent>
      </Dialog>
      <Sheet open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <SheetContent className="editor-sheet">
          {selected && (
            <ContentEditor
              key={selected.id}
              item={selected}
              onSaved={async (updated) => {
                setSelected(updated);
                await refresh();
              }}
            />
          )}
        </SheetContent>
      </Sheet>
      <Toaster position="bottom-right" richColors />
    </SidebarProvider>
  );
}

function ContentEditor({
  item,
  onSaved,
}: {
  item: ContentItem;
  onSaved: (item: ContentItem) => Promise<void>;
}) {
  const [edit, setEdit] = useState(item),
    [busy, setBusy] = useState(false),
    [card, setCard] = useState(0),
    [schedule, setSchedule] = useState("");
  const checks = seoChecks(edit);
  const slide = edit.slides[card];
  const changed =
    edit.title !== item.title ||
    edit.body !== item.body ||
    edit.excerpt !== item.excerpt ||
    JSON.stringify(edit.slides) !== JSON.stringify(item.slides);
  async function save(status: ContentStatus) {
    setBusy(true);
    try {
      const scheduledAt =
        status === "scheduled" && schedule
          ? new Date(schedule + ":00+09:00").toISOString()
          : null;
      const result = await api<{
        updatedAt: string;
        status: ContentStatus;
        scheduledAt: string | null;
      }>(`/api/admin/content/${edit.id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...edit, status, scheduledAt }),
      });
      const next = { ...edit, ...result };
      setEdit(next);
      await onSaved(next);
      toast.success(
        status === "published"
          ? "저널에 발행했어요."
          : status === "scheduled"
            ? "발행 일정을 저장했어요. 실행기 연결 상태를 확인해 주세요."
            : status === "approved"
              ? "검토 완료로 저장했어요."
              : "초안을 저장했어요.",
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function exportCards() {
    setBusy(true);
    try {
      await downloadCarousel(
        edit.slides,
        edit.body,
        `mykkachi-${edit.locale}-${edit.slug}`,
      );
      toast.success("5장 PNG와 캡션을 저장했어요.");
    } catch (e) {
      toast.error(
        e instanceof Error && e.message.includes("long")
          ? "카드 문구가 너무 깁니다. 문장을 줄인 뒤 다시 저장해 주세요."
          : "내보내지 못했어요. 다시 시도해 주세요.",
      );
    } finally {
      setBusy(false);
    }
  }
  function updateSlide(key: keyof CardSlide, value: string) {
    setEdit({
      ...edit,
      slides: edit.slides.map((s, i) =>
        i === card ? { ...s, [key]: value } : s,
      ),
    });
  }
  return (
    <>
      <SheetHeader>
        <SheetTitle>{CHANNEL_NAMES[edit.channel]} 편집</SheetTitle>
        <SheetDescription>
          {edit.locale === "ko" ? "한국어" : "繁體中文"} · {edit.keyword} ·{" "}
          {STATUS[edit.status].name}
        </SheetDescription>
      </SheetHeader>
      <div className="editor-inner">
        <Tabs defaultValue="edit">
          <TabsList className="editor-tabs">
            <TabsTrigger value="edit">원고 편집</TabsTrigger>
            <TabsTrigger value="preview">미리보기</TabsTrigger>
            {edit.channel === "seo" && (
              <TabsTrigger value="seo">SEO 체크</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="edit">
            <label className="field">
              <span className="field-label">제목</span>
              <input
                className="input-control"
                maxLength={150}
                value={edit.title}
                onChange={(e) => setEdit({ ...edit, title: e.target.value })}
              />
            </label>
            {edit.channel === "seo" && (
              <label className="field">
                <span className="field-label">검색 설명</span>
                <textarea
                  className="input-control"
                  rows={3}
                  style={{ height: 95 }}
                  maxLength={300}
                  value={edit.excerpt}
                  onChange={(e) =>
                    setEdit({ ...edit, excerpt: e.target.value })
                  }
                />
              </label>
            )}
            <label className="field">
              <span className="field-label">
                {edit.channel === "instagram" ? "게시물 캡션" : "본문"}{" "}
                <span className="muted">· {edit.body.length}자</span>
              </span>
              <textarea
                className="input-control editor-body"
                value={edit.body}
                maxLength={18000}
                onChange={(e) => setEdit({ ...edit, body: e.target.value })}
              />
            </label>
            {edit.channel === "threads" && edit.body.length > 500 && (
              <div className="notice">
                500자를 넘습니다. 하나의 게시물에 넣으려면 문구를 줄이거나
                게시물을 나눠주세요.
              </div>
            )}
            {edit.channel === "instagram" && (
              <>
                <div className="card-pagination">
                  {edit.slides.map((s, i) => (
                    <button
                      key={i}
                      className={card === i ? "active" : ""}
                      onClick={() => setCard(i)}
                    >
                      {i + 1}장
                    </button>
                  ))}
                </div>
                <label className="field">
                  <span className="field-label">카드 제목</span>
                  <textarea
                    className="input-control"
                    style={{ height: 90 }}
                    maxLength={150}
                    value={slide?.title || ""}
                    onChange={(e) => updateSlide("title", e.target.value)}
                  />
                </label>
                <label className="field">
                  <span className="field-label">카드 본문</span>
                  <textarea
                    className="input-control"
                    style={{ height: 160 }}
                    maxLength={600}
                    value={slide?.body || ""}
                    onChange={(e) => updateSlide("body", e.target.value)}
                  />
                </label>
              </>
            )}
          </TabsContent>
          <TabsContent value="preview">
            {edit.channel === "instagram" ? (
              <>
                <div className="card-pagination">
                  {edit.slides.map((s, i) => (
                    <button
                      key={i}
                      className={card === i ? "active" : ""}
                      onClick={() => setCard(i)}
                    >
                      {i + 1}장
                    </button>
                  ))}
                </div>
                <div className={`instagram-preview palette-${card % 3}`}>
                  <Logo />
                  <p className="tiny-label">{slide?.label}</p>
                  <h2>{slide?.title}</h2>
                  <div className="card-rule" />
                  <p className="card-body">{slide?.body}</p>
                  <small>{slide?.footer}</small>
                </div>
                <p className="panel-footnote">
                  내보내기: 1080 × 1350 PNG · 5장 + 캡션
                </p>
              </>
            ) : (
              <div className="content-preview">
                <span className="tiny-label">
                  {edit.channel === "seo" ? "DON SSAEM JOURNAL" : "@MYKKACHI"}
                </span>
                <h2>{edit.title}</h2>
                {edit.body
                  .split("\n\n")
                  .map((p, i) =>
                    p.startsWith("## ") ? (
                      <h3 key={i}>{p.slice(3)}</h3>
                    ) : (
                      <p key={i}>{p}</p>
                    ),
                  )}
              </div>
            )}
          </TabsContent>
          <TabsContent value="seo">
            <div className="seo-checks">
              {checks.map((c) => (
                <div key={c.label}>
                  <span className={`pill ${c.ok ? "" : "orange"}`}>
                    {c.ok ? <Check size={14} /> : "확인"}
                  </span>
                  {c.label}
                </div>
              ))}
            </div>
            <div className="google-preview">
              <span>
                {ORIGIN}/journal/{edit.slug}
              </span>
              <h3>{edit.title} | 돈쌤 DON SSAEM</h3>
              <p>{edit.excerpt}</p>
            </div>
          </TabsContent>
        </Tabs>
        <div className="editor-actions">
          <button
            className="outline-button"
            disabled={busy}
            onClick={() => save("draft")}
          >
            초안 저장
          </button>
          <button
            className="primary-button"
            disabled={busy}
            onClick={() => save("approved")}
          >
            <Check size={16} />
            검토 완료
          </button>
        </div>
        {edit.channel === "seo" ? (
          <div className="publish-box">
            <h3>저널에 발행하기</h3>
            <p>발행하면 같은 주제의 기존 저널 원고가 이 내용으로 갱신됩니다.</p>
            <button
              className="primary-button"
              disabled={
                busy ||
                changed ||
                !["approved", "scheduled"].includes(edit.status)
              }
              onClick={() => save("published")}
            >
              지금 발행
            </button>
            <label className="field" style={{ marginTop: 17 }}>
              <span className="field-label">예약 날짜 · 서울 시간</span>
              <input
                aria-label="예약 날짜"
                className="input-control"
                type="datetime-local"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </label>
            <button
              className="outline-button"
              disabled={
                busy ||
                changed ||
                !schedule ||
                !["approved", "scheduled"].includes(edit.status)
              }
              onClick={() => save("scheduled")}
            >
              <CalendarDays size={15} />
              예약 저장
            </button>
            <p className="panel-footnote">
              예약 자동 발행에는 실행기 연결과 ‘SEO 예약 발행’ 규칙 활성화가
              필요합니다.
            </p>
          </div>
        ) : (
          <div className="publish-box">
            <h3>채널로 가져가기</h3>
            <p>
              계정을 연결하기 전에는 직접 게시할 수 있는 형태로 내보내세요. 현재
              편집 중인 문구가 반영됩니다.
            </p>
            <div className="inline-actions">
              {edit.channel === "instagram" && (
                <button
                  className="primary-button"
                  onClick={exportCards}
                  disabled={busy}
                >
                  {busy ? (
                    <Loader2 size={15} className="loading-ring" />
                  ) : (
                    <Download size={15} />
                  )}
                  5장 PNG 묶음
                </button>
              )}
              <button
                className="outline-button"
                onClick={() =>
                  navigator.clipboard
                    .writeText(edit.body)
                    .then(() => toast.success("문구를 복사했어요."))
                    .catch(() => toast.error("복사 권한을 확인해 주세요."))
                }
              >
                <Copy size={15} />
                {edit.channel === "instagram" ? "캡션 복사" : "게시글 복사"}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function BrandPanel() {
  const [copied, setCopied] = useState(false);
  const bio =
    "고민은 천천히, 선택은 나답게. 돈쌤\n시간이 걸리더라도, 제대로 봐드리겠습니다.\n사람이 직접 읽는 1:1 사주 상담 · 사주 리포트 ↓";
  return (
    <>
      <SocialProfile />
      <div className="brand-strategy-hero">
        <Logo />
        <span className="tiny-label">시간이 걸리더라도, 제대로 봐드리겠습니다</span>
        <h2>
          고민은 천천히,
          <br />
          선택은 나답게.
        </h2>
        <p>
          카피바라의 중국어 이름 水豚(shuǐtún)의 마지막 소리에서 온 돈, 편하게 부르는 선생님의 쌤.
          내 이야기를 충분히 듣고 다음 선택을 함께 살피는 1:1 상담 브랜드입니다.
        </p>
      </div>
      <section className="studio-panel" style={{ marginBottom: 24 }}>
        <div className="panel-heading"><h2>돈쌤 브랜드 이야기</h2><span>DON SSAEM</span></div>
        <p style={{ lineHeight: 2, marginBottom: 16 }}>
          우리는 늘 선택 앞에 서요. 그럴 때 누군가 먼저 ‘지금 가장 중요한 건 뭐예요?’ 하고 물어봐 주면 좋겠다는 생각에서 돈쌤을 시작했어요.
          느긋한 카피바라처럼 곁에 앉아 이야기를 끝까지 듣고, 명식과 지금의 삶을 함께 살펴요.
          내가 지키고 싶은 것과 내게 맞는 선택을 함께 정리하는 사주 상담 브랜드입니다.
        </p>
        <p className="panel-footnote">이름: 水豚(shuǐtún)의 마지막 소리 → 돈 + 쌤. 캐릭터는 카피바라, 상담과 리포트는 사람이 직접 진행합니다.</p>
        <div className="brand-palette">{[["포슬린", "#F7FAF9"], ["딥 틸", "#173D3A"], ["청록", "#195C53"], ["민트", "#D7E9E2"]].map(([name,hex]) => <div key={hex}><span style={{ background: hex }} /><strong>{name}</strong><code>{hex}</code></div>)}</div>
        <p className="panel-footnote">목소리: 차분하게 듣고, 쉬운 말로 설명하기. 결과를 단정하거나 불안을 자극하는 표현은 사용하지 않습니다. 후기에는 실제 동의를 받은 경험만 사용합니다.</p>
        <div className="result-actions"><a className="outline-button" href="/brand/donssaem/approved-v1.png" download><Download size={15} />프로필 PNG</a><a className="outline-button" href="/brand/donssaem/mascot-v1.png" download><Download size={15} />배경 없는 캐릭터 PNG</a><a className="outline-button" href={MASCOT_IMAGE} download><Download size={15} />3D 카피바라 WebP</a></div>
      </section>
      <div className="studio-two-col">
        <section className="studio-panel">
          <div className="panel-heading">
            <h2>소셜 프로필</h2>
            <Instagram size={20} />
          </div>
          <div className="handle-card">
            <strong>@mykkachi</strong>
            <span>Instagram · Threads 기존 계정</span>
          </div>
          <pre className="bio-copy">{bio}</pre>
          <button
            className="outline-button"
            onClick={() =>
              navigator.clipboard
                .writeText(bio)
                .then(() => {
                  setCopied(true);
                  toast.success("프로필 소개를 복사했어요.");
                })
                .catch(() => toast.error("복사 권한을 확인해 주세요."))
            }
          >
            <Copy size={15} />
            {copied ? "복사 완료" : "소개 문구 복사"}
          </button>
          <p className="panel-footnote">
            대안: @hello.mykkachi · @mykkachi.reads
            <br />
            계정 생성·도메인 구매·상표 확인은 아직 진행하지 않았습니다.
          </p>
        </section>
        <section className="studio-panel">
          <div className="panel-heading">
            <h2>대만 확장</h2>
            <span className="pill blue">繁體中文</span>
          </div>
          <div className="handle-card">
            <strong>@mykkachi.tw</strong>
            <span>DON SSAEM 八字 · 聽你說故事，陪你看明天</span>
          </div>
          <div className="strategy-list">
            <p>
              <Check size={16} />
              한국어와 번체 URL 및 검색 메타 분리
            </p>
            <p>
              <Check size={16} />
              八字·五行·日主 등 현지 표현 적용
            </p>
            <p>
              <Check size={16} />
              Asia/Taipei 출생 시간 처리
            </p>
            <p>
              <Clock3 size={16} />
              현지 편집자 감수 · 결제/약관 현지화
            </p>
          </div>
          <a
            className="secondary-button"
            href="/zh-TW"
            target="_blank"
            rel="noreferrer"
          >
            대만 사이트 보기
          </a>
        </section>
      </div>
      <section className="studio-panel" style={{ marginTop: 24 }}>
        <div className="panel-heading">
          <h2>시장 리서치와 제품 방향</h2>
          <span>2026.10.05 확인</span>
        </div>
        <p className="muted" style={{ marginBottom: 20 }}>
          공개 정보만으로 2026년 매출 1위를 확정할 수는 없습니다. 규모가 공개된
          앱과 실제 서비스의 진입·콘텐츠·전환 방식을 비교했습니다.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>서비스</TableHead>
              <TableHead>확인한 강점</TableHead>
              <TableHead>돈쌤에 반영한 점</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              {
                name: "하얀옥",
                url: "https://www.hayaknock.com/",
                strength: "빠른 생년월일 입력, 사주·타로·궁합, 저가 리딩",
                take: "가입 없는 첫 경험, 짧고 선명한 문구",
              },
              {
                name: "운명도감",
                url: "https://destinybook.co.kr/",
                strength: "커리어·관계 등 생활 문제 중심의 리포트",
                take: "자기 이해·관계·일·일상별 읽기 순서",
              },
              {
                name: "점신",
                url: "https://www.jeomsin.co.kr/",
                strength: "대중적인 무료 운세 진입과 반복 방문",
                take: "무료 명식·오행을 유입의 첫 경험으로",
              },
              {
                name: "포스텔러",
                url: "https://forceteller.com/",
                strength: "다양한 주제·시즌 콘텐츠와 유료 확장",
                take: "검색 가능한 주제별 저널과 SNS 재가공",
              },
              {
                name: "科技紫微網",
                url: "https://m.click108.com.tw/fortune/index.php",
                strength: "八字·合盤·事業 등 세분화된 대만 콘텐츠",
                take: "번체 중국어·현지 검색어·대만 시간대",
              },
            ].map((r) => (
              <TableRow key={r.name}>
                <TableCell>
                  <a
                    className="text-link"
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {r.name}
                    <ExternalLink size={12} />
                  </a>
                </TableCell>
                <TableCell>{r.strength}</TableCell>
                <TableCell>{r.take}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="panel-footnote">
          이용 규모 참고: 2024년 12월 MobileIndex 수치를 인용한 2025.02.03
          보도에서 점신 MAU 967,363명, 포스텔러 628,208명. 과거 한국 모바일
          집계이며 현재 순위나 전체 매출을 뜻하지 않습니다.{" "}
          <a
            href="https://news.nate.com/view/20250203n02153"
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            출처 보기
          </a>
        </p>
      </section>
      <section className="studio-panel" style={{ marginTop: 24 }}>
        <div className="panel-heading">
          <h2>첫 4주 운영 제안</h2>
          <span className="pill">검증할 가설</span>
        </div>
        <div className="launch-weeks">
          {[
            [
              "01",
              "무료 사주의 첫 경험",
              "오행·일간·출생시간 글로 검색 유입 기반을 준비합니다.",
            ],
            [
              "02",
              "저장하고 싶은 한 장",
              "오행 오해를 풀어주는 카드뉴스와 공감형 Threads 글을 올립니다.",
            ],
            [
              "03",
              "관계와 일의 이야기",
              "프로필 링크에 UTM을 붙이고 실제 사주 계산 완료를 관찰합니다.",
            ],
            [
              "04",
              "대만 콘텐츠 작은 실험",
              "번체 3개 주제를 현지 감수한 뒤, 반응을 비교합니다.",
            ],
          ].map(([n, t, d]) => (
            <div key={n}>
              <span className="tiny-label">WEEK {n}</span>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
        <div className="notice" style={{ marginTop: 24 }}>
          초기에는 무료 리딩으로 수요를 확인하고, 충분한 해석 품질 검증 후 유료
          심화 리포트를 실험하는 방향입니다. 현재 유료 결제, 가짜 후기, 가상의
          구매 수치는 넣지 않았습니다.
        </div>
      </section>
    </>
  );
}
