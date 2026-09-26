// MER per verksamhet på Översikt (2026-09-26, byggordningen efter Evolve, steg 1a).
//
// Tre fel som fanns före bygget och som testerna här håller borta:
//   1. "Kvar efter reklam i dag" drog ALLA SEK-konton (Norge, Finland,
//      Grillkliniken, CaraShell) från de svenska butikernas försäljning.
//   2. Delade konton matchade kampanjprefix med startsWith — CaraShells
//      "AU LISTICLE Taköverdrag CARASHELL" räknades som Bäverbutikens.
//   3. Kontots vecka var "de sju sista raderna", men Metas serie hoppar över
//      dagar utan spend — veckan kunde spänna över en månad.
// Inget nät: kurser och snapshot är fejkdata i samma form som hämtningen ger.

import test from 'node:test';
import assert from 'node:assert/strict';
import { tolkaEcb, kronorPer, hamtaKurser } from '../kallor/valuta.mjs';
import { verksamheter, merTotalt, kampanjTillhor, butikenAr, kontoLage } from '../data.mjs';
import { oversiktSida } from '../vy/oversikt.mjs';
import { sattSprak } from '../vy/delar.mjs';

const NU = new Date('2026-09-26T15:00:00Z');
const VECKAN = ['2026-09-19', '2026-09-20', '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25'];

const ECB_XML = `<?xml version="1.0" encoding="UTF-8"?>
<gesmes:Envelope><Cube><Cube time='2026-09-25'>
  <Cube currency='USD' rate='1.1403'/>
  <Cube currency='DKK' rate='7.4755'/>
  <Cube currency='SEK' rate='11.29'/>
  <Cube currency='NOK' rate='10.84'/>
</Cube></Cube></gesmes:Envelope>`;

const KURSER = { status: 'ok', datum: '2026-09-25', sekPer: { SEK: 1, NOK: 1.04, DKK: 1.51, EUR: 11.29 } };

const dagar = (per) => VECKAN.map((datum) => ({ datum, omsattning: per, ordrar: 1 }));
const spenddagar = (per) => VECKAN.map((datum) => ({ datum, spend: per, kop: 1, roas: 2 }));

function snapshot(extra = {}) {
  return {
    byggd: NU.toISOString(),
    valutakurser: KURSER,
    varumarken: [
      { id: 'bav', namn: 'Bäverbutiken', butiker: ['se', 'no', 'uk'], konton: [{ id: '1', namn: 'SE-kontot', hela: true }, { id: '2', namn: 'NO-kontot', hela: true }, { id: '9', namn: 'Delat', utom: ['CARASHELL_'] }] },
      { id: 'cs', namn: 'CaraShell', butiker: ['cs'], konton: [{ id: '9', namn: 'Delat', prefix: ['CARASHELL_'] }] },
      { id: 'grill', namn: 'Grillkliniken', butiker: [], butiker_saknas: 'inga Shopify-nycklar', konton: [{ id: '3', namn: 'Grill', hela: true }] },
      { id: 'mat', namn: 'Matstrumpor', butiker: ['1r46tp-qx'], konton: [{ id: '4', namn: 'nya kungen', hela: true }] },
    ],
    butiker: [
      { id: 'se', namn: 'SE', valuta: 'SEK', status: 'ok', dagar: dagar(10_000) },
      { id: 'no', namn: 'NO', valuta: 'NOK', status: 'ok', dagar: dagar(1_000) },
      { id: 'uk', namn: 'UK', valuta: null, status: 'av', dagar: [] },
      { id: 'cs', namn: 'CS', valuta: 'SEK', status: 'ok', dagar: dagar(5_000) },
      { id: 'matstrumpor', shop: '1r46tp-qx.myshopify.com', namn: 'Matstrumpor.se', valuta: 'SEK', status: 'ok', dagar: dagar(2_000) },
    ],
    annonskonton: [
      { id: '1', namn: 'SE-kontot', valuta: 'SEK', status: 'ok', dagar: spenddagar(3_000), kampanjer: [] },
      { id: '2', namn: 'NO-kontot', valuta: 'SEK', status: 'ok', dagar: spenddagar(500), kampanjer: [] },
      { id: '3', namn: 'Grill', valuta: 'SEK', status: 'ok', dagar: spenddagar(100), kampanjer: [] },
      {
        id: '9', namn: 'Delat', valuta: 'SEK', status: 'ok', dagar: spenddagar(9_999),
        kampanjer: [
          { namn: 'AU LISTICLE Taköverdrag CARASHELL', spend: 7_000 },
          { namn: '1 CARASHELL_US_Taköverdrag', spend: 3_000 },
          { namn: 'BAVER_UK_något', spend: 700 },
        ],
      },
    ],
    ...extra,
  };
}

