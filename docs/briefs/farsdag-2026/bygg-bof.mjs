#!/usr/bin/env node
// bygg-bof.mjs — fars dag-batchen omgång 4 (extra BOF-batch, Axels order 2026-09-29):
// plan-bof.mjs (regin) + copy/bof/<nyckel>.json (sonnet) → <Namn>/brief.md per annons
// + manifest-bof.json. Per produkt: FD_3_H1/H2/H3 (video 13 s) och FD_4_1–FD_4_4 (bild).
//
//   node docs/briefs/farsdag-2026/bygg-bof.mjs
//
// Ingen nät, inga beroenden. Copyn kopieras ORDAGRANT ur copy/bof/*.json — skriptet
// skriver ingen svensk rad själv (CLAUDE.md regel 6).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUKTER, BILDKONCEPT, DATUM } from './plan-bof.mjs';

const MAPP = dirname(fileURLToPath(import.meta.url));
const kr = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const tid = (s) => `0:${String(s).padStart(2, '0')}`;
const ord = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const ja = (b) => (b ? '✅' : '❌');
const cell = (s) => String(s ?? '').replace(/\|/g, '/').replace(/\n+/g, ' ').trim();

const EXPORT_VIDEO = 'Export: 9:16 (1080×1920) + 4:5 (1080×1350), MP4 H.264, ≤ 30 MiB.';
const REA_BESLUT = 'REA BESLUTAD AV ÄGAREN 2026-09-28: "Fars dag-rea" is the product page\'s own price against its compare-at price. Axel\'s words: "Det är den som är idag det är rean som är på alla prodkter. Jämf pris". The image text check (bildannonser/verifiera.py) lets the word rea through only because this line is here.';
const ORDER = 'Axel\'s order 2026-09-29: "gör en till extra batch för fars dag för alla produkter och gärna dubbelt så mycket bildads och sedan normal kvantitet videos så att vi pushar extra mycket BOF fars dag annonser. Det verkar ge väldigt bra resultat."';
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

const ERBJUDANDE_DELAR = [/fars dag-rea:?/gi, /beställ senast 19 oktober/gi, /(från )?\d[\d ]* kr(, ord\. \d[\d ]* kr)?/gi];
const arErbjudande = (s) => ERBJUDANDE_DELAR.reduce((t, re) => t.replace(re, ' '), String(s)).replace(/[.,:/\s]+/g, '') === '';

function tretestTabell(c, rader) {
  const utanEtikett = (s) => String(s).trim().replace(/\s*\((?:hook|H\d|rad|skärmtext|bild|copy_card|FD_4_\d)[^)]*\)$/i, '').trim();
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

function svenskaRader(c) {
  const b = Object.values(c.bilder).flatMap((x) => [x.rubrik, x.underrad]);
  return [c.hook_H1.rad, ...(c.hook_H1.alternativ ?? []), c.hook_H2.rad, ...(c.hook_H2.alternativ ?? []), c.hook_H3.rad, ...(c.hook_H3.alternativ ?? []),
    ...c.rader.map((r) => r.rad), ...Object.values(c.text_pa_skarm ?? {}), ...b, c.copy_card.primar, c.copy_card.rubrik, c.copy_card.beskrivning];
}

