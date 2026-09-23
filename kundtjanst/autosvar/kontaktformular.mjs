// kontaktformular.mjs — Shopifys kontaktformulär-mejl är kundmejl i förklädnad.
//
// Mätt i Bäverbutikens inkorg 2026-09-21: 10 av de 30 senaste mejlen kom
// "från" `Bäverbutiken.se (Shopify) <mailer@shopify.com>` med ämnet
// "Nytt kundmeddelande den 21 september 2026 20.09" — det är butikens
// kontaktformulär, och KUNDEN står i Reply-To. Roundcube svarar till Reply-To
// före From, så ett svar på ett sådant mejl går till kunden — men motorn
// hade hoppat över dem som "systemavsändare (shopify.com)" och missat de
// flesta kundfrågorna. Axels regel "svara aldrig på Shopifys egna notiser"
// gäller Shopifys mejl OM butiken (ny order, tvist öppnad, utbetalning) —
// inte kundens egna ord vidarebefordrade av Shopify.
//
// Kroppen (svenska notisen):
//   Du har fått ett nytt meddelande från din webbshops kontaktformulär.
//   Landskod:\nSE\n\nName:\nIris Andersson\n\nE-post:\niris@…\n\nText:\n<kundens text>
//
// kundUrKontaktformular(mejl) ger tillbaka samma mejl med KUNDEN som
// avsändare och kundens text som text — eller mejlet orört när det inte är
// ett kontaktformulär. Ren funktion, ingen nätåtkomst.

import { normalisera } from '../klassificering.mjs';
import { arSystem } from '../arenden.mjs';

/** Ämnesraderna Shopify sätter på kontaktformulär-notisen (sv/en/nb/da/fi). */
export const KONTAKTFORMULAR_AMNE = /^\s*(re:\s*)?(nytt kundmeddelande|new customer message|ny kundemelding|ny kundehenvendelse|ny kundebesked|ny kundemeddelelse|uusi asiakasviesti)\b/i;
const INLEDNING = /(nytt meddelande från din (webbshops?|webbutiks?|butiks?) kontaktformulär|new message from your (online store'?s? |store'?s? )?contact form|ny melding fra (nettbutikkens? |butikkens? )?kontaktskjema|ny besked fra (webshoppens? |butikkens? )?kontaktformular|uusi viesti verkkokauppasi yhteydenottolomakkeesta)/i;
const RELAY_DOMAN = /(^|\.)(shopify\.com|shopifyemail\.com)$/i;

const FALT = {
  namn: '(?:name|namn|navn|nimi)',
  epost: '(?:e-?post|e-?mail|email|sähköposti|sähköpostiosoite)',
  // CaraShells tema (mätt 2026-09-23) kallar fältet "Kommentar"/"Comment" och
  // lägger "Telefonnummer"/"Phone Number" före — utan de orden hoppades alla
  // 14 formulär i inkorgen som "systemavsändare (shopify.com)".
  text: '(?:text|body|meddelande|message|melding|besked|viesti|kommentar|comment|kommentti)',
};

/** Värdet på en enradsetikett ("Name:\nIris") — eller null. */
function enrad(kropp, etikett) {
  const m = kropp.match(new RegExp(`^${etikett}:[ \\t]*\\r?\\n[ \\t]*([^\\r\\n]*)`, 'im'));
  return m ? m[1].trim() : null;
}

/** Allt efter textetiketten ("Text:\n…") — kundens egna ord. Null om etiketten saknas. */
function meddelande(kropp) {
  const m = kropp.match(new RegExp(`^${FALT.text}:[ \\t]*\\r?\\n([\\s\\S]*)$`, 'im'));
  if (!m) return null;
  return m[1]
    // Shopifys sidfot i HTML-varianten, om plain-delen saknades.
    .replace(/\n+\s*(detta e-postmeddelande skickades|this email was sent|denne e-posten ble sendt|denne e-mail blev sendt)[\s\S]*$/i, '')
    .trim();
}

/** Är mejlet Shopifys kontaktformulär-notis? Ren. */
export function arKontaktformular(mejl) {
  const fran = String(mejl?.fran?.adress ?? '').toLowerCase();
  const doman = fran.split('@')[1] ?? '';
  if (!RELAY_DOMAN.test(doman)) return false;
  const amne = String(mejl?.amne ?? '');
  const kropp = String(mejl?.helText ?? mejl?.text ?? '');
  if (!KONTAKTFORMULAR_AMNE.test(amne) && !INLEDNING.test(normalisera(kropp))) return false;
  return meddelande(kropp) !== null;
}

/**
 * Kontaktformulär-mejl → samma mejl med kunden som `fran`, kundens ord som
 * `text`/`helText`, `kontaktformular: true` och Shopifys avsändare kvar i
 * `relay`. Annat mejl → oförändrat (samma objekt).
 *
 * Kundens adress: Reply-To först (det är dit Roundcube svarar), annars
 * E-post-fältet i kroppen. Är adressen tom eller en systemadress lämnas
 * mejlet orört — då hoppar hinkarna över det som förut.
 */
export function kundUrKontaktformular(mejl) {
  if (!arKontaktformular(mejl)) return mejl;
  const kropp = String(mejl.helText ?? mejl.text ?? '');
  const epostFalt = (enrad(kropp, FALT.epost) ?? '').toLowerCase();
  const adress = mejl.svarTill?.adress || (epostFalt.includes('@') ? epostFalt : '');
  if (!adress || arSystem(adress)) return mejl;
  const namn = enrad(kropp, FALT.namn) || mejl.svarTill?.namn || '';
  const text = meddelande(kropp) ?? '';
  return {
    ...mejl,
    fran: { namn, adress },
    svarTill: { namn, adress },
    text,
    helText: text,
    kontaktformular: true,
    relay: { fran: mejl.fran, land: enrad(kropp, '(?:landskod|country code|landkode|maakoodi)') ?? null },
  };
}
