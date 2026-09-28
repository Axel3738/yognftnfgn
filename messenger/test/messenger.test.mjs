// Messenger-svararen utan nät: lägesläsningen, spärrarna och svaren.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lage, somMejl, minneUr, dela, somChatt, dmOrderText } from '../bedom.mjs';
import { bedomEtt } from '../kor.mjs';
import { upptackBrands, korkonfig } from '../../kundtjanst/brands.mjs';

const SIDA = { id: '820358954504320', namn: 'Matstrumpor.se' };
const NU = new Date('2026-09-28T18:00:00Z');
const brand = korkonfig(upptackBrands().find((b) => b.id === 'matstrumpor'), {});
const tomtMinne = () => minneUr([]);
const konv = (msgs, id = 't_1') => ({ id, platform: 'messenger', messages: { data: msgs.map(([fran, text, tid, extra = {}], i) => ({ id: `m_${id}_${i}`, message: text, created_time: tid, from: fran === 'sida' ? { id: SIDA.id, name: 'Matstrumpor.se' } : { id: '999', name: 'Anna Svensson' }, ...extra })).reverse() } });

test('sidan skrev sist ⇒ inget väntar', () => {
  assert.equal(lage(konv([['kund', 'Hej', '2026-09-28T10:00:00Z'], ['sida', 'Hej!', '2026-09-28T11:00:00Z']]), { sidIds: [SIDA.id], nu: NU }), null);
});

test('flera obesvarade meddelanden läses ihop, senaste avgör fönstret', () => {
  const l = lage(konv([['kund', 'Hej', '2026-09-28T10:00:00Z'], ['kund', 'var är min order?', '2026-09-28T12:00:00Z']]), { sidIds: [SIDA.id], nu: NU });
  assert.equal(l.antalObesvarade, 2);
  assert.match(l.text, /Hej\nvar är min order/);
  assert.equal(l.timmarSedan, 6);
  assert.equal(l.egenDagar, null);
});

test('utan e-post i chatten kan ingen order knytas till kunden', () => {
  const m = somMejl({ text: 'Var är min order #4800?', kundId: '999', kundNamn: 'Anna', senasteTid: NU.toISOString(), senasteId: 'x' });
  assert.match(m.fran.adress, /@messenger\.invalid$/);
  assert.equal(m.harEpost, false);
  assert.equal(somMejl({ text: 'order 4800, anna@exempel.se', kundId: '1', senasteTid: NU.toISOString() }).fran.adress, 'anna@exempel.se');
});

test('WISMO utan e-post ⇒ frågar efter ordernummer + e-post, aldrig en order', async () => {
  const l = lage(konv([['kund', 'Hej! Var är mitt paket? Beställde för en vecka sedan', '2026-09-28T17:00:00Z']]), { sidIds: [SIDA.id], nu: NU });
  const shopify = { hamtaOrderPaNamn: () => { throw new Error('får inte anropas'); }, hamtaOrdrarForEmail: () => { throw new Error('får inte anropas'); } };
  const r = await bedomEtt(l, { sida: SIDA, brand, minnet: tomtMinne(), nu: NU, shopify });
  assert.equal(r.post.typ, 'dm_order');
  assert.match(r.text, /ordernumret/);
  assert.match(r.text, /e-postadressen/);
});

test('äldre än 24 h ⇒ VA:n, inget svar', async () => {
  const l = lage(konv([['kund', 'Var är mitt paket? Ingen svarar på mejlen', '2026-09-27T10:00:00Z']]), { sidIds: [SIDA.id], nu: NU });
  const r = await bedomEtt(l, { sida: SIDA, brand, minnet: tomtMinne(), nu: NU });
  assert.equal(r.text, null);
  assert.equal(r.post.atgard, 'va');
  assert.match(r.post.orsak, /24-timmarsfönster/);
});

