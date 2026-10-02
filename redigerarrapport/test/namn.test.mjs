// Ren logik i redigerarrapport/namn.mjs — inga nätanrop, ingen env. Exemplen är de
// riktiga namnen ur kontona (mätta 2026-10-02), tabellerna läses ur repot.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import {
  MARKNADSKODER, delaNamn, skalaMarknad, marknadUrKampanj, lasSpeglingar, spegelKalla,
  lasNoPrefix, noPrefixKalla, urLogg, hubbnamnUrKalla, kallnamn, byggRadindex, matchaRad,
} from '../namn.mjs';
import { spegelnamn, SPEGEL_OFFSET } from '../../tools/ops-spegla.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const las = (p) => readFileSync(join(ROT, p), 'utf8');
const json = (p) => JSON.parse(las(p));

const register = json('factory/produkter/register.json');
const produkter = { takskyddet: las('factory/produkter/takskyddet.yaml'), termoskyddet: las('factory/produkter/termoskyddet.yaml') };
const speglingar = lasSpeglingar({ register, produkter });
const noPrefix = lasNoPrefix(json('redigerarrapport/no-prefix.json'));
const logg = las('matstrumpor/logg.jsonl').split('\n').filter(Boolean).map((r) => JSON.parse(r));
const { uppladdade, omdopta } = urLogg(logg);
const allt = { speglingar, noPrefix, uppladdade, omdopta };

// ------------------------------------------------------------ delar och marknad

test('delaNamn: prefix, koncept, nummer, variant — och null när mönstret inte håller', () => {
  assert.deepEqual(delaNamn('CaraShellRoof_PD_106_H1'), { prefix: 'CaraShellRoof', koncept: 'PD', nummer: 106, variant: 'H1' });
  assert.deepEqual(delaNamn('Takoverdrag_PD_6'), { prefix: 'Takoverdrag', koncept: 'PD', nummer: 6, variant: null });
  assert.deepEqual(delaNamn('Takoverdrag_BOF_3_1'), { prefix: 'Takoverdrag', koncept: 'BOF', nummer: 3, variant: '1' });
  assert.equal(delaNamn('MATSTRUMP_sushi_jul_ugc_044h1_v1').koncept, null);
  assert.equal(delaNamn('09-17 Nathalie captions musik').koncept, null);
});

test('skalaMarknad: koden på plats två, först eller sist stryks; en vinkelkod som heter som ett land stryks aldrig', () => {
  assert.deepEqual(skalaMarknad('CaraShellRoof_NO_PD_106_H1'), { marknad: 'NO', bas: 'CaraShellRoof_PD_106_H1', plats: 'tva' });
  assert.deepEqual(skalaMarknad('Takoverdrag_US_PD_4_1'), { marknad: 'US', bas: 'Takoverdrag_PD_4_1', plats: 'tva' });
  assert.deepEqual(skalaMarknad('NO_Trimmerbelt_PD_3_H1'), { marknad: 'NO', bas: 'Trimmerbelt_PD_3_H1', plats: 'forst' });
  assert.deepEqual(skalaMarknad('Fiskespöhållare_SO_2_1_NO'), { marknad: 'NO', bas: 'Fiskespöhållare_SO_2_1', plats: 'sist' });
  // AU är en vinkel i Overvakningskamera_AU_2_H1 (SE-kontot) — resten vore "Overvakningskamera_2_H1"
  assert.deepEqual(skalaMarknad('Overvakningskamera_AU_2_H1'), { marknad: null, bas: 'Overvakningskamera_AU_2_H1', plats: null });
  assert.deepEqual(skalaMarknad('Overvåkingskamera_NO_AU_2_H1'), { marknad: 'NO', bas: 'Overvåkingskamera_AU_2_H1', plats: 'tva' });
  // DE är Demo, aldrig Tyskland
  assert.ok(!MARKNADSKODER.includes('DE'));
  assert.equal(skalaMarknad('Takoverdrag_DE_1_H1').marknad, null);
  assert.equal(skalaMarknad('Takoverdrag_PD_6_H1').marknad, null);
});

test('marknadUrKampanj: koden som eget ord i kampanjnamnet, aldrig ur "USA" eller "SE"', () => {
  assert.equal(marknadUrKampanj('Takovertrekk Campingvogn NO | BE-ROAS 1,62 | 2026-09-11'), 'NO');
  assert.equal(marknadUrKampanj('CARASHELL_NO_Takovertrekket | BE-ROAS 1,51 | 2026-09-11'), 'NO');
  assert.equal(marknadUrKampanj('1 CARASHELL_US_Taköverdrag Husvagn & Husbil 6,5 × 3 m – kopia'), 'US');
  assert.equal(marknadUrKampanj('CARASHELL_SE_Taköverdraget | BE-ROAS 1,51'), null);
  assert.equal(marknadUrKampanj('Taköverdrag 5 reasons USA TEST'), null);
});

