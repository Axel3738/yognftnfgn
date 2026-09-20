// Formatet som spårningssidan läser — och uppackaren.
//
// ⚠️ Den här filen körs på TVÅ ställen: i Node (bygget och testerna) och i
// kundens webbläsare. `sparning/sida.mjs` bäddar in filens källkod i sidan
// med orden `export ` bortstrippade, så det finns bara EN uppackare och
// formatet kan aldrig tolkas olika på de två ställena.
//
// Därför: ingen import, inget Node-API, inga nyare språkfinesser än ES2019.
//
// Formatet är ordbokskomprimerat. Rått väger 950 paket ~1,1 MB, mest för att
// samma fras ("Shipment information received") och samma plats ("MALMÖ
// BREVTERMINAL") står om och om igen. Med fraserna och platserna i varsin
// lista, och en händelse som [minut, frasindex, platsindex], blir det ~10 %
// av det (mätt 2026-09-19 på 204 paket, 1 873 händelser).
//
//   {
//     v: 2,                       formatversion
//     byggd: <minut>,             när filen byggdes
//     land: "Sverige",            mottagarlandet, för stegets etikett
//     f: ["Vi har fått uppgifterna om paketet", …],   fraser, svenska
//     p: ["Malmö", "Shenzhen", …],                    platser
//     l: ["Sverige", "Kina", …],                      länder
//     b: ["YunExpress", "4PX", …],                    fraktbolag
//     k: { "YT2624700707772213": [statusIx, bolagIx, [[minut, frasIx, platsIx, stegIx, landIx, flaggor], …]] }
//   }
//
// Minut = hela minuter sedan 2026-01-01T00:00:00Z. Plats- och landindex -1 =
// okänt. Händelserna ligger nyast först. `stegIx` pekar in i STEG nedan och
// är -1 när skanningen inte hör till något skede. `flaggor` är en bitmask:
// 1 = AVVIKELSE (störning, retur, misslyckat försök).
//
// ⚠️ LANDET LIGGER I EGET FÄLT MED FLIT. Kunden vill läsa orten ("Malmö"),
// men fraktbolagets rådata säger "MALMO, SCHNER, SE" och landet får inte
// försvinna på vägen — den fullständiga historiken ska kunna visa både
// ursprungsland och transitland (Axels krav 2026-09-19). `platsMedLand()`
// sätter ihop dem igen: "Rozenburg, Nederländerna".
//
// ⚠️ Format 1 hade varken steg eller land. `packaUppEtt` läser båda: saknas
// fälten blir `steg` -1 och `land` null, och historiken visas som förut.

export const FORMAT = 2;

// 2026-01-01T00:00:00Z i sekunder. Tiderna räknas härifrån i minuter, vilket
// ger sex siffror i stället för tretton och håller filen liten.
export const EPOK = 1767225600;

// Shopifys fulfillment-status → svensk etikett för kunden. Ordningen är
// listans index i `k`-postens första fält, så den får bara växa på slutet.
export const STATUSAR = [
  ['CONFIRMED', 'Bekräftad'],
  ['IN_TRANSIT', 'På väg'],
  ['OUT_FOR_DELIVERY', 'Ute för leverans'],
  ['READY_FOR_PICKUP', 'Finns att hämta'],
  ['DELIVERED', 'Levererad'],
  ['ATTEMPTED_DELIVERY', 'Leveransförsök misslyckades'],
  ['FAILURE', 'Problem med leveransen'],
];

// Kundens fem skeden. Sammanfattningsvyn visar dem alla, alltid, i den här
// ordningen — de som passerats med datum, de som återstår i grått, så kunden
// ser både var paketet är och vad som händer sedan.
//
// `{{land}}` byts mot mottagarlandet ur datan (`data.land`). Butiken säljer
// också till Norge, och "Ankommit till Sverige" hade varit fel där.
//
// ⚠️ Ordningen ÄR stegnumret. Lägg aldrig till ett skede i mitten — då pekar
// all redan byggd data fel. Nya skeden läggs sist, eller så höjs FORMAT.
// `steg.mjs` bär SAMMA ordning som konstanter (BESTALLD=0 … LEVERERAT=4) —
// de två filerna måste ändras i samma commit eller inte alls.
//
// ⚠️ NYCKELN är kontraktet, etiketten är fri text. `kontroll.mjs` slår upp
// 'i_landet' och 'levererat' på nyckeln; byt aldrig en nyckel utan att läsa
// den filen. Etiketterna skrevs om 2026-09-20 (Axels beslut): kunden ska se
// leveransens milstolpar, inte logistiken. "Paketet är på väg" hette förut
// steg 1 och bar utländska ortnamn — nu heter det "Internationell transport"
// och bär ingen geografi alls (se `sammanfattning()` nedan).
export const STEG = [
  ['bestalld', 'Beställningen är registrerad'],
  ['pa_vag', 'Internationell transport'],
  ['i_landet', 'Ankommit till {{land}}'],
  ['utkorning', 'Ute för leverans'],
  ['levererat', 'Levererat'],
];

