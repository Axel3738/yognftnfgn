// srt-block.mjs — flytta en GODKÄND lokaliserad SRT till en ny HeyGen-sessions block, utan att
// skriva om texten (byggt 2026-09-28, Matstrumpors byte från speed- till precision-läget).
//
//   node pipeline/srt-block.mjs justera <godkänd.srt> <nya-block.srt> <ut.srt>
//     Går bara när varje nytt block är en hel följd av godkända block (samma start som det
//     första, samma slut som det sista). Texterna fogas ihop med mellanslag. Faller en ny
//     gräns mitt i ett godkänt block går det inte mekaniskt: exit 3 och ingen fil — då
//     fördelar en agent texten på de nya blocken (och `jamfor` kontrollerar den).
//   node pipeline/srt-block.mjs jamfor <godkänd.srt> <ny.srt>
//     Jämför TEXTEN ord för ord oavsett blockindelning. Exit 0 = samma ord i samma ordning.
//
// Varför: HeyGen delar upp talet olika i olika sessioner och lägen (mätt 2026-09-28 på
// Matstrumpors precision-sessioner: de flesta hade andra gränser än speed-sessionen för samma
// video). En godkänd text i fel block läses upp i fel tidsfönster, så texten måste följa
// sessionens egna block.
import { readFileSync, writeFileSync } from 'node:fs';

export const block = (srt) => String(srt).replace(/\r/g, '').trim().split(/\n\s*\n/).map((b) => {
  const r = b.split('\n');
  const [a, e] = (r[1] ?? '').split(' --> ').map((x) => x.trim());
  return { a, e, text: r.slice(2).join(' ').trim() };
});

export function justera(godkand, nya) {
  const g = block(godkand), p = block(nya);
  const ut = []; let i = 0;
  for (const pb of p) {
    // Tidskoderna har fast format (HH:MM:SS,mmm), så strängjämförelse är tidsjämförelse.
    if (i >= g.length || g[i].a !== pb.a) return { ok: false, skal: `blocket ${pb.a} --> ${pb.e} börjar inte där ett godkänt block börjar (${g[i]?.a ?? 'slut'})` };
    const delar = [];
    while (i < g.length && g[i].e <= pb.e) { delar.push(g[i].text); i++; if (g[i - 1].e === pb.e) break; }
    if (!delar.length || g[i - 1].e !== pb.e) return { ok: false, skal: `blocket ${pb.a} --> ${pb.e} slutar inte där ett godkänt block slutar` };
    ut.push({ ...pb, text: delar.join(' ') });
  }
  if (i !== g.length) return { ok: false, skal: `${g.length - i} godkända block blev över` };
  return { ok: true, srt: ut.map((b, n) => `${n + 1}\n${b.a} --> ${b.e}\n${b.text}\n`).join('\n') };
}

const ord = (srt) => block(srt).map((b) => b.text).join(' ').split(/\s+/).filter(Boolean);

/** Ordskillnaderna mellan två SRT:ers text (LCS). Tom lista = samma ord i samma ordning. */
export function jamfor(a, b) {
  const x = ord(a), y = ord(b), n = x.length, m = y.length;
  const d = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) d[i][j] = x[i] === y[j] ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]);
  const ut = []; let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && x[i] === y[j]) { i++; j++; continue; }
    const bort = [], till = [], fore = x.slice(Math.max(0, i - 4), i).join(' ');
    while ((i < n || j < m) && !(i < n && j < m && x[i] === y[j])) {
      if (j >= m || (i < n && d[i + 1][j] >= d[i][j + 1])) bort.push(x[i++]); else till.push(y[j++]);
    }
    ut.push({ bort: bort.join(' '), till: till.join(' '), efter: fore });
  }
  return ut;
}

if (process.argv[1]?.endsWith('srt-block.mjs')) {
  const [cmd, a, b, utfil] = process.argv.slice(2);
  if (cmd === 'justera' && utfil) {
    const r = justera(readFileSync(a, 'utf8'), readFileSync(b, 'utf8'));
    if (!r.ok) { console.error(`✗ ${r.skal}`); process.exit(3); }
    writeFileSync(utfil, r.srt); console.log(`✓ ${utfil}`);
  } else if (cmd === 'jamfor' && b) {
    const s = jamfor(readFileSync(a, 'utf8'), readFileSync(b, 'utf8'));
    if (!s.length) { console.log(`IDENTISK: ${ord(readFileSync(a, 'utf8')).length} ord i samma ordning`); process.exit(0); }
    console.log(`SKILLNADER (${s.length}):`);
    for (const d of s) console.log(`  − ${d.bort || '∅'}\n  + ${d.till || '∅'}   (efter: "${d.efter}")`);
    process.exit(3);
  } else { console.error('node pipeline/srt-block.mjs justera <godkänd.srt> <nya-block.srt> <ut.srt> | jamfor <a.srt> <b.srt>'); process.exit(2); }
}
