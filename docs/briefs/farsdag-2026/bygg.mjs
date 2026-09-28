#!/usr/bin/env node
// bygg.mjs — fars dag-batchen: plan.mjs (regin) + copy/<nyckel>.json (sonnet)
// → <Namn>/brief.md per annons + manifest.json.
//
//   node docs/briefs/farsdag-2026/bygg.mjs
//
// Ingen nät, inga beroenden. Copyn kopieras ORDAGRANT ur copy/*.json — det här
// skriptet skriver ingen svensk rad själv (CLAUDE.md regel 6); det sätter
// ihop regin, siffrorna och de fasta engelska instruktionerna runt raderna.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUKTER, DATUM } from './plan.mjs';

const MAPP = dirname(fileURLToPath(import.meta.url));
const kr = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const tid = (s) => `0:${String(s).padStart(2, '0')}`;
const ord = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const ja = (b) => (b ? '✅' : '❌');
const cell = (s) => String(s ?? '').replace(/\|/g, '/').replace(/\n+/g, ' ').trim();

const EXPORT_VIDEO = 'Export: 9:16 (1080×1920) + 4:5 (1080×1350), MP4 H.264, ≤ 30 MiB.';
// Ägarens skrivna beslut: bildrutinens textspärr (bildannonser/verifiera.py)
// släpper igenom ordet rea bara när den här raden börjar en rad i briefen.
const REA_BESLUT = 'REA BESLUTAD AV ÄGAREN 2026-09-28: "Fars dag-rea" is the product page\'s own price against its compare-at price. Axel\'s words: "Det är den som är idag det är rean som är på alla prodkter. Jämf pris". The image text check (bildannonser/verifiera.py) lets the word rea through only because this line is here.';
const FASTA_REGLER = (p) => [
  'The ad never names the store: no store name, URL or logo in copy, picture, voice-over, captions or end card.',
  'Sweden only: this is a Father\'s Day ad (FD). It is never translated and never mirrored to another store — after the Swedish upload the translation routine moves the row straight to Approved (tools/lib/bara-sverige.mjs).',
  'The two dates are fixed and true: Father\'s Day is 8 November, the last order day is 19 October. Never change them, never add a delivery time in days, never add another deadline.',
  'The sale is the product page\'s own price against its compare-at price (the owner\'s decision 2026-09-28). Price is a swappable slot: read it live from the landing page before upload.',
  'No customer reviews, no star ratings, no quotes presented as a customer\'s, no "många har köpt".',
  'No invented urgency: no "idag", no "bara nu", no "få kvar i lager", no countdown — the only urgency is "Beställ senast 19 oktober".',
  'No free shipping, no Klarna, no "öppet köp", no guarantee — never a policy line.',
  'No dashes in any Swedish line (no "–", no "—").',
  `Only these numbers may appear in the ad: ${p.siffror.join(', ')}. No other kronor amount, no percentage.`,
];

function laddaCopy(p) {
  const c = JSON.parse(readFileSync(join(MAPP, 'copy', `${p.nyckel}.json`), 'utf8'));
  return c;
}

// Erbjudandets fasta strängar (märket, prisbandet, sista beställningsdagen,
// beskrivningen) är fakta om den här butikens rea på den här produkten — ägarens
// order 2026-09-28 — inte påståenden. Ingen konkurrent har just det priset och
// just den dagen; sessionens dom, skriven i tabellen.
const ERBJUDANDE_DELAR = [/fars dag-rea:?/gi, /halva priset/gi, /beställ senast 19 oktober/gi, /(från )?\d[\d ]* kr(, ord\. \d[\d ]* kr)?/gi];
/** Består raden BARA av erbjudandets delar (märket, priset, jämförpriset, halva priset, sista dagen)? */
const arErbjudande = (s) => ERBJUDANDE_DELAR.reduce((t, re) => t.replace(re, ' '), String(s)).replace(/[.,:/\s]+/g, '') === '';

