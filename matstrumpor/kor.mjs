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
//   node matstrumpor/kor.mjs --ko [--json]      Notion "To be Reviewed" → uppladdningsplan
//   node matstrumpor/kor.mjs --namn <vinkel> <format> [antal]   nästa lediga namn
//   node matstrumpor/kor.mjs --kordag [--idag YYYY-MM-DD]   är det rond i dag? exit 0 ja, 2 nej
//   node matstrumpor/kor.mjs --hamta [--ut <fil.json>]      avläsningen ur Meta (token) → jobbfil
//   node matstrumpor/kor.mjs --dom <fil.json> [--json]      döm annonser ur en avläsning
//   node matstrumpor/kor.mjs --status           lärdomar, briefer, brieftak, mix
//   node matstrumpor/kor.mjs --rond-klar        logga ROND_KLAR (sist i ronden)

import { readFileSync, writeFileSync, existsSync, appendFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { brytpunkter, rangordna, dom } from './ekonomi.mjs';
import { etikettera, formateraFrekvens, levandeBreakthrough, dagarMellan, ETIKETT } from './etikett.mjs';
import { brieftak, mix, skelett } from './lardom.mjs';
import { nastaNummer_flera, bygg, tolka, adsetNyckel, samlaKandaNamn } from './namn.mjs';
import { hamtaKo, planera, hubbNamn } from './kon.mjs';

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
    for (const n of nastaNummer_flera(kanda, antal)) console.log(bygg({ vinkel, format, nummer: n }, konfig));
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
    console.log(`Raden heter nu ${nytt} ⇒ adset ${konfig.meta.adsets[adsetNyckel(nytt, konfig)].namn}`);
    return;
  }

  if (har('--ko')) {
    const { rader, plan } = await hamtaKo(konfig);
    if (har('--json')) { console.log(JSON.stringify({ rader: rader.length, ...plan }, null, 2)); return; }
    console.log(`Hubben "${konfig.notion.hub_namn}": ${rader.length} rader i ${konfig.notion.ko_status}`);
    for (const [nyckel, namn] of Object.entries(plan.per_adset)) {
      console.log(`  → ${konfig.meta.adsets[nyckel].namn}${konfig.meta.adsets[nyckel].id ? '' : '  (MÅSTE SKAPAS)'}: ${namn.length} st`);
      for (const n of namn) console.log(`      ${n}`);
    }
    for (const s of plan.stoppade) console.log(`  ${s.behover_namn ? '🏷️ ' : '⛔'} ${s.namn} — ${s.behover_namn ? 'odöpt rad med fil: titta på creativen, välj vinkel + format, döp den (--namn), kör om' : s.skal.join(' · ')}`);
    if (!rader.length) console.log('  (kön är tom)');
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
    const { hamtaAvlasning, sammanfattning } = await import('./meta.mjs');
    const idag = varde('--idag', idagSE());
    const ut = varde('--ut', join(UTMAPP, `avlasning-${idag}.json`));
    console.error(`Läser ${konfig.meta.ad_account_namn} (${konfig.meta.ad_account_id}) via META_ACCESS_TOKEN …`);
    const jobb = await hamtaAvlasning(konfig, { idag });
    mkdirSync(dirname(ut), { recursive: true });
    writeFileSync(ut, `${JSON.stringify(jobb, null, 2)}\n`);
    console.log(sammanfattning(jobb));
    console.log(`Jobbfil: ${ut}  →  node matstrumpor/kor.mjs --dom ${ut}`);
    return;
  }

  if (har('--dom')) {
    const jobb = JSON.parse(readFileSync(varde('--dom'), 'utf8'));
    if (jobb.konto && String(jobb.konto) !== String(konfig.meta.ad_account_id)) throw new Error(`Jobbfilen är läst ur konto ${jobb.konto}, konfigen säger ${konfig.meta.ad_account_id} — fel konto, dömer inget.`);
    const b = visaEkonomi(konfig);
    const be = b.gallande?.break_even_roas ?? null;
    console.log('');
    const rank = rangordna(jobb.annonser ?? [], b, konfig.grindar);
    console.log(`Vinstbidrag, ${jobb.kampanj?.fonster ?? '14 dagar'} (${rank.rader.length} bedömbara, ${rank.for_tidigt.length} för tidigt):`);
    for (const r of rank.rader) {
      console.log(`  ${(r.vinstbidrag_sek ?? 0).toFixed(0).padStart(7)} kr  ${r.namn}  CPA ${r.cpa_sek ?? '—'} · ${r.dom}${r.benchmark ? (r.skydd ? '  ★ BENCHMARK — dödas aldrig' : '  ★ RIKTMÄRKE (ingen går plus — inte skyddad)') : ''}`);
    }
    if (rank.for_tidigt.length) console.log(`  För tidigt (${rank.for_tidigt.length} under grinden): ${rank.for_tidigt.slice(0, 8).join(', ')}${rank.for_tidigt.length > 8 ? ` … (alla i --json)` : ''}`);

    // Etiketten sätts på annonsens EGNA första vecka (etikett.mjs) — den ligger
    // i `forsta_vecka` när jobbfilen kommer ur --hamta. En handskriven jobbfil
    // utan det fältet etiketteras som förut, på de tal som står i raden.
    // En etikett skrivs EN gång: annonser som redan har en ETIKETT-rad i loggen
    // visas med den, så ingen rond etiketterar om.
    const loggade = new Map(lasLogg().filter((r) => r.kod === 'ETIKETT' && r.annons).map((r) => [r.annons, r]));
    const unga = [];
    const etiketter = [];
    for (const a of jobb.annonser ?? []) {
      const fv = a.forsta_vecka;
      if (fv && fv.komplett === false) { unga.push({ namn: a.namn, d0: a.d0, until: fv.until, dagar: fv.dagar_med_data }); continue; }
      const e = fv
        ? etikettera({ namn: a.namn, spend_sek: fv.spend_sek, kop: fv.kop, roas: fv.roas, d0: a.d0 }, { spend_sek: fv.kampanj_spend_sek, roas: fv.kampanj_roas, budget_d0: fv.budget_d0, budget_d7: fv.budget_d7 }, be, konfig.grindar)
        : etikettera(a, jobb.kampanj ?? {}, be, konfig.grindar);
      const tidigare = loggade.get(a.namn) ?? null;
      etiketter.push({ ...e, d0: a.d0 ?? null, fonster: fv ? `${fv.since}..${fv.until}` : (jobb.kampanj?.fonster ?? 'okänt'), aktiv: a.effective_status ? a.effective_status === 'ACTIVE' : undefined, hook_rate: fv?.hook_rate ?? a.hook_rate ?? null, hold_rate: fv?.hold_rate ?? a.hold_rate ?? null, konv_lpv: a.konv_lpv ?? null, redan_loggad: tidigare ? { etikett: tidigare.etikett, datum: tidigare.datum } : null });
    }
    const nya = etiketter.filter((e) => !e.redan_loggad);
    console.log('');
    console.log(`Etiketter (annonsens egna första vecka): ${formateraFrekvens(etiketter.filter((e) => e.etikett === ETIKETT.BREAKTHROUGH).length, etiketter.length)} breakthrough · ${nya.length} nya att logga, ${etiketter.length - nya.length} redan i loggen`);
    for (const e of etiketter) console.log(`  ${e.etikett.padEnd(15)} ${e.namn}  [${e.fonster}] ${e.motivering}${e.redan_loggad ? `  (redan loggad ${e.redan_loggad.datum} som ${e.redan_loggad.etikett}${e.redan_loggad.etikett !== e.etikett ? ' — loggen gäller, ändras aldrig utom till BREAKTHROUGH' : ''})` : ''}`);
    if (unga.length) console.log(`  För unga för etikett (${unga.length}, första veckan inte slut): ${unga.slice(0, 8).map((u) => `${u.namn} (D0 ${u.d0}, ${u.dagar} dagar)`).join(', ')}${unga.length > 8 ? ' … (alla i --json)' : ''}`);
    if (har('--json')) {
      const efter = arg[arg.indexOf('--json') + 1];
      const ut = efter && !efter.startsWith('--') ? efter : join(UTMAPP, `dom-${jobb.datum ?? idagSE()}.json`);
      mkdirSync(dirname(ut), { recursive: true });
      writeFileSync(ut, `${JSON.stringify({ datum: jobb.datum ?? null, break_even_roas: be, kampanj: jobb.kampanj ?? null, ranking: rank, etiketter, for_unga: unga }, null, 2)}\n`);
      console.log(`Domen som JSON: ${ut}`);
    }
    return;
  }

  if (har('--status')) {
    const logg = lasLogg();
    const lardomar = logg.filter((r) => r.kod === 'LARDOM');
    const briefer = logg.filter((r) => r.kod === 'BRIEF');
    const sedanRond = logg.findLastIndex?.((r) => r.kod === 'ROND_KLAR') ?? -1;
    const nya = sedanRond > -1 ? logg.slice(sedanRond).filter((r) => r.kod === 'LARDOM').length : lardomar.length;
    const tak = brieftak({ lardomarSedanForraRonden: nya, kadensAntal: konfig.kadens.briefer_per_rond });
    const levande = levandeBreakthrough(logg.filter((r) => r.kod === 'ETIKETT'), new Date().toISOString().slice(0, 10));
    console.log(`Lärdomar totalt: ${lardomar.length} · sedan förra ronden: ${nya}`);
    console.log(`Briefer totalt: ${briefer.length} · på lärdom: ${briefer.filter((b) => b.lardom).length}`);
    console.log(`Brieftak: ${tak.antal} — ${tak.orsak}`);
    console.log(`Mix: ${JSON.stringify(mix(tak.antal, levande.length > 0))}`);
    return;
  }

  // --kolla (standard)
  console.log(`Matstrumpor — ${konfig.butik}`);
  console.log(`Konto:    ${konfig.meta.ad_account_namn} (${konfig.meta.ad_account_id})`);
  console.log(`Kampanj:  ${konfig.meta.kampanj.namn} (${konfig.meta.kampanj.id}) · ${konfig.meta.kampanj.typ} ${konfig.meta.kampanj.dagsbudget_sek} kr/dag`);
  for (const [k, v] of Object.entries(konfig.meta.adsets)) console.log(`  adset ${k.padEnd(10)} ${v.namn}${v.id ? ` (${v.id})` : '  ⚠️ finns inte än'}`);
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
