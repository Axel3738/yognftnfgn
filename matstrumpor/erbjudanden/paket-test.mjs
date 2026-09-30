// paket-test.mjs — A/B-testet av PAKETNIVÅERNA på matstrumpor.se/products/sushi-strumpor.
//
// Axels order 2026-09-30: "jag vill också testa att sälja 1 pack sushistrumpor, 2 pack och 4 pack osv",
// och samma dag B-sidans priser: 1 låda 399 kr, 2 lådor 499 kr, 4 lådor 799 kr, ätpinnar 1 par per låda.
//
//   node matstrumpor/erbjudanden/paket-test.mjs --pa            # torrt: exakt vad som skulle ändras
//   node matstrumpor/erbjudanden/paket-test.mjs --av            # torrt: avstängningen
//   node matstrumpor/erbjudanden/paket-test.mjs --kundvy        # Chromium som kund: vilken variant, vilka nivåer
//   node matstrumpor/erbjudanden/paket-test.mjs --kassaprov     # en anonym varukorg per nivå med kod: kassans summa
//   node matstrumpor/erbjudanden/paket-test.mjs --pa --skarpt   # ⛔ BARA på Axels ok
//   --spec <fil>  (standard matstrumpor/erbjudanden/paket-spec-axel.json)
//
// Butiken: matstrumpor (1r46tp-qx) via appen Fabriken (sparning/butik.mjs). Temat är det som har rollen
// MAIN — läses varje körning, hårdkodas aldrig.
//
// ── HUR TESTET SITTER IHOP (avläst i temat 2026-09-30) ─────────────────────────────────────────────
// • Paketnivåerna är metaobjekt `ms_paketniva`. snippets/ms-paket.liquid visar en nivå om nivåns produkt =
//   sidans produkt OCH (nivåns ab_variant är tom ELLER lika med den `variant` renderingen skickar). I mixläget
//   (sortval-testets B) krävs dessutom exakt lika.
// • ab_variant är INTE knuten till ett test, bara en sträng. `b` är redan upptaget av sortval-testets mix-2/mix-4
//   (produkt = sushi). Märktes B-nivåerna `b` skulle paket-B-blocket visa mix-2/mix-4 också: två "2 lådor" och
//   två "4 lådor". Därför bär B-nivåerna `paket-b` (specens b_variant), och B-blocket renderar med
//   variant: 'paket-b'. mix-2/mix-4 rörs aldrig.
// • templates/product.json: A-blocket `ms_paket` är ett custom_liquid-block, `<div data-ms-ab="sortval:a">` runt
//   render med variant: 'a' HÅRDKODAT. Det betyder att nivåer märkta `a` syns i A-blocket även när inget test är
//   aktivt. Verktyget byter bara omslagets test (sortval:a → paket:a) och lägger ett nytt block `ms_paket_b` direkt
//   efter: `<div data-ms-ab="paket:b" hidden>` + render med variant: 'paket-b' och section_id: block.id. Eget
//   section_id för att radioknapparna annars delar name med A-blockets och en ikryssning i det dolda blocket
//   avmarkerar den synliga.
// • templates/index.json: startsidans featured-product renderar ms-paket UTAN variant (ab = ''). Märktes
//   sushi-2/sushi-4 `a` utan att startsidan patchades vore startsidans köpruta TOM. Därför delas den på samma
//   sätt (paket:a med variant 'a' + paket:b hidden med variant 'paket-b') och skrivs FÖRE nivåerna.
// • snippets/ms-ab-attrs.liquid (theme-blocket blocks/ms-paket.liquid använder det): omslaget får
//   data-ms-ab="<test>:<variant>" bara när BÅDA är ifyllda, och `hidden` på allt som inte är `a`.
//   assets/ms-ab.js rör bara element vars test är AKTIVT (`if (!(testId in assigned)) return`). Alltså, när
//   testet är AV: a-omslaget syns, b-omslaget förblir dolt (hidden från Liquid), för varje besökare, även med en
//   gammal kaka ms_ab_paket=b. Ett theme-block med tomt test eller tom variant får inget attribut och renderar
//   variant '' — sådana renderingar av ms-paket hittas av `renderUtanVariant` och stoppar --pa.
// • Testet slås på i config/settings_data.json → ms_ab_tests (rader `id:vikt_a:vikt_b`, `#` = av). ms-ab.js
//   lottar, sparar kakan 30 dagar, stämplar `AB paket: a|b` på ordern och skickar MsAbExposure. `?ms_ab=paket:b`
//   tvingar B — men bara när testet är aktivt.
//
// ── ORDNINGEN (bevisad i test/paket-test.test.mjs genom att simulera varje mellanläge) ─────────────────
// --pa:  rabattkoder → mallar (product.json, index.json) → B-nivåer (ACTIVE, paket-b) → A-nivåer ab=a → settings.
//        Mallarna före nivåerna: annars står startsidan (variant '') tom i steget där A märks `a`.
// --av:  ordningen väljs efter mallarna (planAv). Finns en rendering utan variant: A-nivåer ab=tom → settings
//        `# paket:…` (en rendering med variant '' visar inte `a`, den köprutan hade stått tom). Efter --pa finns
//        ingen sådan, och då är den ordningen FEL: medan testet är på visar B-blocket både de tömda A-nivåerna och
//        B-nivåerna (B-besökaren ser två "2 lådor", simuleringen fångar det). Då: settings först, A-nivåer sist.
//        Slutläget är detsamma — testet av, ingen A-nivå kvar som `a`.
//        B-blocket och B-nivåerna ligger KVAR: blocket är dolt med hidden från Liquid och ms-ab.js rör det inte
//        när testet är av; ms-paket.js inaktiv() hindrar det dolda blocket från att skriva i köpformuläret. Att
//        slå på testet igen är då bara `--pa` (idempotent). Skapade rabattkoder ligger kvar (de syns ingenstans
//        utan B-blocket, men går att skriva in för hand — stäng av dem i admin om testet läggs ner).
//        Mallarnas A/B-omslag ligger också kvar: med testet av syns a-omslaget för alla.
// Varje skrivning läses tillbaka innan nästa steg; ett fel stoppar körningen där den är.
//
// ── RABATTKODERNA FÖR AXELS B (2 lådor 499, 4 lådor 799) ───────────────────────────────────────────────
// Konstruktion: DiscountCodeBasic, FAST BELOPP av (appliesOnEachItem false) på sushi-strumpors 5-par + ätpinnarna,
// minsta delsumma på just de varorna = hela paketets ordinarie pris. Belopp = lådor × 5-parpris + pinnar ×
// pinnpris − kundpris (live 2026-09-30: 2 × 399 + 2 × 50 − 499 = 399,00 kr; 4 × 399 + 4 × 50 − 799 = 997,00 kr),
// minsta delsumma 898,00 resp. 1 796,00 kr. Fasta belopp i ören ⇒ exakt på öret; ingen procent, alltså inget av
// Shopifys trunkeringsproblem. Tas pinnarna bort ur korgen faller delsumman under gränsen och koden gäller inte
// (kunden kan inte få paketpriset utan pinnarna och tjäna pinnarnas värde). BxGy med belopp (`amount` finns i
// DiscountEffectInput, mätt) valdes bort: den rabatterar bara "få"-varorna, och 2 lådor för 499 kr kräver avdrag
// på lådorna själva.
// 3-PAR (huvudsessionens beslut 2026-09-30, 3-par är 7 % av ordrarna): i B gäller paketen ALLTID 5-par. Specens
// b_fast_variant ⇒ B-renderingarna skickar fast_variant: <5-parets id> till snippeten, som då räknar korten på
// 5-parpriset (v = den fasta varianten, standard = v.price) och ms-paket.js köper den varianten (data-variant-id,
// variantId()), vad variantväljaren än står på. Snippet-ändringen är två rader och gör ingenting utan fast_variant,
// så A, startsidans A och pizza/hamburgare/donut ritas exakt som förut. Utan b_fast_variant visar sidan 439 / 679
// kr för 3-par medan kassan tar 838 / 1 676 kr (koden gäller bara 5-par) — sidaMotKassa fångar det och --skarpt
// vägras. ⚠️ snippets/ms-paket.liquid ägs också av temapatchen (marknader/bygg.mjs --steg tema), som bara rör en
// fil den känner igen; bygg.mjs känner därför igen den här patchen och lägger på den igen när den bygger om.
// Variantväljaren syns fortfarande i B: en kund som väljer 3-par får 5-par till samma pris (fler par, inte färre).
//
// ⚠️ d3-annonsen ("Köp 2 – få 2 gratis", bildannonsen D3, marknader/egna/d3/) länkar till samma produktsida. En
// besökare som lottas till B möter då 2 lådor 499 kr / 4 lådor 799 kr och ordet gratis finns inte på sidan —
// annonsen och sidan säger olika saker för halva trafiken. Det är ett skäl att läsa testet per annons, eller att
// låta d3 länka med ?ms_ab=paket:a (tvingade besök märks `AB paket forced` och går att räkna bort).
//
// ⛔ Kör aldrig --skarpt utan Axels ok. Torrt är standard och skriver ingenting.

