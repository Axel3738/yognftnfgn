// Flerbutiksstödet (Axels order 2026-09-20 kväll: samma spårningssystem i
// alla Shopify-butiker) och språklagret. Inget nät.
//
// Det viktigaste testet här är täckningen: VARJE svensk mening som når
// kunden — frasordboken, skedena, delskedena, statusetiketterna, rubrikerna,
// Shopify-meddelandena och sidans egna texter — måste ha en översättning i
// varje språkfil. Saknas en faller den tillbaka på svenska hos en norsk kund,
// tyst. Testet läser meningarna ur källfilerna, inte ur en lista som kan
// glömmas bort.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

import { allaButiker, lasButik, filerFor, butikIdUr, nyckelnamn, KRAVDA_SCOPES } from '../butik.mjs';
import { skapaOversattare, oversattData, SPRAK } from '../oversatt.mjs';
import { STEG, DELSTEG, STATUSAR, packaUppEtt } from '../uppacka.mjs';
import { RUBRIKER, byggSidkropp } from '../sida.mjs';
import { meddelande, planera } from '../status.mjs';
import { byggData } from '../paketdata.mjs';
import { bavernummer, arBavernummer } from '../bavernummer.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ANDRA = ['nb', 'da', 'fi'];

// ------------------------------------------------------------ registret

test('registret: varje butik bär det rundan och sidan behöver', () => {
  const alla = allaButiker();
  assert.ok(alla.length >= 5, 'minst Bäverbutiken + CaraShell + NO + DK + FI');
  const standard = alla.filter((b) => b.standard);
  assert.equal(standard.length, 1, 'exakt en standardbutik');
  assert.equal(standard[0].id, 'baverbutiken');
  for (const b of alla) {
    assert.match(b.url, /^https:\/\/[a-z0-9.-]+$/, `${b.id}: url`);
    assert.match(b.myshopify, /\.myshopify\.com$/, `${b.id}: myshopify`);
    assert.ok(b.ops || b.env_suffix, `${b.id}: nycklar (ops eller env_suffix)`);
    assert.ok(SPRAK[b.sprak], `${b.id}: språk ${b.sprak}`);
    assert.match(b.prefix, /^[A-Z]{2}-$/, `${b.id}: prefix`);
    assert.match(b.handle, /^[a-z-]+$/, `${b.id}: handle`);
    assert.ok(b.titel, `${b.id}: titel`);
    assert.ok(['Sverige', 'Norge', 'Danmark', 'Finland'].includes(b.land), `${b.id}: land ${b.land}`);
  }
  assert.deepEqual(KRAVDA_SCOPES, ['read_orders', 'write_fulfillments', 'write_content']);
});

test('registret: standardbutiken bor i sparning/, de andra i sparning/butiker/<id>/', () => {
  const bb = lasButik();
  assert.equal(bb.id, 'baverbutiken');
  assert.equal(filerFor(bb).lage, join(ROT, 'lage.json'));
  assert.equal(filerFor(bb).konfig, join(ROT, 'konfig.json'));
  const cs = lasButik('carashell');
  assert.equal(cs.prefix, 'CS-');
  assert.equal(filerFor(cs).lage, join(ROT, 'butiker', 'carashell', 'lage.json'));
  assert.equal(filerFor(cs).output, join(ROT, 'butiker', 'carashell', 'output'));
  assert.equal(nyckelnamn(cs).via, 'ops');
  assert.equal(nyckelnamn(lasButik('beverbutikken')).id, 'SHOPIFY_CLIENT_ID_NO');
  assert.throws(() => lasButik('finnsinte'), /Okänd butik/);
  assert.equal(butikIdUr(['--torr', '--butik', 'carashell']), 'carashell');
  assert.equal(butikIdUr(['--torr']), null);
  assert.throws(() => butikIdUr(['--butik', '--torr']), /butiks-id/);
});

// ------------------------------------------------------------ språklagret

test('svenska är identiteten: T(x) === x och inga okända', () => {
  const ov = skapaOversattare('sv');
  assert.equal(ov.T('Paketet är på väg'), 'Paketet är på väg');
  assert.deepEqual(ov.okanda(), []);
  assert.throws(() => skapaOversattare('xx'), /Okänt språk/);
});

test('en mening utan översättning står kvar på svenska och RÄKNAS', () => {
  const ov = skapaOversattare('nb');
  assert.equal(ov.T('Paketet är på väg'), 'Pakken er på vei');
  assert.equal(ov.T('Paketet är på väg.'), 'Pakken er på vei.', 'avslutande punkt tål tabellen');
  assert.equal(ov.T('En påhittad mening som inte finns'), 'En påhittad mening som inte finns');
  assert.deepEqual(ov.okanda(), ['En påhittad mening som inte finns']);
});

