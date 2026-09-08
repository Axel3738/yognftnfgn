/**
 * Tolkar en export av inköpspriser från en annan vinstapp (Juicy, TrueProfit,
 * BeProfit, Lifetimely …) eller från ett kalkylblad, utan att handlaren ska
 * behöva veta något om kolumner.
 *
 * Ren text in, matchade varianter ut. Ingen I/O — allt går att testa utan
 * Shopify. Tre saker den klarar själv:
 *
 *  1. Avgränsaren (semikolon, komma, tabb) — räknas på första raden.
 *  2. Rubrikraden — känns igen på ordet i kostnadskolumnen (cost, cogs,
 *     inköp, kostnad …). Saknas rubrik gäller det gamla positionsformatet
 *     `produkttitel;varianttitel;kostnad`.
 *  3. Matchningen — variant-ID först (exakt), sedan SKU (exakt), sist titel.
 *     Aldrig gissning: en rad som inte hittar sin variant rapporteras, den
 *     skrivs inte till närmaste likhet.
 */

import type { VariantCatalog, VariantCost } from "./shopify-data.server";

export interface ImportRow {
  line: number;
  product: string;
  variant: string;
  sku: string;
  variantId: string;
  cost: number | null;
}

export interface ParseResult {
  rows: ImportRow[];
  /** Vilka kolumner som hittades — visas för handlaren så tolkningen är synlig. */
  columns: Record<"product" | "variant" | "sku" | "variantId" | "cost", string | null>;
  delimiter: string;
  hadHeader: boolean;
}

/* Namn (gemener) som känns igen per kolumn. Ordningen spelar ingen roll;
   första träffen per kolumn vinner. */
const NAMES = {
  cost: [
    "cost", "cogs", "unit cost", "unit_cost", "unitcost", "cost per item", "cost_per_item",
    "product cost", "product_cost", "item cost", "purchase price", "supplier cost", "landed cost",
    "kostnad", "inköp", "inkop", "inköpspris", "inkopspris", "cost price", "costprice", "cost (per unit)",
  ],
  variantId: ["variant id", "variant_id", "variantid", "variant gid", "shopify variant id", "shopify_variant_id", "variant-id"],
  sku: ["sku", "artikelnummer", "artikelnr", "variant sku", "variant_sku", "item sku"],
  variant: ["variant", "variant title", "variant_title", "varianttitle", "varianttitel", "option", "variant name", "variant_name"],
  product: ["product", "product title", "product_title", "producttitle", "title", "produkt", "produkttitel", "product name", "product_name", "name", "item", "item name"],
} as const;

type Col = keyof typeof NAMES;

const norm = (s: string) => s.trim().toLowerCase().replace(/^"|"$/g, "").replace(/\s+/g, " ");

export function detectDelimiter(firstLine: string): string {
  const counts: [string, number][] = [
    [";", (firstLine.match(/;/g) ?? []).length],
    ["\t", (firstLine.match(/\t/g) ?? []).length],
    [",", (firstLine.match(/,/g) ?? []).length],
  ];
  counts.sort((a, b) => b[1] - a[1]);
  return counts[0][1] > 0 ? counts[0][0] : ";";
}

/** Delar en CSV-rad med hänsyn till citattecken. */
export function splitLine(line: string, delimiter: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++; }
      else quoted = !quoted;
    } else if (ch === delimiter && !quoted) {
      out.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((x) => x.trim());
}

