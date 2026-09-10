// NATTVAKTEN — budgetronden för EN OPS-butik. Läser kontot, dömer med
// factory/budgetbeslut.mjs, visar tabellen FÖRE någon skrivning, och genomför
// sedan högst N ändringar via tools/meta-lib.mjs med tillbakaläsning och en
// loggrad per ändring i factory/budgetlogg.jsonl.
//
//   node factory/budgetrond.mjs <nyckel> --idag YYYY-MM-DD [--torr] [--json] [--max 3]
//   node factory/budgetrond.mjs tankguard --idag 2026-09-10 --torr
//
// Kräver env META_ACCESS_TOKEN. Noll npm-beroenden.
//
// Spärrarna som ingen dom får runda (skalningskungen.md steg 3–4, CLAUDE.md):
//   • Bara OPS-kontot MagiBorsten DK 915422744950975. Bäverbutiken nekas.
//   • Bara butikens egna kampanjer (prefixfiltret, tillhorButiken). Kontot är
//     delat — utan filter döms en annan verksamhets annonser.
//   • PAUSED är ett beslut: rörs aldrig, aktiveras aldrig. Det enda undantaget
//     är Metas tvångspaus på exakt den enhet körningen själv nyss ändrade,
//     verifierat med tillbakaläsning — och bara den.
//   • Max --max (3) genomförda ändringar per butik och rond. Resten väntar.
//   • Varje ändring läses tillbaka och loggas, även misslyckade.
//
// Exit: 0 klart (även "inga kampanjer") · 1 fel (token saknas, fel konto, Meta).

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { alla, api, lasBudget, pausa, säkerställProxy, uppdateraBudget } from '../tools/meta-lib.mjs';
import { laddaButik, sakerstallKonto, tillhorButiken, OPS_ANNONSKONTO } from './register.mjs';
import { hamtaButikensAnnonser, byggRapport, normalisera, plockaAction, filtreraPaMarknad, STANDARDMARKNAD } from './skalning.mjs';
import { linjetext } from './ekonomi.mjs';
import { besluta, MAX_ANDRINGAR, budgetSek } from './budgetbeslut.mjs';
import { lasLogg, raknaTrasiga, skrivRad, LOGGFIL } from './budgetlogg.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');

const KAMPANJFALT = 'id,name,status,effective_status,daily_budget,lifetime_budget,updated_time';
const ADSETFALT = 'id,name,status,effective_status,daily_budget,lifetime_budget,campaign_id,updated_time';
const INSIKTSFALT = 'campaign_id,campaign_name,spend,actions,purchase_roas,cost_per_action_type';

const nr = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const kr = (v) => (v === null || v === undefined || v === '' ? '—' : (typeof v === 'string' ? v : `${Math.round(v).toLocaleString('sv-SE')} kr`));

/** En kampanj-insightsrad → {spend, kop, roas}. Samma fältplockning som skalning.mjs. */
function insikt(rad) {
  if (!rad) return { spend: 0, kop: 0, roas: 0 };
  const n = normalisera(rad);
  return { spend: n.amount_spent, kop: n.kop, roas: n.purchase_roas };
}

// ------------------------------------------------------------------ hämtning

