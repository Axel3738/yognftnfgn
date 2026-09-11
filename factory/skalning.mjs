// SKALNINGSRONDEN för EN butik. Läs-bara: filen gör inga skrivande
// Graph-anrop och rör ALDRIG en status. PAUSED i kontot är ett beslut.
//
//   node factory/skalning.mjs <butik|produkt> [--dagar 14] [--sedan 2026-09-01] [--json]
//                             [--marknad SE|NO|ALLA] [--arv] [--arv-dagar 90] [--spara]
//   node factory/skalning.mjs tankguard --dagar 30
//   node factory/skalning.mjs hemvakten --dagar 14 --arv --marknad SE --spara
//
// Kräver env META_ACCESS_TOKEN. Noll npm-beroenden (går via tools/meta-lib.mjs).
// Ursprung: factory/skalning.mjs på grenen claude/skalningskungen-butik-setup-divhii.
// Tillagt här 2026-09-09: de två lägena, klassificeringen och tvålinjeslogiken.
// Tillagt 2026-09-10 (Axels besked samma dag: "döm på helheten"):
//   • hook/hold räknas på 3-SEKUNDERSVISNINGAR och THRUPLAY. Det gamla måttet
//     (video_play_actions / impressions) är AUTOPLAY och låg på 89–96 % för
//     samtliga videor (products/motorholjet/dna.md) — det skiljer inget åt.
//     Det gamla finns kvar som `hook_autoplay`/`hold_p50` för jämförelse.
//   • CPC och länkklick hämtas.
//   • --marknad: TANKGUARD_SE_… och TANKGUARD_NO_… rankades ihop mot svenskt
//     pris (skarp körning 2026-09-10). Rader utan marknadskod räknas som SE.
//   • --arv: ÄRVD HISTORIK. OPS-kampanjerna är nya och nästan tomma, men
//     samma produkt har ofta månader av data på Bäverbutiken ("vi kan i
//     början köra från bäverbutikens annonser … all data ligger kvar").
//     Bäverbutiken LÄSES bara — arv-vägen kan inte skriva (se hamtaArv).
//   • --spara: snapshot till factory/output/<butik>/insights-<datum>.json så
//     nästa rond kan jämföra mot en ≥3 dygn äldre bild (ANALYSMETOD 2b).
//
// ⚠️ TVÅ LÄGEN, SAMMA ROND (kravspec: factory/SKALNINGSKUNGEN.md)
//   TEST  (Bäverbutiken)  — BARA tröskelkoll. Passeras tröskeln skjuts
//                           startskottet: "KLAR FÖR OPS: <produkt>". Aldrig
//                           en enda brief. Det är hela poängen med att
//                           Bäverbutiken är testbädd (factory/TRAPPAN.md).
//   SKALA (OPS-butik)     — full loop: klassificering, rangordning på
//                           vinstbidrag, och underlag till nästa batch.
//
// ⚠️ BUTIKSFILTRET ÄR SPÄRREN, INTE EN BEKVÄMLIGHET
// ANALYSMETOD steg 0 säger "hämta HELA kampanjen sorterad på amount_spent".
// I Bäverbutiken är ett konto = en verksamhet, så det räcker. OPS-butikerna
// delar ETT konto (MagiBorsten DK 915422744950975) och kontot bär dessutom
// Bäverbutikens danska kampanjer (avläst 2026-09-08: sex kampanjer, samtliga
// Bäverbutikens, noll OPS-kampanjer). Utan prefixfilter rangordnar en rond en
// annan verksamhets annonser mot den här produktens break-even — och det syns
// inte som ett fel, bara som konstig data. Körningen skriver därför alltid ut
// vad den SLÄNGDE, så ett felstavat prefix syns som en tom lista.
//
// ⚠️ FÄLTNAMNEN SKILJER SIG ÅT MELLAN GRAPH OCH MCP-VERKTYGET
// ANALYSMETOD.md listar `amount_spent`, `actions:omni_purchase`,
// `cost_per_omni_purchase`, `purchase_roas`, `omni_purchase_values` — det är
// Adsmanager-MCP:ns namn. Graph-API:t (som den här filen använder) heter
// `spend`, `actions[omni_purchase]`, `cost_per_action_type[omni_purchase]`,
// `purchase_roas[]`, `action_values[omni_purchase]`. Samma tal, olika namn.

import { pathToFileURL, fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
// ⚠️ Bara LÄSANDE funktioner importeras ur meta-lib (alla/api är GET utan form).
// Inga skapande, aktiverande eller uppladdande funktioner får in här — ett test vaktar det.
import { alla, api, säkerställProxy } from '../tools/meta-lib.mjs';
import {
  laddaButik, sakerstallKonto, tillhorButiken, TROSKEL, redigerareFor, arKordag,
  BAVERBUTIKEN_ANNONSKONTO,
} from './register.mjs';
import { linjetext } from './ekonomi.mjs';
import { formateraStartskott } from './startskott.mjs';

// Signifikansgrinden ur ANALYSMETOD steg 2 — oförändrad, den är produktagnostisk.
export const GRIND_SPEND_SEK = 300;
export const GRIND_KOP = 3;
// ANALYSMETOD steg 3, kill-regeln: "ROAS < break-even, efter ≥500 kr spend,
// och trenden håller i sig". Under 500 kr är domen "bevaka", aldrig "pausa".
export const KILL_SPEND_SEK = 500;
// Steg 2c: en dom på 3–4 köp är PRELIMINÄR och måste överleva nästa rond
// innan den skrivs in i Winning eller Losing DNA.
export const PRELIMINAR_KOP = 5;
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
  const klick = nr(rad.clicks);

  // Videomåtten. ⚠️ Två familjer som lätt blandas ihop:
  //   video_play_actions           = AUTOPLAY-starter (89–96 % av visningarna,
  //                                  skiljer inget åt — behålls bara för jämförelse)
  //   actions[video_view]          = 3-SEKUNDERSVISNINGAR (Graph: "video_view =
  //                                  3-second video views") — det är HOOKEN
  //   video_thruplay_watched_actions = thruplay (15 s eller hela videon) — HOLD
  // Bildannonser saknar alla dessa och får null, aldrig 0 %.
  const spelningar = plockaAction(rad.video_play_actions, 'video_view');
  const halva = plockaAction(rad.video_p50_watched_actions, 'video_view');
  const treSek = plockaAction(rad.actions, 'video_view');
  const thruplay = plockaAction(rad.video_thruplay_watched_actions, 'video_view');
  const p25 = plockaAction(rad.video_p25_watched_actions, 'video_view');
  const p75 = plockaAction(rad.video_p75_watched_actions, 'video_view');
  const p100 = plockaAction(rad.video_p100_watched_actions, 'video_view');
  const harVideo = treSek > 0;

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
    // Metas eget CPC (kostnad per klick, alla klick). null när fältet saknas.
    cpc: rad.cpc === undefined || rad.cpc === null ? null : nr(rad.cpc),
    lankklick: nr(rad.inline_link_clicks),
    tre_sek: treSek,
    thruplay,
    p25,
    p75,
    p100,
    // HOOK = 3-sekundersvisningar / visningar. HOLD = thruplay / 3-sekundersvisningar.
    hook_rate: harVideo && visningar > 0 ? treSek / visningar : null,
    hold: harVideo ? thruplay / treSek : null,
    // De gamla måtten, BARA för jämförelse. Autoplay-hooken duger inte som
    // urvalskriterium (dna.md-mätningen ovan).
    hook_autoplay: visningar > 0 && spelningar > 0 ? spelningar / visningar : null,
    hold_p50: spelningar > 0 ? halva / spelningar : null,
    cvr: klick > 0 ? kop / klick : null,
  };
}

