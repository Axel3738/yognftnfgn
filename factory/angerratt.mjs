// EU:s ångerknapp — efterrustning av butiker som redan är byggda.
//
//   node factory/angerratt.mjs            → vad varje butik behöver, ingen ändring
//   node factory/angerratt.mjs --kor      → kör om policyer + meny + checklista
//   node factory/angerratt.mjs --kor <butik-id>   → bara en butik
//
// Nya butiker får knappen av sig själva: `policyer.mjs` skriver den i
// returpolicyn och `ops.mjs` lägger raden "Ångra köp" i sidfotsmenyn. Den här
// filen finns bara för de butiker som byggdes INNAN 2026-09-09 och som därför
// har en returpolicy utan knapp.
//
// ⚠️ Den här filen ändrar aldrig något själv. Den kör om tre steg i ops.mjs
// (`--igen policyer,meny,checklista`), så det finns exakt EN kodväg som
// skriver policyer och menyer. Två vägar hinner bli olika, och då står det
// olika saker i policyn och i sidfoten.
//
// ⚠️ Nycklarna är per butik. En butik vars nycklar inte ligger i miljön
// rapporteras som HOPPAD med orsak — aldrig som klar. (Samma regel som
// självtestet: en tyst överhoppning är samma sak som ett falskt grönt.)

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { upptackOps } from './register.mjs';
import { losNycklar } from './token.mjs';
import { laddaEnv } from './env.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** De tre stegen som bär knappen. Ordningen är ops.mjs egen. */
export const STEGEN = Object.freeze(['policyer', 'meny', 'checklista']);

/**
 * Butikerna som ska efterrustas, en rad per butik (inte per produkt).
 * En flerproduktsbutik har EN policy och EN meny — den körs en gång med
 * alla sina produktfiler, precis som ops.mjs vill ha det.
 */
export function butikerAttRusta(poster = upptackOps(ROT)) {
  const per = new Map();
  for (const p of poster) {
    if (!per.has(p.butik)) {
      per.set(p.butik, { id: p.butik, brand: p.brand, butiksfil: p.butiksfil, produktfiler: [], byggd: false });
    }
    const rad = per.get(p.butik);
    rad.produktfiler.push(p.produktfil);
    if (p.byggd) rad.byggd = true;
  }
  return [...per.values()];
}

/**
 * Går butiken att köra? Ren funktion över ett env-objekt så den går att testa
 * utan att röra miljön.
 */
export function lage(rad, env = process.env) {
  if (!rad.byggd) return { kor: false, skal: 'butiken är inte byggd än — knappen kommer med i första bygget' };
  const n = losNycklar(rad.id, env);
  const saknas = [!n.shop && 'SHOPIFY_SHOP', !n.clientId && 'SHOPIFY_CLIENT_ID', !n.clientSecret && 'SHOPIFY_CLIENT_SECRET']
    .filter(Boolean);
  if (saknas.length > 0) {
    return { kor: false, skal: `saknar ${saknas.join(', ')} i miljön (per butik: ${saknas.map((s) => `${s}_${rad.id.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`).join(', ')})` };
  }
  return { kor: true, doman: n.shop };
}

function kor(rad) {
  const argv = ['factory/ops.mjs', rad.butiksfil, ...rad.produktfiler, '--igen', STEGEN.join(',')];
  const r = spawnSync('node', argv, { cwd: ROT, stdio: 'inherit' });
  return r.status === 0;
}

function huvud() {
  laddaEnv();
  const argv = process.argv.slice(2);
  const skarpt = argv.includes('--kor');
  const bara = argv.find((a) => !a.startsWith('--'));

  let rader = butikerAttRusta();
  if (bara) {
    rader = rader.filter((r) => r.id === bara);
    if (rader.length === 0) {
      console.error(`\n❌ Ingen butik heter "${bara}". Butikerna är: ${butikerAttRusta().map((r) => r.id).join(', ')}\n`);
      process.exit(1);
    }
  }

  console.log(`\nEU:S ÅNGERKNAPP — ${skarpt ? 'efterrustning' : 'läget (ingen ändring gjord)'}\n`);

  const gjort = [];
  const kvar = [];

  for (const rad of rader) {
    const l = lage(rad);
    if (!l.kor) {
      kvar.push(`${rad.id} — HOPPAD: ${l.skal}`);
      console.log(`⚠️ ${rad.id} (${rad.brand}) — hoppad: ${l.skal}`);
      continue;
    }
    if (!skarpt) {
      console.log(`•  ${rad.id} (${rad.brand}) → ${l.doman}: kör om ${STEGEN.join(', ')}`);
      kvar.push(`${rad.id} — inte körd än (kör med --kor)`);
      continue;
    }
    console.log(`\n──── ${rad.id} (${rad.brand}) → ${l.doman}\n`);
    if (kor(rad)) gjort.push(`${rad.id} — policyn bär knappen, sidfoten har raden "Ångra köp"`);
    else kvar.push(`${rad.id} — körningen gick fel, se utskriften ovan`);
  }

  console.log('\n────────────────────────────────────────────────────────────');
  console.log('GJORT AV MIG');
  console.log(gjort.length > 0 ? gjort.map((r) => `  ✅ ${r}`).join('\n') : '  (inget)');
  console.log('\nKVAR');
  console.log(kvar.length > 0 ? kvar.map((r) => `  ⬜ ${r}`).join('\n') : '  (inget)');
  console.log(
    '\n⚠️ Knappen i policyn räcker inte i sig. Shopifys självbetjäningsreturer\n' +
      '   måste slås på per butik — VA:ns checklista, avsnitt 5b.\n'
  );

  process.exit(kvar.length > 0 ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) huvud();
