// Bygger TankGuards svenska annonser i det befintliga kampanjskalet.
// Allt föds PAUSED. Idempotent: en annons som redan finns skapas inte igen.
import { säkerställProxy, api, alla, hittaEllerSkapaAdset, skapaAnnons, ingaEnhancements, logg } from '/home/user/yognftnfgn/tools/meta-lib.mjs';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
säkerställProxy();

// Uppladdade assets och byggresultat ligger i produktens output-mapp.
const S = '/home/user/yognftnfgn/factory/output/tankguard';
const ACT = '915422744950975';
const KAMPANJ = '120248995235740172';
const SIDA = '1399193996606775';
const LÄNK = 'https://tankguard.se/products/tankoverdraget';
const NYTT_KAMPANJNAMN = 'TANKGUARD_SE_Tanköverdraget | 2026-09-08';

const upplagt = JSON.parse(readFileSync(`${S}/media-uppladdat.json`, 'utf8'));

const PD = {
  message: 'Trött på grönt, algfyllt regnvatten? 💧\n\nDet här överdraget blockerar solljus och UV helt — så vattnet i din IBC-tank hålls klart, och tanken slits inte ut i förtid.\n\n✓ Kraftigt 210D Oxford-tyg\n✓ Enkelt blixtlås — klart på 2 minuter\n✓ Öppning upptill, du kommer åt locket ändå\n\nSkydda din tank idag 👇',
  title: 'Klart vatten. Ingen alg. Enkelt.',
  desc: 'Passar standard 1000L IBC-tank.',
};

const ANNONSER = [
  { kort: 'PD_Extra', adset: 'PD', ...PD },
  { kort: 'PD_2_1', adset: 'PD', ...PD },
  { kort: 'PD_3_1', adset: 'PD',
    message: '210D Oxford-tyget blockerar UV-ljus och håller borta alger. Blixtlåset går att sätta på under två minuter. Öppningen upptill ger åtkomst till locket utan att ta av hela överdraget.',
    title: 'Sätt på blixtlåset på 2 minuter', desc: '210D Oxford-tyg, blixtlås, öppning upptill' },
  { kort: 'PD_4_1', adset: 'PD',
    message: '210D Oxford-tyg stänger ute ljuset. Algerna kommer aldrig igång.',
    title: '210D Oxford-tyg. Ingen alg.', desc: 'Tar UV-strålningen i stället för plasten.' },
  { kort: 'PD_5_1', adset: 'PD',
    message: '210D Oxford-tyg mellan solen och ditt regnvatten.\nIngen presenning, inga gummiband — bara ett blixtlås.\nAlgerna kommer aldrig igång.',
    title: '210D Oxford-tyg mot solen', desc: 'Ingen presenning, inga gummiband.' },
  { kort: 'CO_1_1', adset: 'CO',
    message: 'Utan skydd blir tankvattnet grönt av alger. 210D Oxford-tyget blockerar solljuset helt och stoppar algtillväxten. Samma tank, olika resultat – skillnaden är överdraget.',
    title: '210D Oxford-tyg stoppar UV och alger', desc: 'IBC-tanköverdrag, 1000 L' },
  { kort: 'BOF_3_1', adset: 'BOF',
    message: 'Passar den på min tank? Måtten är 120 × 100 × 116 cm — standard för en 1000-literstank.',
    title: '120×100×116 cm, standard 1000L', desc: 'Blockerar solljuset – stoppar algtillväxten i tanken.' },
  { kort: 'BOF_4_1', adset: 'BOF',
    message: 'Blixtlås. Inte presenning och gummiband.\nPå och av med dragkedja — ingen kamp med väder eller vind.\nÖppning upptill. Passar 1000-liters IBC-tank.',
    title: 'Blixtlås. Inte presenning.', desc: 'Öppning upptill. Passar 1000-liters IBC.' },
  { kort: 'BOF_5_1', adset: 'BOF',
    message: 'Presenningen som skulle skydda blåser av vid första höststormen.\nEtt 210D Oxford-överdrag med blixtlås sitter kvar.\nSkydda tanken innan hösten.',
    title: 'Presenningen blåser av i höststormen', desc: '210D Oxford-överdrag med blixtlås.' },
  // GT-blocket skrevs om 2026-09-08: källans text var ett kundvittnesmål i första
  // person om en genomförd order, och TankGuard har sålt noll enheter.
  { kort: 'GT_2_1', adset: 'GT',
    message: 'Vet du någon som klagat på alger i sin IBC-tank i flera somrar? 🎁\n\nGe bort det här överdraget – utan att säga ett ord. Låt honom undra varför algerna slutat växa.\n\nOm några veckor står tanken ute hela vintern – oskyddad, om han inte får den här.\n\nBästa presenten är inte den finaste. Det är den som äntligen löser något han tjatat om i flera somrar.\n\nGe honom överdraget som stoppar algerna 👇',
    title: 'Presenten som stoppar algerna', desc: 'Ett överdrag. Inga nya alger.' },
];

