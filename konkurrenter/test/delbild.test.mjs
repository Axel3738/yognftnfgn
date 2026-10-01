// Delbilden: vår bild under deras omsatta text (MatSokker 2026-10-01). Syntetiska gråskalebilder — inget nät, ingen ffmpeg.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grabild, ytmedel, hashFonster, sokDelbild, MITTPARTI, GROV_MAX, FIN_MAX } from '../delbild.mjs';
import { byggAnmalan } from '../anmalan.mjs';

// Ett "motiv" som funktion av (u, v) i [0, 1]: går att rita i vilken skala och vilket läge som helst.
const motiv = (u, v) => 128 + 55 * Math.sin(9 * u + 4 * v) + 45 * Math.cos(7 * v - 3 * u) + (u > 0.4 && u < 0.7 && v > 0.3 && v < 0.6 ? 60 : 0);
// Kontrollen: ett ANNAT motiv (andra frekvenser, blocket på annat ställe) — en fasförskjutning av samma
// mönster är bara samma bild flyttad, och den ska sökningen hitta.
const annatMotiv = (u, v) => 128 + 50 * Math.sin(3 * u - 11 * v) + 50 * Math.cos(13 * u + 2 * v) + (u > 0.1 && u < 0.3 && v > 0.65 && v < 0.9 ? -70 : 0);

/** Ritar en bild: bakgrund 200, ett textfält (brus) överst och nederst, motivet i mittpartiet [x0..x1] × [y0..y1]. */
function rita(w, h, { x0, y0, x1, y1, f = motiv, brus = 1 }) {
  const p = new Uint8Array(w * h);
  let s = brus * 9973;
  const slump = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = 200;
    if (y < h * 0.2 || y > h * 0.88) v = slump() > 0.5 ? 30 : 230; // "texten"
    const u = (x - x0) / (x1 - x0); const t = (y - y0) / (y1 - y0);
    if (u >= 0 && u <= 1 && t >= 0 && t <= 1) v = f(u, t);
    p[y * w + x] = Math.max(0, Math.min(255, Math.round(v)));
  }
  return grabild(w, h, p);
}

test('delbild: summerad-area-tabellen ger rätt medelvärde', () => {
  const b = grabild(3, 2, new Uint8Array([1, 2, 3, 4, 5, 6]));
  assert.equal(ytmedel(b, 0, 0, 3, 2), 3.5);
  assert.equal(ytmedel(b, 1, 1, 3, 2), 5.5);
  assert.equal(hashFonster(b, 0, 0, 3, 2).length, 64);
  assert.equal(hashFonster(b, 0, 0, 3, 2, 17, 16).length, 256);
});

test('delbild: vår bild med omsatt text och förlängd duk hittas; en annan bild gör det inte', () => {
  // Vår: kvadrat, motivet i mittpartiet. Deras: 4:5, samma motiv lite mindre och längre ner, ny "text".
  const var_ = rita(300, 300, { x0: 36, y0: 78, x1: 264, y1: 258 });
  const deras = rita(300, 372, { x0: 42, y0: 120, x1: 260, y1: 292, brus: 7 });
  const r = sokDelbild(var_, deras, { ruta: MITTPARTI, steg: 0.02 });
  assert.ok(r.traff, `träff väntad: ${JSON.stringify(r)}`);
  assert.ok(r.grov <= GROV_MAX && r.fin <= FIN_MAX);
  // Kontrollen: ett annat motiv på samma plats ska inte bli en träff.
  const annan = rita(300, 372, { x0: 42, y0: 120, x1: 260, y1: 292, f: annatMotiv, brus: 7 });
  const k = sokDelbild(var_, annan, { ruta: MITTPARTI, steg: 0.02 });
  assert.equal(k.traff, false, `ingen träff väntad: ${JSON.stringify(k)}`);
  assert.ok(k.grov > GROV_MAX || k.fin > FIN_MAX);
});

test('anmälan: en delbild säger att bilden under texten är vår, inte att hela bilden är identisk', () => {
  const arende = { id: 'KD-2026-099', verksamhet: 'Matstrumpor', deras: { sidnamn: 'Kopian', sidaId: '1' }, var: { produkt: { titel: 'Sushistrumpor', url: 'https://matstrumpor.se/products/sushi', verksamhet: 'Matstrumpor' } } };
  const annons = { nr: 6, lank: 'https://www.facebook.com/ads/library/?id=386', video: false, start: '2026-09-30', bilder: [{ egen: 'https://cdn/var.jpg', deras: 'https://cdn/deras.jpg', avstand: 2, grad: 'identisk', del: 'mittparti', fin: 20 }], varAnnons: { namn: 'MATSTRUMP_sushi_offer_static_d4_v1' } };
  const konfig = { brev: { foretag: { namn: 'Stonebite Ecom AB', adress: 'Stenkolsgatan 1B, 417 07 Göteborg' } }, anmalan: { undertecknare: { namn: 'Test', epost: 't@x.se' } } };
  const an = byggAnmalan(arende, annons, konfig, { nr: 1, antal: 1, nu: '2026-10-01T12:00:00Z' });
  const t = an.falt.contentDescription ?? JSON.stringify(an.falt);
  assert.match(t, /text re-set in another language/);
  assert.match(t, /2\/64, fine check 20\/256/);
  assert.doesNotMatch(t, /still frame or photo taken from our own ad/);
});
