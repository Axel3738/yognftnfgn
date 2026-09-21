#!/usr/bin/env node
// produktunderlag.mjs — Evolves produktförståelse och avatar-research som två
// filer per produkt, ifyllda innan första konceptet skrivs.
//
//   node tools/produktunderlag.mjs --skapa <id> --sida <url> [--rot .]
//       Läser produktsidans publika .json och skriver products/<id>/produkt.md
//       + products/<id>/avatar.md. Fälten som går att läsa maskinellt fylls i;
//       resten märks [FYLL I]. Skriver aldrig över en befintlig fil.
//   node tools/produktunderlag.mjs --granska <id> [--rot .] [--json]
//       Prövar båda filerna. Saknade fält är ANMÄRKNINGAR (exit 0).
//       Saknad mekanism är ett STOPP (exit 1).
//
// Varför mekanismen är det enda hårda stoppet (Axels beslut 2026-09-21):
// mätt samma dag på 68 av Bäverbutikens produktsidor — 31 produkter som dog i
// test och 37 som levde — förklarar **noll av 68** varför produkten fungerar.
// Fältet saknas på vinnarna också. Det är alltså inte ett urvalsproblem utan
// ett underlagsproblem som drabbar varje brief, och det enda fält där ett
// stopp faktiskt ändrar något.
//
// Varför resten bara varnar: samma mätning kunde inte skilja döda produkter
// från levande på någon annan sida-signal (median 126 mot 127 ord, 5 mot 5
// bilder, 2 mot 2 varianter). En hård grind på de fälten hade kostat
// lanseringar utan att spara slöseri. ⚠️ Men mätningen är OBESVARAD, inte
// negativ: produktsidorna skriver vi själva EFTER produktvalet, så de visar
// att underlaget aldrig fanns — inte att underlaget saknar värde.
//
// Ren logik exporteras och testas i tools/test/produktunderlag.test.mjs.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HÄR, '..');

/** Evolves produktförståelse. `hart: true` = stoppar, övriga anmärker. */
export const PRODUKTFALT = Object.freeze([
  { nyckel: 'foretaget', rubrik: 'Företaget', hjalp: 'vad det är, vad det säljer, vem det säljer till' },
  { nyckel: 'produkten', rubrik: 'Produkten och dess features', hjalp: 'vad den är, punkt för punkt' },
  { nyckel: 'fysiskt', rubrik: 'Fysiska detaljer', hjalp: 'material, mått, vikt, färg — vad det faktiskt ÄR' },
  { nyckel: 'funktionellt', rubrik: 'Funktionella detaljer', hjalp: 'hur den används, vad som händer steg för steg' },
  { nyckel: 'mekanism', rubrik: 'Mekanismen', hjalp: 'VARFÖR den fungerar — den fysiska eller tekniska förklaringen', hart: true },
  { nyckel: 'benefits', rubrik: 'Benefits', hjalp: 'vad kunden FÅR — aldrig blandat med advantages eller claims' },
  { nyckel: 'advantages', rubrik: 'Advantages', hjalp: 'vad den gör BÄTTRE än alternativet' },
  { nyckel: 'claims', rubrik: 'Claims', hjalp: 'påståenden vi gör — var och en med källa, annars stryks den' },
  { nyckel: 'usecases', rubrik: 'Use cases', hjalp: 'konkreta situationer där den används' },
]);

