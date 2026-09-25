// Segmenten som kod → Klaviyos segmentdefinition, flödesfiltren och samtyckesspärren.
//
// Fältnamnen följer OpenAPI-specen 2026-07-15 (components.schemas):
//   SegmentDefinition { condition_groups: [ConditionGroup { conditions: [...] }] }
//     — grupperna AND, villkoren i en grupp OR.
//   ProfileMarketingConsentCondition { type: 'profile-marketing-consent',
//     consent: HasEmailMarketingConsent { channel: 'email', can_receive_marketing: true,
//       consent_status: HasEmailMarketingSubscribed { subscription: 'subscribed' } } }
//   SegmentsProfileMetricCondition / FlowsProfileMetricCondition { type: 'profile-metric',
//     metric_id, measurement: 'count'|'sum',
//     measurement_filter: NumericOperatorNumericFilter { type: 'numeric', operator, value },
//     timeframe_filter: AlltimeDateFilter { type: 'date', operator: 'alltime' }
//                     | RelativeDateOperatorBaseRelativeDateFilter { type: 'date', operator: 'in-the-last', unit, quantity }
//                     | SinceFlowStartDateFilter { type: 'date', operator: 'flow-start' }  (bara i flöden),
//     metric_filters: [ProfileMetricPropertyFilter { property, filter: StringOperatorStringFilter { type: 'string', operator, value } }] }
//   ProfileNotInFlowCondition { type: 'profile-not-in-flow', timeframe_filter: InTheLastBaseRelativeDateFilter }
//
// Samtycke (järnregel 2): varje segment en KAMPANJ får gå till har en egen grupp
// med bara samtyckesvillkoret. "subscription: any" släpper in de som aldrig
// prenumererat (HasEmailMarketing i specen) — därför alltid "subscribed".

/**
 * Produktorden per kategori. Ett villkor per ord, OR inom gruppen: köpt en produkt
 * vars namn innehåller något av orden. Ändra här — ingen annanstans.
 *
 * ⚠️ Obekräftat (mäts av `kolla.mjs --prov`, som listar Ordered Products egenskaper):
 *   1. egenskapens namn (`PRODUKTNAMN_EGENSKAP`) i Shopify-integrationens Ordered Product,
 *   2. om `contains` skiljer på versaler. Därför läggs ordet in två gånger när det
 *      börjar med gemen: "taköverdrag" OCH "Taköverdrag".
 */
export const KATEGORIER = {
  husvagn_husbil: ['taköverdrag', 'termoskydd'],
  bat_marin: ['motorhölje', 'båtmotorskydd', 'fiskespöhållare', 'båtsits', 'förtöjning'],
  tradgard: ['axelbälte', 'trimmer', 'åkgräsklippare'],
  hus_hem: ['sotarset', 'övervakningskamera', 'solcellslampa'],
};

// Mätt 2026-09-25 i kontot QZ4jLG: Ordered Product bär produkttiteln i `Name`
// (ingen `ProductName` finns bland egenskaperna).
export const PRODUKTNAMN_EGENSKAP = 'Name';

// ------------------------------------------------------------------ byggstenar

export function samtyckeVillkor() {
  return {
    type: 'profile-marketing-consent',
    consent: {
      channel: 'email',
      can_receive_marketing: true,
      consent_status: { subscription: 'subscribed' },
    },
  };
}

/**
 * Kundundantaget (MFL 19 § andra stycket, Axels beslut B 2026-09-25): den som KÖPT
 * får mejl om butikens egna liknande produkter utan uttryckligt ja, så länge hen
 * inte tackat nej. "any" släpper in de som aldrig prenumererat men aldrig de
 * avregistrerade eller spärrade (can_receive_marketing: true). Bara i flöden som
 * triggas av ett köp — aldrig i en kampanj (ladda-upp.mjs stoppar det).
 */
export function kundundantagVillkor() {
  return {
    type: 'profile-marketing-consent',
    consent: {
      channel: 'email',
      can_receive_marketing: true,
      consent_status: { subscription: 'any', filters: null },
    },
  };
}

const OPERATOR = { '>=': 'greater-than-or-equal', '=': 'equals', '>': 'greater-than', '<': 'less-than', '<=': 'less-than-or-equal', '!=': 'not-equals' };

/** tid: 'alltid' | 'flodesstart' | { dagar: N } */
function tidsram(tid) {
  if (tid === 'alltid') return { type: 'date', operator: 'alltime' };
  if (tid === 'flodesstart') return { type: 'date', operator: 'flow-start' };
  if (tid && Number.isInteger(tid.dagar)) return { type: 'date', operator: 'in-the-last', unit: 'day', quantity: tid.dagar };
  throw new Error(`Okänd tidsram: ${JSON.stringify(tid)}`);
}

function kravId(metrikIds, nyckel) {
  const id = metrikIds?.[nyckel];
  if (!id) {
    const e = new Error(`Metriken "${nyckel}" saknas i kontot — villkoret går inte att bygga.`);
    e.kod = 'METRIK_SAKNAS';
    e.metrik = nyckel;
    throw e;
  }
  return id;
}

