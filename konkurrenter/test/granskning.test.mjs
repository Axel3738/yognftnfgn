// Tester för granskningsappen (Axels Ja/Nej per anmälan + mejlet) — rena funktioner, inget nät.
import test from 'node:test';
import assert from 'node:assert/strict';

import { metaRad, byggBrev } from '../brev.mjs';
import { kortAnmalan, kortMejl, byggGranskning, statusFor, smsText, attGora, sidaHtml, sammanfattning, META_PLATS } from '../granskning.mjs';

const paket = (nr, extra = {}) => ({
  nr, antal: 3, arende: 'KD-TEST-001', plattform: 'facebook', lank: `https://www.facebook.com/ads/library/?id=10${nr}`, annonsNr: nr + 1, exponeringar: 1000 * nr, grund: 'film', filmer: ['Takoverdrag_OB_1_H1', 'Takoverdrag_SP_4_H1'], produkt: 'Taköverdrag',
  bevisbildUrl: `https://cdn.example/bevis-${nr}.png`,
  falt: {
    reporter: { fullName: 'Test Person', email: 'test@example.se' },
    rightsOwner: { name: 'Exempel AB' },
    contentUrls: [`https://www.facebook.com/ads/library/?id=10${nr}`],
    contentDescription: 'The ad\'s video is cut from our own ad films "A", "B" (published by us between 1 and 2 September): 3 still frames from different scenes of the reported video (at 0:06, 0:22, 0:27) are identical to frames of our films (perceptual-hash distance 1, 6, 1/64), and 59% of the reported video\'s sampled frames match our films frame for frame.',
    originalWorkUrls: ['https://example.se/products/x'],
    declarations: ['I have a good faith belief …', 'The information … is accurate.', 'I declare, under penalty of perjury …'],
    signature: 'Test Person',
  },
  ...extra,
});

const granskningMed = (n = 3) => {
  const kort = Array.from({ length: n }, (_, i) => kortAnmalan({ nr: i + 1 }, paket(i + 1)));
  kort.push({ nyckel: 'mejl', typ: 'mejl', version: 'm1' });
  return { arende: 'KD-TEST-001', kort };
};
const ja = (k, not = '') => ({ svar: 'ja', version: k.version, not, nar: '2026-09-29T12:00:00Z' });
const nej = (k, not = '') => ({ svar: 'nej', version: k.version, not, nar: '2026-09-29T12:00:00Z' });

test('metaRad: alla, några, en och ingen — samma mening som brevet alltid haft för alla', () => {
  assert.equal(metaRad({ n: 10, antal: 10, baraAktiva: true }), 'De 10 aktiva annonserna anmäls samtidigt till Meta (Facebook och Instagram) för upphovsrättsintrång, en anmälan per annons.');
  assert.equal(metaRad({ n: 7, antal: 10, baraAktiva: true }), '7 av de 10 aktiva annonserna anmäls samtidigt till Meta (Facebook och Instagram) för upphovsrättsintrång, en anmälan per annons.');
  assert.equal(metaRad({ n: 1, antal: 1 }), 'Den annonsen anmäls samtidigt till Meta (Facebook och Instagram) för upphovsrättsintrång.');
  assert.equal(metaRad({ n: 0, antal: 10 }), '');
  assert.match(metaRad({ n: 3, antal: 10, sprak: 'en', baraAktiva: true }), /^3 of the 10 active ads are being reported at the same time/);
});

test('byggBrev: --anmalan-antal styr meningen, 0 tar bort den', () => {
  const a = { id: 'KD-TEST-001', typ: 'annons', verksamhet: 'Bäverbutiken', deras: { sidnamn: 'X', doman: 'x.se', lang: 'sv' }, anmalan: { antal: 10, baraAktiva: true, rapporter: [] }, bevis: { annonser: [] } };
  const bas = { avsandare: { brand: 'Bäverbutiken', mail: 'contact@example.se' }, foretag: { namn: 'Exempel AB', orgnr: '556000-0000', adress: 'Gatan 1' }, anmalanSamtidigt: true, nu: new Date('2026-09-29T10:00:00Z') };
  assert.ok(byggBrev(a, bas).text.includes('De 10 aktiva annonserna anmäls samtidigt'));
  assert.ok(byggBrev(a, { ...bas, anmalanAntal: 7 }).text.includes('7 av de 10 aktiva annonserna anmäls samtidigt'));
  const utan = byggBrev(a, { ...bas, anmalanAntal: 0 }).text;
  assert.ok(!utan.includes('anmäls samtidigt'), 'ingen anmälan ⇒ ingen mening om att de anmäls');
  assert.ok(utan.includes('anmäla intrånget till Meta'), 'Meta står kvar som villkorad åtgärd');
});

