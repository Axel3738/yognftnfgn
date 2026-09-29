// konkurrenter/cpm.mjs — vår egen CPM (kostnad per tusen visningar) ur Meta,
// per verksamhet. Det är talet fakturan räknar konkurrentens annonser med
// (Axels beslut 2026-09-29: "räkna ut det utifrån antalet exponeringar …
// gissa vad de har för CPM" — vi gissar inte, vi mäter vår egen i samma kanal
// och land, senaste 30 dagarna).
//
// Delade konton (OPS-kontot, UK-kontot) läses på kampanjnivå och filtreras på
// verksamhetens kampanjprefix, precis som annonserna i korpus.mjs. Ett konto
// med `cpm: false` i konfig räknas inte (CaraShells US-kampanjer i UK-kontot:
// annan marknad, dubbel CPM).
//
// Mätt 2026-09-29 (last_30d): MagiBorsten 734 244 kr / 7 500 569 visningar =
// 97,9 kr; OPS-kontots CARASHELL_-kampanjer 141,5 kr; nya kungen 130,8 kr;
// UK-kontots CARASHELL_ (USA) 256,2 kr.

import { skapaKlient } from '../kommentarer/meta.mjs';

/** CPM med en decimal, null utan visningar. Ren. */
export const cpmUr = (spend, visningar) => (Number(visningar) > 0 ? Math.round((Number(spend) / Number(visningar)) * 1000 * 10) / 10 : null);

/** Summerar insights-rader; med prefix bara kampanjer vars namn börjar så. Ren. */
export function summeraInsights(rader, prefix = null) {
  const p = prefix ? String(prefix).toUpperCase() : null;
  let spend = 0; let visningar = 0; let kampanjer = 0;
  for (const r of rader ?? []) {
    if (p && !String(r.campaign_name ?? '').toUpperCase().startsWith(p)) continue;
    spend += Number(r.spend ?? 0); visningar += Number(r.impressions ?? 0); kampanjer++;
  }
  return { spend, visningar, kampanjer };
}

/** Insights-sökvägen: kontonivå, eller kampanjnivå med namnfilter för delade konton. Ren. */
export function insightsSokvag(konto, preset = 'last_30d') {
  const act = `act_${String(konto.id).replace(/^act_/, '')}`;
  if (!konto.prefix) return `${act}/insights?fields=spend,impressions&date_preset=${preset}`;
  const filter = encodeURIComponent(JSON.stringify([{ field: 'campaign.name', operator: 'CONTAIN', value: konto.prefix }]));
  return `${act}/insights?level=campaign&fields=campaign_name,spend,impressions&date_preset=${preset}&limit=500&filtering=${filter}`;
}

/**
 * Vår CPM över en verksamhets konton. Returnerar alltid ett objekt, kastar aldrig:
 * { sek, spend, visningar, period, konton: [{ id, namn, spend, visningar, cpm } | { id, namn, fel }], matt, fel? }
 */
export async function hamtaCpm(konton, { token = process.env.META_ACCESS_TOKEN, klient = null, preset = 'last_30d', logg = () => {}, nu = () => new Date().toISOString() } = {}) {
  const ut = { sek: null, spend: 0, visningar: 0, period: preset, konton: [], matt: nu() };
  if (!klient && !token) return { ...ut, fel: 'META_ACCESS_TOKEN saknas i miljön' };
  const k = klient ?? skapaKlient({ token, logg, backoff: [] });
  for (const konto of konton ?? []) {
    if (konto.cpm === false) { ut.konton.push({ id: konto.id, namn: konto.namn, hoppad: 'cpm: false i konfig (annan marknad)' }); continue; }
    try {
      const j = await k.get(insightsSokvag(konto, preset));
      const s = summeraInsights(j.data ?? [], konto.prefix ?? null);
      ut.konton.push({ id: konto.id, namn: konto.namn, spend: s.spend, visningar: s.visningar, kampanjer: konto.prefix ? s.kampanjer : null, cpm: cpmUr(s.spend, s.visningar) });
      ut.spend += s.spend; ut.visningar += s.visningar;
    } catch (e) {
      ut.konton.push({ id: konto.id, namn: konto.namn, fel: e.message });
      logg(`  ⚠️ CPM ${konto.namn}: ${e.message}`);
    }
  }
  ut.sek = cpmUr(ut.spend, ut.visningar);
  if (ut.sek === null) ut.fel = ut.konton.find((c) => c.fel)?.fel ?? 'inga visningar lästa';
  return ut;
}

/**
 * Vilken CPM fakturan räknar med: Axels --cpm först, sedan den mätta, sedan
 * reserven i konfig (per verksamhet, sedan allmän). null när ingen finns. Ren.
 * @returns {{ sek, text, period, kalla: 'axel'|'matt'|'reserv', matt }|null}
 */
export function valjCpm({ override = null, matt = null, konfig, verksamhet }) {
  const c = konfig?.faktura?.cpm ?? {};
  const o = Number(override);
  if (override !== null && override !== undefined && Number.isFinite(o) && o > 0) return { sek: Math.round(o * 10) / 10, text: `${verksamhet ?? ''}, Meta`.replace(/^, /, ''), period: null, kalla: 'axel', matt: null };
  if (matt?.sek > 0) return { sek: matt.sek, text: `${verksamhet ?? ''}, Meta`.replace(/^, /, ''), period: matt.period ?? c.period ?? null, kalla: 'matt', matt: matt.matt ?? null };
  const reserv = c.reserv_sek?.[verksamhet] ?? (typeof c.reserv_sek === 'number' ? c.reserv_sek : null);
  if (reserv > 0) return { sek: Number(reserv), text: `${verksamhet ?? ''}, Meta`.replace(/^, /, ''), period: c.period ?? null, kalla: 'reserv', matt: c.matt ?? null };
  return null;
}

/** En rad per verksamhet för --kolla. Ren. */
export function cpmRad(verksamhet, m, reserv = null) {
  if (!m || m.sek === null) return `CPM ${verksamhet}: kunde inte mätas${m?.fel ? ` (${m.fel})` : ''}${reserv ? ` — reserven ${reserv} kr används` : ''}`;
  const tal = (n) => Math.round(n).toLocaleString('sv-SE').replace(/[  ]/g, ' ');
  return `CPM ${verksamhet}: ${m.sek} kr (${m.period}: ${tal(m.spend)} kr / ${tal(m.visningar)} visningar${reserv && Math.abs(reserv - m.sek) / m.sek > 0.25 ? ` — ⚠️ reserven i konfig säger ${reserv}, uppdatera den` : ''})`;
}
