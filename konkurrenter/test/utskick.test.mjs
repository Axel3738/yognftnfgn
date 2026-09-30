// konkurrenter/test/utskick.test.mjs — det som lärdes när ORVO-brevet gick ut 2026-09-29:
// brevet utan Meta (Axels beslut), den lilla PDF:en (Gmail-anropet), brevet som PDF +
// följetext utan länkar (Gmail-connectorn gör om länkar), säkerhetskontrollen i Metas
// formulär (aldrig ett kvitto) och Cowork-prompten. Inget nät.
import test from 'node:test';
import assert from 'node:assert/strict';
import { inflateSync } from 'node:zlib';

import { byggBrev } from '../brev.mjs';
import { smsText } from '../granskning.mjs';
import { winAnsi, textbredd, radbryt, TextPdf } from '../textpdf.mjs';
import { fakturaLitenPdf } from '../faktura.mjs';
import { brevPdf, foljetext, harLankbartOrd } from '../brevpdf.mjs';
import { kvittoUtfall, coworkPrompt } from '../anmal-skicka.mjs';
import { angraKvittoAnmalan } from '../arenden.mjs';
import { annonsUppfoljning } from '../annonsfall.mjs';
import { bevisStatus } from '../klipp.mjs';

const ARENDE = { id: 'KD-TEST-001', typ: 'annons', verksamhet: 'Bäverbutiken', deras: { sidnamn: 'X', doman: 'x.se', lang: 'sv' }, anmalan: { antal: 10, baraAktiva: true, rapporter: [] }, bevis: { annonser: [] } };
const BAS = { avsandare: { brand: 'Bäverbutiken', mail: 'contact@example.se' }, foretag: { namn: 'Exempel AB', orgnr: '556000-0000', adress: 'Gatan 1' }, nu: new Date('2026-09-29T10:00:00Z') };

/** Allt innehåll i en PDF som text: sidornas strömmar packas upp, resten läses som latin1. */
const pdfText = (buf) => {
  const s = buf.toString('latin1');
  let ut = s;
  for (const m of s.matchAll(/stream\n([\s\S]*?)\nendstream/g)) { try { ut += inflateSync(Buffer.from(m[1], 'latin1')).toString('latin1'); } catch { /* inte komprimerad */ } }
  return ut;
};

test('byggBrev utanMeta: inget om Meta-anmälningar — varken samtidigt, redan anmält eller som hot', () => {
  const med = byggBrev(ARENDE, { ...BAS, anmalanSamtidigt: true }).text;
  assert.ok(med.includes('anmäls samtidigt till Meta'), 'utan flaggan står meningen kvar');
  const utan = byggBrev(ARENDE, { ...BAS, anmalanSamtidigt: true, utanMeta: true }).text;
  assert.ok(!/Meta \(Facebook och Instagram\)|anmäls samtidigt|anmäla intrånget till Meta|anmälda till Meta/.test(utan), utan);
  assert.ok(utan.includes('anmäla intrånget till'), 'de andra åtgärderna står kvar');
  const redan = { ...ARENDE, anmalan: { ...ARENDE.anmalan, rapporter: [{ nr: 1, status: 'inskickad' }] } };
  assert.ok(!/till Meta/.test(byggBrev(redan, { ...BAS, utanMeta: true }).text), 'en inskickad anmälan nämns inte heller');
  const en = byggBrev({ ...ARENDE, deras: { ...ARENDE.deras, lang: 'en', doman: 'x.com' } }, { ...BAS, anmalanSamtidigt: true, utanMeta: true }).text;
  assert.ok(!/reported to Meta|report the infringement to Meta|being reported/.test(en), en);
});

test('sms:et med n = 0 säger ingenting om Meta', () => {
  const mall = 'Faktura {{FAKTURA_NR}} på {{BELOPP}}. {{META}}Slut.';
  const t = smsText(mall, { faktura: { nr: 'F-1', brutto: 2516, valuta: 'SEK', sprak: 'sv', exponeringar: 1, forfaller: '2026-10-09' }, n: 0, antal: 10 });
  assert.ok(!/Meta/.test(t), t);
});

