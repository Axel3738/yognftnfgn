// Ren logik utan nät: 17TRACK:s statusar → Shopifys fulfillment-event, svenska
// meddelanden, och planen för vad som ska skrivas in. Testas i test/.
//
// Varför Shopify-event: Shopifys orderstatussida (den Axel såg 2026-09-18,
// "det är ju som vår egen tracker") ritar tidslinjen ur orderns
// fulfillment-events, och notiserna "Ute för leverans" och "Levererad" går
// ut när ett event med den statusen skapas. YunExpress/4PX skickar aldrig
// sådana event (0 av 500 ordrar sedan 15 juni, mätt 2026-09-17), så vi
// hämtar skanningarna via 17TRACK och skriver in dem själva.

// 17TRACK:s bolagskoder (res.17track.net/asset/carrier/info/apicarrier.all.json,
// hämtad 2026-09-18). Utan kod gissar 17TRACK bolaget ur numret — funkar
// oftast, men koden gör registreringen säker.
export const BOLAG = {
  yunexpress: 190008,
  '4px': 190094,
  postnord: 19241,
};

export function bolagskod(namn) {
  const n = String(namn ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [nyckel, kod] of Object.entries(BOLAG)) if (n.includes(nyckel.replace(/[^a-z0-9]/g, ''))) return kod;
  return null;
}

// 17TRACK huvudstatus → Shopify FulfillmentEventStatus. null = skriv inget.
export const STATUS = {
  InfoReceived: 'CONFIRMED',
  InTransit: 'IN_TRANSIT',
  AvailableForPickup: 'READY_FOR_PICKUP',
  OutForDelivery: 'OUT_FOR_DELIVERY',
  DeliveryFailure: 'ATTEMPTED_DELIVERY',
  Delivered: 'DELIVERED',
  Exception: 'FAILURE',
  Expired: null,
  NotFound: null,
};

// Ordningen en leverans normalt går i. Ett event skrivs bara om det ligger
// senare i kedjan än det senast skrivna — annars skulle en försenad
// "InTransit"-skanning efter "Delivered" göra tidslinjen bakvänd.
// ATTEMPTED_DELIVERY och FAILURE får alltid skrivas (de är avvikelser).
const ORDNING = ['CONFIRMED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'READY_FOR_PICKUP', 'DELIVERED'];
const AVVIKELSER = new Set(['ATTEMPTED_DELIVERY', 'FAILURE']);

// Svenska meddelanden — kunden ser dem på orderstatussidan. Korta, utan
// ursäkter, med plats när fraktbolaget gett en (docs/copy-regler.md).
export function meddelande(status, plats, support = 'kundsupport@baverbutiken.se') {
  const var_ = plats ? ` (${plats})` : '';
  switch (status) {
    case 'CONFIRMED': return 'Fraktbolaget har tagit emot uppgifterna om paketet.';
    case 'IN_TRANSIT': return `Paketet är på väg${var_}.`;
    case 'READY_FOR_PICKUP': return `Paketet finns att hämta hos ombudet${var_}.`;
    case 'OUT_FOR_DELIVERY': return 'Paketet är ute för leverans i dag.';
    case 'ATTEMPTED_DELIVERY': return 'Leverans försöktes utan att lyckas. Ett nytt försök följer.';
    case 'DELIVERED': return `Paketet är levererat${var_}.`;
    case 'FAILURE': return `Ett problem uppstod med leveransen. Mejla ${support} så hjälper vi till.`;
    default: return '';
  }
}

// Plocka det vi behöver ur ett accepterat svar från /gettrackinfo.
// Formen (2026-09-18, v2.x): { number, carrier, track_info: { latest_status:
// { status, sub_status }, latest_event: { time_iso, description, location },
// tracking: { providers: [{ events: [...] }] } } }. Allt läses defensivt —
// saknas fältet blir det null, aldrig ett kast.
export function tolka(post) {
  const t = post?.track_info ?? {};
  const status17 = t.latest_status?.status ?? null;
  const senaste = t.latest_event ?? null;
  const handelser = (t.tracking?.providers ?? []).flatMap((p) => p.events ?? []);
  return {
    nummer: post?.number ?? null,
    bolag: post?.carrier ?? null,
    status17,
    understatus: t.latest_status?.sub_status ?? null,
    status: status17 ? (STATUS[status17] ?? null) : null,
    tid: senaste?.time_iso ?? senaste?.time_utc ?? null,
    plats: renPlats(senaste?.location),
    beskrivning: senaste?.description ?? null,
    antalHandelser: handelser.length,
  };
}

function renPlats(plats) {
  if (!plats) return null;
  const s = String(plats).trim().replace(/\s+/g, ' ');
  return s.length ? s : null;
}

// Vad ska skrivas in i Shopify för ett paket? `tolkad` = tolka(), `redan` =
// statusar som redan finns som event i Shopify (lästa ur ordern), `sista` =
// senast skrivna status enligt vår lagefil. Returnerar null eller
// { status, happenedAt, message }.
export function planera(tolkad, redan = [], sista = null) {
  const s = tolkad.status;
  if (!s) return null;
  const finns = new Set(redan);
  if (finns.has(s)) return null;
  if (!AVVIKELSER.has(s)) {
    const ny = ORDNING.indexOf(s);
    const sistaIx = ORDNING.indexOf(sista ?? '');
    const finnsIx = Math.max(-1, ...[...finns].map((x) => ORDNING.indexOf(x)));
    if (ny <= Math.max(sistaIx, finnsIx)) return null;
  }
  return {
    status: s,
    happenedAt: giltigTid(tolkad.tid) ? tolkad.tid : new Date().toISOString(),
    message: meddelande(s, tolkad.plats),
  };
}

function giltigTid(t) {
  if (!t) return false;
  const d = new Date(t);
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now() + 3600 * 1000;
}