// ------------------------------------------------------------ speglar

test('lasSpeglingar: registrets spegling + produktfilens creative_prefix/annonsprefix', () => {
  assert.deepEqual(speglingar, { CaraShellRoof: 'Takoverdrag', CaraShellFront: 'Termoskydd' });
  // utan yaml inget prefix — aldrig gissat
  assert.deepEqual(lasSpeglingar({ register, produkter: {} }), {});
});

test('spegelKalla: nummer + 100 tillbaka till Bäver-källan, bara över offset, bara speglade prefix', () => {
  assert.equal(SPEGEL_OFFSET, 100);
  assert.equal(spegelKalla('CaraShellRoof_PD_106_H1', speglingar), 'Takoverdrag_PD_6_H1');
  assert.equal(spegelKalla('CaraShellRoof_BOF_103_1', speglingar), 'Takoverdrag_BOF_3_1');
  assert.equal(spegelKalla('CaraShellFront_CS_106_1', speglingar), 'Termoskydd_CS_6_1');
  assert.equal(spegelKalla('CaraShellRoof_PD_4_1', speglingar), null, 'butikens egen annons under 100');
  assert.equal(spegelKalla('Takoverdrag_PD_6_H1', speglingar), null, 'källan speglas inte vidare');
  for (const x of ['Takoverdrag_BOF_3_1', 'Takoverdrag_GT_5_H1', 'Termoskydd_CS_6_1']) {
    const p = x.startsWith('Termoskydd') ? 'CaraShellFront' : 'CaraShellRoof';
    assert.equal(spegelKalla(spegelnamn(x, p), speglingar), x, 'rundtur med tools/ops-spegla.mjs');
  }
});

// ------------------------------------------------------------ NO-prefix

test('no-prefix.json: varje rad med SE-prefix bär minst en namngiven källa, aldrig bara suffix; okänt är null', () => {
  const fil = json('redigerarrapport/no-prefix.json');
  const rader = Object.entries(fil.prefix);
  assert.ok(rader.length >= 40, `tabellen har ${rader.length} rader`);
  for (const [no, r] of rader) {
    if (r.se_prefix) {
      assert.ok(r.belagg?.[r.se_prefix]?.kallor?.length >= 1, `${no} → ${r.se_prefix} utan källa`);
      for (const alt of r.alternativ ?? []) assert.ok(r.belagg?.[alt]?.kallor?.length >= 1, `${no} alternativ ${alt} utan källa`);
    } else {
      assert.ok(r.varfor_null, `${no} är null utan skäl`);
      assert.equal(Object.keys(r.belagg ?? {}).length, 0);
    }
  }
  assert.equal(fil.prefix.Gamasjer.se_prefix, 'Damasker');
  assert.equal(fil.prefix.Takovertrekk.se_prefix, 'Takoverdrag');
  assert.deepEqual([fil.prefix.Beltesliper.se_prefix, ...fil.prefix.Beltesliper.alternativ], ['Beltgrinder', 'Balteslipmaskin']);
  assert.equal(fil.prefix.Jetvifte.se_prefix, null);
});

test('noPrefixKalla: SE-namnen ur tabellen, flera när produkten har flera SE-prefix, inget vid okänt eller samma prefix', () => {
  assert.deepEqual(noPrefixKalla('Gamasjer_SP_1', noPrefix), { kandidater: ['Damasker_SP_1'], kand: true, okand: false });
  assert.deepEqual(noPrefixKalla('Beltesliper_PD_4_H1', noPrefix).kandidater, ['Beltgrinder_PD_4_H1', 'Balteslipmaskin_PD_4_H1']);
  assert.deepEqual(noPrefixKalla('Jetvifte_SP_1', noPrefix), { kandidater: [], kand: true, okand: true });
  assert.deepEqual(noPrefixKalla('Vedklyvborr_SP_1_H3', noPrefix).kandidater, [], 'samma prefix i båda kontona');
  assert.deepEqual(noPrefixKalla('Takoverdrag_PD_6_H1', noPrefix), { kandidater: [], kand: false });
  assert.deepEqual(noPrefixKalla('gamasjer_SP_1', noPrefix).kandidater, ['Damasker_SP_1'], 'skiftläge spelar ingen roll');
});

