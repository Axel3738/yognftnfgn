/* ==========================================================================
   statistik.mjs — matematiken bakom A/B-avläsningen.

   Ren funktion in, ren funktion ut. Inga API-anrop, inga beroenden, så den
   går att testa. Allt som rör Shopify ligger i analys.mjs.

   Varför den här filen finns: det farliga med A/B-test är inte att räkna fel
   utan att kalla brus för en vinst. Två annonser med 12 mot 15 köp ser ut som
   +25 %, men är rent slumpbrus. Funktionerna nedan säger rakt ut när
   underlaget inte räcker i stället för att leverera en dom.
   ========================================================================== */

/* --- fördelningar -------------------------------------------------------- */

/** Felfunktionen, Abramowitz & Stegun 7.1.26. Fel < 1.5e-7. */
export function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741;
  const a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

/** Normalfördelningens fördelningsfunktion. */
export function normCdf(z) {
  return clamp01(0.5 * (1 + erf(z / Math.SQRT2)));
}

/**
 * Håller en sannolikhet inom [0, 1].
 * Approximationen ovan har ~1e-9 residual, vilket annars kan ge p = 1.000000001
 * eller p = -2e-10. Ofarligt för beslutet, men det ser ut som ett fel och
 * bryter jämförelser mot 0 och 1.
 */
function clamp01(x) {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

/** Normalfördelningens invers, Acklams approximation. Fel < 1.15e-9. */
export function normInv(p) {
  if (p <= 0 || p >= 1) throw new RangeError('normInv kräver 0 < p < 1');
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
             1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
             6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
             -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
             3.754408661907416e+00];
  const pl = 0.02425, ph = 1 - pl;
  let q, r;
  if (p < pl) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
           ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > ph) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
            ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  q = p - 0.5; r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
         (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/** log(Γ(x)), Lanczos. Behövs av den ofullständiga betafunktionen. */
export function lnGamma(x) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091,
             -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x, tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += g[j] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/** Kedjebråket bakom den regulariserade ofullständiga betafunktionen. */
function betacf(a, b, x) {
  const TINY = 1e-30, EPS = 3e-12, MAXIT = 300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c; if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c; if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Regulariserad ofullständig betafunktion I_x(a, b). */
export function betai(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) +
                      a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2)
    ? bt * betacf(a, b, x) / a
    : 1 - bt * betacf(b, a, 1 - x) / b;
}

/** Tvåsidigt p-värde för Students t. */
export function tTestP(t, df) {
  if (!isFinite(t) || df <= 0) return 1;
  return clamp01(betai(df / 2, 0.5, df / (df + t * t)));
}


/* --- test ---------------------------------------------------------------- */

/**
 * Tvåproportionstest — används när vi vet hur många besökare varje variant
 * fick. Det starkaste testet, så använd det när exponeringen är känd.
 */
export function proportionTest({ aConversions, aVisitors, bConversions, bVisitors }) {
  if (aVisitors <= 0 || bVisitors <= 0) throw new RangeError('besökarantalen måste vara > 0');
  const pA = aConversions / aVisitors;
  const pB = bConversions / bVisitors;
  const pooled = (aConversions + bConversions) / (aVisitors + bVisitors);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / aVisitors + 1 / bVisitors));
  const z = se === 0 ? 0 : (pB - pA) / se;
  const p = clamp01(2 * (1 - normCdf(Math.abs(z))));

  // 95 %-intervall för skillnaden, oparat standardfel.
  const seDiff = Math.sqrt(pA * (1 - pA) / aVisitors + pB * (1 - pB) / bVisitors);
  const half = 1.959963985 * seDiff;

  return {
    metod: 'tvåproportionstest',
    aRate: pA, bRate: pB,
    absolutLyft: pB - pA,
    relativtLyft: pA === 0 ? null : (pB - pA) / pA,
    z, p,
    konfidens: 1 - p,
    intervall: [(pB - pA) - half, (pB - pA) + half]
  };
}

/**
 * Binomialtest — används när vi INTE vet exponeringen, bara hur ordrarna
 * fördelade sig. Tilldelningen är ett rättvist myntkast, så under nollhypotesen
 * ska ordrarna fördela sig enligt vikterna. Svagare än ovan, men ärligt.
 */
export function splitTest({ aOrders, bOrders, expectedShareB = 0.5 }) {
  const n = aOrders + bOrders;
  if (n === 0) throw new RangeError('inga ordrar att testa');
  const observed = bOrders / n;
  const mean = n * expectedShareB;
  const sd = Math.sqrt(n * expectedShareB * (1 - expectedShareB));

  // Normalapproximation med kontinuitetskorrektion.
  const diff = Math.abs(bOrders - mean);
  const z = sd === 0 ? 0 : Math.max(0, diff - 0.5) / sd;
  const p = clamp01(2 * (1 - normCdf(z)));

  return {
    metod: 'binomialtest mot förväntad fördelning',
    aOrders, bOrders,
    andelB: observed,
    förväntadAndelB: expectedShareB,
    relativtLyft: aOrders === 0 ? null : (bOrders - aOrders) / aOrders,
    z, p,
    konfidens: 1 - p
  };
}