import { readFileSync, writeFileSync, mkdirSync, appendFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
export const STANDARD_SPEC = join(ROT, 'paket-spec-axel.json');
const OUTPUT = join(ROT, 'output');
const LOGG = join(ROT, 'paket-test-logg.jsonl');
const PRODUKTSIDA = 'https://matstrumpor.se/products/sushi-strumpor';
const PLAYWRIGHT = process.env.LR_PLAYWRIGHT || '/opt/node22/lib/node_modules/playwright/index.mjs';
const CHROME_KANDIDATER = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome', '/opt/pw-browsers/chromium'];
export const MALLAR = ['templates/product.json', 'templates/index.json'];
export const SETTINGS = 'config/settings_data.json';

// ══ ren logik ══════════════════════════════════════════════════════════════════════════════════════════

const ore = (kr) => Math.round(Number(kr) * 100);
const krText = (o) => (o / 100).toFixed(2);

/** Shopifys temafiler bär ett kommentarshuvud före JSON:en. */
export function delaHuvud(text) {
  const m = /^(\s*\/\*[\s\S]*?\*\/\s*)?([\s\S]*)$/.exec(text);
  return { huvud: m[1] ?? '', data: JSON.parse(m[2]) };
}
const satt = (huvud, data) => huvud + JSON.stringify(data, null, 2) + '\n';

export function lasSpec(fil = STANDARD_SPEC) {
  return JSON.parse(readFileSync(fil, 'utf8'));
}

/** Specens egna regler (utan nät). `ctx` = { standardOre, pinnOre, befintliga: [{handle, fields}] } när det finns. */
export function valideraSpec(spec, ctx = {}) {
  const fel = [];
  if (!/^[a-z0-9_-]+$/.test(spec.test || '')) fel.push(`test-id "${spec.test}" får bara ha a–z, 0–9, _ och -`);
  if (spec.test === 'sortval') fel.push('test-id sortval är det avslutade sortval-testet');
  const bv = spec.b_variant;
  if (!bv || ['a', 'b'].includes(bv)) fel.push(`b_variant "${bv}" krockar (a = A-blocket, b = sortval-testets mix-2/mix-4) — använd t.ex. "${spec.test}-b"`);
  if (!Array.isArray(spec.vikter) || spec.vikter.length !== 2 || spec.vikter.some((v) => !(v > 0))) fel.push('vikter ska vara två positiva tal');
  const b = spec.b_nivaer ?? [];
  if (!b.length) fel.push('b_nivaer är tom');
  const handles = b.map((n) => n.handle);
  if (new Set(handles).size !== handles.length) fel.push('två B-nivåer har samma handle');
  for (const h of handles) {
    if ((spec.a_nivaer ?? []).includes(h)) fel.push(`${h} är en A-nivå — B-nivåerna ska vara egna poster`);
    if (/^mix-/.test(h)) fel.push(`${h}: mix-* hör till sortval-testet och rörs inte`);
  }
  const antal = b.map((n) => n.antal);
  if (new Set(antal).size !== antal.length) fel.push('två B-nivåer har samma antal');
  if (b.filter((n) => n.forvald).length !== 1) fel.push(`exakt en B-nivå ska vara förvald (nu ${b.filter((n) => n.forvald).length})`);
  const definierade = new Map((spec.rabattkoder ?? []).map((r) => [r.kod, r]));
  for (const n of b) {
    const namn = n.handle;
    if (!Number.isInteger(n.antal) || n.antal < 1) fel.push(`${namn}: antal ska vara ett heltal ≥ 1`);
    if (!n.rubrik) fel.push(`${namn}: rubrik saknas`);
    const kod = (n.rabattkod || '').trim();
    const bogo = Number(n.bogo_gratis || 0);
    const gantal = Number(n.gratis_antal || 0);
    if (gantal > 0 && !kod) fel.push(`${namn}: ${gantal} gratisprodukter utan rabattkod — kassan tar då betalt för "gratis"-pinnarna`);
    if (bogo > 0 && !kod) fel.push(`${namn}: bogo_gratis utan rabattkod`);
    if (bogo === 0 && /gratis/i.test(n.rubrik + ' ' + (n.underrubrik || ''))) fel.push(`${namn}: ordet "gratis" i rubriken fast inga strumpor är gratis`);
    if (!kod && /spara|sparar|rabatt/i.test(n.rubrik + ' ' + (n.underrubrik || ''))) fel.push(`${namn}: rubriken lovar en besparing som inte finns (ingen kod)`);
    if (ctx.standardOre != null) {
      const s = ctx.standardOre, g = gantal * (ctx.pinnOre ?? 0), f = ore(n.fastpris);
      if (!kod && f !== s * n.antal) fel.push(`${namn}: utan kod visar sidan variantpriset ${krText(s * n.antal)} kr, inte fastpris ${n.fastpris}`);
      if (bogo > 0 && f !== s * (n.antal - bogo)) fel.push(`${namn}: bogo ${bogo} på ${n.antal} lådor ger ${krText(s * (n.antal - bogo))} kr, inte fastpris ${n.fastpris}`);
      if (kod && bogo === 0 && !(f < s * n.antal + g)) fel.push(`${namn}: fastpris ${n.fastpris} är ingen rabatt mot ordinarie ${krText(s * n.antal + g)} kr`);
    }
    const def = definierade.get(kod);
    if (def) {
      if (def.lador !== n.antal) fel.push(`${kod}: lador ${def.lador} ≠ nivåns antal ${n.antal}`);
      if (def.pinnar !== gantal) fel.push(`${kod}: pinnar ${def.pinnar} ≠ nivåns gratis_antal ${gantal}`);
      if (Number(def.kundpris) !== Number(n.fastpris)) fel.push(`${kod}: kundpris ${def.kundpris} ≠ nivåns fastpris ${n.fastpris}`);
      if (bogo !== 0) fel.push(`${kod}: en fastbeloppskod kan inte bära bogo_gratis`);
    }
  }
  for (const h of handles) {
    const f = (ctx.befintliga ?? []).find((x) => x.handle === h);
    const ab = f ? (f.fields.ab_variant ?? '') : null;
    if (f && ab !== '' && ab !== bv) fel.push(`${h} finns redan med ab_variant "${ab}" — den hör till något annat, skriv inte över`);
  }
  return fel;
}

/** En B-nivå → metaobjektets fält (Shopifys strängform). */
export function nivaFalt(n, { produktId, gratisProduktId, abVariant }) {
  const f = [
    ['produkt', produktId],
    ['antal', String(n.antal)],
    ['rubrik', n.rubrik],
    ['underrubrik', n.underrubrik ?? ''],
    ['bricka', n.bricka ?? ''],
    ['fastpris', Number(n.fastpris).toFixed(1)],
    ['gratis_produkt', Number(n.gratis_antal) > 0 ? gratisProduktId : ''],
    ['gratis_antal', String(Number(n.gratis_antal || 0))],
    ['gratis_text', n.gratis_text ?? ''],
    ['forvald', n.forvald ? 'true' : 'false'],
    ['ab_variant', abVariant],
    ['rabattkod', n.rabattkod ?? ''],
    ['bogo_gratis', String(Number(n.bogo_gratis || 0))],
  ];
  return f.map(([key, value]) => ({ key, value }));
}

/** Jämför fält så som Shopify lagrar dem: tomt = null, decimaler "399.0" = "399". */
export function lika(a, b) {
  const norm = (v) => {
    if (v === null || v === undefined || v === '') return '';
    const n = Number(v);
    return Number.isFinite(n) && /^-?\d+(\.\d+)?$/.test(String(v)) ? String(n) : String(v);
  };
  return norm(a) === norm(b);
}

export function faltDiff(befintligaFalt, onskade) {
  return onskade.filter(({ key, value }) => !lika(befintligaFalt?.[key], value)).map(({ key, value }) => ({ key, fore: befintligaFalt?.[key] ?? null, efter: value }));
}

/** Metaobjekt ur GraphQL-svar → [{ id, handle, status, fields: {key: value} }]. */
export function nivaerUr(noder) {
  return noder.map((n) => ({ id: n.id, handle: n.handle, status: n.capabilities?.publishable?.status ?? null, fields: Object.fromEntries(n.fields.map((f) => [f.key, f.value])) }));
}

// ── mallarna ─────────────────────────────────────────────────────────────────────────────────────────

const RENDER_RE = /(?:<div\s+data-ms-ab="([^":]+):([^"]+)"(\s+hidden)?\s*>)?\s*\{%-?\s*render\s+'ms-paket'\s*,([^%]*?)-?%\}/g;

/** Alla renderingar av ms-paket i en mall, i visningsordning. */
export function renderingar(mallText) {
  const { data } = delaHuvud(mallText);
  const ut = [];
  const sektioner = data.order ?? Object.keys(data.sections ?? {});
  for (const sid of sektioner) {
    const s = data.sections?.[sid];
    if (!s) continue;
    const blockOrdning = s.block_order ?? Object.keys(s.blocks ?? {});
    const kandidater = [[null, s], ...blockOrdning.map((bid) => [bid, s.blocks?.[bid]])];
    for (const [bid, b] of kandidater) {
      if (!b) continue;
      if (b.type === 'ms-paket') {
        const t = b.settings?.ab_test || '', v = b.settings?.ab_variant || '';
        ut.push({ sektion: sid, block: bid, test: t && v ? t : null, testVariant: t && v ? v : null, dold: Boolean(t && v && v !== 'a'), variant: v, mix: false, produkt: s.settings?.product ?? 'sidans' });
        continue;
      }
      const cl = b.settings?.custom_liquid;
      if (typeof cl !== 'string' || !cl.includes("'ms-paket'")) continue;
      for (const m of cl.matchAll(RENDER_RE)) {
        const param = m[4];
        ut.push({
          sektion: sid, block: bid,
          test: m[1] ?? null, testVariant: m[2] ?? null, dold: Boolean(m[3]),
          variant: /variant:\s*'([^']*)'/.exec(param)?.[1] ?? '',
          mix: /mix:\s*true/.test(param),
          produkt: /product:\s*section\.settings\.product/.test(param) ? (s.settings?.product ?? null) : 'sidans',
        });
      }
    }
  }
  return ut;
}

