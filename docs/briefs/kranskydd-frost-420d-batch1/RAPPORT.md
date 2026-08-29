# Kranskydd Frost 420D — första riktiga batchen (`/forsta-batch`, 2026-08-29, automatisk körning)

## Executive summary
9 dagar, 3 091 kr spend (livstid, `date_preset: maximum`), 11 köp, ROAS 1,72
mot break-even 1,49 — kampanjen har klarat testet. Men bara **EN** av 18
annonser (`Kranskydd_SP_1_H3`, video, social proof) har passerat
signifikansgrinden (≥300 kr + ≥3 köp): 7 köp, CPA 247 kr, ROAS 2,03 — den
bär **hela** kampanjens vinstbidrag (+629 kr av totalt +487 kr) och täcker
upp för två videoannonser som ligger under break-even. **Kritiskt fynd:**
fyra annonser (CS-serien) säljer med en **rabatt (23 %) som inte finns i
Shopify** — flat pris 309 kr, inget jämförpris, ingen rabattkod. Det är en
BLOCKER, inte bara ett underprestera. Batch #2 = 6 briefer (3 video, 3 bild):
nära iteration av vinnaren, en ny UGC-format-test på den svaga vinkeln, och
en ny ärlig "kostnad av att strunta i det"-vinkel som ersätter den trasiga
rabatten. GT (gåva/jul)-vinkeln pausas till november — fyra annonser fick
0,25 % av spenden, sannolikt säsongsfel (julstämning i augusti).

## Datakvalitet (FAS 0)
| Källa | Status |
|---|---|
| Meta kampanj/adset/annons-nivå (18 annonser, livstid) | ✅ hämtat, sorterat på spend |
| `amount_spent × purchase_roas` vs. `omni_purchase_values` | ✅ exakt match på alla 5 annonser med köp — inget 100×-fel här |
| Creatives (copy, rubrik, CTA, bild-/video-ID) | ✅ hämtat för alla 18 annonser |
| Statiska bilder (PD_2_1, SP_2_1, CS_2_1, GT_2_1, Extra) | ✅ nedladdade och visuellt granskade |
| Video (13 st) | ❌ kan inte öppnas härifrån — teardown bygger på copy/creative-brief-nivå, inte rad-för-rad av rörlig bild/ljud. Transkript begärs till nästa `/cs` för SP_1_H3 (vinnare) + PD_1_H2/H3 (underpresterare) |
| Landningssida + pris | ✅ Shopify: 309 kr, 1 variant, inget jämförpris, `totalInventory: -17` (⚠️ oversåld) |
| Shopify-försäljning (korskoll) | ✅ 10 ordrar på SKU:n, snitt 475 kr/order — matchar Metas 485 kr (11 köp) |
| Recensioner | ❌ ingen recensionsplattform identifierad — lucka, inte ett nekat försök |
| Meta Ad Library (svenska söktermer) | ✅ sökt "kranskydd", "frostskydd kran", "utekran vinter" — 0 konkurrenter, bara Bäverbutikens egna annonser |

## FAS 1 — Kampanjöversikt
`Kranskydd Frost 420D | BE ROAS 1.49 | Launch 2026-08-21`, MagiBorsten
`1867947880635861`, mål köp, en annonsgrupp, 18 annonser (PD/SP/CS/GT-serier
+ extra-varianter). Livstid (max): 3 091 kr → 11 köp → ROAS 1,72. CPM 98–337
kr (brett spann, mest på lågspend-rader), CTR 0–25 % (mestadels brus på
0–16 kr spend). Break-even-CPA ≈ 322 kr (AOV 485 kr / 1,49) — enstycks-CPA
207 kr (309/1,49) är för lågt satt, de flesta ordrar innehåller ett tillägg
utöver kranskyddet. **Funnelläcka:** går inte att isolera LPV/ATC/IC härifrån
(fälten kräver breakdown per steg som inte hämtades i denna körning — endast
ad-nivåns aggregat) — flaggas som lucka. **Business-risk utanför creative:**
Shopify visar `totalInventory: -17` (oversåld) — rör inte creative-strategin
men kan orsaka leveransförseningar som skadar framtida ROAS oavsett annons.

