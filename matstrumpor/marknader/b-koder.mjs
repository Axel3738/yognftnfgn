// b-koder.mjs — gåvan i paketen är alltid gratis i korgen (Matstrumpor).
//
// Sajtgranskningen 2026-10-01, S-025: A/B-testets variant B lovar "2 lådor 499 kr" och "4 lådor 799 kr"
// med ätpinnarna gratis, men koderna SUSHI-2FOR499 och SUSHI-4FOR799 var "399 resp. 997 kr av, en gång
// per order" på strumporna OCH ätpinnarna. Shopify fördelar ett sådant belopp på alla rader, så korgen
// visade ätpinnarna för 28 resp. 22 kr styck (mätt 2026-10-02 i Chromium).
//
// Axels beslut 2026-10-02, val B: "Ätpinnarna ska alltid vara gratis". Rabatten blir ett belopp av PER
// VARA, lika stort som lådans rabatt i paketet. Gåvan kostar mindre än beloppet och blir 0 kr, och lådorna
// kostar tillsammans paketets fasta pris. Priset för det, som Axel valde med vetskap: en låda utöver
// paketet får samma rabatt per styck.
//
// Axel samma dag, andra meddelandet: "ätpinnar ska alltid vara en gratis gåva som följer med varje
// enskild box". Variant B:s paket med EN låda (399 kr) hade ingen gåva och ingen kod. Det får nu ett par
// ätpinnar och en egen kod, köp en låda och få ett par gratis, upprepad för varje låda (SUSHI-1FOR399).
// Regeln som kollas för varje paket: lika många gåvor som lådor, och gåvan gratis.
//
// Verktyget räknar beloppet ur paketnivåerna (metaobjektet ms_paketniva: antal, fastpris, gåvan) och
// ur variantpriserna i koden, aldrig ur huvudet. Det kollar också att gåvan är gratis i VARJE paket
// i butiken, också "köp X, få Y"-koderna i variant A och de andra strumporna.
//
//   node matstrumpor/marknader/b-koder.mjs                        # torrt: läser och visar planen
//   node matstrumpor/marknader/b-koder.mjs --skarpt               # skriver, läser tillbaka
//   node matstrumpor/marknader/b-koder.mjs --aterstall --skarpt   # som före 2026-10-02: beloppen per order,
//                                                                 # enlådspaketet utan gåva, nya koder avslutade

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROT = dirname(fileURLToPath(import.meta.url));
const LAGE = join(ROT, 'b-koder.json');

const ore = (kr) => Math.round(Number(kr) * 100);

/**
 * Ren: rabatten per vara som ger paketets fasta pris och en gratis gåva.
 * antal lådor à ladaPris ska kosta fastpris; gåvan (gavaPris styck) ska bli 0 kr.
 */
export function beloppPerVara({ antal, fastpris, ladaPris, gavaPris }) {
  const n = Number(antal);
  if (!(n > 0)) throw new Error(`antal saknas (${antal})`);
  const rabattOre = n * ore(ladaPris) - ore(fastpris);
  if (rabattOre <= 0) throw new Error(`fastpriset ${fastpris} är inte lägre än ${n} × ${ladaPris}`);
  if (rabattOre % n !== 0) throw new Error(`rabatten ${rabattOre / 100} kr går inte att dela på ${n} lådor i hela ören`);
  const perVaraOre = rabattOre / n;
  if (ore(gavaPris) > perVaraOre) throw new Error(`gåvan kostar ${gavaPris} kr, mer än rabatten per vara ${perVaraOre / 100} kr: den hade inte blivit gratis`);
  return { belopp: perVaraOre / 100, perLada: (ore(ladaPris) - perVaraOre) / 100 };
}

/**
 * Ren: paketnivåerna som har färre gåvor än lådor, och vad de ska få. Gåvan, texten och kodens prefix
 * läses ur ett syskon (samma produkt och samma A/B-variant) som redan ger en gåva per låda — aldrig
 * påhittade. En nivå utan kod får en ny kod: <prefix>-<antal>FOR<fastpris>, som SUSHI-2FOR499.
 */
