# Förslag: Evolve-materialet → Skalnings kungen

**2026-09-21 förmiddag: etiketterna backfillade + 2.9 och 2.12 byggda (Axels
två rättelser).** (1) `agent/etikett-backfill.mjs` (agent-grenen) etiketterade
hela bakkatalogen ur Meta: **1 682 SE-annonser i 151 fönster (10 BREAKTHROUGH,
70 SPEND_WINNER, 170 KPI_WINNER, 869 LOSER, 563 INGEN_LEVERANS, 134
bedömbara) och 664 NO-annonser (8 BREAKTHROUGH, 42 bedömbara)** — rapport
`agent/utdata/etiketter-backfill-2026-09-21.md`. Var backfillen inte räcker:
BREAKTHROUGH kräver budgethöjning i annonsens första vecka, och den historiken
finns bara i budgetloggen (från 2026-08-28, och bara för kampanjer ronden
loggat) — 3 SE + 2 NO annonser som annars uppfyllde kravet står som
SPEND_WINNER med `osaker_breakthrough: true`, aldrig gissade uppåt.
(2) **2.9 regi rad för rad:** mallen `docs/os/BRIEF-REGI.md`, tolk + spärr i
`tools/briefgranskning.mjs` (`granskaRegi`, FEL `regi` från 2026-09-21, äldre
briefer bara anmärkning), spärrläget `--rad <brief.md>` / `--manifest
<manifest.json>` (exit 1 = ingen Notion-rad) inskrivet i rond-auto 4b,
`/cs`, `/forsta-batch`, `/notionscalercs`; mätningen rev + brief→live i
batch-log. (3) **2.12 komponenttaggar:** `typ · koncept · parent · iteration
· kalla · avatar · awareness · begar · mekanism · urgency · hook-mekanik ·
confidence` med fasta listor (`KOMPONENT_VARDEN`) + `Memo:`, i ANALYSMETOD 6b
och kommandofilerna; `utford_som_briefad` på ETIKETT-raden;
`## Komponentkarta` i dna.md vid BREAKTHROUGH; `tools/annonskommentarer.mjs`
(sidtoken ur `/<page>?fields=access_token` — användartoken ger 190/2069032)
→ `products/<id>/kommentarer.md`, kluster ≥ 3 ⇒ INVAND-variant. Avatarlistorna
per produkt är INTE skrivna (kräver produktkunskap per produkt — görs av
nästa `/cs`/`/forsta-batch` på varje produkt, aldrig gissade här). 2.5
(vidarebygg-rundan) är nästa, nu när etiketterna finns.

**2026-09-20 kväll. STATUS: fyra av tolv byggda på Axels order ("Bygg").**
Axels beslut samma dag, efter en andra bedömning av förslaget: tolv punkter
var ett program — ta fyra, kör dem, mät. Byggt, i den ordning han bad om:
**2.1** klick-attribution (mätt + steg 1 i rond-auto), **2.4** etiketten dag 7
(`agent/etikett.mjs`, steg 3c), **2.3** spendtjuven i gröna kampanjer
(`spendtjuv.mjs` grönt läge, steg 3b, med hans grind: ≥ 3 köp under
break-even eller 0 köp över 3 × break-even-CPA), **2.2 i mjuk form**
(`MANUELL_SANK`: −20 % per förlustmorgon, aldrig under 4 000, aldrig paus,
larm — kapning till 4 000 i ett steg avvisad). Dessutom regel 11 omskriven
(inte struken) och bilder bara med jobb. Namnet: A (register + Notion-fält),
byggs härnäst. Koden ligger på grenen `claude/nice-cori-n283zp-rond`
(utgår från agent-grenen `claude/daily-agent-discussion-uos5df` som rutinen
läser) — 207 tester gröna. Säsongsdatumen är inte bekräftade och inte byggda.
Resten (2.5–2.12) väntar tills etiketterna finns.

**Ursprungligt läge 2026-09-20 förmiddag: FÖRSLAG — inget byggt.**
Axels uppdrag: säg vad vi ska ändra i Skalnings kungen (`/rond-auto` på grenen
`claude/daily-agent-discussion-uos5df`) för att varje brief ska ha högre intent
och för att vi ska hitta fler breakthroughs. Källa: Axels källmaterial från
Evolve-kursen (svaren på åtta frågor, iterationsplaybooken del 1–3,
10-stegsprocessen, transkriptet "What Actually Defines a Winning Ad"), läst
mot repot.

**Axels filter (ordagrant):** "Jag optimerar vinstmarginal i dag och i morgon,
och byter ut produkten när den slutar gå. Allt som betalar sig inom veckor ska
prioriteras. Allt som handlar om produktdifferentiering, varumärkesvallgrav och
att göra annonser svåra att kopiera är riktigt men irrelevant — skriv ner det,
men lägg det sist."

