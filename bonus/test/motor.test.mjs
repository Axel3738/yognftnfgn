// Tester för bonusmotorn. Pengar räknas här — därför är de här testerna
// hårdare än någon annanstans i repot.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  raknaUt, namnetStarIText, personIText, veckonyckel, iPerioden, uppdragForRoll, harRollen, rollerFor,
  halvmanader, utbetalningarFor, utbetalningFor, utbetalningsdefinitioner, summeraUtbetalningar,
} from '../motor.mjs';

const ROT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const regler = JSON.parse(readFileSync(join(ROT, 'bonus', 'regler.json'), 'utf8'));
const period = { namn: '2026-09', fran: '2026-09-01', till: '2026-09-30' };

const personer = [
  { id: 'maria', namn: 'Maria Santos', fornamn: 'Maria', roll: 'va', brands: ['baverbutiken'], alias: [] },
  { id: 'ella', namn: 'Ella Cruz', fornamn: 'Ella', roll: 'va', brands: ['baverbutiken'], alias: [] },
  { id: 'hanna', namn: 'Hanna Reyes', fornamn: 'Hanna', roll: 'support_chef', brands: ['baverbutiken'], alias: [] },
  { id: 'josh', namn: 'Josh Naelga', fornamn: 'Josh', roll: 'redigerare', brands: [], notionNamn: 'Josh Naelga', alias: [] },
  { id: 'pia', namn: 'Pia Lopez', fornamn: 'Pia', roll: 'produkttest', brands: [], notionNamn: 'Pia Lopez', alias: [] },
];

const rec = (text, extra = {}) => ({ kalla: 'Judge.me', butik: 'Bäverbutiken', betyg: 5, kund: 'Kund', text, datum: '2026-09-10', ...extra });

test('namn matchas som eget ord — "Anna" i "Annabelle" räknas inte', () => {
  assert.equal(namnetStarIText('anna', 'Tack Anna för hjälpen!'), true);
  assert.equal(namnetStarIText('anna', 'Annabelle var toppen'), false);
  assert.equal(namnetStarIText('maria', 'MARIA var snabb'), true);
  assert.equal(namnetStarIText('maria', 'Mariana hjälpte mig'), false);
  assert.equal(namnetStarIText('ok', 'ok'), false, 'för korta namn matchar aldrig');
});

test('namn med å ä ö fungerar', () => {
  assert.equal(namnetStarIText('åsa', 'Stort tack till Åsa!'), true);
  assert.equal(namnetStarIText('åsa', 'Åsalisa var trevlig'), false);
});

test('två namn i samma recension ger ingen utbetalning', () => {
  assert.equal(personIText('Maria och Ella hjälpte mig', personer)?.id, undefined);
  assert.equal(personIText('Maria hjälpte mig', personer)?.id, 'maria');
  assert.equal(personIText('Ingen nämns här', personer), null);
});

test('recension med namn ger 5 dollar, en gång per recension', () => {
  const u = raknaUt({
    regler, personer, period,
    matningar: { recensioner: [rec('Maria hjälpte mig direkt'), rec('Tack Maria!'), rec('Bra produkt')] },
  });
  const maria = u.personer.find((p) => p.id === 'maria');
  const rad = maria.rader.find((r) => r.uppdrag === 'recension_med_namn');
  assert.equal(rad.antal, 2);
  assert.equal(rad.summa, 10);
  assert.equal(maria.summa, 10);
});

test('recension under 4 stjärnor ger ingenting', () => {
  const u = raknaUt({ regler, personer, period, matningar: { recensioner: [rec('Maria var trevlig', { betyg: 3 })] } });
  assert.equal(u.personer.find((p) => p.id === 'maria').summa, 0);
});

test('recension utanför perioden räknas inte', () => {
  const u = raknaUt({ regler, personer, period, matningar: { recensioner: [rec('Maria var bäst', { datum: '2026-08-15' })] } });
  assert.equal(u.personer.find((p) => p.id === 'maria').summa, 0);
});

