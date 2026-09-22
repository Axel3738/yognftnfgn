// brands.mjs — vilka brands kundtjänstrutinen kör för, och var deras nycklar
// ligger. Noll beroenden, inga nätanrop.
//
// Det finns INGEN handskriven brandlista (samma regel som factory/register.mjs
// och CLAUDE.md: en hårdkodad lista missar nya butiker tyst). Brands upptäcks
// ur två källor och slås ihop:
//
//   1. factory/butiker/<id>.yaml      — varje OPS-butik: brand, supportmail,
//                                        myshopify-domän (judgeme.shop_domain)
//   2. kundtjanst/brands/<id>.yaml    — butiker som inte byggts av fabriken
//                                        (Bäverbutiken, Grillkliniken …) OCH
//                                        överstyrningar för fabriksbutikerna
//                                        (annan mailadress, Notion-SOP-databas,
//                                        Discord-kanal, egna trösklar).
//
// Hemligheterna ligger ALDRIG i filerna — bara NAMNEN på miljövariablerna
// härleds här, så att samma repo går att köra på vilket Claude-konto som helst:
// den som ska köra rutinen lägger in variablerna i sitt Environment på
// claude.ai och behöver inte röra en enda fil.
//
//   KUNDTJANST_MAIL_PASS_<ID>     lösenordet till supportbrevlådan (Loopia)   KRÄVS
//   KUNDTJANST_MAIL_USER_<ID>     användarnamn om det inte är supportmailen   valfri
//   KUNDTJANST_MAIL_HOST_<ID>     IMAP-värd om inte Loopia                    valfri
//   SHOPIFY_SHOP_<ID> + SHOPIFY_ADMIN_TOKEN_<ID>                              valfri
//     eller SHOPIFY_CLIENT_ID_<ID> + SHOPIFY_CLIENT_SECRET_<ID>  (samma namn
//     som fabriken, factory/token.mjs losNycklar — en butik som redan byggts
//     av fabriken har dem redan)
//   NOTION_TOKEN, DISCORD_BOT_TOKEN, ANTHROPIC_NYCKEL                         delade, valfria
//
// <ID> är butiks-id:t i VERSALER med allt som inte är A–Z/0–9 ersatt av `_`
// (factory/token.mjs envSuffix): `tacklebay` → TACKLEBAY, `my-shop` → MY_SHOP.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, basename } from 'node:path';
import { lasYaml } from '../factory/yaml.mjs';
import { envSuffix, losNycklar, suffixForDoman } from '../factory/token.mjs';

export const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
export const FABRIKENS_BUTIKER = join(ROT, 'factory', 'butiker');
export const EGNA_BRANDS = join(ROT, 'kundtjanst', 'brands');

/** Loopias IMAP-server (Loopia Sverige, alla brevlådor). Portar: 993 SSL. */
export const LOOPIA_IMAP = Object.freeze({ host: 'mailcluster.loopia.se', port: 993 });

/** Trösklarna som gäller om brandfilen inte säger annat. Alla i klartext så
 *  Axel kan ändra dem per brand utan att läsa kod. */
