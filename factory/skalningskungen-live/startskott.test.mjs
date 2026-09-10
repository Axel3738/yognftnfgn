// Tester för startskottet (agent/startskott.mjs).
// Inget nätverk, inga filskrivningar, inget klockberoende — datum skickas in.
// `--torr` används överallt så ingen test någonsin postar i Discord.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  STARTSKOTT_KOD,
  KANAL,
  KRAVDA_FALT,
  PROVLARM,
  startskottHarGatt,
  saknadeFalt,
  formateraStartskott,
  byggLoggrad,
  skickaStartskott,
} from '../startskott.mjs';

/** Ett komplett jobb. Talen är påhittade EXEMPEL — de finns bara i testet. */
const jobb = () => ({
  produkt: 'Bänkhyllan med Utdragbar Korg',
  kampanj_id: '120250134706080291',
  kalla_url: 'https://baverbutiken.se/products/bankhyllan-med-utdragbar-korg',
  spend_total: 4231.5,
  kop: 27,
  cpa: 156.7,
  break_even_cpa: 210,
  roas: 2.41,
  vinst_procent: 24.3,
});

test('saknadeFalt: ett komplett jobb saknar ingenting', () => {
  assert.deepEqual(saknadeFalt(jobb()), []);
});

test('saknadeFalt: noll är ett tal, inte ett saknat fält', () => {
  assert.deepEqual(saknadeFalt({ ...jobb(), kop: 0 }), []);
});

test('saknadeFalt: null, tom sträng och NaN räknas som saknade', () => {
  const j = { ...jobb(), cpa: null, produkt: '', roas: Number.NaN };
  assert.deepEqual(saknadeFalt(j).sort(), ['cpa', 'produkt', 'roas']);
});

test('saknadeFalt: utan jobb saknas allt', () => {
  assert.deepEqual(saknadeFalt(undefined), KRAVDA_FALT);
  assert.deepEqual(saknadeFalt(null), KRAVDA_FALT);
});

test('formateraStartskott vägrar när ett tal saknas', () => {
  const j = jobb();
  delete j.vinst_procent;
  assert.throws(() => formateraStartskott(j), /saknade fält.*vinst_procent/);
});

test('rubriken bär produktnamnet och INGA asterisker — discord-post fetstilar själv', () => {
  const { rubrik } = formateraStartskott(jobb());
  assert.equal(rubrik, 'KLAR FÖR OPS: Bänkhyllan med Utdragbar Korg');
  assert.ok(!rubrik.includes('*'), 'rubriken skulle bli **dubbelfetad** i Discord');
});

test('texten visar alla fem beslutstalen', () => {
  const { text } = formateraStartskott(jobb());
  // ⚠️ toLocaleString('sv-SE') separerar tusental med HÅRT mellanslag (U+00A0).
  // Ett testregex med vanligt blanksteg faller på en sträng som ser identisk
  // ut i terminalen. \s täcker båda.
  assert.match(text, /Spend: 4\s232 kr/);
  assert.match(text, /Köp: 27/);
  assert.match(text, /CPA: 157 kr \(break-even 210 kr\)/);
  assert.match(text, /ROAS: 2,41/);            // komma, inte punkt
  assert.match(text, /Vinst: 24,3 % av omsättningen/);
});

test('texten följer Axels svarsformat', () => {
  const { text } = formateraStartskott(jobb());
  assert.match(text, /Du ska göra 1 sak\./);
  assert.match(text, /Sen är du klar\. Jag har gjort resten\./);

  // En mening per rad. Kodblocket räknas inte — /ny-ops-raden klistras in,
  // den läses inte.
  const instruktion = text.split('Du ska göra 1 sak.')[1];
  let iKodblock = false;
  for (const rad of instruktion.split('\n')) {
    if (rad.trim() === '```') { iKodblock = !iKodblock; continue; }
    if (iKodblock) continue;
    assert.ok(rad.length <= 60, `för lång rad i instruktionen: ${rad}`);
  }
});

