# /abtest – Läs av eller planera ett A/B-test på matstrumpor.se

Argument: `$ARGUMENTS` — test-id, eller `planera`.
Exempel:
- `/abtest sortval` — läs av testet som heter sortval
- `/abtest` — visa vilka tester temat kör just nu och läs av dem
- `/abtest planera` — hur lång tid ett test skulle ta med butikens trafik

⚠️ **Butik: matstrumpor.se** (`1r46tp-qx`). Inte Bäverbutiken. Allt går via
`node matstrumpor/ab/kor.mjs`, som läser Admin GraphQL med appen Fabriken
(`sparning/butik.mjs`, nycklarna `SHOPIFY_CLIENT_ID/SECRET_1r46tp_qx`).
**Ingen Shopify-MCP, ingen ShopifyQL.** Skriptet kontrollerar själv att
butikens domän är matstrumpor.se innan en enda order hämtas, och stannar
annars. Det är läs-bart hela vägen och skriver aldrig något till Shopify.

**CONNECTORS: inga.**

## Så fungerar testerna i temat

- Testerna står i temainställningen `ms_ab_tests`, en rad per test
  (`id` eller `id:vikt_a:vikt_b`). En rad som börjar med `#` är avstängd.
- `assets/ms-ab.js` lottar besökaren och sparar varianten i kakan `ms_ab_<id>`
  i 30 dagar.
- Varianten stämplas på ordern som attributet `AB <id>` = `a`/`b`.
- Ett granskningsbesök via `?ms_ab=<id>:<variant>` stämplas dessutom med
  `AB <id> forced` = `ja`. Sådana ordrar räknas bort.
- Precedensen är testet `sortval` i `products/matstrumpor/batch-log.md`
  (avläsning 1–4 och avstängningen 2026-09-29). Läs det avsnittet först.

## Gör följande

Kör ett kommando per Bash-anrop.

1. **Vilka tester rullar?**
   ```bash
   node matstrumpor/ab/kor.mjs --tester
   ```
   Kommandot läser `ms-ab-config` på den publika startsidan. `tests: []` betyder
   att inget test rullar. Ett avslutat test kan ändå läsas av i efterhand.

2. **`planera`** (eller inget test att läsa av):
   ```bash
   node matstrumpor/ab/kor.mjs --planera --baslinje <konv> --trafik <besökare/dag>
   ```
   Konvertering och trafik per dag kommer från Axel, ur Shopifys Analytics.
   Kommandot hämtar dem inte. Saknas talen, fråga efter dem. Gissa aldrig och
   använd aldrig standardvärdet som om det vore butikens. Säg rakt ut vilka
   lyft som är mätbara inom sex veckor och vilka som inte är det. Sluta här.

3. **Testets fönster.** `--sedan` är testets första order efter att temat
   publicerades, alltså inte midnatt. `#4785` samma morgon var ett förköp och
   hade räknats fel. Hämta starttiden ur batch-loggen, eller fråga Axel.
   `--till` är avstängningen, eller utelämnas medan testet rullar. Båda tar
   ISO-tid eller ordernummer (`"#4786"`), och båda gränserna räknas med.

4. **Läs av:**
   ```bash
   node matstrumpor/ab/kor.mjs --test <id> --sedan <start> [--till <slut>] --koder "<regler>"
   ```
   - `--koder` är reserven när stämpeln saknas. Den gäller köpvägar som aldrig
     passerar produktsidans kod: expressknappar, kundvagnssidan och en gammal
     vagn. Varianten läses då ur rabattkoden, till exempel för `sortval`:
     `"a=SUSHI-*,PIZZA-*,HAMBURGARE-*,DONUT-*;b=STRUMPOR-K1F1-P*,STRUMPOR-K2F2-P*"`.
     Stämpeln vinner alltid över koden. En order med koder för båda varianterna
     räknas som okänd.
   - Har Axel sessioner per variant: lägg till `--besokare-a <n> --besokare-b <n>`.
     Då blir testet ett tvåproportionstest, som är starkare. Annars skriver du:
     **"sessioner per variant mäts inte"**, precis som vid förra avläsningen.
     Temat loggar inte exponeringen.
   - Ordrarna skrivs till `matstrumpor/ab/output/<id>-<datum>.json`, som är
     gitignorerad. Filen innehåller inga namn och inga e-postadresser.

5. **Leverera rapporten rakt av.** Ändra inte beskedet från `analys.mjs`.
   Säger verktyget "för få köp" är det svaret. Leta inte efter ett mönster i
   tolv ordrar. Redovisa alltid dessa rader ur ordrar.mjs, även när de är 0:
   - **Okända** (varken stämpel eller kod). De räknas inte, och ingen variant
     gissas.
   - **Tvingade** (borträknade), annullerade (borträknade) och ur koden.
   - Lådor per order, andel 1/2/3/4+ lådor och koderna per variant, bredvid
     snittordern.

6. **Nästa steg:**
   - Vid `B vinner`: föreslå att B görs permanent, men rör inte temat.
   - Vid `fortsätt`: säg hur många köp som fattas och ungefär hur många dagar
     det är kvar i butikens takt.
   - Vid `oavgjort`: föreslå att testet avslutas. Då ändras `ms_ab_tests` till
     `# <id>` i det publicerade temats `config/settings_data.json`. Det görs
     bara efter Axels ok, en rad, och den läses tillbaka efteråt. Så gjordes
     det 2026-09-29.

7. **Logga avläsningen** i `products/matstrumpor/batch-log.md` under testets
   rubrik: fönstret (första och sista order), ordrar, okända, tvingade, ur
   koden, tabellen och verktygets beslut ordagrant. Committa och pusha.

## Regler

- **Rör aldrig temat utan Axels ok.** Inga pris-, frakt- eller
  budgetändringar mitt i ett test.
- **Ingen dom under 25 köp per variant.** Verktyget vägrar, och du ska inte
  försöka runda det med resonemang.
- **Rangordna aldrig på ett enda tal.** Konvertering (här: antal köp) och
  snittorder kan peka åt olika håll. Redovisa båda.
- **Hitta aldrig på siffror eller varianter.** En okänd order förblir okänd.
- **Tvingade besök räknas alltid bort.**

## DEFINITION OF DONE

- [ ] `kor.mjs` verifierade butiken som matstrumpor.se (första raden i utskriften)
- [ ] Fönstret är testets första och sista order, inte midnatt
- [ ] Okända, tvingade, annullerade och ur koden redovisade
- [ ] `analys.mjs`-rapporten levererad oförändrad
- [ ] Både antal köp och snittorder redovisade, plus lådor per order
- [ ] Sessioner per variant: med `--besokare-*`, eller "mäts inte"
- [ ] Nästa steg angivet: publicera B, fortsätt eller avsluta, där temat bara rörs efter Axels ok
- [ ] Avläsningen loggad i `products/matstrumpor/batch-log.md`
