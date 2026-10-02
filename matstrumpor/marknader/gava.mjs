// gava.mjs — gåvan följer varje låda (Matstrumpor).
//
// Axel 2026-10-02: "ätpinnar ska alltid vara en gratis gåva som följer med varje enskild box" — också
// när kunden ändrar antalet i varukorgen ("JAg har redan asvarat A Och B": S-025 val B, b-koder.mjs).
//
// Felet, mätt samma dag i Shopifys egen prisräkning (Storefront-API:ts cart, dolda testkoder) och i
// ordrarna 2026-08-03–10-02 (627 ordrar med lådor):
//   - Paketkoderna i variant A, utlandet och donut/pizza/hamburgare (SUSHI-K1F1, SUSHI-K2F2 …) är
//     "köp 1, få 3 av [sorten + ätpinnar]", EN gång per order. Shopify ger de billigaste varorna gratis
//     först, och ger en köp-X-få-Y bara när hela "få"-mängden finns i vagnen.
//   - Samma paket två gånger: 4 lådor + 4 par kostade 1 646 kr i stället för 798 (ätpinnarna åt upp
//     den gratis lådan). Två olika sorter: #5214 betalade 1 746 kr för 2 sushi + 2 pizza, #5302 2 094 kr
//     för tre tvåpaket — bara en kod räknas, och den andra sortens ätpinnar åt upp den gratis lådan.
//   - Ändrat antal: en tredje låda fick inga ätpinnar. Borttagna ätpinnar: hela paketrabatten försvann
//     (#5255 i USA betalade två lådor fullt).
//   - Variant B (Sverige): SUSHI-2FOR499 och SUSHI-4FOR799 har en minsta summa. Med färre lådor än
//     paketet gäller koden inte alls, och ätpinnarna kostar 50 kr.
//
// Rättningen, båda delarna prövade med dolda testkoder innan något riktigt rördes:
//   1. KODERNA: de åtta köp-X-få-Y-paketkoderna blir "köp 1, få 3 av [alla fyra sorter + ätpinnar]",
//      utan gräns per order. Med ett par ätpinnar per låda ger det köp 1 få 1 och gratis ätpinnar för
//      varje JÄMNT antal lådor, i alla sorter blandat och i alla valutor (procent, inte belopp). Udda
//      antal kräver en egen kod per antal, för Shopify ger aldrig en halv "få"-mängd: PAKET-1, PAKET-3 och
//      PAKET-5 (köp k+1, få 3k+1, en gång per order). Koderna heter som förut, så kassan visar samma namn.
//   2. TEMAT: assets/ms-gava.js håller vagnen i takt efter varje ändring: ätpinnarna = lådorna, och
//      koderna som hör ihop ligger i vagnen tillsammans (en paketkod + PAKET-1/3/5, eller B-nivåernas
//      tre). Shopify väljer själv den som ger lägst pris, och kassan visar bara den som används (mätt).
//      Shopify räknar högst fem koder per vagn (mätt: en sjätte räknas inte), så vännens kod läggs först.
//      Gåvoraden går inte att ändra eller ta bort i korgen. Paketväljaren synkar direkt efter köpet.
//
//   node matstrumpor/marknader/gava.mjs                            # torrt: planen för koderna och temat (MAIN)
//   node matstrumpor/marknader/gava.mjs --koder --skarpt           # koderna (originalen sparas i gava/koder.json först)
//   node matstrumpor/marknader/gava.mjs --kopia                    # en färsk kopia av MAIN att prova i
//   node matstrumpor/marknader/gava.mjs --tema <gid> --skarpt      # temat i kopian; utan --tema: MAIN
//   node matstrumpor/marknader/gava.mjs --kundvy [--tema <gid>]    # Chromium som kund: paket, ändra antal, ta bort, två paket
//   node matstrumpor/marknader/gava.mjs --aterstall --skarpt [--tema <gid>]   # koderna och temat som före
//
// Idempotent. Exakta träffar — en sökning med fel antal träffar stoppar skriptet, det byter aldrig "nästan rätt".

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = dirname(fileURLToPath(import.meta.url));
export const GAVA_DIR = join(HAR, 'gava');
const KODER_FIL = join(GAVA_DIR, 'koder.json');
const ORIGINAL = join(GAVA_DIR, 'original');
const OUTPUT = join(HAR, 'output', 'gava');

