// Spoks på alla språk: språklistan, landsfiltren, översättningen och flödena
// där varje språk är ett sändsteg i samma flöde.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sprakKonfig, sprakFilter, mejlText, oversattMejl, hash, kalla, byggAllaSprak } from '../spoks-sprak.mjs';
import { mejlTillSpoks, UI_SV } from '../spoks-paket.mjs';
import { ROT } from '../mallar.mjs';

const butiker = {
  testbutik: {
    sprak: 'sv',
    mejl_sprak: [
      { locale: 'nb', sprak: 'nb', mapp: 'nb' },
      { locale: 'en', sprak: 'en', mapp: 'en' },
      { locale: 'pt-PT', sprak: 'pt', mapp: 'pt' },
    ],
  },
};
const brand = (lander = { SE: 'sv', NO: 'nb', US: 'en', PT: 'pt' }) => ({
  id: 'testbutik',
  butik_url: 'https://testbutik.se',
  spoks_sprak: { huvudsprak: 'sv', reserv: 'en', lander },
});

test('språken kommer ur mejl_sprak, huvudspråket först, mappen följer med', () => {
  const k = sprakKonfig(brand(), ROT, butiker);
  assert.deepEqual(k.sprak.map((x) => x.sprak), ['sv', 'nb', 'en', 'pt']);
  assert.equal(k.sprak.find((x) => x.sprak === 'pt').mapp, 'pt');
  assert.equal(k.sprak.find((x) => x.sprak === 'pt').locale, 'pt-PT');
  assert.equal(k.landsnamn('SE'), 'Sweden');
  assert.equal(k.landsnamn('US'), 'United States');
});

test('ett land som pekar på ett språk utan mejl_sprak-rad stoppar bygget', () => {
  assert.throws(() => sprakKonfig(brand({ SE: 'sv', DE: 'de' }), ROT, butiker), /språket "de", som saknas/);
  assert.throws(() => sprakKonfig(brand({ se: 'sv' }), ROT, butiker), /ISO-landskod/);
});

test('huvudspråket tar sitt land och kontakter utan land', () => {
  const k = sprakKonfig(brand(), ROT, butiker);
  const f = sprakFilter(k, 'sv');
  assert.equal(f.operator, 'or');
  assert.deepEqual(f.filters[0], { type: 'filter', field: 'country', operator: 'in', value: ['Sweden'] });
  assert.deepEqual(f.filters[1], { type: 'filter', field: 'country', operator: 'nis' });
  assert.deepEqual(sprakFilter(k, 'nb'), { type: 'filter', field: 'country', operator: 'in', value: ['Norway'] });
});

test('reservspråket tar varje land som inte har ett eget språk — ett nytt land blir aldrig svenskt', () => {
  const k = sprakKonfig(brand(), ROT, butiker);
  const f = sprakFilter(k, 'en');
  assert.equal(f.operator, 'and');
  assert.deepEqual(f.filters[0], { type: 'filter', field: 'country', operator: 'is' });
  assert.deepEqual(f.filters[1].value.sort(), ['Norway', 'Portugal', 'Sweden']);
  assert.equal(f.filters[1].operator, 'nin');
  // Ett land utan rad (Tjeckien) finns inte i något in-filter, alltså bara i reservens.
  const allaIn = ['sv', 'nb', 'pt'].flatMap((s) => JSON.stringify(sprakFilter(k, s)));
  assert.ok(!allaIn.join('').includes('Czech'));
});

test('ett nytt land är en rad: Österrike på portugisiska hamnar i pt-filtret och ut ur reservens', () => {
  const k = sprakKonfig(brand({ SE: 'sv', NO: 'nb', US: 'en', PT: 'pt', AT: 'pt' }), ROT, butiker);
  assert.deepEqual(sprakFilter(k, 'pt').value.sort(), ['Austria', 'Portugal']);
  assert.ok(sprakFilter(k, 'en').filters[1].value.includes('Austria'));
});