// Första skedet som per definition ligger i mottagarlandet. Allt före det är
// utlandet, och där visar sammanfattningen aldrig en ort. Härlett ur STEG,
// aldrig skrivet som en siffra — annars är det ännu en sanning som kan glida.
export const I_LANDET_NR = STEG.findIndex((rad) => rad[0] === 'i_landet');

export const STANDARDLAND = 'Sverige';

// Minut sedan EPOK → ISO-sträng i UTC.
export function minutTillIso(minut) {
  return new Date((EPOK + minut * 60) * 1000).toISOString();
}

// ISO-sträng (eller millisekunder) → hel minut sedan EPOK. Ogiltig tid ⇒ null.
//
// ⚠️ Nedåt, inte avrundat. Med Math.round blev en skanning 10:14:30 till
// 10:15, och då pekade sidan på en minut fraktbolaget aldrig skrivit.
// `sparning/kontroll.mjs` hittade det på 578 av 1 851 riktiga skanningar
// 2026-09-19: tiden ska kapas som en klocka gör det, aldrig avrundas uppåt.
export function isoTillMinut(tid) {
  const ms = typeof tid === 'number' ? tid : Date.parse(tid);
  if (!ms || Number.isNaN(ms)) return null;
  return Math.floor((ms / 1000 - EPOK) / 60);
}

