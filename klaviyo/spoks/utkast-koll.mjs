// Kontrollerar att kampanjutkasten i Spoks är exakt det payloaden säger, utan att en enda rad
// skrivs av för hand. Spoks egna svar (get_campaign, draft_campaign, update_draft_campaign,
// update_draft_campaign_blocks) läses ur Claude Code-sessionens logg, och det förväntade
// innehållet byggs ur plan.json + payload/: samma postData som skickas vid uppladdningen.
//
//   node klaviyo/spoks/utkast-koll.mjs                  # alla kampanjer som loggen har Spoks-svar på
//   node klaviyo/spoks/utkast-koll.mjs k02 k24          # bara de här (saknat svar = fel)
//   node klaviyo/spoks/utkast-koll.mjs --postdata k02 --ut <mapp>   # postData att skicka, en fil per kampanj
//   --logg <fil.jsonl>   annan logg (standard: den senast ändrade i ~/.claude/projects/*/)
//   --brand <id>         standard baverbutiken
//
// Varför (2026-09-29): 25 utkast uppdaterades för hand genom MCP:n och ett ord tappade en
// bokstav på vägen (K07 "terängen" i stället för "terrängen"). Ögat hittade det av en slump.
// Spoks svar visar inte produktkortens knapptexter, så de jämförs mot det som skickades i samma
// logg. Titeln följer uppladdningens form: "K07 · tis 20/10 18:00 · till: <segment> · <ämnesrad>".
// Exit 1 vid avvikelse, eller när en efterfrågad kampanj saknar svar i loggen.

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const HAR = path.dirname(new URL(import.meta.url).pathname);
const ROT = path.resolve(HAR, '..', '..');
const DAG = ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'];

export function byggPostData(plan, payloadMapp, kort) {
  const k = plan.kampanjer.find((x) => x.id.startsWith(`${kort}-`));
  if (!k) throw new Error(`${kort} saknas i plan.json`);
  const p = JSON.parse(fs.readFileSync(path.join(payloadMapp, `${k.mejl}.json`), 'utf8'));
  const datum = k.planerad.slice(0, 10);
  const dag = `${DAG[new Date(`${datum}T12:00:00Z`).getUTCDay()]} ${Number(datum.slice(8, 10))}/${Number(datum.slice(5, 7))}`;
  return {
    title: `${kort.toUpperCase()} · ${dag} ${k.planerad.slice(11, 16)} · till: ${k.segment.join(', ')} · ${p.emailTitle}`,
    blocks: p.blocks,
    customizedNotification: { emailTitle: p.emailTitle, emailDescription: p.emailDescription },
  };
}

// Det som syns för mottagaren, i en form där Spoks svar och payloaden går att jämföra rakt av:
// Spoks lägger till id:n, fyller i produktdata och sätter vänsterjustering där payloaden
// utelämnar den, och lägger om ordningen på korten i ett produktblock.
export function normBlock(b) {
  const t = b.type ?? 'regular';
  if (t === 'divider') return { t };
  if (t === 'link') return { t, text: b.text, url: b.url, style: b.style };
  if (t === 'products') return { t, ids: b.products.map((p) => p.id).sort(), perRow: b.productsPerRow ?? null };
  if (t === 'columns') return { t, kol: b.columns.map((k) => ({ flex: k.flex, blocks: k.blocks.map(normBlock) })) };
  if (t === 'section') return { t, blocks: b.blocks.map(normBlock) };
  if (t === 'image') return { t, description: b.description ?? null };
  if (t === 'coupon') return { t, couponId: b.couponId ?? null };
  return { t, text: b.text, align: b.alignment ?? 'left' };
}

export const knappar = (blocks) => blocks
  .filter((b) => b.type === 'products')
  .map((b) => b.products.map((p) => `${p.id}=${p.button}`).sort().join(' | '));

export function jamfor(kamp, forvantat, skickat) {
  const brister = [];
  if (kamp.status !== 'draft') brister.push(`status ${kamp.status} (inte draft)`);
  if (kamp.title !== forvantat.title) brister.push(`titel "${kamp.title}" ≠ "${forvantat.title}"`);
  for (const f of ['emailTitle', 'emailDescription']) {
    const a = kamp.customizedNotification?.[f] ?? '';
    const b = forvantat.customizedNotification?.[f] ?? '';
    if (a !== b) brister.push(`${f} "${a}" ≠ "${b}"`);
  }
  const a = kamp.blocks.map(normBlock);
  const b = forvantat.blocks.map(normBlock);
  if (a.length !== b.length) brister.push(`${a.length} block i Spoks, ${b.length} i payloaden`);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = JSON.stringify(a[i]);
    const y = JSON.stringify(b[i]);
    if (x !== y) brister.push(`block ${i}: Spoks ${x} ≠ payload ${y}`);
  }
  let varning = null;
  if (!skickat) varning = 'knapptexterna syns inte i Spoks svar och loggen har ingen full uppladdning av utkastet, de är okontrollerade';
  else if (JSON.stringify(knappar(skickat.blocks)) !== JSON.stringify(knappar(forvantat.blocks))) {
    brister.push(`knapptexter skickade ${JSON.stringify(knappar(skickat.blocks))} ≠ payload ${JSON.stringify(knappar(forvantat.blocks))}`);
  }
  return { brister, varning };
}

