// sop-koll.mjs — vaktar att tvist-SOP:erna förblir PORTABLA.
//
//   node kundtjanst/sop-koll.mjs            granska
//   node kundtjanst/sop-koll.mjs --fixa     normalisera platshållarnamnen
//   node kundtjanst/sop-koll.mjs --lista    visa den kanoniska listan
//
// Varför verktyget finns: SOP:erna i kundtjanst/sop/ är samma text på alla
// butiker, och det enda som skiljer butikerna är {{PLATSHÅLLARNA}}. Glider
// namnen isär går de inte att fylla från en konfig — då är portabiliteten
// borta, och det är hela poängen med systemet. (Mätt när SOP:erna skrevs
// 2026-09-20: samma värde hade tre namn — FIGHT_THRESHOLD,
// FIGHT_WORTH_IT_ABOVE och FIGHT_ABOVE.)
//
// Exit 1 när något är fel, så det går att köra i npm test / självtestet.

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
export const SOPMAPP = join(ROT, 'kundtjanst', 'sop');

/**
 * BUTIKENS värden — fylls EN gång per butik ur brandfilens `tvister:`-block
 * (kundtjanst/brand-mall.yaml) plus `brand:`-blocket. Kommentaren är den
 * text som ska stå i konfigtabellen, så den bara finns på ett ställe.
 */
export const BUTIK = Object.freeze({
  STORE_ID: 'brandfilens id, dvs filnamnet brands/<id>.yaml',
  STORE_NAME: 'brand.namn',
  STORE_DOMAIN: 'butikens publika domän',
  STORE_COUNTRY: 'brand.land',
  CURRENCY: 'brand.valuta',
  SUPPORT_EMAIL: 'brand.supportmail',
  WEBMAIL_URL: 'mail.webmail',
  RETURN_ADDRESS: 'tvister.returadress',
  RETURN_WINDOW_DAYS: 'tvister.returfonster_dagar',
  RETURN_POSTAGE_PAID_BY: 'vem som betalar returfrakten — ägarens beslut per butik',
  POLICY_URL: 'tvister.policy_url',
  BILLING_DESCRIPTOR: 'tvister.billing_descriptor (Shopify → Settings → Payments)',
  FIGHT_THRESHOLD: 'tvister.strid_lonar_sig_over — under detta belopp: återbetala i stället',
  REFUND_APPROVAL_LIMIT: 'belopp VA:n får återbetala utan att fråga — ägarens beslut',
  REPLACEMENT_LIMIT: 'belopp VA:n får skicka ersättningsvara för utan att fråga — ägarens beslut',
  ESCALATION_CHANNEL: 'Discord-kanalen larm och frågor går till (discord.kanal)',
  OWNER_CONTACT: 'vem VA:n eskalerar till',
  UNANSWERED_HOURS: 'trosklar.obesvarad_timmar',
  UNFULFILLED_DAYS: 'trosklar.ofullbordad_dagar',
  DISPUTE_RATE_YELLOW: 'trosklar.tvistgrans_gul_procent',
  DISPUTE_RATE_RED: 'trosklar.tvistgrans_rod_procent',
  FIRST_REPLY_TARGET_HOURS: 'svarstidsmål — ägarens beslut',
  DELIVERY_PROMISE_DAYS: 'leveranstiden som utlovas på sajten',
  STALL_ALERT_DAYS: 'dagar utan skanning innan paketet larmas',
  LATE_ALERT_DAYS: 'dagar över utlovad leveranstid innan kunden kontaktas',
  REFUND_DEADLINE_DAYS: 'hur snabbt en beviljad återbetalning ska vara utbetald',
});