test('sida utan butik ⇒ VA:n', async () => {
  const l = lage(konv([['kund', 'Var är mitt paket?', '2026-09-28T17:00:00Z']]), { sidIds: [SIDA.id], nu: NU });
  const r = await bedomEtt(l, { sida: SIDA, brand: null, minnet: tomtMinne(), nu: NU });
  assert.equal(r.text, null);
});

test('arg kund som inte fått svar på mejlen ⇒ lugnande svar + VA:n', async () => {
  const l = lage(konv([['kund', 'Detta är helt oacceptabelt!!! Jag har mejlat er TRE gånger och ingen svarar. Var är min beställning?', '2026-09-28T17:30:00Z']]), { sidIds: [SIDA.id], nu: NU });
  const r = await bedomEtt(l, { sida: SIDA, brand, minnet: tomtMinne(), nu: NU });
  assert.equal(r.post.hink, 'ARG', r.post.orsak);
  assert.ok(r.text);
  assert.doesNotMatch(r.text, /[—–]/);
  assert.doesNotMatch(r.text, /mejl(et)? nedan|detta mejl|this email/i);
  if (process.env.VISA) console.log('\n--- ARG ---\n' + r.text);
});

test('hot om ARN/chargeback ⇒ bara VA:n', async () => {
  const l = lage(konv([['kund', 'Jag anmäler er till ARN om jag inte får svar', '2026-09-28T17:30:00Z']]), { sidIds: [SIDA.id], nu: NU });
  const r = await bedomEtt(l, { sida: SIDA, brand, minnet: tomtMinne(), nu: NU });
  assert.equal(r.text, null);
});

test('bilaga ⇒ VA:n', async () => {
  const l = lage(konv([['kund', 'Se bilden, sockan är trasig', '2026-09-28T17:30:00Z', { attachments: { data: [{ mime_type: 'image/jpeg' }] } }]]), { sidIds: [SIDA.id], nu: NU });
  const r = await bedomEtt(l, { sida: SIDA, brand, minnet: tomtMinne(), nu: NU });
  assert.equal(r.text, null);
});

test('ett riktigt autosvar redan i konversationen ⇒ nästa meddelande till VA:n', async () => {
  const minnet = minneUr([{ atgard: 'svar', typ: 'wismo', konversation: 't_1', senasteId: 'gammal', tid: '2026-09-28T09:00:00Z' }], { nu: NU });
  const l = lage(konv([['kund', 'Var är mitt paket?', '2026-09-28T17:00:00Z']]), { sidIds: [SIDA.id], nu: NU });
  const r = await bedomEtt(l, { sida: SIDA, brand, minnet, nu: NU });
  assert.equal(r.text, null);
  assert.match(r.post.orsak, /redan fått/);
});

test('VA:n skrev för 3 dagar sedan ⇒ kunden är hennes', async () => {
  const l = lage(konv([['sida', 'Hej, vi kollar', '2026-09-25T18:00:00Z'], ['kund', 'Var är mitt paket?', '2026-09-28T17:00:00Z']]), { sidIds: [SIDA.id], nu: NU });
  const r = await bedomEtt(l, { sida: SIDA, brand, minnet: tomtMinne(), nu: NU });
  assert.equal(r.text, null);
});

test('texten delas under Metas tak på stycken', () => {
  const t = Array.from({ length: 30 }, (_, i) => `Stycke ${i} ` + 'x'.repeat(100)).join('\n\n');
  const d = dela(t, 1900);
  assert.ok(d.length > 1);
  assert.ok(d.every((x) => x.length <= 1900));
  assert.equal(d.join('\n\n'), t);
});

test('dm_order på alla språk, med signatur', () => {
  for (const s of ['sv', 'nb', 'da', 'fi', 'en']) assert.match(dmOrderText({ sprak: s, namn: 'Anna', signatur: 'X' }), /#1234[\s\S]*\n\nX$/);
  assert.equal(somChatt('Svar\n\n> citat'), 'Svar');
});