**Så gjordes det:** sex läsare inventerade vad rutinen gör i dag (511 regler
med fil:rad ur rond-auto.md, agent/*.mjs, cs.md, forsta-batch.md, ANALYSMETOD,
namnkonventionen, batch-loggar och två riktiga briefer). Nio läsare mappade
materialets sektioner mot inventeringen (215 punkter: 29 gör redan, 123 delvis,
38 börja göra, 25 passar inte). En utredning grep:ade alla 28 ställen i repot
som parsar annonsnamn. En syntes rankade; en granskare öppnade ~120
fil:rad-hänvisningar (16 rättade nedan); en skeptiker rankade om efter kronor.
Sökvägar märkta **(agent-gren)** ligger på `claude/daily-agent-discussion-uos5df`,
övriga på `main`.

---

## 0. Kort svar

Budgetmotorn krockar inte med Evolve — den gör redan det kursen säger på
kampanjnivå. **Luckan är annonsnivån:** ingen annons får en etikett, ingen vet
vilken annons som bar en budgethöjning, rundans mix kommer ur en fast tabell
(1 ny per 3 varianter oavsett läge), och spendtjuvsspärren körs bara på
kampanjer som redan är på väg ner — aldrig på Taköverdraget (16 000 kr/dag).

Det som flyttar kronor inom 30 dagar, i ordning:

| # | Vad | Kronor-mekanism | Kod | Kräver Axels ja |
|---|---|---|---|---|
| 1 | Mät view-through-diffen en gång (7d_click) | Är diffen ≥ 5 % är varje SKALA/dom på 28 500 kr/dag fel i dag | 0 rader, en körning | nej |
| 2 | Säkring i manuella zonen: MANUELL_FORLUST två morgnar i rad ⇒ kapa till 4 000 kr + larm | Taköverdraget: tre dygn under break-even ≈ 48 000 kr spend som ingen rör | ~10 rader | **ja** (din zon) |
| 3 | Spendtjuven körs i ALLA kampanjer, med orsakskod | 10 % av Taköverdraget under BE ≈ 1 600 kr/dag som spärren i dag inte ser | ~100 rader | **ja** ("bara trappan får pausa") |
| 4 | Etikett dag 7 per annons + breakthrough-frekvens | Flyttar 0 kr själv — förutsättningen för 5–7 och svaret på "vet inte vår breakthrough-frekvens" | ~150 rader + tester | nej |
| 5 | Vidarebygg-rundan samma morgon som en annons blir breakthrough | Ersättare finns när vinnaren viker; i dag väntar "mata vinnaren" på kampanjhöjningar som aldrig sker över 4 000 kr | ~60 rader | nej |
| 6 | Utfallsstyrd mix + iterationskoder (parent, iteration, typ N/M/I/S) + angle board | ~800 briefer/månad styrs av utfall i stället för en fast tabell | stor | nej |
| 7 | KPI-fix på spend winners (LP-byte, proof, primärtext når kontot) | Höjer CVR på spend som redan finns; primärtexten ur briefen kastas i dag | verktyg saknas för LP-byte | nej |

Resten (hook/hold-mått, regitabell, jaktläge, produktstopp, säsong,
komponenttaggar) står i §2. Vallgrav, differentiering, AI-ansikten, Milanote,
byrå och podcast står sist i §5.

---

## 1. Vad vi redan gör (fil:rad)

| Vi gör redan | Var |
|---|---|
| En CBO per produkt; budget på kampanjnivå; ABO ger "manuell hantering" | `agent/besked.mjs:255–259` (agent-gren); mätt 2026-09-19: alla kampanjer CBO |
| Gradvis höjning +20 %, raket ×1,8, kontospärr +20 % per körning | `agent/besked.mjs:169–178`, `:22–35`; `agent/rond.mjs:279–299` (agent-gren) |
| Nedskalning när vinsten faller: zoner, HALVERA, 7 back-dygn på golvet, livstidsspärr | `agent/besked.mjs:38`, `:403–418`; `.claude/commands/rond-auto.md:180–190` (agent-gren) |
| Räkna med regression; spendfördelningen är Metas dom; top spendern är benchmark | `docs/os/ANALYSMETOD.md:150–163` |
| Signifikansgrind 300 kr / 3 köp som konstanter; deterministisk motor | `agent/besked.mjs:13–14` (agent-gren); `docs/os/ANALYSMETOD.md:53` |
| Spendandel per annons mäts — men bara negativt (tjuvgrind 10 %) | `agent/spendtjuv.mjs:45` (agent-gren); `docs/os/ANALYSMETOD.md:127` |
| Mjuka mått är diagnos, aldrig kill-skäl | `docs/os/ANALYSMETOD.md:175–178`; `cs.md:77`; `forsta-batch.md:24` |
| Teardown med hypotes om VARFÖR; bevisad/hypotes; domar på 3–4 köp preliminära | `docs/os/ANALYSMETOD.md:180`, `:235`, `:80–82` |
| Tre-frågorstestet på varje svensk rad, ❌ går inte ut | `docs/copy-regler.md`; `rond-auto.md:363–365` (agent-gren) |
| Strategisten är huvudsessionen, sonnet skriver bara text, rutinen gör aldrig annonserna | `cs.md:91`; `rond-auto.md:373–374` (agent-gren) |
| Minnet dna/batch-log/backlog läses och pushas med loggraden | `cs.md:21–27`, `:98`; `rond-auto.md:461` (agent-gren) |
| Hela briefen i Notion-itemet, på engelska | `rond-auto.md:443`, `:455` (agent-gren) |
| Vinkel, format, proof m.fl. taggas och grupperas på vinstbidrag | `docs/os/ANALYSMETOD.md:204–213` |
| Namnschema `Prefix_KONCEPT_ADID_VARIANT`, AD-ID läses av i kontot | `forsta-batch.md:52`; `briefgranskning.md:102` |
| 3 variationer per vinnare; kostnad-av-att-vänta som statiskt koncept | `forsta-batch.md:43`, `:45` (FAS 7, FAS 9) |
| Shot list med tidskoder och text-overlays KRÄVS — men ingen spärr mäter det | `forsta-batch.md:48`; `tools/briefgranskning.mjs` fäller bara "video utan manus" |
| Briefpaus per produkt finns (`brief_paus_till`) | `agent/rond.mjs:114–118` (agent-gren) |
| 7-dagarslärdom + fyra frågor per brief är redan beslutat — som chatt-text | `docs/ecomtalent/SVAR-INTENT.md:27–30`, `:47–50` (inte kod) |

Rättat efter granskningen: fem "gör redan" som syntesen först hade stämde
inte — uppladdning i befintlig kampanj är `/notionkorning`:s undantag
(CLAUDE.md, gäller ENBART den rutinen), "ingen formatsplit" motsägs av
`rond-auto.md:348–351` (minst 2/3 video), "AOV-separerade kampanjer" är
motsatsen till `agent/README.md:155–158`, feedback.md läses bara av
OPS-nattvakten (`notionscalercs.md:190`), och `docs/creative-strategy.md` är
Grillklinikens legacydokument, inte en Bäver-regel.

---

## 2. Börja göra — rankat efter vinst inom 30 dagar

Varje punkt: REGEL (kodbar) · MÄT · SKRIV · VAR · KÄLLA · PENGAR · KROCK ·
FÖRLORAS · KOSTNAD.

### 2.1 Mät view-through-diffen en gång, döm sedan på 7d_click om den är ≥ 5 %
- **REGEL:** En körning: för de ~10 aktiva SE-kampanjerna hämta `purchase_roas`
  last_7d två gånger — kontots standard och `action_attribution_windows:
  ['7d_click']` — och skriv diffen per kampanj. Alla < 5 % ⇒ "view-through
  försumbar, mätt <datum>" i `agent/README.md`, klart. Någon ≥ 5 % ⇒ rond-auto
  och etikettmodulen hämtar alltid ROAS/köp med `7d_click`, skriver
  `roas_klick` bredvid `roas_3d`, och `besked()` dömer på `roas_klick`.
- **MÄT:** ROAS + köp per kampanj i båda fönstren; diff i procent.
- **SKRIV:** fält `roas_klick`, `attribution: '7d_click'` i `kontodata.json` och
  loggraden; raden "attribution: 7d click" i rapporten.
- **VAR:** `rond-auto.md` steg 1 (tre anrop), `agent/rond.mjs bedomKampanj()`,
  `agent/README.md`.
- **KÄLLA:** §9 [18:24–20:37]: adset 3,23 → 1,33 på klick, kampanj 1,78 → 1,57.
- **PENGAR:** Blåser view-through upp Taköverdragets 4,31 med 10 % är skalnings-
  och etikettbesluten fel varje dag på kontots största kampanj. Är diffen liten
  kostade det en körning.
- **KROCK:** ingen. `besked.mjs:51` antar redan 7 dagars klickfönster.
- **FÖRLORAS:** jämförbarhet bakåt i budgetloggen om `roas_3d` byter betydelse —
  löses med nytt fält, gamla kvar.
- **KOSTNAD:** en parameter i tre anrop + ett fält. Verifiera först att
  MCP-anropet tar `action_attribution_windows` (`ads_get_field_context`).
- **MÄTT 2026-09-20 (läs-bara, `META_ACCESS_TOKEN`, last_7d, aktiva kampanjer):**
  SE-kontot 154 880 kr spend, ROAS default 3,06 mot 7d_click 3,00 — diff
  **1,7 %** totalt. NO-kontot 63 453 kr, diff **0,0 %**. Tio av fjorton
  SE-kampanjer (inkl. Taköverdraget 71 309 kr, 3,51/3,51) har default = klick,
  alltså är deras attribution redan 7d click. Fyra kampanjer räknar in
  1d_view: **Fiskespöhållaren 2,01 → 1,64 (18,6 %, BE 1,50)**, IBC-Tanköverdraget
  2,25 → 2,09 (7,1 %), Båtmotorskyddet 3,75 → 3,55 (5,4 %), Bälteslipmaskinen
  3,08 → 3,00 (2,5 %). Slutsats: view-through är försumbar på kontonivå men
  över 5 % på tre kampanjer — motorn bör döma på `7d_click` för alla (en
  parameter), så att Fiskespöhållaren inte skalas på ett tal som ligger 18 %
  över det klickbaserade. Skript: `viewthrough.mjs` (scratch, ej i repot).

### 2.2 Säkring i den manuella zonen (Axels beslut — inte ur materialet)
- **REGEL:** Budget över 4 000 kr (`MANUELL`): `MANUELL_FORLUST` två morgnar i
  rad ⇒ kapa till motorns tak 4 000 kr samma morgon + Discord-larm; aldrig
  paus. Under 4 000 gäller trappan som vanligt.
- **MÄT:** samma domkoder som i dag (`agent/besked.mjs`, manuella zonen).
- **SKRIV:** loggkod `MANUELL_KAPAD` med gammal → ny budget; larm i `larm`.
- **VAR:** `agent/besked.mjs` (~10 rader), `rond-auto.md:394–400` (agent-gren).
- **KÄLLA:** inte Evolve — Evolve säger tvärtom tålamod med breakthroughs
  (§5 rad 236–244). Detta är Axels egen modell "optimera i dag och i morgon".
  Kapning till 4 000 håller annonsen vid liv, vilket är Evolves krav.
- **PENGAR:** Taköverdraget 16 000 kr/dag: viker den (säsong eller trötthet)
  kostar tre dygn under BE ~48 000 kr spend innan en människa reagerar. Störst
  30-dagarsexponering i hela kontot, och rutinen rör den aldrig i dag.
- **KROCK:** rond-auto.md:394–400 "ingen budget ändras av ronden" — Axels
  beslut 2026-09-19.
- **FÖRLORAS:** två förlustdygn på en breakthrough som skulle studsat tillbaka
  (Evolve: "let it have a bad week") — därför kapning, inte paus, och två
  morgnar, inte en.
- **KOSTNAD:** ~10 rader + test. **Axels ja krävs.**

### 2.3 Spendtjuven körs i alla kampanjer, med orsakskod; nåd för breakthroughs (kräver 2.4)
- **REGEL:** Varje morgon på ALLA aktiva kampanjer med ≥ 1 000 kr spend_3d
  (även LAT_VARA/SKALA/manuell zon): annons som uppfyller de fyra tjuvgrindarna
  (andel ≥ 10 %, ≥ 300 kr, ROAS_3d < BE × 0,9, dränering ≥ 500 kr) pausas och
  loggas `TJUV_PAUSAD` — egen kod, förbrukar inte räddningstaket 3/14 d.
  Undantag (först när etiketten finns, 2.4): annons med etikett BREAKTHROUGH
  senaste 14 d OCH livstids-ROAS ≥ BE pausas först vid dränering_7d ≥ 3 ×
  BE-CPA eller 5 back-dygn i rad — tills dess `VANTA_BREAKTHROUGH` per dygn,
  och är den enda tjuven blir domen `ROR_INGENTING`, aldrig `STANG_AV` på hela
  kampanjen. Annons < 7 dygn gammal undantas om dräneringen < 1 000 kr. Varje
  pausad tjuv som inte är trött vinnare får orsakskod i fast ordning:
  `SIDGLAPP` (pris/löfte ≠ landningssidan) → `TRUST` (proof=inget) → `URGENCY`
  → `PRIS`. Pausad tjuv med etikett SPEND_WINNER ⇒ Fokus "KPI-fix på <namn>"
  (2.7), inte "ersätt materialet".
- **MÄT:** samma ad-nivåanrop som trappan gör i dag (last_3d), men för alla
  kampanjer; för trötta vinnare last_7d + dygnsserie; `roas_livstid`.
- **SKRIV:** loggrader `TJUV_PAUSAD {annons, spend, roas, dränering, orsak}`,
  `VANTA_BREAKTHROUGH`; leveransen "Thieves paused in green campaigns: …";
  Discord-larm vid paus av en breakthrough.
- **VAR:** `agent/spendtjuv.mjs` (ny dom `TJUV_I_GRON`, konstanter, orsakslogik),
  `rond-auto.md:260–263` (agent-gren) skrivs om, `agent/rond.mjs:435`.
- **KÄLLA:** §1 [C4] rad 47 (döda underpresterande i grön CBO så budgeten går
  tillbaka till vinnarna), [C8] rad 65 (bästa annonser dör i tre dagar — vänta),
  §5 rad 236–244 (misstag nr 1: stänga av breakthrough), §9 [31:05–32:09].
- **PENGAR:** en tjuv på 10 % av Taköverdraget = 1 600 kr/dag under BE, tre
  dagar ≈ 3 000 kr per tjuv som ingen ser i dag. Nåden kostar högst 3 × BE-CPA.
- **KROCK:** `rond-auto.md:260–263` "Bara trappan får pausa annonser" (medvetet
  designval); CLAUDE.md 2026-09-15 "en annons som redan är live stängs aldrig
  av i efterhand … aldrig ett skäl att pausa något som spenderar" (skriven för
  leveransrundans prisfel, men ordalydelsen är bred); `spendtjuv.mjs:182–187`
  pausar trötta vinnare på en 3-dygnsdipp — Evolve säger 7 dagar.
- **FÖRLORAS:** upp till ~4 dygns extra dränering på en riktig trött
  breakthrough (takad); enkelheten i spendtjuv-rapporten. Redigerarnas
  commission räknas på spend (`commission/berakning.mjs:17`, 0,4 %) — pausade
  tjuvar sänker den något.
- **KOSTNAD:** ett Meta-anrop till per kampanj och morgon; ~100 rader + tester.
  Tjuv-i-grön kan gå live utan etiketten; nåden och KPI-fix-fokus kräver 2.4.
  **Axels ja krävs.**

### 2.4 Etikett dag 7 per annons + breakthrough-frekvens (Axels lucka 3) — förutsättning
- **REGEL:** Nytt steg 3c i rond-auto (efter spendtjuvsspärren, före 4b), per
  ACTIVE kampanj i SE och NO: hämta annonslistan (`id, name, created_time,
  adset_id`) och etikettera varje annons med `created_time ≤ idag − 7` som
  saknar `ETIKETT`-rad. Fönstret är annonsens EGNA första vecka [D0, D0+6],
  level ad + kampanjen i samma fönster (aldrig last_7d). `andel =
  spend_ad / spend_kampanj`. `budget_hojd` = SKALA/RAKET genomförd i [D0, D7]
  i budgetloggen ELLER `gammal_budget` dag 7 > dag 0 (fångar Axels manuella
  höjningar — enda spåret av dem). Etiketter med Evolves trösklar för
  0–100 k$/månad (alla Bäverkampanjer ligger där): `INGEN_LEVERANS` spend
  < 10 kr · `BREAKTHROUGH` andel ≥ 0,30 OCH budget_hojd **OCH roas_ad ≥ BE**
  (KPI-kravet — annars blir frekvensen uppblåst) · `SPEND_WINNER` andel ≥ 0,30
  utan höjning · `KPI_WINNER` andel < 0,30, ≥ 1 köp, roas_ad ≥ roas_kampanj ·
  `LOSER` resten. Två fält bredvid: `bedombar` (≥ 300 kr OCH ≥ 3 köp) och
  `preliminar` (3–4 köp). **Dom, kill, skala, DNA och iterationsplaybook
  kräver `bedombar`; etiketten beskriver bara vad Meta gjorde.** Append-only,
  ändras aldrig utom uppgradering dag 14/28 till BREAKTHROUGH. BOF-koncept
  etiketteras men räknas inte i frekvensens nämnare. Speglade/NO-annonser
  etiketteras i sin egen kampanj och sitt eget konto. Breakthrough-frekvens =
  BREAKTHROUGH / alla etiketterade (inkl. INGEN_LEVERANS och LOSER), per produkt
  och batch, per konto, alltid skrivet "3/21 (14 %)", aldrig procent ensam
  under 10 annonser. Larm: "BREAKTHROUGH för > 14 dygn sedan utan ny och < 3
  iterationer".
- **MÄT:** per annons spend, köp, ROAS (7d_click om 2.1 säger så), impressions,
  `actions:video_view`, `video_thruplay_watched_actions`, `created_time`,
  budget dag 0/7, CBO/ABO. Annonser med samma D0 delar anrop.
- **SKRIV:** loggrad kod `ETIKETT` i `agent/budgetlogg.jsonl` (aldrig
  `ny_budget` — kadensspärren); kolumn "Etikett (7 d) · andel · bedömbar" i
  `products/<id>/batch-log.md` samma morgon (inte av nästa /cs — `cs.md:98`
  är luckan som lät batch #2 stå utan dom); Notion select `Outcome` **bara när
  bedombar=true**, annars "Not enough data" (regel 3 gäller också mot människor
  — en LOSER-etikett på redigerarens rad med 40 kr spend är fel); rapport +
  Discord "Labels today" + frekvens per produkt.
- **VAR:** ny `agent/etikett.mjs` (ren räkning, tester som besked.mjs),
  `rond-auto.md` steg 3c, `agent/logg.mjs` (koder), `products/<id>/batch-log.md`,
  Notion-fältet via `tools/notion-brief.mjs`-vägen. dna.md rörs INTE av etiketten.
- **KÄLLA:** §9 [1:34–2:28], [3:40–4:18], [5:04–5:35], [8:22–9:36], [12:55–13:05];
  §8 Steg 2; §3 [D1] rad 117–125; §1 [D3] rad 25–29.
- **PENGAR:** flyttar 0 kr själv. Är triggern för 2.3 (nåd), 2.5, 2.6 och 2.7,
  och det enda som kan svara på "är 8 briefer per runda rätt tal".
- **KROCK:** `ANALYSMETOD.md:47–58` (grinden) + `:54` ("inga slutsatser om hook
  eller vinkel" under 3 köp) — löst med två fält; `cs.md:98` (utfallet skrivs
  av nästa /cs); SVAR-INTENT:s "levande vinnare ≥ 3 köp/7 d" ersätts så vinnare
  bara har EN definition; de fyra skalningsprodukternas hubbar är ARKIVERADE
  — ett anrop måste visa att Outcome-fältet går att skriva där.
- **FÖRLORAS:** fritextdomarna i batch-log ("Volymdrivare", "Bevisad vinnare")
  ersätts av fem fasta ord — nyanserna får stå som kommentar. Historiska
  annonser före 2026-09-04 får ingen etikett (loggen börjar 2026-08-28).
- **KOSTNAD:** ~150 rader + tester; 1–3 Meta-anrop per kampanj och dag; ett
  select-fält per hub. Effort **L** (rör 10+ filer, Notion-schema, Discord).

### 2.5 Vidarebygg-rundan samma morgon som en annons blir breakthrough
- **REGEL:** När en annons får BREAKTHROUGH första gången — eller
  `BREAKTHROUGH_KANDIDAT` på 3 dygn (andel ≥ 30 %, ≥ 3 köp, ROAS_3d ≥ BE och
  budgeten höjdes, av motorn eller av Axel) — skapas behovet `vidarebygg` SAMMA
  morgon, rang 0 som `forsta_batch`, utan 3-dagarsklockan. Rundan = minst 3
  iterationer på just den annonsen (I1 tre hookar, I2 PROBLEM+, I3 in media
  res), 80 % varianter med `parent=<namn>`, 20 % nya vinklar. Stående vakt:
  ACTIVE BREAKTHROUGH med < 3 iterationer launchade senaste 14 d ⇒ nytt behov;
  ≥ 3 utan att någon nått KPI_WINNER ⇒ larmrad "iterationerna på <namn>
  träffar inte — byt komponentnivå". Rundan ERSÄTTER nästa `brief_runda`.
- **MÄT:** första ETIKETT-raden med BREAKTHROUGH per ad_id; antal
  batch-log-rader med `parent=X` senaste 14 d; kandidaten ur samma
  ad-nivåanrop som spendtjuvsjobbet.
- **SKRIV:** behovsrad `{typ:'vidarebygg', parent, mix, iterationer}`; loggkod
  `VIDAREBYGG_KLAR` (aldrig `ny_budget`); rapportrad "Breakthrough <namn>: N
  iterationer/14 d, bästa: <etikett>".
- **VAR:** `agent/rond.mjs annonsbehov()` (ny typ; kadensen `:399` hoppas över
  för typen), `agent/spendtjuv.mjs` (export `vinnare` bredvid `tjuvar`),
  `rond-auto.md` 4b, `cs.md` steg 3.
- **KÄLLA:** §8 Översikt ("99,9 % ny breakthrough inom 1–2 veckor"), Steg 2
  (börja dag 2–3), Steg 10 ("vi itererade två gånger på en månad"); §5 rad
  214–216; §1 [C4] rad 39 (80/20).
- **PENGAR:** i dag väntar "mata vinnaren" (`rond.mjs:436–437`) på två
  KAMPANJ-skalningar/vecka — som aldrig sker över 4 000 kr. Kontots största
  annons har noll riktade ersättare på väg. Realistiskt EN cykel på 30 dagar
  (brief → Manila → live → 7 d), därför impact 3, inte 5.
- **KROCK:** `rond.mjs:399` (≥ 3 dagar mellan batcher); `rond-auto.md:388–393`
  (rundaAntal-tak); SVAR-INTENT "max 5 koncept/vecka" (iterationer räknas
  separat); `rond.mjs:436–437` "mata vinnaren" blir överflödig.
- **FÖRLORAS:** jämn 3-dagarstakt för den produkten (en runda tidigare, nästa
  senare); begränsat till 3 extra briefer per breakthrough per 14 d.
- **KOSTNAD:** ~60 rader + text. Kräver 2.4.

### 2.6 Utfallsstyrd mix, iterationskoder och angle board (ersätter den fasta 1-ny-per-3)
- **REGEL:** Rundans platser fylls i fast ordning ur produktens etiketter:
  (1) BREAKTHROUGH utan 3 iterationer/14 d ⇒ I1–I3; (2) SPEND_WINNER med ROAS
  < kampanjens ⇒ 1 KPI-fix (2.7), aldrig ny hook; (3) KPI_WINNER (ej BOF) ⇒ 3
  hookar, allt annat lika; (4) LOSER typ N ⇒ 1 komponent-iteration (idén kan
  ha varit rätt, utförandet fel); LOSER typ M/I ⇒ 0 ("losers itereras aldrig");
  (5) resten nya koncept. Ingen levande vinnare ⇒ jaktläge (2.10). Stege per
  förälder, en per runda: I1 = 3 hookar med 3 olika hooktyper (hook = hela
  0–3 s: bild + text + rad) → I2 = PROBLEM+ (problemdelen 8–12 s, ≥ 2 nya
  smärtpunkter med källa) → I3 = IMR (samma fil omklippt, demon först, 30 min)
  → formatkarta (VO↔text, native-statisk med manuset som primärtext, lång
  45–90 s, jämförelse-statisk, äkta UGC-återskapning 2 creators × 3 videor,
  kompilation vid ≥ 2 vinnare) → komponentluckor (proof/urgency/LP/mekanism
  = "ingen") → awareness-granne → avatar → invändning ur kommentarerna →
  negativ framing (en per produkt/30 d). Högst 3 H-varianter per (ADID, body),
  2 bodies per ADID i samma rond. Efter 3 hookvarianter som inte nått
  förälderns ROAS × 0,9 ⇒ "hook förbrukad". Efter 3 rundor utan variant ≥
  förälderns vinstbidrag/1 000 kr ⇒ uttömd, föräldern tas ur "mata". **Typ
  N/M/I sätts mekaniskt ur angle boarden:** mappar idén till en listad
  vinkel + avatar i `dna.md` är den I, annars N; swipe är alltid M. Varje
  batch avslutas med `## Åtgärdsplan batch #N`: exakt tre rader
  ITERERA / ÖVERFÖR / UNDVIK som blir Fokus i nästa behovsrad; rond-auto
  vägrar logga `*_KLAR` för N+1 om N har etiketter men ingen åtgärdsplan.
- **MÄT:** etiketter; antal iterationer per parent (14 d); vinstbidrag/1 000 kr
  variant mot förälder; antal H per (ADID, body) i hubben + kontot.
- **SKRIV:** behovsrad `mix:{…}` + orsak med annonsnamn per post;
  VARIABELTAGGAR `typ=N|M|I|S`, `parent=<namn>`, `iteration=HOOK|PROBLEM+|IMR|
  KOMP:<x>|AWARE|INVAND|NEGRAM|AVATAR:<slug>|format:<x>`; dna.md "Formatkarta
  <namn>" + "Iterationer per vinnare"; åtgärdsplan-blocket; briefens rad
  "Earlier iterations on this parent: …" (engelska).
- **VAR:** `agent/rond.mjs annonsbehov` (ersätter fokus-strängen `:402–404`
  och `annonskvot :489–495`), `rond-auto.md` 4b, `cs.md` steg 3,
  `tools/briefgranskning.mjs` (FEL vid dubblett-iteration, variant utan kod),
  `docs/naming-convention.md` (vokabulären).
- **KÄLLA:** §8 Steg 3, 6, 9, 10; §6 #1–#9; §7 #1, #2, #4, #10, #11, #15; §3
  [D1 Step 6], [D3] rad 131–132, 146–149; §1 [C7] rad 37, [C3][C1][D3] rad 39,
  [C1] rad 55 (angle board).
- **PENGAR:** ~8 briefer × ~10 produkter × 10 rundor/månad styrs om från en
  fast tabell till utfall. Egen data: motorhöljets batch #3 gav alla köp från
  nya koncept, noll från hook-iterationer (`products/motorholjet/batch-log.md:88–90`).
  IMR och PROBLEM+ kostar 30 min resp. en Sonnet-körning på annonsen som redan
  bär spenden.
- **KROCK:** `rond.mjs:489–495` (Axels fasta "1 ny per 3"), `factory/kadens.mjs`
  (50/50, rotation) och SVAR-INTENT:s 80/20 — tre mixar blir en; `cs.md:83`
  "alla väntande backlog-items" blir prioritetsordning; `forsta-batch.md:43`
  tredelning; §7 #2 Lukas Pakter "kopiera top winner ord för ord" krockar med
  SVAR-INTENT "aldrig en ren kopia" — vi behåller SVAR-INTENT.
- **FÖRLORAS:** förutsägbar mix för redigerarna (totalen oförändrad);
  rotationens garanti att angle/format testas varje rond (behålls efter
  I1–I3); ett backlog-item kan vänta en runda.
- **KOSTNAD:** stor (rond.mjs, kadens.mjs, fem kommandofiler, granskningen).
  Kräver 2.4 och registret (§4.1). Effort **L**.

### 2.7 KPI-fix på spend winners: LP-byte, proof, kostnad-av-att-vänta; primärtexten når kontot
- **REGEL:** SPEND_WINNER med ROAS_7d < kampanjens (eller pausad som tjuv med
  den etiketten): hämta `inline_link_clicks`/`ctr`; CVR < kampanjens och CTR ≥
  kampanjens ⇒ "Diagnos: konvertering", annars uppströms (2.8). Fixordning, EN
  hävstång per variant, hook låst: (1) LP-byte — samma creative, ny länk till
  den listicle som bär annonsens vinkel (produktsida = pris/demo,
  -anledningar = benefit, -vi-testade = proof, -lagerrensning = offer), nytt
  annonsnamn, mät CVR 7 d; (2) proof — ordagrant recensionscitat/demo när
  proof-taggen är "inget"; (3) kostnad-av-att-vänta — finns redan som koncept
  (`forsta-batch.md:45` FAS 9), här som iteration på en spend winner; (4)
  insats i kronor/timmar/skada. Varje brief anger landningssida som bär samma
  vinkel (`lp=`). Varje bildbrief bär exakt EN claim och egen primärtext i
  COPY CARD; uppladdaren sätter `message` ur COPY CARD och läser tillbaka.
- **MÄT:** CVR = köp_7d / klick_7d, CTR_7d, annons mot kampanj; proof-/lp-tagg;
  tillbakaläst `link_data.message` mot COPY CARD.
- **SKRIV:** batch-log "SPEND_WINNER_LAG · Diagnos: konvertering · Fix: lp|proof|
  urgency|stakes"; briefens hypotesrad "Fix: <hävstång> på <förälder>"; taggar
  `lp=`, `urgency=`, `stakes=`, `claim=`.
- **VAR:** `agent/etikett.mjs` (klick/CVR), `cs.md` steg 2–3, `forsta-batch.md`
  LEVERANSFORMAT, `tools/notion-till-meta.mjs` + `tools/ops-till-meta.mjs`
  (message ur COPY CARD + tillbakaläsning; **nytt verktyg** för "duplicera
  annons med befintligt video_id/image_hash och ny länk" — finns inte i dag,
  båda uppladdarna tar en FIL).
- **KÄLLA:** §1 [D1] rad 29–35 (belief/urgency/stakes/funnel-kongruens), [C2]
  rad 35 (kirurgi, inte ombyggnad), [C1] rad 52; §6 #3; §9 [7:25–7:53].
- **PENGAR:** riktar sig mot spend som redan finns: en spend winner på 30 % av
  Taköverdraget ≈ 4 800 kr/dag; 10 % högre CVR där ≈ 1 500 kr/dag i
  bruttovinst utan ny budget. Primärtexten är den enda del av varje brief som
  i dag kastas tyst (`products/motorholjet/dna.md:15–20`). Den nya annonsen
  måste dock vinna spend igen i CBO:n — inte gratis.
- **KROCK:** kontots autofyll av primärtext per vinkelprefix
  (`motorholjet/dna.md:15–20`); `rond-auto.md:350–351` (högst två statiska per
  runda — native tar en plats). "No urgency of any kind" finns bara i
  OPS-briefer (CaraShell brief.md:78) — Bäverbutiken har ingen sådan hard rule,
  så kostnad-av-att-vänta kräver inget beslut här.
- **FÖRLORAS:** enhetlig, skalbevisad primärtext per vinkel ersätts av briefad
  text — bara på rader med COPY CARD.
- **KOSTNAD:** S för diagnos/taggar; M för message-vägen (~60 rader); M för
  LP-byte-verktyget. Listiclarna kräver `/listiclar` per produkt där de saknas.

### 2.8 Hook/hold-måtten nu (S); diagnosregeln efter 30 dagars mätning
- **REGEL nu:** `hook_rate = 3-sekundersvisningar / impressions`, `hold_rate =
  thruplay / impressions`, `hook_to_hold = thruplay / 3 s` — porteras från
  `factory/skalning.mjs:144–150` (som redan räknar så för OPS) till
  `ANALYSMETOD.md:24, :169–170` och `cs.md:70`. Autoplay-måttet (89–95 % på alla
  videor, `motorholjet/dna.md:189`) får aldrig stå i kolumnen Hook. Mjukgrind
  BARA för diagnos: hook vid ≥ 1 000 visningar, hold/h2h ≥ 100
  3-sekundersvisningar. Vinstgrinden 300/3 gäller oförändrad för ranking, dom,
  kill. Kontots spendviktade snitt + top spenderns värden räknas varje körning;
  kursens 20/25/45 % hook och 4/5/14 % hold som "extern referens" tills ≥ 5
  videor mätta.
- **REGEL efter 30 d:** flopp (0–2 köp eller ROAS < BE, över mjukgrinden):
  hook < 0,8 × snitt ⇒ `HOOK` — samma body, 3 nya hookar med annan hooktyp;
  hook ≥ snitt och h2h < 0,8 × snitt ⇒ `HOOKFÄLLA` — ny kvalificerande hook,
  aldrig omskriven body; båda ≥ snitt men inga köp ⇒ `OFFER/PUBLIK` — hook
  låst, byt offer/proof/avatar/LP (2.7). Hookar ordagrant (text + VO) skrivs
  i etikettraden; BREAKTHROUGH-hookar in i `docs/winning-lines.md`.
- **VAR:** `docs/os/ANALYSMETOD.md` steg 0/2/6, `cs.md`, `factory/skalning.mjs`
  (döp om nuvarande `hold` → `hook_to_hold`, nytt `hold_rate`), `docs/playbook.md:14–25`
  (branschtabellen ersätts av mätta kontosnitt med datum och n).
- **KÄLLA:** §4 [D6], [C2] (måtten), [D7], [C6] (riktvärden), [D1]
  (small-spend-fällan), [C3][D2] (Hook Trap), [C5] (steg 3), [D3] ("98–99 %
  hooken"); §8 Steg 4.
- **PENGAR:** ~250 annonser launchas på 30 dagar, merparten floppar och går till
  "Ingen dom". Utan mått som skiljer annonser åt kan ingen diagnosregel köras.
  "5 räddade per månad" är en gissning — därför mätning först.
- **KROCK:** `ANALYSMETOD.md:54` förbjuder ordagrant slutsatser om hook under
  3 köp — mjukgrinden ger bara diagnos, aldrig ranking; `:169–170` ("låg hold =
  manuset") stämmer inte med kursen ("bad hold = bad hook").
- **FÖRLORAS:** jämförbarhet bakåt med motorhöljets hold-p50-serie — behålls
  som separat fält.
- **KOSTNAD:** S (~30 rader + doc) nu; diagnoskoden ~30 rader senare. Verifiera
  MCP-fältnamnet för 3-sekundersvisningar med `ads_get_field_context` först.

### 2.9 Visuell regi rad för rad med spärr (Axels lucka 2)
Kravet finns redan (`forsta-batch.md:48`: shot list med tidskoder, exakta
text-overlays, editing direction) — ingen spärr mäter det. Se §4.2 för mallen.
- **REGEL:** varje videobrief får EN regitabell med EN rad per manusrad;
  `tools/briefgranskning.mjs` fäller FEL `regi` när en cell saknas; rond-auto 4b
  kör `node tools/briefgranskning.mjs --rad <fil>` på varje egen videobrief
  INNAN Notion-raden skapas. Mät samtidigt rev (antal "In progress 2") och
  dagar→live per annons från dag 1 — annars finns ingen före-siffra.
- **PENGAR:** mekanismen är tid brief → live: varje revisionsrunda kostar ett
  Manila-dygn, och en annons som inte är live kan inte bli breakthrough. Effekten
  går inte att bevisa om 30 dagar utan före-siffran.
- **KROCK:** CLAUDE.md regel 6 (sonnet skriver bara text ⇒ regi = huvudsessionens
  jobb, ~3× längre att skriva); kursens "no text on hooks" mot Bäverbutikens
  tysta feed (captions bär budskapet) — behåll text som standard.
- **KOSTNAD:** mall + ~80 rader kontroll + tester (M).

### 2.10 Jaktläge utan levande vinnare
- **REGEL:** `harLevandeVinnare` = bedömbar BREAKTHROUGH/SPEND_WINNER senaste
  14 d. Saknas den: varje brief är typ N och skrivs som hel enhet (sub-avatar +
  vinkel + hook + bild kongruenta) — "en isolerad variabel" gäller inte, H1–H3
  på samma koncept har tre olika hooktyper; mix 80 % nya (70 % vid platå);
  nytt koncept testas först som statisk (kie.ai, 0 redigerartid) och får video
  först när statiken är validerad (≥ 300 kr, ROAS_7d ≥ BE); nya annonser går
  i produktens CBO utan min-budget; annons < 30 kr på 7 dygn ⇒ `INGEN_LEVERANS`
  = förlorare, aldrig ABO. **Regel 11 (test-ABO) stryks** — den följs inte i
  drift och kursens data (36 av 42 svultna annonser dog i ABO) säger att
  svält är Metas dom. **Bild-extra (+3 BOF, +2 review) skrivs bara med ett
  jobb**; BOF-serien behålls bara om produktens senaste BOF-etiketter har ≥ 1
  KPI_WINNER.
- **VAR:** `agent/rond.mjs annonskvot :489–495` (`nyaKoncept = harLevandeVinnare
  ? 20 % : 80 %` — `factory/kadens.mjs:58` gör redan så för OPS),
  `rond-auto.md:348–362`, `forsta-batch.md:21`, `briefgranskning.md:105–110`
  (+ regexändring i `tools/briefgranskning.mjs` så jakt-briefer inte får
  anmärkning för saknad isolerad variabel), CLAUDE.md regel 11,
  `products/motorholjet/batch-log.md:64–66` (svältlärdomen skrivs om från
  processfel till förväntat utfall — OBS: CLAUDE.md:s citat "Mönster 5 i
  motorhöljets DNA" är inaktuellt, dna.md mönster 5 är Karusell).
- **KÄLLA:** §1 [D2] rad 36 (stora svängar före vinnare — envariabeltester
  dödade hit rate), [D2] rad 52 (statics validerar billigt), [D3] rad 54,
  [C5] rad 52 ("most of them are shit"); §4 [D5]; §9 [21:50–27:35] + §10.
- **PENGAR:** sparad testspend (≤ 300 kr × 5 bilder × ~10 produkter per runda)
  och kie-credits; regel 11-strykningen är 0 kr (följs inte redan). Impact 2.
- **KROCK:** `forsta-batch.md:21`, `naming-convention.md:107`,
  `briefgranskning.md:105–110` kräver isolerad variabel oavsett fas; Axels
  +5 bilder "bara för att" (`rond-auto.md:352–362`); Axels "minst två
  tredjedelar video" (`:348`).
- **FÖRLORAS:** de fem garanterade extrabilderna per batch; envariabelkollen
  på testprodukter (mäter i dag inget — ingen förälder att isolera mot).
- **KOSTNAD:** S. **Regel 11 och +5-bilderna är Axels egna beslut.**

### 2.11 Produktstopp, vinkeltak, platå och säsongsfält
- **REGEL:** `PRODUKTPROBLEM`: ≥ 12 etiketterade annonser (≥ 7 dygn, ≥ 300 kr
  var) och 0 KPI_WINNER/SPEND_WINNER/BREAKTHROUGH ⇒ `brief_paus_till = idag +
  30 d`, engelskt larm "<produkt>: 12 ads labelled, 0 winners — product, not
  creative. No more briefs." Budgetronden fortsätter. 6–11 losers och 0 vinnare
  ⇒ Fokus "byt avatar/begär/awareness". `VINKELTAK`: ≥ 20 typ N utan levande
  vinnare ⇒ ny pain point med VoC-källa krävs; finns ingen ⇒ 0 briefer,
  leveransen skriver "Rekommendation: byt produkt". `PLATÅ`: två rundor utan
  variant ≥ förälderns vinstbidrag ⇒ mix 70 % nya. **Säsong:**
  `produktkarta.json` får `sasong:{start,slut}` per produkt (ägarens fält);
  inom 21 dagar före slut inga vidarebygg-rundor, och nedskalning/avstängning
  får orsak "säsong — starta om <start>" i stället för trappan.
- **VAR:** `agent/rond.mjs annonsbehov` (spärr före brief_runda),
  `agent/etikett.mjs`, `agent/produktkarta.json`, `agent/discord-post.mjs`.
- **KÄLLA:** §9 [10:56–11:14] (losers blir aldrig breakthroughs över 150 M$),
  [33:28–33:44]; §1 [C1][C2] rad 65; §8 Steg 10 ("30 iterationer utan vinnare");
  §5 rad 286–290 (säsong).
- **PENGAR:** sparad testspend och redigerartid — men redigerarna får commission
  på spend, inte per brief, så det är ≤ 300 kr per annons som sparas. Gör
  "byt produkt när den slutar gå" mätbar i stället för en känsla. Impact 2.
- **KROCK:** CLAUDE.md regel 5 + SOP-02 (kvoten = mål nr 1) — kvoten blir golv,
  inte mål; Axel 2026-09-02 "hellre några briefs för mycket".
- **KOSTNAD:** ~40 rader spärr + ~40 rader säsong. Axel skriver säsongsdatum.

### 2.12 Komponenttaggar, avatarlista, kommentarer på top spendern (intent per brief)
- **REGEL:** VARIABELTAGGAR utökas bakåtkompatibelt: `typ=N|M|I|S`, `parent=`,
  `iteration=`, `kalla=axel|rutin|swipe|voc|feedback|backlog`, `avatar=<slug ur
  dna.md-listan, max 4 per produkt, med citat/butiksdatum som källa>`,
  `awareness=unaware|problem|solution|product|promo`, `begar=<fast lista>`,
  `mekanism=`, `urgency=säsong|lager|pris|konsekvens|ingen`, `hook-mekanik=
  none|reverse|slow-mo|slider|zoom-in|cut-in|freeze`, `confidence=high|medium|
  low` + datareferens, `koncept=<namn>` (Evolve räknar iterationer per KONCEPT,
  inte bara per förälder), en rad "Memo: varför den slår nuvarande nivå".
  Minst 1 av 5 nya koncept per rond har `kalla=voc`. Vinstbidrag grupperas per
  tagg vid varje /cs. Vid BREAKTHROUGH: dna.md-block "Komponentkarta <namn>"
  (HOOK / BRIDGE / HOLD / CTA med exakt rad, valens, awareness, avatar,
  bärande komponent = hypotes). Varje /cs hämtar kommentarerna på top spendern
  till `products/<id>/kommentarer.md`; kluster ≥ 3 ⇒ INVAND-variant. Vid
  etikett: läs den LIVE creativen (primärtext, rubrik, första frame) mot
  briefen och skriv `utford_som_briefad ja|nej` — nej ⇒ utfallet räknas inte
  in i variabeltabellen (motorhöljets copy-lärdomar i augusti byggde på text
  som aldrig kört, `dna.md:15–17`).
- **VAR:** `docs/os/ANALYSMETOD.md:204–213` (tabellen saknar avatar/awareness),
  `cs.md` steg 2–4, `forsta-batch.md` FAS 6 (sub-avatarkedjan) + LEVERANSFORMAT,
  `tools/briefgranskning.mjs`, `products/<id>/dna.md`. Kräver mätning: räcker
  `META_ACCESS_TOKEN` för `/comments`? Ett anrop först.
- **KÄLLA:** §8 Steg 5 (komponenterna), Steg 3; §3 [D2] rad 120 (growth
  guide-fälten), [D1] rad 128, [C8] rad 151; §6 #1, #2, #6, #7, #9; §1 [D1][C6]
  rad 57–63 (3 vinklar per sub-avatar, 3 hookar per vinkel, Breakthrough Memo).
- **PENGAR:** färre bortkastade briefer per runda, inte direkt spend. Impact 2–3.
- **KROCK:** SVAR-INTENT:27–30 har redan "fyra frågor per brief" som text —
  detta är taggformatet som gör det mätbart; `factory/kadens.mjs:39` fryst
  VARIABLER; talare-taggen bär i dag avatarinfo.
- **KOSTNAD:** S–M: dokument + mallar; ~60 rader för kommentarer; en avatarlista
  per produkt (huvudsessionen ~15 min var).

---

## 3. Krockar — var materialet slår mot hur vi kör, och vad ett byte kostar

| Krock | I dag (fil:rad) | Materialet | Går förlorat vid byte | Rekommendation |
|---|---|---|---|---|
| **Regel 11: nya tester i separat test-ABO** | CLAUDE.md regel 11 ("BEVISAD — tredje gången"); `products/motorholjet/batch-log.md:64–66`; `products/axelbaltet/batch-log.md:57` (ABO-cell ~600 kr/dag). I drift: allt i CBO (mätt 2026-09-19), `besked.mjs:255–259` ger upp vid ABO | §9 [21:50–27:35], §1 [D3] rad 54: 36 av 42 CBO-svultna annonser dog i ABO, 1 skalade; tvingad spend ger icke-inkrementella köp; 30 %-tröskeln förutsätter CBO | Chansen (~2 %) att en svulten annons hade blivit vinnare. Sparar ABO-cellen (~18 000 kr/mån) | Stryk regeln; "svält = Metas dom"; INGEN_LEVERANS dag 7 = förlorare. **Axels beslut.** |
| **Bara trappan får pausa annonser; trötta vinnare pausas på 3-dygnsdipp** | `rond-auto.md:260–263`; `spendtjuv.mjs:143`, `:182–187`; CLAUDE.md 2026-09-15 ("stängs aldrig av i efterhand") | §5 rad 236–244 (stänga av breakthrough = "catastrophic"); §9 [31:05] ("turn that ad back on"); §1 [C4] rad 47 (döda underpresterande i grön CBO) | Full Evolve-tålmodighet: 500-kronorsgrinden och 2026-09-14-spärren (89 % under BE). Dagens regel: tjuvar i gröna kampanjer förblir osynliga | Kompromiss 2.3: spärren överallt, nåd BARA för etiketterad breakthrough, takad. **Axels beslut.** |
| **Kampanjtrappan mot nåden** | `rond-auto.md:171–178` (ATGARDSTRAPPAN på testprodukter faller samma morgon); INGEN_TJUV ⇒ STANG_AV pausar hela kampanjen | §9 [10:56] "the only ads we turn off are losers" | Evolves tålamod krockar med trappan, inte bara med spendtjuven | Nåden gäller annonsen; kampanjtrappan behålls (din modell: byt produkt). |
| **Signifikansgrinden 300 kr/3 köp** | `ANALYSMETOD.md:47–58`, `:54`, `:80–82`; `besked.mjs:13–14`; `cs.md:98` | §9: etikett efter 7 dygn oavsett spend; §4: hook läses på visningar | Inget — om etikett ≠ dom | Två fält: `etikett` (vad Meta gjorde) + `bedombar` (grinden). Ingen linje byts. |
| **Isolerad variabel oavsett fas** | `forsta-batch.md:21`, `:43`; `naming-convention.md:107`; `briefgranskning.md:105–110`; `kadens.mjs:19–23` | §1 [D2] rad 36 (stora svängar före vinnare); §4 [C1] (ny hook får ny bild) | Envariabelkollen på testprodukter (mäter inget utan förälder); rotationens garanti | Läge jakt/kirurgi (2.10); "hook" = hela 0–3 s-paketet; en variant på en vinnare byter fortfarande EXAKT ett fält. |
| **Kvoten är mål nr 1; +5 bilder per batch; "hellre några briefs för mycket"** | CLAUDE.md regel 5; SOP-02; `rond-auto.md:352–362`; `rond.mjs:483` | §9 [2:44–2:55], [34:52–35:20] (hit rate blev en flex — mät breakthrough-frekvens); §1 [C5] rad 52 | Kvotlarmet (skydd mot noll nytt material), de fem extrabilderna, redigerarnas jämna volym (commission = spend) | Kvot som golv; breakthrough-frekvens "3/21 (14 %)" som mått; bilder bara med jobb. **Axels beslut.** |
| **3-dagarskadensen och tre parallella fasta mixar** | `rond.mjs:399`, `:489–495`, `:436–437`; `kadens.mjs` 50/50; SVAR-INTENT 80/20 (chatt) | §8 Steg 2, 9, 10; §1 [C4] rad 39 | Jämn takt per produkt; förutsägbar mix; "mata vinnaren" på kampanjnivå | Vidarebygg-rundan ersätter nästa brief_runda (2.5); mixen ur etiketterna (2.6). |
| **Hook/hold: tre olika mått i drift** | `ANALYSMETOD.md:24`, `:169–170` (autoplay, p50); `skalning.mjs:144–146` (rätt mått, fel namn); `playbook.md:14–25` (ofylld branschtabell) | §4 [D6], [C2] | Motorhöljets hold-p50-serie — behålls som separat fält | Byt definitionerna (2.8). |
| **Commission räknas på spend** | `commission/berakning.mjs:17` (0,4 %) | — | TJUV_PAUSAD i gröna kampanjer, INGEN_LEVERANS, "bilder bara med jobb" och produktstopp sänker redigerarnas spend; en "Breakthroughs"-kolumn på topplistan ändrar incitamenten | Säg det till redigerarna innan; överväg breakthrough-bonus senare. |
| **Etiketter synliga för människor** | CLAUDE.md regel 3 (ingen dom under 300 kr) | §9 etikett oavsett spend | En LOSER-etikett på redigerarens rad med 40 kr spend | Notion `Outcome` bara när `bedombar=true`, annars "Not enough data". |

---

## 4. De tre luckorna — konkreta förslag

### 4.1 Namnkonventionen saknar batchnummer, annonstyp och iterationsnummer
**Nuläge:** konventionen i drift är `Prefix_KONCEPT_ADID_VARIANT`
(`forsta-batch.md:52`; speglade = nummer + 100, `naming-convention.md:100–105`).
`docs/naming-convention.md:36` beskriver ett ANNAT schema
(`{BRAND}_{PRODUCT}_{ANGLE}_{FORMAT}_{HOOK}_v{N}`) som noll annonser följer
och som `factory/kadens.mjs:81–95` fortfarande parsar (returnerar null) —
skriv om den filen först, oavsett val. Batch # finns bara i batch-log.md och
Notion-fältet "Produkt / Batch" (`NOTION-FORMAT.md:17`); typ finns inte alls;
variantsiffran (H1/_2) räknar produktionsversioner, inte iterationer på en
förälder.

**28 ställen i repot parsar annonsnamn** (alla verifierade): `tools/leveranskon.mjs:68`,
`tools/ops-leveranskon.mjs:98/:142`, `tools/notion-till-meta.mjs:172`,
`tools/ops-till-meta.mjs:74/:103`, `tools/oversattningskon.mjs:66–84`,
`tools/ops-spegla.mjs:78–89` (+100), `factory/ops-bild.mjs:281`,
`factory/skalning.mjs:339`, `factory/register.mjs:598`, `factory/kampanj.mjs:70`,
`factory/rakning.mjs:86`, `factory/budgetrond.mjs:74`, `factory/opsmarknader.mjs:66`,
`commission/berakning.mjs:98/:115`, `commission/koppling.mjs:42`,
`dashboard/notion-import.mjs:37`, `pipeline/no-image-ads.mjs:92`,
`pipeline/no-drive-fran-meta.py:90`, `tools/bygg-tankguard-no.mjs:85`,
`tools/brand-detektor.mjs:230`, `tools/notion-kalla.mjs:281`,
`tools/notion-brief.mjs:295/:315–356`, `tools/briefgranskning.mjs:450/:454`,
`factory/kadens.mjs:81–95`, `products/prefix-alias.json`, `products.json
creative_prefix`, `agent/rond.mjs:535`. Fält 2–4 i namnet är låsta av tolv av
dem — ett fält mitt i namnet bryter leveransrundorna tyst (MC-Kapell
2026-09-15: en regexändring i ett namn gjorde 13 creatives osynliga).

**Alternativ B (rekommenderas nu, ½ dag, 0 av 28 parsrar rörs):** register +
Notion-fält. Ny append-only fil `products/<id>/annonser.jsonl`, en rad per
brief `{namn, produkt, batch, typ: N|M|I|S, iteration_nr, foralder, koncept,
kalla, hub_id, brief_datum, ad_id: null, created_time: null}`; skrivs av samma
steg som i dag skriver batch-log.md (`forsta-batch.md:61`, `cs.md:98`,
`rond-auto.md` 4b, `ops-bild.md`, `ops-spegla.md` med typ S); `ad_id` +
`created_time` fylls i av uppladdarna (de har id:t i handen). Notion: tre
egenskaper per hub — `Batch` (number), `Ad type` (select N/M/I/S), `Iteration`
(number) + `Outcome` (2.4) — skapas via API (select/number går, status-typ går
inte) och skrivs av `tools/notion-brief.mjs`. Befintliga annonser backfylls ur
batch-log-tabellerna med typ "okänd"; speglade +100 får typ S maskinellt.
Etikettrutinen listar varje körning "annonser i kontot utan registerrad" —
aldrig tyst. **Nackdel, rakt ut:** B löser inte Axels formulering "namnet
saknar …" — batch/typ/iteration syns inte i Ads Manager eller i redigerarens
filnamn. Rutinen läser registret, inte namnet.

**Alternativ A (1 dag, fyra parsställen, två namnsystem i kontot i månader):**
gement svanstoken EFTER varianten: `_b<batch><typ>[<iteration>]`, typ ∈
n/m/i/s — `Takoverdrag_PD_10_H1_b3i2`, NO: `Takoverdrag_NO_PD_10_H1_b3i2`,
spegel: `CaraShellRoof_PD_110_H1_b3i2`. Gement så det aldrig läses som
konceptkod, H-variant, marknadskod eller nummer. Måste ändras:
`tools/ops-leveranskon.mjs:98 tolkaNamn` (strippa tokenet först — annars får
`HeimGuard_G_2_b3n` varianten `b3n` och `briefgranskning.mjs:454` fäller FEL på
varje sådan video), `pipeline/no-image-ads.mjs:92` (regexen `/_\d+(_H\d+)?$/`
träffar inte längre — NO-bilden får fel namn), `tools/briefgranskning.mjs:450`
(nytt FEL när token saknas), skrivarna + `ops-spegla.mjs:82` (typ → s).
Redigerarens filnamn måste bära tokenet (`notion-kalla.mjs:281`). Aldrig på
adset-nivå (ett adset per koncept, `ops-leveranskon.mjs:142`) — Evolves
adset-nivå hoppar vi över, nytt adset per iteration bryter CBO-inlärningen.
Befintliga annonser döps aldrig om (`naming-convention.md:108`).

**Rekommendation:** B nu, och A i samma PR bara om Axel vill se det i Ads Manager.

### 4.2 Briefarna saknar visuell regi rad för rad
**Nuläge** (mätt på `DryTrek_Damasker_ID_2_H1/brief.md` och rutinens
`Takoverdrag_PD_10_H1`): Edit map har fem tidsblock med en mening "what to cut
to" — ingen shot-typ per rad, ingen effekt + längd, inget källklipp med mm:ss
("Needs new footage" / "same shots as PD_2_H1" utan fil eller sekund), ingen
text-på-skärm per klipp (bara den globala "every script line as caption"),
ingen VO-mot-on-screen-skillnad, inga referensannonser, inga assetlänkar
inline för video, ingen MAY/MUST NOT-frihet. Bildbriefen når nivån ("edge
hanging 30–40 cm down, hooks under the body edge") — videobrieferna inte.
`forsta-batch.md:48` KRÄVER shot list med tidskoder, text-overlays och
editing direction; `tools/briefgranskning.mjs:436–479` fäller FEL för "video
utan manus" men aldrig för "manus utan regi".

**Mallen:** EN regitabell per videobrief, EN rad per manusrad (samma svenska
text ordagrant):

`| # | Tid (s) | Manusrad (svenska) | Ljud | Text på skärm | Bild | Effekt + längd | Källa | Referens | Frihet |`

- Ljud: VO / INGEN VO. Text på skärm: exakt text eller INGEN TEXT — aldrig
  tomt; skiljer sig on-screen-hooken från VO-hooken skrivs båda.
- Bild: vad som FYSISKT syns med produktdelens namn från produktsidan (krok i
  snörning, rem under foten) + shot-typ (närbild/halvbild/helbild/ovanifrån) +
  vad händerna gör. "or/eller" förbjudet; ingen adjektivregi.
- Effekt + längd: slow-mo 0,5× 2 s / reverse 3 s / slider före–efter 2 s / zoom
  in 1 s / cut-in / freeze / ingen — aldrig tomt.
- Källa (aldrig tomt): (a) `VÅR ANNONS <namn> mm:ss–mm:ss` (obligatorisk
  sekund — rutinen hämtar videon ur Meta, kör `tools/qa-frames.py` 1 frame/s och
  läser av); (b) `DRIVE <fil-id> mm:ss`; (c) `DRIVE <fil-id> [EDITOR PICKS:
  leta efter <konkret bild>]` när klippet finns men inte kunnat läsas; (d)
  `NY INSPELNING: <exakt vad, av vem>` — Notion-raden stannar i Draft tills
  materialet finns. En påhittad tidsstämpel är FEL; [EDITOR PICKS] är giltigt.
- Hookraden dessutom First frame (thumbnailen); Effekt får inte vara "ingen"
  om Text är "INGEN TEXT"; två H-varianter måste ha olika hook-mekanik.
- Ovanför tabellen tre fasta rader: **Assets** (Drive-mapp + id, CDN-bilder),
  **Reference ads** (förälderns Notion-rad + "Replicate: … / Do not replicate:
  …", eller "none — new concept"; förälderns första frame upp i Filer och media
  via `tools/notion-fil-upp.mjs`), **Editor latitude** (MAY: klippordning inom
  beat, b-roll inom motivet, musik, övergångar, captionplacering inom
  mittersta 80 %; MUST NOT: svenska rader, pris, hookrad + tid, produkt i bild
  före 4 s, butiksnamn, varje fält i VARIABELTAGGAR; "cannot find a source:
  comment on this row, set back to Draft — never replace the product shot with
  a generic one").
- Text på skärm = manusraden som standard (tyst feed); kursens "no text on
  hooks" bara som märkt undantag. Regi skrivs av huvudsessionen (regel 6 gäller
  bara texten). Bildbriefer behåller "Exact text" + Design brief, får Referens
  + Frihet. Milanote/Figma: nej — Notion är boarden och alla rutiner parsar den.

**Spärren:** `tools/briefgranskning.mjs granskaBrief`, direkt efter typkontrollen
(rad 454), för typ video: hitta regitabellen (rubrikrad med både "Källa/Source"
och "Text på skärm/On-screen"); kräv (a) exakt en tabellrad per manusrad,
(b) Källa i ett av fyra format, (c) Text på skärm ≠ tom, (d) Effekt ≠ tom,
(e) Editor latitude finns; VÅR ANNONS utan mm:ss = FEL; "or/eller" i Bild =
anmärkning. Brist ⇒ FEL kod `regi` med engelsk kommentar på Notion-raden
("shot-level direction missing on line 3: no source, no on-screen text
decision"), räknat i Feedback-raden ("Visual direction: x/8"). Samma fem
punkter i skrivarnas Definition of done. rond-auto 4b och Nattvakten kör
`node tools/briefgranskning.mjs --rad <fil>` på varje egen videobrief INNAN
Notion-raden skapas.

**Mät från dag 1:** rev (antal "In progress 2", ackumulerat vid varje läsning,
"okänd" aldrig 0) och dagar→live per annons i batch-log; jämför före/efter
över ≥ 2 batcher innan något sägs om effekten.

### 4.3 Ingen etikett efter sju dagar — breakthrough-frekvensen är okänd
Regeln står i 2.4. Kort: vad datan räcker till i dag — ronden hämtar bara
kampanjnivå (`rond-auto.md:87–89`) och annonsnivå bara i trappan (`:194–196`,
last_3d); det som saknas är annonslistan med `created_time`, insights i
annonsens egna 7 dygn, CBO/ABO-strukturen, videofälten (finns i
`skalning.mjs:319`, noll extra anrop) och batch/typ/ad_id per annons (registret
4.1). Budgethistoriken finns: `gammal_budget` på 440 av 651 loggrader, loggen
börjar 2026-08-28 (Taköverdraget 1 000 → 16 000 kr 09-09 → 09-19 går att
backfylla). Krocken med ANALYSMETOD löses med två fält (etikett/bedömbar).
Ingen målsiffra sätts (Evolve ger ingen); larmet är "> 14 dygn sedan senaste
breakthrough och < 3 iterationer loggade".

---

## 5. Passar inte (riktigt, men irrelevant för Axels modell — sist)

- **Produktdifferentiering/positionering, "easily replicable", konkurrenten
  kopierar tillbaka, grundare/auktoritet i bild för att annonsen ska bli
  svårkopierad** (§5 #13–#14, §8 Steg 5 "positioning", §7 #12) — Axels filter
  ordagrant. Repot ÄR den odifferentierade modellen (general store +
  OPS-spegling, "prioritera annonser som går snabbt att producera"). En
  breakthrough som lever 3 veckor betalar sig och byts ut — så länge
  frekvensen mäts. Produktionsnivå låg/hög noteras bara som fält så
  livslängdsserien senare kan svara.
- **Dela kampanjen / andra CBO vid kapacitetstak, adset-kapacitetsvarning,
  månadsrensning av gamla annonser** — ingen kampanj är nära taket; kursens
  egen tröskel är 10 k$/dag. Varningsrad någon gång, inte nu.
- **Zombie-/graveyard-kampanj** — Evolve själva: "adds some more spend but it's
  not scaling". `INGEN_LEVERANS`-paus ger samma rensning utan en extra kampanj
  per produkt att undanta i ronden, spendtjuven och commission.
- **Milanote/Figma som visuell board, betald licens** — Notion är boarden; ett
  tredje verktyg bryter kedjan brief → granskning → leverans → commission.
- **AI-format med ansikten eller sång: AI-berättelse med människa (§7 #8),
  talande kroppsdelar (#5), AI-sång (#6), gatuintervju via byrå (#13), podcast
  på set (#14)** — AI-ansikten dödade två creatives (`axelbaltet/dna.md:45–46`),
  rimmad svensk sång går inte att tre-frågorstesta radvis, byrå/set kräver
  kapital och folk på plats. AI-mekanism/AI-skurk utan ansikte (#3, #4, #7)
  bara sist i formatkartan som GISSNING.
- **Team-möten där koncept väljs efter confidence, beröm vid breakthrough,
  strategist-stämpel före redigeraren** — strategisten är en rutin, Axel rör
  inte briefarna; commission är berömmet; en Discord-rad "Breakthrough: <namn>"
  kostar inget.
- **45 % retention vid 6 s** — finns inte som Insights-fält; hook→hold svarar
  på samma fråga.
- **New customer % via Northbeam/Triple Whale, prognoser ur hundratals
  breakthroughs, trösklarna för 20–120 k$/dag** — retention-/årsplanering; vi
  har noll etiketter i dag. Frivillig engångsmätning: andel förstagångskunder
  i Shopify — är den > 90 % läggs frågan ner.
- **Hänvisningar till kursens copywriting-program, Skool-inspelningar,
  canva-exempel** — kan inte läsas; exemplen överförs bara som mekanism (redan
  i 2.6).

---

## 6. Beslut som väntar på Axel

1. **Manuella zonen:** ska ronden få kapa till 4 000 kr efter två
   MANUELL_FORLUST-morgnar (2.2)? A ja / B nej, zonen förblir orörd.
2. **Spendtjuven i gröna kampanjer** (2.3), mot "bara trappan får pausa" och
   2026-09-15-regeln: A ja, med orsakskod / B nej.
3. **Regel 11** (test-ABO): A stryk, "svält = Metas dom" / B behåll (då bara
   KPI-etikett på tester, ingen breakthrough-frekvens).
4. **+3 BOF + 2 review-bilder per batch och "hellre några briefs för mycket":**
   A bilder bara med jobb, kvot som golv / B behåll som i dag.
5. **Namnet:** A register + Notion-fält nu (B i 4.1) / B dessutom
   svanstoken `_b3i2` i annonsnamnet (A i 4.1).
6. **Säsongsdatum** start/slut för Taköverdraget, Termoskyddet,
   Adventskalendern, Kranskydd (2.11) — bara du kan skriva dem.

Allt annat (2.1, 2.4–2.9, 2.12) kräver inget ägarbeslut, bara ett "bygg".

---

## 7. Källor och metod
Materialet: Axels fil `skalningskungen-kallmaterial-2026-09-20.md` (§1–§10;
§-numren ovan följer den). Kursindex: `docs/ecomtalent/fynd.json` (516 fynd ur
ecomtalent-kursen, 2026-09-19). Inventering, mappning, granskning: workflow
2026-09-20 (19 agenter, 4,4 M tokens); rättelserna från fil:rad-granskaren och
skeptikern är inarbetade ovan. Fyra frågor är obesvarade av Evolve-boten
(§10) och behandlas som luckor, inte som svar.