export const MAX_KODER = 5;
/** Udda antal lådor: köp k+1, få 3k+1 (N = 2k+1 lådor + N par). Mätt exakt för N = 1, 3, 5 (och 7). */
export function uddaKod(n) {
  if (!(n % 2 === 1 && n > 0)) throw new Error(`udda antal krävs (${n})`);
  const k = (n - 1) / 2;
  return { kod: `PAKET-${n}`, kop: k + 1, fa: 3 * k + 1, n };
}
export const UDDA = [1, 3, 5].map(uddaKod);
export const E_KOP = 1;
export const E_FA = 3;

// ---------------------------------------------------------------------------
// Shopifys köp-X-få-Y som modell — MÄTT 2026-10-02 (gava.mjs-prov 3–5), inte gissat:
//   - "köp"-varorna är de dyraste som finns kvar, "få"-varorna de billigaste som finns kvar;
//   - en användning gäller bara när HELA "få"-mängden finns (3 lådor + 3 par med köp 1 få 3 utan gräns
//     gav 1 197 kr, alltså ingen halv andra användning);
//   - flera koder som inte kombineras: Shopify väljer den som ger lägst pris (ordningen spelar ingen roll).
// ---------------------------------------------------------------------------

/** Ren: rabatten (öre) en köp-X-få-Y ger på varorna (priser i öre). grans = användningar per order (null = utan gräns). */
export function bxgyRabatt(priser, { kop, fa, grans = null }, arKopbar = () => true) {
  const kvar = priser.map((p, i) => ({ p, i, kopbar: arKopbar(i) }));
  let rabatt = 0;
  let anv = 0;
  for (;;) {
    if (grans !== null && anv >= grans) break;
    const kopa = kvar.filter((x) => x.kopbar).sort((a, b) => b.p - a.p).slice(0, kop);
    if (kopa.length < kop) break;
    const ovriga = kvar.filter((x) => !kopa.includes(x)).sort((a, b) => a.p - b.p);
    if (ovriga.length < fa) break;
    const gratis = ovriga.slice(0, fa);
    rabatt += gratis.reduce((s, x) => s + x.p, 0);
    for (const x of [...kopa, ...gratis]) kvar.splice(kvar.indexOf(x), 1);
    anv++;
  }
  return rabatt;
}

/** Ren: priset för N lådor + M par med den bästa av koderna (E utan gräns + udda-koderna). */
export function bastaPris({ lador, par, ladaPris, parPris, koder = [{ kop: E_KOP, fa: E_FA, grans: null }, ...UDDA.map((u) => ({ kop: u.kop, fa: u.fa, grans: 1 }))] }) {
  const priser = [...Array(lador).fill(ladaPris), ...Array(par).fill(parPris)];
  const brutto = priser.reduce((s, p) => s + p, 0);
  const basta = Math.max(0, ...koder.map((k) => bxgyRabatt(priser, k, (i) => i < lador)));
  return brutto - basta;
}

// ---------------------------------------------------------------------------
// Temat: patchar (rena, idempotenta, och var och en går att backa)
// ---------------------------------------------------------------------------

/** Byter EXAKT `sok` mot `ersatt`, kräver exakt `antal` träffar. */
export function bytExakt(kod, sok, ersatt, antal = 1) {
  const traffar = kod.split(sok).length - 1;
  if (traffar !== antal) throw new Error(`"${sok.slice(0, 60).replace(/\n/g, '⏎')}" hittades ${traffar} gånger, väntade ${antal}`);
  return kod.split(sok).join(ersatt);
}

export const MARKE = 'ms-gava:';

const HEAD_SOK = `<script src="{{ 'ms-paket.js' | asset_url }}" defer></script>`;
const HEAD_TILLAGG = `\n{%- comment -%} ${MARKE} gåvan följer varje låda — matstrumpor/marknader/gava.mjs {%- endcomment -%}\n{% render 'ms-gava' %}`;

const PAKET_SOK = `        return self.fastKod(rutt, kod);
      }).then(function () {
        // 3. Lådan, färsk, med det rabatterade priset.`;
const PAKET_TILLAGG = `
      }).then(function () {
        // ${MARKE} gåvan följer lådorna — ätpinnarna lika många som lådorna och paketkoderna kompletta
        // (assets/ms-gava.js, matstrumpor/marknader/gava.mjs). Ett fel här stoppar aldrig köpet.
        var gava = window.MS && window.MS.gava;
        return gava && typeof gava.synka === 'function' ? gava.synka({ tyst: true, behall: kod }).catch(function () { return null; }) : null;`;

