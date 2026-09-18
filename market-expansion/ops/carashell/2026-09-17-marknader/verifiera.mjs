#!/usr/bin/env node
// verifiera.mjs — läser tillbaka ALLA annonser i de åtta kampanjerna ur Meta och dömer
// varje enskild: har den marknadens pris, är alla amerikanska spår borta, och är länken,
// statusen, adsetet och namnet oförändrade?
//
//   node verifiera.mjs            → skriver rakningen.md och exit 0 bara om allt stämmer
//
// Facit är butikens priser i marknader.mjs (avlästa som kund i varje land) och
// jobbets egen lista över vilka creatives som bär priset inbränt (bildregioner.json,
// manus.json). En annons som inte gick att läsa räknas som FEL, aldrig som grön.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { säkerställProxy, alla } from '../../../../tools/meta-lib.mjs';
import { MARKNADER, KAMPANJER, kvarUS } from './marknader.mjs';

säkerställProxy();
const HAR = dirname(fileURLToPath(import.meta.url));
const regioner = JSON.parse(readFileSync(join(HAR, 'bildregioner.json'), 'utf8'));
const manus = JSON.parse(readFileSync(join(HAR, 'manus.json'), 'utf8'));
const NYTT_MEDIA = new Set([...Object.keys(regioner), ...Object.keys(manus)].filter((k) => !k.startsWith('_')));
const media = JSON.parse(readFileSync(join(HAR, 'media-uppladdat.json'), 'utf8'));
const fore = JSON.parse(readFileSync(join(HAR, 'unika.json'), 'utf8'));
const foreLank = new Map();
const byte = JSON.parse(readFileSync(join(HAR, 'resultat-byte.json'), 'utf8'));

const lankUr = (s) => s?.link_data?.link || s?.link_data?.call_to_action?.value?.link || s?.video_data?.call_to_action?.value?.link || null;
const rader = [];

for (const [kid, kinfo] of Object.entries(KAMPANJER)) {
  const m = MARKNADER[kinfo.marknad];
  let annonser;
  try {
    annonser = await alla(`${kid}/ads`, { fields: 'id,name,status,effective_status,adset_id,issues_info,creative{id,object_story_spec}' }, 50);
  } catch (e) {
    rader.push({ kampanj: kinfo.namn, marknad: kinfo.marknad, namn: '(hela kampanjen)', ok: false, skal: `kunde inte läsas: ${e.message}` });
    continue;
  }
  for (const a of annonser) {
    const s = a.creative?.object_story_spec ?? {};
    const typ = s.video_data ? 'video' : 'bild';
    const text = [s.link_data?.message ?? s.video_data?.message, s.link_data?.name ?? s.video_data?.title,
      s.link_data?.description ?? s.video_data?.link_description].filter(Boolean).join('\n');
    const fel = [];
    // 1. marknadens pris ska finnas i texten
    if (!text.includes(m.pris)) fel.push(`priset ${m.pris} saknas i copyn`);
    // 2. inga amerikanska spår kvar
    const kvar = kvarUS(text, kinfo.marknad);
    if (kvar.length) fel.push(`US-spår kvar: ${[...new Set(kvar)].join(' ')}`);
    // 3. länken oförändrad mot vad bytet läste före
    const b = byte[kid]?.[a.name];
    const lank = lankUr(s);
    if (b?.lank_fore && lank !== b.lank_fore) fel.push(`länken ändrad: ${b.lank_fore} → ${lank}`);
    if (!lank) fel.push('ingen landningslänk');
    // 4. status/adset/namn oförändrade
    if (b && b.status_fore && b.status_fore !== a.status) fel.push(`status ändrad: ${b.status_fore} → ${a.status}`);
    if (b && b.adset_fore && b.adset_fore !== a.adset_id) fel.push(`adset ändrat`);
    // 5. nytt media där priset var inbränt
    if (NYTT_MEDIA.has(a.name)) {
      const mk = media[`${kinfo.marknad}/${a.name}`];
      if (!mk) fel.push('nytt media saknas i media-uppladdat.json');
      else if (typ === 'bild' && s.link_data?.image_hash !== mk.hash) fel.push(`bilden är inte marknadens (${s.link_data?.image_hash} ≠ ${mk.hash})`);
      else if (typ === 'video' && s.video_data?.video_id !== mk.videoId) fel.push(`videon är inte marknadens (${s.video_data?.video_id} ≠ ${mk.videoId})`);
    }
    // 6. Meta-invändningar
    const issues = (a.issues_info || []).map((i) => i.error_summary || i.error_code).filter(Boolean);
    rader.push({
      kampanj: kinfo.namn, marknad: kinfo.marknad, namn: a.name, typ, ad_id: a.id,
      status: `${a.status}/${a.effective_status}`, lank: lank, nytt_media: NYTT_MEDIA.has(a.name),
      issues, ok: fel.length === 0, skal: fel.join('; ') || null,
    });
  }
}

const ok = rader.filter((r) => r.ok);
const fel = rader.filter((r) => !r.ok);
const perMarknad = {};
for (const r of rader) { perMarknad[r.marknad] = perMarknad[r.marknad] ?? { ok: 0, fel: 0 }; perMarknad[r.marknad][r.ok ? 'ok' : 'fel'] += 1; }

const md = [
  `# Räkningen — taköverdraget i Magiborsten UK, fyra marknader (${new Date().toISOString().slice(0, 10)})`, '',
  `Läst tillbaka ur Meta, annons för annons. Facit: butikens priser avlästa som kund i varje land.`, '',
  '| Marknad | Pris | Jämförpris | Annonser rätt | Fel |', '|---|---|---|---|---|',
  ...Object.entries(MARKNADER).map(([k, m]) => `| ${k} | ${m.pris} | ${m.jamforpris} | ${perMarknad[k]?.ok ?? 0} | ${perMarknad[k]?.fel ?? 0} |`),
  '', `**${ok.length} av ${rader.length} annonser bär marknadens pris, utan amerikanska spår, med länk och status orörda.**`, '',
  fel.length ? `## ${fel.length} som INTE stämmer\n\n${fel.map((r) => `- \`${r.namn}\` i ${r.kampanj}: ${r.skal}`).join('\n')}` : '## Inga avvikelser.',
  '', '## Per kampanj', '', '| Kampanj | Marknad | Annonser | Rätt | Med nytt media | Meta-invändningar |', '|---|---|---|---|---|---|',
  ...Object.values(KAMPANJER).map((k) => {
    const r = rader.filter((x) => x.kampanj === k.namn);
    return `| ${k.namn} | ${k.marknad} | ${r.length} | ${r.filter((x) => x.ok).length} | ${r.filter((x) => x.nytt_media).length} | ${r.filter((x) => x.issues.length).length} |`;
  }),
  '', '## Länkarna (ska vara exakt de ursprungliga)', '',
  ...[...new Set(rader.map((r) => r.lank))].filter(Boolean).sort().map((l) => `- ${l}`),
];
writeFileSync(join(HAR, 'rakningen.md'), md.join('\n') + '\n');
writeFileSync(join(HAR, 'verifiering.json'), JSON.stringify(rader, null, 2));
console.log(md.join('\n'));
process.exit(fel.length ? 1 : 0);
