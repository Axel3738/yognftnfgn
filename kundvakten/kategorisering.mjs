// Klassar ett supportmail i ärendetyp och letar efter chargeback-förvarningar.
//
// Ren logik utan nätverk — därför testbar. Allt som rör IO ligger i mail.mjs.
//
// Mönstren är ordstammar, inte hela ord: "leverans" träffar även "leveransen",
// "leveranser" och "leveransadress". Svenska sammansättningar gör att exakta
// ordlistor missar det mesta.

// Ärendetyperna, i den ordning de prövas. Första träffen vinner, så det som
// är mest specifikt måste stå först: "fel storlek" är ett storleksärende, inte
// ett defektärende, trots ordet "fel".
const ARENDETYPER = [
  {
    id: 'betalning',
    namn: 'Betalning och debitering',
    monster: [
      'dubbeldrag', 'dragit två', 'dragit tva', 'dubbelt betal', 'debiterad två',
      'debiterats två', 'fel belopp', 'okänd debiter', 'kanner inte igen',
      'känner inte igen', 'inte beställt', 'inte bestallt', 'dragit pengar',
      'betalat två', 'betalat tva', 'faktura',
    ],
  },
  {
    id: 'leverans',
    namn: 'Var är min order',
    monster: [
      'var är min', 'var ar min', 'inte fått', 'inte fatt', 'inte kommit',
      'inte anlänt', 'inte anlant', 'spårning', 'sparning', 'tracking',
      'leverans', 'försenad', 'forsenad', 'dröjer', 'drojer', 'när kommer',
      'nar kommer', 'skickad', 'frakt', 'paket', 'postnord', 'utlämning',
      'utlamning', 'väntar på', 'vantar pa',
    ],
  },
  {
    id: 'storlek',
    namn: 'Fel storlek eller passform',
    monster: [
      'storlek', 'passar inte', 'för liten', 'for liten', 'för stor', 'for stor',
      'passform', 'byta till', 'för kort', 'for kort', 'för lång', 'for lang',
    ],
  },
  {
    id: 'defekt',
    namn: 'Trasig eller fel vara',
    monster: [
      'trasig', 'sönder', 'sonder', 'defekt', 'skadad', 'fel vara',
      'fel produkt', 'fungerar inte', 'funkar inte', 'går sönder', 'gar sonder',
      'saknas', 'saknar del', 'kvalitet', 'sprucken', 'läcker', 'lacker',
    ],
  },
  {
    id: 'retur',
    namn: 'Retur och ångerrätt',
    monster: [
      'retur', 'returnera', 'ångerrätt', 'angerratt', 'ångra', 'angra',
      'skicka tillbaka', 'lämna tillbaka', 'lamna tillbaka', 'återbetalning',
      'aterbetalning', 'pengarna tillbaka', 'refund',
    ],
  },
  {
    id: 'avbestallning',
    namn: 'Avbeställning',
    monster: [
      'avbeställ', 'avbestall', 'avbryta', 'annullera', 'makulera',
      'ändra ordern', 'andra ordern', 'stoppa order',
    ],
  },
  {
    id: 'produktfraga',
    namn: 'Fråga om produkten',
    monster: [
      'passar det', 'fungerar det', 'hur stor', 'vilken modell', 'finns det i',
      'material', 'garanti', 'hur lång tid', 'hur lang tid', 'lagerstatus',
    ],
  },
];

// Ord som förvarnar om en chargeback. Två nivåer.
//
// AKUT = kunden har sagt att banken är inkopplad eller på väg in. Där finns
// nästan ingen tid kvar: en inledd tvist som inte besvaras förloras av sig
// själv.
const HOT_AKUT = [
  'chargeback', 'återkrav', 'aterkrav', 'bestrida', 'bestrider', 'bestrid',
  'kortutgivare', 'kontakta banken', 'kontaktar banken', 'ringer banken',
  'min bank', 'via banken', 'banken får', 'banken far', 'spärra betalning',
  'sparra betalning', 'polisanmäl', 'polisanmal', 'anmäler er', 'anmaler er',
  'anmäla er', 'anmala er', 'konsumentverket', 'arn', 'kronofogden',
  'juridiskt ombud', 'advokat',
];