// Senaste kampanjläget per post-id ur loggen, och det senaste fullständiga postData som skickades.
export function lasLogg(fil) {
  const anvandningar = new Map();
  const senast = new Map();
  const skickat = new Map();
  let ordning = 0;
  for (const rad of fs.readFileSync(fil, 'utf8').split('\n')) {
    if (!rad) continue;
    let j;
    try { j = JSON.parse(rad); } catch { continue; }
    const innehall = j?.message?.content;
    if (!Array.isArray(innehall)) continue;
    for (const c of innehall) {
      if (c.type === 'tool_use') anvandningar.set(c.id, { namn: String(c.name), indata: c.input });
      if (c.type !== 'tool_result') continue;
      const u = anvandningar.get(c.tool_use_id);
      if (!u || !/^mcp__Spoks__(get_campaign|draft_campaign|update_draft_campaign|update_draft_campaign_blocks)$/.test(u.namn)) continue;
      const text = typeof c.content === 'string' ? c.content : (c.content || []).map((x) => x.text || '').join('');
      let svar;
      try { svar = JSON.parse(text); } catch { continue; }
      const kamp = svar.campaign ?? (svar.blocks ? svar : null);
      if (!kamp?.id) continue;
      senast.set(kamp.id, { kamp, ordning: ++ordning });
      if (/(^|_)(update_)?draft_campaign$/.test(u.namn) && u.indata?.postData?.blocks) skickat.set(kamp.id, u.indata.postData);
    }
  }
  return { senast, skickat };
}

function senasteLogg() {
  const bas = path.join(os.homedir(), '.claude', 'projects');
  let bast = null;
  for (const d of fs.existsSync(bas) ? fs.readdirSync(bas) : []) {
    const mapp = path.join(bas, d);
    if (!fs.statSync(mapp).isDirectory()) continue;
    for (const f of fs.readdirSync(mapp).filter((x) => x.endsWith('.jsonl'))) {
      const p = path.join(mapp, f);
      const t = fs.statSync(p).mtimeMs;
      if (!bast || t > bast.t) bast = { p, t };
    }
  }
  return bast?.p ?? null;
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const arg = (n, std) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : std; };
  const brandId = arg('--brand', 'baverbutiken');
  const mapp = path.join(ROT, 'klaviyo', 'spoks', brandId);
  const plan = JSON.parse(fs.readFileSync(path.join(mapp, 'plan.json'), 'utf8'));
  const payloadMapp = path.join(mapp, 'payload');
  const medVarde = new Set(['--logg', '--brand', '--ut']);
  const kort = process.argv.slice(2).filter((a, i, alla) => !a.startsWith('--') && !medVarde.has(alla[i - 1])).map((a) => a.toLowerCase());

  if (process.argv.includes('--postdata')) {
    const ut = arg('--ut', null);
    if (!kort.length) { console.error('Ange kampanjer, t.ex. --postdata k02 k24.'); process.exit(2); }
    for (const k of kort) {
      const pd = byggPostData(plan, payloadMapp, k);
      if (ut) {
        fs.mkdirSync(ut, { recursive: true });
        fs.writeFileSync(path.join(ut, `post-${k}.json`), JSON.stringify(pd));
        console.log(`${k}: ${pd.title} (${pd.blocks.length} block) → ${path.join(ut, `post-${k}.json`)}`);
      } else console.log(JSON.stringify(pd));
    }
    process.exit(0);
  }

  const logg = arg('--logg', null) ?? senasteLogg();
  if (!logg || !fs.existsSync(logg)) { console.error('Hittar ingen sessionslogg. Ange --logg <fil.jsonl>.'); process.exit(2); }
  const { senast, skickat } = lasLogg(logg);
  const kandidater = kort.length ? kort : plan.kampanjer.map((k) => k.id.split('-')[0])
    .filter((k) => [...senast.values()].some((v) => String(v.kamp.title).startsWith(`${k.toUpperCase()} · `)));
  let fel = 0;
  for (const k of [...new Set(kandidater)]) {
    const traffar = [...senast.values()].filter((v) => String(v.kamp.title).startsWith(`${k.toUpperCase()} · `)).sort((a, b) => b.ordning - a.ordning);
    if (!traffar.length) { console.log(`❌ ${k.toUpperCase()}: inget Spoks-svar i loggen`); fel++; continue; }
    const { kamp } = traffar[0];
    const { brister, varning } = jamfor(kamp, byggPostData(plan, payloadMapp, k), skickat.get(kamp.id));
    if (brister.length) { fel++; console.log(`❌ ${k.toUpperCase()} ${kamp.id}\n   - ${brister.join('\n   - ')}`); }
    else console.log(`✅ ${k.toUpperCase()} ${kamp.id} · ${kamp.customizedNotification?.emailTitle ?? ''}${varning ? `\n   ⚠️ ${varning}` : ''}`);
  }
  console.log(`\n${new Set(kandidater).size} kontrollerade, ${fel} med avvikelser (logg: ${logg})`);
  process.exit(fel ? 1 : 0);
}
