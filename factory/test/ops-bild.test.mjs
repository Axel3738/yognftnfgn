// Tester för factory/ops-bild.mjs — de rena funktionerna, inga nätanrop.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promptUrBrief, byggJobb, nastaNummer, annonsdel, lokalBrief, TILLATEN_TYP, STANDARD_FORMAT } from '../ops-bild.mjs';

const BRIEF = `# DryTrek_Damasker_PD_14_3 — Colour variant: Gul
**VARIABELTAGGAR:** vinkel=\`PD\` · format=\`product\`
## 7. COPY CARD
Primary: 18 färger, 389 kr per par.
## IMAGE PROMPT
Clean e-commerce product photo of a pair of hiking gaiters in bright yellow,
standing upright on a pure white background, soft studio light, no text.
REFERENCE IMAGES:
- https://cdn.shopify.com/s/files/1/x/damask-se-NG-ren.jpg
- https://cdn.shopify.com/s/files/1/x/damask-se-SV.png
ASPECT: 4:5
END IMAGE PROMPT
`;

test('promptUrBrief: plockar prompt, referenser och format ur markdown', () => {
  const b = promptUrBrief(BRIEF);
  assert.ok(b);
  assert.match(b.prompt, /^Clean e-commerce product photo/);
  assert.match(b.prompt, /no text\.$/);
  assert.ok(!b.prompt.includes('REFERENCE'), 'referensraderna hör inte till prompten');
  assert.deepEqual(b.referenser, ['https://cdn.shopify.com/s/files/1/x/damask-se-NG-ren.jpg', 'https://cdn.shopify.com/s/files/1/x/damask-se-SV.png']);
  assert.equal(b.bildformat, '4:5');
});

test('promptUrBrief: Notions textdump (rubriker utan #, URL:er som egna rader) funkar också', () => {
  const dump = ['DryTrek_Damasker_PD_14_1', '7. COPY CARD', 'x', 'IMAGE PROMPT', 'Gaiters in neon green on white.', 'REFERENCE IMAGES:', 'https://a/b.jpg', 'ASPECT: 1:1', 'END IMAGE PROMPT', '10. Primary KPI', 'CTR'].join('\n');
  const b = promptUrBrief(dump);
  assert.equal(b.prompt, 'Gaiters in neon green on white.');
  assert.deepEqual(b.referenser, ['https://a/b.jpg']);
  assert.equal(b.bildformat, '1:1');
});

test('promptUrBrief: Notion har slagit ihop raderna till ett stycke (mätt 2026-09-12) — markörerna hittas ändå', () => {
  // Så här kom DryTrek_Damasker_PD_14_17 tillbaka ur Notion: prompten + "REFERENCE IMAGES:"
  // i ett stycke, och URL + ASPECT + END i ett listelement.
  const dump = [
    'IMAGE PROMPT',
    'Professional product photo of gaiters, no face. REFERENCE IMAGES:',
    'https://cdn/damask-se-NG-ren.jpg ASPECT: 4:5 END IMAGE PROMPT',
  ].join('\n');
  const b = promptUrBrief(dump);
  assert.equal(b.prompt, 'Professional product photo of gaiters, no face.');
  assert.deepEqual(b.referenser, ['https://cdn/damask-se-NG-ren.jpg']);
  assert.equal(b.bildformat, '4:5');
  // Två referenser på samma rad, och END på samma rad som ASPECT.
  const b2 = promptUrBrief('IMAGE PROMPT\nx y z REFERENCE IMAGES: https://a/1.jpg https://a/2.jpg ASPECT: 1:1 END IMAGE PROMPT trailing text');
  assert.equal(b2.prompt, 'x y z');
  assert.deepEqual(b2.referenser, ['https://a/1.jpg', 'https://a/2.jpg']);
  assert.equal(b2.bildformat, '1:1');
});

test('promptUrBrief: utan END-markör tar blocket resten av texten; utan ASPECT blir det 4:5', () => {
  const b = promptUrBrief('IMAGE PROMPT\nrad ett\nrad två');
  assert.equal(b.prompt, 'rad ett\nrad två');
  assert.deepEqual(b.referenser, []);
  assert.equal(b.bildformat, STANDARD_FORMAT);
});

