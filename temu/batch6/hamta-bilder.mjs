// Hämtar huvudbilden per produkt. Temu ger bara ut den med mobil-UA i molnet.
import { lasOffert, renUrl, mappnamn } from '/home/user/yognftnfgn/temu/offert.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
mkdirSync('/tmp/fix/b6/hamtat', { recursive: true });
const p = lasOffert(readFileSync('/tmp/fix/b6/offert.csv', 'utf8')).filter((x) => x.harQuote);
const ut = {};
for (const x of p) {
  const u = renUrl(x.temu), nyckel = mappnamn(x.namn);
  try {
    const r = await fetch(u, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(30000) });
    const h = await r.text();
    const alla = [...new Set(h.match(/img\.kwcdn\.com\/[^"'\\ )]+/g) || [])].map((s) => 'https://' + s);
    const goods = alla.filter((s) => /product\/(open|fancy)\//.test(s));
    // fiskehornan är en Shopify-butik — plocka cdn.shopify-bilder i stället
    const shop = [...new Set(h.match(/cdn\.shopify\.com\/s\/files\/[^"'\\ )?]+\.(?:jpg|png|jpeg|webp)/g) || [])].map((s) => 'https://' + s);
    ut[nyckel] = { namn: x.namn, url: u, goods, shop: shop.slice(0, 12), totalt: alla.length };
    console.log(`${nyckel.padEnd(40)} ${r.status}  goods:${goods.length}  shopify:${shop.length}`);
  } catch (e) { console.log(`${nyckel.padEnd(40)} FEL ${e.message}`); ut[nyckel] = { namn: x.namn, url: u, goods: [], shop: [], fel: e.message }; }
}
writeFileSync('/tmp/fix/b6/bild-kallor.json', JSON.stringify(ut, null, 1));
