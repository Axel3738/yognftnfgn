# GreatGrill Mexiko — ekonomi (leverantörsquote + marginalkalkyl)

**Datum:** 2026-08-16 · **Källa:** leverantörsquote (skärmdump från Axel) + priserna i butikens bundle-väljare.
**Butik:** laclinicadelasador.mx · Alla leverantörspriser i **USD**, butikspriser i **MXN**.

## Leverantörsquoten (tolkad)

"Upsell" = extra korg i samma paket/order → lägre frakt. Frakten är ~80 % av landad kostnad.

| Rad | Produkt | Frakt | Landad kostnad |
|---|---|---|---|
| Första korgen, utan handtag | $1.90 | $9.40 | **$11.30** |
| Extra korg (samma order), utan handtag | $1.90 | $5.90 | **$7.80** |
| Första korgen, med handtag | $2.20 | $10.10 | **$12.20** |
| Extra korg (samma order), med handtag | $2.20 | $6.50 | **$8.70** |

## Butikspriser (avlästa 2026-08-16)

| Nivå | Sin asa | Con asa |
|---|---|---|
| 1x | $609.00 (jmf $859) | $669.00 (jmf $859) |
| 2x | $913.50 ("Ahorras 47%") | $1,003.50 ("Ahorras 42%") |
| 4x | $1,333.71 (jmf $2,577) | $1,465.11 (jmf $2,577) |

## Marginalkalkyl (kurs ~18.50 MXN/USD — ⚠️ approximation, kolla dagskurs)

COGS per order: 1x = första korgen; 2x = första + 1 extra; 4x = första + 3 extra.

**Con asa:** COGS 1x $12.20 · 2x $20.90 · 4x $38.30

| Nivå | Pris MXN | Pris USD | Bidrag USD | **Bidrag MXN** | Bruttomarginal | Break-even-ROAS |
|---|---|---|---|---|---|---|
| 1x | 669.00 | 36.16 | 23.96 | **≈443** | 66 % | 1.51 |
| 2x | 1,003.50 | 54.24 | 33.34 | **≈617** | 61 % | 1.63 |
| 4x | 1,465.11 | 79.20 | 40.90 | **≈757** | 52 % | 1.94 |

**Sin asa:** COGS 1x $11.30 · 2x $19.10 · 4x $34.70 → bidrag ≈400 / ≈560 / ≈692 MXN (BE-ROAS 1.52 / 1.63 / 1.93)

Break-even-CPA per köp = bidraget per order på den nivå kunden köper.

## Observationer

1. **Frakten dominerar.** Extra korg i samma order kostar $7.80–8.70 mot $11.30–12.20 för första — bundlarna (2x/4x) är affärsmodellen, inte bara AOV-taktik. Andra korgen säljs för ~$300 MXN och kostar ~$161 MXN → ren förstärkning på varje 2x-order.
2. **Procentmarginalen faller med bundlestorlek** (66 % → 52 %) men kronbidraget per order stiger (443 → 757) — det är kronbidraget som betalar annonserna.
3. **Handtag:** +$0.90 i COGS, +$60 MXN i pris → lönsamt. Rekommendation (2026-08-16): gör handtaget standard, döda Sin asa/Con asa-förgreningen i bundle-väljaren, sälj "mango desmontable" som USP.
4. **Prisförslag (ej beslutat):** 1x $599 / 2x $899 / 4x $1,299 → bidrag ≈374 / ≈512 / ≈665 MXN. Rundare priser, Bryn-liknande 2x-steg (+$300 för andra korgen).

## Historik 2026-08-16

1. **Först genomfört på Axels "fixa offret":** Sin asa raderad, en variant, pris $599. **ÅTERSTÄLLT samma dag** — Axel ville ha kvar båda varianterna (billig/dyr-anchoring) och påpekade korrekt att prissänkningen FÖRSÄMRADE break-even-ROAS (599 → BE 1.60/1.76/2.17). Lärdom: priset ned = BE upp, eftersom COGS ligger fast.
2. **Nuläge (återställt):** Sin asa $609 / Con asa $669, compare $859, option "Tipo de asa" (Sin asa först). ⚠️ Sin asa-varianten har NYTT variant-ID (56810748641620) — verifiera att bundle-appen mappar rätt.
3. Bundle-appens rabatter (härledda): 2x = 25 % · 4x = 45,25 %.

## Axels mål: BE-ROAS ≤ 1,5 på mittenalternativet (2x)

BE 1,5 kräver pris ≥ 3× COGS. 2x con asa COGS $20.90 → 2x-pris ≥ ~$1,160 MXN (sin asa: ≥ ~$1,060).

- **Prisspaken:** baspriser Sin asa $719 / Con asa $799 → 2x auto (25 %) = $1,078.50 / $1,198.50 → BE 1,47–1,49 ✓; 1x BE 1,39–1,41; 4x auto ~$1,575/$1,750 → BE 1,62–1,68.
- **Fraktspaken:** på nuvarande priser räcker −$2.80 USD på tvåkorgsfrakten (15.90 → 13.10, ~18 %) för BE 1,5 i mitten. Förhandla med agenten; MX-lager/3PL är nästa nivå.
- **Beslut väntar hos Axel** (prisändring = ägarbeslut). IVA-frågan måste lösas innan talen är verkliga.

**Kvar i bundle-appen (går ej via API):** 4x fast pris · nivåetiketter · ev. gåva på 4x.

## ⚠️ Öppna frågor (fråga Axel, gissa inte)

- **IVA 16 %:** ingår den i priset och ska redovisas ut, eller säljs det utan (som Grillkliniken SE)? Om IVA dras ur: bidraget sjunker med 16/116 av priset → BE-ROAS 1x ≈1.9 i stället för 1.51. **Alla tal ovan är räknade UTAN IVA-avdrag.**
- Betalväxelavgifter (~3–4 %) och returgrad är inte inräknade.
- Växelkursen är antagen (18.50) — lås aldrig ett kill-beslut mot dessa tal utan färsk kurs.
