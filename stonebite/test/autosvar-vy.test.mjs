// Autosvaret på sajten: Kundtjänst-sidan, varumärkets flik och "Kräver dig i dag".
//
// Axels beställning 2026-09-22: "alla cases som AI-botten har svarat på, där
// det är arga kunder, ska komma upp som en lista på kundtjänst-taben". Och
// hans osäkerhet samma kväll — "jag vet inte om den är aktiv och faktiskt
// skickar mail" — ska sidan svara på i klartext: utkast är inte skickat.
// Ingen snapshot krävs, inget nät: allt är fejkdata i samma form som
// kundtjanst/dashboard.mjs samlaAutosvar ger.

import test from 'node:test';
import assert from 'node:assert/strict';
import { kundtjanstSida, autosvarBlock, autosvarLage, butiksnamnFor, botfallFor, botfallGrupper, lovatSvar, botSvarText, nastaStegText } from '../vy/drift.mjs';
import { brandData } from '../vy/varumarke.mjs';
import { oversiktSida } from '../vy/oversikt.mjs';
import { sattSprak } from '../vy/delar.mjs';

const NU = new Date('2026-09-22T18:00:00Z');

const ARG_UTKAST = {
  nyckel: 'a1a1a1a1a1a1a1a1', tid: '2026-09-22T00:04:00.000Z', uid: 7, hink: 'ARG', typ: null, kategori: 'skadad_defekt', ordernummer: ['6600'], kund: 'mo***@gmail.com', sprak: 'sv',
  amne: 'Trasig vara', kontaktformular: false, atgard: 'utkast', torr: true, flaggad: true, flyttad: 'INBOX.VA-PRIO', orsak: 'kvalitet', orsakEn: 'product quality', x: 'kvalitet', lage: false, retur: false, opostadDagar: null, foton: true, fotonTyp: 'vara', behoverOrdernummer: false,
};
const ARG_SKICKAT = {
  nyckel: 'b2b2b2b2b2b2b2b2', tid: '2026-09-20T10:00:00.000Z', uid: 3, hink: 'ARG', typ: null, kategori: 'fel_vara', ordernummer: [], kund: 'to***@gmail.com', sprak: 'sv',
  amne: 'Ser inte ut som på bilden', kontaktformular: false, atgard: 'svar', torr: false, flaggad: true, flyttad: 'INBOX.VA-PRIO', orsak: 'som på bilden', orsakEn: 'not as pictured', x: 'som_pa_bilden', lage: false, retur: false, opostadDagar: null, foton: true, fotonTyp: 'leverans', behoverOrdernummer: true,
};
// Micke Stigberg 2026-09-23 13:42 CEST: bottens första skarpa arga svar. Mechile svarade 15:28 utan att se det.
const ARG_MICKE = {
  nyckel: 'c3c3c3c3c3c3c3c3', tid: '2026-09-22T11:42:00.000Z', uid: 9, hink: 'ARG', typ: null, kategori: 'fel_vara', ordernummer: ['6912'], kund: 'mi***@gmail.com', sprak: 'sv',
  amne: 'Passar inte', kontaktformular: false, atgard: 'svar', torr: false, flaggad: true, flyttad: 'INBOX.VA-PRIO', orsak: 'argt ordval', orsakEn: 'angry wording', x: 'fel_vara', lage: false, retur: false, opostadDagar: null, foton: true, fotonTyp: 'leverans', behoverOrdernummer: false,
};
// ENKEL-svar: ett WISMO som är klart, och en bildförfrågan som VA:n ska följa upp.
const ENKEL_WISMO = {
  nyckel: 'd4d4d4d4d4d4d4d4', tid: '2026-09-22T15:00:00.000Z', uid: 11, hink: 'ENKEL', typ: 'wismo', kategori: 'var_ar_ordern', ordernummer: ['7001'], kund: 'an***@telia.com', sprak: 'sv',
  amne: 'Var är min order', kontaktformular: false, atgard: 'svar', torr: false, flaggad: false, flyttad: null, orsak: 'enkel', orsakEn: 'simple', fotonTyp: null,
};
const ENKEL_FOTON = {
  nyckel: 'e5e5e5e5e5e5e5e5', tid: '2026-09-22T16:00:00.000Z', uid: 12, hink: 'ENKEL', typ: 'foton', kategori: 'skadad_defekt', ordernummer: ['7002'], kund: 'ha***@telia.com', sprak: 'sv',
  amne: 'Pumpen läcker', kontaktformular: false, atgard: 'svar', torr: false, flaggad: true, flyttad: 'INBOX.VA-PRIO', orsak: 'bildförfrågan', orsakEn: 'simple', fotonTyp: 'vara',
};