function tretestTabell(c, rader) {
  // Subagenten märker ibland raden med var den står: "… (rad 4)", "… (bild.rubrik)".
  const utanEtikett = (s) => String(s).trim().replace(/\s*\((?:hook|H\d|rad|skärmtext|bild|copy_card)[^)]*\)$/i, '').trim();
  const kända = new Map((c.tretest ?? []).map((t) => [utanEtikett(t.rad), t]));
  for (const r of rader) {
    if (arErbjudande(r)) kända.set(String(r).trim(), { rad: r, visualisera: true, falsifiera: true, konkurrent_kan_signera: false, session: true, kommentar: 'offer fact (this product\'s own price and deadline, the owner\'s sale), not a claim line — session verdict' });
  }
  const ut = ['| Line | Visualize? | Falsifiable? | Competitor-signable? | Verdict |', '|---|---|---|---|---|'];
  const saknas = [];
  for (const r of rader) {
    const t = kända.get(String(r).trim());
    if (!t) { saknas.push(r); continue; }
    const ok = t.visualisera && t.falsifiera && !t.konkurrent_kan_signera;
    ut.push(`| ${cell(r)} | ${ja(t.visualisera)} | ${ja(t.falsifiera)} | ${t.konkurrent_kan_signera ? '✅' : '❌'} | ${ok ? 'Keep' : 'REWRITE'}${t.session ? ` — ${cell(t.kommentar)}` : ''} |`);
  }
  return { tabell: ut.join('\n'), saknas };
}

/** Varje svensk rad i copyn — hooks, alternativ, rader, bild och copy card. */
function svenskaRader(c) {
  return [c.hook_H1.rad, ...(c.hook_H1.alternativ ?? []), c.hook_H2.rad, ...(c.hook_H2.alternativ ?? []), ...c.rader.map((r) => r.rad),
    c.bild.rubrik, c.bild.underrad, c.bild.marke, c.bild.prisband, c.bild.sista_raden, c.copy_card.primar, c.copy_card.rubrik, c.copy_card.beskrivning];
}