test('tre recensioner samma vecka ger streak-bonusen', () => {
  const u = raknaUt({
    regler, personer, period,
    matningar: { recensioner: [
      rec('Maria!', { datum: '2026-09-07' }), rec('Tack Maria', { datum: '2026-09-08' }), rec('Maria fixade det', { datum: '2026-09-09' }),
    ] },
  });
  const maria = u.personer.find((p) => p.id === 'maria');
  assert.equal(maria.rader.find((r) => r.uppdrag === 'recension_med_namn').antal, 3);
  assert.equal(maria.rader.find((r) => r.uppdrag === 'recension_streak').summa, 10);
  assert.equal(maria.summa, 25, '3 × 5 + 10 i streak');
});

test('två recensioner samma vecka ger INGEN streak', () => {
  const u = raknaUt({
    regler, personer, period,
    matningar: { recensioner: [rec('Maria!', { datum: '2026-09-07' }), rec('Maria igen', { datum: '2026-09-08' })] },
  });
  const maria = u.personer.find((p) => p.id === 'maria');
  assert.equal(maria.rader.some((r) => r.uppdrag === 'recension_streak'), false);
  assert.equal(maria.summa, 10);
});

test('en tvist betalas bara när någon gjort anspråk OCH datan håller med', () => {
  const matningar = { tvister: [
    { order: '#5763', besvarad: true, utfall: 'won', typ: 'inquiry', belopp: 349, valuta: 'SEK' },
    { order: '#9999', besvarad: false, utfall: null, typ: 'chargeback' },
  ] };
  const insatser = [
    { id: '1', personId: 'maria', uppdrag: 'tvist_besvarad', referens: '#5763', status: 'godkand', datum: '2026-09-10' },
    { id: '2', personId: 'maria', uppdrag: 'tvist_vunnen', referens: '#5763', status: 'godkand', datum: '2026-09-10' },
    { id: '3', personId: 'ella', uppdrag: 'tvist_besvarad', referens: '#9999', status: 'godkand', datum: '2026-09-10' },
    { id: '4', personId: 'ella', uppdrag: 'tvist_besvarad', referens: '#0000', status: 'godkand', datum: '2026-09-10' },
  ];
  const u = raknaUt({ regler, personer, period, matningar, insatser });
  assert.equal(u.personer.find((p) => p.id === 'maria').summa, 6, '1 för svar + 5 för vinst (halverat 2026-09-21)');
  assert.equal(u.personer.find((p) => p.id === 'ella').summa, 0, 'obesvarad tvist och okänd order ger noll');
  assert.equal(u.otilldelat.filter((o) => o.program === 'va').length, 2);
});

test('ett anspråk som inte är godkänt betalas aldrig', () => {
  const matningar = { tvister: [{ order: '#5763', besvarad: true, utfall: 'won' }] };
  const insatser = [{ id: '1', personId: 'maria', uppdrag: 'tvist_vunnen', referens: '#5763', status: 'vantar', datum: '2026-09-10' }];
  const u = raknaUt({ regler, personer, period, matningar, insatser });
  assert.equal(u.personer.find((p) => p.id === 'maria').summa, 0);
});

test('veckobonusar går till dem som är tilldelade butiken', () => {
  const matningar = { kundtjanst: [
    { brand: 'baverbutiken', vecka: '2026-W38', datum: '2026-09-14', obesvarade: 4, medianTimmar: 8, risk: 20, sopSaknas: 0 },
  ] };
  const u = raknaUt({ regler, personer, period, matningar });
  const maria = u.personer.find((p) => p.id === 'maria');
  assert.equal(maria.rader.find((r) => r.uppdrag === 'tom_inkorg').summa, 15);
  assert.equal(maria.rader.find((r) => r.uppdrag === 'snabb_svarstid').summa, 10);
  // Head of support får sina egna mål OCH andel av teamet.
  const hanna = u.personer.find((p) => p.id === 'hanna');
  assert.ok(hanna.rader.some((r) => r.uppdrag === 'risken_ner'), 'risken under 25 ska betalas');
  assert.ok(hanna.rader.some((r) => r.uppdrag === 'teamets_andel'), 'chefen får andel av teamet');
});

test('veckobonus betalas inte när målet missas', () => {
  const matningar = { kundtjanst: [
    { brand: 'baverbutiken', vecka: '2026-W38', datum: '2026-09-14', obesvarade: 195, medianTimmar: 17.3, risk: 100, sopSaknas: 2 },
  ] };
  const u = raknaUt({ regler, personer, period, matningar });
  assert.equal(u.personer.find((p) => p.id === 'maria').summa, 0);
  assert.equal(u.personer.find((p) => p.id === 'hanna').summa, 0);
});

