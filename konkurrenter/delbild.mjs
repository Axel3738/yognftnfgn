// Delbild: vår annonsbild UNDER deras omsatta text.
//
// MatSokker 2026-10-01: deras annons 6 är vår statiska d4 ("Ser ut som mat. Är tio par strumpor.")
// med rubriken och knappen omsatta på norska och duken förlängd till 4:5. Hela bilden gav dHash 17/64,
// alltså utanför "lik" (12), för texten är en stor del av bilden. Mittpartiet av vår bild — produkten,
// bakgrunden och sockeln, utan rubrik och knapp — söks därför i deras bild över skalor och lägen.
//
// Grovt letar (64 bitar, 9 × 8), fint dömer (256 bitar, 17 × 16) på det bästa fönstret: en uttömmande
// sökning hittar alltid NÅGOT fönster som liknar på 64 bitar. Mätt samma dag på MatSokkers bildannonser:
// träffarna d4 → annons 6 2/64 + 20/256 och d3 → annons 9 2/64 + 38/256; kontrollerna (fel bild i fel
// annons) 10–15/64 och 100–131/256. Gränserna nedan ligger med marginal mellan de två.
import { execFileSync } from 'node:child_process';

/** Mittpartiet som andelar av VÅR bild: [x0, y0, x1, y1] — utan rubriken överst och knappen nederst. */
export const MITTPARTI = [0.12, 0.26, 0.88, 0.86];
export const GROV_MAX = 6; // av 64 — samma som "identisk" i konfig.trosklar.bild
export const FIN_MAX = 64; // av 256 (25 %) — träffarna låg på 8–15 %, kontrollerna på 39–51 %

/** Gråskalebild med summerad-area-tabell: `pixlar` = w × h byte. Ren. */
export function grabild(w, h, pixlar) {
  const W = w + 1; const S = new Float64Array(W * (h + 1));
  for (let y = 0; y < h; y++) { let rad = 0; for (let x = 0; x < w; x++) { rad += pixlar[y * w + x]; S[(y + 1) * W + x + 1] = S[y * W + x + 1] + rad; } }
  return { w, h, S };
}

/** Medelvärdet i rektangeln [xa, xb) × [ya, yb). Ren. */
export function ytmedel(b, xa, ya, xb, yb) {
  const W = b.w + 1;
  return (b.S[yb * W + xb] - b.S[ya * W + xb] - b.S[yb * W + xa] + b.S[ya * W + xa]) / Math.max(1, (xb - xa) * (yb - ya));
}

/** dHash över ett fönster: `kol` × `rad` ytmedel, en bit per granne (kol − 1 per rad). Ren. */
export function hashFonster(b, fx, fy, fw, fh, kol = 9, rad = 8) {
  const bitar = [];
  for (let j = 0; j < rad; j++) {
    const ya = Math.floor(fy + (j * fh) / rad); const yb = Math.max(ya + 1, Math.floor(fy + ((j + 1) * fh) / rad));
    let forra = null;
    for (let i = 0; i < kol; i++) {
      const xa = Math.floor(fx + (i * fw) / kol); const xb = Math.max(xa + 1, Math.floor(fx + ((i + 1) * fw) / kol));
      const v = ytmedel(b, xa, ya, xb, yb);
      if (forra !== null) bitar.push(forra > v ? 1 : 0);
      forra = v;
    }
  }
  return bitar;
}

const hamming = (a, b) => a.reduce((s, x, i) => s + (x !== b[i] ? 1 : 0), 0);

/**
 * Söker `ruta` (andelar) av vår bild i deras bild. Fönstrets proportioner är rutans; skalan räknas mot
 * förhållandet mellan bildernas bredder. Ren. @returns {{ grov, fin, skala, fonster: [x, y, b, h], traff }}
 */
export function sokDelbild(var_, deras, { ruta = MITTPARTI, fran = 0.3, till = 1.6, steg = 0.01, grovMax = GROV_MAX, finMax = FIN_MAX } = {}) {
  const [x0, y0, x1, y1] = ruta;
  const vx = x0 * var_.w; const vy = y0 * var_.h; const vw = (x1 - x0) * var_.w; const vh = (y1 - y0) * var_.h;
  const mal = hashFonster(var_, vx, vy, vw, vh);
  let bast = null;
  for (let s = fran; s <= till + 1e-9; s += steg) {
    const fw = vw * s * (deras.w / var_.w); const fh = fw * (vh / vw);
    if (fw > deras.w || fh > deras.h || fw < 9 || fh < 8) continue;
    const st = Math.max(1, Math.round(fw / 80));
    for (let fy = 0; fy + fh <= deras.h; fy += st) for (let fx = 0; fx + fw <= deras.w; fx += st) {
      const d = hamming(mal, hashFonster(deras, fx, fy, fw, fh));
      if (!bast || d < bast.grov) bast = { grov: d, skala: Math.round(s * 100) / 100, fx, fy, fw, fh };
    }
  }
  if (!bast) return { grov: 64, fin: 256, skala: null, fonster: null, traff: false };
  const fin = hamming(hashFonster(var_, vx, vy, vw, vh, 17, 16), hashFonster(deras, bast.fx, bast.fy, bast.fw, bast.fh, 17, 16));
  return { grov: bast.grov, fin, skala: bast.skala, fonster: [bast.fx, bast.fy, bast.fw, bast.fh].map(Math.round), traff: bast.grov <= grovMax && fin <= finMax };
}

/** Läser en bildfil (jpg/png/webp) som gråskala via ffmpeg. */
export function lasGrabild(ffmpeg, fil) {
  let w; let h;
  try { execFileSync(ffmpeg, ['-hide_banner', '-i', fil], { stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { const m = String(e.stderr ?? '').match(/, (\d{2,5})x(\d{2,5})/); if (m) { w = Number(m[1]); h = Number(m[2]); } }
  if (!w || !h) throw new Error(`storleken gick inte att läsa ur ${fil}`);
  const pixlar = execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', fil, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 256 * 1024 * 1024 });
  if (pixlar.length < w * h) throw new Error(`${fil}: ${pixlar.length} byte, väntade ${w * h}`);
  return grabild(w, h, pixlar);
}
