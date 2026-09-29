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
export function avstand(a, b) {
  let x = BigInt(`0x${a}`) ^ BigInt(`0x${b}`);
  let n = 0;
  while (x) { n += Number(x & 1n); x >>= 1n; }
  return n;
}

/** mm:ss ur sekunder ("0:07"). Ren. */
export const tid = (s) => (s === null || s === undefined ? '?' : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`);

/** Prefixet som gör en annons till "samma produkt" i våra konton: första ordet + `_` (Takoverdrag_RI_1_H1 → Takoverdrag_). Ren. */
export const prefixUrNamn = (namn) => { const m = String(namn ?? '').match(/^([A-Za-z0-9]+)_/); return m ? `${m[1]}_` : null; };

/** Rutorna i en video: [{ i, t, hash }], en var 1/fps sekund. */
export function rutorUrVideo(ffmpeg, fil, { fps = FPS, maxSek = 240 } = {}) {
  const raw = execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', fil, '-t', String(maxSek), '-vf', `fps=${fps},scale=9:8:flags=area,format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 64 * 1024 * 1024 });
  const n = Math.floor(raw.length / 72);
  const ut = [];
  for (let i = 0; i < n; i++) ut.push({ i, t: i / fps, hash: dHash(raw.subarray(i * 72, i * 72 + 72)) });
  return ut;
}

/** Hashen för en stillbild (jpg/png/webp) — samma skalning som videorutorna. null om ffmpeg inte kunde läsa den. */
export function hashUrBild(ffmpeg, fil) {
  try {
    const raw = execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-i', fil, '-frames:v', '1', '-vf', 'scale=9:8:flags=area,format=gray', '-f', 'rawvideo', '-'], { maxBuffer: 4 * 1024 * 1024 });
    return raw.length >= 72 ? dHash(raw.subarray(0, 72)) : null;
  } catch { return null; }
}

/** Längden i sekunder ur ffmpegs egen utskrift. null när den inte står där. */
export function langd(ffmpeg, fil) {
  const r = spawnSync(ffmpeg, ['-hide_banner', '-i', fil], { encoding: 'utf8' });
  const m = String(r.stderr ?? '').match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
  return m ? Math.round((Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3])) * 10) / 10 : null;
}

/** En ruta som JPEG (bredd 640) vid tiden t. */
export function skrivRuta(ffmpeg, fil, t, ut, { bredd = RUTBREDD } = {}) {
  mkdirSync(dirname(ut), { recursive: true });
  execFileSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(t), '-i', fil, '-frames:v', '1', '-vf', `scale=${bredd}:-2`, '-q:v', '3', ut]);
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
  const ad = await klient.get(`${annonsId}?fields=name,creative{video_id,object_story_spec{video_data{video_id}},asset_feed_spec{videos{video_id}}}`);
  const ider = videoIdn(ad?.creative);
  if (!ider.length) return { namn: ad?.name ?? null, fel: 'annonsen har ingen video (bildannons?)' };
  return { namn: ad?.name ?? null, ...(await videoKalla(klient, ider)) };
}

/**
 * Biblioteket: alla våra videoannonser i kontona vars namn börjar med något av
 * prefixen (aktiva OCH pausade — deras klipp kan komma ur en äldre film).
 * @returns {Promise<{ filmer: Array<{ videoId, annonsId, namn, konto, status }>, status: object[] }>}
 */