## FAS 2 — Klassificera
| Annons | Klass | Spend | Köp | CPA | ROAS | CTR | Vinstbidrag |
|---|---|---|---|---|---|---|---|
| **Kranskydd_SP_1_H3** (top spender = benchmark) | **Bevisad (preliminär)** | 1 730 kr (56 %) | **7** | 247 kr | **2,03** | 3,51 % | **+629 kr** |
| Kranskydd_PD_1_H3 | Osäker (1 köp) | 594 kr | 1 | 594 kr | 0,77 | 2,83 % | −287 kr |
| Kranskydd_PD_1_H2 | Osäker (1 köp) | 558 kr | 1 | 558 kr | 0,94 | 3,26 % | −206 kr |
| Kranskydd_PD_2_1 (statisk) | Osäker (1 köp — regressionskandidat) | 67 kr | 1 | 67 kr | 7,88 | 5,73 % | +286 kr |
| Kranskydd_CS_1_H3 | Osäker (1 köp) | 54 kr | 1 | 54 kr | 5,76 | 1,49 % | +154 kr |
| Övriga 13 annonser (PD_1_H1, PD_Extra×2, SP_1_H1/H2, SP_2_1, CS_1_H1/H2, CS_2_1, GT×4) | Osäkra — 0 köp | 0–16 kr vardera | 0 | – | – | – | – |

20 % som driver allt: SP_1_H3 ensam = 56 % av spend och >100 % av
vinstbidraget (den täcker för PD-videornas förluster). Största "budgetläcka":
inte en enskild annons (för lite data för att döma) utan **GT-serien** som
fick 7,68 kr av 3 091 kr totalt (0,25 %) — pengarna gick aldrig dit,
strukturellt problem, inte en dömd förlorare.

## FAS 3 — Vinnaren (teardown)
**Kranskydd_SP_1_H3 (video, "Villaägare litar på det här skyddet"):** öppnar
med ett riktigt kundcitat + ⭐⭐⭐⭐⭐, tre ✅-punkter (tålighet, hållbarhet,
garanti), stänger med SHOP_NOW. Attention = citatet (mänsklig röst, inte
spec-text); Persuasion = social bekräftelse + riskreducering (30 dagars
öppet köp); Conversion = ingen prisfriktion i annonsen (priset visas inte,
CTA:n gör jobbet). **Tre-frågorstest på citatet:** visualisera ✅ (en
konkret, specifik händelse) · falsifiera ✅ (en verklig kunds ord, sant eller
falskt) · ingen annan kan säga det ✅ (det är just den kundens formulering om
just den här produkten — en konkurrent kan inte skriva under det). **Tre av
tre — vilket är exakt varför det här är den enda annonsen som konverterar.**

## FAS 4 — Förlorarna
| Element | Vinnare (SP_1_H3) | Svagare (PD_1_H2/H3) | Trolig påverkan | Nästa test |
|---|---|---|---|---|
| Öppning | Kundcitat, mänsklig röst | Skräckscenario i speclista-ton ("En spräckt vattenledning...420D Oxford-tyg") | CTR är lika bra (2,8–3,5 %) men ROAS är under 1 på PD — klick köps lika billigt, men konverterar sämre | UG_1_H1 isolerar FORMAT (människa pratar) på samma PD-innehåll |
| Visuell struktur | Produkt i handling, riktig utekran | Enda lifestylebild, ingen synlig "före"-risk | Konflikten (fruset/oskyddat) är påstådd, inte visad | PD_3_1: före/efter-split |
| Vinkel (GT) | – | Jul/gåva i augusti, 0,25 % av spend | Säsongsfel, sannolikt algoritmisk relevansstraff | Pausa till november (backlog.md) |
| Vinkel (CS) | – | "23 % rabatt" som inte finns i Shopify | BLOCKER — inte en prestandafråga | CI_1_H1/CI_1_1: ärlig säsongs-/kostnadsbrådska ersätter den |

## FAS 5 — Creative DNA → `products/kranskydd-frost-420d/dna.md` ✅

