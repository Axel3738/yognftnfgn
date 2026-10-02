// Spoks på alla språk: samma innehåll som spoks-paket.mjs bygger på svenska,
// byggt på varje språk butiken säljer på, med ETT flöde per mejltyp där varje
// språk är ett eget sändsteg med ett landsfilter.
//
//   node klaviyo/spoks-sprak.mjs --brand matstrumpor --kalla    # skriver sprak/KALLA.json (det som ska översättas)
//   node klaviyo/spoks-sprak.mjs --brand matstrumpor --kolla    # alla språk: finns, aktuell, rätt form, inga påhittade tal
//   node klaviyo/spoks-sprak.mjs --brand matstrumpor [--offline] # bygger allt → klaviyo/output/<brand>/spoks/sprak/
//
// Axels beslut A 2026-09-29: "alla tolv språk nu, som CaraShell … fler marknader
// kommer – bygg det så att ett nytt land eller språk bara är en rad till i
// konfigen, inte en ombyggnad" och "vi kör ju hur många marknader som helst".
// Därför:
//   - ETT NYTT LAND = en rad i brandfilens spoks_sprak.lander. Ett land utan rad
//     får reservspråket (engelska) av sig självt, aldrig svenska.
//   - ETT NYTT SPRÅK = en rad i sparning/butiker.json → <butik>.mejl_sprak (samma
//     rad som fraktmejlen läser) + en översatt fil innehall/<brand>/sprak/<sprak>.json.
//     En rad med `"spoks": false` hoppas här (fraktmejl finns, Spoks-innehåll inte än).
//   - Flödena blir INTE fler när språken blir fler: F01 är ett flöde med ett
//     sändsteg per språk (landsfilter på steget), så Spoks lista förblir sex flöden.
//   - Ett flöde som är igång går inte att ändra i Spoks ("Cannot edit a step in an
//     active flow", mätt 2026-09-26). Ett nytt språk eller ett ändrat landsfilter
//     byggs därför som en NY version bredvid den som går (spoks_sprak.flodesversion
//     ⇒ "… · alla språk v2") och byts i appen: nytt på, gammalt av.
//   - Ett språk kan ha egna stopp (spoks_sprak.stopp.<sprak>: mönster + orsak),
//     t.ex. japanskans tal fyra. De gäller mejltexten, ui-raderna och citaten.
//
// Spoks vet bara kundens land (contact.country, engelskt landsnamn — mätt
// 2026-09-29 i Matstrumpors arbetsyta: "Sweden", "United States"), inte vilket
// språk kunden handlade på. Språket följer därför landet. Kontakter utan land
// (anmälda i sidfoten utan köp) får huvudspråket.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { ROT } from './mallar.mjs';
import { lasInnehall, planeraMejl } from './bygg.mjs';
import { hamtaProdukterCache } from './produkter.mjs';
import { hamtaRecensionerCache } from './recensioner.mjs';
import { mejlTillSpoks, flodeTillSpoks, segmentTillSpoks, filterTillSpoks, UI_SV } from './spoks-paket.mjs';

// ---------------------------------------------------------------------------
// Språken och länderna
// ---------------------------------------------------------------------------

const REGION_EN = new Intl.DisplayNames(['en'], { type: 'region' });

