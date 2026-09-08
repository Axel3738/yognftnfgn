/**
 * Kundvärde (LTV) per kohort — räknemotorn.
 *
 * Ren funktion utan I/O. Kohort = alla kunder vars första köp föll i samma
 * kalendermånad. För varje kohort räknas intäkt per kund ackumulerat månad
 * för månad efter första köpet (månad 0 = köpmånaden).
 *
 * Prognosen är "kurvstapling": de månader en kohort ännu inte hunnit uppleva
 * fylls med hur mycket ÄLDRE kohorter växte i samma månad, uttryckt som
 * andel av föregående månads värde. Ingen kurvanpassning, inga antaganden om
 * fördelningar — bara butikens egna kohorter. Det gör siffran låst till
 * riktig data: finns inga äldre kohorter som visat månad k, kan månad k inte
 * prognostiseras, och då står det "—" i stället för en siffra.
 *
 * Kohorter med färre kunder än MIN_KUNDER visas men märks "för lite data"
 * och räknas inte in i prognoskurvan.
 */

// Ändelsen är med för att testerna kör filen rakt i Node (strip-types).
import { HORISONT, MIN_KUNDER } from "./ltv-konstanter.ts";
export { HORISONT, MIN_KUNDER };

export interface LtvOrder {
  customerId: string;
  day: string; // YYYY-MM-DD
  /** Nettointäkt (efter rabatter och återbetalningar), butikens valuta. */
  net: number;
}

export interface Kohort {
  manad: string; // YYYY-MM
  kunder: number;
  /** Månader kohorten faktiskt har hunnit observera (0..n). */
  observerade: number;
  /** Ackumulerad intäkt per kund, index = månad efter första köpet. Bara observerade månader. */
  perKund: number[];
  /** Prognos per kund för månader kohorten inte observerat. null = går inte att prognostisera. */
  prognos: (number | null)[];
  /** Andel kunder med ≥2 ordrar (hittills). */
  aterkop: number;
  ordrarPerKund: number;
  forLiteData: boolean;
}

export interface LtvResult {
  kohorter: Kohort[];
  /** Genomsnittlig tillväxtfaktor per månad ur mognade kohorter: faktor[k] = värde(k)/värde(k−1). */
  tillvaxt: (number | null)[];
  /** Hur många kohorter som bidrog till varje faktor. */
  tillvaxtUnderlag: number[];
  /** Butikens LTV-kurva: viktat snitt per kund över alla kohorter med data, prognos där observation saknas. */
  kurva: { manad: number; varde: number | null; prognos: boolean; kohorter: number }[];
  /** Första-ordervärde per kund (månad 0), viktat över alla kohorter. */
  forstaKop: number | null;
  /** LTV vid horisonten (observerat + prognos). null = för lite data. */
  ltv12: number | null;
  totalKunder: number;
  totalOrdrar: number;
  aterkopsgrad: number | null;
}

const ym = (day: string) => day.slice(0, 7);
const monthIndex = (ymStr: string) => {
  const [y, m] = ymStr.split("-").map(Number);
  return y * 12 + (m - 1);
};

