#!/usr/bin/env node
// ops-leveranskon.mjs — leveranskön för EN OPS-butik: Notion-rader i butikens
// creative hub → mål i butikens kampanj i OPS-kontot (MagiBorsten DK
// 915422744950975). Läser bara — laddar aldrig upp, rör aldrig kontot.
//
//   node tools/ops-leveranskon.mjs <nyckel> [--marknad SE|NO] [--status "To be Reviewed"] [--json] [--ut <mapp>]
//
//   <nyckel>    OPS-registrets nyckel: hemvakten, tacklebay/fiskespohallare-4-pack …
//   --marknad   SE (standard) = leveransrundan, rader i "To be Reviewed" — plus
//               redigerarens rader i "Creative strat review" som bär butikens
//               eget prefix och har en fil (Axels beslut 2026-09-13, se CS_STATUS_SE).
//               NO = översättningsrundan; kör då --status "SE-ACTIVE to be translated".
//   --status    statusen raderna ska stå i (skiftlägesokänsligt). Med flaggan
//               satt tas INGA extra CS-rader.
//   --json      maskinläsbar kö på stdout (loggen går alltid på stderr).
//   --ut <mapp> hämta varje rads fil via tools/notion-fil.mjs till <mapp>/<namn>.
//               Utan flaggan hämtas inget — Notions fil-URL:er är signerade och
//               kortlivade och skrivs ALDRIG ut härifrån.
//
// Bäverbutikens tools/leveranskon.mjs och oversattningskon.mjs är hårdkodade
// till 1867947880635861 och undantar OPS-hubbarna per id. Det här verktyget är
// spegelbilden: en butik, ett konto, en hub ur registret.
//
// Spärrar (aldrig valfria):
//   • Kontot MÅSTE vara OPS-kontot. Läge test (Bäverbutiken) stoppas.
//   • Exakt EN ACTIVE kampanj för marknaden. Noll eller flera ⇒ kampanj: null
//     med skäl — gissa aldrig. PAUSED med spend är AVVECKLAD (ett beslut).
//   • Dubblett = annonsnamnet finns redan i kontot (hela kontot, inte bara
//     butikens) ⇒ finns_i_meta: true, laddas inte upp igen.
//
// Kräver env NOTION_TOKEN + META_ACCESS_TOKEN. Noll npm-beroenden.

import { mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NOTION_API = 'https://api.notion.com/v1';
const TYP_RE = /pending approval/i;          // inkludering, aldrig uteslutning
export const STANDARD_STATUS = { SE: 'To be Reviewed', NO: 'SE-ACTIVE to be translated' };
// Redigerarna lämnar färdiga videor i "Creative strat review" (CS ska bedöma).
// Sedan 2026-09-13 är CS = leveransrundan själv (Axels beslut: ingen människa
// ska granska eller flytta status), så en sådan rad räknas som levererad OM
// den bär butikens eget prefix OCH har en fil. Bäverbutikens gamla källrader i
// samma status rörs ALDRIG — TackleBay 2026-09-12: Jasper parkerade tio
// källvideor där, och Axels nej till brand-swap står. Gäller bara SE-kön
// utan uttryckligt --status.
export const CS_STATUS_SE = 'Creative strat review';

/** Bär namnet butikens BRAND som prefix ("DryTrek_Damasker_PD_1" för DryTrek)?
 *  Registrets prefixfilter är bredare med flit (ärvd historik: "damasker" räknas
 *  som DryTreks i kontot), så för CS-raderna räcker det inte — Bäverbutikens
 *  "Damasker_PD_10_H1" i samma hub är en parkerad källrad, inte en leverans. */
export function harBrandPrefix(namn, brand) {
  const b = String(brand ?? '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (!b) return true;   // okänt brand: ingen extra spärr
  return String(namn ?? '').replace(/[^a-z0-9]/gi, '').toLowerCase().startsWith(b);
}

/** Ren regel: tas raden med i SE-kön? Standardstatusen alltid; CS-statusen
 *  bara med butikens brand som prefix, butikens prefix och en fil. Testas utan nät. */
export function tasMedISE(rad, { kostatus = STANDARD_STATUS.SE, brand = null } = {}) {
  if (statusLika(rad.status, kostatus)) return true;
  if (!statusLika(rad.status, CS_STATUS_SE)) return false;
  return !rad.prefix_avviker && rad.leverans !== 'saknas' && harBrandPrefix(rad.namn, brand);
}

// ------------------------------------------------------------ ren logik
// Allt nedan är utan nät och testas i tools/test/ops-leveranskon.test.mjs.

/** Annonsdelen av en Notion-titel: "HeimGuard_SP_2_1 – COPY ONLY …" → "HeimGuard_SP_2_1". */
export const annonsdel = (t) => String(t ?? '').split(/\s+[–—-]\s+/)[0].trim();

/** Skiftlägesokänslig statusjämförelse, med trimning. */
export const statusLika = (a, b) => String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();

/** Notion-Typ → 'video' | 'bild'. */
export const typAv = (typ) => (/video/i.test(String(typ ?? '')) ? 'video' : 'bild');

/**
 * Fälten i ett annonsnamn: <prefix>_<KONCEPT>_<nummer>[_<variant>].
 *   HeimGuard_SP_2_1     → { prefix: 'HeimGuard', koncept: 'SP', nummer: 2, variant: '1' }
 *   TackleBayRod_PD_1_H1 → { prefix: 'TackleBayRod', koncept: 'PD', nummer: 1, variant: 'H1' }
 *   HeimGuard_G_2        → { …, koncept: 'G', nummer: 2, variant: null }
 * Konceptet är BARA bokstäver, versaler. Ett namn utan koncept ger koncept: null
 * — då kan adsetnamnet inte bildas och raden rapporteras, aldrig gissas.
 */
export function tolkaNamn(namn) {
  const n = annonsdel(namn);
  const f = n.split('_');
  const prefix = f[0] && /^[A-Za-zÅÄÖåäö0-9-]+$/.test(f[0]) ? f[0] : null;
  const k = (f[1] ?? '').trim();
  const koncept = /^[A-Za-z]+$/.test(k) ? k.toUpperCase() : null;
  const nr = (f[2] ?? '').trim();
  const nummer = /^\d+$/.test(nr) ? Number(nr) : null;
  const rest = f.slice(3).join('_');
  return { prefix, koncept, nummer, variant: rest !== '' ? rest : null };
}

/** NO-målnamn: prefix + `_NO_` + resten. HeimGuard_SP_2_1 → HeimGuard_NO_SP_2_1.
 *  Ett namn som redan bär _NO_ lämnas orört; ett namn utan "_" ger null. */
export function noNamn(seNamn) {
  const n = annonsdel(seNamn);
  const i = n.indexOf('_');
  if (i <= 0) return null;
  const prefix = n.slice(0, i);
  const rest = n.slice(i + 1);
  if (/^NO_/i.test(rest)) return n;
  return `${prefix}_NO_${rest}`;
}

/** Målnamnet för marknaden: SE = namnet självt, NO = noNamn(). */
export const malNamn = (namn, marknad) => (String(marknad).toUpperCase() === 'NO' ? noNamn(namn) : annonsdel(namn));

/** Märker om ett namn till butikens annonsprefix. Hubbarna flyttades från
 *  Bäverbutiken 2026-09-10 och bär rader med det gamla prefixet
 *  (`Overvakningskamera_BOF_9_1`); i OPS-kontot måste annonsen heta
 *  `HeimGuard_BOF_9_1`, annars hittar budgetronden den aldrig
 *  (tillhorButiken). Utan "_" eller utan butiksprefix: namnet orört. */
export function ommarkt(namn, butiksPrefix) {
  const n = annonsdel(namn);
  const i = n.indexOf('_');
  const p = String(butiksPrefix ?? '').replace(/_$/, '');
  if (i <= 0 || !p) return n;
  return `${p}_${n.slice(i + 1)}`;
}

/** Kampanjbasen = kampanjnamnet före första " | ".
 *  "HEIMGUARD_SE_Övervakningskameran | BE-ROAS 2,11 | 2026-09-08" → "HEIMGUARD_SE_Övervakningskameran". */
export const kampanjBas = (kampanjnamn) => String(kampanjnamn ?? '').split(' | ')[0].trim();

/** Adsetnamn per OPS-konventionen (pipeline/waves/se-heimguard-image.config.mjs:38):
 *  "<kampanjbas> - <KONCEPT>". Utan koncept: null. */
export const adsetNamn = (bas, koncept) => (bas && koncept ? `${bas} - ${koncept}` : null);

/** Adsetet med exakt namnet (skiftlägesokänsligt), annars null. */
export function hittaAdset(adsets, namn) {
  if (!namn) return null;
  const t = adsets.find((a) => String(a?.name ?? '').trim().toLowerCase() === namn.trim().toLowerCase());
  return t ? { id: t.id, name: t.name, status: t.status ?? null } : null;
}

/**
 * Väljer EXAKT en ACTIVE kampanj för marknaden. Ren funktion.
 * @param kandidater  butikens kampanjer för marknaden: [{id, name, status, utfall?, spend?}]
 * @returns { kampanj: {id, namn, bas, status, utfall} | null, skal, kandidater }
 */
export function valjMalkampanj(kandidater, marknad = 'SE') {
  const m = String(marknad).toUpperCase();
  const lista = (kandidater ?? []).map((k) => ({
    id: String(k.id), namn: k.name ?? k.namn ?? '', status: k.status ?? null,
    utfall: k.utfall ?? (k.status === 'ACTIVE' ? 'ACTIVE' : (Number(k.spend) > 0 ? 'AVVECKLAD' : (k.status ? 'PAUSAD_TOM' : null))),
    spend: k.spend ?? null,
  }));
  const aktiva = lista.filter((k) => k.status === 'ACTIVE');
  if (aktiva.length === 1) {
    const k = aktiva[0];
    return { kampanj: { id: k.id, namn: k.namn, bas: kampanjBas(k.namn), status: k.status, utfall: 'ACTIVE' }, skal: null, kandidater: lista };
  }
  if (aktiva.length > 1) {
    return {
      kampanj: null,
      skal: `${aktiva.length} ACTIVE ${m}-kampanjer — gissar aldrig vilken: ${aktiva.map((k) => `${k.namn} (${k.id})`).join(' · ')}`,
      kandidater: lista,
    };
  }
  const avvecklade = lista.filter((k) => k.utfall === 'AVVECKLAD');
  const pausadeTomma = lista.filter((k) => k.utfall === 'PAUSAD_TOM');
  if (avvecklade.length && !pausadeTomma.length) {
    return {
      kampanj: null,
      skal: `ingen ACTIVE ${m}-kampanj — ${avvecklade.map((k) => `"${k.namn}" är PAUSED med ${Math.round(k.spend)} kr spend (avvecklad, ett beslut)`).join(' · ')}. Laddas inte upp.`,
      kandidater: lista,
    };
  }
  if (pausadeTomma.length) {
    return {
      kampanj: null,
      skal: `ingen ACTIVE ${m}-kampanj — ${pausadeTomma.map((k) => `"${k.namn}" är PAUSED utan spend`).join(' · ')}${avvecklade.length ? ` (+ ${avvecklade.length} avvecklad)` : ''}. VA:n slår på kampanjen först.`,
      kandidater: lista,
    };
  }
  return { kampanj: null, skal: `ingen ${m}-kampanj — /ny-annonser bygger den`, kandidater: lista };
}

/** Dubblettkarta över hela kontot: namn (gemener) → ad_id. */
export function dubblettKarta(annonser) {
  const k = new Map();
  for (const a of annonser ?? []) {
    const n = String(a?.name ?? '').trim().toLowerCase();
    if (n && !k.has(n)) k.set(n, String(a.id));
  }
  return k;
}

/** Finns annonsnamnet redan i kontot? → { finns_i_meta, ad_id }. */
export function dubblett(namn, karta) {
  const id = namn ? karta.get(String(namn).trim().toLowerCase()) : undefined;
  return { finns_i_meta: id !== undefined, ad_id: id ?? null };
}

/** Landningslänken ur en object_story_spec: link_data.link, annars video_data:s CTA-länk. */
export function lankUr(spec) {
  if (!spec) return null;
  return spec.link_data?.link
    ?? spec.video_data?.call_to_action?.value?.link
    ?? spec.link_data?.call_to_action?.value?.link
    ?? null;
}

/** Ärvd länk ur kampanjens annonser: senast skapade ACTIVE annonsen med länk,
 *  annars senast skapade med länk oavsett status. → { lank, fran } | null. */
export function arvdLank(annonser) {
  const medLank = (annonser ?? [])
    .map((a) => ({ id: a.id, name: a.name, status: a.status, created: String(a.created_time ?? ''), lank: lankUr(a.creative?.object_story_spec) }))
    .filter((a) => a.lank);
  if (!medLank.length) return null;
  const ordnade = [...medLank].sort((a, b) => b.created.localeCompare(a.created));
  const vald = ordnade.find((a) => a.status === 'ACTIVE') ?? ordnade[0];
  return { lank: vald.lank, fran: vald.name, status: vald.status };
}

/** Produkt-handle ur en butiks-URL: /products/<handle>[?…][#…][/…]. */
export function handleUr(url) {
  try {
    const p = new URL(String(url)).pathname;
    const m = p.match(/\/products\/([^/?#]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  } catch { return null; }
}

/** URL:en till Shopifys produkt-JSON, med språkprefix bevarat:
 *  https://heimguard.se/nb/products/x?variant=1 → https://heimguard.se/nb/products/x.json */
export function produktJsonUrl(url) {
  try {
    const u = new URL(String(url));
    const m = u.pathname.match(/^(.*?)\/products\/([^/?#]+)/);
    if (!m) return null;
    return `${u.origin}${m[1]}/products/${m[2]}.json`;
  } catch { return null; }
}

/** Pris ur ett products/<handle>.json-svar: variants[0].price + min/max över varianterna. */
export function prisUr(svar, valuta = null) {
  const p = svar?.product ?? svar;
  const varianter = Array.isArray(p?.variants) ? p.variants : [];
  const tal = varianter.map((v) => Number(v?.price)).filter(Number.isFinite);
  if (!tal.length) return null;
  const forsta = Number(varianter[0]?.price);
  return {
    pris: Number.isFinite(forsta) ? forsta : tal[0],
    min: Math.min(...tal),
    max: Math.max(...tal),
    jamforpris: Number.isFinite(Number(varianter[0]?.compare_at_price)) && varianter[0]?.compare_at_price != null ? Number(varianter[0].compare_at_price) : null,
    valuta,
    titel: p?.title ?? null,
    handle: p?.handle ?? null,
  };
}

/** Bär annonsnamnet butikens prefix? Mätt 2026-09-11 i HeimGuards hub: raderna
 *  heter Overvakningskamera_BOF_9_1 (Bäverbutikens gamla prefix), inte
 *  HeimGuard_…. Kontot kräver butikens prefix för att budgetronden ska hitta
 *  annonsen — uppladdaren måste därför märka om, och det ska synas här. */
export function prefixAvviker(namn, butiksPrefix, tillhor) {
  if (!namn || !butiksPrefix?.length) return false;
  return !tillhor(namn, butiksPrefix);
}

/** Kort text om var filen ligger — för tabellen. Aldrig en URL. */
export function leveransText(rad) {
  switch (rad.leverans) {
    case 'notion-fil': return `bilaga: ${(rad.filer ?? []).map((f) => f.namn || '(namnlös)').join(', ')}`;
    case 'sid-media':  return `mediablock: ${(rad.media ?? []).map((m) => m.namn || m.typ).join(', ')}`;
    case 'drive-lank': return `Drive: ${(rad.drive ?? []).map((d) => `${d.typ} ${d.id}`).join(', ')}`;
    default:           return 'SAKNAS — väntar på fil';
  }
}

// ------------------------------------------------------------ nät

async function notion(sokvag) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN saknas i miljön.');
  const res = await fetch(`${NOTION_API}/${sokvag}`, {
    headers: { authorization: `Bearer ${token}`, 'notion-version': '2022-06-28' },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 404) throw new Error(`Notion 404 på ${sokvag} — integrationen är inte inbjuden till hubben (••• → Connections).`);
    throw new Error(`Notion ${res.status}: ${json.message || res.statusText}`);
  }
  return json;
}

/** Hub-objektet i samma form som notion-kalla.hittaHubbar bygger: { id, titel, url }. */
async function hamtaHub(databaseId) {
  const d = await notion(`databases/${String(databaseId).replace(/-/g, '')}`);
  const titel = (d.title ?? []).map((t) => t.plain_text ?? '').join('') || '(namnlös)';
  return { id: d.id, titel, url: d.url ?? null, kalla: 'register.json' };
}

/** Pris ur butiken. Timeout 10 s. Lösenordsskyddad sida ⇒ null med skäl. */
async function hamtaPris(lank, valuta) {
  const url = produktJsonUrl(lank);
  if (!url) return { pris_butik: null, skal: `länken "${lank}" pekar inte på /products/<handle>` };
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), 10000);
  try {
    const res = await fetch(url, { redirect: 'manual', signal: ac.signal, headers: { 'user-agent': 'Mozilla/5.0 (ops-leveranskon)' } });
    if (res.status >= 300 && res.status < 400) {
      const dit = res.headers.get('location') || '';
      if (/\/password/.test(dit)) return { pris_butik: null, skal: `butiken är lösenordsskyddad (${url} → ${dit})` };
      return { pris_butik: null, skal: `${url} omdirigerar till ${dit || '(okänt)'}` };
    }
    if (!res.ok) return { pris_butik: null, skal: `${url} → HTTP ${res.status}` };
    const ct = res.headers.get('content-type') || '';
    if (!/json/i.test(ct)) return { pris_butik: null, skal: `${url} gav ${ct || 'okänd typ'}, inte JSON — troligen lösenordsskyddad` };
    const p = prisUr(await res.json(), valuta);
    if (!p) return { pris_butik: null, skal: `${url} har inga varianter med pris` };
    return { pris_butik: { ...p, kalla: url }, skal: null };
  } catch (e) {
    return { pris_butik: null, skal: e.name === 'AbortError' ? `${url} svarade inte inom 10 s` : `${url}: ${e.message}` };
  } finally {
    clearTimeout(t);
  }
}

/** Hämtar radens fil via tools/notion-fil.mjs (signerad URL hämtas i det anropet). */
function hamtaFil(pageId, mapp) {
  if (!existsSync(mapp)) mkdirSync(mapp, { recursive: true });
  const r = spawnSync(process.execPath, [join(ROT, 'tools', 'notion-fil.mjs'), String(pageId).replace(/-/g, ''), '--ut', mapp], {
    encoding: 'utf8', env: process.env, timeout: 10 * 60 * 1000,
  });
  const rader = String(r.stdout ?? '').trim().split('\n').filter(Boolean);
  if (r.status !== 0) return { fil: null, fil_alla: [], fel: String(r.stderr ?? '').trim() || `notion-fil.mjs avslutade med ${r.status}` };
  return { fil: rader[0] ?? null, fil_alla: rader, fel: null };
}

// ------------------------------------------------------------ huvudflödet

export async function byggKo({ nyckel, marknad = 'SE', status = null, ut = null, logg = (...a) => console.error(...a) }) {
  const m = String(marknad).toUpperCase();
  if (!['SE', 'NO'].includes(m)) throw new Error(`--marknad måste vara SE eller NO (fick "${marknad}").`);
  const kostatus = status ?? STANDARD_STATUS[m];
  const csExtra = status === null && m === 'SE';   // bara standardkön för SE tar CS-raderna
  const varningar = [];

  // 1. Butiken ur registret + kontospärren. laddaButik godtar läge test
  //    (Bäverbutiken) — det gör inte det här verktyget.
  const { laddaButik, sakerstallKonto, OPS_ANNONSKONTO } = await import('../factory/register.mjs');
  const butik = laddaButik(nyckel);
  const konto = sakerstallKonto(butik.post);
  if (konto !== OPS_ANNONSKONTO) {
    throw new Error(`STOPP: ${butik.post.nyckel} pekar på konto ${konto}, inte OPS-kontot ${OPS_ANNONSKONTO}. Bäverbutikens rader går via tools/leveranskon.mjs.`);
  }
  if (!butik.prefix) throw new Error(`${butik.post.nyckel}: ${butik.prefixfel}`);
  const hubId = butik.post.notion?.database_id;
  if (!hubId) {
    throw new Error(`${butik.post.nyckel}: hubben är inte inskriven — \`node factory/register.mjs notion ${butik.post.nyckel} <id>\``);
  }
  logg(`Butik: ${butik.post.brand} (${butik.post.nyckel}) · konto ${konto} · prefix ${butik.prefix.join(' · ')} · marknad ${m} · status "${kostatus}"`);

  // 2. Hubben + raderna.
  const hub = await hamtaHub(hubId);
  logg(`OPS-hubb: ${hub.titel} (${hub.id})`);
  const { klaraRader } = await import('./notion-kalla.mjs');
  const statusar = [kostatus.trim().toLowerCase(), ...(csExtra ? [CS_STATUS_SE.toLowerCase()] : [])];
  const raa = await klaraRader(hub, { statusar, typ: TYP_RE });
  logg(`  ${raa.length} rader i "${kostatus}"${csExtra ? ` + "${CS_STATUS_SE}"` : ''} (Typ ~ pending approval)`);

  // 3. Kontot: alla annonser (dubblettkoll + kampanjkoppling) och alla kampanjer.
  const { alla, kampanjUtfall } = await import('./meta-lib.mjs');
  const { valjKampanjer } = await import('../factory/budgetrond.mjs');
  const { filtreraPaMarknad } = await import('../factory/skalning.mjs');
  const { tillhorButiken } = await import('../factory/register.mjs');
  logg(`Läser kontot ${konto} …`);
  const annonser = await alla(`act_${konto}/ads`, { fields: 'id,name,status,effective_status,created_time,campaign{id,name,status},adset{id,name,status}' });
  const kampanjer = await alla(`act_${konto}/campaigns`, { fields: 'id,name,status,effective_status,daily_budget' });
  logg(`  ${annonser.length} annonser · ${kampanjer.length} kampanjer i kontot`);
  const karta = dubblettKarta(annonser);

  const butikens = annonser
    .filter((a) => tillhorButiken(a.name, butik.prefix) || tillhorButiken(a.campaign?.name, butik.prefix))
    .map((a) => ({ campaign_id: a.campaign?.id, ad_name: a.name, campaign_name: a.campaign?.name }));
  const val = valjKampanjer(kampanjer, butik.prefix, butikens);
  const perMarknad = filtreraPaMarknad(val.butikens.map((k) => ({ ...k, campaign_name: k.name })), m);
  const kandidater = [];
  for (const k of perMarknad.behall) {
    if (k.status === 'ACTIVE') { kandidater.push({ ...k, utfall: 'ACTIVE', spend: null }); continue; }
    const u = await kampanjUtfall(k.id);
    kandidater.push({ ...k, utfall: u.utfall, spend: u.spend ?? null });
  }
  const { kampanj, skal: kampanjSkal } = valjMalkampanj(kandidater, m);
  if (kampanj) logg(`Kampanj (${m}): ${kampanj.namn} [${kampanj.status}] · bas "${kampanj.bas}"`);
  else { logg(`Kampanj (${m}): INGEN — ${kampanjSkal}`); varningar.push(`kampanj: ${kampanjSkal}`); }
  for (const k of kandidater.filter((x) => x.utfall === 'AVVECKLAD')) {
    if (!kampanj || k.id !== kampanj.id) varningar.push(`"${k.name}" är PAUSED med ${Math.round(k.spend)} kr spend — avvecklad, aldrig mål`);
  }

  // 4. Adsets + ärvd länk ur kampanjens egna annonser.
  let adsets = [];
  let lank_arvd = null;
  if (kampanj) {
    adsets = await alla(`${kampanj.id}/adsets`, { fields: 'id,name,status' }, 50);
    const kampanjAnnonser = await alla(`${kampanj.id}/ads`, { fields: 'id,name,status,created_time,creative{object_story_spec}' }, 50);
    const arv = arvdLank(kampanjAnnonser);
    if (arv) { lank_arvd = arv.lank; logg(`Ärvd länk: ${arv.lank} (ur ${arv.fran}, ${arv.status})`); }
    else varningar.push('ingen landningslänk gick att ärva ur kampanjens annonser');
  }

  // 5. Pris ur butiken — en gång per unik länk.
  const prisCache = new Map();
  const prisFor = async (lank) => {
    if (!lank) return { pris_butik: null, skal: 'ingen länk' };
    if (!prisCache.has(lank)) prisCache.set(lank, await hamtaPris(lank, butik.post.valuta ?? 'SEK'));
    return prisCache.get(lank);
  };
  const forstaLandning = raa.map((r) => r.landning).find(Boolean) ?? null;
  const huvudpris = await prisFor(lank_arvd ?? forstaLandning);
  if (!huvudpris.pris_butik) varningar.push(`pris: ${huvudpris.skal}`);
  else logg(`Pris ur butiken: ${huvudpris.pris_butik.pris} ${huvudpris.pris_butik.valuta} (${huvudpris.pris_butik.min}–${huvudpris.pris_butik.max}) via ${huvudpris.pris_butik.kalla}`);

  // 6. Raderna.
  const rader = [];
  const cs_lamnade = [];   // CS-rader som INTE tas: annat prefix eller ingen fil
  for (const r of raa) {
    const namn = annonsdel(r.namn);
    const t = tolkaNamn(namn);
    // Bär raden ett annat prefix än butikens (flyttad Bäverbutiks-hubb) blir
    // målnamnet ommärkt till butikens annonsprefix — det är namnet i kontot.
    const avviker = prefixAvviker(namn, butik.prefix, tillhorButiken);
    if (!tasMedISE({ namn, status: r.status, prefix_avviker: avviker, leverans: r.leverans }, { kostatus, brand: butik.post.brand })) {
      const skal = avviker || !harBrandPrefix(namn, butik.post.brand)
        ? `prefixet "${t.prefix}" är inte butikens brand (${butik.post.brand}) — parkerad källrad, rörs inte`
        : 'ingen fil än';
      cs_lamnade.push({ namn, page_id: r.id, status: r.status, skal });
      continue;
    }
    const basnamn = avviker && butik.post.annonsprefix ? ommarkt(namn, butik.post.annonsprefix) : namn;
    const mal_namn = malNamn(basnamn, m);
    const adsetnamn = kampanj ? adsetNamn(kampanj.bas, t.koncept) : null;
    const d = dubblett(mal_namn, karta);
    const lank = lank_arvd ?? r.landning ?? null;
    const rad = {
      namn, mal_namn, page_id: r.id, url: r.url, typ: typAv(r.typ), typ_notion: r.typ, status: r.status,
      fran_cs: statusLika(r.status, CS_STATUS_SE),
      leverans: r.leverans, leverans_text: leveransText(r),
      // Signerade Notion-URL:er skrivs aldrig ut — bara namnen.
      filer: (r.filer ?? []).map((f) => ({ namn: f.namn })),
      media: (r.media ?? []).map((x) => ({ typ: x.typ, namn: x.namn })),
      drive: (r.drive ?? []).map((x) => ({ id: x.id, typ: x.typ, url: x.url })),
      landning: r.landning ?? null, lank,
      prefix: t.prefix, koncept: t.koncept, nummer: t.nummer, variant: t.variant,
      adset_namn: adsetnamn, adset: hittaAdset(adsets, adsetnamn),
      finns_i_meta: d.finns_i_meta, ad_id: d.ad_id,
      prefix_avviker: avviker,
      namn_ommarkt: basnamn !== namn,
      se_ad_id: m === 'NO' ? (dubblett(basnamn, karta).ad_id ?? dubblett(namn, karta).ad_id) : null,
      skapad: r.skapad, hub: hub.titel, fil: null, fil_alla: [], fil_fel: null,
    };
    if (rad.prefix_avviker) varningar.push(`${namn}: prefixet "${t.prefix}" är inte butikens (${butik.prefix.join(' / ')}) — målnamnet är ommärkt till "${mal_namn}"; kontrollera att creativen inte bär Bäverbutikens brand eller pris`);
    if (!t.koncept) varningar.push(`${namn}: inget koncept i namnet — adsetnamn kan inte bildas`);
    if (!mal_namn) varningar.push(`${namn}: inget "_" i namnet — målnamn kan inte bildas`);
    if (r.leverans === 'saknas') varningar.push(`${namn}: väntar på fil (varken bilaga, mediablock eller Drive-länk)`);
    if (!lank) varningar.push(`${namn}: ingen landningslänk (varken ärvd ur kampanjen eller Landing page på raden)`);
    if (m === 'NO' && !rad.se_ad_id) varningar.push(`${namn}: SE-annonsen finns inte i kontot — inte launchad i Sverige`);
    if (r.landning && lank_arvd && r.landning !== lank_arvd) rad.landning_avviker = true;
    if (ut && r.leverans !== 'saknas' && !d.finns_i_meta) {
      const h = hamtaFil(r.id, join(ut, namn.replace(/[^\w åäöÅÄÖ.-]/g, '_')));
      Object.assign(rad, h.fel ? { fil_fel: h.fel } : { fil: h.fil, fil_alla: h.fil_alla });
      if (h.fel) varningar.push(`${namn}: filen gick inte att hämta — ${h.fel}`);
      else logg(`  hämtad: ${h.fil}`);
    }
    rader.push(rad);
  }
  if (cs_lamnade.length) logg(`  ${cs_lamnade.length} rad(er) lämnade i "${CS_STATUS_SE}": ${cs_lamnade.map((x) => `${x.namn} (${x.skal})`).join(' · ')}`);

  return {
    butik: butik.post.brand, nyckel: butik.post.nyckel, konto, marknad: m, status: kostatus,
    cs_status: csExtra ? CS_STATUS_SE : null, cs_lamnade,
    hub: { id: hub.id, titel: hub.titel },
    kampanj: kampanj ? { ...kampanj, adsets: adsets.map((a) => ({ id: a.id, name: a.name, status: a.status })) } : null,
    kampanj_skal: kampanjSkal,
    kampanjer_bort: val.slangda.length,
    lank_arvd, pris_butik: huvudpris.pris_butik, pris_skal: huvudpris.skal,
    rader, varningar, hamtad: new Date().toISOString(),
  };
}

// ------------------------------------------------------------ utskrift

export function tabell(ko) {
  const ut = [];
  ut.push(`=== OPS-leveranskön · ${ko.butik} (${ko.nyckel}) · ${ko.marknad} · "${ko.status}" ===`);
  ut.push(`OPS-hubb: ${ko.hub.titel} (${ko.hub.id})`);
  ut.push(`Konto: ${ko.konto}`);
  if (ko.kampanj) ut.push(`Kampanj: ${ko.kampanj.namn} [${ko.kampanj.status}] (${ko.kampanj.id}) · bas "${ko.kampanj.bas}" · ${ko.kampanj.adsets.length} adsets`);
  else ut.push(`Kampanj: ⚠️  INGEN — ${ko.kampanj_skal}`);
  ut.push(`Ärvd länk: ${ko.lank_arvd ?? '⚠️  ingen'}`);
  ut.push(`Pris ur butiken: ${ko.pris_butik ? `${ko.pris_butik.pris} ${ko.pris_butik.valuta}${ko.pris_butik.min !== ko.pris_butik.max ? ` (${ko.pris_butik.min}–${ko.pris_butik.max})` : ''}${ko.pris_butik.jamforpris ? ` · jämförpris ${ko.pris_butik.jamforpris}` : ''}` : `⚠️  okänt — ${ko.pris_skal}`}`);
  ut.push('');
  if (!ko.rader.length) ut.push(`Inga rader i "${ko.status}".`);
  for (const r of ko.rader) {
    const pil = r.mal_namn && r.mal_namn !== r.namn ? ` → ${r.mal_namn}` : '';
    const dubb = r.finns_i_meta ? `  ✓ FINNS REDAN i kontot (${r.ad_id}) — laddas inte upp` : '';
    ut.push(`• ${r.namn}${pil}  [${r.typ}]${dubb}${r.prefix_avviker ? '  ⚠️ PREFIX ≠ BUTIKENS' : ''}${r.fran_cs ? `  (ur "${CS_STATUS_SE}")` : ''}`);
    ut.push(`    fil:      ${r.leverans_text}${r.fil ? `  → ${r.fil}` : ''}${r.fil_fel ? `  ✗ ${r.fil_fel}` : ''}`);
    ut.push(`    koncept:  ${r.koncept ?? '⚠️  saknas'}${r.nummer != null ? ` · nr ${r.nummer}` : ''}${r.variant ? ` · variant ${r.variant}` : ''}`);
    ut.push(`    adset:    ${r.adset_namn ?? '—'}  ${r.adset ? `finns (${r.adset.id}, ${r.adset.status})` : (r.adset_namn ? 'saknas — skapas av uppladdaren' : '')}`);
    ut.push(`    länk:     ${r.lank ?? '⚠️  ingen'}${r.landning ? `  (raden: ${r.landning}${r.landning_avviker ? ' ⚠️ avviker från ärvd' : ''})` : ''}`);
    if (ko.marknad === 'NO') ut.push(`    SE-annons: ${r.se_ad_id ?? '⚠️  finns inte i kontot'}`);
    ut.push(`    notion:   ${r.url}`);
  }
  ut.push('');
  const nya = ko.rader.filter((r) => !r.finns_i_meta);
  ut.push(`${ko.rader.length} rad(er) i kön · ${nya.length} att ladda upp · ${ko.rader.length - nya.length} finns redan`);
  if (ko.cs_lamnade?.length) {
    ut.push(`\nLämnade i "${CS_STATUS_SE}" (${ko.cs_lamnade.length}) — rörs inte:`);
    for (const x of ko.cs_lamnade) ut.push(`  · ${x.namn}: ${x.skal}`);
  }
  if (ko.varningar.length) {
    ut.push(`\nVarningar (${ko.varningar.length}):`);
    for (const v of ko.varningar) ut.push(`  ⚠️  ${v}`);
  }
  return ut.join('\n');
}

// ------------------------------------------------------------ CLI

async function huvud() {
  const { säkerställProxy } = await import('./meta-lib.mjs');
  säkerställProxy();
  const args = process.argv.slice(2);
  const flagga = (n, s = null) => { const i = args.indexOf(`--${n}`); return i !== -1 && args[i + 1] !== undefined && !args[i + 1].startsWith('--') ? args[i + 1] : s; };
  const finns = (n) => args.includes(`--${n}`);
  const flaggvarden = new Set(['marknad', 'status', 'ut'].map((n) => flagga(n)).filter(Boolean));
  const nyckel = args.find((a) => !a.startsWith('--') && !flaggvarden.has(a));
  const do_ = (m) => { console.error(`✗ ${m}`); process.exit(1); };

  if (!nyckel) do_('Ange <nyckel>. Exempel: node tools/ops-leveranskon.mjs hemvakten --marknad SE');
  if (!process.env.NOTION_TOKEN) do_('NOTION_TOKEN saknas i miljön — hubben går inte att läsa.');
  if (!process.env.META_ACCESS_TOKEN) do_('META_ACCESS_TOKEN saknas i miljön — kontot går inte att läsa.');

  const ko = await byggKo({ nyckel, marknad: flagga('marknad', 'SE'), status: flagga('status'), ut: flagga('ut') });
  if (finns('json')) console.log(JSON.stringify(ko, null, 2));
  else console.log(tabell(ko));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
