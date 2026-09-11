#!/usr/bin/env node
// Bygger batch #1:s briefer ur copy-JSON:erna (fable + sonnet) och
// metadatan nedan. Körs från repo-roten:
//   node products/tankguard/batch-01/bygg-briefer.mjs
// Skriver <video|image>-ads-briefs/<namn>/brief.md + manifest.json.
// Strategin (hypotes, variabler, källa) är huvudsessionens; copyn är
// subagentens och skrivs in ordagrant — aldrig omskriven här.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = dirname(fileURLToPath(import.meta.url));
const DATUM = '2026-09-12';
const LP = 'https://tankguard.se/products/tankoverdraget';

const copy = {};
for (const m of ['fable', 'sonnet']) {
  const j = JSON.parse(readFileSync(join(HÄR, `copy-${m}.json`), 'utf8'));
  for (const b of j.briefer) copy[b.namn] = { ...b, copy_modell: m };
}

const META = {
  TankGuard_PD_7_H1: {
    titel: 'Hook swap on the inherited PD_1 film — the problem in the customer\'s words',
    typ: 'video', modell: 'fable',
    taggar: 'vinkel=`produktdemo (PD)` · hook-typ=`problem i kundens ord (grönt regnvatten)` · format=`video, VO + demo (omklipp av PD_1)` · proof=`mekanism (210D, ljuset ute)` · offer-i-creativen=`pris bara på end card` · visuell stil=`produktdemo, händer, tanken` · textmängd=`≤5 ord per caption` · talare=`röst utan ansikte`',
    foralder: 'Variant of the inherited **IBC PD_1_H1** (source store: 16 997 kr, 77 purchases, ROAS 2,92 — 87 % of the source campaign\'s spend). Isolated variable: **the hook (00:00–00:03)**. Control = the original opening "Har du en IBC-tank i trädgården? Titta på det här." (TankGuard_PD_1_H1, 29 kr so far, flagged WITH_ISSUES). Sibling **PD_7_H2** opens with the cause.',
    varfor: 'The inherited winner is the whole source campaign, but on TankGuard it has had 29 kr and a hook rate of 20,5 % while the GT videos got 26–37 %. Cheapest lesson in the system (creative-strategy §3): same film, new three seconds. This variant moves the primary-text line that carried the spend ("Trött på grönt, algfyllt regnvatten?") into the first frame.',
    format: [
      ['Source', 'The inherited PD_1 film (source ad IBC_PD_1_H1 on Bäverbutiken; the TankGuard re-cut exists as TankGuard_PD_1_H1 in the OPS account, ad id 120249012… — ask Axel for the master file if it is not in the Drive). ⚠️ The source audio and the burned-in end card say "Bäverbutiken" — every TankGuard version must be re-voiced from `factory/output/tankguard/srt-se/PD_1_H1.srt` and carry the TankGuard end card (`factory/output/tankguard/video-se/endcard-overlay.png`).'],
      ['Length', 'Same as PD_1 (~30 s).'],
      ['Deliverable', '**1 file**, 9:16 (1080×1920) + 4:5 (1080×1350).'],
      ['Rule', '**Everything from 00:03 onward is identical to PD_7_H2** — same cuts, same captions, same VO. Only the first 3 seconds change.'],
      ['Sound', 'New hook line as VO in the same synthetic Swedish voice as the rest; then the script below, word for word.'],
      ['Captions', 'Burned in, Swedish, word for word. Å, Ä, Ö must render.'],
      ['Product on screen', 'Before second 3: the tank with green water, then the cover.'],
    ],
    klippkarta: [['00:00–00:03', '**NEW:** close-up of green water in the tank (source footage from PD_1\'s problem shot), hook as VO + caption.'], ['00:03–end', 'The PD_1 demo, untouched: cover on, zipper, top opening, clear water, end card.']],
    kpi: '**Hook rate (3-second plays / impressions).** Beat 20,5 % (TankGuard_PD_1_H1) and 37,2 % (the best GT video). Secondary: CPA under break-even 334 kr on ≥ 3 purchases before any verdict.',
    lar: 'Whether the problem opening or the cause opening (PD_7_H2) wins the first three seconds of the proven demo film. Read together with PD_7_H2.',
  },
  TankGuard_PD_7_H2: {
    titel: 'Hook swap on the inherited PD_1 film — the cause first (it is the light)',
    typ: 'video', modell: 'sonnet',
    taggar: 'vinkel=`produktdemo (PD)` · hook-typ=`orsak/påstående (ljuset, inte vattnet)` · format=`video, VO + demo (omklipp av PD_1)` · proof=`mekanism (210D, ljuset ute)` · offer-i-creativen=`pris bara på end card` · visuell stil=`produktdemo, händer, tanken` · textmängd=`≤5 ord per caption` · talare=`röst utan ansikte`',
    foralder: 'Variant of the inherited **IBC PD_1_H1** (source store: 16 997 kr, 77 purchases). Isolated variable: **the hook (00:00–00:03)**. Sibling **PD_7_H1** opens with the visible problem; control = the original opening.',
    varfor: 'The product page that converted 86 purchases on the source store leads with the cause the customer does not know: light makes the algae grow, not the water. The film says it later ("Solen gör plasten spröd…") but opens with a question about owning a tank. This variant puts the surprise first.',
    format: [
      ['Source', 'Same film as PD_7_H1 (inherited PD_1). Re-voice from `factory/output/tankguard/srt-se/PD_1_H1.srt`; TankGuard end card. Never the Bäverbutiken audio or end card.'],
      ['Length', '~30 s.'],
      ['Deliverable', '**1 file**, 9:16 + 4:5.'],
      ['Rule', '**Everything from 00:03 onward is identical to PD_7_H1.** Only the first 3 seconds change.'],
      ['Sound', 'New hook line as VO, same synthetic voice; then the script word for word.'],
      ['Captions', 'Burned in, Swedish, word for word.'],
      ['Product on screen', 'Before second 3.'],
    ],
    klippkarta: [['00:00–00:03', '**NEW:** sun on the bare tank, water going green — hook as VO + caption.'], ['00:03–end', 'The PD_1 demo, untouched.']],
    kpi: '**Hook rate.** Beat 20,5 % (TankGuard_PD_1_H1). Secondary: CPA under 334 kr on ≥ 3 purchases.',
    lar: 'Problem opening vs cause opening on the same film. Read together with PD_7_H1.',
  },
  TankGuard_CS_6_H1: {
    titel: 'New concept: two tanks, two covers — and the outdoor tap gets its winter jacket free',
    typ: 'video', modell: 'fable',
    taggar: 'vinkel=`erbjudande (CS) — bonus i 2-packet` · hook-typ=`fråga (två tankar?)` · format=`video, VO + demo, ny film` · proof=`bonusprodukten själv (420D, foder)` · offer-i-creativen=`köp 2 → 2 kranskydd gratis (aldrig paketpris)` · visuell stil=`två tankar + utekranen, händer` · textmängd=`≤5 ord per caption` · talare=`röst utan ansikte`',
    foralder: 'New concept. **Source: inherited winning angle** — the offer video IBC CS_1_H3 held the highest ROAS with volume on both markets (3,65 SE on 3 purchases, 2,37 NO on 20 purchases). Its discount (23 % off one cover) does not exist on TankGuard; the store\'s only true offer is the bundle bonus. Backlog item #1 (`[använd i batch #1]`).',
    varfor: 'The customer with one IBC tank often has two, and the tank cover and the tap cover protect against the same winter — it is the same buying moment. The bundle prices are under A/B test on the page (799/831 kr), so the ad may NEVER say a bundle price: only "489 kr" and "köp 2, få 2 kranskydd på köpet".',
    format: [
      ['Footage', '**New film, hands only.** Cover 1 goes on tank 1 (zipper), cover 2 on tank 2, then the Kranskydd Frost 420D goes over an outdoor tap (drawstring pulled). Product photos of the tap cover are on tankguard.se (bonus product `kranskydd-frost`). No people, no generated people.'],
      ['Length', '20–25 s.'],
      ['Deliverable', '9:16 + 4:5.'],
      ['Sound', 'Synthetic Swedish VO (same voice as the inherited ads), script word for word. Light outdoor ambience.'],
      ['Captions', 'Burned in, Swedish, word for word.'],
      ['End card', 'TankGuard wordmark, "489 kr", "Köp 2 – 2 kranskydd på köpet". No bundle price, no percentage.'],
    ],
    klippkarta: [['0–3 s', 'Two IBC tanks side by side, bare. Hook.'], ['3–7 s', 'Green water / brittle plastic close-up.'], ['7–14 s', 'Cover on tank 1, zipper, cover on tank 2.'], ['14–18 s', 'The tap cover over the outdoor tap, drawstring tight.'], ['18–22 s', 'End card.']],
    kpi: '**Profit contribution `(334 − CPA) × purchases`** and order value (does the 2-pack get chosen? read in Shopify). Secondary: CPA under 334 kr on ≥ 3 purchases.',
    lar: 'Whether the bundle bonus is a reason to buy on its own, without a kronor discount in the ad.',
  },
  TankGuard_PR_1_H1: {
    titel: 'New concept: the tarp blows off in the first autumn storm — the zipper stays',
    typ: 'video', modell: 'sonnet',
    taggar: 'vinkel=`konflikt A: presenning vs blixtlås (PR)` · hook-typ=`bild/påstående (presenningen blåser av)` · format=`video, VO + demo, ny film` · proof=`mekanism (blixtlås + dragsnören) + mått` · offer-i-creativen=`pris bara på end card` · visuell stil=`väder, vind, händer, tanken` · textmängd=`≤5 ord per caption` · talare=`röst utan ansikte` · källa=`gissning (säsong)`',
    foralder: 'New concept — **marked `gissning`**: no ad has spent money on this angle (the source image IBC_BOF_5_1 had 7 kr). The line comes from the product page ("Presenningen som skulle skydda blåser av vid första höststormen") and is the only weather angle in the material. Backlog item #4 (`[använd i batch #1]`). Conflict type A in the copy rules (another approach vs ours).',
    varfor: 'Every other ad sells on algae. It is September: storms and frost are the season, and the tarp-and-rubber-band solution is what most tank owners actually have. The ad shows the failure of the alternative, then ours staying on.',
    format: [
      ['Footage', '**New film, no people.** A tarp on an IBC tank lifting in wind / pulled off by hands; cut to the TankGuard cover zipped on and the bottom drawstrings pulled tight; wind still blowing, cover still on. Hands only.'],
      ['Length', '20–25 s.'],
      ['Deliverable', '9:16 + 4:5.'],
      ['Sound', 'Synthetic Swedish VO, script word for word. Wind ambience under the hook.'],
      ['Captions', 'Burned in, Swedish, word for word.'],
      ['End card', 'TankGuard wordmark, "489 kr".'],
    ],
    klippkarta: [['0–3 s', 'Tarp flapping / coming off. Hook.'], ['3–7 s', 'Bare tank in rain and wind.'], ['7–14 s', 'Cover on, zipper down the side, drawstrings tight.'], ['14–18 s', 'Close-up: 210D fabric, the size line.'], ['18–22 s', 'End card.']],
    kpi: '**Hook rate** first (does weather stop the scroll?), then CPA under 334 kr on ≥ 3 purchases.',
    lar: 'Whether a weather/season conflict opening can carry this product at all. If it cannot beat 26 % hook rate, the angle is retired.',
  },
  TankGuard_SP_4_H1: {
    titel: 'New concept: 16 reviews on tankguard.se — one of them, word for word',
    typ: 'video', modell: 'fable',
    taggar: 'vinkel=`social proof (SP)` · hook-typ=`siffra (16 recensioner) / citat` · format=`video, VO + demo + citatkort` · proof=`recension (verbatim, förnamn) + antal` · offer-i-creativen=`pris bara på end card` · visuell stil=`produktdemo + citatkort` · textmängd=`citatet får vara längre; övriga ≤5 ord` · talare=`röst utan ansikte`',
    foralder: 'New concept. **Source: playbook #5** (social proof / customer quote, ROAS 2,12) and the sibling OPS store HeimGuard, where the inherited SP video carried 65 % of profit contribution. On this product the inherited SP videos never got spend (SP_1_H3: 89 kr, 1 purchase — under the gate), so on TankGuard this is a **hypothesis**. Unblocks backlog item #3: the store now has 16 reviews, average 4,81 (verified live 2026-09-12).',
    varfor: 'The inherited SP ads said "hundratals trädgårdsägare" and quoted people who never bought from TankGuard — banned. This ad uses only what the store can show: the count on its own page and one review quoted word for word with a first name.',
    format: [
      ['Footage', 'Demo footage of the cover going on (PD_1\'s demo shots are fine to reuse — but never its audio or end card). The review as an on-screen quote card: first name, five stars as on the page, the text word for word. No faces, no generated people.'],
      ['Length', '~25 s.'],
      ['Deliverable', '9:16 + 4:5.'],
      ['Sound', 'Synthetic Swedish VO reads the review exactly as written. Then the script.'],
      ['Captions', 'Burned in, Swedish, word for word. The quote card may exceed 5 words.'],
      ['End card', 'TankGuard wordmark, "489 kr", "16 recensioner".'],
    ],
    klippkarta: [['0–3 s', 'Hook (count or quote) on the tank with the cover on.'], ['3–7 s', 'Green water close-up.'], ['7–14 s', 'Cover going on, zipper, top opening.'], ['14–20 s', 'Quote card + VO reading it.'], ['20–25 s', 'End card.']],
    kpi: '**Profit contribution.** Secondary: CPA under 334 kr on ≥ 3 purchases. Diagnostic: hook rate vs PD_7_H1.',
    lar: 'Whether verifiable social proof (16, 4,81, a real quote) sells this product on TankGuard — the inherited SP claim never got tested honestly.',
  },
  TankGuard_UV_1_H1: {
    titel: 'New concept: the sun is eating the tank — the fabric takes the sun instead of the plastic',
    typ: 'video', modell: 'sonnet',
    taggar: 'vinkel=`UV — plasten åldras i solen` · hook-typ=`påstående/bild (solen äter tanken)` · format=`video, VO + närbilder, ny film` · proof=`mekanism (210D tar solen) + två problem, ett skydd` · offer-i-creativen=`pris bara på end card` · visuell stil=`närbild på blekt plast, sedan tyget` · textmängd=`≤5 ord per caption` · talare=`röst utan ansikte`',
    foralder: 'New concept. **Source: the product page\'s own second angle** ("Tanken åldras inte i solen – 210D oxfordtyg tar UV-strålningen i stället för plasten"), which sat on the page that converted 86 purchases on the source store, and the winning film\'s own line "Solen gör plasten spröd". Never tested as the lead angle — **hypothesis**.',
    varfor: 'Algae is the problem the customer already knows and every ad repeats. The brittle tank is the cost they do not see until it cracks. Same cover, second reason — and it is the reason that costs the most.',
    format: [
      ['Footage', '**New film, hands only.** Close-up of sun on bare, chalky IBC plastic; a hand running over the faded surface; then the green fabric going over it, zipper. Never claim a number of years or a lifespan — no measurement exists.'],
      ['Length', '20–25 s.'],
      ['Deliverable', '9:16 + 4:5.'],
      ['Sound', 'Synthetic Swedish VO, script word for word.'],
      ['Captions', 'Burned in, Swedish, word for word.'],
      ['End card', 'TankGuard wordmark, "489 kr".'],
    ],
    klippkarta: [['0–3 s', 'Sun glare on bare plastic. Hook.'], ['3–7 s', 'Faded, chalky surface close-up.'], ['7–14 s', 'The fabric going over the tank, zipper.'], ['14–18 s', 'Clear water in the top opening: two problems, one cover.'], ['18–22 s', 'End card.']],
    kpi: '**Hook rate** first, then CPA under 334 kr on ≥ 3 purchases.',
    lar: 'Whether the slow, invisible cost (the tank itself) opens better than the visible one (green water). Read against PD_7_H1.',
  },
  TankGuard_FE_1_1: {
    titel: 'Image: before/after — the tank bare in the sun vs covered',
    typ: 'bild', modell: 'fable',
    taggar: 'vinkel=`före/efter (FE)` · hook-typ=`bild (två tankar)` · format=`bild, före/efter split` · proof=`före/efter` · offer-i-creativen=`489 kr litet i hörnet` · visuell stil=`foto, split, en rad text` · textmängd=`≤7 ord på bilden` · talare=`ingen`',
    foralder: 'New concept (image). **Source: copy rules** ("före/efter är den enklaste konflikten") and **playbook** ("problem funkar som before/after"). Image lost to video on the source store (20 images, 0 purchases; PD_2_1 362 kr, 0 purchases) — this is the **one** image in the batch, and it carries the conflict, not a feature list. **Hypothesis.**',
    varfor: 'The store already has its own before/after photo (`tankguard-forefter-sv.jpg` on the TankGuard CDN). One split, one line, the price small. Cheapest ad in the batch.',
    format: [
      ['Base', 'The store\'s Swedish before/after photo: bare IBC tank (left/top) vs covered (right/bottom). Use the TankGuard CDN file, not the Bäverbutiken one.'],
      ['Deliverable', '4:5 (1080×1350) + 1:1 (1080×1080).'],
      ['Text on image', 'One line, max 7 words (below). Small "489 kr" in a corner. No percentage, no compare-at price.'],
      ['Style', 'Photo, no illustration, no generated people. TankGuard wordmark small.'],
    ],
    klippkarta: null,
    kpi: '**CVR and CPA** (image ads on this product have never converted: 0 purchases on 20 images). Verdict only at ≥ 300 kr AND ≥ 3 purchases.',
    lar: 'Whether a before/after image with one line can convert at all on this product, or whether image stays a losing format.',
  },
};