const TORR = process.argv.includes('--dry');

// --- 0. Byt kampanjnamnet. Det gamla bar "BE-ROAS 1,62", ett tal som stämmer med
//        varken 1,46 (utan moms) eller 2,07 (med moms). Ett falskt tal i namnet
//        styr varje framtida skalningsrunda fel.
const kamp = await api(KAMPANJ, { params: { fields: 'id,name,status,daily_budget' } });
logg(`Kampanj: "${kamp.name}" [${kamp.status}] budget=${kamp.daily_budget}`);
if (kamp.name !== NYTT_KAMPANJNAMN) {
  if (TORR) logg(`  (torr) skulle döpa om till "${NYTT_KAMPANJNAMN}"`);
  else { await api(KAMPANJ, { form: { name: NYTT_KAMPANJNAMN } }); logg(`  ✏️  omdöpt till "${NYTT_KAMPANJNAMN}"`); }
}

// --- 1. Vilka annonser finns redan? (idempotens)
const befintliga = await alla(`${KAMPANJ}/ads`, { fields: 'id,name,status' }, 100);
const finns = new Set(befintliga.map((a) => a.name));
logg(`Kampanjen har ${befintliga.length} annonser sedan tidigare.`);

// --- 2. Adsets. PD/CS/SP/GT finns; BOF och CO klonas ur ett syskon.
const adsetCache = {};
async function adsetFor(vinkel) {
  if (adsetCache[vinkel]) return adsetCache[vinkel];
  const namn = `TANKGUARD_Tanköverdraget SE - ${vinkel}`;
  const r = await hittaEllerSkapaAdset({ kampanjId: KAMPANJ, act: ACT, namn, torr: TORR });
  logg(`  Adset ${vinkel}: ${r.adset.id} ${r.skapad ? '(NYSKAPAT, PAUSED)' : '(fanns)'}`);
  adsetCache[vinkel] = r;
  return r;
}

// --- 3. Annonserna. Allt PAUSED.
const resultat = existsSync(`${S}/byggt.json`) ? JSON.parse(readFileSync(`${S}/byggt.json`, 'utf8')) : {};
const enhancements = ingaEnhancements();

for (const a of ANNONSER) {
  const namn = `TankGuard_${a.kort}`;
  if (finns.has(namn) || resultat[namn]?.annonsId) { logg(`↩︎  ${namn} finns redan`); continue; }
  const media = upplagt[a.kort];
  if (!media?.klar) { logg(`⚠️  ${namn} — media saknas, hoppar över`); continue; }

  const { adset } = await adsetFor(a.adset);
  const cta = { type: 'SHOP_NOW', value: { link: LÄNK } };
  const spec = media.typ === 'video'
    ? { page_id: SIDA, video_data: { video_id: media.video_id, image_url: media.thumb, message: a.message, title: a.title, link_description: a.desc, call_to_action: cta } }
    : { page_id: SIDA, link_data: { image_hash: media.image_hash, link: LÄNK, message: a.message, name: a.title, description: a.desc, call_to_action: cta } };

  if (TORR) { logg(`(torr) skulle skapa ${namn} i adset ${a.adset}`); continue; }
  try {
    const r = await skapaAnnons({ act: ACT, adsetId: adset.id, namn, spec, enhancements });
    resultat[namn] = { ...r, adset: a.adset, adsetId: adset.id, typ: media.typ };
    logg(`✅ ${namn} → annons ${r.annonsId} (PAUSED) i ${a.adset}`);
  } catch (e) {
    resultat[namn] = { fel: e.message };
    logg(`❌ ${namn}: ${e.message.slice(0, 200)}`);
  }
  writeFileSync(`${S}/byggt.json`, JSON.stringify(resultat, null, 2));
}
writeFileSync(`${S}/byggt.json`, JSON.stringify(resultat, null, 2));
logg('\nKlart.');