/** ÄRENDETS värden — VA:n fyller dem per tvist, ur Shopify och trackingen. */
export const ARENDE = Object.freeze({
  ORDER_NUMBER: 'ordernummer', ORDER_DATE: 'orderdatum', ORDER_TOTAL: 'ordersumma',
  AMOUNT: 'tvistens belopp', DISPUTE_AMOUNT: 'tvistens belopp', REASON_CODE: 'Shopifys reason',
  EVIDENCE_DUE: 'evidence_due_by', DAYS_LEFT: 'dagar kvar', DATE: 'dagens datum',
  CUSTOMER_FIRST_NAME: 'kundens förnamn', CUSTOMER_EMAIL: 'kundens mejl',
  TRACKING_NUMBER: 'spårnummer', TRACKING_STATUS: '17TRACK-status', TRACKING_LINK: 'spårningslänk',
  CARRIER: 'fraktbolag', DELIVERY_DATE: 'leveransdatum', SHIP_DATE: 'skickatdatum',
  FULFILMENT_DATE: 'fulfillment-datum', LAST_SCAN_DATE: 'senaste skanningen',
  REFUND_AMOUNT: 'återbetalat belopp', REFUND_DATE: 'datum för återbetalningen',
  PRODUCT_NAME: 'produktnamn', ITEMS: 'orderrader',
  AGENT_NAME: 'VA:ns namn i mejlet', SHIPPING_CITY: 'leveransstad', SHIPPING_POSTCODE: 'postnummer',
  ADDRESS_LINE: 'leveransadress', IP: 'kundens IP', IP_COUNTRY: 'IP-land',
  ANSWER_BY_DATE: 'datum vi ber kunden svara senast', PROMISE_DATE: 'datum vi lovade något',
  CONTACT_DATE: 'datum kunden kontaktade oss', DATE_PLUS_N: 'datum N dagar fram',
  DELIVERY_PLACE: 'utlämningsställe', POLICY_NAME: 'policyns namn',
  WHAT_WE_DID: 'vad vi gjorde', CLAIM_LINE: 'kundens påstående', DELIVERY_LINE: 'leveransraden',
  CONTACT_LINE: 'kontaktraden', REPLY_SENTENCE: 'svarsmeningen',
  DELIVERY_SENTENCE: 'leveransmeningen', PRIOR_ORDERS_SENTENCE: 'tidigare ordrar',
  CUSTOMER_LANGUAGE: 'kundens språk', WINDOW_DAYS: 'fönstret i dagar',
  CARD_LAST4: 'kortets fyra sista siffror — det enda kortdata som får skrivas någonstans',
  PRODUCT_URL: 'produktsidans adress — bevis för hur varan beskrevs vid köpet',
  CS_EMAIL_DATE: 'datum vi mejlade kunden om tvisten',
  RETURN_INSTRUCTIONS_DATE: 'datum vi skickade returadressen till kunden',
  CANCELLATION_REQUEST_DATE: 'datum kunden bad att få avboka',
  DISPUTE_DATE: 'datum tvisten öppnades',
  POLICY_DISCLOSURE_LOCATION: 'var i kassan policyn visades före betalning',
  REVIEW_DATE: 'datum kunden lämnade en recension',
  // En order kan bära FLER tvister (mätt: #5053 har två, #4706 en vunnen + en ny)
  PRIOR_DISPUTE_ID: 'tidigare tvist på samma order',
  PRIOR_DISPUTE_DECISION_DATE: 'datum den tidigare tvisten avgjordes',
  // duplicate-SOP:en jämför två ordrar mot varandra
  ORDER_A: 'första ordern', ORDER_B: 'andra ordern', AMOUNT_A: 'belopp A', AMOUNT_B: 'belopp B',
  DATE_A: 'datum A', DATE_B: 'datum B', ITEMS_A: 'rader A', ITEMS_B: 'rader B',
  TRACKING_A: 'spårnummer A', TRACKING_B: 'spårnummer B', OTHER_ORDER: 'den andra ordern',
});

/** Metaplatshållare som bara förekommer när texten pratar OM platshållare. */
export const META = Object.freeze(['PLACEHOLDER', 'PLACEHOLDERS', 'LIKE_THIS']);

