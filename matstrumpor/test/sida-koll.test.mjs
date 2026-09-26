import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bedomSida, sammanfatta, synligText, leveransLofte, antalRecensioner, arCloudflareSparr, tabell, GOLV_RECENSIONER, MAL_RECENSIONER } from '../sida-koll.mjs';
import { leveransStatistik } from '../leverans.mjs';

const KALENDER = { fars_dag_sista_bestallning: '2026-10-24', jul_sista_bestallning: '2026-12-08' };

const BRA = `<html><head><style>.x{}</style><script>var a="AI-genererad i skript räknas inte";</script></head><body>
<h1>Sushi-Strumpor</h1><span>12 recensioner</span><span>399 kr</span><span>369 kr</span>
<p>Köp 1 – Få 1 GRATIS</p><p>30 dagars öppet köp</p><p>5–10 arbetsdagar</p>
<p>Beställ senast 24 oktober så är paketet framme till fars dag.</p>
<p>80 % bomull, 17 % polyamid, 3 % elastan</p>
</body></html>`;

const DALIG = `<html><body><h1>Sushi-Strumpor</h1><span>7 recensioner</span><span>349 kr</span>
<p>Köp 2 – Få 2</p><p>Soffbilden är en AI-genererad illustration.</p><p>1,796 kr</p><p>5–10 arbetsdagar</p>
<p>Tull kan tillkomma.</p></body></html>`;

const LEVERANS_BRA = { levererade: 76, dygn: { p90: 12.1 }, arbetsdagar: { p90: 9 }, over_loftet: { andel: 4 } };
const LEVERANS_SEN = { levererade: 76, dygn: { p90: 15 }, arbetsdagar: { p90: 11 }, over_loftet: { andel: 16 } };

test('synlig text: skript och stilar räknas inte', () => {
  const t = synligText(BRA);
  assert.doesNotMatch(t, /i skript räknas inte/);
  assert.match(t, /12 recensioner/);
});

test('en sida med alla bevis är grön, utom recensionsmålet som är gult', () => {
  const rader = bedomSida({ html: BRA, idag: '2026-09-26', leverans: LEVERANS_BRA, kalender: KALENDER, priser: [399, 369] });
  const per = Object.fromEntries(rader.map((r) => [r.id, r.lage]));
  assert.equal(per.ai_bild, 'ok');
  assert.equal(per.material, 'ok');
  assert.equal(per.leveranslofte, 'ok');
  assert.equal(per.sista_dag, 'ok');
  assert.equal(per.prisformat, 'ok');
  assert.equal(per.pris, 'ok');
  assert.equal(per.erbjudande, 'ok');
  assert.equal(per.oppet_kop, 'ok');
  assert.equal(per.tull, 'ok');
  assert.equal(per.recensioner, 'varning');
  assert.equal(sammanfatta(rader).lage, 'gult');
});

test('sidan 2026-09-25 (före fixarna) faller på AI-raden, materialet, prisformatet och recensionsgolvet', () => {
  const rader = bedomSida({ html: DALIG, idag: '2026-09-26', leverans: LEVERANS_SEN, kalender: KALENDER, priser: [399, 369] });
  const per = Object.fromEntries(rader.map((r) => [r.id, r.lage]));
  assert.equal(per.ai_bild, 'fel');
  assert.equal(per.material, 'fel');
  assert.equal(per.prisformat, 'fel');
  assert.equal(per.recensioner, 'fel', `7 < golvet ${GOLV_RECENSIONER}`);
  assert.equal(per.leveranslofte, 'fel', 'p90 11 arbetsdagar mot löftet 10');
  assert.equal(per.sista_dag, 'fel', 'säsong utan Beställ senast');
  assert.equal(per.pris, 'fel', '399 kr saknas (sidan visar 349)');
  assert.equal(per.erbjudande, 'varning');
  assert.equal(per.oppet_kop, 'fel');
  assert.equal(per.tull, 'varning');
  assert.equal(sammanfatta(rader).lage, 'rott');
  assert.match(tabell(rader), /\| ai_bild \| ❌ fel \|/);
});

test('leveranslöftet: omätbart utan mätning, aldrig grönt av sig självt', () => {
  const rader = bedomSida({ html: BRA, idag: '2026-09-26', leverans: null, kalender: KALENDER, priser: null });
  const per = Object.fromEntries(rader.map((r) => [r.id, r.lage]));
  assert.equal(per.leveranslofte, 'omatbart');
  assert.equal(per.pris, 'omatbart');
  assert.equal(sammanfatta(rader).fel, 0);
});

test('sista beställningsdag krävs bara i säsong', () => {
  const utan = BRA.replace(/<p>Beställ senast[^<]*<\/p>/, '');
  const iSasong = bedomSida({ html: utan, idag: '2026-11-20', leverans: LEVERANS_BRA, kalender: KALENDER, priser: [399, 369] });
  assert.equal(iSasong.find((r) => r.id === 'sista_dag').lage, 'fel');
  const efter = bedomSida({ html: utan, idag: '2026-12-09', leverans: LEVERANS_BRA, kalender: KALENDER, priser: [399, 369] });
  assert.equal(efter.find((r) => r.id === 'sista_dag').lage, 'ok');
});

test('recensionsmålet: minst målet ⇒ grönt', () => {
  const html = BRA.replace('12 recensioner', `${MAL_RECENSIONER} recensioner`);
  const r = bedomSida({ html, idag: '2026-09-26', leverans: LEVERANS_BRA, kalender: KALENDER, priser: [399, 369] });
  assert.equal(r.find((x) => x.id === 'recensioner').lage, 'ok');
});

test('hjälparna: löfte, räknare, Cloudflare', () => {
  assert.deepEqual(leveransLofte('framme på 5–10 arbetsdagar'), { min: 5, max: 10 });
  assert.equal(leveransLofte('5 dagar'), null);
  assert.equal(antalRecensioner('8 recensioner'), 8);
  assert.equal(antalRecensioner('inga'), null);
  assert.equal(arCloudflareSparr('<p>Verifying your connection...</p>'), true);
  assert.equal(arCloudflareSparr(BRA), false);
});

test('leveransstatistik: arbetsdagar över helg, p90 och andelen över löftet', () => {
  // Fredag 4/9 → måndag 7/9 är 1 arbetsdag; 4/9 → 18/9 är 10 arbetsdagar (14 dygn); 4/9 → 21/9 är 11 (17 dygn).
  const rader = [
    { lagd: '2026-09-04T10:00:00Z', lev: '2026-09-07T10:00:00Z' },
    { lagd: '2026-09-04T10:00:00Z', lev: '2026-09-18T10:00:00Z' },
    { lagd: '2026-09-04T10:00:00Z', lev: '2026-09-21T10:00:00Z' },
    { lagd: '2026-09-04T10:00:00Z', lev: null },
  ];
  const s = leveransStatistik(rader, { loftMaxArbetsdagar: 10, nu: new Date('2026-09-26T00:00:00Z') });
  assert.equal(s.antal, 4);
  assert.equal(s.levererade, 3);
  assert.deepEqual([s.arbetsdagar.median, s.arbetsdagar.p90, s.arbetsdagar.max], [10, 11, 11]);
  assert.equal(s.dygn.max, 17);
  assert.deepEqual(s.over_loftet, { antal: 1, andel: 33 });
  assert.equal(s.ej_framme_over_14_dygn, 1);
});
