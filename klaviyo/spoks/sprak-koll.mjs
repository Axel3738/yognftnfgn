// Kontrollerar att varje mejl som laddats upp på något språk i Spoks är exakt det
// payloaden säger, utan att en rad skrivs av för hand: Spoks egna svar
// (update_draft_campaign, draft_campaign, get_campaign) läses ur sessionsloggarna
// — huvudsessionens och varje subagents — och jämförs med
// klaviyo/output/<brand>/spoks/sprak/<sprak>/<mejl>.json.
//
//   node klaviyo/spoks/sprak-koll.mjs --logg <a.jsonl> [--logg <b.jsonl> …] [--brand matstrumpor]
//   node klaviyo/spoks/sprak-koll.mjs --logg … --alla     # dessutom: vilka mejl i planen som saknar svar
//
// Mejlet känns igen på titeln, som spoks-sprak.mjs skriver: "F07 E1 SV · …" (flöde)
// eller "K01 DE · 29/9 · …" (kampanj). Byggd 2026-09-29 för Matstrumpor på alla
// språk — 277 mejl går inte att läsa av för ögat (se utkast-koll.mjs: K07
// "terängen" 2026-09-29).
// Exit 1 vid avvikelse eller, med --alla, saknat mejl.

import fs from 'node:fs';
import path from 'node:path';
import { lasLogg, normBlock } from './utkast-koll.mjs';

const HAR = path.dirname(new URL(import.meta.url).pathname);
const ROT = path.resolve(HAR, '..', '..');

// Bildblocket jämförs på fil och länk (utkast-koll tittar bara på beskrivningen).
export function norm(b) {
  const t = b.type ?? 'regular';
  if (t === 'image') return { t, fileId: b.fileId ?? b.file?.id ?? null, url: b.urlRedirect ?? null };
  if (t === 'columns') return { t, kol: b.columns.map((k) => ({ flex: k.flex, blocks: k.blocks.map(norm) })) };
  if (t === 'section') return { t, blocks: b.blocks.map(norm) };
  if (t === 'abandonedCart') return { t, knapp: b.buttonText ?? null, pris: b.isProductPriceVisible ?? true };
  // Spoks svar visar inte knapptext eller synlighet på produktblock (samma som
  // utkast-koll.mjs noterar) — de jämförs i det som SKICKADES, se jamfor().
  if (t === 'products' && b.selectionMode === 'dynamic') return { t, dyn: b.dynamicCriteria, antal: b.dynamicProductsCount ?? null };
  return normBlock(b);
}

export const nyckel = (titel) => {
  const m = /^((?:F\d\d E\d+)|(?:K\d\d)|(?:F\d\d E\d+)) ([A-Z]{2}) · /.exec(String(titel ?? ''));
  return m ? `${m[1]} ${m[2]}` : null;
};

// Alla payloads per nyckel ("F07 E1 SV") ur utmappen.
export function lasPayloads(utDir) {
  const ut = new Map();
  for (const s of fs.readdirSync(utDir)) {
    const mapp = path.join(utDir, s);
    if (!fs.statSync(mapp).isDirectory() || s === 'uppdrag') continue;
    for (const f of fs.readdirSync(mapp).filter((x) => x.endsWith('.json'))) {
      const p = JSON.parse(fs.readFileSync(path.join(mapp, f), 'utf8'));
      const k = nyckel(p.title);
      if (k) ut.set(k, { fil: path.join(mapp, f), post: p });
    }
  }
  return ut;
}

// Knapptext och prisinställning på produktblock syns bara i det som skickades.
const dolda = (blocks = []) => blocks.flatMap((b) => (b.type === 'columns' ? b.columns.flatMap((k) => dolda(k.blocks)) : b.type === 'section' ? dolda(b.blocks) : b.type === 'products' ? [{ knapp: b.buttonText ?? null, synligt: b.productVisibilitySettings ?? null, kort: (b.products ?? []).map((p) => p.button ?? null) }] : []));

