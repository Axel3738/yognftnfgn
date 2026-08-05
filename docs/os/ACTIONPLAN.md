# Actionplan: outsourca Axel ur Bäverbutiken senast 31 augusti

**Skriven:** 2026-08-04 · **Uppdaterad:** 2026-08-05 (Mastern/SnarkLös utlyft — detta
OS gäller endast Bäverbutiken/MagiBorsten; prompter ersatta med slash-kommandon)
**Deadline:** 2026-08-31 · **Slutmål:** Managern kör hela creative-maskinen med
kommandona i `.claude/commands/`. Axels enda kvarvarande beslut: target-CPA,
budgetändringar, kill/skala och pengar.

## Så hänger systemet ihop (managerns vardag)

1. **Ny testprodukt:** `/ny-produkt` → första testbatchen + registrering (SOP-06).
2. **Efter launch, när data finns:** `/forsta-batch` → full analys + Batch #2 +
   produktens minnesfiler i `products/<id>/` (SOP-01). Detta skapar produktens chatt.
3. **Sen rullar loopen:** `/cs` var 3:e dag per produkt — feedbackloop på senaste
   annonserna (hypotes → utfall loggas), uppdaterat Creative DNA, nästa batch
   enligt kvoten. Egna idéer skickas med direkt i kommandot.
4. **Idéer när som helst:** `/koncept` lägger dem i backloggen; nästa `/cs` tar
   med dem. `AKUT` = briefen byggs direkt.
5. **Varje morgon:** `/checkin` per produkt — kvot, Slack-kontrollfrågor,
   grönmarkering, larm. `/logga` när annonser launchas. `/ugc` vid creator-nytt.

**Modellpolicy (fast regel i CLAUDE.md):** strategi/analys körs alltid på
Fable 5/Opus; slutgiltig ad copy och voiceovers skrivs av sonnet/haiku-subagenter.

## Läget just nu (verklig data 2026-08-04, MagiBorsten)

| Produkt | Budget/dag | Köp 7d | CPA | ROAS | Kommentar |
|---------|-----------|--------|-----|------|-----------|
| Motorhöljet | 6 000 kr | 98 | 140 kr | 2,77 | Stark vinnare — skalningskandidat |
| Axelbältet | 2 000 kr | 47 | 324 kr | 1,74 | Volym finns, ROAS tunn |
| Sätesöverdragaren | 1 500 kr | 32 | 299 kr | 2,33 | Bra |
| Strandtofflorna | 1 000 kr | 40 | 170 kr | 2,53 | Bra |
| AI Smarta Glasögon | 1 000 kr | 2 | 1 208 kr | 1,55 | Svag — kill-kandidat om trenden står sig |
| Väggfästet | 500 kr | 9 | 329 kr | 2,08 | OK för testbudget |

- ✅ Target-CPA satta av Axel 5/8 (25 % nettomarginal efter kortavgift + EU-tull):
  Motorhöljet 135 · Strandtofflorna 145 · Väggfästet 170 · Axelbältet 185 ·
  AI Glasögon 930. ⚠️ **Sätesöverdragaren står kvar på placeholder 300 kr — sätt
  den.** Formeln ger hög kvot åt vinnare med låg CPA (Motorhöljet: 27
  creatives/cykel = 9/dag) — rimligt, men kräver kapacitetsbeslut vecka 2.
- 2-extra-ads-regeln är nu i text (SOP-06): rå leverantörsvideo utan voiceover/text
  + textfri produktbild, båda PD, alltid ovanpå batchen. Kvar i Loom: processteg
  pt 1–3 och "what product is next"-kriterierna.

## Veckoplan

### Vecka 1 (4–10 aug): Kärnloopen körs av Axel, med systemet
- [x] System i repo: SOP-01–06, kommandon, kvotskript, CLAUDE.md
- [x] Prompter → slash-kommandon; Mastern/SnarkLös utlyft ur OS:et
- [x] Axel sätter riktiga target-CPA i `products/products.json` (5/8; Sätesöverdragaren återstår)
- [x] 2-extra-ads-regeln transkriberad in i SOP-06 (5/8). Kvar: Loom pt 1–3 +
      "what product is next"-kriterierna
- [ ] Axel kör `/cs motorholjet` (batch 4) — `/cs` bygger produktminnet från
      kontohistoriken först. Varje friktion blir en kommandoändring, committad
- [ ] Sätt upp Notion-databaserna: "Creative Tasks" + "UGC Pipeline" (SOP-03)
      och koppla Notion-MCP:n till sessionerna
- [ ] Bestäm Slack-kanalstruktur: en kanal per produkt + en för UGC

### Vecka 2 (11–17 aug): Managern kör, Axel tittar på
- [ ] Managern kör `/checkin` varje dag, Axel granskar efteråt (15 min/dag)
- [ ] Managern kör sin första `/cs`-runda med Axel i rummet
- [ ] UGC-ansvarig rapporterar enligt SOP-03; managern kör `/ugc` vid varje förändring
- [ ] Första kapacitetsmätningen: hur många creatives/dag klarar redigerarna faktiskt?

### Vecka 3 (18–24 aug): Managern kör själv, Axel svarar bara på eskaleringar
- [ ] Managern kör allt utan hjälp; Axel svarar bara i Slack
- [ ] Dashboard v1 byggs (nu — när datat och rutinerna finns): läser products.json +
      Notion + Ads Manager, visar kvotläge, redigerar-KPI:er och UGC-pipeline
- [ ] Delegationsregler: vid vilka CPA-nivåer managern själv får killa/skala

