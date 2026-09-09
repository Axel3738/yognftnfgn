#!/usr/bin/env node
// sjalvtest.mjs — kör ALLA kontroller som går att köra utan att röra en
// riktig butik eller ett riktigt annonskonto, och säger grönt eller rött.
//
//   npm run sjalvtest          (från repo-roten)
//   node factory/sjalvtest.mjs
//   node factory/sjalvtest.mjs --snabb    hoppar över dry-run mot butikerna
//
// Varför filen finns (Axels fråga 2026-09-09: "jag vill testa allting också"):
// fabriken har 99 moduler och ~700 tester utspridda över flera kommandon. Utan
// ETT kommando blir "har vi testat?" en bedömning i stället för en mätning.
//
// TVÅ REGLER, och de är hela poängen:
//
//   1. En kontroll som inte KAN köras rapporteras som HOPPAD med orsak —
//      aldrig som grön. Saknas META_ACCESS_TOKEN står det, och raden räknas
//      inte som godkänd. (Det är samma fel som gav "14 gröna, 0 fel" på en
//      butik som hette My Store 3: en kontroll som inte kördes såg ut att ha
//      lyckats.)
//   2. Självtestet rör ALDRIG nätet. Det bevisar att koden håller ihop —
//      inte att en butik ser rätt ut för kunden. Det senare kräver
//      `factory/kundvy-kor.mjs` mot riktig HTML, och en människa i en
//      webbläsare för varukorgen.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { join, dirname, basename } from 'node:path';

const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
const SNABB = process.argv.includes('--snabb');

const GRON = '✅';
const ROD = '❌';
const HOPPAD = '⚠️ ';

const resultat = [];