export const STANDARD_TROSKLAR = Object.freeze({
  arenden_dagar: 30,             // hur långt bakåt mejlen läses. ⚠️ Var 7 till 2026-09-13
                                 // — då föll allt obesvarat äldre än en vecka ur rapporten,
                                 // alltså precis de farligaste ärendena. 30 matchar ordrarnas
                                 // fönster, så tvistgraden räknas på samma period.
  obesvarad_timmar: 48,          // inkommande utan svar längre än så = larm
  ofullbordad_dagar: 5,          // betald order utan fulfillment längre än så = larm
  tvistgrans_gul_procent: 0.5,   // CHARGEBACKS / ordrar: gult härifrån
  tvistgrans_rod_procent: 0.9,   // rött härifrån (Visas program slår in vid 0,9 %, Mastercards vid 1 %)
  ordrar_dagar: 30,              // hur många dagars ordrar tvistgraden räknas mot
  // ⚠️ Den ANDRA tvistgraden: (chargebacks + inquiries) / ordrar. Den mäter
  // något annat än korttnätverkens tal ovan — hur ofta en bank hör av sig
  // alls — och den är alltid högre. Mätt på Bäverbutiken 2026-09-22:
  // chargebacks 0,19 % men allt 1,91 % (4 cb + 36 inquiries / 2 091 ordrar).
  // Månaden före: 0,14 % / 0,21 %. Inquiries gick från 1 till 36 medan
  // ordrarna växte 46 % — det syntes inte i någon rapport, för vi räknade
  // bara chargebacks.
  // Trösklarna står med flit på null = visa talet, döm det inte. Vad Shopify
  // självt mäter när de håller utbetalningar är INTE avläst någonstans, och
  // ska läsas på deras egen skärm innan en gräns skrivs in här.
  tvistgrans_allt_gul_procent: null,
  tvistgrans_allt_rod_procent: null,
});

/**
 * Värdena tvist-SOP:erna (kundtjanst/sop/) fyller sina {{PLATSHÅLLARE}} med.
 * Samma SOP-text körs på alla butiker — det här blocket är det enda som
 * skiljer dem åt. Allt som är tomt här MÅSTE fyllas per butik; SOP:en säger
 * själv vad som inte går att göra utan det. Gissa aldrig åt en butik.
 * `node kundtjanst/sop-koll.mjs --lista` visar hela listan.
 */
export const STANDARD_TVISTER = Object.freeze({
  returadress: '',            // står sällan i policyn — VA:n skickar den för hand
  returadress_pa_forfragan: true, // adressen står inte publikt; kunden ber om den
  returfonster_dagar: null,   // butikens EGEN policy. null = oläst, läs policy_url
  angerratt_dagar: 14,        // lagstadgad ångerrätt, EU/Sverige (distansavtalslagen 2005:59)
  returfrakt_betalas_av: '',  // {{RETURN_POSTAGE_PAID_BY}} — 'kund' / 'butik'. '' = obestämt
  policy_url: '',
  billing_descriptor: '',     // Shopify → Settings → Payments → Customer billing statement
  strid_lonar_sig_over: 0,    // 0 = slåss om allt
  // Eskaleringen: vem VA:n frågar, och var gränsen för egna beslut går.
  agare_kontakt: '',          // {{OWNER_CONTACT}} — namn/handle VA:n eskalerar till
  godkannande_over: 0,        // {{REFUND_APPROVAL_LIMIT}} — 0 = allt får beslutas själv
  ersattning_over: 0,         // {{REPLACEMENT_LIMIT}} — ersättningsvara utan att fråga
  forsta_svar_timmar: 24,     // {{FIRST_REPLY_TARGET_HOURS}} — svarstidsmålet
});

/**
 * Autosvarets inställningar (kundtjanst/autosvar.mjs). Allt som står i ett
 * svar till en kund kommer härifrån, ur Shopify eller ur 17TRACK — aldrig ur
 * huvudet. Tomt = autosvaret säger det i --kolla och hoppar den delen.
 */