test('winAnsi: svenska tecken rakt av, pilen ersätts, okänt blir ?', () => {
  assert.deepEqual(winAnsi('åäöÅÄÖé'), [0xE5, 0xE4, 0xF6, 0xC5, 0xC4, 0xD6, 0xE9]);
  assert.deepEqual(winAnsi('a ← b'), [0x61, 0x20, 0x3C, 0x2D, 0x20, 0x62], 'brevets ← blev ? (mätt 2026-09-29)');
  assert.deepEqual(winAnsi('– — × ·'), [0x96, 0x20, 0x97, 0x20, 0xD7, 0x20, 0xB7]);
  assert.deepEqual(winAnsi('1 000'), [0x31, 0xA0, 0x30, 0x30, 0x30], 'smalt mellanslag blir hårt mellanslag');
  assert.deepEqual(winAnsi('✗'), [0x3F]);
});

test('textbredd + radbryt: Helveticas mått, belopp bryts aldrig isär', () => {
  assert.equal(textbredd('iii', 10), 6.66);
  assert.ok(textbredd('bdg', 10, { fet: true }) > textbredd('bdg', 10));
  const rader = radbryt('Annonsfilm klippt ur våra filmer: 3 364 exponeringar × CPM 97,9 kr = 2 516 kr', 120, 10);
  assert.ok(rader.length > 1);
  assert.ok(rader.every((r) => textbredd(r, 10) <= 120 + 0.01), JSON.stringify(rader));
  assert.ok(rader.some((r) => r.includes('3 364')) && rader.some((r) => r.includes('2 516 kr')), JSON.stringify(rader));
  const url = radbryt('https://www.facebook.com/ads/library/?id=2011809009499730&x=1', 80, 10);
  assert.ok(url.length > 1 && url.join('') === 'https://www.facebook.com/ads/library/?id=2011809009499730&x=1', 'en för lång länk bryts utan att tappa tecken');
});

test('TextPdf: giltig struktur — xref pekar på varje objekt, startxref på xref, länkar blir /URI', () => {
  const p = new TextPdf();
  p.text(50, 60, 'Hej (världen) \\ å', { storlek: 12 }).lank(50, 50, 100, 12, 'https://example.se/a?b=1');
  p.nySida().text(50, 60, 'sida två');
  const buf = p.bytes({ titel: 'Test' });
  const s = buf.toString('latin1');
  assert.ok(s.startsWith('%PDF-1.4'));
  const xref = Number(s.match(/startxref\n(\d+)/)[1]);
  assert.ok(s.slice(xref).startsWith('xref'));
  const poster = s.slice(xref).split('\n').slice(3).filter((r) => / 00000 n $/.test(r)).map((r) => Number(r.slice(0, 10)));
  poster.forEach((off, i) => assert.ok(s.slice(off).startsWith(`${i + 1} 0 obj`), `objekt ${i + 1}`));
  assert.match(s, /\/Count 2/);
  assert.match(s, /\/URI \(https:\/\/example\.se\/a\?b=1\)/);
  assert.ok(pdfText(buf).includes('(Hej \\(v\\344rlden\\) \\\\ \\345) Tj'), 'parenteser, backslash och å escapas');
});

test('fakturaLitenPdf: ORVO-storlek på några kB, beloppen och IBAN i klartext', () => {
  const rader = Array.from({ length: 24 }, (_, i) => ({ beskrivning: `Annonsfilm klippt ur våra annonsfilmer (Takoverdrag_OB_1_H1, CaraShellRoof_OB_101_H1) — https://www.facebook.com/ads/library/?id=20118090094997${i}: 1 000 exponeringar × CPM 97,9 kr`, antal: 1, apris: 98, belopp: 98, grund: 'exponeringar' }));
  const f = { nr: 'F-KD-TEST-001-1', datum: '2026-09-29', forfaller: '2026-10-09', referens: 'KD-TEST-001', valuta: 'SEK', sprak: 'sv', betalvillkor_dagar: 10, berakning: 'exponeringar', cpm: { sek: 97.9, text: 'Bäverbutiken, Meta', period: 'last_30d' }, saljare: { namn: 'Exempel AB', orgnr: '556000-0000', momsreg: 'SE556000000001', adress: 'Gatan 1, 111 11 Stad', mail: 'contact@example.se', iban: 'SE35 9710 0000 0971 0348 9566' }, kopare: { namn: 'Kopian AB', orgnr: '559000-0000', doman: 'x.se', mail: 'info@x.se' }, rader, netto: 2352, momsProcent: 25, moms: 588, brutto: 2940, omvand: false };
  const buf = fakturaLitenPdf(f, { skapad: new Date('2026-09-29T10:00:00Z') });
  assert.ok(buf.length < 12_000, `${buf.length} byte — Chromiums version var 72 kB (mätt 2026-09-29)`);
  const t = pdfText(buf);
  for (const s of ['F-KD-TEST-001-1', '2 940 kr', '2 352 kr', 'SE35 9710 0000 0971 0348 9566', 'Att betala', 'Kopian AB']) assert.ok(t.includes(s), `saknar "${s}"`);
  assert.ok(!/HeadlessChrome/.test(t));
  assert.match(t, /\/Count [2-4]/, 'raderna går över flera sidor');
});

