// hubbar.test.mjs — redigerarrapport/hubbar.mjs utan nät.
//
// Det som testas: hub → verksamhet-klassningen (id-regler före titelregler),
// sammanslagningen av kandidatlistor, radformen, namnkartan och räkningen per
// person, och hela läsningen mot en falsk Notion (kolumner, rader, kommentarer)
// inklusive cachen. Fixturerna ligger i ./fixturer/.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  klassificeraHub, klassificera, slaIhop, formaRad, personerUrTeam, namnkarta, raknaPerPerson,
  serUtSomHub, hamtaKolumner, hittaKandidater, hamtaHubbar, skrivCache, lasCache, sammanfattning,
  andraVerksamheter, utanAtkomst, verksamhetUrNyckel, VERKSAMHET_STANDARD, ROT,
} from '../hubbar.mjs';
import { opsHubbarUrRegister } from '../../tools/lib/ops-hubbar.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const FIX = join(HAR, 'fixturer');
const las = (f) => JSON.parse(readFileSync(join(FIX, f), 'utf8'));

const TRIM = 'aaa10000-0000-4000-8000-000000000001';   // utan åtkomst (Axels beslut)
const HEIM = 'aaa10000-0000-4000-8000-000000000002';   // OPS hemvakten, omdöpt "Dont work here …"
const CARA = 'aaa10000-0000-4000-8000-000000000003';   // OPS carashell
const MATS = 'aaa10000-0000-4000-8000-000000000004';   // Matstrumpor
const MASTER = 'aaa10000-0000-4000-8000-000000000005'; // Grillkliniken
const TAK = 'bbb10000-0000-4000-8000-000000000001';    // Bäverbutiken
const NYD = 'bbb10000-0000-4000-8000-000000000014';    // ny databas utan Ansvarig-kolumn
const BELT = 'bbb10000-0000-4000-8000-000000000015';   // svarar 404

const kartor = () => ({
  opsKarta: opsHubbarUrRegister(las('register.json')),
  andraKarta: andraVerksamheter(join(FIX, 'andra-verksamheter.json')),
  utanAtkomstKarta: utanAtkomst(join(FIX, 'hubbar-utan-atkomst.json')),
});
const sokFixtur = () => las('sok.json').hubbar;

// ----------------------------------------------------------- klassningen

test('verksamhetUrNyckel: butiken ur registrets nyckel', () => {
  assert.equal(verksamhetUrNyckel('carashell/takskyddet'), 'carashell');
  assert.equal(verksamhetUrNyckel('hemvakten/overvakningskameran'), 'hemvakten');
  assert.equal(verksamhetUrNyckel(''), '');
});

test('klassificeraHub: id-reglerna vinner över titeln', () => {
  const k = kartor();
  // OPS-hubben heter "Dont work here …" i Notion — id:t säger hemvakten.
  assert.deepEqual(klassificeraHub({ id: HEIM, titel: 'Dont work here Surveillance Camera creative hub' }, k),
    { verksamhet: 'hemvakten', hoppa: null, ops_nyckel: 'hemvakten/overvakningskameran' });
  assert.deepEqual(klassificeraHub({ id: CARA.toUpperCase().replace(/-/g, ''), titel: 'Carashell Taköverdrag creative hub' }, k),
    { verksamhet: 'carashell', hoppa: null, ops_nyckel: 'carashell/takskyddet' });
  assert.deepEqual(klassificeraHub({ id: MATS, titel: 'Matstrumpor creative hub' }, k), { verksamhet: 'matstrumpor', hoppa: null });
  // Grillkliniken är en riktig hub men får ingen rapport.
  const master = klassificeraHub({ id: MASTER, titel: 'Creative Hub master' }, k);
  assert.equal(master.verksamhet, 'grillkliniken');
  assert.match(master.hoppa, /Grillkliniken/);
  // Axels "strunta i dem" går före allt annat.
  assert.match(klassificeraHub({ id: TRIM, titel: 'Trimmer belt creative hub' }, k).hoppa, /404/);
  // Vanlig Bäverbutikshub, oavsett om titeln slutar på "creative hub".
  assert.deepEqual(klassificeraHub({ id: TAK, titel: 'BÄVER Taköverdraget för Husvagn' }, k), { verksamhet: VERKSAMHET_STANDARD, hoppa: null });
});