/** Steg 1 — datakvalitetskontrollen. Returnerar raderna som inte går ihop. */
export function trasigaRader(rader, tolerans = 0.05) {
  return rader.filter((r) => {
    if (r.omni_purchase_values <= 0 || r.intakt <= 0) return false;
    return Math.abs(r.omni_purchase_values - r.intakt) / r.intakt > tolerans;
  });
}

/** Steg 2 — signifikansgrinden. Under den: ingen dom, ingen ranking. */
export const arBedombar = (r) => r.amount_spent >= GRIND_SPEND_SEK && r.kop >= GRIND_KOP;

/**
 * Steg 4 — vinstbidrag. Aldrig ROAS eller CPA ensamt.
 * Saknas break-even-CPA finns ingen linje att mäta mot — då kastar vi. Ett
 * tyst 0 hade gett en tabell full av nollor som ser ut som "ingen tjänade
 * något" i stället för "vi vet inte".
 */
export function vinstbidrag(rad, breakEvenCpa) {
  if (!breakEvenCpa) throw new Error('vinstbidrag: break-even-CPA saknas — ingen rangordning kan göras.');
  if (!rad.cpa) return 0; // inga köp ⇒ inget bidrag, och raden är ändå "för tidigt"
  return (breakEvenCpa - rad.cpa) * rad.kop;
}

/**
 * De två linjer en dom ska mätas mot.
 * Är momsantagandet satt är båda samma tal. Är det obeslutat
 * (factory/BESLUT-VANTAR.md punkt 1) är de olika, och då finns ett band där
 * domen faktiskt BEROR på Axels beslut. Att låtsas att bandet inte finns är
 * precis det tysta valet som gör kill-beslut godtyckliga.
 */
export function domlinjer(ekonomi) {
  if (!ekonomi || ekonomi.osaker) return null;
  if (ekonomi.antagande !== 'obeslutat' && ekonomi.breakEvenCpa) {
    return {
      strang: ekonomi.breakEvenCpa,
      generos: ekonomi.breakEvenCpa,
      target: ekonomi.targetCpa ?? null,
      obeslutat: false,
    };
  }
  const [strang, generos] = ekonomi.spann?.breakEvenCpa ?? [null, null];
  if (!strang || !generos) return null;
  return {
    strang,
    generos,
    // Utan beslut används den STRÄNGASTE targeten för skalningsförslag —
    // ett skalningsbeslut ska inte kunna vila på det generösaste antagandet.
    target: ekonomi.spann?.targetCpa?.[0] ?? null,
    obeslutat: true,
  };
}

/**
 * Steg 7 — klassificeringen. Ren funktion.
 *
 * @returns {{klass, motivering, preliminar, skalningskandidat, vinst_strang, vinst_generos}}
 *   klass ∈ for_tidigt · vinnare · bevaka · forlorare · beror_pa_moms
 */
export function klassificera(rad, ekonomi) {
  const linjer = domlinjer(ekonomi);
  if (!linjer) {
    return {
      klass: 'oklart',
      motivering: 'Break-even går inte att räkna ur produktfilen — ingen dom kan avges. Sätt pris och inköpskostnad först.',
      preliminar: false, skalningskandidat: false, vinst_strang: null, vinst_generos: null,
    };
  }
  if (!arBedombar(rad)) {
    return {
      klass: 'for_tidigt',
      motivering: `${Math.round(rad.amount_spent)} kr och ${rad.kop} köp — under grinden (${GRIND_SPEND_SEK} kr OCH ${GRIND_KOP} köp). Ingen dom, ingen plats i rankingen.`,
      preliminar: false, skalningskandidat: false, vinst_strang: null, vinst_generos: null,
    };
  }

  const vinstStrang = vinstbidrag(rad, linjer.strang);
  const vinstGeneros = vinstbidrag(rad, linjer.generos);
  const preliminar = rad.kop < PRELIMINAR_KOP;
  const cpa = rad.cpa;

  const gemensamt = {
    preliminar,
    vinst_strang: vinstStrang,
    vinst_generos: vinstGeneros,
    skalningskandidat: Boolean(linjer.target && cpa <= linjer.target),
  };
  const svans = preliminar ? ` Domen är PRELIMINÄR (${rad.kop} köp) och måste överleva nästa rond.` : '';

  if (cpa <= linjer.strang) {
    return {
      ...gemensamt,
      klass: 'vinnare',
      motivering: `CPA ${Math.round(cpa)} kr under break-even på BÅDA linjerna (${linjer.strang}–${linjer.generos} kr) på ${rad.kop} köp.`
        + (gemensamt.skalningskandidat ? ' Även under target — skalningskandidat.' : ' Över target men klart lönsam — skalas, dödas aldrig.')
        + svans,
    };
  }
  if (cpa > linjer.generos) {
    if (rad.amount_spent < KILL_SPEND_SEK) {
      return {
        ...gemensamt,
        klass: 'bevaka',
        motivering: `CPA ${Math.round(cpa)} kr över break-even på båda linjerna, men bara ${Math.round(rad.amount_spent)} kr spend. `
          + `Kill-regeln kräver ≥${KILL_SPEND_SEK} kr och en trend som håller i sig (ANALYSMETOD steg 3).${svans}`,
      };
    }
    return {
      ...gemensamt,
      klass: 'forlorare',
      motivering: `CPA ${Math.round(cpa)} kr över break-even på BÅDA linjerna (${linjer.strang}–${linjer.generos} kr) efter ${Math.round(rad.amount_spent)} kr spend. `
        + `Kill-kandidat — mot break-even, aldrig mot target.${svans}`,
    };
  }
  return {
    ...gemensamt,
    klass: 'beror_pa_moms',
    motivering: `CPA ${Math.round(cpa)} kr ligger MELLAN linjerna (${linjer.strang} kr med moms, ${linjer.generos} kr utan). `
      + 'Domen beror på momsbeslutet (BESLUT-VANTAR.md punkt 1) — ingen kill, inget skalningsbeslut förrän Axel svarat.'
      + svans,
  };
}

