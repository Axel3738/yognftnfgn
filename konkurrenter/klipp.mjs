// konkurrenter/klipp.mjs — bildrutorna som bevisar att deras video är klippt ur våra filmer.
//
// Bakgrund (Axel 2026-09-29, efter första ORVO-bygget): bevisbilderna visade
// miniatyrträffen — annonsens förhandsbild mot vår — och just de klippen är
// LÅNADE (b-roll vi själva tagit någon annanstans ifrån). Resten av filmerna,
// ~90 % av klippen, är våra egna AI-klipp. En anmälan som pekar på det lånade
// klippet är svag och oärlig; en som pekar på våra egna rutor håller.
//
// Mätt samma dag på ORVO:s tio filmer: de är hopklippta ur MÅNGA av våra
// filmer (mest Takoverdrag_SP_4_H1 och RI_1_H1), inte bara den miniatyren
// pekade på — mot en enda film matchade 3–56 % av rutorna, mot alla nio
// 29–67 %. Därför jämförs varje ruta hos dem mot ALLA våra filmer för
// produkten (biblioteket: annonser i våra konton med samma namnprefix).
//
// Vägen: ladda ner deras video (annonsbiblioteket) och våra (Meta), ta en
// ruta var halva sekund, hasha dem (dHash 9 × 8, samma princip som bild.mjs
// men räknat i ffmpeg), para varje ruta hos dem med den närmaste hos oss,
// dela deras film i scener, kasta allt inom två sekunder från en utesluten
// ruta (miniatyren, eller det Axel pekat ut med --lanat) på BÅDA sidor, och
// välj paren ur OLIKA scener — de tätaste först, i tidsordning på kortet.
//
// ffmpeg måste klara H.264: Playwrights egen (/opt/pw-browsers/ffmpeg-*) gör
// det INTE (mätt 2026-09-29: 0 h264-avkodare), den från PyPI gör det
// (`pip3 install --user imageio-ffmpeg`, 80 MB statisk binär). hittaFfmpeg()
// provar FFMPEG i miljön, PATH och imageio-ffmpeg och säger vilka som föll.
//
// Vår video: `object_story_spec.video_data.video_id` bär `source` (mätt
// 2026-09-29), `creative.video_id` (reelen) gör det inte. Saknas source
// helt tas Metas egna `thumbnails` (upp till 20 rutor spridda över filmen)
// som våra rutor — då står "ruta 7" i stället för en tid.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';

export const FPS = 2;
export const RUTBREDD = 640;
export const BOKSTAVER = 'ABCDEFGH';
export const MAX_AVSTAND = 6;       // ≤ 6/64 = samma ruta (mätt: våra egna rutor hos ORVO 0–2, andra rutor ≥ 9)
export const UTESLUT_AVSTAND = 14;  // så nära den uteslutna rutan räknas som samma (lånade) klipp
export const UTESLUT_FONSTER_S = 2; // ± så många sekunder runt en lånad ruta kastas också
export const KONTRAST_MIN = 8;      // standardavvikelse (0–255) i 9 × 8-miniatyren — under det är rutan platt (svart, vit, tonad) och säger inget
export const RUTOR_VERSION = 3;     // 2 = rutorna bär `kontrast`, 3 = filmen bär `byten` (klippbytena) — cachen i output/klipp/<id>/rutor-*.json byggs om när den är äldre
export const KLIPPBYTE_TROSKEL = 0.3; // ffmpegs scenpoäng (0–1) för ett klippbyte — mätt 2026-09-29: ORVO:s annons 7 gav 24 byten på 37 s, Sterling-tagningen 27,5–33,2 s blev EN
export const BIBLIOTEK_VERSION = 2; // 2 = filmerna bär `skapad` (annonsens created_time) och `konto`
export const FRO_AVSTAND = 10;      // förhandsbilden mot deras täta rutor (30/s) — mätt 1–7 för rätt ruta
export const KONTROLL_AVSTAND = 10; // de två UTTAGNA bilderna (JPEG, 640 bred) mot varandra — samma ruta ger 0–6, en annan bild 15+ (mätt 2026-09-29)
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