test('klassificera: hela söklistan — rätt verksamhet, rätt orsak på det som hoppas', () => {
  const { hubbar, hoppade } = klassificera(sokFixtur(), kartor());
  const verks = Object.fromEntries(hubbar.map((h) => [h.titel, h.verksamhet]));
  assert.deepEqual(verks, {
    'BÄVER Taköverdraget för Husvagn': 'baverbutiken',
    'Dont work here Surveillance Camera creative hub': 'hemvakten',
    'Carashell Taköverdrag creative hub': 'carashell',
    'Matstrumpor creative hub': 'matstrumpor',
    'Ny okänd databas': 'baverbutiken',
    'Belt grinder creative hub': 'baverbutiken',
  });
  const orsak = Object.fromEntries(hoppade.map((h) => [h.titel, h.orsak]));
  assert.equal(hoppade.length, 11);
  assert.match(orsak['Creative Hub master'], /Grillkliniken/);
  assert.match(orsak['Customer support bäverbutiken'], /kundtjänst/);
  assert.match(orsak['kundsupport Grillkliniken'], /kundtjänst/);
  assert.match(orsak['Product test center SE BÄVER'], /produkttest/);
  assert.match(orsak['ADVENTLANE Product test center'], /produkttest/);
  assert.match(orsak['MALL Creative hub MALL'], /mall/i);
  assert.match(orsak['Bäverkoppling.se'], /Bäverkoppling/);
  assert.match(orsak[''], /utan titel/);
  assert.match(orsak['Matstrumpor Growth Guide'], /Growth Guide/);
  assert.match(orsak['Annonsidéer'], /idébank/);
  assert.match(orsak['Trimmer belt creative hub'], /404/);
  // Inget får försvinna tyst: varje kandidat är antingen hub eller hoppad.
  assert.equal(hubbar.length + hoppade.length, sokFixtur().length);
});

// ------------------------------------------------------- sammanslagningen

test('slaIhop: samma id med/utan bindestreck är EN hub, titel fylls, källor samlas, ordningen bevaras', () => {
  const ut = slaIhop(
    [{ id: 'AAA10000-0000-4000-8000-000000000003', titel: '', kalla: 'register.json' }, { id: TAK, titel: 'BÄVER Tak', kalla: 'sök' }],
    [{ id: 'aaa10000000040008000000000000003', namn: 'Carashell Taköverdrag creative hub', kalla: 'hubbar.json', url: 'u' }],
    [{ id: '', titel: 'utan id' }],
  );
  assert.equal(ut.length, 2);
  assert.equal(ut[0].titel, 'Carashell Taköverdrag creative hub');
  assert.equal(ut[0].url, 'u');
  assert.deepEqual(ut[0].kallor, ['register.json', 'hubbar.json']);
  assert.equal(ut[1].titel, 'BÄVER Tak');
});

// ------------------------------------------------------------- radformen

test('formaRad: page_id ur URL:en, ansvariga utan dubbletter, via_kommentar följer med', () => {
  const r = formaRad({
    namn: 'Takoverdrag_PD_1_H1', ansvariga: ['u-josh', 'u-josh'], status: 'Approved', typ: 'Video - Pending Approval',
    skapad: '2026-09-01T00:00:00.000Z', url: 'https://app.notion.com/p/Takoverdrag_PD_1_H1-3ec270ab908c814a930bd0c361bc6602', viaKommentar: 'jerzee',
  });
  assert.deepEqual(r, {
    namn: 'Takoverdrag_PD_1_H1', ansvariga: ['u-josh'], status: 'Approved', typ: 'Video - Pending Approval',
    skapad: '2026-09-01T00:00:00.000Z', url: 'https://app.notion.com/p/Takoverdrag_PD_1_H1-3ec270ab908c814a930bd0c361bc6602',
    page_id: '3ec270ab-908c-814a-930b-d0c361bc6602', via_kommentar: 'jerzee',
  });
  assert.equal(formaRad({ namn: 'x' }).page_id, null);
  assert.equal('via_kommentar' in formaRad({ namn: 'x' }), false);
});

