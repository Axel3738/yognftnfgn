# /produkt – Hitta, poängsätt och offertera nya produkter till Bäverbutiken

Argument: `$ARGUMENTS`. Första ordet avgör läget:

| Skriv | Läge | Vad som händer |
|---|---|---|
| `/produkt jaga fiske` | **Jakt** | Sveper en nisch på Temu och lämnar en rangordnad lista att godkänna |
| `/produkt Fiskeklämma i stål` (eller en Temu-länk) | **Bedöm** | Full research + poäng på EN produkt |
| `/produkt lista` | **Läge** | Pipelinen, rangordnad |
| `/produkt sheet` | **Offert** | Bygger leverantörens quote-sheet av de godkända |

**Grundregeln, och den viktigaste:** *Claude poängsätter och rangordnar. Axel godkänner.*
Skriv aldrig ut ett eget slutgiltigt ja eller nej — leverera listan och be om hans dom.
Gränsen för "för känt" sitter i hans huvud, inte i en tabell.

Kriterierna står i **`docs/os/PRODUKTKRITERIER.md`** — läs den först, varje gång.
Fyller steget "Välj nästa produkt" i `docs/os/SOP-06-produkttest.md`.
Ad account: **MagiBorsten `1867947880635861`**. Gäller aldrig Grillkliniken.

---

## Före allting: läs av smaken

```bash
node pipeline/kandidater.mjs smak
```

Finns tre domar eller fler visar den vilken axel som faktiskt skiljer Axels ja från
hans nej, godkännandegraden per nisch, och hans egna ord om varje produkt.
**Läs hans formuleringar och låt dem styra urvalet** — det är så systemet blir bättre
över tid. Är listan tom: hoppa över, men kör den nästa gång.

---

## Läge JAKT — `/produkt jaga <nisch>`

1. **Dedup:** `node pipeline/kandidater.mjs` — vad är redan bedömt i nischen?
2. **Dödzonskollen:** har Biltema eller Jula en egen hyllsektion för det här? Är svaret
   ja blir kändheten 0–1 på nästan allt du hittar. Byt nisch, eller leta efter det som
   ligger *bredvid* hyllan. Se "Dödzonen" i kriterierna.
3. **Bygg söktermerna.** 10–15 stycken, **på engelska** (Temus sök är engelsk), och
   **problemformulerade** — `fishing tool` ger brus, `fish lip gripper` och
   `hook remover` ger produkter. Härled dem ur nischens moment: vad gör mannen, i
   vilken ordning, var gör det ont?
4. **Svep Temu med `WebFetch` på `https://www.temu.com/search_result.html?search_key=<term>`**
   — **utan `/se/`** (den varianten renderar inte). **Be uttryckligen om href/URL i
   prompten**, annars kommer bara namnen: *"give the name AND the full product URL
   (the -g-<number>.html path)"*. Det är den **enda** källan till levande produktlänkar.

   ☠️ **Använd ALDRIG `site:temu.com` för att hämta länkar.** Sökmotorns index är
   gammalt och länkarna leder till avpublicerade listningar — det brände en hel
   leverans 2026-08-26. Se "Länkfällan" i kriterierna. Till *research* om vad som
   finns går webbsökning bra; till *länkar i ett sheet* aldrig.

   **Budget: ~9 anrop.** Sedan svarar Temu bara med sidtiteln "Temu" — det är
   strypning, inte noll träffar. Planera för 8–9 verifierade produkter per session.
5. **Grovsålla** — bort med storleksval, rent dekorativt och flerpacksbrus.
6. **Kändhetskolla de överlevande** — `WebSearch` på `pricerunner <svensk term>`,
   antalet står i träffens titel. En sökning per kandidat räcker i jaktläget.
7. **Leverera den rangordnade listan:**

   | # | Produkt | Nisch | Vad den löser | 3-sek-bilden | Wow | Kändhet | Poäng |
   |---|---|---|---|---|---|---|---|

   "3-sek-bilden" ska vara en **konkret bildruta**, inte en egenskap. Kan du inte skriva
   bildrutan är produkten inte klar för listan. Sätt `wow` till `–` om du inte sett
   produktbilden — gissa aldrig.
