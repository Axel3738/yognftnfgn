# Koppla en butik — Klient-ID och Hemlighet

Du behöver **tre uppgifter per butik**. Alla tre går att läsa av när som helst,
inget "visas bara en gång".

| Uppgift | Ser ut som | Var den står |
|---|---|---|
| Butikens adress | `4snrw0-mg.myshopify.com` | i adressfältet: `admin.shopify.com/store/**4snrw0-mg**` |
| Klient-ID | `c08d97a8...` (32 tecken) | appens inställningar → Inloggningsuppgifter |
| Hemlighet | `shpss_868d...` | samma ställe, tryck på ögat för att visa |

---

## Steg 1 — skapa appen (en gång per butik)

1. **Inställningar** → **Appar och försäljningskanaler** → **Utveckla appar**
2. **Skapa en app** → döp den `Bäver uppladdare`
3. Fliken **Konfiguration** → under *Admin API* kryssa i:
   `write_products` · `read_products` · `write_publications` · `read_publications` ·
   `write_inventory` · `read_inventory`
4. **Spara**
5. **Installera app** ← utan detta steg fungerar ingenting

## Steg 2 — läs av de tre uppgifterna

Gå till appens **Inloggningsuppgifter**. Kopiera **Klient-ID** och **Hemlighet**.
Adressen läser du i webbläsarens adressfält.

⚠️ Leta INTE efter någon "åtkomsttoken". Den behövs inte, och den som visas där
dör efter 24 timmar. Skriptet hämtar en färsk själv varje gång.

## Steg 3 — lägg in dem

I miljöinställningarna, tre rader per butik, `NYCKEL=värde`:

```
SHOPIFY_SHOP_SE=4snrw0-mg.myshopify.com
SHOPIFY_CLIENT_ID_SE=c08d97a83583b2f86f2e9c68821768b4
SHOPIFY_CLIENT_SECRET_SE=shpss_...
```

Byt `SE` mot `NO`, `DK`, `FI` eller `UK` för de andra butikerna.

⚠️ **Har du en `SHOPIFY_TOKEN_*`-rad liggande sedan tidigare — ta bort den.**
Den dör efter ett dygn och blir en tyst felkälla.

## Steg 4 — kontrollera

```bash
node temu/kolla-koppling.mjs
```
Skriver ingenting. En grön rad per butik med namn, valuta och antal produkter.

---

## Så fungerar inloggningen

Skriptet skickar Klient-ID + Hemlighet till
`POST https://<butik>/admin/oauth/access_token` med
`grant_type: client_credentials`, och får tillbaka en token som lever ~24 timmar.
Det sker automatiskt vid varje körning, så det finns aldrig någon token att
hålla reda på eller förnya.

## Det jag hade fel om 2026-08-19

Nedskrivet för att ingen ska gå i samma fälla igen:

- Jag sa att **Klient-ID och Hemlighet var fel fält** och skickade Axel på jakt efter
  en åtkomsttoken. Det var precis tvärtom — de två fälten är hela lösningen.
- Jag skrev **menyvägar ur minnet** i stället för att utgå från vad som faktiskt
  stod på skärmen. Shopifys etiketter skiljer sig mellan versioner och språk.
- Jag bad om **myshopify-adressen** i stället för att hämta den själv. Den går att
  läsa ur butikens egen HTML: `curl -sL <butiksdomän> | grep -oE '[a-z0-9-]+\.myshopify\.com'`
  och finns i `shop { myshopifyDomain }` via connectorn.
- En kvarglömd `SHOPIFY_TOKEN_*` i miljön **skuggade** den fungerande vägen och gav
  401 trots korrekta uppgifter. Därför vinner Klient-ID + Hemlighet alltid i koden.

Sammanlagt kostade det en timme. Regeln som föll ur det står som regel 15 i CLAUDE.md:
försök själv först, fråga bara när försöket misslyckats.
