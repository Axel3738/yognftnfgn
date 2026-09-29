// Texten Axel läser i #urgent: rubrik först, siffrorna, hans klick sist och
// numrerade, svenska, inga tankstreck. Rutiner som stannar samtidigt blir ETT
// meddelande.
import test from 'node:test';
import assert from 'node:assert/strict';
import { formulera, formuleraLost, grupperaMeddelanden } from '../text.mjs';

const NU = new Date('2026-09-27T14:00:00Z');
const larm = (typ, nyckel, extra = {}) => ({
  typ, nyckel, verksamhet: 'carashell', rubrik: `Rubrik ${nyckel}`, rader: [`Rad ett — mätt 16:00.`, 'Rad två.'], gor: ['Klick ett.', 'Klick två.'], ...extra,
});

test('formulera: rubrik med verksamhet, raderna, "Det här gör du" numrerat, två renderingar, inga tankstreck', () => {
  const { text, mrkdwn } = formulera(larm('butik', 'butik:carashell'));
  const rader = text.split('\n');
  assert.equal(rader[0], '**🚨 AKUT · CaraShell · Rubrik butik:carashell**');
  assert.equal(rader[1], 'Rad ett - mätt 16:00.');
  assert.equal(rader[3], '');
  assert.equal(rader[4], '**Det här gör du:**');
  assert.equal(rader[5], '1. Klick ett.');
  assert.equal(rader[6], '2. Klick två.');
  assert.ok(!/[—–]/.test(text) && !/[—–]/.test(mrkdwn));
  assert.equal(mrkdwn.split('\n')[0], '*🚨 AKUT · CaraShell · Rubrik butik:carashell*');
  assert.equal(mrkdwn.split('\n')[4], '*Det här gör du:*');
  assert.equal(formulera(larm('pengar', 'p', { verksamhet: null })).text.split('\n')[0], '**🚨 AKUT · Bolaget · Rubrik p**');
});

test('formuleraLost: ✅ Löst med när det larmades', () => {
  const { text } = formuleraLost({ typ: 'butik', nyckel: 'butik:carashell', verksamhet: 'carashell', rubrik: 'carashell.se svarar inte', tid: '2026-09-27T12:28:00Z' }, { nu: NU });
  assert.match(text, /^\*\*✅ Löst · CaraShell · carashell.se svarar inte\*\*\nLarmat sön 27\/9 14:28, borta sön 27\/9 16:00\. Inget mer att göra\.$/);
});

test('grupperaMeddelanden: ett meddelande per larm, men rutiner och Shopify-nycklar slås ihop; lösta sist', () => {
  const nya = [
    larm('butik', 'butik:a', { verksamhet: 'baverbutiken' }),
    larm('rutin', 'rutin:sparning-a', { verksamhet: 'baverbutiken', rubrik: 'Rutinen "A" står still' }),
    larm('rutin', 'rutin:sparning-b', { verksamhet: 'carashell', rubrik: 'Rutinen "B" står still' }),
    larm('rutin', 'rutin:sparning-c', { verksamhet: 'matstrumpor', rubrik: 'Rutinen "C" står still' }),
    larm('nyckel', 'nyckel:shopify:x'),
    larm('nyckel', 'nyckel:meta', { verksamhet: 'bolaget' }),
  ];
  const losta = [
    { typ: 'konto', nyckel: 'konto:1', verksamhet: 'baverbutiken', rubrik: 'Kontot var av', tid: '2026-09-27T10:00:00Z' },
    { typ: 'pengar', nyckel: 'pengar:x', verksamhet: 'baverbutiken', rubrik: 'händelse — ska aldrig lösas', tid: '2026-09-27T10:00:00Z' },
  ];
  const m = grupperaMeddelanden(nya, losta, { nu: NU });
  // Ordningen: de enskilda först i larmordning (butik, meta), sedan grupperna, sist de lösta.
  assert.deepEqual(m.map((x) => [x.id, x.slag, x.nycklar.length]), [['m1', 'nytt', 1], ['m2', 'nytt', 1], ['m3', 'nytt', 3], ['m4', 'nytt', 1], ['m5', 'lost', 1]]);
  assert.equal(m[1].nycklar[0], 'nyckel:meta');
  const rutiner = m.find((x) => x.nycklar.length === 3);
  assert.deepEqual(rutiner.nycklar, ['rutin:sparning-a', 'rutin:sparning-b', 'rutin:sparning-c']);
  assert.equal(rutiner.text.split('\n')[0], '**🚨 AKUT · Bolaget · 3 rutiner står still**');
  assert.equal((rutiner.text.match(/^• /gm) ?? []).length, 3, 'en rad per rutin');
  assert.equal((rutiner.text.match(/^\d\. /gm) ?? []).length, 2, 'klicken utan dubbletter');
  assert.equal(rutiner.poster.length, 3);
  const enShopify = m.find((x) => x.nycklar[0] === 'nyckel:shopify:x');
  assert.match(enShopify.text, /Rubrik nyckel:shopify:x/, 'en ensam i en grupp formuleras som vanligt');
  assert.match(m[4].text, /^\*\*✅ Löst · Bäverbutiken · Kontot var av\*\*/);
  assert.equal(m.length, 5, 'händelser får inget "löst"');
});

test('grupperaMeddelanden: flera lösta rutiner blir ett meddelande', () => {
  const losta = ['a', 'b'].map((x) => ({ typ: 'rutin', nyckel: `rutin:${x}`, verksamhet: 'baverbutiken', rubrik: `Rutinen "${x}" står still`, tid: '2026-09-27T10:00:00Z' }));
  const m = grupperaMeddelanden([], losta, { nu: NU });
  assert.equal(m.length, 1);
  assert.equal(m[0].slag, 'lost');
  assert.deepEqual(m[0].nycklar, ['rutin:a', 'rutin:b']);
  assert.match(m[0].text, /2 rutiner kör igen/);
});
