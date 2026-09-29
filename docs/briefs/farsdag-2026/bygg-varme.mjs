#!/usr/bin/env node
// bygg-varme.mjs — Värmesulorna + Värmesitsen: förstabatchens briefer (products/<id>/batch-01/)
// + fars dag-blocket FD_3/FD_4 (docs/briefs/farsdag-2026/<Namn>/) ur plan-varme.mjs och
// copy/varme/<nyckel>.json (sonnet). Ingen svensk rad skrivs här (regel 6).
//
//   node docs/briefs/farsdag-2026/bygg-varme.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUKTER, DATUM } from './plan-varme.mjs';
import { bygg as byggFd } from './bygg-bof.mjs';

const MAPP = dirname(fileURLToPath(import.meta.url));
const ROT = join(MAPP, '..', '..', '..');
const kr = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const ord = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const ja = (b) => (b ? '✅' : '❌');
const cell = (s) => String(s ?? '').replace(/\|/g, '/').replace(/\n+/g, ' ').trim();
const TIDER = ['0:00–0:03', '0:03–0:06', '0:06–0:09', '0:09–0:12', '0:12–0:16'];

function tretest(c, rader, prisText) {
  const kända = new Map((c.tretest ?? []).map((t) => [String(t.rad).trim(), t]));
  const pris = new RegExp(`^${prisText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.?$`);
  const ut = ['| Line | Visualize? | Falsifiable? | Competitor-signable? | Verdict |', '|---|---|---|---|---|'];
  const saknas = [];
  for (const r of rader) {
    let t = kända.get(String(r).trim());
    if (!t && pris.test(String(r).trim())) t = { visualisera: true, falsifiera: true, konkurrent_kan_signera: false, session: true, kommentar: 'price fact (the page\'s own price), not a claim line — session verdict' };
    if (!t) { saknas.push(r); continue; }
    const ok = t.visualisera && t.falsifiera && !t.konkurrent_kan_signera;
    ut.push(`| ${cell(r)} | ${ja(t.visualisera)} | ${ja(t.falsifiera)} | ${t.konkurrent_kan_signera ? '✅' : '❌'} | ${ok ? 'Keep' : 'REWRITE'}${t.session ? ` — ${cell(t.kommentar)}` : ''} |`);
  }
  return { tabell: ut.join('\n'), saknas };
}

