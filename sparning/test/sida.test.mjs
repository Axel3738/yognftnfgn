// Tester för kundens spårningssida. Inget nät, ingen webbläsare — men den
// inbäddade uppackarkoden KÖRS här (new Function) mot den inbäddade datan,
// så testet bevisar att sidan faktiskt hittar paketet och inte bara att
// rätt tecken står i rätt ordning.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { byggSidkropp, byggForhandsvisning, uppackarkalla, SIDMARKOR, DATAMARKOR, COPYMARKOR } from '../sida.mjs';
import { isoTillMinut, packaUppEtt } from '../uppacka.mjs';

// --------------------------------------------------------------- fixturen

// Handskriven data i uppackarens format — inte byggd med paketdata.mjs, så
// det här testet inte går sönder av en ändring där. Fraserna och platserna
// är hämtade ur den riktiga mätningen 2026-09-19 (204 paket), översatta.
const KONFIG = {
  butik: { support: 'kundsupport@baverbutiken.se', farg_rod: '#dd1d1d', farg_svart: '#000000', farg_ram: '#e8e8e1' },
  frakt: { sparning_vaknar: '2–4 dagar' },
};

const min = (iso) => isoTillMinut(iso);

function fixtur() {
  return {
    v: 1,
    byggd: min('2026-09-19T06:16:00Z'),
    f: [
      'Paketet är på väg',
      'Vi har fått uppgifterna om paketet',
      'Paketet har lämnat terminalen',
      'Paketet är levererat',
    ],
    p: ['Malmö', 'Shenzhen'],
    b: ['YunExpress', '4PX'],
    k: {
      // på väg, tre skanningar, nyast först
      YT2626100708674690: [1, 0, [
        [min('2026-09-18T13:39:00Z'), 0, 0],
        [min('2026-09-16T09:12:00Z'), 2, 1],
        [min('2026-09-15T10:14:00Z'), 1, -1],
      ]],
      // levererat
      YT2626100708870041: [4, 1, [[min('2026-09-17T12:25:00Z'), 3, 0]]],
      // registrerat men aldrig skannat
      YT2626100708672397: [0, 0, []],
    },
  };
}

// --------------------------------------------------------------- hjälpare

// Innehållet i en <script>-tagg med ett visst id-attribut.
function jsonRuta(kropp, markor) {
  const re = new RegExp('<script type="application/json" ' + markor + '>([\\s\\S]*?)</script>');
  const m = re.exec(kropp);
  assert.ok(m, 'hittade ingen JSON-ruta med ' + markor);
  return m[1];
}

// Sista <script>-taggen: uppackaren + sidans eget skript.
function kodrutan(kropp) {
  const bitar = kropp.split('<script>');
  const sista = bitar[bitar.length - 1];
  return sista.slice(0, sista.indexOf('</script>'));
}

