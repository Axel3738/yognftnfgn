// Skalningsavläsningen för EN OPS-butik ur det DELADE annonskontot.
// Läs-bara: filen gör inga skrivande Graph-anrop och rör aldrig en status.
//
//   node factory/skalning.mjs <butik|produkt> [--dagar 14] [--sedan 2026-09-01] [--json]
//   node factory/skalning.mjs hemvakten --dagar 30
//
// Kräver env META_ACCESS_TOKEN. Noll npm-beroenden (går via tools/meta-lib.mjs).
//
// ⚠️ VARFÖR FILEN FINNS — BUTIKSFILTRET
// ANALYSMETOD steg 0 säger "hämta HELA kampanjen sorterad på amount_spent".
// I Bäverbutiken är ett konto = en verksamhet, så det räcker. OPS-butikerna
// delar ETT konto (MagiBorsten DK 915422744950975) och kontot bär dessutom
// Bäverbutikens danska kampanjer. Avläst 2026-09-08: sex kampanjer i kontot,
// samtliga Bäverbutikens (Motorhöljet DK, Axelbältet DK, Sätesöverdraget DK,
// Strandtofflorna DK, Tofflorna DK, Fiskespöhållaren DK) — noll OPS-kampanjer.
// Utan prefixfilter läser en skalningsrunda alltså en annan verksamhets
// annonser som om de vore produktens egna, och rangordnar dem mot HeimGuards
// break-even. Filtret är därför inte en bekvämlighet — det är spärren.
// Körningen skriver alltid ut vad den SLÄNGDE, så ett felstavat prefix syns
// som en tom lista i stället för att tyst ge fel svar.
//
// ⚠️ FÄLTNAMNEN SKILJER SIG ÅT MELLAN GRAPH OCH MCP-VERKTYGET
// ANALYSMETOD.md listar `amount_spent`, `actions:omni_purchase`,
// `cost_per_omni_purchase`, `purchase_roas`, `omni_purchase_values` — det är
// Adsmanager-MCP:ns namn. Graph-API:t (som den här filen använder) heter
// `spend`, `actions[omni_purchase]`, `cost_per_action_type[omni_purchase]`,
// `purchase_roas[]`, `action_values[omni_purchase]`. Samma tal, olika namn.
// Blanda inte ihop dem — `spend` i MCP:n ger fel, `amount_spent` i Graph ger fel.

import { pathToFileURL } from 'node:url';
import { alla, api, säkerställProxy } from '../tools/meta-lib.mjs';
import { laddaButik, sakerstallOpsKonto, tillhorButiken } from './register.mjs';
export { sakerstallOpsKonto };

// Signifikansgrinden ur ANALYSMETOD steg 2 — oförändrad, den är produktagnostisk.
export const GRIND_SPEND_SEK = 300;
export const GRIND_KOP = 3;
// Egen, hårdare grind för AOV-rekommendationen: den flyttar kill-linjen för
// HELA butiken, så den får inte vila på ett par order.
export const AOV_GRIND_KOP = 10;

const nr = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/** Plockar ett värde ur Metas actions/action_values-listor. */
export function plockaAction(lista, ...typer) {
  if (!Array.isArray(lista)) return 0;
  for (const typ of typer) {
    const rad = lista.find((a) => a.action_type === typ);
    if (rad) return nr(rad.value);
  }
  return 0;
}

/** En insights-rad från Graph → husets vokabulär (ANALYSMETOD-namnen). */
export function normalisera(rad, status = {}) {
  const spend = nr(rad.spend);
  const kop = plockaAction(rad.actions, 'omni_purchase', 'purchase');
  const varde = plockaAction(rad.action_values, 'omni_purchase', 'purchase');
  const roas = plockaAction(rad.purchase_roas, 'omni_purchase', 'purchase');
  const cpaFalt = plockaAction(rad.cost_per_action_type, 'omni_purchase', 'purchase');
  const visningar = nr(rad.impressions);
  const spelningar = plockaAction(rad.video_play_actions, 'video_view');
  const halva = plockaAction(rad.video_p50_watched_actions, 'video_view');
  const klick = nr(rad.clicks);

  return {
    ad_id: rad.ad_id,
    namn: rad.ad_name,
    adset: rad.adset_name,
    kampanj: rad.campaign_name,
    effective_status: status[rad.ad_id] ?? null,
    amount_spent: spend,
    kop,
    // Metas eget CPA-fält först; saknas det räknar vi själva.
    cpa: cpaFalt || (kop > 0 ? spend / kop : null),
    cpa_raknad: kop > 0 ? spend / kop : null,
    purchase_roas: roas,
    omni_purchase_values: varde,
    // Steg 1: `omni_purchase_values` är opålitligt (100× fel på 5 av 8 rader i
    // Bäverbutiken 2026-08-05). Intäkten vi RÄKNAR med är spend × ROAS.
    intakt: spend * roas,
    impressions: visningar,
    ctr: nr(rad.ctr),
    cpm: nr(rad.cpm),
    frequency: nr(rad.frequency),
    klick,
    hook_rate: visningar > 0 ? spelningar / visningar : null,
    hold: spelningar > 0 ? halva / spelningar : null,
    cvr: klick > 0 ? kop / klick : null,
  };
}

