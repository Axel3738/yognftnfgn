// Skriver ut cue-budgeten för en videos manus: EN replik per cue, med det
// teckenantal den cuen faktiskt har tid för.
//
//   node factory/cuebudget.mjs <marknad> [id ...]
//
// Varför den finns: HeyGen respekterar varje cues tidsfönster. Får en cue mer
// text än källan hade där läses den upp snabbare, och nästa, som fick mindre,
// dras ut. Rösten jojjar. Ett manus måste därför skrivas MOT cue-listan —
// aldrig som en fri text som sedan fördelas.
//
// Budgeten är källcuens egen teckenlängd. Taket är +15 %, golvet −25 %:
// kortare går bra (rösten pausar), längre gör att den rusar.
import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';

const S = '/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad';
const MARKNADER = {
  se: { proof: `${S}/proof`, prefix: 'TankGuard_' },
  se2: { proof: `${S}/proof-se2`, prefix: 'TankGuard2_' },
  se3: { proof: `${S}/proof-se3`, prefix: 'TankGuard3_' },
  se4: { proof: `${S}/proof-se4`, prefix: 'TankGuard4_' },
  no: { proof: `${S}/proof-no`, prefix: 'TankGuardNO_' },
  no2: { proof: `${S}/proof-no2`, prefix: 'TankGuardNO2_' },
};

const marknad = (process.argv[2] || 'se').toLowerCase();
const M = MARKNADER[marknad];
if (!M) throw new Error(`Okänd marknad "${marknad}" — välj ${Object.keys(MARKNADER).join(', ')}.`);
const valda = process.argv.slice(3);

const läsSrt = (t) => t.replace(/\r/g, '').trim().split(/\n{2,}/).map((b) => {
  const r = b.split('\n');
  return { nr: r[0].trim(), tid: r[1], text: r.slice(2).join(' ').trim() };
}).filter((c) => c.tid?.includes('-->'));
const sek = (s) => { const [h, m, r] = s.split(':'); const [ss, ms] = r.split(','); return +h * 3600 + +m * 60 + +ss + +ms / 1000; };
const längd = (tid) => { const [a, b] = tid.split('-->').map((x) => x.trim()); return Math.max(0.1, sek(b) - sek(a)); };

const filer = readdirSync(M.proof).filter((f) => f.endsWith('-translated.srt'));
const ut = {};
const rader = [];
for (const f of filer) {
  const id = f.replace(M.prefix, '').replace('-translated.srt', '');
  if (valda.length && !valda.includes(id)) continue;
  const cues = läsSrt(readFileSync(`${M.proof}/${f}`, 'utf8'));
  rader.push(`### ${id} — ${cues.length} repliker, en per cue`);
  ut[id] = cues.map((c, i) => {
    const tak = Math.round(c.text.length * 1.15);
    const golv = Math.max(6, Math.round(c.text.length * 0.75));
    rader.push(`  ${String(i + 1).padStart(2)}  ${längd(c.tid).toFixed(2)}s  ${golv}–${tak} tecken   NU: "${c.text}"`);
    return { nr: i + 1, sek: +längd(c.tid).toFixed(2), golv, tak, kalla: c.text };
  });
  rader.push('');
}
console.log(rader.join('\n'));
writeFileSync(`${S}/cuebudget-${marknad}.json`, JSON.stringify(ut, null, 1));
console.log(`Skrivet: ${S}/cuebudget-${marknad}.json (${Object.keys(ut).length} videor)`);