async function hamtaUnderlag(butik, kontoId, marknad) {
  const prefix = butik.prefix;
  const allaKampanjer = await alla(`act_${kontoId}/campaigns`, { fields: KAMPANJFALT });
  const butikens = allaKampanjer.filter((k) => tillhorButiken(k.name, prefix));
  const slangda = allaKampanjer.filter((k) => !tillhorButiken(k.name, prefix)).map((k) => k.name).sort();
  // Marknadsfiltret: TANKGUARD_SE_… och TANKGUARD_NO_… döms mot olika priser
  // (skalning.mjs 2026-09-10). Samma filter på kampanj- och annonsnivån.
  const m = filtreraPaMarknad(butikens.map((k) => ({ ...k, campaign_name: k.name })), marknad);
  const kampanjer = m.behall;
  const kvarIds = new Set(kampanjer.map((k) => String(k.id)));
  const annanMarknad = butikens.filter((k) => !kvarIds.has(String(k.id))).map((k) => k.name).sort();
  const ids = new Set(kampanjer.map((k) => String(k.id)));
  const filtrering = kampanjer.length ? { filtering: [{ field: 'campaign.id', operator: 'IN', value: [...ids] }] } : null;

  let adsets = [];
  const insikter = {};
  const dygn = {};
  if (kampanjer.length) {
    adsets = (await alla(`act_${kontoId}/adsets`, { fields: ADSETFALT, ...filtrering })).filter((a) => ids.has(String(a.campaign_id)));
    for (const [nyckel, preset] of [['d3', 'last_3d'], ['d7', 'last_7d']]) {
      const rader = await alla(`act_${kontoId}/insights`, { level: 'campaign', date_preset: preset, fields: INSIKTSFALT, ...filtrering });
      for (const r of rader) {
        if (!ids.has(String(r.campaign_id))) continue;
        insikter[r.campaign_id] = insikter[r.campaign_id] ?? {};
        insikter[r.campaign_id][nyckel] = insikt(r);
      }
    }
    const dagsrader = await alla(`act_${kontoId}/insights`, { level: 'campaign', date_preset: 'last_7d', time_increment: 1, fields: 'campaign_id,date_start,spend,actions,purchase_roas', ...filtrering });
    for (const r of dagsrader) {
      if (!ids.has(String(r.campaign_id))) continue;
      dygn[r.campaign_id] = dygn[r.campaign_id] ?? [];
      dygn[r.campaign_id].push({ datum: r.date_start, spend: nr(r.spend), roas: plockaAction(r.purchase_roas, 'omni_purchase', 'purchase'), kop: plockaAction(r.actions, 'omni_purchase', 'purchase') });
    }
  }

  // Ad-nivån: 14d klassificering (ANALYSMETOD steg 2–4) + 7d för trenden.
  const h14 = await hamtaButikensAnnonser(butik, { dagar: 14, marknad });
  const rapport14 = byggRapport(butik, h14);
  const h7 = await hamtaButikensAnnonser(butik, { dagar: 7, marknad });
  const annonser7d = Object.fromEntries(h7.rader.map((r) => [String(r.ad_id), { amount_spent: r.amount_spent, kop: r.kop, cpa: r.cpa }]));

  return {
    kampanjer, slangda, annanMarknad, totaltKampanjer: allaKampanjer.length, adsets, insikter, dygn,
    annonser: rapport14.rader, annonser7d,
    annonserTotalt: h14.totalt, annonserSlangda: h14.slangda, period14: h14.period,
    totalVinst: rapport14.totalVinstGeneros,
  };
}

// ------------------------------------------------------------------ skrivning

/** Genomför EN ändring med tillbakaläsning. Returnerar resultatet + loggraden (oskriven). */
async function genomfor(r, { torr }) {
  const id = r.entitet_id;
  const ut = { ...r, genomford: false, fel: null, fore: null, efter: null, ateraktiverad: null };
  try {
    if (r.atgard === 'PAUSA') {
      const { fore, efter } = await pausa(id, { torr });
      ut.fore = fore; ut.efter = efter;
      if (torr) { ut.fel = 'torrkörning — inget skrivet'; return ut; }
      ut.gammalt = fore.status;
      ut.nytt = efter.status;
      ut.genomford = efter.status === 'PAUSED';
      if (!ut.genomford) ut.fel = `tillbakaläsningen säger status ${efter.status}, inte PAUSED`;
      return ut;
    }
    const { fore, efter } = await uppdateraBudget(id, r.nytt, { torr });
    ut.fore = fore; ut.efter = efter;
    if (torr) { ut.fel = 'torrkörning — inget skrivet'; return ut; }
    ut.gammalt = budgetSek(fore.daily_budget);
    ut.nytt = budgetSek(efter.daily_budget);
    ut.genomford = Math.abs(ut.nytt - r.nytt) < 0.5;
    if (!ut.genomford) ut.fel = `tillbakaläsningen säger ${kr(ut.nytt)}, förväntat ${kr(r.nytt)}`;

    // Metas tvångspaus vid budgetändring: enheten var ACTIVE i båda fälten
    // före, och är det inte efter. Då — och ENBART då, ENBART på exakt den
    // här enheten — sätts ACTIVE igen och läses tillbaka. Aldrig ett svep.
    const varAktiv = fore.status === 'ACTIVE' && fore.effective_status === 'ACTIVE';
    const arAktiv = efter.status === 'ACTIVE' && efter.effective_status === 'ACTIVE';
    if (ut.genomford && varAktiv && !arAktiv) {
      await api(String(id), { form: { status: 'ACTIVE' } });
      const igen = await lasBudget(id);
      ut.ateraktiverad = { fore: `${efter.status}/${efter.effective_status}`, efter: `${igen.status}/${igen.effective_status}`, lyckades: igen.status === 'ACTIVE' && igen.effective_status === 'ACTIVE' };
      ut.efter = igen;
      if (!ut.ateraktiverad.lyckades) ut.fel = `Meta tvångspausade vid budgetändringen och återaktiveringen gav ${ut.ateraktiverad.efter} — en människa måste titta`;
    }
    return ut;
  } catch (e) {
    ut.fel = e.message;
    return ut;
  }
}

