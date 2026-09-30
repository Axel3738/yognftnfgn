// Spoks-paketet: samma innehåll som Klaviyo-motorn bygger (klaviyo/innehall/<brand>)
// översatt till Spoks block, flöden och kampanjer — så att flytten till Spoks
// (Axels order 2026-09-26: "FÖRBERED BARA FÖR MATSTRUMPOR TILL SPOKS") kan göras
// med Spoks MCP-verktyg utan att en enda rad copy skrivs om ur huvudet.
//
//   node klaviyo/spoks-paket.mjs --brand matstrumpor            # live Shopify-priser + cachade recensioner
//   node klaviyo/spoks-paket.mjs --brand matstrumpor --offline  # allt ur cachen (klaviyo/output/<brand>/)
//
// Läser: innehållsfilerna, brandfilen, klaviyo/konto/<brand>/spoks.json (facit:
// arbetsytans id + Spoks produkt-id per handle, avlästa med products_search).
// Skriver: klaviyo/output/<brand>/spoks/ (gitignorerad) — ett JSON per mejl i exakt
// den form draft_campaign/update_draft_campaign tar (title, customizedNotification,
// blocks), floden.json (trigger, filter, steg i millisekunder) och PAKET.json.
//
// Spoks har inte allt Klaviyo har. Det som inte går att flytta rakt av står som
// `anmarkningar` i paketet och i klaviyo/README.md → Spoks:
//   - ingen segment-trigger ⇒ F06 Sunset blir två kampanjutkast som skickas för hand,
//   - ingen händelsevariabel för spårningsnumret ⇒ F04 E1 länkar till spårningssidan
//     utan ?k= (kunden skriver MS-numret ur leveransmejlet),
//   - {{fornamn}} ⇒ {{ contact.first_name | default: '…' }} (Spoks enda filter är default,
//     så "Hej {{fornamn}}," blir "Hej du," när namnet saknas i stället för Klaviyos "Hej,"),
//   - medlemskortets mörka stil sätts i Spoks redigerare (MCP:n kan bara ge blocken).
// Spoks lägger på sin egen klickspårning (r.spoksmail.com) — inga UTM-parametrar här.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROT } from './mallar.mjs';
import { lasInnehall, planeraMejl } from './bygg.mjs';
import { hamtaProdukterCache } from './produkter.mjs';
import { hamtaRecensionerCache } from './recensioner.mjs';

// ---------------------------------------------------------------------------
// Byggstenar
// ---------------------------------------------------------------------------

export const MS = {
  minutes: 60_000, minute: 60_000,
  hours: 3_600_000, hour: 3_600_000,
  days: 86_400_000, day: 86_400_000,
  weeks: 7 * 86_400_000, week: 7 * 86_400_000,
};

export function vantaMs(steg) {
  const f = MS[steg?.enhet];
  if (!f || !Number.isFinite(Number(steg?.varde))) throw new Error(`Okänd väntetid: ${JSON.stringify(steg)}`);
  return Math.round(Number(steg.varde) * f);
}

// ISO 8601-varaktighet för Spoks allowReenrolmentAfter (P7D, P4W, P3M) — dagar
// upp till 365, annars veckor/månader.
export function ateintradeTillSpoks(a) {
  if (!a || a.varaktighet === null || a.varaktighet === undefined || a.enhet === 'alltime') return { reenrollEnabled: false, allowReenrolmentAfter: null };
  const n = Number(a.varaktighet);
  if (!Number.isFinite(n) || n <= 0) throw new Error(`Okänt återinträde: ${JSON.stringify(a)}`);
  const e = String(a.enhet);
  if (/^days?$/.test(e)) return { reenrollEnabled: true, allowReenrolmentAfter: `P${Math.min(n, 365)}D` };
  if (/^weeks?$/.test(e)) return { reenrollEnabled: true, allowReenrolmentAfter: `P${Math.min(n, 52)}W` };
  if (/^months?$/.test(e)) return { reenrollEnabled: true, allowReenrolmentAfter: `P${Math.min(n, 24)}M` };
  throw new Error(`Okänd återinträdesenhet "${e}".`);
}

// De fasta orden motorn själv skriver in (knappar, faktarutan, medlemskortet,
// citatets signatur). Svenska är standard; ett annat språk skickar sin egen
// uppsättning i ctx.ui (klaviyo/innehall/<brand>/sprak/<sprak>.json → ui).
export const UI_SV = {
  hej_reserv: 'Hej',
  du_reserv: 'du',
  medlem_reserv: 'Medlem',
  medlemskort: 'Medlemskort',
  medlem_i: 'Medlem i {klubb}',
  knapp_till: 'Till produkten',
  knapp_kassa: 'Tillbaka till kassan',
  knapp_titta: 'Titta igen',
  knapp_betyg: 'Ge ditt betyg',
  ms_rad: 'Paketnumret som börjar på MS står i mejlet om att paketet skickats.',
  fakta_retur_rubrik: 'Ångerrätt',
  fakta_retur_text: null,
  fakta_sparning_rubrik: 'Spåra paketet',
  fakta_sparning_text: 'Följ det hela vägen',
  grundare: 'grundare',
  verifierad: 'verifierad kund',
  verifierad_ensam: 'Verifierad kund',
  oversatt: null,
  klubb: null,
};

