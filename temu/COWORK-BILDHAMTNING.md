# Cowork-jobbet: hämta Temu-galleribilder automatiskt

Molnsessionen (Claude Code på webben) kan inte nå Temu — men **Cowork på Axels
dator kan**, via Chrome-tillägget som styr hans inloggade webbläsare. Det här
dokumentet innehåller prompten Axel klistrar in i Cowork. Byt bara ut
produktlistan för nya batchar.

**Krav på datorn:** Claude-appen (Cowork) + Chrome-tillägget "Claude in Chrome"
aktiverat + Google Drive-connectorn kopplad i Claude.

---

## Prompten (klistra in i Cowork, allt på en gång)

```
Använd Chrome-tillägget. För varje Temu-länk i listan nedan:

1. Öppna länken i Chrome.
2. Klicka igenom ALLA miniatyrbilder i produktgalleriet till vänster och spara
   varje bild i full upplösning (högerklick → spara bild, eller ladda ner).
   Ta även bilderna inne i produktbeskrivningen om de visar mått,
   specifikationer eller produkten i användning.
3. Ladda upp bilderna till Google Drive-mappen
   "Bäverbutiken – Temu-bilder" → undermappen som står vid produkten.
   Kan du inte nå Drive: spara i en mapp på skrivbordet med samma namn
   och säg till mig.
4. Säg till när alla produkter är klara och hur många bilder det blev per mapp.

Produkterna:

• batmotorskydd – 605748427852371
  https://www.temu.com/se/g-605748427852371.html

• mc-kapell – 601102992953649
  https://www.temu.com/se/g-601102992953649.html

• dorrlist – 601099515911841
  https://www.temu.com/se/g-601099515911841.html

• kranskydd – 601101411598143
  https://www.temu.com/se/g-601101411598143.html

• plyschtofflor – 601102047663138
  https://www.temu.com/se/g-601102047663138.html

• herrtofflor (väntar offert) – 601101251777925
  https://www.temu.com/se/g-601101251777925.html
```

*(Kortlänkarna `g-<id>.html` fungerar i en riktig inloggad webbläsare — det är
bara serveranrop utan inloggning som får tomma skal.)*

---

## Efteråt

Axel skriver **"kör"** i molnsessionen → den hämtar bilderna ur Drive-mappen
själv (`search_files` på undermappens id → `download_file_content`), översätter
texten på bilderna till marknadens språk med sharp-metoden och bygger
galleri + beskrivningar.

Drive-mappen: `1k43w1Z24CyVxxIGWWkI0l0qpjLwrpsur` — undermappar per produkt,
döpta `<namn> – <goods-id>`. Ny produkt = ny undermapp (skapas av molnsessionen).