/** Welchs t-test — jämför snittordervärde mellan varianterna. */
export function aovTest(aValues, bValues) {
  const stats = (xs) => {
    const n = xs.length;
    if (n < 2) return null;
    const m = xs.reduce((s, v) => s + v, 0) / n;
    const v = xs.reduce((s, x) => s + (x - m) ** 2, 0) / (n - 1);
    return { n, m, v };
  };
  const A = stats(aValues), B = stats(bValues);
  if (!A || !B) return { metod: 'Welch t-test', tillräckligt: false, p: 1 };

  const seA = A.v / A.n, seB = B.v / B.n;
  const se = Math.sqrt(seA + seB);
  const t = se === 0 ? 0 : (B.m - A.m) / se;
  const df = se === 0 ? 1 :
    (seA + seB) ** 2 / ((seA ** 2) / (A.n - 1) + (seB ** 2) / (B.n - 1));

  return {
    metod: 'Welch t-test',
    tillräckligt: true,
    aAov: A.m, bAov: B.m,
    skillnad: B.m - A.m,
    t, df, p: tTestP(t, df)
  };
}


/* --- planering ----------------------------------------------------------- */

/**
 * Hur många besökare per variant som krävs för att kunna se ett visst lyft.
 * mde anges relativt: 0.2 = "vi vill kunna upptäcka en förbättring på 20 %".
 */
export function sampleSize({ baseline, mde, alpha = 0.05, power = 0.8 }) {
  if (baseline <= 0 || baseline >= 1) throw new RangeError('baseline måste ligga mellan 0 och 1');
  if (mde <= 0) throw new RangeError('mde måste vara > 0');
  const p1 = baseline;
  const p2 = baseline * (1 + mde);
  if (p2 >= 1) throw new RangeError('mde ger en konverteringsgrad över 100 %');
  const zA = normInv(1 - alpha / 2);
  const zB = normInv(power);
  const n = ((zA + zB) ** 2 * (p1 * (1 - p1) + p2 * (1 - p2))) / ((p2 - p1) ** 2);
  return Math.ceil(n);
}

/** Hur lång tid testet tar givet daglig trafik. */
export function testLength({ baseline, mde, visitorsPerDay, variants = 2, alpha, power }) {
  const perVariant = sampleSize({ baseline, mde, alpha, power });
  const total = perVariant * variants;
  const days = visitorsPerDay > 0 ? Math.ceil(total / visitorsPerDay) : Infinity;
  return { perVariant, total, days };
}


/* --- dom ----------------------------------------------------------------- */

/**
 * Översätter siffrorna till ett beslut.
 *
 * Beslutsträdet är medvetet uppbyggt så här, och ordningen spelar roll:
 *
 *   1. För få utfall        → fortsätt. Under ~25 köp per variant är
 *                             normalapproximationen inte pålitlig, oavsett
 *                             vad p-värdet råkar säga.
 *   2. p ≤ 0,05             → vinnare. Ett säkerställt resultat är giltigt
 *                             ÄVEN om vi inte nått det planerade underlaget.
 *                             Hittar man ett lyft på 60 % när man planerade
 *                             för att kunna se 20 %, är svaret redan klart —
 *                             att vänta ut kalendern då vore att slänga bort
 *                             en vinst.
 *   3. p > 0,05, för litet
 *      underlag             → fortsätt. "Ingen skillnad syns" är INTE samma
 *                             sak som "ingen skillnad finns".
 *   4. p > 0,05, fullt
 *      underlag             → oavgjort på riktigt. Nu betyder det något.
 */
export function verdict({
  p, relativtLyft,
  enoughData = true,     // räcker antalet utfall för att testet ska gälla?
  powerReached = true,   // har vi nått det planerade underlaget?
  minOutcomes, observedOutcomes,
  minSample, observed, enhet = 'besökare'
}) {
  if (!enoughData) {
    return {
      beslut: 'fortsätt',
      text: `För få köp för att räkna på — ${observedOutcomes} av ${minOutcomes} per variant. Ingen dom förrän dess.`
    };
  }
  if (p <= 0.05) {
    if (relativtLyft > 0) {
      return {
        beslut: 'b vinner',
        text: `B vinner med ${(relativtLyft * 100).toFixed(1)} % (p = ${p.toFixed(3)}). Publicera B.`
      };
    }
    return {
      beslut: 'a vinner',
      text: `B är sämre, ${(relativtLyft * 100).toFixed(1)} % (p = ${p.toFixed(3)}). Behåll A.`
    };
  }
  if (!powerReached) {
    return {
      beslut: 'fortsätt',
      text: `Ingen skillnad syns än (p = ${p.toFixed(3)}), men underlaget räcker inte för att utesluta en liten förbättring — ${observed} av ${minSample} ${enhet} per variant. Det betyder "vet inte", inte "ingen skillnad".`
    };
  }
  return {
    beslut: 'oavgjort',
    text: `Ingen säkerställd skillnad (p = ${p.toFixed(3)}), och underlaget räcker för att säga det. Behåll A och testa något med större skillnad.`
  };
}