/**
 * Vinst i procent av omsättningen. Formeln är avläst ur den körande rutinen
 * (agent/besked.mjs på grenen claude/daily-agent-discussion-uos5df,
 * `vinstProcent`) så tröskeln betyder exakt samma sak här som där.
 */
export function vinstProcent(breakEvenRoas, roas) {
  if (!Number.isFinite(breakEvenRoas) || breakEvenRoas <= 1) return null;
  if (!Number.isFinite(roas) || roas <= 0) return null;
  return (1 / breakEvenRoas - 1 / roas) * 100;
}

/**
 * Läge TEST: har produkten klarat tröskeln för en egen OPS-butik?
 * Ren funktion. Räknar aldrig fram ett tal den inte fått.
 */
export function troskelkoll({ spend, kop, roas, breakEvenRoas }, troskel = TROSKEL) {
  const vinst = vinstProcent(breakEvenRoas, roas);
  const spendOk = Number.isFinite(spend) && spend >= troskel.spend_sek;
  const vinstOk = Number.isFinite(vinst) && vinst >= troskel.vinst_procent;

  if (!Number.isFinite(breakEvenRoas)) {
    return { passerad: false, vinstProcent: null, spendOk, vinstOk: false, skal: 'Break-even-ROAS saknas — ingen dom går att fälla. Gissa aldrig.' };
  }
  if (vinst === null) {
    return { passerad: false, vinstProcent: null, spendOk, vinstOk: false, skal: `Ingen ROAS i perioden (${kop ?? 0} köp) — vinsten går inte att räkna.` };
  }
  return {
    passerad: spendOk && vinstOk,
    vinstProcent: vinst,
    spendOk,
    vinstOk,
    skal: spendOk && vinstOk
      ? `${Math.round(spend)} kr spend (krav ${troskel.spend_sek}) och ${vinst.toFixed(1)} % vinst (krav ${troskel.vinst_procent} %).`
      : `${Math.round(spend)} kr spend av ${troskel.spend_sek} · ${vinst.toFixed(1)} % vinst av ${troskel.vinst_procent} % — tröskeln är inte passerad.`,
  };
}

// ------------------------------------------------------------------ hämtning

// Metas giltiga last_Nd-presets. Allt annat räknas om till ett time_range.
const PRESETS = [3, 7, 14, 28, 30, 90];

export const INSIGHTS_FALT = [
  // campaign_id: budgetrond.mjs slår upp vilka kampanjer som bär produktens
  // annonser (flerproduktsbutik, 2026-09-11) — namnet räcker inte där.
  'ad_id', 'ad_name', 'adset_name', 'campaign_id', 'campaign_name',
  'spend', 'impressions', 'clicks', 'ctr', 'cpm', 'cpc', 'frequency', 'inline_link_clicks',
  'actions', 'action_values', 'purchase_roas', 'cost_per_action_type',
  'video_play_actions', 'video_thruplay_watched_actions',
  'video_p25_watched_actions', 'video_p50_watched_actions',
  'video_p75_watched_actions', 'video_p100_watched_actions',
].join(',');

// Marknadskoderna som kan stå i ett kampanj- eller annonsnamn (`_NO_`, `…_NO`).
// ⚠️ Listan är sluten med flit: ett generellt `_XX_`-mönster hade läst vinkel-
// koderna (`_TR_`, `_PD_`, `_SP_`) som länder.
export const MARKNADSKODER = ['SE', 'NO', 'DK', 'FI', 'UK', 'DE'];
export const STANDARDMARKNAD = 'SE';

/** Marknadskoderna ett namn bär, t.ex. "TANKGUARD_NO_SALES" → ["NO"]. Skiftlägesokänsligt. */
export function marknadskoderI(namn) {
  const n = String(namn ?? '').toUpperCase();
  return MARKNADSKODER.filter((k) => n.includes(`_${k}_`) || n.endsWith(`_${k}`));
}

/**
 * Filtrerar rader på marknad. Ren funktion — testas utan nät.
 * En rad tillhör marknad X om kampanj- ELLER annonsnamnet bär koden X.
 * Rader UTAN marknadskod räknas som SE (namnkonventionen skrev ingen kod
 * innan Norge fanns). `ALLA` behåller allt.
 * Tar både råa Graph-rader (campaign_name/ad_name) och normaliserade (kampanj/namn).
 */
export function filtreraPaMarknad(rader, marknad = STANDARDMARKNAD) {
  const vald = String(marknad ?? STANDARDMARKNAD).toUpperCase();
  const bortfiltrerade = {};
  if (vald === 'ALLA') return { behall: [...rader], bortfiltrerade, marknad: vald, antalBort: 0 };
  if (!MARKNADSKODER.includes(vald)) {
    throw new Error(`Okänd marknad "${marknad}". Giltiga: ${MARKNADSKODER.join(', ')} eller ALLA.`);
  }
  const behall = [];
  for (const rad of rader) {
    const koder = new Set([
      ...marknadskoderI(rad.campaign_name ?? rad.kampanj),
      ...marknadskoderI(rad.ad_name ?? rad.namn),
    ]);
    if (koder.size === 0) koder.add(STANDARDMARKNAD);
    if (koder.has(vald)) {
      behall.push(rad);
    } else {
      const nyckel = [...koder].sort().join('+');
      bortfiltrerade[nyckel] = (bortfiltrerade[nyckel] ?? 0) + 1;
    }
  }
  const antalBort = Object.values(bortfiltrerade).reduce((s, n) => s + n, 0);
  return { behall, bortfiltrerade, marknad: vald, antalBort };
}

/**
 * Periodparametrarna till insights. Ren funktion.
 *   sedan   → time_range från datumet till i dag
 *   dagar   → last_Nd om Meta har presetet, annars explicit intervall
 *   livstid → date_preset maximum (hela livstiden — arv-vägen)
 */