export function metrikVillkor(metrikIds, nyckel, op, varde, tid, metricFilters = null) {
  const v = {
    type: 'profile-metric',
    metric_id: kravId(metrikIds, nyckel),
    measurement: 'count',
    measurement_filter: { type: 'numeric', operator: OPERATOR[op] ?? op, value: varde },
    timeframe_filter: tidsram(tid),
  };
  if (metricFilters) v.metric_filters = metricFilters;
  return v;
}

/** Ordet som det står i tabellen, plus versal första bokstav om ordet börjar med gemen. */
export function ordVarianter(ord) {
  const stor = ord.charAt(0).toLocaleUpperCase('sv-SE') + ord.slice(1);
  return [...new Set([ord, stor])];
}

const grupp = (...conditions) => ({ conditions });
const SAMTYCKE = () => grupp(samtyckeVillkor());

function engagerade(ids, dagar) {
  const t = { dagar };
  return {
    condition_groups: [
      SAMTYCKE(),
      grupp(
        metrikVillkor(ids, 'opened_email', '>=', 1, t),
        metrikVillkor(ids, 'clicked_email', '>=', 1, t),
        metrikVillkor(ids, 'active_on_site', '>=', 1, t),
        metrikVillkor(ids, 'placed_order', '>=', 1, t),
      ),
    ],
  };
}

function kategoriSegment(namn, ord) {
  return {
    namn: `SEG_kategori_${namn}`,
    kampanjOk: true,
    metriker: ['ordered_product'],
    bygg: (ids) => ({
      condition_groups: [
        SAMTYCKE(),
        grupp(...ord.flatMap(ordVarianter).map((o) => metrikVillkor(ids, 'ordered_product', '>=', 1, 'alltid', [
          { property: PRODUKTNAMN_EGENSKAP, filter: { type: 'string', operator: 'contains', value: o } },
        ]))),
      ],
    }),
  };
}

/** Segmenten i ARKITEKTUR.md-tabellen utom kategorierna. `metriker` = vilka metriker bygget kräver. */
export const SEGMENT_BAS = [
  { namn: 'SEG_samtycke', kampanjOk: true, metriker: [], bygg: () => ({ condition_groups: [SAMTYCKE()] }) },
  {
    namn: 'SEG_uppvarmning_steg1', kampanjOk: true, metriker: ['placed_order', 'active_on_site', 'opened_email', 'clicked_email'],
    bygg: (ids) => ({
      condition_groups: [
        SAMTYCKE(),
        grupp(
          metrikVillkor(ids, 'placed_order', '>=', 1, { dagar: 30 }),
          metrikVillkor(ids, 'active_on_site', '>=', 1, { dagar: 30 }),
          metrikVillkor(ids, 'opened_email', '>=', 1, { dagar: 30 }),
          metrikVillkor(ids, 'clicked_email', '>=', 1, { dagar: 30 }),
        ),
      ],
    }),
  },
  { namn: 'SEG_engagerade_60d', kampanjOk: true, metriker: ['opened_email', 'clicked_email', 'active_on_site', 'placed_order'], bygg: (ids) => engagerade(ids, 60) },
  { namn: 'SEG_engagerade_90d', kampanjOk: true, metriker: ['opened_email', 'clicked_email', 'active_on_site', 'placed_order'], bygg: (ids) => engagerade(ids, 90) },
  { namn: 'SEG_kopare', kampanjOk: true, metriker: ['placed_order'], bygg: (ids) => ({ condition_groups: [SAMTYCKE(), grupp(metrikVillkor(ids, 'placed_order', '>=', 1, 'alltid'))] }) },
  { namn: 'SEG_kopare_30d', kampanjOk: true, metriker: ['placed_order'], bygg: (ids) => ({ condition_groups: [SAMTYCKE(), grupp(metrikVillkor(ids, 'placed_order', '>=', 1, { dagar: 30 }))] }) },
  { namn: 'SEG_ej_kopt', kampanjOk: true, metriker: ['placed_order'], bygg: (ids) => ({ condition_groups: [SAMTYCKE(), grupp(metrikVillkor(ids, 'placed_order', '=', 0, 'alltid'))] }) },
  { namn: 'SEG_flerkopare', kampanjOk: true, metriker: ['placed_order'], bygg: (ids) => ({ condition_groups: [SAMTYCKE(), grupp(metrikVillkor(ids, 'placed_order', '>=', 2, 'alltid'))] }) },
  {
    namn: 'SEG_vinback_90d', kampanjOk: true, metriker: ['placed_order'],
    bygg: (ids) => ({
      condition_groups: [
        SAMTYCKE(),
        grupp(metrikVillkor(ids, 'placed_order', '>=', 1, 'alltid')),
        grupp(metrikVillkor(ids, 'placed_order', '=', 0, { dagar: 90 })),
      ],
    }),
  },
  {
    // Bara exkludering och sunset — aldrig en kampanjpublik.
    namn: 'SEG_oengagerade_180d', kampanjOk: false, metriker: ['received_email', 'opened_email', 'clicked_email'],
    bygg: (ids) => ({
      condition_groups: [
        SAMTYCKE(),
        grupp(metrikVillkor(ids, 'received_email', '>=', 5, 'alltid')),
        grupp(metrikVillkor(ids, 'opened_email', '=', 0, { dagar: 180 })),
        grupp(metrikVillkor(ids, 'clicked_email', '=', 0, { dagar: 180 })),
      ],
    }),
  },
];

