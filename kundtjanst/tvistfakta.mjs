// tvistfakta.mjs — allt en VA behöver veta om EN tvist, på ett kommando.
//
//   node kundtjanst/tvistfakta.mjs 4446
//   node kundtjanst/tvistfakta.mjs 4446 --brand carashell
//   node kundtjanst/tvistfakta.mjs --alla          (alla öppna tvister, kort)
//
// Varför verktyget finns: SOP:erna i kundtjanst/sop/ säger åt VA:n att kolla
// trackingen, återbetalningarna och leveransdatumet INNAN hon bestämmer sig för
// att slåss eller ge upp. Att klicka fram det i tre system tar tio minuter per
// tvist; här tar det ett kommando. Utskriften är på ENGELSKA — VA:n läser den.
//
// ⚠️ Spårning för gamla paket måste REGISTRERAS hos 17TRACK innan den går att
// läsa (mätt 2026-09-20: alla tolv tvistordrar svarade "does not register,
// please register first" — de var äldre än spårningsrutinens 14-dagarsfönster).
// Verktyget registrerar själv med --registrera; det kostar 17TRACK-kvot.
//
// LÄS-BART mot Shopify. Ändrar ingen tvist, skickar inga bevis, rör inga pengar.

import { ShopifyLasare } from './shopify.mjs';
import { upptackBrands, korkonfig, valjBrands } from './brands.mjs';
import { bolagskod } from '../sparning/status.mjs';

const DAG = 86_400_000;
const OPPEN = ['needs_response', 'under_review'];

/** Chargeback = pengarna är redan dragna, en förlust är slutgiltig. Ren. */
export const arChargeback = (t) => String(t?.typ ?? '').toLowerCase() === 'chargeback';

/**
 * Domen: ska vi slåss eller ge upp? REN FUNKTION — all logik, inga anrop.
 *
 * Grunden är mätt på Bäverbutikens 50 tvister 2026-09-20, inte på magkänsla:
 * inquiries 29 av 29 avgjorda vunna (100 %), chargebacks 1 av 4. Det som
 * avgör utfallet i vår data är EN sak: kan vi visa en leveransskanning?
 *
 * `bevisad` = vad vi faktiskt kan belägga, inte vad vi tror.
 * Returnerar { beslut, styrka, varfor[], bevis[], risk }.
 *   beslut: 'FIGHT' | 'REFUND' | 'ESCALATE'
 */
