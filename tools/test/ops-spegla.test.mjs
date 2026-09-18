// Ren logik i tools/ops-spegla.mjs — inga nätanrop, ingen env.
// Spegelnamnet (+100), brand- och prisspärren, copyn ur en spec, valet av
// källannons och svensk fil, blockkopian, domen per rad och Discord-jobbet.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SPEGEL_OFFSET, spegelnamn, ursprungsnummer, adIdUrUrl, kontoUrUrl, brandtraff, prisUrBrief, prisParitet,
  copyUrSpec, valjKallannons, valjSeFil, kopieraBlock, kalloutBlock, textUrBlock, bedom, byggDiscordJobb, utanInternt,
} from '../ops-spegla.mjs';
import { speglingsstatusar, giltigSpegling } from '../../factory/register.mjs';
import { BUTIKSRUTINER, rutinGaller, tiderFor } from '../../factory/rutin.mjs';

// ------------------------------------------------------------ namn

test('spegelnamn: källans nummer + 100 med butikens prefix, varianten följer med', () => {
  assert.equal(spegelnamn('Takoverdrag_BOF_3_1', 'CaraShellRoof'), 'CaraShellRoof_BOF_103_1');
  assert.equal(spegelnamn('Takoverdrag_GT_5_H1', 'CaraShellRoof'), 'CaraShellRoof_GT_105_H1');
  assert.equal(spegelnamn('Termoskydd_CS_6_1 – static', 'CaraShellFront'), 'CaraShellFront_CS_106_1', 'radtiteln kan bära ett tillägg efter bindestreck');
  assert.equal(SPEGEL_OFFSET, 100);
});

test('spegelnamn: utan koncept, nummer eller prefix blir det null — aldrig ett gissat namn', () => {
  assert.equal(spegelnamn('Takoverdrag', 'CaraShellRoof'), null);
  assert.equal(spegelnamn('Takoverdrag_BOF_3_1', ''), null);
  assert.equal(spegelnamn('', 'CaraShellRoof'), null);
});

test('ursprungsnummer: ≥ 100 är speglat, under är butikens eget', () => {
  assert.equal(ursprungsnummer('CaraShellRoof_BOF_103_1'), 3);
  assert.equal(ursprungsnummer('CaraShellRoof_BOF_4_1'), null);
});

test('adIdUrUrl/kontoUrUrl: Ads Manager-länken ur Translated url', () => {
  const url = 'https://business.facebook.com/adsmanager/manage/ads?act=1050941584152547&selected_ad_ids=120252262850290233';
  assert.equal(adIdUrUrl(url), '120252262850290233');
  assert.equal(kontoUrUrl(url), '1050941584152547');
  assert.equal(adIdUrUrl(null), null);
  assert.equal(adIdUrUrl('https://drive.google.com/x'), null);
});

// ------------------------------------------------------------ spärrarna

test('brandtraff: bäver/beaver i vilken text som helst stoppar, ren copy släpps', () => {
  assert.deepEqual(brandtraff('6,5 × 3 meter – hela taket, inget mer.', 'Tåler vinteren'), []);
  assert.deepEqual(brandtraff('Köp hos Bäverbutiken idag', 'from baverbutiken.se'), ['Bäverbutiken', 'baverbutiken']);
  assert.deepEqual(brandtraff(null, undefined, 'Beaver Store'), ['Beaver']);
  // Briefens "Landing page: https://baverbutiken.se/…" är metadata, inte annonstext.
  assert.deepEqual(brandtraff('Landing page: https://baverbutiken.se/products/takoverdrag\nHook: Hela taket.'), []);
  assert.deepEqual(brandtraff('Se https://baverbutiken.se/x — köp hos Bäverbutiken'), ['Bäverbutiken']);
});

