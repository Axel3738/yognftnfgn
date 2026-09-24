/**
 * Google Ads-kostnaden in i samma tabeller som Metas.
 *
 * Google skriver `DailySpend`/`HourlySpend` med kontot `g:<kundnummer>`.
 * Därmed räknar panelen, gruppsumman, timgrafen, MER och break-even redan
 * med Google utan att en enda rad i räknemotorn ändras — och en butik som
 * kör både Meta och Google får EN annonskostnad, inte två system som ska
 * jämkas i huvudet.
 *
 * Marknaden är alltid "". Google-kampanjer har ingen marknadsmärkning ännu
 * (Meta har det via kampanjfiltret), så kostnaden syns i vyn "alla
 * marknader" och räknas inte in när en enskild marknad är vald. Det är
 * samma regel som gäller omärkta Meta-kampanjer: hellre utanför en
 * marknadssiffra än felaktigt inne i den.
 */

import prisma from "../db.server";
import { dailyRates, rateOn } from "./fx.server";
import { shiftIso } from "./daily.server";
import {
  faAccessToken,
  googleConfig,
  GoogleError,
  hamtaGoogleKonton,
  hamtaRefreshToken,
  hamtaSpend,
  somKonto,
  type GoogleConfig,
} from "./google-ads.server";

/** Samma fönster som Meta: timrader äldre än så hämtas aldrig. */
const TIMFONSTER_DAGAR = 31;
/** Hur gammal en rad för en rörlig dag får vara innan den hämtas om. */
const FERSK_MS = 10 * 60 * 1000;

export interface GoogleUtfall {
  /** DailySpend-kontona som nu är kopplade ("g:123…"). Tom = inget kopplat. */
  konton: string[];
  /** Sant när kopplingen är död och handlaren måste logga in igen. */
  utgangen?: boolean;
  error?: string;
  /** Kontovalutor som behövde räknas om men saknade kurs. */
  fxSaknas?: string[];
  /** Kontovalutor som räknades om. */
  fxFran?: string[];
}

/* En access-token lever en timme. Att byta refresh-token mot en ny vid varje
   sidladdning vore ett extra Google-anrop per laddning — cachen gör det en
   gång i halvtimmen i stället. Nyckeln är butiken; token lämnar aldrig
   processen. */
const tokenCache = new Map<string, { token: string; till: number }>();
const TOKEN_MS = 30 * 60 * 1000;

/** Backoff: ett konto vars anrop nyss small ska inte betala ett nytt dömt
    anrop vid varje sidladdning. */
const senasteFel = new Map<string, { at: number; utgangen: boolean }>();
const FEL_PAUS = 5 * 60 * 1000;

/** Bakgrundshämtningar: högst en per konto och minut. */
const senasteKorning = new Map<string, number>();

/** Glöm backoffen för butiken (ny koppling sparad, koppling borttagen). */
export function glomGoogleFel(shop: string): void {
  tokenCache.delete(shop);
  for (const k of [...senasteFel.keys()]) if (k.startsWith(`${shop}:`)) senasteFel.delete(k);
}

async function accessToken(shop: string, cfg: GoogleConfig): Promise<string> {
  const hit = tokenCache.get(shop);
  if (hit && hit.till > Date.now()) return hit.token;
  const refresh = await hamtaRefreshToken(shop);
  if (!refresh) throw new GoogleError("Google is not connected.", true);
  const token = await faAccessToken(cfg, refresh);
  tokenCache.set(shop, { token, till: Date.now() + TOKEN_MS });
  return token;
}

/**
 * Uppdaterar butikens Google-rader för fönstret och säger vilka konton som
 * finns. Kastar aldrig: ett fel returneras som text så panelen kan visa
 * försäljningen ändå och flagga att annonskostnaden är ofullständig. Att
 * tyst visa noll Google-kostnad vore värre än att visa ingenting.
 */