/** Evolves avatar-research. Inget fält här stoppar — men alla anmärks. */
export const AVATARFALT = Object.freeze([
  { nyckel: 'karnbegar', rubrik: 'Kärnbegäret', hjalp: 'fråga "varför" 3–5 gånger i rad tills du når det verkliga begäret' },
  { nyckel: 'smartpunkter', rubrik: 'Upplevelser och smärtpunkter', hjalp: 'vad som faktiskt händer dem, med deras ord' },
  { nyckel: 'tror_marknad', rubrik: 'Vad de tror om marknaden', hjalp: 'om kategorin, om konkurrenterna' },
  { nyckel: 'tror_problem', rubrik: 'Vad de tror om sitt eget problem', hjalp: 'trosbarriären bor här' },
  { nyckel: 'invandningar', rubrik: 'Invändningar och frågor', hjalp: 'sådant de faktiskt ställer — kommentarer, forum, mejl' },
  { nyckel: 'identitet', rubrik: 'Beteenden och identitet', hjalp: 'vad de gör och vilka de tycker att de är' },
  { nyckel: 'subavatarer', rubrik: 'Sub-avatarer', hjalp: '3 per kärnbegär, var och en med källa' },
]);

const MARKOR = '[FYLL I';

/** Ett avsnitts text ur en underlagsfil. Ren. Returnerar null när rubriken saknas. */
export function avsnitt(text, rubrik) {
  const rader = String(text ?? '').split('\n');
  const start = rader.findIndex((r) => new RegExp(`^##\\s+${rubrik.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'i').test(r.trim()));
  if (start === -1) return null;
  const ut = [];
  for (const r of rader.slice(start + 1)) {
    if (/^##\s/.test(r)) break;
    ut.push(r);
  }
  return ut.join('\n').trim();
}

/** Är fältet ifyllt? Tomt, bara hjälptext eller kvarlämnad [FYLL I] räknas som tomt. Ren. */
export function ifyllt(innehall, hjalp = '') {
  const t = String(innehall ?? '').trim();
  if (!t) return false;
  if (t.includes(MARKOR)) return false;
  const utanHjalp = t.replace(/^_.*?_$/gm, '').replace(hjalp, '').trim();
  return utanHjalp.length >= 20;
}

/**
 * Domen över en produkts underlag. Ren — texten in, domen ut.
 * `stopp` är alltid mekanismen och inget annat (Axels beslut 2026-09-21).
 */
export function granska({ produkt = null, avatar = null } = {}) {
  const stopp = [];
  const anm = [];
  if (produkt === null) stopp.push('products/<id>/produkt.md saknas helt — kör --skapa först');
  if (avatar === null) anm.push('products/<id>/avatar.md saknas — avatar-researchen är inte gjord');
  for (const f of PRODUKTFALT) {
    if (produkt === null) continue;
    const v = avsnitt(produkt, f.rubrik);
    if (ifyllt(v, f.hjalp)) continue;
    // Ett fält som verktyget fyllt ur produktsidan men som fortfarande bär en
    // [FYLL I är PÅBÖRJAT, inte tomt. Skilj på det — annars ser en halvfylld
    // fil ut som en orörd, och den som läser slutar lita på granskningen.
    const paborjat = String(v ?? '').replace(/^_.*?_$/gm, '').replace(/\[FYLL I[^\]]*\]/g, '').trim().length >= 20;
    const text = `produkt.md: "${f.rubrik}" är ${paborjat ? 'PÅBÖRJAD men har kvar en [FYLL I]' : 'tom'} (${f.hjalp})`;
    if (f.hart) stopp.push(`${text} — MEKANISMEN ÄR OBLIGATORISK. Utan den vet redigeraren inte vad annonsen ska bevisa, och ingen i kedjan har hållit produkten i handen.`);
    else anm.push(text);
  }
  for (const f of AVATARFALT) {
    if (avatar === null) break;
    const v = avsnitt(avatar, f.rubrik);
    if (!ifyllt(v, f.hjalp)) anm.push(`avatar.md: "${f.rubrik}" är tom (${f.hjalp})`);
  }
  return { ok: stopp.length === 0, stopp, anmarkningar: anm };
}

/** Mall för produkt.md. Ren. `kant` är det som lästes ur produktsidan. */
export function produktmall(id, { kant = {}, sida = null, idag = null } = {}) {
  const ut = [`# Produktförståelse — ${kant.titel ?? id}`, ''];
  ut.push('Fylls i INNAN första konceptet skrivs (Evolve, Axels beslut 2026-09-21).');
  ut.push('Redigerarna sitter i Manila och rör aldrig produkten. Briefen skrivs av en');
  ut.push('rutin. Ingen i kedjan har hållit den i handen — underlaget ersätter den');
  ut.push('intuitionen helt.');
  ut.push('');
  if (sida) ut.push(`Produktsida: ${sida}`);
  if (idag) ut.push(`Skapad: ${idag}`);
  ut.push('');
  ut.push('⚠️ **Mekanismen är obligatorisk.** `node tools/produktunderlag.mjs --granska');
  ut.push(`${id}\` stoppar med exit 1 om den är tom. Övriga fält ger anmärkning.`);
  ut.push('');
  for (const f of PRODUKTFALT) {
    ut.push(`## ${f.rubrik}`, '');
    ut.push(`_${f.hjalp}_`, '');
    const auto = kant[f.nyckel];
    ut.push(auto ? auto : `${MARKOR}: ${f.hjalp}]`);
    ut.push('');
  }
  ut.push('## Källor', '');
  ut.push('Varje rad ovan ska gå att spåra. Produktsidan, leverantörens datablad,');
  ut.push('en recension, ett forum. Saknas källa är raden en gissning och märks så.');
  ut.push('');
  return `${ut.join('\n')}\n`;
}

/** Mall för avatar.md. Ren. */
export function avatarmall(id, { titel = null, idag = null } = {}) {
  const ut = [`# Avatar-research — ${titel ?? id}`, ''];
  ut.push('Kedjan av "varför" (Evolve). Fylls i INNAN första konceptet.');
  ut.push('För en NY produkt finns inga annonskommentarer att läsa — researchen görs');
  ut.push('före, inte hämtas efteråt. `tools/annonskommentarer.mjs` fyller på först när');
  ut.push('annonserna har gått en tid.');
  if (idag) ut.push('', `Skapad: ${idag}`);
  ut.push('');
  for (const f of AVATARFALT) {
    ut.push(`## ${f.rubrik}`, '');
    ut.push(`_${f.hjalp}_`, '');
    ut.push(`${MARKOR}: ${f.hjalp}]`);
    ut.push('');
  }
  ut.push('## Källor', '');
  ut.push('Ett citat ordagrant med länk och datum, eller butikens egen data.');
  ut.push('**Research styr strategin, aldrig texten i en annons** — inget citat här får');
  ut.push('bli en recension eller en rad i en creative.');
  ut.push('');
  return `${ut.join('\n')}\n`;
}

/** Det som går att läsa ur produktsidans json. Ren — json in, fält ut. */
export function urProduktsida(p) {
  if (!p) return {};
  const txt = String(p.body_html ?? '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();
  const kant = { titel: p.title ?? null };
  const punkter = txt.split(/(?<=[.!?])\s+/).filter((s) => s.length > 15).slice(0, 8);
  if (punkter.length) kant.produkten = punkter.map((s) => `- ${s.trim()}`).join('\n');
  const matt = txt.match(/\b\d+[\s,.]?\d*\s?(?:cm|mm|m|meter|tum|liter|l|kg|gram|g)\b/gi) ?? [];
  const material = txt.match(/\b(?:oxford|polyester|nylon|aluminium|rostfri\w*|stål|silikon|bomull|läder|pvc|abs|tpu|gummi|trä|\d{3}D)\b/gi) ?? [];
  const varianter = (p.variants ?? []).map((v) => v.title).filter((t) => t && t !== 'Default Title');
  const fysiskt = [];
  if (matt.length) fysiskt.push(`- Mått ur produktsidan: ${[...new Set(matt)].join(', ')}`);
  if (material.length) fysiskt.push(`- Material ur produktsidan: ${[...new Set(material.map((m) => m.toLowerCase()))].join(', ')}`);
  if (varianter.length) fysiskt.push(`- Varianter: ${varianter.join(', ')}`);
  if (fysiskt.length) { fysiskt.push('', `${MARKOR}: vikt och färg saknas oftast på sidan — läs dem ur leverantörens datablad]`); kant.fysiskt = fysiskt.join('\n'); }
  const pris = Number(p.variants?.[0]?.price ?? 0);
  const jamfor = Number(p.variants?.[0]?.compare_at_price ?? 0);
  if (pris) {
    kant.foretaget = `- Pris ${pris} kr${jamfor > pris ? `, jämförpris ${jamfor} kr (spara ${Math.round(jamfor - pris)} kr, ${Math.round((1 - pris / jamfor) * 100)} %)` : ''}\n- Bilder på sidan: ${(p.images ?? []).length}\n\n${MARKOR}: vad butiken är och vem den säljer till]`;
  }
  return kant;
}

// ------------------------------------------------------------------ CLI

async function huvud() {
  const args = process.argv.slice(2);
  const flagga = (n, s = null) => { const i = args.indexOf(`--${n}`); return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : s; };
  const rot = flagga('rot') ? join(process.cwd(), flagga('rot')) : ROT;
  const idag = flagga('idag') ?? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date());

  if (flagga('skapa')) {
    const id = flagga('skapa');
    const sida = flagga('sida');
    let kant = {};
    if (sida) {
      const u = `${sida.split('?')[0].replace(/\/$/, '')}.json?country=SE`;
      try {
        const r = await fetch(u, { redirect: 'follow' });
        if (r.ok) kant = urProduktsida((await r.json()).product);
        else console.error(`⚠ produktsidan svarade ${r.status} — mallen skrivs tom`);
      } catch (e) { console.error(`⚠ kunde inte läsa produktsidan (${e.message}) — mallen skrivs tom`); }
    }
    const mapp = join(rot, 'products', id);
    mkdirSync(mapp, { recursive: true });
    let skrivna = 0;
    for (const [fil, innehall] of [['produkt.md', produktmall(id, { kant, sida, idag })], ['avatar.md', avatarmall(id, { titel: kant.titel, idag })]]) {
      const mål = join(mapp, fil);
      if (existsSync(mål)) { console.error(`· products/${id}/${fil} finns redan — rörs inte`); continue; }
      writeFileSync(mål, innehall);
      console.log(`✅ products/${id}/${fil}`);
      skrivna += 1;
    }
    if (!skrivna) return;
    console.log(`\nFyll varje [FYLL I] och kör: node tools/produktunderlag.mjs --granska ${id}`);
    return;
  }

  if (flagga('granska')) {
    const id = flagga('granska');
    const las = (f) => { const p = join(rot, 'products', id, f); return existsSync(p) ? readFileSync(p, 'utf8') : null; };
    const dom = granska({ produkt: las('produkt.md'), avatar: las('avatar.md') });
    if (args.includes('--json')) { console.log(JSON.stringify({ id, ...dom }, null, 2)); process.exit(dom.ok ? 0 : 1); }
    console.log(`${dom.ok ? '✅' : '❌'} Produktunderlag — ${id}`);
    for (const s of dom.stopp) console.log(`   🔴 STOPP ${s}`);
    for (const a of dom.anmarkningar) console.log(`   ⚠️  ${a}`);
    if (dom.ok && !dom.anmarkningar.length) console.log('   Alla fält ifyllda.');
    else if (dom.ok) console.log(`\n${dom.anmarkningar.length} anmärkning(ar) — batchen får gå ut, men underlaget är tunnare än det borde vara.`);
    else console.log('\nFörsta batchen får INTE gå ut. Fyll mekanismen först.');
    process.exit(dom.ok ? 0 : 1);
  }

  console.error('Användning: node tools/produktunderlag.mjs --skapa <id> [--sida <url>] | --granska <id> [--json]');
  process.exit(1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
