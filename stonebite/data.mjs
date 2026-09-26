// data.mjs — snapshoten in, färdiga tal ut. Rena funktioner ovanpå filen.
//
// Servern räknar aldrig i vyn: här sker all härledning, och här ligger
// reglerna om vad som får summeras med vad.
//
//   • Valutor summeras ALDRIG. Varje summa bär sin valuta.
//   • "Kvar efter annonser" är INTE vinst — varukostnad, frakt, avgifter och
//     returer är inte avdragna. Vyn skriver ut det varje gång.
//   • Ett tal som saknas är null hela vägen ut, så vyn kan skriva orsaken.

import { readFileSync, existsSync, statSync } from 'node:fs';
import { dagnyckel, sistaDagarna, forandring, vinstbidragRoas, breakEvenUrNamn, cpa, motBreakEven, bedombar } from './berakna.mjs';

let cache = { fil: null, mtime: 0, data: null };

/** Snapshoten, cachad tills filen ändras (rutinen skriver om den varje timme). */
export function lasSnapshot(fil) {
  if (!existsSync(fil)) return null;
  const mtime = statSync(fil).mtimeMs;
  if (cache.fil === fil && cache.mtime === mtime && cache.data) return cache.data;
  const data = JSON.parse(readFileSync(fil, 'utf8'));
  cache = { fil, mtime, data };
  return data;
}

export function nollstallCache() {
  cache = { fil: null, mtime: 0, data: null };
}

const summa = (rader, falt) => rader.reduce((s, r) => s + (Number(r?.[falt]) || 0), 0);

// ------------------------------------------------------------- butiker

/**
 * En butiks läge: i dag, i går, 7 och 30 dagar — plus samma perioder bakåt
 * att jämföra mot. Dygnet är svenskt (dagnyckel), inte UTC:s.
 */
export function butiksLage(butik, { nu = new Date() } = {}) {
  const dagar = butik?.dagar ?? [];
  const idagNyckel = dagnyckel(nu);
  const igarNyckel = dagnyckel(new Date(nu.getTime() - 86_400_000));
  const hitta = (n) => dagar.find((d) => d.datum === n) ?? null;

  const sista = (antal, hopp = 0) => {
    const slut = dagar.length - hopp;
    return dagar.slice(Math.max(0, slut - antal), Math.max(0, slut));
  };

  const idag = hitta(idagNyckel);
  const igar = hitta(igarNyckel);
  // 7-dagarsfönstret slutar i går: dagens halva dygn får inte jämföras med hela.
  const vecka = sista(7, 1);
  const forraVeckan = sista(7, 8);
  const manad = sista(30, 1);

  return {
    id: butik.id,
    namn: butik.namn,
    url: butik.url,
    valuta: butik.valuta,
    land: butik.land,
    status: butik.status,
    orsak: butik.orsak,
    idag: idag ? { omsattning: idag.omsattning, ordrar: idag.ordrar } : null,
    igar: igar ? { omsattning: igar.omsattning, ordrar: igar.ordrar } : null,
    vecka: { omsattning: summa(vecka, 'omsattning'), ordrar: summa(vecka, 'ordrar'), dagar: vecka.length },
    forraVeckan: { omsattning: summa(forraVeckan, 'omsattning'), ordrar: summa(forraVeckan, 'ordrar'), dagar: forraVeckan.length },
    manad: { omsattning: summa(manad, 'omsattning'), ordrar: summa(manad, 'ordrar'), dagar: manad.length },
    serie: dagar.map((d) => d.omsattning),
    serieOrdrar: dagar.map((d) => d.ordrar),
    aov: summa(manad, 'ordrar') > 0 ? summa(manad, 'omsattning') / summa(manad, 'ordrar') : null,
  };
}

export function allaButikslagen(snapshot, { nu = new Date() } = {}) {
  return (snapshot?.butiker ?? []).map((b) => butiksLage(b, { nu }));
}