/** Steg 1 — datakvalitetskontrollen. Returnerar raderna som inte går ihop. */
export function trasigaRader(rader, tolerans = 0.05) {
  return rader.filter((r) => {
    if (r.omni_purchase_values <= 0 || r.intakt <= 0) return false;
    const avvikelse = Math.abs(r.omni_purchase_values - r.intakt) / r.intakt;
    return avvikelse > tolerans;
  });
}

/** Steg 2 — signifikansgrinden. */
export const arBedombar = (r) => r.amount_spent >= GRIND_SPEND_SEK && r.kop >= GRIND_KOP;

/** Steg 4 — vinstbidrag. Aldrig ROAS eller CPA ensamt.
 *  Saknas break-even-CPA finns ingen linje att mäta mot — då kastar vi.
 *  Ett tyst 0 hade gett en tabell full av nollor som ser ut som "ingen
 *  tjänade något" i stället för "vi vet inte". */
export function vinstbidrag(rad, breakEvenCpa) {
  if (!breakEvenCpa) {
    throw new Error('vinstbidrag: break-even-CPA saknas — ingen rangordning kan göras.');
  }
  if (!rad.cpa) return 0; // inga köp ⇒ inget bidrag, och raden är ändå "för tidigt"
  return (breakEvenCpa - rad.cpa) * rad.kop;
}

// ------------------------------------------------------------------ hämtning

// Metas giltiga last_Nd-presets. Allt annat räknas om till ett time_range.
const PRESETS = [3, 7, 14, 28, 30, 90];

const INSIGHTS_FALT = [
  'ad_id', 'ad_name', 'adset_name', 'campaign_name',
  'spend', 'impressions', 'clicks', 'ctr', 'cpm', 'frequency',
  'actions', 'action_values', 'purchase_roas', 'cost_per_action_type',
  'video_play_actions', 'video_p50_watched_actions',
].join(',');

/**
 * Hämtar butikens annonser ur det delade kontot.
 * @returns {{rader, slangda, slangdaKampanjer, totalt}}
 */
export async function hamtaButikensAnnonser(butik, { dagar = 14, sedan = null } = {}) {
  const konto = sakerstallOpsKonto(butik.post);

  const params = { level: 'ad', fields: INSIGHTS_FALT, sort: 'spend_descending' };
  let period;
  if (sedan) {
    period = { since: sedan, until: new Date().toISOString().slice(0, 10) };
    params.time_range = period;
  } else if (PRESETS.includes(dagar)) {
    params.date_preset = `last_${dagar}d`;
    period = `last_${dagar}d`;
  } else {
    // Meta har bara vissa date_presets — ett påhittat (`last_60d`) ger ett
    // fältfel, inte ett tomt svar. Räkna om till ett explicit datumintervall.
    const till = new Date();
    const fran = new Date(till.getTime() - dagar * 86400000);
    period = { since: fran.toISOString().slice(0, 10), until: till.toISOString().slice(0, 10) };
    params.time_range = period;
  }

  const rader = await alla(`act_${konto}/insights`, params);

  // Statusen finns inte på insights-edgen. Den hämtas separat, för att
  // "PAUSED med spend är ett BESLUT" ska gå att se i rapporten.
  const status = {};
  try {
    for (const a of await alla(`act_${konto}/ads`, { fields: 'id,effective_status' })) {
      status[a.id] = a.effective_status;
    }
  } catch {
    // Statusen är trevlig att ha, inte nödvändig för rangordningen.
  }

  const behall = [];
  const slang = [];
  const baraAnnonsnamn = new Set();
  for (const rad of rader) {
    // Filtret får träffa på ANTINGEN annonsnamnet eller kampanjnamnet: en
    // brand-swappad Bäverbutiksannons kan ha behållit sitt gamla annonsnamn
    // men ligga i butikens egen kampanj.
    const viaKampanj = tillhorButiken(rad.campaign_name, butik.prefix);
    const viaAnnons = tillhorButiken(rad.ad_name, butik.prefix);
    if (viaKampanj || viaAnnons) {
      behall.push(rad);
      if (viaAnnons && !viaKampanj) baraAnnonsnamn.add(`${rad.ad_name} (i "${rad.campaign_name}")`);
    } else {
      slang.push(rad);
    }
  }

  return {
    rader: behall.map((r) => normalisera(r, status)).sort((a, b) => b.amount_spent - a.amount_spent),
    slangda: slang.length,
    slangdaKampanjer: [...new Set(slang.map((r) => r.campaign_name))].sort(),
    behallnaKampanjer: [...new Set(behall.map((r) => r.campaign_name))].sort(),
    baraAnnonsnamn: [...baraAnnonsnamn].sort(),
    totalt: rader.length,
    prefix: butik.prefix,
    period: typeof period === 'string' ? period : `${period.since} → ${period.until}`,
  };
}

