/**
 * TILLFÄLLIG diagnosrutt. Tas bort när inköpspriserna är ifyllda.
 *
 * Listar varianter utan inköpspris ur katalogcachen, och hur mycket av dem
 * som faktiskt sålts enligt dagsraderna — så att arbetet kan riktas mot det
 * som kostar pengar först. Ingen kundinformation, inga nycklar.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";

const NYCKEL = "diag-cQ3nB8vT5-tillfallig";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== NYCKEL) throw new Response("Not found", { status: 404 });
  const shop = url.searchParams.get("shop") ?? "";
  if (!/^[a-z0-9-]+\.myshopify\.com$/.test(shop)) {
    return json({ error: "ange ?shop=xxx.myshopify.com" }, { status: 400 });
  }
  const dagar = Math.min(parseInt(url.searchParams.get("days") ?? "60", 10) || 60, 180);
  const from = new Date(Date.now() - dagar * 86400000).toISOString().slice(0, 10);

  const [kat, rader] = await Promise.all([
    prisma.catalogCache.findUnique({ where: { shop } }),
    prisma.dailyPnl.findMany({ where: { shop, day: { gte: from } } }),
  ]);

  const salda = new Map<string, number>();
  for (const r of rader) {
    for (const p of ((r.products as any[]) ?? [])) {
      const k = p.variantGid ?? `${p.title}|${p.variantTitle ?? ""}`;
      salda.set(k, (salda.get(k) ?? 0) + (p.units ?? 0));
    }
  }

  const alla = (kat?.payload as any[]) ?? [];
  const perProdukt = new Map<string, any>();
  for (const v of alla) {
    const p = perProdukt.get(v.productTitle) ?? {
      produkt: v.productTitle, pris: v.price, varianter: 0, utanKostnad: 0, salda: 0,
    };
    p.varianter += 1;
    if (v.unitCost == null) p.utanKostnad += 1;
    p.salda += salda.get(v.variantGid) ?? 0;
    p.pris = Math.max(p.pris, v.price);
    perProdukt.set(v.productTitle, p);
  }

  const saknar = [...perProdukt.values()].filter((p) => p.utanKostnad > 0);
  saknar.sort((a, b) => b.salda - a.salda || b.pris - a.pris);

  return json({
    shop,
    katalogVarianter: alla.length,
    produkterTotalt: perProdukt.size,
    produkterUtanKostnad: saknar.length,
    varianterUtanKostnad: saknar.reduce((a, p) => a + p.utanKostnad, 0),
    saldaUtanKostnad: saknar.reduce((a, p) => a + p.salda, 0),
    lista: saknar,
  });
}
