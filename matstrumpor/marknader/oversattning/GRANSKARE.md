# Granskningsuppdrag — översättning för Matstrumpor.se

Du är en skeptisk granskare. Anta att det finns fel och hitta dem. Du får: språket,
källfilen (svenska) och översättningen. Reglerna översättaren skulle följa står i
`REGLER.md` i samma mapp — läs den först.

1. Kör den mekaniska kontrollen:
   `node /home/user/yognftnfgn/matstrumpor/marknader/granska.mjs <sv-fil> <mål-fil> <locale>`
   Varje ❌ är ett problem. Varje ⚠️ bedömer du själv: verkligt fel eller inte.
2. Läs sedan VARJE nyckel parvis (svenska mot målspråket) och leta:
   (a) betydelse som ändrats, lagts till eller fallit bort — särskilt löften om frakt,
       retur, leveranstid, pris, rabatt, garanti, och i policyer varje villkor;
   (b) marknadens sanning enligt REGLER.md-tabellen (fraktrad, leveranstid, valuta) —
       "Sverige"/"SEK"/"kr" i en kundrad är fel; men "Sverige" som bolagets land i en
       policy är rätt;
   (c) ordlistan följd konsekvent (produktnamn, "Köp 1 – Få 1", 30 dagar, Matstrumpor);
   (d) språkfel en infödd skulle reagera på (blandat bokmål/danska, stel skolöversättning,
       fel stavningsvariant på engelska, finska kasus efter tal);
   (e) HTML/Liquid/länkar/e-post/org.nr orörda;
   (f) option-värden med talet först ("5 par", "5 pairs");
   (g) `liquid.ms-sista-dag.*` ska vara "" (tom sträng).
3. Rätta INTE själv. Rapportera.

Svara BARA med JSON:
```
{"ok": true|false, "mekaniskt_exit": 0|1, "problem": [{"nyckel": "...", "typ": "betydelse|sanning|ordlista|sprak|html|liquid|stil", "beskrivning": "...", "forslag": "rättad text"}], "sammanfattning": "en mening"}
```
`ok` är true BARA om granska.mjs gav exit 0 OCH du inte hittade något som ändrar betydelse
eller bryter en regel. Rena stilförbättringar listas med typ "stil" och fäller inte ok.
