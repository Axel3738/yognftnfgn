// Var på den internationella sträckan är paketet — "hämtat hos avsändaren",
// "i luften", "genom tullen"?
//
// Bakgrund (Axel 2026-09-20): skedet hette "Internationell transport" och
// kändes "bara skumt". Kunden vill veta att vi har koll: att paketet har
// lämnat lagret, att det ligger på ett flyg, att det är genom tullen. Datan
// vet det redan — fraktbolaget skannar varje sådant steg — men sidan sa det
// inte, för allt mellan avsändaren och Sverige låg i ETT skede.
//
// Det här är alltså ingen ny information. Det är samma skanningar, lästa en
// gång till med en annan fråga.
//
// ⚠️ SAMMA DISCIPLIN SOM steg.mjs: bara fraser som ENTYDIGT betyder ett
// delskede står i tabellen. "Arrived at sort facility" och "Departed from
// facility" händer både i Shenzhen och i Rozenburg — de är neutrala och
// flyttar ingenting. Mätt 2026-09-20: med de tvetydiga fraserna inräknade
// stod 257 av 432 paket som "genom tullen"; med bara de entydiga blev det
// 250, och de 7 andra hade flyttats fram på en skanning som lika gärna kunde
// ha skett i Kina. Ett delskede som gissar är värre än inget delskede.
//
// ⚠️ INGET DELSKEDE FÅR PÅSTÅ SVERIGE. Ankomsten till mottagarlandet är
// huvudskedet `i_landet` och avgörs av steg.mjs, med PostNords
// förhandsaviseringsundantag inbakat. Delskedena beskriver resan dit — de
// slutar vid tullen, aldrig i Sverige. `Landat` säger med flit inte var.
//
// Uppmätt fördelning 2026-09-20 på de 432 paket som stod i internationell
// transport i den publicerade datan (median dygn i delskedet inom parentes):
//   Hämtat hos avsändaren 92 (0,3)   ·  Klart för avfärd 23 (0,8)
//   På flygplatsen 56 (0,7)          ·  I luften 2 (1,0)
//   Landat 8 (1,4)                   ·  Hos tullen 1 (0,2)
//   Genom tullen 250 (1,3)
// "I luften" är med flit ett litet tal: flyget lyfter och landar oftast
// samma dygn, så nästan inget paket STÅR där. Delskedet passeras ändå, och
// syns i historiken.

// Etiketterna och motiven bor i uppacka.mjs — den filen körs också i kundens
// webbläsare. Här bor fraserna som avgör vilket delskede en skanning bär.
import { normalisera } from './sprak.mjs';
import { DELSTEG } from './uppacka.mjs';

export { DELSTEG };
export const INGET = -1;

const NR = {};
const satt = (nyckel, fraser) => {
  const ix = DELSTEG.findIndex((d) => d[0] === nyckel);
  if (ix < 0) throw new Error(`delsteg.mjs: okänt delskede "${nyckel}"`);
  for (const f of fraser) NR[normalisera(f)] = ix;
};

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

satt('luften', [
  'International flight has departed',
]);

satt('landat', [
  'International flight has arrived',
  'Arrival to the destination airport',
]);

// ⚠️ "Start Customs Clearence" och "NOA received" sker i transitlandet, inte
// i Sverige — därför "Hos tullen" och inte "Hos svenska tullen".
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

// Delskedet en ENSKILD skanning bär, utan hänsyn till de andra.
// `rå` = fraktbolagets egen text. INGET när frasen är neutral eller okänd.
export function delstegForFras(rå) {
  const s = NR[normalisera(rå ?? '')];
  return typeof s === 'number' ? s : INGET;
}

// Hela kedjan → delsteg per skanning.
//
// `handelser` ligger NYAST FÖRST (formatet i uppacka.mjs); klassificeringen
// går kronologiskt för att kunna ärva framåt. En skanning utanför det
// internationella skedet får alltid INGET — delskedena beskriver bara den
// sträckan, och `steg` avgör vilken sträcka raden hör till.
//
// `arInternationell(h)` skickas in i stället för att importeras, så modulen
// går att testa utan STEG-tabellen.
export function klassificeraDelsteg(handelser, { arInternationell } = {}) {
  const kron = [...(handelser ?? [])].reverse();
  let hogsta = INGET;
  const ut = kron.map((h) => {
    if (h?.avvikelse) return { ...h, delsteg: INGET };
    if (typeof arInternationell === 'function' && !arInternationell(h)) {
      return { ...h, delsteg: INGET };
    }
    let d = delstegForFras(h?.ra ?? h?.text ?? '');
    if (d === INGET) d = hogsta;            // neutral skanning ärver
    if (d !== INGET && d < hogsta) d = hogsta; // paketet backar aldrig
    if (d > hogsta) hogsta = d;
    return { ...h, delsteg: d };
  });
  return ut.reverse();
}

