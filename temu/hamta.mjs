// Läser ut det som går att läsa ur en Temu-produktlänk.
//
// VIKTIGT om vad som INTE går (verifierat 2026-08-12):
// Temu renderar produktsidan med JavaScript. Serversvaret innehåller BARA
// og-taggarna — titel, en beskrivningstext och produkt-id. Bilder, pris,
// varianter och lagerstatus hämtas av webbläsaren från ett API som kräver
// inloggning och en anti-bot-token (`NEED_LOGIN` / `request illegal`).
// Chromium/Playwright kan inte heller användas här (åter-verifierat 2026-08-21 med
// riktig Chromium + miljöproxyn — ERR_CONNECTION_RESET även mot example.com;
// proxyn släpper bara igenom verktygsanrop, inte webbläsartrafik): miljön har inget
// nät för webbläsaren (ERR_CONNECTION_RESET även mot example.com).
//
// Därför: titel/beskrivning/id hämtas automatiskt, medan bilder, pris och
// varianter måste komma från Axel. Se temu/README.md.
//
//   node temu/hamta.mjs "https://www.temu.com/se/....html"
//   node temu/hamta.mjs --json "https://www.temu.com/se/g-601100497255951.html"

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/** Plockar ut goods-id:t ur en Temu-länk. Det blir SKU-suffix: TEMU-<id>. */
export function goodsId(url) {
  const m = String(url).match(/-g-(\d{6,})\.html/) || String(url).match(/\bg-(\d{6,})\.html/) ||
    String(url).match(/[?&]goods_id=(\d{6,})/);
  return m ? m[1] : null;
}

function metaInnehall(html, egenskap) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${egenskap}["'][^>]*content=["']([^"']*)["']`,
    'i'
  );
  const alt = new RegExp(
    `<meta[^>]*content=["']([^"']*)["'][^>]+(?:property|name)=["']${egenskap}["']`,
    'i'
  );
  return (html.match(re)?.[1] ?? html.match(alt)?.[1] ?? '').trim();
}

function avkodaEntiteter(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

/** Städar Temus maskinöversatta rubriker: dubbla mellanslag, trasiga ordrester. */
function stada(s) {
  return avkodaEntiteter(s)
    .replace(/\s*-\s*Temu(\s+\w+)?\s*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export async function hamtaTemu(url) {
  const id = goodsId(url);
  const svar = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8' },
    redirect: 'follow',
  });
  if (!svar.ok) throw new Error(`Temu svarade HTTP ${svar.status} på ${url}`);
  const html = await svar.text();

  const rubrik = stada(metaInnehall(html, 'og:title'));
  const beskrivning = stada(metaInnehall(html, 'og:description'));
  const kanonisk = (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] || url).trim();

  // "Handla X på Temu. Upptäck fler bra priser på <kategori>." — kategorin i
  // slutet är Temus egen och är en bra ledtråd för produkttyp.
  const temuKategori = beskrivning.match(/bra priser på ([^.]+)\.?\s*$/i)?.[1]?.trim() || null;
  const raText = beskrivning
    .replace(/^Handla\s+/i, '')
    .replace(/\s*på Temu\..*$/i, '')
    .trim();

  const bristfallig = !rubrik || rubrik.length < 5;

  return {
    kalla: 'temu',
    url,
    kanonisk_url: kanonisk,
    goods_id: id,
    sku: id ? `TEMU-${id}` : null,
    ra_rubrik: rubrik,
    ra_beskrivning: raText,
    temu_kategori: temuKategori,
    // Fälten nedan går INTE att läsa ut — de måste fyllas i av Axel.
    saknas: ['bilder', 'pris', 'varianter'],
    varning: bristfallig
      ? 'Temu gav ingen läsbar titel — kontrollera länken (är den en produktlänk?).'
      : null,
  };
}

if (process.argv[1]?.endsWith('hamta.mjs')) {
  const url = process.argv.find((a) => a.startsWith('http'));
  if (!url) {
    console.error('Användning: node temu/hamta.mjs "<temu-länk>"');
    process.exit(1);
  }
  try {
    const d = await hamtaTemu(url);
    console.log(JSON.stringify(d, null, 2));
    if (d.varning) console.error('\n⚠️  ' + d.varning);
    console.error('\nOBS: bilder, pris och varianter går inte att läsa ur Temu automatiskt.');
  } catch (e) {
    console.error('Hämtning misslyckades:', e.message);
    process.exit(1);
  }
}