// Brandfilens spoks_sprak + butikens mejl_sprak (sparning/butiker.json) → en
// språklista. Kastar på allt som inte går ihop, så ett stavfel i konfigen
// stoppar bygget i stället för att skicka fel språk.
export function sprakKonfig(brand, rot = ROT, butiker = null) {
  const k = brand.spoks_sprak;
  if (!k) throw new Error(`Brandfilen ${brand.id} saknar spoks_sprak.`);
  const reg = butiker ?? JSON.parse(readFileSync(join(rot, 'sparning', 'butiker.json'), 'utf8'));
  const butik = reg[brand.id];
  if (!butik) throw new Error(`sparning/butiker.json saknar butiken "${brand.id}".`);
  const huvud = k.huvudsprak ?? butik.sprak ?? 'sv';
  const sprak = [{ sprak: huvud, locale: huvud, mapp: '' }];
  for (const r of butik.mejl_sprak ?? []) {
    if (!r?.sprak || r.sprak === huvud) continue;
    // `spoks: false` = språket har fraktmejl och spårningssida men inget Spoks-innehåll än (Taiwan
    // sedan 2026-09-30; Japan hade det till 2026-10-02). Kunderna där får reservspråket, som varje
    // land utan egen rad.
    if (r.spoks === false) continue;
    if (sprak.some((x) => x.sprak === r.sprak)) throw new Error(`mejl_sprak har ${r.sprak} två gånger.`);
    sprak.push({ sprak: r.sprak, locale: r.locale ?? r.sprak, mapp: r.mapp ?? r.sprak });
  }
  const finns = new Set(sprak.map((x) => x.sprak));
  const reserv = k.reserv ?? huvud;
  if (!finns.has(reserv)) throw new Error(`Reservspråket "${reserv}" finns inte i mejl_sprak.`);
  const lander = {};
  for (const [iso, s] of Object.entries(k.lander ?? {})) {
    if (!/^[A-Z]{2}$/.test(iso)) throw new Error(`"${iso}" är ingen ISO-landskod (två versaler).`);
    if (!finns.has(s)) throw new Error(`Landet ${iso} pekar på språket "${s}", som saknas i sparning/butiker.json → ${brand.id}.mejl_sprak.`);
    lander[iso] = s;
  }
  const landsnamn = (iso) => k.landsnamn?.[iso] ?? REGION_EN.of(iso);
  // Stopp per språk (mönster + orsak). Ett språk som inte finns i mejl_sprak är ett
  // stavfel ("jp" i stället för "ja") och hade annars inte stoppat något alls.
  const kandaSprak = new Set([huvud, ...(butik.mejl_sprak ?? []).map((r) => r?.sprak).filter(Boolean)]);
  const stopp = {};
  for (const [s, lista] of Object.entries(k.stopp ?? {})) {
    if (!kandaSprak.has(s)) throw new Error(`spoks_sprak.stopp har språket "${s}", som saknas i sparning/butiker.json → ${brand.id}.mejl_sprak.`);
    if (!Array.isArray(lista)) throw new Error(`spoks_sprak.stopp.${s} ska vara en lista.`);
    stopp[s] = lista.map((r) => {
      if (!r?.monster || !r?.orsak) throw new Error(`spoks_sprak.stopp.${s}: varje rad behöver "monster" och "orsak".`);
      return { re: new RegExp(r.monster, 'u'), orsak: r.orsak };
    });
  }
  // Flödesversionen (1 = de sex flödena från 2026-09-29). Högre version ⇒ " v<n>" i
  // flödesnamnet, så att den nya versionen syns bredvid den som är igång.
  const version = Number(k.flodesversion ?? 1);
  if (!Number.isInteger(version) || version < 1) throw new Error(`spoks_sprak.flodesversion ska vara ett heltal ≥ 1 (är ${JSON.stringify(k.flodesversion)}).`);
  return { huvud, reserv, sprak, lander, landsnamn, kampanjerBara: k.kampanjer_bara ?? {}, stoppFor: (s) => stopp[s] ?? [], version };
}

const bitar = (lista, n = 25) => {
  const ut = [];
  for (let i = 0; i < lista.length; i += n) ut.push(lista.slice(i, i + n));
  return ut;
};
const och = (...f) => (f.length === 1 ? f[0] : { type: 'conjunction', operator: 'and', isGrouped: true, filters: f });
const eller = (...f) => (f.length === 1 ? f[0] : { type: 'conjunction', operator: 'or', isGrouped: true, filters: f });

// Vilka kontakter som får språket s. Reservspråket tar allt som INTE är ett
// annat språks land (och har ett land), så ett nytt land aldrig blir svenskt.
// Spoks tar högst 25 värden per in/nin — längre listor delas.
export function sprakFilter(k, s) {
  const namnFor = (pred) => Object.entries(k.lander).filter(([, v]) => pred(v)).map(([iso]) => k.landsnamn(iso));
  if (s === k.reserv && s !== k.huvud) {
    const andra = namnFor((v) => v !== s);
    return och({ type: 'filter', field: 'country', operator: 'is' }, ...bitar(andra).map((c) => ({ type: 'filter', field: 'country', operator: 'nin', value: c })));
  }
  const noder = bitar(namnFor((v) => v === s)).map((c) => ({ type: 'filter', field: 'country', operator: 'in', value: c }));
  if (s === k.huvud) noder.push({ type: 'filter', field: 'country', operator: 'nis' });
  if (!noder.length) throw new Error(`Språket ${s} har inget land i spoks_sprak.lander och är inte reservspråket — ingen skulle få det.`);
  return eller(...noder);
}

