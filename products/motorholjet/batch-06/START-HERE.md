# START HERE — kontoåtgärder före batch #6

**Läs detta före brieferna.** Punkt 1 är värd mer än hela batch #6, och punkt 1 är samma sak
som stod överst i `batch-05/COPY-FIX.md` för tre dagar sedan. Den är fortfarande inte gjord.

Allt nedan är verifierat direkt mot kontot 2026-08-09 (`ads_get_creatives`, `ads_get_ad_entities`).

---

## 1. Rätta de tre sparade copy-blocken — inte annonserna

**Det här är rotorsaken, och den är enklare att fixa än vi trott.**

Alla annonser i kampanjen kör en av **exakt tre** primärtexter. Alla tre är från batch #1.
Vilken av dem en annons får styrs av **vinkelprefixet i annonsnamnet** — `PD_`, `SP_`, `SO_`.
Det är ett sparat textblock som fylls i automatiskt.

Det betyder att ingen har slarvat annons för annons. Mallen gör det, varje gång, tyst. Och det
betyder att **rättningen inte behöver göras 17 gånger — den behöver göras tre gånger.**

Byt innehållet i de tre sparade blocken mot texten nedan. Då blir autoifyllningen rätt, och alla
framtida batcher ärver rätt copy i stället för fel.

### Block SO — ersätter vinterrubriken

Kör i dag på `Motorhölje_SO_2`, `Enginecover_SO_5_1`, `Enginecover_SO_8_1`, `SO_8_2`, `SO_9_C1`,
`SO_3_H1`, `SO_10_H1`, `SO_11_H1`. Innehåller **två förbjudna claims**: vinterdeadline i augusti
och "Beställ innan lagret tar slut".

> Vi beställde för mycket motorhölje i 420D Oxfordtyg.
> Nu säljer vi ut till 299 kr istället för 367 kr.
> Vattenavvisande skydd mot regn, sol och damm.
> Dragsko runt hela kanten för tät passform.
> På och av på några sekunder.
> Så länge lagret räcker – beställ ditt hölje nu.

**Rubrik:** `299 kr istället för 367 kr`

### Block SP — ersätter kundantalsraden

Kör i dag på `Enginecover_SP_5_H1`, `SP_8_1`, `SP_8_2`, `SP_6_H1`, `SP_9_H1`, `SP_13_H1`,
`SP_15_H1`. Innehåller **ett förbjudet claim**: "Hundratals nöjda kunder redan." Vi har noll
verifierade recensioner.

> Din utombordare står ute i alla väder.
> Sol bleker plasten. Salt och damm sätter sig i varje skarv.
> Motorhölje i 420D Oxfordtyg, vattenavvisande, med dragsko runt hela kanten.
> På och av på några sekunder — ingen risk att glömma täcka den.
> 30 dagars nöjd-kund-garanti.
> Beställ ditt motorhölje idag.

**Rubrik:** `Skydd som sitter kvar, i alla väder`

### Block PD — inget förbjudet, men kontots sämsta klickkvalitet

Kör i dag på `Motorhölje_PD_1_H3`, `PD_EXTRA`, `PD_6_1`, `PD_6_C1`, `PD_7_H1`, `PD_8_1`,
`PD_13_1`, `PD_13_2`, `PD_14_1`, `PD_15_C1`, `PD_16_H1`.

> Är din utombordare en av de större på bryggan?
> Det här höljet är gjort för att sitta som gjutet — inte "passar de flesta".
> 420D Oxfordtyg och dragsko runt hela kanten håller regn och salt ute.
> På och av på sekunder.
> Hitta din storlek och skydda den. 👇

**Rubrik:** `Gjord för större motorer`

### Två undantag — rör inte dessa

| Annons | Varför |
|---|---|
| `Motorhölje_PD_1_H3` | 42 % av all spend, 116 köp, **den enda annonsen i kontot som inte tappar effektivitet när den skalas.** Byt inte copy mitt i det. |
| `Motorhölje_SP_1_H1` | Kontots näst största vinstbidrag, 21 köp, stabil. Baslinje. |

Om det sparade blocket ändras och dessa två följer med automatiskt: acceptera det för SP_1_H1,
men **duplicera PD-blocket** så att PD_1_H3 behåller sin nuvarande text. Vi har ingen annan
annons som klarar skala.