// ---------------------------------------------------- personer och namn

test('personerUrTeam och namnkarta: Jerzee via mönster, alias → namn, team.json vinner över produkter.json', () => {
  const team = las('team.json');
  assert.deepEqual(personerUrTeam(team), [{ id: 'jerzee', namn: 'Jerzee', notionUserId: 'kommentar:jerzee', kommentarMonster: '\\bjerz' }]);
  const karta = namnkarta(team, { agare: { 'u-josh': 'Josh (gammalt namn)', 'u-prod': 'Produktägare' } });
  assert.equal(karta.get('u-josh'), 'Josh Naelga');
  assert.equal(karta.get('u-jerzee-gast'), 'Jerzee');
  assert.equal(karta.get('kommentar:jerzee'), 'Jerzee');
  assert.equal(karta.get('u-prod'), 'Produktägare');
});

test('raknaPerPerson: en rad med två personer räknas på båda, okänt id skrivs ut, via kommentar räknas', () => {
  const hubbar = [
    { verksamhet: 'baverbutiken', rader: [
      { ansvariga: ['u-josh', 'u-carl'] }, { ansvariga: ['u-josh'] }, { ansvariga: [] }, { ansvariga: ['u-okand'] },
    ] },
    { verksamhet: 'carashell', rader: [{ ansvariga: ['kommentar:jerzee'], via_kommentar: 'jerzee' }, { ansvariga: ['u-jerzee-gast'] }] },
  ];
  const ut = raknaPerPerson(hubbar, namnkarta(las('team.json')));
  assert.deepEqual(ut['Josh Naelga'], { rader: 2, via_kommentar: 0, verksamheter: { baverbutiken: 2 } });
  assert.deepEqual(ut['Carl Vicente'], { rader: 1, via_kommentar: 0, verksamheter: { baverbutiken: 1 } });
  assert.deepEqual(ut['Jerzee'], { rader: 2, via_kommentar: 1, verksamheter: { carashell: 2 } });
  assert.deepEqual(ut['okänt id u-okand'], { rader: 1, via_kommentar: 0, verksamheter: { baverbutiken: 1 } });
});

// ----------------------------------------------------------- kolumnkollen

test('serUtSomHub: title + people krävs', () => {
  assert.equal(serUtSomHub([{ namn: 'Namn', typ: 'title' }, { namn: 'Ansvarig', typ: 'people' }]), true);
  assert.equal(serUtSomHub([{ namn: 'Idé', typ: 'title' }, { namn: 'Status', typ: 'status' }]), false);
  assert.equal(serUtSomHub([]), false);
});

test('hamtaKolumner: läser properties och kastar med status på fel', async () => {
  const fetchImpl = async (url) => /000000000015$/.test(url)
    ? { ok: false, status: 404, json: async () => ({ message: 'Could not find database' }) }
    : { ok: true, status: 200, json: async () => ({ properties: { Namn: { type: 'title' }, Ansvarig: { type: 'people' } } }) };
  const kol = await hamtaKolumner(TAK, { fetchImpl, env: { NOTION_TOKEN: 'x' }, vanta: 0 });
  assert.deepEqual(kol, [{ namn: 'Namn', typ: 'title' }, { namn: 'Ansvarig', typ: 'people' }]);
  await assert.rejects(hamtaKolumner(BELT, { fetchImpl, env: { NOTION_TOKEN: 'x' }, vanta: 0 }), (e) => e.status === 404);
  await assert.rejects(hamtaKolumner(TAK, { fetchImpl, env: {}, vanta: 0 }), /NOTION_TOKEN/);
});

// -------------------------------------------------------- hela läsningen