const hitta = (rader, id) => rader.find((r) => r.id === id);

test('ECB:s XML ger kronor per valuta, och ett orimligt svar ger null', () => {
  const t = tolkaEcb(ECB_XML);
  assert.equal(t.datum, '2026-09-25');
  const sek = kronorPer(t.eur);
  assert.equal(sek.SEK, 1);
  assert.equal(sek.EUR, 11.29);
  assert.ok(Math.abs(sek.NOK - 11.29 / 10.84) < 1e-5);
  assert.equal(tolkaEcb(ECB_XML.replace("rate='11.29'", "rate='0.5'")), null, 'kronan kan inte vara värd två euro');
  assert.equal(tolkaEcb('<html>fel</html>'), null);
});

test('hamtaKurser kastar aldrig — ett nätfel blir status fel med orsak', async () => {
  const r = await hamtaKurser({ fetchFn: async () => { throw new Error('nere'); } });
  assert.equal(r.status, 'fel');
  assert.match(r.orsak, /nere/);
  const ok = await hamtaKurser({ fetchFn: async () => ({ ok: true, text: async () => ECB_XML }), nu: NU });
  assert.equal(ok.status, 'ok');
  assert.equal(ok.datum, '2026-09-25');
});

test('kampanjTillhor matchar prefixet som ord i namnet, inte bara som början', () => {
  const cs = { prefix: ['CARASHELL_'] };
  const resten = { utom: ['CARASHELL_'] };
  assert.equal(kampanjTillhor(cs, 'AU LISTICLE Taköverdrag CARASHELL'), true);
  assert.equal(kampanjTillhor(cs, '1 CARASHELL_US_Taköverdrag'), true);
  assert.equal(kampanjTillhor(resten, 'AU LISTICLE Taköverdrag CARASHELL'), false);
  assert.equal(kampanjTillhor(resten, 'BAVER_UK_något'), true);
});

test('butikenAr känner igen butiken på myshopify-namnet när id:na skiljer', () => {
  assert.equal(butikenAr('1r46tp-qx', { id: 'matstrumpor', shop: '1r46tp-qx.myshopify.com' }), true);
  assert.equal(butikenAr('se', { id: 'se' }), true);
  assert.equal(butikenAr('se', { id: 'no', shop: 'se-annan.myshopify.com' }), false);
});

test('kontoLage: veckan väljs på datum — en gammal rad räknas inte för att serien har luckor', () => {
  const k = kontoLage({ id: 'x', dagar: [{ datum: '2026-08-31', spend: 9_000, kop: 9, roas: 1 }, { datum: '2026-09-24', spend: 100, kop: 1, roas: 2 }, { datum: '2026-09-25', spend: 200, kop: 1, roas: 2 }] }, { nu: NU });
  assert.equal(k.vecka.spend, 300);
  assert.equal(k.igar.spend, 200);
});

