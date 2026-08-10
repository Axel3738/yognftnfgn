/**
 * HTTP-servern: statiskt UI + JSON-API. Inga beroenden, bara node:http.
 *
 * API
 *   GET  /api/report?from=&to=&brand=&kind=&editorId=   hela rapporten
 *   GET  /api/editor/:id?from=&to=                      en redigerares tasks
 *   GET  /api/events?limit=                             råloggen (senaste först)
 *   POST /api/events                                    lägg till event (ingest)
 *   GET  /api/health
 *
 * Ingest skyddas av INGEST_TOKEN om den är satt (Authorization: Bearer …).
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readEvents, appendEvents } from './store.mjs';
import { computeReport, buildState } from './metrics.mjs';
import { ValidationError } from './events.mjs';
import { round } from './util.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.join(__dirname, '..', 'web');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

export function createServer({ storeFile, config, env = process.env }) {
  let cache = { mtimeMs: -1, events: [], problems: [] };

  const load = () => {
    let mtimeMs = 0;
    try {
      mtimeMs = fs.statSync(storeFile).mtimeMs;
    } catch {
      mtimeMs = 0;
    }
    if (mtimeMs !== cache.mtimeMs) {
      const { events, problems } = readEvents(storeFile);
      cache = { mtimeMs, events, problems };
    }
    return cache;
  };

  const json = (res, status, body) => {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Length': Buffer.byteLength(payload),
    });
    res.end(payload);
  };

  return http.createServer(async (req, res) => {
    let url;
    try {
      url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    } catch {
      return json(res, 400, { error: 'Trasig URL' });
    }
    const pathname = url.pathname;

    try {
      if (pathname === '/api/health') {
        const { events, problems } = load();
        return json(res, 200, { ok: true, events: events.length, problems: problems.length });
      }

      if (pathname === '/api/report' && req.method === 'GET') {
        const { events, problems } = load();
        const report = computeReport(events, config, {
          from: url.searchParams.get('from') || undefined,
          to: url.searchParams.get('to') || undefined,
          brand: url.searchParams.get('brand') || undefined,
          kind: url.searchParams.get('kind') || undefined,
          editorId: url.searchParams.get('editorId') || undefined,
        });
        report.storeProblems = problems;
        return json(res, 200, report);
      }

      if (pathname.startsWith('/api/editor/') && req.method === 'GET') {
        const editorId = decodeURIComponent(pathname.slice('/api/editor/'.length));
        const { events } = load();
        const state = buildState(events, config);
        const editor = state.editors.get(editorId);
        if (!editor) return json(res, 404, { error: `Okänd redigerare: ${editorId}` });
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        const tasks = [...state.tasks.values()]
          .filter((t) => t.editorId === editorId)
          .filter((t) => {
            if (!from && !to) return true;
            const stamp = (t.approvedAt || t.firstDeliveryAt || t.assignedAt || '').slice(0, 10);
            if (!stamp) return false;
            if (from && stamp < from) return false;
            if (to && stamp > to) return false;
            return true;
          })
          .sort((a, b) => (a.assignedAt < b.assignedAt ? 1 : -1))
          .map((t) => ({
            id: t.id,
            title: t.title,
            kind: t.kind,
            complexity: t.complexity,
            weight: t.weight,
            state: t.state,
            assignedAt: t.assignedAt,
            firstDeliveryAt: t.firstDeliveryAt,
            approvedAt: t.approvedAt,
            dueAt: t.dueAt,
            onTime: t.onTime,
            rounds: t.rounds,
            attributableRounds: t.attributableRounds,
            timeToFirstDeliveryHours: round(t.timeToFirstDeliveryHours, 2),
            pickupDelayHours: round(t.pickupDelayHours, 2),
            handsOnHours: round(t.handsOnHours, 2),
            reviewWaitHours: round(t.reviewWaitHours, 2),
            totalCycleHours: round(t.totalCycleHours, 2),
            loggedHours: round(t.loggedMinutes / 60, 2),
            revisions: t.revisions.map((r) => ({
              at: r.at,
              reason: r.reason,
              attributable: r.attributable,
              turnaroundHours: round(r.turnaroundHours, 2),
              notes: r.notes,
            })),
          }));
        return json(res, 200, { editor, tasks });
      }

      if (pathname === '/api/events' && req.method === 'GET') {
        const { events } = load();
        const limit = Math.min(Number(url.searchParams.get('limit') || 200), 5000);
        return json(res, 200, { total: events.length, events: events.slice(-limit).reverse() });
      }

      if (pathname === '/api/events' && req.method === 'POST') {
        const token = env.INGEST_TOKEN;
        if (token) {
          const auth = req.headers.authorization || '';
          if (auth !== `Bearer ${token}`) return json(res, 401, { error: 'Ogiltig token' });
        }
        const body = await readBody(req);
        let payload;
        try {
          payload = JSON.parse(body);
        } catch {
          return json(res, 400, { error: 'Body är inte giltig JSON' });
        }
        const list = Array.isArray(payload) ? payload : [payload];
        try {
          const written = appendEvents(storeFile, list);
          cache.mtimeMs = -1;
          return json(res, 201, { written: written.length, events: written });
        } catch (err) {
          if (err instanceof ValidationError) return json(res, 422, { error: err.message });
          throw err;
        }
      }

      if (pathname.startsWith('/api/')) return json(res, 404, { error: 'Okänd endpoint' });

      // Statiska filer.
      const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
      const file = path.join(WEB_ROOT, rel);
      if (!file.startsWith(WEB_ROOT)) return json(res, 403, { error: 'Nekad' });
      if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('404');
      }
      res.writeHead(200, {
        'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
        'Cache-Control': 'no-cache',
      });
      return fs.createReadStream(file).pipe(res);
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  });
}

function readBody(req, limit = 5_000_000) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > limit) {
        reject(new Error('Body för stor'));
        req.destroy();
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