/** Renderingar som skickar tom variant (och inte är mix) — de tappar varje nivå märkt `a`. */
export function renderUtanVariant(filer) {
  const ut = [];
  for (const [fil, text] of Object.entries(filer)) {
    let r;
    try { r = renderingar(text); } catch { continue; }
    for (const x of r) if (!x.variant && !x.mix) ut.push({ fil, ...x });
  }
  return ut;
}

const A_OMSLAG = (test) => `data-ms-ab="${test}:a"`;
export const B_BLOCK = 'ms_paket_b';
const fastParam = (fastId) => (fastId ? `, fast_variant: ${Number(fastId)}` : '');
export function bBlockLiquid(spec, fastId = null) {
  return `<div data-ms-ab="${spec.test}:b" hidden>{% render 'ms-paket', product: product, section_id: block.id, variant: '${spec.b_variant}'${fastParam(fastId)} %}</div>`;
}

/** product.json: A-blocket → <test>:a, nytt B-block direkt efter. Idempotent. */
export function patchaProduktJson(text, spec, fastId = null) {
  const { huvud, data } = delaHuvud(text);
  const main = data.sections?.main;
  if (!main?.blocks?.ms_paket) throw new Error('product.json: blocket ms_paket saknas — läs mallen innan du patchar');
  const byten = [];
  const a = main.blocks.ms_paket;
  const cl = a.settings?.custom_liquid ?? '';
  if (!/render\s+'ms-paket'/.test(cl) || /mix:\s*true/.test(cl) || !/variant:\s*'a'/.test(cl)) throw new Error("product.json: ms_paket är inte en render av ms-paket med variant: 'a' — okänd form, rör den inte");
  if (!cl.includes(A_OMSLAG(spec.test))) {
    const ny = cl.replace(/data-ms-ab="[^"]*"/, A_OMSLAG(spec.test));
    if (ny === cl) throw new Error('product.json: ms_paket saknar data-ms-ab-omslag');
    a.settings.custom_liquid = ny;
    byten.push(`ms_paket: omslaget → ${spec.test}:a`);
  }
  const onskat = { type: 'custom_liquid', settings: { custom_liquid: bBlockLiquid(spec, fastId) } };
  if (JSON.stringify(main.blocks[B_BLOCK]) !== JSON.stringify(onskat)) {
    main.blocks[B_BLOCK] = onskat;
    byten.push(`${B_BLOCK}: B-blocket (${spec.test}:b, variant '${spec.b_variant}'${fastId ? `, fast_variant ${fastId}` : ''})`);
  }
  const ix = main.block_order.indexOf('ms_paket');
  const bix = main.block_order.indexOf(B_BLOCK);
  if (bix !== ix + 1) {
    if (bix > -1) main.block_order.splice(bix, 1);
    main.block_order.splice(main.block_order.indexOf('ms_paket') + 1, 0, B_BLOCK);
    byten.push(`${B_BLOCK} direkt efter ms_paket i block_order`);
  }
  return { text: byten.length ? satt(huvud, data) : text, byten };
}

/** index.json: startsidans render utan variant → A/B-par. Idempotent. */
export function patchaIndexJson(text, spec, fastId = null) {
  const { huvud, data } = delaHuvud(text);
  const byten = [];
  const par = (bid) => `<div ${A_OMSLAG(spec.test)}>{% render 'ms-paket', product: section.settings.product, section_id: section.id, variant: 'a' %}</div>`
    + `<div data-ms-ab="${spec.test}:b" hidden>{% render 'ms-paket', product: section.settings.product, section_id: block.id, variant: '${spec.b_variant}'${fastParam(fastId)} %}</div>`;
  const gammaltPar = (bid) => par(bid).replace(fastParam(fastId), '');
  for (const [sid, s] of Object.entries(data.sections ?? {})) {
    for (const [bid, b] of Object.entries(s.blocks ?? {})) {
      const cl = b.settings?.custom_liquid;
      if (typeof cl !== 'string' || !cl.includes("'ms-paket'")) continue;
      if (cl === par(bid)) continue;
      if (fastId && cl === gammaltPar(bid)) { b.settings.custom_liquid = par(bid); byten.push(`${sid}/${bid}: B-renderingen får fast_variant ${fastId}`); continue; }
      const r = [...cl.matchAll(RENDER_RE)];
      if (r.length === 1 && !r[0][1] && !/variant:/.test(r[0][4]) && /product:\s*section\.settings\.product/.test(r[0][4]) && cl.trim() === r[0][0].trim()) {
        b.settings.custom_liquid = par(bid);
        byten.push(`${sid}/${bid}: startsidans köpruta → ${spec.test}:a + ${spec.test}:b`);
      } else throw new Error(`index.json ${sid}/${bid}: okänd form på ms-paket-renderingen — rör den inte`);
    }
  }
  return { text: byten.length ? satt(huvud, data) : text, byten };
}

// ── snippeten: fast_variant (B köper och visar alltid 5-par) ───────────────────────────────────────

export const SNIPPET = 'snippets/ms-paket.liquid';
const FAST_MARK = 'ms-paket-test: fast_variant';
const V_FORE = '  assign v = p.selected_or_first_available_variant\n';
const V_EFTER = V_FORE
  + '  comment\n'
  + `    ${FAST_MARK} — ett block som skickar fast_variant (pakettestets B) räknar och köper ALLTID den varianten,\n`
  + '    oavsett variantväljaren. Utan fast_variant är v exakt som förut (matstrumpor/erbjudanden/paket-test.mjs).\n'
  + '  endcomment\n'
  + '  if fast_variant != blank\n'
  + '    for fx in p.variants\n'
  + '      if fx.id == fast_variant\n'
  + '        assign v = fx\n'
  + '      endif\n'
  + '    endfor\n'
  + '  endif\n';
const STD_FORE = 'assign standard = p.selected_or_first_available_variant.price';
const STD_EFTER = 'assign standard = v.price';

/**
 * Två ändringar i snippets/ms-paket.liquid, båda utan verkan när fast_variant saknas (A, startsidans A, pizza …):
 *  1. v = den fasta varianten om blocket skickar fast_variant (annars oförändrat p.selected_or_first_available_variant);
 *  2. standardpriset i fastprisläget = v.price — samma värde som förut när fast_variant saknas, eftersom v då ÄR
 *     p.selected_or_first_available_variant.
 * assets/ms-paket.js behöver ingen ändring: data-variant-id finns redan, variantId() och styckpris() läser den, och
 * köpet (kop) lägger den varianten i korgen.
 * Idempotent. Kastar om snippeten inte har exakt de två raderna (någon har ändrat den — rör den inte).
 */
export function patchaSnippetFastVariant(kod) {
  if (kod.includes(FAST_MARK)) {
    if (!kod.includes(STD_EFTER)) throw new Error(`${SNIPPET}: markören finns men standardpriset är inte v.price`);
    return { kod, byten: [] };
  }
  const n1 = kod.split(V_FORE).length - 1, n2 = kod.split(STD_FORE).length - 1;
  if (n1 !== 1 || n2 !== 1) throw new Error(`${SNIPPET}: hittar inte raderna att patcha (${n1}/${n2}) — okänd version, rör den inte`);
  return { kod: kod.replace(V_FORE, V_EFTER).replace(STD_FORE, STD_EFTER), byten: ['v = fast_variant när blocket skickar den', 'standard = v.price'] };
}
export const harFastVariantPatch = (kod) => String(kod).includes(FAST_MARK);

