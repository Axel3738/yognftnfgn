/**
 * Förslagslistan "Vanliga månadskostnader" på sidan Fasta kostnader.
 *
 * Poängen är påminnelsen, inte kronan: appen ska få handlaren att komma på
 * de små abonnemangen som annars aldrig hamnar i kalkylen (AI-verktyg,
 * appar, hosting, bokföring, personal). Beloppen är LISTPRISER som förifylls
 * i formuläret och går att ändra innan man sparar.
 *
 * `verifierad: true` = priset står i en läst källa (docs/kostnadsforslag.json,
 * research 2026-09-08). `verifierad: false` = ur minnet per 2026-09-08 —
 * proxyn nådde inte leverantörernas prissidor; visas med "kontrollera priset".
 * Klientsäker fil: inga serverimporter.
 */

export type Kategori = "shopify" | "ai" | "verktyg" | "marknadsforing" | "appar" | "hosting" | "ekonomi" | "personal";

export interface Kostnadsforslag {
  id: string;
  en: string;
  sv: string;
  kategori: Kategori;
  belopp: number;
  valuta: "USD" | "SEK" | "EUR";
  verifierad: boolean;
  /** Shopify-planens displayName som förslaget motsvarar (för "din plan"). */
  shopifyPlan?: string[];
  /** Ord i befintliga kostnadsrader som betyder "den här finns redan". */
  nyckelord: string[];
}

export const KATEGORIER: Kategori[] = ["shopify", "ai", "verktyg", "marknadsforing", "appar", "hosting", "ekonomi", "personal"];

