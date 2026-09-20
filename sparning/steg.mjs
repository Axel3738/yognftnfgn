// Vilket av kundens fem skeden hör en skanning till?
//
// Bakgrund (Axel 2026-09-19): sidan visade varje enskild logistikhändelse —
// terminal, land, transportstatus — och blev rörig. Kunden vill se fem
// punkter. Hela historiken finns kvar bakom "Mer information"; det här är
// bara en gruppering av skanningar som redan finns, aldrig ett nytt datum
// och aldrig en ny status.
//
// GRUNDEN ÄR ORDBOKEN, INTE FRAKTBOLAGETS STATUSKOD. Mätt 2026-09-19 på 204
// paket och 1 873 skanningar: 1 507 av dem (80 %) bär `sub_status`
// "InTransit_Other", och ordet OutForDelivery förekom inte en enda gång.
// Statuskoden kan alltså inte skilja Shenzhen från Umeå. Fraserna kan, och de
// är räknade: alla 78 nycklar i `fraser.json` står i tabellerna nedan.
//
// Tre regler, i ordning:
//   1. Har frasen ett skede i tabellen — det gäller.
//   2. Annars: ligger skanningen i mottagarlandet är den minst `I_LANDET`.
//   3. Annars: ärv skedet från skanningen före (paketet backar inte).
//
// ⚠️ Regel 2 har ett undantag som kostar trovärdighet att glömma.
// PostNords förhandsavisering ("Vi har fått en beställning på en leverans och
// väntar på paketet") bär platsen SWEDEN men skickas INNAN paketet lämnat
// Kina — i 20 fall av 20, mätt 2026-09-19. Utan undantaget hade var fjärde
// paket visat "Ankommit till Sverige" dag ett. Fraserna i FORHANDSAVI får
// därför aldrig lyfta ett skede via platsen.

import { normalisera } from './sprak.mjs';

export const BESTALLD = 0;
export const PA_VAG = 1;
export const I_LANDET = 2;
export const UTKORNING = 3;
export const LEVERERAT = 4;
export const OKANT = -1;

// Fras (normaliserad, samma nyckel som fraser.json) → skede.
// Fraser som INTE står här är medvetet neutrala: "Arrived at sort facility"
// händer både i Shenzhen och i Malmö, så platsen och ordningen får avgöra.
const SKEDE = {};
const satt = (steg, fraser) => { for (const f of fraser) SKEDE[normalisera(f)] = steg; };

satt(BESTALLD, [
  '下单成功，包裹待入库',
  'Shipment information received',
  'Parcel information received',
  'SHIPPING INFORMATION RECEIVED',
  'Processing information input',
  'The booking of the delivery is completed',
  'Vi har fått en beställning på en leverans och väntar på paketet',
  'We have received a notification from your shipper that they are preparing an item for you. The tracking information will be updated when the parcel is handed over to PostNord.',
]);

satt(PA_VAG, [
  '递四方揽收',
  'Port of departure - Departure',
  'Shipment picked up',
  'Yanwen Pickup Scan',
  '4PX received shipment.',
  'Port of departure - Received by carrier',
  'Arrived at origin facility',
  'Yanwen facility - Outbound',
  'The country of origin commences customs declaration.',
  'Clearence processing completed - Export',
  'International shipment release - Export',
  'Hand over to airline.',
  'Arrived at the origin international airport',
  'Departure from the original airport',
  'International flight has departed',
]);

// ⚠️ Bara fraser som ENTYDIGT betyder mottagarlandet står här. Butikens
// paket går Kina → Nederländerna → Sverige, och flera fraser som låter som
// ankomst sker i transitlandet: importtullen klareras i Nederländerna, och
// "destination airport" är Amsterdam för ett paket som ska till Umeå.
// De är därför neutrala och lyfts bara av platsen — "Clearance processing
// completed - Import" i Rozenburg ger På väg, samma fras i Malmö ger
// Ankommit. Att klassa dem som ankomst hade daterat steget dagar för tidigt.
satt(I_LANDET, [
  'THE SHIPMENT ITEM HAS ARRIVED AT THE COUNTRY OF DESTINATION.',
  'Delivered to local carrier',
  'Arrived at domestic terminal station',
  'Paket har ankommit till vår terminal',
  'ankommit till terminal',
  'The package has arrived at terminal (T1).',
  'The package has arrived at terminal (T2).',
  'The package has arrived at terminal (T3).',
  'THE SHIPMENT ITEM HAS ARRIVED AT THE DISTRIBUTION TERMINAL.',
]);

