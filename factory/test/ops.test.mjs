// Tester för kedjans rena logik (ops.mjs, state.mjs, store-ready.mjs):
// stegordningen mot KEDJAN.md, nivåer, stoppar/manuell, --resume/--igen,
// slutrapportens två listor och QA-regeln "ingen HTML = inte grönt".
// Ingen nätverkstrafik — torrt-funktionerna körs mot testbutiken/dummyn.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { rabutik, raprodukt, dummy, BUTIKSFIL, PRODUKTFIL } from './hjalp.mjs';
import {
  STEG,
  STEG_IDN,
  EFTERSTEG,
  skaKoras,
  tolkaIgen,
  tolkaArgv,
  kundvyPunkter,
  markorPunkt,
  likaJson,
  loggaKallor,
  kravArbetstemaId,
  byggButiksKontext,
} from '../ops.mjs';
import {
  lasState,
  markeraKlart,
  markeraManuell,
  lasArbetstemaId,
  sattArbetstemaId,
  byggSlutrapport,
  slutrapportText,
  rensaHemligheter,
  BUTIKSNYCKEL,
} from '../state.mjs';
import { skrivPixelIText, bedomStoreReady, produktfilerFor } from '../store-ready.mjs';

// KEDJAN.md:s tabell — id, nivå och om steget stoppar bygget.
const KEDJAN = [
  ['anslutning', 'butik', true],
  ['tema-upload', 'butik', true],
  ['brand', 'butik', true],
  ['tema', 'butik', true],
  ['avbrandning', 'butik', true],
  ['logga', 'butik', false],
  ['produkt', 'produkt', true],
  ['metafalt', 'produkt', true],
  ['lagerpolicy', 'produkt', true],
  ['bonus', 'produkt', false],
  ['paket', 'produkt', false],
  ['kollektion', 'butik', true],
  ['startsida', 'butik', true],
  ['sidor', 'butik', true],
  ['policyer', 'butik', true],
  ['meny', 'butik', true],
  ['frakt', 'butik', true],
  ['huvudmarknad', 'butik', true],
  ['kallskanning', 'butik', true],
  ['recensioner', 'produkt', false],
  ['marknad', 'butik', true],
  ['oversatt', 'butik', false],
];

test('STEG är exakt KEDJAN.md:s körordning (id, nivå, stoppar/manuell)', () => {
  assert.deepEqual(STEG_IDN, KEDJAN.map(([id]) => id));
  for (const [id, niva, stoppar] of KEDJAN) {
    const steg = STEG.find((s) => s.id === id);
    assert.equal(steg.niva, niva, `${id}: nivå`);
    assert.equal(steg.stoppar, stoppar, `${id}: stoppar`);
    assert.equal(typeof steg.torrt, 'function', `${id}: torrt`);
    assert.equal(typeof steg.kor, 'function', `${id}: kor`);
    assert.ok(typeof steg.modul === 'string' && steg.modul.includes('.mjs'), `${id}: modul`);
    assert.ok(steg.namn, `${id}: namn`);
  }
  assert.deepEqual(EFTERSTEG.map((s) => s.id), ['qa', 'checklista', 'slutrapport']);
});

test('de manuella stegen är exakt logga, bonus, paket, recensioner, oversatt', () => {
  assert.deepEqual(STEG.filter((s) => s.stoppar === false).map((s) => s.id), ['logga', 'bonus', 'paket', 'recensioner', 'oversatt']);
});

// Kontext som ops.mjs bygger, utan nätverk.
function kontext(butik = rabutik(), produkter = [dummy()]) {
  const ctx = byggButiksKontext(butik, produkter.map((p, i) => ({ p, fil: i === 0 ? PRODUKTFIL : null })));
  ctx.butiksstate = { butik: butik.butik.id, produkt: BUTIKSNYCKEL, steg: {} };
  for (const pk of ctx.produkter) pk.state = { butik: butik.butik.id, produkt: pk.p.produkt.id, steg: {} };
  return ctx;
}