// ------------------------------------------------------------ Matstrumpor

test('urLogg + hubbnamnUrKalla: UPPLADDAD ger arbetsnamnet ur Drive-filen, OMDOPT ger fran/till', () => {
  assert.equal(uppladdade.length, 11, 'elva UPPLADDAD-rader 2026-09-21');
  assert.equal(omdopta.length, 5, 'fem OMDOPT-rader 2026-09-27');
  assert.deepEqual(hubbnamnUrKalla('Drive 022_H1.mov'), { namn: '022', variant: 'H1' });
  assert.deepEqual(hubbnamnUrKalla('Drive 024_V1.mov'), { namn: '024', variant: 'V1' });
  assert.deepEqual(hubbnamnUrKalla('Drive 012 v2_H1.mov'), { namn: '012 v2', variant: 'H1' });
  assert.equal(hubbnamnUrKalla('Notion'), null);
  assert.equal(hubbnamnUrKalla(null), null);
});

// ------------------------------------------------------------ kallnamn

test('kallnamn (a): marknadskoden stryks, kampanjen eller kontot ger marknaden när namnet inte gör det', () => {
  const r = kallnamn('Takoverdrag_US_PD_4_1', allt);
  assert.deepEqual(r.kandidater, ['Takoverdrag_US_PD_4_1', 'Takoverdrag_PD_4_1', 'Takoverdrag_PD_4']);
  assert.equal(r.via, 'marknad'); assert.equal(r.marknad, 'US');
  assert.deepEqual(kallnamn('NO_Trimmerbelt_PD_3_H1 – kopia', allt).kandidater, ['NO_Trimmerbelt_PD_3_H1', 'Trimmerbelt_PD_3_H1', 'Trimmerbelt_PD_3']);
  assert.deepEqual(kallnamn('Fiskespöhållare_SO_2_1_NO', allt).kandidater.slice(0, 2), ['Fiskespöhållare_SO_2_1_NO', 'Fiskespöhållare_SO_2_1']);
  const d = kallnamn('Takoverdrag_PD_6_H1', { ...allt, kampanj: 'Taköverdraget för Husvagn 6,5 × 3 m | BE ROAS 1.63' });
  assert.deepEqual(d.kandidater, ['Takoverdrag_PD_6_H1', 'Takoverdrag_PD_6']);
  assert.equal(d.via, 'direkt'); assert.equal(d.marknad, null);
  assert.equal(kallnamn('CaraShellRoof_PD_4_1', { ...allt, kampanj: 'CARASHELL_NO_Takovertrekket | BE-ROAS 1,51' }).marknad, 'NO');
  assert.equal(kallnamn('NO_SP_1_H1', { ...allt, konto: '1050941584152547' }).marknad, 'NO');
  assert.equal(kallnamn('Overvakningskamera_AU_2_H1', allt).via, 'direkt', 'AU är en vinkel i SE-kontot');
});

test('kallnamn (b): speglar löses till Bäver-källan, också efter marknadskoden; egna annonser under 100 rörs inte', () => {
  const r = kallnamn('CaraShellRoof_NO_PD_106_H1', { ...allt, konto: '915422744950975' });
  assert.deepEqual(r.kandidater, ['CaraShellRoof_NO_PD_106_H1', 'Takoverdrag_PD_6_H1', 'CaraShellRoof_PD_106_H1', 'Takoverdrag_PD_6', 'CaraShellRoof_PD_106']);
  assert.equal(r.via, 'spegel'); assert.equal(r.marknad, 'NO'); assert.deepEqual(r.steg, ['marknad', 'spegel']);
  assert.deepEqual(kallnamn('CaraShellRoof_PD_106_H1', allt).kandidater, ['CaraShellRoof_PD_106_H1', 'Takoverdrag_PD_6_H1', 'CaraShellRoof_PD_106', 'Takoverdrag_PD_6']);
  assert.equal(kallnamn('CaraShellRoof_DK_GT_105_H1', allt).kandidater[1], 'Takoverdrag_GT_5_H1');
  assert.equal(kallnamn('CaraShellRoof_US_CS_110_1', allt).kandidater[1], 'Takoverdrag_CS_10_1');
  assert.equal(kallnamn('CaraShellFront_NO_CS_106_1', allt).kandidater[1], 'Termoskydd_CS_6_1');
  const egen = kallnamn('CaraShellRoof_PD_4_1', allt);
  assert.deepEqual(egen.kandidater, ['CaraShellRoof_PD_4_1', 'CaraShellRoof_PD_4']); assert.equal(egen.via, 'direkt');
  assert.equal(kallnamn('CaraShellRoof_NO_PD_106_H1', { ...allt, speglingar: {} }).via, 'marknad', 'utan speglingstabell ingen spegel');
});

