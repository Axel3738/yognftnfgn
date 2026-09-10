#!/usr/bin/env node
// vagkonfig.mjs — steg 6 + 8 i `/ny-annonser`: vågkonfigen som KOD, inte som
// handskriven fil.
//
//   node factory/vagkonfig.mjs <produkt-id> --marknad SE|NO [--datum YYYY-MM-DD]
//
// Skriver, per marknad:
//   pipeline/waves/<m>-<brandprefix>-video.config.mjs   → pipeline/no-video-launch.mjs
//   pipeline/waves/<m>-<brandprefix>-image.config.mjs   → pipeline/no-image-launch.mjs
//   factory/output/<produkt>/<m>-byggplan.json          → vad som byggs, vad som väntar, varför
//   .scratch/<brandprefix>/<m>/bild/                    → bildfilerna launch-skriptet läser
//
// Axels regel 2026-09-10 (kommandofilen, "kopiera allt, rör bara det som är fel"):
//   • HELA källkampanjen följer med — varje ACTIVE källannons blir antingen en
//     rad i konfigen eller en NAMNGIVEN rad i byggplanens `vantar` med orsak.
//   • Copyn är källans ORDAGRANT. Bara rader brand-detektorn dömt som fel byts,
//     radvis, mot raden i produktfilens `kalla.copybyten`. Efter bytet skannas
//     copyn igen — står ett fel kvar (en rad som inte finns i tabellen) väntar
//     annonsen. Ingen rad skrivs om fritt, aldrig.
//   • Bilder: källbilden orörd, utom när detektorn hittat fel I BILDEN — då
//     krävs en omskriven fil i factory/output/<produkt>/bildfix/<målnamn>.jpg,
//     annars väntar annonsen. Videor: källfilen orörd; fel i tal eller inbränd
//     text → annonsen väntar (omdubb/slutkort är arbete utanför det här steget).
//   • Allt föds PAUSED, status explicit på alla tre nivåer. ACTIVE sätts bara
//     i steg 11b på Axels "Launch: <namn>".
//
// Läser: produktfilen, butiksfilen (via state), kallannonser.json,
// brand-detektor.json (BÅDA marknadernas rader — den norska halvan är sin
// egen läsning, `brand-detektor.mjs --marknad NO`). Rör aldrig Meta.

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lasYaml } from './yaml.mjs';
import { skannaVillkor, baraFel } from './villkorsskanning.mjs';
import { KONTON, MALKONTO } from './kallannonser.mjs';
import { prislista, läsRecensioner, läsButik } from './brand-detektor.mjs';

const ROT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const args = process.argv.slice(2);
const flagga = (n, s = null) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : s;
};
const dö = (m) => { console.error(`✗ ${m}`); process.exit(1); };

// ---------------------------------------------------------------- rena delar

/** Målnamn: källprefixet byts, SVANSEN behålls exakt (rakning.parkoppla
 *  matchar på svansen — `Adventskalender_NO_G_2_1` → `AdventLaneRacing_NO_G_2_1`). */
export function malnamn(kallnamn, prefixKalla, prefixMal) {
  return kallnamn.startsWith(`${prefixKalla}_`) ? `${prefixMal}_${kallnamn.slice(prefixKalla.length + 1)}` : `${prefixMal}_${kallnamn}`;
}

/** Konceptkoden (adsetet): första fältet efter prefix och marknadskod. */
export function koncept(kallnamn, prefixKalla) {
  const rest = kallnamn.startsWith(`${prefixKalla}_`) ? kallnamn.slice(prefixKalla.length + 1) : kallnamn;
  const falt = rest.split('_').filter(Boolean);
  const utanMarknad = falt.filter((f, i) => !(i === 0 && /^(SE|NO|DK|FI|UK|DE|NL)$/i.test(f)));
  return (utanMarknad[0] || falt[0] || '?').toUpperCase();
}