test('en butik utan ansvarig betalar ingen, men syns som otilldelad', () => {
  const matningar = { kundtjanst: [
    { brand: 'carashell', vecka: '2026-W38', datum: '2026-09-14', obesvarade: 2, medianTimmar: 5, risk: 10, sopSaknas: 0 },
  ] };
  const u = raknaUt({ regler, personer, period, matningar });
  assert.equal(u.summa, 0);
  assert.ok(u.otilldelat.some((o) => o.orsak.includes('carashell')));
});

test('chefens andel är tio procent av teamets bonus', () => {
  const matningar = { recensioner: [rec('Maria!'), rec('Tack Maria'), rec('Ella var bäst')] };
  const u = raknaUt({ regler, personer, period, matningar });
  const teamsumma = u.personer.filter((p) => p.roll === 'va').reduce((s, p) => s + p.summa, 0);
  const hanna = u.personer.find((p) => p.id === 'hanna');
  assert.equal(Math.round(hanna.summa * 100) / 100, Math.round(teamsumma * 0.1 * 100) / 100);
});

test('chefen får ingen andel av sina EGNA pengar — ensam i teamet blir andelen noll', () => {
  // Mechile 2026-09-21: både VA och Head of support, ingen annan i kundtjänsten.
  const ensam = [{ id: 'mechile', namn: 'Mechile Delos Santos', fornamn: 'Mechile', roll: 'support_chef', brands: ['*'], alias: [] }];
  const u = raknaUt({ regler, personer: ensam, period, matningar: { recensioner: [rec('Mechile var fantastisk'), rec('Tack Mechile!')] } });
  const m = u.personer.find((p) => p.id === 'mechile');
  assert.equal(m.rader.find((r) => r.uppdrag === 'recension_med_namn').summa, 10, 'hon tjänar VA-uppdragen direkt');
  assert.equal(m.rader.some((r) => r.uppdrag === 'teamets_andel'), false, 'men inte tio procent på sig själv');
  assert.equal(m.summa, 10);

  // Med en VA bredvid räknas andelen bara på VA:ns pengar.
  const tva = [...ensam, { id: 'maria', namn: 'Maria Santos', fornamn: 'Maria', roll: 'va', brands: ['baverbutiken'], alias: [] }];
  const u2 = raknaUt({ regler, personer: tva, period, matningar: { recensioner: [rec('Mechile var fantastisk'), rec('Maria hjälpte mig')] } });
  const m2 = u2.personer.find((p) => p.id === 'mechile');
  assert.equal(m2.rader.find((r) => r.uppdrag === 'teamets_andel').summa, 0.5, '10 % av Marias 5 dollar');
});

test('veckobonus med * betalas EN gång per vecka — och bara när alla butiker klarar kravet', () => {
  const mechile = [{ id: 'mechile', namn: 'Mechile Delos Santos', fornamn: 'Mechile', roll: 'support_chef', brands: ['*'], alias: [] }];
  const bra = { obesvarade: 3, medianTimmar: 6, risk: 10, sopSaknas: 0 };
  const matningar = { kundtjanst: [
    { brand: 'baverbutiken', vecka: '2026-W37', datum: '2026-09-07', ...bra },
    { brand: 'carashell', vecka: '2026-W37', datum: '2026-09-07', ...bra },
    { brand: 'baverbutiken', vecka: '2026-W38', datum: '2026-09-14', ...bra },
    { brand: 'carashell', vecka: '2026-W38', datum: '2026-09-14', ...bra, obesvarade: 40 }, // en butik missar
  ] };
  const u = raknaUt({ regler, personer: mechile, period, matningar });
  const m = u.personer.find((p) => p.id === 'mechile');
  assert.equal(m.rader.find((r) => r.uppdrag === 'tom_inkorg').summa, 15, 'W37 betalas, W38 inte — carashell hade 40 obesvarade');
  assert.equal(m.rader.find((r) => r.uppdrag === 'snabb_svarstid').summa, 20, 'svarstiden klarades båda veckorna, en utbetalning per vecka — inte per butik');
  assert.equal(u.otilldelat.length, 0, 'med * står ingen butik utan ansvarig');
});