// Kundens synliga text: allt utom <style>, <script> och taggarna själva.
function kundtext(kropp) {
  return kropp
    .replace(/<style>[\s\S]*?<\/style>/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

// Ord som avslöjar att engelska läckt in i kundens text. Listan är medvetet
// vardaglig — det är den sortens ord som slinker med från ett API-svar eller
// en halvöversatt mall. Svenska homografer (status, support, transport) står
// INTE här, de är riktiga svenska ord.
const ENGELSKA = [
  'tracking', 'shipment', 'parcel', 'delivered', 'delivery', 'package', 'carrier',
  'search', 'please', 'your', 'email', 'loading', 'error', 'submit', 'sorry',
  'arrived', 'departed', 'customs', 'facility', 'pickup', 'the', 'and', 'with',
  'not', 'found', 'number', 'date', 'here', 'click', 'shipping', 'estimated',
];

function engelskaOrdI(text) {
  const låg = ' ' + text.toLowerCase() + ' ';
  return ENGELSKA.filter((ord) => new RegExp('(^|[^a-zåäö])' + ord + '([^a-zåäö]|$)').test(låg));
}

// Alla strängVÄRDEN i ett objekt (inte nycklarna — statuskoderna CONFIRMED,
// DELIVERED … är nycklar och är format, inte text kunden ser).
function strangvarden(v, ut = []) {
  if (typeof v === 'string') ut.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strangvarden(x, ut));
  else if (v && typeof v === 'object') Object.keys(v).forEach((k) => strangvarden(v[k], ut));
  return ut;
}

// ------------------------------------------------- DOM-attrapp för körning

// Så mycket DOM som sidans skript rör, och inte ett dugg mer. Med den kan
// hela skriptet köras här: kunden kommer med ?nummer=…, skriptet slår upp
// paketet och skriver texten — det är den kontrollen som visar att sidan
// fungerar, inte att rätt tecken står i rätt ordning.
class Attrapp {
  constructor(tagg) {
    this.tagg = tagg; this.barn = []; this.attr = {}; this.hidden = false;
    this._text = ''; this.className = ''; this.value = ''; this.lyssnare = {};
  }
  appendChild(b) { this.barn.push(b); return b; }
  setAttribute(k, v) { this.attr[k] = v; }
  addEventListener(n, f) { this.lyssnare[n] = f; }
  get textContent() { return this._text + this.barn.map((b) => b.textContent).join(''); }
  set textContent(v) { this._text = String(v); this.barn = []; }
  scrollIntoView() {}
  focus() {}
}

const IDN = ['bb-spar', 'bbs-sok', 'bbs-traff', 'bbs-saknas', 'bbs-falt', 'bbs-form', 'bbs-fel',
  'bbs-lista', 'bbs-tom', 'bbs-annat', 'bbs-rubrik', 'bbs-ingress', 'bbs-bolag', 'bbs-nummer', 'bbs-byggd'];

// Delar en adress i `search` och `hash` som en webbläsare gör. Tidigare lade
// attrappen HELA adressen i `location.search`, och då såg "#nummer=…"-testet
// grönt ut utan att hash-vägen kördes en enda gång — regexen matchar "#" lika
// gärna i söksträngen. Nu hamnar delarna där de faktiskt hamnar.
function delaAdress(adress) {
  const a = String(adress ?? '');
  const i = a.indexOf('#');
  if (i < 0) return { search: a, hash: '' };
  return { search: a.slice(0, i), hash: a.slice(i) };
}

// Vilka id:n som föds med attributet `hidden` i den byggda kroppen. Utan den
// här avläsningen startade varje attrapp som synlig, och ett test kunde se
// grönt ut för en ruta som skriptet aldrig hade visat.
function doldaFranStart(kropp) {
  const ut = new Set();
  for (const t of kropp.matchAll(/<[a-z]+[^>]*>/g)) {
    const id = /\bid="([^"]+)"/.exec(t[0]);
    if (id && /\shidden(\s|>)/.test(t[0])) ut.add(id[1]);
  }
  return ut;
}

