// Alias och blockerade prefix i leveransrundans kampanjuppslag
// (products/prefix-alias.json), plus länkspärren i notion-till-meta.mjs.
//
// 2026-09-29 blockerades de gamla `TackleBayRod_`-raderna i hubben Fish rod
// holder (landningssida tacklebay.se). 2026-10-03 sa Axel att de ska upp i
// Bäverbutikens Fiskespöhållaren — nu ett alias med tvingad landningssida på
// baverbutiken.se. Blockeringsmekanismen står kvar och testas med syntetisk data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { kampanjForPrefix } from '../lib/kampanjval.mjs';
import { lankTillaten, sammaSida, valjLank } from '../lib/landningssida.mjs';

const FISK = { id: '120249850522830291', name: 'Fiskespöhållaren | BE ROAS 1.50 | Launch 2026-08-18', status: 'ACTIVE' };
const LANDNING = 'https://baverbutiken.se/products/fiskespohallare-4-pack-kraftig-forvaring';
const alias = {
  tacklebayrod: {
    kampanj_id: FISK.id, kampanj_namn: FISK.name, kontots_prefix: 'Rodholder',
    landningssida: LANDNING, butiksord_extra: ['TackleBay', 'tacklebay.se'],
  },
};

test('alias med landningssida returnerar den och de extra butiksorden', () => {
  const r = kampanjForPrefix('tacklebayrod', { alias });
  assert.equal(r.kampanj.id, FISK.id);
  assert.equal(r.kalla, 'prefix-alias.json');
  assert.equal(r.landningssida, LANDNING);
  assert.deepEqual(r.butiksord_extra, ['TackleBay', 'tacklebay.se']);
});

test('landningssidan följer med även när kontot redan känner prefixet', () => {
  // Efter första uppladdningen vinner kontot över aliaset — länken får inte tappas.
  const r = kampanjForPrefix('tacklebayrod', { karta: { tacklebayrod: FISK }, alias });
  assert.equal(r.kalla, 'kontot');
  assert.equal(r.landningssida, LANDNING);
});

test('ett blockerat prefix vinner fortfarande över kontot och ett alias', () => {
  const blockerade = { gammalt: { orsak: 'nedlagd butik' } };
  const al = { gammalt: { kampanj_id: 'K', kampanj_namn: 'X', landningssida: LANDNING } };
  const r = kampanjForPrefix('gammalt', { karta: { gammalt: FISK }, alias: al, blockerade });
  assert.equal(r.kampanj, null);
  assert.equal(r.kalla, 'blockerad');
  assert.match(r.blockerad, /nedlagd/);
  assert.equal(r.landningssida, undefined);
});

test('Bäverbutikens egna Rodholder_-rader går som förut, utan tvingad länk', () => {
  const r = kampanjForPrefix('rodholder', { karta: { rodholder: FISK }, alias });
  assert.equal(r.kampanj.id, FISK.id);
  assert.equal(r.kalla, 'kontot');
  assert.equal(r.landningssida, undefined);
  assert.equal(r.butiksord_extra, undefined);
});

test('ordningen är oförändrad: products.json, kontot, alias, annars ingen kampanj', () => {
  const konfig = { enginecover: { id: 'motorholjet', campaign_ids: ['K1'] } };
  assert.equal(kampanjForPrefix('enginecover', { konfig, karta: { enginecover: FISK } }).kalla, 'products.json');
  const al = { beltgrinder: { kampanj_id: 'B1', kampanj_namn: 'Bälteslipmaskinen' } };
  const r = kampanjForPrefix('beltgrinder', { alias: al });
  assert.deepEqual(r.kampanj, { id: 'B1', name: 'Bälteslipmaskinen', status: null });
  assert.equal(r.landningssida, undefined);
  assert.deepEqual(kampanjForPrefix('okand', {}), { p: null, kampanj: null, kalla: null });
});

test('repots prefix-alias.json: TackleBayRod_ är alias till Fiskespöhållaren, inte blockerat', () => {
  const fil = JSON.parse(readFileSync(new URL('../../products/prefix-alias.json', import.meta.url), 'utf8'));
  const a = fil.alias?.tacklebayrod;
  assert.ok(a, 'alias.tacklebayrod ska finnas');
  assert.equal(a.kampanj_id, '120249850522830291');
  assert.equal(a.landningssida, LANDNING);
  assert.ok(a.butiksord_extra.includes('TackleBay') && a.butiksord_extra.includes('tacklebay.se'));
  assert.ok(lankTillaten(a.landningssida), 'aliasets länk ska klara domänspärren');
  assert.equal(typeof fil.blockerade, 'object', 'mekanismen ska finnas kvar');
  assert.equal(fil.blockerade.tacklebayrod, undefined, 'TackleBayRod_ får inte längre vara blockerat');
});

test('lankTillaten: bara baverbutiken.se och www.baverbutiken.se', () => {
  assert.ok(lankTillaten(LANDNING));
  assert.ok(lankTillaten('https://www.baverbutiken.se/products/x?variant=1'));
  assert.ok(!lankTillaten('https://tacklebay.se/products/fiskespohallare-4-pack'));
  assert.ok(!lankTillaten('https://carashell.se/products/takskyddet'));
  assert.ok(!lankTillaten('https://baverbutiken.se.evil.com/products/x'));
  assert.ok(!lankTillaten('https://shop.baverbutiken.se/products/x'));
  assert.ok(!lankTillaten('ftp://baverbutiken.se/x'));
  assert.ok(!lankTillaten('baverbutiken.se/products/x'));
  assert.ok(!lankTillaten(null));
});

test('valjLank: aliasets länk används när --lank saknas', () => {
  assert.deepEqual(valjLank({ namn: 'TackleBayRod_PD_42_H1', alias }), { lank: LANDNING, kalla: 'prefix-alias.json' });
});

test('valjLank: en annan --lank än aliasets ger fel med båda länkarna', () => {
  const r = valjLank({ namn: 'TackleBayRod_PD_42_H1', lank: 'https://tacklebay.se/products/fiskespohallare-4-pack', alias });
  assert.equal(r.lank, null);
  assert.match(r.fel, /tacklebay\.se/);
  assert.ok(r.fel.includes(LANDNING));
});

test('valjLank: samma sida med www eller frågesträng godtas', () => {
  const lank = 'https://www.baverbutiken.se/products/fiskespohallare-4-pack-kraftig-forvaring/?utm=x';
  assert.ok(sammaSida(lank, LANDNING));
  assert.deepEqual(valjLank({ namn: 'TackleBayRod_SO_9_H1', lank, alias }), { lank, kalla: '--lank' });
});

test('valjLank: prefix utan alias får --lank som den är', () => {
  assert.deepEqual(valjLank({ namn: 'Rodholder_PD_11_H1', lank: 'https://baverbutiken.se/x', alias }), { lank: 'https://baverbutiken.se/x', kalla: '--lank' });
  assert.deepEqual(valjLank({ namn: 'Rodholder_PD_11_H1', alias }), { lank: null, kalla: null });
});
