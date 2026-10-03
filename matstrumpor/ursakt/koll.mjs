// Kontrollerar maskinellt att det som ligger i Spoks är exakt planen, utan att läsa med ögat.
// Spoks egna svar (draft_campaign, update_draft_campaign, get_campaign) läses ur Claude
// Code-sessionens logg; det senaste svaret per post vinner. Förväntat innehåll kommer ur
// output/plan.json (byggd av bygg.mjs).
//
//   node matstrumpor/ursakt/koll.mjs              # kampanjerna + flödesmejlen som loggen har svar på
//   --logg <fil.jsonl>                            # annan logg (standard: senast ändrade i ~/.claude/projects/*/)
//
// Exit 1 om något avviker eller saknas.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const HAR = path.dirname(new URL(import.meta.url).pathname);
const arg = (n) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : null; };

function senasteLogg() {
  const rot = path.join(os.homedir(), '.claude', 'projects');
  const filer = fs.readdirSync(rot).flatMap((d) => {
    const p = path.join(rot, d);
    return fs.statSync(p).isDirectory() ? fs.readdirSync(p).filter((f) => f.endsWith('.jsonl')).map((f) => path.join(p, f)) : [];
  });
  return filer.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
}

// Det mottagaren ser, i jämförbar form.
export const synligt = (blocks) => blocks.map((b) => ({ type: b.type, text: b.text ?? null, url: b.url ?? null }));

export function svarIlogg(text) {
  const ut = new Map();
  for (const rad of text.split('\n')) {
    if (!rad.includes('tool_result')) continue;
    let j;
    try { j = JSON.parse(rad); } catch { continue; }
    for (const c of j.message?.content ?? []) {
      if (c.type !== 'tool_result') continue;
      const s = typeof c.content === 'string' ? c.content : (c.content ?? []).map((x) => x.text ?? '').join('');
      let v;
      try { v = JSON.parse(s); } catch { continue; }
      const k = v?.campaign ?? (v?.blocks && v?.title ? v : null);
      if (k?.title) ut.set(k.title, k);
    }
  }
  return ut;
}

export function jamfor(plan, svar) {
  const fel = [];
  let ok = 0;
  const forvantat = [
    ...plan.kampanjer.map((k) => k.postData),
    ...plan.flode.steg.filter((s) => s.postData).map((s) => s.postData),
  ];
  for (const pd of forvantat) {
    const s = svar.get(pd.title);
    if (!s) { fel.push(`${pd.title}: inget Spoks-svar i loggen`); continue; }
    const a = JSON.stringify(synligt(pd.blocks));
    const b = JSON.stringify(synligt(s.blocks ?? []));
    if (a !== b) fel.push(`${pd.title}: blocken avviker`);
    for (const f of ['emailTitle', 'emailDescription']) {
      if (pd.customizedNotification[f] !== s.customizedNotification?.[f]) fel.push(`${pd.title}: ${f} avviker`);
    }
    // Flödesmejl står som published i kanalen automatedFlow (Spoks egen form, mätt 2026-10-03);
    // det som stoppar dem är att sändsteget och flödet är av, och det läser get_flow.
    const flodesmejl = s.channel === 'automatedFlow';
    if (!flodesmejl && s.status && s.status !== 'draft') fel.push(`${pd.title}: status ${s.status}, inte draft`);
    if (!fel.some((x) => x.startsWith(pd.title))) ok += 1;
  }
  return { ok, fel, totalt: forvantat.length };
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const plan = JSON.parse(fs.readFileSync(path.join(HAR, 'output', 'plan.json'), 'utf8'));
  const logg = arg('--logg') ?? senasteLogg();
  const r = jamfor(plan, svarIlogg(fs.readFileSync(logg, 'utf8')));
  console.log(`${r.ok} av ${r.totalt} lika med planen (logg ${path.basename(logg)})`);
  if (r.fel.length) { console.log(r.fel.map((f) => `  ❌ ${f}`).join('\n')); process.exit(1); }
}
