// klaviyo/spoks/cowork-schema.mjs: Cowork-prompten som schemalägger kampanjutkasten i
// Spoks-appen (Axels beställning 2026-09-29: "Skriv cowork prompt för att schemalägga allt").
// Listan ska komma ur innehållsfilerna och loggen, så tid, publik och länk aldrig skrivs för
// hand. Inget nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lokalTid, schemaRader, segmentNamn, promptText, jamfor, SPOKS_EGNA } from '../spoks/cowork-schema.mjs';

const kampanj = (id, planerad, segment, extra = {}) => ({ id, planerad, segment, amnesrader: [{ text: `Ämne ${id}` }], status_plan: 'kraver-axel', ...extra });
const KAMPANJER = [
  kampanj('k01-forsta', '2026-09-29T18:00:00+02:00', ['SEG_samtycke']),
  kampanj('v01-klubben', '2026-09-30T18:00:00+02:00', ['SEG_samtycke']),
  kampanj('fd18-i-morgon', '2026-10-23T09:00:00+02:00', ['SEG_samtycke']),
  kampanj('fd20-dagen-efter', '2026-10-25T18:00:00+01:00', ['SEG_samtycke']),
  kampanj('fd02-banken', '2026-10-01T18:00:00+02:00', ['SEG_samtycke'], { status_plan: 'parkerad' }),
  kampanj('k05-jul', '2026-10-27T18:00:00+01:00', ['SEG_kopare_forra_sasongen']),
];
const SPOKS = new Map([['k01-forsta', 'p-k01'], ['v01-klubben', 'p-v01'], ['fd18-i-morgon', 'p-fd18'], ['fd20-dagen-efter', 'p-fd20'], ['fd02-banken', 'p-fd02'], ['k05-jul', 'p-k05']]);
const ARBETSYTA = { namn: 'Matstrumpor.se', app: 'https://app.spoks.com/matstrumpor', lankar: { kampanj: 'https://app.spoks.com/matstrumpor/post/{postId}/edit', kampanjer: 'https://app.spoks.com/matstrumpor/campaigns' } };

test('lokalTid: svensk tid och zonen som Spoks pill visar, sommartiden slutar 25/10', () => {
  const sommar = lokalTid('2026-10-24T20:00:00+02:00');
  assert.equal(sommar.dag, 'lör 24/10');
  assert.equal(sommar.tid, '20:00');
  assert.equal(sommar.zonText, 'CEST (UTC+2)');
  assert.equal(sommar.pill, '24.10');
  assert.equal(sommar.utc, '2026-10-24T18:00:00.000Z');
  const vinter = lokalTid('2026-10-25T18:00:00+01:00');
  assert.equal(vinter.dag, 'sön 25/10');
  assert.equal(vinter.tid, '18:00');
  assert.equal(vinter.zonText, 'CET (UTC+1)');
  assert.equal(vinter.utc, '2026-10-25T17:00:00.000Z');
  // Fel offset i källfilen syns: 18:00+02:00 den 25/10 är 17:00 svensk tid.
  assert.equal(lokalTid('2026-10-25T18:00:00+02:00').tid, '17:00');
  assert.equal(lokalTid('inte ett datum'), null);
});

test('schemaRader: från ett datum, i utskicksordning, aldrig bänken eller det som redan gått', () => {
  const { rader, fel } = schemaRader({ kampanjer: KAMPANJER, spoks: SPOKS, fran: '2026-09-30' });
  assert.deepEqual(rader.map((r) => r.kod), ['V01', 'FD18', 'FD20', 'K05']);
  assert.deepEqual(fel, []);
  assert.equal(rader[0].postId, 'p-v01');
  assert.equal(rader[0].segment, 'SEG_samtycke');
  assert.equal(rader[0].amne, 'Ämne v01-klubben');
  assert.equal(rader[1].tid, '09:00');
});

test('schemaRader: --bara tar koderna oavsett datum, och säger till om bänken, saknat utkast och okänd kod', () => {
  const { rader, fel } = schemaRader({ kampanjer: KAMPANJER, spoks: new Map([...SPOKS].filter(([k]) => k !== 'k05-jul')), bara: ['v01', 'FD02', 'K05', 'V09'] });
  assert.deepEqual(rader.map((r) => r.kod), ['V01']);
  assert.equal(fel.length, 3);
  assert.match(fel.join('\n'), /FD02: står på bänken/);
  assert.match(fel.join('\n'), /K05: inget Spoks-utkast/);
  assert.match(fel.join('\n'), /V09: finns inte/);
});

test('schemaRader: ett mejl utan exakt ett segment stoppas', () => {
  const tva = [kampanj('v02-tva', '2026-10-03T18:00:00+02:00', ['SEG_samtycke', 'SEG_kopare'])];
  const { rader, fel } = schemaRader({ kampanjer: tva, spoks: new Map([['v02-tva', 'p']]), fran: '2026-09-30' });
  assert.equal(rader.length, 0);
  assert.match(fel[0], /V02: 2 segment/);
});