export function gavaPlan(nivaer) {
  const ut = [];
  for (const n of nivaer) {
    const antal = Number(n.antal);
    if (!(antal > 0) || Number(n.gratis_antal || 0) >= antal) continue;
    const syskon = nivaer.find((s) => s !== n && s.produkt === n.produkt && (s.ab_variant || '') === (n.ab_variant || '')
      && s.gratis_produkt && Number(s.gratis_antal) === Number(s.antal) && /\(\d+ par\)/.test(s.gratis_text || '') && /^[A-Z]+-/.test(s.rabattkod || ''));
    if (!syskon) { ut.push({ handle: n.handle, fel: 'inget syskon med en gåva per låda att utgå från' }); continue; }
    const prefix = syskon.rabattkod.split('-')[0];
    const fast = Math.round(Number(n.fastpris));
    ut.push({
      handle: n.handle,
      kod: n.rabattkod || `${prefix}-${antal}FOR${fast}`,
      nyKod: !n.rabattkod,
      falt: {
        rabattkod: n.rabattkod || `${prefix}-${antal}FOR${fast}`,
        gratis_produkt: syskon.gratis_produkt,
        gratis_antal: String(antal),
        gratis_text: syskon.gratis_text.replace(/\(\d+ par\)/, `(${antal} par)`),
      },
      fore: { rabattkod: n.rabattkod ?? null, gratis_produkt: n.gratis_produkt ?? null, gratis_antal: n.gratis_antal ?? null, gratis_text: n.gratis_text ?? null },
    });
  }
  return ut;
}

/** Ren: blir gåvan gratis med den här koden? Svarar med orsaken när den inte blir det. */
export function gavanGratis(kod, { gavaProdukt, gavaPris }) {
  if (!kod) return { ok: false, orsak: 'koden finns inte' };
  if (kod.__typename === 'DiscountCodeBxgy') {
    const e = kod.customerGets?.value?.effect;
    const procent = e?.__typename === 'DiscountPercentage' ? Number(e.percentage) : null;
    const prod = (kod.customerGets?.items?.products?.nodes ?? []).map((p) => p.id);
    if (!prod.includes(gavaProdukt)) return { ok: false, orsak: 'gåvan är inte bland "få"-varorna' };
    if (procent !== 1) return { ok: false, orsak: `"få"-varorna får ${procent === null ? 'ett belopp' : procent * 100 + ' %'} av, inte 100 %` };
    return { ok: true, orsak: 'köp X, få Y: gåvan 100 % av' };
  }
  if (kod.__typename === 'DiscountCodeBasic') {
    const v = kod.customerGets?.value;
    const varianter = (kod.customerGets?.items?.productVariants?.nodes ?? []).map((x) => x.product?.id);
    const produkter = (kod.customerGets?.items?.products?.nodes ?? []).map((p) => p.id);
    if (![...varianter, ...produkter].includes(gavaProdukt)) return { ok: false, orsak: 'gåvan omfattas inte av koden' };
    if (v?.__typename !== 'DiscountAmount') return { ok: false, orsak: 'inte ett belopp' };
    if (!v.appliesOnEachItem) return { ok: false, orsak: 'beloppet gäller en gång per order och sprids på alla rader' };
    if (ore(v.amount.amount) < ore(gavaPris)) return { ok: false, orsak: `beloppet ${v.amount.amount} är lägre än gåvans pris ${gavaPris}` };
    return { ok: true, orsak: `belopp per vara ${v.amount.amount} kr ≥ gåvans ${gavaPris} kr` };
  }
  return { ok: false, orsak: `okänd kodtyp ${kod.__typename}` };
}

const ITEMS = `__typename ... on AllDiscountItems { allItems }
  ... on DiscountProducts { products(first: 20) { nodes { id handle } } productVariants(first: 50) { nodes { id price title product { id handle } } } }`;
const KOD_FALT = `__typename
  ... on DiscountCodeBasic { title status combinesWith { orderDiscounts productDiscounts shippingDiscounts } codes(first: 3) { nodes { code } }
    minimumRequirement { __typename ... on DiscountMinimumSubtotal { greaterThanOrEqualToSubtotal { amount } } ... on DiscountMinimumQuantity { greaterThanOrEqualToQuantity } }
    customerGets { value { __typename ... on DiscountAmount { amount { amount currencyCode } appliesOnEachItem } ... on DiscountPercentage { percentage } } items { ${ITEMS} } } }
  ... on DiscountCodeBxgy { title status codes(first: 3) { nodes { code } }
    customerGets { value { __typename ... on DiscountOnQuantity { quantity { quantity } effect { __typename ... on DiscountPercentage { percentage } ... on DiscountAmount { amount { amount } appliesOnEachItem } } } } items { ${ITEMS} } } }`;