const FOR_SOK = '{%- for item in cart.items -%}';
const GAVA_BLOCK = `
                      {%- comment -%} ${MARKE} gåvoraden går inte att ändra eller ta bort — den följer lådorna (matstrumpor/marknader/gava.mjs) {%- endcomment -%}
                      {%- liquid
                        assign ms_gava_rad = false
                        for ms_n in shop.metaobjects.ms_paketniva.values
                          if ms_n.gratis_produkt.value.id == item.product_id
                            assign ms_gava_rad = true
                            break
                          endif
                        endfor
                      -%}`;

const LADA_VILLKOR = '{% if item.instructions and item.instructions.can_update_quantity == false %}';
const LADA_VILLKOR_NY = '{% if ms_gava_rad or item.instructions and item.instructions.can_update_quantity == false %}';
const LADA_TA_BORT = 'id="CartDrawer-Remove-{{ item.index | plus: 1 }}"';
const LADA_TA_BORT_NY = `${LADA_TA_BORT}\n                                {% if ms_gava_rad %}class="hidden"{% endif %}`;

const SIDA_ANTAL = '{% assign can_update_quantity = item.instructions.can_update_quantity | default: true %}';
const SIDA_ANTAL_NY = `${SIDA_ANTAL}{% if ms_gava_rad %}{% assign can_update_quantity = false %}{% endif %}`;
const SIDA_TA_BORT = '{% assign can_remove = item.instructions.can_remove | default: true %}';
const SIDA_TA_BORT_NY = `${SIDA_TA_BORT}{% if ms_gava_rad %}{% assign can_remove = false %}{% endif %}`;

function patch(kod, steg, harMarke) {
  if (harMarke(kod)) return { kod, byten: [], hoppade: ['redan patchad'] };
  const byten = [];
  for (const [sok, ny, antal, namn] of steg) { kod = bytExakt(kod, sok, ny, antal); byten.push(namn); }
  return { kod, byten, hoppade: [] };
}
function avpatch(kod, steg, harMarke) {
  if (!harMarke(kod)) return { kod, byten: [], hoppade: ['inte patchad'] };
  const byten = [];
  for (const [sok, ny, antal, namn] of [...steg].reverse()) { kod = bytExakt(kod, ny, sok, antal); byten.push(`bort: ${namn}`); }
  return { kod, byten, hoppade: [] };
}

const STEG = {
  'snippets/ms-head.liquid': {
    steg: [[HEAD_SOK, HEAD_SOK + HEAD_TILLAGG, 1, "{% render 'ms-gava' %} efter ms-paket.js"]],
    marke: (k) => k.includes("{% render 'ms-gava' %}"),
  },
  'assets/ms-paket.js': {
    steg: [[PAKET_SOK, PAKET_SOK.replace(`        return self.fastKod(rutt, kod);`, `        return self.fastKod(rutt, kod);${PAKET_TILLAGG}`), 1, 'kop(): MS.gava.synka efter koden, före lådan']],
    marke: (k) => k.includes('gava.synka({ tyst: true, behall: kod })'),
  },
  'snippets/cart-drawer.liquid': {
    steg: [
      [FOR_SOK, FOR_SOK + GAVA_BLOCK, 1, 'ms_gava_rad per rad'],
      [LADA_VILLKOR, LADA_VILLKOR_NY, 3, 'gåvoradens − / antal / + låsta'],
      [LADA_TA_BORT, LADA_TA_BORT_NY, 1, 'gåvoradens ta bort-knapp dold'],
    ],
    marke: (k) => k.includes(`${MARKE} gåvoraden`),
  },
  'sections/main-cart-items.liquid': {
    steg: [
      [FOR_SOK, FOR_SOK + GAVA_BLOCK, 1, 'ms_gava_rad per rad'],
      [SIDA_ANTAL, SIDA_ANTAL_NY, 1, 'gåvoradens antal låst'],
      [SIDA_TA_BORT, SIDA_TA_BORT_NY, 1, 'gåvoradens ta bort-knapp dold'],
    ],
    marke: (k) => k.includes(`${MARKE} gåvoraden`),
  },
};
export const PATCHADE_FILER = Object.keys(STEG);
export const NYA_FILER = ['assets/ms-gava.js', 'snippets/ms-gava.liquid'];

