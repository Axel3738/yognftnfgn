#!/usr/bin/env node
// kor.mjs — Matstrumpors CLI. Räknar, läser och planerar. Skriver ALDRIG i Meta.
//
// Meta LÄSES via META_ACCESS_TOKEN sedan 2026-09-22 (meta.mjs) — Axel gav
// användaren "API LONG TERM" åtkomst till kontot "nya kungen" 730973156224390
// den dagen; till och med 2026-09-21 svarade kontot "(#200) Ad account owner
// has NOT granted ads_management". Uppladdningen (/matstrumpor) går fortfarande
// via Adsmanager-MCP:n i en session Axel startar — den vägen är inte ombyggd.
// Det här skriptet skriver aldrig i Meta, så att räkningen är testbar och
// svaret blir detsamma varje gång.
//
//   node matstrumpor/kor.mjs --kolla            vad som finns och vad som saknas
//   node matstrumpor/kor.mjs --ekonomi          break-even, båda momslinjerna
//   node matstrumpor/kor.mjs --ekonomi --marknad US   break-even per marknad ur cogs.json (landad kostnad) + ECB-kurs
//   node matstrumpor/kor.mjs --aov [--dagar 30] mät AOV ur Shopify på riktigt
//   node matstrumpor/kor.mjs --struktur [--json]   3:2:2-läget i kampanjen ur Meta (token, läs-bart): Champions, levererande adsets, taket, lediga platser
//   node matstrumpor/kor.mjs --ko [--json] [--grupp 063,066,067] [--hookrad <sid-id>] [--utan-struktur]   Notion-kön → koncept → testadsets (3:2:2)
//   node matstrumpor/kor.mjs --creative <annonsnamn> (--video <id> --thumb <url> | --bild <hash>)   creative-JSON till ads_create_ad (2 rubriker + 2 texter)
//   node matstrumpor/kor.mjs --adset-skapad <adset-id> <adset-namn> [--koncept <nnn>]   logga ett nytt testadset (före annonserna)
//   node matstrumpor/kor.mjs --adset-kasserat <adset-id> [--orsak "…"]   kvittera ett avbrutet bygge (utkastet kasserat)
//   node matstrumpor/kor.mjs --kontroll <adset-id>   läs tillbaka ett testadset ur Meta: 3 annonser, 2 + 2 texter, sida, länk, en mediatyp
//   node matstrumpor/kor.mjs --namn <vinkel> <format> [antal] [--iter <förälder>|--im] [--hookar <k>]   nästa lediga namn
//   node matstrumpor/kor.mjs --kordag [--idag YYYY-MM-DD]   är det rond i dag? exit 0 ja, 2 nej
//   node matstrumpor/kor.mjs --hamta [--marknad NO] [--bara-se]   avläsningen ur Meta (token) → jobbfiler, Sverige + utlandet
//   node matstrumpor/kor.mjs --dom <fil.json> [--json] [--logga]  döm annonser ur en avläsning (--logga skriver ETIKETT-raderna)
//   node matstrumpor/kor.mjs --dom-alla [--json] [--logga]        samma för alla dagens avläsningar (Sverige + varje marknad)
//   node matstrumpor/kor.mjs --arkiv            bygg arkivet: products/matstrumpor/arkiv.json + arkiv.md
//   node matstrumpor/kor.mjs --uppladdad <annons> <annons-id> <adset-id> [--koncept <nnn>] [--notion <id>] [--kalla <fil>] [--kreator <namn>] [--landning <url>]
//   node matstrumpor/kor.mjs --status           lärdomar, briefer, brieftak, mix, hit rate, koncepten
//   node matstrumpor/kor.mjs --rond-klar        logga ROND_KLAR (sist i ronden)

import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { brytpunkter, rangordna, dom } from './ekonomi.mjs';
import { etikettera, formateraFrekvens, levandeBreakthrough, dagarMellan, ETIKETT, RANG, arUppgradering, gallandeEtiketter, hitRate } from './etikett.mjs';
import { brieftak, mix, skelett, konceptStatus, koncepttak, vantandeKoncept } from './lardom.mjs';
import { nastaNummer_flera, bygg, tolka, adsetNyckel, samlaKandaNamn, nastaIterationPa, mediatyp } from './namn.mjs';
import { hamtaKo, planera, planeraKoncept, hubbNamn } from './kon.mjs';
import { strukturLage, regler as strukturRegler, adsetSpec, creativeSpec, kontrolleraAdset, tolkaAdsetNamn, adsetNamn, levererar } from './struktur.mjs';
import { domAdsets, forslagRader, adsetDomRader, nyaRader as nyaAdsetRader, DOM } from './dom.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));
export const KONFIGFIL = join(ROT, 'konfig.json');
export const LOGGFIL = join(ROT, 'logg.jsonl');
export const LARDOMSFIL = join(ROT, '..', 'products', 'matstrumpor', 'lardomar.md');
export const UTMAPP = join(ROT, 'output');

/** Svenskt datum i dag (YYYY-MM-DD). */
export function idagSE(nu = new Date()) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Stockholm', year: 'numeric', month: '2-digit', day: '2-digit' }).format(nu);
}

