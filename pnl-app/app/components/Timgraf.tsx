/**
 * ROAS under dagen — en dag i taget, timme för timme.
 *
 * Axel 2026-09-28 (med en skärmbild som förlaga): timvisaren ska visa dagen
 * som den växer, "så vi kan se när vi ska skala". Den gamla visaren summerade
 * varje timme över 30 dagar; den svarade på vilken timme som bär, inte på
 * "ligger vi över break-even just nu".
 *
 * Kortet: pilar för dagen, en heldragen linje för ROAS HITTILLS (grön över
 * break-even, röd under), en streckad grå för ROAS per timme, och break-even
 * som en streckad vågrät linje. Under: ROAS hittills, annonser och
 * försäljning för dagen.
 *
 * Medvetet:
 * 1. **Ingen ROAS utan annonskostnad.** Före första spenderade kronan finns
 *    ingen ROAS hittills — linjen börjar där. Aldrig 0, aldrig oändligt.
 * 2. **Ingen ROAS utan gemensam klocka.** Går annonskontot och butiken inte
 *    att lägga på samma klocka i hela timmar visas försäljning hittills i
 *    stället. En förskjuten ROAS-kurva är värre än ingen.
 * 3. **I dag slutar kurvan vid nuvarande timme.**
 * 4. **Timmarnas ROAS klipps vid grafens tak.** En timme med 40× på 50 kr
 *    hade annars pressat ihop allt annat till en platt rad.
 *
 * Inga externa bibliotek, ingen CDN — samma handritade SVG som resten.
 */

import { useMemo, useState, type MouseEvent } from "react";
import { BlockStack, Button, Card, InlineGrid, InlineStack, Text } from "@shopify/polaris";
import type { Texts } from "../lib/texts";
import { roasUnderDagen, type TimDag } from "../lib/roas-under-dagen";

export interface TimvisData {
  timmar: { hour: number; orders: number; totalSales: number; netSales: number }[];
  /** Annonskostnad per timme, eller null när den inte går att lägga rätt. */
  spend: number[] | null;
  offset: number | null;
  dagar: number;
  dagarUtan: number;
  kapad: boolean;
  /** Timdagarna, äldst först. */
  perDag: TimDag[];
  /** Dagens datum och timme i butikens zon. */
  idag: string;
  nuTimme: number;
}

const GRON = "#29845a";
const ROD = "#c5280c";
const GRA = "#8a8a8a";

/** Ett jämnt tak för axeln: 1, 2, 4, 5, 6, 8, 10, 15, 20 … */
function jamntTak(v: number): number {
  const steg = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 30, 40, 50, 75, 100];
  for (const s of steg) if (v <= s) return s;
  return Math.ceil(v / 50) * 50;
}