/** Klarar binären att avkoda H.264? (Playwrights ffmpeg gör det inte.) */
export function klararH264(bin) {
  try {
    const ut = execFileSync(bin, ['-hide_banner', '-decoders'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return /^\s*V.{5}\s+h264\s/m.test(ut);
  } catch { return false; }
}

/** Första ffmpeg med H.264: FFMPEG i miljön → PATH → imageio-ffmpeg (pip). `provade` = de som saknade H.264. */
export function hittaFfmpeg({ env = process.env, hem = homedir(), kolla = klararH264, finns = existsSync, lasMapp = readdirSync } = {}) {
  const kandidater = [];
  if (env.FFMPEG) kandidater.push(env.FFMPEG);
  const w = spawnSync('which', ['ffmpeg'], { encoding: 'utf8' });
  if (w.status === 0 && w.stdout.trim()) kandidater.push(w.stdout.trim());
  for (const bas of [join(hem, '.local/lib'), '/usr/local/lib', '/usr/lib', '/usr/lib64']) {
    let pys = [];
    try { pys = lasMapp(bas).filter((d) => /^python3/.test(d)); } catch { continue; }
    for (const py of pys) {
      const m = join(bas, py, 'site-packages/imageio_ffmpeg/binaries');
      if (!finns(m)) continue;
      try { for (const f of lasMapp(m)) if (f.startsWith('ffmpeg')) kandidater.push(join(m, f)); } catch {}
    }
  }
  const provade = [];
  for (const k of [...new Set(kandidater)]) {
    if (!finns(k)) continue;
    if (kolla(k)) return { bin: k, provade };
    provade.push(k);
  }
  return { bin: null, provade };
}

/** dHash ur 72 gråbyte (9 breda × 8 höga): 1 när pixeln är mörkare än grannen till höger. 16 hex. Ren. */
export function dHash(gra) {
  let bits = 0n;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { bits <<= 1n; if (gra[r * 9 + c] < gra[r * 9 + c + 1]) bits |= 1n; }
  return bits.toString(16).padStart(16, '0');
}

/** Hammingavstånd 0–64 mellan två hex-hashar. Ren. */
const pop32 = (v) => { v -= (v >>> 1) & 0x55555555; v = (v & 0x33333333) + ((v >>> 2) & 0x33333333); return Math.imul((v + (v >>> 4)) & 0x0f0f0f0f, 0x01010101) >>> 24; };
const HALVOR = new Map();
const halvor = (h) => { let x = HALVOR.get(h); if (!x) { const s = String(h).padStart(16, '0'); x = [parseInt(s.slice(0, 8), 16) >>> 0, parseInt(s.slice(8, 16), 16) >>> 0]; if (HALVOR.size < 200_000) HALVOR.set(h, x); } return x; };
export function avstand(a, b) {
  // Två 32-bitarshalvor och popcount — ~50 gånger snabbare än BigInt-loopen (13 000 rutor × varje ruta hos dem × varv).
  const [a1, a2] = halvor(a); const [b1, b2] = halvor(b);
  return pop32((a1 ^ b1) >>> 0) + pop32((a2 ^ b2) >>> 0);
}

/** mm:ss ur sekunder ("0:07"). Ren. */
export const tid = (s) => (s === null || s === undefined ? '?' : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`);

/** Prefixet som gör en annons till "samma produkt" i våra konton: första ordet + `_` (Takoverdrag_RI_1_H1 → Takoverdrag_). Ren. */
export const prefixUrNamn = (namn) => { const m = String(namn ?? '').match(/^([A-Za-z0-9]+)_/); return m ? `${m[1]}_` : null; };

/**
 * Kontrasten i en 9 × 8-miniatyr: standardavvikelsen av de 72 gråvärdena (0–255),
 * en decimal. En platt ruta (svart övertoning, vit bakgrund) har nära 0 och får
 * samma hash som varje annan platt ruta — den får aldrig bära ett par. Ren.
 */
export function kontrastAv(gra) {
  const n = gra.length || 1;
  let s = 0; for (const v of gra) s += v;
  const m = s / n;
  let q = 0; for (const v of gra) q += (v - m) ** 2;
  return Math.round(Math.sqrt(q / n) * 10) / 10;
}

/** Rutorna i en video: [{ i, t, hash, kontrast }], en var 1/fps sekund. */
export function rutorUrVideo(ffmpeg, fil, { fps = FPS, maxSek = 240 } = {}) {
  const raw = execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', fil, '-t', String(maxSek), '-vf', `fps=${fps},scale=9:8:flags=area,format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 64 * 1024 * 1024 });
  const n = Math.floor(raw.length / 72);
  const ut = [];
  for (let i = 0; i < n; i++) { const g = raw.subarray(i * 72, i * 72 + 72); ut.push({ i, t: i / fps, hash: dHash(g), kontrast: kontrastAv(g) }); }
  return ut;
}

/** Hash + kontrast för en stillbild (jpg/png/webp) — samma skalning som videorutorna. null om ffmpeg inte kunde läsa den. */
export function bildRuta(ffmpeg, fil) {
  try {
    const raw = execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', fil, '-frames:v', '1', '-vf', 'scale=9:8:flags=area,format=gray', '-f', 'rawvideo', '-'], { maxBuffer: 4 * 1024 * 1024 });
    return raw.length >= 72 ? { hash: dHash(raw.subarray(0, 72)), kontrast: kontrastAv(raw.subarray(0, 72)) } : null;
  } catch { return null; }
}