function bygg(p) {
  const c = JSON.parse(readFileSync(join(MAPP, 'copy', 'bof', `${p.nyckel}.json`), 'utf8'));
  const streck = svenskaRader(c).filter((r) => /[–—]/.test(String(r)));
  if (streck.length) throw new Error(`tankstreck i svensk rad: ${streck.join(' | ')}`);
  const butik = svenskaRader(c).filter((r) => /bäverbutik|baverbutik|bever/i.test(String(r)));
  if (butik.length) throw new Error(`butikens namn i svensk rad: ${butik.join(' | ')}`);
  const fragor = [c.hook_H1.rad, c.hook_H2.rad, c.hook_H3.rad].filter((r) => /\?/.test(r));
  if (fragor.length) throw new Error(`hook som fråga: ${fragor.join(' | ')}`);
  if (c.rader.length !== 3) throw new Error(`${p.nyckel}: copyn har ${c.rader.length} rader, regin 3 (2, 3, 4)`);
  const f = p.forälder;
  const b = p.bof;
  const marke = 'Fars dag-rea';
  const prisband = p.prisText;
  const sista = 'Beställ senast 19 oktober';
  const namnVideo = (h) => `${p.prefix}_FD_3_${h}`;
  const namnBild = (n) => `${p.prefix}_FD_4_${n}`;
  const warn = [];
  const antal = 4, langd = 13;

  const why = `${ORDER} Bottom of funnel: the viewer has already seen ${p.produkt} and hesitates on one thing — "${b.invandning}" — or waits for a reason to buy now; this batch answers with the page's own facts (${b.svar}), the sale price and the real deadline. The product's best video ranked on profit contribution is ${f.namn} (Meta ad ${f.ad}), ${f.beskrivning}: ${kr(f.spend)} kr, ${f.kop} purchases, ROAS ${f.roas.toFixed(2)}, CPA ${f.cpa} kr against break-even CPA ${p.be.cpa} kr (AOV ${kr(p.be.aov)} kr ÷ BE ROAS ${p.be.roas} in the campaign name), profit contribution ${kr(f.vb)} kr (MagiBorsten, read 2026-09-28/29). ${p.benchmark}. The campaign was read ACTIVE in MagiBorsten ${DATUM} evening; the price was read live the same evening. Father's Day is Sunday 8 November; the last order day is 19 October (delivery p90 20 days, klaviyo/brands/baverbutiken.json). Earlier Father's Day rows on this product (FD_1_H1–H3, FD_2_1/FD_2_2) carry the gift angle to a cold audience; this batch is the product-aware follow-up.`;
  const pris = `**Price:** ${kr(p.pris)} kr (compare-at ${kr(p.jamfor)} kr; ${p.prisNot}). Read live ${DATUM} (baverbutiken.se product JSON).`;
  const hookTyp = { H1: 'invandningen-besvarad', H2: 'priset-forst', H3: 'sista-dagen-forst' };

  // ---------------------------------------------------------------- video
  const video = {};
  for (const h of ['H1', 'H2', 'H3']) {
    const andra = ['H1', 'H2', 'H3'].filter((x) => x !== h).map(namnVideo).join(' and ');
    const hk = p.fd3.hook[h];
    const hookRad = c[`hook_${h}`];
    const alla = [{ nr: 1, rad: hookRad.rad, engelska: hookRad.engelska }, ...c.rader];
    const tider = alla.map((_, i) => `${tid(i * 3)}–${tid(i * 3 + (i === alla.length - 1 ? 4 : 3))}`);
    for (const r of alla) { const max = r.nr === antal ? 12 : 9; if (ord(r.rad) > max) warn.push(`${namnVideo(h)} rad ${r.nr}: ${ord(r.rad)} ord (max ${max})`); }
    const skarm = (r) => (r.nr === antal ? `${marke} / ${prisband} / ${sista}` : (c.text_pa_skarm?.[r.nr === 1 ? `1_${h}` : String(r.nr)] ?? r.rad));
    const regi = alla.map((r, i) => {
      const sist = i === alla.length - 1;
      const k = r.nr === 1 ? hk : sist ? null : p.fd3.rader[i - 1];
      const bild = sist ? 'End card: the product photo on a plain dark background; a red "Fars dag-rea" badge on top, under it a white text box with the price line and the deadline line (the " / " marks the line breaks). No logo, no URL, no countdown.' : k.bild;
      const effekt = sist ? 'none' : k.effekt;
      const kalla = sist ? `CDN ${p.slutbild}` : k.kalla;
      const ref = sist ? '—' : k.ref;
      const frihet = r.nr === 1 ? 'none' : sist ? 'layout of the text box free, both lines must be readable' : k.frihet;
      return `| ${r.nr} | ${tider[i]} | ${cell(r.rad)} | VO | ${cell(skarm(r))} | ${cell(bild)} | ${cell(effekt)} | ${cell(kalla)} | ${cell(ref)} | ${cell(frihet)} |`;
    });
    const unika = [...new Set([...alla.map((r) => r.rad), ...alla.map(skarm), marke, prisband, sista, c.copy_card.primar, c.copy_card.rubrik, c.copy_card.beskrivning])];
    const tt = tretestTabell(c, unika);
    for (const s of tt.saknas) warn.push(`${namnVideo(h)}: tre-frågorstestet saknar raden "${s}"`);
    const kallor = f.video ? `the parent ${f.namn} (Meta ad ${f.ad}, video ${f.video}, ${f.langd} s) — cut from the parent's project file or raw clips WITHOUT burned captions (the editor who delivered the parent has them in the product's Drive folder). The OUR AD timestamps refer to the live parent.` : `the parent ${f.namn} (Meta ad ${f.ad}) — the Drive file named in the Source column (Josh's product folder); the parent's own captions and VO are not used.`;

    const md = `# ${namnVideo(h)} — Father's Day BOF recut of ${f.namn}: the objection answered, hook ${h} (${hookTyp[h]})

**Make:** A ${langd}-second bottom-of-funnel recut of ${f.namn} for the Father's Day sale: the parent's own picture, a new Swedish voice-over and new captions. Row 1 is the hook (${hookTyp[h].replace(/-/g, ' ')}), rows 2–3 answer "${b.invandning}" with the page's facts, row 4 is the end card with the sale price and the order deadline (19 October). Sweden only.
**Format:** Video 9:16 + 4:5, ${langd} s
**Why:** ${why} Rows 2–${antal} are identical in ${namnVideo('H1')}, ${namnVideo('H2')} and ${namnVideo('H3')} — the hook is the only variable.
**VARIABELTAGGAR:** typ=M · koncept=fars-dag-bof-2026 · parent=${f.namn} · iteration=1 · kalla=axel · avatar=${p.avatar} · awareness=product · begar=${p.begar} · mekanism=${p.mekanism} · tro=${b.tro} · urgency=sasong · hook-mekanik=${hk.mekanik} · confidence=medium · lardom=L-${f.ad} · vinkel=FD · hook-typ=${hookTyp[h]} · format=recut · proof=produkten-i-bild · offer=pris · visual=foralderns-bild · text=captions · speaker=vo · copy_model=sonnet
**Memo:** Funnel position BOF (retargeting, product-aware) — written here, never in the name (naming convention). ${f.namn} already converts at CPA ${f.cpa} kr against break-even ${p.be.cpa} kr; this recut tests whether answering "${b.invandning}" plus the sale price and a real deadline lifts purchase rate among people who already saw the product. H1 against H2 against H3 reads which opening (objection, price, deadline) the product-aware viewer needs.
**Landing page:** ${p.landning}
${pris}
**AI content:** voice
**Isolated variable:** the hook (row 1); the two sibling hooks are ${andra}.
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
**Assets:** ${kallor} End card photo: ${p.slutbild}
**Reference ads:** parent \`${f.namn}\` — Replicate: its footage and cut rhythm in the rows named below / Do not replicate: any of its captions, its voice-over lines, its end card, any store name.
**Editor latitude:** MAY: cut order within a row, crop, music, transitions, caption placement within the middle 80 %. MUST NOT: change a Swedish line, the price, the dates, the hook line or its timing, show any caption or end card from the parent, name the store, add a number not in the Rules, any field in VARIABELTAGGAR. New VO: the same synthetic Swedish voice as the parent, reading the script word for word. Cannot find a clean clip: comment on this row and set it back to Draft — never leave a parent caption visible and never replace the product shot with a generic one.

| # | Time | Script line (Swedish) | Audio | On-screen text | Picture | Effect + length | Source | Reference | Latitude |
|---|---|---|---|---|---|---|---|---|---|
${regi.join('\n')}

**First frame (thumbnail):** ${hk.bild.replace(/^.*First frame:\s*/, '')}
**Captions:** burned in, Swedish, max 2 lines at a time, matching the On-screen text column word for word ("/" = line break on the end card); never more than three words per second of screen time.

## Rules
${[...FASTA_REGLER(p), ...p.extraRegler, ...(b.stopp ? [b.stopp] : []), 'A hook is a declarative, never a question.', EXPORT_VIDEO].map((r) => `- ${r}`).join('\n')}

## COPY CARD
**Primary text:** ${c.copy_card.primar}
**Headline:** ${c.copy_card.rubrik}
**Description:** ${c.copy_card.beskrivning}
**Price in the creative:** ${p.prisText}. Read live before upload; swappable slot.
`;
    video[h] = { namn: namnVideo(h), md };
  }

  // ---------------------------------------------------------------- bilder
  const bilder = [];
  for (const k of BILDKONCEPT) {
    const key = `FD_4_${k.nr}`;
    const x = c.bilder[key];
    if (!x) throw new Error(`${p.nyckel}: copyn saknar bilden ${key}`);
    if (ord(x.rubrik) > 8) warn.push(`${namnBild(k.nr)} rubrik: ${ord(x.rubrik)} ord (max 8)`);
    if (ord(x.underrad) > 12) warn.push(`${namnBild(k.nr)} underrad: ${ord(x.underrad)} ord (max 12)`);
    const rader = [x.rubrik, x.underrad, marke, prisband, sista];
    const tb = tretestTabell(c, [...new Set([...rader, c.copy_card.primar, c.copy_card.rubrik, c.copy_card.beskrivning])]);
    for (const s of tb.saknas) warn.push(`${namnBild(k.nr)}: tre-frågorstestet saknar raden "${s}"`);
    const syskon = BILDKONCEPT.filter((y) => y.nr !== k.nr).map((y) => namnBild(y.nr)).join(', ');
    const md = `# ${namnBild(k.nr)} — Father's Day BOF static (${k.tagg}): ${k.jobb.split(':')[0].split(' (')[0]}

**Make:** A static built on the product photo: a headline and sub-line in a white text box on top, a red "Fars dag-rea" badge in the top corner, a price band with the sale price and the compare-at price, and the order deadline (19 October) as the bottom line. Job of this image: ${k.jobb}. Sweden only.
**Format:** Static 4:5 (1080×1350) + 1:1 (1080×1080)
**Why:** ${why} Four BOF statics on the same photo, badge, price band and bottom line — only the headline and sub-line differ (${key}: ${k.tagg}; siblings ${syskon}) — so the four read which message the product-aware viewer needs: the objection answered, the price first, the deadline first, or the contents. Double the round's static count on the owner's order.
**VARIABELTAGGAR:** typ=N · koncept=fars-dag-bof-2026 · iteration=0 · kalla=axel · avatar=${p.avatar} · awareness=product · begar=${p.begar} · mekanism=${p.mekanism} · tro=${b.tro} · urgency=sasong · hook-mekanik=none · confidence=medium · lardom=L-${f.ad} · vinkel=FD · hook-typ=${k.tagg} · format=static · proof=produkten-i-bild · offer=pris · visual=produktfoto · text=overlay · speaker=none · copy_model=sonnet
**Memo:** Funnel position BOF (retargeting, product-aware) — written here, never in the name. Job: ${k.jobb}. Read against ${syskon} (same pixels except the text box) and against the product's FD_2_1/FD_2_2 (gift angle, cold).
**Landing page:** ${p.landning}
${pris}
**AI content:** image only
**Isolated variable:** the text box message; the three sibling statics are ${syskon}.
**Deadline:** seasonal — the ad stops making sense after 19 October.

## Hook
| # | Swedish (use this) | English meaning |
|---|---|---|
| H1 (use this) | ${cell(x.rubrik)} | ${cell(x.engelska?.rubrik)} |

## Three-question test — every Swedish line
${tb.tabell}

"Competitor-signable? ❌" is the good answer.

## Design brief
| Slot | Show | Swedish (use this) | English meaning |
|---|---|---|---|
| Photo | ${cell(p.bild.foto)} | — | — |
| Badge | red rounded badge, top-left corner, white bold | ${marke} | Father's Day sale |
| Headline | white text box on top, black bold, two lines | ${cell(x.rubrik)} | ${cell(x.engelska?.rubrik)} |
| Sub-line | same box, under the headline, regular weight | ${cell(x.underrad)} | ${cell(x.engelska?.underrad)} |
| Price band | white band under the product: the sale price large, the compare-at price smaller beside it | ${prisband} | ${prisband.replace('ord.', 'regular')} |
| Bottom line | bold, bottom centre, on the band | ${sista} | Order by 19 October |

**Assets:** product photo ${p.slutbild} (the landing page's own photo — send it as the reference image so the product is never redrawn freely).
**Reference:** ${p.prefix}_FD_2_1 (the same layout, live since 2026-09-29) and ${p.bild.ref}. Replicate: the layout / Do not replicate: any discount headline, any "IDAG", any store name.
**Editor latitude:** MAY: line breaks inside the text box, font size so the headline fits on two lines, crop within the described photo. MUST NOT: change a Swedish line, the price, the dates, the photo's subject, add a store name, URL, logo or policy line, add any number not in the Rules, add a star, a quote or a person's face, change any field in VARIABELTAGGAR. Cannot build it from the product photo: comment on this row and leave it in Draft.

## Rules
${[...FASTA_REGLER(p), ...p.extraRegler.filter((r) => !/parent/i.test(r)), ...(b.stopp ? [b.stopp] : []), 'The image model never renders the text: the lines are burned on afterwards, word for word from the Design brief.', 'Export: 4:5 (1080×1350) + 1:1 (1080×1080), PNG or JPG.'].map((r) => `- ${r}`).join('\n')}

${REA_BESLUT}

## COPY CARD
**Primary text:** ${c.copy_card.primar}
**Headline:** ${c.copy_card.rubrik}
**Description:** ${c.copy_card.beskrivning}
**Price in the creative:** ${p.prisText}. Read live before upload; swappable slot.
`;
    bilder.push({ namn: namnBild(k.nr), md });
  }
  return { video, bilder, warn };
}