/** Radvisa byten i copyn. Bara hela rader som är EXAKT lika byts. */
export function fixaCopy(copy, byten) {
  const ut = { message: copy?.message ?? '', headline: copy?.headline ?? '', description: copy?.description ?? '' };
  const andrade = [];
  for (const b of byten || []) {
    for (const f of ['message', 'headline', 'description']) {
      if (!ut[f]) continue;
      const rader = ut[f].split('\n');
      let träff = false;
      const nya = rader.map((r) => { if (r === b.fran) { träff = true; return b.till; } return r; });
      if (träff) { ut[f] = nya.join('\n'); andrade.push(`${f}: "${b.fran}" → "${b.till}"`); }
    }
  }
  return { copy: ut, andrade };
}

/** Villkorsfel som står KVAR i copyn efter radbytena (anmärkningar borträknade). */
export function kvarICopy(copy, butik) {
  const texter = [...String(copy.message).split('\n'), copy.headline, copy.description]
    .filter((t) => t && t.trim())
    .map((text) => ({ yta: 'copy', text }));
  return baraFel(skannaVillkor(texter, butik));
}

const unik = (xs) => [...new Set(xs)];

/**
 * Domen för EN källannons: byggs den, och i så fall hur — eller väntar den, och varför.
 *   rad     brand-detektor-raden (kan saknas → odömd)
 *   annons  kallannonser-raden ({ namn, typ, copy, utfall, med })
 */
export function bedom({ annons, rad, byten, butik, marknad, bildfixFinns, kallfilFinns }) {
  const orsaker = [];
  const andringar = [];
  if (!rad) {
    orsaker.push(`odömd — brand-detektorn har inte läst annonsen (kör brand-detektor.mjs --marknad ${marknad})`);
  } else {
    if (rad.dom === 'okänd') {
      const olasta = Object.values(rad.ytor || {}).filter((y) => y?.tillämplig && y.träff == null && !String(y.dom || '').startsWith('ej')).map((y) => y.yta);
      orsaker.push(`okänd — oläst yta: ${olasta.join(', ') || '?'}`);
    }
    for (const y of ['tal', 'inbränd']) {
      if (rad.ytor?.[y]?.träff === true) orsaker.push(`Bäverbutiken i ${y} — kräver ${y === 'tal' ? 'omdubb' : 'slutkortsbygge'}`);
    }
    const fel = baraFel(rad.villkorsfel);
    for (const y of ['tal', 'inbränd']) {
      const fy = fel.filter((f) => f.yta === y);
      if (fy.length) {
        const nok = marknad !== 'SE' && fy.some((f) => f.regel === 'pris') ? ' (NOK-nivåer saknas i butiken — priset kan inte sättas än)' : '';
        orsaker.push(`fel ${y === 'tal' ? 'i talet' : 'inbränt i videon'}: ${unik(fy.map((f) => `${f.regel}: ${f.fel}`)).join('; ')}${nok} — ${y === 'tal' ? 'repliken omdubbas' : 'texten byts i bild'}`);
      }
    }
    const bildFel = rad.ytor?.bild?.träff === true || fel.some((f) => f.yta === 'bild');
    if (bildFel) {
      if (bildfixFinns) andringar.push(`bild: omskriven (bildfix) — ${unik(fel.filter((f) => f.yta === 'bild').map((f) => f.regel)).join(', ') || 'brand'}`);
      else orsaker.push(`bilden bär fel (${unik(fel.filter((f) => f.yta === 'bild').map((f) => f.regel)).join(', ') || 'Bäverbutiken'}) — ingen omskriven bild i bildfix/`);
    }
  }
  const { copy, andrade } = fixaCopy(annons.copy, byten);
  andringar.push(...andrade.map((a) => `copy: ${a}`));
  if (rad) {
    const kvar = kvarICopy(copy, butik);
    if (kvar.length) {
      const nok = marknad !== 'SE' && kvar.some((f) => f.regel === 'pris') ? ' (NOK-nivåer saknas i butiken)' : '';
      orsaker.push(`copy har kvar fel efter radbyten: ${unik(kvar.map((f) => `${f.regel} "${f.rad}"`)).join('; ')}${nok} — lägg raden i kalla.copybyten eller vänta`);
    }
  }
  if (!kallfilFinns) orsaker.push(`källfilen (${annons.typ}) är inte hämtad — kör brand-detektor.mjs --marknad ${marknad} --hamta`);
  return { orsaker, andringar, copy };
}