// ------------------------------------------------------------------ rapport

const kr = (v) => `${Math.round(v).toLocaleString('sv-SE')} kr`;
const pct = (v) => (v === null || v === undefined ? '—' : `${(v * 100).toFixed(1)} %`);

export function byggRapport(butik, hamtning) {
  const { ekonomi, post } = butik;
  const beCpa = ekonomi?.breakEvenCpa ?? null;
  const rader = hamtning.rader;
  const bedombara = rader.filter(arBedombar);
  const forTidigt = rader.filter((r) => !arBedombar(r));

  const totalSpend = rader.reduce((s, r) => s + r.amount_spent, 0);
  const totalKop = rader.reduce((s, r) => s + r.kop, 0);
  const totalIntakt = rader.reduce((s, r) => s + r.intakt, 0);
  const rankade = bedombara
    .map((r) => ({ ...r, vinst: vinstbidrag(r, beCpa) }))
    .sort((a, b) => b.vinst - a.vinst);
  const totalVinst = rankade.reduce((s, r) => s + r.vinst, 0);

  return {
    post, ekonomi, hamtning,
    rader, bedombara: rankade, forTidigt,
    trasiga: trasigaRader(rader),
    totalSpend, totalKop, totalIntakt, totalVinst,
    // Verklig AOV ur kontot. Finns den avviker den nästan alltid från
    // styckpriset (paketen är förvalda) — och då är break-even fel.
    // ⚠️ Egen signifikansgrind: en AOV på två order är brus, och en
    // rekommendation att flytta kill-linjen på det underlaget är farligare
    // än ingen rekommendation alls.
    verkligAov: totalKop >= AOV_GRIND_KOP ? totalIntakt / totalKop : null,
    aovKop: totalKop,
  };
}