export function jamfor(kamp, post, skickat = null) {
  const brister = [];
  if (skickat && JSON.stringify(dolda(skickat.blocks)) !== JSON.stringify(dolda(post.blocks))) {
    brister.push(`knapptext/synlighet på produktblock: skickat ${JSON.stringify(dolda(skickat.blocks))} ≠ payload ${JSON.stringify(dolda(post.blocks))}`);
  }
  if (kamp.title !== post.title) brister.push(`titel "${kamp.title}" ≠ "${post.title}"`);
  for (const f of ['emailTitle', 'emailDescription']) {
    const a = kamp.customizedNotification?.[f] ?? '';
    const b = post.customizedNotification?.[f] ?? '';
    if (a !== b) brister.push(`${f} "${a}" ≠ "${b}"`);
  }
  const a = (kamp.blocks ?? []).map(norm);
  const b = (post.blocks ?? []).map(norm);
  if (a.length !== b.length) brister.push(`${a.length} block i Spoks, ${b.length} i payloaden`);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = JSON.stringify(a[i]);
    const y = JSON.stringify(b[i]);
    if (x !== y) brister.push(`block ${i}: Spoks ${x} ≠ payload ${y}`);
  }
  return brister;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const loggar = process.argv.flatMap((a, i, alla) => (alla[i - 1] === '--logg' ? [a] : []));
  const bi = process.argv.indexOf('--brand');
  const brandId = bi >= 0 ? process.argv[bi + 1] : 'matstrumpor';
  if (!loggar.length) { console.error('Ange minst en --logg <fil.jsonl>.'); process.exit(2); }
  const utDir = path.join(ROT, 'klaviyo', 'output', brandId, 'spoks', 'sprak');
  const payloads = lasPayloads(utDir);
  // Senaste svaret per post-id, över alla loggar (ordningen i varje logg).
  const perNyckel = new Map();
  for (const l of loggar) {
    const { senast, skickat } = lasLogg(l);
    for (const { kamp } of senast.values()) {
      const k = nyckel(kamp.title);
      if (!k) continue;
      const tid = Date.parse(kamp.updated ?? kamp.created ?? 0) || 0;
      const forra = perNyckel.get(k);
      const sk = skickat.get(kamp.id) ?? null;
      if (!forra || tid >= forra.tid) perNyckel.set(k, { kamp, tid, skickat: sk ?? forra?.skickat ?? null });
      else if (!forra.skickat && sk) forra.skickat = sk;
    }
  }
  let fel = 0;
  for (const [k, { kamp, skickat }] of [...perNyckel].sort()) {
    const p = payloads.get(k);
    if (!p) { console.log(`❌ ${k}: finns i Spoks men inte i payloaden`); fel++; continue; }
    const brister = jamfor(kamp, p.post, skickat);
    if (!skickat) brister.push('inget fullständigt skickat postData i loggarna — knapptexterna är okontrollerade');
    if (brister.length) { fel++; console.log(`❌ ${k} ${kamp.id}\n   - ${brister.join('\n   - ')}`); }
  }
  console.log(`${perNyckel.size} mejl med Spoks-svar kontrollerade, ${fel} med avvikelser.`);
  if (process.argv.includes('--alla')) {
    const plan = JSON.parse(fs.readFileSync(path.join(utDir, 'PLAN.json'), 'utf8'));
    const vantade = new Set();
    for (const f of plan.floden) for (const s of f.steg.filter((x) => x.typ === 'send')) vantade.add(nyckel(payloads.get([...payloads.keys()].find((k) => payloads.get(k).fil.endsWith(`/${s.sprak}/${s.mejl_id}.json`)))?.post.title));
    for (const kmp of plan.kampanjer) vantade.add(nyckel(payloads.get([...payloads.keys()].find((k) => payloads.get(k).fil.endsWith(`/${kmp.sprak}/${kmp.id}.json`)))?.post.title));
    vantade.delete(null);
    const saknas = [...vantade].filter((k) => !perNyckel.has(k));
    console.log(`${vantade.size} mejl i planen, ${saknas.length} utan Spoks-svar${saknas.length ? `: ${saknas.join(', ')}` : ''}.`);
    if (saknas.length) fel++;
  }
  process.exit(fel ? 1 : 0);
}