// ---------------------------------------------------------------------------
// Texterna: det som ska översättas, och hur översättningen läggs tillbaka
// ---------------------------------------------------------------------------

// Fälten som kunden ser, per blocktyp. Allt annat (länkar, handles, typer)
// kommer ur det svenska innehållet, så en översättning kan aldrig ändra formen.
export const TEXTFALT = {
  hero: ['rubrik', 'text', 'knapp.text'],
  text: ['rubrik', 'text'],
  punkter: ['rubrik', 'punkter'],
  produkt: ['text', 'knapp'],
  produktrad: ['rubrik'],
  knapp: ['text'],
  medlemskort: ['etikett', 'rad_under_namnet', 'fotnot'],
  grundare: ['text'],
  stjarnor: ['rubrik'],
};

const hamta = (o, p) => p.split('.').reduce((a, n) => (a == null ? a : a[n]), o);
function satt(o, p, v) {
  const d = p.split('.');
  let a = o;
  for (const n of d.slice(0, -1)) a = a[n] ??= {};
  a[d[d.length - 1]] = v;
}

export function mejlText(mejl) {
  return {
    amne: mejl.amnesrader?.[0]?.text ?? null,
    forhandstext: mejl.forhandstext ?? null,
    block: (mejl.block ?? []).map((b) => {
      const o = {};
      for (const f of TEXTFALT[b.typ] ?? []) {
        const v = hamta(b, f);
        if (v !== undefined && v !== null) o[f] = v;
      }
      return o;
    }),
  };
}

export const hash = (v) => createHash('sha256').update(typeof v === 'string' ? v : JSON.stringify(v)).digest('hex').slice(0, 12);

// Talen i en text (48, 36-44, 8.11 …) — en översättning får tappa ett tal
// men aldrig hitta på ett som den svenska texten inte har. NFKC först, så att
// helbreddssiffror (５) räknas som siffror (2026-10-02, japanskan): annars hade
// ett påhittat tal kunnat skrivas förbi kontrollen.
const tal = (t) => String(t ?? '').normalize('NFKC').replace(/\{\{[^}]*\}\}/g, '').match(/\d+/g) ?? [];

// Svenska räkneord i KÄLLAN räknas som tal (2026-10-02): "Fem par" får bli "5足"
// på ett språk som skriver antal med siffror, men "6足" stoppar fortfarande, och
// ett tal som inte står i svenskan, varken som siffra eller som ord, stoppar som
// förut. "en"/"ett" räknas inte: de är oftast artiklar, och då hade en etta gått
// igenom nästan överallt.
const RAKNEORD = { två: 2, tre: 3, fyra: 4, fem: 5, sex: 6, sju: 7, åtta: 8, nio: 9, tio: 10, elva: 11, tolv: 12 };
const RAKNEORD_RE = new RegExp(`(?<!\\p{L})(${Object.keys(RAKNEORD).join('|')})(?!\\p{L})`, 'giu');
export const talIKallan = (t) => [...tal(t), ...[...String(t ?? '').matchAll(RAKNEORD_RE)].map((m) => String(RAKNEORD[m[1].toLowerCase()]))];

// Tankstreck i alla skrifter: — och –, och de streck japansk typografi använder
// (― ─ ━), plus ‒ ⸺ ⸻ ﹘ och helbreddsstrecket －. Katakanans långa vokaltecken
// ー (U+30FC, "ハンバーガー") är inget streck och stoppar inte.
const TANKSTRECK = /[—–―─━‒⸺⸻﹘－]/u;

