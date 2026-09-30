// hamta-kallor.mjs — källfilerna (video + bild) för alla annonser i urval.json, ur MagiBorsten.
//
//   node worldwide/annonser/hamta-kallor.mjs                 # till worldwide/annonser/kallor/ (gitignorerad)
//   node worldwide/annonser/hamta-kallor.mjs <mapp>
//
// Källan är den svenska annonsens egen fil: videons `source` (video_id) och bildens url
// (image_hash i act_1867947880635861/adimages). Filerna är ~250 MB och committas aldrig —
// video.mjs och bildrita.mjs läser dem härifrån (--kallor). Befintliga filer hämtas inte igen.
// Läs-bart mot Meta.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, säkerställProxy } from '../../tools/meta-lib.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const U = JSON.parse(readFileSync(join(ROT, '..', 'urval.json'), 'utf8'));
const KALLKONTO = U.konto ?? 'act_1867947880635861';

säkerställProxy();
const ut = process.argv[2] ?? join(ROT, 'kallor');
mkdirSync(ut, { recursive: true });
const logg = {};
let fel = 0;
for (const p of U.produkter) {
  if (p.under) continue;
  for (const a of p.annonser) {
    const fil = join(ut, `${a.namn.replace(/[^\w.-]+/g, '_')}.${a.typ === 'video' ? 'mp4' : 'jpg'}`);
    if (existsSync(fil)) { logg[a.namn] = fil; continue; }
    try {
      let url;
      if (a.typ === 'video') {
        url = (await api(a.video_id, { params: { fields: 'source' } })).source;
      } else {
        const r = await api(`${KALLKONTO}/adimages`, { params: { hashes: JSON.stringify([a.image_hash]), fields: 'hash,url' } });
        url = r.data?.[0]?.url || a.image_url;
      }
      if (!url) throw new Error('ingen källadress');
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status}`);
      writeFileSync(fil, Buffer.from(await res.arrayBuffer()));
      logg[a.namn] = fil;
      console.log(`✓ ${a.namn} (${a.typ})`);
    } catch (e) { fel++; console.log(`✗ ${a.namn}: ${e.message.slice(0, 120)}`); logg[a.namn] = null; }
  }
}
writeFileSync(join(ut, '_kallor.json'), JSON.stringify(logg, null, 1));
console.log(`\n${Object.values(logg).filter(Boolean).length} filer i ${ut}${fel ? `, ${fel} gick inte att hämta` : ''}`);