const bara = process.argv.slice(2);
const manifest = { batch: 'fars-dag-bof-2026', datum: DATUM, briefer: [] };
const allaVarningar = [];
for (const p of PRODUKTER) {
  if (bara.length && !bara.includes(p.nyckel)) continue;
  let r;
  try { r = bygg(p); } catch (e) { allaVarningar.push(`${p.nyckel}: ${e.message}`); continue; }
  for (const [typ, x] of [['video', r.video.H1], ['video', r.video.H2], ['video', r.video.H3], ...r.bilder.map((b) => ['bild', b])]) {
    const mapp = join(MAPP, x.namn);
    mkdirSync(mapp, { recursive: true });
    writeFileSync(join(mapp, 'brief.md'), x.md);
    manifest.briefer.push({ namn: x.namn, typ, hub: p.hub, hubnamn: p.hubnamn, datakalla: p.datakalla ?? null, produkt: p.nyckel, prefix: p.prefix, fil: `docs/briefs/farsdag-2026/${x.namn}/brief.md`, pris: p.pris, jamforpris: p.jamfor });
  }
  allaVarningar.push(...r.warn);
}
if (!bara.length) writeFileSync(join(MAPP, 'manifest-bof.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`${manifest.briefer.length} briefer skrivna.`);
for (const v of allaVarningar) console.log(`⚠ ${v}`);
process.exitCode = allaVarningar.length ? 1 : 0;
