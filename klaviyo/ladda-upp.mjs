// Uppladdaren: segment, mallar, kampanjer och flöden → Klaviyo, ALLTID som utkast.
//
//   node klaviyo/ladda-upp.mjs [--brand baverbutiken]            torrt (standard): bara planen
//   node klaviyo/ladda-upp.mjs --skarpt                           skapar på riktigt (utkast)
//   node klaviyo/ladda-upp.mjs --bara segment|mallar|kampanjer|floden
//   node klaviyo/ladda-upp.mjs --uppdatera                        patchar mallar + Draft-kampanjer som finns
//   node klaviyo/ladda-upp.mjs --manifest <fil>                   annat manifest än output/<brand>/manifest.json
//
// Läser det BYGGDA resultatet (klaviyo/output/<brand>/manifest.json, skrivet av
// bygg.mjs). Ordningen är ARKITEKTUR.md → "Uppladdningens ordning":
//   1 kolla (nyckel, public_api_key, metriker) → 2 listor → 3 segment → 4 mallar
//   → 5 kampanjer (Draft + assign-template) → 6 flöden (draft) → 7 minnet.
//
// ⛔ Skickar aldrig: inga send-jobs, inget sätts live (spärren sitter även i klient.mjs).
// ⛔ En kampanj går bara till segment med samtycke (kravSamtycke).
// ⛔ Allt slås upp på exakt namn först — andra körningen skapar ingenting.
//
// Scheman i specen 2026-07-15: CampaignCreateQuery, CampaignMessageAssignTemplateQuery,
// CampaignPartialUpdateQuery, CampaignMessagePartialUpdateQuery,
// TemplateCreateHtmlOrDndQuery, TemplateUpdateHtmlOrDndQuery, SegmentCreateQuery,
// ListCreateQuery, FlowCreateQuery → FlowDefinition (MetricTrigger, ListTrigger,
// SegmentTrigger, TimeDelayAction, SendEmailAction → FlowEmail, ReentryCriteria).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KlaviyoKlient, KlaviyoFel, nyckelFranEnv, kontrolleraKonto } from './klient.mjs';
import { hamtaMetriker, metrikIds as metrikIdsUr, metrikId, platshallarIds, KANDA_METRIKER } from './metriker.mjs';
import { SEGMENT, segmentPaNamn, profilFilter, kravSamtycke } from './segment.mjs';

const HAR = path.dirname(fileURLToPath(import.meta.url));

/** Dygnstak ur specen (rate limits "Daily"). Räknas rullande 24 h i uppladdat.jsonl. */
export const DYGNSTAK = { segment: 100, flode: 100 };
/** Fel som stoppar HELA körningen, inte bara ett objekt. */
const AVBRYT = new Set(['FEL_KONTO', 'SPARR_SKICKA', 'RATE_LIMIT']);

export const LISTA_NYHETSBREV = 'LISTA_nyhetsbrev';

// ------------------------------------------------------------------ rena hjälpare

export function mallNamn(mejl) {
  return `TPL_${mejl.id}_v${mejl.version ?? 1}`;
}

