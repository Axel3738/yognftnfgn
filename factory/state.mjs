// Körstate per butik+produkt: vilka steg som är klara och vad de gav.
//
// Finns för --resume: en körning som avbryts halvvägs ska kunna tas vidare
// utan att göra om det som redan lyckats. Filen innehåller bara id:n och
// statusar — aldrig tokens, aldrig något ur miljön.
//
// Två nivåer (KEDJAN.md): butikens steg bokförs i `<butik>--_butik.json`,
// produktens i `<butik>--<produkt-id>.json`. Arbetstemat (regel 1) låses i
// butiksstaten som `arbetstemaId` — varje temasteg läser det därifrån.
//
// Ett steg har tre lägen i staten:
//   { klar: true, …resultat }        gjort av fabriken
//   { klar: false, manuell: '…' }    väntar på en människa (stoppar inte kedjan)
//   saknas                           aldrig kört
// Slutrapportens två listor (regel 4) byggs ur exakt de lägena — aldrig ur
// minnet i en körning.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const STATE_MAPP = join(dirname(fileURLToPath(import.meta.url)), 'state');

// Butiksnivåns "produkt-id" i filnamnet.
export const BUTIKSNYCKEL = '_butik';

// Nycklar som aldrig får hamna i statefilen, hur de än råkar dyka upp.
// `losenord` är storefront-lösenordet (kundvy-kor), `hemlig` täcker
// clientSecret-varianter på svenska.
const HEMLIGA = /token|secret|key|password|authorization|losenord|lösenord|hemlig/i;

export function statefil(butiksId, produktId) {
  return join(STATE_MAPP, `${butiksId}--${produktId}.json`);
}

export function lasState(butiksId, produktId) {
  const fil = statefil(butiksId, produktId);
  if (!existsSync(fil)) return { butik: butiksId, produkt: produktId, steg: {} };
  try {
    const data = JSON.parse(readFileSync(fil, 'utf8'));
    // Äldre statefiler (DryTrek) bär `butik` som objekt { domän, brand } —
    // det får ligga kvar, men id:t i filnamnet är det som gäller.
    const butik = data.butik && typeof data.butik === 'object' ? { ...data.butik, id: butiksId } : butiksId;
    return { ...data, butik, produkt: produktId, steg: data.steg ?? {} };
  } catch {
    // Trasig statefil ska inte stoppa en körning — den byggs om.
    return { butik: butiksId, produkt: produktId, steg: {} };
  }
}

export const lasButiksState = (butiksId) => lasState(butiksId, BUTIKSNYCKEL);

// Plockar bort allt som ser ut som en hemlighet innan något skrivs till disk.
export function rensaHemligheter(varde) {
  if (Array.isArray(varde)) return varde.map(rensaHemligheter);
  if (varde && typeof varde === 'object') {
    const ut = {};
    for (const [nyckel, v] of Object.entries(varde)) {
      if (HEMLIGA.test(nyckel)) continue;
      ut[nyckel] = rensaHemligheter(v);
    }
    return ut;
  }
  return varde;
}

export function skrivState(state) {
  mkdirSync(STATE_MAPP, { recursive: true });
  const rent = rensaHemligheter({ ...state, uppdaterad: new Date().toISOString() });
  const butiksId = typeof state.butik === 'object' ? state.butik.id : state.butik;
  writeFileSync(statefil(butiksId, state.produkt), `${JSON.stringify(rent, null, 2)}\n`);
  return rent;
}

export const arKlart = (state, stegId) => state?.steg?.[stegId]?.klar === true;
export const arManuell = (state, stegId) => Boolean(state?.steg?.[stegId]?.manuell) && !arKlart(state, stegId);

export function markeraKlart(state, stegId, resultat = {}) {
  state.steg[stegId] = { klar: true, ...rensaHemligheter(resultat) };
  return state;
}

// Ett manuellt steg är INTE klart — --resume försöker igen — men det ska
// synas i slutrapporten som "väntar på en människa", med texten.
export function markeraManuell(state, stegId, text, extra = {}) {
  state.steg[stegId] = { klar: false, manuell: String(text), ...rensaHemligheter(extra) };
  return state;
}

// ---------------------------------------------------------------------------
// Arbetstemat (KEDJAN regel 1): ETT id, låst i butiksstaten efter tema-upload.
// Läser även äldre former (steg['tema-upload'].temaId från TackleBay-bygget,
// steg.tema.temaId från DryTrek) så gamla butiker inte tappar sitt tema.
// ---------------------------------------------------------------------------

export function lasArbetstemaId(state) {
  const s = state?.steg ?? {};
  return (
    state?.arbetstemaId ??
    s['tema-upload']?.arbetstemaId ??
    s['tema-upload']?.temaId ??
    s.tema?.temaId ??
    s.startsida?.temaId ??
    s.brand?.temaId ??
    null
  );
}

