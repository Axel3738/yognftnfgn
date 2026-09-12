#!/usr/bin/env node
// ops-bild.mjs — bildgenerering för EN OPS-butik. Motorn bakom /ops-bild.
//
// Bäverbutikens /bildannonser hoppar över OPS-hubbarna med flit (eget konto,
// egen rutin). Det här är OPS-versionen: samma kie.ai-motor (bildannonser/kie.mjs),
// men kön läses ur BUTIKENS hub i registret, filen läggs i Notion via REST
// (tools/notion-fil-upp.mjs — inga mcp__Notion-verktyg) och raden lämnas i
// Draft tills en människa/sessionen har TITTAT på bilden och godkänt den.
//
//   node factory/ops-bild.mjs <nyckel> [--torr] [--bara <namn,namn>] [--igen] [--json]
//       Kön = rader i butikens hub med Status "Draft", Typ "Image - Pending Approval"
//       och ett IMAGE PROMPT-block i briefen. Genererar, laddar upp bilden i
//       "Filer och media", lämnar status Draft. Rader utan block eller som redan
//       har fil hoppas över — och RAPPORTERAS, aldrig tyst.
//   node factory/ops-bild.mjs <nyckel> --godkann <namn,namn> [--kommentar "…"]
//       Bilden är granskad och OK → status "To be Reviewed" (13:40-rundan tar den live).
//   node factory/ops-bild.mjs <nyckel> --underkann <namn,namn> --skal "<varför, på engelska>"
//       Bilden är underkänd → kommentar, status Draft kvar.
//   Prompten läses ur repots brief (products/<butik>/batch-*/image-ads-briefs/<namn>/brief.md)
//   om den finns, annars ur Notion-kroppen. --igen byter ut radens gamla fil.
//   node factory/ops-bild.mjs <nyckel> --namn
//       Upptagna radnamn i hubben (+ kontots annonsnamn om en analys-JSON finns),
//       så nästa lediga AD-ID går att läsa av innan briefer numreras.
//
// IMAGE PROMPT-blocket i briefen (sist i brief.md, på engelska — bildmodellen
// kräver det):
//   ## IMAGE PROMPT
//   <prompten, fritt antal rader>
//   REFERENCE IMAGES:
//   - https://…   (0–10 st; med referens körs google/nano-banana-edit, utan google/nano-banana)
//   ASPECT: 4:5
//   END IMAGE PROMPT
//
// Kräver env NOTION_TOKEN + KIE_API_KEY. Skriver factory/output/<butik>/bild-<datum>.json
// (planen + utfallet, committas) och bilderna i factory/output/<butik>/bild-<datum>/
// (gitignorerat — bilagan i Notion är enda kopian).

import { mkdirSync, existsSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROT = new URL('..', import.meta.url).pathname;
const API = 'https://api.notion.com/v1';
export const TYP_RE = /image - pending approval/i;
export const TILLATEN_TYP = 'Image - Pending Approval';
export const KO_STATUS = 'draft';
export const GODKAND_STATUS = 'To be Reviewed';
export const STANDARD_FORMAT = '4:5';
export const TILLATNA_FORMAT = ['1:1', '9:16', '16:9', '3:4', '4:3', '3:2', '2:3', '5:4', '4:5', '21:9', 'auto'];

// ------------------------------------------------------------ ren logik

/** Annonsdelen av en Notion-titel (samma regel som ops-leveranskon). */
export const annonsdel = (t) => String(t ?? '').split(/\s+[–—-]\s+/)[0].trim();

const URL_RE = /https?:\/\/[^\s)\]>"']+/g;

/**
 * Plockar IMAGE PROMPT-blocket ur en brief (markdown eller Notions textdump).
 * Returnerar { prompt, referenser, bildformat } eller null om blocket saknas.
 * Prompten är tom ⇒ null (en tom prompt får aldrig bränna credits).
 */
