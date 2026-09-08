/**
 * Tips när en metrik lackar.
 *
 * Regelmotor utan I/O: en påse mätvärden in, högst tre tips ut. Reglerna och
 * trösklarna kommer ur docs/ltv-tips-research.md (2026-09-08) med källa per
 * regel; siffrorna i tipstexterna står i källorna, inte här. En regel vars
 * fält saknas i påsen hoppas över — hellre inget tips än ett tips byggt på
 * ett värde vi inte har.
 *
 * Prioritet: critical > warning > info > good; inom samma nivå pengar som
 * blöder nu (CPA, MER, marginal) före pengar som saknas senare (LTV, fasta).
 * Max ett tips per metrik, max tre totalt — Axels svarsregel gäller i appen.
 */

import type { Lang } from "./texts";

export type Severity = "critical" | "warning" | "info" | "good";

/** Andelar 0–1. Undefined = okänt ⇒ regler som behöver fältet hoppas över. */
export interface Metrics {
  repeat_rate?: number;
  customers?: number;
  cohort_customers?: number;
  ltv_60?: number;
  ltv_90?: number;
  ltv_180?: number;
  aov?: number;
  cpa_new?: number;
  max_cpa?: number;
  new_customers?: number;
  gross_margin?: number;
  refund_rate?: number;
  fixed_share?: number;
  mer?: number;
  orders?: number;
  days?: number;
}

export interface Rule {
  id: string;
  metric: keyof Metrics;
  /** Fält som måste finnas för att regeln ska prövas. */
  needs: (keyof Metrics)[];
  when: (m: Required<Metrics>) => boolean;
  severity: Severity;
  tip_en: string;
  tip_sv: string;
  source: string;
}

export interface Tip {
  id: string;
  metric: keyof Metrics;
  severity: Severity;
  text: string;
  source: string;
}

