// ekonomi.mjs — break-even för Matstrumpor, båda momslinjerna.
//
// Ren räknelogik: inga nätanrop, inga sidoeffekter. Samma princip som
// factory/ekonomi.mjs — momsfrågan är ett öppet ägarbeslut (konfig.json
// ekonomi.moms_antagen), så koden lämnar ALDRIG ut ett ensamt break-even-tal
// förrän det är besvarat. En annons vars CPA hamnar mellan linjerna får domen
// `beror_pa_moms` och rörs inte.
//
//   break-even-ROAS = AOV / (AOV − kostnad per order)
//   break-even-CPA  = AOV − kostnad per order
//
// Med moms i priset är intäkten vi behåller AOV/1,25 — momsen är inte vår.
// Då blir täckningsbidraget AOV/1,25 − kostnad, och break-even-ROAS räknas
// fortfarande mot vad Meta rapporterar (bruttot), alltså AOV / täckningsbidrag.

export const MOMSSATS = 0.25;

/** Kostnad per order i kronor: inköp + tull omräknad ur EUR. */
export function kostnadPerOrder({ kostnad_per_order_sek, tull_eur = 0, eur_sek = 0 }) {
  if (!Number.isFinite(kostnad_per_order_sek)) throw new Error('kostnad_per_order_sek saknas i konfigen.');
  const tull = Number(tull_eur) * Number(eur_sek);
  if (tull_eur && !eur_sek) throw new Error('tull_eur angiven men eur_sek saknas — hämta kursen, gissa aldrig.');
  return round2(kostnad_per_order_sek + tull);
}

/** En momslinje: täckningsbidrag, break-even-ROAS och break-even-CPA. */
export function linje(aov, kostnad, medMoms) {
  const intakt = medMoms ? aov / (1 + MOMSSATS) : aov;
  const tackningsbidrag = intakt - kostnad;
  if (tackningsbidrag <= 0) {
    return { med_moms: medMoms, intakt: round2(intakt), tackningsbidrag: round2(tackningsbidrag), break_even_roas: null, break_even_cpa_sek: null, varning: 'Täckningsbidraget är noll eller negativt — produkten går inte att annonsera lönsamt på det här priset.' };
  }
  return {
    med_moms: medMoms,
    intakt: round2(intakt),
    tackningsbidrag: round2(tackningsbidrag),
    break_even_roas: round3(aov / tackningsbidrag),
    break_even_cpa_sek: round2(tackningsbidrag),
  };
}

/** Båda linjerna + vilken som gäller (null tills moms_antagen är satt). */
export function brytpunkter(konfig) {
  const e = konfig?.ekonomi ?? {};
  const aov = Number(e.aov_sek);
  if (!Number.isFinite(aov) || aov <= 0) throw new Error('ekonomi.aov_sek saknas — mät med `node matstrumpor/kor.mjs --aov`, hitta aldrig på den.');
  const kostnad = kostnadPerOrder(e);
  const utan = linje(aov, kostnad, false);
  const med = linje(aov, kostnad, true);
  const antagen = e.moms_antagen;
  return {
    aov_sek: round2(aov),
    kostnad_per_order_sek: kostnad,
    utan_moms: utan,
    med_moms: med,
    moms_antagen: antagen ?? null,
    gallande: antagen === true ? med : antagen === false ? utan : null,
    oppen_fraga: antagen === null || antagen === undefined,
  };
}

/** Domen för EN annons mot brytpunkterna.
 *  Returnerar alltid `bedombar` bredvid domen — en dom under grinden är ingen dom. */