export async function egnaFilmer(klient, konton, prefixer, { logg = () => {}, max = 120 } = {}) {
  const perVideo = new Map(); const status = [];
  for (const konto of konton) {
    const act = `act_${String(konto.id).replace(/^act_/, '')}`;
    for (const prefix of prefixer) {
      let antal = 0;
      try {
        let nasta = `${act}/ads?fields=id,name,effective_status,creative{video_id,object_story_spec{video_data{video_id}},asset_feed_spec{videos{video_id}}}&limit=200&filtering=${encodeURIComponent(JSON.stringify([{ field: 'name', operator: 'CONTAIN', value: prefix }]))}`;
        while (nasta && perVideo.size < max) {
          const j = await klient.get(nasta);
          for (const a of j?.data ?? []) {
            if (!String(a.name ?? '').startsWith(prefix)) continue;
            const ider = videoIdn(a.creative);
            if (!ider.length) continue;
            const nyckel = ider[0];
            if (!perVideo.has(nyckel)) { perVideo.set(nyckel, { videoId: nyckel, ider, annonsId: a.id, namn: a.name, konto: konto.id, status: a.effective_status ?? null }); antal++; }
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

/**
 * Paren. `egna` = en lista filmer [{ id, namn, rutor }] (eller en platt rutlista
 * för en film). För varje ruta hos dem den närmaste hos oss över ALLA filmer;
 * en kandidat per scen hos dem (den tätaste); scener som bär en lånad ruta
 * kastas (på båda sidor, ± fönstret); `antal` par väljs ur olika scener hos
 * dem OCH olika scener/filmer hos oss, tätast först, sedan i tidsordning. Ren.
 *
 * @returns {{ val: object[], uteslutna: object[], statistik: object }}
 */
export function paraRutor(egna, deras, { maxAvstand = MAX_AVSTAND, uteslut = [], uteslutAvstand = UTESLUT_AVSTAND, fonsterS = UTESLUT_FONSTER_S, antal = 3, scenTrosk = 20, minSkillnad = 8 } = {}) {
  const filmer = Array.isArray(egna) && egna.length && egna[0]?.rutor ? egna : [{ id: null, namn: null, rutor: egna ?? [] }];
  const statistik = { derasRutor: deras.length, egnaRutor: filmer.reduce((s, f) => s + f.rutor.length, 0), filmer: filmer.length, traffar: 0, andel: 0, lanadeRutor: 0, scener: 0, matchadeScener: 0, uteslutnaScener: 0, perFilm: {} };
  if (!statistik.egnaRutor || !deras.length) return { val: [], uteslutna: [], statistik };
  const lanadeEgna = new Map(filmer.map((f) => [f.id, lanadeRutor(f.rutor, uteslut, { uteslutAvstand, fonsterS })]));
  const lanadeDeras = lanadeRutor(deras, uteslut, { uteslutAvstand, fonsterS });
  const egnaScener = new Map(filmer.map((f) => [f.id, scener(f.rutor, { trosk: scenTrosk })]));
  const egenScenFor = (film, i) => `${film}:${egnaScener.get(film)?.find((s) => i >= s.fran && i <= s.till)?.nr ?? -1}`;
  const basta = deras.map((d) => {
    let b = null;
    for (const f of filmer) for (const e of f.rutor) { const a = avstand(d.hash, e.hash); if (!b || a < b.avstand) b = { egen: e, film: f, avstand: a }; }
    return { deras: d, egen: b.egen, film: b.film, avstand: b.avstand, lanad: lanadeDeras.has(d.i) || lanadeEgna.get(b.film.id)?.has(b.egen.i) };
  });
  // Andelen räknas UTAN de lånade rutorna — de matchar också (samma b-roll hos båda), men dem gör vi inte anspråk på.
  const traffar = basta.filter((p) => p.avstand <= maxAvstand && !p.lanad);
  statistik.lanadeRutor = basta.filter((p) => p.lanad).length;
  for (const p of traffar) { const n = p.film.namn ?? p.film.id ?? 'film'; statistik.perFilm[n] = (statistik.perFilm[n] ?? 0) + 1; }
  const derasScener = scener(deras, { trosk: scenTrosk });
  const kandidater = []; const uteslutna = [];
  for (const s of derasScener) {
    const inom = basta.slice(s.fran, s.till + 1);
    const par = inom.filter((p) => p.avstand <= maxAvstand);
    if (!par.length) continue;
    const mitt = (s.fran + s.till) / 2;
    par.sort((x, y) => x.avstand - y.avstand || Math.abs(x.deras.i - mitt) - Math.abs(y.deras.i - mitt));
    const b = { ...par[0], scen: { nr: s.nr, tFran: s.tFran, tTill: s.tTill }, langd: s.till - s.fran + 1, egenScen: egenScenFor(par[0].film.id, par[0].egen.i) };
    if (inom.some((p) => p.lanad)) uteslutna.push({ ...b, orsak: 'lånat klipp — utesluten ruta i scenen' });
    else kandidater.push(b);
  }
  kandidater.sort((x, y) => x.avstand - y.avstand || y.langd - x.langd);
  const val = [];
  for (const k of kandidater) {
    if (val.length >= antal) break;
    if (val.some((v) => v.egenScen === k.egenScen || avstand(v.deras.hash, k.deras.hash) < minSkillnad)) continue;
    val.push(k);
  }
  val.sort((x, y) => x.deras.t - y.deras.t);
  const platt = (v, k) => ({ ...(k === undefined ? {} : { k, bokstav: BOKSTAVER[k] ?? String(k + 1) }), derasT: v.deras.t, derasI: v.deras.i, egenT: v.egen.t, egenI: v.egen.i, egenFil: v.egen.fil ?? null, egenFilm: { id: v.film.id, namn: v.film.namn }, avstand: v.avstand, derasHash: v.deras.hash, egenHash: v.egen.hash, scen: v.scen, ...(v.orsak ? { orsak: v.orsak } : {}) });
  Object.assign(statistik, { traffar: traffar.length, andel: Math.round((100 * traffar.length) / deras.length), scener: derasScener.length, matchadeScener: kandidater.length + uteslutna.length, uteslutnaScener: uteslutna.length });
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
