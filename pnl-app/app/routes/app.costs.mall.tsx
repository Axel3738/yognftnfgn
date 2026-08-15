/**
 * Nedladdningsbar CSV-mall med butikens egna produkter.
 *
 * Poängen: importen matchar på produkttitel, och en titel som avviker på ett
 * tecken hoppas över. Att be handlaren skriva titlarna själv är därför att be
 * om fel. Mallen innehåller butikens exakta titlar — kvar att fylla i är bara
 * kostnadskolumnen, och filen kan skickas vidare till den som sitter på
 * inköpspriserna och droppas tillbaka som den är.
 */

import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { fetchVariantCosts } from "../lib/shopify-data.server";

/* Semikolon är kolumnavgränsare. En titel som innehåller ett sådant skulle
   dela raden på fel ställe, så det byts mot komma i mallen. */
const safe = (s: string) => s.replace(/;/g, ",").trim();

export async function loader({ request }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.admin(request);
  const catalog = await fetchVariantCosts(admin, session.shop);

  const rows = [...catalog.all].sort((a, b) => {
    // Saknade kostnader först — det är dem mallen finns till för.
    if ((a.unitCost == null) !== (b.unitCost == null)) return a.unitCost == null ? -1 : 1;
    const t = a.productTitle.localeCompare(b.productTitle, "sv");
    return t !== 0 ? t : a.variantTitle.localeCompare(b.variantTitle, "sv");
  });

  const lines = [
    "# Inköpspriser — produkttitel;varianttitel;kostnad",
    "# Kostnaden är vara + frakt, UTAN tull. Tullen är per order och ligger i Inställningar.",
    "# Lämna varianttiteln tom för att sätta samma kostnad på alla varianter i produkten.",
    "# Rader som börjar med # ignoreras. Ändra inte titlarna — de matchas mot butiken.",
    ...rows.map((r) => {
      // Enkelvariantprodukter får tom variantkolumn — kortare och tåligare.
      const variant = r.variantTitle === "Default Title" ? "" : safe(r.variantTitle);
      return `${safe(r.productTitle)};${variant};${r.unitCost ?? ""}`;
    }),
  ];

  const filename = `inkopspriser-${session.shop.replace(/\.myshopify\.com$/, "")}.csv`;
  return new Response("﻿" + lines.join("\n") + "\n", {
    headers: {
      // BOM ovan gör att Excel öppnar å/ä/ö rätt istället för som mojibake.
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