export function patcha(fil, kod) { const s = STEG[fil]; return patch(kod, s.steg, s.marke); }
export function avpatcha(fil, kod) { const s = STEG[fil]; return avpatch(kod, s.steg, s.marke); }

/** De nya filerna, ur repot. Udda-koderna skrivs in i snippeten. */
export function nyaFiler() {
  const js = readFileSync(join(GAVA_DIR, 'ms-gava.js'), 'utf8');
  const liquid = readFileSync(join(GAVA_DIR, 'ms-gava.liquid'), 'utf8').replace('__UDDA__', JSON.stringify(UDDA.map((u) => u.kod)));
  return { 'assets/ms-gava.js': js, 'snippets/ms-gava.liquid': liquid };
}

export function giltigJs(kod) { try { new Function(kod); return true; } catch { return false; } }

// ---------------------------------------------------------------------------
// Shopify (bara i CLI)
// ---------------------------------------------------------------------------

async function klient() {
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  return skapaKlient(lasButik('matstrumpor'));
}
const paus = (ms) => new Promise((r) => setTimeout(r, ms));

const KOD_FALT = `__typename
  ... on DiscountCodeBxgy { title status usesPerOrderLimit combinesWith { orderDiscounts productDiscounts shippingDiscounts } codes(first: 2) { nodes { code } }
    customerBuys { value { ... on DiscountQuantity { quantity } } items { ... on DiscountProducts { products(first: 20) { nodes { id handle } } productVariants(first: 5) { nodes { id } } } ... on AllDiscountItems { allItems } } }
    customerGets { value { ... on DiscountOnQuantity { quantity { quantity } effect { __typename ... on DiscountPercentage { percentage } } } } items { ... on DiscountProducts { products(first: 20) { nodes { id handle } } productVariants(first: 5) { nodes { id } } } ... on AllDiscountItems { allItems } } } }
  ... on DiscountCodeBasic { title status }`;

async function lasKod(k, kod) {
  const d = await k.graphql(`query($c: String!) { codeDiscountNodeByCode(code: $c) { id codeDiscount { ${KOD_FALT} } } }`, { c: kod });
  const n = d.codeDiscountNodeByCode;
  return n ? { id: n.id, ...n.codeDiscount } : null;
}

async function lasNivaer(k) {
  const d = await k.graphql(`{ metaobjects(type: "ms_paketniva", first: 100) { nodes { id handle fields { key value } } } }`);
  return d.metaobjects.nodes.map((n) => ({ id: n.id, handle: n.handle, ...Object.fromEntries(n.fields.map((f) => [f.key, f.value])) }));
}

/** Köp-X-få-Y-paketkoderna som ska bli E: nivåer med gratislådor, en gåva, och en AKTIV köp-X-få-Y-kod. */
async function eKoder(k) {
  const nivaer = await lasNivaer(k);
  const ut = [];
  for (const n of nivaer.filter((x) => Number(x.bogo_gratis) > 0 && x.rabattkod && x.gratis_produkt)) {
    const kod = await lasKod(k, n.rabattkod);
    if (kod?.__typename !== 'DiscountCodeBxgy' || kod.status !== 'ACTIVE') continue;
    if (!ut.some((u) => u.kod === n.rabattkod)) ut.push({ kod: n.rabattkod, niva: n.handle, produkt: n.produkt, gava: n.gratis_produkt, lest: kod });
  }
  const sorter = [...new Set(ut.map((u) => u.produkt))];
  const gavor = [...new Set(ut.map((u) => u.gava))];
  if (gavor.length !== 1) throw new Error(`väntade EN gåva i paketen, fann ${gavor.length}`);
  return { koder: ut, sorter, gava: gavor[0] };
}

const ids = (items) => (items?.products?.nodes ?? []).map((p) => p.id);

