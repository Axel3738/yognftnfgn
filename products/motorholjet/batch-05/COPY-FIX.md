# COPY-FIX — rätta de 17 live-annonserna från batch #4

**Detta är viktigare än hela batch #5.** Gör det först.

Verifierat 2026-08-06 direkt mot kontot (`body` och `title` på varje annons): **ingen av de 17
launchade batch-#4-annonserna kör den copy som stod i briefen.** Alla ärvde ett av tre gamla
textblock från batch #1. Tre av dem kör claims vi har förbjudit.

Två saker följer av det:

1. **Vi betalar just nu för att visa förbjudna påståenden.**
2. **Alla kontrollerade tester i batch #4 är obrukbara.** SO_8_1 mot SO_8_2 skulle isolera pris i
   bild — båda kör samma copy. PD_13_1 mot PD_13_2 skulle isolera en kvalificerande rad — båda kör
   samma copy. De testerna mäter ingenting och är omgjorda i batch #5.

---

## 1. Akut — förbjudna claims som ligger live

### A. Vinterdeadline i augusti

Rubriken **`Skydda din motor – innan vintern`** och bodyraden **`Beställ innan lagret tar slut 👇`**
kör på fem annonser:

| Annons | Spend hittills |
|---|---|
| `Motorhölje_SO_2` | 1 796 kr |
| `Enginecover_SO_5_1` | 1 894 kr |
| `Enginecover_SO_8_1` | 117 kr |
| `Enginecover_SO_8_2` | 3 kr |
| `Enginecover_SO_9_C1` | 6 kr |
| `Enginecover_SO_9_C1 RÅKADE BLI VIDEO` | 40 kr |

**Att vara ärlig om vad datan säger:** `Motorhölje_SO_2` kör den här rubriken och är kontots
**tredje bästa vinstbidragare**. Det finns inget underlag för att raden sänker resultatet. Vi tar
bort den för att den är säsongsfel i augusti och för att vi inte står bakom en deadline vi hittat
på — inte för att siffrorna dömt den. Byt texten, inte annonsen.

**Ersätt med** (SO-copyn nedan):

> Vi beställde för mycket motorhölje i 420D Oxfordtyg.
> Nu säljer vi ut till 299 kr istället för 367 kr.
> Vattenavvisande skydd mot regn, sol och damm.
> Dragsko runt hela kanten för tät passform.
> På och av på några sekunder.
> Så länge lagret räcker – beställ ditt hölje nu.

**Rubrik:** `299 kr istället för 367 kr`

### B. Overifierat kundantal

Bodyraden **`Hundratals nöjda kunder redan.`** kör på tre annonser:

| Annons | Spend hittills |
|---|---|
| `Enginecover_SP_5_H1` | 687 kr |
| `Enginecover_SP_8_1` | 3 kr |
| `Enginecover_SP_8_2` | 0 kr |

Vi har **noll verifierade recensioner**. Raden kan inte beläggas och ska bort ur kontot helt.

`Enginecover_SP_5_H1` är samtidigt en av kontots bästa annonser (98,15 kr CPA, 1 405 kr vinst per
1 000 kr). **Pausa den inte** — byt bara ut primärtexten.

**Ersätt med** (SP-copyn nedan):

> Din utombordare står ute i alla väder.
> Sol bleker plasten. Salt och damm sätter sig i varje skarv.
> Motorhölje i 420D Oxfordtyg, vattenavvisande, med dragsko runt hela kanten.
> På och av på några sekunder — ingen risk att glömma täcka den.
> 30 dagars nöjd-kund-garanti.
> Beställ ditt motorhölje idag.

**Rubrik:** `Skydd som sitter kvar, i alla väder`

---

## 2. Dubbletter som bränner budget

Tre annonser heter `... RÅKADE BLI VIDEO` och kör parallellt med likadant namngivna original:

| Annons | Format i kontot | Spend | CTA |
|---|---|---|---|
| `Enginecover_PD_15_C1 RÅKADE BLI VIDEO` | VIDEO | 44 kr | Se detaljer |
| `Enginecover_SO_9_C1 RÅKADE BLI VIDEO` | VIDEO | 40 kr | Se detaljer |
| `Enginecover_PD_6_C1 RÅKADE BLI VIDEO` | VIDEO | 6 kr | Handla nu |

Två av dem har dessutom fel CTA (`SEE_DETAILS` i stället för `Handla nu`).

