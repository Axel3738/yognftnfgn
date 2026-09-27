// annonsvakt/regler.mjs — reglerna bakom annonsvakten. Rena funktioner:
// inget nät, ingen klocka (nu skickas in), inga filer. Allt som avgör om
// något larmas står här, och varje regel har ett test i test/regler.test.mjs.
//
// Tre sorters fynd:
//   tillstånd — kontot nedstängt, annonsen avvisad, adsetet med fel: pågår
//               tills det är löst. Larmas EN gång, påminns efter
//               paminn_timmar, och får en ✅-rad när det försvinner.
//   händelse  — en annons som dragit iväg med spend i dag: larmas på nivåer
//               (spend_min, 2×, 4× …) så ett larm vid 1 500 kr följs av ett
//               vid 3 000 och 6 000 — aldrig varje timme.
//   hjärtslag — en rad om dagen som säger att vakten lever.
//
// Texterna är engelska (allt i Discord är på engelska, Axels order 2026-09-05)
// och korta (Axels dyslexi, 2026-09-10: "simpla och lätta att läsa"). Namn
// på konton, kampanjer och annonser står i `kod` — det är data, och
// svenskdetektorn (tools/lib/engelska.mjs) räknar inte kodspann.

export const KONTOSTATUS = Object.freeze({
  1: 'ACTIVE', 2: 'DISABLED', 3: 'UNSETTLED', 7: 'PENDING_RISK_REVIEW', 8: 'PENDING_SETTLEMENT',
  9: 'IN_GRACE_PERIOD', 100: 'PENDING_CLOSURE', 101: 'CLOSED', 201: 'ANY_ACTIVE', 202: 'ANY_CLOSED',
});

export const DISABLE_REASON = Object.freeze({
  0: 'NONE', 1: 'ADS_INTEGRITY_POLICY', 2: 'ADS_IP_REVIEW', 3: 'RISK_PAYMENT', 4: 'GRAY_ACCOUNT_SHUT_DOWN',
  5: 'ADS_AFC_REVIEW', 6: 'BUSINESS_INTEGRITY_RAR', 7: 'PERMANENT_CLOSE', 8: 'UNUSED_RESELLER_ACCOUNT',
  9: 'UNUSED_ACCOUNT', 10: 'UMBRELLA_AD_ACCOUNT', 11: 'BUSINESS_MANAGER_INTEGRITY_POLICY',
  12: 'MISREPRESENTED_AD_ACCOUNT', 13: 'AOAB_DESHARE_LEGAL_ENTITY', 14: 'CTX_THREAD_REVIEW', 15: 'COMPROMISED_AD_ACCOUNT',
});

/** Vad kontostatusen betyder för Axel. */
const KONTOSTATUS_TEXT = Object.freeze({
  DISABLED: 'is DISABLED — nothing in it can spend',
  UNSETTLED: 'is UNSETTLED — an unpaid bill is blocking delivery',
  PENDING_RISK_REVIEW: 'is under RISK REVIEW by Meta — delivery can stop',
  PENDING_SETTLEMENT: 'is PENDING SETTLEMENT — a payment is outstanding',
  IN_GRACE_PERIOD: 'is IN GRACE PERIOD — a payment failed; fix it before Meta disables the account',
  PENDING_CLOSURE: 'is PENDING CLOSURE',
  CLOSED: 'is CLOSED',
});

/** Objekt som ska köra: status ACTIVE och kampanj + adset som levererar (eller har fel). */
const SKA_KORA = new Set(['ACTIVE', 'WITH_ISSUES']);

const TIMME = 3_600_000;

// ----------------------------------------------------------------- hjälpare

/** Heltal med tusenmellanslag för engelsk läsare: 17307 → "17 307". */
export const heltal = (n) => Math.round(Number(n) || 0).toLocaleString('en-US').replace(/,/g, ' ');

/** Namn är data — i kodspann så svenskdetektorn inte räknar dem. */
export const kod = (s) => `\`${String(s ?? '').replace(/`/g, "'").replace(/\s+/g, ' ').trim() || '?'}\``;