// -------------------------------------------------------------------- rapport

function tabell(rader, { annons = false } = {}) {
  const ut = [];
  ut.push(annons
    ? '| Annons | Kampanj | Status | Åtgärd | Varför / spärr |'
    : '| Enhet | Typ | Budget nu | Föreslagen | Åtgärd | Varför / spärr |');
  ut.push(annons ? '|---|---|---|---|---|' : '|---|---|---|---|---|---|');
  // Kampanjnamnen i kontot bär "|" (BE-ROAS-fältet) — ersätts så tabellen håller.
  const cell = (v) => String(v ?? '—').replace(/\|/g, '/');
  for (const r of rader) {
    const text = cell(r.atgard ? r.motivering : `${r.sparr ?? ''}${r.motivering ? ` — ${r.motivering}` : ''}`);
    if (annons) ut.push(`| ${cell(r.namn)} | ${cell(r.kampanj_namn)} | ${cell(r.gammalt)} | ${r.atgard ?? '—'} | ${text} |`);
    else ut.push(`| ${cell(r.namn)} | ${r.entitet_typ} | ${kr(r.gammalt)} | ${r.atgard ? kr(r.nytt) : '—'} | ${r.atgard ?? '—'} | ${text} |`);
  }
  return ut.join('\n');
}

// ------------------------------------------------------------------------ CLI