export const STANDARD_SVAR = Object.freeze({
  autosvar: true,             // false = motorn rör inte brevlådan (flaggar inte heller)
  sprak: '',                  // sv|nb|da|fi|en — standard ur brand.land när tomt
  signatur: '',               // "Kundtjänst Bäverbutiken" — tomt = "<Kundtjänst på kundens språk> <brand>"
  leverans_dagar: [7, 14],    // butikens leveranslöfte, kalenderdagar från skickdagen (mejl/konfig.json frakt)
  packas_dagar: 2,            // arbetsdagar innan en betald order skickas
  sparningssida: '',          // https://baverbutiken.se/pages/spara — kundens spårningssida (sparning/butiker.json handle)
  sparning_prefix: 'BB-',     // bävernumrets prefix på sidan (sparning/butiker.json prefix)
  va_mapp: 'VA-PRIO',         // mappen ARGA trådar flyttas till — VA:n tar den först
  svarstid_timmar: 24,        // "vi svarar inom N timmar på vardagar" — måste hållas
  eskalering_timmar: 48,      // det ARGA svarets "du kan räkna med svar inom N timmar" (Axels beslut 2026-09-22: sätt 48, svara snabbare)
  max_per_korning: 20,        // spärr: fler automatiska svar än så per körning och butik skickas aldrig
  fonster_timmar: 72,         // hur gamla inkommande mejl som får ett automatiskt svar
  fraga_ordernummer: false,   // SOP 36 steg 1: WISMO utan order ⇒ be om ordernumret (annars SVÅR). Axels beslut per butik
  foretag: null,              // SOP 38: { namn, orgnr, adress, moms } — bara de godkända uppgifterna, aldrig ett personnamn. null = VA:n
});

/** Vad fabrikens butiksfil ger. Fälten som saknas blir '' — aldrig påhittade. */
export function brandUrButiksfil(b, id) {
  const bu = b?.butik ?? {};
  // Fabriksbutiken bär sitt leveranslöfte ("5–10 arbetsdagar") och sin
  // domän i butiksfilen — autosvaret tar det därifrån om brandfilen tystnar.
  const lev = String(b?.frakt?.leveranstid ?? '').match(/(\d+)\s*[–-]\s*(\d+)\s*arbetsdag/);
  const svar = {};
  if (lev) svar.leverans_dagar = [Math.round(Number(lev[1]) * 1.4), Math.round(Number(lev[2]) * 1.4)];
  return {
    id,
    brand: String(bu.brand ?? '').trim() || id,
    supportmail: String(bu.supportmail ?? '').trim().toLowerCase(),
    shop: String(b?.judgeme?.shop_domain ?? bu.myshopify ?? '').trim().toLowerCase(),
    land: String(bu.land ?? '').trim() || 'SE',
    valuta: String(bu.valuta ?? '').trim() || 'SEK',
    kalla: 'factory/butiker',
    svar,
  };
}

/** Vad en egen brandfil ger (kundtjanst/brands/<id>.yaml). Samma form. */
export function brandUrEgenfil(b, id) {
  const bu = b?.brand ?? b ?? {};
  // Tomma fält lämnas TOMMA här (inte id/SE/SEK), så en egen fil som bara
  // lägger på Notion-id eller stänger av brandet aldrig skriver över
  // fabriksfilens namn, land eller valuta. Standardvärdena sätts sist, i
  // upptackBrands.
  return {
    id,
    brand: String(bu.namn ?? bu.brand ?? '').trim(),
    supportmail: String(bu.supportmail ?? '').trim().toLowerCase(),
    shop: String(bu.shop ?? '').trim().toLowerCase(),
    land: String(bu.land ?? '').trim(),
    valuta: String(bu.valuta ?? '').trim(),
    kalla: 'kundtjanst/brands',
    aktiv: bu.aktiv !== false,
    mail: b?.mail ?? {},
    discord: b?.discord ?? {},
    notion: b?.notion ?? {},
    trosklar: b?.trosklar ?? {},
    // shopify.env_suffix: när Shopify-nycklarna heter något annat än <ID>
    // (Axels val 2026-09-13: SHOPIFY_CLIENT_ID_BAVERBUTIKEN_EMAILSCRAPER).
    shopify: b?.shopify ?? {},
    // Värdena tvist-SOP:erna i kundtjanst/sop/ fyller sina {{PLATSHÅLLARE}}
    // med. Samma SOP-text körs på alla butiker; det här blocket är det enda
    // som skiljer dem. `node kundtjanst/sop-koll.mjs --lista` visar vilka.
    tvister: b?.tvister ?? {},
    // Autosvarets inställningar (STANDARD_SVAR) — signatur, leveranslöfte,
    // spårningssida, VA-mappen.
    svar: b?.svar ?? {},
  };
}