/** Ren: skiljer sig koden från målet (köp 1, få 3, utan gräns, alla sorter + gåvan, 100 %)? */
export function eAvvikelse(kod, { sorter, gava, kop = E_KOP, fa = E_FA, grans = null }) {
  const fel = [];
  const kopIds = ids(kod.customerBuys.items);
  const faIds = ids(kod.customerGets.items);
  if (String(kod.customerBuys.value.quantity) !== String(kop)) fel.push(`köp ${kod.customerBuys.value.quantity} ≠ ${kop}`);
  if (String(kod.customerGets.value.quantity.quantity) !== String(fa)) fel.push(`få ${kod.customerGets.value.quantity.quantity} ≠ ${fa}`);
  if (Number(kod.customerGets.value.effect.percentage) !== 1) fel.push('få-varorna inte 100 %');
  if ((kod.usesPerOrderLimit ?? null) !== grans) fel.push(`gräns ${kod.usesPerOrderLimit} ≠ ${grans}`);
  const kopSaknas = sorter.filter((s) => !kopIds.includes(s));
  const kopExtra = kopIds.filter((s) => !sorter.includes(s));
  const faMal = [...sorter, gava];
  const faSaknas = faMal.filter((s) => !faIds.includes(s));
  const faExtra = faIds.filter((s) => !faMal.includes(s));
  if (kopSaknas.length || kopExtra.length) fel.push(`köp-sorter ±${kopSaknas.length}/${kopExtra.length}`);
  if (faSaknas.length || faExtra.length) fel.push(`få-varor ±${faSaknas.length}/${faExtra.length}`);
  return { fel, kopSaknas, kopExtra, faSaknas, faExtra };
}

async function bxgyUppdatera(k, id, d) {
  const r = await k.graphql(`mutation($id: ID!, $d: DiscountCodeBxgyInput!) { discountCodeBxgyUpdate(id: $id, bxgyCodeDiscount: $d) { codeDiscountNode { id } userErrors { field message } } }`, { id, d });
  const fel = r.discountCodeBxgyUpdate.userErrors;
  if (fel.length) throw new Error(fel.map((e) => `${e.field} ${e.message}`).join('; '));
}

