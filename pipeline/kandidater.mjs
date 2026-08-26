#!/usr/bin/env node
// Produktkandidat-minnet för Bäverbutiken. Läser products/kandidater.json, räknar poäng
// och dom enligt docs/os/PRODUKTKRITERIER.md, och säger till när en dom saknar källa.
//
//   node pipeline/kandidater.mjs              → hela pipelinen
//   node pipeline/kandidater.mjs visa <slug>  → ett kort i detalj
//   node pipeline/kandidater.mjs sok <term>   → har vi redan dömt det här? (kör ALLTID före ny bedömning)
//
// Domen räknas här och skrivs aldrig för hand — annars glider den.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '..', 'products', 'kandidater.json');

const GRINDAR = {
  g1_ica_maxi: 'G1 ICA Maxi (finns i bredhandeln?)',
  g2_mattnad:  'G2 Mättnad (redan körd sönder?)',
  g3_tre_sek:  'G3 3-sekunderstestet (syns wow:et?)',
  g4_marginal: 'G4 Marginal (≥3× landed cost, BE-ROAS ≤2,0)',
  g5_retur:    'G5 Retur (storlek/batteri/CE/ömtåligt?)',
  g6_manskop:  'G6 Mansköp (köper han den till sig själv?)',
};
const AXLAR = { wow: 2, problem: 1, demo: 1, ovanlighet: 1, marginal: 1, robusthet: 1 };
const MAXPOANG = Object.values(AXLAR).reduce((s, v) => s + v, 0) * 5; // 35

const db = JSON.parse(readFileSync(FILE, 'utf8'));
const kandidater = db.kandidater ?? [];

function bedom(k) {
  const grindar = k.grindar ?? {};
  const fallna = Object.keys(GRINDAR).filter(g => grindar[g]?.dom === 'fail');
  const okallade = Object.entries(grindar)
    .filter(([, v]) => v?.dom && !v.kalla)
    .map(([g]) => g);
  const otestade = Object.keys(GRINDAR).filter(g => !grindar[g]?.dom);

  if (fallna.length) {
    return { dom: 'NEJ', poang: null, fallna, okallade, otestade, orsak: `föll på ${fallna.map(g => GRINDAR[g].split(' ')[0]).join(', ')}` };
  }
  if (otestade.length) {
    return { dom: 'OTESTAD', poang: null, fallna, okallade, otestade, orsak: `${otestade.length} grind(ar) inte körda` };
  }

  const p = k.poang ?? {};
  const saknas = Object.keys(AXLAR).filter(a => typeof p[a] !== 'number');
  if (saknas.length) {
    return { dom: 'OFULLSTÄNDIG', poang: null, fallna, okallade, otestade, orsak: `saknar poäng: ${saknas.join(', ')}` };
  }

  const poang = Object.entries(AXLAR).reduce((s, [a, v]) => s + p[a] * v, 0);
  let dom = poang >= 26 ? 'GO' : poang >= 20 ? 'VÄNTA' : 'NEJ';
  let orsak = `${poang}/${MAXPOANG}`;
  if (dom === 'GO' && p.wow < 3) { dom = 'VÄNTA'; orsak = `${poang}/${MAXPOANG} men wow ${p.wow} < 3 (wow-golvet)`; }
  return { dom, poang, fallna, okallade, otestade, orsak };
}

const IKON = { GO: '✅', 'VÄNTA': '🟡', NEJ: '❌', OTESTAD: '⬜', 'OFULLSTÄNDIG': '⚠️ ' };
const dagarSedan = d => Math.floor((Date.now() - new Date(d).getTime()) / 864e5);

function rad(k) {
  const b = bedom(k);
  return `${IKON[b.dom] ?? '  '} ${b.dom.padEnd(13)} ${String(b.poang ?? '–').padStart(5)}  ${k.nisch.padEnd(12)} ${k.namn}\n     ${b.orsak}${k.upptackt ? ` · upptäckt för ${dagarSedan(k.upptackt)} d sedan` : ''}`;
}