// ── settings ──────────────────────────────────────────────────────────────────────────────────────────

const TESTRAD_RE = /"ms_ab_tests":\s*("(?:[^"\\]|\\.)*")/g;

export function lasTestRader(settingsText) {
  const traffar = [...settingsText.matchAll(TESTRAD_RE)];
  if (traffar.length !== 1) throw new Error(`settings_data.json: ${traffar.length} rader ms_ab_tests, väntade exakt 1`);
  return JSON.parse(traffar[0][1]);
}

/** Aktiva test-id:n så som snippets/ms-head.liquid läser dem (tomt och `#` hoppas). */
export function aktivaTest(varde) {
  return String(varde || '').split('\n').map((t) => t.trim()).filter((t) => t && t[0] !== '#').map((t) => t.split(':')[0].trim());
}

/** Nytt värde: alla andra rader kvar, testets egen rad ersatt (på: `id:a:b`, av: `# id:a:b`). */
export function nyttTestVarde(varde, { test, vikter, pa }) {
  const rader = String(varde || '').split('\n').filter((r) => r.trim() !== '');
  const egen = (r) => r.replace(/^\s*#\s*/, '').split(':')[0].trim() === test;
  const kvar = rader.filter((r) => !egen(r));
  kvar.push(`${pa ? '' : '# '}${test}:${vikter[0]}:${vikter[1]}`);
  return kvar.join('\n');
}

/** Byter EN rad i settings_data.json, textuellt — resten av filen orörd. */
export function bytTestRad(settingsText, nyttVarde) {
  lasTestRader(settingsText);
  return settingsText.replace(TESTRAD_RE, () => `"ms_ab_tests": ${JSON.stringify(nyttVarde)}`);
}

// ── rabattkoderna ─────────────────────────────────────────────────────────────────────────────────────

/** Belopp och minsta delsumma för en fastbeloppskod, i ören. */
export function kodBelopp(def, { standardOre, pinnOre, varianter = null }) {
  const ordinarie = def.lador * standardOre + def.pinnar * pinnOre;
  const belopp = ordinarie - ore(def.kundpris);
  if (!(belopp > 0)) throw new Error(`${def.kod}: kundpriset ${def.kundpris} är ingen rabatt mot ${krText(ordinarie)} kr`);
  // Minsta delsumman räknas på den billigaste varianten koden gäller för — annars når en 3-parskorg aldrig
  // gränsen fast sidan visar paketpriset. Med bara 5-par i koden är det 5-parpriset.
  const priser = (varianter ?? []).filter((v) => def.varianter.includes(v.titel)).map((v) => v.prisOre);
  const lagst = priser.length ? Math.min(...priser) : standardOre;
  return { belopp, minsta: def.lador * lagst + def.pinnar * pinnOre };
}

/**
 * Kassans summa i ören för en korg med en fastbeloppskod (DiscountCodeBasic, appliesOnEachItem false):
 * gäller om delsumman av kodens varor ≥ minsta; avdraget är beloppet, högst de varornas delsumma.
 * korg = [{ variant, prisOre, antal }]; kod = { varianter: Set, belopp, minsta } | null.
 */
export function kassaSumma(korg, kod) {
  const total = korg.reduce((s, r) => s + r.prisOre * r.antal, 0);
  if (!kod) return total;
  const omfattas = korg.filter((r) => kod.varianter.has(r.variant)).reduce((s, r) => s + r.prisOre * r.antal, 0);
  if (omfattas < kod.minsta) return total;
  return total - Math.min(kod.belopp, omfattas);
}

/**
 * Sidans pris i ören för en nivå när kunden valt en variant med pris `variantOre` (snippets/ms-paket.liquid +
 * assets/ms-paket.js rita(): rabatten räknas mot standardvarianten och dras som belopp från den valda).
 */
export function sidPris(n, { variantOre, standardOre, pinnOre }) {
  const kod = (n.rabattkod || '').trim();
  const bogo = Number(n.bogo_gratis || 0);
  const g = Number(n.gratis_antal || 0) * pinnOre;
  let rabatt = 0;
  if (bogo > 0 && kod) rabatt = variantOre * bogo + g;
  else if (kod) rabatt = Math.max(0, standardOre * n.antal + g - ore(n.fastpris));
  return Math.max(0, variantOre * n.antal + g - rabatt);
}

/** Sida mot kassa för varje variant och varje nivå med en kod som specen skapar. */
export function sidaMotKassa(spec, { varianter, standardOre, pinnOre, pinnVariant }) {
  const ut = [];
  // Med b_fast_variant räknar och köper B-köprutan alltid den varianten (snippeten + data-variant-id), vad kunden
  // än valt i variantväljaren — kunden som valt 3-par ser och får 5-par. Då är det den enda korg B kan ge.
  const fast = spec.b_fast_variant ? varianter.find((v) => v.titel === spec.b_fast_variant) : null;
  const koder = new Map((spec.rabattkoder ?? []).map((d) => [d.kod, d]));
  for (const n of spec.b_nivaer) {
    const def = koder.get((n.rabattkod || '').trim());
    if (!def && n.rabattkod) continue; // befintliga BxGy-koder räknas inte här
    const kod = def ? { varianter: new Set(varianter.filter((v) => def.varianter.includes(v.titel)).map((v) => v.id).concat(pinnVariant)), ...kodBelopp(def, { standardOre, pinnOre, varianter }) } : null;
    for (const vald of varianter) {
      const v = fast ?? vald;
      const sida = sidPris(n, { variantOre: v.prisOre, standardOre, pinnOre });
      const korg = [{ variant: v.id, prisOre: v.prisOre, antal: n.antal }];
      if (Number(n.gratis_antal) > 0) korg.push({ variant: pinnVariant, prisOre: pinnOre, antal: Number(n.gratis_antal) });
      const kassa = kassaSumma(korg, kod);
      ut.push({ handle: n.handle, variant: fast ? `${vald.titel} vald → köper ${v.titel}` : v.titel, sida, kassa, ok: sida === kassa });
    }
  }
  return ut;
}

export function rabattMutation(def, { belopp, minsta }, { varianter, startsAt }) {
  return {
    query: `mutation($d: DiscountCodeBasicInput!) { discountCodeBasicCreate(basicCodeDiscount: $d) { codeDiscountNode { id } userErrors { field code message } } }`,
    variables: {
      d: {
        title: def.titel,
        code: def.kod,
        startsAt,
        context: { all: 'ALL' },
        customerGets: {
          value: { discountAmount: { amount: krText(belopp), appliesOnEachItem: false } },
          items: { products: { productVariantsToAdd: varianter } },
        },
        minimumRequirement: { subtotal: { greaterThanOrEqualToSubtotal: krText(minsta) } },
        combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: false },
        appliesOncePerCustomer: false,
      },
    },
  };
}

// ── planen ────────────────────────────────────────────────────────────────────────────────────────────

/**
 * lage = { mallar: {fil: text}, settings: text, nivaer: [{id?, handle, status?, fields}], koder: {kod: status|null} }
 * ctx  = { produktId, gratisProduktId, standardOre, pinnOre, varianter, pinnVariant }
 * Svar: { steg: [...], hinder: [...], skarptHinder: [...] }
 */
