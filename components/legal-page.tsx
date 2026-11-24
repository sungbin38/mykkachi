import { SiteHeader, SiteFooter } from "@/components/site";
import type { Locale } from "@/lib/brand";
import { LEGAL_UPDATED, type LegalSection } from "@/lib/legal";

export function LegalPage({ title, intro, sections, locale = "ko" }: { title: string; intro?: string; sections: LegalSection[]; locale?: Locale }) {
  return <><SiteHeader locale={locale} /><main id="main-content" tabIndex={-1} className="shell legal-page">
    <h1>{title}</h1>
    {intro && <p className="legal-intro">{intro}</p>}
    {sections.map((section) => <section key={section.title} id={section.id}>
      <h2>{section.title}</h2>
      {section.body.map((block, i) => Array.isArray(block) ? <ul key={i}>{block.map((item) => <li key={item}>{item}</li>)}</ul> : <p key={i}>{block}</p>)}
    </section>)}
    <p className="legal-updated">{locale === "zh-TW" ? "施行日期" : "시행일"} {LEGAL_UPDATED}</p>
  </main><SiteFooter locale={locale} /></>;
}
