/**
 * TILLFÄLLIG diagnosrutt — ta bort när grupp/Meta-felsökningen är klar.
 *
 * Svarar på frågan "pratar alla sex Railway-tjänster med SAMMA databas, och
 * hur ser grupp- och Meta-statusen ut per butik?" utan att gå via Shopify-
 * inloggningen. Med ?probe=1 testar tjänsten dessutom varje butiks sparade
 * Shopify-token, Meta-token och FX-anropet — och rapporterar de RÅA felen,
 * inte en tolkning av dem (mönstret som löste auth-sagan).
 *
 * Innehåller inga hemligheter: tokens redovisas bara som ja/nej eller
 * felmeddelande, groupId förkortas, och bara ägarens egna kända butiker
 * listas.
 */

import { createHash } from "node:crypto";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import prisma from "../db.server";
import { decrypt } from "../lib/crypto.server";

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

/** Kort, hemlighetsfri sammanfattning av ett API-svar. */
async function proba(fn: () => Promise<string>): Promise<string> {
  try {
    return await fn();
  } catch (e) {
    return `FEL: ${(e as Error).message}`;
  }
}

async function probaShopify(shop: string): Promise<string> {
  const session = await prisma.session.findFirst({ where: { shop, isOnline: false } });
  const token = session?.accessToken ? decrypt(session.accessToken) : null;
  if (!token) return "FEL: ingen offline-token i Session-tabellen";
  const res = await fetch(`https://${shop}/admin/api/2026-07/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": token },
    body: JSON.stringify({ query: "{ shop { name } }" }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) return `FEL ${res.status}: ${JSON.stringify(body?.errors ?? body).slice(0, 300)}`;
  if (body?.errors) return `FEL: ${JSON.stringify(body.errors).slice(0, 300)}`;
  return `ok (${body?.data?.shop?.name})`;
}

async function probaMeta(shop: string): Promise<string> {
  const s = await prisma.shopSettings.findUnique({ where: { shop } });
  if (!s?.metaAdAccountId || !s?.metaAccessToken) return "FEL: Meta ej konfigurerad";
  const token = decrypt(s.metaAccessToken);
  const account = s.metaAdAccountId.startsWith("act_") ? s.metaAdAccountId : `act_${s.metaAdAccountId}`;
  const url = new URL(`https://graph.facebook.com/v21.0/${account}`);
  url.searchParams.set("fields", "currency");
  url.searchParams.set("access_token", token!);
  const res = await fetch(url);
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = body?.error ?? {};
    return `FEL ${res.status} (kod ${err.code ?? "?"}): ${String(err.message ?? "").slice(0, 300)}`;
  }
  return `ok (${body?.currency})`;
}

async function probaFx(base: string, quote: string): Promise<string> {
  if (base === quote) return "behövs ej (samma valuta)";
  const res = await fetch(`https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${quote}`);
  const text = await res.text();
  if (!res.ok) return `FEL ${res.status}: ${text.slice(0, 300)}`;
  const body = JSON.parse(text);
  const v = body?.rates?.[quote];
  return typeof v === "number" ? `ok (${v}, dag ${body?.date})` : `FEL: inget värde i svaret: ${text.slice(0, 200)}`;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const probe = new URL(request.url).searchParams.get("probe") === "1";
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
        const rad: Record<string, unknown> = {
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
        if (probe) {
          const [shopify, meta, fx] = await Promise.all([
            proba(() => probaShopify(shop)),
            proba(() => probaMeta(shop)),
            proba(() => probaFx(s.spendCurrency ?? "SEK", s.currency)),
          ]);
          rad.probShopify = shopify;
          rad.probMeta = meta;
          rad.probFx = fx;
        }
        return rad;
      }),
    );

    return json({ fingeravtryck, antalButiker: alla.length, butiker });
  } catch (e) {
    return json({ fel: (e as Error).message }, { status: 500 });
  }
}
