#!/usr/bin/env node
// autosvar.mjs — kundtjänstverktyget som svarar på ENKLA mejl själv, lugnar
// ARGA kunder inom en minut och lämnar allt SVÅRT till VA:n. Alla butiker.
//
//   node kundtjanst/autosvar.mjs --brand baverbutiken --torr      läs, klassa, skriv svaren som UTKAST i Drafts, flagga
//   node kundtjanst/autosvar.mjs --brand baverbutiken             skarpt: svaren skickas
//   node kundtjanst/autosvar.mjs --alla --discord                 alla brands med brevlåda, rapport i #customer-service
//   node kundtjanst/autosvar.mjs --alla --loop 60                 minut-servern: samma kod, om och om igen
//   node kundtjanst/autosvar.mjs --kolla                          vad går att läsa/skriva, vilka nycklar saknas
//   --max 20        tak på automatiska svar per körning och butik (standard svar.max_per_korning)
//   --fonster 72    hur gamla mejl (timmar) som får ett svar (standard svar.fonster_timmar)
//   --igen          KALIBRERING: bortse från flaggor och loggen, bedöm fönstrets mejl på nytt
//                   (Axels feedbackrunda 2026-09-22 — bara i torrläge, aldrig i rutinen: Sent/Drafts
//                   vaktar fortfarande mot dubbelsvar, men loggens "en gång per tråd" är avstängd)
//   --json          maskinläsbart resultat på stdout
//
// Flödet per butik (Axels spec 2026-09-21):
//   1. Lista inkorgen nyast först, läs de mejl som är nyare än fönstret och
//      inte står i loggen (kundtjanst/autosvar/logg/<butik>.jsonl).
//   2. Bygg kundens tråd: alla mejl från adressen i inkorgen + våra svar i
//      Sent och Drafts (arenden.mjs trådar på References/ämne). Mapparna
//      läses 30 dagar bakåt, HELA listan, en gång per körning (mappIndex) —
//      inte bara första sidan: första torrkörningen 2026-09-21 skrev två av
//      tre ENKEL-utkast till kunder vi redan svarat, för svaren låg på sida
//      4 och 5 av 12 i Skickat. Kostar ~30 s per körning (25 sidor inkorg +
//      9 sidor Skickat, mätt samma kväll) — bara när något ska bedömas.
//   3. Hinka (autosvar/hinkar.mjs): SKIP / ENKEL / ARG / SVÅR.
//   4. ENKEL: fakta ur Shopify + 17TRACK (autosvar/fakta.mjs). Saknas de ⇒ SVÅR.
//   5. Svara (autosvar/svar.mjs) — skickas, eller sparas som utkast med --torr.
//      ARG ⇒ svar + flagga + flytta till VA-mappen. SVÅR ⇒ bara flagga.
//   6. Logga, rapportera (autosvar/rapport.mjs), Discord med --discord.
//
// Järnreglerna (testade i test/autosvar.test.mjs):
//   • Max ETT automatiskt svar per tråd, någonsin. Ett svar från oss i tråden
//     (Sent), ett utkast (Drafts) eller en rad i loggen ⇒ inget nytt svar.
//   • Aldrig svar på autosvar, listmejl, systemmejl, egna adresser, tvistord
//     eller mejl med bilaga. Aldrig löften, aldrig en annan kunds order.
//   • Kundens språk. Signatur = butikens supportnamn. Rätt butiksnamn.
//   • --torr = utkast. Loggen maskerar kundadressen.
//
// CONNECTORS: inga. Brevlådan via KUNDTJANST_MAIL_PASS_<ID> (Loopias webbmejl),
// Shopify via brandets nycklar, 17TRACK via TRACK17_API_KEY (valfri), Discord
// via DISCORD_BOT_TOKEN. Modellen används INTE — reglerna dömer.

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { upptackBrands, korkonfig, valjBrands } from './brands.mjs';
import { Brevlada, tolkaListdatum } from './brevlada.mjs';
import { tolkaMejl } from './mime.mjs';
import { byggArenden } from './arenden.mjs';
import { ShopifyLasare } from './shopify.mjs';
import { anthropicNyckel } from '../tools/lib/anthropic-nyckel.mjs';
import { maskeraAdress } from './maskera.mjs';
import { HINK, hinka, beslut, redanBesvaradAvOss, arReturfraga } from './autosvar/hinkar.mjs';
import { hamtaFakta } from './autosvar/fakta.mjs';
import { skrivEnkelt, skrivArgt, lageRader, returText, valjSprak, fornamn, xNyckelFor, villHaFoton, fotonTypFor, namnerBekraftelse, namnerStillaSparning } from './autosvar/svar.mjs';
import { lasLogg, skrivLogg, minne, redanAutosvar, kundHash, kundNyssSvarad, minnsSvar, LOGGMAPP } from './autosvar/logg.mjs';
import { renderaDiscord, renderaSvensk, orsakEn } from './autosvar/rapport.mjs';
import { kundUrKontaktformular } from './autosvar/kontaktformular.mjs';
import { nyckel as nyckel17 } from '../sparning/17track.mjs';