test('promptText: länk, publik och tid per mejl, förväxlingsbara segment, aldrig "skicka nu", båda zonerna', () => {
  const { rader } = schemaRader({ kampanjer: KAMPANJER, spoks: SPOKS, fran: '2026-09-30' });
  const logg = ['{"typ":"segment","namn":"SEG_samtycke"}', '{"typ":"segment","namn":"SEG_engagerade_90d"}', 'trasig rad', '{"typ":"kampanj","mejl_id":"x"}'].join('\n');
  assert.deepEqual(segmentNamn(logg), ['SEG_samtycke', 'SEG_engagerade_90d']);
  const text = promptText({ brand: { namn: 'Matstrumpor' }, arbetsyta: ARBETSYTA, rader, lankMall: ARBETSYTA.lankar.kampanj, andraSegment: segmentNamn(logg), aldrig: ['K01', 'K15'] });
  assert.match(text, /schemalägger 4 färdiga mejl/);
  assert.match(text, /https:\/\/app\.spoks\.com\/matstrumpor\/post\/p-fd18\/edit/);
  assert.match(text, /FD18 {2}fre 23\/10 kl 09:00/);
  assert.match(text, /Till: SEG_kopare_forra_sasongen/);
  assert.match(text, /CEST \(UTC\+2\)/);
  assert.match(text, /CET \(UTC\+1\)/);
  assert.match(text, /Särskilt inte K01, K15/);
  assert.match(text, /Skicka aldrig något direkt/);
  // Mätt 2026-09-29: Cowork fick en vit sida, Spoks ritar inte i en dold flik.
  assert.match(text, /INNAN DU BÖRJAR/);
  assert.match(text, /Är sidan helt vit, nu eller mitt i arbetet/);
  assert.match(text, /klicka en gång på Chrome-fönstrets översta kant/);
  assert.match(text, /Hamnar du på Spoks startsida/);
  // Mätt samma kväll: varje rapport mitt i körningen lade ett annat fönster över Spoks.
  assert.match(text, /Skriv inte till mig mellan mejlen/);
  // Mätt 2026-09-29: granskningssidan, Smart sending av och mottagare > 0 är obligatoriska steg,
  // och notify false på ett schemalagt mejl är normalt (får inte stoppa Cowork).
  assert.match(text, /rutan "Smart sending" är tom/);
  assert.match(text, /"Planera" \(på engelska "Schedule"\) längst ner på granskningssidan/);
  assert.match(text, /notify false och 0 mottagare är normalt på ett schemalagt mejl/);
  assert.ok(!/notify ska vara true/.test(text));
  // Förväxlingslistan: arbetsytans andra segment och Spoks egna, aldrig ett segment listan använder.
  const aldrigRad = text.split('\n').find((r) => r.startsWith('Det finns segment med nästan samma namn'));
  assert.match(aldrigRad, /SEG_engagerade_90d/);
  for (const s of SPOKS_EGNA) assert.ok(aldrigRad.includes(s), s);
  assert.ok(!aldrigRad.includes('SEG_samtycke'));
  // Inga tankstreck i det Axel klistrar in (copy-reglerna gäller även prompten).
  assert.ok(!/[–—]/.test(text));
});

test('jamfor: schemalagd med rätt tid är ok även med notify false; publicerad kräver utskick', () => {
  const { rader } = schemaRader({ kampanjer: KAMPANJER, spoks: SPOKS, fran: '2026-09-30' });
  // Så såg V01 ut 2026-09-29 20:4x och CaraShells K01 NB före 18:00: schemalagd, notify false, 0.
  const svar = { campaigns: [
    { id: 'p-v01', status: 'waiting_to_be_published', publishDate: '2026-09-30T16:00:00.000Z', notify: false, notificationRecipientsCount: 0 },
    { id: 'p-fd18', status: 'published', publishDate: '2026-10-23T07:00:00Z', notify: false, notificationRecipientsCount: 0 },
    { id: 'p-fd20', status: 'draft', publishDate: null, notify: false },
  ] };
  const ut = jamfor(rader, svar);
  assert.deepEqual(ut.map((r) => [r.kod, r.ok]), [['V01', true], ['FD18', false], ['FD20', false], ['K05', false]]);
  assert.deepEqual(ut[1].fel, ['publicerad utan utskick (notify false)', 'publicerad till 0 mottagare']);
  assert.deepEqual(ut[2].fel, ['status draft', 'tid saknas, facit 2026-10-25T17:00:00.000Z']);
  assert.deepEqual(ut[3].fel, ['finns inte i svaret']);
});
