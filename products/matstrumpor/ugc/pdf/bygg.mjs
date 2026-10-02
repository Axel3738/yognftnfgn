// Bygger en kreatörs egen PDF-brief ur mallen (Axels krav 2026-10-02: en PDF per kreatör, bara
// hennes videor, inga andra namn, "så enkelt att en tioåring fattar").
//   node products/matstrumpor/ugc/pdf/bygg.mjs Sara [Sofie …]
// playwright finns inte i repots package.json: ta den ur containerns verktyg (/opt/node-tools) som reserv.
const { chromium } = await import('playwright').catch(() => import('/opt/node-tools/node_modules/playwright/index.mjs'));
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const ROT = dirname(fileURLToPath(import.meta.url));
const mall = readFileSync(join(ROT, 'mall-kvinna.html'), 'utf8');
const namn = process.argv.slice(2);
if (!namn.length) { console.error('Ange minst ett namn.'); process.exit(2); }
const b = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium' });
for (const n of namn) {
  const p = await b.newPage();
  await p.setContent(mall.replaceAll('{{NAMN}}', n), { waitUntil: 'load' });
  await p.emulateMedia({ media: 'print', colorScheme: 'light' });
  await p.waitForTimeout(800);
  const ut = join(ROT, `${n}-sushi-sock-briefs.pdf`);
  await p.pdf({ path: ut, format: 'A4', printBackground: true, preferCSSPageSize: true });
  console.log('pdf', ut);
  await p.close();
}
await b.close();
