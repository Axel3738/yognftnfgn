// Meta-steget: skapar pixeln för en ny OPS-butik i det GEMENSAMMA
// annonskontot. Sidor kan inte skapas via API (Meta tog bort det) —
// sidan skapar VA:n själv i Business Manager (VA-checklistans steg 7).
//
//   node factory/meta-setup.mjs factory/produkter/<id>.yaml [--torr]
//
// Kräver env META_ACCESS_TOKEN — en systemanvändartoken från Business
// Manager med scopet ads_management. Samma token som rutinerna använder.
//
// ⚠️ Annonskontot är ALLTID MagiBorsten DK 915422744950975 (Axels beslut
// 2026-09-07/08): ETT gemensamt konto för alla OPS-butiker, svenska som
// norska. Det skapas inga nya konton och kontot döps aldrig om —
// kampanjnamn prefixas med brandet så datan går att skära per butik.
// Förväxla ALDRIG med MagiBorsten 1867947880635861 (Bäverbutiken).

import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';

const GRAPH = 'https://graph.facebook.com/v21.0';

// Gemensamma OPS-annonskontot — ändras aldrig (samma konstant i kontroll.mjs).
export const OPS_ANNONSKONTO = '915422744950975';

async function graph(sokvag, { metod = 'GET', form = null } = {}) {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error('Saknar META_ACCESS_TOKEN i miljön (factory/.env).');
  const url = new URL(`${GRAPH}${sokvag}`);
  const kropp = new URLSearchParams({ access_token: token, ...(form ?? {}) });
  const svar = await fetch(metod === 'GET' ? `${url}?${kropp}` : url, {
    method: metod,
    body: metod === 'GET' ? undefined : kropp,
  });
  const data = await svar.json().catch(() => ({}));
  if (!svar.ok || data.error) {
    throw new Error(`Meta ${metod} ${sokvag} → ${data.error?.message ?? svar.status} (kod ${data.error?.code ?? '?'})`);
  }
  return data;
}

// Företaget som äger OPS-kontot. Pixlarna bor här, inte på annonskontot.
export const OPS_BUSINESS = '1164852855167090'; // MagiBorsten

// ⚠️ Kontot kan bara ha EN pixel skapad via /act_<id>/adspixels. Den andra
// butiken i ordningen får "(#6200) A pixel already exists for this account"
// och står utan pixel (mätt 2026-09-09: HeimGuard och TankGuard hade redan
// var sin, DryTrek blev nekad). Rätt väg är att skapa pixeln på FÖRETAGET
// och sen dela den till annonskontot — då får varje OPS-butik en egen pixel
// i samma konto, vilket är hela poängen med brandprefixade kampanjer.
export async function skapaPixel(adAccountId, namn, businessId = OPS_BUSINESS) {
  let pixel;
  try {
    pixel = await graph(`/act_${adAccountId}/adspixels`, { metod: 'POST', form: { name: namn } });
  } catch (e) {
    if (!/6200|already exists/i.test(e.message)) throw e;
    pixel = await graph(`/${businessId}/adspixels`, { metod: 'POST', form: { name: namn } });
    await graph(`/${pixel.id}/shared_accounts`, {
      metod: 'POST',
      form: { account_id: adAccountId, business: businessId },
    });
  }
  return pixel;
}

// Läser pixlarna kontot når, så en körning kan se om brandet redan har en.
export async function hamtaPixlar(adAccountId) {
  // fields=name måste anges explicit — utan den svarar Graph bara { id } och
  // namnkollen blir "null" på varje pixel (mätt 2026-09-09).
  const svar = await graph(`/act_${adAccountId}/adspixels`, {});
  const ut = [];
  for (const p of svar.data ?? []) {
    const detalj = await graph(`/${p.id}`, { form: { fields: 'id,name' } });
    ut.push({ id: p.id, namn: detalj.name ?? null });
  }
  return ut;
}

async function huvud() {
  laddaEnv();
  const arg = process.argv.slice(2);
  const produktfil = arg.find((a) => !a.startsWith('--'));
  const torr = arg.includes('--torr') || arg.includes('--dry');
  if (!produktfil) {
    console.error('Användning: node factory/meta-setup.mjs factory/produkter/<id>.yaml [--torr]');
    process.exit(1);
  }
  const p = lasYaml(readFileSync(produktfil, 'utf8'));
  const brand = p?.brand?.namn ?? p?.produkt?.namn;

  // Spärr: produktfilen får aldrig peka på ett annat konto än det gemensamma.
  const kontoIFil = p?.meta?.ad_account_id || null;
  if (kontoIFil && String(kontoIFil) !== OPS_ANNONSKONTO) {
    throw new Error(
      `Produktfilens ad_account_id (${kontoIFil}) är inte OPS-kontot ${OPS_ANNONSKONTO} — stoppar. Fel konto kostar riktiga pengar.`
    );
  }

  console.log(`\nMeta-setup för ${brand}:`);
  console.log(`  Pixel "${brand}" i det gemensamma OPS-kontot MagiBorsten DK (${OPS_ANNONSKONTO})`);
  console.log('  (Sidan skapar VA:n i Business Manager — API:t kan inte.)');
  if (torr) { console.log('\n(torrkörning — inget skapades)'); return; }

  // Har brandet redan en pixel återanvänds den — annars får varje körning en
  // ny pixel med samma namn och ingen vet vilken som är den riktiga.
  const befintliga = await hamtaPixlar(OPS_ANNONSKONTO);
  const redan = befintliga.find((p) => (p.namn ?? '').toLowerCase() === String(brand).toLowerCase());
  const pixel = redan ?? (await skapaPixel(OPS_ANNONSKONTO, brand));
  console.log(
    `${redan ? '⏭  Pixel fanns redan' : '✅ Pixel skapad'}: ${pixel.id} ("${brand}")`
  );
  console.log(`   Andra pixlar i kontot: ${befintliga.filter((p) => p.id !== pixel.id).map((p) => `${p.namn} ${p.id}`).join(', ') || '(inga)'}`);
  console.log('   ⚠️ Bäverbutiken.se-pixeln finns i samma konto — ta ALDRIG den.');

  // Skriv tillbaka till produktfilen så inget hamnar bara i chatten.
  let text = readFileSync(produktfil, 'utf8');
  text = text.replace(/ad_account_id: ".*"/, `ad_account_id: "${OPS_ANNONSKONTO}"`);
  text = text.replace(/pixel_id: ".*"/, `pixel_id: "${pixel.id}"`);
  writeFileSync(produktfil, text);
  console.log('✅ Produktfilen uppdaterad med id:na.');
  console.log('\n🖐 Kvar för hand: VA:n skapar sidan i Business Manager + klistrar pixel-id:t i WeTracked.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