// Alla svenska meningar som når kunden, lästa ur källfilerna.
function kundmeningar() {
  const ut = new Set();
  for (const v of Object.values(JSON.parse(readFileSync(join(ROT, 'fraser.json'), 'utf8')))) ut.add(v);
  const sprak = readFileSync(join(ROT, 'sprak.mjs'), 'utf8');
  // UNDERSTATUS, UNDERSTATUS_PREFIX och MONSTER: värdena är svenska meningar.
  // (Landskoderna AE: 'Förenade Arabemiraten' … är interna och visas aldrig — de hoppas över.)
  for (const m of sprak.matchAll(/^\s+(?![A-Z]{2}:)[A-Za-z_]+: '([^']+)',$/gm)) if (/[a-zåäö]/.test(m[1]) && !/^[A-ZÅÄÖ][a-zåäö]+$/.test(m[1])) ut.add(m[1]);
  for (const m of sprak.matchAll(/^\s+\[\/[^\]]*\/, '([^']+)'\],$/gm)) ut.add(m[1]);
  for (const r of STEG) ut.add(r[1]);
  for (const r of DELSTEG) ut.add(r[1]);
  for (const r of STATUSAR) ut.add(r[1]);
  for (const v of Object.values(RUBRIKER)) ut.add(v);
  // Shopify-meddelandena: T fångar de svenska meningarna som skickas in.
  const fangade = [];
  for (const k of ['CONFIRMED', 'IN_TRANSIT', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'ATTEMPTED_DELIVERY', 'DELIVERED', 'FAILURE']) {
    meddelande(k, null, 'x@y.z', (s) => { fangade.push(s); return s; });
  }
  for (const s of fangade) ut.add(s);
  // Sidans egna texter: allt som går genom T('…') i sida.mjs.
  const sida = readFileSync(join(ROT, 'sida.mjs'), 'utf8');
  for (const m of sida.matchAll(/\bT\('((?:[^'\\]|\\.)+)'\)/g)) ut.add(m[1].replace(/\\'/g, "'"));
  return [...ut];
}

test('varje mening kunden kan möta har en översättning i nb, da och fi', () => {
  const meningar = kundmeningar();
  assert.ok(meningar.length > 120, `hittade bara ${meningar.length} meningar — läsningen av källfilerna har gått sönder`);
  for (const kod of ANDRA) {
    const ov = skapaOversattare(kod);
    const saknas = meningar.filter((m) => !Object.prototype.hasOwnProperty.call(ov.ord, m));
    assert.deepEqual(saknas, [], `${kod}: ${saknas.length} meningar saknar översättning`);
    // Ingen översättning får vara identisk med svenskan av misstag — utom de
    // få ord som faktiskt stavas lika ("i dag", "På terminalen", "I luften").
    const lika = meningar.filter((m) => ov.ord[m] === m && m.length > 14);
    assert.deepEqual(lika, [], `${kod}: översättningar som är identiska med svenskan`);
    // Platshållarna ska följa med oöversatta.
    for (const m of meningar) {
      for (const ph of m.match(/\{\{[a-z]+\}\}/g) ?? []) {
        assert.ok(ov.ord[m].includes(ph), `${kod}: "${m}" tappar ${ph}`);
      }
    }
  }
});

test('Shopify-meddelandena översätts och behåller orten innanför punkten', () => {
  const ov = skapaOversattare('nb');
  assert.equal(meddelande('IN_TRANSIT', 'Oslo', 'x@y.z', ov.T), 'Pakken er på vei (Oslo).');
  assert.equal(meddelande('DELIVERED', null, 'x@y.z', ov.T), 'Pakken er levert.');
  assert.equal(meddelande('FAILURE', null, 'kundesupport@beverbutikken.no', ov.T), 'Det oppstod et problem med leveringen. Send e-post til kundesupport@beverbutikken.no, så hjelper vi deg.');
  // Svensk butik: oförändrat, med Bäverbutikens adress som förut.
  assert.equal(meddelande('FAILURE', null), 'Ett problem uppstod med leveransen. Mejla kundsupport@baverbutiken.se så hjälper vi till.');
  const plan = planera({ status: 'IN_TRANSIT', tid: '2026-09-20T10:00:00Z', plats: 'Bergen' }, [], null, { support: 'a@b.c', T: ov.T });
  assert.equal(plan.message, 'Pakken er på vei (Bergen).');
});

// ------------------------------------------------------------ datan och sidan

function paketfixtur() {
  return [{
    nummer: 'YT2626100708674690', bolag: 'YunExpress', statusKod: 'IN_TRANSIT',
    handelser: [
      { tid: '2026-09-18T13:39:00Z', text: 'Paketet har lämnat terminalen', plats: 'Malmö', land: 'Sverige', ra: 'Departed from facility' },
      { tid: '2026-09-16T09:12:00Z', text: 'Paketet har kommit till terminalen', plats: 'Oslo', land: 'Norge', ra: 'Arrived at facility' },
      { tid: '2026-09-15T10:14:00Z', text: 'Vi har fått uppgifterna om paketet', plats: null, land: null, ra: 'Shipment information received' },
    ],
  }];
}

