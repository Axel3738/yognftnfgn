// konkurrenter/hamta.mjs — konkurrentens sida: texten, bilderna, e-posten att
// skriva till, org.nr och plattformen. Ren HTTP (fetch), ingen webbläsare —
// Shopify-butiker (de flesta kopiorna) svarar dessutom med ren JSON på
// /products/<handle>.json, och den texten är exakt det som ska jämföras.
//
// Läs-bart. Skriver ingenting, skickar ingenting.

import { textUrHtml, handleUr, UA } from './korpus.mjs';
import { domanUr } from './sok.mjs';

/** Sidorna där kontaktuppgifterna brukar stå — i den ordning de provas. */
export const KONTAKTSIDOR = [
  '/pages/contact', '/pages/kontakt', '/pages/kontakta-oss', '/pages/kontakt-oss', '/pages/contact-us', '/pages/om-oss', '/pages/about-us',
  '/policies/contact-information', '/policies/legal-notice', '/policies/terms-of-service', '/policies/refund-policy', '/policies/privacy-policy',
  '/kontakt', '/contact', '/kontakta-oss', '/om-oss', '/about', '/impressum',
];

const OINTRESSANT_EPOST = /(\.(png|jpe?g|gif|svg|webp|css|js)$)|example\.|sentry\.|wixpress|squarespace|@shopify\.com|myshopify\.com|schema\.org|w3\.org|no-?reply|donotreply|@2x|@3x|\.\./i;

