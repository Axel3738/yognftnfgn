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
Tecknantalen nedan är från bygget 2026-09-18 kväll (**v7: knappen "Spåra
paketet" går till Shopifys orderstatussida i stället för 17track**). De tre
erbjudandemallarna fick v6 samma dag; Orderbekräftelse och Levererad är
oförändrade sedan dess och står därför inte i tabellen. Bygger du om
mallarna, räkna om dem i TECKEN
(`python3 -c "print(len(open('mejl/output/fraktbekraftelse.liquid',encoding='utf-8').read()))"`),
inte byte — Cowork mätte 2026-09-18 att `wc -c` gav byte och stämde inte.

Historik: v4 inklistrad 2026-09-14, v6 (tre erbjudandemallar) 2026-09-18.

---

## Kopiera allt nedanför linjen till Cowork

Du jobbar i Chrome i min inloggade Shopify-admin för butiken
**Bäverbutiken.se**. Uppgiften är att byta ut koden i **tre kundnotiser**.
Rör ingenting annat i Shopify: inga andra mallar, inga inställningar, inga
rabatter, inga produkter.

En av mallarna är stor (~80 000 tecken). Det tar några sekunder att klistra
in. Vänta ut det. **Klistra aldrig in en halv mall** — går något fel, stoppa
och berätta vad som hände.

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
tabellen → Redigera kod. Innehåller brödtexten redan exakt texten
`href="{{ order_status_url }}"` är den nya versionen inklistrad sedan
tidigare: hoppa över den mallen. Saknas den (den gamla versionen har
`fulfillment.tracking_url | default: order_status_url` i stället): klistra
in enligt stegen. Är alla tre redan klara: gå direkt till **B** längre ner.

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
   teckenantal och att de tre textbitarna i kolumnen "Kontrollera" finns.
   Fel innehåll: kopiera om från fliken och klistra in igen.
7. Klicka **Spara**.
8. **Ladda om sidan** (F5), öppna Redigera kod igen och kontrollera de tre
   textbitarna en gång till. Saknas någon: säg till, klistra inte om i
   blindo.

| # | Mall i Shopify | Ämnesrad | Mallens kod |
|---|---|---|---|
| 1 | **Leveransbekräftelse** (Shipping confirmation) | `Ditt paket är på väg` | https://raw.githubusercontent.com/Axel3738/yognftnfgn/claude/fervent-bardeen-pzyuql/mejl/output/fraktbekraftelse.liquid |
| 2 | **Leveransuppdatering** (Shipping update) | `Ny info om ditt paket` | https://raw.githubusercontent.com/Axel3738/yognftnfgn/claude/fervent-bardeen-pzyuql/mejl/output/fraktuppdatering.liquid |
| 3 | **Ute för leverans** (Out for delivery) | `Paketet kommer idag` | https://raw.githubusercontent.com/Axel3738/yognftnfgn/claude/fervent-bardeen-pzyuql/mejl/output/ute_for_leverans.liquid |

⚠️ Bredvid "Ute för leverans" ligger syskonet "Order ute för lokal
leverans" — ta INTE det.

**Kontrollera** (samma tre i alla mallarna, efter omladdning):

- `href="{{ order_status_url }}"`
- `Spårningsnummer`
- `kundsupport@baverbutiken.se`

Antal tecken efter inklistring, som extra kontroll: Leveransbekräftelse
**78 712**, Leveransuppdatering **6 105**, Ute för leverans **6 094**. Det
är tecken, inte byte. Shopifys redigerare räknar i byte och visar då
79 813 / 6 119 / 6 103 — **ett mindre** än källfilens byte (avslutande
radbrytningen följer inte med). Båda talen är rätt. Skiljer det mer än så är
det fel innehåll i urklippet.

Logga och accentfärg under **Anpassa e-postmallar** är redan gjorda
(2026-09-13) — rör dem inte.

**När alla tre är klara**, gör en sak till:

**B. Testmejlet.** Gå in på **Leveransbekräftelse** och klicka **Skicka
testmejl** (Send test email) uppe till höger på förhandsgranskningssidan.
Bara den mallen.

**Rapportera tillbaka:**

1. Vilka av de tre som sparades och verifierades efter omladdning.
2. Tecknantalet du såg per mall.
3. Om någon av de tre textbitarna saknades, och i vilken mall.
4. Om testmejlet gick iväg, och till vilken adress Shopify sa att det gick.
5. Allt som såg konstigt ut, även småsaker.

Om Shopify vägrar spara (för stor mall, felmeddelande, snurrande knapp):
spara inte om, utan skriv exakt vad felmeddelandet sa.
