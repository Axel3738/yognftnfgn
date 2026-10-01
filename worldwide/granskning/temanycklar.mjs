// temanycklar.mjs — temats egna texter (ONLINE_STORE_THEME_LOCALE_CONTENT) som saknar översättning
// på något worldwide-språk, med svenskan och engelskan bredvid. Läs-bart.
//
//   node worldwide/granskning/temanycklar.mjs [--ut fil.json]

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasButik, skapaKlient } from '../../sparning/butik.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const W = JSON.parse(readFileSync(join(ROT, '..', 'konfig.json'), 'utf8'));
const a = process.argv.slice(2);
const k = await skapaKlient({ ...lasButik('baverbutiken'), env_suffix: 'SE' });

export async function las(typ = 'ONLINE_STORE_THEME_LOCALE_CONTENT') {
  const per = {};
  let resurs = null;
  for (const l of W.marknad.locales) {
    const d = await k.graphql(`query($t: TranslatableResourceType!, $l: String!) { translatableResources(resourceType: $t, first: 10) { nodes { resourceId translatableContent { key value digest locale } translations(locale: $l) { key value outdated } } } }`, { t: typ, l });
    const n = d.translatableResources.nodes[0];
    resurs = n;
    per[l] = new Map(n.translations.map((t) => [t.key, t]));
  }
  return { resurs, per };
}

const { resurs, per } = await las();
const ut = [];
for (const c of resurs.translatableContent) {
  if (!c.value || typeof c.value !== 'string') continue;
  const saknas = W.marknad.locales.filter((l) => !per[l].get(c.key)?.value || per[l].get(c.key)?.outdated);
  if (!saknas.length) continue;
  ut.push({ key: c.key, sv: c.value, en: per.en.get(c.key)?.value ?? null, digest: c.digest, saknas });
}
console.log(`${resurs.resourceId}: ${resurs.translatableContent.length} nycklar, ${ut.length} saknar översättning på minst ett språk`);
for (const x of ut) console.log(`  ${x.key.padEnd(55)} [${x.saknas.join(',')}] sv="${x.sv.slice(0, 50)}" en="${(x.en ?? '').slice(0, 50)}"`);
if (a.includes('--ut')) writeFileSync(a[a.indexOf('--ut') + 1], JSON.stringify({ resurs: resurs.resourceId, nycklar: ut }, null, 1));
