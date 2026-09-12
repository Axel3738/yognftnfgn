// OPS Factory — hela kedjan: butikskonfig + produktfiler → färdig OPS-butik.
//
//   node factory/ops.mjs factory/butiker/<butik>.yaml factory/produkter/<p1>.yaml [<p2>.yaml …]
//        [--dry-run] [--resume] [--igen <steg[,steg]>] [--launch] [--store-ready]
//
//   --dry-run      listar varje steg och vad det skulle göra. Rör ALDRIG nätet.
//   --resume       hoppar över steg som redan är gröna i factory/state/
//   --igen <steg>  kör om ett (eller flera, kommaseparerat) steg även om det är
//                  grönt — övriga gröna steg hoppas över som med --resume
//   --launch       publicerar produkterna — vägrar om någon produkt är röd i QA
//   --store-ready  kör slutsteget (factory/store-ready.mjs): recensioner via
//                  API om token finns, pixel + CAPI, Discord
//
// Gamla formen fungerar också:  BUILD <produkt.yaml>  /  LAUNCH <produkt.yaml>
//
// KÖRORDNINGEN är KEDJAN.md:s tabell — STEG nedan är exakt den (id, nivå,
// modul, stoppar/manuell). Nivå `butik` körs EN gång per butik, nivå
// `produkt` en gång per produktfil (factory/FLERPRODUKT.md). State per nivå:
// <butik>--_butik.json och <butik>--<produkt>.json.
//
// Regler som sitter i motorn (KEDJAN.md):
//   1. ETT tema-id, låst i butiksstaten efter tema-upload (arbetstemaId).
//      Varje temasteg använder hamtaArbetstema(<det id:t>) — aldrig "första
//      UNPUBLISHED". Varje skrivning läses tillbaka.
//   2. Idempotent: varje steg tål att köras två gånger.
//   3. Grön konfiguration är inte en grön butik: QA hämtar riktig HTML
//      (kundvy-kor.mjs) — utan HTML är QA röd, aldrig grön.
//   4. Slutrapporten har TVÅ listor ur state: Gjort av mig / Väntar på en
//      människa. Ett manuellt steg returnerar { manuell } och stoppar aldrig.
//
// Inget steg loggar hemligheter — state filtreras genom rensaHemligheter.
// Publicerar ALDRIG något utan --launch. Köper aldrig plan eller domän.
// Startar aldrig annonser — Meta rörs bara av store-ready (pixeln).

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname, basename } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { valideraButik, sammanfoga, arNischbutik } from './butik.mjs';
import { lasLaunchInput, tillampaLaunchInput } from './launch-input.mjs';
import { validera } from './validera.mjs';
import { byggPlan, produktHandle } from './build-store.mjs';
import { byggForhandsvisning, kundUnderrubrik } from './sida.mjs';
import { laddaEnv } from './env.mjs';
import { byggFraktplan, byggFraktatgarder } from './frakt.mjs';
import {
  BUTIKSNYCKEL,
  lasState,
  skrivState,
  arKlart,
  markeraKlart,
  markeraManuell,
  lasArbetstemaId,
  lasArbetstemaNamn,
  sattArbetstemaId,
  byggSlutrapport,
  slutrapportText,
} from './state.mjs';
import {
  kontrolleraAnslutning,
  hamtaProduktViaHandle,
  skapaProdukt,
  publiceraProdukt,
  publiceraIButiken,
  skrivKollektion,
  skrivPolicy,
  skrivSida,
  skrivMetafalt,
  hamtaArbetstema,
  skrivTemafiler,
  hamtaTemafil,
  verifieraTemafiler,
  skrivMeny,
  hamtaFraktzoner,
  tillampaFraktatgarder,
} from './shopify.mjs';
import { anslut } from './token.mjs';
import { laddaUppTema, standardTemanamn, kompletteraTema } from './tema-upload.mjs';
import { laddaUppBild } from './filer.mjs';
import { laddaUppLogga } from './logga.mjs';
import { byggStartsida, byggFooterGroup, startsideRader, bilderAttLaddaUpp } from './startsida.mjs';
import { skannaTema, rapport as kallrapport, tackning } from './kallskanning.mjs';
import { hamtaAllaTemafiler } from './kallskanning-kor.mjs';
import { avbranda } from './avbranda.mjs';
import { kontrolleraLaunch } from './kontroll.mjs';
import { byggPolicyer, kontaktsida, angerknappUrl } from './policyer.mjs';
import { huvudmenyRader } from './meny.mjs';
import { byggMetafalt } from './metafalt.mjs';
import { sattContinue } from './lagerpolicy.mjs';
import { sakerstallBonus } from './bonus.mjs';
import { byggPaketplan, byggPaket, paketRader } from './paket.mjs';
import { sakerstallMarknader, oversattAllt } from './marknad.mjs';
import { byggUnderlag, lasOversattning } from './oversattning.mjs';
import { granska as granskaOversattning } from './oversattning-granska.mjs';
import { hamtaStartsida, hamtaProduktsida } from './kundvy-kor.mjs';
import { kontrolleraKundvy, strukturkoll, produktkoll, svenskaMarkorer, lasMarkorer, filtreraMarkorer } from './kundvy.mjs';
import { samlaLage } from './trippelkoll.mjs';
import { byggJudgeMeCsv, byggJudgeMeAppCsv, byggJudgeMeCsvOversatt } from './judgeme.mjs';
import { byggChecklista } from './checklista.mjs';
import {
  byggBrandCss,
  byggSettingsPatch,
  laggInBrandCss,
  brandRader,
  valideraBranding,
} from './branding.mjs';
import {
  SEKTIONER,
  TEMAFILER,
  byggProduktTemplate,
  sektionerSomVisas,
  byggHeaderGroup,
  rensaSettings,
  settingsSchemaMedAb,
  patchaMsPaket,
  patchaMsPaketValuta,
  msHeadGallerifilter,
  GALLERIFILTER_MARKE,
  byggKorgUpsell,
  byggTillagg,
  harTillagg,
  tillaggTexter,
  lasTemaJson,
  gemensamtPaketTest,
} from './tema.mjs';
import { qaSektionsfiler, qaRenderadSida } from './tema-qa.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
export const IKON = { ok: '✅', kritisk: '❌', manuell: '🖐' };
const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const lista = (v) => (Array.isArray(v) ? v.filter((x) => x !== null && x !== '') : []);
const sov = (ms) => new Promise((r) => setTimeout(r, ms));

function stopp(rubrik, rader) {
  console.error(`\n❌ STOPP — ${rubrik}`);
  for (const r of rader) console.error(`   • ${r}`);
  console.error('');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Hjälpare för temasteg
// ---------------------------------------------------------------------------

// Tema-id:t ur butiksstaten. Saknas det har tema-upload inte körts — då
// kastar vi hellre än gissar (regel 1). `hamtaArbetstema(id)` verifierar
// sedan att temat finns i butiken.
/**
 * Butiksadressen ur konfigen — den anslutningen ska landa på.
 *
 * `butik.myshopify` är det uttryckliga fältet; `judgeme.shop_domain` är
 * reserven, eftersom butikerna som byggdes före 2026-09-10 bara har den.
 * Saknas båda blir det null och anslutningen faller tillbaka på butiks-id:t
 * som förut — ingen gammal butik går sönder av det här.
 */
export function onskadDomanUr(butik) {
  const b = butik?.butik ?? {};
  const kandidat = b.myshopify ?? b.myshopify_doman ?? butik?.judgeme?.shop_domain ?? null;
  const t = String(kandidat ?? '').trim();
  return t === '' ? null : t;
}

export function kravArbetstemaId(ctx) {
  const id = lasArbetstemaId(ctx.butiksstate);
  if (!id) throw new Error('Inget arbetstema i state — kör steget tema-upload först (--igen tema-upload).');
  return id;
}

async function arbetstema(ctx) {
  return hamtaArbetstema(kravArbetstemaId(ctx));
}

// Verifiering efter skrivning (regel 1). Liquid/JS/CSS byte för byte
// (verifieraTemafiler). JSON-filer läses tillbaka och jämförs som VÄRDEN —
// Shopify normaliserar JSON (bytestorleken ändras, mätt av jjwesr och
// damasker 2026-09-09). settings_data.json skrivs om helt av Shopify och
// kontrolleras bara på de nycklar steget satte (`nycklar`).
export function likaJson(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((x, i) => likaJson(x, b[i]));
  if (typeof a === 'object') {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => likaJson(a[k], b[k]));
  }
  return false;
}

async function verifieraSkrivning(temaId, filer, { nycklar = {} } = {}) {
  const fel = [];
  const byte = Object.fromEntries(Object.entries(filer).filter(([f]) => !f.endsWith('.json')));
  if (Object.keys(byte).length > 0) {
    const avvik = await verifieraTemafiler(temaId, byte);
    const rader = Array.isArray(avvik) ? avvik : avvik?.fel ?? [];
    if (rader.length > 0) fel.push(...rader);
  }
  for (const [namn, innehall] of Object.entries(filer).filter(([f]) => f.endsWith('.json'))) {
    const tillbaka = await hamtaTemafil(temaId, namn);
    if (tillbaka === null || tillbaka === undefined) {
      fel.push(`${namn}: finns inte i temat efter uppladdning`);
      continue;
    }
    let j;
    try {
      j = lasTemaJson(tillbaka);
    } catch (e) {
      fel.push(`${namn}: gick inte att tolka efter uppladdning (${e.message})`);
      continue;
    }
    if (namn === 'config/settings_data.json') {
      for (const [k, v] of Object.entries(nycklar)) {
        if (j.current?.[k] !== v) fel.push(`${namn}: ${k} blev ${JSON.stringify(j.current?.[k] ?? null)}, skulle vara ${JSON.stringify(v)}`);
      }
    } else if (!likaJson(j, lasTemaJson(innehall))) {
      fel.push(`${namn}: innehållet efter uppladdning skiljer sig från det som skrevs`);
    }
  }
  return fel;
}

// Skriver settings_schema FÖRST i eget anrop (annars stryker Shopify
// ms_ab_tests ur settings_data), sen resten. Kastar om tillbakaläsningen
// avviker.
async function skrivOchVerifiera(temaId, filer, alternativ = {}) {
  const schema = filer['config/settings_schema.json'];
  const ovriga = { ...filer };
  delete ovriga['config/settings_schema.json'];
  if (schema) await skrivTemafiler(temaId, { 'config/settings_schema.json': schema });
  if (Object.keys(ovriga).length > 0) await skrivTemafiler(temaId, ovriga);
  // Tillbakaläsningen kan komma FÖRE Shopifys egen uppdatering av filen:
  // TackleBay 2026-09-10 läste brand_description som "" direkt efter
  // skrivningen, medan butiken tio sekunder senare bar hela texten. Därför
  // upp till tre läsningar med paus emellan — bara ett kvarstående fel är
  // ett fel. (Verifieringen är regel 1 i KEDJAN.md och tas aldrig bort.)
  let fel = [];
  for (let forsok = 1; forsok <= 3; forsok += 1) {
    fel = await verifieraSkrivning(temaId, ovriga, alternativ);
    if (fel.length === 0) return;
    if (forsok < 3) await new Promise((r) => setTimeout(r, 3000 * forsok));
  }
  throw new Error(`Skrivningen tog inte (tre läsningar): ${fel.join('; ')}`);
}

