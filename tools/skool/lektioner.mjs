// Hämtar lektioners text (och videolänk/resurser) till markdown i .state/lektioner/.
//   node tools/skool/lektioner.mjs lista.txt     rader: "<kurs-id> <lektions-id> <kortnamn>", # = kommentar
import fs from 'node:fs';
import path from 'node:path';
import { öppna, nextData, hittaNod, descTillMd, GRUPP, STATE_MAPP } from './lib.mjs';

const listfil = process.argv[2];
if (!listfil) { console.error('ange en listfil'); process.exit(2); }
const rader = fs.readFileSync(listfil, 'utf8').split('\n').map(r => r.trim()).filter(r => r && !r.startsWith('#'));
const UT = path.join(STATE_MAPP, 'lektioner'); fs.mkdirSync(UT, { recursive: true });

const s = await öppna();
for (const rad of rader) {
  const [kursId, lektionId, ...rest] = rad.split(/\s+/);
  const kort = rest.join('-') || lektionId;
  const url = `https://www.skool.com/${GRUPP}/classroom/${kursId}?md=${lektionId}`;
  try {
    await s.page.goto(url, { waitUntil: 'domcontentloaded' });
    await s.page.waitForTimeout(2500);
    const pp = (await nextData(s.page)).props.pageProps;
    const nod = hittaNod(pp.course, lektionId);
    const cn = nod ? (nod.course || nod) : null;
    const md = cn?.metadata || {};
    const text = descTillMd(md.desc);
    let resurser = [];
    try { resurser = typeof md.resources === 'string' ? JSON.parse(md.resources) : (md.resources || []); } catch { /* lämna tom */ }
    const ut = [`# ${md.title || cn?.name || lektionId}`, `Källa: ${url}`, `Video-id: ${md.videoId || md.videoLink || '-'}`, ''];
    if (resurser.length) { ut.push('## Resurser'); for (const r of resurser) ut.push(`- ${JSON.stringify(r).slice(0, 300)}`); ut.push(''); }
    ut.push(text);
    fs.writeFileSync(path.join(UT, `${kort}.md`), ut.join('\n'));
    console.log(`${kort}: ${md.title || cn?.name} | ${text.length} tecken text | video ${md.videoId ? 'ja' : '-'}`);
  } catch (e) {
    console.log(`${kort}: FEL ${e.message.slice(0, 140)}`);
  }
}
await s.stäng();
