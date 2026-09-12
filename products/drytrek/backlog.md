# Backlog — DryTrek (damasker)

Koncept som väntar. Ett koncept får aldrig födas ur tomma intet — varje rad
pekar på sin källa: playbook-vinnare, winning line som spenderat pengar bra,
eller konkurrent-signal i `docs/swipes/`. Kan den inte det är den en gissning
och märks så.

Skapad 2026-09-11 av `/notionscalercs setup drytrek`. Uppdaterad 2026-09-12 (körning nr 1, första briefdagen): 6 av 8 koncept plockade till batch #2, 2 väntar. Dessutom nytt koncept ur batch #2:s bygge: **bildversion av demon** (`PD_12_1`, format-variant av PD_1 — ärvt mönster 4).

---

## Väntar på åtgärd (inte koncept — arbete)

| Vad | Varför det ligger här | Källa |
|---|---|---|
| **Talet i `PD_1` (live på DryTrek)** | VO säger "Vattentäta, vindtäta … i alla väder" och "På med dem på några sekunder" — påståenden copy-granskningen strök ur texten 2026-09-09 för att de är obelagda. Brand-detektorn dömde talet rent för att brandet inte nämns. Copy och tal måste rättas som par. Beslut om paus är Axels (PAUSED med spend är hans beslut). | `market-expansion/no/video-batches/2026-08-29/srt-orig/damasker_PD_1.orig.srt`, läst 2026-09-11 |
| **Recensioner** | Källan har noll (Judge.me 0, Loox null, 2026-09-09). SP-vinkeln kan inte bli social proof igen förrän butiken har riktiga omdömen. | `factory/state/drytrek--damasker.json` |
| **`FO_1_H1` och `SP_4_H1`** | Uteslutna ur batch #1 för att talet inte gick att läsa (inget transkript). Kör `pipeline/rostkoll.py` + transkribera, sen brand-detektorn igen — då kan de laddas upp. | `factory/output/damasker/brand-detektor.md` |
| **Hubbens 9 videor i `Creative strat review`** (Jasper Tomboc, 2026-09-02: PD_4/5/6/10, UG_1, CI_1, CO_1, CS_4, MB_1, AU_1) | Bäverbutikens produktion som följde med hubben till DryTreks teamspace. De är gjorda men aldrig granskade. Vem som granskar dem, och för vilken butik, är Axels beslut. | Notion-hubben, läst 2026-09-11 |
| **Redigerare** | Ingen tilldelad i registret → briefronden begränsas till 7 per rond. `node factory/register.mjs redigerare drytrek/damasker "<namn>" <discord-id>` när Axel bestämt. | `factory/produkter/register.json` |
| **Discord: state-filen ljuger** | `factory/state` säger `discord: klar false`, men servern **DryTrek — OPS** (`1547345265671934083`) finns med `#ads` och `#ads-to-do`, och boten sitter i den (kollat 2026-09-11). Rapporten kan postas. State-fältet är bara inte uppdaterat. | Discord API, läst 2026-09-11 |

---

## Koncept

| Idé | Varför den kan funka | Källa |
|---|---|---|
| **[använd i batch #2 → `PD_12_H2` mot `PD_12_H1`]** **Källans originalhook mot den omskrivna** — samma `PD_1`-film, copy A "Trött på snö, väta och grus i skorna?" (utan "stoppar regn"/"10 sekunder") mot copy B "Blötsnön börjar ovanför kängans kant." | Copyfilen varnar själv: hookbytet är en risk mot en annons som bevisligen fungerar (10 671 kr, 56 köp, ROAS 2,77). Variabeln är EN: hooken. | `factory/annonscopy/damasker-se.json` `_om`, ärvd `PD_1` |
| **[använd i batch #2 → `PD_12_H1`]** **`PD_1` med nytt manus** — samma bilder, VO utan "vattentät"/"vindtät"/"alla väder", i stället krok → rem → kardborre uttalat i takt med bilden | Vinnaren kan inte skalas med ett tal som lovar vattentäthet materialet inte är belagt för. Variabeln är EN: manuset. | dna.md rotorsak 1, SRT läst 2026-09-11 |
| **[använd i batch #2 → `SP_6_H1`]** **UGC med demo-hook** — `SP_2`:s förstapersonsberättelse, men sekund 0–3 visar kroken i snörningen i stället för att prata | `SP_2` har källans högsta CVR (3,52 %) men CPC 9,18 kr mot PD_1:s 4,98. Hypotes: vinkeln säljer, öppningen köper dyra klick. | ärvd `SP_2`, 1 304 kr / 5 köp (läst 2026-09-11) |
| **[använd i batch #2 → `PD_13_H1`, märkt gissning]** **"Testet"** — vatten hälls över kängan med damasken på, strumpan dras av torr efteråt | Axels egen prioriterade vinkel nr 2 i produktfilen. `SP_4_H1`-copyn ("Vände upp skon efter tre mil. Strumpan helt torr") bär samma bild men har 18 kr data. ⚠️ **gissning** — ingen spend bakom. | `factory/produkter/damasker.yaml` `meta.vinklar`, `SP_4_H1` |
| **[använd i batch #2 → `FO_2_H1`, märkt gissning]** **Före/efter samma tur** — blöt strumpa utan, torr strumpa med | Axels vinkel nr 3. `FO_1_H1` finns (49 kr, 0 köp, talet oläst). ⚠️ **gissning**. | produktfilen, ärvd `FO_1_H1` |
| **[väntar — batch #2 var full: 7 utan redigerare]** **Grus-vinkeln** — skaka ur kängan vid varje paus, mot noll stopp | Axels vinkel nr 4. Ingen annons bär den än (G-koden i kontot är *present*, inte grus). ⚠️ **gissning**. | produktfilen `meta.vinklar` |
| **[använd i batch #2 → `SP_7_H1`, märkt hypotes — svag källa]** **Hundpromenaden** — hela konceptet byggt på `SP_2`:s rad "Jag testade de här på hundpromenaden i morse" | Den enda ärvda raden utanför PD som fått pengar (1 304 kr) och nästan bar sig (CPA 261 mot 243). Målgruppen i produktfilen nämner hundägare uttryckligen. | ärvd `SP_2` VO, `docs/winning-lines.md`-kandidat (inte inskriven än) |
| **[väntar — batch #2 var full: 7 utan redigerare]** **Signalfärg/jakt** — "syns i skymningen" med neongrön/orange | Produktens fjärde säljpunkt och skälet till bonusprodukten (reflexband) i Q4-ramverket. Ingen annons bär den. ⚠️ **gissning**. | `factory/produkter/damasker.yaml` benefits, `offer.bonus_produkt` |

---

## Axels egna idéer (loggade av `/ops-bild`)

| Datum | Idé | Status | Källa |
|---|---|---|---|
| 2026-09-12 | **En bildannons per färgvariant** — vit bakgrund, bara produkten, 18 färger = 18 bilder i ETT koncept (`PD_14_1 … _18`, ett adset). Variabeln är färgen; vinstbidrag per färg säger vilka färger som ska leda copyn framöver. | **[byggd i batch #3 samma dag]** — genererad av `factory/ops-bild.mjs` (kie.ai), ingen redigerare | Axel, chatten 2026-09-12. Produktens säljpunkt "18 färger" (`factory/produkter/damasker.yaml` benefits) — ingen annons på kontot visar mer än neongrön |
