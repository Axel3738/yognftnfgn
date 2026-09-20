// Var på resan är paketet — "förbereds hos avsändaren", "i luften",
// "sorteras", "i bilen på väg till dig"?
//
// Bakgrund (Axel 2026-09-20): skedet hette "Internationell transport" och
// kändes "bara skumt". Kunden vill veta att vi har koll. Samma dag, efter
// att ha sett första versionen: stegen i Sverige ska vara TYDLIGAST — inne
// på terminalen, sorteras, i bilen på väg till din stad — och stegen före
// Sverige ska vara lugna, bara att ordern är på väg och hanteras.
//
// Det här är ingen ny information. Det är samma skanningar, lästa en gång
// till med en annan fråga.
//
// ⚠️ SAMMA DISCIPLIN SOM steg.mjs: en fras måste betyda ETT delskede.
// Skillnaden mot steg.mjs är att delskedet är BUNDET TILL SITT HUVUDSKEDE:
// "Arrived at sort facility" händer både i Shenzhen och i Malmö, men den
// står här som ett delskede i skede 2 (Framme i landet) och gäller därför
// bara när skanningen redan ÄR klassad som svensk. I skede 1 är den neutral
// och flyttar ingenting. Det är steg.mjs som avgjort landsfrågan, med
// PostNords förhandsaviseringsundantag inbakat — den bedömningen görs
// aldrig om här.
//
// Mätt 2026-09-20 på den publicerade datan (1 055 paket, 11 206 skanningar):
// 707 skanningar säger "kommit till sorteringsterminalen", varav 482 i
// utlandet och 225 i Sverige. Utan kopplingen till huvudskedet hade de 482
// blivit "Sorteras" mitt i Kina.
//
// ⚠️ INGET DELSKEDE FÅR PÅSTÅ ANKOMSTEN till mottagarlandet. Den är
// huvudskedet `i_landet`. Därför heter delskedet i luften "Landat", inte
// "Landat i Sverige".

import { normalisera } from './sprak.mjs';
import { DELSTEG } from './uppacka.mjs';

export { DELSTEG };
export const INGET = -1;

const NR = {};
const satt = (nyckel, fraser) => {
  const ix = DELSTEG.findIndex((d) => d[0] === nyckel);
  if (ix < 0) throw new Error(`delsteg.mjs: okänt delskede "${nyckel}"`);
  for (const f of fraser) {
    const n = normalisera(f);
    if (NR[n] !== undefined && NR[n] !== ix) {
      throw new Error(`delsteg.mjs: frasen "${f}" pekar på två delskeden — en fras får bara betyda ett.`);
    }
    NR[n] = ix;
  }
};

// ---------------------------------------------------------- skede 0: ordern

satt('forbereds', [
  'Shipment information received',
  'Parcel information received',
  'SHIPPING INFORMATION RECEIVED',
  'Processing information input',
  'Vi har fått en beställning på en leverans och väntar på paketet',
  'We have received a notification from your shipper that they are preparing an item for you. The tracking information will be updated when the parcel is handed over to PostNord.',
]);

// ------------------------------------------------------- skede 1: på väg hit

satt('hamtat', [
  'Shipment picked up',
  'Yanwen Pickup Scan',
  '4PX received shipment.',
  'Port of departure - Received by carrier',
  'Arrived at origin facility',
  'Yanwen facility - Outbound',
]);

satt('utforsel', [
  'The country of origin commences customs declaration.',
  'Clearence processing completed - Export',
  'International shipment release - Export',
]);

satt('flygplats', [
  'Arrived at the origin international airport',
  'Hand over to airline.',
  'Departure from the original airport',
]);

satt('luften', ['International flight has departed']);

satt('landat', [
  'International flight has arrived',
  'Arrival to the destination airport',
]);

// ⚠️ Tullen här är transitlandets, inte Sveriges — därför "Hos tullen" och
// inte "Hos svenska tullen".
satt('tull', [
  'Start Customs Clearence',
  'NOA received',
  'Arrived at the warehouse of Customs Broker',
]);