test('månadsmålen döms på butikens sista rad, en gång per butik respektive månad', () => {
  const matningar = { kundtjanst: [
    { brand: 'baverbutiken', vecka: '2026-W37', datum: '2026-09-07', obesvarade: 3, medianTimmar: 6, risk: 60, sopSaknas: 1 },
    { brand: 'baverbutiken', vecka: '2026-W38', datum: '2026-09-14', obesvarade: 3, medianTimmar: 6, risk: 20, sopSaknas: 0 },
    { brand: 'carashell', vecka: '2026-W38', datum: '2026-09-14', obesvarade: 3, medianTimmar: 6, risk: 10, sopSaknas: 0 },
  ] };
  const chef = [{ id: 'hanna', namn: 'Hanna Reyes', fornamn: 'Hanna', roll: 'support_chef', brands: ['*'], alias: [] }];
  const u = raknaUt({ regler, personer: chef, period, matningar });
  const hanna = u.personer.find((p) => p.id === 'hanna');
  assert.equal(hanna.rader.find((r) => r.uppdrag === 'risken_ner').antal, 2, 'sista raden per butik: båda under 25 ⇒ två butiker, inte tre rader');
  assert.equal(hanna.rader.some((r) => r.uppdrag === 'sop_tackning'), false, 'SOP saknades en vecka ⇒ inte "hela månaden"');
});

test('produkttest betalar 15 dollar per färdig produkt — en gång, inte per steg', () => {
  const matningar = { produkttest: [
    { produkt: 'Vinnaren', ansvarig: 'Pia Lopez', status: 'Continue to scale', typ: 'Profitable', datum: '2026-09-05', steg: ['produkt_godkand', 'produkt_testad', 'produkt_skalad', 'produkt_lonsam'] },
    { produkt: 'Floppen', ansvarig: 'Pia Lopez', status: 'Ads review', typ: null, datum: '2026-09-06', steg: ['produkt_godkand'] },
    { produkt: 'Ofärdig', ansvarig: 'Pia Lopez', status: 'Draft', typ: null, datum: '2026-09-07', steg: [] },
  ] };
  const u = raknaUt({ regler, personer, period, matningar });
  const pia = u.personer.find((p) => p.id === 'pia');
  assert.equal(pia.summa, 15 + 15, 'två produkter klara för annonser, hur långt de sedan kom spelar ingen roll (Axel 2026-09-21)');
});

test('produkttest utan konto i registret betalas inte', () => {
  const matningar = { produkttest: [{ produkt: 'X', ansvarig: 'Okänd Person', status: 'Ads review', datum: '2026-09-05', steg: ['produkt_godkand'] }] };
  const u = raknaUt({ regler, personer, period, matningar });
  assert.equal(u.summa, 0);
  assert.match(u.otilldelat[0].orsak, /har inget konto/);
});

test('en person kan bära två roller och tjäna i båda programmen', () => {
  const tvaRoller = personer.map((p) => (p.id === 'josh' ? { ...p, extraRoller: ['produkttest'] } : p));
  const matningar = {
    produkttest: [{ produkt: 'Joshs fynd', ansvarig: 'Josh Naelga', status: 'Continue to scale', datum: '2026-09-05', steg: ['produkt_godkand', 'produkt_testad', 'produkt_skalad'] }],
    commission: [{ personId: 'josh', namn: 'Josh Naelga', usd: 50.94, annonser: 263 }],
  };
  const u = raknaUt({ regler, personer: tvaRoller, matningar, period });
  const josh = u.personer.find((p) => p.id === 'josh');
  assert.equal(josh.summa, 50.94 + 15, 'commission som redigerare + 15 för den färdiga produkten');
  assert.equal(josh.programs.length, 2);
  assert.equal(harRollen({ roll: 'redigerare', extraRoller: ['produkttest'] }, 'produkttest'), true);
  assert.deepEqual(rollerFor({ roll: 'va', extraRoller: ['produkttest'] }), ['va', 'produkttest']);
});

