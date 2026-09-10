#!/usr/bin/env node
// rakning.mjs — steg 9 i `/ny-annonser`: räkningen som KOD, inte som text.
//
//   node factory/rakning.mjs <butik-id> [--marknad SE|NO] [--torr]
//
// Bakgrunden (Axels bakläxa 2026-09-09): `/ny-annonser` byggde 10 annonser av
// 33 möjliga för TankGuard och rapporterade "klart". Kommandofilens steg 9
// BESKREV en räkning — men ingen kod räknade, så räkningen hoppades över. Och
// den norska halvan hade aldrig lästs: ingen kod märkte det heller.
//
// Därför räknar den här filen, och därför är utfallet en exitkod:
//   0 = KLART        varje marknad läst, varje källannons uppe eller namngiven
//   1 = DELVIS KLART något saknas, någon marknad är oläst, eller domar fattas
//
// Tre regler som är hela poängen:
//  • En marknad som saknas i indata rapporteras "marknaden inte läst" — ALDRIG
//    som noll. Noll är ett mätvärde, oläst är en lucka. (Det var NO-halvan.)
//  • En annons utan dom är `odömd`, inte `ren`. Den räknas som saknad tills
//    brand-detektorn har läst den. Oläst är aldrig ren.
//  • En `okänd` dom laddas aldrig upp. Ligger den ändå uppe och är ACTIVE är
//    körningen inte klar.
//
// De rena funktionerna (byggRakning, parkoppla, byggRapport, samlaKallor,
// filtreraUppladdade) rör aldrig nätet. Allt Graph-anrop går genom
// tools/meta-lib.mjs — aldrig egna fetch-anrop mot graph.facebook.com.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { hittaProduktfil } from './produktfil.mjs';
import { laddaEnv } from './env.mjs';
import { KONTON, MALKONTO } from './kallannonser.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));

// Domarna brand-detektorn sätter (factory/brand-detektor.mjs → DOMAR), plus
// `odömd` som är frånvaron av dom. De två sista laddas ALDRIG upp.
export const DOMAR = {
  REN: 'ren',
  BARA_COPY: 'bara-copy',
  OMDUBB: 'kräver-omdubb',
  SLUTKORT: 'kräver-slutkortsbygge',
  OKAND: 'okänd',
  ODOMD: 'odömd',
};

// Domar som ska bli en annons i målkontot. `okänd` och `odömd` står utanför:
// en oläst yta stängs först, döms sen, laddas upp sist.
export const LADDAS_UPP = [DOMAR.REN, DOMAR.BARA_COPY, DOMAR.OMDUBB, DOMAR.SLUTKORT];

// Ordningen i rapporten. `okänd` och `odömd` sist — de är luckor, inte arbete.
const DOMORDNING = [DOMAR.REN, DOMAR.BARA_COPY, DOMAR.OMDUBB, DOMAR.SLUTKORT, DOMAR.OKAND, DOMAR.ODOMD];

// Källkonto → marknad. Kontrolleras alltid på id, aldrig på namn: fyra konton
// heter nästan samma sak (kallannonser.mjs bär kartan).
export const KONTO_MARKNAD = Object.fromEntries(
  Object.entries(KONTON).map(([marknad, k]) => [String(k.id), marknad])
);

const tomtDomrakning = () => Object.fromEntries(DOMORDNING.map((d) => [d, 0]));

// ---------------------------------------------------------------- namnmatchning

/** Namnet uppdelat i sina fält. `TANKGUARD_SE_PD_1_H3 | 2026-09-08`
 *  → ['tankguard','se','pd','1','h3']. Allt efter `|` är kampanj-/datumsvans. */