export function planPa(lage, spec, ctx) {
  const hinder = [...valideraSpec(spec, { ...ctx, befintliga: lage.nivaer })];
  const skarptHinder = [];
  const steg = [];
  const varde = lasTestRader(lage.settings);
  const aktiva = aktivaTest(varde);
  for (const t of aktiva) if (t !== spec.test) hinder.push(`testet "${t}" är aktivt — två test på samma köpruta blandar ihop varianterna; stäng av det först`);

  // 0. rabattkoder
  const definierade = new Map((spec.rabattkoder ?? []).map((d) => [d.kod, d]));
  const koder = [...new Set(spec.b_nivaer.map((n) => (n.rabattkod || '').trim()).filter(Boolean))];
  for (const kod of koder) {
    const status = lage.koder?.[kod] ?? null;
    if (status === 'ACTIVE') continue;
    if (status) { skarptHinder.push(`${kod} finns men har status ${status}`); continue; }
    const def = definierade.get(kod);
    if (!def) { skarptHinder.push(`${kod} finns inte som aktiv rabattkod i Shopify och specen definierar den inte — skapa den först`); continue; }
    if (ctx.standardOre == null) continue;
    const b = kodBelopp(def, ctx);
    const varianter = (ctx.varianter ?? []).filter((v) => def.varianter.includes(v.titel)).map((v) => v.gid);
    if (varianter.length !== def.varianter.length) { hinder.push(`${kod}: hittar inte varianterna ${def.varianter.join(', ')}`); continue; }
    varianter.push(ctx.pinnVariantGid);
    steg.push({ typ: 'kod', kod, belopp: b.belopp, minsta: b.minsta, mutation: rabattMutation(def, b, { varianter, startsAt: ctx.startsAt ?? new Date().toISOString() }) });
  }
  if (ctx.varianter && ctx.standardOre != null) {
    for (const r of sidaMotKassa(spec, ctx)) if (!r.ok) skarptHinder.push(`${r.handle} med ${r.variant}: sidan visar ${krText(r.sida)} kr men kassan tar ${krText(r.kassa)} kr`);
  }

  // 1. snippeten (före mallarna: fast_variant gör ingenting förrän B-blocket skickar den) och mallarna
  let fastId = null;
  if (spec.b_fast_variant) {
    const fv = (ctx.varianter ?? []).find((v) => v.titel === spec.b_fast_variant);
    if (!fv) hinder.push(`b_fast_variant "${spec.b_fast_variant}" finns inte bland produktens varianter`);
    else fastId = fv.id;
    if (lage.snippet == null) hinder.push(`${SNIPPET} lästes inte`);
    else {
      try {
        const ps = patchaSnippetFastVariant(lage.snippet);
        if (ps.byten.length) steg.push({ typ: 'mall', fil: SNIPPET, byten: ps.byten, text: ps.kod });
      } catch (e) { hinder.push(e.message); }
    }
  }
  const pp = patchaProduktJson(lage.mallar['templates/product.json'], spec, fastId);
  if (pp.byten.length) steg.push({ typ: 'mall', fil: 'templates/product.json', byten: pp.byten, text: pp.text });
  const pi = patchaIndexJson(lage.mallar['templates/index.json'], spec, fastId);
  if (pi.byten.length) steg.push({ typ: 'mall', fil: 'templates/index.json', byten: pi.byten, text: pi.text });
  const efterMallar = { ...lage.mallar, 'templates/product.json': pp.text, 'templates/index.json': pi.text };
  for (const r of renderUtanVariant(efterMallar)) hinder.push(`${r.fil} ${r.sektion}/${r.block ?? ''}: ms-paket renderas utan variant — den köprutan blir tom när A-nivåerna märks a`);

  // 2. B-nivåer
  for (const n of spec.b_nivaer) {
    const onskat = nivaFalt(n, { produktId: ctx.produktId, gratisProduktId: ctx.gratisProduktId, abVariant: spec.b_variant });
    const f = lage.nivaer.find((x) => x.handle === n.handle);
    const diff = faltDiff(f?.fields, onskat);
    // En ny post skickas utan tomma fält (en tom product_reference kan avvisas); en befintlig får "" för att tömma.
    if (!f || diff.length || f.status !== 'ACTIVE') steg.push({ typ: 'niva', handle: n.handle, id: f?.id, ny: !f, falt: f ? onskat : onskat.filter((x) => x.value !== ''), diff, status: 'ACTIVE' });
  }
  // 3. A-nivåer
  for (const h of spec.a_nivaer) {
    const f = lage.nivaer.find((x) => x.handle === h);
    if (!f) { hinder.push(`A-nivån ${h} finns inte`); continue; }
    if ((f.fields.ab_variant ?? '') !== 'a') steg.push({ typ: 'niva', handle: h, id: f.id, falt: [{ key: 'ab_variant', value: 'a' }], diff: [{ key: 'ab_variant', fore: f.fields.ab_variant ?? null, efter: 'a' }] });
  }
  // 4. settings
  const nytt = nyttTestVarde(varde, { test: spec.test, vikter: spec.vikter, pa: true });
  if (nytt !== varde) steg.push({ typ: 'settings', fore: varde, efter: nytt, text: bytTestRad(lage.settings, nytt) });
  return { steg, hinder, skarptHinder };
}

/**
 * Avstängningen. Ordningen väljs efter mallarna, och simuleringen bevisar varför:
 *  • finns en rendering av ms-paket UTAN variant (startsidan före --pa) tappar den nivåer märkta `a` ⇒ A-nivåerna
 *    tillbaka till tom FÖRST, settings sist (annars står den köprutan tom mellan stegen);
 *  • skickar alla renderingar en variant (läget efter --pa) visar B-blocket, så länge testet är på, både de
 *    tömda A-nivåerna och B-nivåerna — två "2 lådor" för B-besökaren. Då stängs settings FÖRST och A-nivåerna
 *    töms efteråt; varje mellanläge är rent, och slutläget är detsamma: testet av, ingen A-nivå kvar som `a`.
 */