export function promptUrBrief(text) {
  // Notion (tools/notion-brief.mjs) slår ihop fortsättningsrader utan tom rad
  // emellan till ETT stycke — "…no face. REFERENCE IMAGES: https://… ASPECT: 4:5
  // END IMAGE PROMPT" kommer tillbaka som en enda rad. Markörerna bryts därför
  // ut till egna rader innan blocket tolkas, oavsett var i raden de står.
  const normaliserad = String(text ?? '')
    .replace(/[ \t]+(?=(?:REFERENCE IMAGES?\s*:|ASPECT(?:\s*RATIO)?\s*:|END IMAGE PROMPT\b))/gi, '\n')
    .replace(/(?<=REFERENCE IMAGES?\s*:)[ \t]+(?=https?:\/\/)/gi, '\n');
  const rader = normaliserad.split(/\r?\n/);
  const start = rader.findIndex((r) => /^\s*(#+\s*)?(\d+[.)]\s*)?IMAGE PROMPT\b/i.test(r));
  if (start === -1) return null;
  const promptRader = [];
  const referenser = [];
  let bildformat = STANDARD_FORMAT;
  let lage = 'prompt';
  for (const rad of rader.slice(start + 1)) {
    const r = rad.trim();
    if (/^END IMAGE PROMPT\b/i.test(r)) break;
    if (/^REFERENCE IMAGES?\s*:/i.test(r)) {
      lage = 'ref';
      referenser.push(...(r.match(URL_RE) ?? []));
      continue;
    }
    const aspekt = r.match(/^ASPECT(?:\s*RATIO)?\s*:\s*([\w:]+)/i);
    if (aspekt) {
      const f = aspekt[1].toLowerCase();
      if (!TILLATNA_FORMAT.includes(f)) throw new Error(`Ogiltigt ASPECT "${aspekt[1]}" i IMAGE PROMPT (tillåtna: ${TILLATNA_FORMAT.join(', ')}).`);
      bildformat = f;
      lage = 'efter';
      continue;
    }
    if (lage === 'ref') {
      const urler = r.match(URL_RE) ?? [];
      if (urler.length) { referenser.push(...urler); continue; }
      if (!r) continue;
      lage = 'efter';
    }
    if (lage === 'prompt') promptRader.push(r);
  }
  const prompt = promptRader.join('\n').trim();
  if (!prompt) return null;
  const unika = [...new Set(referenser.map((u) => u.replace(/[.,;]+$/, '')))];
  if (unika.length > 10) throw new Error(`IMAGE PROMPT har ${unika.length} referensbilder — max 10.`);
  return { prompt, referenser: unika, bildformat };
}

/**
 * Bygger jobblistan ur hubbens Draft-bildrader. Ren funktion.
 * rader: [{ id, namn, url, filer:[{namn}], brieftext }]
 * Returnerar { jobb, hoppade:[{namn, skal}] }.
 */
export function byggJobb(rader, { bara = null, igen = false, fallbackReferens = null, hubTitel = null } = {}) {
  const urval = bara ? new Set(bara.map((n) => annonsdel(n).toLowerCase())) : null;
  const jobb = [];
  const hoppade = [];
  for (const rad of rader) {
    const namn = annonsdel(rad.namn);
    if (urval && !urval.has(namn.toLowerCase())) continue;
    if ((rad.filer ?? []).length && !igen) {
      hoppade.push({ namn, skal: `har redan ${rad.filer.length} fil(er) — granska och kör --godkann/--underkann, eller --igen för en ny bild` });
      continue;
    }
    let block;
    try { block = promptUrBrief(rad.lokal?.text ?? rad.brieftext); }
    catch (e) { hoppade.push({ namn, skal: e.message }); continue; }
    if (!block) { hoppade.push({ namn, skal: 'ingen IMAGE PROMPT i briefen — lägg till blocket (se /ops-bild) och kör igen' }); continue; }
    let referens_bilder = block.referenser;
    let referens_kalla = referens_bilder.length ? 'brief' : 'ingen';
    if (!referens_bilder.length && fallbackReferens) { referens_bilder = [fallbackReferens]; referens_kalla = 'produktfil'; }
    jobb.push({
      namn, typ: TILLATEN_TYP, hub: hubTitel, notion_url: rad.url ?? null, page_id: rad.id,
      prompt: block.prompt, bildformat: block.bildformat, referens_bilder, referens_kalla,
      prompt_kalla: rad.lokal ? 'repo' : 'notion',
    });
  }
  if (urval) {
    for (const n of urval) if (!jobb.some((j) => j.namn.toLowerCase() === n) && !hoppade.some((h) => h.namn.toLowerCase() === n)) hoppade.push({ namn: n, skal: 'finns inte i kön (fel namn, fel status eller fel Typ)' });
  }
  return { jobb, hoppade };
}

/**
 * Repots egen brief för raden, om den finns:
 * products/<butik>/batch-*\/image-ads-briefs/<namn>/brief.md. Den vinner över
 * Notion-kroppen — repot är källan, Notion är kopian redigerarna läser, och en
 * skärpt prompt ska inte kräva att sidkroppen skrivs om. Saknas ⇒ null.
 */
export function lokalBrief(butik, namn, rot = ROT) {
  if (!butik || !namn) return null;
  const produktmapp = join(rot, 'products', butik);
  if (!existsSync(produktmapp)) return null;
  // Ingen fs.globSync — den finns först i Node 22, repot kräver bara Node 20.
  const traffar = readdirSync(produktmapp)
    .filter((d) => /^batch-\d+/.test(d))
    .map((d) => join(produktmapp, d, 'image-ads-briefs', annonsdel(namn), 'brief.md'))
    .filter((f) => existsSync(f))
    .sort();
  if (!traffar.length) return null;
  const fil = traffar.at(-1);
  return { fil, text: readFileSync(fil, 'utf8') };
}

/** Nästa lediga nummer för ett koncept ur en namnlista: PD_14 om PD_13 är högst. */
export function nastaNummer(namn, prefix, koncept) {
  const re = new RegExp(`^${prefix}_${koncept}_(\\d+)(?:_|$)`, 'i');
  let max = 0;
  for (const n of namn) { const m = annonsdel(n).match(re); if (m) max = Math.max(max, Number(m[1])); }
  return max + 1;
}

// ------------------------------------------------------------ nät

async function notion(sokvag, { method = 'GET', body = null } = {}) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN saknas i miljön.');
  const res = await fetch(`${API}/${sokvag}`, {
    method,
    headers: { authorization: `Bearer ${token}`, 'notion-version': '2022-06-28', 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Notion 404 på ${sokvag} — integrationen är inte inbjuden till hubben (••• → Connections).`);
    throw new Error(`Notion ${res.status}: ${json.message || res.statusText}`);
  }
  return json;
}

const text = (rika = []) => rika.map((r) => r.plain_text ?? '').join('');

/** Sidans innehåll som textrader (samma läsning som notion-klara --brief). */
async function sidText(pageId, djup = 0) {
  const rader = [];
  let cursor;
  do {
    const r = await notion(`blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`);
    for (const b of r.results ?? []) {
      const inne = b[b.type] ?? {};
      const t = b.type === 'table_row' ? (inne.cells ?? []).map((c) => text(c)).join(' | ') : text(inne.rich_text ?? []);
      const url = inne.url ?? inne.external?.url ?? inne.file?.url ?? '';
      if (t) rader.push(t);
      if (url) rader.push(url);
      if (b.has_children && djup < 3) rader.push(...await sidText(b.id, djup + 1));
    }
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return rader;
}

async function hamtaHub(databaseId) {
  const d = await notion(`databases/${String(databaseId).replace(/-/g, '')}`);
  return { id: d.id, titel: (d.title ?? []).map((t) => t.plain_text ?? '').join('') || '(namnlös)', url: d.url ?? null };
}

async function allaRadnamn(databaseId) {
  const id = String(databaseId).replace(/-/g, '');
  const ut = [];
  let cursor;
  do {
    const r = await notion(`databases/${id}/query`, { method: 'POST', body: cursor ? { start_cursor: cursor, page_size: 100 } : { page_size: 100 } });
    for (const s of r.results ?? []) {
      const p = s.properties ?? {};
      const namn = Object.values(p).find((v) => v.type === 'title')?.title?.map((x) => x.plain_text).join('') ?? '';
      if (namn) ut.push(namn);
    }
    cursor = r.has_more ? r.next_cursor : null;
  } while (cursor);
  return ut;
}

/** Kontots annonsnamn ur senaste analys-JSON (skrivs av nattvaktens skalning.mjs). */
function kontonamn(butiksmapp) {
  if (!existsSync(butiksmapp)) return [];
  const filer = readdirSync(butiksmapp).filter((f) => /^analys-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
  if (!filer.length) return [];
  const namn = new Set();
  try {
    JSON.stringify(JSON.parse(readFileSync(join(butiksmapp, filer.at(-1)), 'utf8')), (k, v) => { if ((k === 'namn' || k === 'name') && typeof v === 'string') namn.add(v); return v; });
  } catch { /* trasig fil = inga kontonamn, hubben räcker */ }
  return [...namn];
}

function aterkoppling(pageId, kommentar, status) {
  const a = [join(ROT, 'tools', 'notion-aterkoppling.mjs'), String(pageId).replace(/-/g, ''), '--kommentar', kommentar];
  if (status) a.push('--status', status);
  const r = spawnSync(process.execPath, a, { encoding: 'utf8', env: process.env });
  return { ok: r.status === 0, ut: `${r.stdout ?? ''}${r.stderr ?? ''}`.trim() };
}

// ------------------------------------------------------------ huvudflödet

export async function laddaKo(nyckel, { logg = (...a) => console.error(...a) } = {}) {
  const { laddaButik, sakerstallKonto, OPS_ANNONSKONTO, svenskDatum } = await import('./register.mjs');
  const butik = laddaButik(nyckel);
  const konto = sakerstallKonto(butik.post);
  if (konto !== OPS_ANNONSKONTO) throw new Error(`STOPP: ${butik.post.nyckel} pekar på konto ${konto}, inte OPS-kontot ${OPS_ANNONSKONTO}. Bäverbutikens bilder görs av /bildannonser.`);
  const hubId = butik.post.notion?.database_id;
  if (!hubId) throw new Error(`${butik.post.nyckel}: hubben är inte inskriven — node factory/register.mjs notion ${butik.post.nyckel} <id>`);
  const hub = await hamtaHub(hubId);
  logg(`Butik: ${butik.post.brand} (${butik.post.nyckel}) · konto ${konto} · hub "${hub.titel}"`);
  const { klaraRader } = await import('../tools/notion-kalla.mjs');
  const raa = await klaraRader(hub, { statusar: [KO_STATUS], typ: TYP_RE });
  const rader = [];
  for (const r of raa) rader.push({ ...r, brieftext: (await sidText(r.id)).join('\n'), lokal: lokalBrief(butik.post.butik, r.namn) });
  const fallback = butik.produkt?.media?.bilder?.find?.((b) => /^https?:\/\//.test(String(b))) ?? null;
  return { butik, hub, rader, fallbackReferens: fallback, datum: svenskDatum(), butiksmapp: join(ROT, 'factory', 'output', butik.post.butik) };
}

async function main() {
  const args = process.argv.slice(2);
  const flagga = (n, s = null) => { const i = args.indexOf(`--${n}`); return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : s; };
  const finns = (n) => args.includes(`--${n}`);
  const nyckel = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
  const json = finns('json');
  const logg = (...a) => console.error(...a);
  if (!nyckel) { console.error('Använd: node factory/ops-bild.mjs <nyckel> [--torr] [--bara a,b] [--igen] [--godkann a,b] [--underkann a,b --skal "…"] [--namn] [--json]'); process.exit(2); }
  const lista = (s) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : null);

  const ko = await laddaKo(nyckel, { logg });
  mkdirSync(ko.butiksmapp, { recursive: true });

  if (finns('namn')) {
    const hubNamn = await allaRadnamn(ko.hub.id);
    const konto = kontonamn(ko.butiksmapp);
    const alla = [...new Set([...hubNamn.map(annonsdel), ...konto])].sort();
    if (json) console.log(JSON.stringify({ hub: hubNamn.map(annonsdel), konto, alla }));
    else { console.log(`Upptagna namn (${hubNamn.length} i hubben, ${konto.length} i kontot):`); for (const n of alla) console.log(`  ${n}`); }
    return;
  }

  const godkann = lista(flagga('godkann'));
  const underkann = lista(flagga('underkann'));
  if (godkann || underkann) {
    const ut = [];
    for (const n of godkann ?? []) {
      const rad = ko.rader.find((r) => annonsdel(r.namn).toLowerCase() === annonsdel(n).toLowerCase());
      if (!rad) { ut.push({ namn: n, ok: false, fel: 'finns inte bland Draft-bildraderna i hubben' }); continue; }
      if (!(rad.filer ?? []).length) { ut.push({ namn: n, ok: false, fel: 'raden har ingen fil i "Filer och media" — statusen flyttas aldrig före bilden sitter' }); continue; }
      const r = aterkoppling(rad.id, flagga('kommentar', 'Image generated by /ops-bild and checked against the brief. Ready for the 13:40 delivery run.'), GODKAND_STATUS);
      ut.push({ namn: n, ok: r.ok, status: r.ok ? GODKAND_STATUS : null, fel: r.ok ? null : r.ut });
    }
    for (const n of underkann ?? []) {
      const skal = flagga('skal');
      if (!skal) { console.error('--underkann kräver --skal "<varför, på engelska>".'); process.exit(2); }
      const rad = ko.rader.find((r) => annonsdel(r.namn).toLowerCase() === annonsdel(n).toLowerCase());
      if (!rad) { ut.push({ namn: n, ok: false, fel: 'finns inte bland Draft-bildraderna i hubben' }); continue; }
      const r = aterkoppling(rad.id, `Image rejected by /ops-bild QA: ${skal}`, 'Draft');
      ut.push({ namn: n, ok: r.ok, status: 'Draft', fel: r.ok ? null : r.ut });
    }
    for (const u of ut) logg(`  ${u.ok ? '✓' : '✗'} ${u.namn}${u.status ? ` → ${u.status}` : ''}${u.fel ? ` — ${u.fel}` : ''}`);
    if (json) console.log(JSON.stringify(ut));
    if (ut.some((u) => !u.ok)) process.exitCode = 1;
    return;
  }

  // Generering.
  const { jobb, hoppade } = byggJobb(ko.rader, { bara: lista(flagga('bara')), igen: finns('igen'), fallbackReferens: ko.fallbackReferens, hubTitel: ko.hub.titel });
  logg(`Kö: ${ko.rader.length} Draft-bildrader · ${jobb.length} att generera · ${hoppade.length} hoppade`);
  for (const h of hoppade) logg(`  ⏭️  ${h.namn} — ${h.skal}`);
  for (const j of jobb) logg(`  · ${j.namn} · ${j.bildformat} · ${j.referens_bilder.length} ref (${j.referens_kalla}) · prompt ${j.prompt.length} tecken (${j.prompt_kalla})`);

  const torr = finns('torr');
  const planfil = join(ko.butiksmapp, `bild-${ko.datum}.json`);
  const utMapp = join(ko.butiksmapp, `bild-${ko.datum}`);
  const plan = { datum: ko.datum, butik: ko.butik.post.nyckel, hub: ko.hub.titel, torr, jobb, hoppade, resultat: [] };

  if (!jobb.length || torr) {
    writeFileSync(planfil, JSON.stringify(plan, null, 2));
    logg(torr ? `--torr: inget genererat. Plan: ${planfil}` : `Inget att generera. Plan: ${planfil}`);
    if (json) console.log(JSON.stringify(plan));
    return;
  }

  const { granskaJobbfil, koraJobb, koraIPuljer } = await import('../bildannonser/run.mjs');
  const granskade = granskaJobbfil({ jobb });
  mkdirSync(utMapp, { recursive: true });
  const samtidiga = Number(flagga('samtidiga', 2));
  const { laddaUppTillRad } = await import('../tools/notion-fil-upp.mjs');
  const resultat = await koraIPuljer(granskade, async (j) => {
    const r = await koraJobb(j, { utMapp, dry: false });
    r.page_id = j.page_id;
    logg(`  ${r.status === 'ok' ? '✓' : '✗'} genererad: ${r.namn}${r.fel ? ` — ${r.fel}` : ''}`);
    if (r.status !== 'ok') return r;
    try {
      const upp = await laddaUppTillRad({ pageId: j.page_id, fil: r.fil, ersatt: finns('igen'), logg: () => {} });
      r.notion = { file_upload_id: upp.file_upload_id, falt: upp.falt };
      logg(`  ✓ i Notion: ${r.namn} (Draft kvar — granska bilden, sedan --godkann)`);
    } catch (e) {
      r.status = 'fel'; r.fel = `bilden genererad (${r.fil}) men Notion-uppladdningen misslyckades: ${e.message}`;
      logg(`  ✗ Notion: ${r.namn} — ${e.message}`);
    }
    return r;
  }, samtidiga);
  plan.resultat = resultat;
  writeFileSync(planfil, JSON.stringify(plan, null, 2));
  const ok = resultat.filter((r) => r.status === 'ok').length;
  logg(`Klart: ${ok} i Notion, ${resultat.length - ok} fel, ${hoppade.length} hoppade → ${planfil}`);
  if (json) console.log(JSON.stringify(plan));
  if (ok < resultat.length) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try { await main(); } catch (e) { console.error(`✗ ${e.message}`); process.exit(1); }
}
