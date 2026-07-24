import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COSTS_PATH = join(__dirname, '..', 'data', 'costs.json');

const DEFAULTS = {
  shopifyPlanMonthly: 349,
  fixedMonthly: [],
  perOrder: [],
  payment: { pct: 2.9, fixedPerOrder: 3, useApiFeesIfAvailable: true },
};

const num = v => (Number.isFinite(Number(v)) ? Number(v) : 0);

function sanitize(s) {
  return {
    shopifyPlanMonthly: num(s.shopifyPlanMonthly),
    fixedMonthly: (Array.isArray(s.fixedMonthly) ? s.fixedMonthly : [])
      .map(x => ({ name: String(x.name || 'Övrigt').slice(0, 60), amount: num(x.amount) })),
    perOrder: (Array.isArray(s.perOrder) ? s.perOrder : [])
      .map(x => ({ name: String(x.name || 'Övrigt').slice(0, 60), amount: num(x.amount) })),
    payment: {
      pct: num(s.payment?.pct),
      fixedPerOrder: num(s.payment?.fixedPerOrder),
      useApiFeesIfAvailable: s.payment?.useApiFeesIfAvailable !== false,
    },
  };
}

/** Läser kostnadsinställningar (fasta kostnader, per order, betalavgift). */
export async function loadSettings() {
  try {
    return sanitize(JSON.parse(await readFile(COSTS_PATH, 'utf-8')));
  } catch {
    return { ...DEFAULTS };
  }
}

/** Sparar (saniterade) kostnadsinställningar till disk. */
export async function saveSettings(next) {
  const clean = sanitize(next || {});
  await writeFile(COSTS_PATH, JSON.stringify(clean, null, 2) + '\n', 'utf-8');
  return clean;
}
