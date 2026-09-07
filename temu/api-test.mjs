// Testar om Temus interna API lämnar ut variantdata när man först skaffar en
// riktig cookie-session från produktsidan (som en webbläsare gör).
// Körs: node temu/api-test.mjs <goods_id>

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const goodsId = process.argv[2] || '601099516487045';

// Steg 1: hämta startsidan för att få cookies (anti-bot sätter dem här).
const start = await fetch('https://www.temu.com/se', {
  headers: { 'User-Agent': UA, 'Accept-Language': 'sv-SE,sv;q=0.9' },
});
const rawCookies = start.headers.getSetCookie?.() ?? [];
const cookie = rawCookies.map((c) => c.split(';')[0]).join('; ');
console.log('cookies:', rawCookies.length, '→', cookie.slice(0, 120));

const endpoints = [
  ['POST', 'https://www.temu.com/api/oak/integration/render', { goods_id: goodsId, page_name: 'goods' }],
  ['POST', 'https://www.temu.com/api/poppy/v1/goods_detail', { goodsId }],
  ['POST', 'https://www.temu.com/api/oakstar/v1/goods/detail', { goodsId }],
  ['GET', `https://www.temu.com/api/bg/goods/detail?goodsId=${goodsId}`, null],
  ['POST', 'https://www.temu.com/api/oak/goods/detail/sku', { goodsId }],
];

for (const [metod, url, kropp] of endpoints) {
  try {
    const svar = await fetch(url, {
      method: metod,
      headers: {
        'User-Agent': UA,
        'Accept': 'application/json',
        'Accept-Language': 'sv-SE,sv;q=0.9',
        'Content-Type': 'application/json',
        'Origin': 'https://www.temu.com',
        'Referer': `https://www.temu.com/se/g-${goodsId}.html`,
        ...(cookie ? { Cookie: cookie } : {}),
      },
      ...(kropp ? { body: JSON.stringify(kropp) } : {}),
    });
    const text = await svar.text();
    const harSku = /skuList|specName|specValue|skuId/.test(text);
    console.log(
      `${svar.status} ${metod} ${url.replace('https://www.temu.com', '')}`,
      `| ${text.length}b | variantdata: ${harSku ? 'JA' : 'nej'}`
    );
    if (harSku) console.log('  >>>', text.slice(0, 400));
    else if (text.length < 220) console.log('  svar:', text.replace(/\s+/g, ' ').slice(0, 200));
  } catch (fel) {
    console.log(`FEL  ${metod} ${url} → ${fel.message}`);
  }
}