test('MER per verksamhet: varje konto mot sina egna butiker, NOK omräknat, CaraShell ur det delade kontot', () => {
  const r = verksamheter(snapshot(), { nu: NU });
  const bav = hitta(r, 'bav');
  // SE 70 000 kr + NO 7 000 NOK × 1,04 = 77 280 kr. UK är avstängd med flit och saknas inte.
  assert.equal(Math.round(bav.forsaljning), 77_280);
  // SE 21 000 + NO 3 500 + bara BAVER-kampanjen i det delade kontot (700) = 25 200 kr.
  assert.equal(Math.round(bav.reklam), 25_200);
  assert.ok(Math.abs(bav.mer - 77_280 / 25_200) < 1e-9);
  assert.equal(bav.komplett, true);
  assert.equal(bav.merForra, null, 'delat konto har bara 7 dagar — veckan innan går inte att räkna');

  const cs = hitta(r, 'cs');
  assert.equal(cs.reklam, 10_000, 'båda CaraShell-kampanjerna, även den som inte börjar på CARASHELL_');
  assert.equal(cs.mer, 35_000 / 10_000);
});

test('En verksamhet som saknar butik eller konto får ingen MER — orsaken följer med, aldrig en nolla', () => {
  const r = verksamheter(snapshot(), { nu: NU });
  const grill = hitta(r, 'grill');
  assert.equal(grill.forsaljning, null);
  assert.equal(grill.mer, null);
  assert.match(grill.saknas.map((s) => s.orsak).join(), /inga Shopify-nycklar/);

  const mat = hitta(r, 'mat');
  assert.equal(mat.forsaljning, 14_000, 'butiken hittas via myshopify-namnet');
  assert.equal(mat.reklam, null, 'kontot saknas i hämtningen ⇒ ingen reklamsumma');
  assert.equal(mat.mer, null);
  assert.match(mat.saknas.map((s) => s.vad).join(), /nya kungen/);
});

test('Utan växelkurs räknas ingen MER där en annan valuta ingår', () => {
  const r = verksamheter(snapshot({ valutakurser: { status: 'fel', orsak: 'ECB gick inte att nå' } }), { nu: NU });
  const bav = hitta(r, 'bav');
  assert.equal(bav.mer, null);
  assert.match(bav.saknas.map((s) => s.orsak).join(), /ingen växelkurs för NOK|ECB gick inte att nå/);
  assert.equal(hitta(r, 'cs').mer, 3.5, 'CaraShell är bara kronor och behöver ingen kurs');
});

test('merTotalt räknar bara de verksamheter som gick att läsa helt, och säger vilka som saknas', () => {
  const t = merTotalt(verksamheter(snapshot(), { nu: NU }));
  assert.deepEqual(t.med.map((v) => v.id).sort(), ['bav', 'cs']);
  assert.deepEqual(t.utan.map((v) => v.id).sort(), ['grill', 'mat']);
  assert.ok(Math.abs(t.mer - (77_280 + 35_000) / (25_200 + 10_000)) < 1e-6);
});

test('Översikt visar MER per verksamhet för ägaren, och det gamla felaktiga kortet är borta', () => {
  sattSprak('sv');
  const html = oversiktSida({ snapshot: snapshot(), anvandare: { roll: 'agare', namn: 'Axel' }, nu: NU }).innehall;
  assert.match(html, /Försäljning mot reklam, per verksamhet/);
  assert.match(html, /MER 7 dagar/);
  assert.match(html, /ECB:s kurs den 25 sep/);
  assert.match(html, /1 NOK = 1,04 kr/);
  assert.match(html, /Räknat på (Bäverbutiken och CaraShell|CaraShell och Bäverbutiken)\. Saknas: (Grillkliniken och Matstrumpor|Matstrumpor och Grillkliniken)\./);
  assert.doesNotMatch(html, /Kvar efter reklam i dag/);
});

test('Redigerare och VA ser aldrig MER-tabellen', () => {
  sattSprak('sv');
  for (const roll of ['redigerare', 'va', 'support_chef', 'produkttest']) {
    const html = oversiktSida({ snapshot: snapshot(), anvandare: { roll, namn: 'X' }, nu: NU }).innehall;
    assert.doesNotMatch(html, /per verksamhet|MER 7 dagar/, roll);
  }
});
