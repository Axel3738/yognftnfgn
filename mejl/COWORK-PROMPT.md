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

Teckentalen nedan är från bygget 2026-09-20 (**v11: bävernumret
"Ditt paketnummer: BB-…" i klartext under knappen, och knappen bär samma
nummer** — fraktbolagets YT-nummer står inte längre någonstans i mejlet).
Levererad är oförändrad sedan v8 och orderbekräftelsen sedan v6; de står
inte i tabellen. Bygger du om mallarna, räkna om dem i TECKEN
(`python3 -c "print(len(open('mejl/output/fraktbekraftelse.liquid',encoding='utf-8').read()))"`),
inte byte — Cowork mätte 2026-09-18 att `wc -c` gav byte och stämde inte.

Historik: v4 inklistrad 2026-09-14, v6 (tre erbjudandemallar) 2026-09-18,
v8 (fyra fraktmallar) 2026-09-18 kväll, v9 (tre fraktmallar) 2026-09-18 sen
kväll, v10 (knappen till egna sidan) byggd 2026-09-19 men aldrig
inklistrad, v11 (bävernumret) väntar. Coworks metod som fungerar: hämta
filen direkt i Shopify-sidan, skriv in via kodrutans eget API, verifiera
mot serverns mall-data — inget urklipp, inga kortkommandon.

---

## Kopiera allt nedanför linjen till Cowork

Du jobbar i Chrome i min inloggade Shopify-admin för butiken
**Bäverbutiken.se**. Två uppgifter: **A.** byta ut koden i **tre
kundnotiser**, **B.** lägga in länken **Spåra paket** i butikens huvudmeny
och sidfotsmeny. Sedan **C.** ett testmejl. Rör ingenting annat i Shopify:
inga andra mallar, inga inställningar, inga rabatter, inga produkter, inga
andra menyrader.

En av mallarna är stor (~77 500 tecken). Det tar några sekunder att
klistra in. Vänta ut det. **Klistra aldrig in en halv mall** — går något
fel, stoppa och berätta vad som hände.

⚠️ **Datorn är en Mac. Använd Cmd, aldrig Ctrl.** Ctrl+A och Ctrl+C tolkas
som Shopifys egna kortkommandon och öppnar dialoger som "Lägg till
produktserie" och "Lägg till sida" (hände 2026-09-13). Öppnas en sådan
dialog: stäng den utan att spara, och skapa aldrig något.

⚠️ **Urklippet är inte att lita på.** Flera gånger har det innehållit något
annat än det som nyss kopierades (förra mallen, ett telefonnummer, en
anteckning från en annan app). **Kontrollera alltid vad du klistrat in INNAN
du sparar**: rätt längd (se tabellens teckenantal) och rätt innehåll.
Stämmer det inte: kopiera om, spara inte. Slutar tangentbordet nå fliken
med källfilen (Cmd+A markerar inget, hände 2026-09-18): hämta filen direkt
i Shopify-sidan i stället för via urklippet, och jämför det inklistrade mot
källfilen tecken för tecken före sparning. Det fungerade.

### A. De tre mallarna

**Börja med att kolla vad som redan sitter — per mall.** Öppna varje mall i
tabellen → Redigera kod. Saknar brödtexten texten `Ditt paketnummer`
är det en gammal version: klistra in enligt stegen. Finns
`Ditt paketnummer` redan är den nya versionen inne: hoppa över den
mallen. Är alla tre redan klara: gå direkt till **B**.

Gör så här för en mall i taget, uppifrån och ner i tabellen:

1. Öppna mallens kodlänk i en **ny flik**. Det är en ren textfil. Klicka i
   texten, tryck **Cmd+A**, sedan **Cmd+C**.
2. Gå tillbaka till Shopify-admin → **Inställningar** → **Notiser** →
   **Kundaviseringar** → klicka på mallens namn.
3. Klicka **Redigera kod** (Edit code).
4. Fältet **E-postämne** (Email subject): jämför med ämnesraden i tabellen,
   tecken för tecken. Står den redan exakt rätt: **rör den inte**. Skiljer
   den sig: markera allt, ta bort, klistra in tabellens rad.
5. Rutan **E-postbrödtext (HTML)** (Email body HTML): klicka i rutan, tryck
   **Cmd+A**, tryck **Delete**, tryck **Cmd+V**.
6. **Innan du sparar:** kontrollera att det inklistrade är rätt mall — rätt
   teckenantal och att textbiten i kolumnen "Kontrollera" finns.
   Fel innehåll: kopiera om från fliken och klistra in igen.
