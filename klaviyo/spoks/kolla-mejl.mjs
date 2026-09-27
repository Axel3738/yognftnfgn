// Copykontrollen för enskilda innehållsfiler, utan att skriva payload eller plan.
//
//   node klaviyo/spoks/kolla-mejl.mjs --brand carashell klaviyo/innehall/carashell/kampanjer/sv/k09-black-week-trappan.json [...]
//
// Samma regler som konvertera.mjs (kontrollera()), men bara för de filer som anges —
// så att flera copyskrivare kan kontrollera sina egna mejl samtidigt utan att
// konverteraren skriver över samma payload- och planfiler. Exit 1 vid copyfel.

import fs from 'node:fs';
import { skapaKonverterare, lasBrand } from './konvertera.mjs';

const i = process.argv.indexOf('--brand');
const brandId = i >= 0 ? process.argv[i + 1] : 'baverbutiken';
const filer = process.argv.slice(2).filter((a, j, all) => a !== '--brand' && all[j - 1] !== '--brand');
const K = skapaKonverterare({ brand: lasBrand(brandId), produktIds: {}, recCache: {}, erbjudande: null });
let fel = 0;
for (const f of filer) {
  const d = JSON.parse(fs.readFileSync(f, 'utf8'));
  const m = d.mejl ?? d;
  const lista = K.kontrollera({ ...m, id: m.id ?? d.id });
  const ofyllt = JSON.stringify(d).includes('__COPY__') ? ['ofylld copy (__COPY__) någonstans i filen'] : [];
  const alla = [...lista, ...ofyllt];
  console.log(`${f}: ${alla.length ? `${alla.length} fel` : 'OK'}`);
  for (const x of alla) console.log(`  ${x}`);
  fel += alla.length;
}
process.exit(fel ? 1 : 0);