test('kortAnmalan: fälten som formuläret får, svensk sammanfattning, version följer innehållet', () => {
  const k = kortAnmalan({ nr: 1 }, paket(1), { bild: 'bilder/bevis-1.jpg' });
  assert.equal(k.nyckel, 'anmalan-1');
  assert.equal(k.falt.find((f) => f.etikett.startsWith('Ditt namn')).varde, 'Test Person');
  assert.ok(k.falt.find((f) => f.etikett.startsWith('Beskrivning')).varde.length <= 500);
  assert.match(sammanfattning(paket(1)), /klippt ur 2 av våra filmer\. 3 bildrutor ur olika scener \(vid 0:06, 0:22, 0:27\) är identiska med våra, och 59 %/);
  const andrad = kortAnmalan({ nr: 1 }, paket(1, { bevisbildUrl: 'https://cdn.example/ny.png' }));
  assert.notEqual(andrad.version, k.version, 'ny bevisbild = ny version, gamla svar gäller inte');
  assert.equal(kortAnmalan({ nr: 1 }, paket(1, { skapad: 'annan tid' })).version, k.version, 'byggtiden påverkar inte versionen');
});

test('kortMejl: meningen om Meta blir en plats som sidan fyller med rätt antal', () => {
  const a = { id: 'KD-TEST-001', typ: 'annons', verksamhet: 'Bäverbutiken', deras: { sidnamn: 'X', doman: 'x.se', lang: 'sv' }, anmalan: { antal: 3, baraAktiva: true, rapporter: [] }, bevis: { annonser: [] } };
  const brev = byggBrev(a, { avsandare: { brand: 'B', mail: 'contact@example.se' }, foretag: { namn: 'Exempel AB', orgnr: '556000-0000', adress: 'Gatan 1' }, anmalanSamtidigt: true, mottagare: 'info@x.se' });
  const m = kortMejl({ brev, faktura: { nr: 'F-1', brutto: 100, netto: 80, moms: 20, forfaller: '2026-10-09' }, fran: 'axel@example.se', antalByggda: 3, baraAktiva: true });
  assert.ok(m.text.includes(META_PLATS));
  assert.equal(m.meta.length, 4);
  assert.equal(m.meta[3], 'De 3 aktiva annonserna anmäls samtidigt till Meta (Facebook och Instagram) för upphovsrättsintrång, en anmälan per annons.');
  assert.equal(m.fran, 'axel@example.se');
  const senare = kortMejl({ brev: { ...brev, text: brev.text.replace(/\d{1,2}:\d{2}/g, '09:59') }, faktura: { nr: 'F-1', brutto: 100 }, fran: 'axel@example.se', antalByggda: 3, baraAktiva: true });
  assert.equal(senare.version, m.version, 'klockslaget i fristen ändrar inte versionen');
  const dyrare = kortMejl({ brev, faktura: { nr: 'F-1', brutto: 200 }, fran: 'axel@example.se', antalByggda: 3, baraAktiva: true });
  assert.notEqual(dyrare.version, m.version, 'nytt belopp = ny version');
});