export function dom(annons, bryt, grindar) {
  const spend = num(annons.spend_sek);
  const kop = num(annons.kop);
  const roas = annons.roas === null || annons.roas === undefined ? null : num(annons.roas);
  const bedombar = spend >= grindar.signifikans_spend_sek || kop >= grindar.signifikans_kop;

  if (!bedombar) {
    return { namn: annons.namn, bedombar: false, dom: 'FOR_TIDIGT', motivering: `${spend.toFixed(0)} kr och ${kop} köp — under grinden ${grindar.signifikans_spend_sek} kr eller ${grindar.signifikans_kop} köp.` };
  }
  if (roas === null) {
    return { namn: annons.namn, bedombar: true, dom: 'DATA_SAKNAS', motivering: 'ROAS saknas i avläsningen — ingen dom hittas på.' };
  }
  if (bryt.oppen_fraga) {
    const over = roas >= bryt.utan_moms.break_even_roas;
    const under = roas < bryt.med_moms.break_even_roas;
    if (over && !under) return { namn: annons.namn, bedombar: true, dom: 'OVER_BREAK_EVEN', motivering: `ROAS ${roas.toFixed(2)} ligger över båda linjerna (${bryt.utan_moms.break_even_roas} / ${bryt.med_moms.break_even_roas}).` };
    if (!over && under) return { namn: annons.namn, bedombar: true, dom: 'UNDER_BREAK_EVEN', motivering: `ROAS ${roas.toFixed(2)} ligger under båda linjerna (${bryt.utan_moms.break_even_roas} / ${bryt.med_moms.break_even_roas}).` };
    return { namn: annons.namn, bedombar: true, dom: 'BEROR_PA_MOMS', motivering: `ROAS ${roas.toFixed(2)} ligger MELLAN linjerna (${bryt.utan_moms.break_even_roas} utan moms / ${bryt.med_moms.break_even_roas} med moms). Ingen kill, ingen skalning förrän Axel svarat på momsfrågan.` };
  }
  const be = bryt.gallande.break_even_roas;
  return roas >= be
    ? { namn: annons.namn, bedombar: true, dom: 'OVER_BREAK_EVEN', motivering: `ROAS ${roas.toFixed(2)} mot break-even ${be}.` }
    : { namn: annons.namn, bedombar: true, dom: 'UNDER_BREAK_EVEN', motivering: `ROAS ${roas.toFixed(2)} mot break-even ${be}.` };
}

/** Vinstbidrag = (break-even-CPA − CPA) × köp. ANALYSMETODens enda ranking.
 *
 *  ⚠️ Break-even-CPA räknas på ANNONSENS EGET ordervärde när det går att läsa
 *  (ROAS × spend / köp), inte på kampanjens AOV. Annars säger de två måtten
 *  emot varandra: `MATSTRUMP_sushi_gift_ugc_s001h1_v2` hade ROAS 2,214 mot
 *  break-even 2,139 (alltså ÖVER) men CPA 300 kr mot kampanjens break-even-CPA
 *  216 kr (alltså UNDER) — dess kunder handlade för 665 kr i snitt, inte 462.
 *  Med annonsens eget ordervärde blir domen och rankingen samma sak igen
 *  (vinstbidrag > 0 ⟺ ROAS ≥ break-even-ROAS), vilket är hela poängen.
 *
 *  Utan gällande momslinje räknas det på den FÖRSIKTIGA (med moms) — och raden
 *  märks, så ingen läser talet som exakt. */
export function vinstbidrag(annons, bryt) {
  const kop = num(annons.kop);
  if (!kop) return { namn: annons.namn, vinstbidrag_sek: 0, forsiktigt: bryt.oppen_fraga, motivering: 'Noll köp — inget vinstbidrag att räkna.' };
  const linjen = bryt.gallande ?? bryt.med_moms;
  if (!linjen.break_even_cpa_sek) return { namn: annons.namn, vinstbidrag_sek: null, forsiktigt: true, motivering: linjen.varning ?? 'Break-even-CPA saknas.' };

  const spend = num(annons.spend_sek);
  const cpa = spend / kop;
  const marginalandel = Number.isFinite(linjen.tackningsbidrag) && bryt.aov_sek
    ? linjen.tackningsbidrag / bryt.aov_sek                        // täckningsbidrag per intäktskrona
    : null;
  const egetOrdervarde = annons.roas === null || annons.roas === undefined ? null : round2((num(annons.roas) * spend) / kop);
  const beCpa = egetOrdervarde && marginalandel ? round2(egetOrdervarde * marginalandel) : linjen.break_even_cpa_sek;

  return {
    namn: annons.namn,
    cpa_sek: round2(cpa),
    ordervarde_sek: egetOrdervarde ?? bryt.aov_sek,
    break_even_cpa_annons_sek: beCpa,
    vinstbidrag_sek: round2((beCpa - cpa) * kop),
    forsiktigt: bryt.oppen_fraga,
    motivering: `(${beCpa} − ${round2(cpa)}) × ${kop}${egetOrdervarde ? ` · annonsens eget ordervärde ${egetOrdervarde} kr (kampanjens AOV ${bryt.aov_sek})` : ' · kampanjens AOV (annonsens ROAS saknas)'}${bryt.oppen_fraga ? ' · MED-moms-linjen tills momsfrågan är besvarad' : ''}`,
  };
}