export function dom({ tvist, order, sparning, nu = new Date() } = {}) {
  const orsak = String(tvist?.orsak ?? 'general');
  // 17TRACK ger full tidsstämpel; bevistexten ska bära datumet, inte sekunder.
  const levererad = sparning?.levereratDatum ? String(sparning.levereratDatum).slice(0, 10) : null;
  const sparstatus = sparning?.huvudstatus ?? null;
  const harSparnummer = Boolean(sparning?.nummer);
  const aterbetalt = (order?.aterbetalningar ?? []).reduce((s, r) => s + Number(r.belopp || 0), 0);
  const total = Number(order?.total ?? 0);
  const adressmatch = order?.adressmatch;
  const varfor = [];
  const bevis = [];

  const stillastaende = harSparnummer && !levererad
    && ['InfoReceived', 'NotFound', 'Expired', 'Undelivered', 'Exception'].includes(String(sparstatus));

  // Leveransbeviset är gemensamt för allt vi slåss om.
  if (levererad) {
    varfor.push(`Carrier scan shows DELIVERED on ${levererad}.`);
    bevis.push(`Delivery scan: ${sparning.bolag ?? 'carrier'} ${sparning.nummer} — delivered ${levererad}.`);
  } else if (stillastaende) {
    varfor.push(`Parcel is NOT delivered — tracking stuck at "${sparstatus}" since ${(sparning?.sistaHandelse ?? '').slice(0, 10) || 'unknown'}.`);
  } else if (!harSparnummer) {
    varfor.push('No tracking number on the order at all.');
  } else {
    varfor.push(`Parcel still in transit (${sparstatus ?? 'unknown status'}), no delivery scan yet.`);
  }

  const standard = () => {
    bevis.push('Order confirmation (Shopify order page — customer, items, amount, date).');
    bevis.push('Full email thread with the customer, or a written note that there was none.');
    bevis.push('The store policy page the customer agreed to at checkout.');
  };

  let beslut = 'FIGHT';
  let styrka = 'medium';
  let risk = '';

  if (!harSparnummer) {
    beslut = 'ESCALATE';
    styrka = 'unknown';
    risk = 'Without a tracking number there is nothing to prove. Fulfilment is broken — the owner must look.';
    return { beslut, styrka, varfor, bevis, risk };
  }

  switch (orsak) {
    case 'product_not_received': {
      if (levererad) {
        beslut = 'FIGHT'; styrka = 'strong';
        varfor.push('A delivery scan against the customer\'s own address is the strongest evidence we have.');
        standard();
        risk = 'Customer may claim the scan is wrong or the parcel was stolen after delivery. Still worth fighting.';
      } else {
        beslut = 'REFUND'; styrka = 'lost';
        varfor.push('We cannot prove delivery, so we cannot win this — and we should not try.');
        risk = 'None. Refunding now is cheaper than losing later and keeps the dispute rate down.';
      }
      break;
    }
    case 'credit_not_processed': {
      if (aterbetalt > 0) {
        beslut = 'FIGHT'; styrka = 'strong';
        varfor.push(`A refund of ${aterbetalt} was already paid on this order — the claim is factually wrong.`);
        bevis.push(`Refund receipt: ${aterbetalt} paid (Shopify order → Refunds).`);
        standard();
        risk = aterbetalt < total ? 'The refund was PARTIAL — the customer may be disputing the remainder. Check the amounts match.' : '';
      } else if (levererad) {
        beslut = 'FIGHT'; styrka = 'strong';
        varfor.push('No refund was ever promised or issued, and the goods were delivered.');
        standard();
        bevis.push('Statement that no refund was requested or agreed, and no return was received.');
        risk = 'If support DID promise a refund in an email we have not read, this collapses. Search the inbox for the order number first.';
      } else {
        beslut = 'REFUND'; styrka = 'lost';
        varfor.push('No refund was paid and we cannot prove delivery either.');
        risk = 'None. Pay it.';
      }
      break;
    }
    case 'product_unacceptable': {
      if (aterbetalt >= total && total > 0) {
        beslut = 'FIGHT'; styrka = 'strong';
        varfor.push('The order is already fully refunded — there is nothing left to claim.');
        bevis.push(`Refund receipt: ${aterbetalt} paid in full.`);
      } else if (levererad) {
        beslut = 'FIGHT'; styrka = 'medium';
        varfor.push('Goods delivered; "not as described" is the customer\'s opinion until they return the item.');
        standard();
        bevis.push('The product page as it looked at purchase (description, photos, specifications).');
        bevis.push('Proof the return address was sent, and that no return has arrived.');
        risk = 'Weakest category to fight. If the fault is real and we refused a replacement or a return, we deserve to lose — read the email thread before submitting.';
      } else {
        beslut = 'REFUND'; styrka = 'lost';
        varfor.push('Not delivered — the complaint cannot even be about the product yet.');
      }
      break;
    }
    case 'fraudulent':
    case 'unrecognized': {
      if (adressmatch === false) {
        beslut = 'REFUND'; styrka = 'weak';
        varfor.push('Billing and shipping addresses DO NOT match — this looks like genuine card fraud.');
        risk = 'Fighting real card fraud loses and costs the fee. Accept, refund, and block the customer.';
      } else {
        beslut = 'FIGHT'; styrka = adressmatch ? 'strong' : 'medium';
        if (adressmatch) varfor.push('Billing address matches the shipping address — the cardholder\'s own address received the goods.');
        standard();
        bevis.push('Billing/shipping address match (AVS) from the order page.');
        bevis.push('The billing descriptor the customer saw on the statement.');
        risk = '"Unrecognized" is often a family member ordering, or a store name that differs from the descriptor. Say plainly who ordered and where it went.';
      }
      break;
    }
    case 'duplicate': {
      beslut = 'ESCALATE'; styrka = 'unknown';
      varfor.push('Duplicate claims need a human to compare the two charges before anything is submitted.');
      bevis.push('Both order confirmations side by side, showing two separate purchases.');
      risk = 'If they really are two charges for one order, refund one immediately — do not fight.';
      break;
    }
    default: {
      beslut = levererad ? 'FIGHT' : 'ESCALATE';
      styrka = levererad ? 'medium' : 'unknown';
      varfor.push(`Reason "${orsak}" has no specific playbook — submit the standard pack and read the claim text.`);
      standard();
      risk = 'Unclear claim. If the reason text is not understandable, ask the owner before spending time.';
    }
  }

  if (arChargeback(tvist) && beslut === 'FIGHT') {
    risk = `${risk} This is a real CHARGEBACK, not an inquiry — the money is already gone and a loss is final.`.trim();
  }
  return { beslut, styrka, varfor, bevis, risk };
}

