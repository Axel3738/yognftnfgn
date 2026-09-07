/**
 * Den lilla HTML-sidan i inloggningsfönstret. Fönstret ligger utanför
 * Shopify-admin och Remix-layouten (resursrutter), så sidan byggs för hand:
 * ingen Polaris, inga beroenden, all text escapad, och en strikt CSP med
 * engångs-nonce så att inget annat än vårt eget skript kan köra — sidan
 * visar text som kommer från Meta (namn, felbeskrivning).
 */

import { randomBytes } from "node:crypto";
import { t, type Lang } from "./texts";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Vad Settings-sidan får veta. `reason` visas som en rad bredvid knappen. */
export type LoginSignal = { ok: true } | { ok: false; reason: string };

export function metaLoginSida(
  lang: Lang,
  opts: {
    title: string;
    body: string;
    status?: number;
    /** Säg till Settings-sidan (postMessage) och stäng fönstret av sig självt. */
    signal?: LoginSignal;
    headers?: Record<string, string>;
  },
): Response {
  const T = t(lang);
  const nonce = randomBytes(16).toString("base64");
  const signalSkript = opts.signal
    ? `
  try { if (window.opener) window.opener.postMessage(${JSON.stringify({ type: "meta-login", ...opts.signal })}, window.location.origin); } catch (e) {}
  setTimeout(function () { window.close(); }, ${opts.signal.ok ? 2500 : 6000});`
    : "";
  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${esc(opts.title)}</title>
<style nonce="${nonce}">
  body { font-family: system-ui, sans-serif; max-width: 420px; margin: 12vh auto; padding: 0 16px; color: #202223; }
  h1 { font-size: 20px; margin: 0 0 12px; }
  p { line-height: 1.5; }
  button { font: inherit; padding: 8px 16px; margin-top: 16px; cursor: pointer; }
</style>
</head>
<body>
<h1>${esc(opts.title)}</h1>
<p>${esc(opts.body)}</p>
<button type="button" id="stang">${esc(T.metaLogin.closeWindow)}</button>
<script nonce="${nonce}">
  document.getElementById("stang").addEventListener("click", function () { window.close(); });${signalSkript}
</script>
</body>
</html>`;
  return new Response(html, {
    status: opts.status ?? 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy":
        `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; base-uri 'none'; form-action 'none'`,
      ...(opts.headers ?? {}),
    },
  });
}
