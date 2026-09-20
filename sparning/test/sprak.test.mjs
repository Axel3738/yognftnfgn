// Fraktbolagens texter → svenska, och deras platssträngar → en ort.
// Ren logik utan nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FRASER, normalisera, oversattFras, stadaPlats, okandaFraser } from '../sprak.mjs';
import { skedeForFras, I_LANDET } from '../steg.mjs';

// De 75 distinkta skanningstexter som faktiskt mättes: 204 av Bäverbutikens
// paket hos 17TRACK 2026-09-19, 1 873 händelser. Listan är rådata, inte ett
// urval — går en av dem inte att översätta ser kunden engelska på sidan.
const MATTA_FRASER = [
  "Shipment information received",
  "Arrived at sort facility",
  "Departed from facility",
  "Parcel information received",
  "Departed from sort facility",
  "Arrived at origin facility",
  "Shipment picked up",
  "Shipment is in transit to next facility",
  "The country of origin commences customs declaration.",
  "Clearence processing completed - Export",
  "Arrived at the origin international airport",
  "THE SHIPMENT ITEM IS UNDER TRANSPORTATION.",
  "Shipment arrived at facility and measured.",
  "Delivered to local carrier",
  "Shipment is ready for outbound",
  "Clearance processing completed - Import",
  "Start Customs Clearence",
  "Arrived at the warehouse of Customs Broker",
  "Collected at Cargo Terminal",
  "NOA received",
  "International flight has arrived",
  "International flight has departed",
  "Shipment picked up.",
  "Depart from facility to service provider.",
  "Departure from the original airport",
  "Hand over to airline.",
  "Arrive in transit center",
  "Released from customs: customs cleared.",
  "Arrival to the destination airport",
  "Parcel outbound from transit center",
  "The shipment item is under transportation.",
  "Paketet förbereds för leverans",
  "Paketet har levererats hem till dig",
  "Vi har fått en beställning på en leverans och väntar på paketet",
  "SHIPPING INFORMATION RECEIVED",
  "The booking of the delivery is completed.",
  "THE SHIPMENT ITEM HAS ARRIVED AT THE COUNTRY OF DESTINATION.",
  "The shipment item has been loaded.",
  "Your item is being processed at our sorting center.",
  "Paket har ankommit till vår terminal",
  "The shipment item has been delivered to the recipient's mailbox.",
  "The package has arrived at terminal (T2).",
  "The package is activated for delivery.",
  "The package has arrived at terminal (T1).",
  "Early Bird has received the package.",
  "The package has been delivered to the mailbox.",
  "THE DELIVERY OF THE SHIPMENT ITEM IS IN PROGRESS.",
  "THE SHIPMENT ITEM HAS ARRIVED AT THE DISTRIBUTION TERMINAL.",
  "THE SHIPMENT ITEM HAS BEEN DELIVERED TO A SERVICE POINT.",
  "Sorted",
  "Return to customers.",
  "No channel available",
  "Arrived at domestic terminal station",
  "International shipment release - Export",
  "Port of departure - Received by carrier",
  "Yanwen facility - Outbound",
  "We have received a notification from your shipper that they are preparing an item for you. The tracking information will be updated when the parcel is handed over to PostNord.",
  "Processing information input",
  "Yanwen Pickup Scan",
  "Shipment has been returned to sender.",
  "Vi upplever en leveransstörning - leveransdatum uppdateras",
  "A new delivery attempt has been scheduled.",
  "The courier did not have the package with them when it was supposed to be delivered.",
  "The package has been delivered to the door.",
  "Picked up at locker by customer",
  "Dropped off at locker by courier",
  "A compartment is booked",
  "In transit to destination",
  "E-mail notification has been sent to the recipient.",
  "The shipment item has been delivered at the recipient's door.",
  "4PX received shipment.",
  "THE SHIPMENT ITEM HAS BEEN DELIVERED.",
  "THE SHIPMEN ITEM HAS BEEN DELIVERED TO THE RECIPIENTS MAILBOX.",
  "THE SHIPMENT ITEM HAS BEEN LOADED.",
  "PICK-UP AT SERVICEPOINT, SELECTED BY THE RECEIVER.",
];

// ------------------------------------------------------------- normalisering