function byggBatch(p, c, warn) {
  const f = p.forälder;
  const ut = [];
  for (const v of p.batch) {
    const cv = c.batch[v.namn];
    if (!cv) throw new Error(`${p.nyckel}: copyn saknar ${v.namn}`);
    const alla = [{ nr: 1, rad: cv.hook.rad, engelska: cv.hook.engelska }, ...cv.rader];
    if (alla.length !== 5) throw new Error(`${v.namn}: ${alla.length} rader, väntade 5`);
    for (const r of alla) { const max = r.nr === 5 ? 12 : 9; if (ord(r.rad) > max) warn.push(`${v.namn} rad ${r.nr}: ${ord(r.rad)} ord (max ${max})`); }
    if (/\?/.test(cv.hook.rad)) throw new Error(`${v.namn}: hook som fråga`);
    const skarm = (r) => (r.nr === 5 ? p.prisText : (cv.text_pa_skarm?.[String(r.nr)] ?? r.rad));
    const bilder = [
      { bild: v.hookbild, effekt: v.mekanik === 'freeze' ? 'freeze 0.5 s, then cut-in' : v.mekanik === 'zoom-in' ? 'zoom-in 1 s' : 'cut-in', kalla: v.hookkalla, ref: v.typ === 'I' ? `parent ${f.namn} — replaces its opening` : 'none — new concept', frihet: 'none' },
      ...p.rader.map((r) => ({ ...r, ref: r.ref })),
      { bild: 'End card: the product photo on a plain dark background, a white text box with the price line. No logo, no URL, no countdown.', effekt: 'none', kalla: `CDN ${p.slutbild}`, ref: '—', frihet: 'layout of the text box free' },
    ];
    const regi = alla.map((r, i) => `| ${r.nr} | ${TIDER[i]} | ${cell(r.rad)} | VO | ${cell(skarm(r))} | ${cell(bilder[i].bild)} | ${cell(bilder[i].effekt)} | ${cell(bilder[i].kalla)} | ${cell(bilder[i].ref)} | ${cell(bilder[i].frihet)} |`);
    const unika = [...new Set([...alla.map((r) => r.rad), ...alla.map(skarm), cv.copy_card.primar, cv.copy_card.rubrik, cv.copy_card.beskrivning])];
    const tt = tretest(c, unika, p.prisText);
    for (const s of tt.saknas) warn.push(`${v.namn}: tre-frågorstestet saknar raden "${s}"`);
    const driveMapp = `https://drive.google.com/drive/folders/${p.drive.batch}`;
    const why = `${v.hypotes} Data: ${f.namn} (Meta ad ${f.ad}) — ${kr(f.spend)} kr, ${f.kop} purchases, ROAS ${f.roas.toFixed(2)}, CPA ${f.cpa} kr against break-even CPA ${p.be.cpa} kr (AOV ${kr(p.be.aov)} kr ÷ break-even ROAS ${p.be.roas} from the price sheet), profit contribution ${kr(f.vb)} kr, MagiBorsten lifetime read ${DATUM} evening. ${p.benchmark}. The campaign is ACTIVE and its day-7 labels arrive ${p.nyckel === 'varmesulorna' ? '2026-10-03' : '2026-10-02'}: the lesson this brief points to is PRELIMINARY (written day ${p.nyckel === 'varmesulorna' ? 4 : 5} on the owner's order to build the hub now) and the label will confirm or overturn it.`;
    const md = `# ${v.namn} — ${v.typ === 'I' ? `iteration ${v.iteration} on ${f.namn}` : 'new concept'}: ${v.hooktyp.replace(/-/g, ' ')}

**Make:** ${v.make}
**Format:** Video 9:16 + 4:5, 16 s
**Why:** ${why}
**Drive folder:** ${driveMapp} (Batch #1 in Josh's product folder; the parent's file: https://drive.google.com/file/d/${f.driveFil}/view)   **Landing page:** ${p.landning}
**VARIABELTAGGAR:** typ=${v.typ} · koncept=${v.koncept} · parent=${v.typ === 'I' ? f.namn : 'none'} · iteration=${v.iteration} · kalla=${v.kalla} · avatar=${v.avatar} · awareness=problem · begar=${p.begar} · mekanism=${p.mekanism} · tro=${v.tro} · urgency=ingen · hook-mekanik=${v.mekanik} · confidence=${v.kalla === 'hypotes' ? 'low' : 'medium'} · lardom=L-${f.ad} · vinkel=PD · hook-typ=${v.hooktyp} · format=${v.typ === 'I' ? 'recut' : 'video'} · proof=demo-produkten-i-bild · offer=pris-och-jamforpris · visual=${v.typ === 'I' ? 'foralderns-bild' : 'ny-scen-samma-demo'} · text=captions · speaker=vo · copy_model=sonnet
**Memo:** Preliminary lesson L-${f.ad} names this brief (day-7 label pending). ${v.isolerad.charAt(0).toUpperCase() + v.isolerad.slice(1)}
**Price:** ${kr(p.pris)} kr (compare-at ${kr(p.jamfor)} kr; ${p.prisNot}). Read live ${DATUM} (baverbutiken.se product JSON).
**AI content:** voice (the VO is read by a synthetic voice unless the editor records it — then write the name here and change to none).
**Isolated variable:** ${v.isolerad}

## Hook
| # | Swedish (use this) | English meaning |
|---|---|---|
| H (this ad) | ${cell(cv.hook.rad)} | ${cell(cv.hook.engelska)} |
${(cv.hook.alternativ ?? []).map((a) => `| archive | ${cell(a)} | — |`).join('\n')}

## Script — these lines, word for word
| # | Time | Swedish (use this) | English meaning |
|---|---|---|---|
${alla.map((r, i) => `| ${r.nr} | ${TIDER[i]} | ${cell(r.rad)} | ${cell(r.engelska)} |`).join('\n')}

## Three-question test — every Swedish line
${tt.tabell}

"Competitor-signable? ❌" is the good answer.

## Direction, line by line
**Assets:** the parent ${f.namn} (Meta ad ${f.ad}) — Josh's Drive file https://drive.google.com/file/d/${f.driveFil}/view in the product folder; cut from the clean clips, never from the rendered ad (its captions and VO are not used). End card photo: ${p.slutbild}
**Reference ads:** parent \`${f.namn}\` — Replicate: its demo beats and cut rhythm in the rows named below / Do not replicate: its captions, its voice-over lines, its five-star quote, any store name.
**Editor latitude:** MAY: cut order within a row, crop, music, transitions, caption placement within the middle 80 %. MUST NOT: change a Swedish line, the price, the hook line or its timing, show any caption from the parent, name the store, add a number not in the Rules, any field in VARIABELTAGGAR. New VO: the same synthetic Swedish voice as the parent, reading the script word for word. Cannot find a clean clip: comment on this row and set it back to Draft — never leave a parent caption visible and never replace the product shot with a generic one.

| # | Time | Script line (Swedish) | Audio | On-screen text | Picture | Effect + length | Source | Reference | Latitude |
|---|---|---|---|---|---|---|---|---|---|
${regi.join('\n')}

**First frame (thumbnail):** ${v.hookbild.replace(/^.*First frame:\s*/, '')}
**Captions:** burned in, Swedish, max 2 lines at a time, matching the On-screen text column word for word; never more than three words per second of screen time.

## Rules
- Price exactly ${kr(p.pris)} kr (compare-at ${kr(p.jamfor)} kr). Never invented urgency, never "tusentals kunder", never a star or a customer quote.
- Product in frame before second 4. Swedish captions word for word.
- The ad never names the store: no store name, URL or logo in copy, picture, voice-over, captions or end card.
- Only these numbers may appear in the ad: ${p.siffror.filter((s) => !['8', '19'].includes(s)).join(', ')}. No other kronor amount, no percentage${p.nyckel === 'varmesulorna' ? ', no time in hours beyond the page\'s "4 till 10 timmar enligt leverantören"' : ', no time'}.
${p.extraRegler.map((r) => `- ${r}`).join('\n')}
- A hook is a declarative, never a question.
- Export: 9:16 (1080×1920) + 4:5 (1080×1350), MP4 H.264, ≤ 30 MiB.

## COPY CARD
**Primary text:** ${cv.copy_card.primar}
**Headline:** ${cv.copy_card.rubrik}
**Description:** ${cv.copy_card.beskrivning}
**Price in the creative:** ${p.prisText}. Read live before upload; swappable slot.
`;
    ut.push({ namn: v.namn, md });
  }
  return ut;
}