/** Summerat per valuta — aldrig över valutagränsen. */
export function butikerPerValuta(lagen) {
  const karta = new Map();
  for (const b of lagen) {
    if (b.status !== 'ok' || !b.valuta) continue;
    const v = karta.get(b.valuta) ?? {
      valuta: b.valuta, butiker: 0,
      idag: { omsattning: 0, ordrar: 0 }, igar: { omsattning: 0, ordrar: 0 },
      vecka: { omsattning: 0, ordrar: 0 }, forraVeckan: { omsattning: 0, ordrar: 0 }, manad: { omsattning: 0, ordrar: 0 },
      serie: [],
    };
    v.butiker += 1;
    for (const p of ['idag', 'igar', 'vecka', 'forraVeckan', 'manad']) {
      v[p].omsattning += Number(b[p]?.omsattning) || 0;
      v[p].ordrar += Number(b[p]?.ordrar) || 0;
    }
    b.serie.forEach((x, i) => { v.serie[i] = (v.serie[i] ?? 0) + (Number(x) || 0); });
    karta.set(b.valuta, v);
  }
  return [...karta.values()].sort((a, b) => b.manad.omsattning - a.manad.omsattning);
}

// ------------------------------------------------------------- annonser

/**
 * Dagarna i ett fönster som slutar i GÅR (Meta och butikerna jämförs på hela
 * dygn). `hopp` flyttar fönstret bakåt: hopp 7 = veckan innan.
 */
export function fonsterDagar(antal, { nu = new Date(), hopp = 0 } = {}) {
  return new Set(sistaDagarna(antal + 1 + hopp, { nu }).slice(0, antal));
}

/** Ett annonskontos läge, samma perioder som butikerna. */
export function kontoLage(konto, { nu = new Date() } = {}) {
  const dagar = konto?.dagar ?? [];
  // ⚠️ Metas dagsserie HOPPAR ÖVER dagar utan spend (mätt 2026-09-26: FI-kontot
  // hade 12 rader på 30 dagar, 08-31 följt av 09-18). "De sju sista raderna" kan
  // alltså spänna över flera veckor — fönstret väljs därför på DATUM.
  const i = (fonster) => dagar.filter((d) => fonster.has(d.datum));
  const igarNyckel = dagnyckel(new Date(nu.getTime() - 86_400_000));
  const igar = dagar.find((d) => d.datum === igarNyckel) ?? null;
  const vecka = i(fonsterDagar(7, { nu }));
  const forraVeckan = i(fonsterDagar(7, { nu, hopp: 7 }));
  const manad = i(fonsterDagar(30, { nu }));
  const roasFor = (rader) => {
    const s = summa(rader, 'spend');
    const intakt = rader.reduce((x, r) => x + (r.roas !== null && r.roas !== undefined ? r.spend * r.roas : 0), 0);
    return s > 0 && intakt > 0 ? intakt / s : null;
  };

  return {
    id: konto.id,
    namn: konto.namn,
    etikett: konto.etikett ?? konto.namn,
    verksamhet: konto.verksamhet ?? 'Övrigt',
    valuta: konto.valuta,
    aktiv: konto.aktiv,
    status: konto.status,
    orsak: konto.orsak,
    idag: konto.idag ?? null,
    igar: igar ? { spend: igar.spend, kop: igar.kop, roas: igar.roas } : null,
    vecka: { spend: summa(vecka, 'spend'), kop: summa(vecka, 'kop'), roas: roasFor(vecka), dagar: vecka.length },
    forraVeckan: { spend: summa(forraVeckan, 'spend'), kop: summa(forraVeckan, 'kop'), roas: roasFor(forraVeckan), dagar: forraVeckan.length },
    manad: { spend: summa(manad, 'spend'), kop: summa(manad, 'kop'), roas: roasFor(manad), dagar: manad.length },
    serie: dagar.map((d) => d.spend),
    kampanjer: konto.kampanjer ?? [],
  };
}

export function allaKontolagen(snapshot, { nu = new Date() } = {}) {
  return (snapshot?.annonskonton ?? []).map((k) => kontoLage(k, { nu }));
}

/**
 * Kampanjerna rangordnade på VINSTBIDRAG (aldrig på ROAS eller CPA ensamt).
 * Break-even läses i första hand ur kampanjnamnet ("BE ROAS 1.57"), i andra
 * hand ur products.json. Saknas den finns ingen dom — raden märks så.
 */
