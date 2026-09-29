// Jämför flödena i Spoks (get_flow-svar ur sessionsloggarna) med planen som
// klaviyo/spoks-sprak.mjs byggde: samma stegordning, samma väntetider, samma
// landsfilter på varje sändsteg, en post bakom varje sändsteg, och ingenting
// påslaget (flöde, trigger, sändsteg) — det är Axels klick.
//
//   node klaviyo/spoks/sprak-floden-koll.mjs --logg <a.jsonl> [--logg …] [--brand matstrumpor]
//
// Exit 1 vid avvikelse eller när ett flöde i planen saknar get_flow-svar.

import fs from 'node:fs';
import path from 'node:path';

const HAR = path.dirname(new URL(import.meta.url).pathname);
const ROT = path.resolve(HAR, '..', '..');

// Spoks sparar is/nis med value "null" och lägger ordningen på fälten fritt.
export function normFilter(f) {
  if (!f) return null;
  if (f.type === 'conjunction') return { op: f.operator, f: f.filters.map(normFilter) };
  const ut = { field: f.field, op: f.operator };
  if (!['is', 'nis'].includes(f.operator)) ut.value = f.value;
  return ut;
}

export function lasFloden(fil) {
  const anv = new Map();
  const ut = new Map();
  for (const rad of fs.readFileSync(fil, 'utf8').split('\n')) {
    if (!rad) continue;
    let j;
    try { j = JSON.parse(rad); } catch { continue; }
    for (const c of j?.message?.content ?? []) {
      if (c.type === 'tool_use') anv.set(c.id, String(c.name));
      if (c.type !== 'tool_result' || anv.get(c.tool_use_id) !== 'mcp__Spoks__get_flow') continue;
      const text = typeof c.content === 'string' ? c.content : (c.content || []).map((x) => x.text || '').join('');
      try { const f = JSON.parse(text); if (f?.id) ut.set(f.id, f); } catch { /* inget flöde */ }
    }
  }
  return ut;
}

export function jamforFlode(spoks, plan) {
  const brister = [];
  if (spoks.isActive) brister.push('flödet är PÅ');
  if (spoks.trigger?.isActive) brister.push('triggern är PÅ');
  if (spoks.name !== plan.namn) brister.push(`namn "${spoks.name}" ≠ "${plan.namn}"`);
  if (spoks.trigger?.eventName !== plan.create.trigger.event) brister.push(`trigger ${spoks.trigger?.eventName} ≠ ${plan.create.trigger.event}`);
  if (JSON.stringify(normFilter(spoks.trigger?.filter)) !== JSON.stringify(normFilter(plan.create.trigger.filter))) brister.push('triggerns kontaktfilter avviker');
  if (JSON.stringify(normFilter(spoks.trigger?.triggerFilter)) !== JSON.stringify(normFilter(plan.create.trigger.triggerFilter ?? null))) brister.push('triggerns produktfilter avviker');
  if ((spoks.allowReenrolmentAfter ?? null) !== (plan.create.allowReenrolmentAfter ?? null)) brister.push(`återinträde ${spoks.allowReenrolmentAfter} ≠ ${plan.create.allowReenrolmentAfter}`);
  const s = [...(spoks.steps ?? [])].sort((a, b) => a.index - b.index);
  if (s.length !== plan.steg.length) brister.push(`${s.length} steg i Spoks, ${plan.steg.length} i planen`);
  for (let i = 0; i < Math.min(s.length, plan.steg.length); i++) {
    const a = s[i];
    const b = plan.steg[i];
    if (b.typ === 'delay') {
      if (a.type !== 'delay') { brister.push(`steg ${i}: ${a.type}, planen väntan`); continue; }
      if (a.parameters?.delay !== b.delay) brister.push(`steg ${i}: väntan ${a.parameters?.delay} ≠ ${b.delay}`);
    } else {
      if (a.type !== 'publish_flow_post_to_contact') { brister.push(`steg ${i}: ${a.type}, planen sändsteg ${b.sprak}`); continue; }
      if (!a.parameters?.postId) brister.push(`steg ${i} (${b.sprak}): ingen post`);
      if (a.parameters?.isEnabled) brister.push(`steg ${i} (${b.sprak}): sändsteget är PÅ`);
      if (JSON.stringify(normFilter(a.parameters?.filter)) !== JSON.stringify(normFilter(b.filter))) brister.push(`steg ${i} (${b.sprak} ${b.mejl_id}): landsfiltret avviker`);
    }
  }
  return brister;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const loggar = process.argv.flatMap((a, i, alla) => (alla[i - 1] === '--logg' ? [a] : []));
  const bi = process.argv.indexOf('--brand');
  const brandId = bi >= 0 ? process.argv[bi + 1] : 'matstrumpor';
  const plan = JSON.parse(fs.readFileSync(path.join(ROT, 'klaviyo', 'output', brandId, 'spoks', 'sprak', 'PLAN.json'), 'utf8'));
  const logg = fs.readFileSync(path.join(ROT, 'klaviyo', 'konto', brandId, 'spoks-sprak-uppladdat.jsonl'), 'utf8').split('\n').filter(Boolean).map((r) => JSON.parse(r));
  const idFor = Object.fromEntries(logg.filter((r) => r.typ === 'flode').map((r) => [r.flode, r.flowId]));
  const svar = new Map();
  for (const l of loggar) for (const [id, f] of lasFloden(l)) svar.set(id, f);
  let fel = 0;
  for (const f of plan.floden) {
    const s = svar.get(idFor[f.id]);
    if (!s) { console.log(`❌ ${f.id}: inget get_flow-svar i loggarna (${idFor[f.id] ?? 'id saknas i uppladdningsloggen'})`); fel++; continue; }
    const b = jamforFlode(s, f);
    const sand = f.steg.filter((x) => x.typ === 'send').length;
    if (b.length) { fel++; console.log(`❌ ${f.id}\n   - ${b.join('\n   - ')}`); } else console.log(`✅ ${f.id}: ${s.steps.length} steg, ${sand} sändsteg med post, allt av`);
  }
  process.exit(fel ? 1 : 0);
}
