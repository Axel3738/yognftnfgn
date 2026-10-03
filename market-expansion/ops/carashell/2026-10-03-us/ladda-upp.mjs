#!/usr/bin/env node
// ladda-upp.mjs — kör tools/ops-till-meta.mjs för varje klar video, först torrt och
// sedan skarpt, i US-målet och i registrets extra mål (AU). En rad som stoppas
// torrt laddas aldrig upp skarpt; ett extra mål som misslyckas stoppar aldrig
// huvudmålet (kommandofilen /ops-oversatt steg 5).
//
//   node ladda-upp.mjs --torr          # bara torrkörningarna
//   node ladda-upp.mjs --skarpt        # torrt, och skarpt för det som var grönt
//   node ladda-upp.mjs --skarpt --bara OB_118
//
// Skriver upp-<mål>-<namn>.json per uppladdning och upp-resultat.json till slut.
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HÄR = dirname(fileURLToPath(import.meta.url));
const ROT = resolve(HÄR, '..', '..', '..', '..');
const SKARPT = process.argv.includes('--skarpt');
const BARA = process.argv.includes('--bara') ? process.argv[process.argv.indexOf('--bara') + 1] : null;
// ⚠️ Ett mål tar ~13 min skarpt (Meta kod 17 backar av på kontots 634 annonser).
// Kör ETT land i taget, så en felande väg inte äter en timme av den andra:
// AU:s IG-id vägrades av Meta och sex AU-försök hade kostat ~80 min (mätt 2026-10-03).
const BARA_LAND = process.argv.includes('--land') ? process.argv[process.argv.indexOf('--land') + 1].toUpperCase() : null;

const jobb = JSON.parse(readFileSync(join(HÄR, 'jobb.json'), 'utf8'));
const copy = JSON.parse(readFileSync(join(HÄR, 'underlag', 'us-copy.json'), 'utf8'));

function kor(args, taggar) {
  const r = spawnSync('node', [join(ROT, 'tools', 'ops-till-meta.mjs'), ...args], { encoding: 'utf8', cwd: ROT });
  const ut = (r.stdout || '') + (r.stderr || '');
  return { kod: r.status, ut, ...taggar };
}

const resultat = [];
for (const rad of jobb.rader) {
  const kort = rad.namn.replace(/^CaraShellRoof_/, '').replace(/_H1$/, '');
  if (BARA && kort !== BARA) continue;
  const c = copy[kort];
  if (!c) { resultat.push({ rad: rad.namn, fel: 'ingen copy' }); continue; }
  const fil = join(HÄR, 'us', `CaraShellRoof_US_${kort}_H1-ai.mp4`);
  if (!existsSync(fil)) { resultat.push({ rad: rad.namn, fel: `filen saknas: ${fil}` }); continue; }

  // Huvudmålet (US) och varje extra mål (AU) — samma fil, samma copy.
  const mal = [{ land: 'US', kampanj: jobb.kampanj.id, namn: rad.mal_namn }];
  for (const o of rad.ocksa ?? []) {
    if (o.finns_i_meta) continue;
    if (!o.kampanj_id || o.kampanj_skal) { resultat.push({ rad: rad.namn, land: o.land, fel: o.kampanj_skal ?? 'inget kampanj-id' }); continue; }
    mal.push({ land: o.land, kampanj: o.kampanj_id, namn: o.mal_namn });
  }

  for (const m of mal) {
    if (BARA_LAND && m.land !== BARA_LAND) continue;
    // ⛔ Priset: USA-copyn bär $199/$249 ur produktfilens marknadspriser. Australien
    //    har INGEN AUD-rad där, och sidan visar Shopifys egen omräkning som rör sig
    //    (A$286 den 17/9, A$292 den 3/10) — regel 4 i /ops-oversatt: saknas raden
    //    skrivs copyn UTAN pris. Därför `au`-blocket, aldrig USA-texten rakt av.
    const t = m.land === 'US' ? c : (c.au ?? c);
    const bas = ['carashell/takskyddet', '--marknad', 'US', '--kampanj', m.kampanj,
      '--namn', m.namn, '--fil', fil,
      '--primar', t.message, '--rubrik', t.headline, '--beskrivning', t.description];
    // ⛔ AU-kampanjens befintliga annonser bär instagram_actor_id 17841421066812446,
    //    och Meta vägrar skapa en annons med det: "(#100) Param instagram_actor_id
    //    must be a valid Instagram account id" (mätt 2026-10-03). Id:t går inte heller
    //    att läsa med systemanvändarens token. US-målets annonser har ingen IG alls och
    //    fungerar — AU får samma: utan actor serverar Meta Instagram via sidans egen
    //    identitet. Ändra aldrig till ett gissat IG-id.
    if (m.land !== 'US') bas.push('--ig', 'ingen');
    const torr = kor([...bas, '--torr'], { rad: rad.namn, land: m.land, namn: m.namn, steg: 'torr' });
    writeFileSync(join(HÄR, `upp-torr-${m.land}-${kort}.log`), torr.ut);
    console.log(`${m.land} ${m.namn} torr: ${torr.kod === 0 ? 'OK' : 'STOPP'}`);
    if (torr.kod !== 0) {
      console.log(torr.ut.split('\n').filter((l) => /✗|stopp|Stopp|FEL/.test(l)).slice(-3).join('\n'));
      resultat.push({ rad: rad.namn, land: m.land, namn: m.namn, torr: 'STOPP', logg: `upp-torr-${m.land}-${kort}.log` });
      continue;
    }
    if (!SKARPT) { resultat.push({ rad: rad.namn, land: m.land, namn: m.namn, torr: 'OK' }); continue; }
    const skarp = kor([...bas, '--json'], { rad: rad.namn, land: m.land, namn: m.namn, steg: 'skarp' });
    writeFileSync(join(HÄR, `upp-${m.land}-${kort}.log`), skarp.ut);
    let j = null;
    try { j = JSON.parse(skarp.ut.slice(skarp.ut.indexOf('{'))); } catch { /* loggen får svara */ }
    console.log(`${m.land} ${m.namn} skarp: ${skarp.kod === 0 ? `OK ad ${j?.annons?.id ?? '?'}` : 'FEL'}`);
    resultat.push({ rad: rad.namn, page_id: rad.page_id, land: m.land, namn: m.namn, torr: 'OK',
      skarp: skarp.kod === 0 ? 'OK' : 'FEL', ad_id: j?.annons?.id ?? null, adset: j?.adset ?? null,
      kampanj: j?.kampanj ?? null, logg: `upp-${m.land}-${kort}.log` });
  }
}
writeFileSync(join(HÄR, 'upp-resultat.json'), JSON.stringify(resultat, null, 1));
console.log(`\n${resultat.length} rader → upp-resultat.json`);
