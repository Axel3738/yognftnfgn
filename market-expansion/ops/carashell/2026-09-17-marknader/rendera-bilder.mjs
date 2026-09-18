#!/usr/bin/env node
// rendera-bilder.mjs — skriver om prisraderna i takskyddets nio bildannonser till
// GB/CA/AU/NZ. Bara de rader som står i bildregioner.json rörs; resten av bilden
// är pixel för pixel originalet.
//   node market-expansion/ops/carashell/2026-09-17-marknader/rendera-bilder.mjs [--marknad NZ] [--bara CS_4_1]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { MARKNADER, KODER } from './marknader.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const val = (f) => { const i = args.indexOf(`--${f}`); return i >= 0 ? args[i + 1] : null; };
const MARKNAD = val('marknad');
const BARA = val('bara');
const regioner = JSON.parse(readFileSync(join(HAR, 'bildregioner.json'), 'utf8'));
const bilder = Object.keys(regioner).filter((k) => !k.startsWith('_'));
const resultat = {};

for (const kod of (MARKNAD ? [MARKNAD] : KODER)) {
  const m = MARKNADER[kod];
  mkdirSync(join(HAR, kod), { recursive: true });
  mkdirSync(join(HAR, 'qa', kod), { recursive: true });
  resultat[kod] = {};
  for (const namn of bilder) {
    if (BARA && !namn.includes(BARA)) continue;
    const fyll = (t) => String(t).replace(/\{pris\}/g, m.pris).replace(/\{jamforpris\}/g, m.jamforpris)
      .replace(/\{spar\}/g, m.spar).replace(/\{land\}/g, m.land);
    const spec = regioner[namn].map((r) => {
      const rad = { region: r.region, text: fyll(r.text), genomstruken: Boolean(r.genomstruken), _etikett: r.etikett };
      if (r.fet !== undefined) rad.fet = r.fet;
      if (r.just) rad.just = r.just;
      if (r.marginal !== undefined) rad.marginal = r.marginal;
      // "{jamforpris_langd}" = stryk exakt jämförprisets tecken, inget mer
      if (r.genomstruken_tecken === '{jamforpris_langd}') rad.genomstruken_tecken = m.jamforpris.length;
      else if (r.genomstruken_tecken) rad.genomstruken_tecken = Number(r.genomstruken_tecken);
      return rad;
    });
    const specfil = join(HAR, kod, `${namn}.spec.json`);
    writeFileSync(specfil, JSON.stringify(spec, null, 1));
    const ut = join(HAR, kod, `${namn}.png`);
    const qa = join(HAR, 'qa', kod, `${namn}.qa.png`);
    const r = spawnSync('python3', [join(HAR, 'byt-text.py'), '--in', join(HAR, 'kalla', `${namn}.png`),
      '--ut', ut, '--spec', specfil, '--qa', qa, '--json'], { encoding: 'utf8' });
    let info = null;
    try { info = JSON.parse((r.stdout || '').trim().split('\n').at(-1)); } catch { info = { fel: (r.stderr || r.stdout || '').slice(-300) }; }
    resultat[kod][namn] = { exit: r.status, ...info, rader_spec: spec.map((s) => `${s._etikett}: ${s.text}`) };
    const krympta = (info?.rader || []).filter((x) => x.krympt).map((x) => x.text);
    console.log(`${kod} ${namn}: exit ${r.status} · ${(info?.rader || []).filter((x) => x.status === 'OK').length}/${spec.length} rader${krympta.length ? ` · krympt: ${krympta.join(', ')}` : ''}${info?.fel ? ` · FEL ${info.fel}` : ''}`);
  }
}
writeFileSync(join(HAR, 'resultat-bilder.json'), JSON.stringify(resultat, null, 2));
const fel = Object.entries(resultat).flatMap(([k, v]) => Object.entries(v).filter(([, r]) => r.exit !== 0).map(([n]) => `${k}/${n}`));
console.log(`\n${fel.length ? `FEL i: ${fel.join(', ')}` : 'Alla bilder renderade utan fel.'}`);
process.exit(fel.length ? 1 : 0);