## FAS 6 — Kund- & konkurrentresearch
❌ Luckor: inga recensioner hämtade (ingen plattform identifierad). Meta Ad
Library sökt på tre svenska termer ("kranskydd", "frostskydd kran", "utekran
vinter") — **0 konkurrenter hittade**, bara Bäverbutikens egna annonser kom
upp. Nischen verkar obevakad just nu — värt att notera men inte luta sig för
hårt mot (kan bero på sökordens smalhet, inte faktisk avsaknad av
konkurrens). Kundspråk: enda källan är kontots egen bevisade testimonial-rad
("Jag slapp en spräckt kran i vinter tack vare den här") — ingen extern VoC
tillgänglig i denna körning. Tre lånade mekanismer (allmänna, inte
konkurrentspecifika eftersom inga konkurrenter hittades): risk-reversal
(30 dagars öppet köp, redan i bruk), före/efter-konflikt (copy-regler.md,
ny i denna batch), kostnad-av-att-vänta (ny i denna batch, ingen påhittad
siffra).

## FAS 7–9 — Batch #2 (6 annonser)
| Namn | Typ | Hypotes (isolerad variabel) |
|---|---|---|
| Kranskydd_SP_3_H1 | video | Samma bevisade citat + verkligt stormväder-broll (visuell bevisintensitet) |
| Kranskydd_SP_3_1 | bild | Samma citat + 2 riktiga trust-badges i stället för ett ensamt citat |
| Kranskydd_UG_1_H1 | video | UGC talking-head löser PD-vinkelns svaga konvertering (format, inte ord) — GISSNING |
| Kranskydd_PD_3_1 | bild | Före/efter-split gör konflikten synlig i stället för påstådd |
| Kranskydd_CI_1_H1 | video | Ny "kostnad av att vänta"-vinkel ersätter den trasiga rabatten, ingen påhittad siffra — GISSNING |
| Kranskydd_CI_1_1 | bild | Samma nya vinkel statiskt, ärlig säsongsbrådska i stället för falsk rabatt-brådska — GISSNING |

**GT och CS får inga nya annonser** — GT pausas till november (säsongsfel),
CS är en BLOCKER tills en riktig rabatt finns i Shopify (se fråga till Axel
nedan).

### Tre-frågorstestet (copy-regler.md) på de nya raderna
| Rad | Visualisera? | Falsifiera? | Ingen annan kan säga det? |
|---|---|---|---|
| "Jag slapp en spräckt kran i vinter..." (återanvänd, SP_3_H1/SP_3_1) | ✅ | ✅ | ✅ |
| "Okej, såhär ser min utekran ut just nu." (UG_1_H1) | ✅ | ✅ | ✅ |
| "Fryst vatten expanderar — och kranen har ingenstans att ta vägen." (CI_1_H1) | ✅ | ✅ | ❌ (allmän fysik, vilken konkurrent som helst kan säga det) |
| "Oskyddad. Eller skyddad." (PD_3_1, rubrik) | ✅ | ✅ | ❌ (generisk, passar vilken skyddsprodukt som helst) |
| "KYLAN ÄR PÅ VÄG." (CI_1_1, rubrik) | ✅ | ✅ | ❌ (generisk vinterclaim) |
| "Ingen rabatt. Bara rätt tajming." (CI_1_1, stödrad) | ❌ (abstrakt "tajming") | ✅ | ❌ |

Ingen rad får 3 nej (inget "skräp att skriva om"), men flera nya rader
(fysik-/rubrikraderna) klarar bara 1–2 av 3 — förväntat för
kategori-generiska demo-/urgency-rader. Den enda raden i hela batchen med
3/3 är den ÅTERANVÄNDA, redan bevisade kundcitaten — vilket är exakt
mönstret analysen pekar på: skriv fler riktiga kundröster, inte fler
spec-rader, när recensioner finns.

**Modellpolicy-avvikelse (CLAUDE.md regel 6):** inget Agent/Task-verktyg för
att spawna en sonnet/haiku-subagent var tillgängligt i den här körningen
(verifierat via verktygssökning innan copyn skrevs). All copy i batchen är
därför skriven av huvudsessionen själv — dokumenterat här och i
`batch-log.md`, inte tyst genomfört.

## FAS 10 — Testplan
**Tier 1 (launcha nu):** alla 6, i **separat test-ABO, lika budget per
annons** (CLAUDE.md regel 11) — aldrig i originalannonsgruppen. Kill mot
break-even (ROAS 1,49 / CPA 322 kr) efter ≥300 kr spend och ≥3 köp; ingen dom
tidigare. **Tier 2 (backlog):** karusell (pris→montering→material→garanti),
recensionsannons (när recensioner finns), en andra CI-variant med en
verifierad kr-siffra om Axel har en. **Tier 3:** GT/gåva-vinkeln, återupptas
november 2026. **Gör innan spend:** 1) Axel beslutar om CS-vinkeln
(riktig rabatt i Shopify, eller vinkeln stannar pausad), 2) transkript för
SP_1_H3 + PD_1_H2/H3 till nästa `/cs`, 3) undersök lagersaldot (-17).
**Kvot:** produkten saknas i `products/products.json` (styrs via
`agent/produktkarta.json`/ronden i stället) — `pipeline/quota.mjs` täcker
den inte (körd och verifierat, se nedan). Ronden ger 1 000 kr/dag →
veckokvot 2 st (`annonskvot(1000)`); denna batch (6) är medvetet över
kvotgolvet, samma mönster som tidigare `/forsta-batch`-körningar i detta
konto.