test('promptUrBrief: saknat block eller tom prompt ⇒ null; ogiltigt ASPECT kastar', () => {
  assert.equal(promptUrBrief('# Brief\n## COPY CARD\ntext'), null);
  assert.equal(promptUrBrief('IMAGE PROMPT\n\nEND IMAGE PROMPT'), null);
  assert.equal(promptUrBrief(''), null);
  assert.throws(() => promptUrBrief('IMAGE PROMPT\nx\nASPECT: 7:3\nEND IMAGE PROMPT'), /Ogiltigt ASPECT/);
});

test('promptUrBrief: dubbletter i referenser slås ihop, fler än 10 kastar', () => {
  const b = promptUrBrief('IMAGE PROMPT\nx\nREFERENCE IMAGES: https://a/1.jpg https://a/1.jpg\nEND IMAGE PROMPT');
  assert.deepEqual(b.referenser, ['https://a/1.jpg']);
  const många = Array.from({ length: 11 }, (_, i) => `- https://a/${i}.jpg`).join('\n');
  assert.throws(() => promptUrBrief(`IMAGE PROMPT\nx\nREFERENCE IMAGES:\n${många}\nEND IMAGE PROMPT`), /max 10/);
});

const rader = [
  { id: 'p1', namn: 'DryTrek_Damasker_PD_14_1 – Neongrön', url: 'https://n/1', filer: [], brieftext: BRIEF },
  { id: 'p2', namn: 'DryTrek_Damasker_PD_14_2', url: 'https://n/2', filer: [{ namn: 'DryTrek_Damasker_PD_14_2.png' }], brieftext: BRIEF },
  { id: 'p3', namn: 'Damasker_BOF_1_1', url: 'https://n/3', filer: [], brieftext: '# Gammal Bäverbutiks-brief utan block' },
  { id: 'p4', namn: 'DryTrek_Damasker_PD_14_4', url: 'https://n/4', filer: [], brieftext: 'IMAGE PROMPT\nno refs here\nEND IMAGE PROMPT' },
];

test('byggJobb: rad med block blir jobb, rad med fil hoppas, rad utan block hoppas — alla med skäl', () => {
  const { jobb, hoppade } = byggJobb(rader, { hubTitel: 'Damasker vandring' });
  assert.deepEqual(jobb.map((j) => j.namn), ['DryTrek_Damasker_PD_14_1', 'DryTrek_Damasker_PD_14_4']);
  assert.equal(jobb[0].typ, TILLATEN_TYP);
  assert.equal(jobb[0].page_id, 'p1');
  assert.equal(jobb[0].hub, 'Damasker vandring');
  assert.equal(jobb[0].referens_kalla, 'brief');
  assert.equal(jobb[1].referens_kalla, 'ingen');
  assert.deepEqual(jobb[1].referens_bilder, []);
  assert.equal(hoppade.length, 2);
  assert.match(hoppade.find((h) => h.namn === 'DryTrek_Damasker_PD_14_2').skal, /har redan 1 fil/);
  assert.match(hoppade.find((h) => h.namn === 'Damasker_BOF_1_1').skal, /ingen IMAGE PROMPT/);
});

test('byggJobb: fallback-referens ur produktfilen när briefen saknar referenser', () => {
  const { jobb } = byggJobb(rader, { fallbackReferens: 'https://cdn/produkt.jpg' });
  const u = jobb.find((j) => j.namn === 'DryTrek_Damasker_PD_14_4');
  assert.deepEqual(u.referens_bilder, ['https://cdn/produkt.jpg']);
  assert.equal(u.referens_kalla, 'produktfil');
  assert.equal(jobb[0].referens_kalla, 'brief', 'en brief med egna referenser rörs inte');
});

test('byggJobb: --igen genererar även rader som redan har fil', () => {
  const { jobb } = byggJobb(rader, { igen: true });
  assert.ok(jobb.some((j) => j.namn === 'DryTrek_Damasker_PD_14_2'));
});

