// Innehållet (klaviyo/innehall/<brand>/) → Spoks-block, plan och kontroll.
//
//   node klaviyo/spoks/konvertera.mjs [--brand baverbutiken] [--kolla] [--tillat-fel]
//
// Skriver klaviyo/spoks/<brand>/payload/[<sprak>/]<mejl-id>.json ({ emailTitle,
// emailDescription, blocks }) och klaviyo/spoks/<brand>/plan.json: flödenas
// startvillkor i Spoks form (trigger, kontaktfilter, triggerFilter, väntetider),
// kampanjernas datum och segment, segmentdefinitionerna och workspacens
// inställningar. Själva uppladdningen görs av sessionen med Spoks-MCP:n
// (create_flow, add_flow_step, update_draft_campaign, draft_campaign,
// create_segment, update_settings) — det finns inget publikt Spoks-API.
//
// Brand-parametriserad sedan 2026-09-26 (CaraShell). Bäverbutiken körs exakt som
// förut: platt innehall/, en produktid per handle, samma texter i fakta-blocket
// (klaviyo/test/konvertera.test.mjs jämför mot de committade payload-filerna).
// Ett flerspråkigt brand (`flersprakig: true` i brandfilen) har innehall/
// floden/<sprak>/ och kampanjer/<sprak>/, och brandfilens `per_sprak` bär det
// som skiljer per språk: länkbas, spårningssida, ångerrättstext, förnamnsreserv,
// knapptexter, Trustpilot-adress och om produktkorten ritas som Spoks
// produktblock ('products', SEK och svensk titel ur katalogen) eller som bild +
// egen rubrik + knapp ('bild', för nb/en — Spoks katalog har en valuta och ett
// språk). Språkstyrningen i Spoks är landet (contact.country, engelskt
// landsnamn — mätt 2026-09-26), så `sprak_grupper` blir landsfilter.
//
// Tre saker Spoks inte kan och som därför ändras här:
// - Kundens eget paket (länken sparning:) — Spoks personalisering har bara
//   kontaktfält, inget ordernummer. Knappen går till spårningssidan.
// - "Det här fick du hem" (skickade_rader) — Spoks har inget orderradsblock.
// - Alla stjärnor i recensionsmejlet leder fortfarande till SAMMA sida.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = path.dirname(fileURLToPath(import.meta.url));
export const ROT = path.join(HAR, '..', '..');

const ENHET_MS = { minutes: 60_000, hours: 3_600_000, days: 86_400_000 };

// Bäverbutikens gamla fasta texter — standard för brand utan per_sprak.
const STD = {
  fornamn_reserv: 'där', grundare: 'grundare', verifierad: 'Verifierad kund',
  knapp_produkt: 'Se produkten', knapp_till: 'Till produkten', knapp_kassa: 'Tillbaka till kassan', knapp_titta: 'Titta igen',
  fakta_anger_rubrik: 'Ångerrätt', fakta_sparning_rubrik: 'Spåra paketet', fakta_sparning_text: 'Följ det hela vägen',
  produktkort: 'products', citat: true, lank_suffix: '',
};

export function fornamn(text, reserv = STD.fornamn_reserv) {
  return String(text ?? '')
    .replace(/, \{\{fornamn\}\}/g, '')
    .replace(/ \{\{fornamn\}\}/g, ` {{ contact.first_name | default: '${reserv}' }}`)
    .replace(/^\{\{fornamn\}\}, (.)/, (_, c) => c.toUpperCase())
    .replace(/\{\{fornamn\}\}, /g, '')
    .replace(/\{\{fornamn\}\}/g, `{{ contact.first_name | default: '${reserv}' }}`);
}

// "Anna Berg" → "Anna B." (samma regel som klaviyo/recensioner.mjs kortNamn).
export function kortNamn(namn) {
  const delar = String(namn ?? '').trim().split(/\s+/).filter(Boolean);
  if (!delar.length) return '';
  const stor = (s) => s.charAt(0).toLocaleUpperCase('sv-SE') + s.slice(1);
  return delar.length > 1 ? `${stor(delar[0])} ${delar[delar.length - 1].charAt(0).toLocaleUpperCase('sv-SE')}.` : stor(delar[0]);
}

