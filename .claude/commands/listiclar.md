# /listiclar – alla tre listiclarna för en produkt, in i butiken, i ett svep

Argument: `$ARGUMENTS` — länken till produktsidan på Bäverbutiken. Valfritt
`7` (anledningar-sidan får sju punkter — standard fem; skriv `5 7` för att
bygga båda), `--butik <id>` (standard Bäverbutiken; annars ett OPS-id),
`--torr`.

```
/listiclar https://baverbutiken.se/products/strandtofflor-for-herr-halkfria-tradgardsskor
/listiclar https://baverbutiken.se/products/axelbalte-for-trimmer-justerbart-nylonbalte 5 7
/listiclar https://baverbutiken.se/products/takoverdrag-husvagn-6-5-3-m-skyddar-den-dyraste-ytan --butik carashell
```

Axels fråga 2026-09-16: "går det bra att skicka alla tre kommandon samtidigt
för en produkt i samma session?" Ja — det här kommandot är exakt det. Det
kör `/lagerrensning`, `/vi-testade` och `/anledningar` efter varandra på
samma produkt och lägger upp tre sidor i butiken:

| Sida | Adress | Kommandofil |
|---|---|---|
| Lagerrensning | `/pages/<slug>-lagerrensning` | `.claude/commands/lagerrensning.md` |
| Vi testade | `/pages/<slug>-vi-testade` | `.claude/commands/vi-testade.md` |
| Anledningar | `/pages/<slug>-5-anledningar` (och/eller `-7-`) | `.claude/commands/anledningar.md` |

## Så körs det

1. **Läs alla tre kommandofilerna** innan du börjar. Varje sida följer sin
   fil till punkt och pricka (järnregler, skelett, läsbarhetstest, DoD).
2. **Underlaget hämtas en gång per koncept** (motorn skriver det till varje
   koncepts mapp): `node listicle/bygg.mjs <länk> --underlag --koncept <id>`
   för `lagerrensning`, `vi-testade`, `anledningar` (med `--punkter 7` om
   sju). Läs `dna.md` en gång.
3. **Tre olika copyn.** Samma produkt, samma fakta — men ingen mening får
   återanvändas mellan sidorna, och de tre hero-rubrikerna ska vara tre
   olika löften (priset / perioden / antalet). Skriv dem i ordningen
   lagerrensning → vi-testade → anledningar och läs alla tre högt efteråt:
   är det tre olika sidor, eller samma sida i tre kostymer?
4. **Bilderna får delas.** Skriv bildplanen för den första sidan och
   kopiera `bildplan.json` + `bilder.json` (cachen) till de andra
   koncepts mappar innan de byggs — samma prompt ger samma cachade bild, så
   kie körs en gång. Byt bara de platser vars ROLL skiljer (vi-testade
   punkt 3, anledningar punkt 6–7).
5. **Bygg och publicera en sida i taget**, i ordning, med `--torr` först:
   ```
   node listicle/bygg.mjs <länk> --koncept lagerrensning --torr   → skarpt
   node listicle/bygg.mjs <länk> --koncept vi-testade --torr      → skarpt
   node listicle/bygg.mjs <länk> --koncept anledningar [--punkter 7] --torr → skarpt
   ```
   Temafilerna skrivs av första körningen; de två nästa ser "3 filer redan
   rätt". Varje körning läser sin sida tillbaka som kund (ingen header,
   ingen footer) innan den räknas som klar.
6. **Titta** på varje sidas skärmdumpar (desktop + mobil) och varje kie-bild.
7. **Logga och committa** en gång för alla tre: batch-log-rad per sida om
   produkten har minne; `listicle/output/<koncept>/<handle>/` för alla
   koncept (aldrig `bilder/` eller `forhandsvisning/`); ett svenskt
   commit-meddelande; push.

Stoppar en sida (❌ i copyn, bild som inte går att generera, butiken som
inte svarar): bygg klart de andra, rapportera exakt vad som stoppade och
varför. Tre sidor är målet; två uppe och en tydligt förklarad är bättre än
noll.

## Rapport till Axel (kort, svenska)

- Produkten, priset/jämförpriset som sidorna bär.
- En rad per sida: adress, hero-rubrik, fem (sju) punktrubriker.
- Perioden som valdes för vi-testade och varför; antal punkter för
  anledningar och (första gången) förslaget att testa 5 mot 7.
- Bilderna: vilka delades, vilka är egna, var de ligger.
- Läsbarhetstestet och tre-frågorstestet per sida (antal rader, ❌ och varför).

**Axels uppgifter, sist, numrerade:**
1. Öppna de tre adresserna och läs igenom en gång var.
2. Peka annonserna: lagerrensnings-vinkeln → lagerrensningssidan, "vi testade"-creatives → vi-testade-sidan, resten → anledningar (eller dela mellan 5 och 7 om båda byggdes).

## DEFINITION OF DONE
- [ ] Alla tre kommandofilerna lästa; varje sida uppfyller sin egen DoD
- [ ] Tre olika copyn — ingen mening delad, tre olika hero-löften
- [ ] Bilderna delade där rollen är samma; kie kört en gång per motiv
- [ ] Tre sidor uppe i butiken, var och en läst tillbaka utan header/footer; adresserna i rapporten
- [ ] Skärmdumpar tittade på för alla tre; batch-log; committat och pushat
- [ ] Rapport + Axels klick sist, numrerade