async function huvud() {
  const arg = process.argv.slice(2);
  const nyckel = arg.find((a) => !a.startsWith('--') && !/^\d{4}-\d{2}-\d{2}$/.test(a) && !/^\d+$/.test(a));
  const flagga = (namn, standard) => {
    const i = arg.indexOf(`--${namn}`);
    return i >= 0 && arg[i + 1] ? arg[i + 1] : standard;
  };
  const torr = arg.includes('--torr');
  const json = arg.includes('--json');
  const idag = flagga('idag', null);
  const max = Number(flagga('max', MAX_ANDRINGAR));
  const marknad = String(flagga('marknad', STANDARDMARKNAD)).toUpperCase();
  const skriv = (...a) => { if (!json) console.log(...a); };

  if (!nyckel || !idag || !/^\d{4}-\d{2}-\d{2}$/.test(idag)) {
    console.error('Användning: node factory/budgetrond.mjs <nyckel> --idag YYYY-MM-DD [--torr] [--json] [--max 3] [--marknad SE|NO|ALLA]');
    process.exit(1);
  }
  if (!process.env.META_ACCESS_TOKEN) {
    console.error('❌ META_ACCESS_TOKEN saknas i miljön — ronden kan varken läsa eller skriva kontot.');
    process.exit(1);
  }

  const butik = laddaButik(nyckel);
  const { post, ekonomi } = butik;
  const kontoId = sakerstallKonto(post);
  if (kontoId !== OPS_ANNONSKONTO) {
    throw new Error(`STOPP: ${post.nyckel} kör mot konto ${kontoId}. Nattvakten rör bara OPS-kontot ${OPS_ANNONSKONTO} — Bäverbutiken har sin egen budgetrutin.`);
  }
  if (!butik.prefix) throw new Error(`${post.nyckel}: ${butik.prefixfel}`);
  if (!ekonomi || ekonomi.osaker) throw new Error(`${post.nyckel}: ekonomin går inte att räkna — ${ekonomi?.varning ?? 'pris/inköp saknas'}.`);
  if (ekonomi.olonsam) throw new Error(`${post.nyckel}: täckningsbidraget är noll eller negativt — det finns ingen break-even att mäta mot.`);

  skriv(`\n=== NATTVAKTEN — ${post.namn} · ${idag}${torr ? ' · TORRKÖRNING (inget skrivs)' : ''} ===\n`);
  skriv(`Konto ${kontoId} (OPS) · nyckel ${post.nyckel} · prefix ${butik.prefix.join(' · ')} · marknad ${marknad} · max ${max} ändringar`);
  for (const rad of linjetext(ekonomi)) skriv(rad);
  if (ekonomi.antagande === 'obeslutat') skriv('⚠️ Momsbeslutet saknas i produktfilen — break-even är två linjer, och motorn fäller då ingen dom.');

  const trasiga = raknaTrasiga();
  const logg = lasLogg();
  skriv(`Budgetlogg: ${logg.length} rader${trasiga ? ` · ⚠️ ${trasiga} trasiga rader hoppades över` : ''} (${LOGGFIL})`);

  const konto = await api(`act_${kontoId}`, { params: { fields: 'name,currency' } });
  const produktvaluta = butik.produkt?.ekonomi?.valuta ?? post.valuta ?? 'SEK';
  if (konto.currency !== produktvaluta) skriv(`⚠️ Kontots valuta är ${konto.currency} men produkten räknas i ${produktvaluta} — talen blandar valutor.`);

  const u = await hamtaUnderlag(butik, kontoId, marknad);
  skriv(`\nKampanjfiltret: ${u.kampanjer.length} av ${u.totaltKampanjer} kampanjer i kontot är butikens på marknad ${marknad}; ${u.slangda.length} tillhör andra butiker, ${u.annanMarknad.length} annan marknad.`);
  if (u.slangda.length) skriv(`  Andra butiker: ${u.slangda.join(' · ')}`);
  if (u.annanMarknad.length) skriv(`  Annan marknad (körs med --marknad): ${u.annanMarknad.join(' · ')}`);
  if (!u.kampanjer.length) {
    skriv(`\nInga kampanjer med prefixet ${butik.prefix.join(' / ')} på marknad ${marknad} i kontot. Ingen dom, inga ändringar — kontrollera att kampanjen är byggd och namnet börjar med prefixet.`);
    if (json) console.log(JSON.stringify({ butik: post.nyckel, idag, torr, kampanjer: [], plan: { genomfor: [], vantar: [] }, resultat: [] }, null, 2));
    return;
  }
  for (const k of u.kampanjer) {
    const i = u.insikter[k.id] ?? {};
    skriv(`  • ${k.name} — ${k.status}/${k.effective_status} · budget ${budgetSek(k.daily_budget) ? kr(budgetSek(k.daily_budget)) : 'på adset-nivå'} · 3d ${kr(i.d3?.spend ?? 0)}/${i.d3?.kop ?? 0} köp · 7d ${kr(i.d7?.spend ?? 0)}/${i.d7?.kop ?? 0} köp · ${(u.dygn[k.id] ?? []).length} dagsrader`);
  }
  skriv(`Annonsfiltret (${u.period14}): ${u.annonser.length} av ${u.annonserTotalt} annonser är butikens; ${u.annonserSlangda} bortfiltrerade. Vinstbidrag totalt ${kr(u.totalVinst)}.`);

  const beslut = besluta({
    kampanjer: u.kampanjer, adsets: u.adsets, insikter: u.insikter, dygn: u.dygn,
    annonser: u.annonser, annonser7d: u.annonser7d, ekonomi, logg, idag, butik: post.nyckel, max,
  });

  skriv('\n--- Budgettabellen (visas FÖRE någon skrivning) ---\n');
  skriv(tabell(beslut.kampanjrader));
  skriv('\n--- Annonserna (kill-kandidater döms på 14d-klass + 7d-trend) ---\n');
  skriv(tabell(beslut.annonsrader, { annons: true }));

  const { genomfor: attGora, vantar } = beslut.plan;
  skriv(`\nPlan: ${attGora.length} ändring(ar) att genomföra${beslut.plan.redanIdag ? ` (${beslut.plan.redanIdag} redan gjorda i dag)` : ''}, ${vantar.length} väntar på Axel.`);

  // ---- Skrivningen.
  const resultat = [];
  for (const r of attGora) {
    skriv(`\n${torr ? '⏸ (torr) ' : '▶ '}${r.atgard} ${r.entitet_typ} "${r.namn}": ${kr(r.gammalt)} → ${kr(r.nytt)}`);
    const res = await genomfor(r, { torr });
    resultat.push(res);
    if (!torr) {
      const loggrad = skrivRad({
        datum: idag, ad_account_id: kontoId, butik: post.nyckel,
        entitet_id: res.entitet_id, entitet_typ: res.entitet_typ, namn: res.namn, atgard: res.atgard,
        gammalt: res.gammalt, nytt: res.nytt, motivering: res.motivering, genomford: res.genomford, fel: res.fel,
      });
      res.loggrad = loggrad;
      skriv(res.genomford
        ? `  ✅ tillbakaläst: ${kr(res.gammalt)} → ${kr(res.nytt)}${res.ateraktiverad ? ` · Meta tvångspausade (${res.ateraktiverad.fore}), återaktiverad → ${res.ateraktiverad.efter}` : ''}`
        : `  ❌ ${res.fel}`);
    } else {
      skriv(`  läst ur kontot: ${res.fore ? `${res.fore.status}/${res.fore.effective_status}, daily_budget ${kr(budgetSek(res.fore.daily_budget) || null)}` : res.fel}`);
    }
  }

  // ---- Underlaget till fil.
  const mapp = join(ROT, 'factory', 'output', post.butik);
  if (!existsSync(mapp)) mkdirSync(mapp, { recursive: true });
  const fil = join(mapp, `budgetrond-${idag}${marknad === STANDARDMARKNAD ? '' : `-${marknad}`}.json`);
  const dump = {
    butik: post.nyckel, idag, torr, konto: kontoId, max, marknad, prefix: butik.prefix,
    ekonomi: { antagande: ekonomi.antagande, breakEvenRoas: ekonomi.breakEvenRoas, breakEvenCpa: ekonomi.breakEvenCpa },
    underlag: { kampanjer: u.kampanjer, adsets: u.adsets, insikter: u.insikter, dygn: u.dygn, annonser: u.annonser, annonser7d: u.annonser7d, slangda: u.slangda },
    beslut: { kampanjrader: beslut.kampanjrader, annonsrader: beslut.annonsrader },
    plan: beslut.plan,
    resultat,
  };
  writeFileSync(fil, `${JSON.stringify(dump, null, 2)}\n`);

  // ---- Sammanfattningen.
  const gjorda = resultat.filter((r) => r.genomford);
  const misslyckade = resultat.filter((r) => !r.genomford && !torr);
  skriv(`\n=== Sammanfattning ${post.namn} ${idag} ===`);
  skriv(torr
    ? `Torrkörning: ${attGora.length} ändring(ar) hade genomförts, ${vantar.length} hade väntat. Inget skrevs, ingen loggrad.`
    : `Gjort av mig: ${gjorda.length} · misslyckade: ${misslyckade.length} · väntar på en människa: ${vantar.length}. Loggrader skrivna: ${resultat.length} (${LOGGFIL}).`);
  for (const r of gjorda) skriv(`  ✅ ${r.atgard} ${r.namn}: ${kr(r.gammalt)} → ${kr(r.nytt)}`);
  for (const r of misslyckade) skriv(`  ❌ ${r.atgard} ${r.namn}: ${r.fel}`);
  for (const r of vantar) skriv(`  ⏳ ${r.atgard} ${r.namn}: ${kr(r.gammalt)} → ${kr(r.nytt)} — ${r.sparr}`);
  skriv(`Underlag: ${fil}`);
  if (!torr && resultat.length) skriv('Glöm inte: committa och pusha factory/budgetlogg.jsonl — annars räknar nästa rond kadens ur ett tomt minne.');

  if (json) console.log(JSON.stringify(dump, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  säkerställProxy();
  huvud().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}
