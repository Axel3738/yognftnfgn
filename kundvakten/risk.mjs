// Rankningsmotorn: vilka produkter drar chargebacks, och vad kostar det.
//
// Ren logik utan nätverk — därför testbar.
//
// TVÅ REGLER SOM INTE FÅR BRYTAS:
//
// 1. Aldrig en dom på för lite data. En produkt med 4 ordrar och 1 tvist har
//    inte "25 % chargeback-rate" — den har för lite data. Samma princip som
//    analysmetodens golv på 300 kr spend / 3 köp.
//
// 2. Aldrig en enmetriksdom. Rangordningen går på PENGAR I RISK, inte på rate
//    ensamt. En produkt med 3 % rate på 20 ordrar är ett mindre problem än en
//    med 1,2 % på 500. Raten avgör bara färgen mot de absoluta trösklarna.

import { TROSKLAR, EJ_PRODUKTER } from './konfig.mjs';

// En tvist kan inte tillskrivas en enskild produkt när ordern innehöll flera.
// Vi räknar den mot varje produkt i ordern och redovisar hur många av
// produktens tvister som kom ur en blandad order, så osäkerheten syns i
// stället för att gömmas.
export function rankaProdukter(disputes, ordervolym) {
  const volymPerProdukt = new Map(
    ordervolym
      .filter((r) => !EJ_PRODUKTER.includes(r.produkt))
      .map((r) => [r.produkt, r])
  );

  const statistik = new Map();
  const se = (namn) => {
    if (!statistik.has(namn)) {
      statistik.set(namn, {
        produkt: namn,
        tvister: 0,
        blandadeOrdrar: 0,
        obesvarade: 0,
        forlorade: 0,
        pengarIRisk: 0,
      });
    }
    return statistik.get(namn);
  };

  for (const d of disputes) {
    const produkter = [...new Set(d.produkter || [])].filter(
      (p) => !EJ_PRODUKTER.includes(p)
    );
    if (produkter.length === 0) continue;
    const blandad = produkter.length > 1;
    // Beloppet delas mellan produkterna i en blandad order — annars skulle en
    // order på 1 200 kr med tre produkter se ut som 3 600 kr i risk.
    const andel = (Number(d.belopp) || 0) / produkter.length;
    for (const p of produkter) {
      const s = se(p);
      s.tvister += 1;
      if (blandad) s.blandadeOrdrar += 1;
      if (d.status === 'NEEDS_RESPONSE') s.obesvarade += 1;
      if (d.status === 'LOST') s.forlorade += 1;
      s.pengarIRisk += andel;
    }
  }

  const rader = [...statistik.values()].map((s) => {
    const volym = volymPerProdukt.get(s.produkt);
    const ordrar = volym ? Number(volym.ordrar) : null;
    const harUnderlag = ordrar !== null && ordrar >= TROSKLAR.min_ordrar_for_dom;
    const rate = ordrar && ordrar > 0 ? s.tvister / ordrar : null;
    return {
      ...s,
      ordrar,
      rate,
      pengarIRisk: Math.round(s.pengarIRisk),
      niva: harUnderlag ? nivaAvRate(rate) : 'for-lite-data',
    };
  });

  // Produkter som säljer men saknar tvister hör också hemma i tabellen —
  // annars går det inte att se att de är friska.
  for (const [namn, volym] of volymPerProdukt) {
    if (statistik.has(namn)) continue;
    const ordrar = Number(volym.ordrar);
    rader.push({
      produkt: namn,
      tvister: 0,
      blandadeOrdrar: 0,
      obesvarade: 0,
      forlorade: 0,
      pengarIRisk: 0,
      ordrar,
      rate: 0,
      niva: ordrar >= TROSKLAR.min_ordrar_for_dom ? 'gron' : 'for-lite-data',
    });
  }

  // Rangordning: pengar i risk först. Vid lika belopp går den med flest
  // obesvarade tvister före — de förloras av sig själva.
  return rader.sort(
    (a, b) => b.pengarIRisk - a.pengarIRisk || b.obesvarade - a.obesvarade
  );
}

// Absoluta nivåer mot kortnätverkens programgränser. Aldrig relativa: den
// sämsta produkten i listan ska inte bli röd bara för att den är sämst.
export function nivaAvRate(rate) {
  if (rate === null || rate === undefined) return 'for-lite-data';
  if (rate >= TROSKLAR.rate_rod) return 'rod';
  if (rate >= TROSKLAR.rate_gul) return 'gul';
  return 'gron';
}

// Butikens samlade rate — det tal betalleverantören faktiskt tittar på.
export function butikensRate(disputes, totaltAntalOrdrar) {
  if (!totaltAntalOrdrar || totaltAntalOrdrar <= 0) {
    return { rate: null, niva: 'for-lite-data', tvister: disputes.length, ordrar: 0 };
  }
  const rate = disputes.length / totaltAntalOrdrar;
  return {
    rate,
    niva: nivaAvRate(rate),
    tvister: disputes.length,
    ordrar: totaltAntalOrdrar,
  };
}

const DYGN = 24 * 60 * 60 * 1000;

function dagarMellan(senare, tidigare) {
  return Math.floor((new Date(senare) - new Date(tidigare)) / DYGN);
}

