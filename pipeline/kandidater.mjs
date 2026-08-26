#!/usr/bin/env node
// Produktkandidat-minnet för Bäverbutiken. Läser products/kandidater.json.
//
// Claude POÄNGSÄTTER och RANGORDNAR. Axel GODKÄNNER. Skriptet räknar aldrig fram
// ett ja eller nej åt honom — det sorterar bara listan så det bästa ligger överst.
//
//   node pipeline/kandidater.mjs                    → listan, rangordnad
//   node pipeline/kandidater.mjs visa <slug>        → ett kort i detalj
//   node pipeline/kandidater.mjs sok <term>         → redan bedömd? (kör ALLTID före ny bedömning)
//   node pipeline/kandidater.mjs godkann <slug> "skäl"
//   node pipeline/kandidater.mjs neka <slug> "skäl"
//   node pipeline/kandidater.mjs smak               → vad Axel faktiskt säger ja och nej till
//
// Kriterier: docs/os/PRODUKTKRITERIER.md

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const FILE = join(dirname(fileURLToPath(import.meta.url)), '..', 'products', 'kandidater.json');

// Två hårda stopp. Allt annat är poäng — en produkt får finnas i butik, den får bara
// inte vara svinkänd, och det är Axel som avgör var gränsen går.
const STOPP = {
  frakt_regel: 'Frakt/regel (litium, CE-el, livsmedelskontakt, vapenlikt, >3 v leverans)',
  marginal:    'Marginal (går inte att sälja till ≥3× landed cost)',
};
const AXLAR = {
  wow:         { vikt: 2, text: 'Wow — stannar tummen' },
  kandhet:     { vikt: 2, text: 'Kändhet — 5 = knappt sedd i Sverige, 0 = hyllvara alla kan priset på' },
  problem:     { vikt: 1, text: 'Problem — gör det ont, ofta?' },
  demo:        { vikt: 1, text: 'Demo — filmar före/efter sig självt?' },
  mansprodukt: { vikt: 1, text: 'Mansprodukt — köper en man den till sig själv?' },
  marginal:    { vikt: 1, text: 'Marginal — hur bra är break-even-ROAS?' },
};
const MAXPOANG = Object.values(AXLAR).reduce((s, a) => s + a.vikt, 0) * 5; // 40

const db = JSON.parse(readFileSync(FILE, 'utf8'));
const kandidater = db.kandidater ?? [];
const spara = () => writeFileSync(FILE, JSON.stringify(db, null, 2) + '\n');
const dagarSedan = d => Math.floor((Date.now() - new Date(d).getTime()) / 864e5);
const idag = () => new Date().toISOString().slice(0, 10);

function bedom(k) {
  const stoppade = Object.keys(STOPP).filter(g => k.stopp?.[g]?.dom === 'fail');
  const p = k.poang ?? {};
  const satta = Object.keys(AXLAR).filter(a => typeof p[a] === 'number');
  const saknas = Object.keys(AXLAR).filter(a => !satta.includes(a));
  const poang = satta.reduce((s, a) => s + p[a] * AXLAR[a].vikt, 0);
  // Delvis poängsatt ranking: skala upp till full vikt så listan går att sortera ändå.
  const maxSatt = satta.reduce((s, a) => s + AXLAR[a].vikt, 0) * 5;
  const indikativ = maxSatt ? Math.round((poang / maxSatt) * MAXPOANG) : null;
  const okallade = Object.entries(k.stopp ?? {}).filter(([, v]) => v?.dom && !v.kalla).map(([g]) => g);
  return { stoppade, poang, saknas, indikativ, okallade, komplett: saknas.length === 0 };
}

function lage(k) {
  const b = bedom(k);
  if (k.axel?.dom === 'ja') return { kod: 'GODKÄND', ikon: '✅' };
  if (k.axel?.dom === 'nej') return { kod: 'NEKAD', ikon: '❌' };
  if (b.stoppade.length) return { kod: 'STOPPAD', ikon: '⛔' };
  return { kod: 'VÄNTAR PÅ AXEL', ikon: '🟡' };
}

