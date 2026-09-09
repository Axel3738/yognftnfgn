// Bygger rättade SRT:er. HeyGens timings styr; våra repliker fördelas över dem
// efter hur lång tid varje cue faktiskt har. Rör inga krediter.
//
//   node factory/srt-fixa.mjs            # Sverige (default)
//   node factory/srt-fixa.mjs --marknad=no
//
// Marknaderna skiljer sig på tre punkter: vilket manus som läses, var HeyGens
// proofread-SRT:er ligger, och vad som är förbjudet i texten. Norge har INGET
// känt NOK-pris, så där är varje pris och varje procentsats förbjuden — i
// Sverige får TankGuards riktiga paketrabatter (18 %, 25 %) stå kvar när
// paketnivån nämns i samma mening.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
const S = '/tmp/claude-0/-home-user-yognftnfgn/ff667879-d253-581e-87c9-68230f965fb7/scratchpad';

const MARKNAD = (process.argv.find((a) => a.startsWith('--marknad=')) || '--marknad=se').split('=')[1].toLowerCase();
const MARKNADER = {
  se: {
    manusfil: '/home/user/yognftnfgn/factory/output/tankguard/se-videomanus.json',
    proof: `${S}/proof`, prefix: 'TankGuard_', ut: `${S}/srt-fixad`,
    // 18 % och 25 % är TankGuards RIKTIGA paketrabatter och får stå — men bara
    // när paketnivån nämns i samma mening. En lös procentsats är källbutikens.
    förbjudet: /b[aä]v[eo]r?\w*butiken|636|ordinarie|halva priset|23 ?%|bara idag|lagret krymper|innan det är slut|tusentals|så många trädgårdsägare|kunderna älskar/i,
    // Vad ett `replikbyte` byter ut mot varumärkesnamnet.
    brandord: /[Bb][aä]v[eo]r?\w*butiken/g,
    procentKräverPaket: true,
  },
  no: {
    manusfil: '/home/user/yognftnfgn/factory/output/tankguard/no-videomanus.json',
    proof: `${S}/proof-no`, prefix: 'TankGuardNO_', ut: `${S}/srt-fixad-no`,
    förbjudet: /b[aäe]v[eo]r?[\s-]?butik\w*|586|439|ordinær|kampanjepris|tilbudspris|halve prisen|bare i dag|lageret|så lenge lageret|tusenvis|kundene elsker|rabatt|kroner|\bkr\b/i,
    // Norska källvideorna säger "Bever-butikken" och "Beverbutikken" — och en
    // av dem "BB butikken". Bindestrecket och mellanslaget måste med, annars
    // går brandet igenom replikbytet oförändrat.
    brandord: /[Bb][aäe]v[eo]r?[\s-]?butikken|\bBB[\s-]?butikken\b/g,
    procentKräverPaket: false,   // i Norge är varje procentsats förbjuden
  },
};
const M = MARKNADER[MARKNAD];
if (!M) throw new Error(`Okänd marknad "${MARKNAD}" — välj se eller no.`);
const UT = M.ut;
if (!existsSync(UT)) mkdirSync(UT, { recursive: true });
const manus = JSON.parse(readFileSync(M.manusfil, 'utf8')).manus;

const läsSrt = (t) => t.replace(/\r/g, '').trim().split(/\n{2,}/).map(b => {
  const r = b.split('\n');
  return { nr: r[0].trim(), tid: r[1], text: r.slice(2).join(' ').trim() };
}).filter(c => c.tid?.includes('-->'));
const skrivSrt = (c) => c.map(x => `${x.nr}\n${x.tid}\n${x.text}`).join('\n\n') + '\n';
const sek = (s) => { const [h, m, r] = s.split(':'); const [ss, ms] = r.split(','); return +h * 3600 + +m * 60 + +ss + +ms / 1000; };
const längd = (tid) => { const [a, b] = tid.split('-->').map(x => x.trim()); return Math.max(0.3, sek(b) - sek(a)); };

/** Fördelar repliker över cues så att varje cue får text i proportion till sin tid.
 *  Ordningen bevaras alltid — en replik hamnar aldrig före en tidigare replik.
 *
 *  ⚠️ Den tidigare versionen fyllde tomma cues genom att `pop()`:a från en
 *  FÖREGÅENDE cue, en åt gången. Två tomma cues i rad plockade då de två sista
 *  replikerna i omvänd ordning: videon slutade "TankGuard. Bestill nå." och
 *  sedan CTA:n, i stället för tvärtom. Nu kan en cue aldrig bli tom — bytet
 *  tvingas fram så fort antalet återstående repliker är lika med antalet
 *  återstående cues. */