/** Hashen för en stillbild. null om ffmpeg inte kunde läsa den. */
export const hashUrBild = (ffmpeg, fil) => bildRuta(ffmpeg, fil)?.hash ?? null;

/**
 * Klippbytena i en film, i sekunder, ur ffmpegs scenpoäng. En TAGNING (mellan två byten) är en enhet
 * även när kameran rör sig — hashhoppen mellan halvsekunder delade skakig mobilfilm i en "scen" per
 * ruta (mätt 2026-09-29: det lånade Sterling-klippet blev åtta scener, och uteslutningen missade det).
 */
export function klippbyten(ffmpeg, fil, { troskel = KLIPPBYTE_TROSKEL, maxSek = 240 } = {}) {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-nostats', '-i', fil, '-t', String(maxSek), '-vf', `select='gt(scene,${troskel})',showinfo`, '-an', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return [...String(r.stderr ?? '').matchAll(/pts_time:([0-9.]+)/g)].map((m) => Math.round(Number(m[1]) * 1000) / 1000).filter(Number.isFinite).sort((a, b) => a - b);
}

/** Tagningarna över 2-per-sekund-rutorna, i samma form som scener(): [{ nr, fran, till, tFran, tTill }]. Utan tid (thumbnails) är varje ruta en egen tagning. Ren. */
export function tagningar(rutor, byten = []) {
  const ut = []; let s = null; let k = null;
  rutor.forEach((r, i) => {
    const nr = r.t === null || r.t === undefined ? `r${i}` : byten.filter((b) => b <= r.t + 1e-6).length;
    if (!s || nr !== k) { k = nr; s = { nr: ut.length, fran: i, till: i, tFran: r.t, tTill: r.t }; ut.push(s); }
    s.till = i; s.tTill = r.t;
  });
  return ut;
}

/** Längden i sekunder ur ffmpegs egen utskrift. null när den inte står där. */
export function langd(ffmpeg, fil) {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', fil], { encoding: 'utf8' });
  const m = String(r.stderr ?? '').match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  return m ? Math.round((Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])) * 10) / 10 : null;
}

/** En ruta som JPEG (bredd 640) vid tiden t. Obs: vid ett klippbyte kan det bli rutan FÖRE — använd skrivRutaNr för en jämförd ruta. */
export function skrivRuta(ffmpeg, fil, t, ut, { bredd = RUTBREDD } = {}) {
  mkdirSync(dirname(ut), { recursive: true });
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(t), '-i', fil, '-frames:v', '1', '-vf', `scale=${bredd}:-2`, '-q:v', '3', ut]);
  return ut;
}

/**
 * EXAKT den ruta som hashades: nummer i ur samma fps-kedja som rutorUrVideo.
 * Mätt 2026-09-29 (ORVO, bevis-8 par B): `-ss 4` gav rutan före ett klippbyte i
 * vår film medan rutan som jämförts (nr 8 = 4,0 s) redan var nästa scen — kortet
 * visade två olika bilder med "avstånd 0/64". Därför tas bilden ut på nummer, inte tid.
 */
export function skrivRutaNr(ffmpeg, fil, i, ut, { fps = FPS, bredd = RUTBREDD } = {}) {
  mkdirSync(dirname(ut), { recursive: true });
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', fil, '-vf', `fps=${fps},select=eq(n\\,${Number(i)}),scale=${bredd}:-2`, '-frames:v', '1', '-q:v', '3', ut]);
  if (!existsSync(ut)) throw new Error(`ruta ${i} finns inte i ${fil}`);
  return ut;
}

