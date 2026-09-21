// Tester för bonusmotorn. Pengar räknas här — därför är de här testerna
// hårdare än någon annanstans i repot.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { raknaUt, namnetStarIText, personIText, veckonyckel, iPerioden, uppdragForRoll, harRollen, rollerFor } from '../motor.mjs';

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
  assert.equal(u.personer.find((p) => p.id === 'maria').summa, 13, '3 för svar + 10 för vinst');
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

test('produkttest-trappan betalar per steg produkten nått', () => {
  const matningar = { produkttest: [
    { produkt: 'Vinnaren', ansvarig: 'Pia Lopez', status: 'Continue to scale', typ: 'Profitable', datum: '2026-09-05', steg: ['produkt_godkand', 'produkt_testad', 'produkt_skalad', 'produkt_lonsam'] },
    { produkt: 'Floppen', ansvarig: 'Pia Lopez', status: 'Ads review', typ: null, datum: '2026-09-06', steg: ['produkt_godkand'] },
  ] };
  const u = raknaUt({ regler, personer, period, matningar });
  const pia = u.personer.find((p) => p.id === 'pia');
  assert.equal(pia.summa, 2 + 5 + 100 + 25 + 2, 'vinnaren ger hela trappan, floppen bara första steget');
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
  assert.equal(josh.summa, 50.94 + 2 + 5 + 100);
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
