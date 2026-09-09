// Bygger de ELVA svenska bildannonser som saknades i räkningen.
// Hämtar media ur källkontot, laddar upp i målkontot, skapar annonsen PAUSED.
import { säkerställProxy, api, alla, laddaUppBild, hittaEllerSkapaAdset, skapaAnnons, ingaEnhancements, logg } from '/home/user/yognftnfgn/tools/meta-lib.mjs';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
säkerställProxy();

const S = '/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad';
const KÄLLA = '1867947880635861';
const ACT = '915422744950975';
const KAMPANJ = '120248995235740172';
const SIDA = '1399193996606775';
const LÄNK = 'https://tankguard.se/products/tankoverdraget';
const MAPP = `${S}/media2`;
if (!existsSync(MAPP)) mkdirSync(MAPP, { recursive: true });

const CS = {
  message: '⏰ FROSTEN ÄR PÅ VÄG — SKYDDA TANKEN NU\n\n489 kr för ett skyddande överdrag till din IBC-tank.\n\nVill du skydda fler tankar? 2 st för 799 kr – spara 18 %. Dessutom 2 kranskydd Frost 420D på köpet, värde 398 kr.\n\nInga alger. Inget spröd plast. Bara ett tjockt, skyddande överdrag till din IBC-tank.\n\nBeställ innan frosten kommer 👇',
  title: 'Skydda tanken innan frosten kommer',
  desc: '489 kr. 2 st för 799 kr – spara 18 %.',
};

const ANNONSER = [
  { kort: 'BOF_1_1', adset: 'BOF',
    message: '489 kr. Tyget är 210D Oxford och tar UV-strålningen i stället för plasten.',
    title: 'Tanköverdraget för 489 kr',
    desc: 'Sitter på under 2 minuter. Köp 2 för 799 kr – spara 18 %.' },
  { kort: 'BOF_2_1', adset: 'BOF',
    message: 'Osäker på om den passar din tank? Måtten är 120 × 100 × 116 cm, gjorda för standard 1000-liters IBC-tank. Materialet är 210D Oxford-tyg och håller plasten hel genom vintern.',
    title: 'Passar standard IBC-tank',
    desc: '210D Oxford-tyg, byggt för 1000L-tank.' },
  { kort: 'BOF_6_1', adset: 'BOF',
    message: 'Frosten är på väg – tanken står ute hela vintern.\nBeställ nu så är skyddet på plats innan kylan sätter in.\n210D Oxford-tyg håller plasten hel genom hela vintern.',
    title: 'Frosten kommer, beställ i tid',
    desc: 'Beställ i tid. Skyddet håller hela vintern.' },
  { kort: 'CS_2_1', adset: 'CS', ...CS },
  { kort: 'CS_3_1', adset: 'CS',
    message: '489 kr per överdrag, eller 3 för 1 099 kr. Tyget är 210D Oxford och stänger ute ljuset — algerna kommer aldrig igång. Köp 3, få 3 kranskydd på köpet — värde 597 kr.',
    title: 'Köp 3, få 3 kranskydd gratis — 210D Oxford-tyg',
    desc: 'Sitter på under två minuter.' },
  { kort: 'CS_4_1', adset: 'CS',
    message: '489 kr.\nSamma 210D Oxford-tyg som stänger ute ljuset.\nAlgerna kommer aldrig igång.',
    title: '489 kr för tyget som stoppar algerna',
    desc: '489 kr. 2 st för 799 kr – spara 18 %.' },
  { kort: 'RV_1_1', adset: 'RV',
    message: 'Blockerar solljuset på tanken – och ger den ett snyggare utseende.',
    title: 'Blockerar solljuset', desc: '210D Oxford-tyg. 489 kr.' },
  { kort: 'RV_2_1', adset: 'RV',
    message: 'Öppning upptill gör det enkelt att komma åt locket när du behöver.',
    title: 'Enkel åtkomst till locket', desc: 'Passar 1000L-tank. 489 kr.' },
  { kort: 'RV_3_1', adset: 'RV',
    message: 'Sitter på tanken på under två minuter och blockerar solen.',
    title: 'Skyddar mot solen', desc: '489 kr.' },
  { kort: 'RV_4_1', adset: 'RV',
    message: '210D Oxford-tyg och enkelt att sätta på – passar standard 1000-liters IBC-tank.',
    title: 'På tanken på under 2 minuter', desc: 'Passar standard 1000L IBC-tank.' },
  { kort: 'SP_2_1', adset: 'SP',
    message: 'Äntligen klart vatten i tanken — inga alger på hela sommaren! 🛡️\n\nSkyddet stoppar algtillväxten i vattnet innan den ens hinner börja.\n\n✓ Blockerar UV och sol helt\n✓ Sitter perfekt med blixtlås\n✓ Du kommer fortfarande åt locket\n\nSe hela skyddet här 👇',
    title: 'Klart vatten hela sommaren', desc: 'Blockerar UV, sol och alger i vattnet.' },
];