satt(UTKORNING, [
  'Paketet förbereds för leverans',
  'The package is activated for delivery.',
  'THE DELIVERY OF THE SHIPMENT ITEM IS IN PROGRESS.',
  'A compartment is booked',
  'Dropped off at locker by courier',
  'E-mail notification has been sent to the recipient.',
  'THE SHIPMENT ITEM HAS BEEN DELIVERED TO A SERVICE POINT.',
  'PICK-UP AT SERVICEPOINT, SELECTED BY THE RECEIVER.',
  'mottagaren aviserad',
  'Paketet har uppdaterats till ombud',
  'A new delivery attempt has been scheduled.',
]);

satt(LEVERERAT, [
  'Paketet har levererats hem till dig',
  'THE SHIPMENT ITEM HAS BEEN DELIVERED.',
  'The shipment item has been delivered.',
  'The package has been delivered to the door.',
  "The shipment item has been delivered at the recipient's door.",
  "The shipment item has been delivered to the recipient's mailbox.",
  'THE SHIPMEN ITEM HAS BEEN DELIVERED TO THE RECIPIENTS MAILBOX.',
  'The package has been delivered to the mailbox.',
  'The package has been delivered in a bag at the mailbox.',
  'Picked up at locker by customer',
]);

// Skanningar som betyder att något gått fel. De lyfter ALDRIG ett skede —
// en retur är inte framsteg — och visas som en egen varningsrad ovanför
// stegen, så kunden inte missar dem bland de fem punkterna.
const AVVIKELSE = new Set([
  'Vi upplever en leveransstörning - leveransdatum uppdateras',
  'The courier did not have the package with them when it was supposed to be delivered.',
  'Return to customers.',
  'Shipment has been returned to sender.',
  // Tillagda 2026-09-20 efter en genomsökning av alla 92 fraktbolagstexter i
  // flottan: de här tre låg som vanliga skanningar och lyfte därför skeden
  // som om allt gått bra. De två svenska är PostNords egna.
  'Vi kom inte in genom porten - leveransen kunde inte genomföras',
  'Din leverans är försenad - leveransdatum uppdateras',
  '退回客户',
].map(normalisera));

// Fraser som bär mottagarlandets namn men skickas innan paketet är där.
// Se varningen högst upp: 20 av 20 mätta fall.
const FORHANDSAVI = new Set([
  'Vi har fått en beställning på en leverans och väntar på paketet',
  'We have received a notification from your shipper that they are preparing an item for you. The tracking information will be updated when the parcel is handed over to PostNord.',
].map(normalisera));

export function arAvvikelse(rå) {
  return AVVIKELSE.has(normalisera(rå ?? ''));
}

export function arForhandsavi(rå) {
  return FORHANDSAVI.has(normalisera(rå ?? ''));
}

// Skedet en ENSKILD skanning bär, utan hänsyn till de andra.
// `rå` = fraktbolagets egen text (ordboksnyckeln). Returnerar OKANT när
// frasen är neutral eller okänd.
export function skedeForFras(rå) {
  const s = SKEDE[normalisera(rå ?? '')];
  return typeof s === 'number' ? s : OKANT;
}

// Hela kedjan → samma kedja med `steg` och `avvikelse` ifyllda.
//
// `handelser` ligger NYAST FÖRST (formatet i uppacka.mjs). Klassificeringen
// går kronologiskt, äldst först, för att kunna ärva framåt.
//
// `iMottagarlandet(h)` svarar om skanningen skedde i mottagarlandet. Den
// skickas in i stället för att slås upp här, så modulen går att testa utan
// ortstabellen — och så att en norsk butik kan skicka in sin egen.
export function klassificera(handelser, { iMottagarlandet } = {}) {
  const kron = [...(handelser ?? [])].reverse(); // äldst först
  let hogsta = OKANT;
  const ut = kron.map((h) => {
    const rå = h?.ra ?? h?.text ?? '';
    if (arAvvikelse(rå)) return { ...h, steg: OKANT, avvikelse: true };

    let steg = skedeForFras(rå);

    // Regel 2: platsen lyfter till I_LANDET — men aldrig för en
    // förhandsavisering, och aldrig NER från ett högre skede frasen gett.
    if (steg < I_LANDET && !arForhandsavi(rå) && typeof iMottagarlandet === 'function' && iMottagarlandet(h)) {
      steg = I_LANDET;
    }

    // Regel 3: neutral skanning ärver det paketet redan nått.
    if (steg === OKANT) steg = hogsta;

    // Paketet backar inte. En försenad skanning från Kina efter ankomsten
    // till Sverige får inte dra tillbaka tidslinjen.
    if (steg !== OKANT && steg < hogsta) steg = hogsta;
    if (steg > hogsta) hogsta = steg;
    return { ...h, steg, avvikelse: false };
  });
  return ut.reverse(); // tillbaka till nyast först
}
