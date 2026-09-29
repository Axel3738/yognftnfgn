// Utbetalningarna på sajten (Axels beslut 2026-09-28): "dashboarden ska visa
// betalningar i tvåveckorsperioder, men bonusarna ska fortfarande vara varje
// månad … produkttesterna får betalt den 15:e och sista dagen i månaden …
// kommissionen separat". Ingen snapshot krävs, inget nät: bonusdelen är
// fejkdata i samma form som bonus/motor.mjs raknaUt ger.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { minBonus, bonusSida, utbetalningsdelar } from '../vy/bonus.mjs';
import { sattSprak } from '../vy/delar.mjs';

const regler = JSON.parse(readFileSync(new URL('../../bonus/regler.json', import.meta.url), 'utf8'));

const PERIOD = { namn: '2026-09', fran: '2026-09-01', till: '2026-09-30' };
const HALVOR = {
  forsta: { fran: '2026-09-01', till: '2026-09-15', betalas: '2026-09-15' },
  andra: { fran: '2026-09-16', till: '2026-09-30', betalas: '2026-09-30' },
};
const noll = () => ({ produkttest: { takt: 'halvmanad', forsta: 0, andra: 0, summa: 0 }, bonus: { takt: 'manad', summa: 0 }, commission: { takt: 'manad', summa: 0 } });

// Josh: redigerare + produkttestare — tre utbetalningar. Maria: VA — bara bonusen.
const JOSH = {
  id: 'josh', namn: 'Josh Naelga', roll: 'redigerare', extraRoller: ['produkttest'], valuta: 'USD', summa: 390.88,
  rader: [
    {
      uppdrag: 'produkt_fardig', namn: 'Färdig produkt', enhet: 'per produkt', utbetalning: 'produkttest', antal: 22, summa: 330,
      halvor: { forsta: 240, andra: 90 }, halvorAntal: { forsta: 16, andra: 6 },
      bevis: [{ vad: 'Motorhöljet', datum: '2026-09-03', text: 'Ads review', lank: '' }],
    },
    {
      uppdrag: 'spend_andel', namn: 'Andel av annonsspenden', enhet: '0,4 % av spenden på dina annonser', utbetalning: 'commission', antal: 1, summa: 60.88,
      bevis: [{ vad: '277 annonser', datum: '2026-09-28', text: 'Andel av annonsspenden', lank: '' }],
    },
  ],
  program: { id: 'produkttest', namn: 'Produkttest' },
  programs: [{ id: 'produkttest', namn: 'Produkttest' }, { id: 'redigerare', namn: 'Videoredigerare' }],
  utbetalningar: { ...noll(), produkttest: { takt: 'halvmanad', forsta: 240, andra: 90, summa: 330 }, commission: { takt: 'manad', summa: 60.88 } },
};
const MARIA = {
  id: 'maria', namn: 'Maria Santos', roll: 'va', extraRoller: [], valuta: 'USD', summa: 10,
  rader: [{
    uppdrag: 'recension_med_namn', namn: 'Recension med ditt namn', enhet: 'per recension', utbetalning: 'bonus', antal: 2, summa: 10,
    bevis: [{ vad: '5★ Judge.me', datum: '2026-09-10', text: 'Maria var toppen', lank: '' }, { vad: '5★ Judge.me', datum: '2026-09-20', text: 'Tack Maria', lank: '' }],
  }],
  program: { id: 'va', namn: 'Kundtjänst' },
  programs: [{ id: 'va', namn: 'Kundtjänst' }],
  utbetalningar: { ...noll(), bonus: { takt: 'manad', summa: 10 } },
};
const BONUS = {
  period: PERIOD, halvmanader: HALVOR, valuta: 'USD', raknat: '2026-09-28T16:12:44.175Z', summa: 400.88,
  personer: [JOSH, MARIA], otilldelat: [], kallor: [],
};
const SNAPSHOT = {
  bonus: BONUS, bonusProgram: regler, insatser: [],
  personer: [{ id: 'josh', namn: 'Josh Naelga', roll: 'redigerare', extraRoller: ['produkttest'] }, { id: 'maria', namn: 'Maria Santos', roll: 'va', extraRoller: [] }],
  recensioner: { antal: 1318, medNamn: 2 },
};

