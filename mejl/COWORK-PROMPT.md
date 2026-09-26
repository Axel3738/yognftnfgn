# Prompten till Cowork: mejlmallarna + menylänken "Spåra paket" i Shopify

Shopify har inget API för notismallarna, och appen "Bäver uppladdare" saknar
rättigheten för menyerna (`write_online_store_navigation`, mätt 2026-09-20).
Båda är därför klick i admin, och Cowork (Claude i Chrome) gör dem i Axels
inloggade flik. **Axel klistrar inte in något själv** (hans besked
2026-09-20) — den här filen ÄR uppgiften, kopierad rakt in i Cowork.

⚠️ **Körs ALLRA SIST, när spårningssidan är helt färdig** (Axels ordning
2026-09-20). Mallarna pekar på sidan; sidan ska stå klar innan mejlen börjar
skicka kunder dit.

⚠️ **Cowork kan inte klicka inuti Artifact-sidans ram** (sandlådad iframe,
mätt 2026-09-12) — kopiera-knapparna på `/mejl`-sidan är därför oåtkomliga
för den. Lösningen är råfilerna på GitHub: repot är publikt (mätt
2026-09-13), så `raw.githubusercontent.com`-länkarna öppnas som ren text i
en flik.

**Länkarna pekar på `main`** (grenen mergades 2026-09-20 kväll på Axels
order). Bygger en gren om mallarna: byt till grenens namn i länkarna tills
den mergats, annars klistrar Cowork in en gammal version.

Teckentalen nedan är från bygget 2026-09-26 (**v13: butikskrediten KREDIT100
ersätter lyckohjulet** i Orderbekräftelse, Leveransbekräftelse och Levererad,
Axels beslut samma dag: hjulet gav 0 köp). Leveransuppdatering, Ute för
leverans, Återbetalning och Order annullerad är byte för byte oförändrade och
står inte i tabellen. Bygger du om mallarna, räkna om dem i TECKEN
(`python3 -c "print(len(open('mejl/output/fraktbekraftelse.liquid',encoding='utf-8').read()))"`),
inte byte — Cowork mätte 2026-09-18 att `wc -c` gav byte och stämde inte.

Historik: v4 inklistrad 2026-09-14, v6 (tre erbjudandemallar) 2026-09-18,
v8 (fyra fraktmallar) 2026-09-18 kväll, v9 (tre fraktmallar) 2026-09-18 sen
kväll, v10 (knappen till egna sidan) byggd 2026-09-19 men aldrig
inklistrad, **v11 (bävernumret) inklistrad av Cowork 2026-09-20 kl 17:35–17:37
CEST** — alla tre verifierade tecken för tecken mot serverns `EmailTemplate`
(77 552 / 6 245 / 6 234, SHA-256 lika), Levererad orörd (18/9), ämnesraderna
var redan rätt. Samma körning: **"Spåra paket" → `/pages/spara` sist i
Huvudmeny (`main-menu`) och Sidfotsmeny (`footer`)**, sedd i kundens vy
(sessionen läste startsidan efteråt: länken finns i desktopmenyn,
mobilmenyn och sidfoten). Testmejl skickat till Axels Gmail. Coworks metod
som fungerar: hämta filen direkt i Shopify-sidan, skriv in via kodrutans
eget API, verifiera mot serverns mall-data — inget urklipp, inga
kortkommandon. Cowork noterade att ett klick på menylänken på startsidan
inte navigerade i dess webbläsare ("svart laddningsyta") medan direktbesök
fungerade — HTML:en pekar rätt, troligen temats laddningsöverlägg som fångade
det första klicket; inte mätt av en människa.