export function planAv(lage, spec) {
  const niva = [];
  for (const h of spec.a_nivaer) {
    const f = lage.nivaer.find((x) => x.handle === h);
    if (f && (f.fields.ab_variant ?? '') !== '') niva.push({ typ: 'niva', handle: h, id: f.id, falt: [{ key: 'ab_variant', value: '' }], diff: [{ key: 'ab_variant', fore: f.fields.ab_variant, efter: '' }] });
  }
  const varde = lasTestRader(lage.settings);
  const nytt = nyttTestVarde(varde, { test: spec.test, vikter: spec.vikter, pa: false });
  const harRad = varde.split('\n').some((r) => r.replace(/^\s*#\s*/, '').split(':')[0].trim() === spec.test);
  const settings = harRad && nytt !== varde ? [{ typ: 'settings', fore: varde, efter: nytt, text: bytTestRad(lage.settings, nytt) }] : [];
  const utanVariant = renderUtanVariant(lage.mallar).length > 0;
  return { steg: utanVariant ? [...niva, ...settings] : [...settings, ...niva], hinder: [], skarptHinder: [], ordning: utanVariant ? 'nivåer först' : 'settings först' };
}

/** Ett steg applicerat på läget (för simuleringen och för tillbakaläsningens facit). */
export function tillampa(lage, s) {
  const ny = { ...lage, mallar: { ...lage.mallar }, nivaer: lage.nivaer.map((n) => ({ ...n, fields: { ...n.fields } })), koder: { ...(lage.koder ?? {}) } };
  if (s.typ === 'mall' && s.fil === SNIPPET) ny.snippet = s.text;
  else if (s.typ === 'mall') ny.mallar[s.fil] = s.text;
  if (s.typ === 'settings') ny.settings = s.text;
  if (s.typ === 'kod') ny.koder[s.kod] = 'ACTIVE';
  if (s.typ === 'niva') {
    let n = ny.nivaer.find((x) => x.handle === s.handle);
    if (!n) { n = { handle: s.handle, fields: {} }; ny.nivaer.push(n); }
    for (const { key, value } of s.falt) n.fields[key] = value === '' ? null : value;
    if (s.status) n.status = s.status;
  }
  return ny;
}

// ── vad kunden ser (simulering av Liquid + ms-ab.js) ──────────────────────────────────────────────────

export function synligt(lage, { sida, besokare, produktId, produktHandle }) {
  const fil = sida === 'index' ? 'templates/index.json' : 'templates/product.json';
  const aktiva = new Set(aktivaTest(lasTestRader(lage.settings)));
  const ut = [];
  for (const r of renderingar(lage.mallar[fil])) {
    if (r.produkt !== 'sidans' && r.produkt !== produktHandle) continue;
    const syns = r.test && aktiva.has(r.test) ? besokare === r.testVariant : !r.dold;
    if (!syns) continue;
    const nivaer = lage.nivaer.filter((n) => {
      if (n.status && n.status !== 'ACTIVE') return false;
      if (n.fields.produkt !== produktId) return false;
      const ab = String(n.fields.ab_variant ?? '').trim().toLowerCase();
      if (ab !== '' && ab !== r.variant) return false;
      if (r.mix && ab !== r.variant) return false;
      return true;
    });
    ut.push({ ...r, nivaer: nivaer.map((n) => n.handle), antal: nivaer.map((n) => Number(n.fields.antal)) });
  }
  return ut;
}

/** Invarianten: på produktsidan och startsidan ser både A- och B-besökare EN köpruta med nivåer, utan dubbla antal. */
export function kontrolleraLage(lage, { produktId, produktHandle }) {
  const fel = [];
  for (const sida of ['product', 'index']) for (const besokare of ['a', 'b']) {
    const s = synligt(lage, { sida, besokare, produktId, produktHandle }).filter((r) => r.nivaer.length);
    if (s.length === 0) fel.push(`${sida}/${besokare}: ingen köpruta med nivåer`);
    if (s.length > 1) fel.push(`${sida}/${besokare}: ${s.length} köprutor syns samtidigt`);
    const antal = s.flatMap((r) => r.antal);
    if (new Set(antal).size !== antal.length) fel.push(`${sida}/${besokare}: samma antal två gånger (${antal.join(', ')})`);
  }
  return fel;
}

/** Regeln för slutläget: testet av ⇒ ingen A-nivå kvar som `a`. */
export function slutlageFel(lage, spec) {
  const aktivt = aktivaTest(lasTestRader(lage.settings)).includes(spec.test);
  const fel = [];
  for (const h of spec.a_nivaer) {
    const ab = lage.nivaer.find((n) => n.handle === h)?.fields.ab_variant ?? '';
    if (!aktivt && ab === 'a') fel.push(`${h} är märkt a fast testet ${spec.test} är av`);
    if (aktivt && ab !== 'a') fel.push(`${h} är inte märkt a fast testet ${spec.test} är på`);
  }
  return fel;
}

// ── kundvyn ──────────────────────────────────────────────────────────────────────────────────────────

export function krUrText(t) {
  if (!t) return null;
  const s = String(t).replace(/[\s  ]/g, '').replace(/[^\d.,]/g, '');
  if (!s) return null;
  const m = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(s.replace(/[.,](?=\d{3}(\D|$))/g, ''));
  return m ? Number(`${m[1]}.${m[2] ?? '0'}`) : null;
}

/**
 * En sidvisning → { testAktivt, variant, rutor: [...], fel }.
 * avl = { cfg, attr, block: [{ ab, dold, sektion, nivaer: [{ rubrik, nu, forr }] }] }
 * facit = { a: [{rubrik, pris}], b: [{rubrik, pris}] } i visningsordning.
 */
export function tolkaKundvy(avl, { test, facit, tvingad = null }) {
  const fel = [];
  const tester = (avl.cfg?.tests ?? []).filter((t) => t.active !== false).map((t) => t.id);
  const testAktivt = tester.includes(test);
  const variant = avl.attr?.[test] ?? null;
  const synliga = (avl.block ?? []).filter((b) => !b.dold && b.nivaer.length && /main/.test(b.sektion ?? 'main'));
  if (synliga.length !== 1) fel.push(`${synliga.length} synliga köprutor i produktsektionen, väntade 1`);
  const rutor = (synliga[0]?.nivaer ?? []).map((n) => ({ rubrik: n.rubrik, pris: krUrText(n.nu), forr: krUrText(n.forr) }));
  const vantad = testAktivt ? (variant === 'b' ? 'b' : 'a') : 'a';
  if (!testAktivt && variant) fel.push(`testet är av men <html> bär data-ms-ab-${test}=${variant}`);
  if (testAktivt && !['a', 'b'].includes(variant)) fel.push(`testet är aktivt men ingen variant valdes (${variant})`);
  if (tvingad && testAktivt && variant !== tvingad) fel.push(`?ms_ab=${test}:${tvingad} gav variant ${variant}`);
  const f = facit[vantad] ?? [];
  const r = rutor.map((x) => x.rubrik).join(' | '), fr = f.map((x) => x.rubrik).join(' | ');
  if (r !== fr) fel.push(`variant ${vantad}: nivåerna "${r}", väntade "${fr}"`);
  for (let i = 0; i < Math.min(f.length, rutor.length); i++) {
    if (rutor[i].pris !== f[i].pris) fel.push(`${rutor[i].rubrik}: sidan visar ${rutor[i].pris} kr, väntade ${f[i].pris} kr`);
  }
  return { testAktivt, variant, vantad, rutor, fel };
}

// ══ nät ════════════════════════════════════════════════════════════════════════════════════════════

const Q_LAGE = `query($f: [String!]) {
  themes(first: 5, roles: [MAIN]) { nodes { id name role files(filenames: $f, first: 10) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }
  metaobjects(type: "ms_paketniva", first: 100) { nodes { id handle capabilities { publishable { status } } fields { key value } } }
  metaobjectDefinitionByType(type: "ms_paketniva") { capabilities { publishable { enabled } } }
}`;
const Q_ALLA_MALLAR = `query($id: ID!) { theme(id: $id) { files(filenames: ["templates/*.json", "sections/*.json"], first: 100) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`;
const Q_PRODUKT = `query($p: String!, $g: String!) {
  p: productByHandle(handle: $p) { id handle variants(first: 10) { nodes { id title price } } }
  g: productByHandle(handle: $g) { id handle variants(first: 1) { nodes { id title price } } }
}`;
const Q_KOD = `query($k: String!) { codeDiscountNodeByCode(code: $k) { id codeDiscount { __typename
  ... on DiscountCodeBasic { status title minimumRequirement { ... on DiscountMinimumSubtotal { greaterThanOrEqualToSubtotal { amount } } } customerGets { value { ... on DiscountAmount { amount { amount } appliesOnEachItem } } items { ... on DiscountProducts { productVariants(first: 10) { nodes { id } } } } } }
  ... on DiscountCodeBxgy { status title } ... on DiscountCodeFreeShipping { status title } ... on DiscountCodeApp { status title } } } }`;

async function hamtaLage(k, spec) {
  const d = await k.graphql(Q_LAGE, { f: [...MALLAR, SETTINGS, SNIPPET] });
  const tema = d.themes.nodes[0];
  if (!tema || tema.role !== 'MAIN') throw new Error('hittar inget tema med rollen MAIN');
  const filer = Object.fromEntries(tema.files.nodes.map((n) => [n.filename, n.body?.content]));
  for (const f of [...MALLAR, SETTINGS]) if (typeof filer[f] !== 'string') throw new Error(`${f} gick inte att läsa ur ${tema.name}`);
  let ovriga = {};
  try {
    const a = await k.graphql(Q_ALLA_MALLAR, { id: tema.id });
    ovriga = Object.fromEntries(a.theme.files.nodes.filter((n) => !MALLAR.includes(n.filename) && typeof n.body?.content === 'string').map((n) => [n.filename, n.body.content]));
  } catch (e) { ovriga = { __fel: e.message }; }
  const p = await k.graphql(Q_PRODUKT, { p: spec.produkt_handle, g: spec.gratis_produkt_handle });
  if (!p.p || !p.g) throw new Error(`produkten ${spec.produkt_handle} eller ${spec.gratis_produkt_handle} finns inte`);
  const koder = {};
  const detaljer = {};
  for (const kod of new Set([...spec.b_nivaer.map((n) => (n.rabattkod || '').trim()).filter(Boolean), ...(spec.rabattkoder ?? []).map((r) => r.kod)])) {
    const r = await k.graphql(Q_KOD, { k: kod });
    koder[kod] = r.codeDiscountNodeByCode?.codeDiscount?.status ?? null;
    detaljer[kod] = r.codeDiscountNodeByCode?.codeDiscount ?? null;
  }
  const varianter = p.p.variants.nodes.map((v) => ({ id: v.id.split('/').pop(), gid: v.id, titel: v.title, prisOre: ore(v.price) }));
  const standard = varianter.find((v) => v.titel === spec.standard_variant);
  if (!standard) throw new Error(`standardvarianten "${spec.standard_variant}" finns inte (${varianter.map((v) => v.titel).join(', ')})`);
  const pinne = p.g.variants.nodes[0];
  return {
    tema,
    publishable: d.metaobjectDefinitionByType?.capabilities?.publishable?.enabled ?? false,
    lage: { mallar: { 'templates/product.json': filer['templates/product.json'], 'templates/index.json': filer['templates/index.json'] }, settings: filer[SETTINGS], snippet: filer[SNIPPET] ?? null, nivaer: nivaerUr(d.metaobjects.nodes), koder },
    ovriga, koddetaljer: detaljer,
    ctx: { produktId: p.p.id, gratisProduktId: p.g.id, standardOre: standard.prisOre, pinnOre: ore(pinne.price), varianter, pinnVariant: pinne.id.split('/').pop(), pinnVariantGid: pinne.id },
  };
}

function skrivPlan(plan, { log, tema }) {
  log(`Tema: ${tema.name} (${tema.role}, ${tema.id})`);
  if (!plan.steg.length) log('Inget att ändra — läget är redan det önskade.');
  plan.steg.forEach((s, i) => {
    const nr = `${i + 1}.`;
    if (s.typ === 'kod') {
      log(`${nr} rabattkod ${s.kod}: discountCodeBasicCreate — ${krText(s.belopp)} kr av, minsta delsumma ${krText(s.minsta)} kr på ${s.mutation.variables.d.customerGets.items.products.productVariantsToAdd.join(', ')}`);
      log(`   mutation: ${s.mutation.query}`);
      log(`   variables: ${JSON.stringify(s.mutation.variables)}`);
    } else if (s.typ === 'mall') log(`${nr} ${s.fil}: ${s.byten.join('; ')}`);
    else if (s.typ === 'niva') {
      log(`${nr} metaobjekt ${s.handle}: ${s.ny ? 'NY (metaobjectUpsert, status ACTIVE)' : s.id ? 'metaobjectUpdate' : 'metaobjectUpsert'}`);
      for (const d of s.diff) log(`     ${d.key}: ${JSON.stringify(d.fore)} → ${JSON.stringify(d.efter)}`);
      if (!s.diff.length && s.status) log('     status → ACTIVE');
    } else if (s.typ === 'settings') log(`${nr} ${SETTINGS} ms_ab_tests: ${JSON.stringify(s.fore)} → ${JSON.stringify(s.efter)}`);
  });
  for (const h of plan.hinder) log(`❌ hinder: ${h}`);
  for (const h of plan.skarptHinder) log(`⛔ --skarpt vägras: ${h}`);
}

async function lasTillbakaFil(k, temaId, fil, vantat) {
  for (let forsok = 1; forsok <= 3; forsok++) {
    const r = await k.graphql(`query($id: ID!, $f: [String!]) { theme(id: $id) { files(filenames: $f, first: 1) { nodes { body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`, { id: temaId, f: [fil] });
    if (r.theme.files.nodes[0]?.body?.content === vantat) return true;
    if (forsok < 3) await new Promise((x) => setTimeout(x, 5000));
  }
  return false;
}

async function korSkarpt(k, { tema, plan, publishable, log }) {
  const backup = join(OUTPUT, 'tema-original', new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-'));
  for (const s of plan.steg) {
    const rad = { tid: new Date().toISOString(), typ: s.typ };
    if (s.typ === 'kod') {
      const r = await k.graphql(s.mutation.query, s.mutation.variables);
      const las = await k.graphql(Q_KOD, { k: s.kod });
      const c = las.codeDiscountNodeByCode?.codeDiscount;
      const belopp = c?.customerGets?.value?.amount?.amount, minsta = c?.minimumRequirement?.greaterThanOrEqualToSubtotal?.amount;
      if (!c || ore(belopp) !== s.belopp || ore(minsta) !== s.minsta) throw new Error(`${s.kod}: läses inte tillbaka rätt (${belopp} / ${minsta})`);
      log(`✅ ${s.kod} skapad (${r.discountCodeBasicCreate.codeDiscountNode.id}), tillbakaläst ${belopp} kr av från ${minsta} kr, status ${c.status}`);
      Object.assign(rad, { kod: s.kod, id: r.discountCodeBasicCreate.codeDiscountNode.id });
    } else if (s.typ === 'mall' || s.typ === 'settings') {
      const fil = s.typ === 'mall' ? s.fil : SETTINGS;
      const fore = await k.graphql(`query($id: ID!, $f: [String!]) { theme(id: $id) { files(filenames: $f, first: 1) { nodes { body { ... on OnlineStoreThemeFileBodyText { content } } } } } }`, { id: tema.id, f: [fil] });
      const p = join(backup, fil); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, fore.theme.files.nodes[0].body.content);
      const r = await k.graphql(`mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { filename code message } } }`, { id: tema.id, files: [{ filename: fil, body: { type: 'TEXT', value: s.text } }] });
      if (r.themeFilesUpsert.userErrors?.length) throw new Error(`${fil}: ${JSON.stringify(r.themeFilesUpsert.userErrors)}`);
      if (!(await lasTillbakaFil(k, tema.id, fil, s.text))) throw new Error(`${fil} läses inte tillbaka identiskt (tre försök) — originalet ligger i ${backup}`);
      log(`✅ ${fil} skriven och tillbakaläst (original i ${backup})`);
      Object.assign(rad, { fil, ...(s.typ === 'settings' ? { fore: s.fore, efter: s.efter } : { byten: s.byten }) });
    } else if (s.typ === 'niva') {
      const input = { fields: s.falt };
      if (s.status && publishable) input.capabilities = { publishable: { status: 'ACTIVE' } };
      const r = s.id
        ? await k.graphql(`mutation($id: ID!, $m: MetaobjectUpdateInput!) { metaobjectUpdate(id: $id, metaobject: $m) { metaobject { id } userErrors { field code message } } }`, { id: s.id, m: input })
        : await k.graphql(`mutation($h: MetaobjectHandleInput!, $m: MetaobjectUpsertInput!) { metaobjectUpsert(handle: $h, metaobject: $m) { metaobject { id } userErrors { field code message } } }`, { h: { type: 'ms_paketniva', handle: s.handle }, m: input });
      const las = await k.graphql(`query($h: MetaobjectHandleInput!) { metaobjectByHandle(handle: $h) { id capabilities { publishable { status } } fields { key value } } }`, { h: { type: 'ms_paketniva', handle: s.handle } });
      const f = Object.fromEntries((las.metaobjectByHandle?.fields ?? []).map((x) => [x.key, x.value]));
      const avvik = faltDiff(f, s.falt);
      if (avvik.length || (s.status && publishable && las.metaobjectByHandle?.capabilities?.publishable?.status !== 'ACTIVE')) throw new Error(`${s.handle} läses inte tillbaka rätt: ${JSON.stringify(avvik)}`);
      log(`✅ ${s.handle} skriven och tillbakaläst`);
      Object.assign(rad, { handle: s.handle, diff: s.diff, id: (r.metaobjectUpdate ?? r.metaobjectUpsert).metaobject.id });
    }
    appendFileSync(LOGG, JSON.stringify(rad) + '\n');
  }
}

async function startaChromium() {
  let pw;
  try { pw = await import(PLAYWRIGHT); } catch (e) { throw new Error(`Playwright saknas (${e.message.split('\n')[0]})`); }
  const exe = CHROME_KANDIDATER.find((p) => existsSync(p));
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  return pw.chromium.launch({ headless: true, executablePath: exe, args: ['--no-sandbox', '--ignore-certificate-errors'], proxy });
}

function lasSidan() {
  let cfg = null;
  try { cfg = JSON.parse(document.getElementById('ms-ab-config').textContent); } catch (e) { cfg = { fel: String(e) }; }
  const attr = {};
  for (const a of document.documentElement.attributes) if (a.name.startsWith('data-ms-ab-')) attr[a.name.slice(11)] = a.value;
  const text = (el, s) => el.querySelector(s)?.textContent.replace(/\s+/g, ' ').trim() ?? null;
  const block = [...document.querySelectorAll('ms-paket')].map((el) => ({
    ab: el.closest('[data-ms-ab]')?.getAttribute('data-ms-ab') ?? null,
    dold: el.closest('[hidden]') !== null || el.offsetParent === null,
    sektion: el.closest('[id^="shopify-section"]')?.id ?? null,
    nivaer: [...el.querySelectorAll('.ms-paket__opt')].map((o) => ({ handle: o.querySelector('input')?.value, rubrik: text(o, '.ms-paket__rubrik'), under: text(o, '.ms-paket__under'), bricka: text(o, '.ms-paket__bricka'), nu: text(o, '[data-ms-paket-nu]'), forr: text(o, '[data-ms-paket-forr]'), gava: text(o, '.ms-paket__gava-text'), vald: o.querySelector('input')?.checked ?? false })),
  }));
  return { cfg, attr, block, lang: document.documentElement.lang, url: location.href };
}

async function kundvy({ spec, facit, log, ut }) {
  const browser = await startaChromium();
  mkdirSync(ut, { recursive: true });
  const resultat = [];
  const besok = [
    { namn: 'ny besökare 1' }, { namn: 'ny besökare 2' }, { namn: 'ny besökare 3' },
    { namn: `tvingad ${spec.test}:a`, tvingad: 'a' }, { namn: `tvingad ${spec.test}:b`, tvingad: 'b' },
  ];
  try {
    for (const [i, b] of besok.entries()) {
      const ctx = await browser.newContext({ viewport: { width: 430, height: 932 }, locale: 'sv-SE', ignoreHTTPSErrors: true });
      const page = await ctx.newPage();
      const url = `${PRODUKTSIDA}?country=SE${b.tvingad ? `&ms_ab=${spec.test}:${b.tvingad}` : ''}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForSelector('ms-paket .ms-paket__opt', { timeout: 30000 }).catch(() => {});
      await page.waitForTimeout(1500);
      const avl = await page.evaluate(lasSidan);
      const tolk = tolkaKundvy(avl, { test: spec.test, facit, tvingad: b.tvingad ?? null });
      const synlig = page.locator('ms-paket:visible').first();
      const bild = join(ut, `${i + 1}-${b.tvingad ? `tvingad-${b.tvingad}` : 'ny'}.png`);
      try { await synlig.scrollIntoViewIfNeeded({ timeout: 5000 }); await synlig.screenshot({ path: bild, timeout: 10000 }); } catch { await page.screenshot({ path: bild }); }
      resultat.push({ ...b, url, avl, tolk, bild });
      log(`\n${b.namn}: ${url}`);
      log(`  #ms-ab-config tests: ${JSON.stringify(avl.cfg?.tests ?? avl.cfg)} · lang=${avl.lang} · <html> ${Object.entries(avl.attr).map(([t, v]) => `data-ms-ab-${t}=${v}`).join(' ') || '(ingen testvariant)'}`);
      log(`  test ${spec.test}: ${tolk.testAktivt ? `AKTIVT, variant ${tolk.variant}` : 'inget test aktivt'} ⇒ väntad köpruta ${tolk.vantad.toUpperCase()}`);
      for (const bl of avl.block) log(`  ms-paket ${bl.sektion} ${bl.ab ?? '(utan omslag)'} ${bl.dold ? 'DOLD' : 'SYNS'}: ${bl.nivaer.map((n) => `${n.bricka ? `[${n.bricka}] ` : ''}${n.rubrik} ${n.nu}${n.forr ? ` (förr ${n.forr})` : ''}${n.vald ? ' ●' : ''}`).join(' | ') || '—'}`);
      log(`  ${tolk.fel.length ? `❌ ${tolk.fel.join(' · ')}` : '✅ köprutan är den väntade'} · skärmdump ${bild}`);
      await ctx.close();
    }
  } finally { await browser.close(); }
  const varianter = resultat.slice(0, 3).map((r) => r.tolk.variant ?? '—');
  log(`\nTre nya besökare fick: ${varianter.join(', ')}`);
  return resultat;
}

/** En anonym varukorg per nivå med kod: /discount/<kod> → /cart/add.js → /cart.js. Ingen order, ingen kassa. */
async function kassaprov({ nivaer, ctx, log }) {
  const browser = await startaChromium();
  const ut = [];
  try {
    for (const n of nivaer) {
      const c = await browser.newContext({ locale: 'sv-SE', ignoreHTTPSErrors: true });
      const page = await c.newPage();
      await page.goto(`${PRODUKTSIDA}?country=SE`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      const standard = ctx.varianter.find((v) => v.prisOre === ctx.standardOre);
      const varor = [{ id: Number(standard.id), quantity: n.antal }];
      if (Number(n.gratis_antal) > 0) varor.push({ id: Number(ctx.pinnVariant), quantity: Number(n.gratis_antal) });
      const vagn = await page.evaluate(async ({ kod, varor }) => {
        if (kod) await fetch(`/discount/${encodeURIComponent(kod)}?redirect=${encodeURIComponent('/cart.js')}`, { credentials: 'same-origin' });
        const add = await fetch('/cart/add.js', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ items: varor }) });
        if (!add.ok) return { fel: await add.text() };
        return (await fetch('/cart.js', { credentials: 'same-origin', headers: { Accept: 'application/json' } })).json();
      }, { kod: n.rabattkod || '', varor });
      const summa = vagn.total_price != null ? vagn.total_price / 100 : null;
      const ok = summa === Number(n.fastpris);
      log(`${ok ? '✅' : '❌'} ${n.handle} (${n.rabattkod || 'ingen kod'}): ${varor.map((v) => `${v.quantity} × ${v.id}`).join(' + ')} ⇒ korgen ${summa ?? vagn.fel} ${vagn.currency ?? ''} · koder ${JSON.stringify(vagn.discount_codes ?? [])} · väntat ${n.fastpris}`);
      ut.push({ handle: n.handle, kod: n.rabattkod, summa, ok });
      await c.close();
    }
  } finally { await browser.close(); }
  return ut;
}