export function kampanjrader(konto, produkter = []) {
  const perId = new Map(produkter.flatMap((p) => (p.kampanjIds ?? []).map((id) => [String(id), p])));
  return (konto.kampanjer ?? []).map((k) => {
    const produkt = perId.get(String(k.id)) ?? null;
    const be = breakEvenUrNamn(k.namn) ?? produkt?.breakEvenRoas ?? null;
    const bidrag = vinstbidragRoas({ spend: k.spend, roas: k.roas, breakEvenRoas: be });
    const dom = motBreakEven({ roas: k.roas, breakEvenRoas: be });
    const grund = bedombar({ spend: k.spend, kop: k.kop });
    return {
      ...k,
      valuta: konto.valuta,
      konto: konto.etikett ?? konto.namn,
      kontoId: konto.id,
      verksamhet: konto.verksamhet,
      breakEvenRoas: be,
      cpa: cpa({ spend: k.spend, kop: k.kop }),
      vinstbidrag: bidrag,
      dom,
      bedombar: grund,
    };
  }).sort((a, b) => (b.vinstbidrag ?? -Infinity) - (a.vinstbidrag ?? -Infinity));
}

/** Alla kampanjer i alla konton, bäst vinstbidrag först. */
export function allaKampanjer(snapshot, produkter = []) {
  return allaKontolagen(snapshot)
    .filter((k) => k.status === 'ok')
    .flatMap((k) => kampanjrader(k, produkter))
    .sort((a, b) => (b.vinstbidrag ?? -Infinity) - (a.vinstbidrag ?? -Infinity));
}

// ------------------------------------------------------------- översikt

/**
 * Hela bolaget i ett svep, per valuta. Annonsspenden läggs bara på den valuta
 * kontot faktiskt spenderar i (alla Meta-konton är i SEK).
 */
export function oversikt(snapshot, { nu = new Date() } = {}) {
  const lagen = allaButikslagen(snapshot, { nu });
  const valutor = butikerPerValuta(lagen);
  const konton = allaKontolagen(snapshot, { nu }).filter((k) => k.status === 'ok');

  const spendPerValuta = new Map();
  for (const k of konton) {
    const v = spendPerValuta.get(k.valuta) ?? { idag: 0, igar: 0, vecka: 0, manad: 0, kop7: 0, serie: [] };
    v.idag += Number(k.idag?.spend) || 0;
    v.igar += Number(k.igar?.spend) || 0;
    v.vecka += k.vecka.spend;
    v.manad += k.manad.spend;
    v.kop7 += k.vecka.kop;
    k.serie.forEach((x, i) => { v.serie[i] = (v.serie[i] ?? 0) + (Number(x) || 0); });
    spendPerValuta.set(k.valuta, v);
  }

  const rader = valutor.map((v) => {
    const spend = spendPerValuta.get(v.valuta) ?? null;
    return {
      ...v,
      spend,
      kvarIdag: spend && v.idag ? v.idag.omsattning - spend.idag : null,
      kvarVecka: spend ? v.vecka.omsattning - spend.vecka : null,
      jamforIdag: forandring(v.idag?.omsattning ?? null, v.igar?.omsattning ?? null),
      jamforVecka: forandring(v.vecka.omsattning, v.forraVeckan.omsattning),
    };
  });

  // Valutor med spend men inga läsbara butiker syns ändå — annars ser det ut
  // som att pengarna inte går någonstans.
  for (const [valuta, spend] of spendPerValuta) {
    if (rader.some((r) => r.valuta === valuta)) continue;
    rader.push({ valuta, butiker: 0, idag: null, igar: null, vecka: { omsattning: 0, ordrar: 0 }, manad: { omsattning: 0, ordrar: 0 }, serie: [], spend, kvarIdag: null, kvarVecka: null, jamforIdag: null, jamforVecka: null });
  }

  return {
    rader,
    butiker: lagen,
    konton,
    lasbara: lagen.filter((b) => b.status === 'ok').length,
    // Avstängda med flit (status 'av', stonebite/butiker-av.json) är inte olästa — de räknas inte alls.
    olasbara: lagen.filter((b) => b.status !== 'ok' && b.status !== 'av'),
    avstangda: lagen.filter((b) => b.status === 'av'),
  };
}

// ---------------------------------------------------- MER per verksamhet

/**
 * Hör kampanjen till varumärkets del av ett delat konto? `prefix`/`utom` i
 * varumarken.json matchas som ORD I NAMNET, inte som början.
 * ⚠️ Mätt 2026-09-26: CaraShells kampanjer i Magiborsten UK heter bland annat
 * "AU LISTICLE Taköverdrag CARASHELL" och "1 CARASHELL_US_…". Med startsWith
 * räknades ~107 000 kr av CaraShells reklam på sju dagar som Bäverbutikens.
 */
export function kampanjTillhor(post, namn) {
  const n = String(namn ?? '').toUpperCase();
  const finns = (p) => n.includes(String(p).replace(/_+$/, '').toUpperCase());
  if (post?.prefix) return post.prefix.some(finns);
  if (post?.utom) return !post.utom.some(finns);
  return true;
}