const kontoRef = (k) => (k ? { id: String(k.id), namn: k.namn ?? null, valuta: k.valuta ?? null } : null);

export function kopUr(rad) {
  const a = (rad?.actions ?? []).find((x) => x.action_type === 'omni_purchase');
  return a ? Number(a.value) || 0 : 0;
}

export function roasUr(rad) {
  const r = (rad?.purchase_roas ?? []).find((x) => x.action_type === 'omni_purchase');
  return r ? Number(r.value) || 0 : null;
}

export const dagStockholm = (nu) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(nu);
export const timmeStockholm = (nu) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Stockholm', hour: '2-digit', hourCycle: 'h23' }).format(nu));
export const tidText = (nu) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Stockholm', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(nu).replace(',', '');

/** issues_info utan koderna i ignorera-listan. */
export function riktigaFel(issues, ignorera = {}) {
  return (Array.isArray(issues) ? issues : []).filter((i) => i && !(String(i.error_code) in (ignorera ?? {})));
}

const felText = (i) => {
  const s = String(i.error_summary ?? '').trim() || String(i.error_message ?? '').split(/[.:]/)[0].trim() || 'unknown issue';
  return `${kod(s)} (code ${i.error_code ?? '?'})`;
};

// ----------------------------------------------------------------- kontona

/**
 * Konto-nivån: token som inte fungerar, konto som inte är ACTIVE, konto
 * token:en inte längre når. Alla 🔴 — de stoppar all spend.
 * @param {{konton: Array, olasta: Array, tokenFel: string|null}} lasning
 * @param {{verksamhetFor?: (id: string) => string|null}} opt
 */
export function bedomKonton({ konton = [], olasta = [], tokenFel = null } = {}, { verksamhetFor = () => null } = {}) {
  const ut = [];
  if (tokenFel) {
    ut.push({
      nyckel: 'token:ogiltig', typ: 'token', niva: 'rod', slag: 'tillstand', konto: null,
      rubrik: 'Meta token not working',
      text: `The Meta token (META_ACCESS_TOKEN) no longer works: ${kod(tokenFel)}. Every ad routine is blind until it is renewed — Meta Business settings → System users → generate a new token and put it in Environments.`,
    });
    return ut;
  }
  const var_ = (id) => { const v = verksamhetFor(String(id)); return v ? `, ${v}` : ''; };
  for (const k of konton) {
    if (Number(k.account_status) === 1) continue;
    const status = KONTOSTATUS[k.account_status] ?? `status ${k.account_status}`;
    const orsak = Number(k.disable_reason) ? ` Reason: ${DISABLE_REASON[k.disable_reason] ?? k.disable_reason}.` : '';
    ut.push({
      nyckel: `konto:${k.id}:status:${k.account_status}`, typ: 'konto', niva: 'rod', slag: 'tillstand', konto: kontoRef(k),
      rubrik: `Ad account ${kod(k.namn)} ${status}`,
      text: `Ad account ${kod(k.namn)} (${k.id}${var_(k.id)}) ${KONTOSTATUS_TEXT[status] ?? `has status ${status}`}.${orsak} Check Ads Manager → Account quality and Billing.`,
    });
  }
  for (const o of olasta) {
    ut.push({
      nyckel: `konto:${o.id}:oatkomlig`, typ: 'konto', niva: 'rod', slag: 'tillstand', konto: kontoRef(o),
      rubrik: `Ad account ${kod(o.namn ?? o.id)} unreachable`,
      text: `Ad account ${kod(o.namn ?? o.id)} (${o.id}${var_(o.id)}) can no longer be read by the token: ${kod(o.fel)}. Either the account was disabled/removed or the system user lost its permission — check Business settings → Ad accounts.`,
    });
  }
  return ut;
}

