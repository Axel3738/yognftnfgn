/**
 * TILLFÄLLIG diagnosrutt — ta bort när grupp/Meta-felsökningen är klar.
 *
 * Svarar på frågan "pratar alla sex Railway-tjänster med SAMMA databas, och
 * hur ser grupp- och Meta-statusen ut per butik?" utan att gå via Shopify-
 * inloggningen. Innehåller inga hemligheter: tokens redovisas bara som
 * ja/nej, groupId förkortas, och bara ägarens egna kända butiker listas.
 */

import { createHash } from "node:crypto";
import { json } from "@remix-run/node";
import prisma from "../db.server";

// Ägarens butiker (samma lista som i CLAUDE.md — redan i repot).
const KANDA = [
  "4snrw0-mg.myshopify.com", // SE
  "1acuam-s5.myshopify.com", // NO
  "q0uthu-xq.myshopify.com", // FI
  "1wucum-x0.myshopify.com", // UK
  "v0xqtk-tx.myshopify.com", // DK
  "stonepnl-test.myshopify.com",
];

const kort = (s: string | null) => (s ? createHash("md5").update(s).digest("hex").slice(0, 8) : null);

export async function loader() {
  const alla = await prisma.shopSettings.findMany({ orderBy: { shop: "asc" } });
  /* Samma databas ⇒ samma fingeravtryck. Skiljer sig ett, har den tjänsten
     en egen DATABASE_URL — och då är felet hittat. */
  const fingeravtryck = createHash("md5")
    .update(alla.map((s) => s.shop).join(","))
    .digest("hex")
    .slice(0, 12);

  const butiker = await Promise.all(
    KANDA.map(async (shop) => {
      const s = alla.find((x) => x.shop === shop);
      if (!s) return { shop, finns: false };
      const [session, spendAntal, spendSenaste, pnlSenaste] = await Promise.all([
        prisma.session.findFirst({ where: { shop }, select: { id: true } }),
        prisma.dailySpend.count({ where: { shop } }),
        prisma.dailySpend.findFirst({ where: { shop }, orderBy: { day: "desc" }, select: { day: true, fetchedAt: true } }),
        prisma.dailyPnl.findFirst({ where: { shop }, orderBy: { day: "desc" }, select: { day: true } }),
      ]);
      return {
        shop,
        finns: true,
        groupId: kort(s.groupId),
        harMetaKonto: Boolean(s.metaAdAccountId),
        harMetaToken: Boolean(s.metaAccessToken),
        spendCurrency: s.spendCurrency,
        currency: s.currency,
        harSession: Boolean(session),
        spendDagar: spendAntal,
        senasteSpendDag: spendSenaste?.day?.toISOString().slice(0, 10) ?? null,
        senasteSpendHamtad: spendSenaste?.fetchedAt?.toISOString() ?? null,
        senastePnlDag: pnlSenaste?.day ?? null,
      };
    }),
  );

  return json({ fingeravtryck, antalButiker: alla.length, butiker });
}
