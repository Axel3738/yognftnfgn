# /ny-annonser – Ta en OPS-butik från byggd till annonser som snurrar

Argument: `$ARGUMENTS` — butiks-id (ex: `tankguard`), plus källänken till
Bäverbutikens produkt FÖRSTA gången butiken körs. `--dry` visar planen utan
att skapa något i Meta.

```
/ny-annonser tankguard https://bäverbutiken.se/products/ibc-tankoverdrag-1000-l-stoppar-alger-uv
/ny-annonser tankguard          # när kopplingen redan är sparad
```

Källänken behövs bara en gång: kommandot skriver ett `kalla:`-block i
`factory/produkter/<id>.yaml` (annonsprefix + produkt-handle) och läser det
därefter själv. Saknas både länk och block: stoppa och be om länken — leta
aldrig upp en källprodukt på gissning.

Fas 2 i OPS Factory. `/ny-ops` bygger butiken; det här kommandot ger den
annonser. Processen och alla fallgropar står i **`factory/FAS2.md`** — det
dokumentet är facit, det här kommandot är körordningen.

**Vad kommandot gör, i en mening:** läser Bäverbutikens AKTIVA kampanjer för
källprodukten — både den svenska och den norska — går igenom varje annons,
byter brandnamn och pris där de förekommer, och bygger TVÅ nya kampanjer i
OPS-kontot: en svensk och en norsk, med samma bevisade creatives fast
ommärkta för OPS-butiken.

Den som kör är oftast **VA:n (engelsktalande)** — svara henne på engelska,
korta rader; svara Axel på svenska enligt CLAUDE.md. Hon gör allt i den här
fasen: kör kommandot, granskar, och sätter kampanjen ACTIVE när den är grön.

**Kräver:** `META_ACCESS_TOKEN` i miljön, butikens Meta-sida och pixel ifyllda
i `factory/produkter/<id>.yaml`, och en `kalla:`-koppling till källprodukten
på Bäverbutiken.

---

## Kontokartan (lär dig den innan något körs)

| Roll | Konto | Id | Valuta |
|---|---|---|---|
| **Källa SE** | MagiBorsten | `1867947880635861` | SEK |
| **Källa NO** | Magiborsten NO | `1050941584152547` | NOK |
| **MÅL — båda kampanjerna** | MagiBorsten DK | `915422744950975` | SEK |

⚠️ **Fyra konton heter nästan samma sak.** Kontrollera alltid `ad_account_id`,
aldrig kontonamnet. Fel konto kostar riktiga pengar.

⚠️ **Målet är ALLTID MagiBorsten DK, oavsett marknad.** Både den svenska och
den norska OPS-kampanjen byggs där — trots namnet "DK". Det är ETT gemensamt
konto för alla OPS-butiker, och därför måste kampanjnamnen bära både brand
och marknad.

⚠️ **Målkontot är INTE tomt.** Bäverbutikens danska kampanjer ligger i samma
konto, med Bäverbutikens DK-sida `1324465810740336` och pixel
`1554276343018184`. Varje uppslag som "hittar en kampanj i kontot" måste
filtrera på butikens brandprefix — annars träffar du fel verksamhet.

⚠️ **Kontots valuta är SEK.** 1000 kr/dag = `daily_budget: 100000`.

---

Gör i ordning, utan att invänta godkännande mellan stegen:

1. **Rätt konto och rätt butik.** Läs `factory/produkter/<id>.yaml` och
   verifiera att `meta.ad_account_id` är `915422744950975` och att
   `meta.page_id` + `meta.pixel_id` är ifyllda. Saknas något: stoppa och säg
   exakt vad.

   **Källkopplingen.** Finns `kalla:`-blocket: använd det. Annars, med en
   källänk som argument: hämta produktens handle ur länken, slå upp
   annonsprefixet genom att läsa kampanjerna i MagiBorsten och hitta det
   prefix vars annonser pekar på den handlen, och SKRIV blocket i
   produktfilen (`kalla.annonsprefix`, `kalla.handle`, `kalla.produkt_id`).
   Hittas inget prefix: visa de kandidater du såg och fråga — gissa aldrig.
   ⚠️ Produktfilens rad 2 kan bära källänken som en ren kommentar (så gjorde
   `/ny-ops` fram till 2026-09-08). Den får läsas som förslag, men bekräfta
   alltid mot kontot innan blocket skrivs.

   Rapportera direkt: `Source: <prefix> in MagiBorsten · Target: <BRAND> in
   MagiBorsten DK ✓`.

