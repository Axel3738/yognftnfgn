// Schemalägger namngivna kampanjer i Klaviyo (send-job på en Draft med fast datum).
//
//   node klaviyo/schemalagg.mjs K01 [K02 …]          torrt: visar vad som skulle schemaläggas
//   node klaviyo/schemalagg.mjs K01 --ja             skarpt
//
// ⛔ Bara på Axels uttryckliga ord ("schemalägg K01", 2026-09-25). Stoppar om
// kampanjen inte är Draft, inte har send_strategy "static" minst en timme
// fram, eller om ett inkluderat segment saknar samtyckesvillkoret. Klienten
// släpper bara igenom send-job för exakt de kampanj-id:n som klarat det.
// Läser tillbaka status efteråt och skriver konto/<brand>/schemalagt.jsonl.
import { readFileSync, appendFileSync } from 'node:fs';
import { KlaviyoKlient, nyckelFranEnv, kontrolleraKonto } from './klient.mjs';
import { harSamtycke } from './segment.mjs';

const args = process.argv.slice(2);
const ja = args.includes('--ja');
const koder = args.filter((a) => !a.startsWith('--')).map((a) => a.toUpperCase());
const brand = JSON.parse(readFileSync(new URL('./brands/baverbutiken.json', import.meta.url), 'utf8'));
if (!koder.length) { console.error('Ange kampanjerna, t.ex. K01.'); process.exit(1); }
const nyckel = nyckelFranEnv(brand)?.nyckel;
if (!nyckel) { console.error('Klaviyo-nyckeln saknas.'); process.exit(1); }

const k = new KlaviyoKlient({ nyckel });
await kontrolleraKonto(k, brand);
const alla = [];
let sida = await k.get('/api/campaigns', { filter: "equals(messages.channel,'email')" });
for (;;) { alla.push(...(sida.data ?? [])); const n = sida.links?.next; if (!n) break; sida = await k.get(n); }

// K01 → kampanjfilen k01-*.json → dess namn → kampanjen i kontot.
const { readdirSync } = await import('node:fs');
const mapp = new URL('./innehall/baverbutiken/kampanjer/', import.meta.url);
const plan = [];
for (const kod of koder) {
  const fil = readdirSync(mapp).find((f) => f.toUpperCase().startsWith(kod + '-'));
  if (!fil) { console.error(`STOPP: ingen kampanjfil för ${kod}.`); process.exit(1); }
  const namn = JSON.parse(readFileSync(new URL(fil, mapp), 'utf8')).namn;
  const c = alla.filter((x) => x.attributes.name === namn);
  if (c.length !== 1) { console.error(`STOPP: ${kod} (${namn}) ger ${c.length} kampanjer i kontot.`); process.exit(1); }
  const a = c[0].attributes;
  const tid = a.send_strategy?.method === 'static' ? new Date(a.send_strategy.datetime) : null;
  const fel = [];
  if (a.status !== 'Draft') fel.push(`status är ${a.status}, inte Draft`);
  if (!tid || tid.getTime() < Date.now() + 3600e3) fel.push(`sändtiden måste vara ett fast datum minst en timme fram (är ${JSON.stringify(a.send_strategy)})`);
  for (const sid of a.audiences?.included ?? []) {
    const def = (await k.get(`/api/segments/${sid}`)).data.attributes.definition;
    if (!harSamtycke(def)) fel.push(`segmentet ${sid} saknar samtyckesvillkoret`);
  }
  if (fel.length) { console.error(`STOPP: ${kod}: ${fel.join('; ')}.`); process.exit(1); }
  const svensk = tid.toLocaleString('sv-SE', { timeZone: 'Europe/Stockholm', dateStyle: 'full', timeStyle: 'short' });
  plan.push({ kod, id: c[0].id, namn, tid: tid.toISOString(), svensk });
  console.log(`${ja ? 'SCHEMALÄGGER' : 'SKULLE SCHEMALÄGGA'} ${kod} ${namn} → ${svensk}`);
}
if (!ja) { console.log('\nTorrt. Lägg till --ja för att schemalägga.'); process.exit(0); }

const s = new KlaviyoKlient({ nyckel, tillatLive: plan.map((p) => `kampanj:${p.id}`) });
const logg = new URL(`./konto/${brand.id}/schemalagt.jsonl`, import.meta.url);
for (const p of plan) {
  await s.post('/api/campaign-send-jobs', { data: { type: 'campaign-send-job', id: p.id } });
  const efter = (await s.get(`/api/campaigns/${p.id}`)).data.attributes;
  console.log(`✅ ${p.kod}: ${efter.status}, ${p.svensk}`);
  appendFileSync(logg, JSON.stringify({ tid: new Date().toISOString(), kod: p.kod, id: p.id, namn: p.namn, sands: p.tid, status: efter.status }) + '\n');
}
