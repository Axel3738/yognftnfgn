# Creative DNA – Sushi-Strumpor (Matstrumpor.se)

**Produkt:** Sushi-Strumpor, 5 par i en låda som ser ut som takeaway-sushi, ätpinnar i trä ingår · **399 kr**
**Erbjudande (verifierat på sidan 2026-09-17):** Köp 1 – Få 1 GRATIS (2 lådor 399 kr) · Köp 2 – Få 2 GRATIS (4 lådor 798 kr) · fri frakt · 30 dagars öppet köp · 5–10 arbetsdagar
**LP:** https://matstrumpor.se/products/sushi-strumpor · butik `1r46tp-qx.myshopify.com`
**Konto:** "nya kungen" `730973156224390` (SEK) · sida `820358954504320` · pixel `1785935302094082`
**Skalningskampanj:** `MATSTRUMP_SALES_20260826` (`120251217860260023`), CBO 1 000 kr/dag, 5 adsets
**Fjolårets vinnare:** SnarkLös `1346450049878358`, kampanj `SUSHISTRUMPOR` (`120236400583400074`) — PAUSED, rörs aldrig
**Break-even:** SAKNAS (Axel 2026-09-17: "fuck cogsen"). Kill-golv = ROAS 1,0. Target-CPA = platshållare 397 kr (kampanjens livstids-CPA).
**Senast uppdaterad:** 2026-09-17, körning 1 (`/forsta-batch` → batch #3 briefad)

Äldre minne (2026-08-25 → 2026-09-17) ligger på grenen `claude/build-shrinepro-like-theme-pfalsx`
som `docs/matstrumpor-dna.md`, `docs/matstrumpor-batch-log.md`, `docs/matstrumpor-backlog.md`
och `docs/briefs/010–026.md`. Den grenen har ingen gemensam historik med `main`. Från och med
den här filen är `products/sushi-strumpor/` det minne som gäller på `main`.

---

## ⚠️ LÄS DETTA FÖRST — fyra saker som styr allt annat

### 1. Fjolårets julvinnare FINNS i ett konto kopplingen ser — tvärtemot vad minnet sa

Grenens minne skrev "julvinnaren finns inte i något konto kopplingen ser". Fel. Hela
Q4 2025 + Q1 2026 ligger i **SnarkLös** `1346450049878358` (Grillklinikens konto), 12
kampanjer med "sushi" i namnet: **369 195 kr, 2 506 köp, ROAS 2,51, CPA 147 kr** (nov 2025 →
mar 2026). Kampanj-ID:t `120236400583400074` matchar UTM:erna i Shopify-ordrarna.
Toppannonsen `vid bästa lilla gåvan till julstrumpan` (tre kopior): **107 369 kr, 1 210 köp,
CPA 89 kr, ROAS 4,2**. Transkript + storyboard: `docs/source/matstrumpor-julvinnare-2025.md`
på grenen ovan (kopierat till `batch-03/reference/julvinnaren-2025.md`).

⚠️ Priset var **299 kr + 50 % rea** då, **399 kr + Köp 1 Få 1** nu. CPA går inte att jämföra
rakt över perioderna. Rangordningen *inom* fjolårets period är däremot riktig data.

### 2. Skalningskampanjen förlorar pengar på sin största annons

Lifetime `MATSTRUMP_SALES_20260826` t.o.m. 2026-09-17: 25 834 kr, 65 köp, **ROAS 1,20**.
`MATSTRUMP_sushi_gift_ugc_haikuh3_v1` tar **51 % av all spend** (14 309 kr, 30 köp) på
**ROAS 0,93** — under 1,0, alltså förlust oavsett vad COGS är. Samtidigt får
`MATSTRUMP_sushi_offer_static_d3_v1` (bästa CPA i kontot, 252 kr, ROAS 2,06) 13 % av
spenden och ligger på **frequency 2,46** — den är på väg att slitas ut i sitt lilla adset.
CBO:n har alltså valt fel annons. Det är exakt regel 11:s poäng: nya tester i ett eget
test-ABO med lika budget, aldrig i CBO:n.

### 3. Bildannonser är billigare än video i det här kontot — och var det förra året också

| Period | Bild | Video |
|---|---|---|
| nya kungen SE, bedömbara (aug–sep 2026) | 1 annons, CPA **252**, ROAS 2,06 | 4 annonser, CPA 438, ROAS 1,03 |
| SnarkLös, bedömbara (nov 2025–mar 2026) | 15 annonser, CPA 150, ROAS 2,48 | 43 annonser, CPA 136, ROAS 2,72 |

Förra året bar videon volymen (303 561 kr av 327 375), men **tre produktmakro-statics med
vändningsrad + offerbadge** gick på CPA 119 kr / ROAS 3,04 — bättre än videosnittet. Axels
läsning "vissa bilder går bra just nu" stämmer med datan. Därför är batch #3 bildtung.

### 4. Videovinnaren är en mekanik, inte en person

De fem bästa videorna någonsin (`bästa lilla gåvan` ×3 + `Clean asmr` ×2) är alla **händer +
låda, ingen som pratar i bild, vändningen (rulle → strumpa) upprepad 4–5 gånger**:
141 355 kr, 1 377 köp, **CPA 103, ROAS 3,58**. Talking heads med ansikte (`alla hjärtius`,
`5 anledningar`, `balansen` m.fl., 7 st): CPA 178, ROAS 2,04. Dagens toppspender `haikuh3`
är utan ansikte men har story-hook ("Jag gav min mamma…") i stället för vändningen, hold
12 %, och förlorar. Variabeln är **produkten i första rutan + vändningen inom 2 sekunder**,
inte "ansikte eller inte".

---

## Läget i siffror (2026-09-17)

### nya kungen, SE-kampanjerna (`_20260825` + `_20260826`), 2026-08-01 → 09-17

88 annonser · 28 134 kr · 69 köp · intäkt 32 558 kr (spend × ROAS) · CPA 408 · ROAS 1,16 · AOV 472 kr.
Datakvalitet: `omni_purchase_values` = spend × ROAS på **alla** rader (0 % avvikelse) — fältet
är friskt i det här kontot, precis som avläsning 1 fann. Kontrollen körs ändå varje gång.

| Annons | Spend | Andel | Köp | CPA | ROAS | Bruttobidrag* | Freq | Hold | Läge |
|---|---|---|---|---|---|---|---|---|---|
| `…_offer_static_d3_v1` (bild, 4 lådor) | 3 783 | 13 % | 15 | **252** | **2,06** | **+3 997** | 2,46 | – | Bevisad vinnare (preliminärt: enda bilden med data) |
| `…_gift_ugc_s001h1_v2` (video, grundarberättelse, ansikte) | 1 906 | 7 % | 9 | 212 | 2,52 | +2 902 | 1,79 | 18 % | Lovande — 9 köp |
| `…_gift_ugc_012v2_v1` (video, PIZZA "bluffpizza") | 1 626 | 6 % | 4 | 407 | 0,95 | −80 | 1,46 | 26 % | Osäker (4 köp, fel produkt i sushikampanjen) |
| `…_gift_ugc_haikuh3_v1` (video, story-hook, händer) | **14 309** | **51 %** | 30 | 477 | **0,93** | **−1 072** | 1,30 | 12 % | **Förlorare under golvet** — 30 köp, stabilt |
| `…_gift_ugc_haikuh2_v1` (video, negation-hook) | 2 317 | 8 % | 3 | 772 | 0,52 | −1 120 | 1,13 | 6 % | Förlorare (preliminärt, 3 köp) |
| 83 övriga (0–524 kr, ≤2 köp) | 4 193 | 15 % | 8 | – | – | – | – | – | För tidigt — ingen dom |

*Bruttobidrag = intäkt − spend, **före COGS**. Riktigt vinstbidrag `(break-even-CPA − CPA) × köp`
går inte att räkna utan break-even. Det här är det närmaste datan kommer.

**Utlandskampanjerna** (US/UK/AU, samma videor på engelska, sushisock.com): 21 694 kr, 40 köp,
ROAS 0,94 — förlust före COGS i alla tre. Utanför den här filens uppdrag, men noterat.

### SnarkLös, sushikampanjerna, 2025-11 → 2026-03 (facit för vad som fungerat)

| Grupp (bedömbara ≥300 kr & ≥3 köp) | Antal | Spend | Köp | CPA | ROAS |
|---|---|---|---|---|---|
| Alla bedömbara | 58 | 327 375 | 2 396 | 137 | 2,71 |
| Video, händer + vändningsloop, VO/ASMR (`bästa lilla` ×3, `Clean asmr` ×2) | 5 | 141 355 | 1 377 | **103** | **3,58** |
| Video, talking head med ansikte | 7 | 104 081 | 586 | 178 | 2,04 |
| Video, säsong utan produkt i första rutan (påsk-serien) | 5 | 18 923 | 96 | 197 | 2,17 |
| Video, negativ hook ("anledningar att inte", "reverse") | 4 | 7 474 | 30 | 249 | 1,55 |
| Bild, produktmakro + vändningsrad + offerbadge | 3 | 6 779 | 57 | **119** | **3,04** |
| Bild, AI-scen (rullande band, sushibänk, fiskbil) | 4 | 9 949 | 57 | 175 | 2,13 |
| — varav `Fiskbil` (person i bild, liten produkt) | 1 | 3 550 | 13 | 273 | 1,35 |

---

## Winning DNA (bevisat med köpdata, ≥2 annonser ≥3 köp vardera)

1. **Vändningen som loop, produkten först.** Låda i första rutan, ätpinnar lyfter en bit,
   rullen vecklas ut till en strumpa, upprepat 4–5 gånger på 20–26 s. Händer, ingen talar i
   bild. VO eller bara ljud spelar mindre roll (VO-versionen 89 kr, ASMR 205 kr — båda
   vinnare). *Instruktion:* varje video öppnar med lådan och första vändningen före sekund 2.
2. **Produktmakro + EN vändningsrad + offer som antal.** `inte den du tror … men betydligt
   varmare` (23 köp, CPA 102), `den lilla gåvan som faktiskt används` (26 köp, 138),
   `Ser ut som takeaway. Är 20 par strumpor.` (15 köp, 252 — dagens bästa). Produkten fyller
   minst halva bilden, rubriken ≤ 8 ord, badge med erbjudandet. *Instruktion:* varje static
   i batch #3 bär badge "KÖP 1 – FÅ 1 GRATIS" (eller Köp 2 – Få 2) som fast element.
3. **Positionen "rolig + används efteråt".** Fjolårets body "När kul och praktiskt möts / …
   inte blir liggande i en låda" satt på annonser med ~700 köp. Dagens rubrik "Rolig i kväll.
   På fötterna i morgon." sitter på hela SE-kampanjen (65 köp). Ingen annan säljer den
   kombinationen (konkurrentspaning 2026-08-23). *Instruktion:* behåll som konstant, testa
   aldrig bort den.
4. **Säsongskrok multiplicerar.** Jul (1 210 köp på en annons), Alla hjärtans dag (264 + 35),
   påsk (50 + 28). Samma creative kördes om med ny badge per högtid (`Gamla julbilden alla
   hjärtans dag edition`). *Instruktion:* bygg statics med utbytbart badge-/säsongslager.
   Julbatchen får köras från mitten av september (Q4-playbook).

## Axels regler för den här produkten (skiljer sig från Bäverbutiken)

- **Nya bildannonser läggs i den kampanj som redan kör, i ett adset, utan adset-budget** (Axels beslut
  2026-09-17: "inte en ny kampanj, inga jävla adsetbudgetar, alla i ett adset"). Regel 11:s test-ABO
  gäller alltså inte här. Bygg aldrig en ny kampanj för sushistrumporna utan att Axel ber om det.
  Läs spendfördelningen som Metas val, inte som testresultat.
- Bildannonserna genereras av sessionen (kie.ai + `batch-03/lager.py`), granskas av sessionen,
  läggs i Notion som `To be Reviewed`; Axel ger revision som kommentar på raden. Leverans:
  `batch-03/leverans.mjs` → `To be translated`.

## Losing DNA / förbjudet

- **Story-hook i stället för vändningen** (`haikuh3`: "Jag gav min mamma den ultimata
  oväntade presenten men sen fattade jag…", 14 309 kr, ROAS 0,93). Hooken lovar en berättelse,
  produkten kommer sent. Preliminärt även negation-hooken (`haikuh2` "Köp inte … förrän du
  har sett det här", ROAS 0,52, 3 köp).
- **Negativa listicles** ("5 anledningar att inte köpa", "reverse"): 4 annonser, CPA 249 —
  sämsta videogruppen förra året. (Brief 020 "negative variation" finns redan hos
  redigerarna — läs av den innan fler byggs.)
- **Person i bild med liten produkt** (`Fiskbil`, CPA 273 mot 119 för produktmakro).
- **Fel produkt i sushikampanjen** (`012v2` är pizza, 1 626 kr, ROAS 0,95).
- **Aldrig rea-race:** offer som antal ("Köp 1 – Få 1"), aldrig procent, aldrig "spara X kr".
  Fjolårets "50 % rea" var på 299 kr; dagens pris är 399 kr med Köp 1 Få 1 — **299 kr,
  "50 %" och "3-par 369 kr" är förbjudna i all ny copy.**
- **Aldrig "unna dig"-avataren** (Axels beslut 2026-09-14). Avataren är givaren: 69 % av
  köparna 50+, 59 % kvinnor (kundanalys 2025-11 → 2026-03, förnamnsproxy).
- **Aldrig storlek** ("onesize", "36–44") i annonser (Axels beslut 2026-09-14), aldrig
  materialpåståenden, aldrig påhittade citat, aldrig "lurad".
- **Aldrig aktivera något som är PAUSED** — SnarkLös-kampanjerna, `_20260825`, US/UK/AU.

## Hypoteser (märkta, ej bevisade)

- H1 **Offer synligt i creativen lyfter konvertering** — d3 (badge) 2,06 mot haikuh3 (inget
  offer i bild) 0,93; fjolårets badge-annonser toppade. Test: 037 (textfri kontroll) mot 029.
- H2 **Vändningen som stillbild** (rulle ↔ strumpa i split) bär lika bra som i video — 030.
- H3 **Anti-presentkort** (Paket D, Axels idé 2026-08-24) — konfliktvinkel, aldrig körd — 032.
- H4 **Verklig siffra som social proof** ("2 576 sushilådor förra julen") slår adjektiv — 033.
- H5 **Mottagarvana riktad till givaren** ("Till den som alltid beställer extra lax") — 034.
- H6 **Fyra-lådors-paketet säljer till pappan/farfar** ("alla klappar lösta"): 599-bundlen
  var 8–9 % av ordrarna, männen köpte oftare flerpack (47 % mot 41 %) — 035.
- H7 **Hold rate skiljer videor åt, hook rate gör det inte** (autoplay 94–97 %) — från
  avläsning 1. I dag: hold 6–26 % utan tydlig koppling till köp (012v2 26 % hold, ROAS 0,95).
  Fortfarande obevisad.

## Copy-tillgångar

- Paket A–E (sonnet 2026-08-24, helgrönt tre-frågorstest): `docs/matstrumpor-copy-2026-08-24.md`
  på grenen; E1 = kontots primärtext. BOGO-copy D1–D4/C/F/E: `docs/briefs/sushi-bogo-2026-08-27/COPY.md`
  (gren `claude/sushi-strumpor-ad-swipes-y1d0ke`).
- Batch #3:s copy: `products/sushi-strumpor/batch-03/` (sonnet 2026-09-17).
- Bevisade rader: se Winning DNA 2 och 3. Reserverad: "minst tio personer jag måste ge det
  här till" (fjolårets VO) — bor i Axels bodies 027/028.

## Pågående hos redigerarna (rör inte, dubblera inte)

Notion-hubben "Matstrumpor creative hub" 2026-09-17: 017 v1/v2, 019, 020 (negative variation),
021 live i kontot sedan ~14/9 (0–42 kr); 022 "Högen", 023 "Samtalet", 024 "Julvinnaren som
text-on-screen", 025 "Hjärnan är tom", 026 "Takeaway-påsen" (claymation), 027/028 (Axels
UGC-bodies favoriträtten/julstrumpan) i Draft/In progress; B_Mini-clip_UGC_01–05 (Gilz) i
Creative strat review. Alla är talade UGC/story-format. Batch #3 är därför bild + faceless
vändningsvideo — det som datan säger saknas.

## Backlog

Se `products/sushi-strumpor/backlog.md`.
