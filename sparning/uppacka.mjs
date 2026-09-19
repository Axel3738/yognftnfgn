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
//     v: 1,                       formatversion
//     byggd: <minut>,             när filen byggdes
//     f: ["Vi har fått uppgifterna om paketet", …],   fraser, svenska
//     p: ["Malmö", "Shenzhen", …],                    platser
//     b: ["YunExpress", "4PX", …],                    fraktbolag
//     k: { "YT2624700707772213": [statusIx, bolagIx, [[minut, frasIx, platsIx], …]] }
//   }
//
// Minut = hela minuter sedan 2026-01-01T00:00:00Z. Platsindex -1 = ingen
// plats. Händelserna ligger nyast först.

export const FORMAT = 1;

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

// Minut sedan EPOK → ISO-sträng i UTC.
export function minutTillIso(minut) {
  return new Date((EPOK + minut * 60) * 1000).toISOString();
}

// ISO-sträng (eller millisekunder) → hel minut sedan EPOK. Ogiltig tid ⇒ null.
export function isoTillMinut(tid) {
  const ms = typeof tid === 'number' ? tid : Date.parse(tid);
  if (!ms || Number.isNaN(ms)) return null;
  return Math.round((ms / 1000 - EPOK) / 60);
}

// Normaliserar ett spårningsnummer till uppslagsnyckel: versaler, inga
// mellanslag eller bindestreck. Kunden klistrar in numret som det står i
// mejlet, och det kan bära blanksteg.
export function nyckel(nummer) {
  return String(nummer == null ? '' : nummer).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// Ett paket ur den komprimerade datan. Returnerar null om numret inte finns.
//
//   { nummer, bolag, statusKod, status, handelser: [{ tid, iso, text, plats }] }
//
// `tid` är ett Date-objekt (sidan formaterar det på svenska), `iso` samma sak
// som sträng (testerna jämför mot den). Händelserna ligger nyast först.
export function packaUppEtt(data, nummer) {
  if (!data || !data.k) return null;
  const n = nyckel(nummer);
  const post = data.k[n];
  if (!post) return null;
  const fraser = data.f || [];
  const platser = data.p || [];
  const bolag = data.b || [];
  const rad = STATUSAR[post[0]] || ['', ''];
  const handelser = (post[2] || []).map(function (e) {
    const iso = minutTillIso(e[0]);
    return {
      tid: new Date(iso),
      iso: iso,
      text: fraser[e[1]] == null ? '' : fraser[e[1]],
      plats: e[2] == null || e[2] < 0 ? null : (platser[e[2]] == null ? null : platser[e[2]]),
    };
  });
  return {
    nummer: n,
    bolag: bolag[post[1]] == null ? null : bolag[post[1]],
    statusKod: rad[0],
    status: rad[1],
    handelser: handelser,
  };
}

// Alla paket, som en lista. Används av testerna och av bygget — sidan slår
// bara upp ett i taget.
export function packaUpp(data) {
  if (!data || !data.k) return [];
  const ut = [];
  for (const n in data.k) if (Object.prototype.hasOwnProperty.call(data.k, n)) ut.push(packaUppEtt(data, n));
  return ut;
}
