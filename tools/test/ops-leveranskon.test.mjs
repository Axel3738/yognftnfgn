// Ren logik i tools/ops-leveranskon.mjs — inga nätanrop, ingen env.
// Namnparsern, NO-namnet, kampanjbas/adsetnamn, valet av exakt en kampanj,
// dubblettkollen, länkplocket, prisplocket, statusjämförelsen, handle ur URL.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  annonsdel, statusLika, typAv, tolkaNamn, noNamn, malNamn, kampanjBas, adsetNamn,
  hittaAdset, valjMalkampanj, dubblettKarta, dubblett, lankUr, arvdLank,
  handleUr, produktJsonUrl, prisUr, leveransText, prefixAvviker, STANDARD_STATUS,
} from '../ops-leveranskon.mjs';
import { tillhorButiken } from '../../factory/register.mjs';

test('prefixAvviker: Bäverbutikens gamla prefix i OPS-hubben flaggas, butikens eget inte', () => {
  const prefix = ['heimguard_', 'heimguard'];
  assert.equal(prefixAvviker('Overvakningskamera_BOF_9_1', prefix, tillhorButiken), true);
  assert.equal(prefixAvviker('HeimGuard_SP_2_1', prefix, tillhorButiken), false);
  assert.equal(prefixAvviker('HeimGuard_NO_SP_2_1', prefix, tillhorButiken), false);
  assert.equal(prefixAvviker('', prefix, tillhorButiken), false);
});

// ------------------------------------------------------------ namn

test('tolkaNamn: HeimGuard_SP_2_1 → SP, 2, variant 1', () => {
  assert.deepEqual(tolkaNamn('HeimGuard_SP_2_1'), { prefix: 'HeimGuard', koncept: 'SP', nummer: 2, variant: '1' });
});

test('tolkaNamn: TackleBayRod_PD_1_H1 → PD, 1, variant H1', () => {
  assert.deepEqual(tolkaNamn('TackleBayRod_PD_1_H1'), { prefix: 'TackleBayRod', koncept: 'PD', nummer: 1, variant: 'H1' });
});

test('tolkaNamn: HeimGuard_G_2 → G, 2, ingen variant', () => {
  assert.deepEqual(tolkaNamn('HeimGuard_G_2'), { prefix: 'HeimGuard', koncept: 'G', nummer: 2, variant: null });
});

test('tolkaNamn: konceptet är versaler och bara bokstäver; annars null', () => {
  assert.equal(tolkaNamn('HeimGuard_sp_2_1').koncept, 'SP');
  assert.equal(tolkaNamn('HeimGuard_2_1').koncept, null);       // siffra där konceptet ska stå
  assert.equal(tolkaNamn('HeimGuard').koncept, null);           // inget koncept alls
  assert.equal(tolkaNamn('HeimGuard').nummer, null);
  assert.equal(tolkaNamn('').prefix, null);
});

test('tolkaNamn: Notion-suffix efter " – " ignoreras', () => {
  assert.deepEqual(tolkaNamn('HeimGuard_SP_2_1 – COPY ONLY: ny hook'), { prefix: 'HeimGuard', koncept: 'SP', nummer: 2, variant: '1' });
  assert.equal(annonsdel('HeimGuard_SP_2_1 - något'), 'HeimGuard_SP_2_1');
});

test('noNamn: prefix + _NO_ + resten', () => {
  assert.equal(noNamn('HeimGuard_SP_2_1'), 'HeimGuard_NO_SP_2_1');
  assert.equal(noNamn('TackleBayRod_PD_1_H1'), 'TackleBayRod_NO_PD_1_H1');
  assert.equal(noNamn('HeimGuard_NO_SP_2_1'), 'HeimGuard_NO_SP_2_1');   // redan NO — orört
  assert.equal(noNamn('HeimGuard'), null);                              // inget "_"
  assert.equal(noNamn('HeimGuard_SP_2_1 – COPY ONLY'), 'HeimGuard_NO_SP_2_1');
});