// Loggan att ladda upp: branding.logga (fil eller URL) eller
// output/<butik>/logga.png. Faviconen på samma sätt. Ingen fil = manuellt.
// Sökvägar tolkas i tur och ordning: URL, absolut/relativt cwd, relativt
// factory/, relativt repo-roten. Angiven men obefintlig fil ⇒ null (manuellt).
export function loggaKallor(butik, { rot = FACTORY_ROT, finns = existsSync } = {}) {
  const id = butik?.butik?.id ?? '';
  const b = butik?.branding ?? {};
  const kand = (varde, fallback) => {
    const v = text(varde);
    if (v) {
      if (/^https?:\/\//i.test(v)) return v;
      for (const k of [v, join(rot, v), join(rot, '..', v)]) if (finns(k)) return k;
      return null;
    }
    return finns(fallback) ? fallback : null;
  };
  return {
    logga: kand(b.logga, join(rot, 'output', id, 'logga.png')),
    favicon: kand(b.favicon, join(rot, 'output', id, 'favicon.png')),
    bredd: Number(b.logga_bredd) > 0 ? Number(b.logga_bredd) : null,
  };
}

// Produkten med butikens handle som id — det kontroll.mjs jämför mot
// (handle ≠ id på TankGuard: filens id `tankguard`, butikens `tankoverdraget`).
const medHandleSomId = (p) => ({ ...p, produkt: { ...p.produkt, id: produktHandle(p) } });

// Översättningsfilen (oversattning.mjs) nycklar recensionerna per produkt:
// recension.<produkt-id>.<i>.titel|text|namn. judgeme.mjs läser dem utan
// produktled (recension.<i>.*) — här plockas den här produktens rader ut och
// nycklas om. Ren logik. Rader utan produktled (äldre filer) följer med som de är.
export function recensionsOversattning(oversattning, produktId) {
  const ut = {};
  for (const [k, v] of Object.entries(oversattning ?? {})) {
    const m = k.match(/^recension\.(.+)\.(\d+)\.(titel|text|namn)$/);
    if (m) {
      if (m[1] === produktId) ut[`recension.${m[2]}.${m[3]}`] = v;
      continue;
    }
    if (/^recension\.\d+\.(titel|text|namn)$/.test(k)) ut[k] = v;
  }
  return ut;
}

// ---------------------------------------------------------------------------
// STEGEN — exakt KEDJAN.md:s körordning. Varje steg:
//   { id, namn, niva, modul, stoppar, torrt(ctx, pk) → rader, kor(ctx, pk) }
//   niva      'butik' (en gång) | 'produkt' (per produktfil)
//   stoppar   true = ett kastat fel stoppar bygget; false = steget svarar
//             { manuell } när det inte kan göras, kedjan går vidare
// `torrt` beskriver utan nätverk; `kor` gör. Båda idempotenta.
// ---------------------------------------------------------------------------

export const STEG = [
  {
    id: 'anslutning',
    namn: 'Anslutningen (rätt butik, token)',
    niva: 'butik',
    modul: 'token.mjs',
    stoppar: true,
    torrt(ctx) {
      const id = ctx.butik.butik.id;
      const rader = [`token.anslut("${id}") — spärrar mot fel butik, gammal state och förbjuden domän`];
      try {
        // torr: bara spärrarna, ingen nätverkstrafik.
        const spärr = ctx.torrAnslutning;
        if (spärr?.ok) rader.push(`spärrarna passerade för ${spärr.domain} (ingen token hämtad i torrläge)`);
        else if (spärr) rader.push(`🖐 ${spärr.skal}`);
      } catch (e) {
        rader.push(`🖐 ${e.message}`);
      }
      return rader;
    },
    async kor(ctx) {
      const r = await anslut(ctx.butik.butik.id, { torr: false, onskadDoman: onskadDomanUr(ctx.butik) });
      console.log(`Connected: ${r.domain} ✓ (${r.name}, token ${r.tokenKalla})`);
      // Hela shop-objektet (policyer, SSL) läses med samma token — QA och
      // paket-steget behöver mer än anslutningens tre fält.
      ctx.shop = await kontrolleraAnslutning();
      return { domain: r.domain, name: r.name, primaryDomain: r.primaryDomain, currencyCode: r.currencyCode, tokenKalla: r.tokenKalla };
    },
  },
  {
    id: 'tema-upload',
    namn: 'CRO-temat upp i butiken',
    niva: 'butik',
    modul: 'tema-upload.mjs',
    stoppar: true,
    torrt(ctx) {
      const id = lasArbetstemaId(ctx.butiksstate);
      return [
        `ops-tema.zip laddas upp som UNPUBLISHED med namnet "${standardTemanamn(ctx.butik.butik.brand)}" (återanvänds om namnet redan finns)`,
        id ? `state har redan arbetstemaId ${id} — det verifieras och behålls` : 'arbetstemaId låses i state efter uppackning',
      ];
    },
    async kor(ctx) {
      // Redan låst tema i state: verifiera att det finns och behåll det —
      // annars laddar en omkörning upp ett andra tema bredvid det första.
      const logg = (rad) => console.log(`   ${rad}`);
      // Tillbakaläsning av uppackningen (tema-upload.mjs kompletteraTema):
      // Shopify tappar avvisade filer TYST. Körs på ett låst tema också —
      // så --igen tema-upload lagar ett tema som packades upp med hål.
      const befintligt = lasArbetstemaId(ctx.butiksstate);
      if (befintligt) {
        try {
          const t = await hamtaArbetstema(befintligt);
          if (t.id === befintligt || String(t.id).endsWith(`/${String(befintligt).split('/').pop()}`)) {
            sattArbetstemaId(ctx.butiksstate, { id: t.id, namn: t.name });
            const k = await kompletteraTema(t.id, { logg });
            return { arbetstemaId: t.id, temaId: t.id, temaNamn: t.name, role: t.role, redanUppe: true, filer: k.antal, kompletterade: k.kompletterade };
          }
        } catch (e) {
          // Temat är borta ur butiken → ladda upp på nytt nedan. Ett
          // kompletteringsfel är däremot ett riktigt fel och ska synas.
          if (/saknar .* av zip:ens filer/.test(e.message)) throw e;
        }
      }
      const tema = await laddaUppTema(standardTemanamn(ctx.butik.butik.brand), { logg });
      sattArbetstemaId(ctx.butiksstate, { id: tema.id, namn: tema.name });
      const k = await kompletteraTema(tema.id, { logg });
      return { arbetstemaId: tema.id, temaId: tema.id, temaNamn: tema.name, role: tema.role, redanUppe: tema.redanUppe, filer: k.antal, kompletterade: k.kompletterade };
    },
  },
  {
    id: 'brand',
    namn: 'Brandingen (butikens egna tokens + rensade inställningar)',
    niva: 'butik',
    modul: 'branding.mjs + tema.mjs (rensaSettings)',
    stoppar: true,
    torrt: (ctx) => [
      ...brandRader(ctx.butik?.branding),
      'config/settings_data.json: sociala länkar tömda, brand_description ur positioneringen, app-inbäddningar = Judge.me' +
        (text(ctx.p?.offer?.paket?.test) ? `, A/B-test "${ctx.p.offer.paket.test}"` : ''),
      'config/settings_schema.json får gruppen OPS A/B-test (skrivs först, eget anrop)',
    ],
    async kor(ctx) {
      const tema = await arbetstema(ctx);
      const filer = { 'assets/opf-brand.css': byggBrandCss(ctx.butik?.branding) };
      const nycklar = {};

      // ms-head ska ladda brand-CSS:en sist, så den vinner över allt annat.
      const msHead = await hamtaTemafil(tema.id, 'snippets/ms-head.liquid');
      if (msHead) {
        const patchad = laggInBrandCss(msHead);
        if (patchad !== msHead) filer['snippets/ms-head.liquid'] = patchad;
      }

      const schema = await hamtaTemafil(tema.id, 'config/settings_schema.json');
      const nyttSchema = schema ? settingsSchemaMedAb(schema) : null;
      if (nyttSchema) filer['config/settings_schema.json'] = nyttSchema;

      // Färgscheman, typsnitt och radier in i temats inställningar — och
      // källbutikens spår ut (rensaSettings). Loggan sätts av loggasteget
      // senare; här töms bara källbutikens logga.
      const rasettings = await hamtaTemafil(tema.id, 'config/settings_data.json');
      if (rasettings) {
        const settings = lasTemaJson(rasettings);
        settings.current = { ...settings.current, ...byggSettingsPatch(ctx.butik?.branding) };
        // Enproduktsbutik: A/B-testet ur produkten. Flerprodukt: bara butiken.
        const produkt = ctx.produkter.length === 1 ? ctx.p : null;
        const rent = rensaSettings(settings, { butik: ctx.butik, produkt });
        filer['config/settings_data.json'] = `${JSON.stringify(rent, null, 2)}\n`;
        if (text(rent.current?.ms_ab_tests)) nycklar.ms_ab_tests = rent.current.ms_ab_tests;
        nycklar.brand_description = rent.current.brand_description;
      }

      await skrivOchVerifiera(tema.id, filer, { nycklar });
      return { temaId: tema.id, filer: Object.keys(filer) };
    },
  },
  {
    id: 'tema',
    namn: 'OPS-temat (sektioner, produktmall, header, upsell)',
    niva: 'butik',
    modul: 'tema.mjs',
    stoppar: true,
    torrt: (ctx) => {
      const perProdukt = ctx.produkter.map((pk) => {
        const { visas, doljs } = sektionerSomVisas(pk.metafalt.map((m) => m.key));
        return `${pk.p.produkt.id}: visar ${visas.join(', ')}${doljs.length > 0 ? ` · döljer ${doljs.join(', ')}` : ''}`;
      });
      const bonus = ctx.produkter.map((pk) => text(pk.p.offer?.bonus_produkt?.handle)).filter(Boolean);
      return [
        `${Object.keys(SEKTIONER).length} opf-sektioner + ${Object.keys(TEMAFILER).length} fabriksägda filer (${Object.keys(TEMAFILER).join(', ')}) in i arbetstemat`,
        'templates/product.json: opf-sektioner efter main, Judge.me i Appyta' +
          (ctx.produkter.length === 1
            ? `, A/B-paketblock${harTillagg(ctx.p) ? ' + fullpris-kryssruta' : ''}, trust- och leveransrad`
            : gemensamtPaketTest(ctx.produkter.map((pk) => pk.p)) !== null
              ? ` (flerprodukt: gemensamma A/B-paketblock under testet "${gemensamtPaketTest(ctx.produkter.map((pk) => pk.p))}", trust/leverans ur butiken, ingen fullpris-kryssruta)`
              : ' (flerprodukt: produkterna har OLIKA paket-test — inga paketblock i den delade mallen, sätt samma offer.paket.test)'),
        'sections/header-group.json: annonsrad + huvudmeny, väljare på när marknader finns',
        `snippets/ms-head.liquid: gallerifilter [SV]/[NO]${bonus.length > 0 ? ', omhämtning av korgen för upsellen' : ''}`,
        bonus.length > 0 ? `korg-upsell för ${bonus[0]}` : 'ingen bonusprodukt — ingen korg-upsell',
        'snippets/ms-paket.liquid: locale-grenar för temats svenska ord',
        'produktmallen skrivs om tills tillbakaläsningen stämmer (max 3 försök)',
        ...perProdukt,
      ];
    },
    async kor(ctx) {
      const tema = await arbetstema(ctx);
      const las = (f) => hamtaTemafil(tema.id, f);
      const nb = lasOversattning(ctx.butik.butik.id, 'nb')?.nb ?? {};
      const produkt = ctx.produkter.length === 1 ? ctx.p : null;

      // Fabriksägda filer skrivs alltid över — bas-zip:ens kopia av
      // ms-paket.js bar varukorgsbuggen från 2026-09-09 (cart-drawer-fixen).
      const filer = { ...SEKTIONER, ...TEMAFILER };

      const header = await las('sections/header-group.json');
      filer['sections/header-group.json'] = byggHeaderGroup(ctx.butik, { befintlig: header ?? null, produkt });

      let msHead = await las('snippets/ms-head.liquid');
      const bonusHandle = text(produkt?.offer?.bonus_produkt?.handle) ?? ctx.produkter.map((pk) => text(pk.p.offer?.bonus_produkt?.handle)).find(Boolean) ?? null;
      if (bonusHandle) {
        const upsell = byggKorgUpsell(bonusHandle);
        for (const [f, innehall] of Object.entries(upsell)) if (f.includes('/')) filer[f] = innehall;
        if (msHead && upsell.msHeadTillagg && !msHead.includes('sections=cart-drawer')) msHead = `${msHead}\n${upsell.msHeadTillagg}`;
        if (produkt && harTillagg(produkt)) {
          const sv = tillaggTexter(produkt);
          Object.assign(filer, byggTillagg(bonusHandle, { sv, nb: { label: nb['liquid.tillagg.label'], info: nb['liquid.tillagg.info'] } }));
        }
      }
      if (msHead && !msHead.includes(GALLERIFILTER_MARKE)) {
        const locales = ['sv', ...lista(ctx.butik.butik?.marknader).map((m) => String(m.locale ?? '').trim()).filter(Boolean)];
        msHead = `${msHead}\n${msHeadGallerifilter(locales)}`;
      }
      if (msHead) filer['snippets/ms-head.liquid'] = msHead;

      const msPaket = await las('snippets/ms-paket.liquid');
      if (msPaket) {
        // Två oberoende, idempotenta patchar: norska ord + paketpris i
        // kundens valuta (fastpris_valutor). Skrivs bara om något ändrades.
        let s = msPaket;
        for (const patch of [patchaMsPaket, patchaMsPaketValuta]) {
          const p = patch(s);
          if (p) s = p;
        }
        if (s !== msPaket) filer['snippets/ms-paket.liquid'] = s;
      }

      await skrivOchVerifiera(tema.id, filer);

      // Produktmallen VERIFIERAS och skrivs om tills den sitter: ett tema som
      // just packats upp skriver över filen under tiden (DryTrek 2026-09-09
      // rapporterade ✅ medan templates/product.json låg orörd).
      let produktmall = 'fanns inte';
      for (let forsok = 1; forsok <= 3; forsok++) {
        const befintlig = await las('templates/product.json');
        if (!befintlig) break;
        const mall = { 'templates/product.json': byggProduktTemplate(befintlig, { produkt, produkter: ctx.produkter.map((pk) => pk.p), butik: ctx.butik, nb }) };
        await skrivTemafiler(tema.id, mall);
        const fel = await verifieraSkrivning(tema.id, mall);
        if (fel.length === 0) {
          produktmall = 'verifierad';
          break;
        }
        if (forsok === 3) throw new Error(`Produktmallen fastnade aldrig: ${fel.join('; ')}`);
        await sov(3000);
      }

      return { temaId: tema.id, temaNamn: tema.name, sektioner: Object.keys(SEKTIONER).length, filer: Object.keys(filer), produktmall, upsell: bonusHandle };
    },
  },
  {
    id: 'avbrandning',
    namn: 'Av-brandningen (källbutikens sektioner + text bort)',
    niva: 'butik',
    modul: 'avbranda.mjs',
    stoppar: true,
    torrt: () => [
      'footer-group + header-group: ms-skrapkort, ms-cookies, nyhetsbrev och källannonser bort',
      'alla temafiler: källbutikens brand, mejl, domän, logga och citat skrivs om',
      'settings_data.json: sociala länkar, brand_description, presetnamn',
      'temat skannas om efteråt — kvarvarande träffar stoppar bygget',
    ],
    async kor(ctx) {
      const r = await avbranda(ctx, kravArbetstemaId(ctx), { torr: false });
      if (r.kvar.length > 0) {
        throw new Error(`${kallrapport({ rent: false, traffar: r.kvar })}\nAv-brandningen lämnade källtext kvar — butiken får inte lämnas så här.`);
      }
      return { temaId: r.temaId, fore: r.fore, borttagnaSektioner: r.borttagnaSektioner, omskrivnaFiler: r.omskrivnaFiler, lasta: r.lasta, saknade: r.saknade };
    },
  },
  {
    id: 'logga',
    namn: 'Loggan och faviconen',
    niva: 'butik',
    modul: 'logga.mjs',
    stoppar: false,
    torrt(ctx) {
      const k = loggaKallor(ctx.butik);
      return k.logga
        ? [`${k.logga} → Files → settings.logo${k.favicon ? `, favicon ${k.favicon}` : ' (loggan blir favicon också)'}, tillbakaläst på värde`]
        : [`🖐 ingen logga: sätt branding.logga i butiksfilen eller lägg output/${ctx.butik.butik.id}/logga.png`];
    },
    async kor(ctx) {
      const k = loggaKallor(ctx.butik);
      if (!k.logga) {
        return { manuell: `Ingen logga att ladda upp — sätt branding.logga (fil/URL) i butiksfilen eller lägg output/${ctx.butik.butik.id}/logga.png, kör sen --igen logga.` };
      }
      const r = await laddaUppLogga(kravArbetstemaId(ctx), { logga: k.logga, favicon: k.favicon, bredd: k.bredd });
      return { logo: r.logo, favicon: r.favicon, bredd: r.bredd, temaId: r.temaId };
    },
  },
  {
    id: 'produkt',
    namn: 'Produkten i Shopify',
    niva: 'produkt',
    modul: 'build-store.mjs + shopify.mjs (skapaProdukt)',
    stoppar: true,
    torrt: (ctx, pk) => {
      const i = pk.plan.input;
      return [
        `${i.title} (handle ${i.handle}) som ${i.status} — finns den redan uppdateras den på id och behåller sin status`,
        ...i.variants.map(
          (v) => `variant ${v.optionValues[0].name}: ${v.price} ${pk.p.ekonomi.valuta}${v.compareAtPrice ? ` (jämförpris ${v.compareAtPrice})` : ''}`
        ),
        `${i.files.length} bilder, SEO-titel "${i.seo.title}"`,
        'publiceras i Online Store-kanalen',
      ];
    },
    async kor(ctx, pk) {
      // skapaProdukt är idempotent på handle (slår upp id, återanvänder
      // media, bevarar statusen — har Axel satt DRAFT är det ett beslut).
      const produkt = await skapaProdukt(pk.plan.input);
      pk.produkt = produkt;
      const pub = await publiceraIButiken(produkt.id);
      if (produkt.status !== 'ACTIVE') console.log(`   ⚠️ ${produkt.handle} står som ${produkt.status} i butiken — behålls (sätts ACTIVE av --launch).`);
      return { id: produkt.id, handle: produkt.handle, status: produkt.status, publicerad: pub.publicerad, ...(pub.notis ? { notis: pub.notis } : {}) };
    },
  },
  {
    id: 'metafalt',
    namn: 'Metafälten (säljinnehållet)',
    niva: 'produkt',
    modul: 'metafalt.mjs',
    stoppar: true,
    torrt: (ctx, pk) => pk.metafalt.map((m) => `opf.${m.key} (${m.type})`),
    async kor(ctx, pk) {
      const produkt = await produktIButiken(pk);
      await skrivMetafalt(produkt.id, pk.metafalt);
      return { antal: pk.metafalt.length };
    },
  },
  {
    id: 'lagerpolicy',
    namn: 'Lagerpolicyn (CONTINUE, tracked false)',
    niva: 'produkt',
    modul: 'lagerpolicy.mjs',
    stoppar: true,
    torrt: (ctx, pk) => [`varje variant på ${pk.handle}: inventoryPolicy CONTINUE + tracked false, tillbakaläst`],
    async kor(ctx, pk) {
      const r = await sattContinue(ctx, pk.handle, { torr: false });
      return { andrade: r.andrade, verifierade: r.verifierade, redanRatt: r.redanRatt === true };
    },
  },
  {
    id: 'bonus',
    namn: 'Bonusprodukten (Q4)',
    niva: 'produkt',
    modul: 'bonus.mjs',
    stoppar: false,
    torrt(ctx, pk) {
      const b = pk.p.offer?.bonus_produkt ?? {};
      if (!text(b.handle)) return ['🖐 offer.bonus_produkt.handle är tom — bonusprodukten väljs av Axel'];
      if (lista(b.bilder).length === 0) return [`${b.titel ?? b.handle} (handle ${b.handle}) är en befintlig produkt i butiken — betald korg-upsell, ingen ny bonus skapas; produkt_id + variant_id hämtas och skrivs tillbaka i ${basename(pk.fil)}`];
      return [`${b.titel ?? b.handle} (handle ${b.handle}) som egen ACTIVE-produkt, ${b.pris ?? '?'} ${pk.p.ekonomi.valuta}; produkt_id + variant_id skrivs tillbaka i ${basename(pk.fil)}`];
    },
    async kor(ctx, pk) {
      const b = pk.p.offer?.bonus_produkt ?? {};
      if (!text(b.handle)) return { manuell: 'Välj bonusprodukt: fyll i offer.bonus_produkt (handle, titel, pris, bilder) i produktfilen och kör --igen bonus.' };
      try {
        const r = await sakerstallBonus({ ...ctx, produktfil: pk.fil }, pk.p, { torr: false });
        return { produkt_id: r.produkt_id, variant_id: r.variant_id, handle: r.handle, ny: r.ny, ateranvand: r.ateranvand === true, skrivet: r.skrivet };
      } catch (e) {
        // Bonus stoppar aldrig bygget (KEDJAN steg 9) — men felet ska synas.
        return { manuell: `Bonusprodukten kunde inte skapas: ${e.message} — rätta offer.bonus_produkt och kör --igen bonus.` };
      }
    },
  },
  {
    id: 'paket',
    namn: 'Paketnivåerna (metaobjekt + rabattkoder)',
    niva: 'produkt',
    modul: 'paket.mjs',
    stoppar: false,
    torrt(ctx, pk) {
      try {
        const plan = byggPaketplan(pk.p, ctx.butik);
        return [`nivåer ur ${plan.kalla}${plan.test ? `, A/B-test "${plan.test}"` : ''}, valuta ${plan.valuta}`, ...paketRader(plan)];
      } catch (e) {
        return [`🖐 paketplanen går inte att bygga: ${e.message}`];
      }
    },
    async kor(ctx, pk) {
      const plan = byggPaketplan(pk.p, ctx.butik);
      // Valutaspärren är ett handgrepp i admin, inte ett byggfel (KEDJAN steg 10).
      const valuta = ctx.shop?.currencyCode ?? null;
      if (valuta && valuta !== plan.valuta) {
        return { manuell: `Butikens valuta är ${valuta}, konfigen säger ${plan.valuta} — byt valuta i Shopify-admin (Inställningar → Allmänt) och kör --igen paket.` };
      }
      // Gratis bonus i någon nivå kräver bonusprodukten — utan den väntar
      // paketen på bonussteget i stället för att kasta.
      if (plan.poster.some((p) => p.gratisAntal > 0) && !text(pk.p.offer?.bonus_produkt?.handle)) {
        return { manuell: 'Paketnivåerna har gratis bonus men ingen bonusprodukt är vald — gör bonus-steget först, kör sen --igen paket.' };
      }
      const r = await byggPaket(ctx, pk.p, { torr: false });
      return { nivaer: r.nivaer.map((n) => n.handle), koder: r.koder.map((k) => k.kod), frammande: r.frammande.map((f) => f.handle), test: r.test };
    },
  },
  {
    id: 'kollektion',
    namn: 'Sortimentskollektionen (flerprodukt eller nischbutik)',
    niva: 'butik',
    modul: 'shopify.mjs (skrivKollektion)',
    stoppar: true,
    // Nischbutik (butik.kollektion.alltid) bygger kollektionen redan med en
    // produkt — nästa produkt ska bara vara en produktfil till (butik.mjs).
    torrt: (ctx) =>
      arNischbutik(ctx.butik, ctx.produkter)
        ? [`${ctx.kollektion.handle} — "${ctx.kollektion.titel}"${ctx.produkter.length === 1 ? ' (nischbutik: kollektionen byggs redan med en produkt)' : ''}`, ...ctx.produkter.map((pk) => `  ${pk.p.produkt.namn}`), 'publiceras i Online Store']
        : ['enproduktsbutik — ingen kollektion, startsidan visar produkten direkt'],
    async kor(ctx) {
      if (!arNischbutik(ctx.butik, ctx.produkter)) return { hoppadOver: 'enproduktsbutik' };
      const ids = [];
      for (const pk of ctx.produkter) ids.push((await produktIButiken(pk)).id);
      const kollektion = await skrivKollektion({ handle: ctx.kollektion.handle, titel: ctx.kollektion.titel, produktIds: ids, beskrivning: ctx.kollektion.beskrivning });
      const pub = await publiceraIButiken(kollektion.id);
      return { handle: kollektion.handle, produkter: ids.length, publicerad: pub.publicerad };
    },
  },
  {
    id: 'startsida',
    namn: 'Startsidan (templates/index.json + sidfot)',
    niva: 'butik',
    modul: 'startsida.mjs + filer.mjs',
    stoppar: true,
    torrt: (ctx) => startsideRader(ctx.butik, ctx.produkter.map((pk) => pk.p), { kollektion: ctx.kollektion.handle }),
    async kor(ctx) {
      const tema = await arbetstema(ctx);
      // Produkterna ska finnas — en startsida som pekar på ingenting är 404.
      const statusar = [];
      for (const pk of ctx.produkter) {
        const p = await produktIButiken(pk);
        statusar.push(`${p.handle}: ${p.status}`);
      }

      // Bilderna ur startsida:-blocket upp i Files först; handles in i mallen.
      const kallor = bilderAttLaddaUpp(ctx.butik);
      const upp = async (kalla, alt) => (kalla ? (await laddaUppBild(kalla, { alt })).handle : null);
      const bilder = {
        hero: await upp(kallor.hero, `${ctx.butik.butik.brand} hero`),
        trygghet: await upp(kallor.trygghet, `${ctx.butik.butik.brand} trygghet`),
        galleri: [],
      };
      for (const [i, k] of kallor.galleri.entries()) {
        const redan = text(ctx.butik.startsida?.galleri?.kolumner?.[i]?.bild);
        bilder.galleri.push(k ? await upp(k, ctx.butik.startsida?.galleri?.kolumner?.[i]?.titel ?? `galleri ${i + 1}`) : redan);
      }

      const filer = {
        'templates/index.json': byggStartsida(ctx.butik, ctx.produkter.map((pk) => pk.p), {
          hero: bilder.hero ?? text(ctx.butik.startsida?.hero?.bild),
          bilder: { trygghet: bilder.trygghet ?? text(ctx.butik.startsida?.trygghet?.bild), galleri: bilder.galleri },
          kollektion: ctx.kollektion.handle,
        }),
      };
      // Sidfotens bolagsblock bär källbutikens uppgifter i bas-zip:en.
      const footer = await hamtaTemafil(tema.id, 'sections/footer-group.json');
      if (footer) filer['sections/footer-group.json'] = byggFooterGroup(footer, ctx.butik);

      await skrivOchVerifiera(tema.id, filer);
      // Tillbakaläsning på innehåll: startsidan ska ha en order.
      const index = lasTemaJson(await hamtaTemafil(tema.id, 'templates/index.json'));
      if (!Array.isArray(index?.order) || index.order.length === 0) throw new Error('templates/index.json: ingen order efter uppladdning.');
      return { temaId: tema.id, filer: Object.keys(filer), sektioner: index.order, bilder, produkter: statusar };
    },
  },
  {
    id: 'sidor',
    namn: 'Sidorna (villkor + kontakt)',
    niva: 'butik',
    modul: 'policyer.mjs + shopify.mjs (skrivSida)',
    stoppar: true,
    torrt: (ctx) => [...ctx.policyer.map((x) => `${x.namn} (/pages/${x.handle})`), 'Kontakt (/pages/contact)'],
    async kor(ctx) {
      for (const policy of ctx.policyer) await skrivSida(policy.handle, { title: policy.namn, body: policy.body });
      // "contact" är Shopifys standardsida — återanvänd den, skapa ingen dubblett.
      await skrivSida('contact', { title: 'Kontakt', body: kontaktsida(ctx.p) });
      return { antal: ctx.policyer.length + 1 };
    },
  },
  {
    id: 'policyer',
    namn: 'Officiella policyfälten',
    niva: 'butik',
    modul: 'shopify.mjs (skrivPolicy)',
    stoppar: true,
    torrt: (ctx) => ctx.policyer.map((x) => x.type),
    async kor(ctx) {
      const utanScope = [];
      for (const policy of ctx.policyer) {
        try {
          await skrivPolicy(policy.type, policy.body);
        } catch (e) {
          if (!/write_legal_policies|Access denied/i.test(e.message)) throw e;
          utanScope.push(policy.namn);
        }
      }
      if (utanScope.length > 0) {
        return { manuell: `Appen saknar scopet write_legal_policies — klistra in ${utanScope.join(', ')} under Inställningar → Policyer.` };
      }
      return { antal: ctx.policyer.length };
    },
  },
  {
    id: 'meny',
    namn: 'Menyerna (huvudmeny + sidfot)',
    niva: 'butik',
    modul: 'meny.mjs + shopify.mjs (skrivMeny)',
    stoppar: true,
    torrt: (ctx) => [
      ...ctx.huvudmenylankar.map((l) => `huvudmeny: ${l.titel} → ${l.url}`),
      ...ctx.menylankar.map((l) => `sidfot: ${l.titel} → ${l.url}`),
    ],
    async kor(ctx) {
      // Hem / [kollektion] / en rad per produkt / Frakt & retur / Kontakt —
      // aldrig Dawns Catalog → /collections/all (meny.mjs).
      const huvud = await skrivMeny('main-menu', ctx.huvudmenylankar);
      const sidfot = await skrivMeny('footer', ctx.menylankar);
      return {
        huvudmeny: { handle: huvud.handle, orord: huvud.orord === true, rader: ctx.huvudmenylankar.length },
        sidfot: { handle: sidfot.handle, orord: sidfot.orord === true, rader: ctx.menylankar.length },
      };
    },
  },
  {
    id: 'frakt',
    namn: 'Fraktzonerna',
    niva: 'butik',
    modul: 'frakt.mjs + shopify.mjs (tillampaFraktatgarder)',
    stoppar: true,
    torrt: (ctx) =>
      byggFraktplan(ctx.butik).map(
        (z) => `${z.zon}${z.huvudmarknad ? ' (huvudmarknad)' : ''}: ${z.metoder.map((m) => `${m.namn} ${m.pris} ${m.valuta}`).join(', ')}`
      ),
    async kor(ctx) {
      const lage = await hamtaFraktzoner();
      if (!lage) return { manuell: 'Ingen fraktprofil hittades i butiken.' };
      const atgarder = byggFraktatgarder(lage.zoner, byggFraktplan(ctx.butik));
      // Saknade zoner SKAPAS (zonesToCreate) och trialens egna zoner rivs så
      // länderna blir lediga. Stod som "för hand" till 2026-09-10 — ingen
      // hade provat. Skrivningen läses tillbaka nedan.
      const resultat = await tillampaFraktatgarder(lage, atgarder);
      if (atgarder.attSkapaZoner.length > 0) {
        const efter = await hamtaFraktzoner();
        const namn = new Set((efter?.zoner ?? []).map((z) => z.zon));
        const kvarSaknas = atgarder.attSkapaZoner.map((z) => z.zon).filter((z) => !namn.has(z));
        if (kvarSaknas.length > 0) throw new Error(`Zonerna skrevs men lästes inte tillbaka: ${kvarSaknas.join(', ')}.`);
      }
      return { andrade: resultat.andrade, orort: atgarder.orort, skapadeZoner: resultat.skapadeZoner, borttagnaZoner: resultat.borttagnaZoner };
    },
  },
  {
    id: 'huvudmarknad',
    namn: 'Huvudmarknaden',
    niva: 'butik',
    modul: 'shopify.mjs (kontrolleraAnslutning)',
    stoppar: true,
    torrt: (ctx) => [`${ctx.butik.butik.huvudmarknad} med ${ctx.butik.butik.valuta} ska vara butikens hemmamarknad (verifieras, kan inte sättas via API)`],
    async kor(ctx) {
      const shop = ctx.shop;
      if (shop?.currencyCode !== ctx.butik.butik.valuta) {
        return { manuell: `Butikens valuta är ${shop?.currencyCode}, konfigen säger ${ctx.butik.butik.valuta} — ändras i Shopify-admin.` };
      }
      return { valuta: shop.currencyCode };
    },
  },
  {
    id: 'kallskanning',
    namn: 'Källskanningen (ingen källbutikstext kvar)',
    niva: 'butik',
    modul: 'kallskanning-kor.mjs + kallskanning.mjs',
    stoppar: true,
    torrt: () => ['ALLA temafiler hämtas paginerat och skannas — en träff stoppar bygget'],
    async kor(ctx) {
      const temaId = kravArbetstemaId(ctx);
      const filer = await hamtaAllaTemafiler(temaId);
      const resultat = skannaTema(filer);
      const { lasta, saknade } = tackning(filer);
      ctx.kallskanning = resultat;
      if (!resultat.rent) {
        throw new Error(`${kallrapport(resultat)}\nSkanningen är en spärr — kör --igen avbrandning och skanna om.`);
      }
      return { skannade: Object.keys(filer).length, rent: true, lasta, saknade };
    },
  },
  {
    id: 'recensioner',
    namn: 'Recensionerna → Judge.me',
    niva: 'produkt',
    modul: 'judgeme.mjs + tools/judgeme-import.mjs',
    stoppar: false,
    torrt(ctx, pk) {
      const antal = lista(pk.p.reviews).length;
      const utanDatum = lista(pk.p.reviews).filter((r) => !text(r.datum)).length;
      const tokenEnv = ctx.butik.judgeme?.token_env ?? 'JUDGEME_API_TOKEN';
      if (!pk.p.kallor?.drive_mapp && antal === 0) return ['🖐 inga recensioner i produktfilen — inget importeras, inget hittas på'];
      return [
        pk.p.kallor?.drive_mapp
          ? `recensions-CSV ur Drive-mappen ${pk.p.kallor.drive_mapp}`
          : `${antal} recensioner ur produktfilen → output/${pk.p.produkt.id}/judgeme-app-import.csv (Judge.mes mallformat, originaldatum)${utanDatum > 0 ? ` — 🖐 ${utanDatum} saknar datum, app-CSV:n kan inte byggas förrän de finns` : ''}`,
        `API-import med tools/judgeme-import.mjs bara om env ${tokenEnv} finns — annars laddar VA:n upp filen i appen`,
      ];
    },
    async kor(ctx, pk) {
      const mapp = utmapp(pk.p.produkt.id);
      const klick = 'Judge.me → Settings → Import reviews → Import from apps → Judge.me format → ladda upp filen → Import. Verifiera datumen i kundvyn (originaldatum, aldrig "nyss").';

      // Drive-mappen vinner när den finns: samma CSV som resten av flödet.
      const driveMapp = text(pk.p.kallor?.drive_mapp);
      let csv = null;
      if (driveMapp) {
        const id = driveMapp.match(/folders\/([-\w]+)/)?.[1] ?? driveMapp;
        const ls = spawnSync('python3', [join(FACTORY_ROT, '..', 'tools', 'drive-ls.py'), id], { encoding: 'utf8' });
        if (ls.status !== 0) throw new Error(`Drive-mappen gick inte att lista: ${ls.stderr}`);
        const rad = ls.stdout
          .split('\n')
          .map((r) => r.split('\t'))
          .find(([typ, , titel]) => typ === 'fil' && /\.csv$/i.test(titel ?? '') && /recension|review/i.test(titel ?? ''));
        if (!rad) return { manuell: 'Ingen recensions-CSV hittades i Drive-mappen — lägg dit den eller töm kallor.drive_mapp.' };
        const svar = await fetch(`https://drive.google.com/uc?export=download&id=${rad[1]}`);
        if (!svar.ok) throw new Error(`Kunde inte hämta CSV:n ur Drive (${svar.status})`);
        csv = join(mapp, 'judgeme-import-drive.csv');
        writeFileSync(csv, await svar.text());
      } else {
        if (lista(pk.p.reviews).length === 0) return { manuell: 'Produkten har inga recensioner i produktfilen — inget att importera (hitta aldrig på några).' };
        // App-CSV:n ALLTID (originaldatum följer bara med appens import).
        const produkt = await produktIButiken(pk);
        const oversattningar = {};
        for (const m of lista(ctx.butik.butik?.marknader)) {
          const ov = m.locale ? lasOversattning(ctx.butik.butik.id, String(m.locale)) : null;
          if (!ov?.nb) continue;
          oversattningar[m.locale] = recensionsOversattning(ov.nb, pk.p.produkt.id);
          // Husets CSV per locale (API-vägen för de översatta raderna).
          const lokal = byggJudgeMeCsvOversatt(pk.p, oversattningar[m.locale]);
          if (lokal) writeFileSync(join(mapp, `judgeme-import-${m.locale}.csv`), lokal);
        }
        const appfil = join(mapp, 'judgeme-app-import.csv');
        let appCsv = null;
        try {
          appCsv = byggJudgeMeAppCsv(pk.p, { produktId: String(produkt.legacyResourceId ?? ''), produktUrl: `https://${ctx.shop?.primaryDomain?.host ?? ctx.shop?.myshopifyDomain ?? ''}/products/${pk.handle}`, oversattningar });
        } catch (e) {
          return { manuell: `App-CSV:n kunde inte byggas: ${e.message}` };
        }
        writeFileSync(appfil, appCsv);
        csv = join(mapp, 'judgeme-import.csv');
        writeFileSync(csv, byggJudgeMeCsv(pk.p));
      }

      // API-import bara när butikens token finns — annars är filen VA:ns.
      const tokenEnv = ctx.butik.judgeme?.token_env ?? 'JUDGEME_API_TOKEN';
      const shopDomain = text(ctx.butik.judgeme?.shop_domain) ?? process.env.JUDGEME_SHOP_DOMAIN ?? ctx.shop?.myshopifyDomain ?? null;
      if (!process.env[tokenEnv] || !shopDomain) {
        return { manuell: `Ingen Judge.me-token (env ${tokenEnv}) — VA:n importerar output/${pk.p.produkt.id}/judgeme-app-import.csv: ${klick}` };
      }
      const produkt = await produktIButiken(pk);
      const arg = [
        join(FACTORY_ROT, '..', 'tools', 'judgeme-import.mjs'),
        csv,
        '--product-id', String(produkt.legacyResourceId),
        '--shop-domain', shopDomain,
        '--token-env', tokenEnv,
      ];
      const kor = spawnSync(process.execPath, arg, { encoding: 'utf8' });
      if (kor.status !== 0) throw new Error(`judgeme-import.mjs felade: ${(kor.stderr || kor.stdout).slice(0, 400)}`);
      return { csv: basename(csv), viaApi: true, rapport: kor.stdout.trim().split('\n').slice(-3).join(' · ') };
    },
  },
  {
    id: 'marknad',
    namn: 'Marknaderna (marknad + locale + webPresence)',
    niva: 'butik',
    modul: 'marknad.mjs',
    stoppar: true,
    torrt(ctx) {
      const rader = lista(ctx.butik.butik?.marknader);
      if (rader.length === 0) return ['❌ butik.marknader är tom — steget stoppar (SE + NO är standard i varje OPS)'];
      return rader.map((m) => `${m.land}: marknad ${m.land}, locale ${m.locale} publicerad, alternateLocale på webPresence (valuta ${m.valuta ?? '?'} — lokal valuta slås på i admin)`);
    },
    async kor(ctx) {
      const r = await sakerstallMarknader(ctx.butik, { torr: false });
      const manuella = r.filter((x) => x.webPresence?.manuell).map((x) => `${x.land}: ${x.webPresence.manuell}`);
      const ut = r.map((x) => ({ land: x.land, locale: x.locale, marknad: x.marknad?.namn ?? null, status: x.marknad?.status ?? null, localeSkapad: x.localeLage?.skapad === true }));
      if (manuella.length > 0) return { manuell: manuella.join(' · '), marknader: ut };
      return { marknader: ut };
    },
  },
  {
    id: 'oversatt',
    namn: 'Översättningarna (underlag → registrering)',
    niva: 'butik',
    modul: 'oversattning.mjs + marknad.mjs (oversattAllt) + oversattning-granska.mjs',
    stoppar: false,
    torrt(ctx) {
      const id = ctx.butik.butik.id;
      const locales = lista(ctx.butik.butik?.marknader).map((m) => String(m.locale ?? '').trim()).filter(Boolean);
      return [
        `output/${id}/oversattning-sv.json skrivs ur samma byggare som butiken`,
        ...locales.map((l) => (lasOversattning(id, l) ? `${l}: oversattning-${l}.json finns — registreras på alla resurser och granskas` : `🖐 ${l}: oversattning-${l}.json saknas — subagenten översätter först`)),
      ];
    },
    async kor(ctx) {
      const id = ctx.butik.butik.id;
      const underlag = byggUnderlag(ctx);
      const antal = Object.keys(underlag).filter((k) => !k.startsWith('_')).length;
      const locales = lista(ctx.butik.butik?.marknader).map((m) => String(m.locale ?? '').trim()).filter(Boolean);
      const temaId = kravArbetstemaId(ctx);
      const manuella = [];
      const utfall = {};
      for (const locale of locales) {
        const ov = lasOversattning(id, locale);
        if (!ov) {
          manuella.push(`${locale}: översätt med subagent (sonnet) — output/${id}/oversattning-sv.json (${antal} nycklar) → oversattning-${locale}.json med samma nycklar, kör sen --igen oversatt`);
          continue;
        }
        const r = await oversattAllt(ctx, locale, ov, { temaId, torr: false });
        let gr = null;
        try {
          gr = await granskaOversattning(locale, { temaId });
        } catch (e) {
          gr = { fel: e.message };
        }
        utfall[locale] = { registrerade: r.registrerade, saknade: r.saknade.length, perTyp: r.perTyp, granskning: gr?.fel ?? `${gr.oversatta}/${gr.kallor}` };
        if (r.saknade.length > 0) {
          manuella.push(`${locale}: ${r.saknade.length} svenska texter saknar översättning (läckor på /${locale}): ${r.saknade.slice(0, 8).map((l) => `${l.typ} ${l.key}`).join(', ')}${r.saknade.length > 8 ? ' …' : ''} — komplettera oversattning-${locale}.json och kör --igen oversatt`);
        }
      }
      if (manuella.length > 0) return { manuell: manuella.join(' · '), underlag: antal, utfall };
      return { underlag: antal, utfall };
    },
  },
  // 18 qa, 19 checklista och 20 slutrapport körs ALLTID färskt (aldrig ur
  // state) — de ligger i huvudflodet nedan, inte i steglistan.
];

// Stegen efter loopen — listas i dry-run och i slutrapporten med samma
// nummer som KEDJAN.md, men körs av huvudflödet.
export const EFTERSTEG = [
  { id: 'qa', namn: 'QA (kontroll + kundvy + trippelkoll)', niva: 'produkt+butik', modul: 'kontroll.mjs + kundvy-kor.mjs + kundvy.mjs + trippelkoll.mjs', stoppar: 'rött = inte klart' },
  { id: 'checklista', namn: 'VA-checklistan', niva: 'butik', modul: 'checklista.mjs', stoppar: false },
  { id: 'slutrapport', namn: 'Slutrapporten (två listor ur state)', niva: 'butik', modul: 'state.mjs', stoppar: false },
];

export const STEG_IDN = STEG.map((s) => s.id);

// ---------------------------------------------------------------------------

const utmapp = (id) => {
  const mapp = join(FACTORY_ROT, 'output', id);
  mkdirSync(mapp, { recursive: true });
  return mapp;
};

// Produkten i butiken (ur minnet från produkt-steget, annars uppslagen på handle).
async function produktIButiken(pk) {
  if (!pk.produkt) pk.produkt = await hamtaProduktViaHandle(pk.handle);
  if (!pk.produkt) throw new Error(`Produkten ${pk.handle} finns inte i butiken — kör produkt-steget (utan --resume eller --igen produkt).`);
  return pk.produkt;
}

function lasKonfig(butiksfil, produktfiler) {
  // LAUNCH-INPUT läses först och läggs ovanpå råfilerna — sen valideras allt
  // som vanligt, så det Axel fyllt i mäts av exakt samma spärrar.
  const rabutik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const rader = produktfiler.map((fil) => lasYaml(readFileSync(fil, 'utf8')));
  // LAUNCH-INPUT beskriver EN produkt — läggs bara på när butiken bär en.
  const launchInput = rader.length === 1 ? lasLaunchInput(join(FACTORY_ROT, 'LAUNCH-INPUT.yaml')) : null;
  if (launchInput) tillampaLaunchInput(rabutik, rader[0], launchInput.input);

  const { fel: butiksfel, varningar: butiksvarningar } = valideraButik(rabutik);
  if (butiksfel.length > 0) stopp(`${butiksfel.length} kritiska fel i butikskonfigen`, butiksfel);
  const butik = rabutik;

  const produkter = [];
  const varningar = [...butiksvarningar, ...valideraBranding(butik?.branding)];
  for (const [i, rad] of rader.entries()) {
    const p = sammanfoga(butik, rad);
    const { fel, varningar: pv, nyckeltal } = validera(p);
    if (fel.length > 0) stopp(`${fel.length} kritiska fel i ${produktfiler[i]}`, fel);
    produkter.push({ p, nyckeltal, fil: produktfiler[i] });
    varningar.push(...pv.map((v) => `${p.produkt.id}: ${v}`));
  }

  // Prefixregeln (factory/FLERPRODUKT.md fynd 1): creative_prefix skiljer
  // produkter åt i fyra system. Delar två produkter prefix blir prefixkartan,
  // översättningskön, adsetuppslaget och commission-kopplingen tysta fel.
  const prefix = produkter.map((x) => x.p.meta?.creative_prefix).filter(Boolean);
  const dubbletter = prefix.filter((x, i) => prefix.indexOf(x) !== i);
  if (dubbletter.length > 0) {
    stopp('creative_prefix delas mellan produkter', [
      `Prefixet "${dubbletter[0]}" står på mer än en produkt.`,
      'Prefixet ska vara per PRODUKT — brandet hör hemma i kampanjnamnet.',
    ]);
  }

  return { butik, produkter, varningar, launchInput };
}

// Produktkontexten: allt som gäller EN produkt.
export function byggProduktKontext(p, butik, fil = null) {
  return {
    p,
    fil,
    handle: produktHandle(p),
    plan: byggPlan(p, butik),
    metafalt: byggMetafalt(p, { kundUnderrubrik }),
    produkt: null,
    state: null,
  };
}

// Butikskontexten: allt som gäller HELA butiken, plus produktkontexterna.
// Policyerna och kontaktsidan byggs ur den FÖRSTA produkten — de innehåller
// bara bolagsuppgifter, som kommer ur butiksfilen och är lika för alla.
export function byggButiksKontext(butik, produkter) {
  const produktkontexter = produkter.map((x) => byggProduktKontext(x.p, butik, x.fil ?? null));
  const ps = produktkontexter.map((pk) => pk.p);
  const policyer = byggPolicyer(ps[0]);
  const kollektionHandle = butik?.butik?.kollektion?.handle ?? 'sortimentet';

  return {
    butik,
    p: ps[0], // representant för butiksgemensamma texter
    produkter: produktkontexter,
    policyer,
    kollektion: {
      handle: kollektionHandle,
      titel: butik?.butik?.kollektion?.titel ?? 'Sortimentet',
      beskrivning: butik?.butik?.kollektion?.beskrivning ?? '',
    },
    // Huvudmenyn ur meny.mjs: Hem / [kollektion] / produkter / Frakt & retur / Kontakt.
    huvudmenylankar: huvudmenyRader(butik, ps),
    menylankar: [
      ...policyer.map((x) => ({ titel: x.namn, url: `/pages/${x.handle}` })),
      // EU:s ångerknapp, obligatorisk sedan 19 juni: en TYDLIG knapp kunden
      // hittar utan att leta. Den ska stå i sidfoten på varje sida, inte bara
      // inuti returpolicyn. Saknas den kan ångerfristen förlängas från 14
      // dagar till 12 månader och 14 dagar, och böterna går till 4 % av
      // årsomsättningen i vissa medlemsstater. Se factory/policyer.mjs.
      { titel: 'Ångra köp', url: angerknappUrl(ps[0]) },
      { titel: 'Kontakt', url: '/pages/contact' },
    ],
    shop: null,
    butiksstate: null,
    get arbetstemaId() {
      return lasArbetstemaId(this.butiksstate);
    },
  };
}

// Empty-state-QA: mallfilerna och den byggda sidan. Ett fel här är en bugg i
// fabriken, inte i produktdatan — därför hårt stopp, aldrig en varning.
function korTemaQa(pk, forhandsvisning) {
  const fel = [...qaSektionsfiler(SEKTIONER), ...qaRenderadSida(forhandsvisning)];
  if (fel.length > 0) stopp('tema-QA (empty states)', fel);
  const { doljs } = sektionerSomVisas(pk.metafalt.map((m) => m.key));
  return { doljs };
}

function skrivProduktfiler(ctx, pk, varningar, qa) {
  const mapp = utmapp(pk.p.produkt.id);
  const forhandsvisning = byggForhandsvisning(pk.p);
  const temaQa = korTemaQa(pk, forhandsvisning);
  console.log(
    `✅ Tema-QA grön för ${pk.p.produkt.id}.${temaQa.doljs.length > 0 ? ` Sektioner som döljer sig (data saknas): ${temaQa.doljs.join(', ')}.` : ' Alla sektioner har data.'}`
  );
  writeFileSync(join(mapp, 'forhandsvisning.html'), forhandsvisning);
  writeFileSync(join(mapp, 'plan.json'), `${JSON.stringify({ input: pk.plan.input, metafalt: pk.metafalt }, null, 2)}\n`);
  for (const policy of ctx.policyer) {
    writeFileSync(join(mapp, `policy-${policy.type.toLowerCase()}.html`), policy.body);
  }
  // Judge.me-underlaget i husets format (API-vägen); app-CSV:n skrivs av
  // recensionssteget när produkten finns i butiken (den bär produkt-id:t).
  const judgeMeCsv = byggJudgeMeCsv(pk.p);
  if (judgeMeCsv) writeFileSync(join(mapp, 'judgeme-import.csv'), judgeMeCsv);
  const qaRader = [
    `# QA — ${pk.p.produkt.namn}`,
    '',
    ...(qa
      ? qa.punkter.map((x) => `- [${x.utfall === 'ok' ? 'x' : ' '}] ${IKON[x.utfall]} ${x.namn}: ${x.detalj}`)
      : ['QA kördes inte (dry-run).']),
    '',
    ...(varningar.length > 0 ? ['## Varningar', '', ...varningar.map((v) => `- [ ] ${v}`)] : []),
  ];
  writeFileSync(join(mapp, 'qa-checklista.md'), `${qaRader.join('\n')}\n`);
  return mapp;
}

// Steg 19: EN checklista per butik (KEDJAN.md), med pixel-id och temanamn ur
// state/produktfil när de finns.
function skrivChecklista(ctx) {
  const mapp = utmapp(ctx.butik.butik.id);
  const pixelId = ctx.butiksstate?.steg?.['store-ready']?.pixelId ?? ctx.produkter.map((pk) => text(pk.p.meta?.pixel_id)).find(Boolean) ?? null;
  const temaNamn = lasArbetstemaNamn(ctx.butiksstate) ?? standardTemanamn(ctx.butik.butik.brand);
  const fil = join(mapp, 'CHECKLISTA.md');
  writeFileSync(fil, byggChecklista(ctx.butik, ctx.produkter.map((pk) => pk.p), { pixelId, temaNamn }));
  return fil;
}

// ---------------------------------------------------------------------------
// QA (steg 18) — körs alltid färskt. Tre delar:
//   kontroll.mjs      konfig mot API (per produkt)
//   kundvy            riktig HTML: startsidan (butik) + produktsidan (produkt)
//   trippelkoll       tillbakaläsning av hela butiken (butik)
// Regel 3: utan HTML är kundvyn RÖD — aldrig grön.
// ---------------------------------------------------------------------------

// Ren logik: kundvyns punkter ur ett hämtningsförsök. `html` null = ingen
// HTML (fel i `felmeddelande`) ⇒ rött med texten 'ingen HTML = inte grönt'.
export function kundvyPunkter({ html, felmeddelande = null, losenordSatt = true, butik, produkt, vad = 'startsida' }) {
  const punkter = [];
  if (!html) {
    const skal = [felmeddelande, losenordSatt ? null : 'SHOPIFY_STOREFRONT_PASSWORD saknas i env'].filter(Boolean).join(' · ');
    punkter.push({ namn: `kundvy-${vad}`, utfall: 'kritisk', detalj: `ingen HTML = inte grönt${skal ? ` (${skal})` : ''}` });
    return punkter;
  }
  if (vad === 'startsida') {
    const r = kontrolleraKundvy(html, butik, produkt);
    punkter.push(r.ok
      ? { namn: 'kundvy-startsida', utfall: 'ok', detalj: 'brand, logga, produkt, bild och köpknapp syns; inga defaultspår' }
      : { namn: 'kundvy-startsida', utfall: 'kritisk', detalj: r.fel.join(' | ') });
  } else {
    const s = strukturkoll(html, { produkt, butik });
    punkter.push(s.ok
      ? { namn: 'kundvy-produktsida', utfall: 'ok', detalj: `${s.punkter.length} strukturpunkter gröna` }
      : { namn: 'kundvy-produktsida', utfall: 'kritisk', detalj: s.fel.join(' | ') });
    const pk = produktkoll(html, produkt);
    punkter.push(pk.ok
      ? { namn: 'kundvy-produkttext', utfall: 'ok', detalj: 'produktnamn + pris syns i huvudspråkets vy' }
      : { namn: 'kundvy-produkttext', utfall: 'kritisk', detalj: pk.fel.join(' | ') });
  }
  return punkter;
}

// Markörskanningen på en översatt sida: ren logik.
export function markorPunkt(html, locale, markorer) {
  if (!html) return { namn: `markörer /${locale}`, utfall: 'kritisk', detalj: 'ingen HTML = inte grönt' };
  if (markorer.length === 0) return { namn: `markörer /${locale}`, utfall: 'manuell', detalj: 'butik.markorer_sv saknas i butiksfilen — skannas av en människa' };
  const lackor = svenskaMarkorer(html, markorer);
  return lackor.length === 0
    ? { namn: `markörer /${locale}`, utfall: 'ok', detalj: `0 svenska markörer av ${markorer.length}` }
    : { namn: `markörer /${locale}`, utfall: 'kritisk', detalj: `svenska ord kvar: ${lackor.join(', ')}` };
}

async function hamtaEllerNull(fn) {
  try {
    return { html: await fn(), fel: null };
  } catch (e) {
    return { html: null, fel: e.message };
  }
}

async function korButiksQa(ctx) {
  const punkter = [];
  const losenordSatt = Boolean(process.env.SHOPIFY_STOREFRONT_PASSWORD);
  let tema = null;
  try {
    tema = await hamtaArbetstema(kravArbetstemaId(ctx));
  } catch (e) {
    punkter.push({ namn: 'arbetstema', utfall: 'kritisk', detalj: e.message });
  }
  const kctx = { shop: ctx.shop };
  const start = await hamtaEllerNull(() => hamtaStartsida(kctx, { temaId: tema }));
  punkter.push(...kundvyPunkter({ html: start.html, felmeddelande: start.fel, losenordSatt, butik: ctx.butik, produkt: ctx.p, vad: 'startsida' }));

  // Översatta startsidor: inga svenska markörer.
  const markorerBas = lasMarkorer(ctx.butik);
  for (const m of lista(ctx.butik.butik?.marknader)) {
    const locale = String(m.locale ?? '').trim();
    if (!locale) continue;
    const ov = lasOversattning(ctx.butik.butik.id, locale);
    const markorer = filtreraMarkorer(markorerBas, ov?.sv, ov?.nb);
    await sov(2500);
    const s = await hamtaEllerNull(() => hamtaStartsida(kctx, { temaId: tema, locale }));
    punkter.push(markorPunkt(s.html, locale, markorer));
  }

  // Trippelkollen: tillbakaläsning av hela butiken mot yaml.
  try {
    const lage = await samlaLage({ shop: ctx.shop, arbetstemaId: ctx.arbetstemaId, policyer: ctx.policyer, menylankar: ctx.menylankar, huvudmenylankar: ctx.huvudmenylankar }, ctx.butik, ctx.produkter.map((pk) => pk.p));
    for (const r of lage.rader) {
      punkter.push({ namn: `trippelkoll ${r.namn}`, utfall: r.utfall === 'fel' ? 'kritisk' : r.utfall === 'manuell' ? 'manuell' : 'ok', detalj: r.detalj });
    }
  } catch (e) {
    punkter.push({ namn: 'trippelkoll', utfall: 'kritisk', detalj: e.message });
  }
  return sammanfattaQa(punkter, { kctx, tema });
}

function sammanfattaQa(punkter, extra = {}) {
  const kritiska = punkter.filter((x) => x.utfall === 'kritisk');
  return { punkter, kritiska, manuella: punkter.filter((x) => x.utfall === 'manuell'), gron: kritiska.length === 0, ...extra };
}

async function korProduktQa(ctx, pk, butiksQa) {
  const produkt = await hamtaProduktViaHandle(pk.handle);
  const kontroll = kontrolleraLaunch(medHandleSomId(pk.p), { shop: ctx.shop, produkt, policyer: ctx.shop?.shopPolicies ?? null });
  const punkter = [...kontroll.punkter];
  const losenordSatt = Boolean(process.env.SHOPIFY_STOREFRONT_PASSWORD);
  const kctx = butiksQa.kctx ?? { shop: ctx.shop };
  await sov(2500);
  const sida = await hamtaEllerNull(() => hamtaProduktsida(kctx, pk.handle, { temaId: butiksQa.tema }));
  punkter.push(...kundvyPunkter({ html: sida.html, felmeddelande: sida.fel, losenordSatt, butik: ctx.butik, produkt: pk.p, vad: 'produktsida' }));
  const markorerBas = lasMarkorer(ctx.butik);
  for (const m of lista(ctx.butik.butik?.marknader)) {
    const locale = String(m.locale ?? '').trim();
    if (!locale) continue;
    const ov = lasOversattning(ctx.butik.butik.id, locale);
    await sov(2500);
    const s = await hamtaEllerNull(() => hamtaProduktsida(kctx, pk.handle, { temaId: butiksQa.tema, locale }));
    punkter.push(markorPunkt(s.html, locale, filtreraMarkorer(markorerBas, ov?.sv, ov?.nb)));
  }
  return sammanfattaQa(punkter);
}

// ---------------------------------------------------------------------------

function skrivDryRunRad(steg, rader) {
  console.log(`\n▫️ ${steg.namn}  [${steg.niva}, ${steg.modul}${steg.stoppar === true ? ', stoppar vid fel' : steg.stoppar === false ? ', manuell vid hinder' : ''}]`);
  for (const rad of rader) console.log(`   ${rad}`);
}

export function tolkaIgen(argv) {
  const ut = new Set();
  argv.forEach((a, i) => {
    if (a === '--igen') String(argv[i + 1] ?? '').split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => ut.add(s));
    if (a.startsWith('--igen=')) a.slice(7).split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => ut.add(s));
  });
  return ut;
}