test('prisUrBrief: "Price exactly 1 129 kr (compare-at 1 469 kr)" → 1129, svensk form och saknad rad', () => {
  assert.equal(prisUrBrief('Rules\nPrice exactly 1 129 kr (compare-at 1 469 kr). Never invented urgency'), 1129);
  assert.equal(prisUrBrief('Price exactly 559 kr (compare-at 932 kr).'), 559);
  assert.equal(prisUrBrief('Pris exakt: 1 129 kr'), 1129);
  assert.equal(prisUrBrief('Price exactly 1 129 kr'), 1129);
  assert.equal(prisUrBrief('No price in this ad.'), null);
});

test('prisParitet: 20 % är gränsen, okänt pris är aldrig ok', () => {
  assert.equal(prisParitet(1129, 1129).ok, true);
  assert.equal(prisParitet(1129, 1000).ok, true, '12,9 % — innanför');
  const stopp = prisParitet(1469, 1129);
  assert.equal(stopp.ok, false);
  assert.match(stopp.skal, /30 %/);
  assert.equal(prisParitet(null, 1129).ok, false);
  assert.equal(prisParitet(null, 1129).okand, true);
  assert.equal(prisParitet(559, null).ok, false);
});

// ------------------------------------------------------------ copy + filer

test('copyUrSpec: bild (link_data) och video (video_data), null utan primary text', () => {
  assert.deepEqual(copyUrSpec({ link_data: { message: 'Hela taket.', name: 'Rubrik', description: 'Desc', link: 'https://x.se/p' } }), { message: 'Hela taket.', rubrik: 'Rubrik', beskrivning: 'Desc', lank: 'https://x.se/p' });
  const v = copyUrSpec({ video_data: { message: 'Rad ett\nRad två', title: 'T', link_description: 'LD', call_to_action: { value: { link: 'https://x.se/v' } } } });
  assert.deepEqual(v, { message: 'Rad ett\nRad två', rubrik: 'T', beskrivning: 'LD', lank: 'https://x.se/v' });
  assert.equal(copyUrSpec({ video_data: { message: 'Bara text' } }).rubrik, 'Bara text', 'utan rubrik: första raden');
  assert.equal(copyUrSpec({ link_data: { name: 'Bara rubrik' } }), null);
  assert.equal(copyUrSpec(null), null);
});

test('valjKallannons: exakt namn, ACTIVE före PAUSED, nyast före äldst', () => {
  const annonser = [
    { id: '1', name: 'Takoverdrag_BOF_3_1', effective_status: 'PAUSED', created_time: '2026-09-10' },
    { id: '2', name: 'takoverdrag_bof_3_1', effective_status: 'ACTIVE', created_time: '2026-09-01' },
    { id: '3', name: 'Takoverdrag_BOF_3_1', effective_status: 'ACTIVE', created_time: '2026-09-12' },
    { id: '4', name: 'Takoverdrag_BOF_3_1_H1', effective_status: 'ACTIVE', created_time: '2026-09-13' },
  ];
  assert.equal(valjKallannons(annonser, 'Takoverdrag_BOF_3_1').id, '3');
  assert.equal(valjKallannons(annonser, 'Takoverdrag_BOF_9_1'), null);
});

test('valjSeFil: 4:5 före 1:1, NO-filer räknas aldrig som svensk', () => {
  assert.equal(valjSeFil(['/x/Takoverdrag_BOF_3_1_1x1.jpg', '/x/Takoverdrag_BOF_3_1_4x5.jpg']), '/x/Takoverdrag_BOF_3_1_4x5.jpg');
  assert.equal(valjSeFil(['/x/Takoverdrag_GT_5_H1.mp4']), '/x/Takoverdrag_GT_5_H1.mp4');
  assert.equal(valjSeFil(['/x/CaraShellRoof_NO_BOF_103_1.jpg', '/x/Takoverdrag_BOF_3_1.jpg']), '/x/Takoverdrag_BOF_3_1.jpg');
  assert.equal(valjSeFil([]), null);
  // Granskningsfynd 2026-09-18: bara NO-filer får ALDRIG bli "den svenska filen".
  assert.equal(valjSeFil(['/x/CaraShellRoof_NO_GT_105_H1.mp4']), null);
  assert.equal(valjSeFil(['/x/Takovertrekk_NO_GT_5_H1.mp4', '/x/x_no.mp4']), null);
});

