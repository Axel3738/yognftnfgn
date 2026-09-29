// FD_2_2 = FD_2_1 med EN ändring: rubriken (vinkeln "presenten han faktiskt använder").
// Läser rubrikerna ur copy/rubriker-FD_2_2.json (skrivna av sonnet 2026-09-29) och skriver
// docs/briefs/farsdag-2026/<Namn>_FD_2_2/brief.md. Allt annat i briefen står kvar.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const HAR = new URL('.', import.meta.url).pathname;
const REPO = HAR.replace(/\/$/, '');
const rubriker = JSON.parse(readFileSync(`${HAR}copy/rubriker-FD_2_2.json`, 'utf8'));

const BEVIS = 'Headline variant of NAMN21, Axel\'s order 2026-09-29: "fars dag-presenten som de faktiskt vill ha eller faktiskt kommer att använda … de var riktigt nice". '
  + 'The angle is proven in this account: Takoverdrag_GT_2_H1, the gift video where a wife says "gav jag något han faktiskt använder. Varje vinter." '
  + '(Meta ad 120250147364200291: 8 182 kr, 30 purchases, ROAS 4.24, profit contribution 13 124 kr, MagiBorsten last 30 days, read 2026-09-28), '
  + 'mirrored as "Presenten han faktiskt blir glad för." (CaraShellRoof_GT) and "The RV gift they\'ll actually use" (CaraShell US). '
  + 'Only the headline changes against NAMN21 (old headline: "GAMMAL"); badge, sub-line, photo, price band and bottom line are the same pixels, so the two statics read the headline\'s effect directly. ';

for (const [namn, r] of Object.entries(rubriker)) {
  const k = namn.replace(/_FD_2_2$/, '');
  const namn21 = `${k}_FD_2_1`;
  let b = readFileSync(`${REPO}/${namn21}/brief.md`, 'utf8');
  const gammal = b.match(/^\| Headline \|[^|]+\| ([^|]+?) \|/m)[1];
  const byt = (fran, till) => {
    if (!b.includes(fran)) throw new Error(`${namn}: hittar inte "${fran.slice(0, 60)}"`);
    b = b.split(fran).join(till);
  };
  // rubriken i titel, hooktabell, testet och designbriefen
  byt(`# ${namn21} — `, `# ${namn} — headline variant (the gift he actually uses) · `);
  byt(`| H1 (use this) | ${gammal} |`, `| H1 (use this) | ${r.rubrik} |`);
  b = b.replace(/^(\| H1 \(use this\) \| [^|]+\| )([^|]+?)( \|)$/m, `$1${r.engelska}$3`);
  b = b.replace(new RegExp(`^\\| ${gammal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\|.*$`, 'm'),
    `| ${r.rubrik} | ${r.test.vis} | ${r.test.fals} | ${r.test.konk} | Keep |`);
  b = b.replace(/^(\| Headline \|[^|]+\| )([^|]+?)( \| )([^|]+?)( \|)$/m, `$1${r.rubrik}$3${r.engelska}$5`);
  if (b.includes(`| ${gammal} |`)) throw new Error(`${namn}: gamla rubriken står kvar`);
  // varför, taggar, isolerad variabel
  b = b.replace(/^\*\*Why:\*\* /m, `**Why:** ${BEVIS.replaceAll('NAMN21', namn21).replace('GAMMAL', gammal)}`);
  b = b.replace('iteration=0', 'iteration=1').replace('hook-typ=fars-dag-present', 'hook-typ=faktiskt-anvander');
  b = b.replace(/^\*\*Isolated variable:\*\* .*$/m, `**Isolated variable:** the headline, against ${namn21}.`);
  mkdirSync(`${REPO}/${namn}`, { recursive: true });
  writeFileSync(`${REPO}/${namn}/brief.md`, b);
  console.log('✓', namn, '←', r.rubrik);
}
