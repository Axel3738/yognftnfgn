// Anmälan via mejl till plattformens utsedda ombud (MatSokker 2026-10-01/02): brödtext utan länkar,
// kontrollen av bilagan ur utkastets RAW och kvittoraden. Inget nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { utanLankar, bilagaUrRaw, kollaBilaga, skickatRad, metaMejlFor, noticePdf, META_OMBUD, SHOPIFY_OMBUD } from '../epostanmalan.mjs';
import { harLankbartOrd } from '../brevpdf.mjs';

test('Meta granskar inte mejl (svaret 2026-10-02), Shopify gör det — mejlvägen är bara Shopifys', () => {
  assert.equal(META_OMBUD.granskar, false);
  assert.match(META_OMBUD.svar, /will not be reviewed unless it is submitted through one of these forms/);
  assert.equal(SHOPIFY_OMBUD.granskar, true);
  assert.equal(SHOPIFY_OMBUD.till, 'legal@shopify.com');
});

test('utanLankar: annonslänkar blir id, domäner blir namn, och "links below" pekar på bilagan', () => {
  assert.equal(utanLankar('see https://www.facebook.com/ads/library/?id=123456'), 'see Ad Library ID 123456');
  assert.equal(utanLankar('run by our page Matstrumpor (links below).'), 'run by our page Matstrumpor (links in the attached notice).');
  // Rättat 2026-10-02: meningen pekade på länkar "nedan" som inte fanns i mejlet (anmälan 6, 7 och 9).
  assert.equal(utanLankar('The original ad and product page are at the links below.'), 'The original ad and product page are linked in the attached notice.');
  assert.equal(utanLankar('on matsokker.shop and https://matstrumpor.se/products/x'), 'on Matsokker and Matstrumpor');
  assert.equal(harLankbartOrd(utanLankar('https://cdn.shopify.com/s/files/1/bevis.png?v=1 och matsokker.shop')), false);
});

test('metaMejlFor: en annons per mejl till Metas ombud, brödtexten utan en enda länk eller domän', () => {
  const a = JSON.parse(readFileSync(new URL('../arenden/KD-2026-004/anmalan/9.json', import.meta.url), 'utf8'));
  const m = metaMejlFor({ arende: 'KD-2026-004', sidnamn: 'MatSokker', sidaId: '1338643506004296', a });
  assert.equal(m.till, META_OMBUD.till);
  assert.match(m.amne, /^Copyright infringement notice 9\/9: ad \d+ by the Facebook Page "MatSokker"$/);
  assert.equal(harLankbartOrd(m.text), false);
  assert.doesNotMatch(m.text, /links below/);
  assert.match(m.text, /Electronic signature: /);
  assert.match(m.pdf.block[0], /https:\/\/www\.facebook\.com\/ads\/library\//, 'länkarna står i PDF:en');
});

// Ett meddelande som Gmail bygger det: text + PDF-bilaga i base64-rader om 76 tecken.
function mime(pdf, { forspann = 'x' } = {}) {
  const b64 = pdf.toString('base64').match(/.{1,76}/g).join('\r\n');
  return Buffer.from([
    'To: ip@fb.com', 'Subject: test', 'Content-Type: multipart/mixed; boundary="----=_Part_1"', '',
    '------=_Part_1', 'Content-Type: text/plain; charset=UTF-8', '', `Brodtext ${forspann}`, '',
    '------=_Part_1', 'Content-Type: application/pdf; name=notice.pdf', 'Content-Transfer-Encoding: base64',
    'Content-Disposition: attachment; filename=notice.pdf', '', b64, '------=_Part_1--', '',
  ].join('\r\n')).toString('base64url');
}

test('bilagaUrRaw + kollaBilaga: hela RAW och en avskriven bit ger filen, oavsett var biten börjar', () => {
  const pdf = noticePdf({ titel: 'T', block: ['NOTICE 1/1\n\nhttps://www.facebook.com/ads/library/?id=1'], skapad: new Date('2026-10-01T18:00:00Z') });
  for (const forspann of ['x', 'xy', 'xyz']) {
    const raw = mime(pdf, { forspann });
    assert.equal(bilagaUrRaw(raw).filnamn, 'notice.pdf');
    assert.ok(kollaBilaga(raw, pdf).ok, `hela RAW (${forspann})`);
    // Biten börjar en bit före bilagans rubriker, på var och en av de fyra startpunkterna.
    const start = Math.floor((Buffer.from(raw, 'base64url').indexOf('Content-Type: application/pdf') * 4) / 3) - 40;
    for (const d of [0, 1, 2, 3]) assert.ok(kollaBilaga(raw.slice(start + d), pdf).ok, `bit från ${start + d}`);
  }
  assert.throws(() => bilagaUrRaw(Buffer.from('ingen bilaga här').toString('base64url')), /ingen PDF-bilaga/);
});

test('kollaBilaga: ett avskriftsfel blir några få tecken, fel bilaga blir en lång rad — aldrig OK', () => {
  const pdf = noticePdf({ titel: 'A', block: ['NOTICE 1/2\n\nOne ad.'], skapad: new Date('2026-10-01T18:00:00Z') });
  const annan = noticePdf({ titel: 'B', block: ['NOTICE 2/2\n\nAnother ad, other words.'], skapad: new Date('2026-10-01T18:00:00Z') });
  const raw = mime(pdf);
  // O mot 0 i RAW-kopian (2026-10-02, utkast 9): ett tecken i bilagans del.
  const i = raw.length - 300;
  const fel = raw.slice(0, i) + (raw[i] === 'A' ? 'B' : 'A') + raw.slice(i + 1);
  const r = kollaBilaga(fel, pdf);
  assert.equal(r.ok, false);
  assert.ok(r.olika >= 1 && r.olika <= 3, `få tecken: ${r.olika}`);
  const s = kollaBilaga(mime(annan), pdf);
  assert.equal(s.ok, false);
  assert.ok(s.olika > 20, `fel bilaga: ${s.olika}`);
  assert.equal(s.shaFil, createHash('sha256').update(pdf).digest('hex'));
});

test('skickatRad: ett mejl skickas aldrig två gånger', () => {
  const rader = [{ namn: 'meta-1', gmail_id: 'a1' }];
  const r = skickatRad(rader, { namn: 'meta-2', till: 'ip@fb.com', gmail: 'b2', trad: 't2', sha256: 'abc', nar: '2026-10-02T07:00:00Z' });
  assert.deepEqual(r, { namn: 'meta-2', till: 'ip@fb.com', gmail_id: 'b2', trad: 't2', sha256: 'abc', nar: '2026-10-02T07:00:00Z' });
  assert.throws(() => skickatRad(rader, { namn: 'meta-1', till: 'ip@fb.com', gmail: 'c3', nar: 'x' }), /redan skickad \(Gmail a1\)/);
  assert.throws(() => skickatRad(rader, { namn: 'meta-3', till: 'ip@fb.com', nar: 'x' }), /kräver namn och gmail-id/);
});