// ------------------------------------------------------------ blocken

const rt = (t, extra = {}) => [{ type: 'text', plain_text: t, text: { content: t }, annotations: { bold: false, italic: false, strikethrough: false, underline: false, code: false, color: 'default' }, href: null, ...extra }];

test('kopieraBlock: text, rubriker, listor och tabeller följer med; media och nästlat hoppas', () => {
  const block = [
    { type: 'paragraph', paragraph: { rich_text: rt('Make: Static image') }, has_children: false },
    { type: 'heading_2', heading_2: { rich_text: rt('Hook') } },
    { type: 'bulleted_list_item', bulleted_list_item: { rich_text: rt('Price exactly 1 129 kr') } },
    { type: 'table', table: { table_width: 2, has_column_header: true, has_row_header: false }, has_children: true, barn: [
      { type: 'table_row', table_row: { cells: [rt('Swedish (use this)'), rt('English meaning')] } },
      { type: 'table_row', table_row: { cells: [rt('Hela taket.')] } },
    ] },
    { type: 'image', image: { file: { url: 'https://signed' } } },
    { type: 'video', video: { file: { url: 'https://signed' } } },
    { type: 'paragraph', paragraph: { rich_text: rt('Link for approval: https://drive.google.com/x', { href: 'https://drive.google.com/x' }) }, has_children: true },
    { type: 'divider', divider: {} },
    { type: 'child_database', child_database: {} },
  ];
  const { block: ut, hoppade } = kopieraBlock(block);
  assert.deepEqual(ut.map((b) => b.type), ['paragraph', 'heading_2', 'bulleted_list_item', 'table', 'paragraph', 'divider']);
  assert.equal(ut[0].paragraph.rich_text[0].text.content, 'Make: Static image');
  assert.equal(ut[0].paragraph.rich_text[0].plain_text, undefined, 'lästa fält får inte följa med i ett POST');
  assert.equal(ut[3].table.children.length, 2);
  assert.equal(ut[3].table.children[1].table_row.cells.length, 2, 'kort rad fylls ut till tabellbredden');
  assert.deepEqual(ut[3].table.children[1].table_row.cells[1], []);
  assert.equal(ut[4].paragraph.rich_text[0].text.link.url, 'https://drive.google.com/x', 'Drive-länken följer med — notion-fil.mjs läser den');
  assert.deepEqual(hoppade.sort((a, b) => a.typ.localeCompare(b.typ)), [{ typ: 'child_database', antal: 1 }, { typ: 'image', antal: 1 }, { typ: 'nästlade', antal: 1 }, { typ: 'video', antal: 1 }]);
});

test('kopieraBlock: tom tabell hoppas, tom lista ger tom kopia', () => {
  assert.deepEqual(kopieraBlock([{ type: 'table', table: { table_width: 2 }, has_children: true, barn: [] }]).block, []);
  assert.deepEqual(kopieraBlock([]).block, []);
});

test('textUrBlock: plain text ur block och tabellceller — det brand- och prisskanningen läser', () => {
  const text = textUrBlock([
    { type: 'paragraph', paragraph: { rich_text: rt('Why: cheap tarp') } },
    { type: 'table', table: {}, barn: [{ type: 'table_row', table_row: { cells: [rt('Hela taket.'), rt('The whole roof.')] } }] },
  ]);
  assert.equal(text, 'Why: cheap tarp\nHela taket. | The whole roof.');
});

test('kalloutBlock: engelska, källänken sist, säger att butiken aldrig nämns', () => {
  const b = kalloutBlock({ kallNamn: 'BÄVER Tak', kallUrl: 'https://notion.so/x', brand: 'CaraShell', datum: '2026-09-18' });
  assert.equal(b.type, 'callout');
  assert.match(b.callout.rich_text[0].text.content, /never name the store/);
  assert.equal(b.callout.rich_text[1].text.link.url, 'https://notion.so/x');
});

// ------------------------------------------------------------ domen

