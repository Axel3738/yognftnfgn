# /produkt – Hitta och döm av nya produkter till Bäverbutiken

Argument: `$ARGUMENTS`. Tre lägen, avgörs av första ordet:

| Skriv | Läge | Vad som händer |
|---|---|---|
| `/produkt jaga fiske` | **Jakt** | Sveper en nisch på Temu och lämnar 8–12 kandidater, grovsållade |
| `/produkt Fiskeklämma i stål` (eller en Temu-länk) | **Dom** | Kör alla sex grindar + poäng på EN produkt |
| `/produkt lista` | **Läge** | Visar pipelinen ur `products/kandidater.json` |

Kriterierna står i **`docs/os/PRODUKTKRITERIER.md`** — läs den först, varje gång.
Fyller steget "Välj nästa produkt" i `docs/os/SOP-06-produkttest.md`.
Ad account: **MagiBorsten `1867947880635861`**. Gäller aldrig Grillkliniken.

---

## Läge JAKT — `/produkt jaga <nisch>`

1. **Kolla minnet först:** `node pipeline/kandidater.mjs` — vad är redan dömt i den
   nischen? Avfärdade produkter tas aldrig upp igen utan ny information.
2. **Bygg söktermerna.** 10–15 stycken, **på engelska** (Temus sök är engelsk), och de
   ska vara *problemformulerade*, inte kategoriformulerade. `fishing tool` ger brus;
   `fish lip gripper`, `hook remover`, `line cutter retractor` ger produkter.
   Härled dem ur nischens moment: vad gör mannen, i vilken ordning, var gör det ont?
3. **Svep Temu:** `WebFetch` på `https://www.temu.com/search_result.html?search_key=<term>`
   — **utan `/se/`**, den varianten returnerar bara sidtiteln. Ett anrop per term.
4. **Grovsålla direkt** — släng allt som är: kökspryl, kläder/storleksval, rent
   dekorativt, flerpacksbrus, eller uppenbart bredhandel (G1). Kvar ska 8–12 stå.
5. **Leverera tabellen** — och den är hela leveransen:

   | # | Produkt | Nisch | Vad den löser | 3-sek-bilden | G1-risk | Temu-sökterm |
   |---|---|---|---|---|---|---|

   "3-sek-bilden" ska vara en **konkret bildruta**, inte en egenskap. Kan du inte
   skriva bildrutan är produkten inte klar för listan.
6. **Skriv in dem** i `products/kandidater.json` med status `ny` — inga poäng ännu.
7. **Avsluta med frågan:** vilka av dessa ska jag köra full dom på? Sätt aldrig en
   wow-poäng på en produkt vars bild ingen har sett.

⚠️ **Priserna Temu-svepet returnerar är opålitliga** (extraheringen blandar ihop rader).
Skriv aldrig ut dem som fakta — Axel läser av priset själv.

---

## Läge DOM — `/produkt <namn eller Temu-länk>`

1. **Dedup:** `node pipeline/kandidater.mjs sok <term>`. Redan dömd → visa den gamla
   domen och fråga vad som är nytt, i stället för att döma om.
2. **Kör de sex grindarna i ordning** ur `docs/os/PRODUKTKRITERIER.md`. Stanna vid
   första fallna grinden — resten behöver inte utredas.
   - **G1 ICA Maxi:** `WebSearch` på svenska + direktsök hos Clas Ohlson, Kjell, XXL
     (de går att hämta; Biltema/Jula/Rusta/Bauhaus/Amazon.se blockerar → täck med
     WebSearch). Skilj på nivå A (bredhandel = fällande) och nivå B (specialistbutik
     = varning). **Skriv ut vilken målgrupp domen gäller.**
   - **G2 Mättnad:** sök svenska dropshippingbutiker + engelsk mättnad.
   - **G3–G6:** bedöm och motivera.
   - **Varje grinddom ska ha en källa** — URL eller sökträff. Ingen källa, ingen dom.
3. **Poängsätt** bara om alla sex grindar höll. Wow väger dubbelt och **wow under 3 ger
   aldrig GO**. Har du inte sett produktbilden: lämna wow tom, be Axel sätta den, och
   håll tillbaka domen.
4. **Marginalräkning:** landed cost → föreslaget pris → break-even-ROAS
   (`1 / (1 − landed cost / pris)`). Jämför mot spannet 1,34–2,00 i `products.json`.
   **Fråga om momsläget innan du drar av 25 %** — det står ingenstans i repot.
5. **Leverera domkortet:**

   ```
   PRODUKT: <namn>
   GRINDAR: G1 ✅/❌ <källa> · G2 … · G3 … · G4 … · G5 … · G6 …
   POÄNG:   wow ×2 = _ | problem _ | demo _ | ovanlighet _ | marginal _ | robusthet _  →  _/35
   DOM:     GO / VÄNTA / NEJ
   SKÄL:    en mening
   NÄSTA:   <konkret steg>
   ```
6. **Logga i `products/kandidater.json`** — även `NEJ`, med skälet. Det är hela
   anledningen till att filen finns.
7. **Vid `GO`:** säg exakt vad som ska hända — beställ prov, Drive-mapp
   `TEMU-<SKU> <Referensnamn>` (SOP-06 regel 1), rad i product sheetet, sedan
   `/ny-produkt <namn> <budget>`. Skapa **inte** produkten i `products.json` här;
   det gör `/ny-produkt` när provet är godkänt.
8. Committa och pusha.

---

## Läge LISTA — `/produkt lista`

Kör `node pipeline/kandidater.mjs` och visa utskriften. Lyft det som ligger på `GO`
utan nästa steg taget, och allt på `VÄNTA` som är äldre än 60 dagar — det ska antingen
tas upp eller stängas.

---

## DEFINITION OF DONE

- [ ] `docs/os/PRODUKTKRITERIER.md` läst i den här sessionen
- [ ] Dedup körd mot `products/kandidater.json` innan något nytt bedömdes
- [ ] JAKT: 8–12 kandidater, var och en med en konkret 3-sekundersbildruta
- [ ] DOM: alla sex grindar körda i ordning, **var och en med källa**
- [ ] Poäng bara satt på produkter som klarat alla grindar; wow tom om bilden inte setts
- [ ] Break-even-ROAS uträknad, momsläget frågat och inte gissat
- [ ] Temu-priser inte redovisade som fakta
- [ ] Allt bedömt loggat i `kandidater.json` — även NEJ, med skäl
- [ ] Pushad