async function lasKod(k, kod) {
  const d = await k.graphql(`query($c: String!) { codeDiscountNodeByCode(code: $c) { id codeDiscount { ${KOD_FALT} } } }`, { c: kod });
  const n = d.codeDiscountNodeByCode;
  return n ? { id: n.id, ...n.codeDiscount } : null;
}

async function lasNivaer(k) {
  const d = await k.graphql(`{ metaobjects(type: "ms_paketniva", first: 100) { nodes { id handle fields { key value } } } }`);
  return d.metaobjects.nodes.map((n) => ({ id: n.id, handle: n.handle, ...Object.fromEntries(n.fields.map((f) => [f.key, f.value])) }));
}

async function skrivNiva(k, id, falt) {
  const fields = Object.entries(falt).map(([key, value]) => ({ key, value: value ?? '' }));
  const r = await k.graphql(`mutation($id: ID!, $m: MetaobjectUpdateInput!) { metaobjectUpdate(id: $id, metaobject: $m) { metaobject { id fields { key value } } userErrors { field message code } } }`, { id, m: { fields } });
  const fel = r.metaobjectUpdate.userErrors;
  if (fel.length) throw new Error(`metaobjektet ${id}: ${fel.map((e) => `${e.field} ${e.message}`).join('; ')}`);
  const efter = Object.fromEntries(r.metaobjectUpdate.metaobject.fields.map((f) => [f.key, f.value]));
  return Object.entries(falt).every(([key, value]) => (efter[key] ?? '') === (value ?? ''));
}

/** Köp en låda, få ett par gratis — upprepad för varje låda (ingen gräns per order). */
async function skapaGavokod(k, { kod, lada, gava }) {
  const input = {
    title: `Paket B: ätpinnar gratis till varje låda (${kod})`,
    code: kod,
    startsAt: new Date().toISOString(),
    customerSelection: { all: true },
    customerBuys: { value: { quantity: '1' }, items: { products: { productsToAdd: [lada] } } },
    customerGets: { value: { discountOnQuantity: { quantity: '1', effect: { percentage: 1 } } }, items: { products: { productsToAdd: [gava] } } },
    // Som paketkoderna i variant A: vännens kod (en orderrabatt) får följa med, inga andra produktrabatter.
    combinesWith: { orderDiscounts: true, productDiscounts: false, shippingDiscounts: false },
  };
  const r = await k.graphql(`mutation($d: DiscountCodeBxgyInput!) { discountCodeBxgyCreate(bxgyCodeDiscount: $d) { codeDiscountNode { id } userErrors { field message code } } }`, { d: input });
  const fel = r.discountCodeBxgyCreate.userErrors;
  if (fel.length) throw new Error(`${kod}: ${fel.map((e) => `${e.field} ${e.message}`).join('; ')}`);
  return r.discountCodeBxgyCreate.codeDiscountNode.id;
}

async function gavansPris(k, produktId) {
  const d = await k.graphql(`query($id: ID!) { product(id: $id) { handle variants(first: 5) { nodes { price } } } }`, { id: produktId });
  const priser = [...new Set((d.product?.variants?.nodes ?? []).map((v) => v.price))];
  if (priser.length !== 1) throw new Error(`gåvan ${produktId} har ${priser.length} olika priser — kan inte räkna`);
  return { handle: d.product.handle, pris: priser[0] };
}

