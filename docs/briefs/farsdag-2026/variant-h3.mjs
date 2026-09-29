// FD_1_H3 = samma omklipp som FD_1_H1 eller FD_1_H2 med EN ändring: hookraden
// (rad 1:s repliken, VO och caption) blir "presenten han faktiskt använder" —
// samma rad som bildvarianten FD_2_2 (copy/rubriker-FD_2_2.json, sonnet
// 2026-09-29). Basen är den hook vars bild redan visar handlingen i raden;
// bild, effekt och rad 2–4 står kvar ordagrant, så H3 mot basen läser radens
// effekt och inget annat.
//
//   node docs/briefs/farsdag-2026/variant-h3.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const HAR = new URL('.', import.meta.url).pathname;
const rubriker = JSON.parse(readFileSync(`${HAR}copy/rubriker-FD_2_2.json`, 'utf8'));

// Basen per produkt: den hook vars första bild visar det raden säger.
const BAS = {
  Batmotor: 'H1',        // mannen drar skyddet över motorn
  Beltgrinder: 'H1',     // kniven mot bandet, gnistor
  Golfkalender: 'H2',    // de öppnade luckorna
  IBC: 'H1',             // mannen vid det övertäckta tanken
  Inomhustofflor: 'H2',  // foten glider in i tofflan
  Rodholder: 'H2',       // hållaren med spöna i båten
  Solcellslampa: 'H1',   // mannen vid lampan han satt upp
  Sotarset: 'H2',        // borsten ut ur röret, sotmolnet
  Takoverdrag: 'H2',     // skyddet ligger på taket
  Taljset: 'H2',         // mannen täljer vid bordet
  Termoskydd: 'H2',      // mannen kliver bak från den täckta rutan
};

const BEVIS = 'Hook variant of NAMNBAS, Axel\'s order 2026-09-29: "fars dag-presenten som de faktiskt vill ha eller faktiskt kommer att använda … de var riktigt nice". '
  + 'The angle is proven in this account: Takoverdrag_GT_2_H1, the gift video where a wife says "gav jag något han faktiskt använder. Varje vinter." '
  + '(Meta ad 120250147364200291: 8 182 kr, 30 purchases, ROAS 4.24, profit contribution 13 124 kr, MagiBorsten last 30 days, read 2026-09-28). '
  + 'The hook line is the same line as the static NAMN22, so the angle is tested in both formats. '
  + 'Only the hook line changes against NAMNBAS (old line: "GAMMAL"); its picture, its effect and rows 2 to 4 are the same, so H3 against NAMNBAS reads the line\'s effect directly. ';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

for (const [prod, bas] of Object.entries(BAS)) {
  const r = rubriker[`${prod}_FD_2_2`];
  const namnBas = `${prod}_FD_1_${bas}`;
  const namn = `${prod}_FD_1_H3`;
  let b = readFileSync(`${HAR}${namnBas}/brief.md`, 'utf8');
  const gammal = b.match(/^\| 1 \| 0:00–0:0\d \| ([^|]+?) \|/m)[1];
  const fore = b;
  b = b.replace(new RegExp(`^# ${esc(namnBas)} — (.*), hook ${bas}$`, 'm'), `# ${namn} — $1, hook H3 (the gift he actually uses)`);
  // hooktabellen: bara H3, arkivraderna hör till basens hook
  b = b.replace(new RegExp(`^\\| ${bas} \\(this ad\\) \\| ${esc(gammal)} \\| [^|]+ \\|$`, 'm'), `| H3 (this ad) | ${r.rubrik} | ${r.engelska} |`);
  b = b.replace(/^\| archive \|.*\n/gm, '');
  // manusraden, testet och regiraden (repliken + skärmtexten)
  b = b.replace(new RegExp(`^(\\| 1 \\| 0:00–0:0\\d \\| )${esc(gammal)} \\| [^|]+ \\|$`, 'm'), `$1${r.rubrik} | ${r.engelska} |`);
  b = b.replace(new RegExp(`^\\| ${esc(gammal)} \\|.*$`, 'm'), `| ${r.rubrik} | ✅ | ✅ | ❌ | Keep |`);
  b = b.replace(new RegExp(`^(\\| 1 \\| 0:00–0:0\\d \\| )${esc(gammal)}( \\| VO \\| )${esc(gammal)}( \\|)`, 'm'), `$1${r.rubrik}$2${r.rubrik}$3`);
  if (b.includes(`| ${gammal} |`) || b === fore) throw new Error(`${namn}: gamla hooken står kvar`);
  if (!b.includes(`| H3 (this ad) | ${r.rubrik} |`)) throw new Error(`${namn}: hooktabellen byttes inte`);
  // varför, taggar, isolerad variabel
  b = b.replace(/^\*\*Why:\*\* /m, `**Why:** ${BEVIS.replaceAll('NAMNBAS', namnBas).replace('NAMN22', `${prod}_FD_2_2`).replace('GAMMAL', gammal)}`);
  b = b.replace(/hook-typ=[^ ·]+/, 'hook-typ=faktiskt-anvander');
  b = b.replace(/^\*\*Isolated variable:\*\* .*$/m, `**Isolated variable:** the hook line (against ${namnBas}).`);
  mkdirSync(`${HAR}${namn}`, { recursive: true });
  writeFileSync(`${HAR}${namn}/brief.md`, b);
  console.log('✓', namn, `(bas ${bas})`, '←', r.rubrik);
}