function kor(kropp, adress) {
  const noder = new Map(IDN.map((id) => [id, new Attrapp('div')]));
  for (const id of doldaFranStart(kropp)) if (noder.has(id)) noder.get(id).hidden = true;
  for (const markor of [DATAMARKOR, COPYMARKOR]) {
    const ruta = new Attrapp('script');
    // Webbläsaren ser textinnehållet oeskapat; "<\/" är bara skrivsättet i HTML.
    ruta.textContent = jsonRuta(kropp, markor).replace(/<\\\//g, '</');
    noder.set(markor.slice(4, -1), ruta);
  }
  noder.adresser = [];
  // Globalerna läggs tillbaka efteråt — node:test kör alla tester i samma
  // process.
  const medDom = (adr, gor) => {
    const forra = { d: globalThis.document, l: globalThis.location, h: globalThis.history };
    const { search, hash } = delaAdress(adr);
    globalThis.document = { getElementById: (id) => noder.get(id) ?? null, createElement: (t) => new Attrapp(t) };
    globalThis.location = { search, hash, pathname: '/pages/spara-paketet' };
    globalThis.history = { replaceState: (a, b, url) => noder.adresser.push(url) };
    try { gor(); } finally {
      globalThis.document = forra.d; globalThis.location = forra.l; globalThis.history = forra.h;
    }
  };
  medDom(adress ?? '', () => new Function(kodrutan(kropp))());
  // Kundens sökning i fältet, efter att sidan laddats. `adr` är adressen som
  // står i fältet när hen söker — den spelar roll, för numret skrivs in i den.
  noder.sok = (nummer, adr) => medDom(adr ?? '', () => {
    noder.get('bbs-falt').value = nummer;
    noder.get('bbs-form').lyssnare.submit({ preventDefault() {} });
  });
  noder.klicka = (id) => medDom('', () => noder.get(id).lyssnare.click({}));
  return noder;
}

// Klockslag som alltid hamnar på samma dygn i svensk tid (10:00 UTC är
// 11 eller 12 på dagen i Stockholm, aldrig över ett dygnsskifte).
function klockanTio(dagarBak) {
  const idag = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Stockholm' }).split('-').map(Number);
  const d = new Date(Date.UTC(idag[0], idag[1] - 1, idag[2], 10, 0, 0));
  d.setUTCDate(d.getUTCDate() - dagarBak);
  return d.toISOString();
}

// --------------------------------------------------------------- testerna

test('markörerna publiceraren letar efter finns i kroppen', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG);
  assert.equal(SIDMARKOR, 'id="bb-spar"');
  assert.equal(DATAMARKOR, 'id="bb-spar-data"');
  assert.ok(kropp.includes(SIDMARKOR), 'sidmarkören saknas');
  assert.ok(kropp.includes(DATAMARKOR), 'datamarkören saknas');
  assert.ok(kropp.includes(COPYMARKOR), 'copymarkören saknas');
  assert.ok(kropp.trimStart().startsWith('<div id="bb-spar">'), 'kroppen ska börja med sidans egen div');
});

test('datan går att JSON-tolka ur kroppen och är oförändrad', () => {
  const data = fixtur();
  const kropp = byggSidkropp(data, KONFIG);
  const ur = JSON.parse(jsonRuta(kropp, DATAMARKOR));
  assert.deepEqual(ur, data, 'datan i sidan är inte samma data som byggdes');
  // Rutan bär paketdatan RAKT, utan hölje — annars kan ingen annan läsare
  // köra uppacka.mjs på den.
  assert.equal(ur.v, 1);
  assert.ok(ur.k.YT2626100708674690, 'paketet saknas i den inbäddade datan');
});

test('"</" är eskapat i båda JSON-rutorna', () => {
  const data = fixtur();
  // En skanningstext som skulle stänga script-taggen om den inte eskapas.
  data.f.push('Paketet skannades </script> i terminalen');
  data.p.push('Malmö </b> Syd');
  const kropp = byggSidkropp(data, KONFIG);
  const rutan = jsonRuta(kropp, DATAMARKOR);
  assert.ok(!rutan.includes('</'), 'en oeskapad "</" i datan stänger <script>-taggen');
  assert.ok(rutan.includes('<\\/script>'), 'eskapningen "<\\/" saknas');
  assert.ok(!jsonRuta(kropp, COPYMARKOR).includes('</'));
  // Och sidan ska fortfarande ha exakt fyra taggslut: style + 2 json + kod.
  assert.equal((kropp.match(/<\/script>/g) || []).length, 3);
  assert.equal(JSON.parse(rutan).f[4], 'Paketet skannades </script> i terminalen');
});

test('uppackarens källkod ligger i sidan, utan ordet export', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG);
  const kod = kodrutan(kropp);
  const fil = readFileSync(new URL('../uppacka.mjs', import.meta.url), 'utf8');
  assert.ok(fil.includes('export function packaUppEtt('), 'filen har inte den form testet antar');
  assert.ok(kod.includes('function packaUppEtt('), 'uppackaren finns inte i sidan');
  assert.ok(kod.includes('function nyckel('), 'nyckel() finns inte i sidan');
  assert.ok(!/\bexport\s/.test(kod), 'ordet "export" står kvar och sidan kraschar direkt');
  assert.ok(!kod.includes('</'), '"</" i koden skulle stänga <script>-taggen');
  assert.ok(uppackarkalla().includes('const STATUSAR = ['), 'statustabellen följde inte med');
  // Uppackaren står EN gång i sidan — två kopior skulle kunna glida isär.
  assert.equal((kod.match(/function packaUppEtt\(/g) || []).length, 1);
});