// Ska steget köras? --igen vinner över grönt; --resume (eller --igen på
// något annat steg) hoppar över gröna. Ren logik.
export function skaKoras(stegId, { resume, igen, klart }) {
  if (igen.has(stegId)) return true;
  if ((resume || igen.size > 0) && klart) return false;
  return true;
}

async function huvudflode({ butiksfil, produktfiler, dryRun, resume, launch, igen = new Set(), storeReady = false }) {
  const { butik, produkter, varningar, launchInput } = lasKonfig(butiksfil, produktfiler);
  const ctx = byggButiksKontext(butik, produkter);
  const lage = dryRun ? 'DRY-RUN' : launch ? 'LAUNCH' : igen.size > 0 ? `IGEN ${[...igen].join(',')}` : resume ? 'RESUME' : 'BUILD';
  const rubrik = produkter.map((x) => x.p.produkt.namn).join(' + ');
  console.log(`\nOPS Factory · ${rubrik} · butik ${butik.butik.brand} · ${lage}\n`);
  for (const { p, nyckeltal } of produkter) {
    console.log(
      `✅ ${p.produkt.id}: break-even-ROAS ${nyckeltal.breakEvenRoas}, marginal ${nyckeltal.marginal} ${p.ekonomi.valuta}, prefix ${p.meta?.creative_prefix ?? '(saknas)'}${nyckeltal.medMoms ? ` (med moms: BE-ROAS ${nyckeltal.medMoms.breakEvenRoas})` : ''}.`
    );
  }
  if (launchInput) {
    console.log(
      `📋 LAUNCH-INPUT: ${launchInput.ifyllt.length} av ${launchInput.ifyllt.length + launchInput.saknas.length} ifyllda.${
        launchInput.saknas.length > 0 ? ` Kvar: ${launchInput.saknas.join(', ')}.` : ' Allt ifyllt.'
      }`
    );
  }

  const okandaIgen = [...igen].filter((id) => !STEG_IDN.includes(id));
  if (okandaIgen.length > 0) stopp(`okänt steg i --igen: ${okandaIgen.join(', ')}`, [`Stegen är: ${STEG_IDN.join(', ')}`]);

  // State per nivå — läses även i dry-run (för tema-id och slutrapporten),
  // skrivs bara skarpt.
  const butiksstate = lasState(butik.butik.id, BUTIKSNYCKEL);
  ctx.butiksstate = butiksstate;
  for (const pk of ctx.produkter) pk.state = lasState(butik.butik.id, pk.p.produkt.id);
  const produktstater = ctx.produkter.map((pk) => pk.state);
  // Slutrapporten går över STEG (qa/checklista bokförs inte som steg —
  // qa läses ur state.qa, extrasteg som launch/store-ready ur state själv).
  const stegOrdning = STEG;

  if (dryRun) {
    // Spärrarna körs utan nätverk — så dry-run säger om miljön pekar rätt.
    try {
      const r = await anslut(butik.butik.id, { torr: true, onskadDoman: onskadDomanUr(butik) });
      ctx.torrAnslutning = { ok: true, domain: r.domain };
    } catch (e) {
      ctx.torrAnslutning = { ok: false, skal: e.message };
    }
    for (const steg of STEG) {
      const beskriv = (pk) => {
        try {
          return steg.torrt(ctx, pk);
        } catch (e) {
          return [`⚠️ torrkörningen kunde inte beskriva steget: ${e.message}`];
        }
      };
      if (steg.niva === 'produkt') {
        for (const pk of ctx.produkter) skrivDryRunRad({ ...steg, namn: `${steg.namn} — ${pk.p.produkt.id}` }, beskriv(pk));
      } else {
        skrivDryRunRad(steg, beskriv(null));
      }
    }
    skrivDryRunRad(EFTERSTEG[0], [
      'kontroll.mjs per produkt mot API',
      `kundvy: startsidan + produktsidan hämtas som RIKTIG HTML (storefront-lösenord ur env SHOPIFY_STOREFRONT_PASSWORD${process.env.SHOPIFY_STOREFRONT_PASSWORD ? ' — satt' : ' — SAKNAS: kundvyn blir röd'}) — utan HTML: rött`,
      'trippelkoll: hela butiken läses tillbaka och jämförs med yaml',
    ]);
    skrivDryRunRad(EFTERSTEG[1], [`output/${butik.butik.id}/CHECKLISTA.md (EN fil för butiken, ${ctx.produkter.length} produkter)`]);
    skrivDryRunRad(EFTERSTEG[2], ['två listor ur state: Gjort av mig / Väntar på en människa']);

    const mappar = ctx.produkter.map((pk) => skrivProduktfiler(ctx, pk, varningar, null));
    const checklista = skrivChecklista(ctx);
    if (varningar.length > 0) {
      console.log(`\n⚠️  ${varningar.length} varningar:`);
      for (const v of varningar) console.log(`   • ${v}`);
    }
    for (const mapp of mappar) console.log(`\nOutput: ${mapp}`);
    console.log(`Checklista: ${checklista}`);
    console.log(`\nSlutrapport ur befintligt state (${butik.butik.id}):`);
    console.log(slutrapportText(byggSlutrapport(stegOrdning, butiksstate, produktstater)));
    console.log('\n✅ Dry-run klar — inget skickades till Shopify.\n');
    return;
  }

  if (storeReady) {
    const { storeReady: korStoreReady } = await import('./store-ready.mjs');
    const r = await korStoreReady(butik.butik.id, { torr: false });
    console.log(slutrapportText(byggSlutrapport(stegOrdning, lasState(butik.butik.id, BUTIKSNYCKEL), produktstater)));
    return r;
  }

  // Ett steg körs en gång per butik, eller en gång per produkt. Varje körning
  // bokförs i SITT state. Manuella steg bokförs som manuella (klar:false) och
  // stoppar aldrig; stoppande steg avbryter bygget med --resume-instruktion.
  async function korSteg(steg, pk) {
    const state = pk ? pk.state : butiksstate;
    const etikett = pk ? `${steg.namn} — ${pk.p.produkt.id}` : steg.namn;
    // Anslutningen hoppas aldrig över: utan token och spärrar kan inget
    // annat steg köras, och miljön kan ha bytt butik sedan förra körningen.
    if (steg.id !== 'anslutning' && !skaKoras(steg.id, { resume, igen, klart: arKlart(state, steg.id) })) {
      console.log(`⏭  ${etikett} — redan grönt, hoppar över.`);
      return;
    }
    try {
      const resultat = await steg.kor(ctx, pk);
      if (resultat?.manuell) {
        const { manuell, ...rest } = resultat;
        markeraManuell(state, steg.id, manuell, rest);
        console.log(`🖐 ${etikett}: ${manuell}`);
      } else {
        markeraKlart(state, steg.id, resultat ?? {});
        console.log(`✅ ${etikett}`);
      }
    } catch (e) {
      if (steg.stoppar === false) {
        markeraManuell(state, steg.id, `Steget gick inte att göra: ${e.message}`);
        console.log(`🖐 ${etikett}: ${e.message}`);
      } else {
        skrivState(state);
        stopp(`steget "${etikett}"`, [e.message, `Rätta felet och kör igen med --resume (eller --igen ${steg.id}).`]);
      }
    }
    skrivState(state);
  }

  for (const steg of STEG) {
    if (steg.niva === 'produkt') {
      for (const pk of ctx.produkter) await korSteg(steg, pk);
    } else {
      await korSteg(steg, null);
    }
  }

  // Steg 18: QA körs alltid färskt — aldrig ur state — butiken en gång och
  // varje produkt för sig (FLERPRODUKT.md punkt 4: annars kan produkt 2 vara
  // trasig medan QA är grön).
  // QA:n ska läsa butiken som den ÄR NU — ctx.shop hämtades i steg 0, före
  // policyer och menyer skrevs. Med den gamla ögonblicksbilden rapporterade
  // kontrollen "villkor saknas" i samma körning som policysteget var grönt
  // (AdventLane 2026-09-10).
  ctx.shop = await kontrolleraAnslutning();
  const butiksQa = await korButiksQa(ctx);
  console.log('\nQA — butiken (kundvy + trippelkoll):');
  for (const punkt of butiksQa.punkter) console.log(`${IKON[punkt.utfall]} ${punkt.namn}: ${punkt.detalj}`);
  butiksstate.qa = { gron: butiksQa.gron, kritiska: butiksQa.kritiska.map((k) => k.namn), tid: new Date().toISOString() };
  skrivState(butiksstate);

  const qaPerProdukt = [];
  for (const pk of ctx.produkter) {
    const qa = await korProduktQa(ctx, pk, butiksQa);
    qaPerProdukt.push({ pk, qa });
    console.log(`\nQA — ${pk.p.produkt.id}:`);
    for (const punkt of qa.punkter) console.log(`${IKON[punkt.utfall]} ${punkt.namn}: ${punkt.detalj}`);
    pk.state.qa = { gron: qa.gron, kritiska: qa.kritiska.map((k) => k.namn), tid: new Date().toISOString() };
    skrivState(pk.state);
    const mapp = skrivProduktfiler(ctx, pk, varningar, qa);
    console.log(`Output: ${mapp}`);
  }
  const allaGrona = butiksQa.gron && qaPerProdukt.every((x) => x.qa.gron);
  const kritiskaTotalt = butiksQa.kritiska.length + qaPerProdukt.reduce((n, x) => n + x.qa.kritiska.length, 0);

  // Steg 19: checklistan. Steg 20: slutrapporten — två listor ur state.
  const checklista = skrivChecklista(ctx);
  console.log(`\nChecklista: ${checklista}`);
  const skrivSlutrapport = () => {
    console.log(`\nSLUTRAPPORT — ${butik.butik.brand}`);
    console.log(slutrapportText(byggSlutrapport(stegOrdning, lasState(butik.butik.id, BUTIKSNYCKEL), ctx.produkter.map((pk) => lasState(butik.butik.id, pk.p.produkt.id)))));
  };

  if (!launch) {
    console.log(`\nSTATUS: REVIEW — inget är publicerat.${allaGrona ? ' QA är grön för butiken och alla produkter.' : ` QA har ${kritiskaTotalt} röda punkter.`}`);
    skrivSlutrapport();
    console.log('');
    return;
  }

  // --launch: bara när QA är grön för butiken och VARJE produkt. En butik får
  // aldrig gå live med halva sortimentet i 404.
  if (!allaGrona) {
    stopp(`QA har ${kritiskaTotalt} röda punkter — LAUNCH vägrar`, [
      ...butiksQa.kritiska.map((k) => `butiken · ${k.namn}: ${k.detalj}`),
      ...qaPerProdukt.flatMap((x) => x.qa.kritiska.map((k) => `${x.pk.p.produkt.id} · ${k.namn}: ${k.detalj}`)),
    ]);
  }
  for (const { pk } of qaPerProdukt) {
    const produkt = await produktIButiken(pk);
    const resultat = await publiceraProdukt(produkt.id);
    markeraKlart(pk.state, 'launch', { status: resultat.status, publicerad: resultat.publicerad });
    skrivState(pk.state);
    console.log(`\n✅ LIVE: ${pk.p.produkt.namn} är ${resultat.status}${resultat.publicerad ? ` och publicerad i ${resultat.kanal}` : ''}.`);
    if (!resultat.publicerad) console.log(`🖐 ${resultat.notis ?? 'Publicera produkten i Online Store-kanalen för hand.'}`);
  }
  const temaNamn = lasArbetstemaNamn(butiksstate) ?? standardTemanamn(butik.butik.brand);
  markeraManuell(butiksstate, 'tema-publicering', `VA:n publicerar temat "${temaNamn}": Online Store → Themes → ${temaNamn} → Publish.`);
  skrivState(butiksstate);
  console.log(`\n🖐 Temat att publicera (VA:ns klick): "${temaNamn}"`);
  skrivSlutrapport();
  console.log('   • Starta annonserna — fabriken rör aldrig annonskontot.\n');
}

