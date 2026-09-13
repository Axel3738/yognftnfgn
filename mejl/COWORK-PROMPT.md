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

Gör så här för en mall i taget, uppifrån och ner i tabellen:

1. Öppna mallens kodlänk i en **ny flik**. Det är en ren textfil. Klicka i
   texten, tryck **Ctrl+A**, sedan **Ctrl+C**.
2. Gå tillbaka till Shopify-admin → **Inställningar** → **Notiser** →
   **Kundnotiser** → klicka på mallens namn.
3. Klicka **Redigera kod** (Edit code).
4. Fältet **E-postämne** (Email subject): markera allt, ta bort, klistra in
   ämnesraden från tabellen. Den ska stå exakt som i tabellen, inklusive
   `{% %}`-taggarna.
5. Rutan **E-postbrödtext (HTML)** (Email body HTML): klicka i rutan, tryck
   **Ctrl+A**, tryck **Delete**, tryck **Ctrl+V**.
6. Klicka **Spara**.
7. **Ladda om sidan** (F5), öppna Redigera kod igen och kontrollera att
   brödtexten innehåller alla fyra textbitarna i kolumnen "Kontrollera". Gör
   den inte det: säg till, klistra inte om i blindo.

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

Ungefärligt antal tecken efter inklistring, som extra kontroll:
Orderbekräftelse **85 597**, Leveransbekräftelse **78 809**, Levererad
**78 013**. Ligger du inom ett par hundra tecken är det rätt.

**När alla tre är klara:** gå in på **Orderbekräftelse** och klicka
**Skicka testmejl** (Send test email) uppe till höger. Bara den mallen.

**Rapportera tillbaka:**

1. Vilka av de tre som sparades och verifierades efter omladdning.
2. Tecknantalet du såg per mall.
3. Om någon av de fyra textbitarna saknades, och i vilken mall.
4. Om testmejlet gick iväg, och till vilken adress Shopify sa att det gick.
5. Allt som såg konstigt ut, även småsaker.

Om Shopify vägrar spara (för stor mall, felmeddelande, snurrande knapp):
spara inte om, utan skriv exakt vad felmeddelandet sa.