test('varje stegs torrt() beskriver utan nätverk och utan att kasta — en- och flerproduktsbutik', () => {
  const en = kontext();
  const b = rabutik();
  const flera = kontext(
    { ...b, butik: { ...b.butik, marknader: [{ land: 'NO', locale: 'nb', valuta: 'SEK' }], kollektion: { handle: 'sortimentet', titel: 'Sortimentet' } } },
    [dummy(), { ...dummy(), produkt: { ...dummy().produkt, id: 'annan', namn: 'Annan' }, meta: { creative_prefix: 'Annan' } }]
  );
  for (const ctx of [en, flera]) {
    for (const steg of STEG) {
      const pks = steg.niva === 'produkt' ? ctx.produkter : [null];
      for (const pk of pks) {
        const rader = steg.torrt(ctx, pk);
        assert.ok(Array.isArray(rader) && rader.length > 0, `${steg.id}: rader`);
        assert.ok(rader.every((r) => typeof r === 'string'), `${steg.id}: strängar`);
      }
    }
  }
  // Flerprodukt: kollektionen byggs, huvudmenyn får kollektionsraden.
  assert.match(STEG.find((s) => s.id === 'kollektion').torrt(flera)[0], /sortimentet/);
  assert.match(STEG.find((s) => s.id === 'kollektion').torrt(en)[0], /enproduktsbutik/);
  assert.ok(flera.huvudmenylankar.some((l) => l.url === '/collections/sortimentet'));
  assert.ok(!en.huvudmenylankar.some((l) => l.url.startsWith('/collections/')));
  assert.ok(en.huvudmenylankar.some((l) => l.titel === 'Frakt & retur'));
});

test('bonus utan handle, marknad utan rader och logga utan fil beskrivs som manuella/stopp — aldrig tysta', () => {
  const ctx = kontext();
  assert.match(STEG.find((s) => s.id === 'bonus').torrt(ctx, ctx.produkter[0])[0], /🖐/);
  assert.match(STEG.find((s) => s.id === 'marknad').torrt(ctx)[0], /marknader är tom/);
  assert.match(STEG.find((s) => s.id === 'logga').torrt(ctx)[0], /🖐 ingen logga/);
  assert.match(STEG.find((s) => s.id === 'recensioner').torrt(ctx, ctx.produkter[0])[0], /saknar datum/);
});

test('produktkontexten går på handle (TankGuard: id ≠ handle)', () => {
  const p = dummy();
  p.produkt.handle = 'tankoverdraget';
  const ctx = kontext(rabutik(), [p]);
  assert.equal(ctx.produkter[0].handle, 'tankoverdraget');
  assert.equal(ctx.produkter[0].plan.input.handle, 'tankoverdraget');
  assert.ok(ctx.huvudmenylankar.some((l) => l.url === '/products/tankoverdraget'));
});

test('kravArbetstemaId kastar utan tema i state och läser även äldre former', () => {
  const ctx = kontext();
  assert.throws(() => kravArbetstemaId(ctx), /tema-upload/);
  ctx.butiksstate.steg['tema-upload'] = { klar: true, temaId: 'gid://shopify/OnlineStoreTheme/1' };
  assert.equal(kravArbetstemaId(ctx), 'gid://shopify/OnlineStoreTheme/1');
  sattArbetstemaId(ctx.butiksstate, { id: 'gid://shopify/OnlineStoreTheme/2', namn: 'X – CRO v1' });
  assert.equal(ctx.arbetstemaId, 'gid://shopify/OnlineStoreTheme/2', 'toppnivån vinner');
  assert.equal(lasArbetstemaId({ steg: { tema: { temaId: 'gid://shopify/OnlineStoreTheme/3' } } }), 'gid://shopify/OnlineStoreTheme/3');
});

test('skaKoras: --resume hoppar gröna, --igen kör om och hoppar övriga gröna, utan flaggor körs allt', () => {
  const inget = new Set();
  assert.equal(skaKoras('paket', { resume: false, igen: inget, klart: true }), true);
  assert.equal(skaKoras('paket', { resume: true, igen: inget, klart: true }), false);
  assert.equal(skaKoras('paket', { resume: true, igen: inget, klart: false }), true);
  const igen = new Set(['paket']);
  assert.equal(skaKoras('paket', { resume: false, igen, klart: true }), true);
  assert.equal(skaKoras('bonus', { resume: false, igen, klart: true }), false, '--igen paket hoppar andra gröna');
  assert.equal(skaKoras('bonus', { resume: false, igen, klart: false }), true);
});