// ---------------------------------------------------------------------------

function valjButik(argument) {
  const flaggIndex = argument.indexOf('--butik');
  const mapp = join(FACTORY_ROT, 'butiker');
  const filer = existsSync(mapp) ? readdirSync(mapp).filter((f) => f.endsWith('.yaml')) : [];
  const namngiven = flaggIndex !== -1 ? argument[flaggIndex + 1] : null;
  if (namngiven) {
    const sokvag = join(mapp, `${namngiven}.yaml`);
    if (!existsSync(sokvag)) {
      stopp(`butiken "${namngiven}" finns inte`, [
        filer.length > 0 ? `Finns: ${filer.map((f) => f.replace('.yaml', '')).join(', ')}` : 'Skapa factory/butiker/<id>.yaml ur butik-mall.yaml.',
      ]);
    }
    return sokvag;
  }
  if (filer.length === 0) stopp('butikskonfig saknas', ['Skapa factory/butiker/<id>.yaml ur butik-mall.yaml.']);
  if (filer.length > 1) {
    stopp('flera butiker finns', [`Välj med --butik <id>: ${filer.map((f) => f.replace('.yaml', '')).join(', ')}`]);
  }
  return join(mapp, filer[0]);
}

export function tolkaArgv(argv) {
  const flaggor = new Set(argv.filter((a) => a.startsWith('--')));
  const igen = tolkaIgen(argv);
  const positioner = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--butik' && argv[i - 1] !== '--igen');
  return {
    dryRun: flaggor.has('--dry-run') || flaggor.has('--dry') || flaggor.has('--torr'),
    resume: flaggor.has('--resume'),
    launch: flaggor.has('--launch'),
    storeReady: flaggor.has('--store-ready'),
    igen,
    positioner,
  };
}