/**
 * Är snapshot-butiken den som varumarken.json pekar på? Id:t, eller
 * myshopify-namnet (Matstrumpor står som "1r46tp-qx" i registret men heter
 * "matstrumpor" i hämtningen — mätt 2026-09-26).
 */
export function butikenAr(id, butik) {
  return butik?.id === id || butik?.shop === `${id}.myshopify.com`;
}

/**
 * All försäljning mot all reklam, per verksamhet, de senaste 7 hela dygnen.
 * MER = försäljning ÷ reklam. Till skillnad från ROAS (Metas egen gissning om
 * vad annonserna sålde) räknas här det som faktiskt kom in i butikerna.
 * Evolve-kursens första tal för ägaren (stonebite/evolve/SVAR.md, svar 1).
 *
 * Varumärkena och vilka butiker och konton som hör till dem står i
 * varumarken.json. Delade konton delas på kampanjprefix (7-dagarsfönstret
 * last_7d, samma dygn som butikernas vecka).
 *
 * Reglerna:
 *   • Försäljningen räknas om till kronor med ECB-kursen, eftersom reklamen
 *     betalas i kronor. Varje butik står kvar i sin egen valuta bredvid.
 *   • MER räknas BARA när alla butiker och alla konton i verksamheten gick att
 *     läsa. Annars null + orsak — en halv försäljning mot hela reklamen ger
 *     ett tal som ser dåligt ut av fel skäl.
 *   • "Kvar efter reklam" är inte vinst: varor, frakt och avgifter är inte
 *     avdragna.
 */
