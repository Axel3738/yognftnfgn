# Cowork-prompt: fraktmejlen i CaraShell (carashell.se)

Byggd av `node mejl/bygg-butik.mjs carashell`. Hela mallen byts — inte enskilda
rader — så mejlet ser ut som Bäverbutikens (Axels dom 2026-09-20 på den
lappade Shopify-mallen: "tvääär fula"). Länkarna pekar på `main`: pusha
först, annars klistrar Cowork in en gammal version. Delen under linjen är prompten.

---

Du jobbar i Chrome i mitt inloggade Shopify-konto för butiken **CaraShell**
(carashell.se, yitrbk-m3.myshopify.com). Uppgifter: **A.** byta ut koden i
**tre kundnotiser**, sedan **C.** ett testmejl. Rör ingenting annat i
Shopify: inga andra mallar, inga inställningar, inga rabatter, inga produkter.

⚠️ **Datorn är en Windows-dator, inte en Mac.** Klicka alltid först inne i
kodfältet innan du markerar eller kopierar — kortkommandon som når Shopifys
sida öppnar dialoger ("Lägg till produktserie", "Lägg till sida"). Öppnas en
sådan dialog: stäng den utan att spara.

⚠️ **Urklippet är inte att lita på.** Metoden som fungerat (Bäverbutiken
2026-09-20): hämta råfilen direkt i Shopify-sidan, skriv in den via
kodrutans eget API, och verifiera mot serverns mall-data — inget urklipp,
inga kortkommandon. **Klistra aldrig in en halv mall.**

Kontrollera först att https://carashell.se/pages/spara svarar och visar rubriken "Spåra ditt paket".
Gör den inte det: stoppa och rapportera.

⚠️ **Avsändaradressen.** Visar Shopify en gul banner i mallens redigerare —
"Innan du kan redigera aviseringar måste du granska och verifiera din
avsändares e-postadress" (fälten utgråade) — så är det tillåtet och väntat
att lösa den: klicka bannerns länk (Inställningar → Aviseringar →
avsändaradressen) och klicka **Skicka verifiering** / **Verifiera**. Det
går ett mejl till **hello@carashell.com** med en länk som Axel klickar — stanna
där, rapportera, och fortsätt med A när Axel sagt att länken är klickad.
Ändra inte adressen, byt inte avsändare. (Hände i Majavakauppa och
CaraShell 2026-09-20.)


### 0. Avsändaradressen — FÖRST

**Inställningar** → **Notiser** → **Avsändarens e-post** (Sender email): byt till **hello@carashell.com** och spara. Shopify visar då "ej verifierad" och skickar ett verifieringsmejl till den adressen — Axel klickar länken i inkorgen hello@carashell.com. Rapportera "verifieringsmejlet skickat" och vänta på Axels "klickat" innan du går vidare till A. Ändra inget annat på sidan.

### A. De tre mallarna

⚠️ **Ämnesraderna är Liquid** (mallen väljer språk på leveranslandet): kopiera HELA raden ur `https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/mejl/output/butiker/carashell/<mall>.amne.txt` in i fältet E-postämne — den börjar med `{% case shipping_address.country_code %}` och slutar med `{% endcase %}`. Språken i mallen: sv, nb, en, fi.

Gör så här för en mall i taget, uppifrån och ner i tabellen:

1. Hämta mallens råfil (kolumnen "Mallens kod"). Det är en ren textfil.
2. Shopify-admin → **Inställningar** → **Notiser** → **Kundaviseringar** → mallens namn → **Redigera kod**.
3. Fältet **E-postämne**: jämför med ämnesraden i tabellen (råfilen `<mall>.amne.txt`), tecken för tecken. Skiljer den sig: byt till tabellens rad.
4. Rutan **E-postbrödtext (HTML)**: ersätt HELA innehållet med råfilen.
5. **Innan du sparar:** rätt teckenantal (tabellen) och att texten i kolumnen "Kontrollera" finns.
6. **Spara**.
7. **Kontrollera mot servern, inte mot redigeraren:** läs mallens innehåll och `updatedAt` ur Shopifys mall-data för sidan och jämför med råfilen. Stämmer det inte: säg till, klistra inte om i blindo. Klicka aldrig "Ignorera" på "Osparade ändringar" utan att först ha läst vad servern har.

| # | Mall i Shopify | Ämnesrad | Kontrollera | Tecken | Mallens kod |
|---|---|---|---|---|---|
| 1 | **Leveransbekräftelse / Shipping confirmation** | `(hela raden ur råfilens ämnesrad, se nedan)` | `CS-`, `sha256` och `country_code` | **41 115** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/mejl/output/butiker/carashell/fraktbekraftelse.liquid |
| 2 | **Leveransuppdatering / Shipping update** | `(hela raden ur råfilens ämnesrad, se nedan)` | `CS-`, `sha256` och `country_code` | **24 402** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/mejl/output/butiker/carashell/fraktuppdatering.liquid |
| 3 | **Ute för leverans / Out for delivery** | `(hela raden ur råfilens ämnesrad, se nedan)` | `CS-`, `sha256` och `country_code` | **24 394** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/mejl/output/butiker/carashell/ute_for_leverans.liquid |

⚠️ Bredvid "Ute för leverans" ligger "Order ute för lokal leverans" — ta INTE
det. Rör inte "Levererad". Talen är tecken, inte byte (å/ä/ö väger två byte i
Shopifys räknare).

### B. Menylänken

Redan gjord — **Spåra paket** ligger i huvudmenyn och sidfotsmenyn. Rör inte menyerna.

### C. Testmejlet

**Leveransbekräftelse** → **Skicka testmejl**. Bara den. Öppna mejlet: en
enda knapp **Spåra paketet**, länken börjar med
`https://carashell.se/pages/spara?nummer=CS-`. (Sidan säger att den inte hittar numret för
testmejlets påhittade spårningsnummer — det är väntat.)

### Rapportera tillbaka

1. Vilka mallar som sparades och verifierades mot servern, teckenantal per mall.
2. Om kontrolltexten saknades, och i vilken mall.
3. Testmejlet: gick det, till vilken adress, knappens text.
4. Allt som såg konstigt ut.

Om Shopify vägrar spara: spara inte om, skriv exakt vad felmeddelandet sa.
