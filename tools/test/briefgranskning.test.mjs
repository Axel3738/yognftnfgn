// Ren logik i tools/briefgranskning.mjs — inga nätanrop, ingen env.
// Hubbfiltret (strukturen, andra verksamheter), hubbnyckeln, prefixet,
// produktkopplingen (products.json / register.json — aldrig en gissning),
// butiksnamnen, taggarna, annonstexten, priset, tre-frågorstestet, döda
// koncept ur dna.md, domen per brief (markdown OCH Notion-dump), rondvalet
// med åldersgräns, "redan granskad", Feedback-raden (markdown + egenskaper),
// domfilens spärrar, feedback.md-sektionen, körningen och Discord-rapporten.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  KRAVDA_TAGGAR, KOMMENTARMARKE, FEEDBACK_TYP, MAXDAGAR, BAVER_NAMN, feedbackTitel,
  arCreativeHub, hubbSlug, dominantPrefix, harPrefix, produktFor, butiksnamnFor,
  arRubrik, sektion, whyRad, reglerSektion, hypotesUr, taggarUr, annonstextUr, namntraff, prisUrBriefText, kronorI,
  trefragorUr, dodaKoncept, arVariant, isoleradVariabel, kallaUr, kpiUr, roasEnsamt, granskaBrief, svenskDag, dagarMellan,
  valjRond, redanGranskad, hittaBatch, nastaGranskning, harSektion, domFor, giltigDom, kommentarText, feedbackSektion, laggInSektion,
  feedbackRadMarkdown, feedbackEgenskaper, byggRapport, samlaKorning,
  REGI_FRAN, SPARRKODER, KOMPONENT_TAGGAR, manusrader, regiUr, granskaRegi, giltigKalla, komponentUr, sparra, spegelPris,
  tolkaMatstrumporNamn,
} from '../briefgranskning.mjs';
import { serUtSomSvenska } from '../lib/engelska.mjs';

// ------------------------------------------------------------ fixturer

const BRA = `# Takoverdrag_SP_5_1 — the winner's proof, moved into the weather it talks about

**VARIABELTAGGAR:** vinkel=\`social proof (kundomdöme)\` · hook-typ=\`aggregerat betyg + citat\` · format=\`statisk, enkel canvas\` · proof=\`namngivet citat + 16 omdömen\` · offer-i-creativen=\`inget pris\` · visuell stil=\`exteriör, höstregn\` · textmängd=\`toppetikett+citat+bottenrad\` · talare=\`kund (Lars)\` · copy_model=\`sonnet\` · typ=\`I\` · parent=\`Takoverdrag_SP_2_1\` · iteration=\`1\` · koncept=\`SP omdöme i regn\` · kalla=\`parent\` · avatar=\`husvagnsagaren-vinterforvaring\` · awareness=\`product\` · begar=\`skydda-det-jag-ager\` · mekanism=\`bevis i vädret raden nämner\` · tro=\`ett riktigt omdöme väger mer än vårt löfte\` · urgency=\`sasong\` · hook-mekanik=\`none\` · confidence=\`medium\` · lardom=\`L-120250242482300291\`
*(Read by the next \`/cs\` run to group profit contribution per variable value.)*
**Memo:** the parent's proof lands harder when the rain it names is in the photo — same words, the scene does the convincing.

**Type:** Static image · **Batch:** #3 (2026-09-16) · **Copy written by:** sonnet
**Parent:** \`Takoverdrag_SP_2_1\` — the account's best ad: 846 kr, 5 purchases, CPA 169 kr, 58 % of all profit contribution (measured 2026-09-16).
**Isolated variable: the setting of the photo.** Every proof element the parent carries stays word for word. Only the scene changes.

## 1. Why this ad exists
SP is the strongest angle by a distance — 42 % of spend, 12 of 20 purchases, CPA 266 kr against break-even 693 kr — and \`SP_2_1\` is the single ad carrying it.

## 2. Hypothesis
Showing the weather the quote names makes the same proof land harder. If CPA holds at or below the parent's 169 kr, the scene is worth more than the neutral shot.

**Hook idea:** Ett av 16 omdömen – alla fem stjärnor.

## 3. Format
| | |
|---|---|
| Deliverables | 4:5 (1080×1350) **and** 1:1 (1080×1080). PNG or JPG, under 30 MB. |
| Text | Swedish, word for word from the table below. **No price on this image.** |

## 4. Exact text (Swedish word for word, do not re-translate)
| Element | Swedish (use this) | English meaning |
|---|---|---|
| Top label | Ett av 16 omdömen – alla fem stjärnor | One of 16 reviews – all five stars |
| Stars | ★★★★★ | 5.00 rating |
| Quote | "Passar bra och skyddar taket mot väder." | "Fits well and protects the roof from weather." |
| Attribution | – Lars | – Lars |
| Bottom line | Vattnet stannar på väven. Taket under är torrt. | The water stays on the fabric. The roof underneath is dry. |

## 5. Design brief
- The rain has to be unmistakable at a glance.
- No faces, no people.

## 7. COPY CARD (goes in Ads Manager, not in the creative)
**Primary text:**
> "Passar bra och skyddar taket mot väder." – Lars, ett av 16 omdömen – alla fem stjärnor.
>
> Den här bilden är tagen i regn: vattnet stannar på väven, taket under är torrt.
>
> 1 129 kr (ord. 1 469 kr). Fri frakt inom Sverige. 30 dagars öppet köp.

**Headline:** \`16 omdömen, alla fem stjärnor – i regn också\`
**Description:** \`"Skyddar taket mot väder." – Lars. 1 129 kr.\`
**CTA button:** \`Handla nu\` (Shop Now)
**Destination:** https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste

## 8. Three-question test (docs/copy-regler.md) — every delivered line
| Line | Visualise? | Falsifiable? | Only we can say it? |
|---|---|---|---|
| Ett av 16 omdömen – alla fem stjärnor | ✅ a named count and a rating | ✅ checkable | ✅ our exact review count |
| Vattnet stannar på väven. Taket under är torrt. | ✅ two named surfaces | ✅ literally true | ✅ only a roof-only cover can say it |

**Rejected drafts:** "Skyddar mot allt väder" (not falsifiable).

## 9. KPI
Judged against break-even CPA **693 kr** (never against target). Benchmark: the parent \`SP_2_1\` at CPA 169 kr. No verdict before 300 kr spend **and** 3 purchases.

## Hard rules
- Price **1 129 kr**, compare-at **1 469 kr**. No other numbers, ever. No price on the image itself.
- **The ad never names the store** — not in copy, on the image, in voice-over or captions.
- Guarantee is **30 dagars öppet köp** — never a different number.

## IMAGE PROMPT
A photorealistic exterior photograph of a white caravan parked outdoors during steady rain, roof covered by a taut black fabric cover, rainwater beading on the fabric. Leave clear space across the upper third for a headline in post. No text, no people, no faces, no logos, no numbers.

REFERENCE IMAGES:
- https://cdn.shopify.com/s/files/1/1013/0322/2621/files/tak-van.jpg

ASPECT: 4:5

END IMAGE PROMPT
`;

/** Samma brief som Notion lämnar tillbaka den (tools/ops-spegla.mjs textUrBlock):
 *  inga #, inga **, inga backticks, tabellrader utan yttre pipes, citat utan >. */