// Kontrollerna för EN översatt text mot sin svenska källa: tom, tankstreck,
// påhittat tal, okänd token och språkets egna stopp. Samma regler för mejlens
// fält, ui-raderna och citaten.
export function textFel(falt, sv, ov, stopp = []) {
  if (ov === null) return [];
  if (typeof ov !== 'string' || !ov.trim()) return [`${falt}: tom översättning.`];
  const fel = [];
  if (TANKSTRECK.test(ov)) fel.push(`${falt}: tankstreck ("${ov.slice(0, 50)}") — skriv om med komma eller punkt.`);
  const kalla = talIKallan(sv);
  const extra = tal(ov).filter((n) => !kalla.includes(n));
  if (extra.length) fel.push(`${falt}: talet ${extra.join(', ')} finns inte i den svenska texten — hitta aldrig på ett tal.`);
  const tokens = String(ov).match(/\{\{[^}]*\}\}/g) ?? [];
  if (tokens.some((x) => x !== '{{fornamn}}')) fel.push(`${falt}: okänd token ${tokens.join(' ')} — bara {{fornamn}} är tillåten.`);
  for (const r of stopp) {
    const m = String(ov).match(r.re);
    if (m) fel.push(`${falt}: "${m[0]}" — ${r.orsak}`);
  }
  return fel;
}

// ui-raderna och citaten står i varje mejl (knappar, faktarutan, medlemskortet,
// citatens signatur) och går därför genom samma kontroller som mejltexten.
// svUi = kallaUi(brand), svCitat = hash → svensk recension.
export function uiOchCitatFel(ov, svUi, svCitat, s, stopp = []) {
  const fel = [];
  for (const [n, sv] of Object.entries(svUi)) {
    const v = ov?.ui?.[n];
    if (v == null) continue; // saknade krav-nycklar rapporteras av UI_KRAV
    fel.push(...textFel(`ui.${n}`, sv, v, stopp));
  }
  if (ov?.ui?.medlem_i != null && !String(ov.ui.medlem_i).includes('{klubb}')) fel.push('ui.medlem_i: {klubb} saknas — klubbens namn ska stå där.');
  for (const [h, sv] of Object.entries(svCitat ?? {})) {
    const v = ov?.citat?.[h];
    if (v == null) continue;
    fel.push(...textFel(`citat ${h}`, sv, v, stopp));
  }
  return fel.map((f) => `${s}: ${f}`);
}

// Den svenska texten + översättningen → ett mejl på språket. Fel samlas, aldrig
// tyst: saknad nyckel, gammal källa, påhittat tal, tankstreck, okänd token,
// språkets egna stopp.
export function oversattMejl(mejl, t, s, { stopp = [] } = {}) {
  const fel = [];
  const kalla = mejlText(mejl);
  if (!t) return { fel: [`${mejl.id}: saknar översättning på ${s}.`] };
  if (t.kalla !== hash(kalla)) fel.push(`${mejl.id}: den svenska texten har ändrats sedan ${s} översattes (kalla ${t.kalla} ≠ ${hash(kalla)}) — översätt om.`);
  const ny = structuredClone(mejl);
  const kontrollera = (falt, sv, ov) => {
    fel.push(...textFel(`${mejl.id} ${falt}`, sv, ov, stopp));
  };
  for (const f of ['amne', 'forhandstext']) {
    if (kalla[f] == null) continue;
    if (!(f in t)) { fel.push(`${mejl.id}: ${f} saknas på ${s}.`); continue; }
    kontrollera(f, kalla[f], t[f]);
  }
  if (t.amne) ny.amnesrader = [{ ...(ny.amnesrader?.[0] ?? {}), text: t.amne }];
  if ('forhandstext' in t) ny.forhandstext = t.forhandstext ?? '';
  if ((t.block ?? []).length !== kalla.block.length) fel.push(`${mejl.id}: ${t.block?.length ?? 0} block på ${s}, ${kalla.block.length} på svenska.`);
  kalla.block.forEach((kb, i) => {
    const tb = t.block?.[i] ?? {};
    for (const [f, sv] of Object.entries(kb)) {
      if (!(f in tb)) { fel.push(`${mejl.id} block ${i} ${f}: saknas på ${s}.`); continue; }
      const ov = tb[f];
      if (Array.isArray(sv)) {
        if (!Array.isArray(ov)) { fel.push(`${mejl.id} block ${i} ${f}: ska vara en lista.`); continue; }
        ov.forEach((x, j) => kontrollera(`block ${i} ${f}[${j}]`, sv.join(' '), x));
        satt(ny.block[i], f, ov.filter((x) => x !== null));
      } else {
        kontrollera(`block ${i} ${f}`, sv, ov);
        satt(ny.block[i], f, ov);
      }
    }
  });
  return { mejl: ny, fel };
}

