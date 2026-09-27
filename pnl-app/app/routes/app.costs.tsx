/**
 * COGS-editor.
 *
 * Skriver till Shopifys `InventoryItem.unitCost` — inte till en egen tabell.
 * Det är hela poängen: kostnaden blir butikens egendom, läsbar av Shopifys egna
 * rapporter och av vilken annan app som helst. Appen äger bara *historiken*
 * (CostChange), eftersom Shopify inte sparar någon.
 *
 * CSV-format: produkttitel;varianttitel;kostnad
 * Varianttitel tom = gäller alla varianter i produkten.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import {
  Badge,
  BlockStack,
  Banner,
  Button,
  Card,
  Checkbox,
  ChoiceList,
  DataTable,
  DropZone,
  InlineStack,
  Layout,
  Page,
  Select,
  Text,
  TextField,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { loadCatalog, patchaKostnader, setUnitCost, type VariantCatalog } from "../lib/shopify-data.server";
import { importCostCsv, normTitel, variantTraffar } from "../lib/cost-import.server";
import { lasKostnaderMedAi, lasOffertMedAi, tillCsv, tolkaInmatningMedAi, type Bild } from "../lib/ai-kostnad.server";
import { hamtaKoppling } from "../lib/ai-nyckel.server";
import { rate as fxRate } from "../lib/fx.server";
import { butikensMer, kandaMarknader, marknaderMedOrdrar, readDaily, shiftIso, uppmattaAvgifter } from "../lib/daily.server";
import { mixBreakEven, type MixBreakEven } from "../lib/breakeven.server";
import { mixText } from "../lib/breakeven-text";
import { feeRateFor, tariffFor, type CostTierRow } from "../lib/pnl.server";
import { stadaAvgifter } from "../lib/marknad";
import { dayInTz } from "../lib/shopify-data.server";
import { lasMarknadskostnad, skrivMarknadskostnad, taBortMarknad, taBortMarknadskostnad } from "../lib/marknadskostnad.server";
import { hemlandAv, marknadskod, marknadsnamn } from "../lib/marknad";
import { fingeravtryck, hittaSummaspalt } from "../lib/prisspalter";
import { ALLA_LANDER, byggOffertmeddelande, hemmamarknad, markorValuta, OFFERT_MARKOR, offertLuckor, offertTillRader, tolkaOffertsvar, valjOffertrader, type OffertProblem, type Offertvariant } from "../lib/offertforfragan";
import { asLang, localeOf, t } from "../lib/texts";
import { JUICY_TACKNING, tackningEfterOmsattning } from "../lib/kostnadstackning";
import { blandadSats } from "../lib/avgifter";
import { beTon, beUnderlag, tunntPris } from "../lib/produktintakt";

/**
 * Valutan AI:n rapporterar → en ISO-kod appen kan hämta kurs för.
 *
 * Modellen skriver det som STÅR i offerten: "$", "US$", "¥", "RMB", "kr".
 * Utan den här översättningen tvättades symbolen bort till tom sträng och
 * kortet påstod att ingen valuta syntes — fast den stod där. En kod som inte
 * går att känna igen släpps hellre igenom som tom (då förvaljs USD) än gissas.
 */
function tolkaValuta(ra: string, butikensValuta: string): string {
  const v = ra.trim().toUpperCase();
  if (!v) return "";
  const symboler: Record<string, string> = {
    "$": "USD", "US$": "USD", "USD$": "USD", "¥": "CNY", "RMB": "CNY", "CN¥": "CNY",
    "€": "EUR", "£": "GBP", "KR": butikensValuta, "SEK KR": "SEK",
  };
  if (symboler[v]) return symboler[v];
  const kod = v.replace(/[^A-Z]/g, "");
  if (/^[A-Z]{3}$/.test(kod)) return kod;
  /* "10.17 USD/pc" och liknande: plocka en trebokstavskod ur texten. */
  const träff = v.match(/\b(USD|EUR|CNY|GBP|SEK|NOK|DKK|PLN|HKD|JPY)\b/);
  return träff ? träff[1] : "";
}

/** Axels Loom: "Example: how to import from Juicy". Embed-adressen, inte delningslänken. */
const LOOM_JUICY = "https://www.loom.com/embed/7d1e94bea6fa491ba4f1f50d9cc799f6?hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true";

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const settings = await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    create: { shop: session.shop },
    update: {},
  });
  const lang = asLang(settings.language);
  /* Marknadsväljaren: ?market=NO visar och skriver Norges kostnader. Tom =
     standard (Shopifys unitCost), som förut. */
  const market = marknadskod(new URL(request.url).searchParams.get("market"));
  const [costs, tierRows, marknader, saljMarknader] = await Promise.all([
    loadCatalog(admin, session.shop, prisma),
    prisma.costTier.findMany({ where: { shop: session.shop, market: "" }, orderBy: { units: "asc" } }),
    kandaMarknader(session.shop, hemlandAv(settings.currency)),
    marknaderMedOrdrar(session.shop),
  ]);
  /* Marknaderna en variant MÅSTE ha kostnad för: de butiken sålt till. Utan
     ordrar än (ny butik) gäller alla kända marknader. */
  const kravMarknader = saljMarknader.length ? saljMarknader : marknader;

  /* Valutan man skriver kostnader i. Leverantörspriser är nästan alltid i USD
     eller CNY; beloppet räknas om till butikens valuta med dagens ECB-kurs
     när det sparas. Kursen skickas med så fälten kan visa den. */
  const costCurrency = (settings.costCurrency ?? settings.currency).toUpperCase();
  /* AI-korten visas när butiken har en Claude-nyckel — sin egen eller
     serverns. Förut satt grinden bara på serverns miljövariabel. */
  const aiKoppling = await hamtaKoppling(session.shop, settings);
  const kurs = costCurrency === settings.currency ? 1 : (await fxRate(costCurrency, settings.currency)) ?? null;

  /* Hur produkterna FAKTISKT säljs de senaste 90 dagarna: orderrader per antal
     (1 st, 2 st …) per variant. Det är underlaget för break-even ROAS — ett
     tvåpack betalar tullen en gång och får packpriset, så break-even ligger
     lägre än styckräkningen säger. Under en marknad: bara det landets ordrar. */
  const idag = dayInTz(new Date(), settings.timezone ?? "UTC");
  const [mix90, merLas] = await Promise.all([
    readDaily(session.shop, shiftIso(idag, -89), idag, { market }).catch(() => null),
    /* Butikens MER (30 stängda dagar) — break-even-cellen färgas mot den i
       stället för fasta gränser. Misslyckas läsningen: ingen färg. */
    butikensMer(session.shop, idag).catch(() => ({ mer: null, from: "", to: "" })),
  ]);
  const linesPerVariant = new Map<string, Record<string, number>>();
  /* Vad kunderna BETALADE per antal (efter alla rabatter) och hur många
     orderrader som bär det priset. Under ett marknadsfilter blir det
     automatiskt det landets pris. Äldre dagsrader saknar fälten och räknas
     bara i `lines` — break-even delar med `linesPriced`, inte med `lines`. */
  const revenuePerVariant = new Map<string, Record<string, number>>();
  const pricedPerVariant = new Map<string, Record<string, number>>();
  /* Samma 90 dagar ger också täckningens vikt: hur mycket varje variant
     sålt för. Tre bästsäljare utan kostnad är ett större hål än hundra
     varianter som aldrig säljer. */
  const omsPerVariant = new Map<string, number>();
  /* Sålda enheter: en gåva eller en 100 %-rabatt säljs för 0 men skickas
     ändå — den ska med i offertförfrågan som "såld". */
  const enheterPerVariant = new Map<string, number>();
  for (const p of mix90?.products ?? []) {
    if (!p.variantGid) continue;
    omsPerVariant.set(p.variantGid, (omsPerVariant.get(p.variantGid) ?? 0) + p.netSales);
    enheterPerVariant.set(p.variantGid, (enheterPerVariant.get(p.variantGid) ?? 0) + (Number(p.units) || 0));
  }
  /* Varianter handlaren sagt är gratis — deras 0 är ett riktigt pris. */
  const fria = new Set(
    Array.isArray(settings.freeVariants)
      ? (settings.freeVariants as unknown[]).filter((v): v is string => typeof v === "string")
      : [],
  );
  const lagg = (karta: Map<string, Record<string, number>>, gid: string, rad: Record<string, number>) => {
    const agg = karta.get(gid) ?? {};
    for (const [q, n] of Object.entries(rad)) agg[q] = (agg[q] ?? 0) + (Number(n) || 0);
    karta.set(gid, agg);
  };
  for (const p of mix90?.products ?? []) {
    if (!p.variantGid || !p.lines) continue;
    lagg(linesPerVariant, p.variantGid, p.lines);
    if (p.linesRevenue && p.linesPriced) {
      lagg(revenuePerVariant, p.variantGid, p.linesRevenue);
      lagg(pricedPerVariant, p.variantGid, p.linesPriced);
    }
  }
  /* Avgiften för vald marknad (kortavgift + växlingsavgift), annars standard. */
  const raknesettings = {
    tariffPerOrder: Number(settings.tariffPerOrder),
    feeRate: Number(settings.feeRate),
    targetMargin: Number(settings.targetMargin),
    marketFees: stadaAvgifter(settings.marketFees),
  };
  /* Tullen för vald marknad. En EU-order och en USA-order i samma butik bär
     helt olika tull, och break-even ska räkna med den som gäller där. */
  const tariffEff = tariffFor(raknesettings, market);
  /* Hellre det Shopify Payments FAKTISKT tog (ur ordrarna, 90 dagar) än en
     sats någon skrivit in — men bara på den omsättning som gick genom
     Shopify Payments. Resten (PayPal, direkt-Klarna, manuellt) får
     Inställningars sats plus Shopifys tredjepartsavgift. Förut fick hela
     omsättningen den uppmätta satsen, som dessutom var ett snitt med
     PayPal-ordrarnas nollor: break-even 1,80× i stället för 1,92×. */
  const uppmatt = await uppmattaAvgifter(session.shop).catch(() => ({}) as Record<string, never>);
  const matt = uppmatt[market] ?? (market ? undefined : uppmatt[""]);
  const feeMatt = Boolean(matt && matt.sales > 0);
  /* Även utan Shopify Payments alls går blandningen: då är det satsen på
     allt, plus tredjepartsavgiften på det som bevisligen gick externt. */
  const feeRateEff = matt && matt.totalSales > 0
    ? blandadSats(matt, feeRateFor(raknesettings, market), Number(settings.thirdPartyFeeRate ?? 0))
    : feeRateFor(raknesettings, market);
  /* Andel av omsättningen med faktiska avgifter, hela procent nedåt — texten
     säger "faktiskt tagit" om allt bara när det är sant. */
  const feeFaktiskPct = matt && matt.totalSales > 0 ? Math.floor((matt.sales / matt.totalSales) * 100 + 1e-9) : 100;
  /* Kostnaderna för VARJE känd marknad läses, inte bara den valda: tabellen
     längst ner visar hela upplägget på en gång — standard i en kolumn och
     varje land i sin — så man ser vad som är inlagt utan att byta i listan. */
  const varianter = costs.all.map((v) => ({ variantGid: v.variantGid, productGid: v.productGid }));
  const allaMk = new Map(
    await Promise.all(marknader.map(async (m) => [m, await lasMarknadskostnad(session.shop, m, varianter)] as const)),
  );
  const mk = market ? allaMk.get(market) ?? (await lasMarknadskostnad(session.shop, market, varianter)) : null;
  /* Mallen ska gå att skicka runt och släppa tillbaka utan att tappa
     flerpacken — därför följer stegen med i kostnadskolumnen: 88.34|134.22. */
  const tiersByVariant = new Map<string, string[]>();
  for (const t of tierRows) {
    const list = tiersByVariant.get(t.variantGid) ?? [];
    list.push(Number(t.totalCost).toFixed(2));
    tiersByVariant.set(t.variantGid, list);
  }
  /* Stegen med sitt antal, för att kunna VISA "2 st 134,22 totalt (67,11/st)"
     i listan. Utan antalet går det inte att skriva ut vad appen faktiskt vet. */
  const stegByVariant = new Map<string, { units: number; totalCost: number }[]>();
  for (const t of tierRows) {
    const list = stegByVariant.get(t.variantGid) ?? [];
    list.push({ units: t.units, totalCost: Number(t.totalCost) });
    stegByVariant.set(t.variantGid, list);
  }
  const rows = [...costs.all].map((v) => {
    /* Under en marknad: marknadens egen kostnad om den finns, annars
       standarden — märkt som ärvd, så det syns vad som faktiskt är inlagt
       för landet och vad som bara följer med. */
    const egen = mk?.unitCost.get(v.variantGid);
    const egnaSteg = mk?.tiers.get(v.variantGid);
    const unitCost = mk ? egen ?? v.unitCost : v.unitCost;
    /* Samma regel som räknemotorn (tiersFor): marknadens egna steg om de
       finns, annars standardens — så listan visar exakt det som räknas. */
    const tiers = egnaSteg ?? stegByVariant.get(v.variantGid) ?? [];
    /* Egen kostnad per marknad (null = ingen egen, ärver standard). */
    const perMarknad: Record<string, number | null> = {};
    for (const m of marknader) perMarknad[m] = allaMk.get(m)?.unitCost.get(v.variantGid) ?? null;
    /* Täckt = standard finns, ELLER varje marknad butiken säljer till har en
       egen kostnad. Att kräva standard när Sverige, Norge och USA alla har
       sina egna tal gjorde att sidan skrek "saknar kostnad" på allt. */
    const tackt =
      v.unitCost != null ||
      (kravMarknader.length > 0 && kravMarknader.every((m) => perMarknad[m] != null));
    /* Kostnad exakt 0 som ingen kvitterat som gratis räknas som saknad —
       samma regel som räknemotorn. I standardvyn räddas en nolla bara av att
       varje säljmarknad har ett eget riktigt pris. */
    const noll =
      !fria.has(v.variantGid) &&
      (market
        ? unitCost === 0
        : v.unitCost === 0 &&
          !(kravMarknader.length > 0 && kravMarknader.every((m) => (perMarknad[m] ?? 0) > 0)));
    /* Break-even på den faktiska mixen, med marknadens avgift. */
    const be: MixBreakEven = mixBreakEven({
      price: v.price,
      unitCost,
      tiers: tiers.map((t): CostTierRow => ({ variantGid: v.variantGid, units: t.units, totalCost: t.totalCost })),
      lines: linesPerVariant.get(v.variantGid) ?? null,
      linesRevenue: revenuePerVariant.get(v.variantGid) ?? null,
      linesPriced: pricedPerVariant.get(v.variantGid) ?? null,
      tariffPerOrder: tariffEff,
      feeRate: feeRateEff,
    });
    return {
      ...v,
      /* Standardkostnaden (Shopify) behålls alltid — under en marknad är
         det den som står som förslag i fältet när landet saknar egen. */
      standardCost: v.unitCost,
      tackt,
      noll,
      /* Nettoförsäljning senaste 90 dagarna — sorteringen och täckningen. */
      oms90: omsPerVariant.get(v.variantGid) ?? 0,
      unitCost,
      be: { beRoas: be.beRoas, tb: be.tb, revenue: be.revenue, lines: be.lines, antagen: be.antagen, olonsamNagon: be.olonsamNagon, delvisListpris: be.delvisListpris, prisade: be.prisade, mix: be.mix.map((m) => ({ qty: m.qty, share: m.share })) },
      egen: mk ? egen != null : v.unitCost != null,
      arvd: Boolean(mk) && egen == null && v.unitCost != null,
      perMarknad,
      tiers,
      /* Antalet MÅSTE med: ett 50-pack som exporteras som bara ett tal lästes
         tillbaka som ett tvåpack, och en order med 2 st fick 50-packets pris. */
      costCell:
        unitCost == null
          ? ""
          : [unitCost.toFixed(2), ...tiers.map((s) => `${s.units}:${s.totalCost.toFixed(2)}`)].join("|"),
    };
  }).sort((a, b) => {
    /* Saknade kostnader först, sedan misstänkta nollor — det är dem man är
       här för att fixa. Inom de två grupperna störst försäljning först: den
       bästsäljare som saknar kostnad kostar mest vinst. */
    const grupp = (r: { unitCost: number | null; tackt: boolean; noll: boolean }) =>
      (market ? r.unitCost == null : !r.tackt) ? 0 : r.noll ? 1 : 2;
    const ga = grupp(a), gb = grupp(b);
    if (ga !== gb) return ga - gb;
    if (ga < 2 && a.oms90 !== b.oms90) return b.oms90 - a.oms90;
    return a.productTitle.localeCompare(b.productTitle, lang === "sv" ? "sv" : "en");
  });
  /* Täckningen vägd efter försäljning. Null när butiken inte sålt något på
     90 dagar — då faller sidan tillbaka på antalet varianter. */
  const saknasRad = (r: (typeof rows)[number]) => (market ? r.unitCost == null : !r.tackt);
  const tackningOms = tackningEfterOmsattning(
    rows.map((r) => ({ variantGid: r.variantGid, saknas: saknasRad(r), noll: r.noll })),
    omsPerVariant,
  );
  const omsSaknade = rows.filter(saknasRad).reduce((a, r) => a + Math.max(0, r.oms90), 0);

  /* Offertförfrågan till leverantören: varje såld variant som saknar en
     riktig kostnad, och för vilka av butikens aktiva marknader. Bara i
     standardvyn — under ett marknadsfilter är försäljningen (oms90) bara
     det landets, och då hade en variant som säljer i USA sett osåld ut. */
  const aktiva = kravMarknader;
  const hemma = hemmamarknad(hemlandAv(settings.currency), aktiva);
  const offert = market
    ? null
    : {
        luckor: offertLuckor({
          varianter: costs.all.map((v) => ({
            variantGid: v.variantGid,
            productTitle: v.productTitle,
            variantTitle: v.variantTitle,
            sku: v.sku,
            handle: v.handle,
            standardCost: v.unitCost,
            perMarknad: Object.fromEntries(aktiva.map((m) => [m, allaMk.get(m)?.unitCost.get(v.variantGid) ?? null])),
            oms90: omsPerVariant.get(v.variantGid) ?? 0,
            enheter90: enheterPerVariant.get(v.variantGid) ?? 0,
            fri: fria.has(v.variantGid),
          })),
          aktiva,
          hemma,
          shop: session.shop,
        }),
        butik: settings.shopName || session.shop.replace(/\.myshopify\.com$/, ""),
        datum: idag,
      };

  return json({
    lang,
    market,
    marknader,
    rows,
    /* Under en marknad: saknar landet kostnad (egen eller ärvd). Standard:
       saknar täckning — varken standard eller alla säljmarknader. */
    missing: rows.filter(saknasRad).length,
    /* Andel av 90 dagars försäljning som har riktig kostnad (null = ingen
       försäljning), och de saknades andel av försäljningen. */
    tackningOms: tackningOms.andel,
    saknasAndelOms: tackningOms.oms > 0 ? omsSaknade / tackningOms.oms : null,
    /* Varianter med kostnad 0 som inte kvitterats som gratis, störst först. */
    nollor: rows
      .filter((r) => r.noll && !saknasRad(r))
      .map((r) => ({ variantGid: r.variantGid, productTitle: r.productTitle, variantTitle: r.variantTitle, oms90: r.oms90 })),
    saljMarknader,
    total: rows.length,
    tariffPerOrder: tariffEff,
    feeRate: feeRateEff,
    feeMatt,
    feeFaktiskPct,
    /* Butikens MER, 30 stängda dagar. Null = ingen färg på break-even. */
    storeMer: merLas.mer,
    currency: settings.currency,
    costCurrency,
    kurs,
    /* Kortet "Kommer du från Juicy?" — läge A (allt finns redan) eller B
       (släpp filen). Dolt när handlaren tryckt "Ser rätt ut". */
    juicyDismissed: Boolean(settings.juicyCardDismissedAt),
    cogsEstimatePct: settings.cogsEstimatePct ?? null,
    aiEnabled: aiKoppling.nyckel !== null,
    offert,
  });
}