/** Kategorisegmenten ur en ordtabell ({ kategori: [ord…] }). */
export function kategoriSegmentFor(kategorier) {
  return Object.entries(kategorier ?? {}).map(([namn, ord]) => kategoriSegment(namn, ord));
}

/**
 * Hela segmentlistan för ett brand: basen + brandets kategorier. Utan `kategorier`
 * i brandfilen gäller KATEGORIER (Bäverbutikens ord), så Bäverbutiken beter sig
 * som förut. Matstrumpor bär sina egna ord (sushi, pizza …) — Bäverbutikens
 * ord hade gett fyra segment som aldrig matchar i det kontot (2026-09-25).
 */
export function segmentLista(brand = null) {
  return [...SEGMENT_BAS, ...kategoriSegmentFor(brand?.kategorier ?? KATEGORIER)];
}

/** Bäverbutikens lista (standardkategorierna), samma som segmentLista(null). */
export const SEGMENT = segmentLista(null);

export function segmentPaNamn(namn, brand = null) {
  return segmentLista(brand).find((s) => s.namn === namn) ?? null;
}

// ------------------------------------------------------------------ flödesfilter

/**
 * Filternyckel ur flödesfilen → ETT villkor för flödets profile_filter.
 * Varje nyckel blir en egen grupp i profilFilter (AND mellan dem).
 */
export function filterVillkor(nyckel, metrikIds) {
  switch (nyckel) {
    case 'samtycke': return samtyckeVillkor();
    case 'kundundantag': return kundundantagVillkor();
    case 'ej_kopt_sedan_start': return metrikVillkor(metrikIds, 'placed_order', '=', 0, 'flodesstart');
    case 'ej_checkout_sedan_start': return metrikVillkor(metrikIds, 'started_checkout', '=', 0, 'flodesstart');
    case 'kopt_minst_en_gang': return metrikVillkor(metrikIds, 'placed_order', '>=', 1, 'alltid');
    default: {
      const m = /^ej_i_flodet_(\d+)d$/.exec(nyckel);
      if (m) return { type: 'profile-not-in-flow', timeframe_filter: { type: 'date', operator: 'in-the-last', unit: 'day', quantity: Number(m[1]) } };
      throw new Error(`Okänd filternyckel "${nyckel}". Kända: samtycke, kundundantag, ej_kopt_sedan_start, ej_checkout_sedan_start, ej_i_flodet_7d/_14d/_30d, kopt_minst_en_gang.`);
    }
  }
}

export const FILTERNYCKLAR = ['samtycke', 'kundundantag', 'ej_kopt_sedan_start', 'ej_checkout_sedan_start', 'ej_i_flodet_7d', 'ej_i_flodet_14d', 'ej_i_flodet_30d', 'kopt_minst_en_gang'];

/** Flödets profile_filter ur filternycklarna, eller null om listan är tom. */
export function profilFilter(nycklar, metrikIds) {
  if (!nycklar?.length) return null;
  return { condition_groups: nycklar.map((n) => grupp(filterVillkor(n, metrikIds))) };
}

// ------------------------------------------------------------------ samtyckesspärren

function arSamtycke(v) {
  return v?.type === 'profile-marketing-consent'
    && v.consent?.channel === 'email'
    && v.consent?.can_receive_marketing === true
    && v.consent?.consent_status?.subscription === 'subscribed';
}

/**
 * Sant bara om definitionen har en grupp där VARJE villkor är samtycke med
 * subscription "subscribed". En grupp [samtycke OR något annat] räknas inte —
 * villkoren i en grupp är OR, så den släpper in folk utan samtycke.
 */
export function harSamtycke(definition) {
  return (definition?.condition_groups ?? []).some((g) => (g.conditions ?? []).length > 0 && g.conditions.every(arSamtycke));
}

/** Kastar om ett kampanjsegment saknar samtycke. */
export function kravSamtycke(definition, namn) {
  if (!harSamtycke(definition)) {
    const e = new Error(`STOPP: segmentet "${namn}" saknar samtyckesvillkoret (profile-marketing-consent, email, subscription "subscribed") i en egen grupp. En kampanj får inte gå dit (marknadsföringslagen 19 §, ARKITEKTUR.md järnregel 2).`);
    e.kod = 'SAMTYCKE_SAKNAS';
    throw e;
  }
  return true;
}