export function lasArbetstemaNamn(state) {
  const s = state?.steg ?? {};
  return state?.arbetstemaNamn ?? s['tema-upload']?.temaNamn ?? s.tema?.temaNamn ?? null;
}

export function sattArbetstemaId(state, { id, namn = null } = {}) {
  if (!id) throw new Error('sattArbetstemaId: inget tema-id.');
  state.arbetstemaId = id;
  if (namn) state.arbetstemaNamn = namn;
  return state;
}

// ---------------------------------------------------------------------------
// Slutrapporten (KEDJAN regel 4): två listor ur state — "Gjort av mig" och
// "Väntar på en människa". Ett steg där en person ska klicka står ALDRIG i
// den första. `stegOrdning` är ops.mjs:s STEG-lista ({ id, namn, niva }), så
// raderna kommer i körordning; `produktstater` är en lista med produktstater.
// Ren logik — inget läses från disk här.
// ---------------------------------------------------------------------------

export function byggSlutrapport(stegOrdning, butiksstate, produktstater = []) {
  const gjort = [];
  const vantar = [];
  const ejKorda = [];
  const lagg = (steg, state, produktId) => {
    const post = state?.steg?.[steg.id];
    const etikett = produktId ? `${steg.namn} — ${produktId}` : steg.namn;
    if (!post) {
      ejKorda.push({ steg: steg.id, produkt: produktId ?? null, text: etikett });
    } else if (post.klar === true) {
      gjort.push({ steg: steg.id, produkt: produktId ?? null, text: etikett });
    } else if (post.manuell) {
      vantar.push({ steg: steg.id, produkt: produktId ?? null, text: `${etikett}: ${post.manuell}` });
    } else {
      ejKorda.push({ steg: steg.id, produkt: produktId ?? null, text: etikett });
    }
  };
  for (const steg of stegOrdning ?? []) {
    if (steg.niva === 'produkt') {
      for (const ps of produktstater) lagg(steg, ps, ps.produkt);
    } else {
      lagg(steg, butiksstate, null);
    }
  }
  // Steg som bokförts utanför listan (launch, tema-publicering, store-ready …)
  // — de får inte försvinna ur rapporten bara för att de inte står i STEG.
  const kanda = new Set((stegOrdning ?? []).map((s) => s.id));
  const extra = (state, produktId) => {
    for (const id of Object.keys(state?.steg ?? {})) {
      if (kanda.has(id)) continue;
      const post = state.steg[id];
      const etikett = produktId ? `${id} — ${produktId}` : id;
      if (post?.klar === true) gjort.push({ steg: id, produkt: produktId ?? null, text: etikett });
      else if (post?.manuell) vantar.push({ steg: id, produkt: produktId ?? null, text: `${etikett}: ${post.manuell}` });
    }
  };
  extra(butiksstate, null);
  for (const ps of produktstater) extra(ps, ps.produkt);
  // QA-utfallet ligger inte under steg — det körs alltid färskt.
  for (const ps of produktstater) {
    const qa = ps?.qa;
    if (!qa) continue;
    if (qa.gron) gjort.push({ steg: 'qa', produkt: ps.produkt, text: `QA — ${ps.produkt}: grön` });
    else vantar.push({ steg: 'qa', produkt: ps.produkt, text: `QA — ${ps.produkt}: ${(qa.kritiska ?? []).length} röda punkter (${(qa.kritiska ?? []).join(', ')})` });
  }
  if (butiksstate?.qa) {
    const qa = butiksstate.qa;
    if (qa.gron) gjort.push({ steg: 'qa', produkt: null, text: 'QA — butiken (kundvy + trippelkoll): grön' });
    else vantar.push({ steg: 'qa', produkt: null, text: `QA — butiken: ${(qa.kritiska ?? []).length} röda punkter (${(qa.kritiska ?? []).join(', ')})` });
  }
  return { gjort, vantar, ejKorda };
}

export function slutrapportText(rapport) {
  const rad = (x) => `   • ${x.text}`;
  return [
    'GJORT AV MIG:',
    ...(rapport.gjort.length > 0 ? rapport.gjort.map(rad) : ['   (inget ännu)']),
    '',
    'VÄNTAR PÅ EN MÄNNISKA:',
    ...(rapport.vantar.length > 0 ? rapport.vantar.map(rad) : ['   (inget)']),
    ...(rapport.ejKorda.length > 0
      ? ['', `Inte kört ännu: ${rapport.ejKorda.map((x) => x.text).join(', ')}`]
      : []),
  ].join('\n');
}