const RAD_OK = {
  spegel: 'CaraShellRoof_BOF_103_1', brand: [], paritet_se: { ok: true }, kampanj_se: { id: '1' }, kampanj_no: { id: '2' },
  finns_i_meta: { SE: false, NO: false }, fil: '/x/se.jpg', fil_fel: null, copy_se: { message: 'x', rubrik: 'y' },
  no: { fel: null, copy: { message: 'n', rubrik: 'r' }, fil: '/x/no.jpg' }, paritet_no: { ok: true },
};

test('bedom: allt på plats ⇒ SE och NO ok', () => {
  const d = bedom(RAD_OK);
  assert.equal(d.se.ok, true);
  assert.equal(d.no.ok, true);
});

test('bedom: brand, pris, saknad fil och saknad copy stoppar SE — och därmed NO', () => {
  assert.match(bedom({ ...RAD_OK, brand: ['Bäverbutiken'] }).se.skal.join(), /Bäverbutiken/);
  assert.match(bedom({ ...RAD_OK, paritet_se: { ok: false, skal: 'creativen säger 1469' } }).se.skal.join(), /pris SE/);
  assert.match(bedom({ ...RAD_OK, fil: null, fil_fel: 'Drive tom' }).se.skal.join(), /Drive tom/);
  assert.match(bedom({ ...RAD_OK, copy_se: null }).se.skal.join(), /ingen copy/);
  assert.equal(bedom({ ...RAD_OK, copy_se: null }).no.ok, false);
});

test('bedom: redan uppe i SE ⇒ varken fil eller copy krävs för SE', () => {
  const d = bedom({ ...RAD_OK, finns_i_meta: { SE: true, NO: false }, fil: null, copy_se: null });
  assert.equal(d.se.ok, true);
});

test('bedom: NO utan version, med fel, utan kampanj eller med prisavvikelse stoppas — SE påverkas inte', () => {
  assert.equal(bedom({ ...RAD_OK, no: null }).no.ok, false);
  assert.match(bedom({ ...RAD_OK, no: null }).no.skal.join(), /Translated url/);
  assert.match(bedom({ ...RAD_OK, no: { ...RAD_OK.no, fel: 'Meta gav ingen fil-URL' } }).no.skal.join(), /fil-URL/);
  assert.match(bedom({ ...RAD_OK, kampanj_no: null }).no.skal.join(), /NO-kampanj/);
  assert.equal(bedom({ ...RAD_OK, paritet_no: { ok: false, skal: 'x' } }).no.ok, false);
  assert.equal(bedom({ ...RAD_OK, paritet_no: { ok: false, skal: 'x' } }).se.ok, true);
});

// ------------------------------------------------------------ rapporten

test('byggDiscordJobb: engelska rader, hoppade under warnings, brand/pris under ACTION, saknade statusar under ACTION', () => {
  const j = byggDiscordJobb({
    brand: 'CaraShell', datum: '2026-09-18', kalla_hub_namn: 'BÄVER Tak', saknade_statusar: ['CaraShell EN ready to be active'],
    rader: [
      { namn: 'Takoverdrag_BOF_3_1', spegel: 'CaraShellRoof_BOF_103_1', utfall: 'speglad', se: { ad_id: '1', kampanj: 'CARASHELL_SE_Tak', adset: 'CARASHELL_SE_Tak - BOF' }, no: { ad_id: '2', kampanj: 'CARASHELL_NO_Tak' }, hubb: { url: 'https://n' } },
      { namn: 'Takoverdrag_GT_5_H1', spegel: 'CaraShellRoof_GT_105_H1', utfall: 'speglad', se: { ad_id: '3', kampanj: 'CARASHELL_SE_Tak' }, no: { ad_id: null, skal: 'ingen NO-version' } },
      { namn: 'Takoverdrag_CS_4_1', utfall: 'hoppad', skal: 'nämner Bäverbutiken: Bäverbutiken' },
      { namn: 'Takoverdrag_PD_5_1', utfall: 'fel', skal: 'SE-uppladdningen misslyckades: Meta 400' },
    ],
    approved: [{ namn: 'Takoverdrag_BOF_1_1', us_ad_id: '9' }],
    varningar: ['butikens NO-pris: okänt'],
  });
  assert.equal(j.lage, 'spegla');
  assert.equal(j.brand, 'CaraShell');
  assert.equal(j.gjort.length, 3);
  assert.match(j.gjort[0], /SE ad 1 live in CARASHELL_SE_Tak \(adset CARASHELL_SE_Tak - BOF\), NO ad 2/);
  assert.match(j.gjort[2], /English version 9 is live/);
  assert.equal(j.varningar.length, 4);
  assert.match(j.varningar[0], /NO not mirrored/);
  assert.equal(j.action_axel.length, 3);
  assert.match(j.action_axel[0], /Bäverbutiken/);
  assert.match(j.action_axel[2], /Add these Status options/);
});

