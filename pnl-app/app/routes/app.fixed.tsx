/**
 * Fasta månadskostnader — abonnemang, anställda, appavgifter.
 * Enkelt formulär (namn + kr/månad), summeras och slås ut per dag i kalkylen.
 */

import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Banner,
  BlockStack,
  Button,
  Card,
  DataTable,
  InlineStack,
  Layout,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const rows = await prisma.fixedCost.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "asc" },
  });
  const monthlyTotal = rows.reduce((a, r) => a + Number(r.monthlyAmount), 0);
  return json({
    rows: rows.map((r) => ({ id: r.id, name: r.name, monthlyAmount: Number(r.monthlyAmount) })),
    monthlyTotal,
    dailyTotal: (monthlyTotal * 12) / 365,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const f = await request.formData();
  const intent = String(f.get("intent") ?? "add");

  if (intent === "delete") {
    // deleteMany med shop-filter: en butik kan aldrig radera en annans rad.
    await prisma.fixedCost.deleteMany({
      where: { id: String(f.get("id")), shop: session.shop },
    });
    return json({ ok: true });
  }

  const name = String(f.get("name") ?? "").trim();
  const amount = parseFloat(String(f.get("monthlyAmount") ?? "").replace(",", "."));
  if (!name || !Number.isFinite(amount) || amount < 0) {
    return json({ ok: false, message: "Ange ett namn och en kostnad i kronor per månad." }, { status: 400 });
  }
  await prisma.fixedCost.create({
    data: { shop: session.shop, name, monthlyAmount: amount },
  });
  return json({ ok: true });
}

export default function FixedCosts() {
  const { rows, monthlyTotal, dailyTotal } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const nf = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 0 });

  const submit = () => {
    fetcher.submit({ intent: "add", name, monthlyAmount: amount }, { method: "POST" });
    setName("");
    setAmount("");
  };

  return (
    <Page
      title="Fasta kostnader"
      subtitle={`${nf.format(monthlyTotal)} kr/månad → ${nf.format(dailyTotal)} kr/dag i kalkylen`}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">
                Lägg till kostnad
              </Text>
              <Text as="p" tone="subdued">
                Abonnemang, appar, anställda, bokföring — allt som kostar per månad oavsett
                försäljning. Summan slås ut per dag och dras från nettovinsten.
              </Text>
              <InlineStack gap="300" blockAlign="end" wrap>
                <div style={{ minWidth: 220, flex: 1 }}>
                  <TextField
                    label="Namn"
                    value={name}
                    onChange={setName}
                    autoComplete="off"
                    placeholder="t.ex. Shopify-abonnemang"
                  />
                </div>
                <div style={{ minWidth: 140 }}>
                  <TextField
                    label="Kostnad (kr/månad)"
                    value={amount}
                    onChange={setAmount}
                    autoComplete="off"
                    placeholder="299"
                  />
                </div>
                <Button variant="primary" onClick={submit} loading={fetcher.state !== "idle"}>
                  Lägg till
                </Button>
              </InlineStack>
              {fetcher.data && !fetcher.data.ok ? (
                <Banner tone="critical">{(fetcher.data as { message?: string }).message}</Banner>
              ) : null}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card padding="0">
            {rows.length ? (
              <DataTable
                columnContentTypes={["text", "numeric", "numeric", "text"]}
                headings={["Namn", "Kr/månad", "Kr/dag", ""]}
                rows={rows.map((r) => [
                  r.name,
                  nf.format(r.monthlyAmount),
                  nf.format((r.monthlyAmount * 12) / 365),
                  <Button
                    key={r.id}
                    variant="plain"
                    tone="critical"
                    onClick={() =>
                      fetcher.submit({ intent: "delete", id: r.id }, { method: "POST" })
                    }
                  >
                    Ta bort
                  </Button>,
                ])}
                totals={[`${rows.length} poster`, nf.format(monthlyTotal), nf.format(dailyTotal), ""]}
              />
            ) : (
              <div style={{ padding: 16 }}>
                <Text as="p" tone="subdued">
                  Inga fasta kostnader inlagda än. Nettovinsten räknas utan dem tills du lägger
                  till några.
                </Text>
              </div>
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
