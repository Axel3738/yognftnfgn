// Tester för autosvaret (kundtjanst/autosvar.mjs + autosvar/*). Inget nät:
// en falsk brevlåda (samma API som kundtjanst/brevlada.mjs), en falsk Shopify
// och en falsk 17TRACK. Järnreglerna (Axels spec 2026-09-21) står som egna
// tester — bryts en av dem ska det synas här, inte i en kunds inkorg.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { korBrand, harForbjudet, byggTrad } from '../autosvar.mjs';
import { HINK, hinka, beslut, harTvistord, arArg, enkelTyp } from '../autosvar/hinkar.mjs';
import { skrivEnkelt, skrivArgt, valjSprak, fornamn, signatur, mallar, SPRAK, datumText, xNyckelFor } from '../autosvar/svar.mjs';
import { hamtaFakta, valjOrder, sparningslank, leveransfonster, senasteSkanning } from '../autosvar/fakta.mjs';
import { lasLogg, minne, redanAutosvar, loggfil } from '../autosvar/logg.mjs';
import { renderaDiscord, renderaSvensk, orsakEn } from '../autosvar/rapport.mjs';
import { tolkaMejl } from '../mime.mjs';
import { normaliseraOrder } from '../shopify.mjs';
import { klassificera } from '../klassificering.mjs';
import { korkonfig, upptackBrands } from '../brands.mjs';
import { bavernummer } from '../../sparning/bavernummer.mjs';

// ------------------------------------------------------------------ fixturer

const NU = new Date('2026-09-21T12:00:00Z');
const SUPPORT = 'kundsupport@baverbutiken.se';

/** Ett råmejl. `timmarSedan` räknas från NU. */
function ra({ fran, till = SUPPORT, amne, text, id, refs = [], timmarSedan = 2, extra = '' }) {
  const d = new Date(NU.getTime() - timmarSedan * 3_600_000);
  // Webbmejlen läser bytes som latin1 (webmail.mjs hamtaRa) och mime.mjs avkodar
  // med charset — fixturen måste därför vara UTF-8-bytes sedda som latin1.
  return Buffer.from(`From: ${fran}\r\nTo: ${till}\r\nSubject: ${amne}\r\nDate: ${d.toUTCString()}\r\nMessage-ID: ${id}\r\n${refs.length ? `References: ${refs.join(' ')}\r\nIn-Reply-To: ${refs[refs.length - 1]}\r\n` : ''}${extra}Content-Type: text/plain; charset=utf-8\r\n\r\n${text}\r\n`, 'utf8').toString('latin1');
}

/** Falsk brevlåda — samma metoder som Brevlada, med ett litet IMAP-liknande minne. */
class FalskBrevlada {
  constructor({ INBOX = [], Sent = [], Drafts = [] } = {}) {
    // Egna kopior: flagga() ändrar objekten, och fixturerna delas mellan testerna.
    this.mappar = { INBOX: INBOX.map((m) => ({ ...m })), Sent: Sent.map((m) => ({ ...m })), Drafts: Drafts.map((m) => ({ ...m })) };
    this.anrop = [];
    this.nastaUid = 1000;
    this.utloggad = false;
  }
  rad(m) {
    const t = tolkaMejl(m.ra, { uid: m.uid });
    return { uid: m.uid, amne: t.amne, fran: t.fran.namn || t.fran.adress, franAdress: t.fran.adress, datum: t.datum?.toISOString() ?? '', storlek: '2 KB', last: false, flaggad: Boolean(m.flaggad), bilaga: Boolean(m.bilaga) };
  }
  mapp(namn) {
    if (!(namn in this.mappar)) throw Object.assign(new Error(`Mappen ${namn} finns inte i webbmejlen.`), { kod: 'MAPP_SAKNAS' });
    return this.mappar[namn];
  }
  async lista({ mapp = 'INBOX', antal = 50 } = {}) {
    this.anrop.push(['lista', mapp]);
    const rader = [...this.mapp(mapp)].sort((a, b) => b.uid - a.uid).slice(0, antal).map((m) => this.rad(m));
    return { mapp, sida: 1, sidor: 1, totalt: rader.length, olasta: 0, rader };
  }
  async las(uid, { mapp = 'INBOX' } = {}) {
    this.anrop.push(['las', mapp, uid]);
    const m = this.mapp(mapp).find((x) => x.uid === Number(uid));
    if (!m) throw new Error(`Roundcube viewsource gav HTTP 404 (steg 5) för uid ${uid} i ${mapp}.`);
    return { uid: m.uid, mapp, ra: m.ra };
  }
  async sok(fraga, { mapp = 'INBOX', max = 50 } = {}) {
    this.anrop.push(['sok', mapp, fraga]);
    const ord = fraga.toLowerCase().split(/\s+/);
    const traffar = [];
    for (const m of [...this.mapp(mapp)].sort((a, b) => b.uid - a.uid)) {
      const t = tolkaMejl(m.ra, { uid: m.uid });
      // Roundcubes listkolumn visar mottagaren i Sent/Drafts och avsändaren i INBOX.
      const visad = mapp === 'INBOX' ? t.fran : (t.till[0] ?? { namn: '', adress: '' });
      const ho = `${t.amne} ${visad.namn} ${visad.adress}`.toLowerCase();
      if (ord.every((o) => ho.includes(o))) traffar.push({ ...this.rad(m), fran: visad.namn || visad.adress, franAdress: visad.adress });
      if (traffar.length >= max) break;
    }
    return { mapp, fraga, lasta: this.mapp(mapp).length, sidorLasta: 1, sidor: 1, traffar, klippt: false };
  }
  async svara(uid, { mapp = 'INBOX', text, utkast = false } = {}) {
    this.anrop.push(['svara', uid, utkast ? 'utkast' : 'skickat']);
    const m = this.mapp(mapp).find((x) => x.uid === Number(uid));
    if (!m) throw new Error('uid saknas');
    const t = tolkaMejl(m.ra, { uid: m.uid });
    if (!String(text).trim()) throw new Error('svara: texten är tom');
    const nyUid = this.nastaUid++;
    const svar = { uid: nyUid, ra: ra({ fran: `Kundsupport <${SUPPORT}>`, till: t.fran.adress, amne: `Re: ${t.amne}`, text, id: `<svar-${nyUid}@baverbutiken.se>`, refs: [...t.references, t.messageId], timmarSedan: 0 }), text };
    this.mappar[utkast ? 'Drafts' : 'Sent'].push(svar);
    return { uid: Number(uid), mapp, typ: utkast ? 'utkast' : 'skickat', till: t.fran.adress, amne: `Re: ${t.amne}`, utkastUid: utkast ? nyUid : null, sparfel: false, utkastMapp: 'Drafts' };
  }
  async flagga(uid, { mapp = 'INBOX', av = false } = {}) {
    this.anrop.push(['flagga', uid, !av]);
    const m = this.mapp(mapp).find((x) => x.uid === Number(uid));
    if (!m) throw new Error('uid saknas');
    m.flaggad = !av;
    return { uid: Number(uid), mapp, flaggad: !av };
  }
  async flytta(uid, { mapp = 'INBOX', till, skapa = false } = {}) {
    this.anrop.push(['flytta', uid, till]);
    if (!(till in this.mappar)) { if (!skapa) throw Object.assign(new Error(`Mappen "${till}" finns inte`), { kod: 'MAPP_SAKNAS' }); this.mappar[till] = []; }
    const i = this.mapp(mapp).findIndex((x) => x.uid === Number(uid));
    if (i === -1) throw new Error('uid saknas');
    const [m] = this.mappar[mapp].splice(i, 1);
    this.mappar[till].push({ ...m, uid: this.nastaUid++ });
    return { uid: Number(uid), fran: mapp, till, skapad: !skapa ? false : true };
  }
  async loggaUt() { this.utloggad = true; }
  skickade() { return this.mappar.Sent.filter((m) => m.text); }
  utkast() { return this.mappar.Drafts.filter((m) => m.text); }
}

