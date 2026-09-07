// Undersöker hur mycket produktdata en Temu-produktsida faktiskt lämnar ifrån sig.
// Körs: node temu/analysera.mjs "<temu-länk>"
// Skriver ut bild-URL:er, eventuella variantfält och råa datablock som hittas.

const UA_DESKTOP =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function hamtaHtml(url, ua = UA_DESKTOP) {
  const svar = await fetch(url, {
    headers: {
      'User-Agent': ua,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
    },
    redirect: 'follow',
  });
  return { status: svar.status, html: await svar.text() };
}

// Temu lägger bilderna i vanliga attribut men också inbäddat i JSON-strängar.
function plockaBilder(html) {
  const träffar = html.match(/https:\/\/[a-z]+\.kwcdn\.com\/[^"'\\\s)<>]+/g) || [];
  const rena = träffar.map((u) => u.split('?')[0].replace(/\\u002F/g, '/'));
  return [...new Set(rena)];
}

// Letar efter de fältnamn som skulle bära variantdata om den fanns i svaret.
function letaVariantfalt(html) {
  const nycklar = [
    'skuList', 'sku_list', 'specKey', 'specName', 'specValue', 'specList',
    'skuSpec', 'goodsSpec', 'saleProp', 'specGallery', 'priceStr',
    'minOnSalePrice', 'skuId', 'variantList', 'optionList',
  ];
  const funna = {};
  for (const n of nycklar) {
    const antal = (html.match(new RegExp(n, 'g')) || []).length;
    if (antal) funna[n] = antal;
  }
  return funna;
}

// Temu bäddar ibland in state i <script>-taggar. Vi listar dem för att se om något bär data.
function letaDatablock(html) {
  const block = [];
  const re = /<script[^>]*>([\s\S]{200,}?)<\/script>/g;
  let m;
  while ((m = re.exec(html))) {
    const kropp = m[1];
    if (/goods|sku|price|spec/i.test(kropp)) {
      block.push({ längd: kropp.length, start: kropp.slice(0, 120).replace(/\s+/g, ' ') });
    }
  }
  return block;
}

const url = process.argv[2];
if (!url) {
  console.error('Ange en Temu-länk.');
  process.exit(1);
}

const { status, html } = await hamtaHtml(url);
const bilder = plockaBilder(html);

// Produktbilder ligger under /product/ eller har goods-mönstret; resten är UI-ikoner.
const produktbilder = bilder.filter(
  (u) => /\/(product|goods)\//i.test(u) || /-goods\.(jpg|jpeg|png|webp)$/i.test(u)
);

console.log(JSON.stringify({
  status,
  html_längd: html.length,
  bilder_totalt: bilder.length,
  produktbilder: produktbilder.slice(0, 40),
  alla_bilder: bilder.slice(0, 40),
  variantfält: letaVariantfalt(html),
  datablock: letaDatablock(html).slice(0, 10),
}, null, 2));
