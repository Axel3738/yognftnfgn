// Spoks-roboten: schemalägger kampanjutkast i Spoks-appen, eftersom varken Spoks MCP eller
// Spoks publika API kan schemalägga (mätt 2026-09-29/30). Axels order 2026-09-30: "bygg en cli
// för att kunna interagera med hemsidan … och sen scheduelar du alla".
//
//   node klaviyo/spoks/robot/spoks-robot.mjs logga-in [--epost kundsupport@baverbutiken.se] [--brand baverbutiken]
//   node klaviyo/spoks/robot/spoks-robot.mjs schemalagg --facit klaviyo/spoks/cowork/<brand>-schema-<datum>.json [--bara K03,V02] [--torr]
//   node klaviyo/spoks/robot/spoks-robot.mjs statistik --post <postId> [--brand matstrumpor]
//
// statistik läser ett skickat mejls avregistreringar och spamklagomål, som varken MCP:n eller
// API:t ger (get_campaign_statistics har bara mottagare, öppningar, klick och köp), och dömer dem
// mot LARM_LEVERANS (docs/os/EPOST-STRATEGI.md §8). Bara läsning. Sidan listar mottagarna med
// namn och e-post; roboten skriver aldrig ut dem, bara talen.
//
// Facit är samma JSON som cowork-schema.mjs skriver (kod, postId, segment, datum, tid). Per mejl:
//   utkast            → Till: (väljer facits segment om fältet är tomt) → TITTA IGENOM → Smart
//                       sending av? → Planera → datum/tid → Tillämpa (sparar direkt)
//   schemalagt, fel tid → pillret → Ändra publiceringstid → datum/tid → Tillämpa → TITTA IGENOM
//                       → Uppdatera inlägg (Tillämpa ensam sparar INTE ett schemalagt mejl)
//   schemalagt, rätt tid → rörs inte
// Spärrar: SKICKA_NU (aldrig "Publicera nu"), bara mejl i facit, fel arbetsyta stoppar allt, fel
// eller tomt segment och påslagen Smart sending stoppar mejlet, och varje sparning måste synas
// som en PUT mot posten. Kontrollera alltid efteråt med search_campaigns (cowork-schema --jamfor).
import { readFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { starta, texter, vantaPaText, nod, klicka, PROFIL } from './webblasare.mjs';
import { valjDatumTid } from './datumvaljare.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const LOGG = join(PROFIL, '..', 'robot-logg.jsonl');

export const SEGMENTTEXT = /^(SEG_\S+|All [A-Za-z ]+|VIP customers) \((\d+)\)$/;

// Pillret skriver dagen utan nolla och månaden med: "tors. 1.10 kl 18:00".
export function pillVantat({ datum, tid }) {
  const [, m, d] = datum.split('-');
  return `${Number(d)}.${m} kl ${tid}`;
}

// Inloggningslänken ur Spoks mejl (quoted-printable, länken går via auth.links.spoks.com).
export function inloggningslank(ra) {
  const text = String(ra).replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  return [...text.matchAll(/href=["']?([^"' >]+)/gi)].map((m) => m[1].replace(/&amp;/g, '&'))
    .find((u) => /^https:\/\/auth\.links\.spoks\.com\//.test(u) && /oobCode|mode(=|%3D)signIn/i.test(u)) ?? null;
}

// Fliken "Mottagaraktivitet" i ett skickat mejls statistik, rad för rad som Spoks skriver den
// (mätt på Matstrumpors K01 2026-09-30). "Återställd" är Spoks svenska för studsade.
const AKTIVITET = {
  levererad: 'Levererad', oppnad: 'Öppnad', klickade: 'Klickade', konverterad: 'Konverterad',
  studsade: 'Återställd', avregistrerade: 'Avprenumererad', spam: 'Markerad som skräppost', overhoppade: 'Överhoppad',
};
export function lasMottagaraktivitet(rader) {
  const ut = {};
  for (const [nyckel, etikett] of Object.entries(AKTIVITET)) {
    const re = new RegExp(`^${etikett} ([\\d\\s\\u00a0\\u202f]+)$`);
    const rad = rader.find((t) => re.test(t));
    ut[nyckel] = rad ? Number(rad.match(re)[1].replace(/\D/g, '')) : null;
  }
  return ut;
}

// LARM_LEVERANS: avregistreringar över 1 % eller spamklagomål över 0,3 % av de levererade.
export function larmLeverans({ levererad, avregistrerade, spam }) {
  if (!levererad || avregistrerade == null || spam == null) return { larm: null, orsak: 'talen saknas eller stod inte still på sidan' };
  const procent = (n) => Math.round((n / levererad) * 10000) / 100;
  return { avregProcent: procent(avregistrerade), spamProcent: procent(spam), larm: avregistrerade / levererad > 0.01 || spam / levererad > 0.003 };
}

function arg(namn) { const i = process.argv.indexOf(namn); return i >= 0 ? process.argv[i + 1] : null; }
function logga(o) {
  mkdirSync(dirname(LOGG), { recursive: true });
  appendFileSync(LOGG, JSON.stringify({ nar: new Date().toISOString(), ...o }) + '\n');
  console.log(JSON.stringify(o));
}

function brevlada(brand, ...a) {
  return JSON.parse(execFileSync('node', ['kundtjanst/mail.mjs', ...a, '--json', '--brand', brand], { cwd: ROT, encoding: 'utf8', maxBuffer: 20e6 }));
}
const inloggningsmejl = (brand) => (brevlada(brand, 'sok', 'Sign in to Spoks').traffar ?? []).filter((t) => /auth\.spoks\.com/.test(t.franAdress ?? t.fran ?? ''));

async function loggaIn() {
  const epost = arg('--epost') ?? 'kundsupport@baverbutiken.se';
  const brand = arg('--brand') ?? 'baverbutiken';
  const forra = Math.max(0, ...inloggningsmejl(brand).map((t) => t.uid));
  const { ctx, page } = await starta();
  try {
    await page.goto('https://app.spoks.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!await vantaPaText(page, 'Välkommen till Spoks', 45000)) throw new Error('Inloggningssidan kom aldrig.');
    const falt = await page.$('input');
    await falt.click();
    await page.keyboard.type(epost, { delay: 30 });
    await klicka(page, 'Fortsätta');
    if (!await vantaPaText(page, 'Kolla din inkorg', 30000)) throw new Error('Spoks bekräftade inte att länken skickades.');
    let uid = null;
    for (let i = 0; i < 24 && !uid; i++) {
      await page.waitForTimeout(5000);
      uid = inloggningsmejl(brand).map((t) => t.uid).filter((u) => u > forra).sort((a, b) => b - a)[0] ?? null;
    }
    if (!uid) throw new Error(`Inget nytt inloggningsmejl i ${epost} på två minuter.`);
    const lank = inloggningslank(brevlada(brand, 'las', String(uid), '--ra').ra);
    if (!lank) throw new Error(`Hittar ingen inloggningslänk i mejl ${uid}.`);
    await page.goto(lank, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(15000);
    await page.goto('https://app.spoks.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!await vantaPaText(page, 'Kampanjer', 45000)) throw new Error('Inloggningen gick inte igenom.');
    console.log(`Inloggad som ${epost} (mejl ${uid}). Profilen: ${PROFIL}`);
  } finally { await ctx.close(); }
}

async function tillChips(page) {
  return (await texter(page)).filter((e) => e.role !== 'group' && SEGMENTTEXT.test(e.t)).map((e) => e.t)
    .filter((t, i, a) => a.indexOf(t) === i);
}

// Kryssar exakt ett segment i "Till:". Listan skrollar och stängs inte av Esc.
async function valjSegment(page, segment) {
  await klicka(page, 'Välj ett segment', { exakt: false });
  await page.waitForTimeout(1500);
  let klickad = false;
  for (let i = 0; i < 10 && !klickad; i++) {
    const el = await nod(page, segment + ' (', { exakt: false, roll: 'group' });
    const b = el ? await el.boundingBox() : null;
    if (b && b.y > 150 && b.y + b.height < 575) { await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); klickad = true; break; }
    await page.mouse.move(720, 400);
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(700);
  }
  if (!klickad) throw new Error(`Hittar inte ${segment} i segmentlistan.`);
  await page.waitForTimeout(1200);
  await page.mouse.click(150, 600);
  await page.waitForTimeout(1200);
  if ((await texter(page)).some((e) => e.role === 'group' && SEGMENTTEXT.test(e.t))) throw new Error('Segmentlistan gick inte att stänga.');
  const chips = await tillChips(page);
  if (chips.length !== 1 || !chips[0].startsWith(segment + ' (')) throw new Error(`Till: visar ${JSON.stringify(chips)} efter valet, väntat ${segment}.`);
  return chips[0];
}

// Smart sending-rutan har inget tillstånd i DOM:en; färgen mitt i rutan avgör (vit = av).
async function smartSendingAv(page) {
  const el = await nod(page, 'Smart sending', { exakt: false, roll: 'button' });
  if (!el) throw new Error('Hittar inte Smart sending.');
  const b = await el.boundingBox();
  const x = Math.round(b.x + 32), y = Math.round(b.y + b.height / 2);
  const bild = await page.screenshot({ clip: { x: x - 4, y: y - 4, width: 8, height: 8 } });
  const lum = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data; let s = 0;
    for (let i = 0; i < d.length; i += 4) s += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    return s / (d.length / 4);
  }, bild.toString('base64'));
  return { av: lum > 200, lum: Math.round(lum) };
}

async function vantaPaPut(page, postId, fran, ms = 12000) {
  const slut = Date.now() + ms;
  while (Date.now() < slut) {
    if (page.__put.slice(fran).some((u) => u.includes(`/posts/${postId}`))) return true;
    await page.waitForTimeout(500);
  }
  return false;
}

async function ettMejl(page, r, { lank, torr }) {
  await page.goto(lank.replace('{postId}', r.postId), { waitUntil: 'domcontentloaded', timeout: 60000 });
  // Ett skickat mejl har ingen TITTA IGENOM, bara "Publicerad kampanj": det rörs aldrig.
  let sida = null;
  for (let i = 0; i < 45 && !sida; i++) {
    const t = await texter(page);
    if (t.some((e) => e.t.startsWith('Publicerad kampanj'))) sida = 'publicerad';
    else if (t.some((e) => e.t.includes('TITTA IGENOM'))) sida = 'redigerbar';
    else await page.waitForTimeout(1000);
  }
  if (!sida) throw new Error('Sidan kom aldrig.');
  if (sida === 'publicerad') return { utfall: 'publicerad', rord: false };
  // Sidhuvudet kommer före mejlet: vänta in mottagarfältet (FD11 2026-09-30 lästes under laddningen).
  if (!await vantaPaText(page, 'Till:', 45000)) throw new Error('Mottagarfältet kom aldrig.');
  await page.waitForTimeout(1500);
  const t0 = await texter(page);
  const pill = t0.find((e) => e.t.startsWith('Kommer att publiceras'))?.t ?? null;
  const vantat = pillVantat(r);
  if (pill && pill.includes(vantat)) return { utfall: 'redan', pill };
  if (pill) {
    await klicka(page, 'Kommer att publiceras', { exakt: false, roll: 'button' });
    await klicka(page, 'Ändra publiceringstid', { roll: 'button' });
    await page.waitForTimeout(1200);
    const vald = await valjDatumTid(page, r.datum, r.tid);
    if (torr) return { utfall: 'torr-flytt', fran: pill, vald };
    await klicka(page, 'Tillämpa', { roll: 'button' });
    await klicka(page, 'TITTA IGENOM', { roll: 'button' });
    await page.waitForTimeout(4000);
    const ss = await smartSendingAv(page);
    if (!ss.av) throw new Error(`Smart sending ser påslagen ut (ljus ${ss.lum}).`);
    const efter = (await texter(page)).find((e) => e.t.startsWith('Kommer att publiceras'))?.t ?? '';
    if (!efter.includes(vantat)) throw new Error(`Pillret visar "${efter}", väntat ${vantat}.`);
    const fran = page.__put.length;
    await klicka(page, 'Uppdatera inlägg', { roll: 'button' });
    if (!await vantaPaPut(page, r.postId, fran)) throw new Error('Spoks sparade inte (ingen PUT).');
    return { utfall: 'flyttad', fran: pill, till: efter };
  }
  let chips = await tillChips(page);
  let valtSegment = null;
  if (!chips.length) {
    if (torr) return { utfall: 'torr', skulleValja: r.segment };
    valtSegment = await valjSegment(page, r.segment);
    chips = [valtSegment];
  }
  const m = chips.length === 1 ? chips[0].match(SEGMENTTEXT) : null;
  if (!m || m[1] !== r.segment) throw new Error(`Till: visar ${JSON.stringify(chips)}, facit ${r.segment}.`);
  if (Number(m[2]) === 0) throw new Error(`${r.segment} har 0 kontakter.`);
  await klicka(page, 'TITTA IGENOM', { roll: 'button' });
  await page.waitForTimeout(4000);
  if (!(await texter(page)).some((e) => e.t === 'Planera')) throw new Error('Ingen Planera-knapp på granskningen.');
  const ss = await smartSendingAv(page);
  if (!ss.av) throw new Error(`Smart sending ser påslagen ut (ljus ${ss.lum}).`);
  await klicka(page, 'Planera', { roll: 'button' });
  await page.waitForTimeout(2000);
  const vald = await valjDatumTid(page, r.datum, r.tid);
  if (torr) return { utfall: 'torr', vald };
  const fran = page.__put.length;
  await klicka(page, 'Tillämpa', { roll: 'button' });
  if (!await vantaPaPut(page, r.postId, fran)) throw new Error('Spoks sparade inte (ingen PUT).');
  await page.waitForTimeout(1500);
  return { utfall: 'schemalagd', vald, ...(valtSegment ? { valtSegment } : {}) };
}

async function schemalagg() {
  const facitFil = arg('--facit') ?? (() => { throw new Error('--facit <fil.json> krävs.'); })();
  const facit = JSON.parse(readFileSync(facitFil, 'utf8'));
  const arbetsyta = JSON.parse(readFileSync(join(ROT, 'klaviyo', 'konto', facit.brand, 'spoks.json'), 'utf8')).arbetsyta;
  const bara = (arg('--bara') ?? '').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  const rader = facit.rader.filter((r) => !bara.length || bara.includes(r.kod));
  const torr = process.argv.includes('--torr');
  const { ctx, page } = await starta();
  let ok = 0, fel = 0;
  try {
    // Fel arbetsyta stoppar allt innan något rörs.
    await page.goto(arbetsyta.lankar.kampanjer, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (/\/login/.test(page.url())) throw new Error('Inte inloggad: kör logga-in först.');
    if (!await vantaPaText(page, arbetsyta.namn, 45000)) throw new Error(`Arbetsytan ${arbetsyta.namn} syns inte.`);
    for (const r of rader) {
      try {
        logga({ brand: facit.brand, kod: r.kod, datum: r.datum, tid: r.tid, segment: r.segment, ...await ettMejl(page, r, { lank: arbetsyta.lankar.kampanj, torr }) });
        ok++;
      } catch (e) {
        logga({ brand: facit.brand, kod: r.kod, datum: r.datum, tid: r.tid, fel: e.message });
        fel++;
      }
    }
  } finally { await ctx.close(); }
  console.log(`KLART: ${ok} ok, ${fel} fel av ${rader.length}. Kontrollera med search_campaigns + cowork-schema --jamfor.`);
  if (fel) process.exitCode = 1;
}

// Den synliga nod vars text är exakt `text` och som står högst upp (flikraden, före rubriker med
// samma ord: "Leveransförmåga" finns både som flik och som rubrik längre ner).
async function hogstUpp(page, text) {
  return page.evaluate((text) => {
    const r = [...document.querySelectorAll('flt-semantics')]
      .filter((e) => ((e.getAttribute('aria-label') ?? '') || (e.textContent ?? '')).trim() === text)
      .map((e) => e.getBoundingClientRect()).filter((b) => b.width > 0 && b.y > 0 && b.y < innerHeight)
      .sort((a, b) => a.y - b.y)[0];
    return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null;
  }, text);
}

// Postsidan → "Se statistik" (under mejlet) → fliken "Mottagaraktivitet" → talen. Exit 3 = larm.
async function statistik() {
  const postId = arg('--post') ?? (() => { throw new Error('--post <postId> krävs.'); })();
  if (!/^[0-9a-f-]{36}$/i.test(postId)) throw new Error(`Konstigt postId: ${postId}`);
  const brand = arg('--brand') ?? 'matstrumpor';
  const arbetsyta = JSON.parse(readFileSync(join(ROT, 'klaviyo', 'konto', brand, 'spoks.json'), 'utf8')).arbetsyta;
  const lank = arbetsyta.lankar.kampanj.replace('{postId}', postId).replace(/\/edit$/, '');
  const { ctx, page } = await starta();
  try {
    await page.goto(lank, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (/\/login/.test(page.url())) throw new Error('Inte inloggad: kör logga-in först.');
    if (!await vantaPaText(page, 'Se statistik', 45000)) throw new Error('Ingen statistik på sidan: är mejlet skickat?');
    let b = null;
    for (let i = 0; i < 25; i++) {
      const el = await nod(page, 'Se statistik', { exakt: false });
      b = el ? await el.boundingBox() : null;
      if (b && b.y > 100 && b.y + b.height < 850) break;
      b = null;
      await page.mouse.move(860, 500);
      await page.mouse.wheel(0, 400);
      await page.waitForTimeout(700);
    }
    if (!b) throw new Error('Hittar inte "Se statistik".');
    await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    if (!await vantaPaText(page, 'Mottagaraktivitet', 30000)) throw new Error('Statistiken öppnades inte.');
    const flik = await hogstUpp(page, 'Mottagaraktivitet');
    if (!flik) throw new Error('Hittar inte fliken Mottagaraktivitet.');
    await page.mouse.click(flik.x, flik.y);
    // Fliken ritar först platshållare (mätt 2026-09-30: "Avprenumererad 1234", "Levererad 2 981"
    // och "Klickade 51" ur översikten) och byter till de riktiga talen några sekunder senare.
    // Talen räknas därför först när två läsningar i rad, tre sekunder isär, är identiska.
    let tal = lasMottagaraktivitet([]), forra = null, stilla = false;
    await page.waitForTimeout(5000);
    for (let i = 0; i < 20 && !stilla; i++) {
      tal = lasMottagaraktivitet((await texter(page)).map((e) => e.t));
      const nu = JSON.stringify(tal);
      stilla = nu === forra && ![tal.levererad, tal.avregistrerade, tal.spam].includes(null);
      forra = nu;
      if (!stilla) await page.waitForTimeout(3000);
    }
    if (!stilla) tal = lasMottagaraktivitet([]);
    const ut = { brand, postId, ...tal, ...larmLeverans(tal) };
    logga({ kommando: 'statistik', ...ut });
    if (ut.larm === null) process.exitCode = 1;
    else if (ut.larm) process.exitCode = 3;
  } finally { await ctx.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const kommando = process.argv[2];
  const k = { 'logga-in': loggaIn, schemalagg, statistik }[kommando];
  if (!k) { console.error('Kommandon: logga-in, schemalagg, statistik (se huvudet i filen).'); process.exit(2); }
  k().catch((e) => { console.error('FEL', e.message); process.exit(1); });
}
