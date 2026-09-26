# CaraShell i Spoks: flödesplanen (skriven 2026-09-26, innan något laddades upp)

Kort version för Axel. Motorn: `klaviyo/innehall/carashell/skelett.mjs` (strukturen),
`klaviyo/innehall/carashell/{floden,kampanjer}/<sprak>/` (copyn),
`klaviyo/spoks/konvertera.mjs --brand carashell` (→ `payload/` + `plan.json`).
Uppladdningen görs av en session med Spoks-MCP:n enligt `klaviyo/spoks/PROMPT-carashell-upp.md`.

## Vad mätningen sa (Shopify yitrbk-m3, 90 dagar t.o.m. 2026-09-26)

| Marknad | Ordrar | Kunder | Med samtycke | Språk i ordern | Mejlspråk |
|---|---:|---:|---:|---|---|
| Sverige | 173 | 189 | 12 | sv-SE 173/173 | **sv** |
| Norge | 82 | 94 | 4 | nb-NO 67, sv-NO 14 | **nb** |
| USA | 59 | 69 | 54 | en-US | **en** |
| Australien | 29 | 31 | 2 | en-AU | en |
| Danmark | 23 | 24 | 3 | da-DK 22 | sv (som fraktmejlen) |
| Finland | 7 | 8 | 0 | fi-FI | en |
| Storbritannien | 6 | 5 | 1 | en-GB | en |
| Nya Zeeland | 3 | 4 | 0 | en-NZ | en |
| Kanada | 2 | 3 | 0 | en-CA | en |
| utan land | — | 30 | 0 | mest sv | sv |

- **76 kontakter med samtycke av 457** (54 av dem i USA, där kassans ruta ger 90 % ja; i Sverige 7 %). Kampanjerna når alltså få. Flödena är där pengarna finns: köparflödena går till alla köpare som inte tackat nej.
- **0 återköp**: 2 kunder med två ordrar, båda dubbletter inom en timme. Inget produktpar ⇒ **inget korsförsäljningsflöde byggs.**
- **73 övergivna kassor** mot 384 ordrar ⇒ kassaflödet får mest omsorg (tre mejl).
- Order → skickad median 0,5 dygn. Order → levererad: bara 4 paket med `deliveredAt` (7,0 till 9,9 dygn, Norge) — butiken är 15 dagar gammal, p90 kan inte mätas än.
- Spoks vet bara **landet** på en kontakt (`contact.country`, engelskt namn, mätt: "Sweden"). Inget språkfält. Därför **ett flöde per språk** med landsfiltret i triggern, och ett segment per språk för kampanjerna. Danmark → svenska, Finland → engelska (7 ordrar bär inte ett finskt system).

## Flödena (8 per språk × 3 språk = 24 flöden, 45 mejl)

| Flöde | Trigger i Spoks | Filter | Väntan | Mejl | Skäl |
|---|---|---|---|---|---|
| F01 Välkomst | `contact_created` | subscribed + språk | 0 · 2 d · 3 d | Axel hälsar · så fungerar taköverdraget · så funkar det att handla | den som sagt ja ska veta vem som skriver och hur en retur går till |
| F02 Övergiven kassa | `checkout_created` | inget köp sedan start + subscribed + språk (återinträde 7 d) | 3 h · 1 d · 2 d | kassan är kvar · **tre frågor: passar det min vagn, hur fäster det, klarar det vinden** · sista mejlet från Axel | 73 kassor/90 d; svaren kommer ur kundernas egna frågor i kommentarerna |
| F03 Webbhistorik | `product_viewed` | ingen korg sedan start + inget köp + subscribed + språk (30 d) | 4 h · 1 d | den här kikade du på · storleken avgör | få mottagare utan popup, väntat |
| F04 Efter köp | `order_created` | ej avregistrerad + språk | 2 d · 14 d | det här händer nu + spårningssidan på kundens språk · kom allt fram? + vad man gör om något är fel | supportmejlet innan kunden hinner bli orolig; tvistförebyggande |
| F05 Vinna tillbaka | `order_created` | ej avregistrerad + språk + inget köp sedan | 180 d · 14 d | ett halvår senare · vad saknar du för vagnen? | GISSNING (0 återköp): produkternas säsonger ligger ett halvår isär |
| F06a Levererat, taköverdraget | `order_delivered` + produktfilter | ej avregistrerad + språk | 1 d | så sätter du på det | rätt påsatt håller i vind; färre supportmejl |
| F06b Levererat, termoskyddet | `order_delivered` + produktfilter | ej avregistrerad + språk | 1 d | så monterar du det | samma |
| F14 Recension | `order_delivered` | ej avregistrerad + språk (återinträde 90 d) | 10 d, kl 18 | vad tyckte du? fem stjärnor, alla till samma Trustpilot-sida | aldrig review gating |