async function huvud() {
  const argv = process.argv.slice(2);
  const { dryRun, resume, launch, storeReady, igen, positioner } = tolkaArgv(argv);

  laddaEnv();

  const forsta = (positioner[0] ?? '').toUpperCase();
  if (forsta === 'BUILD' || forsta === 'LAUNCH') {
    // Gamla formen: BUILD/LAUNCH <produktfil …> [--butik <id>]
    const produktfiler = positioner.slice(1);
    const butiksfil = valjButik(argv);
    if (produktfiler.length === 0) {
      stopp('produktfil saknas', ['Användning: node factory/ops.mjs BUILD <produktfil.yaml> [fler …]']);
    }
    return huvudflode({ butiksfil, produktfiler, dryRun, resume, igen, storeReady, launch: launch || forsta === 'LAUNCH' });
  }

  // Nya formen: <butik.yaml> <produkt.yaml> [<produkt2.yaml> …]
  // Butiksfilen känns igen på att den ligger i butiker/ — ordningen spelar
  // därför ingen roll, och en flerproduktsbutik listar bara fler filer.
  const butiksfiler = positioner.filter((f) => basename(dirname(f)) === 'butiker');
  const produktfiler = positioner.filter((f) => basename(dirname(f)) !== 'butiker');
  const butiksfil = butiksfiler[0] ?? produktfiler.shift();

  if (!butiksfil || produktfiler.length === 0) {
    console.error('Användning: node factory/ops.mjs <butik.yaml> <produkt.yaml> [fler produktfiler …] [--dry-run] [--resume] [--igen <steg>] [--launch] [--store-ready]');
    process.exit(1);
  }
  if (butiksfiler.length > 1) {
    stopp('flera butiksfiler angavs', ['En körning bygger EN butik. Ange bara en fil ur butiker/.']);
  }
  return huvudflode({ butiksfil, produktfiler, dryRun, resume, launch, igen, storeReady });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(1);
  });
}