export function periodParams({ dagar = 14, sedan = null, livstid = false, idag = new Date() } = {}) {
  const till = idag.toISOString().slice(0, 10);
  if (livstid) return { params: { date_preset: 'maximum' }, period: 'maximum (hela livstiden)' };
  if (sedan) return { params: { time_range: { since: sedan, until: till } }, period: `${sedan} → ${till}` };
  if (PRESETS.includes(dagar)) return { params: { date_preset: `last_${dagar}d` }, period: `last_${dagar}d` };
  // Meta har bara vissa date_presets — ett påhittat (`last_60d`) ger ett
  // fältfel, inte ett tomt svar. Räkna om till ett explicit datumintervall.
  const fran = new Date(idag.getTime() - dagar * 86400000).toISOString().slice(0, 10);
  return { params: { time_range: { since: fran, until: till } }, period: `${fran} → ${till}` };
}

/** Filtrerar hämtade rader på butikens prefix. Ren funktion — testas utan nät. */
export function filtreraPaPrefix(rader, prefix, tillhor) {
  const behall = [];
  const slang = [];
  const baraAnnonsnamn = new Set();
  for (const rad of rader) {
    // Filtret får träffa på ANTINGEN annonsnamnet eller kampanjnamnet: en
    // brand-swappad annons kan ha behållit sitt gamla annonsnamn men ligga i
    // butikens egen kampanj.
    const viaKampanj = tillhor(rad.campaign_name, prefix);
    const viaAnnons = tillhor(rad.ad_name, prefix);
    if (viaKampanj || viaAnnons) {
      behall.push(rad);
      if (viaAnnons && !viaKampanj) baraAnnonsnamn.add(`${rad.ad_name} (i "${rad.campaign_name}")`);
    } else {
      slang.push(rad);
    }
  }
  return {
    behall,
    slangda: slang.length,
    slangdaKampanjer: [...new Set(slang.map((r) => r.campaign_name))].sort(),
    behallnaKampanjer: [...new Set(behall.map((r) => r.campaign_name))].sort(),
    baraAnnonsnamn: [...baraAnnonsnamn].sort(),
  };
}

/** Hämtar butikens annonser ur kontot och filtrerar bort andras. */
export async function hamtaButikensAnnonser(butik, { dagar = 14, sedan = null, marknad = STANDARDMARKNAD } = {}) {
  const konto = sakerstallKonto(butik.post);
  if (!butik.prefix) {
    throw new Error(`${butik.post.nyckel}: ${butik.prefixfel} — utan prefix läses hela kontot, och det är en annan verksamhets data.`);
  }

  const { params: periodP, period } = periodParams({ dagar, sedan });
  const rader = await alla(`act_${konto}/insights`, { level: 'ad', fields: INSIGHTS_FALT, sort: 'spend_descending', ...periodP });

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

  const f = filtreraPaPrefix(rader, butik.prefix, tillhorButiken);
  const m = filtreraPaMarknad(f.behall, marknad);
  return {
    ...f,
    rader: m.behall.map((r) => normalisera(r, status)).sort((a, b) => b.amount_spent - a.amount_spent),
    totalt: rader.length,
    prefix: butik.prefix,
    period,
    marknad: { vald: m.marknad, bortfiltrerade: m.bortfiltrerade, antalBort: m.antalBort },
  };
}

// ------------------------------------------------------------ ärvd historik
//
// ⚠️ BÄVERBUTIKEN LÄSES BARA. Den här vägen går INTE via sakerstallKonto (som
// med rätta kastar när en OPS-post pekar på Bäverbutikens konto) utan hårdkodar
// läs-endast-kontot och anropar aldrig något annat än `insights` (GET).
// Ingen statusläsning, ingen skrivning, inget form-anrop — ett test vaktar det.
export const ARV_KONTO = BAVERBUTIKEN_ANNONSKONTO;
export const ARV_TEXT = 'ÄRVD HISTORIK — Bäverbutikens annonser för samma produkt, dömda mot OPS-butikens linjer; '
  + 'priset kan skilja. Vägledande, ingen budget rörs här. Bäverbutiken LÄSES bara.';

/** Källprefixet ur produktfilens `kalla:`-block, eller null med ett skäl. Ren funktion. */
export function arvPrefix(butik) {
  const kalla = butik?.produkt?.kalla ?? null;
  const prefix = typeof kalla?.annonsprefix === 'string' ? kalla.annonsprefix.trim() : '';
  if (!prefix) {
    return { prefix: null, skal: `${butik?.post?.produktfil ?? 'produktfilen'} saknar kalla.annonsprefix — ingen ärvd historik kan läsas.` };
  }
  return { prefix, skal: null, kampanjId: kalla.kampanj_id ?? null, kampanj: kalla.kampanj ?? null };
}

/** Den rena delen av arv-filtret: Bäverbutikens rader → bara produktens, på marknaden. */
export function filtreraArv(rader, annonsprefix, marknad = STANDARDMARKNAD) {
  const f = filtreraPaPrefix(rader, [annonsprefix.trim().toLowerCase()], tillhorButiken);
  const m = filtreraPaMarknad(f.behall, marknad);
  return {
    ...f,
    behall: m.behall,
    marknad: { vald: m.marknad, bortfiltrerade: m.bortfiltrerade, antalBort: m.antalBort },
  };
}

/**
 * Läser Bäverbutikens insights för samma produkt. LÄSNING ENBART.
 * dagar = null ⇒ hela livstiden (date_preset maximum) — det är poängen med
 * arvet: OPS-kampanjen är ny, källan har månader av data.
 */
export async function hamtaArv(butik, { dagar = null, marknad = STANDARDMARKNAD } = {}) {
  const k = arvPrefix(butik);
  if (!k.prefix) return { hoppad: true, skal: k.skal, prefix: null, rader: [] };

  const { params: periodP, period } = periodParams({ dagar: dagar ?? 14, livstid: dagar === null });
  // Enda anropet i arv-vägen: GET act_<Bäverbutiken>/insights. Inget annat.
  const ra = await alla(`act_${ARV_KONTO}/insights`, { level: 'ad', fields: INSIGHTS_FALT, sort: 'spend_descending', ...periodP });

  const f = filtreraArv(ra, k.prefix, marknad);
  return {
    hoppad: false,
    skal: null,
    konto: ARV_KONTO,
    lasesBara: true,
    prefix: k.prefix,
    kallaKampanj: k.kampanj,
    kallaKampanjId: k.kampanjId,
    period,
    totalt: ra.length,
    slangda: f.slangda,
    behallnaKampanjer: f.behallnaKampanjer,
    marknad: f.marknad,
    rader: f.behall.map((r) => ({ ...normalisera(r), arv: true })).sort((a, b) => b.amount_spent - a.amount_spent),
  };
}

