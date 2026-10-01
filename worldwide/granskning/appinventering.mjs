// appinventering.mjs — alla texter Kaching och Judge.me ritar på produktsidorna (synliga OCH dolda:
// recensionsformuläret, sorteringsmenyn, tomma lägen), efter att bw-appord kört. Läs-bart.
//
//   node worldwide/granskning/appinventering.mjs [--land US --sprak en] [--ut fil.json]
//
// Ger listan av svenska texter som bw-appord (tema/appord.json) inte byter ännu.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { startaBrowser, kontext, BAS, PRODUKTER, prefix, svenskRad } from './kund.mjs';

const a = process.argv.slice(2);
const arg = (n, d = null) => (a.includes(n) ? a[a.indexOf(n) + 1] : d);

export async function inventera({ land = 'US', sprak = 'en', sidor = ['/', ...PRODUKTER.map((h) => `/products/${h}`)] } = {}) {
  const b = await startaBrowser();
  const ctx = await kontext(b, land, sprak);
  const page = await ctx.newPage();
  const alla = new Map();
  try {
    for (const s of sidor) {
      await page.goto(`${BAS}${prefix(sprak)}${s}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      try { await page.waitForLoadState('networkidle', { timeout: 9000 }); } catch {}
      await page.waitForTimeout(1500);
      // Öppna recensionsformuläret och sorteringen så att deras texter ritas.
      for (const sel of ['.jdgm-write-rev-link', '.jdgm-sort-dropdown', '.jdgm-rev-widg__sort-wrapper select']) {
        const el = page.locator(sel).first();
        if (await el.count()) await el.click({ timeout: 3000 }).catch(() => {});
      }
      await page.waitForTimeout(1500);
      const t = await page.evaluate(() => {
        const SEL = 'kaching-bundle, kaching-bundles-block, [class*="jdgm"]';
        const ut = [];
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        let n;
        while ((n = w.nextNode())) {
          const p = n.parentElement;
          if (!p || !p.closest(SEL) || p.closest('script,style')) continue;
          const v = n.nodeValue.replace(/\s+/g, ' ').trim();
          if (v) ut.push({ v, app: p.closest('[class*="jdgm"]') ? 'judgeme' : 'kaching', rev: Boolean(p.closest('.jdgm-rev__body, .jdgm-rev__title, .jdgm-rev__author, .jdgm-rev__content, .jdgm-carousel-item__review, .jdgm-rev__reply')) });
        }
        for (const e of document.querySelectorAll('[placeholder], [aria-label], [title], [data-placeholder]')) {
          if (!e.closest(SEL)) continue;
          for (const at of ['placeholder', 'aria-label', 'title', 'data-placeholder']) if (e.getAttribute(at)) ut.push({ v: e.getAttribute(at).trim(), app: e.closest('[class*="jdgm"]') ? 'judgeme' : 'kaching', attr: at });
        }
        for (const o of document.querySelectorAll('[class*="jdgm"] option')) ut.push({ v: o.textContent.trim(), app: 'judgeme', attr: 'option' });
        return ut;
      });
      for (const x of t) {
        const k = `${x.app}|${x.v}`;
        if (!alla.has(k)) alla.set(k, { ...x, sidor: [] });
        alla.get(k).sidor.push(s);
      }
    }
  } finally { await ctx.close(); await b.close(); }
  const lista = [...alla.values()];
  return { alla: lista, svenska: lista.filter((x) => !x.rev && (svenskRad(x.v, sprak) || /[åäöÅÄÖ]/.test(x.v))) };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const r = await inventera({ land: arg('--land', 'US'), sprak: arg('--sprak', 'en') });
  for (const x of r.svenska) console.log(`${x.app.padEnd(8)} ${(x.attr ?? '').padEnd(11)} ${x.v.slice(0, 90)}  (${x.sidor.length} sidor)`);
  console.log(`\n${r.alla.length} unika apptexter · ${r.svenska.length} svenska (utan recensionernas egen text)`);
  if (arg('--ut')) writeFileSync(arg('--ut'), JSON.stringify(r, null, 1));
}
