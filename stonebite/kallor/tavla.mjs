// kallor/tavla.mjs — lagets tavla: kreativa arbetet som laget ser tillsammans. LÄS-BARA.
//
// Byggordningen efter Evolve, steg 2 (stonebite/evolve/SVAR.md, svar 3): "Två
// lager — lagets tavla med gemensamt arbete och vinster, individens tal i ett
// eget ark." Måtten är ClickUp-masterminden (D1): kön, revisioner, tid från
// brief till live, andel vinnare, flagga för det som legat länge.
//
// ⛔ Tavlan bär INGA kronor. Alla roller ser den, även redigerarna, och de får
// aldrig se spend (Axels beslut 2026-09-02). Vinnaren står som andel av sin
// kampanjs reklam — en procent säger ingenting om beloppet.
//
// Källorna:
//   • Notion (NOTION_TOKEN): varje annonsrad med Ansvarig, status och skapad —
//     samma läsare som commission (commission/notion.mjs).
//   • Meta (META_ACCESS_TOKEN): annonser skapade senaste 35 dagarna + varje
//     annons andel av sin kampanjs reklam senaste 7 dagarna. Bara svenska
//     annonser (commission/berakning.mjs arSvensk) — en översättning är inte
//     redigerarens nya annons.
//   • Kopplingen annons → person: commission/koppling.mjs, bara via hubbraden
//     (aldrig "produktens ägare" — tavlan säger vem som gjorde annonsen).
//
// Notion har ingen statushistorik: "över 10 dagar" räknas från radens
// skapelsedag, och det står på sidan.

import { hamtaAllaHubbar, harToken } from '../../commission/notion.mjs';
import { byggHubbregister, kopplaAnnons } from '../../commission/koppling.mjs';
import { arSvensk } from '../../commission/berakning.mjs';
import { opsHubbar } from '../../tools/lib/ops-hubbar.mjs';
import { api as metaApi } from './meta.mjs';

const DAG = 86_400_000;

/** Andel av kampanjens reklam som gör en annons till veckans vinnare. */
export const VINNARANDEL = 0.2;
/** Kampanjen måste ha spenderat så här mycket på 7 dagar för att en andel ska betyda något. */
export const MIN_KAMPANJSPEND = 1000;
/** En rad i arbete längre än så här flaggas (ClickUp-masterminden: ">10 dagar"). */
export const FORSENAD_DAGAR = 10;

/** Notion-status → tavlans kolumn. Ordningen spelar roll: "Translation in review" är live, inte granskning. */
export function kolumnFor(status) {
  const s = String(status ?? '').toLowerCase();
  if (/se-active|approved|translat|ready to be active|\blive\b|done|klar/.test(s)) return 'klar';
  if (/in progress 2|revision/.test(s)) return 'revision';
  if (/in progress|pågår|doing/.test(s)) return 'pagar';
  if (/to be reviewed|review|granska/.test(s)) return 'vantar';
  if (/draft|not started|to do|att göra|backlog/.test(s)) return 'attGora';
  return 'ovrigt';
}

/** Bara annonsrader — SOP, Guideline, Feedback och Winning Creative räknas aldrig (CLAUDE.md). */
export function arAnnonsrad(r) {
  if (/pending approval|approved/i.test(r.typ ?? '')) return true;
  return !r.typ && String(r.namn ?? '').includes('_');
}

const aktiv = (p) => p.lanserade > 0 || Object.values(p.ko).some((x) => x > 0);

