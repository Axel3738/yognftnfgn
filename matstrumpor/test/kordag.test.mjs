import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sistaRond, arKordag, lasKonfig } from '../kor.mjs';

const N = lasKonfig().kadens.rond_var_n_dag;

test('konfigen säger var tredje dag (Axels beslut 2026-09-21)', () => {
  assert.equal(N, 3);
});

test('utan någon rond i loggen är i dag kördag', () => {
  const k = arKordag([], '2026-09-23', N);
  assert.equal(k.kor, true);
  assert.equal(k.sista, null);
});

test('ROND_KLAR är facit: tre dygn efter förra ronden är det kördag, två är det inte', () => {
  const logg = [{ kod: 'ROND_KLAR', datum: '2026-09-24' }];
  assert.equal(arKordag(logg, '2026-09-25', N).kor, false);
  assert.equal(arKordag(logg, '2026-09-26', N).kor, false);
  const tre = arKordag(logg, '2026-09-27', N);
  assert.equal(tre.kor, true);
  assert.equal(arKordag(logg, '2026-09-26', N).nasta, '2026-09-27', 'nästa kördag skrivs ut när det inte är rond');
});

test('en missad dag skjuter inte ronden tre dagar till — fyra dygn är också kördag', () => {
  const logg = [{ kod: 'ROND_KLAR', datum: '2026-09-24' }];
  assert.equal(arKordag(logg, '2026-09-28', N).kor, true);
});

test('utan ROND_KLAR räknas kadensen från senaste rondspåret (ronden 2026-09-21 kördes för hand)', () => {
  const logg = [
    { kod: 'UPPLADDAD', datum: '2026-09-21', annons: 'x' },
    { kod: 'ETIKETT', datum: '2026-09-21', annons: 'x' },
    { kod: 'FORSLAG', datum: '2026-09-21', annons: 'x' },
  ];
  const s = sistaRond(logg);
  assert.equal(s.datum, '2026-09-21');
  assert.match(s.kalla, /rondspår/);
  assert.equal(arKordag(logg, '2026-09-23', N).kor, false, 'två dygn: ingen rond');
  assert.equal(arKordag(logg, '2026-09-24', N).kor, true, 'tre dygn: rond');
});

test('UPPLADDAD är inte ett rondspår — uppladdaren är ett annat kommando', () => {
  assert.equal(sistaRond([{ kod: 'UPPLADDAD', datum: '2026-09-21' }]), null);
});

test('senaste ROND_KLAR vinner över äldre, oavsett ordning i filen', () => {
  const logg = [{ kod: 'ROND_KLAR', datum: '2026-09-27' }, { kod: 'ROND_KLAR', datum: '2026-09-24' }];
  assert.equal(sistaRond(logg).datum, '2026-09-27');
});

test('en trasig kadens stoppar i stället för att köra varje dag', () => {
  assert.throws(() => arKordag([], '2026-09-23', 0), /heltal/);
  assert.throws(() => arKordag([], '2026-09-23', 'tre'), /heltal/);
});