// Förvarningarna — det som går att stoppa INNAN det blir en chargeback.
//
// Ordningen är avsiktlig: det som kostar pengar snarast står först. En
// obesvarad tvist förloras automatiskt när fristen går ut, så den slår allt
// annat.
export function forvarningar({ disputes = [], ordrar = [], mail = [], nu = new Date() }) {
  const larm = [];

  // 1. Obesvarade tvister. Svarar man inte förlorar man — utan undantag.
  for (const d of disputes) {
    if (d.status !== 'NEEDS_RESPONSE') continue;
    const dagarKvar = d.svarsfrist ? dagarMellan(d.svarsfrist, nu) : null;
    larm.push({
      typ: 'obesvarad-tvist',
      allvar: dagarKvar !== null && dagarKvar <= TROSKLAR.dagar_kvar_pa_svarsfrist
        ? 'akut'
        : 'hog',
      order: d.order,
      belopp: d.belopp,
      dagarKvar,
      text: dagarKvar === null
        ? `Tvist på ${d.order} är obesvarad.`
        : `Tvist på ${d.order} är obesvarad, ${dagarKvar} dagar kvar att svara.`,
    });
  }

  // 2. Betald men aldrig skickad. Den vanligaste orsaken till "item not
  //    received" — och den enda som är helt självförvållad.
  for (const o of ordrar) {
    if (o.fulfillmentStatus !== 'UNFULFILLED') continue;
    if (o.financialStatus !== 'PAID') continue;
    const alder = dagarMellan(nu, o.skapad);
    if (alder < TROSKLAR.dagar_obefordrad) continue;
    larm.push({
      typ: 'obefordrad',
      allvar: alder >= TROSKLAR.dagar_utan_leverans ? 'akut' : 'hog',
      order: o.namn,
      belopp: o.belopp,
      dagarKvar: null,
      text: `${o.namn} är betald men inte skickad — ${alder} dagar gammal.`,
    });
  }

  // 3. Skickad utan spårningsnummer. Utan tracking finns inget bevis att
  //    lägga fram om kunden bestrider, så tvisten är förlorad på förhand.
  for (const o of ordrar) {
    if (!o.skickad) continue;
    if (o.harTracking) continue;
    larm.push({
      typ: 'saknar-tracking',
      allvar: 'hog',
      order: o.namn,
      belopp: o.belopp,
      dagarKvar: null,
      text: `${o.namn} är skickad utan spårningsnummer.`,
    });
  }

  // 4. Skickad men aldrig framme. Den starkaste förvarningen vi har bevis för.
  //
  // Mätt 2026-09-09: butikens normala leveranstid är 13–17 dagar (YunExpress).
  // De ordrar som fick tvist låg på 15–33 dagar, snitt ~22 — och en av dem
  // (#4407) står som NOT_DELIVERED och bär två tvister. Kunden bestrider när
  // paketet inte kommer, inte när det är långsamt men rör sig.
  for (const o of ordrar) {
    if (!o.skickad || o.levererad) continue;
    const alder = dagarMellan(nu, o.skapad);
    if (alder < TROSKLAR.dagar_utan_leverans) continue;
    larm.push({
      typ: 'fastnat-i-frakt',
      allvar: 'akut',
      order: o.namn,
      belopp: o.belopp,
      dagarKvar: null,
      text: `${o.namn} skickades för ${alder} dagar sedan och är inte framme.`,
    });
  }

  // 5. Mail där kunden nämner banken. Steget före en riktig chargeback.
  for (const m of mail) {
    if (!m.hot || !m.hot.niva) continue;
    larm.push({
      typ: 'hotfullt-mail',
      allvar: m.hot.niva === 'akut' ? 'akut' : 'hog',
      order: (m.ordernummer || [])[0] || null,
      belopp: null,
      dagarKvar: null,
      text: m.hot.niva === 'akut'
        ? `Kund nämner bank eller anmälan: "${(m.amne || '').slice(0, 60)}"`
        : `Arg kund: "${(m.amne || '').slice(0, 60)}"`,
    });
  }

  // 6. Kunder som fått maila om och om igen utan svar.
  const perAvsandare = new Map();
  for (const m of mail) {
    const nyckel = (m.fran || '').toLowerCase();
    if (!nyckel) continue;
    if (!perAvsandare.has(nyckel)) perAvsandare.set(nyckel, []);
    perAvsandare.get(nyckel).push(m);
  }
  for (const [avsandare, trad] of perAvsandare) {
    if (trad.length < TROSKLAR.mail_utan_svar) continue;
    if (trad.some((m) => m.besvarad)) continue;
    larm.push({
      typ: 'obesvarad-kund',
      allvar: 'hog',
      order: (trad.find((m) => (m.ordernummer || []).length > 0)?.ordernummer || [])[0] || null,
      belopp: null,
      dagarKvar: null,
      text: `${maskera(avsandare)} har mailat ${trad.length} gånger utan svar.`,
    });
  }

  const ordning = { akut: 0, hog: 1, medel: 2 };
  return larm.sort(
    (a, b) =>
      (ordning[a.allvar] ?? 9) - (ordning[b.allvar] ?? 9) ||
      (a.dagarKvar ?? 99) - (b.dagarKvar ?? 99)
  );
}

// Kundadresser hör inte hemma i klartext i en rapport som committas.
export function maskera(epost) {
  const s = String(epost || '');
  const at = s.indexOf('@');
  if (at < 1) return s ? '(dold)' : '';
  return `${s.slice(0, 1)}***${s.slice(at)}`;
}