export const RULES: Rule[] = [
  { id: "repeat_low", metric: "repeat_rate", needs: ["repeat_rate", "customers"], when: (m) => m.repeat_rate < 0.15 && m.customers >= 200, severity: "warning",
    tip_en: "Fewer than 15% of customers buy twice. Add a post-purchase email flow with a day-20 reorder offer.",
    tip_sv: "Under 15 % köper igen. Lägg ett post-purchase-mejlflöde med återköpserbjudande dag 20.",
    source: "Bluecore 2024 (16.5% avg); Klaviyo Benchmark 2025/26" },
  { id: "repeat_mid", metric: "repeat_rate", needs: ["repeat_rate", "customers"], when: (m) => m.repeat_rate >= 0.15 && m.repeat_rate < 0.2 && m.customers >= 200, severity: "info",
    tip_en: "Repeat rate is below the 28% ecommerce average. A win-back email at day 60 typically converts 2–5%.",
    tip_sv: "Återköpsgraden ligger under snittet 28 %. Ett win-back-mejl dag 60 konverterar normalt 2–5 %.",
    source: "Metrilo (28.2%); Eightx win-back benchmarks" },
  { id: "repeat_good", metric: "repeat_rate", needs: ["repeat_rate", "customers"], when: (m) => m.repeat_rate >= 0.25 && m.customers >= 200, severity: "good",
    tip_en: "Repeat rate is above average. Protect it: keep support replies under one hour.",
    tip_sv: "Återköpsgraden är över snittet. Skydda den: svara kundtjänst inom en timme.",
    source: "Metrilo 28.2%; Satmetrix" },
  { id: "ltv90_below_cpa", metric: "ltv_90", needs: ["ltv_90", "cpa_new", "cohort_customers"], when: (m) => m.ltv_90 < m.cpa_new && m.cohort_customers >= 100, severity: "critical",
    tip_en: "Customers have not paid back their acquisition cost after 90 days. Add a second-order offer and cross-sell.",
    tip_sv: "Kunderna har inte betalat sin anskaffning efter 90 dagar. Lägg in andra-köps-erbjudande och korsförsäljning.",
    source: "Eightx/Finsi payback benchmarks; Salesforce" },
  { id: "ltv180_thin", metric: "ltv_180", needs: ["ltv_180", "cpa_new", "cohort_customers"], when: (m) => m.ltv_180 < 1.5 * m.cpa_new && m.cohort_customers >= 100, severity: "warning",
    tip_en: "180-day LTV is under 1.5× CPA. Test a bundle or subscription; subscribers are worth ~3× one-time buyers.",
    tip_sv: "180-dagars-LTV under 1,5× CPA. Testa bundle eller prenumeration; prenumeranter är värda ~3× engångskunder.",
    source: "Shopify LTV:CAC 3:1; Recharge Subscriber Trends" },
  { id: "ltv60_flat", metric: "ltv_60", needs: ["ltv_60", "aov", "cohort_customers"], when: (m) => m.ltv_60 < 1.05 * m.aov && m.cohort_customers >= 100, severity: "info",
    tip_en: "No second orders within 60 days. Half of all repeat buys happen in 30 days—send the reorder offer earlier.",
    tip_sv: "Inga andra ordrar inom 60 dagar. Hälften av återköpen sker inom 30 dagar — skicka erbjudandet tidigare.",
    source: "BS&Co/Finsi; Klaviyo post-purchase open rate 51%" },
  { id: "aov_below_breakeven", metric: "aov", needs: ["aov", "gross_margin", "cpa_new", "orders"], when: (m) => m.aov * m.gross_margin < m.cpa_new && m.orders >= 50, severity: "critical",
    tip_en: "Gross profit per order is below CPA. Make a 2-pack the default offer; bundles lift AOV 20–35%.",
    tip_sv: "Bruttovinsten per order är lägre än CPA. Gör 2-pack till standard; bundles höjer AOV 20–35 %.",
    source: "Growth Suite/Skailama bundle data; Shopify Bundles" },
  { id: "cpa_over_max", metric: "cpa_new", needs: ["cpa_new", "max_cpa", "days", "new_customers"], when: (m) => m.cpa_new > m.max_cpa && m.days >= 7 && m.new_customers >= 30, severity: "critical",
    tip_en: "You pay more per new customer than break-even. Pause ads below break-even; add reviews—5 reviews lift conversion 270%.",
    tip_sv: "Du betalar mer per ny kund än break-even. Pausa annonser under break-even; lägg till recensioner — 5 st höjer konvertering 270 %.",
    source: "Spiegel Research Center/PowerReviews; ANALYSMETOD" },
  { id: "cpa_near_max", metric: "cpa_new", needs: ["cpa_new", "max_cpa", "days", "new_customers"], when: (m) => m.cpa_new > 0.85 * m.max_cpa && m.cpa_new <= m.max_cpa && m.days >= 7 && m.new_customers >= 30, severity: "warning",
    tip_en: "CPA is within 15% of break-even. Move repeat buyers to email so ads only buy new customers.",
    tip_sv: "CPA ligger inom 15 % från break-even. Flytta återköpen till mejl så annonsen bara köper nya kunder.",
    source: "Shopify blog email CAC; Klaviyo flows" },
  { id: "cpa_headroom", metric: "cpa_new", needs: ["cpa_new", "max_cpa", "ltv_90", "cohort_customers"], when: (m) => m.cpa_new <= m.max_cpa && m.ltv_90 > 1.5 * m.cpa_new && m.cohort_customers >= 100, severity: "good",
    tip_en: "90-day LTV is 1.5× CPA. You have room to raise the budget on ads with positive profit contribution.",
    tip_sv: "90-dagars-LTV är 1,5× CPA. Du har utrymme att höja budgeten på annonser med positivt vinstbidrag.",
    source: "Eightx payback benchmarks; ANALYSMETOD" },
  { id: "margin_critical", metric: "gross_margin", needs: ["gross_margin", "orders"], when: (m) => m.gross_margin < 0.35 && m.orders >= 30, severity: "critical",
    tip_en: "Gross margin under 35% cannot fund ads at the 41% median MER. Renegotiate COGS or raise price.",
    tip_sv: "Bruttomarginal under 35 % bär inte annons vid median-MER 41 %. Omförhandla inköp eller höj priset.",
    source: "Triple Whale 2025 median MER 41%; ATTN/Level CFO" },
  { id: "margin_low", metric: "gross_margin", needs: ["gross_margin", "orders"], when: (m) => m.gross_margin >= 0.35 && m.gross_margin < 0.5 && m.orders >= 30, severity: "warning",
    tip_en: "Gross margin under 50%. Sell multipacks so shipping and pick cost spread over more units.",
    tip_sv: "Bruttomarginal under 50 %. Sälj flerpack så frakt och plock delas på fler enheter.",
    source: "Growth Suite bundle data; Opensend" },
  { id: "margin_squeeze", metric: "gross_margin", needs: ["gross_margin", "mer", "fixed_share", "days"], when: (m) => m.gross_margin - m.mer - m.fixed_share < 0.1 && m.days >= 30, severity: "warning",
    tip_en: "Less than 10% is left after ads and fixed costs. Cut discount depth; use loyalty points instead.",
    tip_sv: "Under 10 % blir kvar efter annons och fasta kostnader. Minska rabattdjupet; använd lojalitetspoäng i stället.",
    source: "Smile.io; Shopify median ROAS 2.04" },
  { id: "refund_critical", metric: "refund_rate", needs: ["refund_rate", "orders"], when: (m) => m.refund_rate > 0.2 && m.orders >= 50, severity: "critical",
    tip_en: "Refunds above 20%—higher than the 19% online average. Review return reasons per SKU and offer exchanges first.",
    tip_sv: "Återbetalningar över 20 % — högre än online-snittet 19 %. Gå igenom returorsaker per produkt och erbjud byte först.",
    source: "NRF 2025 Retail Returns Landscape; Loop Returns" },
  { id: "refund_high", metric: "refund_rate", needs: ["refund_rate", "orders"], when: (m) => m.refund_rate > 0.1 && m.refund_rate <= 0.2 && m.orders >= 50, severity: "warning",
    tip_en: "Refunds above 10%. Write the size/fit note from your own return data; fit tools cut fit returns 20–50%.",
    tip_sv: "Återbetalningar över 10 %. Skriv storleksrådet ur dina egna returer; fit-verktyg sänker passformsreturer 20–50 %.",
    source: "Claimlane / Fit Analytics; NRF" },
  { id: "fixed_critical", metric: "fixed_share", needs: ["fixed_share", "days"], when: (m) => m.fixed_share > 0.25 && m.days >= 30, severity: "critical",
    tip_en: "Fixed costs eat 25%+ of revenue. Cancel apps without measurable revenue and merge email/SMS into one tool.",
    tip_sv: "Fasta kostnader tar 25 %+ av omsättningen. Säg upp appar utan mätbar intäkt och slå ihop mejl/SMS i ett verktyg.",
    source: "Eightx 8–12% at scale; ATTN" },
  { id: "fixed_high", metric: "fixed_share", needs: ["fixed_share", "days"], when: (m) => m.fixed_share > 0.15 && m.fixed_share <= 0.25 && m.days >= 30, severity: "warning",
    tip_en: "Fixed costs above 15% of revenue. Shopify Email is free to 10,000 emails/month—check paid tools.",
    tip_sv: "Fasta kostnader över 15 % av omsättningen. Shopify Email är gratis upp till 10 000 mejl/mån — se över betalverktygen.",
    source: "Dreamlit/MercadoKit pricing; Eightx" },
  { id: "mer_over_margin", metric: "mer", needs: ["mer", "gross_margin", "fixed_share", "days"], when: (m) => m.mer > m.gross_margin - m.fixed_share && m.days >= 14, severity: "critical",
    tip_en: "Ads cost more than your full contribution margin. Scale only ads with positive profit contribution.",
    tip_sv: "Annonserna kostar mer än hela täckningsbidraget. Skala bara annonser med positivt vinstbidrag.",
    source: "ANALYSMETOD; Shopify median ROAS 2.04" },
  { id: "mer_above_median", metric: "mer", needs: ["mer", "gross_margin", "fixed_share", "days"], when: (m) => m.mer > 0.4 && m.mer <= m.gross_margin - m.fixed_share && m.days >= 14, severity: "warning",
    tip_en: "Ads take over 40% of revenue—above the 41% median. Grow email/SMS revenue; flows earn 18× per recipient.",
    tip_sv: "Annons tar över 40 % av omsättningen — över medianen 41 %. Öka mejl/SMS-intäkten; flöden ger 18× per mottagare.",
    source: "Triple Whale 2025; Klaviyo Benchmark" },
  { id: "mer_headroom", metric: "mer", needs: ["mer", "cpa_new", "max_cpa", "ltv_90", "cohort_customers"], when: (m) => m.mer < 0.25 && m.cpa_new < m.max_cpa && m.ltv_90 > 1.5 * m.cpa_new && m.cohort_customers >= 100, severity: "good",
    tip_en: "Ad share is well under the 41% median and profitable. Room to scale proven ads.",
    tip_sv: "Annonsandelen är långt under medianen 41 % och lönsam. Utrymme att skala bevisade annonser.",
    source: "Triple Whale 2025; CLAUDE.md regel 11" },
];