function detalj(k) {
  const b = bedom(k), l = lage(k);
  const ut = [`\n=== ${k.namn} (${k.slug}) ===`,
    `Nisch: ${k.nisch} · Upptäckt: ${k.upptackt ?? '–'}${k.temu_sokterm ? ` · Temu-sökterm: "${k.temu_sokterm}"` : ''}`, ''];
  for (const [g, text] of Object.entries(STOPP)) {
    const v = k.stopp?.[g];
    ut.push(`${!v?.dom ? '⬜' : v.dom === 'fail' ? '⛔' : '✅'} ${text}`);
    if (v?.not) ut.push(`     ${v.not}`);
    if (v?.dom && !v.kalla) ut.push(`     ⚠️  UTAN KÄLLA — ogiltig enligt CLAUDE.md regel 3`);
    else if (v?.kalla) ut.push(`     källa: ${v.kalla}`);
  }
  ut.push('');
  for (const [a, def] of Object.entries(AXLAR)) {
    const v = k.poang?.[a];
    const stapel = typeof v === 'number' ? '█'.repeat(v) + '·'.repeat(5 - v) : '     ';
    ut.push(`  ${stapel} ${typeof v === 'number' ? v : '–'}${def.vikt > 1 ? ` ×${def.vikt}` : '   '}  ${def.text}`);
    if (k.motivering?.[a]) ut.push(`          ${k.motivering[a]}`);
  }
  ut.push(`\nPOÄNG: ${b.komplett ? `${b.poang}/${MAXPOANG}` : `${b.indikativ ?? '–'}/${MAXPOANG} (indikativt — saknar ${b.saknas.join(', ')})`}`);
  ut.push(`LÄGE:  ${l.ikon} ${l.kod}`);
  if (k.axel?.skal) ut.push(`AXEL:  "${k.axel.skal}" (${k.axel.datum ?? '–'})`);
  if (k.skal) ut.push(`NOT:   ${k.skal}`);
  if (k.kandhet_kalla) ut.push(`KÄNDHET: ${k.kandhet_kalla}`);
  return ut.join('\n');
}

const [, , cmd, ...rest] = process.argv;
const hitta = slug => {
  const k = kandidater.find(x => x.slug === slug);
  if (!k) { console.error(`Okänd slug: ${slug}. Finns: ${kandidater.map(x => x.slug).join(', ') || '(inga)'}`); process.exit(1); }
  return k;
};

