/**
 * TILLFÄLLIG diagnosrutt. Tas bort när kostnadsluckorna är utredda.
 *
 * Svarar på frågan "vilka SÅLDA produkter saknar inköpspris?" utan att någon
 * behöver öppna butikens admin: dagsraderna (DailyPnl) vet vad som sålts,
 * katalogcachen (CatalogCache) vet vilka varianter som saknar unitCost.
 * Ingen butiksdata utöver titlar, antal och kostnadsstatus lämnar servern.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";
import { shiftIso } from "../lib/daily.server";

const NYCKEL = "diag-kQ8vRx41mZ-tillfallig";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.searchParams.get("key") !== NYCKEL) throw new Response("Not found", { status: 404 });
  const shop = url.searchParams.get("shop") ?? "";
  if (!/^[a-z0-9-]+\.myshopify\.com$/.test(shop)) {
    return json({ error: "ange ?shop=xxx.myshopify.com" }, { status: 400 });
  }
  /* &title=tossut → slå upp varianter (och deras unitCost) vars titel
     innehåller strängen, i den butikens katalogcache. För att jämföra vad
     systerbutiker har inlagt för samma produkt. */
  const titelSok = (url.searchParams.get("title") ?? "").toLowerCase();
  if (titelSok) {
    const kat = await prisma.catalogCache.findUnique({ where: { shop } });
    const träffar = ((kat?.payload as any[]) ?? [])
      .filter((v) => String(v.productTitle ?? "").toLowerCase().includes(titelSok))
      .map((v) => ({ product: v.productTitle, variant: v.variantTitle, price: v.price, unitCost: v.unitCost ?? null }));
    return json({ shop, titelSok, träffar });
  }

  const dagar = Math.min(parseInt(url.searchParams.get("days") ?? "30", 10) || 30, 120);
  const idag = new Date().toISOString().slice(0, 10);
  const from = shiftIso(idag, -(dagar - 1));

  const [rader, katalog] = await Promise.all([
    prisma.dailyPnl.findMany({ where: { shop, day: { gte: from, lte: idag } } }),
    prisma.catalogCache.findUnique({ where: { shop } }),
  ]);

  // Sålda enheter per variant ur dagsraderna.
  const sålt = new Map<string, { title: string; variantTitle: string | null; units: number }>();
  for (const r of rader) {
    for (const p of (r.products as any[]) ?? []) {
      const key = p.variantGid ?? `${p.title}|${p.variantTitle ?? ""}`;
      const agg = sålt.get(key) ?? { title: p.title, variantTitle: p.variantTitle, units: 0 };
      agg.units += p.units ?? 0;
      sålt.set(key, agg);
    }
  }

  // Nuvarande kostnad per variant ur katalogcachen.
  const kostnad = new Map<string, number | null>();
  for (const v of (katalog?.payload as any[]) ?? []) kostnad.set(v.variantGid, v.unitCost ?? null);

  const utanKostnad: any[] = [];
  const medKostnad: any[] = [];
  for (const [key, s] of sålt) {
    if (s.units <= 0) continue;
    const c = kostnad.get(key);
    (c == null ? utanKostnad : medKostnad).push({
      title: s.title,
      variant: s.variantTitle,
      units: s.units,
      ...(c != null ? { unitCost: c } : {}),
    });
  }
  utanKostnad.sort((a, b) => b.units - a.units);

  return json({
    shop,
    period: `${from}..${idag}`,
    dagsrader: rader.length,
    katalogRader: (katalog?.payload as any[])?.length ?? 0,
    säljerUtanKostnad: utanKostnad,
    säljerMedKostnad: medKostnad.length,
  });
}
