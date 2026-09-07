# Variantplan – de 12 produkterna från 2026-08-01

Status: **inte utförd.** Axel har en annan Shopify-butik kopplad till kontot just nu,
så ingenting har skrivits till butiken. Den här filen är underlaget som ska köras
när han ger klartecken.

Alla 12 produkter har i dag exakt en variant: `Default Title`.

---

## Det viktigaste fyndet först

**Varianterna ska inte hämtas från Temu. De ska hämtas från CWD-offerten.**

Gräsklippartäcket visar varför. Temus produktsida säger ordagrant *"tillgängligt i
en mängd färger"*. CWD-offerten i `Next_up_products.xlsx` säger:

> `ONLY BLACK, MOQ 10PCS!`

Temu är butiken Axel *hittade* produkten i. CWD är leverantören han faktiskt
*köper* från. Lägger vi upp Temus färgurval säljer butiken varianter som inte går
att leverera – och det upptäcks först när en kund har betalat.

Samma sak gäller storlekar: Temu listar sitt eget sortiment, CWD sitt.

**Regel härifrån: Temu ger produktidé och bilder. CWD-offerten ger varianterna.**

---

## Vad Temu faktiskt lämnar ut (undersökt 2026-08-12)

Variantdata går inte att läsa av. Det är nu testat på fem oberoende sätt:

| Metod | Resultat |
|---|---|
| HTML-källan, 3 olika User-Agents (desktop, mobil, Googlebot) | 0 träffar på `skuList`, `specName`, `specValue`, `skuId` |
| Produktbilder i HTML | 0 – de 47 CDN-träffarna är UI-ikoner och JS-buntar |
| JSON-LD (strukturerad data för Google) | finns inte på sidan |
| Temus interna API, 5 endpoints, med riktig cookie-session | `NEED_LOGIN` / `request illegal` / 403 |
| Playwright/Chromium | webbläsaren har ingen nätverksåtkomst i den här miljön |

API-testet är värt att förstå, för det avgör om det är lönt att försöka igen:

- Fel `goods_id` → `GOODS_NOT_EXIST`
- Rätt `goods_id` → `NEED_LOGIN`

Endpointen fungerar alltså och känner igen produkten. Det som saknas är ett
inloggat Temu-konto. **Med Axels Temu-cookies skulle varianterna gå att hämta
automatiskt** – det är den enda vägen som återstår, och den kräver honom.

Verktygen finns: `temu/api-test.mjs` och `temu/varianter.mjs`.

---

## Vad som ändå går att utläsa, per produkt

`Temu säger` = ordagrant ur produktsidans egen beskrivning.
`CWD säger` = ur offertkolumnen i `Next_up_products.xlsx`.

| Produkt | Temu säger | CWD säger | Variantaxel |
|---|---|---|---|
| Uteduschen | inget om varianter | 1pc $20,5 | **ingen** – en variant |
| Golfskoväska | "färgglada" (listar dem inte) | 1pc $11,0 | färg – **antal okänt** |
| Magnetfiskesats | inget (styrka 320 lb i namnet) | 1pc $8,1 | **ingen** – en variant |
| Golfbollsplockare | inget | `80CM` | **ingen** – längden är fast |
| Tofflor | "plus size", "för män och kvinnor" | "Without shoe box, similar" | storlek – **ej listad** |
| Fritidsskor | "grå-röda detaljer, tillgängliga i stora storlekar" | "Without shoe box" | storlek – **ej listad**, en färg |
| Mobilskal | **"iphone 17 16 15 14 13 12 pro max 17air 16e"** | 1pc $6,8 | **modell – listad, se nedan** |
| Surfplatteställ | inget | 1pc $9,7 | **ingen** – en variant |
| Multiverktygshammare | inget | 1pc $12,8 | **ingen** – en variant |
| Gräsklippartäcke | "en mängd färger" | **`ONLY BLACK, MOQ 10PCS!`** | **ingen – bara svart** |
| Fiskespöhållare | inget | "1 set (2 pcs)" | **ingen** – 2-pack är enheten |
| Skoreparationslappar | (redan uppe sedan tidigare) | 12 st per förpackning | **ingen** |

### Slutsats

- **7 produkter behöver inga varianter alls.** Uteduschen, magnetfiskesatsen,
  golfbollsplockaren, surfplattestället, multiverktygshammaren, gräsklippartäcket
  och fiskespöhållaren säljs som en enda artikel. Där är `Default Title` korrekt,
  inte ett fel. Gräsklippartäcket ser ut att behöva färger men gör det inte –
  leverantören har bara svart.
- **1 produkt kan sättas direkt.** Mobilskalet, se nedan.
- **3 produkter kräver ett besked från Axel.** Golfskoväskan (vilka färger),
  tofflorna och fritidsskorna (vilka storlekar). Den informationen finns varken
  på Temu-sidan eller i offerten.

---

## Mobilskalet – klart att köra

Temu listar modellerna ordagrant: `iphone 17 16 15 14 13 12 pro max 17air 16e`.
Utskrivet till en variantaxel `Modell`, 18 varianter, alla 219 kr:

```
iPhone 12 · iPhone 12 Pro · iPhone 12 Pro Max
iPhone 13 · iPhone 13 Pro · iPhone 13 Pro Max
iPhone 14 · iPhone 14 Pro · iPhone 14 Pro Max
iPhone 15 · iPhone 15 Pro · iPhone 15 Pro Max
iPhone 16 · iPhone 16e · iPhone 16 Pro · iPhone 16 Pro Max
iPhone 17 · iPhone 17 Air
```

SKU: `TEMU-601103799817572-<modell>`.
Alla ska ha `inventoryPolicy: CONTINUE`, precis som dagens enda variant.

Ett förbehåll: Temus text räknar upp serierna (12–17) och lägger till
"pro max", "17air", "16e" separat. Att varje serie finns i alla tre utförandena är
en rimlig läsning av texten, men den är härledd – inte ordagrann. Ska den vara
exakt behövs Temu-inloggning eller ett besked från Axel.

---

## Det Axel behöver svara på

1. **Golfskoväskan** – Temu säger "färgglada". Vilka färger tar vi in?
2. **Tofflorna** – vilka storlekar? (Temu säger "plus size", CWD säger inget.)
3. **Fritidsskorna** – vilka storlekar? Färgen är given: grå med röda detaljer.
4. **Mobilskalet** – kör vi de 18 varianterna ovan, eller bara de vanligaste
   modellerna?

Alternativt: **logga in på Temu och ge sessionen tillgång**, så hämtas allt
automatiskt med verktygen som redan ligger i den här mappen.