/** Ett konto vars annonser inte gick att läsa den här timmen (tillfälligt eller inte). 🟡, påminns dagligen. */
export function lasfel(konto, fel) {
  return {
    nyckel: `konto:${konto.id}:lasfel`, typ: 'konto', niva: 'gul', slag: 'tillstand', konto: kontoRef(konto),
    rubrik: `Could not read ${kod(konto.namn)}`,
    text: `Could not read the ads in ${kod(konto.namn)} (${konto.id}) this hour: ${kod(String(fel).split('\n')[0].slice(0, 200))}. The account itself answers, so this is the token's permissions or Meta's rate limit — if it stays, check Business settings.`,
  };
}

// ----------------------------------------------------------------- objekten

export const menadAttKora = (a) => a?.status === 'ACTIVE' && SKA_KORA.has(a?.campaign?.effective_status) && SKA_KORA.has(a?.adset?.effective_status);

/**
 * Annonser, adsets och kampanjer som SKA köra men inte gör det:
 * DISAPPROVED, PENDING_BILLING_INFO, WITH_ISSUES (utom ignorerade koder) ⇒ 🔴;
 * PENDING_REVIEW äldre än granskning_timmar ⇒ 🟡.
 * Listorna är Metas: annonser filtrerade på problemstatus, kampanjer och
 * adsets på ACTIVE/WITH_ISSUES.
 */
export function bedomObjekt({ konto, annonser = [], kampanjer = [], adsets = [] }, { nu = new Date(), konfig } = {}) {
  const ignorera = konfig?.ignorera_felkoder ?? {};
  const granskningTimmar = Number(konfig?.trosklar?.granskning_timmar ?? 24);
  const ut = [];
  const kampanjnamn = new Map(kampanjer.map((k) => [String(k.id), k.name]));
  const iKonto = ` (account ${kod(konto?.namn)})`;

  for (const a of annonser) {
    if (!menadAttKora(a)) continue;
    const var_ = `Ad ${kod(a.name)} in ${kod(a.campaign?.name)}`;
    if (a.effective_status === 'DISAPPROVED') {
      const skal = [...Object.keys(a.ad_review_feedback?.global ?? {}), ...Object.values(a.ad_review_feedback?.placement_specific ?? {}).flatMap((p) => Object.keys(p ?? {}))];
      const unika = [...new Set(skal)];
      ut.push({
        nyckel: `annons:${a.id}:DISAPPROVED`, typ: 'annons', niva: 'rod', slag: 'tillstand', konto: kontoRef(konto),
        rubrik: `Ad ${kod(a.name)} DISAPPROVED`,
        text: `${var_} was DISAPPROVED by Meta${unika.length ? ` — ${unika.map(kod).join(', ')}` : ''}. It is not delivering. Fix or appeal it in Ads Manager${iKonto}.`,
      });
    } else if (a.effective_status === 'PENDING_BILLING_INFO') {
      ut.push({
        nyckel: `annons:${a.id}:PENDING_BILLING_INFO`, typ: 'annons', niva: 'rod', slag: 'tillstand', konto: kontoRef(konto),
        rubrik: `Ad ${kod(a.name)} blocked: billing`,
        text: `${var_} is blocked: PENDING BILLING INFO — the account has no valid payment method${iKonto}.`,
      });
    } else if (a.effective_status === 'WITH_ISSUES') {
      const fel = riktigaFel(a.issues_info, ignorera);
      if (!fel.length) continue;
      ut.push({
        nyckel: `annons:${a.id}:WITH_ISSUES:${fel.map((f) => f.error_code).join('+')}`, typ: 'annons', niva: 'rod', slag: 'tillstand', konto: kontoRef(konto),
        rubrik: `Ad ${kod(a.name)} has an issue`,
        text: `${var_} is not delivering: ${fel.map(felText).join('; ')}${iKonto}.`,
      });
    } else if (a.effective_status === 'PENDING_REVIEW') {
      const sedan = Date.parse(a.updated_time);
      const timmar = Number.isFinite(sedan) ? Math.floor((nu.getTime() - sedan) / TIMME) : null;
      if (timmar === null || timmar < granskningTimmar) continue;
      ut.push({
        nyckel: `granskning:${a.id}`, typ: 'granskning', niva: 'gul', slag: 'tillstand', konto: kontoRef(konto),
        rubrik: `Ad ${kod(a.name)} stuck in review`,
        text: `${var_} has been waiting for Meta's review for ${timmar} hours${iKonto}. Usually it clears by itself; if not, ask Meta support.`,
      });
    }
  }

  for (const k of kampanjer) {
    if (!SKA_KORA.has(k.effective_status)) continue;
    const fel = riktigaFel(k.issues_info, ignorera);
    if (!fel.length) continue;
    ut.push({
      nyckel: `kampanj:${k.id}:issues:${fel.map((f) => f.error_code).join('+')}`, typ: 'kampanj', niva: 'rod', slag: 'tillstand', konto: kontoRef(konto),
      rubrik: `Campaign ${kod(k.name)} has an issue`,
      text: `Campaign ${kod(k.name)} has an issue: ${fel.map(felText).join('; ')}${iKonto}.`,
    });
  }

  for (const s of adsets) {
    if (!SKA_KORA.has(s.effective_status)) continue;
    const fel = riktigaFel(s.issues_info, ignorera);
    if (!fel.length) continue;
    const kamp = kampanjnamn.get(String(s.campaign_id)) ?? s.campaign_id;
    ut.push({
      nyckel: `adset:${s.id}:issues:${fel.map((f) => f.error_code).join('+')}`, typ: 'adset', niva: 'rod', slag: 'tillstand', konto: kontoRef(konto),
      rubrik: `Ad set ${kod(s.name)} has an issue`,
      text: `Ad set ${kod(s.name)} in ${kod(kamp)} has an issue: ${fel.map(felText).join('; ')}${iKonto}.`,
    });
  }
  return ut;
}