const ROT = dirname(dirname(fileURLToPath(import.meta.url)));
const TIMME = 3_600_000;

/**
 * Hela flödet för ETT brand. Allt som rör nätet injiceras så det går att
 * testa: `brevlada` (Brevlada eller falsk), `shopify` (ShopifyLasare eller
 * null), `hamta17` (17TRACK-läsare eller null), `loggmapp`.
 */
export async function korBrand(brand, {
  env = process.env, nu = new Date(), torr = true, brevlada = null, shopify = undefined, hamta17 = null,
  loggmapp = LOGGMAPP, max = null, fonsterTimmar = null, logg = () => {}, cache = new Map(), igen = false,
} = {}) {
  const konfig = korkonfig(brand, env);
  const kord = nu.toISOString();
  const res = { brand: konfig, kord, torr, hoppad: false, orsak: null, rader: [], varningar: [], antalLasta: 0 };
  if (konfig.svar.autosvar === false) return { ...res, hoppad: true, orsak: 'autosvar avstängt i brandfilen (svar.autosvar: false)' };
  if (!brevlada && !konfig.mail.konfigurerad) return { ...res, hoppad: true, orsak: `brevlådan kan inte läsas — saknar ${konfig.mail.saknas.join(', ')}` };

  const b = brevlada ?? new Brevlada(konfig, { logg });
  const sh = shopify !== undefined ? shopify : (konfig.shopify.konfigurerad
    ? new ShopifyLasare({ shop: konfig.shopify.shop, adminToken: konfig.shopify.adminToken, clientId: konfig.shopify.clientId, clientSecret: konfig.shopify.clientSecret, butikId: brand.id, logg })
    : null);
  if (!sh) res.varningar.push(`Shopify inte kopplat (saknar ${konfig.shopify.saknas.join(', ')}) — ENKLA orderfrågor går till VA:n i stället för att besvaras`);
  if (!hamta17 && !nyckel17(env)) res.varningar.push('TRACK17_API_KEY saknas — svaren bär skickdatum och spårningslänk, inga skanningar');
  if (!konfig.svar.sparningssida) res.varningar.push('svar.sparningssida saknas i brandfilen — svaren får ingen länk till spårningssidan');

  const taket = Number(max ?? konfig.svar.max_per_korning) || 20;
  const fonster = (Number(fonsterTimmar ?? konfig.svar.fonster_timmar) || 72) * TIMME;
  // --igen (bara torrt): loggen och flaggorna är minnet från förra körningarna — kalibreringen ska bedöma om.
  if (igen && !torr) throw new Error('--igen är en kalibrering och kräver --torr: skarpt skulle svara två gånger i samma tråd');
  const minnet = igen ? minne([]) : minne(lasLogg(brand.id, loggmapp));
  if (igen) res.varningar.push('--igen: flaggor och loggen ignorerade — kalibreringskörning, utkasten kan gälla mejl VA:n redan sett');
  let svarade = 0;

  // Tvisterna läses EN gång per körning: en order med en tvist får aldrig
  // ett automatiskt svar (Axels järnregel), och Shopifys tvistnotis kommer
  // som ett eget mejl som motorn inte kan knyta till kundens fråga.
  let tvister = [];
  if (sh && typeof sh.hamtaTvister === 'function') {
    try {
      const t = await sh.hamtaTvister(new Date(nu.getTime() - 180 * 24 * TIMME));
      if (t.tillganglig === false) res.varningar.push(`tvisterna gick inte att läsa (${t.orsak}) — en order med tvist kan få ett ENKELT svar, VA:n bör veta det`);
      else tvister = t.lista ?? [];
    } catch (e) {
      res.varningar.push(`tvisterna gick inte att läsa (${e.message.slice(0, 100)})`);
    }
  }

  // 1. Kandidaterna: inkorgen nyast först, tills mejlen är äldre än fönstret.
  const inkorg = konfig.mail.inkorg || 'INBOX';
  const lista = await b.lista({ mapp: inkorg, sida: 1, antal: 50 });
  const kandidater = [];
  for (const rad of lista.rader) {
    if (rad.flaggad && !igen) continue;              // redan hos VA:n (eller redan hanterad av oss)
    let m;
    try { m = await lasMejl(b, inkorg, rad.uid, cache); }
    catch (e) {
      // VA:n kan flytta ett mejl mellan listningen och läsningen — då är det hennes, inte ett fel i körningen.
      if (e.kod === 'MEJL_SAKNAS') { res.varningar.push(`uid ${rad.uid} (${rad.amne?.slice(0, 40) ?? ''}) fanns inte kvar i inkorgen när det skulle läsas — hoppat`); continue; }
      throw e;
    }
    res.antalLasta++;
    if (m.datum && nu.getTime() - m.datum.getTime() > fonster) break;   // äldre än fönstret — och listan är datumsorterad
    if (m.messageId && minnet.hanterade.has(m.messageId)) continue;
    kandidater.push({ rad, m });
  }

  // 2–6. Ett mejl i taget, NYAST först: skriver kunden tre gånger i samma
  // tråd är det senaste mejlet som ska få det enda svaret, och de äldre ser
  // sen (via minnet) att tråden redan är svarad.
  const index = new Map();   // mapplistorna (inkorg, Skickat, Drafts) 30 dagar bakåt — per KÖRNING, aldrig över loopen
  for (const { rad, m } of kandidater) {
    const mejl = { ...m, bilaga: rad.bilaga };
    const grund = hinka({ mejl, brand: konfig });
    const hash = kundHash(mejl.fran?.adress);
    const post = { tid: kord, uid: m.uid, messageId: m.messageId, kund: mejl.fran?.adress ?? '', kundHash: hash, amne: mejl.amne, kontaktformular: Boolean(mejl.kontaktformular), hink: grund.hink, typ: grund.typ, kategori: grund.klass.kategori, ordernummer: grund.klass.ordernummer, sprak: valjSprak(grund.klass.sprak, konfig.svar.sprak), orsak: grund.orsak, atgard: 'hoppad', torr };
    if (grund.hink === HINK.SKIP) { skrivLogg(brand.id, post, loggmapp); res.rader.push(post); continue; }

    // Tråden: kundens mejl i inkorgen + våra svar i Sent och Drafts.
    let trad = null;
    try {
      trad = await byggTrad(b, konfig, mejl, { cache, index, nu });
      for (const v of index.values()) if (v.varning && !res.varningar.includes(v.varning)) res.varningar.push(v.varning);
      trad.redanAutosvar = redanAutosvar(minnet, { tradnyckel: trad.id, ids: [...(mejl.references ?? []), mejl.messageId, ...trad.ids] })
        || kundNyssSvarad(minnet, hash, { nu: nu.getTime() });
    } catch (e) {
      res.varningar.push(`Tråden för uid ${m.uid} gick inte att läsa (${e.message.slice(0, 80)}) — mejlet flaggas till VA:n utan svar`);
    }
    const hink = trad ? hinka({ mejl, brand: konfig, trad }) : { ...grund, hink: HINK.SVAR, orsak: 'tråden gick inte att läsa' };
    post.tradnyckel = trad?.id ?? null;
    post.tradIds = trad?.ids ?? [];

    // Fakta för ENKEL (där de avgör svaret) och för ARG om paketet (där de
    // läggs till som ett stycke — en arg "var är paketet"-kund ska få veta det).
    let fakta = null;
    const omPaketet = (hink.klass.alla ?? []).some((x) => ['var_ar_ordern', 'ej_levererad'].includes(x.id));
    const returfraga = arReturfraga({ amne: mejl.amne, text: mejl.text });
    // ARG hämtar alltid faktan: ordern hittas på e-posten även när numret saknas i mejlet (Tobias-feedbacken 2026-09-22), och då behöver svaret inte be om det.
    if ((hink.hink === HINK.ENKEL && ['wismo', 'adress', 'retur'].includes(hink.typ)) || hink.hink === HINK.ARG) {
      fakta = await hamtaFakta({ mejl, klass: hink.klass, konfig, shopify: sh, hamta17, sprak: post.sprak, nu, logg, tvister });
      post.fakta = fakta.kalla;
    }
    const d = beslut({ hink, fakta, trad, brand: konfig });
    Object.assign(post, { hink: d.hink, typ: d.typ, orsak: d.orsak });
    post.orsakEn = orsakEn(post);

    // Svaret
    if (d.svara) {
      if (svarade >= taket) {
        post.orsak = `${post.orsak} — men taket ${taket} svar per körning är nått, flaggas i stället`;
        post.orsakEn = `${post.orsakEn} — run cap ${taket} reached, flagged instead`;
        d.svara = false; d.flagga = true;
      } else {
        let text = null;
        try {
          const stilla = namnerStillaSparning(`${mejl.amne}\n${mejl.text}`);
          const namn = fornamn({ mejlnamn: mejl.fran?.namn, ordernamn: fakta?.order?.kund?.fornamn });
          const ordernummer = fakta?.order?.namn || (hink.klass.ordernummer?.[0] ? `#${hink.klass.ordernummer[0]}` : '');
          if (d.hink === HINK.ARG) {
            const x = xNyckelFor(hink.klass, d.argOrsaker ?? [], `${mejl.amne}\n${mejl.text}`);
            post.x = x;
            // Läget ur Shopify/17TRACK som eget stycke — bara när mejlet handlar om paketet, med färsk fakta (ingen spärr) och kundens egen order.
            let lage = null;
            if (omPaketet && fakta?.order && !fakta.sparr) {
              try { lage = { namn: fakta.order.namn, rader: lageRader({ sprak: post.sprak, fakta, brand: konfig, stilla, nu }) }; }
              catch (e) { lage = null; logg(`uid ${m.uid}: läget kunde inte byggas (${e.message}) — det arga svaret går utan`); }
            }
            post.lage = Boolean(lage);
            // Axels exempel 2026-09-22: "din order har legat opostad i 13 dagar och det är inte acceptabelt" — bara när ordern faktiskt är sen (äldre än packtiden).
            let opostadDagar = null;
            const o = fakta?.order;
            if (o && omPaketet && !fakta.sandning?.skickad && !o.sandningar?.length && o.fulfillment !== 'fulfilled' && o.skapad) {
              const dagar = Math.floor((nu.getTime() - new Date(o.skapad).getTime()) / 86_400_000);
              if (dagar > (Number(konfig.svar.packas_dagar) || 2)) opostadDagar = dagar;
            }
            post.opostadDagar = opostadDagar;
            // Vill kunden returnera ⇒ returinformationen i samma svar (Axels beslut 2026-09-22, Peter).
            const retur = returfraga ? returText({ sprak: post.sprak, brand: konfig, ordernummer }) : null;
            post.retur = Boolean(retur);
            // SOP 05/08: skadad, fel eller undermålig vara ("skräp", "ser inte ut som på bilden") ⇒ be om de tre bilderna i samma svar (Axels feedback 2026-09-22: "jättebra att vi frågar efter bilder direkt").
            const foton = villHaFoton(hink.klass) || ['kvalitet', 'som_pa_bilden', 'skadad_defekt', 'fel_vara'].includes(x);
            // Vilka bilder: 'vara' (slutat fungera ⇒ bild/video på felet) eller 'leverans' (transportskada/fel vara ⇒ varan, förpackningen, fraktetiketten). Hans bränslepump 2026-09-22.
            const fotonTyp = fotonTypFor({ klass: hink.klass, text: `${mejl.amne}\n${mejl.text}` });
            if (foton) post.fotonTyp = fotonTyp;
            // Saknas ordernumret (inte i mejlet, ingen order på adressen) ber svaret om det i stället för "har du mer information".
            post.behoverOrdernummer = !ordernummer;
            text = skrivArgt({ sprak: post.sprak, kategori: hink.klass.kategori, brand: konfig, xNyckel: x, foton, fotonTyp, lage, namn, opostadDagar, retur, behoverOrdernummer: !ordernummer }).text;
          } else {
            const fotonTyp = d.typ === 'foton' ? fotonTypFor({ klass: hink.klass, text: `${mejl.amne}\n${mejl.text}` }) : 'leverans';
            if (d.typ === 'foton') post.fotonTyp = fotonTyp;
            text = skrivEnkelt({ typ: d.typ, sprak: post.sprak, fakta: fakta ?? {}, brand: konfig, namn, bekraftelse: namnerBekraftelse(`${mejl.amne}\n${mejl.text}`), stilla, behoverOrdernummer: !(hink.klass.ordernummer?.length), ordernummer, fotonTyp, nu }).text;
          }
        } catch (e) {
          text = null;
          post.hink = HINK.SVAR;
          post.orsak = `svaret gick inte att bygga (${e.message}) — VA:n`;
          post.orsakEn = `could not build the reply (${e.message}) — VA`;
          d.svara = false; d.flagga = true; d.flytta = false;
        }
        if (text) {
          if (harForbjudet(text)) {
            res.varningar.push(`uid ${m.uid}: svaret innehöll ett förbjudet ord (löfte/rabatt) och stoppades — VA:n`);
            post.hink = HINK.SVAR; post.orsak = 'svaret stoppades av löftesspärren'; post.orsakEn = 'reply blocked by the promise guard'; d.svara = false; d.flagga = true; d.flytta = false;
          } else {
            try {
              // forvantadTill: Roundcube måste vilja skicka till just den här kunden — annars inget svar.
              const r = await b.svara(m.uid, { mapp: inkorg, text, utkast: torr, forvantadTill: mejl.fran.adress });
              post.atgard = r.typ === 'utkast' ? 'utkast' : 'svar';
              post.utkastUid = r.utkastUid ?? null;
              // Roundcube ger "Namn <adress>" — maskera adressen, inte hela strängen (första loggen 2026-09-21 fick "An***@hotmail.com>").
              post.till = maskeraAdress((String(r.till ?? '').match(/<([^>]+)>/) ?? [null, r.till])[1]);
              svarade++;
              // Minnet uppdateras direkt: nästa mejl i samma tråd eller från samma kund i den här körningen får inget svar till.
              minnsSvar(minnet, { tradnyckel: post.tradnyckel, ids: [...post.tradIds, m.messageId], hash, nu: nu.getTime() });
              logg(`${d.hink} ${post.atgard} → ${post.till} (uid ${m.uid})`);
            } catch (e) {
              res.varningar.push(`uid ${m.uid}: svaret kunde inte ${torr ? 'sparas som utkast' : 'skickas'}: ${e.message.slice(0, 160)}`);
              post.atgard = 'fel'; post.fel = e.message.slice(0, 200);
              d.flagga = true;
            }
          }
        }
      }
    }
    // Flaggan och VA-mappen — efter svaret (uid:t byts vid flytten).
    if (d.flagga) {
      try { await b.flagga(m.uid, { mapp: inkorg }); post.flaggad = true; if (post.atgard === 'hoppad') post.atgard = 'flaggad'; }
      catch (e) { res.varningar.push(`uid ${m.uid}: kunde inte flagga: ${e.message.slice(0, 120)}`); }
    }
    if (d.flytta && konfig.svar.va_mapp) {
      try { const r = await b.flytta(m.uid, { mapp: inkorg, till: konfig.svar.va_mapp, skapa: true }); post.flyttad = r.till; }
      catch (e) { res.varningar.push(`uid ${m.uid}: kunde inte flytta till ${konfig.svar.va_mapp}: ${e.message.slice(0, 120)}`); }
    }
    skrivLogg(brand.id, post, loggmapp);
    res.rader.push(post);
  }
  return res;
}