const plusDagar = (datum, n) => new Date(Date.parse(`${datum}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);

/** Loggkoder som visar att en rond faktiskt gjordes — reserven när ingen
 *  ROND_KLAR skrivits (ronden 2026-09-21 kördes för hand, före den koden). */
export const RONDSPAR = ['ETIKETT', 'LARDOM', 'BRIEF', 'FORSLAG'];

/** Datumet för förra ronden ur loggen: ROND_KLAR först, annars senaste
 *  rondspåret. null = ingen rond har gjorts. Ren. */
export function sistaRond(logg) {
  const datum = (koder) => (logg ?? []).filter((r) => koder.includes(r.kod) && /^\d{4}-\d{2}-\d{2}$/.test(String(r.datum ?? ''))).map((r) => r.datum).sort().at(-1) ?? null;
  const klar = datum(['ROND_KLAR']);
  if (klar) return { datum: klar, kalla: 'ROND_KLAR' };
  const spar = datum(RONDSPAR);
  if (spar) return { datum: spar, kalla: `rondspår i loggen (${RONDSPAR.join('/')}) — ingen ROND_KLAR skriven än` };
  return null;
}

/** Är det kördag? Kadensen (var N:e dag) räknas från FÖRRA ronden, inte från
 *  ett kalenderrutnät: missas en dag går ronden nästa dag i stället för att
 *  vänta tre till, och en rond som kraschade mitt i (ingen ROND_KLAR) körs om
 *  nästa morgon. Cronen är daglig med flit — skriptet avgör, som /commission. */
export function arKordag(logg, idag, varNDag) {
  const n = Number(varNDag);
  if (!Number.isInteger(n) || n < 1) throw new Error(`kadens.rond_var_n_dag = ${varNDag} — måste vara ett heltal ≥ 1.`);
  const sista = sistaRond(logg);
  if (!sista) return { kor: true, sista: null, nasta: idag, skal: 'ingen rond i loggen — första ronden körs i dag.' };
  const d = dagarMellan(sista.datum, idag);
  const nasta = plusDagar(sista.datum, n);
  if (d >= n) return { kor: true, sista, nasta: idag, skal: `${d} dygn sedan förra ronden ${sista.datum} (${sista.kalla}) — kadensen är var ${n}:e dag.` };
  return { kor: false, sista, nasta, skal: `bara ${d} dygn sedan förra ronden ${sista.datum} (${sista.kalla}) — nästa rond ${nasta}.` };
}

export function lasKonfig(fil = KONFIGFIL) {
  return JSON.parse(readFileSync(fil, 'utf8'));
}

export function lasLogg(fil = LOGGFIL) {
  if (!existsSync(fil)) return [];
  return readFileSync(fil, 'utf8').split('\n').filter(Boolean).map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
}

export function skrivRad(rad, fil = LOGGFIL) {
  mkdirSync(dirname(fil), { recursive: true });
  appendFileSync(fil, `${JSON.stringify({ ...rad, skrivet: new Date().toISOString() })}\n`);
  return rad;
}

/** Etiketterna ur en jobbfil — vecka 1 för annonser utan etikett, och vecka
 *  2–3 som UPPGRADERING när de ger en högre etikett än loggen (Evolve: en KPI
 *  winner kan bli breakthrough vecka 2–3). Ren: loggen och break-even in,
 *  raderna ut. Sänker aldrig en etikett. */
export function etikettraderFor(jobb, { logg = [], breakEven = null, grindar, idag }) {
  const galler = gallandeEtiketter(logg.filter((r) => r.kod === 'ETIKETT'));
  const unga = [];
  const etiketter = [];
  for (const a of jobb.annonser ?? []) {
    const fv = a.forsta_vecka;
    if (fv && fv.komplett === false) { unga.push({ namn: a.namn, d0: a.d0, until: fv.until ?? null, dagar: fv.dagar_med_data, skal: fv.skal ?? null }); continue; }
    const kamp = (v) => ({ spend_sek: v.kampanj_spend_sek, roas: v.kampanj_roas, spend_w0_sek: v.kampanj_spend_w0_sek, budget_d0: v.budget_d0, budget_d7: v.budget_d7, budgetandringar: v.budgetandringar });
    const tidigare = galler.get(a.namn) ?? null;
    const kandidater = [];
    const e1 = fv
      ? etikettera({ namn: a.namn, spend_sek: fv.spend_sek, kop: fv.kop, roas: fv.roas }, kamp(fv), breakEven, grindar)
      : etikettera(a, jobb.kampanj ?? {}, breakEven, grindar);
    kandidater.push({ ...e1, vecka: 1, fonster: fv ? `${fv.since}..${fv.until}` : (jobb.kampanj?.fonster ?? 'okänt'), hook_rate: fv?.hook_rate ?? a.hook_rate ?? null, hold_rate: fv?.hold_rate ?? a.hold_rate ?? null });
    for (const n of [2, 3]) {
      const v = a.veckor?.[n];
      if (!v || !v.komplett) continue;
      const e = etikettera({ namn: a.namn, spend_sek: v.spend_sek, kop: v.kop, roas: v.roas }, kamp(v), breakEven, grindar);
      kandidater.push({ ...e, vecka: n, fonster: `${v.since}..${v.until}`, hook_rate: v.hook_rate ?? null, hold_rate: v.hold_rate ?? null });
    }
    // Det som ska loggas: vecka 1 om loggen saknar etikett (aldrig om den finns
    // — en regeländring får inte skriva om historien), sedan varje senare vecka
    // som är en UPPGRADERING mot det som gäller. Aldrig nedåt. En uppgradering
    // ska BÄRA: spend winner/breakthrough, eller över grinden (300 kr / 3 köp).
    // Mätt 2026-10-01: utan grinden blev tio annonser "KPI winner" vecka 2–3 på
    // ETT köp för 18–117 kr — brus, inte Evolves "blev en vinnare senare".
    const att = [];
    let bas = tidigare?.etikett ?? null;
    for (const k of kandidater) {
      if (RANG[k.etikett] === undefined) continue;
      if (k.vecka === 1 && tidigare) continue;
      const bar = RANG[k.etikett] >= RANG.SPEND_WINNER || k.bedombar;
      if (k.vecka === 1 || (arUppgradering(bas, k.etikett) && bar)) {
        att.push(rad(k, k.vecka === 1 ? null : bas));
        bas = k.etikett;
      }
    }
    etiketter.push({ ...kandidater[0], d0: a.d0 ?? null, marknad: a.marknad ?? jobb.marknad ?? 'SE', aktiv: a.effective_status ? a.effective_status === 'ACTIVE' : undefined, konv_lpv: a.konv_lpv ?? null, senare_veckor: kandidater.slice(1).map((k) => ({ vecka: k.vecka, etikett: k.etikett })), redan_loggad: tidigare ? { etikett: tidigare.etikett, datum: tidigare.datum, vecka: tidigare.vecka ?? 1 } : null, att_logga: att });

    function rad(k, fran) {
      return { kod: 'ETIKETT', datum: idag, annons: a.namn, marknad: a.marknad ?? jobb.marknad ?? 'SE', etikett: k.etikett, vecka: k.vecka, bedombar: k.bedombar, andel: k.andel ?? null, tillvaxt: k.tillvaxt ?? null, fonster: k.fonster, spend_sek: k.spend_sek, kop: k.kop, roas: k.roas, hook_rate: k.hook_rate ?? null, hold_rate: k.hold_rate ?? null, konv_lpv: a.konv_lpv ?? null, orsak: k.motivering, ...(k.yttre_handelse ? { yttre_handelse: k.yttre_handelse } : {}), ...(fran ? { uppgradering_fran: fran } : {}) };
    }
  }
  return { etiketter, unga };
}

/** Domen över EN jobbfil: vinstbidraget (bara Sverige — break-even per
 *  utlandsmarknad finns inte än, 13 av 21 kampanjländer saknar kostnad i
 *  cogs.json), etiketterna med uppgraderingar, de unga och hit rate.
 *  logga ⇒ ETIKETT-raderna skrivs i loggen (aldrig dubbletter: etikettraderFor
 *  läser loggen först). json: false = ingen fil, null = standardnamnet, en
 *  sträng = den sökvägen. Returnerar domen så att testerna kan läsa den. */
export function korDom(jobb, konfig, bryt, { json = false, logga = false, loggfil = LOGGFIL, utmapp = UTMAPP, tyst = false, koVantar = null } = {}) {
  const skriv = tyst ? () => {} : (s = '') => console.log(s);
  if (jobb.konto && String(jobb.konto) !== String(konfig.meta.ad_account_id)) throw new Error(`Jobbfilen är läst ur konto ${jobb.konto}, konfigen säger ${konfig.meta.ad_account_id} — fel konto, dömer inget.`);
  const marknad = jobb.marknad ?? 'SE';
  const sverige = marknad === 'SE';
  const be = sverige ? (bryt.gallande?.break_even_roas ?? null) : null;
  const idag = jobb.datum ?? idagSE();
  skriv('');
  skriv(`━━ ${marknad} · ${jobb.kampanj?.namn ?? 'kampanj okänd'} ━━`);
  let rank = null;
  if (sverige) {
    rank = rangordna(jobb.annonser ?? [], bryt, konfig.grindar);
    skriv(`Vinstbidrag, ${jobb.kampanj?.fonster ?? '14 dagar'} (${rank.rader.length} bedömbara, ${rank.for_tidigt.length} för tidigt):`);
    for (const r of rank.rader) skriv(`  ${(r.vinstbidrag_sek ?? 0).toFixed(0).padStart(7)} kr  ${r.namn}  CPA ${r.cpa_sek ?? '—'} · ${r.dom}${r.benchmark ? (r.skydd ? '  ★ BENCHMARK — dödas aldrig' : '  ★ RIKTMÄRKE (ingen går plus — inte skyddad)') : ''}`);
    if (rank.for_tidigt.length) skriv(`  För tidigt (${rank.for_tidigt.length} under grinden): ${rank.for_tidigt.slice(0, 8).join(', ')}${rank.for_tidigt.length > 8 ? ' … (alla i --json)' : ''}`);
  } else {
    if (jobb.kampanj_start !== null) skriv(`Vinstbidrag: räknas inte för ${marknad} — break-even per marknad saknas (cogs.json, granskningen G-F08). Etiketterna kan därför aldrig bli BREAKTHROUGH, bara SPEND_WINNER med "break-even okänt".`);
  }

  const { etiketter, unga } = etikettraderFor(jobb, { logg: lasLogg(loggfil), breakEven: be, grindar: konfig.grindar, idag });
  const nyaRader = etiketter.flatMap((e) => e.att_logga);
  // En kampanj som inte startat: en rad, inte åtta (14 utlandskampanjer 2026-10-01).
  if (!etiketter.length && jobb.kampanj_start === null) {
    skriv(`Kampanjen har inte spenderat än — ${unga.length} annonser väntar, ingen etikett förrän första spenddagen + 7 dygn.`);
    const ut = { datum: jobb.datum ?? null, marknad, break_even_roas: be, kampanj: jobb.kampanj ?? null, ranking: rank, etiketter, for_unga: unga, att_logga: [] };
    if (json !== false) {
      const fil = json ?? join(utmapp, `dom-${idag}${sverige ? '' : `-${marknad}`}.json`);
      mkdirSync(dirname(fil), { recursive: true });
      writeFileSync(fil, `${JSON.stringify(ut, null, 2)}\n`);
    }
    return ut;
  }
  const forsta = etiketter.filter((e) => !e.redan_loggad);
  skriv('');
  skriv(`Etiketter (annonsens egna veckor): ${formateraFrekvens(etiketter.filter((e) => e.etikett === ETIKETT.BREAKTHROUGH).length, etiketter.length)} breakthrough vecka 1 · ${forsta.length} nya · ${nyaRader.filter((r) => r.uppgradering_fran).length} uppgraderingar · ${etiketter.length - forsta.length} redan i loggen`);
  for (const e of etiketter) {
    const upp = e.att_logga.filter((r) => r.uppgradering_fran).map((r) => `vecka ${r.vecka}: ${r.uppgradering_fran} → ${r.etikett}`);
    skriv(`  ${e.etikett.padEnd(15)} ${e.namn}  [${e.fonster}] ${e.motivering}${e.redan_loggad ? `  (loggad ${e.redan_loggad.datum} som ${e.redan_loggad.etikett})` : ''}${upp.length ? `  ⬆ ${upp.join(', ')}` : ''}`);
    if (e.yttre_handelse) skriv(`      ⚠️ ${e.yttre_handelse}`);
  }
  if (unga.length) skriv(`  För unga för etikett (${unga.length}): ${unga.slice(0, 8).map((u) => `${u.namn} (${u.d0 ? `D0 ${u.d0}, ${u.dagar} dagar` : u.skal ?? 'inte startad'})`).join(', ')}${unga.length > 8 ? ' … (alla i --json)' : ''}`);
  const galler = [...gallandeEtiketter([...lasLogg(loggfil).filter((r) => r.kod === 'ETIKETT'), ...nyaRader]).values()].filter((r) => (r.marknad ?? 'SE') === marknad);
  skriv(`Hit rate ${marknad} (breakthrough + spend winner): ${hitRate(galler).text}`);

  if (logga) {
    for (const r of nyaRader) skrivRad(r, loggfil);
    skriv(nyaRader.length ? `${nyaRader.length} ETIKETT-rader loggade (${marknad}).` : `Inga nya ETIKETT-rader för ${marknad}.`);
  } else if (nyaRader.length) {
    skriv(`${nyaRader.length} ETIKETT-rader väntar — kör med --logga för att skriva dem.`);
  }

  // 3:2:2 (Axels beslut 2026-10-02): domen per ADSET, aldrig per annons. Bara
  // Sverige — utlandets kampanjer är inte byggda som 3:2:2. Etiketterna ovan är
  // lärdomen per annons; stängningsbeslutet tas här, på adsetnivå, och blir ett
  // FÖRSLAG till Axel (kungen skalar aldrig, Axels beslut 2026-09-21).
  // Benchmarken (annonsen med > 30 % av vinsten) dödas aldrig — adsetet som bär
  // den får aldrig ett stängningsförslag (dom.mjs skydda).
  const skyddade = new Set((rank?.rader ?? []).filter((r) => r.skydd).map((r) => r.namn));
  const adsetDel = sverige && Array.isArray(jobb.adsets) ? korAdsetDom(jobb, konfig, be, { idag, koVantar, logga, loggfil, skriv, skyddade }) : null;
  if (sverige && !Array.isArray(jobb.adsets)) skriv('Adseten: avläsningen saknar adset-serien (äldre jobbfil) — kör --hamta igen för domen per adset.');

  const ut = { datum: jobb.datum ?? null, marknad, break_even_roas: be, kampanj: jobb.kampanj ?? null, ranking: rank, etiketter, for_unga: unga, att_logga: nyaRader, ...(adsetDel ? { adsets: adsetDel.domar, forslag_adset: adsetDel.forslag } : {}) };
  if (json !== false) {
    const fil = json ?? join(utmapp, `dom-${idag}${sverige ? '' : `-${marknad}`}.json`);
    mkdirSync(dirname(fil), { recursive: true });
    writeFileSync(fil, `${JSON.stringify(ut, null, 2)}\n`);
    skriv(`Domen som JSON: ${fil}`);
  }
  return ut;
}

/** Adsetdomen i en jobbfil: utskriften, ADSET_DOM- och FORSLAG-raderna (med
 *  logga, aldrig dubbelt). koVantar = koncept som väntar på en testplats (ur
 *  dagens --ko), null = okänt. Returnerar domarna och förslagen. */
export function korAdsetDom(jobb, konfig, breakEven, { idag, koVantar = null, logga = false, loggfil = LOGGFIL, skriv = () => {}, skyddade = new Set() } = {}) {
  const r = strukturRegler(konfig);
  const domar = domAdsets(jobb, konfig, { breakEven, koVantar, idag, skyddade });
  const forslag = forslagRader(domar, idag, { logg: lasLogg(loggfil) });
  const lev = jobb.adsets.filter((a) => levererar(a)).length;
  skriv('');
  skriv(`Adseten (3:2:2 — dom per adset, aldrig per annons): ${domar.length} i kampanjen, ${lev} levererar, taket ${r.max_adsets_totalt} inkl. Champions · koncept som väntar på plats: ${koVantar ?? 'okänt (kör --ko först)'}`);
  for (const d of domar) {
    skriv(`  ${d.dom.padEnd(13)} ${d.adset} [${d.roll}${d.dagar !== null ? `, dag ${d.dagar}` : ''}${d.fonster ? `, ${d.fonster}` : ''}] ${d.spend_sek} kr · ${d.kop} köp · ROAS ${d.roas ?? '—'} · ${d.andel === null ? '—' : `${Math.round(d.andel * 100)} %`} av spenden`);
    skriv(`      ${d.motivering}${d.redan_foreslagen ? ' (flytten är redan föreslagen — ingen ny rad)' : ''}`);
  }
  skriv(forslag.length ? `Förslag till Axel (${forslag.length}, på kronor): ${forslag.map((f) => `${f.atgard === 'STANG_ADSET' ? 'stäng' : 'flytta'} ${f.objekt}${f.atgard === 'FLYTTA_TILL_CHAMPIONS' ? ` → ${f.till}, befintligt inlägg ${f.post_id ?? '(post-id saknas)'}` : ''} (${Math.round(f.kronor ?? 0)} kr)`).join(' · ')}` : 'Inga adsetförslag i dag.');
  if (logga) {
    const nya = nyaAdsetRader([...adsetDomRader(domar, idag), ...forslag], lasLogg(loggfil));
    for (const rad of nya) skrivRad(rad, loggfil);
    skriv(nya.length ? `${nya.length} ADSET_DOM/FORSLAG-rader loggade.` : 'Inga nya ADSET_DOM/FORSLAG-rader.');
  }
  return { domar, forslag };
}

/** Koncept som väntar på en testplats enligt dagens kö (output/ko-<datum>.json).
 *  Färdiga creatives som vill ha en plats = klara + väntar på plats + väntar på
 *  copy (filerna är klara, bara rubrik 2/text 2 saknas) + väntar på strukturen;
 *  minus de lediga platserna (ett klart koncept har redan en). Lästes inte
 *  strukturen är platserna okända ⇒ null, så domen aldrig påstår att "inget
 *  väntar" eller stänger på en gissning. null också när ingen kö lästs i dag. */
export function koVantarIdag(idag, mapp = UTMAPP) {
  const fil = join(mapp, `ko-${idag}.json`);
  if (!existsSync(fil)) return null;
  try {
    return koVantarUr(JSON.parse(readFileSync(fil, 'utf8')));
  } catch { return null; }
}

/** Ren kärna i koVantarIdag. */
export function koVantarUr(k) {
  const s = k?.summa ?? {};
  const redo = (s.klara ?? 0) + (s.vantar_plats ?? 0) + (s.vantar_copy ?? 0) + (s.vantar_struktur ?? 0);
  if (!redo) return 0;
  const lediga = s.lediga ?? k?.struktur?.lediga ?? null;
  if (lediga === null || lediga === undefined || k?.struktur_fel) return null;
  return Math.max(0, redo - lediga);
}

/** Senaste avläsningen på disk (`output/avlasning-YYYY-MM-DD.json`), eller null.
 *  Mappen är gitignorerad — i en rutinsession finns den bara om --hamta körts. */
export function senasteAvlasning(mapp = UTMAPP) {
  if (!existsSync(mapp)) return null;
  const filer = readdirSync(mapp).filter((f) => /^avlasning-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
  if (!filer.length) return null;
  const fil = filer[filer.length - 1];
  return { fil: join(mapp, fil), datum: fil.slice(10, 20) };
}

/** Döper om en Notion-rad (titeln). Namnet ÄR routingen, så det ska stå på ETT
 *  ställe — raden — inte bara i uppladdarens huvud. Läser tillbaka och
 *  kontrollerar; ett namnbyte som inte gick igenom är värre än inget. */
export async function dopOm(sidId, nyttNamn, fetchFn = fetch) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN saknas.');
  const huvud = { Authorization: `Bearer ${token}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' };
  const sida = await (await fetchFn(`https://api.notion.com/v1/pages/${sidId}`, { headers: huvud })).json();
  if (sida.object === 'error') throw new Error(`Notion: ${sida.message}`);
  const titelFalt = Object.entries(sida.properties).find(([, v]) => v.type === 'title')?.[0];
  if (!titelFalt) throw new Error('Raden har inget titelfält.');
  const svar = await (await fetchFn(`https://api.notion.com/v1/pages/${sidId}`, {
    method: 'PATCH', headers: huvud,
    body: JSON.stringify({ properties: { [titelFalt]: { title: [{ text: { content: nyttNamn } }] } } }),
  })).json();
  if (svar.object === 'error') throw new Error(`Notion: ${svar.message}`);
  const las = svar.properties[titelFalt].title.map((t) => t.plain_text).join('');
  if (las !== nyttNamn) throw new Error(`Namnbytet gick inte igenom: raden heter "${las}".`);
  return las;
}

/** AOV och antal strumpprodukter per order ur Shopify. Mäter, gissar aldrig. */
export async function matAov(dagar = 30) {
  const { lasButik, skapaKlient } = await import('../sparning/butik.mjs');
  const butik = lasButik('matstrumpor');
  const k = await skapaKlient(butik);
  const fran = new Date(Date.now() - dagar * 86400000).toISOString().slice(0, 10);
  const q = `query($c:String){orders(first:250,after:$c,query:"created_at:>=${fran} financial_status:paid"){pageInfo{hasNextPage endCursor} nodes{totalPriceSet{shopMoney{amount}} lineItems(first:10){nodes{quantity title}}}}}`;
  let c = null, n = 0, tot = 0, produkter = 0;
  do {
    const r = await k.graphql(q, { c });
    for (const o of r.orders.nodes) {
      n++;
      tot += Number(o.totalPriceSet.shopMoney.amount);
      for (const li of o.lineItems.nodes) if (/strumpor/i.test(li.title)) produkter += li.quantity;
    }
    c = r.orders.pageInfo.hasNextPage ? r.orders.pageInfo.endCursor : null;
  } while (c);
  if (!n) throw new Error(`Noll betalda ordrar de senaste ${dagar} dagarna — AOV går inte att mäta, och ska då INTE skrivas.`);
  return { ordrar: n, dagar, aov_sek: Math.round((tot / n) * 100) / 100, produkter_per_order: Math.round((produkter / n) * 100) / 100 };
}

// --ekonomi --marknad <LAND>: break-even per marknad ur cogs.json (landad kostnad till
// leveranslandet) och marknadens pris (fasta USD-priser ur marknader/konfig.json, annars
// Shopifys omräkning av SEK-priset = SEK-priset i kronor). Kursen hämtas från ECB vid
// varje körning — inget tal bränns in. Saknas kostnaden för landet står det som orsak.
async function visaEkonomiMarknad(land) {
  const { lasCogs, landadKostnad, breakEvenForMarknad, blockFor } = await import('./cogs.mjs');
  const { hamtaKurser } = await import('../stonebite/kallor/valuta.mjs');
  const mk = JSON.parse(readFileSync(new URL('./marknader/konfig.json', import.meta.url), 'utf8'));
  const cogs = lasCogs();
  const L = String(land).toUpperCase();
  const marknad = mk.marknader.find((m) => m.lander.includes(L));
  if (!marknad && L !== 'SE') { console.log(`Landet ${L} finns inte i marknader/konfig.json.`); return; }
  const kurser = await hamtaKurser();
  if (kurser.status !== 'ok') { console.log(`Kursen gick inte att hämta (${kurser.orsak}) — break-even per marknad räknas inte utan kurs.`); return; }
  console.log(`Marknad ${marknad?.namn ?? 'Sverige'} · land ${L} · kurs ECB ${kurser.datum} (${Object.entries(kurser.sekPer).filter(([v]) => ['USD', 'EUR', 'NOK', 'DKK', 'GBP', 'AUD'].includes(v)).map(([v, k]) => `${v} ${k.toFixed(2)}`).join(', ')} kr)`);
  console.log(`Kostnadsblock: ${blockFor(cogs, L) ?? 'saknas'}`);
  const konfig = lasKonfig();
  const tullSek = L === 'SE' ? Number(konfig.ekonomi.tull_eur) * (kurser.sekPer.EUR ?? konfig.ekonomi.eur_sek) : 0;
  const rader = [
    ['sushi-strumpor', '5 - Par / One Size', 399], ['sushi-strumpor', '3 - Par / One Size', 369],
    ['donut-strumpor', 'One Size', 299], ['pizza-strumpor', 'One Size', 449], ['hamburger-strumpor', 'One Size', 299],
  ];
  for (const [handle, variant, sekPris] of rader) {
    const k = landadKostnad({ handle, variantTitel: variant, antal: 1, land: L }, kurser, cogs);
    const fast = marknad?.priser === 'fasta' ? (typeof marknad.fasta_priser[handle] === 'number' ? marknad.fasta_priser[handle] : marknad.fasta_priser[handle]?.[variant] ?? null) : null;
    const pris = fast ?? sekPris;
    const valuta = fast ? marknad.basvaluta : 'SEK';
    if (k.saknas) { console.log(`  ${handle} · ${variant}: pris ${pris} ${valuta}${fast ? '' : ' (omräknat av Shopify)'} — kostnad SAKNAS: ${k.saknas}`); continue; }
    const b = breakEvenForMarknad({ pris, valuta, kostnadSek: k.sek + tullSek, kurser });
    console.log(`  ${handle} · ${variant}: pris ${pris} ${valuta} = ${b.pris_sek} kr · landad kostnad ${b.kostnad_sek} kr (${k.kalla}${tullSek ? ` + tull ${tullSek.toFixed(2)}` : ''}) ⇒ break-even-ROAS ${b.break_even_roas ?? '—'} · break-even-CPA ${b.break_even_cpa_sek ?? '—'} kr`);
  }
  console.log('⚠️ En låda per order, utan moms (Axels besked 2026-09-21). Betalavgifter och returer ingår inte — break-even är i bästa fall.');
}

/** 3:2:2-läget i terminalen. */
export function visaStruktur(lage, skriv = (x) => console.log(x)) {
  const k = lage.kampanj ?? {};
  skriv(`Strukturen (3:2:2): ${k.namn ?? '?'} ${k.effective_status ?? ''} · ${k.dagsbudget_sek ?? '?'} kr/dag${k.cbo === false ? ' · ⚠️ INTE CBO' : ''}`);
  skriv(`  Champions: ${lage.champions ? `${lage.champions.namn} (${lage.champions.id})${lage.champions.levererar ? '' : ' — levererar INTE'}` : 'saknas'}`);
  skriv(`  Kapacitet: ${lage.kapacitet.text}${lage.kapacitet.per_adset_sek ? ` (3 × CPA = ${lage.kapacitet.per_adset_sek} kr per adset och dag)` : ''}`);
  skriv(`  Levererar: ${lage.antal_levererande} av taket ${lage.tak} (max ${lage.max_totalt} inkl. Champions) — ${lage.levererande.map((a) => `${a.namn} [${a.roll}]`).join(', ') || 'inga'}`);
  skriv(`  ${lage.skal}`);
  for (const v of lage.varningar) skriv(`  ⚠️ ${v}`);
}

/** Kön som koncept i terminalen: klara att bygga, väntande, stoppade. */
export function visaKo(plan, skriv = (x) => console.log(x)) {
  const etikett = { klar: '✅ BYGG', vantar_plats: '⏳ PLATS', vantar_hookar: '⏳ HOOKAR', vantar_copy: '⏳ COPY', vantar_struktur: '⛔ STRUKTUR', stopp: '⛔ STOPP' };
  for (const h of plan.hookrader_utan_traff ?? []) skriv(`  ⛔ --hookrad ${h} träffade ingen rad i kön`);
  if (!plan.koncept.length && !plan.stoppade.length) skriv('  (kön är tom)');
  for (const k of plan.koncept) {
    skriv(`  ${(etikett[k.status] ?? k.status).padEnd(11)} ${k.uppladdning ? `uppladdning → nytt adset ${k.adset_namn} (koncept ${(k.koncept_nycklar ?? []).join(', ')})` : `koncept ${k.nyckel}${k.sammanslagen ? ' (sammanslaget)' : ''}`} · ${k.annonser.length} annonser`);
    for (const a of k.annonser) skriv(`      ${a.namn}${a.fil_hook ? ` (fil H${a.fil_hook} på raden ${a.fran_rad})` : ''}${a.copy ? ` · copy ${a.copy.rubriker.length}+${a.copy.texter.length} (${a.copy_kalla === 'syskon' ? 'syskonets kort — eget saknas' : 'eget kort'}${a.copy_fil ? `, ${a.copy_fil}` : ''})` : ' · copy saknas'}${a.copy_anm?.length ? ` · ${a.copy_anm.join('; ')}` : ''}`);
    for (const x of k.skal) skriv(`      ↳ ${x}`);
    if (k.adset_spec_fel) skriv(`      ↳ ⛔ adsetets mall: ${k.adset_spec_fel}`);
  }
  for (const s of plan.stoppade) skriv(`  ${s.behover_namn ? '🏷️ ' : '⛔'} ${s.namn} — ${s.behover_namn ? 'odöpt rad med fil: titta på creativen och döp enligt steg 4 — en fil: --namn <vinkel> <format> 1 + --dop; tre hookfiler i raden: döp utan hook + --ko --hookrad <id>; tre odöpta rader med samma kropp: --namn … 1 --hookar 3, ett namn per rad' : s.skal.join(' · ')}`);
  const m = plan.summa ?? {};
  skriv(`Summa: ${m.klara ?? 0} nya adsets att bygga · väntar på plats ${m.vantar_plats ?? 0} · på copy ${m.vantar_copy ?? 0}${m.vantar_struktur ? ` · på strukturen ${m.vantar_struktur}` : ''} · stoppade koncept ${m.stopp ?? 0} · stoppade rader ${plan.stoppade.length}`);
}

function visaEkonomi(konfig) {
  const b = brytpunkter(konfig);
  console.log(`AOV ${b.aov_sek} kr · kostnad per order ${b.kostnad_per_order_sek} kr (${konfig.ekonomi.kostnad_per_order_sek} inköp + ${konfig.ekonomi.tull_eur} EUR tull × ${konfig.ekonomi.eur_sek})`);
  console.log(`  UTAN moms: täckningsbidrag ${b.utan_moms.tackningsbidrag} kr ⇒ break-even-ROAS ${b.utan_moms.break_even_roas} · break-even-CPA ${b.utan_moms.break_even_cpa_sek} kr`);
  console.log(`  MED moms:  täckningsbidrag ${b.med_moms.tackningsbidrag} kr ⇒ break-even-ROAS ${b.med_moms.break_even_roas} · break-even-CPA ${b.med_moms.break_even_cpa_sek} kr`);
  if (b.oppen_fraga) console.log('⚠️  moms_antagen är inte satt — en annons MELLAN linjerna får domen BEROR_PA_MOMS och rörs inte. Sätt ekonomi.moms_antagen i matstrumpor/konfig.json när Axel svarat.');
  else console.log(`Gällande linje: ${b.moms_antagen ? 'MED' : 'UTAN'} moms ⇒ break-even-ROAS ${b.gallande.break_even_roas}`);
  return b;
}

async function main() {
  const arg = process.argv.slice(2);
  const har = (f) => arg.includes(f);
  const varde = (f, d = null) => { const i = arg.indexOf(f); return i > -1 ? arg[i + 1] : d; };
  const konfig = lasKonfig();

  if (har('--ekonomi') && varde('--marknad')) { await visaEkonomiMarknad(varde('--marknad')); return; }
  if (har('--ekonomi')) { visaEkonomi(konfig); return; }

  if (har('--aov')) {
    const m = await matAov(Number(varde('--dagar', 30)));
    console.log(`${m.ordrar} betalda ordrar / ${m.dagar} dagar · AOV ${m.aov_sek} kr · ${m.produkter_per_order} strumpprodukter per order`);
    console.log(`Skriv in i konfig.json: "aov_sek": ${m.aov_sek}  (och notera datum + antal ordrar i aov_comment)`);
    return;
  }

  if (har('--namn')) {
    const i = arg.indexOf('--namn');
    const vinkel = arg[i + 1], format = arg[i + 2];
    const antal = Number(arg[i + 3] ?? 1);
    // Fyra källor, unionen räknas (namn.mjs samlaKandaNamn — skälet står där):
    // loggen, ögonblicksbilden på disk, kontot ur senaste avläsningen, hubben live.
    const kallor = { logg: lasLogg().filter((r) => r.kod === 'UPPLADDAD').map((r) => r.annons), fil: [], konto: [], hubb: [] };
    const filen = join(ROT, 'kanda-namn.json');
    if (existsSync(filen)) kallor.fil = JSON.parse(readFileSync(filen, 'utf8'));
    const avlasning = senasteAvlasning();
    if (avlasning) kallor.konto = (JSON.parse(readFileSync(avlasning.fil, 'utf8')).annonser ?? []).map((a) => a.namn);
    let hubbFel = null;
    try { kallor.hubb = await hubbNamn(konfig); } catch (e) { hubbFel = e.message; }
    const kanda = samlaKandaNamn(kallor);
    console.error(`Kända namn: ${kanda.length} (logg ${kallor.logg.length} · fil ${kallor.fil.length} · konto ${kallor.konto.length}${avlasning ? ` ur ${avlasning.datum}` : ' — ingen avläsning på disk'} · hubb ${hubbFel ? `LÄSTES INTE: ${hubbFel}` : kallor.hubb.length}) · högsta nummer ${nastaNummer_flera(kanda, 1)[0] - 1}`);
    if (hubbFel || !avlasning) console.error('⚠️  En källa saknas — numret kan krocka med en rad som bara finns där. Kör --hamta och sätt NOTION_TOKEN innan namnet används.');
    if (!kanda.length) console.error('⚠️  Inga kända namn alls — kör /matstrumpor som läser kontot + hubben först, annars kan numret krocka.');
    if (!hubbFel && avlasning) writeFileSync(filen, `${JSON.stringify(kanda, null, 1)}\n`); // ögonblicksbilden växer, krymper aldrig
    // Kedjan (Evolve ITER#N_BATCH#ORIG): --iter <förälder> = iteration på
    // föräldern (löpnummer, alias eller fullt namn), numret räknat ur namnen +
    // BRIEF-raderna; --im = imitation; --hookar <k> = k hookvarianter per nummer.
    const foralder = varde('--iter');
    const imitation = har('--im');
    const hookar = Number(varde('--hookar', 0));
    let iteration = foralder ? nastaIterationPa(foralder, { kandaNamn: kanda, briefrader: lasLogg().filter((r) => r.kod === 'BRIEF') }, konfig) : null;
    for (const n of nastaNummer_flera(kanda, antal)) {
      const bas = { vinkel, format, nummer: n, imitation, ...(foralder ? { iteration, foralder } : {}) };
      if (hookar > 0) for (let h = 1; h <= hookar; h++) console.log(bygg({ ...bas, hook: h }, konfig));
      else console.log(bygg(bas, konfig));
      if (foralder) iteration++;
    }
    return;
  }

  if (har('--dop')) {
    const i = arg.indexOf('--dop');
    const sida = arg[i + 1];
    const nytt = arg[i + 2];
    if (!sida || !nytt) throw new Error('--dop vill ha <notion-sid-id> <nytt namn>.');
    const g = (await import('./namn.mjs')).granska(nytt, [], konfig);
    if (!g.ok) throw new Error(`Namnet duger inte: ${g.fel.join(' · ')}`);
    await dopOm(sida, nytt);
    const t = tolka(nytt);
    console.log(`Raden heter nu ${nytt} ⇒ koncept ${String(t.nummer).padStart(3, '0')} — går upp i nästa uppladdnings adset (ett nytt adset per uppladdning, med det som är klart då)`);
    return;
  }

  if (har('--struktur')) {
    const { säkerställProxy } = await import('../tools/meta-lib.mjs');
    säkerställProxy();
    const { hamtaStruktur } = await import('./meta.mjs');
    const idag = varde('--idag', idagSE());
    const st = await hamtaStruktur(konfig, { idag });
    const lage = strukturLage(st, konfig, { breakEvenCpa: brytpunkter(konfig).gallande?.break_even_cpa_sek ?? null });
    mkdirSync(UTMAPP, { recursive: true });
    writeFileSync(join(UTMAPP, `struktur-${idag}.json`), `${JSON.stringify({ ...st, lage }, null, 2)}\n`);
    if (har('--json')) { console.log(JSON.stringify({ ...st, lage }, null, 2)); return; }
    visaStruktur(lage);
    return;
  }

  if (har('--ko')) {
    const idag = varde('--idag', idagSE());
    // Strukturen ur Meta först (token, läs-bart): utan den laddas inget upp.
    let lage = null, mall = null, strukturFel = null;
    if (!har('--utan-struktur')) {
      // Metas per-IP-tak utanför agentproxyn (tools/meta-lib.mjs) — samma som --hamta.
      const { säkerställProxy } = await import('../tools/meta-lib.mjs');
      säkerställProxy();
      try {
        const { hamtaStruktur } = await import('./meta.mjs');
        const st = await hamtaStruktur(konfig, { idag });
        lage = strukturLage(st, konfig, { breakEvenCpa: brytpunkter(konfig).gallande?.break_even_cpa_sek ?? null });
        mall = st.champions_mall;
      } catch (e) { strukturFel = e.message; }
    }
    const grupper = arg.flatMap((x, i) => (x === '--grupp' ? [String(arg[i + 1] ?? '').split(',').map((n) => n.trim()).filter(Boolean)] : [])).filter((g) => g.length > 1);
    const hookrader = new Set(arg.flatMap((x, i) => (x === '--hookrad' ? [arg[i + 1]] : [])).filter(Boolean));
    const { rader, plan } = await hamtaKo(konfig, { logg: lasLogg(), lage, grupper, hookrader, datum: idag });
    // Specarna till Adsmanager-MCP:n för varje koncept som får byggas.
    for (const k of plan.koncept) {
      if (k.status !== 'klar' || !mall) continue;
      try { k.adset_spec = adsetSpec({ namn: k.adset_namn, mall, kampanjId: konfig.meta.kampanj.id, kontoId: konfig.meta.ad_account_id }); } catch (e) { k.adset_spec_fel = e.message; }
    }
    const ut = { datum: idag, hub: konfig.notion.hub_namn, rader: rader.length, struktur_fel: strukturFel, ...plan };
    if (plan.hookrader_utan_traff?.length) process.exitCode = 1;
    mkdirSync(UTMAPP, { recursive: true });
    writeFileSync(join(UTMAPP, `ko-${idag}.json`), `${JSON.stringify(ut, null, 2)}\n`);
    if (har('--json')) { console.log(JSON.stringify(ut, null, 2)); return; }
    console.log(`Hubben "${konfig.notion.hub_namn}": ${rader.length} rader i ${(konfig.notion.ko_statusar ?? [konfig.notion.ko_status]).join(' / ')}`);
    if (strukturFel) console.log(`⛔ Strukturen lästes inte (${strukturFel}) — inget laddas upp förrän --struktur fungerar.`);
    for (const h of plan.hookrader_utan_traff ?? []) console.log(`⛔ --hookrad ${h} träffade ingen rad i kön — kolla id:t (sid-id:t eller radens länk).`);
    if (lage) visaStruktur(lage);
    console.log('');
    visaKo(plan);
    console.log(`Planen: ${join(UTMAPP, `ko-${idag}.json`)}`);
    return;
  }

  if (har('--creative')) {
    const namn = varde('--creative');
    const idag = varde('--idag', idagSE());
    const fil = join(UTMAPP, `ko-${idag}.json`);
    if (!existsSync(fil)) throw new Error(`Ingen plan i dag (${fil}) — kör --ko först.`);
    const plan = JSON.parse(readFileSync(fil, 'utf8'));
    const k = plan.koncept.find((x) => x.annonser.some((a) => a.namn === namn));
    if (!k) throw new Error(`${namn} finns inte i dagens plan.`);
    if (k.status !== 'klar') throw new Error(`Konceptet ${k.nyckel} är ${k.status}: ${k.skal.join(' · ')} — ingen creative.`);
    const a = k.annonser.find((x) => x.namn === namn);
    const spec = creativeSpec({ namn, mediatyp: k.mediatyp, video_id: varde('--video'), thumbnail_url: varde('--thumb'), image_hash: varde('--bild'), copy: a.copy, lank: a.landning ?? konfig.meta.landningssida, sida_id: konfig.meta.sida_id, instagram_id: konfig.meta.instagram_id });
    console.log(JSON.stringify(spec));
    return;
  }

  if (har('--adset-skapad')) {
    const i = arg.indexOf('--adset-skapad');
    const [adsetId, namn] = [arg[i + 1], arg[i + 2]];
    if (!/^\d{10,}$/.test(String(adsetId ?? '')) || !namn) throw new Error('--adset-skapad vill ha <adset-id (siffror)> <adset-namn>.');
    const t = tolkaAdsetNamn(namn);
    if (!t) throw new Error(`"${namn}" är inget 3:2:2-adsetnamn (${konfig.meta.struktur?.adsetnamn_mall}).`);
    if (String(adsetId) === String(konfig.meta.struktur?.champions?.id)) throw new Error('Det är Champions-adsetet — det skapas aldrig av uppladdaren.');
    if (lasLogg().some((r) => r.kod === 'ADSET_SKAPAD' && r.adset_id === String(adsetId))) { console.log(`ADSET_SKAPAD för ${adsetId} finns redan i loggen — skriver inte en till.`); return; }
    const kass = new Set(lasLogg().filter((r) => r.kod === 'ADSET_KASSERAT').map((r) => String(r.adset_id)));
    const sammaNamn = lasLogg().find((r) => r.kod === 'ADSET_SKAPAD' && r.adset_namn === namn && !kass.has(String(r.adset_id)));
    if (sammaNamn) throw new Error(`Testadsetet ${namn} finns redan (${sammaNamn.adset_id}, ${sammaNamn.datum}) — ett koncept byggs aldrig två gånger. Är det nya adsetet en dubblett: ladda inte upp i det, rapportera det.`);
    // Uppladdningens annonser ur dagens plan — de hålls om bygget aldrig
    // publiceras, så att de inte byggs en gång till i ett nytt adset.
    const dag = varde('--idag', idagSE());
    const planFil = join(UTMAPP, `ko-${dag}.json`);
    const plan = existsSync(planFil) ? JSON.parse(readFileSync(planFil, 'utf8')) : null;
    const batch = plan?.koncept?.find((k) => k.adset_namn === namn) ?? null;
    if (t.uppladdning && !batch) throw new Error(`${namn} finns inte i dagens plan (${planFil}) — kör --ko först och använd planens adsetnamn.`);
    skrivRad({ kod: 'ADSET_SKAPAD', datum: dag, adset_id: String(adsetId), adset_namn: namn, koncept: varde('--koncept', t.uppladdning ?? String(t.nummer).padStart(3, '0')), ...(batch ? { annonser: batch.annonser.map((a) => a.namn), koncept_nycklar: batch.koncept_nycklar ?? null } : {}), vinkel: t.vinkel, mediatyp: t.mediatyp, struktur: '3:2:2', kampanj_id: konfig.meta.kampanj.id });
    console.log(`ADSET_SKAPAD loggad: ${namn} (${adsetId})`);
    return;
  }

  if (har('--adset-kasserat')) {
    // 5b/5c-avbrottet: adsetet skapades men inget publicerades, och utkastet
    // kasseras. Raden upphäver ADSET_SKAPAD så konceptet kan byggas igen.
    const adsetId = varde('--adset-kasserat');
    const logg = lasLogg();
    const skapad = logg.find((r) => r.kod === 'ADSET_SKAPAD' && r.adset_id === String(adsetId ?? ''));
    if (!skapad) throw new Error(`--adset-kasserat: ${adsetId} är inte loggat som ADSET_SKAPAD.`);
    if (logg.some((r) => r.kod === 'UPPLADDAD' && String(r.adset_id ?? '') === String(adsetId))) throw new Error(`${adsetId} har uppladdade annonser — det är live och kasseras aldrig härifrån.`);
    if (logg.some((r) => r.kod === 'ADSET_KASSERAT' && r.adset_id === String(adsetId))) { console.log(`${adsetId} är redan kvitterat som kasserat.`); return; }
    skrivRad({ kod: 'ADSET_KASSERAT', datum: varde('--idag', idagSE()), adset_id: String(adsetId), adset_namn: skapad.adset_namn, koncept: skapad.koncept, orsak: varde('--orsak', 'bygget avbröts före publicering') });
    console.log(`ADSET_KASSERAT loggad: ${skapad.adset_namn} (${adsetId}) — konceptet kan byggas igen.`);
    return;
  }

  if (har('--kontroll')) {
    const adsetId = varde('--kontroll');
    if (!/^\d{10,}$/.test(String(adsetId ?? ''))) throw new Error('--kontroll vill ha <adset-id>.');
    const { säkerställProxy } = await import('../tools/meta-lib.mjs');
    säkerställProxy();
    const { hamtaAdsetKontroll } = await import('./meta.mjs');
    const las = await hamtaAdsetKontroll(konfig, adsetId);
    const fil = join(UTMAPP, `ko-${varde('--idag', idagSE())}.json`);
    const plan = existsSync(fil) ? JSON.parse(readFileSync(fil, 'utf8')) : null;
    const forvantat = plan?.koncept?.find((k) => k.adset_namn === las.adset.name) ?? null;
    const k = kontrolleraAdset(las, konfig, { forvantat });
    console.log(`${k.ok ? '✅' : '❌'} ${las.adset.name} (${adsetId}) — ${las.adset.effective_status}${forvantat ? '' : ' · ⚠️ ingen plan i dag att jämföra texterna mot (bara antal, sida, länk och mediatyp kontrollerade)'}`);
    for (const r of k.rader) console.log(`  ✓ ${r}`);
    for (const f of k.fel) console.log(`  ✗ ${f}`);
    if (!k.ok) process.exitCode = 1;
    return;
  }

  if (har('--kordag')) {
    const k = arKordag(lasLogg(), varde('--idag', idagSE()), konfig.kadens.rond_var_n_dag);
    console.log(`${k.kor ? '✅ KÖRDAG' : '⏸ INGEN ROND I DAG'} — ${k.skal}`);
    process.exitCode = k.kor ? 0 : 2;
    return;
  }

  if (har('--rond-klar')) {
    const datum = varde('--idag', idagSE());
    if (lasLogg().some((r) => r.kod === 'ROND_KLAR' && r.datum === datum)) { console.log(`ROND_KLAR ${datum} finns redan i loggen — skriver inte en till.`); return; }
    skrivRad({ kod: 'ROND_KLAR', datum });
    console.log(`ROND_KLAR ${datum} loggad. Nästa rond tidigast ${plusDagar(datum, konfig.kadens.rond_var_n_dag)} (var ${konfig.kadens.rond_var_n_dag}:e dag).`);
    return;
  }

  if (har('--hamta')) {
    // Metas per-IP-tak utanför agentproxyn slår nästan direkt — starta om med
    // proxyn först (tools/meta-lib.mjs). Funktionen återvänder aldrig i så fall.
    const { säkerställProxy } = await import('../tools/meta-lib.mjs');
    säkerställProxy();
    const { hamtaAvlasning, sammanfattning, utlandskampanjer } = await import('./meta.mjs');
    const { laggTillMatningar } = await import('./arkiv.mjs');
    const idag = varde('--idag', idagSE());
    // Sverige + varje utlandskampanj ur annonser/lage.json (sedan 2026-10-01 —
    // före det läste ronden bara den svenska kampanjen och utlandet fick aldrig
    // en etikett). --marknad <KOD> läser en, --bara-se bara Sverige.
    const lage = JSON.parse(readFileSync(join(ROT, 'marknader', 'annonser', 'lage.json'), 'utf8'));
    const se = { id: konfig.meta.kampanj.id, namn: konfig.meta.kampanj.namn, marknad: 'SE' };
    let mal = [se, ...(har('--bara-se') ? [] : utlandskampanjer(lage))];
    if (varde('--marknad')) mal = mal.filter((m) => m.marknad === String(varde('--marknad')).toUpperCase());
    if (!mal.length) throw new Error(`Ingen kampanj för marknaden ${varde('--marknad')} i lage.json.`);
    console.error(`Läser ${konfig.meta.ad_account_namn} (${konfig.meta.ad_account_id}) via META_ACCESS_TOKEN — ${mal.length} kampanjer: ${mal.map((m) => m.marknad).join(', ')} …`);
    const fel = [];
    for (const m of mal) {
      const ut = m.marknad === 'SE' ? varde('--ut', join(UTMAPP, `avlasning-${idag}.json`)) : join(UTMAPP, `avlasning-${idag}-${m.marknad}.json`);
      try {
        const jobb = await hamtaAvlasning(konfig, { idag, kampanjKalla: m });
        mkdirSync(dirname(ut), { recursive: true });
        writeFileSync(ut, `${JSON.stringify(jobb, null, 2)}\n`);
        const n = laggTillMatningar(jobb);
        console.log(sammanfattning(jobb));
        console.log(`  Jobbfil: ${ut} · ${n} nya rader i arkivets mätningar`);
      } catch (e) {
        fel.push(`${m.marknad}: ${e.message}`);
        console.log(`  ⚠️ [${m.marknad}] gick inte att läsa: ${e.message}`);
      }
    }
    if (fel.length) console.log(`⚠️ ${fel.length} av ${mal.length} kampanjer lästes inte — skriv det i rapporten.`);
    console.log(`Nästa: node matstrumpor/kor.mjs --dom-alla --json --logga  ·  node matstrumpor/kor.mjs --arkiv`);
    if (fel.length === mal.length) process.exitCode = 1;
    return;
  }

  if (har('--dom') || har('--dom-alla')) {
    let filer;
    if (har('--dom-alla')) {
      const sista = senasteAvlasning();
      if (!sista) throw new Error('Ingen avläsning på disk — kör --hamta först.');
      filer = readdirSync(UTMAPP).filter((f) => f.startsWith(`avlasning-${sista.datum}`) && f.endsWith('.json')).sort().map((f) => join(UTMAPP, f));
    } else {
      filer = [varde('--dom')];
    }
    const b = visaEkonomi(konfig);
    // --json <fil> gäller bara en enskild --dom; --dom-alla skriver dom-<datum>[-<KOD>].json.
    const efter = arg[arg.indexOf('--json') + 1];
    const json = !har('--json') ? false : (!har('--dom-alla') && efter && !efter.startsWith('--') ? efter : null);
    for (const fil of filer) {
      const jobb = JSON.parse(readFileSync(fil, 'utf8'));
      // Koncept som väntar på en testplats (3:2:2-domens "får stå om inget väntar"):
      // --ko-vantar <n> för hand, annars dagens --ko-fil, annars okänt.
      const koVantar = varde('--ko-vantar') !== null ? Number(varde('--ko-vantar')) : koVantarIdag(jobb.datum ?? idagSE());
      korDom(jobb, konfig, b, { json, logga: har('--logga'), koVantar });
    }
    return;
  }

  if (har('--arkiv')) {
    const { byggArkiv, arkivMarkdown, lasMatningar, lasTaggar, ARKIV_JSON, ARKIV_MD } = await import('./arkiv.mjs');
    const logg = lasLogg();
    const omdopt = new Map(logg.filter((r) => r.kod === 'OMDOPT').map((o) => [o.fran, o.till]));
    const taggar = new Map();
    for (const br of logg.filter((r) => r.kod === 'BRIEF' && r.brief)) taggar.set(omdopt.get(br.annons) ?? br.annons, await lasTaggar(br.brief));
    const a = byggArkiv({ konfig, logg, matningar: lasMatningar(), taggar, idag: varde('--idag', idagSE()) });
    mkdirSync(dirname(ARKIV_JSON), { recursive: true });
    writeFileSync(ARKIV_JSON, `${JSON.stringify(a, null, 1)}\n`);
    writeFileSync(ARKIV_MD, arkivMarkdown(a));
    console.log(`Arkivet: ${a.annonser_totalt} annonser, ${a.etiketterade} med etikett · hit rate ${a.hit_rate}`);
    console.log(`  koncept: ${a.koncept.map((k) => `${k.koncept} ${k.beslut} (${k.med_utfall}/${k.briefer} med utfall)`).join(' · ') || 'inga'}`);
    console.log(`  kedjor: ${a.kedjor.map((k) => `${k.foralder} → ${k.barn.length}`).join(' · ') || 'inga'}`);
    console.log(`  skrivet: ${ARKIV_JSON} + ${ARKIV_MD}`);
    return;
  }

  if (har('--uppladdad')) {
    // UPPLADDAD skrivs av koden, inte med node -e (Matstrumpors uppladdning
    // 25/9 skrev inga rader alls — hål i loggen som arkivet inte kan läsa).
    // Sedan 3:2:2 (2026-10-02) är adsetet ett ID: ett testadset som loggats med
    // --adset-skapad. De gamla hinknycklarna (video, bild …) tar inte emot något.
    const i = arg.indexOf('--uppladdad');
    const [annons, annonsId, adset] = [arg[i + 1], arg[i + 2], arg[i + 3]];
    if (!annons || !/^\d{10,}$/.test(String(annonsId ?? '')) || !adset || adset.startsWith('--')) throw new Error('--uppladdad vill ha <annonsnamn> <annons-id (siffror)> <adset-id>.');
    const logg = lasLogg();
    let adsetRad = null;
    if (/^\d{10,}$/.test(adset)) {
      if (String(adset) === String(konfig.meta.struktur?.champions?.id)) throw new Error('Champions tar aldrig emot en ny annons — vinnare flyttas dit av Axel.');
      adsetRad = logg.find((r) => r.kod === 'ADSET_SKAPAD' && r.adset_id === String(adset));
      if (!adsetRad) throw new Error(`Adset ${adset} är inte loggat som testadset — kör --adset-skapad först (uppladdaren laddar bara upp i adsets den själv byggt).`);
    } else if (konfig.meta.adsets[adset]) {
      if (!har('--gammal-hink')) throw new Error(`"${adset}" är en gammal hink — sedan 3:2:2 (2026-10-02) tar den aldrig emot en ny annons. (--gammal-hink loggar en uppladdning gjord FÖRE bytet.)`);
    } else {
      throw new Error(`Adsetet "${adset}" är varken ett adset-id eller en gammal hink.`);
    }
    if (logg.some((r) => r.kod === 'UPPLADDAD' && r.annons_id === String(annonsId))) { console.log(`UPPLADDAD för ${annonsId} finns redan i loggen — skriver inte en till.`); return; }
    const t = tolka(annons);
    const r3 = strukturRegler(konfig);
    if (adsetRad) {
      const syskon = logg.filter((r) => r.kod === 'UPPLADDAD' && r.adset_id === String(adset));
      const ryms = adsetRad.annonser?.length ?? r3.annonser_per_adset;
      if (adsetRad.annonser && !adsetRad.annonser.some((n) => n.toLowerCase() === annons.toLowerCase())) throw new Error(`${annons} hör inte till uppladdningen ${adsetRad.adset_namn} (${adsetRad.annonser.join(', ')}).`);
      if (syskon.length >= ryms) throw new Error(`Adset ${adsetRad.adset_namn} bär redan ${syskon.length} annonser — uppladdningen hade ${ryms}.`);
      const ta = tolkaAdsetNamn(adsetRad.adset_namn);
      const typ = t ? (konfig.namn.video_format.includes(t.format) ? 'video' : konfig.namn.bild_format.includes(t.format) ? 'bild' : 'okand') : 'okand';
      if (ta && typ !== ta.mediatyp) throw new Error(`${annons} är ${typ}, adsetet ${adsetRad.adset_namn} är ${ta.mediatyp} — bild och video blandas aldrig.`);
    }
    const rad = { kod: 'UPPLADDAD', datum: varde('--idag', idagSE()), annons, annons_id: String(annonsId), adset: adsetRad ? adsetRad.adset_namn : adset, ...(adsetRad ? { adset_id: adsetRad.adset_id, koncept: varde('--koncept', adsetRad.koncept), struktur: '3:2:2', copy: `${r3.rubriker_per_annons} rubriker + ${r3.texter_per_annons} texter` } : {}), typ: t?.typ ?? null, foralder: t?.foralder ?? null, ...(varde('--notion') ? { notion: varde('--notion') } : {}), ...(varde('--kalla') ? { kalla: varde('--kalla') } : {}), ...(varde('--kreator') ? { kreator: varde('--kreator') } : {}), ...(varde('--landning') ? { landning: varde('--landning') } : {}) };
    skrivRad(rad);
    console.log(`UPPLADDAD loggad: ${annons} (${annonsId}) → ${rad.adset}`);
    return;
  }

  if (har('--status')) {
    const logg = lasLogg();
    const lardomar = logg.filter((r) => r.kod === 'LARDOM');
    const briefer = logg.filter((r) => r.kod === 'BRIEF');
    const sedanRond = logg.findLastIndex?.((r) => r.kod === 'ROND_KLAR') ?? -1;
    const nya = sedanRond > -1 ? logg.slice(sedanRond).filter((r) => r.kod === 'LARDOM').length : lardomar.length;
    const tak = brieftak({ lardomarSedanForraRonden: nya, kadensAntal: konfig.kadens.briefer_per_rond });
    const etikettrader = logg.filter((r) => r.kod === 'ETIKETT');
    const levande = levandeBreakthrough(etikettrader, new Date().toISOString().slice(0, 10));
    const galler = [...gallandeEtiketter(etikettrader).values()];
    // Brieftaket räknar SKRIVNA lärdomstexter (unika id), inte loggrader —
    // 2026-09-30 gav en enda text om ett svultet adset elva rader och tak 11.
    const unikaNya = new Set((sedanRond > -1 ? logg.slice(sedanRond) : logg).filter((r) => r.kod === 'LARDOM').map((r) => r.id ?? r.annons)).size;
    const takUnika = brieftak({ lardomarSedanForraRonden: unikaNya, kadensAntal: konfig.kadens.briefer_per_rond });
    const omdopt = logg.filter((r) => r.kod === 'OMDOPT');
    console.log(`Lärdomar totalt: ${lardomar.length} rader · sedan förra ronden: ${nya} rader, ${unikaNya} skrivna texter`);
    console.log(`Briefer totalt: ${briefer.length} · på lärdom: ${briefer.filter((b) => b.lardom).length}`);
    console.log(`Brieftak: ${takUnika.antal} — ${takUnika.orsak}${tak.antal !== takUnika.antal ? ` (räknat på loggrader hade det blivit ${tak.antal})` : ''}`);
    // 3:2:2: taket räknas i KONCEPT (tre hookar = tre briefer = ett testadset).
    const sr = strukturRegler(konfig);
    const vantar = vantandeKoncept(logg, { sedan: sr.sedan, tolka });
    const kt = koncepttak({ lardomarSedanForraRonden: unikaNya, kadensBriefer: konfig.kadens.briefer_per_rond, hookarPerKoncept: konfig.kadens.hookar_per_koncept ?? sr.annonser_per_adset, vantandeKoncept: vantar.length, testplatser: sr.max_adsets_totalt - 1 });
    console.log(`Koncepttak (3:2:2): ${kt.orsak}${vantar.length ? ` Briefade, inte uppladdade: ${vantar.map((n) => String(n).padStart(3, '0')).join(', ')}.` : ''}`);
    console.log(`Mix: ${JSON.stringify(mix(kt.antal, levande.length > 0))} (räknat i koncept)`);
    console.log(`Hit rate (breakthrough + spend winner): ${hitRate(galler).text}`);
    for (const k of [...new Set(briefer.map((x) => x.koncept).filter(Boolean))]) {
      const rader = briefer.filter((x) => x.koncept === k);
      const s = konceptStatus(k, rader, etikettrader, { kalla: rader[0]?.kalla ?? null, omdopt });
      console.log(`  koncept ${k}: ${s.beslut} — ${s.motivering}`);
    }
    return;
  }

  // --kolla (standard)
  console.log(`Matstrumpor — ${konfig.butik}`);
  console.log(`Konto:    ${konfig.meta.ad_account_namn} (${konfig.meta.ad_account_id})`);
  console.log(`Kampanj:  ${konfig.meta.kampanj.namn} (${konfig.meta.kampanj.id}) · ${konfig.meta.kampanj.typ} ${konfig.meta.kampanj.dagsbudget_sek} kr/dag`);
  const sr = strukturRegler(konfig);
  console.log(`Struktur: 3:2:2 sedan ${sr.sedan ?? '?'} — Champions ${sr.champions ? `${sr.champions.namn} (${sr.champions.id})` : 'INTE UTPEKAT'} + högst ${sr.max_adsets_totalt - 1} testadsets, ${sr.annonser_per_adset} annonser × ${sr.rubriker_per_annons} rubriker × ${sr.texter_per_annons} texter, test ${sr.test_dagar} dagar (max ${sr.test_max_dagar}). Läget live: --struktur`);
  for (const [k, v] of Object.entries(konfig.meta.adsets)) console.log(`  gammal hink ${k.padEnd(10)} ${v.namn}${v.id ? ` (${v.id})` : ''} — tar inte emot nya annonser`);
  console.log(`Hub:      ${konfig.notion.hub_namn} (${konfig.notion.hub_id})`);
  console.log('');
  const nycklar = { NOTION_TOKEN: 'Notion-kön + briefraderna (tools/notion-brief.mjs)', META_ACCESS_TOKEN: 'Meta, läsning (åtkomst given 2026-09-22; uppladdning går ännu via MCP)', SHOPIFY_CLIENT_ID_1r46tp_qx: 'AOV ur Shopify', DISCORD_BOT_TOKEN: 'rapporten' };
  for (const [n, vad] of Object.entries(nycklar)) console.log(`${process.env[n] ? '✅' : '❌'} ${n.padEnd(30)} ${vad}`);
  console.log('');
  visaEkonomi(konfig);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => { console.error(`FEL: ${e.message}`); process.exit(1); });
}

export { brytpunkter, rangordna, dom, etikettera, planera, adsetNyckel, tolka, skelett };