// ----------------------------------------------------------------- spenden

const normPrefix = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/_+$/, '');

/** "Takskyddet | BE ROAS 1.63 | Launch 2026-08-04" → 1.63. Annars null. (Samma som stonebite/berakna.mjs.) */
export function breakEvenUrNamn(namn) {
  const m = /BE[\s-]*ROAS[\s:-]*([0-9]+[.,][0-9]+|[0-9]+)/i.exec(String(namn ?? ''));
  if (!m) return null;
  const v = Number(String(m[1]).replace(',', '.'));
  return Number.isFinite(v) && v > 0 ? v : null;
}

/**
 * Break-even för en annonsrad, i ordning: kampanjnamnet (BE ROAS x) →
 * products.json (annonsprefixet mot creative_prefix) → matstrumpor/konfig.json
 * (kontot "nya kungen", räknat ur ekonomiblocket — aldrig ett tal ur minnet)
 * → standardvärdet. Svaret bär källan, så larmtexten kan säga den.
 */
export function skapaBreakEvenFor({ produkter = [], matstrumpor = null, standard = 1.6 } = {}) {
  const perPrefix = new Map(produkter.filter((p) => p.creative_prefix && Number(p.break_even_roas) > 0).map((p) => [normPrefix(p.creative_prefix), Number(p.break_even_roas)]));
  let ms = null;
  const e = matstrumpor?.ekonomi;
  if (matstrumpor?.kontoId && e && Number(e.aov_sek) > 0) {
    const kostnad = Number(e.kostnad_per_order_sek) || 0;
    const tull = (Number(e.tull_eur) || 0) * (Number(e.eur_sek) || 0);
    const marginal = Number(e.aov_sek) - kostnad - tull;
    if (marginal > 0) ms = { kontoId: String(matstrumpor.kontoId), varde: Number(e.aov_sek) / marginal };
  }
  return (rad, konto) => {
    const urNamn = breakEvenUrNamn(rad?.kampanjNamn);
    if (urNamn) return { varde: urNamn, kalla: 'from the campaign name' };
    const prefix = normPrefix(String(rad?.adNamn ?? '').split('_')[0]);
    if (prefix && perPrefix.has(prefix)) return { varde: perPrefix.get(prefix), kalla: 'from products.json' };
    if (ms && String(konto?.id) === ms.kontoId) return { varde: ms.varde, kalla: 'from matstrumpor/konfig.json' };
    return { varde: Number(standard) || 1.6, kalla: 'default break-even' };
  };
}