test('normalisera: versaler, mellanslag och avslutande punkt ger samma nyckel', () => {
  assert.equal(normalisera('Shipment information received'), 'shipment information received');
  assert.equal(normalisera('SHIPMENT INFORMATION RECEIVED'), 'shipment information received');
  assert.equal(normalisera('  Shipment   information  received.  '), 'shipment information received');
  assert.equal(normalisera('Shipment picked up.'), normalisera('SHIPMENT PICKED UP'));
  assert.equal(normalisera('Hand over to airline...'), 'hand over to airline');
});

test('normalisera: punkten mitt i texten står kvar', () => {
  assert.match(normalisera('Preparing an item. Tracking will update.'), /item\. tracking/);
});

test('normalisera: tomt och saknat ger tom nyckel', () => {
  assert.equal(normalisera(''), '');
  assert.equal(normalisera(null), '');
  assert.equal(normalisera(undefined), '');
});

// ------------------------------------------------------------- fraser

test('varje fras i fraser.json ger kand=true genom oversattFras()', () => {
  const nycklar = Object.keys(FRASER);
  assert.ok(nycklar.length >= 70, `ordboken ska bära mätningens fraser, har ${nycklar.length}`);
  for (const nyckel of nycklar) {
    const svar = oversattFras(nyckel, null);
    assert.equal(svar.kand, true, `okänd nyckel: ${nyckel}`);
    assert.ok(svar.text && svar.text.length > 0, `tom text för: ${nyckel}`);
  }
});

test('alla 75 mätta fraser översätts — ingen engelska når kunden', () => {
  assert.equal(MATTA_FRASER.length, 75);
  for (const rå of MATTA_FRASER) {
    const svar = oversattFras(rå, 'InTransit_Other');
    assert.equal(svar.kand, true, `ingen ordbokspost för: ${rå}`);
    assert.ok(svar.text, `tom text för: ${rå}`);
  }
});

test('de mätta fraserna översätts även i VERSALER och med punkt', () => {
  for (const rå of MATTA_FRASER) {
    const svar = oversattFras(`${rå.toUpperCase()}.`, null);
    assert.equal(svar.kand, true, `versalversionen missades: ${rå}`);
  }
});

test('ordbokens svenska är svensk: ingen engelska, inga utropstecken', () => {
  for (const [nyckel, text] of Object.entries(FRASER)) {
    assert.ok(!text.includes('!'), `utropstecken i: ${nyckel}`);
    assert.ok(!/\.$/.test(text), `avslutande punkt i: ${nyckel}`);
    assert.ok(!/\b(the|shipment|delivered|facility|customs)\b/i.test(text), `engelska kvar i: ${nyckel}`);
  }
});

test('ordboken översätter till kundens språk, inte ord för ord', () => {
  assert.equal(oversattFras('Shipment information received').text, 'Vi har fått uppgifterna om paketet');
  assert.equal(oversattFras('Departed from sort facility').text, 'Paketet har lämnat sorteringsterminalen');
  assert.equal(oversattFras('Clearence processing completed - Export').text, 'Klart i tullen i avsändarlandet');
  assert.equal(oversattFras('NOA received').text, 'Paketet är anmält till tullen');
  assert.equal(oversattFras('THE SHIPMENT ITEM HAS BEEN DELIVERED.').text, 'Paketet är levererat');
});

// ⚠️ Den här regeln föddes 2026-09-20, när standardvyn slutade visa orter.
//
// Fyra fraser påstod mottagarlandet fast skanningen skedde i Nederländerna:
// importtullen klareras där, och "destination airport" är Amsterdam för ett
// paket som ska till Umeå (se varningen i steg.mjs:68-74). Så länge orten
// stod i vyn löste "(Nederländerna)" motsägelsen. Utan den läste kunden
// "Klart i tullen i mottagarlandet" rakt ovanför ett grått, odaterat
// "Ankommit till Sverige" — mätt på 7 riktiga paket i den publicerade datan
// 2026-09-20.
//
// Regeln: en fras får bara säga mottagarlandet om fraktbolagets egen text
// står i I_LANDET-tabellen i steg.mjs. Den tabellen är det enda stället där
// vi vet att skanningen verkligen skedde i landet.
test('bara fraser som ÄR ankomst får påstå mottagarlandet', () => {
  const ankomst = new Set(Object.keys(FRASER).filter((n) => skedeForFras(n) === I_LANDET));
  const pastar = [];
  for (const [nyckel, text] of Object.entries(FRASER)) {
    if (!/mottagarlandet|ditt land|din adress/i.test(text)) continue;
    if (!ankomst.has(nyckel)) pastar.push(`${nyckel} → ${text}`);
  }
  assert.deepEqual(pastar, [], `fraser som påstår mottagarlandet utan att vara ankomst:\n  ${pastar.join('\n  ')}`);
});

