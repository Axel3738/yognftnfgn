// produkt.mjs — produkten ur butiken, över HTTPS, aldrig ur minnet.
//
//   hamtaProdukt('https://baverbutiken.se/products/<handle>') → { titel, kortTitel,
//     handle, url, id, pris, jamforpris, prisText, jamforprisText, bilder:[{src,width,height}],
//     beskrivning (ren text), varianter, alternativ }
//
// Shopify serverar /products/<handle>.json publikt — det är samma väg som
// factory/ops-produkt.mjs läser källprodukter. Priset läses härifrån vid VARJE
// körning (CLAUDE.md: "Priset hämtas från produktsidan vid varje körning").
// Har varianterna olika pris tas det LÄGSTA (det som visas som "från") och
// körningen säger det i planen.

const BUTIK = 'https://baverbutiken.se';

/** Handle ur en länk eller ett rent handle. Tål query, språkprefix, avslutande slash. */
export function handleUrLank(lank) {
  const s = String(lank ?? '').trim();
  const m = /\/products\/([^/?#]+)/.exec(s);
  if (m) return m[1];
  if (/^[a-z0-9][a-z0-9-]*$/i.test(s)) return s.toLowerCase();
  return null;
}

/** Sidans JSON-adress. Behåller värd och språkprefix om länken bär dem. */
export function produktJsonUrl(lank) {
  const handle = handleUrLank(lank);
  if (!handle) return null;
  const s = String(lank ?? '').trim();
  if (/^https?:\/\//i.test(s)) {
    const u = s.split(/[?#]/)[0].replace(/\/+$/, '');
    return `${u}.json`;
  }
  return `${BUTIK}/products/${handle}.json`;
}

/** Svenskt pristal: 599 → "599 kr", 1129 → "1 129 kr". Hela kronor; ören visas bara om de finns. */
export function prisText(tal) {
  const n = Number(tal);
  if (!Number.isFinite(n)) return '';
  const hel = Math.trunc(n);
  const ore = Math.round((n - hel) * 100);
  const grupp = String(Math.abs(hel)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${hel < 0 ? '-' : ''}${grupp}${ore ? `,${String(ore).padStart(2, '0')}` : ''} kr`;
}

/** Titeln före första " – " / " - " / " | ": "Axelbälte för Trimmer – Justerbart…" → "Axelbälte för Trimmer". */
export function kortTitel(titel) {
  return String(titel ?? '').split(/\s+[–—-]\s+|\s+\|\s+/)[0].trim();
}

/** Slug utan å/ä/ö för sidhandtag: "Axelbälte för Trimmer" → "axelbalte-for-trimmer". */
export function slug(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[åä]/g, 'a').replace(/ö/g, 'o').replace(/[éè]/g, 'e').replace(/ü/g, 'u')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Ren text ur body_html — till subagentens faktaunderlag. */
export function renText(html) {
  return String(html ?? '')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|br|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim();
}

/** Ren logik: Shopifys produkt-JSON → vår form. Testbar utan nät. */
export function tolkaProdukt(json, { lank = null } = {}) {
  const p = json?.product ?? json;
  if (!p?.handle || !p?.title) throw new Error('Produkt-JSON saknar handle eller title.');
  const varianter = (p.variants ?? []).map((v) => ({
    id: v.id, titel: v.title, pris: Number(v.price), jamforpris: v.compare_at_price ? Number(v.compare_at_price) : null,
  }));
  if (varianter.length === 0) throw new Error(`Produkten ${p.handle} har inga varianter.`);
  const priser = [...new Set(varianter.map((v) => v.pris))].sort((a, b) => a - b);
  const pris = priser[0];
  const jamfor = [...new Set(varianter.filter((v) => v.pris === pris).map((v) => v.jamforpris).filter((x) => x != null))].sort((a, b) => a - b);
  const jamforpris = jamfor[0] ?? null;
  const bilder = (p.images ?? []).map((im) => ({ src: String(im.src).split('?')[0], width: im.width, height: im.height, alt: im.alt ?? null, position: im.position ?? null }));
  const kort = kortTitel(p.title);
  return {
    id: p.id,
    handle: p.handle,
    url: (lank && /^https?:\/\//i.test(lank) ? lank.split(/[?#]/)[0].replace(/\/+$/, '') : `${BUTIK}/products/${p.handle}`),
    titel: p.title,
    kortTitel: kort,
    slug: slug(kort),
    typ: p.product_type ?? '',
    pris,
    jamforpris,
    prisText: prisText(pris),
    jamforprisText: jamforpris != null ? prisText(jamforpris) : null,
    flerPriser: priser.length > 1 ? priser : null,
    varianter,
    alternativ: (p.options ?? []).map((o) => ({ namn: o.name, varden: o.values ?? [] })),
    bilder,
    beskrivning: renText(p.body_html),
  };
}

/** Hämtar produkten från butiken. Kastar med läsbart skäl. */
export async function hamtaProdukt(lank, { fetchFn = fetch } = {}) {
  const url = produktJsonUrl(lank);
  if (!url) throw new Error(`Kan inte läsa ett produkt-handle ur "${lank}". Ge länken till produktsidan (…/products/<handle>).`);
  const svar = await fetchFn(url, { headers: { accept: 'application/json' } });
  if (svar.status === 404) throw new Error(`Produkten finns inte: ${url} svarade 404. Kontrollera länken.`);
  if (!svar.ok) throw new Error(`Butiken svarade ${svar.status} på ${url}.`);
  const json = await svar.json();
  return tolkaProdukt(json, { lank });
}
