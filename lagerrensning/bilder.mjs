// bilder.mjs — bildplanen → färdiga bild-URL:er för sidan.
//
// Bildplanen (output/<handle>/bildplan.json) skrivs av sessionen (strategi):
//
//   { "bilder": {
//       "punkt1": { "kalla": "produkt", "index": 2 },                      ← produktsidans bild nr 2 (1-baserat)
//       "punkt2": { "kalla": "kie", "prompt": "…", "referenser": ["https://…"], "format": "1:1" },
//       "punkt3": { "kalla": "url", "url": "https://cdn.shopify.com/…" },   ← färdig, publik bild
//       "punkt4": { "kalla": "mall" },                                      ← behåll mallens bild (motorhöljets!) — säg det med flit
//       …
//   } }
//
// Alla sex platser i `bilder_som_byts` MÅSTE stå i planen. En plats som saknas
// är ett fel, inte en tyst motorbild på en trimmersida.
//
// kie-bilder genereras (bildannonser/kie.mjs — samma motor som /bildannonser),
// laddas hem för granskning och läggs på Shopifys CDN (shopify.mjs). Resultatet
// cachas i output/<handle>/bilder.json så en omkörning inte bränner credits;
// `--igen punkt2` tvingar ny generering av en plats.
//
// Nätverksfunktionerna injiceras (generera, laddaUpp, hamta) så logiken går att
// testa utan nyckel och utan credits.

import { createHash } from 'node:crypto';

export const KALLOR = ['produkt', 'url', 'kie', 'mall'];
export const STANDARD_FORMAT = '1:1';

/** Bredd/höjd ur bildbytes: PNG, JPEG, GIF, WebP. null om okänt. */
export function bilddimensioner(buf) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  if (b.length >= 24 && b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  if (b.length >= 10 && b.toString('ascii', 0, 6).startsWith('GIF8')) return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
  if (b.length >= 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const typ = b.toString('ascii', 12, 16);
    if (typ === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (typ === 'VP8L') { const bits = b.readUInt32LE(21); return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }; }
    if (typ === 'VP8X') return { width: (b.readUIntLE(24, 3)) + 1, height: (b.readUIntLE(27, 3)) + 1 };
  }
  if (b.length >= 4 && b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i += 1; continue; }
      const m = b[i + 1];
      if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
      const langd = b.readUInt16BE(i + 2);
      if ((m >= 0xc0 && m <= 0xcf) && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) };
      }
      i += 2 + langd;
    }
  }
  return null;
}