test('fler än 25 länder delas i flera in-filter (Spoks tak)', () => {
  const lander = { SE: 'sv' };
  const iso = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'RO', 'SK', 'SI', 'ES', 'IS', 'LI', 'CH'];
  for (const c of iso) lander[c] = 'nb';
  const k = sprakKonfig(brand(lander), ROT, butiker);
  const f = sprakFilter(k, 'nb');
  assert.equal(f.operator, 'or');
  assert.equal(f.filters.length, 2);
  assert.ok(f.filters.every((x) => x.value.length <= 25));
});

const mejl = {
  id: 'k99-test',
  amnesrader: [{ text: 'Beställ senast 8 december' }],
  forhandstext: 'Fars dag är den 8 november.',
  block: [
    { typ: 'hero', rubrik: 'Hej {{fornamn}}', text: 'Tre par i lådan.', bild: 'produkt:sushi-strumpor', knapp: { text: 'Se lådan', lank: 'produkt:sushi-strumpor' } },
    { typ: 'punkter', rubrik: 'Bara för medlemmar', punkter: ['Sista dagen inför fars dag.', 'Kundernas ord.'] },
    { typ: 'fakta' },
  ],
};
const oversattning = (andra = {}) => ({
  kalla: hash(mejlText(mejl)),
  amne: 'Order early',
  forhandstext: null,
  block: [
    { rubrik: 'Hi {{fornamn}}', text: 'Three pairs in the box.', 'knapp.text': 'See the box' },
    { rubrik: 'Members only', punkter: [null, 'Real customer words.'] },
    {},
  ],
  ...andra,
});

test('översättningen läggs på svenskans form: null tar bort en rad, länkar och handles orörda', () => {
  const r = oversattMejl(mejl, oversattning(), 'en');
  assert.deepEqual(r.fel, []);
  assert.equal(r.mejl.amnesrader[0].text, 'Order early');
  assert.equal(r.mejl.forhandstext, '');
  assert.deepEqual(r.mejl.block[1].punkter, ['Real customer words.']);
  assert.equal(r.mejl.block[0].knapp.lank, 'produkt:sushi-strumpor');
  assert.equal(r.mejl.block[0].bild, 'produkt:sushi-strumpor');
});

test('påhittat tal, tankstreck, okänd token och saknad nyckel stoppar', () => {
  const t = oversattning();
  t.block[0].text = 'Five pairs — 5 of them. {{ contact.city }}';
  delete t.block[1].rubrik;
  const r = oversattMejl(mejl, t, 'en');
  const alla = r.fel.join('\n');
  assert.match(alla, /talet 5 finns inte/);
  assert.match(alla, /tankstreck/);
  assert.match(alla, /okänd token/);
  assert.match(alla, /block 1 rubrik: saknas/);
});

test('ändrad svenska efter översättningen syns som gammal källa', () => {
  const r = oversattMejl({ ...mejl, forhandstext: 'Ny text' }, oversattning(), 'en');
  assert.match(r.fel.join('\n'), /ändrats sedan en översattes/);
});