test('den inbäddade koden kör och hittar rätt paket i den inbäddade datan', () => {
  const data = fixtur();
  const kropp = byggSidkropp(data, KONFIG);
  const kod = kodrutan(kropp);
  // Bara uppackardelen — resten kräver en DOM. Höljet (IIFE:n) skalas av i
  // båda ändar, annars är parentesen oavslutad.
  const start = kod.indexOf('"use strict";') + '"use strict";'.length;
  const gräns = kod.indexOf("var rot = document.getElementById('bb-spar');");
  assert.ok(start > 12 && gräns > start, 'hittade inte gränsen mellan uppackaren och sidans skript');
  const uppackare = new Function(
    kod.slice(start, gräns) + '\nreturn { packaUppEtt: packaUppEtt, nyckel: nyckel, minutTillIso: minutTillIso };',
  )();

  const ur = JSON.parse(jsonRuta(kropp, DATAMARKOR));
  const p = uppackare.packaUppEtt(ur, 'yt 2626-1007-0867-4690');   // kunden klistrar slarvigt
  assert.ok(p, 'sidans egen uppackare hittade inte paketet');
  assert.equal(p.nummer, 'YT2626100708674690');
  assert.equal(p.bolag, 'YunExpress');
  assert.equal(p.statusKod, 'IN_TRANSIT');
  assert.equal(p.status, 'På väg');
  assert.equal(p.handelser.length, 3);
  assert.equal(p.handelser[0].text, 'Paketet är på väg');
  assert.equal(p.handelser[0].plats, 'Malmö');
  assert.equal(p.handelser[0].iso, '2026-09-18T13:39:00.000Z');
  assert.equal(p.handelser[2].plats, null, 'platsindex -1 ska bli null');

  // Samma svar som Node-sidans uppackare ger på samma data — ett format, en
  // uppackare.
  assert.deepEqual(
    uppackare.packaUppEtt(ur, 'YT2626100708870041'),
    packaUppEtt(ur, 'YT2626100708870041'),
  );
  assert.equal(uppackare.packaUppEtt(ur, 'YT0000000000000000'), null);
  assert.equal(uppackare.minutTillIso(ur.byggd), '2026-09-19T06:16:00.000Z');
});

test('inga externa resurser — inga URL:er alls i sidan', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG);
  assert.ok(!/https?:\/\//.test(kropp), 'sidan pekar ut på nätet');
  assert.ok(!/<img/i.test(kropp), 'ingen bild ska laddas');
  assert.ok(!/@import|url\(/.test(kropp), 'ingen CSS-import och inget url() i stilen');
  assert.ok(!/<link/i.test(kropp), 'inget typsnitt och inget stilark utifrån');
  // Butikslänken är relativ så den fungerar på varje domän och marknad.
  assert.ok(kropp.includes('href="/"'));
  assert.ok(kropp.includes('mailto:kundsupport@baverbutiken.se'));
});

test('all CSS är avgränsad under #bb-spar', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG);
  const stil = /<style>([\s\S]*?)<\/style>/.exec(kropp)[1];
  assert.ok(stil.length > 500, 'stilen ser tom ut');
  const utanMedia = stil.replace(/@media[^{]*\{/g, '');
  const selektorer = [...utanMedia.matchAll(/(?:^|\})\s*([^{}]+)\{/g)].map((m) => m[1].trim());
  assert.ok(selektorer.length > 10, 'hittade för få selektorer för att testet ska betyda något');
  for (const s of selektorer) {
    assert.ok(s.startsWith('#bb-spar'), 'selektorn läcker ut i temat: ' + s);
  }
});

test('ingen engelska i kundens text', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG);
  const text = kundtext(kropp);
  assert.ok(text.includes('Spåra ditt paket'));
  assert.deepEqual(engelskaOrdI(text), [], 'engelska ord i den synliga texten');
  // Och i texterna skriptet skriver ut.
  const copy = JSON.parse(jsonRuta(kropp, COPYMARKOR));
  for (const v of strangvarden(copy)) {
    assert.deepEqual(engelskaOrdI(v), [], 'engelska ord i copyn: ' + v);
  }
  assert.equal(copy.rubriker.DELIVERED, 'Paketet är levererat');
  assert.equal(copy.idag, 'i dag');
  assert.equal(copy.igar, 'i går');
});

