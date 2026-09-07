// Läser ut Temu-länkarna ur Axels xlsx-lista och parar ihop dem med produktnamnen.
// Körs: node temu/lankar.mjs <fil.xlsx>
// xlsx är en zip med XML inuti; vi läser den utan bibliotek via inbyggda verktyg.

import { execFileSync } from 'node:child_process';

const fil = process.argv[2];
if (!fil) {
  console.error('Ange sökväg till xlsx-filen.');
  process.exit(1);
}

function las(post) {
  return execFileSync('unzip', ['-p', fil, post], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
}

const rels = las('xl/worksheets/_rels/sheet1.xml.rels');
const lankar = new Map();
for (const m of rels.matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
  const url = m[2].replace(/&amp;/g, '&');
  if (url.includes('temu.com')) lankar.set(m[1], url);
}

const resultat = [];
for (const [rId, url] of lankar) {
  const idM = url.match(/-g-(\d+)\.html/);
  // Namnet ligger i slug:en mellan /se/ och -g-<id>; avkoda och städa.
  const slugM = url.match(/temu\.com\/se\/(.*?)-g-\d+\.html/);
  let slug = '';
  try {
    slug = slugM ? decodeURIComponent(slugM[1]).replace(/-+/g, ' ').trim() : '';
  } catch {
    slug = slugM ? slugM[1] : '';
  }
  resultat.push({ rId, goods_id: idM ? idM[1] : null, slug: slug.slice(0, 90), url });
}

resultat.sort((a, b) => Number(a.rId.slice(3)) - Number(b.rId.slice(3)));
console.log(JSON.stringify(resultat, null, 2));