/** En falsk Notion: kolumner per databas, sidor per databas, kommentarer per sida. */
function falskNotion() {
  const hub = { Namn: { type: 'title' }, Status: { type: 'status' }, Typ: { type: 'select' }, Ansvarig: { type: 'people' } };
  const kolumner = {
    [TAK]: hub, [HEIM]: hub, [CARA]: hub, [MATS]: hub,
    [NYD]: { Idé: { type: 'title' }, Status: { type: 'status' } },
  };
  const sida = (hex, namn, { status = 'Approved', typ = 'Video - Pending Approval', ansvariga = [] } = {}) => ({
    id: hex, url: `https://app.notion.com/p/${namn}-${hex}`, created_time: '2026-09-20T10:00:00.000Z', last_edited_time: '2026-09-21T10:00:00.000Z',
    properties: {
      Namn: { type: 'title', title: [{ plain_text: namn }] },
      Status: { type: 'status', status: { name: status } },
      Typ: { type: 'select', select: { name: typ } },
      Ansvarig: { type: 'people', people: ansvariga.map((id) => ({ id })) },
    },
  });
  const sidor = {
    [TAK]: [
      sida('3ec270ab908c814a930bd0c361bc6601', 'Takoverdrag_PD_1_H1', { ansvariga: ['u-josh'] }),
      sida('3ec270ab908c814a930bd0c361bc6602', 'Takoverdrag_PD_2_H1', { status: 'Draft' }),          // kommentar "By Jerzee"
      sida('3ec270ab908c814a930bd0c361bc6603', 'Brief review 2026-09-18', { typ: 'Feedback' }),       // dokumentation, kollas aldrig
      sida('3ec270ab908c814a930bd0c361bc6604', 'Takoverdrag_PD_3_H1', { status: 'To be Reviewed' }), // ingen kommentar
    ],
    [HEIM]: [sida('3ec270ab908c814a930bd0c361bc6605', 'HeimGuard_SP_1_H1', { ansvariga: ['u-carl'] })],
    [CARA]: [sida('3ec270ab908c814a930bd0c361bc6606', 'CaraShellRoof_BOF_103_1', { ansvariga: ['u-josh', 'u-carl'] })],
    [MATS]: [sida('3ec270ab908c814a930bd0c361bc6607', '022', { ansvariga: ['u-jerzee-gast'] })],
  };
  const kommentarer = { '3ec270ab-908c-814a-930b-d0c361bc6602': ['By Jerzee'] };
  const anrop = { kolumner: 0, query: 0, kommentarer: 0 };
  const svar = (json, status = 200) => ({ ok: status < 400, status, json: async () => json });
  const fetchImpl = async (url, init = {}) => {
    const u = String(url);
    let m;
    if ((m = u.match(/\/comments\?block_id=([^&]+)/))) { anrop.kommentarer++; return svar({ results: (kommentarer[m[1]] ?? []).map((t) => ({ rich_text: [{ plain_text: t }] })) }); }
    if ((m = u.match(/\/databases\/([0-9a-f-]+)\/query$/))) {
      anrop.query++;
      const id = Object.keys(sidor).find((k) => k.replace(/-/g, '') === m[1].replace(/-/g, ''));
      return id ? svar({ results: sidor[id], has_more: false }) : svar({ message: 'Could not find database' }, 404);
    }
    if ((m = u.match(/\/databases\/([0-9a-f-]+)$/))) {
      anrop.kolumner++;
      const id = Object.keys(kolumner).find((k) => k.replace(/-/g, '') === m[1].replace(/-/g, ''));
      return id ? svar({ properties: kolumner[id] }) : svar({ message: 'Could not find database' }, 404);
    }
    throw new Error(`oväntat anrop i testet: ${init.method ?? 'GET'} ${u}`);
  };
  return { fetchImpl, anrop, kolumner };
}