/**
 * Namn som glidit isär → det kanoniska namnet. `--fixa` skriver om dem.
 * Lägg bara till här, byt aldrig ett kanoniskt namn utan att köra --fixa.
 */
export const ALIAS = Object.freeze({
  FIGHT_WORTH_IT_ABOVE: 'FIGHT_THRESHOLD',
  FIGHT_ABOVE: 'FIGHT_THRESHOLD',
  BRAND_ID: 'STORE_ID',
  FIRST_NAME: 'CUSTOMER_FIRST_NAME',
  CUSTOMER_NAME: 'CUSTOMER_FIRST_NAME',
  OWNER_CHANNEL: 'ESCALATION_CHANNEL',
  ALERT_CHANNEL: 'ESCALATION_CHANNEL',
  ORDER: 'ORDER_NUMBER',
  TRACKING: 'TRACKING_NUMBER',
  VA_NAME: 'AGENT_NAME',
  DUE_DATE: 'EVIDENCE_DUE',
  RETURN_POLICY_URL: 'POLICY_URL',
  STORE_URL: 'STORE_DOMAIN',
  REFUND_POLICY_URL: 'POLICY_URL',
  DISPUTED_AMOUNT: 'AMOUNT',
  TODAY: 'DATE',
  DELIVERY_CITY: 'SHIPPING_CITY',
  COUNTRY: 'STORE_COUNTRY',
  CUSTOMER_EMAIL_DATE: 'CS_EMAIL_DATE',
  RETURN_ADDRESS_EMAIL_DATE: 'RETURN_INSTRUCTIONS_DATE',
});

export const KANONISKA = Object.freeze([...Object.keys(BUTIK), ...Object.keys(ARENDE), ...META]);

/** Alla {{NAMN}} i en text, med radnummer. Ren. */
export function platshallare(text) {
  const ut = [];
  text.split('\n').forEach((rad, i) => {
    for (const m of rad.matchAll(/\{\{([A-Z_][A-Z0-9_]*)\}\}/g)) ut.push({ namn: m[1], rad: i + 1 });
  });
  return ut;
}

/** Byter alias mot kanoniska namn. Ren — returnerar { text, antal }. */
export function normalisera(text) {
  let antal = 0;
  let ut = text;
  for (const [fran, till] of Object.entries(ALIAS)) {
    const re = new RegExp(`\\{\\{${fran}\\}\\}`, 'g');
    const traffar = (ut.match(re) ?? []).length;
    if (traffar) { ut = ut.replace(re, `{{${till}}}`); antal += traffar; }
  }
  return { text: ut, antal };
}

/** Granskar en fil. Ren över innehållet. */
export function granska(namn, text) {
  const fel = [];
  const varning = [];
  for (const p of platshallare(text)) {
    // DATE_PLUS_3 / _5 / _10 är samma sak som DATE_PLUS_N med siffran ifylld.
    if (/^DATE_PLUS_\d+$/.test(p.namn)) continue;
    if (ALIAS[p.namn]) fel.push(`${namn}:${p.rad} {{${p.namn}}} är ett alias — kanoniskt namn är {{${ALIAS[p.namn]}}} (kör --fixa)`);
    else if (!KANONISKA.includes(p.namn)) fel.push(`${namn}:${p.rad} {{${p.namn}}} finns inte i den kanoniska listan (lägg till i sop-koll.mjs eller byt namn)`);
  }
  // Ett brandnamn i procedurtext är ett portabilitetsfel; i ett markerat
  // exempel, en filreferens eller en konfigtabell (rad som visar vad en
  // platshållare ska fyllas med) är det spårbarhet och alltså önskvärt.
  //
  // README.md är undantagen: den är skriven till ÄGAREN på svenska om just
  // den här butiken, inte till VA:n som procedur. Den ska nämna butiken.
  if (/(^|\/)README\.md$/.test(namn)) return { fel, varning };
  text.split('\n').forEach((rad, i) => {
    if (!/bäverbutiken|baverbutiken|carashell|heimguard|tacklebay|drytrek|adventlane|catcabin|tankguard/i.test(rad)) return;
    const ursakt = /example|exempel|measured|mätt|`\{\{[A-Z_]+\}\}`|`[^`]*(korningar|brands|yaml|mjs)[^`]*`|kundtjanst\/|factory\/|REVIEW:|node /i.test(rad);
    (ursakt ? varning : fel).push(`${namn}:${i + 1} butiksnamn i ${ursakt ? 'exempel/referens (ok)' : 'PROCEDURTEXT — byt mot {{STORE_NAME}}'}: ${rad.trim().slice(0, 90)}`);
  });
  return { fel, varning };
}