export async function uppdateraGoogleSpend(
  shop: string,
  from: string,
  to: string,
  today: string,
  shopCurrency?: string,
  opts?: { syncFresh?: boolean },
): Promise<GoogleUtfall> {
  const cfg = googleConfig();
  if (!cfg) return { konton: [] };

  const konton = await hamtaGoogleKonton(shop).catch(() => []);
  if (!konton.length) return { konton: [] };

  const ut: GoogleUtfall = { konton: konton.map((k) => somKonto(k.customerId)) };
  const fxSaknas = new Set<string>();
  const fxFran = new Set<string>();

  const cached = await prisma.dailySpend.findMany({
    where: { shop, account: { in: ut.konton }, day: { gte: new Date(from), lte: new Date(to) } },
  });

  for (const konto of konton) {
    const namn = somKonto(konto.customerId);
    const mina = cached.filter((r) => r.account === namn);
    const finns = new Set(mina.map((r) => r.day.toISOString().slice(0, 10)));
    const fersk = new Map(mina.map((r) => [r.day.toISOString().slice(0, 10), r.fetchedAt]));

    const stale: string[] = [];
    let radSaknas = false;
    for (let d = from; d <= to; d = shiftIso(d, 1)) {
      if (!finns.has(d)) {
        stale.push(d);
        radSaknas = true;
        continue;
      }
      /* Bara dagar som fortfarande rör sig hämtas om — en stängd dag ändrar
         sig inte, och att hämta om den vore ett anrop utan innehåll. */
      const rorlig = d >= shiftIso(today, -1);
      if (rorlig && Date.now() - (fersk.get(d)?.getTime() ?? 0) > FERSK_MS) stale.push(d);
    }
    if (!stale.length) continue;

    const felKey = `${shop}:${konto.customerId}`;
    const fel = senasteFel.get(felKey);
    if (fel && Date.now() - fel.at < FEL_PAUS) {
      ut.error = fel.utgangen ? UTGANGEN : HICKA;
      ut.utgangen = ut.utgangen || fel.utgangen;
      continue;
    }

    const kor = () => hamtaKonto(shop, cfg, konto, stale, shopCurrency, fxSaknas, fxFran);

    /* Alla dagar finns, bara färskheten släpar: servera databasen direkt och
       hämta i bakgrunden. Minutgamla annonssiffror är rätt pris för en panel
       som svarar omedelbart. */
    if (!radSaknas && !opts?.syncFresh) {
      const senast = senasteKorning.get(felKey) ?? 0;
      if (Date.now() - senast > 60_000) {
        senasteKorning.set(felKey, Date.now());
        void kor().catch((e) => {
          senasteFel.set(felKey, { at: Date.now(), utgangen: e instanceof GoogleError && e.behoverOmkoppling });
          console.error(`Google-bakgrundshämtning för ${shop} (${konto.customerId}) misslyckades:`, e.message);
        });
      }
      continue;
    }

    try {
      await kor();
      senasteFel.delete(felKey);
    } catch (e) {
      const utgangen = e instanceof GoogleError && e.behoverOmkoppling;
      senasteFel.set(felKey, { at: Date.now(), utgangen });
      console.error(`Google-hämtning för ${shop} (${konto.customerId}) misslyckades:`, (e as Error).message);
      ut.error = utgangen ? UTGANGEN : `Could not fetch Google Ads spend: ${(e as Error).message}`;
      ut.utgangen = ut.utgangen || utgangen;
    }
  }

  if (fxSaknas.size) ut.fxSaknas = [...fxSaknas];
  if (fxFran.size) ut.fxFran = [...fxFran];
  return ut;
}

const UTGANGEN = "The Google connection has expired — connect Google Ads again in Settings.";
const HICKA = "Google Ads spend could not be fetched just now — retrying in a few minutes.";