// VARNING = kunden är arg och misstänker att butiken inte är seriös. Det är
// steget före banken.
const HOT_VARNING = [
  'bluff', 'bluffsajt', 'lurad', 'lurade', 'bedrägeri', 'bedrageri', 'scam',
  'oseriös', 'oserios', 'fejk', 'falsk', 'svindel', 'sista gången',
  'sista gangen', 'aldrig mer', 'kräver pengarna', 'kraver pengarna',
  'omgående återbetal', 'omgaende aterbetal', 'trustpilot', 'anmälan',
  'anmalan',
];

// Normaliserar en text för matchning: gemener och ihopdragna blanksteg.
// Å/Ä/Ö behålls — de bär betydelse på svenska. Mönsterlistorna innehåller
// därför både "för" och "for", eftersom kunder skriver bådadera.
export function normalisera(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Klassar ett mail i en ärendetyp. Returnerar alltid något — "ovrigt" när
// inget mönster träffar, aldrig null. Ett oklassat mail ska synas i rapporten,
// inte försvinna.
export function kategorisera(mail) {
  const text = normalisera(`${mail.amne || ''} ${mail.text || ''}`);
  for (const typ of ARENDETYPER) {
    const traff = typ.monster.find((m) => text.includes(m));
    if (traff) return { id: typ.id, namn: typ.namn, traffadPa: traff };
  }
  return { id: 'ovrigt', namn: 'Övrigt', traffadPa: null };
}

// Letar chargeback-förvarningar i ett mail.
// Returnerar { niva: 'akut' | 'varning' | null, ord: [...] }.
export function hotniva(mail) {
  const text = normalisera(`${mail.amne || ''} ${mail.text || ''}`);
  const akuta = HOT_AKUT.filter((o) => text.includes(o));
  if (akuta.length > 0) return { niva: 'akut', ord: akuta };
  const varningar = HOT_VARNING.filter((o) => text.includes(o));
  if (varningar.length > 0) return { niva: 'varning', ord: varningar };
  return { niva: null, ord: [] };
}

// Plockar ut ordernummer ur ett mail (#1234 eller "order 1234").
// Kopplingen mail → order är det som gör att ett hotfullt mail kan matchas
// mot rätt produkt.
export function hittaOrdernummer(mail) {
  const text = `${mail.amne || ''} ${mail.text || ''}`;
  const funna = new Set();
  for (const m of text.matchAll(/#\s?(\d{3,6})\b/g)) funna.add(`#${m[1]}`);
  for (const m of text.matchAll(/\border(?:nummer|nr|n)?[\s.:#]*(\d{3,6})\b/gi)) {
    funna.add(`#${m[1]}`);
  }
  return [...funna];
}

// Grupperar veckans ärenden per typ och rankar på antal.
// `foregaende` är förra veckans motsvarande resultat, för trendpilen.
//
// ⚠️ Ett ärende är en TRÅD, inte ett mail. En kund som påminner tre gånger om
// samma försenade order har ett problem, inte tre — räknas mailen rakt av ser
// "Var är min order" dubbelt så stort ut som det är, och just de kunderna
// mailar flest gånger. Trådens FÖRSTA mail avgör typen: det är där ärendet
// föddes, innan tonen hann bli en annan.
export function toppArenden(mail, foregaende = {}) {
  const trader = new Map();
  for (const m of mail) {
    // Saknas trådnyckel är mailet sin egen tråd.
    const nyckel = m.tradId || m.id || Symbol('losa');
    const forra = trader.get(nyckel);
    if (!forra || new Date(m.datum || 0) < new Date(forra.datum || 0)) {
      trader.set(nyckel, m);
    }
  }

  const grupper = new Map();
  for (const m of trader.values()) {
    const kat = kategorisera(m);
    if (!grupper.has(kat.id)) {
      grupper.set(kat.id, { id: kat.id, namn: kat.namn, antal: 0, exempel: [] });
    }
    const g = grupper.get(kat.id);
    g.antal += 1;
    if (g.exempel.length < 3 && m.amne) g.exempel.push(m.amne);
  }
  return [...grupper.values()]
    .map((g) => {
      const forra = foregaende[g.id] ?? null;
      return {
        ...g,
        forra,
        forandring: forra === null ? null : g.antal - forra,
      };
    })
    .sort((a, b) => b.antal - a.antal);
}
