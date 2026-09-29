// konkurrenter/bild.mjs — ser konkurrentens bilder ut som våra? dHash
// (64 bitar) räknat i Chromium: containern har varken ffmpeg, PIL eller
// numpy (mätt 2026-09-27), men Playwright + Chromium finns för
// marknadsvakten, och en canvas avkodar vilken bild som helst.
//
// Nedskalningen är STEGVIS: halvera tills bilden är ≤ 256 px, rita till
// 90 × 80 med hög kvalitet, medelvärde per 10 × 10-block → 9 × 8 gråskala →
// 64 jämförelsebitar. Ett direkt drawImage 1024 → 9 px punktsamplar och gav
// 11 bitars skillnad mellan originalet och samma bild i 400 px (mätt
// 2026-09-27); med stegvis nedskalning är avståndet 0–2.
//
// Bakgrunden fylls vit före ritningen: en transparent PNG hos oss och samma
// bild platt som JPEG hos dem ska hasha lika.
//
// Samma sida ger också miniatyren till granskningssidan (JPEG ≤ 420 px) och
// skärmdumpen av konkurrentens sida (beviset).

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { UA } from './korpus.mjs';

export const PLAYWRIGHT = process.env.LR_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs';
export const CHROME_KANDIDATER = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'];

/** Hämtar en bild som bytes. null när det inte är en bild, för stor, eller inte svarar. */
export async function hamtaBild(url, { fetchFn = fetch, timeout = 20000, maxByte = 6_000_000 } = {}) {
  // En lokal fil (Axels skärmdump av en annons) hashas på samma sätt som en länk.
  if (!/^https?:\/\//i.test(String(url)) && existsSync(String(url))) {
    try { const b = readFileSync(String(url)); return b.length && b.length <= maxByte ? { url: String(url), bytes: b, typ: gissaTyp(b) } : null; } catch { return null; }
  }
  try {
    const res = await fetchFn(url, { headers: { 'User-Agent': UA, Accept: 'image/*,*/*;q=0.5' }, signal: AbortSignal.timeout(timeout) });
    if (!res.ok) return null;
    const typ = (res.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
    if (typ && !typ.startsWith('image/')) return null;
    const langd = Number(res.headers.get('content-length') ?? 0);
    if (langd > maxByte) return null;
    const b = Buffer.from(await res.arrayBuffer());
    if (!b.length || b.length > maxByte) return null;
    return { url, bytes: b, typ: typ || gissaTyp(b) };
  } catch { return null; }
}

/** Bildtypen ur de första byten (när servern inte säger). Ren. */
export function gissaTyp(b) {
  if (b[0] === 0xff && b[1] === 0xd8) return 'image/jpeg';
  if (b[0] === 0x89 && b[1] === 0x50) return 'image/png';
  if (b[0] === 0x47 && b[1] === 0x49) return 'image/gif';
  if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') return 'image/webp';
  if (b.slice(4, 12).toString().includes('avif')) return 'image/avif';
  return 'image/jpeg';
}

export const tillDataUrl = (bytes, typ = 'image/jpeg') => `data:${typ};base64,${Buffer.from(bytes).toString('base64')}`;

/**
 * Körs I WEBBLÄSAREN (page.evaluate) — en riktig funktion, inte en sträng
 * (en sträng utvärderas som uttryck, factory/marknadskoll.mjs 2026-09-27).
 * Tar [{ id, dataUrl }], ger [{ id, hash, bredd, hojd, miniatyr, fel }].
 */
function hashaIWebblasaren({ lista, miniatyrBredd }) {
  const ladda = (src) => new Promise((ok, nej) => { const img = new Image(); img.onload = () => ok(img); img.onerror = () => nej(new Error('bilden gick inte att avkoda')); img.src = src; });
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const cx = c.getContext('2d', { willReadFrequently: true }); cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high'; cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, w, h); return [c, cx]; };
  return (async () => {
    const ut = [];
    for (const { id, dataUrl } of lista) {
      try {
        const img = await ladda(dataUrl);
        let kalla = img; let w = img.naturalWidth; let h = img.naturalHeight;
        if (!w || !h) throw new Error('bilden har ingen storlek');
        while (w > 256 && h > 8) {
          const nw = Math.max(1, Math.round(w / 2)); const nh = Math.max(1, Math.round(h / 2));
          const [c, cx] = canvas(nw, nh); cx.drawImage(kalla, 0, 0, nw, nh); kalla = c; w = nw; h = nh;
        }
        const [c, cx] = canvas(90, 80); cx.drawImage(kalla, 0, 0, 90, 80);
        const d = cx.getImageData(0, 0, 90, 80).data;
        const g = new Float64Array(72);
        for (let y = 0; y < 80; y++) for (let x = 0; x < 90; x++) { const i = (y * 90 + x) * 4; g[Math.floor(y / 10) * 9 + Math.floor(x / 10)] += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; }
        let bits = '';
        for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += g[y * 9 + x] < g[y * 9 + x + 1] ? '1' : '0';
        const hash = BigInt(`0b${bits}`).toString(16).padStart(16, '0');
        let miniatyr = null;
        if (miniatyrBredd) {
          const skala = Math.min(1, miniatyrBredd / img.naturalWidth);
          const mw = Math.max(1, Math.round(img.naturalWidth * skala)); const mh = Math.max(1, Math.round(img.naturalHeight * skala));
          const [m, mx] = canvas(mw, mh); mx.drawImage(img, 0, 0, mw, mh);
          miniatyr = m.toDataURL('image/jpeg', 0.72);
        }
        ut.push({ id, hash, bredd: img.naturalWidth, hojd: img.naturalHeight, miniatyr, fel: null });
      } catch (e) {
        ut.push({ id, hash: null, bredd: 0, hojd: 0, miniatyr: null, fel: e.message });
      }
    }
    return ut;
  })();
}

/**
 * Startar Chromium och ger { hasha, skarmdump, stang }. Kastar med orsak om
 * Playwright eller Chromium saknas — anroparen skriver då "bilder ej jämförda"
 * i rapporten i stället för att gissa.
 */
export async function startaHashare({ logg = () => {}, miniatyrBredd = 420, playwrightSokvag = PLAYWRIGHT, kandidater = CHROME_KANDIDATER } = {}) {
  let pw;
  try { pw = await import(playwrightSokvag); } catch (e) { throw new Error(`Playwright saknas (${e.message.split('\n')[0]}) — bilder jämförs inte`); }
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const args = ['--no-sandbox', '--ignore-certificate-errors', '--disable-gpu'];
  let browser = null; const fel = [];
  for (const exe of [null, ...kandidater]) {
    if (exe && !existsSync(exe)) continue;
    try { browser = await pw.chromium.launch({ headless: true, args, proxy, ...(exe ? { executablePath: exe } : {}) }); break; } catch (e) { fel.push(e.message.split('\n')[0]); }
  }
  if (!browser) throw new Error(`Chromium startade inte: ${fel.join(' | ')}`);
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 2200 }, userAgent: UA, locale: 'sv-SE' });
  const sida = await ctx.newPage();
  await sida.setContent('<!doctype html><html><body></body></html>');
  logg('  Chromium igång (dHash + skärmdumpar)');

  return {
    /** [{ id, bytes, typ }] → [{ id, hash, bredd, hojd, miniatyr, fel }], i omgångar om sex (dataURL:erna går över processgränsen). */
    async hasha(bilder, { medMiniatyr = true } = {}) {
      const ut = [];
      for (let i = 0; i < bilder.length; i += 6) {
        const del = bilder.slice(i, i + 6).map((b) => ({ id: b.id, dataUrl: tillDataUrl(b.bytes, b.typ) }));
        const svar = await sida.evaluate(hashaIWebblasaren, { lista: del, miniatyrBredd: medMiniatyr ? miniatyrBredd : 0 });
        ut.push(...svar);
      }
      return ut;
    },
    /** Skärmdump av en sida (JPEG, första 2 200 px). Returnerar { fil, titel, slutUrl } eller { fel }. */
    async skarmdump(url, fil, { timeout = 45000 } = {}) {
      const p = await ctx.newPage();
      try {
        try { await p.goto(url, { waitUntil: 'load', timeout }); } catch { await p.goto(url, { waitUntil: 'domcontentloaded', timeout }); }
        await p.waitForTimeout(1500);
        mkdirSync(dirname(fil), { recursive: true });
        await p.screenshot({ path: fil, type: 'jpeg', quality: 60, fullPage: false });
        return { fil, titel: await p.title(), slutUrl: p.url(), nar: new Date().toISOString() };
      } catch (e) {
        return { fel: e.message.split('\n')[0] };
      } finally { await p.close().catch(() => {}); }
    },
    async stang() { await browser.close().catch(() => {}); },
  };
}

