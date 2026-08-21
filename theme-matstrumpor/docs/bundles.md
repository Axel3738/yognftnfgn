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

## Två vägar

**A. Widgeten nu, Kaching kvar som rabattmotor.**
Vår widget sätter samma antal, Kachings funktion drar samma rabatt. Fungerar
direkt utan att röra pengar. Men vi sitter kvar i appberoendet, och det är
oklart om funktionen triggar på enbart antal eller på Kachings egna
radattribut — det går inte att avgöra utan att lägga en riktig order.

**B. Vi äger rabatten.**
Riktiga rabatter i Shopify som matchar varje nivå — en automatisk rabatt per
antalsnivå plus en "köp X få Y"-rabatt för ätpinnarna. Ingen app behövs, och
priset på sidan är samma pris som kassan tar, garanterat.

Väg B kräver att rabatter skapas i Shopify. Det är ett ägarbeslut enligt
`CLAUDE.md` regel 12 och görs aldrig utan att Axel sagt ja.

## Så byggs vår version

- **Nivåerna är block i temaredigeraren** — ett block per nivå, med antal,
  rubrik, underrubrik, etikett, bricka, rabattyp och gratisprodukt. Axel
  uppdaterar dem själv, utan app och utan kod.
- **A/B-test** via sektionens `ab_test`/`ab_variant`, samma motor som resten av
  temat. Två sektioner, variant A och B, och utfallet skrivs på ordern.
- **Priset räknas på verkliga variantpriser**, aldrig på ett inskrivet tal.