/** En rad som AI-rutan vill skriva, i den form den kommer tillbaka. */
type SmartRad = {
  product: string;
  variant: string;
  market: string;
  unit_cost: number;
  currency: string;
  tiers: { units: number; total: number }[];
  source_label: string;
  /** Satt av offertsvaret: raden gäller EXAKT den varianten, inte titeln.
      Två produkter kan heta likadant — ett variant-id kan inte det. */
  variant_gid?: string;
  /** Satt på AI-rader ur ett offertsvar: hemmamarknaden för prisspärren.
      Följer med raden genom ett valt alternativ (smart-apply). */
  sparr_hemma?: string;
};

/** En skriven rad, som kvittot visar den. */
type SmartKvitto = {
  label: string;
  product: string;
  variant: string;
  market: string;
  cost: number;
  /** Vad som stod där innan, i butikens valuta. Null = ingen kostnad fanns. */
  before: number | null;
  original: string;
  tiers: { units: number; total: number }[];
  targets: string;
};

/**
 * Skriver AI-rutans rader. Delad av två vägar: källan var entydig (skrivs
 * direkt), eller handlaren pekade på ett av alternativen. Samma kod båda
 * gångerna — annars skiljer sig resultatet beroende på hur man kom hit.
 *
 * Kurserna hämtas en gång per valuta och den gamla kostnaden läses innan
 * skrivningen, så kvittot kan visa "var 210,45 → nu 140,00".
 */
async function skrivInmatningsrader(o: {
  admin: any;
  shop: string;
  katalog: VariantCatalog;
  rader: SmartRad[];
  butiksValuta: string;
  costCurrency: string;
  T: ReturnType<typeof t>;
  /** Hoppa över en rad vars styckkostnad når variantens eget pris. Satt för
      offertsvar: ett pris i yuan under en Currency-rad som säger USD blir
      sju gånger för högt, och det ska stoppas, inte sparas. Butikens pris
      gäller hemmamarknaden; ett annat land säljs ofta dyrare (USA $199 mot
      1 129 kr hemma), så där är gränsen dubbla priset. */
  sparrMotPris?: { hemma: string };
  /** Ett offertsvar utan känd valuta: en rad utan egen valuta skrivs inte. */
  kravValuta?: boolean;
}): Promise<{ applied: SmartKvitto[]; skipped: string[]; andrade: Map<string, number | null> }> {
  const applied: SmartKvitto[] = [];
  const skipped: string[] = [];
  /* Vad som faktiskt skrevs i Shopify. Katalogen uppdateras med det i
     stället för att slängas — annars måste den pagineras om, och den
     omhämtningen krockade med nästa inmatning. */
  const andrade = new Map<string, number | null>();

  /* En kurs per valuta, inte en per rad. */
  const kurser = new Map<string, number | null>();
  const kursFor = async (valuta: string): Promise<number | null> => {
    if (valuta === o.butiksValuta) return 1;
    if (!kurser.has(valuta)) kurser.set(valuta, (await fxRate(valuta, o.butiksValuta)) ?? null);
    return kurser.get(valuta) ?? null;
  };
  /* Marknadens nuvarande kostnader, en läsning per marknad. */
  const varianter = o.katalog.all.map((v) => ({ variantGid: v.variantGid, productGid: v.productGid }));
  const marknadsKostnader = new Map<string, Awaited<ReturnType<typeof lasMarknadskostnad>>>();
  const foreFor = async (market: string, variantGid: string): Promise<number | null> => {
    if (!market) return o.katalog.all.find((v) => v.variantGid === variantGid)?.unitCost ?? null;
    if (!marknadsKostnader.has(market)) {
      marknadsKostnader.set(market, await lasMarknadskostnad(o.shop, market, varianter));
    }
    return marknadsKostnader.get(market)?.unitCost.get(variantGid) ?? null;
  };

  for (const r of o.rader) {
    const label = r.source_label || `${r.product}${r.variant ? ` · ${r.variant}` : ""}`;
    const mal = r.variant_gid
      ? o.katalog.all.filter((v) => v.variantGid === r.variant_gid)
      : o.katalog.all.filter(
          (v) => normTitel(v.productTitle) === normTitel(r.product) && variantTraffar(v.variantTitle, r.variant),
        );
    if (!mal.length || !Number.isFinite(r.unit_cost) || r.unit_cost < 0) {
      skipped.push(label);
      continue;
    }
    if (o.kravValuta && !String(r.currency ?? "").trim()) {
      skipped.push(o.T.costs.quoteReq.problem.noCurrency(label, r.market || o.T.costs.quoteReq.allCountries));
      continue;
    }
    const valuta = (r.currency || o.costCurrency).trim().toUpperCase() || o.butiksValuta;
    const k = await kursFor(valuta);
    if (k == null) {
      skipped.push(`${label} (${o.T.costs.currency.noRate(valuta)})`);
      continue;
    }
    const rund = (n: number) => Math.round(n * k * 100) / 100;
    const cost = rund(r.unit_cost);
    const prisgrans = !o.sparrMotPris ? 0 : !marknadskod(r.market) || marknadskod(r.market) === o.sparrMotPris.hemma ? 1 : 2;
    if (prisgrans && mal.some((v) => v.price > 0 && cost >= v.price * prisgrans)) {
      skipped.push(o.T.costs.quoteReq.overPrice(label, `${cost.toFixed(2)} ${o.butiksValuta}`));
      continue;
    }
    /* Samma antal två gånger (AI:n läste tvåpacket en gång per färg) skulle
       spräcka skrivningen efter att de gamla stegen raderats. Sista vinner. */
    const perAntal = new Map<number, number>();
    for (const t of r.tiers ?? []) {
      const u = Math.round(Number(t.units));
      if (u >= 2 && Number.isFinite(t.total) && t.total > 0) perAntal.set(u, rund(t.total));
    }
    const tiers = [...perAntal.entries()].sort((a, b) => a[0] - b[0]).map(([units, total]) => ({ units, total }));
    const m = marknadskod(r.market);
    /* En offertrad (pekar på varianten via id) är leverantörens HELA bud:
       dess steg ersätter de gamla även när inga steg blev godkända. Annars
       stod ett gammalt tvåpack kvar bredvid ett nytt styckpris. */
    const ersattSteg = !!r.variant_gid;
    /* Kvittots "var X → nu Y" gäller hela raden. Står varianterna på olika
       gamla kostnader finns inget enda "var" att visa — då visas inget. */
    const foren = await Promise.all(mal.map((v) => foreFor(m, v.variantGid)));
    const before = foren.every((f) => f === foren[0]) ? foren[0] : null;
    /* Vilka varianter som faktiskt blev skrivna. Misslyckas Shopify på alla
       ska raden hamna bland de överhoppade, aldrig på kvittot. */
    let traffade = mal;

    if (m) {
      await skrivMarknadskostnad(
        o.shop,
        m,
        mal,
        cost,
        tiers.length ? tiers.map((t) => ({ units: t.units, totalCost: t.total })) : ersattSteg ? [] : null,
        `${m}: ${cost.toFixed(2)} (${r.unit_cost} ${valuta})`,
      );
    } else {
      const skrivna: typeof mal = [];
      for (const v of mal) {
        const res = await setUnitCost(o.admin, v.inventoryItemGid, cost);
        if (res.ok) {
          skrivna.push(v);
          andrade.set(v.inventoryItemGid, cost);
        } else skipped.push(`${v.productTitle} · ${v.variantTitle}: ${res.error}`);
      }
      if (!skrivna.length) continue;
      traffade = skrivna;
      if (tiers.length || ersattSteg) {
        for (const v of skrivna) {
          await prisma.$transaction([
            prisma.costTier.deleteMany({ where: { shop: o.shop, variantGid: v.variantGid, market: "" } }),
            ...(tiers.length
              ? [
                  prisma.costTier.createMany({
                    data: tiers.map((t) => ({ shop: o.shop, variantGid: v.variantGid, units: t.units, totalCost: t.total, market: "" })),
                  }),
                ]
              : []),
          ]);
        }
      }
    }

    applied.push({
      label,
      product: traffade[0].productTitle,
      variant: r.variant && traffade.length === 1 ? traffade[0].variantTitle : "",
      market: m,
      cost,
      before,
      original: valuta === o.butiksValuta ? "" : `${r.unit_cost} ${valuta}`,
      tiers,
      targets: traffade.map((v) => v.inventoryItemGid).join(","),
    });
  }
  return { applied, skipped, andrade };
}

/** Ett problem ur offertsvaret som en mening handlaren kan agera på. */
function offertProblemText(p: OffertProblem, T: ReturnType<typeof t>, lang: "en" | "sv"): string {
  const Q = T.costs.quoteReq.problem;
  const land = (m: string) => (m && m !== ALLA_LANDER ? marknadsnamn(m, lang, m) : T.costs.quoteReq.allCountries);
  switch (p.kod) {
    case "okantId":
      return Q.unknownId(p.id);
    case "ejLeverans":
      return Q.noShip(p.label, land(p.market));
    case "saknarEtt":
      return Q.noSingle(p.label, land(p.market));
    case "stegBilligare":
      return Q.tierCheaper(p.label, land(p.market), p.antal);
    case "ingenStandard":
      return Q.noStandard(p.label);
    case "utanId":
      return Q.noId(p.rad.slice(0, 80));
    case "ofylld":
      return Q.unfilled(p.label, land(p.market));
    case "delvis":
      return Q.partly(p.label, land(p.market), p.antal.join(", "));
    case "olasbar":
      return Q.unreadable(p.label, land(p.market), Q.why[p.orsak], p.rad.slice(0, 80));
    case "dubblett":
      return Q.twoPrices(p.label, land(p.market));
    case "okantLand":
      return Q.unknownCountry(p.label, p.market);
    case "valutakonflikt":
      return Q.currencyConflict(p.namnd.join(", "), p.lastI.join(", "));
    case "olastRad":
      return Q.noCountry(p.rad.slice(0, 80));
    case "ingenValuta":
      return Q.noCurrency(p.label, land(p.market));
    case "obesvarad":
      return Q.unanswered(p.label, p.rad);
    case "ddpFritext":
      return Q.ddpElsewhere(p.rad);
    case "linjart":
      return Q.linear(p.label, land(p.market), p.antal.join(", "));
  }
}

/**
 * Leverantörens svar på offertförfrågan → skrivna kostnader, utan modell.
 * `null` = svaret gick inte att läsa som mall (eller ingen rad blev läsbar)
 * och AI-rutan får försöka i stället. Samma skrivare som AI-rutan, med tre
 * skillnader: raderna träffar varianten via id, bara butikens egna
 * marknader tas emot, och en förkontroll stoppar HELA svaret om något pris
 * når produktens eget — då är valutan nästan säkert fel på alla rader.
 */
async function lasInOffertsvar(o: {
  admin: any;
  shop: string;
  text: string;
  butiksValuta: string;
  settings: { currency: string; freeVariants: unknown; shopName?: string | null } | null;
  T: ReturnType<typeof t>;
  lang: "en" | "sv";
}) {
  const Q = o.T.costs.quoteReq;
  const [saljMarknader, aretsMarknader, kanda, katalog] = await Promise.all([
    marknaderMedOrdrar(o.shop),
    marknaderMedOrdrar(o.shop, 365),
    kandaMarknader(o.shop, hemlandAv(o.settings?.currency)),
    loadCatalog(o.admin, o.shop, prisma),
  ]);
  const aktiva = saljMarknader.length ? saljMarknader : kanda;
  const hemma = hemmamarknad(hemlandAv(o.settings?.currency), aktiva);
  /* Länder som tas emot: allt förfrågan kan ha innehållit (sålt senaste
     året, eller känt av appen). En marknad som föll ur 90-dagarsfönstret
     mellan förfrågan och svar ska inte avvisas — "EU" och "TO" ska. */
  const tillatna = new Set([...aktiva, ...aretsMarknader, ...kanda]);
  /* Valutan gissas aldrig: den står vid priset, på raden eller på
     markörraden — annars skrivs raden inte. Appens egna namn (produkter,
     varianter, butiken) är inte leverantörens valutor ("EUR 42"). */
  const svar = tolkaOffertsvar(o.text, {
    lander: [...tillatna],
    egenText: [
      o.settings?.shopName ?? "",
      o.shop,
      o.shop.replace(/\.myshopify\.com$/, ""),
      ...katalog.all.flatMap((v) => [v.productTitle, v.variantTitle, `${v.productTitle} — ${v.variantTitle}`]),
    ],
  });
  if (!svar.kand) return null;
  const tomtKvitto = { applied: [] as SmartKvitto[], question: "", notes: "", choices: [] as SmartValRad[], skippedTitle: Q.skippedTitle };

  const fria = new Set(
    Array.isArray(o.settings?.freeVariants)
      ? (o.settings!.freeVariants as unknown[]).filter((v): v is string => typeof v === "string")
      : [],
  );
  const { rader, problem, ddp } = offertTillRader(svar, katalog.all, { hemma, fria, tillatna, aktiva: new Set(aktiva) });
  const problemText = problem.map((p) => offertProblemText(p, o.T, o.lang));

  if (!rader.length) {
    /* Svaret följer mallen men inget blev entydigt: skälen visas, och AI:n
       får INTE gissa i stället. Den får bara svar som inte följer mallen. */
    return {
      ok: false,
      message: problem.length ? Q.nothingWritten : svar.utanId.length ? Q.noIdLines : Q.nothingFilled,
      smart: { ...tomtKvitto, skipped: problemText },
    };
  }

  /* Förkontrollen: styckkostnaden och varje flerpack mot produktens eget
     pris (hemma 1×, andra länder 2× — de säljs ofta dyrare). Slår den till
     på en enda rad skrivs INGENTING: ett pris i yuan under "USD" är fel på
     alla rader, inte bara den som råkade nå gränsen. */
  const kurser = new Map<string, number | null>();
  const kursFor = async (v: string) => {
    if (v === o.butiksValuta) return 1;
    if (!kurser.has(v)) kurser.set(v, (await fxRate(v, o.butiksValuta)) ?? null);
    return kurser.get(v) ?? null;
  };
  const forHoga: string[] = [];
  for (const r of rader) {
    const k = await kursFor(r.currency);
    if (k == null) continue; /* skrivaren hoppar över raden och säger varför */
    const v = katalog.byGid.get(r.variant_gid);
    if (!v || !(v.price > 0)) continue;
    const grans = !r.market || r.market === hemma ? 1 : 2;
    const hog = [
      { antal: 1, total: r.unit_cost },
      ...r.tiers.map((t) => ({ antal: t.units, total: t.total })),
    ].find((x) => x.total * k >= v.price * x.antal * grans);
    if (hog) forHoga.push(Q.overPrice(`${r.source_label} · ${hog.antal} ${o.T.costs.smart.pcs}`, `${(hog.total * k).toFixed(2)} ${o.butiksValuta}`));
  }
  if (forHoga.length) {
    return {
      ok: false,
      message: Q.stoppedOverPrice,
      smart: { ...tomtKvitto, skipped: [...forHoga, ...problemText] },
    };
  }

  const { applied, skipped, andrade } = await skrivInmatningsrader({
    admin: o.admin,
    shop: o.shop,
    katalog,
    rader: rader as SmartRad[],
    butiksValuta: o.butiksValuta,
    costCurrency: svar.valuta,
    T: o.T,
    sparrMotPris: { hemma },
  });
  await patchaKostnader(o.shop, prisma, andrade);
  return {
    ok: true,
    message: applied.length ? Q.done(applied.length) : Q.nothingWritten,
    smart: {
      applied,
      skipped: [...problemText, ...skipped],
      question: "",
      notes: ddp.length
        ? Q.ddpNote(ddp.map((m) => (m === ALLA_LANDER ? Q.allCountries : marknadsnamn(m, o.lang, m))).join(", "))
        : "",
      choices: [] as SmartValRad[],
      skippedTitle: Q.skippedTitle,
    },
  };
}