/**
 * Arv-rapporten: samma klassificering och rangordning som OPS-raderna, mot
 * OPS-butikens linjer, men märkt arv och utan budgetförslag. Ren funktion.
 */
export function byggArvRapport(butik, arv) {
  if (!arv || arv.hoppad) return { hoppad: true, skal: arv?.skal ?? 'ingen arv-hämtning', prefix: null, rader: [], bedombara: [], vinnare: [], forlorare: [], totalSpend: 0, totalKop: 0 };
  const r = byggRapport(butik, { ...arv, prefix: [arv.prefix] });
  return {
    hoppad: false,
    text: ARV_TEXT,
    konto: arv.konto,
    lasesBara: true,
    prefix: arv.prefix,
    kallaKampanj: arv.kallaKampanj ?? null,
    period: arv.period,
    marknad: arv.marknad ?? null,
    totalt: arv.totalt ?? arv.rader.length,
    rader: r.rader.map((x) => ({ ...x, arv: true })),
    bedombara: r.bedombara.map((x) => ({ ...x, arv: true })),
    forTidigt: r.forTidigt.length,
    vinnare: r.vinnare.map((x) => ({ ...x, arv: true })),
    forlorare: r.forlorare.map((x) => ({ ...x, arv: true })),
    bevaka: r.bevaka.length,
    totalSpend: r.totalSpend,
    totalKop: r.totalKop,
    samladRoas: r.samladRoas,
    totalVinstGeneros: r.totalVinstGeneros,
    verkligAov: r.verkligAov,
  };
}

// ------------------------------------------------------------- snapshot

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Skriver rondens normaliserade rader (OPS + arv) till
 * factory/output/<butik>/insights-<datum>.json så nästa rond kan jämföra
 * mot en bild ≥3 dygn äldre (ANALYSMETOD 2b).
 * ⚠️ factory/output/ är SPÅRAD i git (CHECKLISTA.md, plan.json per butik) och
 * snapshoten ska committas och pushas av rutinen — nästa rond körs i en ny
 * container och har inget annat minne. Därför hålls filen liten: bara
 * normaliserade rader + period, aldrig råa Graph-svar.
 */
export function sparaSnapshot(butik, { hamtning, arv = null, datum = new Date().toISOString().slice(0, 10), rot = ROT } = {}) {
  const katalog = join(rot, 'factory', 'output', butik.post.butik);
  mkdirSync(katalog, { recursive: true });
  const fil = join(katalog, `insights-${datum}.json`);
  const data = {
    butik: butik.post.nyckel,
    datum,
    period: hamtning.period,
    marknad: hamtning.marknad ?? null,
    konto: butik.post.ad_account_id,
    rader: hamtning.rader,
    arv: arv && !arv.hoppad
      ? { konto: arv.konto, lasesBara: true, prefix: arv.prefix, period: arv.period, rader: arv.rader }
      : { hoppad: true, skal: arv?.skal ?? 'arv inte begärt' },
  };
  writeFileSync(fil, `${JSON.stringify(data, null, 2)}\n`);
  return fil;
}

// ------------------------------------------------------------------ rapport

const kr = (v) => (v === null || v === undefined ? '—' : `${Math.round(v).toLocaleString('sv-SE')} kr`);
const pct = (v) => (v === null || v === undefined ? '—' : `${(v * 100).toFixed(1)} %`);

/** Sammanställer rondens siffror. Ren funktion — hämtningen sker utanför. */
export function byggRapport(butik, hamtning) {
  const { ekonomi, post } = butik;
  const linjer = domlinjer(ekonomi);
  const rader = hamtning.rader;

  const totalSpend = rader.reduce((s, r) => s + r.amount_spent, 0);
  const totalKop = rader.reduce((s, r) => s + r.kop, 0);
  const totalIntakt = rader.reduce((s, r) => s + r.intakt, 0);
  const samladRoas = totalSpend > 0 ? totalIntakt / totalSpend : 0;

  const domda = rader.map((r) => ({ ...r, dom: klassificera(r, ekonomi) }));
  const bedombara = domda.filter((r) => r.dom.klass !== 'for_tidigt' && r.dom.klass !== 'oklart');
  const forTidigt = domda.filter((r) => r.dom.klass === 'for_tidigt');

  // Rangordningen görs på den GENERÖSA linjen (utan moms) när beslutet saknas,
  // och båda kolumnerna visas. Skiljer sig topp-3 mellan linjerna sägs det
  // rakt ut — då är rangordningen inte robust mot momsbeslutet.
  const rankad = [...bedombara].sort((a, b) => (b.dom.vinst_generos ?? 0) - (a.dom.vinst_generos ?? 0));
  const rankadStrang = [...bedombara].sort((a, b) => (b.dom.vinst_strang ?? 0) - (a.dom.vinst_strang ?? 0));
  const topp = (lista) => lista.slice(0, 3).map((r) => r.namn).join('|');
  const ordningSkiljer = Boolean(linjer?.obeslutat) && topp(rankad) !== topp(rankadStrang);

  const summa = (nyckel) => rankad.reduce((s, r) => s + (r.dom[nyckel] ?? 0), 0);

  return {
    post,
    ekonomi,
    linjer,
    hamtning,
    rader: domda,
    bedombara: rankad,
    forTidigt,
    vinnare: rankad.filter((r) => r.dom.klass === 'vinnare'),
    forlorare: rankad.filter((r) => r.dom.klass === 'forlorare'),
    bevaka: rankad.filter((r) => r.dom.klass === 'bevaka'),
    berorPaMoms: rankad.filter((r) => r.dom.klass === 'beror_pa_moms'),
    ordningSkiljer,
    totalSpend,
    totalKop,
    totalIntakt,
    samladRoas,
    totalVinstGeneros: summa('vinst_generos'),
    totalVinstStrang: summa('vinst_strang'),
    // Verklig AOV ur kontot. Finns den avviker den nästan alltid från
    // styckpriset (paketen är förvalda) — och då är break-even fel.
    // ⚠️ Egen signifikansgrind: en AOV på två order är brus, och en
    // rekommendation att flytta kill-linjen på det underlaget är farligare
    // än ingen rekommendation alls.
    verkligAov: totalKop >= AOV_GRIND_KOP ? totalIntakt / totalKop : null,
    trasiga: trasigaRader(rader),
  };
}

