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
import { dagnyckel, forandring, vinstbidragRoas, breakEvenUrNamn, cpa, motBreakEven, bedombar } from './berakna.mjs';

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

/** Ett annonskontos läge, samma perioder som butikerna. */
export function kontoLage(konto) {
  const dagar = konto?.dagar ?? [];
  const sista = (antal, hopp = 0) => {
    const slut = dagar.length - hopp;
    return dagar.slice(Math.max(0, slut - antal), Math.max(0, slut));
  };
  // Metas dagsserie slutar i går (date presets utesluter innevarande dag).
  const igar = dagar[dagar.length - 1] ?? null;
  const vecka = sista(7);
  const forraVeckan = sista(7, 7);
  const manad = sista(30);
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

export function allaKontolagen(snapshot) {
  return (snapshot?.annonskonton ?? []).map(kontoLage);
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
  const konton = allaKontolagen(snapshot).filter((k) => k.status === 'ok');

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

// -------------------------------------------------------------- hälsa

const IKON = { ok: '✅', fel: '❌', saknas: '⚠️', hoppad: '⏭️' };

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
