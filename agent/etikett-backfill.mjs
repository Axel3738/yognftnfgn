#!/usr/bin/env node
// BACKFILL AV ETIKETTER — hela bakkatalogen på en gång (Axels order 2026-09-21:
// "Meta har historiken. Backfilla etiketterna på hela bakkatalogen NU").
//
// Läser Meta direkt med META_ACCESS_TOKEN (läs-bara mot Meta), räknar varje
// annons första sju dygn från created_time, kampanjens spend i samma fönster,
// och skriver ETIKETT-rader i agent/budgetlogg.jsonl via etikett.mjs.
//
// Var backfillen INTE räcker: BREAKTHROUGH kräver att kampanjens budget höjdes
// under annonsens första vecka, och den historiken finns bara i budgetloggen
// (från 2026-08-28). Fönster utan budgetuppgift ger SPEND_WINNER märkt
// `osaker_breakthrough` — aldrig gissat uppåt.
//
//   node agent/etikett-backfill.mjs --konto SE|NO|alla [--torr] [--idag YYYY-MM-DD] [--cache <fil>]
//
// --cache sparar Metas svar så en torrkörning och den skarpa körningen inte
// hämtar samma sak två gånger (kontot ligger på development access, ~1 anrop/s).

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { breakthroughFrekvens, formateraFrekvenser, formateraTabell, raknaEtiketter } from './etikett.mjs';
import { lasLogg, skrivRad } from './logg.mjs';
import { breakEvenForPost, TILLATNA_KONTON } from './rond.mjs';

const HÄR = dirname(fileURLToPath(import.meta.url));
const TOKEN = process.env.META_ACCESS_TOKEN;
const API = 'https://graph.facebook.com/v21.0';
const PAUS_MS = 1200;
const BACKOFF_MS = [20000, 40000, 80000, 160000, 300000];
let senast = 0;
const vänta = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(sökväg, params = {}) {
  if (!TOKEN) throw new Error('META_ACCESS_TOKEN saknas i miljön.');
  const url = new URL(`${API}/${sökväg}`);
  url.searchParams.set('access_token', TOKEN);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
  for (let f = 0; ; f++) {
    const t = senast + PAUS_MS - Date.now();
    if (t > 0) await vänta(t);
    senast = Date.now();
    const res = await fetch(url);
    const json = await res.json().catch(() => ({}));
    if (res.ok && !json.error) return json;
    const e = json.error || {};
    const strypt = e.code === 17 || e.code === 4 || e.code === 32 || /request limit/i.test(e.message || '');
    if ((strypt || e.is_transient || res.status >= 500) && f < BACKOFF_MS.length) {
      console.error(`  ⏳ Meta ${strypt ? 'stryper' : `fel ${e.code ?? res.status}`} — väntar ${BACKOFF_MS[f] / 1000}s`);
      await vänta(BACKOFF_MS[f]);
      continue;
    }
    throw new Error(`Meta ${res.status}: ${e.message || res.statusText}`);
  }
}

async function alla(sökväg, params = {}) {
  const ut = [];
  let svar = await api(sökväg, { ...params, limit: params.limit ?? 200 });
  ut.push(...(svar.data || []));
  while (svar.paging?.next) {
    const t = senast + PAUS_MS - Date.now();
    if (t > 0) await vänta(t);
    senast = Date.now();
    const res = await fetch(svar.paging.next);
    svar = await res.json().catch(() => ({}));
    if (svar.error) { if (svar.error.code === 17) { await vänta(20000); continue; } throw new Error(`Meta paging: ${svar.error.message}`); }
    ut.push(...(svar.data || []));
  }
  return ut;
}