/** Butikens eget språk ur landet: SE→sv, NO→nb, DK→da, FI→fi, allt annat en. */
export function sprakForLand(land) {
  return { SE: 'sv', NO: 'nb', DK: 'da', FI: 'fi' }[String(land ?? '').toUpperCase()] ?? 'en';
}

/** Standardvärdena för det som fortfarande är tomt efter sammanslagningen. */
function medStandard(b) {
  return { ...b, brand: b.brand || b.id, land: b.land || 'SE', valuta: b.valuta || 'SEK' };
}

function yamlFiler(mapp) {
  if (!existsSync(mapp)) return [];
  return readdirSync(mapp).filter((f) => f.endsWith('.yaml') && !f.endsWith('-mall.yaml')).sort();
}

/**
 * Alla brands, sammanslagna. Ren över filsystemet — ingen miljö läses här.
 * Fabriksbutiken är basen, den egna filen lägger på och vinner fält för fält.
 * `testbutiken` är en fixtur och hoppas alltid över.
 */
export function upptackBrands({ fabrik = FABRIKENS_BUTIKER, egna = EGNA_BRANDS } = {}) {
  const karta = new Map();
  for (const f of yamlFiler(fabrik)) {
    const id = basename(f, '.yaml');
    if (id === 'testbutiken') continue;
    let b;
    try { b = lasYaml(readFileSync(join(fabrik, f), 'utf8')); } catch { continue; }
    karta.set(id, { ...brandUrButiksfil(b, id), aktiv: true, mail: {}, discord: {}, notion: {}, trosklar: {}, shopify: {}, tvister: {} });
  }
  for (const f of yamlFiler(egna)) {
    const id = basename(f, '.yaml');
    let b;
    try { b = lasYaml(readFileSync(join(egna, f), 'utf8')); } catch (e) {
      throw new Error(`kundtjanst/brands/${f} går inte att läsa: ${e.message}`);
    }
    const egen = brandUrEgenfil(b, id);
    const bas = karta.get(id);
    if (!bas) { karta.set(id, egen); continue; }
    karta.set(id, {
      ...bas,
      ...Object.fromEntries(Object.entries(egen).filter(([k, v]) => !(v === '' || v === undefined) && !['mail', 'discord', 'notion', 'trosklar', 'shopify', 'tvister', 'svar', 'kalla'].includes(k))),
      kalla: `${bas.kalla} + kundtjanst/brands`,
      mail: { ...bas.mail, ...egen.mail },
      discord: { ...bas.discord, ...egen.discord },
      notion: { ...bas.notion, ...egen.notion },
      trosklar: { ...bas.trosklar, ...egen.trosklar },
      tvister: { ...(bas.tvister ?? {}), ...egen.tvister },
      shopify: { ...(bas.shopify ?? {}), ...egen.shopify },
      svar: { ...(bas.svar ?? {}), ...egen.svar },
    });
  }
  return [...karta.values()].map(medStandard).sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Namnen på miljövariablerna för ett brand — det setup skriver ut.
 * `shopifySuffix` (brandfilens `shopify.env_suffix`) byter bara Shopify-namnens
 * svans: `BAVERBUTIKEN_EMAILSCRAPER` ⇒ SHOPIFY_CLIENT_ID_BAVERBUTIKEN_EMAILSCRAPER.
 */
export function envNamn(id, shopifySuffix = null) {
  const s = envSuffix(id);
  const sh = shopifySuffix ? envSuffix(String(shopifySuffix)) : s;
  return {
    mailPass: `KUNDTJANST_MAIL_PASS_${s}`,
    mailUser: `KUNDTJANST_MAIL_USER_${s}`,
    mailHost: `KUNDTJANST_MAIL_HOST_${s}`,
    shop: `SHOPIFY_SHOP_${sh}`,
    adminToken: `SHOPIFY_ADMIN_TOKEN_${sh}`,
    clientId: `SHOPIFY_CLIENT_ID_${sh}`,
    clientSecret: `SHOPIFY_CLIENT_SECRET_${sh}`,
    shopifySuffix: sh,
  };
}

/**
 * Brandet + det miljön ger, som en färdig körkonfig. Ren över `env`.
 * Ingen hemlighet returneras i klartext utom i `mail.pass`/`shopify.*`, som
 * bara run.mjs läser — logga aldrig objektet rakt av.
 */
export function korkonfig(brand, env = process.env) {
  const n = envNamn(brand.id, String(brand.shopify?.env_suffix ?? '').trim() || null);
  const m = brand.mail ?? {};
  const user = (env[n.mailUser] || m.user || brand.supportmail || '').trim();
  const host = (env[n.mailHost] || m.host || LOOPIA_IMAP.host).trim();
  const pass = env[n.mailPass] || '';
  const nycklar = losNycklar(brand.id, env);
  // Utan per-butik-suffix faller losNycklar tillbaka på de ALLMÄNNA
  // SHOPIFY_-variablerna — det är rätt i fabriken (en butik i taget) men fel
  // här, där alla brands körs i samma process. Shop-domänen måste därför
  // antingen komma ur brandets egen variabel eller ur brandfilen, och den
  // allmänna används bara om den pekar på just det här brandets domän.
  const shopEgen = (env[n.shop] || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const shop = shopEgen || brand.shop || (nycklar.shop === brand.shop ? nycklar.shop : '');
  // Reservvägen (2026-09-21): finns ingen variabel med brandets eget suffix,
  // men en SHOPIFY_SHOP_<X> som bär exakt brandets domän, så används den
  // uppsättningens nycklar (samma uppslag som fabriken: token.mjs
  // suffixForDoman). Mätt i sessionens container: SHOPIFY_SHOP_NO/DK/FI pekar
  // på Beverbutikken/Bæverbutiken/Majavakauppa och deras appar har
  // read_orders, medan KUNDTJANST-nycklarna med brand-suffix saknas där.
  const domanSuffix = shop ? suffixForDoman(shop, env) : null;
  const perButik = (namn) => env[`${namn}_${n.shopifySuffix}`] ?? env[`${namn}_${brand.id}`]
    ?? (domanSuffix && !env[`${namn}_${n.shopifySuffix}`] ? env[`${namn}_${domanSuffix}`] : undefined) ?? '';
  // Shopify CLI:s token (atkn_…) ger ALLTID 401 mot Admin API (factory/token.mjs
  // vet det sedan tidigare; mätt igen 2026-09-12 på Bäverbutiken i en ny
  // container). Den räknas därför inte som token — client credentials från
  // appen på dev.shopify.com används i stället om de finns.
  const adminTokenRa = perButik('SHOPIFY_ADMIN_TOKEN');
  const cliToken = /^\s*atkn_/i.test(adminTokenRa);
  const adminToken = cliToken ? '' : adminTokenRa;
  const clientId = perButik('SHOPIFY_CLIENT_ID');
  const clientSecret = perButik('SHOPIFY_CLIENT_SECRET');
  const shopifyVag = shop && adminToken ? 'token' : shop && clientId && clientSecret ? 'client_credentials' : null;
  const shopifySaknas = cliToken
    ? `${n.adminToken} är en Shopify CLI-token (atkn_…) som Admin API alltid avvisar — lägg in ${n.clientId} + ${n.clientSecret} från appen på dev.shopify.com (som fabriken), eller en shpat_-token från en custom app i adminpanelen`
    : `${n.adminToken} (eller ${n.clientId} + ${n.clientSecret})`;

  return {
    ...brand,
    trosklar: { ...STANDARD_TROSKLAR, ...(brand.trosklar ?? {}) },
    tvister: { ...STANDARD_TVISTER, ...(brand.tvister ?? {}) },
    svar: { ...STANDARD_SVAR, ...(brand.svar ?? {}), sprak: String(brand.svar?.sprak ?? '').trim() || sprakForLand(brand.land) },
    mail: {
      host,
      port: Number(m.port) || LOOPIA_IMAP.port,
      user,
      pass,
      // Vägen in: 'auto' = IMAP först, webbmejl (HTTPS) om nätet spärrar IMAP
      // (så är det på claude.ai). 'imap' / 'webmail' tvingar en av dem.
      via: ['imap', 'webmail', 'auto'].includes(String(m.via ?? '').toLowerCase()) ? String(m.via).toLowerCase() : 'auto',
      webmail: (env[`KUNDTJANST_WEBMAIL_URL_${envSuffix(brand.id)}`] || m.webmail || 'https://webmail.loopia.se/').trim(),
      inkorg: m.inkorg || 'INBOX',
      // Loopia lägger skickat i "Sent"; äldre klienter i "INBOX.Sent". Listan
      // provas i ordning tills en mapp går att välja.
      skickat: Array.isArray(m.skickat) ? m.skickat : m.skickat ? [m.skickat] : ['Sent', 'INBOX.Sent', 'Skickat', 'Sent Items'],
      konfigurerad: Boolean(user && pass),
      saknas: [!user && `${n.mailUser} (eller supportmail i brandfilen)`, !pass && n.mailPass].filter(Boolean),
    },
    shopify: {
      shop,
      adminToken,
      clientId,
      clientSecret,
      vag: shopifyVag,
      konfigurerad: Boolean(shopifyVag),
      cliToken,
      saknas: shop
        ? (shopifyVag ? [] : [shopifySaknas])
        : [`${n.shop} (eller shop i brandfilen)`],
    },
    delade: {
      notion: Boolean(env.NOTION_TOKEN),
      discord: Boolean(env.DISCORD_BOT_TOKEN || env.DISCORD_WEBHOOK_URL || env[`DISCORD_WEBHOOK_URL_${envSuffix(brand.id)}`]),
      anthropic: Boolean(env.ANTHROPIC_NYCKEL || env.ANTHROPIC_API_KEY),
    },
    envNamn: n,
  };
}

/** Välj brands efter argument: ett id, en kommalista, eller alla aktiva. */
export function valjBrands(alla, onskat) {
  const aktiva = alla.filter((b) => b.aktiv !== false);
  if (!onskat || onskat === '--alla' || onskat === 'alla' || onskat === 'all') return aktiva;
  const ids = String(onskat).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  const ut = [];
  for (const id of ids) {
    const b = alla.find((x) => x.id === id || x.brand.toLowerCase() === id);
    if (!b) throw new Error(`Brandet "${id}" finns inte. Kända: ${alla.map((x) => x.id).join(', ')}.`);
    ut.push(b);
  }
  return ut;
}

if (process.argv[1] && process.argv[1].endsWith('brands.mjs')) {
  const alla = upptackBrands();
  console.log(`\n${alla.length} brands upptäckta (factory/butiker + kundtjanst/brands):\n`);
  for (const b of alla) {
    const k = korkonfig(b);
    const mail = k.mail.konfigurerad ? '✅ mail' : `❌ mail (saknar ${k.mail.saknas.join(', ')})`;
    const shop = k.shopify.konfigurerad ? `✅ shopify (${k.shopify.vag})` : `⚠️ shopify (saknar ${k.shopify.saknas.join(', ')})`;
    console.log(`  ${b.id.padEnd(14)} ${b.brand.padEnd(14)} ${(b.supportmail || '(ingen supportmail)').padEnd(28)} ${b.aktiv === false ? '(inaktiv) ' : ''}${mail} · ${shop}`);
  }
  console.log('');
}
