# /messenger — Messenger-svararen: svarar kunderna i DM på alla sidor

Argument: `$ARGUMENTS` — normalt `--skarpt --discord` (rutinen, varje timme).
`--torr` = bedöm och visa svaren, skicka inget, skriv inget minne.
`--kolla` = vilka sidor som går att läsa. `--sida <id>` = bara en sida.

Uppdraget (Axels beställning 2026-09-28): **gå igenom alla DM:s på alla
Facebook-sidor (Messenger) och deras Instagram, svara kunden själv när frågan
är enkel, lugna arga kunder direkt och lämna resten till VA:n** — "det är många
som kan vara sura … och säger att vi inte svarar på mailen".

Motorn är mejl-autosvarets (`kundtjanst/autosvar/`): samma regler, samma
Shopify-uppslag, samma texter. Allt står i `messenger/README.md`.

## Gör följande

1. `git pull --rebase origin main` (rutinerna pushar ofta).
2. `node messenger/kor.mjs --kolla`. **Exit 3 = ingen sida går att läsa**
   (token:en saknar `pages_messaging`): skriv EN rad i rapporten —
   "Messenger: 0 sidor läsbara, väntar på rättigheten (messenger/README.md →
   Rättigheten)" — och sluta. Posta inget i Discord, pusha inget.
3. `node messenger/kor.mjs $ARGUMENTS` (rutinen: `--skarpt --discord`).
4. Läs utskriften. Varje DM står med sin hink, orsak och (torrt) svaret.
   Står en rad som `fel`: skriv felet i rapporten, prova aldrig att skicka
   för hand.
5. Skarpt: committa `messenger/logg/` med rubriken
   `Messenger <datum tid>: <n> svar, <m> till VA:n` och pusha till `main`
   (bara om loggen ändrats).

## Regler

- ⛔ Skicka aldrig ett svar för hand, via något annat verktyg eller med
  HUMAN_AGENT-taggen. Bara `kor.mjs` skickar, och bara inom 24 h.
- ⛔ Blanda aldrig verksamheterna: sidan avgör butiken (`messenger/konfig.json`).
  En sida utan rad där får aldrig ett automatiskt svar.
- Ändra aldrig en svarstext i sessionen. Texterna ligger i
  `kundtjanst/autosvar/svar.mjs` och `messenger/bedom.mjs` och är testade.
- Discord är engelska; kundens ord står i backticks.

## Definition of done

- [ ] `--kolla` körd, antalet läsbara sidor redovisat
- [ ] Körningen klar: svar / till VA:n / fel räknade
- [ ] Discord-posten gick (eller: inget att posta)
- [ ] Loggen committad och pushad (skarpt, om den ändrats)
