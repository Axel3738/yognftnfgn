// Schemalägger namngivna kampanjer i Klaviyo (send-job på en Draft med fast datum).
//
//   node klaviyo/schemalagg.mjs [--brand baverbutiken] K01 [K02 …]        torrt: visar vad som skulle schemaläggas
//   node klaviyo/schemalagg.mjs --brand matstrumpor K01 --ja              skarpt
//
// ⛔ Bara på Axels uttryckliga ord ("schemalägg K01", 2026-09-25). Stoppar om
// kampanjen inte är Draft, inte har send_strategy "static" minst en timme
// fram, eller om ett inkluderat segment saknar samtyckesvillkoret. Klienten
// släpper bara igenom send-job för exakt de kampanj-id:n som klarat det.
// Läser tillbaka status efteråt och skriver konto/<brand>/schemalagt.jsonl.
//
// `--brand` (2026-09-25, Matstrumpor): brandfilen väljer nyckel, konto,
// innehållsmapp (innehall/<brand>/kampanjer/) och konto-mapp. Standard är
// baverbutiken, så Bäverbutikens kommandon är oförändrade.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KlaviyoKlient, KlaviyoFel, nyckelFranEnv, kontrolleraKonto } from './klient.mjs';
import { harSamtycke } from './segment.mjs';
import { lasBrand } from './ladda-upp.mjs';

const HAR = path.dirname(fileURLToPath(import.meta.url));

/** Kommandoraden → { brand, ja, koder[] } (koderna i versaler). Kastar på okända flaggor. */
export function tolkaArgs(argv) {
  const a = { brand: 'baverbutiken', ja: false, koder: [] };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--brand') {
      a.brand = argv[++i];
      if (!a.brand || a.brand.startsWith('--')) throw new Error('--brand vill ha ett brand-id (klaviyo/brands/<id>.json).');
    } else if (x === '--ja') a.ja = true;
    else if (x.startsWith('--')) throw new Error(`Okänt argument: ${x}`);
    else a.koder.push(x.toUpperCase());
  }
  return a;
}

/** K01 → kampanjfilen k01-*.json i innehållsmappen → dess namn. */
export function kampanjNamnFor(kod, innehallDir) {
  const mapp = path.join(innehallDir, 'kampanjer');
  const fil = fs.existsSync(mapp) ? fs.readdirSync(mapp).find((f) => f.toUpperCase().startsWith(kod + '-') && f.endsWith('.json')) : null;
  if (!fil) throw Object.assign(new Error(`STOPP: ingen kampanjfil för ${kod} i ${mapp}.`), { kod: 'STOPP' });
  const namn = JSON.parse(fs.readFileSync(path.join(mapp, fil), 'utf8')).namn;
  if (!namn) throw Object.assign(new Error(`STOPP: ${fil} saknar "namn".`), { kod: 'STOPP' });
  return { fil, namn };
}

/**
 * @param {object} o
 * @param {object} o.brand         brands/<id>.json
 * @param {string[]} o.koder       K01, K02 …
 * @param {boolean} [o.ja]         skarpt
 * @param {Function} o.nyKlient    (opts) => KlaviyoKlient — injiceras i testerna
 * @param {string} o.innehallDir   innehall/<brand>/
 * @param {string} o.kontoDir      konto/<brand>/
 */
export async function schemalagg({ brand, koder, ja = false, nyKlient, innehallDir, kontoDir, nu = () => new Date(), logg = () => {} }) {
  if (!koder?.length) throw Object.assign(new Error('Ange kampanjerna, t.ex. K01.'), { kod: 'ARG' });
  const k = nyKlient({});
  await kontrolleraKonto(k, brand);
  const alla = await k.allaSidor('/api/campaigns', { filter: "equals(messages.channel,'email')" });
  const plan = [];
  for (const kod of koder) {
    const { namn } = kampanjNamnFor(kod, innehallDir);
    const c = alla.filter((x) => x.attributes?.name === namn);
    if (c.length !== 1) throw Object.assign(new Error(`STOPP: ${kod} (${namn}) ger ${c.length} kampanjer i kontot ${brand.public_id}.`), { kod: 'STOPP' });
    const a = c[0].attributes;
    const tid = a.send_strategy?.method === 'static' ? new Date(a.send_strategy.datetime) : null;
    const fel = [];
    if (a.status !== 'Draft') fel.push(`status är ${a.status}, inte Draft`);
    if (!tid || Number.isNaN(tid.getTime()) || tid.getTime() < nu().getTime() + 3600e3) fel.push(`sändtiden måste vara ett fast datum minst en timme fram (är ${JSON.stringify(a.send_strategy)})`);
    for (const sid of a.audiences?.included ?? []) {
      const def = (await k.get(`/api/segments/${sid}`)).data.attributes.definition;
      if (!harSamtycke(def)) fel.push(`segmentet ${sid} saknar samtyckesvillkoret`);
    }
    if (fel.length) throw Object.assign(new Error(`STOPP: ${kod}: ${fel.join('; ')}.`), { kod: 'STOPP' });
    const svensk = tid.toLocaleString('sv-SE', { timeZone: brand.tidszon ?? 'Europe/Stockholm', dateStyle: 'full', timeStyle: 'short' });
    plan.push({ kod, id: c[0].id, namn, tid: tid.toISOString(), svensk });
    logg(`${ja ? 'SCHEMALÄGGER' : 'SKULLE SCHEMALÄGGA'} ${kod} ${namn} → ${svensk}`);
  }
  if (!ja) return { brand: brand.id, ja: false, plan, resultat: [] };

  const s = nyKlient({ tillatLive: plan.map((p) => `kampanj:${p.id}`) });
  fs.mkdirSync(kontoDir, { recursive: true });
  const loggFil = path.join(kontoDir, 'schemalagt.jsonl');
  const resultat = [];
  for (const p of plan) {
    await s.post('/api/campaign-send-jobs', { data: { type: 'campaign-send-job', id: p.id } });
    const efter = (await s.get(`/api/campaigns/${p.id}`)).data.attributes;
    const rad = { tid: nu().toISOString(), brand: brand.id, kod: p.kod, id: p.id, namn: p.namn, sands: p.tid, status: efter.status };
    logg(`✅ ${p.kod}: ${efter.status}, ${p.svensk}`);
    fs.appendFileSync(loggFil, JSON.stringify(rad) + '\n');
    resultat.push(rad);
  }
  return { brand: brand.id, ja: true, plan, resultat };
}

async function main() {
  const a = tolkaArgs(process.argv.slice(2));
  const brand = lasBrand(a.brand);
  if (!a.koder.length) { console.error('Ange kampanjerna, t.ex. K01.'); process.exit(1); }
  const nyckel = nyckelFranEnv(brand)?.nyckel;
  if (!nyckel) { console.error(`Klaviyo-nyckeln saknas (${brand.nyckel_env.join(' eller ')}).`); process.exit(1); }
  (await import('../mejl/shopify.mjs')).kravProxy();
  const nyKlient = (o) => new KlaviyoKlient({ nyckel, logg: (t) => console.error(t), ...o });
  try {
    const r = await schemalagg({ brand, koder: a.koder, ja: a.ja, nyKlient, innehallDir: path.join(HAR, 'innehall', brand.id), kontoDir: path.join(HAR, 'konto', brand.id), logg: (t) => console.log(t) });
    if (!r.ja) console.log('\nTorrt. Lägg till --ja för att schemalägga.');
  } catch (e) {
    console.error(e instanceof KlaviyoFel || e.kod ? e.message : e.stack);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