async function koder({ skarpt, aterstall, logg = console.log }) {
  const k = await klient();
  const { koder: lista, sorter, gava } = await eKoder(k);
  const lage = existsSync(KODER_FIL) ? JSON.parse(readFileSync(KODER_FIL, 'utf8')) : { _om: 'gava.mjs: paketkoderna före ändringen och de skapade hjälpkoderna, för --aterstall.', e: {}, udda: {} };
  logg(`Paketkoder (köp X få Y, aktiva): ${lista.map((x) => x.kod).join(', ')}`);
  logg(`Sorter: ${sorter.length}, gåvan: ${gava}`);
  const spara = () => { mkdirSync(GAVA_DIR, { recursive: true }); writeFileSync(KODER_FIL, `${JSON.stringify(lage, null, 1)}\n`); };

  if (aterstall) {
    for (const [kod, s] of Object.entries(lage.e)) {
      const nu = await lasKod(k, kod);
      const kopIds = ids(nu.customerBuys.items); const faIds = ids(nu.customerGets.items);
      const d = {
        title: s.fore.titel,
        usesPerOrderLimit: s.fore.grans,
        customerBuys: { value: { quantity: String(s.fore.kop) }, items: { products: { productsToAdd: s.fore.kop_produkter.filter((p) => !kopIds.includes(p)), productsToRemove: kopIds.filter((p) => !s.fore.kop_produkter.includes(p)) } } },
        customerGets: { value: { discountOnQuantity: { quantity: String(s.fore.fa), effect: { percentage: 1 } } }, items: { products: { productsToAdd: s.fore.fa_produkter.filter((p) => !faIds.includes(p)), productsToRemove: faIds.filter((p) => !s.fore.fa_produkter.includes(p)) } } },
      };
      logg(`${kod}: tillbaka till köp ${s.fore.kop} få ${s.fore.fa}, gräns ${s.fore.grans}`);
      if (skarpt) await bxgyUppdatera(k, nu.id, d);
    }
    for (const [kod, s] of Object.entries(lage.udda)) {
      logg(`${kod}: avslutas (raderas aldrig)`);
      if (skarpt) await k.graphql(`mutation($id: ID!) { discountCodeDeactivate(id: $id) { userErrors { message } } }`, { id: s.id });
    }
    if (!skarpt) logg('torrt: kör med --skarpt.');
    return;
  }

  // 1. Hjälpkoderna för udda antal (skapas först — de gör ingenting förrän temat lägger dem i en vagn).
  for (const u of UDDA) {
    const finns = await lasKod(k, u.kod);
    if (finns) {
      const a = finns.__typename === 'DiscountCodeBxgy' ? eAvvikelse(finns, { sorter, gava, kop: u.kop, fa: u.fa, grans: 1 }).fel : ['inte köp-X-få-Y'];
      logg(`${a.length ? '❌' : '✅'} ${u.kod} finns (${finns.status})${a.length ? ': ' + a.join(', ') : ''}`);
      if (a.length && skarpt) process.exitCode = 1;
      continue;
    }
    logg(`${u.kod}: skapas — köp ${u.kop} få ${u.fa} av alla sorter + ätpinnar, en gång per order`);
    if (!skarpt) continue;
    const r = await k.graphql(`mutation($d: DiscountCodeBxgyInput!) { discountCodeBxgyCreate(bxgyCodeDiscount: $d) { codeDiscountNode { id } userErrors { field message } } }`, { d: {
      title: `Gåvan följer lådorna: ${u.n} ${u.n === 1 ? 'låda' : 'lådor'}, köp 1 få 1 + ett par per låda (${u.kod})`, code: u.kod, startsAt: new Date().toISOString(), customerSelection: { all: true }, usesPerOrderLimit: 1,
      customerBuys: { value: { quantity: String(u.kop) }, items: { products: { productsToAdd: sorter } } },
      customerGets: { value: { discountOnQuantity: { quantity: String(u.fa), effect: { percentage: 1 } } }, items: { products: { productsToAdd: [...sorter, gava] } } },
      // Som paketkoderna: vännens kod (en orderrabatt) får följa med, inga andra produktrabatter.
      combinesWith: { orderDiscounts: true, productDiscounts: false, shippingDiscounts: false } } });
    const fel = r.discountCodeBxgyCreate.userErrors;
    if (fel.length) throw new Error(`${u.kod}: ${fel.map((e) => `${e.field} ${e.message}`).join('; ')}`);
    lage.udda[u.kod] = { id: r.discountCodeBxgyCreate.codeDiscountNode.id, skapad: new Date().toISOString() };
    spara();
    const las = await lasKod(k, u.kod);
    const a = eAvvikelse(las, { sorter, gava, kop: u.kop, fa: u.fa, grans: 1 }).fel;
    logg(`${a.length ? '❌' : '✅'} ${u.kod} skapad: ${las.status}${a.length ? ', ' + a.join(', ') : ''}`);
    if (a.length) process.exitCode = 1;
  }

  // 2. Paketkoderna: köp 1, få 3 av alla sorter + ätpinnar, utan gräns.
  for (const x of lista) {
    const a = eAvvikelse(x.lest, { sorter, gava });
    if (!a.fel.length) { logg(`✅ ${x.kod} redan köp 1 få 3, alla sorter, utan gräns`); continue; }
    logg(`${x.kod} (${x.niva}): ${a.fel.join(', ')} → köp 1 få 3, alla sorter + ätpinnar, utan gräns`);
    if (!skarpt) continue;
    if (!lage.e[x.kod]) {
      lage.e[x.kod] = { id: x.lest.id, sparat: new Date().toISOString(), fore: {
        titel: x.lest.title, kop: Number(x.lest.customerBuys.value.quantity), fa: Number(x.lest.customerGets.value.quantity.quantity), grans: x.lest.usesPerOrderLimit ?? null,
        kop_produkter: ids(x.lest.customerBuys.items), fa_produkter: ids(x.lest.customerGets.items) } };
      spara(); // originalet sparas INNAN något skrivs
    }
    await bxgyUppdatera(k, x.lest.id, {
      // Titeln syns bara i admin (kassan visar koden). Den säger vad koden gör nu, så ingen "rättar" tillbaka den.
      title: `${lage.e[x.kod].fore.titel.replace(/ — gava\.mjs.*$/, '')} — gava.mjs 2026-10-02: köp 1 få 3 av alla sorter + ätpinnar, utan gräns`,
      usesPerOrderLimit: null,
      customerBuys: { value: { quantity: String(E_KOP) }, items: { products: { productsToAdd: a.kopSaknas, productsToRemove: a.kopExtra } } },
      customerGets: { value: { discountOnQuantity: { quantity: String(E_FA), effect: { percentage: 1 } } }, items: { products: { productsToAdd: a.faSaknas, productsToRemove: a.faExtra } } },
    });
    const efter = await lasKod(k, x.kod);
    const kvar = eAvvikelse(efter, { sorter, gava }).fel;
    const ovrigt = JSON.stringify([efter.status, efter.combinesWith]) === JSON.stringify([x.lest.status, x.lest.combinesWith]);
    logg(`${!kvar.length && ovrigt ? '✅' : '❌'} ${x.kod}: ${kvar.length ? kvar.join(', ') : 'köp 1 få 3, alla sorter, utan gräns'}${ovrigt ? ', status och kombinationer oförändrade' : ' — STATUS ELLER KOMBINATIONER ÄNDRADES'}`);
    if (kvar.length || !ovrigt) process.exitCode = 1;
  }
  if (!skarpt) logg('\ntorrt: kör med --koder --skarpt.');
}

