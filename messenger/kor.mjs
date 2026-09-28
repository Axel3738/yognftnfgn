#!/usr/bin/env node
// messenger/kor.mjs — Messenger-svararen: läser alla sidors DM:s (Messenger +
// Instagram), svarar kunden själv när frågan är enkel, lugnar arga kunder och
// lämnar allt annat till VA:n. Axels beställning 2026-09-28: "den går igenom
// alla Messenger DM som vi får på alla profiler … och bara svarar kunderna.
// Det är många som kan vara sura … och säger att vi inte svarar på mailen."
//
//   node messenger/kor.mjs --kolla             vilka sidor går att läsa/svara på
//   node messenger/kor.mjs --torr              bedöm och visa svaren — skickar inget (standard)
//   node messenger/kor.mjs --skarpt --discord  rutinen: skickar, loggar, rapporterar
//   node messenger/kor.mjs --sida 820358954504320   bara en sida
//   --timmar 72   hur långt bakåt konversationer läses   --json   maskinläsbart
//
// Motorn är mejl-autosvarets (kundtjanst/autosvar/): samma hinkar, samma
// Shopify-uppslag, samma texter och samma löftesspärr — en DM är ett mejl
// utan avsändaradress. Skillnaderna står i messenger/bedom.mjs.
//
// Järnreglerna:
//   • Bara sidor med rad i messenger/konfig.json → sidor får automatiska svar.
//     Alla andra sidors DM:s går till VA:n.
//   • Bara inom 24 h från kundens senaste meddelande (Metas fönster).
//   • Ingen order utan att kunden skrivit orderns e-post i chatten.
//   • Har VA:n skrivit i konversationen de senaste 14 dagarna är kunden hennes.
//   • Max två automatiska svar per konversation och 14 dagar, varav bara ETT
//     riktigt (det andra får bara vara frågan om ordernummer + e-post).
//   • Aldrig svar på bilagor, tvistord, löften eller rabatter.
//
// CONNECTORS: inga. META_ACCESS_TOKEN (+ META_ACCESS_TOKEN_MATSTRUMPOR),
// butikernas Shopify-nycklar, TRACK17_API_KEY (valfri), DISCORD_BOT_TOKEN.

