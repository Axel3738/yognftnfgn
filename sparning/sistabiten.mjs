// Sista biten i Sverige: vilket bolag kör hem paketet, och vad heter det
// hos dem?
//
// Bakgrund (Axel 2026-09-20): "jag har ju betalat för den här jävla 17track,
// och den ger last mile tracking … lägg in båda spårningsnumren, så står det
// om det skickas med PostNord eller vad det nu skickas med, så att man
// enkelt kan gå in på PostNords hemsida från vår tracking page."
//
// Han hade rätt, och vi läste bara aldrig fältet. 17TRACK lämnar det i
// `track_info.misc_info`:
//
//   { local_provider: "PostNord Sweden", local_number: "UJ338439355SE",
//     local_key: 19241 }
//
// Mätt 2026-09-20 på butikens 1 055 paket (läsning kostar ingen kvot):
//   CityMail        251   nyckel 100405   nummer på alla 251
//   PostNord Sweden 189   nyckel 19241    nummer på alla 189
//   Early Bird      101   nyckel 100225   nummer på alla 101
//   SE-U-DHL         68   nyckel 0        nummer på alla 68
//   SE-INSTABEE      13   nyckel 0        nummer på alla 13
//   Postnord          1   nyckel 0        (samma bolag, annan stavning)
//   inget            432                  (paketet är ännu inte i Sverige)
//
// ⚠️ LÄNKARNA ÄR PROVADE, INTE GISSADE. Varje adress nedan har hämtats med
// ett riktigt spårningsnummer 2026-09-20 och svarat 200. Två av dem tar
// numret i adressen (djuplänk), resten gör det inte — då pekar länken på
// bolagets egen spårningssida och numret står bredvid så kunden kan klistra
// in det. Gissa aldrig en djuplänk: en 404 mitt i en leverans är värre än
// ingen länk alls. `https://www.postnord.se/vara-verktyg/spara-brev-och-paket`
// svarade t.ex. 403 och ser helt rimlig ut.
//
// ⚠️ `local_key` är 0 för DHL och Instabee, så uppslaget måste kunna gå på
// NAMNET också. Namnen är fraktbolagets egna ("SE-U-DHL"), inte något kunden
// känner igen — därför `visas` bredvid.

// nyckel = 17TRACK:s carrier key (0 = bolaget saknar en), namn = det
// `local_provider` faktiskt innehåller, visas = det kunden ska läsa.
const BOLAG = [
  {
    nyckel: 19241, namn: ['postnord sweden', 'postnord'], visas: 'PostNord',
    // Provad 2026-09-20 med UJ338439355SE → HTTP 200.
    mall: 'https://portal.postnord.com/tracking/details/{nr}',
  },
  {
    nyckel: 100405, namn: ['citymail'], visas: 'CityMail',
    // citymail.se/spara-paket/ svarar 200, men sidan läser inte numret ur
    // adressen — den bär ett inbäddat sökfält. Därför ingen djuplänk.
    mall: 'https://www.citymail.se/spara-paket/',
  },
  {
    nyckel: 100225, namn: ['early bird', 'earlybird'], visas: 'Early Bird',
    mall: 'https://earlybird.se/',
  },
  {
    nyckel: 0, namn: ['se-u-dhl', 'dhl'], visas: 'DHL',
    // Provad 2026-09-20 med 00387193364964690280 → HTTP 200.
    mall: 'https://www.dhl.com/se-sv/home/tracking/tracking-parcel.html?submit=1&tracking-id={nr}',
  },
  {
    nyckel: 0, namn: ['se-instabee', 'instabee', 'instabox'], visas: 'Instabee',
    mall: 'https://www.instabee.com/',
  },
];

function normaliseraNamn(s) {
  return String(s == null ? '' : s).toLowerCase().replace(/\s+/g, ' ').trim();
}

// Slår upp bolaget på nyckel i första hand, namn i andra. Okänt bolag ⇒ null,
// och då visar sidan namnet och numret utan länk. Att peka fel är värre.
export function bolagFor(namn, nyckel) {
  const n = normaliseraNamn(namn);
  if (nyckel) {
    const pa = BOLAG.find((b) => b.nyckel && b.nyckel === nyckel);
    if (pa) return pa;
  }
  if (!n) return null;
  return BOLAG.find((b) => b.namn.includes(n)) ?? null;
}

// `misc_info` ur ett 17TRACK-svar → det sidan behöver, eller null.
//
// Returnerar { namn, nummer, lank } där `namn` är det kunden ska läsa och
// `lank` är null när vi inte har en adress vi provat.
//
// ⚠️ Ett `local_number` som är samma som huvudnumret är ingen sista bit —
// 17TRACK ekar då bara tillbaka numret. Mätt 2026-09-20: 131 paket hade ett
// local_number utan local_provider, och exemplet var huvudnumret självt.
export function sistaBiten(miscInfo, huvudnummer) {
  const m = miscInfo ?? {};
  const namn = typeof m.local_provider === 'string' ? m.local_provider.trim() : '';
  const nummer = typeof m.local_number === 'string' ? m.local_number.trim() : '';
  if (!namn) return null;
  const rent = (s) => String(s ?? '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const egetNummer = nummer && rent(nummer) !== rent(huvudnummer) ? nummer : null;
  const b = bolagFor(namn, m.local_key);
  // Mallen bärs vidare som mall, inte som färdig länk: paketdata.mjs lägger
  // den i en ordbok (fem bolag, 623 paket) och uppacka.mjs sätter in numret.
  // Färdiga länkar per paket hade kostat ~37 kB i sidan.
  return {
    namn: b ? b.visas : namn,
    nummer: egetNummer,
    mall: b && (egetNummer || !b.mall.includes('{nr}')) ? b.mall : null,
  };
}