**v12 inklistrad av Cowork 2026-09-21 kl 22:30 CEST — EN mall, Orderbekräftelsen.**
Leveranstiden i FAQ-raden: `7–14 dagar` → `5–10 arbetsdagar` (Axels order samma
dag). Verifierad mot serverns `emailTemplate`, inte mot redigeraren: **84 138
tecken, SHA-256 lika med GitHub-filen**, `updatedAt 2026-09-21T20:30:48Z`,
`5–10 arbetsdagar` finns och `7–14 dagar` är borta. Ämnesraden var redan exakt
rätt (109 tecken) och rördes inte. De tre fraktmallarna orörda och kontrollerade
på plats: 77 552 / 6 245 / 6 234, alla med `Ditt paketnummer` + `sha256`,
Leveransbekräftelsen även `Beräknad leverans`; inga osparade utkast låg och
väntade. Menyraderna fanns redan från v11 — lästa i kundens vy på tre ställen
(desktopmeny, mobilmeny, sidfot), alla `href="/pages/spara"`. Testmejl skickat
från Leveransbekräftelse till Axels Gmail.

⚠️ **Filen bar en ändring till, och den var rätt:** produkttiteln `Taköverdrag
Husvagn 6,5 × 3 m – Skyddar Den Dyraste Ytan` hade kortats till `Taköverdrag
Husvagn – Skyddar Den Dyraste Ytan` på två rader. Orsaken är att `npm run mejl`
läser produkterna **live ur Shopify** vid varje bygge (`mejl/produkter.json`),
och Axel hade döpt om produkten i butiken; handlen är oförändrad. Det förklarar
också varför mallen blev KORTARE (84 151 → 84 138) trots att leveranstidstexten
blev sex tecken längre. Räkna aldrig bort en teckendiff som "fel urklipp" utan
att först jämföra mot butikens egna produktnamn.

