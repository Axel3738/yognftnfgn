#!/usr/bin/env node
// invandningsmatris.mjs — invändningsmatrisen per produkt (Axels beslut 2026-09-22).
//
// Vilka invändningar kunderna faktiskt har, med antal och andel, och vilka
// format som redan svarar på dem. Tomma rutor är nästa brief. Källor:
//   • kommentarerna på kampanjens största annons (tools/annonskommentarer.mjs)
//   • supportmejlen som nämner produkten (kundtjanst/mail.mjs)
//   • kontots annonsnamn: formatet står i namnet (`_H1` video, `_1` bild), så
//     täckningen räknas automatiskt för varje OB-annons som står i matrisen
//   • briefer i produktens mapp med taggen `invandning=<rad>` (+ `ruta=`)
//
//   node tools/invandningsmatris.mjs --produkt takoverdraget-husvagn --konto SE --kampanj <id> \
//        [--annons <ad_id>] [--dagar 45] [--ord "husvagn,taköverdrag"] [--brand baverbutiken] \
//        [--utan-mejl] [--ut products/<id>/invandningar.md] [--torr] [--json]
//
// Förlagan är products/takoverdraget-husvagn/invandningar.md. Filen är
// produktminne: raderna och de ifyllda rutorna BEVARAS mellan körningar
// (en fylld ruta fylls aldrig igen), räkningen och statusen skrivs om, allt
// som står EFTER matrisen (sessionens egen analys) lämnas orört.
//
// Klustren är regler, ingen modell (annonskommentarer.KLUSTER) — så en vecka
// går att jämföra med nästa. Kundnamn och adresser skrivs aldrig.
//
// ⚠️ Kontraktet för filen läses också av agent/invandningar.mjs på rutingrenen
// (matrisUrText + tackning är kopierade dit ordagrant — agent/ finns inte på
// main och tools/ inte på rutingrenen). Ändra formatet på båda ställena.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { KLUSTER, klustra, hamtaKommentarer, hamtaAnnonser } from './annonskommentarer.mjs';

// ------------------------------------------------------------------ kontraktet (kopierat till agent/invandningar.mjs)

/** Formaten = matrisens kolumner. Video och statisk läses ur annonsnamnet; demo och jämförelse ur briefens `ruta=`. */
export const FORMAT = Object.freeze([
  { nyckel: 'video', rubrik: 'Video-svar' },
  { nyckel: 'statisk', rubrik: 'Statisk' },
  { nyckel: 'demo', rubrik: 'Demo' },
  { nyckel: 'jamforelse', rubrik: 'Jämförelse' },
]);
export const TOM = '⬜';