function kor(namn, kommando, argv, { godkant = (r) => r.status === 0 } = {}) {
  const r = spawnSync(kommando, argv, { cwd: ROT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const ut = `${r.stdout || ''}${r.stderr || ''}`;
  const ok = godkant(r, ut);
  resultat.push({ namn, ok, ut, kod: r.status });
  console.log(`${ok ? GRON : ROD} ${namn}`);
  if (!ok) {
    const rader = ut.trim().split('\n').filter(Boolean);
    for (const rad of rader.slice(-12)) console.log(`      ${rad}`);
  }
  return ok;
}

function hoppa(namn, orsak) {
  resultat.push({ namn, hoppad: true, orsak });
  console.log(`${HOPPAD}${namn}`);
  console.log(`      hoppad: ${orsak}`);
}

/** Antal tester ur node:test-utskriften — så raden säger något, inte bara "ok". */
function antalTester(ut) {
  const p = ut.match(/^# pass (\d+)/m);
  const f = ut.match(/^# fail (\d+)/m);
  return p && f ? { pass: Number(p[1]), fail: Number(f[1]) } : null;
}

console.log('\nSJÄLVTEST — allt som går att mäta utan att röra en butik\n');

// ---------------------------------------------------------------- 1. testerna

const testfiler = readdirSync(join(ROT, 'factory', 'test')).filter((f) => f.endsWith('.test.mjs'));
kor(
  `Fabrikens tester (${testfiler.length} filer)`,
  'node',
  ['--test', ...testfiler.map((f) => `factory/test/${f}`)],
  {
    godkant: (r, ut) => {
      const n = antalTester(ut);
      if (n) console.log(`      ${n.pass} gröna, ${n.fail} röda`);
      return r.status === 0 && n && n.fail === 0;
    },
  }
);

kor('Redigerarpanelens tester', 'npm', ['test', '--silent'], {
  godkant: (r, ut) => {
    const n = antalTester(ut);
    if (n) console.log(`      ${n.pass} gröna, ${n.fail} röda`);
    return r.status === 0 && n && n.fail === 0;
  },
});

// ---------------------------------------------------------------- 2. koden går att läsa

const moduler = readdirSync(join(ROT, 'factory'))
  .filter((f) => f.endsWith('.mjs'))
  .map((f) => `factory/${f}`);
kor(`Varje modul går att tolka (${moduler.length} filer)`, 'bash', [
  '-c',
  `for f in ${moduler.join(' ')}; do node --check "$f" || exit 1; done`,
]);

// ---------------------------------------------------------------- 3. importerna

// Varje `import { x } from './y.mjs'` ska peka på något som finns. En trasig
// import syns annars först när steget körs skarpt mot en riktig butik.
kor('Alla importer pekar på något som finns', 'node', ['-e', IMPORTKOLL()]);

// ---------------------------------------------------------------- 4. konfigen

const butiker = readdirSync(join(ROT, 'factory', 'butiker')).filter((f) => f.endsWith('.yaml'));
const produkter = readdirSync(join(ROT, 'factory', 'produkter')).filter((f) => f.endsWith('.yaml'));
console.log(`\n  ${butiker.length} butiker, ${produkter.length} produkter i konfigen\n`);

if (SNABB) {
  hoppa('Butikerna byggs igenom torrt', 'kördes med --snabb');
} else {
  // En dry-run rör aldrig Shopify men går igenom HELA steglistan: konfigen
  // valideras, planen byggs, varje steg säger vad det skulle göra.
  for (const b of butiker) {
    const butiksId = basename(b, '.yaml');
    const mina = produkter
      .map((p) => join(ROT, 'factory', 'produkter', p))
      .filter((p) => hörTill(p, butiksId));
    if (mina.length === 0) {
      hoppa(`Butiken ${butiksId} byggs igenom torrt`, 'ingen produktfil hör till butiken');
      continue;
    }
    kor(
      `Butiken ${butiksId} byggs igenom torrt (${mina.length} produkt${mina.length > 1 ? 'er' : ''})`,
      'node',
      ['factory/ops.mjs', `factory/butiker/${b}`, ...mina, '--dry-run']
    );
  }
}

/** Hör produktfilen till butiken? State-filen är facit; annars butikens id i filnamnet. */
function hörTill(produktfil, butiksId) {
  const produktId = basename(produktfil, '.yaml');
  const stateMapp = join(ROT, 'factory', 'state');
  if (existsSync(stateMapp)) {
    const träff = readdirSync(stateMapp).find((f) => f === `${butiksId}--${produktId}.json`);
    if (träff) return true;
    // Har produkten en state-fil för en ANNAN butik hör den inte hit.
    if (readdirSync(stateMapp).some((f) => f.endsWith(`--${produktId}.json`))) return false;
  }
  return produktId.startsWith(butiksId);
}

// ---------------------------------------------------------------- 5. temat

// Bas-temat är exporterat från Matstrumpor. Skanningen ska vara ren efter
// av-brandningen — annars går källbutikens text ut i kundens vy.
// Den här raden är hela skillnaden mellan "av-brandningen städar" och "det
// finns inget att städa". Så länge källan var smutsig räckte det att ETT bygge
// avbröts före av-brandningen för att en butik skulle gå live med en annan
// firmas popup. (Axel 2026-09-09 om TackleBay: "Matstrumpor email popup är
// liksom kvar samt cookie förfrågan, det är verkligen horribelt.")
kor('Bas-temat är rent vid källan', 'node', [
  '-e',
  `Promise.all([import('./factory/kallskanning.mjs'), import('node:child_process'), import('node:fs'), import('node:os'), import('node:path')])
     .then(([k, cp, fs, os, path]) => {
       const mapp = fs.mkdtempSync(path.join(os.tmpdir(), 'sjalvtest-tema-'));
       try {
         cp.execFileSync('unzip', ['-o', '-q', 'factory/tema/ops-tema.zip', '-d', mapp]);
         const filer = {};
         const ga = (d) => { for (const n of fs.readdirSync(d, { withFileTypes: true })) {
           const f = path.join(d, n.name);
           if (n.isDirectory()) ga(f);
           else if (!/\\.(png|jpg|jpeg|gif|webp|svg|woff2?|eot|ttf|mp4|ico)$/i.test(f)) filer[path.relative(mapp, f)] = fs.readFileSync(f, 'utf8');
         } };
         ga(mapp);
         const r = k.skannaTema(filer);
         if (r.traffar.length) { console.error(k.rapport(r)); process.exit(1); }
         const footer = JSON.parse(filer['sections/footer-group.json']);
         if (JSON.stringify(footer.order) !== JSON.stringify(['footer'])) {
           console.error('sidfoten renderar mer än footer: ' + JSON.stringify(footer.order)); process.exit(1);
         }
       } finally { fs.rmSync(mapp, { recursive: true, force: true }); }
     })`,
]);

kor('Källskanningen känner igen Matstrumpor-texten', 'node', [
  '-e',
  `import('./factory/kallskanning.mjs').then(m => {
     const t = m.skannaFil('templates/index.json', 'kundsupport@matstrumpor.se');
     if (!t.length) { console.error('skanningen hittade INTE en känd källtext'); process.exit(1); }
     const r = m.skannaFil('templates/index.json', 'hello@tacklebay.se');
     if (r.length) { console.error('skanningen larmar på ren text'); process.exit(1); }
   })`,
]);

// ---------------------------------------------------------------- 6. spärrarna

kor('Räkningen vägrar säga klart utan siffror', 'node', [
  '-e',
  `import('./factory/rakning.mjs').then(m => {
     const r = m.byggRakning({ kallor: null, uppladdade: null, marknad: 'NO' });
     if (r.klart) { console.error('en oläst marknad rapporterades som KLART'); process.exit(1); }
     const b = m.byggRakning({
       kallor: Array.from({length: 33}, (_, i) => ({ annons: 'A' + i, dom: 'ren', marknad: 'NO', status: 'ACTIVE' })),
       uppladdade: Array.from({length: 10}, (_, i) => ({ namn: 'X_NO_A' + i, kampanj: 'X_NO_1', marknad: 'NO' })),
       marknad: 'NO',
     });
     if (b.klart) { console.error('10 av 33 rapporterades som KLART'); process.exit(1); }
   })`,
]);

kor('En annons med fel villkor kan inte bli "ren"', 'node', [
  '-e',
  `import('./factory/brand-detektor.mjs').then(m => {
     const rent = { tillämplig: true, träff: false, fynd: [] };
     const fel = [{ regel: 'fraktgräns', yta: 'copy', rad: 'Fri frakt över 300 kr', fel: 'butiken har fri frakt utan gräns' }];
     const utan = m.klassa({ copy: rent, tal: rent, inbränd: rent, bild: rent, villkorsfel: [] });
     const med  = m.klassa({ copy: rent, tal: rent, inbränd: rent, bild: rent, villkorsfel: fel });
     if (utan !== 'ren') { console.error('en ren annons dömdes felaktigt'); process.exit(1); }
     if (med === 'ren') { console.error('en annons med fel fraktvillkor fick domen ren'); process.exit(1); }
   })`,
]);

kor('Kadensen: 7 videor per dag, halva nya koncept', 'node', [
  '-e',
  `import('./factory/kadens.mjs').then(m => {
     const k = m.byggKadens({ antalPerDag: 7, dagar: 3, vinnare: [{ namn: 'PD_1_H3' }], koncept: [] });
     const summa = k.varianter.length + k.nyaKoncept.length;
     if (k.total !== 21 || summa !== 21) {
       console.error('7 per dag i 3 dagar gav ' + k.total + ' (' + summa + ' rader), inte 21'); process.exit(1);
     }
     // Halva och halva, och den udda platsen till varianterna — varianter
     // itererar på bevisad vinst, nya koncept kräver var sin källa.
     if (Math.abs(k.varianter.length - k.nyaKoncept.length) !== 1) {
       console.error('halvorna är inte jämnt delade: ' + k.varianter.length + '/' + k.nyaKoncept.length); process.exit(1);
     }
     if (k.fordelning.extraTill !== 'varianter') { console.error('den udda platsen gick inte till varianterna'); process.exit(1); }
     // Varje variant ska peka på VILKEN vinnare den itererar och VILKEN
     // variabel som ändras — annars är den ett nytt koncept, inte en variant.
     for (const v of k.varianter) {
       if (!v.foralder || !v.variabel) { console.error('en variant saknar förälder eller variabel'); process.exit(1); }
     }
     // Utan bevisad vinnare finns inget att iterera på: allt blir koncept.
     const utan = m.byggKadens({ antalPerDag: 7, dagar: 3, vinnare: [], koncept: [] });
     if (utan.varianter.length !== 0) { console.error('varianter byggdes utan en enda vinnare'); process.exit(1); }
   })`,
]);

// ---------------------------------------------------------------- 7. det som INTE går härifrån

console.log('');
const nycklar = [
  ['SHOPIFY_CLIENT_SECRET', 'bygga eller läsa en butik'],
  ['META_ACCESS_TOKEN', 'läsa annonskontot, räkningen skarpt, skalningsronden'],
  ['NOTION_TOKEN', 'lägga briefer i creative-hubben'],
  ['JUDGEME_API_TOKEN', 'importera recensioner'],
];
for (const [nyckel, vad] of nycklar) {
  if (!process.env[nyckel]) hoppa(`Skarpt: ${vad}`, `${nyckel} saknas i miljön`);
}
hoppa('Varukorgen i kundens vy', 'kräver en människa i en webbläsare — tom korg, lägg i varan, räkna varorna');
hoppa('Mobilvyn', 'kräver ett öga i temaredigeraren');

// ---------------------------------------------------------------- summering

function IMPORTKOLL() {
  return `
    const { readFileSync, readdirSync, existsSync } = await import('node:fs');
    const { join, dirname, resolve } = await import('node:path');
    const filer = [];
    const ga = (d) => { for (const n of readdirSync(d, { withFileTypes: true })) {
      if (['node_modules','output','tema'].includes(n.name)) continue;
      const p = join(d, n.name);
      if (n.isDirectory()) ga(p); else if (p.endsWith('.mjs')) filer.push(p);
    } };
    ga('factory');
    const cache = new Map();
    const exporter = (fil) => {
      if (cache.has(fil)) return cache.get(fil);
      const src = readFileSync(fil, 'utf8'); const namn = new Set();
      for (const m of src.matchAll(/^export\\s+(?:async\\s+)?(?:function\\*?|const|let|var|class)\\s+([\\p{L}_$][\\p{L}\\p{N}_$]*)/gmu)) namn.add(m[1]);
      for (const m of src.matchAll(/^export\\s*\\{([^}]*)\\}/gm)) for (const d of m[1].split(',')) {
        const t = d.trim(); if (!t) continue;
        const as = t.match(/^(\\S+)\\s+as\\s+(\\S+)$/); namn.add(as ? as[2] : t);
      }
      if (/^export\\s+default/m.test(src)) namn.add('default');
      cache.set(fil, namn); return namn;
    };
    let fel = 0;
    for (const fil of filer) {
      const src = readFileSync(fil, 'utf8');
      for (const m of src.matchAll(/^import\\s+(?:([\\w$]+)\\s*,?\\s*)?(?:\\{([^}]*)\\})?\\s*from\\s+'(\\.[^']+)'/gm)) {
        const mal = resolve(dirname(fil), m[3]);
        if (!existsSync(mal)) { console.error(fil + ': importerar ' + m[3] + ' som inte finns'); fel++; continue; }
        const exp = exporter(mal);
        for (const d of (m[2] || '').split(',')) {
          const t = d.trim(); if (!t) continue;
          const namn = t.replace(/\\s+as\\s+.*$/, '').trim();
          if (!exp.has(namn)) { console.error(fil + ": '" + namn + "' finns inte i " + m[3]); fel++; }
        }
      }
    }
    if (fel) process.exit(1);
  `;
}

const grona = resultat.filter((r) => r.ok).length;
const roda = resultat.filter((r) => r.ok === false).length;
const hoppade = resultat.filter((r) => r.hoppad).length;

console.log('\n' + '-'.repeat(60));
console.log(`${grona} gröna · ${roda} röda · ${hoppade} hoppade\n`);

if (roda > 0) {
  console.log('RÖTT. Det här går inte att köra skarpt än:');
  for (const r of resultat.filter((x) => x.ok === false)) console.log(`  ${ROD} ${r.namn}`);
  console.log('');
  process.exit(1);
}

console.log('GRÖNT — så långt det går att mäta utan nycklar och utan en webbläsare.');
console.log('De hoppade raderna är INTE godkända. De är otestade, och står här');
console.log('för att en tyst överhoppning är samma sak som ett falskt grönt.\n');
