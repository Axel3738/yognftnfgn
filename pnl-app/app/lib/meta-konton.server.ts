/**
 * Butikens annonskonton — en rad per konto i MetaAdAccount.
 *
 * Varför flera: en dropshippare som testar mycket kör ofta annonser från två
 * eller tre annonskonton mot SAMMA butik (ett konto blir avstängt, ett nytt
 * öppnas, ett tredje delas av en partner). Med ett konto per butik räknades
 * bara det ena in, och panelen visade en vinst som inte fanns.
 *
 * Token ligger kvar på ShopSettings: en Facebook-inloggning ger EN nyckel som
 * når alla konton personen har tillgång till. Kampanjfiltret bor däremot per
 * konto — kampanj-ID:n är kontospecifika, och samma filter på två konton hade
 * betytt "inga kampanjer alls" i det ena.
 */

import prisma from "../db.server";
import { kontoId } from "./meta-login";
import { marknadskod } from "./marknad";
import type { MetaConfig } from "./meta.server";

/** Nycklarna i stabil ordning, så två lika kartor jämförs lika. */
const sorterat = (o: Record<string, string>) =>
  Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)));

export interface Annonskontorad {
  accountId: string;
  name: string | null;
  currency: string | null;
  campaignMode: string;
  campaignIds: string | null;
  /** Kampanj → marknad (landskod). Tomt objekt = ingen märkning. */
  campaignMarkets: Record<string, string>;
}

/** Städar en märkning: bara giltiga landskoder, bara icke-tomma kampanj-id:n. */
export function stadaMarknader(ra: unknown): Record<string, string> {
  const ut: Record<string, string> = {};
  if (!ra || typeof ra !== "object") return ut;
  for (const [id, m] of Object.entries(ra as Record<string, unknown>)) {
    const kod = marknadskod(m);
    if (id.trim() && kod) ut[id.trim()] = kod;
  }
  return ut;
}

/** Butikens konton i den ordning de kopplades. Tom lista = inget kopplat. */
export async function hamtaKonton(shop: string): Promise<Annonskontorad[]> {
  const rader = await prisma.metaAdAccount.findMany({
    where: { shop },
    orderBy: [{ createdAt: "asc" }, { accountId: "asc" }],
  });
  return rader.map((r) => ({
    accountId: r.accountId,
    name: r.name,
    currency: r.currency,
    campaignMode: r.campaignMode ?? "all",
    campaignIds: r.campaignIds,
    campaignMarkets: stadaMarknader(r.campaignMarkets),
  }));
}

/**
 * Kontona i den form getSpend vill ha dem. Utan token finns ingen koppling —
 * då är svaret tomt och panelen säger "Meta är inte kopplat" i stället för att
 * visa noll annonskostnad som om den vore sann.
 */
export function konfigurationer(konton: Annonskontorad[], token: string | null): MetaConfig[] {
  if (!token) return [];
  return konton
    .filter((k) => k.accountId)
    .map((k) => ({
      adAccountId: k.accountId,
      accessToken: token,
      campaignMode: k.campaignMode,
      campaignIds: k.campaignIds,
      spendCurrency: k.currency,
      campaignMarkets: k.campaignMarkets,
    }));
}

/**
 * Lägger till ett konto. Redan kopplat = ingen ändring (och ingen raderad
 * cache) — knappen ska kunna tryckas två gånger utan att kosta 90 dagars
 * hämtade rader. Returnerar om raden var ny.
 */
export async function laggTillKonto(
  shop: string,
  raaId: string,
  namn?: string | null,
  valuta?: string | null,
): Promise<boolean> {
  const accountId = kontoId(raaId);
  if (!accountId) return false;
  const fanns = await prisma.metaAdAccount.findUnique({
    where: { shop_accountId: { shop, accountId } },
  });
  if (fanns) {
    /* Namn och valuta uppdateras ändå: kontot kan ha döpts om hos Meta. */
    if ((namn && namn !== fanns.name) || (valuta && valuta !== fanns.currency)) {
      await prisma.metaAdAccount.update({
        where: { shop_accountId: { shop, accountId } },
        data: { ...(namn ? { name: namn } : {}), ...(valuta ? { currency: valuta } : {}) },
      });
      await speglaForstaKontot(shop);
    }
    return false;
  }
  /* Två snabba klick (eller två flikar) skapar samma rad två gånger. Upsert i
     stället för create: den andra gången är en no-op, inte ett 500. */
  await prisma.metaAdAccount.upsert({
    where: { shop_accountId: { shop, accountId } },
    create: { shop, accountId, name: namn ?? null, currency: valuta ?? null },
    update: { ...(namn ? { name: namn } : {}), ...(valuta ? { currency: valuta } : {}) },
  });
  await speglaForstaKontot(shop);
  return true;
}

