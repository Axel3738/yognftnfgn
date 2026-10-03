# /strategrapport — veckogranskningen av Bruces Growth Guide (tisdag, feedback till honom i Notion)

Argument: `$ARGUMENTS` — normalt `--skarpt` (rutinen). Utan flagga = torrt:
läser, mäter, skriver texterna till `matstrumpor/strategrapport/output/<vecka>/`,
skriver inget i Notion och inget minne. `--idag 2026-10-06` räknar som om det
vore den dagen. `--cache` läser Notion-raderna ur `output/notion.json` (bara när
nätet är borta). `--igen` skriver om en vecka som redan står i historiken.

```
/strategrapport --skarpt      rutinen (tisdag 03:00 CEST = 09:00 Manila)
/strategrapport               provkör: texterna som filer, inget skrivs
```

Uppdraget i en mening: **varje tisdag läser rutinen Growth Guide i Notion,
mäter om Bruce gjorde sin måndagskoll (stängde rader med lärdom, la EN ny
konceptrad, lämnade in briefer), vad hans koncept gav (etiketterna i veckan,
hit rate som bråk, vinnarna att bygga på) och ger honom feedback på engelska
med ETT action item — som en Log-rad i Growth Guide plus en kommentar på den
raden med @Bruce.** Axel pingas i samma rad bara när något bara han kan
påverka. Axels beställning 2026-10-03: "en rutin som granskar det här varje
vecka … evaluerar Bruce och rapporterar någonstans där det gör nytta ifall det
behövs … ger han feedback". Reglerna, måtten och det som inte går att mäta:
`matstrumpor/strategrapport/README.md`.

⛔ **Läs-bar mot allt utom Log-raden och kommentaren.** Rutinen skriver aldrig
i Ad Roadmap, Ad Results eller hubben, ändrar ingen STATUS, ingen LEARNINGS,
inget UPVOTE. Den raderar aldrig något. Bruces egna celler är hans.

⛔ **Feedbacken bär aldrig kronor, ROAS, köp eller tankstreck, och aldrig
butikens namn i löptexten** (`redigerarrapport/post.mjs kontrollera()` kastar).
Inga påhittade tal: allt kommer ur mätningen. ETT action item per vecka, aldrig
samma två gånger förrän banken är slut (`data/historik.jsonl`).

⛔ **Axel pingas bara vid eskalering** (ingen måndagskoll två veckor i rad, en
levande vinnare utan iteration efter 14 dagar, butikens namn i en människocell).
Allt annat läser han i chatten här och i Log-fliken när han vill.

CONNECTORS: inga krävs. Notion via `NOTION_TOKEN` (integrationen "Bäverbutiken
RUTINER", som har kommentarsrättigheten — mätt 2026-10-03).

## Gör i ordning

0. `git pull --rebase origin main`
   Minnet (`matstrumpor/strategrapport/data/`) ligger i repot. Misslyckas
   pullen: `git rebase --abort`, skriv det i svaret, kör ändå.

1. `node matstrumpor/strategrapport/kor.mjs $ARGUMENTS`
   Skriptet gör allt: bygger om arkivet ur loggen (`kor.mjs --arkiv`, offline)
   → läser Ad Roadmap och hubben → batcherna som Growth Guide ser dem →
   mätningen mot förra veckans snapshot → texterna → med `--skarpt`: Log-raden
   `<vecka> Weekly review` (DATE = i dag, SYSTEM = sammanfattningen),
   kommentaren med @Bruce + hela feedbacken, eventuell kommentar med @Axel,
   och minnet (`data/snapshot.json` skrivs om, `data/historik.jsonl` får en rad).
   Står veckan redan i historiken skrivs inget (säg det i svaret; `--igen`
   skriver om). Utskriften slutar med rapporten till Axel på svenska — den är
   svaret, citera den.
   Felar Notion mitt i: Log-raden kan finnas utan kommentar. Minnet skrivs
   bara när både raden och kommentaren gått igenom, så nästa körning gör om
   veckan (`skrivLoggrad` återanvänder raden på titeln, ingen dubblett).

2. Lägg tillbaka arkivets markdown (den är Matstrumporkungens att committa, och
   två rutiner som skriver samma fil ger merge-konflikter):
   `git checkout -- products/matstrumpor/arkiv.md`

3. Committa minnet när det ändrats:
   `git add matstrumpor/strategrapport/data && git commit -m "strategrapport <vecka>: <stängda> stängda, <nya> nya rader, action <nyckel>" && git push origin main`
   `output/` är gitignorerad och committas aldrig.

4. Svaret till Axel: rapporten ur utskriften, rakt av (svenska, en sak per rad,
   inga kronor). Länken till Log-raden står sist i den när något skrevs. Inga
   uppgifter till Axel om inte eskaleringen säger det — då står det i raden
   "Till dig:".

## Definition of done

- [ ] `git pull --rebase` kördes före skriptet.
- [ ] Arkivet byggdes om (eller "läser det som finns" står i svaret med orsak).
- [ ] Ad Roadmap och hubben lästes ur Notion (antalet rader står i utskriften),
      inte ur cachen — eller `--cache` står i svaret med orsak.
- [ ] Feedbacken klarade `kontrollera()` (inga kronor/ROAS/köp/tankstreck/
      butiksnamn) och engelskspärren gav ingen varning (eller texten är läst).
- [ ] Med `--skarpt`: Log-raden `<vecka> Weekly review` finns i Growth Guide
      och kommentaren med @Bruce ligger på den (id:n i `data/historik.jsonl`);
      Axel-kommentaren bara om eskaleringen sa till.
- [ ] Minnet (`data/snapshot.json`, `data/historik.jsonl`) committat och
      pushat till `main`; `products/matstrumpor/arkiv.md` lämnad orörd.
- [ ] Svaret till Axel är rapporten ur utskriften, med "Till dig:" bara när
      eskaleringen gäller.
