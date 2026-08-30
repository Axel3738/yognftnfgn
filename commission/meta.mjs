// meta.mjs — läser spend per annons ur ALLA annonskonton token:en når.
//
// ⚠️ Modulen är läs-bara. Den skapar, ändrar och pausar ingenting. Commission
// räknas på befintlig data — en utbetalningsrutin ska aldrig kunna röra kontot.
//
// Kräver env META_ACCESS_TOKEN (ads_read räcker).
//
// Fältnamn: på KONTOT heter det `amount_spent`, i INSIGHTS heter det `spend`.
// Att blanda ihop dem ger "(#100) ... is not valid for fields param".

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
 *  ALDRIG summeras ihop, och NYC Grill-kontot är i USD. */
export async function hamtaKonton(opt = {}) {
  const konton = await alla('me/adaccounts', {
    fields: 'account_id,name,currency,account_status',
    limit: 100,
  }, opt);
  return konton.map((k) => ({
    id: k.account_id,
    namn: k.name,
    valuta: k.currency,
    aktiv: k.account_status === 1,
  }));
}

/**
 * Spend per annons i ett konto under perioden. Insights returnerar bara
 * annonser som faktiskt spenderat — det är hela filtret vi behöver.
 */
export async function hamtaSpend(konto, { fran, till }, opt = {}) {
  const rader = await alla(`act_${konto.id}/insights`, {
    level: 'ad',
    fields: 'ad_id,ad_name,spend',
    time_range: { since: fran, until: till },
    limit: 500,
  }, opt);
  return rader
    .map((r) => ({
      adId: r.ad_id,
      adNamn: r.ad_name ?? '',
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