test('redan svenska fraser släpps igenom som de är', () => {
  const a = oversattFras('Paketet har levererats hem till dig', 'Delivered_Other');
  assert.deepEqual(a, { text: 'Paketet har levererats hem till dig', kand: true });

  // Svensk fras som inte står i ordboken: å/ä/ö räcker för att släppa igenom.
  const b = oversattFras('Paketet ligger hos ditt ombud i Åmål.', 'InTransit_Other');
  assert.deepEqual(b, { text: 'Paketet ligger hos ditt ombud i Åmål', kand: true });
});

test('okänd fras faller tillbaka på subStatus, med kand=false', () => {
  assert.deepEqual(oversattFras('Linehaul scan at gateway hub', 'InTransit_Other'), {
    text: 'Paketet är på väg', kand: false,
  });
  assert.deepEqual(oversattFras('Consignment handed to final mile', 'Delivered_Other'), {
    text: 'Paketet är levererat', kand: false,
  });
  assert.deepEqual(oversattFras('Held at depot', 'InfoReceived'), {
    text: 'Vi har fått uppgifterna om paketet', kand: false,
  });
  assert.deepEqual(oversattFras('Awaiting collection', 'AvailableForPickup_Other'), {
    text: 'Paketet finns att hämta hos ombudet', kand: false,
  });
  assert.deepEqual(oversattFras('Something went wrong', 'Exception_Other'), {
    text: 'Det har blivit ett problem med leveransen', kand: false,
  });
  assert.deepEqual(oversattFras('Out with driver', 'OutForDelivery_Other'), {
    text: 'Paketet är ute för leverans', kand: false,
  });
});

test('subStatus med egen mening vinner över prefixets', () => {
  assert.equal(oversattFras('Unknown scan', 'InTransit_CustomsProcessing').text, 'Paketet ligger hos tullen');
  assert.equal(oversattFras('Unknown scan', 'Exception_Returned').text, 'Paketet har skickats tillbaka till avsändaren');
});

test('utan träff och utan subStatus blir texten null — hellre tyst än engelska', () => {
  assert.deepEqual(oversattFras('Linehaul scan at gateway hub', null), { text: null, kand: false });
  assert.deepEqual(oversattFras('Linehaul scan at gateway hub', ''), { text: null, kand: false });
  assert.deepEqual(oversattFras('Linehaul scan at gateway hub', 'Expired_Other'), { text: null, kand: false });
  assert.deepEqual(oversattFras('', null), { text: null, kand: false });
  assert.deepEqual(oversattFras(null, null), { text: null, kand: false });
});

test('okandaFraser samlar det ordboken missade, normaliserat och utan dubbletter', () => {
  oversattFras('Brand New Scan Text From Carrier', 'InTransit_Other');
  oversattFras('BRAND NEW SCAN TEXT FROM CARRIER.', 'InTransit_Other');
  const okanda = okandaFraser();
  assert.ok(Array.isArray(okanda));
  assert.equal(okanda.filter((f) => f === 'brand new scan text from carrier').length, 1);
  // Kända fraser hamnar aldrig där.
  assert.ok(!okanda.includes('noa received'));
  assert.ok(!okanda.includes('paketet har levererats hem till dig'));
});

// ------------------------------------------------------------- platser

