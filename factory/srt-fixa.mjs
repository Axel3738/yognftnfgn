// Bygger rättade SRT:er. HeyGens timings styr; våra repliker fördelas över dem
// efter hur lång tid varje cue faktiskt har. Rör inga krediter.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
const S = '/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad';
const UT = `${S}/srt-fixad`;
if (!existsSync(UT)) mkdirSync(UT, { recursive: true });
const manus = JSON.parse(readFileSync('/home/user/yognftnfgn/factory/output/tankguard/se-videomanus.json', 'utf8')).manus;

const läsSrt = (t) => t.replace(/\r/g, '').trim().split(/\n{2,}/).map(b => {
  const r = b.split('\n');
  return { nr: r[0].trim(), tid: r[1], text: r.slice(2).join(' ').trim() };
}).filter(c => c.tid?.includes('-->'));
const skrivSrt = (c) => c.map(x => `${x.nr}\n${x.tid}\n${x.text}`).join('\n\n') + '\n';
const sek = (s) => { const [h, m, r] = s.split(':'); const [ss, ms] = r.split(','); return +h * 3600 + +m * 60 + +ss + +ms / 1000; };
const längd = (tid) => { const [a, b] = tid.split('-->').map(x => x.trim()); return Math.max(0.3, sek(b) - sek(a)); };

/** Fördelar repliker över cues så att varje cue får text i proportion till sin tid.
 *  Ordningen bevaras alltid — en replik hamnar aldrig före en tidigare replik. */
function fördela(repliker, cues) {
  const tot = cues.reduce((s, c) => s + längd(c.tid), 0);
  const totTecken = repliker.join(' ').length;
  const kvot = cues.map(c => (längd(c.tid) / tot) * totTecken);
  const ut = cues.map(() => []);
  let i = 0, budget = kvot[0], använt = 0;
  for (const r of repliker) {
    if (använt > 0 && använt + r.length > budget * 1.45 && i < cues.length - 1) {
      i++; budget = kvot[i]; använt = 0;
    }
    ut[i].push(r); använt += r.length + 1;
  }
  // Ingen cue får bli tom — låna från grannen.
  for (let j = 0; j < ut.length; j++) {
    if (ut[j].length) continue;
    const giv = ut.slice(0, j).reverse().find(x => x.length > 1) || ut.slice(j + 1).find(x => x.length > 1);
    if (giv) ut[j].push(giv.pop());
  }
  return ut.map(x => x.join(' ').trim());
}

// Encoding-vakt. Ett dubbelkodat manus ("Ã¶" i stället för "ö") ger HeyGen
// obegripligt tal — och det syns inte förrän någon lyssnar. Stoppa här i stället.
for (const [id, m] of Object.entries(manus)) {
  const text = JSON.stringify(m);
  if (/Ã[\u0080-\u00bf]/.test(text)) {
    throw new Error(`Manuset för ${id} är dubbelkodat (mojibake). Läs om det som UTF-8 innan något renderas.`);
  }
}

const rapport = [];
for (const [id, m] of Object.entries(manus)) {
  const fil = `${S}/proof/TankGuard_${id}-translated.srt`;
  if (!existsSync(fil)) { rapport.push({ id, status: 'VÄNTAR' }); continue; }
  const cues = läsSrt(readFileSync(fil, 'utf8'));

  if (m.typ === 'replikbyte') {
    let bytta = 0;
    for (const c of cues) {
      if (/b[aä]v[eo]r?\w*butiken/i.test(c.text)) { c.text = c.text.replace(/[Bb][aä]v[eo]r?\w*butiken/g, 'TankGuard'); bytta++; }
    }
    if (bytta) writeFileSync(`${UT}/${id}.srt`, skrivSrt(cues));
    rapport.push({ id, status: bytta ? 'KLAR' : 'INGEN TRÄFF', cues: cues.length, bytta, metod: 'replikbyte' });
    continue;
  }

  const nya = m.repliker || [];
  const metod = nya.length === cues.length ? 'ett-till-ett' : `fördelad (${nya.length}→${cues.length})`;
  const texter = nya.length === cues.length ? nya : fördela(nya, cues);
  const tomma = texter.filter(t => !t).length;
  cues.forEach((c, i) => { c.text = texter[i]; });
  writeFileSync(`${UT}/${id}.srt`, skrivSrt(cues));
  rapport.push({ id, status: tomma ? 'TOM CUE' : 'KLAR', cues: cues.length, repliker: nya.length, metod });
}

console.log('id'.padEnd(12) + 'status'.padEnd(14) + 'cues'.padEnd(6) + 'metod');
for (const r of rapport) console.log(`${r.id.padEnd(12)}${r.status.padEnd(14)}${String(r.cues ?? '-').padEnd(6)}${r.metod || ''}`);
writeFileSync(`${S}/srtrapport.json`, JSON.stringify(rapport, null, 2));

// Kontroll: inget förbjudet kvar i någon fixad SRT.
// 18 % och 25 % är TankGuards RIKTIGA paketrabatter och får stå — men bara när
// paketnivån nämns i samma mening. En lös procentsats är källbutikens.
const FÖRBJUDET = /b[aä]v[eo]r?\w*butiken|636|ordinarie|halva priset|23 ?%|bara idag|lagret krymper|innan det är slut|tusentals|så många trädgårdsägare|kunderna älskar/i;
const LÖS_PROCENT = /(\d{1,2})\s?%/g;
console.log('\nKONTROLL av de fixade SRT:erna:');
for (const r of rapport.filter(x => x.status === 'KLAR')) {
  const t = readFileSync(`${UT}/${r.id}.srt`, 'utf8');
  const träff = t.match(new RegExp(FÖRBJUDET.source, 'gi')) || [];
  // Varje procentsats måste bära sin paketnivå i samma mening.
  for (const mening of t.split(/[.!?\n]/)) {
    for (const p of mening.match(LÖS_PROCENT) || []) {
      // ⚠️ JS \b är ASCII-baserat: \btvå\b matchar ALDRIG, för å är inget \w.
      if (!/(^|[^\p{L}])(tv[åa]|tre|2|3)([^\p{L}]|$)/iu.test(mening)) träff.push(`${p} utan paketnivå`);
    }
  }
  console.log(`  ${träff.length ? '❌' : '✅'} ${r.id}${träff.length ? '  → ' + [...new Set(träff)].join(', ') : ''}`);
}