/**
 * Ett mejl ur brevlådan, tolkat, med cache per uid (loop-läget läser samma
 * lista varje minut). Shopifys kontaktformulär-notiser blir kundens eget
 * mejl här (autosvar/kontaktformular.mjs) — kunden som avsändare, kundens
 * ord som text — så hinkar, tråd, fakta och logg ser samma kund överallt.
 */
async function lasMejl(b, mapp, uid, cache) {
  const nyckel = `${mapp}:${uid}`;
  if (cache.has(nyckel)) return cache.get(nyckel);
  const r = await b.las(uid, { mapp, ra: true });
  const m = kundUrKontaktformular(tolkaMejl(r.ra, { uid, mapp }));
  cache.set(nyckel, m);
  return m;
}

/**
 * Ord som aldrig får stå i ett automatiskt svar — löften och pengar. Ren.
 * Sista spärren före sändning: mallarna innehåller inte orden, men den
 * som ändrar en mall ska inte kunna lova en återbetalning av misstag.
 * (`\b` fungerar inte före å/ä/ö — därför samma ordgräns som klassificeringen.)
 */
export function harForbjudet(text) {
  // Länkar räknas inte: returpolicyn heter …/policies/refund-policy, och en
  // länk lovar ingenting (kalibreringen 2026-09-22 stoppade returinformationen på den).
  const t = String(text ?? '').replace(/https?:\/\/\S+/gi, ' ').toLowerCase();
  return /(^|[^a-zåäöøæ])(rabatt|discount|coupon|kupong|återbetal|refund|refusjon|refusion|hyvity|ersättning|erstatning|kompensation|compensation|gratis|free of charge|garanterar|guarantee|promise|lovar)/.test(t);
}

