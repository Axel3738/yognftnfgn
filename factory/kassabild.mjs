// kassabild.mjs — den språklösa trygghetsbilden till Shopifys kassa.
//
//   node factory/kassabild.mjs <butik> [--ut <fil.png>] [--bredd 560] [--torr]
//   node factory/kassabild.mjs <butik> --kolla     # har betyget glidit?
//
// Mäter butikens RIKTIGA betyg ur produkternas `reviews.rating` (Judge.me
// håller metafältet uppdaterat), renderar strippen med factory/kassabild.py
// och laddar upp den till butikens Files. Bokför vad den mätte i
// factory/output/<butik>/kassabild.json.
//
// ── Varför den finns, och varför den ser ut som den gör ──────────────────
//
// Axels fråga 2026-09-21: "det går att lägga till en bild i kassan … hur ska
// vi komma runt i alla marknader?" Mätningen samma dag gav svaret:
//
//   • CaraShell ligger på planen "Shopify". Att anpassa kassan PER MARKNAD
//     kräver Advanced eller Plus — butiken är ett steg under gränsen.
//   • Checkout Branding API:t svarar ACCESS_DENIED med plantexten, trots att
//     appen har write_checkout_branding_settings. Scope och plan är två grindar.
//   • Butiken har EN publicerad checkout-profil för alla fem marknaderna.
//   • `TranslatableResourceType` har ingen checkout-resurs: kassans utseende
//     går inte att översätta.
//   • Shopify tog dessutom bort bakgrundsbilden i Header och Main 2026-02-05,
//     på alla planer. Kvar: logotypen och ordersammanfattningens bakgrund —
//     och ordersammanfattningen är HOPFÄLLD som standard på mobil, där i
//     stort sett all Meta-trafik landar.
//
// Slutsatsen: bilden blir EN bild för fem marknader, och den enda ytan som
// syns på mobil är logotypsfältet. Därför: en strip UTAN ord (butiksnamn,
// stjärnor, en siffra), som fungerar identiskt på svenska, norska, danska,
// finska och engelska — och som behåller brandet i kassan i stället för att
// byta ut det. Spärren mot ord sitter i kassabild.py, inte här.
//
// ⚠️ SISTA STEGET ÄR EN MÄNNISKA. API:t är stängt av planen, så bilden måste
// väljas i admin: Inställningar → Kassa → Anpassa → kugghjulet → Logo →
// Image → Select from library. Skriptet skriver ut exakt den raden.
//
// ⚠️ BILDEN ÄR STATISK. Betyget som mäts i dag är inte betyget om en månad.
// `--kolla` mäter om och säger till när siffran glidit så mycket att bilden
// ljuger; den skriver inget och laddar inte upp något.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { lasYaml } from './yaml.mjs';
import { graphql } from './shopify.mjs';
import { anslut } from './token.mjs';
import { laddaUppBild } from './filer.mjs';
import { hamtaArbetstema, hamtaTemafil } from './shopify.mjs';
import { lasTemaJson } from './tema.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Så mycket får betyget glida innan bilden räknas som osann. */
export const DRIFTGRANS = 0.2;

/**
 * Butikens betyg ur produkternas metafält, viktat på antalet recensioner.
 *
 * Viktat, inte medel av medel: en produkt med 4 recensioner ska inte väga
 * lika tungt som en med 200. Produkter utan recensioner hoppas helt — en
 * nolla hade dragit ner snittet till något som aldrig stått någonstans.
 */
export function vagtBetyg(produkter) {
  const med = (produkter ?? []).filter((p) => Number(p?.antal) > 0 && Number(p?.betyg) > 0);
  if (med.length === 0) return null;
  const antal = med.reduce((s, p) => s + Number(p.antal), 0);
  const summa = med.reduce((s, p) => s + Number(p.betyg) * Number(p.antal), 0);
  // ⚠️ `antalProdukter`, inte `produkter`: fältet spreadas ihop med
  // produktLISTAN i anroparen, och med samma namn skrev listan över antalet —
  // rapporten skrev "[object Object],[object Object] produkter" (mätt 2026-09-21).
  return { betyg: Math.round((summa / antal) * 10) / 10, antal, antalProdukter: med.length };
}

