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

export async function skapaPixel(adAccountId, namn) {
  return graph(`/act_${adAccountId}/adspixels`, { metod: 'POST', form: { name: namn } });
}

// Conversions API-tokenen (WeTracked) kan INTE skapas via API:t utan appens
// hemlighet: POST /<systemanvändare>/access_tokens kräver appsecret_proof
// (mätt på TankGuard 2026-09-08, kod 100). Den knappen sitter i Events
// Manager (Data sources → pixeln → Settings → Conversions API → Generate
// access token) och trycks av VA:n — tokenen ska aldrig passera chatten.
// Det fabriken KAN göra är att ge företagets befintliga "Conversions API
// System User" tillgång till den nya pixeln, så knappen fungerar direkt.
export async function tilldelaCapiAnvandare(pixelId) {
  const pixel = await graph(`/${pixelId}`, { form: { fields: 'owner_business' } });
  const business = pixel.owner_business?.id;
  if (!business) return { tilldelad: false, varfor: 'pixeln saknar owner_business' };
  const su = await graph(`/${business}/system_users`, { form: { fields: 'id,name,role' } });
  const capi = (su.data ?? []).find((u) => /conversions api/i.test(u.name ?? ''));
  if (!capi) return { tilldelad: false, varfor: `ingen "Conversions API System User" i företag ${business} — VA:n skapar tokenen i Events Manager (Meta skapar användaren då)` };
  await graph(`/${pixelId}/assigned_users`, { metod: 'POST', form: { user: capi.id, tasks: '["ADVERTISE","ANALYZE"]', business } });
  return { tilldelad: true, anvandare: capi.name, business };
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

  const pixel = await skapaPixel(OPS_ANNONSKONTO, brand);
  console.log(`✅ Pixel skapad: ${pixel.id}`);
  const capi = await tilldelaCapiAnvandare(pixel.id).catch((e) => ({ tilldelad: false, varfor: e.message }));
  console.log(capi.tilldelad
    ? `✅ "${capi.anvandare}" har pixeln — Generate access token i Events Manager fungerar direkt.`
    : `⚠️  CAPI-användaren fick inte pixeln: ${capi.varfor}`);

  // Skriv tillbaka till produktfilen så inget hamnar bara i chatten.
  let text = readFileSync(produktfil, 'utf8');
  text = text.replace(/ad_account_id: ".*"/, `ad_account_id: "${OPS_ANNONSKONTO}"`);
  text = text.replace(/pixel_id: ".*"/, `pixel_id: "${pixel.id}"`);
  writeFileSync(produktfil, text);
  console.log('✅ Produktfilen uppdaterad med id:na.');
  console.log('\n🖐 Kvar för hand: VA:n skapar sidan i Business Manager, klistrar pixel-id:t i WeTracked och');
  console.log('   hämtar CAPI-tokenen själv: Events Manager → Data sources → pixeln → Settings → Conversions API → Generate access token → WeTracked.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
