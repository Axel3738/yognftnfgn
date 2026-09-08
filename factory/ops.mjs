// OPS Factory — hela kedjan: butikskonfig + produktfil → färdig OPS-butik.
//
//   node factory/ops.mjs factory/butiker/<butik>.yaml factory/produkter/<produkt>.yaml
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
import { kontrolleraLaunch } from './kontroll.mjs';
import { byggPolicyer, kontaktsida, saknadeUppgifter } from './policyer.mjs';
import { byggMetafalt } from './metafalt.mjs';
import { byggJudgeMeCsv, byggJudgeMeCsvOversatt } from './judgeme.mjs';
import { byggChecklista } from './checklista.mjs';
import {
  byggBrandCss,
  byggSettingsPatch,
  laggInBrandCss,
  brandRader,
  valideraBranding,
} from './branding.mjs';
import { SEKTIONER, byggProduktTemplate, sektionerSomVisas, byggKorgUpsell } from './tema.mjs';
import {
  byggIndex,
  byggHeaderGroup,
  byggFooterGroup,
  settingsTillagg,
  settingsSchemaMedAb,
  patchaProduktTemplate,
  msHeadGallerifilter,
  GALLERIFILTER_MARKE,
  temabilder,
} from './tema-mall.mjs';
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
// Stegen. Varje steg: { id, namn, torrt(ctx) → rader, kor(ctx) → resultat }.
// `torrt` beskriver vad som skulle hända; `kor` gör det. Båda idempotenta.
// ---------------------------------------------------------------------------