function detalj(k) {
  const b = bedom(k);
  const out = [`\n=== ${k.namn} (${k.slug}) ===`, `Nisch: ${k.nisch} · Status: ${k.status} · Upptäckt: ${k.upptackt ?? '–'}${k.temu_sokterm ? ` · Temu-sökterm: "${k.temu_sokterm}"` : ''}`, ''];
  for (const [g, etikett] of Object.entries(GRINDAR)) {
    const v = k.grindar?.[g];
    const ikon = !v?.dom ? '⬜' : v.dom === 'pass' ? '✅' : v.dom === 'varning' ? '🟡' : '❌';
    out.push(`${ikon} ${etikett}`);
    if (v?.not) out.push(`     ${v.not}`);
    if (v?.malgrupp) out.push(`     gäller målgrupp: ${v.malgrupp}`);
    if (v?.dom && !v.kalla) out.push(`     ⚠️  DOM UTAN KÄLLA — ogiltig enligt CLAUDE.md regel 3`);
    else if (v?.kalla) out.push(`     källa: ${v.kalla}`);
  }
  out.push('');
  const p = k.poang ?? {};
  out.push('Poäng: ' + Object.entries(AXLAR).map(([a, v]) => `${a}${v > 1 ? `×${v}` : ''} ${typeof p[a] === 'number' ? p[a] : '–'}`).join(' | '));
  out.push(`\nDOM: ${IKON[b.dom] ?? ''} ${b.dom}  (${b.orsak})`);
  if (k.skal) out.push(`SKÄL: ${k.skal}`);
  if (k.nasta) out.push(`NÄSTA: ${k.nasta}`);
  return out.join('\n');
}

const [, , cmd, ...rest] = process.argv;
const term = rest.join(' ').toLowerCase();

if (cmd === 'visa') {
  const k = kandidater.find(x => x.slug === rest[0]);
  if (!k) { console.error(`Okänd slug: ${rest[0]}. Finns: ${kandidater.map(x => x.slug).join(', ') || '(inga)'}`); process.exit(1); }
  console.log(detalj(k));
} else if (cmd === 'sok') {
  if (!term) { console.error('Ange sökterm: node pipeline/kandidater.mjs sok fiskeklamma'); process.exit(1); }
  const träffar = kandidater.filter(k => `${k.slug} ${k.namn} ${k.nisch} ${k.temu_sokterm ?? ''} ${k.skal ?? ''}`.toLowerCase().includes(term));
  if (!träffar.length) console.log(`Inget dömt som matchar "${term}" — fri fram att bedöma.`);
  else { console.log(`⚠️  ${träffar.length} tidigare dom(ar) matchar "${term}" — döm inte om utan ny information:`); träffar.forEach(k => console.log(detalj(k))); }
} else {
  const grupper = { GO: [], 'VÄNTA': [], 'OFULLSTÄNDIG': [], OTESTAD: [], NEJ: [] };
  kandidater.forEach(k => grupper[bedom(k).dom]?.push(k));
  console.log(`\nPRODUKTKANDIDATER — Bäverbutiken   (${kandidater.length} st, kriterier: docs/os/PRODUKTKRITERIER.md)\n`);
  for (const [g, lista] of Object.entries(grupper)) {
    if (!lista.length) continue;
    console.log(`── ${g} (${lista.length}) ${'─'.repeat(Math.max(0, 60 - g.length))}`);
    lista.forEach(k => console.log(rad(k)));
    console.log('');
  }
  if (!kandidater.length) console.log('  (tom — kör /produkt jaga <nisch> för att fylla den)\n');

  const utankalla = kandidater.filter(k => bedom(k).okallade.length);
  if (utankalla.length) console.log(`⚠️  ${utankalla.length} kandidat(er) har grinddomar utan källa — ogiltiga enligt CLAUDE.md regel 3: ${utankalla.map(k => k.slug).join(', ')}\n`);

  const gamla = grupper['VÄNTA'].filter(k => k.upptackt && dagarSedan(k.upptackt) > 60);
  if (gamla.length) console.log(`🕒 ${gamla.length} på VÄNTA äldre än 60 dagar — ta upp eller stäng: ${gamla.map(k => k.slug).join(', ')}\n`);

  const redo = grupper.GO.filter(k => k.status === 'bedomd');
  if (redo.length) console.log(`▶️  GO utan nästa steg taget: ${redo.map(k => k.slug).join(', ')} — beställ prov och kör /ny-produkt\n`);
}
