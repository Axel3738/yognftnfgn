// Delat: Playwright-import med reserv, sessionsfil, ProseMirror → markdown.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const HÄR = path.dirname(fileURLToPath(import.meta.url));
export const STATE_MAPP = path.join(HÄR, '.state');
export const STATE = path.join(STATE_MAPP, 'skool-state.json');
export const GRUPP = process.env.SKOOL_GRUPP || 'evolve-8484';
export const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

export async function playwright() {
  try { return await import('playwright'); }
  catch {
    const reserv = '/opt/node-tools/node_modules/playwright/index.mjs';
    if (fs.existsSync(reserv)) return await import(reserv);
    throw new Error('playwright saknas: npm i -g playwright, eller kör i claude.ai-containern');
  }
}

export async function öppna({ kräverSession = true } = {}) {
  fs.mkdirSync(STATE_MAPP, { recursive: true });
  if (kräverSession && !fs.existsSync(STATE)) throw new Error(`ingen session — kör node tools/skool/login.mjs först (${STATE})`);
  const { chromium } = await playwright();
  const browser = await chromium.launch({ headless: true, args: ['--ignore-certificate-errors', '--no-sandbox'] });
  const ctx = await browser.newContext({ ignoreHTTPSErrors: true, userAgent: UA, viewport: { width: 1280, height: 900 },
    storageState: fs.existsSync(STATE) ? STATE : undefined });
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);
  return { browser, ctx, page, async stäng() { await ctx.storageState({ path: STATE }); await browser.close(); } };
}

export async function nextData(page) {
  const txt = await page.$eval('script#__NEXT_DATA__', s => s.textContent).catch(() => null);
  if (!txt) throw new Error(`ingen __NEXT_DATA__ på ${page.url()} — utloggad?`);
  return JSON.parse(txt);
}

export function hittaNod(n, id) {
  const cn = n.course || n;
  if (cn.id === id) return n;
  for (const k of (n.children || [])) { const t = hittaNod(k, id); if (t) return t; }
  return null;
}

function text(node) {
  const t = node.type;
  if (t === 'text') {
    let s = node.text || '';
    for (const m of node.marks || []) {
      if (m.type === 'bold') s = `**${s}**`;
      else if (m.type === 'italic') s = `*${s}*`;
      else if (m.type === 'link') s = `[${s}](${m.attrs?.href || ''})`;
      else if (m.type === 'videoTimestamp') s = `[${s}]`;
    }
    return s;
  }
  if (t === 'hardBreak') return '\n';
  const inre = (node.content || []).map(text).join('');
  if (t === 'paragraph') return inre + '\n\n';
  if (t === 'heading') return '#'.repeat(node.attrs?.level || 2) + ' ' + inre + '\n\n';
  if (t === 'bulletList' || t === 'orderedList') return inre + '\n';
  if (t === 'listItem') return '- ' + inre.trim().replace(/\n\n/g, '\n  ') + '\n';
  if (t === 'blockquote') return '> ' + inre.trim().replace(/\n/g, '\n> ') + '\n\n';
  if (t === 'codeBlock') return '```\n' + inre + '\n```\n\n';
  if (t === 'image') return `![bild](${node.attrs?.src || ''})\n\n`;
  if (t === 'horizontalRule') return '---\n\n';
  return inre;
}

/** Skools lektionstext ('[v2][...]' ProseMirror-JSON) → markdown. */
export function descTillMd(desc) {
  if (!desc) return '';
  if (!desc.startsWith('[v2]')) return desc;
  let doc;
  try { doc = JSON.parse(desc.slice(4)); } catch (e) { return `(kunde inte tolka texten: ${e.message})\n`; }
  if (!Array.isArray(doc)) doc = doc.content || [];
  return doc.map(text).join('');
}
