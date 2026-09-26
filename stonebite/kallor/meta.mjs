// kallor/meta.mjs — annonsspend, köp och ROAS ur Meta. LÄS-BARA.
//
// Modulen skapar, pausar och ändrar ingenting. Den läser bara insights, så
// ingen dashboard kan råka röra ett annonskonto.
//
// Fältnamnen är exakta (CLAUDE.md): i INSIGHTS heter spenden `spend`, köpen
// ligger i `actions` som `omni_purchase`, och ROAS i `purchase_roas`.
// ⚠️ `omni_purchase_values` är buggig i kontot — intäkten räknas därför alltid
// som spend × ROAS, aldrig ur det fältet.
//
// Kontona hålls isär: varje konto bär sin egen valuta och sin egen
// verksamhet, och valutor summeras ALDRIG ihop (Bäverbutiken i SEK,
// NYC Grill i USD).

const VERSION = () => process.env.META_API_VERSION || 'v23.0';

/** Kontona vi bryr oss om, med vilken verksamhet de hör till. */
export const KONTOKARTA = Object.freeze({
  '1867947880635861': { verksamhet: 'Bäverbutiken', etikett: 'Bäverbutiken (MagiBorsten)' },
  '915422744950975': { verksamhet: 'OPS-butikerna', etikett: 'OPS SE/NO (MagiBorsten DK)' },
  '1107817401910319': { verksamhet: 'OPS-butikerna', etikett: 'OPS US/UK (Magiborsten UK)' },
  '1346450049878358': { verksamhet: 'Grillkliniken', etikett: 'Grillkliniken (SnarkLös)' },
});

async function api(sokvag, params, { fetchFn = fetch, env = process.env, forsok = 0 } = {}) {
  const token = env.META_ACCESS_TOKEN;
  if (!token) throw new Error('META_ACCESS_TOKEN saknas i miljön.');
  const url = new URL(`https://graph.facebook.com/${VERSION()}/${sokvag}`);
  url.searchParams.set('access_token', token);
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));

  const svar = await fetchFn(url.toString());
  const j = await svar.json().catch(() => ({}));
  if (j.error) {
    // Kod 17 = "User request limit reached". Meta backar av i minuter, inte
    // sekunder — vi provar tre gånger och rapporterar sedan ärligt.
    const strypt = j.error.code === 17 || j.error.code === 4 || j.error.code === 613;
    if (strypt && forsok < 3) {
      await new Promise((r) => setTimeout(r, (forsok + 1) * 30_000));
      return api(sokvag, params, { fetchFn, env, forsok: forsok + 1 });
    }
    const fel = new Error(`Meta: ${j.error.message}`);
    fel.kod = j.error.code;
    fel.strypt = strypt;
    throw fel;
  }
  return j;
}

function kopUr(rad) {
  const a = (rad.actions ?? []).find((x) => x.action_type === 'omni_purchase');
  return a ? Number(a.value) || 0 : 0;
}

function roasUr(rad) {
  const r = (rad.purchase_roas ?? []).find((x) => x.action_type === 'omni_purchase');
  return r ? Number(r.value) || 0 : null;
}

/** Alla annonskonton token:en når. */
export async function hamtaKonton(opt = {}) {
  const j = await api('me/adaccounts', { fields: 'account_id,name,currency,account_status', limit: 200 }, opt);
  return (j.data ?? []).map((k) => ({
    id: k.account_id,
    namn: k.name,
    valuta: k.currency,
    aktiv: k.account_status === 1,
    ...(KONTOKARTA[k.account_id] ?? { verksamhet: 'Övrigt', etikett: k.name }),
  }));
}

/** Dagsserie för ett konto: spend, köp och ROAS per dag. */
export async function hamtaDagar(kontoId, { dagar = 30, ...opt } = {}) {
  const j = await api(`act_${kontoId}/insights`, {
    level: 'account', time_increment: 1, date_preset: dagar > 7 ? 'last_30d' : 'last_7d',
    fields: 'date_start,spend,actions,purchase_roas', limit: 100,
  }, opt);
  return (j.data ?? []).map((r) => ({
    datum: r.date_start,
    spend: Number(r.spend) || 0,
    kop: kopUr(r),
    roas: roasUr(r),
  }));
}