export function segment(namn) {
  return String(namn ?? '')
    .split('|')[0]
    .trim()
    .split('_')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/** Matchar en källannons mot en uppladdad annons trots att namnet bär nytt
 *  brandprefix: `Enginecover_PD_1_H3` ↔ `TANKGUARD_SE_PD_1_H3`.
 *
 *  Matchningen görs på den DEL av namnet som bär angle/format/hook
 *  (docs/naming-convention.md) — aldrig på hela strängen, för prefixet är
 *  precis det som byts. Tekniskt: den längsta gemensamma svansen av fält, och
 *  den måste vara minst två fält lång OCH börja på ett fält med bokstäver.
 *
 *  Utan bokstavskravet hade `BOF_1_1` och `CS_1_1` matchat på svansen `1_1` —
 *  två helt olika annonser. Med det kravet krävs vinkelkoden (`BOF`, `PD`,
 *  `RV` …) för en träff. */
export function parkoppla(kallnamn, uppladdatnamn) {
  const a = segment(kallnamn);
  const b = segment(uppladdatnamn);
  if (!a.length || !b.length) return false;
  let k = 0;
  while (k < a.length && k < b.length && a[a.length - 1 - k] === b[b.length - 1 - k]) k++;
  if (k < 2) return false;
  const första = a[a.length - k];
  return /[a-zåäöéèü]/.test(första);
}

const MARKNADSKODER = new Set(['se', 'no', 'dk', 'fi', 'uk', 'de', 'nl', 'nb']);

/** Kärnan i ett annonsnamn så långt den går att läsa: fälten från och med
 *  första vinkelkodsfältet (`PD`, `BOF`, `RV` …). Används i rapporten och för
 *  läsbarhet — aldrig som matchningsgrund, det är parkopplas jobb. */
export function karna(namn) {
  const s = segment(namn);
  for (let i = 0; i < s.length - 1; i++) {
    if (/^[a-zåäö]{2,4}$/.test(s[i]) && !MARKNADSKODER.has(s[i])) return s.slice(i).join('_').toUpperCase();
  }
  return s.join('_').toUpperCase();
}

// ---------------------------------------------------------------- normalisering

/** En källrad från brand-detektor.json ELLER kallannonser.json till ett och
 *  samma objekt. Fälten heter olika i de två filerna (`annons`/`namn`,
 *  `dom`/`seDom`) — skillnaden hör hemma här, inte i räknelogiken. */
export function normaliseraKalla(rad) {
  const annons = String(rad.annons ?? rad.namn ?? rad.kort ?? '');
  const råDom = rad.dom ?? rad.seDom ?? null;
  const dom = råDom != null && String(råDom).trim() !== '' ? String(råDom).trim() : DOMAR.ODOMD;
  const kort = rad.kort ? String(rad.kort) : '';
  return {
    annons,
    // `kort` är redan avskalat prefix — men bara om det bär minst två fält,
    // annars finns inget att matcha på.
    matchnamn: segment(kort).length >= 2 ? kort : annons,
    dom,
    marknad: rad.marknad ? String(rad.marknad).toUpperCase() : null,
    status: rad.status ? String(rad.status).toUpperCase() : null,
    adsetStatus: rad.adsetStatus ? String(rad.adsetStatus).toUpperCase() : null,
    typ: rad.typ ?? null,
    orsak: rad.orsak ?? null,
  };
}

/** En uppladdad rad ur målkontot. */
export function normaliseraUppladdad(rad) {
  return {
    id: rad.id ?? null,
    namn: String(rad.namn ?? rad.name ?? ''),
    kampanj: String(rad.kampanj ?? rad.campaign?.name ?? ''),
    marknad: rad.marknad ? String(rad.marknad).toUpperCase() : null,
    status: rad.status ? String(rad.status).toUpperCase() : null,
  };
}

/** ACTIVE annons i ACTIVE adset. En PAUSED källannons är ett BESLUT — den har
 *  dömts ut och ska inte återupplivas i en ny butik (/ny-annonser steg 2).
 *  Saknas statusen antas annonsen med: en oläst status får aldrig tyst stryka
 *  en annons ur räkningen. */
export function arAktiv(rad) {
  if (rad.status == null) return true;
  if (rad.status !== 'ACTIVE') return false;
  return rad.adsetStatus == null || rad.adsetStatus === 'ACTIVE';
}

// ---------------------------------------------------------------- räkningen

/**
 * Räkningen för EN marknad. Ren funktion, ingen nätverkstrafik.
 *
 *   kallor      [{ annons|namn, dom|seDom, marknad, status, adsetStatus?, kort?, orsak? }]
 *               null/undefined = marknaden är INTE läst (≠ noll källannonser).
 *   uppladdade  [{ namn, kampanj, marknad, status? }] läst ur MÅLKONTOT.
 *               null/undefined = kontot är INTE läst.
 *   marknad     'SE' | 'NO' | …
 *
 * `forvantade` räknar aldrig med `okänd` eller `odömd` — de får inte laddas
 * upp — men båda redovisas. `klart` är true bara när ingenting saknas, båda
 * sidor är lästa, och ingen annons ligger uppe som inte får ligga där.
 */
export function byggRakning({ kallor, uppladdade, marknad }) {
  const m = String(marknad ?? '').toUpperCase();
  const kallor_lasta = Array.isArray(kallor);
  const konto_last = Array.isArray(uppladdade);

  const anmarkningar = [];
  const hörHit = (rad) => rad.marknad == null || rad.marknad === m;

  const allaKallor = (kallor ?? []).map(normaliseraKalla);
  const rader = allaKallor.filter(hörHit);
  if (allaKallor.length !== rader.length) {
    anmarkningar.push(
      `${allaKallor.length - rader.length} källannons(er) i indata tillhör en annan marknad än ${m} — de räknas inte här.`
    );
  }
  if (rader.some((r) => r.status == null)) {
    anmarkningar.push('minst en källannons saknar status i indata — den räknas som ACTIVE tills någon läst statusen.');
  }

  const allaUppladdade = (uppladdade ?? []).map(normaliseraUppladdad);
  const kvar = allaUppladdade.filter(hörHit);
  if (allaUppladdade.length !== kvar.length) {
    anmarkningar.push(
      `${allaUppladdade.length - kvar.length} uppladdad(e) annons(er) ligger i en annan marknads kampanj — de räknas inte här.`
    );
  }

  const per_dom = tomtDomrakning();
  const uppe_per_dom = tomtDomrakning();
  const saknade = [];
  const overtaliga = [];
  const uteslutna = [];
  const otagna = [...kvar];

  const taTräff = (rad) => {
    const i = otagna.findIndex((u) => parkoppla(rad.matchnamn, u.namn));
    return i === -1 ? null : otagna.splice(i, 1)[0];
  };

  for (const rad of rader) {
    const dom = DOMORDNING.includes(rad.dom) ? rad.dom : DOMAR.OKAND;
    if (dom !== rad.dom) {
      anmarkningar.push(`okänd domtext "${rad.dom}" på ${rad.annons} — räknas som okänd, aldrig som ren.`);
    }

    // Pausad källa: ett beslut, inte ett fel. Utesluten men NAMNGIVEN.
    if (!arAktiv(rad)) {
      uteslutna.push({
        annons: rad.annons,
        dom,
        orsak: rad.orsak ?? `källan är ${rad.status}${rad.adsetStatus && rad.adsetStatus !== 'ACTIVE' ? ` / adset ${rad.adsetStatus}` : ''} — pausade källannonser återupplivas inte (steg 2)`,
      });
      const träff = taTräff(rad);
      if (träff) {
        overtaliga.push({
          namn: träff.namn,
          status: träff.status,
          orsak: `källannonsen ${rad.annons} är ${rad.status} — den skulle inte ha laddats upp`,
          blockerar: false,
        });
      }
      continue;
    }

    per_dom[dom]++;
    const träff = taTräff(rad);

    if (LADDAS_UPP.includes(dom)) {
      if (träff) {
        uppe_per_dom[dom]++;
      } else {
        saknade.push({
          annons: rad.annons,
          dom,
          // Är kontot oläst vet vi inte att annonsen saknas — vi vet att ingen
          // har tittat. Skriv det, hitta aldrig på en annan orsak.
          orsak:
            rad.orsak ??
            (konto_last
              ? 'orsak saknas — måste namnges'
              : 'målkontot inte läst — annonsen kan varken bekräftas uppe eller saknad'),
        });
      }
      continue;
    }

    // `okänd` och `odömd` ska aldrig laddas upp.
    if (träff) {
      uppe_per_dom[dom]++;
      overtaliga.push({
        namn: träff.namn,
        status: träff.status,
        orsak:
          dom === DOMAR.OKAND
            ? 'domen är okänd — en oläst yta stängs först, laddas upp sist'
            : 'ingen dom — annonsen är uppladdad utan att ha bedömts',
        // En uppladdad okänd/odömd som INTE är pausad är ett öppet fel.
        blockerar: träff.status !== 'PAUSED',
      });
    } else if (dom === DOMAR.ODOMD) {
      // Odömd och inte uppe: den är varken byggd eller bedömd. Den räknas som
      // saknad — annars försvinner hela den olästa halvan tyst ur räkningen,
      // vilket är precis vad som hände med NO 2026-09-09.
      saknade.push({
        annons: rad.annons,
        dom,
        orsak: rad.orsak ?? 'ingen dom — brand-detektorn har inte läst annonsen (oläst är aldrig ren)',
      });
    }
  }

  for (const u of otagna) {
    overtaliga.push({
      namn: u.namn,
      status: u.status,
      orsak: 'ingen källannons med det namnet — kontrollera vem som byggde den',
      blockerar: false,
    });
  }

  const forvantade = LADDAS_UPP.reduce((s, d) => s + per_dom[d], 0);
  const traffade = LADDAS_UPP.reduce((s, d) => s + uppe_per_dom[d], 0);

  if (!kallor_lasta) anmarkningar.unshift(`marknaden inte läst — inga källannonser lästa för ${m}.`);
  else if (rader.length === 0) {
    anmarkningar.unshift(
      `noll källannonser för ${m} — bekräfta mot kontot att produkten saknar kampanj där, och skriv det som ett eget konstaterande (steg 2).`
    );
  }
  if (!konto_last) anmarkningar.unshift(`målkontot inte läst för ${m} — antalet uppladdade annonser är okänt.`);
  if (kallor_lasta && rader.length > 0 && forvantade === 0) {
    anmarkningar.push(`noll förväntade annonser för ${m} — varje källannons är okänd, odömd eller pausad.`);
  }

  return {
    marknad: m,
    kallor_lasta,
    konto_last,
    per_dom,
    uppe_per_dom,
    forvantade,
    uppladdade: kvar.length,
    traffade,
    saknade,
    overtaliga,
    uteslutna,
    anmarkningar,
    klart:
      kallor_lasta &&
      konto_last &&
      forvantade > 0 &&
      saknade.length === 0 &&
      !overtaliga.some((o) => o.blockerar),
  };
}

// ---------------------------------------------------------------- rapporten

const ETIKETT = {
  [DOMAR.REN]: 'rena',
  [DOMAR.BARA_COPY]: 'bara-copy',
  [DOMAR.OMDUBB]: 'kräver-omdubb',
  [DOMAR.SLUTKORT]: 'slutkortsbygge',
  [DOMAR.OKAND]: 'okänd',
  [DOMAR.ODOMD]: 'odömd',
};

const rad = (etikett, antal, svans) => `  ${String(etikett).padEnd(17)}${String(antal).padStart(3)}  ${svans}`;

/** Räkningsblocket i steg 9:s format, med riktiga tal. */
export function byggBlock(r) {
  const kalla = DOMORDNING.reduce((s, d) => s + r.per_dom[d], 0) + r.uteslutna.length;
  const rader = [`Källannonser:      ${String(kalla).padStart(3)}`];
  for (const d of DOMORDNING) {
    const svans = LADDAS_UPP.includes(d)
      ? `→ ska bli ${r.per_dom[d]} annonser`
      : '→ ska INTE laddas upp';
    rader.push(rad(ETIKETT[d], r.per_dom[d], svans));
  }
  rader.push(rad('uteslutna', r.uteslutna.length, '→ var och en NAMNGIVEN med vad som krävs'));
  rader.push(
    `Uppladdade i kontot: ${r.konto_last ? String(r.uppladdade).padStart(3) : '  ?'}  ← ${
      r.konto_last ? 'läst ur Meta, inte ur minnet' : 'KONTOT INTE LÄST'
    }`
  );
  return rader.join('\n');
}

/**
 * Markdown-rapporten: ett block och en tabell PER MARKNAD, och sist en rad som
 * säger KLART eller DELVIS KLART. "Klart" får bara skrivas när varje marknad är
 * läst och varje källannons antingen ligger uppe eller står namngiven.
 */
export function byggRapport(rakningar, meta = {}) {
  const lista = Array.isArray(rakningar) ? rakningar : Object.values(rakningar ?? {});
  const ut = [];

  ut.push(`# Räkningen${meta.produkt ? ` — ${meta.produkt}` : ''}${meta.datum ? ` · ${meta.datum}` : ''}`);
  ut.push('');
  ut.push(
    `Annonser räknade ur \`act_${meta.konto ?? '<målkonto>'}/ads\` — aldrig ur \`advideos\`/\`adimages\`. ` +
      'Media i kontot är inte en annons.'
  );

  for (const r of lista) {
    ut.push('');
    ut.push(`## ${r.marknad}${r.kallor_lasta ? '' : ' — MARKNADEN INTE LÄST'}`);
    ut.push('');
    ut.push('```');
    ut.push(byggBlock(r));
    ut.push('```');
    ut.push('');
    ut.push('| Dom | Källa | Ska bli | Uppe | Saknas |');
    ut.push('|---|--:|--:|--:|--:|');
    for (const d of DOMORDNING) {
      const skaBli = LADDAS_UPP.includes(d) ? r.per_dom[d] : 0;
      const uppe = r.uppe_per_dom[d];
      const saknas = r.saknade.filter((s) => s.dom === d).length;
      ut.push(`| \`${d}\` | ${r.per_dom[d]} | ${skaBli} | ${uppe} | ${saknas} |`);
    }
    ut.push(
      `| **Summa** | **${DOMORDNING.reduce((s, d) => s + r.per_dom[d], 0)}** | **${r.forvantade}** | **${r.traffade}** | **${r.saknade.length}** |`
    );

    if (r.saknade.length) {
      ut.push('');
      ut.push(
        `### ${r.konto_last ? 'Saknas i kontot' : 'Obekräftade — målkontot inte läst'} — ${r.saknade.length} st, var och en namngiven`
      );
      ut.push('');
      ut.push('| Annons | Dom | Orsak |');
      ut.push('|---|---|---|');
      for (const s of r.saknade) ut.push(`| \`${s.annons}\` | ${s.dom} | ${s.orsak} |`);
    }
    if (r.uteslutna.length) {
      ut.push('');
      ut.push(`### Uteslutna källannonser — ${r.uteslutna.length} st`);
      ut.push('');
      ut.push('| Annons | Dom | Varför |');
      ut.push('|---|---|---|');
      for (const u of r.uteslutna) ut.push(`| \`${u.annons}\` | ${u.dom} | ${u.orsak} |`);
    }
    if (r.overtaliga.length) {
      ut.push('');
      ut.push(`### Övertaliga i kontot — ${r.overtaliga.length} st`);
      ut.push('');
      ut.push('| Annons | Status | Anmärkning |');
      ut.push('|---|---|---|');
      for (const o of r.overtaliga) {
        ut.push(`| \`${o.namn}\` | ${o.status ?? '?'} | ${o.blockerar ? '⛔ ' : ''}${o.orsak} |`);
      }
    }
    if (r.anmarkningar.length) {
      ut.push('');
      for (const a of r.anmarkningar) ut.push(`⚠️ ${a}`);
    }
  }

  const klart = lista.length > 0 && lista.every((r) => r.klart);
  ut.push('');
  ut.push('---');
  ut.push('');
  if (klart) {
    ut.push('**KLART** — varje marknad läst, varje källannons ligger uppe eller står namngiven.');
  } else {
    ut.push('**DELVIS KLART**');
    for (const r of lista) {
      if (r.klart) {
        ut.push(`- ${r.marknad}: klart (${r.traffade} av ${r.forvantade}).`);
        continue;
      }
      const bitar = [];
      if (!r.kallor_lasta) bitar.push('marknaden inte läst');
      // Utan avläst konto finns ingen lista över vad som saknas — bara en
      // lucka. Att räkna upp namn här hade påstått mer än vad som är mätt.
      if (!r.konto_last) bitar.push('målkontot inte läst — ingenting kan bekräftas uppe');
      else if (r.saknade.length) {
        bitar.push(`${r.saknade.length} saknas: ${r.saknade.map((s) => s.annons).join(', ')}`);
      }
      const blockerande = r.overtaliga.filter((o) => o.blockerar);
      if (blockerande.length) {
        bitar.push(`${blockerande.length} ligger uppe som inte får: ${blockerande.map((o) => o.namn).join(', ')}`);
      }
      if (!bitar.length && r.forvantade === 0) bitar.push('noll förväntade annonser — ingenting är bevisat byggt');
      ut.push(`- ${r.marknad}: ${bitar.join(' · ')}.`);
    }
  }
  return ut.join('\n') + '\n';
}

// ---------------------------------------------------------------- indata

/**
 * Väver ihop källorna till en uppsättning per marknad.
 *
 *   brandDetektor  factory/output/<id>/brand-detektor.json ({ kalla, annonser })
 *   kallannonser   factory/output/<id>/kallannonser.json — array med `marknad`,
 *                  eller objektet { SE: { annonser: [] }, NO: … }
 *
 * En marknad som ingen fil nämner blir `null` = INTE LÄST. En marknad som en
 * fil nämner med noll rader blir `[]` = läst, tom.
 *
 * ⚠️ Domen slås upp på EXAKT namn, aldrig på kärnan. En norsk annons får
 * aldrig ärva en svensk systerannons dom: den norska är oläst, och oläst är
 * aldrig ren. (Det var precis så de 13 norska videorna såg "rena" ut.)
 */
export function samlaKallor({ brandDetektor = null, kallannonser = null, kallkonto = null } = {}) {
  const domPerNamn = new Map();
  for (const a of brandDetektor?.annonser ?? []) {
    const n = normaliseraKalla(a);
    if (n.annons) domPerNamn.set(n.annons.toLowerCase(), n);
  }

  const ut = {};
  const lägg = (marknad, rader) => {
    const m = String(marknad).toUpperCase();
    ut[m] = (ut[m] ?? []).concat(rader);
  };

  if (Array.isArray(kallannonser)) {
    const marknader = new Set(kallannonser.map((r) => String(r.marknad ?? '').toUpperCase()).filter(Boolean));
    for (const m of marknader) lägg(m, []);
    for (const r of kallannonser) {
      const m = String(r.marknad ?? '').toUpperCase();
      if (!m) continue;
      lägg(m, [berika(r, domPerNamn)]);
    }
  } else if (kallannonser && typeof kallannonser === 'object') {
    for (const [m, block] of Object.entries(kallannonser)) {
      const rader = Array.isArray(block) ? block : block?.annonser ?? [];
      lägg(m, []);
      lägg(m, rader.map((r) => berika(r, domPerNamn)));
    }
  }

  // Utan kallannonser.json är brand-detektorns egen körning enda källan — och
  // den läser ETT konto. Marknaden hämtas ur det kontots id, aldrig ur en
  // gissning; kan den inte hämtas är ingen marknad läst.
  if (!Object.keys(ut).length) {
    const konto = String(kallkonto ?? brandDetektor?.kalla?.annonskonto ?? '');
    const m = KONTO_MARKNAD[konto];
    if (m && brandDetektor?.annonser) lägg(m, brandDetektor.annonser.map((r) => berika(r, domPerNamn)));
  }
  return ut;
}

function berika(rad, domPerNamn) {
  const n = normaliseraKalla(rad);
  if (n.dom === DOMAR.ODOMD) {
    const träff = domPerNamn.get(n.annons.toLowerCase());
    if (träff && träff.dom !== DOMAR.ODOMD) return { ...n, dom: träff.dom };
  }
  return n;
}

// ---------------------------------------------------------------- målkontot

/** Bär kampanjnamnet marknaden? Kampanjnamnen prefixas med brand OCH marknad
 *  (`TANKGUARD_SE_…`) eftersom alla OPS-butiker delar ett konto. Koden måste
 *  stå som eget fält — annars matchar `NO` inuti "Nordic" och SE-annonser
 *  räknas som norska. */
export function matcharMarknad(kampanjnamn, marknad) {
  const m = String(marknad ?? '').trim();
  if (!m) return false;
  const mönster = new RegExp(`(^|[_\\s|(\\-/])${m}([_\\s|)\\-/]|$)`, 'i');
  return mönster.test(String(kampanjnamn ?? ''));
}

/**
 * Ren filtrering av kontots annonser: brandprefix i ANNONSNAMNET och marknaden
 * i KAMPANJNAMNET. Målkontot är inte tomt — Bäverbutikens danska kampanjer
 * ligger i samma konto — så båda villkoren behövs.
 *
 * Returnerar även `utan_marknad`: annonser med rätt brand vars kampanjnamn inte
 * bär någon marknad alls. De hör till ingen räkning och måste synas, annars
 * försvinner de tyst.
 */
export function filtreraUppladdade(annonser, brandprefix, marknad) {
  const prefix = String(brandprefix ?? '').toLowerCase();
  const allaRader = (annonser ?? []).map(normaliseraUppladdad);
  const mitt = allaRader.filter((a) => !prefix || a.namn.toLowerCase().startsWith(prefix));
  const kända = [...new Set([...Object.keys(KONTON), ...[...MARKNADSKODER].map((m) => m.toUpperCase())])];
  return {
    traffar: mitt
      .filter((a) => matcharMarknad(a.kampanj, marknad))
      .map((a) => ({ ...a, marknad: String(marknad).toUpperCase() })),
    utan_marknad: mitt.filter((a) => !kända.some((m) => matcharMarknad(a.kampanj, m))),
    frammande: allaRader.length - mitt.length,
  };
}

/** Alla annonser i målkontot med butikens brandprefix. Läser `act_<id>/ads` —
 *  ALDRIG advideos/adimages: media i kontot är inte en annons.
 *  Graph-anropen går genom tools/meta-lib.mjs. */
export async function hamtaKontoAnnonser(kontoId, brandprefix) {
  const { alla } = await import('../tools/meta-lib.mjs');
  const rader = await alla(`act_${kontoId}/ads`, {
    fields: 'id,name,status,effective_status,campaign{id,name}',
    filtering: JSON.stringify([{ field: 'ad.name', operator: 'CONTAIN', value: String(brandprefix) }]),
  });
  return rader.map((a) => ({
    id: a.id,
    namn: a.name,
    kampanj: a.campaign?.name ?? '',
    status: a.status ?? a.effective_status ?? null,
  }));
}

/** Kontots annonser för EN marknad. Marknaderna hålls åtskilda hela vägen:
 *  SE-annonser mot SE-kampanjen, NO mot NO. */
export async function hamtaUppladdade(kontoId, brandprefix, marknad) {
  const rader = await hamtaKontoAnnonser(kontoId, brandprefix);
  return filtreraUppladdade(rader, brandprefix, marknad).traffar;
}

// ---------------------------------------------------------------- CLI

function läsJson(sökväg) {
  return existsSync(sökväg) ? JSON.parse(readFileSync(sökväg, 'utf8')) : null;
}

async function kör() {
  const arg = process.argv.slice(2);
  const butikId = arg.find((a) => !a.startsWith('--'));
  const torr = arg.includes('--torr');
  const iM = arg.indexOf('--marknad');
  const valdMarknad = iM >= 0 && arg[iM + 1] && !arg[iM + 1].startsWith('--') ? arg[iM + 1].toUpperCase() : null;
  if (!butikId) {
    console.error('Ange butiks-id: node factory/rakning.mjs <butik-id> [--marknad SE|NO] [--torr]');
    process.exit(1);
  }

  const produktfil = hittaProduktfil(butikId);
  if (!produktfil) {
    console.error(`✗ Hittar inte factory/produkter/${butikId}.yaml — stoppar. Leta aldrig upp butiken på gissning.`);
    process.exit(1);
  }
  const p = lasYaml(readFileSync(produktfil, 'utf8'));
  const konto = String(p.meta?.ad_account_id ?? '');
  const brandprefix = String(p.meta?.creative_prefix ?? '');
  if (!konto || !brandprefix) {
    console.error('✗ produktfilen saknar meta.ad_account_id eller meta.creative_prefix — stoppar.');
    process.exit(1);
  }
  if (konto !== MALKONTO.id) {
    console.error(`✗ meta.ad_account_id är ${konto}, målkontot är ${MALKONTO.id} (${MALKONTO.namn}). Stoppar.`);
    process.exit(1);
  }

  const utMapp = join(ROT, 'output', butikId);
  const brandDetektor = läsJson(join(utMapp, 'brand-detektor.json'));
  const kallannonser = läsJson(join(utMapp, 'kallannonser.json'));
  if (!brandDetektor && !kallannonser) {
    console.error(`✗ Varken brand-detektor.json eller kallannonser.json finns i factory/output/${butikId}/.`);
    console.error('  Kör factory/kallannonser.mjs och factory/brand-detektor.mjs först — räkningen gissar aldrig.');
    process.exit(1);
  }

  const perMarknad = samlaKallor({
    brandDetektor,
    kallannonser,
    kallkonto: p.kalla?.annonskonto ?? brandDetektor?.kalla?.annonskonto,
  });
  const marknader = valdMarknad ? [valdMarknad] : Object.keys(KONTON);

  console.log(`Räkningen — ${butikId} · brandprefix ${brandprefix}_ · målkonto ${konto} (${MALKONTO.namn})`);
  console.log(`Marknader: ${marknader.join(', ')}${torr ? ' · TORRKÖRNING (kontot läses inte)' : ''}\n`);

  let kontoRader = null;
  if (!torr) {
    const { säkerställProxy } = await import('../tools/meta-lib.mjs');
    säkerställProxy();
    if (!process.env.META_ACCESS_TOKEN) {
      console.error('✗ META_ACCESS_TOKEN saknas i miljön — kontot går inte att läsa, och en oläst räkning är aldrig klar.');
      process.exit(1);
    }
    kontoRader = await hamtaKontoAnnonser(konto, brandprefix);
    console.log(`Läste ${kontoRader.length} annonser i act_${konto} med prefixet ${brandprefix}\n`);
  }

  const rakningar = [];
  for (const m of marknader) {
    let uppladdade = null;
    if (kontoRader) {
      const { traffar, utan_marknad } = filtreraUppladdade(kontoRader, brandprefix, m);
      uppladdade = traffar;
      if (utan_marknad.length) {
        console.log(
          `⚠️ ${utan_marknad.length} annons(er) med brandprefixet ligger i en kampanj utan marknad i namnet: ` +
            utan_marknad.map((a) => `${a.namn} (${a.kampanj || 'ingen kampanj'})`).join(', ')
        );
      }
    }
    rakningar.push(byggRakning({ kallor: perMarknad[m] ?? null, uppladdade, marknad: m }));
  }

  const md = byggRapport(rakningar, {
    produkt: butikId,
    konto,
    datum: new Date().toISOString().slice(0, 10),
  });
  console.log(md);

  if (!torr) {
    mkdirSync(utMapp, { recursive: true });
    writeFileSync(join(utMapp, 'rakningen.md'), md);
    console.log(`✓ factory/output/${butikId}/rakningen.md`);
  } else {
    console.log('(torrkörning — ingen fil skriven, och en torrkörning är aldrig KLART)');
  }

  // Exit 1 så en körning inte kan sluta grönt av misstag. Torrkörningen har
  // inte läst kontot och är därför per definition inte klar.
  process.exit(rakningar.length && rakningar.every((r) => r.klart) ? 0 : 1);
}

if (process.argv[1] && process.argv[1].endsWith('rakning.mjs')) {
  laddaEnv();
  await kör();
}