test('byggJobb: --bara filtrerar (skiftlägesokänsligt) och rapporterar okända namn', () => {
  const { jobb, hoppade } = byggJobb(rader, { bara: ['drytrek_damasker_pd_14_1', 'Finns_Inte_1'] });
  assert.deepEqual(jobb.map((j) => j.namn), ['DryTrek_Damasker_PD_14_1']);
  assert.equal(hoppade.length, 1);
  assert.match(hoppade[0].skal, /finns inte i kön/);
});

test('lokalBrief: repots brief hittas per namn (senaste batchen), och vinner i byggJobb', () => {
  const rot = mkdtempSync(join(tmpdir(), 'ops-bild-'));
  const mapp = join(rot, 'products', 'drytrek', 'batch-03', 'image-ads-briefs', 'DryTrek_Damasker_PD_14_1');
  mkdirSync(mapp, { recursive: true });
  writeFileSync(join(mapp, 'brief.md'), 'x\n## IMAGE PROMPT\nrepo-prompt\nEND IMAGE PROMPT\n');
  const l = lokalBrief('drytrek', 'DryTrek_Damasker_PD_14_1 – Neongrön', rot);
  assert.ok(l && l.fil.endsWith('brief.md'));
  assert.equal(lokalBrief('drytrek', 'Finns_Inte_1', rot), null);
  assert.equal(lokalBrief('', 'x', rot), null);
  const { jobb } = byggJobb([{ id: 'p', namn: 'DryTrek_Damasker_PD_14_1', filer: [], brieftext: 'IMAGE PROMPT\nnotion-prompt', lokal: l }]);
  assert.equal(jobb[0].prompt, 'repo-prompt');
  assert.equal(jobb[0].prompt_kalla, 'repo');
  const utan = byggJobb([{ id: 'p', namn: 'DryTrek_Damasker_PD_14_1', filer: [], brieftext: 'IMAGE PROMPT\nnotion-prompt' }]);
  assert.equal(utan.jobb[0].prompt_kalla, 'notion');
});

test('nastaNummer: högsta upptagna + 1 per koncept, oavsett variant-suffix', () => {
  const namn = ['DryTrek_Damasker_PD_12_1', 'DryTrek_Damasker_PD_13_H1 – x', 'Damasker_PD_11_1', 'DryTrek_Damasker_SP_7_H1'];
  assert.equal(nastaNummer(namn, 'DryTrek_Damasker', 'PD'), 14);
  assert.equal(nastaNummer(namn, 'DryTrek_Damasker', 'SP'), 8);
  assert.equal(nastaNummer(namn, 'DryTrek_Damasker', 'FV'), 1);
  assert.equal(annonsdel('DryTrek_Damasker_PD_13_H1 – x'), 'DryTrek_Damasker_PD_13_H1');
});

// ------------------------------------------------------------ textlagret
import { textUrBrief, elementtyp, textFarger } from '../ops-bild.mjs';

test('elementtyp: briefens elementnamn → typ, okänt ⇒ null', () => {
  assert.equal(elementtyp('On-image headline'), 'rubrik');
  assert.equal(elementtyp('Headline (top, across both halves)'), 'rubrik');
  assert.equal(elementtyp('Sub-line'), 'underrad');
  assert.equal(elementtyp('Badge'), 'badge');
  assert.equal(elementtyp('Price'), 'pris');
  assert.equal(elementtyp('Price (small)'), 'pris');
  assert.equal(elementtyp('Struck through, smaller, beside price'), 'jamforpris');
  assert.equal(elementtyp('Badge', '−23 %'), 'rabatt', 'en badge som bara är en procent är rabattchipen');
  assert.equal(elementtyp('Bottom line'), 'botten');
  assert.equal(elementtyp('Bottom line (unchanged from parent)'), 'botten');
  assert.equal(elementtyp('Left label'), 'etikett_vanster');
  assert.equal(elementtyp('Right label'), 'etikett_hoger');
  assert.equal(elementtyp('On-image quote'), 'citat');
  assert.equal(elementtyp('Attribution'), 'namn');
  assert.equal(elementtyp('Stars', '★★★★★'), 'stjarnor');
  assert.equal(elementtyp('rubrik'), 'rubrik');
  assert.equal(elementtyp('Something odd'), null);
});