export function lasBrand(brandId, rot = ROT) {
  return JSON.parse(fs.readFileSync(path.join(rot, 'klaviyo', 'brands', `${brandId}.json`), 'utf8'));
}

// produkter.json: { handle: "uuid" } (Bäverbutiken) eller { handle: { id, externalId, bild } }.
export function lasProduktIds(brandId, har = HAR) {
  const fil = path.join(har, brandId, 'produkter.json');
  if (!fs.existsSync(fil)) return {};
  return JSON.parse(fs.readFileSync(fil, 'utf8'));
}

// Recensioner: cachen klaviyo/output/<brand>/recensioner.json, eller (kalla
// 'produktfil') butikens egna publicerade recensioner ur factory/produkter/<handle>.yaml.
export function lasRecensioner(brand, brandId, rot = ROT) {
  const cache = path.join(rot, 'klaviyo', 'output', brandId, 'recensioner.json');
  if (fs.existsSync(cache)) return JSON.parse(fs.readFileSync(cache, 'utf8')).recensioner ?? {};
  if (brand?.recensioner?.kalla === 'produktfil') {
    const ut = {};
    const mapp = path.join(rot, 'factory', 'produkter');
    if (!fs.existsSync(mapp)) return ut;
    for (const f of fs.readdirSync(mapp)) {
      if (!f.endsWith('.yaml')) continue;
      const rader = recensionerUrYaml(fs.readFileSync(path.join(mapp, f), 'utf8'));
      if (rader.length) ut[f.replace(/\.yaml$/, '')] = rader;
    }
    return ut;
  }
  return {};
}

// Minimal läsning av `reviews:`-listan (namn/betyg/text/datum) i en produktfil.
export function recensionerUrYaml(yaml) {
  const m = /^reviews:\s*\n([\s\S]*?)(?=^\S|\Z)/m.exec(yaml);
  if (!m) return [];
  const ut = [];
  for (const block of m[1].split(/^\s*- /m).slice(1)) {
    const f = (k) => { const r = new RegExp(`^\\s*${k}:\\s*"?([^"\\n]*)"?\\s*$`, 'm').exec(block); return r ? r[1].trim() : null; };
    const betyg = Number(f('betyg'));
    const text = f('text');
    if (!text || !(betyg >= 4)) continue;
    ut.push({ namn: kortNamn(f('namn')), betyg, text, datum: f('datum') });
  }
  return ut.sort((a, b) => b.betyg - a.betyg);
}

const NOD = {
  samtycke: () => ({ type: 'filter', field: 'emailMarketingConsent', operator: 'in', value: ['subscribed'] }),
  ej_avregistrerad: () => ({ type: 'filter', field: 'emailMarketingConsent', operator: 'nin', value: ['unsubscribed'] }),
  ej_kopt_sedan_start: () => ({ type: 'filter', field: 'lastPurchase', operator: 'lt', value: '__flow_triggered__' }),
  ej_kassa_sedan_start: () => ({ type: 'filter', field: 'lastCartUpdate', operator: 'lt', value: '__flow_triggered__' }),
};
const och = (filters) => (filters.length === 1 ? filters[0] : { type: 'conjunction', operator: 'and', isGrouped: true, filters });
const eller = (filters) => (filters.length === 1 ? filters[0] : { type: 'conjunction', operator: 'or', isGrouped: true, filters });
const handelse = (field, operator, value, period = null) => ({
  type: 'eventFilter', field, operator, value: String(value),
  ...(period ? { timeFilter: { type: 'filter', field, operator: 'ge', value: period } } : {}),
});

