/**
 * TILLFÄLLIG diagnosrutt. Tas bort när 403-mysteriet är löst.
 *
 * Kringgår hela Shopify-biblioteket: läser installationens token ur databasen
 * och gör ett rått anrop. Syftet är att se Shopifys ofiltrerade svar —
 * statusrad, x-request-id och felkropp — som klientbiblioteket sväljer.
 * Läcker inte token: bara längd och de fyra första tecknen rapporteras.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";

const NYCKEL = "diag-9f4KpX2wQ7-tillfallig";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== NYCKEL) throw new Response("Not found", { status: 404 });
  const shop = url.searchParams.get("shop") ?? "";
  if (!/^[a-z0-9-]+\.myshopify\.com$/.test(shop)) {
    return json({ error: "ange ?shop=xxx.myshopify.com" }, { status: 400 });
  }

  /* &clear=1 raderar butikens sessioner så nästa anrop tvingar fram ett nytt
     token via token exchange — vägen från evig nyckel till utgående. */
  if (url.searchParams.get("clear") === "1") {
    const borttagna = await prisma.session.deleteMany({ where: { shop } });
    return json({ shop, cleared: borttagna.count });
  }

  const sessions = await prisma.session.findMany({ where: { shop } });
  const rapport: any = {
    shop,
    sessions: sessions.map((s) => ({
      id: s.id,
      isOnline: s.isOnline,
      scope: s.scope,
      expires: s.expires,
      tokenLen: s.accessToken?.length ?? 0,
      tokenPrefix: s.accessToken?.slice(0, 4) ?? null,
    })),
  };

  const offline = sessions.find((s) => !s.isOnline) ?? sessions[0];
  if (!offline?.accessToken) {
    rapport.raw = "ingen offline-token i databasen";
    return json(rapport);
  }

  for (const version of ["2026-07", "2026-04"]) {
    const res = await fetch(`https://${shop}/admin/api/${version}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": offline.accessToken,
      },
      body: JSON.stringify({ query: "{ shop { name currencyCode } }" }),
    });
    const text = await res.text();
    rapport[`v${version}`] = {
      status: res.status,
      statusText: res.statusText,
      requestId: res.headers.get("x-request-id"),
      apiVersionHeader: res.headers.get("x-shopify-api-version"),
      body: text.slice(0, 600),
    };
    if (res.ok) break;
  }
  return json(rapport);
}