export function Timgraf({
  d,
  T,
  money,
  nf,
  breakEven,
  breakEvenOsaker,
}: {
  d: TimvisData;
  T: Texts;
  money: (n: number) => string;
  nf: Intl.NumberFormat;
  breakEven: number | null;
  breakEvenOsaker: boolean;
}) {
  const g = T.dashboard.hourly;
  const dagar = d.perDag ?? [];
  const [index, setIndex] = useState(() => Math.max(dagar.length - 1, 0));
  const [tip, setTip] = useState<number | null>(null);
  const dag = dagar[Math.min(index, dagar.length - 1)];

  const locale = nf.resolvedOptions().locale;
  const kvot = (v: number | null) =>
    v == null ? "—" : new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);
  const datum = (iso: string) =>
    new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));

  const punkter = useMemo(
    () => (dag ? roasUnderDagen(dag, dag.day === d.idag ? d.nuTimme : 23) : []),
    [dag, d.idag, d.nuTimme],
  );

  if (!dag || !dagar.some((x) => x.orders.some((o) => o > 0))) return null;

  const harRoas = dag.spend != null && punkter.some((p) => p.spendHittills > 0);
  const be = harRoas && breakEven != null && Number.isFinite(breakEven) && breakEven > 0 ? breakEven : null;

  /* Värdet som ritas: ROAS hittills, eller försäljning hittills utan ROAS. */
  const huvud = (i: number): number | null => (harRoas ? punkter[i]?.hittills ?? null : punkter[i]?.salesHittills ?? null);
  const huvudVarden = punkter.map((_, i) => huvud(i)).filter((v): v is number => v != null);
  const timVarden = harRoas ? punkter.map((p) => p.timme).filter((v): v is number => v != null) : [];
  const maxHuvud = Math.max(0, ...huvudVarden);
  const tak = harRoas
    ? jamntTak(Math.max(maxHuvud * 1.25, (be ?? 0) * 1.5, Math.min(Math.max(0, ...timVarden), Math.max(maxHuvud, be ?? 0) * 2.5), 2))
    : Math.max(maxHuvud * 1.15, 1);

  const W = 860, H = 260, padL = 52, padR = 16, padT = 16, padB = 28;
  const x = (h: number) => padL + ((W - padL - padR) * h) / 23;
  const y = (v: number) => padT + (H - padT - padB) * (1 - Math.min(v, tak) / tak);
  const botten = H - padB;
  const axelSteg = harRoas ? [0, tak / 4, tak / 2, (tak * 3) / 4, tak] : [0, tak / 2, tak];
  const axelText = (v: number) =>
    harRoas ? new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(v) : money(v);

  const sista = punkter[punkter.length - 1];
  const hittills = sista?.hittills ?? null;
  const farg = (v: number | null) => (v == null || be == null ? GRON : v >= be ? GRON : ROD);

  /* Linjen för ROAS hittills, bit för bit: färgen följer break-even. */
  const bitar: { x1: number; y1: number; x2: number; y2: number; c: string }[] = [];
  for (let i = 1; i < punkter.length; i++) {
    const a = huvud(i - 1), b = huvud(i);
    if (a == null || b == null) continue;
    bitar.push({ x1: x(i - 1), y1: y(a), x2: x(i), y2: y(b), c: be != null && (a < be || b < be) ? ROD : GRON });
  }
  const timLinje = harRoas
    ? punkter
        .map((p) => (p.timme == null ? null : `${x(p.hour)},${y(p.timme)}`))
        .reduce<string[][]>((acc, pt) => {
          if (pt == null) acc.push([]);
          else acc[acc.length - 1].push(pt);
          return acc;
        }, [[]])
        .filter((s) => s.length > 1)
    : [];

  const valj = (e: MouseEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const andel = (e.clientX - r.left) / r.width;
    const h = Math.round(((andel * W - padL) / (W - padL - padR)) * 23);
    setTip(Math.max(0, Math.min(punkter.length - 1, h)));
  };
  const tp = tip != null ? punkter[tip] : null;

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center" wrap={false}>
          <Text as="h2" variant="headingMd">{harRoas ? g.roasTitle : g.salesTitle}</Text>
          <InlineStack gap="100" blockAlign="center" wrap={false}>
            <Button variant="tertiary" size="slim" accessibilityLabel={g.prevDay} disabled={index <= 0} onClick={() => { setIndex(index - 1); setTip(null); }}>‹</Button>
            <div style={{ minWidth: 64, textAlign: "center" }}>
              <Text as="span" variant="bodyMd" fontWeight="semibold">{dag.day === d.idag ? g.today : datum(dag.day)}</Text>
            </div>
            <Button variant="tertiary" size="slim" accessibilityLabel={g.nextDay} disabled={index >= dagar.length - 1} onClick={() => { setIndex(index + 1); setTip(null); }}>›</Button>
          </InlineStack>
        </InlineStack>

        <div style={{ position: "relative" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }} role="img" aria-label={harRoas ? g.roasTitle : g.salesTitle}>
            {axelSteg.map((v) => (
              <g key={v}>
                <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="#ebebeb" strokeWidth="1" />
                <text x={padL - 8} y={y(v) + 4} textAnchor="end" fontSize="13" fill="#6d7175">{axelText(v)}</text>
              </g>
            ))}
            {Array.from({ length: 8 }, (_, i) => i * 3).map((h) => (
              <g key={h}>
                <line x1={x(h)} x2={x(h)} y1={padT} y2={botten} stroke="#f1f1f1" strokeWidth="1" />
                <text x={x(h)} y={H - 7} textAnchor="middle" fontSize="13" fill="#6d7175">{`${String(h).padStart(2, "0")}:00`}</text>
              </g>
            ))}
            {be != null ? (
              <g>
                <line x1={padL} x2={W - padR} y1={y(be)} y2={y(be)} stroke="#6d7175" strokeWidth="1" strokeDasharray="4 4" />
                <text x={W - padR} y={y(be) - 6} textAnchor="end" fontSize="13" fill="#6d7175">
                  {g.breakEven(`${breakEvenOsaker ? "≥ " : ""}${kvot(be)}`)}
                </text>
              </g>
            ) : null}
            {timLinje.map((s, i) => (
              <polyline key={i} points={s.join(" ")} fill="none" stroke={GRA} strokeWidth="1.2" strokeDasharray="3 3" />
            ))}
            {harRoas
              ? punkter.map((p) => (p.timme == null ? null : <circle key={`t${p.hour}`} cx={x(p.hour)} cy={y(p.timme)} r="1.8" fill={GRA} />))
              : null}
            {bitar.map((b, i) => (
              <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke={b.c} strokeWidth="2.5" strokeLinecap="round" />
            ))}
            {punkter.map((p, i) => {
              const v = huvud(i);
              return v == null ? null : (
                <circle key={`h${p.hour}`} cx={x(p.hour)} cy={y(v)} r={tip === i ? 4.5 : 3} fill="#fff" stroke={farg(harRoas ? v : null)} strokeWidth="1.8" />
              );
            })}
            {sista && huvud(punkter.length - 1) != null ? (
              <text
                x={Math.min(x(sista.hour) + 6, W - padR - 30)}
                y={y(huvud(punkter.length - 1)!) - 8}
                fontSize="15"
                fontWeight="600"
                fill={farg(harRoas ? hittills : null)}
              >
                {harRoas ? kvot(hittills) : money(sista.salesHittills)}
              </text>
            ) : null}
            {tp ? <line x1={x(tp.hour)} x2={x(tp.hour)} y1={padT} y2={botten} stroke="#b5b5b5" strokeWidth="1" /> : null}
            <rect x={padL} y={padT} width={W - padL - padR} height={botten - padT} fill="transparent" onMouseMove={valj} onMouseLeave={() => setTip(null)} />
          </svg>
          {tp ? (
            <div
              style={{
                position: "absolute",
                left: `${Math.min((x(tp.hour) / W) * 100, 72)}%`,
                top: 4,
                marginLeft: 10,
                background: "#1a1a1a",
                color: "#fff",
                padding: "6px 9px",
                borderRadius: 6,
                fontSize: 12,
                lineHeight: 1.45,
                pointerEvents: "none",
                whiteSpace: "nowrap",
                zIndex: 5,
              }}
            >
              <strong>{g.untilHour(`${String(tp.hour).padStart(2, "0")}:59`)}</strong>
              <br />
              {harRoas ? (
                <>
                  {g.soFar}: {kvot(tp.hittills)}
                  <br />
                  {g.perHour}: {kvot(tp.timme)}
                  <br />
                  {g.ads}: {money(tp.spendHittills)}
                  <br />
                </>
              ) : null}
              {g.salesLabel}: {money(tp.salesHittills)}
              <br />
              {g.ordersCount(nf.format(tp.ordersHittills))}
            </div>
          ) : null}
        </div>

        <InlineStack gap="400" blockAlign="center">
          {harRoas ? (
            <>
              <InlineStack gap="100" blockAlign="center">
                <span style={{ display: "inline-block", width: 10, height: 3, background: GRON }} />
                <span style={{ display: "inline-block", width: 10, height: 3, background: ROD, marginLeft: -4 }} />
                <Text as="span" variant="bodySm" tone="subdued">{g.soFar}</Text>
              </InlineStack>
              <InlineStack gap="100" blockAlign="center">
                <span style={{ display: "inline-block", width: 14, borderTop: `2px dashed ${GRA}` }} />
                <Text as="span" variant="bodySm" tone="subdued">{g.perHour}</Text>
              </InlineStack>
              {be != null ? (
                <InlineStack gap="100" blockAlign="center">
                  <span style={{ display: "inline-block", width: 14, borderTop: "2px dashed #6d7175" }} />
                  <Text as="span" variant="bodySm" tone="subdued">{g.breakEvenLabel}</Text>
                </InlineStack>
              ) : null}
            </>
          ) : null}
        </InlineStack>

        <div style={{ borderTop: "1px solid #ebebeb", paddingTop: 12 }}>
          <InlineGrid columns={3} gap="300">
            <BlockStack gap="050">
              <Text as="p" variant="bodySm" tone="subdued" fontWeight="semibold">{g.soFarCaps}</Text>
              <Text as="p" variant="headingMd">
                <span style={{ color: harRoas ? farg(hittills) : undefined }}>{harRoas ? kvot(hittills) : "—"}</span>
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                {be != null ? g.breakEven(`${breakEvenOsaker ? "≥ " : ""}${kvot(be)}`) : harRoas ? "" : g.noRoasShort}
              </Text>
            </BlockStack>
            <BlockStack gap="050">
              <Text as="p" variant="bodySm" tone="subdued" fontWeight="semibold">{g.adsCaps}</Text>
              <Text as="p" variant="headingMd">
                <span style={{ color: "#b98900" }}>{dag.spend ? money(sista?.spendHittills ?? 0) : "—"}</span>
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">{dag.day === d.idag ? g.today : datum(dag.day)}</Text>
            </BlockStack>
            <BlockStack gap="050">
              <Text as="p" variant="bodySm" tone="subdued" fontWeight="semibold">{g.salesCaps}</Text>
              <Text as="p" variant="headingMd">{money(sista?.salesHittills ?? 0)}</Text>
              <Text as="p" variant="bodySm" tone="subdued">{g.ordersCount(nf.format(sista?.ordersHittills ?? 0))}</Text>
            </BlockStack>
          </InlineGrid>
        </div>

        <BlockStack gap="100">
          {d.dagarUtan > 0 ? (
            <Text as="p" variant="bodySm" tone="subdued">{g.coverage(d.dagar, d.dagar + d.dagarUtan)}</Text>
          ) : null}
          {d.kapad ? <Text as="p" variant="bodySm" tone="subdued">{g.capped}</Text> : null}
          {harRoas ? (
            <Text as="p" variant="bodySm" tone="subdued">{g.lag}</Text>
          ) : dag.spend == null ? (
            <Text as="p" variant="bodySm" tone="subdued">{g.noRoas}</Text>
          ) : (
            <Text as="p" variant="bodySm" tone="subdued">{g.noSpendDay}</Text>
          )}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