async function valjTema(k, gid) {
  const th = await k.graphql('{ themes(first: 30) { nodes { id name role processing } } }');
  const tema = gid ? th.themes.nodes.find((t) => t.id === gid || t.id.endsWith(`/${gid}`)) : th.themes.nodes.find((t) => t.role === 'MAIN');
  if (!tema) throw new Error(`temat ${gid ?? 'MAIN'} finns inte`);
  return tema;
}

async function lasFiler(k, temaId, filer) {
  const ut = {};
  for (let i = 0; i < filer.length; i += 10) {
    const d = await k.graphql('query($id: ID!, $f: [String!]) { theme(id: $id) { files(first: 10, filenames: $f) { nodes { filename body { ... on OnlineStoreThemeFileBodyText { content } } } } } }', { id: temaId, f: filer.slice(i, i + 10) });
    for (const n of d.theme.files.nodes) ut[n.filename] = n.body?.content ?? null;
  }
  return ut;
}

async function kopia({ logg = console.log }) {
  const k = await klient();
  const main = await valjTema(k, null);
  const namn = `PROV gåvan ${new Date().toISOString().slice(0, 10)} (kopia av MAIN, rörs inte live)`;
  const r = await k.graphql('mutation($id: ID!, $n: String) { themeDuplicate(id: $id, name: $n) { newTheme { id name role } userErrors { field message } } }', { id: main.id, n: namn });
  const fel = r.themeDuplicate.userErrors;
  if (fel.length) throw new Error(fel.map((e) => e.message).join('; '));
  const ny = r.themeDuplicate.newTheme;
  // Shopify kopierar filerna i bakgrunden (mätt: ~4 minuter för 430 filer). Skriv aldrig i en kopia
  // som fortfarande kopieras — då saknas filer och patcharna stannar.
  let klar = false;
  for (let i = 0; i < 120 && !klar; i++) {
    const t = await valjTema(k, ny.id);
    klar = !t.processing;
    if (!klar) await paus(5000);
  }
  if (!klar) throw new Error(`kopian ${ny.id} kopieras fortfarande efter tio minuter`);
  logg(`✅ kopian: ${ny.name} ${ny.id} (${ny.role})`);
  return ny;
}