test('brevPdf: texten ordagrant, länkarna klickbara, pilen utan frågetecken', () => {
  const text = 'Till X\n\n• Annonser:\n    https://www.facebook.com/ads/library/?id=1 ← Film_A\n\nMed vänlig hälsning';
  const buf = brevPdf({ amne: 'Ämne', text, till: 'info@x.se', fran: 'contact@example.se', avsandare: { namn: 'Exempel AB', adress: 'Gatan 1', mail: 'contact@example.se' }, datum: '2026-09-29', arende: 'KD-TEST-001' });
  const t = pdfText(buf);
  assert.match(t, /\/URI \(https:\/\/www\.facebook\.com\/ads\/library\/\?id=1\)/);
  assert.ok(t.includes('<- Film_A'), 'pilen blir <-');
  assert.ok(!t.includes('? Film_A'));
});

test('följetexten bär ingen länk eller domän — Gmail-connectorn gör om dem (mätt 2026-09-29)', () => {
  for (const sprak of ['sv', 'en']) {
    const t = foljetext({ sprak, mottagare: 'ORVO', arende: 'KD-2026-001', fakturaNr: 'F-KD-2026-001-1', belopp: '2 516 kr', frist: 'torsdag 1 oktober 2026 kl. 20:08 (svensk tid)', avsandare: { namn: 'Stonebite Ecom AB', adress: 'Stenkolsgatan 1B, 417 07 Göteborg', mail: 'contact@stonebite.org' } });
    assert.equal(harLankbartOrd(t), false, t);
    assert.ok(t.includes('KD-2026-001') && t.includes('F-KD-2026-001-1'));
  }
  assert.equal(harLankbartOrd('ansvarig för orvo.se'), true);
  assert.equal(harLankbartOrd('org.nr 559576-2401'), true, '"org.nr" blev en länk till .nr-domänen');
  assert.equal(harLankbartOrd('se https://x'), true);
  assert.equal(harLankbartOrd('svara till contact@stonebite.org'), false, 'en e-postadress är ingen länk');
});

test('kvittoUtfall: säkerhetskontrollen är aldrig ett kvitto', () => {
  assert.equal(kvittoUtfall('Your full name … Security check A security check is required to proceed. Cancel Submit … Electronic signature'), 'sakerhetskontroll');
  assert.equal(kvittoUtfall('Tell us more about what you’re reporting and submit your report … Electronic signature Axel'), 'vantar', 'formuläret kvar = inget kvitto (så lästes anmälan 1 fel)');
  assert.equal(kvittoUtfall('Thanks for your report. Your report number is 1234567890.'), 'bekraftad');
  assert.equal(kvittoUtfall('Thanks for your report … Electronic signature'), 'vantar', 'tack-ord med formuläret kvar räknas inte');
});

test('angraKvittoAnmalan: anmälan blir utkast igen, historiken säger varför, bara kvitterade går', () => {
  const a = { id: 'KD-TEST-001', status: 'ny', historik: [], anmalan: { rapporter: [{ nr: 1, status: 'inskickad', referens: null, inskickad: '2026-09-29T15:13:41Z', kvitto: 'x.png', kvittoText: 'formuläret' }, { nr: 2, status: 'utkast' }], klar: null } };
  const upp = angraKvittoAnmalan(a, { nr: 1, skal: 'säkerhetskontroll', nu: '2026-09-29T15:17:00Z' });
  assert.deepEqual(upp.anmalan.rapporter[0], { nr: 1, status: 'utkast', referens: null, inskickad: null });
  assert.match(upp.historik.at(-1).not, /INTE inskickad.*säkerhetskontroll/);
  assert.throws(() => angraKvittoAnmalan(a, { nr: 2, skal: 'x' }), /inte som inskickad/);
  assert.throws(() => angraKvittoAnmalan(a, { nr: 9, skal: 'x' }), /ingen anmälan 9/);
});