// {{fornamn}} → Spoks personaliseringstoken. Bara filtret default finns i Spoks,
// så reservordet väljs efter var namnet står: efter "Hej" blir det "du", först
// i en mening (följt av kommatecken) blir det "Hej".
export function fornamnTillSpoks(text, ui = UI_SV) {
  const q = (s) => String(s).replace(/'/g, '’');
  return String(text ?? '')
    .replace(/(^|\n)\{\{fornamn\}\}, /g, `$1{{ contact.first_name | default: '${q(ui.hej_reserv)}' }}, `)
    .replace(/\{\{fornamn\}\}/g, `{{ contact.first_name | default: '${q(ui.du_reserv)}' }}`);
}

const stycken = (text) =>
  String(text ?? '')
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

function handleUr(spec) {
  const m = /^produkt:(.+)$/.exec(String(spec ?? '').trim());
  return m ? m[1] : null;
}

// Länkspråket i innehållsfilerna → riktig adress (samma regler som mallar.mjs lank,
// utan Klaviyos mallspråk). "sparning:" = spårningssidan utan ?k= — Spoks har ingen
// token för spårningsnumret.
export function lankTillSpoks(spec, ctx) {
  const s = String(spec ?? '').trim();
  // ctx.bas = butikens adress på mejlets språk (https://matstrumpor.se/de); saknas
  // den är det huvudspråket.
  const bas = (ctx.bas ?? ctx.brand.butik_url).replace(/\/$/, '');
  const [typ, ...rest] = s.split(':');
  const varde = rest.join(':');
  if (typ === 'produkt') return (ctx.bas ? null : ctx.produkt(varde)?.url) ?? `${bas}/products/${varde}`;
  if (typ === 'kollektion') return `${bas}/collections/${varde}`;
  if (typ === 'sparning') {
    ctx.anmarkningar.add('Spårningslänken går till spårningssidan utan paketnummer (Spoks saknar en token för spårningsnumret) — mejlet får en rad om att MS-numret står i leveransmejlet.');
    ctx.sparningUtanNummer = true;
    const sida = varde || '/pages/spara';
    return `${bas}${sida.startsWith('/') ? '' : '/'}${sida}`;
  }
  if (typ === 'sida') return `${bas}${varde.startsWith('/') ? '' : '/'}${varde}`;
  if (typ === 'url' && /^https:\/\//.test(varde)) return varde;
  if (/^https:\/\//.test(s)) return s;
  ctx.varningar.push(`Okänd länk "${s}", knappen pekar på butikens startsida.`);
  return bas;
}

const SYNLIGT = (knapp) => ({
  isImageVisible: true,
  isTitleVisible: true,
  isPriceVisible: true,
  isButtonVisible: Boolean(knapp),
  isDescriptionVisible: false,
  isOriginalPriceVisible: true,
});

function spoksProdukt(handle, ctx) {
  const f = ctx.facit.produkter?.[handle];
  if (!f?.id) {
    ctx.fel.push(`Produkten "${handle}" saknar Spoks-id i facit (klaviyo/konto/${ctx.brand.id}/spoks.json → produkter) — läs av med products_search.`);
    return null;
  }
  return f;
}

// Ett produktkort på ett annat språk än katalogens: Spoks produktblock visar
// katalogens svenska titel och pris i kronor, så kortet blir bild + titeln på
// mejlets språk + knapp till produktsidan på samma språk (inget pris — butiken
// visar det i kundens valuta).
function bildkort(handle, ctx, knapp) {
  const p = spoksProdukt(handle, ctx);
  if (!p) return [];
  const url = lankTillSpoks(`produkt:${handle}`, ctx);
  const titel = ctx.titel?.(handle);
  if (!titel) ctx.fel.push(`Produkten "${handle}" saknar titel på ${ctx.sprak} (butikens översättning).`);
  const ut = [];
  if (p.bild_id) ut.push({ type: 'image', fileId: p.bild_id, altText: titel ?? handle, urlRedirect: url });
  else ctx.fel.push(`Produkten "${handle}" saknar bild_id i facit — bildkortet kan inte ritas.`);
  ut.push({ type: 'h2', text: titel ?? handle, alignment: 'center' });
  ut.push(knappBlock(knapp ?? ctx.ui.knapp_till, url));
  return ut;
}

function produktBlock(handles, ctx, { knapp = null, perRad = null } = {}) {
  if (ctx.produktkort === 'bild') {
    const kort = handles.map((h) => bildkort(h, ctx, knapp)).filter((k) => k.length);
    if (!kort.length) return [];
    if (kort.length === 1) return kort[0];
    const ut = [];
    for (let i = 0; i < kort.length; i += 4) {
      const rad = kort.slice(i, i + 4);
      if (rad.length === 1) ut.push(...rad[0]);
      else ut.push({ type: 'columns', columns: rad.map((blocks) => ({ flex: 1, blocks })), stackedOnMobile: true, verticalAlignment: 'top' });
    }
    return ut;
  }
  const lista = handles.map((h) => spoksProdukt(h, ctx)).filter(Boolean);
  if (!lista.length) return [];
  return [{
    type: 'products',
    selectionMode: 'manual',
    products: lista.map((p) => ({ id: p.id, button: knapp ?? ctx.ui.knapp_till })),
    dynamicProductsCount: null,
    dynamicCriteria: null,
    productVisibilitySettings: SYNLIGT(knapp),
    buttonText: knapp,
    alignment: 'center',
    productsPerRow: perRad ?? Math.max(1, Math.min(lista.length, 4)),
  }];
}

const text = (t, { typ = 'regular', align = 'left', ui = UI_SV } = {}) => ({ type: typ, text: fornamnTillSpoks(t, ui), alignment: align });
const styckeBlock = (t, align = 'left', ui = UI_SV) => stycken(t).map((s) => text(s, { align, ui }));
const knappBlock = (t, url) => ({ type: 'link', text: String(t), url, style: 'button' });

// ---------------------------------------------------------------------------
// Blocken (samma typer som mallar.mjs BLOCK)
// ---------------------------------------------------------------------------

const BLOCK = {
  hero(b, ctx) {
    const { ui } = ctx;
    const ut = [];
    const h = handleUr(b.bild);
    if (h) {
      const p = spoksProdukt(h, ctx);
      // Produktbilden som ren bild när Spoks mediebibliotek bär den, annars ett
      // produktkort utan knapp (bilden, namnet och priset hydreras av Spoks).
      if (p?.bild_id) ut.push({ type: 'image', fileId: p.bild_id, altText: (ctx.titel?.(h) ?? ctx.produkt(h)?.titel) ?? h, urlRedirect: lankTillSpoks(`produkt:${h}`, ctx) });
      else if (p) ut.push(...produktBlock([h], ctx, { perRad: 1 }));
    } else if (b.bild) {
      ctx.varningar.push(`Hero-bilden "${b.bild}" är ingen produkt — ladda upp den med upload_media och lägg in bildblocket i redigeraren.`);
    }
    if (b.rubrik) ut.push(text(b.rubrik, { typ: 'h1', align: 'center', ui }));
    if (b.text) ut.push(...styckeBlock(b.text, 'center', ui));
    if (b.knapp?.text) ut.push(knappBlock(b.knapp.text, lankTillSpoks(b.knapp.lank, ctx)));
    return ut;
  },
  text(b, ctx) {
    const { ui } = ctx;
    return [...(b.rubrik ? [text(b.rubrik, { typ: 'h2', ui })] : []), ...styckeBlock(b.text, 'left', ui)];
  },
  punkter(b, ctx) {
    const { ui } = ctx;
    return [...(b.rubrik ? [text(b.rubrik, { typ: 'h2', ui })] : []), ...(b.punkter ?? []).filter(Boolean).map((p) => text(p, { typ: 'list', ui }))];
  },
  produkt(b, ctx) {
    const ut = [];
    if (b.text) ut.push(...styckeBlock(b.text, 'left', ctx.ui));
    ut.push(...produktBlock([b.handle], ctx, { knapp: b.knapp ?? ctx.ui.knapp_till, perRad: 1 }));
    return ut;
  },
  produktrad(b, ctx) {
    const pb = produktBlock(b.handles ?? [], ctx);
    if (!pb.length) return [];
    return [...(b.rubrik ? [text(b.rubrik, { typ: 'h2', align: 'center', ui: ctx.ui })] : []), ...pb];
  },
  citat(b, ctx) {
    const antal = Math.min(Number(b.antal ?? 2) || 2, 2);
    // Ett annat språk än recensionernas: bara recensioner med en granskad
    // översättning (ctx.citat), och signaturen säger att den är översatt.
    const alla = ctx.recensioner?.[b.handle] ?? [];
    const lista = (ctx.citatText ? alla.filter((r) => ctx.citatText(r)) : alla).slice(0, antal);
    if (!lista.length) {
      if (ctx.citatText) ctx.fel.push(`Citatblocket för "${b.handle}" har ingen översatt recension på ${ctx.sprak} — översätt dem i sprak/${ctx.sprak}.json → citat.`);
      else ctx.varningar.push(`Inga riktiga recensioner (4-5 stjärnor) för "${b.handle}", citatblocket utgår.`);
      return [];
    }
    return lista.map((r) => ({
      type: 'quote',
      text: `${'★'.repeat(Math.max(1, Math.min(5, Math.round(r.betyg))))} "${ctx.citatText ? ctx.citatText(r) : r.text}"\n${signatur(r, ctx.ui)}`,
      alignment: 'left',
    }));
  },
  knapp(b, ctx) {
    if (!b.text) return [];
    const ut = [knappBlock(b.text, lankTillSpoks(b.lank, ctx))];
    // Klaviyo-knappen bar kundens eget paketnummer (?k=). Utan det måste kunden
    // skriva numret själv — säg var det står, annars lovar mejlet mer än sidan ger.
    if (ctx.sparningUtanNummer) {
      ut.push(text(ctx.ui.ms_rad, { ui: ctx.ui }));
      ctx.sparningUtanNummer = false;
    }
    return ut;
  },
  // Medlemskortet: etikett, förnamn (eller "Medlem"), raden under, fotnot — i en
  // sektion så det mörka kortet kan stylas som ett block i Spoks redigerare.
  medlemskort(b, ctx) {
    const { ui } = ctx;
    const klubb = ui.klubb ?? ctx.brand.klubb?.namn ?? ctx.brand.namn;
    const q = (s) => String(s).replace(/'/g, '’');
    ctx.anmarkningar.add('Medlemskortet är en sektion med text — det mörka kortet (svart botten, orange ram) sätts på sektionen i Spoks redigerare.');
    return [{
      type: 'section',
      blocks: [
        text(String(b.etikett ?? ui.medlemskort).toUpperCase(), { align: 'center', ui }),
        { type: 'h2', text: `{{ contact.first_name | default: '${q(ui.medlem_reserv)}' }}`, alignment: 'center' },
        text(b.rad_under_namnet ?? ui.medlem_i.replace('{klubb}', klubb), { align: 'center', ui }),
        { type: 'divider' },
        text(b.fotnot ?? klubb, { align: 'center', ui }),
      ],
    }];
  },
  grundare(b, ctx) {
    const namn = ctx.stil?.grundare ?? 'Axel';
    return [{ type: 'quote', text: `${fornamnTillSpoks(b.text, ctx.ui)}\n${namn}, ${ctx.ui.grundare}`, alignment: 'left' }];
  },
  fakta(b, ctx) {
    const { brand, ui } = ctx;
    const retur = ui.fakta_retur_text ?? brand.angerratt_text;
    const sparning = ctx.sparningssida ?? brand.sparningssida;
    const kolumner = [];
    if (retur) kolumner.push({ flex: 1, blocks: [text(`**${ui.fakta_retur_rubrik}**`, { align: 'center', ui }), text(retur, { align: 'center', ui })] });
    if (sparning) kolumner.push({ flex: 1, blocks: [text(`**${ui.fakta_sparning_rubrik}**`, { align: 'center', ui }), text(`[${ui.fakta_sparning_text}](${sparning})`, { align: 'center', ui })] });
    if (kolumner.length < 2) return kolumner.flatMap((k) => k.blocks);
    return [{ type: 'columns', columns: kolumner, stackedOnMobile: true, verticalAlignment: 'top' }];
  },
  dynamisk(b, ctx) {
    // Priset kommer ur Spoks katalog (kronor) — dolt på ett annat språk än
    // katalogens, där butiken visar det i kundens egen valuta.
    const medPris = ctx.produktkort !== 'bild';
    if (b.kalla === 'checkout_rader') {
      // Bara giltigt i ett flöde som triggas av checkout_created/abandoned_cart —
      // Spoks fyller i kundens egen kassa och länken tillbaka.
      ctx.kravTrigger = 'checkout_created';
      return [{ type: 'abandonedCart', buttonText: ctx.ui.knapp_kassa, isButtonVisible: true, isProductPriceVisible: medPris, isProductQuantityVisible: true, isProductTitleVisible: true }];
    }
    if (b.kalla === 'visad_produkt') {
      ctx.kravFlode = true;
      return [{
        type: 'products',
        selectionMode: 'dynamic',
        dynamicCriteria: 'recently_viewed',
        dynamicProductsCount: 1,
        productVisibilitySettings: { ...SYNLIGT(ctx.ui.knapp_titta), isPriceVisible: medPris, isOriginalPriceVisible: medPris },
        buttonText: ctx.ui.knapp_titta,
        alignment: 'center',
        productsPerRow: 1,
      }];
    }
    ctx.varningar.push(`Dynamiska blocket "${b.kalla}" har ingen motsvarighet i Spoks, blocket utgår.`);
    return [];
  },
  stjarnor(b, ctx) {
    ctx.varningar.push('Stjärnblocket byts mot en knapp till samma adress (Spoks har inga klickbara stjärnor).');
    return [knappBlock(b.rubrik ?? ctx.ui.knapp_betyg, lankTillSpoks(b.lank, ctx))];
  },
  erbjudande(b, ctx) {
    ctx.varningar.push('Erbjudandeblocket (lyckohjulet) är Bäverbutikens och byggs inte i Spoks-paketet.');
    return [];
  },
};

// Citatets signatur: namnet (om det finns) och "verifierad kund" på mejlets
// språk, och "översatt från svenska" när texten är översatt.
function signatur(r, ui) {
  const namn = String(r?.namn ?? '').trim();
  const bas = namn && !/^(anonym|verifierad kund)/i.test(namn) ? `${namn}, ${ui.verifierad}` : ui.verifierad_ensam;
  return ui.oversatt ? `${bas} · ${ui.oversatt}` : bas;
}

export function blockTillSpoks(mejl, ctx) {
  // Utan språk är det huvudspråket (samma objekt, så anroparens varningar och fel syns).
  if (!ctx.ui) ctx.ui = UI_SV;
  if (!ctx.fel) ctx.fel = [];
  const ut = [];
  for (const b of mejl.block ?? []) {
    const f = BLOCK[b.typ];
    if (!f) {
      ctx.varningar.push(`Okänd blocktyp "${b.typ}", blocket utgår.`);
      continue;
    }
    ut.push(...f(b, ctx));
  }
  return ut;
}

// Ett mejl → postData åt draft_campaign / update_draft_campaign.
export function mejlTillSpoks(mejl, ctx, { titel }) {
  const c = { ...ctx, ui: { ...UI_SV, ...(ctx.ui ?? {}) }, varningar: [], anmarkningar: new Set(), fel: [], kravTrigger: null, kravFlode: false };
  const ui = c.ui;
  const blocks = blockTillSpoks(mejl, c);
  const amne = mejl.amnesrader?.[0]?.text ?? mejl.namn ?? mejl.id;
  const post = {
    title: titel,
    deliveryChannel: 'email',
    channel: 'tag',
    customizedNotification: { emailTitle: fornamnTillSpoks(amne, ui), emailDescription: fornamnTillSpoks(mejl.forhandstext ?? '', ui) },
    blocks,
  };
  const kvar = JSON.stringify(post).match(/\{\{fornamn\}\}|\{%/g);
  if (kvar) c.fel.push(`Klaviyo-mallspråk kvar i mejlet: ${[...new Set(kvar)].join(', ')}`);
  if (!blocks.length) c.fel.push('Mejlet fick inga block.');
  return { post, varningar: [...new Set(c.varningar)], anmarkningar: [...c.anmarkningar], fel: c.fel, kravTrigger: c.kravTrigger, kravFlode: c.kravFlode };
}

// ---------------------------------------------------------------------------
// Flöden: trigger, filter, steg
// ---------------------------------------------------------------------------

const SAMTYCKE = () => ({ type: 'filter', field: 'emailMarketingConsent', operator: 'in', value: ['subscribed'] });
const EJ_SPARRAD = () => ({ type: 'filter', field: 'state', operator: 'ne', value: 'suppressed' });
// Kundundantaget (MFL 19 § andra stycket, Axels beslut B 2026-09-25): köpare som
// inte tackat nej. not_subscribed = aldrig tillfrågad, aldrig avregistrerad.
const KUNDUNDANTAG = () => ({ type: 'filter', field: 'emailMarketingConsent', operator: 'in', value: ['subscribed', 'not_subscribed'] });
// "Inget köp sedan flödet startade": inget köp alls, eller senaste köpet före starten.
const sedanStart = (falt) => ({
  type: 'conjunction',
  operator: 'or',
  isGrouped: true,
  filters: [
    { type: 'filter', field: falt, operator: 'nis' },
    { type: 'filter', field: falt, operator: 'lt', value: '__flow_triggered__' },
  ],
});
const och = (...filters) => (filters.length === 1 ? filters[0] : { type: 'conjunction', operator: 'and', isGrouped: true, filters });

export const TRIGGER = {
  'Email List': 'contact_created',
  'Checkout Started': 'checkout_created',
  'Viewed Product': 'product_viewed',
  'Placed Order': 'order_created',
  // Spoks saknar en "skickad"-trigger; ordern läggs och skickas samma dygn hos
  // Matstrumpor (median 0,4 dygn, brandfilen), så order_created + samma väntetid.
  'Fulfilled Order': 'order_created',
};

export function triggerTillSpoks(t, ctx) {
  if (!t) throw new Error('Flödet saknar trigger.');
  if (t.typ === 'lista') return { event: TRIGGER['Email List'], anmarkning: `Klaviyos lista "${t.lista}" ⇒ contact_created med samtycke som villkor.` };
  if (t.typ === 'segment') return { event: null, anmarkning: `Klaviyo triggar på segmentet ${t.segment}; Spoks har ingen segment-trigger ⇒ mejlen blir kampanjutkast som skickas för hand till motsvarande segment.` };
  if (t.typ === 'metrik') {
    const namn = [].concat(t.metrik)[0];
    const event = TRIGGER[namn];
    if (!event) throw new Error(`Metriken "${namn}" har ingen Spoks-trigger.`);
    const ut = { event, anmarkning: namn === 'Fulfilled Order' ? 'Fulfilled Order ⇒ order_created (Spoks har ingen skickad-trigger; ordern skickas samma dygn).' : null };
    if (t.produkt_innehaller) {
      const ids = [].concat(t.produkt_innehaller).map((ord) => {
        const p = (ctx.produktlista ?? []).find((x) => String(x.titel ?? '').toLowerCase().includes(String(ord).toLowerCase()));
        const f = p ? ctx.facit.produkter?.[p.handle] : null;
        if (!f?.externalId) throw new Error(`produkt_innehaller "${ord}" matchar ingen produkt med externalId i facit.`);
        return f.externalId;
      });
      ut.triggerFilter = { type: 'filter', field: 'externalId', operator: 'in', value: ids };
    }
    return ut;
  }
  throw new Error(`Okänd triggertyp "${t.typ}".`);
}

// Flödets filternycklar → trigger-filter (vem får gå in) + stegfilter (vem får
// mejlet när steget nås).
export function filterTillSpoks(nycklar = []) {
  const trigger = [];
  const steg = [];
  for (const n of nycklar) {
    if (n === 'samtycke') trigger.push(SAMTYCKE(), EJ_SPARRAD());
    else if (n === 'kundundantag') trigger.push(KUNDUNDANTAG(), EJ_SPARRAD());
    else if (n === 'ej_kopt_sedan_start') steg.push(sedanStart('lastPurchase'));
    else if (n === 'ej_checkout_sedan_start') steg.push(sedanStart('lastCheckout'));
    else if (n === 'kopt_minst_en_gang') trigger.push({ type: 'filter', field: 'totalOrders', operator: 'ge', value: '1' });
    else if (/^ej_i_flodet_\d+d$/.test(n)) { /* Spoks: allowReenrolmentAfter gör samma jobb */ }
    else throw new Error(`Okänd filternyckel "${n}".`);
  }
  return { trigger: trigger.length ? och(...trigger) : null, steg: steg.length ? och(...steg) : null };
}

// Visningsnamnet i Spoks: "F01 Välkomst · FLOW_lista_valkomst_v3" — numret först
// (samma som README-tabellen), Klaviyo-namnet sist så det går att spåra tillbaka.
export const FLODESNAMN = {
  'f01-valkomst': 'F01 Välkomst (Matstrumpor-klubben)',
  'f02-overgiven-kassa': 'F02 Övergiven kassa',
  'f03-webbhistorik': 'F03 Webbhistorik',
  'f04-efter-kop': 'F04 Efter köp',
  'f05-vinback': 'F05 Vinna tillbaka',
  'f06-sunset': 'F06 Sunset',
  'f07-aterkop-sushi': 'F07 En låda till (sushi, dag 21)',
};

export function flodesnamn(flode) {
  const kort = FLODESNAMN[flode.id] ?? `${flode.id.replace(/^(f\d\d)-.*$/, '$1').toUpperCase()} ${flode.id.replace(/^f\d\d-/, '').replace(/-/g, ' ')}`;
  return flode.spoks_namn ?? `${kort} · ${flode.namn ?? flode.id}`.slice(0, 120);
}

export function flodeTillSpoks(flode, ctx, mejlPerId) {
  const anmarkningar = [];
  const tr = triggerTillSpoks(flode.trigger, ctx);
  if (tr.anmarkning) anmarkningar.push(tr.anmarkning);
  const filt = filterTillSpoks(flode.filter ?? []);
  const ater = ateintradeTillSpoks(flode.ateintrade);
  const namn = flodesnamn(flode);
  if (!tr.event) {
    // Segment-trigger: mejlen blir kampanjutkast.
    const kampanjer = (flode.steg ?? []).filter((s) => s.typ === 'mejl').map((s) => s.mejl.id);
    return { id: flode.id, namn, kampanjerIstallet: kampanjer, segment: flode.trigger.segment, anmarkningar };
  }
  const steg = [];
  let vantar = null;
  let n = 0;
  for (const s of flode.steg ?? []) {
    if (s.typ === 'vanta') { vantar = (vantar ?? 0) + vantaMs(s); continue; }
    if (s.typ !== 'mejl') throw new Error(`Flödet ${flode.id}: okänd stegtyp "${s.typ}".`);
    n += 1;
    // Ett sändsteg måste alltid ha ett väntesteg framför sig i Spoks (0 ms duger).
    steg.push({ typ: 'delay', delay: vantar ?? 0 });
    vantar = null;
    const m = mejlPerId.get(s.mejl.id);
    if (m?.kravTrigger && m.kravTrigger !== tr.event) anmarkningar.push(`${s.mejl.id} bär ett kassablock som bara fungerar med triggern ${m.kravTrigger} — flödet har ${tr.event}.`);
    steg.push({ typ: 'send', mejl_id: s.mejl.id, nr: n, filter: filt.steg });
  }
  return {
    id: flode.id,
    namn,
    create: {
      name: namn,
      trigger: { event: tr.event, ...(filt.trigger ? { filter: filt.trigger } : {}), ...(tr.triggerFilter ? { triggerFilter: tr.triggerFilter } : {}) },
      reenrollEnabled: ater.reenrollEnabled,
      allowReenrolmentAfter: ater.allowReenrolmentAfter,
    },
    steg,
    anmarkningar,
  };
}

// ---------------------------------------------------------------------------
// Segmenten (motsvarigheterna till klaviyo/segment.mjs, i Spoks filterspråk)
// ---------------------------------------------------------------------------

const handelse = (field, operator, value, dagar = null) => ({
  type: 'eventFilter',
  field,
  operator,
  value: String(value),
  ...(dagar ? { timeFilter: { type: 'filter', field, operator: 'ge', value: `P${dagar}D` } } : {}),
});
// Spoks vägrar en konjunktion med bara EN nod ("must contain at least 2 nodes",
// mätt 2026-09-26 när kategorisegmenten skapades) — ett ensamt villkor skickas bart.
const eller = (...filters) => (filters.length === 1 ? filters[0] : { type: 'conjunction', operator: 'or', isGrouped: true, filters });
const aktiv = (dagar) => eller(handelse('openedEmail', 'ge', 1, dagar), handelse('clickedEmail', 'ge', 1, dagar), handelse('viewedProducts', 'ge', 1, dagar), handelse('orderedProducts', 'ge', 1, dagar));

export function segmentTillSpoks(brand) {
  const bas = () => [SAMTYCKE(), EJ_SPARRAD()];
  const lista = [
    { namn: 'SEG_samtycke', beskrivning: 'Alla med e-postsamtycke (subscribed) som inte är spärrade. Kampanjernas grundpublik.', filter: och(...bas()) },
    { namn: 'SEG_uppvarmning_steg1', beskrivning: 'Samtycke + aktiv senaste 30 dagarna (öppnat, klickat, tittat på en produkt eller köpt). Första kampanjerna går hit.', filter: och(...bas(), aktiv(30)) },
    { namn: 'SEG_engagerade_60d', beskrivning: 'Samtycke + aktiv senaste 60 dagarna.', filter: och(...bas(), aktiv(60)) },
    { namn: 'SEG_engagerade_90d', beskrivning: 'Samtycke + aktiv senaste 90 dagarna.', filter: och(...bas(), aktiv(90)) },
    { namn: 'SEG_kopare', beskrivning: 'Samtycke + minst ett köp.', filter: och(...bas(), { type: 'filter', field: 'totalOrders', operator: 'ge', value: '1' }) },
    { namn: 'SEG_kopare_30d', beskrivning: 'Samtycke + köpt senaste 30 dagarna.', filter: och(...bas(), handelse('orderedProducts', 'ge', 1, 30)) },
    { namn: 'SEG_ej_kopt', beskrivning: 'Samtycke + aldrig köpt.', filter: och(...bas(), { type: 'filter', field: 'totalOrders', operator: 'eq', value: '0' }) },
    { namn: 'SEG_flerkopare', beskrivning: 'Samtycke + minst två köp.', filter: och(...bas(), { type: 'filter', field: 'totalOrders', operator: 'ge', value: '2' }) },
    { namn: 'SEG_vinback_90d', beskrivning: 'Samtycke + har köpt, men inget köp senaste 90 dagarna.', filter: och(...bas(), { type: 'filter', field: 'totalOrders', operator: 'ge', value: '1' }, handelse('orderedProducts', 'eq', 0, 90)) },
    { namn: 'SEG_oengagerade_180d', beskrivning: 'Bara exkludering och sunset, aldrig en kampanjpublik: minst fem mottagna mejl, inget öppnat eller klickat på 180 dagar. Tom tills Spoks har egen mejlhistorik.', kampanjOk: false, filter: och(...bas(), handelse('receivedEmail', 'ge', 5), handelse('openedEmail', 'eq', 0, 180), handelse('clickedEmail', 'eq', 0, 180)) },
  ];
  for (const [kat, ord] of Object.entries(brand.kategorier ?? {})) {
    lista.push({
      namn: `SEG_kategori_${kat}`,
      beskrivning: `Samtycke + köpt en produkt vars namn innehåller ${ord.map((o) => `"${o}"`).join(' eller ')}.`,
      filter: och(...bas(), eller(...ord.map((o) => ({ type: 'eventFilter', field: 'orderedProducts', operator: 'ge', value: '1', conditionFilter: { type: 'filter', field: 'productTitle', operator: 'like', value: o } })))),
    });
  }
  return lista;
}

// ---------------------------------------------------------------------------
// Paketet
// ---------------------------------------------------------------------------

const KORT = (id) => id.replace(/^k(\d\d)-.*$/, 'K$1');
const kortDatum = (iso, tidszon) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '?';
  const p = Object.fromEntries(new Intl.DateTimeFormat('sv-SE', { timeZone: tidszon, day: 'numeric', month: 'numeric' }).formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.day}/${p.month}`;
};

export async function paket({ brandId = 'matstrumpor', rot = ROT, offline = false, innehallDir = null, utDir = null, produkter = null, recensioner = null, facit = null, logg = () => {} } = {}) {
  const brand = JSON.parse(readFileSync(join(rot, 'klaviyo', 'brands', `${brandId}.json`), 'utf8'));
  const facitFil = join(rot, 'klaviyo', 'konto', brandId, 'spoks.json');
  const fac = facit ?? (existsSync(facitFil) ? JSON.parse(readFileSync(facitFil, 'utf8')) : null);
  if (!fac?.arbetsyta?.id) throw new Error(`Facit saknas: ${facitFil} (arbetsytans id + produkt-id:n ur Spoks products_search).`);
  const inDir = innehallDir ?? join(rot, 'klaviyo', 'innehall', brandId);
  const ut = utDir ?? join(rot, 'klaviyo', 'output', brandId, 'spoks');
  mkdirSync(ut, { recursive: true });

  const varningarTopp = [];
  const innehall = lasInnehall(inDir);
  const fel = [...innehall.fel];
  let lista = produkter;
  if (!lista) {
    const r = await hamtaProdukterCache({ brand, offline, rot });
    lista = r.produkter;
    varningarTopp.push(...r.varningar);
  }
  let rec = recensioner;
  if (!rec) {
    const r = await hamtaRecensionerCache({ brand, produkter: lista, offline, rot });
    rec = r.recensioner;
    varningarTopp.push(...r.varningar);
  }
  const perHandle = new Map(lista.map((p) => [p.handle, p]));
  const ctx = { brand, facit: fac, produkt: (h) => perHandle.get(h) ?? null, produktlista: lista, recensioner: rec, stil: null };

  const plan = planeraMejl(innehall);
  const mejlUt = new Map();
  for (const p of plan) {
    const m = p.mejl;
    let titel;
    if (p.kampanj) {
      titel = `${KORT(p.kampanj.id)} · ${kortDatum(p.kampanj.planerad, brand.tidszon)} · ${(p.kampanj.segment ?? []).join('+').replace(/^SEG_/, '')} · ${m.amnesrader?.[0]?.text ?? m.id}`;
    } else {
      const fnr = p.flode.id.replace(/^(f\d\d)-.*$/, '$1').toUpperCase();
      const enr = m.id.replace(/^.*-e(\d+)$/, 'E$1');
      // Ett segment-triggat flöde blir kampanjutkast — säg det i titeln, så
      // ingen letar efter flödet i Spoks.
      const manuellt = p.flode.trigger?.typ === 'segment' ? ` · för hand till ${String(p.flode.trigger.segment).replace(/^SEG_/, '')}` : '';
      titel = `${fnr} ${enr}${manuellt} · ${m.amnesrader?.[0]?.text ?? m.id}`;
    }
    const r = mejlTillSpoks(m, ctx, { titel });
    mejlUt.set(m.id, { id: m.id, kalla: p.kalla, flode_id: p.flode?.id ?? null, kampanj_id: p.kampanj?.id ?? null, ...r });
    writeFileSync(join(ut, `${m.id}.json`), JSON.stringify(r.post, null, 2) + '\n');
    fel.push(...r.fel.map((f) => `${m.id}: ${f}`));
    logg(`${r.fel.length ? '❌' : '✅'} ${m.id}: ${r.post.blocks.length} block${r.varningar.length ? `, ${r.varningar.length} varningar` : ''}`);
  }

  const floden = [];
  const kampanjerIstallet = [];
  for (const f of innehall.floden) {
    try {
      const r = flodeTillSpoks(f, ctx, mejlUt);
      floden.push(r);
      if (r.kampanjerIstallet) kampanjerIstallet.push(...r.kampanjerIstallet.map((id) => ({ mejl_id: id, flode_id: f.id, segment: r.segment })));
    } catch (e) {
      fel.push(`${f.id}: ${e.message}`);
    }
  }
  const kampanjer = innehall.kampanjer.map((k) => ({
    id: k.id,
    kort: KORT(k.id),
    mejl_id: k.id,
    namn: k.namn ?? k.id,
    planerad: k.planerad ?? null,
    segment: k.segment ?? [],
    exkludera: k.exkludera ?? [],
    status_plan: k.status_plan ?? null,
    kraver_axel: k.kraver_axel ?? null,
  }));
  const anmarkningar = [...new Set([...mejlUt.values()].flatMap((m) => m.anmarkningar).concat(floden.flatMap((f) => f.anmarkningar)))];
  const manifest = {
    brand: brand.id,
    arbetsyta: fac.arbetsyta,
    byggd: new Date().toISOString(),
    mejl: [...mejlUt.values()].map(({ post, ...rest }) => ({ ...rest, fil: `${rest.id}.json`, block: post.blocks.length, amne: post.customizedNotification.emailTitle })),
    kampanjer,
    floden,
    kampanjerIstallet,
    segment: segmentTillSpoks(brand),
    anmarkningar,
    varningar: [...new Set([...varningarTopp, ...[...mejlUt.values()].flatMap((m) => m.varningar.map((v) => `${m.id}: ${v}`))])],
    fel,
  };
  writeFileSync(join(ut, 'PAKET.json'), JSON.stringify(manifest, null, 2) + '\n');
  writeFileSync(join(ut, 'floden.json'), JSON.stringify(floden, null, 2) + '\n');
  return { manifest, mejl: mejlUt, utDir: ut };
}

function arg(namn) {
  const i = process.argv.indexOf(namn);
  return i >= 0 ? process.argv[i + 1] : null;
}

async function main() {
  const offline = process.argv.includes('--offline');
  if (!offline) {
    const { kravProxy } = await import('../mejl/shopify.mjs');
    kravProxy();
  }
  const r = await paket({ brandId: arg('--brand') ?? 'matstrumpor', offline, logg: (t) => console.log(t) });
  const m = r.manifest;
  console.log(`\n${m.mejl.length} mejl, ${m.kampanjer.length} kampanjer, ${m.floden.length} flöden (${m.kampanjerIstallet.length} flödesmejl blir kampanjer), ${m.segment.length} segment → ${r.utDir}`);
  if (m.anmarkningar.length) console.log(`\nAnmärkningar (det Spoks inte gör som Klaviyo):\n${m.anmarkningar.map((a) => `  • ${a}`).join('\n')}`);
  if (m.varningar.length) console.log(`\n${m.varningar.length} varningar:\n${m.varningar.map((v) => `  ⚠️  ${v}`).join('\n')}`);
  if (m.fel.length) {
    console.error(`\n❌ ${m.fel.length} fel:\n${m.fel.map((f) => `  ${f}`).join('\n')}`);
    process.exit(1);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}
