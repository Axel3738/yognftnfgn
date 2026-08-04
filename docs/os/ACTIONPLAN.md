# Actionplan: outsourca Axel ur Bäverbutiken senast 31 augusti

**Skriven:** 2026-08-04 · **Deadline:** 2026-08-31 (4 veckor)
**Slutmål:** Managern kör hela creative-maskinen med prompterna i detta repo.
Axels enda kvarvarande beslut: target-CPA, budgetändringar, kill/skala och pengar.

## Läget just nu (verklig data 2026-08-04)

- Mastern: 15 000 kr/dag (+ "Anders Johansson" 3 000 kr/dag) = 18 000 kr/dag aktiv budget
- Senaste 7 dagarna: 112 640 kr spend · 217 köp · CPA 519 kr · ROAS 1,94
- **Kvoten med target-CPA 500 kr: 22 creatives per 3-dagarscykel (~7/dag)** — det är
  ambitiöst och kräver att kapaciteten (redigerare + UGC-råmaterial) räknas hem, se SOP-02.
- ⚠️ `target_cpa_sek: 500` i `products/products.json` är min placeholder utifrån
  nuvarande CPA. **Axel: sätt riktig target-CPA (baserat på COGS/break-even) — det
  är ratten som styr hela kvoten.**

## Veckoplan

### Vecka 1 (4–10 aug): Kärnloopen körs av Axel, med systemet
- [x] System i repo: SOP-01–05, prompter P1–P6, kvotskript, CLAUDE.md (klart i denna commit)
- [ ] Axel sätter riktig target-CPA i `products/products.json`
- [ ] Axel kör EN hel batch-loop (SOP-01) själv med de nya prompterna och rättar
      allt som skaver — varje friktion blir en promptändring, committad
- [ ] Sätt upp Notion-databaserna: "Creative Tasks" + "UGC Pipeline" (kolumner i SOP-03)
- [ ] Bestäm Slack-kanalstruktur: en kanal per produkt för redigerarna + en för UGC

### Vecka 2 (11–17 aug): Managern kör, Axel tittar på
- [ ] Managern kör daglig check-in (P4) varje dag, Axel granskar efteråt (15 min/dag)
- [ ] Managern kör sin första batch-loop (SOP-01) med Axel i rummet
- [ ] UGC-ansvarig börjar rapportera enligt SOP-03; managern kör P6 vid varje förändring
- [ ] Första kapacitetsmätningen: hur många creatives/dag klarar redigerarna faktiskt?

### Vecka 3 (18–24 aug): Managern kör själv, Axel svarar bara på eskaleringar
- [ ] Managern kör allt (P1–P6) utan hjälp; Axel svarar bara på eskaleringar i Slack
- [ ] Dashboard v1 byggs (nu — inte tidigare — när datat och rutinerna finns):
      Claude-artifact som läser products.json + Notion + Ads Manager och visar
      kvotläge, redigerar-KPI:er och UGC-pipeline per produkt
- [ ] Skriv delegationsregler: vid vilka CPA-nivåer managern själv får killa/skala
      utan att fråga Axel

### Vecka 4 (25–31 aug): Överlämning
- [ ] Axel rör ingenting på 5 arbetsdagar; allt som ändå landar hos honom skrivs upp
      och får en SOP eller promptändring
- [ ] Genomgång av listan → sista justeringar → **31 aug: överlämnat**

## Mina tanker och idéer

1. **Prompterna i repot är hela tricket.** Gamla SOP:en länkade Google Docs — de
   driftar, saknar checklista och Claude ser dem inte automatiskt. Nu ligger de i
   repot, varje session i repot läser CLAUDE.md med reglerna, och varje prompt
   slutar med en Definition of done som managern bara behöver kontrollera är grön.
   "Claude lyssnar inte"-problemet attackeras från tre håll: regler i CLAUDE.md,
   checklistor i prompterna, och SOP-05 som gör varje misstag till en promptändring.
2. **Kvoten är nu en siffra, inte en ambition.** `node pipeline/quota.mjs` svarar
   på sekunden: 🔴 −19 eller 🟢 +3. Den hänger med när budgeten ändras eftersom P4
   hämtar färsk budget varje morgon. Extremt tydligt plus/minus — som du bad om.
3. **En creative räknas vid launch, inte vid brief.** Annars optimerar teamet på
   att skriva briefer som ingen producerar. Kvoten mäter det som spenderar pengar.
4. **Dashboarden medvetet i vecka 3.** Byggs den först blir den en snygg fasad över
   tomma rutiner. När P4 körts dagligen i två veckor finns strukturerad data att visa.
5. **Managern behöver aldrig "kunna AI".** Hela jobbet är: öppna promptfil → fyll i
   klamrar → klistra in → kontrollera att checklistan är grön → godkänn Slack-utkast.
   Det är närmare HR/Excel-arbete än AI-arbete, vilket matchar hennes profil.

## Möjligheter

- **Skalning utan Axel:** när budgeten höjs räknar systemet självt upp kvoten —
  flaskhalsen blir kapacitet (redigerare/UGC), och den är billig att köpa i Manila.
- **Ny produkt = kopiera ett JSON-objekt** i products.json + kör P1. Hela maskinen
  (kvot, check-in, UGC, Notion) funkar direkt för produkt nr 2, 3, 4.
- **Tracking-sheetet (P3) blir en flerårig databas** av vad som funkat per angle/
  format/hook — varje ny batch startar smartare än den förra.
- **På sikt:** schemalagd daglig check-in (Routine som kör P4 automatiskt varje
  morgon och postar sammanfattningen i Slack) — managern granskar i stället för
  att initiera. Bygg det när rutinen suttit manuellt i 2+ veckor.

## Bottlenecks (rangordnade) och vad som redan är gjort åt dem

1. **Redigerarkapacitet vs kvot.** 7/dag för Mastern är mycket. → Kapacitetscheck i
   SOP-02; mät verklig kapacitet vecka 2; höj bemanning eller statics-andel om 🔴.
2. **UGC-råmaterial tar slut.** Iterationsbatcher kräver nytt råmaterial. → SOP-03:s
   regel "minst 2 deals i status Filmar per produkt" + P4 larmar på deadlines.
3. **Claude-kvalitet varierar.** → CLAUDE.md + checklistor + SOP-05. Kvarstående
   risk: video-transkript kan inte hämtas via API — managern måste klistra in
   transkript för vinnare/förlorare (står i P1 FAS 0).
4. **Managern är single point of failure.** Sjuk/borta = ingen check-in. → Rutinerna
   är så enkla att Axel (eller VA:n) kan täcka upp med samma promptfiler; på sikt
   schemalagd P4.
5. **Feedback-loopen mot redigerarna.** Underkännanden som inte följs upp. → P4:s
   regel: inga obesvarade underkännanden äldre än 1 dag, annars ingen grön dag.
6. **Target-CPA saknas per produkt.** Utan den är kvoten fel. → Axel sätter den
   vecka 1; P1 ber om COGS när break-even saknas.
7. **Behörigheter.** Manager + Claude behöver: Ads Manager, Shopify, Notion, Slack,
   Drive (editor). → Kör en access-koll första gången managern kör P4; allt som
   saknas fixas då, en gång.

## Kända problem (fylls på löpande — se SOP-05)

- (tomt ännu)