/** Insights-rad (level=ad) → det reglerna behöver. */
export function normaliseraRad(r) {
  return {
    adId: String(r.ad_id ?? ''), adNamn: r.ad_name ?? '', adsetId: String(r.adset_id ?? ''), adsetNamn: r.adset_name ?? '',
    kampanjId: String(r.campaign_id ?? ''), kampanjNamn: r.campaign_name ?? '',
    spend: Number(r.spend) || 0, kop: kopUr(r), roas: roasUr(r),
  };
}

/**
 * Dagens spend per annons: en annons som drar iväg (0 köp från spend_min, eller
 * ROAS under halva break-even från 2 × spend_min) ⇒ 🔴 händelse på nivå
 * floor(log2(spend / spend_min)). Kampanj/adset över overspend_faktor ×
 * dagsbudget ⇒ 🟡 händelse, en per dag.
 */
export function bedomSpend({ konto, idag = [], kampanjer = [], adsets = [] }, { konfig, datum, breakEvenFor = () => ({ varde: 1.6, kalla: 'default break-even' }) } = {}) {
  const t = konfig?.trosklar ?? {};
  const min = Number(t.spend_min ?? 1500);
  const andel = Number(t.roas_andel_av_breakeven ?? 0.5);
  const faktor = Number(t.overspend_faktor ?? 2);
  const valuta = konto?.valuta ?? 'SEK';
  const rader = idag.map(normaliseraRad).filter((r) => r.spend > 0);
  const total = rader.reduce((s, r) => s + r.spend, 0);
  const perKampanj = new Map();
  const perAdset = new Map();
  for (const r of rader) {
    perKampanj.set(r.kampanjId, (perKampanj.get(r.kampanjId) ?? 0) + r.spend);
    perAdset.set(r.adsetId, (perAdset.get(r.adsetId) ?? 0) + r.spend);
  }
  const budgetKampanj = new Map(kampanjer.map((k) => [String(k.id), { namn: k.name, budget: Number(k.daily_budget) / 100 }]));
  const budgetAdset = new Map(adsets.map((s) => [String(s.id), { namn: s.name, budget: Number(s.daily_budget) / 100 }]));
  const ut = [];

  for (const r of rader) {
    if (r.spend < min) continue;
    const niva = Math.floor(Math.log2(r.spend / min));
    const procent = total > 0 ? Math.round((r.spend / total) * 100) : 0;
    const b = budgetKampanj.get(r.kampanjId)?.budget > 0 ? budgetKampanj.get(r.kampanjId).budget : budgetAdset.get(r.adsetId)?.budget > 0 ? budgetAdset.get(r.adsetId).budget : null;
    const budgetText = b ? `, daily budget ${heltal(b)} ${valuta}` : '';
    const var_ = `${kod(r.adNamn)} in ${kod(r.kampanjNamn)}${budgetText}`;
    const bas = { nyckel: `spend:${r.adId}:${datum}:${niva}`, typ: 'spend', niva: 'rod', slag: 'handelse', konto: kontoRef(konto), rubrik: `Ad ${kod(r.adNamn)} spending badly`, data: { spend: r.spend, kop: r.kop, roas: r.roas, andel: procent, niva } };
    if (r.kop === 0) {
      ut.push({ ...bas, text: `${var_}: ${heltal(r.spend)} ${valuta} spent today, 0 purchases — ${procent} % of everything ${kod(konto?.namn)} spent today. Open it in Ads Manager and decide (budget, placements or off).` });
      continue;
    }
    const be = breakEvenFor(r, konto);
    if (r.spend >= 2 * min && r.roas !== null && r.roas < be.varde * andel) {
      ut.push({ ...bas, text: `${var_}: ${heltal(r.spend)} ${valuta} spent today for ${r.kop} purchase${r.kop === 1 ? '' : 's'} — ROAS ${r.roas.toFixed(2)} against break-even ${be.varde.toFixed(2)} (${be.kalla}). ${procent} % of everything ${kod(konto?.namn)} spent today. Open it in Ads Manager and decide.` });
    }
  }

  for (const [id, { namn, budget }] of budgetKampanj) {
    const spend = perKampanj.get(id) ?? 0;
    if (!(budget > 0) || spend < faktor * budget) continue;
    ut.push({
      nyckel: `overspend:kampanj:${id}:${datum}`, typ: 'overspend', niva: 'gul', slag: 'handelse', konto: kontoRef(konto),
      rubrik: `Campaign ${kod(namn)} over budget`,
      text: `Campaign ${kod(namn)} has spent ${heltal(spend)} ${valuta} today against a daily budget of ${heltal(budget)} ${valuta} (${(spend / budget).toFixed(1)}×). Meta normally stays within +75 % — was the budget changed today?${konto?.namn ? ` (account ${kod(konto.namn)})` : ''}`,
    });
  }
  for (const [id, { namn, budget }] of budgetAdset) {
    const spend = perAdset.get(id) ?? 0;
    if (!(budget > 0) || spend < faktor * budget) continue;
    ut.push({
      nyckel: `overspend:adset:${id}:${datum}`, typ: 'overspend', niva: 'gul', slag: 'handelse', konto: kontoRef(konto),
      rubrik: `Ad set ${kod(namn)} over budget`,
      text: `Ad set ${kod(namn)} has spent ${heltal(spend)} ${valuta} today against a daily budget of ${heltal(budget)} ${valuta} (${(spend / budget).toFixed(1)}×). Meta normally stays within +75 % — was the budget changed today?${konto?.namn ? ` (account ${kod(konto.namn)})` : ''}`,
    });
  }
  return ut;
}