/** Radens nyckel: etiketten utan fetstil, utan "(38 %)", små bokstäver. */
export function nyckelUrEtikett(etikett) {
  return String(etikett ?? '').replace(/\*\*/g, '').replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/** Kortnamnet i rapporten ("fukt 0 av 4 format"): första ordet i etiketten. */
export function kortnamn(etikett) {
  return nyckelUrEtikett(etikett).split(/[\s/,]+/)[0] ?? '';
}

/** Andelen ur "(38 %)" i etiketten, som bråk. Null utan. */
export function andelUrEtikett(etikett) {
  const m = String(etikett ?? '').match(/\((\d+(?:[.,]\d+)?)\s*%\)/);
  return m ? Number(m[1].replace(',', '.')) / 100 : null;
}

/** Är cellen tom? ⬜, tomt, — eller bara mellanslag. */
export function cellTom(cell) {
  const s = String(cell ?? '').replace(/\*\*/g, '').trim();
  return !s || s === TOM || s === '—' || s === '-';
}

/**
 * Matrisen ur filen. Ren.
 * @returns {{ finns: boolean, fore: string, efter: string, kolumner: string[], rader: Array<{etikett, nyckel, andel, celler: Record<string,string|null>}> }}
 */
export function matrisUrText(text) {
  const t = String(text ?? '');
  const start = t.search(/^## Matrisen\s*$/m);
  if (start === -1) return { finns: false, fore: t, efter: '', kolumner: FORMAT.map((f) => f.rubrik), rader: [] };
  const rubrikSlut = t.indexOf('\n', start);
  const rest = t.slice(rubrikSlut + 1);
  const linjer = rest.split('\n');
  let i = 0;
  while (i < linjer.length && !linjer[i].trim().startsWith('|')) i += 1;
  const tabell = [];
  while (i < linjer.length && linjer[i].trim().startsWith('|')) { tabell.push(linjer[i]); i += 1; }
  const efter = linjer.slice(i).join('\n');
  const celler = (rad) => rad.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  const kolumner = tabell.length ? celler(tabell[0]).slice(1) : FORMAT.map((f) => f.rubrik);
  const nycklar = kolumner.map((k) => FORMAT.find((f) => f.rubrik.toLowerCase() === k.toLowerCase())?.nyckel ?? k.toLowerCase());
  const rader = [];
  for (const rad of tabell.slice(2)) {
    const c = celler(rad);
    if (!c[0]) continue;
    const r = { etikett: c[0], nyckel: nyckelUrEtikett(c[0]), andel: andelUrEtikett(c[0]), celler: {} };
    nycklar.forEach((n, j) => { r.celler[n] = cellTom(c[j + 1]) ? null : c[j + 1]; });
    rader.push(r);
  }
  return { finns: true, fore: t.slice(0, start), efter, kolumner, rader };
}

/** Svarar cellen på riktigt — ligger annonsen live? Ren. */
export function cellLive(cell) {
  return !cellTom(cell) && /\blive\b/i.test(String(cell)) && !/\bej live\b/i.test(String(cell));
}

/**
 * Täckningen per rad. `live` = rutor med en annons som ligger live (det som
 * räknas som svar: "fukt 0 av 4 format"), `fyllda` = rutor med något alls
 * (briefad räknas — en fylld ruta fylls inte igen), `tomma` = nästa brief. Ren.
 */
export function tackning(rader) {
  return (rader ?? []).map((r) => {
    const fyllda = FORMAT.filter((f) => !cellTom(r.celler?.[f.nyckel])).map((f) => f.nyckel);
    const live = FORMAT.filter((f) => cellLive(r.celler?.[f.nyckel])).map((f) => f.nyckel);
    const tomma = FORMAT.filter((f) => cellTom(r.celler?.[f.nyckel])).map((f) => f.nyckel);
    return { nyckel: r.nyckel, kort: kortnamn(r.etikett), etikett: r.etikett, andel: r.andel, live: live.length, fyllda: fyllda.length, briefade: fyllda.length - live.length, av: FORMAT.length, tomma, obesvarad: live.length === 0 };
  });
}

/** "fukt 0 av 4 format (+1 briefad) (38 %)". Ren. */
export function tackningText(t) {
  return `${t.kort} ${t.live} av ${t.av} format${t.briefade ? ` (+${t.briefade} briefad${t.briefade === 1 ? '' : 'e'})` : ''}${Number.isFinite(t.andel) ? ` (${Math.round(t.andel * 100)} %)` : ''}`;
}

/** Matchar ett kontonamn mot ett namn i en ruta: exakt, eller kontonamnet slutar på `_<rutans namn>` (`OB_4_H1` i rutan, `Takoverdrag_OB_4_H1` i kontot). Ren. */
export function sammaAnnons(kontonamn, rutnamn) {
  const a = String(kontonamn ?? '').toLowerCase();
  const b = String(rutnamn ?? '').toLowerCase();
  return Boolean(a && b) && (a === b || a.endsWith(`_${b}`) || b.endsWith(`_${a}`));
}

/** Annonsnamnen i en cell: allt i backticks. Ren. */
export function namnICell(cell) {
  return [...String(cell ?? '').matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
}

/** Formatet ur annonsnamnet: `_H1` → video, `_1` → statisk, annars null. Ren. */
export function formatUrNamn(namn) {
  const s = String(namn ?? '').trim();
  if (/_H\d+$/i.test(s)) return 'video';
  if (/_\d+$/.test(s)) return 'statisk';
  return null;
}

/** Är det en invändningsannons? Vinkelkoden OB (docs/naming-convention.md). Ren. */
export function arOb(namn) {
  return /_OB_\d+(_|$)/i.test(String(namn ?? ''));
}

// ------------------------------------------------------------------ räkningen

/** Kluster som är invändningar (inte beröm, taggar, "var köper man", tomt, övrigt). */
export const INTE_INVANDNING = Object.freeze(['beröm', 'tagg/vän', 'tom', 'övrigt', 'var köpa']);

/** Ord som knyter ett kluster till en matrisrad någon skrivit för hand. */
export const SYNONYMER = Object.freeze({
  'fukt/mögel/ventilation': ['fukt', 'mögel', 'kondens', 'ventilation', 'självdrag', 'luft', 'unket'],
  'fungerar det': ['fungerar', 'funkar', 'blåser', 'vind', 'storm', 'vattentät', 'regn', 'håller', 'tål'],
  'storlek/passform': ['storlek', 'passar', 'passform', 'täcker', 'mått', 'räcker', 'stor', 'liten'],
  'kvalitet/material': ['kvalitet', 'material', 'tyg', 'sönder', 'hållbar', 'tunn'],
  pris: ['pris', 'dyr', 'billig', 'kostar'],
  'frakt/leverans': ['frakt', 'leverans', 'skickas'],
  'förtroende/bluff': ['bluff', 'lita', 'seriös', 'scam', 'förtroende', 'temu'],
  'retur/garanti': ['retur', 'garanti', 'ångra'],
  'skepsis/kritik': ['skräp', 'onödig', 'skepsis', 'kritik', 'värdelös'],
  önskemål: ['önskemål', 'saknar', 'borde', 'tillbehör'],
});

/** Vilken befintlig rad ett kluster hör till (första träff på synonym i etiketten). Ren. */
export function radForKluster(rader, kluster) {
  const ord = [...(SYNONYMER[kluster] ?? []), ...String(kluster).split(/[\s/]+/)].map((o) => o.toLowerCase()).filter((o) => o.length >= 3);
  return (rader ?? []).find((r) => ord.some((o) => r.nyckel.includes(o))) ?? null;
}

/** Etiketten för en ny rad ur klusternamnet: "fukt/mögel/ventilation" → "Fukt / mögel / ventilation". */
export function etikettUrKluster(kluster) {
  const s = String(kluster).replace(/\//g, ' / ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const kortText = (s, max = 160) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, max).replace(/\|/g, '/');

/**
 * Räknar invändningar ur kommentarer + mejl. Andelen räknas på ALLA poster i
 * källorna (även beröm och taggar) — "11 av 29 kommentarer (38 %)". Ren.
 * @returns {{ total, kommentarer, mejl, poster: Array<{kluster, antal, andel, kommentarer, mejl, exempel: string[]}> }}
 */
export function raknaInvandningar({ kommentarer = [], mejl = [] } = {}) {
  const per = new Map();
  const lagg = (kluster, text, kalla) => {
    if (!per.has(kluster)) per.set(kluster, { kluster, antal: 0, kommentarer: 0, mejl: 0, exempel: [] });
    const p = per.get(kluster);
    p.antal += 1;
    p[kalla] += 1;
    if (p.exempel.length < 3 && text) p.exempel.push(kortText(text));
  };
  for (const k of kommentarer) lagg(klustra(k.message ?? k.text), k.message ?? k.text, 'kommentarer');
  for (const m of mejl) lagg(klustra(`${m.amne ?? ''} ${m.text ?? ''}`), m.text || m.amne, 'mejl');
  const total = kommentarer.length + mejl.length;
  const poster = [...per.values()].filter((p) => !INTE_INVANDNING.includes(p.kluster)).map((p) => ({ ...p, andel: total ? p.antal / total : 0 })).sort((a, b) => b.antal - a.antal);
  return { total, kommentarer: kommentarer.length, mejl: mejl.length, poster };
}

/**
 * Bygger matrisraderna: befintliga rader bevaras (etikett, ifyllda rutor),
 * andelen skrivs om ur räkningen, nya rader läggs till för kluster med ≥ 2
 * omnämnanden som ingen rad fångar, kontots OB-annonser uppdaterar statusen på
 * namn som redan står i en ruta, och briefer med `invandning=` fyller tomma
 * rutor. En fylld ruta skrivs ALDRIG över. Ren.
 * @param {object} p
 * @param {Array} p.befintliga  rader ur matrisUrText
 * @param {Array} p.invandningar  poster ur raknaInvandningar
 * @param {Array<{name, status}>} p.annonser  kontots annonser (bara OB räknas)
 * @param {Array<{namn, invandning, ruta}>} p.briefer  taggar ur briefer i produktmappen
 * @returns {{ rader, nya: string[], omappade: Array<{name,status,format}>, varningar: string[] }}
 */
export function byggMatris({ befintliga = [], invandningar = [], annonser = [], briefer = [] } = {}) {
  const rader = befintliga.map((r) => ({ etikett: r.etikett, nyckel: r.nyckel, andel: r.andel, celler: { ...r.celler } }));
  const nya = [];
  const varningar = [];
  // 1. Andelen per rad ur räkningen; nya rader för kluster utan rad.
  const tagen = new Set();
  for (const p of invandningar) {
    let rad = radForKluster(rader.filter((r) => !tagen.has(r.nyckel)), p.kluster);
    if (!rad && p.antal >= 2) {
      rad = { etikett: etikettUrKluster(p.kluster), nyckel: nyckelUrEtikett(etikettUrKluster(p.kluster)), andel: null, celler: {} };
      rader.push(rad);
      nya.push(rad.etikett);
    }
    if (!rad) continue;
    tagen.add(rad.nyckel);
    rad.andel = p.andel;
    rad.antal = p.antal;
  }
  for (const r of rader) for (const f of FORMAT) if (!(f.nyckel in r.celler)) r.celler[f.nyckel] = null;
  // 2. Kontots OB-annonser: status på namn som står i en ruta; resten omappade.
  const obAnnonser = annonser.filter((a) => arOb(a.name));
  const iMatrisen = [];
  for (const r of rader) for (const f of FORMAT) for (const n of namnICell(r.celler[f.nyckel])) iMatrisen.push({ namn: n, rad: r, format: f.nyckel });
  const omappade = [];
  for (const a of obAnnonser) {
    const plats = iMatrisen.find((p) => sammaAnnons(a.name, p.namn));
    if (!plats) { omappade.push({ name: a.name, status: a.status, format: formatUrNamn(a.name) }); continue; }
    const live = a.status === 'ACTIVE';
    plats.rad.celler[plats.format] = `\`${a.name}\` ${live ? 'live' : `${String(a.status ?? 'okänd').toLowerCase()} i kontot`}`;
    const fmt = formatUrNamn(a.name);
    if (fmt && fmt !== plats.format && ['video', 'statisk'].includes(plats.format)) varningar.push(`${a.name} står i kolumnen ${plats.format} men namnet säger ${fmt}.`);
  }
  // 3. Briefer med invandning=: fyller TOMMA rutor, aldrig fyllda.
  for (const b of briefer) {
    const rad = rader.find((r) => r.nyckel === nyckelUrEtikett(b.invandning)) ?? radForKluster(rader, String(b.invandning));
    if (!rad) { varningar.push(`${b.namn}: invandning=${b.invandning} matchar ingen rad i matrisen.`); continue; }
    const ruta = b.ruta ?? formatUrNamn(b.namn);
    if (!ruta || !FORMAT.some((f) => f.nyckel === ruta)) { varningar.push(`${b.namn}: rutan går inte att läsa (ruta=${b.ruta ?? '—'}, namnet ger ${formatUrNamn(b.namn) ?? 'inget'}).`); continue; }
    if (namnICell(rad.celler[ruta]).some((n) => sammaAnnons(b.namn, n))) continue;
    if (!cellTom(rad.celler[ruta])) { varningar.push(`${b.namn}: rutan ${rad.etikett} × ${ruta} är redan fylld (${rad.celler[ruta]}) — en fylld ruta fylls inte igen.`); continue; }
    rad.celler[ruta] = `\`${b.namn}\` briefad, ej live`;
  }
  return { rader, nya, omappade, varningar };
}

/** Taggarna `invandning=` / `ruta=` ur en brieftext. Ren. */
export function invandningUrBrief(text) {
  const rad = String(text ?? '').split('\n').find((l) => /VARIABELTAGGAR|Variables:/i.test(l)) ?? '';
  const plocka = (n) => { const m = rad.match(new RegExp(`(?:^|[\\s·|,])${n}=\\s*\`?([^\`·|,\\n]+)\`?`, 'i')); return m ? m[1].trim() : null; };
  const invandning = plocka('invandning') ?? plocka('objection');
  if (!invandning) return null;
  return { invandning, ruta: plocka('ruta') ?? plocka('cell') ?? null };
}

/** Alla brief.md under en mapp → [{ namn, invandning, ruta }] för dem som bär taggen. Läser filer. */
export function brieferMedInvandning(mapp) {
  const ut = [];
  const gå = (d, djup) => {
    if (djup > 5 || !existsSync(d)) return;
    for (const f of readdirSync(d)) {
      const full = join(d, f);
      let st; try { st = statSync(full); } catch { continue; }
      if (st.isDirectory()) { gå(full, djup + 1); continue; }
      if (f !== 'brief.md') continue;
      const t = invandningUrBrief(readFileSync(full, 'utf8'));
      if (t) ut.push({ namn: d.split(/[\\/]/).pop(), ...t });
    }
  };
  gå(mapp, 0);
  return ut;
}

// ------------------------------------------------------------------ filen

const pct = (x) => `${Math.round(x * 100)} %`;

/**
 * Renderar hela filen. `efter` är sessionens egna sektioner efter matrisen och
 * skrivs tillbaka orörda. Ren.
 */
export function rendera({ produkt, idag, kallor = [], rakning, rader, omappade = [], varningar = [], efter = '' }) {
  const t = tackning(rader);
  const ut = [];
  ut.push(`# Invändningsmatris — ${produkt}`, '');
  ut.push('Vilka invändningar kunderna faktiskt har, och vilka av dem vi har svarat på.', '**Tomma rutor är nästa brief.** Den här filen är produktminne — den läses innan', 'en briefrond och uppdateras efter (`node tools/invandningsmatris.mjs`).', '');
  ut.push(`Mätt ${idag}. ${kallor.join(' ')}`.trim(), '');
  for (const v of varningar) ut.push(`⚠️ ${v}`, '');
  ut.push('## Vad kunderna invänder', '');
  ut.push(`${rakning.total} poster i källorna (${rakning.kommentarer} kommentarer, ${rakning.mejl} mejl). Andelen räknas på alla poster.`, '');
  ut.push('| Invändning | Antal | Andel | Kommentarer | Mejl |', '|---|---|---|---|---|');
  for (const p of rakning.poster) ut.push(`| ${p.antal >= 3 ? `**${etikettUrKluster(p.kluster)}**` : etikettUrKluster(p.kluster)} | ${p.antal >= 3 ? `**${p.antal}**` : p.antal} | ${pct(p.andel)} | ${p.kommentarer} | ${p.mejl} |`);
  if (!rakning.poster.length) ut.push('| — | 0 | — | 0 | 0 |');
  ut.push('');
  const citat = rakning.poster.filter((p) => p.exempel.length).slice(0, 4);
  if (citat.length) {
    ut.push('Ordagrant, de tyngsta (kundnamn och adresser aldrig):', '');
    for (const p of citat) for (const e of p.exempel.slice(0, 2)) ut.push(`> ${e}`);
    ut.push('');
  }
  ut.push('## Matrisen', '');
  ut.push(`| Invändning | ${FORMAT.map((f) => f.rubrik).join(' | ')} |`, `|---|${FORMAT.map(() => '---').join('|')}|`);
  const sorterade = [...rader].sort((a, b) => (b.andel ?? -1) - (a.andel ?? -1));
  for (const r of sorterade) {
    const bas = r.etikett.replace(/\*\*/g, '').replace(/\s*\(\d+(?:[.,]\d+)?\s*%\)\s*/g, '').trim();
    const etikett = Number.isFinite(r.andel) ? `${r.andel >= 0.1 ? `**${bas}**` : bas} (${pct(r.andel)})` : bas;
    ut.push(`| ${etikett} | ${FORMAT.map((f) => (cellTom(r.celler[f.nyckel]) ? TOM : r.celler[f.nyckel])).join(' | ')} |`);
  }
  ut.push('');
  ut.push('**Täckning:** ' + (t.length ? t.sort((a, b) => (b.andel ?? -1) - (a.andel ?? -1)).map(tackningText).join(' · ') : 'inga rader') + '.', '');
  if (omappade.length) {
    ut.push(`**OB-annonser i kontot utan rad i matrisen (${omappade.length}):** ${omappade.map((a) => `\`${a.name}\` (${a.format ?? 'okänt format'}, ${String(a.status ?? 'okänd').toLowerCase()})`).join(', ')} — läs briefen, sätt \`invandning=\` i taggraden eller skriv in namnet i rätt ruta för hand.`, '');
  }
  const rest = String(efter ?? '').replace(/^\s*\*\*Täckning:\*\*[^\n]*\n?/m, '').replace(/^\s*\*\*OB-annonser i kontot utan rad[^\n]*\n?/m, '').trim();
  if (rest) ut.push(rest, '');
  return `${ut.join('\n').trimEnd()}\n`;
}

// ------------------------------------------------------------------ CLI

async function huvud(argv) {
  const flagga = (n, s = null) => { const i = argv.indexOf(`--${n}`); return i !== -1 && argv[i + 1] !== undefined && !argv[i + 1].startsWith('--') ? argv[i + 1] : s; };
  const finns = (n) => argv.includes(`--${n}`);
  const produkt = flagga('produkt');
  if (!produkt) { console.error('✗ --produkt <id> krävs (mappen products/<id>/).'); process.exit(2); }
  const idag = flagga('idag') ?? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm' }).format(new Date());
  const dagar = Number(flagga('dagar', 45));
  const ut = resolve(flagga('ut') ?? join('products', produkt, 'invandningar.md'));
  const mapp = dirname(ut);
  const token = process.env.META_ACCESS_TOKEN;
  const kallor = [];
  const varningar = [];

  // 1. Kommentarerna.
  let kommentarer = [];
  let annons = null;
  if (flagga('kampanj') || flagga('annons')) {
    if (!token) { console.error('✗ META_ACCESS_TOKEN saknas i miljön.'); process.exit(1); }
    const r = await hamtaKommentarer({ konto: flagga('konto', 'SE'), kampanj: flagga('kampanj'), annons: flagga('annons'), dagar, token });
    kommentarer = r.kommentarer;
    annons = r.annons;
    kallor.push(`Källa: ${kommentarer.length} kommentarer på \`${annons.name}\`${annons.spend ? ` (${Math.round(annons.spend).toLocaleString('sv-SE')} kr, kampanjens största annons)` : ''}, ${dagar} dagar, via \`tools/annonskommentarer.mjs\`.`);
  } else {
    varningar.push('Inga kommentarer lästa: kör med --kampanj <id> (top spendern) eller --annons <ad_id>.');
  }

  // 2. Kontots annonser (formaten).
  let annonser = [];
  if (flagga('kampanj') && token) {
    annonser = await hamtaAnnonser(flagga('kampanj'), token);
    kallor.push(`Formaten lästa ur kontot: ${annonser.length} annonser i kampanjen, ${annonser.filter((a) => arOb(a.name)).length} med vinkelkoden OB.`);
  }

  // 3. Supportmejlen.
  let mejl = [];
  if (!finns('utan-mejl')) {
    const ord = flagga('ord');
    if (!ord) {
      varningar.push('Supportmejlen är INTE med: inga sökord (--ord "husvagn,taköverdrag"). Kunder som mejlar före köp gör det sällan offentligt.');
    } else {
      const { lasBrevlada, kundmejl, sokMejl, sokord } = await import('../kundtjanst/mail.mjs');
      const r = await lasBrevlada(flagga('brand', 'baverbutiken'), { dagar: Math.max(dagar, 90), logg: (m) => console.error(`  ${m}`) });
      if (!r.ok) varningar.push(`Supportmejlen är INTE med: ${r.orsak}. Kör om i en container som har nyckeln: \`node kundtjanst/mail.mjs sok "${ord}"\`.`);
      else {
        mejl = sokMejl(kundmejl(r.inkorg, r.brand), sokord(ord));
        kallor.push(`Supportmejl: ${mejl.length} kundmejl som nämner ${sokord(ord).join(' / ')} (${r.kalla}, ${r.dagar} dagar) via \`kundtjanst/mail.mjs\`.`);
      }
    }
  }

  // 4. Bygg.
  const befintlig = existsSync(ut) ? matrisUrText(readFileSync(ut, 'utf8')) : { finns: false, rader: [], efter: '' };
  const rakning = raknaInvandningar({ kommentarer, mejl });
  const briefer = brieferMedInvandning(mapp);
  const m = byggMatris({ befintliga: befintlig.rader, invandningar: rakning.poster, annonser, briefer });
  varningar.push(...m.varningar);
  const text = rendera({ produkt: flagga('namn') ?? produkt, idag, kallor, rakning, rader: m.rader, omappade: m.omappade, varningar, efter: befintlig.efter });
  const t = tackning(m.rader);

  if (finns('json')) { console.log(JSON.stringify({ produkt, idag, rakning, rader: m.rader, tackning: t, omappade: m.omappade, nya: m.nya, varningar }, null, 2)); }
  else {
    console.log(`${produkt}: ${rakning.total} poster (${rakning.kommentarer} kommentarer, ${rakning.mejl} mejl) · ${m.rader.length} rader${m.nya.length ? ` (nya: ${m.nya.join(', ')})` : ''} · ${m.omappade.length} OB-annonser utan rad`);
    for (const x of t.sort((a, b) => (b.andel ?? -1) - (a.andel ?? -1))) console.log(`  ${x.obesvarad ? '⬜' : '✅'} ${tackningText(x)}`);
    for (const v of varningar) console.log(`  ⚠️  ${v}`);
  }
  if (finns('torr')) { console.error(`--torr: inget skrivet (${ut}).`); return; }
  mkdirSync(mapp, { recursive: true });
  writeFileSync(ut, text);
  console.error(`Skrivet: ${ut}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud(process.argv.slice(2)).catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