/** Hämtar en sida som text. Kastar aldrig — fel står i svaret. */
export async function hamtaHtml(url, { fetchFn = fetch, timeout = 25000, maxByte = 2_500_000, sprak = 'sv' } = {}) {
  const ut = { url, slutUrl: url, status: 0, ok: false, html: '', typ: '', fel: null };
  try {
    const res = await fetchFn(url, { headers: { 'User-Agent': UA, Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.5', 'Accept-Language': `${sprak},en;q=0.7` }, redirect: 'follow', signal: AbortSignal.timeout(timeout) });
    ut.status = res.status; ut.ok = res.ok; ut.slutUrl = res.url || url; ut.typ = res.headers.get('content-type') ?? '';
    if (!/html|json|text|xml/i.test(ut.typ) && ut.typ) { ut.fel = `inte en webbsida (${ut.typ.split(';')[0]})`; return ut; }
    const text = await res.text();
    ut.html = text.length > maxByte ? text.slice(0, maxByte) : text;
    if (!res.ok) ut.fel = `HTTP ${res.status}`;
  } catch (e) {
    ut.fel = e.name === 'TimeoutError' ? `svarade inte inom ${Math.round(timeout / 1000)} s` : e.message;
  }
  return ut;
}

/** Relativ länk → absolut mot basadressen. null om det inte går. Ren. */
export function absolut(kandidat, bas) {
  const k = String(kandidat ?? '').trim();
  if (!k || /^(data|javascript|mailto|tel):/i.test(k)) return null;
  try { return new URL(k.startsWith('//') ? `https:${k}` : k, bas).href; } catch { return null; }
}

/** Vilken plattform sidan kör. Ren. */
export function upptackPlattform(html) {
  const s = String(html ?? '');
  if (/cdn\.shopify\.com|Shopify\.theme|shopify-section|myshopify\.com|window\.Shopify/i.test(s)) return 'shopify';
  if (/woocommerce|wp-content\/plugins\/woo/i.test(s)) return 'woocommerce';
  if (/wp-content|wp-includes/i.test(s)) return 'wordpress';
  if (/wixstatic\.com|wix\.com/i.test(s)) return 'wix';
  if (/squarespace/i.test(s)) return 'squarespace';
  if (/webflow/i.test(s)) return 'webflow';
  if (/quickbutik/i.test(s)) return 'quickbutik';
  if (/wikinggruppen|starweb/i.test(s)) return 'starweb';
  return 'okänd';
}

/** E-postadresser i en sida (även mailto: och [at]-skrivningar), utan våra egna och utan skräp. Ren. */
export function plockaEpost(html, { egna = [] } = {}) {
  const s = String(html ?? '')
    .replace(/&#64;|&#x40;|%40/gi, '@')
    .replace(/\s*[[(]\s*(at|snabel-a)\s*[\])]\s*/gi, '@')
    .replace(/\s*[[(]\s*(dot|punkt)\s*[\])]\s*/gi, '.');
  const ut = new Set();
  for (const m of s.matchAll(/[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/gi)) {
    const e = m[0].toLowerCase().replace(/^[._-]+/, '');
    if (OINTRESSANT_EPOST.test(e)) continue;
    const dom = e.split('@')[1];
    if (egna.some((x) => dom === x || dom.endsWith(`.${x}`))) continue;
    ut.add(e);
  }
  return [...ut];
}

/** Organisationsnummer i texten: svenska (NNNNNN-NNNN), norska (org.nr 9 siffror), danska (CVR), finska (Y-tunnus). Ren. */
export function plockaOrgnr(text) {
  const s = String(text ?? '');
  const ut = [];
  for (const m of s.matchAll(/\b(\d{6})-(\d{4})\b/g)) ut.push({ typ: 'SE', nr: `${m[1]}-${m[2]}` });
  for (const m of s.matchAll(/org\.?\s*(?:nr|nummer)\.?:?\s*(?:NO\s*)?(\d{3}\s?\d{3}\s?\d{3})(?:\s*MVA)?/gi)) ut.push({ typ: 'NO', nr: m[1].replace(/\s/g, '') });
  for (const m of s.matchAll(/\bCVR(?:-nr\.?|:)?\s*(\d{8})\b/gi)) ut.push({ typ: 'DK', nr: m[1] });
  for (const m of s.matchAll(/Y-tunnus:?\s*(\d{7}-\d)/gi)) ut.push({ typ: 'FI', nr: m[1] });
  const sedda = new Set();
  return ut.filter((o) => { const k = `${o.typ}${o.nr}`; if (sedda.has(k)) return false; sedda.add(k); return true; }).slice(0, 5);
}

const OINTRESSANT_BILD = /\.(svg|gif|ico)(\?|$)|logo|icon|favicon|payment|badge|flag|sprite|pixel|spinner|loader|avatar|emoji|klarna|visa|mastercard|paypal|swish|trustpilot|judgeme|jdgm|stars?[-_.]|rating|cart|search|arrow|close|menu|placeholder|blank|1x1/i;

/** Är bildlänken värd att hasha (en produktbild, inte en ikon)? Ren. */
export function arIntressantBildUrl(url) {
  const u = String(url ?? '');
  if (!/^https?:\/\//i.test(u)) return false;
  return !OINTRESSANT_BILD.test(u.split('?')[0].split('/').slice(3).join('/')) && !/\.svg\b/i.test(u);
}

/** Bildlänkarna i en sida (img src/data-src/srcset + og:image), absoluta, unika. Ren. */
export function plockaBilder(html, bas, { max = 30 } = {}) {
  const s = String(html ?? '');
  const ut = [];
  const lagg = (u) => { const a = absolut(u, bas); if (a && arIntressantBildUrl(a) && !ut.includes(a)) ut.push(a); };
  for (const m of s.matchAll(/<meta\b[^>]*property="og:image(?::secure_url)?"[^>]*content="([^"]+)"/gi)) lagg(m[1]);
  for (const m of s.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const src = tag.match(/\b(?:data-src|data-original|data-lazy-src)="([^"]+)"/i)?.[1] ?? tag.match(/\bsrc="([^"]+)"/i)?.[1];
    const srcset = tag.match(/\b(?:data-srcset|srcset)="([^"]+)"/i)?.[1];
    if (src) lagg(src);
    if (srcset) { const forsta = srcset.split(',').map((x) => x.trim().split(/\s+/)[0]).filter(Boolean); if (forsta.length) lagg(forsta[forsta.length - 1]); }
    if (ut.length >= max) break;
  }
  return ut.slice(0, max);
}

/** Produktens JSON-adress om länken är en Shopify-produktsida, annars null. Språkprefix (/nb/, /en/) tas bort. Ren. */
export function shopifyJsonUrl(url) {
  try {
    const u = new URL(String(url));
    const m = u.pathname.match(/\/products\/([^/?#]+)/);
    if (!m) return null;
    return `${u.origin}/products/${m[1]}.json`;
  } catch { return null; }
}

/** Huvudtexten i en sida: <main>, <article> eller Shopifys #MainContent före hela body. Ren. */
export function huvudtext(html) {
  const s = String(html ?? '');
  const block = s.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? s.match(/<article\b[\s\S]*?<\/article>/i)?.[0] ?? s.match(/<div\b[^>]*id="MainContent"[\s\S]*?<footer/i)?.[0] ?? s.match(/<body\b[\s\S]*<\/body>/i)?.[0] ?? s;
  return textUrHtml(block.replace(/<(nav|header|footer)\b[\s\S]*?<\/\1>/gi, ' '));
}

/** Titel, språk och det vi behöver ur en HTML-sida. Ren. */
export function tolkaHtml(html, bas) {
  const s = String(html ?? '');
  const titel = (s.match(/<meta\b[^>]*property="og:title"[^>]*content="([^"]*)"/i)?.[1] ?? s.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/\s+/g, ' ').trim();
  const lang = (s.match(/<html\b[^>]*\blang="([a-zA-Z-]+)"/i)?.[1] ?? '').toLowerCase().split('-')[0] || null;
  const canonical = s.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/i)?.[1] ?? null;
  return {
    titel, lang, canonical: canonical ? absolut(canonical, bas) : null,
    text: huvudtext(s),
    textAllt: textUrHtml(s),
    bilder: plockaBilder(s, bas),
    plattform: upptackPlattform(s),
    produktLankar: [...new Set([...s.matchAll(/href="([^"]*\/products\/[^"?#]+)/gi)].map((m) => absolut(m[1], bas)).filter(Boolean))].slice(0, 20),
  };
}

/** Bästa mottagaren: egen domän före gratismejl, kontakt/info/support/hello före resten. Ren. */
export function valjMottagare(epost = [], doman = null) {
  const d = String(doman ?? '').toLowerCase().replace(/^www\./, '');
  const rot = d.split('.').slice(-2).join('.');
  const poang = (e) => {
    const [namn, dom] = e.split('@');
    let p = 0;
    if (dom === d || dom.endsWith(`.${d}`) || (rot && (dom === rot || dom.endsWith(`.${rot}`)))) p += 100;
    if (/^(kontakt|contact|info|support|hello|hej|kundtjanst|kundtjänst|kundservice|kundeservice|asiakaspalvelu|order|shop|butik|post|mail)$/i.test(namn)) p += 20;
    if (/gmail|hotmail|outlook|yahoo|icloud|live\./i.test(dom)) p -= 10;
    return p;
  };
  return [...new Set(epost)].sort((a, b) => poang(b) - poang(a))[0] ?? null;
}

/**
 * Hela hämtningen för en konkurrentadress. Returnerar alltid ett objekt —
 * `ok: false` med `fel` när sidan inte gick att läsa.
 */
export async function hamtaKonkurrent(url, { fetchFn = fetch, logg = () => {}, egna = [], medKontakt = true, maxKontaktsidor = 6 } = {}) {
  const sida = await hamtaHtml(url, { fetchFn });
  const doman = domanUr(sida.slutUrl || url);
  const ut = { url, slutUrl: sida.slutUrl, doman, status: sida.status, ok: sida.ok && !sida.fel, fel: sida.fel, titel: '', lang: null, plattform: 'okänd', text: '', textAllt: '', bilder: [], epost: [], orgnr: [], produkt: null, kontakt: { epost: [], kallor: [] }, mottagare: null };
  if (!ut.ok) return ut;
  const t = tolkaHtml(sida.html, sida.slutUrl || url);
  Object.assign(ut, { titel: t.titel, lang: t.lang, plattform: t.plattform, text: t.text, textAllt: t.textAllt, bilder: t.bilder });
  ut.epost = plockaEpost(sida.html, { egna });
  ut.orgnr = plockaOrgnr(t.textAllt);

  // Shopify-produkt: den rena texten och bilderna ur JSON:en.
  const jsonUrl = t.plattform === 'shopify' || /\/products\//.test(sida.slutUrl || url) ? shopifyJsonUrl(sida.slutUrl || url) : null;
  if (jsonUrl) {
    const j = await hamtaHtml(jsonUrl, { fetchFn });
    if (j.ok && /json/i.test(j.typ)) {
      try {
        const p = JSON.parse(j.html).product;
        if (p?.title) {
          ut.produkt = { handle: handleUr(jsonUrl), titel: p.title, text: textUrHtml(p.body_html), bilder: [...new Set((p.images ?? []).map((b) => b?.src).filter(Boolean))], pris: p.variants?.[0]?.price ?? null, saljare: p.vendor ?? null };
          // Produkttexten ur JSON:en är den rena — men en butik som skriver
          // sin text i temat (som våra OPS-butiker: 25 ord i body_html, resten
          // i sektioner) jämförs på sidans huvudtext i stället.
          if (ut.produkt.text.split(/\s+/).filter(Boolean).length >= 40) ut.text = ut.produkt.text;
          ut.bilder = [...new Set([...ut.produkt.bilder, ...ut.bilder])].slice(0, 30);
          ut.plattform = 'shopify';
        }
      } catch { /* inte JSON — sidan var ingen Shopify-produkt */ }
    }
  }

  if (medKontakt && ut.doman) {
    const bas = `https://${ut.doman}`;
    let provade = 0;
    for (const stig of KONTAKTSIDOR) {
      if (provade >= maxKontaktsidor) break;
      const egenDoman = ut.kontakt.epost.some((e) => e.endsWith(`@${ut.doman}`) || e.endsWith(`.${ut.doman.split('.').slice(-2).join('.')}`));
      if (egenDoman && provade >= 2) break;
      const k = await hamtaHtml(`${bas}${stig}`, { fetchFn, timeout: 15000 });
      provade++;
      if (!k.ok) continue;
      const funna = plockaEpost(k.html, { egna });
      if (funna.length) { ut.kontakt.kallor.push(`${bas}${stig}`); for (const e of funna) if (!ut.kontakt.epost.includes(e)) ut.kontakt.epost.push(e); }
      const org = plockaOrgnr(textUrHtml(k.html));
      for (const o of org) if (!ut.orgnr.some((x) => x.nr === o.nr)) ut.orgnr.push(o);
    }
    logg(`  ${ut.doman}: ${ut.kontakt.epost.length} adresser på ${ut.kontakt.kallor.length} kontaktsidor`);
  }
  const alla = [...new Set([...ut.kontakt.epost, ...ut.epost])];
  ut.mottagare = valjMottagare(alla, ut.doman);
  return ut;
}
