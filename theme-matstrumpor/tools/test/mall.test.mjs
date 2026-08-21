import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  byggMall, hittaProduktsektion, kopplaInHead, plockaSchema, slåIhopInställningar,
  FÖRE_KNAPPEN, EFTER_KNAPPEN, SEKTIONER_UNDER, SIST_I_MALLEN,
} from '../mall.mjs';

// En förenklad men strukturellt äkta produktmall: sektionsnycklarna heter något
// annat än sina typer, precis som i ett riktigt tema.
const mall = () => ({
  sections: {
    'huvud-abc': {
      type: 'main-product',
      blocks: {
        b1: { type: 'title' },
        b2: { type: 'price' },
        b3: { type: 'buy_buttons' },
        b4: { type: 'description' },
      },
      block_order: ['b1', 'b2', 'b3', 'b4'],
    },
    relaterat: { type: 'related-products' },
  },
  order: ['huvud-abc', 'relaterat'],
});

const bas = extra => ({ mall: mall(), huvudId: 'huvud-abc', tarEmotTemablock: true, ...extra });
const typer = ny => ny.sections['huvud-abc'].block_order.map(id => ny.sections['huvud-abc'].blocks[id].type);

test('köpblocket får rätt ordning runt temats egen knapp', () => {
  assert.deepEqual(typer(byggMall(bas())), [
    'title', 'price', ...FÖRE_KNAPPEN, 'buy_buttons', ...EFTER_KNAPPEN, 'description',
  ]);
});

test('varje block som läggs in finns också i blocks-listan', () => {
  const ny = byggMall(bas());
  const s = ny.sections['huvud-abc'];
  for (const id of s.block_order) {
    assert.ok(s.blocks[id], `${id} saknas i blocks — den raden skulle göra sidan tom`);
  }
});

test('temats egna block rörs inte', () => {
  const ny = byggMall(bas());
  assert.deepEqual(ny.sections['huvud-abc'].blocks.b3, { type: 'buy_buttons' });
  assert.equal(ny.sections.relaterat.type, 'related-products');
});

test('en omkörning dubblerar ingenting', () => {
  const en = byggMall(bas());
  const två = byggMall({ mall: en, huvudId: 'huvud-abc', tarEmotTemablock: true });
  assert.deepEqual(typer(två), typer(en));
  assert.deepEqual(två.order, en.order);
});

test('sektionerna hamnar under köpblocket och sticky-knappen sist', () => {
  const ny = byggMall(bas());
  assert.deepEqual(ny.order, ['huvud-abc', ...SEKTIONER_UNDER, 'relaterat', SIST_I_MALLEN]);
  for (const typ of [...SEKTIONER_UNDER, SIST_I_MALLEN]) assert.equal(ny.sections[typ].type, typ);
});

test('stannar när sektionen inte tar emot temablock', () => {
  assert.throws(() => byggMall(bas({ tarEmotTemablock: false })), /tar inte emot temablock/);
});

test('stannar när köpknappen inte går att hitta', () => {
  const m = mall();
  delete m.sections['huvud-abc'].blocks.b3;
  m.sections['huvud-abc'].block_order = ['b1', 'b2', 'b4'];
  assert.throws(() => byggMall({ mall: m, huvudId: 'huvud-abc', tarEmotTemablock: true }), /köpknapp/);
});

test('produktsektionen hittas på knappen, inte på namnet', () => {
  const m = mall();
  m.sections['huvud-abc'].type = 'nagot-heltannat';
  assert.equal(hittaProduktsektion(m)[0], 'huvud-abc');
});

test('produktsektionen hittas på typen när knappen heter något oväntat', () => {
  const m = mall();
  m.sections['huvud-abc'].blocks.b3.type = 'kop';
  assert.equal(hittaProduktsektion(m)[0], 'huvud-abc');
});

test('knappmönstret känner igen skrivsätten i olika teman', () => {
  for (const typ of ['buy_buttons', 'buy-buttons', 'product-form', 'add_to_cart']) {
    const m = mall();
    m.sections['huvud-abc'].type = 'x';
    m.sections['huvud-abc'].blocks.b3.type = typ;
    assert.equal(hittaProduktsektion(m)?.[0], 'huvud-abc', typ);
  }
});

test('ms-head läggs in före </head> och bara en gång', () => {
  const ny = kopplaInHead('<head><title>x</title></head><body></body>');
  assert.match(ny, /\{% render 'ms-head' %\}\s*<\/head>/);
  assert.equal(kopplaInHead(ny), null);
});

test('ms-head stannar när </head> saknas', () => {
  assert.throws(() => kopplaInHead('<body></body>'), /<\/head>/);
});

test('settings_schema behåller theme_info först', () => {
  const rå = JSON.stringify([{ name: 'theme_info', theme_name: 'Bas' }, { name: 'Färger' }]);
  const ihop = JSON.parse(slåIhopInställningar(rå, [{ name: 'Matstrumpor A/B', settings: [] }]));
  assert.equal(ihop[0].name, 'theme_info');
  assert.equal(ihop.at(-1).name, 'Matstrumpor A/B');
});

test('settings_schema byter ut vår grupp i stället för att lägga till en till', () => {
  const rå = JSON.stringify([{ name: 'theme_info' }, { name: 'Matstrumpor A/B', settings: ['gammal'] }]);
  const ihop = JSON.parse(slåIhopInställningar(rå, [{ name: 'Matstrumpor A/B', settings: ['ny'] }]));
  assert.equal(ihop.filter(g => g.name === 'Matstrumpor A/B').length, 1);
  assert.deepEqual(ihop.at(-1).settings, ['ny']);
});

test('schemat plockas ur en sektionsfil', () => {
  const liquid = '<div></div>\n{% schema %}\n{"name":"x","blocks":[{"type":"@theme"}]}\n{% endschema %}';
  assert.deepEqual(plockaSchema(liquid).blocks, [{ type: '@theme' }]);
  assert.equal(plockaSchema('ingen schema här'), null);
});
