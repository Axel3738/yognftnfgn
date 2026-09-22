// Autosvaret på sajten: Kundtjänst-sidan, varumärkets flik och "Kräver dig i dag".
//
// Axels beställning 2026-09-22: "alla cases som AI-botten har svarat på, där
// det är arga kunder, ska komma upp som en lista på kundtjänst-taben". Och
// hans osäkerhet samma kväll — "jag vet inte om den är aktiv och faktiskt
// skickar mail" — ska sidan svara på i klartext: utkast är inte skickat.
// Ingen snapshot krävs, inget nät: allt är fejkdata i samma form som
// kundtjanst/dashboard.mjs samlaAutosvar ger.

import test from 'node:test';
import assert from 'node:assert/strict';
import { kundtjanstSida, autosvarBlock, autosvarLage, butiksnamnFor } from '../vy/drift.mjs';
import { brandData } from '../vy/varumarke.mjs';
import { oversiktSida } from '../vy/oversikt.mjs';
import { sattSprak } from '../vy/delar.mjs';

const NU = new Date('2026-09-22T18:00:00Z');

const ARG_UTKAST = {
  tid: '2026-09-22T00:04:00.000Z', uid: 7, hink: 'ARG', typ: null, kategori: 'skadad_defekt', ordernummer: ['6600'], kund: 'mo***@gmail.com', sprak: 'sv',
  amne: 'Trasig vara', kontaktformular: false, atgard: 'utkast', torr: true, flaggad: true, flyttad: 'INBOX.VA-PRIO', orsak: 'kvalitet', orsakEn: 'product quality', x: 'kvalitet', lage: false, retur: false, opostadDagar: null,
};
const ARG_SKICKAT = {
  tid: '2026-09-20T10:00:00.000Z', uid: 3, hink: 'ARG', typ: null, kategori: 'fel_vara', ordernummer: [], kund: 'to***@gmail.com', sprak: 'sv',
  amne: 'Ser inte ut som på bilden', kontaktformular: false, atgard: 'svar', torr: false, flaggad: true, flyttad: 'INBOX.VA-PRIO', orsak: 'som på bilden', orsakEn: 'not as pictured', x: 'som_pa_bilden', lage: false, retur: false, opostadDagar: null,
};

function autosvar({ arga = [ARG_UTKAST], svar = 0, utkast = 1, senaste = '2026-09-22T08:15:52.572Z', brand = 'baverbutiken' } = {}) {
  return {
    dagar: 30, hamtad: NU.toISOString(), etiketter: { x: {}, typ: {} },
    brands: {
      [brand]: {
        brand, period: { fran: '2026-08-23T18:00:00.000Z', till: NU.toISOString(), dagar: 30 },
        senasteKorning: senaste, antalKorningar: 5,
        antal: { mejl: 102, arenden: 71, ENKEL: 6, ARG: arga.length, 'SVÅR': 63, SKIP: 31, svar, utkast, flaggade: 66, tillVa: 64, fel: 0, kontaktformular: 12 },
        perTyp: {}, perKategori: {}, perSprak: {}, perAtgard: {}, perDag: [],
        arga, svarade: [], tillVa: [], fel: [], brevlada: null,
      },
    },
  };
}

const SNAPSHOT = {
  byggd: NU.toISOString(),
  butiker: [{ id: 'baverbutiken', namn: 'Bäverbutiken', valuta: 'SEK', status: 'ok', dagar: [], ordrar: 0 }],
  kundtjanst: { status: 'saknas', orsak: 'ingen veckorapport i testet', brands: [] },
  oppnaTvister: [],
  rutiner: { rutiner: [], summering: null },
  eskalering: { kanaler: [] },
  varumarken: [{ id: 'baverbutiken', namn: 'Bäverbutiken' }],
  autosvar: autosvar(),
};

