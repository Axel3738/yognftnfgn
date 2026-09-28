// messenger/bedom.mjs — ren logik: en konversation → läget, "mejlet" till
// autosvarets motor, och DM-texterna motorn saknar. Inget nät här.
//
// Samma hinkar som mejl-autosvaret (kundtjanst/autosvar/hinkar.mjs): ENKEL
// besvaras med fakta ur Shopify, ARG får den lugnande raden och går till VA:n,
// SVÅR går bara till VA:n. Det som skiljer en DM från ett mejl:
//   • Vi vet inte vem kunden är. Ett mejl har en avsändaradress som ordern
//     måste matcha — en DM har ingen. Skriver kunden sin e-post i meddelandet
//     används den (orderns e-post MÅSTE vara den, samma järnregel). Annars ber
//     svaret om ordernumret OCH e-posten (`dm_order`) — aldrig en annan kunds order.
//   • 24-timmarsfönstret: en sida får svara bara inom 24 h från kundens
//     senaste meddelande. Äldre ⇒ VA:n.
//   • Bilagor (bild, röstmeddelande) läser motorn inte ⇒ VA:n.

import { createHash } from 'node:crypto';

const TIMME = 3_600_000;
const DAG = 24 * TIMME;
const EPOST = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

/** Kort, stabil hash av kundens id — loggen bär aldrig PSID i klartext. */
export function kundHash(id) {
  return createHash('sha256').update(`messenger:${id}`).digest('hex').slice(0, 16);
}

/**
 * Läget i en konversation. `c` = Graphs konversation (meddelanden nyast först),
 * `sidaId` sidans id (på Instagram även IG-kontots id). Ren.
 * Returnerar null när inget väntar (sidan skrev sist, eller tomt).
 */
export function lage(c, { sidIds = [], nu = new Date() } = {}) {
  const egna = new Set(sidIds.map(String));
  const msg = [...(c.messages?.data ?? [])].sort((a, b) => new Date(a.created_time) - new Date(b.created_time));
  if (!msg.length) return null;
  const arEgen = (m) => egna.has(String(m.from?.id ?? ''));
  let sistaEgen = -1;
  msg.forEach((m, i) => { if (arEgen(m)) sistaEgen = i; });
  const obesvarade = msg.slice(sistaEgen + 1).filter((m) => !arEgen(m));
  if (!obesvarade.length) return null;
  const kund = obesvarade.at(-1).from ?? {};
  const senaste = obesvarade.at(-1);
  const text = obesvarade.map((m) => String(m.message ?? '').trim()).filter(Boolean).join('\n');
  const bilaga = obesvarade.some((m) => (m.attachments?.data ?? []).length > 0);
  const t = nu.getTime();
  const egenTid = sistaEgen >= 0 ? new Date(msg[sistaEgen].created_time).getTime() : null;
  return {
    konversation: c.id,
    platform: c.platform ?? 'messenger',
    kundId: kund.id ?? null,
    kundNamn: kund.name ?? kund.username ?? '',
    senasteId: senaste.id,
    senasteTid: senaste.created_time,
    timmarSedan: (t - new Date(senaste.created_time).getTime()) / TIMME,
    text,
    bilaga,
    antalObesvarade: obesvarade.length,
    // Dagar sedan sidan (VA:n eller vi) senast skrev i konversationen — null om aldrig.
    egenDagar: egenTid ? (t - egenTid) / DAG : null,
    lank: c.link ? `https://www.facebook.com${c.link}` : null,
  };
}

/** Kundens e-post ur meddelandet, om den står där. */
export function epostUrText(text) {
  const m = String(text ?? '').match(EPOST);
  return m ? m[0].toLowerCase() : null;
}

/**
 * Autosvarets "mejl" byggt ur DM:en. Utan e-post i texten får avsändaren en
 * adress som aldrig kan matcha en order (`.invalid`), så hamtaFakta aldrig
 * knyter en order till fel person.
 */
export function somMejl(l) {
  const epost = epostUrText(l.text);
  return {
    fran: { adress: epost ?? `dm-${kundHash(l.kundId)}@messenger.invalid`, namn: l.kundNamn },
    amne: '',
    text: l.text,
    datum: new Date(l.senasteTid),
    messageId: l.senasteId,
    references: [],
    bilaga: l.bilaga,
    harEpost: Boolean(epost),
  };
}