test('kallnamn (c): NO-prefixet byts mot SE-prefixet ur tabellen; okänt prefix ger inga gissade namn men flaggas', () => {
  const r = kallnamn('Gamasjer_NO_SP_1', { ...allt, konto: '1050941584152547', kampanj: 'Gamasjer NO | BE-ROAS 1,64' });
  assert.deepEqual(r.kandidater, ['Gamasjer_NO_SP_1', 'Damasker_SP_1', 'Gamasjer_SP_1']);
  assert.equal(r.via, 'no-prefix'); assert.equal(r.marknad, 'NO'); assert.equal(r.okandNoPrefix, false);
  const b = kallnamn('Beltesliper_NO_PD_4_H1', allt);
  assert.deepEqual(b.kandidater, ['Beltesliper_NO_PD_4_H1', 'Beltgrinder_PD_4_H1', 'Balteslipmaskin_PD_4_H1', 'Beltesliper_PD_4_H1', 'Beltgrinder_PD_4', 'Balteslipmaskin_PD_4', 'Beltesliper_PD_4']);
  assert.equal(kallnamn('Takovertrekk_NO_BOF_7_1', allt).kandidater[1], 'Takoverdrag_BOF_7_1');
  assert.equal(kallnamn('Overvåkingskamera_NO_AU_2_H1', allt).kandidater[1], 'Overvakningskamera_AU_2_H1');
  const j = kallnamn('Jetvifte_NO_SP_1', allt);
  assert.deepEqual(j.kandidater, ['Jetvifte_NO_SP_1', 'Jetvifte_SP_1']);
  assert.equal(j.via, 'marknad'); assert.equal(j.okandNoPrefix, true);
  const samma = kallnamn('Vedklyvborr_NO_SP_1_H3', allt);
  assert.deepEqual(samma.kandidater, ['Vedklyvborr_NO_SP_1_H3', 'Vedklyvborr_SP_1_H3', 'Vedklyvborr_SP_1']);
  assert.equal(samma.via, 'marknad');
});

test('kallnamn (d): Matstrumpor via UPPLADDAD (Drive 022_H1 ⇒ 022) och OMDOPT (048 ↔ 054); utan loggrad bara namnet självt', () => {
  const r = kallnamn('MATSTRUMP_sushi_jul_ugc_044h1_v1', { ...allt, konto: '730973156224390' });
  assert.deepEqual(r.kandidater, ['MATSTRUMP_sushi_jul_ugc_044h1_v1', '022_H1', '022']);
  assert.equal(r.via, 'uppladdad'); assert.equal(r.marknad, null);
  assert.deepEqual(kallnamn('MATSTRUMP_sushi_gift_ugc_045h3_v1', allt).kandidater, ['MATSTRUMP_sushi_gift_ugc_045h3_v1', '023_H3', '023']);
  assert.deepEqual(kallnamn('MATSTRUMP_sushi_jul_ugc_046v2_v1', allt).kandidater, ['MATSTRUMP_sushi_jul_ugc_046v2_v1', '024_V2', '024']);
  const om = kallnamn('MATSTRUMP_sushi_gift_ugc_054_v1', allt);
  assert.deepEqual(om.kandidater, ['MATSTRUMP_sushi_gift_ugc_054_v1', 'MATSTRUMP_sushi_gift_ugc_048_v1']); assert.equal(om.via, 'omdopt');
  assert.deepEqual(kallnamn('MATSTRUMP_sushi_gift_ugc_048_v1', allt).kandidater, ['MATSTRUMP_sushi_gift_ugc_048_v1', 'MATSTRUMP_sushi_gift_ugc_054_v1']);
  for (const n of ['MATSTRUMP_sushi_gift_ugc_haikuh3_v1', '09-17 Nathalie captions musik', 'MATSTRUMP_sushi_offer_static_d3_v1']) {
    const u = kallnamn(n, allt);
    assert.deepEqual(u.kandidater, [n], `${n}: ingen loggrad ⇒ ingen gissning`); assert.equal(u.via, 'direkt');
  }
  assert.deepEqual(kallnamn('MATSTRUMP_sushi_jul_ugc_044h1_v1', { ...allt, uppladdade: [] }).kandidater, ['MATSTRUMP_sushi_jul_ugc_044h1_v1']);
});