const ORDNING = ['TankGuard_PD_7_H1', 'TankGuard_PD_7_H2', 'TankGuard_CS_6_H1', 'TankGuard_PR_1_H1', 'TankGuard_SP_4_H1', 'TankGuard_UV_1_H1', 'TankGuard_FE_1_1'];

const HÅRDA = `- **Price:** exactly "489 kr" — spoken, on screen and in the copy. Verified live on tankguard.se ${DATUM}. Bundles ONLY as "Köp 2, få 2 kranskydd Frost 420D på köpet" / "Köp 3, få 3 kranskydd på köpet" — **never a bundle price in kronor** (799/831/1 099/1 159 are under A/B test on the page), **never "636 kr"**, never a percentage.
- **No urgency from stock or price, ever:** no "bara idag", "sista chansen", "lagret krymper", "priset går upp", "halva priset". Urgency may come from the season only (frost, autumn storms).
- **Shipping:** "Fri frakt inom Sverige", delivery 6–10 arbetsdagar. Never "över 300 kr". Returns: "14 dagars ångerrätt" — never "30 dagars öppet köp", never Klarna.
- **Social proof:** exactly 16 reviews, average 4,81 (tankguard.se, verified ${DATUM}). Quote a review verbatim with the first name or not at all. Never "hundratals", never "tusentals".
- **Facts:** 210D Oxford (never 220D), 120 × 100 × 116 cm, 1000-litre IBC, zipper, top opening, drawstrings, under two minutes. Nothing not on the product page.
- **No Bäverbutiken** anywhere: not in audio, not in the end card, not in a file name. The inherited masters carry it — re-voice and re-card every one.
- **No generated people.** Hands, the tank, the water, the cover, the tap (hook-visual rule 2026-08-04).
- **Spelling traps:** överdrag · blixtlås · dragkedja · IBC-tank · regnvatten · TankGuard (capital T, capital G). Å, Ä, Ö must render.
- **Landing page:** ${LP}`;