test('malNamn: SE = namnet självt, NO = noNamn', () => {
  assert.equal(malNamn('HeimGuard_SP_2_1', 'SE'), 'HeimGuard_SP_2_1');
  assert.equal(malNamn('HeimGuard_SP_2_1', 'no'), 'HeimGuard_NO_SP_2_1');
});

// ------------------------------------------------------------ kampanj + adset

test('kampanjBas: allt före första " | "', () => {
  assert.equal(kampanjBas('HEIMGUARD_SE_Övervakningskameran | BE-ROAS 2,11 | 2026-09-08'), 'HEIMGUARD_SE_Övervakningskameran');
  assert.equal(kampanjBas('TANKGUARD_NO_SALES'), 'TANKGUARD_NO_SALES');
  assert.equal(kampanjBas(null), '');
});

test('adsetNamn: "<bas> - <KONCEPT>" per OPS-konventionen; null utan koncept', () => {
  assert.equal(adsetNamn('HEIMGUARD_SE_Övervakningskameran', 'SP'), 'HEIMGUARD_SE_Övervakningskameran - SP');
  assert.equal(adsetNamn('HEIMGUARD_SE_Övervakningskameran', null), null);
  assert.equal(adsetNamn('', 'SP'), null);
});

test('hittaAdset: exakt namn, skiftlägesokänsligt, annars null', () => {
  const adsets = [{ id: '1', name: 'HEIMGUARD_SE_Övervakningskameran - SP', status: 'ACTIVE' }, { id: '2', name: 'X - PD', status: 'PAUSED' }];
  assert.deepEqual(hittaAdset(adsets, 'heimguard_se_övervakningskameran - sp'), { id: '1', name: 'HEIMGUARD_SE_Övervakningskameran - SP', status: 'ACTIVE' });
  assert.equal(hittaAdset(adsets, 'HEIMGUARD_SE_Övervakningskameran - BOF'), null);
  assert.equal(hittaAdset(adsets, null), null);
});

test('valjMalkampanj: exakt en ACTIVE → kampanj med bas', () => {
  const v = valjMalkampanj([{ id: '10', name: 'HEIMGUARD_SE_Övervakningskameran | BE-ROAS 2,11', status: 'ACTIVE' }], 'SE');
  assert.equal(v.skal, null);
  assert.deepEqual(v.kampanj, { id: '10', namn: 'HEIMGUARD_SE_Övervakningskameran | BE-ROAS 2,11', bas: 'HEIMGUARD_SE_Övervakningskameran', status: 'ACTIVE', utfall: 'ACTIVE' });
});

test('valjMalkampanj: noll kampanjer → null med "/ny-annonser bygger den"', () => {
  const v = valjMalkampanj([], 'NO');
  assert.equal(v.kampanj, null);
  assert.match(v.skal, /ingen NO-kampanj — \/ny-annonser bygger den/);
});

test('valjMalkampanj: två ACTIVE → null, båda listade, ingen gissning', () => {
  const v = valjMalkampanj([
    { id: '1', name: 'HEIMGUARD_SE_A', status: 'ACTIVE' },
    { id: '2', name: 'HEIMGUARD_SE_B', status: 'ACTIVE' },
  ], 'SE');
  assert.equal(v.kampanj, null);
  assert.match(v.skal, /2 ACTIVE SE-kampanjer/);
  assert.match(v.skal, /HEIMGUARD_SE_A \(1\)/);
  assert.match(v.skal, /HEIMGUARD_SE_B \(2\)/);
});