test('annonsUppfoljning: annonsfallet följs upp i annonsbiblioteket, aldrig på sajten — och oläst är aldrig "borta"', () => {
  const bevis = [{ lank: 'https://www.facebook.com/ads/library/?id=11', aktiv: true }, { lank: 'https://www.facebook.com/ads/library/?id=22', aktiv: true }, { lank: 'https://www.facebook.com/ads/library/?id=33', aktiv: false }];
  const kvar = annonsUppfoljning(bevis, { annonser: [{ id: '11', aktiv: true }, { id: '22', aktiv: false }, { id: '99', aktiv: true }], fel: [] });
  assert.equal(kvar.kvar, true); assert.match(kvar.detalj, /1 av 2 anmälda annonser är fortfarande aktiva/); assert.deepEqual(kvar.aktiva, ['11']);
  const borta = annonsUppfoljning(bevis, { annonser: [{ id: '11', aktiv: false }], fel: [] });
  assert.equal(borta.kvar, false, 'avstängd eller borttagen = borta');
  assert.equal(annonsUppfoljning(bevis, { annonser: [], fel: ['HTTP 403'] }).kvar, null, 'oläst är okänt, aldrig åtgärdat');
  assert.equal(annonsUppfoljning(bevis, null).kvar, null);
  assert.equal(annonsUppfoljning([{ lank: 'x', aktiv: false }], { annonser: [] }).kvar, null, 'inga aktiva i bevisen ⇒ okänt');
});

test('--lagg-till: en kandidatfilm är obevisad tills klippen hittat rutor ur våra filmer', () => {
  const kandidat = { nr: 4, lank: 'https://www.facebook.com/ads/library/?id=1619427313174835', video: true, text: null, bilder: [], kandidat: 'film' };
  assert.equal(bevisStatus(kandidat).bevisad, false, 'aldrig med i brev, faktura eller anmälan före --klipp');
  assert.equal(bevisStatus({ ...kandidat, klippStatus: 'ej_bevisad', klippFel: 'inga rutor' }).bevisad, false);
  assert.deepEqual(bevisStatus({ ...kandidat, klipp: { antal: 3 } }).grund, 'film');
});

test('coworkPrompt: exakt de godkända fälten, och säkerhetskontrollen lämnas till Axel', () => {
  const v = { rattighetshavare: 'Stonebite Ecom AB', urls: 'https://www.facebook.com/ads/library/?id=1', original: 'https://www.facebook.com/ads/library/?id=2', beskrivning: 'Its video is cut from our own ad films. Ref KD-TEST-001 1/2.', namn: 'Axel Odhner', epost: 'axel@example.se', signatur: 'Axel Odhner' };
  const p = coworkPrompt({ arende: 'KD-TEST-001', sida: 'ORVO', land: 'Sweden', anmalningar: [{ nr: 1, antal: 2, formular: 'https://www.facebook.com/help/contact/1758255661104383', v }, { nr: 2, antal: 2, formular: 'https://www.facebook.com/help/contact/1758255661104383', v: { ...v, urls: 'https://www.facebook.com/ads/library/?id=3' } }] });
  for (const s of [v.urls, v.original, v.beskrivning, 'https://www.facebook.com/ads/library/?id=3', 'ANMÄLAN 1 av 2', 'ANMÄLAN 2 av 2', 'axel@example.se']) assert.ok(p.includes(s), `saknar ${s}`);
  assert.match(p, /Säkerhetskontroll.*gör den du/);
  assert.match(p, /Försök aldrig lösa den själv/);
  // Cowork 2026-09-30: Claude in Chrome är av som standard i varje ny chatt. Prompten säger då exakt vad Axel slår på.
  assert.match(p, /Slå på Claude in Chrome i menyn Connectors/);
  assert.ok(p.indexOf('FÖRST') < p.indexOf('REGLER'), 'kontrollen av Chrome ska stå före reglerna');
  // Cowork 2026-09-30: Gmail i Axels Chrome var ett annat konto, och Metas mejl var på svenska.
  assert.match(p, /Verifiera din e-postadress/);
  assert.match(p, /Jag behöver koden till anmälan <nr>/);
});