/** Hämtar och skriver ett kontos dagar. Kastar vid fel — anroparen fångar. */
async function hamtaKonto(
  shop: string,
  cfg: GoogleConfig,
  konto: { customerId: string; currency: string | null; loginCustomerId: string | null },
  stale: string[],
  shopCurrency: string | undefined,
  fxSaknas: Set<string>,
  fxFran: Set<string>,
): Promise<void> {
  const namn = somKonto(konto.customerId);
  const forsta = stale[0];
  const sista = stale[stale.length - 1];

  /* Timvis bara inom fönstret — och bara när HELA spannet ryms. Ett spann
     som sträcker sig längre bak hämtas som dagar, precis som hos Meta. */
  const timvis = forsta >= shiftIso(sista, -(TIMFONSTER_DAGAR - 1));

  const token = await accessToken(shop, cfg);
  const rader = await hamtaSpend(cfg, token, konto, forsta, sista, timvis);

  /* Valutan: kontots egen mot butikens. Kurserna är ECB:s dagskurser —
     samma källa och samma bakåtsökning som Meta använder, annars kunde
     samma dag få två olika kurser beroende på vilket nätverk den kom från. */
  const fran = konto.currency ?? "";
  const behovs = Boolean(fran && shopCurrency && fran !== shopCurrency);
  const kurser = behovs ? await dailyRates(fran, shopCurrency!, forsta, sista) : undefined;
  if (behovs) (kurser ? fxFran : fxSaknas).add(fran);

  const valda = new Set(stale);
  const dagar = new Map<string, { spend: number; raw: number; kurs: number | null; imp: number; klick: number }>();
  const timmar: { day: string; hour: number; spend: number; imp: number; klick: number }[] = [];

  for (const r of rader) {
    if (!valda.has(r.day)) continue;
    const kurs = behovs ? (kurser ? (rateOn(kurser, r.day) ?? null) : null) : null;
    /* Utan kurs skrivs beloppet oomräknat och `fxRate` lämnas null — samma
       som Meta gör. Panelen ser då att raden inte är omräknad och säger
       ifrån, i stället för att addera två valutor som om de vore en. */
    const belopp = kurs != null ? r.spend * kurs : r.spend;

    const d = dagar.get(r.day) ?? { spend: 0, raw: 0, kurs, imp: 0, klick: 0 };
    d.spend += belopp;
    d.raw += r.spend;
    d.kurs = kurs;
    d.imp += r.impressions;
    d.klick += r.clicks;
    dagar.set(r.day, d);

    if (r.hour != null) {
      timmar.push({ day: r.day, hour: r.hour, spend: belopp, imp: r.impressions, klick: r.clicks });
    }
  }

  const nu = new Date();
  for (const day of stale) {
    const d = dagar.get(day);
    const rad = d
      ? {
          shop,
          day: new Date(day),
          account: namn,
          market: "",
          spend: d.spend,
          spendRaw: behovs ? d.raw : null,
          fxRate: d.kurs,
          impressions: d.imp,
          clicks: d.klick,
          fetchedAt: nu,
        }
      : /* Ingen leverans den dagen: en NOLLRAD, annars jagas dagen för evigt
           med ett nytt Google-anrop vid varje sidladdning. */
        {
          shop,
          day: new Date(day),
          account: namn,
          market: "",
          spend: 0,
          spendRaw: null,
          fxRate: null,
          impressions: 0,
          clicks: 0,
          fetchedAt: nu,
        };

    const dagensTimmar = timmar
      .filter((t) => t.day === day)
      .map((t) => ({
        shop,
        day: new Date(day),
        account: namn,
        market: "",
        hour: t.hour,
        spend: t.spend,
        impressions: t.imp,
        clicks: t.klick,
        fetchedAt: nu,
      }));

    /* Dagen skrivs om i sin helhet. Radera + skriv i EN transaktion, annars
       kan en samtidig läsning träffa mellanrummet och visa noll. */
    await prisma.$transaction([
      prisma.dailySpend.deleteMany({ where: { shop, account: namn, day: new Date(day) } }),
      prisma.dailySpend.createMany({ data: [rad] }),
      ...(timvis
        ? [
            prisma.hourlySpend.deleteMany({ where: { shop, account: namn, day: new Date(day) } }),
            ...(dagensTimmar.length ? [prisma.hourlySpend.createMany({ data: dagensTimmar })] : []),
          ]
        : []),
    ]);
  }
}
