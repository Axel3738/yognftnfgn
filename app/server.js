import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { config } from './src/config.js';
import { buildPnl } from './src/pnl.js';
import { loadCogs } from './src/cogs.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Default: senaste 30 dagarna (YYYY-MM-DD). Klienten kan skicka ?from=&to=.
function defaultRange() {
  const to = new Date();
  const from = new Date(to.getTime() - 29 * 864e5);
  const iso = d => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    sources: {
      shopify: config.shopify.enabled,
      meta: config.meta.enabled,
      google: config.google.enabled,
    },
  });
});

app.get('/api/pnl', async (req, res) => {
  const def = defaultRange();
  const from = /^\d{4}-\d{2}-\d{2}$/.test(req.query.from || '') ? req.query.from : def.from;
  const to = /^\d{4}-\d{2}-\d{2}$/.test(req.query.to || '') ? req.query.to : def.to;
  try {
    res.json(await buildPnl(from, to));
  } catch (err) {
    res.status(500).json({ error: String(err.message || err) });
  }
});

// Produktinpriser (samma data som kostnads-dashboarden).
app.get('/api/products', async (_req, res) => {
  const cogs = await loadCogs();
  res.json({ rate: cogs.rate, records: cogs.records });
});

app.use(express.static(join(__dirname, 'public')));

app.listen(config.port, () => {
  const on = s => (s ? 'kopplad' : 'ej kopplad');
  console.log(`Grillkliniken P&L → http://localhost:${config.port}`);
  console.log(`  Shopify: ${on(config.shopify.enabled)} · Meta: ${on(config.meta.enabled)} · Google Ads: ${on(config.google.enabled)}`);
});
