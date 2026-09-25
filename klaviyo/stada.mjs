// Städar bort motorns ERSATTA utkast i Klaviyo. När ett flöde eller en mall får
// en ny version (FLOW_…_v2, TPL_<id>_v2) står den gamla kvar i kontot som ett
// utkast som ser ut att kunna slås på. Skriptet listar motorns flöden (FLOW_*)
// och mallar (TPL_*), grupperar på namnet utan _v<n> och tar bort de äldre
// versionerna: flöden BARA om de är draft (ett live-flöde rörs aldrig, att
// stänga det är Axels beslut), mallar bara när en nyare version finns i kontot.
// Bara objekt motorn själv skapat enligt konto/<brand>/uppladdat.jsonl rörs.
//
//   node klaviyo/stada.mjs --brand matstrumpor        # torrt: listar vad som skulle tas bort
//   node klaviyo/stada.mjs --brand matstrumpor --ja   # tar bort, loggar atgard "raderad"
//
// Bakgrund 2026-09-25: fonten (Mochiy Pop P One) och klubben gav alla sju flöden
// version 2. Flödesmallar kopieras in i flödet när det skapas, så en ändrad
// mall kräver ett nytt flöde — och v1-utkasten hade annars legat kvar bredvid.
// Loggen är samma uppladdat.jsonl som uppladdningen skriver; ladda-upp.mjs
// räknar ett namn vars senaste rad är "raderad" som borta.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KlaviyoKlient, KlaviyoFel, nyckelFranEnv, kontrolleraKonto } from './klient.mjs';
import { lasBrand, lasMinne } from './ladda-upp.mjs';

const HAR = path.dirname(fileURLToPath(import.meta.url));

export function delaVersion(namn) {
  const m = /^(.*)_v(\d+)$/.exec(String(namn ?? ''));
  return m ? { bas: m[1], version: Number(m[2]) } : null;
}

/**
 * Vad som ska bort. Ren funktion.
 * @param {{ floden: {id,namn,status}[], mallar: {id,namn}[], minne: {id}[] }} o
 * @returns {{ bort: {typ,id,namn,orsak}[], varningar: string[] }}
 */
export function ersatta({ floden = [], mallar = [], minne = [] }) {
  const motorns = new Set(minne.map((m) => m.id).filter(Boolean));
  const bort = [];
  const varningar = [];
  const grupper = (lista, prefix) => {
    const g = new Map();
    for (const x of lista) {
      if (!String(x.namn ?? '').startsWith(prefix)) continue;
      const d = delaVersion(x.namn);
      if (!d) continue;
      if (!g.has(d.bas)) g.set(d.bas, []);
      g.get(d.bas).push({ ...x, version: d.version });
    }
    return g;
  };
  for (const [bas, lista] of grupper(floden, 'FLOW_')) {
    const max = Math.max(...lista.map((x) => x.version));
    for (const f of lista.filter((x) => x.version < max)) {
      if (f.status !== 'draft') { varningar.push(`flödet ${f.namn} (${f.id}) är ${f.status}, inte draft — rörs aldrig; stäng det i Klaviyo om ${bas}_v${max} ska ta över.`); continue; }
      if (!motorns.has(f.id)) { varningar.push(`flödet ${f.namn} (${f.id}) är inte motorns enligt uppladdat.jsonl — rörs inte.`); continue; }
      bort.push({ typ: 'flode', id: f.id, namn: f.namn, orsak: `ersatt av ${bas}_v${max}` });
    }
  }
  for (const [bas, lista] of grupper(mallar, 'TPL_')) {
    const max = Math.max(...lista.map((x) => x.version));
    for (const m of lista.filter((x) => x.version < max)) {
      if (!motorns.has(m.id)) { varningar.push(`mallen ${m.namn} (${m.id}) är inte motorns enligt uppladdat.jsonl — rörs inte.`); continue; }
      bort.push({ typ: 'mall', id: m.id, namn: m.namn, orsak: `ersatt av ${bas}_v${max}` });
    }
  }
  return { bort, varningar };
}

export async function stada({ brand, klient, kontoDir, ja = false, nu = () => new Date(), logg = () => {} }) {
  const konto = await kontrolleraKonto(klient, brand);
  const floden = (await klient.allaSidor('/api/flows', { 'page[size]': 50, 'fields[flow]': 'name,status,archived' }))
    .map((f) => ({ id: f.id, namn: f.attributes?.name, status: f.attributes?.status }));
  const mallar = (await klient.allaSidor('/api/templates', { 'page[size]': 10, 'fields[template]': 'name' }))
    .map((m) => ({ id: m.id, namn: m.attributes?.name }));
  const minne = lasMinne(kontoDir);
  const { bort, varningar } = ersatta({ floden, mallar, minne });
  for (const v of varningar) logg(`⚠️  ${v}`);
  if (!bort.length) logg('Inget ersatt utkast att ta bort.');
  const raderade = [];
  for (const b of bort) {
    if (!ja) { logg(`SKULLE TA BORT ${b.typ} ${b.namn} (${b.id}): ${b.orsak}`); continue; }
    await klient.delete(`/api/${b.typ === 'flode' ? 'flows' : 'templates'}/${b.id}`);
    const kvar = await klient.hittaPaNamn(b.typ === 'flode' ? 'flow' : 'template', b.namn);
    if (kvar) throw new Error(`${b.typ} ${b.namn} finns kvar efter raderingen (${kvar.id}) — avbryter.`);
    fs.mkdirSync(kontoDir, { recursive: true });
    fs.appendFileSync(path.join(kontoDir, 'uppladdat.jsonl'), JSON.stringify({ tid: nu().toISOString(), brand: brand.id, typ: b.typ, namn: b.namn, id: b.id, atgard: 'raderad', orsak: b.orsak }) + '\n');
    raderade.push(b);
    logg(`RADERAD ${b.typ} ${b.namn} (${b.id}): ${b.orsak}`);
  }
  return { konto: konto.attributes?.public_api_key ?? null, bort, raderade, varningar, ja };
}

async function main() {
  const argv = process.argv.slice(2);
  const arg = (n) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : null; };
  const brand = lasBrand(arg('--brand') ?? 'baverbutiken');
  const nyckel = nyckelFranEnv(brand);
  if (!nyckel) { console.error(`Nyckeln ${brand.nyckel_env.join(' eller ')} saknas i miljön.`); process.exit(1); }
  (await import('../mejl/shopify.mjs')).kravProxy();
  const klient = new KlaviyoKlient({ nyckel: nyckel.nyckel, logg: (t) => console.error(t) });
  try {
    const r = await stada({ brand, klient, kontoDir: path.join(HAR, 'konto', brand.id), ja: argv.includes('--ja'), logg: (t) => console.log(t) });
    console.log(`${r.ja ? 'Raderade' : 'Skulle radera'}: ${r.ja ? r.raderade.length : r.bort.length} · varningar: ${r.varningar.length}${r.ja ? '' : ' (torrt — kör med --ja)'}`);
  } catch (e) {
    console.error(e instanceof KlaviyoFel ? e.message : e.stack);
    process.exit(2);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