test('paket utan skanningar får väntetiden ur konfigurationen', () => {
  const copy = JSON.parse(jsonRuta(byggSidkropp(fixtur(), KONFIG), COPYMARKOR));
  assert.equal(copy.tom, 'Paketet är bokat. Fraktbolaget har inte skannat det än — det brukar ta 2–4 dagar.');

  // Annan konfiguration ⇒ annan siffra. Sidan bär ingen egen.
  const annan = JSON.parse(jsonRuta(byggSidkropp(fixtur(), { frakt: { sparning_vaknar: '5–7 dagar' } }), COPYMARKOR));
  assert.ok(annan.tom.includes('5–7 dagar'));
  assert.ok(!annan.tom.includes('2–4'));
});

test('utan väntetid i konfigurationen hittas ingen på', () => {
  const kropp = byggSidkropp(fixtur(), {});
  const copy = JSON.parse(jsonRuta(kropp, COPYMARKOR));
  assert.equal(copy.tom, 'Paketet är bokat. Fraktbolaget har inte skannat det än.');
  assert.ok(!/\d\s*[–-]\s*\d\s*dagar/.test(kundtext(kropp)), 'sidan lovar en tid som inte står i konfigurationen');
  // Supportadressen har en dokumenterad reserv (samma som status.mjs).
  assert.ok(kropp.includes('mailto:kundsupport@baverbutiken.se'));
});

test('sidan säger när datan byggdes och hämtar den ur datan', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG);
  const copy = JSON.parse(jsonRuta(kropp, COPYMARKOR));
  assert.ok(copy.uppdaterad.includes('{{tid}}'), 'tiden ska fyllas i av skriptet, inte brännas in');
  assert.ok(copy.uppdaterad.startsWith('Uppdaterad '));
  assert.ok(kropp.includes('id="bbs-byggd"'), 'raden som bär tiden saknas');
  assert.equal(JSON.parse(jsonRuta(kropp, DATAMARKOR)).byggd, min('2026-09-19T06:16:00Z'));
});

test('tillgängligheten: label, knappar och svensk sida', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG);
  assert.ok(/<label for="bbs-falt">/.test(kropp), 'fältet saknar riktig label');
  assert.ok(/<input id="bbs-falt"/.test(kropp));
  assert.ok(/<button type="submit"/.test(kropp), 'sökningen ska vara en riktig knapp i ett formulär');
  assert.ok(/<form id="bbs-form"/.test(kropp));
  assert.ok(kropp.includes(':focus-visible'), 'fokusmarkeringen saknas');
  assert.ok(/<noscript>/.test(kropp) && kundtext(kropp).includes('behöver JavaScript'));
  assert.ok(/font-size:16px/.test(kropp), 'fältet ska ha 16 px så mobilen inte zoomar in');
  assert.ok(/@media \(max-width:420px\)/.test(kropp), 'ingen mobilanpassning');
});

test('skanningstexter blir aldrig HTML', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG);
  const kod = kodrutan(kropp);
  assert.ok(!kod.includes('innerHTML'), 'allt kundnära skrivs med textContent');
  assert.ok(kod.includes('textContent'));
});

