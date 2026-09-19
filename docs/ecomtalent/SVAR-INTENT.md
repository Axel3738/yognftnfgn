# Svaret till Skalnings kungen: vad "intent" betyder över 4 000 kr/dag

**2026-09-19.** Rutinen `/rond-auto` (grenen `claude/daily-agent-discussion-uos5df`)
frågade Axel efter dagens ändring "Axels manuella zon över 4 000 kr". Svaret
nedan är byggt på ecomtalent-kursen (belägg och citat i `README.md`) och
klistras in av Axel i rutinens chatt. Språket är svenskt eftersom rutinens
prompt och rapport är svenska.

---

## Texten Axel klistrar in

```
Svar på frågan om "intent" över 4 000 kr/dag: (c), och (b) följer av det.

"Intent" betyder att varje brief har en skriven hypotes och får en skriven
lärdom. Antalet briefer styrs inte av budgeten. Ecomtalent-kursen har ingen
formel som ökar antalet annonser med spenden. Deras egen takt är 3–5 koncept
per produkt och vecka med tre varianter var, och de säger att fem nya koncept
i veckan är i överkant redan vid 1 000 dollar/dag.

Så här gör du från och med nu på en produkt över 4 000 kr/dag:

1. Antal: max 5 koncept per vecka och produkt, tre varianter per koncept.
   Aldrig fler än vi hinner skriva lärdomar på. Budgeten ingår inte i
   räkningen.
2. Varje brief svarar på fyra saker innan den skrivs: vem (avatar), vilket
   problem eller begär, vilken vinnare eller lärdom den bygger på, och vad
   som ger oss tro på att den slår nuvarande nivå. Kan briefen inte svara
   skrivs den inte. Den parkeras i backloggen.
3. Mix: en budget över 4 000 kr har jag höjt själv för att det går, alltså
   finns en vinnare. Då 80 % vidarebyggen på vinnaren och 20 % nya vinklar.
   Slutar vidarebyggena slå originalet: 50/50. Finns ingen levande vinnare
   (ingen annons över break-even med ≥ 3 köp de senaste 7 dagarna): 80 %
   nya vinklar.
4. Vidarebygge i två steg. Först tre nya hookar eller rubriker på vinnaren.
   Slår ingen av dem originalet: gå djupare, ny annons byggd på VARFÖR
   vinnaren funkar (längre problemdel, invändning ur kommentarerna, annat
   format, annan avatar). Aldrig en ren kopia av top spendern.
5. Minst 1 av 10 briefer är alltid en researchad ny vinkel, även i
   vidarebyggeläge.
6. Inga retargeting-lager (egna BOF-publiker eller kampanjer) för att spenden
   gått upp. Kursen kör en kampanj upp till 5–10 k dollar/dag. BOF-annonser
   skrivs som vanliga briefer i samma kampanj när de har ett jobb:
   produktdetalj-bild, invändningsbesvarande, erbjudande eller brådska vid
   rea och lagerrensning. Inte som en kvot.
7. Lärdom efter 7 dagar på varje annons, vinnare som förlorare, i
   batch-log.md, och nästa rond skriver vilka lärdomar den bygger på. Spend
   men under break-even = utförandet brast, bygg vidare. Ingen spend = hooken
   brast, logga och släpp.
8. Runt 20 koncept på en produkt utan vinnare: byt avatar, begär eller
   awareness-nivå. Höj aldrig antalet.
```

---

## Beslut som togs åt Axel i texten (ändra om de är fel)

| Beslut | Varför | Kursens stöd |
|---|---|---|
| (c) + (b), inte (a) | Kursens "intent" = hypotes + lärdom per annons; retargeting-lager avråds under 5–10 k dollar/dag | README §1, §4 |
| Tak 5 koncept/vecka × 3 varianter | Byråns egen takt 3–5 batcher = 9–15 annonser/vecka; "five … maybe even that is an overkill" vid 1 k dollar/dag | README §2 |
| "Levande vinnare" = över break-even med ≥ 3 köp senaste 7 dagarna | Kursen ger inget tal; 3 köp är repots signifikansgrind (`docs/os/ANALYSMETOD.md`) | Repots regel, inte kursens |
| Läsfönster 7 dagar | Kursen säger 5–10 dagar; 7 är deras avläsningspunkt | README §5 |
| Över 4 000 kr = det finns en vinnare | Motorn höjer aldrig dit; en sådan budget har Axel satt själv för att produkten går | `rond-auto.md` steg 4b, `agent/besked.mjs` `TAK_SEK` |

## Öppna frågor (kursen avgör dem inte)

1. **Ska rutinens kod ändras nu** (`rond-auto.md` steg 4b + `annonskvot`/
   `rundkvot` i `agent/rond.mjs`, på agent-grenen) eller räcker svaret i
   chatten så att rutinen anpassar sig själv? Alternativ: (a) bara svaret
   nu, (b) ändra kommandofilen och kvoten också.
2. **Sållning i stället för färre briefer?** Kursens byrå launchar 5–6 av 20
   inlämnade och sparar resten (FunPunch [1:04:45]). Alternativ: (a) färre
   briefer enligt punkt 1 ovan, (b) behåll redigerarnas takt men låt
   leveransrundan bara launcha de som klarar hypotes-spärren.
3. **Gäller taket alla produkter eller bara över 4 000 kr?** Kursen har
   ingen spendtröskel alls. Under 4 000 kr ger `annonskvot` redan högst
   4 annonser/vecka (8 per runda), så skillnaden är liten.
4. **Ska `pipeline/quota.mjs` (Bäverbutikens kvot, 10–20 % av budget ÷ CPA)
   och `factory/kadens.mjs` (Nattvakten, 7/dag) få samma regel?** Alternativ:
   (a) ja, samma tak överallt, (b) bara Skalnings kungen.