test('valjMalkampanj: PAUSED med spend = avvecklad, aldrig mål', () => {
  const v = valjMalkampanj([{ id: '1', name: 'HEIMGUARD_SE_Gammal', status: 'PAUSED', spend: 12345 }], 'SE');
  assert.equal(v.kampanj, null);
  assert.match(v.skal, /PAUSED med 12345 kr spend \(avvecklad/);
  assert.equal(v.kandidater[0].utfall, 'AVVECKLAD');
});

test('valjMalkampanj: PAUSED utan spend → null, VA:n slår på först', () => {
  const v = valjMalkampanj([{ id: '1', name: 'HEIMGUARD_NO_Ny', status: 'PAUSED', utfall: 'PAUSAD_TOM', spend: 0 }], 'NO');
  assert.equal(v.kampanj, null);
  assert.match(v.skal, /PAUSED utan spend/);
});

test('valjMalkampanj: en ACTIVE bredvid en avvecklad → den aktiva vinner', () => {
  const v = valjMalkampanj([
    { id: '1', name: 'HEIMGUARD_SE_Gammal', status: 'PAUSED', spend: 500 },
    { id: '2', name: 'HEIMGUARD_SE_Ny | x', status: 'ACTIVE' },
  ], 'SE');
  assert.equal(v.kampanj.id, '2');
  assert.equal(v.kampanj.bas, 'HEIMGUARD_SE_Ny');
});

// ------------------------------------------------------------ dubblett

test('dubblettkoll: namnet finns i kontot (skiftlägesokänsligt) → finns_i_meta + ad_id', () => {
  const karta = dubblettKarta([{ id: '900', name: 'HeimGuard_SP_2_1' }, { id: '901', name: ' Annan_PD_1 ' }]);
  assert.deepEqual(dubblett('heimguard_sp_2_1', karta), { finns_i_meta: true, ad_id: '900' });
  assert.deepEqual(dubblett('Annan_PD_1', karta), { finns_i_meta: true, ad_id: '901' });
  assert.deepEqual(dubblett('HeimGuard_NO_SP_2_1', karta), { finns_i_meta: false, ad_id: null });
  assert.deepEqual(dubblett(null, karta), { finns_i_meta: false, ad_id: null });
});

// ------------------------------------------------------------ länk

test('lankUr: link_data.link', () => {
  assert.equal(lankUr({ link_data: { link: 'https://heimguard.se/products/overvakningskameran' } }), 'https://heimguard.se/products/overvakningskameran');
});

test('lankUr: video_data.call_to_action.value.link', () => {
  assert.equal(lankUr({ video_data: { video_id: '1', call_to_action: { type: 'SHOP_NOW', value: { link: 'https://heimguard.se/products/x' } } } }), 'https://heimguard.se/products/x');
  assert.equal(lankUr({ video_data: { video_id: '1' } }), null);
  assert.equal(lankUr(null), null);
});

test('arvdLank: senast skapade ACTIVE annonsen med länk vinner', () => {
  const annonser = [
    { id: 'a', name: 'Gammal', status: 'ACTIVE', created_time: '2026-09-01T00:00:00+0000', creative: { object_story_spec: { link_data: { link: 'https://x.se/products/gammal' } } } },
    { id: 'b', name: 'Nyast-pausad', status: 'PAUSED', created_time: '2026-09-10T00:00:00+0000', creative: { object_story_spec: { link_data: { link: 'https://x.se/products/pausad' } } } },
    { id: 'c', name: 'Ny-aktiv', status: 'ACTIVE', created_time: '2026-09-08T00:00:00+0000', creative: { object_story_spec: { video_data: { call_to_action: { value: { link: 'https://x.se/products/aktiv' } } } } } },
    { id: 'd', name: 'Utan länk', status: 'ACTIVE', created_time: '2026-09-11T00:00:00+0000', creative: { object_story_spec: {} } },
  ];
  assert.deepEqual(arvdLank(annonser), { lank: 'https://x.se/products/aktiv', fran: 'Ny-aktiv', status: 'ACTIVE' });
});

test('arvdLank: ingen ACTIVE med länk → senast skapade med länk; inga länkar → null', () => {
  const r = arvdLank([
    { id: 'a', status: 'PAUSED', name: 'A', created_time: '2026-09-01', creative: { object_story_spec: { link_data: { link: 'https://x.se/products/a' } } } },
    { id: 'b', status: 'PAUSED', name: 'B', created_time: '2026-09-05', creative: { object_story_spec: { link_data: { link: 'https://x.se/products/b' } } } },
  ]);
  assert.equal(r.lank, 'https://x.se/products/b');
  assert.equal(arvdLank([{ id: 'a', status: 'ACTIVE', creative: {} }]), null);
  assert.equal(arvdLank([]), null);
});

// ------------------------------------------------------------ handle + pris

test('handleUr: med och utan query, med språkprefix, utan /products/', () => {
  assert.equal(handleUr('https://heimguard.se/products/overvakningskameran'), 'overvakningskameran');
  assert.equal(handleUr('https://heimguard.se/products/overvakningskameran?variant=123&utm=x#top'), 'overvakningskameran');
  assert.equal(handleUr('https://heimguard.se/nb/products/overvakningskameran/'), 'overvakningskameran');
  assert.equal(handleUr('https://heimguard.se/collections/all'), null);
  assert.equal(handleUr('inte en url'), null);
});

test('produktJsonUrl: bevarar språkprefix, slänger query', () => {
  assert.equal(produktJsonUrl('https://heimguard.se/products/x?variant=1'), 'https://heimguard.se/products/x.json');
  assert.equal(produktJsonUrl('https://heimguard.se/nb/products/x'), 'https://heimguard.se/nb/products/x.json');
  assert.equal(produktJsonUrl('https://heimguard.se/'), null);
});

test('prisUr: variants[0].price + min/max över varianterna', () => {
  const svar = { product: { title: 'Kameran', handle: 'overvakningskameran', variants: [
    { price: '799.00', compare_at_price: '1000.00' }, { price: '1499.00', compare_at_price: null }, { price: '699.00' },
  ] } };
  const p = prisUr(svar, 'SEK');
  assert.equal(p.pris, 799);
  assert.equal(p.min, 699);
  assert.equal(p.max, 1499);
  assert.equal(p.jamforpris, 1000);
  assert.equal(p.valuta, 'SEK');
  assert.equal(p.handle, 'overvakningskameran');
});

test('prisUr: utan varianter → null', () => {
  assert.equal(prisUr({ product: { variants: [] } }), null);
  assert.equal(prisUr({}), null);
});

// ------------------------------------------------------------ status, typ, text

test('statusLika: skiftlägesokänslig med trimning', () => {
  assert.equal(statusLika('To be Reviewed', 'to be reviewed'), true);
  assert.equal(statusLika(' SE-ACTIVE to be translated ', 'se-active TO BE translated'), true);
  assert.equal(statusLika('Approved', 'To be Reviewed'), false);
  assert.equal(STANDARD_STATUS.SE, 'To be Reviewed');
  assert.equal(STANDARD_STATUS.NO, 'SE-ACTIVE to be translated');
});

test('typAv: Typ med "video" → video, annars bild', () => {
  assert.equal(typAv('Video - Pending Approval'), 'video');
  assert.equal(typAv('Image - Pending Approval'), 'bild');
  assert.equal(typAv(''), 'bild');
});

test('leveransText: aldrig en URL, bara namn/id', () => {
  assert.equal(leveransText({ leverans: 'notion-fil', filer: [{ namn: 'a.jpg', url: 'https://signerad' }] }), 'bilaga: a.jpg');
  assert.equal(leveransText({ leverans: 'sid-media', media: [{ typ: 'video', namn: 'b.mp4', url: 'https://signerad' }] }), 'mediablock: b.mp4');
  assert.equal(leveransText({ leverans: 'drive-lank', drive: [{ typ: 'mapp', id: 'abc' }] }), 'Drive: mapp abc');
  assert.match(leveransText({ leverans: 'saknas' }), /SAKNAS/);
});

test('ommarkt: flyttad Bäverbutiks-rad får butikens prefix i målnamnet', async () => {
  const { ommarkt } = await import('../ops-leveranskon.mjs');
  assert.equal(ommarkt('Overvakningskamera_BOF_9_1', 'HeimGuard'), 'HeimGuard_BOF_9_1');
  assert.equal(ommarkt('Overvakningskamera_BOF_9_1', 'HeimGuard_'), 'HeimGuard_BOF_9_1');
  assert.equal(malNamn(ommarkt('Overvakningskamera_BOF_9_1', 'HeimGuard'), 'NO'), 'HeimGuard_NO_BOF_9_1');
  assert.equal(ommarkt('HeimGuard', 'HeimGuard'), 'HeimGuard');   // inget "_" — orört
  assert.equal(ommarkt('Overvakningskamera_BOF_9_1', ''), 'Overvakningskamera_BOF_9_1');
});

test('tasMedISE: To be Reviewed alltid; Creative strat review bara med butikens prefix och fil', async () => {
  const { tasMedISE, CS_STATUS_SE } = await import('../ops-leveranskon.mjs');
  assert.equal(CS_STATUS_SE, 'Creative strat review');
  assert.equal(tasMedISE({ status: 'To be Reviewed', prefix_avviker: true, leverans: 'saknas' }), true);
  assert.equal(tasMedISE({ status: 'creative strat review', prefix_avviker: false, leverans: 'drive-lank' }), true);
  // Parkerad källrad (Rodholder_* i TackleBays hub) — Axels nej till brand-swap står.
  assert.equal(tasMedISE({ status: 'Creative strat review', prefix_avviker: true, leverans: 'drive-lank' }), false);
  assert.equal(tasMedISE({ status: 'Creative strat review', prefix_avviker: false, leverans: 'saknas' }), false);
  assert.equal(tasMedISE({ status: 'Draft', prefix_avviker: false, leverans: 'notion-fil' }), false);
  // DryTreks hub: registrets prefixfilter godtar "Damasker_…" (ärvd historik), men
  // CS-raden måste bära brandet — Damasker_PD_10_H1 är Bäverbutikens, DryTrek_Damasker_PD_12_H1 är butikens.
  assert.equal(tasMedISE({ namn: 'Damasker_PD_10_H1', status: 'Creative strat review', prefix_avviker: false, leverans: 'drive-lank' }, { brand: 'DryTrek' }), false);
  assert.equal(tasMedISE({ namn: 'DryTrek_Damasker_PD_12_H1', status: 'Creative strat review', prefix_avviker: false, leverans: 'drive-lank' }, { brand: 'DryTrek' }), true);
  assert.equal(tasMedISE({ namn: 'TackleBayRod_PD_46_H1', status: 'Creative strat review', prefix_avviker: false, leverans: 'drive-lank' }, { brand: 'TackleBay' }), true);
  assert.equal(tasMedISE({ namn: 'Damasker_PD_10_H1', status: 'To be Reviewed', prefix_avviker: false, leverans: 'drive-lank' }, { brand: 'DryTrek' }), true);   // standardstatusen: oförändrat beteende
  // NO-kön: standardstatusen är en annan, CS-status räknas inte där.
  assert.equal(tasMedISE({ status: 'SE-ACTIVE to be translated', prefix_avviker: false, leverans: 'notion-fil' }, { kostatus: 'SE-ACTIVE to be translated' }), true);
});

test('tolkaNamn + hittaAdset: DryTreks tvådelade namn ger koncept PD och hittar DRYTREK_SE_PD', () => {
  assert.deepEqual(tolkaNamn('DryTrek_Damasker_PD_14_1'), { prefix: 'DryTrek', koncept: 'PD', nummer: 14, variant: '1' });
  assert.deepEqual(tolkaNamn('DryTrek_Damasker_FO_2_H1'), { prefix: 'DryTrek', koncept: 'FO', nummer: 2, variant: 'H1' });
  assert.equal(tolkaNamn('Damasker_PD_10_H1').koncept, 'PD');
  const adsets = [{ id: '1', name: 'DRYTREK_SE_SP', status: 'ACTIVE' }, { id: '2', name: 'DRYTREK_SE_PD', status: 'ACTIVE' }];
  assert.deepEqual(hittaAdset(adsets, 'DRYTREK_SE_Damasker Vandring - PD', 'PD'), { id: '2', name: 'DRYTREK_SE_PD', status: 'ACTIVE' });
  assert.equal(hittaAdset(adsets, 'DRYTREK_SE_Damasker Vandring - FO', 'FO'), null);
});
