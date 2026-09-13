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
import { envSuffix, losNycklar } from '../factory/token.mjs';

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
  tvistgrans_gul_procent: 0.5,   // tvister / ordrar: gult härifrån
  tvistgrans_rod_procent: 0.9,   // rött härifrån (Visas program slår in vid 0,9 %, Mastercards vid 1 %)
  ordrar_dagar: 30,              // hur många dagars ordrar tvistgraden räknas mot
});

/** Vad fabrikens butiksfil ger. Fälten som saknas blir '' — aldrig påhittade. */
export function brandUrButiksfil(b, id) {
  const bu = b?.butik ?? {};
  return {
    id,
    brand: String(bu.brand ?? '').trim() || id,
    supportmail: String(bu.supportmail ?? '').trim().toLowerCase(),
    shop: String(b?.judgeme?.shop_domain ?? '').trim().toLowerCase(),
    land: String(bu.land ?? '').trim() || 'SE',
    valuta: String(bu.valuta ?? '').trim() || 'SEK',
    kalla: 'factory/butiker',
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
  };
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
    karta.set(id, { ...brandUrButiksfil(b, id), aktiv: true, mail: {}, discord: {}, notion: {}, trosklar: {}, shopify: {} });
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
      ...Object.fromEntries(Object.entries(egen).filter(([k, v]) => !(v === '' || v === undefined) && !['mail', 'discord', 'notion', 'trosklar', 'shopify', 'kalla'].includes(k))),
      kalla: `${bas.kalla} + kundtjanst/brands`,
      mail: { ...bas.mail, ...egen.mail },
      discord: { ...bas.discord, ...egen.discord },
      notion: { ...bas.notion, ...egen.notion },
      trosklar: { ...bas.trosklar, ...egen.trosklar },
      shopify: { ...(bas.shopify ?? {}), ...egen.shopify },
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
  const perButik = (namn) => env[`${namn}_${n.shopifySuffix}`] ?? env[`${namn}_${brand.id}`] ?? '';
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
