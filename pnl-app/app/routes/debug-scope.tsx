/**
 * TILLFÄLLIG diagnosrutt. Tas bort när felet är hittat.
 *
 * Visar vad tjänsten är konfigurerad med (scopes, valfria funktioner) mot
 * vad butikernas sparade sessioner faktiskt har — en skillnad där betyder
 * att biblioteket skickar butiken till en omauktorisering vid varje besök.
 * Inga nycklar, ingen kunddata.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";

const NYCKEL = "scp-Hn3vB6kL2-tillfallig";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== NYCKEL) throw new Response("Not found", { status: 404 });

  const sessions = await prisma.session.findMany({
    select: { shop: true, isOnline: true, scope: true, expires: true, refreshTokenExpires: true },
    orderBy: { shop: "asc" },
  });
  const settings = await prisma.shopSettings.findMany({
    select: { shop: true, groupId: true, currency: true, language: true, metaAdAccountId: true },
  });
  const env = process.env;
  return json({
    service: env.SHOPIFY_APP_URL,
    envScopes: env.SCOPES,
    planGate: env.PLAN_GATE ?? null,
    metaLogin: Boolean(env.META_APP_ID && env.META_APP_SECRET),
    anthropic: Boolean(env.ANTHROPIC_API_KEY),
    sessions: sessions.map((s) => ({
      shop: s.shop,
      online: s.isOnline,
      scope: s.scope,
      expires: s.expires,
      refreshExpires: s.refreshTokenExpires,
      matcharEnv: (s.scope ?? "") === (env.SCOPES ?? ""),
    })),
    settings,
  });
}
