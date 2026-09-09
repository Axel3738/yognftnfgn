// Skriver konfigfilerna till pipeline/no-precis.py för de norska TankGuard-videorna.
//
//   node factory/captionbyte-no.mjs            # skriver np-no-<id>.json för varje färdig SRT
//
// Captionspåret måste bytas i samma sväng som talet dubbas om. Görs bara det
// ena säger rösten en sak och den inbrända texten en annan — och det är värre
// än att inte ha gjort något alls.
//
// Zonen är mätt på de norska källvideorna 2026-09-09: pillret sitter med
// mitten kring y=912 i 720×1280, alltså samma band som de svenska.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';

const S = '/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad';
const SRT = `${S}/srt-fixad-no`;
const IN = `${S}/dubbad-no`;
const UT = `${S}/no-klar`;
for (const d of [UT, `${S}/qa-no-precis`]) if (!existsSync(d)) mkdirSync(d, { recursive: true });

const CAPTIONS = { zon: [860, 960], max_chars: 32, font_px: 30, standard_cy: 912, pad_x: 8, pad_y: 6 };

if (!existsSync(SRT)) { console.log(`Ingen ${SRT} ännu — kör factory/srt-fixa.mjs --marknad=no först.`); process.exit(0); }

let n = 0;
for (const f of readdirSync(SRT).filter((x) => x.endsWith('.srt'))) {
  const id = f.replace(/\.srt$/, '');
  const inFil = `${IN}/${id}.mp4`;
  if (!existsSync(inFil)) { console.log(`↩︎ ${id}: ingen omdubbad fil ännu`); continue; }
  const konfig = {
    in: inFil,
    ut: `${UT}/${id}.mp4`,
    srt: `${SRT}/${f}`,
    captions: CAPTIONS,
    qa: `${S}/qa-no-precis`,
  };
  writeFileSync(`${S}/np-no-${id}.json`, JSON.stringify(konfig, null, 2));
  console.log(`✅ np-no-${id}.json`);
  n++;
}
console.log(`\n${n} konfigfiler skrivna.`);