/** Läser betyg + antal per produkt ur butiken. Bara läsningar. */
export async function hamtaBetyg() {
  const d = await graphql(`{
    products(first: 50, query: "status:active") {
      nodes {
        title handle
        betyg: metafield(namespace: "reviews", key: "rating") { value }
        antal: metafield(namespace: "reviews", key: "rating_count") { value }
      }
    }
  }`);
  return (d.products?.nodes ?? []).map((p) => {
    let betyg = null;
    try { betyg = Number(JSON.parse(p.betyg?.value ?? 'null')?.value ?? NaN); } catch { betyg = null; }
    return { titel: p.title, handle: p.handle, betyg: Number.isFinite(betyg) ? betyg : null, antal: Number(p.antal?.value ?? 0) || 0 };
  });
}

/**
 * Butikens riktiga logga: temats `settings.logo` (shopify://shop_images/<fil>)
 * → filens CDN-adress → hämtad till disk. Utan den ritar kassabild.py
 * butiksnamnet i Liberation Sans, och det dömde Axel ut 2026-09-21.
 * Returnerar null när temat saknar logga — då säger rapporten det.
 */
export async function hamtaLogga(utMapp) {
  const tema = await hamtaArbetstema();
  const ra = await hamtaTemafil(tema.id, 'config/settings_data.json');
  const logo = String(lasTemaJson(ra ?? '{}')?.current?.logo ?? '');
  const m = logo.match(/shop_images\/([^?]+)/);
  if (!m) return null;
  const filnamn = m[1];
  const stam = filnamn.replace(/\.[a-z0-9]+$/i, '');
  const d = await graphql(`{ files(first: 10, query: "filename:${stam}") { nodes { ... on MediaImage { image { url } } } } }`);
  const traff = (d.files?.nodes ?? []).map((n) => n.image?.url).find((u) => u && u.includes(`/${filnamn}`));
  if (!traff) return null;
  const r = await fetch(traff);
  if (!r.ok) return null;
  mkdirSync(utMapp, { recursive: true });
  const lokal = join(utMapp, `logga-${filnamn}`);
  writeFileSync(lokal, Buffer.from(await r.arrayBuffer()));
  return { filnamn, url: traff, lokal };
}

const bokforing = (butikId) => join(ROT, 'factory', 'output', butikId, 'kassabild.json');

export function lasBokforing(butikId) {
  const f = bokforing(butikId);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, 'utf8')); } catch { return null; }
}

/** Har det uppmätta betyget glidit så mycket att den uppladdade bilden ljuger? */
export function drift(bokfort, nu) {
  if (!bokfort?.betyg || !nu?.betyg) return { glidit: false, orsak: 'ingen tidigare mätning' };
  const d = Math.round(Math.abs(Number(nu.betyg) - Number(bokfort.betyg)) * 10) / 10;
  return {
    glidit: d > DRIFTGRANS,
    diff: d,
    orsak: d > DRIFTGRANS
      ? `bilden visar ${bokfort.betyg}, butiken har ${nu.betyg} — bygg om den och byt i admin`
      : `bilden visar ${bokfort.betyg}, butiken har ${nu.betyg}`,
  };
}

function rita(spec, ut) {
  mkdirSync(dirname(ut), { recursive: true });
  const specfil = `${ut}.spec.json`;
  writeFileSync(specfil, `${JSON.stringify(spec, null, 2)}\n`);
  const r = spawnSync('python3', [join(ROT, 'factory', 'kassabild.py'), '--spec', specfil, '--ut', ut, '--json'], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`kassabild.py misslyckades:\n${(r.stderr || r.stdout || '').trim()}`);
  return JSON.parse(r.stdout.trim().split('\n').pop());
}

