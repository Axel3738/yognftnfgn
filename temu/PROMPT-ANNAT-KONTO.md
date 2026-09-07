# Prompt att klistra in i ett annat Claude-konto

Allt nedanför linjen är prompten. Kopiera från `===` till slutet.
Den är självbärande – mottagaren behöver varken repot eller den här sessionen.

**Innan du klistrar in:** koppla Shopify-connectorn till **bäverbutiken.se** i det
kontot. Utan den kan sessionen inte göra någonting.

---

```
=== KLISTRA IN ALLT HÄRIFRÅN ===

Du ska lägga upp produkter i min Shopify-butik. Svara på svenska, kortfattat.
Jag är inte utvecklare – förklara enkelt och kör klart uppgiften. Lämna aldrig
över halvfärdigt arbete med en instruktion om vad jag "bara behöver göra själv".

## Butiken

bäverbutiken.se – svensk general store, SEK, betalning via Klarna.
Tonen är vardaglig och rakt på sak. Butikens signatur är en bäver-emoji 🦫.

FÖRSTA STEGET, ALLTID: kör `get-shop-info` och verifiera att du är i
bäverbutiken.se. Är du i en annan butik – stanna och säg till mig. Skriv aldrig
till fel butik.

## Vad jag ger dig

Per produkt: en Temu-länk, produktbilder (URL:er eller filer), pris i SEK, och
vilka varianter som ska säljas.

Om något av det saknas: fråga efter allt som saknas i ETT samlat meddelande, och
kör sedan klart hela vägen utan fler avbrott.

## Om Temu-länken – läs det här

Temu lämnar inte ut produktdata till en server. Testat noggrant 2026-08-12:
produktsidans HTML innehåller bara titel, en beskrivningstext och produkt-id.
Bilder, pris och varianter hämtar webbläsaren efteråt från Temus API, som svarar
NEED_LOGIN utan inloggat konto. Det finns ingen JSON-LD på sidan.

Slösa inte tid på att försöka skrapa sidan. Läs titeln och beskrivningen om du
vill ha underlag, men be mig om bilder, pris och varianter.

Temus råa titel är maskinöversatt nyckelordssoppa ("ny hattgalge fantastisk
hattförvaring 1 galge kan"). Använd den ALDRIG som produktnamn.

## VARIANTREGELN – viktigast av allt

Varianterna ska komma från MIN LEVERANTÖRSOFFERT, inte från Temu.

Temu är där jag hittade produkten. Leverantören är den som faktiskt levererar.
De har inte samma sortiment. Exempel från förra omgången: Temus sida sa
"tillgängligt i en mängd färger" om ett gräsklippartäcke, men leverantörsofferten
sa "ONLY BLACK, MOQ 10PCS". Hade vi tagit Temus färgurval hade butiken sålt
färger som inte går att leverera – och det upptäcks först när en kund betalat.

Har du inte offerten: fråga mig vilka varianter som gäller. Gissa aldrig.

Och: många produkter ska INTE ha varianter. En produkt som bara finns i ett
utförande ska ha en enda variant. Det är korrekt, inte ett fel.

## Arbetsgång per produkt

### 1. Produktnamn
Svenskt och säljande. Mönstret i butiken är `Produkt – Egenskap & Egenskap`,
max ~60 tecken.
Exempel: `Gräsklippartäcke 600D Oxford – med Dragsko`

### 2. Beskrivningen – exakt den här ordningen, sju block

1. `<h3>` + `<p>` – DET EMOTIONELLA PROBLEMET. Nämn inte produkten. Kunden ska
   känna igen sig. Skriv om situationen, inte om varan.
2. Bild (helst animerad GIF)
3. `<h3>` + `<p>` – LÖSNINGEN, alltså produkten
4. Bild
5. `<h3>Funktioner</h3>` + `<ul>` med exakt 5 punkter
6. Bild
7. `<h3>Vår garanti</h3>` + `<p>` – 30 dagars nöjd-kund-garanti, snabb leverans,
   trygg betalning med Klarna, avsluta med 🦫

Bilder skrivs så här:
`<p><img src="..." alt="..." loading="lazy" style="max-width:100%;height:auto"></p>`
GIF:en får dessutom `border-radius:8px`.

LÄGG ALDRIG IN EN TOM HTML-KOMMENTAR SOM PLATSHÅLLARE. Alltså inget
`<!-- GIF kommer här -->`. Det syns inte för kunden och ser ut som att jobbet är
gjort. Tolv av mina produkter låg live i elva dagar med osynliga hål i
beskrivningen på grund av just det. Har du ingen bild till en plats: säg det till
mig i stället.

Exempel på ton (block 1 och 3), från en produkt som ligger uppe:

> ### Kepshögen på hatthyllan. Vi behöver prata om den.
> Tio kepsar i en hög betyder tio tillplattade skärmar – och att favoriten alltid
> ligger längst ner.
>
> ### Lösningen: en galge, åtta kepsar
> Häng galgen i garderoben och ge varje keps sin egen plats. Skärmarna håller
> formen, du ser hela samlingen på en sekund – och hatthyllan får andas igen.

Varje rad ska klara tre frågor: går den att visualisera? går den att motbevisa
(alltså är den konkret, inte tomt beröm)? kan en konkurrent säga exakt samma sak?
Är svaret på den sista ja – skriv om raden.

### 3. Ladda upp bilderna
Bild-URL:er jag ger dig kan användas direkt om de redan ligger på ett publikt
HTTPS-värdnamn. Lokala filer måste till Shopifys CDN först:

1. `stagedUploadsCreate` (GraphQL) – `resource: FILE`, rätt `mimeType`,
   `httpMethod: POST`, `fileSize` i bytes. Flera filer i ett anrop.
2. POST filen till returnerad URL – alla `parameters` som formulärfält, filen
   sist som `file`. Svar 201 = ok.
3. `fileCreate` med `originalSource: <resourceUrl>`, `contentType: IMAGE`, `alt`.
4. Vänta ~20 s och läs `image.url` när `fileStatus` är `READY`.

Animerade GIF:er överlever – `mimeType` ska fortfarande vara `image/gif` efteråt.
Kontrollera det.

### 4. Skapa produkten
`create-product` med:
- `status: "ACTIVE"`
- `vendor: "Bäverbutiken"`
- `productType` – t.ex. `Camping`, `Golf`, `Förvaring`
- `tags` – 4–5 svenska sökord
- `variants[].sku` – `TEMU-<goods_id>` (goods_id är siffrorna i `-g-<siffror>.html`
  i Temu-länken). Flera varianter: lägg till variantnamnet, t.ex.
  `TEMU-601103799817572-iPhone-15-Pro`
- `variants[].inventoryItem.tracked: true`
- `options` MÅSTE anges så fort `variants` anges. Bara en variant → `['Title']`

### 5. Sätt "fortsätt sälja när slut i lager" – GLÖM INTE DETTA
`create-product` kan inte sätta det. Kör direkt efteråt:

```graphql
productVariantsBulkUpdate(
  productId: $id,
  variants: [{ id: $variantId, inventoryPolicy: CONTINUE }]
)
```

Utan det slutar produkten säljas så fort saldot tar slut – och saldot är påhittat
ändå eftersom jag dropshippar. Verifiera att VARJE variant fått `CONTINUE`.

### 6. Lägg produkten i en kollektion
Produkter hamnar INTE automatiskt i någon kollektion. Gör man inte det här syns
produkten inte i menyn. Hela min förra våg på 12 produkter låg utanför alla
kollektioner.

Kör `search_collections` för att se aktuella kollektioner och deras ID:n. I
bäverbutiken.se fanns dessa 2026-08-12:

| Kollektion | id |
|---|---|
| Trädgård & Utomhus | 714599956829 |
| Bil, Verktyg & Garage | 714600579421 |
| Camping & Friluft | 714601038173 |
| Lantbruk & Djur | 714603561309 |
| Båt & Marin | 714614538589 |
| Tillbehör & Övrigt | 714615161181 |
| Fordon & Belysning | 714616570205 |
| Golf & Sport | 720938402141 |
| Skor & Kläder | 720938434909 |
| Hem & Förvaring | 720938467677 |
| Elektronik & Mobil | 720938500445 |
| Bästsäljare | 720493445469 |

Lägg till med `add-to-collection`. En produkt får ligga i flera.

Passar produkten ingen av dem: SKAPA EN NY med `create-collection` (manuell,
`sortOrder: BEST_SELLING`, kort svensk beskrivning). Tvinga aldrig in en produkt
i en kollektion den inte hör hemma i.

### 7. Sätt Shopify-kategorin
Den används av Googles och Metas produktflöden. Sätts separat:

```graphql
productUpdate(product: { id: $id, category: "gid://shopify/TaxonomyCategory/..." })
```

Hitta rätt kategori med:
```graphql
{ taxonomy { categories(search: "tofflor", first: 5) { nodes { id fullName } } } }
```
Taxonomin är på SVENSKA i den här butiken – sök på svenska ord. Söker du på
engelska får du noll träffar och tror felaktigt att kategorin saknas.

### 8. Kontrollera och rapportera
Hämta produkten igen och gå igenom checklistan nedan punkt för punkt med ✅/❌.
Är något ❌: fixa det, eller skriv exakt varför det inte gick. Lämna aldrig ett ❌
utan förklaring. Ge mig länken till produkten i butiken.

## Definition of done – bocka av varje punkt

- [ ] `get-shop-info` bekräftade bäverbutiken.se INNAN något skrevs
- [ ] Produktnamn på svenska, inte Temus råa titel
- [ ] `status: ACTIVE`
- [ ] Varje variant har `inventoryPolicy: CONTINUE`
- [ ] Varianterna kommer från leverantörsofferten, inte från Temu
- [ ] SKU satt på varje variant
- [ ] Beskrivningen har alla sju blocken i rätt ordning
- [ ] Inga tomma HTML-kommentarer i beskrivningen
- [ ] Bilderna ligger på Shopifys CDN och syns i beskrivningen
- [ ] Produkten ligger i minst en kollektion
- [ ] Shopify-kategori satt
- [ ] Länk till produkten redovisad

## Sådant jag inte vill se

- Påhittade siffror. Pris, mått och materialuppgifter kommer från mig eller från
  produktsidan – aldrig ur minnet. Är du osäker: fråga.
- Långa svar. Håll dig kort.
- "Nu behöver du bara …". Kör klart i stället.
- Frågor om sådant du kan avgöra själv. Fråga bara när beslutet kräver ägaren:
  pris, rabatt, vilka varianter som ska tas in.

=== TILL HÄR ===
```

