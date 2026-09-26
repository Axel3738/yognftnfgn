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
import { segmentLista, segmentPaNamn, profilFilter, kravSamtycke } from './segment.mjs';

const HAR = path.dirname(fileURLToPath(import.meta.url));

/** Dygnstak ur specen (rate limits "Daily"). Räknas rullande 24 h i uppladdat.jsonl. */
export const DYGNSTAK = { segment: 100, flode: 100 };
/** Metrikerna som betyder att kunden har köpt — bara de bär kundundantaget. */
const KOPTRIGGRAR = ['Placed Order', 'Fulfilled Order'];

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

/** Minsta marginal mellan nu och en planerad sändtid. Ett datum närmare än så är i praktiken passerat. */
export const PLAN_MARGINAL_MIN = 60;

/**
 * Kampanjens planerade tid → UTC-ISO, eller ett fel med orsak. Aldrig tomt:
 * utan send_strategy sätter Klaviyo "Immediate" (specen, CampaignCreateQuery).
 * Ett passerat datum skapas inte — kampanjen stoppas och säger hur den räddas.
 */
export function planeradTid(kampanj, nu, mall = null) {
  const fel = (kod, text) => Object.assign(new Error(text), { kod });
  if (!kampanj.planerad) throw fel('PLANERAD_SAKNAS', 'kampanjfilen saknar "planerad" — utan tid blir kampanjen "skicka direkt" i Klaviyo. Sätt en tid och bygg om.');
  const t = Date.parse(kampanj.planerad);
  if (!Number.isFinite(t)) throw fel('PLANERAD_OGILTIG', `"planerad" (${kampanj.planerad}) är inget giltigt datum.`);
  if (t < nu.getTime() + PLAN_MARGINAL_MIN * 60000) {
    throw fel('PLANERAD_PASSERAD', `planerad tid ${kampanj.planerad} har passerat (eller är under ${PLAN_MARGINAL_MIN} min bort) — kampanjen skapas inte. Mallen${mall ? ` ${mall}` : ''} laddas upp ändå. Sätt ny tid i kampanjfilen och kör bygg + ladda-upp igen (Axels beslut om kampanjen ska gå alls).`);
  }
  return new Date(t).toISOString();
}

/** ReentryCriteria (spec): unit day|hour|week|alltime. Vid alltime betyder duration 1 "aldrig igen", 0 "får gå in igen". */
const ENHET_ATER = { day: 'day', days: 'day', dag: 'day', dagar: 'day', hour: 'hour', hours: 'hour', timme: 'hour', timmar: 'hour', week: 'week', weeks: 'week', vecka: 'week', veckor: 'week', alltime: 'alltime' };
export function aterintrade(flode) {
  const a = flode.ateintrade;
  if (!a) return null;
  const unit = ENHET_ATER[a.enhet];
  if (!unit) throw new Error(`Flödet ${flode.namn}: okänd enhet för återinträde "${a.enhet}" (day, hour, week, alltime).`);
  if (unit === 'alltime') return { duration: 1, unit };
  if (!Number.isInteger(a.varaktighet) || a.varaktighet < 1) throw new Error(`Flödet ${flode.namn}: återinträdets varaktighet måste vara ett heltal ≥ 1 (fick ${a.varaktighet}).`);
  return { duration: a.varaktighet, unit };
}

/**
 * Placed Orders egenskap med produktnamnen. Mätt 2026-09-25 i kontot QZ4jLG
 * (`kolla.mjs --prov` + tre riktiga händelser): Shopify-integrationen skickar
 * `Items`, en lista med hela produkttitlar ("Taköverdrag Husvagn – Skyddar Den
 * Dyraste Ytan"). `ItemNames`, som stod här förut, finns inte i kontot — ett flöde
 * på det fältet hade aldrig triggat.
 */
export const ORDER_PRODUKTFALT = 'Items';

/** Segmentkön (mätt 2026-09-25): 5 åt gången i Klaviyo, sedan 400. */
export const SEGMENTKO_FORSOK = 10;
export const SEGMENTKO_PAUS_MS = 30_000;

/**
 * `trigger.produkt_innehaller` → MetricTrigger.trigger_filter (spec 2026-07-15):
 * condition_groups[{ conditions: [MetricPropertyCondition { type: 'metric-property',
 * metric_id, field, filter: ListContainsOperatorListContainsFilter { type: 'list',
 * operator: 'contains', value } }] }]. Villkoren i en grupp är OR.
 *
 * Listfiltret matchar ett HELT element, inte en delsträng — "Marin Motorhölje"
 * träffar aldrig "Marin Motorhölje 420D – Universellt Skydd". Därför slås varje ord
 * upp mot Shopify-titlarna (bygg.mjs → produkter.json) och ett villkor skrivs per
 * hel titel. Utan produktdata skickas orden som de står, med en varning.
 */