**Åtgärd:** pausa alla tre. De testar ingenting, de delar namn med andra annonser vilket gör
rapporteringen tvetydig, och två har fel knapp.

---

## 3. Karusellerna är inte karuseller

`Enginecover_PD_6_C1`, `Enginecover_SO_9_C1` och `Enginecover_PD_15_C1` ligger i kontot som
`object_type: SHARE` med **en enda bild och inga `child_attachments`**. De är enkla statiska
bilder, inte karuseller.

Det betyder att karusellformatet fortfarande aldrig har testats. `PD_6_C1` har 528 kr och 3 köp —
den datan är giltig, men den mäter **en statisk bild**, inte en karusell. Notera det så att ingen
drar en formatslutsats ur den.

Batch #5 innehåller två riktiga karuseller (`SO_13_C1`, `PD_18_C1`). Kontrollera
`child_attachments` i kontot efter launch innan någon slutsats dras.

---

## 4. Full copy-tabell — vad varje live-annons ska köra

| Annons | Kör nu | Ska köra |
|---|---|---|
| `Motorhölje_SO_2` | SO gammal (vinter) | **SO ny** |
| `Enginecover_SO_5_1` | SO gammal (vinter) | **SO ny** |
| `Enginecover_SO_8_1` | SO gammal (vinter) | **SO ny** |
| `Enginecover_SO_8_2` | SO gammal (vinter) | **SO ny** |
| `Enginecover_SO_9_C1` | SO gammal (vinter) | **SO ny** |
| `Enginecover_SP_5_H1` | SP gammal (kundantal) | **SP ny** |
| `Enginecover_SP_8_1` | SP gammal (kundantal) | **SP ny** |
| `Enginecover_SP_8_2` | SP gammal (kundantal) | **SP ny** |
| `Enginecover_PD_6_C1` | PD gammal | **PD ny, body A** |
| `Enginecover_PD_6_1` | PD gammal | **PD ny, body A** |
| `Enginecover_PD_13_1` | PD gammal | **PD ny, body A** |
| `Enginecover_PD_13_2` | PD gammal | **PD ny, body B** |
| `Enginecover_PD_14_1` | PD gammal | **PD ny, body A** |
| `Enginecover_PD_15_C1` | PD gammal | **PD ny, body A** |
| `Motorhölje_PD_1_H3` | PD gammal | **Lämna orörd** — 61 % av spenden, byt inte copy under pågående test |
| `Motorhölje_PD_EXTRA` | PD gammal | **Lämna orörd** — kontots bästa videoasset |
| `Motorhölje_SP_1_H1` | SP gammal | **Lämna orörd** — bevisad vinnare, byt inte mitt i |
| `Motorhölje_SO_1_H1` / `SO_1_H2` | SO gammal | **Lämna orörda** — batch #1-referens |

**Varför lämna batch #1 orörd:** de fem ursprungliga annonserna är våra enda referenspunkter över
tid. Byter vi deras copy nu förlorar vi baslinjen som allt annat mäts mot. Rätta batch #4-annonserna
och låt batch #1 stå.

### PD ny — body A (kvalificerar på storlek)

> Är din utombordare en av de större på bryggan?
> Det här höljet är gjort för att sitta som gjutet — inte "passar de flesta".
> 420D Oxfordtyg och dragsko runt hela kanten håller regn och salt ute.
> På och av på sekunder.
> Hitta din storlek och skydda den. 👇

**Rubrik:** `Gjord för större motorer`

### PD ny — body B (kvalificerar på värde)

> Din motor är inte billig att ersätta.
> Ändå står den ute, oskyddad, mellan varje tur.
> 420D Oxfordtyg och dragsko runt hela kanten håller regn och salt borta.
> På och av på sekunder — ingen ursäkt att låta bli.
> Skydda investeringen. Beställ ditt motorhölje idag. 👇

**Rubrik:** `Skydda det som kostar mest`

---

## 5. Rutin som stoppar det här

Efter varje launch: öppna varje ny annons i Ads Manager och **läs primärtexten och rubriken högt
mot briefens copy card**. Tar två minuter för 17 annonser. Batch #4 kostade oss ett helt
testtillfälle för att det inte gjordes.

Varje brief i batch #5 har ett avsnitt `COPY CARD — paste this into Ads Manager exactly`. Det är
det enda stället texten ska hämtas från.