function tabell(rader, huvud) {
  return [`| ${huvud.join(' | ')} |`, `|${huvud.map(() => '---').join('|')}|`, ...rader.map((r) => `| ${r.join(' | ')} |`)].join('\n');
}

function brief(namn) {
  const m = META[namn];
  const c = copy[namn];
  if (!c) throw new Error(`Copy saknas för ${namn}`);
  if (c.copy_modell !== m.modell) throw new Error(`${namn}: copy_modell ${c.copy_modell} ≠ planerad ${m.modell}`);
  const typ = m.typ === 'bild' ? 'Image' : 'Video';
  const ut = [];
  ut.push(`# ${namn} — ${m.titel}`, '');
  ut.push(`**VARIABELTAGGAR:** ${m.taggar} · copy_model=\`${m.modell}\``);
  ut.push('*(Read by the next `/notionscalercs` run to group profit contribution per variable value. Do not change them without changing the creative.)*', '');
  ut.push(`**Type:** ${typ} · **Batch:** #1 (${DATUM}) · **Copy written by:** ${m.modell} (A/B test Fable vs Sonnet — do not rewrite the Swedish lines)`);
  ut.push(`**Parent / source:** ${m.foralder}`, '');
  ut.push('## 1. Why this ad exists', m.varfor, '');
  ut.push('## 2. Hypothesis', `**Hook:** ${c.hook}`, '');
  ut.push('## 3. Format', tabell(m.format, ['', '']), '');
  if (m.typ === 'video') {
    ut.push('## 4. Script — these lines, word for word');
    ut.push('Swedish is what runs in the ad. The right column is meaning only, for the editor. Do not "fix" the Swedish; ask before changing anything.', '');
    ut.push(tabell(c.manus.map((r) => [`${r.sekunder} · ${r.beat}`, r.sv, r.en]), ['Time', 'Swedish (use this)', 'English meaning']), '');
    ut.push('## 5. Edit map', tabell(m.klippkarta, ['Time', 'What to cut to']), '');
    ut.push('## 6. On-screen text', 'Captions word for word from the script, max 5 words per caption (the quote card in SP_4_H1 is the exception). Overlays sit in the middle 80 % of the frame. Å, Ä and Ö must render.', '');
  } else {
    const b = c.bildtext;
    ut.push('## 4. Text on the image — word for word');
    ut.push(tabell([[b.on_image_sv, b.on_image_en]], ['Swedish (use this)', 'English meaning']), '');
    ut.push('## 5. Caption under the image', tabell([[b.caption_sv.replace(/\n/g, ' / '), b.caption_en.replace(/\n/g, ' / ')]], ['Swedish (use this)', 'English meaning']), '');
    ut.push('## 6. Layout', 'Split before/after. The line sits in the middle 80 % of the frame. Å, Ä and Ö must render.', '');
  }
  const pt = c.copy_card.primary_text_sv.split('\n').map((r) => `> ${r}`).join('\n');
  ut.push('## 7. COPY CARD (goes in Ads Manager, not in the creative)', '**Primary text:**', pt, '', `**Headline:** \`${c.copy_card.headline_sv}\``, `**Description:** \`${c.copy_card.description_sv}\``, '**CTA button:** `Handla nu` (Shop Now)', `**Destination:** ${LP}`, '');
  ut.push('## 8. Three-question test (docs/copy-regler.md) — every delivered line');
  ut.push(tabell(c.tre_fragor.map((t) => [t.rad, t.visualisera, t.falsifiera, t.ingen_annan_kan_saga]), ['Line', 'Visualise?', 'Falsifiable?', 'Only we can say it?']), '');
  ut.push('## 9. Hard rules for this ad', HÅRDA, '');
  ut.push('## 10. Primary KPI', m.kpi, '');
  ut.push('## 11. What we learn regardless of outcome', m.lar, '');
  return ut.join('\n');
}

const manifest = [];
for (const namn of ORDNING) {
  const m = META[namn];
  const mapp = m.typ === 'bild' ? 'image-ads-briefs' : 'video-ads-briefs';
  const dir = join(HÄR, mapp, namn);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'brief.md'), brief(namn));
  manifest.push({ namn, typ: m.typ, brief: `${mapp}/${namn}/brief.md` });
  console.log('skrev', `${mapp}/${namn}/brief.md`, `(${m.modell})`);
}
writeFileSync(join(HÄR, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log('manifest.json:', manifest.length, 'briefer');
