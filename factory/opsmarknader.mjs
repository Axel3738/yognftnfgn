// OPS-butikernas ANNONSMARKNADER — vilket annonskonto, vilken geo, vilket
// språk och vilken landningssida varje marknad har. En tabell, ren logik.
//
// Till 2026-09-16 fanns bara SE och NO, båda i det delade OPS-kontot
// MagiBorsten DK, och "NO" stod hårdkodat i leveranskön, uppladdaren,
// kampanjbyggaren och rutinschemat. USA lades till som första marknad i ett
// ANNAT konto (Axels beslut 2026-09-16: "Detta blir Magiborsten UK till för"
// — kontot 1107817401910319, valuta SEK, tidszon GB, avläst ur Meta samma
// dag). Så kontot är per MARKNAD, inte per butik.
//
// ⚠️ Kontona kontrolleras alltid på ID, aldrig på namn. Fyra konton heter
// nästan "Magiborsten …" och är olika verksamheter (CLAUDE.md).
//
// Nytt land = en rad här + `annonsmarknader` på butikens registerpost
// (`node factory/register.mjs annonsmarknader <nyckel> NO,US`). Ingen if-sats.

const OPS_KONTO = '915422744950975';

export const OPS_MARKNADER = Object.freeze({
  SE: Object.freeze({
    kod: 'SE', namn: 'Sverige', act: OPS_KONTO, kontonamn: 'MagiBorsten DK', kontovaluta: 'SEK',
    geo: ['SE'], locale: null, country: null, valuta: 'SEK', valuta_i_annons: 'kr',
    heygen_sprak: null, sprak: 'svenska', status_ko: 'To be Reviewed', oversatts: false,
    emoji: '🇸🇪', rubrik_en: 'Sweden delivery',
  }),
  NO: Object.freeze({
    kod: 'NO', namn: 'Norge', act: OPS_KONTO, kontonamn: 'MagiBorsten DK', kontovaluta: 'SEK',
    geo: ['NO'], locale: 'nb', country: 'NO', valuta: 'NOK', valuta_i_annons: 'kr',
    heygen_sprak: 'Norwegian Bokmål (Norway)', sprak: 'norsk bokmål', status_ko: 'SE-ACTIVE to be translated', oversatts: true,
    emoji: '🇳🇴', rubrik_en: 'Norway translation',
  }),
  US: Object.freeze({
    kod: 'US', namn: 'USA', act: '1107817401910319', kontonamn: 'Magiborsten UK', kontovaluta: 'SEK',
    geo: ['US'], locale: 'en', country: 'US', valuta: 'USD', valuta_i_annons: '$',
    heygen_sprak: 'English (United States)', sprak: 'amerikansk engelska', status_ko: 'SE-ACTIVE to be translated', oversatts: true,
    emoji: '🇺🇸', rubrik_en: 'US translation',
  }),
  // Danmark 2026-09-20 (/ny-marknad carashell DK). Kontot är det delade
  // OPS-kontot — samma som SE och NO. ⚠️ Kontot HETER "MagiBorsten DK" men
  // är inte Danmarks konto: namnet är historiskt, det bär alla OPS-butikers
  // svenska och norska kampanjer, och Bäverbutikens EGNA danska kampanjer
  // ligger också där (med Bäverbutikens sida och pixel). Därför måste varje
  // uppslag filtrera på butikens brandprefix, aldrig på "DK" i namnet.
  // heygen_sprak avläst ur `node pipeline/localize.mjs langs` samma dag —
  // listan har både "Danish" och "Danish (Denmark)"; den senare följer
  // mönstret från "Norwegian Bokmål (Norway)".
  DK: Object.freeze({
    kod: 'DK', namn: 'Danmark', act: OPS_KONTO, kontonamn: 'MagiBorsten DK', kontovaluta: 'SEK',
    geo: ['DK'], locale: 'da', country: 'DK', valuta: 'DKK', valuta_i_annons: 'kr.',
    heygen_sprak: 'Danish (Denmark)', sprak: 'danska', status_ko: 'SE-ACTIVE to be translated', oversatts: true,
    emoji: '🇩🇰', rubrik_en: 'Denmark translation',
  }),
});

export const OPS_MARKNADSKODER = Object.freeze(Object.keys(OPS_MARKNADER));

const kodAv = (v) => String(v ?? '').trim().toUpperCase();

/** Marknaden för en kod. Kastar på okänd — en gissad marknad är ett fel konto. */
export function marknadFor(kod) {
  const m = OPS_MARKNADER[kodAv(kod)];
  if (!m) throw new Error(`Okänd OPS-marknad "${kod}". Kända: ${OPS_MARKNADSKODER.join(', ')} (factory/opsmarknader.mjs).`);
  return m;
}

export const arOpsMarknad = (kod) => Boolean(OPS_MARKNADER[kodAv(kod)]);