export const FORSLAG: Kostnadsforslag[] = [
  // Shopify-planer (listpris per månad vid månadsbetalning, USD)
  { id: "shopify-basic", en: "Shopify Basic plan", sv: "Shopify Basic-plan", kategori: "shopify", belopp: 39, valuta: "USD", verifierad: false, shopifyPlan: ["Basic", "Basic Shopify"], nyckelord: ["shopify"] },
  { id: "shopify-grow", en: "Shopify (Grow) plan", sv: "Shopify (Grow)-plan", kategori: "shopify", belopp: 105, valuta: "USD", verifierad: false, shopifyPlan: ["Shopify", "Grow"], nyckelord: ["shopify"] },
  { id: "shopify-advanced", en: "Shopify Advanced plan", sv: "Shopify Advanced-plan", kategori: "shopify", belopp: 399, valuta: "USD", verifierad: false, shopifyPlan: ["Advanced", "Advanced Shopify"], nyckelord: ["shopify"] },
  { id: "shopify-plus", en: "Shopify Plus (from)", sv: "Shopify Plus (från)", kategori: "shopify", belopp: 2300, valuta: "USD", verifierad: false, shopifyPlan: ["Shopify Plus", "Plus"], nyckelord: ["shopify plus", "plus"] },
  { id: "stonepnl-standard", en: "StonePNL Standard", sv: "StonePNL Standard", kategori: "shopify", belopp: 9.99, valuta: "USD", verifierad: true, nyckelord: ["stonepnl", "pnl"] },
  { id: "stonepnl-pro", en: "StonePNL Pro", sv: "StonePNL Pro", kategori: "shopify", belopp: 14.99, valuta: "USD", verifierad: true, nyckelord: ["stonepnl", "pnl"] },
  // AI
  { id: "claude-pro", en: "Claude Pro", sv: "Claude Pro", kategori: "ai", belopp: 20, valuta: "USD", verifierad: false, nyckelord: ["claude", "anthropic"] },
  { id: "claude-max-5", en: "Claude Max (5×)", sv: "Claude Max (5×)", kategori: "ai", belopp: 100, valuta: "USD", verifierad: false, nyckelord: ["claude max"] },
  { id: "claude-max-20", en: "Claude Max (20×)", sv: "Claude Max (20×)", kategori: "ai", belopp: 200, valuta: "USD", verifierad: false, nyckelord: ["claude max"] },
  { id: "claude-team", en: "Claude Team (per seat)", sv: "Claude Team (per plats)", kategori: "ai", belopp: 30, valuta: "USD", verifierad: false, nyckelord: ["claude team"] },
  { id: "chatgpt-plus", en: "ChatGPT Plus", sv: "ChatGPT Plus", kategori: "ai", belopp: 20, valuta: "USD", verifierad: false, nyckelord: ["chatgpt", "openai"] },
  { id: "chatgpt-pro", en: "ChatGPT Pro", sv: "ChatGPT Pro", kategori: "ai", belopp: 200, valuta: "USD", verifierad: false, nyckelord: ["chatgpt pro"] },
  { id: "chatgpt-team", en: "ChatGPT Team (per seat)", sv: "ChatGPT Team (per plats)", kategori: "ai", belopp: 30, valuta: "USD", verifierad: false, nyckelord: ["chatgpt team"] },
  { id: "midjourney", en: "Midjourney Standard", sv: "Midjourney Standard", kategori: "ai", belopp: 30, valuta: "USD", verifierad: false, nyckelord: ["midjourney"] },
  { id: "heygen", en: "HeyGen Creator", sv: "HeyGen Creator", kategori: "ai", belopp: 29, valuta: "USD", verifierad: false, nyckelord: ["heygen"] },
  { id: "elevenlabs", en: "ElevenLabs Creator", sv: "ElevenLabs Creator", kategori: "ai", belopp: 22, valuta: "USD", verifierad: false, nyckelord: ["elevenlabs"] },
  // Verktyg
  { id: "google-workspace", en: "Google Workspace (per user)", sv: "Google Workspace (per användare)", kategori: "verktyg", belopp: 8, valuta: "USD", verifierad: false, nyckelord: ["google workspace", "gmail", "gsuite"] },
  { id: "microsoft-365", en: "Microsoft 365 Business (per user)", sv: "Microsoft 365 Business (per användare)", kategori: "verktyg", belopp: 7, valuta: "USD", verifierad: false, nyckelord: ["microsoft", "office 365"] },
  { id: "canva-pro", en: "Canva Pro", sv: "Canva Pro", kategori: "verktyg", belopp: 15, valuta: "USD", verifierad: false, nyckelord: ["canva"] },
  { id: "notion", en: "Notion Plus (per seat)", sv: "Notion Plus (per plats)", kategori: "verktyg", belopp: 12, valuta: "USD", verifierad: false, nyckelord: ["notion"] },
  { id: "slack", en: "Slack Pro (per user)", sv: "Slack Pro (per användare)", kategori: "verktyg", belopp: 8.75, valuta: "USD", verifierad: false, nyckelord: ["slack"] },
  { id: "figma", en: "Figma Professional (per seat)", sv: "Figma Professional (per plats)", kategori: "verktyg", belopp: 16, valuta: "USD", verifierad: false, nyckelord: ["figma"] },
  { id: "adobe-cc", en: "Adobe Creative Cloud", sv: "Adobe Creative Cloud", kategori: "verktyg", belopp: 60, valuta: "USD", verifierad: false, nyckelord: ["adobe", "photoshop", "premiere"] },
  { id: "capcut", en: "CapCut Pro", sv: "CapCut Pro", kategori: "verktyg", belopp: 10, valuta: "USD", verifierad: false, nyckelord: ["capcut"] },
  { id: "domain", en: "Domain (yearly ÷ 12)", sv: "Domän (årsavgift ÷ 12)", kategori: "verktyg", belopp: 2, valuta: "USD", verifierad: false, nyckelord: ["domän", "domain"] },
  { id: "phone", en: "Business phone plan", sv: "Mobilabonnemang (företag)", kategori: "verktyg", belopp: 300, valuta: "SEK", verifierad: false, nyckelord: ["telefon", "mobil", "phone"] },
  // Marknadsföring
  { id: "klaviyo", en: "Klaviyo Email (from)", sv: "Klaviyo Email (från)", kategori: "marknadsforing", belopp: 20, valuta: "USD", verifierad: false, nyckelord: ["klaviyo"] },
  { id: "omnisend", en: "Omnisend Standard (from)", sv: "Omnisend Standard (från)", kategori: "marknadsforing", belopp: 16, valuta: "USD", verifierad: false, nyckelord: ["omnisend"] },
  { id: "meta-business", en: "Meta Business Suite (free)", sv: "Meta Business Suite (gratis)", kategori: "marknadsforing", belopp: 0, valuta: "USD", verifierad: true, nyckelord: ["meta business"] },
  { id: "ugc-creators", en: "UGC creators (avg per month)", sv: "UGC-skapare (snitt per månad)", kategori: "marknadsforing", belopp: 3000, valuta: "SEK", verifierad: false, nyckelord: ["ugc", "creator", "influencer"] },
  // Shopify-appar
  { id: "judgeme", en: "Judge.me Awesome", sv: "Judge.me Awesome", kategori: "appar", belopp: 15, valuta: "USD", verifierad: false, nyckelord: ["judge.me", "judgeme"] },
  { id: "loox", en: "Loox (from)", sv: "Loox (från)", kategori: "appar", belopp: 9.99, valuta: "USD", verifierad: false, nyckelord: ["loox"] },
  { id: "vitals", en: "Vitals", sv: "Vitals", kategori: "appar", belopp: 29.99, valuta: "USD", verifierad: false, nyckelord: ["vitals"] },
  { id: "pagefly", en: "PageFly (from)", sv: "PageFly (från)", kategori: "appar", belopp: 24, valuta: "USD", verifierad: false, nyckelord: ["pagefly"] },
  { id: "gempages", en: "GemPages (from)", sv: "GemPages (från)", kategori: "appar", belopp: 29, valuta: "USD", verifierad: false, nyckelord: ["gempages"] },
  { id: "reconvert", en: "ReConvert (from)", sv: "ReConvert (från)", kategori: "appar", belopp: 4.99, valuta: "USD", verifierad: false, nyckelord: ["reconvert"] },
  { id: "gorgias", en: "Gorgias (from)", sv: "Gorgias (från)", kategori: "appar", belopp: 10, valuta: "USD", verifierad: false, nyckelord: ["gorgias"] },
  { id: "juicy-starter", en: "Juicy Attribution & Profit – Starter", sv: "Juicy Attribution & Profit – Starter", kategori: "appar", belopp: 29, valuta: "USD", verifierad: true, nyckelord: ["juicy"] },
  { id: "juicy-advanced", en: "Juicy Attribution & Profit – Advanced", sv: "Juicy Attribution & Profit – Advanced", kategori: "appar", belopp: 49, valuta: "USD", verifierad: true, nyckelord: ["juicy"] },
  { id: "trueprofit", en: "TrueProfit (from)", sv: "TrueProfit (från)", kategori: "appar", belopp: 35, valuta: "USD", verifierad: false, nyckelord: ["trueprofit"] },
  // Hosting
  { id: "railway", en: "Railway Hobby", sv: "Railway Hobby", kategori: "hosting", belopp: 5, valuta: "USD", verifierad: false, nyckelord: ["railway"] },
  { id: "flyio", en: "Fly.io (small app + Postgres)", sv: "Fly.io (liten app + Postgres)", kategori: "hosting", belopp: 5, valuta: "USD", verifierad: true, nyckelord: ["fly.io", "fly"] },
  { id: "vercel", en: "Vercel Pro", sv: "Vercel Pro", kategori: "hosting", belopp: 20, valuta: "USD", verifierad: false, nyckelord: ["vercel"] },
  // Ekonomi
  { id: "bokforing", en: "Accounting firm (small ltd, typical)", sv: "Redovisningsbyrå (litet AB, typiskt)", kategori: "ekonomi", belopp: 3000, valuta: "SEK", verifierad: false, nyckelord: ["bokföring", "redovisning", "accounting", "bookkeep"] },
  { id: "fortnox", en: "Fortnox (from)", sv: "Fortnox (från)", kategori: "ekonomi", belopp: 199, valuta: "SEK", verifierad: false, nyckelord: ["fortnox"] },
  { id: "bokio", en: "Bokio (from)", sv: "Bokio (från)", kategori: "ekonomi", belopp: 199, valuta: "SEK", verifierad: false, nyckelord: ["bokio"] },
  { id: "bank", en: "Business bank account", sv: "Företagskonto bank", kategori: "ekonomi", belopp: 150, valuta: "SEK", verifierad: false, nyckelord: ["bank", "seb", "swedbank", "nordea"] },
  { id: "insurance", en: "Business insurance", sv: "Företagsförsäkring", kategori: "ekonomi", belopp: 400, valuta: "SEK", verifierad: false, nyckelord: ["försäkring", "insurance"] },
  // Personal
  { id: "va-ph", en: "Video editor / VA, Philippines (full time)", sv: "Videoredigerare / VA, Filippinerna (heltid)", kategori: "personal", belopp: 520, valuta: "USD", verifierad: true, nyckelord: ["va", "editor", "redigerare", "assistent"] },
  { id: "editor-commission", en: "Editor commission (0.4 % of ad spend)", sv: "Redigerarcommission (0,4 % av annonsspend)", kategori: "personal", belopp: 400, valuta: "SEK", verifierad: true, nyckelord: ["commission", "provision"] },
  { id: "employee-se", en: "Swedish employee (gross salary × 1.3142)", sv: "Svensk anställd (bruttolön × 1,3142)", kategori: "personal", belopp: 46000, valuta: "SEK", verifierad: true, nyckelord: ["lön", "anställd", "salary"] },
];

/** Finns förslaget redan bland butikens rader? Matchar på nyckelord i namnet. */
export function finnsRedan(f: Kostnadsforslag, radnamn: string[]): boolean {
  const namn = radnamn.map((n) => n.toLowerCase());
  return f.nyckelord.some((k) => namn.some((n) => n.includes(k)));
}

/** Kategorier som helt saknar rader — påminnelsen "har du glömt …?". */
export function saknadeKategorier(radnamn: string[]): Kategori[] {
  return KATEGORIER.filter((k) => !FORSLAG.filter((f) => f.kategori === k).some((f) => finnsRedan(f, radnamn)));
}