satt('tullklart', [
  'Clearance processing completed - Import',
  'Released from customs: Customs cleared',
  'Collected at Cargo Terminal',
]);

// --------------------------------------------- skede 2: framme i mottagarlandet

satt('hos_bolaget', [
  'Delivered to local carrier',
  'Early Bird has received the package',
  'THE SHIPMENT ITEM HAS ARRIVED AT THE COUNTRY OF DESTINATION.',
]);

satt('terminal', [
  'Arrived at domestic terminal station',
  'The package has arrived at terminal (T1).',
  'The package has arrived at terminal (T2).',
  'The package has arrived at terminal (T3).',
  'Paket har ankommit till vår terminal',
  'ankommit till terminal',
  'THE SHIPMENT ITEM HAS ARRIVED AT THE DISTRIBUTION TERMINAL.',
]);

// De här två är tvetydiga MELLAN länder, men inte inom skede 2 — där är de
// alltid den svenska sorteringen. Se varningen högst upp.
satt('sorteras', [
  'Arrived at sort facility',
  'Your item is being processed at our sorting center',
  'Sorted',
]);

satt('mot_orten', [
  'Departed from facility',
  'The shipment item has been loaded',
]);

// ------------------------------------------------- skede 3: ute för leverans

satt('forbereds_utk', [
  'Paketet förbereds för leverans',
  'The package is activated for delivery.',
]);

satt('i_bilen', [
  'THE DELIVERY OF THE SHIPMENT ITEM IS IN PROGRESS.',
]);

satt('ombud', [
  'THE SHIPMENT ITEM HAS BEEN DELIVERED TO A SERVICE POINT.',
  'PICK-UP AT SERVICEPOINT, SELECTED BY THE RECEIVER.',
  'Paketet har uppdaterats till ombud',
]);

satt('paketbox', [
  'A compartment is booked',
  'Dropped off at locker by courier',
]);

// ---------------------------------------------------------------------------

// Delskedet en ENSKILD fras bär, utan hänsyn till skede eller ordning.
// INGET när frasen är neutral eller okänd.
export function delstegForFras(rå) {
  const s = NR[normalisera(rå ?? '')];
  return typeof s === 'number' ? s : INGET;
}

// Vilket huvudskede hör delskedet till?
export function huvudskedeFor(delsteg) {
  const d = DELSTEG[delsteg];
  return d ? d[3] : -1;
}

// Hela kedjan → delsteg per skanning.
//
// `handelser` ligger NYAST FÖRST (formatet i uppacka.mjs); klassificeringen
// går kronologiskt för att kunna ärva framåt.
//
// Två regler utöver steg.mjs:
//   1. Ett delskede gäller bara när skanningens EGET huvudskede är det
//      delskedet hör till. Annars är frasen neutral här.
//   2. Ärvningen sker INOM ett huvudskede. En neutral skanning i skede 2
//      ärver aldrig "Genom tullen" från skede 1 — då hade den svenska raden
//      visat var paketet var i Nederländerna.
export function klassificeraDelsteg(handelser) {
  const kron = [...(handelser ?? [])].reverse();
  const hogstaPerSkede = new Map();
  const ut = kron.map((h) => {
    const skede = typeof h?.steg === 'number' ? h.steg : -1;
    if (h?.avvikelse || skede < 0) return { ...h, delsteg: INGET };

    const hogsta = hogstaPerSkede.has(skede) ? hogstaPerSkede.get(skede) : INGET;
    let d = delstegForFras(h?.ra ?? h?.text ?? '');
    if (d !== INGET && huvudskedeFor(d) !== skede) d = INGET;   // regel 1
    if (d === INGET) d = hogsta;                                // regel 2
    if (d !== INGET && d < hogsta) d = hogsta;                  // backar aldrig
    if (d > hogsta) hogstaPerSkede.set(skede, d);
    return { ...h, delsteg: d };
  });
  return ut.reverse();
}