function somNotionDump(md) {
  return md
    .split('\n')
    .filter((r) => !/^\|?\s*-{3,}\s*(\|\s*-{3,}\s*)*\|?\s*$/.test(r))
    .map((r) => r.replace(/^#+\s*/, '').replace(/\*\*/g, '').replace(/`/g, '').replace(/^\*\((.*)\)\*$/, '($1)').replace(/^>\s?/, '').replace(/^- /, '').replace(/^\|\s?/, '').replace(/\s?\|$/, ''))
    .join('\n');
}

/** Bäverbutikens eget briefformat, som Notion lämnar det (Skalnings kungen /
 *  `/cs`, mätt 2026-09-18 på IBC_PD_10_H1): nyckel–värde-huvud, nakna rubriker,
 *  Hook- och Script-tabeller, tre-frågorstest med "Competitor-signable?" där
 *  ❌ är rätt svar, "Rules" i stället för "Hard rules", ingen KPI, ingen COPY CARD. */
const BAVER_VIDEO = `Make: Cut a 20–25s 9:16/4:5 video following the proven PD structure exactly — pain hook → zipper/top-opening demo → three checkmark benefits → one CTA. No price or urgency text anywhere in the edit.
Tone: calm and demonstrative, not salesy — let the zipper/lid demo do the convincing, not the voiceover.
Format: Video 9:16 + 4:5, 20–25 s
Why: The winning structure held for 5 readings with "210D Oxford-tyg" as its one concrete spec; this swaps that single variable to the zipper and top opening to see whether it's the structure or that specific spec that carries.
Drive folder: (not created this round — full brief is in this page)   Landing page: https://baverbutiken.se/products/ibc-tankoverdrag-1000-l-stoppar-alger-uv
Hook
Swedish (use this) | English meaning
Solljus in i tanken. Alger i vattnet. | Sunlight into the tank. Algae in the water.
Three-question test — every Swedish line
Line | Visualize? | Falsifiable? | Competitor-signable? | Verdict
Solljus in i tanken. Alger i vattnet. | ✅ | ✅ | ❌ | Ship
Blixtlåset går rakt till locket — du kommer åt tanken utan att dra av hela skyddet. | ✅ | ✅ | ❌ | Ship
Passar din 1000 L IBC-tank rakt av. | ✅ | ✅ | ❌ | Ship
Script / shot list
Time | Show | Swedish (use this) | English meaning | Caption
0:00–0:04 | Sunlit IBC tank, water inside visibly green/murky, handheld | Solljus in i tanken. Alger i vattnet. | Sunlight into the tank. Algae in the water. | Solljus in i tanken. Alger i vattnet.
0:04–0:10 | Cover goes on the tank; hand unzips the top opening | Blixtlåset går rakt till locket — du kommer åt tanken utan att dra av hela skyddet. | The zipper runs right to the lid. | Blixtlåset går rakt till locket.
0:18–0:22 | Checkmark overlay, wide shot, tank fully covered outdoors | Passar din 1000 L IBC-tank rakt av. | Fits your 1000 L IBC tank exactly. | Passar din 1000 L IBC-tank.
Rules
Price exactly 489 kr (compare-at 636 kr). Never invented urgency or "thousands of customers".
Product in frame before second 4. Swedish captions word for word.
Export: MP4, 9:16 (1080×1920) and 4:5 (1080×1350), H.264, captions burned in.
Link for approval:
https://drive.google.com/drive/folders/1NvVIpXUS3FDM3jFinq5ZoJw6GwREwIRZ?usp=share_link`;

/** Samma format, bild, med "Variables:"-rad och butikens domän i CTA:n (mätt på Batmotor_BOF_2_1). */
const BAVER_BILD = `Variables: angle=trust/guarantee · hook=guarantee-terms · format=static (BOF) · proof=stated-store-policy · offer=none · visual=product shot, plain background · text=medium · talare=none
Make: Bottom-of-funnel trust static — states only what the product page actually says: 30 dagars öppet köp and Klarna. No claim beyond that.
Format: Static 4:5 (1080x1350) + 1:1
Why: Retargeting audiences often hesitate on the risk of ordering, not on the product itself — this removes that objection with the store's real stated terms.
Drive folder: (not created this run — brief lives in Notion)   Landing page: https://baverbutiken.se/products/batmotorskydd-420d-heltackande-for-utombordare
Three-question test — every Swedish line
Line | Visualize? | Falsifiable? | Competitor-signable? | Verdict
30 dagars öppet köp. | ✅ | ✅ | ❌ | ✅
579 kr. Fri att ångra dig i 30 dagar. | ✅ | ✅ | ❌ | ✅
Läs mer på baverbutiken.se. | ✅ | ✅ | ❌ | ✅
Script / shot list
Element | Show | Swedish (use this) | English meaning | Caption
Layout | Product shot, plain background, Klarna logo small in corner | — | — | —
Headline | Top | 30 dagars öppet köp. | 30 days open purchase. | Baked into image
Bottom band | Price block | 579 kr. Fri att ångra dig i 30 dagar. | 579 kr. Free to change your mind within 30 days. | Baked into image
CTA | Button, bottom | Läs mer på baverbutiken.se. | Read more at baverbutiken.se. | Baked into image
Rules
Price exactly 579 kr (compare-at 965 kr, save 386 kr = 40 %). Never invented urgency or "thousands of customers".
Only claim the 30-day open purchase and Klarna — no free-shipping or other terms unless verified on the product page first.
Export: 4:5 (1080x1350) + 1:1.`;

const TAK_HUB = '7ec270ab-908c-82f6-a2a8-0153159b20fa';
const MOTOR_HUB = '3b0270ab-908c-80a7-8793-fa11d8c0f6e4';
const REGISTER = { poster: {
  'carashell/takskyddet': { notion: { database_id: '3da270ab-908c-80c4-80d1-fbdb3fefd3b4' }, spegling: { kalla_hub: TAK_HUB, kalla_namn: 'BÄVER For CARL Taköverdraget för Husvagn', status_se: 'CaraShell SE ready to be active', status_en: 'CaraShell EN ready to be active' } },
  'drytrek/damasker': { notion: { database_id: '3cf270ab-908c-81a0-9b0d-c486f6467ce7' } },
  'baverbutiken/motorholjet': { notion: { database_id: MOTOR_HUB } },
} };
const PRODUCTS = [
  { id: 'motorholjet', notion: { database_id: MOTOR_HUB }, creative_prefix: 'Enginecover_', break_even_cpa_sek: 210 },
  { id: 'axelbaltet', notion: { database_id: '3aa270ab-908c-808b-9d87-d1f1a0d70cbc' }, creative_prefix: 'Trimmerbelt_', break_even_cpa_sek: 299 },
];

const CTX = {
  prefix: 'Takoverdrag', creative_prefix: null,
  butiksnamn: butiksnamnFor(TAK_HUB, REGISTER),
  pris_butik: { pris: 1129, jamforpris: 1469 }, breakEvenCpa: null, copyModell: null,
  doda_koncept: [{ koncept: 'GT', citat: 'Instruktion: GT får inga briefer i batch #3.' }],
};
const RAD = { namn: 'Takoverdrag_SP_5_1', typ: 'bild', typ_notion: 'Image - Pending Approval', status: 'To be Reviewed' };
const koder = (lista) => lista.map((x) => x.kod);

/** Ett hubbschema som Notion lämnar det: Typ (select) med Pending Approval + Feedback, Status (status) med brief-livscykeln. */
function hubbSchema({ typer = ['Guideline', 'SOP', 'Video - Pending Approval', 'Video - Approved', 'Winning Creative', 'Feedback', 'Image - Pending Approval'], statusar = ['Draft', 'In progress', 'Creative strat review', 'To be Reviewed', 'SE-ACTIVE to be translated', 'Approved'], typTyp = 'select', medTyp = true, medSkapad = true } = {}) {
  const s = {
    Namn: { type: 'title', title: {} },
    Status: { type: 'status', status: { options: statusar.map((name) => ({ name })) } },
    'Landing page': { type: 'rich_text', rich_text: {} },
  };
  if (medTyp) s.Typ = { type: typTyp, [typTyp]: { options: typer.map((name) => ({ name })) } };
  if (medSkapad) s.Skapad = { type: 'date', date: {} };
  return s;
}

// ------------------------------------------------------------ hubbarna

test('arCreativeHub: strukturen avgör — brief-livscykel + Pending Approval; titeln bara andra verksamheter och mallen', () => {
  const ok = arCreativeHub(hubbSchema(), 'BÄVER IBC-Tanköverdraget');
  assert.equal(ok.ok, true);
  assert.equal(ok.harFeedbackTyp, true);
  // Product test center: Typ har Pending Approval men statusarna är produktstatusar (mätt 2026-09-18).
  const test_ = arCreativeHub(hubbSchema({ statusar: ['Products', 'Ads review', 'To be Reviewed', 'Testing', 'Exit'] }), 'Product test center SE BÄVER');
  assert.equal(test_.ok, false);
  assert.match(test_.skal, /Draft/);
  assert.equal(arCreativeHub(hubbSchema({ medTyp: false }), 'Customer support bäverbutiken').ok, false);
  assert.equal(arCreativeHub(hubbSchema({ typer: ['SOP', 'Guideline'] }), 'SOP-databas').ok, false);
  for (const titel of ['Matstrumpor creative hub', 'kundsupport Grillkliniken', 'Bäverkoppling.se', 'Creative Hub master', 'MALL Creative hub MALL']) {
    const r = arCreativeHub(hubbSchema(), titel);
    assert.equal(r.ok, false, titel);
    assert.match(r.skal, /other business/);
  }
  // Ett Typ-fält utan Feedback är fortfarande en hub — raden skapar alternativet.
  assert.equal(arCreativeHub(hubbSchema({ typer: ['Video - Pending Approval', 'Image - Pending Approval'] }), 'Ny hub').harFeedbackTyp, false);
});

test('hubbSlug: ascii-titel + åtta tecken ur id:t — två hubbar med samma titel får olika nycklar', () => {
  assert.equal(hubbSlug('BÄVER Termoskyddet för Husbil', 'c5a270ab-908c-83e3-b721-81fde8643080'), 'baver-termoskyddet-for-husbil-c5a270ab');
  assert.equal(hubbSlug('BÄVER Termoskyddet för Husbil', '513270ab-908c-825e-b71e-81cdf455dd98'), 'baver-termoskyddet-for-husbil-513270ab');
  assert.equal(hubbSlug('', TAK_HUB), 'hub-7ec270ab');
});

test('dominantPrefix + harPrefix: hubbens vanligaste prefix, ordgräns vid "_"', () => {
  assert.deepEqual(dominantPrefix(['Takoverdrag_SP_1_1', 'Takoverdrag_PD_2_1', 'Termoskydd_SP_1_1']), { prefix: 'Takoverdrag', antal: 2, av: 3 });
  assert.equal(dominantPrefix([]), null);
  assert.equal(harPrefix('Takoverdrag_SP_5_1', 'Takoverdrag'), true);
  assert.equal(harPrefix('takoverdrag_SP_5_1', 'Takoverdrag'), true, 'skiftläget avgör inte tillhörigheten');
  assert.equal(harPrefix('TakoverdragX_SP_5_1', 'Takoverdrag'), false);
  assert.equal(harPrefix('Enginecover_PD_22_H1', 'Enginecover_'), true, 'products.json-prefixet slutar på _');
  assert.equal(harPrefix('Takoverdrag_SP_5_1 – COPY ONLY', 'Takoverdrag'), true);
});

test('produktFor: products.json på hub-id, register.json på spegling, products.json på prefix — annars null', () => {
  const finnsMinne = (id) => ['motorholjet', 'carashell/takskyddet'].includes(id);
  const motor = produktFor(MOTOR_HUB.replace(/-/g, ''), 'Enginecover', { products: PRODUCTS, register: REGISTER, finnsMinne });
  assert.equal(motor.id, 'motorholjet');
  assert.match(motor.kalla, /database_id/);
  assert.equal(motor.minne, 'products/motorholjet');
  assert.equal(motor.break_even_cpa, 210);
  const tak = produktFor(TAK_HUB, 'Takoverdrag', { products: PRODUCTS, register: REGISTER, finnsMinne });
  assert.equal(tak.id, 'carashell/takskyddet');
  assert.match(tak.kalla, /spegling/);
  assert.equal(tak.minne, 'products/carashell/takskyddet');
  assert.equal(tak.break_even_cpa, null, 'OPS-butikens break-even gäller inte Bäverbutikens brief');
  const viaPrefix = produktFor('00000000000000000000000000000000', 'trimmerbelt', { products: PRODUCTS, register: REGISTER, finnsMinne });
  assert.equal(viaPrefix.id, 'axelbaltet');
  assert.equal(viaPrefix.minne, null, 'ingen dna.md ⇒ inget minne, men produkten är känd');
  assert.equal(produktFor('00000000000000000000000000000000', 'IBC', { products: PRODUCTS, register: REGISTER, finnsMinne }), null, 'ingen träff är ingen gissning');
});

test('butiksnamnFor: Bäverbutiken alltid — speglad hub får även OPS-butikens namn och domäner', () => {
  assert.deepEqual(butiksnamnFor('00000000000000000000000000000000', REGISTER), [...BAVER_NAMN]);
  const tak = butiksnamnFor(TAK_HUB, REGISTER);
  assert.ok(tak.includes('Bäverbutiken'));
  assert.ok(tak.includes('CaraShell'));
  assert.ok(tak.includes('carashell.se'));
  assert.ok(tak.includes('carashell.com'));
  assert.equal(tak.filter((x) => x.toLowerCase() === 'carashell').length, 1, 'inga dubbletter');
});

// ------------------------------------------------------------ delarna

test('arRubrik och sektion: markdown-rubriker, Notion-dumpens numrerade rubriker OCH Bäverbutikens nakna — aldrig nyckel–värde eller tabellrader', () => {
  assert.equal(arRubrik('## 2. Hypothesis'), true);
  assert.equal(arRubrik('2. Hypothesis'), true);
  assert.equal(arRubrik('Hard rules'), true);
  assert.equal(arRubrik('Rules'), true);
  assert.equal(arRubrik('Hook'), true);
  assert.equal(arRubrik('Three-question test — every Swedish line'), true);
  assert.equal(arRubrik('Script / shot list'), true);
  assert.equal(arRubrik('**VARIABELTAGGAR:** vinkel=`x`'), false);
  assert.equal(arRubrik('| Format | 9:16 |'), false);
  assert.equal(arRubrik('Format | 9:16'), false, 'Notion-dumpens tabellrad utan yttre pipes');
  assert.equal(arRubrik('Format: Static 4:5 + 1:1'), false, 'nyckel–värde-rad i Bäver-huvudet');
  assert.equal(arRubrik('Why: Bottom of funnel — answers the fit objection.'), false);
  assert.equal(arRubrik('**Hook idea:** Ett av 16 omdömen'), false);
  assert.match(sektion(BRA, /hypothes/i), /^Showing the weather/);
  assert.match(sektion(somNotionDump(BRA), /hypothes/i), /^Showing the weather/);
  assert.equal(sektion(BRA, /finns inte/i), '');
  assert.doesNotMatch(sektion(BRA, /\bkpi\b/i), /Price/);
  // Regelsektionen i båda formaten, Why-raden och hypotesen.
  assert.match(reglerSektion(BRA), /^- Price \*\*1 129 kr\*\*/);
  assert.match(reglerSektion(BAVER_VIDEO), /^Price exactly 489 kr/);
  assert.match(reglerSektion(BAVER_VIDEO), /Export: MP4/, 'sektionen löper till nästa rubrik — Export-raden är ingen rubrik');
  assert.match(whyRad(BAVER_VIDEO), /^The winning structure held for 5 readings/);
  assert.equal(whyRad(BRA), '');
  assert.match(hypotesUr(BAVER_VIDEO), /^The winning structure/);
  assert.match(hypotesUr(BRA), /^Showing the weather/);
});

test('taggarUr: alla nio taggar, alias och saknade — VARIABELTAGGAR och Bäverbutikens "Variables:"', () => {
  const v = taggarUr(BAVER_BILD);
  assert.equal(v.taggar.vinkel, 'trust/guarantee');
  assert.equal(v.taggar['hook-typ'], 'guarantee-terms');
  assert.equal(v.taggar['visuell stil'], 'product shot, plain background');
  assert.equal(v.taggar['textmängd'], 'medium');
  assert.equal(v.taggar.talare, 'none');
  assert.deepEqual(v.saknade, ['copy_model']);
  assert.equal(taggarUr(BAVER_VIDEO), null);
  const t = taggarUr(BRA);
  assert.deepEqual(t.saknade, []);
  assert.equal(t.taggar.copy_model, 'sonnet');
  assert.equal(t.taggar['hook-typ'], 'aggregerat betyg + citat');
  assert.equal(KRAVDA_TAGGAR.length, 9);
  const kort = taggarUr('VARIABELTAGGAR: vinkel=`PD` · hook=`fråga` · offer=`pris` | textmangd=`ingen`');
  assert.equal(kort.taggar['hook-typ'], 'fråga');
  assert.equal(kort.taggar['offer-i-creativen'], 'pris');
  assert.equal(kort.taggar['textmängd'], 'ingen');
  assert.ok(kort.saknade.includes('copy_model') && kort.saknade.includes('format'));
  assert.equal(taggarUr('# Brief utan taggar\nHypothesis: x'), null);
  assert.deepEqual(taggarUr(somNotionDump(BRA)).saknade, []);
});

test('annonstextUr: tabellerna, COPY CARD, hook-raden — inte rationalen, inte Destination', () => {
  const a = annonstextUr(BRA);
  assert.match(a, /Vattnet stannar på väven/);
  assert.match(a, /Passar bra och skyddar taket mot väder/);
  assert.match(a, /16 omdömen, alla fem stjärnor – i regn också/);
  assert.match(a, /Hook idea: Ett av 16 omdömen/);
  assert.doesNotMatch(a, /SP is the strongest angle/, 'rationalen är inte annonstext');
  assert.doesNotMatch(a, /Destination|baverbutiken\.se\/products/, 'länkar och Destination är metadata');
  assert.doesNotMatch(a, /Judged against/, 'KPI:n är inte annonstext');
  const d = annonstextUr(somNotionDump(BRA));
  assert.match(d, /Vattnet stannar på väven/);
  assert.match(d, /Skyddar taket mot väder.*1 129 kr/);
  assert.doesNotMatch(d, /SP is the strongest angle/);
});

test('annonstextUr: PRIS/BETYG VERIFIERAT-noterna efter COPY CARD är metadata — domänen utan https:// får inte bli ett butiksnamnsfel', () => {
  const brief = `${BRA}\nPRIS VERIFIERAT 2026-09-23 (/bildannonser): the product page baverbutiken.se/products/termoskydd was read live and returns price 559 kr.\nBETYG VERIFIERAT 2026-09-23: 4,80 av 5 på 10 recensioner avläst på baverbutiken.se.\n`;
  const a = annonstextUr(brief);
  assert.doesNotMatch(a, /VERIFIERAT/, 'verifieringsnoten är inte annonstext');
  assert.deepEqual(namntraff(a, ['Bäverbutiken', 'baverbutiken.se', 'baverbutiken']), [], 'domänen i noten är metadata');
});

test('namntraff: Bäverbutiken, den speglade butiken och Bäver-familjen — annonsnamnet räknas aldrig', () => {
  const namn = butiksnamnFor(TAK_HUB, REGISTER);
  assert.deepEqual(namntraff('Ett av 16 omdömen. Takoverdrag_SP_5_1 är namnet.', namn), []);
  assert.deepEqual(namntraff('CaraShell täcker taket – 6,5 × 3 m', namn), ['CaraShell']);
  assert.deepEqual(namntraff('ett av 16 omdömen på carashell.se', namn).sort(), ['carashell', 'carashell.se']);
  assert.deepEqual(namntraff('Köp hos Bäverbutiken', namn), ['Bäverbutiken']);
  assert.deepEqual(namntraff('Beställ på baverbutiken.se i dag', BAVER_NAMN).sort(), ['baverbutiken', 'baverbutiken.se']);
  assert.deepEqual(namntraff('', namn), []);
});

test('prisUrBriefText + kronorI: hard rules, COPY CARD-formen och alla kronbelopp', () => {
  assert.deepEqual(prisUrBriefText(BRA), { pris: 1129, jamforpris: 1469 });
  assert.deepEqual(prisUrBriefText('Price exactly 559 kr (compare-at 932 kr).'), { pris: 559, jamforpris: 932 });
  assert.deepEqual(prisUrBriefText('Pris exakt: 1 129 kr'), { pris: 1129, jamforpris: null });
  assert.deepEqual(prisUrBriefText('> 1 129 kr (ord. 1 469 kr). Fri frakt.'), { pris: 1129, jamforpris: 1469 });
  assert.deepEqual(prisUrBriefText('No price in this ad.'), { pris: null, jamforpris: null });
  assert.deepEqual(kronorI('1 129 kr (ord. 1 469 kr), spara 340 kr — 5,0 av 5, 6,5 × 3 m, 30–40 cm'), [1129, 1469, 340]);
  assert.deepEqual(kronorI('1 129 kronor. Fri frakt.'), [1129]);
  assert.deepEqual(kronorI('Betala 1 129 kr | Pay 1,129 SEK'), [1129], 'English meaning-kolumnens tusentalskomma är samma belopp');
  assert.deepEqual(kronorI('Ordinarie pris 1 182 kr. | Regular price 1,182 SEK.'), [1182]);
});

test('trefragorUr: tabellen hittas, ❌-rader plockas ut, saknad tabell rapporteras — och i "Competitor-signable?" är ❌ rätt svar', () => {
  assert.deepEqual(trefragorUr(BRA), { finns: true, underkanda: [] });
  const med = BRA.replace('| ✅ two named surfaces | ✅ literally true |', '| ❌ abstract | ✅ literally true |');
  assert.deepEqual(trefragorUr(med).underkanda, ['Vattnet stannar på väven. Taket under är torrt.']);
  assert.deepEqual(trefragorUr(somNotionDump(med)).underkanda, ['Vattnet stannar på väven. Taket under är torrt.']);
  assert.equal(trefragorUr('# Brief\nHypothesis: x').finns, false);
  // Bäverbutikens tabell: Visualize (amerikansk stavning), Competitor-signable ❌ = konkurrenten kan INTE skriva under = rätt.
  assert.deepEqual(trefragorUr(BAVER_VIDEO), { finns: true, underkanda: [] });
  const signbar = BAVER_VIDEO.replace('Passar din 1000 L IBC-tank rakt av. | ✅ | ✅ | ❌ | Ship', 'Passar din 1000 L IBC-tank rakt av. | ✅ | ✅ | ✅ | Ship');
  assert.deepEqual(trefragorUr(signbar).underkanda, ['Passar din 1000 L IBC-tank rakt av.'], 'en rad konkurrenten kan skriva under föll');
  const kill = BAVER_VIDEO.replace('Solljus in i tanken. Alger i vattnet. | ✅ | ✅ | ❌ | Ship', 'Solljus in i tanken. Alger i vattnet. | ❌ | ✅ | ❌ | Kill');
  assert.deepEqual(trefragorUr(kill).underkanda, ['Solljus in i tanken. Alger i vattnet.']);
  assert.deepEqual(trefragorUr(BAVER_BILD).underkanda, [], 'Verdict ✅ är godkänt');
});

test('dodaKoncept: "GT får inga briefer" ur dna.md, med citatet — aldrig ett småbokstavsord', () => {
  const dna = '## Mönster 12\n→ **Instruktion:** GT får **inga briefer** i batch #3. Innan vinkeln döms …\n→ **Instruktion:** SP får flest briefer varje rond.\nDärför och PD får inga briefer heller.';
  const d = dodaKoncept(dna);
  assert.deepEqual(d.map((x) => x.koncept), ['GT', 'PD']);
  assert.match(d[0].citat, /GT får inga briefer i batch #3/);
  assert.deepEqual(dodaKoncept('SP får flest briefer.'), []);
  // Den riktiga dna.md för CaraShell (speglad ur Bäver-hubben) bär instruktionen från körning nr 3.
  const riktig = readFileSync(new URL('../../products/carashell/takskyddet/dna.md', import.meta.url), 'utf8');
  assert.ok(dodaKoncept(riktig).some((x) => x.koncept === 'GT'));
});

test('variant eller nytt koncept: förälder, isolerad variabel, källa, gissning', () => {
  assert.equal(arVariant(BRA), true);
  assert.equal(isoleradVariabel(BRA), 'the setting of the photo');
  const nytt = '# X\n**Parent / source:** Backlog #4, built on the product file\'s own `usp`.\n## 2. Hypothesis\nLeading with the one-person install converts better.';
  assert.equal(arVariant(nytt), false);
  assert.deepEqual(kallaUr(nytt), { kalla: true, gissning: false });
  assert.deepEqual(kallaUr('# X\nA new idea.\n## 2. Hypothesis\nMaybe.'), { kalla: false, gissning: false });
  assert.equal(kallaUr('# X\n⚠️ guess — no data separates the avatars.\n## 2. Hypothesis\nMaybe.').gissning, true);
});

test('kpiUr + roasEnsamt: break-even ur KPI:n, target som domlinje, ROAS ensamt — och Bäver-briefer utan KPI', () => {
  assert.deepEqual(kpiUr(BRA), { finns: true, breakEvenCpa: 693, motTarget: false });
  assert.equal(kpiUr('## 9. KPI\nJudged against target CPA 411 kr.').motTarget, true);
  assert.equal(kpiUr('9. KPI\nJudged against break-even CPA of 693 kr (never against target).').breakEvenCpa, 693);
  assert.equal(kpiUr(BAVER_VIDEO).finns, false);
  assert.equal(roasEnsamt(BRA), false);
  assert.equal(roasEnsamt('## 1. Why this ad exists\nThe parent has ROAS 6.7, the best in the account.\n## 2. Hypothesis\nMore of it.'), true);
  assert.equal(roasEnsamt('## 1. Why this ad exists\nROAS 6.7 and CPA 169 kr, 58 % of profit contribution.\n## 2. Hypothesis\nMore.'), false);
  assert.equal(roasEnsamt('Make: x\nWhy: the parent has ROAS 6.7 so more of it.\nHook'), true, 'Why-raden räknas');
  // Källan i Bäver-huvudet: "the winning structure held for 5 readings" är egen data; "removes that objection" är ingen källa.
  assert.deepEqual(kallaUr(BAVER_VIDEO), { kalla: true, gissning: false });
  assert.deepEqual(kallaUr(BAVER_BILD), { kalla: false, gissning: false });
});

// ------------------------------------------------------------ domen

test('granskaBrief: en brief som håller alla regler får noll fel och noll anmärkningar — i båda formerna', () => {
  const md = granskaBrief({ ...RAD, text: BRA }, CTX);
  assert.deepEqual(md.fel, [], JSON.stringify(md.fel));
  assert.deepEqual(md.anmarkningar, [], JSON.stringify(md.anmarkningar));
  assert.equal(md.fakta.koncept, 'SP');
  assert.equal(md.fakta.ar_variant, true);
  assert.equal(md.fakta.image_prompt, true);
  const dump = granskaBrief({ ...RAD, text: somNotionDump(BRA) }, CTX);
  assert.deepEqual(dump.fel, [], JSON.stringify(dump.fel));
  assert.deepEqual(dump.anmarkningar, [], JSON.stringify(dump.anmarkningar));
});

test('granskaBrief: butikens namn i annonstexten är ett fel — Bäverbutiken OCH den speglade butiken; i rationalen är det inget', () => {
  const text = BRA.replace('– Lars, ett av 16 omdömen', '– Lars, ett av 16 omdömen på carashell.se').replace('**Headline:** `16 omdömen', '**Headline:** `Bäverbutiken: 16 omdömen');
  const g = granskaBrief({ ...RAD, text }, CTX);
  const f = g.fel.find((x) => x.kod === 'butiksnamn');
  assert.ok(f, JSON.stringify(g.fel));
  assert.match(f.text, /Bäverbutiken/);
  assert.match(f.text, /carashell\.se/);
  const bara = BRA.replace('SP is the strongest angle', 'SP is Bäverbutiken\'s strongest angle');
  assert.equal(granskaBrief({ ...RAD, text: bara }, CTX).fel.length, 0, 'namnet i "Why this ad exists" stoppar inte');
  const utan = BRA.replace('- **The ad never names the store** — not in copy, on the image, in voice-over or captions.\n', '');
  assert.ok(koder(granskaBrief({ ...RAD, text: utan }, CTX).anmarkningar).includes('hardrules'));
});

test('granskaBrief: priset mot butiken, läst live ur radens Landing page — fel pris, fel jämförpris, okänt pris, främmande belopp', () => {
  const fel = granskaBrief({ ...RAD, text: BRA.replace('Price **1 129 kr**, compare-at **1 469 kr**', 'Price **1 199 kr**, compare-at **1 499 kr**') }, CTX);
  const pris = fel.fel.filter((x) => x.kod === 'pris');
  assert.equal(pris.length, 2, JSON.stringify(pris));
  assert.match(pris[0].text, /1199 kr.*1129 kr/);
  assert.match(pris[1].text, /1499.*1469/);
  const okant = granskaBrief({ ...RAD, text: BRA }, { ...CTX, pris_butik: null });
  assert.ok(okant.anmarkningar.some((x) => x.kod === 'pris' && /could not be read/.test(x.text)), 'okänt pris är aldrig tyst grönt');
  assert.equal(okant.fel.length, 0);
  const frammande = granskaBrief({ ...RAD, text: BRA.replace('Fri frakt inom Sverige.', 'En takreparation kostar 20 000 kr.') }, CTX);
  assert.ok(frammande.anmarkningar.some((x) => x.kod === 'pris' && /20000/.test(x.text)));
});

test('granskaBrief: Bäverbutikens eget format — video ren, bild med butikens domän i CTA:n får ETT fel; resten är anmärkningar till skrivaren', () => {
  // Skriven 2026-09-18, före regikravet ⇒ den saknade regitabellen är en anmärkning, inte ett fel.
  const video = granskaBrief({ namn: 'IBC_PD_10_H1', typ: 'video', typ_notion: 'Video - Pending Approval', status: 'Creative strat review', skapad_dag: '2026-09-18', text: BAVER_VIDEO }, { prefix: 'IBC', butiksnamn: BAVER_NAMN, pris_butik: { pris: 489, jamforpris: 636 } });
  assert.deepEqual(video.fel, [], JSON.stringify(video.fel));
  assert.deepEqual([...new Set(koder(video.anmarkningar))].sort(), ['ai', 'copy', 'hardrules', 'komponent', 'regi', 'taggar'], JSON.stringify(video.anmarkningar));
  assert.ok(video.anmarkningar.some((x) => x.kod === 'regi' && /written before 2026-09-21/.test(x.text)));
  assert.equal(video.fakta.regi, '0/3');
  // Samma brief utan datum (spärrläget) eller skriven efter regeln ⇒ FEL.
  const nyVideo = granskaBrief({ namn: 'IBC_PD_10_H1', typ: 'video', skapad_dag: '2026-09-22', text: BAVER_VIDEO }, { prefix: 'IBC', pris_butik: { pris: 489, jamforpris: 636 } });
  assert.ok(koder(nyVideo.fel).includes('regi'));
  assert.ok(koder(granskaBrief({ namn: 'IBC_PD_10_H1', typ: 'video', text: BAVER_VIDEO }, { prefix: 'IBC' }).fel).includes('regi'));
  assert.deepEqual(video.fakta.pris_brief, { pris: 489, jamforpris: 636 });
  assert.equal(video.fakta.trefragor, true);
  const bild = granskaBrief({ namn: 'Batmotor_BOF_2_1', typ: 'bild', typ_notion: 'Image - Pending Approval', status: 'Draft', text: BAVER_BILD }, { prefix: 'Batmotor', butiksnamn: BAVER_NAMN, pris_butik: { pris: 579, jamforpris: 965 } });
  assert.deepEqual(koder(bild.fel), ['butiksnamn'], JSON.stringify(bild.fel));
  assert.match(bild.fel[0].text, /baverbutiken\.se/);
  assert.deepEqual([...new Set(koder(bild.anmarkningar))].sort(), ['copy', 'hardrules', 'kalla', 'komponent'], JSON.stringify(bild.anmarkningar));
  assert.equal(bild.fakta.taggar.vinkel, 'trust/guarantee');
  // Fel pris mot butiken (läst live) är redigerarens sak.
  const felPris = granskaBrief({ namn: 'Batmotor_BOF_2_1', typ: 'bild', text: BAVER_BILD }, { prefix: 'Batmotor', pris_butik: { pris: 599, jamforpris: 965 } });
  assert.ok(felPris.fel.some((x) => x.kod === 'pris' && /579 kr.*599 kr/.test(x.text)));
});

test('granskaBrief: taggar, hypotes, tre-frågorstestet, döda koncept', () => {
  const utanTaggar = granskaBrief({ ...RAD, text: BRA.replace(/\*\*VARIABELTAGGAR:\*\*[^\n]*\n/, '') }, CTX);
  assert.ok(koder(utanTaggar.anmarkningar).includes('taggar'), 'skrivarens sak — aldrig en kommentar till redigeraren');
  assert.ok(!koder(utanTaggar.fel).includes('taggar'));
  const utanCopy = BRA.replace(' · copy_model=`sonnet`', '');
  assert.ok(koder(granskaBrief({ ...RAD, text: utanCopy }, { ...CTX, copyModell: 'ab' }).anmarkningar).includes('taggar'), 'A/B:t pågår ⇒ anmärkning');
  assert.ok(!koder(granskaBrief({ ...RAD, text: utanCopy }, CTX).anmarkningar).includes('taggar'), 'Bäverbutiken har inget A/B ⇒ inget');
  const utanHypotes = granskaBrief({ ...RAD, text: BRA.replace(/## 2\. Hypothesis\n[^\n]+\n/, '## 2. Hypothesis\n') }, CTX);
  assert.ok(koder(utanHypotes.anmarkningar).includes('hypotes'));
  assert.ok(!koder(utanHypotes.fel).includes('hypotes'));
  const kryss = granskaBrief({ ...RAD, text: BRA.replace('| ✅ two named surfaces | ✅ literally true |', '| ❌ abstract | ✅ literally true |') }, CTX);
  const tre = kryss.fel.find((x) => x.kod === 'trefragor');
  assert.ok(tre);
  assert.match(tre.text, /`Vattnet stannar på väven\. Taket under är torrt\.`/, 'svenska rader i backticks');
  assert.equal(serUtSomSvenska(tre.text), false, 'felraden får inte se svensk ut');
  const gt = granskaBrief({ ...RAD, namn: 'Takoverdrag_GT_5_1', text: BRA.replace(/Takoverdrag_SP_5_1/g, 'Takoverdrag_GT_5_1') }, CTX);
  const dna = gt.anmarkningar.find((x) => x.kod === 'dna');
  assert.ok(dna);
  assert.match(dna.text, /GT får inga briefer/);
});

test('granskaBrief: namnet — hubbens prefix, products.json-prefixet, Typ mot variant, skiftläge', () => {
  const fel = (namn, typ = 'bild', ctx = CTX) => koder(granskaBrief({ ...RAD, namn, typ, text: BRA.replace(/Takoverdrag_SP_5_1/g, namn) }, ctx).fel);
  assert.ok(fel('Termoskydd_SP_5_1').includes('namn'), 'fel produkts prefix i hubben');
  assert.ok(fel('Takoverdrag_SP_5_H1', 'bild').includes('typ'), 'bild med H-variant');
  assert.ok(fel('Takoverdrag_SP_5_1', 'video').includes('typ'), 'video med bildvariant');
  assert.ok(!fel('Takoverdrag_SP_5_1').includes('namn'));
  assert.ok(!fel('Takoverdrag_SP_105_1').includes('namn'), 'Bäverbutiken har inget spegelintervall — 105 är ett vanligt nummer');
  assert.ok(fel('Takoverdrag_SP_5_1', 'bild', { ...CTX, creative_prefix: 'Enginecover_' }).includes('namn'), 'products.json-prefixet vinner när det finns');
  assert.ok(!fel('Enginecover_SP_5_1', 'bild', { ...CTX, prefix: 'Takoverdrag', creative_prefix: 'Enginecover_' }).includes('namn'));
  assert.ok(!fel('Takoverdrag_SP_5_1', 'bild', { ...CTX, prefix: null }).includes('namn'), 'utan prefix mäts inget');
  const skiftlage = granskaBrief({ ...RAD, namn: 'takoverdrag_SP_5_1', text: BRA }, CTX);
  assert.ok(koder(skiftlage.anmarkningar).includes('namn'));
  assert.ok(!koder(skiftlage.fel).includes('namn'));
});

test('granskaBrief: variant utan isolerad variabel, nytt koncept utan källa, två variabler', () => {
  const utanIso = granskaBrief({ ...RAD, text: BRA.replace('**Isolated variable: the setting of the photo.** Every proof element the parent carries stays word for word. Only the scene changes.', 'Everything changes a bit.') }, CTX);
  assert.ok(koder(utanIso.anmarkningar).includes('variabel'));
  assert.equal(utanIso.fel.length, 0);
  const tva = granskaBrief({ ...RAD, text: BRA.replace('Isolated variable: the setting of the photo.', 'Isolated variable: the setting and the quote.') }, CTX);
  assert.ok(koder(tva.anmarkningar).includes('variabel'));
  const nytt = BRA.replace("the winner's proof, moved into the weather it talks about", 'a fresh angle').replace(' · typ=`I` · parent=`Takoverdrag_SP_2_1` · iteration=`1`', ' · typ=`N`').replace('kalla=`parent`', 'kalla=`rutin`').replace("**Memo:** the parent's proof lands harder when the rain it names is in the photo — same words, the scene does the convincing.", '**Memo:** a scene nobody has tried.').replace('**Parent:** `Takoverdrag_SP_2_1` — the account\'s best ad: 846 kr, 5 purchases, CPA 169 kr, 58 % of all profit contribution (measured 2026-09-16).\n', '').replace('**Isolated variable: the setting of the photo.** Every proof element the parent carries stays word for word. Only the scene changes.\n', '').replace('SP is the strongest angle by a distance — 42 % of spend, 12 of 20 purchases, CPA 266 kr against break-even 693 kr — and `SP_2_1` is the single ad carrying it.', 'A fresh idea nobody asked for.');
  assert.match(nytt, /the parent's 169 kr/);
  assert.ok(koder(granskaBrief({ ...RAD, text: nytt }, CTX).anmarkningar).includes('kalla'));
  assert.equal(granskaBrief({ ...RAD, text: nytt }, CTX).fel.length, 0, 'källan är skrivarens sak');
  assert.ok(!koder(granskaBrief({ ...RAD, text: nytt.replace('A fresh idea nobody asked for.', 'A fresh idea — a guess, no data separates it.') }, CTX).anmarkningar).includes('kalla'));
});

test('granskaBrief: bild utan textrader, video utan manustabell, IMAGE PROMPT bara när blocket är trasigt, KPI och COPY CARD som anmärkningar', () => {
  const utanPrompt = granskaBrief({ ...RAD, text: BRA.replace(/## IMAGE PROMPT[\s\S]*$/, '') }, CTX);
  assert.ok(!koder(utanPrompt.fel).includes('bild'), 'Bäverbutikens /bildannonser bygger prompten ur briefen — saknat block är inget fel');
  assert.equal(utanPrompt.fakta.image_prompt, false);
  const utanText = granskaBrief({ ...RAD, text: BRA.replace(/## 4\. Exact text[\s\S]*?(?=## 5)/, '') }, CTX);
  assert.ok(koder(utanText.fel).includes('bild'), 'bild utan textrader = redigeraren har inget att sätta på bilden');
  const video = { ...RAD, namn: 'Takoverdrag_SP_5_H1', typ: 'video', typ_notion: 'Video - Pending Approval' };
  const utanManus = granskaBrief({ ...video, text: BRA.replace(/Takoverdrag_SP_5_1/g, 'Takoverdrag_SP_5_H1').replace(/## 4\. Exact text[\s\S]*?(?=## 5)/, '') }, CTX);
  assert.ok(koder(utanManus.fel).includes('video'));
  const medManus = granskaBrief({ ...video, text: BRA.replace(/Takoverdrag_SP_5_1/g, 'Takoverdrag_SP_5_H1').replace('or captions', 'or overlays') }, CTX);
  assert.ok(!koder(medManus.fel).includes('video'));
  assert.ok(koder(medManus.anmarkningar).includes('video'), 'ingen caption-kolumn eller caption-regel ⇒ anmärkning');
  const target = granskaBrief({ ...RAD, text: BRA.replace('Judged against break-even CPA **693 kr** (never against target).', 'Judged against target CPA **411 kr**.') }, CTX);
  assert.ok(target.anmarkningar.some((x) => x.kod === 'kpi' && /target/.test(x.text)));
  assert.equal(target.fel.length, 0);
  const felLinje = granskaBrief({ ...RAD, text: BRA }, { ...CTX, breakEvenCpa: 700 });
  assert.ok(felLinje.anmarkningar.some((x) => x.kod === 'kpi' && /693.*700/.test(x.text)));
  assert.ok(!granskaBrief({ ...RAD, text: BRA }, { ...CTX, breakEvenCpa: null }).anmarkningar.some((x) => x.kod === 'kpi'), 'utan products.json-linje döms inte talet');
  const utanCopy = granskaBrief({ ...RAD, text: BRA.replace(/## 7\. COPY CARD[\s\S]*?(?=## 8)/, '') }, CTX);
  assert.ok(koder(utanCopy.anmarkningar).includes('copy'));
  assert.equal(utanCopy.fel.length, 0);
});

// ------------------------------------------------------------ ronden

test('svenskDag + dagarMellan + valjRond: --rond, annars hubbens nyaste dag; åldersgränsen gäller bara utan --rond', () => {
  assert.equal(svenskDag('2026-09-15T22:30:00.000Z'), '2026-09-16', '00:30 svensk tid är nästa dag');
  assert.equal(svenskDag('trasigt'), null);
  assert.equal(dagarMellan('2026-09-05', '2026-09-18'), 13);
  assert.equal(dagarMellan('x', '2026-09-18'), null);
  const rader = [
    { namn: 'A_SP_1_1', skapad_dag: '2026-09-14' }, { namn: 'A_SP_2_1', skapad_dag: '2026-09-16' }, { namn: 'A_SP_3_1', skapad_dag: '2026-09-16' },
  ];
  const r = valjRond(rader, { idag: '2026-09-18' });
  assert.equal(r.datum, '2026-09-16');
  assert.equal(r.kalla, 'hubbens nyaste dag');
  assert.equal(r.rader.length, 2);
  assert.equal(r.alder, 2);
  assert.equal(r.for_gammal, false);
  assert.deepEqual(r.per_dag, { '2026-09-14': 1, '2026-09-16': 2 });
  const gammal = valjRond(rader, { idag: '2026-09-30' });
  assert.equal(gammal.for_gammal, true, `${MAXDAGAR} dagar är gränsen`);
  assert.equal(valjRond(rader, { idag: '2026-09-30', rond: '2026-09-14' }).for_gammal, false, '--rond granskar ändå');
  assert.equal(valjRond(rader, { rond: '2026-09-14' }).rader.length, 1);
  assert.equal(valjRond([], {}).datum, null);
});

test('redanGranskad: en Feedback-rad vars titel bär rondens datum', () => {
  const feedback = [{ titel: 'Brief review 2026-09-16', url: 'u1' }, { titel: 'Feedback from Carl', url: 'u2' }];
  assert.equal(redanGranskad(feedback, '2026-09-16').url, 'u1');
  assert.equal(redanGranskad(feedback, '2026-09-18'), null);
  assert.equal(redanGranskad([], '2026-09-18'), null);
  assert.equal(feedbackTitel('2026-09-18'), 'Brief review 2026-09-18');
});

test('hittaBatch: batchen som delar flest namn med ronden, ur manifest.json', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'briefgranskning-'));
  for (const [b, namn] of [['batch-02', ['X_SP_4_1', 'X_PD_4_1']], ['batch-03', ['X_SP_5_1', 'X_SP_6_1', 'X_PD_6_1']]]) {
    mkdirSync(join(mapp, b));
    writeFileSync(join(mapp, b, 'manifest.json'), JSON.stringify(namn.map((n) => ({ namn: n, typ: 'bild', brief: `${n}/brief.md` }))));
  }
  const t = hittaBatch(mapp, ['X_SP_5_1', 'X_PD_6_1']);
  assert.equal(t.batch, 3);
  assert.equal(t.traffar, 2);
  assert.equal(t.antal, 3);
  assert.equal(hittaBatch(mapp, ['X_GT_9_1']), null);
  assert.equal(hittaBatch('/finns/inte', ['X']), null);
});

test('nastaGranskning: nästa måndag eller torsdag efter dagen', () => {
  assert.equal(nastaGranskning('2026-09-17'), '2026-09-21', 'torsdag → måndag');
  assert.equal(nastaGranskning('2026-09-21'), '2026-09-24', 'måndag → torsdag');
  assert.equal(nastaGranskning('2026-09-18'), '2026-09-21', 'fredag → måndag');
  assert.equal(nastaGranskning('nej'), null);
});

// ------------------------------------------------------------ skrivläget

const DOM = {
  hub_id: TAK_HUB, rond: '2026-09-16',
  bra: ['Every brief carries VARIABELTAGGAR and a parent'],
  missat: ['`Takoverdrag_CS_5_1` names the store in the primary text'],
  regler: ['Never put the store name or domain in the primary text, headline or description', 'Every image brief needs an Exact text table, otherwise it goes live as a plain photo', 'Cite the parent ad with its CPA and purchases, not with ROAS alone'],
  rader: [
    { namn: 'Takoverdrag_SP_5_1', fel: [], anmarkningar: [], bra: ['clean'] },
    { namn: 'Takoverdrag_CS_5_1', fel: ['the ad text names the store (baverbutiken.se) — never in copy'], anmarkningar: ['no caption rule'] },
  ],
};
const KO = {
  hub: { id: TAK_HUB, titel: 'BÄVER For CARL Taköverdraget för Husvagn', url: 'https://notion.so/hub' },
  rond: { datum: '2026-09-16' },
  rader: [{ namn: 'Takoverdrag_SP_5_1', page_id: 'p1', url: 'https://notion.so/p1' }, { namn: 'Takoverdrag_CS_5_1', page_id: 'p2', url: 'https://notion.so/p2' }],
};

test('giltigDom: hub-id, tre regler, alla rader dömda, inga okända rader, engelska överallt', () => {
  assert.deepEqual(giltigDom(DOM, KO), { ok: true, fel: [] });
  assert.match(giltigDom({ ...DOM, hub_id: 'annan' }, KO).fel.join(), /hub_id/);
  assert.equal(giltigDom({ ...DOM, hub_id: TAK_HUB.replace(/-/g, '') }, KO).ok, true, 'id med och utan bindestreck är samma hub');
  assert.match(giltigDom({ ...DOM, regler: DOM.regler.slice(0, 2) }, KO).fel.join(), /exakt tre regler/);
  assert.match(giltigDom({ ...DOM, rader: DOM.rader.slice(0, 1) }, KO).fel.join(), /CS_5_1.*saknar en dom/);
  assert.match(giltigDom({ ...DOM, rader: [...DOM.rader, { namn: 'X_1_1', fel: [] }] }, KO).fel.join(), /finns inte i rondens kö/);
  assert.match(giltigDom({ ...DOM, rond: '2026-09-14' }, KO).fel.join(), /≠ köns rond/);
  const svensk = giltigDom({ ...DOM, rader: [DOM.rader[0], { namn: 'Takoverdrag_CS_5_1', fel: ['annonsen nämner butiken och det är inte tillåtet'] }] }, KO);
  assert.match(svensk.fel.join(), /ser svenskt ut/);
  const citat = giltigDom({ ...DOM, rader: [DOM.rader[0], { namn: 'Takoverdrag_CS_5_1', fel: ['the line "Ett av 16 omdömen – alla fem stjärnor" is not falsifiable'] }] }, KO);
  assert.match(citat.fel.join(), /backticks/);
  assert.equal(giltigDom({ ...DOM, rader: [DOM.rader[0], { namn: 'Takoverdrag_CS_5_1', fel: ['the line `Ett av 16 omdömen – alla fem stjärnor` is not falsifiable'] }] }, KO).ok, true);
  assert.match(giltigDom({ ...DOM, regler: ['Skriv aldrig butikens namn i annonsen, det är inte tillåtet', DOM.regler[1], DOM.regler[2]] }, KO).fel.join(), /regel 1 ser svensk ut/);
  assert.match(giltigDom({ ...DOM, bra: ['alla briefer har taggar och det är bra'] }, KO).fel.join(), /bra: .*ser svenskt ut/);
});

test('kommentarText: engelsk, med markören och hubben, numrerade fel, aldrig statusbyte', () => {
  const t = kommentarText({ namn: 'X', fel: ['the ad text names the store', 'price 1 199 kr, store says 1 129 kr'] }, { datum: '2026-09-16', hub: 'BÄVER IBC-Tanköverdraget' });
  assert.ok(t.startsWith(`${KOMMENTARMARKE} 2026-09-16 (BÄVER IBC-Tanköverdraget)`));
  assert.match(t, /1\. the ad text names the store\n2\. price/);
  assert.match(t, /Status unchanged/);
  assert.equal(serUtSomSvenska(t), false);
});

test('feedbackSektion + laggInSektion: daterad sektion, tre regler, tabellen — och omkörning byter ut, lägger inte till', () => {
  const s = feedbackSektion(DOM, { idag: '2026-09-18', batch: 3, hub: KO.hub.titel });
  assert.match(s, /^## Rond 2026-09-16 — batch #3 \(2 briefer\) · granskad 2026-09-18 · hub BÄVER For CARL/);
  assert.match(s, /\*\*Tre regler för nästa rond\*\*\n1\. Never put/);
  assert.match(s, /\| `Takoverdrag_CS_5_1` \| ❌ \| the ad text names the store/);
  assert.match(s, /\| `Takoverdrag_SP_5_1` \| ✅ \| — \| — \|/);
  assert.equal(domFor(DOM.rader[1]), 'fel');
  const forsta = laggInSektion('', '2026-09-16', s, { rubrik: '# Feedback' });
  assert.ok(forsta.startsWith('# Feedback\n\n---\n\n## Rond 2026-09-16'));
  assert.equal(harSektion(forsta, '2026-09-16'), true);
  assert.equal(harSektion(forsta, '2026-09-14'), false);
  const andra = laggInSektion(forsta, '2026-09-20', s.replace('2026-09-16', '2026-09-20'), {});
  assert.equal((andra.match(/^## Rond /gm) || []).length, 2);
  const om = laggInSektion(andra, '2026-09-16', s.replace('Never put', 'ALWAYS keep'), {});
  assert.equal((om.match(/^## Rond /gm) || []).length, 2, 'omkörning ger ingen tredje sektion');
  const i16 = om.indexOf('## Rond 2026-09-16');
  const i20 = om.indexOf('## Rond 2026-09-20');
  assert.ok(i16 < i20, 'ordningen står kvar');
  const bara16 = om.slice(i16, i20);
  assert.match(bara16, /ALWAYS keep/);
  assert.doesNotMatch(bara16, /1\. Never put/, 'den gamla texten är utbytt, inte kvar bredvid');
  assert.match(om.slice(i20), /1\. Never put/, 'den andra ronden är orörd');
});

test('feedbackRadMarkdown: titeln bär rondens datum, tre sektioner, tre regler, tabell per brief — engelska', () => {
  const md = feedbackRadMarkdown(DOM, { idag: '2026-09-18', hubTitel: KO.hub.titel });
  assert.match(md, /^# Brief review 2026-09-16 — BÄVER For CARL Taköverdraget för Husvagn\n/);
  assert.match(md, /2 briefs created 2026-09-16 — 1 clean, 0 with notes, 1 with errors/);
  assert.match(md, /## What the round got right\n- Every brief carries/);
  assert.match(md, /## What it missed\n- `Takoverdrag_CS_5_1` names the store/);
  assert.match(md, /## Three rules for the next round\n[^\n]*\n1\. Never put[\s\S]*3\. Cite the parent/);
  assert.match(md, /\| Takoverdrag_CS_5_1 \| ❌ \| the ad text names the store \(baverbutiken\.se\) — never in copy \| no caption rule \|/);
  assert.match(md, /No status was changed/);
  assert.equal(serUtSomSvenska(md.replace(/`[^`]*`/g, ' ').replace(/\|[^\n]*\|/g, ' ')), false, 'raden läses av redigerarna på engelska');
  const tom = feedbackRadMarkdown({ ...DOM, bra: [], missat: [] }, { idag: '2026-09-18' });
  assert.match(tom, /- nothing to single out/);
  assert.match(tom, /- nothing\n/);
});

test('feedbackEgenskaper: Typ Feedback, Status Draft när hubben har den, Skapad = i dag — och varningar när något saknas', () => {
  const s = hubbSchema();
  const e = feedbackEgenskaper(s, { rond: '2026-09-16', idag: '2026-09-18' });
  assert.deepEqual(e.properties.Namn, { title: [{ type: 'text', text: { content: 'Brief review 2026-09-16' } }] });
  assert.deepEqual(e.properties.Typ, { select: { name: FEEDBACK_TYP } });
  assert.deepEqual(e.properties.Status, { status: { name: 'Draft' } });
  assert.deepEqual(e.properties.Skapad, { date: { start: '2026-09-18' } });
  assert.deepEqual(e.varningar, []);
  const multi = feedbackEgenskaper(hubbSchema({ typTyp: 'multi_select' }), { rond: '2026-09-16', idag: '2026-09-18' });
  assert.deepEqual(multi.properties.Typ, { multi_select: [{ name: FEEDBACK_TYP }] });
  const utanFeedback = feedbackEgenskaper(hubbSchema({ typer: ['Video - Pending Approval'], statusar: ['To do', 'To be Reviewed'] }), { rond: '2026-09-16', idag: '2026-09-18' });
  assert.deepEqual(utanFeedback.properties.Typ, { select: { name: FEEDBACK_TYP } }, 'alternativet skapas av Notion');
  assert.equal('Status' in utanFeedback.properties, false, 'ingen Draft ⇒ hubbens standardstatus');
  assert.equal(utanFeedback.varningar.length, 2);
  assert.throws(() => feedbackEgenskaper({ Typ: { type: 'select', select: { options: [] } } }, { rond: 'x', idag: 'y' }), /titelfält/);
});

// ------------------------------------------------------------ körningen och rapporten

const KO_ALLA = {
  idag: '2026-09-21', varningar: [], stopp: [],
  hubbar: [
    { id: TAK_HUB, titel: 'BÄVER For CARL Taköverdraget för Husvagn', laget: 'att_doma', rond: '2026-09-20', antal: 9 },
    { id: '76b270ab-908c-8393-8a47-01f6ae366d42', titel: 'BÄVER IBC-Tanköverdraget', laget: 'att_doma', rond: '2026-09-20', antal: 9 },
    { id: '3cc270ab-908c-8179-bde9-d11a87ed06fb', titel: 'Kranskydd Frost 420D creative hub', laget: 'hoppad', skal: 'latest round 2026-09-05 is 16 days old (limit 10) — no newer briefs to give feedback on', rond: '2026-09-05', antal: 9 },
    { id: '3a7270ab-908c-807d-b90d-c55d885cad13', titel: 'Product test center SE BÄVER', laget: 'hoppad', skal: 'not a creative hub: Status lacks the brief lifecycle (Draft → To be Reviewed) — products or SOPs, not briefs' },
    { id: MOTOR_HUB, titel: 'Boat cover 420D creative hub', laget: 'olasbar', skal: 'Notion 404 — archived or not shared with the integration' },
  ],
};
const RESULTAT = [{ hub_id: TAK_HUB, hub_titel: 'BÄVER For CARL Taköverdraget för Husvagn', rond: '2026-09-20', antal: 9, rena: 7, anm: 1, fel: 1, feedback_rad: { skapad: true, url: 'u' }, kommentarer: [{ namn: 'Takoverdrag_CS_9_1', utfall: 'skriven' }], feedback_fil: 'products/carashell/takskyddet/feedback.md', varningar: [] }];

test('samlaKorning: dömda hubbar blir granskade, lästa utan dom blir "ej dömda", resten följer med', () => {
  const k = samlaKorning(KO_ALLA, RESULTAT);
  assert.equal(k.idag, '2026-09-21');
  const lagen = Object.fromEntries(k.hubbar.map((h) => [h.titel, h.laget]));
  assert.equal(lagen['BÄVER For CARL Taköverdraget för Husvagn'], 'granskad');
  assert.equal(lagen['BÄVER IBC-Tanköverdraget'], 'ej_domd');
  assert.equal(lagen['Kranskydd Frost 420D creative hub'], 'hoppad');
  assert.equal(lagen['Boat cover 420D creative hub'], 'olasbar');
  const tak = k.hubbar.find((h) => h.laget === 'granskad');
  assert.equal(tak.kommentarer, 1);
  assert.equal(tak.feedback_rad, true);
  assert.equal(tak.feedback_fil, 'products/carashell/takskyddet/feedback.md');
});

test('byggRapport: engelsk, en hub per rad, ej dömda ronder syns, ping bara vid stopp', () => {
  const k = samlaKorning(KO_ALLA, RESULTAT);
  const { text, ping_axel } = byggRapport(k);
  assert.match(text, /^🔎 BÄVERBUTIKEN brief review — 2026-09-21\nHubs found: 5 · reviewed: 1 · skipped: 2 · unreadable: 1 · NOT judged: 1/);
  assert.match(text, /• `BÄVER For CARL Taköverdraget för Husvagn` — round 2026-09-20, 9 briefs: 7 clean · 1 with notes · 1 with errors · Feedback row `Brief review 2026-09-20` · 1 comment on rows · rules in products\/carashell\/takskyddet\/feedback\.md/);
  assert.match(text, /Rounds read but not judged[\s\S]*`BÄVER IBC-Tanköverdraget` — round 2026-09-20, 9 briefs/);
  assert.match(text, /\*\*Skipped\*\*\n• `Kranskydd Frost 420D creative hub` — latest round 2026-09-05 is 16 days old/);
  assert.match(text, /\*\*Unreadable\*\*\n• `Boat cover 420D creative hub` — Notion 404/);
  assert.match(text, /✅ Nothing for you to do\. Next run: 2026-09-24/);
  assert.equal(ping_axel, false);
  assert.equal(serUtSomSvenska(text.replace(/`[^`]*`/g, ' ')), false, 'hubbtitlarna står i backticks så engelskspärren släpper rapporten');
  const stopp = byggRapport({ ...k, stopp: ['No creative hub could be found in Notion — check Connections'] });
  assert.match(stopp.text, /\*\*🔴 ACTION NEEDED — Axel:\*\*\n1\. No creative hub/);
  assert.equal(stopp.ping_axel, true);
  assert.ok(stopp.text.length < 2000, 'ryms i ett Discord-meddelande');
});

// ------------------------------------------------------------ regi (2.9) + komponenttaggar (2.12), Axels beslut 2026-09-21

/** En videobrief med regitabell enligt docs/os/BRIEF-REGI.md — huvudsessionens format. */
const VIDEO_REGI = `# Damasker_PD_12_H1 — the winner's hook, the wet-sock proof moved to the front

**VARIABELTAGGAR:** vinkel=\`PD problem/lösning\` · hook-typ=\`påstående\` · format=\`video, demo\` · proof=\`demo (blöt/torr strumpa)\` · offer-i-creativen=\`pris i CTA\` · visuell stil=\`två ben, blöt stig\` · textmängd=\`≤8 ord per caption\` · talare=\`röst utan ansikte\` · copy_model=\`sonnet\` · typ=\`I\` · parent=\`Damasker_PD_1\` · iteration=\`2\` · koncept=\`PD strumpbevis\` · kalla=\`parent\` · avatar=\`vandraren-hostled\` · awareness=\`problem\` · begar=\`slippa-krangel\` · mekanism=\`beviset först, sedan problemet\` · tro=\`en blöt strumpa är beviset, inte materialet\` · urgency=\`sasong\` · hook-mekanik=\`freeze\` · confidence=\`high\` · lardom=\`L-120250009391470291\`
**Memo:** the parent carried 72 % of spend for a week; putting its proof (one sock wet, one dry) in second one should lift hook rate without touching the lines.
**AI content:** none — real footage, real voice.

**Parent:** \`Damasker_PD_1\` — BREAKTHROUGH 2026-09-05: 5 319 kr, 34 purchases, ROAS 3,42. **Isolated variable: the order — proof before problem.**

## 1. Why this ad exists
The parent holds; this tests whether the proof works as the hook.

## 2. Hypothesis
Proof-first beats problem-first on hook rate at equal CPA.

## 3. Script — these lines, word for word
| Time | Swedish (use this) | English meaning |
|---|---|---|
| 0:00–0:03 | En strumpa blöt. En strumpa torr. Samma tur. | One sock wet. One sock dry. Same hike. |
| 0:03–0:10 | Benet utan damask: snön kryper in vid kängans kant. | The leg without a gaiter: snow creeps in at the boot's edge. |
| 0:10–0:15 | Damasker, 389 kr per par. | Gaiters, 389 kr per pair. |

## 4. Direction — one row per script line (docs/os/BRIEF-REGI.md)
**Assets:** Drive folder DryTrek/Damasker (id 1AbCdEf) · CDN: https://cdn.shopify.com/s/files/1/x/damask-krok.jpg
**Reference ads:** parent \`Damasker_PD_1\` (Notion row https://www.notion.so/abc) — Replicate: the two-sock shot, the trail. Do not replicate: the price card font.
**Editor latitude:** MAY: cut order within a beat, b-roll within the motif, music, transitions, caption placement within the middle 80 %. MUST NOT: change a Swedish line, the price, the hook line or its timing, product in frame after second 4, name the store, any field in VARIABELTAGGAR. Cannot find a source: comment on this row and set it back to Draft — never replace the product shot with a generic one.

| # | Time | Script line (Swedish) | Audio | On-screen text | Picture | Effect + length | Source | Reference | Latitude |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 0:00–0:03 | En strumpa blöt. En strumpa torr. Samma tur. | VO | En strumpa blöt. En strumpa torr. | Close-up, top-down: two socks side by side on the trail, left dark with water, right dry; hands hold them up. First frame: this shot. | freeze 0.5 s then cut-in | OUR AD Damasker_PD_1 0:14–0:18 | parent's proof shot, same framing | none |
| 2 | 0:03–0:10 | Benet utan damask: snön kryper in vid kängans kant. | VO | NO TEXT | Medium shot from the side: the bare leg, slush at the boot's top edge, the gaiter leg beside it with the hook in the lacing visible. | slow-mo 0.5× 2 s | DRIVE 1AbCdEf 0:22 | — | b-roll order free |
| 3 | 0:10–0:15 | Damasker, 389 kr per par. | VO | Damasker, 389 kr per par. | Wide shot: both legs walking away on the trail; price card bottom third. | none | DRIVE 1AbCdEf [EDITOR PICKS: look for the walking-away shot on the wet trail] | — | music free |

## 5. Three-question test (docs/copy-regler.md) — every delivered line
| Line | Visualise? | Falsifiable? | Only we can say it? |
|---|---|---|---|
| En strumpa blöt. En strumpa torr. Samma tur. | ✅ two socks | ✅ | ✅ our test |

## 6. COPY CARD (goes in Ads Manager, not in the creative)
**Primary text:**
> En strumpa blöt, en strumpa torr – samma tur. Damasker, 389 kr per par.

**Headline:** \`Ett ben torrt, ett blött.\`
**Description:** \`389 kr per par.\`

## Rules
- Price exactly 389 kr (compare-at 649 kr). Captions burned in, Swedish, word for word, max 2 lines.
- **The ad never names the store.**
`;

const RAD_VIDEO = { namn: 'Damasker_PD_12_H1', typ: 'video', typ_notion: 'Video - Pending Approval', status: 'Draft' };
const CTX_VIDEO = { prefix: 'Damasker', butiksnamn: BAVER_NAMN, pris_butik: { pris: 389, jamforpris: 649 }, breakEvenCpa: null, copyModell: null, doda_koncept: [] };

test('manusrader + regiUr: manustabellen (tid + Swedish), regitabellen på Source + On-screen, tre fasta rader', () => {
  const m = manusrader(VIDEO_REGI);
  assert.equal(m.length, 3);
  assert.equal(m[0], 'En strumpa blöt. En strumpa torr. Samma tur.');
  assert.equal(manusrader(BRA).length, 0, 'bildens Exact text är ingen manustabell');
  assert.equal(manusrader(BAVER_VIDEO).length, 3, 'Bäverbutikens "Script / shot list" med Time-kolumn räknas');
  const r = regiUr(VIDEO_REGI);
  assert.equal(r.finns, true);
  assert.equal(r.rader.length, 3);
  assert.deepEqual(Object.keys(r.kolumner).sort(), ['bild', 'effekt', 'frihet', 'kalla', 'ljud', 'manusrad', 'referens', 'text', 'tid']);
  assert.equal(r.rader[1].text, 'NO TEXT');
  assert.equal(r.rader[2].kalla, 'DRIVE 1AbCdEf [EDITOR PICKS: look for the walking-away shot on the wet trail]');
  assert.equal(r.latitude, true);
  assert.equal(r.assets, true);
  assert.equal(r.referensannonser, true);
  assert.equal(regiUr(BAVER_VIDEO).finns, false, 'Time | Show | Swedish | English | Caption är ingen regitabell');
  const dump = regiUr(somNotionDump(VIDEO_REGI));
  assert.equal(dump.finns, true);
  assert.equal(dump.rader.length, 3);
});

test('giltigKalla: de fem formaten — OUR AD utan sekunder, DRIVE utan sekund/EDITOR PICKS och tom källa faller', () => {
  for (const ok of ['OUR AD Damasker_PD_1 0:14–0:18', 'VÅR ANNONS Damasker_PD_1 00:14-00:18', 'DRIVE 1AbCdEf 0:22', 'DRIVE 1AbCdEf [EDITOR PICKS: the walking-away shot]', 'NEW FOOTAGE: both legs on a wet trail, filmed by the creator', 'NY INSPELNING: två ben', 'CDN https://cdn.shopify.com/x.jpg']) assert.equal(giltigKalla(ok).ok, true, ok);
  assert.match(giltigKalla('OUR AD Damasker_PD_1').orsak, /without mm:ss/);
  assert.match(giltigKalla('DRIVE 1AbCdEf').orsak, /DRIVE without/);
  assert.equal(giltigKalla('').orsak, 'empty');
  assert.match(giltigKalla('same shots as PD_2_H1').orsak, /not one of/);
});

test('granskaRegi: hel tabell = 3/3 utan fel; saknad rad, tom källa, OUR AD utan sekund, tom text, tom effekt, or i Picture, ingen latitude', () => {
  const bra = granskaRegi(VIDEO_REGI);
  assert.deepEqual(bra.fel, [], JSON.stringify(bra.fel));
  assert.deepEqual(bra.anm, [], JSON.stringify(bra.anm));
  assert.equal(bra.tackning, '3/3');
  const utanRad = granskaRegi(VIDEO_REGI.replace(/\| 2 \| 0:03–0:10[^\n]*\n/, ''));
  assert.ok(utanRad.fel.some((t) => /script line 2 has no direction row/.test(t)), JSON.stringify(utanRad.fel));
  assert.equal(utanRad.tackning, '2/3');
  const tomKalla = granskaRegi(VIDEO_REGI.replace('| DRIVE 1AbCdEf 0:22 |', '|  |'));
  assert.ok(tomKalla.fel.some((t) => /direction row 2: source empty/.test(t)));
  const utanSek = granskaRegi(VIDEO_REGI.replace('OUR AD Damasker_PD_1 0:14–0:18', 'OUR AD Damasker_PD_1'));
  assert.ok(utanSek.fel.some((t) => /row 1: source OUR AD without mm:ss/.test(t)));
  const tomText = granskaRegi(VIDEO_REGI.replace('| VO | NO TEXT |', '| VO |  |'));
  assert.ok(tomText.fel.some((t) => /row 2: no on-screen text decision/.test(t)));
  const tomEffekt = granskaRegi(VIDEO_REGI.replace('| slow-mo 0.5× 2 s |', '|  |'));
  assert.ok(tomEffekt.fel.some((t) => /row 2: no effect/.test(t)));
  const eller = granskaRegi(VIDEO_REGI.replace('Medium shot from the side: the bare leg', 'Medium shot or close-up: the bare leg'));
  assert.equal(eller.fel.length, 0);
  assert.ok(eller.anm.some((t) => /row 2: "or\/eller" in Picture/.test(t)));
  const tystStilla = granskaRegi(VIDEO_REGI.replace('| slow-mo 0.5× 2 s |', '| none |'));
  assert.ok(tystStilla.anm.some((t) => /NO TEXT and no effect/.test(t)));
  const utanLatitude = granskaRegi(VIDEO_REGI.replace(/\*\*Editor latitude:\*\*[^\n]*\n/, ''));
  assert.ok(utanLatitude.fel.some((t) => /Editor latitude/.test(t)));
  const utanAssets = granskaRegi(VIDEO_REGI.replace(/\*\*Assets:\*\*[^\n]*\n/, '').replace(/\*\*Reference ads:\*\*[^\n]*\n/, '').replace('First frame: this shot.', ''));
  assert.equal(utanAssets.fel.length, 0);
  assert.deepEqual(utanAssets.anm.map((t) => t.split(' ')[1]), ['"Assets:"', '"Reference', 'hook']);
  const ingen = granskaRegi(BAVER_VIDEO);
  assert.equal(ingen.fel.length, 1);
  assert.match(ingen.fel[0], /no shot-level direction table.*3 script lines/);
  assert.equal(ingen.tackning, '0/3');
});

test('granskaBrief: video med regi + komponenttaggar + Memo är ren; regi-FEL bara från REGI_FRAN; komponentbrister är anmärkningar', () => {
  assert.equal(REGI_FRAN, '2026-09-21');
  const g = granskaBrief({ ...RAD_VIDEO, text: VIDEO_REGI }, CTX_VIDEO);
  assert.deepEqual(g.fel, [], JSON.stringify(g.fel));
  assert.deepEqual(g.anmarkningar, [], JSON.stringify(g.anmarkningar));
  assert.equal(g.fakta.regi, '3/3');
  assert.equal(g.fakta.komponent_typ, 'I');
  assert.equal(g.fakta.parent, 'Damasker_PD_1');
  const dump = granskaBrief({ ...RAD_VIDEO, text: somNotionDump(VIDEO_REGI) }, CTX_VIDEO);
  assert.deepEqual(dump.fel, [], JSON.stringify(dump.fel));
  // Trasig regi på en ny brief = FEL (kommentar till redigeraren); på en gammal = anmärkning.
  const trasig = VIDEO_REGI.replace('| DRIVE 1AbCdEf 0:22 |', '|  |');
  assert.ok(koder(granskaBrief({ ...RAD_VIDEO, skapad_dag: '2026-09-22', text: trasig }, CTX_VIDEO).fel).includes('regi'));
  const gammal = granskaBrief({ ...RAD_VIDEO, skapad_dag: '2026-09-18', text: trasig }, CTX_VIDEO);
  assert.ok(!koder(gammal.fel).includes('regi'));
  assert.ok(gammal.anmarkningar.some((a) => a.kod === 'regi' && /written before 2026-09-21/.test(a.text)));
  // Komponenttaggar: saknade, ogiltiga, typ I utan parent, Memo saknas — alla anmärkningar.
  const utanKomp = granskaBrief({ ...RAD_VIDEO, text: VIDEO_REGI.replace(' · typ=`I` · parent=`Damasker_PD_1` · iteration=`2` · koncept=`PD strumpbevis` · kalla=`parent` · avatar=`vandraren-hostled` · awareness=`problem` · begar=`slippa-krangel` · mekanism=`beviset först, sedan problemet` · tro=`en blöt strumpa är beviset, inte materialet` · urgency=`sasong` · hook-mekanik=`freeze` · confidence=`high` · lardom=`L-120250009391470291`', '').replace(/\*\*Memo:\*\*[^\n]*\n/, '') }, CTX_VIDEO);
  assert.equal(utanKomp.fel.length, 0);
  const komp = utanKomp.anmarkningar.filter((a) => a.kod === 'komponent');
  assert.equal(komp.length, 2, JSON.stringify(komp));
  assert.match(komp[0].text, /component tags missing: typ, koncept, kalla, avatar, awareness, begar, mekanism, tro, urgency, hook-mekanik, confidence, lardom/);
  assert.match(komp[0].text, /a brief without lardom= is not written/);
  const felLardom = granskaBrief({ ...RAD_VIDEO, text: VIDEO_REGI.replace('lardom=`L-120250009391470291`', 'lardom=`batch 2`') }, CTX_VIDEO);
  assert.ok(felLardom.anmarkningar.some((a) => a.kod === 'komponent' && /lardom=batch 2 is not a learning id/.test(a.text)), JSON.stringify(felLardom.anmarkningar));
  assert.match(komp[1].text, /no "Memo:" line/);
  const ogiltig = granskaBrief({ ...RAD_VIDEO, text: VIDEO_REGI.replace('awareness=`problem`', 'awareness=`warm`').replace('parent=`Damasker_PD_1` · ', '') }, CTX_VIDEO);
  const o = ogiltig.anmarkningar.filter((a) => a.kod === 'komponent');
  assert.ok(o.some((a) => /awareness=warm is not in the fixed list \(unaware \| problem/.test(a.text)), JSON.stringify(o));
  assert.ok(o.some((a) => /typ=I without parent=/.test(a.text)), JSON.stringify(o));
  assert.equal(ogiltig.fel.length, 0);
});

test('komponentUr: fasta listor, alias (source/desire/season/slow-motion), typ N med parent, typ I utan', () => {
  assert.deepEqual(KOMPONENT_TAGGAR, ['typ', 'koncept', 'kalla', 'avatar', 'awareness', 'begar', 'mekanism', 'tro', 'urgency', 'hook-mekanik', 'confidence', 'lardom']);
  const ok = komponentUr({ typ: 'N', koncept: 'x', kalla: 'voc', avatar: 'a', awareness: 'unaware', begar: 'protect-what-i-own', mekanism: 'm', tro: 't', urgency: 'season', 'hook-mekanik': 'slow-motion', confidence: 'low', lardom: 'L-1, L-2' });
  assert.deepEqual(ok.saknade, []);
  assert.equal(ok.lardom, 'L-1, L-2');
  assert.equal(komponentUr({ typ: 'imiterad' }).typ, 'IMITERAD', 'typ normaliseras i värdelistan, inte i typ-fältet');
  assert.deepEqual(komponentUr({ typ: 'IM', parent: 'X_PD_1_H1' }).ogiltiga, []);
  assert.ok(komponentUr({ typ: 'IM' }).brister.some((b) => /typ=IM without parent/.test(b)));
  const t2 = taggarUr('Variables: belief=proof beats promise · learning=L-5 · type=IM');
  assert.equal(t2.taggar.tro, 'proof beats promise');
  assert.equal(t2.taggar.lardom, 'L-5');
  assert.equal(t2.taggar.typ, 'IM');
  assert.deepEqual(ok.ogiltiga, []);
  assert.deepEqual(ok.brister, []);
  assert.equal(ok.typ, 'N');
  const t = taggarUr('Variables: angle=PD · type=I · source=swipe · desire=trygghet · concept=PD x · hook-mechanic=zoom-in');
  assert.equal(t.taggar.typ, 'I');
  assert.equal(t.taggar.kalla, 'swipe');
  assert.equal(t.taggar.begar, 'trygghet');
  assert.equal(t.taggar['hook-mekanik'], 'zoom-in');
  const nMedParent = komponentUr({ typ: 'N', parent: 'Damasker_PD_1', kalla: 'axel' });
  assert.ok(nMedParent.brister.some((b) => /typ=N with a parent/.test(b)));
  assert.ok(komponentUr({ typ: 'M' }).brister.some((b) => /typ=M without parent/.test(b)));
  assert.equal(komponentUr({ typ: 'I', parent: 'none' }).parent, null);
  assert.ok(komponentUr({ confidence: 'sure' }).ogiltiga.some((o) => o.tagg === 'confidence'));
});

test('sparra: FEL och SPARRKODER stoppar; H-varianter med samma hook-mekanik och 5 typ N utan voc är rondfel', () => {
  assert.deepEqual(SPARRKODER, ['regi', 'taggar', 'komponent']);
  const rad = (namn, text) => ({ namn, typ: 'video', text: text.replace(/Damasker_PD_12_H1/g, namn), fil: `${namn}/brief.md` });
  const ren = sparra([rad('Damasker_PD_12_H1', VIDEO_REGI)], CTX_VIDEO);
  assert.equal(ren.ok, true, JSON.stringify(ren.rader[0]));
  assert.deepEqual(ren.rond, []);
  const utanMemo = sparra([rad('Damasker_PD_12_H1', VIDEO_REGI.replace(/\*\*Memo:\*\*[^\n]*\n/, ''))], CTX_VIDEO);
  assert.equal(utanMemo.ok, false, 'en komponentanmärkning stoppar i spärrläget');
  assert.equal(utanMemo.rader[0].stopp[0].kod, 'komponent');
  const trasig = sparra([rad('Damasker_PD_12_H1', VIDEO_REGI.replace('| DRIVE 1AbCdEf 0:22 |', '|  |'))], CTX_VIDEO);
  assert.equal(trasig.ok, false);
  assert.equal(trasig.rader[0].fel[0].kod, 'regi');
  const tvaH = sparra([rad('Damasker_PD_12_H1', VIDEO_REGI), rad('Damasker_PD_12_H2', VIDEO_REGI)], CTX_VIDEO);
  assert.equal(tvaH.ok, false);
  assert.match(tvaH.rond[0], /Damasker_PD_12: H-variants share hook-mekanik=freeze/);
  const olika = sparra([rad('Damasker_PD_12_H1', VIDEO_REGI), rad('Damasker_PD_12_H2', VIDEO_REGI.replace('hook-mekanik=`freeze`', 'hook-mekanik=`reverse`'))], CTX_VIDEO);
  assert.deepEqual(olika.rond, []);
  const nyText = VIDEO_REGI.replace(' · typ=`I` · parent=`Damasker_PD_1` · iteration=`2`', ' · typ=`N`').replace('kalla=`parent`', 'kalla=`rutin`').replace('**Parent:** `Damasker_PD_1` — BREAKTHROUGH 2026-09-05: 5 319 kr, 34 purchases, ROAS 3,42. **Isolated variable: the order — proof before problem.**', '**Source:** playbook winner "proof first".');
  const femNya = sparra([1, 2, 3, 4, 5].map((i) => rad(`Damasker_PD_${20 + i}_H1`, nyText)), CTX_VIDEO);
  assert.ok(femNya.rond.some((s) => /5 new concepts \(typ=N\) and none with kalla=voc/.test(s)), JSON.stringify(femNya.rond));
  const medVoc = sparra([1, 2, 3, 4, 5].map((i) => rad(`Damasker_PD_${20 + i}_H1`, i === 1 ? nyText.replace('kalla=`rutin`', 'kalla=`voc`') : nyText)), CTX_VIDEO);
  assert.deepEqual(medVoc.rond, []);
});

// ------------------------------------------------------------ speglade hubbar (CS-KLART punkt 24) + AI-raden (punkt 27)

test('spegelPris: speglad hub ⇒ OPS-butikens pris ur produktfilen, aldrig gissat; ospeglad ⇒ null', () => {
  const lasFil = (p) => (/termoskyddet\.yaml$/.test(p) ? 'ekonomi:\n  pris: 559\n  jamforpris: 932\n' : /takskyddet\.yaml$/.test(p) ? 'ekonomi:\n  pris: 1129\n  jamforpris: 1469\n' : null);
  const reg = { poster: { 'carashell/takskyddet': { spegling: { kalla_hub: TAK_HUB, status_se: 'CaraShell SE ready to be active' } }, 'carashell/termoskyddet': { spegling: { kalla_hub: 'c5a270ab908c83e3b72181fde8643080', status_se: 'CaraShell SE ready to be active' } } } };
  const s = spegelPris(TAK_HUB, reg, { lasFil });
  assert.equal(s.butik, 'CaraShell');
  assert.equal(s.pris, 1129);
  assert.equal(s.jamforpris, 1469);
  assert.match(s.kalla, /factory\/produkter\/takskyddet\.yaml/);
  assert.equal(spegelPris('c5a270ab-908c-83e3-b721-81fde8643080', reg, { lasFil }).pris, 559);
  assert.equal(spegelPris(MOTOR_HUB, reg, { lasFil }), null);
  const saknas = spegelPris(TAK_HUB, reg, { lasFil: () => null });
  assert.equal(saknas.pris, null);
  assert.match(saknas.kalla, /saknas/);
});

test('granskaBrief speglad: nummer över 100 är ett fel, priset måste ligga inom 20 % av båda butikerna', () => {
  const ctx = { ...CTX, speglad: true, pris_spegel: [{ butik: 'CaraShell', pris: 1129 }] };
  assert.deepEqual(granskaBrief({ ...RAD, text: BRA }, ctx).fel, []);
  const over100 = granskaBrief({ ...RAD, namn: 'Takoverdrag_SP_105_1', text: BRA.replace(/Takoverdrag_SP_5_1/g, 'Takoverdrag_SP_105_1') }, ctx);
  assert.ok(over100.fel.some((x) => x.kod === 'namn' && /never go above 100/.test(x.text)), JSON.stringify(over100.fel));
  assert.ok(!koder(granskaBrief({ ...RAD, namn: 'Takoverdrag_SP_105_1', text: BRA.replace(/Takoverdrag_SP_5_1/g, 'Takoverdrag_SP_105_1') }, CTX).fel).includes('namn'), 'ospeglad hub: 105 är ett vanligt nummer');
  const dyrSpegel = granskaBrief({ ...RAD, text: BRA }, { ...ctx, pris_spegel: [{ butik: 'CaraShell', pris: 1499 }] });
  assert.ok(dyrSpegel.fel.some((x) => x.kod === 'pris' && /CaraShell takes 1499 kr — 25 % apart/.test(x.text)), JSON.stringify(dyrSpegel.fel));
  const naraSpegel = granskaBrief({ ...RAD, text: BRA }, { ...ctx, pris_spegel: [{ butik: 'CaraShell', pris: 1199 }] });
  assert.equal(naraSpegel.fel.length, 0);
  assert.ok(naraSpegel.anmarkningar.some((x) => x.kod === 'pris' && /within 20 %/.test(x.text)));
});

test('granskaBrief video: "AI content:"-raden saknas ⇒ anmärkning (US-steget bränner då in raden som för en person)', () => {
  const utan = granskaBrief({ ...RAD_VIDEO, text: VIDEO_REGI.replace(/\*\*AI content:\*\*[^\n]*\n/, '') }, CTX_VIDEO);
  assert.ok(utan.anmarkningar.some((a) => a.kod === 'ai'), JSON.stringify(utan.anmarkningar));
  const med = granskaBrief({ ...RAD_VIDEO, text: VIDEO_REGI }, CTX_VIDEO);
  assert.ok(!med.anmarkningar.some((a) => a.kod === 'ai'));
  assert.ok(!granskaBrief({ ...RAD, text: BRA }, CTX).anmarkningar.some((a) => a.kod === 'ai'), 'bild: ingen AI-rad krävs');
});

test('Matstrumpors namnmönster läses av spärren (vinkel = koncept, numret på plats fem, formatet avgör video/bild)', () => {
  const v = tolkaMatstrumporNamn('MATSTRUMP_sushi_gift_ugc_048_v1');
  assert.deepEqual({ koncept: v.koncept, nummer: v.nummer, variant: v.variant }, { koncept: 'GIFT', nummer: 48, variant: 'H1' });
  const b = tolkaMatstrumporNamn('MATSTRUMP_sushi_jul_static_049_v1');
  assert.deepEqual({ koncept: b.koncept, nummer: b.nummer, variant: b.variant }, { koncept: 'JUL', nummer: 49, variant: '1' });
  assert.equal(tolkaMatstrumporNamn('Takoverdrag_BOF_3_1'), null);
});