test('redigerarens commission tas rakt av från leaderboarden', () => {
  const matningar = { commission: [{ personId: 'josh', namn: 'Josh Naelga', usd: 50.94, annonser: 263 }] };
  const u = raknaUt({ regler, personer, matningar, period });
  assert.equal(u.personer.find((p) => p.id === 'josh').summa, 50.94);
});

test('en redigerare utan konto hamnar i otilldelat med sitt belopp', () => {
  const matningar = { commission: [{ personId: 'okand', namn: 'Okänd Redigerare', usd: 12.5 }] };
  const u = raknaUt({ regler, personer, matningar, period });
  assert.equal(u.summa, 0);
  assert.equal(u.otilldelat[0].summa, 12.5);
});

test('summan är summan av personernas rader', () => {
  const matningar = {
    recensioner: [rec('Maria!'), rec('Ella var bäst')],
    commission: [{ personId: 'josh', namn: 'Josh Naelga', usd: 10 }],
  };
  const u = raknaUt({ regler, personer, matningar, period });
  const kontroll = u.personer.reduce((s, p) => s + p.summa, 0);
  assert.equal(u.summa, Math.round(kontroll * 100) / 100);
});

test('varje utbetald rad bär ett bevis', () => {
  const matningar = { recensioner: [rec('Maria hjälpte mig direkt')] };
  const u = raknaUt({ regler, personer, matningar, period });
  const rad = u.personer.find((p) => p.id === 'maria').rader[0];
  assert.ok(rad.bevis.length >= 1);
  assert.match(rad.bevis[0].vad, /5★/);
  assert.equal(rad.bevis[0].datum, '2026-09-10');
});

test('veckonyckel och period räknar rätt', () => {
  assert.equal(veckonyckel('2026-09-14'), '2026-W38');
  assert.equal(veckonyckel('inte ett datum'), null);
  assert.equal(iPerioden('2026-09-15', period), true);
  assert.equal(iPerioden('2026-10-01', period), false);
  assert.equal(iPerioden(null, period), false);
});

test('uppdragslistan per roll visar bara det rollen kan tjäna på', () => {
  const va = uppdragForRoll(regler, 'va');
  assert.equal(va.length, 1);
  assert.equal(va[0].programId, 'va');
  assert.ok(va[0].uppdrag.some((u) => u.id === 'recension_med_namn'));

  const chef = uppdragForRoll(regler, 'support_chef');
  assert.equal(chef.length, 2, 'Head of support ser både VA-uppdragen och sina egna');

  assert.equal(uppdragForRoll(regler, 'agare').length, 0, 'ägaren har inga bonusuppdrag');
  assert.equal(uppdragForRoll(regler, ['redigerare', 'produkttest']).length, 2);
});

test('reglerna är hela: varje uppdrag har id, namn, belopp och förklaring', () => {
  for (const [programId, program] of Object.entries(regler.program)) {
    assert.ok(program.roller?.length, `${programId} saknar roller`);
    for (const u of program.uppdrag) {
      assert.ok(u.id && u.namn, `${programId}: uppdrag utan id/namn`);
      assert.equal(typeof u.belopp, 'number', `${u.id}: belopp måste vara ett tal`);
      assert.ok(u.hur?.length > 20, `${u.id}: "hur" måste förklara hur man tjänar pengarna`);
      assert.ok(u.mats?.length > 10, `${u.id}: "mats" måste säga hur det mäts`);
    }
  }
});

// ------------------------------------------------------- utbetalningarna
//
// Axels beslut 2026-09-28: "betalningar i tvåveckorsperioder, men bonusarna
// ska fortfarande vara varje månad … produkttesterna får betalt den 15:e och
// sista dagen i månaden … kommissionen separat". Tre utbetalningar, tre
// takter — och de blandas aldrig i en summa.