export const TRAD_DAGAR = 30;      // hur långt tillbaka kundens mejl och våra svar söks — samma fönster som ärendena
export const TRAD_MAXSIDOR = 40;   // säkerhetstak per mapp (~2 000 rader); nås det står det i rapporten

/**
 * Alla rader i en mapp (nyast först) som är nyare än `dagar` — läses sida
 * för sida ur Roundcubes lista (billig: inga råmejl) tills en hel sida är
 * äldre än gränsen. EN gång per mapp och körning (`index`). Roundcubes
 * visningsdatum tolkas av tolkaListdatum; en rad som inte går att datera
 * stoppar aldrig läsningen. Kastar MAPP_SAKNAS vidare.
 *
 * Varför inte sok() på första sidan: Skickat har 12 sidor hos Bäverbutiken
 * (576 mejl, mätt 2026-09-21) och svaren VA:n skrev för en vecka sedan låg
 * på sida 4 och 5 — två av tre ENKEL-utkast i första torrkörningen gick till
 * kunder som redan hade ett svar från oss.
 */
export async function mappIndex(b, mapp, { index = new Map(), nu = new Date(), dagar = TRAD_DAGAR, maxSidor = TRAD_MAXSIDOR } = {}) {
  const nyckel = `index:${mapp}`;
  if (index.has(nyckel)) return index.get(nyckel);
  const sedan = nu.getTime() - dagar * 86_400_000;
  const rader = [];
  let varning = null;
  let sidor = 1;
  for (let sida = 1; sida <= maxSidor; sida++) {
    const l = await b.lista({ mapp, sida, antal: 50 });
    sidor = Number(l.sidor ?? 1);
    rader.push(...l.rader);
    if (!l.rader.length || sida >= sidor) break;
    const datum = l.rader.map((r) => tolkaListdatum(r.datum, nu));
    if (datum.every((d) => d && d.getTime() < sedan)) break;
    if (sida === maxSidor) varning = `${mapp}: ${rader.length} rader lästa (${maxSidor} sidor av ${sidor}) utan att nå ${dagar} dagar tillbaka — äldre svar från oss syns inte i trådarna`;
  }
  const ut = { mapp, rader, sidor, varning };
  index.set(nyckel, ut);
  return ut;
}

