/**
 * TILLFÄLLIG diagnosrutt. Tas bort när valutafrågan är utredd.
 *
 * Visar hur annonskostnaden lagrats per butik: butikens valuta, annonskontots
 * valuta, och de sparade dagsraderna med både råbelopp och kurs. Räcker för
 * att avgöra om ett belopp räknats om en gång, noll gånger eller två.
 * Läcker ingen nyckel — kontot maskeras till fyra sista tecken.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";

const NYCKEL = "diag-vX7mQ2pL9-tillfallig";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== NYCKEL) throw new Response("Not found", { status: 404 });

  const dagar = Math.min(parseInt(url.searchParams.get("days") ?? "7", 10) || 7, 40);
  const from = new Date(Date.now() - dagar * 86400000);

  const butiker = await prisma.shopSettings.findMany({ orderBy: { shop: "asc" } });
  const ut: any[] = [];

  for (const b of butiker) {
    const rader = await prisma.dailySpend.findMany({
      where: { shop: b.shop, day: { gte: from } },
      orderBy: { day: "asc" },
    });
    ut.push({
      shop: b.shop,
      butiksvaluta: b.currency,
      annonskontots_valuta: b.spendCurrency ?? null,
      metaKonto: b.metaAdAccountId ? "…" + b.metaAdAccountId.slice(-4) : null,
      harToken: Boolean(b.metaAccessToken),
      summa_spend: rader.reduce((a, r) => a + Number(r.spend), 0),
      dagar: rader.map((r) => ({
        dag: r.day.toISOString().slice(0, 10),
        spend: Number(r.spend),
        spendRaw: r.spendRaw == null ? null : Number(r.spendRaw),
        fxRate: r.fxRate == null ? null : Number(r.fxRate),
      })),
    });
  }
  return json({ butiker: ut });
}