Inte byggt: korsförsäljning (inget par i datan), sunset (Spoks har ingen segmenttrigger), rabattflöden (Axels beslut).

⚠️ Två saker som mäts första veckan efter påslag: att `order_delivered` faktiskt fyrar (spårningsrutinen skriver leveransskanningen i Shopify varje timme; får F06/F14 inga inskrivningar byts triggern till `order_created` + 12 dagar), och att kassaflödets kontakter fått rätt språk (en kund som lämnar kassan innan adressen är ifylld saknar land och hamnar i svenskan).

## Kampanjerna (13 per språk × 3 = 39, tisdagar 29/9–29/12, julveckan tom)

sv/nb 18:00, en 16:00 svensk tid (10:00 New York). Alla till `SEG_samtycke_<sprak>`.

| Vecka | Datum | sv / nb | en |
|---|---|---|---|
| 40 | tis 29/9 | K01 Regnet står kvar vid takluckan (PD) | samma, utan årstid |
| 41 | tis 6/10 | K02 Nio längder, vilken passar din (OB, kundernas ord) | samma |
| 42 | tis 13/10 | K03 Imman på rutan: termoskyddet + fönstertermomattan (PD) | samma |
| 43 | tis 20/10 | K04 Fars dag: beställ senast mån 26/10 (GT) | K04 Does it stay on in wind (OB) |
| 44 | tis 27/10 | K05 Adventskalendern med retrobussar (GT), lucka 1 kräver order senast fre 13/11 | samma |
| 45 | tis 3/11 | K06 Sitter det kvar i blåst (OB) | K06 The gift for the one with the caravan (GT) |
| 46 | tis 10/11 | K07 Fredag är sista dagen för adventskalendern | samma |
| 47 | tis 17/11 | K08 Checklistan innan vagnen ställs undan (S) | Before it sits for a while |
| 48 | tis 24/11 | K09 Black Week UTAN rabatt: kundernas ord (SP) — **Axels A/B/C** | tryggheten: 90-day guarantee (CS) |
| 49 | tis 1/12 | K10 Beställ senast mån 7/12 för jul | samma |
| 50 | tis 8/12 | K11 Rutan på resorna: termoskyddet + mattan (PD) | The trips ahead |
| 51 | tis 15/12 | K12 Efter blåsten: kolla banden (service, inga produktkort) | After strong wind |
| 52 | — | ingen kampanj | — |
| 53 | tis 29/12 | K13 En koll i mellandagarna (S) | The start of the year check |

Sista beställningsdagarna räknas på butikens löfte 10 arbetsdagar + 2 dagars marginal
(fars dag mån 26/10, lucka 1 fre 13/11, jul mån 7/12). Mät om när 30 paket levererats.

## Segmenten (13)

`SEG_samtycke_{sv,nb,en}` (kampanjernas målgrupp), `SEG_kopare_*`, `SEG_ej_kopt_*`,
`SEG_engagerade_60d_*` och `SEG_oengagerade_180d` (bara för att mäta, aldrig målgrupp).
Alla kampanjsegment börjar med `emailMarketingConsent in [subscribed]`.

## Copyreglerna som sitter i koden (`konvertera.mjs kontrollera`)

Tankstreck, leveranstid, belopp, procent, butikens namn i brödtexten, "garanti" (sv/nb),
årstider (en), förvaringspåse/dragsko/elastiska band/andas/tusentals/falsk brådska,
ofylld copy och ett tre-frågorstest med ❌ stoppar konverteringen. Priset står aldrig i
copyn: sv får Spoks produktkort (SEK), nb/en får bild + rubrik på språket + knapp,
eftersom Spoks katalog har en valuta och ett språk.