7. Klicka **Spara**.
8. **Kontrollera mot servern, inte mot redigeraren.** Shopify sparar
   osparade utkast i webbläsaren och lägger tillbaka dem efter F5, så
   redigeraren kan visa den nya koden fast servern har den gamla (hände
   2026-09-18 på Levererad). Läs därför mallens innehåll och `updatedAt`
   ur Shopifys egen mall-data för sidan (samma väg som du hämtar filen)
   och jämför med källfilen. Stämmer det inte: säg till, klistra inte om
   i blindo. Klicka aldrig "Ignorera" på raden "Osparade ändringar" utan
   att först ha läst vad servern har — Ignorera kastade 2026-09-18 tillbaka
   redigeraren till den gamla versionen.

| # | Mall i Shopify | Ämnesrad | Kontrollera | Tecken | Mallens kod |
|---|---|---|---|---|---|
| 1 | **Leveransbekräftelse** (Shipping confirmation) | `Ditt paket är på väg` | `Ditt paketnummer` och `sha256` och `Beräknad leverans` | **77 552** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/mejl/output/fraktbekraftelse.liquid |
| 2 | **Leveransuppdatering** (Shipping update) | `Ny info om ditt paket` | `Ditt paketnummer` och `sha256` | **6 245** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/mejl/output/fraktuppdatering.liquid |
| 3 | **Ute för leverans** (Out for delivery) | `Paketet kommer idag` | `Ditt paketnummer` och `sha256` | **6 234** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/mejl/output/ute_for_leverans.liquid |

⚠️ Bredvid "Ute för leverans" ligger syskonet "Order ute för lokal
leverans" — ta INTE det. Rör inte heller "Levererad": den är redan rätt.

Talen i kolumnen Tecken är tecken, inte byte. Shopifys redigerare räknar i
byte, alltså högre tal — varje å/ä/ö väger två byte. Skiljer det mycket mer
än så är det fel innehåll i urklippet. (Vid v9-inklistringen 2026-09-18
sparade Shopify hela filen inklusive den avslutande radbrytningen, så
serverns teckenantal stämde exakt med tabellen.)

Logga och accentfärg under **Anpassa e-postmallar** är redan gjorda
(2026-09-13) — rör dem inte.

### B. Menylänken "Spåra paket"

Butiken har en egen spårningssida: **Spåra ditt paket**, adress
`/pages/spara` (hela adressen https://baverbutiken.se/pages/spara). Den ska
gå att hitta från menyn.

1. Gå till **Onlinebutik** (Online Store) → **Navigering** (Navigation).
2. Öppna menyn **Huvudmeny** (Main menu).
3. Titta först: finns det redan en rad som länkar till `/pages/spara`?
   Då är den klar — rör den inte, gå till sidfoten.
4. Klicka **Lägg till menyalternativ** (Add menu item).
5. **Namn:** `Spåra paket` (exakt så, versalt S, inget mer).
6. **Länk:** skriv `/pages/spara` i länkfältet — eller välj **Sidor** och
   sidan **Spåra ditt paket**, det ger samma adress. Kontrollera att raden
   visar `/pages/spara`.
7. Klicka **Lägg till**, sedan **Spara menyn** uppe till höger.
8. Gör samma sak (steg 3–7) i menyn **Sidfotsmeny** (Footer menu). Heter
   sidfotsmenyn något annat (t.ex. "Snabblänkar" / "Quick links"): ta den
   meny som butikens sidfot faktiskt visar — öppna baverbutiken.se i en
   flik och jämför raderna.
9. Lägg raden **sist** i båda menyerna. Flytta inga andra rader.
10. Kontrollera i kundens vy: öppna https://baverbutiken.se i en ny flik,
    ladda om, och se att **Spåra paket** syns i huvudmenyn och i sidfoten
    och att klicket landar på sidan med rubriken "Spåra ditt paket".

Skapa aldrig en ny meny, ta aldrig bort en rad, ändra inga andra namn.

### C. Testmejlet

Gå in på **Leveransbekräftelse** och klicka **Skicka testmejl** (Send test
email) uppe till höger på förhandsgranskningssidan. Bara den mallen.

### Rapportera tillbaka

1. Vilka av de tre mallarna som sparades och verifierades mot servern.
2. Tecknantalet du såg per mall.
3. Om kontrolltexten saknades, och i vilken mall.
4. Menyerna: vilka två menyer som fick raden, och vad du såg i kundens vy.
5. Om testmejlet gick iväg, och till vilken adress Shopify sa att det gick.
6. Allt som såg konstigt ut, även småsaker.

Om Shopify vägrar spara (för stor mall, felmeddelande, snurrande knapp):
spara inte om, utan skriv exakt vad felmeddelandet sa.
