#!/usr/bin/env node
// brand-detektor.mjs — Uppdrag A i factory/FAS2.md.
//
// "Vilka av Bäverbutikens annonser måste göras om innan de kan köras för
// OPS-butiken?" Frågan har fyra svar per annons, inte ett, eftersom de fyra
// ytorna kostar helt olika mycket att åtgärda:
//
//   yta 1  ad copy (message/headline/description + länk)  gratis, skriv om
//   yta 2  talet i videon (SRT-transkriptet)              HeyGen-krediter
//   yta 3  inbränd text + slutkort (frames)               arbetstid
//   yta 4  attribution i bildannons ("baverbutiken.se")   gratis, oversatt-bild.py
//
//   node factory/brand-detektor.mjs --produkt <id> [--marknad SE|NO] [--hamta]
//                                    [--tathet 0.5] [--torr]
//
//   --marknad SE (default) läser kalla.annonskonto/annonsprefix, NO läser
//             kalla.no_annonskonto/no_annonsprefix och skriver -no-rapporten.
//             ⚠️ NO-halvan är inte valfri: en norsk annons ärver ALDRIG sin
//             svenska systers dom (FAS2, Axels bakläxa 2026-09-09).
//
//   --hamta   ladda ner media (video + bild), dra frames och OCR:a dem.
//             Utan flaggan återanvänds den sparade OCR:en i
//             factory/output/<id>/brand-ocr.json — så rapporten går att köra
//             om utan att hämta 200 MB video igen.
//   --tathet  sekunder mellan frames (default 0,5). ⚠️ Läs varningen vid
//             TATHET_SEK innan du glesar ut den.
//   --torr    skriv inga filer, visa bara rapporten.
//
// Läser BARA. Rör aldrig ett annonskonto, en kampanj eller en status.
// Kostar 0 kr: Meta Graph (läs), redan nedladdade transkript, ffmpeg och
// lokal OCR. Ingen HeyGen, ingen kie.ai.
//
// Källkopplingen kommer ur produktfilens `kalla:`-block — utan den kan ingen
// körning veta vilka annonser som hör till butiken (FAS2, Uppdrag A).
// ⚠️ Kontot kontrolleras alltid på id, aldrig på namn: källa = MagiBorsten
// 1867947880635861 (Bäverbutiken), mål = MagiBorsten DK 915422744950975 (OPS).
//
// Kräver env META_ACCESS_TOKEN. OCR-steget kräver python3 + rapidocr-onnxruntime
// (factory/brand-text.py säger till om det saknas) — utan det blir yta 3 och 4
// "okänd", aldrig "ren".

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { lasYaml } from './yaml.mjs';
import { sökBrand } from './brandord.mjs';
import { skannaVillkor } from './villkorsskanning.mjs';
import { säkerställProxy, api, alla } from '../tools/meta-lib.mjs';

const ROT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const SRT_ROT = join(ROT, 'market-expansion');
const ARBETSYTA = join(ROT, '.scratch', 'brand-detektor');

// Sekunder mellan frames när videon skannas.
// ⚠️ 1,5 s (qa-frames.py:s default för mänsklig briefkontroll) MISSAR text.
// Mätt 2026-09-08 på IBC_SP_1_H2: brandraden "från Bäbebutiken." stod på
// skärmen 10,75–11,75 s och låg helt i glappet mellan frame 10,50 s och 12,00 s.
// OCR:en dömde annonsen "ren" på yta 3 — en ögongranskare hittade raden direkt.
// Det var ett SAMPLINGSFEL, inte ett OCR-fel. Glesa aldrig ut det här värdet
// för att spara tid: en missad rad kostar Bäverbutikens namn i TankGuards annons.
const TATHET_SEK = 0.3;

// Taket måste följa med tätheten, annars glesar qa-frames.py ut mitten i tysthet
// och 0,3 s blir 0,6 s utan att någon säger till. Se kommentaren där.
const MAX_FRAMES = 400;

// Andelen av speltiden efter vilken en träff räknas som "sent i filmen".
// ⚠️ Positionen säger INTE om det är ett slutkort. Mätt 2026-09-08: IBC_GT_1_H3
// och IBC_PD_1_H3 har brandtext sent i filmen men INGET slutkort alls — det är
// vanlig undertext — medan IBC_PD_3_H1 och IBC_GT_3_H1 har ett riktigt byggt
// slutkort med ordmärke, logotyp och en skärmdump av produktsidan.
// Skillnaden syns bara för ett öga. Därför heter raden "sent i filmen", inte
// "slutkort", och den riktiga domen kommer ur ögongranskningen (brand-syn.json).
const SENT_ANDEL = 0.8;

const DOMAR = {
  ren: 'ren',
  baraCopy: 'bara-copy',
  omdubb: 'kräver-omdubb',
  slutkort: 'kräver-slutkortsbygge',
  okänd: 'okänd',
};

// ------------------------------------------------------------------ argument

const args = process.argv.slice(2);
const flagga = (n, s = null) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : s;
};
const finns = (n) => args.includes(`--${n}`);
const dö = (m) => { console.error(`✗ ${m}`); process.exit(1); };

// ------------------------------------------------------------------ produktfil

export function läsKälla(produktId) {
  const fil = join(ROT, 'factory', 'produkter', `${produktId}.yaml`);
  if (!existsSync(fil)) dö(`Ingen produktfil: factory/produkter/${produktId}.yaml`);
  const p = lasYaml(readFileSync(fil, 'utf8'));
  const k = p.kalla;
  if (!k || !k.annonsprefix) {
    dö(`factory/produkter/${produktId}.yaml saknar kalla.annonsprefix — utan den vet ingen körning vilka annonser som hör till butiken (FAS2, Uppdrag A).`);
  }
  if (!k.annonskonto) dö(`${produktId}.yaml saknar kalla.annonskonto (källkontots id).`);
  return { produkt: p, kalla: k, butik: läsButik(produktId) };
}

/** Butikskonfigen bakom produkten — behövs för villkorsjämförelsen (sjätte
 *  ytan). Slås upp ur state-filnamnet `<butik>--<produkt>.json`, som kedjan
 *  skriver vid varje bygge. Hittas den inte får villkorsskanningen inget att
 *  jämföra mot, och det sägs rakt ut i stället för att tyst fria annonserna. */
export function läsButik(produktId) {
  const stateMapp = join(ROT, 'factory', 'state');
  const butiksId = existsSync(stateMapp)
    ? readdirSync(stateMapp).find((f) => f.endsWith(`--${produktId}.json`))?.split('--')[0]
    : null;
  if (!butiksId) return null;
  const fil = join(ROT, 'factory', 'butiker', `${butiksId}.yaml`);
  if (!existsSync(fil)) return null;
  // ⚠️ HELA filen, inte `butik:`-blocket. Mätt 2026-09-11 på CaraShell:
  // `frakt:` och `retur:` ligger som EGNA toppnycklar i butiksfilen, syskon till
  // `butik:` — inte inuti den. Returnerades bara `butik`-blocket fick
  // villkorsskanningen `frakt: undefined` och `retur: undefined`, och då kan
  // ingen av dess fyra regler någonsin lösa ut. Sjätte ytan friade alltså allt,
  // tyst, för varje butik — precis det som skulle förhindras. Verifierat:
  // "30 dagars öppet köp" mot CaraShells 14 gav [] före fixen, fynd efter.
  const hela = lasYaml(readFileSync(fil, 'utf8'));
  if (!hela) return null;
  return { ...hela, ...(hela.butik || {}) };
}

