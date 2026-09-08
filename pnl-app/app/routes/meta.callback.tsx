/**
 * Landningen efter Metas inloggning. Ligger utanför /app eftersom Meta skickar
 * hit med en vanlig top-level-redirect utan Shopifys sessionstoken — butiken
 * identifieras i stället av den signerade state-parametern.
 *
 * Gör tre saker: byter koden mot en long-lived token, listar annonskontona
 * och skickar handlaren tillbaka in i appen där kontot väljs. Sparar aldrig
 * något på en butik som inte matchar signaturen.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import type { Prisma } from "@prisma/client";
import prisma from "../db.server";
import { completeMetaLogin, verifyState } from "../lib/meta.server";

function backToApp(shop: string, query: string) {
  const apiKey = process.env.SHOPIFY_API_KEY!;
  return redirect(`https://${shop}/admin/apps/${apiKey}/app/settings?${query}`);
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const shop = verifyState(url.searchParams.get("state") ?? "");
  if (!shop) {
    throw new Response("Ogiltig eller för gammal state-parameter. Börja om från Inställningar.", { status: 400 });
  }

  // Handlaren avbröt i Metas dialog.
  if (url.searchParams.get("error")) {
    return backToApp(shop, `meta=cancelled`);
  }

  const code = url.searchParams.get("code");
  if (!code) return backToApp(shop, `meta=cancelled`);

  try {
    const { accessToken, expiresAt, accounts } = await completeMetaLogin(code);
    const existing = await prisma.shopSettings.findUnique({ where: { shop } });
    /* Har butiken redan valt ett konto som finns i listan behålls det. Annars
       väljs kontot automatiskt när det bara finns ett. */
    const keep = accounts.find((a) => a.id === existing?.metaAdAccountId?.replace(/^act_/, ""));
    const chosen = keep ?? (accounts.length === 1 ? accounts[0] : null);

    await prisma.shopSettings.upsert({
      where: { shop },
      create: {
        shop,
        metaAccessToken: accessToken,
        metaTokenExpiresAt: expiresAt,
        metaConnectedVia: "oauth",
        metaAdAccounts: accounts as unknown as Prisma.InputJsonValue,
        metaAdAccountId: chosen?.id ?? null,
        metaAdAccountCurrency: chosen?.currency ?? null,
      },
      update: {
        metaAccessToken: accessToken,
        metaTokenExpiresAt: expiresAt,
        metaConnectedVia: "oauth",
        metaAdAccounts: accounts as unknown as Prisma.InputJsonValue,
        metaAdAccountId: chosen?.id ?? null,
        metaAdAccountCurrency: chosen?.currency ?? null,
      },
    });
    if (!keep) await prisma.dailySpend.deleteMany({ where: { shop } });

    return backToApp(shop, accounts.length ? `meta=connected` : `meta=noaccounts`);
  } catch (e) {
    console.error("Meta-inloggning misslyckades:", e);
    return backToApp(shop, `meta=failed&reason=${encodeURIComponent((e as Error).message).slice(0, 200)}`);
  }
}
