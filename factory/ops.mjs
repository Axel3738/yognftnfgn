// OPS Factory — hela kedjan: butikskonfig + produktfiler → färdig OPS-butik.
//
//   node factory/ops.mjs factory/butiker/<butik>.yaml factory/produkter/<produkt>.yaml
//
// FLERA PRODUKTER I SAMMA BUTIK — lista bara fler produktfiler:
//
//   node factory/ops.mjs factory/butiker/<butik>.yaml \
//        factory/produkter/<a>.yaml factory/produkter/<b>.yaml
//
// Butikens steg körs då EN gång, produktens steg en gång per produkt, och
// QA körs per produkt så butiken aldrig kan gå live med halva sortimentet
// i 404 (factory/FLERPRODUKT.md). Varje produkt behöver eget creative_prefix
// — motorn stoppar om två delar prefix.
//
//   --dry-run   visa exakt vad som skulle göras, rör aldrig Shopify
//   --resume    hoppa över steg som redan är gröna i factory/state/
//   --launch    publicera — kräver att QA-steget är helt grönt
//
// Gamla formen fungerar också:  BUILD <produkt.yaml>  /  LAUNCH <produkt.yaml>
//
// Motorn är en steglista. Varje steg är idempotent (samma körning två gånger
// ger samma butik, inga dubbletter), skriver sitt resultat till factory/state/
// och kan hoppas över med --resume. Inget steg loggar hemligheter — state
// filtreras genom rensaHemligheter före varje skrivning.
//
// Publicerar ALDRIG något utan --launch. Köper aldrig plan eller domän.
// Startar aldrig annonser — Meta rörs inte härifrån.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname, basename } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { valideraButik, sammanfoga } from './butik.mjs';
import { lasLaunchInput, tillampaLaunchInput } from './launch-input.mjs';
import { validera } from './validera.mjs';
import { byggPlan } from './build-store.mjs';
import { byggForhandsvisning, kundUnderrubrik } from './sida.mjs';
import { laddaEnv } from './env.mjs';
import { byggFraktplan, byggFraktatgarder } from './frakt.mjs';
import { lasState, skrivState, arKlart, markeraKlart } from './state.mjs';
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
  hamtaUtkastTema,
  skrivTemafiler,
  hamtaTemafil,
  verifieraTemafiler,
  skrivMeny,
  hamtaFraktzoner,
  tillampaFraktatgarder,
} from './shopify.mjs';
import { laddaUppTema, vantaPaUppackning } from './tema-upload.mjs';
import { byggStartsida, byggFooterGroup, startsideRader } from './startsida.mjs';
import { KANDA_SMITTADE, skannaTema, rapport as kallrapport } from './kallskanning.mjs';
import { kontrolleraLaunch } from './kontroll.mjs';
import { byggPolicyer, kontaktsida, saknadeUppgifter } from './policyer.mjs';
import { byggMetafalt } from './metafalt.mjs';
import { byggJudgeMeCsv } from './judgeme.mjs';
import { byggChecklista } from './checklista.mjs';
import {
  byggBrandCss,
  byggSettingsPatch,
  laggInBrandCss,
  brandRader,
  valideraBranding,
} from './branding.mjs';
import { SEKTIONER, TEMAFILER, byggProduktTemplate, sektionerSomVisas } from './tema.mjs';
import { qaSektionsfiler, qaRenderadSida } from './tema-qa.mjs';

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
const IKON = { ok: '✅', kritisk: '❌', manuell: '🖐' };