// ----------------------------------------------------------------- minnet

/**
 * Vad som ska larmas den här timmen, givet minnet. Ren; muterar inte minnet
 * utan returnerar ett nytt.
 *
 * `lasta` = konto-id:n vars annonser lästes den här timmen. Ett tillstånd i ett
 * konto som INTE lästes rörs inte (varken löst eller påmint) — annars hade
 * Metas rate limit gjort att en avvisad annons "löstes" och larmades om nästa
 * timme. `lasta === null` = ingenting är känt (token död): inget löses.
 */
export function sammanfoga({ problem = [], minne, nu = new Date(), konfig, lasta = new Set() } = {}) {
  const paminn = konfig?.trosklar?.paminn_timmar ?? {};
  const handelseDagar = Number(konfig?.trosklar?.handelser_dagar ?? 14);
  const nuIso = nu.toISOString();
  const oppna = JSON.parse(JSON.stringify(minne?.oppna ?? {}));
  const handelser = (minne?.handelser ?? []).filter((h) => nu.getTime() - Date.parse(h.tid ?? 0) <= handelseDagar * 86_400_000);
  const nya = [];
  const paminnelser = [];
  const nyaHandelser = [];
  const losta = [];
  const nuKeys = new Set();

  for (const p of problem) {
    if (p.slag === 'handelse') {
      if (handelser.some((h) => h.nyckel === p.nyckel)) continue;
      handelser.push({ nyckel: p.nyckel, tid: nuIso, rubrik: p.rubrik });
      nyaHandelser.push(p);
      continue;
    }
    nuKeys.add(p.nyckel);
    const o = oppna[p.nyckel];
    if (!o) {
      oppna[p.nyckel] = { typ: p.typ, niva: p.niva, rubrik: p.rubrik, konto: p.konto?.id ?? null, forst: nuIso, larmat: nuIso };
      nya.push(p);
      continue;
    }
    const timmar = Number(paminn[p.typ] ?? 168);
    if (nu.getTime() - Date.parse(o.larmat) >= timmar * TIMME) {
      o.larmat = nuIso;
      o.rubrik = p.rubrik;
      paminnelser.push({ ...p, forst: o.forst });
    }
  }

  if (lasta !== null) {
    for (const [nyckel, o] of Object.entries(oppna)) {
      if (nuKeys.has(nyckel)) continue;
      const kontoniva = o.typ === 'konto' || o.typ === 'token';
      if (!kontoniva && o.konto && !lasta.has(String(o.konto))) continue; // kontot lästes inte — vi vet inget
      losta.push({ nyckel, ...o });
      delete oppna[nyckel];
    }
  }

  return { nya, paminnelser, handelser: nyaHandelser, losta, minne: { ...(minne ?? {}), oppna, handelser } };
}