/** Texterna som villkorsskanningen jämför, märkta med den yta de står på —
 *  ytan avgör vad det kostar att rätta felet (tal = omdubb, inbränd =
 *  slutkort, copy = gratis). */
export function villkorstexter(annons, ocrPost, transkript) {
  const ut = copyFält(annons).map((f) => ({ yta: 'copy', text: f.text }));
  for (const f of ocrPost?.filer || []) {
    for (const t of f.texter || []) ut.push({ yta: 'inbränd', text: t.text });
  }
  for (const rad of transkript || []) ut.push({ yta: 'tal', text: rad });
  return ut;
}

/** srt_slug kan vara en sträng eller en lista — samma video finns under både
 *  det svenska och det norska slugget beroende på vilken batch som gjorde den. */
const slugLista = (k) => (Array.isArray(k.srt_slug) ? k.srt_slug : [k.srt_slug]).filter(Boolean);

// ------------------------------------------------------------------ yta 1: copy

/** Alla texter Meta bär på en creative, med fältnamn. asset_feed_spec finns på
 *  Advantage+-creatives och bär texterna i listor i stället för i story spec. */
export function copyFält(annons) {
  const c = annons.creative || {};
  const s = c.object_story_spec || {};
  const d = s.video_data || s.link_data || {};
  const a = c.asset_feed_spec || {};
  const ut = [];
  const lägg = (fält, värde) => { if (typeof värde === 'string' && värde.trim()) ut.push({ fält, text: värde }); };

  lägg('message', d.message ?? d.caption ?? c.body);
  lägg('headline', d.title ?? c.title);
  lägg('description', d.link_description ?? d.description);
  lägg('creative.name', c.name);
  for (const [nyckel, fält] of [['bodies', 'message'], ['titles', 'headline'], ['descriptions', 'description']]) {
    for (const x of a[nyckel] || []) lägg(`asset_feed.${fält}`, x.text);
  }
  return ut;
}

export function länkAv(annons) {
  const c = annons.creative || {};
  const s = c.object_story_spec || {};
  const d = s.video_data || s.link_data || {};
  return d.link || d.call_to_action?.value?.link || c.link_url || null;
}

function ytaCopy(annons, extraOrd) {
  const fynd = [];
  for (const { fält, text } of copyFält(annons)) {
    const r = sökBrand(text, extraOrd);
    for (const f of r.fynd) fynd.push({ fält, ...f });
  }
  const länk = länkAv(annons);
  const länkFynd = länk ? sökBrand(länk, extraOrd) : { träff: false, fynd: [] };
  return {
    yta: 'copy',
    träff: fynd.length > 0,
    fynd,
    länk,
    // Länken pekar alltid på källbutiken och byts i kampanjbygget (Uppdrag B).
    // Den håller sig därför utanför domen — annars blir varje annons "bara-copy"
    // och klassningen slutar säga något.
    länk_pekar_på_källan: länkFynd.träff,
  };
}

// ------------------------------------------------------------------ yta 2: talet

/** Alla svenska transkript i repot, indexerade på filnamn utan ändelse. */
export function läsTranskript(rot = SRT_ROT, marknad = 'SE') {
  // ⚠️ ORIGINAL OCH ÖVERSÄTTNING LIGGER I SAMMA MAPP. Mätt 2026-09-11 i
  // market-expansion/no/video-batches/2026-09-11/srt-orig/: `*.orig.srt` är det
  // SVENSKA källjudet, `*.srt` (utan .orig) är den NORSKA dubbningen — samma
  // filnamn i övrigt. Läser den norska körningen `.orig.srt` dömer den norska
  // annonser på svenskt tal, vilket är precis den förväxling FAS2 varnar för
  // (HeimGuard: fem "träffar" som alla satt i översättningarna, inte i källan).
  // Därför väljer marknaden ändelse, och de två uppsättningarna möts aldrig.
  const index = new Map();
  const norsk = String(marknad).toUpperCase() === 'NO';
  const gå = (mapp) => {
    let poster;
    try { poster = readdirSync(mapp, { withFileTypes: true }); } catch { return; }
    for (const p of poster) {
      const full = join(mapp, p.name);
      if (p.isDirectory()) { gå(full); continue; }
      const ärOriginal = p.name.endsWith('.orig.srt');
      if (norsk ? (ärOriginal || !p.name.endsWith('.srt')) : !ärOriginal) continue;
      index.set(p.name.replace(/\.(orig\.)?srt$/i, '').toLowerCase(), full);
    }
  };
  gå(rot);
  return index;
}

/** Annonsnamn → transkriptnyckel: IBC_PD_1_H1 + slug "ibc" → ibc_pd_1_h1.
 *
 *  ⚠️ Exakt namnlikhet räcker inte, och när den brister blir hela talytan
 *  "okänd" — den dyraste ytan, den som avgör om HeyGen-krediter behövs.
 *  Mätt 2026-09-11 på Takoverdrag: annonserna heter `Takoverdrag_CS_1_H1` och
 *  `Takoverdrag_GT_1_H1`, medan redigerarens SRT-filer heter
 *  `takoverdrag_CS_1.orig.srt` och `takoverdrag_G_1.orig.srt`. Två skillnader:
 *    • hooksuffixet `_H1` finns i annonsnamnet men inte i filnamnet
 *    • vinkeln förkortas olika (`GT` i kontot, `G` i filnamnet)
 *  Alla tolv videor föll på det, och rapporten sa "inget transkript i repot"
 *  fast alla tolv låg i repot.
 *
 *  Reserven matchar därför på KÄRNAN — vinkel + nummer — med två regler som
 *  båda måste hålla: numret är identiskt, och vinkelbokstäverna är prefix av
 *  varandra (G ↔ GT). Aldrig lösare än så: `SP_1` får aldrig matcha `SP_2`,
 *  och `CS` aldrig `CO`. Exakt träff vinner alltid. */
export function transkriptFör(annonsnamn, kalla, index) {
  const rest = annonsnamn.slice(String(kalla.annonsprefix).length).replace(/^_/, '');
  const sluggar = slugLista(kalla);
  for (const slug of sluggar) {
    const nyckel = `${slug}_${rest}`.toLowerCase();
    if (index.has(nyckel)) return { nyckel, fil: index.get(nyckel) };
  }
  const sökt = kärna(rest);
  if (!sökt) return null;
  for (const slug of sluggar) {
    const prefix = `${String(slug).toLowerCase()}_`;
    for (const [nyckel, fil] of index) {
      if (!nyckel.startsWith(prefix)) continue;
      const k = kärna(nyckel.slice(prefix.length));
      if (k && k.nummer === sökt.nummer && prefixAvVarandra(k.vinkel, sökt.vinkel)) {
        return { nyckel, fil, via: 'kärna' };
      }
    }
  }
  return null;
}

