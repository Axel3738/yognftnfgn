/**
 * Kostnadsimporten — delad mellan Kostnader-sidan (inloggad handlare) och
 * bakgrundsvägar som skriver med butikens sparade offline-nyckel.
 *
 * CSV-format: produkttitel;varianttitel;kostnad  (kostnad "88.34|134.22|180.19"
 * = totalpris för 1|2|3 st i samma orderrad). Tom varianttitel = alla varianter.
 */

import type { Texts } from "./texts";
import { fetchVariantCosts, invalidateCatalog, invalidateVariantCosts, setUnitCost } from "./shopify-data.server";

export interface ImportResult {
  ok: boolean;
  message: string;
  applied: string[];
  skipped: string[];
}

export async function importCostCsv(
  admin: any,
  shop: string,
  prisma: any,
  csv: string,
  effectiveFrom: string,
  T: Texts,
): Promise<ImportResult> {
  /* Tålig radtolkning: semikolon är formatet, men text som passerat Excel
     kommer med tabbar och kommadecimaler. Sista kolumnen är alltid kostnaden. */
  const parseLine = (line: string) => {
    let parts = line.split(/[;\t]/).map((x) => x.trim());
    if (parts.length < 2) parts = line.split(/\s{2,}/).map((x) => x.trim());
    /* Mallen har fyra kolumner: titel;variant;kostnad;pris. Priset finns med
       som referens — det gör mallen matchbar mellan butiker på olika språk,
       där titeln inte hjälper — men det är kostnaden som ska skrivas.
       Tre kolumner är det handskrivna formatet: sista kolumnen är kostnaden. */
    const fyra = parts.length >= 4;
    /* Flerpack i kostnadskolumnen. Två former, båda giltiga:
         "88.34|2:134.22|3:180.19"  — antalet står utskrivet (det mallen
                                       exporterar sedan 2026-09-10)
         "88.34|134.22|180.19"      — positionell: 1, 2, 3 st (äldre filer)
       Antalet MÅSTE kunna skrivas ut: en offert staffar ofta 1/50/100, och
       den positionella formen läste tillbaka 50-packet som ett tvåpack —
       en order med 2 st fick då 50-packets pris. */
    const tal = (x: string) => parseFloat(String(x ?? "").trim().replace(",", "."));
    const celler = (fyra ? parts[2] : parts[parts.length - 1] ?? "").split("|").map((x) => x.trim());
    const steg = celler.slice(1).map((cell, i) => {
      const bit = cell.split(":");
      return bit.length > 1
        ? { units: Math.round(tal(bit[0])), totalCost: tal(bit[1]) }
        : { units: i + 2, totalCost: tal(cell) };
    });
    /* CostTier har unique(shop, variantGid, units) — samma antal två gånger
       i en fil hade spräckt skrivningen efter att de gamla stegen raderats. */
    const perAntal = new Map<number, number>();
    for (const t of steg) {
      if (Number.isFinite(t.units) && t.units >= 2 && Number.isFinite(t.totalCost)) {
        perAntal.set(t.units, t.totalCost);
      }
    }
    return {
      product: parts[0] ?? "",
      variant: fyra ? parts[1] : parts.length >= 3 ? parts.slice(1, -1).join(" ").trim() : "",
      cost: tal(celler[0] ?? ""),
      tiers: [...perAntal.entries()].sort((a, b) => a[0] - b[0]).map(([units, totalCost]) => ({ units, totalCost })),
    };
  };
  const applied: string[] = [];
  const skipped: string[] = [];
  const rawLines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#") && !/^B[äa]verbutiken inköpspriser/i.test(l));
  const parsed = rawLines.map(parseLine).filter((r) => r.product && Number.isFinite(r.cost));

  if (!parsed.length) {
    const sample = rawLines[0] ? T.costs.firstRowParsed(JSON.stringify(parseLine(rawLines[0]))) : "";
    return { ok: false, message: T.costs.noValidRows(sample), applied, skipped };
  }

  const catalog = await fetchVariantCosts(admin);

  /* Leverantörsofferter skriver "6-18 hk" där butiken har "6 - 18 hk" eller
     "6–18 hk" — samma variant, olika streck. Jämför därför på en städad form.
     En rad får också träffa via ett enda alternativ ("6 - 18 hk" träffar
     "Svart / 6 - 18 hk", "Blå / 6 - 18 hk" …) så att en storleksprislista
     inte behöver upprepas per färg. */
  const norm = (s: string) =>
    s.toLowerCase().replace(/[–—−]/g, "-").replace(/\s*([-/])\s*/g, "$1").replace(/\s+/g, " ").trim();
  const variantMatches = (variantTitle: string, wanted: string) => {
    if (wanted === "") return true;
    const w = norm(wanted);
    const v = norm(variantTitle);
    return v === w || v.split("/").includes(w);
  };

  for (const row of parsed) {
    // Tom varianttitel = alla varianter i produkten.
    const targets = catalog.all.filter(
      (v) => norm(v.productTitle) === norm(row.product) && variantMatches(v.variantTitle, row.variant),
    );
    if (!targets.length) {
      skipped.push(`${row.product}${row.variant ? ` · ${row.variant}` : ""}`);
      continue;
    }

    for (const target of targets) {
      const res = await setUnitCost(admin, target.inventoryItemGid, row.cost);
      if (!res.ok) {
        skipped.push(`${target.productTitle} · ${target.variantTitle}: ${res.error}`);
        continue;
      }
      applied.push(`${target.productTitle} · ${target.variantTitle}`);

      /* Stegen ersätter variantens tidigare steg — filen är sanningen. En rad
         utan steg rör dem inte, så en vanlig prislista raderar inga flerpack. */
      if (row.tiers.length) {
        await prisma.costTier.deleteMany({ where: { shop: shop, variantGid: target.variantGid } });
        await prisma.costTier.createMany({
          data: row.tiers.map((t) => ({
            shop: shop, variantGid: target.variantGid, units: t.units, totalCost: t.totalCost,
          })),
        });
      }

      // Historik, så att äldre perioder räknas på den kostnad som gällde då.
      if (effectiveFrom) {
        await prisma.costChange.create({
          data: {
            shop: shop,
            productGid: target.productGid,
            variantGid: row.variant ? target.variantGid : null,
            unitCost: row.cost,
            effectiveFrom: new Date(effectiveFrom),
            note: T.costs.costNote(effectiveFrom),
          },
        });
      }
    }
  }


  invalidateVariantCosts(shop);
  await invalidateCatalog(shop, prisma);
  return {
    ok: true,
    message: T.costs.updatedMsg(applied.length, skipped.length, skipped.slice(0, 5).join(", ")),
    applied,
    skipped,
  };
}
