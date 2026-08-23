# Skrapkort e-postklubb — tema-sektion för Bäverbutikens marknader

Fullskärms-popup med guldigt skrapkort: kunden skrapar fram rabatten, lämnar
sin mejl (blir riktig Shopify-prenumerant, taggad `newsletter, skrapkort`) och
får en rabattkod med en knapp som lägger koden i kassan.

**Masterfilen:** `sections/skrapkort.liquid` — svenska default-texter.
Alla kundtexter är inställningar i sektionens schema, så varje marknad får sitt
språk genom att bara ändra inställningarna (eller ladda upp en variant med
andra defaults). Skriv `[rabatt]` i en text så byts det mot rabatten (t.ex.
"10 %") med hårt mellanslag.

---

## Status per butik (2026-08-23)

| Butik | Läge |
|---|---|
| **bæverbutiken.dk** | ✅ Installerad i temadubbletten **"Live + skrapkort 2026-08-23"** (opublicerad), med danska texter. Rabattkoden `VELKOMMEN10` (10 %, alla kunder, en användning per kund) är skapad och AKTIV. Verifierad i preview med Chromium (mobil + desktop, skrapning + mejlsteg). **Kvar: publicera temat** (Webbshop → Teman) och testa i inkognitofönster. |
| **bäverbutiken.se** | ✅ Installerad i temadubbletten **"Live + skrapkort 2026-08-23"** (opublicerad), svenska texter, svart bakgrund. Använder den befintliga aktiva koden `VALKOMMEN10` (10 % på hela ordern, "Välkomstrabatt nyhetsbrev"). Verifierad i preview. **Kvar: publicera temat.** OBS: `VALKOMMEN10` har inte "en användning per kund" — ägarbeslut om den ska begränsas. Klaviyo-embed finns i temat: kolla att inga Klaviyo-popupformulär är aktiva så det inte blir dubbla popuper. |
| **beverbutikken.no** | ✅ Installerad med norska texter i TVÅ dubbletter, eftersom butiken hade ett förberett norskt tema vid sidan av live: **"Live + skrapkort 2026-08-23"** (kopia av live-temat, som är den svenska exporten) och **"Beverbutikken norsk + skrapkort 2026-08-23"** (kopia av "Beverbutikken norsk - KLAR FOR PUBLISERING"). Publicera den som gäller — skrapkortet finns i båda. Koden `VELKOMMEN10` (10 %, alla kunder, en användning per kund) skapad och AKTIV. Norska dubbletten verifierad interaktivt i preview. |
| Övriga marknader (UK …) | ⏳ Ej gjort — samma flöde per butik, se nedan. |

---

## Rollout till en ny butik/marknad

Butikens tema är Impulse (vintage, statiska sektioner). Flödet per butik:

1. **Duplicera live-temat** (aldrig ändra live direkt — tema-skrivningar mot
   MAIN blockeras dessutom av Shopify-MCP:n).
2. Ladda upp `sections/skrapkort.liquid` till dubbletten. För ett annat språk:
   antingen behåll svenska defaults och sätt texterna i temaredigeraren, eller
   byt `default`-värdena i schemat före uppladdning (som gjordes för danska).
3. Lägg raden `{%- section 'skrapkort' -%}` i `layout/theme.liquid`, direkt
   efter `{%- section 'newsletter-popup' -%}` (strax före `</body>`).
   I ett OS 2.0-tema: lägg i stället sektionen i footern via temaredigeraren.
4. Skapa rabattkoden i den butikens admin och fyll i kod + rabattext i
   sektionens inställningar.
5. Verifiera i preview (`?preview_theme_id=<id>`) innan publicering.

**Fallgropar:**
- Temat sätter inte `box-sizing: border-box` globalt — sektionen har en egen
  regel för det. Ta inte bort den; utan den skjuts innehållet åt höger och klipps.
- Butikens gamla `newsletter-popup`-sektion måste vara avstängd
  (`mode: disabled` i `config/settings_data.json`) så två popuper inte krockar.
  I .dk-butiken var den redan avstängd.
- Shopify tar EN rabattkod per köp — koden kan inte staplas med andra rabatter.
  Skriv det i finstilten om butiken kör automatiska rabatter.
- GemPages-layouterna (`layout/theme.gempages.*`) har INTE sektionen —
  medvetet, så ad-landningssidor slipper popupen.

## Verifiering

Sessionens Playwright-test (skrapar med pekaren, kollar att mejlsteget kommer
fram och att besökarminnet sparas) ligger inte i repot — det är ett engångs-
skript — men flödet är: öppna previewn, vänta in fördröjningen (7 s), dra
pekaren över canvasen tills >40 % är skrapat, verifiera att mejlsteget syns.
