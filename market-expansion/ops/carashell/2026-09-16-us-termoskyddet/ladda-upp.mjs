#!/usr/bin/env node
// ladda-upp.mjs — de 16 US-annonserna (12 video + 4 bild) LIVE i termoskyddets US-kampanj
// i Magiborsten UK, en i taget genom tools/ops-till-meta.mjs (alla spärrar där gäller:
// marknadens konto, marknadskoden i namnet, dubblett i hela kontot, ett adset per koncept).
//
//   node market-expansion/ops/carashell/2026-09-16-us-termoskyddet/ladda-upp.mjs [--torr] [--bara CS_1,PD_2_1]
//
// Läser  adcopy-US.json (copy per vinkel), us/<US-namn>.mp4|.png, resultat-dubb.json (bara OK-videor)
// Skriver resultat-meta.json (en post per annons: ad_id, adset, status — eller skälet den hoppades)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const HAR = dirname(fileURLToPath(import.meta.url));
const ROT = join(HAR, '..', '..', '..', '..');
const args = process.argv.slice(2);
const TORR = args.includes('--torr');
const baraIdx = args.indexOf('--bara');
const BARA = baraIdx >= 0 ? args[baraIdx + 1].split(',').map((s) => s.trim()) : null;

const NYCKEL = 'carashell/termoskyddet';
const MARKNAD = 'US';
const KAMPANJ = '120251442339640435'; // CARASHELL_US_Termoskydd Husbil 211 × 171 cm | BE-ROAS 1.61 | 2026-09-16 (Magiborsten UK)
// US-marknadens domän är carashell.com (mätt 2026-09-16: carashell.se/en/…?country=US svarar 301 dit,
// och carashell.com/products/termoskyddet visar $99 / $124 i USD). Länken pekas dit direkt.
const LANK = 'https://carashell.com/products/termoskyddet';

const copy = JSON.parse(readFileSync(join(HAR, 'adcopy-US.json'), 'utf8'));
const dubb = existsSync(join(HAR, 'resultat-dubb.json')) ? JSON.parse(readFileSync(join(HAR, 'resultat-dubb.json'), 'utf8')) : {};
const ORDNING = [
  ['CS', ['CS_1', 'CS_2', 'CS_3', 'CS_2_1']],
  ['SP', ['SP_1', 'SP_2', 'SP_3', 'SP_2_1']],
  ['PD', ['PD_1', 'PD_2', 'PD_3', 'PD_2_1']],
  ['G', ['G_1', 'G_2', 'G_3', 'G_2_1']],
];
const resultat = existsSync(join(HAR, 'resultat-meta.json')) ? JSON.parse(readFileSync(join(HAR, 'resultat-meta.json'), 'utf8')) : {};

for (const [vinkel, kort] of ORDNING) {
  const c = copy[vinkel];
  if (!c?.message || !c?.headline) { console.log(`${vinkel}: copy saknas i adcopy-US.json`); continue; }
  for (const k of kort) {
    if (BARA && !BARA.includes(k)) continue;
    const mal = `CaraShellFront_US_${k}`;
    if (resultat[mal]?.ok && resultat[mal]?.annons?.id && !TORR) { console.log(`${mal}: redan uppladdad (${resultat[mal].annons.id})`); continue; }
    const arBild = /_\d+_\d+$/.test(k);
    const fil = join(HAR, 'us', `${mal}.${arBild ? 'png' : 'mp4'}`);
    if (!arBild && dubb[mal]?.status !== 'OK') { resultat[mal] = { ok: false, hoppad: `dubben är inte OK (${dubb[mal]?.status ?? 'saknas'})` }; console.log(`${mal}: hoppad — dubben inte OK`); continue; }
    if (!existsSync(fil)) { resultat[mal] = { ok: false, hoppad: `filen saknas: ${fil}` }; console.log(`${mal}: hoppad — fil saknas`); continue; }
    const argv = ['node', join(ROT, 'tools', 'ops-till-meta.mjs'), NYCKEL, '--marknad', MARKNAD, '--kampanj', KAMPANJ,
      '--namn', mal, '--fil', fil, '--primar', c.message, '--rubrik', c.headline, '--lank', LANK, '--json'];
    if (c.description) argv.push('--beskrivning', c.description);
    if (TORR) argv.push('--torr');
    console.log(`\n=== ${mal} (${arBild ? 'bild' : 'video'}, vinkel ${vinkel})${TORR ? ' [TORR]' : ''}`);
    const r = spawnSync(argv[0], argv.slice(1), { encoding: 'utf8', maxBuffer: 1 << 26, env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
    const sista = (r.stdout || '').trim().split('\n').at(-1);
    let json = null;
    try { json = JSON.parse(sista); } catch { json = { ok: false, fel: (r.stderr || r.stdout || '').slice(-600) }; }
    if (!json.ok) console.log(`   ✗ ${json.fel}\n${(r.stderr || '').split('\n').slice(-6).join('\n')}`);
    else console.log(`   ✓ ${json.annons?.status ?? json.annons?.status} · adset ${json.adset?.namn} (${json.adset?.id}) · ad ${json.annons?.id ?? '(torr)'} · länk ${json.lank}`);
    resultat[mal] = { ...json, vinkel, typ: arBild ? 'bild' : 'video', fil: `us/${mal}.${arBild ? 'png' : 'mp4'}`, tid: new Date().toISOString() };
    if (!TORR) writeFileSync(join(HAR, 'resultat-meta.json'), JSON.stringify(resultat, null, 2));
  }
}
if (!TORR) writeFileSync(join(HAR, 'resultat-meta.json'), JSON.stringify(resultat, null, 2));
const ok = Object.values(resultat).filter((r) => r.ok).length;
const fel = Object.entries(resultat).filter(([, r]) => !r.ok);
console.log(`\n${TORR ? 'Torrkörning' : 'Uppladdning'}: ${ok} ok, ${fel.length} inte${fel.length ? `: ${fel.map(([n, r]) => `${n} (${r.hoppad ?? r.fel})`).join(' · ')}` : ''}`);
