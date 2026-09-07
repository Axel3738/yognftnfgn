// Meta-steget: skapar det som FAKTISKT går via Marketing API för en ny
// OPS-butik — annonskonto och pixel. Sidor kan inte skapas via API
// (Meta tog bort det) — sidan är kvar på Axels checklista.
//
//   node factory/meta-setup.mjs factory/produkter/<id>.yaml --business <business-id> [--torr]
//
// Kräver env META_ACCESS_TOKEN — en systemanvändartoken från Business
// Manager med scopen ads_management + business_management. Samma token som
// rutinerna använder fungerar OM den har business_management.
//
// ⚠️ Annonskonto-skapande kräver att businessen får skapa konton
// (Meta begränsar antalet per business, och nya businesses kan behöva
// verifiering). Nekas anropet skrivs exakt vad Meta svarade — då återstår
// knappen i Business Manager, och det här skriptet har ändå kostat noll.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';

const GRAPH = 'https://graph.facebook.com/v21.0';

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

export async function skapaAnnonskonto(businessId, namn) {
  return graph(`/${businessId}/adaccount`, {
    metod: 'POST',
    form: { name: namn, currency: 'SEK', timezone_id: '129', end_advertiser: businessId, media_agency: 'NONE', partner: 'NONE' },
  });
}

export async function skapaPixel(adAccountId, namn) {
  return graph(`/act_${adAccountId}/adspixels`, { metod: 'POST', form: { name: namn } });
}

// Döper om ett befintligt annonskonto till brandet — VA-checklistans
// "Claude renames the ad account". Kontonamnet är aldrig samma som
// brandnamnet i övriga repo:t, men OPS-butikernas konton får brandets namn
// (Axels flöde: ta ett tomt konto, döp om, lägg kortet via Business Manager).
export async function dopOmAnnonskonto(adAccountId, nyttNamn) {
  return graph(`/act_${adAccountId}`, { metod: 'POST', form: { name: nyttNamn } });
}

async function huvud() {
  laddaEnv();
  const arg = process.argv.slice(2);
  const produktfil = arg.find((a) => !a.startsWith('--'));
  const businessId = arg.includes('--business') ? arg[arg.indexOf('--business') + 1] : null;
  const torr = arg.includes('--torr') || arg.includes('--dry');
  if (!produktfil || !businessId) {
    console.error('Användning: node factory/meta-setup.mjs factory/produkter/<id>.yaml --business <id> [--torr]');
    process.exit(1);
  }
  const p = lasYaml(readFileSync(produktfil, 'utf8'));
  const brand = p?.brand?.namn ?? p?.produkt?.namn;

  console.log(`\nMeta-setup för ${brand} (business ${businessId}):`);
  console.log(`  1. Annonskonto "${brand}" i SEK`);
  console.log(`  2. Pixel "${brand}"`);
  console.log('  (Sidan går inte via API — den står kvar på checklistan.)');
  if (torr) { console.log('\n(torrkörning — inget skapades)'); return; }

  let kontoId = p?.meta?.ad_account_id || null;
  if (kontoId) {
    console.log(`\nAnnonskonto finns redan i produktfilen (${kontoId}) — hoppar över skapandet.`);
  } else {
    const konto = await skapaAnnonskonto(businessId, brand);
    kontoId = String(konto.id).replace('act_', '');
    console.log(`✅ Annonskonto skapat: ${kontoId}`);
  }

  const pixel = await skapaPixel(kontoId, brand);
  console.log(`✅ Pixel skapad: ${pixel.id}`);

  // Skriv tillbaka till produktfilen så inget hamnar bara i chatten.
  let text = readFileSync(produktfil, 'utf8');
  text = text.replace(/ad_account_id: ".*"/, `ad_account_id: "${kontoId}"`);
  text = text.replace(/pixel_id: ".*"/, `pixel_id: "${pixel.id}"`);
  writeFileSync(produktfil, text);
  console.log('✅ Produktfilen uppdaterad med id:na.');
  console.log('\n🖐 Kvar för hand: skapa sidan i Business Manager + betalkort på kontot.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