export function skrivRapport(r) {
  const { post, ekonomi, hamtning } = r;
  console.log(`\n=== SKALNINGSAVLÄSNING — ${post.namn} ===\n`);
  console.log(`Konto ${post.ad_account_id} (delat OPS-konto) · period ${hamtning.period} · prefix: ${hamtning.prefix.join(' · ')}`);
  console.log(
    `Butiksfiltret: ${hamtning.rader.length} av ${hamtning.totalt} annonser i kontot är butikens. ` +
    `${hamtning.slangda} rader tillhör andra verksamheter och är BORTFILTRERADE.`
  );
  if (hamtning.behallnaKampanjer.length) {
    console.log(`  Butikens kampanjer:       ${hamtning.behallnaKampanjer.join(' · ')}`);
  }
  if (hamtning.slangdaKampanjer.length) {
    console.log(`  Bortfiltrerade kampanjer: ${hamtning.slangdaKampanjer.join(' · ')}`);
  }
  if (hamtning.baraAnnonsnamn.length) {
    // En annons som bär butikens prefix men ligger i en kampanj som inte gör
    // det är antingen felplacerad eller en felaktig träff. Båda ska synas.
    console.log(
      `  ⚠️ ${hamtning.baraAnnonsnamn.length} rader matchade bara på ANNONSNAMNET och ligger i en kampanj\n` +
      `     utan butikens prefix: ${hamtning.baraAnnonsnamn.join(' · ')}`
    );
  }

  if (!hamtning.rader.length) {
    console.log(
      '\n⚠️ Butiken har INGA annonser i kontot i perioden. Ingen dom kan avges — och det är\n' +
      '   inte samma sak som att annonserna gick dåligt. Kontrollera att kampanjen är byggd\n' +
      '   och att namnet börjar med butikens prefix.\n'
    );
    return;
  }

  console.log(`\nLinjer (ur ${post.produktfil}, räknade av factory/ekonomi.mjs):`);
  console.log(`  Break-even: ROAS ${ekonomi.breakEvenRoas} · CPA ${ekonomi.breakEvenCpa} kr  ← enda linjen som får döda`);
  console.log(`  Target:     ROAS ${ekonomi.targetRoas ?? '—'} · CPA ${ekonomi.targetCpa ?? '—'} kr  ← skalning, aldrig kill`);

  if (r.verkligAov) {
    const avvikelse = Math.abs(r.verkligAov - ekonomi.brutto) / ekonomi.brutto;
    console.log(`\nVerklig AOV i perioden: ${kr(r.verkligAov)} på ${r.aovKop} köp (registrerad: ${kr(ekonomi.brutto)})`);
    if (avvikelse > 0.1) {
      console.log(
        `  ⚠️ Avviker ${(avvikelse * 100).toFixed(0)} % från talet ekonomin är räknad på. Linjerna nedan är fel.\n` +
        '     Räkna om INNAN någon annons döms — och sätt BÅDA talen:\n' +
        `       ekonomi.aov_sek: ${Math.round(r.verkligAov)}\n` +
        '       ekonomi.varukostnad_per_order: <varukostnaden för en SÅDAN order>\n' +
        '     Varukostnaden går inte att räkna ut ur ordervärdet: paketen är rabatterade och\n' +
        '     bär en gratis bonusprodukt, så antalet varor växer snabbare än intäkten. Ta talet\n' +
        `     ur paketnivåerna i produktfilens offer.bundle. Kör sedan:\n` +
        `       node factory/ekonomi.mjs ${post.produktfil}`
      );
    }
  } else if (r.totalKop > 0) {
    console.log(
      `\nVerklig AOV: för få order för att mäta (${r.totalKop} av ${AOV_GRIND_KOP}). Linjerna står kvar.`
    );
  }

  if (r.trasiga.length) {
    console.log(`\n⚠️ Datakvalitet (steg 1): ${r.trasiga.length} rader där omni_purchase_values inte stämmer`);
    console.log('   mot spend × ROAS. Intäkten i tabellerna nedan är spend × ROAS, aldrig fältet.');
    for (const t of r.trasiga) console.log(`   • ${t.namn}: fältet ${kr(t.omni_purchase_values)} mot räknat ${kr(t.intakt)}`);
  }

  console.log(`\n--- Steg 2: signifikansgrinden (≥${GRIND_SPEND_SEK} kr OCH ≥${GRIND_KOP} köp) ---`);
  console.log(`  Bedömbara: ${r.bedombara.length}   ·   För tidigt: ${r.forTidigt.length} (ingen dom, ingen ranking)`);
  for (const f of r.forTidigt) {
    console.log(`   ⏳ ${f.namn} — ${kr(f.amount_spent)}, ${f.kop} köp`);
  }

  if (!r.bedombara.length) {
    console.log('\n  Ingen annons har passerat grinden än. Ingen rangordning görs — det vore brus.\n');
    return;
  }

  console.log('\n--- Steg 4: vinstbidrag (rangordningen — aldrig ROAS eller CPA ensamt) ---\n');
  console.log('| Annons | Spend | Andel spend | Köp | CPA | ROAS | Vinstbidrag | Andel vinst | Status |');
  console.log('|---|---|---|---|---|---|---|---|---|');
  for (const a of r.bedombara) {
    const andelSpend = r.totalSpend > 0 ? a.amount_spent / r.totalSpend : 0;
    const andelVinst = r.totalVinst !== 0 ? a.vinst / r.totalVinst : 0;
    console.log(
      `| ${a.namn} | ${kr(a.amount_spent)} | ${pct(andelSpend)} | ${a.kop} | ${kr(a.cpa)} | ` +
      `${a.purchase_roas.toFixed(2)} | ${kr(a.vinst)} | ${pct(andelVinst)} | ${a.effective_status ?? '—'} |`
    );
  }
  console.log(`\nTotalt: ${kr(r.totalSpend)} spend · ${r.totalKop} köp · vinstbidrag ${kr(r.totalVinst)}`);

  const topp = r.rader[0];
  console.log(
    `\n--- Steg 5: spendfördelningen ---\n` +
    `  Top spendern är ${topp.namn} med ${pct(topp.amount_spent / r.totalSpend)} av spenden.\n` +
    '  Den är BENCHMARK, inte en kandidat att döma mot småannonser.'
  );

  console.log('\n--- Steg 6: metrik-diagnos (pekare, aldrig slutsats — gå vidare till teardownet) ---\n');
  console.log('| Annons | Hook rate | Hold | CTR | CVR (köp/klick) | CPM | Frekvens |');
  console.log('|---|---|---|---|---|---|---|');
  for (const a of r.bedombara) {
    console.log(
      `| ${a.namn} | ${pct(a.hook_rate)} | ${pct(a.hold)} | ${a.ctr.toFixed(2)} % | ${pct(a.cvr)} | ` +
      `${kr(a.cpm)} | ${a.frequency.toFixed(2)} |`
    );
  }

  console.log(
    '\n⚠️ Steg 6b (creative-teardown) går INTE att göra i ett skript — bilder ska granskas\n' +
    '   visuellt och videomanus läsas ur briefarna. Rapporten ovan är steg 0–6.\n' +
    '   Fortsätt i /skalningskungen med teardownet, annars är analysen bokföring.\n'
  );
}