/** Konverteraren för ett brand. Allt som skiljer brands och språk går in här. */
export function skapaKonverterare({ brand, produktIds = {}, recCache = {}, erbjudande = null, grundare = 'Axel' }) {
  const L = (s) => ({ ...STD, butik_url: brand.butik_url, sparningssida: brand.sparningssida, angerratt_text: brand.angerratt_text, ...(brand.per_sprak?.[s] ?? {}) });
  const sprakFor = (m) => m?.sprak ?? brand.sprak ?? 'sv';
  const prod = (h) => { const p = produktIds[h]; return typeof p === 'string' ? { id: p } : (p ?? null); };
  const bas = (l) => String(l.butik_url ?? '').replace(/\/$/, '');

  function lank(spec, l) {
    const s = String(spec ?? '').trim();
    const [typ, ...rest] = s.split(':');
    const v = rest.join(':');
    if (typ === 'produkt') return `${bas(l)}/products/${v}${l.lank_suffix}`;
    if (typ === 'kollektion') return `${bas(l)}/collections/${v}${l.lank_suffix}`;
    if (typ === 'sparning') return l.sparningssida;
    if (typ === 'trustpilot') return l.trustpilot ?? bas(l);
    if (typ === 'sida') return `${bas(l)}${v.startsWith('/') ? '' : '/'}${v}`;
    if (typ === 'url') return v;
    if (/^https:\/\//.test(s)) return s;
    return bas(l);
  }

  const handleUr = (spec) => (/^produkt:(.+)$/.exec(String(spec ?? '').trim()) ?? [])[1] ?? null;
  // Saknas Spoks-id:t står en synlig platshållare i payloaden (uppladdningen stoppar på den) i stället för att kortet tyst försvinner.
  const pid = (h, varn) => { const id = prod(h)?.id; if (!id) varn.push(`Produkten ${h} finns inte i Spoks.`); return id ?? `{{spoks:id:${h}}}`; };
  const synlig = (pris = true) => ({ isImageVisible: true, isTitleVisible: true, isPriceVisible: pris, isButtonVisible: true, isDescriptionVisible: false, isOriginalPriceVisible: pris });
  const produkter = (ids, knapp, perRad) => ({
    type: 'products', selectionMode: 'manual', products: ids.map((id) => ({ id, button: knapp })),
    dynamicProductsCount: null, dynamicCriteria: null, productVisibilitySettings: synlig(), buttonText: null, alignment: 'center', productsPerRow: perRad,
  });
  const stycken = (text, l, alignment = 'left') => String(text ?? '').split(/\n{2,}/).filter((x) => x.trim()).map((t) => ({ type: 'regular', text: fornamn(t.trim(), l.fornamn_reserv), alignment }));
  const titel = (h, s) => brand.produkttitlar?.[h]?.[s] ?? brand.produkttitlar?.[h]?.sv ?? h;

  // Produktkort som bild (nb/en): bild + rubrik på språket + knapp. fileId fylls
  // av uppladdningssessionen (upload_media) i produkter.json; tills dess en platshållare.
  function bildkort(h, knapp, l, s, varn) {
    const p = prod(h);
    if (!p?.bild) varn.push(`Bilden för ${h} saknar fileId i Spoks (produkter.json → bild).`);
    const url = lank(`produkt:${h}`, l);
    return [
      { type: 'image', fileId: p?.bild ?? `{{spoks:media:${h}}}`, altText: titel(h, s), urlRedirect: url },
      { type: 'h2', text: titel(h, s), alignment: 'center' },
      { type: 'link', text: knapp, url, style: 'button' },
    ];
  }
  function produktkort(handles, knapp, perRad, l, s, varn) {
    if (l.produktkort === 'bild') {
      if (handles.length === 1) return bildkort(handles[0], knapp, l, s, varn);
      return [{ type: 'columns', stackedOnMobile: true, verticalAlignment: 'top', columns: handles.map((h) => ({ flex: 1, blocks: bildkort(h, knapp, l, s, varn) })) }];
    }
    const ids = handles.map((h) => pid(h, varn)).filter(Boolean);
    return ids.length ? [produkter(ids, knapp, Math.min(ids.length, perRad))] : [];
  }

  function konverteraBlock(b, varn, s = brand.sprak ?? 'sv') {
    const l = L(s);
    switch (b.typ) {
      case 'hero': {
        const ut = [];
        if (b.rubrik) ut.push({ type: 'h1', text: fornamn(b.rubrik, l.fornamn_reserv), alignment: 'center' });
        if (b.text) ut.push(...stycken(b.text, l, 'center'));
        const h = handleUr(b.bild);
        if (h) ut.push(...produktkort([h], l.knapp_produkt, 1, l, s, varn).filter((x) => !(l.produktkort === 'bild' && x.type === 'link')));
        if (b.knapp) ut.push({ type: 'link', text: b.knapp.text, url: lank(b.knapp.lank, l), style: 'button' });
        return ut;
      }
      case 'text':
        return [...(b.rubrik ? [{ type: 'h2', text: fornamn(b.rubrik, l.fornamn_reserv) }] : []), ...stycken(b.text, l)];
      case 'punkter':
        return [...(b.rubrik ? [{ type: 'h2', text: fornamn(b.rubrik, l.fornamn_reserv) }] : []), ...(b.punkter ?? []).map((p) => ({ type: 'list', text: fornamn(p, l.fornamn_reserv) }))];
      case 'produkt':
        return [...produktkort([b.handle], b.knapp ?? l.knapp_till, 1, l, s, varn), ...(b.text ? stycken(b.text, l) : [])];
      case 'produktrad': {
        const kort = produktkort(b.handles ?? [], l.knapp_produkt, 3, l, s, varn);
        if (!kort.length) return [];
        return [...(b.rubrik ? [{ type: 'h2', text: fornamn(b.rubrik, l.fornamn_reserv), alignment: 'center' }] : []), ...kort];
      }
      case 'citat': {
        if (l.citat === false) { varn.push(`Citat visas inte på ${s}, blocket utgår.`); return []; }
        const lista = (recCache[b.handle] ?? []).slice(0, Math.min(Number(b.antal ?? 2) || 2, 2));
        if (!lista.length) { varn.push(`Inga recensioner för ${b.handle}, citatet utgår.`); return []; }
        return lista.flatMap((r) => [{ type: 'quote', text: `"${r.text}"\n${/^anonym/i.test(r.namn ?? '') || !r.namn ? l.verifierad : `${r.namn}, ${l.verifierad.toLowerCase()}`}` }]);
      }
      case 'knapp':
        return [{ type: 'link', text: b.text, url: lank(b.lank, l), style: 'button' }];
      case 'grundare':
        return [{ type: 'quote', text: `${fornamn(b.text, l.fornamn_reserv)}\n${grundare}, ${l.grundare}` }];
      case 'fakta':
        return [{
          type: 'columns', stackedOnMobile: true, verticalAlignment: 'top',
          columns: [
            { flex: 1, blocks: [{ type: 'regular', text: `**${l.fakta_anger_rubrik}**`, alignment: 'center' }, { type: 'regular', text: l.angerratt_text, alignment: 'center' }] },
            { flex: 1, blocks: [{ type: 'regular', text: `**${l.fakta_sparning_rubrik}**`, alignment: 'center' }, { type: 'regular', text: `[${l.fakta_sparning_text}](${l.sparningssida})`, alignment: 'center' }] },
          ],
        }];
      case 'erbjudande': {
        if (!erbjudande) { varn.push('Brandet har inget erbjudande, blocket utgår.'); return []; }
        const min = `${erbjudande.minsta_kop_sek} kr`;
        return [{
          type: 'section', blocks: [
            { type: 'h2', text: 'Din kundgåva', alignment: 'center' },
            ...(b.text ? stycken(b.text, l, 'center') : []),
            { type: 'regular', text: `Snurra hjulet och vinn en produkt gratis, som blir din vid nästa köp på minst ${min}.`, alignment: 'center' },
            { type: 'regular', text: `Din gåvokod: **${erbjudande.kod}**`, alignment: 'center' },
            { type: 'link', text: 'Snurra hjulet', url: `${bas(l)}/pages/din-gratisprodukt`, style: 'button' },
            { type: 'regular', text: `Gäller vid nästa köp på minst ${min}, ett snurr per kund, och kombineras inte med andra koder.`, alignment: 'center' },
          ],
        }];
      }
      case 'dynamisk':
        if (b.kalla === 'checkout_rader') return [{ type: 'abandonedCart', buttonText: l.knapp_kassa, ...(l.produktkort === 'bild' ? { isProductPriceVisible: false } : {}) }];
        if (b.kalla === 'visad_produkt') {
          const d = { ...produkter([], null, 1), selectionMode: 'dynamic', products: undefined, dynamicCriteria: 'recently_viewed', dynamicProductsCount: 1, buttonText: l.knapp_titta };
          if (l.produktkort === 'bild') d.productVisibilitySettings = synlig(false);
          return [d];
        }
        varn.push(`Dynamiskt block ${b.kalla} finns inte i Spoks, blocket utgår.`);
        return [];
      case 'stjarnor': {
        const u = lank(b.lank, l);
        const sep = u.includes('?') ? '&' : '?';
        return [
          ...(b.rubrik ? [{ type: 'h2', text: b.rubrik, alignment: 'center' }] : []),
          { type: 'h1', text: [1, 2, 3, 4, 5].map((n) => `[★](${u}${sep}stars=${n})`).join(' '), alignment: 'center' },
          ...(b.text ? [{ type: 'regular', text: b.text, alignment: 'center' }] : []),
        ];
      }
      default:
        varn.push(`Okänd blocktyp ${b.typ}, blocket utgår.`);
        return [];
    }
  }

  function konverteraMejl(m) {
    const s = sprakFor(m);
    const l = L(s);
    const varn = [];
    const blocks = (m.block ?? []).flatMap((b) => konverteraBlock(b, varn, s)).map((b) => {
      if (b.type === 'products' && b.selectionMode === 'dynamic') delete b.products;
      return b;
    });
    return {
      id: m.id,
      ...(brand.flersprakig ? { sprak: s } : {}),
      emailTitle: fornamn(m.amnesrader?.[0]?.text ?? '', l.fornamn_reserv),
      emailDescription: fornamn(m.forhandstext ?? '', l.fornamn_reserv),
      amnesrader: (m.amnesrader ?? []).map((a) => fornamn(a.text, l.fornamn_reserv)),
      blocks,
      varningar: varn,
    };
  }

  // Språkgruppens landsfilter (Spoks: contact.country = engelskt landsnamn).
  function sprakNod(s) {
    const g = brand.sprak_grupper?.[s];
    if (!g) return null;
    const i = { type: 'filter', field: 'country', operator: 'in', value: g.lander };
    return g.utan_land ? eller([i, { type: 'filter', field: 'country', operator: 'nis' }]) : i;
  }
  function spoksFilter(nycklar, s) {
    const noder = (nycklar ?? []).map((k) => (k === 'sprak' ? sprakNod(s) : NOD[k]?.())).filter(Boolean);
    return noder.length ? och(noder) : null;
  }
  function spoksTriggerFilter(tf) {
    if (!tf) return null;
    const noder = [];
    if (tf.externalId) noder.push({ type: 'filter', field: 'externalId', operator: 'in', value: tf.externalId.map((h) => prod(h)?.externalId ?? `{{spoks:externalId:${h}}}`) });
    return noder.length ? och(noder) : null;
  }
  function spoksFlode(d, mejlNamn = {}) {
    const s = d.sprak ?? brand.sprak ?? 'sv';
    const sp = d.spoks ?? {};
    const steg = (d.steg ?? []).map((st) => {
      if (st.typ === 'vanta') {
        const ms = Math.round((st.varde ?? 0) * (ENHET_MS[st.enhet] ?? ENHET_MS.days));
        return { type: 'delay', parameters: { delay: ms, ...(sp.tilHour ? { tilHour: sp.tilHour } : {}) } };
      }
      return { type: 'publish_flow_post_to_contact', mejl: st.mejl.id, namn: mejlNamn[st.mejl.id] ?? st.mejl.amnesrader?.[0]?.text ?? st.mejl.id };
    });
    return {
      id: d.id, namn: d.namn, sprak: s,
      trigger: { event: sp.event ?? null, filter: spoksFilter(sp.filter, s), triggerFilter: spoksTriggerFilter(sp.triggerFilter) },
      reenrollEnabled: Boolean(sp.reenroll), allowReenrolmentAfter: sp.reenrollEfter ?? null,
      steg,
    };
  }

  // Segmenten: per språk samtycke, köpare, ej köpt, engagerade 60 d; plus oengagerade 180 d (bara för att mäta).
  function segment() {
    const sprak = Object.keys(brand.sprak_grupper ?? {});
    if (!sprak.length) return [];
    const ut = [];
    for (const s of sprak) {
      const g = () => [NOD.samtycke(), sprakNod(s)];
      ut.push({ namn: `SEG_samtycke_${s}`, kampanj_ok: true, beskrivning: `Samtycke (subscribed) och ${brand.sprak_grupper[s].lander.join('/')}${brand.sprak_grupper[s].utan_land ? ' eller utan land' : ''}.`, filter: och(g()) });
      ut.push({ namn: `SEG_kopare_${s}`, kampanj_ok: true, beskrivning: 'Samtycke och minst en order.', filter: och([...g(), { type: 'filter', field: 'totalOrders', operator: 'ge', value: '1' }]) });
      ut.push({ namn: `SEG_ej_kopt_${s}`, kampanj_ok: true, beskrivning: 'Samtycke och inget köp.', filter: och([...g(), { type: 'filter', field: 'purchasedProducts', operator: 'nis' }]) });
      ut.push({ namn: `SEG_engagerade_60d_${s}`, kampanj_ok: true, beskrivning: 'Samtycke och öppnat, klickat eller köpt senaste 60 dagarna.', filter: och([...g(), eller([handelse('openedEmail', 'ge', 1, 'P60D'), handelse('clickedEmail', 'ge', 1, 'P60D'), handelse('orderedProducts', 'ge', 1, 'P60D')])]) });
    }
    ut.push({ namn: 'SEG_oengagerade_180d', kampanj_ok: false, beskrivning: 'Fått minst 5 mejl, inte öppnat eller klickat på 180 dagar. Bara för att mäta, aldrig som målgrupp.', filter: och([NOD.samtycke(), handelse('receivedEmail', 'ge', 5), handelse('openedEmail', 'eq', 0, 'P180D'), handelse('clickedEmail', 'eq', 0, 'P180D')]) });
    return ut;
  }

  // Copykontrollen: det som stoppar ett mejl innan det laddas upp.
  const FORBJUDET = {
    alla: [
      [/__COPY__/, 'ofylld copy (__COPY__)'],
      [/[—–]/, 'tankstreck'],
      [/\b\d+\s?(?:-|till|to|til)\s?\d+\s?(?:arbetsdag|virkedag|business day|hverdag)/i, 'leveranstid'],
      [/leveranstid|leveringstid|delivery time|leveringstiden|toimitusaika/i, 'leveranstid'],
      [/(?<![\w@.])carashell(?![.@\w])/i, 'butikens namn i brödtexten'],
      [/\d+\s?%/, 'procent'],
      [/\b\d[\d\s.,]*\s?(kr|sek|nok|dkk|usd|eur|gbp|aud|cad|nzd)\b/i, 'belopp'],
      [/[$£€]\s?\d/, 'belopp'],
      [/förvaringspåse|dragsko|oppbevaringspose|storage bag|drawstring/i, 'påstående som inte får göras (påse/dragsko)'],
      [/elastisk|gummiband|\bstrikk\b|elastic strap|rubber strap/i, 'elastiska band (banden är vävda)'],
      [/andas|ventilerad|puster|breathable|ventilated/i, 'andas/ventilerad (obesvarat av leverantören)'],
      [/tusentals|tusenvis|thousands of/i, 'tusentals'],
      [/bara idag|sista chansen|bare i dag|siste sjanse|today only|last chance/i, 'falsk brådska'],
      [/30 dagars|30 dager|30-day|öppet köp|åpent kjøp|money-back|warranty/i, 'fel villkor'],
    ],
    sv: [[/\bgaranti\b/i, '"garanti" (skriv 14 dagars ångerrätt)']],
    nb: [[/\bgaranti\b/i, '"garanti" (skriv 14 dagers angrerett)']],
    en: [[/\b(winter|summer|spring|autumn|fall|snow|snowy)\b/i, 'årstid (Australien och Nya Zeeland får samma mejl)']],
  };
  function texterI(m) {
    const ut = [];
    for (const a of m.amnesrader ?? []) ut.push(['ämnesrad', a.text]);
    ut.push(['förhandstext', m.forhandstext]);
    for (const b of m.block ?? []) {
      for (const k of ['rubrik', 'text']) if (typeof b[k] === 'string') ut.push([`${b.typ}.${k}`, b[k]]);
      for (const p of b.punkter ?? []) ut.push(['punkt', p]);
      if (b.knapp?.text) ut.push(['knapp', b.knapp.text]);
      if (b.typ === 'produkt' && typeof b.knapp === 'string') ut.push(['knapp', b.knapp]);
    }
    return ut.filter(([, t]) => typeof t === 'string');
  }
  function kontrollera(m) {
    const s = sprakFor(m);
    const fel = [];
    const regler = [...FORBJUDET.alla, ...(FORBJUDET[s] ?? [])];
    for (const [var_, t] of texterI(m)) for (const [re, vad] of regler) if (re.test(t)) fel.push(`${m.id} ${var_}: ${vad} — "${t.slice(0, 80)}"`);
    if (!Array.isArray(m.tretest) || !m.tretest.length) fel.push(`${m.id}: tretest saknas`);
    for (const r of m.tretest ?? []) {
      const ok = r.visualisera && r.falsifiera && (r.ingen_annan || /recension/.test(m.id));
      if (!ok) fel.push(`${m.id} tretest: "${r.rad}" klarar inte testet`);
    }
    if ((m.amnesrader ?? []).length !== 3) fel.push(`${m.id}: tre ämnesrader krävs`);
    return fel;
  }

  return { L, sprakFor, lank, konverteraBlock, konverteraMejl, spoksFilter, spoksTriggerFilter, spoksFlode, segment, kontrollera, texterI };
}

// ---------------------------------------------------------------- körningen

function lasJson(f) { return JSON.parse(fs.readFileSync(f, 'utf8')); }

function main() {
  const arg = (n, std) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : std; };
  const brandId = arg('--brand', 'baverbutiken');
  const brand = lasBrand(brandId);
  const produktIds = lasProduktIds(brandId);
  const recCache = lasRecensioner(brand, brandId);
  const erbjudande = brand.erbjudande_fran === null ? null : JSON.parse(fs.readFileSync(path.join(ROT, 'mejl', 'konfig.json'), 'utf8')).erbjudande;
  const K = skapaKonverterare({ brand, produktIds, recCache, erbjudande });
  const kolla = process.argv.includes('--kolla') || Boolean(brand.flersprakig);
  const tillatFel = process.argv.includes('--tillat-fel');

  const inn = path.join(ROT, 'klaviyo', 'innehall', brandId);
  const ut = path.join(HAR, brandId, 'payload');
  // Bäverbutikens plan.json behåller sin gamla form ({ floden, kampanjer }); ett
  // flerspråkigt brand får dessutom segment, inställningar och produktkartan.
  const plan = brand.flersprakig
    ? { brand: brandId, floden: [], kampanjer: [], segment: K.segment(), installningar: brand.spoks?.installningar ?? null, produkter: produktIds }
    : { floden: [], kampanjer: [] };
  const fel = [];
  const saknas = new Set();
  const undermappar = (m) => (brand.flersprakig ? fs.readdirSync(m).filter((d) => fs.statSync(path.join(m, d)).isDirectory()).sort().map((d) => [d, path.join(m, d)]) : [[null, m]]);

  const skrivPayload = (p, s) => {
    const mapp = s ? path.join(ut, s) : ut;
    fs.mkdirSync(mapp, { recursive: true });
    fs.writeFileSync(path.join(mapp, `${p.id}.json`), JSON.stringify(p, null, 2) + '\n');
    for (const v of p.varningar) if (/^Produkten .* finns inte i Spoks|saknar fileId/.test(v)) saknas.add(v); else console.log(`${p.id}${s ? ` (${s})` : ''}: ${v}`);
  };

  for (const [s, mapp] of undermappar(path.join(inn, 'floden'))) {
    for (const f of fs.readdirSync(mapp).filter((x) => x.endsWith('.json')).sort()) {
      const d = lasJson(path.join(mapp, f));
      const steg = [];
      const namn = {};
      for (const st of d.steg) {
        if (st.typ === 'vanta') steg.push({ typ: 'vanta', dagar: st.enhet === 'hours' ? st.varde / 24 : st.enhet === 'minutes' ? st.varde / 1440 : st.varde });
        else {
          if (kolla) fel.push(...K.kontrollera(st.mejl));
          const p = K.konverteraMejl(st.mejl);
          skrivPayload(p, s);
          namn[p.id] = p.emailTitle;
          steg.push({ typ: 'mejl', id: p.id, namn: p.emailTitle });
        }
      }
      const rad = { id: d.id, namn: d.namn, trigger: d.trigger ?? d.spoks?.event ?? null, filter: d.filter ?? d.spoks?.filter ?? [], steg };
      if (d.spoks) Object.assign(rad, { sprak: s, spoks: K.spoksFlode({ ...d, sprak: s ?? d.sprak }, namn) });
      plan.floden.push(rad);
    }
  }
  for (const [s, mapp] of undermappar(path.join(inn, 'kampanjer'))) {
    for (const f of fs.readdirSync(mapp).filter((x) => x.endsWith('.json')).sort()) {
      const d = lasJson(path.join(mapp, f));
      const m = d.mejl ?? d;
      if (kolla) fel.push(...K.kontrollera({ ...m, id: m.id ?? d.id }));
      const p = K.konverteraMejl({ ...m, id: m.id ?? d.id });
      skrivPayload(p, s);
      plan.kampanjer.push({ id: d.id, namn: d.namn, ...(s ? { sprak: s, titel: `${d.id.split('-')[0].toUpperCase()} ${s.toUpperCase()} ${p.emailTitle}` } : {}), planerad: d.planerad ?? d.skickas, segment: d.segment ?? d.malgrupp, mejl: p.id, ...(brand.flersprakig && d.status_plan ? { status_plan: d.status_plan } : {}) });
    }
  }
  if (saknas.size) plan.produkter_saknas = [...saknas];
  fs.writeFileSync(path.join(HAR, brandId, 'plan.json'), JSON.stringify(plan, null, 2) + '\n');
  console.log(`${plan.floden.length} flöden, ${plan.kampanjer.length} kampanjer${plan.segment ? `, ${plan.segment.length} segment` : ''} → ${path.relative(ROT, ut)}`);
  if (saknas.size) console.log(`${saknas.size} produkt-id/bilder saknas i Spoks (fylls i produkter.json av uppladdningssessionen).`);
  if (fel.length) {
    console.error(`\n${fel.length} copyfel:`);
    for (const f of fel) console.error(`  ${f}`);
    if (!tillatFel) process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