2. **Läs källannonserna — BÅDA källkontona.** Den svenska kampanjen ligger i
   MagiBorsten `1867947880635861`, den norska i Magiborsten NO
   `1050941584152547` (se kontokartan ovan).
   Hämta alla annonser vars namn börjar med `kalla.annonsprefix` ur BÅDA,
   med copy (`message`/`headline`/`description`/`link`), `image_hash`/
   `video_id` och media-URL. Använd mönstret i `tools/oversattningskon.mjs`.
   Rangordna på `amount_spent` — de bevisade först.
   Håll de två uppsättningarna åtskilda hela vägen: SE-annonser blir den
   svenska kampanjen, NO-annonser den norska. Blanda dem aldrig.
   ⚠️ Ta bara ACTIVE-annonser ur aktiva adsets. En PAUSED annons är ett
   beslut — den har dömts ut och ska inte återupplivas i en ny butik.
   Finns ingen norsk kampanj för produkten: bygg bara den svenska och
   rapportera det. Uppfinn aldrig norska annonser ur de svenska här — det
   är `/oversatt`:s jobb, inte det här kommandots.

3. **Brand-detektorn** (FAS2 uppdrag A). Klassa varje annons över FEM ytor:
   copy, tal, inbränd text/slutkort, recensionsattribution — **och priset**.
   Dom per annons: `ren` / `bara-copy` / `kräver-omdubb` / `kräver-slutkortsbygge`.

   **Priset är lika viktigt som brandnamnet.** Jämför källannonsens pris mot
   OPS-butikens `ekonomi.pris` i produktfilen. Skiljer de sig måste priset
   bytas överallt det förekommer: i copyn, i inbränd text, på slutkortet och
   i rabattpåståenden ("spara X kr", "X %"). Ett fel pris i en annons är
   både ett trasigt löfte mot kunden och ett brott mot husregeln att priset
   alltid hämtas från produktsidan vid varje körning.
   ⚠️ Norska annonser: källan (Magiborsten NO) har redan NOK-priser — jämför
   mot OPS-butikens NOK-paketnivåer, inte mot SEK-priset. Ett SEK-tal i en
   norsk annons räknar fel. Har butiken inga NOK-nivåer satta än: stoppa den
   norska halvan och säg det, bygg den svenska klart.
   Talet läses GRATIS ur `market-expansion/no/video-batches/*/srt-orig/*.orig.srt`
   om produkten varit genom NO-flödet. ⚠️ HeyGen hör fel — sök även
   `Bawebutiken` och `Spavebutiken`.
   Visa tabellen i chatten innan något ändras.

4. **Fixa bilderna** (FAS2 uppdrag C, gratis). `pipeline/oversatt-bild.py`
   byter text i sin egen ruta utan krediter; `bildannonser/kie.mjs` är
   reservvägen när texten sitter direkt på fotot. Text läggs ALLTID med
   `bildannonser/text.py` — kie.ai klarar inte svensk text.
   Producera QA-bild före/efter för varje ändrad bild.

5. **Fixa videorna** (FAS2 uppdrag A2). Bara de som klassats `kräver-omdubb`.
   Kör `node pipeline/localize.mjs check` FÖRST — är plånboken tom: hoppa över
   steget, rapportera vilka videor som väntar, och fortsätt med resten.
   Inbränd text byts med `pipeline/no-precis.py`, aldrig med en ny caption-motor.
   ⚠️ Rendera aldrig före proofread (rendering drar krediter, proofread är gratis).

6. **Skriv om copyn — per marknad.** Varje `link` pekas om till OPS-butikens
   produktsida: svenska annonser till `/products/<handle>`, norska till
   `/nb/products/<handle>`. **Gissa aldrig länken** — ta den ur produktfilen
   och avbryt hellre. Brandnamn OCH pris byts i texten. Copyn skrivs av en
   subagent med `model: "sonnet"` som får `docs/copy-regler.md` —
   huvudsessionen skriver aldrig slutgiltig copy. Norsk copy skrivs på
   bokmål, aldrig översatt rakt av från svenskan.

