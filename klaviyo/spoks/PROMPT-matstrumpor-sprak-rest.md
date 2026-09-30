# Prompt: kolla Spoks-kopplingen och ladda upp de sista 18 kampanjutkasten (Matstrumpor, alla språk)

Varför: 2026-09-29 kväll svarade Spoks-connectorn "Internal server error" på `whoami` två
gånger i den session som byggde allt, fast Axel just kopplat om den. Troligen är det bara
den sessionen som har en gammal koppling. En ny session får en färsk.

Klistra in i en NY session:

```
Matstrumpor Spoks alla språk: kolla kopplingen och gör klart.

1. Grenen: kör `git fetch origin claude/pensive-dirac-s1ac2o && git checkout claude/pensive-dirac-s1ac2o`
   och pusha dit (inte main). Läs klaviyo/spoks/README.md → "Matstrumpor på alla språk" och
   "Läget 2026-09-29 kväll".

2. Kopplingen: ladda Spoks-verktygen med ToolSearch ("select:mcp__Spoks__whoami,mcp__Spoks__draft_campaign,mcp__Spoks__get_flow")
   och kör mcp__Spoks__whoami med storeId 71c2d4c8-b9ec-488a-b15c-5dfe8dbd2226.
   Svarar den med arbetsytan "Matstrumpor.se": fortsätt. Svarar den med fel eller finns
   verktygen inte: STOPPA och säg till Axel på svenska, kort, att kopplingen inte fungerar
   och att han ska logga in Spoks igen på https://claude.ai/customize/connectors. Försök
   aldrig runt ett fel.

3. Kör `node klaviyo/spoks-sprak.mjs --brand matstrumpor` (bygger klaviyo/output/…/uppdrag/kampanjer.json,
   den mappen är gitignorerad).

4. Ladda upp index 103–120 i klaviyo/output/matstrumpor/spoks/sprak/uppdrag/kampanjer.json
   (K13 de/fr/nl/es/it/pl/pt och K14 nb/da/fi/en/de/fr/nl/es/it/pl/pt) med
   mcp__Spoks__draft_campaign, ETT anrop i taget, postData exakt ur varje post_fil:
   python3 -c "import json;d=json.load(open('klaviyo/output/matstrumpor/spoks/sprak/uppdrag/kampanjer.json'))['kampanjer'][INDEX];print(json.dumps(json.load(open(d['post_fil']))))"
   (json.dumps utan ensure_ascii visar franskans hårda mellanslag som   — skriv dem så).
   Efter varje lyckat anrop: lägg en rad i klaviyo/konto/matstrumpor/spoks-sprak/kampanjer.jsonl:
   {"index": i, "id": "<id>", "sprak": "<språk>", "postId": "<id ur svaret>"}
   Första rate limit eller fel: stanna, försök inte igen, skriv var du stannade.

5. Flödena: hämta de sex nya flödena med mcp__Spoks__get_flow, ETT i taget:
   F01 89976b01-a650-4ad5-94a5-0556c490ae03, F02 6b22283c-d686-405b-8b6d-7d0b1f762028,
   F03 17aa6927-46a0-405d-b787-cd5e0e2513dc, F04 0594aa1b-dfce-4a46-81ef-8bd20989c16c,
   F05 32d23706-635e-4e1e-9c1f-e25d61df7bdf, F07 8c9c1204-99bd-4b0f-a988-4d7af65e4702.
   Rör dem inte. Slå aldrig på något.

6. Kontroll, med den här sessionens logg (~/.claude/projects/-home-user-yognftnfgn/<sessions-id>.jsonl):
   node klaviyo/spoks/sprak-koll.mjs --logg <loggen>          → de 18 nya ska vara ✅, 0 avvikelser
   node klaviyo/spoks/sprak-floden-koll.mjs --logg <loggen>   → alla sex flöden ✅
   (Kör inte sprak-koll med --alla: de 259 mejl som laddades upp tidigare finns bara i
   den gamla sessionens logg.)

7. Skriv in utfallet under "Läget 2026-09-29 kväll" i klaviyo/spoks/README.md (277 av 277),
   committa och pusha till claude/pensive-dirac-s1ac2o.

Aldrig: schemalägga, välja publik, skicka, slå på ett flöde eller ett sändsteg. Det är
Axels klick i appen.

Svara Axel på svenska, kort. Sist, under rubriken "Det här gör du", numrerat: för varje flöde
(en i taget) länken https://app.spoks.com/matstrumpor/flows/<nytt id> → slå på alla sändsteg
→ slå på flödet → sedan det gamla svenska flödets länk → stäng av dess trigger. Id-paren står
i README:n.
```