const TORR = process.argv.includes('--dry');

// 1. Hashar och URL:er ur källkontot
const kalla = JSON.parse(readFileSync(`${S}/kalla-SE.json`, 'utf8'));
const källAds = Object.fromEntries(kalla.ads.map(a => [a.name, a]));
const hashar = [];
for (const a of ANNONSER) {
  const k = källAds[`IBC_${a.kort}`];
  const h = k?.creative?.object_story_spec?.link_data?.image_hash;
  if (!h) { logg(`⚠️  ${a.kort}: ingen image_hash i källan`); continue; }
  a.källHash = h; hashar.push(h);
}
const bilder = await alla(`act_${KÄLLA}/adimages`, { hashes: JSON.stringify([...new Set(hashar)]), fields: 'hash,url' }, 50);
const urlPerHash = Object.fromEntries(bilder.map(b => [b.hash, b.url]));
logg(`Löste ${bilder.length} av ${new Set(hashar).size} bildhashar ur källkontot.`);

// 2. Ladda ner + ladda upp i målkontot
const upp = existsSync(`${S}/upplagt2.json`) ? JSON.parse(readFileSync(`${S}/upplagt2.json`, 'utf8')) : {};
for (const a of ANNONSER) {
  if (upp[a.kort]?.hash) continue;
  const url = urlPerHash[a.källHash];
  if (!url) { logg(`⚠️  ${a.kort}: ingen URL`); continue; }
  const fil = `${MAPP}/${a.kort}.jpg`;
  if (!existsSync(fil)) {
    const r = await fetch(url);
    if (!r.ok) { logg(`❌ ${a.kort}: nedladdning ${r.status}`); continue; }
    writeFileSync(fil, Buffer.from(await r.arrayBuffer()));
  }
  if (TORR) { logg(`(torr) skulle ladda upp ${a.kort}`); continue; }
  try { upp[a.kort] = { hash: await laddaUppBild(ACT, fil) }; logg(`⬆  ${a.kort} → ${upp[a.kort].hash}`); }
  catch (e) { logg(`❌ ${a.kort} uppladdning: ${e.message.slice(0, 140)}`); }
  writeFileSync(`${S}/upplagt2.json`, JSON.stringify(upp, null, 2));
}

// 3. Bygg annonserna
const befintliga = await alla(`${KAMPANJ}/ads`, { fields: 'id,name' }, 100);
const finns = new Set(befintliga.map(a => a.name));
logg(`Kampanjen har ${befintliga.length} annonser sedan tidigare.`);

const adsetCache = {};
async function adsetFor(v) {
  if (adsetCache[v]) return adsetCache[v];
  const r = await hittaEllerSkapaAdset({ kampanjId: KAMPANJ, act: ACT, namn: `TANKGUARD_Tanköverdraget SE - ${v}`, torr: TORR });
  logg(`  Adset ${v}: ${r.adset.id} ${r.skapad ? '(NYSKAPAT, PAUSED)' : '(fanns)'}`);
  adsetCache[v] = r; return r;
}

const resultat = existsSync(`${S}/byggt2.json`) ? JSON.parse(readFileSync(`${S}/byggt2.json`, 'utf8')) : {};
const enhancements = ingaEnhancements();
for (const a of ANNONSER) {
  const namn = `TankGuard_${a.kort}`;
  if (finns.has(namn) || resultat[namn]?.annonsId) { logg(`↩︎  ${namn} finns redan`); continue; }
  const media = upp[a.kort];
  if (!media?.hash) { logg(`⚠️  ${namn}: media saknas`); continue; }
  const { adset } = await adsetFor(a.adset);
  const spec = { page_id: SIDA, link_data: { image_hash: media.hash, link: LÄNK, message: a.message, name: a.title, description: a.desc, call_to_action: { type: 'SHOP_NOW', value: { link: LÄNK } } } };
  if (TORR) { logg(`(torr) skulle skapa ${namn} i ${a.adset}`); continue; }
  try {
    const r = await skapaAnnons({ act: ACT, adsetId: adset.id, namn, spec, enhancements });
    resultat[namn] = { ...r, adset: a.adset };
    logg(`✅ ${namn} → annons ${r.annonsId} (PAUSED) i ${a.adset}`);
  } catch (e) { resultat[namn] = { fel: e.message }; logg(`❌ ${namn}: ${e.message.slice(0, 180)}`); }
  writeFileSync(`${S}/byggt2.json`, JSON.stringify(resultat, null, 2));
}
logg('\nKlart med de elva.');