export function verksamheter(snapshot, { nu = new Date() } = {}) {
  const kurser = snapshot?.valutakurser?.status === 'ok' ? snapshot.valutakurser : null;
  const sekPer = kurser?.sekPer ?? { SEK: 1 };
  const vecka = fonsterDagar(7, { nu });
  const forraVeckan = fonsterDagar(7, { nu, hopp: 7 });
  const butikerIn = snapshot?.butiker ?? [];
  const kontonIn = snapshot?.annonskonton ?? [];

  const saljer = (butik, fonster) => (butik.dagar ?? []).filter((d) => fonster.has(d.datum))
    .reduce((s, d) => ({ omsattning: s.omsattning + (Number(d.omsattning) || 0), ordrar: s.ordrar + (Number(d.ordrar) || 0) }), { omsattning: 0, ordrar: 0 });

  return (snapshot?.varumarken ?? []).map((vm) => {
    const saknas = [];

    // ---------------------------------------------------------- butikerna
    const butiker = [];
    for (const id of vm.butiker ?? []) {
      const b = butikerIn.find((x) => butikenAr(id, x));
      if (!b) { saknas.push({ vad: id, orsak: 'butiken finns inte i hämtningen' }); continue; }
      if (b.status === 'av') continue; // avstängd med flit (butiker-av.json)
      if (b.status !== 'ok') { saknas.push({ vad: b.namn ?? id, orsak: b.orsak ?? 'butiken gick inte att läsa' }); continue; }
      const v = saljer(b, vecka);
      const f = saljer(b, forraVeckan);
      const kurs = sekPer[b.valuta] ?? null;
      if (kurs === null) saknas.push({ vad: b.namn, orsak: `ingen växelkurs för ${b.valuta}` });
      butiker.push({ id: b.id, namn: b.namn, valuta: b.valuta, omsattning: v.omsattning, ordrar: v.ordrar, sek: kurs === null ? null : v.omsattning * kurs, sekForra: kurs === null ? null : f.omsattning * kurs });
    }
    if (!(vm.butiker ?? []).length) saknas.push({ vad: 'butiken', orsak: vm.butiker_saknas ?? 'ingen butik registrerad' });

    // ----------------------------------------------------------- reklamen
    const konton = [];
    for (const post of vm.konton ?? []) {
      const raa = kontonIn.find((k) => String(k.id) === String(post.id));
      if (!raa || raa.status !== 'ok') { saknas.push({ vad: post.namn ?? post.id, orsak: raa?.orsak ?? vm.konton_saknas ?? 'annonskontot lästes inte' }); continue; }
      const delat = !post.hela;
      let spend;
      let spendForra = null;
      if (delat) {
        spend = (raa.kampanjer ?? []).filter((k) => kampanjTillhor(post, k.namn)).reduce((s, k) => s + (Number(k.spend) || 0), 0);
      } else {
        spend = (raa.dagar ?? []).filter((d) => vecka.has(d.datum)).reduce((s, d) => s + (Number(d.spend) || 0), 0);
        spendForra = (raa.dagar ?? []).filter((d) => forraVeckan.has(d.datum)).reduce((s, d) => s + (Number(d.spend) || 0), 0);
      }
      const kurs = sekPer[raa.valuta] ?? null;
      if (kurs === null) saknas.push({ vad: post.namn ?? raa.namn, orsak: `ingen växelkurs för ${raa.valuta}` });
      konton.push({ id: raa.id, namn: post.namn ?? raa.namn, valuta: raa.valuta, delat, spend, sek: kurs === null ? null : spend * kurs, sekForra: kurs === null || spendForra === null ? null : spendForra * kurs });
    }
    if (!(vm.konton ?? []).length) saknas.push({ vad: 'annonskontot', orsak: 'inget annonskonto registrerat' });

    const behoverKurs = [...butiker, ...konton].some((x) => x.valuta && x.valuta !== 'SEK');
    if (behoverKurs && !kurser) saknas.push({ vad: 'växelkursen', orsak: snapshot?.valutakurser?.orsak ?? 'växelkurserna hämtades inte' });

    // En delsumma är ingen summa: saknas en butik eller ett konto blir talet null.
    const butikSaknas = !(vm.butiker ?? []).length || butiker.length < (vm.butiker ?? []).filter((id) => butikerIn.find((x) => butikenAr(id, x))?.status !== 'av').length;
    const kontoSaknas = !(vm.konton ?? []).length || konton.length < (vm.konton ?? []).length;
    const forsaljning = !butikSaknas && butiker.every((b) => b.sek !== null) ? butiker.reduce((s, b) => s + b.sek, 0) : null;
    const reklam = !kontoSaknas && konton.every((k) => k.sek !== null) ? konton.reduce((s, k) => s + k.sek, 0) : null;
    const komplett = saknas.length === 0 && forsaljning !== null && reklam !== null;
    const mer = komplett && reklam > 0 ? forsaljning / reklam : null;

    // Veckan innan — bara när varje konto har en dagsserie (delade konton har bara 7 dagar).
    const forraKomplett = komplett && konton.every((k) => k.sekForra !== null);
    const forsaljningForra = forraKomplett ? butiker.reduce((s, b) => s + b.sekForra, 0) : null;
    const reklamForra = forraKomplett ? konton.reduce((s, k) => s + k.sekForra, 0) : null;
    const merForra = forraKomplett && reklamForra > 0 ? forsaljningForra / reklamForra : null;

    return {
      id: vm.id,
      namn: vm.namn,
      butiker,
      konton,
      saknas,
      komplett,
      forsaljning,
      reklam,
      mer,
      merForra,
      kvar: komplett ? forsaljning - reklam : null,
      vinst: vinstFor(vm, butiker, { snapshot, vecka, sekPer, komplett, reklam, saknas }),
    };
  });
}

/** Så stor del av försäljningen som får sakna varukostnad innan vinsten inte räknas. */
export const TAK_UTAN_KOSTNAD = 0.01;

/**
 * Riktig vinst för en verksamhet, 7 hela dygn (Evolve-kursens formel, svar 1):
 *   vinstbidrag = försäljning utan moms − varukostnad − betalavgifter − reklam
 * Varukostnaden är Shopifys "Cost per item". Frakten från leverantören ingår
 * bara om den ligger i det talet — sidan säger det.
 * null + orsak när MER inte går att räkna, när en butik saknar underlag, eller
 * när mer än 1 % av försäljningen säljs på varianter utan Cost per item.
 */
