// Skriver konfigfilerna till pipeline/no-precis.py för TankGuards omdubbade videor.
//
//   node factory/captionbyte.mjs <marknad>
//
// Captionspåret måste bytas i samma sväng som talet dubbas om. Görs bara det
// ena säger rösten en sak och den inbrända texten en annan — och det är värre
// än att inte ha gjort något alls.
//
// ⚠️ Captionbandet sitter INTE på samma höjd i alla creatives. De norska
// PD/GT/SP/CS-videorna har pillret kring y=912 i 720×1280; de två svenska
// videor som tillkom senare (SP_3_H1, CS_4_H1) har det kring y=971. Mät per
// uppsättning — en gissad zon suddar fel rad eller ingen alls.
//
// ⚠️ `pad_x` styr hur långt UTANFÖR den hittade texten suddrutan går, och
// no-precis.py letar bara i x 120–600. Med pad_x 8 stod första bokstavens
// stapel kvar som ett svart streck i vänsterkanten. 22 täcker hela pillret.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';

const S = '/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad';
const MARKNAD = (process.argv[2] || 'no').toLowerCase();

const ZONER = {
  no:  { zon: [860, 960],  standard_cy: 912 },
  no2: { zon: [860, 960],  standard_cy: 912 },
  se:  { zon: [860, 960],  standard_cy: 908 },
  se2: { zon: [900, 1040], standard_cy: 971 },
  se3: { zon: [860, 960],  standard_cy: 908 },
  se4: { zon: [860, 960],  standard_cy: 908 },
};

// ⚠️ En uppsättning kan blanda creatives med olika layout. CS_4_H1 kom till
// senare och har captionbandet 60 px längre ner än de andra åtta i se4.
// En zon per marknad räcker inte — mät per video när de inte är byggda lika.
const PER_VIDEO = {
  'se4:CS_4_H1': { zon: [900, 1040], standard_cy: 971 },
};

// Statiska PNG-lager som ska ligga kvar oavsett omdubb. CS_4_H1 bär ett andra
// inbränt piller mitt i bilden som captionbytet aldrig rör.
const LAGER = {
  'se4:CS_4_H1': [{ png: `${S}/lager-CS_4_H1.png`, t: [0, 7.45] }],
};
const z = ZONER[MARKNAD];
if (!z) throw new Error(`Ingen uppmätt captionzon för "${MARKNAD}" — mät den innan du kör.`);

const SRT = `${S}/srt-fixad-${MARKNAD}`;
const IN = `${S}/dubbad-${MARKNAD}`;
const UT = `${S}/klar-${MARKNAD}`;
for (const d of [UT, `${S}/qa-${MARKNAD}`]) if (!existsSync(d)) mkdirSync(d, { recursive: true });

if (!existsSync(SRT)) { console.log(`Ingen ${SRT} — kör factory/srt-fixa.mjs --marknad=${MARKNAD} först.`); process.exit(0); }

let n = 0;
for (const f of readdirSync(SRT).filter((x) => x.endsWith('.srt'))) {
  const id = f.replace(/\.srt$/, '');
  const inFil = `${IN}/${id}.mp4`;
  if (!existsSync(inFil)) { console.log(`↩︎ ${id}: ingen omdubbad fil ännu`); continue; }
  const zon = PER_VIDEO[`${MARKNAD}:${id}`] || z;
  const konfig = {
    in: inFil,
    ut: `${UT}/${id}.mp4`,
    srt: `${SRT}/${f}`,
    captions: { ...zon, max_chars: 32, font_px: 30, pad_x: 22, pad_y: 8 },
    qa: `${S}/qa-${MARKNAD}`,
  };
  const lager = LAGER[`${MARKNAD}:${id}`];
  if (lager) konfig.lager = lager;
  writeFileSync(`${S}/np-${MARKNAD}-${id}.json`, JSON.stringify(konfig, null, 2));
  console.log(`✅ np-${MARKNAD}-${id}.json`);
  n++;
}
console.log(`\n${n} konfigfiler skrivna för ${MARKNAD.toUpperCase()}.`);