// ---------------------------------------------------------------------------
// Filerna
// ---------------------------------------------------------------------------

export const sprakDir = (rot, brandId) => join(rot, 'klaviyo', 'innehall', brandId, 'sprak');

export function lasOversattning(rot, brandId, s) {
  const fil = join(sprakDir(rot, brandId), `${s}.json`);
  return existsSync(fil) ? JSON.parse(readFileSync(fil, 'utf8')) : null;
}

// Produkttitlarna på språket ur butikens egna översättningar
// (matstrumpor/marknader/output/underlag-<locale>.json, "produkt.<handle>.title").
export function produktTitlar(rot, locale) {
  const fil = join(rot, 'matstrumpor', 'marknader', 'output', `underlag-${locale}.json`);
  if (!existsSync(fil)) return {};
  const d = JSON.parse(readFileSync(fil, 'utf8'));
  const ut = {};
  for (const [k, v] of Object.entries(d)) {
    const m = /^produkt\.([^.]+)\.title$/.exec(k);
    if (m && typeof v === 'string') ut[m[1]] = v;
  }
  return ut;
}

// ui-raderna på svenska: de fasta orden motorn skriver in + brandets egna
// (returraden, klubbens namn). Det översättaren får i KALLA.ui, och det
// översättningens ui-rader kontrolleras mot.
export function kallaUi(brand = {}) {
  return {
    ...Object.fromEntries(Object.entries(UI_SV).filter(([, v]) => v !== null)),
    fakta_retur_text: brand.angerratt_text ?? null,
    oversatt: 'översatt från svenska',
    klubb: brand.klubb?.namn ?? brand.namn ?? null,
  };
}

// KALLA.json: allt som ska översättas, med kallhash per mejl — det översättaren
// får, och det --kolla jämför mot.
export function kalla({ innehall, recensioner, brand = {}, citatAntal = 4 }) {
  const mejl = {};
  for (const p of planeraMejl(innehall)) {
    const t = mejlText(p.mejl);
    mejl[p.mejl.id] = { kalla: hash(t), ...t };
  }
  const citat = {};
  for (const lista of Object.values(recensioner ?? {})) {
    for (const r of lista.slice(0, citatAntal)) if (r?.text) citat[hash(r.text)] = r.text;
  }
  return { ui: kallaUi(brand), citat, mejl };
}

// ---------------------------------------------------------------------------
// Bygget
// ---------------------------------------------------------------------------