// ----------------------------------------------------------------- texten

const nummer = (rader) => rader.map((r, i) => `${i + 1}. ${r}`);
const punkter = (rader) => rader.map((r) => `• ${r}`);
const sedanText = (iso) => { const d = Date.parse(iso); return Number.isFinite(d) ? tidText(new Date(d)) : '?'; };

/**
 * Discord-texten. null när det inte finns något att säga. Axel pingas bara
 * när något är 🔴 (nytt eller påminnelse) — inte för 🟡, inte för ✅.
 * @returns {{ text: string, mentions: string[] } | null}
 */
export function formulera({ nya = [], paminnelser = [], handelser = [], losta = [], hjartslag = null, nu = new Date() } = {}, konfig = {}) {
  const axel = (konfig.axel_discord ?? []).map((a) => String(a.id));
  const roda = [...nya, ...handelser].filter((p) => p.niva === 'rod');
  const gula = [...nya, ...handelser].filter((p) => p.niva !== 'rod');
  const rodaPaminnelser = paminnelser.filter((p) => p.niva === 'rod');
  const tid = tidText(nu);
  const delar = [];
  const ping = axel.map((id) => `<@${id}>`).join(' ');
  let pingas = false;

  if (roda.length) {
    delar.push(`🔴 **AD ALERT — ${tid}**`);
    if (ping) { delar.push(ping); pingas = true; }
    delar.push(...nummer(roda.map((p) => p.text)));
  }
  if (gula.length) {
    if (delar.length) delar.push('');
    delar.push(`🟡 **Warnings — ${tid}**`);
    delar.push(...punkter(gula.map((p) => p.text)));
  }
  if (paminnelser.length) {
    if (delar.length) delar.push('');
    delar.push(`⏰ **Still open** (reminder${rodaPaminnelser.length && !pingas && ping ? `, ${ping}` : ''})`);
    if (rodaPaminnelser.length) pingas = true;
    delar.push(...punkter(paminnelser.map((p) => `${p.text} Open since ${sedanText(p.forst)}.`)));
  }
  if (losta.length) {
    if (delar.length) delar.push('');
    delar.push('✅ **Resolved since last check**');
    delar.push(...punkter(losta.map((l) => `${l.rubrik ?? l.nyckel} — no longer flagged by Meta.`)));
  }
  if (hjartslag) {
    if (delar.length) delar.push('');
    const oppna = Number(hjartslag.oppna ?? 0);
    delar.push(`💓 Daily check ${tid}: ${hjartslag.konton} ad account${hjartslag.konton === 1 ? '' : 's'} read, ${oppna} open problem${oppna === 1 ? '' : 's'}${hjartslag.olasta ? `, ${hjartslag.olasta} not readable` : ''}. ${oppna || hjartslag.olasta ? 'Details above or in earlier messages.' : 'All quiet.'}`);
  }
  if (!delar.length) return null;
  return { text: delar.join('\n'), mentions: pingas ? axel : [] };
}

/** Discord tar 2 000 tecken per meddelande — dela på radgränser. */
export function delaText(text, max = 1900) {
  const delar = [];
  let cur = '';
  for (const rad0 of String(text ?? '').split('\n')) {
    const rad = rad0.length > max ? `${rad0.slice(0, max - 1)}…` : rad0;
    if (cur && `${cur}\n${rad}`.length > max) { delar.push(cur); cur = rad; } else cur = cur ? `${cur}\n${rad}` : rad;
  }
  if (cur) delar.push(cur);
  return delar;
}