test('tre utbetalningar, tre takter: produkttest per halvmånad, bonus per månad, commission separat', () => {
  const tvaRoller = personer.map((p) => (p.id === 'josh' ? { ...p, extraRoller: ['produkttest'] } : p));
  const matningar = {
    produkttest: [
      { produkt: 'A', ansvarig: 'Josh Naelga', status: 'Ads review', datum: '2026-09-15', steg: ['produkt_godkand'] },
      { produkt: 'B', ansvarig: 'Josh Naelga', status: 'Ads review', datum: '2026-09-16', steg: ['produkt_godkand'] },
      { produkt: 'C', ansvarig: 'Josh Naelga', status: 'Ads review', datum: '2026-09-29', steg: ['produkt_godkand'] },
    ],
    commission: [{ personId: 'josh', namn: 'Josh Naelga', usd: 50.94, annonser: 263, datum: '2026-09-21' }],
    recensioner: [rec('Maria!', { datum: '2026-09-10' }), rec('Tack Maria', { datum: '2026-09-20' })],
  };
  const u = raknaUt({ regler, personer: tvaRoller, matningar, period });

  // Produkttestaren: den 15:e hör till första halvan, den 16:e till andra.
  const josh = u.personer.find((p) => p.id === 'josh');
  assert.deepEqual(josh.utbetalningar.produkttest, { takt: 'halvmanad', forsta: 15, andra: 30, summa: 45 });
  assert.deepEqual(josh.utbetalningar.commission, { takt: 'manad', summa: 50.94 }, 'commission står för sig');
  assert.deepEqual(josh.utbetalningar.bonus, { takt: 'manad', summa: 0 });
  assert.equal(josh.halvor, undefined, 'personen bär inga halvor längre — utbetalningarna är det som gäller');
  const produkter = josh.rader.find((r) => r.uppdrag === 'produkt_fardig');
  assert.equal(produkter.utbetalning, 'produkttest');
  assert.deepEqual(produkter.halvor, { forsta: 15, andra: 30 });
  assert.deepEqual(produkter.halvorAntal, { forsta: 1, andra: 2 });
  const spend = josh.rader.find((r) => r.uppdrag === 'spend_andel');
  assert.equal(spend.utbetalning, 'commission');
  assert.equal(spend.halvor, undefined, 'commission delas aldrig på halvor');

  // VA:n: bonusen är per månad — inte delad fast recensionerna kom den 10:e och 20:e.
  const maria = u.personer.find((p) => p.id === 'maria');
  assert.deepEqual(maria.utbetalningar.bonus, { takt: 'manad', summa: 10 });
  assert.equal(maria.rader[0].utbetalning, 'bonus');
  assert.equal(maria.rader[0].halvor, undefined);
  assert.equal(maria.utbetalningar.produkttest.summa, 0);

  // Head of support: teamandelen är bonus, per månad.
  const hanna = u.personer.find((p) => p.id === 'hanna');
  assert.equal(hanna.rader.find((r) => r.uppdrag === 'teamets_andel').utbetalning, 'bonus');
  assert.equal(hanna.utbetalningar.bonus.summa, 1, '10 % av Marias 10 dollar');

  // Summan per person är alltid summan av utbetalningarna.
  for (const p of u.personer) {
    const s = Object.values(p.utbetalningar).reduce((a, x) => a + x.summa, 0);
    assert.equal(Math.round(s * 100) / 100, p.summa, `${p.id}: utbetalningarna går jämnt ut med summan`);
  }

  // Lagets kvitto: vad som betalas ut när.
  assert.equal(u.utbetalningar.produkttest.forsta, 15);
  assert.equal(u.utbetalningar.produkttest.andra, 30);
  assert.equal(u.utbetalningar.produkttest.summa, 45);
  assert.deepEqual(u.utbetalningar.produkttest.personer, { forsta: 1, andra: 1 });
  assert.equal(u.utbetalningar.bonus.summa, 11, 'Maria 10 + Hannas andel 1');
  assert.equal(u.utbetalningar.bonus.personer, 2);
  assert.equal(u.utbetalningar.commission.summa, 50.94);
  assert.equal(u.utbetalningar.produkttest.namn, 'Produkttest', 'kvittot bär definitionen så filen går att läsa för sig');
  assert.deepEqual(u.halvmanader, {
    forsta: { fran: '2026-09-01', till: '2026-09-15', betalas: '2026-09-15' },
    andra: { fran: '2026-09-16', till: '2026-09-30', betalas: '2026-09-30' },
  });
});

test('halvmånaderna följer månadens längd, och betaldagen är den 15:e respektive sista dagen', () => {
  assert.deepEqual(halvmanader({ fran: '2026-02-01', till: '2026-02-28' }), {
    forsta: { fran: '2026-02-01', till: '2026-02-15', betalas: '2026-02-15' },
    andra: { fran: '2026-02-16', till: '2026-02-28', betalas: '2026-02-28' },
  });
  assert.equal(halvmanader({}), null);
  assert.equal(halvmanader(null), null);
});

