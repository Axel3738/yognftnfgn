// Generator för fars dag-batchens 20 briefskelett (Mastern 301–320).
// Huvudsessionen (Fable) skriver struktur, hypotes, regi, taggar och regler här.
// Sonnet-subagenter fyller sedan i de svenska raderna («SV …»/«EN …») direkt i filerna.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROT = '/home/user/yognftnfgn/docs/briefs/fars-dag-2026';
const LP_GIFT = 'https://grillkliniken.se/pages/landing-page-blank-jul-3-09-12-32';
const LP_PROD = 'https://grillkliniken.se/products/elektrisk-grillborste';
const CDN = {
  hero: 'https://cdn.shopify.com/s/files/1/0947/0174/8548/files/Namnlosdesign-2026-07-06T113034.467.png',
  foto: 'https://cdn.shopify.com/s/files/1/0947/0174/8548/files/WhatsAppImage2026-04-13at10.08.29.jpg',
  hf1: 'https://cdn.shopify.com/s/files/1/0947/0174/8548/files/hf_20260423_053932_274855d0-6200-477e-b94d-9253bb51021a.png',
  hf2: 'https://cdn.shopify.com/s/files/1/0947/0174/8548/files/hf_20260423_053920_89553003-6fbe-4990-ac4a-75b8cfe135b2.png',
  hf3: 'https://cdn.shopify.com/s/files/1/0947/0174/8548/files/hf_20260423_062233_5b01b9d2-7444-4824-b577-a781dd3f0193.png',
};
const D = {
  rot: '1Q9-TFnhQI3QV0z80Lw1iOOB7Wk_RWJ-r',
  macro: '1gLEJU2bdzXWU-w2eHoxo9XD2jImMv_Zr',
  problem: '1YY7Y_DuaPAszwF4jM70g0xue1N_hUsq6',
  mid: '1K2B_qE8jVlKng6k1Cpcw_GRsEOXD0aXZ',
  cta: '1K8LjlcndXuWdWI2ic7a0A4JDJqcnLaFe',
  heads: '1QU-V7oD19egsbS90cKC6BCIYH84JJlih',
  old: '1ZoRoDhf07RKXvKa-FMEx5zypdQwr3s90',
  store: '10srWqlx7x_MXiJO0MLtR8pDP_JkaR39B',
  grills: '1k5VjErDXeW4RZz1zQEbFWry1Vo6QzXu1',
  broken: '1VggaPZ1X7VDSbSR8jmTBpBvH2Zq0sIGW',
  ugcRJ: '1NMTQHuODyqFUMrPoiG69vRR8LtJZa_-T',
  ugcBH: '1ucL6wrOSre-h9m038xMZwjuWHLrYaeWN',
  gilz: '1gZua5tjAFUfuzH9xFWry91q7sRELGAbO',
  photos: '14xo1cnBbNMhv-i0d7WUbtgfMXVVcvlWf',
};
const drive = (id, pick) => `DRIVE ${id} [EDITOR PICKS: ${pick}]`;
const NEW = (what) => `NEW FOOTAGE: ${what}`;
const cdn = (url) => `CDN ${url}`;

const ASSETS = `**Assets:** Drive "Content for all markets. B-roll etc" (id ${D.rot}) — sub-folders: home-recorded product macro (${D.macro}), problem agitation / dirty grates / scrubbing (${D.problem}), mid clips + grillers (${D.mid}), CTA / end card (${D.cta}), brush-safe heads (${D.heads}), old methods: onion, foil, wire brush (${D.old}), brushes normal stores sell (${D.store}), expensive new grills (${D.grills}), broken grills thrown away (${D.broken}), UGC Rickard Jenders (${D.ugcRJ}), Beerhansson UGC (${D.ugcBH}), Gilz content (${D.gilz}) · product photos Aug 2026 (${D.photos}) · CDN: ${CDN.hero}, ${CDN.foto}, ${CDN.hf1}, ${CDN.hf2}, ${CDN.hf3}`;

const LATITUDE = `**Editor latitude:** MAY: cut order within a beat, b-roll within the motif, music, transitions, caption placement within the middle 80 %, the exact November props (jacket, headlamp, leaves). MUST NOT: change a Swedish line, the price, the hook line or its timing, the product in frame after second 4, name the store, show an AI-generated person, any field in VARIABELTAGGAR. Cannot find a source: comment on this row and set it back to Draft — never replace the product shot with a generic one.`;

const REGLER_GEMENSAMMA = [
  '**Price exactly 999 kr** (ord. 1 600 kr) — on the end card and in the copy. Never a percentage (not "35 %", not "40 %"), never a countdown, never a second price. Verified live 2026-09-25 on grillkliniken.se/products/elektrisk-grillborste (999 / 1 600). Numbers other than the price are written in words in Swedish (femton tusen, trettio dagar, sextio sekunder).',
  '**The ad never names the store.** Not "Grillkliniken", not the domain, not the wordmark — in copy, on the image, in the voice-over or in captions. The product is "Mastern". The link carries the store. ("Svenskt företag" without the name is allowed.)',
  '**Never say his grill is dirty or that he is lazy.** The giver praises him ("han gör allt rätt"); the fault is the wire brush that cannot reach the gaps. A gift that reads as self-improvement makes the recipient feel judged (Chapman & Reshadi 2025) — the whole batch dies on that line.',
  '**Never open with the word "present".** The first three seconds show ONE real physical object in macro (hook-visual rule 2026-08-04) — the box, the mug, the wire brush, the grate, the cup. Never a person, never AI.',
  '**Risk reversal exactly as the store writes it:** "30 dagars öppet köp" and "livstidsgaranti — går den sönder får han en ny". Never "14 dagar" (that is the Bäverbutiken rule; this store promises 30), never "garanti" alone, never "nöjd-kund-garanti". Delivery: "fri frakt inom Sverige" is allowed; a delivery date or "hinner till fars dag" is NOT allowed in this ad (only brief 317 carries a date).',
  '**Facts allowed:** two heads (grovhuvud that locks the metal, polerhuvud with no metal), nothing comes loose, spins into the gaps, one button, sixty seconds while the grate is still warm, wet head + warm grate (the steam does half the work), 2 600 mAh, four to six cleanings per charge, USB cable in the box, heads go in the dishwasher, works on gas, charcoal and ceramic grills. Recalls only as "Weber and Nexgrill recalled over thirteen million wire brushes in the USA in 2026" (both verified; always "i USA"). **Facts NOT allowed:** "Journal of Food Science 34 %" (unverified), "40 000 grillare" / "fem tusen i Norden" (unsourced), any star rating or review count other than "79 recensioner" if used, any invented quote.',
  '**Reviews:** quote verbatim with the name exactly as on the product page (Peter N., Christer F., Johan E., Rickard B., Mikael T., Marcus A., Lars-Erik H., Bertil L., Stefan E., Johan S.) or not at all. If Axel says the initial-name reviews are imported, swap to Lennart Olsson ("Rent utan ansträngning!"), markus lundmark ("Magiskt! Grillen är som ny och fort gick det.") or Birger Söderström ("Den gör vad den lovat!").',
  '**Tone:** the giver reports, never lectures. No exclamation marks in the VO. Calm, warm, concrete. "Calla ut + frikänn" — never an accusation-first hook (110 H3 was 8× worse).',
  '**Spelling traps:** Mastern (capital M) · fars dag (two words, lowercase) · stålborste · borststrån · springorna · grovhuvud · polerhuvud · livstidsgaranti · öppet köp · USB-kabel · Weber Genesis · Napoleon. Å, Ä, Ö must render.',
];

const REGLER_STATIC = [
  '**No generated people, no generated product.** The product is the real photo (Drive product photos Aug 2026 or the CDN images), cut out and composed; a generated background only where the brief asks for a scene. Text is set deterministically on top (framework-bildannonser steg 2–3), never rendered by the image model.',
  '**Text on the image word for word** from the "Exact text" table. Headline biggest, price small, no strike-through word (a drawn line is allowed), no badge bigger than the price.',
];

const KPI_VIDEO = `**Purchases and profit contribution** \`(768 − CPA) × purchases\` — break-even CPA 768 kr, break-even ROAS 1,30 (\`docs/grillkliniken-ekonomi.md\`); kill only against break-even, never against target. No verdict under 300 kr spend or 3 purchases. Diagnosis only: hook rate (3-second plays / impressions) against the batch median, hold rate, CTR — never a decision on CTR (L-123: 6,32 % CTR, 0 purchases).`;
const KPI_STATIC = `**Purchases and profit contribution** \`(768 − CPA) × purchases\` — break-even CPA 768 kr, break-even ROAS 1,30; kill only against break-even, never against target. No verdict under 300 kr / 3 purchases. Low CTR is not a problem (L-B020: the best angle static had the lowest CTR).`;

function taggrad(t) {
  const k = t.komp;
  return `**VARIABELTAGGAR:** vinkel=\`${t.vinkel}\` · hook-typ=\`${t.hookTyp}\` · format=\`${t.format}\` · proof=\`${t.proof}\` · offer-i-creativen=\`${t.offer ?? '999 kr on the end card only, no percentage'}\` · visuell stil=\`${t.visuell}\` · textmängd=\`${t.text ?? 'captions word for word, max 8 words per caption'}\` · talare=\`${t.talare}\` · copy_model=\`sonnet\` · typ=\`${k.typ}\` · koncept=\`${k.koncept}\` · parent=\`${k.parent ?? '—'}\` · iteration=\`${k.iteration ?? '—'}\` · kalla=\`${k.kalla}\` · avatar=\`${k.avatar}\` · awareness=\`${k.awareness}\` · begar=\`${k.begar}\` · mekanism=\`${k.mekanism}\` · tro=\`${k.tro}\` · urgency=\`${k.urgency ?? 'sasong'}\` · hook-mekanik=\`${k.hookMek}\` · confidence=\`${k.confidence}\` · lardom=\`${k.lardom}\`
*(Read by the next round to group profit contribution per variable value. Do not change them without changing the creative.)*`;
}

function copyKort(lp) {
  return `**Primary text:**
> «SV primary text — four to six short lines, each its own line; opens with the giver's scene, then what he stops doing, then the lock: 999 kr, 30 dagars öppet köp, livstidsgaranti, fri frakt inom Sverige»

**Headline:** \`«SV headline, max 40 characters, carries Mastern or the price»\`
**Description:** \`«SV description, max 60 characters: two facts + 30 dagars öppet köp»\`
**CTA button:** \`Handla nu\` (Shop Now)
**Destination:** ${lp}`;
}

const TREFRAGOR = `| Line | Visualise? | Falsifiable? | Only we can say it? |
|---|---|---|---|
«ONE ROW PER DELIVERED SWEDISH LINE — every hook, every script line, the giver's line, the headline, the description and each primary-text line. Every cell must be ✅ with a five-to-fifteen-word reason. A line that earns a ❌ anywhere is rewritten until it passes or dropped; it never stays in the brief with a ❌. Rows are plain table rows: | line | ✅ reason | ✅ reason | ✅ reason |»`;

function videoBrief(s) {
  const namn = `Mastern_${s.kod}_${s.nr}_H1`;
  const hooks = s.hooks; // [{obj, intent, mek, picture, first, source}]
  const scriptRows = [];
  const regiRows = [];
  let n = 0;
  hooks.forEach((h, i) => {
    n += 1;
    scriptRows.push(`| 0–3 s · HOOK H${i + 1} | «SV H${i + 1}» | «EN H${i + 1}» — INTENT: ${h.intent} |`);
    regiRows.push(`| ${n} | 0:00–0:03 (H${i + 1}) | «SV H${i + 1}» | VO | «SV H${i + 1}» | ${h.picture} **First frame:** ${h.first} | ${h.effect} | ${h.source} | ${h.ref ?? '—'} | none |`);
  });
  s.beats.forEach((b, i) => {
    n += 1;
    const id = i + 4;
    scriptRows.push(`| ${b.t} · ${b.label} | «SV ${id}» | «EN ${id}» — INTENT: ${b.intent} |`);
    regiRows.push(`| ${n} | ${b.tt} | «SV ${id}» | ${b.audio ?? 'VO'} | ${b.text ?? `«SV ${id}»`} | ${b.picture} | ${b.effect} | ${b.source} | ${b.ref ?? '—'} | ${b.lat ?? 'b-roll order free'} |`);
  });
  const lp = s.lp === 'product' ? LP_PROD : LP_GIFT;
  const lpText = s.lp === 'product'
    ? `${LP_PROD} (product page — A/B against the gift page ${LP_GIFT} at adset level)`
    : `${LP_GIFT} (gift page #12 — A/B against the product page ${LP_PROD} at adset level)`;
  return `# ${namn} — ${s.title}

${taggrad(s.taggar)}

**Memo:** ${s.memo}
**Type:** Video · **Batch:** Fars dag 2026 (briefed 2026-09-25, live 12 Oct, off 8 Nov 12:00) · **Copy written by:** sonnet — the main session wrote the strategy, the structure, the direction table and the rules; do not rewrite the Swedish lines
**AI content:** ${s.ai}
**Landing page:** ${lpText}
**Why:** ${s.why} Judged on purchases and profit contribution, never on ROAS or CTR alone.
**Deliver as:** \`${namn}\`, \`Mastern_${s.kod}_${s.nr}_H2\`, \`Mastern_${s.kod}_${s.nr}_H3\` — one file per hook, same body from 0:03.

## 1. Why this ad exists
${s.whyLong}

## 2. Hypothesis
${s.hypothesis}
**Hook (H1):** «SV H1»

## 3. Format
| | |
|---|---|
| Deliverable | **3 files** (H1, H2, H3 — same body, only 0:00–0:03 differs), each in 9:16 (1080×1920) and 4:5 (1080×1350). |
| Length | ~${s.len} s. |
| Narrator | ${s.narrator} |
| Sound | Swedish VO word for word from the script. Music under, never over the VO. Must work on mute: the captions carry the message. |
| Captions | Burned in, Swedish, word for word, max 8 words per caption, inside the middle 80 % of the frame. Å, Ä, Ö must render. |
| First 3 seconds | ONE real physical object in macro (hook-visual rule 2026-08-04). Never a person, never AI, never the store name. |
| Product on screen | The box or the brush in frame by second 4 at the latest, then never hidden behind a caption for more than a second. |
| Season | It is November. Jackets, dusk, a terrace lamp, leaves on the cover — never a summer scene except as a memory. |
| End card | Mastern on the grill edge · "999 kr" · "30 dagars öppet köp" · "Livstidsgaranti" · button text "Ge bort den" — from the CTA folder (id ${D.cta}). No percentage. |

## 4. Script — these lines, word for word
Swedish is what runs in the ad. The right column is meaning only, for the editor. Do not "fix" the Swedish; ask before changing anything. (INTENT text is the copywriter's instruction and is replaced by the final English meaning.)

| Time | Swedish (use this) | English meaning |
|---|---|---|
${scriptRows.join('\n')}

## 5. Direction — one row per script line (docs/os/BRIEF-REGI.md)
${ASSETS}
**Reference ads:** ${s.refAds}
${LATITUDE}

| # | Time | Script line (Swedish) | Audio | On-screen text | Picture | Effect + length | Source | Reference | Latitude |
|---|---|---|---|---|---|---|---|---|---|
${regiRows.join('\n')}

## 6. What the giver says when the box opens
«SV giver line — one spoken sentence the giver can say at the table; it is the last caption before the end card» — «EN meaning». ${s.giverNote ?? ''}

## 7. COPY CARD (goes in Ads Manager, not in the creative)
${copyKort(lp)}

## 8. Three-question test (docs/copy-regler.md) — every delivered line
${TREFRAGOR}

## 9. Rules
${[...REGLER_GEMENSAMMA, ...(s.rules ?? [])].map((r) => `- ${r}`).join('\n')}
- **Landing page:** ${lp}

## 10. Primary KPI
${KPI_VIDEO}${s.kpi ? ` ${s.kpi}` : ''}

## 11. What we learn regardless of outcome
${s.learn}
`;
}

