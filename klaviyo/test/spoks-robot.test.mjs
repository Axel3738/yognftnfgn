// klaviyo/spoks/robot: roboten som schemalägger i Spoks-appen (Axels order 2026-09-30). Bara de
// rena delarna testas här; klicken mäts mot riktiga Spoks och kontrolleras med search_campaigns.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pillVantat, inloggningslank, SEGMENTTEXT, lasMottagaraktivitet, larmLeverans } from '../spoks/robot/spoks-robot.mjs';
import { SKICKA_NU, spkiHashar } from '../spoks/robot/webblasare.mjs';
import { manadssteg } from '../spoks/robot/datumvaljare.mjs';

test('pillVantat: dagen utan nolla, månaden med, som Spoks pill skriver den', () => {
  assert.equal(pillVantat({ datum: '2026-10-01', tid: '18:00' }), '1.10 kl 18:00');
  assert.equal(pillVantat({ datum: '2026-09-30', tid: '18:00' }), '30.09 kl 18:00');
  assert.equal(pillVantat({ datum: '2026-12-08', tid: '09:00' }), '8.12 kl 09:00');
  // Mätt 2026-09-30: "Kommer att publiceras tors. 1.10 kl 18:00 CEST (UTC+2)".
  assert.ok('Kommer att publiceras tors. 1.10 kl 18:00 CEST (UTC+2)'.includes(pillVantat({ datum: '2026-10-01', tid: '18:00' })));
});

test('SKICKA_NU: roboten vägrar varje knapp som skickar direkt, på svenska och engelska', () => {
  for (const t of ['Publicera nu', 'publicera nu', 'Skicka nu', 'Send now', 'Publish now']) assert.ok(SKICKA_NU.test(t), t);
  for (const t of ['Planera', 'Tillämpa', 'Uppdatera inlägg', 'TITTA IGENOM', 'Skicka test']) assert.ok(!SKICKA_NU.test(t), t);
});

test('SEGMENTTEXT: segmentets namn och antal ur Till-fältet, aldrig ett längre namn', () => {
  assert.deepEqual('SEG_samtycke (3018)'.match(SEGMENTTEXT).slice(1), ['SEG_samtycke', '3018']);
  assert.deepEqual('All subscribed (3018)'.match(SEGMENTTEXT).slice(1), ['All subscribed', '3018']);
  assert.equal('SEG_kopare_30d (183)'.match(SEGMENTTEXT)[1], 'SEG_kopare_30d');
  assert.ok(!'SEG_kopare_30d (183)'.startsWith('SEG_kopare ('));
  assert.equal('Välj ett segment'.match(SEGMENTTEXT), null);
});

test('manadssteg: klick på nästa månad från det datumväljaren visar', () => {
  assert.equal(manadssteg('sep.', 2026, '2026-10-01'), 1);
  assert.equal(manadssteg('sep.', 2026, '2026-09-30'), 0);
  assert.equal(manadssteg('okt.', 2026, '2026-12-29'), 2);
  assert.equal(manadssteg('dec.', 2026, '2027-01-05'), 1);
  assert.equal(manadssteg('okt.', 2026, '2026-09-30'), -1);
  assert.throws(() => manadssteg('september', 2026, '2026-10-01'), /Okänd månad/);
});

test('inloggningslank: länken ur Spoks mejl, quoted-printable avkodad, bara auth.links.spoks.com', () => {
  const ra = [
    'Content-Type: text/html; charset=us-ascii',
    'Content-Transfer-Encoding: quoted-printable',
    '',
    '<a href=3D"https://auth.links.spoks.com/__/auth/links?link=3Dhttps://spoks-app.f=',
    'irebaseapp.com/__/auth/action?apiKey%3Dabc%26mode%3DsignIn%26oobCode%3Dxyz">Sign in to Spoks</a>',
    '<img src=3D"https://u1.ct.sendgrid.net/wf/open?upn=3Dq">',
  ].join('\r\n');
  assert.equal(inloggningslank(ra), 'https://auth.links.spoks.com/__/auth/links?link=https://spoks-app.firebaseapp.com/__/auth/action?apiKey%3Dabc%26mode%3DsignIn%26oobCode%3Dxyz');
  assert.equal(inloggningslank('<a href="https://evil.example/__/auth/links?oobCode=1">x</a>'), null);
});

test('lasMottagaraktivitet: talen ur fliken, bara de fristående raderna', () => {
  // Matstrumpors K01, fliken Mottagaraktivitet 2026-09-30 10:3x CEST (mottagarlistan utelämnad).
  const rader = [
    'Öppnad 920 31% av levererade', 'Avprenumererad 28 1% av levererade', 'Markerad som skräppost 0 0% av levererade',
    'Levererad 2 983Öppnad 920Klickade 15Konverterad 2Återställd 7Avprenumererad 28Markerad som skräppost 0Överhoppad 0',
    'Levererad 2 983', 'Öppnad 920', 'Klickade 15', 'Konverterad 2', 'Återställd 7', 'Avprenumererad 28',
    'Markerad som skräppost 0', 'Överhoppad 0',
  ];
  assert.deepEqual(lasMottagaraktivitet(rader), {
    levererad: 2983, oppnad: 920, klickade: 15, konverterad: 2, studsade: 7, avregistrerade: 28, spam: 0, overhoppade: 0,
  });
  assert.equal(lasMottagaraktivitet(['Statistik', 'Översikt']).avregistrerade, null);
});

test('larmLeverans: över 1 % avregistrerade eller över 0,3 % spam, aldrig på saknade tal', () => {
  assert.deepEqual(larmLeverans({ levererad: 2983, avregistrerade: 28, spam: 0 }), { avregProcent: 0.94, spamProcent: 0, larm: false });
  assert.equal(larmLeverans({ levererad: 2983, avregistrerade: 29, spam: 0 }).larm, false); // 0,97 %
  assert.deepEqual(larmLeverans({ levererad: 2983, avregistrerade: 30, spam: 0 }), { avregProcent: 1.01, spamProcent: 0, larm: true });
  assert.equal(larmLeverans({ levererad: 1000, avregistrerade: 10, spam: 0 }).larm, false); // exakt 1 % är inte över
  assert.equal(larmLeverans({ levererad: 1000, avregistrerade: 11, spam: 0 }).larm, true);
  assert.equal(larmLeverans({ levererad: 1000, avregistrerade: 0, spam: 4 }).larm, true);
  assert.equal(larmLeverans({ levererad: 1000, avregistrerade: 0, spam: 3 }).larm, false);
  assert.equal(larmLeverans({ levererad: 2983, avregistrerade: null, spam: 0 }).larm, null);
});

test('spkiHashar: tomt för en bundle utan proxyns certifikat, kraschar inte på skräp', () => {
  assert.deepEqual(spkiHashar(''), []);
  assert.deepEqual(spkiHashar('-----BEGIN CERTIFICATE-----\ninte ett cert\n-----END CERTIFICATE-----'), []);
});