test('Kundtjänst-sidan visar autosvaret även utan veckorapport: läget i klartext och listan med arga kunder', () => {
  sattSprak('sv');
  const html = kundtjanstSida({ snapshot: SNAPSHOT, nu: NU }).innehall;
  assert.match(html, /Autosvaret/);
  assert.match(html, /bara utkast — inget skickas/, 'noll skickade + utkast ⇒ boten är inte igång, och det står');
  assert.match(html, /102 mejl lästa på 30 dagar/);
  assert.match(html, /Arga kunder/);
  assert.match(html, /#6600/);
  assert.match(html, /utkast — inte skickat/);
  assert.match(html, /INBOX\.VA-PRIO/);
  assert.match(html, /kvalitet/);
  assert.doesNotMatch(html, /mo\*\*\*@gmail\.com/, 'kundens adress visas inte — ordernumret är nyckeln');
  assert.match(html, /Ingen veckorapport än/, 'veckorapportens tomrad står kvar under');
});

test('en bot som skickat riktiga svar får grönt — och står stilla efter ett dygn utan körning', () => {
  const skarpt = autosvar({ arga: [ARG_SKICKAT], svar: 4, utkast: 0, senaste: '2026-09-22T17:00:00.000Z' }).brands.baverbutiken;
  assert.deepEqual(autosvarLage(skarpt, NU), { ton: 'bra', ord: 'skickar svar', skarpt: true, stilla: false });
  const stilla = autosvar({ arga: [ARG_SKICKAT], svar: 4, utkast: 0, senaste: '2026-09-20T17:00:00.000Z' }).brands.baverbutiken;
  assert.equal(autosvarLage(stilla, NU).ord, 'skickar svar — men stod stilla senaste dygnet');
  assert.equal(autosvarLage({ antal: { svar: 0, utkast: 0 }, senasteKorning: null }, NU).ord, 'inget svar skrivet');
});

test('ingen logg ⇒ "har inte kört", aldrig noll — och blocket finns ändå', () => {
  sattSprak('sv');
  assert.match(autosvarBlock(null, { nu: NU }), /Autosvaret har inte kört/);
  assert.match(autosvarBlock({ dagar: 30, brands: {} }, { nu: NU }), /inte igång för någon butik/);
  assert.match(autosvarBlock(autosvar(), { nu: NU, bara: ['carashell'] }), /inte igång här/, 'varumärket utan egen logg får sin egen tomrad');
});

test('engelska för VA:n: etiketterna byts, datan (order, orsak på engelska) står kvar', () => {
  sattSprak('en');
  const html = autosvarBlock(autosvar(), { nu: NU, namnFor: () => 'Bäverbutiken' });
  assert.match(html, /Auto-reply bot/);
  assert.match(html, /drafts only — nothing is sent/);
  assert.match(html, /102 emails read in 30 days/);
  assert.match(html, /product quality/, 'orsaken på engelska när sidan är engelsk');
  assert.match(html, /draft — not sent/);
  assert.match(html, /Angry customers/);
  sattSprak('sv');
});

test('varumärkets flik får bara sina egna butiker ur loggen', () => {
  const snap = { ...SNAPSHOT, autosvar: { ...autosvar(), brands: { ...autosvar().brands, ...autosvar({ brand: 'carashell', arga: [] }).brands } } };
  const bav = brandData({ id: 'baverbutiken', namn: 'Bäverbutiken', butiker: ['baverbutiken'], konton: [], kundtjanst: [], leverans: [] }, snap, { nu: NU });
  assert.deepEqual(Object.keys(bav.autosvar.brands), ['baverbutiken']);
  assert.equal(bav.butiksnamn('baverbutiken'), 'Bäverbutiken');
  const cs = brandData({ id: 'carashell', namn: 'CaraShell', butiker: [], konton: [], kundtjanst: [], leverans: [] }, snap, { nu: NU });
  assert.deepEqual(Object.keys(cs.autosvar.brands), ['carashell']);
  const ops = brandData({ id: 'ops', namn: 'Övriga', butiker: [], konton: [], kundtjanst: [], leverans: [] }, snap, { nu: NU });
  assert.deepEqual(Object.keys(ops.autosvar.brands), [], 'huvudbrandens loggar hamnar aldrig under övriga OPS');
});

test('"Kräver dig i dag" tar upp arga kunder från det senaste dygnet — inte äldre', () => {
  sattSprak('sv');
  const snap = { ...SNAPSHOT, autosvar: autosvar({ arga: [ARG_UTKAST, ARG_SKICKAT] }) };
  const html = oversiktSida({ snapshot: snap, anvandare: { roll: 'agare', namn: 'Axel' }, nu: NU }).innehall;
  assert.match(html, /Arg kund #6600 \(Bäverbutiken\) — autosvaret la ett lugnande utkast, VA:n tar över/);
  assert.doesNotMatch(html, /Arg kund utan ordernummer/, 'den två dagar gamla står inte i dagens lista');
});

test('butiksnamnFor: snapshotens namn först, annars id:t som det är', () => {
  assert.equal(butiksnamnFor(SNAPSHOT, 'baverbutiken'), 'Bäverbutiken');
  assert.equal(butiksnamnFor(SNAPSHOT, 'okand'), 'okand');
});