/**
 * Dagens siffror för ett konto.
 * ⚠️ Metas date presets (`last_7d`, `last_30d`) UTESLUTER innevarande dag —
 * dagsserien ovan slutar alltså i går. Dagens tal måste hämtas separat, annars
 * ser det ut som att kontot slutat spendera varje förmiddag.
 */
export async function hamtaIdag(kontoId, opt = {}) {
  const j = await api(`act_${kontoId}/insights`, {
    level: 'account', date_preset: 'today', fields: 'spend,actions,purchase_roas', limit: 10,
  }, opt);
  const r = (j.data ?? [])[0];
  if (!r) return { spend: 0, kop: 0, roas: null, tomt: true };
  return { spend: Number(r.spend) || 0, kop: kopUr(r), roas: roasUr(r), tomt: false };
}

/** Kampanjerna i ett konto för perioden. Vinstbidraget räknas i vyn. */
export async function hamtaKampanjer(kontoId, { preset = 'last_7d', ...opt } = {}) {
  const j = await api(`act_${kontoId}/insights`, {
    level: 'campaign', date_preset: preset,
    fields: 'campaign_id,campaign_name,spend,actions,purchase_roas', limit: 300,
  }, opt);
  return (j.data ?? [])
    .map((r) => {
      const spend = Number(r.spend) || 0;
      const kop = kopUr(r);
      const roas = roasUr(r);
      return {
        id: r.campaign_id,
        namn: r.campaign_name,
        spend,
        kop,
        roas,
        cpa: kop > 0 ? spend / kop : null,
        // Intäkt = spend × ROAS. Aldrig ur omni_purchase_values (buggigt fält).
        intakt: roas !== null ? spend * roas : null,
      };
    })
    .filter((r) => r.spend > 0)
    .sort((a, b) => b.spend - a.spend);
}

/**
 * Allt vi visar om annonserna: konton med dagsserie + kampanjer per konto.
 * Ett konto som strypts eller nekats rapporteras med orsak, aldrig som noll.
 */
export async function hamtaAllt({ dagar = 30, preset = 'last_7d', logg = () => {}, extraIds = [], ...opt } = {}) {
  const konton = await hamtaKonton(opt);
  // Konton som token:en når men som `me/adaccounts` inte listar (mätt
  // 2026-09-26: Matstrumpors "nya kungen" 730973156224390 svarar på
  // act_<id> men saknas i listan). Id:na kommer ur varumarken.json.
  for (const id of extraIds.map(String)) {
    if (konton.some((k) => String(k.id) === id)) continue;
    try {
      const k = await api(`act_${id}`, { fields: 'account_id,name,currency,account_status' }, opt);
      konton.push({ id: k.account_id, namn: k.name, valuta: k.currency, aktiv: k.account_status === 1, ...(KONTOKARTA[k.account_id] ?? { verksamhet: 'Övrigt', etikett: k.name }) });
    } catch (e) {
      logg(`  ${id}: ${e.message}`);
    }
  }
  const ut = [];
  for (const konto of konton) {
    if (!konto.aktiv && !KONTOKARTA[konto.id]) continue; // avstängda sidokonton
    try {
      const serie = await hamtaDagar(konto.id, { dagar, ...opt });
      const idag = await hamtaIdag(konto.id, opt);
      const kampanjer = await hamtaKampanjer(konto.id, { preset, ...opt });
      const spend = serie.reduce((s, d) => s + d.spend, 0);
      logg(`  ${konto.namn} (${konto.id}): ${Math.round(spend)} ${konto.valuta} / ${dagar} d, ${kampanjer.length} kampanjer, i dag ${Math.round(idag.spend)}`);
      ut.push({ ...konto, dagar: serie, idag, kampanjer, status: 'ok', orsak: null });
    } catch (e) {
      logg(`  ${konto.namn} (${konto.id}): ${e.message}`);
      ut.push({ ...konto, dagar: [], kampanjer: [], status: 'fel', orsak: e.message });
    }
  }
  return ut;
}