export function computeLtv(orders: LtvOrder[], today: string): LtvResult {
  const byCustomer = new Map<string, LtvOrder[]>();
  for (const o of orders) {
    if (!o.customerId) continue;
    (byCustomer.get(o.customerId) ?? byCustomer.set(o.customerId, []).get(o.customerId)!).push(o);
  }

  const nu = monthIndex(ym(today));
  interface Acc { kunder: number; ordrar: number; aterkopare: number; summa: number[] }
  const acc = new Map<string, Acc>();

  for (const [, os] of byCustomer) {
    os.sort((a, b) => (a.day < b.day ? -1 : 1));
    const first = ym(os[0].day);
    const f0 = monthIndex(first);
    const a = acc.get(first) ?? { kunder: 0, ordrar: 0, aterkopare: 0, summa: [] };
    a.kunder++;
    a.ordrar += os.length;
    if (os.length >= 2) a.aterkopare++;
    for (const o of os) {
      const k = monthIndex(ym(o.day)) - f0;
      if (k < 0 || k > HORISONT) continue;
      a.summa[k] = (a.summa[k] ?? 0) + o.net;
    }
    acc.set(first, a);
  }

  const manader = [...acc.keys()].sort();
  const kohorterRaw = manader.map((manad) => {
    const a = acc.get(manad)!;
    /* Observerade månader: från kohortmånaden till och med förra hela
       månaden. Innevarande månad är halvfärdig och räknas inte som
       observerad — den skulle dra ner kurvan. Kohortmånaden själv räknas
       alltid (den är per definition minst påbörjad). */
    const observerade = Math.max(1, Math.min(HORISONT + 1, nu - monthIndex(manad)));
    const perKund: number[] = [];
    let cum = 0;
    for (let k = 0; k < observerade; k++) {
      cum += a.summa[k] ?? 0;
      perKund.push(cum / a.kunder);
    }
    return {
      manad,
      kunder: a.kunder,
      observerade,
      perKund,
      aterkop: a.aterkopare / a.kunder,
      ordrarPerKund: a.ordrar / a.kunder,
      forLiteData: a.kunder < MIN_KUNDER,
    };
  });

  /* Tillväxtfaktorer ur kohorter med tillräckligt underlag. Faktor för
     månad k kräver att kohorten observerat både k−1 och k. */
  const tillvaxt: (number | null)[] = [null];
  const tillvaxtUnderlag: number[] = [0];
  for (let k = 1; k <= HORISONT; k++) {
    let num = 0, den = 0, n = 0;
    for (const c of kohorterRaw) {
      if (c.forLiteData || c.observerade <= k) continue;
      // Viktat med antal kunder: stora kohorter väger mer.
      num += c.perKund[k] * c.kunder;
      den += c.perKund[k - 1] * c.kunder;
      n++;
    }
    tillvaxt.push(n > 0 && den > 0 ? num / den : null);
    tillvaxtUnderlag.push(n);
  }

  const kohorter: Kohort[] = kohorterRaw.map((c) => {
    const prognos: (number | null)[] = [];
    let last: number | null = c.perKund[c.perKund.length - 1] ?? null;
    for (let k = 0; k <= HORISONT; k++) {
      if (k < c.observerade) { prognos.push(null); continue; }
      const f = tillvaxt[k];
      last = last != null && f != null ? last * f : null;
      prognos.push(c.forLiteData ? null : last);
    }
    return { ...c, prognos };
  });

  /* Butikens kurva: per månad k, viktat snitt över kohorter som observerat k;
     saknas observation för k används prognosen från kohorter som har en. */
  const kurva: LtvResult["kurva"] = [];
  for (let k = 0; k <= HORISONT; k++) {
    let num = 0, den = 0, n = 0;
    for (const c of kohorter) {
      if (c.forLiteData) continue;
      if (c.observerade > k) { num += c.perKund[k] * c.kunder; den += c.kunder; n++; }
    }
    if (n > 0) { kurva.push({ manad: k, varde: num / den, prognos: false, kohorter: n }); continue; }
    // Ingen kohort har observerat k — kedja prognosen från förra punkten.
    const prev = kurva[k - 1];
    const f = tillvaxt[k];
    kurva.push({
      manad: k,
      varde: prev?.varde != null && f != null ? prev.varde * f : null,
      prognos: true,
      kohorter: 0,
    });
  }
  /* Observerade punkter längre fram bygger på färre (äldre) kohorter och kan
     ligga under en tidigare punkt bara av den anledningen. Kurvan är
     ackumulerad och får aldrig sjunka — behåll maximum. */
  for (let k = 1; k <= HORISONT; k++) {
    const p = kurva[k - 1].varde, v = kurva[k].varde;
    if (p != null && v != null && v < p) kurva[k].varde = p;
  }

  const totalKunder = kohorterRaw.reduce((a, c) => a + c.kunder, 0);
  const totalOrdrar = [...acc.values()].reduce((a, c) => a + c.ordrar, 0);
  const aterkopare = [...acc.values()].reduce((a, c) => a + c.aterkopare, 0);
  const ltv12 = kurva[HORISONT]?.varde ?? null;

  return {
    kohorter: kohorter.reverse(), // senaste först
    tillvaxt,
    tillvaxtUnderlag,
    kurva,
    forstaKop: kurva[0]?.varde ?? null,
    ltv12,
    totalKunder,
    totalOrdrar,
    aterkopsgrad: totalKunder ? aterkopare / totalKunder : null,
  };
}