/** "CS_1_H1" → { vinkel: 'cs', nummer: '1' }. Hooksuffixet kastas. */
export function kärna(rest) {
  const m = String(rest).toLowerCase().match(/^([a-zåäö]+)_(\d+)(?:_h\d+)?$/i);
  return m ? { vinkel: m[1], nummer: m[2] } : null;
}

const prefixAvVarandra = (a, b) => a === b || a.startsWith(b) || b.startsWith(a);

function ytaTal(annons, kalla, index, extraOrd, ärVideo) {
  if (!ärVideo) return { yta: 'tal', tillämplig: false, dom: 'ej tillämplig (bildannons)' };
  const träff = transkriptFör(annons.name, kalla, index);
  if (!träff) {
    return { yta: 'tal', tillämplig: true, transkript: null, träff: null, fynd: [], dom: 'okänd (inget transkript i repot)' };
  }
  const text = readFileSync(träff.fil, 'utf8');
  const r = sökBrand(text, extraOrd);
  return {
    yta: 'tal',
    tillämplig: true,
    transkript: träff.fil.slice(ROT.length + 1),
    träff: r.träff,
    fynd: r.fynd,
    repliker: r.träff ? replikerMedBrand(text, extraOrd) : [],
  };
}

/** Raderna i SRT:en som bär brandnamnet — belägget, ordagrant. */
export function replikerMedBrand(srt, extraOrd = []) {
  const ut = [];
  for (const block of srt.split(/\r?\n\r?\n/)) {
    const rader = block.split(/\r?\n/);
    const tid = rader.find((r) => r.includes('-->')) || '';
    const text = rader.filter((r) => !r.includes('-->') && !/^\d+$/.test(r.trim())).join(' ').trim();
    if (text && sökBrand(text, extraOrd).träff) ut.push({ tid: tid.trim(), text });
  }
  return ut;
}

// ------------------------------------------------------------------ media

export function mediaAv(annons) {
  const c = annons.creative || {};
  const s = c.object_story_spec || {};
  const v = s.video_data || {};
  const l = s.link_data || {};
  // Story spec-id:t FÖRST. Creativens video_id är ofta ett annat objekt än det
  // kontots advideos-kant känner till (mätt 2026-09-03 i NO-kontot, mätt igen
  // 2026-09-08 på IBC: 14 av 14 träffade på story spec-id:t, 0 på det andra).
  const videoId = v.video_id || c.video_id || null;
  if (videoId) {
    return { typ: 'video', video_id: videoId, video_id_alt: c.video_id || null, bild_url: v.image_url || c.thumbnail_url || null };
  }
  // ⚠️ thumbnail_url får ALDRIG bli OCR-underlag. Mätt i MagiBorsten 2026-09-08:
  // den levererar 64×64 px. En bildannons som OCR:as på en 64-pixelsbild kommer
  // tillbaka "ren" — och det är precis den sortens tysta friande som gör att
  // Bäverbutikens namn åker med ut. Saknas en riktig bild-URL hämtas den ur
  // kontots adimages på hashen; går inte det heller blir ytan "okänd".
  const bildUrl = l.picture || l.image_url || c.image_url || null;
  return { typ: 'bild', bild_url: bildUrl, image_hash: l.image_hash || c.image_hash || null };
}

/** Full bild-URL ur kontots adimages, på hash. Reserven när creativen bara bär
 *  en hash (eller bara en 64-pixels thumbnail, som aldrig får användas). */
async function bildUrlViaHash(kontoId, hash) {
  if (!hash) return null;
  const r = await api(`act_${kontoId}/adimages`, { params: { hashes: [hash], fields: 'url,width,height' } });
  return r.data?.[0]?.url || null;
}

/** Nedladdningslänkar till kontots videor, id → source.
 *
 *  ⚠️ Dyrköpt: `/{video_id}?fields=source` svarar "(#10) Application does not
 *  have permission" med den token rutinerna kör på — men KONTOTS advideos-kant
 *  lämnar ut samma source. Samma lärdom står i pipeline/no-drive-fran-meta.py.
 *  `title`-filtret håller anropet nere till en sida i stället för hela kontots
 *  videobibliotek. Titeln är filnamnet redigeraren laddade upp och stämmer inte
 *  alltid med annonsnamnet ("IBC-tanköverdrag_PD_1_H1.mp4" ↔ IBC_PD_1_H1), så
 *  id:t är förstahandsnyckeln och titeln bara en reserv. */
async function videokällor(kontoId, prefix, saknadeIdn = []) {
  const index = new Map();
  const lägg = (v) => {
    if (!v.source) return;
    index.set(String(v.id), v.source);
    if (v.title) index.set(`titel:${normaliseraTitel(v.title)}`, v.source);
  };
  for (const v of await alla(`act_${kontoId}/advideos`, { fields: 'id,title,source', title: prefix }, 25)) lägg(v);

  // ⚠️ Titelfiltret räcker inte. Mätt 2026-09-08 på Overvakningskamera: 13 av 25
  // videor bar prefixet i sin titel — den första launchbatchens filer (SP_1/2/3,
  // CS_1/2/3, PD_1/2/3, G_1/2/3) laddades upp under andra filnamn och saknades
  // därför helt. Bland dem låg kampanjens TOPPSPENDER (SP_2, 13 338 kr), så yta 3
  // blev oläst på precis den annons som betydde mest. Titeln är redigerarens
  // filnamn och kan aldrig antas följa annonsnamnet.
  // Faller därför tillbaka på HELA videobiblioteket när något id fortfarande
  // saknas — dyrare (1 076 rader i MagiBorsten), men det är ett läsanrop och
  // alternativet är tyst blindhet.
  const kvar = saknadeIdn.filter((id) => id && !index.has(String(id)));
  if (kvar.length) {
    console.log(`  ${kvar.length} video-id saknades efter titelfiltret — läser hela videobiblioteket`);
    for (const v of await alla(`act_${kontoId}/advideos`, { fields: 'id,title,source' }, 40)) lägg(v);
  }
  return index;
}

const normaliseraTitel = (t) => String(t).replace(/\.(mp4|mov|m4v|webm)$/i, '').toLowerCase();

/** Sista utvägen när id:t inte finns i indexet: matcha på titeln.
 *  "IBC_PD_1_H1" ska hitta "IBC-tanköverdrag_PD_1_H1.mp4" — samma svans, annan nos. */
export function källaViaTitel(index, annonsnamn, prefix) {
  const direkt = index.get(`titel:${normaliseraTitel(annonsnamn)}`);
  if (direkt) return direkt;
  const svans = annonsnamn.slice(String(prefix).length).replace(/^_/, '').toLowerCase();
  if (!svans) return null;
  for (const [nyckel, url] of index) {
    if (!nyckel.startsWith('titel:')) continue;
    if (nyckel.slice(6).endsWith(`_${svans}`)) return url;
  }
  return null;
}