test('utbetalningarFor räknar fram uppdelningen ur raderna — även ur en snapshot från före bygget', () => {
  // Gamla formen (2026-09-24): halvor { forsta, andra, manad } på raderna, ingen utbetalning.
  const gammal = {
    id: 'josh',
    rader: [
      { uppdrag: 'produkt_fardig', summa: 330, antal: 22, halvor: { forsta: 240, andra: 90, manad: 0 } },
      { uppdrag: 'spend_andel', summa: 60.88, antal: 1, halvor: { forsta: 0, andra: 0, manad: 60.88 } },
    ],
  };
  const u = utbetalningarFor(gammal, regler);
  assert.deepEqual(u.produkttest, { takt: 'halvmanad', forsta: 240, andra: 90, summa: 330 });
  assert.deepEqual(u.commission, { takt: 'manad', summa: 60.88 });
  assert.deepEqual(u.bonus, { takt: 'manad', summa: 0 });

  // En produkttestrad utan halvor alls hamnar i andra halvan: betalas sist i månaden, aldrig före.
  const utanHalvor = utbetalningarFor({ rader: [{ uppdrag: 'produkt_fardig', summa: 15, antal: 1 }] }, regler);
  assert.deepEqual(utanHalvor.produkttest, { takt: 'halvmanad', forsta: 0, andra: 15, summa: 15 });

  assert.equal(utbetalningFor(regler, 'recension_med_namn'), 'bonus');
  assert.equal(utbetalningFor(regler, 'teamets_andel'), 'bonus');
  assert.equal(utbetalningFor(regler, 'produkt_fardig'), 'produkttest');
  assert.equal(utbetalningFor(regler, 'spend_andel'), 'commission');
  assert.equal(utbetalningFor(regler, 'finns_inte'), 'bonus', 'okänt uppdrag räknas som bonus — månadstakten är den försiktiga');

  // Summeringen över laget räknar personer per del.
  const lag = summeraUtbetalningar([{ utbetalningar: u }, { utbetalningar: utanHalvor }], regler);
  assert.equal(lag.produkttest.forsta, 240);
  assert.equal(lag.produkttest.andra, 105);
  assert.deepEqual(lag.produkttest.personer, { forsta: 1, andra: 2 });
  assert.equal(lag.commission.personer, 1);
});

test('reglerna pekar ut en utbetalning för varje program, med takt och betaltext på båda språken', () => {
  const defs = utbetalningsdefinitioner(regler);
  assert.deepEqual(Object.keys(defs).sort(), ['bonus', 'commission', 'produkttest']);
  assert.equal(defs.produkttest.takt, 'halvmanad', 'produkttest betalas varannan vecka (Axel 2026-09-28)');
  assert.equal(defs.bonus.takt, 'manad', 'bonusarna är fortfarande varje månad');
  assert.equal(defs.commission.takt, 'manad');
  for (const [id, d] of Object.entries(defs)) {
    assert.ok(d.namn && d.en?.namn, `${id} saknar namn på båda språken`);
    if (d.takt === 'halvmanad') {
      assert.ok(d.betalas?.forsta && d.betalas?.andra && d.en?.betalas?.forsta && d.en?.betalas?.andra, `${id} saknar betaltext per halva`);
    } else {
      assert.ok(typeof d.betalas === 'string' && typeof d.en?.betalas === 'string', `${id} saknar betaltext`);
    }
  }
  for (const [id, program] of Object.entries(regler.program)) {
    assert.ok(defs[program.utbetalning], `${id} pekar på okänd utbetalning "${program.utbetalning}"`);
  }
  assert.equal(uppdragForRoll(regler, 'produkttest')[0].utbetalning, 'produkttest', 'sidan läser utbetalningen ur programmet');
  assert.equal(uppdragForRoll(regler, 'va')[0].utbetalning, 'bonus');
  assert.equal(uppdragForRoll(regler, 'redigerare')[0].utbetalning, 'commission');
  assert.equal(utbetalningsdefinitioner({}).produkttest.takt, 'halvmanad', 'utan regler gäller standarden');
});