/** Annonskontot för marknaden (utan act_-prefix). */
export const kontoFor = (kod) => marknadFor(kod).act;

/** Marknader som översätts ur SE-kön (allt utom SE). */
export const oversattningsmarknader = () => OPS_MARKNADSKODER.filter((k) => OPS_MARKNADER[k].oversatts);

/**
 * Målnamnet på marknaden: prefix + `_<KOD>_` + resten.
 *   HeimGuard_SP_2_1 → HeimGuard_US_SP_2_1 (US) · HeimGuard_NO_SP_2_1 (NO) · oförändrat (SE).
 * Ett namn som redan bär koden lämnas orört. Ett namn som bär en ANNAN
 * marknads kod byts inte om — det är fel rad, inte ett namn att skriva om.
 * Utan "_" i namnet: null.
 */
export function marknadsNamn(seNamn, kod) {
  const m = marknadFor(kod);
  const n = String(seNamn ?? '').split(/\s+[–—-]\s+/)[0].trim();
  if (m.kod === 'SE') return n || null;
  const i = n.indexOf('_');
  if (i <= 0) return null;
  const prefix = n.slice(0, i);
  const rest = n.slice(i + 1);
  if (new RegExp(`^${m.kod}_`, 'i').test(rest)) return n;
  for (const annan of OPS_MARKNADSKODER) {
    if (annan !== 'SE' && annan !== m.kod && new RegExp(`^${annan}_`, 'i').test(rest)) return null;
  }
  return `${prefix}_${m.kod}_${rest}`;
}

/**
 * Landningslänken för marknaden: butikens domän + locale-prefix + handle +
 * `?country=<land>`. `?country=` är INTE valfritt: /nb och /en är bara SPRÅK
 * på huvuddomänen, vars marknad är Sverige — utan parametern får kunden
 * marknadens språk men SVENSKA priser (DryTrek 2026-09-10, 16 annonser en dag).
 */
export function lankFor({ doman, handle, kod, egenDoman = false }) {
  const m = marknadFor(kod);
  const d = String(doman ?? '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const h = String(handle ?? '').trim();
  if (!d || !h) throw new Error('lankFor: både doman och handle krävs.');
  if (!m.locale) return `https://${d}/products/${h}`;
  // Marknadens EGEN domän (carashell.com för USA, 2026-09-16) bär språket som
  // standard — ingen /en/-mapp. ?country= behålls: den pekar ut marknaden.
  if (egenDoman) return `https://${d}/products/${h}?country=${m.country}`;
  return `https://${d}/${m.locale}/products/${h}?country=${m.country}`;
}

/** Domänen ur butikens supportmail (Axels regel: alltid hello@<domän>). */
export function domanUrButik(butik) {
  const mail = String(butik?.butik?.supportmail ?? '');
  const d = mail.split('@')[1];
  if (!d) throw new Error('Butikens domän går inte att härleda ur supportmail.');
  return d;
}

/**
 * Domänen för EN marknad: raden i butik.marknader kan bära `doman`
 * (carashell.com för US — Axel köpte den 2026-09-16, ".se säger utländsk
 * butik"), annars butikens egen ur supportmailen. Returnerar { doman, egen }
 * så länken byggs utan språkmapp på en egen domän.
 */
export function domanForMarknad(butik, kod) {
  const k = String(kod ?? '').toUpperCase();
  const rad = (Array.isArray(butik?.butik?.marknader) ? butik.butik.marknader : []).find((m) => String(m?.land ?? '').toUpperCase() === k);
  const egen = String(rad?.doman ?? '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (egen) return { doman: egen, egen: true };
  return { doman: domanUrButik(butik), egen: false };
}

/** Marknadens produktlänk ur butiken — egen domän när raden bär en. */
export function marknadslank(butik, { handle, kod }) {
  const { doman, egen } = domanForMarknad(butik, kod);
  return lankFor({ doman, handle, kod, egenDoman: egen });
}

/**
 * Ska raden flyttas till Approved efter att marknaden `m` fått sin annons?
 * Bara när VARJE annan översättningsmarknad på posten redan bär annonsen —
 * annars läser nästa marknads rutin aldrig raden. `klarI` = { NO: true, US: false }.
 */
export function skaFlyttasTillApproved(klarI, annonsmarknader, m) {
  const mina = (annonsmarknader ?? []).map(kodAv).filter((k) => k && k !== 'SE' && k !== kodAv(m));
  return mina.every((k) => klarI?.[k] === true);
}

/** Butikens annonsmarknader ur registerposten, normaliserade; standard NO. */
export function annonsmarknaderUr(varde) {
  const lista = Array.isArray(varde) ? varde : typeof varde === 'string' ? varde.split(/[,\s]+/) : [];
  const ut = [...new Set(lista.map(kodAv).filter((k) => k && k !== 'SE' && arOpsMarknad(k)))];
  return ut.length ? ut : ['NO'];
}