export async function byggKassabild(butikId, { bredd = 560, ut = null, torr = false, kolla = false } = {}) {
  const butiksfil = join(ROT, 'factory', 'butiker', `${butikId}.yaml`);
  if (!existsSync(butiksfil)) throw new Error(`Hittar ingen butiksfil: ${butiksfil}`);
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));

  // ⚠️ Adressen ur BUTIKSFILEN, aldrig ur miljöns SHOPIFY_SHOP. Utan
  // `onskadDoman` löser anslut() butiks-id:t mot vilken butik miljön råkar
  // peka på — mätt 2026-09-21: `kassabild.mjs carashell` landade på
  // TankGuards butik och stoppades först av state-spärren. Butiken ÄR
  // argumentet (KEDJAN.md), och `butik.myshopify` är facit.
  const myshopify = String(butik?.butik?.myshopify ?? '').trim();
  if (!myshopify) throw new Error(`${butiksfil} saknar butik.myshopify — utan den går det inte att veta vilken butik som menas.`);
  await anslut(butikId, { utanEnvFil: true, kravScopes: false, onskadDoman: myshopify });
  const produkter = await hamtaBetyg();
  const vagt = vagtBetyg(produkter);
  if (!vagt) {
    return { butikId, betyg: null, produkterRad: produkter, stopp: 'Ingen produkt har recensioner än — det finns inget betyg att visa. Importera recensionerna i Judge.me först.' };
  }

  const bokfort = lasBokforing(butikId);
  const d = drift(bokfort, vagt);
  if (kolla) return { butikId, ...vagt, produkterRad: produkter, bokfort, drift: d, kolla: true };

  const namn = String(butik?.butik?.brand ?? butikId);
  const f = butik?.branding?.farger ?? {};
  const fil = ut ?? join(ROT, 'factory', 'output', butikId, 'kassabild.png');
  const logga = await hamtaLogga(dirname(fil));
  const spec = {
    namn,
    betyg: vagt.betyg,
    bredd,
    logga: logga?.lokal ?? '',
    farger: { mork: f.mork, accent: f.accent, yta: 'transparent', linje: f.linje, stjarna: '#F5A623' },
  };
  const ritad = rita(spec, fil);

  if (torr) return { butikId, ...vagt, produkterRad: produkter, spec, bild: ritad, logga, drift: d, torr: true };

  const uppladdad = await laddaUppBild(fil, { alt: `${namn} ${vagt.betyg}`, filnamn: `${butikId}-kassabild.png`, aterandvand: false });
  const post = { butikId, namn, betyg: vagt.betyg, antal: vagt.antal, antalProdukter: vagt.antalProdukter, bild: ritad, logga: logga?.filnamn ?? null, fil: uppladdad, matt: new Date().toISOString().slice(0, 10) };
  mkdirSync(dirname(bokforing(butikId)), { recursive: true });
  writeFileSync(bokforing(butikId), `${JSON.stringify(post, null, 2)}\n`);
  return { ...post, produkterRad: produkter, drift: d };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const argv = process.argv.slice(2);
  const butikId = argv.find((a) => !a.startsWith('--'));
  const flagga = (n) => argv.includes(`--${n}`);
  const varde = (n) => { const i = argv.indexOf(`--${n}`); return i >= 0 ? argv[i + 1] : null; };
  if (!butikId) {
    console.error('Användning: node factory/kassabild.mjs <butik> [--ut fil.png] [--bredd 560] [--torr|--kolla]');
    process.exit(2);
  }
  try {
    const r = await byggKassabild(butikId, {
      bredd: Number(varde('bredd')) || 560,
      ut: varde('ut'),
      torr: flagga('torr'),
      kolla: flagga('kolla'),
    });
    if (r.stopp) { console.error(`⛔ ${r.stopp}`); process.exit(1); }
    console.log(`Betyg per produkt (ur reviews.rating, Judge.me):`);
    for (const p of (r.produkterRad ?? [])) {
      console.log(`  ${p.antal > 0 ? '✅' : '⏭ '} ${p.titel?.slice(0, 44).padEnd(44)} ${p.betyg ?? '–'} på ${p.antal} recensioner`);
    }
    console.log(`\nViktat betyg: ${r.betyg} på ${r.antal} recensioner över ${r.antalProdukter} produkter`);
    if (r.drift?.orsak) console.log(`Drift: ${r.drift.glidit ? '⚠️ ' : ''}${r.drift.orsak}`);
    if (r.kolla) process.exit(r.drift?.glidit ? 1 : 0);
    console.log(`Logga: ${r.logga?.filnamn ?? r.logga ?? '⚠️ SAKNAS i temat — butiksnamnet ritas som text i stället'}`);
    console.log(`Bild: ${r.bild.fil} (${r.bild.bredd}×${r.bild.hojd} px, inga ord)`);
    if (r.torr) { console.log('\nTorrkörning — inget laddades upp.'); process.exit(0); }
    console.log(`Uppladdad: ${r.fil?.url ?? r.fil?.id ?? '(okänt)'}`);
    console.log('\n🖐 SISTA STEGET GÖRS AV EN MÄNNISKA (API:t är stängt av planen):');
    console.log('   1. Shopify admin → Inställningar → Kassa');
    console.log('   2. Klicka Anpassa');
    console.log('   3. Klicka kugghjulet uppe till höger');
    console.log('   4. Under Logo: klicka Image → Select → Select from library');
    console.log(`   5. Välj filen ${butikId}-kassabild.png och klicka Spara`);
  } catch (e) {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  }
}
