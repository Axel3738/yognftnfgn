// Slår på namngivna flöden i Klaviyo: flödet och varje send-email-action → live.
//
//   node klaviyo/sla-pa.mjs <flödesnamn …>            torrt: visar vad som skulle slås på
//   node klaviyo/sla-pa.mjs <flödesnamn …> --ja       skarpt
//
// ⛔ Bara på Axels uttryckliga ord ("slå på flödena", 2026-09-25). Klienten
// släpper bara igenom exakt de id:n skriptet läst ur kontot, bara status
// "live", och aldrig ett kampanjutskick (klient.mjs sparrSkicka).
// Läser tillbaka varje flöde efteråt och skriver konto/<brand>/pasatt.jsonl.
import { readFileSync, appendFileSync } from 'node:fs';
import { KlaviyoKlient, nyckelFranEnv, kontrolleraKonto, citera } from './klient.mjs';

const args = process.argv.slice(2);
const ja = args.includes('--ja');
const namn = args.filter((a) => !a.startsWith('--'));
const brand = JSON.parse(readFileSync(new URL('./brands/baverbutiken.json', import.meta.url), 'utf8'));
if (!namn.length) { console.error('Ange flödesnamnen som ska slås på.'); process.exit(1); }
const nyckel = nyckelFranEnv(brand)?.nyckel;
if (!nyckel) { console.error('Klaviyo-nyckeln saknas.'); process.exit(1); }

const lasare = new KlaviyoKlient({ nyckel });
await kontrolleraKonto(lasare, brand);
const plan = [];
for (const n of namn) {
  const f = (await lasare.get('/api/flows', { filter: `equals(name,${citera(n)})` })).data ?? [];
  if (f.length !== 1) { console.error(`STOPP: "${n}" ger ${f.length} flöden i kontot.`); process.exit(1); }
  const id = f[0].id;
  const d = (await lasare.get(`/api/flows/${id}`, { 'additional-fields[flow]': 'definition' })).data.attributes;
  const mejl = d.definition.actions.filter((a) => a.type === 'send-email');
  plan.push({ namn: n, id, status: d.status, mejl });
  console.log(`${ja ? 'SLÅR PÅ' : 'SKULLE SLÅ PÅ'} ${n} (${id}, nu ${d.status}) + ${mejl.length} mejl`);
}
if (!ja) { console.log('\nTorrt. Lägg till --ja för att slå på.'); process.exit(0); }

const k = new KlaviyoKlient({ nyckel, tillatLive: plan.flatMap((p) => [p.id, ...p.mejl.map((a) => String(a.id))]) });
const logg = new URL(`./konto/${brand.id}/pasatt.jsonl`, import.meta.url);
for (const p of plan) {
  for (const a of p.mejl) {
    const { id, ...resten } = a;
    await k.patch(`/api/flow-actions/${id}`, { data: { type: 'flow-action', id: String(id), attributes: { definition: { ...resten, id, data: { ...a.data, status: 'live' } } } } });
  }
  await k.patch(`/api/flows/${p.id}`, { data: { type: 'flow', id: p.id, attributes: { status: 'live' } } });
  const efter = (await k.get(`/api/flows/${p.id}`, { 'additional-fields[flow]': 'definition' })).data.attributes;
  const mejlLive = efter.definition.actions.filter((a) => a.type === 'send-email').map((a) => a.data?.status);
  console.log(`✅ ${p.namn}: flöde ${efter.status}, mejl ${mejlLive.join(', ')}`);
  appendFileSync(logg, JSON.stringify({ tid: new Date().toISOString(), namn: p.namn, id: p.id, status: efter.status, mejl: mejlLive }) + '\n');
}
