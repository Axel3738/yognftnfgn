/**
 * "Koppla Meta"-knappen. Skickar handlaren till Metas inloggning, utanför
 * Shopify-ramen (Facebook tillåter inte att laddas i en iframe). Tillbaka
 * kommer hen via /meta/callback.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { metaLoginUrl, metaOAuthEnabled, signState } from "../lib/meta.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, redirect } = await authenticate.admin(request);
  if (!metaOAuthEnabled) {
    return redirect("/app/settings?meta=disabled");
  }
  return redirect(metaLoginUrl(signState(session.shop)), { target: "_top" });
}
