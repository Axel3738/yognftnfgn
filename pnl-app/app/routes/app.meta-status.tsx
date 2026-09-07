/**
 * Billig statusfråga för Settings-sidan medan inloggningsfönstret är öppet:
 * "har en Meta-token sparats sedan jag klickade?" Bara en databasläsning —
 * att polla hela Settings-loadern hade ringt Meta (kontolistan) var tredje
 * sekund. Resursrutt; anropas med fetcher.load och Shopifys sessions-token.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const s = await prisma.shopSettings.findUnique({
    where: { shop: session.shop },
    select: { metaTokenSavedAt: true, metaTokenSource: true },
  });
  return json(
    {
      savedAt: s?.metaTokenSavedAt?.toISOString() ?? null,
      source: s?.metaTokenSource ?? null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
