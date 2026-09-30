// kolla-srt.mjs — maskinell kontroll av en lokaliserad SRT mot HeyGens (2026-09-28).
//   node kolla-srt.mjs <KOD> <video> [fil]    # t.ex. DE sofie_h1; fil = en annan SRT än srt-fixed/ (t.ex. ett utkast)
//   node kolla-srt.mjs --alla                  # varje srt-fixed som finns
// Exit 1 om något FEL. VARNING stoppar inte (längd per block).
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { kollaSprak, sprakfamilj, heygenSprakFor, srtText } from '../../../pipeline/sprak.mjs';

// Batchmappen (en undermapp per marknad med srt-orig/ och srt-fixed/): HEYGEN_BATCH eller skriptets egen mapp.
const H = process.env.HEYGEN_BATCH || dirname(fileURLToPath(import.meta.url));

function block(srt) {
  return String(srt).replace(/\r/g, '').trim().split(/\n\s*\n/).map((b) => {
    const r = b.split('\n');
    return { nr: r[0].trim(), tid: (r[1] ?? '').trim(), text: r.slice(2).join(' ').trim() };
  });
}

// Förbjudet i talet: butiksnamn/domän, belopp och valuta, tankstreck, Sverige/svensk på alla språk.
const FORBJUDET = [
  [/matstrump/i, 'butiksnamnet'], [/\w\.se\b|\b(punkt|dot|punto|ponto|kropka|point|piste) se\b/i, 'domänen'],
  [/\b(kr|kronor|kroner|sek|nok|dkk|eur|euro|euros|usd|dollar|dollars|złotych|zł|pln)\b/i, 'valuta/belopp'],
  [/[€$£%&\/]/, 'symbol'], [/[–—]/, 'tankstreck'], [/\d/, 'siffra (ska skrivas som ord)'],
  [/sverige|svensk|sweden|swedish|schwed|suède|suédois|zweed|zweeds|suecia|sueco|svezia|svedese|szwecj|szwedzk|suécia|sueco|ruotsi|sverige|svensk/i, 'Sverige/svensk'],
  [/\b(gratis frakt|fri frakt|free shipping|kostenlos|livraison|verzending|envío|spedizione|dostawa|envio)\b/i, 'fraktlöfte'],
  [/\b(garanti|guarantee|garantie|garantía|garanzia|gwarancj|garantia)\b/i, 'garanti'],
  // Japanska och kinesiska (2026-09-30): tal skrivs med kanji (十、五), aldrig siffror — inte heller
  // helbreddssiffror; valuta, symboler, butiksnamnet i katakana, Sverige/Norden, frakt och garanti.
  [/[０-９]/u, 'siffra (ska skrivas med kanji: 十、五)'], [/[％＆／＄￥¥]/u, 'symbol'], [/[―－]/u, 'tankstreck'],
  [/円|日圓|日幣|台幣|新台幣|美元|克朗|クローナ|ドル|[一二三四五六七八九十百千萬两兩]元/u, 'valuta/belopp'],
  [/マット.{0,3}ス.{0,2}ト|エスイー|ドットエス/u, 'butiksnamnet/domänen'],
  [/スウェーデン|瑞典|北欧|北歐|スカンジナビア|斯堪地那維亞/u, 'Sverige/svensk'],
  [/送料無料|無料配送|免運|免費運送|包郵|保証|保固|保證/u, 'fraktlöfte/garanti'],
  // Talet fyra låter som "död" (し/死) och undviks i presentreklam i Japan och Taiwan (2026-09-30).
  [/四/u, 'talet fyra (undviks i presenter i Japan och Taiwan)'],
];
// Svenska ord som inte får stå kvar (utom där de också är målspråkets ord).
const SVENSKA = { alla: ['strumpor', 'låda', 'lådan', 'ätpinnar', 'kalaset', 'julstrumpan', 'jättebra', 'också', 'verkligen', 'faktiskt', 'riktig', 'riktigt', 'paketerade', 'sushistrumpor', 'priset'] };

