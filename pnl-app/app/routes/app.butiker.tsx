/**
 * Koppla ihop butiker.
 *
 * Alla butiker delar databas, men gemensam databas är inte samma sak som
 * gemensam ägare — och en panel som visar grannens omsättning för att raderna
 * råkar ligga i samma tabell vore ett dataläckage, inte en funktion. Därför
 * kopplas butiker bara ihop av någon som bevisligen är inloggad i båda: en
 * kortlivad engångskod skapas i den ena och löses in i den andra.
 */

import { randomBytes, randomUUID } from "node:crypto";
import { useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import {
  Badge,
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
import { asLang, t } from "../lib/texts";

const KOD_MINUTER = 30;
const namn = (shop: string) => shop.replace(/\.myshopify\.com$/, "");

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const mig = await prisma.shopSettings.upsert({
    where: { shop: session.shop },
    create: { shop: session.shop },
    update: {},
  });

  const gruppen = mig.groupId
    ? await prisma.shopSettings.findMany({
        where: { groupId: mig.groupId },
        orderBy: { shop: "asc" },
      })
    : [mig];

  // Koden visas hela giltighetstiden, även efter första inlösningen — den
  // återanvänds tills den går ut, så "använd" betyder inte "förbrukad".
  const aktivKod = await prisma.storeLinkCode.findFirst({
    where: { createdBy: session.shop, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  return json({
    lang: asLang(mig.language),
    shop: session.shop,
    butiker: gruppen.map((g) => ({
      shop: g.shop,
      currency: g.currency,
      jag: g.shop === session.shop,
    })),
    kopplad: Boolean(mig.groupId) && gruppen.length > 1,
    aktivKod: aktivKod ? { code: aktivKod.code, expiresAt: aktivKod.expiresAt.toISOString() } : null,
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const intent = String(form.get("intent"));
  // Meddelandena visas i UI:t — hämta butikens språk först.
  const mig = await prisma.shopSettings.findUnique({ where: { shop: session.shop } });
  const T = t(asLang(mig?.language));

  if (intent === "kod") {
    // Först ut skapar gruppen; nästa butik ansluter till den.
    let groupId = mig?.groupId;
    if (!groupId) {
      groupId = randomUUID();
      await prisma.shopSettings.update({ where: { shop: session.shop }, data: { groupId } });
    }
    /* Sex tecken utan 0/O och 1/I — koden läses av en människa mellan två
       webbläsarflikar, och en felläst kod är en onödig felsökningsrunda. */
    const alfabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    const kod = Array.from(randomBytes(6))
      .map((b) => alfabet[b % alfabet.length])
      .join("");
    await prisma.storeLinkCode.create({
      data: {
        code: kod,
        groupId,
        createdBy: session.shop,
        expiresAt: new Date(Date.now() + KOD_MINUTER * 60 * 1000),
      },
    });
    return json({ ok: true, message: T.stores.codeCreated(kod, KOD_MINUTER) });
  }

  if (intent === "los-in") {
    const kod = String(form.get("code") ?? "").trim().toUpperCase();
    const rad = await prisma.storeLinkCode.findUnique({ where: { code: kod } });
    if (!rad || rad.expiresAt < new Date()) {
      return json({ ok: false, message: T.stores.codeInvalid }, { status: 400 });
    }
    if (rad.createdBy === session.shop) {
      return json({ ok: false, message: T.stores.codeOwn }, { status: 400 });
    }

    let antal = 1;
    if (mig?.groupId && mig.groupId !== rad.groupId) {
      /* Butiken hör redan till en grupp. Att bara flytta den hade lämnat dess
         tidigare sällskap ensamt kvar — vilket är precis vad som hände: man
         lade till en butik, la till nästa, och den första försvann ur summan.
         Hela gruppen följer med istället. */
      const flyttade = await prisma.shopSettings.updateMany({
        where: { groupId: mig.groupId },
        data: { groupId: rad.groupId },
      });
      antal = flyttade.count;
    } else if (mig?.groupId !== rad.groupId) {
      await prisma.shopSettings.update({
        where: { shop: session.shop },
        data: { groupId: rad.groupId },
      });
    }

    // usedAt är spårbarhet, inte spärr: samma kod ska räcka för alla butiker
    // man håller på att koppla ihop under samma halvtimme.
    if (!rad.usedAt) {
      await prisma.storeLinkCode.update({ where: { code: kod }, data: { usedAt: new Date() } });
    }

    const total = await prisma.shopSettings.count({ where: { groupId: rad.groupId } });
    return json({
      ok: true,
      message: (antal > 1 ? T.stores.merged(antal) : T.stores.added) + T.stores.nowLinked(total),
    });
  }

  if (intent === "koppla-loss") {
    await prisma.shopSettings.update({ where: { shop: session.shop }, data: { groupId: null } });
    return json({ ok: true, message: T.stores.unlinked });
  }

  return json({ ok: false, message: T.stores.unknownAction }, { status: 400 });
}

export default function Butiker() {
  const { lang, butiker, kopplad, aktivKod } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [kod, setKod] = useState("");
  const busy = fetcher.state !== "idle";
  const T = t(lang);

  return (
    <Page
      title={T.stores.title}
      subtitle={kopplad ? T.stores.subtitleLinked(butiker.length) : T.stores.subtitleUnlinked}
    >
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <DataTable
              columnContentTypes={["text", "text", "text"]}
              headings={[T.stores.thStore, T.stores.thCurrency, ""]}
              rows={butiker.map((b) => [
                namn(b.shop),
                b.currency,
                b.jag ? <Badge key={b.shop} tone="info">{T.stores.thisOne}</Badge> : "",
              ])}
            />
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h2" variant="headingMd">{T.stores.addTitle}</Text>
              <Text as="p" tone="subdued">
                {T.stores.addBody}
              </Text>

              <InlineStack gap="300" blockAlign="center" wrap>
                <Button
                  loading={busy}
                  onClick={() => fetcher.submit({ intent: "kod" }, { method: "POST" })}
                >
                  {T.stores.createCode}
                </Button>
                {aktivKod ? (
                  <Text as="span" variant="headingLg">
                    {aktivKod.code}
                  </Text>
                ) : null}
              </InlineStack>

              <Text as="h3" variant="headingSm">{T.stores.redeemTitle}</Text>
              <InlineStack gap="300" blockAlign="end" wrap>
                <div style={{ minWidth: 180 }}>
                  <TextField
                    label={T.stores.codeLabel}
                    labelHidden
                    value={kod}
                    onChange={(v) => setKod(v.toUpperCase())}
                    autoComplete="off"
                    placeholder="ABC123"
                  />
                </div>
                <Button
                  variant="primary"
                  disabled={kod.trim().length < 4}
                  loading={busy}
                  onClick={() => fetcher.submit({ intent: "los-in", code: kod }, { method: "POST" })}
                >
                  {T.stores.link}
                </Button>
              </InlineStack>

              {fetcher.data ? (
                <Banner tone={fetcher.data.ok ? "success" : "critical"}>{fetcher.data.message}</Banner>
              ) : null}
            </BlockStack>
          </Card>
        </Layout.Section>

        {kopplad ? (
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">{T.stores.unlinkTitle}</Text>
                <Text as="p" tone="subdued">
                  {T.stores.unlinkBody}
                </Text>
                <InlineStack>
                  <Button
                    tone="critical"
                    loading={busy}
                    onClick={() => fetcher.submit({ intent: "koppla-loss" }, { method: "POST" })}
                  >
                    {T.stores.unlinkButton}
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        ) : null}
      </Layout>
    </Page>
  );
}