async function huvud() {
  const arg = process.argv.slice(2);
  const skarpt = arg.includes('--skarpt');
  const specFil = arg.includes('--spec') ? arg[arg.indexOf('--spec') + 1] : STANDARD_SPEC;
  const spec = lasSpec(specFil);
  const log = (s) => console.log(s);
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  const k = await skapaKlient(lasButik('matstrumpor'));
  const L = await hamtaLage(k, spec);
  log(`Spec: ${specFil}`);
  log(`Priser live: ${L.ctx.varianter.map((v) => `${v.titel} ${krText(v.prisOre)} kr`).join(', ')} · ätpinnar ${krText(L.ctx.pinnOre)} kr · metaobjekten publishable: ${L.publishable}`);
  log(`Rabattkoder: ${Object.entries(L.lage.koder).map(([kod, s]) => `${kod} ${s ?? 'FINNS INTE'}`).join(', ')}`);
  log(`ms_ab_tests nu: ${JSON.stringify(lasTestRader(L.lage.settings))} (aktiva: ${aktivaTest(lasTestRader(L.lage.settings)).join(', ') || 'inga'})`);
  if (L.ovriga.__fel) log(`⚠️ övriga mallar gick inte att läsa (${L.ovriga.__fel}) — bara product.json och index.json är kontrollerade`);
  const aFacit = spec.a_nivaer.map((h) => L.lage.nivaer.find((n) => n.handle === h)).filter(Boolean)
    .map((n) => ({ rubrik: n.fields.rubrik, pris: Number(n.fields.fastpris) }));
  const bFacit = spec.b_nivaer.map((n) => ({ rubrik: n.rubrik, pris: sidPris(n, { variantOre: L.ctx.standardOre, standardOre: L.ctx.standardOre, pinnOre: L.ctx.pinnOre }) / 100 }));

  if (arg.includes('--kundvy')) {
    const ut = arg.includes('--ut') ? arg[arg.indexOf('--ut') + 1] : join(OUTPUT, `kundvy-paket-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}`);
    const r = await kundvy({ spec, facit: { a: aFacit, b: bFacit }, log, ut });
    process.exitCode = r.some((x) => x.tolk.fel.length) ? 1 : 0;
    return;
  }
  if (arg.includes('--kassaprov')) {
    const vilka = arg.includes('--a') ? spec.a_nivaer.map((h) => L.lage.nivaer.find((n) => n.handle === h)).map((n) => ({ handle: n.handle, antal: Number(n.fields.antal), gratis_antal: Number(n.fields.gratis_antal), rabattkod: n.fields.rabattkod, fastpris: Number(n.fields.fastpris) }))
      : spec.b_nivaer.filter((n) => !n.rabattkod || L.lage.koder[n.rabattkod] === 'ACTIVE');
    const hoppade = spec.b_nivaer.filter((n) => n.rabattkod && L.lage.koder[n.rabattkod] !== 'ACTIVE');
    if (!arg.includes('--a')) for (const n of hoppade) log(`— ${n.handle}: ${n.rabattkod} finns inte i Shopify än, ingen korg att prova`);
    const r = await kassaprov({ nivaer: vilka, ctx: L.ctx, log });
    process.exitCode = r.every((x) => x.ok) ? 0 : 1;
    return;
  }
  const pa = arg.includes('--pa'), av = arg.includes('--av');
  if (pa === av) { log('Ange --pa eller --av (eller --kundvy / --kassaprov).'); process.exitCode = 2; return; }
  const plan = pa ? planPa(L.lage, spec, L.ctx) : planAv(L.lage, spec);
  if (pa) for (const r of renderUtanVariant(L.ovriga.__fel ? {} : L.ovriga)) plan.hinder.push(`${r.fil} ${r.sektion}/${r.block ?? ''}: ms-paket renderas utan variant — den köprutan blir tom när A-nivåerna märks a`);
  if (pa && L.ctx.varianter) {
    log('\nSida mot kassa per variant (nivåer med kod som specen skapar):');
    for (const r of sidaMotKassa(spec, L.ctx)) log(`  ${r.ok ? '✅' : '❌'} ${r.handle} ${r.variant}: sidan ${krText(r.sida)} kr, kassan ${krText(r.kassa)} kr`);
  }
  log(`\n${pa ? 'PÅ' : 'AV'} — ${skarpt ? 'SKARPT' : 'torrt (--skarpt skriver)'}`);
  skrivPlan(plan, { log, tema: L.tema });
  // Simuleringen: varje mellanläge ska visa en köpruta för både A och B, på produktsidan och startsidan.
  let lage = L.lage;
  const sim = { produktId: L.ctx.produktId, produktHandle: spec.produkt_handle };
  const simFel = [];
  for (const [i, s] of plan.steg.entries()) { lage = tillampa(lage, s); for (const f of kontrolleraLage(lage, sim)) simFel.push(`efter steg ${i + 1}: ${f}`); }
  for (const f of slutlageFel(lage, spec)) simFel.push(`slutläget: ${f}`);
  log(simFel.length ? simFel.map((f) => `❌ simulering: ${f}`).join('\n') : `✅ simulering: alla ${plan.steg.length} mellanlägen visar en köpruta för A och B på produktsidan och startsidan; slutläget följer regeln`);
  if (pa && !plan.hinder.length && !plan.skarptHinder.length && !simFel.length) log('✅ inget stoppar --skarpt (körs bara på Axels ok)');
  if (!pa) {
    for (const v of ['a', 'b']) for (const sida of ['product', 'index']) log(`   efter --av, ${sida}, besökare ${v}: ${synligt(lage, { sida, besokare: v, ...sim }).filter((r) => r.nivaer.length).map((r) => r.nivaer.join(', ')).join(' / ')}`);
  } else {
    for (const v of ['a', 'b']) for (const sida of ['product', 'index']) log(`   efter --pa, ${sida}, besökare ${v}: ${synligt(lage, { sida, besokare: v, ...sim }).filter((r) => r.nivaer.length).map((r) => r.nivaer.join(', ')).join(' / ')}`);
  }
  if (!skarpt) return;
  if (plan.hinder.length || plan.skarptHinder.length || simFel.length) { log('\n⛔ Skriver ingenting: hinder ovan.'); process.exitCode = 1; return; }
  await korSkarpt(k, { tema: L.tema, plan, publishable: L.publishable, log });
  log('\nKlart. Kör --kundvy för att se sidan som kund.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
}
