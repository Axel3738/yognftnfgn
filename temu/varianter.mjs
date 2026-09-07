// Hämtar all variantbärande information som Temu faktiskt lämnar ut utan inloggning:
// JSON-LD (strukturerad data för Google), og-taggar, titel och nyckelord.
// Körs: node temu/varianter.mjs <goods_id> [<goods_id> ...]
//   eller: node temu/varianter.mjs --fil <fil-med-url-per-rad>

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

async function hamta(url) {
  const svar = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'sv-SE,sv;q=0.9',
    },
    redirect: 'follow',
  });
  return svar.text();
}

function meta(html, namn) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${namn}["'][^>]+content=["']([^"']*)["']`,
    'i'
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${namn}["']`,
    'i'
  );
  return (html.match(re) || html.match(alt) || [])[1] || null;
}

// JSON-LD är det enda ställe där sajter brukar lägga varianter läsbart för Google.
function jsonLd(html) {
  const ut = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      ut.push(JSON.parse(m[1].trim()));
    } catch {
      ut.push({ _oparsbar: m[1].slice(0, 300) });
    }
  }
  return ut;
}

// Plockar ut det som liknar variantinfo ur fritext: storlekar, färger, modeller.
function variantsignaler(text) {
  if (!text) return {};
  const t = text.toLowerCase();
  const fynd = {};

  const storlekar = [...t.matchAll(/\b(3[5-9]|4[0-9]|5[0-2])\b/g)].map((m) => m[1]);
  if (storlekar.length >= 2) fynd.mojliga_storlekar = [...new Set(storlekar)].sort();

  const bokstavsstorlek = [...t.matchAll(/\b(xs|s|m|l|xl|2xl|3xl|4xl|5xl)\b/g)].map((m) => m[1]);
  if (bokstavsstorlek.length >= 2) fynd.mojliga_bokstavsstorlekar = [...new Set(bokstavsstorlek)];

  const farger = [
    'svart', 'vit', 'grå', 'grå', 'blå', 'röd', 'grön', 'gul', 'beige',
    'brun', 'rosa', 'lila', 'orange', 'marinblå', 'kamouflage', 'silver', 'guld',
  ].filter((f) => t.includes(f));
  if (farger.length) fynd.namnda_farger = farger;

  const iphone = [...t.matchAll(/iphone\s*(\d{1,2}\s*(?:pro max|pro|plus|air|e)?)/g)].map((m) =>
    m[1].trim()
  );
  if (iphone.length) fynd.iphone_modeller = [...new Set(iphone)];

  if (/en mängd färger|flera färger|olika färger/.test(t)) fynd.flagga = 'sidan säger "flera färger" utan att lista dem';

  return fynd;
}

const args = process.argv.slice(2);
const urls = args.map((a) => (/^\d+$/.test(a) ? `https://www.temu.com/se/g-${a}.html` : a));

const rader = [];
for (const url of urls) {
  const html = await hamta(url);
  const titel = meta(html, 'og:title') || (html.match(/<title>(.*?)<\/title>/is) || [])[1] || null;
  const beskrivning = meta(html, 'og:description');
  const ld = jsonLd(html);

  rader.push({
    url,
    goods_id: (url.match(/-g-(\d+)\.html|g-(\d+)\.html/) || []).slice(1).find(Boolean) || null,
    titel,
    beskrivning,
    json_ld_antal: ld.length,
    json_ld: ld,
    signaler_titel: variantsignaler(titel),
    signaler_beskrivning: variantsignaler(beskrivning),
  });
}

console.log(JSON.stringify(rader, null, 2));
