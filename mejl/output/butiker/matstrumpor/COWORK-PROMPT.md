# Cowork-prompt: fraktmejlen + menylänken i Matstrumpor (matstrumpor.se)

Byggd av `node mejl/bygg-butik.mjs matstrumpor`. Hela mallen byts — inte enskilda
rader — så mejlet ser ut som Bäverbutikens (Axels dom 2026-09-20 på den
lappade Shopify-mallen: "tvääär fula"). Länkarna pekar på `main`: pusha
först, annars klistrar Cowork in en gammal version. Delen under linjen är prompten.

---

Du jobbar i Chrome i mitt inloggade Shopify-konto för butiken **Matstrumpor**
(matstrumpor.se, 1r46tp-qx.myshopify.com). Uppgifter: **A.** byta ut koden i
**tre kundnotiser**, **B.** lägga in menylänken, sedan **C.** ett testmejl. Rör ingenting annat i
Shopify: inga andra mallar, inga inställningar, inga rabatter, inga produkter.

⚠️ **Datorn är en Windows-dator, inte en Mac.** Klicka alltid först inne i
kodfältet innan du markerar eller kopierar — kortkommandon som når Shopifys
sida öppnar dialoger ("Lägg till produktserie", "Lägg till sida"). Öppnas en
sådan dialog: stäng den utan att spara.

⚠️ **Urklippet är inte att lita på.** Metoden som fungerat (Bäverbutiken
2026-09-20): hämta råfilen direkt i Shopify-sidan, skriv in den via
kodrutans eget API, och verifiera mot serverns mall-data — inget urklipp,
inga kortkommandon. **Klistra aldrig in en halv mall.**

Kontrollera först att https://matstrumpor.se/pages/spara svarar och visar rubriken "Spåra ditt paket".
Gör den inte det: stoppa och rapportera.

⚠️ **Avsändaradressen.** Visar Shopify en gul banner i mallens redigerare —
"Innan du kan redigera aviseringar måste du granska och verifiera din
avsändares e-postadress" (fälten utgråade) — så är det tillåtet och väntat
att lösa den: klicka bannerns länk (Inställningar → Aviseringar →
avsändaradressen) och klicka **Skicka verifiering** / **Verifiera**. Det
går ett mejl till **kundsupport@matstrumpor.se** med en länk som Axel klickar — stanna
där, rapportera, och fortsätt med A när Axel sagt att länken är klickad.
Ändra inte adressen, byt inte avsändare. (Hände i Majavakauppa och
CaraShell 2026-09-20.)



### A. De tre mallarna

Gör så här för en mall i taget, uppifrån och ner i tabellen:

1. Hämta mallens råfil (kolumnen "Mallens kod"). Det är en ren textfil.
2. Shopify-admin → **Inställningar** → **Notiser** → **Kundaviseringar** → mallens namn → **Redigera kod**.
3. Fältet **E-postämne**: jämför med ämnesraden i tabellen, tecken för tecken. Skiljer den sig: byt till tabellens rad.
4. Rutan **E-postbrödtext (HTML)**: ersätt HELA innehållet med råfilen.
5. **Innan du sparar:** rätt teckenantal (tabellen) och att texten i kolumnen "Kontrollera" finns.
6. **Spara**.
7. **Kontrollera mot servern, inte mot redigeraren:** läs mallens innehåll och `updatedAt` ur Shopifys mall-data för sidan och jämför med råfilen. Stämmer det inte: säg till, klistra inte om i blindo. Klicka aldrig "Ignorera" på "Osparade ändringar" utan att först ha läst vad servern har.

| # | Mall i Shopify | Ämnesrad | Kontrollera | Tecken | Mallens kod |
|---|---|---|---|---|---|
| 1 | **Leveransbekräftelse / Shipping confirmation** | `Ditt paket är på väg` | `MS-` och `sha256` | **10 305** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/mejl/output/butiker/matstrumpor/fraktbekraftelse.liquid |
| 2 | **Leveransuppdatering / Shipping update** | `Ny info om ditt paket` | `MS-` och `sha256` | **6 153** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/mejl/output/butiker/matstrumpor/fraktuppdatering.liquid |
| 3 | **Ute för leverans / Out for delivery** | `Paketet kommer idag` | `MS-` och `sha256` | **6 142** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/mejl/output/butiker/matstrumpor/ute_for_leverans.liquid |

⚠️ Bredvid "Ute för leverans" ligger "Order ute för lokal leverans" — ta INTE
det — id:t i adressfältet är markören: shipment_out_for_delivery är rätt, local_out_for_delivery fel (båda heter "Out for delivery" internt; CaraShell 2026-09-21). Rör inte "Levererad". Talen är tecken, inte byte (å/ä/ö väger två byte i
Shopifys räknare).

### B. Menylänken

1. **Onlinebutik** → **Navigering** → **Huvudmeny** (Main menu).
2. Finns redan en rad som länkar till `/pages/spara`: rör den inte. Annars **Lägg till menyalternativ**, Namn: `Spåra paket`, Länk: `/pages/spara`, **Lägg till**, **Spara menyn**. Raden sist.
3. Samma i **Sidfotsmeny** (Footer menu) — heter den något annat, ta den meny sidfoten på matstrumpor.se faktiskt visar.
4. Kontrollera i kundens vy: öppna https://matstrumpor.se i en ny flik, ladda om, se att **Spåra paket** syns i huvudmenyn och sidfoten och landar på "Spåra ditt paket".

Skapa aldrig en ny meny, ta aldrig bort en rad, ändra inga andra namn.

### C. Testmejlet

**Leveransbekräftelse** → **Skicka testmejl**. Bara den. Öppna mejlet: en
enda knapp **Spåra paketet**, länken börjar med
`https://matstrumpor.se/pages/spara?nummer=MS-`. (Sidan säger att den inte hittar numret för
testmejlets påhittade spårningsnummer — det är väntat.)

### Rapportera tillbaka

1. Vilka mallar som sparades och verifierades mot servern, teckenantal per mall.
2. Om kontrolltexten saknades, och i vilken mall.
3. Menyerna: vilka två menyer som fick raden, och vad du såg i kundens vy.
4. Testmejlet: gick det, till vilken adress, knappens text.
5. Allt som såg konstigt ut.

Om Shopify vägrar spara: spara inte om, skriv exakt vad felmeddelandet sa.
