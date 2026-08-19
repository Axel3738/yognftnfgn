# Koppla API:erna — en gång per butik, sen aldrig mer

Det här är det enda du behöver göra manuellt. Cirka 3 minuter per butik, fem butiker.
Efter det kan `ladda-upp.mjs` skriva till alla fem i en körning, utan att du kopplar om
connectorn en enda gång.

**Varför inte connectorn?** Shopify-connectorn håller bara EN butik åt gången. Det är
därför du fått koppla om fem gånger per omgång. En egen API-token per butik löser det —
då kan skriptet prata med alla samtidigt.

---

## Steg 1 — skapa token (upprepa för varje butik)

Logga in i **den butikens** Shopify-admin. Gör det en butik i taget så du inte blandar ihop dem.

1. **Inställningar** (kugghjulet nere till vänster)
2. **Appar och försäljningskanaler**
3. Knappen **Utveckla appar** uppe till höger
   - Första gången: klicka **Tillåt anpassad apputveckling** → bekräfta
4. **Skapa en app** → döp den `Bäver Uppladdare` → **Skapa app**
5. Fliken **Konfiguration** → **Konfigurera** under *Admin API-integration*
6. Kryssa i exakt dessa behörigheter:

   | Behörighet | Varför |
   |---|---|
   | `write_products` | skapa och ändra produkter |
   | `read_products` | inventera först, så inga dubbletter skapas |
   | `write_publications` | publicera på försäljningskanalerna |
   | `read_publications` | läsa vilka kanaler butiken har |
   | `write_inventory` | sätta "fortsätt sälja när slut i lager" |
   | `read_inventory` | läsa lagerstatus |

7. **Spara**
8. Fliken **API-uppgifter** → **Installera app** → **Installera**
9. Under *Admin API-åtkomsttoken*: klicka **Visa token en gång** och **kopiera den**

⚠️ **Tokenen visas EN gång.** Kopierar du den inte nu måste du skapa en ny.
Den börjar med `shpat_`.

10. Notera också butikens **.myshopify.com-adress**. Den står i adressfältet när du är
    inne i admin: `admin.shopify.com/store/DET-HÄR-NAMNET` → adressen är
    `DET-HÄR-NAMNET.myshopify.com`.

---

## Steg 2 — lägg in dem i miljön

⚠️ **Klistra ALDRIG in en token i chatten.** Den hamnar i historiken och går inte att
ta tillbaka. Lägg in dem som miljövariabler i stället — då finns de kvar mellan sessioner
och syns aldrig i någon logg.

I **claude.ai → Code → inställningar för din miljö → Environment variables**, lägg till
tio variabler (två per butik):

| Namn | Värde |
|---|---|
| `SHOPIFY_SHOP_SE` | `xxxx.myshopify.com` |
| `SHOPIFY_TOKEN_SE` | `shpat_...` |
| `SHOPIFY_SHOP_NO` | `xxxx.myshopify.com` |
| `SHOPIFY_TOKEN_NO` | `shpat_...` |
| `SHOPIFY_SHOP_DK` | `xxxx.myshopify.com` |
| `SHOPIFY_TOKEN_DK` | `shpat_...` |
| `SHOPIFY_SHOP_FI` | `xxxx.myshopify.com` |
| `SHOPIFY_TOKEN_FI` | `shpat_...` |
| `SHOPIFY_SHOP_UK` | `xxxx.myshopify.com` |
| `SHOPIFY_TOKEN_UK` | `shpat_...` |

Landskoderna måste stämma med butiksregistret i `butiker.mjs`:
`SE` = bäverbutiken.se · `NO` = grillklinikken.no · `DK` = bæverbutiken.dk ·
`FI` = majavakauppa.fi · `UK` = beavershop.co.uk

---

## Steg 3 — kontrollera att det funkar

```bash
node temu/kolla-koppling.mjs
```

Skriptet läser varje token, frågar butiken vad den heter och jämför mot registret.
Det **skriver ingenting**. Du ska få fem gröna rader. Får du en röd står det exakt
vad som är fel — fel token, fel butik eller saknad behörighet.

Vanligaste felet: `SHOPIFY_SHOP_DK` pekar på fel butik. Skriptet upptäcker det genom att
jämföra valutan (DKK) mot registret och stoppar innan något skrivs.

---

## Steg 4 — ladda upp

```bash
node temu/ladda-upp.mjs produkter.json --alla --torrkorning   # visar vad som SKULLE hända
node temu/ladda-upp.mjs produkter.json --alla                 # skarpt
```

Kör **alltid torrkörningen först**. Den inventerar butikerna på riktigt och visar vad som
skulle skapas och vad som hoppas över för att det redan finns — men skriver ingenting.

---

## Om en token läcker

Gå till appen i Shopify-admin → **API-uppgifter** → **Avinstallera app**. Tokenen dör
direkt. Skapa en ny app och en ny token.
