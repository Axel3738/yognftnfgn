// Stänger av Klaviyo för ett brand: varje flöde som inte är draft sätts till
// draft, och varje schemalagd kampanj dras tillbaka till utkast (revert).
// Ingenting raderas, ingenting skickas.
//
//   node klaviyo/stang-av.mjs [--brand baverbutiken]          torrt: visar vad som stängs av
//   node klaviyo/stang-av.mjs [--brand baverbutiken] --ja     skarpt
//
// Axels order 2026-09-26: "jag vill inte ha Klaviyo, jag vill bara köra Spoks".
// Skriver konto/<brand>/avstangt.jsonl.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KlaviyoKlient, KlaviyoFel, nyckelFranEnv, kontrolleraKonto } from './klient.mjs';
import { lasBrand } from './ladda-upp.mjs';

const HAR = path.dirname(fileURLToPath(import.meta.url));

export async function stangAv({ brand, ja = false, klient, kontoDir, nu = () => new Date(), logg = () => {} }) {
  await kontrolleraKonto(klient, brand);
  const floden = (await klient.allaSidor('/api/flows')).filter((f) => f.attributes?.status !== 'draft' && !f.attributes?.archived);
  const kampanjer = (await klient.allaSidor('/api/campaigns', { filter: "equals(messages.channel,'email')" }))
    .filter((c) => /schedul/i.test(c.attributes?.status ?? ''));
  for (const f of floden) logg(`${ja ? 'STÄNGER AV' : 'SKULLE STÄNGA AV'} flöde ${f.attributes.name} (${f.id}, ${f.attributes.status})`);
  for (const c of kampanjer) logg(`${ja ? 'DRAR TILLBAKA' : 'SKULLE DRA TILLBAKA'} kampanj ${c.attributes.name} (${c.id}, ${c.attributes.status})`);
  if (!ja) return { ja: false, floden, kampanjer, resultat: [] };

  fs.mkdirSync(kontoDir, { recursive: true });
  const loggFil = path.join(kontoDir, 'avstangt.jsonl');
  const resultat = [];
  for (const f of floden) {
    await klient.patch(`/api/flows/${f.id}`, { data: { type: 'flow', id: f.id, attributes: { status: 'draft' } } });
    const efter = (await klient.get(`/api/flows/${f.id}`)).data.attributes.status;
    const rad = { tid: nu().toISOString(), brand: brand.id, typ: 'flöde', namn: f.attributes.name, id: f.id, fore: f.attributes.status, efter };
    logg(`✅ ${f.attributes.name}: ${efter}`);
    fs.appendFileSync(loggFil, JSON.stringify(rad) + '\n');
    resultat.push(rad);
  }
  for (const c of kampanjer) {
    await klient.patch(`/api/campaign-send-jobs/${c.id}`, { data: { type: 'campaign-send-job', id: c.id, attributes: { action: 'revert' } } });
    const efter = (await klient.get(`/api/campaigns/${c.id}`)).data.attributes.status;
    const rad = { tid: nu().toISOString(), brand: brand.id, typ: 'kampanj', namn: c.attributes.name, id: c.id, fore: c.attributes.status, efter };
    logg(`✅ ${c.attributes.name}: ${efter}`);
    fs.appendFileSync(loggFil, JSON.stringify(rad) + '\n');
    resultat.push(rad);
  }
  return { ja: true, floden, kampanjer, resultat };
}

async function main() {
  const argv = process.argv.slice(2);
  const i = argv.indexOf('--brand');
  const brand = lasBrand(i >= 0 ? argv[i + 1] : 'baverbutiken');
  const nyckel = nyckelFranEnv(brand)?.nyckel;
  if (!nyckel) { console.error(`Klaviyo-nyckeln saknas (${brand.nyckel_env.join(' eller ')}).`); process.exit(1); }
  const klient = new KlaviyoKlient({ nyckel, logg: (t) => console.error(t) });
  const ja = argv.includes('--ja');
  try {
    const r = await stangAv({ brand, ja, klient, kontoDir: path.join(HAR, 'konto', brand.id), logg: (t) => console.log(t) });
    console.log(`\n${r.floden.length} flöden, ${r.kampanjer.length} schemalagda kampanjer.${ja ? '' : ' Torrt. Lägg till --ja.'}`);
  } catch (e) {
    console.error(e instanceof KlaviyoFel || e.kod ? e.message : e.stack);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