/**
 * Minnet ur loggen: vilka kundmeddelanden som redan hanterats, och hur många
 * automatiska svar varje konversation fått de senaste `dagar` dagarna.
 * `dm_order` (frågan om ordernummer + e-post) räknas inte som ett "riktigt"
 * svar — kundens nästa meddelande MED numret ska få svaret, inte gå till VA:n.
 */
export function minneUr(rader = [], { nu = new Date(), dagar = 14 } = {}) {
  const hanterade = new Set();
  const autosvar = new Map();   // konversation → { antal, riktiga }
  const grans = nu.getTime() - dagar * DAG;
  for (const r of rader) {
    if (r.atgard !== 'fel' && r.senasteId) hanterade.add(r.senasteId);
    if (r.atgard === 'svar' && new Date(r.tid).getTime() >= grans) {
      const a = autosvar.get(r.konversation) ?? { antal: 0, riktiga: 0 };
      a.antal++;
      if (r.typ !== 'dm_order') a.riktiga++;
      autosvar.set(r.konversation, a);
    }
  }
  return { hanterade, autosvar };
}

const DM_ORDER = {
  sv: (n) => `Hej${n ? ` ${n}` : ''}!\n\nTack för ditt meddelande. För att kunna kolla din order behöver jag två saker: ordernumret (det står i orderbekräftelsen, till exempel #1234) och e-postadressen du beställde med. Skicka dem här i chatten så tittar vi direkt.`,
  nb: (n) => `Hei${n ? ` ${n}` : ''}!\n\nTakk for meldingen. For å sjekke bestillingen din trenger jeg to ting: ordrenummeret (det står i ordrebekreftelsen, for eksempel #1234) og e-postadressen du bestilte med. Send dem her i chatten, så ser vi på det med en gang.`,
  da: (n) => `Hej${n ? ` ${n}` : ''}!\n\nTak for din besked. For at tjekke din ordre har jeg brug for to ting: ordrenummeret (det står i ordrebekræftelsen, for eksempel #1234) og den e-mailadresse, du bestilte med. Send dem her i chatten, så kigger vi på det med det samme.`,
  fi: (n) => `Hei${n ? ` ${n}` : ''}!\n\nKiitos viestistäsi. Jotta voin tarkistaa tilauksesi, tarvitsen kaksi asiaa: tilausnumeron (se lukee tilausvahvistuksessa, esimerkiksi #1234) ja sähköpostiosoitteen, jolla tilasit. Lähetä ne tähän chattiin, niin katsomme asian heti.`,
  en: (n) => `Hi${n ? ` ${n}` : ''}!\n\nThanks for your message. To check your order I need two things: your order number (it is in the order confirmation, for example #1234) and the email address you ordered with. Send them here in the chat and we will look right away.`,
};

/** Frågan om ordernummer + e-post, i kundens språk, med butikens signatur. */
export function dmOrderText({ sprak = 'sv', namn = '', signatur = '' } = {}) {
  const f = DM_ORDER[sprak] ?? DM_ORDER.en;
  return `${f(namn)}${signatur ? `\n\n${signatur}` : ''}`;
}

/**
 * Mejltexten görs om till en chattext: citatet av kundens mejl under
 * svaret och rader om "det här mejlet" hör inte hemma i en chatt.
 */
export function somChatt(text) {
  return String(text ?? '')
    .split(/\n-{2,}\s*\n|\n>|\n(?:Den|On|På|Le) .{5,80}(?:skrev|wrote|skrev følgende|kirjoitti):\s*\n/)[0]
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Delar en text i delar under Metas tak (2 000 tecken), på stycken. */
export function dela(text, max = 1900) {
  const ut = [];
  let del = '';
  for (const st of String(text).split(/\n\n/)) {
    const kand = del ? `${del}\n\n${st}` : st;
    if (kand.length <= max) { del = kand; continue; }
    if (del) ut.push(del);
    if (st.length <= max) { del = st; continue; }
    for (let i = 0; i < st.length; i += max) ut.push(st.slice(i, i + max));
    del = '';
  }
  if (del) ut.push(del);
  return ut;
}

/** Länken VA:n öppnar för att svara: sidans inkorg i Meta Business Suite. */
export function inkorgslank(sidaId, platform = 'messenger') {
  return `https://business.facebook.com/latest/inbox/${platform === 'instagram' ? 'instagram_direct' : 'messenger'}?asset_id=${sidaId}`;
}