/** Laddar ner en video (eller bild) till fil. Kastar med status när den inte svarar. */
export async function hamtaFil(url, fil, { fetchFn = fetch, timeout = 120_000, maxByte = 120_000_000 } = {}) {
  const res = await fetchFn(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} från ${new URL(url).host}`);
  const b = Buffer.from(await res.arrayBuffer());
  if (!b.length) throw new Error(`tom fil från ${new URL(url).host}`);
  if (b.length > maxByte) throw new Error(`${Math.round(b.length / 1e6)} MB — större än taket ${Math.round(maxByte / 1e6)} MB`);
  mkdirSync(dirname(fil), { recursive: true });
  writeFileSync(fil, b);
  return { fil, byte: b.length };
}

/** Video-id:na i en annons creative, det som brukar bära `source` först. Ren. */
export const videoIdn = (creative = {}) => [...new Set([creative.object_story_spec?.video_data?.video_id, creative.video_id, ...(creative.asset_feed_spec?.videos ?? []).map((v) => v.video_id)].filter(Boolean))];

/** Källan för EN video: { videoId, source, langd, kalla: 'source' } | { …, kalla: 'thumbnails', thumbnails } | { fel }. */
export async function videoKalla(klient, ider) {
  let langdS = null; let thumbnails = []; let forstaId = null;
  for (const vid of ider) {
    forstaId ??= vid;
    const v = await klient.get(`${vid}?fields=source,length,thumbnails.limit(20){uri}`);
    if (v?.length) langdS = v.length;
    if (v?.source) return { videoId: vid, source: v.source, langd: v.length ?? null, kalla: 'source' };
    if (!thumbnails.length && v?.thumbnails?.data?.length) thumbnails = v.thumbnails.data.map((t) => t.uri).filter(Boolean);
  }
  if (thumbnails.length) return { videoId: forstaId, source: null, langd: langdS, kalla: 'thumbnails', thumbnails };
  return { videoId: forstaId, fel: 'Meta lämnar varken source eller thumbnails för videon' };
}

/**
 * Vår annonsvideo via Meta: video-id:na ur creativen, det första med `source`
 * vinner; annars Metas thumbnails som reserv. `klient.get(sökväg)` = kommentarer/meta.mjs.
 */
export async function varVideo(klient, annonsId) {
  const ad = await klient.get(`${annonsId}?fields=name,created_time,creative{video_id,object_story_spec{video_data{video_id}},asset_feed_spec{videos{video_id}}}`);
  const ider = videoIdn(ad?.creative);
  if (!ider.length) return { namn: ad?.name ?? null, skapad: ad?.created_time ?? null, fel: 'annonsen har ingen video (bildannons?)' };
  return { namn: ad?.name ?? null, skapad: ad?.created_time ?? null, ...(await videoKalla(klient, ider)) };
}

/**
 * Biblioteket: alla våra videoannonser i kontona vars namn börjar med något av
 * prefixen (aktiva OCH pausade — deras klipp kan komma ur en äldre film).
 * `skapad` = annonsens created_time: bara filmer publicerade FÖRE deras annons
 * får bära ett par (paraRutor `fore`). En video i flera annonser räknas en gång,
 * med den ÄLDSTA annonsens datum.
 * @returns {Promise<{ filmer: Array<{ videoId, ider, annonsId, namn, konto, status, skapad }>, status: object[] }>}
 */
export async function egnaFilmer(klient, konton, prefixer, { logg = () => {}, max = 500 } = {}) {
  const perVideo = new Map(); const status = [];
  for (const konto of konton) {
    const act = `act_${String(konto.id).replace(/^act_/, '')}`;
    for (const prefix of prefixer) {
      let antal = 0;
      try {
        let nasta = `${act}/ads?fields=id,name,effective_status,created_time,creative{video_id,object_story_spec{video_data{video_id}},asset_feed_spec{videos{video_id}}}&limit=200&filtering=${encodeURIComponent(JSON.stringify([{ field: 'name', operator: 'CONTAIN', value: prefix }]))}`;
        while (nasta && perVideo.size < max) {
          const j = await klient.get(nasta);
          for (const a of j?.data ?? []) {
            if (!String(a.name ?? '').startsWith(prefix)) continue;
            const ider = videoIdn(a.creative);
            if (!ider.length) continue;
            const nyckel = ider[0];
            const finns = perVideo.get(nyckel);
            if (!finns) { perVideo.set(nyckel, { videoId: nyckel, ider, annonsId: a.id, namn: a.name, konto: konto.id, status: a.effective_status ?? null, skapad: a.created_time ?? null }); antal++; }
            else if (a.created_time && (!finns.skapad || a.created_time < finns.skapad)) Object.assign(finns, { annonsId: a.id, namn: a.name, konto: konto.id, status: a.effective_status ?? null, skapad: a.created_time });
          }
          nasta = j?.paging?.next ?? null;
        }
        status.push({ konto: konto.namn ?? konto.id, prefix, filmer: antal });
        logg(`  ${konto.namn ?? konto.id} · ${prefix}*: ${antal} filmer`);
      } catch (e) {
        status.push({ konto: konto.namn ?? konto.id, prefix, fel: e.meta?.message ?? e.message });
        logg(`  ⚠️ ${konto.namn ?? konto.id} · ${prefix}*: ${e.message}`);
      }
    }
  }
  return { filmer: [...perVideo.values()], status };
}

/** Scenerna i en ruta-serie: ny scen när rutan skiljer sig mer än `trosk` bitar från den före. Ren. */
export function scener(rutor, { trosk = 20 } = {}) {
  const ut = [];
  let s = null;
  rutor.forEach((r, i) => {
    if (!s || avstand(r.hash, rutor[i - 1].hash) > trosk) { s = { nr: ut.length, fran: i, till: i, tFran: r.t, tTill: r.t }; ut.push(s); }
    s.till = i; s.tTill = r.t;
  });
  return ut;
}

/** Vilka rutor (index) som ligger nära en utesluten hash — plus ± fönster i sekunder runt dem. Ren. */
export function lanadeRutor(rutor, uteslut, { uteslutAvstand = UTESLUT_AVSTAND, fonsterS = UTESLUT_FONSTER_S } = {}) {
  const traff = rutor.filter((r) => uteslut.some((u) => u && avstand(r.hash, u) <= uteslutAvstand));
  const ut = new Set();
  for (const r of traff) {
    ut.add(r.i);
    if (r.t === null || r.t === undefined) continue;
    for (const x of rutor) if (x.t !== null && x.t !== undefined && Math.abs(x.t - r.t) <= fonsterS) ut.add(x.i);
  }
  return ut;
}

/** Är filmen f publicerad före g? En film utan datum är aldrig äldre. Ren. */
const aldre = (f, g) => Boolean(f?.skapad) && (!g?.skapad || String(f.skapad) < String(g.skapad));

/**
 * De lånade klippen (Axel 2026-09-29: klippen på förhandsbilderna är lånade). Mätt samma kväll:
 * förhandsbilden är deras allra första bildruta (1–7 bitar mot rutan vid 0,00 s i alla tio annonser),
 * men 2 rutor/s missade den — så en uteslutning runt hashen släppte igenom resten av klippet.
 *  - DERAS sida: hela TAGNINGAR (`scener` = klippbytena; ORVO klipper hårt). Frön = tagningen med
 *    förhandsbilden och de Axel pekat ut. Spridning bara deras ↔ deras: en tagning med en ruta inom
 *    `maxAvstand` från en lånad ruta i en annan annons (samma lånade klipp återanvänt) blir lånad.
 *  - VÅR sida: bara rutorna inom `maxAvstand` från en lånad ruta (± `fonsterS`), aldrig hela våra
 *    scener, och vår sida sprider aldrig tillbaka. Mätt 2026-09-29: spridning genom våra filmer märkte
 *    184 av 240 filmer och 2 716 rutor som lånade — långt över Axels "nittio procent är våra".
 * Platta rutor sprider aldrig. Ren.
 * @param annonser [{ nr, rutor, fron: [sekunder], scener? }] · @param filmer [{ id, rutor }]
 * @returns {{ deras: Map<nr, Set<i>>, egna: Map<id, Set<i>>, rutor: number, varv: number }}
 */
export function lanadeKlipp(annonser, filmer, { fronHashar = [], fronEgna = [], maxAvstand = MAX_AVSTAND, spridAvstand = 5, minTraffar = 2, scenTrosk = 20, varv = 2, kontrastMin = KONTRAST_MIN, fonsterS = 1 } = {}) {
  const informativ = (r) => r.kontrast === undefined || r.kontrast === null || r.kontrast >= kontrastMin;
  const deras = annonser.map((a) => ({ nr: a.nr, rutor: a.rutor ?? [], fron: a.fron ?? [], scener: a.scener ?? scener(a.rutor ?? [], { trosk: scenTrosk }) }));
  const ut = { deras: new Map(), egna: new Map() };
  const B = new Set(fronHashar.filter(Boolean));
  const klar = new Set();
  // Hela tagningen utesluts, men bara rutorna INNE i den sprider: den första och sista rutan kan visa
  // grannklippet (mätt 2026-09-29: annons 18:s ruta vid 3,0 s var redan nästa klipp — ett av VÅRA, som
  // finns i nästan alla deras annonser — och därifrån märktes 54 tagningar på tre varv).
  const markera = (d, s) => {
    const id = `${d.nr}:${s.nr}`; if (klar.has(id)) return 0; klar.add(id);
    if (!ut.deras.has(d.nr)) ut.deras.set(d.nr, new Set());
    for (let i = s.fran; i <= s.till; i++) {
      ut.deras.get(d.nr).add(d.rutor[i].i);
      const kant = (i === s.fran && (s.tFran ?? 0) > 0) || (i === s.till && i < d.rutor.length - 1);
      if (!kant && informativ(d.rutor[i])) B.add(d.rutor[i].hash);
    }
    return 1;
  };
  const markeraEgen = (f, r) => {
    if (!ut.egna.has(f.id)) ut.egna.set(f.id, new Set());
    const set = ut.egna.get(f.id); set.add(r.i);
    if (r.t !== null && r.t !== undefined) for (const x of f.rutor) if (x.t !== null && x.t !== undefined && Math.abs(x.t - r.t) <= fonsterS) set.add(x.i);
  };
  // Frön: tagningen hos dem med förhandsbilden (eller Axels ruta), och Axels ruta i vår film (± fönstret).
  for (const d of deras) for (const t of d.fron) { const s = d.scener.find((x) => t >= x.tFran - 0.26 && t <= x.tTill + 0.26); if (s) markera(d, s); }
  for (const x of fronEgna) { const f = filmer.find((y) => y.id === x.id); if (!f) continue; for (const r of f.rutor) if (r.t !== null && r.t !== undefined && Math.abs(r.t - x.t) <= fonsterS) { markeraEgen(f, r); if (informativ(r)) B.add(r.hash); } }
  // Spridning deras ↔ deras: samma lånade klipp i en annan av deras annonser. En tagning märks först när
  // minst `minTraffar` av dess informativa rutor (alla, om den har färre) ligger inom `spridAvstand` från en
  // lånad ruta — en enstaka lik ruta räcker inte (samma bildkomposition ger nära hashar i olika klipp).
  let gjorda = 0;
  while (gjorda < varv) {
    gjorda++;
    const lista = [...B]; let nya = 0;
    for (const d of deras) for (const s of d.scener) {
      if (klar.has(`${d.nr}:${s.nr}`)) continue;
      const inf = d.rutor.slice(s.fran, s.till + 1).filter(informativ);
      const behov = Math.min(minTraffar, inf.length);
      if (!behov) continue;
      let traff = 0;
      for (const r of inf) { if (lista.some((h) => avstand(r.hash, h) <= spridAvstand)) traff++; if (traff >= behov) break; }
      if (traff >= behov) nya += markera(d, s);
    }
    if (!nya) break;
  }
  // Vår sida: rutorna som liknar en lånad ruta (± fönstret) — ingen spridning tillbaka.
  const lista = [...B];
  for (const f of filmer) for (const r of f.rutor) if (informativ(r) && lista.some((h) => avstand(r.hash, h) <= maxAvstand)) markeraEgen(f, r);
  return { ...ut, rutor: B.size, varv: gjorda };
}

/**
 * Paren. `egna` = en lista filmer [{ id, namn, rutor }] (eller en platt rutlista
 * för en film). För varje ruta hos dem den närmaste hos oss över ALLA filmer;
 * en kandidat per scen hos dem (den tätaste); scener som bär en lånad ruta
 * kastas (på båda sidor, ± fönstret); `antal` par väljs ur olika scener hos
 * dem OCH olika scener/filmer hos oss, tätast först, sedan i tidsordning. Ren.
 *
 * @returns {{ val: object[], uteslutna: object[], statistik: object }}
 */
export function paraRutor(egna, deras, { maxAvstand = MAX_AVSTAND, uteslut = [], uteslutAvstand = UTESLUT_AVSTAND, fonsterS = UTESLUT_FONSTER_S, antal = 3, scenTrosk = 20, minSkillnad = 8, kontrastMin = KONTRAST_MIN, fore = null, lanadeEgnaExtra = null, lanadeDerasExtra = null, derasScener = null } = {}) {
  const allaFilmer = Array.isArray(egna) && egna.length && egna[0]?.rutor ? egna : [{ id: null, namn: null, rutor: egna ?? [] }];
  // Bara filmer publicerade FÖRE deras annons (datumet ur annonsbiblioteket) — en senare film kan inte vara originalet.
  const foreDag = fore ? String(fore).slice(0, 10) : null;
  const senare = foreDag ? allaFilmer.filter((f) => f.skapad && String(f.skapad).slice(0, 10) >= foreDag) : [];
  const informativ = (r) => r.kontrast === undefined || r.kontrast === null || r.kontrast >= kontrastMin;
  const filmer = allaFilmer.filter((f) => !senare.includes(f)).map((f) => ({ ...f, rutor: f.rutor.filter(informativ) })).filter((f) => f.rutor.length);
  const tomma = deras.filter((d) => !informativ(d)).length;
  const statistik = { derasRutor: deras.length - tomma, utanInnehall: tomma, egnaRutor: filmer.reduce((s, f) => s + f.rutor.length, 0), filmer: filmer.length, filmerSenare: senare.length, traffar: 0, andel: 0, lanadeRutor: 0, scener: 0, matchadeScener: 0, uteslutnaScener: 0, perFilm: {} };
  if (!statistik.egnaRutor || !statistik.derasRutor) return { val: [], uteslutna: [], statistik };
  // Lånat = nära en utesluten hash (± fönstret) ELLER utpekat av lanadeKlipp (hela scener, spridda över annonser och filmer).
  const lanadeEgna = new Map(filmer.map((f) => [f.id, new Set([...lanadeRutor(f.rutor, uteslut, { uteslutAvstand, fonsterS }), ...(lanadeEgnaExtra?.get(f.id) ?? [])])]));
  const lanadeDeras = new Set([...lanadeRutor(deras, uteslut, { uteslutAvstand, fonsterS }), ...(lanadeDerasExtra ?? [])]);
  // Våra scener: hashhoppen, INTE klippbytena — mätt 2026-09-29: våra AI-filmer har mjuka övergångar, så
  // ffmpeg slog ihop flera av våra klipp till en tagning (SP_2_H1: 3 byten på 24 s). Räknas på ALLA rutor
  // (även platta), och rutan slås upp på sin plats i den listan — inte på sitt nummer i den filtrerade.
  const egnaScener = new Map(allaFilmer.map((f) => [f.id, { lista: scener(f.rutor, { trosk: scenTrosk }), plats: new Map(f.rutor.map((r, p) => [r.i, p])) }]));
  const egenScenFor = (film, i) => { const e = egnaScener.get(film); const p = e?.plats.get(i); return `${film}:${e?.lista.find((s) => p >= s.fran && p <= s.till)?.nr ?? -1}`; };
  const basta = deras.map((d) => {
    let b = null;
    // Lika nära ⇒ den ÄLDSTA filmen vinner: beviset ska peka på första gången vi publicerade klippet.
    for (const f of filmer) for (const e of f.rutor) { const a = avstand(d.hash, e.hash); if (!b || a < b.avstand || (a === b.avstand && aldre(f, b.film))) b = { egen: e, film: f, avstand: a }; }
    // En platt ruta hos dem (svart övertoning) matchar vilken platt ruta som helst — den räknas aldrig.
    const tom = !informativ(d);
    return { deras: d, egen: b.egen, film: b.film, avstand: tom ? 64 : b.avstand, tom, lanad: lanadeDeras.has(d.i) || lanadeEgna.get(b.film.id)?.has(b.egen.i) };
  });
  // Andelen räknas UTAN de lånade rutorna — de matchar också (samma b-roll hos båda), men dem gör vi inte anspråk på.
  const traffar = basta.filter((p) => p.avstand <= maxAvstand && !p.lanad && !p.tom);
  statistik.lanadeRutor = basta.filter((p) => p.lanad && !p.tom).length;
  for (const p of traffar) { const n = p.film.namn ?? p.film.id ?? 'film'; statistik.perFilm[n] = (statistik.perFilm[n] ?? 0) + 1; }
  // Stöd: matchar också grannrutorna (deras i±1 mot samma films j±1)? Ett par mitt i ett gemensamt klipp
  // är starkare bevis än ett par vid ett klippbyte, där en enda ruta kan råka likna (ORVO 2026-09-29).
  const rutaNr = new Map(filmer.map((f) => [f.id, new Map(f.rutor.map((r) => [r.i, r]))]));
  const stod = (p) => {
    if (p.egen.t === null || p.egen.t === undefined) return 0;
    let n = 0;
    for (const s of [-1, 1]) {
      const d = deras.find((x) => x.i === p.deras.i + s); const e = rutaNr.get(p.film.id)?.get(p.egen.i + s);
      if (d && e && informativ(d) && avstand(d.hash, e.hash) <= maxAvstand) n++;
    }
    return n;
  };
  for (const p of basta) p.stod = p.avstand <= maxAvstand && !p.tom ? stod(p) : 0;
  const derasScenLista = derasScener ?? scener(deras, { trosk: scenTrosk });
  const kandidater = []; const uteslutna = [];
  for (const s of derasScenLista) {
    const inom = basta.slice(s.fran, s.till + 1);
    const par = inom.filter((p) => p.avstand <= maxAvstand && !p.tom);
    if (!par.length) continue;
    const mitt = (s.fran + s.till) / 2;
    par.sort((x, y) => y.stod - x.stod || x.avstand - y.avstand || Math.abs(x.deras.i - mitt) - Math.abs(y.deras.i - mitt));
    const b = { ...par[0], scen: { nr: s.nr, tFran: s.tFran, tTill: s.tTill }, langd: s.till - s.fran + 1, egenScen: egenScenFor(par[0].film.id, par[0].egen.i) };
    if (inom.some((p) => p.lanad)) uteslutna.push({ ...b, orsak: 'lånat klipp — utesluten ruta i scenen' });
    else kandidater.push(b);
  }
  kandidater.sort((x, y) => y.stod - x.stod || x.avstand - y.avstand || y.langd - x.langd);
  const val = [];
  for (const k of kandidater) {
    if (val.length >= antal) break;
    if (val.some((v) => v.egenScen === k.egenScen || avstand(v.deras.hash, k.deras.hash) < minSkillnad)) continue;
    val.push({ ...k, rang: val.length });
  }
  val.sort((x, y) => x.deras.t - y.deras.t);
  const platt = (v, k) => ({ ...(k === undefined ? {} : { k, bokstav: BOKSTAVER[k] ?? String(k + 1) }), ...(v.rang === undefined ? {} : { rang: v.rang }), derasT: v.deras.t, derasI: v.deras.i, egenT: v.egen.t, egenI: v.egen.i, egenFil: v.egen.fil ?? null, egenFilm: { id: v.film.id, namn: v.film.namn, ...(v.film.skapad ? { skapad: v.film.skapad } : {}), ...(v.film.verksamhet ? { verksamhet: v.film.verksamhet } : {}) }, avstand: v.avstand, stod: v.stod ?? 0, derasHash: v.deras.hash, egenHash: v.egen.hash, scen: v.scen, ...(v.orsak ? { orsak: v.orsak } : {}) });
  Object.assign(statistik, { traffar: traffar.length, andel: Math.round((100 * traffar.length) / statistik.derasRutor), scener: derasScenLista.length, matchadeScener: kandidater.length + uteslutna.length, uteslutnaScener: uteslutna.length });
  return { val: val.map((v, k) => platt(v, k)), uteslutna: uteslutna.map((v) => platt(v)), statistik };
}

/** En mening om läget för ett par-urval — till kortet, brevet och rapporten. Ren. */
export function klippSammanfattning(klipp, { sprak = 'sv' } = {}) {
  const n = klipp?.val?.length ?? klipp?.antal ?? 0;
  const andel = klipp?.statistik?.andel ?? klipp?.andel ?? null;
  if (!n) return sprak === 'sv' ? 'inga rutor ur våra klipp' : 'no frames from our clips';
  return sprak === 'sv'
    ? `filmen är klippt ur våra: ${n} rutor ur olika scener identiska med våra${andel !== null ? `, ${andel} % av deras rutor matchar våra filmer` : ''}`
    : `the video is cut from ours: ${n} frames from different scenes identical to ours${andel !== null ? `, ${andel}% of its frames match our films` : ''}`;
}

/**
 * Är annonsens kopiering BEVISAD med vårt eget material? (Axel 2026-09-29:
 * miniatyrerna — filmannonsernas förhandsbilder — var lånade klipp, så en film
 * räknas bara när klippvalet hittat rutor ur VÅRA klipp.) Ren.
 *  - text: ordagrann annonstext → bevisad
 *  - film: klippvalet har par ur våra egna filmer → bevisad
 *  - bild: en BILDannons vars bild är vår → bevisad (en films miniatyr räknas aldrig som bild)
 *  - miniatyr: en film där klippvalet aldrig körts och inget annat bär → räknas som förut men
 *    `overifierad` (kor.mjs stoppar --anmal/--faktura/--skicka tills --klipp körts)
 *  - film där klippvalet kördes och bara det lånade matchade, eller föll tekniskt → EJ bevisad
 * `grund` = 'text', 'film', 'bild' eller kombinationer ('text+film' …), 'miniatyr' eller null.
 */
export function bevisStatus(t) {
  const text = Boolean(t?.text?.styrka);
  const film = Boolean(t?.klipp?.antal);
  const harBild = Boolean(t?.bilder?.length);
  const bild = harBild && !t?.video;
  if (text || film || bild) return { bevisad: true, text, film, bild, grund: [text && 'text', film && 'film', bild && 'bild'].filter(Boolean).join('+') };
  if (harBild && t?.video && !t?.klippStatus) return { bevisad: true, text: false, film: false, bild: false, grund: 'miniatyr', overifierad: true };
  const orsak = t?.klippStatus === 'ej_bevisad' ? `bara lånat material matchar — ${t.klippFel ?? 'inga rutor ur våra klipp'}`
    : t?.klippStatus === 'fel' ? `klippjämförelsen gick inte: ${t.klippFel ?? 'okänt fel'}` : 'ingen träff';
  return { bevisad: false, text: false, film: false, bild: false, grund: null, orsak };
}

/** Produkten paren pekar på: filmernas prefix → produkt (ur ärendets annonser), flest par vinner. Ren. */
export function produktForPar(val, prefixKarta, reserv = null) {
  const rost = new Map();
  for (const v of val ?? []) { const p = prefixUrNamn(v.egenFilm?.namn); if (p && prefixKarta.has(p)) rost.set(p, (rost.get(p) ?? 0) + 1); }
  const vinnare = [...rost.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  return vinnare ? prefixKarta.get(vinnare) : reserv;
}

/** Datumintervallet för filmerna i paren: { forsta, sista } (YYYY-MM-DD) eller null. Ren. */
export function filmdatum(val) {
  const d = (val ?? []).map((v) => v.egenFilm?.skapad ?? v.skapad).filter(Boolean).map((x) => String(x).slice(0, 10)).sort();
  return d.length ? { forsta: d[0], sista: d.at(-1) } : null;
}