test('sidan körs: numret ur adressen ger rubrik, fakta och hela kedjan', () => {
  const data = fixtur();
  // Tider som alltid landar på samma dygn i svensk tid, så "i dag" och
  // "i går" går att pröva utan att testet kan hamna över ett dygnsskifte.
  data.k.YT2626100708674690[2] = [
    [min(klockanTio(0)), 0, 0],
    [min(klockanTio(1)), 2, 1],
    [min('2026-09-15T10:14:00Z'), 1, -1],
  ];
  data.byggd = min(klockanTio(0));
  const n = kor(byggSidkropp(data, KONFIG), '?nummer=yt 2626-1007-0867-4690');

  assert.equal(n.get('bbs-rubrik').textContent, 'Paketet är på väg');
  assert.equal(n.get('bbs-ingress').textContent, 'Paketet är på väg (Malmö)');
  assert.equal(n.get('bbs-bolag').textContent, 'YunExpress');
  assert.equal(n.get('bbs-nummer').textContent, 'YT2626100708674690');
  assert.equal(n.get('bbs-traff').hidden, false);
  assert.equal(n.get('bbs-sok').hidden, true, 'sökfältet ska inte ligga i vägen när paketet hittades');
  assert.equal(n.get('bbs-saknas').hidden, true);
  assert.equal(n.get('bbs-tom').hidden, true);

  // Tidslinjen: nyast överst, svensk text, ort och tid.
  const rader = n.get('bbs-lista').barn;
  assert.equal(rader.length, 3);
  assert.equal(rader[0].className, 'bbs-rad bbs-rad--nu', 'senaste raden ska bära den röda punkten');
  assert.equal(rader[1].className, 'bbs-rad');
  const rad = (i) => rader[i].barn.map((b) => b.textContent);
  assert.deepEqual(rad(0), ['i dag 12:00', 'Paketet är på väg', 'Malmö']);
  assert.deepEqual(rad(1), ['i går 12:00', 'Paketet har lämnat terminalen', 'Shenzhen']);
  assert.deepEqual(rad(2), ['15 sep 12:14', 'Vi har fått uppgifterna om paketet'], 'utan ort skrivs ingen ortsrad');
  assert.equal(rader[0].barn[0].tagg, 'time');
  assert.equal(rader[0].barn[0].attr.datetime, new Date(klockanTio(0)).toISOString());

  assert.equal(n.get('bbs-byggd').hidden, false);
  assert.equal(n.get('bbs-byggd').textContent, 'Uppdaterad i dag 12:00 · nya skanningar läggs till varje timme');
});

test('sidan körs: utan nummer, utan skanningar, okänt nummer, tomt fält', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG);

  // Kunden kommer utan nummer ⇒ sökfältet, aldrig en tom sida.
  const utan = kor(kropp, '');
  assert.equal(utan.get('bbs-sok').hidden, false);
  assert.equal(utan.get('bbs-traff').hidden, true);
  assert.equal(utan.get('bbs-saknas').hidden, true, 'ingen felruta innan kunden har sökt');

  // Registrerat men aldrig skannat ⇒ besked, ingen tom tidslinje.
  const bokat = kor(kropp, '?nummer=YT2626100708672397');
  assert.equal(bokat.get('bbs-rubrik').textContent, 'Paketet är bokat');
  assert.equal(bokat.get('bbs-lista').hidden, true);
  assert.equal(bokat.get('bbs-tom').hidden, false);
  assert.equal(bokat.get('bbs-tom').textContent,
    'Paketet är bokat. Fraktbolaget har inte skannat det än — det brukar ta 2–4 dagar.');

  // Numret går också att läsa ur #-delen (mejlklienter som tappar ?-delen).
  const viaHash = kor(kropp, '#nummer=YT2626100708870041');
  assert.equal(viaHash.get('bbs-rubrik').textContent, 'Paketet är levererat');
  assert.equal(viaHash.get('bbs-bolag').textContent, '4PX');

  // Okänt nummer ⇒ förklaringen OCH fältet, så kunden kan pröva igen.
  const okant = kor(kropp, '?nummer=YT0000000000000000');
  assert.equal(okant.get('bbs-saknas').hidden, false);
  assert.equal(okant.get('bbs-sok').hidden, false);
  assert.equal(okant.get('bbs-traff').hidden, true);
  assert.equal(okant.get('bbs-falt').value, 'YT0000000000000000', 'numret ska ligga kvar i fältet');

  // Sökningen i fältet fungerar, och tomt fält ger en rad — inte felrutan.
  const s = kor(kropp, '');
  s.sok('  yt-2626 1007 0867 4690 ');
  assert.equal(s.get('bbs-rubrik').textContent, 'Paketet är på väg');
  assert.equal(s.get('bbs-traff').hidden, false);
  s.sok('   ');
  assert.equal(s.get('bbs-fel').hidden, false);
  assert.equal(s.get('bbs-fel').textContent, 'Klistra in numret från leveransmejlet först.');
  assert.equal(s.get('bbs-saknas').hidden, true);
});

