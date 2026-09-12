// Tester för factory/ops-bild.mjs — de rena funktionerna, inga nätanrop.
import test from 'node:test';
import assert from 'node:assert/strict';
import { promptUrBrief, byggJobb, nastaNummer, annonsdel, TILLATEN_TYP, STANDARD_FORMAT } from '../ops-bild.mjs';

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

test('nastaNummer: högsta upptagna + 1 per koncept, oavsett variant-suffix', () => {
  const namn = ['DryTrek_Damasker_PD_12_1', 'DryTrek_Damasker_PD_13_H1 – x', 'Damasker_PD_11_1', 'DryTrek_Damasker_SP_7_H1'];
  assert.equal(nastaNummer(namn, 'DryTrek_Damasker', 'PD'), 14);
  assert.equal(nastaNummer(namn, 'DryTrek_Damasker', 'SP'), 8);
  assert.equal(nastaNummer(namn, 'DryTrek_Damasker', 'FV'), 1);
  assert.equal(annonsdel('DryTrek_Damasker_PD_13_H1 – x'), 'DryTrek_Damasker_PD_13_H1');
});
