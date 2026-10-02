// Spoks på alla språk: språklistan, landsfiltren, översättningen och flödena
// där varje språk är ett sändsteg i samma flöde.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { sprakKonfig, sprakFilter, mejlText, oversattMejl, hash, kalla, kallaUi, byggAllaSprak, textFel, uiOchCitatFel, talIKallan } from '../spoks-sprak.mjs';
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

test('en mejl_sprak-rad med spoks: false hoppas — landet får reservspråket (Japan och Taiwan 2026-09-30)', () => {
  const b = { testbutik: { ...butiker.testbutik, mejl_sprak: [...butiker.testbutik.mejl_sprak, { locale: 'ja', sprak: 'ja', mapp: 'ja', spoks: false }] } };
  const k = sprakKonfig(brand(), ROT, b);
  assert.deepEqual(k.sprak.map((x) => x.sprak), ['sv', 'nb', 'en', 'pt']);
  assert.throws(() => sprakKonfig(brand({ SE: 'sv', JP: 'ja' }), ROT, b), /språket "ja", som saknas/);
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

test('svenska räkneord i källan räknas som tal: "Fem par" får bli 5 men inte 6, och en etta kräver en siffra', () => {
  assert.deepEqual(talIKallan('Fem par, två lådor och Åtta recensioner, snitt 4,5.').sort(), ['2', '4', '5', '5', '8']);
  // Ordgräns: "tio" i "trettio" och "tre" i "trettio" är inga räkneord.
  assert.deepEqual(talIKallan('trettio nionde'), []);
  assert.deepEqual(textFel('f', 'Fem par i en låda.', '5足のソックス'), []);
  assert.match(textFel('f', 'Fem par i en låda.', '6足のソックス').join('\n'), /talet 6 finns inte/);
  // "en"/"ett" är oftast artiklar och räknas inte.
  assert.match(textFel('f', 'En låda till.', 'もう1箱').join('\n'), /talet 1 finns inte/);
});

test('helbreddssiffror räknas som siffror: ６足 stoppar precis som 6足', () => {
  assert.match(textFel('f', 'Fem par.', '６足').join('\n'), /talet 6 finns inte/);
  assert.deepEqual(textFel('f', 'Fem par.', '５足'), []);
});

test('japanska tankstreck stoppar, katakanans långa vokaltecken gör det inte', () => {
  for (const t of ['寿司ソックス―本物そっくり', 'ソックス──寿司', '寿司－ソックス']) assert.match(textFel('f', 'x', t).join('\n'), /tankstreck/, t);
  assert.deepEqual(textFel('f', 'Hamburgare-Strumpor och en medlem.', 'ハンバーガーソックスとメンバー'), []);
});

test('stopp per språk ur brandfilen: talet fyra, kanji-antal och tilltalet stoppar bara sitt språk', () => {
  const b = { testbutik: { ...butiker.testbutik, mejl_sprak: [...butiker.testbutik.mejl_sprak, { locale: 'ja', sprak: 'ja', mapp: 'ja' }] } };
  const br = { ...brand({ SE: 'sv', JP: 'ja', US: 'en' }), spoks_sprak: { huvudsprak: 'sv', reserv: 'en', lander: { SE: 'sv', JP: 'ja', US: 'en' }, stopp: { ja: [
    { monster: '[四肆4４]', orsak: 'talet fyra' },
    { monster: '[一二三五六七八九十]+(?:足|件|つ)', orsak: 'antal med siffror' },
    { monster: '\\{\\{fornamn\\}\\}(?!様)', orsak: 'skriv {{fornamn}}様' },
  ] } } };
  const k = sprakKonfig(br, ROT, b);
  const ja = k.stoppFor('ja');
  assert.equal(k.stoppFor('en').length, 0);
  assert.match(textFel('f', 'Onesize 36-44.', 'フリーサイズ（EU36-44）', ja).join('\n'), /talet fyra/);
  assert.match(textFel('f', '4,5 av 5.', '平均4.5', ja).join('\n'), /talet fyra/);
  assert.match(textFel('f', 'Fyra sorter.', '四種類', ja).join('\n'), /talet fyra/);
  assert.match(textFel('f', 'Fem par.', '五足', ja).join('\n'), /antal med siffror/);
  assert.match(textFel('f', 'Hej {{fornamn}},', '{{fornamn}}さん、こんにちは', ja).join('\n'), /skriv \{\{fornamn\}\}様/);
  assert.deepEqual(textFel('f', 'Hej {{fornamn}}, fem par och ett klick.', '{{fornamn}}様、5足とワンクリック。一番人気。', ja), []);
  // Samma text på engelska har inga japanska stopp.
  assert.deepEqual(textFel('f', 'Fyra sorter, 36-44.', 'Four kinds, 36-44.', k.stoppFor('en')), []);
  // Ett stavfel i språkkoden stoppar i stället för att tyst inte stoppa något.
  assert.throws(() => sprakKonfig({ ...br, spoks_sprak: { ...br.spoks_sprak, stopp: { jp: [] } } }, ROT, b), /språket "jp"/);
  assert.throws(() => sprakKonfig({ ...br, spoks_sprak: { ...br.spoks_sprak, stopp: { ja: [{ monster: 'x' }] } } }, ROT, b), /monster" och "orsak/);
});

test('ui-raderna och citaten går genom samma kontroller som mejltexten', () => {
  const svUi = kallaUi({ angerratt_text: '30 dagars returrätt', klubb: { namn: 'Matstrumpor-klubben' } });
  const svCitat = { [hash('Jätte sköna strumpor')]: 'Jätte sköna strumpor' };
  const ok = { ui: { fakta_retur_text: '30日間返品OK', medlem_i: '{klubb}メンバー' }, citat: { [hash('Jätte sköna strumpor')]: 'とても履き心地のいいソックス' } };
  assert.deepEqual(uiOchCitatFel(ok, svUi, svCitat, 'ja', [{ re: /[四4]/u, orsak: 'talet fyra' }]), []);
  const fel = uiOchCitatFel({
    ui: { fakta_retur_text: '45日間返品OK', medlem_i: 'メンバー', knapp_till: '商品へ―今すぐ' },
    citat: { [hash('Jätte sköna strumpor')]: '4足とも最高' },
  }, svUi, svCitat, 'ja', [{ re: /[四4]/u, orsak: 'talet fyra' }]).join('\n');
  assert.match(fel, /ja: ui\.fakta_retur_text: talet 45 finns inte/);
  assert.match(fel, /ui\.medlem_i: \{klubb\} saknas/);
  assert.match(fel, /ui\.knapp_till: tankstreck/);
  assert.match(fel, /citat [0-9a-f]{12}: "4" — talet fyra/);
});

test('flödesversionen: saknas den är det 1, annars ett heltal ≥ 1', () => {
  assert.equal(sprakKonfig(brand(), ROT, butiker).version, 1);
  const med = (v) => ({ ...brand(), spoks_sprak: { ...brand().spoks_sprak, flodesversion: v } });
  assert.equal(sprakKonfig(med(2), ROT, butiker).version, 2);
  assert.throws(() => sprakKonfig(med(0), ROT, butiker), /flodesversion/);
  assert.throws(() => sprakKonfig(med('v2'), ROT, butiker), /flodesversion/);
});

test('Matstrumpor 2026-10-02 (S-017, S-018): Japan japanska, Belgien franska, Taiwan engelska', () => {
  const br = JSON.parse(readFileSync(join(ROT, 'klaviyo', 'brands', 'matstrumpor.json'), 'utf8'));
  const k = sprakKonfig(br, ROT);
  assert.ok(k.sprak.some((x) => x.sprak === 'ja' && x.mapp === 'ja'), 'ja finns i Spoks-språken');
  assert.ok(!k.sprak.some((x) => x.sprak === 'zh'), 'zh-TW är inte lanserat och har spoks: false');
  assert.deepEqual(sprakFilter(k, 'ja'), { type: 'filter', field: 'country', operator: 'in', value: ['Japan'] });
  assert.deepEqual(sprakFilter(k, 'fr').value.sort(), ['Belgium', 'France', 'Luxembourg']);
  assert.deepEqual(sprakFilter(k, 'nl'), { type: 'filter', field: 'country', operator: 'in', value: ['Netherlands'] });
  const en = JSON.stringify(sprakFilter(k, 'en'));
  assert.ok(en.includes('"Japan"') && en.includes('"Belgium"'), 'engelskan utesluter Japan och Belgien');
  assert.ok(!en.includes('Taiwan'), 'Taiwan får engelska');
  assert.ok(k.stoppFor('ja').length > 0, 'japanskan har sina stopp');
  assert.ok(k.version >= 2, 'ändrade landsfilter kräver en ny flödesversion');
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
  // Version 2 (2026-10-02): japanska + Belgien på franska byggs bredvid version 1, som är igång.
  assert.equal(f01.namn, 'F01 Välkomst (Matstrumpor-klubben) · alla språk v2');
  assert.equal(r.manifest.flodesversion, 2);
  const send = f01.steg.filter((s) => s.typ === 'send');
  assert.equal(send.length, 3);
  assert.ok(send.every((s) => JSON.stringify(s.filter).includes('Sweden')));
  // F06 är segment-triggat och blir aldrig ett flöde.
  assert.ok(!r.manifest.floden.some((f) => f.id === 'f06-sunset'));
  assert.equal(r.manifest.segment.length, 13);
  assert.ok(r.manifest.segment.some((s) => s.namn === 'SEG_samtycke_ja'));
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