7. **Ladda upp media i målkontot.** `image_hash` och `video_id` är PER KONTO —
   Bäverbutikens creatives går inte att referera. Ladda ner filen, brand-swappa,
   och ladda upp på nytt till `act_915422744950975` (`advideos`/`adimages`).

8. **Bygg TVÅ kampanjer — en svensk och en norsk.**
   `pipeline/no-video-launch.mjs` + `no-image-launch.mjs` med en vågkonfig per
   marknad. Allt Graph-anrop går genom `tools/meta-lib.mjs` — skriv aldrig egna
   anrop, spärrarna där är dyrköpta.
   - Kampanjnamnen prefixas ALLTID med brandet OCH marknaden:
     `TANKGUARD_SE_…` och `TANKGUARD_NO_…`. Alla OPS-butiker delar ett konto,
     och utan marknaden i namnet går datan inte att skära per land.
   - Båda kampanjerna ligger i samma konto (`915422744950975`, SEK) men har
     olika geo, olika språk i copyn och olika landningssida (`/` respektive `/nb`).
   - Sätt status EXPLICIT på alla tre nivåer. **Allt föds PAUSED.**
   - `promoted_object.pixel_id` = butikens egen pixel, samma för båda.
     Sida = butikens egen, samma för båda.
   - Klona aldrig ett adset utan targeting och lägg aldrig in en fallback-geo.
     En SE-fallback i den norska kampanjen visar annonserna i fel land.
   - EU-konton kan kräva `dsa_beneficiary`/`dsa_payor` — kolla innan.

9. **Trippelkolla mot kontot.** Läs TILLBAKA hela strukturen ur Meta och
   jämför mot butikens konfig: `page_id`, `pixel_id`, `daily_budget`, länk och
   status på alla tre nivåer. Stämmer något inte: rätta och läs tillbaka igen.
   Delvis klart heter delvis klart.

10. **Lämna över till VA:n.** Skriv i chatten, på engelska:
    - vad som byggdes (kampanj, antal adsets, antal annonser)
    - vad som INTE gjordes och varför (t.ex. videor som väntar på krediter)
    - hennes granskningslista: öppna Ads Manager, kolla att länken går till
      butikens produktsida, att pixeln är butikens egen, att budgeten stämmer
    - **hon sätter kampanjen ACTIVE när granskningen är grön.**

11. **Dokumentera.** `factory/state/<butik>--<produkt>.json`, ärvd historik in i
    `products/<butik>/batch-log.md` (de brand-swappade annonserna bär med sig
    sitt bevisade DNA), och varje NYTT bevisat steg in i `factory/FAS2.md` i
    samma session. Committa och pusha.

---

## DEFINITION OF DONE

- [ ] Rätt konto verifierat före första skrivningen (mål ≠ källa)
- [ ] `kalla:`-blocket finns i produktfilen — bekräftat mot kontot, inte gissat
- [ ] Båda källkampanjerna lästa (SE + NO), bara ACTIVE-annonser med
- [ ] Brand-detektorns tabell visad: varje källannons klassad över fem ytor
      (copy, tal, inbränd text, recensioner, PRIS)
- [ ] Priset bytt överallt det förekommer — SEK i den svenska, NOK i den norska
- [ ] Bilderna brand-swappade med QA före/efter
- [ ] Videorna omdubbade — eller listade som väntande med orsak
- [ ] All copy pekar på butikens EGEN produktsida, ingen gissad länk
- [ ] Media uppladdat i målkontot (inte refererat från källkontot)
- [ ] TVÅ kampanjer byggda: `<BRAND>_SE_…` och `<BRAND>_NO_…`
- [ ] Svensk copy på svenska mot `/`, norsk copy på bokmål mot `/nb`
- [ ] Allt skapat PAUSED, status explicit på alla tre nivåer
- [ ] Tillbakaläst ur Meta: sida, pixel, budget, länk och status stämmer
- [ ] VA:n har sin granskningslista och vet att hon sätter ACTIVE
- [ ] state + FAS2.md uppdaterade, pushat