test('attGora: ja skickas in, nej med kommentar lyfts, inget skickas två gånger', () => {
  const g = granskningMed(3);
  const [k1, k2, k3, mk] = g.kort;
  const beslut = { svar: { [k1.nyckel]: ja(k1), [k2.nyckel]: nej(k2, 'ruta B är lånad'), [mk.nyckel]: ja(mk) } };
  let r = attGora({ granskning: g, beslut, status: { kort: {} } });
  assert.deepEqual(r.anmalningar, [1]);
  assert.equal(r.nej[0].not, 'ruta B är lånad');
  assert.equal(r.mejl, null, 'mejlet väntar tills alla har svar');
  assert.match(r.mejlVantar, /nr 3/);
  beslut.svar[k3.nyckel] = ja(k3);
  r = attGora({ granskning: g, beslut, status: { kort: { [k1.nyckel]: { lage: 'inskickad' } } } });
  assert.deepEqual(r.anmalningar, [3], 'den inskickade tas inte igen');
  assert.deepEqual(r.mejl, { antal: 2, av: 3 }, 'brevet nämner de två med ja');
  r = attGora({ granskning: g, beslut, status: { kort: { mejl: { lage: 'skickad' }, [k3.nyckel]: { lage: 'pagar' } } } });
  assert.equal(r.mejl, null, 'skickat mejl skickas aldrig igen');
  assert.deepEqual(r.anmalningar, [1], 'pågående tas inte en gång till');
});

test('attGora: ett svar på en äldre version av kortet gäller inte', () => {
  const g = granskningMed(2);
  const [k1] = g.kort;
  const r = attGora({ granskning: g, beslut: { svar: { [k1.nyckel]: { ...ja(k1), version: 'gammal' } } }, status: { kort: {} } });
  assert.deepEqual(r.anmalningar, []);
  assert.deepEqual(r.gamla, [k1.nyckel]);
  assert.deepEqual(r.obesvarade, [1, 2]);
});

test('statusFor: kvitton och skickat brev ur ärendet, pågår och fel ovanpå', () => {
  const a = { anmalan: { rapporter: [{ nr: 1, status: 'inskickad', referens: '123', inskickad: '2026-09-29T12:00:00Z' }, { nr: 2, status: 'utkast' }] }, brev: { mottagare: 'x@y.se', skickat: { nar: '2026-09-29T13:00:00Z', till: 'x@y.se' } } };
  const s = statusFor(a, { pagar: ['anmalan-2', 'anmalan-1'], fel: { 'anmalan-3': 'Meta svarade inte' }, notis: 'hej', sms: 'text', nu: '2026-09-29T14:00:00Z' });
  assert.deepEqual(s.kort['anmalan-1'], { lage: 'inskickad', referens: '123', nar: '2026-09-29T12:00:00Z' }, 'kvittot vinner över pågår');
  assert.equal(s.kort['anmalan-2'].lage, 'pagar');
  assert.equal(s.kort['anmalan-3'].lage, 'fel');
  assert.equal(s.kort.mejl.lage, 'skickad');
  assert.deepEqual(s.sms, { text: 'text' });
});

test('smsText: fakturan som gick ut och antalet som anmäls', () => {
  const mall = 'Faktura {{FAKTURA_NR}} på {{BELOPP}} ({{EXPONERINGAR}} exponeringar), förfallodag {{FORFALLER}}. {{META}} Slut.';
  const f = { nr: 'F-1', brutto: 2516, exponeringar: 20537, forfaller: '2026-10-09' };
  assert.equal(smsText(mall, { faktura: f, n: 10, antal: 10 }), 'Faktura F-1 på 2 516 kr (20 537 exponeringar), förfallodag 9 oktober. De 10 aktiva annonserna anmäls till Meta för upphovsrättsintrång, en anmälan per annons. Slut.');
  assert.match(smsText(mall, { faktura: f, n: 4, antal: 10 }), /4 av de 10 aktiva annonserna anmäls till Meta/);
  assert.equal(smsText(mall, { faktura: f, n: 0, antal: 10 }), 'Faktura F-1 på 2 516 kr (20 537 exponeringar), förfallodag 9 oktober. Slut.');
});

test('sidaHtml: datan bakas in utan att kunna stänga script-blocket', () => {
  const g = byggGranskning({ a: { id: 'KD-TEST-001', deras: { sidnamn: '</script><b>' } }, kort: [] });
  const html = sidaHtml(g, { mall: '<script type="application/json" id="granskning">__GRANSKNING__</script>' });
  assert.ok(!html.slice(0, -'</script>'.length).includes('</script>'), 'ingen tidig </script>');
  assert.equal(JSON.parse(html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '')).deras.sidnamn, '</script><b>');
});