import { readFileSync, appendFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { upptackBrands, korkonfig } from '../kundtjanst/brands.mjs';
import { ShopifyLasare } from '../kundtjanst/shopify.mjs';
import { HINK, hinka, beslut } from '../kundtjanst/autosvar/hinkar.mjs';
import { hamtaFakta } from '../kundtjanst/autosvar/fakta.mjs';
import { skrivEnkelt, skrivArgt, valjSprak, fornamn, xNyckelFor, villHaFoton, fotonTypFor, signatur, lageRader } from '../kundtjanst/autosvar/svar.mjs';
import { harForbjudet } from '../kundtjanst/autosvar.mjs';
import { maskeraText } from '../kundtjanst/maskera.mjs';
import { hamtaSidor, hamtaKonversationer, skickaSvar } from './meta.mjs';
import { lage, somMejl, minneUr, dmOrderText, somChatt, dela, inkorgslank, kundHash } from './bedom.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const TIMME = 3_600_000;
export const LOGGMAPP = process.env.MESSENGER_LOGGMAPP || join(HAR, 'logg');
const konfig = JSON.parse(readFileSync(join(HAR, 'konfig.json'), 'utf8'));
// META_ACCESS_TOKEN_MESSENGER först: en EGEN token med pages_messaging, så att
// huvudnyckeln som alla annonsrutiner hänger på aldrig behöver bytas. Första
// token som ger en sida vinner (hamtaSidor tar bort dubbletter på id).
const TOKENS = (env) => ({ META_ACCESS_TOKEN_MESSENGER: env.META_ACCESS_TOKEN_MESSENGER, META_ACCESS_TOKEN: env.META_ACCESS_TOKEN, META_ACCESS_TOKEN_MATSTRUMPOR: env.META_ACCESS_TOKEN_MATSTRUMPOR });

export function lasLogg(mapp = LOGGMAPP) {
  if (!existsSync(mapp)) return [];
  const ut = [];
  for (const f of readdirSync(mapp).filter((f) => f.endsWith('.jsonl')).sort()) {
    for (const l of readFileSync(join(mapp, f), 'utf8').split('\n')) {
      if (!l.trim()) continue;
      try { ut.push(JSON.parse(l)); } catch { /* trasig rad */ }
    }
  }
  return ut;
}

function skrivLogg(post, mapp = LOGGMAPP) {
  mkdirSync(mapp, { recursive: true });
  appendFileSync(join(mapp, `${post.tid.slice(0, 7)}.jsonl`), JSON.stringify(post) + '\n');
}

/**
 * Bedömer ETT väntande DM och bygger svaret. Nätet injiceras (shopify, hamta17).
 * Returnerar posten (loggraden) + `text` (svaret, eller null).
 */
export async function bedomEtt(l, { sida, brand = null, minnet, nu = new Date(), shopify = null, hamta17 = null, tvister = [], logg = () => {} }) {
  const f = konfig.fonster;
  const post = {
    tid: nu.toISOString(), sida: sida.id, sidnamn: sida.namn, brand: brand?.id ?? null, platform: l.platform,
    konversation: l.konversation, senasteId: l.senasteId, kundHash: kundHash(l.kundId),
    utdrag: maskeraText(l.text).slice(0, 160), timmar: Math.round(l.timmarSedan * 10) / 10,
    hink: null, typ: null, kategori: null, sprak: null, orsak: null, atgard: 'va',
  };
  const va = (orsak) => ({ post: { ...post, hink: post.hink ?? HINK.SVAR, orsak }, text: null });

  if (!brand) return va(`sidan har ingen butik i messenger/konfig.json — VA:n svarar`);
  const mejl = somMejl(l);
  const grund = hinka({ mejl, brand });
  Object.assign(post, { hink: grund.hink, typ: grund.typ, kategori: grund.klass.kategori, sprak: valjSprak(grund.klass.sprak, brand.svar?.sprak ?? 'sv'), orsak: grund.orsak });
  if (grund.hink === HINK.SKIP) return { post: { ...post, atgard: 'hoppad' }, text: null };
  if (l.timmarSedan > f.svar_timmar) return va(`kundens senaste meddelande är ${Math.round(l.timmarSedan)} h gammalt — utanför Metas 24-timmarsfönster, VA:n svarar`);

  const auto = minnet.autosvar.get(l.konversation) ?? { antal: 0, riktiga: 0 };
  if (auto.antal >= f.max_autosvar_per_konversation || auto.riktiga >= 1) return va('konversationen har redan fått ett automatiskt svar — andra meddelandet går till VA:n');
  const trad = {
    antalSvar: 0, redanAutosvar: false,
    // Sidans senaste meddelande var VÅRT automatiska (dm_order) ⇒ inte VA:ns ärende.
    vaDagar: auto.antal > 0 ? null : l.egenDagar,
  };
  const hink = hinka({ mejl, brand, trad });
  let fakta = null;
  const kraverOrder = hink.hink === HINK.ENKEL && ['wismo', 'adress', 'retur'].includes(hink.typ);
  if (kraverOrder && !mejl.harEpost && hink.typ !== 'retur') {
    // Ingen e-post i chatten ⇒ ingen order går att knyta till kunden. Fråga i stället.
    if (trad.vaDagar != null && trad.vaDagar <= f.va_kund_dagar) return va(`VA:n skrev i konversationen för ${Math.round(trad.vaDagar)} dagar sedan — kunden är hennes`);
    Object.assign(post, { hink: HINK.ENKEL, typ: 'dm_order', orsak: `${hink.typ}: ingen e-post i chatten — ber om ordernummer + e-post` });
    return { post, text: dmOrderText({ sprak: post.sprak, namn: fornamn({ mejlnamn: l.kundNamn }), signatur: signatur(brand, post.sprak) }) };
  }
  if ((kraverOrder || hink.hink === HINK.ARG) && mejl.harEpost) {
    fakta = await hamtaFakta({ mejl, klass: hink.klass, konfig: brand, shopify, hamta17, sprak: post.sprak, nu, logg, tvister });
    post.fakta = fakta.kalla;
  }
  const d = beslut({ hink, fakta, trad, brand });
  Object.assign(post, { hink: d.hink, typ: d.typ, orsak: d.orsak });
  if (!d.svara) return va(d.orsak);

  const namn = fornamn({ mejlnamn: l.kundNamn, ordernamn: fakta?.order?.kund?.fornamn });
  const ordernummer = fakta?.order?.namn || (hink.klass.ordernummer?.[0] ? `#${hink.klass.ordernummer[0]}` : '');
  let text;
  if (d.hink === HINK.ARG) {
    const x = xNyckelFor(hink.klass, d.argOrsaker ?? [], mejl.text);
    const foton = villHaFoton(hink.klass) || ['kvalitet', 'som_pa_bilden', 'skadad_defekt', 'fel_vara'].includes(x);
    const fotonTyp = fotonTypFor({ klass: hink.klass, text: mejl.text });
    let lageStycke = null;
    if (fakta?.order && !fakta.sparr) { try { lageStycke = { namn: fakta.order.namn, rader: lageRader({ sprak: post.sprak, fakta, brand, nu }) }; } catch { lageStycke = null; } }
    text = skrivArgt({ sprak: post.sprak, kategori: hink.klass.kategori, brand, xNyckel: x, foton, fotonTyp, lage: lageStycke, namn, behoverOrdernummer: !ordernummer }).text;
  } else {
    const fotonTyp = d.typ === 'foton' ? fotonTypFor({ klass: hink.klass, text: mejl.text }) : 'leverans';
    text = skrivEnkelt({ typ: d.typ, sprak: post.sprak, fakta: fakta ?? {}, brand, namn, stilla: false, behoverOrdernummer: !ordernummer, ordernummer, fotonTyp, nu }).text;
  }
  text = somChatt(text);
  if (harForbjudet(text)) return va('svaret stoppades av löftesspärren (löfte/rabatt/återbetalning)');
  if (/[—–]/.test(text)) return va('svaret innehöll tankstreck — stoppat');
  return { post, text };
}

/** Hela körningen. Returnerar { sidor[], rader[], varningar[] }. */
export async function korAlla({ env = process.env, nu = new Date(), skarpt = false, bara = null, timmar = null, logg = (s) => console.error(s), loggmapp = LOGGMAPP } = {}) {
  const tokens = TOKENS(env);
  const res = { tid: nu.toISOString(), skarpt, sidor: [], rader: [], varningar: [] };
  if (!Object.values(tokens).some(Boolean)) throw new Error('META_ACCESS_TOKEN saknas i miljön.');
  const { sidor, fel } = await hamtaSidor({ tokens, logg });
  res.varningar.push(...fel);
  const brands = new Map(upptackBrands().map((b) => [b.id, b]));
  const minnet = minneUr(lasLogg(loggmapp), { nu, dagar: konfig.fonster.va_kund_dagar });
  const sedan = new Date(nu.getTime() - (Number(timmar) || konfig.fonster.las_timmar) * TIMME);
  const shopifyCache = new Map();
  let svarade = 0;

  for (const sida of sidor) {
    if (bara && !bara.includes(sida.id)) continue;
    const rad = konfig.sidor[sida.id];
    const brandFil = rad?.brand ? brands.get(rad.brand) : null;
    const brand = brandFil ? korkonfig(brandFil, env) : null;
    const s = { id: sida.id, namn: sida.namn, brand: brand?.id ?? null, messenger: null, instagram: null };
    res.sidor.push(s);
    if (rad?.brand && !brandFil) res.varningar.push(`${sida.namn}: brandfilen ${rad.brand} finns inte — DM:s går till VA:n`);

    let sh = null; let tvister = [];
    if (brand?.shopify?.konfigurerad) {
      if (!shopifyCache.has(brand.id)) {
        const l = new ShopifyLasare({ shop: brand.shopify.shop, adminToken: brand.shopify.adminToken, clientId: brand.shopify.clientId, clientSecret: brand.shopify.clientSecret, butikId: brand.id, logg: () => {} });
        let t = [];
        try { const r = await l.hamtaTvister(new Date(nu.getTime() - 180 * 24 * TIMME)); t = r.lista ?? []; } catch { /* tvisterna okända — svaren kräver ändå e-post */ }
        shopifyCache.set(brand.id, { l, t });
      }
      ({ l: sh, t: tvister } = shopifyCache.get(brand.id));
    }

    const plattformar = ['messenger', ...(sida.ig ? ['instagram'] : [])];
    for (const platform of plattformar) {
      const { konversationer, fel: kfel } = await hamtaKonversationer(sida, { platform, sedan, logg });
      if (kfel) { s[platform] = { fel: kfel }; continue; }
      s[platform] = { konversationer: konversationer.length, vantar: 0 };
      const sidIds = [sida.id, sida.ig?.id].filter(Boolean);
      for (const c of konversationer) {
        const l = lage(c, { sidIds, nu });
        if (!l || minnet.hanterade.has(l.senasteId)) continue;
        s[platform].vantar++;
        let r;
        try { r = await bedomEtt(l, { sida, brand, minnet, nu, shopify: sh, tvister, logg }); }
        catch (e) { r = { post: { tid: nu.toISOString(), sida: sida.id, sidnamn: sida.namn, konversation: l.konversation, senasteId: l.senasteId, hink: HINK.SVAR, atgard: 'fel', orsak: `bedömningen föll: ${e.message.slice(0, 160)}` }, text: null }; }
        const { post } = r;
        post.lank = inkorgslank(sida.id, platform);
        if (r.text) {
          if (svarade >= konfig.max_per_korning) { post.atgard = 'va'; post.orsak = `${post.orsak} — taket ${konfig.max_per_korning} svar per körning nått`; }
          else if (!skarpt) { post.atgard = 'torr'; post.svar = r.text; }
          else {
            try {
              for (const del of dela(r.text, konfig.max_tecken)) await skickaSvar(sida, l.kundId, del);
              post.atgard = 'svar'; svarade++;
              const a = minnet.autosvar.get(l.konversation) ?? { antal: 0, riktiga: 0 };
              a.antal++; if (post.typ !== 'dm_order') a.riktiga++;
              minnet.autosvar.set(l.konversation, a);
            } catch (e) { post.atgard = 'fel'; post.fel = e.message.slice(0, 200); }
          }
          // ARG ⇒ svaret går ut OCH VA:n tar över.
          if (post.hink === HINK.ARG) post.vaOcksa = true;
        }
        if (skarpt) { skrivLogg(post, loggmapp); minnet.hanterade.add(l.senasteId); }
        res.rader.push(post);
      }
    }
  }
  return res;
}

/** Discord-texten per brand (engelska). null = inget att säga. */
export function renderaDiscord(namn, rader, { skarpt }) {
  const svar = rader.filter((r) => r.atgard === 'svar' || r.atgard === 'torr');
  const va = rader.filter((r) => r.atgard === 'va' || r.atgard === 'fel' || r.vaOcksa);
  if (!svar.length && !va.length) return null;
  const ut = [`**Messenger/Instagram DMs — ${namn}**${skarpt ? '' : ' (DRY RUN, nothing sent)'}`];
  ut.push(`Answered automatically: **${svar.length}** · For the VA: **${va.length}**`);
  if (va.length) {
    ut.push('', '**Answer these in the inbox (Meta Business Suite):**');
    for (const r of va.slice(0, 15)) ut.push(`• ${r.hink === 'ARG' ? '🔴 upset · ' : ''}${r.sidnamn} · ${r.platform} · \`${String(r.utdrag ?? '').replace(/`/g, "'").slice(0, 90)}\` · ${r.orsakEn ?? engelskOrsak(r)} · ${r.lank}`);
    if (va.length > 15) ut.push(`• … and ${va.length - 15} more`);
  }
  return ut.join('\n');
}

