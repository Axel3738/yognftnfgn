// ny-video.mjs — EN färdig video utan tal och utan text i bild → en ny annons i varje marknad.
//
// Axels order 2026-10-03: "ladda upp denna videon i varje marknad" (sushistrumpor från Temu på
// TikTok: bara händer, lådan och musik). En video utan tal och utan text behöver ingen översättning,
// bara marknadens annonstext. Texten tas från marknadens egen annons 001 — skriven av sonnet och
// granskad av infödda granskare 2026-09-27–30 — så att videon är det enda som skiljer. Här skrivs
// alltså ingen ny copy (CLAUDE.md regel 6).
//
//   node matstrumpor/marknader/annonser/ny-video.mjs --fil <video.mp4> --vinkel gift --format ugc [--im] --kalla "…"
//        torrt: namnen och texterna per marknad, inget skrivs
//   … --skriv          filen till klar/, en post i varje <KOD>.json (NOB härleds med nob.mjs),
//                      raden i nya-videor.json
//   node matstrumpor/marknader/annonser/ny-video.mjs --sla-pa [--skarpt]
//                      slår på de nya annonserna ur senaste raden i nya-videor.json — BARA dem,
//                      och bara där kampanjen och adsetet redan går
//
// Bygget däremellan är bygg.mjs, en marknad i taget och NO först (de andra lånar NO:s video-id):
//   node matstrumpor/marknader/annonser/bygg.mjs --marknad NO --skarpt
//
// Järnregler: förutsättningen (inget tal, ingen text i bild, ingen främmande vattenstämpel) ses av
// sessionen innan --skriv; verktyget kan inte se den. --sla-pa slår bara på de nya ANNONSERNA — aldrig
// en kampanj eller ett adset, aldrig en annons som inte står i raden, aldrig en marknad med
// lansering_stopp eller en annons i hall_av. En PAUSED kampanj är ett beslut och står kvar: annonsen
// väntar granskad under pausen och går först när någon slår på kampanjen (mätt 2026-10-03: sju av
// fjorton utlandskampanjer var pausade när videon kom).

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join, dirname, basename } from 'node:path';
import { execFileSync } from 'node:child_process';
import { tolka } from '../../namn.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
const M = JSON.parse(readFileSync(join(ROT, 'marknader.json'), 'utf8'));
const REGISTER = join(ROT, 'nya-videor.json');
const lasJson = (fil) => JSON.parse(readFileSync(fil, 'utf8'));
const sha = (fil) => createHash('sha256').update(readFileSync(fil)).digest('hex');

/** Ren: nästa lediga löpnummer i en marknads fil (räknas per marknad, som 001–008). */
export function nastaNummer(annonser) {
  const tal = (annonser ?? []).map((a) => tolka(a.namn)?.nummer).filter((n) => Number.isInteger(n));
  return (tal.length ? Math.max(...tal) : 0) + 1;
}

/** Ren: annonsnamnet i marknaden. Kastar hellre än gissar — namnet styr analysen. */
export function annonsNamn({ kod, vinkel, format, nummer, im = false }) {
  const namn = `MATSTRUMP_${kod}_sushi_${vinkel}_${format}_${String(nummer).padStart(3, '0')}${im ? '_im' : ''}_v1`;
  const t = tolka(namn);
  if (!t || t.land !== kod || t.nummer !== nummer) throw new Error(`Namnet ${namn} följer inte mönstret i namn.mjs.`);
  return namn;
}

/** Ren: marknadens standardtext för video = annons 001 (reserv: första videoannonsen). */
export function referensText(annonser) {
  const video = (annonser ?? []).filter((a) => a.video || a.video_fran);
  const ref = video.find((a) => tolka(a.namn)?.nummer === 1) ?? video[0];
  if (!ref) throw new Error('marknaden har ingen videoannons att ta texten från');
  return { fran: ref.namn, title: ref.title, message: ref.message, link_description: ref.link_description };
}

/** Ren: posterna per marknad. Första marknaden bär filen, de andra lånar dess video-id (video_fran),
 *  som B-kampanjen i Norge gör. NOB skrivs aldrig här — den härleds ur NO.json av nob.mjs. */