/**
 * Tar bort ett konto och dess cachade annonskostnad. Bara det kontots rader —
 * de andra kontonas dagar ska inte behöva hämtas om för att ett tredje konto
 * kopplades bort.
 */
export async function taBortKonto(shop: string, raaId: string): Promise<void> {
  const accountId = kontoId(raaId);
  if (!accountId) return;
  await prisma.metaAdAccount.deleteMany({ where: { shop, accountId } });
  await prisma.dailySpend.deleteMany({ where: { shop, account: accountId } });
  await prisma.hourlySpend.deleteMany({ where: { shop, account: accountId } });
  await speglaForstaKontot(shop);
}

/**
 * Sparar kampanjfiltret och kampanjernas marknadsmärkning för ETT konto.
 * Returnerar om något faktiskt ändrades. Marknaderna sparas som en hel karta:
 * det handlaren ser i formuläret är sanningen, en kampanj som tagits bort ur
 * kartan är omärkt.
 */
export async function sparaKampanjfilter(
  shop: string,
  raaId: string,
  lage: string,
  ids: string | null,
  marknader?: Record<string, string>,
): Promise<boolean> {
  const accountId = kontoId(raaId);
  if (!accountId) return false;
  const fore = await prisma.metaAdAccount.findUnique({
    where: { shop_accountId: { shop, accountId } },
  });
  if (!fore) return false;
  const nyaMarknader = marknader ? stadaMarknader(marknader) : stadaMarknader(fore.campaignMarkets);
  const marknadBytt = JSON.stringify(sorterat(nyaMarknader)) !== JSON.stringify(sorterat(stadaMarknader(fore.campaignMarkets)));
  const bytt = (fore.campaignMode ?? "all") !== lage || (fore.campaignIds ?? null) !== ids || marknadBytt;
  if (!bytt) return false;
  await prisma.metaAdAccount.update({
    where: { shop_accountId: { shop, accountId } },
    data: { campaignMode: lage, campaignIds: ids, campaignMarkets: nyaMarknader },
  });
  /* Cachade rader är räknade på det gamla filtret och är fel nu — men bara
     det här kontots rader. */
  await prisma.dailySpend.deleteMany({ where: { shop, account: accountId } });
  await prisma.hourlySpend.deleteMany({ where: { shop, account: accountId } });
  await speglaForstaKontot(shop);
  return true;
}

/** Lagrar kontots valuta när den lästs från Meta. */
export async function sparaKontovaluta(
  shop: string,
  raaId: string,
  valuta: string,
  tidszon: string | null = null,
): Promise<void> {
  const accountId = kontoId(raaId);
  if (!accountId) return;
  await prisma.metaAdAccount
    .update({
      where: { shop_accountId: { shop, accountId } },
      data: { currency: valuta, ...(tidszon ? { timezoneName: tidszon } : {}) },
    })
    .catch(() => {});
  await speglaForstaKontot(shop).catch(() => {});
}

/** Alla konton bort (bortkoppling, avinstallation). */
export async function taBortAllaKonton(shop: string): Promise<void> {
  await prisma.metaAdAccount.deleteMany({ where: { shop } });
}

/**
 * Speglar det första kontot till ShopSettings legacy-fält.
 *
 * Fälten läses inte längre för annonskostnad, men Meta-inloggningens spärr i
 * /meta/callback jämför mot metaAdAccountId, och en tom spegel hade gjort
 * spärren verkningslös. Spegeln skrivs därför vid varje ändring i listan.
 */
export async function speglaForstaKontot(shop: string): Promise<void> {
  const forsta = await prisma.metaAdAccount.findFirst({
    where: { shop },
    orderBy: [{ createdAt: "asc" }, { accountId: "asc" }],
  });
  await prisma.shopSettings
    .update({
      where: { shop },
      data: {
        metaAdAccountId: forsta?.accountId ?? null,
        spendCurrency: forsta?.currency ?? null,
        campaignMode: forsta?.campaignMode ?? "all",
        campaignIds: forsta?.campaignIds ?? null,
      },
    })
    .catch(() => {
      /* Butiken hinner avinstalleras mitt i ett sparande — spegeln är inte
         värd att fälla hela anropet för. */
    });
}