function fördela(repliker, cues) {
  const n = cues.length;
  if (repliker.length < n) {
    throw new Error(`Färre repliker (${repliker.length}) än cues (${n}) — då blir en cue tom och HeyGen tappar taltiden. Skriv fler repliker.`);
  }
  const tot = cues.reduce((s, c) => s + längd(c.tid), 0);
  const totTecken = repliker.join(' ').length;
  const kvot = cues.map(c => (längd(c.tid) / tot) * totTecken);
  const ut = cues.map(() => []);
  let i = 0, använt = 0;
  for (let r = 0; r < repliker.length; r++) {
    const kvar = repliker.length - r;   // repliker kvar, inklusive denna
    const cuerKvar = n - i;             // cues kvar, inklusive den vi står i
    const budgetFull = använt > 0 && använt + repliker[r].length > kvot[i] * 1.45;
    // Byt cue om budgeten är full OCH det finns repliker nog kvar att fylla
    // resten — eller när det är exakt en replik kvar per återstående cue.
    if (i < n - 1 && använt > 0 && ((budgetFull && kvar > cuerKvar - 1) || kvar === cuerKvar)) {
      i++; använt = 0;
    }
    ut[i].push(repliker[r]); använt += repliker[r].length + 1;
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
  const fil = `${M.proof}/${M.prefix}${id}-translated.srt`;
  if (!existsSync(fil)) { rapport.push({ id, status: 'VÄNTAR' }); continue; }
  const cues = läsSrt(readFileSync(fil, 'utf8'));

  if (m.typ === 'replikbyte') {
    let bytta = 0;
    for (const c of cues) {
      if (M.brandord.test(c.text)) { M.brandord.lastIndex = 0; c.text = c.text.replace(M.brandord, 'TankGuard'); bytta++; }
      M.brandord.lastIndex = 0;
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
writeFileSync(`${S}/srtrapport-${MARKNAD}.json`, JSON.stringify(rapport, null, 2));

// Kontroll: inget förbjudet kvar i någon fixad SRT.
const FÖRBJUDET = M.förbjudet;
const LÖS_PROCENT = /(\d{1,2})\s?%/g;
// Talet skrivs ut i bokstäver i tal-SRT:er — "fire hundre og trettini kroner"
// slinker förbi en siffergrind. Norge har inget NOK-pris alls, så varje
// prisord är förbjudet oavsett hur det stavas.
// ⚠️ "to hundre og ti D Oxford" är TYGET, inte ett pris. Grinden får därför
// inte slå på "hundre og" i sig — bara på de faktiska prisorden, och på ett
// skrivet tal som bär "kroner" i samma mening.
const SKRIVNA_TAL_NO = /\b(femhundre|firehundre|åttiseks|trettini|prosent)\b|\b(hundre|tusen)\b[^.!?\n]{0,40}\bkroner\b/i;
console.log(`\nKONTROLL av de fixade SRT:erna (${MARKNAD.toUpperCase()}):`);
let fel = 0;
for (const r of rapport.filter(x => x.status === 'KLAR')) {
  // ⚠️ Läs BARA replikraderna. Tidkoderna innehåller siffror — "00:00:07,439"
  // ser ut som det norska källpriset 439 för en grind som läser hela filen.
  const t = läsSrt(readFileSync(`${UT}/${r.id}.srt`, 'utf8')).map(c => c.text).join('\n');
  const träff = t.match(new RegExp(FÖRBJUDET.source, 'gi')) || [];
  if (MARKNAD === 'no' && SKRIVNA_TAL_NO.test(t)) träff.push('pris utskrivet i bokstäver');
  for (const mening of t.split(/[.!?\n]/)) {
    for (const p of mening.match(LÖS_PROCENT) || []) {
      if (!M.procentKräverPaket) { träff.push(`${p} (procent förbjuden på denna marknad)`); continue; }
      // ⚠️ JS \b är ASCII-baserat: \btvå\b matchar ALDRIG, för å är inget \w.
      if (!/(^|[^\p{L}])(tv[åa]|tre|2|3)([^\p{L}]|$)/iu.test(mening)) träff.push(`${p} utan paketnivå`);
    }
  }
  if (träff.length) fel++;
  console.log(`  ${träff.length ? '❌' : '✅'} ${r.id}${träff.length ? '  → ' + [...new Set(träff)].join(', ') : ''}`);
}
if (fel) {
  console.log(`\n⛔ ${fel} SRT bär förbjuden text. Rätta manuset — rendera inget förrän raden är ren.`);
  process.exitCode = 1;
}