/** Ett alternativ som AI-rutan lägger fram (samma form i båda vägarna). */
type SmartValRad = { id: string; label: string; explain: string; rader: number; preview: string; rows: string };

/**
 * Bilderna kommer från webbläsaren och får inte skickas vidare oprövade:
 * en mediatyp modellen inte tar emot (heic, bmp) gör hela anropet till ett
 * fel i stället för en tom ruta. Okända typer skickas som png — bytena är
 * det som avgör, inte etiketten — och tomma poster faller bort.
 */
const TILLATNA_BILDTYPER = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
function rensaBilder(raa: unknown): Bild[] {
  if (!Array.isArray(raa)) return [];
  return raa
    .filter((b) => b && typeof b.base64 === "string" && b.base64.length > 0)
    .map((b) => ({
      mediaType: (TILLATNA_BILDTYPER.has(String(b.mediaType)) ? b.mediaType : "image/png") as Bild["mediaType"],
      base64: b.base64 as string,
    }));
}

/** Två decimaler, med komma bara där resten av sidan skriver komma. */
function belopp(n: number, lang: "en" | "sv"): string {
  const s = n.toFixed(2);
  return lang === "sv" ? s.replace(".", ",") : s;
}

/**
 * Ett inköpspris som når butikens eget pris är inget inköpspris. Spärren
 * finns för prislistor som skriver kostnad | påslag | utpris: de uppfyller
 * `A + B = C` av konstruktion, och utpriset får aldrig skrivas som COGS.
 *
 * Kursen hämtas per valuta; saknas den fälls ingen dom (skrivningen hoppar
 * över raden ändå och säger till).
 */
async function rimligaKostnader(o: {
  rader: SmartRad[];
  katalog: VariantCatalog;
  butiksValuta: string;
  costCurrency: string;
}): Promise<boolean> {
  const kurser = new Map<string, number | null>();
  for (const r of o.rader) {
    const valuta = (r.currency || o.costCurrency).trim().toUpperCase() || o.butiksValuta;
    if (!kurser.has(valuta)) {
      kurser.set(valuta, valuta === o.butiksValuta ? 1 : ((await fxRate(valuta, o.butiksValuta)) ?? null));
    }
    const k = kurser.get(valuta);
    if (k == null || !Number.isFinite(r.unit_cost)) continue;
    const mal = o.katalog.all.filter(
      (v) => normTitel(v.productTitle) === normTitel(r.product) && variantTraffar(v.variantTitle, r.variant),
    );
    for (const v of mal) {
      if (v.price > 0 && r.unit_cost * k >= v.price) return false;
    }
  }
  return true;
}

/**
 * Rader → text handlaren känner igen ur sin egen skärmbild.
 *
 * Listan klipptes förut till tre rader, och ett alternativ med nio storlekar
 * såg därför ut som om sex tappats bort medan knappen sa "9 kostnader" —
 * Axel 2026-09-18: *"Jag tror inte den fångade alla olika varianter."* Taket
 * ligger nu på tolv: tillräckligt för att en hel storlekslista ska synas,
 * lågt nog att knappen under kortet ryms på en mobilskärm.
 */
