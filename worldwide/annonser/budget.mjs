// budget.mjs — sätter konto.json → budget_sek_dag på alla BEAVERSTORE_WW_-kampanjer (bara budgeten,
// aldrig status). Läser tillbaka. Kräver budget_beslut. PAUSED förblir PAUSED.
//
//   node worldwide/annonser/budget.mjs            # torrt
//   node worldwide/annonser/budget.mjs --skarpt
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { api, alla, säkerställProxy } from '../../tools/meta-lib.mjs';

säkerställProxy();
const K = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'konto.json'), 'utf8'));
if (!K.budget_beslut) { console.log('⛔ ingen budget_beslut i konto.json'); process.exit(2); }
const skarpt = process.argv.includes('--skarpt');
const mal = String(K.budget_sek_dag * 100);
const kampanjer = (await alla(`act_${K.konto}/campaigns`, { fields: 'id,name,status,daily_budget' }, 100)).filter((c) => c.name.startsWith('BEAVERSTORE_WW_'));
for (const c of kampanjer) {
  if (c.daily_budget === mal) { console.log(`= ${c.name}: redan ${K.budget_sek_dag} kr/dag`); continue; }
  if (!skarpt) { console.log(`torrt: ${c.name}: ${Number(c.daily_budget) / 100} → ${K.budget_sek_dag} kr/dag`); continue; }
  await api(c.id, { form: { daily_budget: mal } });
  const t = await api(c.id, { params: { fields: 'daily_budget,status' } });
  console.log(`${t.daily_budget === mal ? '✅' : '❌'} ${c.name}: ${Number(t.daily_budget) / 100} kr/dag, ${t.status}`);
}
console.log(`\n${kampanjer.length} kampanjer`);
