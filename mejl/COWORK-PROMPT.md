# Prompten till Cowork: klistra in mejlmallarna i Shopify

Shopify har inget API för notismallarna, så inklistringen är alltid klick i
admin. Cowork (Claude i Chrome) gör dem i Axels inloggade flik.

⚠️ **Cowork kan inte klicka inuti Artifact-sidans ram** (sandlådad iframe,
mätt 2026-09-12) — kopiera-knapparna på `/mejl`-sidan är därför oåtkomliga
för den. Lösningen är råfilerna på GitHub: repot är publikt (mätt
2026-09-13), så `raw.githubusercontent.com`-länkarna öppnas som ren text i
en flik och går att markera med Ctrl+A.

**Länkarna pekar på en gren.** Byt `claude/fervent-bardeen-pzyuql` mot
`main` när grenen mergats, annars klistrar Cowork in en gammal version.
Tecknantalen nedan är från bygget 2026-09-13 (v3) — bygger du om mallarna,
kör `node -e` på filerna och uppdatera dem, annars stämmer inte kontrollen.

---

## Kopiera allt nedanför linjen till Cowork

Du jobbar i Chrome i min inloggade Shopify-admin för butiken
**Bäverbutiken.se**. Uppgiften är att byta ut koden i **tre kundnotiser**.
Rör ingenting annat i Shopify: inga andra mallar, inga inställningar, inga
rabatter, inga produkter.

Mallarna är stora (~80 000 tecken). Det tar några sekunder att klistra in.
Vänta ut det. **Klistra aldrig in en halv mall** — går något fel, stoppa och
berätta vad som hände.

⚠️ **Datorn är en Mac. Använd Cmd, aldrig Ctrl.** Ctrl+A och Ctrl+C tolkas
som Shopifys egna kortkommandon och öppnar dialoger som "Lägg till
produktserie" och "Lägg till sida" (hände 2026-09-13). Öppnas en sådan
dialog: stäng den utan att spara, och skapa aldrig något.

⚠️ **Urklippet är inte att lita på.** Två gånger 2026-09-13 innehöll det
något annat än det som nyss kopierades (förra mallen, och en gång ett
telefonnummer från en annan app). **Kontrollera alltid vad du klistrat in
INNAN du sparar**: rätt längd (se tabellens teckenantal) och rätt innehåll.
Stämmer det inte: kopiera om, spara inte.

Gör så här för en mall i taget, uppifrån och ner i tabellen:

1. Öppna mallens kodlänk i en **ny flik**. Det är en ren textfil. Klicka i
   texten, tryck **Cmd+A**, sedan **Cmd+C**.
2. Gå tillbaka till Shopify-admin → **Inställningar** → **Notiser** →
   **Kundnotiser** → klicka på mallens namn.
3. Klicka **Redigera kod** (Edit code).
4. Fältet **E-postämne** (Email subject): jämför med ämnesraden i tabellen,
   tecken för tecken. Står den redan exakt rätt: **rör den inte**. Skiljer
   den sig: markera allt, ta bort, klistra in tabellens rad, inklusive
   `{% %}`-taggarna.
5. Rutan **E-postbrödtext (HTML)** (Email body HTML): klicka i rutan, tryck
   **Cmd+A**, tryck **Delete**, tryck **Cmd+V**.
6. **Innan du sparar:** kontrollera att det inklistrade är rätt mall — rätt
   teckenantal och att de fyra textbitarna i kolumnen "Kontrollera" finns.
   Fel innehåll: kopiera om från fliken och klistra in igen.
7. Klicka **Spara**.
8. **Ladda om sidan** (F5), öppna Redigera kod igen och kontrollera de fyra
   textbitarna en gång till. Saknas någon: säg till, klistra inte om i
   blindo.

| # | Mall i Shopify | Ämnesrad | Mallens kod |
|---|---|---|---|
| 1 | **Orderbekräftelse** (Order confirmation) | `{% if customer.first_name != blank %}{{ customer.first_name }}, {% endif %}{{ name }} är mottagen – vi packar` | https://raw.githubusercontent.com/Axel3738/yognftnfgn/claude/fervent-bardeen-pzyuql/mejl/output/orderbekraftelse.liquid |
| 2 | **Leveransbekräftelse** (Shipping confirmation) | `Ditt paket är på väg` | https://raw.githubusercontent.com/Axel3738/yognftnfgn/claude/fervent-bardeen-pzyuql/mejl/output/fraktbekraftelse.liquid |
| 3 | **Levererad** (Delivered) | `Paketet är levererat` | https://raw.githubusercontent.com/Axel3738/yognftnfgn/claude/fervent-bardeen-pzyuql/mejl/output/levererad.liquid |

**Kontrollera** (samma fyra i alla tre mallarna, efter omladdning):

- `Din gåva: välj 1 av 4`
- `Passar ihop med det du köpte`
- `Beställ före kl`
- `plus: 604800`

Antal tecken efter inklistring, som extra kontroll: Orderbekräftelse
**85 597**, Leveransbekräftelse **78 809**, Levererad **78 013**. Shopifys
redigerare visar **ett tecken mindre** än källan (filens avslutande
radbrytning följer inte med) — det är rätt. Skiljer det mer än så är det
fel innehåll i urklippet.

**När alla tre är klara:** gå in på **Orderbekräftelse** och klicka
**Skicka testmejl** (Send test email) uppe till höger på
förhandsgranskningssidan. Bara den mallen.

**Rapportera tillbaka:**

1. Vilka av de tre som sparades och verifierades efter omladdning.
2. Tecknantalet du såg per mall.
3. Om någon av de fyra textbitarna saknades, och i vilken mall.
4. Om testmejlet gick iväg, och till vilken adress Shopify sa att det gick.
5. Allt som såg konstigt ut, även småsaker.

Om Shopify vägrar spara (för stor mall, felmeddelande, snurrande knapp):
spara inte om, utan skriv exakt vad felmeddelandet sa.