function bygg(p) {
  const c = laddaCopy(p);
  const streck = svenskaRader(c).filter((r) => /[–—]/.test(String(r)));
  if (streck.length) throw new Error(`tankstreck i svensk rad: ${streck.join(' | ')}`);
  const butik = svenskaRader(c).filter((r) => /bäverbutik|baverbutik|bever/i.test(String(r)));
  if (butik.length) throw new Error(`butikens namn i svensk rad: ${butik.join(' | ')}`);
  // Rader à 3 s + slutkortet på 4 s (pris + jämförpris + sista beställningsdag
  // är fler ord än tre per sekund på 3 s). 5 rader = 16 s, 4 rader = 13 s.
  const antal = (p.langd ?? 15) / 3;                 // 5 rader (15 s) eller 4 (12 s)
  const langd = antal * 3 + 1;
  const rader = c.rader;                            // nr 2 … antal
  if (rader.length !== antal - 1) throw new Error(`${p.nyckel}: copyn har ${rader.length} rader, regin ${antal - 1}`);
  if (p.rader.length !== antal - 2) throw new Error(`${p.nyckel}: regin har ${p.rader.length} kroppsrader, väntade ${antal - 2}`);
  const f = p.forälder;
  const namnVideo = (h) => `${p.prefix}_FD_1_${h}`;
  const namnBild = `${p.prefix}_FD_2_1`;
  const warn = [];

  const why = `Axel's order 2026-09-28: one Father's Day sale batch on every product we scale and brief in Notion ("fars dag-rea … fars dag den åttonde november"); the sale is today's compare-at price (Axel, same day). The product's best video ranked on profit contribution is ${f.namn} (Meta ad ${f.ad}), ${f.beskrivning}: ${kr(f.spend)} kr, ${f.kop} purchases, ROAS ${f.roas.toFixed(2)}, CPA ${f.cpa} kr against break-even CPA ${p.be.cpa} kr (30-day AOV ${kr(p.be.aov)} kr ÷ BE ROAS ${p.be.roas} in the campaign name), profit contribution ${kr(f.vb)} kr (MagiBorsten, last 30 days, read ${DATUM}). ${p.benchmark}. Father's Day is Sunday 8 November; the last order day for delivery in time is 19 October (delivery p90 20 days, klaviyo/brands/baverbutiken.json).`;
  const pris = `**Price:** ${kr(p.pris)} kr (compare-at ${kr(p.jamfor)} kr; ${p.prisNot}). Read live ${DATUM} (baverbutiken.se product JSON).`;

  // ---------------------------------------------------------------- video
  const video = {};
  for (const h of ['H1', 'H2']) {
    const annan = h === 'H1' ? 'H2' : 'H1';
    const hk = p.hook[h];
    const hookRad = c[`hook_${h}`];
    const alla = [{ nr: 1, rad: hookRad.rad, engelska: hookRad.engelska }, ...rader];
    const tider = alla.map((_, i) => `${tid(i * 3)}–${tid(i * 3 + (i === alla.length - 1 ? 4 : 3))}`);
    for (const r of alla) { const max = r.nr === antal ? 12 : 9; if (ord(r.rad) > max) warn.push(`${namnVideo(h)} rad ${r.nr}: ${ord(r.rad)} ord (max ${max})`); }
    // Text på skärm = manusraden (BRIEF-REGI: standard, feeden är tyst); slutkortet
    // = märket, prisbandet och sista beställningsdagen, tre rader.
    const skarmFor = (r) => (r.nr === antal ? `${c.bild.marke} / ${c.bild.prisband} / ${c.bild.sista_raden}` : r.rad);
    const regi = alla.map((r, i) => {
      const sist = i === alla.length - 1;
      const kropp = r.nr === 1 ? hk : sist ? null : p.rader[i - 1];
      const bild = r.nr === 1 ? hk.bild
        : sist ? `End card: the product photo on a plain dark background; a red "Fars dag-rea" badge on top, under it a white text box with the price line and the deadline line (the " / " marks the line breaks). No logo, no URL, no countdown.`
        : kropp.bild;
      const effekt = r.nr === 1 ? hk.effekt : sist ? 'none' : kropp.effekt;
      const kalla = r.nr === 1 ? hk.kalla : sist ? `CDN ${p.slutbild}` : kropp.kalla;
      const ref = r.nr === 1 ? hk.ref : sist ? '—' : kropp.ref;
      const frihet = r.nr === 1 ? 'none' : sist ? 'layout of the text box free, both lines must be readable' : kropp.frihet;
      return `| ${r.nr} | ${tider[i]} | ${cell(r.rad)} | VO | ${cell(skarmFor(r))} | ${cell(bild)} | ${cell(effekt)} | ${cell(kalla)} | ${cell(ref)} | ${cell(frihet)} |`;
    });
    const unika = [...new Set([...alla.map((r) => r.rad), c.bild.marke, c.bild.prisband, c.bild.sista_raden, c.copy_card.primar, c.copy_card.rubrik, c.copy_card.beskrivning])];
    const tt = tretestTabell(c, unika);
    for (const s of tt.saknas) warn.push(`${namnVideo(h)}: tre-frågorstestet saknar raden "${s}"`);

    const md = `# ${namnVideo(h)} — Father's Day sale, recut of ${f.namn}: new Swedish VO and captions, hook ${h}

**Make:** A ${langd}-second recut of ${f.namn} for the Father's Day sale: the parent's own picture, a new Swedish voice-over and new captions, a Father's Day hook in the first three seconds and an end card with the sale price and the order deadline (19 October). Sweden only.
**Format:** Video 9:16 + 4:5, ${langd} s
**Why:** ${why} It is the parent of this recut: the proven picture stays, only the message changes. Rows 2–${antal} are identical in ${namnVideo('H1')} and ${namnVideo('H2')} — the hook is the only variable.
**VARIABELTAGGAR:** typ=M · koncept=fars-dag-rea-2026 · parent=${f.namn} · iteration=1 · kalla=axel · avatar=${p.avatar} · awareness=promo · begar=${p.begar} · mekanism=${p.mekanism} · tro=${p.tro} · urgency=sasong · hook-mekanik=${hk.mekanik} · confidence=medium · lardom=L-${f.ad} · vinkel=FD · hook-typ=fars-dag-present · format=recut · proof=produkten-i-bild · offer=pris · visual=foralderns-bild · text=captions · speaker=vo · copy_model=sonnet
**Memo:** ${f.namn} already converts at CPA ${f.cpa} kr against break-even ${p.be.cpa} kr; the same picture with a Father's Day reason to buy now, a real deadline (19 October) and the sale price on the end card tests whether the season lifts purchase rate before the deadline.
**Landing page:** ${p.landning}
${pris}
**AI content:** voice
**Isolated variable:** the hook — row 1 (line, picture and hook mechanic ${hk.mekanik}); rows 2–${antal} are shared word for word with ${namnVideo(annan)}.
**Deadline:** seasonal — the ad stops making sense after 19 October. Deliver within three days of taking the row.

## Hook
| # | Swedish (use this) | English meaning |
|---|---|---|
| ${h} (this ad) | ${cell(hookRad.rad)} | ${cell(hookRad.engelska)} |
${(hookRad.alternativ ?? []).map((a) => `| archive | ${cell(a)} | — |`).join('\n')}

## Script — these lines, word for word
| # | Time | Swedish (use this) | English meaning |
|---|---|---|---|
${alla.map((r, i) => `| ${r.nr} | ${tider[i]} | ${cell(r.rad)} | ${cell(r.engelska)} |`).join('\n')}

## Three-question test — every Swedish line
${tt.tabell}

"Competitor-signable? ❌" is the good answer.

## Direction, line by line
**Assets:** the parent ${f.namn} (Meta ad ${f.ad}, video ${f.video}, ${f.langd} s) — cut from the parent's project file or raw clips WITHOUT burned captions (the editor who delivered the parent has them in the product's Drive folder). The OUR AD timestamps refer to the live parent. End card photo: ${p.slutbild}
**Reference ads:** parent \`${f.namn}\` — Replicate: its footage and cut rhythm in the rows named below / Do not replicate: any of its captions, its voice-over lines, its end card, any store name.
**Editor latitude:** MAY: cut order within a row, crop, music, transitions, caption placement within the middle 80 %. MUST NOT: change a Swedish line, the price, the dates, the hook line or its timing, show any caption or end card from the parent, name the store, add a number not in the Rules, any field in VARIABELTAGGAR. New VO: the same synthetic Swedish voice as the parent, reading the script word for word. Cannot find a clean clip: comment on this row and set it back to Draft — never leave a parent caption visible and never replace the product shot with a generic one.

| # | Time | Script line (Swedish) | Audio | On-screen text | Picture | Effect + length | Source | Reference | Latitude |
|---|---|---|---|---|---|---|---|---|---|
${regi.join('\n')}

**First frame (thumbnail):** ${hk.bild.replace(/^.*First frame:\s*/, '')}
**Captions:** burned in, Swedish, max 2 lines at a time, matching the On-screen text column word for word ("/" = line break on the end card); never more than three words per second of screen time.

## Rules
${[...FASTA_REGLER(p), ...p.extraRegler, 'A hook is a declarative, never a question.', EXPORT_VIDEO].map((r) => `- ${r}`).join('\n')}

## COPY CARD
**Primary text:** ${c.copy_card.primar}
**Headline:** ${c.copy_card.rubrik}
**Description:** ${c.copy_card.beskrivning}
**Price in the creative:** ${p.prisText}. Read live before upload; swappable slot.
`;
    video[h] = { namn: namnVideo(h), md };
  }

  // ---------------------------------------------------------------- bild
  const b = c.bild;
  const bildRader = [b.rubrik, b.underrad, b.marke, b.prisband, b.sista_raden];
  const tb = tretestTabell(c, [...new Set([...bildRader, c.copy_card.primar, c.copy_card.rubrik, c.copy_card.beskrivning])]);
  for (const s of tb.saknas) warn.push(`${namnBild}: tre-frågorstestet saknar raden "${s}"`);
  const bildMd = `# ${namnBild} — Father's Day sale static: gift headline, sale badge, price band, order deadline

**Make:** A static built on the product photo: a Father's Day gift headline and sub-line in a white text box on top, a red "Fars dag-rea" badge in the top corner, a price band with the sale price and the compare-at price, and the order deadline (19 October) as the bottom line. Sweden only.
**Format:** Static 4:5 (1080×1350) + 1:1 (1080×1080)
**Why:** ${why} The static is made by the image routine (/bildannonser, 20:00) from the product photo, so it can be live days before the video recuts.
**VARIABELTAGGAR:** typ=N · koncept=fars-dag-rea-2026 · iteration=0 · kalla=axel · avatar=${p.avatar} · awareness=promo · begar=${p.begar} · mekanism=${p.mekanism} · tro=${p.tro} · urgency=sasong · hook-mekanik=none · confidence=medium · lardom=L-${f.ad} · vinkel=FD · hook-typ=fars-dag-present · format=static · proof=produkten-i-bild · offer=pris · visual=produktfoto · text=overlay · speaker=none · copy_model=sonnet
**Memo:** Job of this image: carry the Father's Day reason and the real deadline on the product photo alone, so the season can be read against the product's statics without a video.
**Landing page:** ${p.landning}
${pris}
**AI content:** image only
**Isolated variable:** the Father's Day message (headline, badge, deadline) on the product photo.
**Deadline:** seasonal — the ad stops making sense after 19 October.

## Hook
| # | Swedish (use this) | English meaning |
|---|---|---|
| H1 (use this) | ${cell(b.rubrik)} | ${cell(b.engelska?.rubrik)} |

## Three-question test — every Swedish line
${tb.tabell}

"Competitor-signable? ❌" is the good answer.

## Design brief
| Slot | Show | Swedish (use this) | English meaning |
|---|---|---|---|
| Photo | ${cell(p.bild.foto)} | — | — |
| Badge | red rounded badge, top-left corner, white bold | ${cell(b.marke)} | Father's Day sale |
| Headline | white text box on top, black bold, two lines | ${cell(b.rubrik)} | ${cell(b.engelska?.rubrik)} |
| Sub-line | same box, under the headline, regular weight | ${cell(b.underrad)} | ${cell(b.engelska?.underrad)} |
| Price band | white band under the product: the sale price large, the compare-at price smaller beside it | ${cell(b.prisband)} | ${cell(b.prisband).replace('ord.', 'regular')} |
| Bottom line | bold, bottom centre, on the band | ${cell(b.sista_raden)} | Order by 19 October |

**Assets:** product photo ${p.slutbild} (the landing page's own photo — send it as the reference image so the product is never redrawn freely).
**Reference:** ${p.bild.ref}. Replicate: the price-band layout / Do not replicate: any discount headline, any "IDAG", any store name.
**Editor latitude:** MAY: line breaks inside the text box, font size so the headline fits on two lines, crop within the described photo. MUST NOT: change a Swedish line, the price, the dates, the photo's subject, add a store name, URL, logo or policy line, add any number not in the Rules, add a star, a quote or a person's face, change any field in VARIABELTAGGAR. Cannot build it from the product photo: comment on this row and leave it in Draft.

## Rules
${[...FASTA_REGLER(p), ...p.extraRegler.filter((r) => !/parent/i.test(r)), 'The image model never renders the text: the lines are burned on afterwards, word for word from the Design brief.', 'Export: 4:5 (1080×1350) + 1:1 (1080×1080), PNG or JPG.'].map((r) => `- ${r}`).join('\n')}

${REA_BESLUT}

## COPY CARD
**Primary text:** ${c.copy_card.primar}
**Headline:** ${c.copy_card.rubrik}
**Description:** ${c.copy_card.beskrivning}
**Price in the creative:** ${p.prisText}. Read live before upload; swappable slot.
`;
  return { video, bild: { namn: namnBild, md: bildMd }, warn };
}

const manifest = { batch: 'fars-dag-rea-2026', datum: DATUM, briefer: [] };
const allaVarningar = [];
for (const p of PRODUKTER) {
  let r;
  try { r = bygg(p); } catch (e) { allaVarningar.push(`${p.nyckel}: ${e.message}`); continue; }
  for (const [typ, x] of [['video', r.video.H1], ['video', r.video.H2], ['bild', r.bild]]) {
    const mapp = join(MAPP, x.namn);
    mkdirSync(mapp, { recursive: true });
    writeFileSync(join(mapp, 'brief.md'), x.md);
    manifest.briefer.push({ namn: x.namn, typ, hub: p.hub, hubnamn: p.hubnamn, produkt: p.nyckel, fil: `docs/briefs/farsdag-2026/${x.namn}/brief.md`, pris: p.pris, jamforpris: p.jamfor });
  }
  allaVarningar.push(...r.warn);
}
writeFileSync(join(MAPP, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`${manifest.briefer.length} briefer skrivna.`);
for (const v of allaVarningar) console.log(`⚠ ${v}`);
process.exitCode = allaVarningar.length ? 1 : 0;