test('prefixet följer butiken: CS- i datan, i bävernumret och på sidan', () => {
  const { data } = byggData(paketfixtur(), { nu: Date.parse('2026-09-20T12:00:00Z'), mottagarland: 'Norge', prefix: 'CS-' });
  assert.equal(data.bp, 'CS-');
  const p = packaUppEtt(data, 'YT2626100708674690');
  assert.equal(p.baver, bavernummer('YT2626100708674690', 'CS-'));
  assert.match(p.baver, /^CS-[0-9A-F]{8}$/);
  assert.equal(p.baver.slice(3), bavernummer('YT2626100708674690').slice(3), 'samma hexsiffror, bara prefixet skiljer');
  assert.ok(arBavernummer('cs-' + p.baver.slice(3), 'CS-'));
  assert.ok(!arBavernummer(p.baver, 'BB-'));
  const kropp = byggSidkropp(data, { butik: { support: 'hello@carashell.se' }, prefix: 'CS-' });
  assert.ok(kropp.includes('placeholder="CS-3F7A2C1D"'));
  assert.ok(kropp.includes('börjar med CS och'), 'hjälptexten ska nämna butikens prefix');
});

test('en norsk sida: ordboken, etiketterna och texterna på norska, inga svenska kvar i vyn', () => {
  const ov = skapaOversattare('nb');
  const { data } = byggData(paketfixtur(), { nu: Date.parse('2026-09-20T12:00:00Z'), mottagarland: 'Norge' });
  oversattData(data, ov, { steg: STEG, delsteg: DELSTEG, statusar: STATUSAR });
  assert.equal(data.sprak, 'nb');
  assert.ok(data.f.includes('Pakken har forlatt terminalen'));
  assert.ok(!data.f.includes('Paketet har lämnat terminalen'));
  assert.equal(data.o['Hos fraktbolaget'], 'Hos transportøren');
  assert.equal(data.o['Ute för leverans'], 'Ute for levering');
  assert.equal(data.o['På väg'], 'På vei');
  assert.deepEqual(ov.okanda(), [], 'allt i fixturen ska ha översättning');

  const kropp = byggSidkropp(data, { sprak: 'nb', prefix: 'BB-', tidszon: 'Europe/Oslo', butik: { support: 'kundesupport@beverbutikken.no' }, frakt: { sparning_vaknar: '2–4 dager' } });
  const synligt = kropp.replace(/<style>[\s\S]*?<\/style>/g, ' ').replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]*>/g, ' ');
  assert.ok(synligt.includes('Spor pakken din'));
  assert.ok(synligt.includes('Skriv inn pakkenummeret ditt'));
  assert.ok(synligt.includes('Vi finner ikke det nummeret'));
  assert.ok(!synligt.includes('Spåra ditt paket'));
  assert.ok(!synligt.includes('Vi hittar inte det numret'));
  assert.ok(!synligt.includes('Spåra ett annat nummer'));
  // Textrutan skriptet läser: norska rubriker, norsk tidszon och locale.
  const m = /<script type="application\/json" id="bb-spar-copy">([\s\S]*?)<\/script>/.exec(kropp);
  const copy = JSON.parse(m[1].replace(/<\\\//g, '</'));
  assert.equal(copy.rubriker.IN_TRANSIT, 'Pakken er på vei');
  assert.equal(copy.tz, 'Europe/Oslo');
  assert.equal(copy.locale, 'nb-NO');
  assert.equal(copy.tom, 'Pakken er registrert. Transportøren har ikke skannet den ennå — det tar vanligvis 2–4 dager.');
  assert.ok(kropp.includes('kundesupport@beverbutikken.no'));
  assert.ok(!kropp.includes('baverbutiken.se'), 'Bäverbutikens adress får inte läcka in i en annan butik');
  // Sidans skript slår upp etiketterna i D.o — ordlistan ska ligga i datan.
  const d = /<script type="application\/json" id="bb-spar-data">([\s\S]*?)<\/script>/.exec(kropp);
  assert.equal(JSON.parse(d[1].replace(/<\\\//g, '</')).o['Levererat'], 'Levert');
});

test('svensk butik: datan får ingen ordlista och sidan är som förut', () => {
  const ov = skapaOversattare('sv');
  const { data } = byggData(paketfixtur(), { nu: Date.parse('2026-09-20T12:00:00Z') });
  oversattData(data, ov, { steg: STEG, delsteg: DELSTEG, statusar: STATUSAR });
  assert.equal(data.o, undefined);
  assert.equal(data.sprak, undefined);
  assert.equal(data.bp, 'BB-');
  const kropp = byggSidkropp(data, { butik: { support: 'kundsupport@baverbutiken.se' } });
  assert.ok(kropp.includes('Spåra ditt paket'));
  assert.ok(kropp.includes('placeholder="BB-3F7A2C1D"'));
  assert.ok(kropp.includes('<html lang="sv">') || !kropp.includes('<html'));
});