const josh = { roll: 'redigerare', personId: 'josh', namn: 'Josh Naelga', epost: 'josh@test.se' };
const maria = { roll: 'va', personId: 'maria', namn: 'Maria Santos', epost: 'maria@test.se' };
const axel = { roll: 'agare', personId: 'axel', namn: 'Axel', epost: 'axel@test.se' };

test.afterEach(() => sattSprak('sv'));

test('delarna: produkttest blir två med var sin betaldag, bonus och commission en var', () => {
  const delar = utbetalningsdelar(regler, PERIOD);
  assert.deepEqual(delar.map((d) => `${d.id}:${d.nyckel}`), ['produkttest:forsta', 'produkttest:andra', 'bonus:summa', 'commission:summa']);
  assert.equal(delar[0].etikett, 'Produkttest 1–15');
  assert.equal(delar[0].betaldag, '2026-09-15');
  assert.equal(delar[1].etikett, 'Produkttest 16–30');
  assert.equal(delar[1].betaldag, '2026-09-30');
  assert.equal(delar[2].betaldag, null, 'bonusen har ingen betaldag i datan — bara "en gång i månaden"');
  sattSprak('en');
  assert.equal(utbetalningsdelar(regler, PERIOD)[0].etikett, 'Product testing 1–15');
  assert.equal(utbetalningsdelar(regler, PERIOD)[0].betalas, 'Paid on the 15th.');
});

test('Min sida (engelska): Josh ser produkttest i två halvmånader med betaldag och commission för sig', () => {
  sattSprak('en');
  const html = minBonus({ snapshot: SNAPSHOT, anvandare: josh, person: SNAPSHOT.personer[0], csrf: 'x' });
  assert.match(html, /Your payouts/);
  assert.match(html, /Product testing 1–15/);
  assert.match(html, /\$240,00/);
  assert.match(html, /Paid on the 15th\. 2026-09-01 – 2026-09-15/);
  assert.match(html, /Product testing 16–30/);
  assert.match(html, /\$90,00/);
  assert.match(html, /Paid on the last day of the month\. 2026-09-16 – 2026-09-30/);
  assert.match(html, /Commission/);
  assert.match(html, /\$60,88/);
  assert.match(html, /Calculated separately by the commission run/);
  // Josh är inte i bonusprogrammet ⇒ ingen bonusruta, och inget av det gamla.
  assert.doesNotMatch(html, /Paid once a month/);
  assert.doesNotMatch(html, /Pay period/);
  assert.doesNotMatch(html, /whole month/);
  assert.doesNotMatch(html, /\$390,88/, 'ingen klumpsumma — pengarna visas som de betalas ut');
});

test('Min sida: en VA ser bonusen per månad, aldrig delad på halvor — och inget produkttest', () => {
  sattSprak('en');
  const html = minBonus({ snapshot: SNAPSHOT, anvandare: maria, person: SNAPSHOT.personer[1], csrf: 'x' });
  assert.match(html, /Paid once a month\. 2026-09-01 – 2026-09-30/);
  assert.match(html, /\$10,00/);
  assert.doesNotMatch(html, /1–15/, 'recensionerna kom den 10:e och 20:e, men bonusen delas inte');
  assert.doesNotMatch(html, /Product testing/);
  assert.doesNotMatch(html, /commission run/);
});

test('Min sida utan uträkning: korten står ändå, på noll, så man vet vad som kommer och när', () => {
  sattSprak('sv');
  const html = minBonus({ snapshot: { bonusProgram: regler, insatser: [], personer: [] }, anvandare: josh, person: SNAPSHOT.personer[0], csrf: 'x' });
  assert.match(html, /Produkttest 1–15/);
  assert.match(html, /Produkttest 16–slut/, 'utan period vet sidan inte sista dagen');
  assert.match(html, /Betalas den 15:e\./);
  assert.match(html, /Betalas sista dagen i månaden\./);
  assert.match(html, /\$0,00/);
});