// ---------------------------------------------------------------- CLI

async function kör() {
  const produktId = args.find((a) => !a.startsWith('--'));
  if (!produktId) dö('Ange produkt-id: node factory/vagkonfig.mjs <produkt-id> --marknad SE|NO');
  const marknad = String(flagga('marknad', 'SE')).toUpperCase();
  if (!KONTON[marknad]) dö(`Okänd marknad "${marknad}" — ange --marknad ${Object.keys(KONTON).join('|')}.`);
  const datum = flagga('datum', new Date().toISOString().slice(0, 10));

  const produktfil = join(ROT, 'factory', 'produkter', `${produktId}.yaml`);
  if (!existsSync(produktfil)) dö(`Hittar inte factory/produkter/${produktId}.yaml — stoppar, letar aldrig.`);
  const p = lasYaml(readFileSync(produktfil, 'utf8'));
  if (String(p.meta?.ad_account_id) !== MALKONTO.id) dö(`meta.ad_account_id är ${p.meta?.ad_account_id}, målkontot är ${MALKONTO.id} (${MALKONTO.namn}). Stoppar.`);
  for (const f of ['page_id', 'pixel_id', 'creative_prefix']) if (!p.meta?.[f]) dö(`produktfilen saknar meta.${f}.`);
  if (!p.kalla?.annonsprefix) dö('produktfilen saknar kalla.annonsprefix.');

  const butik = läsButik(produktId);
  if (!butik) dö(`ingen butikskonfig — factory/state/<butik>--${produktId}.json saknas, så villkoren går inte att jämföra.`);
  const utMapp = join(ROT, 'factory', 'output', produktId);
  const läs = (f) => (existsSync(join(utMapp, f)) ? JSON.parse(readFileSync(join(utMapp, f), 'utf8')) : null);
  const kall = läs('kallannonser.json');
  const det = läs('brand-detektor.json');
  if (!kall?.[marknad]) dö(`kallannonser.json saknar marknaden ${marknad} — kör factory/kallannonser.mjs.`);
  if (!det) dö('brand-detektor.json saknas — kör factory/brand-detektor.mjs.');
  const domar = new Map((det.annonser || []).filter((r) => String(r.marknad || 'SE').toUpperCase() === marknad).map((r) => [r.annons, r]));
  if (domar.size === 0) dö(`brand-detektor.json har inga ${marknad}-rader — kör brand-detektor.mjs --marknad ${marknad} (oläst är aldrig ren).`);

  const butikMedFacit = { ...butik, priser: prislista(p), recensioner: läsRecensioner(utMapp) };
  const prefixKalla = String(p.kalla.annonsprefix);
  const prefixMal = String(p.meta.creative_prefix);
  const brandkod = prefixMal.toUpperCase();
  const menynamn = p.produkt?.menynamn || p.produkt?.namn || produktId;
  const pris = Number(p.ekonomi?.pris);
  const inkop = Number(p.ekonomi?.inkopskostnad);
  const beRoas = pris > 0 && inkop > 0 && pris > inkop ? (pris / (pris - inkop)).toFixed(2).replace('.', ',') : null;
  const budgetKr = Number(p.meta?.testbudget_per_dag || 1000);
  const doman = butik.butik?.doman || p.brand?.domanideer?.[0] || null;
  if (!doman) dö('ingen domän: sätt butik.doman i butiksfilen (den domän kunden ska landa på).');
  if (!butik.butik?.doman) console.log(`  ⚠️ butik.doman saknas i butiksfilen — länken byggs på brand.domanideer[0] = ${doman}. Domänen måste vara kopplad före "Launch".`);
  const handle = läsHandle(produktId) || p.produkt?.id || produktId;
  const locale = marknad === 'SE' ? '' : `/${(butik.butik?.marknader || []).find((m) => String(m.land).toUpperCase() === marknad)?.locale || marknad.toLowerCase()}`;
  const link = `https://${doman}${locale}/products/${handle}`;
  const kampanj = `${brandkod}_${marknad}_${menynamn} | BE-ROAS ${beRoas ?? '?'} | ${datum}`;
  const byten = (p.kalla.copybyten || []).map((b) => ({ fran: String(b.fran), till: String(b.till) }));

  const mediaMapp = join(ROT, '.scratch', 'brand-detektor', prefixKalla, 'media');
  const bildMapp = join(ROT, '.scratch', prefixMal.toLowerCase(), marknad.toLowerCase(), 'bild');
  mkdirSync(bildMapp, { recursive: true });
  const bildfixMapp = join(utMapp, 'bildfix');

  console.log(`Vågkonfig — ${prefixMal} · ${marknad} · ${kampanj}`);
  console.log(`  länk ${link} · ${budgetKr} kr/dag CBO · sida ${p.meta.page_id} · pixel ${p.meta.pixel_id} · konto ${MALKONTO.id}`);
  console.log(`  ${byten.length} radbyten i kalla.copybyten · ${domar.size} domar för ${marknad}\n`);

  const rader = (kall[marknad].annonser || []).filter((a) => a.med).sort((x, y) => (y.utfall?.spend ?? 0) - (x.utfall?.spend ?? 0));
  const video = {}; const bild = {}; const byggs = []; const vantar = [];
  for (const a of rader) {
    const mal = malnamn(a.namn, prefixKalla, prefixMal);
    const k = koncept(a.namn, prefixKalla);
    const rad = domar.get(a.namn) || null;
    const bildfixFil = join(bildfixMapp, `${mal}.jpg`);
    const kallfil = join(mediaMapp, `${a.namn}.${a.typ === 'video' ? 'mp4' : 'jpg'}`);
    const { orsaker, andringar, copy } = bedom({
      annons: a, rad, byten, butik: butikMedFacit, marknad,
      bildfixFinns: existsSync(bildfixFil), kallfilFinns: existsSync(kallfil),
    });
    const post = { namn: mal, kalla: a.namn, typ: a.typ, koncept: k, dom: rad?.dom ?? 'odömd', spend: Math.round(a.utfall?.spend ?? 0), kop: a.utfall?.kop ?? 0, andringar };
    if (orsaker.length) { vantar.push({ ...post, orsak: orsaker.join(' · ') }); continue; }
    byggs.push(post);
    if (a.typ === 'video') (video[k] ??= []).push({ name: mal, file: `${a.namn}.mp4`, copy });
    else {
      const src = andringar.some((x) => x.startsWith('bild:')) ? bildfixFil : kallfil;
      copyFileSync(src, join(bildMapp, `${mal}.jpg`));
      (bild[k] ??= []).push({ adName: mal, img: `${mal}.jpg`, copy });
    }
  }

  const bas = `  act: 'act_${MALKONTO.id}', // ${MALKONTO.namn} = OPS Factory (${MALKONTO.valuta}) — ALDRIG MagiBorsten ${KONTON.SE.id}
  page: '${p.meta.page_id}',
  pixel: '${p.meta.pixel_id}',
  country: '${marknad}',
  campaignName: ${JSON.stringify(kampanj)},
  link: ${JSON.stringify(link)},
  dailyBudget: '${budgetKr * 100}', // öre ${MALKONTO.valuta} = ${budgetKr} kr/dag, CBO
  campaignStatus: 'PAUSED',
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',`;
  const huvud = (typ) => `// ${marknad.toLowerCase()}-${prefixMal.toLowerCase()}-${typ}.config.mjs — ${prefixMal} ${marknad}, skriven av factory/vagkonfig.mjs ${datum}.
// GENERERAD — ändra i factory/produkter/${produktId}.yaml (kalla.copybyten) och kör om.
//
// Källa: Bäverbutikens ACTIVE-annonser i ${KONTON[marknad].namn} ${KONTON[marknad].id} (${marknad}).
// Axels regel 2026-09-10: HELA kampanjen kopieras, copyn är källans ordagrant utom
// radbytena i kalla.copybyten, bara felaktiga ytor ändras. Allt föds PAUSED —
// ACTIVE bara på Axels "Launch: <namn>" när butiken är live (/ny-annonser 11b).
// Byggplan med väntande annonser och orsaker: factory/output/${produktId}/${marknad.toLowerCase()}-byggplan.json
`;
  const adsetNamn = (k) => `${brandkod}_${marknad}_${menynamn} - ${k}`;
  const js = (o) => JSON.stringify(o, null, 2).replace(/^/gm, '        ');
  const block = (grupper) => Object.entries(grupper)
    .map(([k, ads]) => `    {\n      name: ${JSON.stringify(adsetNamn(k))},\n      ads: [\n${ads.map((a) => js(a)).join(',\n')}\n      ],\n    }`).join(',\n');
  const videoCfg = `${huvud('video')}export default {\n${bas}\n  videoDir: ${JSON.stringify(`../.scratch/brand-detektor/${prefixKalla}/media`)},\n  adsets: [\n${block(video)}\n  ],\n};\n`;
  const bildCfg = `${huvud('image')}export default {\n${bas}\n  adsets: [\n${block(bild)}\n  ],\n};\n`;

  const m = marknad.toLowerCase();
  const vagMapp = join(ROT, 'pipeline', 'waves');
  const videoFil = join(vagMapp, `${m}-${prefixMal.toLowerCase()}-video.config.mjs`);
  const bildFil = join(vagMapp, `${m}-${prefixMal.toLowerCase()}-image.config.mjs`);
  writeFileSync(videoFil, videoCfg);
  writeFileSync(bildFil, bildCfg);
  writeFileSync(join(utMapp, `${m}-byggplan.json`), JSON.stringify({ produkt: produktId, marknad, datum, kampanj, link, budget_kr_per_dag: budgetKr, byggs, vantar }, null, 2));

  const nV = Object.values(video).flat().length; const nB = Object.values(bild).flat().length;
  console.log(`${marknad}: ${byggs.length} av ${rader.length} källannonser byggs (${nV} video, ${nB} bild) · ${vantar.length} väntar`);
  for (const r of byggs) console.log(`  ✓ ${r.namn} (${r.dom}, ${r.spend} kr/${r.kop} köp) ${r.andringar.length ? '\n      ' + r.andringar.join('\n      ') : '· orörd (bara länken)'}`);
  for (const r of vantar) console.log(`  ⏳ ${r.namn} (${r.dom}, ${r.spend} kr/${r.kop} köp) — ${r.orsak}`);
  console.log(`\n✓ ${videoFil.slice(ROT.length + 1)}\n✓ ${bildFil.slice(ROT.length + 1)}\n✓ factory/output/${produktId}/${m}-byggplan.json`);
  console.log(`\nNästa (från pipeline/, dry först):\n  node no-video-launch.mjs waves/${m}-${prefixMal.toLowerCase()}-video.config.mjs --dry\n  node no-image-launch.mjs waves/${m}-${prefixMal.toLowerCase()}-image.config.mjs --imgdir=${bildMapp.slice(ROT.length + 1).replace(/^/, '../')} --dry`);
}

/** Produktens handle i OPS-butiken, ur state-filen kedjan skriver. */
function läsHandle(produktId) {
  const stateMapp = join(ROT, 'factory', 'state');
  if (!existsSync(stateMapp)) return null;
  const fil = readdirSync(stateMapp).find((f) => f.endsWith(`--${produktId}.json`));
  if (!fil) return null;
  try {
    const s = JSON.parse(readFileSync(join(stateMapp, fil), 'utf8'));
    const leta = (o) => {
      if (!o || typeof o !== 'object') return null;
      if (typeof o.handle === 'string' && o.handle && o.produkt_id === undefined && /^[a-z0-9-]+$/.test(o.handle) && o.handle !== 'kalendrarna') return o.handle;
      for (const v of Object.values(o)) { const h = leta(v); if (h) return h; }
      return null;
    };
    // Kedjan skriver produktens handle under steg.produkt (ops.mjs).
    return s.steg?.produkt?.handle || s.produkt?.handle || s.produkter?.[0]?.handle || leta(s.steg?.produkt) || null;
  } catch { return null; }
}

if (process.argv[1] && process.argv[1].endsWith('vagkonfig.mjs')) await kör();