### Vecka 4 (25–31 aug): Överlämning
- [ ] Axel rör ingenting på 5 arbetsdagar; allt som ändå landar hos honom får en
      SOP eller kommandoändring
- [ ] Genomgång → sista justeringar → **31 aug: överlämnat**

## Tankar och idéer

1. **Kommandona är gränssnittet.** Managern skriver `/cs motorholjet` — inga filer
   att öppna, inget att klistra in. Varje kommando slutar med en Definition of done
   som hon bara kontrollerar är grön. "Claude lyssnar inte" attackeras från tre
   håll: regler i CLAUDE.md (läses automatiskt varje session), checklistor i
   kommandona, och SOP-05 som gör varje misstag till en kommandoändring.
2. **Minnet ligger i repot, inte i chatten.** `products/<id>/dna.md` + batch-log +
   backlog gör att vilken session som helst kan ta vid. Produkt-chatten är bekväm,
   inte kritisk — tappas den bort går inget förlorat.
3. **Feedbackloopen är inbyggd i `/cs`:** varje batchs hypoteser stäms av mot
   utfallet innan nästa batch byggs. Det är det som gör det till strategi och inte
   bara innehållsproduktion.
4. **Kvoten är en siffra, inte en ambition.** `node pipeline/quota.mjs` → 🔴 −24
   eller 🟢 +3, med färsk budget varje morgon via `/checkin`.
5. **En creative räknas vid launch, inte vid brief** — kvoten mäter det som
   spenderar pengar.
6. **Dashboarden medvetet i vecka 3** — efter två veckors `/checkin`-data finns
   något riktigt att visa.

## Möjligheter

- **Skalning utan Axel:** höjd budget → kvoten räknas upp automatiskt; flaskhalsen
  blir redigerarkapacitet, som är billig att utöka i Manila.
- **Ny produkt = `/ny-produkt`** — hela maskinen (kvot, check-in, UGC, Notion)
  funkar direkt för produkt nr 7, 8, 9.
- **Tracking-sheetet (`/sheet`) blir en flerårig databas** över vad som funkar per
  angle/format/hook.
- **På sikt:** schemalagd `/checkin` (Routine varje vardagmorgon som postar
  sammanfattningen i Slack) — managern granskar i stället för att initiera.
  Byggs när rutinen suttit manuellt 2+ veckor.

## Bottlenecks (rangordnade) och vad som är gjort åt dem

1. **Redigerarkapacitet vs kvot.** Motorhöljet ensam kräver 8/dag. → Kapacitetscheck
   i SOP-02; mät verklig kapacitet vecka 2; höj bemanning eller statics-andel.
2. **UGC-råmaterial tar slut.** → SOP-03: minst 2 deals i "Filmar" per produkt;
   `/checkin` larmar på deadlines.
3. **Claude-kvalitet varierar.** → CLAUDE.md + checklistor + SOP-05. Kvarstående:
   video-transkript kan inte hämtas via API — managern klistrar in transkript för
   vinnare/förlorare när `/forsta-batch`/`/cs` ber om det.
4. **Managern är single point of failure.** → Kommandona är så enkla att Axel eller
   VA:n kan täcka upp; på sikt schemalagd `/checkin`.
5. **Feedback-loopen mot redigerarna.** → `/checkin`-regeln: inga obesvarade
   underkännanden äldre än 1 dag, annars ingen grön dag.
6. **Target-CPA saknas per produkt.** → Axel sätter dem vecka 1.
7. **Behörigheter.** Manager + Claude behöver Ads Manager, Shopify, Notion, Slack,
   Drive (editor) — och en **Google Sheets-connector med skrivaccess** om
   tracking-sheetet ska uppdateras live av `/logga` (utan den: xlsx + import).
   Notion-MCP:n var t.ex. inte ansluten i denna session. → Kör en access-koll
   första `/checkin`; fixa allt som saknas en gång.
8. **Loom-inlåst processkunskap.** → 2-extra-ads-regeln klar 5/8; resterande
   luckor listade i SOP-06.
9. **Produkter utan produktminne.** De flesta produkter kördes igång innan OS:et
   fanns. → `/cs` steg 1b bygger `products/<id>/` retroaktivt från kontodatan
   första gången, och markerar tydligt vilka hypoteser som är rekonstruerade.

## Kända problem (fylls på löpande — se SOP-05)

- **2026-08-05 — Chattar dömde vinnare som förlorare.** Först på ROAS ensam
  ("top spendern har låg ROAS = dålig"), sedan på CPA ensam ("över target-CPA =
  dålig"). Verifierat i datan: `Motorhölje_PD_1_H3` har lägst ROAS av de
  bedömbara men står för 66 % av spenden och **51 % av allt vinstbidrag** —
  att pausa den hade halverat vinsten. Annonsen med ROAS 9,22 har ett enda köp.
  → **Åtgärdat** med `docs/os/ANALYSMETOD.md` (obligatorisk 7-stegsmetod),
  CLAUDE.md regel 3b, `break_even_cpa_sek` i products.json och nya rader i
  SOP-05:s felsökningstabell. Följ upp att nästa `/cs` faktiskt visar
  vinstbidragstabellen.
- **2026-08-05 — Databugg i Meta-API:t.** `omni_purchase_values` returnerade
  intäkten 100× för lågt på 5 av 8 annonsrader. Summering av fältet ger skräp.
  → Obligatorisk kontroll (`spend × ROAS` vs `values`) i ANALYSMETOD.md steg 1.
