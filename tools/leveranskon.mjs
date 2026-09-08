#!/usr/bin/env node
// leveranskon.mjs — vad som är klart i Notion och ska upp i Meta.
// Kön för /notionkorning.
//
//   Vad som SKA laddas upp  = Notion-rader med status "To be Reviewed" och en fil
//                             i "Filer och media" — video OCH bild (Axels beslut
//                             2026-09-02: Notion är enda källan).
//   Vilken kampanj           = annonsprefixet slås upp mot butikens annonskonto.
//   Dubblettspärren mot annonsnamnen i kontot finns kvar som säkerhet, men den är
//   inte grinden: det som står i "To be Reviewed" har aldrig legat uppe.
//
//   node tools/leveranskon.mjs [--butik <id>] [--produkt <id>] [--json] [--alla] [--drive]
//
//   --butik  butiken i hubbregistret (commission/hubbar.json). Utan flaggan:
//            baverbutiken = MagiBorsten 1867947880635861, precis som förut.
//   --drive  läser dessutom redigerarnas gamla leveransmappar i Drive
//            (Edited Folder/Week N). Av som standard sedan 2026-09-02.
//
// ⚠️ Kontospärren är inte borttagen, bara parametriserad: kön läser ETT konto —
// butikens, hämtat ur hubbregistret. Rader ur en hub som registret säger hör
// till en annan butik, och rader vars prefix ägs av en annan butik, plockas
// bort och rapporteras. Det skyddet behövs för att OPS-butikerna säljer SAMMA
// produkter som Bäverbutiken och delar konto med Bäverbutikens danska annonser.
//
// Kräver env: META_ACCESS_TOKEN (prefix → kampanj) och NOTION_TOKEN (kön).

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { allaKlaraRader } from './notion-kalla.mjs';
import { laddaRegister, STANDARDBUTIK } from './hubbregister.mjs';

// Redigerarnas leveransrot. Innehåller "Week N"-mappar, en mapp per annons.
const EDITED_FOLDER = '1V4V8y4QQnX0tvZ3MQUicu1Y1k-l95yFM';
const API = `https://graph.facebook.com/${process.env.META_API_VERSION || 'v23.0'}`;
const ROT = new URL('..', import.meta.url).pathname;

const args = process.argv.slice(2);
const flagga = (n, s = null) => {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : s;
};
const finns = (n) => args.includes(`--${n}`);
const dö = (m) => { console.error(`✗ ${m}`); process.exit(1); };

function driveLs(id) {
  try {
    const ut = execFileSync('python3', [`${ROT}tools/drive-ls.py`, id], { encoding: 'utf8', timeout: 60000 });
    return ut.trim().split('\n').filter(Boolean).map(rad => {
      const [typ, fid, ...titel] = rad.split('\t');
      return { typ, id: fid, titel: titel.join('\t') };
    });
  } catch (e) {
    dö(`Kunde inte läsa Drive-mappen ${id}: ${e.message}`);
  }
}

/** Alla annonser i kontot, med sin kampanj. Kontot ar kvittot pa vad som ar gjort
 *  OCH facit for vilken kampanj ett prefix hor till — bada las har, en gang. */
async function metaAnnonser(act) {
  if (!process.env.META_ACCESS_TOKEN) dö('META_ACCESS_TOKEN saknas i miljön.');
  const ut = [];
  let url = `${API}/act_${act}/ads?fields=name,campaign{name,status}&limit=300&access_token=${process.env.META_ACCESS_TOKEN}`;
  while (url) {
    const j = await (await fetch(url)).json();
    if (j.error) dö(`Meta: ${j.error.message}`);
    ut.push(...(j.data || []));
    url = j.paging?.next ?? null;
  }
  return ut;
}

/** Prefixet ur ett annonsnamn: "Rodholder_PD_11_H1" -> "rodholder". */
const prefixAv = (namn) => (annonsdel(namn).match(/^([A-Za-z]+)_/) || [])[1]?.toLowerCase() ?? null;

/** Kontot lar oss sjalvt vilken kampanj ett prefix hor till — ingen konfig behovs.
 *  Nya produkter dyker upp standigt i Baverbutiken; en hardkodad lista missar dem
 *  tyst, och tyst missad leverans ar varre an en rapporterad. Kampanjen med FLEST
 *  annonser pa prefixet vinner; oavgjort bryts av att en ACTIVE kampanj gar fore. */
