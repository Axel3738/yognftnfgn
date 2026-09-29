// Bygger batch.json + laddar hem SE-källvideorna ur jobb.json (Fas 4, steg 1).
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const DIR = new URL('.', import.meta.url).pathname.replace(/\/$/, '');
const jobb = JSON.parse(readFileSync(path.join(DIR, 'jobb.json'), 'utf8'));

// SE-prefix → slug (mappnamn i batchen). Produktnamn/länk/pris tas ur jobbraden.
const SLUG = { IBC: 'ibctank', Sotarset: 'feiesett', Takoverdrag: 'takovertrekk' };

const batch = {};
const attHamta = [];
for (const rad of jobb.jobb) {
  if (rad.status !== 'KÖR') continue;
  if (rad.se?.media?.typ !== 'video') continue;
  const sePrefix = rad.namn.split('_')[0];
  const slug = SLUG[sePrefix];
  if (!slug) throw new Error(`Ingen slug för SE-prefixet ${sePrefix} (${rad.namn}) — lägg in den.`);
  // Målnamnet är <NOprefix>_NO_<rest>; videonyckeln är resten efter _NO_
  const mal = rad.mal?.annonsNamn;
  if (!mal) throw new Error(`Rad ${rad.namn} saknar mal.annonsNamn i jobbfilen`);
  const nyckel = mal.split('_NO_')[1];
  if (!nyckel) throw new Error(`Målnamnet ${mal} följer inte <prefix>_NO_<rest>`);
  batch[slug] ??= {
    produkt: rad.mal.prefix,
    link: rad.mal.link,
    pris_nok: Number(rad.pris.pris),
    jamforpris_nok: Number(rad.pris.jamforpris),
    videos: {},
  };
  batch[slug].videos[nyckel] = `meta:${rad.se.media.video_id}`;
  attHamta.push({ slug, nyckel, url: rad.se.media.url, se: rad.namn, mal });
}

writeFileSync(path.join(DIR, 'batch.json'), JSON.stringify(batch, null, 1) + '\n');
console.log(`batch.json: ${Object.keys(batch).length} produkter, ${attHamta.length} videor`);

for (const v of attHamta) {
  const upp = path.join(DIR, v.slug, 'up');
  mkdirSync(upp, { recursive: true });
  const fil = path.join(upp, `${v.nyckel}.mp4`);
  if (existsSync(fil) && statSync(fil).size > 10000) { console.log(`  ✓ finns ${v.slug}/${v.nyckel}.mp4`); continue; }
  if (!v.url) { console.log(`  ✗ ${v.se}: ingen käll-URL i jobbfilen`); continue; }
  execFileSync('curl', ['-sSL', '--max-time', '300', '-o', fil, v.url], { stdio: 'inherit' });
  const mb = (statSync(fil).size / 1048576).toFixed(1);
  console.log(`  ↓ ${v.slug}/${v.nyckel}.mp4  ${mb} MB   (SE ${v.se} → ${v.mal})`);
}