---

## Om du också vill fixa varianterna på de 12 befintliga

Lägg till det här under prompten ovan:

```
Utöver nya produkter: de 12 produkter jag lade upp 2026-08-01 har alla bara
varianten "Default Title". Sju av dem ska förbli så – de finns bara i ett
utförande. En kan sättas direkt: det magnetiska mobilskalet för iPhone
(goods_id 601103799817572). Temu listar modellerna ordagrant:
"iphone 17 16 15 14 13 12 pro max 17air 16e".

Skapa en variantaxel "Modell" med dessa 18 varianter, alla 219 kr, alla med
inventoryPolicy CONTINUE och SKU TEMU-601103799817572-<modell>:

iPhone 12, 12 Pro, 12 Pro Max
iPhone 13, 13 Pro, 13 Pro Max
iPhone 14, 14 Pro, 14 Pro Max
iPhone 15, 15 Pro, 15 Pro Max
iPhone 16, 16e, 16 Pro, 16 Pro Max
iPhone 17, 17 Air

Att varje serie finns i alla utföranden är en rimlig läsning av Temus text men
inte ordagrann – säg till om du vill att jag stryker någon modell.

Tre produkter kräver mitt besked innan varianter kan sättas, så rör dem inte:
golfskoväskan (vilka färger), tofflorna och fritidsskorna (vilka storlekar).
```
