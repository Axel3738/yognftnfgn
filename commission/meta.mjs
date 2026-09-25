// meta.mjs — läser spend per annons ur ALLA annonskonton token:en når.
//
// ⚠️ Modulen är läs-bara. Den skapar, ändrar och pausar ingenting. Commission
// räknas på befintlig data — en utbetalningsrutin ska aldrig kunna röra kontot.
//
// Kräver env META_ACCESS_TOKEN (ads_read räcker).
//
// Fältnamn: på KONTOT heter det `amount_spent`, i INSIGHTS heter det `spend`.
// Att blanda ihop dem ger "(#100) ... is not valid for fields param".

import { readFileSync } from 'node:fs';

const STANDARDVERSION = 'v23.0';

export class MetaFel extends Error {}

export function hamtaNyckel(env = process.env) {
  const nyckel = env.META_ACCESS_TOKEN;
  if (!nyckel) throw new MetaFel('META_ACCESS_TOKEN saknas i miljön — utan den går ingen spend att läsa.');
  return nyckel;
}

async function api(sokvag, params, { fetchImpl = fetch, env = process.env } = {}) {
  const version = env.META_API_VERSION || STANDARDVERSION;
  const url = new URL(`https://graph.facebook.com/${version}/${sokvag}`);
  url.searchParams.set('access_token', hamtaNyckel(env));
  for (const [k, v] of Object.entries(params ?? {})) {
    url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  }
  const res = await fetchImpl(url.toString());
  const json = await res.json().catch(() => ({}));
  if (json.error) throw new MetaFel(`Meta: ${json.error.message}`);
  return json;
}

/** Alla sidor av ett edge-anrop. Kontona har långt fler än 25 rader. */
async function alla(sokvag, params, opt = {}) {
  const { fetchImpl = fetch } = opt;
  let svar = await api(sokvag, params, opt);
  const ut = [...(svar.data ?? [])];
  let skydd = 0;
  while (svar.paging?.next && skydd++ < 200) {
    const res = await fetchImpl(svar.paging.next);
    svar = await res.json().catch(() => ({}));
    if (svar.error) throw new MetaFel(`Meta: ${svar.error.message}`);
    ut.push(...(svar.data ?? []));
  }
  return ut;
}

/** Varje annonskonto token:en når. Valutan följer med — SEK och USD får
 *  ALDRIG summeras ihop, och NYC Grill-kontot är i USD.
 *
 *  ⚠️ `me/adaccounts` listar INTE allt token:en får läsa. Mätt 2026-09-25:
 *  listan gav 5 konton, men ett direktanrop mot `act_730973156224390`
 *  ("nya kungen", Matstrumpor) svarade 200 med namn och valuta. Kontot hade
 *  alltså aldrig kommit med i en enda commission-körning — inte för att
 *  behörigheten saknades, utan för att listningen är snävare än åtkomsten.
 *  (Axel gav Meta-användaren rättigheten 2026-09-22; se CLAUDE.md.) Därför
 *  frågas varje känt konto som listan missade direkt, ett i taget: svarar det
 *  200 räknas det med, svarar det 403 är det verkligen nekat och
 *  kontospärren i run.mjs fyrar på just det. */
export async function hamtaKonton(opt = {}) {
  const konton = await alla('me/adaccounts', {
    fields: 'account_id,name,currency,account_status',
    limit: 100,
  }, opt);
  const ut = konton.map((k) => ({
    id: k.account_id,
    namn: k.name,
    valuta: k.currency,
    aktiv: k.account_status === 1,
  }));
  const listade = new Set(ut.map((k) => String(k.id)));
  for (const kant of kandaKonton(opt)) {
    if (listade.has(String(kant.id))) continue;
    try {
      const k = await api(`act_${kant.id}`, {
        fields: 'account_id,name,currency,account_status',
      }, opt);
      ut.push({
        id: k.account_id ?? String(kant.id),
        namn: k.name ?? kant.namn,
        valuta: k.currency,
        aktiv: k.account_status === 1,
        utanforListan: true,
      });
    } catch {
      // Nekat eller borta — kontospärren i run.mjs rapporterar det med namn.
    }
  }
  return ut;
}

/** Kontona token:en brukar nå (commission/kanda-konton.json). Saknas filen
 *  eller går den inte att läsa blir det inga extra anrop — listan är en
 *  komplettering, aldrig ett krav. */
function kandaKonton({ kandaKontonFil } = {}) {
  try {
    const fil = kandaKontonFil
      ?? new URL('./kanda-konton.json', import.meta.url);
    return JSON.parse(readFileSync(fil, 'utf8')).konton ?? [];
  } catch {
    return [];
  }
}

/**
 * Spend per annons i ett konto under perioden. Insights returnerar bara
 * annonser som faktiskt spenderat — det är hela filtret vi behöver.
 */
export async function hamtaSpend(konto, { fran, till }, opt = {}) {
  const rader = await alla(`act_${konto.id}/insights`, {
    level: 'ad',
    fields: 'ad_id,ad_name,campaign_name,spend',
    time_range: { since: fran, until: till },
    limit: 500,
  }, opt);
  return rader
    .map((r) => ({
      adId: r.ad_id,
      adNamn: r.ad_name ?? '',
      kampanj: r.campaign_name ?? '',
      spend: Number(r.spend ?? 0),
      konto,
    }))
    .filter((a) => a.spend > 0 && a.adNamn);
}

/**
 * Spend i samtliga konton. Ett konto som svarar med fel stoppar inte körningen
 * — det redovisas, för en tyst nolla är värre än ett synligt fel.
 */
export async function hamtaAllSpend(period, opt = {}) {
  const konton = await hamtaKonton(opt);
  const annonser = [];
  const fel = [];
  for (const konto of konton) {
    try {
      annonser.push(...await hamtaSpend(konto, period, opt));
    } catch (e) {
      fel.push({ konto: `${konto.namn} (${konto.id})`, fel: e.message });
    }
  }
  return { konton, annonser, fel };
}