// ------------------------------------------------------------------- CLI

async function huvud() {
  const arg = process.argv.slice(2);
  const nyckel = arg.find((a) => !a.startsWith('--'));
  if (!nyckel) {
    console.error('Användning: node factory/skalning.mjs <butik|produkt> [--dagar 14] [--sedan YYYY-MM-DD] [--json]');
    process.exit(1);
  }
  const flagga = (namn, standard) => {
    const i = arg.indexOf(`--${namn}`);
    return i >= 0 && arg[i + 1] ? arg[i + 1] : standard;
  };

  const butik = laddaButik(nyckel);
  // Kontospärren FÖRST — inget Graph-anrop får gå mot ett okontrollerat konto.
  const kontoId = sakerstallOpsKonto(butik.post);

  if (!butik.ekonomi) {
    console.error(`❌ ${butik.post.butik}: ekonomin går inte att räkna — pris/inköp saknas i ${butik.post.produktfil}.`);
    process.exit(1);
  }
  if (butik.ekonomi.osaker) {
    console.error(`❌ ${butik.post.butik}: ${butik.ekonomi.varning}`);
    process.exit(1);
  }
  if (butik.ekonomi.olonsam || !butik.ekonomi.breakEvenCpa) {
    console.error(
      `❌ ${butik.post.butik}: täckningsbidraget är ${butik.ekonomi.tackningsbidrag} — det finns ingen\n` +
      '   break-even-linje att mäta mot, så ingen dom kan avges. Rätta priset eller inköpskostnaden först.'
    );
    process.exit(1);
  }

  // Kontot faktureras i SEK (avläst 2026-09-08). Produkten måste räknas i
  // samma valuta — annars jämförs kronor med något annat.
  // (`market-expansion/marknader.json` säger DKK om DK — det är MARKNADENS
  // pris- och annonsvaluta, inte kontots. Båda talen är rätta. Samma sak i
  // NO: kontot är SEK trots `valuta: NOK`.)
  const konto = await api(`act_${kontoId}`, { params: { fields: 'name,currency' } });
  if (konto.currency !== (butik.produkt?.ekonomi?.valuta ?? 'SEK')) {
    console.log(
      `⚠️ Kontots valuta är ${konto.currency} men produkten räknas i ` +
      `${butik.produkt?.ekonomi?.valuta}. Talen nedan blandar valutor — stanna och reda ut det.`
    );
  }

  const hamtning = await hamtaButikensAnnonser(butik, {
    dagar: Number(flagga('dagar', 14)),
    sedan: flagga('sedan', null),
  });
  const rapport = byggRapport(butik, hamtning);

  if (arg.includes('--json')) {
    console.log(JSON.stringify(rapport, null, 2));
    return;
  }
  skrivRapport(rapport);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  säkerställProxy();
  huvud().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}