function forhandsvisning(rader: SmartRad[], costCurrency: string, T: ReturnType<typeof t>, lang: "en" | "sv"): string {
  const visade = rader
    .slice(0, 12)
    .map((r) => {
      const valuta = (r.currency || costCurrency).trim().toUpperCase();
      const namn = r.variant || r.source_label || r.product;
      const steg = (r.tiers ?? [])
        .filter((t) => t.units >= 2 && t.total > 0)
        .map((t) => ` · ${t.units} ${T.costs.smart.pcs} ${belopp(t.total, lang)}`)
        .join("");
      return `${namn}: ${belopp(r.unit_cost, lang)} ${valuta}${steg}`;
    });
  const kvar = rader.length - visade.length;
  return [...visade, ...(kvar > 0 ? [T.costs.smart.andMore(kvar)] : [])].join("\n");
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  /* Vald marknad följer med varje skrivning. Tom = standard → Shopify.
     Satt = marknadskostnad → bara vår egen tabell, Shopify rörs inte. */
  const market = marknadskod(form.get("market"));
  /* Beloppet i formuläret kan vara i en annan valuta än butikens. Då räknas
     det om här, med dagens ECB-kurs — ingen kurs, ingen skrivning: ett
     oomräknat dollarbelopp sparat som kronor är tiofalt fel. */
  const butiksValuta = (await prisma.shopSettings.findUnique({ where: { shop: session.shop }, select: { currency: true } }))?.currency ?? "SEK";
  const inValuta = String(form.get("currency") ?? "").trim().toUpperCase() || butiksValuta;
  const tillButik = async (belopp: number): Promise<number | null> => {
    if (inValuta === butiksValuta) return belopp;
    const k = await fxRate(inValuta, butiksValuta);
    return k == null ? null : Math.round(belopp * k * 100) / 100;
  };
  if (intent === "cost-currency") {
    const c = String(form.get("currency") ?? "").trim().toUpperCase();
    await prisma.shopSettings.update({
      where: { shop: session.shop },
      data: { costCurrency: /^[A-Z]{3}$/.test(c) && c !== butiksValuta ? c : null },
    });
    return json({ ok: true, message: "" });
  }
  const katalogFor = async (inv: string[]) => {
    const kat = await loadCatalog(admin, session.shop, prisma);
    return kat.all.filter((v) => inv.includes(v.inventoryItemGid) || inv.includes(v.variantGid));
  };
  /* "Ja, varan är gratis": en variant med inköpspris 0 kvitteras som
     gratis (gåva, prov). Först då räknas nollan som ett riktigt pris i
     panelen och gruppsumman. Bara variant-ID:n från butikens egen katalog
     tas emot — en påhittad sträng i listan hade legat kvar för alltid. */
  if (intent === "free-variant") {
    const gid = String(form.get("variantGid") ?? "").trim();
    const kat = await loadCatalog(admin, session.shop, prisma);
    if (!gid || !kat.all.some((v) => v.variantGid === gid)) {
      return json({ ok: false, message: "invalid" }, { status: 400 });
    }
    const nu = await prisma.shopSettings.findUnique({ where: { shop: session.shop }, select: { freeVariants: true } });
    const lista = Array.isArray(nu?.freeVariants)
      ? (nu!.freeVariants as unknown[]).filter((v): v is string => typeof v === "string")
      : [];
    if (!lista.includes(gid)) {
      await prisma.shopSettings.update({ where: { shop: session.shop }, data: { freeVariants: [...lista, gid] } });
    }
    return json({ ok: true, message: "" });
  }
  if (intent === "juicy-dismiss") {
    await prisma.shopSettings.update({ where: { shop: session.shop }, data: { juicyCardDismissedAt: new Date() } });
    return json({ ok: true, message: "" });
  }
  /* Uppskattad COGS i % av pris för varianter utan kostnad. 0 = av. */
  if (intent === "estimate") {
    const pct = Math.round(Number(form.get("pct")));
    await prisma.shopSettings.update({
      where: { shop: session.shop },
      data: { cogsEstimatePct: Number.isFinite(pct) && pct > 0 && pct < 100 ? pct : null },
    });
    return json({ ok: true, message: "" });
  }
  /* Snabbfältet: en kostnad rakt in i Shopify för en eller flera varianter
     (produktnivå = alla varianter). Inga mallar, ingen fil. */
  if (intent === "set-cost") {
    const ra = parseFloat(String(form.get("cost") ?? "").replace(/\s/g, "").replace(",", "."));
    const targets = String(form.get("targets") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!Number.isFinite(ra) || ra < 0 || !targets.length) {
      return json({ ok: false, message: "invalid" }, { status: 400 });
    }
    const cost = await tillButik(ra);
    if (cost == null) return json({ ok: false, message: `no rate ${inValuta}→${butiksValuta}` }, { status: 502 });
    if (market) {
      const mal = await katalogFor(targets);
      await skrivMarknadskostnad(session.shop, market, mal, cost, null, `${market}: ${cost.toFixed(2)}`);
      return json({ ok: true, message: "" });
    }
    const fel: string[] = [];
    const andrade = new Map<string, number | null>();
    for (const gid of targets) {
      const r = await setUnitCost(admin, gid, cost);
      if (!r.ok) fel.push(r.error ?? gid);
      else andrade.set(gid, cost);
    }
    await patchaKostnader(session.shop, prisma, andrade);
    return json({ ok: fel.length === 0, message: fel.join("; ") });
  }
  /* Ta bort en hel marknad (felskriven landskod, land man slutat sälja till). */
  if (intent === "remove-market") {
    if (!market) return json({ ok: false, message: "invalid" }, { status: 400 });
    await taBortMarknad(session.shop, market);
    return json({ ok: true, message: "" });
  }
  /* Ta bort kostnaden. Standard: Shopifys fält rensas (varianten "saknar
     kostnad" igen, den kostar inte noll) och standardstegen försvinner.
     Marknad: bara marknadens egna poster tas bort — varianten ärver standarden. */
  if (intent === "remove-cost") {
    const targets = String(form.get("targets") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!targets.length) return json({ ok: false, message: "invalid" }, { status: 400 });
    const kat = await loadCatalog(admin, session.shop, prisma);
    const mal = kat.all.filter((v) => targets.includes(v.inventoryItemGid) || targets.includes(v.variantGid));
    if (market) {
      await taBortMarknadskostnad(session.shop, market, mal, kat.all);
      return json({ ok: true, message: "" });
    }
    const fel: string[] = [];
    const andrade = new Map<string, number | null>();
    for (const v of mal) {
      const r = await setUnitCost(admin, v.inventoryItemGid, null);
      if (!r.ok) fel.push(r.error ?? v.variantGid);
      else andrade.set(v.inventoryItemGid, null);
    }
    await prisma.costTier.deleteMany({ where: { shop: session.shop, market: "", variantGid: { in: mal.map((v) => v.variantGid) } } });
    await patchaKostnader(session.shop, prisma, andrade);
    return json({ ok: fel.length === 0, message: fel.join("; ") });
  }
  /* Offertraden handlaren valt produkt för: styckpris till Shopify, ev.
     flerpacksteg till CostTier (ersätter variantens tidigare steg). */
  if (intent === "quote-apply") {
    const cost = parseFloat(String(form.get("cost") ?? "").replace(/\s/g, "").replace(",", "."));
    const inv = String(form.get("inv") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    const variants = String(form.get("variants") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
    /* Packpriser som "antal:totalpris" — aldrig en positionslista. En offert
       staffar ofta 1/50/100, och att anta 2, 3, 4 i rad hade lagt 50-packets
       pris på ett tvåpack. */
    const tiers = String(form.get("tiers") ?? "")
      .split(",")
      .map((par) => par.split(":").map((x) => parseFloat(x.trim())))
      .filter(([u, tot]) => Number.isFinite(u) && u >= 2 && Number.isFinite(tot) && tot > 0)
      .map(([units, totalCost]) => ({ units: Math.round(units), totalCost }));
    /* CostTier har unique(shop, variantGid, units). Kommer samma antal två
       gånger (AI:n läste tvåpacket en gång per färg) sprack createMany EFTER
       att deleteMany redan tömt variantens steg — kostnaden var skriven och
       packpriserna borta. Sista värdet vinner. */
    const stegPerAntal = new Map<number, number>();
    for (const s of tiers) stegPerAntal.set(s.units, s.totalCost);
    const rena = [...stegPerAntal.entries()].sort((a, b) => a[0] - b[0]).map(([units, totalCost]) => ({ units, totalCost }));
    if (!Number.isFinite(cost) || cost < 0 || !inv.length) {
      return json({ ok: false, message: "invalid" }, { status: 400 });
    }
    if (market) {
      const mal = await katalogFor(inv);
      await skrivMarknadskostnad(session.shop, market, mal, cost, rena, `${market}: ${cost.toFixed(2)}`);
      return json({ ok: true, message: "" });
    }
    const fel: string[] = [];
    const andrade = new Map<string, number | null>();
    for (const gid of inv) {
      const r = await setUnitCost(admin, gid, cost);
      if (!r.ok) fel.push(r.error ?? gid);
      else andrade.set(gid, cost);
    }
    if (rena.length && variants.length) {
      for (const variantGid of variants) {
        try {
          /* Radera och skriv i SAMMA transaktion: ett fel mitt emellan hade
             lämnat varianten helt utan packpriser. */
          await prisma.$transaction([
            prisma.costTier.deleteMany({ where: { shop: session.shop, variantGid, market: "" } }),
            prisma.costTier.createMany({
              data: rena.map((s) => ({ shop: session.shop, variantGid, units: s.units, totalCost: s.totalCost, market: "" })),
            }),
          ]);
        } catch (e) {
          console.error(`Packpriser för ${variantGid} kunde inte sparas:`, e);
          fel.push((e as Error).message);
        }
      }
    }
    await patchaKostnader(session.shop, prisma, andrade);
    return json({ ok: fel.length === 0, message: fel.join("; ") });
  }
  // Meddelandena visas i UI:t — hämta butikens språk först.
  const settings = await prisma.shopSettings.findUnique({ where: { shop: session.shop } });
  const T = t(asLang(settings?.language));

  /* Leverantörens svar på offertförfrågan, inklistrat i offertkortet. Läses
     utan modell — ID-raderna pekar ut varianterna. Följer svaret inte mallen
     tar AI-rutan över nedan, om Claude är kopplad. */
  if (intent === "offert-svar") {
    const text = String(form.get("text") ?? "");
    if (!text.trim()) return json({ ok: false, message: T.costs.quoteReq.emptyReply }, { status: 400 });
    const koppling = await hamtaKoppling(session.shop);
    try {
      const svar = await lasInOffertsvar({ admin, shop: session.shop, text, butiksValuta, settings, T, lang: asLang(settings?.language) });
      if (svar) return json(svar, { status: svar.ok ? 200 : 400 });
    } catch (e) {
      console.error("Offertsvaret gick inte att läsa in:", e);
      return json({ ok: false, message: T.costs.smart.failed((e as Error).message) }, { status: 500 });
    }
    if (!koppling.nyckel) return json({ ok: false, message: T.costs.quoteReq.notRecognized }, { status: 400 });
    /* Faller igenom till AI-rutan med samma text. */
  }

  /* EN RUTA FÖR ALLT. Släpp en bild och/eller skriv en mening — "motorhöljet,
     Norge, 140 kr", "alla varianter 12 usd, 2 st 20 usd" — så tolkar AI:n
     produkt, variant, marknad, valuta och flerpack och raderna skrivs direkt.
     Kvittot listar exakt vad som skrevs, med "Ta bort" per rad. Är produkten
     oklar skriver AI:n inget och ställer en fråga i stället. */
  if (intent === "smart" || intent === "offert-svar") {
    /* Klistrade handlaren in leverantörens svar i den stora rutan: samma
       läsning som offertkortet, utan modell. */
    const smartText = String(form.get("text") ?? "");
    const smartBilderRa = String(form.get("bilder") ?? "[]");
    const arOffertsvar = smartText.includes(OFFERT_MARKOR) || /^[\s>*_~]*ID\s*[:：]\s*\d[\d ]{4,}/im.test(smartText);
    if (intent === "smart" && arOffertsvar && (smartBilderRa === "[]" || !smartBilderRa)) {
      try {
        const svar = await lasInOffertsvar({ admin, shop: session.shop, text: smartText, butiksValuta, settings, T, lang: asLang(settings?.language) });
        if (svar) return json(svar, { status: svar.ok ? 200 : 400 });
      } catch (e) {
        console.error("Offertsvaret gick inte att läsa in:", e);
        return json({ ok: false, message: T.costs.smart.failed((e as Error).message) }, { status: 500 });
      }
    }
    const koppling = await hamtaKoppling(session.shop);
    if (!koppling.nyckel) return json({ ok: false, message: T.settings.claude.missing }, { status: 400 });
    let bilder: Bild[] = [];
    try {
      bilder = rensaBilder(JSON.parse(String(form.get("bilder") ?? "[]")));
    } catch {
      bilder = [];
    }
    const text = String(form.get("text") ?? "");
    if (!bilder.length && !text.trim()) return json({ ok: false, message: T.costs.smart.empty }, { status: 400 });
    try {
      const lang = asLang(settings?.language);
      const [katalog, marknader] = await Promise.all([
        loadCatalog(admin, session.shop, prisma),
        kandaMarknader(session.shop, hemlandAv(settings?.currency)),
      ]);
      /* Ett offertsvar som inte följer mallen: valutan är den förfrågan
         skrevs i (markörraden i svaret). Saknas markören GISSAS den inte —
         varken kortets rullista (minns inte vad förfrågan skrevs i) eller
         butikens valuta (en dollaroffert som kronor blir tio gånger för
         låg, och spärren stoppar bara för höga). Då måste valutan stå i
         svaret, annars skrivs raden inte. Priserna spärras mot produktens
         eget pris precis som i mallvägen. */
      const arOffert = intent === "offert-svar" || arOffertsvar;
      const offertValuta = arOffert ? markorValuta(text) : "";
      const kravValuta = arOffert && !offertValuta;
      const costCurrency = arOffert ? offertValuta : (settings?.costCurrency ?? butiksValuta).toUpperCase();
      const sparrMotPris = arOffert ? { hemma: hemmamarknad(hemlandAv(settings?.currency), marknader) } : undefined;
      const svar = await tolkaInmatningMedAi({
        bilder: bilder.slice(0, 6),
        text,
        produkter: katalog.all.map((v) => ({ productTitle: v.productTitle, variantTitle: v.variantTitle, price: v.price })),
        marknader: marknader.map((m) => ({ kod: m, namn: marknadsnamn(m, lang, m) })),
        currency: butiksValuta,
        costCurrency,
        valutaKravs: kravValuta,
        lang,
        apiKey: koppling.nyckel,
      });

      /* Flera läsningar av samma tabell (namnlösa prisspalter): skriv INGET,
         lämna färdiga alternativ som handlaren pekar på. En öppen fråga utan
         knappar är en återvändsgränd — det var precis klagomålet. */
      /* Alla läsningar av källan: alternativen plus modellens egen, utan
         dubbletter. Modellen ska lämna antingen rows eller choices, men
         schemat har båda som listor — så vi litar på talen, inte på löftet. */
      const kandidater = (svar.choices ?? [])
        .filter((c) => c.rows?.length)
        .map((c) => ({ label: c.label, explain: c.explain, rows: c.rows as SmartRad[] }));
      if (svar.rows?.length) {
        const eget = fingeravtryck(svar.rows as SmartRad[]);
        if (!kandidater.some((k) => fingeravtryck(k.rows) === eget)) {
          kandidater.unshift({ label: T.costs.smart.modelPick, explain: "", rows: svar.rows as SmartRad[] });
        }
      }
      /* Flera läsningar av källan? Avgörs FÖRE valutarensningen nedan: att
         en läsning faller bort för att valutan saknas gör inte de andra
         entydiga. */
      const flerTolkningar = kandidater.length > 1;
      /* Offertsvar: varje rad får sin valuta utskriven (förfrågans, om
         raden saknar egen) och spärren med sig — även genom ett valt
         alternativ. En rad utan valuta när förfrågans är okänd tas bort
         och sägs, i stället för att bli butikens valuta. */
      if (arOffert) {
        const utan = new Set<string>();
        const stampla = (rows: SmartRad[]) =>
          rows.flatMap((r) => {
            const cur = String(r.currency || offertValuta).trim().toUpperCase();
            if (!cur) {
              utan.add(T.costs.quoteReq.problem.noCurrency(r.source_label || r.product, r.market || T.costs.quoteReq.allCountries));
              return [];
            }
            return [{ ...r, currency: cur, sparr_hemma: sparrMotPris?.hemma ?? "" }];
          });
        for (const k of kandidater) k.rows = stampla(k.rows);
        svar.rows = stampla((svar.rows ?? []) as SmartRad[]);
        for (let i = kandidater.length - 1; i >= 0; i--) if (!kandidater[i].rows.length) kandidater.splice(i, 1);
        svar.unmatched = [...(svar.unmatched ?? []), ...utan];
      }

      /* Alternativen, som handlaren pekar på. Byggs som en funktion för att
         vi kan behöva falla tillbaka hit efter ett misslyckat skrivförsök. */
      const valSvar = () =>
        json({
          ok: true,
          message: "",
          smart: {
            applied: [] as SmartKvitto[],
            skipped: svar.unmatched,
            /* Rubriken bär hela valet i UI:t — utan text visas inga knappar. */
            question: svar.question || T.costs.smart.pickQuestion,
            notes: svar.notes,
            choices: kandidater.map((c, i) => ({
              id: String(i),
              label: c.label || `${i + 1}`,
              explain: c.explain,
              rader: c.rows.length,
              preview: forhandsvisning(c.rows, costCurrency, T, lang),
              rows: JSON.stringify(c.rows),
            })),
          },
        });

      /* Ett offertsvar med flera läsningar: handlaren väljer bland de som
         har valuta — även om bara en finns kvar. Ingen summaräkning och
         ingen direktskrivning: spalterna utan valuta är borta, så talen
         kan inte längre avgöra saken. */
      if (arOffert && flerTolkningar) {
        if (kandidater.length) return valSvar();
        return json(
          {
            ok: false,
            message: T.costs.quoteReq.nothingWritten,
            smart: {
              applied: [] as SmartKvitto[],
              skipped: svar.unmatched,
              question: "",
              notes: svar.notes,
              choices: [] as SmartValRad[],
              skippedTitle: T.costs.quoteReq.skippedTitle,
            },
          },
          { status: 400 },
        );
      }

      /* Är ett av alternativen de andra ihopräknade är det inget val alls:
         de andra är delpriser och summan är inköpskostnaden. Talen avgör.
         Spärren efteråt: ett inköpspris som når butikens eget pris är inget
         inköpspris — då kan spalten lika gärna vara ett utpris, och då
         lägger vi fram korten i stället. */
      const summa = hittaSummaspalt(kandidater);
      const summaRader =
        summa &&
        (await rimligaKostnader({ rader: kandidater[summa.index].rows, katalog, butiksValuta, costCurrency }))
          ? kandidater[summa.index].rows
          : null;
      const rader = summaRader ?? (svar.rows as SmartRad[]);

      if (!summaRader && kandidater.length > 1) return valSvar();

      const { applied, skipped, andrade } = await skrivInmatningsrader({
        admin,
        shop: session.shop,
        katalog,
        rader,
        butiksValuta,
        costCurrency,
        T,
        sparrMotPris,
        kravValuta,
      });
      /* Blev ingenting skrivet är summaträffen värdelös — då är korten kvar
         bättre än ett kvitto som säger "jag använde summan" utan att någon
         kostnad ändrades. */
      if (summaRader && !applied.length && kandidater.length > 1) return valSvar();
      const summaNot =
        summaRader && summa && applied.length
          ? T.costs.smart.sumUsed(
              summa.delar.map((d) => belopp(d, lang)).join(" + "),
              `${belopp(summa.summa, lang)} ${(summaRader[0]?.currency || costCurrency).trim().toUpperCase()}`,
            )
          : "";
      await patchaKostnader(session.shop, prisma, andrade);
      return json({
        ok: true,
        message: applied.length ? T.costs.smart.done(applied.length) : svar.question && !summaNot ? "" : T.costs.smart.nothing,
        smart: {
          applied,
          skipped: [...svar.unmatched, ...skipped],
          /* Räknade vi ut spalten åt handlaren finns ingen fråga kvar att
             ställa — och modellens egen anmärkning skrevs för valkort som
             inte visas, så den skulle be honom välja något som inte finns. */
          question: summaNot ? "" : svar.question,
          notes: summaNot || svar.notes,
          choices: [] as { id: string; label: string; explain: string; rader: number; preview: string; rows: string }[],
        },
      });
    } catch (e) {
      console.error("AI-inmatning misslyckades:", e);
      return json({ ok: false, message: T.costs.smart.failed((e as Error).message) }, { status: 500 });
    }
  }

  /* Handlaren pekade på ett av alternativen: skriv exakt de raderna. Samma
     skrivare som direktvägen, och raderna kontrolleras mot katalogen igen. */
  if (intent === "smart-apply") {
    let rader: SmartRad[] = [];
    try {
      const ra = JSON.parse(String(form.get("rows") ?? "[]"));
      if (Array.isArray(ra)) rader = ra as SmartRad[];
    } catch {
      rader = [];
    }
    if (!rader.length) return json({ ok: false, message: T.costs.smart.nothing }, { status: 400 });
    /* Det som inte gick att koppla stod i förra svaret. Utan det här försvinner
       varningen när kvittot ersätter alternativen — och en storlek som hoppades
       över skulle tyst behålla sin gamla kostnad. */
    let ohanterade: string[] = [];
    try {
      const oh = JSON.parse(String(form.get("unmatched") ?? "[]"));
      if (Array.isArray(oh)) ohanterade = oh.map((x) => String(x));
    } catch {
      ohanterade = [];
    }
    const anteckning = String(form.get("notes") ?? "");
    try {
      const katalog = await loadCatalog(admin, session.shop, prisma);
      const costCurrency = (settings?.costCurrency ?? butiksValuta).toUpperCase();
      /* Rader ur ett offertsvar bär sin valuta och spärren (se AI-vägen). */
      const offertRad = rader.find((r) => typeof r.sparr_hemma === "string");
      const { applied, skipped, andrade } = await skrivInmatningsrader({
        admin,
        shop: session.shop,
        katalog,
        rader,
        sparrMotPris: offertRad ? { hemma: offertRad.sparr_hemma ?? "" } : undefined,
        kravValuta: Boolean(offertRad),
        butiksValuta,
        costCurrency,
        T,
      });
      await patchaKostnader(session.shop, prisma, andrade);
      return json({
        ok: true,
        message: applied.length ? T.costs.smart.done(applied.length) : T.costs.smart.nothing,
        smart: {
          applied,
          skipped: [...ohanterade, ...skipped],
          question: "",
          notes: anteckning,
          choices: [] as { id: string; label: string; explain: string; rader: number; preview: string; rows: string }[],
        },
      });
    } catch (e) {
      console.error("AI-inmatning (val) misslyckades:", e);
      return json({ ok: false, message: T.costs.smart.failed((e as Error).message) }, { status: 500 });
    }
  }

  /* Leverantörsoffert: AI plockar ut raderna, kursen räknas här, handlaren
     väljer produkt i UI:t. Inget skrivs till Shopify i det här steget. */
  if (intent === "quote-read") {
    const koppling = await hamtaKoppling(session.shop);
    if (!koppling.nyckel) return json({ ok: false, message: T.settings.claude.missing }, { status: 400 });
    let bilder: Bild[] = [];
    try {
      bilder = rensaBilder(JSON.parse(String(form.get("bilder") ?? "[]")));
    } catch {
      bilder = [];
    }
    const text = String(form.get("text") ?? "");
    if (!bilder.length && !text.trim()) return json({ ok: false, message: T.costs.quote.failed("empty") }, { status: 400 });
    try {
      const katalog = await loadCatalog(admin, session.shop, prisma);
      const svar = await lasOffertMedAi({
        bilder: bilder.slice(0, 6),
        text,
        produkter: katalog.all.map((v) => ({ productTitle: v.productTitle, variantTitle: v.variantTitle })),
        apiKey: koppling.nyckel,
      });
      const butikensValuta = (settings?.currency ?? "SEK").toUpperCase();
      /* Valutan gissas ALDRIG till butikens. En leverantörsoffert är nästan
         alltid i USD eller CNY, och en offert i dollar som lästes som kronor
         gör varje inköpspris tiofalt fel. Ser AI:n ingen valuta får handlaren
         välja i en lista — därför skickas kurserna för alla valbara valutor
         med, så bytet räknas om direkt utan en ny AI-läsning. */
      const raValuta = (svar.items.find((i) => i.currency)?.currency ?? "").trim();
      const upptackt = tolkaValuta(raValuta, butikensValuta);
      /* Valutan behålls PER RAD. Två skärmbilder i samma läsning kan vara i
         olika valutor (varan i USD, frakten i CNY) — att köra hela offerten
         på den första radens valuta gav sjufalt fel pris på resten. */
      const items = svar.items.map((it) => ({
        label: it.label,
        unitCost: it.unit_cost,
        tiers: it.tiers,
        moq: it.moq,
        currency: tolkaValuta(it.currency ?? "", butikensValuta),
        suggestedProduct: it.suggested_product,
        suggestedVariant: it.suggested_variant,
      }));
      const valutor = [
        ...new Set([upptackt, ...items.map((i) => i.currency), "USD", "CNY", "EUR", "GBP", butikensValuta].filter(Boolean)),
      ];
      const kurser: Record<string, number | null> = {};
      await Promise.all(
        valutor.map(async (c) => {
          kurser[c] = c === butikensValuta ? 1 : ((await fxRate(c, butikensValuta)) ?? null);
        }),
      );
      return json({
        ok: true,
        message: items.length ? T.costs.quote.found(items.length) : T.costs.quote.empty,
        quote: {
          items,
          notes: svar.notes,
          detected: upptackt,
          /* Vad AI:n faktiskt skrev. Gick den inte att tolka ska kortet säga
             "Offerten visar '元' — välj valuta", inte "ingen valuta syntes". */
          detectedRaw: raValuta.slice(0, 12),
          valutor,
          kurser,
          shopCurrency: butikensValuta,
          /* Byts vid varje avläsning: raderna monteras om, annars ligger
             förra offertens belopp och produktval kvar i fälten. */
          readId: Date.now(),
        },
      });
    } catch (e) {
      console.error("AI-offertläsning misslyckades:", e);
      return json({ ok: false, message: T.costs.quote.failed((e as Error).message) }, { status: 500 });
    }
  }

  /* AI läser av skärmbild/text → vårt CSV-format → samma import som filen. */
  if (intent === "ai-import") {
    const koppling = await hamtaKoppling(session.shop);
    if (!koppling.nyckel) return json({ ok: false, message: T.settings.claude.missing }, { status: 400 });
    let bilder: Bild[] = [];
    try {
      bilder = rensaBilder(JSON.parse(String(form.get("bilder") ?? "[]")));
    } catch {
      bilder = [];
    }
    const text = String(form.get("text") ?? "");
    if (!bilder.length && !text.trim()) return json({ ok: false, message: T.costs.ai.failed("empty") }, { status: 400 });
    try {
      const katalog = await loadCatalog(admin, session.shop, prisma);
      const svar = await lasKostnaderMedAi({
        bilder: bilder.slice(0, 6),
        text,
        produkter: katalog.all.map((v) => ({ productTitle: v.productTitle, variantTitle: v.variantTitle, price: v.price })),
        currency: settings?.currency ?? "SEK",
        apiKey: koppling.nyckel,
      });
      const csv = tillCsv(svar);
      const res = csv ? await importCostCsv(admin, session.shop, prisma, csv, "", T, market) : { ok: true, message: "", applied: [], skipped: [] };
      const unmatched = [...svar.unmatched, ...res.skipped];
      const currencyNote =
        svar.currency_seen && svar.currency_seen.toUpperCase() !== (settings?.currency ?? "SEK").toUpperCase()
          ? T.costs.ai.currencyNote(svar.currency_seen, settings?.currency ?? "SEK")
          : "";
      return json({
        ok: true,
        message: T.costs.ai.result(res.applied.length, unmatched.length),
        ai: { unmatched, notes: [svar.notes, currencyNote].filter(Boolean).join(" ") },
      });
    } catch (e) {
      console.error("AI-kostnadsläsning misslyckades:", e);
      return json({ ok: false, message: T.costs.ai.failed((e as Error).message) }, { status: 500 });
    }
  }
  // Excel och vår egen mall skriver BOM först i filen — annars ser rad ett ut
  // som data istället för kommentar och tolkningen börjar snett.
  const csv = String(form.get("csv") ?? "").replace(/^\ufeff/, "");
  const effectiveFrom = String(form.get("effectiveFrom") ?? "");

  const res = await importCostCsv(admin, session.shop, prisma, csv, effectiveFrom, T, market);
  return json({ ok: res.ok, message: res.message }, { status: res.ok ? 200 : 400 });
}

export default function Costs() {
  const { lang, market, marknader, saljMarknader, costCurrency, kurs, rows, missing, total, tackningOms, saknasAndelOms, nollor, tariffPerOrder, feeRate, feeMatt, feeFaktiskPct, storeMer, currency, juicyDismissed, cogsEstimatePct, aiEnabled, offert } = useLoaderData<typeof loader>();
  const friFetcher = useFetcher<typeof action>();
  const [params, setParams] = useSearchParams();
  const fetcher = useFetcher<typeof action>();
  const juicyFetcher = useFetcher<typeof action>();
  const estimateFetcher = useFetcher<typeof action>();
  const aiFetcher = useFetcher<typeof action>();
  const [aiBilder, setAiBilder] = useState<{ name: string; mediaType: string; base64: string }[]>([]);
  const [aiText, setAiText] = useState("");
  const aiData = aiFetcher.data as { ok: boolean; message: string; ai?: { unmatched: string[]; notes: string } } | undefined;
  const quoteFetcher = useFetcher<typeof action>();
  const [quoteBilder, setQuoteBilder] = useState<{ name: string; mediaType: string; base64: string }[]>([]);
  const [quoteText, setQuoteText] = useState("");
  const quoteData = quoteFetcher.data as unknown as
    | {
        ok: boolean;
        message: string;
        quote?: {
          items: OffertItem[];
          notes: string;
          /** Valutan AI:n faktiskt SÅG i offerten. Tom = ingen syntes. */
          detected: string;
          detectedRaw: string;
          valutor: string[];
          kurser: Record<string, number | null>;
          shopCurrency: string;
          readId: number;
        };
      }
    | undefined;
  /* Valutan i offerten väljs här, inte på servern: leverantörsofferter är
     nästan alltid i USD, och att falla tillbaka på butikens valuta gjorde
     varje inköpspris tiofalt fel. Syns ingen valuta i offerten är USD
     förvalt — aldrig SEK. */
  const [offertValuta, setOffertValuta] = useState("USD");
  useEffect(() => {
    if (quoteData?.quote) setOffertValuta(quoteData.quote.detected || "USD");
  }, [quoteData]);
  /* Under en deploy kan en öppen sida ha gammal JS och prata med en ny
     server (eller tvärtom). Listan och kurserna får därför aldrig antas
     finnas — ett tomt fält är begripligt, ordet "undefined" är det inte. */
  const offertValutor = quoteData?.quote?.valutor?.length
    ? quoteData.quote.valutor
    : ["USD", "EUR", "CNY", "GBP", currency];

  const [visaImport, setVisaImport] = useState(false);
  /* Allt utom AI-rutan och tabellen ligger under "Fler sätt" — sidan ska se
     ut som en ruta, inte en cockpit. */
  const [visaFler, setVisaFler] = useState(!aiEnabled);
  const smartFetcher = useFetcher<typeof action>();
  const [smartBilder, setSmartBilder] = useState<{ name: string; mediaType: string; base64: string }[]>([]);
  const [smartText, setSmartText] = useState("");
  type SmartKvitto = {
    label: string; product: string; variant: string; market: string;
    cost: number; before: number | null; original: string; tiers: { units: number; total: number }[]; targets: string;
  };
  type SmartVal = { id: string; label: string; explain: string; rader: number; preview: string; rows: string };
  const smartData = smartFetcher.data as unknown as
    | {
        ok: boolean;
        message: string;
        smart?: SmartSvar;
      }
    | undefined;
  /* Peka på ett alternativ → skriv det. Samma fetcher som rutan, så
     alternativen byts mot kvittot av sig själva när det är gjort. */
  const [valtId, setValtId] = useState<string | null>(null);
  const valjAlternativ = (v: SmartVal) => {
    setValtId(v.id);
    smartFetcher.submit(
      {
        intent: "smart-apply",
        rows: v.rows,
        /* Följer med tillbaka, annars försvinner varningen om det som inte
           gick att koppla i samma sekund som kvittot visas. */
        unmatched: JSON.stringify(smartData?.smart?.skipped ?? []),
        notes: smartData?.smart?.notes ?? "",
      },
      { method: "POST" },
    );
  };
  /* Vilken av de två vägarna som kör just nu. En ny läsning byter ut hela
     resultatet; ett val skriver bara, och då ska rutan stå kvar. */
  const smartKor = smartFetcher.state !== "idle" ? String(smartFetcher.formData?.get("intent") ?? "") : "";
  const korSmart = () => {
    if (!smartBilder.length && !smartText.trim()) return;
    smartFetcher.submit(
      { intent: "smart", bilder: JSON.stringify(smartBilder.map(({ mediaType, base64 }) => ({ mediaType, base64 }))), text: smartText },
      { method: "POST" },
    );
  };
  /* Efter en lyckad inmatning töms rutan — kvittot står kvar under. */
  useEffect(() => {
    if (smartFetcher.state === "idle" && smartData?.ok && smartData.smart?.applied.length) {
      setSmartBilder([]);
      setSmartText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smartFetcher.state]);
  const [visaVideo, setVisaVideo] = useState(false);
  /* Bilder → base64 i webbläsaren. Delas av AI-kortet och offertkortet. */
  /**
   * En skärmbild från en modern skärm är flera megabyte, och hela bilden
   * skickas som text i formuläret. Krymps den till 2000 px längsta sidan
   * blir posten en bråkdel så stor — prislistan går fortfarande att läsa,
   * och inmatningen går märkbart fortare. Går krympningen inte (udda format,
   * gammal webbläsare) skickas originalet som förut.
   */
  const krymp = (file: File): Promise<{ mediaType: string; base64: string } | null> =>
    new Promise((klar) => {
      if (!file.type.startsWith("image/") || file.type === "image/gif") return klar(null);
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const max = Math.max(img.width, img.height);
        if (!max) return klar(null);
        const skala = Math.min(1, 2000 / max);
        if (skala === 1 && file.size < 1_500_000) return klar(null);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * skala);
        canvas.height = Math.round(img.height * skala);
        const ctx = canvas.getContext("2d");
        if (!ctx) return klar(null);
        /* Vit botten: en genomskinlig png blir annars svart text på svart. */
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        try {
          const data = canvas.toDataURL("image/jpeg", 0.9);
          klar({ mediaType: "image/jpeg", base64: data.split(",")[1] ?? "" });
        } catch {
          klar(null);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        klar(null);
      };
      img.src = url;
    });

  const lasBilder = (setter: typeof setAiBilder) => (_all: File[], accepted: File[]) => {
    for (const file of accepted.slice(0, 6)) {
      void (async () => {
        const mindre = await krymp(file);
        if (mindre?.base64) {
          setter((b) => [...b, { name: file.name, ...mindre }]);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          const url = String(reader.result ?? "");
          const base64 = url.split(",")[1] ?? "";
          setter((b) => [...b, { name: file.name, mediaType: file.type || "image/png", base64 }]);
        };
        reader.readAsDataURL(file);
      })();
    }
  };
  /* Produktgrupper för snabbfältet: en rad per produkt, varianterna under. */
  const produkter = (() => {
    const m = new Map<string, typeof rows>();
    for (const r of rows) (m.get(r.productGid) ?? m.set(r.productGid, []).get(r.productGid)!).push(r);
    return [...m.values()].sort((a, b) => {
      const am = a.some((r) => r.unitCost == null), bm = b.some((r) => r.unitCost == null);
      if (am !== bm) return am ? -1 : 1;
      return a[0].productTitle.localeCompare(b[0].productTitle, lang === "sv" ? "sv" : "en");
    });
  })();
  /* Täckning ≥ 98 % av FÖRSÄLJNINGEN ⇒ läge A: kostnaderna finns redan
     (Juicy eller handlaren skrev till Shopifys fält) — noll klick. Annars
     läge B: släpp exporten. Förut räcktes 90 % av varianterna — tre
     bästsäljare utan kostnad bland 200 varianter sa "Inget att importera"
     medan 60 % av omsättningen var gratis. Utan försäljning på 90 dagar
     finns ingen vikt, och då gäller andelen varianter. */
  const tackning = tackningOms ?? (total ? (total - missing) / total : 0);
  const lageA = tackning >= JUICY_TACKNING;
  const omsPct = (andel: number | null) => (andel == null ? null : Math.floor(andel * 100));
  const visaJuicy = !juicyDismissed && juicyFetcher.state === "idle" && !juicyFetcher.data;
  const [csv, setCsv] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [visaMall, setVisaMall] = useState(false);
  const T = t(lang);
  /* Marknadsväljaren. Alla skrivningar på sidan följer valet: standard går
     till Shopify, en marknad går till vår egen tabell. */
  const marknadsval = [
    { label: T.costs.market.standard, value: "" },
    ...marknader.map((m) => ({ label: `${marknadsnamn(m, lang, m)} (${m})`, value: m })),
  ];
  const [nyMarknad, setNyMarknad] = useState("");
  const [visaNyMarknad, setVisaNyMarknad] = useState(false);
  const byMarknad = (m: string) => {
    const nya = new URLSearchParams(params);
    if (m) nya.set("market", m);
    else nya.delete("market");
    setParams(nya);
  };
  const marknadsnamnet = marknadsnamn(market, lang, "");
  const arvda = rows.filter((r) => r.arvd).length;
  /* Valutan kostnaderna skrivs i. Bytet sparas direkt; fälten räknar om. */
  const valutaFetcher = useFetcher<typeof action>();
  const valutor = [...new Set([currency, "USD", "EUR", "CNY", "GBP", "NOK", "DKK", "PLN"])];
  const bytValuta = (c: string) => valutaFetcher.submit({ intent: "cost-currency", currency: c }, { method: "POST" });
  const kursText =
    costCurrency === currency
      ? ""
      : kurs == null
        ? T.costs.currency.noRate(costCurrency)
        : T.costs.currency.rateNote(costCurrency, currency, kurs);
  /* "Ta bort marknaden": tar bort alla kostnader och kampanjmärkningar för
     landet. Sidan går sedan tillbaka till Standard. */
  const taBortMarknadFetcher = useFetcher<typeof action>();
  useEffect(() => {
    if (taBortMarknadFetcher.state === "idle" && (taBortMarknadFetcher.data as { ok?: boolean } | undefined)?.ok) byMarknad("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taBortMarknadFetcher.state, taBortMarknadFetcher.data]);
  const marknadUtanOrdrar = Boolean(market) && !saljMarknader.includes(market);
  /* TB och break-even i tabellen: på vald marknad rakt av. I Standard-läget
     utan standardkostnad men med marknadskostnader visas SPANNET över
     marknaderna — inte "saknas", för kostnaden finns, bara per land. */
  const spann = (r: (typeof rows)[number]) => {
    const kostnader = marknader.map((m) => r.perMarknad[m]).filter((k): k is number => k != null);
    if (!kostnader.length) return null;
    return { min: Math.min(...kostnader), max: Math.max(...kostnader) };
  };

  /* Mallen byggs i webbläsaren av datan som redan finns på sidan.
     En serverrutt hade varit renare, men en vanlig länknavigering inifrån
     Shopifys iframe bär ingen sessionstoken — resultatet blev att man laddade
     ner inloggningssidan istället för filen. */
  const safe = (s: string) => s.replace(/;/g, ",").trim();
  const mallText = [
    T.costs.tpl1,
    T.costs.tpl2,
    T.costs.tpl3,
    T.costs.tpl4,
    T.costs.tpl5,
    T.costs.tpl6,
    ...rows.map(
      (r) =>
        `${safe(r.productTitle)};${r.variantTitle === "Default Title" ? "" : safe(r.variantTitle)};${r.costCell};${r.price}`,
    ),
  ].join("\n");

  const laddaNerMall = () => {
    const blob = new Blob(["﻿" + mallText + "\n"], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = lang === "sv" ? "inkopspriser.csv" : "costs.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const nf = new Intl.NumberFormat(localeOf(lang), { minimumFractionDigits: 2 });
  const dec = (s: string) => (lang === "sv" ? s.replace(".", ",") : s);
  /* Belopp i tabellen bär alltid valutan — pris, inköp och TB stod som nakna
     tal, och det gick inte att se om 89,00 var kronor eller dollar. */
  const kr = (v: number) => `${nf.format(v)} ${currency}`;

  /* Täckningsbidrag och break-even ROAS per styck.
     Tullen tas ut per ORDER, inte per styck — här räknas den som om ordern
     innehåller en enhet, vilket är det försiktiga fallet. Ett tvåpack bär
     tullen en gång och har därför bättre siffror än vad som visas här. */
  const perStyck = (pris: number, kostnad: number | null) => {
    if (kostnad == null) return null;
    const tb = pris - kostnad - tariffPerOrder - pris * feeRate;
    return { tb, beRoas: tb > 0 ? pris / tb : null };
  };

  return (
    <Page
      title={market ? `${T.costs.title} · ${marknadsnamnet}` : T.costs.title}
      subtitle={T.costs.subtitle(total - missing, total, omsPct(tackningOms))}
    >
      <Layout>
        <Layout.Section>
          <BlockStack gap="400">
            {/* EN RUTA. Släpp en bild, skriv en mening, Enter. AI:n förstår
                produkt, variant, marknad, valuta och flerpack och skriver in
                det. Allt annat på sidan är reservvägar under "Fler sätt". */}
            {aiEnabled ? (
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingLg">{T.costs.smart.title}</Text>
                  <Text as="p" tone="subdued">{T.costs.smart.body}</Text>
                  <DropZone
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    type="image"
                    allowMultiple
                    onDrop={lasBilder(setSmartBilder)}
                  >
                    {smartBilder.length ? (
                      <div style={{ padding: 16 }}>
                        <InlineStack gap="200" blockAlign="center">
                          <Text as="p" fontWeight="semibold">{smartBilder.map((b) => b.name).join(", ")}</Text>
                          <Button variant="plain" onClick={() => setSmartBilder([])}>×</Button>
                        </InlineStack>
                      </div>
                    ) : (
                      <DropZone.FileUpload actionTitle={T.costs.smart.drop} actionHint={T.costs.smart.dropHint} />
                    )}
                  </DropZone>
                  <div
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        korSmart();
                      }
                    }}
                  >
                    <TextField
                      label={T.costs.smart.textLabel}
                      labelHidden
                      value={smartText}
                      onChange={setSmartText}
                      autoComplete="off"
                      placeholder={T.costs.smart.placeholder}
                      multiline={2}
                    />
                  </div>
                  <InlineStack gap="300" blockAlign="center" wrap>
                    <Button
                      variant="primary"
                      size="large"
                      disabled={!smartBilder.length && !smartText.trim()}
                      loading={smartFetcher.state !== "idle"}
                      onClick={korSmart}
                    >
                      {smartFetcher.state !== "idle" ? T.costs.smart.running : T.costs.smart.run}
                    </Button>
                    <Text as="span" variant="bodySm" tone="subdued">{T.costs.smart.enterHint}</Text>
                  </InlineStack>

                  {smartData && smartKor !== "smart" ? (
                    <SmartResultat
                      data={smartData}
                      kor={smartKor}
                      valtId={valtId}
                      onValj={valjAlternativ}
                      T={T}
                      nf={nf}
                      currency={currency}
                      lang={lang}
                    />
                  ) : null}
                </BlockStack>
              </Card>
            ) : null}

            {missing > 0 ? (
              <Banner tone="warning" title={T.costs.missingBannerTitle(missing)}>
                {T.costs.missingBannerBody}
                {saknasAndelOms != null && saknasAndelOms > 0
                  ? ` ${T.costs.missingSalesShare(Math.max(1, Math.round(saknasAndelOms * 100)))}`
                  : ""}
              </Banner>
            ) : (
              <Banner tone="success">{T.costs.allHaveCost}</Banner>
            )}

            {/* Offertförfrågan: ett färdigt meddelande till leverantören för
                allt som saknar kostnad, och en ruta för hennes svar. Bara i
                standardvyn — under ett marknadsfilter är försäljningen bara
                det landets, och listan hade sett annorlunda ut. */}
            {offert ? (
              <Offertkort
                offert={offert}
                startLage={params.get("offert") === "alla" ? "alla" : "saknas"}
                oppna={params.has("offert")}
                T={T}
                nf={nf}
                currency={currency}
                lang={lang}
              />
            ) : missing > 0 ? (
              <InlineStack gap="200" blockAlign="center">
                <Text as="span" variant="bodySm" tone="subdued">{T.costs.quoteReq.marketViewHint}</Text>
                <Button variant="plain" url="/app/costs?offert=1">{T.costs.quoteReq.askLink}</Button>
              </InlineStack>
            ) : null}

            {/* Nollorna: ett 0,00 är oftast ett tomt fält från en import.
                En knapp per variant kvitterar den som gratis; resten räknas
                som saknad kostnad i panelen. Störst försäljning först. */}
            {nollor.length ? (
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">{T.costs.zero.title(nollor.length)}</Text>
                  <Text as="p" tone="subdued">{T.costs.zero.body}</Text>
                  {nollor.slice(0, 20).map((z) => (
                    <InlineStack key={z.variantGid} gap="300" blockAlign="center" align="space-between" wrap>
                      <BlockStack gap="050">
                        <Text as="span" fontWeight="semibold">
                          {z.variantTitle && z.variantTitle !== "Default Title" ? `${z.productTitle} · ${z.variantTitle}` : z.productTitle}
                        </Text>
                        <Text as="span" variant="bodySm" tone="subdued">
                          {T.costs.zero.sales(`${new Intl.NumberFormat(localeOf(lang), { maximumFractionDigits: 0 }).format(z.oms90)} ${currency}`)}
                        </Text>
                      </BlockStack>
                      <Button
                        loading={friFetcher.state !== "idle" && friFetcher.formData?.get("variantGid") === z.variantGid}
                        disabled={friFetcher.state !== "idle"}
                        onClick={() => friFetcher.submit({ intent: "free-variant", variantGid: z.variantGid }, { method: "POST" })}
                      >
                        {T.costs.zero.isFree}
                      </Button>
                    </InlineStack>
                  ))}
                  {nollor.length > 20 ? (
                    <Text as="span" variant="bodySm" tone="subdued">{T.costs.zero.more(nollor.length - 20)}</Text>
                  ) : null}
                </BlockStack>
              </Card>
            ) : null}

            <Button variant="plain" disclosure={visaFler ? "up" : "down"} onClick={() => setVisaFler((v) => !v)}>
              {visaFler ? T.costs.smart.hideMore : T.costs.smart.more}
            </Button>

            {visaFler ? (
            <>
            {/* Marknad: samma produkt kostar olika att få till Sverige, Norge
                och USA. Väljaren styr vad tabellen visar och vart varje
                skrivning på sidan går. */}
            <Card>
              <BlockStack gap="200">
                <InlineStack gap="300" blockAlign="end" wrap>
                  <div style={{ minWidth: 260 }}>
                    <Select
                      label={T.costs.market.label}
                      options={marknadsval}
                      value={market}
                      onChange={byMarknad}
                      helpText={market ? T.costs.market.activeNote(marknadsnamnet) : T.costs.market.help}
                    />
                  </div>
                  {visaNyMarknad ? (
                    <>
                      <div style={{ width: 130 }}>
                        <TextField
                          label={T.costs.market.addLabel}
                          value={nyMarknad}
                          onChange={setNyMarknad}
                          autoComplete="off"
                          maxLength={2}
                          autoFocus
                        />
                      </div>
                      <Button disabled={!marknadskod(nyMarknad)} onClick={() => byMarknad(marknadskod(nyMarknad))}>
                        {T.costs.market.add}
                      </Button>
                    </>
                  ) : (
                    <Button variant="plain" onClick={() => setVisaNyMarknad(true)}>{T.costs.market.addToggle}</Button>
                  )}
                </InlineStack>
                {market ? (
                  <InlineStack gap="300" blockAlign="center" wrap>
                    {arvda ? <Text as="span" variant="bodySm" tone="subdued">{T.costs.market.inherited(arvda)}</Text> : null}
                    <Button
                      variant="plain"
                      tone="critical"
                      loading={taBortMarknadFetcher.state !== "idle"}
                      onClick={() => taBortMarknadFetcher.submit({ intent: "remove-market", market }, { method: "POST" })}
                    >
                      {T.costs.market.removeMarket(marknadsnamnet)}
                    </Button>
                    {marknadUtanOrdrar ? (
                      <Text as="span" variant="bodySm" tone="subdued">{T.costs.market.noOrders}</Text>
                    ) : null}
                  </InlineStack>
                ) : null}
              </BlockStack>
            </Card>
            {visaJuicy ? (
              <Card background="bg-surface-secondary">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">{lageA ? T.juicy.titleA : T.juicy.titleB}</Text>
                  <Text as="p">{lageA ? T.juicy.bodyA(total - missing, total, omsPct(tackningOms)) : T.juicy.bodyB}</Text>
                  {lageA ? <Text as="p" tone="subdued" variant="bodySm">{T.juicy.noteA}</Text> : null}
                  <InlineStack gap="300">
                    {lageA ? (
                      <>
                        <Button
                          variant="primary"
                          loading={juicyFetcher.state !== "idle"}
                          onClick={() => juicyFetcher.submit({ intent: "juicy-dismiss" }, { method: "POST" })}
                        >
                          {T.juicy.ctaA}
                        </Button>
                        <Button url="#import">{T.juicy.ctaA2}</Button>
                      </>
                    ) : (
                      <Button variant="primary" url="#import">{T.juicy.ctaB}</Button>
                    )}
                  </InlineStack>
                </BlockStack>
              </Card>
            ) : null}
            {/* AI läser av skärmbild av Juicy (eller vad som helst). */}
            {aiEnabled ? (
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">{T.costs.ai.title}</Text>
                  <Text as="p" tone="subdued">{T.costs.ai.body}</Text>
                  {/* Axels Loom-inspelning (2026-09-08): skärmbild i Juicy → släpp → läs av. */}
                  <Button variant="plain" disclosure={visaVideo ? "up" : "down"} onClick={() => setVisaVideo((v) => !v)}>
                    {visaVideo ? T.costs.ai.hideVideo : T.costs.ai.video}
                  </Button>
                  {visaVideo ? (
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 8, overflow: "hidden" }}>
                      <iframe
                        src={LOOM_JUICY}
                        title={T.costs.ai.video}
                        allowFullScreen
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                      />
                    </div>
                  ) : null}
                  <DropZone
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    type="image"
                    allowMultiple
                    onDrop={lasBilder(setAiBilder)}
                  >
                    {aiBilder.length ? (
                      <div style={{ padding: 16 }}>
                        <Text as="p" fontWeight="semibold">{aiBilder.map((b) => b.name).join(", ")}</Text>
                      </div>
                    ) : (
                      <DropZone.FileUpload actionTitle={T.costs.ai.drop} actionHint={T.costs.ai.dropHint} />
                    )}
                  </DropZone>
                  <TextField label={T.costs.ai.pasteLabel} value={aiText} onChange={setAiText} multiline={4} autoComplete="off" />
                  <InlineStack gap="300" blockAlign="center">
                    <Button
                      variant="primary"
                      disabled={!aiBilder.length && !aiText.trim()}
                      loading={aiFetcher.state !== "idle"}
                      onClick={() =>
                        aiFetcher.submit(
                          { intent: "ai-import", bilder: JSON.stringify(aiBilder.map(({ mediaType, base64 }) => ({ mediaType, base64 }))), text: aiText, market },
                          { method: "POST" },
                        )
                      }
                    >
                      {aiFetcher.state !== "idle" ? T.costs.ai.reading : T.costs.ai.run}
                    </Button>
                    {aiBilder.length ? <Button variant="plain" onClick={() => setAiBilder([])}>×</Button> : null}
                  </InlineStack>
                  {aiData ? (
                    <Banner tone={aiData.ok ? "success" : "critical"}>
                      <p>{aiData.message}</p>
                      {aiData.ai?.notes ? <p>{aiData.ai.notes}</p> : null}
                      {aiData.ai?.unmatched.length ? (
                        <>
                          <p><strong>{T.costs.ai.unmatchedTitle}</strong></p>
                          <ul style={{ margin: 0, paddingLeft: 18 }}>
                            {aiData.ai.unmatched.slice(0, 20).map((u) => <li key={u}>{u}</li>)}
                          </ul>
                        </>
                      ) : null}
                    </Banner>
                  ) : null}
                </BlockStack>
              </Card>
            ) : null}

            {/* Leverantörsoffert: AI läser priserna, handlaren väljer produkt. */}
            {aiEnabled ? (
              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">{T.costs.quote.title}</Text>
                  <Text as="p" tone="subdued">{T.costs.quote.body}</Text>
                  <DropZone
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    type="image"
                    allowMultiple
                    onDrop={lasBilder(setQuoteBilder)}
                  >
                    {quoteBilder.length ? (
                      <div style={{ padding: 16 }}>
                        <Text as="p" fontWeight="semibold">{quoteBilder.map((b) => b.name).join(", ")}</Text>
                      </div>
                    ) : (
                      <DropZone.FileUpload actionTitle={T.costs.quote.drop} actionHint={T.costs.quote.dropHint} />
                    )}
                  </DropZone>
                  <TextField label={T.costs.quote.pasteLabel} value={quoteText} onChange={setQuoteText} multiline={3} autoComplete="off" />
                  <InlineStack gap="300" blockAlign="center">
                    <Button
                      variant="primary"
                      disabled={!quoteBilder.length && !quoteText.trim()}
                      loading={quoteFetcher.state !== "idle"}
                      onClick={() =>
                        quoteFetcher.submit(
                          { intent: "quote-read", bilder: JSON.stringify(quoteBilder.map(({ mediaType, base64 }) => ({ mediaType, base64 }))), text: quoteText },
                          { method: "POST" },
                        )
                      }
                    >
                      {quoteFetcher.state !== "idle" ? T.costs.quote.reading : T.costs.quote.run}
                    </Button>
                    {quoteBilder.length ? <Button variant="plain" onClick={() => setQuoteBilder([])}>×</Button> : null}
                  </InlineStack>
                  {quoteData ? (
                    <Banner tone={quoteData.ok ? (quoteData.quote?.items.length ? "info" : "warning") : "critical"}>
                      <p>{quoteData.message}</p>
                      {quoteData.quote?.notes ? <p>{quoteData.quote.notes}</p> : null}
                    </Banner>
                  ) : null}
                  {quoteData?.quote?.items.length ? (
                    <BlockStack gap="300">
                      <div style={{ maxWidth: 260 }}>
                        <Select
                          label={T.costs.quote.currencyLabel}
                          options={offertValutor.map((c) => ({ label: c, value: c }))}
                          value={offertValuta}
                          onChange={setOffertValuta}
                          helpText={
                            quoteData.quote.detected
                              ? T.costs.quote.detected(quoteData.quote.detected)
                              : quoteData.quote.detectedRaw
                                ? T.costs.quote.detectedUnknown(quoteData.quote.detectedRaw)
                                : T.costs.quote.notDetected
                          }
                        />
                      </div>
                      <Text as="p" tone="subdued" variant="bodySm">{T.costs.bundle.explain}</Text>
                      <BlockStack gap="200">
                        {quoteData.quote.items.map((it, i) => (
                          <OffertRad
                            key={`${quoteData?.quote?.readId ?? 0}-${i}`}
                            it={it}
                            rows={rows}
                            T={T}
                            nf={nf}
                            currency={currency}
                            valuta={offertValuta}
                            kurser={quoteData?.quote?.kurser ?? {}}
                            market={market}
                          />
                        ))}
                      </BlockStack>
                    </BlockStack>
                  ) : null}
                </BlockStack>
              </Card>
            ) : null}

            {/* Uppskattning tills riktiga kostnader finns — ett klick. */}
            {missing > 0 || cogsEstimatePct ? (
              <Card background="bg-surface-secondary">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">{T.costs.estimate.title}</Text>
                  <Text as="p" tone="subdued">{T.costs.estimate.body}</Text>
                  {cogsEstimatePct ? (
                    <InlineStack gap="300" blockAlign="center" wrap>
                      <Badge tone="info">{`≈ ${T.costs.estimate.active(cogsEstimatePct)}`}</Badge>
                      <Button variant="plain" tone="critical" loading={estimateFetcher.state !== "idle"}
                        onClick={() => estimateFetcher.submit({ intent: "estimate", pct: "0" }, { method: "POST" })}>
                        {T.costs.estimate.off}
                      </Button>
                    </InlineStack>
                  ) : (
                    <InlineStack gap="200" wrap>
                      {[25, 35, 50].map((p) => (
                        <Button key={p} loading={estimateFetcher.state !== "idle"}
                          onClick={() => estimateFetcher.submit({ intent: "estimate", pct: String(p) }, { method: "POST" })}>
                          {`${T.costs.estimate.set} ${T.costs.estimate.option(p)}`}
                        </Button>
                      ))}
                    </InlineStack>
                  )}
                </BlockStack>
              </Card>
            ) : null}

            {/* Snabbfältet: skriv kostnaden per produkt, Enter sparar. */}
            <Card>
              <BlockStack gap="300">
                <InlineStack gap="300" blockAlign="center" align="space-between" wrap>
                  <Text as="h2" variant="headingMd">
                    {market ? `${T.costs.quick.title} · ${marknadsnamnet}` : T.costs.quick.title}
                  </Text>
                  {/* Leverantörspriser är nästan alltid i USD eller CNY: välj
                      valutan här, skriv beloppet som det står i offerten, och
                      appen räknar om med dagens ECB-kurs när det sparas. */}
                  <div style={{ minWidth: 200 }}>
                    <Select
                      label={T.costs.currency.label}
                      options={valutor.map((c) => ({ label: c === currency ? `${c} (${T.costs.currency.shop})` : c, value: c }))}
                      value={costCurrency}
                      onChange={bytValuta}
                      helpText={kursText || undefined}
                    />
                  </div>
                </InlineStack>
                <Text as="p" tone="subdued">{market ? T.costs.market.quickBody(marknadsnamnet) : T.costs.quick.body}</Text>
                {costCurrency !== currency && kurs == null ? (
                  <Banner tone="critical">{T.costs.currency.noRate(costCurrency)}</Banner>
                ) : null}
                <BlockStack gap="200">
                  {/* Nyckeln bär marknad OCH valuta: byter man något ska fälten
                      börja om med rätt värden i rätt valuta. */}
                  {produkter.map((grupp) => (
                    <Produktrad
                      key={`${grupp[0].productGid}|${market}|${costCurrency}`}
                      grupp={grupp}
                      T={T}
                      nf={nf}
                      currency={currency}
                      market={market}
                      inValuta={costCurrency}
                      kurs={kurs}
                    />
                  ))}
                </BlockStack>
              </BlockStack>
            </Card>

            <Button variant="plain" disclosure={visaImport ? "up" : "down"} onClick={() => setVisaImport((v) => !v)}>
              {visaImport ? T.costs.quick.hideAdvanced : T.costs.quick.advanced}
            </Button>

            {visaImport ? (
            <Card>
              <BlockStack gap="400">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd" id="import">
                    {T.costs.importTitle}
                  </Text>
                  <Text as="p" tone="subdued">
                    {T.costs.importBody}
                  </Text>
                  <InlineStack gap="300" blockAlign="center" wrap>
                    <Button onClick={laddaNerMall}>{T.costs.downloadTemplate}</Button>
                    <Button variant="plain" onClick={() => setVisaMall((x) => !x)}>
                      {visaMall ? T.costs.hideTemplate : T.costs.showAsText}
                    </Button>
                  </InlineStack>

                  {visaMall ? (
                    <TextField
                      label={T.costs.templateLabel}
                      value={mallText}
                      onChange={() => {}}
                      multiline={10}
                      autoComplete="off"
                      readOnly
                      helpText={T.costs.templateHelp}
                    />
                  ) : null}
                </BlockStack>

                <DropZone
                  accept=".csv,text/csv"
                  type="file"
                  allowMultiple={false}
                  onDrop={(_all, accepted) => {
                    const file = accepted[0];
                    if (!file) return;
                    file.text().then((text) => {
                      setCsv(text);
                      setFileName(file.name);
                    });
                  }}
                >
                  {csv ? (
                    <div style={{ padding: 16 }}>
                      <BlockStack gap="100">
                        <Text as="p" fontWeight="semibold">
                          {fileName ?? T.costs.pastedText}
                        </Text>
                        <Text as="p" tone="subdued" variant="bodySm">
                          {T.costs.dropReady(csv.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith("#")).length)}
                        </Text>
                      </BlockStack>
                    </div>
                  ) : (
                    <DropZone.FileUpload
                      actionTitle={T.costs.chooseFile}
                      actionHint={T.costs.dragHint}
                    />
                  )}
                </DropZone>

                <TextField
                  label={T.costs.pasteLabel}
                  value={csv}
                  onChange={(v) => {
                    setCsv(v);
                    setFileName(null);
                  }}
                  multiline={6}
                  autoComplete="off"
                  placeholder={T.costs.pastePlaceholder}
                />
                <TextField
                  label={T.costs.effectiveFromLabel}
                  type="date"
                  value={effectiveFrom}
                  onChange={setEffectiveFrom}
                  autoComplete="off"
                  helpText={T.costs.effectiveFromHelp}
                />
                <Button
                  variant="primary"
                  disabled={!csv.trim()}
                  loading={fetcher.state !== "idle"}
                  onClick={() => fetcher.submit({ csv, effectiveFrom, market }, { method: "POST" })}
                >
                  {market ? T.costs.market.writeFor(marknadsnamnet) : T.costs.writeToShopify}
                </Button>
                {fetcher.data ? (
                  <Banner tone={fetcher.data.ok ? "success" : "critical"}>
                    {fetcher.data.message}
                  </Banner>
                ) : null}
              </BlockStack>
            </Card>
            ) : null}
            </>
            ) : null}
          </BlockStack>
        </Layout.Section>

        <Layout.Section>
          <Card padding="0">
            {/* Hela upplägget på en gång: standard + en kolumn per marknad.
                Egen kostnad står rakt; ärvd standard står med * i grått; saknas
                båda står —. TB och break-even räknas på den valda marknaden. */}
            <div style={{ padding: "12px 16px 0" }}>
              <BlockStack gap="100">
                {marknader.length ? <Text as="p" variant="bodySm" tone="subdued">{T.costs.market.tableNote}</Text> : null}
                <Text as="p" variant="bodySm" tone="subdued">
                  {feeMatt ? T.costs.be.feeMeasured((feeRate * 100).toFixed(2), feeFaktiskPct) : T.costs.be.feeSetting((feeRate * 100).toFixed(2))}
                </Text>
                {/* Vad break-even räknas på, och vad färgen jämförs mot. Frakten
                    står utanför med flit — det gör talet försiktigt. */}
                <Text as="p" variant="bodySm" tone="subdued">{T.costs.be.revenueNote}</Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {storeMer != null ? T.costs.be.merNote(dec(storeMer.toFixed(2))) : T.costs.be.merNone}
                </Text>
              </BlockStack>
            </div>
            <DataTable
              columnContentTypes={["text", "text", "numeric", "numeric", ...marknader.map(() => "numeric" as const), "numeric", "numeric"]}
              headings={[
                T.costs.thProduct,
                T.costs.thVariant,
                T.costs.thPrice,
                marknader.length ? T.costs.market.standardCol : T.costs.thCost,
                ...marknader.map((m) => (m === market ? `▸ ${marknadsnamn(m, lang, m)}` : marknadsnamn(m, lang, m))),
                T.costs.thCmPerUnit,
                T.costs.thBeRoas,
              ]}
              rows={rows.map((r) => [
                <Link key={r.variantGid} to={`/app/costs/${r.productGid.split("/").pop()}`}>
                  {r.productTitle}
                </Link>,
                r.variantTitle === "Default Title" ? "—" : r.variantTitle,
                kr(r.price),
                r.standardCost == null ? "—" : kr(r.standardCost),
                ...marknader.map((m) => {
                  const egen = r.perMarknad[m];
                  if (egen != null) {
                    return <Text key={`${m}${r.variantGid}`} as="span" fontWeight="semibold">{kr(egen)}</Text>;
                  }
                  if (r.standardCost == null) return "—";
                  return <Text key={`${m}${r.variantGid}`} as="span" tone="subdued">{`${kr(r.standardCost)} *`}</Text>;
                }),
                (() => {
                  const k = perStyck(r.price, r.unitCost);
                  if (!k) {
                    const sp = market ? null : spann(r);
                    if (sp) {
                      const hi = perStyck(r.price, sp.min)!, lo = perStyck(r.price, sp.max)!;
                      return (
                        <Text key={`tb${r.variantGid}`} as="span" tone={lo.tb > 0 ? undefined : "critical"}>
                          {lo.tb === hi.tb ? kr(lo.tb) : `${nf.format(lo.tb)}–${kr(hi.tb)}`}
                        </Text>
                      );
                    }
                    return <Badge key={`tb${r.variantGid}`} tone="critical">{T.costs.missingBadge}</Badge>;
                  }
                  return (
                    <Text key={`tb${r.variantGid}`} as="span" tone={k.tb > 0 ? undefined : "critical"}>
                      {kr(k.tb)}
                    </Text>
                  );
                })(),
                (() => {
                  const k = perStyck(r.price, r.unitCost);
                  if (!k) {
                    const sp = market ? null : spann(r);
                    if (!sp) return "—";
                    const a = perStyck(r.price, sp.min)!.beRoas, b = perStyck(r.price, sp.max)!.beRoas;
                    if (a == null || b == null) return <Badge key={`be${r.variantGid}`} tone="critical">{T.costs.unprofitable}</Badge>;
                    return <Text key={`be${r.variantGid}`} as="span">{a === b ? `${dec(a.toFixed(2))}×` : `${dec(a.toFixed(2))}–${dec(b.toFixed(2))}×`}</Text>;
                  }
                  /* Vilket pris talet vilar på: det kunderna betalat (90 dagar),
                     delvis listpris (äldre rader utan pris), eller listpris när
                     inget sålts. */
                  const prisText = (x: NonNullable<typeof r.be>) =>
                    x.antagen ? T.costs.be.priceList : x.delvisListpris ? T.costs.be.pricePartly : T.costs.be.priceRealized;
                  /* Break-even på den FAKTISKA mixen (tvåpack betalar tullen en
                     gång, får packpriset). Utan försäljning: styckantagande, märkt. */
                  const be = r.be;
                  if (be && be.beRoas != null) {
                    /* Färgen mot butikens MER (30 stängda dagar), inte mot fasta
                       2/3 — och ingen färg utan MER, på listpris utan
                       försäljning eller under tre orderrader. */
                    return (
                      <span key={`be${r.variantGid}`}>
                        <Text as="span" tone={beTon(be.beRoas, storeMer, beUnderlag(be))}>
                          {`${dec(be.beRoas.toFixed(2))}×`}
                        </Text>
                        <br />
                        <Text as="span" variant="bodySm" tone="subdued">
                          {be.antagen ? T.costs.be.assumed : mixText(be.mix, T.costs.be.unit)}
                        </Text>
                        <br />
                        <Text as="span" variant="bodySm" tone="subdued">{prisText(be)}</Text>
                      </span>
                    );
                  }
                  /* Mixen olönsam på det kunderna betalat: säg det. Förut föll
                     cellen då tillbaka på styckräkningen på LISTPRIS, som kunde
                     se lönsam ut just när mängdrabatten var problemet. Men bara
                     när minst tre orderrader bär priset — en enda giveaway med
                     100 %-kod är ingen dom över varianten. Då: styckräkningen på
                     listpris, märkt och utan färg. */
                  const tunt = be != null && !be.antagen && tunntPris(be.prisade ?? 0);
                  if (k.beRoas == null || (be && !be.antagen && !tunt))
                    return <Badge key={`be${r.variantGid}`} tone="critical">{T.costs.unprofitable}</Badge>;
                  /* Styckräkning på listpris (mixen gick inte att räkna eller
                     vilar på för få ordrar) — ett antagande, alltså ingen färg. */
                  return (
                    <span key={`be${r.variantGid}`}>
                      <Text as="span">{`${dec(k.beRoas.toFixed(2))}×`}</Text>
                      {tunt ? (
                        <>
                          <br />
                          <Text as="span" variant="bodySm" tone="subdued">{T.costs.be.thinFallback}</Text>
                        </>
                      ) : null}
                    </span>
                  );
                })(),
              ])}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

/**
 * En rad i kvittot från AI-rutan: vad som skrevs, var, och "Ta bort" som
 * ångrar just den raden (samma väg som Ta bort kostnad).
 */
/** AI-rutans och offertsvarets resultat, i den form sidan får tillbaka. */
type SmartSvar = {
  applied: SmartKvitto[];
  skipped: string[];
  question: string;
  notes: string;
  choices?: SmartValRad[];
  /** Offertsvaret har egen rubrik: "Lades inte in" säger mer än "gick inte att koppla". */
  skippedTitle?: string;
};

/**
 * Resultatet av en inmatning: fråga + alternativ, kvittot per skriven rad,
 * det som inte skrevs och en anmärkning. Delas av den stora rutan och
 * offertkortet — samma kvitto oavsett väg in, annars ser samma skrivning
 * olika ut beroende på var man klistrade.
 */
function SmartResultat({ data, kor, valtId, onValj, T, nf, currency, lang }: {
  data: { ok: boolean; message: string; smart?: SmartSvar };
  kor: string;
  valtId: string | null;
  onValj: (v: SmartValRad) => void;
  T: ReturnType<typeof t>;
  nf: Intl.NumberFormat;
  currency: string;
  lang: "en" | "sv";
}) {
  const hoppade = data.smart?.skipped ?? [];
  const VISA = 30;
  return (
    <BlockStack gap="200">
      {!data.ok ? <Banner tone="critical">{data.message}</Banner> : null}
      {data.smart?.question ? (
        <Banner tone={data.smart.choices?.length ? "info" : "warning"}>
          <BlockStack gap="100">
            <Text as="p" fontWeight="semibold">{data.smart.question}</Text>
            {data.smart.choices?.length ? <Text as="p" variant="bodySm">{T.costs.smart.pickHint}</Text> : null}
          </BlockStack>
        </Banner>
      ) : null}
      {/* Alternativen: tryck på det som stämmer, så skrivs allt.
          Siffrorna är källans egna, så de går att känna igen
          direkt i skärmbilden man just släppte. */}
      {data.smart?.choices?.map((c) => (
        <Card key={c.id} background="bg-surface-secondary">
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm">{c.label}</Text>
            {c.explain ? <Text as="p" variant="bodySm" tone="subdued">{c.explain}</Text> : null}
            <div style={{ whiteSpace: "pre-wrap" }}>
              <Text as="p" variant="bodySm" tone="subdued">{c.preview}</Text>
            </div>
            <div>
              <Button
                variant="primary"
                disabled={kor === "smart-apply"}
                loading={kor === "smart-apply" && valtId === c.id}
                onClick={() => onValj(c)}
              >
                {T.costs.smart.useThis(c.rader)}
              </Button>
            </div>
          </BlockStack>
        </Card>
      ))}
      {data.ok && data.message ? (
        <Banner tone={data.smart?.applied.length ? "success" : "warning"}>{data.message}</Banner>
      ) : null}
      {data.smart?.applied.map((k, i) => (
        <SmartKvittoRad key={`${k.targets}|${k.market}|${i}`} k={k} T={T} nf={nf} currency={currency} lang={lang} />
      ))}
      {hoppade.length ? (
        <Banner tone="warning" title={data.smart?.skippedTitle || T.costs.smart.skippedTitle}>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {hoppade.slice(0, VISA).map((u, i) => <li key={`${u}${i}`}>{u}</li>)}
          </ul>
          {hoppade.length > VISA ? <p>{T.costs.smart.andMore(hoppade.length - VISA)}</p> : null}
        </Banner>
      ) : null}
      {data.smart?.notes ? <Text as="p" variant="bodySm" tone="subdued">{data.smart.notes}</Text> : null}
    </BlockStack>
  );
}

/**
 * Offertkortet: ett färdigt meddelande till leverantören för alla sålda
 * varianter som saknar kostnad, i alla aktiva marknader, för 1, 2 och 3 st —
 * och en ruta där hennes svar klistras in och läses tillbaka.
 *
 * Meddelandet byggs i webbläsaren ur loaderns luckor, så att valen (bara
 * helt saknade / även länder på standardkostnad, osålda, valuta) byter
 * texten direkt utan ett anrop.
 */
function Offertkort({ offert, startLage, oppna, T, nf, currency, lang }: {
  offert: { luckor: Offertvariant[]; butik: string; datum: string };
  startLage: "saknas" | "alla";
  oppna: boolean;
  T: ReturnType<typeof t>;
  nf: Intl.NumberFormat;
  currency: string;
  lang: "en" | "sv";
}) {
  const Q = T.costs.quoteReq;
  const fetcher = useFetcher<typeof action>();
  /* Finns inget som saknar kostnad helt, men länder på standardkostnad,
     börjar kortet på "även länder" — annars stod det tomt vid första anblick. */
  const harHelt = offert.luckor.some((v) => v.helt && v.sald);
  const [lage, setLage] = useState<"saknas" | "alla">(startLage === "alla" || !harHelt ? "alla" : "saknas");
  const [osalda, setOsalda] = useState(false);
  const [valuta, setValuta] = useState("USD");
  const [svar, setSvar] = useState("");
  const [kopierat, setKopierat] = useState<"" | "ok" | "fel">("");
  const [valtId, setValtId] = useState<string | null>(null);
  const kortRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const valda = useMemo(() => valjOffertrader(offert.luckor, { lage, osalda }), [offert.luckor, lage, osalda]);
  const lander = useMemo(() => new Set(valda.flatMap((v) => v.saknas)).size, [valda]);
  const meddelande = useMemo(
    () =>
      byggOffertmeddelande({
        butik: offert.butik,
        datum: offert.datum,
        valuta,
        varianter: valda,
        /* Leverantören läser engelska — landsnamnen också. */
        landsnamn: (k) => marknadsnamn(k, "en", k),
      }),
    [offert.butik, offert.datum, valuta, valda],
  );
  useEffect(() => setKopierat(""), [meddelande]);
  /* Kom man hit via en länk ("Be om offert →") ska kortet synas direkt. */
  useEffect(() => {
    if (oppna) kortRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [oppna]);

  const data = fetcher.data as unknown as { ok: boolean; message: string; smart?: SmartSvar } | undefined;
  const kor = fetcher.state !== "idle" ? String(fetcher.formData?.get("intent") ?? "") : "";
  /* Efter en lyckad inläsning töms rutan — kvittot står kvar under. */
  useEffect(() => {
    if (fetcher.state === "idle" && data?.ok && data.smart?.applied.length) setSvar("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state]);

  /* Kortet försvinner när inget saknas längre — men inte mitt i ett kvitto:
     sidan laddar om sina luckor efter inläsningen, och då skulle kvittot
     för det man just lade in försvinna samtidigt. */
  if (!offert.luckor.length && !data) return null;

  const kopiera = async () => {
    try {
      await navigator.clipboard.writeText(meddelande);
      setKopierat("ok");
      return;
    } catch {
      /* Shopifys ram kan neka urklippet — då markeras texten och webbläsarens
         egen kopiering provas. Går inte heller den säger kortet hur. */
    }
    const el = textRef.current;
    if (el) {
      el.focus();
      el.select();
      try {
        if (document.execCommand("copy")) {
          setKopierat("ok");
          return;
        }
      } catch {
        /* faller igenom */
      }
    }
    setKopierat("fel");
  };
  const valj = (v: SmartValRad) => {
    setValtId(v.id);
    fetcher.submit(
      {
        intent: "smart-apply",
        rows: v.rows,
        unmatched: JSON.stringify(data?.smart?.skipped ?? []),
        notes: data?.smart?.notes ?? "",
      },
      { method: "POST" },
    );
  };
  const valutor = [...new Set(["USD", "CNY", "EUR", currency])];

  return (
    <div ref={kortRef} id="offert">
      <Card>
        <BlockStack gap="300">
          <Text as="h2" variant="headingLg">{Q.title}</Text>
          {valda.length ? (
            <Text as="p" tone="subdued">{Q.body(valda.length, lander)}</Text>
          ) : (
            <Banner tone="info">{Q.none}</Banner>
          )}
          <InlineStack gap="600" wrap blockAlign="start">
            <ChoiceList
              title={Q.modeLabel}
              choices={[
                { label: Q.modeMissing, value: "saknas" },
                { label: Q.modeAll, value: "alla" },
              ]}
              selected={[lage]}
              onChange={(v) => setLage(v[0] === "alla" ? "alla" : "saknas")}
            />
            <BlockStack gap="200">
              <Checkbox label={Q.includeUnsold} checked={osalda} onChange={setOsalda} />
              <div style={{ maxWidth: 160 }}>
                <Select label={Q.currencyLabel} options={valutor} value={valuta} onChange={setValuta} />
              </div>
            </BlockStack>
          </InlineStack>

          {valda.length ? (
            <BlockStack gap="200">
              <Text as="p" fontWeight="semibold">{Q.step1}</Text>
              <Text as="span" variant="bodySm" tone="subdued">{Q.summary(valda.length, lander)}</Text>
              <textarea
                ref={textRef}
                readOnly
                aria-label={Q.messageLabel}
                value={meddelande}
                onFocus={(e) => e.currentTarget.select()}
                style={{
                  width: "100%",
                  minHeight: 220,
                  boxSizing: "border-box",
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 12,
                  lineHeight: 1.45,
                  padding: 10,
                  border: "1px solid #c9cccf",
                  borderRadius: 8,
                  resize: "vertical",
                }}
              />
              <InlineStack gap="300" blockAlign="center">
                <Button variant="primary" onClick={kopiera}>{kopierat === "ok" ? Q.copied : Q.copy}</Button>
                {kopierat === "fel" ? <Text as="span" tone="caution">{Q.copyFailed}</Text> : null}
              </InlineStack>
            </BlockStack>
          ) : null}

          <BlockStack gap="200">
            <Text as="p" fontWeight="semibold">{Q.step2}</Text>
            <TextField
              label={Q.replyLabel}
              labelHidden
              value={svar}
              onChange={setSvar}
              autoComplete="off"
              multiline={6}
              placeholder={Q.replyPlaceholder}
            />
            <div>
              <Button
                disabled={!svar.trim()}
                loading={kor === "offert-svar"}
                onClick={() => fetcher.submit({ intent: "offert-svar", text: svar }, { method: "POST" })}
              >
                {kor === "offert-svar" ? Q.reading : Q.readReply}
              </Button>
            </div>
            {data && kor !== "offert-svar" ? (
              <SmartResultat data={data} kor={kor} valtId={valtId} onValj={valj} T={T} nf={nf} currency={currency} lang={lang} />
            ) : null}
          </BlockStack>
        </BlockStack>
      </Card>
    </div>
  );
}

function SmartKvittoRad({
  k, T, nf, currency, lang,
}: {
  k: { label: string; product: string; variant: string; market: string; cost: number; before: number | null; original: string; tiers: { units: number; total: number }[]; targets: string };
  T: ReturnType<typeof t>;
  nf: Intl.NumberFormat;
  currency: string;
  lang: "en" | "sv";
}) {
  const fetcher = useFetcher<typeof action>();
  const borttagen = fetcher.state === "idle" && (fetcher.data as { ok?: boolean } | undefined)?.ok;
  const var_ = k.variant && k.variant !== "Default Title" ? ` · ${k.variant}` : "";
  const marknad = k.market ? marknadsnamn(k.market, lang, k.market) : T.costs.market.standardShort;
  const steg = k.tiers.length
    ? " · " + k.tiers.map((s) => T.costs.bundle.line(s.units, `${nf.format(s.total)} ${currency}`, `${nf.format(s.total / s.units)} ${currency}`)).join(" · ")
    : "";
  /* Skrev vi över något? Visa vad som stod där innan — annars går det inte
     att se om en ny prislista faktiskt ändrade något. */
  const fore = k.before != null && Math.abs(k.before - k.cost) > 0.005 ? `${nf.format(k.before)} → ` : "";
  return (
    <InlineStack gap="300" blockAlign="center" wrap>
      <Text as="span" tone={borttagen ? "subdued" : undefined}>
        {borttagen ? "✕ " : "✓ "}
        <Text as="span" fontWeight="semibold">{k.product}{var_}</Text>
        {` — ${marknad} — ${fore}${nf.format(k.cost)} ${currency}${k.original ? ` (${k.original})` : ""}${steg}`}
      </Text>
      {!borttagen ? (
        <Button
          variant="plain"
          tone="critical"
          size="slim"
          loading={fetcher.state !== "idle"}
          onClick={() => fetcher.submit({ intent: "remove-cost", targets: k.targets, market: k.market }, { method: "POST" })}
        >
          {T.costs.quick.remove}
        </Button>
      ) : null}
    </InlineStack>
  );
}

type Rad = {
  productGid: string;
  variantGid: string;
  inventoryItemGid: string;
  productTitle: string;
  variantTitle: string;
  price: number;
  unitCost: number | null;
  /** Packpriser: totalkostnad för `units` stycken i samma orderrad. */
  tiers: { units: number; totalCost: number }[];
  /** Under en marknad: kostnaden är standardens, ingen egen post för landet. */
  arvd?: boolean;
  /** Kostnaden är EGEN för läget (standard i Standard-läget, landets i landets). */
  egen?: boolean;
  /** Shopifys standardkostnad, oavsett valt läge. */
  standardCost?: number | null;
  /** Egen kostnad per marknad; null = ärver standard. */
  perMarknad?: Record<string, number | null>;
  /** Har kostnad där det behövs: standard, eller egen på varje säljmarknad. */
  tackt?: boolean;
  /** Break-even på den faktiska flerpacksmixen (90 dagar). */
  be?: {
    beRoas: number | null; tb: number | null; revenue: number | null; lines: number; antagen: boolean; olonsamNagon: boolean;
    /** Någon såld packstorlek räknades på listpris (äldre rader utan pris). */
    delvisListpris?: boolean;
    /** Orderrader bakom de realiserade priserna. Under tre: ingen dom. */
    prisade?: number;
    mix: { qty: number; share: number }[];
  };
};

/** "1 st 88,34 kr · 2 st 134,22 kr totalt (67,11/st)" — vad appen räknar med. */
function stegText(
  unitCost: number | null,
  tiers: { units: number; totalCost: number }[],
  T: ReturnType<typeof t>,
  nf: Intl.NumberFormat,
  currency: string,
): string {
  if (!tiers.length) return "";
  return [
    ...(unitCost != null ? [T.costs.bundle.single(`${nf.format(unitCost)} ${currency}`)] : []),
    ...tiers.map((s) =>
      T.costs.bundle.line(s.units, `${nf.format(s.totalCost)} ${currency}`, `${nf.format(s.totalCost / s.units)} ${currency}`),
    ),
  ].join(" · ");
}

type OffertItem = {
  label: string;
  /** Pris för 1 st i OFFERTENS valuta — aldrig omräknat på servern. */
  unitCost: number;
  /** Packpriser i offertens valuta: totalpris för `units` stycken. */
  tiers: { units: number; total: number }[];
  moq: number;
  /** Radens EGEN valuta om AI:n såg en. Tom = använd kortets val. */
  currency: string;
  suggestedProduct: string;
  suggestedVariant: string;
};

/**
 * En rad ur offerten: priserna, produktval, variantval, "Lägg in".
 *
 * Omräkningen sker HÄR, med kursen för den valuta handlaren valt i kortet —
 * inte på servern. Då kan valutan bytas i en rullista och alla rader räknas
 * om direkt, utan att offerten måste läsas av AI:n en gång till.
 *
 * Flerpacken skrivs ut med både totalpris och styckpris, så det syns att
 * 2 st för 15 är 15 totalt och inte 2 × 10.
 */
function OffertRad({
  it, rows, T, nf, currency, valuta, kurser, market,
}: {
  it: OffertItem;
  rows: Rad[];
  T: ReturnType<typeof t>;
  nf: Intl.NumberFormat;
  currency: string;
  valuta: string;
  kurser: Record<string, number | null>;
  market: string;
}) {
  const fetcher = useFetcher<typeof action>();
  const produkter = (() => {
    const m = new Map<string, Rad[]>();
    for (const r of rows) (m.get(r.productGid) ?? m.set(r.productGid, []).get(r.productGid)!).push(r);
    return [...m.values()].sort((a, b) => a[0].productTitle.localeCompare(b[0].productTitle));
  })();
  const forslag = produkter.find((g) => g[0].productTitle.trim().toLowerCase() === it.suggestedProduct.trim().toLowerCase());
  const [productGid, setProductGid] = useState(forslag?.[0].productGid ?? "");
  const grupp = produkter.find((g) => g[0].productGid === productGid) ?? [];
  const forslagVariant = grupp.find((r) => r.variantTitle.trim().toLowerCase() === it.suggestedVariant.trim().toLowerCase());
  const [variantGid, setVariantGid] = useState(forslagVariant?.variantGid ?? "");
  /* Radens egen valuta går före kortets val: två skärmbilder i en läsning
     kan vara i olika valutor, och att räkna rad fyra med rad ettas kurs gav
     sjufalt fel inköpspris utan att något sades. */
  const radValuta = it.currency || valuta;
  const kurs = kurser[radValuta] ?? null;
  const egenValuta = Boolean(it.currency) && it.currency !== valuta;
  const rund = (n: number) => Math.round(n * 100) / 100;
  const iButik = (n: number) => (kurs == null ? null : rund(n * kurs));
  /* Packpriserna normaliseras: ett steg utan antal (gammalt svarsformat) är
     inte tolkningsbart och släpps hellre än att gissa ett antal. */
  const steg = ((it.tiers ?? []) as unknown[])
    .map((s) => {
      const o = s as { units?: unknown; total?: unknown };
      return { units: Math.round(Number(o?.units) || 0), total: Number(o?.total) || 0 };
    })
    .filter((s) => s.units >= 2 && s.total > 0);
  const [kostnad, setKostnad] = useState(() => {
    const v = iButik(it.unitCost);
    return v == null ? "" : String(v);
  });
  /* Byter handlaren valuta i kortet ska beloppet följa med direkt. Ett
     handskrivet belopp skrivs över — det var skrivet i den gamla valutan. */
  useEffect(() => {
    const v = kurs == null ? null : rund(it.unitCost * kurs);
    setKostnad(v == null ? "" : String(v));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kurs, radValuta]);
  const stegButik = kurs == null ? [] : steg.map((s) => ({ units: s.units, total: rund(s.total * kurs) }));
  /* Packpriser utan kurs går inte att räkna om. Att spara ändå hade skrivit
     ett nytt styckpris medan de gamla packpriserna låg kvar — en variant
     vars 2-pack kostar mindre än 1 st. Knappen låses i stället. */
  const stegUtanKurs = steg.length > 0 && kurs == null;
  /* Vad som senast sparades. Utan den låste knappen sig för alltid efter
     första klicket, även när valutan eller beloppet ändrats efteråt. */
  const [sparatVal, setSparatVal] = useState("");
  const signatur = `${productGid}|${variantGid}|${kostnad}|${radValuta}`;
  const sparad = fetcher.data?.ok === true && sparatVal === signatur && fetcher.state === "idle";

  /* Priserna som de STÅR i offerten: 1 st, sedan varje packpris med sitt
     styckpris inom parentes. Poängen är att 2 st för 15 ska läsas som 15
     totalt, inte som 2 × styckpriset. */
  const prisrader = [
    T.costs.bundle.single(`${nf.format(it.unitCost)} ${radValuta}`),
    ...steg.map((s) =>
      T.costs.bundle.line(s.units, `${nf.format(s.total)} ${radValuta}`, `${nf.format(s.total / s.units)} ${radValuta}`),
    ),
  ].join(" · ");

  const mal = variantGid ? grupp.filter((r) => r.variantGid === variantGid) : grupp;
  const laggIn = () => {
    if (!mal.length || !kostnad.trim() || stegUtanKurs) return;
    setSparatVal(signatur);
    fetcher.submit(
      {
        intent: "quote-apply",
        cost: kostnad,
        inv: mal.map((r) => r.inventoryItemGid).join(","),
        variants: mal.map((r) => r.variantGid).join(","),
        tiers: stegButik.map((s) => `${s.units}:${s.total}`).join(","),
        market,
      },
      { method: "POST" },
    );
  };

  return (
    <div style={{ borderTop: "1px solid #e3e3e3", paddingTop: 8 }}>
      <BlockStack gap="150">
        <InlineStack gap="200" blockAlign="center" wrap>
          <Text as="span" fontWeight="semibold">{it.label}</Text>
          {it.moq ? <Badge>{T.costs.quote.moq(it.moq)}</Badge> : null}
          {steg.length ? <Badge tone="info">{T.costs.bundle.badge}</Badge> : null}
        </InlineStack>
        <Text as="p" tone="subdued" variant="bodySm">{prisrader}</Text>
        {egenValuta ? (
          <Text as="p" variant="bodySm" tone="caution">{T.costs.quote.rowCurrency(radValuta)}</Text>
        ) : null}
        {kurs == null ? (
          <Text as="p" tone="critical" variant="bodySm">
            {T.costs.quote.noRate(radValuta)}
            {stegUtanKurs ? ` ${T.costs.bundle.noRate}` : ""}
          </Text>
        ) : kurs !== 1 ? (
          <Text as="p" tone="subdued" variant="bodySm">
            {T.costs.quote.converted(radValuta, currency, kurs)}
            {stegButik.length
              ? ` · ${[T.costs.bundle.single(`${nf.format(rund(it.unitCost * kurs))} ${currency}`), ...stegButik.map((s) => T.costs.bundle.line(s.units, `${nf.format(s.total)} ${currency}`, `${nf.format(s.total / s.units)} ${currency}`))].join(" · ")}`
              : ""}
          </Text>
        ) : null}
        <InlineStack gap="200" blockAlign="end" wrap>
          <div style={{ flex: 2, minWidth: 220 }}>
            <Select
              label={T.costs.quote.product}
              options={[{ label: T.costs.quote.pick, value: "" }, ...produkter.map((g) => ({ label: g[0].productTitle, value: g[0].productGid }))]}
              value={productGid}
              onChange={(v) => { setProductGid(v); setVariantGid(""); }}
            />
          </div>
          {grupp.length > 1 ? (
            <div style={{ flex: 1, minWidth: 160 }}>
              <Select
                label={T.costs.quote.variant}
                options={[{ label: T.costs.quote.allVariants, value: "" }, ...grupp.map((r) => ({ label: r.variantTitle, value: r.variantGid }))]}
                value={variantGid}
                onChange={setVariantGid}
              />
            </div>
          ) : null}
          <div style={{ width: 140 }}>
            <TextField label={T.costs.thCost} value={kostnad} onChange={setKostnad} autoComplete="off" suffix={currency} />
          </div>
          <Button variant="primary" disabled={!mal.length || !kostnad.trim() || sparad || stegUtanKurs} loading={fetcher.state !== "idle"} onClick={laggIn}>
            {sparad ? T.costs.quote.applied : T.costs.quote.apply}
          </Button>
          {fetcher.data && !fetcher.data.ok ? <Badge tone="critical">{fetcher.data.message}</Badge> : null}
        </InlineStack>
      </BlockStack>
    </div>
  );
}

/**
 * En produkt i snabbfältet. Ett fält på produktnivå som skriver samma kostnad
 * till alla varianter (så ser en leverantörsprislista oftast ut); "Sätt per
 * variant" fäller ut ett fält per variant. Enter eller lämna fältet sparar.
 */
function Produktrad({
  grupp, T, nf, currency, market, inValuta, kurs,
}: {
  grupp: Rad[]; T: ReturnType<typeof t>; nf: Intl.NumberFormat; currency: string; market: string;
  /** Valutan fältet skrivs i, och kursen till butikens valuta (1 = samma). */
  inValuta: string; kurs: number | null;
}) {
  const fetcher = useFetcher<typeof action>();
  const [open, setOpen] = useState(false);
  /* Fältet visas i INVALUTAN: ett sparat belopp i kronor räknas tillbaka så
     att det går att jämföra med leverantörens dollarpris. */
  const iIn = (v: number | null) => (v == null ? null : kurs ? Math.round((v / kurs) * 100) / 100 : null);
  const kostnader = grupp.map((r) => r.unitCost);
  const alla = kostnader.every((k) => k != null);
  const lika = alla && kostnader.every((k) => k === kostnader[0]);
  const saknas = kostnader.filter((k) => k == null).length;
  /* Under en marknad står bara marknadens EGEN kostnad i fältet. Ärver
     produkten standarden visas den som förslag (placeholder) — så syns det
     att landet saknar egen kostnad, och vad som räknas tills den finns. */
  const egna = grupp.map((r) => (r.egen ? r.unitCost : null));
  const allaEgna = egna.every((k) => k != null);
  const likaEgna = allaEgna && egna.every((k) => k === egna[0]);
  const [v, setV] = useState(likaEgna && egna[0] != null ? String(iIn(egna[0]) ?? "") : "");
  const [sparat, setSparat] = useState(false);
  const arvdText = market && lika && kostnader[0] != null && !allaEgna ? T.costs.market.inheritedPlaceholder(nf.format(iIn(kostnader[0]) ?? kostnader[0])) : "";
  const kanSpara = inValuta === currency || kurs != null;

  const spara = (targets: string[], value: string) => {
    if (!value.trim() || !kanSpara) return;
    fetcher.submit({ intent: "set-cost", cost: value, targets: targets.join(","), market, currency: inValuta }, { method: "POST" });
    setSparat(true);
    setTimeout(() => setSparat(false), 2500);
  };
  /* Ta bort: kostnaden försvinner (Shopify-fältet rensas, eller marknadens
     post tas bort så standarden gäller igen). Tömmer man fältet och lämnar
     det händer samma sak — ett tomt fält ska betyda "ingen kostnad". */
  const taBort = (targets: string[]) => {
    fetcher.submit({ intent: "remove-cost", targets: targets.join(","), market }, { method: "POST" });
    setV("");
  };
  /* "Ta bort" bara när det finns något EGET att ta bort — en ärvd standard
     hör till Standard-läget och tas bort där. */
  const harKostnad = egna.some((k) => k != null);
  const onKey = (targets: string[], value: string) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") spara(targets, value);
  };
  const p = grupp[0];
  const pris = grupp.length > 1 && grupp.some((r) => r.price !== p.price)
    ? `${nf.format(Math.min(...grupp.map((r) => r.price)))}–${nf.format(Math.max(...grupp.map((r) => r.price)))}`
    : nf.format(p.price);

  /* Packpriserna skrivs ut, annars är de osynliga tills man öppnar produkten
     — och då går det inte att se att appen VET att 2 st kostar 15 och inte
     2 × 10. Skiljer sig stegen mellan varianterna hänvisas till produkten. */
  const medSteg = grupp.filter((r) => r.tiers.length);
  const stegNyckel = (r: Rad) => r.tiers.map((s) => `${s.units}:${s.totalCost}`).join("|");
  const sammaSteg =
    medSteg.length === grupp.length &&
    new Set(grupp.map(stegNyckel)).size === 1 &&
    new Set(grupp.map((r) => r.unitCost)).size === 1;
  const stegRad =
    medSteg.length === 0
      ? ""
      : sammaSteg
        ? stegText(p.unitCost, medSteg[0].tiers, T, nf, currency)
        : T.costs.bundle.perVariant(medSteg.length);

  return (
    <div style={{ borderBottom: "1px solid #e3e3e3", paddingBottom: 8 }}>
      <InlineStack gap="300" blockAlign="center" wrap>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Text as="span" fontWeight="semibold">{p.productTitle}</Text>
          <Text as="span" tone="subdued" variant="bodySm">{`  · ${pris} ${currency}${grupp.length > 1 ? ` · ${T.costs.quick.variants(grupp.length)}` : ""}`}</Text>
        </div>
        <div style={{ width: 150 }} onKeyDown={onKey(grupp.map((r) => r.inventoryItemGid), v)}>
          <TextField
            label={T.costs.thCost}
            labelHidden
            value={v}
            onChange={setV}
            onBlur={() => {
              if (v && String(iIn(egna[0]) ?? "") !== v) spara(grupp.map((r) => r.inventoryItemGid), v);
              else if (!v && likaEgna && harKostnad) taBort(grupp.map((r) => r.inventoryItemGid));
            }}
            autoComplete="off"
            placeholder={arvdText || (!alla ? T.costs.quick.placeholder : !lika ? T.costs.quick.mixed : "")}
            suffix={inValuta}
            disabled={(!lika && alla && !open) || !kanSpara}
          />
        </div>
        {saknas ? (
          !market && grupp.every((r) => r.tackt) ? (
            <Badge tone="info">{T.costs.market.perMarketBadge}</Badge>
          ) : (
            <Badge tone="critical">{T.costs.missingBadge}</Badge>
          )
        ) : sparat || fetcher.state !== "idle" ? (
          <Badge tone="success">{fetcher.state !== "idle" ? T.costs.quick.saving : T.costs.quick.saved}</Badge>
        ) : grupp.every((r) => r.arvd) ? (
          <Badge>{T.costs.market.inheritedBadge}</Badge>
        ) : null}
        {harKostnad && !(grupp.length > 1 && !lika && !open) ? (
          <Button variant="plain" size="slim" tone="critical" onClick={() => taBort(grupp.map((r) => r.inventoryItemGid))}>
            {T.costs.quick.remove}
          </Button>
        ) : null}
        {grupp.length > 1 ? (
          <Button variant="plain" size="slim" onClick={() => setOpen((o) => !o)}>
            {open ? T.costs.quick.hideVariants : T.costs.quick.showVariants}
          </Button>
        ) : null}
        <Link to={`/app/costs/${p.productGid.split("/").pop()}`}><Text as="span" variant="bodySm">→</Text></Link>
      </InlineStack>
      {stegRad ? (
        <div style={{ paddingTop: 2 }}>
          <Badge tone="info">{T.costs.bundle.badge}</Badge>{" "}
          <Text as="span" tone="subdued" variant="bodySm">{stegRad}</Text>
        </div>
      ) : null}
      {open ? (
        <div style={{ paddingLeft: 16, paddingTop: 6 }}>
          <BlockStack gap="100">
            {grupp.map((r) => (
              <Variantrad key={`${r.variantGid}|${market}|${inValuta}`} r={r} T={T} currency={currency} nf={nf} market={market} inValuta={inValuta} kurs={kurs} />
            ))}
          </BlockStack>
        </div>
      ) : null}
    </div>
  );
}

function Variantrad({
  r, T, currency, nf, market, inValuta, kurs,
}: {
  r: Rad; T: ReturnType<typeof t>; currency: string; nf: Intl.NumberFormat; market: string; inValuta: string; kurs: number | null;
}) {
  const fetcher = useFetcher<typeof action>();
  const iIn = (v: number | null) => (v == null ? null : kurs ? Math.round((v / kurs) * 100) / 100 : null);
  const kanSpara = inValuta === currency || kurs != null;
  const [v, setV] = useState(r.egen && r.unitCost != null ? String(iIn(r.unitCost) ?? "") : "");
  const taBort = () => fetcher.submit({ intent: "remove-cost", targets: r.inventoryItemGid, market }, { method: "POST" });
  const arvdText = r.arvd && r.unitCost != null ? T.costs.market.inheritedPlaceholder(nf.format(iIn(r.unitCost) ?? r.unitCost)) : "";
  const spara = () => {
    if (!v.trim()) {
      if (r.unitCost != null && !r.arvd) taBort();
      return;
    }
    if (String(iIn(r.unitCost) ?? "") === v || !kanSpara) return;
    fetcher.submit({ intent: "set-cost", cost: v, targets: r.inventoryItemGid, market, currency: inValuta }, { method: "POST" });
  };
  const steg = stegText(r.unitCost, r.tiers, T, nf, currency);
  return (
    <BlockStack gap="100">
      <InlineStack gap="300" blockAlign="center" wrap>
        <div style={{ flex: 1, minWidth: 160 }}>
          <Text as="span" variant="bodySm">{r.variantTitle === "Default Title" ? "—" : r.variantTitle}</Text>
          <Text as="span" variant="bodySm" tone="subdued">{`  · ${nf.format(r.price)} ${currency}`}</Text>
        </div>
        <div style={{ width: 150 }} onKeyDown={(e) => { if (e.key === "Enter") spara(); }}>
          <TextField label={T.costs.thCost} labelHidden value={v} onChange={setV} onBlur={spara} autoComplete="off" placeholder={arvdText || T.costs.quick.placeholder} suffix={inValuta} disabled={!kanSpara} />
        </div>
        {r.unitCost == null && !v ? (
          !market && r.tackt ? <Badge tone="info">{T.costs.market.perMarketBadge}</Badge> : <Badge tone="critical">{T.costs.missingBadge}</Badge>
        ) : fetcher.state !== "idle" ? <Badge tone="success">{T.costs.quick.saving}</Badge> : null}
        {r.unitCost != null && !r.arvd ? (
          <Button variant="plain" size="slim" tone="critical" onClick={taBort}>{T.costs.quick.remove}</Button>
        ) : null}
      </InlineStack>
      {steg ? <Text as="p" tone="subdued" variant="bodySm">{steg}</Text> : null}
    </BlockStack>
  );
}