---

## 2. Pausa det som förlorar pengar

| Annons | Spend | Köp | CPA | Läge | Åtgärd |
|---|---|---|---|---|---|
| `Enginecover_PD_6_C1` | 4 984 kr | 16 | **311,50** | Enda annonsen som **förlorar** pengar: −1 208 kr | Redan pausad ✅ |
| `Enginecover_SO_5_1` | 4 545 kr | 22 | 206,59 livstid, **264,48 senaste 7 dygn** | Livstid under break-even, men trenden ligger **över** 236 och den har 4 545 kr bakom sig | **Pausa** |
| `Enginecover_SO_8_1` | 910 kr | 4 | 227,44 livstid, **262,43 senaste 7 dygn** | Samma bild, mindre pengar | **Pausa** |
| 3 st `RÅKADE BLI VIDEO` | 235 kr totalt | 0 | – | Dubbletter, delar namn med andra annonser, två har fel CTA | **Pausa alla tre** |

**`Enginecover_PD_7_H1` ska INTE pausas.** Livstids-CPA 285 kr ligger över break-even, men de
senaste 7 dygnen ligger den på 226 — alltså under. Kill-regeln kräver att trenden håller i sig.
Det gör den inte. Lämna den och läs av igen om tre dagar.

---

## 3. Avpausa SP Batch 5 — den dödades för tidigt

Adsetet `Motorhölje SP Batch 5` är pausat efter **718 kr och 2 köp**. Signifikansgrinden i
`docs/os/ANALYSMETOD.md` går vid 300 kr **och 3 köp** — per annons, inte per adset. De enskilda
annonserna där inne hade 25–140 kr var.

Det tog ut två tester innan något av dem kunde läsas:

- `SP_13_H1` — testade om social proof-vinkeln är portabel till en tredje talare
- `SP_15_H1` — testade SP-copy på `PD_EXTRA`:s footage

Båda frågorna är fortfarande obesvarade. Avpausa adsetet, eller acceptera att båda testerna är
förlorade och att SP-blocket vilar på två annonser varav en kollapsade.

---

## 4. Budgeten stämmer inte med vår konfig

Kampanjen ligger på **4 000 kr/dag**. `products/products.json` sa 6 000 kr. Rättat i repot.
Kvoten sjunker därmed från 14 till 10 creatives per 3-dagarscykel vid nästa körning.

---

## 5. Skalningskandidat — försiktigt

`Motorhölje_PD_EXTRA` ger **1 376 kr vinst per 1 000 kr**, kontots högsta, på bara 795 kr spend.

**Läs varningen innan du höjer:** fyra annonser har sett ut precis så här och kollapsat när de
fick pengar. `SP_5_H1` gick från 1 405 till **77** kr per 1 000 på tre dagar och 1 505 extra
kronor. Höj till ungefär 1 500 kr och läs av — dumpa inte budget i den.

---

## 6. Två blockerare som inte är våra att lösa

| # | Vad | Varför det spelar roll |
|---|---|---|
| B8 | **Retargeting-adset saknas.** | ~100 övergivna varukorgar från `PD_1_H3` ensam. `SO_10_H1` launchades 7 aug rakt in i kall trafik i stället, och mäter därför ingenting. `SO_19_H1` i batch #6 är blockerad tills adsetet finns. |
| B9 | **Bilderna går inte att granska.** `*.fbcdn.net` blockeras av gatewayen (403, verifierat tre körningar). | Bilden är kontots största variabel — fem annonser med identisk copy spänner 34-faldigt. Ladda upp de statiska annonsbilderna till Drive, så kan teardownet äntligen göras. |

---

## 7. Elva briefer från batch #5 byggdes aldrig

`SP_12_1`, `SP_12_2`, `SP_12_3`, `SP_14_1`, `PD_16_1`, `PD_17_1`, `SO_14_1`, `SO_14_2`,
`SO_15_1`, `SO_13_C1`, `PD_18_C1`. Bara de tre videorna blev av.

Batch #6 återanvänder inte dem — den ställer frågorna på nytt i ett upplägg som klarar
copy-problemet. **Men det betyder att flaskhalsen just nu inte är briefer, det är produktion.**
Vill du hellre bygga de elva än de fjorton nya, säg till, då är den frågan din och inte min.