test('tolkaIgen/tolkaArgv: --igen <steg>, --igen=a,b, positioner utan flaggvärden', () => {
  assert.deepEqual([...tolkaIgen(['--igen', 'paket'])], ['paket']);
  assert.deepEqual([...tolkaIgen(['--igen=paket,bonus', '--resume'])], ['paket', 'bonus']);
  const a = tolkaArgv(['factory/butiker/x.yaml', 'factory/produkter/y.yaml', '--igen', 'startsida', '--dry-run', '--butik', 'z']);
  assert.deepEqual(a.positioner, ['factory/butiker/x.yaml', 'factory/produkter/y.yaml']);
  assert.equal(a.dryRun, true);
  assert.deepEqual([...a.igen], ['startsida']);
  assert.equal(tolkaArgv(['--store-ready']).storeReady, true);
  assert.equal(tolkaArgv(['--launch']).launch, true);
});

test('byggSlutrapport: två listor ur state — manuellt står ALDRIG under "gjort"', () => {
  const butik = { butik: 'b', produkt: BUTIKSNYCKEL, steg: {} };
  const p1 = { butik: 'b', produkt: 'p1', steg: {} };
  markeraKlart(butik, 'anslutning', { domain: 'x' });
  markeraKlart(butik, 'tema-upload', { arbetstemaId: 'gid' });
  markeraManuell(butik, 'logga', 'lägg logga.png i output/b/');
  markeraKlart(p1, 'produkt', { id: 'g' });
  markeraManuell(p1, 'bonus', 'välj bonusprodukt');
  markeraKlart(p1, 'launch', { status: 'ACTIVE' });
  markeraManuell(butik, 'tema-publicering', 'publicera temat');
  p1.qa = { gron: false, kritiska: ['doman'] };
  const r = byggSlutrapport(STEG, butik, [p1]);
  assert.deepEqual(r.gjort.map((x) => x.steg), ['anslutning', 'tema-upload', 'produkt', 'launch']);
  assert.deepEqual(r.vantar.map((x) => x.steg), ['logga', 'bonus', 'tema-publicering', 'qa']);
  assert.ok(r.vantar.find((x) => x.steg === 'bonus').text.includes('välj bonusprodukt'));
  assert.ok(!r.gjort.some((x) => x.steg === 'logga' || x.steg === 'bonus'));
  assert.ok(r.ejKorda.some((x) => x.steg === 'brand'));
  const t = slutrapportText(r);
  assert.ok(t.indexOf('GJORT AV MIG') < t.indexOf('VÄNTAR PÅ EN MÄNNISKA'));
  assert.match(t, /Inte kört ännu/);
});

test('markeraKlart efter markeraManuell tar bort det manuella; hemligheter når aldrig state', () => {
  const s = { butik: 'b', produkt: 'p', steg: {} };
  markeraManuell(s, 'paket', 'byt valuta', { valuta: 'PHP' });
  assert.equal(s.steg.paket.klar, false);
  assert.equal(s.steg.paket.valuta, 'PHP');
  markeraKlart(s, 'paket', { koder: ['X2A'] });
  assert.equal(s.steg.paket.manuell, undefined);
  assert.equal(s.steg.paket.klar, true);
  assert.deepEqual(rensaHemligheter({ losenord: 'x', storefrontLosenord: 'y', hemlighet: 'z', domain: 'kvar' }), { domain: 'kvar' });
});

test('kundvyPunkter: ingen HTML = inte grönt (rött), och lösenordsbristen står i texten', () => {
  const butik = rabutik();
  const produkt = dummy();
  const [utan] = kundvyPunkter({ html: null, felmeddelande: 'HTTP 401', losenordSatt: false, butik, produkt, vad: 'startsida' });
  assert.equal(utan.utfall, 'kritisk');
  assert.match(utan.detalj, /^ingen HTML = inte grönt/);
  assert.match(utan.detalj, /SHOPIFY_STOREFRONT_PASSWORD saknas/);
  assert.match(utan.detalj, /HTTP 401/);
  const [tom] = kundvyPunkter({ html: '', butik, produkt });
  assert.equal(tom.utfall, 'kritisk');
  // Riktig HTML bedöms av kundvy.mjs — en default-butik är röd, aldrig grön.
  const [def] = kundvyPunkter({ html: '<html><title>My Store</title><a>Catalog</a></html>', butik, produkt });
  assert.equal(def.utfall, 'kritisk');
  assert.match(def.detalj, /DEFAULT KVAR/);
  const prod = kundvyPunkter({ html: '<html>ingenting</html>', butik, produkt, vad: 'produktsida' });
  assert.equal(prod.length, 2);
  assert.ok(prod.every((p) => p.utfall === 'kritisk'));
});