/** Bildplanen kontrollerad mot platskartan och produkten. Fel stoppar. */
export function granskaBildplan(plan, produkt, platser) {
  const fel = [];
  const varningar = [];
  const poster = {};
  const bilder = plan?.bilder ?? plan ?? {};
  const kravda = platser.bilder_som_byts ?? [];
  const kanda = Object.keys(platser.bilder ?? {});

  for (const plats of Object.keys(bilder)) {
    if (!kanda.includes(plats)) { fel.push(`${plats}: okänd bildplats (kända: ${kanda.join(', ')})`); continue; }
    if (['hero', 'sidfot'].includes(plats)) { fel.push(`${plats}: byts aldrig (författarfotot och loggan är gemensamma för alla sidor)`); continue; }
  }
  for (const plats of [...kravda, ...Object.keys(bilder).filter((p) => !kravda.includes(p) && kanda.includes(p) && !['hero', 'sidfot'].includes(p))]) {
    const post = bilder[plats];
    if (!post) { fel.push(`${plats}: saknas i bildplanen — skriv { "kalla": "mall" } om mallens bild ska behållas med flit`); continue; }
    const kalla = String(post.kalla ?? '').toLowerCase();
    if (!KALLOR.includes(kalla)) { fel.push(`${plats}: kalla "${post.kalla}" är okänd (${KALLOR.join(' | ')})`); continue; }
    if (kalla === 'mall') {
      varningar.push(`${plats}: behåller mallens bild (${platser.bilder[plats]?.roll ?? ''})`);
      poster[plats] = { kalla: 'mall' };
    } else if (kalla === 'produkt') {
      const i = Number(post.index);
      const n = produkt?.bilder?.length ?? 0;
      if (!Number.isInteger(i) || i < 1 || i > n) { fel.push(`${plats}: index ${post.index} — produkten har ${n} bild(er), skriv 1–${n}`); continue; }
      poster[plats] = { kalla: 'produkt', index: i };
    } else if (kalla === 'url') {
      if (!/^https:\/\//i.test(String(post.url ?? ''))) { fel.push(`${plats}: url måste vara https`); continue; }
      poster[plats] = { kalla: 'url', url: post.url, width: post.width ?? null, height: post.height ?? null };
    } else {
      const prompt = String(post.prompt ?? '').trim();
      if (prompt.length < 20) { fel.push(`${plats}: kie-prompten är för kort (${prompt.length} tecken)`); continue; }
      if (/\b(text|logo|price|kr|%)\b/i.test(prompt) && !/no text|without text|inga? text/i.test(prompt)) varningar.push(`${plats}: prompten nämner text/pris — bildmodellen stavar fel, låt bilden vara ren`);
      const referenser = Array.isArray(post.referenser) ? post.referenser.filter(Boolean) : [];
      if (referenser.length > 10) { fel.push(`${plats}: max 10 referensbilder`); continue; }
      poster[plats] = { kalla: 'kie', prompt, referenser, format: post.format ?? STANDARD_FORMAT };
    }
  }
  return { fel, varningar, poster };
}

export const cacheNyckel = (post) => createHash('sha256').update(JSON.stringify([post.prompt, post.referenser, post.format])).digest('hex').slice(0, 12);

/**
 * Löser varje plats till { src, width, height, kalla }. Kör inget nät i --torr.
 *
 *   losBilder(poster, produkt, { cache, igen, torr, generera, laddaUpp, hamta, sparaLokalt, logg })
 *   generera({ plats, prompt, referenser, format }) → { url, taskId }
 *   laddaUpp(url, { filnamn, alt })                  → { src, width, height, via }
 *   hamta(url)                                        → Buffer (för dimensioner + lokal kopia)
 *   sparaLokalt(plats, buffer)                        → sökväg (valfri)
 */
export async function losBilder(poster, produkt, { cache = {}, igen = [], torr = false, generera, laddaUpp, hamta, sparaLokalt = null, logg = () => {}, filnamnBas = 'lp' } = {}) {
  const bilder = {};
  const nyCache = { ...cache };
  for (const [plats, post] of Object.entries(poster)) {
    if (post.kalla === 'mall') { logg(`  · ${plats}: mallens bild behålls`); continue; }
    if (post.kalla === 'produkt') {
      const b = produkt.bilder[post.index - 1];
      bilder[plats] = { src: b.src, width: b.width, height: b.height, kalla: `produkt #${post.index}` };
      logg(`  · ${plats}: produktbild ${post.index} (${b.width}×${b.height})`);
      continue;
    }
    if (post.kalla === 'url') {
      let { width, height } = post;
      if (!(width > 0 && height > 0)) {
        if (torr) { logg(`  · ${plats}: url — bredd/höjd läses vid skarp körning`); bilder[plats] = { src: post.url, width: 0, height: 0, kalla: 'url' }; continue; }
        const dim = bilddimensioner(await hamta(post.url));
        if (!dim) throw new Error(`${plats}: kunde inte läsa bredd/höjd ur ${post.url}.`);
        ({ width, height } = dim);
      }
      bilder[plats] = { src: post.url, width, height, kalla: 'url' };
      logg(`  · ${plats}: url (${width}×${height})`);
      continue;
    }
    // kie
    const nyckel = cacheNyckel(post);
    const sparad = nyCache[plats];
    if (sparad?.nyckel === nyckel && sparad.src && !igen.includes(plats)) {
      bilder[plats] = { src: sparad.src, width: sparad.width, height: sparad.height, kalla: `kie (cachad ${sparad.datum ?? ''})`.trim() };
      logg(`  · ${plats}: kie — redan genererad (${sparad.via ?? '?'}), återanvänds`);
      continue;
    }
    if (torr) {
      logg(`  · ${plats}: kie — SKULLE genereras (${post.format}, ${post.referenser.length} ref, prompt ${post.prompt.length} tecken)`);
      bilder[plats] = { src: null, width: 0, height: 0, kalla: 'kie (ej genererad, torr)' };
      continue;
    }
    if (!generera || !laddaUpp) throw new Error('losBilder: generera/laddaUpp saknas för en kie-post.');
    logg(`  · ${plats}: kie genererar (${post.format}, ${post.referenser.length} ref) …`);
    const g = await generera({ plats, prompt: post.prompt, referenser: post.referenser, format: post.format });
    if (!g?.url) throw new Error(`${plats}: kie gav ingen bild-URL.`);
    let lokal = null;
    if (hamta && sparaLokalt) {
      try { lokal = await sparaLokalt(plats, await hamta(g.url)); } catch (e) { logg(`    ⚠ kunde inte spara lokal kopia: ${e.message}`); }
    }
    const filnamn = `${filnamnBas}-${plats}.png`;
    const upp = await laddaUpp(g.url, { filnamn, alt: `${produkt.kortTitel ?? ''} – lagerrensning, ${plats}`.trim() });
    if (!upp?.src) throw new Error(`${plats}: uppladdningen gav ingen URL.`);
    bilder[plats] = { src: upp.src, width: upp.width, height: upp.height, kalla: `kie → ${upp.via}` };
    nyCache[plats] = { nyckel, src: upp.src, width: upp.width, height: upp.height, via: upp.via, kie_url: g.url, taskId: g.taskId ?? null, lokal, datum: new Date().toISOString().slice(0, 10) };
    logg(`    ✓ ${upp.src} (${upp.width}×${upp.height}, via ${upp.via})`);
  }
  return { bilder, cache: nyCache };
}
