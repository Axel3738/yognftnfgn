// Tester för inloggningens grundmurar: lösenord, sessioner, CSRF, strypning.
// Inget nät, inga filer, inga nycklar — allt körs på sekunder.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  hashaLosenord, kollaLosenord, slumpLosenord, skapaSession, lasSession,
  csrfNyckel, kollaCsrf, Strypning, hamtaHemlighet,
} from '../auth.mjs';

const HEM = 'en-hemlighet-som-ar-lang-nog-1234';

test('lösenord hashas och går att kontrollera', () => {
  const hash = hashaLosenord('korrekt-häst-batteri');
  assert.ok(hash.startsWith('scrypt$'));
  assert.ok(!hash.includes('korrekt-häst-batteri'), 'klartexten får aldrig finnas i hashen');
  assert.equal(kollaLosenord('korrekt-häst-batteri', hash), true);
  assert.equal(kollaLosenord('fel-lösenord', hash), false);
});

test('samma lösenord ger olika hash (eget salt varje gång)', () => {
  assert.notEqual(hashaLosenord('abcdefgh'), hashaLosenord('abcdefgh'));
});

test('för kort lösenord avvisas', () => {
  assert.throws(() => hashaLosenord('kort'), /minst 8/);
});

test('trasig hash ger alltid falskt, aldrig ett kast', () => {
  for (const trasig of ['', null, undefined, 'skräp', 'scrypt$1$2$3', 'scrypt$a$b$c$d$e']) {
    assert.equal(kollaLosenord('något', trasig), false);
  }
});

test('slumpat lösenord är läsbart och tillräckligt långt', () => {
  const l = slumpLosenord();
  assert.match(l, /^[a-zä-ö]+-[a-zä-ö]+-\d{3}$/u);
  assert.ok(l.length >= 8);
});

test('sessionskakan går att läsa tillbaka', () => {
  const kaka = skapaSession({ id: 'abc', roll: 'agare', losenordAndrat: 5 }, HEM);
  const s = lasSession(kaka, HEM);
  assert.equal(s.id, 'abc');
  assert.equal(s.roll, 'agare');
  assert.equal(s.v, 5);
});

test('pillad kaka avvisas', () => {
  const kaka = skapaSession({ id: 'abc', roll: 'redigerare' }, HEM);
  const [kropp, namn] = kaka.split('.');
  const pillad = `${Buffer.from(JSON.stringify({ id: 'abc', roll: 'agare', gar_ut: Date.now() + 1e6 })).toString('base64url')}.${namn}`;
  assert.equal(lasSession(pillad, HEM), null);
  assert.equal(lasSession(`${kropp}.${namn.slice(0, -1)}x`, HEM), null);
  assert.equal(lasSession(kaka, 'en-annan-hemlighet-som-ocksa-ar-lang'), null);
});

test('utgången kaka avvisas', () => {
  const kaka = skapaSession({ id: 'abc', roll: 'chef' }, HEM, { nu: Date.now() - 100 * 3600_000, timmar: 1 });
  assert.equal(lasSession(kaka, HEM), null);
});

test('skräp i kakan ger null, aldrig ett kast', () => {
  for (const skrap of ['', 'abc', 'a.b', null, undefined, '....']) {
    assert.equal(lasSession(skrap, HEM), null);
  }
});

test('CSRF-nyckeln är bunden till sessionen', () => {
  const nyckel = csrfNyckel('session-ett', HEM);
  assert.equal(kollaCsrf(nyckel, 'session-ett', HEM), true);
  assert.equal(kollaCsrf(nyckel, 'session-tva', HEM), false);
  assert.equal(kollaCsrf('fel', 'session-ett', HEM), false);
});

test('CSRF-nyckeln från förra fönstret går fortfarande igenom', () => {
  const nu = Date.now();
  const gammal = csrfNyckel('s', HEM, { nu: nu - 12 * 3600_000 });
  assert.equal(kollaCsrf(gammal, 's', HEM, { nu }), true);
  const urgammal = csrfNyckel('s', HEM, { nu: nu - 40 * 3600_000 });
  assert.equal(kollaCsrf(urgammal, 's', HEM, { nu }), false);
});

test('strypningen släpper fem försök och bromsar sedan', () => {
  const s = new Strypning({ tak: 5, vilaMs: 60_000 });
  const nyckel = '1.2.3.4|a@b.se';
  for (let i = 0; i < 5; i++) {
    assert.equal(s.kolla(nyckel).tillaten, true, `försök ${i + 1} ska släppas`);
    s.miss(nyckel);
  }
  const lage = s.kolla(nyckel);
  assert.equal(lage.tillaten, false);
  assert.ok(lage.sekunder > 0);
});

test('lyckad inloggning nollställer strypningen', () => {
  const s = new Strypning({ tak: 2 });
  s.miss('x'); s.miss('x');
  assert.equal(s.kolla('x').tillaten, false);
  s.traff('x');
  assert.equal(s.kolla('x').tillaten, true);
});

test('strypningen räknar per nyckel, inte globalt', () => {
  const s = new Strypning({ tak: 2 });
  s.miss('a@b.se'); s.miss('a@b.se');
  assert.equal(s.kolla('a@b.se').tillaten, false);
  assert.equal(s.kolla('c@d.se').tillaten, true);
});

test('hemligheten tas ur miljön när den är lång nog', () => {
  assert.equal(hamtaHemlighet({ STONEBITE_HEMLIGHET: HEM }), HEM);
  assert.equal(hamtaHemlighet({ STONEBITE_HEMLIGHET: 'kort' }), null);
  assert.equal(hamtaHemlighet({}), null);
});