async function huvud() {
  const arg = process.argv.slice(2);
  const skarpt = arg.includes('--skarpt');
  const aterstall = arg.includes('--aterstall');
  const { lasButik, skapaKlient } = await import('../../sparning/butik.mjs');
  const k = await skapaKlient(lasButik('matstrumpor'));
  const log = (s) => console.log(s);
  const nivaer = (await lasNivaer(k)).filter((n) => n.rabattkod);
  const lage = existsSync(LAGE) ? JSON.parse(readFileSync(LAGE, 'utf8')) : { _om: 'b-koder.mjs: koderna före ändringen, för --aterstall.', koder: {} };

  // 1. B-koderna (belopp): planen.
  const andra = [];
  for (const n of nivaer.filter((x) => x.gratis_produkt && Number(x.gratis_antal) > 0)) {
    const kod = await lasKod(k, n.rabattkod);
    const gava = await gavansPris(k, n.gratis_produkt);
    if (kod?.__typename !== 'DiscountCodeBasic') continue;
    const lador = (kod.customerGets.items.productVariants?.nodes ?? []).filter((v) => v.product.id === n.produkt);
    const ladPriser = [...new Set(lador.map((v) => v.price))];
    if (ladPriser.length !== 1) throw new Error(`${n.rabattkod}: lådorna i koden har ${ladPriser.length} olika priser`);
    const nu = kod.customerGets.value;
    const plan = aterstall
      ? lage.koder[n.rabattkod]?.fore
      : (() => { const b = beloppPerVara({ antal: n.antal, fastpris: n.fastpris, ladaPris: ladPriser[0], gavaPris: gava.pris }); return { amount: b.belopp, appliesOnEachItem: true, perLada: b.perLada }; })();
    if (!plan) { log(`${n.rabattkod}: inget sparat original att återställa — hoppar`); continue; }
    const lika = ore(nu.amount.amount) === ore(plan.amount) && !!nu.appliesOnEachItem === !!plan.appliesOnEachItem;
    log(`${n.rabattkod} (${n.handle}, ${n.antal} lådor à ${ladPriser[0]} kr + ${n.gratis_antal} ${gava.handle} à ${gava.pris} kr → ${n.fastpris} kr): nu ${nu.amount.amount} kr ${nu.appliesOnEachItem ? 'per vara' : 'en gång per order'} → ${plan.amount} kr ${plan.appliesOnEachItem ? 'per vara' : 'en gång per order'}${plan.perLada ? ` (lådan ${plan.perLada} kr, gåvan 0 kr)` : ''}${lika ? ' — redan så' : ''}`);
    if (!lika) andra.push({ n, kod, nu, plan });
  }

  if (!skarpt) { log(`\ntorrt: ${andra.length} kod(er) skulle ändras. Kör med --skarpt.`); }
  else {
    for (const { n, kod, nu, plan } of andra) {
      if (!aterstall && !lage.koder[n.rabattkod]) {
        lage.koder[n.rabattkod] = { id: kod.id, fore: { amount: Number(nu.amount.amount), appliesOnEachItem: !!nu.appliesOnEachItem }, sparat: new Date().toISOString() };
        writeFileSync(LAGE, `${JSON.stringify(lage, null, 1)}\n`); // originalet sparas INNAN något skrivs
      }
      const r = await k.graphql(`mutation($id: ID!, $d: DiscountCodeBasicInput!) { discountCodeBasicUpdate(id: $id, basicCodeDiscount: $d) { codeDiscountNode { id } userErrors { field message code } } }`,
        { id: kod.id, d: { customerGets: { value: { discountAmount: { amount: String(plan.amount), appliesOnEachItem: plan.appliesOnEachItem } } } } });
      const fel = r.discountCodeBasicUpdate.userErrors;
      if (fel.length) throw new Error(`${n.rabattkod}: ${fel.map((e) => `${e.field} ${e.message}`).join('; ')}`);
      // Tillbakaläsning: beloppet, och att allt annat står kvar som förut.
      const efter = await lasKod(k, n.rabattkod);
      const v = efter.customerGets.value;
      const fore = JSON.stringify([kod.status, kod.minimumRequirement, kod.combinesWith, kod.customerGets.items]);
      const sen = JSON.stringify([efter.status, efter.minimumRequirement, efter.combinesWith, efter.customerGets.items]);
      const ok = ore(v.amount.amount) === ore(plan.amount) && !!v.appliesOnEachItem === !!plan.appliesOnEachItem && fore === sen;
      log(`${ok ? '✅' : '❌'} ${n.rabattkod}: ${v.amount.amount} kr ${v.appliesOnEachItem ? 'per vara' : 'en gång per order'}${fore === sen ? ', status, villkor, kombinationer och varor oförändrade' : ' — NÅGOT ANNAT ÄNDRADES'}`);
      if (!ok) process.exitCode = 1;
    }
  }

  // 2. En gåva per låda: paket med färre gåvor än lådor får gåvan och, saknas en kod, en egen kod.
  const allaNivaer = await lasNivaer(k);
  const gplan = aterstall ? [] : gavaPlan(allaNivaer);
  log(`\nEn gåva per låda: ${gplan.length ? gplan.map((g) => g.fel ? `${g.handle} ❌ ${g.fel}` : `${g.handle} → ${g.falt.gratis_antal} × gåvan, kod ${g.kod}${g.nyKod ? ' (ny, köp en låda få ett par)' : ''}, texten "${g.falt.gratis_text}"`).join('; ') : 'alla paket har det redan'}`);
  if (skarpt && !aterstall) {
    lage.nivaer ??= {};
    lage.skapade_koder ??= {};
    for (const g of gplan) {
      if (g.fel) { process.exitCode = 1; continue; }
      const niva = allaNivaer.find((n) => n.handle === g.handle);
      if (!lage.nivaer[g.handle]) {
        lage.nivaer[g.handle] = { id: niva.id, fore: g.fore, sparat: new Date().toISOString() };
        writeFileSync(LAGE, `${JSON.stringify(lage, null, 1)}\n`); // originalet sparas INNAN något skrivs
      }
      if (g.nyKod && !(await lasKod(k, g.kod))) {
        const id = await skapaGavokod(k, { kod: g.kod, lada: niva.produkt, gava: g.falt.gratis_produkt });
        lage.skapade_koder[g.kod] = { id, skapad: new Date().toISOString() };
        writeFileSync(LAGE, `${JSON.stringify(lage, null, 1)}\n`);
        const ny = await lasKod(k, g.kod);
        const ok = ny?.__typename === 'DiscountCodeBxgy' && ['ACTIVE', 'SCHEDULED'].includes(ny.status);
        log(`${ok ? '✅' : '❌'} ${g.kod} skapad: ${ny?.__typename} ${ny?.status}`);
        if (!ok) { process.exitCode = 1; continue; }
      }
      const ok = await skrivNiva(k, niva.id, g.falt);
      log(`${ok ? '✅' : '❌'} ${g.handle}: ${JSON.stringify(g.falt)}`);
      if (!ok) process.exitCode = 1;
    }
  }
  if (skarpt && aterstall) {
    for (const [handle, n] of Object.entries(lage.nivaer ?? {})) {
      const ok = await skrivNiva(k, n.id, n.fore);
      log(`${ok ? '✅' : '❌'} ${handle} tillbaka: ${JSON.stringify(n.fore)}`);
    }
    for (const [kod, s] of Object.entries(lage.skapade_koder ?? {})) {
      // Avslutas, raderas aldrig: ordrarna som använt koden pekar på den.
      const r = await k.graphql(`mutation($id: ID!) { discountCodeDeactivate(id: $id) { codeDiscountNode { id } userErrors { field message } } }`, { id: s.id });
      log(`${r.discountCodeDeactivate.userErrors.length ? '❌' : '✅'} ${kod} avslutad`);
    }
  }

  // 3. Varje paket i butiken: lika många gåvor som lådor, och gåvan gratis (läses efter ev. skrivning).
  log('\nGåvan i varje paket:');
  for (const n of await lasNivaer(k)) {
    if (!n.gratis_produkt || Number(n.gratis_antal || 0) < Number(n.antal)) {
      log(`❌ ${n.handle.padEnd(16)} ${String(n.rabattkod || '-').padEnd(18)} ${n.gratis_antal || 0} gåvor till ${n.antal} lådor`);
      if (skarpt && !aterstall) process.exitCode = 1;
      continue;
    }
    const kod = await lasKod(k, n.rabattkod);
    const gava = await gavansPris(k, n.gratis_produkt);
    const g = gavanGratis(kod, { gavaProdukt: n.gratis_produkt, gavaPris: gava.pris });
    log(`${g.ok ? '✅' : '❌'} ${n.handle.padEnd(16)} ${n.rabattkod.padEnd(18)} ${n.gratis_antal} ${gava.handle} till ${n.antal} lådor: ${g.orsak}`);
    if (!g.ok && skarpt && !aterstall) process.exitCode = 1;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}`); process.exit(1); });
}