function prefixKarta(annonser) {
  const rakning = {};
  for (const a of annonser) {
    const p = prefixAv(a.name);
    if (!p || !a.campaign?.id) continue;
    ((rakning[p] ??= {})[a.campaign.id] ??= { ...a.campaign, antal: 0 }).antal++;
  }
  const karta = {};
  for (const [p, kampanjer] of Object.entries(rakning)) {
    karta[p] = Object.values(kampanjer).sort((a, b) =>
      b.antal - a.antal || (b.status === 'ACTIVE') - (a.status === 'ACTIVE'))[0];
  }
  return karta;
}

// Notion-titlar bär ibland ett suffix: "Beachslippers_PD_2_8 – COPY ONLY: ...".
// Drive-mappen heter bara annonsdelen. Jämför alltid på annonsdelen.
const annonsdel = (s) => s.split(/\s+[–—-]\s+/)[0].trim();

const { products } = JSON.parse(readFileSync(`${ROT}products/products.json`, 'utf8'));
const filter = flagga('produkt');

// Butiken avgör vilket annonskonto kön läser. Hubbregistret är facit — kontot
// star inte langre hardkodat har, men spärren ar densamma: ETT konto per körning.
const reg = laddaRegister(ROT);
let butik;
try {
  butik = reg.butik(flagga('butik', STANDARDBUTIK));
} catch (e) {
  dö(`${e.message}\n   Butiken styr vilket annonskonto kön läser — den gissas aldrig.`);
}
const AKTUELLT_ACT = butik.annonskonto;

// products.json ar en explicit override for de fyra skalningsprodukterna.
// Allt annat i butiken hittas via kontot i prefixKarta().
const konfig = {};
for (const p of products) {
  if (p.creative_prefix && String(p.ad_account_id) === String(AKTUELLT_ACT)) {
    konfig[p.creative_prefix.replace(/_$/, '').toLowerCase()] = p;
  }
}

// Prefix som inte gar att harleda ur kontot: Notion-hubben och annonskontot anvander
// ibland olika sprak for samma produkt (hubben "Belt grinder", kampanjen
// "Balteslipmaskinen"). Da finns ingen gemensam strang att matcha pa — kopplingen
// skrivs upp en gang i prefix-alias.json i stallet for att gissas.
let alias = {};
try {
  alias = JSON.parse(readFileSync(`${ROT}products/prefix-alias.json`, 'utf8')).alias ?? {};
} catch { /* filen ar frivillig */ }

// Notion-titlar bar ibland ett suffix: "Beachslippers_PD_2_8 – COPY ONLY: ...".
// Drive-mappen heter bara annonsdelen. Jamfor alltid pa annonsdelen.

// 1. Kontot: vad som redan ar gjort, och vilket prefix som hor till vilken kampanj.
const annonser = await metaAnnonser(AKTUELLT_ACT);
const uppe = new Set(annonser.map(a => a.name.trim().toLowerCase()));
const karta = prefixKarta(annonser);

// 2. Leveranserna i Drive — bara med --drive. Sedan 2026-09-02 är Notion enda
// källan; Drive-vägen finns kvar för att kunna läsa gamla leveransmappar vid behov.
const veckor = finns('drive') ? driveLs(EDITED_FOLDER).filter(x => x.typ === 'mapp') : [];
const leveranser = [];
const annanButik = [];       // rader/mappar som hör till en annan butik i registret
for (const v of veckor) {
  for (const m of driveLs(v.id)) {
    if (m.typ !== 'mapp') continue;
    const namn = annonsdel(m.titel);
    const pfx = prefixAv(namn);
    if (!pfx) continue;                       // inte ett annonsnamn — hoppa tyst
    const prefixButik = reg.butikForPrefix(pfx);
    if (prefixButik && prefixButik.id !== butik.id) {
      annanButik.push({ namn, hub: v.titel, butik: prefixButik, varfor: 'prefixet' });
      continue;
    }
    const p = konfig[pfx] ?? null;
    const al = alias[pfx];
    const kampanj = p ? { id: p.campaign_ids[0], name: null, status: null }
                  : (karta[pfx] ?? (al ? { id: al.kampanj_id, name: al.kampanj_namn, status: null } : null));
    leveranser.push({
      vecka: v.titel, mapp: m.id, namn, prefix: pfx,
      produktId: p?.id ?? pfx, kampanj,
      kalla: p ? 'products.json' : (karta[pfx] ? 'kontot' : (al ? 'prefix-alias.json' : null)),
    });
  }
}
for (const l of leveranser) l.kalla2 = 'drive';