test('kommandoraden ligger i ett kodblock så den går att kopiera rent', () => {
  const rader = formateraStartskott(jobb()).text.split('\n');
  const i = rader.findIndex((r) => r.startsWith('/ny-ops '));
  assert.ok(i > 0, 'ingen /ny-ops-rad hittades');
  assert.equal(rader[i - 1].trim(), '```');
  assert.equal(rader[i + 1].trim(), '```');
});

test('startskottHarGatt: tom logg betyder att det inte gått', () => {
  assert.equal(startskottHarGatt([], '120250134706080291'), false);
  assert.equal(startskottHarGatt(undefined, '120250134706080291'), false);
});

test('startskottHarGatt: en genomförd rad räknas', () => {
  const logg = [{ kampanj_id: '120250134706080291', kod: STARTSKOTT_KOD, genomford: true }];
  assert.equal(startskottHarGatt(logg, '120250134706080291'), true);
});

test('startskottHarGatt: en ogenomförd rad räknas INTE — annars tystas ett larm som aldrig gick ut', () => {
  const logg = [{ kampanj_id: '120250134706080291', kod: STARTSKOTT_KOD, genomford: false }];
  assert.equal(startskottHarGatt(logg, '120250134706080291'), false);
});

test('startskottHarGatt: en annan kampanjs rad smittar inte', () => {
  const logg = [{ kampanj_id: 'ANNAN', kod: STARTSKOTT_KOD, genomford: true }];
  assert.equal(startskottHarGatt(logg, '120250134706080291'), false);
});

test('startskottHarGatt: en annan kod räknas inte', () => {
  const logg = [{ kampanj_id: '120250134706080291', kod: 'SKALA', genomford: true }];
  assert.equal(startskottHarGatt(logg, '120250134706080291'), false);
});

test('byggLoggrad kräver ett datum — skriptet läser aldrig klockan själv', () => {
  assert.throws(() => byggLoggrad(jobb()), /kräver ett datum/);
});

test('byggLoggrad ger en rad som startskottHarGatt känner igen', () => {
  const rad = byggLoggrad(jobb(), { datum: '2026-09-10' });
  assert.equal(rad.kod, STARTSKOTT_KOD);
  assert.equal(rad.genomford, true);
  assert.equal(rad.ad_account_id, '1867947880635861');
  assert.equal(startskottHarGatt([rad], jobb().kampanj_id), true);
});

test('byggLoggrad bär ALDRIG ny_budget — annars fryser kadensspärren kampanjen', () => {
  const rad = byggLoggrad(jobb(), { datum: '2026-09-10' });
  assert.ok(!('ny_budget' in rad), 'ny_budget gör startskottet till en budgetändring');
});

test('byggLoggrad är idempotent: samma jobb och datum ger identisk rad', () => {
  assert.deepEqual(
    byggLoggrad(jobb(), { datum: '2026-09-10' }),
    byggLoggrad(jobb(), { datum: '2026-09-10' }),
  );
});

test('byggLoggrad bär källänken vidare så nästa session slipper leta', () => {
  assert.equal(byggLoggrad(jobb(), { datum: '2026-09-10' }).kalla_url, jobb().kalla_url);
});

test('byggLoggrad vägrar på ofullständigt jobb', () => {
  const j = jobb();
  delete j.kalla_url;
  assert.throws(() => byggLoggrad(j, { datum: '2026-09-10' }), /saknade fält.*kalla_url/);
});

test('skickaStartskott --torr rör aldrig nätverket', async () => {
  const utfall = await skickaStartskott(jobb(), { torr: true });
  assert.equal(utfall.skickat, false);
  assert.equal(utfall.kanal, KANAL);
  assert.match(utfall.rubrik, /^KLAR FÖR OPS: /);
});

test('provlarmet är komplett och märkt som test', async () => {
  assert.deepEqual(saknadeFalt(PROVLARM), []);
  assert.match(PROVLARM.produkt, /TEST/);
  const utfall = await skickaStartskott(PROVLARM, { torr: true });
  assert.equal(utfall.skickat, false);
  assert.match(utfall.text, /Spend: 1\s500 kr/);
  assert.match(utfall.text, /ROAS: 3,20/);
  assert.match(utfall.text, /Vinst: 25,0 % av omsättningen/);
});

test('kanalen är ops-startskott', () => {
  assert.equal(KANAL, 'ops-startskott');
});