async function laddaNer(url, mål) {
  if (existsSync(mål) && statSync(mål).size > 0) return mål;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`nedladdning ${res.status} ${res.statusText}`);
  writeFileSync(mål, Buffer.from(await res.arrayBuffer()));
  return mål;
}

function kör(kommando, argv, tyst = true) {
  const r = spawnSync(kommando, argv, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0 && !tyst) console.error(r.stderr || r.stdout);
  return r;
}

/** Hämtar media, drar frames ur videon och OCR:ar allt. Returnerar
 *  { <annonsnamn>: { typ, filer: [{ fil, sekund, texter: [...] }] } } */
async function hämtaOchLäs(annonser, kalla, tathet = TATHET_SEK) {
  // Mappen bär prefixet, som skiljer sig per marknad (Takoverdrag ↔
  // Takovertrekk_NO). Annars skriver den norska körningen över den svenskas
  // frames och båda rapporterna pekar på samma bilder.
  const mediaMapp = join(ARBETSYTA, kalla.annonsprefix, 'media');
  mkdirSync(mediaMapp, { recursive: true });
  const ut = {};

  // ⚠️ Id:na MÅSTE skickas med. Mätt 2026-09-11 på Takoverdrag: anropet stod utan
  // tredje argumentet, så `saknadeIdn` blev [] och reservvägen "läs hela
  // videobiblioteket" (rad 301) kunde per konstruktion aldrig lösa ut. Alla 12
  // videor kom tillbaka "okänd" fast varenda source låg i kontot — filerna hette
  // bara "PD_1.mp4" utan prefix. Lärdomen från 2026-09-08 fanns alltså i koden
  // men var kopplad till ingenting.
  const videoIdn = annonser
    .map((a) => mediaAv(a))
    .filter((m) => m.typ === 'video')
    .flatMap((m) => [m.video_id, m.video_id_alt])
    .filter(Boolean);
  const behöverVideo = videoIdn.length > 0;
  const källor = behöverVideo
    ? await videokällor(kalla.annonskonto, kalla.annonsprefix, videoIdn)
    : new Map();
  if (behöverVideo) {
    const antal = [...källor.keys()].filter((k) => !k.startsWith('titel:')).length;
    console.log(`  ${antal} videokällor lästa ur kontot`);
    // Titelfiltret är prefixet. Bär redigerarnas filnamn ett annat prefix ger
    // sökningen noll träffar och VARENDA video blir "okänd" — det ska synas som
    // ett larm här, inte som 14 identiska felrader längre ned.
    if (antal === 0) {
      console.log(`  ⚠️ advideos?title=${kalla.annonsprefix} gav noll träffar. Videofilernas titlar i kontot bär`);
      console.log('     troligen ett annat prefix än annonsnamnen — yta 3 blir "okänd" för alla videor.');
    }
  }

  for (const a of annonser) {
    const m = mediaAv(a);
    const post = { typ: m.typ, filer: [] };
    try {
      if (m.typ === 'video') {
        const source = källor.get(String(m.video_id))
          || (m.video_id_alt && källor.get(String(m.video_id_alt)))
          || källaViaTitel(källor, a.name, kalla.annonsprefix);
        if (!source) throw new Error(`ingen source i kontots advideos för video ${m.video_id}`);
        const fil = join(mediaMapp, `${a.name}.mp4`);
        await laddaNer(source, fil);
        // Tätheten står i mappnamnet. Annars ligger en gammal gles körnings
        // frames kvar bredvid en ny tät och ingen ser vilken som lästes.
        const frames = join(mediaMapp, `${a.name}_frames_${String(tathet).replace('.', 'p')}`);
        const r = kör('python3', [join(ROT, 'tools', 'qa-frames.py'), fil, '--ut', frames,
          '--tathet', String(tathet), '--max-frames', String(MAX_FRAMES)], false);
        if (r.status !== 0) throw new Error('qa-frames.py misslyckades');
        post.filer = läsFrameIndex(frames);
      } else {
        const url = m.bild_url || await bildUrlViaHash(kalla.annonskonto, m.image_hash);
        if (!url) throw new Error('creativen bär varken bild-URL eller läsbar hash');
        const fil = join(mediaMapp, `${a.name}.jpg`);
        await laddaNer(url, fil);
        post.filer = [{ fil, sekund: null }];
      }
      const ocr = ocrFiler(post.filer.map((f) => f.fil));
      for (const f of post.filer) f.texter = ocr[f.fil] ?? [];
      post.ocr_ok = Object.keys(ocr).length > 0;
    } catch (e) {
      post.fel = String(e.message || e);
    }
    ut[a.name] = post;
    console.log(`  ${post.fel ? '✗' : '·'} ${a.name} (${post.typ})${post.fel ? ` — ${post.fel}` : ` ${post.filer.length} fil(er)`}`);
  }
  return ut;
}

function läsFrameIndex(mapp) {
  const index = join(mapp, 'index.txt');
  if (!existsSync(index)) return [];
  const ut = [];
  for (const rad of readFileSync(index, 'utf8').split(/\r?\n/)) {
    if (!rad.trim()) continue;
    const [namn, tid] = rad.split('\t');
    ut.push({ fil: join(mapp, namn), sekund: Number.parseFloat(tid) || 0 });
  }
  return ut;
}

