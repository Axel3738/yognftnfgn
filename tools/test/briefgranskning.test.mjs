// Ren logik i tools/briefgranskning.mjs — inga nätanrop, ingen env.
// Taggarna, annonstexten, butiksnamnet, priset, tre-frågorstestet, döda
// koncept ur dna.md, domen per brief (markdown OCH Notion-dump), rondvalet,
// batchuppslaget, feedback-sektionen, domfilens spärrar och Discord-jobbet.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  KRAVDA_TAGGAR, KOMMENTARMARKE, arRubrik, sektion, taggarUr, annonstextUr, namntraff, prisUrBriefText, kronorI,
  trefragorUr, dodaKoncept, arVariant, isoleradVariabel, kallaUr, kpiUr, roasEnsamt, granskaBrief, svenskDag,
  valjRond, hittaBatch, nastaGranskning, harSektion, domFor, giltigDom, kommentarText, feedbackSektion, laggInSektion, byggDiscordJobb,
} from '../briefgranskning.mjs';
import { tillhorButiken } from '../../factory/register.mjs';
import { renderaRapport } from '../discord-rapport.mjs';
import { serUtSomSvenska } from '../lib/engelska.mjs';

// ------------------------------------------------------------ fixturer

const BRA = `# CaraShellRoof_SP_5_1 — the winner's proof, moved into the weather it talks about

**VARIABELTAGGAR:** vinkel=\`social proof (kundomdöme)\` · hook-typ=\`aggregerat betyg + citat\` · format=\`statisk, enkel canvas\` · proof=\`namngivet citat + 16 omdömen\` · offer-i-creativen=\`inget pris\` · visuell stil=\`exteriör, höstregn\` · textmängd=\`toppetikett+citat+bottenrad\` · talare=\`kund (Lars)\` · copy_model=\`sonnet\`
*(Read by the next \`/cs\` run to group profit contribution per variable value.)*

**Type:** Static image · **Batch:** #3 (2026-09-16) · **Copy written by:** sonnet
**Parent:** \`CaraShellRoof_SP_2_1\` — the account's best ad: 846 kr, 5 purchases, CPA 169 kr, 58 % of all profit contribution (measured 2026-09-16).
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
> 1 129 kr (ord. 1 469 kr). Fri frakt till Sverige och Norge. 14 dagars ångerrätt enligt svensk lag.

**Headline:** \`16 omdömen, alla fem stjärnor – i regn också\`
**Description:** \`"Skyddar taket mot väder." – Lars. 1 129 kr.\`
**CTA button:** \`Handla nu\` (Shop Now)
**Destination:** https://carashell.se/products/takskyddet

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
- Guarantee is **14 dagars ångerrätt enligt svensk lag** — never "30 dagars öppet köp".

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

const CTX = {
  annonsprefix: 'CaraShellRoof', prefix: ['carashellroof'], tillhor: tillhorButiken,
  butiksnamn: ['CaraShell', 'carashell.se', 'carashell'],
  pris_butik: { pris: 1129, jamforpris: 1469 }, breakEvenCpa: 693, copyModell: 'ab',
  doda_koncept: [{ koncept: 'GT', citat: 'Instruktion: GT får inga briefer i batch #3.' }],
};
const RAD = { namn: 'CaraShellRoof_SP_5_1', typ: 'bild', typ_notion: 'Image - Pending Approval', status: 'To be Reviewed' };
const koder = (lista) => lista.map((x) => x.kod);

// ------------------------------------------------------------ delarna

test('arRubrik och sektion: markdown-rubriker OCH Notion-dumpens numrerade rubriker', () => {
  assert.equal(arRubrik('## 2. Hypothesis'), true);
  assert.equal(arRubrik('2. Hypothesis'), true);
  assert.equal(arRubrik('Hard rules'), true);
  assert.equal(arRubrik('**VARIABELTAGGAR:** vinkel=`x`'), false);
  assert.equal(arRubrik('| Format | 9:16 |'), false);
  assert.match(sektion(BRA, /hypothes/i), /^Showing the weather/);
  assert.match(sektion(somNotionDump(BRA), /hypothes/i), /^Showing the weather/);
  assert.equal(sektion(BRA, /finns inte/i), '');
  // Sektionen slutar vid nästa rubrik — KPI-texten läcker inte in i hard rules.
  assert.doesNotMatch(sektion(BRA, /\bkpi\b/i), /Price/);
});

test('taggarUr: alla nio taggar, alias och saknade', () => {
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
  assert.doesNotMatch(a, /Destination|carashell\.se\/products/, 'länkar och Destination är metadata');
  assert.doesNotMatch(a, /Judged against/, 'KPI:n är inte annonstext');
  // Samma text ur Notion-dumpen.
  const d = annonstextUr(somNotionDump(BRA));
  assert.match(d, /Vattnet stannar på väven/);
  assert.match(d, /Skyddar taket mot väder.*1 129 kr/);
  assert.doesNotMatch(d, /SP is the strongest angle/);
});

test('namntraff: brandet, domänen och Bäver-familjen — annonsnamnet räknas aldrig', () => {
  const namn = ['CaraShell', 'carashell.se', 'carashell'];
  assert.deepEqual(namntraff('Ett av 16 omdömen. CaraShellRoof_SP_5_1 är namnet.', namn), []);
  assert.deepEqual(namntraff('CaraShell täcker taket – 6,5 × 3 m', namn), ['CaraShell']);
  assert.deepEqual(namntraff('ett av 16 omdömen på carashell.se', namn).sort(), ['carashell', 'carashell.se']);
  assert.deepEqual(namntraff('Köp hos Bäverbutiken', namn), ['Bäverbutiken']);
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
});

test('trefragorUr: tabellen hittas, ❌-rader plockas ut, saknad tabell rapporteras', () => {
  assert.deepEqual(trefragorUr(BRA), { finns: true, underkanda: [] });
  const med = BRA.replace('| ✅ two named surfaces | ✅ literally true |', '| ❌ abstract | ✅ literally true |');
  assert.deepEqual(trefragorUr(med).underkanda, ['Vattnet stannar på väven. Taket under är torrt.']);
  assert.deepEqual(trefragorUr(somNotionDump(med)).underkanda, ['Vattnet stannar på väven. Taket under är torrt.']);
  assert.equal(trefragorUr('# Brief\nHypothesis: x').finns, false);
});

test('dodaKoncept: "GT får inga briefer" ur dna.md, med citatet — aldrig ett småbokstavsord', () => {
  const dna = '## Mönster 12\n→ **Instruktion:** GT får **inga briefer** i batch #3. Innan vinkeln döms …\n→ **Instruktion:** SP får flest briefer varje rond.\nDärför och PD får inga briefer heller.';
  const d = dodaKoncept(dna);
  assert.deepEqual(d.map((x) => x.koncept), ['GT', 'PD']);
  assert.match(d[0].citat, /GT får inga briefer i batch #3/);
  assert.deepEqual(dodaKoncept('SP får flest briefer.'), []);
  // Den riktiga dna.md för CaraShell bär instruktionen från körning nr 3.
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

test('kpiUr + roasEnsamt: break-even ur KPI:n, target som domlinje, ROAS ensamt', () => {
  assert.deepEqual(kpiUr(BRA), { breakEvenCpa: 693, motTarget: false });
  assert.equal(kpiUr('## 9. KPI\nJudged against target CPA 411 kr.').motTarget, true);
  assert.equal(kpiUr('9. KPI\nJudged against break-even CPA of 693 kr (never against target).').breakEvenCpa, 693);
  assert.equal(roasEnsamt(BRA), false);
  assert.equal(roasEnsamt('## 1. Why this ad exists\nThe parent has ROAS 6.7, the best in the account.\n## 2. Hypothesis\nMore of it.'), true);
  assert.equal(roasEnsamt('## 1. Why this ad exists\nROAS 6.7 and CPA 169 kr, 58 % of profit contribution.\n## 2. Hypothesis\nMore.'), false);
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

test('granskaBrief: butikens namn i annonstexten är ett fel — i rationalen är det inget', () => {
  const text = BRA.replace('– Lars, ett av 16 omdömen', '– Lars, ett av 16 omdömen på carashell.se').replace('**Headline:** `16 omdömen', '**Headline:** `CaraShell: 16 omdömen');
  const g = granskaBrief({ ...RAD, text }, CTX);
  const f = g.fel.find((x) => x.kod === 'butiksnamn');
  assert.ok(f, JSON.stringify(g.fel));
  assert.match(f.text, /CaraShell/);
  assert.match(f.text, /carashell\.se/);
  // Samma namn i "Why this ad exists" stoppar inte.
  const bara = BRA.replace('SP is the strongest angle', 'SP is CaraShell\'s strongest angle');
  assert.equal(granskaBrief({ ...RAD, text: bara }, CTX).fel.length, 0);
  // Utan hard rule om butiksnamnet: anmärkning.
  const utan = BRA.replace('- **The ad never names the store** — not in copy, on the image, in voice-over or captions.\n', '');
  assert.ok(koder(granskaBrief({ ...RAD, text: utan }, CTX).anmarkningar).includes('hardrules'));
});

test('granskaBrief: priset mot butiken, läst live — fel pris, fel jämförpris, okänt pris, främmande belopp', () => {
  const fel = granskaBrief({ ...RAD, text: BRA.replace('Price **1 129 kr**, compare-at **1 469 kr**', 'Price **1 199 kr**, compare-at **1 499 kr**') }, CTX);
  const pris = fel.fel.filter((x) => x.kod === 'pris');
  assert.equal(pris.length, 2, JSON.stringify(pris));
  assert.match(pris[0].text, /1199 kr.*1129 kr/);
  assert.match(pris[1].text, /1499.*1469/);
  const okant = granskaBrief({ ...RAD, text: BRA }, { ...CTX, pris_butik: null });
  assert.ok(okant.anmarkningar.some((x) => x.kod === 'pris' && /could not be read/.test(x.text)), 'okänt pris är aldrig tyst grönt');
  assert.equal(okant.fel.length, 0);
  const frammande = granskaBrief({ ...RAD, text: BRA.replace('Fri frakt till Sverige och Norge.', 'En takreparation kostar 20 000 kr.') }, CTX);
  assert.ok(frammande.anmarkningar.some((x) => x.kod === 'pris' && /20000/.test(x.text)));
});

test('granskaBrief: taggar, hypotes, tre-frågorstestet, döda koncept', () => {
  const utanTaggar = granskaBrief({ ...RAD, text: BRA.replace(/\*\*VARIABELTAGGAR:\*\*[^\n]*\n/, '') }, CTX);
  assert.ok(koder(utanTaggar.fel).includes('taggar'));
  const utanCopy = BRA.replace(' · copy_model=`sonnet`', '');
  assert.ok(koder(granskaBrief({ ...RAD, text: utanCopy }, CTX).fel).includes('taggar'), 'A/B:t pågår ⇒ fel');
  assert.ok(koder(granskaBrief({ ...RAD, text: utanCopy }, { ...CTX, copyModell: 'fable' }).anmarkningar).includes('taggar'), 'A/B:t avgjort ⇒ anmärkning');
  const utanHypotes = granskaBrief({ ...RAD, text: BRA.replace(/## 2\. Hypothesis\n[^\n]+\n/, '## 2. Hypothesis\n') }, CTX);
  assert.ok(koder(utanHypotes.fel).includes('hypotes'));
  const kryss = granskaBrief({ ...RAD, text: BRA.replace('| ✅ two named surfaces | ✅ literally true |', '| ❌ abstract | ✅ literally true |') }, CTX);
  const tre = kryss.fel.find((x) => x.kod === 'trefragor');
  assert.ok(tre);
  assert.match(tre.text, /`Vattnet stannar på väven\. Taket under är torrt\.`/, 'svenska rader i backticks');
  assert.equal(serUtSomSvenska(tre.text), false, 'felraden får inte se svensk ut');
  const gt = granskaBrief({ ...RAD, namn: 'CaraShellRoof_GT_5_1', text: BRA.replace(/CaraShellRoof_SP_5_1/g, 'CaraShellRoof_GT_5_1') }, CTX);
  const dna = gt.anmarkningar.find((x) => x.kod === 'dna');
  assert.ok(dna);
  assert.match(dna.text, /GT får inga briefer/);
});

test('granskaBrief: namnet — prefix, spegelintervallet, Typ mot variant', () => {
  const fel = (namn, typ = 'bild') => koder(granskaBrief({ ...RAD, namn, typ, text: BRA.replace(/CaraShellRoof_SP_5_1/g, namn) }, CTX).fel);
  assert.ok(fel('Takoverdrag_SP_5_1').includes('namn'), 'Bäverbutikens prefix');
  assert.ok(fel('CaraShellRoof_SP_105_1').includes('namn'), 'nummer i spegelintervallet');
  assert.ok(fel('CaraShellRoof_SP_5_H1', 'bild').includes('typ'), 'bild med H-variant');
  assert.ok(!fel('CaraShellRoof_SP_5_1').includes('namn'));
  const skiftlage = granskaBrief({ ...RAD, namn: 'Carashellroof_SP_5_1', text: BRA }, CTX);
  assert.ok(koder(skiftlage.anmarkningar).includes('namn'));
  assert.ok(!koder(skiftlage.fel).includes('namn'));
});

test('granskaBrief: variant utan isolerad variabel, nytt koncept utan källa, två variabler', () => {
  const utanIso = granskaBrief({ ...RAD, text: BRA.replace('**Isolated variable: the setting of the photo.** Every proof element the parent carries stays word for word. Only the scene changes.', 'Everything changes a bit.') }, CTX);
  assert.ok(koder(utanIso.fel).includes('variabel'));
  const tva = granskaBrief({ ...RAD, text: BRA.replace('Isolated variable: the setting of the photo.', 'Isolated variable: the setting and the quote.') }, CTX);
  assert.ok(koder(tva.anmarkningar).includes('variabel'));
  const nytt = BRA.replace('**Parent:** `CaraShellRoof_SP_2_1` — the account\'s best ad: 846 kr, 5 purchases, CPA 169 kr, 58 % of all profit contribution (measured 2026-09-16).\n', '').replace('**Isolated variable: the setting of the photo.** Every proof element the parent carries stays word for word. Only the scene changes.\n', '').replace('SP is the strongest angle by a distance — 42 % of spend, 12 of 20 purchases, CPA 266 kr against break-even 693 kr — and `SP_2_1` is the single ad carrying it.', 'A fresh idea nobody asked for.');
  // Hypotesen får nämna föräldern utan att det räknas som källa — källan står i huvudet eller i "Why".
  assert.match(nytt, /the parent's 169 kr/);
  assert.ok(koder(granskaBrief({ ...RAD, text: nytt }, CTX).fel).includes('kalla'));
  assert.ok(!koder(granskaBrief({ ...RAD, text: nytt.replace('A fresh idea nobody asked for.', 'A fresh idea — a guess, no data separates it.') }, CTX).fel).includes('kalla'));
});

test('granskaBrief: bild utan IMAGE PROMPT, video utan manustabell, KPI mot target eller fel linje, COPY CARD', () => {
  const utanPrompt = granskaBrief({ ...RAD, text: BRA.replace(/## IMAGE PROMPT[\s\S]*$/, '') }, CTX);
  assert.ok(koder(utanPrompt.fel).includes('bild'));
  const video = { ...RAD, namn: 'CaraShellRoof_SP_5_H1', typ: 'video', typ_notion: 'Video - Pending Approval' };
  const utanManus = granskaBrief({ ...video, text: BRA.replace(/CaraShellRoof_SP_5_1/g, 'CaraShellRoof_SP_5_H1').replace(/## 4\. Exact text[\s\S]*?(?=## 5)/, '') }, CTX);
  assert.ok(koder(utanManus.fel).includes('video'));
  const medManus = granskaBrief({ ...video, text: BRA.replace(/CaraShellRoof_SP_5_1/g, 'CaraShellRoof_SP_5_H1') }, CTX);
  assert.ok(!koder(medManus.fel).includes('video'));
  assert.ok(koder(medManus.anmarkningar).includes('video'), 'ingen caption-regel ⇒ anmärkning');
  const target = granskaBrief({ ...RAD, text: BRA.replace('Judged against break-even CPA **693 kr** (never against target).', 'Judged against target CPA **411 kr**.') }, CTX);
  assert.ok(target.fel.some((x) => x.kod === 'kpi' && /target/.test(x.text)));
  const felLinje = granskaBrief({ ...RAD, text: BRA }, { ...CTX, breakEvenCpa: 700 });
  assert.ok(felLinje.fel.some((x) => x.kod === 'kpi' && /693.*700/.test(x.text)));
  const utanCopy = granskaBrief({ ...RAD, text: BRA.replace(/## 7\. COPY CARD[\s\S]*?(?=## 8)/, '') }, CTX);
  assert.ok(koder(utanCopy.fel).includes('copy'));
});

// ------------------------------------------------------------ ronden

test('svenskDag + valjRond: --rond, registrets senaste_brief, annars hubbens nyaste dag', () => {
  assert.equal(svenskDag('2026-09-15T22:30:00.000Z'), '2026-09-16', '00:30 svensk tid är nästa dag');
  assert.equal(svenskDag('trasigt'), null);
  const rader = [
    { namn: 'A_SP_1_1', skapad_dag: '2026-09-14' }, { namn: 'A_SP_2_1', skapad_dag: '2026-09-16' }, { namn: 'A_SP_3_1', skapad_dag: '2026-09-16' },
  ];
  const r = valjRond(rader, { senasteBrief: '2026-09-16' });
  assert.equal(r.datum, '2026-09-16');
  assert.equal(r.kalla, 'registrets senaste_brief');
  assert.equal(r.rader.length, 2);
  assert.deepEqual(r.per_dag, { '2026-09-14': 1, '2026-09-16': 2 });
  assert.equal(valjRond(rader, { rond: '2026-09-14' }).rader.length, 1);
  const utan = valjRond(rader, { senasteBrief: '2026-09-17' });
  assert.equal(utan.datum, '2026-09-16');
  assert.match(utan.kalla, /nyaste dag/);
  assert.equal(valjRond([], {}).datum, null);
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
  nyckel: 'carashell/takskyddet', rond: '2026-09-16',
  bra: ['Every brief carries VARIABELTAGGAR and a parent'],
  missat: ['`CaraShellRoof_CS_5_1` names the store in the primary text'],
  regler: ['Never put the store name or domain in the primary text, headline or description', 'Every image brief needs an Exact text table, otherwise it goes live as a plain photo', 'Cite the parent ad with its CPA and purchases, not with ROAS alone'],
  rader: [
    { namn: 'CaraShellRoof_SP_5_1', fel: [], anmarkningar: [], bra: ['clean'] },
    { namn: 'CaraShellRoof_CS_5_1', fel: ['the ad text names the store (carashell.se) — never in copy'], anmarkningar: ['no caption rule'] },
  ],
};
const KO = {
  nyckel: 'carashell/takskyddet', brand: 'CaraShell', feedback_fil: 'products/carashell/takskyddet/feedback.md',
  rond: { datum: '2026-09-16', batch: 3 }, hub: { url: 'https://notion.so/hub' },
  rader: [{ namn: 'CaraShellRoof_SP_5_1', page_id: 'p1', url: 'https://notion.so/p1' }, { namn: 'CaraShellRoof_CS_5_1', page_id: 'p2', url: 'https://notion.so/p2' }],
  varningar: [], stopp: [],
};

test('giltigDom: tre regler, alla rader dömda, inga okända rader, engelska fel', () => {
  assert.deepEqual(giltigDom(DOM, KO), { ok: true, fel: [] });
  assert.match(giltigDom({ ...DOM, regler: DOM.regler.slice(0, 2) }, KO).fel.join(), /exakt tre regler/);
  assert.match(giltigDom({ ...DOM, rader: DOM.rader.slice(0, 1) }, KO).fel.join(), /CS_5_1.*saknar en dom/);
  assert.match(giltigDom({ ...DOM, rader: [...DOM.rader, { namn: 'X_1_1', fel: [] }] }, KO).fel.join(), /finns inte i rondens kö/);
  assert.match(giltigDom({ ...DOM, rond: '2026-09-14' }, KO).fel.join(), /≠ köns rond/);
  const svensk = giltigDom({ ...DOM, rader: [DOM.rader[0], { namn: 'CaraShellRoof_CS_5_1', fel: ['annonsen nämner butiken och det är inte tillåtet'] }] }, KO);
  assert.match(svensk.fel.join(), /ser svenskt ut/);
  const citat = giltigDom({ ...DOM, rader: [DOM.rader[0], { namn: 'CaraShellRoof_CS_5_1', fel: ['the line "Ett av 16 omdömen – alla fem stjärnor" is not falsifiable'] }] }, KO);
  assert.match(citat.fel.join(), /backticks/);
  assert.equal(giltigDom({ ...DOM, rader: [DOM.rader[0], { namn: 'CaraShellRoof_CS_5_1', fel: ['the line `Ett av 16 omdömen – alla fem stjärnor` is not falsifiable'] }] }, KO).ok, true);
});

test('kommentarText: engelsk, med markören, numrerade fel, aldrig statusbyte', () => {
  const t = kommentarText({ namn: 'X', fel: ['the ad text names the store', 'price 1 199 kr, store says 1 129 kr'] }, { datum: '2026-09-16', brand: 'CaraShell' });
  assert.ok(t.startsWith(`${KOMMENTARMARKE} 2026-09-16 (CaraShell)`));
  assert.match(t, /1\. the ad text names the store\n2\. price/);
  assert.match(t, /Status unchanged/);
  assert.equal(serUtSomSvenska(t), false);
});

test('feedbackSektion + laggInSektion: daterad sektion, tre regler, tabellen — och omkörning byter ut, lägger inte till', () => {
  const s = feedbackSektion(DOM, { idag: '2026-09-18', batch: 3 });
  assert.match(s, /^## Rond 2026-09-16 — batch #3 \(2 briefer\) · granskad 2026-09-18/);
  assert.match(s, /\*\*Tre regler för nästa rond\*\*\n1\. Never put/);
  assert.match(s, /\| `CaraShellRoof_CS_5_1` \| ❌ \| the ad text names the store/);
  assert.match(s, /\| `CaraShellRoof_SP_5_1` \| ✅ \| — \| — \|/);
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

test('byggDiscordJobb: engelska rader, redigeraren pingas bara vid fel, utan redigerare en varning — och mallen renderar', () => {
  const rader = DOM.rader.map((r) => ({ ...r }));
  const med = byggDiscordJobb({ brand: 'CaraShell', datum: '2026-09-18', rond: '2026-09-16', batch: 3, rader, regler: DOM.regler, redigerare: { namn: 'Carl', discord_id: '1411720622484095089' }, feedbackFil: KO.feedback_fil });
  assert.equal(med.lage, 'granskning');
  assert.match(med.gjort[0], /Reviewed 2 briefs from the 2026-09-16 round \(batch #3\): 1 clean, 0 with notes, 1 with errors/);
  assert.match(med.gjort[1], /CaraShellRoof_CS_5_1: the ad text names the store/);
  assert.match(med.gjort[2], /3 rules for the next round/);
  assert.equal(med.action_redigerare.length, 1);
  assert.equal(med.action_redigerare[0].discord_id, '1411720622484095089');
  assert.equal(med.action_axel.length, 0);
  assert.equal(med.nasta_korning, '2026-09-21');
  const utan = byggDiscordJobb({ brand: 'CaraShell', datum: '2026-09-18', rond: '2026-09-16', rader, regler: DOM.regler, redigerare: null });
  assert.equal(utan.action_redigerare.length, 0);
  assert.ok(utan.varningar.some((v) => /No editor assigned/.test(v)));
  const text = renderaRapport(med, { axelId: '1' });
  assert.match(text, /^🔎 CARASHELL brief review — 2026-09-18/);
  assert.match(text, /ACTION NEEDED/);
  assert.equal(serUtSomSvenska(text), false, 'rapporten passerar engelskspärren');
  const rent = byggDiscordJobb({ brand: 'CaraShell', datum: '2026-09-18', rond: '2026-09-16', rader: [rader[0]], regler: DOM.regler });
  assert.doesNotMatch(renderaRapport(rent, { axelId: '1' }), /ACTION NEEDED/, 'inga fel ⇒ ingen ping');
});