// 2b. Leveranserna i Notion — huvudkallan. Allt fardigt (video fran redigerarna,
// bild fran /bildannonser 20:00) ligger som BILAGA i radens "Filer och media" med
// status "To be Reviewed". bildannonser/output/ ar gitignorerat, sa Notion-bilagan
// ar enda kopian i varlden. (Rotorsaken till att fem fardiga bildannonser lag
// osynliga 2026-08-31.)
// En hub ur products.json vars produkt inte har en enda ACTIVE kampanj i kontot ar
// avvecklad. Ett 404 dar ar inget larm — det finns inget att leverera, och Axel ska
// inte bes bjuda in integrationen till nedslackta produkter. (Axels besked 2026-09-06:
// rutinen bad honom oppna Beach crocs/Trimmer belt/Mower seat, alla avstangda.)
const aktivaPrefix = new Set(
  annonser.filter(a => a.campaign?.status === 'ACTIVE').map(a => prefixAv(a.name)).filter(Boolean));
const avvecklade = new Set(products
  .filter(p => p.creative_prefix && p.notion?.name && !aktivaPrefix.has(p.creative_prefix.replace(/_$/, '').toLowerCase()))
  .map(p => p.notion.name));

let notionFel = null;
let notionInfo = null;
let notionHubbar = 0;
let hubbNamn = [];
let oregistreradeHubbar = [];
try {
  const { hubbar, rader, fel } = await allaKlaraRader();
  notionHubbar = hubbar.length;
  hubbNamn = hubbar.map(h => h.titel).sort();
  // Hubbar registret inte känner igen körs som standardbutikens, precis som före
  // registret (nya Bäverbutiks-produkter ska komma med av sig själva). De listas
  // ändå: en OPS-hub som glömts bort i registret ska synas, inte gissas rätt.
  oregistreradeHubbar = hubbar
    .filter(h => !reg.butikForHubb({ id: h.id, namn: h.titel }))
    .map(h => h.titel).sort();
  const larm = Object.entries(fel).filter(([h]) => !avvecklade.has(h));
  const tysta = Object.entries(fel).filter(([h]) => avvecklade.has(h));
  if (larm.length) notionFel = larm.map(([h, f]) => `${h}: ${f}`).join(' · ');
  if (tysta.length) notionInfo = tysta.map(([h]) => h).join(', ');
  for (const r of rader) {
    const namn = annonsdel(r.namn);
    const pfx = prefixAv(namn);
    if (!pfx) continue;

    // Hubbregistret gar fore allt annat. Hor hubben eller prefixet till en ANNAN
    // butik ar raden inte den har korningens — den plockas bort och rapporteras.
    // (Utan detta kan en OPS-butiks creative matcha Baverbutikens prefixkarta och
    // hamna i Baverbutikens kampanj: OPS-butikerna saljer samma produkter.)
    const hubbButik = reg.butikForHubb({ id: r.hubId, namn: r.hub });
    const prefixButik = reg.butikForPrefix(pfx);
    const tillAnnanButik = (annan, varfor) => annanButik.push({ namn, hub: r.hub, butik: annan, varfor });
    if (hubbButik && hubbButik.id !== butik.id) { tillAnnanButik(hubbButik, 'hubben'); continue; }
    if (prefixButik && prefixButik.id !== butik.id) { tillAnnanButik(prefixButik, 'prefixet'); continue; }

    const p = konfig[pfx] ?? null;
    const al = alias[pfx];
    // Kampanjkartan ur butikens konto ar ocksa verksamhetssparren: en hub vars
    // prefix inte finns i kontot hor till en annan verksamhet och laddas aldrig upp.
    const kampanj = p ? { id: p.campaign_ids[0], name: null, status: null }
                  : (karta[pfx] ?? (al ? { id: al.kampanj_id, name: al.kampanj_namn, status: null } : null));
    leveranser.push({
      vecka: r.hub, mapp: r.id, namn, prefix: pfx,
      produktId: p?.id ?? pfx, kampanj,
      kalla: p ? 'products.json' : (karta[pfx] ? 'kontot' : (al ? 'prefix-alias.json' : null)),
      kalla2: 'notion', notionUrl: r.url, notionFiler: r.filer, skapad: r.skapad,
      leverans: r.leverans, drive: r.drive ?? [],
    });
  }
} catch (e) {
  // ALDRIG tyst. Att Notion inte gick att lasa ar exakt den lucka som gomde
  // fem fardiga bildannonser — den ska synas hogst upp i rapporten.
  notionFel = e.saknarToken
    ? 'NOTION_TOKEN saknas — Notion-källan lästes INTE. Bildannonser från /bildannonser är osynliga i den här körningen.'
    : `Notion kunde inte läsas: ${e.message}`;
}