8. **Skriv in dem** i `products/kandidater.json`.
9. **Avsluta med att be om domen** — vilka är ja, vilka är nej? Påminn om att skälet
   behövs, det är det systemet lär sig av.

⚠️ **Temu-priserna som kommer ut är opålitliga** (extraheringen blandar ihop rader).
Redovisa dem aldrig som fakta.

---

## Läge BEDÖM — `/produkt <namn eller Temu-länk>`

1. **Dedup:** `node pipeline/kandidater.mjs sok <term>`. Redan bedömd → visa den gamla
   bedömningen och fråga vad som är nytt.
2. **De två hårda stoppen** (S1 frakt/regler, S2 marginal) — **var och en med källa**.
   Faller ett stopp: skriv det rakt ut, men lägg ändå in produkten i loggen.
3. **Poängsätt de sex axlarna.** Kändheten tas fram i ordningen PriceRunner →
   Clas Ohlson/Kjell/XXL → WebSearch för de blockerade kedjorna. **Motivera varje axel**
   i `motivering`-fältet — det är motiveringen Axel läser när han dömer.
4. **Marginalräkning:** landed cost → föreslaget pris → break-even-ROAS
   (`1 / (1 − landed cost / pris)`), jämför mot 1,34–2,00 i `products.json`.
   **Fråga om momsläget innan du drar av 25 %.**
5. **Leverera kortet:**

   ```
   PRODUKT:  <namn>
   STOPP:    S1 ✅/⛔ <källa> · S2 ✅/⛔ <källa>
   POÄNG:    wow ×2 _ | kändhet ×2 _ | problem _ | demo _ | mansprodukt _ | marginal _  →  _/40
   KÄNDHET:  <var den finns, med länkar>
   3-SEK:    <bildrutan>
   ```
   Avsluta med **"ja eller nej?"** — inte med en egen dom.
6. **Logga** i `products/kandidater.json`, committa och pusha.

---

## Läge LISTA — `/produkt lista`

`node pipeline/kandidater.mjs`. Lyft det som väntar på hans ja/nej.

---

## Läge OFFERT — `/produkt sheet`

Bygger leverantörens quote-sheet med **exakt** Axels mallstruktur:

```bash
pip install openpyxl
python3 pipeline/quote-sheet.py produkter.json ut.xlsx
```

`produkter.json` är en lista med `{namn, temu_lank, bild, butikslank, leverantor_ref}`.
Bara `temu_lank` krävs. **Produktbilder går inte att hämta från Temu på någon testad
väg** — lämna `bild` tom och skriv produktnamnet i `namn`, så fylls kolumn A med namnet
i stället för en bild.

**Länkarna i kolumn M, i prioritetsordning:**
1. Direktlänk från en live-sökning, med `/se/` framför sökvägen — verifierat levande.
2. Räcker inte anropsbudgeten: **svensk söklänk**
   `https://www.temu.com/se/search_result.html?search_key=<svensk term>`. Den går
   aldrig sönder och visar alltid svenskt lager.

**Skriv alltid ut i leveransen vilka rader som är verifierade och vilka som är
söklänkar.** Låtsas aldrig att en obekräftad länk är verifierad.
Ta med **de godkända** kandidaterna, inte hela listan. Skicka filen i chatten.

---

## DEFINITION OF DONE

- [ ] `docs/os/PRODUKTKRITERIER.md` läst i den här sessionen
- [ ] `kandidater.mjs smak` körd före listan (om det finns ≥3 domar)
- [ ] Dedup körd innan något nytt bedömdes
- [ ] JAKT: dödzonskollen gjord före svepet
- [ ] JAKT: rangordnad lista, var och en med konkret 3-sekundersbildruta
- [ ] Kändheten belagd med källa — PriceRunner-antal eller butikslänk
- [ ] Stoppdomar har källa; wow lämnad tom om produktbilden inte setts
- [ ] Break-even-ROAS uträknad, momsläget frågat och inte gissat
- [ ] Temu-priser inte redovisade som fakta
- [ ] **Levererat som en lista att godkänna — ingen egen slutgiltig dom**
- [ ] Allt loggat i `kandidater.json`, även nekade, med Axels skäl
- [ ] Pushad
