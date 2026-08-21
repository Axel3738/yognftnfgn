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
| `PAKET-SUSHI-4` | 1 197 kr | 1 676 kr |
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

## 3. Vid köp

`ms-paket.js` lägger strumporna **och** gåvan i kundvagnen med `/cart/add.js`,
och skickar sedan kunden till `/discount/<kod>?redirect=/cart`. Shopifys egen
väg. Ingen app, ingen funktion, inget som kan avinstalleras under oss.

Verifierat mot temat 2026-08-21 — vad som faktiskt skickas:

| Val | Kundvagn | Sedan | Kunden betalar |
|---|---|---|---|
| 1-pack | 1 strumpa | /cart | 399 kr |
| 2-pack | 2 strumpor + 2 ätpinnar | `PAKET-SUSHI-2` | 898 − 499 = **399 kr** |
| 4-pack | 4 strumpor + 4 ätpinnar | `PAKET-SUSHI-4` | 1 796 − 1 197 = **599 kr** |

## Två fällor som kostade pengar, båda hittade vid test

**"Köp nu" gick förbi allt.** Temats direktkassa skickar formuläret rakt till
kassan — utan rabattkod och utan gåvan. Sidan lovade 399 kr, kassan hade tagit
798 kr. Knappen göms nu så länge ett rabatterat paket är valt. På 1-pack finns
ingen rabatt att tappa, så där får den vara kvar.

**Vi band till fel formulär.** Dawn renderar ett **dolt** produktformulär
*före* det riktiga. Det saknar köpknapp och bär bara variantdata. Koden tog
det första den hittade, så köplyssnaren hamnade i tomma intet och kunden hade
fått **en** strumpa till fullpris fast sidan lovat ett paket. Samma fel tog
bort den fasta mobilknappen, som gav upp när den inte hittade någon knapp.
Regeln nu, i både `ms-cro.js` och `ms-paket.js`: rätt formulär är det som
**har en köpknapp**.

## Ärlighetsspärren

Ett rabatterat pris visas **bara** om nivån har både `fastpris` och
`rabattkod`. Saknas koden vet vi inte att kassan ger priset — då visar sidan
fullpris. Det är därför 1-pack inte har någon överstruken siffra.

## A/B-test av erbjudanden

Fältet `ab_variant` på metaobjektet. Tom = nivån visas alltid. `a` eller `b` =
bara i den varianten. Skapa två uppsättningar nivåer, sätt `a` på den ena och
`b` på den andra, och slå på testet i `Temainställningar → Matstrumpor A/B`.
Priset räknas alltid på verkliga variantpriser, aldrig på ett inskrivet tal.