test('hamtaHubbar: hela flödet mot en falsk Notion — klassning, kolumnkoll, rader, Jerzee via kommentar, per person', async () => {
  const { fetchImpl, anrop, kolumner } = falskNotion();
  const res = await hamtaHubbar({
    sok: async () => sokFixtur(),
    kartor: kartor(),
    hubbarJson: () => [{ id: TAK, namn: 'BÄVER Taköverdraget för Husvagn' }],   // golvet: dubblett av sökningen, får inte bli två
    kolumner: async (id) => {
      const k = kolumner[Object.keys(kolumner).find((x) => x.replace(/-/g, '') === String(id).replace(/-/g, '')) ?? ''];
      if (!k) { const e = new Error('Could not find database'); e.status = 404; throw e; }
      return Object.entries(k).map(([namn, v]) => ({ namn, typ: v.type }));
    },
    fetchImpl, env: { NOTION_TOKEN: 'x' },
    team: las('team.json'), produkter: { agare: {} },
    logg: null,
  });

  // Hubbarna: 4 lästa (Tak, Heim, Cara, Mats); Ny okänd → hoppad på kolumnerna; Belt grinder → 404 i fel.
  assert.deepEqual(res.hubbar.map((h) => [h.titel, h.verksamhet]).sort(), [
    ['BÄVER Taköverdraget för Husvagn', 'baverbutiken'],
    ['Carashell Taköverdrag creative hub', 'carashell'],
    ['Dont work here Surveillance Camera creative hub', 'hemvakten'],
    ['Matstrumpor creative hub', 'matstrumpor'],
  ]);
  assert.equal(res.hubbar.find((h) => h.verksamhet === 'carashell').ops_nyckel, 'carashell/takskyddet');
  const nyd = res.hoppade.find((h) => h.id === NYD);
  assert.match(nyd.orsak, /saknar kolumnen Ansvarig/);
  assert.match(nyd.orsak, /Idé, Status/);
  assert.equal(res.hoppade.length, 12, '11 på titel/id + 1 på kolumnerna');
  assert.deepEqual(res.fel.map((f) => f.hubb), ['Belt grinder creative hub']);
  assert.match(res.fel[0].fel, /404/);
  assert.equal(res.sok.kandidater, 17, 'golvets dubblett slogs ihop med sökningens');
  assert.equal(res.sok.fel, null);

  // Raderna: ALLA statusar och typer, exakt formen rapporten vill ha.
  const tak = res.hubbar.find((h) => h.id === TAK);
  assert.equal(tak.rader.length, 4, 'Draft, To be Reviewed och Feedback-raden är med — ingen filtrering');
  assert.deepEqual(Object.keys(tak.rader[0]), ['namn', 'ansvariga', 'status', 'typ', 'skapad', 'url', 'page_id']);
  assert.deepEqual(tak.rader[0], {
    namn: 'Takoverdrag_PD_1_H1', ansvariga: ['u-josh'], status: 'Approved', typ: 'Video - Pending Approval',
    skapad: '2026-09-20T10:00:00.000Z', url: 'https://app.notion.com/p/Takoverdrag_PD_1_H1-3ec270ab908c814a930bd0c361bc6601',
    page_id: '3ec270ab-908c-814a-930b-d0c361bc6601',
  });

  // Jerzee: bara raden med kommentaren får honom; Feedback-raden och raden utan
  // kommentar kollas (Feedback aldrig) utan att få någon.
  const jerz = tak.rader.find((r) => r.namn === 'Takoverdrag_PD_2_H1');
  assert.deepEqual(jerz.ansvariga, ['kommentar:jerzee']);
  assert.equal(jerz.via_kommentar, 'jerzee');
  assert.equal('viaKommentar' in jerz, false);
  assert.deepEqual(tak.rader.find((r) => r.namn === 'Takoverdrag_PD_3_H1').ansvariga, []);
  assert.deepEqual(tak.rader.find((r) => r.typ === 'Feedback').ansvariga, []);
  assert.equal(anrop.kommentarer, 2, 'bara rader utan Ansvarig med Pending Approval-typ kostar ett anrop');
  assert.equal(res.kommentarer.traffar, 1);
  assert.equal(res.kommentarer.lasta, 2);

  // Per person: alias och kommentar landar på rätt namn, två personer på en rad räknas på båda.
  assert.deepEqual(res.per_person, {
    'Josh Naelga': { rader: 2, via_kommentar: 0, verksamheter: { baverbutiken: 1, carashell: 1 } },
    'Jerzee': { rader: 2, via_kommentar: 1, verksamheter: { baverbutiken: 1, matstrumpor: 1 } },
    'Carl Vicente': { rader: 2, via_kommentar: 0, verksamheter: { hemvakten: 1, carashell: 1 } },
  });
  assert.equal(typeof res.sek, 'number');

  // Cachen: skrivs och läses tillbaka likadant.
  const mapp = mkdtempSync(join(tmpdir(), 'hubbar-'));
  try {
    const fil = skrivCache(res, join(mapp, 'output', 'hubbar.json'));
    assert.ok(existsSync(fil));
    const igen = lasCache(fil);
    assert.deepEqual(igen.hubbar, res.hubbar);
    assert.deepEqual(igen.per_person, res.per_person);
    assert.throws(() => lasCache(join(mapp, 'finns-inte.json')), (e) => e.ingenCache === true);
  } finally {
    rmSync(mapp, { recursive: true, force: true });
  }

  // Utskriften: en rad per hub med verksamhet och antal, en rad per person.
  const text = sammanfattning(res).join('\n');
  assert.match(text, /Hubbar: 4 lästa · 12 hoppade · 1 fel · 7 rader, 5 med Ansvarig/);
  assert.match(text, /BÄVER Taköverdraget för Husvagn\s+baverbutiken\s+4 rader\s+2 med Ansvarig/);
  assert.match(text, /Carashell Taköverdrag creative hub\s+carashell\s+1 rader\s+1 med Ansvarig/);
  assert.match(text, /✗ Ny okänd databas — saknar kolumnen Ansvarig/);
  assert.match(text, /⛔ Belt grinder creative hub: 404/);
  assert.match(text, /Jerzee\s+2\s+\(baverbutiken 1, matstrumpor 1\) · 1 via kommentar/);
  assert.match(text, /Josh Naelga\s+2\s+\(/);
});

test('hamtaHubbar --utan-kommentarer: inga kommentarsanrop, Jerzees rad förblir utan Ansvarig', async () => {
  const { fetchImpl, anrop, kolumner } = falskNotion();
  const res = await hamtaHubbar({
    sok: async () => sokFixtur().filter((h) => h.id === TAK), kartor: kartor(), hubbarJson: () => [],
    kolumner: async () => Object.entries(kolumner[TAK]).map(([namn, v]) => ({ namn, typ: v.type })),
    fetchImpl, env: { NOTION_TOKEN: 'x' }, team: las('team.json'), produkter: null, kommentarer: false, logg: null,
  });
  assert.equal(anrop.kommentarer, 0);
  assert.deepEqual(res.kommentarer, { hoppat: true });
  assert.deepEqual(res.hubbar[0].rader.find((r) => r.namn === 'Takoverdrag_PD_2_H1').ansvariga, []);
  assert.match(sammanfattning(res).join('\n'), /Kommentarssteget hoppat/);
});

test('hittaKandidater: en sökning som felade i alla försök blir ett FEL, aldrig en tyst kortare lista', async () => {
  const sok = async ({ logg }) => { logg?.('⛔ HUBBSÖKNINGEN FELADE I ALLA FÖRSÖK. Kön bygger bara på products.json:s'); return [{ id: TRIM, titel: 'Trimmer belt creative hub', kalla: 'products.json' }]; };
  const { kandidater, sok: info } = await hittaKandidater({ sok, kartor: kartor(), hubbarJson: () => [], logg: null });
  assert.match(info.fel, /sökningen felade/i);
  // Golven står kvar: register (2 med id) + andra (2) + products.json (1).
  assert.equal(kandidater.length, 5);
  assert.deepEqual(info, { baver: 1, ops: 2, andra: 2, hubbar_json: 0, kandidater: 5, fel: info.fel });

  const { fetchImpl } = falskNotion();
  const res = await hamtaHubbar({ sok, kartor: kartor(), hubbarJson: () => [], kolumner: async () => [{ namn: 'Namn', typ: 'title' }, { namn: 'Ansvarig', typ: 'people' }],
    fetchImpl, env: { NOTION_TOKEN: 'x' }, team: las('team.json'), produkter: null, kommentarer: false, logg: null });
  assert.equal(res.fel[0].hubb, '(sökningen)');
});

test('.gitignore i redigerarrapport/ håller cachen utanför git', () => {
  const gi = readFileSync(join(ROT, 'redigerarrapport', '.gitignore'), 'utf8');
  assert.match(gi, /^output\/$/m);
});