/** Rangordnar på vinstbidrag och pekar ut benchmarken (> 30 % av totalen).
 *  Benchmarken dödas aldrig — regeln finns för att en tidigare chatt dömde ut
 *  top spendern för låg ROAS när den stod för ~50 % av all vinst. */
export function rangordna(annonser, bryt, grindar) {
  const bedombara = annonser.filter((a) => dom(a, bryt, grindar).bedombar);
  const rader = bedombara.map((a) => ({ ...vinstbidrag(a, bryt), ...dom(a, bryt, grindar) }));
  rader.sort((x, y) => (y.vinstbidrag_sek ?? 0) - (x.vinstbidrag_sek ?? 0));
  const positiva = rader.filter((r) => (r.vinstbidrag_sek ?? 0) > 0).reduce((s, r) => s + r.vinstbidrag_sek, 0);
  for (const r of rader) {
    r.andel_av_vinst = positiva > 0 ? round3((r.vinstbidrag_sek ?? 0) / positiva) : 0;
    r.benchmark = r.andel_av_vinst > grindar.benchmark_andel;
    if (r.benchmark) r.skydd = true;          // bär > 30 % av vinsten ⇒ dödas aldrig
  }
  // Går INGEN annons plus är andelen noll för alla, och benchmark-skyddet hade
  // försvunnit just när det behövs mest. Fall då tillbaka på spendandelen: den
  // annons Meta själv ger mest pengar är kampanjens riktmärke, och den döms
  // aldrig mot en småannons. (Regeln finns för att en tidigare chatt dömde ut
  // top spendern — den stod för ~50 % av all vinst.)
  if (positiva <= 0 && rader.length) {
    const spendTotalt = rader.reduce((s, r) => s + num(annonser.find((a) => a.namn === r.namn)?.spend_sek), 0);
    let topp = null;
    for (const r of rader) {
      const spend = num(annonser.find((a) => a.namn === r.namn)?.spend_sek);
      r.andel_av_spend = spendTotalt > 0 ? round3(spend / spendTotalt) : 0;
      if (!topp || r.andel_av_spend > topp.andel_av_spend) topp = r;
    }
    if (topp && topp.andel_av_spend > grindar.benchmark_andel) {
      // RIKTMÄRKE, INTE SKYDD. Skyddet ("dödas aldrig") gäller annonsen som bär
      // > 30 % av VINSTEN. Går ingen plus finns ingen sådan annons, och en top
      // spender som blöder ska gå att döda — annars fryser regeln fast precis
      // det som kostar mest. Raden märks därför som riktmärke att jämföra mot,
      // med `skydd: false`, och domen görs på vinstbidraget som vanligt.
      topp.benchmark = true;
      topp.benchmark_pa_spend = true;
      topp.skydd = false;
      topp.benchmark_motivering = `Ingen annons går plus, så ingen bär > ${grindar.benchmark_andel * 100} % av vinsten. ${(topp.andel_av_spend * 100).toFixed(0)} % av spenden ⇒ kampanjens RIKTMÄRKE att jämföra mot — men inte skyddad: går den back är den en kill-kandidat som alla andra.`;
    }
  }
  return { rader, for_tidigt: annonser.filter((a) => !dom(a, bryt, grindar).bedombar).map((a) => a.namn), vinst_totalt_sek: round2(positiva) };
}

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const round2 = (v) => Math.round(v * 100) / 100;
const round3 = (v) => Math.round(v * 1000) / 1000;