if (filter) {
  for (let i = leveranser.length - 1; i >= 0; i--) {
    if (leveranser[i].produktId !== filter && leveranser[i].prefix !== filter.toLowerCase()) leveranser.splice(i, 1);
  }
}

/** Som driveLs men tyst: en Drive-lank i en Notion-sida kan vara stangd eller
 *  borttagen, och det ska inte falla hela kon. */
function driveLsMjuk(id) {
  try {
    const ut = execFileSync('python3', [`${ROT}tools/drive-ls.py`, id], { encoding: 'utf8', timeout: 60000 });
    return ut.trim().split('\n').filter(Boolean).map(rad => {
      const [typ, fid, ...titel] = rad.split('\t');
      return { typ, id: fid, titel: titel.join('\t') };
    });
  } catch { return []; }
}
const ÄR_MEDIA = (t) => /\.(mp4|mov|m4v|jpg|jpeg|png)$/i.test(t);

/** Redigerarnas videor: Drive-mappen som ar lankad sist i Notion-sidan. Sidan bar
 *  ocksa brief-mappen — darfor provas lankarna i tur och ordning (sista forst) och
 *  den forsta som INNEHALLER media ar leveransen. Filer lankade direkt tas rakt av. */
function driveLeverans(l) {
  for (const k of l.drive) {
    if (k.typ === 'fil') return { mapp: k.id, filer: [{ typ: 'fil', id: k.id, titel: `${l.namn}.mp4`, direkt: true }] };
    const filer = driveLsMjuk(k.id).filter(f => f.typ === 'fil' && ÄR_MEDIA(f.titel));
    if (filer.length) return { mapp: k.id, filer };
  }
  return { mapp: null, filer: [] };
}

// 3. Kon: levererat men inte i kontot.
const kö = [];
for (const l of leveranser) {
  const gjort = uppe.has(l.namn.toLowerCase());
  if (gjort && !finns('alla')) continue;
  let filer, driveMapp = null;
  if (l.kalla2 !== 'notion') {
    filer = driveLs(l.mapp).filter(f => f.typ === 'fil');
  } else if (l.leverans === 'notion-fil') {
    filer = l.notionFiler.map(f => ({ typ: 'notion', id: l.mapp, titel: f.namn || `${l.namn}.jpg` }));
  } else if (l.leverans === 'drive-lank') {
    ({ mapp: driveMapp, filer } = driveLeverans(l));
  } else {
    filer = [];                                           // 'saknas' — rapporteras, laddas inte upp
  }
  kö.push({ ...l, gjort, filer, driveMapp });
}

/** Lifetime-spend. Fel att lasa = anta att den spenderat (rors inte). */
async function spend(id) {
  try {
    const r = await (await fetch(`${API}/${id}/insights?date_preset=maximum&fields=spend&access_token=${process.env.META_ACCESS_TOKEN}`)).json();
    return Number(r.data?.[0]?.spend ?? 0);
  } catch { return Infinity; }
}

// Kampanjnamn for de som kom ur products.json (kartan har dem inte alltid).
for (const k of kö) {
  if (k.kampanj && !k.kampanj.name) {
    const träff = annonser.find(a => a.campaign?.id === k.kampanj.id)?.campaign;
    if (träff) { k.kampanj.name = träff.name; k.kampanj.status = träff.status; }
  }
}