test('markorPunkt: utan HTML rött, utan markörer manuell, med läcka rött, annars grönt', () => {
  assert.equal(markorPunkt(null, 'nb', ['Köp nu']).utfall, 'kritisk');
  assert.equal(markorPunkt('<p>Kjøp nå</p>', 'nb', []).utfall, 'manuell');
  assert.equal(markorPunkt('<p>Köp nu</p>', 'nb', ['Köp nu']).utfall, 'kritisk');
  assert.equal(markorPunkt('<p>Kjøp nå</p>', 'nb', ['Köp nu']).utfall, 'ok');
});

test('likaJson: värdejämförelse som tål Shopifys omformatering', () => {
  assert.equal(likaJson({ a: [1, { b: 'x' }] }, { a: [1, { b: 'x' }] }), true);
  assert.equal(likaJson({ a: 1, b: 2 }, { b: 2, a: 1 }), true, 'nyckelordning spelar ingen roll');
  assert.equal(likaJson({ a: [1, 2] }, { a: [2, 1] }), false, 'listordning spelar roll');
  assert.equal(likaJson({ a: 1 }, { a: 1, b: null }), false);
});

test('loggaKallor: branding.logga (URL/fil) eller output/<butik>/logga.png, annars null', () => {
  const finns = (p) => p.endsWith('/output/testbutiken/logga.png') || p === 'egen.png';
  const b = rabutik();
  assert.equal(loggaKallor(b, { rot: '/rot', finns }).logga, '/rot/output/testbutiken/logga.png');
  assert.equal(loggaKallor(b, { rot: '/rot', finns: () => false }).logga, null);
  assert.equal(loggaKallor({ ...b, branding: { logga: 'https://x/l.png', favicon: 'egen.png', logga_bredd: 180 } }, { rot: '/rot', finns }).logga, 'https://x/l.png');
  const k = loggaKallor({ ...b, branding: { logga: 'egen.png', logga_bredd: 180 } }, { rot: '/rot', finns });
  assert.equal(k.logga, 'egen.png');
  assert.equal(k.bredd, 180);
  assert.equal(loggaKallor({ ...b, branding: { logga: 'saknas.png' } }, { rot: '/rot', finns }).logga, null, 'angiven men obefintlig fil = manuellt');
});

