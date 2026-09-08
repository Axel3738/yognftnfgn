# /ny-annonser – Ta en OPS-butik från byggd till annonser som snurrar

Argument: `$ARGUMENTS` — butiks-id (ex: `tankguard`) + ev. `--dry` för att visa
planen utan att skapa något i Meta.
Exempel: `/ny-annonser tankguard`

Fas 2 i OPS Factory. `/ny-ops` bygger butiken; det här kommandot ger den
annonser. Processen och alla fallgropar står i **`factory/FAS2.md`** — det
dokumentet är facit, det här kommandot är körordningen.

Den som kör är oftast **VA:n (engelsktalande)** — svara henne på engelska,
korta rader; svara Axel på svenska enligt CLAUDE.md. Hon gör allt i den här
fasen: kör kommandot, granskar, och sätter kampanjen ACTIVE när den är grön.

**Kräver:** `META_ACCESS_TOKEN` i miljön, butikens Meta-sida och pixel ifyllda
i `factory/produkter/<id>.yaml`, och en `kalla:`-koppling till källprodukten
på Bäverbutiken.

---

## Innan något körs

⚠️ **Två konton med nästan samma namn.** Källa = MagiBorsten `1867947880635861`
(Bäverbutiken SE). Mål = MagiBorsten DK `915422744950975` (ALLA OPS-butiker).
Kontrollera alltid `ad_account_id`, aldrig kontonamnet. Fel konto kostar
riktiga pengar.

⚠️ **Målkontot är INTE tomt.** Bäverbutikens danska kampanjer ligger i samma
konto, med Bäverbutikens DK-sida `1324465810740336` och pixel
`1554276343018184`. Varje uppslag som "hittar en kampanj i kontot" måste
filtrera på butikens brandprefix — annars träffar du fel verksamhet.

⚠️ **Kontots valuta är SEK.** 1000 kr/dag = `daily_budget: 100000`.

---

Gör i ordning, utan att invänta godkännande mellan stegen:

1. **Rätt konto och rätt butik.** Läs `factory/produkter/<id>.yaml` och
   verifiera att `meta.ad_account_id` är `915422744950975`, att `meta.page_id`
   och `meta.pixel_id` är ifyllda, och att `kalla.annonsprefix` pekar på
   källprodukten. Saknas något: stoppa och säg exakt vad.
   Rapportera direkt: `Source: <prefix> in MagiBorsten · Target: <BRAND> in
   MagiBorsten DK ✓`.

2. **Läs källannonserna.** Hämta alla annonser i MagiBorsten vars namn börjar
   med `kalla.annonsprefix`, med copy (`message`/`headline`/`description`/
   `link`), `image_hash`/`video_id` och media-URL. Använd mönstret i
   `tools/oversattningskon.mjs`. Rangordna på `amount_spent` — de bevisade
   först.

3. **Brand-detektorn** (FAS2 uppdrag A). Klassa varje annons över fyra ytor:
   copy, tal, inbränd text/slutkort, recensionsattribution. Dom per annons:
   `ren` / `bara-copy` / `kräver-omdubb` / `kräver-slutkortsbygge`.
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

6. **Skriv om copyn.** Varje `link` pekas om till OPS-butikens produktsida —
   **gissa aldrig länken**, ta den ur produktfilen och avbryt hellre.
   Brandnamn i texten byts. Copyn skrivs av en subagent med `model: "sonnet"`
   som får `docs/copy-regler.md` — huvudsessionen skriver aldrig slutgiltig copy.

7. **Ladda upp media i målkontot.** `image_hash` och `video_id` är PER KONTO —
   Bäverbutikens creatives går inte att referera. Ladda ner filen, brand-swappa,
   och ladda upp på nytt till `act_915422744950975` (`advideos`/`adimages`).

8. **Bygg kampanjen.** `pipeline/no-video-launch.mjs` + `no-image-launch.mjs`
   med en vågkonfig för butiken. Allt Graph-anrop går genom `tools/meta-lib.mjs`
   — skriv aldrig egna anrop, spärrarna där är dyrköpta.
   - Kampanjnamnet prefixas ALLTID med brandet: `TANKGUARD_…`.
   - Sätt status EXPLICIT på alla tre nivåer. **Allt föds PAUSED.**
   - `promoted_object.pixel_id` = butikens egen pixel. Sida = butikens egen.
   - Klona aldrig ett adset utan targeting och lägg aldrig in en fallback-geo.
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
- [ ] Brand-detektorns tabell visad: varje källannons klassad över fyra ytor
- [ ] Bilderna brand-swappade med QA före/efter
- [ ] Videorna omdubbade — eller listade som väntande med orsak
- [ ] All copy pekar på butikens EGEN produktsida, ingen gissad länk
- [ ] Media uppladdat i målkontot (inte refererat från källkontot)
- [ ] Kampanjnamnet prefixat med brandet
- [ ] Allt skapat PAUSED, status explicit på alla tre nivåer
- [ ] Tillbakaläst ur Meta: sida, pixel, budget, länk och status stämmer
- [ ] VA:n har sin granskningslista och vet att hon sätter ACTIVE
- [ ] state + FAS2.md uppdaterade, pushat
