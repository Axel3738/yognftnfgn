# Bäverbutiken – Creative Strategy OS

Detta repo är operativsystemet för Bäverbutikens creative strategy. Den som kör
sessionen är oftast **managern (icke-teknisk)** som klistrar in färdiga prompter
från `prompts/`-mappen. Ditt jobb är att följa dem exakt.

## Regler för varje session

1. **Följ prompten bokstavligt.** Prompterna i `prompts/` är versionerade och
   testade. Hoppa aldrig över steg, korta aldrig ner leveransformatet, och
   invänta inte godkännande mellan faser om prompten säger åt dig att köra klart.
2. **Avsluta alltid med promptens "Definition of done"-checklista** — gå igenom
   den punkt för punkt och markera ✅/❌. Är något ❌: fixa det innan du är klar,
   eller skriv exakt varför det inte gick.
3. **Hitta aldrig på data.** Ingen dom över en annons under 300 kr spend eller
   3 köp. Saknas data: säg det rakt ut och leverera resten.
4. **Brief-kvoten är mål nr 1.** Varje session som launchar/loggar creatives ska
   köra `node pipeline/quota.mjs` och visa plus/minus-läget i sitt svar.
   Nya creatives loggas med `node pipeline/quota.mjs log <produkt-id> <antal>`.
5. **Namngivning:** alla nya annonser följer `docs/naming-convention.md` och
   naming-strukturen i `prompts/P1-strategist-os.md`. Läs av upptagna AD-ID:n i
   kontot innan du numrerar.
6. **Briefer på engelska** (redigerarna är engelsktalande), svenska manusrader i
   tabell `Swedish (use this) | English meaning`. SOP:er och svar till managern
   på svenska.
7. **Fråga bara när ett beslut kräver ägaren** (prisändring, rabatt som måste
   skapas i Shopify, ny target-CPA). Allt annat: kör.

## Var saker finns

| Vad | Var |
|-----|-----|
| Actionplan + bottlenecks | `docs/os/ACTIONPLAN.md` |
| SOP: batch-loopen (ny batch ads för en produkt) | `docs/os/SOP-01-batch-loop.md` |
| SOP: brief-kvoten (mål nr 1) | `docs/os/SOP-02-brief-quota.md` |
| SOP: UGC-pipeline och deadlines | `docs/os/SOP-03-ugc-pipeline.md` |
| SOP: daglig check-in / grönmarkering | `docs/os/SOP-04-daily-checkin.md` |
| SOP: när Claude inte lyssnar | `docs/os/SOP-05-nar-claude-inte-lyssnar.md` |
| SOP: produkttest-pipeline (Bäverbutiken) | `docs/os/SOP-06-produkttest.md` |
| Prompter managern klistrar in | `prompts/` |
| Produkt-konfig + launch-logg | `products/products.json` |
| Kvot-skriptet | `pipeline/quota.mjs` |
| Ad-tracker, playbook, naming | `docs/` |

## Aktivt setup — TVÅ separata verksamheter, blanda aldrig ihop dem

| | **Bäverbutiken** | **Grillkliniken** |
|---|---|---|
| Vad | General store (bäverbutiken.se), många testprodukter | Eget brand (grillkliniken.se), produkt **Mastern** (999 kr) |
| Ad account | **MagiBorsten** `1867947880635861` (SEK) | **SnarkLös** `1346450049878358` (SEK) |
| Flöde | Produkttest enligt SOP-06 → vinnare in i batch-loopen | Batch-loopen (SOP-01) direkt |

Aktiva produkter och deras kampanjer står alltid i `products/products.json` —
lita på den, inte på minnet. Kör aldrig en produkts analys i fel ad account.

- **Team:** filippinska videoredigerare + VA (engelska), en UGC-outreach-ansvarig,
  managern kör Claude-sessionerna.
