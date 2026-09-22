import { test } from 'node:test';
import assert from 'node:assert/strict';
import { avsnitt, ifyllt, granska, produktmall, avatarmall, urProduktsida, PRODUKTFALT, AVATARFALT } from '../produktunderlag.mjs';

const FYLLD = (rubriker) => rubriker.map((r) => `## ${r}\n\nDet här fältet är ifyllt med tillräckligt mycket text för att räknas.\n`).join('\n');

test('avsnitt plockar rätt rubrik och stannar vid nästa', () => {
  const t = '# H\n\n## Mekanismen\n\nDärför att luften rör sig.\n\n## Benefits\n\nAnnat.\n';
  assert.equal(avsnitt(t, 'Mekanismen'), 'Därför att luften rör sig.');
  assert.equal(avsnitt(t, 'Benefits'), 'Annat.');
  assert.equal(avsnitt(t, 'Finns inte'), null);
});

test('ifyllt räknar kvarlämnad [FYLL I] och ren hjälptext som tomt', () => {
  assert.equal(ifyllt('[FYLL I: varför den fungerar]'), false);
  assert.equal(ifyllt(''), false);
  assert.equal(ifyllt('   '), false);
  assert.equal(ifyllt('för kort'), false);
  assert.equal(ifyllt('_bara hjälptexten i kursiv, inget eget_'), false);
  assert.equal(ifyllt('Draget täcker bara taket, så sidorna står öppna och luften rör sig fritt.'), true);
});

test('mekanismen är det ENDA hårda stoppet', () => {
  // Allt tomt utom mekanismen ⇒ inga stopp, bara anmärkningar.
  const baraMekanism = `# X\n\n## Mekanismen\n\nSidorna står öppna, så luften rör sig fritt under draget.\n`;
  const d1 = granska({ produkt: baraMekanism, avatar: '# A\n' });
  assert.equal(d1.ok, true, 'ifylld mekanism ska släppa igenom');
  assert.equal(d1.stopp.length, 0);
  assert.ok(d1.anmarkningar.length >= PRODUKTFALT.length - 1);

  // Allt ifyllt UTOM mekanismen ⇒ stopp.
  const utanMekanism = FYLLD(PRODUKTFALT.filter((f) => !f.hart).map((f) => f.rubrik));
  const d2 = granska({ produkt: utanMekanism, avatar: FYLLD(AVATARFALT.map((f) => f.rubrik)) });
  assert.equal(d2.ok, false);
  assert.equal(d2.stopp.length, 1);
  assert.match(d2.stopp[0], /MEKANISMEN ÄR OBLIGATORISK/);
  assert.equal(d2.anmarkningar.length, 0, 'inga andra fält ska anmärkas när de är ifyllda');
});

test('allt ifyllt ger grönt utan anmärkningar', () => {
  const dom = granska({
    produkt: FYLLD(PRODUKTFALT.map((f) => f.rubrik)),
    avatar: FYLLD(AVATARFALT.map((f) => f.rubrik)),
  });
  assert.equal(dom.ok, true);
  assert.deepEqual(dom.stopp, []);
  assert.deepEqual(dom.anmarkningar, []);
});

test('saknad produkt.md stoppar, saknad avatar.md anmärker bara', () => {
  const utan = granska({ produkt: null, avatar: null });
  assert.equal(utan.ok, false);
  assert.match(utan.stopp.join(' '), /produkt\.md saknas/);
  assert.match(utan.anmarkningar.join(' '), /avatar\.md saknas/);
  // Avatar saknas men mekanismen finns ⇒ släpps igenom.
  const bara = granska({ produkt: '## Mekanismen\n\nSidorna står öppna, luften rör sig fritt.\n', avatar: null });
  assert.equal(bara.ok, true);
});

test('mallarna bär alla fält och stoppmarkeringen', () => {
  const p = produktmall('takoverdraget-husvagn', { idag: '2026-09-21' });
  for (const f of PRODUKTFALT) assert.ok(p.includes(`## ${f.rubrik}`), `saknar ${f.rubrik}`);
  assert.match(p, /Mekanismen är obligatorisk/);
  // En tom mall ska stoppas av sin egen granskning — annars är grinden falsk.
  assert.equal(granska({ produkt: p, avatar: avatarmall('x') }).ok, false);
  const a = avatarmall('x');
  for (const f of AVATARFALT) assert.ok(a.includes(`## ${f.rubrik}`), `saknar ${f.rubrik}`);
  assert.match(a, /aldrig texten i en annons/);
});

test('urProduktsida läser mått, material, varianter och pris', () => {
  const k = urProduktsida({
    title: 'Taköverdrag Husvagn',
    body_html: '<p>Täcker hela takytan, 6,5 x 3 m. Tillverkad i 210D Oxford-väv som tål frost.</p>',
    variants: [{ title: 'Default Title', price: '1129.00', compare_at_price: '1469.00' }],
    images: [{}, {}, {}],
  });
  assert.equal(k.titel, 'Taköverdrag Husvagn');
  assert.match(k.fysiskt, /3 m/);
  assert.match(k.fysiskt, /210d|oxford/i);
  assert.match(k.foretaget, /1129 kr/);
  assert.match(k.foretaget, /spara 340 kr, 23 %/);
  assert.match(k.produkten, /^- /m);
  // Ingen mekanism läses maskinellt — den finns inte på någon produktsida.
  assert.equal(k.mekanism, undefined);
  assert.deepEqual(urProduktsida(null), {});
});

test('en sida utan pris eller mått ger tomma fält i stället för påhittade', () => {
  const k = urProduktsida({ title: 'X', body_html: '<p>Kort.</p>', variants: [], images: [] });
  assert.equal(k.fysiskt, undefined);
  assert.equal(k.foretaget, undefined);
  assert.equal(k.titel, 'X');
});
