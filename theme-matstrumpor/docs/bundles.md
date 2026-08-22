# Paketerbjudandena på matstrumpor.se

Avläst 2026-08-21 ur den installerade Kaching Bundles-appens konfiguration
**och verifierat mot fem riktiga ordrar** (#4685–#4689). Siffrorna nedan är
alltså vad kunder faktiskt betalade, inte vad en inställning påstår.

## Erbjudandena som rullar i dag (Sushi-Strumpor)

| Nivå | Antal | Kunden betalar | Ordinarie | Sparar | Gratis |
|---|---|---|---|---|---|
| 1 - Pack | 1 | 399 kr | 399 kr | – | – |
| **2 - Pack** ← förvald | 2 | **399 kr** | 798 kr | 399 kr (50 %) | 2× ätpinnar (100 kr) |
| 4 - Pack | 4 | **599 kr** | 1 596 kr | 997 kr (62 %) | 4× ätpinnar (200 kr) |

Texterna: *"För sushi-älskaren"*, *"Perfekt som gåva"* (bricka **Mest Populär**),
*"För hela familjen"* (bricka **Bäst Värde**). Etiketten är en mall:
`Spara {{saved_total}} + Fri Frakt`.

Blockrubrik: *"Fri Frakt & 30 Dagars Öppet Köp"*. Erbjudandet gäller bara
Sushi-Strumpor (`selectedProductIds`). Gratisprodukten är
**Äkta ätpinnar i trä** (produkt `10408204468563`, 50 kr/par).

`discountType: "specific"` betyder **fast totalpris för hela paketet** — inte
rabatt per styck. 2-pack: 798 − 399 = 399 kr i rabatt. 4-pack: 1 596 − 997 = 599 kr.

## ⚠️ Det som gör det här känsligt

Rabatten dras av en **Shopify-funktion som Kaching äger**
(`DiscountAutomaticApp` → *"Kaching Bundle Quantity Breaks (4.0)"*). Ordrarna
visar två automatiska rabatter per köp: en `ACROSS` på strumporna som tar ner
totalen till fastpriset, och en `EACH` på 100 % som gör ätpinnarna gratis.

**Avinstalleras appen slutar rabatten gälla — men en widget som bara ritar
kort skulle fortsätta visa paketpriset.** Då tar kassan fullt pris och kunden
upptäcker det i sista steget. Det är exakt det ärlighetsreglerna i
`README.md` finns för att förhindra.

En kopia av widgeten är alltså inte en kopia av funktionen. Ska vi äga det här
måste rabatten också bli vår.

## Två vägar — Axel valde B (2026-08-21)

**A. Widgeten nu, Kaching kvar som rabattmotor.** Fungerar direkt men lämnar
oss kvar i appberoendet. Vald bort.

**B. Vi äger rabatten.** Riktiga rabatter i Shopify som matchar varje nivå.
Ingen app behövs, och priset på sidan är samma pris som kassan tar.

---

# Så det byggdes

## 1. Nivåerna är metaobjekt, inte kod

Definitionen `ms_paketniva` (`Innehåll → Metaobjekt → Paketnivå` i adminen).
En post per nivå och produkt — **tolv poster i dag**, tre per strumpa.

| Fält | Vad |
|---|---|
| `produkt` | vilken produkt nivån gäller |
| `antal` | hur många par |
| `rubrik`, `underrubrik` | texten i kortet |
| `bricka` | "Mest Populär" / "Bäst Värde", tom = ingen bricka |
| `fastpris` | vad kunden ska betala totalt |
| `gratis_produkt`, `gratis_antal`, `gratis_text` | gåvan |
| `forvald` | vilket kort som är ikryssat från början |
| `ab_variant` | tom = alltid, `a`/`b` = bara i den varianten |
| `rabattkod` | koden som ger priset |

Axel ändrar erbjudanden här. Inget i temat behöver röras.

## 2. Rabatten är åtta riktiga rabattkoder som vi äger

| Kod | Drar av | Kräver minst |
|---|---|---|
| `PAKET-SUSHI-2` | 499 kr | 838 kr |
| `PAKET-SUSHI-4` | 998 kr | 1 676 kr |
| `PAKET-PIZZA-2` | 549 kr | 998 kr |
| `PAKET-PIZZA-4` | 1 327 kr | 1 996 kr |
| `PAKET-HAMBURGARE-2` | 399 kr | 698 kr |
| `PAKET-HAMBURGARE-4` | 947 kr | 1 396 kr |
| `PAKET-DONUT-2` | 399 kr | 698 kr |
| `PAKET-DONUT-4` | 947 kr | 1 396 kr |

Rabatten är ett **belopp**, inte en procent — precis som Kachings fastpris
fungerade. Därför blir avdraget rätt även när kunden byter variant.

⚠️ **Sushis minimibelopp är lägre än 2×399.** Sushi har två varianter
(5-par 399 kr, 3-par 369 kr). Minimibeloppet måste klara den billigaste:
2 × 369 + 2 × 50 = 838 kr. Sätts det efter 5-par-priset slutar rabatten
gälla så fort någon väljer 3-par — utan felmeddelande.

## Sushi kör BOGO sedan 2026-08-22 (Axels beslut)

Två kort (1-par-ankaret togs bort på Axels begäran 2026-08-22, på alla fyra
strumporna):

| Kort | Kod | Kunden betalar (5-par / 3-par) |
|---|---|---|
| **Köp 1 – Få 1 GRATIS** ← förvald, "Mest Populär" | `SUSHI-K1F1` | 399 / 369 kr |
| Köp 2 – Få 2 GRATIS, "Mest gratis" | `SUSHI-K2F2` | 798 / 738 kr |

### Sushis koder är köp-X-få-Y, inte belopp — och varför

Axel ville att ätpinnarna ska stå som **0 kr** i kassan, som Kachings gifts.
Första försöket var Kachings egen arkitektur: en beloppsrabatt på strumporna
plus en automatisk 100 %-rabatt på pinnarna. **Det fungerar inte med Shopifys
inbyggda rabatter**, och regeln är värd att minnas:

> En vara som redan fått rabatt räknas inte som "köpt" i en annan
> köp-X-få-Y-rabatt. Strumporna fick beloppsrabatten, alltså föll
> pinnrabattens köpkrav, alltså försvann den — oavsett att båda hade
> kombination påslagen. Verifierat i både varukorgen och kassans egen
> serialiserade state. Kaching kommer runt det med en egen Shopify
> Function; den vägen kräver en app.

Lösningen: **hela nivån är EN köp-X-få-Y-kod.** `SUSHI-K1F1` = köp 1
sushistrumpa, få 3 enheter gratis (1 strumpa + 2 par pinnar, 100 %).
`SUSHI-K2F2` = köp 2, få 6 enheter gratis. Då finns inget att kombinera,
och kassan visar gratisstrumpan OCH pinnarna som egna 0 kr-rader.

Kassatestat 2026-08-22: 5-par 399/798 kr, 3-par 369/738 kr, pinnar 0,00 och
en strumprad på 0,00 i varje köp.

### BOGO-rabatten skalar med varianten

En köp-X-få-Y-rabatt är inte ett fast belopp: gratisdelen är värd det
varianten kostar. Därför har metaobjektet fältet **`bogo_gratis`** (antal
gratis strumpor i nivån). Är det satt räknar Liquid och JS rabatten som
`bogo_gratis × variantpris + gåvans värde` — 3-par-lådan visar 369 kr och
kassan tar 369 kr. Fastprisfältet används inte i BOGO-läge.

### Gåvan visas som en hängande remsa

`ms-paket__gava` — streckad grön remsa under kortet med pinnarnas
produktbild, "Gratis på köpet" och värdet. Samma grepp som Kaching.

## Pizza, hamburgare och donut: kvar i fastprisläge

De kör sina ursprungliga koder (`PAKET-PIZZA-2` osv) med belopp mot hela
kundvagnen. Totalen är rätt på öret, men kassan SMETAR UT rabatten över alla
rader — pinnarna ser ut att kosta ~44–87 kr fast totalen stämmer. Det är
Shopifys fördelningsvisning och går inte att styra utan Functions.

De kan inte få sushilösningen rakt av: deras 4-pack (669/449 kr) är djupare
rabatterade än ren BOGO (898/598 kr), och köp-X-få-Y kan bara ge hela
enheter gratis. Ska pinnarna se gratis ut även där måste 4-packen bli ren
BOGO — en prishöjning, alltså Axels beslut. Frågan är ställd 2026-08-22.

## 3. Vid köp## 3. Vid köp

Sidan laddas inte om. Kunden får temats vanliga kundvagnslåda, precis som när
man köper vad som helst annat i butiken.

Ordningen är inte valfri:

1. **Rabattkoden först**, med en `fetch` mot
   `/discount/<kod>?redirect=/cart.js`. Shopify lägger koden på sessionen.
   `?redirect=/cart.js` gör att svaret blir några hundra byte JSON i stället
   för hela startsidan — det märks på mobil.
2. **Sedan varorna**, med `/cart/add.js`. Strumporna och gåvan i ett anrop.
   Anropet ber samtidigt om temats kundvagnssektioner (`sections`).
3. **Lådan ritas om** med temats egen `renderContents()` och öppnas.

Görs 1 och 2 i omvänd ordning ritas lådan med **fullpris** och rättar sig
först vid nästa sidladdning. Kunden hinner se fel siffra.

Efteråt kontrolleras `/cart.js`. Saknas koden gick något fel, och då tar vi
reservvägen: `/discount/<kod>?redirect=/cart`, som laddar om men alltid
fungerar. Finns ingen kundvagnslåda alls (butiken kan vara inställd på
kundvagnssida) går vi samma väg direkt.

Verifierat mot temat 2026-08-22 — vad som faktiskt skickas och vad lådan visar:

| Val | Kundvagn | Kod | Lådan visar |
|---|---|---|---|
| 1 par | 1 strumpa | – | 399 kr |
| Köp 1 – Få 1 | 2 strumpor + 2 ätpinnar | `PAKET-SUSHI-2` | 898 − 499 = **399 kr** |
| Köp 2 – Få 2 | 4 strumpor + 4 ätpinnar | `PAKET-SUSHI-4` | 1 796 − 998 = **798 kr** |

## ⚠️ Kachings rabatt är fortfarande ACTIVE

`DiscountAutomaticNode/1775028568403` — *"Kaching Bundles - Bundle #4 kung
kung"*, funktionen `Kaching Bundle Quantity Breaks (4.0)`. Den ligger kvar och
delar butik med våra åtta koder. **Två rabattmotorer på samma kundvagn.**

Det syns i testerna: samma köp gav 399 kr när vår kod fastnade och 499 kr när
den inte gjorde det (då tog Kachings funktion över och drog 399 kr på enbart
strumporna, inte på ätpinnarna). Vår kod vinner när den appliceras, för den
är bättre för kunden — men vi vill inte att utfallet ska bero på vem som
hinner först.

Den får **inte** stängas av medan det gamla temat är publicerat: den publicerade
sidan visar Kachings widget och är helt beroende av funktionen. Rätt ordning:

1. Publicera det nya temat.
2. Avaktivera Kachings automatiska rabatt.
3. Avinstallera appen.

Steg 2 och 3 är ägarbeslut enligt `CLAUDE.md` regel 12.

## Två fällor i temats egen kod

**Direktkassan går förbi allt.** `show_dynamic_checkout` är satt till `false`
på `buy_buttons` i `templates/product.json`. "Köp med Shop" skickar formuläret
rakt till kassan utan vår kod: ingen rabattkod, ingen gåva. Slår någon på den
igen fångar `direktkop()` i JS:en upp det och gömmer knappen så länge ett
rabatterat paket är valt — men inställningen är den riktiga spärren.

**Temat har en egen köplyssnare på samma formulär.** Kör både temats och vår
läggs varorna i vagnen **två gånger**. Vår lyssnare sitter därför i
fångstfasen på `document` och stoppar händelsen innan den når formuläret.

Att det inte redan smällt beror på att temats lyssnare råkar krascha på en
spinner som saknas i markupen (`Cannot read properties of null`). Det är tur,
inte konstruktion, och tur duger inte i den kod som rör pengar.

## Ärlighetsspärren

Ett rabatterat pris visas **bara** om nivån har både `fastpris` och
`rabattkod`. Saknas koden vet vi inte att kassan ger priset — då visar sidan
fullpris. Det är därför 1-pack inte har någon överstruken siffra.

## A/B-test av erbjudanden

Fältet `ab_variant` på metaobjektet. Tom = nivån visas alltid. `a` eller `b` =
bara i den varianten. Skapa två uppsättningar nivåer, sätt `a` på den ena och
`b` på den andra, och slå på testet i `Temainställningar → Matstrumpor A/B`.
Priset räknas alltid på verkliga variantpriser, aldrig på ett inskrivet tal.
