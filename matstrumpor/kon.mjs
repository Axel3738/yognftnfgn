// kon.mjs — Matstrumpors uppladdningskö: Notion-rader i "To be Reviewed" →
// en plan med ETT adset per rad.
//
// Läsningen återanvänder tools/notion-kalla.mjs (samma filhämtning som
// /notionkorning: bilaga i "Filer och media", indraget mediablock, eller
// Drive-mapp i sidans kropp). Skillnaden är att HÄR läses BARA Matstrumpors
// egen hub — aldrig "alla databaser integrationen ser".
//
// Routingen går på NAMNET, inte på filändelsen (namn.mjs → adsetNyckel):
//
//   vinkel `jul` + videoformat  → jul_video     broad_advplus_purchase_jul_video
//   vinkel `jul` + bildformat   → jul_bild      broad_advplus_purchase_jul_bilder
//   annars video                → video         broad_advplus_purchase_nya16
//   annars bild                 → bild          broad_advplus_purchase_bilder
//
// En rad som inte går att routa laddas ALDRIG upp på gissning — den hamnar i
// `stoppade` med skälet utskrivet. Tyst fel är värre än ett rapporterat.

import { klaraRader } from '../tools/notion-kalla.mjs';
import { adsetNyckel, tolka, mediatyp } from './namn.mjs';

export const STOPPSKAL = {
  NAMN: 'namnet följer inte mönstret — går inte att routa till ett adset',
  FORMAT: 'formatet i namnet är varken video eller bild i konfigen',
  FIL: 'ingen fil: varken bilaga, mediablock eller Drive-länk på raden',
  ADSET: 'adsetet finns inte i kontot än',
  PRIS: 'priset i annonsen avviker mer än 20 % från butikens pris',
  LANDNING: 'landningssidan pekar på en annan butik',
};

/** Ren kärna: rader in → plan ut. Testbar utan nät. */
export function planera(rader, konfig, { adsetIdn = null, prisavvikelse = () => null } = {}) {
  const adsets = adsetIdn ?? Object.fromEntries(Object.entries(konfig.meta.adsets).map(([k, v]) => [k, v.id]));
  const klara = [];
  const stoppade = [];

  for (const rad of rader) {
    const skal = [];
    const nyckel = adsetNyckel(rad.namn, konfig);
    const tolkat = tolka(rad.namn);

    if (!tolkat) skal.push(STOPPSKAL.NAMN);
    else if (!nyckel) skal.push(STOPPSKAL.FORMAT);
    if (rad.leverans === 'saknas') skal.push(STOPPSKAL.FIL);

    const avvikelse = prisavvikelse(rad);
    if (avvikelse !== null && avvikelse !== undefined && Math.abs(avvikelse) > 0.2) {
      skal.push(`${STOPPSKAL.PRIS} (${(avvikelse * 100).toFixed(0)} %)`);
    }
    if (rad.landning && !String(rad.landning).includes('matstrumpor.se')) {
      skal.push(`${STOPPSKAL.LANDNING}: ${rad.landning}`);
    }

    if (skal.length) {
      // En rad som BARA saknar namn men har en fil är inte trasig — den är
      // odöpt. Redigerarna döper sina rader "022", "023" … (mätt 2026-09-15 på
      // Gilz fyra videor), och då är namngivningen uppladdarens jobb, inte ett
      // fel att rapportera. Sessionen tittar på filen, väljer vinkel och format,
      // döper raden och kör om. Allt annat är ett riktigt stopp.
      const baraNamn = skal.length === 1 && (skal[0] === STOPPSKAL.NAMN || skal[0] === STOPPSKAL.FORMAT);
      stoppade.push({ ...rad, adset_nyckel: nyckel, skal, behover_namn: baraNamn && rad.leverans !== 'saknas' });
      continue;
    }

    const adsetId = adsets[nyckel] ?? null;
    klara.push({
      id: rad.id,
      namn: rad.namn,
      url: rad.url,
      leverans: rad.leverans,
      mediatyp: mediatyp(tolkat, konfig),
      vinkel: tolkat.vinkel,
      jul: tolkat.vinkel === 'jul',
      adset_nyckel: nyckel,
      adset_id: adsetId,
      adset_namn: konfig.meta.adsets[nyckel].namn,
      adset_maste_skapas: !adsetId,
      landning: rad.landning ?? konfig.meta.landningssida,
      filer: rad.filer,
      media: rad.media,
      drive: rad.drive,
    });
  }

  klara.sort((a, b) => a.adset_nyckel.localeCompare(b.adset_nyckel) || a.namn.localeCompare(b.namn));
  return {
    klara,
    stoppade,
    behover_namn: stoppade.filter((s) => s.behover_namn),
    per_adset: gruppera(klara),
    adsets_att_skapa: [...new Set(klara.filter((k) => k.adset_maste_skapas).map((k) => k.adset_nyckel))],
  };
}

export function gruppera(klara) {
  const ut = {};
  for (const k of klara) (ut[k.adset_nyckel] ??= []).push(k.namn);
  return ut;
}

/** Läser Matstrumpors hub och planerar. Kräver NOTION_TOKEN. */
export async function hamtaKo(konfig, val = {}) {
  const hub = { id: konfig.notion.hub_id, titel: konfig.notion.hub_namn };
  const rader = await klaraRader(hub, { statusar: [konfig.notion.ko_status.toLowerCase()], ...val });
  return { rader, plan: planera(rader, konfig, val) };
}