test('store-ready: pixel-id skrivs i produktfilens meta-block, aldrig någon annanstans', () => {
  const fore = 'meta:\n  ad_account_id: ""\n  page_id: ""\n  pixel_id: ""   # fylls av store-ready\n  creative_prefix: "X"\n';
  const efter = skrivPixelIText(fore, '123456');
  assert.match(efter, /ad_account_id: "915422744950975"/);
  assert.match(efter, /pixel_id: "123456"   # fylls av store-ready/);
  assert.match(efter, /page_id: ""/);
  assert.equal(skrivPixelIText('produkt:\n  id: x\n', '1'), 'produkt:\n  id: x\n', 'utan meta-rader lämnas filen orörd');
});

test('store-ready: bedömningen sätter WeTracked/CAPI/sidan under "väntar" även när pixeln är skapad', () => {
  const r = bedomStoreReady({
    recensioner: [{ produkt: 'a', viaApi: true, antal: 7 }, { produkt: 'b', viaApi: false, manuell: 'ladda upp i appen' }],
    pixel: { id: '99', namn: 'Brand', redan: false },
    capi: { tilldelad: false, varfor: 'ingen CAPI-användare' },
    discord: { guildId: 'g', kanaler: ['PRODUKTION/ads'], invite: null, redigerare: null },
  });
  assert.ok(r.gjort.some((x) => x.includes('pixel "Brand" 99')));
  assert.ok(r.vantar.some((x) => x.includes('WeTracked') && x.includes('99')));
  assert.ok(r.vantar.some((x) => x.includes('CAPI')));
  assert.ok(r.vantar.some((x) => x.includes('Meta-sidan')));
  assert.ok(r.vantar.some((x) => x.includes('ingen redigerare i standby-listan')));
  assert.ok(r.vantar.some((x) => x.startsWith('recensioner b')));
  assert.ok(r.gjort.some((x) => x.startsWith('recensioner a')));
  const utan = bedomStoreReady({ pixel: { manuell: 'META_ACCESS_TOKEN saknas' }, discord: { manuell: 'ingen server' } });
  assert.equal(utan.gjort.length, 0);
  assert.equal(utan.vantar.length, 2);
});

test('store-ready: en Meta-sida som FINNS står som gjord, inte som väntande', () => {
  const bas = { pixel: { id: '99', namn: 'Brand', redan: true }, capi: { tilldelad: true, anvandare: 'CAPI' }, discord: { manuell: 'ingen server' } };
  // Sidan skapad för hand och id:t inskrivet i produktfilen ⇒ inget kvar att göra.
  const med = bedomStoreReady({ ...bas, sidor: [{ produkt: 'a', pageId: '1368352486352053' }] });
  assert.ok(!med.vantar.some((x) => x.includes('Meta-sidan')), 'ska inte stå kvar som väntande');
  assert.ok(med.gjort.some((x) => x.includes('Meta-sidan finns') && x.includes('1368352486352053')));
  // Saknas id:t på någon produkt är den kvar som människans jobb.
  const halv = bedomStoreReady({ ...bas, sidor: [{ produkt: 'a', pageId: '123' }, { produkt: 'b', pageId: null }] });
  assert.ok(halv.vantar.some((x) => x.includes('Meta-sidan')));
  assert.ok(!halv.gjort.some((x) => x.includes('Meta-sidan finns')));
  // Ingen sidlista alls (äldre anrop) beter sig som förut.
  assert.ok(bedomStoreReady(bas).vantar.some((x) => x.includes('Meta-sidan')));
});

test('store-ready: produktfilerna slås upp via statefilerna på produkt.id, inte filnamn', () => {
  const rot = mkdtempSync(join(tmpdir(), 'ops-test-'));
  const stateMapp = join(rot, 'state');
  const produktMapp = join(rot, 'produkter');
  mkdirSync(stateMapp);
  mkdirSync(produktMapp);
  writeFileSync(join(stateMapp, 'butiken--_butik.json'), '{}');
  writeFileSync(join(stateMapp, 'butiken--sp.json'), '{}');
  writeFileSync(join(stateMapp, 'annan--sp.json'), '{}');
  writeFileSync(join(produktMapp, 'konstigt-filnamn.yaml'), 'produkt:\n  id: sp\n  namn: "Sp"\n');
  writeFileSync(join(produktMapp, 'ovidkommande.yaml'), 'produkt:\n  id: x\n  namn: "X"\n');
  const r = produktfilerFor('butiken', { stateMapp, produktMapp });
  assert.equal(r.length, 1);
  assert.equal(r[0].produkt.produkt.id, 'sp');
  assert.ok(r[0].fil.endsWith('konstigt-filnamn.yaml'));
  rmSync(rot, { recursive: true, force: true });
});

test('lasState per nivå: butiksstaten och produktstaten är olika filer', () => {
  const b = lasState('ops-test-butik', BUTIKSNYCKEL);
  const p = lasState('ops-test-butik', 'p');
  assert.equal(b.produkt, BUTIKSNYCKEL);
  assert.equal(p.produkt, 'p');
  assert.equal(raprodukt().produkt.id, 'nackmagneten');
  assert.ok(BUTIKSFIL.endsWith('testbutiken.yaml'));
});

test('recensionsOversattning: WP6:s recension.<produkt>.<i>.* nycklas om till judgeme.mjs:s recension.<i>.*', async () => {
  const { recensionsOversattning } = await import('../ops.mjs');
  const nb = {
    'recension.sp.0.titel': 'Anbefales',
    'recension.sp.0.text': 'Stabil og enkel.',
    'recension.sp.0.namn': 'Daniel',
    'recension.annan.0.text': 'Feil produkt',
    'recension.1.text': 'Gammalt format',
    'produkt.sp.title': 'X',
  };
  assert.deepEqual(recensionsOversattning(nb, 'sp'), {
    'recension.0.titel': 'Anbefales',
    'recension.0.text': 'Stabil og enkel.',
    'recension.0.namn': 'Daniel',
    'recension.1.text': 'Gammalt format',
  });
  assert.deepEqual(recensionsOversattning(null, 'sp'), {});
});
