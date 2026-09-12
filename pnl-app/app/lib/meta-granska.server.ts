/**
 * Testsidan för Metas granskare (App Review) — HTML och konstanter.
 *
 * `ads_read` fungerar bara för personer med roll i Meta-appen tills appen är
 * godkänd, och godkännandet kräver att en granskare hos Meta själv kan köra
 * flödet. StonePNL bor i en iframe inne i Shopify-admin — en granskare har
 * ingen Shopify-butik och kan inte komma dit. `/meta/granska` kör därför
 * exakt samma OAuth-runda utanför Shopify och visar vad `ads_read` används
 * till: namnen på annonskontona och deras valuta.
 *
 * Tre saker gör den ofarlig:
 *  - Den finns bara när META_REVIEW_KEY är satt, och kräver nyckeln i adressen.
 *  - Den skriver ALDRIG något till en butik. Ingen token sparas.
 *  - Nyckeln återkallas mot Meta så fort listan visats.
 */

/** Värdet i MetaLoginState.syfte som säger "det här är en granskning". */
export const GRANSKNING = "granskning";

export const granskningsNyckel = (): string => process.env.META_REVIEW_KEY?.trim() ?? "";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Ren HTML — sidan ligger utanför Shopify och Polaris. */
function sida(body: string, status = 200): Response {
  return new Response(
    `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>StonePNL — ad account access test</title>
<style>
 body{font:16px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;margin:0;padding:40px 20px;background:#f6f6f7;color:#202223}
 main{max-width:640px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
 h1{font-size:22px;margin:0 0 12px}
 p{margin:0 0 12px}
 a.btn{display:inline-block;background:#1877f2;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600}
 table{border-collapse:collapse;width:100%;margin:16px 0}
 th,td{text-align:left;padding:8px;border-bottom:1px solid #e3e3e3;font-size:14px}
 .muted{color:#616161;font-size:14px}
</style></head><body><main>${body}</main></body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } },
  );
}

export const granskningSaknasSida = () =>
  sida(`<h1>Not configured</h1><p>This deployment has no Meta app credentials, so the login cannot be tested here.</p>`, 503);

/** Startsidan granskaren landar på. */
export const granskningsStartsida = (nyckel: string) =>
  sida(`
    <h1>StonePNL — ad account access test</h1>
    <p>StonePNL is a profit dashboard for Shopify merchants. It shows net profit per product:
       sales minus cost of goods, minus fees and duty, minus what the merchant spent on ads.</p>
    <p><strong>What <code>ads_read</code> is used for:</strong> once a day the app reads the
       merchant's own ad spend, impressions and clicks per day from the ad account they pick,
       and subtracts that spend from their sales. Nothing is posted, changed or created in the
       ad account, and the numbers are shown only to the merchant who connected the account.</p>
    <p>Press the button to run the same login a merchant runs. It will ask for
       <code>ads_read</code> and then list the ad accounts your Facebook user can see — that is
       the whole of what the app reads. <strong>Nothing is stored:</strong> this page saves no
       token and no account, and the access token is revoked as soon as the list is shown.</p>
    <p><a class="btn" href="?key=${encodeURIComponent(nyckel)}&amp;start=1">Continue with Facebook</a></p>
    <p class="muted">Privacy policy: <a href="/privacy">/privacy</a></p>
  `);

/** Resultatsidan, renderad av /meta/callback när syftet är granskning. */
export function granskningsResultat(
  konton: { accountId: string; name: string; currency: string; status: number }[],
  anvandare: string | null,
): Response {
  const rader = konton.length
    ? konton
        .map((k) => `<tr><td>${esc(k.name)}</td><td>${esc(k.currency)}</td><td class="muted">act_${esc(k.accountId)}</td></tr>`)
        .join("")
    : `<tr><td colspan="3" class="muted">This Facebook user has no ad accounts.</td></tr>`;
  return sida(`
    <h1>ads_read works</h1>
    <p>${anvandare ? `Signed in as ${esc(anvandare)}. ` : ""}These are the ad accounts the app can
       read spend from. In the real app the merchant picks one, and its daily spend is subtracted
       from their sales to show net profit.</p>
    <table><tr><th>Ad account</th><th>Currency</th><th>ID</th></tr>${rader}</table>
    <p class="muted">The access token used for this test has been revoked and nothing was stored.</p>
  `);
}