const STEG = [
  {
    id: 'produkt',
    namn: 'Produkten i Shopify (ACTIVE)',
    torrt: (ctx) => {
      const i = ctx.plan.input;
      return [
        `${i.title} (handle ${i.handle}) som ${i.status}`,
        ...i.variants.map(
          (v) => `variant ${v.optionValues[0].name}: ${v.price} ${ctx.p.ekonomi.valuta}${v.compareAtPrice ? ` (jämförpris ${v.compareAtPrice})` : ''}`
        ),
        `${i.files.length} bilder, SEO-titel "${i.seo.title}"`,
      ];
    },
    async kor(ctx) {
      const produkt = await skapaProdukt(ctx.plan.input);
      ctx.produkt = produkt;
      return { id: produkt.id, handle: produkt.handle, status: produkt.status };
    },
  },
  {
    id: 'metafalt',
    namn: 'Metafälten (säljinnehållet)',
    torrt: (ctx) => ctx.metafalt.map((m) => `opf.${m.key} (${m.type})`),
    async kor(ctx) {
      if (!ctx.produkt) ctx.produkt = await hamtaProduktViaHandle(ctx.p.produkt.id);
      if (!ctx.produkt) throw new Error('Produkten finns inte — kör utan --resume.');
      await skrivMetafalt(ctx.produkt.id, ctx.metafalt);
      return { antal: ctx.metafalt.length };
    },
  },
  {
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
    torrt: (ctx) => {
      const { visas, doljs } = sektionerSomVisas(ctx.metafalt.map((m) => m.key));
      return [
        `${Object.keys(SEKTIONER).length} opf-sektioner in i utkasttemat`,
        'produktmallen kopplar in dem efter main (hårdkodad icon-rad rensas)',
        'varje fil verifieras byte för byte efter uppladdning',
        `visas för den här produkten: ${visas.join(', ')}`,
        ...(doljs.length > 0 ? [`döljer sig själva (data saknas): ${doljs.join(', ')}`] : []),
      ];
    },
    async kor() {
      const tema = await hamtaUtkastTema();
      if (!tema) {
        return { manuell: 'Inget utkasttema finns i butiken — installera ett tema först.' };
      }
      await skrivTemafiler(tema.id, SEKTIONER);
      const befintlig = await hamtaTemafil(tema.id, 'templates/product.json');
      if (befintlig) {
        await skrivTemafiler(tema.id, { 'templates/product.json': byggProduktTemplate(befintlig) });
      }
      const avvikande = await verifieraTemafiler(tema.id, SEKTIONER);
      if (avvikande.length > 0) throw new Error(`Temafiler förvanskade: ${avvikande.join('; ')}`);
      return { temaId: tema.id, temaNamn: tema.name, sektioner: Object.keys(SEKTIONER).length };
    },
  },
  {
    // Temats innehåll: startsidan, annonsraden, sidfoten, inställningarna
    // (logga/favicon/A/B/app-inbäddningar), produktmallens A/B-paketblock +
    // Appyta, korg-upsellen (Q4-ramverket) och gallerifiltret för språkmärkta
    // bilder. Allt ur konfigen — bevisat på HeimGuard, kodat 2026-09-08.
    id: 'startsida',
    namn: 'Temats innehåll (startsida, header/footer, inställningar, upsell)',
    torrt: (ctx) => {
      const bilder = temabilder(ctx.butik.butik.id);
      return [
        `templates/index.json: hero → USP → produkt → berättelse → statement → omdömen → trygghet → FAQ → garanti`,
        `logga/favicon/hero/trygghet ur Files: ${Object.values(bilder).join(', ')}`,
        `A/B-test "${ctx.p.offer?.paket?.test ?? '—'}" i settings + paketblock A/B i produktmallen, Judge.me i Appyta`,
        ctx.p.offer?.bonus_produkt?.handle ? `korg-upsell för ${ctx.p.offer.bonus_produkt.handle}` : 'ingen bonusprodukt — ingen korg-upsell',
        'ms-head: gallerifilter [SV]/[NO] + omhämtning av lådan för upsellen',
      ];
    },
    async kor(ctx) {
      const tema = await hamtaUtkastTema();
      if (!tema) return { manuell: 'Inget utkasttema finns i butiken — kör factory/tema-upp.mjs först.' };
      const las = (f) => hamtaTemafil(tema.id, f);
      const filer = {};

      filer['templates/index.json'] = byggIndex(ctx.butik, ctx.p);
      const header = await las('sections/header-group.json');
      if (header) filer['sections/header-group.json'] = byggHeaderGroup(header, ctx.butik, ctx.p);
      const footer = await las('sections/footer-group.json');
      if (footer) filer['sections/footer-group.json'] = byggFooterGroup(footer, ctx.butik);
      // Finns den norska översättningen (oversattning-nb.json) locale-branchas
      // custom_liquid-texterna direkt; annars svenska tills marknader.mjs körts.
      const nbFil = join(FACTORY_ROT, 'output', ctx.p.produkt.id, 'oversattning-nb.json');
      const nb = existsSync(nbFil) ? JSON.parse(readFileSync(nbFil, 'utf8')) : {};
      const produktMall = await las('templates/product.json');
      if (produktMall) filer['templates/product.json'] = patchaProduktTemplate(produktMall, ctx.butik, ctx.p, nb);

      const schema = await las('config/settings_schema.json');
      const nyttSchema = schema ? settingsSchemaMedAb(schema) : null;
      if (nyttSchema) filer['config/settings_schema.json'] = nyttSchema;
      const rasettings = await las('config/settings_data.json');
      if (rasettings) {
        const settings = JSON.parse(String(rasettings).replace(/\/\*[\s\S]*?\*\//, '').trim());
        settings.current = { ...settings.current, ...settingsTillagg(ctx.butik, ctx.p) };
        filer['config/settings_data.json'] = `${JSON.stringify(settings, null, 2)}\n`;
      }

      // Korg-upsell + ms-head-tilläggen (idempotent på markörer).
      let msHead = await las('snippets/ms-head.liquid');
      const bonusHandle = ctx.p.offer?.bonus_produkt?.handle;
      if (bonusHandle) {
        const upsell = byggKorgUpsell(bonusHandle);
        filer['snippets/opf-korg-upsell.liquid'] = upsell['snippets/opf-korg-upsell.liquid'];
        filer['sections/cart-drawer.liquid'] = upsell['sections/cart-drawer.liquid'];
        if (msHead && !msHead.includes('sections=cart-drawer')) msHead = `${msHead}\n${upsell.msHeadTillagg}`;
      }
      if (msHead && !msHead.includes(GALLERIFILTER_MARKE)) msHead = `${msHead}\n${msHeadGallerifilter()}`;
      if (msHead) filer['snippets/ms-head.liquid'] = msHead;

      // Schemat först i eget anrop — settings_data-värden utan schema-fält
      // (ms_ab_tests) städas annars bort av Shopify. JSON-filerna
      // normaliseras av Shopify (bytestorleken ändras), så bytekollen görs
      // bara på Liquid-filerna; JSON:en läses tillbaka och tolkas i stället.
      if (filer['config/settings_schema.json']) {
        await skrivTemafiler(tema.id, { 'config/settings_schema.json': filer['config/settings_schema.json'] });
        delete filer['config/settings_schema.json'];
      }
      await skrivTemafiler(tema.id, filer);
      const liquid = Object.fromEntries(Object.entries(filer).filter(([f]) => f.endsWith('.liquid')));
      const avvikande = await verifieraTemafiler(tema.id, liquid);
      if (avvikande.length > 0) throw new Error(`Temafiler förvanskade: ${avvikande.join('; ')}`);
      const fel = [];
      for (const f of Object.keys(filer).filter((x) => x.endsWith('.json'))) {
        const tillbaka = await hamtaTemafil(tema.id, f);
        try {
          const j = JSON.parse(String(tillbaka).replace(/\/\*[\s\S]*?\*\//, '').trim());
          if (f === 'config/settings_data.json' && ctx.p.offer?.paket?.test && j.current?.ms_ab_tests !== ctx.p.offer.paket.test) {
            fel.push(`${f}: ms_ab_tests blev "${j.current?.ms_ab_tests ?? ''}" — A/B-testet är inte aktivt`);
          }
          if (f === 'templates/index.json' && !Array.isArray(j.order)) fel.push(`${f}: ingen order`);
        } catch (e) {
          fel.push(`${f}: gick inte att tolka efter uppladdning (${e.message})`);
        }
      }
      if (fel.length > 0) throw new Error(fel.join('; '));
      return { temaId: tema.id, filer: Object.keys(filer), abTest: ctx.p.offer?.paket?.test ?? null };
    },
  },
  {
    id: 'sidor',
    namn: 'Sidorna (villkor + kontakt)',
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
    torrt: (ctx) => [
      ...huvudmeny(ctx).map((l) => `huvudmeny: ${l.titel} → ${l.url}`),
      ...ctx.menylankar.map((l) => `sidfot: ${l.titel} → ${l.url}`),
    ],
    async kor(ctx) {
      // Huvudmenyn: Hem / produkten / Kontakt — Shopifys "Catalog"-länk
      // pekar på en samlingssida en enproduktsbutik inte har.
      const huvud = await skrivMeny('main-menu', 'Main menu', huvudmeny(ctx));
      const meny = await skrivMeny('footer', 'Footer menu', ctx.menylankar);
      return { huvudmeny: huvud.handle, handle: meny.handle, orord: meny.orord === true && huvud.orord === true };
    },
  },
  {
    id: 'frakt',
    namn: 'Fraktzonerna',
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
    torrt(ctx) {
      const antal = (ctx.p.reviews ?? []).filter(Boolean).length;
      const kalla = ctx.p.kallor?.drive_mapp
        ? `recensions-CSV ur Drive-mappen ${ctx.p.kallor.drive_mapp}`
        : `${antal} recensioner ur produktfilen (output/${ctx.p.produkt.id}/judgeme-import.csv)`;
      return [kalla, `importeras med tools/judgeme-import.mjs mot butikens Judge.me`];
    },
    async kor(ctx) {
      const tokenEnv = ctx.butik.judgeme?.token_env ?? 'JUDGEME_API_TOKEN';
      const shopDomain = ctx.butik.judgeme?.shop_domain ?? process.env.JUDGEME_SHOP_DOMAIN;
      if (!process.env[tokenEnv] || !shopDomain) {
        return {
          manuell:
            `Judge.me-token saknas (env ${tokenEnv} + judgeme.shop_domain i butiksfilen). ` +
            'Installera Judge.me-appen i butiken, hämta privata API-tokenen och fyll i — kör sen om steget.',
        };
      }

      const mapp = join(FACTORY_ROT, 'output', ctx.p.produkt.id);
      mkdirSync(mapp, { recursive: true });
      let csv = join(mapp, 'judgeme-import.csv');

      // Drive-mappen vinner när den finns: samma CSV som resten av flödet använder.
      const driveMapp = ctx.p.kallor?.drive_mapp;
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
        const inneh = byggJudgeMeCsv(ctx.p);
        if (!inneh) return { manuell: 'Produkten har inga recensioner — inget att importera.' };
        writeFileSync(csv, inneh);
      }

      const arg = [
        join(FACTORY_ROT, '..', 'tools', 'judgeme-import.mjs'),
        csv,
        '--product-handle', ctx.p.produkt.id,
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
];

// ---------------------------------------------------------------------------

// Huvudmenyn för en enproduktsbutik: Hem, produkten (kortnamnet före
// tankstrecket), Kontakt.
function huvudmeny(ctx) {
  const kort = String(ctx.p.produkt.namn).split(/\s[–-]\s/)[0];
  return [
    { titel: 'Hem', url: '/' },
    { titel: kort, url: `/products/${ctx.p.produkt.id}` },
    { titel: 'Kontakt', url: '/pages/contact' },
  ];
}

function lasKonfig(butiksfil, produktfil) {
  // LAUNCH-INPUT läses först och läggs ovanpå råfilerna — sen valideras allt
  // som vanligt, så det Axel fyllt i mäts av exakt samma spärrar.
  const rabutik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const rap = lasYaml(readFileSync(produktfil, 'utf8'));
  const launchInput = lasLaunchInput(join(FACTORY_ROT, 'LAUNCH-INPUT.yaml'));
  if (launchInput) tillampaLaunchInput(rabutik, rap, launchInput.input);

  const { fel: butiksfel, varningar: butiksvarningar } = valideraButik(rabutik);
  if (butiksfel.length > 0) stopp(`${butiksfel.length} kritiska fel i butikskonfigen`, butiksfel);
  const butik = rabutik;

  const p = sammanfoga(butik, rap);
  const { fel, varningar, nyckeltal } = validera(p);
  if (fel.length > 0) stopp(`${fel.length} kritiska fel i produktfilen`, fel);
  const brandvarningar = valideraBranding(butik?.branding);
  return {
    butik,
    p,
    varningar: [...butiksvarningar, ...brandvarningar, ...varningar],
    nyckeltal,
    launchInput,
  };
}

function byggKontext(butik, p) {
  const policyer = byggPolicyer(p);
  return {
    butik,
    p,
    plan: byggPlan(p),
    metafalt: byggMetafalt(p, { kundUnderrubrik }),
    policyer,
    menylankar: [
      ...policyer.map((x) => ({ titel: x.namn, url: `/pages/${x.handle}` })),
      { titel: 'Kontakt', url: '/pages/contact' },
    ],
    produkt: null,
    shop: null,
  };
}

// Empty-state-QA: mallfilerna och den byggda sidan. Ett fel här är en bugg i
// fabriken, inte i produktdatan — därför hårt stopp, aldrig en varning.
function korTemaQa(ctx, forhandsvisning) {
  const fel = [...qaSektionsfiler(SEKTIONER), ...qaRenderadSida(forhandsvisning)];
  if (fel.length > 0) stopp('tema-QA (empty states)', fel);
  const { doljs } = sektionerSomVisas(ctx.metafalt.map((m) => m.key));
  return { doljs };
}

function skrivUtdatafiler(ctx, varningar, qa) {
  const mapp = join(FACTORY_ROT, 'output', ctx.p.produkt.id);
  mkdirSync(mapp, { recursive: true });
  const forhandsvisning = byggForhandsvisning(ctx.p);
  const temaQa = korTemaQa(ctx, forhandsvisning);
  console.log(
    `✅ Tema-QA grön.${temaQa.doljs.length > 0 ? ` Sektioner som döljer sig (data saknas): ${temaQa.doljs.join(', ')}.` : ' Alla sektioner har data.'}`
  );
  writeFileSync(join(mapp, 'forhandsvisning.html'), forhandsvisning);
  writeFileSync(join(mapp, 'plan.json'), `${JSON.stringify({ input: ctx.plan.input, metafalt: ctx.metafalt }, null, 2)}\n`);
  for (const policy of ctx.policyer) {
    writeFileSync(join(mapp, `policy-${policy.type.toLowerCase()}.html`), policy.body);
  }
  // Judge.me-underlaget: importeras med tools/judgeme-import.mjs efter launch.
  const judgeMeCsv = byggJudgeMeCsv(ctx.p);
  if (judgeMeCsv) writeFileSync(join(mapp, 'judgeme-import.csv'), judgeMeCsv);
  // Den översatta delmängden per marknad, när översättningen finns.
  for (const m of ctx.butik?.butik?.marknader ?? []) {
    const fil = join(mapp, `oversattning-${m.locale}.json`);
    if (!m.locale || !existsSync(fil)) continue;
    const csv = byggJudgeMeCsvOversatt(ctx.p, JSON.parse(readFileSync(fil, 'utf8')));
    if (csv) writeFileSync(join(mapp, `judgeme-import-${m.locale}.csv`), csv);
  }
  // VA:ns manuella klick, i rätt ordning — hela hennes att-göra efter bygget.
  writeFileSync(join(mapp, 'CHECKLISTA.md'), byggChecklista(ctx.p, ctx.butik));
  const qaRader = [
    `# QA — ${ctx.p.produkt.namn}`,
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

async function korQa(ctx) {
  const produkt = await hamtaProduktViaHandle(ctx.p.produkt.id);
  return kontrolleraLaunch(ctx.p, {
    shop: ctx.shop,
    produkt,
    policyer: ctx.shop?.shopPolicies ?? null,
  });
}

async function huvudflode({ butiksfil, produktfil, dryRun, resume, launch, igen = new Set() }) {
  const { butik, p, varningar, nyckeltal, launchInput } = lasKonfig(butiksfil, produktfil);
  const ctx = byggKontext(butik, p);
  const lage = dryRun ? 'DRY-RUN' : launch ? 'LAUNCH' : resume ? 'RESUME' : 'BUILD';
  console.log(`\nOPS Factory · ${p.produkt.namn} · butik ${butik.butik.brand} · ${lage}\n`);
  console.log(`✅ Konfig validerad. Break-even-ROAS ${nyckeltal.breakEvenRoas}, marginal ${nyckeltal.marginal} ${p.ekonomi.valuta}.`);
  if (launchInput) {
    console.log(
      `📋 LAUNCH-INPUT: ${launchInput.ifyllt.length} av ${launchInput.ifyllt.length + launchInput.saknas.length} ifyllda.${
        launchInput.saknas.length > 0 ? ` Kvar: ${launchInput.saknas.join(', ')}.` : ' Allt ifyllt.'
      }`
    );
  }

  if (dryRun) {
    for (const steg of STEG) {
      console.log(`\n▫️ ${steg.namn}`);
      for (const rad of steg.torrt(ctx)) console.log(`   ${rad}`);
    }
    const mapp = skrivUtdatafiler(ctx, varningar, null);
    if (varningar.length > 0) {
      console.log(`\n⚠️  ${varningar.length} varningar:`);
      for (const v of varningar) console.log(`   • ${v}`);
    }
    console.log(`\nOutput: ${mapp}`);
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

  const state = lasState(butik.butik.id, p.produkt.id);
  const manuella = [];

  for (const steg of STEG) {
    if (resume && arKlart(state, steg.id) && !igen.has(steg.id)) {
      console.log(`⏭  ${steg.namn} — redan grönt, hoppar över.`);
      continue;
    }
    try {
      const resultat = await steg.kor(ctx);
      if (resultat?.manuell) {
        manuella.push(`${steg.namn}: ${resultat.manuell}`);
        console.log(`🖐 ${steg.namn}: ${resultat.manuell}`);
        // Ett manuellt steg är inte klart — resume ska försöka igen.
      } else {
        markeraKlart(state, steg.id, resultat);
        console.log(`✅ ${steg.namn}`);
      }
    } catch (e) {
      skrivState(state);
      stopp(`steget "${steg.namn}"`, [e.message, 'Rätta felet och kör igen med --resume.']);
    }
    skrivState(state);
  }

  // QA körs alltid färskt — aldrig ur state.
  const qa = await korQa(ctx);
  console.log('\nQA:');
  for (const punkt of qa.punkter) console.log(`${IKON[punkt.utfall]} ${punkt.namn}: ${punkt.detalj}`);
  state.qa = { gron: qa.gron, kritiska: qa.kritiska.map((k) => k.namn), tid: new Date().toISOString() };
  skrivState(state);

  const mapp = skrivUtdatafiler(ctx, varningar, qa);
  console.log(`\nOutput: ${mapp}`);

  if (!launch) {
    console.log(`\nSTATUS: REVIEW — inget är publicerat.${qa.gron ? ' QA är grön.' : ` QA har ${qa.kritiska.length} kritiska punkter.`}`);
    if (manuella.length > 0) {
      console.log('NEEDS ME:');
      for (const m of manuella) console.log(`   • ${m}`);
    }
    console.log('');
    return;
  }

  // --launch: bara när QA är helt grön.
  if (!qa.gron) {
    stopp(`QA har ${qa.kritiska.length} kritiska punkter — LAUNCH vägrar`, qa.kritiska.map((k) => `${k.namn}: ${k.detalj}`));
  }
  const produkt = await hamtaProduktViaHandle(p.produkt.id);
  const resultat = await publiceraProdukt(produkt.id);
  markeraKlart(state, 'launch', { status: resultat.status, publicerad: resultat.publicerad });
  skrivState(state);
  console.log(`\n✅ LIVE: produkten är ${resultat.status}${resultat.publicerad ? ` och publicerad i ${resultat.kanal}` : ''}.`);
  if (!resultat.publicerad) console.log(`🖐 ${resultat.notis ?? 'Publicera produkten i Online Store-kanalen för hand.'}`);
  console.log('\nKvar att göra för hand:');
  for (const m of qa.manuella) console.log(`   • ${m.namn}: ${m.detalj}`);
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
  // --igen <stegid[,stegid]> kör om gröna steg vid --resume (t.ex. startsida
  // när översättningen kommit, tema efter en ny temaklon).
  const igen = new Set(argv.includes('--igen') ? String(argv[argv.indexOf('--igen') + 1] ?? '').split(',').filter(Boolean) : []);
  const positioner = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--butik' && argv[i - 1] !== '--igen');

  laddaEnv();

  let butiksfil;
  let produktfil;
  const forsta = (positioner[0] ?? '').toUpperCase();
  if (forsta === 'BUILD' || forsta === 'LAUNCH') {
    // Gamla formen: BUILD/LAUNCH <produktfil> [--butik <id>]
    produktfil = positioner[1];
    butiksfil = valjButik(argv);
    if (!produktfil) stopp('produktfil saknas', ['Användning: node factory/ops.mjs BUILD <produktfil.yaml>']);
    return huvudflode({ butiksfil, produktfil, dryRun, resume, launch: launch || forsta === 'LAUNCH', igen });
  }

  [butiksfil, produktfil] = positioner;
  if (!butiksfil || !produktfil) {
    console.error('Användning: node factory/ops.mjs <butik.yaml> <produkt.yaml> [--dry-run] [--resume] [--igen steg,steg] [--launch]');
    process.exit(1);
  }
  if (basename(dirname(butiksfil)) !== 'butiker' && basename(dirname(produktfil)) === 'butiker') {
    [butiksfil, produktfil] = [produktfil, butiksfil];
  }
  return huvudflode({ butiksfil, produktfil, dryRun, resume, launch, igen });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => {
    console.error(`\n❌ ${e.message}\n`);
    process.exit(1);
  });
}