// Normaliserar ett spårningsnummer till uppslagsnyckel: versaler, inga
// mellanslag eller bindestreck. Kunden klistrar in numret som det står i
// mejlet, och det kan bära blanksteg.
export function nyckel(nummer) {
  return String(nummer == null ? '' : nummer).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Orten och landet ihop, för den fullständiga historiken: "Rozenburg,
// Nederländerna". Är orten redan landets namn ("Kina", "Sverige") eller
// saknas landet blir det bara orten — "Kina, Kina" hjälper ingen.
export function platsMedLand(plats, land) {
  if (!plats) return land || null;
  if (!land || plats === land) return plats;
  return plats + ', ' + land;
}

// Stegets etikett med mottagarlandet inskrivet.
export function stegEtikett(stegIx, land) {
  var rad = STEG[stegIx];
  if (!rad) return '';
  return rad[1].replace('{{land}}', land || STANDARDLAND);
}

// Får ortnamnet i skanningen `h` visas i sammanfattningen?
//
// Två spärrar, och de behövs båda (mätt 2026-09-19 på 1 055 riktiga paket):
//
//   1. SKEDET avgör i första hand. Allt före `i_landet` är utlandet, och där
//      visas ingen ort alls. Det är `steg.mjs` som redan avgjort landsfrågan
//      en gång, med PostNords förhandsaviseringsundantag inbakat — vylagret
//      ska inte göra om den bedömningen.
//   2. Landet är en extra spärr ovanpå, för en sen skanning som ärvt ett
//      högre skede.
//
// ⚠️ Filtrera ALDRIG på landet ensamt. `landFor()` känner bara de svenska
// orter som faktiskt mätts, så `landFor('LULEÅ PAKETTERMINAL LULEÅ')` och
// `landFor('KIRUNA')` ger båda null — en ren landsregel hade tystat svenska
// utlämningsställen. Och `landFor('Hongqiao')` ger också null, så den
// omvända regeln hade släppt igenom just det kinesiska terminalnamnet.
//
// ⚠️ "Ankommit till Sverige · Sverige" hjälper ingen: är orten samma ord som
// landet är den ingen ort, bara en landskod som städats.
function ortFor(stegIx, h, land) {
  if (!h || !h.plats) return null;
  if (stegIx < I_LANDET_NR) return null;
  if (h.land && land && h.land !== land) return null;
  if (h.plats === land) return null;
  return h.plats;
}

// De fem skedena för ett paket, byggda ur dess egna skanningar.
//
// Ett skede är `nadd` bara när en riktig skanning bär det steget — aldrig
// för att ett senare skede är nått. Hoppar fraktbolaget över "Ute för
// leverans" (det gör de oftast: 13 av 204 paket hade någon utkörningssignal,
// mätt 2026-09-19) står det skedet kvar som ogjort, och sammanfattningen
// ljuger inte om att paketet varit ute för leverans.
//
// `tid` är den FÖRSTA skanningen i skedet — när paketet nådde dit.
//
// `senastTid`/`senastIso` är den SENASTE skanningen i samma skede, och de
// finns av ett mätt skäl: 544 av 1 055 paket (51,6 %) står i internationell
// transport, och den sträckan tar 4–9 dygn. Utan den raden står hela sidan
// stilla i en vecka för varannan kund, som då tror att paketet fastnat.
// `tid`/`iso` rörs inte — `kontroll.mjs` krav 3 matchar på dem.
//
// `plats` är den ort vyn FÅR visa (se ortFor ovan). `raPlats` och `land` är
// skanningens egna värden, kvar så att `kontroll.mjs` kan mäta att filtret
// gjort rätt i stället för att lita på det.
export function sammanfattning(handelser, land) {
  var ut = [];
  for (var i = 0; i < STEG.length; i++) {
    ut.push({
      nr: i, nyckel: STEG[i][0], etikett: stegEtikett(i, land), nadd: false,
      tid: null, iso: null, text: null, plats: null, raPlats: null, land: null,
      senastTid: null, senastIso: null,
    });
  }
  var hogsta = -1;
  for (var j = 0; j < handelser.length; j++) {
    var h = handelser[j];
    if (h.avvikelse) continue;
    var s = h.steg;
    if (typeof s !== 'number' || s < 0 || s >= ut.length) continue;
    if (s > hogsta) hogsta = s;
    var rad = ut[s];
    // Händelserna ligger nyast först, så den sist sedda i ett skede är den
    // äldsta — alltså när paketet nådde dit.
    if (!rad.nadd || (rad.iso && h.iso && h.iso < rad.iso)) {
      rad.nadd = true;
      rad.tid = h.tid;
      rad.iso = h.iso;
      rad.text = h.text;
      rad.raPlats = h.plats;
      rad.land = h.land == null ? null : h.land;
      rad.plats = ortFor(s, h, land);
    }
    // Den nyaste i skedet är den första vi ser, eftersom listan är nyast först.
    if (!rad.senastIso || (h.iso && h.iso > rad.senastIso)) {
      rad.senastTid = h.tid;
      rad.senastIso = h.iso;
    }
  }
  return { steg: ut, nu: hogsta };
}

// Ett paket ur den komprimerade datan. Returnerar null om numret inte finns.
//
//   { nummer, bolag, statusKod, status, handelser: [{ tid, iso, text, plats, steg, avvikelse }],
//     sammanfattning: { steg: [...], nu }, avvikelser: [...] }
//
// `tid` är ett Date-objekt (sidan formaterar det på svenska), `iso` samma sak
// som sträng (testerna jämför mot den). Händelserna ligger nyast först.
export function packaUppEtt(data, nummer) {
  if (!data || !data.k) return null;
  var n = nyckel(nummer);
  var post = data.k[n];
  if (!post) return null;
  var fraser = data.f || [];
  var platser = data.p || [];
  var lander = data.l || [];
  var bolag = data.b || [];
  var land = data.land || STANDARDLAND;
  var rad = STATUSAR[post[0]] || ['', ''];
  var handelser = (post[2] || []).map(function (e) {
    var iso = minutTillIso(e[0]);
    var plats = e[2] == null || e[2] < 0 ? null : (platser[e[2]] == null ? null : platser[e[2]]);
    var hland = e[4] == null || e[4] < 0 ? null : (lander[e[4]] == null ? null : lander[e[4]]);
    return {
      tid: new Date(iso),
      iso: iso,
      text: fraser[e[1]] == null ? '' : fraser[e[1]],
      plats: plats,
      land: hland,
      platsMedLand: platsMedLand(plats, hland),
      steg: typeof e[3] === 'number' ? e[3] : -1,
      avvikelse: !!(e[5] & 1),
    };
  });
  return {
    nummer: n,
    bolag: bolag[post[1]] == null ? null : bolag[post[1]],
    statusKod: rad[0],
    status: rad[1],
    land: land,
    handelser: handelser,
    sammanfattning: sammanfattning(handelser, land),
    avvikelser: handelser.filter(function (h) { return h.avvikelse; }),
  };
}

// Alla paket, som en lista. Används av testerna och av bygget — sidan slår
// bara upp ett i taget.
export function packaUpp(data) {
  if (!data || !data.k) return [];
  var ut = [];
  for (var n in data.k) if (Object.prototype.hasOwnProperty.call(data.k, n)) ut.push(packaUppEtt(data, n));
  return ut;
}