/** Läge TEST: tröskelkollen och, om den passeras, startskottet. */
export function testrapport(rapport, { kallaUrl = null, kampanjId = null } = {}) {
  const { post, ekonomi } = rapport;
  const troskel = post.troskel ?? TROSKEL;
  const koll = troskelkoll({
    spend: rapport.totalSpend,
    kop: rapport.totalKop,
    roas: rapport.samladRoas,
    breakEvenRoas: ekonomi?.breakEvenRoas,
  }, troskel);

  let startskott = null;
  let saknas = [];
  if (koll.passerad) {
    const jobb = {
      produkt: post.namn,
      kampanj_id: kampanjId ?? (rapport.hamtning.behallnaKampanjer[0] ?? ''),
      kalla_url: kallaUrl ?? '',
      spend_total: rapport.totalSpend,
      kop: rapport.totalKop,
      cpa: rapport.totalKop > 0 ? rapport.totalSpend / rapport.totalKop : null,
      break_even_cpa: ekonomi?.breakEvenCpa,
      roas: rapport.samladRoas,
      vinst_procent: koll.vinstProcent,
    };
    try {
      startskott = formateraStartskott(jobb);
    } catch (e) {
      // Startskottet vägrar hellre än att skicka ett meddelande med ett hål i.
      saknas = [e.message];
    }
  }
  return { troskel, koll, startskott, saknas };
}

const procentAvKlick = (v) => (v === null || v === undefined ? '—' : `${Number(v).toFixed(2)} %`);

/** Steg 6-tabellen. Hook/hold på 3-sekundersvisningar och thruplay — bild får "—". */
function skrivDiagnostabell(rader) {
  console.log('| Annons | Hook 3s | Hold (thruplay/3s) | CTR | CPC | CVR (köp/klick) | CPM | Frekvens |');
  console.log('|---|---|---|---|---|---|---|---|');
  for (const a of rader) {
    console.log(
      `| ${a.namn} | ${pct(a.hook_rate)} | ${pct(a.hold)} | ${procentAvKlick(a.ctr)} | ${kr(a.cpc)} | ${pct(a.cvr)} | ${kr(a.cpm)} | ${Number(a.frequency ?? 0).toFixed(2)} |`
    );
  }
  console.log('Hook/hold räknas på 3-sekundersvisningar och thruplay — bildannonser har dem inte (—).');
  console.log('Det gamla autoplay-måttet (video_play_actions/impressions) ligger kvar i JSON som hook_autoplay/hold_p50 för jämförelse, aldrig som urvalskriterium.');
}

/** Arv-avsnittet: Bäverbutikens historik för samma produkt, dömd mot OPS-linjerna. */
function skrivArv(arv, linjer) {
  console.log('\n--- ÄRVD HISTORIK (--arv) ---\n');
  if (arv.hoppad) {
    console.log(`  Hoppas över: ${arv.skal}`);
    return;
  }
  console.log(`  ${ARV_TEXT}`);
  console.log(`  Källa: konto ${arv.konto} (Bäverbutiken LÄSES bara) · prefix "${arv.prefix}" · period ${arv.period}`);
  if (arv.kallaKampanj) console.log(`  Källkampanj enligt produktfilen: ${arv.kallaKampanj}`);
  const bort = Object.entries(arv.marknad?.bortfiltrerade ?? {}).map(([k, n]) => `${k}: ${n}`).join(' · ');
  console.log(
    `  ${arv.rader.length} av ${arv.totalt} annonser i kontot bär prefixet`
    + `${arv.marknad ? ` (marknad ${arv.marknad.vald}, ${arv.marknad.antalBort} bortfiltrerade${bort ? `: ${bort}` : ''})` : ''}.`
  );
  if (!arv.rader.length) {
    console.log('  Inga ärvda rader — kontrollera kalla.annonsprefix mot annonsnamnen i Bäverbutikens konto.');
    return;
  }
  console.log(`  Totalt: ${kr(arv.totalSpend)} spend · ${arv.totalKop} köp · samlad ROAS ${arv.samladRoas.toFixed(2)}`
    + (arv.verkligAov ? ` · verklig AOV ${kr(arv.verkligAov)}` : ''));
  console.log(`  Bedömbara: ${arv.bedombara.length} · för tidigt: ${arv.forTidigt} · vinnare ${arv.vinnare.length} · förlorare ${arv.forlorare.length} · bevaka ${arv.bevaka}`);
  if (!arv.bedombara.length) return;

  const tvaLinjer = Boolean(linjer?.obeslutat);
  console.log(`\n  Rangordning på vinstbidrag mot OPS-linjen${tvaLinjer ? ' (utan moms)' : ''} — topp 10:\n`);
  console.log('| Ärvd annons | Spend | Köp | CPA | ROAS | Vinstbidrag | Klass | Hook 3s | Hold | CTR | CPC |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|');
  for (const a of arv.bedombara.slice(0, 10)) {
    console.log(
      `| ${a.namn} | ${kr(a.amount_spent)} | ${a.kop} | ${kr(a.cpa)} | ${a.purchase_roas.toFixed(2)} | ${kr(a.dom.vinst_generos)} | `
      + `${a.dom.klass}${a.dom.preliminar ? ' (prel.)' : ''} | ${pct(a.hook_rate)} | ${pct(a.hold)} | ${procentAvKlick(a.ctr)} | ${kr(a.cpc)} |`
    );
  }
  console.log('\n  Läs arvet som RIKTNING (vilka vinklar/hooks som bar) — inte som dom över OPS-kampanjen. Ingen budget rörs här.');
}