/** Tal med komma eller punkt, valfri valutasymbol/tusentalsavgränsare. */
export function parseMoney(raw: string): number | null {
  let s = raw.trim().replace(/[^\d,.\-]/g, "");
  if (!s) return null;
  // "1 234,50" → "1234,50"; "1,234.50" → "1234.50"; "81,92" → "81.92"
  if (s.includes(",") && s.includes(".")) {
    s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }
  const n = parseFloat(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function detectHeader(cells: string[]): Partial<Record<Col, number>> | null {
  const idx: Partial<Record<Col, number>> = {};
  const lowered = cells.map(norm);
  for (const col of Object.keys(NAMES) as Col[]) {
    const names: readonly string[] = NAMES[col];
    const i = lowered.findIndex((c, ci) => names.includes(c) && !Object.values(idx).includes(ci));
    if (i >= 0) idx[col] = i;
  }
  // En rubrikrad måste åtminstone peka ut kostnaden — annars är det data.
  return idx.cost != null ? idx : null;
}

export function parseCostText(text: string): ParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l, i) => ({ i: i + 1, l: l.replace(/^﻿/, "") }))
    .filter(({ l }) => l.trim() && !l.trim().startsWith("#"));

  const empty: ParseResult = {
    rows: [],
    columns: { product: null, variant: null, sku: null, variantId: null, cost: null },
    delimiter: ";",
    hadHeader: false,
  };
  if (!lines.length) return empty;

  const delimiter = detectDelimiter(lines[0].l);
  const first = splitLine(lines[0].l, delimiter);
  const header = detectHeader(first);

  const columns = { ...empty.columns };
  let idx: Partial<Record<Col, number>>;
  let dataLines = lines;
  if (header) {
    idx = header;
    dataLines = lines.slice(1);
    for (const col of Object.keys(idx) as Col[]) columns[col] = first[idx[col]!] || null;
  } else {
    /* Positionsformatet: produkt;variant;kostnad (två kolumner = produkt;kostnad). */
    const n = first.length;
    idx = n >= 3 ? { product: 0, variant: 1, cost: n - 1 } : { product: 0, cost: n - 1 };
    columns.product = "kolumn 1";
    if (n >= 3) columns.variant = "kolumn 2";
    columns.cost = `kolumn ${n}`;
  }

  const get = (cells: string[], col: Col) => (idx[col] != null ? (cells[idx[col]!] ?? "") : "");
  const rows: ImportRow[] = dataLines.map(({ i, l }) => {
    const cells = splitLine(l, delimiter);
    return {
      line: i,
      product: get(cells, "product").trim(),
      variant: get(cells, "variant").trim(),
      sku: get(cells, "sku").trim(),
      variantId: get(cells, "variantId").trim(),
      cost: parseMoney(get(cells, "cost")),
    };
  });

  return { rows, columns, delimiter, hadHeader: Boolean(header) };
}

export interface MatchResult {
  matched: { row: ImportRow; targets: VariantCost[]; via: "variantId" | "sku" | "title" }[];
  unmatched: { row: ImportRow; reason: string }[];
}

const tkey = (product: string, variant: string) =>
  `${product.trim().toLowerCase()} ${variant.trim().toLowerCase()}`;

/** Slår ihop importraderna med katalogen. Variant-ID > SKU > titel. */
export function matchRows(rows: ImportRow[], catalog: VariantCatalog): MatchResult {
  const matched: MatchResult["matched"] = [];
  const unmatched: MatchResult["unmatched"] = [];

  for (const row of rows) {
    if (row.cost == null) {
      unmatched.push({ row, reason: "kostnaden gick inte att läsa" });
      continue;
    }

    if (row.variantId) {
      const numeric = row.variantId.replace(/\D/g, "");
      const gid = row.variantId.startsWith("gid://") ? row.variantId : `gid://shopify/ProductVariant/${numeric}`;
      const hit = catalog.byGid.get(gid);
      if (hit) { matched.push({ row, targets: [hit], via: "variantId" }); continue; }
    }

    if (row.sku) {
      const hit = catalog.bySku.get(row.sku.toLowerCase());
      if (hit) { matched.push({ row, targets: [hit], via: "sku" }); continue; }
    }

    if (row.product) {
      const exact = row.variant
        ? [catalog.byTitle.get(tkey(row.product, row.variant))].filter(Boolean) as VariantCost[]
        : catalog.all.filter((v) => v.productTitle.trim().toLowerCase() === row.product.trim().toLowerCase());
      /* Rad utan varianttitel på en produkt med varianter: samma kostnad på
         alla. Det är avsiktligt — det är så en leverantörsprislista ser ut. */
      if (exact.length) { matched.push({ row, targets: exact, via: "title" }); continue; }
    }

    const label = row.variantId || row.sku || `${row.product}${row.variant ? ` · ${row.variant}` : ""}` || `rad ${row.line}`;
    unmatched.push({ row, reason: `hittar ingen variant för "${label}"` });
  }

  return { matched, unmatched };
}