/**
 * Kundens tråd: alla mejl från adressen i inkorgen + våra svar i Sent och
 * Drafts (mappIndex, 30 dagar) → arenden.byggArenden → ärendet som bär
 * mejlet. Listkolumnerna avgör vilka rader som hör till kunden (billigt);
 * råmejlen hämtas bara för dem (cache). I Skickat/Drafts visar Roundcubes
 * kolumn MOTTAGAREN, så samma jämförelse hittar våra svar till kunden.
 */
export async function byggTrad(b, konfig, mejl, { cache = new Map(), index = new Map(), nu = new Date() } = {}) {
  const adress = mejl.fran.adress;
  const inkorg = konfig.mail.inkorg || 'INBOX';
  const in_ = await mappIndex(b, inkorg, { index, nu });
  const inkommande = [];
  for (const t of in_.rader) if (t.franAdress === adress) inkommande.push(await lasMejl(b, inkorg, t.uid, cache));
  if (!inkommande.some((x) => x.uid === mejl.uid)) inkommande.push(mejl);
  // Våra svar: första Skickat-mapp som finns (namnen är alias), plus Drafts —
  // ett utkast från --torr räknas som ett svar, annars hade nästa körning
  // gjort ett utkast till på samma tråd.
  const skickat = [];
  // VA:ns senaste mejl till kunden i Skickat, oavsett tråd: en kund mitt i
  // ett ärende med VA:n får inget automatiskt svar i en ANNAN tråd heller
  // (hinkar.VA_KUND_DAGAR). Kalibreringen 2026-09-22: Ulf svarade på en
  // Judge.me-recensionsförfrågan ("Skräp! Tills ni skickar 3 nya …") medan
  // VA:n hade skrivit till honom fyra gånger på en vecka i kontaktformulärs-
  // tråden — trådregeln såg det inte, och han fick eskaleringsmallen.
  let vaSenast = null;
  const lasUt = async (mapp, { skarpt = false } = {}) => {
    let r;
    try { r = await mappIndex(b, mapp, { index, nu }); } catch (e) { if (e.kod === 'MAPP_SAKNAS') return false; throw e; }
    for (const t of r.rader) {
      if (t.franAdress !== adress) continue;
      const m = await lasMejl(b, mapp, t.uid, cache);
      if (m.till?.some((x) => x.adress === adress)) {
        skickat.push(m);
        if (skarpt && m.datum && (!vaSenast || m.datum > vaSenast)) vaSenast = m.datum;
      }
    }
    return true;
  };
  for (const mapp of konfig.mail.skickat ?? ['Sent']) if (await lasUt(mapp, { skarpt: true })) break;
  for (const mapp of ['Drafts', 'INBOX.Drafts']) if (await lasUt(mapp)) break;
  const vaDagar = vaSenast ? (nu.getTime() - vaSenast.getTime()) / 86_400_000 : null;
  const byggt = byggArenden({ inkorg: inkommande, skickat, brand: konfig, nu: new Date() });
  const a = byggt.arenden.find((x) => x.uids.includes(mejl.uid)) ?? byggt.arenden.find((x) => x.kund.adress === adress);
  // Sent-mappen är stor (~50 mejl om dagen i Bäverbutiken) och sökningen ser
  // bara första sidan — därför räknas också mejlets egna spår av ett svar
  // från oss (References från vår domän, vår adress i citatet).
  const spar = redanBesvaradAvOss({ mejl, brand: konfig });
  if (!a) return { id: loggnyckel(`${adress}|${mejl.amneNyckel}`), antalInkommande: 1, antalSvar: spar.besvarad ? 1 : 0, ids: [mejl.messageId].filter(Boolean), besvaradSpar: spar.orsak, vaSenast, vaDagar };
  const ids = inkommande.filter((x) => a.uids.includes(x.uid)).map((x) => x.messageId).filter(Boolean);
  return { id: loggnyckel(a.id), antalInkommande: a.antalInkommande, antalSvar: Math.max(a.antalSvar, spar.besvarad ? 1 : 0), ids, besvaradSpar: spar.orsak, vaSenast, vaDagar };
}