// ------------------------------------------------------------ matchaRad

const GILZ = '1a4d872b-594c-81d8-adf3-0002a95f9e7f', CARL = '24ed872b-594c-8102-b94d-0002bde1d55a';
const hubbar = [
  { namn: 'BÄVER Taköverdraget för Husvagn', rader: [
    { namn: 'Takoverdrag_PD_6_H1 – VIDEO: taket du aldrig ser', ansvariga: [CARL], status: 'Approved' },
    { namn: 'Takoverdrag_GT_5_H1', ansvariga: [], status: 'Approved' },
    { namn: 'Takoverdrag_PD_6', ansvariga: [CARL], status: 'Draft' },
    { namn: 'Takoverdrag_PD_6_H1 to norwegian', ansvariga: [GILZ], status: 'Approved' },
  ] },
  { namn: 'Carashell Taköverdrag creative hub', rader: [{ namn: 'CaraShellRoof_PD_106_H1', ansvariga: [], status: 'SE-ACTIVE to be translated' }] },
  { namn: 'Matstrumpor creative hub', rader: [{ namn: '022', ansvariga: [GILZ], status: 'Approved + Launched in SE' }, { namn: '023', ansvariga: [GILZ] }] },
  { namn: 'Creative Hub master', rader: [{ namn: '235', ansvariga: [CARL] }] },
];

test('matchaRad: första kandidaten med rad vinner; bland dubbletter en med Ansvarig som inte är översättning', () => {
  const r = kallnamn('CaraShellRoof_NO_PD_106_H1', allt);
  const t = matchaRad(r.kandidater, hubbar);
  // direkt finns inte, spegelkällan finns (med Ansvarig) före den speglade raden utan Ansvarig
  assert.equal(t.kandidat, 'Takoverdrag_PD_6_H1'); assert.equal(t.steg, 1); assert.equal(t.pa, 'exakt');
  assert.deepEqual(t.rad.ansvariga, [CARL]); assert.equal(t.rad.hubb, 'BÄVER Taköverdraget för Husvagn');
  assert.equal(matchaRad(['Takoverdrag_PD_6_H1'], hubbar).rad.namn, 'Takoverdrag_PD_6_H1 – VIDEO: taket du aldrig ser', 'översättningsraden väljs aldrig före originalet');
  const u = matchaRad(kallnamn('CaraShellRoof_GT_105_H1', allt).kandidater, hubbar);
  assert.equal(u.kandidat, 'Takoverdrag_GT_5_H1'); assert.deepEqual(u.rad.ansvariga, [], 'raden finns men utan Ansvarig — det är anroparens dom');
  assert.equal(matchaRad(kallnamn('CaraShellRoof_PD_106_H1', allt).kandidater, [hubbar[1]]).rad.namn, 'CaraShellRoof_PD_106_H1');
  assert.equal(matchaRad(['Takoverdrag_PD_9_H1', 'Takoverdrag_PD_9'], hubbar), null);
  assert.equal(matchaRad([], hubbar), null);
});

test('matchaRad: löpnumret bara för kandidater som börjar med siffror — ett prefixnamn matchar aldrig på nummer', () => {
  const r = kallnamn('MATSTRUMP_sushi_jul_ugc_044h1_v1', allt);
  const t = matchaRad(r.kandidater, hubbar);
  // '022_H1' har ingen rad (och inget löpnummer: understrecket är ett ordtecken), '022' matchar exakt
  assert.equal(t.rad.namn, '022'); assert.deepEqual(t.rad.ansvariga, [GILZ]); assert.equal(t.kandidat, '022'); assert.equal(t.pa, 'exakt');
  assert.equal(matchaRad(['022 H1'], hubbar).pa, 'nummer', '"022 H1" (Grillklinikens form) tar raden 022 på löpnumret');
  assert.equal(matchaRad(['235 H1'], hubbar).rad.namn, '235', 'Grillklinikens "235 H1" → raden 235');
  assert.equal(matchaRad(['Takoverdrag_PD_6_H9'], hubbar), null, 'inget löpnummer i ett prefixnamn');
  const idx = byggRadindex(hubbar);
  assert.equal(matchaRad(['023'], idx).rad.namn, '023', 'ett färdigt index går att skicka in');
  assert.equal(matchaRad(['023'], hubbar[2].rader).rad.namn, '023', 'en platt radlista också');
});