export function kolla(kod, video, fil) {
  const orig = join(H, kod, 'srt-orig', `matstrumpor_${video}.srt`);
  const fixad = fil || join(H, kod, 'srt-fixed', `matstrumpor_${video}.srt`);
  const fel = [], varningar = [];
  if (!existsSync(orig)) return { kod, video, fel: [`HeyGens SRT saknas: ${orig}`], varningar };
  if (!existsSync(fixad)) return { kod, video, fel: [`lokaliserad SRT saknas: ${fixad}`], varningar };
  const ra = readFileSync(fixad, 'utf8');
  const a = block(readFileSync(orig, 'utf8')), b = block(ra);
  if (a.length !== b.length) fel.push(`blockantal ${b.length}, HeyGen har ${a.length}`);
  let sverigeJp = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i].nr !== b[i].nr) fel.push(`block ${i + 1}: nummer "${b[i].nr}" ≠ "${a[i].nr}"`);
    if (a[i].tid !== b[i].tid) fel.push(`block ${i + 1}: tidskod "${b[i].tid}" ≠ "${a[i].tid}"`);
    if (!b[i].text) fel.push(`block ${i + 1}: tom text`);
    for (const [re, vad] of FORBJUDET) {
      const m = re.exec(b[i].text);
      if (!m) continue;
      // Japan (Axel 2026-09-30: "i Japan speciellt kan vi trycka på att det är ett svenskt varumärke"):
      // スウェーデン får stå EN gång per video — "i Sverige sålde de slut", "ett varumärke från Sverige" —
      // aldrig スウェーデン製 (varumärket är svenskt, strumporna är inte tillverkade där).
      if (kod === 'JP' && vad === 'Sverige/svensk' && m[0] === 'スウェーデン' && !/スウェーデン製/.test(b[i].text)) { sverigeJp++; continue; }
      fel.push(`block ${i + 1}: ${vad} ("${m[0]}")`);
    }
    const ord = b[i].text.toLowerCase().match(/[\p{L}]+/gu) ?? [];
    const kvar = ord.filter((o) => SVENSKA.alla.includes(o));
    if (kvar.length && !['NO', 'DK'].includes(kod)) fel.push(`block ${i + 1}: svenska ord kvar (${kvar.join(', ')})`);
    else if (kvar.some((o) => ['strumpor', 'låda', 'lådan', 'ätpinnar', 'sushistrumpor', 'kalaset', 'julstrumpan'].includes(o))) fel.push(`block ${i + 1}: svenska ord kvar (${kvar.join(', ')})`);
    const kvot = b[i].text.length / Math.max(1, a[i].text.length);
    if (kvot > 1.35 || kvot < 0.65) varningar.push(`block ${i + 1}: längd ${b[i].text.length} tecken mot HeyGens ${a[i].text.length} (${Math.round(kvot * 100)} %)`);
  }
  if (sverigeJp > 1) fel.push(`スウェーデン står ${sverigeJp} gånger — högst en gång per video`);
  const fam = sprakfamilj(heygenSprakFor(kod));
  const k = kollaSprak(srtText(ra), fam);
  if (k.ok === false) fel.push(`språkkollen: ${k.skal}`);
  if (!ra.endsWith('\n')) varningar.push('ingen avslutande radbrytning');
  return { kod, video, fel, varningar, sprak: k.ok };
}

const arg = process.argv.slice(2);
let res = [];
if (arg[0] === '--alla') {
  for (const kod of readdirSync(H).filter((d) => /^[A-Z]{2}$/.test(d))) {
    const dir = join(H, kod, 'srt-fixed');
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((f) => /^matstrumpor_.*\.srt$/.test(f))) res.push(kolla(kod, f.replace(/^matstrumpor_|\.srt$/g, '')));
  }
} else if (arg.length === 2 || arg.length === 3) res.push(kolla(arg[0].toUpperCase(), arg[1], arg[2]));
else { console.error('node kolla-srt.mjs <KOD> <video> [fil] | --alla'); process.exit(2); }
let rott = 0;
for (const r of res) {
  console.log(`${r.fel.length ? '❌' : '✅'} ${r.kod} ${r.video}${r.fel.length ? ' FEL: ' + r.fel.join(' | ') : ''}${r.varningar.length ? ' · varning: ' + r.varningar.join(' | ') : ''}`);
  if (r.fel.length) rott++;
}
process.exit(rott ? 1 : 0);