function staticBrief(s) {
  const namn = `Mastern_${s.kod}_${s.nr}_1`;
  const lp = s.lp === 'product' ? LP_PROD : LP_GIFT;
  const rows = s.texts.map((t) => `| ${t.el} | «SV ${t.id}» | «EN ${t.id}» — INTENT: ${t.intent} |`).join('\n');
  return `# ${namn} — ${s.title}

${taggrad(s.taggar)}

**Memo:** ${s.memo}
**Type:** Static image · **Batch:** Fars dag 2026 (briefed 2026-09-25, live 12 Oct, off 8 Nov 12:00) · **Copy written by:** sonnet — the main session wrote the strategy, the structure, the design brief and the rules; do not rewrite the Swedish lines
**Landing page:** ${lp === LP_GIFT ? `${LP_GIFT} (gift page #12 — A/B against the product page at adset level)` : `${LP_PROD} (product page — A/B against the gift page ${LP_GIFT} at adset level)`}
**Why:** ${s.why} Judged on purchases and profit contribution, never on ROAS or CTR alone.
**Deliver as:** \`${namn}\` (4:5) and the same file in 1:1.

## 1. Why this ad exists
${s.whyLong}

## 2. Hypothesis
${s.hypothesis}
**Headline:** «SV headline»

## 3. Format
| | |
|---|---|
| Deliverable | 4:5 (1080×1350) **and** 1:1 (1080×1080). PNG or JPG, under 30 MB, sRGB. Swedish text word for word, Å/Ä/Ö must render, readable on a phone in feed (thumbnail test at 3 cm). |
| Photo | ${s.photo} |
| Layout | ${s.layout} |
| Colours | Brand kit \`pipeline/brand.mjs\`: charcoal #141210, ember #E8551E (one accent only), cream #F4EFE7 text, smoke #B7ADA0 footer. Contrast ≥ 4,5:1. |

## 4. Exact text (Swedish word for word, do not re-translate)
| Element | Swedish (use this) | English meaning |
|---|---|---|
${rows}

## 5. Design brief
${s.design.map((d) => `- ${d}`).join('\n')}
**Reference:** ${s.ref}
**Editor latitude:** MAY: crop, background tone within the brand kit, the exact product angle among the real photos, type size. MUST NOT: change a Swedish line, the price, add a percentage or a badge bigger than the price, generate the product, add a person, name the store, any field in VARIABELTAGGAR.

## 7. COPY CARD (goes in Ads Manager, not in the creative)
${copyKort(lp)}

## 8. Three-question test (docs/copy-regler.md) — every delivered line
${TREFRAGOR}

## 9. Rules
${[...REGLER_GEMENSAMMA, ...REGLER_STATIC, ...(s.rules ?? [])].map((r) => `- ${r}`).join('\n')}
- **Landing page:** ${lp}

## 10. Primary KPI
${KPI_STATIC}${s.kpi ? ` ${s.kpi}` : ''}

## 11. What we learn regardless of outcome
${s.learn}
`;
}

// ---------------------------------------------------------------- SPECAR

const boxMacro = 'Macro of the Mastern box on a kitchen table, ribbon in frame, a November window behind (dark, a lamp). Hands enter only after the first frame.';

const VIDEOS = [
  {
    nr: 301, kod: 'GT', title: 'He grills for everyone — and stands there alone afterwards (the wife gives him the evening back)',
    taggar: { vinkel: 'present / fars dag — kvällen tillbaka', hookTyp: 'givarens scen (föremål: brickan efter middagen)', format: 'video, female VO + b-roll, 3 hooks', proof: 'kundcitat Christer F. (halvtimme → en minut) + mekanism', visuell: 'terrass i november, tallrikar, stålborsten, händer, lådan, gallret', talare: 'kvinnlig VO — frun/sambon, aldrig i bild',
      komp: { typ: 'N', koncept: 'fd-grillar-at-alla', kalla: 'playbook', avatar: 'partner-maria', awareness: 'problem', begar: 'njutning', mekanism: 'reaktionen (lådan) före funktionen (springorna, sextio sekunder) — ägandet visas som varje helg', tro: 'presenten är kvällen han får tillbaka, inte en pryl', hookMek: 'cut-in', confidence: 'high', lardom: 'L-050' } },
    memo: 'The first Mastern ad told from the giver\'s side of the table: she sees him stand alone after every dinner, and the product is what puts him back in the chair — the 050 before/after in minutes, but bought by her.',
    ai: 'voice', lp: 'gift',
    why: 'Women are 18 % of spend with the highest CTR and have only ever been reached through a grill persona (191 CARLA, ROAS 0,57); the gift page headline "he grills for everyone and stays behind alone" has never had a video, and 050 proved the minutes-before/after sells (ROAS 2,12).',
    whyLong: 'Partner-Maria buys for the man who does everything at the grill. What she sees is not a dirty grate — it is him standing alone on the terrace for twenty minutes while everyone else is inside. That is the emotional act. The functional act is what he stops doing: kneeling with a wire brush that only scrapes the top. Research 1 and 2 (`docs/fars-dag-research-2026.md` §4): she buys the reaction, he keeps the minutes every weekend. Christer F.\'s review is the proof line because it is the same before/after in his own words.',
    hypothesis: 'A female giver narrator with a male grill user in picture converts where a female grill persona did not (L-191): the problem is told as *his* evening, not *her* grill.',
    len: 32, narrator: 'Female VO, warm, unhurried — the wife. She never grills in picture; his hands grill.',
    refAds: 'parent 050 "Kundcitat" (ROAS 2,12) — Replicate: the before/after in minutes, the sitting-down-with-a-beer beat / Do not replicate: the male narrator, the summer light. Gift page #12 headline is the source of the angle.',
    hooks: [
      { intent: 'He grills for twelve people every summer, then stands alone for twenty minutes. Object: the stacked plates / tongs on the tray after dinner.', picture: 'Macro of a stacked tray of empty plates and the grill tongs on the terrace table, terrace lamp on, dusk.', first: 'the tray of plates, tongs on top.', effect: 'cut-in', source: NEW('the after-dinner tray on a terrace table in November light, filmed by Axel or UGC creator Beerhansson (folder ' + D.ugcBH + ')') },
      { intent: 'The last thing he does every grill night is the one thing nobody thanks him for. Object: the wire brush on the side table under the lamp.', picture: 'Macro of a worn wire brush lying on the grill side table, terrace lamp, breath visible in the cold.', first: 'the wire brush under the lamp.', effect: 'zoom-in 1 s', source: drive(D.old, 'the worn wire brush on a table or grill edge, macro, no hands') },
      { intent: 'From the kitchen window she can see him; everyone else is inside. Object: the kitchen window with the grill glowing outside.', picture: 'Macro through a kitchen window: the grill lid open outside, a silhouette of his arm scrubbing, reflections of the indoor lamp on the glass.', first: 'the window, the grill glow outside.', effect: 'freeze 0.5 s then cut-in', source: NEW('a kitchen window at dusk with the grill visible outside, filmed by Axel') },
    ],
    beats: [
      { t: '3–9 s', tt: '0:03–0:09', label: 'PROBLEM', intent: 'He does everything right — good meat, the thermometer, resting — and then kneels twenty minutes with a wire brush that only reaches the top of the bars. The grease in the gaps stays. It was never him; it is the brush.', picture: 'His hands scrubbing a grate with a wire brush, then macro into the gap between two bars: black crust untouched.', effect: 'cut-in', source: drive(D.problem, 'hands scrubbing with a wire brush + macro of black grease in a grate gap'), ref: '110 B2 "flip the grate" beat' },
      { t: '9–14 s', tt: '0:09–0:14', label: 'THE GIFT', intent: 'This year she gives him the one thing he would never buy himself. The box opens: Mastern, two heads, gloves, the USB cable.', picture: 'Hands open the Mastern box on the kitchen table: brush, second head, gloves, cable laid out one by one.', effect: 'none', source: NEW('unboxing on a kitchen table, filmed by Axel; the box exactly as shipped'), lat: 'none' },
      { t: '14–22 s', tt: '0:14–0:22', label: 'FUNCTION', intent: 'One button. The head spins down into the gaps while the grate is still warm; a wet head, the steam does half the work; sixty seconds; two heads and nothing comes loose.', picture: 'His hand presses the button; macro of the coarse head spinning in a gap, steam rising; black flakes lifting; cut to the polish head.', effect: 'slow-mo 0.5× 2 s on the spinning head', source: drive(D.macro, 'coarse head spinning in a grate gap with steam, then the polish head') },
      { t: '22–27 s', tt: '0:22–0:27', label: 'OWNERSHIP', intent: 'Every weekend from now he sits down with us while the grate is still warm. Christer F. wrote: normally a job I put off for half an hour, now under a minute — quote it verbatim with the name.', picture: 'He sits down at the terrace table, beer in hand, the grill behind him with the lid closed; the review as a caption card with the name.', effect: 'none', source: drive(D.mid, 'the griller sitting down at the table with a drink after cleaning'), ref: '050 sitting-down beat' },
      { t: '27–32 s', tt: '0:27–0:32', label: 'LOCK + CTA', intent: 'Price 999 kr, thirty days open purchase, lifetime warranty — if it breaks he gets a new one. The gift cannot go wrong. Then the giver\'s line from §6.', picture: 'End card: Mastern on the grill edge, price, the two promises, button.', effect: 'none', source: drive(D.cta, 'the end card plate with Mastern on the grill edge'), lat: 'none' },
    ],
    learn: 'Whether a female giver voice with a male user in picture converts on this product (it has never had spend) — and whether the gift page or the product page wins for a partner audience.',
  },
  {
    nr: 302, kod: 'GT', title: 'The reaction — a real dad opens the box and is out at the grill sixty seconds later',
    taggar: { vinkel: 'present / fars dag — reaktionen', hookTyp: 'föremål (lådan) → ansiktet', format: 'video, UGC reaction, real footage, natural sound + short giver VO, 3 hooks', proof: 'reaktionen + första draget över gallret', visuell: 'köksbord, inslagen låda, pappa i jacka vid grillen i november, pannlampa', talare: 'givaren (dotter/son) — kort VO, riktig röst, ingen AI',
      komp: { typ: 'N', koncept: 'fd-reaktionen', kalla: 'swipe', avatar: 'vuxet-barn', awareness: 'solution', begar: 'tillhorighet', mekanism: 'smile-seeking: givaren köper reaktionen — visa den, sen funktionen i tre captions', tro: 'den här presenten ger reaktionen alla andra presenter missar', hookMek: 'zoom-in', confidence: 'medium', lardom: 'L-233' } },
    memo: 'Every gift brand that scales on Meta runs a reaction format ("HE\'S. BEAMING." — Skylight, `docs/research-dtc-gifting-meta-2026-08-25.md`); Mastern has never had one, and the smile-seeking research says the reaction is exactly what the giver is buying.',
    ai: 'none', lp: 'gift',
    why: 'Givers choose the gift that gives the biggest reaction (Yang & Urminsky 2018) and this account has never shown one; a real dad, a real box, a real first pass — the object first (L-233), the face second.',
    whyLong: 'This is the only brief that needs new footage of a person, and it must be a real person: a father in his sixties, in a jacket, in November, opening the box and going straight out to the grill. No script for him — he says what he says. The giver\'s voice carries three captions of function over the demo so the recipient\'s value (research 2) is on screen while the smile is. The hook is still an object: the box, the ribbon, his hands — never his face in the first three seconds.',
    hypothesis: 'A reaction film with the function told in three captions beats a narrated demo for the giver audience, because the giver buys the reaction and reads the function.',
    len: 30, narrator: 'The adult child who films (real voice, phone audio is fine). Three short VO lines only; the rest is natural sound.',
    refAds: 'none — new concept. External reference: Skylight\'s "HE\'S. BEAMING." reaction ads (research 2026-08-25). Replicate: the box before the face, the reaction uncut. Do not replicate: an actor, a script for the dad.',
    hooks: [
      { intent: 'He guessed socks. Object: the wrapped box on the table, his hands reaching in.', picture: boxMacro, first: 'the wrapped box and the ribbon.', effect: 'zoom-in 1 s', source: NEW('a real wrapped Mastern box on a kitchen table, filmed by the giver (UGC creator Beerhansson, folder ' + D.ugcBH + ', or Rickard Jenders, folder ' + D.ugcRJ + ')') },
      { intent: 'Sixty seconds after he opened it he was already out at the grill. Object: the opened box, packaging still on the table, the terrace door ajar.', picture: 'Macro of the opened box on the table, tissue paper, the terrace door open in the background with cold light.', first: 'the opened box, door ajar behind.', effect: 'cut-in', source: NEW('the opened box with the terrace door in the background, same shoot') },
      { intent: 'My dad does not say much. Watch his face at twelve seconds. Object: his reading glasses on the box.', picture: 'Macro of reading glasses resting on the Mastern box lid.', first: 'the glasses on the box.', effect: 'freeze 0.5 s', source: NEW('reading glasses on the box lid, same shoot') },
    ],
    beats: [
      { t: '3–10 s', tt: '0:03–0:10', label: 'UNWRAP', intent: 'No VO. Natural sound: paper, his voice, the family. Caption: what he says when he reads the box — or NO TEXT if he says nothing usable.', audio: 'NO VO', text: 'NO TEXT', picture: 'He unwraps at the table, reads the box, turns it over. Uncut, one take.', effect: 'cut-in', source: NEW('the real unwrapping, one take, filmed by the giver'), lat: 'none' },
      { t: '10–16 s', tt: '0:10–0:16', label: 'OUT TO THE GRILL', intent: 'Giver VO: he did not wait for spring. Out to the grill in his jacket; the lid comes off, the cold grate.', picture: 'He walks out in a jacket, opens the grill, the grate with last season\'s grease; the terrace lamp lights the grate.', effect: 'cut-in', source: NEW('the walk to the grill and the lid opening, same shoot') },
      { t: '16–22 s', tt: '0:16–0:22', label: 'FIRST PASS', intent: 'Giver VO: one button, the head spins down into the gaps, sixty seconds — that is the whole routine. Natural sound of the motor under.', picture: 'His hand on the button, the head spinning in the gaps, black flakes lifting, his face watching.', effect: 'slow-mo 0.5× 2 s on the flakes', source: NEW('the first pass on his own grate, same shoot; if the light fails, insert ' + drive(D.macro, 'coarse head spinning in a gap') + ' for two seconds') },
      { t: '22–26 s', tt: '0:22–0:26', label: 'THE FACE', intent: 'No VO. His reaction — whatever it is. Caption: two heads, nothing comes loose, works on his grill.', audio: 'NO VO', picture: 'His face, then the clean bars. Hold two seconds on the face.', effect: 'freeze 0.5 s on the face', source: NEW('his reaction, uncut, same shoot'), lat: 'none' },
      { t: '26–30 s', tt: '0:26–0:30', label: 'LOCK + CTA', intent: 'Giver VO: 999 kr, thirty days open purchase, lifetime warranty. Then the giver\'s line from §6.', picture: 'End card: Mastern on the grill edge, price, the two promises, button.', effect: 'none', source: drive(D.cta, 'the end card plate'), lat: 'none' },
    ],
    giverNote: 'For this brief the giver\'s line is what she/he actually said on the day — write the intended line, replace with the real one after the shoot.',
    rules: ['**Real person, real reaction.** The father is a real father (a creator\'s own father, or Axel\'s family). No actor, no script for him, no AI face, no AI voice. If the real reaction is flat, the ad is not made — do not fake it.', '**The product must be in the box exactly as shipped** (two heads, gloves, USB cable). Verify the kit contents against a real box before the shoot.'],
    learn: 'Whether a real reaction beats a narrated demo for gift buyers — the format every scaling gift brand runs and this account has never tested.',
  },
  {
    nr: 303, kod: 'GT', title: 'Last year we gave him the mug — the gift that stays in the cupboard vs the one he uses every weekend',
    taggar: { vinkel: 'present / fars dag — klichépresenten mot den som används', hookTyp: 'föremål (muggen i skåpet)', format: 'video, VO + b-roll, 3 hooks', proof: 'kundcitat Johan E. (köpte till storebror och svärfar) + mekanism', visuell: 'köksskåp, muggen, slipsasken, grillen, lådan, gallret', talare: 'dottern/sonen — vuxet barn, kvinnlig eller manlig VO (välj kvinnlig)',
      komp: { typ: 'N', koncept: 'fd-forra-aret-muggen', kalla: 'egen-data', avatar: 'vuxet-barn', awareness: 'problem', begar: 'tillhorighet', mekanism: 'den misslyckade presenten som föremål först (L-276: aldrig ordet present), sen ägandet varje helg', tro: 'den enda presenten han använder är den som står vid grillen', hookMek: 'zoom-in', confidence: 'high', lardom: 'L-276' } },
    memo: 'The gift hooks that starved in August all opened with the word "present"; this one opens with the mug in the cupboard — the Ipsos-measured least-wanted gift — and lets the failed gift carry the emotion before Mastern carries the function.',
    ai: 'voice', lp: 'gift',
    why: 'The mug is the least wanted Father\'s Day gift for 16 % of fathers and the tie for more than one in three (Ipsos via Carup); the adult child knows it, has given both, and wants the one he actually uses — and 276/278/300 taught us to open with an object, never the word present (L-276).',
    whyLong: 'Every adult child has given the mug. It stands in the cupboard from November on. That shame is the emotional act — the giver\'s own, not the recipient\'s. The functional act answers the giver\'s real question (research 3, Gino & Flynn: the gift he would have asked for): the one thing he does every weekend is grill, and the one thing he never buys himself is a 999-kronor brush. Johan E.\'s review — bought one for his brother and one for his father-in-law for Father\'s Day — is the proof that other givers already made this exact choice.',
    hypothesis: 'Opening on the failed gift (the mug) instead of the product gets delivery where the "present" hooks got none, and the adult-child audience converts on "the one he uses every weekend".',
    len: 30, narrator: 'Female VO — the daughter. Dry, a little self-mocking about the mug, warm about him.',
    refAds: 'none — new concept. Do not replicate 276/278 (starved, L-276): no "present" in the first line, no abstract worry.',
    hooks: [
      { intent: 'Last year we gave dad this one. It has stood in the cupboard since November. Object: the "världens bästa pappa" mug at the back of a cupboard.', picture: 'Macro into a kitchen cupboard: a "VÄRLDENS BÄSTA PAPPA" mug at the back behind the everyday glasses. Cupboard door opening is the motion.', first: 'the mug at the back of the cupboard.', effect: 'zoom-in 1 s', source: NEW('a printed dad-mug at the back of a real cupboard, filmed by Axel') },
      { intent: 'The tie from Father\'s Day is still in its box. Object: a tie in a gift box in a drawer.', picture: 'Macro of a drawer opening: a tie still folded in its gift box, receipt on top.', first: 'the tie in its box.', effect: 'cut-in', source: NEW('a boxed tie in a drawer, filmed by Axel') },
      { intent: 'Three gifts in five years. This is the only one he uses. Object: Mastern hanging by the grill, a mug and a tie blurred on the table behind.', picture: 'Macro of Mastern hanging on its hook by the grill; in soft focus behind: the mug and the boxed tie on the terrace table.', first: 'Mastern on the hook, gifts blurred behind.', effect: 'freeze 0.5 s then cut-in', source: NEW('Mastern on a hook by the grill with the mug and tie staged behind, filmed by Axel') },
    ],
    beats: [
      { t: '3–8 s', tt: '0:03–0:08', label: 'THE PATTERN', intent: 'The mug, the tie, the t-shirt — the gifts every dad gets and none of them wanted (the mug is the least wanted for one father in six, the tie for more than one in three — in words). He says thank you and puts them away.', picture: 'Three quick macros: the mug, the tie, a folded printed t-shirt in a wardrobe.', effect: 'cut-in ×3', source: NEW('mug, tie, printed t-shirt, filmed by Axel'), lat: 'b-roll order free' },
      { t: '8–13 s', tt: '0:08–0:13', label: 'WHAT HE ACTUALLY DOES', intent: 'What he does every weekend is grill — and afterwards he kneels with a wire brush that only scrapes the top of the bars. Grease in the gaps stays. Not his fault; the brush\'s.', picture: 'His hands at the grill in November, then scrubbing with a wire brush, macro of the untouched gap.', effect: 'cut-in', source: drive(D.problem, 'wire-brush scrubbing + macro of the grease in a gap') },
      { t: '13–20 s', tt: '0:13–0:20', label: 'THE GIFT + FUNCTION', intent: 'This year: Mastern. One button, the head spins down into the gaps, sixty seconds while the grate is warm, two heads, nothing comes loose. The box has everything — heads, gloves, the USB cable.', picture: 'The box opens on the kitchen table; then his hand presses the button, the coarse head spins in a gap with steam, the polish head.', effect: 'slow-mo 0.5× 2 s on the spinning head', source: drive(D.macro, 'button press, head spinning in a gap with steam, polish head') },
      { t: '20–26 s', tt: '0:20–0:26', label: 'OWNERSHIP', intent: 'Every weekend, the whole next season. Johan E. wrote that he bought one for his big brother and one for his father-in-law for Father\'s Day, everyone happy — quote verbatim with the name.', picture: 'He hangs Mastern on its hook by the grill and walks in; the review as a caption card with the name.', effect: 'none', source: drive(D.mid, 'the griller hanging the brush and walking away from a clean grill'), ref: '050 quote-card style' },
      { t: '26–30 s', tt: '0:26–0:30', label: 'LOCK + CTA', intent: '999 kr, thirty days open purchase, lifetime warranty — if it breaks he gets a new one. Then the giver\'s line from §6.', picture: 'End card: Mastern on the grill edge, price, the two promises, button.', effect: 'none', source: drive(D.cta, 'the end card plate'), lat: 'none' },
    ],
    learn: 'Whether the failed-gift object hook gets delivery where the "present" hooks did not — the cleanest test of L-276.',
  },
  {
    nr: 304, kod: 'OB', title: '"Another piece of Chinese junk?" — the giver\'s doubt answered with a bowl of black water',
    taggar: { vinkel: 'invändning (OB): är det bara en gimmick? — givarens tvivel', hookTyp: 'föremål (den oöppnade lådan) / beviset (skålen)', format: 'video, VO + demo, 3 hooks', proof: 'två-vatten-demon + kundcitat Marcus A. och Lars-Erik H.', visuell: 'lådan, varmt galler, blött huvud, skålen som blir svart, gallret blankt', talare: 'sonen — manlig VO, skeptisk först',
      komp: { typ: 'N', koncept: 'fd-kinapynt', kalla: 'voc', avatar: 'vuxet-barn', awareness: 'product', begar: 'trygghet', mekanism: 'mekanismen inlindad i givarens tvivel (L-145): visa svarta vattnet, påstå inget', tro: 'den funkar på riktigt — och funkar den inte skickar han tillbaka den inom trettio dagar', hookMek: 'slow-mo', confidence: 'medium', lardom: 'L-145' } },
    memo: 'Pure mechanism lost (145, ROAS 1,36) — but the giver\'s real objection is "is an electric brush a gimmick?" (Axel\'s objection document, Marcus A.\'s review), and a demo framed as answering that doubt is a different ad from a demo that just demonstrates.',
    ai: 'voice', lp: 'product',
    why: 'The giver\'s biggest fear is giving a gadget that ends up in a drawer; Marcus A. wrote "förväntade mig ännu ett Kinapynt" and stayed at four stars, and the dip-the-head-in-a-bowl proof (två vatten) has never been shown to a gift audience.',
    whyLong: 'Objection ads carry the code OB (naming convention, Axel 2026-09-21). The objection here is the giver\'s: "he already has a brush, is this thing real?". The emotional act is the doubt itself (no one wants to be the one who gave the gimmick). The functional act is proof you can see: warm grate, wet head, one pass, black flakes, the head dipped in a bowl — the water goes black. Then the build that makes it not a gimmick: the coarse head locks the metal, the polish head has no metal, 2 600 mAh, four to six cleanings per charge. Marcus A. and Lars-Erik H. close it with their own words.',
    hypothesis: 'A demo that starts from the giver\'s doubt (OB) converts the doubters that a proud demo never reaches — and the 30-day open purchase is the line that lets a sceptic buy.',
    len: 33, narrator: 'Male VO — the son, sceptical in the first line, convinced by what he sees, never a salesman.',
    refAds: 'parent 145 H2 "Tre anledningar" (ROAS 1,36 — the loser): Replicate: nothing of the structure. Reference for the proof: swipe "Två vatten" (`docs/swipes/tvavatten-uproot-swipe.md`) — replicate the bowl-of-water proof, not its copy.',
    hooks: [
      { intent: 'I was afraid of giving dad a gadget that ends up in a drawer. Object: the unopened Mastern box on the workbench.', picture: 'Macro of the unopened Mastern box on a garage workbench, a drawer half open beside it with old gadgets.', first: 'the unopened box beside the drawer.', effect: 'zoom-in 1 s', source: NEW('the unopened box on a workbench next to a junk drawer, filmed by Axel') },
      { intent: 'This is what was still in a grate that had "just been cleaned". Object: a bowl of water turning black as the head is dipped.', picture: 'Macro of a white bowl of water; the brush head dips in and the water turns black.', first: 'the bowl, water still clear.', effect: 'slow-mo 0.5× 2 s', source: drive(D.macro, 'the head dipped in a bowl of water, water turning black') },
      { intent: 'Marcus A. expected another piece of Chinese junk. Object: his review on the phone screen.', picture: 'Macro of a phone showing the four-star review by Marcus A., thumb scrolling.', first: 'the review on the phone.', effect: 'freeze 0.5 s', source: NEW('screen recording of the Marcus A. review on the product page') },
    ],
    beats: [
      { t: '3–8 s', tt: '0:03–0:08', label: 'THE DOUBT', intent: 'An electric grill brush. Dad has a wire brush that cost a hundred kronor; why would a nine-hundred-kronor one be different? So I tested it before I wrapped it.', picture: 'The wire brush next to Mastern on the workbench; hands lift both.', effect: 'cut-in', source: drive(D.store, 'a cheap store wire brush next to Mastern') },
      { t: '8–15 s', tt: '0:08–0:15', label: 'THE TEST', intent: 'Warm grate. Wet head. One pass — black flakes lift out of the gaps the wire brush never reached. Dip the head in a bowl: the water goes black. That was in his "clean" grate.', picture: 'Macro sequence: the head wetted, one pass on a warm grate with steam, flakes lifting, the dip, the black water.', effect: 'slow-mo 0.5× 2 s on the black water', source: drive(D.macro, 'wet head, pass with steam, flakes, dip in bowl, black water') },
      { t: '15–22 s', tt: '0:15–0:22', label: 'THE BUILD', intent: 'Why it is not a gimmick: the coarse head locks the metal in so nothing comes loose; the polish head has no metal at all; 2 600 mAh, four to six cleanings per charge; the heads go in the dishwasher.', picture: 'Macro of the coarse head\'s locked bristles, the polish head, the USB port, a head in a dishwasher rack.', effect: 'cut-in', source: drive(D.heads, 'coarse head close-up, polish head, USB port') },
      { t: '22–28 s', tt: '0:22–0:28', label: 'PROOF', intent: 'Marcus A.: expected another piece of Chinese junk but this feels robust. Lars-Erik H.: Weber Genesis grate from black to clean in ninety seconds. Verbatim, with names.', picture: 'Two review cards over the clean grate, names visible.', effect: 'none', source: cdn(CDN.foto), ref: '050 quote-card style' },
      { t: '28–33 s', tt: '0:28–0:33', label: 'LOCK + CTA', intent: 'If it is a gimmick he sends it back: thirty days open purchase. If it breaks he gets a new one: lifetime warranty. 999 kr. Then the giver\'s line from §6.', picture: 'End card: Mastern on the grill edge, price, the two promises, button.', effect: 'none', source: drive(D.cta, 'the end card plate'), lat: 'none' },
    ],
    rules: ['**Show the proof, never claim it.** No "bäst", no "revolutionerande", no adjectives about performance — the bowl of water and the reviews are the whole argument.'],
    learn: 'Whether wrapping the mechanism in the giver\'s doubt turns the account\'s losing format (pure mechanism) into a converting one.',
  },
  {
    nr: 305, kod: 'GT', title: 'The dinner invitation — what dads actually want, plus the one thing that keeps him at the table',
    taggar: { vinkel: 'present / fars dag — middagen och stolen som står tom', hookTyp: 'föremål (kalendern / sms:et / den tomma stolen)', format: 'video, VO + b-roll, 3 hooks', proof: 'Svensk Handel (papporna vill träffa barnen och bli bjudna på middag, i ord) + mekanism', visuell: 'kalender, sms, matbord, tom stol, grillen, lådan', talare: 'sonen eller dottern — vuxet barn (välj manlig VO)',
      komp: { typ: 'N', koncept: 'fd-middagsbjudningen', kalla: 'swipe', avatar: 'vuxet-barn', awareness: 'problem', begar: 'tillhorighet', mekanism: 'upplevelsepresenten (Chan & Mogilner): kvällen är presenten, Mastern är det som gör att han sitter med', tro: 'det pappa vill ha är oss vid bordet — och att han själv hinner sitta där', hookMek: 'cut-in', confidence: 'medium', lardom: 'L-050' } },
    memo: 'Svensk Handel says what dads want is to see their children and be invited to dinner; this ad gives them exactly that and makes Mastern the thing that lets him sit down at his own table instead of standing at the grill — the experiential gift the research says strengthens the relationship most.',
    ai: 'voice', lp: 'gift',
    why: '38 % of fathers want to see their children and 29 % want to be invited to dinner (Svensk Handel) — nobody wants a brush; but the dinner at dad\'s always ends with him at the grill while we clear the table, and 050 proved "sit down while the grate is still warm" sells.',
    whyLong: 'Research 7 (Chan & Mogilner 2017): experiential gifts strengthen relationships more than material ones. This brief makes the gift the evening: we invite ourselves to dad\'s on Father\'s Day, he grills, and the box is on the table when we arrive. The emotional act is the empty chair — his — for twenty minutes every time we eat at his place. The functional act: sixty seconds while the grate is warm, one button, into the gaps, and he sits down with us. The giver\'s line is the invitation itself.',
    hypothesis: 'A gift framed as an invitation (time together) outperforms a gift framed as a product for the adult-child audience, because it answers what the fathers themselves say they want.',
    len: 31, narrator: 'Male VO — the son, plain and fond.',
    refAds: 'parent 050 "Kundcitat" (ROAS 2,12) — Replicate: the sitting-down beat / Do not replicate: the male user as narrator. Svensk Handel Fars dag 2025 is the source of the angle.',
    hooks: [
      { intent: 'This year we are not giving dad a thing. We are giving him a Sunday — and the thing that lets him sit at the table. Object: a wall calendar with the 8th of November circled and "hos pappa" written.', picture: 'Macro of a paper calendar page, November, the 8th circled in pen with "hos pappa" written; a hand pins it.', first: 'the circled 8th of November.', effect: 'cut-in', source: NEW('a real November calendar page with the 8th circled, filmed by Axel') },
      { intent: 'Text message: "We come at two. You grill." Object: the phone with the message thread.', picture: 'Macro of a phone: a sent message "Vi kommer vid två. Du grillar." and the reply "Ja!!" from "Pappa".', first: 'the message thread.', effect: 'zoom-in 1 s', source: NEW('a staged real message thread on a phone, filmed by Axel') },
      { intent: 'Dad\'s chair is empty for twenty minutes every time we eat at his place. Object: the empty chair at the head of the table, plates on.', picture: 'Macro of an empty chair at the head of a set dinner table, a plate in front of it, everyone else\'s hands in frame.', first: 'the empty chair, the full plates.', effect: 'freeze 0.5 s then cut-in', source: NEW('an empty chair at a set table with family hands, filmed by Axel or UGC creator Beerhansson') },
    ],
    beats: [
      { t: '3–8 s', tt: '0:03–0:08', label: 'WHAT DADS WANT', intent: 'Ask the fathers what they want for Father\'s Day and most say the same thing: to see their children, to be invited to dinner. So this year we invite ourselves to his place.', picture: 'The family arriving at dad\'s house in November, jackets, the grill glowing on the terrace.', effect: 'cut-in', source: NEW('a family arriving at a house in November, terrace grill lit, filmed by UGC creator Beerhansson (folder ' + D.ugcBH + ')') },
      { t: '8–13 s', tt: '0:08–0:13', label: 'THE EMPTY CHAIR', intent: 'And every dinner at his place ends the same way: we clear the table, he stands at the grill with a wire brush that only scrapes the top. Twenty minutes. His chair empty. Not his fault — the brush\'s.', picture: 'Hands clearing plates; through the window he scrubs; macro of the gap the brush never reaches.', effect: 'cut-in', source: drive(D.problem, 'wire-brush scrubbing + macro of the grease in a gap') },
      { t: '13–20 s', tt: '0:13–0:20', label: 'THE BOX ON THE TABLE', intent: 'This year the box is on the table when we arrive. Mastern: one button, the head spins down into the gaps while the grate is still warm, sixty seconds, two heads and nothing comes loose.', picture: 'The box on the dinner table; then his hand on the button, the coarse head spinning in a gap with steam, the polish head.', effect: 'slow-mo 0.5× 2 s on the spinning head', source: drive(D.macro, 'button press, head spinning in a gap with steam, polish head') },
      { t: '20–26 s', tt: '0:20–0:26', label: 'HE SITS DOWN', intent: 'Then he sits down. With us. Every Sunday from now on. That is the whole routine.', picture: 'He pulls out his chair and sits at the head of the table, the grill behind the window with the lid closed.', effect: 'none', source: drive(D.mid, 'the griller sitting down at the table after cleaning'), ref: '050 sitting-down beat' },
      { t: '26–31 s', tt: '0:26–0:31', label: 'LOCK + CTA', intent: '999 kr, thirty days open purchase, lifetime warranty. Then the giver\'s line from §6 — the invitation.', picture: 'End card: Mastern on the grill edge, price, the two promises, button.', effect: 'none', source: drive(D.cta, 'the end card plate'), lat: 'none' },
    ],
    rules: ['**The Svensk Handel finding is written in words, never as a statistic on screen:** "de flesta pappor vill träffa sina barn och bli bjudna på middag". No percentages anywhere in the ad.'],
    learn: 'Whether the invitation frame (the experience) beats the product frame for adult children — and whether "he sits down with us" is a stronger ownership line than "sixty seconds".',
  },
  {
    nr: 306, kod: 'GT', title: 'Father\'s Day is in November — this gift shows in April',
    taggar: { vinkel: 'present / fars dag — vintern, vårens första grillning', hookTyp: 'föremål (grillen under överdraget / det rostiga gallret)', format: 'video, VO + b-roll, 3 hooks', proof: 'kundcitat Peter N. (gallret ruttet efter vintern) + Stefan E. + mekanism (frätande fett)', visuell: 'grillen under överdrag med löv och frost, rostflagor, sista draget före vintern, vårgallret', talare: 'sonen — manlig VO',
      komp: { typ: 'N', koncept: 'fd-april', kalla: 'voc', avatar: 'vuxet-barn', awareness: 'problem', begar: 'skydda-det-jag-ager', mekanism: 'säsongen som bevis: novemberpresenten, aprilbeviset — fettet som ligger kvar under vintern äter metallen', tro: 'det pappa gör i november avgör hur grillen ser ut i maj', hookMek: 'slider', confidence: 'medium', lardom: 'L-128' } },
    memo: 'A Father\'s Day gift used on the last grill of the season is the only gift whose proof arrives in spring — Peter N. found his grate "rotten after winter", the VOC mould trigger is real, and the 128 corrosion mechanism has never been told as a winter story.',
    ai: 'voice', lp: 'gift',
    why: 'Only 12 % of Swedes grill year-round (ICA/Sifo), so the November gift is used on the season\'s last clean or the first in spring; Peter N.\'s review ("gallret var ruttet efter vintern") and 128\'s "grease is corrosive" (ROAS 2,00–2,39) are the same story told six months apart.',
    whyLong: 'The giver\'s doubt about a grill brush in November is timing: the grill is going away. This brief turns the timing into the argument. Emotional act: the grill under its cover, leaves and frost, and the memory of the spring when the grate came out rusty. Functional act: what winter does to grease left in the gaps (corrosive, breaks the metal down from below, discoloration → rust → flaking) and the sixty-second last clean before the cover goes on. Ownership: the first grill of spring starts on a clean grate — the gift is remembered in April.',
    hypothesis: 'Season-as-proof (November gift, April evidence) converts the giver who thinks "wrong time of year for a grill gift" — and the winter story gives the 128 mechanism a new opening.',
    len: 32, narrator: 'Male VO — the son. Matter-of-fact, the tone of someone who has seen the rusty grate.',
    refAds: 'parent 128 H3 "Skydda investeringen" (ROAS 2,00 at 69 k) — Replicate: the corrosion progression (discoloration → rust → flaking), "femton år eller sju" / Do not replicate: the technician voice, the summer setting.',
    hooks: [
      { intent: 'Father\'s Day is in November. This gift shows in April. Object: the grill under its cover with wet leaves and frost.', picture: 'Macro of a grill cover with wet leaves and a rim of frost, dawn light; a hand brushes the leaves off.', first: 'the frosted cover with leaves.', effect: 'slider before/after 2 s (cover → spring grate)', source: NEW('a covered grill with leaves and frost in a Swedish garden, filmed by Axel in October/November') },
      { intent: 'Peter N.: took the grill out for Valborg and the grate was rotten after winter. Object: a rusty, flaking grate macro.', picture: 'Macro of a rusted, flaking grate bar, orange flakes, a fingernail lifting one; the review as caption with the name.', first: 'the rusty bar with a flake lifting.', effect: 'zoom-in 1 s', source: drive(D.broken, 'rusted, flaking grate macro') },
      { intent: 'The last thing dad does in November decides what the grill looks like in May. Object: the grill lid closing for the season.', picture: 'Macro of a hand closing the grill lid, then pulling the cover over it, cold breath visible.', first: 'the lid closing.', effect: 'cut-in', source: NEW('closing the lid and pulling the cover on, November, filmed by Axel') },
    ],
    beats: [
      { t: '3–9 s', tt: '0:03–0:09', label: 'WHAT WINTER DOES', intent: 'Grease left in the gaps does not sleep over winter. It is corrosive: it breaks the metal down from below. Discoloration in October, rust by Christmas, a flaking grate in May. The wire brush never reached it.', picture: 'Macro sequence in one gap: black crust → brown discoloration → rust → a flake lifting. Then the wire brush scraping only the top of the bars.', effect: 'slider before/after 2 s', source: drive(D.broken, 'rust progression on grate bars') + ' + ' + drive(D.problem, 'wire brush only on the top of the bars'), ref: '128 H3 corrosion progression' },
      { t: '9–14 s', tt: '0:09–0:14', label: 'THE GIFT', intent: 'So this year dad\'s Father\'s Day gift is the last clean before the cover goes on. Mastern. The box on the terrace table in November.', picture: 'The Mastern box opened on a terrace table, jacket sleeves, the grill lid open behind.', effect: 'none', source: NEW('unboxing on a terrace table in November light, filmed by Axel'), lat: 'none' },
      { t: '14–21 s', tt: '0:14–0:21', label: 'FUNCTION', intent: 'Warm grate, wet head, one button. The head spins down into the gaps, sixty seconds. Two heads, nothing comes loose. Then the cover goes on over a clean grate.', picture: 'Hand on the button, the coarse head spinning in a gap with steam, flakes lifting, the clean bars, the cover pulled over.', effect: 'slow-mo 0.5× 2 s on the spinning head', source: drive(D.macro, 'head spinning in a gap with steam, clean bars') },
      { t: '21–27 s', tt: '0:21–0:27', label: 'APRIL', intent: 'And in April he lifts the cover and the grate is the grate he closed. Stefan E. wrote that his neighbour asked how the grate looked so clean before Valborg and bought one a week later — verbatim with the name. A grill for fifteen thousand lasts fifteen years, not seven.', picture: 'The cover lifted in spring light, clean bars; the review card with the name.', effect: 'reverse 3 s (leaves blowing back off the cover) then cut-in', source: NEW('the cover lifted off a clean grill in spring light — shoot the "spring" shot on a bright day now, filmed by Axel'), ref: '050 quote-card style' },
      { t: '27–32 s', tt: '0:27–0:32', label: 'LOCK + CTA', intent: '999 kr, thirty days open purchase, lifetime warranty. Then the giver\'s line from §6.', picture: 'End card: Mastern on the grill edge, price, the two promises, button.', effect: 'none', source: drive(D.cta, 'the end card plate'), lat: 'none' },
    ],
    learn: 'Whether season-as-proof removes the "wrong time of year" objection — read the hook rate on H1 against the batch median first.',
  },
  {
    nr: 307, kod: 'GT', title: 'The grill technician on gifts — "give him what I wanted for thirty years"',
    taggar: { vinkel: 'auktoritet (teknikern) på present / fars dag', hookTyp: 'auktoritetshook (110 H2-strukturen) + kommentarssvar', format: 'video, talking-head-auktoritet + b-roll, 3 hooks', proof: 'teknikerns blick (springorna, seasoning mot skorpa) + återkallelserna i USA + mekanism', visuell: 'teknikern vid grillen, gallret vänds, makro på springan, kitet', talare: 'grillteknikern — manlig VO, samma persona som 110 (helst samma röst)',
      komp: { typ: 'I', koncept: 'fd-teknikern', parent: '110 H2', iteration: 'samma persona och ryggrad, ny uppgift: presentrådet', kalla: 'parent', avatar: 'partner-maria', awareness: 'problem', begar: 'skydda-det-jag-ager', mekanism: 'auktoriteten rapporterar vad han ser i springorna och ger givaren verktyget som svar', tro: 'proffset säger vad man ska ge — och det är inte en pryl utan ett verktyg', hookMek: 'cut-in', confidence: 'high', lardom: 'L-110' } },
    memo: 'The account\'s most-bought hook (110 H2, ~115 k kr) has never been pointed at a giver; the technician who has opened thousands of grills is the one voice that can tell a wife or a son what to give without it sounding like a sales pitch.',
    ai: 'voice', lp: 'product',
    why: '110 is the workhorse (ROAS 1,75–1,95 on ~115 k kr, most-bought hook) and L-198 says a hook proven on one body is worth testing on another; the technician giving gift advice is the same persona with a new job — and a persona that reports, never lectures, is the safest way past the self-improvement trap.',
    whyLong: 'The giver is not a griller. She/he needs someone who is. The technician persona has opened thousands of grills, looks at the gaps first, and can say the one thing a giver cannot: "this is the tool I wanted for thirty years". Emotional act: the authority moment (he flips the grate). Functional act: seasoning vs crust, what the wire brush does (flattens, sheds — Weber and Nexgrill recalled over thirteen million in the USA in 2026), and the gift as the tool: spins into the gaps, sixty seconds while warm, two heads. Close on "femton år eller sju — det avgörs efter varje grillning".',
    hypothesis: 'The proven authority hook transfers to the gift job (L-198: hooks that work across bodies are robust) and the technician\'s recommendation is the giver\'s permission to spend 999 kr.',
    len: 34, narrator: 'The grill technician — same persona (and ideally the same voice) as the running 110 family. Calm, reporting, never selling.',
    refAds: 'parent 110 H2 "Grillteknikern" (most-bought hook; brief `docs/briefs/GrillKliniken-110-B2-brief.md`) — Replicate: the flip-the-grate moment, the seasoning-vs-crust comparison shot, the reporting tone / Do not replicate: the season-sale offer, "Grillkliniken" spoken, the 40 % line.',
    hooks: [
      { intent: 'I have opened thousands of grills. If you want to give him something for Father\'s Day, give him what I wanted for thirty years. Object: the grate being flipped, macro into the gap.', picture: 'Macro of gloved hands flipping a "clean-looking" grate, camera into the gap: black crust. The technician\'s face is not in the first three seconds.', first: 'the flipped grate, the gap.', effect: 'cut-in', source: drive(D.problem, 'a grate flipped over, macro into the gaps') , ref: '110 B2 hook 1 structure' },
      { intent: 'Comment reply: "What do you give a dad who already has everything for the grill?" — This. And I will show you why. Object: the comment screenshot.', picture: 'A real-looking Swedish comment screenshot (name blurred) shown 1.5 s, then cut to the technician\'s hands at the grill.', first: 'the comment screenshot.', effect: 'freeze 1.5 s then cut-in', source: NEW('a staged comment screenshot, name blurred, built by the editor') , ref: '110 B2 hook 2 (comment reply)' },
      { intent: 'The owner always says: "it is clean, I look after it." Then I flip the grate. Object: the underside of the grate.', picture: 'Macro of the underside of a grate coming into view, crust in every gap.', first: 'the underside of the grate.', effect: 'zoom-in 1 s', source: drive(D.problem, 'underside of a grate, crust in the gaps'), ref: '110 hook-lab #9' },
    ],
    beats: [
      { t: '3–9 s', tt: '0:03–0:09', label: 'WHAT I SEE', intent: 'Black is not the problem — a smooth even black surface is seasoning. Black that flakes and builds in the gaps is old carbonised grease. It reheats every time he grills and blocks the contact that makes the sear. He cannot see the difference; I can.', picture: 'Two macros side by side: smooth black surface stroked by a thumb vs flaking crust in a gap with a fingernail lifting a flake.', effect: 'slider before/after 2 s', source: drive(D.problem, 'smooth seasoning surface vs flaking crust in a gap'), ref: '110 B2 seasoning comparison (mandatory shot)' },
      { t: '9–15 s', tt: '0:09–0:15', label: 'THE WIRE BRUSH', intent: 'His wire brush flattens and loses grip, and the harder he presses the more bristles it sheds onto the grate. Weber and Nexgrill recalled over thirteen million of them in the USA this year. It is not his fault — it is the tool.', picture: 'Macro of a wire brush flattening under pressure, then shed bristles on a dark grate.', effect: 'slow-mo 0.5× 2 s on the shed bristles', source: drive(D.old, 'wire brush under pressure, shed bristles on a dark grate') },
      { t: '15–23 s', tt: '0:15–0:23', label: 'THE TOOL', intent: 'So give him the tool. Mastern: the head spins four hundred revolutions a minute, round the whole bar and down into the gaps, sixty seconds while the grate is still warm. Two heads: the coarse one locks the metal in, the polish one has no metal at all. Nothing comes loose.', picture: 'The technician\'s hand presses the button; macro of the head spinning in a gap with steam; the two heads side by side.', effect: 'slow-mo 0.5× 2 s on the spinning head', source: drive(D.macro, 'head spinning in a gap with steam; two heads side by side') },
      { t: '23–29 s', tt: '0:23–0:29', label: 'FIFTEEN OR SEVEN', intent: 'A grill for fifteen thousand should last fifteen years. With a dirty grate it lasts maybe seven. It is decided in sixty seconds after every cookout — that is what you are giving him.', picture: 'A Napoleon in frame, the technician closes the lid; a rusted grate from the broken-grills folder for one second.', effect: 'cut-in', source: drive(D.grills, 'a premium grill, lid closing') + ' + ' + drive(D.broken, 'rusted grate, one second'), ref: '128 H3 close' },
      { t: '29–34 s', tt: '0:29–0:34', label: 'LOCK + CTA', intent: '999 kr, thirty days open purchase, lifetime warranty — if it breaks he gets a new one. Then the giver\'s line from §6 (the technician gives the giver the sentence to say).', picture: 'End card: Mastern on the grill edge, price, the two promises, button.', effect: 'none', source: drive(D.cta, 'the end card plate'), lat: 'none' },
    ],
    rules: ['**Same persona as 110.** He reports, never lectures; no salesman energy; "Grillkliniken" is never spoken (the 110 body says it — this one does not). The seasoning-vs-crust shot is mandatory in all three versions.'],
    learn: 'Whether the most-bought authority hook transfers to a giver audience — the direct test of L-198 on this account.',
  },
  {
    nr: 308, kod: 'GT', title: 'Three generations — grandpa taught dad, dad taught me, and this is for grandpa\'s meat',
    taggar: { vinkel: 'present / fars dag — arvet, smaken från barndomen', hookTyp: 'story (farfar → pappa → jag), föremål: farfars tång', format: 'video, VO + b-roll, 3 hooks', proof: 'mekanismen (fettet i springorna värms om, blockerar stekytan) + kundcitat Lars-Erik H.', visuell: 'gammal grilltång, pappas galler, springorna, fredagsröken över gården, lådan', talare: 'sonen — manlig VO, långsam',
      komp: { typ: 'I', koncept: 'fd-tre-generationer', parent: '101 H3', iteration: 'farfar-familjen som presentberättelse: sonen ger pappa det som bevarar farfars smak', kalla: 'parent', avatar: 'vuxet-barn', awareness: 'problem', begar: 'tillhorighet', mekanism: 'det sentimentala (Givi & Galak): presenten som bevarar en smak, sen mekanismen som förklarar var smaken försvann', tro: 'smaken från barndomen sitter i gallret, och den går att få tillbaka', hookMek: 'zoom-in', confidence: 'medium', lardom: 'L-101' } },
    memo: 'Givers avoid sentimental gifts out of fear of missing (Givi & Galak 2017) although recipients prefer them; the 101 family is the account\'s highest-CTR story, and a son giving his father the thing that brings back grandpa\'s Friday meat is that story told as a gift.',
    ai: 'voice', lp: 'gift',
    why: '101 "Farfar" is the account\'s CTR king (4,8–6,6 %, ~136 k kr) and the 65+ segment is 34 % of spend; the story has never been told from the giver\'s side, and the sentimental gift is the one givers under-give and recipients over-value.',
    whyLong: 'Emotional act: the Friday smell over the yard, grandpa\'s tongs, dad who grills the same way and cannot understand why it never tastes like grandpa\'s. Functional act (never the 34 % line): three summers of grease in the gaps reheat every time and block the contact that makes the sear — the wire brush never reached it. The gift: Mastern, into the gaps, sixty seconds. Ownership + sentiment: in spring he grills grandpa\'s meat again. The giver\'s line is "Den här är för farfars kött."',
    hypothesis: 'The sentimental gift frame (grandpa\'s taste) holds the 101 family\'s hook rate with a giver audience and converts the adult child who buys for a father over sixty.',
    len: 33, narrator: 'Male VO — the son. Slow, no hurry, the 101 register.',
    refAds: 'parent 101 H3 "Farfar" (highest CTR in the account; body in `docs/101-farfar-b2.md`) — Replicate: the Friday-smell memory, "det var aldrig köttet", the sniff-the-grate beat / Do not replicate: the Journal of Food Science line, "fem tusen i Norden", the full body length.',
    hooks: [
      { intent: 'Grandpa taught dad to grill on this. Dad taught me. Object: grandpa\'s old grill tongs, worn handle.', picture: 'Macro of a pair of old, worn grill tongs on a wooden table, initials scratched in the handle; a hand picks them up.', first: 'the old tongs.', effect: 'zoom-in 1 s', source: NEW('a pair of genuinely old grill tongs, filmed by Axel') },
      { intent: 'I asked dad why the meat never tastes like at grandpa\'s. He did not know. I found out. Object: dad\'s grate, macro into a gap.', picture: 'Macro into the gap of a used grate: black crust; a fingernail lifts a flake.', first: 'the gap with the crust.', effect: 'cut-in', source: drive(D.problem, 'macro into a grate gap, flake lifting') },
      { intent: 'Three summers of grease sit in the gaps of dad\'s grate. That is where grandpa\'s taste went. Object: the underside of the grate.', picture: 'Macro of the underside of a grate, crust in every gap, turned slowly toward the lamp.', first: 'the underside of the grate.', effect: 'freeze 0.5 s then zoom-in 1 s', source: drive(D.problem, 'underside of a grate turned toward light') },
    ],
    beats: [
      { t: '3–9 s', tt: '0:03–0:09', label: 'THE MEMORY', intent: 'Every Friday of my childhood the smell came over the yard and the neighbours found reasons to walk past the fence. Salt, pepper, high heat, patience. Dad grills exactly the same way. It never tastes the same.', picture: 'Smoke rising over a garden fence at dusk (memory, warm); then dad at his grill in November, same posture.', effect: 'cut-in', source: drive(D.mid, 'smoke over a fence at dusk; a griller at the grill'), ref: '101 body, the Friday memory' },
      { t: '9–15 s', tt: '0:09–0:15', label: 'WHERE IT WENT', intent: 'It was never the meat. Grease from every cookout sinks into the gaps and stays. It reheats every time, smokes, and lays itself between the meat and the metal — no contact, no sear. A wire brush scrapes the top and never reaches it.', picture: 'Macro: old grease smoking in a gap as the grill heats; meat laid on; the wire brush scraping only the top of the bars.', effect: 'slow-mo 0.5× 2 s on the smoke', source: drive(D.problem, 'grease smoking in a gap, wire brush on the top of the bars'), ref: '101 mechanism beat' },
      { t: '15–22 s', tt: '0:15–0:22', label: 'THE GIFT', intent: 'So this Father\'s Day I give him the thing that reaches down there. Mastern: one button, the head spins into the gaps while the grate is still warm, sixty seconds, two heads and nothing comes loose.', picture: 'The box opened on the kitchen table by dad\'s hands; then his hand on the button, the head spinning in a gap with steam.', effect: 'slow-mo 0.5× 2 s on the spinning head', source: NEW('dad opening the box, filmed by the son') + ' then ' + drive(D.macro, 'head spinning in a gap with steam') },
      { t: '22–28 s', tt: '0:22–0:28', label: 'SPRING', intent: 'In spring he grills grandpa\'s meat again, on a clean grate. Lars-Erik H. wrote: Weber Genesis grate from black to clean in ninety seconds — verbatim with the name.', picture: 'Clean bars, meat laid on with a sizzle; the review card with the name.', effect: 'none', source: drive(D.macro, 'clean bars, meat laid on') , ref: '050 quote-card style' },
      { t: '28–33 s', tt: '0:28–0:33', label: 'LOCK + CTA', intent: '999 kr, thirty days open purchase, lifetime warranty. Then the giver\'s line from §6: this one is for grandpa\'s meat.', picture: 'End card: Mastern on the grill edge, price, the two promises, button.', effect: 'none', source: drive(D.cta, 'the end card plate'), lat: 'none' },
    ],
    rules: ['**No "34 %", no Journal of Food Science, no customer counts.** The mechanism is told in words; the only numbers are the price and the review\'s ninety seconds.'],
    learn: 'Whether the sentimental gift frame holds the 101 family\'s hook rate with a giver audience — read hook rate on H1 against 101 H3\'s 5,7 % CTR only as diagnosis, never as the verdict.',
  },
  {
    nr: 309, kod: 'GT', title: 'He bought a grill for fifteen thousand — she gives him the thing that makes it last',
    taggar: { vinkel: 'present / fars dag — skydda investeringen (128) från givarens sida', hookTyp: 'föremål (grillen / rostflagan) + 128-raden', format: 'video, female VO + b-roll, 3 hooks', proof: 'mekanismen (frätande fett → rost → spjälkning) + femton år eller sju + billigare än ett nytt galler', visuell: 'premiumgrillen, rostflaga, springan, lådan, gallret', talare: 'kvinnlig VO — frun/sambon',
      komp: { typ: 'I', koncept: 'fd-grillen-for-15000', parent: '128 H3', iteration: 'investeringsvinkeln berättad av den som ser priset på grillen: frun', kalla: 'parent', avatar: 'partner-maria', awareness: 'problem', begar: 'skydda-det-jag-ager', mekanism: '999 kr mot en grill för femton tusen — rättfärdigandet (jobb 2 i tre-jobbsmodellen) från givaren', tro: 'presenten skyddar det dyraste han äger', hookMek: 'slow-mo', confidence: 'high', lardom: 'L-128' } },
    memo: 'The investment angle is the account\'s current workhorse (128 H3 ROAS 2,00–2,39; 235) and the one that justifies 999 kr — the wife knows exactly what the grill cost, and a gift that protects the most expensive thing he owns is the opposite of a self-improvement gift.',
    ai: 'voice', lp: 'product',
    why: '128 H3 (ROAS 2,00 at 69 k, 2,39 in July) moves the comparison from a hundred-kronor brush to a fifteen-thousand-kronor grill; told by the partner it becomes "I protect what he loves" — research 6 says that frame cannot read as criticism.',
    whyLong: 'Emotional act: she remembers the day the grill came, what it cost, how he looks after the car and the boat. Functional act (128 verbatim mechanism): grease is corrosive, it breaks the metal down from below — discoloration, rust, a flaking grate, seized burners; the wire brush scrapes the top and the gaps stay. The gift: sixty seconds after every grill night, into the gaps, two heads. Ownership: fifteen years, not seven — cheaper than one new grate. Giver\'s line: "Den här är för grillen du älskar."',
    hypothesis: 'The investment frame told by the giver keeps 128\'s conversion with a partner audience, because it makes the 999 kr a protection of his purchase rather than a comment on his cleaning.',
    len: 31, narrator: 'Female VO — the wife. Fond, factual.',
    refAds: 'parent 128 H3 "Skydda investeringen" — Replicate: "inbränt fett är frätande", the corrosion progression, "femton år eller sju" / Do not replicate: the male narrator, the technician title.',
    hooks: [
      { intent: 'My husband bought a grill for fifteen thousand. I am giving him the thing that makes it last. Object: the premium grill, macro on the brand emblem and the price tag memory (the receipt in a drawer).', picture: 'Macro of a Napoleon emblem on the lid, a hand wiping it; November light.', first: 'the emblem on the lid.', effect: 'cut-in', source: drive(D.grills, 'a premium grill emblem, macro') },
      { intent: 'This is not age. It is grease that was allowed to stay. Object: a rust flake lifting from a bar.', picture: 'Macro of an orange rust flake lifting from a grate bar under a fingernail.', first: 'the rust flake lifting.', effect: 'slow-mo 0.5× 2 s', source: drive(D.broken, 'rust flake lifting from a bar') },
      { intent: 'A grill for fifteen thousand should last fifteen years. With a dirty grate it lasts maybe seven. Object: two grills side by side — new and rusted.', picture: 'Split macro: a new grate bar (left) and a rusted, flaking bar (right), same light.', first: 'the split: new bar / rusted bar.', effect: 'slider before/after 2 s', source: drive(D.grills, 'new grate bar') + ' + ' + drive(D.broken, 'rusted grate bar'), ref: '128 H3 line as hook' },
    ],
    beats: [
      { t: '3–9 s', tt: '0:03–0:09', label: 'THE MECHANISM', intent: 'Burnt-on grease is corrosive. It breaks the metal down from underneath: discoloration becomes rust, rust becomes a grate that flakes and burners that seize. The wire brush scrapes the top; the gaps stay.', picture: 'Macro progression in a gap: crust → discoloration → rust → flake; then the wire brush on the top of the bars.', effect: 'slider before/after 2 s', source: drive(D.broken, 'rust progression') + ' + ' + drive(D.problem, 'wire brush on the top of the bars'), ref: '128 H3 mechanism' },
      { t: '9–14 s', tt: '0:09–0:14', label: 'HE DOES EVERYTHING RIGHT', intent: 'He covers it, he oils it, he scrubs it. It is not him — the brush cannot reach where the grease sits. This year I give him the one that can.', picture: 'His hands pulling a cover on, oiling a grate, scrubbing; then the Mastern box on the terrace table.', effect: 'cut-in', source: drive(D.mid, 'cover on, oiling, scrubbing') + ' then ' + NEW('the box on a terrace table in November, filmed by Axel') },
      { t: '14–21 s', tt: '0:14–0:21', label: 'FUNCTION', intent: 'One button. The head spins down into the gaps while the grate is still warm, sixty seconds after every grill night. Two heads: the coarse one locks the metal in, the polish one has no metal. Nothing comes loose.', picture: 'Hand on the button, the coarse head spinning in a gap with steam, flakes lifting, the polish head.', effect: 'slow-mo 0.5× 2 s on the spinning head', source: drive(D.macro, 'head spinning in a gap with steam; polish head') },
      { t: '21–26 s', tt: '0:21–0:26', label: 'FIFTEEN, NOT SEVEN', intent: 'Fifteen years instead of seven. Cheaper than one new grate. And he sits down with us while the grate is still warm.', picture: 'The premium grill with the lid closed, clean bars in macro, he sits down at the table.', effect: 'none', source: drive(D.mid, 'the griller sitting down after cleaning; clean bars'), ref: '128 H3 close' },
      { t: '26–31 s', tt: '0:26–0:31', label: 'LOCK + CTA', intent: '999 kr, thirty days open purchase, lifetime warranty. Then the giver\'s line from §6.', picture: 'End card: Mastern on the grill edge, price, the two promises, button.', effect: 'none', source: drive(D.cta, 'the end card plate'), lat: 'none' },
    ],
    rules: ['**"Femton tusen" and "femton år" are written in words**; the only figure on screen is 999 kr. Never a brand claim beyond "en Napoleon" / "en Weber" as the grill in picture.'],
    learn: 'Whether the investment justification, told by the partner, holds 128\'s conversion with a giver audience — the first partner-narrated 128.',
  },
  {
    nr: 310, kod: 'GT', title: 'It was never the meat — the polite "tasty" at dad\'s table, and the gift that ends it',
    taggar: { vinkel: 'present / fars dag — smaken (088) från barnets sida', hookTyp: 'föremål (tallriken / slaktarpåsen) + 088-raden', format: 'video, VO + b-roll, 3 hooks', proof: 'mekanismen (gammalt fett värms om, blockerar stekytan) + kundcitat Bertil L.', visuell: 'tallriken, slaktarpåsen, termometern, springan, lådan, stekytan', talare: 'dottern — kvinnlig VO',
      komp: { typ: 'I', koncept: 'fd-det-var-aldrig-kottet', parent: '088', iteration: 'smakskammen sedd av barnet vid bordet, presenten som svaret', kalla: 'parent', avatar: 'vuxet-barn', awareness: 'problem', begar: 'njutning', mekanism: 'det artiga gott (088) → orsaken i springorna → presenten som ger honom reaktionen han jagar', tro: 'pappa gör allt rätt; smaken satt i gallret, och den går att ge tillbaka', hookMek: 'freeze', confidence: 'medium', lardom: 'L-088' } },
    memo: '088 (ROAS 2,32–2,36) proved taste-shame beats hygiene; the adult child has said the polite "gott" at dad\'s table for years and can give him the reaction he is chasing — the giver gives the taste win, not a cleaning tool.',
    ai: 'voice', lp: 'gift',
    why: '088 is the second most profitable angle in the account and "det artiga gott" is its exact mechanism; the giver has been the one saying it, which makes the gift the end of a small lie rather than a comment on his grill.',
    whyLong: 'Emotional act: the family dinner, the good meat, the thermometer, and the "gott" everyone says a little too fast. Dad hears the difference. Functional act: it was never the meat — old grease in the gaps reheats, smokes, and lays itself between meat and metal; no contact, no sear; the wire brush never reached it. The gift: Mastern, into the gaps, sixty seconds while warm. Ownership: next dinner nobody says "gott" — somebody asks what he did to the grill (101\'s close). Giver\'s line: "Nästa gång säger ingen gott."',
    hypothesis: 'The taste angle converts a giver audience when the giver is the one who has been saying "gott" — the shame is shared, the fix is a gift.',
    len: 31, narrator: 'Female VO — the daughter. Affectionate, slightly guilty about the "gott".',
    refAds: 'parent 088 "Förstörd grillkväll" (ROAS 2,32–2,36) — Replicate: "det artiga gott", "det var aldrig köttet", the 101 close ("vad har du gjort med grillen?") / Do not replicate: the male narrator, any 34 % line.',
    hooks: [
      { intent: 'Dad blames the meat. It was never the meat. Object: a plate with a half-eaten steak, fork laid down.', picture: 'Macro of a plate: a good steak half eaten, the fork laid down beside it, candlelight.', first: 'the plate with the fork laid down.', effect: 'freeze 0.5 s then cut-in', source: NEW('a plated steak half eaten at a family table, filmed by Axel') },
      { intent: 'We say "gott" every time. The polite gott. Dad hears the difference. Object: the family\'s hands at the table, a plate passed.', picture: 'Macro of hands passing a plate across a set table, a glass raised, faces out of frame.', first: 'the plate being passed.', effect: 'cut-in', source: NEW('hands at a family dinner table, filmed by Axel or UGC creator Beerhansson') },
      { intent: 'Dad changed butcher three times. The problem sat in the grate. Object: a butcher\'s paper bag on the counter.', picture: 'Macro of a butcher\'s paper bag on a kitchen counter, a thermometer beside it.', first: 'the butcher\'s bag.', effect: 'zoom-in 1 s', source: NEW('a real butcher\'s bag and a meat thermometer on a counter, filmed by Axel') },
    ],
    beats: [
      { t: '3–8 s', tt: '0:03–0:08', label: 'HE DOES EVERYTHING RIGHT', intent: 'Good meat from a real butcher. The thermometer. He rests it. He does everything you are supposed to. And there is always something — a taste nobody can place, a sear that never quite comes.', picture: 'His hands: the thermometer in the meat, the meat resting, the lid opening on a grate that looks clean.', effect: 'cut-in', source: drive(D.mid, 'thermometer, meat resting, lid opening'), ref: '088 / 101 opening' },
      { t: '8–14 s', tt: '0:08–0:14', label: 'WHERE THE TASTE COMES FROM', intent: 'It was never the meat. Grease from the last three years sits in the gaps of the grate. It reheats every time, smokes, and lays itself between the meat and the metal. No contact, no sear. The wire brush never reached it.', picture: 'Macro: grease smoking in a gap as the grill heats; meat laid on a crusted grate; the wire brush on the top of the bars only.', effect: 'slow-mo 0.5× 2 s on the smoke', source: drive(D.problem, 'grease smoking in a gap, wire brush on the top of the bars'), ref: '101 mechanism beat' },
      { t: '14–21 s', tt: '0:14–0:21', label: 'THE GIFT + FUNCTION', intent: 'So this year: Mastern. One button, the head spins down into the gaps while the grate is still warm, sixty seconds, two heads and nothing comes loose. The box has everything.', picture: 'The box opened on the kitchen table; his hand on the button; the head spinning in a gap with steam; clean bars.', effect: 'slow-mo 0.5× 2 s on the spinning head', source: NEW('unboxing on a kitchen table, filmed by Axel') + ' then ' + drive(D.macro, 'head spinning in a gap with steam, clean bars') },
      { t: '21–26 s', tt: '0:21–0:26', label: 'NEXT DINNER', intent: 'Next dinner nobody says "gott". Somebody asks what he did to the grill. Bertil L. wrote: my arms always ached after a proper clean, now I do it in a minute — verbatim with the name.', picture: 'Meat laid on clean bars with a sizzle; faces at the table out of focus; the review card with the name.', effect: 'none', source: drive(D.macro, 'meat on clean bars with sizzle'), ref: '101 close: "vad har du gjort med grillen?"' },
      { t: '26–31 s', tt: '0:26–0:31', label: 'LOCK + CTA', intent: '999 kr, thirty days open purchase, lifetime warranty. Then the giver\'s line from §6.', picture: 'End card: Mastern on the grill edge, price, the two promises, button.', effect: 'none', source: drive(D.cta, 'the end card plate'), lat: 'none' },
    ],
    learn: 'Whether the taste angle survives the move from user to giver — 088\'s mechanism with a daughter\'s voice.',
  },
  {
    nr: 311, kod: 'GT', title: 'The tool — for the dad who looks after his tools and has time (the retired father)',
    taggar: { vinkel: 'present / fars dag — verktyget till hantverkaren, pensionären', hookTyp: 'föremål (hyveln / kniven på arbetsbänken)', format: 'video, VO + b-roll, 3 hooks, calm register (no speed claims)', proof: 'byggkvaliteten (två huvuden, låsmekanismen, diskmaskinen, USB) + livstidsgarantin + återkallelserna i USA', visuell: 'arbetsbänken, gamla verktyg, stålborsten, lådan, huvudet som lossas, gallret', talare: 'sonen — manlig VO, lugn, inga tidsord',
      komp: { typ: 'N', koncept: 'fd-verktyget', kalla: 'playbook', avatar: 'vuxet-barn', awareness: 'problem', begar: 'status', mekanism: 'identitetsbekräftande present (Ward & Broniarczyk): han tar hand om sina verktyg — ge honom ett verktyg byggt som hans andra; ritualen kvar, aldrig "spara tid"', tro: 'pappa vill inte ha hjälp vid grillen, han vill ha ett bättre verktyg', hookMek: 'cut-in', confidence: 'low', lardom: 'L-296' } },
    memo: 'For a retired father "save time" is the wrong promise (296: he is sixty-eight, he has time) — the promise is a tool built like the ones he has kept for forty years, and a present that affirms the craftsman is the opposite of the self-improvement gift that backfires.',
    ai: 'voice', lp: 'product',
    why: '65+ is 34 % of spend and the 296 insight (unlaunched) says the retired dad wants the ritual, not the minutes; the playbook\'s T8 (grandpa\'s tool principle: look after it right after use and it lasts forty years) is the frame that makes a 999-kronor brush a tool and not a gadget.',
    whyLong: 'Emotional act: dad\'s workbench, the plane he has had for forty years, the knife he sharpens — he looks after his tools. The one tool he does not is the one that looks after the grill, because a wire brush is not a tool worth keeping (it sheds, it cannot reach; recalls in the USA). Functional act told as build, not speed: two heads, the coarse one locks the metal, the polish one has no metal, the heads come off and go in the dishwasher, charged with a USB cable, lifetime warranty. The ritual: warm grate, wet head, slow passes, then he sits. No "snabbt", no "sextio sekunder", no "spara tid" — the LUGNT family\'s bans apply to this brief only.',
    hypothesis: 'A calm, build-quality, identity-affirming frame converts the 65+ recipient\'s adult child better than the sixty-second promise does — the one brief in the batch that tests the 296 insight with delivery.',
    len: 33, narrator: 'Male VO — the son. Slow, no hurry, the 294/299 register. No exclamation, no speed words.',
    refAds: 'none — new concept on this account. Reference text: 296 and 299 on branch `claude/grillkliniken-facebook-ads-3sb7it` (never delivered, L-296) — replicate the calm register and the "he has time" insight, do not replicate their hooks.',
    hooks: [
      { intent: 'Dad has had the same plane for forty years. He looks after his tools. Object: an old hand plane on a workbench.', picture: 'Macro of an old wooden hand plane on a workbench, oiled, a hand resting on it; garage light.', first: 'the plane on the bench.', effect: 'cut-in', source: NEW('a real old hand plane on a workbench, filmed by Axel') },
      { intent: 'The only tool dad does not look after is the one that looks after the grill. Object: a worn wire brush beside the grill.', picture: 'Macro of a worn, flattened wire brush hanging by the grill, bristles bent, rust on the handle.', first: 'the worn wire brush.', effect: 'zoom-in 1 s', source: drive(D.old, 'a worn, flattened wire brush by the grill') },
      { intent: 'Dad does not want help at the grill. He wants a better tool. Object: Mastern laid on the workbench among his tools.', picture: 'Macro of Mastern laid on the workbench between the plane and a sharpened knife.', first: 'Mastern among his tools.', effect: 'freeze 0.5 s then cut-in', source: NEW('Mastern on a workbench between real hand tools, filmed by Axel') },
    ],
    beats: [
      { t: '3–9 s', tt: '0:03–0:09', label: 'HIS PRINCIPLE', intent: 'His rule with everything: look after it right after you use it, and it lasts a lifetime. The plane, the knife, the boat. It is how grandpa did it too.', picture: 'His hands oiling the plane, wiping a knife, hanging a tool on its hook.', effect: 'cut-in', source: NEW('hands caring for hand tools in a garage, filmed by Axel'), ref: 'T8 in `docs/tof-idea-bank.md`' },
      { t: '9–15 s', tt: '0:09–0:15', label: 'THE ONE EXCEPTION', intent: 'The wire brush breaks his own rule: it cannot reach the gaps where the grease sits, and it sheds bristles — Weber and Nexgrill recalled over thirteen million of them in the USA this year. Not his fault. Not a tool worth keeping.', picture: 'Macro of the wire brush on the top of the bars, the untouched gap, shed bristles on the dark grate.', effect: 'slow-mo 0.5× 2 s on the shed bristles', source: drive(D.old, 'wire brush on the bars, shed bristles on a dark grate') },
      { t: '15–23 s', tt: '0:15–0:23', label: 'A TOOL BUILT LIKE HIS OTHERS', intent: 'Mastern is built the way he keeps things: two heads — the coarse one locks the metal in, the polish one has no metal at all; the heads come off and go in the dishwasher; charged with a USB cable; if it ever breaks he gets a new one, for life.', picture: 'Macro of the coarse head\'s locked bristles, the polish head, a head twisted off and set in a dishwasher rack, the USB cable in the box.', effect: 'cut-in', source: drive(D.heads, 'coarse head close-up, polish head, head twisted off') + ' + ' + NEW('a head in a dishwasher rack and the USB cable, filmed by Axel') },
      { t: '23–29 s', tt: '0:23–0:29', label: 'THE RITUAL', intent: 'Warm grate. Wet head. Slow passes over the bars. Then he sits down. The last thing he does before he sits — done the way he does everything else.', picture: 'His hand wets the head, slow passes over a warm grate with steam, he hangs it on its hook, sits down in the garden chair in November light.', effect: 'none', source: drive(D.macro, 'wet head, slow passes with steam') + ' then ' + drive(D.mid, 'the griller sitting down'), ref: '299 "sista sysslan" beat (branch)' },
      { t: '29–33 s', tt: '0:29–0:33', label: 'LOCK + CTA', intent: '999 kr, thirty days open purchase, lifetime warranty. Then the giver\'s line from §6: this one is for the toolbox.', picture: 'End card: Mastern on the grill edge, price, the two promises, button.', effect: 'none', source: drive(D.cta, 'the end card plate'), lat: 'none' },
    ],
    rules: ['**Calm register (LUGNT family, this brief only):** never "snabbt", "sextio sekunder", "på nolltid", "spara tid", "enkelt", "smart". The promise is the build and the ritual, not the minutes. No title "grilltekniker".'],
    learn: 'Whether the 65+ recipient\'s adult child buys the tool frame without a single speed claim — the first delivery test of the 296 insight.',
  },
  {
    nr: 312, kod: 'GT', title: '"Frun är nöjd att stålborsten försvann" — the wife\'s relief, in a customer\'s words',
    taggar: { vinkel: 'present / fars dag — hennes lättnad: inga strån i familjens mat', hookTyp: 'kundcitat på skärm (Rickard B.) / föremål (strået på gallret, borsten i soporna)', format: 'video, female VO + b-roll, 3 hooks', proof: 'kundcitat Rickard B., Mikael T., Stefan M. + återkallelserna (USA 2026) + låsmekanismen', visuell: 'recensionen på skärmen, ett strå mot mörkt galler, stålborsten i soporna, huvudena, lådan', talare: 'kvinnlig VO — frun/sambon',
      komp: { typ: 'N', koncept: 'fd-frun-ar-nojd', kalla: 'voc', avatar: 'partner-maria', awareness: 'problem', begar: 'halsa', mekanism: 'säkerheten som givarens lättnad (hon serverar också familjen), bevisad med kundernas ord — aldrig som skräckhook', tro: 'presenten tar bort en oro hon haft utan att säga det', hookMek: 'zoom-in', confidence: 'medium', lardom: 'L-049' } },
    memo: 'Safety is a retired main hook for the user but has never been told as the giver\'s relief — Rickard B. wrote "frun är nöjd att stålborsten försvann", Mikael T. found a bristle in his burger, and she is the one serving the family; the lock (049: trust, lifetime, thirty days) is what makes her buy.',
    ai: 'voice', lp: 'gift',
    why: 'The avatar research says Maria is reached through her safety need, 049 (trust) is the highest ROAS at scale, and three real reviews say the safety argument in the customers\' own words — as her relief, not as a scare.',
    whyLong: 'Emotional act: she serves the family too. She has seen the recall headlines, she has heard the burger story, and she has never said it out loud because it sounds like nagging. The gift lets her stop worrying without saying a word. Functional act: what comes loose from a wire brush (Weber and Nexgrill, over thirteen million recalled in the USA in 2026) and why nothing comes loose from Mastern (the coarse head locks the metal, the polish head has no metal) — then the part he cares about: the gaps, sixty seconds, he sits down. Lock: the gift cannot go wrong.',
    hypothesis: 'Safety told as the giver\'s relief in customers\' words converts Maria where safety as a scare hook is saturated — and the trust lock is what closes her.',
    len: 31, narrator: 'Female VO — the wife. Quiet relief, never alarm.',
    refAds: 'parent 049 "Trust/anti-scam" (highest ROAS at scale, 2,42–2,47) — Replicate: the lock (svenskt företag, livstidsgaranti, trettio dagar, "du får exakt vad du ser") / Do not replicate: any recall scare as the hook (playbook: saturated). B4 in `docs/winning-lines.md` is the proof line, not the hook.',
    hooks: [
      { intent: 'Rickard B.: "The wife is happy the wire brush is gone." Object: the review on the product page on a phone.', picture: 'Macro of a phone showing Rickard B.\'s four-star review, thumb pausing on the line.', first: 'the review on the phone.', effect: 'zoom-in 1 s', source: NEW('screen recording of Rickard B.\'s review on the product page') },
      { intent: 'This is what a customer found in his burger last summer. Object: a single steel bristle on a dark grate, macro.', picture: 'Macro of one thin steel bristle lying across a dark grate bar, barely visible until the light catches it.', first: 'the bristle on the dark bar.', effect: 'cut-in', source: drive(D.old, 'a single shed bristle on a dark grate, macro') },
      { intent: 'The old brush was recalled in the USA this spring. At ours it went in the bin on Father\'s Day. Object: the wire brush dropped into a bin.', picture: 'Macro of a wire brush dropped into a kitchen bin, lid closing.', first: 'the brush going into the bin.', effect: 'freeze 0.5 s then cut-in', source: NEW('a wire brush dropped into a bin, filmed by Axel') },
    ],
    beats: [
      { t: '3–9 s', tt: '0:03–0:09', label: 'HER RELIEF', intent: 'I serve the family too. I read about the recalls — Weber and Nexgrill, over thirteen million wire brushes in the USA this year — and I never said anything, because it sounds like nagging. He cannot see a bristle against a dark grate. Nobody can.', picture: 'Her hands setting plates; the bristle macro again; the wire brush on the grill edge.', effect: 'cut-in', source: NEW('hands setting a family table, filmed by Axel') + ' + ' + drive(D.old, 'shed bristles on a dark grate') },
      { t: '9–15 s', tt: '0:09–0:15', label: 'THE GIFT', intent: 'So this Father\'s Day he gets the one that cannot shed. Mastern: the coarse head locks the metal in, the polish head has no metal at all. Nothing comes loose, nothing ends up in the food.', picture: 'The box opened; macro of the coarse head\'s locked bristles, the polish head held up to the lamp.', effect: 'cut-in', source: NEW('unboxing on a kitchen table, filmed by Axel') + ' then ' + drive(D.heads, 'coarse head close-up, polish head to the light') },
      { t: '15–21 s', tt: '0:15–0:21', label: 'THE PART HE CARES ABOUT', intent: 'And the part he cares about: one button, the head spins down into the gaps while the grate is still warm, sixty seconds, and he sits down with us.', picture: 'His hand on the button, the head spinning in a gap with steam, flakes lifting, he sits down at the table.', effect: 'slow-mo 0.5× 2 s on the spinning head', source: drive(D.macro, 'head spinning in a gap with steam') + ' then ' + drive(D.mid, 'the griller sitting down') },
      { t: '21–26 s', tt: '0:21–0:26', label: 'IN THEIR WORDS', intent: 'Mikael T.: found a bristle in the burger last summer. Stefan M.: read about the Weber recall in February and threw the old brush away. Verbatim, with names.', picture: 'Two review cards over the clean grate, names visible.', effect: 'none', source: cdn(CDN.foto), ref: '050 quote-card style' },
      { t: '26–31 s', tt: '0:26–0:31', label: 'LOCK + CTA', intent: 'Swedish company, 999 kr, thirty days open purchase, lifetime warranty — the gift cannot go wrong. Then the giver\'s line from §6.', picture: 'End card: Mastern on the grill edge, price, the two promises, button.', effect: 'none', source: drive(D.cta, 'the end card plate'), lat: 'none' },
    ],
    rules: ['**Never a scare.** No hospital, no blood, no "farligt", no child eating. The bristle is shown once in macro; the tone is relief. Recalls always "i USA".'],
    learn: 'Whether safety works as the giver\'s relief where it is retired as the user\'s scare — and whether the trust lock is what converts Maria.',
  },
];

const STATICS = [
  {
    nr: 313, kod: 'GT', title: 'Everything in the box — wrap it as it is (the knolling static, gift-ready)',
    taggar: { vinkel: 'present / fars dag — hela kitet, färdig present', hookTyp: 'påstående (allt i lådan, slå in den som den är)', format: 'statisk knolling, riktigt foto', proof: 'varje del namngiven', offer: '999 kr small, ord. 1 600 kr as a drawn line, no percentage', visuell: 'knolling på mörk skiffer, varje del med etikett, band bredvid', text: 'rubrik + 5 etiketter + prisrad + sidfot', talare: 'ingen',
      komp: { typ: 'S', koncept: 'fd-hela-kitet', kalla: 'egen-data', avatar: 'vuxet-barn', awareness: 'product', begar: 'slippa-krangel', mekanism: 'B61-formatet (allt namngivet, liten badge) som presentbild', tro: 'presenten är färdig — ingenting att köpa till', hookMek: 'none', confidence: 'high', lardom: 'L-B061' } },
    memo: 'The account\'s best static ever is a knolling of the kit with a small badge (B61, ROAS 2,92); a gift buyer\'s first question is "what do I get", and a box that is a finished present answers it in one image.',
    lp: 'gift',
    why: 'B61 "HELA KITET INGÅR" is the best static in the account (2,92) and the gift page\'s section 5 says the kit "makes it a finished present" — nobody has put the two together.',
    whyLong: 'Knolling: the box open, every part laid out and labelled — Mastern, grovhuvud, polerhuvud, skyddshandskar, USB-kabel — with a ribbon beside the box. The headline says it is a finished present. The price is small, the compare-at a drawn line. Verify the exact kit contents against a real box before production.',
    hypothesis: 'The proven knolling format with a gift headline out-converts the same knolling with a discount headline for a giver audience (L-B061 vs L-B066).',
    photo: 'Real photo. The open Mastern box with every part laid out in a grid on dark slate (charcoal #141210), a ribbon beside the box. Product photos from Drive (' + D.photos + ') or a new knolling shot by Axel. Never generated.',
    layout: 'Headline top (two lines max). Five small labels in cream at the top of each item\'s cell, never over the item. Price bottom right, small; ord. 1 600 kr with a drawn line. Footer in smoke: the three promises.',
    texts: [
      { el: 'On-image headline', id: 'H', intent: 'Everything he needs is in the box. Wrap it as it is. — two short lines; no "present" as the first word.' },
      { el: 'Label 1', id: 'L1', intent: 'Mastern (the brush itself)' },
      { el: 'Label 2', id: 'L2', intent: 'the coarse head that locks the metal in — three words max' },
      { el: 'Label 3', id: 'L3', intent: 'the polish head without metal — three words max' },
      { el: 'Label 4', id: 'L4', intent: 'protective gloves' },
      { el: 'Label 5', id: 'L5', intent: 'USB cable — no charger to find' },
      { el: 'Price line', id: 'P', intent: '999 kr · ord. 1 600 kr (the compare-at struck with a drawn line, not the word)' },
      { el: 'Footer', id: 'F', intent: '30 dagars öppet köp · livstidsgaranti · fri frakt inom Sverige' },
    ],
    design: ['Knolling on dark slate, one light source from top-left, no props except the ribbon.', 'Labels at the top of each cell in the same inset; nothing over the product.', 'The ribbon is the only "gift" cue — no bows on the product, no wrapping paper over it.', 'Export 4:5 and 1:1; the 1:1 crops the footer, not the labels.'],
    ref: 'B61 "HELA KITET INGÅR" (ROAS 2,92; `docs/mastern-static-analys.md`) — replicate the grid and the labelling; do not replicate the "40 % RABATT" of B69/B66.',
    learn: 'Whether the gift headline holds B61\'s conversion — the cleanest static test in the batch.',
  },
  {
    nr: 314, kod: 'GT', title: 'Three siblings, one gift — 333 kr each',
    taggar: { vinkel: 'present / fars dag — syskonen går ihop', hookTyp: 'påstående (tre syskon, en present, tredjedelen)', format: 'statisk, produktfoto + tre rader', proof: 'räkningen 999 ÷ 3', offer: '999 kr open, the split as arithmetic, no percentage', visuell: 'Mastern-lådan med tre händer på / tre namnlappar', text: 'rubrik + underrad + prisrad + sidfot', talare: 'ingen',
      komp: { typ: 'S', koncept: 'fd-syskonen', kalla: 'swipe', avatar: 'syskonen', awareness: 'product', begar: 'spara-pengar', mekanism: '244-kronorssnittet: 999 kr blir rimligt delat på tre — prisankaret från givarens sida', tro: 'en present tillsammans slår tre små var för sig', hookMek: 'none', confidence: 'medium', lardom: 'L-B020' } },
    memo: 'The average Swedish Father\'s Day gift is 244 kr; 999 kr is only a partner\'s or a pooled gift, and no ad in the account has ever said the pooled price out loud — an angle static with an open price is the format that wins (B020, 2,53).',
    lp: 'gift',
    why: 'Svensk Handel\'s 244 kr average means the 999 kr price needs a frame for adult children; "we went in together" is how siblings already buy big gifts, and B020 proved an angle static with the open price beats discount statics.',
    whyLong: 'One image: the Mastern box on a table with three gift tags (three first names written by hand, no real people\'s names — use "Anna", "Erik", "Lisa" or blank tags with hand-drawn initials). Headline: three siblings, one gift. Sub: 333 kr each. Price 999 kr open. The arithmetic is the argument — a giver\'s price anchor, not a discount.',
    hypothesis: 'Saying the pooled price converts adult children who would not spend 999 kr alone — and the open price keeps B020\'s qualifying CTR.',
    photo: 'Real photo of the Mastern box on a kitchen table with three hand-written gift tags tied to it. Never generated. Product photos from Drive (' + D.photos + ') if the box shot is not possible — then the tags are composed in PIL as flat paper labels.',
    layout: 'Headline top, two lines. Sub-line under it. Price bottom right, open, no line-through. Footer in smoke.',
    texts: [
      { el: 'On-image headline', id: 'H', intent: 'Three siblings. One gift. — short, declarative' },
      { el: 'Sub-line', id: 'S', intent: '333 kr each — and dad gets the thing he uses every weekend (the arithmetic 999 ÷ 3 written as "333 kr var")' },
      { el: 'Price line', id: 'P', intent: '999 kr (open price, no compare-at on this one)' },
      { el: 'Footer', id: 'F', intent: '30 dagars öppet köp · livstidsgaranti · fri frakt inom Sverige' },
    ],
    design: ['The three tags are the visual hook: hand-written, slightly different handwriting, tied with string.', 'No people, no hands in the 1:1 crop; hands are allowed in 4:5 only as three hands on the box edge.', 'Calm, no red, no badge.'],
    ref: 'B020 (angle static, open price, ROAS 2,53, lowest CTR — `docs/mastern-static-analys.md`) — replicate the "one angle, open price" formula; do not replicate B66\'s discount area.',
    rules: ['**"333 kr var" is arithmetic on the live price (999 ÷ 3), not a second price.** It is the only extra kronor amount allowed in this brief; never round it, never write "ca".'],
    learn: 'Whether the pooled-price frame unlocks the adult-child audience at 999 kr.',
  },
  {
    nr: 315, kod: 'GT', title: 'The gift that cannot go wrong — the trust static for the partner',
    taggar: { vinkel: 'trygghet (049) som presentargument', hookTyp: 'påstående (presenten som inte kan bli fel)', format: 'statisk produkt på ren bakgrund + tre löften', proof: 'butikens tre löften + svenskt företag', offer: '999 kr small, no compare-at', visuell: 'Mastern ensam på cream-bakgrund, tre rader', text: 'rubrik + tre löftesrader + prisrad', talare: 'ingen',
      komp: { typ: 'S', koncept: 'fd-kan-inte-bli-fel', kalla: 'winning-line', avatar: 'partner-maria', awareness: 'product', begar: 'trygghet', mekanism: 'låset (049) som hela annonsen: svenskt företag, trettio dagar, livstid, fri frakt', tro: 'jag kan inte ge fel present — den går att skicka tillbaka och den håller', hookMek: 'none', confidence: 'medium', lardom: 'L-049', urgency: 'ingen' } },
    memo: '049 is the highest ROAS at scale and the avatar research says Maria buys on trust; a static that is nothing but the lock — thirty days, lifetime, Swedish company, free shipping — is the ad the partner needs and the account has never run.',
    lp: 'product',
    why: 'Trust converts best in scale on this account (049, 2,42–2,47) and the partner\'s fear is giving the wrong thing; the 240 footer "presenten kan inte bli fel" never got delivery — as a clean static it gets its test.',
    whyLong: 'Product alone on a cream background, three promise lines, headline "the gift that cannot go wrong". No story, no scene. The point is calm: it does not look like a sale. Rules from 049: "du får exakt vad du ser", Swedish company, thirty days, lifetime — never "14 dagar", never a percentage.',
    hypothesis: 'A pure trust static converts the partner audience at a lower CPA than any story video, because her objection is risk, not interest.',
    photo: 'Real product photo (CDN ' + CDN.foto + ' or Drive ' + D.photos + '), cut out, on cream #F4EFE7. Never generated.',
    layout: 'Headline top in charcoal. Product centred. Three promise lines under it, each with a small check mark in ember. Price bottom, small. No badge.',
    texts: [
      { el: 'On-image headline', id: 'H', intent: 'The gift for him that cannot go wrong — do not open with the word present; e.g. lead with "honom" or with the promise' },
      { el: 'Promise line 1', id: 'P1', intent: '30 dagars öppet köp — exactly as the store writes it' },
      { el: 'Promise line 2', id: 'P2', intent: 'livstidsgaranti — går den sönder får han en ny' },
      { el: 'Promise line 3', id: 'P3', intent: 'svenskt företag, fri frakt inom Sverige, du får exakt det du ser' },
      { el: 'Price line', id: 'P', intent: '999 kr' },
    ],
    design: ['Whitespace is the design. Nothing moves, nothing shouts.', 'The three check marks are the only accent colour.', '1:1 keeps all three lines; shrink the product, not the text.'],
    ref: '049 "Trust/anti-scam" (`docs/winning-lines.md` C1, C2, S2) — replicate the three promises verbatim in spirit; do not replicate any recall or scare line.',
    learn: 'Whether trust alone sells to the partner — the cheapest test of the avatar research\'s Maria hypothesis.',
  },
  {
    nr: 316, kod: 'SP', title: '"Normally a job I put off for half an hour" — Christer F.\'s half hour, given back',
    taggar: { vinkel: 'social proof — kundcitat i tidsenheter, som present', hookTyp: 'citatkort (Christer F.)', format: 'statisk citatkort + produktbild', proof: 'kundcitat Christer F. ordagrant med namn', offer: '999 kr small', visuell: 'citat stort på charcoal, Mastern liten, namnet', text: 'citat + rubrik + prisrad + sidfot', talare: 'ingen (kundens ord)',
      komp: { typ: 'S', koncept: 'fd-halvtimmen', kalla: 'voc', avatar: 'partner-maria', awareness: 'problem', begar: 'spara-tid', mekanism: 'kundens före/efter i tid (050-formeln) + Whillans: tid är presenten', tro: 'jag ger honom en halvtimme tillbaka varje grillkväll', hookMek: 'none', confidence: 'high', lardom: 'L-050' } },
    memo: 'The best quote card in the account (050, ROAS 2,12) was a customer\'s before/after in minutes; Christer F. wrote the same sentence on the product page, and "buying time" is the purchase that research says makes people happiest — so the gift is the half hour.',
    lp: 'gift',
    why: '050 proved the customer\'s own minutes sell (2,12) and Christer F.\'s review is that sentence verbatim; Whillans 2017 says time-saving purchases raise life satisfaction more than material ones — the half hour is the gift, not the brush.',
    whyLong: 'Quote card: the review large, the name under it, Mastern small in the corner, headline "give him the half hour back". The gift page\'s CTA is literally "Ge bort halvtimmen". Verbatim quote, name exactly as on the page. If Axel says the initial-name reviews are imported, use Bertil L. or Lennart Olsson instead.',
    hypothesis: 'A customer\'s minutes, framed as the thing the giver gives, converts at 050\'s level for a giver audience.',
    photo: 'Charcoal #141210 background, the quote in cream, Mastern (real photo, CDN ' + CDN.foto + ') small bottom right. Never generated.',
    layout: 'Quote biggest, name and rating under it in smoke, headline above in ember, price small bottom left, footer.',
    texts: [
      { el: 'Quote (verbatim)', id: 'Q', intent: 'Normalt ett jobb jag skjuter upp i en halvtimme. Nu tar det knappt en minut. — exactly as on the product page, with the name "Christer F." and five stars' },
      { el: 'On-image headline', id: 'H', intent: 'Give him the half hour back. — short, present tense' },
      { el: 'Price line', id: 'P', intent: '999 kr' },
      { el: 'Footer', id: 'F', intent: '30 dagars öppet köp · livstidsgaranti · fri frakt inom Sverige' },
    ],
    design: ['The quote is the image. Typography does the work; no photo behind the text.', 'Five stars small, in smoke, never in yellow.', 'The name exactly as on the product page.'],
    ref: '050 "Kundcitat" quote card (ROAS 2,12; `docs/winning-lines.md` S1) — replicate the layout; the quote is new.',
    learn: 'Whether the time-gift frame works with a real review — and whether the imported-review question changes anything (swap and re-run if it does).',
  },
  {
    nr: 317, kod: 'GT', title: 'Order by the 19th of October — the honest deadline static',
    taggar: { vinkel: 'present / fars dag — sista beställningsdag', hookTyp: 'påstående (datum) — ärlig brådska ur leveranstiden', format: 'statisk produkt + datum', proof: 'butikens fraktlöfte (fem till nio arbetsdagar)', offer: '999 kr small, no percentage', visuell: 'Mastern stor, datumet litet, november-ljus', text: 'rubrik + datumrad + prisrad + sidfot', talare: 'ingen',
      komp: { typ: 'S', koncept: 'fd-sista-dagen', kalla: 'egen-data', avatar: 'partner-maria', awareness: 'promo', begar: 'slippa-krangel', mekanism: 'den enda konkreta brådskan som är sann: leveranstiden — datumet litet, produkten stor (L-B066)', tro: 'beställer jag nu finns den på bordet den åttonde', hookMek: 'none', confidence: 'medium', lardom: 'L-B066' } },
    memo: 'The only Father\'s Day hook that ever got spend paired the holiday with a concrete reason (277, "vi beställde för många", 10 169 kr, ROAS 1,95); the honest concrete reason in October is the delivery window — and B66 taught us to keep the urgency small and the product big.',
    lp: 'product',
    why: 'Five to nine business days means the 26th of October is the last day the store\'s own promise reaches the 6th of November, and the measured p90 says the 19th is the safe date; 277 proved holiday + concrete reason gets delivery, B66 proved a shouting offer eats ROAS.',
    whyLong: 'Product big, the date small. Headline: order by the 19th of October and it is on the table on the 8th of November. The date is a field Axel confirms: 19 October (measured p90 ≈ 20 days) is the default; 26 October only if Axel confirms Grillkliniken holds nine business days. From 20 October the date changes or the ad is paused; from 27 October the ad is paused. No countdown, no "last chance".',
    hypothesis: 'An honest delivery deadline is the one urgency line that converts a giver without the discount penalty — the season is the reason.',
    photo: 'Real product photo (Drive ' + D.photos + ' or CDN ' + CDN.hero + '), Mastern large on charcoal with a hint of November window light composed behind (generated background allowed, product never generated).',
    layout: 'Product 60 % of the frame. Headline above in cream. The date line under the headline in ember, small. Price bottom right. Footer.',
    texts: [
      { el: 'On-image headline', id: 'H', intent: 'Order by the 19th of October, and it is on the table on the 8th of November. — the date is the confirmed field, written as "19 oktober"' },
      { el: 'Date line', id: 'D', intent: 'Fri frakt inom Sverige, fem till nio arbetsdagar — the store\'s own words' },
      { el: 'Price line', id: 'P', intent: '999 kr' },
      { el: 'Footer', id: 'F', intent: '30 dagars öppet köp · livstidsgaranti' },
    ],
    design: ['The date is small. If it reads as a sale banner, it is wrong.', 'No clock, no hourglass, no red.', 'Two versions of the file: "19 oktober" (default) and "26 oktober" (only on Axel\'s confirmation).'],
    ref: 'B71 (handwritten "vi beställde för många" tag, ROAS 2,64–2,86) for a concrete reason in picture; B66 (ROAS 1,74) for what not to do.',
    rules: ['**The date is confirmed by Axel before production.** Default "19 oktober" (measured p90 ≈ 20 days, `docs/os/EPOST-STRATEGI.md`); "26 oktober" only if Grillkliniken holds the nine business days on the product page. This is the ONLY brief in the batch allowed to promise a delivery date. Pause on the date it names + 1 day.'],
    learn: 'Whether an honest deadline converts a giver without the discount penalty — and how much of the batch\'s volume lands in the last week before the date.',
  },
  {
    nr: 318, kod: 'GT', title: 'The mug stands in the cupboard — this one stands by the grill',
    taggar: { vinkel: 'present / fars dag — klichén mot den som används (split)', hookTyp: 'kontrast (muggen i skåpet / Mastern vid grillen)', format: 'statisk split 50/50, riktiga foton', proof: 'kontrasten själv + Ipsos i ord', offer: '999 kr open', visuell: 'vänster: muggen längst bak i skåpet; höger: Mastern på kroken vid grillen', text: 'rubrik i två halvor + prisrad + sidfot', talare: 'ingen',
      komp: { typ: 'S', koncept: 'fd-muggen', kalla: 'swipe', avatar: 'vuxet-barn', awareness: 'problem', begar: 'status', mekanism: 'B020-formeln (en vinkel, split, öppet pris) på klichépresenten', tro: 'den present som används är den enda som räknas', hookMek: 'none', confidence: 'medium', lardom: 'L-B020' } },
    memo: 'B020 — a split image with one angle and the open price — is the account\'s best angle static (2,53), and the mug is the measured least-wanted Father\'s Day gift; the split of "in the cupboard" vs "by the grill" is the 303 story in one frame.',
    lp: 'gift',
    why: 'B020\'s split formula (old brush vs Mastern, open 999 kr, ROAS 2,53) has never been applied to the gift; the mug is the least-wanted gift for one father in six (Ipsos) and every adult child recognises the cupboard.',
    whyLong: 'Left half: a "VÄRLDENS BÄSTA PAPPA" mug at the back of a cupboard, dusty light. Right half: Mastern on its hook by the grill, November light. Headline split across the two halves. Price open. Same camera height, same light temperature so the split reads as one scene (framework-bildannonser steg 4.3).',
    hypothesis: 'The cupboard/grill split converts adult children on recognition alone, at B020\'s qualifying CTR.',
    photo: 'Two real photos: a printed dad-mug at the back of a real cupboard (shot by Axel) and Mastern on a hook by a real grill (Drive ' + D.photos + ' or new). Never generated. Same lens, same height.',
    layout: '50/50 vertical split. Headline as two half-lines, one per half, top. Price bottom right on the right half. Footer across.',
    texts: [
      { el: 'Headline left half', id: 'HL', intent: 'The mug stands in the cupboard. — over the mug' },
      { el: 'Headline right half', id: 'HR', intent: 'This one stands by the grill. — over Mastern' },
      { el: 'Sub-line', id: 'S', intent: 'One father in six says the mug is the gift he wants least — in words, no percent sign' },
      { el: 'Price line', id: 'P', intent: '999 kr' },
      { el: 'Footer', id: 'F', intent: '30 dagars öppet köp · livstidsgaranti · fri frakt inom Sverige' },
    ],
    design: ['The mug must be a generic "världens bästa pappa" print — no brand, no shop.', 'Dust and dim light left, clean November light right; the contrast is light, not colour grading tricks.', 'No people.'],
    ref: 'B020 (`pipeline/b020-format.mjs`: black top band with headline → 50/50 split photo → italic footer → price pill) — replicate the structure; the subjects are new.',
    learn: 'Whether the cliché-contrast reads instantly (thumbnail test) and converts at B020\'s level for a giver audience.',
  },
  {
    nr: 319, kod: 'SP', title: '"Bought one for my big brother and one for my father-in-law for Father\'s Day" — Johan E.',
    taggar: { vinkel: 'social proof — presentköparen i kundens ord', hookTyp: 'citatkort (Johan E.)', format: 'statisk citatkort + produktbild', proof: 'kundcitat Johan E. ordagrant med namn', offer: '999 kr small', visuell: 'citat stort, två lådor i bild, namnet', text: 'citat + rubrik + prisrad + sidfot', talare: 'ingen (kundens ord)',
      komp: { typ: 'S', koncept: 'fd-svarfar', kalla: 'voc', avatar: 'vuxet-barn', awareness: 'product', begar: 'trygghet', mekanism: 'en annan givare har redan gjort valet (Gino & Flynn: den efterfrågade presenten) — bevis, inte påstående', tro: 'andra har gett den till sina pappor och alla blev nöjda', hookMek: 'none', confidence: 'medium', lardom: 'L-050' } },
    memo: 'The single best proof a gift buyer can get is another gift buyer: Johan E. bought one for his brother and one for his father-in-law for Father\'s Day and wrote "alla nöjda" — a real review on the product page, never used in an ad.',
    lp: 'gift',
    why: 'Quote cards work on this account (050, 2,12) and Johan E.\'s review is the only piece of proof in the account written by a Father\'s Day giver; it removes the giver\'s doubt in one sentence.',
    whyLong: 'Quote card: the review large, the name, five stars. Two Mastern boxes in the corner (the brother\'s and the father-in-law\'s). Headline: two dads in the family, one gift. If Axel says the initial-name reviews are imported, this brief is paused — there is no organic substitute for a giver\'s review.',
    hypothesis: 'A giver\'s review converts gift buyers better than a user\'s review, because it answers "will it be appreciated" instead of "does it work".',
    photo: 'Charcoal background, the quote in cream, two real Mastern boxes (Drive ' + D.photos + ' or a new photo by Axel) small bottom right. Never generated.',
    layout: 'Quote biggest, name and stars under it, headline above in ember, price small bottom left, footer.',
    texts: [
      { el: 'Quote (verbatim)', id: 'Q', intent: 'Köpte en till storebror och en till svärfar inför Fars dag. Alla nöjda. — exactly as on the product page, with the name "Johan E." and five stars' },
      { el: 'On-image headline', id: 'H', intent: 'Two dads in the family. One gift. — or a variant that keeps "svärfar"' },
      { el: 'Price line', id: 'P', intent: '999 kr' },
      { el: 'Footer', id: 'F', intent: '30 dagars öppet köp · livstidsgaranti · fri frakt inom Sverige' },
    ],
    design: ['Typography-led like 316; the two boxes are the only image.', 'The review is quoted exactly, including "Fars dag" with the capital F as the customer wrote it.'],
    ref: '050 quote card (ROAS 2,12) — replicate the layout; the quote is a giver\'s.',
    rules: ['**If Axel says the initial-name reviews are imported, pause this brief.** It has no organic substitute; do not invent a giver quote.'],
    learn: 'Whether a giver\'s review outperforms a user\'s review (316) for the same audience — the two quote cards are a paired test.',
  },
  {
    nr: 320, kod: 'CS', title: 'Fifteen years or seven — you decide what he gets this year (the investment static)',
    taggar: { vinkel: 'skydda investeringen (128) som static, givarens val', hookTyp: 'kontrast (nytt galler / rostigt galler) + 128-raden', format: 'statisk split 50/50, riktiga foton', proof: 'kontrasten + mekanismen i en rad', offer: '999 kr open, "billigare än ett nytt galler" in words', visuell: 'vänster: blankt galler; höger: rostigt, spjälkat galler', text: 'rubrik + underrad + prisrad + sidfot', talare: 'ingen',
      komp: { typ: 'S', koncept: 'fd-15-eller-7', parent: '309', kalla: 'parent', avatar: 'partner-maria', awareness: 'problem', begar: 'skydda-det-jag-ager', mekanism: 'investeringsvinkeln i ett split — den första staticen någonsin på kontots näst starkaste vinkel', tro: 'presenten avgör om grillen håller femton år eller sju', hookMek: 'none', confidence: 'medium', lardom: 'L-128' } },
    memo: '"Not one static runs the investment angle" is the biggest untapped opportunity in `docs/mastern-static-analys.md`; the split of a clean bar and a rusted bar with the 128 line is that static, and the giver is the one who decides which one he gets.',
    lp: 'product',
    why: '128 H3 (ROAS 2,00–2,39) has only ever existed as video and the static analysis names the investment static as the account\'s biggest gap; a giver reads "fifteen or seven" as her choice.',
    whyLong: 'Left half: a clean grate bar in macro. Right half: a rusted, flaking bar. Headline: fifteen years or seven. Sub: the choice is the giver\'s this year. Price open; "billigare än ett nytt galler" in words (no second amount). Validates 309 as a static.',
    hypothesis: 'The investment angle converts as a static at 128\'s level, and the giver frame ("you decide what he gets") turns it into a gift ad without a scene.',
    photo: 'Two real macros: a clean grate bar (Drive ' + D.macro + ' still or CDN ' + CDN.hf2 + ') and a rusted, flaking bar (Drive ' + D.broken + ' still). Same light, same angle. Never generated.',
    layout: '50/50 vertical split, headline as two half-lines top ("Femton år." / "Eller sju."), sub-line across the bottom third, price bottom right, footer.',
    texts: [
      { el: 'Headline left half', id: 'HL', intent: 'Fifteen years. — over the clean bar' },
      { el: 'Headline right half', id: 'HR', intent: 'Or seven. — over the rusted bar' },
      { el: 'Sub-line', id: 'S', intent: 'Grease left in the gaps is corrosive. This year you decide what he gets. — two short sentences' },
      { el: 'Price line', id: 'P', intent: '999 kr — cheaper than one new grate (in words, no amount)' },
      { el: 'Footer', id: 'F', intent: '30 dagars öppet köp · livstidsgaranti · fri frakt inom Sverige' },
    ],
    design: ['The two bars must read as the same bar six years apart — same framing, same light.', 'No product in the 1:1 crop is acceptable; Mastern small bottom left in 4:5.', 'No red except the rust itself.'],
    ref: 'B020 split structure + 128 H3 line ("femton år eller sju"); `docs/mastern-static-analys.md` "Den största outnyttjade möjligheten".',
    learn: 'Whether the investment angle finally works as a static — and whether it holds with a giver frame.',
  },
];

for (const s of VIDEOS) {
  const dir = join(ROT, 'video-ads-briefs', `Mastern_${s.kod}_${s.nr}_H1`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'brief.md'), videoBrief(s));
  console.log('skrev', dir);
}
for (const s of STATICS) {
  const dir = join(ROT, 'image-ads-briefs', `Mastern_${s.kod}_${s.nr}_1`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'brief.md'), staticBrief(s));
  console.log('skrev', dir);
}
console.log('klart:', VIDEOS.length, 'video +', STATICS.length, 'statiska');