/** Shopify-fixturen (REST-form → normaliseraOrder). */
const ORDRAR = {
  1042: { id: 1, name: '#1042', order_number: 1042, email: 'anna@gmail.com', created_at: '2026-09-15T10:00:00+02:00', financial_status: 'paid', fulfillment_status: 'fulfilled', customer: { first_name: 'Anna' }, fulfillments: [{ status: 'success', created_at: '2026-09-17T09:00:00+02:00', tracking_company: 'YunExpress', tracking_numbers: ['YT2626000000001'], tracking_urls: ['https://www.yuntrack.com/parcelTracking?id=YT2626000000001'] }], line_items: [{ title: 'Marin motorhölje', quantity: 1 }], shipping_address: { country_code: 'SE' } },
  1050: { id: 2, name: '#1050', order_number: 1050, email: 'ola@online.no', created_at: '2026-09-20T10:00:00+02:00', financial_status: 'paid', fulfillment_status: null, customer: { first_name: 'Ola' }, fulfillments: [] },
  1060: { id: 3, name: '#1060', order_number: 1060, email: 'annan@kund.se', created_at: '2026-09-10T10:00:00+02:00', financial_status: 'paid', fulfillment_status: 'fulfilled', fulfillments: [{ status: 'success', created_at: '2026-09-11T09:00:00+02:00', tracking_company: '4PX', tracking_numbers: ['4PX0001'] }] },
  1051: { id: 5, name: '#1051', order_number: 1051, email: 'kari@online.no', created_at: '2026-09-20T11:00:00+02:00', financial_status: 'paid', fulfillment_status: null, customer: { first_name: 'Kari' }, fulfillments: [] },
  1070: { id: 4, name: '#1070', order_number: 1070, email: 'lev@kund.se', created_at: '2026-09-01T10:00:00+02:00', financial_status: 'paid', fulfillment_status: 'fulfilled', fulfillments: [{ status: 'success', created_at: '2026-09-02T09:00:00+02:00', tracking_company: 'YunExpress', tracking_numbers: ['YT2626000000009'], shipment_status: 'delivered' }] },
};
function falskShopify(ordrar = ORDRAR) {
  const alla = Object.values(ordrar).map(normaliseraOrder);
  return {
    anrop: [],
    async hamtaOrderPaNamn(n) { this.anrop.push(['namn', n]); return alla.find((o) => o.nummer === String(n).replace(/^#/, '')) ?? null; },
    async hamtaOrdrarForEmail(e) { this.anrop.push(['email', e]); return alla.filter((o) => o.email === e.toLowerCase()); },
  };
}
const SPARNING17 = {
  YT2626000000001: { number: 'YT2626000000001', carrier: 190008, track_info: { latest_status: { status: 'InTransit', sub_status: 'InTransit_Other' }, latest_event: { time_iso: '2026-09-19T15:39:00+02:00', description: 'THE SHIPMENT ITEM IS UNDER TRANSPORTATION.', location: 'MALMÖ PAKETTERMINAL, SE' }, tracking: { providers: [{ events: [{ time_iso: '2026-09-19T15:39:00+02:00', description: 'THE SHIPMENT ITEM IS UNDER TRANSPORTATION.', location: 'MALMÖ PAKETTERMINAL, SE', sub_status: 'InTransit_Other', stage: 'InTransit' }, { time_iso: '2026-09-17T10:00:00+08:00', description: 'Shipment information received', location: 'SHENZHEN, CN', sub_status: 'InfoReceived', stage: 'InfoReceived' }] }] } } },
  YT2626000000009: { number: 'YT2626000000009', carrier: 190008, track_info: { latest_status: { status: 'Delivered', sub_status: 'Delivered_Other' }, latest_event: { time_iso: '2026-09-10T12:00:00+02:00', description: 'Delivered', location: 'UMEÅ, SE' }, tracking: { providers: [{ events: [{ time_iso: '2026-09-10T12:00:00+02:00', description: 'Delivered', location: 'UMEÅ, SE', sub_status: 'Delivered_Other', stage: 'Delivered' }] }] } } },
};
const hamta17 = async (poster) => ({ accepterade: poster.map((p) => SPARNING17[p.number]).filter(Boolean), avvisade: poster.filter((p) => !SPARNING17[p.number]).map((p) => ({ number: p.number, fel: 'does not register, please register first' })) });

const BRAND = upptackBrands().find((b) => b.id === 'baverbutiken');
const ENV = { KUNDTJANST_MAIL_PASS_BAVERBUTIKEN: 'x' };
const KONFIG = korkonfig(BRAND, ENV);
const tmp = () => mkdtempSync(join(tmpdir(), 'autosvar-'));
const kor = (b, o = {}) => korBrand(BRAND, { env: ENV, nu: NU, torr: true, brevlada: b, shopify: falskShopify(), hamta17, loggmapp: tmp(), ...o });

const M = {
  wismoSv: { uid: 10, ra: ra({ fran: 'Anna Andersson <anna@gmail.com>', amne: 'Var är min order #1042?', text: 'Hej! Har inte fått någon spårning på paketet. När kommer det?', id: '<w10@gmail.com>' }) },
  wismoEnUtanNr: { uid: 11, ra: ra({ fran: 'Anna <anna@gmail.com>', amne: 'Where is my order?', text: 'Hi, I ordered two weeks ago and have not received any tracking. Where is my parcel?', id: '<w11@gmail.com>' }) },
  ejSkickadNo: { uid: 12, ra: ra({ fran: 'Ola <ola@online.no>', amne: 'Hvor er pakken', text: 'Hei, jeg bestilte i går, når blir ordre 1050 sendt?', id: '<w12@online.no>' }) },
  argSv: { uid: 13, ra: ra({ fran: 'Bengt <bengt@x.se>', amne: 'ALDRIG FÅTT MINA VAROR', text: 'Detta är tredje gången jag skriver!!! Ingen svarar. Har aldrig fått paketet. Jag kontaktar min bank om jag inte får svar nu.', id: '<w13@x.se>' }) },
  tvist: { uid: 14, ra: ra({ fran: 'Carl <carl@x.se>', amne: 'Var är min order', text: 'Var är mitt paket? Jag har öppnat en chargeback hos banken.', id: '<w14@x.se>' }) },
  retur: { uid: 15, ra: ra({ fran: 'Disa <disa@x.se>', amne: 'Retur', text: 'Hej, jag vill returnera varan och få pengarna tillbaka. Hur gör jag?', id: '<w15@x.se>' }) },
  autosvar: { uid: 16, ra: ra({ fran: 'Erik <erik@x.se>', amne: 'Automatic reply: Var är min order', text: 'I am out of office.', id: '<w16@x.se>', extra: 'Auto-Submitted: auto-replied\r\n' }) },
  nyhetsbrev: { uid: 17, ra: ra({ fran: 'Nyheter <news@agency.com>', amne: 'Grow your business', text: 'We are a digital agency. Unsubscribe here.', id: '<w17@agency.com>', extra: 'List-Unsubscribe: <mailto:x@agency.com>\r\n' }) },
  shopify: { uid: 18, ra: ra({ fran: 'Shopify <no-reply@shopify.com>', amne: 'Ny order #1080', text: 'Du har fått en ny order.', id: '<w18@shopify.com>' }) },
  egen: { uid: 19, ra: ra({ fran: `Kundsupport <${SUPPORT}>`, till: 'anna@gmail.com', amne: 'Re: test', text: 'Hej', id: '<w19@baverbutiken.se>' }) },
  bilaga: { uid: 20, bilaga: true, ra: ra({ fran: 'Frida <frida@x.se>', amne: 'Var är min order #1042', text: 'Se bifogad bild. Var är paketet?', id: '<w20@x.se>' }) },
  annanKund: { uid: 21, ra: ra({ fran: 'Gustav <gustav@x.se>', amne: 'Order 1060', text: 'Hej, var är order 1060? Har inte fått någon spårning.', id: '<w21@x.se>' }) },
  levererad: { uid: 22, ra: ra({ fran: 'Lev <lev@kund.se>', amne: 'Var är min order 1070', text: 'Hej, var är mitt paket? Har inte fått någon spårning eller något.', id: '<w22@kund.se>' }) },
  leveranstid: { uid: 23, ra: ra({ fran: 'Hanna <hanna@x.se>', amne: 'Fråga', text: 'Hej! Vad är leveranstiden om jag beställer i dag?', id: '<w23@x.se>' }) },
  oppettider: { uid: 24, ra: ra({ fran: 'Ivar <ivar@x.se>', amne: 'Öppettider', text: 'Hej, vilka öppettider har ni? Kan man ringa er?', id: '<w24@x.se>' }) },
  adressEjSkickad: { uid: 25, ra: ra({ fran: 'Kari <kari@online.no>', amne: 'Feil adresse', text: 'Hei! Jeg skrev feil adresse på ordre 1051, kan dere endre adresse til Storgata 1?', id: '<w25@online.no>' }) },
  gammal: { uid: 5, ra: ra({ fran: 'Gammal <gammal@x.se>', amne: 'Var är min order', text: 'Var är mitt paket? Har inte fått någon spårning.', id: '<w5@x.se>', timmarSedan: 200 }) },
  wismoFi: { uid: 26, ra: ra({ fran: 'Aino <aino@x.fi>', amne: 'Missä on tilaukseni #1042', text: 'Hei, en ole saanut pakettia. Missä on tilaukseni? Kiitos', id: '<w26@x.fi>' }) },
};
// Finska kunden med Annas ordernummer: adressen matchar inte → aldrig svar. (Testas nedan.)

// ------------------------------------------------------------------ hinkar

test('hinka: SKIP för autosvar, listmejl, system, egen adress; SVÅR för tvistord, bilaga, retur', () => {
  const h = (m, extra = {}) => hinka({ mejl: { ...tolkaMejl(m.ra, { uid: m.uid }), ...extra }, brand: KONFIG });
  assert.equal(h(M.autosvar).hink, HINK.SKIP);
  assert.equal(h(M.nyhetsbrev).hink, HINK.SKIP);
  assert.equal(h(M.shopify).hink, HINK.SKIP);
  assert.equal(h(M.egen).hink, HINK.SKIP);
  const tvist = h(M.tvist);
  assert.equal(tvist.hink, HINK.SVAR);
  assert.match(tvist.orsak, /tvistord/);
  const bil = h(M.bilaga, { bilaga: true });
  assert.equal(bil.hink, HINK.SVAR);
  assert.match(bil.orsak, /bilaga/);
  const retur = h(M.retur);
  assert.equal(retur.hink, HINK.SVAR);
  assert.match(retur.orsak, /kategori/);
});

test('hinka: ENKEL för WISMO/leveranstid/öppettider/adress, ARG vinner över ENKEL', () => {
  const h = (m, trad = null) => hinka({ mejl: tolkaMejl(m.ra, { uid: m.uid }), brand: KONFIG, trad });
  assert.deepEqual([h(M.wismoSv).hink, h(M.wismoSv).typ], [HINK.ENKEL, 'wismo']);
  assert.deepEqual([h(M.wismoEnUtanNr).hink, h(M.wismoEnUtanNr).typ], [HINK.ENKEL, 'wismo']);
  assert.deepEqual([h(M.leveranstid).hink, h(M.leveranstid).typ], [HINK.ENKEL, 'leveranstid']);
  assert.deepEqual([h(M.oppettider).hink, h(M.oppettider).typ], [HINK.ENKEL, 'oppettider']);
  assert.deepEqual([h(M.adressEjSkickad).hink, h(M.adressEjSkickad).typ], [HINK.ENKEL, 'adress']);
  const arg = h(M.argSv);
  assert.equal(arg.hink, HINK.ARG);
  assert.match(arg.orsak, /aldrig ha fått|hot om bank|eskaleringsord/);
  // Tredje mejlet utan svar på en lugn WISMO ⇒ ARG.
  const tredje = h(M.wismoSv, { antalInkommande: 3, antalSvar: 0 });
  assert.equal(tredje.hink, HINK.ARG);
  assert.match(tredje.orsak, /tredje mejlet/);
  // Ett svar i tråden ⇒ tredje-mejlet-regeln gäller inte (VA:n har den).
  assert.equal(h(M.wismoSv, { antalInkommande: 3, antalSvar: 1 }).hink, HINK.ENKEL);
});

test('harTvistord + arArg + enkelTyp: Axels ord, nordiska former, versaler och utropstecken', () => {
  for (const t of ['jag har startat en chargeback', 'I opened a dispute', 'anmält till ARN', 'Klarna-tvist pågår', 'det blir en tvist', 'reklamationsnämnden']) assert.equal(harTvistord(t), true, t);
  for (const t of ['var är mitt paket', 'kan ni ändra adress', 'arnold beställde', 'discussion']) assert.equal(harTvistord(t), false, t);
  const k = (amne, text) => ({ klass: klassificera({ amne, text }), amne, text });
  assert.equal(arArg(k('Order', 'JAG VILL HA MITT PAKET NU DET ÄR HELT OACCEPTABELT ATT VÄNTA')).arg, true);
  assert.equal(arArg(k('Order', 'Var är paketet?!!! Svara!!!')).arg, true);
  assert.equal(arArg(k('Bestilling', 'Jeg er skikkelig skuffet over dere.')).arg, true);
  assert.equal(arArg(k('Order', 'Hej, undrar bara var paketet är. Tack!')).arg, false);
  assert.equal(enkelTyp(k('Delivery', 'How long does the delivery take?')), 'leveranstid');
  assert.equal(enkelTyp(k('Delivery', 'How long does the delivery take for order 1042?')), 'wismo');
  assert.equal(enkelTyp(k('Hej', 'Jag vill byta storlek')), null);
});

test('beslut: svarar aldrig två gånger i en tråd, aldrig utan order, aldrig på annan kunds order, levererat ⇒ ARG', () => {
  const enkel = { hink: HINK.ENKEL, typ: 'wismo', orsak: 'x', klass: klassificera({ amne: 'Var är min order', text: 'var är paketet' }) };
  assert.equal(beslut({ hink: enkel, fakta: { order: { namn: '#1' }, sparning: null }, trad: { antalSvar: 0, redanAutosvar: false } }).svara, true);
  const b1 = beslut({ hink: enkel, fakta: { order: { namn: '#1' } }, trad: { antalSvar: 1, redanAutosvar: false } });
  assert.deepEqual([b1.hink, b1.svara, b1.flagga], [HINK.SVAR, false, true]);
  const b2 = beslut({ hink: enkel, fakta: { order: { namn: '#1' } }, trad: { antalSvar: 0, redanAutosvar: true } });
  assert.deepEqual([b2.hink, b2.svara], [HINK.SVAR, false]);
  assert.match(b2.orsak, /redan fått ett automatiskt svar/);
  assert.equal(beslut({ hink: enkel, fakta: { order: null }, trad: { antalSvar: 0 } }).hink, HINK.SVAR);
  assert.equal(beslut({ hink: enkel, fakta: { sparr: 'annan kund', order: null }, trad: { antalSvar: 0 } }).hink, HINK.SVAR);
  const lev = beslut({ hink: enkel, fakta: { order: { namn: '#1' }, sparning: { levererad: true } }, trad: { antalSvar: 0 } });
  assert.deepEqual([lev.hink, lev.svara, lev.flytta], [HINK.ARG, true, true]);
  // Adressbyte: skickad ⇒ SVÅR, oskickad ⇒ svar + flagga + VA-mapp.
  const adr = { ...enkel, typ: 'adress' };
  assert.equal(beslut({ hink: adr, fakta: { order: { namn: '#1', sandningar: [{ nummer: 'x' }] } }, trad: { antalSvar: 0 } }).hink, HINK.SVAR);
  const adr2 = beslut({ hink: adr, fakta: { order: { namn: '#1', sandningar: [] } }, trad: { antalSvar: 0 } });
  assert.deepEqual([adr2.hink, adr2.svara, adr2.flagga, adr2.flytta], [HINK.ENKEL, true, true, true]);
  // ARG med ett svar redan i tråden ⇒ ingen ny lugnande rad, bara flagga.
  const arg = beslut({ hink: { hink: HINK.ARG, orsak: 'x', klass: enkel.klass }, trad: { antalSvar: 1 } });
  assert.deepEqual([arg.hink, arg.svara, arg.flagga], [HINK.SVAR, false, true]);
});

// ------------------------------------------------------------------ svar

test('svarsmallar: fem språk, alla meningar finns, inga löftesord, signatur = butikens namn (aldrig AI)', () => {
  const nycklar = Object.keys(mallar('sv'));
  for (const s of SPRAK) {
    const m = mallar(s);
    assert.deepEqual(Object.keys(m), nycklar, `${s} har samma meningar som svenskan`);
    assert.deepEqual(Object.keys(m.x), Object.keys(mallar('sv').x), `${s} har samma X-nycklar`);
    const enkelt = skrivEnkelt({ typ: 'wismo', sprak: s, brand: KONFIG, namn: 'Anna', fakta: { order: { namn: '#1042', skapad: new Date('2026-09-15T08:00:00Z') }, sandning: { skickad: new Date('2026-09-17T07:00:00Z'), bolag: 'YunExpress', nummer: 'YT1' }, sparning: { senaste: { tid: '2026-09-19T13:39:00.000Z', text: 'Paketet är på väg', plats: 'Malmö' } }, lank: 'https://baverbutiken.se/pages/spara?nummer=BB-1', fonster: { fran: new Date('2026-09-24T07:00:00Z'), till: new Date('2026-10-01T07:00:00Z') } } }).text;
    assert.match(enkelt, /#1042/);
    assert.match(enkelt, /https:\/\/baverbutiken\.se\/pages\/spara\?nummer=BB-1/);
    assert.match(enkelt, /Kundtjänst Bäverbutiken$/, `${s} signerar med butikens supportnamn`);
    assert.equal(harForbjudet(enkelt), false, `${s}: inga löften i ENKEL`);
    assert.equal(/\bAI\b/.test(enkelt), false);
    for (const typ of ['leveranstid', 'oppettider']) assert.equal(harForbjudet(skrivEnkelt({ typ, sprak: s, brand: KONFIG }).text), false);
    const adr = skrivEnkelt({ typ: 'adress', sprak: s, brand: KONFIG, fakta: { order: { namn: '#1050' } } }).text;
    assert.match(adr, /#1050/);
    for (const x of Object.keys(m.x)) {
      const arg = skrivArgt({ sprak: s, brand: KONFIG, xNyckel: x });
      assert.equal(harForbjudet(arg.text), false, `${s}/${x}: inga löften i ARG`);
      assert.match(arg.text, /Kundtjänst Bäverbutiken$/);
    }
  }
  // Axels mall ordagrant på svenska.
  assert.equal(skrivArgt({ sprak: 'sv', brand: KONFIG, xNyckel: 'ej_levererad' }).text, 'Hej! Jag eskalerar detta direkt till våra ansvariga. När jag ser vad du varit med om med paketet som inte kommit fram blir till och med jag riktigt frustrerad. Så här ska det verkligen inte vara. Jag återkommer så snart som möjligt.\n\nVänliga hälsningar\nKundtjänst Bäverbutiken');
  // Utan brandets signatur: "Kundtjänst <namn>" på kundens språk.
  assert.equal(signatur({ brand: 'CaraShell', svar: {} }, 'nb'), 'Kundeservice CaraShell');
  assert.equal(signatur({ brand: 'CaraShell', svar: {} }, 'fi'), 'Asiakaspalvelu CaraShell');
  assert.equal(signatur({ brand: 'CaraShell', svar: {} }, 'en'), 'Customer service CaraShell');
});

test('svar: ej skickad order säger packas + fönster i dagar, aldrig ett datum; wismo utan order kastar', () => {
  const t = skrivEnkelt({ typ: 'wismo', sprak: 'sv', brand: KONFIG, fakta: { order: { namn: '#1050', skapad: new Date('2026-09-20T08:00:00Z') }, sandning: null } }).text;
  assert.match(t, /Din order #1050 är mottagen 20 september 2026 och packas inom 2 arbetsdagar/);
  assert.match(t, /7–14 dagar från att paketet skickas/);
  assert.throws(() => skrivEnkelt({ typ: 'wismo', sprak: 'sv', brand: KONFIG, fakta: {} }), /utan order/);
  assert.throws(() => skrivEnkelt({ typ: 'adress', sprak: 'sv', brand: KONFIG, fakta: {} }), /utan order/);
  assert.throws(() => skrivEnkelt({ typ: 'x', sprak: 'sv', brand: KONFIG }), /okänd/);
});

test('xNyckelFor: det konkreta problemet vinner över hotet; tredje mejlet ger "väntat"', () => {
  const k = (amne, text) => klassificera({ amne, text });
  assert.equal(xNyckelFor(k('ALDRIG FÅTT', 'Har aldrig fått paketet. Jag kontaktar min bank.'), ['hot om bank']), 'ej_levererad');
  assert.equal(xNyckelFor(k('Trasig', 'Varan är trasig och jag är förbannad'), ['argt ordval']), 'skadad_defekt');
  assert.equal(xNyckelFor(k('Var är min order', 'var är paketet?!!!'), ['tredje mejlet utan svar (3 obesvarade)']), 'vantat');
  assert.equal(xNyckelFor(k('Var är min order', 'var är paketet?!!!'), ['många utropstecken']), 'var_ar_ordern');
  assert.equal(xNyckelFor(k('Hej', 'Ni är oseriösa och jag kontaktar min bank'), ['hot om bank']), 'chargeback_hot');
  assert.equal(xNyckelFor(k('Hej', 'Skandal!!!'), ['många utropstecken']), 'standard');
  assert.equal(xNyckelFor(k('Var är min order', 'var är paketet'), ['paket markerat levererat men inte mottaget']), 'levererat_ej_mottaget');
});

test('valjSprak, fornamn, datumText', () => {
  assert.equal(valjSprak('no', 'sv'), 'nb');
  assert.equal(valjSprak('okänt', 'fi'), 'fi');
  assert.equal(valjSprak('en', 'sv'), 'en');
  assert.equal(valjSprak('xx', 'zz'), 'sv');
  assert.equal(fornamn({ mejlnamn: 'anna andersson' }), 'Anna');
  assert.equal(fornamn({ mejlnamn: 'anna@gmail.com' }), '');
  assert.equal(fornamn({ mejlnamn: 'Kund 12345' }), '');
  assert.equal(fornamn({ ordernamn: 'Ola', mejlnamn: 'Ola Nordmann Hansen Berg' }), 'Ola');
  assert.equal(datumText('2026-09-19T13:39:00Z', 'sv', { tid: true }), '19 september 2026 15:39');
  assert.equal(datumText('2026-09-19T13:39:00Z', 'fi', { tid: true }).includes('16.39'), true, 'finsk kund läser Helsingforstid');
  assert.equal(datumText(null, 'sv'), '');
});

// ------------------------------------------------------------------ fakta

test('fakta: order på nummer kräver kundens e-post; på e-post väljs den enda öppna; 17TRACK läses gratis', async () => {
  const mejl = tolkaMejl(M.wismoSv.ra, { uid: 10 });
  const klass = klassificera({ amne: mejl.amne, text: mejl.text });
  const f = await hamtaFakta({ mejl, klass, konfig: KONFIG, shopify: falskShopify(), hamta17, sprak: 'sv', nu: NU });
  assert.equal(f.order.namn, '#1042');
  assert.equal(f.sandning.nummer, 'YT2626000000001');
  assert.equal(f.sparning.levererad, false);
  assert.equal(f.sparning.senaste.text, 'Paketet är på väg', 'ordboken översätter 4PX-raden');
  assert.equal(f.sparning.senaste.plats, 'Malmö paketterminal');
  assert.equal(f.lank, `https://baverbutiken.se/pages/spara?nummer=${encodeURIComponent(bavernummer('YT2626000000001', 'BB-'))}`);
  assert.equal(f.fonster.fran.toISOString().slice(0, 10), '2026-09-24');
  assert.equal(f.fonster.till.toISOString().slice(0, 10), '2026-10-01');
  // Annan kunds order: spärr, inget läses vidare.
  const m2 = tolkaMejl(M.annanKund.ra, { uid: 21 });
  const f2 = await hamtaFakta({ mejl: m2, klass: klassificera({ amne: m2.amne, text: m2.text }), konfig: KONFIG, shopify: falskShopify(), hamta17, nu: NU });
  assert.equal(f2.order, null);
  assert.match(f2.sparr, /annan e-postadress/);
  // Utan ordernummer: e-posten.
  const m3 = tolkaMejl(M.wismoEnUtanNr.ra, { uid: 11 });
  const f3 = await hamtaFakta({ mejl: m3, klass: klassificera({ amne: m3.amne, text: m3.text }), konfig: KONFIG, shopify: falskShopify(), hamta17, sprak: 'en', nu: NU });
  assert.equal(f3.order.namn, '#1042');
  assert.equal(f3.sparning.senaste.text, 'THE SHIPMENT ITEM IS UNDER TRANSPORTATION.', 'engelsk kund får fraktbolagets egen rad');
  // Levererad enligt 17TRACK.
  const m4 = tolkaMejl(M.levererad.ra, { uid: 22 });
  const f4 = await hamtaFakta({ mejl: m4, klass: klassificera({ amne: m4.amne, text: m4.text }), konfig: KONFIG, shopify: falskShopify(), hamta17, nu: NU });
  assert.equal(f4.sparning.levererad, true);
  // Utan Shopify: ingen order, ingen spärr.
  const f5 = await hamtaFakta({ mejl, klass, konfig: KONFIG, shopify: null });
  assert.deepEqual([f5.order, f5.sparr], [null, null]);
  // Utan 17TRACK-nyckel/läsare: skickdatum + länk räcker.
  const f6 = await hamtaFakta({ mejl, klass, konfig: KONFIG, shopify: falskShopify(), hamta17: async () => ({ accepterade: [], avvisade: [{ number: 'x', fel: 'does not register' }] }), nu: NU });
  assert.equal(f6.sparning, null);
  assert.ok(f6.lank);
});

test('valjOrder + sparningslank + leveransfonster + senasteSkanning', () => {
  const o = (n, lev) => ({ namn: n, avbruten: false, sandningar: lev ? [{ leveransstatus: 'delivered' }] : [] });
  assert.equal(valjOrder([o('#1')]).order.namn, '#1');
  assert.equal(valjOrder([o('#1', true), o('#2')]).order.namn, '#2');
  assert.equal(valjOrder([o('#1'), o('#2')]).order, null);
  assert.match(valjOrder([o('#1'), o('#2')]).skal, /2 ordrar/);
  assert.equal(valjOrder([]).order, null);
  assert.equal(sparningslank({ sparningssida: 'https://x.se/pages/spara/', sparning_prefix: 'CS-' }, 'YT1'), `https://x.se/pages/spara?nummer=${bavernummer('YT1', 'CS-')}`);
  assert.equal(sparningslank({ sparningssida: '' }, 'YT1'), null);
  assert.equal(leveransfonster(null), null);
  assert.equal(leveransfonster('2026-09-17T07:00:00Z', [5, 10]).till.toISOString().slice(0, 10), '2026-09-27');
  assert.equal(senasteSkanning(SPARNING17.YT2626000000001, 'nb', { nu: NU.getTime() }).text, 'Pakken er på vei');
  assert.equal(senasteSkanning({ track_info: {} }, 'sv'), null);
});

// ------------------------------------------------------------------ hela flödet

test('flödet (--torr): ENKEL blir utkast med fakta, ARG blir utkast + flagga + VA-PRIO, SVÅR flaggas, SKIP lämnas', async () => {
  const b = new FalskBrevlada({ INBOX: [M.wismoSv, M.ejSkickadNo, M.argSv, M.tvist, M.retur, M.autosvar, M.nyhetsbrev, M.shopify, M.egen, M.bilaga, M.annanKund, M.levererad, M.leveranstid, M.oppettider, M.adressEjSkickad, M.gammal] });
  const loggmapp = tmp();
  const r = await kor(b, { loggmapp });
  assert.equal(r.hoppad, false);
  const per = Object.fromEntries(r.rader.map((x) => [x.uid, x]));

  // ENKEL: WISMO med spårning
  assert.deepEqual([per[10].hink, per[10].atgard, per[10].typ, per[10].sprak], ['ENKEL', 'utkast', 'wismo', 'sv']);
  const utkastAnna = b.utkast().find((u) => /anna@gmail\.com/.test(u.ra) && /#1042/.test(u.text));
  assert.ok(utkastAnna, 'utkastet till Anna finns i Drafts');
  assert.match(utkastAnna.text, /^Hej Anna!\n\nTack för ditt mejl\.\nJag har kollat upp din order #1042\.\nPaketet skickades 17 september 2026 med YunExpress\.\nSenaste skanningen: 19 september 2026 15:39 · Paketet är på väg · Malmö paketterminal\.\nDu följer paketet här: https:\/\/baverbutiken\.se\/pages\/spara\?nummer=BB-/);
  assert.match(utkastAnna.text, /Beräknad leverans: 24 sep–1 okt\./);
  assert.match(utkastAnna.text, /Vänliga hälsningar\nKundtjänst Bäverbutiken$/);
  // ENKEL: ej skickad, norsk kund, norskt svar
  assert.deepEqual([per[12].hink, per[12].atgard, per[12].sprak], ['ENKEL', 'utkast', 'nb']);
  const utkastOla = b.utkast().find((u) => /ola@online\.no/.test(u.ra) && /#1050/.test(u.text));
  assert.match(utkastOla.text, /^Hei Ola!\n\nTakk for e-posten din\.\nJeg har sjekket bestillingen din #1050\.\nBestillingen din #1050 er mottatt 20\. september 2026 og pakkes innen 2 virkedager/);
  assert.match(utkastOla.text, /Kundtjänst Bäverbutiken$/, 'signaturen är butikens, på alla språk');
  // ENKEL: leveranstid + öppettider utan order
  assert.deepEqual([per[23].hink, per[23].atgard], ['ENKEL', 'utkast']);
  assert.deepEqual([per[24].hink, per[24].atgard], ['ENKEL', 'utkast']);
  // ENKEL adress på oskickad order: utkast + flagga + VA-mapp (VA:n måste ändra adressen)
  assert.deepEqual([per[25].hink, per[25].atgard, per[25].flaggad, per[25].flyttad], ['ENKEL', 'utkast', true, 'VA-PRIO']);
  // ARG: utkast med Axels mall, flagga, VA-PRIO
  assert.deepEqual([per[13].hink, per[13].atgard, per[13].flaggad, per[13].flyttad], ['ARG', 'utkast', true, 'VA-PRIO']);
  const utkastBengt = b.utkast().find((u) => /bengt@x\.se/.test(u.ra));
  assert.match(utkastBengt.text, /^Hej! Jag eskalerar detta direkt till våra ansvariga\. När jag ser vad du varit med om med paketet som inte kommit fram blir till och med jag riktigt frustrerad\./);
  assert.ok(b.mappar['VA-PRIO'].some((m) => /bengt@x\.se/.test(m.ra)), 'Bengt ligger i VA-PRIO');
  // Levererad enligt 17TRACK men "var är paketet" ⇒ ARG
  assert.deepEqual([per[22].hink, per[22].atgard, per[22].flyttad], ['ARG', 'utkast', 'VA-PRIO']);
  assert.match(b.utkast().find((u) => /lev@kund\.se/.test(u.ra)).text, /markerats som levererat/);
  // SVÅR: tvist, retur, bilaga, annan kunds order — flaggade, inget utkast
  for (const uid of [14, 15, 20, 21]) {
    assert.deepEqual([per[uid].hink, per[uid].atgard, per[uid].flaggad], ['SVÅR', 'flaggad', true], `uid ${uid}`);
  }
  assert.match(per[21].orsak, /annan e-postadress/);
  assert.equal(b.utkast().some((u) => /carl@x\.se|disa@x\.se|frida@x\.se|gustav@x\.se/.test(u.ra)), false, 'inga utkast till SVÅR');
  // SKIP: rörs inte
  for (const uid of [16, 17, 18, 19]) assert.deepEqual([per[uid].hink, per[uid].atgard, per[uid].flaggad ?? false], ['SKIP', 'hoppad', false], `uid ${uid}`);
  // Utanför fönstret: inte ens läst som kandidat
  assert.equal(per[5], undefined);
  // Inget skickat i --torr
  assert.equal(b.skickade().length, 0);
  assert.equal(b.anrop.some((a) => a[0] === 'svara' && a[2] === 'skickat'), false);
  // Loggen: en rad per mejl, kundadress maskerad, ingen svarstext
  const logg = lasLogg('baverbutiken', loggmapp);
  assert.equal(logg.length, r.rader.length);
  assert.ok(logg.every((x) => /\*\*\*@/.test(x.kund)), 'maskerade adresser');
  assert.equal(readFileSync(loggfil('baverbutiken', loggmapp), 'utf8').includes('Jag eskalerar'), false);
});

test('järnregel: max ETT automatiskt svar per tråd — loggen, Sent och Drafts stoppar det andra', async () => {
  // 1. Andra körningen: samma mejl står i loggen ⇒ rörs inte.
  const loggmapp = tmp();
  const b = new FalskBrevlada({ INBOX: [M.wismoSv] });
  const r1 = await kor(b, { loggmapp });
  assert.equal(r1.rader[0].atgard, 'utkast');
  const r2 = await kor(b, { loggmapp });
  assert.equal(r2.rader.length, 0, 'inget nytt att hantera');
  assert.equal(b.utkast().length, 1);
  // 2. Kunden svarar i samma tråd (References) ⇒ VA:n, aldrig ett andra automatiskt svar.
  const svar2 = { uid: 30, ra: ra({ fran: 'Anna <anna@gmail.com>', amne: 'Re: Var är min order #1042?', text: 'Tack, men var är det nu? Har inte fått något.', id: '<w30@gmail.com>', refs: ['<w10@gmail.com>'], timmarSedan: 1 }) };
  b.mappar.INBOX.push(svar2);
  const r3 = await kor(b, { loggmapp });
  const rad = r3.rader.find((x) => x.uid === 30);
  assert.deepEqual([rad.hink, rad.atgard, rad.flaggad], ['SVÅR', 'flaggad', true]);
  assert.match(rad.orsak, /redan/);
  assert.equal(b.utkast().length, 1, 'fortfarande bara ett utkast');
  // 3. Loggen borta (ny container) — utkastet i Drafts räcker ändå som spärr.
  const r4 = await kor(b, { loggmapp: tmp() });
  assert.equal(b.utkast().length, 1);
  assert.ok(r4.rader.every((x) => x.atgard !== 'utkast'));
  // 4. Ett svar från VA:n i Sent ⇒ ingen automatik alls i den tråden.
  const b2 = new FalskBrevlada({ INBOX: [M.wismoSv], Sent: [{ uid: 900, ra: ra({ fran: `Kundsupport <${SUPPORT}>`, till: 'anna@gmail.com', amne: 'Re: Var är min order #1042?', text: 'Hej Anna, VA här.', id: '<va@baverbutiken.se>', refs: ['<w10@gmail.com>'], timmarSedan: 1 }) }] });
  const r5 = await kor(b2, { loggmapp: tmp() });
  assert.deepEqual([r5.rader[0].hink, r5.rader[0].atgard], ['SVÅR', 'flaggad']);
  assert.match(r5.rader[0].orsak, /redan ett svar från oss/);
  assert.equal(b2.utkast().length, 0);
});

test('järnregel: en kund får högst ETT automatiskt svar per körning och dygn — även i två olika trådar', async () => {
  const b = new FalskBrevlada({ INBOX: [M.wismoSv, M.wismoEnUtanNr] });
  const loggmapp = tmp();
  const r = await kor(b, { loggmapp });
  const per = Object.fromEntries(r.rader.map((x) => [x.uid, x]));
  assert.equal(per[11].atgard, 'utkast', 'det nyaste mejlet får svaret');
  assert.deepEqual([per[10].hink, per[10].atgard], ['SVÅR', 'flaggad']);
  assert.match(per[10].orsak, /redan fått ett automatiskt svar/);
  assert.equal(b.utkast().length, 1);
  // Nästa dag: en ny fråga från samma kund får svar igen (loggen bär bara kundhashen, aldrig adressen).
  const logg = lasLogg('baverbutiken', loggmapp);
  assert.ok(logg.every((x) => !x.kund.includes('anna@')));
  assert.ok(logg.some((x) => x.kundHash && x.kundHash.length === 12));
  const senare = new Date(NU.getTime() + 30 * 3_600_000);
  const b2 = new FalskBrevlada({ INBOX: [{ uid: 60, ra: ra({ fran: 'Anna <anna@gmail.com>', amne: 'Leveranstid', text: 'Hej, vad har ni för leveranstid om jag beställer mer?', id: '<w60@gmail.com>', timmarSedan: -29 }) }] });
  const r2 = await kor(b2, { loggmapp, nu: senare });
  assert.equal(r2.rader[0].atgard, 'utkast');
});

test('järnregel: tredje mejlet utan svar ⇒ ARG med "väntat på svar", ett enda utkast', async () => {
  const a = { uid: 40, ra: ra({ fran: 'Nils <nils@x.se>', amne: 'Var är min order 1042', text: 'Hej, var är mitt paket?', id: '<n1@x.se>', timmarSedan: 60 }) };
  const b1 = { uid: 41, ra: ra({ fran: 'Nils <nils@x.se>', amne: 'Re: Var är min order 1042', text: 'Hallå? Var är paketet?', id: '<n2@x.se>', refs: ['<n1@x.se>'], timmarSedan: 30 }) };
  const c = { uid: 42, ra: ra({ fran: 'Nils <nils@x.se>', amne: 'Re: Var är min order 1042', text: 'Tredje mejlet nu. Var är paketet?', id: '<n3@x.se>', refs: ['<n1@x.se>', '<n2@x.se>'], timmarSedan: 1 }) };
  const b = new FalskBrevlada({ INBOX: [a, b1, c] });
  const r = await kor(b, { loggmapp: tmp(), shopify: falskShopify({}) });
  // Äldst först: det första mejlet är ENKEL utan order ⇒ SVÅR (ingen order på nils@x.se) — inget svar; det tredje är ARG.
  const per = Object.fromEntries(r.rader.map((x) => [x.uid, x]));
  assert.equal(per[40].hink, 'SVÅR');
  assert.equal(per[42].hink, 'ARG');
  assert.equal(per[42].atgard, 'utkast');
  assert.equal(b.utkast().length, 1, 'ett enda utkast i tråden');
  assert.match(b.utkast()[0].text, /att du fått vänta på svar/);
});

test('järnregel: skarpt läge skickar; taket per körning flaggar resten; förbjudna ord stoppar svaret', async () => {
  const b = new FalskBrevlada({ INBOX: [M.wismoSv, M.ejSkickadNo, M.leveranstid] });
  const r = await kor(b, { torr: false, max: 2 });
  const svar = r.rader.filter((x) => x.atgard === 'svar');
  assert.equal(svar.length, 2);
  assert.equal(b.skickade().length, 2);
  const stoppad = r.rader.find((x) => x.atgard !== 'svar' && x.hink !== 'SKIP');
  assert.match(stoppad.orsak, /taket 2/);
  assert.equal(stoppad.flaggad, true);
  assert.equal(harForbjudet('Vi återbetalar pengarna på måndag'), true);
  assert.equal(harForbjudet('Här är en rabattkod'), true);
  assert.equal(harForbjudet('We guarantee delivery'), true);
  assert.equal(harForbjudet('Paketet är på väg'), false);
});

test('brevlådan svarar inte: felet loggas som varning, mejlet flaggas, körningen fortsätter', async () => {
  const b = new FalskBrevlada({ INBOX: [M.wismoSv, M.leveranstid] });
  b.svara = async (uid) => { if (uid === 10) throw new Error('Roundcube avvisade sändningen (steg 8): Could not send message.'); return { typ: 'utkast', till: 'x', amne: 'x', utkastUid: 1 }; };
  const r = await kor(b);
  const per = Object.fromEntries(r.rader.map((x) => [x.uid, x]));
  assert.equal(per[10].atgard, 'fel');
  assert.equal(per[10].flaggad, true);
  assert.equal(per[23].atgard, 'utkast');
  assert.ok(r.varningar.some((v) => /uid 10.*Could not send/.test(v)));
});

test('hoppar brands utan brevlåda eller med autosvar: false, och redan flaggade mejl', async () => {
  const r = await korBrand({ ...BRAND, svar: { autosvar: false } }, { env: ENV, nu: NU, brevlada: new FalskBrevlada(), shopify: null, loggmapp: tmp() });
  assert.equal(r.hoppad, true);
  assert.match(r.orsak, /avstängt/);
  const r2 = await korBrand(BRAND, { env: {}, nu: NU, shopify: null, loggmapp: tmp() });
  assert.match(r2.orsak, /KUNDTJANST_MAIL_PASS_BAVERBUTIKEN/);
  const b = new FalskBrevlada({ INBOX: [{ ...M.wismoSv, flaggad: true }] });
  const r3 = await kor(b);
  assert.equal(r3.rader.length, 0, 'flaggat = hos VA:n redan');
  assert.equal(r3.antalLasta, 0, 'inte ens hämtat');
});

test('byggTrad: kundens mejl i inkorgen + våra svar i Sent och Drafts, mappar som saknas hoppas', async () => {
  const b = new FalskBrevlada({ INBOX: [M.wismoSv, { uid: 50, ra: ra({ fran: 'Anna <anna@gmail.com>', amne: 'Re: Var är min order #1042?', text: 'Igen', id: '<w50@gmail.com>', refs: ['<w10@gmail.com>'], timmarSedan: 1 }) }], Sent: [{ uid: 900, ra: ra({ fran: `Kundsupport <${SUPPORT}>`, till: 'anna@gmail.com', amne: 'Re: Var är min order #1042?', text: 'Svar', id: '<s@b.se>', refs: ['<w10@gmail.com>'], timmarSedan: 1.5 }) }] });
  delete b.mappar.Drafts;
  const mejl = tolkaMejl(M.wismoSv.ra, { uid: 10 });
  const t = await byggTrad(b, KONFIG, mejl);
  assert.equal(t.antalInkommande, 2);
  assert.equal(t.antalSvar, 1);
  assert.ok(t.ids.includes('<w10@gmail.com>') && t.ids.includes('<w50@gmail.com>'));
});

// ------------------------------------------------------------------ logg + rapport

test('logg: minne och redanAutosvar känner igen tråden på nyckel och Message-ID', () => {
  const m = minne([{ messageId: '<a>', tradnyckel: 'k|x', atgard: 'svar', tradIds: ['<a>', '<b>'] }, { messageId: '<c>', tradnyckel: 'k|y', atgard: 'flaggad' }, { messageId: '<d>', tradnyckel: 'k|z', atgard: 'fel', fel: 'Roundcube compose gav HTTP 302 (steg 7)' }]);
  // Ett svar som inte gick att spara är inte hanterat — mejlet prövas igen när felet är rättat (2026-09-21).
  assert.deepEqual([...m.hanterade].sort(), ['<a>', '<c>']);
  assert.equal(redanAutosvar(m, { tradnyckel: 'k|z', ids: ['<d>'] }), false, 'fel är inte svarad');
  assert.equal(redanAutosvar(m, { tradnyckel: 'k|x' }), true);
  assert.equal(redanAutosvar(m, { ids: ['<b>'] }), true);
  assert.equal(redanAutosvar(m, { tradnyckel: 'k|y', ids: ['<c>'] }), false, 'flaggad är inte svarad');
  assert.equal(redanAutosvar(m, { ids: [] }), false);
});

test('rapport: Discord på engelska med räkning, ARGA med ordernummer, VA-listan; tyst när inget hände', () => {
  const res = { brand: { brand: 'Bäverbutiken', svar: { va_mapp: 'VA-PRIO' } }, kord: '2026-09-21T12:00:00.000Z', torr: true, varningar: ['TRACK17_API_KEY saknas'], rader: [
    { uid: 1, hink: 'ENKEL', atgard: 'utkast', typ: 'wismo', sprak: 'sv', kund: 'anna@gmail.com', ordernummer: ['1042'], amne: 'Var är min order' },
    { uid: 2, hink: 'ARG', atgard: 'utkast', kund: 'bengt@x.se', ordernummer: [], amne: 'ALDRIG FÅTT', orsak: 'säger sig aldrig ha fått paketet, hot om bank/anmälan/recension', orsakEn: 'says the parcel never arrived, threatens bank/complaint/review' },
    { uid: 3, hink: 'SVÅR', atgard: 'flaggad', kund: 'carl@x.se', ordernummer: ['1099'], amne: 'Retur', orsak: 'kategori retur_angerratt — VA:n', orsakEn: 'category retur_angerratt — VA' },
    { uid: 4, hink: 'SKIP', atgard: 'hoppad', kund: 'no-reply@shopify.com', amne: 'x', orsak: 'systemavsändare' },
  ] };
  const d = renderaDiscord(res);
  assert.match(d, /^\*\*Auto-reply run — Bäverbutiken\*\* \(2026-09-21 12:00 UTC, DRY RUN/);
  assert.match(d, /Simple questions answered: \*\*1\*\* · Upset customers calmed: \*\*1\*\* · Flagged for the VA: \*\*2\*\*/);
  assert.match(d, /#1042 · an\*\*\*@gmail\.com · wismo · sv · draft/);
  assert.match(d, /no order no\. · be\*\*\*@x\.se · "ALDRIG FÅTT" — says the parcel never arrived/);
  assert.match(d, /#1099 · ca\*\*\*@x\.se · "Retur" — category retur_angerratt — VA/);
  assert.equal(d.includes('anna@gmail.com'), false, 'kundadresser maskerade');
  assert.equal(d.includes('shopify'), false, 'SKIP visas inte');
  assert.equal(renderaDiscord({ brand: { brand: 'X' }, kord: '', rader: [{ hink: 'SKIP' }] }), null);
  assert.match(renderaSvensk(res), /Bäverbutiken: 4 mejl lästa — ENKEL 1 · ARG 1 · SVÅR 1 · hoppade 1 · TORR/);
  assert.equal(orsakEn({ hink: 'SVÅR', orsak: 'tvistord i mejlet (chargeback/dispute/ARN/tvist) — bara VA:n' }), 'dispute/chargeback wording — VA only');
  assert.equal(orsakEn({ hink: 'ARG', orsak: 'säger sig aldrig ha fått paketet, argt ordval' }), 'says the parcel never arrived, angry wording');
  assert.equal(orsakEn({ hink: 'SVÅR', orsak: 'kategori fel_vara — VA:n' }), 'category fel_vara — VA');
  assert.equal(orsakEn({ hink: 'SVÅR', orsak: 'något helt annat' }), 'for the VA');
});

test('brandfilerna: NO/DK/FI/CaraShell/Bäverbutiken bär svar-blocket, språk ur landet, Shopify-nycklar via domänsuffix', () => {
  const alla = upptackBrands();
  const id = (x) => alla.find((b) => b.id === x);
  assert.equal(korkonfig(id('beverbutikken'), {}).svar.sprak, 'nb');
  assert.equal(korkonfig(id('beverbutikken'), {}).mail.webmail, 'https://webmail.domeneshop.no/');
  assert.equal(korkonfig(id('baeverbutiken'), {}).svar.sprak, 'da');
  assert.equal(korkonfig(id('majavakauppa'), {}).svar.sprak, 'fi');
  assert.equal(korkonfig(id('carashell'), {}).supportmail, 'hello@carashell.com');
  assert.equal(korkonfig(id('carashell'), {}).svar.sparning_prefix, 'CS-');
  assert.equal(korkonfig(id('carashell'), {}).brand, 'CaraShell', 'fabriksfilens namn står kvar');
  assert.equal(korkonfig(id('baverbutiken'), {}).svar.signatur, 'Kundtjänst Bäverbutiken');
  assert.deepEqual(korkonfig(id('tacklebay'), {}).svar.leverans_dagar, [7, 14], 'fabriksbutikens 5–10 arbetsdagar → 7–14 kalenderdagar');
  // Domänsuffixet: SHOPIFY_SHOP_NO bär Beverbutikkens domän ⇒ nycklarna _NO används fast brandet heter beverbutikken.
  const env = { SHOPIFY_SHOP_NO: '1acuam-s5.myshopify.com', SHOPIFY_CLIENT_ID_NO: 'id', SHOPIFY_CLIENT_SECRET_NO: 'hemligt' };
  const k = korkonfig({ ...id('beverbutikken'), shopify: {} }, env);
  assert.equal(k.shopify.vag, 'client_credentials');
  assert.equal(k.shopify.clientId, 'id');
  // Brandets egna nycklar vinner över domänsuffixet.
  const k2 = korkonfig({ ...id('beverbutikken'), shopify: {} }, { ...env, SHOPIFY_CLIENT_ID_BEVERBUTIKKEN: 'egen', SHOPIFY_CLIENT_SECRET_BEVERBUTIKKEN: 'x' });
  assert.equal(k2.shopify.clientId, 'egen');
});
