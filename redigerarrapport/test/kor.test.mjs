import test from 'node:test';
import assert from 'node:assert/strict';
import { koppla, basKoppling, grupperaFor, hitrateFor, toppPerKampanj, tolkaArgv, senasteHelaVeckan, lasPersoner, AR_FELSPRAK, marknadFor, svensktNamn } from '../kor.mjs';
import { kallnamn } from '../namn.mjs';
import { byggRadindex } from '../namn.mjs';
import { annonsnyckel } from '../kallor.mjs';

const TEAM = { users: [
  { id: 'carl', name: 'Carl Vicente', role: 'editor', notionUserId: 'n-carl', discordUserId: '1' },
  { id: 'jerzee', name: 'Jerzee', role: 'editor', notionUserId: 'kommentar:jerzee' },
  { id: 'josh', name: 'Josh Naelga', role: 'editor', notionUserId: 'n-josh' },
  { id: 'axel', name: 'Axel Odhner', role: 'admin', notionUserId: 'n-axel' },
] };
const { notionTill } = lasPersoner(TEAM);

const HUBBAR = [{ namn: 'BÄVER Taköverdraget', rader: [
  { namn: 'Takoverdrag_SP_4_H1', ansvariga: ['n-carl'] },
  { namn: 'Takoverdrag_PD_8_1', ansvariga: [] },               // bildannons ur /bildannonser — ingen människa
  { namn: 'Takoverdrag_PD_8_H1', ansvariga: ['n-carl'] },
  { namn: 'Takoverdrag_PD_8_H2', ansvariga: ['n-carl'] },
  { namn: 'Takoverdrag_CS_9_H1', ansvariga: ['n-carl', 'kommentar:jerzee'] },
  { namn: 'Solcellslampa_PD_3_H1', ansvariga: ['n-carl'] },
  { namn: 'Solcellslampa_PD_3_H2', ansvariga: ['n-carl'] },
  { namn: 'Solcellslampa_PD_4_H1', ansvariga: ['n-carl'] },
  { namn: 'Solcellslampa_PD_4_H2', ansvariga: ['kommentar:jerzee'] },
] }];
const idx = byggRadindex(HUBBAR);
const namnOpt = { speglingar: { CaraShellRoof: 'Takoverdrag' }, noPrefix: new Map([['Takovertrekk', { se_prefix: 'Takoverdrag' }]]), uppladdade: [], omdopta: [] };
const SE = '1867947880635861', NO = '1050941584152547', OPS = '915422744950975';
const rad = (annons, over = {}) => ({ annons, konto: SE, kampanj: 'Taköverdraget | BE ROAS 1.63', etikett: 'LOSER', bedombar: true, andel: 0.05, hook_rate: 0.4, hold_rate: 0.1, fonster_slut: '2026-09-27', annons_id: `id-${annons}-${over.konto ?? SE}`, ...over });

test('hubbraden med EN Ansvarig kopplar; två personer eller ingen ger ingen', () => {
  assert.equal(koppla(rad('Takoverdrag_SP_4_H1'), { idx, namnOpt, notionTill }).person.id, 'carl');
  const tva = koppla(rad('Takoverdrag_CS_9_H1'), { idx, namnOpt, notionTill });
  assert.equal(tva.person, null); assert.match(tva.orsak, /två personer/);
  const bild = koppla(rad('Takoverdrag_PD_8_1'), { idx, namnOpt, notionTill });
  assert.equal(bild.person, null, 'bildannonsens egen rad utan Ansvarig är svaret — aldrig videoredigeraren via basregeln');
  assert.match(bild.orsak, /rad utan Ansvarig/);
});

test('marknadskod, NO-prefix och spegel löses till den svenska källraden', () => {
  const no = koppla(rad('Takovertrekk_NO_SP_4_H1', { konto: NO }), { idx, namnOpt, notionTill });
  assert.equal(no.person.id, 'carl'); assert.equal(no.kandidat, 'Takoverdrag_SP_4_H1');
  const dk = koppla(rad('CaraShellRoof_DK_SP_104_H1', { konto: OPS, kampanj: 'CARASHELL_DK_x' }), { idx, namnOpt, notionTill });
  assert.equal(dk.person.id, 'carl');
  assert.equal(marknadFor(rad('Takovertrekk_NO_SP_4_H1', { konto: NO }), no), 'NO');
  assert.equal(marknadFor(rad('CaraShellRoof_SP_104_H1', { konto: OPS, kampanj: 'CARASHELL_SE_x' }), { namnvia: 'spegel', marknad: null }), 'SE mirror');
});

test('basregeln: kontots namn utan variant kopplar bara när ALLA varianter har samma enda Ansvarig', () => {
  assert.equal(basKoppling(['Solcellslampa_PD_3'], idx, notionTill).person.id, 'carl');
  assert.equal(basKoppling(['Solcellslampa_PD_4'], idx, notionTill), null, 'H1 Carl, H2 Jerzee ⇒ tvetydigt');
  assert.equal(basKoppling(['Takoverdrag_PD_8'], idx, notionTill), null, 'en variant utan Ansvarig (bilden) ⇒ tvetydigt');
  assert.equal(koppla(rad('Solcellslampa_PD_3'), { idx, namnOpt, notionTill }).via, 'bas');
});