const NIVA: Record<Severity, number> = { critical: 0, warning: 1, info: 2, good: 3 };
const METRIK_ORDNING: (keyof Metrics)[] = [
  "cpa_new", "mer", "gross_margin", "aov", "refund_rate", "repeat_rate", "ltv_60", "ltv_90", "ltv_180", "fixed_share",
];

/** Högst `max` tips, ett per metrik, sorterade efter allvar och metrikordning. */
export function evaluateTips(m: Metrics, lang: Lang, max = 3): Tip[] {
  const traffar: Tip[] = [];
  for (const r of RULES) {
    if (r.needs.some((f) => m[f] == null || !Number.isFinite(m[f] as number))) continue;
    if (!r.when(m as Required<Metrics>)) continue;
    traffar.push({ id: r.id, metric: r.metric, severity: r.severity, text: lang === "sv" ? r.tip_sv : r.tip_en, source: r.source });
  }
  traffar.sort((a, b) => NIVA[a.severity] - NIVA[b.severity] || METRIK_ORDNING.indexOf(a.metric) - METRIK_ORDNING.indexOf(b.metric));
  const perMetrik = new Set<string>();
  const ut: Tip[] = [];
  for (const t of traffar) {
    if (perMetrik.has(t.metric)) continue;
    perMetrik.add(t.metric);
    ut.push(t);
    if (ut.length >= max) break;
  }
  return ut;
}