export function produktTriggerFilter({ metricId, ord, produkter = null }) {
  const lista = [].concat(ord ?? []).map((o) => String(o).trim()).filter(Boolean);
  if (!lista.length) throw Object.assign(new Error('produkt_innehaller är tom.'), { kod: 'TRIGGER_OKAND' });
  const varningar = [];
  let titlar;
  if (Array.isArray(produkter) && produkter.length) {
    titlar = [];
    for (const o of lista) {
      const traff = produkter.map((p) => p.titel ?? p.title).filter((t) => t && t.toLocaleLowerCase('sv-SE').includes(o.toLocaleLowerCase('sv-SE')));
      if (!traff.length) throw Object.assign(new Error(`produkt_innehaller "${o}" matchar ingen produkttitel i Shopify-datan — flödet skulle aldrig starta.`), { kod: 'PRODUKT_OKAND' });
      titlar.push(...traff);
    }
    titlar = [...new Set(titlar)];
  } else {
    titlar = lista;
    varningar.push(`Ingen produktdata bredvid manifestet: trigger_filter matchar exakt ${lista.map((x) => `"${x}"`).join(', ')} i ${ORDER_PRODUKTFALT}, som bär HELA produkttitlar. Kör bygg.mjs så titlarna slås upp.`);
  }
  return {
    trigger_filter: { condition_groups: [{ conditions: titlar.map((t) => ({ type: 'metric-property', metric_id: metricId, field: ORDER_PRODUKTFALT, filter: { type: 'list', operator: 'contains', value: t } })) }] },
    titlar,
    varningar,
  };
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
  const reentry = aterintrade(flode);
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
export async function laddaUpp({ brand, manifest, klient = null, skarpt = false, bara = null, uppdatera = false, kontoDir, produkter = null, nu = () => new Date(), logg = () => {}, sov = (ms) => new Promise((ok) => setTimeout(ok, ms)) }) {
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
    // Senaste raden om namnet vinner: "raderad" (stada.mjs) betyder borta.
    const kant = [...minne].reverse().find((m) => m.namn === namn && m.id);
    return kant && kant.atgard !== 'raderad' ? { id: kant.id, attributes: { name: namn }, franMinnet: true } : null;
  };
  /**
   * Ett objekt med motorns namn som motorn inte skapat (saknas i uppladdat.jsonl):
   * det hoppas som vanligt, men sessionen får veta det. Annars ser ett gammalt
   * handbyggt flöde "Välkomst" ut som motorns eget, och motorns skapas aldrig.
   */
  const frammande = (typ, namn, f) => {
    if (!f || f.franMinnet || !klient) return;
    if (minne.some((m) => m.id === f.id)) return;
    r.varningar.push(`${typ} "${namn}" finns redan i Klaviyo (${f.id}) men skapades inte av motorn enligt uppladdat.jsonl — motorn rör det inte. Kontrollera i Klaviyo att det är rätt objekt, eller döp om.`);
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
    const u = metrikIdsUr(metriker, brand.metrik_val);
    ids = u.ids;
    for (const s of u.saknas) r.varningar.push(`Metrik ${s.nyckel}: ${s.orsak}`);
    for (const t of u.tvetydiga ?? []) r.varningar.push(t);
  } else {
    ids = platshallarIds();
    r.varningar.push('Torrkörning utan nyckel: inget är kontrollerat mot kontot, id:n är platshållare.');
  }

  // 2. listor ------------------------------------------------------------------
  // Prenumerantlistan heter LISTA_nyhetsbrev om brandfilen inte säger annat.
  // Matstrumpor (2026-09-25) bär `lista_nyhetsbrev: "Email List"` — Shopify-synkens
  // egen lista i det kontot, 2 891 profiler — så motorn skapar ingen tom dubblett.
  const listaNyhetsbrev = brand.lista_nyhetsbrev ?? LISTA_NYHETSBREV;
  const listIds = {};
  const sakraLista = async (namn) => {
    if (listIds[namn]) return listIds[namn];
    const f = await finns('list', namn);
    if (f) { listIds[namn] = f.id; return f.id; }
    const svar = await skriv('lista', namn, 'POST', '/api/lists', { data: { type: 'list', attributes: { name: namn, opt_in_process: 'single_opt_in' } } });
    listIds[namn] = svar.data.id;
    r.varningar.push(`Listan ${namn} är ny och tom. Shopifys prenumeranter hamnar i den lista som är vald i Klaviyo → Integrations → Shopify → "Sync email subscribers to Klaviyo" — välj ${namn} där, annars får flöden som startar på listan inga mottagare.`);
    return svar.data.id;
  };
  if (!bara) {
    try { await sakraLista(listaNyhetsbrev); } catch (e) { stoppa('lista', listaNyhetsbrev, e); }
  }

  // 3. segment -----------------------------------------------------------------
  const segIds = {};
  const segSkapadeNu = new Set();
  const segVerifierade = new Set();
  if (kor('segment')) {
    for (const s of segmentLista(brand)) {
      try {
        const saknade = s.metriker.filter((k) => !ids[k]);
        if (saknade.length) { hoppa('segment', s.namn, `metriken ${saknade.map((k) => KANDA_METRIKER[k].join('/')).join(', ')} saknas i kontot`); continue; }
        const definition = s.bygg(ids);
        if (s.kampanjOk) kravSamtycke(definition, s.namn);
        const f = await finns('segment', s.namn);
        if (f) { frammande('segment', s.namn, f); segIds[s.namn] = f.id; hoppa('segment', s.namn, `finns redan (${f.id})`); continue; }
        // Mätt 2026-09-25 i kontot QZ4jLG: Klaviyo bearbetar högst 5 nya segment åt
        // gången och svarar 400 "segment processing limit (5)" på det sjätte. Vänta
        // på att de förra blir klara och försök igen, i stället för att stoppa.
        let svar;
        for (let forsok = 1; ; forsok++) {
          try {
            svar = await skriv('segment', s.namn, 'POST', '/api/segments', { data: { type: 'segment', attributes: { name: s.namn, definition } } });
            break;
          } catch (e) {
            if (!(e.status === 400 && /segment processing limit/i.test(e.message)) || forsok >= SEGMENTKO_FORSOK) throw e;
            logg(`Klaviyo bearbetar redan 5 segment — väntar ${SEGMENTKO_PAUS_MS / 1000} s innan ${s.namn} (försök ${forsok} av ${SEGMENTKO_FORSOK}).`);
            await sov(SEGMENTKO_PAUS_MS);
          }
        }
        segIds[s.namn] = svar.data.id;
        segSkapadeNu.add(s.namn);
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
    const bib = segmentPaNamn(namn, brand);
    if (inkludera && bib && !bib.kampanjOk) {
      const e = new Error(`segmentet "${namn}" är bara för exkludering och sunset, aldrig en kampanjpublik.`);
      e.kod = 'SEGMENT_EJ_KAMPANJ';
      throw e;
    }
    if (inkludera && bib) kravSamtycke(bib.bygg(ids), namn);
    // Ett segment som redan fanns i Klaviyo kontrolleras på sin RIKTIGA definition,
    // även när namnet finns i segment.mjs: någon kan ha byggt det för hand eller
    // ändrat det i Klaviyo. Bara det som skapades i den här körningen är känt.
    const verifiera = async (id) => {
      if (!inkludera || !klient || segSkapadeNu.has(namn) || segVerifierade.has(id) || String(id).startsWith('TORR-')) return;
      const full = await klient.get(`/api/segments/${id}`, { 'fields[segment]': 'definition,name' });
      kravSamtycke(full?.data?.attributes?.definition, namn);
      segVerifierade.add(id);
    };
    if (segIds[namn]) { await verifiera(segIds[namn]); return segIds[namn]; }
    const f = await finns('segment', namn);
    if (f) {
      await verifiera(f.id);
      segIds[namn] = f.id;
      return f.id;
    }
    if (!skarpt) return `<segment:${namn}>`;
    const saknadMetrik = bib ? bib.metriker.filter((x) => !ids[x]) : [];
    const e = new Error(`segmentet "${namn}" finns inte i kontot${saknadMetrik.length ? ` — det kan inte byggas förrän metriken ${saknadMetrik.map((x) => KANDA_METRIKER[x].join('/')).join(', ')} finns i kontot` : bib ? ' — kör segmentsteget först (utan --bara, eller --bara segment)' : ' och inte i segment.mjs'}.`);
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
          frammande('mall', namn, f);
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
        const f = await finns('campaign', k.namn);
        frammande('kampanj', k.namn, f);
        const status = f ? (f.attributes?.status ?? (f.franMinnet ? 'okänd (ur minnet)' : 'okänd')) : null;
        if (f && !uppdatera) {
          // Avbruten körning: kampanjen skapades men mallen hann inte kopplas. Koppla nu.
          if (status === 'Draft' && klient && skarpt) {
            const msg = await klient.get(`/api/campaigns/${f.id}/campaign-messages`, { include: 'template' });
            const med = msg?.data?.[0];
            if (med && !med.relationships?.template?.data?.id) {
              const tplId = await mallIdFor(m);
              await skriv('kampanjmall', k.namn, 'POST', '/api/campaign-message-assign-template', {
                data: { type: 'campaign-message', id: med.id, relationships: { template: { data: { type: 'template', id: tplId } } } },
              }, 'uppdaterad');
              abRad(r, k, m);
              continue;
            }
          }
          hoppa('kampanj', k.namn, `finns redan (${f.id}, ${status})`); abRad(r, k, m); continue;
        }
        if (f && status !== 'Draft') { hoppa('kampanj', k.namn, `finns (${f.id}) men status är ${status}, inte Draft — rörs aldrig`); continue; }
        const planerad = planeradTid(k, nu(), mallNamn(m));
        const inkludera = [];
        for (const s of k.segment) inkludera.push(await publikId(s, { inkludera: true }));
        const exkludera = [];
        for (const s of k.exkludera ?? []) exkludera.push(await publikId(s, { inkludera: false }));
        const tplId = await mallIdFor(m);
        const kropp = kampanjKropp({ kampanj: { ...k, planerad }, mejl: m, brand, inkludera, exkludera });

        let kampanjId;
        let meddelandeId;
        if (f) {
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
        const filt = fl.filter ?? [];
        if (filt.includes('kundundantag')) {
          // Kundundantaget gäller bara den som köpt: triggern måste vara ett köp (lagd eller
          // skickad order) — eller ett köparsegment (`kopare: true` i segment.mjs), där varje
          // medlem per definition har köpt (recensionsflödet, Axels beslut B 2026-09-26).
          const tm = fl.trigger?.typ === 'metrik' ? [fl.trigger.metrik].flat() : [];
          const koptrigger = tm.length > 0 && tm.every((x) => KOPTRIGGRAR.includes(x));
          const koparsegment = fl.trigger?.typ === 'segment' && segmentPaNamn(fl.trigger.segment, brand)?.kopare === true;
          if (filt.includes('samtycke') || !(koptrigger || koparsegment)) {
            throw Object.assign(new Error('"kundundantag" går bara i ett flöde som triggas av ett köp (Placed Order eller Fulfilled Order) eller av ett köparsegment (kopare: true i segment.mjs), och aldrig tillsammans med "samtycke" (MFL 19 § andra stycket)'), { kod: 'UNDANTAG_FEL' });
          }
        } else if (!filt.includes('samtycke')) {
          throw Object.assign(new Error('flödets filter saknar "samtycke" — varje marknadsflöde kräver samtyckesvillkoret i profile_filter (järnregel 2)'), { kod: 'SAMTYCKE_SAKNAS' });
        }
        const f = await finns('flow', fl.namn);
        frammande('flode', fl.namn, f);
        if (f) { hoppa('flode', fl.namn, `finns redan (${f.id}) — flöden skrivs aldrig över, ändra i Klaviyo eller byt versionsnummer`); continue; }
        let trigger;
        const t = fl.trigger ?? {};
        if (t.produkt_innehaller && t.typ !== 'metrik') throw Object.assign(new Error('produkt_innehaller går bara på en metrik-trigger'), { kod: 'TRIGGER_OKAND' });
        if (t.typ === 'metrik') {
          const namn = Array.isArray(t.metrik) ? t.metrik : [t.metrik];
          trigger = { type: 'metric', id: metriker ? metrikId(metriker, namn, brand.metrik_val) : `<metrik:${namn[0]}>` };
          if (t.produkt_innehaller) {
            const pf = produktTriggerFilter({ metricId: trigger.id, ord: t.produkt_innehaller, produkter });
            trigger.trigger_filter = pf.trigger_filter;
            for (const v of pf.varningar) r.varningar.push(`${fl.namn}: ${v}`);
            r.varningar.push(`${fl.namn}: triggar bara på ordrar där ${ORDER_PRODUKTFALT} innehåller ${pf.titlar.map((x) => `"${x}"`).join(' eller ')}. Fältnamnet ${ORDER_PRODUKTFALT} är mätt i kontot 2026-09-25; titeln måste matcha Shopify-titeln exakt, så byts produktens namn i Shopify triggar flödet inte längre.`);
          }
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
  // Shopify-titlarna (bygg.mjs skriver dem bredvid manifestet) — för produkt_innehaller.
  const produktFil = path.join(path.dirname(manifestFil), 'produkter.json');
  let produkter = null;
  try { produkter = JSON.parse(fs.readFileSync(produktFil, 'utf8')); } catch { produkter = null; }
  const klient = nyckel ? new KlaviyoKlient({ nyckel: nyckel.nyckel, logg: (t) => console.error(t) }) : null;
  const kontoDir = path.join(HAR, 'konto', brand.id);
  let r;
  try {
    r = await laddaUpp({ brand, manifest, klient, skarpt: a.skarpt, bara: a.bara, uppdatera: a.uppdatera, kontoDir, produkter });
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
