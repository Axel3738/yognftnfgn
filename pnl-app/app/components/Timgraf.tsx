/**
 * Omsättning, ordrar och ROAS per timme på dygnet.
 *
 * Axels fråga är "när ska jag skala": han vill se vilken timme som bär
 * vinsten. Staplarna är därför SUMMAN över perioden, inte ett snitt — och det
 * står på kortet, för en stapel på 12 000 kr över 30 dagar är inte en timme
 * som drar in 12 000 kr.
 *
 * Tre saker som är medvetna, inte förbiseenden:
 *
 * 1. **ROAS kräver underlag.** En timme med en order är ingen ROAS-signal.
 *    Under gränsen visas "—", aldrig ett tal. Samma regel som gäller
 *    annonsbedömningar i resten av huset: ingen dom på för tunt underlag.
 * 2. **Ingen ROAS utan gemensam klocka.** Ligger annonskontot i en annan
 *    tidszon och skillnaden inte går att räkna i hela timmar visas bara
 *    omsättning och ordrar. En förskjuten ROAS-topp är värre än ingen.
 * 3. **Attributionen är inte kausal.** Ett klick 19:40 blir ett köp 20:15,
 *    så toppen ligger senare än timmen man ska köpa. Det står på kortet.
 *
 * Inga externa bibliotek, ingen CDN — samma handritade SVG som resten.
 */

import { useState } from "react";
import { BlockStack, Button, Card, InlineStack, Text } from "@shopify/polaris";
import type { Texts } from "../lib/texts";

export interface TimvisData {
  timmar: { hour: number; orders: number; totalSales: number; netSales: number }[];
  /** Annonskostnad per timme, eller null när den inte går att lägga rätt. */
  spend: number[] | null;
  offset: number | null;
  dagar: number;
  dagarUtan: number;
  kapad: boolean;
}

type Matt = "sales" | "orders" | "roas";

/** Under så här många ordrar i en timme säger vi ingenting om ROAS. */
const ROAS_GRANS = 3;

export function Timgraf({
  d,
  T,
  money,
  nf,
}: {
  d: TimvisData;
  T: Texts;
  money: (n: number) => string;
  nf: Intl.NumberFormat;
}) {
  const [matt, setMatt] = useState<Matt>("sales");
  const [tip, setTip] = useState<{ x: number; y: number; i: number } | null>(null);

  const harForsaljning = d.timmar.some((t) => t.orders > 0);
  if (!harForsaljning) return null;

  const g = T.dashboard.hourly;
  const kanRoas = d.spend != null;
  const val: { key: Matt; label: string }[] = [
    { key: "sales", label: g.sales },
    { key: "orders", label: g.orders },
    ...(kanRoas ? [{ key: "roas" as const, label: g.roas }] : []),
  ];

  /** Värdet för en timme. Null = vi vet inte, och då ritas ingen stapel. */
  const varde = (i: number): number | null => {
    const t = d.timmar[i];
    if (matt === "sales") return t.totalSales;
    if (matt === "orders") return t.orders;
    const sp = d.spend?.[i] ?? 0;
    /* För tunt underlag, eller ingen spend: ingen ROAS. Aldrig 0, aldrig
       oändligt — båda hade lästs som ett svar. */
    if (t.orders < ROAS_GRANS || sp <= 0) return null;
    return t.totalSales / sp;
  };

  const varden = d.timmar.map((_, i) => varde(i));
  const max = Math.max(...varden.map((v) => v ?? 0), matt === "roas" ? 1 : 0.0001);

  const W = 860, H = 150, padL = 8, padB = 18;
  const bw = (W - padL * 2) / 24;
  const botten = H - padB;
  const y = (v: number) => 6 + (botten - 12) * (1 - v / max);

  const visa = (v: number | null): string => {
    if (v == null) return "—";
    if (matt === "sales") return money(v);
    if (matt === "orders") return nf.format(v);
    /* Kvoten i handlarens språk ("2,31×" på svenska), inte alltid med punkt. */
    return `${new Intl.NumberFormat(nf.resolvedOptions().locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}×`;
  };
  const timEtikett = (h: number) => `${String(h).padStart(2, "0")}`;

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack gap="300" blockAlign="center" wrap>
          <Text as="h2" variant="headingMd">{g.title}</Text>
          <InlineStack gap="150">
            {val.map((v) => (
              <Button
                key={v.key}
                size="slim"
                pressed={matt === v.key}
                onClick={() => setMatt(v.key)}
              >
                {v.label}
              </Button>
            ))}
          </InlineStack>
        </InlineStack>

        <div style={{ position: "relative" }} onMouseLeave={() => setTip(null)}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%" }} role="img" aria-label={g.title}>
            <line x1={padL} x2={W - padL} y1={botten} y2={botten} stroke="#d2d5d8" strokeWidth="1" />
            {d.timmar.map((t, i) => {
              const v = varden[i];
              if (v == null || v <= 0) return null;
              const x = padL + i * bw + 1;
              const w = Math.max(bw - 2, 1.5);
              const top = y(v);
              return (
                <rect
                  key={t.hour}
                  x={x}
                  y={top}
                  width={w}
                  height={Math.max(botten - top, 1)}
                  rx={3}
                  fill="#3b5bdb"
                  opacity={tip && tip.i !== i ? 0.45 : 0.9}
                  onMouseEnter={(e) => {
                    const r = (e.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect();
                    setTip({ i, x: e.clientX - r.left, y: e.clientY - r.top });
                  }}
                  onMouseMove={(e) => {
                    const r = (e.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect();
                    setTip({ i, x: e.clientX - r.left, y: e.clientY - r.top });
                  }}
                />
              );
            })}
            {d.timmar.map((t, i) =>
              t.hour % 3 === 0 ? (
                <text key={t.hour} x={padL + i * bw + bw / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="#6d7175">
                  {timEtikett(t.hour)}
                </text>
              ) : null,
            )}
          </svg>
          {tip ? (
            <div
              style={{
                position: "absolute",
                left: Math.min(tip.x, 700),
                top: Math.max(tip.y - 56, 0),
                background: "#1a1a1a",
                color: "#fff",
                padding: "6px 9px",
                borderRadius: 6,
                fontSize: 12,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                zIndex: 5,
              }}
            >
              <strong>{g.hourLabel(timEtikett(d.timmar[tip.i].hour))}</strong>
              <br />
              {visa(varden[tip.i])}
              <br />
              {g.ordersCount(nf.format(d.timmar[tip.i].orders))}
            </div>
          ) : null}
        </div>

        {/* Vad staplarna faktiskt är. Utan de här raderna läses en stapel på
            12 000 kr över 30 dagar som en timme som drar in 12 000 kr. */}
        <BlockStack gap="100">
          <Text as="p" variant="bodySm" tone="subdued">{g.sumNote(d.dagar)}</Text>
          {d.dagarUtan > 0 ? (
            <Text as="p" variant="bodySm" tone="subdued">{g.coverage(d.dagar, d.dagar + d.dagarUtan)}</Text>
          ) : null}
          {d.kapad ? <Text as="p" variant="bodySm" tone="subdued">{g.capped}</Text> : null}
          {kanRoas ? (
            <Text as="p" variant="bodySm" tone="subdued">{g.lag}</Text>
          ) : (
            <Text as="p" variant="bodySm" tone="subdued">{g.noRoas}</Text>
          )}
          <Text as="p" variant="bodySm" tone="subdued">{g.noSessions}</Text>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