⚠️ **Adressen `/email_templates/out_for_delivery/edit` ger 404** — rätt slug är
`shipment_out_for_delivery`. `local_out_for_delivery` ("Order ute för lokal
leverans") är en ANNAN mall och ska inte röras. Samma fallgrop som CaraShell
2026-09-21.

**v13 byggd 2026-09-26, väntar på inklistring** (prompten nedan). Menylänken
"Spåra paket" gjordes i v11 och ingår inte längre.

---

## Kopiera allt nedanför linjen till Cowork

Du jobbar i Chrome i min inloggade Shopify-admin för butiken
**Bäverbutiken.se**. Två uppgifter: **A.** byta ut koden i **tre
kundnotiser**, **C.** ett testmejl. Rör ingenting annat i Shopify:
inga andra mallar, inga inställningar, inga rabatter, inga produkter, inga
sidor, inga menyer. Rabattkoden KREDIT100 finns redan och ska inte röras.
Rabattkoden TACKIGEN och sidan /pages/din-gratisprodukt ska inte heller
röras (kunder har redan fått mejl med dem).

Mallarna är stora (~62 000 till ~74 000 tecken). Det tar några sekunder att
klistra in. Vänta ut det. **Klistra aldrig in en halv mall**: går något
fel, stoppa och berätta vad som hände.

⚠️ **Datorn är en Windows-dator, inte en Mac.** Klicka alltid först inne i
kodfältet innan du markerar eller kopierar. Kortkommandon som når Shopifys
sida i stället för fältet öppnar dialoger som "Lägg till produktserie" och
"Lägg till sida" (hände 2026-09-13). Öppnas en sådan dialog: stäng den utan
att spara, och skapa aldrig något.

⚠️ **Urklippet är inte att lita på.** Kontrollera alltid vad du klistrat in
INNAN du sparar: rätt längd (se tabellens teckenantal) och rätt innehåll.
Metoden som fungerat flera körningar i rad: hämta filen direkt i
Shopify-sidan, skriv in den via kodrutans eget API och jämför mot källfilen
tecken för tecken före sparning.

### A. Mallarna (v13: butikskrediten i stället för hjulet)

Ändringen: den svarta rutan överst som sa **"Snurra hjulet, vinn en gratis
produkt"** med koden TACKIGEN och raden med tio produktbilder är borta. I
stället står **"100 kr rabatt på nästa köp"** med knappen **HÄMTA MIN
RABATT**, som går till
`https://baverbutiken.se/discount/KREDIT100?redirect=%2Fcollections%2Fall`.
Allt annat i mallarna är oförändrat.

**Börja med att kolla vad som redan sitter — per mall.** Öppna mallen →
Redigera kod. Står `KREDIT100` redan i brödtexten och inte `TACKIGEN` är den
klar: hoppa över den. Annars: klistra in enligt stegen.

Gör så här för en mall i taget, uppifrån och ner i tabellen:

1. Öppna mallens kodlänk i en **ny flik**. Det är en ren textfil.
2. Gå tillbaka till Shopify-admin → **Inställningar** → **Notiser** →
   **Kundaviseringar** → klicka på mallens namn.
3. Klicka **Redigera kod** (Edit code).
4. Fältet **E-postämne** (Email subject): jämför med ämnesraden i tabellen,
   tecken för tecken. Står den redan exakt rätt: **rör den inte**.
5. Rutan **E-postbrödtext (HTML)** (Email body HTML): ersätt ALLT innehåll
   med filens innehåll.
6. **Innan du sparar:** kontrollera teckenantalet och att texten i kolumnen
   "Kontrollera" finns och att `TACKIGEN` INTE finns. Fel innehåll: gör om.
7. Klicka **Spara**.
8. **Kontrollera mot servern, inte mot redigeraren.** Läs mallens innehåll
   och `updatedAt` ur Shopifys egen mall-data och jämför med källfilen.
   Klicka aldrig "Ignorera" på raden "Osparade ändringar" utan att först ha
   läst vad servern har.

| # | Mall i Shopify | Ämnesrad | Kontrollera | Tecken | Mallens kod |
|---|---|---|---|---|---|
| 1 | **Orderbekräftelse** (Order confirmation) | `{% if customer.first_name != blank %}{{ customer.first_name }}, {% endif %}{{ name }} är mottagen – vi packar` | `KREDIT100` och `HÄMTA MIN RABATT` och `5–10 arbetsdagar` | **74 222** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/mejl/output/orderbekraftelse.liquid |
| 2 | **Leveransbekräftelse** (Shipping confirmation) | `Ditt paket är på väg` | `KREDIT100` och `Ditt paketnummer` och `Beräknad leverans` | **66 922** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/mejl/output/fraktbekraftelse.liquid |
| 3 | **Levererad** (Delivered) | `Paketet är levererat` | `KREDIT100` och `HÄMTA MIN RABATT` | **62 577** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/mejl/output/levererad.liquid |

⚠️ Rör inte Leveransuppdatering, Ute för leverans, Återbetalning eller Order
annullerad: de är oförändrade. Bredvid "Ute för leverans" ligger syskonet
"Order ute för lokal leverans", ta INTE det heller.

⚠️ **CaraShell, Beverbutikken, Bæverbutiken och Majavakauppa berörs INTE.**
Deras mallar hade aldrig hjulet.

Talen i kolumnen Tecken är tecken, inte byte. Shopifys redigerare räknar i
byte, alltså högre tal (varje å/ä/ö väger två byte).

### C. Testmejlet

Gå in på **Orderbekräftelse** och klicka **Skicka testmejl** (Send test
email) uppe till höger. Bara den mallen.

### Rapportera tillbaka

1. Vilka av de tre mallarna som sparades och verifierades mot servern.
2. Teckenantalet du såg per mall.
3. Om kontrolltexten saknades, eller om `TACKIGEN` fanns kvar, och i vilken mall.
4. Om testmejlet gick iväg, och till vilken adress Shopify sa att det gick.
5. Allt som såg konstigt ut, även småsaker.

Om Shopify vägrar spara (för stor mall, felmeddelande, snurrande knapp):
spara inte om, utan skriv exakt vad felmeddelandet sa.