export function skrivRapport(r, { idag = new Date().toISOString().slice(0, 10) } = {}) {
  const { post, ekonomi, hamtning } = r;
  const kord = arKordag(post, idag);

  console.log(`\n=== SKALNINGSRONDEN — ${post.namn} ===\n`);
  console.log(`Läge ${post.lage.toUpperCase()} · ${post.nyckel} · konto ${post.ad_account_id} · period ${hamtning.period}`);
  console.log(`Kördag ${idag}: ${kord.kordag ? 'JA' : 'NEJ'} — ${kord.skal}. Nästa: ${kord.nastaKordag}`);
  console.log(`Redigerare: ${redigerareFor(post) ?? 'ingen redigerare tilldelad'}`);
  console.log(`Prefixfilter: ${hamtning.prefix.join(' · ')}`);
  console.log(
    `Butiksfiltret: ${hamtning.rader.length} av ${hamtning.totalt} annonser i kontot är butikens. `
    + `${hamtning.slangda} rader tillhör andra verksamheter och är BORTFILTRERADE.`
  );
  if (hamtning.marknad) {
    const bort = Object.entries(hamtning.marknad.bortfiltrerade ?? {}).map(([k, n]) => `${k}: ${n}`).join(' · ');
    console.log(
      `Marknadsfilter: ${hamtning.marknad.vald} — ${hamtning.marknad.antalBort} rader på annan marknad BORTFILTRERADE`
      + `${bort ? ` (${bort})` : ''}. Rader utan marknadskod räknas som SE.`
    );
  }
  if (hamtning.behallnaKampanjer.length) console.log(`  Butikens kampanjer:       ${hamtning.behallnaKampanjer.join(' · ')}`);
  if (hamtning.slangdaKampanjer.length) console.log(`  Bortfiltrerade kampanjer: ${hamtning.slangdaKampanjer.join(' · ')}`);
  if (hamtning.baraAnnonsnamn.length) {
    console.log(
      `  ⚠️ ${hamtning.baraAnnonsnamn.length} rader matchade bara på ANNONSNAMNET och ligger i en kampanj\n`
      + `     utan butikens prefix: ${hamtning.baraAnnonsnamn.join(' · ')}`
    );
  }

  console.log('\nLinjer:');
  for (const rad of linjetext(ekonomi)) console.log(rad);

  if (!hamtning.rader.length) {
    console.log(
      '\n⚠️ Butiken har INGA annonser i kontot i perioden. Ingen dom kan avges — och det är\n'
      + '   inte samma sak som att annonserna gick dåligt. Kontrollera att kampanjen är byggd\n'
      + '   och att namnet börjar med butikens prefix.\n'
    );
    if (r.arv && post.lage !== 'test') skrivArv(r.arv, r.linjer);
    return;
  }

  if (r.verkligAov && ekonomi?.brutto) {
    const avvikelse = Math.abs(r.verkligAov - ekonomi.brutto) / ekonomi.brutto;
    console.log(`\nVerklig AOV i perioden: ${kr(r.verkligAov)} på ${r.totalKop} köp (registrerad: ${kr(ekonomi.brutto)})`);
    if (avvikelse > 0.1) {
      console.log(
        `  ⚠️ Avviker ${(avvikelse * 100).toFixed(0)} % från talet ekonomin är räknad på. Linjerna ovan är fel.\n`
        + '     Räkna om INNAN någon annons döms — och sätt BÅDA talen:\n'
        + `       ekonomi.aov_sek: ${Math.round(r.verkligAov)}\n`
        + '       ekonomi.varukostnad_per_order: <varukostnaden för en SÅDAN order, ur offer.paket>\n'
        + `     Kör sedan: node factory/ekonomi.mjs ${post.produktfil}`
      );
    }
  } else if (r.totalKop > 0) {
    console.log(`\nVerklig AOV: för få order för att mäta (${r.totalKop} av ${AOV_GRIND_KOP}). Linjerna står kvar.`);
  }

  if (r.trasiga.length) {
    console.log(`\n⚠️ Datakvalitet (steg 1): ${r.trasiga.length} rader där omni_purchase_values inte stämmer mot spend × ROAS.`);
    console.log('   Intäkten i tabellerna nedan är spend × ROAS, aldrig fältet.');
    for (const t of r.trasiga) console.log(`   • ${t.namn}: fältet ${kr(t.omni_purchase_values)} mot räknat ${kr(t.intakt)}`);
  }

  console.log(`\n--- Steg 2: signifikansgrinden (≥${GRIND_SPEND_SEK} kr OCH ≥${GRIND_KOP} köp) ---`);
  console.log(`  Bedömbara: ${r.bedombara.length}   ·   För tidigt: ${r.forTidigt.length} (ingen dom, ingen ranking)`);
  for (const f of r.forTidigt) console.log(`   ⏳ ${f.namn} — ${kr(f.amount_spent)}, ${f.kop} köp`);

  // ---- Läge TEST slutar här. Inga briefer, inga batchförslag.
  if (post.lage === 'test') {
    const t = testrapport(r);
    console.log('\n--- LÄGE TEST: bara tröskelkoll (factory/TRAPPAN.md) ---\n');
    console.log(`  Tröskel: ${t.troskel.spend_sek} kr spend OCH ${t.troskel.vinst_procent} % vinst.`);
    console.log(`  Källa:   ${t.troskel.kalla}`);
    console.log(`  ⚠️ ${t.troskel.beslut}`);
    console.log(`  Utfall:  ${t.koll.skal}`);
    if (t.startskott) {
      console.log('\n----------------- STARTSKOTT -----------------\n');
      console.log(t.startskott);
      console.log('\n----------------------------------------------');
    } else if (t.saknas.length) {
      console.log(`\n⚠️ Tröskeln är passerad men startskottet kan inte skrivas: ${t.saknas.join(' · ')}`);
    } else {
      console.log('\n  Tröskeln inte passerad — inga briefer, ingen batch. Det är hela poängen med testbädden.');
    }
    console.log('');
    return;
  }

  if (!r.bedombara.length) {
    console.log('\n  Ingen annons har passerat grinden än. Ingen rangordning görs — det vore brus.\n');
    if (r.arv) skrivArv(r.arv, r.linjer);
    return;
  }

  console.log('\n--- Steg 4: vinstbidrag (rangordningen — aldrig ROAS eller CPA ensamt) ---\n');
  const tvaLinjer = Boolean(r.linjer?.obeslutat);
  console.log(`| Annons | Spend | Andel spend | Köp | CPA | ROAS | Vinstbidrag${tvaLinjer ? ' (utan moms)' : ''} |${tvaLinjer ? ' Vinstbidrag (med moms) |' : ''} Andel vinst | Klass | Status |`);
  console.log(`|---|---|---|---|---|---|---|${tvaLinjer ? '---|' : ''}---|---|---|`);
  for (const a of r.bedombara) {
    const andelSpend = r.totalSpend > 0 ? a.amount_spent / r.totalSpend : 0;
    const andelVinst = r.totalVinstGeneros !== 0 ? (a.dom.vinst_generos ?? 0) / r.totalVinstGeneros : 0;
    console.log(
      `| ${a.namn} | ${kr(a.amount_spent)} | ${pct(andelSpend)} | ${a.kop} | ${kr(a.cpa)} | ${a.purchase_roas.toFixed(2)} | `
      + `${kr(a.dom.vinst_generos)} |${tvaLinjer ? ` ${kr(a.dom.vinst_strang)} |` : ''} ${pct(andelVinst)} | `
      + `${a.dom.klass}${a.dom.preliminar ? ' (prel.)' : ''} | ${a.effective_status ?? '—'} |`
    );
  }
  console.log(`\nTotalt: ${kr(r.totalSpend)} spend · ${r.totalKop} köp · vinstbidrag ${kr(r.totalVinstGeneros)}${tvaLinjer ? ` (utan moms) / ${kr(r.totalVinstStrang)} (med moms)` : ''}`);
  if (tvaLinjer) {
    console.log('⚠️ Momsbeslutet saknas, så vinstbidraget visas på båda linjerna. Rangordningen ovan är den UTAN moms.');
    if (r.ordningSkiljer) {
      console.log('⚠️ TOPP-3 SKILJER SIG mellan linjerna — rangordningen är alltså INTE robust mot momsbeslutet. Ta ingen budgetflytt på den här ronden.');
    }
  }

  console.log('\n--- Steg 7: klassificeringen ---\n');
  for (const grupp of [['VINNARE', r.vinnare], ['BEROR PÅ MOMSBESLUTET', r.berorPaMoms], ['BEVAKA', r.bevaka], ['FÖRLORARE (kill-kandidater)', r.forlorare]]) {
    const [rubrik, lista] = grupp;
    console.log(`  ${rubrik}: ${lista.length}`);
    for (const a of lista) console.log(`    • ${a.namn} — ${a.dom.motivering}`);
  }

  const topp = r.rader[0];
  console.log(
    `\n--- Steg 5: spendfördelningen ---\n`
    + `  Top spendern är ${topp.namn} med ${pct(topp.amount_spent / r.totalSpend)} av spenden.\n`
    + '  Den är BENCHMARK, inte en kandidat att döma mot småannonser.'
  );

  console.log('\n--- Steg 6: metrik-diagnos (pekare, aldrig slutsats) ---\n');
  skrivDiagnostabell(r.bedombara);

  if (r.arv) skrivArv(r.arv, r.linjer);

  console.log(
    '\n⚠️ Steg 6b (creative-teardown) går INTE att göra i ett skript — bilder ska granskas\n'
    + '   visuellt och videomanus läsas ur briefarna. Rapporten ovan är steg 0–7 utan 6b.\n'
    + '   Fortsätt i /skalningskungen med teardownet, annars är analysen bokföring.\n'
    + '⚠️ PAUSED i kontot är ett BESLUT. Ronden har inte rört en enda status och får inte göra det.\n'
  );
}