function stopp(rubrik, rader) {
  console.error(`\n❌ STOPP — ${rubrik}`);
  for (const r of rader) console.error(`   • ${r}`);
  console.error('');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Stegen. Varje steg: { id, namn, niva, torrt(ctx, pk) → rader, kor(ctx, pk) }.
// `torrt` beskriver vad som skulle hända; `kor` gör det. Båda idempotenta.
//
// niva: 'butik'   — körs EN gång per butik (tema, sidor, frakt, startsida …)
//       'produkt' — körs en gång PER PRODUKT (`pk` är produktkontexten)
//
// Delningen är produktloopen (factory/FLERPRODUKT.md punkt 1). Före den tog
// motorn en enda produktfil, och sju av nio steg kördes om i onödan så fort
// någon ville ha två produkter i samma butik.
// ---------------------------------------------------------------------------

const STEG = [
  {
    id: 'tema-upload',
    namn: 'CRO-temat upp i butiken',
    niva: 'butik',
    torrt: () => ['ops-tema.zip laddas upp som UNPUBLISHED om inget utkasttema finns'],
    async kor(ctx) {
      const befintligt = await hamtaUtkastTema();
      if (befintligt) return { temaId: befintligt.id, temaNamn: befintligt.name, redanUppe: true };
      const tema = await laddaUppTema(`${ctx.butik.butik.brand} v1`);
      const lage = await vantaPaUppackning(tema.id);
      if (!lage.klart) {
        throw new Error('Temat packades inte upp i tid — kör om steget med --resume.');
      }
      return { temaId: tema.id, temaNamn: tema.name, redanUppe: false };
    },
  },
  {
    id: 'produkt',
    namn: 'Produkten i Shopify',
    niva: 'produkt',
    torrt: (ctx, pk) => {
      const i = pk.plan.input;
      return [
        `${i.title} (handle ${i.handle}) som ${i.status}`,
        ...i.variants.map(
          (v) => `variant ${v.optionValues[0].name}: ${v.price} ${pk.p.ekonomi.valuta}${v.compareAtPrice ? ` (jämförpris ${v.compareAtPrice})` : ''}`
        ),
        `${i.files.length} bilder, SEO-titel "${i.seo.title}"`,
      ];
    },
    async kor(ctx, pk) {
      // productSet skapar på handle men UPPDATERAR bara på id — utan id:t
      // svarar Shopify "Handle already in use" så fort produkten finns.
      // Mätt 2026-09-09 när spöhållarens copy skulle skrivas om.
      const befintlig = await hamtaProduktViaHandle(pk.p.produkt.id);
      const input = befintlig ? { ...pk.plan.input, id: befintlig.id } : pk.plan.input;
      const produkt = await skapaProdukt(input);
      pk.produkt = produkt;
      // Publiceras i Online Store direkt. En ACTIVE produkt som inte ligger i
      // kanalen ger 404 i kundvyn precis som en DRAFT gör.
      const pub = await publiceraIButiken(produkt.id);
      return { id: produkt.id, handle: produkt.handle, status: produkt.status, publicerad: pub.publicerad };
    },
  },
  {
    id: 'metafalt',
    namn: 'Metafälten (säljinnehållet)',
    niva: 'produkt',
    torrt: (ctx, pk) => pk.metafalt.map((m) => `opf.${m.key} (${m.type})`),
    async kor(ctx, pk) {
      if (!pk.produkt) pk.produkt = await hamtaProduktViaHandle(pk.p.produkt.id);
      if (!pk.produkt) throw new Error('Produkten finns inte — kör utan --resume.');
      await skrivMetafalt(pk.produkt.id, pk.metafalt);
      return { antal: pk.metafalt.length };
    },
  },
  {
    niva: 'butik',
    // Brand-steget före theme-bygget: butikens egen identitet läggs på temat.
    // Strukturen återanvänds mellan butiker — brandingen aldrig.
    id: 'brand',
    namn: 'Brandingen (butikens egna tokens)',
    torrt: (ctx) => brandRader(ctx.butik?.branding),
    async kor(ctx) {
      const tema = await hamtaUtkastTema();
      if (!tema) {
        return { manuell: 'Inget utkasttema finns i butiken — installera ett tema först.' };
      }
      const filer = { 'assets/opf-brand.css': byggBrandCss(ctx.butik?.branding) };

      // ms-head ska ladda brand-CSS:en sist, så den vinner över allt annat.
      const msHead = await hamtaTemafil(tema.id, 'snippets/ms-head.liquid');
      if (msHead) {
        const patchad = laggInBrandCss(msHead);
        if (patchad !== msHead) filer['snippets/ms-head.liquid'] = patchad;
      }

      // Färgscheman, typsnitt och radier in i temats inställningar.
      const rasettings = await hamtaTemafil(tema.id, 'config/settings_data.json');
      if (rasettings) {
        const settings = JSON.parse(String(rasettings).replace(/\/\*[\s\S]*?\*\//, '').trim());
        settings.current = { ...settings.current, ...byggSettingsPatch(ctx.butik?.branding) };
        filer['config/settings_data.json'] = `${JSON.stringify(settings, null, 2)}\n`;
      }

      await skrivTemafiler(tema.id, filer);
      const avvikande = await verifieraTemafiler(tema.id, {
        'assets/opf-brand.css': filer['assets/opf-brand.css'],
      });
      if (avvikande.length > 0) throw new Error(`Brand-CSS förvanskad: ${avvikande.join('; ')}`);
      return { temaId: tema.id, filer: Object.keys(filer) };
    },
  },
  {
    id: 'tema',
    namn: 'OPS-temat (sektioner + produktmall)',
    niva: 'butik',
    torrt: (ctx) => {
      // Produktmallen är EN fil för alla produkter — sektionerna döljer sig
      // själva per produkt när metafältet saknas. Därför redovisas vad varje
      // produkt kommer att visa, inte ett butiksgemensamt facit.
      const perProdukt = ctx.produkter.map((pk) => {
        const { visas, doljs } = sektionerSomVisas(pk.metafalt.map((m) => m.key));
        return `${pk.p.produkt.id}: visar ${visas.join(', ')}${doljs.length > 0 ? ` · döljer ${doljs.join(', ')}` : ''}`;
      });
      return [
        `${Object.keys(SEKTIONER).length} opf-sektioner in i utkasttemat`,
        `${Object.keys(TEMAFILER).length} fabriksägda temafiler skrivs över (${Object.keys(TEMAFILER).join(', ')})`,
        'produktmallen kopplar in dem efter main (hårdkodad icon-rad rensas)',
        'varje fil verifieras byte för byte efter uppladdning',
        ...perProdukt,
      ];
    },
    async kor() {
      const tema = await hamtaUtkastTema();
      if (!tema) {
        return { manuell: 'Inget utkasttema finns i butiken — installera ett tema först.' };
      }
      // Fabriksägda filer skrivs alltid över — bas-zip:ens kopia av
      // ms-paket.js bar varukorgsbuggen från 2026-09-09, och en klon som
      // utgick från ett gammalt tema bär den fortfarande.
      await skrivTemafiler(tema.id, { ...SEKTIONER, ...TEMAFILER });
      const befintlig = await hamtaTemafil(tema.id, 'templates/product.json');
      if (befintlig) {
        await skrivTemafiler(tema.id, { 'templates/product.json': byggProduktTemplate(befintlig) });
      }
      const avvikande = await verifieraTemafiler(tema.id, { ...SEKTIONER, ...TEMAFILER });
      if (avvikande.length > 0) throw new Error(`Temafiler förvanskade: ${avvikande.join('; ')}`);
      return {
        temaId: tema.id,
        temaNamn: tema.name,
        sektioner: Object.keys(SEKTIONER).length,
        temafiler: Object.keys(TEMAFILER),
      };
    },
  },
  {
    id: 'kollektion',
    namn: 'Sortimentskollektionen',
    niva: 'butik',
    torrt: (ctx) => [
      `${ctx.kollektion.handle} — "${ctx.kollektion.titel}"`,
      ...ctx.produkter.map((pk) => `  ${pk.p.produkt.namn}`),
    ],
    async kor(ctx) {
      const ids = [];
      for (const pk of ctx.produkter) {
        if (!pk.produkt) pk.produkt = await hamtaProduktViaHandle(pk.p.produkt.id);
        if (!pk.produkt) throw new Error(`Produkten ${pk.p.produkt.id} finns inte i butiken.`);
        ids.push(pk.produkt.id);
      }
      const kollektion = await skrivKollektion(
        ctx.kollektion.handle,
        ctx.kollektion.titel,
        ids,
        ctx.kollektion.beskrivning
      );
      const pub = await publiceraIButiken(kollektion.id);
      return { handle: kollektion.handle, produkter: ids.length, publicerad: pub.publicerad };
    },
  },
  {
    id: 'startsida',
    namn: 'Startsidan (templates/index.json)',
    niva: 'butik',
    torrt: (ctx) => startsideRader(ctx.butik, ctx.produkter.map((pk) => pk.p), ctx.kollektion.handle),
    async kor(ctx) {
      const tema = await hamtaUtkastTema();
      if (!tema) return { manuell: 'Inget utkasttema finns i butiken.' };

      const filer = {
        'templates/index.json': byggStartsida(
          ctx.butik,
          ctx.produkter.map((pk) => pk.p),
          ctx.kollektion.handle
        ),
      };

      // Sidfotens bolagsblock bär källbutikens uppgifter i bas-zip:en.
      const footer = await hamtaTemafil(tema.id, 'sections/footer-group.json');
      if (footer) filer['sections/footer-group.json'] = byggFooterGroup(footer, ctx.butik);

      await skrivTemafiler(tema.id, filer);
      const avvikande = await verifieraTemafiler(tema.id, filer);
      if (avvikande.length > 0) throw new Error(`Startsidan förvanskad: ${avvikande.join('; ')}`);
      return { temaId: tema.id, filer: Object.keys(filer) };
    },
  },
  {
    id: 'sidor',
    namn: 'Sidorna (villkor + kontakt)',
    niva: 'butik',
    torrt: (ctx) => [...ctx.policyer.map((x) => `${x.namn} (/pages/${x.handle})`), 'Kontakt (/pages/contact)'],
    async kor(ctx) {
      for (const policy of ctx.policyer) await skrivSida(policy.handle, policy.namn, policy.body);
      // "contact" är Shopifys standardsida — återanvänd den, skapa ingen dubblett.
      await skrivSida('contact', 'Kontakt', kontaktsida(ctx.p));
      return { antal: ctx.policyer.length + 1 };
    },
  },
  {
    id: 'policyer',
    namn: 'Officiella policyfälten',
    niva: 'butik',
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
        return {
          manuell: `Appen saknar scopet write_legal_policies — klistra in ${utanScope.join(', ')} under Inställningar → Policyer.`,
        };
      }
      return { antal: ctx.policyer.length };
    },
  },
  {
    id: 'meny',
    namn: 'Menyerna (huvudmeny + sidfot)',
    niva: 'butik',
    torrt: (ctx) => [
      ...ctx.huvudmenylankar.map((l) => `huvudmeny: ${l.titel} → ${l.url}`),
      ...ctx.menylankar.map((l) => `sidfot: ${l.titel} → ${l.url}`),
    ],
    async kor(ctx) {
      // Huvudmenyn får en rad per produkt (factory/FLERPRODUKT.md punkt 3).
      // Bas-temat ärver annars källbutikens meny och länkar till 404.
      const huvud = await skrivMeny('main-menu', 'Main menu', ctx.huvudmenylankar);
      const meny = await skrivMeny('footer', 'Footer menu', ctx.menylankar);
      return {
        huvudmeny: { handle: huvud.handle, orord: huvud.orord === true },
        sidfot: { handle: meny.handle, orord: meny.orord === true },
      };
    },
  },
  {
    id: 'frakt',
    namn: 'Fraktzonerna',
    niva: 'butik',
    torrt: (ctx) =>
      byggFraktplan(ctx.butik).map(
        (z) =>
          `${z.zon}${z.huvudmarknad ? ' (huvudmarknad)' : ''}: ${z.metoder
            .map((m) => `${m.namn} ${m.pris} ${m.valuta}`)
            .join(', ')}`
      ),
    async kor(ctx) {
      const lage = await hamtaFraktzoner();
      if (!lage) return { manuell: 'Ingen fraktprofil hittades i butiken.' };
      const atgarder = byggFraktatgarder(lage.zoner, byggFraktplan(ctx.butik));
      if (atgarder.saknadeZoner.length > 0) {
        return {
          manuell: `Zoner saknas i butiken och måste läggas till för hand: ${atgarder.saknadeZoner.join(', ')}.`,
        };
      }
      const resultat = await tillampaFraktatgarder(lage, atgarder);
      return { andrade: resultat.andrade, orort: atgarder.orort };
    },
  },
  {
    id: 'huvudmarknad',
    namn: 'Huvudmarknaden',
    niva: 'butik',
    torrt: (ctx) => [`${ctx.butik.butik.huvudmarknad} med ${ctx.butik.butik.valuta} ska vara butikens hemmamarknad`],
    async kor(ctx) {
      // Butikens land och valuta sätts vid registreringen och kan inte bytas via
      // API:t — steget verifierar i stället för att gissa.
      const shop = ctx.shop;
      if (shop?.currencyCode !== ctx.butik.butik.valuta) {
        return {
          manuell: `Butikens valuta är ${shop?.currencyCode}, konfigen säger ${ctx.butik.butik.valuta} — ändras i Shopify-admin.`,
        };
      }
      return { valuta: shop.currencyCode };
    },
  },
  {
    // Recensionerna in i Judge.me (Axels beslut 2026-09-06: steget är en del
    // av fabriken, inte ett handgrepp). Källan är produktens Drive-mapp om
    // produktfilen pekar ut en (kallor.drive_mapp — där ligger recensions-CSV:n
    // bredvid annonserna), annars judgeme-import.csv som fabriken själv byggt
    // ur produktfilens reviews. Själva importen görs av det befintliga
    // tools/judgeme-import.mjs — inget nytt importsystem.
    id: 'recensioner',
    namn: 'Recensionerna → Judge.me',
    niva: 'produkt',
    torrt(ctx, pk) {
      const antal = (pk.p.reviews ?? []).filter(Boolean).length;
      const kalla = pk.p.kallor?.drive_mapp
        ? `recensions-CSV ur Drive-mappen ${pk.p.kallor.drive_mapp}`
        : `${antal} recensioner ur produktfilen (output/${pk.p.produkt.id}/judgeme-import.csv)`;
      return [kalla, `importeras med tools/judgeme-import.mjs mot butikens Judge.me`];
    },
    async kor(ctx, pk) {
      const tokenEnv = ctx.butik.judgeme?.token_env ?? 'JUDGEME_API_TOKEN';
      const shopDomain = ctx.butik.judgeme?.shop_domain ?? process.env.JUDGEME_SHOP_DOMAIN;
      if (!process.env[tokenEnv] || !shopDomain) {
        return {
          manuell:
            `Judge.me-token saknas (env ${tokenEnv} + judgeme.shop_domain i butiksfilen). ` +
            'Installera Judge.me-appen i butiken, hämta privata API-tokenen och fyll i — kör sen om steget.',
        };
      }

      const mapp = join(FACTORY_ROT, 'output', pk.p.produkt.id);
      mkdirSync(mapp, { recursive: true });
      let csv = join(mapp, 'judgeme-import.csv');

      // Drive-mappen vinner när den finns: samma CSV som resten av flödet använder.
      const driveMapp = pk.p.kallor?.drive_mapp;
      if (driveMapp) {
        const id = String(driveMapp).match(/folders\/([-\w]+)/)?.[1] ?? String(driveMapp).trim();
        const ls = spawnSync('python3', [join(FACTORY_ROT, '..', 'tools', 'drive-ls.py'), id], {
          encoding: 'utf8',
        });
        if (ls.status !== 0) throw new Error(`Drive-mappen gick inte att lista: ${ls.stderr}`);
        const rad = ls.stdout
          .split('\n')
          .map((r) => r.split('\t'))
          .find(([typ, , titel]) => typ === 'fil' && /\.csv$/i.test(titel ?? '') && /recension|review/i.test(titel ?? ''));
        if (!rad) {
          return { manuell: 'Ingen recensions-CSV hittades i Drive-mappen — lägg dit den eller töm kallor.drive_mapp.' };
        }
        const svar = await fetch(`https://drive.google.com/uc?export=download&id=${rad[1]}`);
        if (!svar.ok) throw new Error(`Kunde inte hämta CSV:n ur Drive (${svar.status})`);
        csv = join(mapp, 'judgeme-import-drive.csv');
        writeFileSync(csv, await svar.text());
      } else if (!existsSync(csv)) {
        const inneh = byggJudgeMeCsv(pk.p);
        if (!inneh) return { manuell: 'Produkten har inga recensioner — inget att importera.' };
        writeFileSync(csv, inneh);
      }

      const arg = [
        join(FACTORY_ROT, '..', 'tools', 'judgeme-import.mjs'),
        csv,
        '--product-handle', pk.p.produkt.id,
        '--store-url', `https://${shopDomain}`,
        '--shop-domain', shopDomain,
        '--token-env', tokenEnv,
      ];
      const kor = spawnSync(process.execPath, arg, { encoding: 'utf8' });
      if (kor.status !== 0) {
        throw new Error(`judgeme-import.mjs felade: ${(kor.stderr || kor.stdout).slice(0, 400)}`);
      }
      return { csv: basename(csv), rapport: kor.stdout.trim().split('\n').slice(-3).join(' · ') };
    },
  },
  {
    // Sista spärren före överlämning: ingen text från bas-temats ursprungsbutik
    // får finnas kvar (Axels bakläxa 2026-09-09). Körs efter startsidan, så
    // den mäter det som FAKTISKT ligger i temat — inte vad fabriken tänkte.
    id: 'kallskanning',
    namn: 'Källskanningen (ingen Matstrumpor-text kvar)',
    niva: 'butik',
    torrt: () => [`${KANDA_SMITTADE.length} kända mallar + temats övriga JSON-filer skannas`],
    async kor(ctx) {
      const tema = await hamtaUtkastTema();
      if (!tema) return { manuell: 'Inget utkasttema finns i butiken.' };
      const filer = {};
      for (const namn of KANDA_SMITTADE) {
        const innehall = await hamtaTemafil(tema.id, namn);
        if (innehall) filer[namn] = innehall;
      }
      const resultat = skannaTema(filer);
      ctx.kallskanning = resultat;
      if (!resultat.rent) {
        throw new Error(`${kallrapport(resultat)}\nSkanningen är en spärr — butiken får inte lämnas så här.`);
      }
      return { skannade: Object.keys(filer).length, rent: true };
    },
  },
];

// ---------------------------------------------------------------------------

function lasKonfig(butiksfil, produktfiler) {
  // LAUNCH-INPUT läses först och läggs ovanpå råfilerna — sen valideras allt
  // som vanligt, så det Axel fyllt i mäts av exakt samma spärrar.
  const rabutik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const rader = produktfiler.map((fil) => lasYaml(readFileSync(fil, 'utf8')));
  // LAUNCH-INPUT beskriver EN produkt — läggs bara på när butiken bär en.
  // I en flerproduktsbutik vet filen inte vilken produkt den gäller, och att
  // gissa vore att skriva Axels värden på fel produkt.
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
    produkter.push({ p, nyckeltal });
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
function byggProduktKontext(p) {
  return {
    p,
    plan: byggPlan(p),
    metafalt: byggMetafalt(p, { kundUnderrubrik }),
    produkt: null,
  };
}

// Butikskontexten: allt som gäller HELA butiken, plus produktkontexterna.
// Policyerna och kontaktsidan byggs ur den FÖRSTA produkten — de innehåller
// bara bolagsuppgifter, som kommer ur butiksfilen och är lika för alla.
function byggButiksKontext(butik, produkter) {
  const produktkontexter = produkter.map((x) => byggProduktKontext(x.p));
  const policyer = byggPolicyer(produkter[0].p);
  const kollektionHandle = butik?.butik?.kollektion?.handle ?? 'sortimentet';

  return {
    butik,
    p: produkter[0].p, // representant för butiksgemensamma texter
    produkter: produktkontexter,
    policyer,
    kollektion: {
      handle: kollektionHandle,
      titel: butik?.butik?.kollektion?.titel ?? 'Sortimentet',
      beskrivning: butik?.butik?.kollektion?.beskrivning ?? '',
    },
    // Huvudmenyn: en rad per produkt (FLERPRODUKT.md punkt 3).
    huvudmenylankar: [
      ...(produktkontexter.length > 1
        ? [{ titel: butik?.butik?.kollektion?.titel ?? 'Sortimentet', url: `/collections/${kollektionHandle}` }]
        : []),
      ...produktkontexter.map((pk) => ({
        titel: pk.p.produkt.menynamn ?? pk.p.produkt.namn,
        url: `/products/${pk.p.produkt.id}`,
      })),
      { titel: 'Kontakt', url: '/pages/contact' },
    ],
    menylankar: [
      ...policyer.map((x) => ({ titel: x.namn, url: `/pages/${x.handle}` })),
      { titel: 'Kontakt', url: '/pages/contact' },
    ],
    shop: null,
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

function skrivUtdatafiler(ctx, pk, varningar, qa) {
  const mapp = join(FACTORY_ROT, 'output', pk.p.produkt.id);
  mkdirSync(mapp, { recursive: true });
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
  // Judge.me-underlaget: importeras med tools/judgeme-import.mjs efter launch.
  const judgeMeCsv = byggJudgeMeCsv(pk.p);
  if (judgeMeCsv) writeFileSync(join(mapp, 'judgeme-import.csv'), judgeMeCsv);
  // VA:ns manuella klick, i rätt ordning — hela hennes att-göra efter bygget.
  writeFileSync(join(mapp, 'CHECKLISTA.md'), byggChecklista(pk.p, ctx.butik));
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

async function korQa(ctx, pk) {
  const produkt = await hamtaProduktViaHandle(pk.p.produkt.id);
  return kontrolleraLaunch(pk.p, {
    shop: ctx.shop,
    produkt,
    policyer: ctx.shop?.shopPolicies ?? null,
  });
}

// Butikssteget har sitt eget state — annars skulle temat, sidorna och
// fraktzonerna bokföras en gång per produkt och --resume tro att de var
// ogjorda för produkt 2.
const BUTIKSNYCKEL = '_butik';

async function huvudflode({ butiksfil, produktfiler, dryRun, resume, launch }) {
  const { butik, produkter, varningar, launchInput } = lasKonfig(butiksfil, produktfiler);
  const ctx = byggButiksKontext(butik, produkter);
  const lage = dryRun ? 'DRY-RUN' : launch ? 'LAUNCH' : resume ? 'RESUME' : 'BUILD';
  const rubrik = produkter.map((x) => x.p.produkt.namn).join(' + ');
  console.log(`\nOPS Factory · ${rubrik} · butik ${butik.butik.brand} · ${lage}\n`);
  for (const { p, nyckeltal } of produkter) {
    console.log(
      `✅ ${p.produkt.id}: break-even-ROAS ${nyckeltal.breakEvenRoas}, marginal ${nyckeltal.marginal} ${p.ekonomi.valuta}, prefix ${p.meta?.creative_prefix ?? '(saknas)'}.`
    );
  }
  if (launchInput) {
    console.log(
      `📋 LAUNCH-INPUT: ${launchInput.ifyllt.length} av ${launchInput.ifyllt.length + launchInput.saknas.length} ifyllda.${
        launchInput.saknas.length > 0 ? ` Kvar: ${launchInput.saknas.join(', ')}.` : ' Allt ifyllt.'
      }`
    );
  }

  if (dryRun) {
    for (const steg of STEG) {
      if (steg.niva === 'produkt') {
        for (const pk of ctx.produkter) {
          console.log(`\n▫️ ${steg.namn} — ${pk.p.produkt.id}`);
          for (const rad of steg.torrt(ctx, pk)) console.log(`   ${rad}`);
        }
      } else {
        console.log(`\n▫️ ${steg.namn}`);
        for (const rad of steg.torrt(ctx)) console.log(`   ${rad}`);
      }
    }
    const mappar = ctx.produkter.map((pk) => skrivUtdatafiler(ctx, pk, varningar, null));
    if (varningar.length > 0) {
      console.log(`\n⚠️  ${varningar.length} varningar:`);
      for (const v of varningar) console.log(`   • ${v}`);
    }
    for (const mapp of mappar) console.log(`\nOutput: ${mapp}`);
    console.log('\n✅ Dry-run klar — inget skickades till Shopify.\n');
    return;
  }

  // Skarpt läge: anslutningen är obligatorisk.
  try {
    ctx.shop = await kontrolleraAnslutning();
    console.log(`✅ Shopify: ${ctx.shop.name} (${ctx.shop.myshopifyDomain}, ${ctx.shop.currencyCode})`);
  } catch (e) {
    stopp('Shopify-kopplingen', [e.message]);
  }

  const butiksstate = lasState(butik.butik.id, BUTIKSNYCKEL);
  const produktstate = new Map(
    ctx.produkter.map((pk) => [pk.p.produkt.id, lasState(butik.butik.id, pk.p.produkt.id)])
  );
  const manuella = [];

  // Ett steg körs en gång per butik, eller en gång per produkt. Varje körning
  // bokförs i SITT state — därför kan en produkt läggas till i en färdig butik
  // utan att butikens steg görs om.
  async function korSteg(steg, pk) {
    const state = pk ? produktstate.get(pk.p.produkt.id) : butiksstate;
    const etikett = pk ? `${steg.namn} — ${pk.p.produkt.id}` : steg.namn;
    if (resume && arKlart(state, steg.id)) {
      console.log(`⏭  ${etikett} — redan grönt, hoppar över.`);
      return;
    }
    try {
      const resultat = await steg.kor(ctx, pk);
      if (resultat?.manuell) {
        manuella.push(`${etikett}: ${resultat.manuell}`);
        console.log(`🖐 ${etikett}: ${resultat.manuell}`);
        // Ett manuellt steg är inte klart — resume ska försöka igen.
      } else {
        markeraKlart(state, steg.id, resultat);
        console.log(`✅ ${etikett}`);
      }
    } catch (e) {
      skrivState(state);
      stopp(`steget "${etikett}"`, [e.message, 'Rätta felet och kör igen med --resume.']);
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

  // QA körs alltid färskt — aldrig ur state — och en gång PER PRODUKT.
  // (FLERPRODUKT.md punkt 4: annars kan produkt 2 vara trasig medan QA är grön.)
  const qaPerProdukt = [];
  for (const pk of ctx.produkter) {
    const qa = await korQa(ctx, pk);
    qaPerProdukt.push({ pk, qa });
    console.log(`\nQA — ${pk.p.produkt.id}:`);
    for (const punkt of qa.punkter) console.log(`${IKON[punkt.utfall]} ${punkt.namn}: ${punkt.detalj}`);
    const state = produktstate.get(pk.p.produkt.id);
    state.qa = { gron: qa.gron, kritiska: qa.kritiska.map((k) => k.namn), tid: new Date().toISOString() };
    skrivState(state);
    const mapp = skrivUtdatafiler(ctx, pk, varningar, qa);
    console.log(`Output: ${mapp}`);
  }
  const allaGrona = qaPerProdukt.every((x) => x.qa.gron);
  const kritiskaTotalt = qaPerProdukt.reduce((n, x) => n + x.qa.kritiska.length, 0);

  if (!launch) {
    console.log(`\nSTATUS: REVIEW — inget är publicerat.${allaGrona ? ' QA är grön för alla produkter.' : ` QA har ${kritiskaTotalt} kritiska punkter.`}`);
    if (manuella.length > 0) {
      console.log('NEEDS ME:');
      for (const m of manuella) console.log(`   • ${m}`);
    }
    console.log('');
    return;
  }

  // --launch: bara när QA är grön för VARJE produkt. En butik får aldrig gå
  // live med halva sortimentet i 404.
  if (!allaGrona) {
    stopp(
      `QA har ${kritiskaTotalt} kritiska punkter — LAUNCH vägrar`,
      qaPerProdukt.flatMap((x) => x.qa.kritiska.map((k) => `${x.pk.p.produkt.id} · ${k.namn}: ${k.detalj}`))
    );
  }
  for (const { pk } of qaPerProdukt) {
    const produkt = await hamtaProduktViaHandle(pk.p.produkt.id);
    const resultat = await publiceraProdukt(produkt.id);
    const state = produktstate.get(pk.p.produkt.id);
    markeraKlart(state, 'launch', { status: resultat.status, publicerad: resultat.publicerad });
    skrivState(state);
    console.log(`\n✅ LIVE: ${pk.p.produkt.namn} är ${resultat.status}${resultat.publicerad ? ` och publicerad i ${resultat.kanal}` : ''}.`);
    if (!resultat.publicerad) console.log(`🖐 ${resultat.notis ?? 'Publicera produkten i Online Store-kanalen för hand.'}`);
  }
  console.log('\nKvar att göra för hand:');
  for (const { pk, qa } of qaPerProdukt) {
    for (const m of qa.manuella) console.log(`   • ${pk.p.produkt.id} · ${m.namn}: ${m.detalj}`);
  }
  console.log('   • Publicera temat i Shopify-admin (API:t tillåter det inte).');
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

async function huvud() {
  const argv = process.argv.slice(2);
  const flaggor = new Set(argv.filter((a) => a.startsWith('--')));
  const dryRun = flaggor.has('--dry-run') || flaggor.has('--dry');
  const resume = flaggor.has('--resume');
  const launch = flaggor.has('--launch');
  const positioner = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--butik');

  laddaEnv();

  const forsta = (positioner[0] ?? '').toUpperCase();
  if (forsta === 'BUILD' || forsta === 'LAUNCH') {
    // Gamla formen: BUILD/LAUNCH <produktfil …> [--butik <id>]
    const produktfiler = positioner.slice(1);
    const butiksfil = valjButik(argv);
    if (produktfiler.length === 0) {
      stopp('produktfil saknas', ['Användning: node factory/ops.mjs BUILD <produktfil.yaml> [fler …]']);
    }
    return huvudflode({ butiksfil, produktfiler, dryRun, resume, launch: launch || forsta === 'LAUNCH' });
  }

  // Nya formen: <butik.yaml> <produkt.yaml> [<produkt2.yaml> …]
  // Butiksfilen känns igen på att den ligger i butiker/ — ordningen spelar
  // därför ingen roll, och en flerproduktsbutik listar bara fler filer.
  const butiksfiler = positioner.filter((f) => basename(dirname(f)) === 'butiker');
  const produktfiler = positioner.filter((f) => basename(dirname(f)) !== 'butiker');
  const butiksfil = butiksfiler[0] ?? produktfiler.shift();

  if (!butiksfil || produktfiler.length === 0) {
    console.error('Användning: node factory/ops.mjs <butik.yaml> <produkt.yaml> [fler produktfiler …] [--dry-run] [--resume] [--launch]');
    process.exit(1);
  }
  if (butiksfiler.length > 1) {
    stopp('flera butiksfiler angavs', ['En körning bygger EN butik. Ange bara en fil ur butiker/.']);
  }
  return huvudflode({ butiksfil, produktfiler, dryRun, resume, launch });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(1);
  });
}
