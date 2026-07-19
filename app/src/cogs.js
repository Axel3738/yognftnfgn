import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Källa: samma inpriser som kostnads-dashboarden.
const COGS_PATH = join(__dirname, '..', '..', 'dashboard', 'kostnader.json');

let cache = null;

/**
 * Laddar inpriser och bygger uppslag på handle och SKU.
 * Returnerar { byHandle, bySku, records }.
 */
export async function loadCogs() {
  if (cache) return cache;
  const raw = JSON.parse(await readFile(COGS_PATH, 'utf-8'));
  const byHandle = new Map();
  const bySku = new Map();
  for (const r of raw.records) {
    if (r.cost_sek == null) continue;
    if (r.handle && !byHandle.has(r.handle)) byHandle.set(r.handle, r.cost_sek);
    if (r.sku) bySku.set(r.sku, r.cost_sek);
  }
  cache = { byHandle, bySku, records: raw.records, rate: raw.rate };
  return cache;
}

/** Slår upp inpris för en såld rad. Faller tillbaka på handle om SKU saknas. */
export function costForLineItem(cogs, { sku, handle }) {
  if (sku && cogs.bySku.has(sku)) return cogs.bySku.get(sku);
  if (handle && cogs.byHandle.has(handle)) return cogs.byHandle.get(handle);
  return null; // okänd inpris → räknas som 0 men flaggas separat
}