// ------------------------------------------------- rättade fel, med vakter

test('numret läses ur #-delen, både "#nummer=" och ett bart "#YT…"', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG);
  // Adressen delas nu som en webbläsare delar den: allt efter "#" ligger i
  // location.hash, ingenting av det i location.search.
  const namngiven = kor(kropp, '#nummer=YT2626100708870041');
  assert.equal(namngiven.get('bbs-rubrik').textContent, 'Paketet är levererat');
  assert.equal(namngiven.get('bbs-traff').hidden, false);

  const bart = kor(kropp, '#YT2626100708674690');
  assert.equal(bart.get('bbs-rubrik').textContent, 'Paketet är på väg');
  assert.equal(bart.get('bbs-traff').hidden, false);

  // Och frågesträngen vinner över ankaret när båda finns.
  const bada = kor(kropp, '?nummer=YT2626100708674690#YT2626100708870041');
  assert.equal(bada.get('bbs-nummer').textContent, 'YT2626100708674690');
});

test('trasig procentkodning i adressen ger sökfältet, aldrig en tom sida', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG);
  // decodeURIComponent('%E0%A4%A') kastar URIError. Före rättningen dog hela
  // skriptet där och kunden fick en helt TOM sida — varje ruta ligger hidden
  // tills skriptet visar den.
  for (const adress of ['?nummer=%E0%A4%A', '#nummer=%E0%A4%A', '#%']) {
    const n = kor(kropp, adress);
    assert.equal(n.get('bbs-sok').hidden, false, 'sökfältet syns inte för adressen ' + adress);
    assert.equal(n.get('bbs-traff').hidden, true);
  }
  // Ett kapat nummer ("…4690%") ska ändå slå upp paketet — nyckel() strippar
  // det som inte är bokstav eller siffra.
  const kapat = kor(kropp, '?nummer=YT2626100708674690%');
  assert.equal(kapat.get('bbs-rubrik').textContent, 'Paketet är på väg');
  // Och ett nummer som ÄR procentkodat på riktigt.
  const ok = kor(kropp, '?nummer=YT2626100708674690%20');
  assert.equal(ok.get('bbs-rubrik').textContent, 'Paketet är på väg');
});

test('en skadad händelse i datan tömmer inte sidan', () => {
  const data = fixtur();
  // En minut utanför Date-intervallet: minutTillIso() gör en ogiltig tid och
  // .toISOString() kastar RangeError mitt i uppackningen.
  data.k.YT2626100708674690[2][0] = [1e18, 0, 0];
  const n = kor(byggSidkropp(data, KONFIG), '?nummer=YT2626100708674690');
  assert.equal(n.get('bbs-saknas').hidden, false, 'kunden ska få förklaringen, inte en tom sida');
  assert.equal(n.get('bbs-sok').hidden, false);
  assert.equal(n.get('bbs-traff').hidden, true);
  // Och de friska paketen på samma sida fungerar fortfarande.
  n.sok('YT2626100708870041');
  assert.equal(n.get('bbs-rubrik').textContent, 'Paketet är levererat');
});

test('en byggd som inte är ett tal fäller inte sidan', () => {
  const data = fixtur();
  data.byggd = '2026-09-19T06:16:00Z';    // fel typ mot formatet
  const n = kor(byggSidkropp(data, KONFIG), '?nummer=YT2626100708870041');
  assert.equal(n.get('bbs-rubrik').textContent, 'Paketet är levererat', 'paketet ska visas ändå');
  assert.equal(n.get('bbs-byggd').hidden, true, 'hellre ingen uppdateringsrad än en påhittad tid');
});

test('trasig JSON i datablocket ger nödläget, inte en tom sida', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG).replace(
    /(<script type="application\/json" id="bb-spar-data">)[\s\S]*?(<\/script>)/,
    '$1{ trasig$2',
  );
  const n = kor(kropp, '?nummer=YT2626100708674690');
  assert.equal(n.get('bbs-sok').hidden, false, 'sökfältet ska visas');
  assert.equal(n.get('bbs-saknas').hidden, false, 'rutan med kundtjänstadressen ska visas');
});