test('Bonus-sidan: en tabell per utbetalning — 15:e, sista dagen, bonus, commission — och rätt person i rätt tabell', () => {
  sattSprak('sv');
  const { innehall } = bonusSida({ snapshot: SNAPSHOT, anvandare: axel, csrf: 'x' });
  assert.match(innehall, /Utbetalningarna/);
  assert.match(innehall, /Betalas den 15:e\. 1 person\./, 'kortet räknar personer med pengar i delen');
  assert.match(innehall, /Betalas en gång i månaden\. 1 person\./);
  assert.doesNotMatch(innehall, /Löneperiod|Utbetalas för|Vem tjänar vad|Största enskilda/);

  const paneler = innehall.split('<section class="panel">').slice(1);
  const panelFor = (rubrik) => paneler.find((p) => p.includes(`<h3>${rubrik}</h3>`));
  const forsta = panelFor('Produkttest 1–15');
  assert.ok(forsta, 'panelen för 1–15 finns');
  assert.match(forsta, /Betalas den 15:e\. 2026-09-01 – 2026-09-15/);
  assert.match(forsta, /Josh Naelga/);
  assert.match(forsta, /\$240,00/);
  assert.match(forsta, /Färdig produkt ×16/, 'antalet per halva följer med');
  assert.doesNotMatch(forsta, /Maria/);
  assert.match(forsta, /Summa: \$240,00 · 1 person/);

  const andra = panelFor('Produkttest 16–30');
  assert.match(andra, /Betalas sista dagen i månaden\. 2026-09-16 – 2026-09-30/);
  assert.match(andra, /\$90,00/);
  assert.match(andra, /Färdig produkt ×6/);

  const bonus = panelFor('Bonus');
  assert.match(bonus, /Betalas en gång i månaden\./);
  assert.match(bonus, /Maria Santos/);
  assert.match(bonus, /\$10,00/);
  assert.match(bonus, /Recension med ditt namn ×2/);
  assert.doesNotMatch(bonus, /Josh/);

  const commission = panelFor('Commission');
  assert.match(commission, /Räknas separat av commission-körningen/);
  assert.match(commission, /Josh Naelga/);
  assert.match(commission, /\$60,88/);
  assert.doesNotMatch(commission, /Maria/);
});

test('Bonus-sidan (engelska): rubrikerna följer läsaren, namnen och talen rörs inte — och en tom del säger det rakt ut', () => {
  sattSprak('en');
  // Bara Josh ⇒ ingen har bonus, och den delen ska säga det i stället för att stå tom.
  const { innehall } = bonusSida({ snapshot: { ...SNAPSHOT, bonus: { ...BONUS, personer: [JOSH] } }, anvandare: axel, csrf: 'x' });
  assert.match(innehall, /The payouts/);
  assert.match(innehall, /Product testing 1–15/);
  assert.match(innehall, /Paid on the last day of the month\./);
  assert.match(innehall, /Paid once a month\. 0 people\./);
  assert.match(innehall, /Nobody has earned anything here yet\./);
  assert.match(innehall, /Josh Naelga/);
  assert.match(innehall, /\$240,00/);
  assert.doesNotMatch(innehall, /Maria/);
});

test('en snapshot från före bygget (bara halvor på raderna) visar samma uppdelning', () => {
  // Formen från 2026-09-24: halvor { forsta, andra, manad } på person och rad, ingen utbetalning.
  const gammalPerson = (p) => {
    const { utbetalningar, ...rest } = p;
    return {
      ...rest,
      halvor: { forsta: 0, andra: 0, manad: 0 },
      rader: p.rader.map((r) => {
        const { utbetalning, halvorAntal, ...rr } = r;
        return { ...rr, halvor: r.halvor ? { ...r.halvor, manad: 0 } : { forsta: 0, andra: 0, manad: r.summa } };
      }),
    };
  };
  const { halvmanader, ...bonusUtan } = BONUS;
  const gammal = { ...SNAPSHOT, bonus: { ...bonusUtan, personer: BONUS.personer.map(gammalPerson) } };

  sattSprak('en');
  const html = minBonus({ snapshot: gammal, anvandare: josh, person: SNAPSHOT.personer[0], csrf: 'x' });
  assert.match(html, /\$240,00/);
  assert.match(html, /\$90,00/);
  assert.match(html, /\$60,88/);
  assert.match(html, /Paid on the 15th\. 2026-09-01 – 2026-09-15/);

  sattSprak('sv');
  const { innehall } = bonusSida({ snapshot: gammal, anvandare: axel, csrf: 'x' });
  const forsta = innehall.split('<section class="panel">').slice(1).find((p) => p.includes('<h3>Produkttest 1–15</h3>'));
  assert.match(forsta, /\$240,00/);
  assert.match(forsta, /Färdig produkt(?! ×)/, 'utan antal per halva står bara uppdraget');
});