/** Datum i svensk tid ur Metas created_time ("2026-08-19T07:12:33+0000"). */
export function svensktDatum(iso) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(t));
}
const plus = (iso, d) => new Date(Date.parse(`${iso}T00:00:00Z`) + d * 86400000).toISOString().slice(0, 10);
const val = (arr, typ, fönster = '7d_click') => {
  const a = (arr || []).find((x) => x.action_type === typ);
  if (!a) return null;
  const v = a[fönster] ?? a.value;
  return v === undefined ? null : Number(v);
};

/** Batchnummer ur products/<id>/batch-log.md: rubriken "## Batch #N" närmast före annonsnamnet. */
function batchIndex() {
  const index = new Map();
  const rot = join(HÄR, '..', 'products');
  if (!existsSync(rot)) return index;
  for (const p of readdirSafe(rot)) {
    const fil = join(rot, p, 'batch-log.md');
    if (!existsSync(fil)) continue;
    let batch = null;
    for (const rad of readFileSync(fil, 'utf8').split('\n')) {
      const m = rad.match(/^##\s+Batch\s+#(\d+)/i);
      if (m) { batch = Number(m[1]); continue; }
      if (batch === null) continue;
      for (const namn of rad.matchAll(/`?([A-Za-zÅÄÖåäö0-9]+_[A-Z]{1,4}_\d+(?:_H?\d+)?)`?/g)) {
        if (!index.has(namn[1])) index.set(namn[1], batch);
      }
    }
  }
  return index;
}
function readdirSafe(p) { try { return readdirSync(p); } catch { return []; } }

async function hamta(kontoId, idag, cacheFil) {
  if (cacheFil && existsSync(cacheFil)) {
    console.error(`Läser Metas svar ur ${cacheFil}`);
    return JSON.parse(readFileSync(cacheFil, 'utf8'));
  }
  const act = `act_${kontoId}`;
  console.error(`Hämtar annonslistan för ${act} …`);
  const annonser = await alla(`${act}/ads`, { fields: 'id,name,created_time,effective_status,campaign_id,campaign{id,name,effective_status,daily_budget}' });
  console.error(`  ${annonser.length} annonser i kontot`);
  console.error('Hämtar livstidsspend per annons …');
  const livstid = await alla(`${act}/insights`, { level: 'ad', date_preset: 'maximum', fields: 'ad_id,spend', limit: 500 });
  const spendLivstid = new Map(livstid.map((r) => [r.ad_id, Number(r.spend)]));

  const gräns = plus(idag, -7);
  const kandidater = [];
  const uteslutna = { for_unga: 0, aldrig_aktiva: 0, utan_datum: 0 };
  for (const a of annonser) {
    const d0 = svensktDatum(a.created_time);
    if (!d0) { uteslutna.utan_datum += 1; continue; }
    if (d0 > gräns) { uteslutna.for_unga += 1; continue; }
    const spend = spendLivstid.get(a.id) ?? 0;
    if (a.effective_status !== 'ACTIVE' && !(spend > 0)) { uteslutna.aldrig_aktiva += 1; continue; }
    kandidater.push({ id: a.id, namn: a.name, d0, status: a.effective_status, kampanj_id: a.campaign_id, kampanj_namn: a.campaign?.name, kampanj_budget: a.campaign?.daily_budget, spend_livstid: spend });
  }
  console.error(`  ${kandidater.length} annonser med komplett sjudagarsfönster (uteslutna: ${JSON.stringify(uteslutna)})`);

  // Fönster per (kampanj, D0) — ett annonsanrop + ett kampanjanrop per fönster.
  const fönster = new Map();
  for (const k of kandidater) {
    const key = `${k.kampanj_id}|${k.d0}`;
    if (!fönster.has(key)) fönster.set(key, { kampanj_id: k.kampanj_id, d0: k.d0, d6: plus(k.d0, 6), annonser: [] });
    fönster.get(key).annonser.push(k);
  }
  console.error(`  ${fönster.size} fönster att hämta (2 anrop var) …`);
  let n = 0;
  const data = [];
  for (const f of fönster.values()) {
    n += 1;
    const tr = { since: f.d0, until: f.d6 };
    const adRader = await alla(`${act}/insights`, {
      level: 'ad', time_range: tr, filtering: [{ field: 'campaign.id', operator: 'IN', value: [f.kampanj_id] }],
      fields: 'ad_id,ad_name,spend,actions,purchase_roas,impressions,video_thruplay_watched_actions',
      action_attribution_windows: ['7d_click'], limit: 200,
    });
    const kRader = await alla(`${act}/insights`, {
      level: 'campaign', time_range: tr, filtering: [{ field: 'campaign.id', operator: 'IN', value: [f.kampanj_id] }],
      fields: 'campaign_id,spend,actions,purchase_roas', action_attribution_windows: ['7d_click'], limit: 10,
    });
    const k = kRader[0] || {};
    const perAd = new Map(adRader.map((r) => [r.ad_id, r]));
    data.push({
      ...f,
      kampanj: { spend: k.spend !== undefined ? Number(k.spend) : null, roas: val(k.purchase_roas, 'omni_purchase'), kop: val(k.actions, 'omni_purchase') },
      annonser: f.annonser.map((a) => {
        const r = perAd.get(a.id) || {};
        return {
          ...a,
          spend: r.spend !== undefined ? Number(r.spend) : 0,
          kop: val(r.actions, 'omni_purchase') ?? 0,
          roas: val(r.purchase_roas, 'omni_purchase') ?? 0,
          impressions: r.impressions !== undefined ? Number(r.impressions) : null,
          video_3s: val(r.actions, 'video_view'),
          thruplay: r.video_thruplay_watched_actions ? Number(r.video_thruplay_watched_actions[0]?.value) : null,
        };
      }),
    });
    if (n % 10 === 0) console.error(`  ${n}/${fönster.size} fönster`);
  }
  const ut = { konto: kontoId, idag, hamtad: new Date().toISOString(), uteslutna, fonster: data };
  if (cacheFil) { mkdirSync(dirname(cacheFil), { recursive: true }); writeFileSync(cacheFil, JSON.stringify(ut)); }
  return ut;
}

async function korKonto(kontoId, { idag, torr, cacheFil, karta, fx, logg, batchar }) {
  const data = await hamta(kontoId, idag, cacheFil);
  const rader = [];
  const hoppade = [];
  for (const f of data.fonster) {
    const post = karta[f.kampanj_id] ?? {};
    const namn = f.annonser[0]?.kampanj_namn ?? '';
    const be = breakEvenForPost(post, namn, fx);
    const jobb = {
      datum: idag, ad_account_id: kontoId, kampanj_id: f.kampanj_id, kampanj_namn: namn,
      break_even: be.be, struktur: f.annonser[0]?.kampanj_budget ? 'CBO' : 'ABO',
      kampanj: { spend: f.kampanj.spend, roas: f.kampanj.roas },
      backfill: true,
      annonser: f.annonser.map((a) => ({
        id: a.id, namn: a.namn, d0: a.d0, spend: a.spend, kop: a.kop, roas: a.roas,
        impressions: a.impressions, video_3s: a.video_3s, thruplay: a.thruplay,
        batch: batchar.get(a.namn) ?? null, typ: 'okänd',
      })),
    };
    const r = raknaEtiketter(jobb, [...logg, ...rader]);
    rader.push(...r.rader);
    hoppade.push(...r.hoppade.map((h) => ({ ...h, kampanj: namn })));
  }
  if (!torr) for (const r of rader) await skrivRad(r);
  return { konto: kontoId, uteslutna: data.uteslutna, fonster: data.fonster.length, rader, hoppade };
}

function rapport(resultat, idag, torr) {
  const ut = [`# Etiketter — backfill ${idag}${torr ? ' (TORRKÖRNING, inget skrivet)' : ''}`, ''];
  ut.push('Etiketten är ingen dom: `bedombar` (≥ 300 kr och ≥ 3 köp) står bredvid. **OSÄKER** = spend och KPI räckte för breakthrough men budgethistoriken saknas i fönstret (budgetloggen börjar 2026-08-28) — aldrig gissad uppåt.', '');
  for (const r of resultat) {
    const namn = TILLATNA_KONTON[r.konto]?.namn ?? r.konto;
    ut.push(`## ${namn} (${r.konto})`, '');
    ut.push(`${r.rader.length} annonser etiketterade ur ${r.fonster} fönster. Uteslutna: ${r.uteslutna.for_unga} yngre än 7 dygn, ${r.uteslutna.aldrig_aktiva} pausade utan spend (aldrig aktiva), ${r.uteslutna.utan_datum} utan datum. Hoppade: ${r.hoppade.length}.`, '');
    const perEtikett = {};
    for (const x of r.rader) perEtikett[x.etikett] = (perEtikett[x.etikett] ?? 0) + 1;
    ut.push(`Fördelning: ${Object.entries(perEtikett).map(([k, v]) => `${k} ${v}`).join(' · ')}. Osäkra: ${r.rader.filter((x) => x.osaker_breakthrough).length}. Bedömbara: ${r.rader.filter((x) => x.bedombar).length}.`, '');
    ut.push(formateraFrekvenser(breakthroughFrekvens(r.rader)), '');
    const perKampanj = new Map();
    for (const x of r.rader) { if (!perKampanj.has(x.kampanj_id)) perKampanj.set(x.kampanj_id, []); perKampanj.get(x.kampanj_id).push(x); }
    for (const [, rows] of perKampanj) {
      ut.push(`### ${String(rows[0].kampanj_namn).split('|')[0].trim()}`, '', formateraTabell(rows.sort((a, b) => (b.spend_ad ?? 0) - (a.spend_ad ?? 0))), '');
    }
    if (r.hoppade.length) { ut.push('Hoppade:', ...r.hoppade.map((h) => `- ${h.namn}: ${h.orsak} (${h.kampanj})`), ''); }
  }
  return ut.join('\n');
}

async function main(argv) {
  const flagga = (n, std) => { const i = argv.indexOf(n); return i === -1 ? std : argv[i + 1]; };
  const idag = flagga('--idag', new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date()));
  const kontoVal = flagga('--konto', 'alla');
  const torr = argv.includes('--torr');
  const konton = kontoVal === 'alla' ? Object.keys(TILLATNA_KONTON) : Object.entries(TILLATNA_KONTON).filter(([, k]) => k.marknad === kontoVal.toUpperCase()).map(([id]) => id);
  if (konton.length === 0) throw new Error(`Okänt konto "${kontoVal}" — SE, NO eller alla.`);
  let karta = {}; let fx = null;
  try { const rå = JSON.parse(readFileSync(join(HÄR, 'produktkarta.json'), 'utf8')); for (const p of rå.kampanjer ?? []) karta[p.campaign_id] = p; fx = rå.valutakurser ?? null; } catch { karta = {}; }
  const logg = await lasLogg();
  const batchar = batchIndex();
  const resultat = [];
  for (const kontoId of konton) {
    const cacheFil = flagga('--cache', null) ? `${flagga('--cache')}-${kontoId}.json` : null;
    resultat.push(await korKonto(kontoId, { idag, torr, cacheFil, karta, fx, logg, batchar }));
  }
  const text = rapport(resultat, idag, torr);
  const utFil = join(HÄR, 'utdata', `etiketter-backfill-${idag}${torr ? '-torr' : ''}.md`);
  mkdirSync(dirname(utFil), { recursive: true });
  writeFileSync(utFil, text);
  console.log(text);
  console.error(`\nRapport: ${utFil}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main(process.argv.slice(2)).catch((e) => { console.error(`BACKFILL AVBRÖTS: ${e.message}`); process.exit(2); });
}