const manifest = { batch: 'varme-forstabatch-och-fars-dag-2026-09-29', datum: DATUM, briefer: [] };
const warn = [];
for (const p of PRODUKTER) {
  const c = JSON.parse(readFileSync(join(MAPP, 'copy', 'varme', `${p.nyckel}.json`), 'utf8'));
  // förstabatchen → products/<id>/batch-01/
  const batchMapp = join(ROT, 'products', p.minne, 'batch-01');
  const poster = [];
  for (const b of byggBatch(p, c, warn)) {
    mkdirSync(join(batchMapp, 'video-ads-briefs', b.namn), { recursive: true });
    writeFileSync(join(batchMapp, 'video-ads-briefs', b.namn, 'brief.md'), b.md);
    poster.push({ namn: b.namn, typ: 'video', notion_typ: 'Video - Pending Approval', brief: `video-ads-briefs/${b.namn}/brief.md`, format: 'video' });
    manifest.briefer.push({ namn: b.namn, typ: 'video', del: 'forstabatch', hub: p.hub, hubnamn: p.hubnamn, datakalla: p.datakalla, produkt: p.nyckel, prefix: p.prefix, fil: `products/${p.minne}/batch-01/video-ads-briefs/${b.namn}/brief.md`, pris: p.pris, jamforpris: p.jamfor });
  }
  writeFileSync(join(batchMapp, 'manifest.json'), JSON.stringify(poster, null, 2) + '\n');
  // fars dag-blocket → docs/briefs/farsdag-2026/<Namn>/
  const fdCopy = { ...c.bof, tretest: c.tretest };
  const r = byggFd(p, null, fdCopy);
  const fdPoster = [];
  for (const [typ, x] of [['video', r.video.H1], ['video', r.video.H2], ['video', r.video.H3], ...r.bilder.map((b) => ['bild', b])]) {
    mkdirSync(join(MAPP, x.namn), { recursive: true });
    writeFileSync(join(MAPP, x.namn, 'brief.md'), x.md);
    fdPoster.push({ namn: x.namn, typ, notion_typ: typ === 'video' ? 'Video - Pending Approval' : 'Image - Pending Approval', brief: `../${x.namn}/brief.md`, format: typ === 'video' ? 'video' : 'static' });
    manifest.briefer.push({ namn: x.namn, typ, del: 'fars-dag-bof', hub: p.hub, hubnamn: p.hubnamn, datakalla: p.datakalla, produkt: p.nyckel, prefix: p.prefix, fil: `docs/briefs/farsdag-2026/${x.namn}/brief.md`, pris: p.pris, jamforpris: p.jamfor });
  }
  mkdirSync(join(MAPP, 'manifest-bof'), { recursive: true });
  writeFileSync(join(MAPP, 'manifest-bof', `${p.nyckel}.json`), JSON.stringify(fdPoster, null, 1) + '\n');
  warn.push(...r.warn);
}
writeFileSync(join(MAPP, 'manifest-varme.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`${manifest.briefer.length} briefer skrivna.`);
for (const v of warn) console.log(`⚠ ${v}`);
process.exitCode = warn.length ? 1 : 0;