/** Alla SOP-filer, även beslutsbladen i sop/beslut/. */
function filer() {
  if (!existsSync(SOPMAPP)) return [];
  const ut = readdirSync(SOPMAPP).filter((f) => f.endsWith('.md')).sort();
  const beslut = join(SOPMAPP, 'beslut');
  if (existsSync(beslut)) ut.push(...readdirSync(beslut).filter((f) => f.endsWith('.md')).sort().map((f) => join('beslut', f)));
  return ut;
}

export function huvud(argv = process.argv.slice(2)) {
  if (argv.includes('--lista')) {
    console.log('\nBUTIKENS värden (fylls en gång per butik):');
    for (const [k, v] of Object.entries(BUTIK)) console.log(`  {{${k}}}`.padEnd(32) + v);
    console.log('\nÄRENDETS värden (VA:n fyller per tvist):');
    for (const [k, v] of Object.entries(ARENDE)) console.log(`  {{${k}}}`.padEnd(32) + v);
    console.log(`\n${KANONISKA.length} kanoniska namn, ${Object.keys(ALIAS).length} alias.\n`);
    return 0;
  }

  const lista = filer();
  if (!lista.length) { console.error(`✗ Hittade inga .md-filer i ${SOPMAPP}`); return 1; }

  if (argv.includes('--fixa')) {
    let totalt = 0;
    for (const f of lista) {
      const p = join(SOPMAPP, f);
      const { text, antal } = normalisera(readFileSync(p, 'utf8'));
      if (antal) { writeFileSync(p, text); console.log(`  ${f.padEnd(36)} ${antal} platshållare normaliserade`); totalt += antal; }
    }
    console.log(`\n${totalt} namnbyten i ${lista.length} filer.`);
    if (!totalt) console.log('Inget att fixa.');
  }

  let fel = 0; let varning = 0;
  const anvanda = new Set();
  for (const f of lista) {
    const text = readFileSync(join(SOPMAPP, f), 'utf8');
    for (const p of platshallare(text)) anvanda.add(p.namn);
    const g = granska(f, text);
    for (const x of g.fel) console.error(`  ✗ ${x}`);
    for (const x of g.varning) if (argv.includes('--allt')) console.log(`  · ${x}`);
    fel += g.fel.length; varning += g.varning.length;
  }

  const oanvanda = Object.keys(BUTIK).filter((k) => !anvanda.has(k));
  console.log(`\n${lista.length} SOP-filer · ${anvanda.size} platshållare i bruk · ${varning} butiksnamn i exempel (--allt visar dem)`);
  if (oanvanda.length) console.log(`Butiksvärden som ingen SOP använder: ${oanvanda.join(', ')}`);
  if (fel) { console.error(`\n✗ ${fel} fel. Kör --fixa för aliasen; byt de övriga för hand.`); return 1; }
  console.log('✅ Platshållarna är konsekventa och ingen procedurtext bär ett butiksnamn.');
  return 0;
}

if (process.argv[1] && process.argv[1].endsWith('sop-koll.mjs')) process.exit(huvud());