function autosvar({ arga = [ARG_UTKAST], svarade = [], svar = 0, utkast = 1, senaste = '2026-09-22T08:15:52.572Z', brand = 'baverbutiken' } = {}) {
  return {
    dagar: 30, hamtad: NU.toISOString(), etiketter: { x: { som_pa_bilden: 'not as pictured', fel_vara: 'wrong item' }, typ: {} },
    brands: {
      [brand]: {
        brand, period: { fran: '2026-08-23T18:00:00.000Z', till: NU.toISOString(), dagar: 30 },
        senasteKorning: senaste, antalKorningar: 5,
        antal: { mejl: 102, arenden: 71, ENKEL: 6, ARG: arga.length, 'SVÅR': 63, SKIP: 31, svar, utkast, flaggade: 66, tillVa: 64, fel: 0, kontaktformular: 12 },
        perTyp: {}, perKategori: {}, perSprak: {}, perAtgard: {}, perDag: [],
        // svarade = ALLA rader med svar/utkast, precis som oversikt.mjs ger dem (ARG-raderna står i båda listorna).
        arga, svarade: [...svarade, ...arga.filter((r) => ['svar', 'utkast'].includes(r.atgard))], tillVa: [], fel: [], brevlada: null,
      },
    },
  };
}

const SNAPSHOT = {
  byggd: NU.toISOString(),
  butiker: [{ id: 'baverbutiken', namn: 'Bäverbutiken', valuta: 'SEK', status: 'ok', dagar: [], ordrar: 0 }],
  kundtjanst: { status: 'saknas', orsak: 'ingen veckorapport i testet', brands: [] },
  oppnaTvister: [],
  rutiner: { rutiner: [], summering: null },
  eskalering: { kanaler: [] },
  varumarken: [{ id: 'baverbutiken', namn: 'Bäverbutiken' }],
  autosvar: autosvar(),
};