// En PAUSED kampanj som spenderat ar avvecklad — dit gar inga nya creatives.
for (const k of kö) {
  if (k.kampanj && k.kampanj.status && k.kampanj.status !== 'ACTIVE') {
    k.kampanjSpend = await spend(k.kampanj.id);
    k.avvecklad = k.kampanjSpend > 0;
  }
}

if (finns('json')) {
  console.log(JSON.stringify({
    hämtadAt: new Date().toISOString(),
    butik: { id: butik.id, namn: butik.namn, annonskonto: butik.annonskonto },
    levereratTotalt: leveranser.length,
    annanButik: annanButik.map(a => ({ ...a, butik: a.butik.id })),
    oregistreradeHubbar,
    kö,
  }, null, 2));
  process.exit(0);
}

const nya = kö.filter(k => !k.gjort);
const utan = nya.filter(k => !k.kampanj);
const hyllade = nya.filter(k => k.avvecklad);
// Ett tyst Notion-fel ar samma fella igen. Det star forst, fore allt annat.
if (notionFel) {
  console.log(`⚠️  NOTION-KÄLLAN: ${notionFel}`);
  console.log(`    Notion är enda källan — kön nedan är därför TOM eller OFULLSTÄNDIG.\n`);
}
if (notionInfo) {
  console.log(`ℹ️  Avvecklade produkter (ingen ACTIVE kampanj i kontot) — hubbarna gick inte att läsa men ignoreras: ${notionInfo}\n`);
}
const frånDrive = leveranser.filter(l => l.kalla2 === 'drive').length;
const frånNotion = leveranser.filter(l => l.kalla2 === 'notion').length;
// Butiken forst: allt nedan galler ETT konto, och vilket det ar far aldrig vara
// underforstatt i en rapport som styr uppladdningar.
console.log(`Butik: ${butik.namn} (${butik.id}) → annonskonto ${butik.annonskonto}${butik.annonskonto_namn ? ` (${butik.annonskonto_namn})` : ''}\n`);
// Lista hubbarna vid namn. En integration ser bara de hubbar den blivit inbjuden
// till, och en hub den inte ser ar helt osynlig — man kan inte sakna det man aldrig
// vetat om. Namnen i rapporten ar enda sattet att upptacka en ny hub som glomts bort.
if (hubbNamn.length) {
  console.log(`Notion-hubbar som lästes (${hubbNamn.length}):`);
  for (const n of hubbNamn) console.log(`  · ${n}`);
  console.log(`  Saknas en hub här har integrationen inte bjudits in till den.\n`);
}
// Rader som hör till en annan butik. Aldrig tyst bortkastade: en OPS-creative
// som hamnar i Bäverbutikens kampanj kostar riktiga pengar, och en som ingen
// kör hämtar fastnar för alltid i "To be Reviewed".
if (annanButik.length) {
  const per = {};
  for (const a of annanButik) (per[a.butik.id] ??= []).push(a);
  console.log(`⚠️  ${annanButik.length} leverans(er) hör till en ANNAN butik och ingår inte i den här kön:`);
  for (const [bid, rader] of Object.entries(per)) {
    console.log(`  · ${bid} (${rader.length}): ${rader.slice(0, 6).map(r => r.namn).join(', ')}${rader.length > 6 ? ` … (+${rader.length - 6})` : ''}`);
    console.log(`      kör dem med: node tools/leveranskon.mjs --butik ${bid}`);
  }
  console.log('');
}
if (oregistreradeHubbar.length) {
  console.log(`ℹ️  ${oregistreradeHubbar.length} hub(bar) står inte i hubbregistret och körs som ${butik.id}: ${oregistreradeHubbar.join(', ')}`);
  console.log(`    Hör någon av dem till en annan butik: skriv in den i commission/hubbar.json innan nästa körning.\n`);
}
console.log(`Källor: ${frånNotion} i Notion (${notionHubbar} hubbar)${finns('drive') ? ` · ${frånDrive} i Drive` : ''} · ${leveranser.length - nya.length} redan i kontot · ${Object.keys(karta).length} kända prefix\n`);

const perProdukt = {};
for (const k of nya) (perProdukt[k.produktId] ??= []).push(k);