test('ett mejl på ett annat språk: bildkort med titeln på språket, länkar till språkmappen, inget pris', () => {
  const facit = { produkter: { 'sushi-strumpor': { id: '2b2d6bcd-dce7-411f-92f9-936a77a1c64f', bild_id: '572aba92-105a-4a4b-ae80-e9bd48ecbbaa' }, 'pizza-strumpor': { id: 'a70729cd-9bba-4eb7-af6e-f37206b20cde', bild_id: 'dcd8eed9-1e12-41c4-8200-e45067ab2fa3' } } };
  const ui = { ...UI_SV, knapp_till: 'See it', knapp_titta: 'Look again', hej_reserv: 'Hi', du_reserv: 'there', fakta_retur_rubrik: 'Returns', fakta_retur_text: '30-day returns', fakta_sparning_rubrik: 'Track', fakta_sparning_text: 'Follow it' };
  const m = { id: 'x', amnesrader: [{ text: 'Hi {{fornamn}}' }], block: [
    { typ: 'produktrad', rubrik: 'Two boxes', handles: ['sushi-strumpor', 'pizza-strumpor'] },
    { typ: 'dynamisk', kalla: 'visad_produkt' },
    { typ: 'fakta' },
  ] };
  const r = mejlTillSpoks(m, {
    brand: { id: 't', butik_url: 'https://testbutik.se', angerratt_text: '30 dagars returrätt' }, facit, produkt: () => null, recensioner: {},
    ui, sprak: 'en', bas: 'https://testbutik.se/en', sparningssida: 'https://testbutik.se/en/pages/spara', produktkort: 'bild',
    titel: (h) => ({ 'sushi-strumpor': 'Sushi Socks', 'pizza-strumpor': 'Pizza Socks' })[h],
  }, { titel: 'X' });
  assert.deepEqual(r.fel, []);
  const json = JSON.stringify(r.post);
  assert.ok(!json.includes('"type":"products","selectionMode":"manual"'), 'inget katalogkort med svensk titel och kronor');
  const kol = r.post.blocks.find((b) => b.type === 'columns');
  assert.equal(kol.columns[0].blocks[0].type, 'image');
  assert.equal(kol.columns[0].blocks[0].urlRedirect, 'https://testbutik.se/en/products/sushi-strumpor');
  assert.equal(kol.columns[1].blocks[1].text, 'Pizza Socks');
  const dyn = r.post.blocks.find((b) => b.selectionMode === 'dynamic');
  assert.equal(dyn.productVisibilitySettings.isPriceVisible, false);
  assert.equal(dyn.buttonText, 'Look again');
  assert.match(json, /30-day returns/);
  assert.match(json, /https:\/\/testbutik\.se\/en\/pages\/spara/);
  assert.equal(r.post.customizedNotification.emailTitle, "Hi {{ contact.first_name | default: 'there' }}");
});

test('Matstrumpor: alla flöden, ett sändsteg per språk och mejl, landsfilter på varje steg', async () => {
  const facit = JSON.parse(readFileSync(join(ROT, 'klaviyo', 'konto', 'matstrumpor', 'spoks.json'), 'utf8'));
  const produkter = Object.keys(facit.produkter).map((h) => ({ handle: h, titel: h, url: `https://matstrumpor.se/products/${h}` }));
  const k = JSON.parse(readFileSync(join(ROT, 'klaviyo', 'innehall', 'matstrumpor', 'sprak', 'KALLA.json'), 'utf8'));
  const recensioner = { 'sushi-strumpor': Object.values(k.citat).map((text) => ({ namn: null, betyg: 5, text, verifierad: true })) };
  const r = await byggAllaSprak({ brandId: 'matstrumpor', produkter, recensioner, facit, bara: ['sv'], utDir: mkdtempSync(join(tmpdir(), 'spoks-sprak-')) });
  assert.deepEqual(r.manifest.fel, []);
  const f01 = r.manifest.floden.find((f) => f.id === 'f01-valkomst');
  assert.equal(f01.namn, 'F01 Välkomst (Matstrumpor-klubben) · alla språk');
  const send = f01.steg.filter((s) => s.typ === 'send');
  assert.equal(send.length, 3);
  assert.ok(send.every((s) => JSON.stringify(s.filter).includes('Sweden')));
  // F06 är segment-triggat och blir aldrig ett flöde.
  assert.ok(!r.manifest.floden.some((f) => f.id === 'f06-sunset'));
  assert.equal(r.manifest.segment.length, 12);
});

test('KALLA.json i repot är aktuell mot innehållet (kör --kalla när svenskan ändrats)', () => {
  const fil = JSON.parse(readFileSync(join(ROT, 'klaviyo', 'innehall', 'matstrumpor', 'sprak', 'KALLA.json'), 'utf8'));
  const ny = kalla({ innehall: { kampanjer: [], floden: [] }, recensioner: {} });
  assert.ok(ny.ui.knapp_till);
  for (const [id, m] of Object.entries(fil.mejl)) {
    const { kalla: h, ...rest } = m;
    assert.equal(h, hash(rest), `${id}: kallhashen stämmer inte med texten`);
  }
});