/** OCR via factory/brand-text.py. Returnerar { <fil>: [{text, konfidens}] }. */
function ocrFiler(filer) {
  if (filer.length === 0) return {};
  const r = spawnSync('python3', [join(ROT, 'factory', 'brand-text.py'), '--filer', '-'], {
    input: filer.join('\n'), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) throw new Error(`brand-text.py: ${(r.stderr || '').trim().split('\n').pop()}`);
  return JSON.parse(r.stdout);
}

// ------------------------------------------------------ yta 3 + 4: läst bild

function ytaInbränd(annons, ocrPost, extraOrd) {
  if (!ocrPost || ocrPost.typ !== 'video') return { yta: 'inbränd', tillämplig: false, dom: 'ej tillämplig (bildannons)' };
  if (ocrPost.fel || !ocrPost.filer?.length) {
    return { yta: 'inbränd', tillämplig: true, dom: `okänd (${ocrPost.fel || 'inga frames'})`, fynd: [] };
  }
  // Noll texter på HELA videon är oskiljbart från en OCR som inte kom igång.
  // Mätt 2026-09-08: 13 av 14 IBC-videor gav text på nästan varje frame,
  // IBC_PD_Extra gav en enda tecken-artefakt ("Q") på 31 frames. Det får bli
  // "okänd", aldrig "ren" — tills ett öga sagt att det faktiskt är tomt.
  // Enstaka tecken räknas inte som text; de är brus i bilden, inte en läsning.
  const antalTexter = ocrPost.filer.reduce(
    (n, f) => n + (f.texter || []).filter((t) => String(t.text).trim().length > 1).length, 0);
  if (antalTexter === 0) {
    return {
      yta: 'inbränd', tillämplig: true, träff: null, fynd: [],
      frames: ocrPost.filer.length,
      dom: `okänd (OCR gav noll text på samtliga ${ocrPost.filer.length} frames — oskiljbart från en misslyckad läsning)`,
    };
  }
  const sista = Math.max(...ocrPost.filer.map((f) => f.sekund ?? 0));
  const fynd = [];
  for (const f of ocrPost.filer) {
    for (const t of f.texter || []) {
      const r = sökBrand(t.text, extraOrd);
      for (const x of r.fynd) {
        fynd.push({
          sekund: f.sekund,
          plats: (f.sekund ?? 0) >= sista * SENT_ANDEL ? 'sent i filmen' : 'tidigare i filmen',
          ...x,
        });
      }
    }
  }
  return {
    yta: 'inbränd',
    tillämplig: true,
    träff: fynd.length > 0,
    fynd,
    sent_i_filmen: fynd.some((f) => f.plats === 'sent i filmen'),
    frames: ocrPost.filer.length,
  };
}

// ------------------------------------------------------- ögongranskningen

/** factory/output/<id>/brand-syn.json — vad ett ÖGA såg i samma material.
 *  OCR kan inte se en logotyp utan text, och den missar en textrad som ligger
 *  mellan två frames. Därför är ögongranskningen ett eget lager, sparat i
 *  repot: den ska överleva sessionen och gå att köra om utan att göras om. */
export function läsSyn(utMapp, suffix = '') {
  const fil = join(utMapp, `brand-syn${suffix}.json`);
  if (!existsSync(fil)) return null;
  return JSON.parse(readFileSync(fil, 'utf8'));
}

/**
 * Väger ihop maskinens läsning med ögats.
 * Regeln: en TRÄFF från endera står — men "ren" kräver att den som läste inte
 * hittade något. Ögat får aldrig radera en maskinträff och tvärtom; ser de
 * olika är svaret "granska igen", inte "ren".
 */
export function vägSamman(yta, synPost) {
  if (!yta?.tillämplig || !synPost) return { ...yta, syn: null };
  const synTräff = Boolean(synPost.syns);
  if (synTräff && yta.träff !== true) {
    return {
      ...yta,
      träff: true,
      källa: 'syn',
      syn: synPost,
      fynd: [...(yta.fynd || []), { sekund: synPost.sekund ?? null, plats: synPost.var || 'syn', ord: synPost.ordagrant || '(symbol utan text)', form: 'syn', sätt: 'ögongranskad' }],
    };
  }
  if (!synTräff && yta.träff === true) {
    // Maskinen hittade något ögat inte såg. Träffen står — men det ska synas.
    return { ...yta, syn: synPost, oenig: true };
  }
  if (!synTräff && yta.träff == null) {
    // Maskinen kunde inte läsa ytan, ögat kunde — och såg ingenting. Då ÄR den
    // läst. Det är hela poängen med ögonlagret: IBC_PD_Extra gav en enda
    // teckenartefakt på 31 frames (oskiljbart från trasig OCR), men en granskare
    // gick igenom hela videon: äkta bildmaterial, ingen text, ingen logotyp.
    return { ...yta, träff: false, källa: 'syn', dom: undefined, syn: synPost };
  }
  return { ...yta, syn: synPost, bekräftad_av_syn: true };
}

function ytaBildattribution(annons, ocrPost, extraOrd) {
  if (!ocrPost || ocrPost.typ !== 'bild') return { yta: 'bild', tillämplig: false, dom: 'ej tillämplig (video)' };
  if (ocrPost.fel || !ocrPost.filer?.length) {
    return { yta: 'bild', tillämplig: true, dom: `okänd (${ocrPost.fel || 'ingen bild'})`, fynd: [] };
  }
  const fynd = [];
  for (const t of ocrPost.filer[0].texter || []) {
    const r = sökBrand(t.text, extraOrd);
    for (const x of r.fynd) fynd.push({ rad: t.text, ...x });
  }
  return { yta: 'bild', tillämplig: true, träff: fynd.length > 0, fynd };
}

// ------------------------------------------- källbutikens villkor i materialet

/** Mönster som pekar ut KÄLLBUTIKENS erbjudande, inte dess namn.
 *  Ligger utanför FAS2:s fyra ytor med flit — men en annons som är brandfri och
 *  ändå lovar "489 kr", "Fri frakt över 300 kr" och "Klarna" är inte körbar för
 *  en annan butik. `ren` betyder brandfri, aldrig "går att köra som den är". */
const VILLKORSMÖNSTER = [
  { namn: 'pris', re: /\b\d{2,5}\s?kr\b/gi },
  { namn: 'rabatt', re: /\b\d{1,3}\s?%/g },
  { namn: 'frakt', re: /\bfri (frakt|leverans)\b[^.!?\n]{0,30}/gi },
  { namn: 'betalsätt', re: /\bklarna\b|\bswish\b|\bdelbetal\w*/gi },
  { namn: 'öppet köp', re: /\böppet köp\b[^.!?\n]{0,20}|\b\d{1,3} dagars?\b[^.!?\n]{0,25}/gi },
  { namn: 'recensioner', re: /\b\d{1,4}\s?recensioner\b|\bverifierad kund\b/gi },
];

/** Villkorsfynd i allt textmaterial detektorn redan läst för en annons. */
export function sökVillkor(texter) {
  const ut = new Map();
  for (const text of texter) {
    for (const { namn, re } of VILLKORSMÖNSTER) {
      for (const m of String(text).matchAll(re)) {
        const lista = ut.get(namn) || new Set();
        lista.add(m[0].trim());
        ut.set(namn, lista);
      }
    }
  }
  return [...ut].map(([namn, värden]) => ({ namn, värden: [...värden].slice(0, 6) }));
}

// ------------------------------------------------------------------ domen

/** Dyraste ytan bestämmer klassen. Alla fyra ytor redovisas ändå alltid —
 *  en annons kan behöva både omdubb och nytt slutkort.
 *
 *  SJÄTTE YTAN: `villkorsfel` är utfallet ur villkorsskanning.skannaVillkor()
 *  — källbutikens erbjudandevillkor jämförda mot OPS-butikens EGNA. Ett fel
 *  där väger exakt lika tungt som brandnamnet, för det är samma sorts fel:
 *  ett löfte butiken inte håller. Ytan där felet står bestämmer priset att
 *  rätta det (tal = omdubb, inbränd = slutkort, copy = gratis).
 *
 *  Regeln som gör skillnaden: en annons med ett villkorsfel kan ALDRIG bli
 *  `ren`. (Axels bakläxa 2026-09-09: brand-detektorn friade 38 av 40 svenska
 *  HeimGuard-annonser; fem bar "fri frakt över 300 kr", två av dem bevisade
 *  vinnare. Felet upptäcktes först när annonserna låg uppe i kontot.) */
export function klassa({ copy, tal, inbränd, bild, villkorsfel = [] }) {
  const okänd = [tal, inbränd, bild].some((y) => y?.tillämplig && y.träff == null && !y.dom?.startsWith('ej'));
  const villkorPa = (yta) => villkorsfel.some((f) => f.yta === yta);
  if (tal?.träff || villkorPa('tal')) return DOMAR.omdubb;
  if (inbränd?.träff || villkorPa('inbränd')) return DOMAR.slutkort;
  if (copy?.träff || bild?.träff || villkorsfel.length > 0) return DOMAR.baraCopy;
  if (okänd) return DOMAR.okänd;
  return DOMAR.ren;
}

// ------------------------------------------------------------------ rapport

function tabellrad(r) {
  const tecken = (y) => {
    if (!y) return '–';
    if (y.tillämplig === false) return '–';
    // 👁 = ett öga har läst samma material och sagt samma sak (brand-syn.json).
    const öga = y.bekräftad_av_syn ? ' 👁' : (y.källa === 'syn' ? ' 👁 (bara ögat)' : (y.oenig ? ' ⚠️ oenig' : ''));
    if (y.träff === true) return `⚠️ träff${öga}`;
    if (y.träff === false) return `✅ ren${öga}`;
    return '❔ okänd';
  };
  return `| \`${r.annons}\` | ${r.typ} | ${tecken(r.ytor.copy)} | ${tecken(r.ytor.tal)} | ${tecken(r.ytor.inbränd)} | ${tecken(r.ytor.bild)} | **${r.dom}** | ${r.attgöra.join(' + ') || '—'} |`;
}

/** Domen är den DYRASTE ytan. Den här listan är ALLA ytor som måste åtgärdas.
 *  ⚠️ Skillnaden är inte kosmetisk: IBC_SP_1_H2 är "kräver-omdubb" på grund av
 *  talet OCH bär en inbränd brandrad. Läser någon bara domen kommer annonsen
 *  tillbaka från HeyGen med Bäverbutiken kvar i bild. */
export function attGöra(ytor) {
  const ut = [];
  if (ytor.copy?.träff) ut.push('copy');
  if (ytor.tal?.träff) ut.push('tal');
  if (ytor.inbränd?.träff) ut.push('inbränd text');
  if (ytor.bild?.träff) ut.push('bildtext');
  for (const [namn, y] of [['tal', ytor.tal], ['inbränd text', ytor.inbränd], ['bildtext', ytor.bild]]) {
    if (y?.tillämplig && y.träff == null && !y.dom?.startsWith('ej')) ut.push(`${namn} (oläst)`);
  }
  // Villkorsfelen skrivs ut med sin egen text ("lovar fraktgräns … — butiken
  // har fri frakt UTAN gräns"), för de syns inte i någon av de fyra ytorna.
  for (const f of ytor.villkorsfel || []) ut.push(`${f.regel} i ${f.yta}: ${f.fel}`);
  return ut;
}

function byggRapport({ produktId, produkt, kalla, rader, kampanjer, ocrKälla, datum, syn, tathet }) {
  const antal = (d) => rader.filter((r) => r.dom === d).length;
  const brand = produkt?.brand?.namn || produktId;
  const rad = [];
  rad.push(`# Brand-detektor — ${brand} (${produktId})`);
  rad.push('');
  rad.push(`Körd ${datum} av \`factory/brand-detektor.mjs\` (Uppdrag A i \`factory/FAS2.md\`).`);
  rad.push('Läser bara. Inga krediter, ingen HeyGen, ingen kie.ai, inget skrivet i något annonskonto.');
  rad.push('');
  rad.push(`**Källa:** ${kalla.produkt_url || kalla.produkt_handle} · annonsprefix \`${kalla.annonsprefix}_\` · konto \`${kalla.annonskonto}\` (MagiBorsten, Bäverbutiken SE).`);
  rad.push(`**Mål:** konto \`${produkt?.meta?.ad_account_id || '—'}\` (MagiBorsten DK, OPS Factory). Kontrollerat på id, aldrig på namn.`);
  rad.push('');
  rad.push(`## Läget: ${rader.length} källannonser`);
  rad.push('');
  rad.push('| Dom | Antal | Vad det kostar |');
  rad.push('|---|---|---|');
  rad.push(`| \`ren\` | ${antal(DOMAR.ren)} | inget brandarbete — ⚠️ men läs länken och villkoren nedan innan något laddas upp |`);
  rad.push(`| \`bara-copy\` | ${antal(DOMAR.baraCopy)} | gratis — skriv om texten / kör \`pipeline/oversatt-bild.py\` |`);
  rad.push(`| \`kräver-slutkortsbygge\` | ${antal(DOMAR.slutkort)} | arbetstid — \`pipeline/no-precis.py\` byter texten i sin egen ruta |`);
  rad.push(`| \`kräver-omdubb\` | ${antal(DOMAR.omdubb)} | HeyGen-krediter — blockerat tills plånboken fylls på |`);
  rad.push(`| \`okänd\` | ${antal(DOMAR.okänd)} | en yta gick inte att läsa — står aldrig som "ren" |`);
  rad.push('');
  rad.push(`⚠️ **Länken gäller alla ${rader.length}:** varje annons pekar på källbutiken och måste peka på OPS-butiken.`);
  rad.push('Bytet ingår i kampanjbygget (Uppdrag B) och håller sig därför utanför klassningen — annars blir varje annons `bara-copy` och tabellen slutar säga något.');
  rad.push('');
  rad.push('## Varje annons, alla fyra ytor');
  rad.push('');
  rad.push('👁 = ett öga har läst samma material och kommit fram till samma sak. Utan 👁 är raden bara maskinläst.');
  rad.push('');
  rad.push('| Annons | Typ | 1 copy | 2 tal | 3 inbränd text | 4 bildattribution | Dom | Måste åtgärdas |');
  rad.push('|---|---|---|---|---|---|---|---|');
  for (const r of rader) rad.push(tabellrad(r));
  rad.push('');
  rad.push('## Hur säkra siffrorna är');
  rad.push('');
  rad.push('| Yta | Hur den lästes | Vad den inte ser |');
  rad.push('|---|---|---|');
  rad.push('| 1 copy | Meta Graph, live | inget — texten är exakt den som ligger i kontot |');
  rad.push('| 2 tal | svenska transkript i `market-expansion/**/srt-orig/` | annonser utan transkript blir `okänd`, aldrig `ren` |');
  rad.push(`| 3 inbränd text | frames var ${tathet} s + lokal OCR${syn ? ' + ögongranskning' : ''} | en textrad som visas kortare än ${tathet} s kan hamna mellan två frames |`);
  rad.push(`| 4 bildattribution | lokal OCR på bildannonsen${syn ? ' + ögongranskning' : ''} | OCR läser inte en logotyp utan text — bara ögat gör det |`);
  rad.push('');
  if (syn) {
    const bekräftade = rader.filter((r) => Object.values(r.ytor).some((y) => y?.bekräftad_av_syn)).length;
    const baraÖgat = rader.filter((r) => Object.values(r.ytor).some((y) => y?.källa === 'syn')).length;
    const oeniga = rader.filter((r) => Object.values(r.ytor).some((y) => y?.oenig)).length;
    rad.push(`**Ögongranskning ${syn.datum}:** ${bekräftade} annonser bekräftade, ${baraÖgat} träffar som BARA ögat hittade, ${oeniga} oenigheter kvar.`);
    if (syn.metod) rad.push(`Metod: ${syn.metod}`);
    rad.push('');
  } else {
    rad.push('⚠️ **Ingen ögongranskning gjord.** Yta 3 och 4 vilar då enbart på OCR — som varken ser en logotyp utan text');
    rad.push('eller en textrad mellan två frames. Lägg `brand-syn.json` bredvid rapporten när materialet är sett.');
    rad.push('');
  }
  rad.push('## Belägg');
  rad.push('');
  for (const r of rader.filter((x) => x.belägg.length)) {
    rad.push(`**\`${r.annons}\`** — ${r.dom}`);
    for (const b of r.belägg) rad.push(`- ${b}`);
    rad.push('');
  }
  const medVillkor = rader.filter((r) => r.villkor.length);
  if (medVillkor.length) {
    rad.push('## Källbutikens villkor i materialet (utanför FAS2:s fyra ytor)');
    rad.push('');
    rad.push('⚠️ **`ren` betyder brandfri — inte "går att köra som den är".** Det här är pris, rabatt, frakt,');
    rad.push('betalsätt, öppet köp och recensionsantal som gäller KÄLLBUTIKEN. Stämmer de inte med OPS-butikens');
    rad.push('egna villkor måste de bytas innan annonsen körs, precis som brandnamnet.');
    rad.push('');
    rad.push('| Annons | Dom | Villkor som står i materialet |');
    rad.push('|---|---|---|');
    for (const r of medVillkor) {
      rad.push(`| \`${r.annons}\` | ${r.dom} | ${r.villkor.map((v) => `${v.namn}: ${v.värden.join(', ')}`).join(' · ')} |`);
    }
    rad.push('');
  }
  const olästa = rader.filter((r) => r.attgöra.some((a) => a.endsWith('(oläst)')));
  if (olästa.length) {
    rad.push('## Kvar att läsa');
    rad.push('');
    for (const r of olästa) {
      rad.push(`- \`${r.annons}\`: ${r.attgöra.filter((a) => a.endsWith('(oläst)')).join(', ')} — ${r.belägg.find((b) => b.includes('okänd')) || 'ingen källa'}`);
    }
    rad.push('');
    rad.push('Ingen av dem får räknas som `ren` förrän ytan faktiskt lästs.');
    rad.push('');
  }
  rad.push('## Kampanjer annonserna ligger i');
  rad.push('');
  for (const [namn, n] of kampanjer) rad.push(`- ${namn} — ${n} annonser`);
  rad.push('');
  rad.push(`OCR-källa: \`${ocrKälla}\`.`);
  if (syn) rad.push(`Ögongranskning: \`factory/output/${produktId}/brand-syn.json\`.`);
  rad.push('');
  return rad.join('\n');
}

// ------------------------------------------------------------------ main

async function main() {
  const produktId = flagga('produkt');
  if (!produktId) dö('Ange --produkt <id>, t.ex. --produkt tankguard.');
  const { produkt, kalla: kallaSE, butik } = läsKälla(produktId);

  // ⚠️ NO-HALVAN ÄR INTE VALFRI (Axels bakläxa 2026-09-09). Detektorn läste
  // förut bara SE-kampanjen, och FAS2 noterade resultatet: på TankGuard var
  // inbränd text och bildattribution OLÄSTA på alla 33 norska annonser, och
  // fem norska annonser bar brandet i COPYN där noll svenska gjorde det.
  // `--marknad NO` läser det norska källkontot med samma sex ytor och skriver
  // en egen rapport — en norsk annons ärver aldrig sin svenska systers dom.
  const marknad = String(flagga('marknad', 'SE')).toUpperCase();
  if (!['SE', 'NO'].includes(marknad)) dö(`--marknad ${marknad} finns inte. Välj SE eller NO.`);
  const kalla = marknad === 'NO'
    ? { ...kallaSE, annonskonto: kallaSE.no_annonskonto, annonsprefix: kallaSE.no_annonsprefix, kampanj_id: kallaSE.no_kampanj_id }
    : kallaSE;
  if (marknad === 'NO' && (!kalla.annonskonto || !kalla.annonsprefix)) {
    dö(`produkter/${produktId}.yaml saknar kalla.no_annonskonto/kalla.no_annonsprefix — utan dem vet ingen körning vilka norska annonser som hör till butiken. Sätt dem, gissa aldrig.`);
  }
  const suffix = marknad === 'NO' ? '-no' : '';
  const extraOrd = kalla.extra_brandord || [];
  if (!butik) {
    console.log('  ⚠️ ingen butikskonfig hittad — villkorsjämförelsen (sjätte ytan) körs INTE.');
    console.log('     Annonserna kan alltså bära källbutikens fraktgräns utan att någon dom fångar det.');
  }
  const utMapp = join(ROT, 'factory', 'output', produktId);
  const ocrFil = join(utMapp, `brand-ocr${suffix}.json`);

  console.log(`Brand-detektor — ${produkt?.brand?.namn || produktId} · marknad ${marknad}`);
  console.log(`  källkonto ${kalla.annonskonto} · prefix ${kalla.annonsprefix}_`);

  const annonser = (await alla(`act_${kalla.annonskonto}/ads`, {
    fields: 'id,name,status,effective_status,adset{name},campaign{id,name},creative{id,name,title,body,link_url,object_story_spec,asset_feed_spec,video_id,image_hash,image_url,thumbnail_url,object_type}',
    filtering: [{ field: 'ad.name', operator: 'CONTAIN', value: `${kalla.annonsprefix}_` }],
  })).filter((a) => a.name.startsWith(`${kalla.annonsprefix}_`))
    .sort((a, b) => a.name.localeCompare(b.name, 'sv'));

  if (annonser.length === 0) dö(`Inga annonser med prefixet "${kalla.annonsprefix}_" i konto ${kalla.annonskonto}.`);
  console.log(`  ${annonser.length} källannonser`);

  let tathet = Number(flagga('tathet', TATHET_SEK));
  let ocr = {};
  let ocrKälla = `factory/output/${produktId}/brand-ocr${suffix}.json`;
  if (finns('hamta')) {
    console.log(`  hämtar media, drar frames var ${tathet} s och OCR:ar (0 krediter):`);
    ocr = await hämtaOchLäs(annonser, kalla, tathet);
    ocrKälla = `${ocrKälla} (läst ${new Date().toISOString().slice(0, 10)})`;
  } else if (existsSync(ocrFil)) {
    const sparad = JSON.parse(readFileSync(ocrFil, 'utf8'));
    ocr = sparad.annonser || {};
    // Tätheten hör till LÄSNINGEN, inte till utskriften. Läser vi en sparad OCR
    // ska rapporten säga hur tätt DEN lästes — annars påstår en omkörning med
    // ny default att gamla glesa frames var täta.
    tathet = sparad.tathet ?? 'okänd';
    // Datumet kommer ur filen, inte ur körningen — en omkörning utan --hamta
    // ska säga när materialet LÄSTES, inte när rapporten skrevs ut.
    ocrKälla = `${ocrKälla} (läst ${sparad.datum || 'okänt datum'})`;
  } else {
    console.log('  ingen sparad OCR — yta 3 och 4 blir "okänd". Kör med --hamta.');
  }

  const index = läsTranskript(SRT_ROT, marknad);
  const syn = läsSyn(utMapp, suffix);
  if (syn) console.log(`  ögongranskning från ${syn.datum} inläst (${Object.keys(syn.annonser || {}).length} annonser)`);
  const rader = [];
  for (const a of annonser) {
    const m = mediaAv(a);
    const ytor = {
      copy: ytaCopy(a, extraOrd),
      tal: ytaTal(a, kalla, index, extraOrd, m.typ === 'video'),
      inbränd: ytaInbränd(a, ocr[a.name], extraOrd),
      bild: ytaBildattribution(a, ocr[a.name], extraOrd),
    };
    // Utan hämtad OCR vet vi ingenting om ytorna 3 och 4 — då är de okända,
    // aldrig rena. Att kalla en oläst yta "ren" är exakt det misstag som
    // skickar en Bäverbutiks-logga ut i OPS-butikens annonser.
    if (!ocr[a.name]) {
      const nyckel = m.typ === 'video' ? 'inbränd' : 'bild';
      ytor[nyckel] = { yta: nyckel, tillämplig: true, träff: null, fynd: [], dom: 'okänd (media inte hämtad)' };
    }
    const synPost = syn?.annonser?.[a.name];
    if (synPost) {
      ytor.inbränd = vägSamman(ytor.inbränd, synPost.yta3);
      ytor.bild = vägSamman(ytor.bild, synPost.yta4);
    }
    // Sjätte ytan: källbutikens villkor mot OPS-butikens egna. Talet läses ur
    // samma transkript som yta 2 redan hittat — gratis, inga krediter.
    const talfil = transkriptFör(a.name, kalla, index);
    const talrader = talfil ? readFileSync(talfil.fil, 'utf8').split('\n') : [];
    ytor.villkorsfel = butik
      ? skannaVillkor(villkorstexter(a, ocr[a.name], talrader), butik)
      : [];
    const dom = klassa(ytor);
    const allText = [
      ...copyFält(a).map((f) => f.text),
      ...(ocr[a.name]?.filer || []).flatMap((f) => (f.texter || []).map((t) => t.text)),
    ];
    rader.push({
      annons: a.name, id: a.id, typ: m.typ, status: a.effective_status,
      adset: a.adset?.name, kampanj: a.campaign?.name,
      ytor, dom, attgöra: attGöra(ytor), villkor: sökVillkor(allText),
      villkorsfel: ytor.villkorsfel, belägg: byggBelägg(ytor),
    });
  }

  const kampanjer = [...rader.reduce((m, r) => m.set(r.kampanj, (m.get(r.kampanj) || 0) + 1), new Map())];
  const datum = new Date().toISOString().slice(0, 10);
  const md = byggRapport({ produktId, produkt, kalla, rader, kampanjer, ocrKälla, datum, syn, tathet });

  if (finns('torr')) { console.log('\n' + md); return; }
  mkdirSync(utMapp, { recursive: true });
  writeFileSync(join(utMapp, `brand-detektor${suffix}.md`), md);
  writeFileSync(join(utMapp, `brand-detektor${suffix}.json`), JSON.stringify({ produkt: produktId, marknad, datum, kalla, annonser: rader }, null, 1));
  if (finns('hamta')) {
    // Bara texten sparas, aldrig filerna: media är artefakter som dör med
    // containern, OCR-fynden är facit som måste gå att läsa om utan nedladdning.
    const lätt = Object.fromEntries(Object.entries(ocr).map(([namn, p]) => [namn, {
      typ: p.typ, fel: p.fel,
      filer: (p.filer || []).map((f) => ({ fil: basename(f.fil), sekund: f.sekund, texter: f.texter })),
    }]));
    writeFileSync(ocrFil, JSON.stringify({ produkt: produktId, marknad, datum, tathet, annonser: lätt }, null, 1));
  }
  console.log(`\n✓ factory/output/${produktId}/brand-detektor${suffix}.md`);
  for (const d of Object.values(DOMAR)) {
    const n = rader.filter((r) => r.dom === d).length;
    if (n) console.log(`   ${d}: ${n}`);
  }
}

/** Samma textrad står kvar i flera frames i rad. Vid 0,3 s täthet blir det tio
 *  identiska rader per fynd. Slå ihop dem till ett intervall — belägget ska
 *  visa hur LÄNGE raden stod, inte upprepas en gång per frame. */
export function slåIhopFynd(fynd) {
  const ut = [];
  for (const f of fynd || []) {
    const förra = ut.at(-1);
    if (förra && förra.ord === f.ord && förra.plats === f.plats && f.sekund != null && förra.till != null) {
      förra.till = f.sekund;
      förra.antal++;
      continue;
    }
    ut.push({ ...f, från: f.sekund, till: f.sekund, antal: 1 });
  }
  return ut;
}

function byggBelägg(ytor) {
  const ut = [];
  for (const f of ytor.copy.fynd) ut.push(`yta 1 · ${f.fält}: "${f.ord}" (${f.sätt})`);
  for (const r of ytor.tal.repliker || []) ut.push(`yta 2 · ${r.tid}: "${r.text}"`);
  if (ytor.tal.dom?.startsWith('okänd')) ut.push(`yta 2 · ${ytor.tal.dom}`);
  for (const f of slåIhopFynd(ytor.inbränd.fynd)) {
    const tid = f.från === f.till ? `${f.från}s` : `${f.från}–${f.till}s (${f.antal} frames)`;
    ut.push(`yta 3 · ${f.plats}, ${tid}: "${f.ord}" (${f.sätt})`);
  }
  if (ytor.inbränd.dom?.startsWith('okänd')) ut.push(`yta 3 · ${ytor.inbränd.dom}`);
  for (const f of ytor.bild.fynd || []) ut.push(`yta 4 · "${f.rad}" → "${f.ord}" (${f.sätt})`);
  if (ytor.bild.dom?.startsWith('okänd')) ut.push(`yta 4 · ${ytor.bild.dom}`);
  if (ytor.inbränd.syn?.syns) {
    const s = ytor.inbränd.syn;
    ut.push(`yta 3 · ögongranskat (${s.var}${s.sekund ? `, ${s.sekund}` : ''}): "${s.ordagrant || '(symbol utan text)'}"`);
    if (s.logotyp_utan_text) ut.push('yta 3 · ⚠️ logotyp/symbol UTAN text — osynlig för OCR, bara ögat ser den');
    for (const o of s.olasligt || []) ut.push(`yta 3 · oläsligt ${o.sekund || ''}: ${o.notis}`);
  }
  if (ytor.bild.syn?.syns) {
    const s = ytor.bild.syn;
    ut.push(`yta 4 · ögongranskat (${s.var}): "${s.ordagrant || '(symbol utan text)'}"`);
  }
  return ut;
}

if (process.argv[1] && resolve(process.argv[1]).endsWith('brand-detektor.mjs')) {
  säkerställProxy();
  main().catch((e) => dö(e.message || e));
}