test('ingen produktägarreserv: en annons utan hubbrad kopplas till ingen', () => {
  const k = koppla(rad('Trimmerbelt_SP_2_H1'), { idx, namnOpt, notionTill });
  assert.equal(k.person, null); assert.equal(k.orsak, 'ingen hubbrad');
});

test('samma klipp i flera marknader blir en grupp med en etikett per marknad; FELSPRAK utesluts', () => {
  const rader = [
    rad('Takoverdrag_SP_4_H1', { etikett: 'KPI_WINNER', andel: 0.1 }),
    rad('Takovertrekk_NO_SP_4_H1', { konto: NO, etikett: 'BREAKTHROUGH', andel: 0.5 }),
    rad('Takovertrekk_NO_SP_4_H1', { konto: NO, kampanj: 'annan', etikett: 'LOSER', andel: 0.01 }),
    rad('CaraShellRoof_US_SP_104_H1_FELSPRAK', { konto: OPS, etikett: 'LOSER' }),
    rad('Takoverdrag_PD_8_H1', { etikett: 'LOSER' }),
  ];
  const kopplat = new Map(rader.map((r) => [annonsnyckel(r), koppla(r, { idx, namnOpt, notionTill })]));
  const g = grupperaFor('carl', rader, kopplat);
  assert.equal(g.size, 2);
  const sp4 = [...g.values()].find((x) => x.namn === 'Takoverdrag_SP_4_H1');
  assert.equal(sp4.rep.etikett, 'BREAKTHROUGH', 'högsta etiketten representerar gruppen');
  assert.deepEqual(sp4.marknader.map((m) => `${m.marknad} ${m.etikett}`), ['SE KPI_WINNER', 'NO BREAKTHROUGH'], 'en rad per marknad, högsta vinner, SE först');
  assert.ok(AR_FELSPRAK('X_US_PD_1_H1_FELSPRAK') && !AR_FELSPRAK('X_US_PD_1_H1'));
  const hr = hitrateFor('carl', rader, kopplat, { till: '2026-09-27', veckor: 5 });
  assert.deepEqual(hr, { traff: 1, levererade: 2, alla: 2, iter: 0 });
});

test('gruppnamnet är det svenska namnet MED varianten, aldrig syskonen hopslagna', () => {
  const sv = (a) => svensktNamn(a, kallnamn(a, { speglingar: namnOpt.speglingar, noPrefix: namnOpt.noPrefix }).kandidater, namnOpt);
  assert.equal(sv('Takovertrekk_NO_SP_4_H1'), 'Takoverdrag_SP_4_H1');
  assert.equal(sv('CaraShellRoof_DK_SP_104_H1'), 'Takoverdrag_SP_4_H1');
  assert.equal(sv('CaraShellRoof_SP_104_H1'), 'Takoverdrag_SP_4_H1', 'spegeln utan marknadskod');
  assert.equal(sv('Sotarset_PD_1_H2'), 'Sotarset_PD_1_H2');
  assert.equal(sv('Solcellslampa_PD_3'), 'Solcellslampa_PD_3');
  const rader = [rad('Sotarset_PD_1_H1', { etikett: 'LOSER' }), rad('Sotarset_PD_1_H2', { etikett: 'BREAKTHROUGH' })];
  const hubb = byggRadindex([{ namn: 'x', rader: [{ namn: 'Sotarset_PD_1', ansvariga: ['n-carl'] }] }]);
  const kopplat = new Map(rader.map((r) => [annonsnyckel(r), koppla(r, { idx: hubb, namnOpt, notionTill })]));
  assert.equal(grupperaFor('carl', rader, kopplat).size, 2, 'H1 och H2 är två klipp fast hubben har en konceptrad');
});

test('kampanjens topp är den bedömbara annonsen med störst andel och ett hook-tal', () => {
  const t = toppPerKampanj([rad('A', { andel: 0.3 }), rad('B', { andel: 0.6 }), rad('C', { andel: 0.9, bedombar: false }), rad('D', { andel: 0.8, hook_rate: null })]);
  assert.equal(t.get(`${SE}|Taköverdraget | BE ROAS 1.63`).annons, 'B');
});

test('argumenten och veckan', () => {
  assert.deepEqual(tolkaArgv(['--vecka', '2026-W39', '--discord', '--cache']).vecka, '2026-W39');
  assert.equal(tolkaArgv([]).discord, false);
  assert.throws(() => tolkaArgv(['--fel']), /Okänd flagga/);
  assert.equal(senasteHelaVeckan('2026-10-05'), '2026-W40', 'måndag ⇒ veckan som slutade i går');
  assert.equal(senasteHelaVeckan('2026-10-08'), '2026-W40');
  assert.equal(senasteHelaVeckan('2026-10-04'), '2026-W39', 'söndag ⇒ veckan är inte slut, förra hela');
});
