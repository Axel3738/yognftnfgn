// nob.mjs — B-kampanjens annonser (NOB.json) härledda ur A-kampanjens (NO.json).
//
//   node matstrumpor/marknader/annonser/nob.mjs          # skriver NOB.json och visar skillnaden
//   node matstrumpor/marknader/annonser/bygg.mjs --marknad NOB --skarpt   # sedan: upp i kontot, PAUSED
//
// A/B-testet i Norge (Axel 2026-09-29): A = MATSTRUMP_NO_SALES (svenskt varumärke, matstrumpor.se/nb),
// B = MATSTRUMP_NOB_SALES (matstrumpor.no, norska B-sidan). För att testet ska mäta EN sak är allt annat
// lika: samma video eller bild (video_fran/bild_fran — Meta-id:t återanvänds, ingen ny uppladdning), samma
// rubrik och länkbeskrivning, samma brödtext UTOM varumärkesraden "Et svensk merke." som tas bort.
// Länken sätts av bygg.mjs ur marknader.json (NOB.lank = matstrumpor.no). Kör om varje gång NO.json får
// en ny annons — NOB ska alltid bära exakt A:s annonser.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROT = dirname(fileURLToPath(import.meta.url));
export const VARUMARKESRAD = 'Et svensk merke.';

/** Ren: en A-annons → B-annonsen. */
export function tillB(a) {
  const rader = a.message.split('\n');
  if (rader[rader.length - 1].trim() !== VARUMARKESRAD) throw new Error(`${a.namn}: sista raden är inte "${VARUMARKESRAD}" — kan inte härleda B`);
  const b = {
    namn: a.namn.replace(/^MATSTRUMP_NO_/, 'MATSTRUMP_NOB_'),
    kalla: `B-versionen av ${a.namn} (A/B-testet i Norge): samma ${a.bild ? 'bild' : 'video'}, utan "${VARUMARKESRAD}", länk matstrumpor.no`,
    ...(a.bild ? { bild_fran: a.namn } : { video_fran: a.namn }),
    title: a.title,
    message: rader.slice(0, -1).join('\n'),
    link_description: a.link_description,
  };
  if (b.namn === a.namn) throw new Error(`${a.namn}: namnet börjar inte med MATSTRUMP_NO_`);
  return b;
}

export function byggNob(no) {
  return {
    _om: "B-kampanjen MATSTRUMP_NOB_SALES i A/B-testet i Norge (2026-09-29). Härledd ur NO.json av nob.mjs — ändra NO.json och kör om, redigera aldrig den här filen för hand. Enda skillnaderna mot A: raden 'Et svensk merke.' finns inte, och länken går till matstrumpor.no (marknader.json → NOB).",
    instagram_user_id: no.instagram_user_id,
    annonser: no.annonser.map(tillB),
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const no = JSON.parse(readFileSync(join(ROT, 'NO.json'), 'utf8'));
  const nob = byggNob(no);
  writeFileSync(join(ROT, 'NOB.json'), JSON.stringify(nob, null, 1) + '\n');
  for (const b of nob.annonser) console.log(`${b.namn} ← ${b.video_fran ?? b.bild_fran}`);
  console.log(`NOB.json: ${nob.annonser.length} annonser (A har ${no.annonser.length})`);
}