async function tema({ skarpt, aterstall, temaGid, logg = console.log }) {
  const k = await klient();
  const t = await valjTema(k, temaGid);
  logg(`tema: ${t.name} (${t.id}, ${t.role})`);
  const filer = await lasFiler(k, t.id, [...PATCHADE_FILER, ...NYA_FILER]);
  const stampel = new Date().toISOString().replace(/[:.]/g, '-');
  const ut = join(OUTPUT, stampel);
  const skriv = [];
  for (const fil of PATCHADE_FILER) {
    const kod = filer[fil];
    if (typeof kod !== 'string') throw new Error(`${fil} saknas i temat`);
    const r = aterstall ? avpatcha(fil, kod) : patcha(fil, kod);
    for (const h of r.hoppade) logg(`  ${fil}: ${h}`);
    for (const b of r.byten) logg(`  ${fil}: ${b}`);
    if (!r.byten.length) continue;
    if (fil.endsWith('.js') && !giltigJs(r.kod)) throw new Error(`${fil}: resultatet är inte giltig JavaScript — skriver inte`);
    mkdirSync(join(ut, 'fore', dirname(fil)), { recursive: true });
    mkdirSync(join(ut, 'efter', dirname(fil)), { recursive: true });
    writeFileSync(join(ut, 'fore', fil), kod);
    writeFileSync(join(ut, 'efter', fil), r.kod);
    // Butikens original (före första patchen) sparas i repot en gång, så allt går att jämföra och backa.
    if (!aterstall && !existsSync(join(ORIGINAL, fil))) { mkdirSync(join(ORIGINAL, dirname(fil)), { recursive: true }); writeFileSync(join(ORIGINAL, fil), kod); }
    skriv.push({ filename: fil, body: { type: 'TEXT', value: r.kod } });
  }
  if (!aterstall) {
    // De nya filerna skrivs alltid när de skiljer sig (ms-gava.js uppdateras ur repot). Vid --aterstall
    // står de kvar oanvända: ms-head renderar dem inte längre.
    const nya = nyaFiler();
    for (const fil of NYA_FILER) {
      if (filer[fil] === nya[fil]) { logg(`  ${fil}: redan samma som i repot`); continue; }
      if (fil.endsWith('.js') && !giltigJs(nya[fil])) throw new Error(`${fil}: inte giltig JavaScript`);
      logg(`  ${fil}: ${filer[fil] == null ? 'ny' : 'uppdateras ur repot'}`);
      skriv.push({ filename: fil, body: { type: 'TEXT', value: nya[fil] } });
    }
  }
  if (!skriv.length) { logg('inget att skriva'); return { skrivna: [] }; }
  if (!skarpt) { logg(`torrt: ${skriv.length} fil(er) skulle skrivas: ${skriv.map((s) => s.filename).join(', ')}. Kör med --skarpt.`); return { skrivna: [] }; }
  // Nya filer först: ms-head får aldrig rendera en snippet som inte finns.
  const ordning = [...skriv.filter((s) => NYA_FILER.includes(s.filename)), ...skriv.filter((s) => !NYA_FILER.includes(s.filename))];
  for (const grupp of [ordning.filter((s) => NYA_FILER.includes(s.filename)), ordning.filter((s) => !NYA_FILER.includes(s.filename))]) {
    if (!grupp.length) continue;
    const u = await k.graphql('mutation($id: ID!, $files: [OnlineStoreThemeFilesUpsertFileInput!]!) { themeFilesUpsert(themeId: $id, files: $files) { upsertedThemeFiles { filename } userErrors { filename code message } } }', { id: t.id, files: grupp });
    const fel = u.themeFilesUpsert?.userErrors ?? [];
    if (fel.length) throw new Error(`themeFilesUpsert: ${fel.map((f) => `${f.filename}: ${f.message}`).join('; ')}`);
  }
  let kvar = [];
  for (let forsok = 1; forsok <= 3; forsok++) {
    const efter = await lasFiler(k, t.id, skriv.map((s) => s.filename));
    kvar = skriv.filter((s) => efter[s.filename] !== s.body.value).map((s) => s.filename);
    if (!kvar.length) break;
    if (forsok < 3) await paus(5000);
  }
  if (kvar.length) throw new Error(`${kvar.join(', ')} läses inte tillbaka identiskt (tre försök)`);
  logg(`✅ ${skriv.length} fil(er) skrivna och tillbakalästa (${ut})`);
  return { skrivna: skriv.map((s) => s.filename) };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const arg = process.argv.slice(2);
  const temaIx = arg.indexOf('--tema');
  const temaGid = temaIx !== -1 ? arg[temaIx + 1] : null;
  const skarpt = arg.includes('--skarpt');
  const aterstall = arg.includes('--aterstall');
  try {
    if (arg.includes('--kopia')) { await kopia({}); }
    else if (arg.includes('--kundvy')) {
      const { kundvy } = await import('./gava/kundvy.mjs');
      const r = await kundvy({ temaGid, fall: arg.includes('--fall') ? arg[arg.indexOf('--fall') + 1].split(',') : null });
      process.exit(r.ok ? 0 : 1);
    } else if (arg.includes('--koder')) { await koder({ skarpt, aterstall }); }
    else if (temaIx !== -1 || arg.includes('--main')) { await tema({ skarpt, aterstall, temaGid }); }
    else if (aterstall) { await koder({ skarpt, aterstall }); await tema({ skarpt, aterstall, temaGid: null }); }
    else { await koder({ skarpt: false }); console.log(''); await tema({ skarpt: false, temaGid: null }); }
  } catch (e) {
    console.error(`FEL: ${e.message}`);
    process.exit(1);
  }
}