const median = (xs) => {
  if (!xs.length) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Ren funktion: hubbar + annonser + andelar → tavlan.
 * @param {object} o
 * @param {Array} o.hubbar          [{ namn, rader: [{ namn, status, typ, ansvariga, skapad }] }]
 * @param {Array} o.annonser        [{ id, adNamn, skapad, kampanjId, kampanj, konto: { id } }]
 * @param {Map}   o.andelar         annons-id → { andel, kampanjSpend }
 * @param {Array} o.team            [{ id, name, role, notionUserId }]
 */
export function byggTavla({ hubbar = [], annonser = [], andelar = new Map(), team = [], nu = new Date() }) {
  const perNotion = new Map(team.filter((m) => m.notionUserId).map((m) => [m.notionUserId, m]));
  const redigerare = team.filter((m) => m.role === 'editor' && m.active !== false);
  const personer = new Map(redigerare.map((m) => [m.id, {
    id: m.id, namn: m.name.split(' ')[0],
    ko: { attGora: 0, pagar: 0, revision: 0, vantar: 0 },
    forsenade: 0, live7: 0, ledtider: [], vinnare: 0, lanserade: 0,
  }]));
  const lag = { attGora: 0, pagar: 0, revision: 0, vantar: 0, forsenade: 0, live7: 0, vinnare: 0, lanserade: 0, utanRedigerare: 0 };
  const forsenadeRader = [];

  const annonsrader = hubbar.flatMap((h) => (h.rader ?? []).filter(arAnnonsrad).map((r) => ({ ...r, hubb: h.namn })));
  for (const r of annonsrader) {
    const kol = kolumnFor(r.status);
    if (kol === 'klar' || kol === 'ovrigt') continue;
    const vem = (r.ansvariga ?? []).map((id) => perNotion.get(id)).find((m) => m && personer.has(m.id));
    lag[kol] += 1;
    if (!vem) { lag.utanRedigerare += 1; continue; }
    const p = personer.get(vem.id);
    p.ko[kol] += 1;
    const dagar = r.skapad ? Math.floor((nu - new Date(r.skapad)) / DAG) : null;
    if ((kol === 'pagar' || kol === 'revision') && dagar !== null && dagar > FORSENAD_DAGAR) {
      p.forsenade += 1; lag.forsenade += 1;
      forsenadeRader.push({ rad: r.namn.split(/\s+[–-]\s+/)[0].slice(0, 60), person: p.namn, dagar, kolumn: kol });
    }
  }

  // Annonserna: live senaste 7 dagarna, ledtid, vinnare.
  const register = byggHubbregister(hubbar.map((h) => ({ ...h, rader: (h.rader ?? []).filter((r) => r.ansvariga?.length) })));
  // Matstrumpor: raderna heter "021", "017 v1", annonserna MATSTRUMP_sushi_…_021_v1.
  // Numret slås bara upp i Matstrumpors egen hubb — Grillklinikens löpnummer
  // (1–300) hade annars krockat och gett fel person.
  const matRegister = byggHubbregister(hubbar.filter((h) => /matstrump/i.test(h.namn ?? '')));
  const radSkapad = new Map(hubbar.flatMap((h) => (h.rader ?? []).map((r) => [r.namn, r.skapad])));
  const vinnare = [];
  for (const a of annonser) {
    if (!arSvensk(a)) continue;
    let koppling = kopplaAnnons(a, register, []);
    const matNr = String(a.adNamn ?? '').match(/^MATSTRUMP_.*?_(\d{3})[a-z0-9]*_v\d+$/i)?.[1];
    if (matNr) {
      const rad = matRegister.perNummer.get(matNr);
      koppling = rad ? { ansvariga: rad.ansvariga, via: 'hubb', radnamn: rad.radnamn } : null;
    }
    if (!koppling || koppling.via !== 'hubb') continue;
    const vem = koppling.ansvariga.map((id) => perNotion.get(id)).find((m) => m && personer.has(m.id));
    if (!vem) continue;
    const p = personer.get(vem.id);
    const alder = (nu - new Date(a.skapad)) / DAG;
    if (alder <= 7) { p.live7 += 1; lag.live7 += 1; }
    const skapadRad = radSkapad.get(koppling.radnamn);
    if (alder <= 30 && skapadRad) {
      const ledtid = (new Date(a.skapad) - new Date(skapadRad)) / DAG;
      if (ledtid >= 0 && ledtid < 120) p.ledtider.push(ledtid);
    }
    if (alder <= 35) {
      p.lanserade += 1; lag.lanserade += 1;
      const andel = andelar.get(String(a.id));
      if (andel && andel.kampanjSpend >= MIN_KAMPANJSPEND && andel.andel >= VINNARANDEL) {
        p.vinnare += 1; lag.vinnare += 1;
        vinnare.push({ annons: a.adNamn, person: p.namn, andel: Math.round(andel.andel * 100) / 100, dagar: Math.floor(alder) });
      }
    }
  }

  const alla = [...personer.values()].map(({ ledtider, ...p }) => ({
    ...p, ledtidMedian: median(ledtider) === null ? null : Math.round(median(ledtider) * 10) / 10, ledtidAntal: ledtider.length,
  }));
  const allaLedtider = [...personer.values()].flatMap((p) => p.ledtider);
  return {
    lag: { ...lag, ledtidMedian: median(allaLedtider) === null ? null : Math.round(median(allaLedtider) * 10) / 10 },
    // Bara de som haft annonsarbete i fönstret står i tabellen — en nolla för
    // någon som jobbar med annat (produkttest) är inte ett resultat.
    personer: alla.filter(aktiv).sort((a, b) => b.vinnare - a.vinnare || b.live7 - a.live7 || a.namn.localeCompare(b.namn)),
    utanAnnonser: alla.filter((p) => !aktiv(p)).map((p) => p.namn),
    // Samma annons kan ligga i flera adsets — en rad per namn, högsta andelen vinner.
    vinnare: [...new Map(vinnare.sort((a, b) => b.andel - a.andel).map((v) => [v.annons, v])).values()].slice(0, 8),
    forsenade: forsenadeRader.sort((a, b) => b.dagar - a.dagar).slice(0, 8),
    annonsrader: annonsrader.length,
  };
}

/** Annonser skapade senaste 35 dagarna + deras andel av kampanjens reklam senaste 7 dagarna. */
async function lasMeta(konton, { env, nu, logg }) {
  const annonser = [];
  const andelar = new Map();
  const fran = Math.floor((nu.getTime() - 35 * DAG) / 1000);
  for (const k of konton) {
    try {
      let efter = null;
      for (let sida = 0; sida < 10; sida++) {
        const j = await metaApi(`act_${k.id}/ads`, {
          fields: 'id,name,created_time,campaign{id,name}',
          filtering: [{ field: 'created_time', operator: 'GREATER_THAN', value: fran }],
          limit: 500, ...(efter ? { after: efter } : {}),
        }, { env });
        for (const a of j.data ?? []) {
          annonser.push({ id: a.id, adNamn: a.name, skapad: a.created_time, kampanjId: a.campaign?.id, kampanj: a.campaign?.name, konto: { id: k.id } });
        }
        efter = j.paging?.next ? j.paging?.cursors?.after : null;
        if (!efter) break;
      }
      const ins = await metaApi(`act_${k.id}/insights`, { level: 'ad', date_preset: 'last_7d', fields: 'ad_id,campaign_id,spend', limit: 1000 }, { env });
      const perKampanj = new Map();
      for (const r of ins.data ?? []) perKampanj.set(r.campaign_id, (perKampanj.get(r.campaign_id) ?? 0) + (Number(r.spend) || 0));
      for (const r of ins.data ?? []) {
        const tot = perKampanj.get(r.campaign_id) ?? 0;
        if (tot > 0) andelar.set(String(r.ad_id), { andel: (Number(r.spend) || 0) / tot, kampanjSpend: tot });
      }
    } catch (e) {
      logg(`  tavla/meta ${k.id}: ${e.message}`);
      throw new Error(`Meta (${k.namn ?? k.id}): ${e.message}`);
    }
  }
  return { annonser, andelar };
}

/** Hela tavlan till snapshoten. Aldrig ett undantag — ett fel blir status + orsak. */
export async function hamtaTavla({ annonskonton = [], team = [], env = process.env, nu = new Date(), logg = () => {} } = {}) {
  if (!harToken(env)) return { status: 'saknas', orsak: 'NOTION_TOKEN saknas i miljön — kön går inte att läsa' };
  let hubbar;
  let hubbfel = [];
  try {
    const r = await hamtaAllaHubbar({ env });
    hubbar = r.hubbar; hubbfel = r.fel;
    // OPS-butikernas hubbar (CaraShell m.fl.) räknas med, precis som i
    // commission: redigerarna jobbar där också, och tavlan laddar aldrig upp
    // något — spärren mot dem gäller uppladdningen, inte läsningen.
    const ops = [...opsHubbar().values()].map((o) => ({ id: o.id, namn: o.name }));
    const o = await hamtaAllaHubbar({ env, hubbar: ops });
    hubbar = [...hubbar, ...o.hubbar]; hubbfel = [...hubbfel, ...o.fel];
    logg(`  Notion: ${hubbar.length} hubbar, ${hubbar.reduce((s, h) => s + h.rader.length, 0)} rader${hubbfel.length ? `, ${hubbfel.length} hubbar gick inte att läsa` : ''}`);
  } catch (e) {
    return { status: 'fel', orsak: `Notion: ${e.message}` };
  }
  let meta = { annonser: [], andelar: new Map() };
  let metaOrsak = null;
  const konton = annonskonton.filter((k) => k.status === 'ok');
  if (!env.META_ACCESS_TOKEN) metaOrsak = 'META_ACCESS_TOKEN saknas — live och vinnare går inte att räkna';
  else {
    try { meta = await lasMeta(konton, { env, nu, logg }); logg(`  Meta: ${meta.annonser.length} annonser skapade senaste 35 dagarna`); } catch (e) { metaOrsak = e.message; }
  }
  const tavla = byggTavla({ hubbar, annonser: meta.annonser, andelar: meta.andelar, team, nu });
  return {
    status: metaOrsak || hubbfel.length ? 'delvis' : 'ok',
    orsak: [metaOrsak, hubbfel.length ? `${hubbfel.length} hubbar gick inte att läsa: ${hubbfel.map((f) => f.hubb).join(', ')}` : null].filter(Boolean).join(' · ') || null,
    meta: metaOrsak ? 'saknas' : 'ok',
    hubbar: hubbar.length,
    troskel: { vinnarandel: VINNARANDEL, minKampanjspend: MIN_KAMPANJSPEND, forsenadDagar: FORSENAD_DAGAR },
    ...tavla,
  };
}