const KORT = (id) => id.replace(/^k(\d\d)-.*$/, 'K$1');
const kortDatum = (iso, tidszon) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '?';
  const p = Object.fromEntries(new Intl.DateTimeFormat('sv-SE', { timeZone: tidszon, day: 'numeric', month: 'numeric' }).formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month}`;
};

const UI_KRAV = ['hej_reserv', 'du_reserv', 'medlem_reserv', 'medlemskort', 'medlem_i', 'knapp_till', 'knapp_kassa', 'knapp_titta', 'ms_rad', 'fakta_retur_rubrik', 'fakta_retur_text', 'fakta_sparning_rubrik', 'fakta_sparning_text', 'grundare', 'verifierad', 'verifierad_ensam', 'oversatt', 'klubb'];

export async function byggAllaSprak({ brandId = 'matstrumpor', rot = ROT, offline = false, produkter = null, recensioner = null, facit = null, butiker = null, bara = null, utDir = null, logg = () => {} } = {}) {
  const brand = JSON.parse(readFileSync(join(rot, 'klaviyo', 'brands', `${brandId}.json`), 'utf8'));
  const k = sprakKonfig(brand, rot, butiker);
  const fac = facit ?? JSON.parse(readFileSync(join(rot, 'klaviyo', 'konto', brandId, 'spoks.json'), 'utf8'));
  const innehall = lasInnehall(join(rot, 'klaviyo', 'innehall', brandId));
  const fel = [...innehall.fel];
  const varningar = [];
  let lista = produkter;
  if (!lista) ({ produkter: lista } = await hamtaProdukterCache({ brand, offline, rot }));
  let rec = recensioner;
  if (!rec) ({ recensioner: rec } = await hamtaRecensionerCache({ brand, produkter: lista, offline, rot }));
  const perHandle = new Map(lista.map((p) => [p.handle, p]));
  const plan = planeraMejl(innehall);
  const butikUrl = brand.butik_url.replace(/\/$/, '');
  const sparSida = (brand.sparningssida ?? `${butikUrl}/pages/spara`).replace(butikUrl, '');
  // Det svenska som ui-raderna och citaten kontrolleras mot.
  const svUi = kallaUi(brand);
  const svCitat = {};
  for (const l of Object.values(rec ?? {})) for (const r of l ?? []) if (r?.text) svCitat[hash(r.text)] = r.text;

  const sprakListan = bara ? k.sprak.filter((x) => bara.includes(x.sprak)) : k.sprak;
  const mejlPerSprak = new Map();
  for (const sp of sprakListan) {
    const s = sp.sprak;
    const huvud = s === k.huvud;
    const ov = huvud ? null : lasOversattning(rot, brandId, s);
    if (!huvud && !ov) { fel.push(`${s}: filen klaviyo/innehall/${brandId}/sprak/${s}.json saknas — översätt KALLA.json (sprak/README.md).`); continue; }
    const ui = huvud ? UI_SV : { ...UI_SV, ...(ov.ui ?? {}) };
    const stopp = k.stoppFor(s);
    if (!huvud) for (const n of UI_KRAV) if (ov.ui?.[n] == null) fel.push(`${s}: ui.${n} saknas.`);
    if (!huvud) fel.push(...uiOchCitatFel(ov, svUi, svCitat, s, stopp));
    const titlar = huvud ? null : produktTitlar(rot, sp.locale);
    const citat = huvud ? null : (ov.citat ?? {});
    const bas = huvud ? null : `${butikUrl}/${sp.mapp}`;
    const ctx = {
      brand, facit: fac, produkt: (h) => perHandle.get(h) ?? null, produktlista: lista, recensioner: rec, stil: null,
      ui, sprak: s,
      ...(huvud ? {} : {
        bas,
        sparningssida: `${bas}${sparSida}`,
        produktkort: 'bild',
        titel: (h) => titlar[h] ?? null,
        citatText: (r) => citat[hash(r.text)] ?? null,
      }),
    };
    const ut = new Map();
    for (const p of plan) {
      let m = p.mejl;
      if (!huvud) {
        const r = oversattMejl(m, ov.mejl?.[m.id], s, { stopp });
        fel.push(...r.fel.map((f) => `${s}: ${f}`));
        if (!r.mejl) continue;
        m = r.mejl;
      }
      const amne = m.amnesrader?.[0]?.text ?? m.id;
      let titel;
      if (p.kampanj) titel = `${KORT(p.kampanj.id)} ${s.toUpperCase()} · ${kortDatum(p.kampanj.planerad, brand.tidszon)} · samtycke_${s} · ${amne}`;
      else titel = `${p.flode.id.replace(/^(f\d\d)-.*$/, '$1').toUpperCase()} ${m.id.replace(/^.*-e(\d+)$/, 'E$1')} ${s.toUpperCase()} · ${amne}`;
      const r = mejlTillSpoks(m, ctx, { titel: titel.slice(0, 200) });
      fel.push(...r.fel.map((f) => `${s} ${m.id}: ${f}`));
      varningar.push(...r.varningar.map((v) => `${s} ${m.id}: ${v}`));
      ut.set(m.id, { id: m.id, sprak: s, ...r });
    }
    mejlPerSprak.set(s, ut);
    logg(`${s}: ${ut.size} mejl`);
  }

  // Flödena: ett per mejltyp, ett sändsteg per språk och mejl.
  const floden = [];
  const svMejl = mejlPerSprak.get(k.huvud) ?? new Map();
  for (const f of innehall.floden) {
    let bas;
    try { bas = flodeTillSpoks(f, { brand, facit: fac, produktlista: lista }, svMejl); } catch (e) { fel.push(`${f.id}: ${e.message}`); continue; }
    if (!bas.create) continue; // segment-triggat (F06) — blir kampanjer för hand
    const stegFilter = filterTillSpoks(f.filter ?? []).steg;
    const steg = [];
    let slot = 0;
    for (let i = 0; i < bas.steg.length; i += 2) {
      const vanta = bas.steg[i];
      const send = bas.steg[i + 1];
      slot += 1;
      sprakListan.forEach((sp, j) => {
        if (!mejlPerSprak.get(sp.sprak)?.has(send.mejl_id)) return;
        steg.push({ typ: 'delay', delay: j === 0 ? vanta.delay : 0 });
        steg.push({ typ: 'send', sprak: sp.sprak, mejl_id: send.mejl_id, nr: slot, filter: stegFilter ? och(sprakFilter(k, sp.sprak), stegFilter) : sprakFilter(k, sp.sprak) });
      });
    }
    const namn = `${bas.namn.split(' · ')[0]} · alla språk${k.version > 1 ? ` v${k.version}` : ''}`.slice(0, 120);
    floden.push({ id: f.id, namn, create: { ...bas.create, name: namn }, steg, anmarkningar: bas.anmarkningar });
  }

  // Kampanjerna: en per språk och kampanj (huvudspråkets finns redan i Spoks).
  const kampanjer = [];
  for (const kmp of innehall.kampanjer) {
    const tillatna = k.kampanjerBara[kmp.id];
    for (const sp of sprakListan) {
      if (sp.sprak === k.huvud) continue;
      if (tillatna && !tillatna.includes(sp.sprak)) continue;
      if (!mejlPerSprak.get(sp.sprak)?.has(kmp.id)) continue;
      kampanjer.push({ id: kmp.id, kort: KORT(kmp.id), sprak: sp.sprak, planerad: kmp.planerad ?? null, segment: `SEG_samtycke_${sp.sprak}`, status_plan: kmp.status_plan ?? null });
    }
  }
  // F06 Sunset (segment-trigger) — kampanjutkast för hand, per språk.
  for (const f of innehall.floden.filter((x) => x.trigger?.typ === 'segment')) {
    for (const st of f.steg.filter((x) => x.typ === 'mejl')) {
      for (const sp of sprakListan) {
        if (sp.sprak === k.huvud || !mejlPerSprak.get(sp.sprak)?.has(st.mejl.id)) continue;
        if (k.kampanjerBara[st.mejl.id] && !k.kampanjerBara[st.mejl.id].includes(sp.sprak)) continue;
        kampanjer.push({ id: st.mejl.id, kort: st.mejl.id.replace(/^(f\d\d)-.*-e(\d+)$/, (_, a, b) => `${a.toUpperCase()} E${b}`), sprak: sp.sprak, planerad: null, segment: `${f.trigger.segment} + SEG_samtycke_${sp.sprak}`, status_plan: 'för hand' });
      }
    }
  }

  // Segmenten: samtycke per språk, och huvudspråkets filter på de befintliga.
  const SAMTYCKE = { type: 'filter', field: 'emailMarketingConsent', operator: 'in', value: ['subscribed'] };
  const EJ_SPARRAD = { type: 'filter', field: 'state', operator: 'ne', value: 'suppressed' };
  const segment = k.sprak.map((sp) => ({
    namn: `SEG_samtycke_${sp.sprak}`,
    beskrivning: `Samtycke (subscribed), inte spärrad, och mejlspråket ${sp.sprak} (${sp.sprak === k.reserv ? 'alla länder utan eget språk' : Object.entries(k.lander).filter(([, v]) => v === sp.sprak).map(([iso]) => iso).join(', ')}${sp.sprak === k.huvud ? ', eller utan land' : ''}). Kampanjernas publik på ${sp.sprak}.`,
    filter: och(SAMTYCKE, EJ_SPARRAD, sprakFilter(k, sp.sprak)),
  }));
  const svSegment = segmentTillSpoks(brand).map((sg) => ({ namn: sg.namn, filter: och(...(sg.filter.type === 'conjunction' && sg.filter.operator === 'and' ? sg.filter.filters : [sg.filter]), sprakFilter(k, k.huvud)) }));

  const ut = utDir ?? join(rot, 'klaviyo', 'output', brandId, 'spoks', 'sprak');
  mkdirSync(ut, { recursive: true });
  for (const [s, m] of mejlPerSprak) {
    mkdirSync(join(ut, s), { recursive: true });
    for (const [id, r] of m) writeFileSync(join(ut, s, `${id}.json`), JSON.stringify(r.post, null, 2) + '\n');
  }
  const manifest = {
    brand: brand.id,
    arbetsyta: fac.arbetsyta,
    byggd: new Date().toISOString(),
    flodesversion: k.version,
    sprak: k.sprak.map((x) => ({ ...x, lander: x.sprak === k.reserv ? 'alla utan egen rad' : Object.entries(k.lander).filter(([, v]) => v === x.sprak).map(([iso]) => `${iso} ${k.landsnamn(iso)}`) })),
    floden,
    kampanjer,
    segment,
    segment_huvudsprak: svSegment,
    varningar: [...new Set(varningar)],
    fel,
  };
  writeFileSync(join(ut, 'PLAN.json'), JSON.stringify(manifest, null, 2) + '\n');
  // Uppdragen: exakt de MCP-anrop som bygger varje flöde, i ordning — det som
  // sessionen (eller en subagent per flöde) kör mot Spoks.
  mkdirSync(join(ut, 'uppdrag'), { recursive: true });
  for (const f of floden) {
    const steg = f.steg.map((x) => (x.typ === 'delay'
      ? { type: 'delay', parameters: { delay: x.delay } }
      : { type: 'publish_flow_post_to_contact', parameters: { filter: x.filter }, sprak: x.sprak, mejl_id: x.mejl_id, post_fil: join(ut, x.sprak, `${x.mejl_id}.json`) }));
    writeFileSync(join(ut, 'uppdrag', `${f.id}.json`), JSON.stringify({ storeId: fac.arbetsyta.id, flode: f.id, namn: f.namn, create: f.create, steg }, null, 2) + '\n');
  }
  // Kampanjutkasten per språk, med sin fil.
  writeFileSync(join(ut, 'uppdrag', 'kampanjer.json'), JSON.stringify({ storeId: fac.arbetsyta.id, kampanjer: kampanjer.map((x) => ({ ...x, post_fil: join(ut, x.sprak, `${x.id}.json`) })) }, null, 2) + '\n');
  return { manifest, mejl: mejlPerSprak, utDir: ut, konfig: k };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function arg(namn) {
  const i = process.argv.indexOf(namn);
  return i >= 0 ? process.argv[i + 1] : null;
}

async function main() {
  const brandId = arg('--brand') ?? 'matstrumpor';
  const offline = process.argv.includes('--offline');
  if (!offline) {
    const { kravProxy } = await import('../mejl/shopify.mjs');
    kravProxy();
  }
  const brand = JSON.parse(readFileSync(join(ROT, 'klaviyo', 'brands', `${brandId}.json`), 'utf8'));
  if (process.argv.includes('--kalla')) {
    const { produkter } = await hamtaProdukterCache({ brand, offline, rot: ROT });
    const { recensioner } = await hamtaRecensionerCache({ brand, produkter, offline, rot: ROT });
    const k = kalla({ innehall: lasInnehall(join(ROT, 'klaviyo', 'innehall', brandId)), recensioner, brand });
    mkdirSync(sprakDir(ROT, brandId), { recursive: true });
    const fil = join(sprakDir(ROT, brandId), 'KALLA.json');
    writeFileSync(fil, JSON.stringify(k, null, 2) + '\n');
    console.log(`${Object.keys(k.mejl).length} mejl, ${Object.keys(k.citat).length} citat → ${fil}`);
    return;
  }
  const bara = arg('--sprak')?.split(',') ?? null;
  const r = await byggAllaSprak({ brandId, offline, bara, logg: (t) => console.log(t) });
  const m = r.manifest;
  const sandsteg = m.floden.reduce((a, f) => a + f.steg.filter((x) => x.typ === 'send').length, 0);
  console.log(`\n${m.sprak.length} språk: ${m.sprak.map((x) => x.sprak).join(', ')}`);
  for (const x of m.sprak) console.log(`  ${x.sprak.padEnd(3)} ${Array.isArray(x.lander) ? x.lander.join(', ') : x.lander}`);
  console.log(`${m.floden.length} flöden (${sandsteg} sändsteg), ${m.kampanjer.length} kampanjutkast, ${m.segment.length} språksegment → ${r.utDir}`);
  if (m.varningar.length) console.log(`\n${m.varningar.length} varningar:\n${m.varningar.slice(0, 40).map((v) => `  ⚠️  ${v}`).join('\n')}`);
  if (m.fel.length) {
    console.error(`\n❌ ${m.fel.length} fel:\n${m.fel.slice(0, 80).map((f) => `  ${f}`).join('\n')}`);
    process.exit(1);
  }
  console.log('\n✅ Inga fel.');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}