test('utanInternt: block och scheman skrivs aldrig ut', () => {
  const ut = utanInternt({ brand: 'X', _hubbar: { kalla: {} }, rader: [{ namn: 'a', _block: [1, 2] }] });
  assert.equal(ut._hubbar, undefined);
  assert.equal(ut.rader[0]._block, undefined);
  assert.equal(ut.rader[0].namn, 'a');
});

// ------------------------------------------------------------ registret + rutinen

test('speglingsstatusar: två steg namngivna efter brandet, samma stavning överallt', () => {
  assert.deepEqual(speglingsstatusar('CaraShell'), { se: 'CaraShell SE ready to be active', en: 'CaraShell EN ready to be active' });
  assert.throws(() => speglingsstatusar(''), /brand/);
});

test('giltigSpegling: 32 hex krävs, med eller utan bindestreck', () => {
  assert.equal(giltigSpegling({ kalla_hub: '7ec270ab-908c-82f6-a2a8-0153159b20fa' }), true);
  assert.equal(giltigSpegling({ kalla_hub: '7ec270ab908c82f6a2a80153159b20fa' }), true);
  assert.equal(giltigSpegling({ kalla_hub: 'https://notion.so/x' }), false);
  assert.equal(giltigSpegling(null), false);
  assert.equal(giltigSpegling('7ec270ab908c82f6a2a80153159b20fa'), false);
});

test('rutinGaller: ops-spegla byggs bara med spegling, US bara med marknaden, resten alltid', () => {
  assert.equal(rutinGaller(BUTIKSRUTINER['ops-spegla'], { marknader: ['NO', 'US'], spegling: false }), false);
  assert.equal(rutinGaller(BUTIKSRUTINER['ops-spegla'], { marknader: ['NO'], spegling: true }), true);
  assert.equal(rutinGaller(BUTIKSRUTINER['ops-oversatt-us'], { marknader: ['NO'], spegling: true }), false);
  assert.equal(rutinGaller(BUTIKSRUTINER['ops-oversatt-us'], { marknader: ['NO', 'US'] }), true);
  assert.equal(rutinGaller(BUTIKSRUTINER['ops-leverans'], {}), true);
});

test('tiderFor: speglingen ligger 16:20 + 5 min × plats, efter Bäverbutikens NO (15:00) och före US (16:40 + plats)', () => {
  const platser = { carashell: 5 };
  const med = tiderFor('carashell', { platser, datum: new Date('2026-07-15T12:00:00Z'), annonsmarknader: ['NO', 'US'], spegling: true });
  const spegla = med.find((t) => t.kommando === '/ops-spegla carashell');
  assert.ok(spegla, 'rutinen finns med spegling');
  assert.equal(spegla.tid, '16:45');
  assert.equal(spegla.cron, '45 14 * * *');
  const us = med.find((t) => t.kommando.includes('--marknad US'));
  assert.equal(us.tid, '17:05');
  const utan = tiderFor('carashell', { platser, datum: new Date('2026-07-15T12:00:00Z'), annonsmarknader: ['NO', 'US'], spegling: false });
  assert.equal(utan.find((t) => t.kommando === '/ops-spegla carashell'), undefined, 'utan spegling byggs den inte');
});