test('stadaPlats: de mätta platserna blir orter kunden känner igen', () => {
  assert.equal(stadaPlats('MALMO, SCHNER, SE'), 'Malmö');
  assert.equal(stadaPlats('MALMÖ BREVTERMINAL MALMÖ'), 'Malmö brevterminal');
  assert.equal(stadaPlats('HOLLAND, NORTH HOLLAND, NL'), 'Nederländerna');
  assert.equal(stadaPlats('Mainland China, CN'), 'Kina');
  assert.equal(stadaPlats('ROZENBURG, ROZENBURG, NL'), 'Rozenburg');
  assert.equal(stadaPlats('SE'), 'Sverige');
  assert.equal(stadaPlats('NL'), 'Nederländerna');
  assert.equal(stadaPlats('CN'), 'Kina');
  assert.equal(stadaPlats('BE'), 'Belgien');
  assert.equal(stadaPlats('SWEDEN'), 'Sverige');
  assert.equal(stadaPlats('Sweden'), 'Sverige');
  assert.equal(stadaPlats('TORSVIK PAKETTERMINAL JÖNKÖPING'), 'Torsvik paketterminal');
});

test('stadaPlats: fler mätta former ger vettig svenska', () => {
  assert.equal(stadaPlats('MALMÖ PAKETTERMINAL MALMÖ'), 'Malmö paketterminal');
  assert.equal(stadaPlats('NÄSSJÖ BREVTERMINAL'), 'Nässjö brevterminal');
  assert.equal(stadaPlats('SUNDSVALL BREVTERMINAL SUNDSVALL'), 'Sundsvall brevterminal');
  assert.equal(stadaPlats('VEDDESTA PAKETTERMINAL JÄRFÄLLA'), 'Veddesta paketterminal');
  assert.equal(stadaPlats('ÖREBRO PAKETTERMINAL ÖREBRO'), 'Örebro paketterminal');
  assert.equal(stadaPlats('BORÅS'), 'Borås');
  assert.equal(stadaPlats('PITEÅ'), 'Piteå');
  assert.equal(stadaPlats('ÅNGE'), 'Ånge');
  assert.equal(stadaPlats('POSTNORD'), 'Postnord');
});

test('stadaPlats: postnumret framför orten faller bort', () => {
  assert.equal(stadaPlats('644 35 Torshälla'), 'Torshälla');
  assert.equal(stadaPlats('114 26 Stockholm'), 'Stockholm');
  assert.equal(stadaPlats('216 12 Limhamn'), 'Limhamn');
});

test('stadaPlats: blandad text lämnas som den är', () => {
  assert.equal(stadaPlats('Early Bird Malmö'), 'Early Bird Malmö');
  assert.equal(stadaPlats('Terminal Malmö'), 'Terminal Malmö');
  assert.equal(stadaPlats('Instabox DC Växjö'), 'Instabox DC Växjö');
  assert.equal(stadaPlats('Point Packsal Växjö (Kalmar)'), 'Point Packsal Växjö (Kalmar)');
  assert.equal(stadaPlats('CityMail-kontor Linköping'), 'CityMail-kontor Linköping');
  assert.equal(stadaPlats('Hongqiao'), 'Hongqiao');
  assert.equal(stadaPlats('  Malmö  '), 'Malmö');
});

test('stadaPlats: butiksombud behåller sitt namn men slipper upprepningen', () => {
  assert.equal(stadaPlats('ICA NÄRA GÄLLÖ GÄLLÖ'), 'ICA nära Gällö');
  assert.equal(stadaPlats('TEMPO LJUSTERÖ LJUSTERÖ'), 'Tempo Ljusterö');
  assert.equal(stadaPlats('HEDVIGSBORGS BUTIK BORÅS'), 'Hedvigsborgs butik Borås');
});

test('stadaPlats: tomt eller obegripligt ger null', () => {
  assert.equal(stadaPlats(''), null);
  assert.equal(stadaPlats('   '), null);
  assert.equal(stadaPlats(null), null);
  assert.equal(stadaPlats(undefined), null);
  assert.equal(stadaPlats('SVHL'), null, 'kod utan vokal är ingen ort');
  assert.equal(stadaPlats('--'), null);
});

test('stadaPlats: landskoden faller bort när det finns en ort', () => {
  assert.equal(stadaPlats('Shenzhen, CN'), 'Shenzhen');
  assert.equal(stadaPlats('Göteborg, SE'), 'Göteborg');
});

// ------------------------------------------------- granskningen 2026-09-19
//
// Tre hål som granskningen hittade. Varje test här fångar ett fel som
// verkligen fanns, inte ett tänkt.