export function planera({ filer, vinkel, format, im, kalla, fil, marknader = Object.keys(M.kampanjer) }) {
  const koder = marknader.filter((k) => k !== 'NOB');
  const forsta = koder[0];
  const ut = [];
  for (const kod of koder) {
    const annonser = filer[kod]?.annonser ?? [];
    const nummer = nastaNummer(annonser);
    const namn = annonsNamn({ kod, vinkel, format, nummer, im });
    if (annonser.some((a) => a.namn === namn)) throw new Error(`${kod}: ${namn} finns redan`);
    const t = referensText(annonser);
    const forstaNamn = kod === forsta ? null : ut[0].post.namn;
    ut.push({ kod, post: {
      namn,
      kalla: `${kalla} Texten är ${t.fran}:s (marknadens granskade standardtext för video).`,
      ...(kod === forsta ? { video: `klar/${fil}` } : { video_fran: forstaNamn }),
      title: t.title,
      message: t.message,
      link_description: t.link_description,
    } });
  }
  return ut;
}

function arg(namn, reserv = null) {
  const i = process.argv.indexOf(namn);
  return i > 0 ? process.argv[i + 1] : reserv;
}

async function slaPa(skarpt) {
  const { api, säkerställProxy } = await import('../../../tools/meta-lib.mjs');
  const { lankOk } = await import('./bygg.mjs');
  säkerställProxy();
  const reg = existsSync(REGISTER) ? lasJson(REGISTER) : [];
  const rad = reg.at(-1);
  if (!rad) throw new Error('nya-videor.json är tom — kör --skriv och bygg.mjs först.');
  const videor = lasJson(join(ROT, 'videor.json'));
  console.log(`Slår på "${rad.kalla}" (${rad.datum}) — ${skarpt ? 'SKARPT' : 'torrt'}`);
  const utfall = [];
  for (const [kod, namn] of Object.entries(rad.namn)) {
    const k = M.kampanjer[kod];
    const v = videor[namn];
    const skal = [];
    if (!k) skal.push('marknaden finns inte i marknader.json');
    else if (k.lansering_stopp) skal.push(`lanseringsstopp (${k.lansering_stopp.slice(0, 60)}…)`);
    if ((k?.hall_av ?? []).some((h) => h.namn === namn)) skal.push('står i hall_av');
    if (!v?.annons_id) skal.push('inte byggd än (videor.json saknar annons-id) — kör bygg.mjs för marknaden');
    if (skal.length) { utfall.push({ kod, namn, status: 'rörs inte', skal }); continue; }
    const a = await api(v.annons_id, { params: { fields: 'id,name,status,effective_status,adset{id,status,effective_status},campaign{id,name,status,effective_status},creative{object_story_spec}' } });
    const o = a.creative?.object_story_spec ?? {};
    const lank = o.video_data?.call_to_action?.value?.link ?? '';
    if (a.name !== namn) skal.push(`annonsen ${v.annons_id} heter "${a.name}"`);
    if (a.campaign?.name !== k.kampanj) skal.push(`ligger i "${a.campaign?.name}", inte ${k.kampanj}`);
    if (!lankOk(k, lank)) skal.push(`länken ${lank} stämmer inte med ${k.locale}/${k.geo.join(',')}`);
    if (skal.length) { utfall.push({ kod, namn, id: a.id, status: a.status, skal }); continue; }
    // Bara ANNONSEN slås på — den är körningens egen. En pausad kampanj eller ett pausat adset är ett
    // beslut och rörs aldrig; annonsen väntar då granskad under pausen och går först när någon slår på
    // kampanjen igen (Axel 2026-10-03: "i varje marknad"). Inget kostar under CAMPAIGN_PAUSED.
    const vantar = a.campaign?.status !== 'ACTIVE' ? `kampanjen står ${a.campaign?.status}` : a.adset?.status !== 'ACTIVE' ? `adsetet står ${a.adset?.status}` : null;
    if (a.status === 'ACTIVE') { utfall.push({ kod, namn, id: a.id, status: `redan ACTIVE (${a.effective_status})`, vantar }); continue; }
    if (!skarpt) { utfall.push({ kod, namn, id: a.id, status: `torrt: skulle slå på annonsen (${a.status} → ACTIVE)${vantar ? ` — ${vantar}, går först när den slås på` : ''}` }); continue; }
    await api(a.id, { form: { status: 'ACTIVE' } });
    const las = await api(a.id, { params: { fields: 'status,effective_status' } });
    utfall.push({ kod, namn, id: a.id, status: `${las.status}/${las.effective_status}${vantar ? ` — ${vantar}, går först när den slås på` : ''}`, vantar, ...(las.status !== 'ACTIVE' ? { skal: ['läste tillbaka fel status'] } : {}) });
  }
  for (const u of utfall) console.log(`${u.skal?.length ? '⛔' : '✅'} ${u.kod} ${u.namn}${u.id ? ` (${u.id})` : ''}: ${u.status}${u.skal?.length ? ` — ${u.skal.join('; ')}` : ''}`);
  if (skarpt) {
    rad.pa = { skrivet: new Date().toISOString(), utfall };
    writeFileSync(REGISTER, JSON.stringify(reg, null, 1) + '\n');
  }
  if (utfall.some((u) => u.skal?.length && !/lanseringsstopp/.test(u.skal.join(' ')))) process.exitCode = 1;
}

