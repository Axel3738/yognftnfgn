// retursedel/bygg.mjs — retursedeln kunden skriver ut och klistrar på paketet.
// Adressen kommer ur Bäverbutikens brandfil (tvister.returadress) så sedeln
// aldrig kan glida isär från returmejlet. Renderas i Chromium → retursedel.png,
// laddas upp till Shopify Files (Matstrumpors filarkiv, samma väg som
// konkurrentdödarens bevisbilder) med --ladda-upp; URL:en skrivs i
// brandfilernas tvister.retursedel_url för hand. Axels bild 2026-09-29 är förlagan.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
const html = join(HAR, 'retursedel.html');
const png = join(HAR, 'retursedel.png');
const chromium = '/opt/pw-browsers/chromium';
execFileSync(chromium, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--window-size=1200,1200', `--screenshot=${png}`, `file://${html}`], { stdio: 'pipe' });
console.log(`skrev ${png} (${readFileSync(png).length} byte)`);
if (process.argv.includes('--ladda-upp')) {
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  const { tillShopify } = await import('../../matstrumpor/thumbnails.mjs');
  const url = await tillShopify(await skapaKlient(lasButik('matstrumpor')), png, { mime: 'image/png' });
  writeFileSync(join(HAR, 'url.txt'), url + '\n');
  console.log(`uppladdad: ${url}`);
}