/**
 * Trådnyckeln så som den får stå i loggen: adressen före "|" byts mot samma
 * hash som `kundHash` — loggen bär aldrig en kundadress i klartext (Axels
 * järnregel; den första loggen 2026-09-21 hade adressen här). Ren.
 */
export function loggnyckel(nyckel) {
  return String(nyckel ?? '').replace(/^([^|]*@[^|]*)/, (adr) => kundHash(adr.replace(/^<|>$/g, '')));
}

// ------------------------------------------------------------------ CLI

function flagga(args, n, standard = null) {
  const i = args.indexOf(`--${n}`);
  return i !== -1 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : standard;
}

export async function huvud(argv = process.argv.slice(2), env = process.env) {
  const finns = (n) => argv.includes(`--${n}`);
  const torr = finns('torr');
  const loop = flagga(argv, 'loop') ? Math.max(30, Number(flagga(argv, 'loop')) || 60) : 0;
  const alla = upptackBrands();
  if (!flagga(argv, 'brand') && !finns('alla') && !finns('kolla')) {
    console.error('✗ Ange --brand <id> (eller --alla). Kända: ' + alla.map((b) => b.id).join(', ') + '. --kolla visar vad som går att läsa.');
    process.exitCode = 2;
    return { fel: 'saknar --brand/--alla' };
  }
  const brands = valjBrands(alla, flagga(argv, 'brand') ?? '--alla');
  const logg = finns('verbose') || loop ? (m) => console.error(`  ${m}`) : () => {};

  if (finns('kolla')) {
    console.log(`\nAutosvar — ${brands.length} brands:\n`);
    for (const b of brands) {
      const k = korkonfig(b, env);
      console.log(`  ${b.id.padEnd(14)} ${b.brand.padEnd(14)} mail ${k.mail.konfigurerad ? '✅' : `❌ saknar ${k.mail.saknas.join(', ')}`} · shopify ${k.shopify.konfigurerad ? `✅ (${k.shopify.vag})` : `⚠️ saknar ${k.shopify.saknas.join(', ')}`} · spårningssida ${k.svar.sparningssida ? '✅' : '– (svar.sparningssida)'} · språk ${k.svar.sprak} · VA-mapp ${k.svar.va_mapp} · autosvar ${k.svar.autosvar === false ? 'AV' : 'på'}`);
    }
    console.log(`\n  delat: TRACK17_API_KEY ${nyckel17(env) ? '✅' : '– (svaren utan skanningar)'} · DISCORD_BOT_TOKEN ${env.DISCORD_BOT_TOKEN ? '✅' : '❌'} · ANTHROPIC_NYCKEL ${anthropicNyckel(env) ? '✅ (används inte av autosvaret)' : '– (behövs inte)'}\n`);
    return { kolla: true, brands };
  }
  if (!torr && !finns('skarpt')) {
    console.error('✗ Skarp körning kräver --skarpt (annars --torr). Axels ordning 2026-09-21: --torr tills 20 utkast i rad är rätt, sen skarpt på Bäverbutiken en dag, sen alla.');
    process.exitCode = 2;
    return { fel: 'saknar --skarpt' };
  }

  const brevlador = new Map();
  const cache = new Map();
  const korAlla = async () => {
    const ut = [];
    for (const b of brands) {
      const k = korkonfig(b, env);
      if (!k.mail.konfigurerad) { console.error(`▶ ${b.brand}: hoppad — saknar ${k.mail.saknas.join(', ')}`); ut.push({ brand: k, hoppad: true, orsak: `saknar ${k.mail.saknas.join(', ')}` }); continue; }
      if (!brevlador.has(b.id)) brevlador.set(b.id, new Brevlada(k, { logg }));
      let r;
      try {
        r = await korBrand(b, { env, torr, brevlada: brevlador.get(b.id), max: flagga(argv, 'max'), fonsterTimmar: flagga(argv, 'fonster'), logg, cache, igen: finns('igen') });
      } catch (e) {
        r = { brand: k, kord: new Date().toISOString(), torr, hoppad: true, orsak: e.message, rader: [], varningar: [] };
        // En död session får inte döda loopen: nästa varv loggar in igen.
        try { await brevlador.get(b.id).loggaUt(); } catch { /* ok */ }
        brevlador.delete(b.id);
      }
      if (r.hoppad) console.error(`▶ ${b.brand}: hoppad — ${r.orsak}`);
      else {
        console.error(renderaSvensk(r));
        if (finns('discord')) {
          const text = renderaDiscord(r);
          if (text) {
            try { const { postaDiscord } = await import('./run.mjs'); console.error(`  ${await postaDiscord({ brand: k }, { text, env })}`); }
            catch (e) { r.varningar.push(`Discord: ${e.message}`); console.error(`  ⚠️ Discord: ${e.message}`); }
          }
        }
      }
      ut.push(r);
    }
    return ut;
  };

  let resultat = await korAlla();
  if (loop) {
    console.error(`\n↻ loop: kör igen var ${loop}:e sekund (Ctrl-C avslutar, loggar ut).`);
    let kor = true;
    const stopp = async () => { kor = false; for (const b of brevlador.values()) { try { await b.loggaUt(); } catch { /* ok */ } } process.exit(0); };
    process.on('SIGINT', stopp); process.on('SIGTERM', stopp);
    while (kor) {
      await new Promise((ok) => setTimeout(ok, loop * 1000));
      resultat = await korAlla();
    }
  } else {
    for (const b of brevlador.values()) { try { await b.loggaUt(); } catch { /* ok */ } }
  }
  if (finns('json')) console.log(JSON.stringify(resultat.map((r) => ({ brand: r.brand.id, hoppad: r.hoppad, orsak: r.orsak ?? null, torr: r.torr, rader: r.rader?.map((x) => ({ ...x, kund: maskeraAdress(x.kund) })) ?? [], varningar: r.varningar ?? [] })), null, 2));
  return { resultat };
}

if (process.argv[1] && process.argv[1].endsWith('autosvar.mjs')) {
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
    const { spawnSync } = await import('node:child_process');
    const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', cwd: ROT, env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' } });
    process.exit(r.status ?? 1);
  }
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
