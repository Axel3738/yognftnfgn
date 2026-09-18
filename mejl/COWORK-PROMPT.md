# Prompten till Cowork: klistra in mejlmallarna i Shopify

Shopify har inget API för notismallarna, så inklistringen är alltid klick i
admin. Cowork (Claude i Chrome) gör dem i Axels inloggade flik.

⚠️ **Cowork kan inte klicka inuti Artifact-sidans ram** (sandlådad iframe,
mätt 2026-09-12) — kopiera-knapparna på `/mejl`-sidan är därför oåtkomliga
för den. Lösningen är råfilerna på GitHub: repot är publikt (mätt
2026-09-13), så `raw.githubusercontent.com`-länkarna öppnas som ren text i
en flik.

**Länkarna pekar på en gren.** Byt `claude/fervent-bardeen-pzyuql` mot
`main` när grenen mergats, annars klistrar Cowork in en gammal version.
Tecknantalen nedan är från bygget 2026-09-18 kväll (**v8: "Spåra paketet"
går till Shopifys orderstatussida, fraktbolagets namn borta ur alla mejl,
samma-paket-raden bara i orderbekräftelsen, levererat-mejlets sju dagar
räknas från leveransdagen**). Orderbekräftelsen är oförändrad sedan v6 och
står inte i tabellen. Bygger du om mallarna, räkna om dem i TECKEN
(`python3 -c "print(len(open('mejl/output/fraktbekraftelse.liquid',encoding='utf-8').read()))"`),
inte byte — Cowork mätte 2026-09-18 att `wc -c` gav byte och stämde inte.

Historik: v4 inklistrad 2026-09-14, v6 (tre erbjudandemallar) 2026-09-18, v8 (fyra fraktmallar) 2026-09-18 kväll. Coworks metod som fungerar: hämta filen direkt i Shopify-sidan, skriv in via kodrutans eget API, verifiera mot serverns mall-data — inget urklipp, inga kortkommandon.

---

## Kopiera allt nedanför linjen till Cowork

Du jobbar i Chrome i min inloggade Shopify-admin för butiken
**Bäverbutiken.se**. Uppgiften är att byta ut koden i **fyra kundnotiser**.
Rör ingenting annat i Shopify: inga andra mallar, inga inställningar, inga
rabatter, inga produkter.

Två av mallarna är stora (~75 000 tecken). Det tar några sekunder att
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

**Börja med att kolla vad som redan sitter — per mall.** Öppna varje mall i
tabellen → Redigera kod. Innehåller brödtexten texten `tracking_company`
är det den gamla versionen: klistra in enligt stegen. Saknas
`tracking_company` helt är den nya versionen redan inne: hoppa över den
mallen. Är alla fyra redan klara: gå direkt till **B** längre ner.

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
   teckenantal, att textbiten i kolumnen "Kontrollera" finns, och att
   `tracking_company` INTE finns någonstans.
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
| 1 | **Leveransbekräftelse** (Shipping confirmation) | `Ditt paket är på väg` | `href="{{ order_status_url }}"` och `Beräknad leverans` | **77 282** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/claude/fervent-bardeen-pzyuql/mejl/output/fraktbekraftelse.liquid |
| 2 | **Leveransuppdatering** (Shipping update) | `Ny info om ditt paket` | `href="{{ order_status_url }}"` | **5 955** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/claude/fervent-bardeen-pzyuql/mejl/output/fraktuppdatering.liquid |
| 3 | **Ute för leverans** (Out for delivery) | `Paketet kommer idag` | `href="{{ order_status_url }}"` | **5 944** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/claude/fervent-bardeen-pzyuql/mejl/output/ute_for_leverans.liquid |
| 4 | **Levererad** (Delivered) | `Paketet är levererat` | `har levererats.` och `utm_source=mejl` | **73 128** | https://raw.githubusercontent.com/Axel3738/yognftnfgn/claude/fervent-bardeen-pzyuql/mejl/output/levererad.liquid |

⚠️ Bredvid "Ute för leverans" och "Levererad" ligger syskonen "Order ute
för lokal leverans" och "Order lokalt levererad" — ta INTE dem.

Talen i kolumnen Tecken är tecken, inte byte. Shopifys redigerare räknar i
byte och visar då 78 379 / 5 969 / 5 953 / 74 200 — **ett mindre** än
källfilens byte (avslutande radbrytningen följer inte med). Båda talen är
rätt. Skiljer det mer än så är det fel innehåll i urklippet.

Logga och accentfärg under **Anpassa e-postmallar** är redan gjorda
(2026-09-13) — rör dem inte.

**När alla fyra är klara**, gör en sak till:

**B. Testmejlet.** Gå in på **Levererad** och klicka **Skicka testmejl**
(Send test email) uppe till höger på förhandsgranskningssidan. Bara den
mallen.

**Rapportera tillbaka:**

1. Vilka av de fyra som sparades och verifierades efter omladdning.
2. Tecknantalet du såg per mall.
3. Om kontrolltexten saknades, eller `tracking_company` fanns kvar, och i
   vilken mall.
4. Om testmejlet gick iväg, och till vilken adress Shopify sa att det gick.
5. Allt som såg konstigt ut, även småsaker.

Om Shopify vägrar spara (för stor mall, felmeddelande, snurrande knapp):
spara inte om, utan skriv exakt vad felmeddelandet sa.