/** Järnregel 4: avregistrering + organisationens adress i varje mall. Returnerar problemen. */
export function mallKontroll(html) {
  const fel = [];
  if (!/\{%-?\s*unsubscribe(_link)?\b/.test(html ?? '')) fel.push('saknar {% unsubscribe %} / {% unsubscribe_link %}');
  if (!/\{\{-?\s*organization\.full_address\b/.test(html ?? '')) fel.push('saknar {{ organization.full_address }}');
  return fel;
}

const amne = (m, i) => {
  const r = m?.amnesrader?.[i];
  return typeof r === 'string' ? r : r?.text ?? null;
};

export function utmParametrar(brand) {
  return Object.entries(brand.utm ?? {}).map(([name, value]) => ({ name, value: String(value) }));
}

export function kampanjKropp({ kampanj, mejl, brand, inkludera, exkludera }) {
  return {
    data: {
      type: 'campaign',
      attributes: {
        name: kampanj.namn,
        audiences: { included: inkludera, excluded: exkludera },
        send_strategy: { method: 'static', datetime: kampanj.planerad, options: { is_local: false } },
        send_options: { use_smart_sending: true },
        tracking_options: {
          add_tracking_params: true,
          custom_tracking_params: utmParametrar(brand).map((p) => ({ type: 'static', name: p.name, value: p.value })),
        },
        'campaign-messages': {
          data: [{
            type: 'campaign-message',
            attributes: {
              definition: {
                channel: 'email',
                label: mejl.namn,
                content: {
                  subject: amne(mejl, 0),
                  preview_text: mejl.forhandstext ?? null,
                  from_email: brand.avsandare.from_email,
                  from_label: brand.avsandare.from_label,
                  reply_to_email: brand.avsandare.reply_to_email,
                },
              },
            },
          }],
        },
      },
    },
  };
}

export function mallKropp(mejl) {
  return { data: { type: 'template', attributes: { name: mallNamn(mejl), editor_type: 'CODE', html: mejl.html, text: mejl.text ?? null } } };
}

const ENHET = { hour: 'hours', hours: 'hours', timmar: 'hours', timme: 'hours', day: 'days', days: 'days', dagar: 'days', dag: 'days', minute: 'minutes', minutes: 'minutes', minuter: 'minutes' };

/** Flödets definition: linjär kedja vänta → mejl → vänta → mejl, allt draft. */
export function flodesDefinition({ flode, trigger, filterDef, mejlPaId, mallIdPaMejl, brand }) {
  const actions = flode.steg.map((s, i) => {
    const temporary_id = `a${i + 1}`;
    const links = { next: i + 1 < flode.steg.length ? `a${i + 2}` : null };
    if (s.typ === 'vanta') {
      const unit = ENHET[s.enhet];
      if (!unit) throw new Error(`Flödet ${flode.namn} steg ${i + 1}: okänd enhet "${s.enhet}" (hours, days, minutes).`);
      return { temporary_id, type: 'time-delay', links, data: { unit, value: s.varde } };
    }
    if (s.typ === 'mejl') {
      const mejlId = s.mejl_id ?? s.mejl?.id;
      const m = mejlPaId(mejlId);
      if (!m) throw new Error(`Flödet ${flode.namn} steg ${i + 1}: mejlet "${mejlId}" finns inte i manifestet.`);
      return {
        temporary_id, type: 'send-email', links,
        data: {
          status: 'draft',
          message: {
            from_email: brand.avsandare.from_email,
            from_label: brand.avsandare.from_label,
            reply_to_email: brand.avsandare.reply_to_email,
            subject_line: amne(m, 0),
            preview_text: m.forhandstext ?? null,
            template_id: mallIdPaMejl(m),
            smart_sending_enabled: true,
            transactional: false,
            add_tracking_params: true,
            custom_tracking_params: utmParametrar(brand).map((p) => ({ param: p.name, value: p.value })),
            name: m.namn,
          },
        },
      };
    }
    throw new Error(`Flödet ${flode.namn} steg ${i + 1}: okänd stegtyp "${s.typ}" (vanta, mejl).`);
  });
  // ReentryCriteria kräver duration (heltal) även för unit "alltime"; byggaren skriver
  // varaktighet null då. 0 skickas — obekräftat vad Klaviyo gör med talet vid alltime.
  const reentry = flode.ateintrade
    ? { duration: flode.ateintrade.varaktighet ?? 0, unit: flode.ateintrade.enhet }
    : null;
  return {
    triggers: [trigger],
    profile_filter: filterDef,
    actions,
    entry_action_id: actions.length ? 'a1' : null,
    ...(reentry ? { reentry_criteria: reentry } : {}),
  };
}

/**
 * Byggaren skriver html och text som FILNAMN bredvid manifestet
 * (k01-….html / .txt). Läser in dem så resten av uppladdaren får innehållet.
 * Ett fält som redan är HTML (innehåller "<") lämnas orört.
 */
export function laddaInnehall(manifest, dir) {
  const las = (v, slut) => {
    if (typeof v !== 'string' || v.includes('<') || v.includes('\n') || !v.endsWith(slut)) return v;
    const fil = path.join(dir, v);
    if (!fs.existsSync(fil)) throw new Error(`Manifestet pekar på ${v}, men filen finns inte i ${dir}. Kör node klaviyo/bygg.mjs igen.`);
    return fs.readFileSync(fil, 'utf8');
  };
  return { ...manifest, mejl: (manifest.mejl ?? []).map((m) => ({ ...m, html: las(m.html, '.html'), text: las(m.text, '.txt') })) };
}

// ------------------------------------------------------------------ minnet

export function lasMinne(kontoDir) {
  const fil = path.join(kontoDir, 'uppladdat.jsonl');
  if (!fs.existsSync(fil)) return [];
  return fs.readFileSync(fil, 'utf8').split('\n').filter(Boolean).map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
}

export function raknaSenasteDygn(minne, typ, nu) {
  const grans = nu.getTime() - 24 * 3600 * 1000;
  return minne.filter((r) => r.typ === typ && r.atgard === 'skapad' && Date.parse(r.tid) >= grans).length;
}

// ------------------------------------------------------------------ huvudflödet

/**
 * @param {object} o
 * @param {object} o.brand       brands/<id>.json
 * @param {object} o.manifest    output/<brand>/manifest.json
 * @param {KlaviyoKlient|null} o.klient  null = torrt utan nyckel (planen byggs offline)
 * @param {boolean} [o.skarpt]
 * @param {string|null} [o.bara] segment | mallar | kampanjer | floden
 * @param {boolean} [o.uppdatera]
 * @param {string} o.kontoDir    konto/<brand>/
 */
export async function laddaUpp({ brand, manifest, klient = null, skarpt = false, bara = null, uppdatera = false, kontoDir, nu = () => new Date(), logg = () => {} }) {
  if (skarpt && !klient) throw new Error('Skarp uppladdning kräver en nyckel.');
  if (bara && !['segment', 'mallar', 'kampanjer', 'floden'].includes(bara)) throw new Error(`--bara ${bara}: välj segment, mallar, kampanjer eller floden.`);
  if (manifest?.brand && manifest.brand !== brand.id) throw new Error(`Manifestet är byggt för "${manifest.brand}", inte ${brand.id}. Butiker blandas aldrig.`);

  const r = { brand: brand.id, skarpt, bara, uppdatera, start: nu().toISOString(), konto: null, plan: [], skapade: [], uppdaterade: [], hoppade: [], stopp: [], varningar: [], exempel: {}, ab: [] };
  const minne = lasMinne(kontoDir);
  const kor = (s) => !bara || bara === s;
  const minneFil = path.join(kontoDir, 'uppladdat.jsonl');

  const plan = (rad) => { r.plan.push(rad); logg(rad); };
  const minns = (typ, namn, id, atgard) => {
    if (!skarpt) return;
    fs.mkdirSync(kontoDir, { recursive: true });
    const rad = { tid: nu().toISOString(), brand: brand.id, typ, namn, id, atgard };
    fs.appendFileSync(minneFil, JSON.stringify(rad) + '\n');
    minne.push(rad);
  };
  let torrNr = 0;
  /** Skapa/uppdatera: skarpt → Klaviyo; torrt → planen + ett exempel per sort. */
  const skriv = async (typ, namn, metod, sokvag, kropp, atgard = 'skapad') => {
    const sort = `${metod} ${sokvag.replace(/^(\/api\/[^/]+)\/[^/]+$/, '$1/{id}')}`;
    if (!r.exempel[sort]) r.exempel[sort] = kropp;
    if (!skarpt) {
      plan(`${atgard === 'skapad' ? 'SKAPA' : 'UPPDATERA'} ${typ} ${namn} (${sort})`);
      return { data: { id: `TORR-${typ}-${++torrNr}`, attributes: {}, relationships: {} } };
    }
    if (atgard === 'skapad' && DYGNSTAK[typ] && raknaSenasteDygn(minne, typ, nu()) >= DYGNSTAK[typ]) {
      const e = new Error(`Dygnstaket för ${typ} (${DYGNSTAK[typ]} per dygn i Klaviyo) är nått enligt uppladdat.jsonl — ${namn} skapas nästa dygn.`);
      e.kod = 'DYGNSTAK';
      throw e;
    }
    const svar = metod === 'POST' ? await klient.post(sokvag, kropp) : await klient.patch(sokvag, kropp);
    const id = svar?.data?.id ?? null;
    plan(`${atgard === 'skapad' ? 'SKAPAD' : 'UPPDATERAD'} ${typ} ${namn}${id ? ` → ${id}` : ''}`);
    (atgard === 'skapad' ? r.skapade : r.uppdaterade).push({ typ, namn, id });
    minns(typ, namn, id, atgard);
    return svar;
  };
  const finns = async (typ, namn) => {
    if (klient) return klient.hittaPaNamn(typ, namn);
    const kant = [...minne].reverse().find((m) => m.namn === namn && m.id);
    return kant ? { id: kant.id, attributes: { name: namn }, franMinnet: true } : null;
  };
  const hoppa = (typ, namn, orsak) => { r.hoppade.push({ typ, namn, orsak }); plan(`HOPPA ${typ} ${namn}: ${orsak}`); };
  const stoppa = (typ, namn, e) => {
    if (AVBRYT.has(e.kod) || e.status === 401 || e.status === 403) throw e;
    r.stopp.push({ typ, namn, orsak: e.message, kod: e.kod ?? null });
    plan(`STOPP ${typ} ${namn}: ${e.message}`);
  };

  // 1. kolla -------------------------------------------------------------------
  let metriker = null;
  let ids;
  if (klient) {
    const konto = await kontrolleraKonto(klient, brand); // kastar FEL_KONTO → inget skrivs
    r.konto = { id: konto.id, public_api_key: konto.attributes?.public_api_key };
    metriker = await hamtaMetriker(klient);
    const u = metrikIdsUr(metriker);
    ids = u.ids;
    for (const s of u.saknas) r.varningar.push(`Metrik ${s.nyckel}: ${s.orsak}`);
  } else {
    ids = platshallarIds();
    r.varningar.push('Torrkörning utan nyckel: inget är kontrollerat mot kontot, id:n är platshållare.');
  }

  // 2. listor ------------------------------------------------------------------
  const listIds = {};
  const sakraLista = async (namn) => {
    if (listIds[namn]) return listIds[namn];
    const f = await finns('list', namn);
    if (f) { listIds[namn] = f.id; return f.id; }
    const svar = await skriv('lista', namn, 'POST', '/api/lists', { data: { type: 'list', attributes: { name: namn, opt_in_process: 'single_opt_in' } } });
    listIds[namn] = svar.data.id;
    return svar.data.id;
  };
  if (!bara) {
    try { await sakraLista(LISTA_NYHETSBREV); } catch (e) { stoppa('lista', LISTA_NYHETSBREV, e); }
  }

  // 3. segment -----------------------------------------------------------------
  const segIds = {};
  if (kor('segment')) {
    for (const s of SEGMENT) {
      try {
        const saknade = s.metriker.filter((k) => !ids[k]);
        if (saknade.length) { hoppa('segment', s.namn, `metriken ${saknade.map((k) => KANDA_METRIKER[k].join('/')).join(', ')} saknas i kontot`); continue; }
        const definition = s.bygg(ids);
        if (s.kampanjOk) kravSamtycke(definition, s.namn);
        const f = await finns('segment', s.namn);
        if (f) { segIds[s.namn] = f.id; hoppa('segment', s.namn, `finns redan (${f.id})`); continue; }
        const svar = await skriv('segment', s.namn, 'POST', '/api/segments', { data: { type: 'segment', attributes: { name: s.namn, definition } } });
        segIds[s.namn] = svar.data.id;
      } catch (e) { stoppa('segment', s.namn, e); }
    }
  }

  /** Segment-id för en publik. Kontrollerar samtycke när den ska INKLUDERAS i en kampanj. */
  const publikId = async (namn, { inkludera }) => {
    if (/^LISTA_/.test(namn)) {
      if (inkludera) {
        const e = new Error(`publiken "${namn}" är en lista. En kampanj går bara till segment med samtyckesvillkoret — använd t.ex. SEG_samtycke.`);
        e.kod = 'SAMTYCKE_SAKNAS';
        throw e;
      }
      return sakraLista(namn);
    }
    const bib = segmentPaNamn(namn);
    if (inkludera && bib && !bib.kampanjOk) {
      const e = new Error(`segmentet "${namn}" är bara för exkludering och sunset, aldrig en kampanjpublik.`);
      e.kod = 'SEGMENT_EJ_KAMPANJ';
      throw e;
    }
    if (inkludera && bib) kravSamtycke(bib.bygg(ids), namn);
    if (segIds[namn]) return segIds[namn];
    const f = await finns('segment', namn);
    if (f) {
      if (inkludera && !bib && klient) {
        const full = await klient.get(`/api/segments/${f.id}`, { 'fields[segment]': 'definition,name' });
        kravSamtycke(full?.data?.attributes?.definition, namn);
      }
      segIds[namn] = f.id;
      return f.id;
    }
    if (!skarpt) return `<segment:${namn}>`;
    const e = new Error(`segmentet "${namn}" finns inte i kontot${bib ? ' — kör segmentsteget först (utan --bara, eller --bara segment)' : ' och inte i segment.mjs'}.`);
    e.kod = 'SEGMENT_SAKNAS';
    throw e;
  };

  // 4. mallar ------------------------------------------------------------------
  const mejlLista = manifest.mejl ?? [];
  const mejlPaId = (id) => mejlLista.find((m) => m.id === id) ?? null;
  const tplIds = {};
  const trasigaMallar = new Set();
  for (const m of mejlLista) {
    const fel = mallKontroll(m.html);
    if (fel.length) trasigaMallar.add(m.id);
  }
  if (kor('mallar')) {
    for (const m of mejlLista) {
      const namn = mallNamn(m);
      try {
        const fel = mallKontroll(m.html);
        if (fel.length) { const e = new Error(`mallen ${fel.join(' och ')} (järnregel 4, MFL 20 §)`); e.kod = 'MALL_UTAN_AVREGISTRERING'; throw e; }
        const f = await finns('template', namn);
        if (f) {
          tplIds[m.id] = f.id;
          if (uppdatera) {
            await skriv('mall', namn, 'PATCH', `/api/templates/${f.id}`, { data: { type: 'template', id: f.id, attributes: { html: m.html, text: m.text ?? null } } }, 'uppdaterad');
          } else hoppa('mall', namn, `finns redan (${f.id}) — --uppdatera skriver över`);
          continue;
        }
        const svar = await skriv('mall', namn, 'POST', '/api/templates', mallKropp(m));
        tplIds[m.id] = svar.data.id;
      } catch (e) { stoppa('mall', namn, e); }
    }
  }
  const mallIdFor = async (m) => {
    if (trasigaMallar.has(m.id)) { const e = new Error(`mallen till ${m.id} saknar avregistrering eller adress — stoppad i mallsteget`); e.kod = 'MALL_UTAN_AVREGISTRERING'; throw e; }
    if (tplIds[m.id]) return tplIds[m.id];
    const f = await finns('template', mallNamn(m));
    if (f) { tplIds[m.id] = f.id; return f.id; }
    if (!skarpt) return `<mall:${mallNamn(m)}>`;
    const e = new Error(`mallen ${mallNamn(m)} finns inte i kontot — kör mallsteget först.`);
    e.kod = 'MALL_SAKNAS';
    throw e;
  };

  // 5. kampanjer ---------------------------------------------------------------
  if (kor('kampanjer')) {
    for (const k of manifest.kampanjer ?? []) {
      try {
        const m = mejlPaId(k.mejl_id);
        if (!m) throw Object.assign(new Error(`mejlet "${k.mejl_id}" finns inte i manifestet`), { kod: 'MEJL_SAKNAS' });
        if (!amne(m, 0)) throw Object.assign(new Error('ämnesrad A saknas'), { kod: 'AMNE_SAKNAS' });
        if (!k.segment?.length) throw Object.assign(new Error('kampanjen har inget segment att gå till'), { kod: 'PUBLIK_SAKNAS' });
        if (k.planerad && Date.parse(k.planerad) < nu().getTime()) r.varningar.push(`${k.namn}: planerad tid ${k.planerad} har redan passerat — Klaviyo kan neka schemat, sätt ny tid i Klaviyo.`);
        const inkludera = [];
        for (const s of k.segment) inkludera.push(await publikId(s, { inkludera: true }));
        const exkludera = [];
        for (const s of k.exkludera ?? []) exkludera.push(await publikId(s, { inkludera: false }));
        const tplId = await mallIdFor(m);
        const kropp = kampanjKropp({ kampanj: k, mejl: m, brand, inkludera, exkludera });

        const f = await finns('campaign', k.namn);
        let kampanjId;
        let meddelandeId;
        if (f) {
          const status = f.attributes?.status ?? (f.franMinnet ? 'okänd (ur minnet)' : 'okänd');
          if (!uppdatera) { hoppa('kampanj', k.namn, `finns redan (${f.id}, ${status})`); abRad(r, k, m); continue; }
          if (status !== 'Draft') { hoppa('kampanj', k.namn, `finns (${f.id}) men status är ${status}, inte Draft — rörs aldrig`); continue; }
          kampanjId = f.id;
          const a = kropp.data.attributes;
          await skriv('kampanj', k.namn, 'PATCH', `/api/campaigns/${kampanjId}`, { data: { type: 'campaign', id: kampanjId, attributes: { name: a.name, audiences: a.audiences, send_strategy: a.send_strategy, send_options: a.send_options, tracking_options: a.tracking_options } } }, 'uppdaterad');
          meddelandeId = await meddelandeFor(klient, kampanjId, skarpt);
          await skriv('kampanjmeddelande', k.namn, 'PATCH', `/api/campaign-messages/${meddelandeId}`, { data: { type: 'campaign-message', id: meddelandeId, attributes: { definition: a['campaign-messages'].data[0].attributes.definition } } }, 'uppdaterad');
        } else {
          const svar = await skriv('kampanj', k.namn, 'POST', '/api/campaigns', kropp);
          kampanjId = svar.data.id;
          meddelandeId = svar.data.relationships?.['campaign-messages']?.data?.[0]?.id ?? await meddelandeFor(klient, kampanjId, skarpt);
        }
        await skriv('kampanjmall', k.namn, 'POST', '/api/campaign-message-assign-template', {
          data: { type: 'campaign-message', id: meddelandeId, relationships: { template: { data: { type: 'template', id: tplId } } } },
        }, 'uppdaterad');
        if (k.status_plan === 'kraver-axel') r.varningar.push(`${k.namn}: kräver Axel — ${k.kraver_axel ?? 'orsak saknas i kampanjfilen'}`);
        abRad(r, k, m);
      } catch (e) { stoppa('kampanj', k.namn, e); }
    }
  }

  // 6. flöden ------------------------------------------------------------------
  if (kor('floden')) {
    for (const fl of manifest.floden ?? []) {
      try {
        if (!(fl.filter ?? []).includes('samtycke')) {
          throw Object.assign(new Error('flödets filter saknar "samtycke" — varje marknadsflöde kräver samtyckesvillkoret i profile_filter (järnregel 2)'), { kod: 'SAMTYCKE_SAKNAS' });
        }
        const f = await finns('flow', fl.namn);
        if (f) { hoppa('flode', fl.namn, `finns redan (${f.id}) — flöden skrivs aldrig över, ändra i Klaviyo eller byt versionsnummer`); continue; }
        let trigger;
        const t = fl.trigger ?? {};
        if (t.typ === 'metrik') {
          const namn = Array.isArray(t.metrik) ? t.metrik : [t.metrik];
          trigger = { type: 'metric', id: metriker ? metrikId(metriker, namn) : `<metrik:${namn[0]}>` };
        } else if (t.typ === 'lista') {
          trigger = { type: 'list', id: await sakraLista(t.lista) };
        } else if (t.typ === 'segment') {
          trigger = { type: 'segment', id: await publikId(t.segment, { inkludera: false }) };
        } else throw Object.assign(new Error(`okänd trigger ${JSON.stringify(t)}`), { kod: 'TRIGGER_OKAND' });
        const filterDef = profilFilter(fl.filter, ids);
        // Mallarna först (async), sedan definitionen (sync).
        const mallar = {};
        for (const s of fl.steg ?? []) {
          if (s.typ !== 'mejl') continue;
          const m = mejlPaId(s.mejl_id ?? s.mejl?.id);
          if (m) mallar[m.id] = await mallIdFor(m);
        }
        const definition = flodesDefinition({ flode: fl, trigger, filterDef, mejlPaId, mallIdPaMejl: (m) => mallar[m.id], brand });
        await skriv('flode', fl.namn, 'POST', '/api/flows', { data: { type: 'flow', attributes: { name: fl.namn, definition } } });
      } catch (e) { stoppa('flode', fl.namn, e); }
    }
  }

  // 7. minnet ------------------------------------------------------------------
  r.slut = nu().toISOString();
  if (skarpt) {
    fs.mkdirSync(kontoDir, { recursive: true });
    const lageFil = path.join(kontoDir, 'lage.json');
    let lage = {};
    try { lage = JSON.parse(fs.readFileSync(lageFil, 'utf8')); } catch { lage = {}; }
    lage.senaste_uppladdning = { tid: r.slut, bara, skapade: r.skapade.length, uppdaterade: r.uppdaterade.length, hoppade: r.hoppade.length, stopp: r.stopp.map((s) => `${s.typ} ${s.namn}: ${s.orsak}`) };
    fs.writeFileSync(lageFil, JSON.stringify(lage, null, 2) + '\n');
  }
  return r;
}

function abRad(r, k, m) {
  const b = amne(m, 1);
  const c = amne(m, 2);
  if (!b && !c) return;
  r.ab.push(`${k.namn}: lägg in som A/B-test i Klaviyo — A "${amne(m, 0)}"${b ? `, B "${b}"` : ''}${c ? `, C "${c}"` : ''}`);
}

async function meddelandeFor(klient, kampanjId, skarpt) {
  if (!skarpt || !klient) return `<meddelande:${kampanjId}>`;
  const svar = await klient.get(`/api/campaigns/${kampanjId}/campaign-messages`);
  const id = svar?.data?.[0]?.id;
  if (!id) throw Object.assign(new Error(`kampanjen ${kampanjId} har inget meddelande i Klaviyo`), { kod: 'MEDDELANDE_SAKNAS' });
  return id;
}

// ------------------------------------------------------------------ utskrift

export function rapportText(r) {
  const rad = [];
  rad.push(`Klaviyo-uppladdning ${r.brand} — ${r.skarpt ? 'SKARPT (allt som utkast)' : 'TORRT, inget skrevs'}${r.bara ? `, bara ${r.bara}` : ''}`);
  if (r.konto) rad.push(`Kontot: ${r.konto.public_api_key} (${r.konto.id}) ✅`);
  for (const v of r.varningar) rad.push(`⚠️ ${v}`);
  rad.push('');
  rad.push(...r.plan.map((p) => `  ${p}`));
  rad.push('');
  if (r.skarpt) rad.push(`Skapade: ${r.skapade.length} · uppdaterade: ${r.uppdaterade.length} · hoppade: ${r.hoppade.length} · stoppade: ${r.stopp.length}`);
  else rad.push(`Skulle skapas: ${r.plan.filter((p) => p.startsWith('SKAPA ')).length} · skulle uppdateras: ${r.plan.filter((p) => p.startsWith('UPPDATERA ')).length} · hoppas: ${r.hoppade.length} · stoppas: ${r.stopp.length}`);
  if (r.stopp.length) { rad.push('', 'Stoppade:'); for (const s of r.stopp) rad.push(`  ❌ ${s.typ} ${s.namn}: ${s.orsak}`); }
  if (r.ab.length) { rad.push('', 'Ämnesrad B och C (API:t skapar inte A/B-test säkert — lägg in för hand):'); for (const a of r.ab) rad.push(`  ${a}`); }
  if (!r.skarpt && Object.keys(r.exempel).length) {
    rad.push('', 'Exakt JSON-kropp, första av varje sort:');
    for (const [sort, kropp] of Object.entries(r.exempel)) rad.push(`--- ${sort}`, JSON.stringify(kropp, null, 2));
  }
  return rad.join('\n');
}

// ------------------------------------------------------------------ CLI

function args(argv) {
  const a = { brand: 'baverbutiken', skarpt: false, bara: null, uppdatera: false, manifest: null };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--brand') a.brand = argv[++i];
    else if (x === '--skarpt') a.skarpt = true;
    else if (x === '--torr') a.skarpt = false;
    else if (x === '--bara') a.bara = argv[++i];
    else if (x === '--uppdatera') a.uppdatera = true;
    else if (x === '--manifest') a.manifest = argv[++i];
    else throw new Error(`Okänt argument: ${x}`);
  }
  return a;
}

export function lasBrand(id) {
  const fil = path.join(HAR, 'brands', `${id}.json`);
  if (!fs.existsSync(fil)) throw new Error(`Brandfilen ${path.relative(process.cwd(), fil)} finns inte.`);
  return JSON.parse(fs.readFileSync(fil, 'utf8'));
}

async function main() {
  const a = args(process.argv.slice(2));
  const brand = lasBrand(a.brand);
  const nyckel = nyckelFranEnv(brand);
  if (a.skarpt && !nyckel) {
    console.error(`Skarp uppladdning kräver nyckeln ${brand.nyckel_env.join(' eller ')} — den saknas. Kör node klaviyo/kolla.mjs för receptet.`);
    process.exit(1);
  }
  if (nyckel) (await import('../mejl/shopify.mjs')).kravProxy();
  const manifestFil = a.manifest ?? path.join(HAR, 'output', brand.id, 'manifest.json');
  if (!fs.existsSync(manifestFil)) {
    console.error(`Manifestet ${path.relative(process.cwd(), manifestFil)} finns inte — kör node klaviyo/bygg.mjs först.`);
    process.exit(1);
  }
  const manifest = laddaInnehall(JSON.parse(fs.readFileSync(manifestFil, 'utf8')), path.dirname(manifestFil));
  const klient = nyckel ? new KlaviyoKlient({ nyckel: nyckel.nyckel, logg: (t) => console.error(t) }) : null;
  const kontoDir = path.join(HAR, 'konto', brand.id);
  let r;
  try {
    r = await laddaUpp({ brand, manifest, klient, skarpt: a.skarpt, bara: a.bara, uppdatera: a.uppdatera, kontoDir });
  } catch (e) {
    console.error(e instanceof KlaviyoFel || e.kod ? `STOPP: ${e.message}` : e.stack);
    process.exit(2);
  }
  const text = rapportText(r);
  console.log(text);
  const ut = path.join(HAR, 'output', brand.id);
  fs.mkdirSync(ut, { recursive: true });
  fs.writeFileSync(path.join(ut, `uppladdning-${r.skarpt ? 'skarpt' : 'torr'}.json`), JSON.stringify(r, null, 2) + '\n');
  process.exit(r.stopp.length ? 1 : 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
