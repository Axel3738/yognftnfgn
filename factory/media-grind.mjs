// Mediagrinden: dömer CREATIVEN, inte texten. Join brand-ocr + brand-syn mot alla
// 34 svenska källannonser. Allt som bär källbutikens villkor i bild eller ljud
// blockeras — hur ren Meta-texten än är.
import { readFileSync, writeFileSync } from 'node:fs';
const ROT = process.argv[2] || '/home/user/yognftnfgn/factory/output/tankguard';
const ocr = JSON.parse(readFileSync(`${ROT}/brand-ocr.json`, 'utf8'));
const syn = JSON.parse(readFileSync(`${ROT}/brand-syn.json`, 'utf8'));
const kalla = JSON.parse(readFileSync(`${ROT}/kallannonser.json`, 'utf8')).filter(r => r.marknad === 'SE');

// Vad som aldrig får stå i TankGuards annons. Jämförpris, rabatt på enstyck,
// frakt/betal/retur, socialt bevis, påhittad brådska, brandnamn, fel tygspec.
const MÖNSTER = [
  ['jämförpris', /\b636\b|ordinarie\s*pris|ord\.\s*636/i],
  ['rabatt på enstyck', /\b23\s*%|\b25\s*%|\b147\b|halva priset/i],
  ['frakt', /fri\s*frakt|arbetsdag/i],
  ['betalsätt', /klarna|betala sen/i],
  ['öppet köp', /öppet\s*köp|oppet\s*kop|pengarna tillbaka/i],
  ['socialt bevis', /recension|★|⭐|\bav 5\b|hundratals/i],
  ['påhittad brådska', /bara idag|endast idag|lagret|få kvar|innan det är slut|idag endast/i],
  ['brandnamn', /b[aä]v[eo]r|bawe|spave|bab[eo]|vave|baverbutiken/i],
  ['fel tygspec', /220\s*D/i],
];

const rader = [];
for (const a of kalla) {
  const o = (ocr.annonser || {})[a.namn] || null;
  const s = (syn.annonser || {})[a.namn] || null;
  const hö = JSON.stringify(o || {}) + ' ' + JSON.stringify(s || {});
  const fynd = MÖNSTER.filter(([, re]) => re.test(hö)).map(([n]) => n);
  rader.push({ namn: a.namn, kort: a.kort, typ: a.typ, spend: a.spend, köp: a.köp, roas: a.roas, fynd, ocrFanns: Boolean(o) });
}
rader.sort((x, y) => y.spend - x.spend);
writeFileSync(`${ROT}/media-grind.json`, JSON.stringify(rader, null, 2));

const rena = rader.filter(r => !r.fynd.length);
const smutsiga = rader.filter(r => r.fynd.length);
console.log(`RENA CREATIVES: ${rena.length}    SMUTSIGA: ${smutsiga.length}\n`);
console.log('--- RENA (creativen bär inget av källbutikens) ---');
for (const r of rena) console.log(`  ${r.kort.padEnd(10)} ${r.typ.padEnd(6)} ${String(Math.round(r.spend)).padStart(6)} kr ${String(r.köp).padStart(3)} köp`);
console.log('\n--- SMUTSIGA (måste göras om innan de får köras) ---');
for (const r of smutsiga) console.log(`  ${r.kort.padEnd(10)} ${r.typ.padEnd(6)} ${String(Math.round(r.spend)).padStart(6)} kr ${String(r.köp).padStart(3)} köp  →  ${r.fynd.join(', ')}`);
