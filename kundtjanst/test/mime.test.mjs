// Tester för MIME-tolkningen. Inget nätverk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { avkodaRubrik, avkodaQuotedPrintable, tolkaRubriker, tolkaContentType, tolkaAdress, htmlTillText, taBortCitat, normaliseraAmne, tolkaMejl, raUtf8, tolkaDatum } from '../mime.mjs';

const FIXTUR = join(dirname(fileURLToPath(import.meta.url)), 'fixturer', 'demo', 'demobutiken');
const las = (mapp, fil) => readFileSync(join(FIXTUR, mapp, fil), 'latin1');

test('RFC 2047: B- och Q-kodade rubriker blir läsbara, även ihopslagna ord', () => {
  assert.equal(avkodaRubrik('=?UTF-8?B?QsO2cmplIMOFa2Vzc29u?='), 'Börje Åkesson');
  assert.equal(avkodaRubrik('=?UTF-8?Q?Vill_returnera_=E2=80=93_=C3=A5ngerr=C3=A4tt?='), 'Vill returnera – ångerrätt');
  assert.equal(avkodaRubrik('Var =?UTF-8?Q?=C3=A4r?= min order #1042?'), 'Var är min order #1042?');
  assert.equal(avkodaRubrik('=?ISO-8859-1?Q?F=E5r_jag?= =?ISO-8859-1?Q?_svar=3F?='), 'Får jag svar?');
});

test('rå UTF-8 i en rubrik (mot standarden) rättas, korrekt text lämnas', () => {
  assert.equal(raUtf8('tvÃ¥ gÃ¥nger'), 'två gånger');
  assert.equal(raUtf8('två gånger'), 'två gånger');
  assert.equal(raUtf8('plain ascii'), 'plain ascii');
});

test('quoted-printable: =XX och mjuka radbrytningar', () => {
  const b = avkodaQuotedPrintable('anv=C3=A4nda min =C3=A5nger=\r\nr=C3=A4tt');
  assert.equal(new TextDecoder().decode(b), 'använda min ångerrätt');
  assert.equal(new TextDecoder().decode(avkodaQuotedPrintable('a_b', { rubrik: true })), 'a b');
});

test('rubriker veckas ihop och upprepade blir listor', () => {
  const r = tolkaRubriker('Subject: en lång\r\n rubrik\r\nReceived: a\r\nReceived: b\r\nX-Tom:');
  assert.equal(r.get('subject'), 'en lång rubrik');
  assert.deepEqual(r.get('received'), ['a', 'b']);
  assert.equal(r.get('x-tom'), '');
});

test('content-type med parametrar och citerade värden', () => {
  const ct = tolkaContentType('multipart/alternative; boundary="000000000000abcdef"; charset=utf-8');
  assert.equal(ct.typ, 'multipart/alternative');
  assert.equal(ct.parametrar.boundary, '000000000000abcdef');
  assert.equal(ct.parametrar.charset, 'utf-8');
  assert.equal(tolkaContentType('').typ, 'text/plain');
});

test('adresser i tre former', () => {
  assert.deepEqual(tolkaAdress('Anna Karlsson <Anna.Karlsson@Gmail.com>'), { namn: 'Anna Karlsson', adress: 'anna.karlsson@gmail.com' });
  assert.deepEqual(tolkaAdress('"James Miller" <james@outlook.com>'), { namn: 'James Miller', adress: 'james@outlook.com' });
  assert.deepEqual(tolkaAdress('ola@online.no'), { namn: '', adress: 'ola@online.no' });
});

test('HTML blir text med radbrytningar och avkodade entiteter', () => {
  const t = htmlTillText('<html><body><p>Hej,</p><p>Produkten kom <b>trasig</b> &ndash; locket &auml;r sprucket.</p><script>x()</script></body></html>');
  assert.equal(t, 'Hej,\nProdukten kom trasig – locket är sprucket.');
});

test('citerade svar klipps bort — svenska, engelska och Outlook-formen', () => {
  assert.equal(taBortCitat('Nytt svar här.\n\nDen 9 sep. 2026 kl. 14:00 skrev Demobutiken <hello@x.se>:\n> gammalt'), 'Nytt svar här.');
  assert.equal(taBortCitat('Reply.\n\nOn Tue, Sep 8, 2026 at 10:00 AM Support <s@x.se> wrote:\n> old'), 'Reply.');
  assert.equal(taBortCitat('Svar\n-----Original Message-----\nFrom: x'), 'Svar');
  assert.equal(taBortCitat('Bara nytt\nutan citat'), 'Bara nytt\nutan citat');
});

test('ämnesnyckeln tar bort Re/Sv/Fwd/VS i alla kombinationer', () => {
  assert.equal(normaliseraAmne('Re: Sv: Fwd: Var är min order?'), 'var är min order?');
  assert.equal(normaliseraAmne('VS: Retur'), 'retur');
  assert.equal(normaliseraAmne('Retur'), 'retur');
});

test('datumrubriken tolkas, med och utan kommentar', () => {
  assert.equal(tolkaDatum('Wed, 09 Sep 2026 10:15:00 +0200 (CEST)').toISOString(), '2026-09-09T08:15:00.000Z');
  assert.equal(tolkaDatum('inte ett datum'), null);
});

test('hela fixturen tolkas: 8bit, QP, base64-HTML, multipart, referenser', () => {
  const qp = tolkaMejl(las('inkorg', '05-retur-qp.eml'));
  assert.equal(qp.fran.namn, 'Börje Åkesson');
  assert.equal(qp.amne, 'Vill returnera – ångerrätt');
  assert.match(qp.text, /använda min ångerrätt/);
  assert.equal(qp.datum.toISOString(), '2026-09-12T09:20:00.000Z');

  const html = tolkaMejl(las('inkorg', '04-skadad-html-base64.eml'));
  assert.match(html.text, /Produkten kom trasig – locket är sprucket \(order #1045\)/);

  const multi = tolkaMejl(las('inkorg', '11-fel-vara-multipart.eml'));
  assert.match(multi.text, /^Hej, jag fick fel storlek i paketet \(order #1044\)\. Beställde L men fick M\./);

  const svar = tolkaMejl(las('inkorg', '12-wismo-svar-fran-kund.eml'));
  assert.deepEqual(svar.references, ['<m1@gmail.com>', '<s1@demobutiken.se>']);
  assert.equal(svar.messageId, '<m12@gmail.com>');
  assert.equal(svar.text, 'Tack för svaret, men spårningen har inte rört sig på tre dagar. Fortfarande inget paket.');

  const auto = tolkaMejl(las('inkorg', '08-autosvar.eml'));
  assert.equal(auto.autosvar, true);
  const nyhetsbrev = tolkaMejl(las('inkorg', '09-nyhetsbrev.eml'));
  assert.equal(nyhetsbrev.listmejl, true);

  const raUtf = tolkaMejl(las('inkorg', '07-dubbel-debitering.eml'));
  assert.equal(raUtf.amne, 'Ni har dragit pengar två gånger');
  assert.match(raUtf.text, /två gånger för order 1050/);

  // Varje fixturfil går att tolka utan att kasta.
  for (const mapp of ['inkorg', 'skickat']) for (const f of readdirSync(join(FIXTUR, mapp))) assert.ok(tolkaMejl(las(mapp, f)).fran.adress, `${mapp}/${f} saknar avsändare`);
});