function engelskOrsak(r) {
  const o = String(r.orsak ?? '');
  if (/24-timmars/.test(o)) return 'older than 24 h, the bot may not reply';
  if (/ingen butik/.test(o)) return 'page has no store config';
  if (/redan fått ett automatiskt/.test(o)) return 'second message after the auto-reply';
  if (/VA:n skrev|pågående/.test(o)) return 'you are already talking to this customer';
  if (/bilaga/.test(o)) return 'has an attachment (photo/voice)';
  if (/tvist/.test(o)) return 'mentions a dispute/chargeback';
  if (r.hink === 'ARG') return 'calming reply sent — follow up';
  if (r.atgard === 'fel') return 'bot error';
  return 'needs a person';
}

async function huvud() {
  const a = process.argv.slice(2);
  const har = (f) => a.includes(`--${f}`);
  const varde = (f) => { const i = a.indexOf(`--${f}`); return i >= 0 ? a[i + 1] : null; };
  if (har('kolla')) {
    const { sidor, fel } = await hamtaSidor({ tokens: TOKENS(process.env) });
    let lasbara = 0;
    for (const s of sidor) {
      const r = await hamtaKonversationer(s, { platform: 'messenger', sedan: new Date(Date.now() - 72 * TIMME), maxSidor: 1 });
      const rad = konfig.sidor[s.id];
      if (!r.fel) lasbara++;
      console.log(`${r.fel ? '❌' : '✅'} ${s.namn} (${s.id})${rad ? ` → ${rad.brand}` : ' → ingen butik (bara VA)'}: ${r.fel ? r.fel.slice(0, 110) : `${r.konversationer.length} konversationer senaste 72 h`}`);
    }
    for (const f of fel) console.log(`⚠️ ${f}`);
    console.log(`\n${lasbara} av ${sidor.length} sidor går att läsa.${lasbara ? '' : ' Token:en saknar pages_messaging — se messenger/README.md → "Rättigheten".'}`);
    process.exit(lasbara ? 0 : 3);
  }
  const skarpt = har('skarpt');
  const res = await korAlla({ skarpt, bara: varde('sida')?.split(','), timmar: varde('timmar') });
  const lasta = res.sidor.filter((s) => s.messenger && !s.messenger.fel);
  if (har('json')) { console.log(JSON.stringify(res, null, 2)); }
  else {
    for (const s of res.sidor) console.log(`${s.namn}: ${s.messenger?.fel ? `❌ ${s.messenger.fel.slice(0, 100)}` : `${s.messenger?.konversationer ?? 0} konv., ${s.messenger?.vantar ?? 0} väntar`}${s.instagram ? ` · IG ${s.instagram.fel ? '❌' : `${s.instagram.vantar} väntar`}` : ''}`);
    for (const r of res.rader) {
      console.log(`\n[${r.atgard}] ${r.sidnamn} · ${r.hink}${r.typ ? `/${r.typ}` : ''} · ${r.sprak ?? '?'} · "${r.utdrag}"\n  ${r.orsak}`);
      if (r.svar) console.log(`  ── svar ──\n  ${r.svar.replace(/\n/g, '\n  ')}`);
    }
    for (const v of res.varningar) console.log(`⚠️ ${v}`);
    console.log(`\n${lasta.length} av ${res.sidor.length} sidor lästa · ${res.rader.length} väntande DM:s · svar ${res.rader.filter((r) => ['svar', 'torr'].includes(r.atgard)).length} · till VA:n ${res.rader.filter((r) => r.atgard !== 'svar' && r.atgard !== 'torr' && r.atgard !== 'hoppad').length}${skarpt ? '' : ' · TORRT, inget skickat'}`);
  }
  if (har('discord')) {
    const { postaDiscord } = await import('../kundtjanst/run.mjs');
    const brands = new Map(upptackBrands().map((b) => [b.id, b]));
    const perBrand = new Map();
    for (const r of res.rader) { const k = r.brand ?? '_utan'; if (!perBrand.has(k)) perBrand.set(k, []); perBrand.get(k).push(r); }
    for (const [id, rader] of perBrand) {
      const b = brands.get(id);
      const text = renderaDiscord(b?.brand ?? 'pages without a store', rader, { skarpt });
      if (!text) continue;
      const egenServer = b?.discord?.server;
      try {
        const ut = await postaDiscord({ brand: b ? korkonfig(b) : { id: 'messenger' } }, { text, server: egenServer ? null : konfig.discord_reserv.server, kanal: egenServer ? null : konfig.discord_reserv.kanal });
        console.error(`  ${ut}`);
      } catch (e) { console.error(`  ⚠️ Discord (${id}): ${e.message}`); }
    }
  }
  if (!lasta.length) process.exit(3);
}

if (process.argv[1] && process.argv[1].endsWith('messenger/kor.mjs')) {
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