test('engelsk rad med svenskt ortnamn släpps INTE igenom som svenska', () => {
  // Felet: å/ä/ö ensamt räknades som "redan svensk". Fraktbolagens engelska
  // rader bär svenska ortnamn, så hela meningen gick ut på engelska till
  // kunden — och med kand=true, alltså osynlig för okandaFraser().
  const a = oversattFras('The item has been delivered in Åkersberga', 'Delivered_Other');
  assert.equal(a.kand, false);
  assert.equal(a.text, 'Paketet är levererat');

  const b = oversattFras('Arrived at MALMÖ BREVTERMINAL', 'InTransit_Other');
  assert.equal(b.kand, false);
  assert.equal(b.text, 'Paketet är på väg');

  // Och de ska gå att hitta i loggen, så ordboken kan växa.
  assert.ok(okandaFraser().includes('arrived at malmö brevterminal'));
});

test('äkta svensk text med å/ä/ö släpps fortfarande igenom', () => {
  // Spärren ovan får inte döda genomsläppet. Mätningens fyra svenska fraser
  // med å/ä/ö (2026-09-19) står i ordboken; det här är formen de har.
  for (const rad of [
    'Paketet väntar på ditt ombud i Åmål',
    'Försändelsen är försenad på grund av väderläget',
    'Vi kör ut paketet i morgon förmiddag',
  ]) {
    const svar = oversattFras(rad, 'InTransit_Other');
    assert.equal(svar.kand, true, `demoterades felaktigt: ${rad}`);
    assert.equal(svar.text, rad);
  }
});

test('okänd SVENSK text i versaler skriker inte åt kunden', () => {
  // Felet: texten gick ut ordagrant. Samma källa som skriver svenska skriver
  // också i versaler — mätningen har både "The shipment item has been
  // delivered." och versalversionen av samma mening.
  const svar = oversattFras('PAKETET ÄR FÖRSENAT PÅ GRUND AV VÄDER', 'Exception_Other');
  assert.equal(svar.kand, true);
  assert.equal(svar.text, 'Paketet är försenat på grund av väder');
});

test('ärvda objektnycklar ger aldrig en funktion som text', () => {
  // Felet: uppslagen gick rakt på objektlitteralerna, så nyckeln
  // "constructor" svarade med Object — och anroparen hade skrivit ut
  // "function Object() { [native code] }" som ortstext respektive händelse.
  for (const nyckel of ['constructor', 'valueOf', 'hasOwnProperty', '__proto__']) {
    const plats = stadaPlats(nyckel);
    assert.ok(plats === null || typeof plats === 'string', `plats blev ${typeof plats}: ${nyckel}`);

    const a = oversattFras('Helt ny skanningstext', nyckel);
    assert.ok(a.text === null || typeof a.text === 'string', `text blev funktion: ${nyckel}`);
    const b = oversattFras('Helt ny skanningstext', `${nyckel}_Other`);
    assert.ok(b.text === null || typeof b.text === 'string', `prefixtext blev funktion: ${nyckel}`);
  }
  // Före rättningen svarade LANDSNAMN['constructor'] med Object-funktionen
  // och stadaPlats returnerade den; nu är det bara ett obegripligt ord som
  // åker vidare som text.
  assert.equal(stadaPlats('constructor'), 'constructor');
  assert.deepEqual(oversattFras('Helt ny skanningstext', 'constructor'), { text: null, kand: false });
});

test('stadaPlats: fel typ in ger null, aldrig "[object"', () => {
  assert.equal(stadaPlats({}), null);
  assert.equal(stadaPlats({ city: 'Malmö' }), null);
  assert.equal(stadaPlats(['MALMO', 'SE']), null);
  assert.equal(stadaPlats(true), null);
  assert.equal(stadaPlats(0), null);
});

test('ordbokens svenska lovar inget som mätningen motsäger', () => {
  // "Port of departure" står på paket som sedan flyger ("International flight
  // has departed" i samma kedja, mätt 2026-09-19), så texten får inte påstå
  // en hamn.
  assert.ok(!Object.values(FRASER).some((t) => /hamn/i.test(t)), 'hamn i ordboken');
  assert.equal(
    oversattFras('Port of departure - Received by carrier').text,
    'Fraktbolaget har tagit emot paketet på avgångsorten',
  );
});
