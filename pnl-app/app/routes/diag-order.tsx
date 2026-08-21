/**
 * TILLFÄLLIG diagnosrutt — ta bort när orderfelsökningen är klar.
 *
 * Kräver ?k=<token> (hårdkodad nedan, privat repo, kortlivad rutt): utan den
 * 404. Föregångaren låg helt öppen och kunde trigga externa API-anrop från
 * vem som helst — gör inte om det.
 *
 * Visar, per butik, vad butikens EGEN sparade nyckel får tillbaka när den
 * frågar efter dagens ordrar — det råa Shopify-svaret, inte en tolkning.
 * Det är så vi ser skillnad på "sålde inget" och "fick inte fråga".
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";
import { decrypt } from "../lib/crypto.server";

const NYCKEL = "MhnCkAciVygF7mcEE5-2AZHnduopib03";

const KANDA = [
  "4snrw0-mg.myshopify.com",
  "1acuam-s5.myshopify.com",
  "q0uthu-xq.myshopify.com",
  "1wucum-x0.myshopify.com",
  "v0xqtk-tx.myshopify.com",
];

const dagIZon = (tz: string) =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date());

export async function loader({ request }: LoaderFunctionArgs) {
  if (new URL(request.url).searchParams.get("k") !== NYCKEL) {
    throw new Response("Not Found", { status: 404 });
  }

  const butiker = await Promise.all(
    KANDA.map(async (shop) => {
      const [session, settings] = await Promise.all([
        prisma.session.findFirst({ where: { shop, isOnline: false } }),
        prisma.shopSettings.findUnique({ where: { shop } }),
      ]);
      const token = session?.accessToken ? decrypt(session.accessToken) : null;
      const tz = settings?.timezone ?? "UTC";
      const idag = dagIZon(tz);

      const rad = await prisma.dailyPnl.findUnique({
        where: { shop_day: { shop, day: idag } },
        select: { orders: true, totalSales: true, fetchedAt: true },
      });
      const lagrad = rad
        ? { orders: rad.orders, totalSales: rad.totalSales, fetchedAt: rad.fetchedAt.toISOString() }
        : null;

      const nyckel = {
        harToken: Boolean(token),
        expires: session?.expires?.toISOString() ?? null,
        utgangen: session?.expires ? session.expires.getTime() < Date.now() : null,
        harRefreshToken: Boolean(session?.refreshToken),
        refreshUtgar: session?.refreshTokenExpires?.toISOString() ?? null,
      };

      if (!token) return { shop, tz, idag, lagrad, nyckel, scope: session?.scope ?? null, fraga: "FEL: ingen offline-nyckel" };

      /* Exakt samma fråga som runOrdersPaginated ställer. */
      let fraga: string;
      try {
        const res = await fetch(`https://${shop}/admin/api/2026-07/graphql.json`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
          body: JSON.stringify({
            query: `query Orders($q: String!) {
              orders(first: 50, query: $q) {
                nodes { id createdAt totalPriceSet { shopMoney { amount } } }
              }
            }`,
            variables: { q: `created_at:>='${idag}' AND created_at:<='${idag}'` },
          }),
          signal: AbortSignal.timeout(20_000),
        });
        const body: any = await res.json();
        if (body?.errors?.length) {
          fraga = `FEL ${res.status}: ${JSON.stringify(body.errors).slice(0, 400)}`;
        } else if (!body?.data?.orders) {
          fraga = `FEL: data.orders saknas (HTTP ${res.status}): ${JSON.stringify(body).slice(0, 300)}`;
        } else {
          const n = body.data.orders.nodes ?? [];
          const summa = n.reduce((a: number, o: any) => a + Number(o?.totalPriceSet?.shopMoney?.amount ?? 0), 0);
          fraga = `ok: ${n.length} ordrar, ${summa.toFixed(2)} i butikens valuta`;
        }
      } catch (e) {
        fraga = `KASTADE: ${(e as Error).message}`;
      }

      return { shop, tz, idag, valuta: settings?.currency, scope: session?.scope ?? null, nyckel, lagrad, fraga };
    }),
  );

  return json({ butiker });
}
