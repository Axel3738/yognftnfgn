# Produktkriterier — hur en Bäverbutik-produkt väljs

**Normativ.** Fyller luckan "Kriterierna i *What product is next?*" i `docs/os/SOP-06-produkttest.md`.
Körs av `/produkt` (se `.claude/commands/produkt.md`). Minnet ligger i `products/kandidater.json`.

Gäller **bara Bäverbutiken** (MagiBorsten `1867947880635861`). Grillkliniken har inget produktval.

---

## Vad Bäverbutiken är

En general store **riktad mot män**. Det är hela affärsiden: det finns hundratals
svenska general stores som dropshippar, men nästan inga som konsekvent riktar sig
mot män. Varje produktval ska försvara den positionen.

Kontots bevisade nischer (från `products/products.json` + produktminnena):

| Nisch | Bevis |
|---|---|
| Bil & garage | motorhöljet, sätesöverdragaren |
| Båt & sjö | motorhöljet (båtkapell) |
| Kropp/hållning för män | axelbältet |
| Utomhus/sommar | strandtofflorna |
| Verkstad & förvaring | väggfästet |
| Fiske, jakt, grill, ved, snö, husbil, EDC, snickeri | **obrutna** — högst prioritet i jakten |

**Köparen är en man som köper till sig själv.** Presentprodukter ("till honom som
har allt") är en annan affär med annan säsong och annan copy — de klassas som `VÄNTA`,
inte `GO`, om de inte klarar allt annat med marginal.

---

## Steg 1 — Sex grindar. En enda missad grind = NEJ.

Grindarna körs **före** poängsättning. Faller produkten på en grind sätts inga poäng
alls — då är den avgjord. **Varje grinddom kräver en källa** (URL eller sökträff).
Ingen källa = ingen dom, enligt regel 3 i `CLAUDE.md`.

### G1 — ICA Maxi-testet *(Axels viktigaste kriterium)*
> Vet den tänkta målgruppen redan att produkten finns billigt i en vanlig butik?

Det spelar ingen roll att produkten är svår att hitta. Det som dödar en annons är att
mottagaren tänker *"den där har ju Biltema"*. Sök produkten i två nivåer:

| Nivå | Butiker | Träff betyder |
|---|---|---|
| **A — bredhandel** | Biltema, Jula, Clas Ohlson, Rusta, Kjell & Co, Bauhaus, ICA Maxi, Coop, Willys, Elgiganten, XXL | **FÄLLANDE** — grinden faller |
| **B — specialistbutik** | sportfiskebutiker, bilvårdsbutiker, jaktbutiker, hobbyhandel | **VARNING** — fällande *bara* om annonsmålgruppen är just de specialisterna |
| **C — marknadsplats** | Amazon.se, Fyndiq, CDON | **prisankare**, se nedan — aldrig fällande i sig |

**Amazon.se är inte bredhandel.** Nästan varje dropshippingprodukt ligger också på
Amazon.se — räknades den som nivå A skulle grinden fälla allt och bli meningslös.
Den behandlas i stället som ett **prisankare**: den fäller bara om listningen dyker upp
högt på den *svenska* sökterm kunden själv skulle skriva **och** ligger klart under vårt
tänkta pris. Ligger den djupt ner i sökresultatet är den en varning, inte ett stopp.

Nivå B-nyansen är hela poängen: en fiskeklämma som bara finns hos Sportfiskegiganten
passerar mot en bred manlig publik, men faller om vi annonserar mot sportfiskare.
Skriv alltid ut vilken målgrupp domen gäller.

*Verktyg som fungerar:* Clas Ohlson-, Kjell- och XXL-sök går att hämta. Biltema, Jula,
Rusta, Bauhaus och Amazon.se blockerar — täck dem med `WebSearch` i stället.

### G2 — Mättnadstestet
> Är produkten redan körd sönder?

Faller om **något** av detta stämmer:
- ≥3 svenska dropshipping-butiker säljer den redan
- den har varit en känd "TikTok-produkt" i mer än ~6 månader
- den ligger i de generiska topplistorna som alla produktjägare läser

Ser den *ny* ut men känns bekant: den är förmodligen mättad. Sök på svenska **och**
engelska — den engelska mättnaden kommer till Sverige med några månaders fördröjning,
och det fönstret är där pengarna finns.

### G3 — 3-sekunderstestet
> Syns wow:et på tre sekunder, utan ljud, i en stillbild eller ett klipp?

Bäverbutiken lever på Meta-video med ljudet av. Går effekten inte att **visa** — den
måste förklaras i text — är produkten omöjlig att annonsera oavsett hur bra den är.
Kräver ett konkret svar: *vilken bild?* Kan du inte beskriva bildrutan faller grinden.

### G4 — Marginaltestet
> Går den att sälja till minst 3× landed cost, med break-even-ROAS ≤ 2,0?

Landed cost = produktpris + frakt + eventuell tull. Räkna break-even-ROAS som
`1 / (1 − landed cost / försäljningspris)` och jämför mot kontots spann i
`products/products.json` (1,34–2,00 idag). Över 2,0 är produkten svårsåld även när
creativen fungerar — väggfästet på 2,00 är kontots smärtgräns, inte ett mål.

⚠️ **Bäverbutikens momsläge står ingenstans i repot.** Fråga Axel innan du drar av
25 % — gör du det reflexmässigt ser lönsamma produkter ut att gå med förlust.

### G5 — Returtestet
Faller på något av: kräver storleks-/passformsval · litiumbatteri (fraktrestriktioner)
· CE-/elsäkerhetskrav · livsmedelskontakt · vapenlikt · ömtåligt i postgång ·
leveranstid > 3 veckor.

*(Strandtofflorna är undantaget som bekräftar regeln — storleksval kostar i returer och
togs medvetet.)*

### G6 — Mansköpstestet
Köper en man den **till sig själv**? Är svaret "det är en present" → `VÄNTA`, inte `GO`.

---

## Steg 2 — Poäng. Bara för produkter som klarat alla sex grindar.

Sex axlar, 0–5 poäng. **Wow räknas dubbelt** — det är Axels uttalade viktigaste faktor.
Max 35.

| Axel | Vikt | 0 | 5 |
|---|---|---|---|
| **Wow** | **×2** | "jaha" | "vad fan är det där" — man stannar tummen |
| Problem | ×1 | konstruerat | gör ont, ofta, och mannen vet om det |
| Demo | ×1 | inget före/efter | före/efter filmar sig självt |
| Ovanlighet | ×1 | alla har sett den | målgruppen har aldrig sett den |
| Marginal | ×1 | break-even-ROAS ~2,0 | break-even-ROAS ≤1,4 |
| Robusthet | ×1 | ser billig ut i handen, går sönder | känns värd pengarna |

**Domen:**

| Poäng | Dom | Vad som händer |
|---|---|---|
| **≥26** | `GO` | Beställ prov. Drive-mapp `TEMU-<SKU> <Referensnamn>`, in i product sheetet, sedan `/ny-produkt` |
| **20–25** | `VÄNTA` | Ligger kvar i `kandidater.json`. Behöver en vinkel, ett bättre pris eller en säsong |
| **<20** | `NEJ` | Avfärdad — **med skäl**, så den inte utvärderas igen om tre månader |

**Wow-golv:** wow under 3 ger aldrig `GO`, hur bra totalen än ser ut. En produkt som
löser ett verkligt problem utan wow är en butiksprodukt, inte en annonsprodukt.

---

## Steg 3 — Vad som loggas

Varje bedömd produkt skrivs till `products/kandidater.json` — **även avfärdade**.
Det är hela poängen: utan de avfärdade utvärderas samma produkt om och om igen.
`node pipeline/kandidater.mjs sok <term>` före varje ny bedömning.

---

## Vad Claude faktiskt kan och inte kan (verifierat 2026-08-26)

Ärlighet här avgör om systemet går att lita på. Testat i den här miljön:

| Källa | Läge | Vad vi får |
|---|---|---|
| **Temu-sök** via `temu.com/search_result.html?search_key=<term>` | ✅ | Produktnamn. **Utan `/se/` i sökvägen** — `/se/`-varianten returnerar bara sidtiteln |
| **WebSearch** | ✅ | Bärande verktyget för G1 och G2 |
| Clas Ohlson-, Kjell-, XXL-sök | ✅ | Direkt G1-kontroll |
| Temu-priser | ⚠️ | **Opålitliga.** Extraheringen blandar ihop rader — vi har sett en pennvässare på $495. Priset läser Axel av själv |
| Temu sold-count / omdömen | ❌ | Finns inte i det vi kan hämta. Ingen automatisk säljvolym-validering |
| AliExpress | ❌ | 503 |
| Meta Ad Library | ❌ | 403 — mättnadskollen får gå via WebSearch |
| Kickstarter, Reddit, TikTok Creative Center, Amazon.se, Jula, Biltema, Rusta, Bauhaus | ❌ | 403/503/tomt skal |
| Chromium/Playwright | ❌ | All utgående trafik från webbläsaren resettas i den här miljön |

**Konsekvensen — arbetsfördelningen:**

- **Claude gör:** söktermerna, Temu-svepet, G1- och G2-sökningarna med källor,
  poängsättningen, loggen och dedupen.
- **Axel gör:** tittar på produktbilden och sätter wow-poängen, läser av det riktiga
  priset på Temu, tar det slutliga köpbeslutet.

Claude sätter aldrig en wow-poäng på en produkt vars bild ingen har sett — den lämnas
tom och domen hålls tillbaka tills Axel fyllt i den.