/** Dagar kvar till deadline. Ren. */
export function dagarKvar(deadline, nu = new Date()) {
  if (!deadline) return null;
  const d = Date.parse(`${String(deadline).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d)) return null;
  return Math.round((d - Date.parse(`${new Date(nu).toISOString().slice(0, 10)}T00:00:00Z`)) / DAG);
}

/** Hela utskriften för en tvist, på engelska. Ren funktion över datan. */
export function rendera({ tvist, order, sparning, domen, nu = new Date() }) {
  const kvar = dagarKvar(tvist?.evidensSenast, nu);
  const nar = kvar === null ? 'no deadline read'
    : kvar < 0 ? `${Math.abs(kvar)} day(s) OVERDUE`
      : kvar === 0 ? 'DUE TODAY' : `${kvar} day(s) left`;
  const ikon = { FIGHT: '⚔️', REFUND: '💸', ESCALATE: '🙋' }[domen.beslut] ?? '•';
  const ut = [
    `${arChargeback(tvist) ? '🔴 CHARGEBACK' : 'INQUIRY'} — order ${order?.namn ?? tvist?.ordernummer}`,
    `Reason: ${tvist?.orsak}   Amount: ${tvist?.belopp} ${tvist?.valuta ?? ''}   Status: ${tvist?.status}`,
    `Evidence due: ${tvist?.evidensSenast ?? 'unknown'}  (${nar})`,
    '',
    `${ikon} DECISION: ${domen.beslut}   (case strength: ${domen.styrka})`,
    '',
    'WHY:',
    ...domen.varfor.map((v) => `  - ${v}`),
  ];
  if (domen.bevis.length) ut.push('', 'ATTACH THIS EVIDENCE:', ...domen.bevis.map((b, i) => `  ${i + 1}. ${b}`));
  if (domen.risk) ut.push('', `RISK: ${domen.risk}`);
  ut.push('', 'ORDER FACTS:',
    `  Placed ${String(order?.skapad ?? '').slice(0, 10)}   Total ${order?.total} ${order?.valuta ?? ''}   Payment ${order?.betald}   Fulfilment ${order?.fulfillment}`,
    `  Shipped to ${order?.stad ?? '?'}, ${order?.land ?? '?'}   Billing matches shipping: ${order?.adressmatch}`,
    `  Tracking ${sparning?.nummer ?? 'NONE'} (${sparning?.bolag ?? '-'}) → ${sparning?.huvudstatus ?? 'not read'}${sparning?.levereratDatum ? `, delivered ${String(sparning.levereratDatum).slice(0, 10)}` : ''}`,
    `  Refunds: ${(order?.aterbetalningar ?? []).length ? order.aterbetalningar.map((r) => `${r.belopp} on ${String(r.skapad ?? r.datum ?? '').slice(0, 10)}`).join(', ') : 'NONE'}`,
    `  Items: ${(order?.produkter ?? []).map((p) => p.titel).join(' + ') || '-'}`);
  ut.push('', 'NEXT: open kundtjanst/sop/00-MASTER.md and follow the SOP for this reason code.');
  return ut.join('\n');
}

// ------------------------------------------------------------------ hämtning

const API = () => process.env.SHOPIFY_API_VERSION || '2025-07';

async function las(brandId, nummer, { registrera = false, env = process.env, logg = () => {} } = {}) {
  const brand = valjBrands(upptackBrands(), brandId)[0];
  const k = korkonfig(brand, env);
  if (!k.shopify.konfigurerad) throw new Error(`Shopify is not connected for ${brand.brand} (missing ${k.shopify.saknas.join(', ')}).`);
  const sh = new ShopifyLasare({
    shop: k.shopify.shop, adminToken: k.shopify.adminToken,
    clientId: k.shopify.clientId, clientSecret: k.shopify.clientSecret, butikId: brand.id, logg,
  });
  const ordrar = await sh.hamtaOrdrar(new Date(Date.now() - 400 * DAG));
  const tv = await sh.hamtaTvister(new Date(Date.now() - 400 * DAG), ordrar);
  if (!tv.tillganglig) throw new Error(`Disputes could not be read: ${tv.orsak}`);

  const valda = nummer
    ? tv.lista.filter((d) => String(d.ordernamn ?? '').replace(/^#/, '') === String(nummer))
    : tv.lista.filter((d) => OPPEN.includes(d.status));

  const ut = [];
  for (const t of valda) {
    const rat = await sh.get(`https://${k.shopify.shop}/admin/api/${API()}/orders/${t.orderId}.json?fields=id,name,order_number,created_at,financial_status,fulfillment_status,fulfillments,refunds,total_price,currency,line_items,shipping_address,billing_address`)
      .then((r) => r.data.order).catch(() => null);
    const f = (rat?.fulfillments ?? [])[0];
    const nr = (f?.tracking_numbers ?? []).filter(Boolean)[0] ?? null;
    let sparning = { nummer: nr, bolag: f?.tracking_company ?? null, huvudstatus: null, levereratDatum: null, sistaHandelse: null };
    if (nr) {
      const { hamta, registrera: reg } = await import('../sparning/17track.mjs');
      const c = bolagskod(f?.tracking_company);
      const post = c ? { number: nr, carrier: c } : { number: nr };
      let svar = await hamta([post]).catch(() => ({ accepterade: [], avvisade: [] }));
      if (!svar.accepterade.length && registrera) {
        logg(`registering ${nr} with 17TRACK …`);
        await reg([post]).catch(() => {});
        await new Promise((ok) => setTimeout(ok, 20_000));
        svar = await hamta([post]).catch(() => ({ accepterade: [], avvisade: [] }));
      }
      const a = svar.accepterade[0];
      if (a) {
        const ti = a.track_info ?? {};
        sparning = {
          nummer: nr, bolag: f?.tracking_company ?? null,
          huvudstatus: ti.latest_status?.status ?? null,
          levereratDatum: (ti.milestone ?? []).find((m) => m.key_stage === 'Delivered')?.time_iso ?? null,
          sistaHandelse: ti.latest_event?.time_iso ?? null,
        };
      } else if (svar.avvisade.length) {
        sparning.avvisad = svar.avvisade[0].fel;
      }
    }
    const order = rat && {
      namn: rat.name, skapad: rat.created_at, betald: rat.financial_status, fulfillment: rat.fulfillment_status,
      total: Number(rat.total_price), valuta: rat.currency,
      land: rat.shipping_address?.country_code ?? null, stad: rat.shipping_address?.city ?? null,
      adressmatch: rat.shipping_address && rat.billing_address
        ? (rat.shipping_address.address1 === rat.billing_address.address1 && rat.shipping_address.zip === rat.billing_address.zip) : null,
      produkter: (rat.line_items ?? []).map((l) => ({ titel: l.title, antal: l.quantity })),
      aterbetalningar: (rat.refunds ?? []).map((r) => ({ skapad: r.created_at, belopp: (r.transactions ?? []).reduce((s, x) => s + Number(x.amount || 0), 0) })),
    };
    ut.push({ tvist: { ...t, ordernummer: String(t.ordernamn ?? '').replace(/^#/, '') }, order, sparning });
  }
  return { brand, fall: ut };
}

export async function huvud(argv = process.argv.slice(2), env = process.env) {
  const flagga = (n, d = null) => { const i = argv.indexOf(`--${n}`); return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d; };
  const nummer = argv.find((a) => /^#?\d+$/.test(a))?.replace(/^#/, '') ?? null;
  const alla = argv.includes('--alla');
  if (!nummer && !alla) {
    console.log('Usage: node kundtjanst/tvistfakta.mjs <order number> [--brand <id>] [--registrera]\n       node kundtjanst/tvistfakta.mjs --alla [--brand <id>]');
    return;
  }
  const { brand, fall } = await las(flagga('brand', 'baverbutiken'), nummer, {
    registrera: argv.includes('--registrera'), env, logg: (m) => console.error(`  ${m}`),
  });
  if (!fall.length) { console.log(nummer ? `No dispute found for order ${nummer} in ${brand.brand}.` : `No open disputes in ${brand.brand}.`); return; }
  const nu = new Date();
  for (const f of fall) {
    const domen = dom({ ...f, nu });
    console.log(`\n${'='.repeat(78)}\n${rendera({ ...f, domen, nu })}`);
  }
  console.log(`\n${'='.repeat(78)}\n${fall.length} dispute(s) in ${brand.brand}.`);
}

if (process.argv[1] && process.argv[1].endsWith('tvistfakta.mjs')) {
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' } });
    process.exit(r.status ?? 1);
  }
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
