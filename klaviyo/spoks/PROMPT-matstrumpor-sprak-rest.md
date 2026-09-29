# Prompt: de sista 18 kampanjutkasten för Matstrumpor på alla språk

Klistra in i en ny session (efter att Spoks-connectorn loggats in på
https://claude.ai/customize/connectors):

```
Matstrumpor Spoks alla språk: ladda upp de sista kampanjutkasten. Arbetet ligger på grenen
claude/pensive-dirac-s1ac2o (inte main): kör `git fetch origin claude/pensive-dirac-s1ac2o &&
git checkout claude/pensive-dirac-s1ac2o` först och pusha dit. Läs klaviyo/spoks/README.md →
"Matstrumpor på alla språk" och "Läget 2026-09-29 kväll". Kör först
`node klaviyo/spoks-sprak.mjs --brand matstrumpor` (bygger uppdrag/kampanjer.json). Ladda sedan upp
index 103–120 i klaviyo/output/matstrumpor/spoks/sprak/uppdrag/kampanjer.json med
mcp__Spoks__draft_campaign, ETT anrop i taget, postData exakt ur varje post_fil, och logga varje
rad i klaviyo/konto/matstrumpor/spoks-sprak/kampanjer.jsonl. Stanna vid första rate limit.
Kontrollera med `node klaviyo/spoks/sprak-koll.mjs --logg <sessionsloggen> --alla` (planen har
277 mejl; de 259 som redan finns syns inte i den nya loggen, så bara de 18 nya ska vara ✅).
Schemalägg aldrig, välj ingen publik. Committa och pusha.
```