for (const [pid, rader] of Object.entries(perProdukt)) {
  const kmp = rader[0].kampanj;
  if (!kmp) {
    console.log(`${pid} → ⚠️  INGEN KAMPANJ i kontot — produkten är inte launchad. Laddas INTE upp.`);
  } else if (rader[0].avvecklad) {
    console.log(`${pid} → ${kmp.name} [${kmp.status}], ${rader[0].kampanjSpend} kr spend`);
    console.log(`   ⏭  AVVECKLAD — avstängd med flit. Laddas INTE upp. Rapporteras bara.`);
  } else {
    const aktiv = kmp.status === 'ACTIVE';
    console.log(`${pid} → ${kmp.name} [${kmp.status}]${aktiv ? '  ⚠️ AKTIV — uppladdning här börjar spendera' : ''}`);
    console.log(`   (kopplingen kommer från ${rader[0].kalla})`);
  }
  for (const r of rader) {
    const media = r.filer.filter(f => f.typ === 'notion' || ÄR_MEDIA(f.titel));
    console.log(`  • ${r.namn}  (${r.kalla2 === 'notion' ? 'Notion: ' + r.vecka : r.vecka})`);
    if (!media.length) {
      if (r.leverans === 'saknas') console.log(`      ⚠ VÄNTAR PÅ FIL — varken bilaga i "Filer och media" eller Drive-länk i sidan. Fråga redigeraren.`);
      else if (r.leverans === 'drive-lank') console.log(`      ⚠ Drive-länk i sidan men ingen video i mappen (${r.drive.map(k => k.id).join(', ')}) — inte klar. Fråga redigeraren.`);
      else console.log(`      ⚠ ingen media i mappen — inte klar`);
      continue;
    }
    for (const f of media) {
      if (r.kalla2 === 'notion' && f.typ === 'notion') {
        // Signerad URL med kort livslangd — hamtas vid korning, skrivs aldrig ut.
        console.log(`      ${f.titel}`);
        console.log(`        hämtas med: node tools/notion-fil.mjs ${r.mapp} --ut <mapp>`);
        continue;
      }
      if (r.kalla2 === 'notion') {
        // Redigerarens Drive-mapp, lankad i Notion-sidan. Publik export-URL.
        // Redigerarna levererar tva format: "<namn>.mp4" (9:16, annonsen) och
        // "<namn> 4.5.mp4" (4:5-variant). Den exakta traffen ar den som laddas upp.
        const fnamn = f.titel.replace(/\.[^.]+$/, '').toLowerCase();
        const exakt = f.direkt || fnamn === r.namn.toLowerCase();
        const variant = !exakt && fnamn.startsWith(r.namn.toLowerCase());
        const märke = exakt ? '  ← LADDAS UPP (9:16)' : variant ? '  (formatvariant, laddas inte upp separat)' : '  ⚠ FILNAMN ≠ ANNONSNAMN — fråga redigeraren';
        console.log(`      ${f.titel}${märke}   (Drive-mapp ${r.driveMapp} ur Notion-sidan)`);
        console.log(`        https://drive.google.com/uc?export=download&id=${f.id}`);
        console.log(`        hämtas med: node tools/notion-fil.mjs ${r.mapp} --ut <mapp>`);
        continue;
      }
      const fnamn = f.titel.replace(/\.[^.]+$/, '');
      const varning = fnamn.toLowerCase() !== r.namn.toLowerCase() ? '  ⚠ FILNAMN ≠ MAPPNAMN' : '';
      console.log(`      ${f.titel}${varning}`);
      console.log(`        https://drive.google.com/uc?export=download&id=${f.id}`);
    }
  }
  console.log('');
}

const utanFil = nya.filter(k => !k.filer.length);
console.log(`${nya.length} leverans(er) väntar på uppladdning.`);
if (utanFil.length) console.log(`⚠️  ${utanFil.length} av dem saknar fil/video och väntar på redigeraren: ${utanFil.map(k => k.namn).join(', ')}`);
if (utan.length) console.log(`⚠️  ${utan.length} av dem saknar kampanj i kontot och laddas inte upp.`);
if (hyllade.length) console.log(`⏭  ${hyllade.length} hör till en avvecklad kampanj och laddas inte upp.`);
const iAktiva = nya.filter(k => k.kampanj?.status === 'ACTIVE').length;
if (iAktiva) console.log(`⚠️  ${iAktiva} skulle hamna i en AKTIV kampanj — de börjar spendera direkt vid aktivering.`);