// ------------------------------------------------------------------- CLI

async function huvud() {
  const arg = process.argv.slice(2);
  const nyckel = arg.find((a) => !a.startsWith('--'));
  if (!nyckel) {
    console.error('Användning: node factory/skalning.mjs <butik|produkt> [--dagar 14] [--sedan YYYY-MM-DD] [--marknad SE|NO|ALLA] [--arv] [--arv-dagar N] [--spara] [--json]');
    process.exit(1);
  }
  const flagga = (namn, standard) => {
    const i = arg.indexOf(`--${namn}`);
    return i >= 0 && arg[i + 1] ? arg[i + 1] : standard;
  };
  const marknad = String(flagga('marknad', STANDARDMARKNAD)).toUpperCase();
  const idag = flagga('idag', new Date().toISOString().slice(0, 10));

  const butik = laddaButik(nyckel);
  // Kontospärren FÖRST — inget Graph-anrop får gå mot ett okontrollerat konto.
  const kontoId = sakerstallKonto(butik.post);

  if (!butik.ekonomi) {
    console.error(`❌ ${butik.post.nyckel}: ekonomin går inte att räkna — pris/inköp saknas i ${butik.post.produktfil}.`);
    process.exit(1);
  }
  if (butik.ekonomi.osaker) {
    console.error(`❌ ${butik.post.nyckel}: ${butik.ekonomi.varning}`);
    process.exit(1);
  }
  if (butik.ekonomi.olonsam) {
    console.error(
      `❌ ${butik.post.nyckel}: täckningsbidraget är noll eller negativt i båda linjerna — det finns ingen\n`
      + '   break-even att mäta mot, så ingen dom kan avges. Rätta priset eller inköpskostnaden först.'
    );
    process.exit(1);
  }

  // Kontot faktureras i SEK (avläst 2026-09-08). Produkten måste räknas i
  // samma valuta — annars jämförs kronor med något annat.
  const konto = await api(`act_${kontoId}`, { params: { fields: 'name,currency' } });
  const produktvaluta = butik.produkt?.ekonomi?.valuta ?? butik.post.valuta ?? 'SEK';
  if (konto.currency !== produktvaluta) {
    console.log(`⚠️ Kontots valuta är ${konto.currency} men produkten räknas i ${produktvaluta}. Talen nedan blandar valutor — stanna och reda ut det.`);
  }

  const hamtning = await hamtaButikensAnnonser(butik, {
    dagar: Number(flagga('dagar', 14)),
    sedan: flagga('sedan', null),
    marknad,
  });
  const rapport = byggRapport(butik, hamtning);

  // Ärvd historik: bara för OPS-butiker (läge skala). En testprodukt ÄR
  // Bäverbutiken — den har inget att ärva av sig själv.
  let arvHamtning = null;
  if (arg.includes('--arv') && butik.post.lage !== 'test') {
    const arvDagar = flagga('arv-dagar', null);
    arvHamtning = await hamtaArv(butik, { dagar: arvDagar === null ? null : Number(arvDagar), marknad });
    rapport.arv = byggArvRapport(butik, arvHamtning);
  } else if (arg.includes('--arv')) {
    rapport.arv = byggArvRapport(butik, { hoppad: true, skal: `${butik.post.nyckel} är i läge TEST — den är Bäverbutiken och har inget att ärva.` });
  }

  if (arg.includes('--spara')) {
    const fil = sparaSnapshot(butik, { hamtning, arv: arvHamtning, datum: idag });
    rapport.snapshot = fil;
    if (!arg.includes('--json')) console.log(`\nSnapshot sparad: ${fil}`);
  }

  if (arg.includes('--json')) {
    console.log(JSON.stringify(rapport, null, 2));
    return;
  }
  skrivRapport(rapport, { idag });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  säkerställProxy();
  huvud().catch((e) => {
    console.error(`❌ ${e.message}`);
    process.exit(1);
  });
}