/** En liten cache url → { hash, bredd, hojd } så samma bild inte hämtas två gånger per körning (eller per container). */
export class Bildcache {
  constructor(fil) { this.fil = fil; this.data = {}; try { if (fil && existsSync(fil)) this.data = JSON.parse(readFileSync(fil, 'utf8')); } catch { this.data = {}; } this.andrad = false; }
  get(url) { return this.data[url] ?? null; }
  set(url, v) { this.data[url] = { ...v, nar: new Date().toISOString() }; this.andrad = true; }
  spara() { if (!this.fil || !this.andrad) return; mkdirSync(dirname(this.fil), { recursive: true }); writeFileSync(this.fil, JSON.stringify(this.data)); this.andrad = false; }
}

/**
 * Hashar en lista bildlänkar: cache först, sedan hämtning + Chromium.
 * Returnerar Map url → { hash, bredd, hojd, miniatyr }. Bilder som inte gick
 * att läsa saknas i svaret (och räknas i `fel`).
 */
export async function hashaLankar(lankar, { hashare, cache = null, fetchFn = fetch, medMiniatyr = false, logg = () => {}, max = 40 } = {}) {
  const ut = new Map(); let fel = 0;
  const att = [];
  for (const u of [...new Set(lankar)].slice(0, max)) {
    const c = cache?.get(u);
    // Cachen bär bara hashen (miniatyrer är 40 kB styck) — begärs miniatyrer hämtas bilden igen.
    if (c?.hash && !medMiniatyr) { ut.set(u, c); continue; }
    att.push(u);
  }
  const hamtade = [];
  for (const u of att) {
    const b = await hamtaBild(u, { fetchFn });
    if (b) hamtade.push({ id: u, bytes: b.bytes, typ: b.typ }); else fel++;
  }
  if (hamtade.length) {
    const svar = await hashare.hasha(hamtade, { medMiniatyr });
    for (const s of svar) {
      if (!s.hash) { fel++; continue; }
      ut.set(s.id, { hash: s.hash, bredd: s.bredd, hojd: s.hojd, miniatyr: s.miniatyr ?? null });
      cache?.set(s.id, { hash: s.hash, bredd: s.bredd, hojd: s.hojd });
    }
  }
  if (fel) logg(`  ${fel} bild(er) gick inte att läsa`);
  return { hashar: ut, fel };
}