test('hidden går inte att köra över av en display-regel i stilen', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG);
  const stil = /<style>([\s\S]*?)<\/style>/.exec(kropp)[1];

  // Klasser som sätter display någonstans i stilen.
  const medDisplay = new Set();
  for (const rad of stil.split('\n')) {
    const m = /^(.*?)\{(.*)\}$/.exec(rad.trim());
    if (m && /(^|;)\s*display:/.test(m[2])) for (const k of m[1].matchAll(/\.([\w-]+)/g)) medDisplay.add(k[1]);
  }
  // Element som föds med hidden och bär en sådan klass. Webbläsarens egen
  // [hidden]{display:none} ligger i UA-stilmallen och FÖRLORAR mot varje
  // författarregel — de här hade alltså synts hela tiden.
  const krockar = [...kropp.matchAll(/<[a-z]+[^>]*\bhidden\b[^>]*>/g)]
    .map((t) => t[0])
    .filter((t) => {
      const kl = /class="([^"]*)"/.exec(t);
      return kl && kl[1].split(/\s+/).some((k) => medDisplay.has(k));
    });
  assert.ok(krockar.length > 0, 'testet har tappat sitt föremål — ingen krock kvar att skydda mot');
  assert.ok(
    krockar.some((t) => t.includes('id="bbs-annat"')),
    'knappen "Spåra ett annat nummer" är föremålet för spärren',
  );
  assert.match(stil, /#bb-spar \[hidden\]\{display:none!important\}/,
    'utan spärren syns ' + krockar.length + ' element som skriptet har dolt');
});

test('knappen "Spåra ett annat nummer" tömmer fältet och ger det fokus', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG);
  const n = kor(kropp, '');
  n.sok('YT2626100708674690');
  assert.equal(n.get('bbs-traff').hidden, false);
  assert.equal(n.get('bbs-annat').hidden, false, 'knappen visas när ett paket hittats');
  n.klicka('bbs-annat');
  assert.equal(n.get('bbs-sok').hidden, false);
  assert.equal(n.get('bbs-annat').hidden, true);
  assert.equal(n.get('bbs-falt').value, '', 'det gamla numret ska inte ligga kvar i fältet');
});

test('numret skrivs i adressen utan att övriga parametrar tappas', () => {
  const kropp = byggSidkropp(fixtur(), KONFIG);
  const n = kor(kropp, '');
  // Butiken är flermarknads: tappas ?country=NO byter nästa klick land och
  // valuta åt kunden.
  n.sok('YT2626100708674690', '?country=NO&nummer=GAMMALT');
  const sist = n.adresser[n.adresser.length - 1];
  assert.equal(sist, '/pages/spara-paketet?country=NO&nummer=YT2626100708674690');
  assert.equal((sist.match(/nummer=/g) || []).length, 1, 'det gamla numret ska bytas ut, inte staplas på');
});

test('förhandsvisningen är ett helt dokument med samma kropp', () => {
  const data = fixtur();
  const html = byggForhandsvisning(data, KONFIG);
  assert.ok(html.startsWith('<!DOCTYPE html>'));
  assert.ok(html.includes('<html lang="sv">'));
  assert.ok(html.includes(byggSidkropp(data, KONFIG)), 'förhandsvisningen ska bära exakt sidkroppen');
  assert.ok(!/https?:\/\//.test(html), 'förhandsvisningen hämtar något från nätet');
});

test('fel indata stoppas i stället för att bli en tom sida', () => {
  assert.throws(() => byggSidkropp(null, KONFIG), /saknar `k`/);
  assert.throws(() => byggSidkropp({ v: 1, f: [], p: [] }, KONFIG), /saknar `k`/);
  // Tom butik är däremot giltigt — inga paket i fönstret.
  const tom = byggSidkropp({ v: 1, byggd: 0, f: [], p: [], b: [], k: {} }, KONFIG);
  assert.deepEqual(JSON.parse(jsonRuta(tom, DATAMARKOR)).k, {});
});