test('Kundtjänst-sidan visar autosvaret även utan veckorapport: läget i klartext, och torrkörningens utkast som utkast', () => {
  sattSprak('sv');
  const html = kundtjanstSida({ snapshot: SNAPSHOT, nu: NU }).innehall;
  assert.match(html, /id="ai-boten"/);
  assert.match(html, /AI-boten har svarat/);
  assert.match(html, /bara utkast — inget skickas/, 'noll skickade + utkast ⇒ boten är inte igång, och det står');
  assert.match(html, /102 mejl lästa på 30 dagar/);
  // Ett utkast nådde aldrig kunden: det står i den hopfällda listan, aldrig som ett kort att följa upp.
  assert.match(html, /Torrkörningens utkast, kunden fick inget · 1/);
  assert.match(html, /#6600/);
  assert.match(html, /utkast — inte skickat/);
  assert.match(html, /INBOX\.VA-PRIO/);
  assert.match(html, /kvalitet/);
  assert.match(html, /Ingenting att följa upp/);
  assert.doesNotMatch(html, /Markera som uppföljd/, 'inget skickat svar ⇒ inget att bocka');
  assert.doesNotMatch(html, /mo\*\*\*@gmail\.com/, 'kundens adress visas inte — ordernumret är nyckeln');
  assert.match(html, /Ingen veckorapport än/, 'veckorapportens tomrad står kvar under');
});

test('varje skickat botsvar blir ett kort: arga överst med badge och 48-timmarsklocka, bildförfrågan att följa upp, WISMO klart', () => {
  sattSprak('sv');
  const a = autosvar({ arga: [ARG_MICKE, ARG_SKICKAT], svarade: [ENKEL_WISMO, ENKEL_FOTON], svar: 4, utkast: 0 });
  const html = autosvarBlock(a, { nu: NU, namnFor: () => 'Bäverbutiken', csrf: 'nyckel123' });
  // Badge med ORD, inte bara färg. Ordernumret stort, botens svar och nästa steg i klartext.
  assert.match(html, /ARG KUND · AI-boten svarade/);
  assert.match(html, /class="botfall-order">#6912/);
  assert.match(html, /Vad boten skrev:<\/b> Lugnande svar: &quot;jag förstår helt din frustration&quot;, problemet i klartext \(fel vara\), eskalerat som brådskande, lovade svar inom 48 timmar\. Bad om bilder \(varan, förpackningen och fraktetiketten\)\./);
  assert.match(html, /Nästa steg för dig:<\/b> Skriv till kunden inom 48 timmar från botens svar, som Head of Customer Support/);
  // Klockan räknar från botens svar: Micke 11:42Z + 48 h = 24/9 11:42Z, NU är 22/9 18:00Z ⇒ 42 h kvar.
  assert.match(html, /Svar lovat senast 24 sep\. 13:42/);
  assert.match(html, /42 h kvar/);
  // Tobias (ARG_SKICKAT, 20/9 10:00Z) passerade för 8 timmar sedan — och det står med versaler.
  assert.match(html, /LÖFTET PASSERAT, för 8 h sedan/);
  // Bildförfrågan (flaggad + VA-PRIO) ska följas upp; WISMO är klart och står under sin egen rubrik.
  assert.match(html, /Beklagade \(&quot;det tittar vi på direkt&quot;\) och bad om bilder \(bild eller kort video på varan där felet syns\)/);
  assert.match(html, /Kolla om bilderna kommit/);
  assert.match(html, /Boten svarade klart/);
  assert.match(html, /Svarade var paketet är: senaste skanningen, spårningslänken och paketnumret\./);
  // Knappen på varje kort, med nyckeln — och aldrig kundens adress.
  assert.equal((html.match(/Markera som uppföljd/g) ?? []).length, 4);
  assert.match(html, /name="nyckel" value="c3c3c3c3c3c3c3c3"/);
  assert.match(html, /action="\/app\/autosvar\/uppfoljd"/);
  assert.doesNotMatch(html, /\*\*\*@/);
  // Ordningen i "Att följa upp": ARG först (äldst först), sedan bildförfrågan.
  const g = botfallGrupper(botfallFor(a));
  assert.deepEqual(g.attFoljaUpp.map((f) => f.nyckel), ['b2b2b2b2b2b2b2b2', 'c3c3c3c3c3c3c3c3', 'e5e5e5e5e5e5e5e5']);
  assert.deepEqual(g.klara.map((f) => f.nyckel), ['d4d4d4d4d4d4d4d4']);
  assert.deepEqual(g.utkast, []);
  assert.deepEqual(g.arkiv, []);
});

test('bocken: ett uppföljt kort lämnar listan och står i arkivet med vem och när — Ångra tar tillbaka det', () => {
  sattSprak('sv');
  const a = autosvar({ arga: [ARG_MICKE], svarade: [ENKEL_WISMO], svar: 2, utkast: 0 });
  const upp = { c3c3c3c3c3c3c3c3: { nyckel: 'c3c3c3c3c3c3c3c3', uppfoljd: true, tid: '2026-09-22T14:02:00.000Z', av: 'Mechile Delos Santos' } };
  const html = autosvarBlock(a, { nu: NU, namnFor: () => 'Bäverbutiken', csrf: 'nyckel123', uppfoljning: upp });
  assert.match(html, /Ingenting att följa upp/);
  assert.match(html, /Uppföljda \(arkiv\) · 1/);
  assert.match(html, /Uppföljd av:<\/b> Mechile Delos Santos · 22 sep\. 16:02/);
  assert.match(html, /action="\/app\/autosvar\/oppna"/);
  assert.match(html, /Ångra/);
  assert.doesNotMatch(html, /Svar lovat senast/, 'klockan tickar inte på ett uppföljt kort');
  // Samma sak med en Map (servern ger ett objekt, koden får ge vad som helst).
  const g = botfallGrupper(botfallFor(a, { uppfoljning: new Map(Object.entries(upp)) }));
  assert.deepEqual(g.arkiv.map((f) => f.nyckel), ['c3c3c3c3c3c3c3c3']);
  // Ångrad bock ⇒ tillbaka i listan.
  const g2 = botfallGrupper(botfallFor(a, { uppfoljning: { c3c3c3c3c3c3c3c3: { ...upp.c3c3c3c3c3c3c3c3, uppfoljd: false } } }));
  assert.deepEqual(g2.attFoljaUpp.map((f) => f.nyckel), ['c3c3c3c3c3c3c3c3']);
});

test('utan csrf ritas inga knappar — och en rad utan nyckel får reserven uid|tid', () => {
  sattSprak('sv');
  const a = autosvar({ arga: [ARG_MICKE], svar: 1, utkast: 0 });
  assert.doesNotMatch(autosvarBlock(a, { nu: NU }), /<form/);
  const { nyckel, ...utanNyckel } = ENKEL_WISMO;
  const fall = botfallFor(autosvar({ arga: [], svarade: [utanNyckel], svar: 1, utkast: 0 }));
  assert.equal(fall[0].nyckel, '11|2026-09-22T15:00:00.000Z');
});

test('lovatSvar, botSvarText och nastaStegText på båda språken', () => {
  sattSprak('en');
  const lov = lovatSvar(ARG_MICKE, { nu: NU });
  assert.equal(lov.ton, 'neutral');
  assert.equal(lov.text, '42 h left');
  assert.equal(lovatSvar(ARG_MICKE, { nu: new Date('2026-09-24T02:00:00Z') }).ton, 'kritisk', 'under 12 h kvar är kritiskt');
  assert.equal(lovatSvar(ARG_MICKE, { nu: new Date('2026-09-23T14:00:00Z') }).ton, 'varning', 'under 24 h kvar är varning');
  assert.equal(lovatSvar(ARG_SKICKAT, { nu: NU }).text, 'PROMISE PASSED, 8 h ago');
  assert.equal(lovatSvar({ tid: 'trasigt' }, { nu: NU }), null);
  assert.match(botSvarText(ARG_MICKE, { etiketter: { x: { fel_vara: 'wrong item' } } }), /^Calming reply: "I fully understand your frustration", the problem in plain words \(wrong item\), escalated as urgent, promised a reply within 48 hours\. Asked for photos \(the item, the packaging and the shipping label\)\.$/);
  assert.match(botSvarText({ ...ARG_SKICKAT, lage: true, retur: true, opostadDagar: 13 }), /sat unshipped for 13 days.*where the parcel is right now.*Sent the return instructions.*Asked for the order number/);
  assert.equal(botSvarText(ENKEL_WISMO), 'Answered where the parcel is: the latest scan, the tracking link and the parcel number.');
  assert.match(botSvarText({ ...ENKEL_FOTON, fotonTyp: 'passform' }), /a photo of the item in place, plus measurements or model/);
  assert.match(botSvarText({ hink: 'ENKEL', typ: 'retur' }), /^Sent the return instructions/);
  assert.match(botSvarText({ hink: 'ENKEL', typ: 'nytt' }), /^Replied \(nytt\)/);
  assert.match(nastaStegText(ARG_MICKE), /as Head of Customer Support: the case was escalated to you personally/);
  assert.match(nastaStegText(ENKEL_FOTON), /Check whether the photos have arrived/);
  assert.match(nastaStegText(ENKEL_WISMO), /^Nothing, unless the customer writes again/);
  assert.match(nastaStegText({ hink: 'ENKEL', typ: 'levererad' }), /Package missing after tracking shows delivered/);
  assert.match(nastaStegText({ hink: 'ENKEL', typ: 'adress', flaggad: true }), /handed the thread to you/);
  sattSprak('sv');
  assert.equal(lovatSvar(ARG_MICKE, { nu: NU }).text, '42 h kvar');
  assert.match(botSvarText(ARG_MICKE), /problemet i klartext \(fel vara\)/);
  assert.match(nastaStegText(ENKEL_WISMO), /^Inget, om inte kunden skriver igen/);
});

test('en bot som skickat riktiga svar får grönt — och står stilla efter ett dygn utan körning', () => {
  const skarpt = autosvar({ arga: [ARG_SKICKAT], svar: 4, utkast: 0, senaste: '2026-09-22T17:00:00.000Z' }).brands.baverbutiken;
  assert.deepEqual(autosvarLage(skarpt, NU), { ton: 'bra', ord: 'skickar svar', skarpt: true, stilla: false, fel: 0 });
  const stilla = autosvar({ arga: [ARG_SKICKAT], svar: 4, utkast: 0, senaste: '2026-09-20T17:00:00.000Z' }).brands.baverbutiken;
  assert.equal(autosvarLage(stilla, NU).ord, 'skickar svar — men stod stilla senaste dygnet');
  assert.equal(autosvarLage({ antal: { svar: 0, utkast: 0 }, senasteKorning: null }, NU).ord, 'inget svar skrivet');
});

test('skrivfel vinner över allt annat — en bot som inte FÅR skriva ser annars ut som en som inget hade att skriva', () => {
  sattSprak('sv');
  const lage = autosvarLage({ antal: { svar: 0, utkast: 0, fel: 4 }, senasteKorning: '2026-09-22T17:00:00.000Z' }, NU);
  assert.equal(lage.ton, 'kritisk');
  assert.equal(lage.ord, 'kunde inte skriva i brevlådan');
  assert.equal(lage.fel, 4);
  const a = autosvar({ arga: [], utkast: 0 });
  a.brands.baverbutiken.antal.fel = 4;
  const html = autosvarBlock(a, { nu: NU, namnFor: () => 'Bäverbutiken' });
  assert.match(html, /4 skrivfel/);
  assert.match(html, /kunde inte skriva i brevlådan/);
  assert.doesNotMatch(html, /inget svar skrivet/);
  sattSprak('en');
  const enHtml = autosvarBlock(a, { nu: NU, namnFor: () => 'Bäverbutiken' });
  assert.match(enHtml, /4 write errors/);
  assert.match(enHtml, /could not write to the mailbox/);
  sattSprak('sv');
  // Utan fel: raden finns inte alls.
  assert.doesNotMatch(autosvarBlock(autosvar(), { nu: NU }), /skrivfel/);
});

test('ingen logg ⇒ "har inte kört", aldrig noll — och blocket finns ändå', () => {
  sattSprak('sv');
  assert.match(autosvarBlock(null, { nu: NU }), /Autosvaret har inte kört/);
  assert.match(autosvarBlock({ dagar: 30, brands: {} }, { nu: NU }), /inte igång för någon butik/);
  assert.match(autosvarBlock(autosvar(), { nu: NU, bara: ['carashell'] }), /inte igång här/, 'varumärket utan egen logg får sin egen tomrad');
});

test('engelska för VA:n: etiketterna byts, datan (order, orsak på engelska) står kvar', () => {
  sattSprak('en');
  const html = autosvarBlock(autosvar({ arga: [ARG_UTKAST, ARG_MICKE], svar: 1, utkast: 1 }), { nu: NU, namnFor: () => 'Bäverbutiken', csrf: 'x' });
  assert.match(html, /The AI bot has replied/);
  assert.match(html, /102 emails read in 30 days/);
  assert.match(html, /Dry-run drafts, the customer got nothing · 1/);
  assert.match(html, /product quality/, 'orsaken på engelska när sidan är engelsk');
  assert.match(html, /draft — not sent/);
  assert.match(html, /ANGRY CUSTOMER · AI bot replied/);
  assert.match(html, /Reply promised by 24 Sept 13:42/);
  assert.match(html, /42 h left/);
  assert.match(html, /Mark as followed up/);
  assert.match(html, /Your next step:<\/b> Write to the customer within 48 hours/);
  assert.match(html, /\(6 hours ago\)/, 'relativ tid på engelska');
  assert.doesNotMatch(html, /timmar sedan/);
  sattSprak('sv');
});

test('varumärkets flik får bara sina egna butiker ur loggen', () => {
  const snap = { ...SNAPSHOT, autosvar: { ...autosvar(), brands: { ...autosvar().brands, ...autosvar({ brand: 'carashell', arga: [] }).brands } } };
  const bav = brandData({ id: 'baverbutiken', namn: 'Bäverbutiken', butiker: ['baverbutiken'], konton: [], kundtjanst: [], leverans: [] }, snap, { nu: NU });
  assert.deepEqual(Object.keys(bav.autosvar.brands), ['baverbutiken']);
  assert.equal(bav.butiksnamn('baverbutiken'), 'Bäverbutiken');
  const cs = brandData({ id: 'carashell', namn: 'CaraShell', butiker: [], konton: [], kundtjanst: [], leverans: [] }, snap, { nu: NU });
  assert.deepEqual(Object.keys(cs.autosvar.brands), ['carashell']);
  const ops = brandData({ id: 'ops', namn: 'Övriga', butiker: [], konton: [], kundtjanst: [], leverans: [] }, snap, { nu: NU });
  assert.deepEqual(Object.keys(ops.autosvar.brands), [], 'huvudbrandens loggar hamnar aldrig under övriga OPS');
});

test('"Kräver dig i dag" tar upp arga kunder från det senaste dygnet — inte äldre, och inte de VA:n redan bockat', () => {
  sattSprak('sv');
  const snap = { ...SNAPSHOT, autosvar: autosvar({ arga: [ARG_UTKAST, ARG_SKICKAT, ARG_MICKE] }) };
  const html = oversiktSida({ snapshot: snap, anvandare: { roll: 'agare', namn: 'Axel' }, nu: NU }).innehall;
  assert.match(html, /Arg kund #6600 \(Bäverbutiken\) — autosvaret la ett lugnande utkast, VA:n tar över/);
  assert.match(html, /Arg kund #6912 \(Bäverbutiken\) — autosvaret skickade ett lugnande svar, VA:n tar över/);
  assert.doesNotMatch(html, /Arg kund utan ordernummer/, 'den två dagar gamla står inte i dagens lista');
  const bockad = { ...snap, uppfoljning: { c3c3c3c3c3c3c3c3: { uppfoljd: true } } };
  const html2 = oversiktSida({ snapshot: bockad, anvandare: { roll: 'agare', namn: 'Axel' }, nu: NU }).innehall;
  assert.doesNotMatch(html2, /Arg kund #6912/, 'uppföljd ⇒ borta ur dagens lista');
  assert.match(html2, /Arg kund #6600/);
});

test('butiksnamnFor: snapshotens namn först, annars id:t som det är', () => {
  assert.equal(butiksnamnFor(SNAPSHOT, 'baverbutiken'), 'Bäverbutiken');
  assert.equal(butiksnamnFor(SNAPSHOT, 'okand'), 'okand');
});