async function huvud() {
  if (process.argv.includes('--sla-pa')) return slaPa(process.argv.includes('--skarpt'));
  const kallfil = arg('--fil');
  const vinkel = arg('--vinkel');
  const format = arg('--format');
  const kalla = arg('--kalla');
  if (!kallfil || !existsSync(kallfil)) throw new Error('--fil <video.mp4> saknas eller finns inte.');
  if (!vinkel || !format || !kalla) throw new Error('--vinkel, --format och --kalla krävs (kallan: var videon kommer ifrån och vem som bad om den).');
  const im = process.argv.includes('--im');
  const fil = arg('--namn-pa-fil', `${vinkel}_${format}_${basename(kallfil).replace(/[^a-z0-9.]+/gi, '_')}`);
  const filer = Object.fromEntries(Object.keys(M.kampanjer).map((k) => [k, existsSync(join(ROT, `${k}.json`)) ? lasJson(join(ROT, `${k}.json`)) : { annonser: [] }]));
  const plan = planera({ filer, vinkel, format, im, kalla, fil });
  for (const p of plan) console.log(`${p.kod}: ${p.post.namn} ← ${p.post.video ?? `video_fran ${p.post.video_fran}`}\n   "${p.post.title}" · ${p.post.message.split('\n').at(-1)} · ${p.post.link_description}`);
  if (!process.argv.includes('--skriv')) { console.log('\ntorrt — inget skrivet. --skriv lägger in posterna.'); return; }
  copyFileSync(kallfil, join(ROT, 'klar', fil));
  for (const p of plan) {
    const f = filer[p.kod];
    f.annonser.push(p.post);
    writeFileSync(join(ROT, `${p.kod}.json`), JSON.stringify(f, null, 1) + '\n');
  }
  // NOB bär alltid exakt A:s annonser — härledd, aldrig skriven för hand.
  execFileSync(process.execPath, [join(ROT, 'nob.mjs')], { stdio: 'inherit' });
  const nob = lasJson(join(ROT, 'NOB.json')).annonser.find((a) => a.video_fran === plan[0].post.namn);
  const reg = existsSync(REGISTER) ? lasJson(REGISTER) : [];
  reg.push({ datum: new Date().toISOString().slice(0, 10), kalla, fil: `klar/${fil}`, sha256: sha(kallfil),
    namn: { ...Object.fromEntries(plan.map((p) => [p.kod, p.post.namn])), ...(nob ? { NOB: nob.namn } : {}) } });
  writeFileSync(REGISTER, JSON.stringify(reg, null, 1) + '\n');
  console.log(`\n✅ ${plan.length + (nob ? 1 : 0)} poster skrivna, filen i klar/${fil}. Nästa: bygg.mjs --marknad NO --skarpt, sedan resten, sedan --sla-pa.`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