function vinstFor(vm, butiker, { snapshot, vecka, sekPer, komplett, reklam, saknas }) {
  if (!komplett) return { status: 'saknas', orsak: saknas[0] ? `${saknas[0].vad}: ${saknas[0].orsak}` : 'MER går inte att räkna', saknarKostnad: [] };
  const underlag = snapshot?.vinst;
  if (!underlag) return { status: 'saknas', orsak: 'vinstunderlaget hämtades inte (kallor/vinst.mjs körs från och med nästa timhämtning)', saknarKostnad: [] };

  let netto = 0; let varukostnad = 0; let avgifter = 0; let utanKostnad = 0; let utanAvgift = 0;
  const saknarKostnad = [];
  for (const b of butiker) {
    const v = underlag.find((x) => x.id === b.id);
    if (!v || v.status !== 'ok') return { status: 'saknas', orsak: `${b.namn}: ${v?.orsak ?? 'inget vinstunderlag'}`, saknarKostnad: [] };
    const kurs = sekPer[v.valuta ?? b.valuta];
    for (const d of v.dagar ?? []) {
      if (!vecka.has(d.datum)) continue;
      netto += d.netto * kurs;
      varukostnad += d.varukostnad * kurs;
      avgifter += d.avgifter * kurs;
      for (const [valuta, belopp] of Object.entries(d.avgifterAnnanValuta ?? {})) {
        if (sekPer[valuta] === undefined) return { status: 'saknas', orsak: `ingen växelkurs för avgifter i ${valuta}`, saknarKostnad: [] };
        avgifter += belopp * sekPer[valuta];
      }
      utanKostnad += d.utanKostnad * kurs;
      utanAvgift += d.utanAvgift * kurs;
    }
    for (const s of v.saknarKostnad ?? []) saknarKostnad.push({ ...s, butik: b.namn, sek: s.intakt * kurs });
  }
  saknarKostnad.sort((a, b) => b.sek - a.sek);
  const utanKostnadAndel = netto > 0 ? utanKostnad / netto : 0;
  const bas = { netto, varukostnad, avgifter, reklam, utanKostnad, utanKostnadAndel, utanAvgift, saknarKostnad: saknarKostnad.slice(0, 5) };
  if (utanKostnadAndel > TAK_UTAN_KOSTNAD) {
    return { ...bas, status: 'saknas', orsak: `${Math.round(utanKostnadAndel * 100)} % av försäljningen är varianter utan Cost per item i Shopify` };
  }
  const bidrag = netto - varukostnad - avgifter - reklam;
  return { ...bas, status: 'ok', orsak: null, bidrag, marginal: netto > 0 ? bidrag / netto : null };
}

/**
 * Hela bolagets MER över de verksamheter som gick att läsa helt. Vilka som
 * räknades och vilka som saknas följer med, så sidan kan säga det.
 */
export function merTotalt(rader) {
  const med = rader.filter((r) => r.komplett && r.reklam > 0);
  // Bara verksamheter där något faktiskt rör sig — nedlagda butiker utan reklam saknas inte.
  const utan = rader.filter((r) => !r.komplett && ((r.reklam ?? 0) > 0 || (r.forsaljning ?? 0) > 0 || r.konton.some((k) => k.spend > 0)));
  const forsaljning = med.reduce((s, r) => s + r.forsaljning, 0);
  const reklam = med.reduce((s, r) => s + r.reklam, 0);
  // Vinsten bara över verksamheter där den gick att räkna — vilka följer med.
  const vinstMed = rader.filter((r) => r.vinst?.status === 'ok');
  const vinstUtan = rader.filter((r) => r.vinst?.status !== 'ok' && ((r.reklam ?? 0) > 0 || (r.forsaljning ?? 0) > 0 || r.konton.some((k) => k.spend > 0)));
  const bidrag = vinstMed.length ? vinstMed.reduce((s, r) => s + r.vinst.bidrag, 0) : null;
  const netto = vinstMed.reduce((s, r) => s + r.vinst.netto, 0);
  return { mer: reklam > 0 ? forsaljning / reklam : null, forsaljning, reklam, med, utan, bidrag, marginal: bidrag !== null && netto > 0 ? bidrag / netto : null, vinstMed, vinstUtan };
}

// -------------------------------------------------------------- hälsa

const IKON = { ok: '✅', fel: '❌', saknas: '⚠️', hoppad: '⏭️', delvis: '⚠️' };

/** Källornas läge — det som gör att sidan kan säga "vet inte" i stället för noll. */
export function kallolage(snapshot) {
  const kallor = snapshot?.kallor ?? [];
  return {
    kallor: kallor.map((k) => ({ ...k, ikon: IKON[k.status] ?? '•' })),
    fel: kallor.filter((k) => k.status === 'fel'),
    varningar: kallor.filter((k) => k.status === 'saknas' || k.status === 'hoppad'),
    byggd: snapshot?.byggd ?? null,
  };
}

/** Produkterna i en form kampanjmatchningen kan använda. */
export function produktlista(snapshot) {
  return (snapshot?.produkter ?? []).map((p) => ({ ...p, kampanjIds: p.kampanjIds ?? [] }));
}
