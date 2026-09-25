// Slår på namngivna flöden i Klaviyo: flödet och varje send-email-action → live.
//
//   node klaviyo/sla-pa.mjs [--brand baverbutiken] <flödesnamn …>          torrt: visar vad som skulle slås på
//   node klaviyo/sla-pa.mjs --brand matstrumpor <flödesnamn …> --ja        skarpt
//
// ⛔ Bara på Axels uttryckliga ord ("slå på flödena", 2026-09-25). Klienten
// släpper bara igenom exakt de id:n skriptet läst ur kontot, bara status
// "live", och aldrig ett kampanjutskick (klient.mjs sparrSkicka).
// Läser tillbaka varje flöde efteråt och skriver konto/<brand>/pasatt.jsonl.
//
// `--brand` (2026-09-25, Matstrumpor): brandfilen väljer nyckel, konto och
// konto-mapp. Standard är baverbutiken, så Bäverbutikens kommandon är oförändrade.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KlaviyoKlient, KlaviyoFel, nyckelFranEnv, kontrolleraKonto, citera } from './klient.mjs';
import { lasBrand } from './ladda-upp.mjs';

const HAR = path.dirname(fileURLToPath(import.meta.url));

/** Kommandoraden → { brand, ja, namn[] }. Kastar på okända flaggor. */
export function tolkaArgs(argv) {
  const a = { brand: 'baverbutiken', ja: false, namn: [] };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--brand') {
      a.brand = argv[++i];
      if (!a.brand || a.brand.startsWith('--')) throw new Error('--brand vill ha ett brand-id (klaviyo/brands/<id>.json).');
    } else if (x === '--ja') a.ja = true;
    else if (x.startsWith('--')) throw new Error(`Okänt argument: ${x}`);
    else a.namn.push(x);
  }
  return a;
}

/**
 * @param {object} o
 * @param {object} o.brand        brands/<id>.json
 * @param {string[]} o.namn       flödesnamnen, exakt som i Klaviyo
 * @param {boolean} [o.ja]        skarpt
 * @param {Function} o.nyKlient   (opts) => KlaviyoKlient — injiceras i testerna
 * @param {string} o.kontoDir     konto/<brand>/
 */
export async function slaPa({ brand, namn, ja = false, nyKlient, kontoDir, nu = () => new Date(), logg = () => {} }) {
  if (!namn?.length) throw Object.assign(new Error('Ange flödesnamnen som ska slås på.'), { kod: 'ARG' });
  const lasare = nyKlient({});
  await kontrolleraKonto(lasare, brand);
  const plan = [];
  for (const n of namn) {
    const svar = (await lasare.get('/api/flows', { filter: `equals(name,${citera(n)})`, 'page[size]': 50 })).data ?? [];
    const exakta = svar.filter((x) => x.attributes?.name === n);
    if (exakta.length !== 1) throw Object.assign(new Error(`STOPP: "${n}" ger ${exakta.length} flöden i kontot ${brand.public_id}.`), { kod: 'STOPP' });
    const id = exakta[0].id;
    const d = (await lasare.get(`/api/flows/${id}`, { 'additional-fields[flow]': 'definition' })).data.attributes;
    const mejl = (d.definition?.actions ?? []).filter((a) => a.type === 'send-email');
    plan.push({ namn: n, id, status: d.status, mejl });
    logg(`${ja ? 'SLÅR PÅ' : 'SKULLE SLÅ PÅ'} ${n} (${id}, nu ${d.status}) + ${mejl.length} mejl`);
  }
  if (!ja) return { brand: brand.id, ja: false, plan, resultat: [] };

  const k = nyKlient({ tillatLive: plan.flatMap((p) => [p.id, ...p.mejl.map((a) => String(a.id))]) });
  fs.mkdirSync(kontoDir, { recursive: true });
  const loggFil = path.join(kontoDir, 'pasatt.jsonl');
  const resultat = [];
  for (const p of plan) {
    for (const a of p.mejl) {
      const { id, ...resten } = a;
      await k.patch(`/api/flow-actions/${id}`, { data: { type: 'flow-action', id: String(id), attributes: { definition: { ...resten, id, data: { ...a.data, status: 'live' } } } } });
    }
    await k.patch(`/api/flows/${p.id}`, { data: { type: 'flow', id: p.id, attributes: { status: 'live' } } });
    const efter = (await k.get(`/api/flows/${p.id}`, { 'additional-fields[flow]': 'definition' })).data.attributes;
    const mejlLive = (efter.definition?.actions ?? []).filter((a) => a.type === 'send-email').map((a) => a.data?.status);
    const rad = { tid: nu().toISOString(), brand: brand.id, namn: p.namn, id: p.id, status: efter.status, mejl: mejlLive };
    logg(`✅ ${p.namn}: flöde ${efter.status}, mejl ${mejlLive.join(', ')}`);
    fs.appendFileSync(loggFil, JSON.stringify(rad) + '\n');
    resultat.push(rad);
  }
  return { brand: brand.id, ja: true, plan, resultat };
}

async function main() {
  const a = tolkaArgs(process.argv.slice(2));
  const brand = lasBrand(a.brand);
  if (!a.namn.length) { console.error('Ange flödesnamnen som ska slås på.'); process.exit(1); }
  const nyckel = nyckelFranEnv(brand)?.nyckel;
  if (!nyckel) { console.error(`Klaviyo-nyckeln saknas (${brand.nyckel_env.join(' eller ')}).`); process.exit(1); }
  (await import('../mejl/shopify.mjs')).kravProxy();
  const nyKlient = (o) => new KlaviyoKlient({ nyckel, logg: (t) => console.error(t), ...o });
  try {
    const r = await slaPa({ brand, namn: a.namn, ja: a.ja, nyKlient, kontoDir: path.join(HAR, 'konto', brand.id), logg: (t) => console.log(t) });
    if (!r.ja) console.log('\nTorrt. Lägg till --ja för att slå på.');
  } catch (e) {
    console.error(e instanceof KlaviyoFel || e.kod ? e.message : e.stack);
    process.exit(1);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