`node pipeline/quota.mjs` kördes (2026-08-29): output listar de sex
produkterna i `products/products.json` (Motorhöljet, AI Smarta Glasögon,
Väggfästet, Strandtofflorna, Axelbältet, Sätesöverdragaren) — **Kranskydd
Frost 420D finns inte i den filen och listas därför inte**, exakt som väntat
eftersom produkten styrs via `agent/produktkarta.json`/ronden i stället (se
ovan för veckokvoten 2 st därifrån).

## Lärdomar
1. Enda annonsen som klarar tre-frågorstestet fullt ut är också den enda som
   konverterar — copy-reglerna och analysmetoden pekar åt samma håll här.
2. En trasig rabatt kan ligga live i veckor utan att synas i ROAS-tabellen
   eftersom den knappt fått spend — kolla offer-integritet oavsett
   spend-nivå, inte bara på de bedömbara annonserna.
3. Säsongsfel (jul i augusti) kan se ut som en svag idé i datan när det
   egentligen bara är fel tajming — GT-serien fick aldrig en ärlig chans.

## Fråga till Axel (max en)
Ska en riktig 23 %-rabatt (jämförpris + rabattkod) skapas i Shopify för
Kranskydd Frost 420D, så att CS-vinkeln kan fortsätta användas ärligt — eller
ska den vinkeln stanna pausad permanent och ersättas helt av den nya
kostnad-av-att-vänta-vinkeln (CI)? Tills svar: CS-annonserna rörs inte
(varken pausas eller skalas), och inga nya CS-briefer skrivs.

## Definition of Done
- [x] FAS 0-tabellen visar vad som faktiskt verifierades
- [x] Ingen dom under 300 kr / 3 köp (17 av 18 annonser klassade "osäker", inte dömda)
- [x] ANALYSMETOD.md följd: vinstbidragstabell visad, break-even (ROAS 1,49) använd för kill-resonemang
- [x] Priser dubbelkollade mot landningssidan (309 kr, inget jämförpris — CS-BLOCKER hittad just genom detta)
- [x] Testplanen ≥ kvoten (6 briefer mot ett kvotgolv på 2/vecka; `pipeline/quota.mjs` körd och dess begränsning för denna produkt redovisad)
- [ ] Copy/voiceover via sonnet/haiku-subagent — ❌ inget Agent-verktyg tillgängligt i denna körning, huvudsessionen skrev copyn själv (dokumenterat i batch-log.md + ovan), tre-frågorstestet kört manuellt i stället
- [x] Briefer självständiga, engelska, Swedish/English-tabeller
- [x] Naming: upptagna AD-ID:n avlästa (PD_1/2/Extra, SP_1/2, CS_1/2, GT_1/2), inga återanvända — se avsnittet om namnkonvention i dna.md för en flaggad diskrepans mot docs/naming-convention.md
- [x] Två zip-filer med README levererade (video-ads-briefs.zip, image-ads-briefs.zip, i denna mapp)
- [x] Batch-mapp skapad och delad i Drive: produktmapp `Kranskydd Frost 420D` → `Batch #2`, ärver "alla med länken = redigerare" från Products-roten (verifierat)
- [x] Notion-items skapade: ny hub "Kranskydd Frost 420D creative hub" (schema duplicerat från Trimmer belt creative hub) + "Pending Approval"-boardvy + 6 brief-items + 1 Winning Creative-referens + 1 Guideline (CS-BLOCKER)
- [x] Inget tracking-sheet skapat
- [x] `products/kranskydd-frost-420d/` skapad (dna.md, batch-log.md, backlog.md) — pushstatus: se leveransen till huvudsessionen (denna session har sannolikt bara läsrättighet till git)
- [x] Max EN fråga ställd (CS-rabatten, ovan)