if (cmd === 'visa') {
  console.log(detalj(hitta(rest[0])));

} else if (cmd === 'sok') {
  const term = rest.join(' ').toLowerCase();
  if (!term) { console.error('Ange sökterm.'); process.exit(1); }
  const träffar = kandidater.filter(k => `${k.slug} ${k.namn} ${k.nisch} ${k.temu_sokterm ?? ''} ${k.skal ?? ''}`.toLowerCase().includes(term));
  if (!träffar.length) console.log(`Inget bedömt som matchar "${term}" — fri fram.`);
  else { console.log(`⚠️  ${träffar.length} tidigare bedömning(ar) matchar "${term}":`); träffar.forEach(k => console.log(detalj(k))); }

} else if (cmd === 'godkann' || cmd === 'neka') {
  const k = hitta(rest[0]);
  const skal = rest.slice(1).join(' ');
  if (!skal) { console.error(`Skäl krävs — det är skälet systemet lär sig av.\n  node pipeline/kandidater.mjs ${cmd} ${rest[0]} "för lik en Biltema-pryl"`); process.exit(1); }
  k.axel = { dom: cmd === 'godkann' ? 'ja' : 'nej', skal, datum: idag() };
  spara();
  console.log(`${cmd === 'godkann' ? '✅ Godkänd' : '❌ Nekad'}: ${k.namn}\n   "${skal}"`);

} else if (cmd === 'smak') {
  const dömda = kandidater.filter(k => k.axel?.dom);
  if (!dömda.length) { console.log('\nInga domar från Axel ännu — inget att lära av.\nGodkänn/neka med: node pipeline/kandidater.mjs godkann <slug> "skäl"\n'); process.exit(0); }
  const ja = dömda.filter(k => k.axel.dom === 'ja'), nej = dömda.filter(k => k.axel.dom === 'nej');
  console.log(`\nAXELS SMAK — ${dömda.length} domar (${ja.length} ja, ${nej.length} nej)\n`);

  console.log('── Vilken axel skiljer ja från nej ' + '─'.repeat(30));
  for (const [a, def] of Object.entries(AXLAR)) {
    const snitt = lista => { const v = lista.map(k => k.poang?.[a]).filter(x => typeof x === 'number'); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
    const sj = snitt(ja), sn = snitt(nej);
    if (sj === null || sn === null) continue;
    const d = sj - sn;
    console.log(`  ${a.padEnd(12)} ja ${sj.toFixed(1)}  nej ${sn.toFixed(1)}  ${d > 0 ? '+' : ''}${d.toFixed(1)} ${Math.abs(d) >= 1 ? '← styr beslutet' : ''}`);
  }

  const perNisch = {};
  dömda.forEach(k => { (perNisch[k.nisch] ??= { ja: 0, nej: 0 })[k.axel.dom]++; });
  console.log('\n── Per nisch ' + '─'.repeat(52));
  Object.entries(perNisch).sort((a, b) => (b[1].ja + b[1].nej) - (a[1].ja + a[1].nej))
    .forEach(([n, v]) => console.log(`  ${n.padEnd(14)} ${v.ja} ja / ${v.nej} nej`));

  console.log('\n── Axels egna ord (läs dessa före nästa lista) ' + '─'.repeat(19));
  for (const k of [...ja, ...nej].sort((a, b) => (b.axel.datum ?? '').localeCompare(a.axel.datum ?? ''))) {
    console.log(`  ${k.axel.dom === 'ja' ? '✅' : '❌'} ${k.namn}\n     "${k.axel.skal}"`);
  }
  console.log('');

} else {
  const rank = k => bedom(k).indikativ ?? -1;
  const grupper = { 'VÄNTAR PÅ AXEL': [], 'GODKÄND': [], 'STOPPAD': [], 'NEKAD': [] };
  kandidater.forEach(k => grupper[lage(k).kod].push(k));
  console.log(`\nPRODUKTKANDIDATER — Bäverbutiken   (${kandidater.length} st · kriterier: docs/os/PRODUKTKRITERIER.md)`);
  console.log(`Claude poängsätter och rangordnar. Axel godkänner.\n`);
  for (const [g, lista] of Object.entries(grupper)) {
    if (!lista.length) continue;
    console.log(`── ${g} (${lista.length}) ${'─'.repeat(Math.max(0, 56 - g.length))}`);
    lista.sort((a, b) => rank(b) - rank(a)).forEach(k => {
      const b = bedom(k), l = lage(k);
      const p = b.komplett ? `${b.poang}` : `~${b.indikativ ?? '–'}`;
      console.log(`${l.ikon} ${String(p).padStart(4)}/${MAXPOANG}  ${k.nisch.padEnd(12)} ${k.namn}`);
      const detaljer = [];
      if (typeof k.poang?.wow === 'number') detaljer.push(`wow ${k.poang.wow}`);
      if (typeof k.poang?.kandhet === 'number') detaljer.push(`kändhet ${k.poang.kandhet}`);
      if (b.stoppade.length) detaljer.push(`STOPP: ${b.stoppade.join(', ')}`);
      if (k.axel?.skal) detaljer.push(`"${k.axel.skal}"`);
      if (!b.komplett) detaljer.push(`saknar ${b.saknas.join(', ')}`);
      if (detaljer.length) console.log(`       ${detaljer.join(' · ')}`);
    });
    console.log('');
  }
  if (!kandidater.length) console.log('  (tom — kör /produkt jaga <nisch>)\n');

  const väntar = grupper['VÄNTAR PÅ AXEL'];
  if (väntar.length) console.log(`▶️  ${väntar.length} väntar på ditt ja/nej:\n    node pipeline/kandidater.mjs godkann <slug> "skäl"\n`);
  const utankalla = kandidater.filter(k => bedom(k).okallade.length);
  if (utankalla.length) console.log(`⚠️  Stoppdomar utan källa (ogiltiga enligt CLAUDE.md regel 3): ${utankalla.map(k => k.slug).join(', ')}\n`);
  const dömda = kandidater.filter(k => k.axel?.dom).length;
  if (dömda >= 3) console.log(`🧠 ${dömda} domar loggade — kör "node pipeline/kandidater.mjs smak" före nästa lista.\n`);
}