const EXACT = `## 4. Exact text (Swedish word for word, do not re-translate)
| Element | Swedish (use this) | English meaning |
|---|---|---|
| On-image headline | En present han klarar helt själv | A present he manages entirely by himself |
| Sub-line | Taköverdrag för husvagn & husbil – skyddar mot vinterns fukt | Roof cover … |
| Badge | 1 129 kr (ord. 1 469 kr) – spara 23 % | 1 129 kr (was 1 469 kr) – save 23 % |

## 5. Design brief
- The present is the hook.
## IMAGE PROMPT
x
END IMAGE PROMPT
`;

test('textUrBrief: tabellen "Exact text" i markdown', () => {
  const { element, okanda } = textUrBrief(EXACT);
  assert.deepEqual(element.map((e) => [e.typ, e.text]), [
    ['rubrik', 'En present han klarar helt själv'],
    ['underrad', 'Taköverdrag för husvagn & husbil – skyddar mot vinterns fukt'],
    ['badge', '1 129 kr (ord. 1 469 kr) – spara 23 %'],
  ]);
  assert.equal(okanda.length, 0);
  assert.equal(element[0].kalla, 'exact-text');
});

test('textUrBrief: samma tabell som Notion-dump (celler med " | ", ingen kantlinje)', () => {
  const dump = ['4. Exact text (Swedish word for word, do not re-translate)', '  Element | Swedish (use this) | English meaning',
    '  Price | 1 129 kr | 1 129 kr', '  Struck through, smaller, beside price | 1 469 kr | 1 469 kr', '  Badge | −23 % | −23 %',
    '  Bottom line | Fri frakt · Leverans 5–10 arbetsdagar | Free shipping', '⚠️ No other words on the canvas.', '5. Design brief'].join('\n');
  const { element } = textUrBrief(dump);
  assert.deepEqual(element.map((e) => e.typ), ['pris', 'jamforpris', 'rabatt', 'botten']);
  assert.equal(element[1].text, '1 469 kr');
});

test('textUrBrief: TEXT LAYER-blocket vinner över tabellen; okända typer rapporteras', () => {
  const md = `${EXACT}\n## TEXT LAYER\nrubrik: Bara taket.\nbotten: 1 129 kr\nkonstigt: hej\nEND TEXT LAYER\n`;
  const { element, okanda } = textUrBrief(md);
  assert.deepEqual(element.map((e) => [e.typ, e.text, e.kalla]), [['rubrik', 'Bara taket.', 'text-layer'], ['botten', '1 129 kr', 'text-layer']]);
  assert.deepEqual(okanda, [{ namn: 'konstigt', text: 'hej' }]);
});

test('textUrBrief: brief utan text ⇒ tomt (rent foto, t.ex. DryTreks färgvarianter)', () => {
  assert.deepEqual(textUrBrief(BRIEF), { element: [], okanda: [] });
  assert.deepEqual(textUrBrief(''), { element: [], okanda: [] });
});

test('byggJobb: jobbet bär textlagret ur briefen', () => {
  const { jobb } = byggJobb([{ id: 'p', namn: 'CaraShellRoof_GT_4_1', filer: [], brieftext: EXACT }]);
  assert.equal(jobb[0].text.length, 3);
  assert.equal(jobb[0].text[0].typ, 'rubrik');
});

test('textFarger: ur brandfilen, saknade fält blir undefined (bild-text.py har standardfärger)', () => {
  const f = textFarger({ branding: { farger: { mork: '#22282E', accent: '#1F6F8E', linje_stark: '#B3B8B0' } } });
  assert.equal(f.mork, '#22282E');
  assert.equal(f.accent, '#1F6F8E');
  assert.equal(f.dampad, '#B3B8B0');
  assert.equal(f.yta, undefined);
  assert.deepEqual(Object.keys(textFarger(null)).length, 7);
});
