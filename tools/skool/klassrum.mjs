// Läser klassrummets kurser, eller ett kurs-id:s hela modul/lektionsträd.
//   node tools/skool/klassrum.mjs            → alla kurser (id + titel)
//   node tools/skool/klassrum.mjs <kurs-id>  → trädet, sparat i .state/kurs-<id>.json
import fs from 'node:fs';
import path from 'node:path';
import { öppna, nextData, GRUPP, STATE_MAPP } from './lib.mjs';

const kursId = process.argv[2];
const s = await öppna();
await s.page.goto(`https://www.skool.com/${GRUPP}/classroom${kursId ? '/' + kursId : ''}`, { waitUntil: 'domcontentloaded' });
await s.page.waitForTimeout(3000);
const pp = (await nextData(s.page)).props.pageProps;
await s.stäng();

if (!kursId) {
  // c.name är det korta id:t som står i adressen (classroom/<name>); c.id är det långa interna.
  for (const c of pp.allCourses || []) console.log(`${c.name}  ${c.metadata?.title}  (${c.metadata?.numModules ?? '?'} lektioner)`);
  process.exit(0);
}
const ut = path.join(STATE_MAPP, `kurs-${kursId}.json`);
fs.writeFileSync(ut, JSON.stringify(pp.course, null, 1));
function träd(n, djup = 0) {
  const cn = n.course || n, md = cn.metadata || {}, barn = n.children || [];
  console.log('  '.repeat(djup) + `- ${md.title || cn.name}  [${cn.id}]` + (barn.length ? ` (${barn.length})` : ''));
  for (const k of barn) träd(k, djup + 1);
}
träd(pp.course);
console.log('\nsparat:', ut);
