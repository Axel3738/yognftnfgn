# Creative DNA — DryTrek (damasker)

Skapad 2026-09-11 av `/notionscalercs setup drytrek` (körning nr 0 — setup).
**Senast uppdaterad 2026-09-12, körning nr 1 (första briefdagen, batch #2).** Butiks-id `drytrek`, produktnyckel `drytrek/damasker`,
brand **DryTrek**, drytrek.se (Shopify `i1da39-zd`).

⚠️ **All prestandadata under "Vad som är bevisat" är ÄRVD från Bäverbutiken**
(konto `1867947880635861`, LÄSES bara). DryTreks egen kampanj har körts
2026-09-09 → 2026-09-10 (2 dagsrader): **867 kr, 2 köp, ROAS 0,90** mot
break-even 1,60. **0 av 16 annonser har passerat signifikansgrinden**
(≥ 300 kr OCH ≥ 3 köp). Första briefdagen blir en **KALLSTART**: ingen
feedback-loop, ingen dom över en enda DryTrek-annons.

Alla tal nedan är lästa 2026-09-11 med `factory/skalning.mjs drytrek/damasker
--dagar 90 --arv --marknad SE --json` (`factory/output/drytrek/arv-90d.json`).
Ärvda tal är hela livstiden i Bäverbutiken, dömda mot DryTreks linje.

---

## Produkten och kunden

Damasker (benskydd) för vandring: 44 cm höga, 43 cm omkrets justerbar, tätvävd
polyester, krok i kängans snörning + rem under foten + kardborre längs hela
utsidan. 18 färger, varav signalfärgerna neongrön, orange och gul. 389 kr,
jämförpris 649 kr, paket 1/2/3 par (2 par förvalt). Fri frakt SE + NO,
14 dagars ångerrätt. Källa: `factory/produkter/damasker.yaml`.

**Kunden:** vandrare, jägare, hundägare och skogsfolk 30–65. Äger redan
kängorna. Pratar om turen, terrängen och vädret — inte om plagg.

**Grundkonflikten:** det är aldrig vädret som vänder turen, det är blöta
strumpor vid kilometer fyra. Produkten stänger till mellan känga och knä.

**Norska:** produkten heter *gamasjer* på norska, inte damasker (ordet betyder
något annat där). NO-kampanjen i OPS-kontot heter `DryTrek_Gamasjer_NO_*`.

---

## Vad som är bevisat (ÄRVD — Bäverbutiken, hela livstiden, 14 511 kr, 65 köp, ROAS 2,30)

Källkampanj `Damasker Vandring | BE ROAS 1.60 | Launch 2026-08-29`, 21 annonser
med prefixet `Damasker_`. Bedömbara: **2**. Resten (19) är under grinden.

| Vinkel | Kod | Spend i källan (ÄRVD) | Köp | Dom |
|---|---|---:|---:|---|
| Produktdemo av påtagningen | PD | 12 401 kr (85 %) | 58 | **Bevisad.** `PD_1` ensam: 10 671 kr, 56 köp, CPA 191 kr, ROAS 2,77, vinstbidrag 2 937 kr mot BE-CPA 243. |
| "Social proof" / UGC-testet | SP | 1 885 kr (13 %) | 6 | **Förlorare på data.** `SP_2`: 1 304 kr, 5 köp, CPA 261 kr (BE 243), vinstbidrag −89 kr. Övriga SP under grinden. |
| Erbjudandet 40 % | CS | 132 kr | 1 | Otestad. Under grinden. |
| Present till honom | G | 45 kr | 0 | Otestad. |
| Före/efter | FO | 49 kr | 0 | Otestad (`FO_1_H1`, Notion-runda 2026-09-08). |

Ärvd metrik på de två bedömbara (ÄRVD, 2026-09-11):

| Annons | Spend | Köp | CPA | ROAS | Hook 3 s | Hold | CTR | CPC | CVR |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| `Damasker_PD_1` (video) | 10 671 kr | 56 | 191 kr | 2,77 | 38,4 % | 22,8 % | 2,46 % | 4,98 kr | 2,61 % |
| `Damasker_SP_2` (video, UGC) | 1 304 kr | 5 | 261 kr | 1,70 | 31,5 % | 23,1 % | 2,10 % | 9,18 kr | 3,52 % |

**Mönster 1 (bevisad, ärvd) — en enda annons bär allt.** `PD_1` står för 74 %
av källans spend och 86 % av köpen. Det är produktens hela bevis. Allt annat
är oprövat — inte dåligt.

**Mönster 2 (hypotes, ärvd) — samma copy och vinkel, annan film, noll köp.**
`PD_2` har identisk copy med `PD_1`, nästan samma hook rate (37,6 mot 38,4 %)
och CTR (2,31 mot 2,46 %), men **1 065 kr och 0 köp** — 4,4 × break-even-CPA
utan ett enda köp. Under grinden på köp, men det är den första frågan att
ställa: skillnaden sitter i filmen efter sekund 3, inte i hooken eller texten.

**Mönster 3 (hypotes, ärvd) — SP-vinkeln konverterar men köper dyrt.** `SP_2`
har högst CVR av alla (3,52 %) men CPC 9,18 kr mot PD_1:s 4,98 kr — nästan
dubbelt. Vinkeln säljer på sidan, men klicket kostar för mycket. `SP_3` har
källans bästa hook (42,9 %) och hold (34,0 %) på 428 kr — brus än, men värt att
titta på när data finns.

**Mönster 4 (hypotes, ärvd) — bildversionerna har inte fått chansen.**
`PD_2_1` (bild) 201 kr / 1 köp, `SP_2_1` 10 kr, `CS_2_1` 9 kr, `G_2_1` 28 kr.
Ingen dom — Metas CBO gav dem aldrig pengar.

---

## Vad DryTrek ändrade, och varför det gör datan icke-jämförbar

Källa: `factory/annonscopy/damasker-se.json` (skriven 2026-09-09) och
`factory/output/damasker/brand-detektor.md`.

1. **Vinnarens hook byttes.** Källans `PD_1`-copy öppnade med "Trött på snö,
   väta och grus i skorna? 🥾" och lovade "Stoppar regn", "oavsett väder",
   "På med dem på 10 sekunder". Copy-granskningen strök alla tre (obelagda
   påståenden) och satte "Blötsnön börjar ovanför kängans kant." i stället.
   **Copyfilen varnar själv för det:** det är en risk mot en annons som
   bevisligen fungerar. ⚠️ Behandla `PD`-utfallet hos DryTrek som en **ny
   hypotes**, inte som en fortsättning på källans 2,77.
2. **Social proofen togs bort.** "Älskade av tusentals vandrare" och
   "Kunderna älskar torra fötter" — DryTrek har noll kunder och noll
   recensioner (Judge.me 0, avläst 2026-09-09). SP-copyn är nu en
   funktionsrad ("Tre fästen. Snön stannar utanför."). **SP-vinkeln på DryTrek
   är alltså inte social proof längre** — det är en UGC-film med en
   featurecopy. Tagga den som `proof: ugc-demo`, inte `proof: reviews`.
3. **Brådskan togs bort.** "BARA IDAG", "gäller till midnatt", "Lagret
   krymper" — obelagt, och 389 kr är butikens stående pris.
4. **"30 dagars öppet köp" → 14 dagars ångerrätt.** Källan lovar 30 dagar;
   DryTrek följer lagen (Axels beslut 2026-09-08).
5. **Priset rördes inte.** 389 / 649 kr är identiskt i båda butikerna.
6. **Två källannonser laddades inte upp:** `FO_1_H1` och `SP_4_H1` saknar
   transkript, talytan gick inte att döma (brand-detektorn 2026-09-09).

---

## Rotorsaker och fallgropar

- **Talet i de ärvda videorna säger det copyn strök.** `PD_1`:s voiceover
  (SRT `market-expansion/no/video-batches/2026-08-29/srt-orig/damasker_PD_1.orig.srt`)
  säger "Vattentäta, vindtäta … i alla väder" och "På med dem på några
  sekunder" — exakt de påståenden copy-granskningen tog bort ur texten.
  Brand-detektorn dömde talet "rent" för att det inte nämner Bäverbutiken.
  Samma fel som HeimGuards CS-videor (2026-09-11). **Copy och tal måste
  rättas som par** — i nästa brief som bygger på PD_1 ska manuset skrivas om,
  inte bara texten.
- **`SP_2`:s tal är ett förstapersonsvittnesmål** ("Jag testade de här på
  hundpromenaden i morse … helt torra strumpor"). Det är kreatörens egen
  erfarenhet, inte ett kundomdöme, och kan stå kvar. Men rubriken "Kunderna
  älskar" fick inte stå kvar — och gör det inte.
- **Kontot bär flera verksamheter.** `915422744950975` har 16 kampanjer;
  1 är DryTrek SE, 1 DryTrek NO, 14 andra butikers. Varje uppslag måste
  filtrera på `damasker_` / `drytrek` (registret gör det; 197 av 229 annonser
  filtrerades bort 2026-09-11).
- **Hubben "Damasker vandring" bär Bäverbutikens historik.** 33 rader lästa
  2026-09-11: 9 videor i `Creative strat review` (Jasper Tomboc, 2026-09-02),
  5 i `SE-ACTIVE to be translated` (`FO_1_H1`, `SP_4_H1`, `PD_8_H1`,
  `PD_9_H1`, `SP_5_H1` — redan uppe i Bäverbutikens konto), 18 bild-`Draft`
  (BOF_1–9, PD_7, PD_11, CI_2, CS_5, LI_1, CO_2, HL_1, ID_1), 1 Guideline.
  Hubben är sedan 2026-09-10 registrerad som DryTreks och undantas därför ur
  Bäverbutikens rutiner (`tools/lib/ops-hubbar.mjs`). Rader som skapas här
  ska heta `DryTrek_Damasker_*`, aldrig `Damasker_*` — annars går de inte
  att skilja från Bäverbutikens.
- **Upptagna AD-ID:n** (kontot + hubben, 2026-09-11): PD 1–11, SP 1–5,
  CS 1–5, BOF 1–9, G 1–3, CO 1–2, CI 1–2, FO 1, LI 1, HL 1, ID 1, UG 1,
  MB 1, AU 1. Nästa lediga: PD_12, SP_6, CS_6, G_4, FO_2, CO_3.
- **Ingen commission utgår på den här butiken i dag** (kontot står i
  `UTLANDSKA_KONTON`). Känt, Uppdrag D i `factory/FAS2.md`.
- **Meta-sidan och pixeln:** pixel `945311424682796` (skapad 2026-09-09,
  delad till OPS-kontot). Sidan skapades av VA:n i BM — id:t läses ur
  kontots annonser, det står inte i `damasker.yaml` (fältet är tomt).

---

## Ekonomin — AVGJORD (Axels besked 2026-09-09)

Pris 389 kr · inköp 146 kr · **TB 243 kr · BE-ROAS 1,60 · BE-CPA 243 kr ·
target-ROAS 2,67 · target-CPA 146 kr**, räknat UTAN moms. Facit:
`factory/produkter/damasker.yaml` (`moms_antagen: false`), och det är den
linjen `factory/budgetrond.mjs` dömer mot.

⚠️ Inköpet 146 kr är **härlett baklänges** ur källkampanjens break-even i
namnet (389 / 1,60), inte läst ur COGS-arket. Stäm av mot arket innan
budgeten skalas över 2 000 kr/dag.

---

## Körning nr 0 — 2026-09-11, setup (`/notionscalercs setup drytrek`)

### Vad DryTreks egen kampanj visar (data, 2026-09-09 → 2026-09-10)

Kampanj `DRYTREK_SE_Damasker Vandring | BE-ROAS 1.60 | 2026-09-09`, konto
`915422744950975`, 16 annonser i 4 adsets (`DRYTREK_SE_PD/SP/CS/G`), CBO
1 000 kr/dag. Budgetronden torrkörd 2026-09-11: 0 ändringar (under grinden).

| | Spend | Köp | ROAS | Mot BE 1,60 |
|---|---:|---:|---:|---|
| Hela kampanjen, 2 dygn | 867 kr | 2 | 0,90 | under break-even — men under grinden, ingen dom |

**Bedömbara annonser: 0.** Det som ändå syns — märkt **hypotes**, aldrig dom:

- **Spend per vinkel på DryTrek:** CS 286 · G 281 · SP 155 · PD 145 kr.
  Metas CBO har gett den bevisade vinkeln minst pengar. `PD_1`, källans
  vinnare, har fått **13 kr**. Hypotes 1 (håller PD med ny hook?) är
  **obesvarad**, inte falsifierad.
- **`G_2` (present, video) tog mest, 218 kr, 0 köp**, CTR 1,51 %, hook 35 %,
  hold 12,6 %. `CS_2_1` (bild, erbjudande) 212 kr, 1 köp, CVR 5 %.
  `SP_1` 80 kr, 1 köp. Allt brus än.
- **Hook rate ligger 29–38 % på videorna med > 20 kr** — samma nivå som
  källans PD_1 (38 %). Hooken är inte problemet i dag; volymen är det.
- **NO-kampanjen** (`DRYTREK_NO_*`, 16 annonser, utanför SE-filtret): 268 kr
  och 3 köp på `Gamasjer_NO_PD_2_1` — noteras, döms inte här (annan marknad,
  och Bäverbutikens norska källkampanj var helt pausad = ett beslut).

### Copy-modell A/B (Axels beslut 2026-09-10)

Registret säger `copy_modell: ab`. Ställning: **0 bedömbara annonser per
modell** — inga briefer skrivna än. Avgörs när båda har ≥ 5 bedömbara.

### Vad första briefdagen ska göra (instruktion, ur mönstren ovan)

1. **Bevisad (ärvd):** demon av påtagningen bär allt → varianter av `PD_1`
   som isolerar EN variabel var: (a) källans originalhook mot den omskrivna
   (copyfilens egen varning), (b) nytt manus utan "vattentät"/"alla väder"
   med samma bilder.
2. **Hypotes (ärvd):** PD_2 = samma copy, 0 köp på 1 065 kr → titta på filmen
   efter sekund 3 innan fler PD-varianter klipps på den.
3. **Hypotes (ärvd):** SP/UGC konverterar bäst på sidan (CVR 3,5 %) men
   klicket kostar dubbelt → ett UGC-koncept med demo-hook (krok, rem,
   kardborre i bild sekund 0–3), inte pratad öppning.
4. **Hypotes (OPS):** CBO svälter PD → om PD-adsetet fortfarande ligger under
   200 kr när kampanjen passerat 3 000 kr: lyft till Axel i `🔴 ACTION NEEDED`
   (budgetronden rör inte adset-fördelning).

---

## Körning nr 1 — 2026-09-12, första skarpa Nattvakten + första briefdagen

### Data (OPS-kampanjen, 14d = hela livstiden 2026-09-09 → 09-11)

| | Spend | Köp | ROAS | Mot BE 1,60 |
|---|---:|---:|---:|---|
| Hela kampanjen, 3 dygn | 1 654 kr | 2 | 0,47 | under break-even — under grinden, ingen dom |

**Bedömbara: 0 av 16. KALLSTART bekräftad** — ingen feedback-loop, alla
hypoteser från batch #1 obesvarade. Fullständig annonstabell i batch-log.md.

**Budgetronden gjorde:** `G_2_1` pausad (ny annons-regeln, 480 kr / 0 köp).
Kampanjbudget orörd. Ärvd historik omläst: PD_1 11 366 kr / 58 köp / ROAS 2,70
(vinnare, +2 728 kr), SP_2 1 360 kr / 5 köp / ROAS 1,63 (förlorare, −145 kr).
Facit oförändrat.

### Vad som syns (hypoteser, aldrig domar)

- **Mönster 5 (hypotes, OPS) — CBO ger present-vinkeln hälften.** 14d: G 823 kr
  (50 %, 0 köp) · CS 498 · SP 170 · PD 163 kr (10 %). Källans vinnare PD_1 har
  15 kr. G-adsetet står på 3,4 × break-even-CPA utan köp. Fyra annonser under
  grinden är ingen dom — men G är den enda vinkeln utan spend i källan (45 kr)
  OCH utan köp här. Lyft till Axel som fråga, inte som åtgärd. **Svar 2026-09-12: Axel pausade adsetet `DRYTREK_SE_G`** (manuellt via chatten, tillbakaläst). Mönstret får nu sitt test: går PD upp när G är borta?
- **Mönster 6 (hypotes, OPS) — billiga klick utan köp.** `G_2_1` (bild,
  present) hade kampanjens lägsta CPC (3,5 kr) och högsta CTR (5,5 %) och
  0 köp på 480 kr. Klick-metrik säger inget om köpavsikt. Instruktion: döm
  aldrig en bild på CTR; grinden gäller.
- **Hook rate på videor > 50 kr: 21–36 %**, PD_1 31 %, i nivå med källans
  38 %. Hooken är inte flaskhalsen; volymen till PD är.

### Copy-modell A/B (Axels beslut 2026-09-10)

Batch #2: 4 briefer `copy_model: fable` (PD_12_H1, PD_12_H2 delat, PD_12_1,
PD_13_H1), 3 `copy_model: sonnet` (SP_6_H1, SP_7_H1, FO_2_H1). Vägen:
Agent-verktyget (fable resp. sonnet) med exakt `tools/copy-agent.mjs`:s
systemprompt och uppdrag (`batch-02/uppdrag-*.json`). Ställning: **0
bedömbara per modell**. Avgörs när båda har ≥ 5 bedömbara.

### Rotorsak funnen i verktyget (2026-09-12)

`tools/meta-lib.mjs pausa()` läste tillbaka med budgetfälten → Meta 400 på
ett ad-id. Första OPS-annonspausen någonsin stoppades före skrivningen.
Rättad: `lasStatus()` (bara statusfält) i `pausa()`. HeimGuard/TankGuard
har inte haft en annonskill än, så buggen syntes först här.

### Instruktion till nästa briefdag (2026-09-13 är söndag = briefdag)

1. Batch #2 är 1 dag gammal — inget utfall att läsa. Bygg INTE 7 nya briefer
   ovanpå 7 ogjorda utan redigerare; rapportera i stället att hubben har 7
   Draft-rader och fyll bara på med det backloggen har kvar (grus, signalfärg)
   om Axel tilldelat en redigerare. *(Detta är en tolkning av kadensregeln —
   "hubben fylls inte med briefer ingen gör" — inte ett beslut av Axel.)*
2. Hypotes 4 (OPS): PD-adsetet under 200 kr när kampanjen passerar 3 000 kr →
   `🔴 ACTION NEEDED`. Kampanjen står på 1 654 kr; PD på 163 kr. Nära.
