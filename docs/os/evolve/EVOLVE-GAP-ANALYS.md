# Evolve-kursen mot vårt creative strategy-OS: var vi läcker (2026-10-01)

Axels frågor samma dag: vad i Evolve ska vi bryta ner, har vi ett arkiv som spårar allt
vi testar (annonser, koncept, variationer) för Matstrumpor Kungen, vad ska vi fördjupa i
UGC och ren produktvideo, och vad kan automatiseras eller läggas på VA:erna. Och hans
beslut: *"iterations playbooken är något vi behöver fördjupa oss i"*.

Underlaget: hela kursträdet läst ur Skool (`KURSTRAD.md`), iterationsmodulen i sin helhet
(`ITERATIONS-PLAYBOOK.md`), Evolves öppna dokument (definitioner, Growth Guide 3.0,
namnmallar, media buying 2026, promptdokument, Claude-skillen `ad-iteration-skill/`), och
tre granskningar av repot (Matstrumpors logg och kod, kursens täckning i rutinerna,
dokumenten mot våra trösklar). Alla siffror nedan kommer ur repot eller kursen.

---

## 1. Arkivet: finns det? **Delvis — och det lagrar inte av sig självt.**

Evolves tracker heter **Growth Guide 3.0** (ett Google Sheet, "the #1 system that has
helped 43+ brands scale to $100k/day"). Flikarna: Overview (hit rate för annonser och
sidor), Log, **Ad Roadmap**, CRO, Page Roadmap, Desires/Core Avatar, Sub Avatars/Angles,
Avatars, Awareness, Creators. Ad Roadmap har en rad per batch med kolumnerna:

`STATUS · UPVOTE · BATCH # · DATE ADDED · AUTHOR · AD CONCEPT · DESIRE/CORE AVATAR ·
SUB AVATAR · ANGLE(S) · BREAKTHROUGH MEMO · AWARENESS LEVEL · FILE TYPE · AD TYPE
(IDEA/ITER/IMIT) · LINK TO BRIEF · LINK TO AD · RESULTS · LEARNINGS · Ad Variable ·
Test Result · Learnings`

Det vi har för Matstrumpor (`matstrumpor/logg.jsonl`, 245 rader 2026-10-01):

| Evolve-kolumn | Vi | Var | Skrivs av |
|---|---|---|---|
| Batch, koncept, avatar, awareness, begär, mekanism, tro, urgency, hook-typ, talare | ✅ | BRIEF-raden + VARIABELTAGGAR i `brief.md` | sessionen, för hand — **bara de 12 briefer kungen skrivit; de 96 äldre annonserna saknar taggar** |
| AD TYPE (IDEA/ITER/IMIT) | ✅ `typ` | BRIEF-raden | sessionen |
| Iteration + förälder | ✅ `iteration`, `parent` | BRIEF-raden | sessionen — `parent` pekar alltid på roten, aldrig på förra iterationen |
| RESULTS (spend, köp, ROAS, CPA, hook, hold) | ⚠️ | `matstrumpor/output/avlasning-<datum>.json` | koden, men **mappen är gitignorerad: siffrorna dör med containern**. Det enda som sparas är dag 7-etiketten, en gång |
| LEARNINGS | ✅ | LARDOM-raden + `products/matstrumpor/lardomar.md` | sessionen |
| Link to ad / Link to brief | ✅ | UPPLADDAD `annons_id`, BRIEF `notion_page_id` | sessionen — **11 UPPLADDAD-rader, alla från 21/9; mini-klippen 25/9 och Katarina saknas** |
| Hit rate (andel vinnare per batch, per källa) | ❌ | — | räknas aldrig |
| Antal variationer per koncept, iterationskedja | ❌ | namnet bär `_v<n>` och h1/h2 men **inget räknar det** | — |
| Vinstbidrag per vinkel/hook/format/kreatör över tid | ❌ | krävs av ANALYSMETOD 6b, lovas i briefen, finns inte i koden | — |
| Creators (kreatörsnivå) | ❌ | bara fritext `talare=` | — |
| Thumbstop/tittartid (p25–p100), CTR, CPM, landningssida per annons | ❌ | inte i `meta.mjs` INSIGHTS_FALT | — |
| Utlandet (14 kampanjer från 2/10) | ❌ | `--hamta` läser bara `MATSTRUMP_SALES`; `namn.mjs` känner inte `MATSTRUMP_NO_…` | — |

`konceptStatus` i `lardom.mjs` (som ska säga när ett koncept är slut-testat) är inte
inkopplad och räknar fel: den svarar SLÄPP på nathalie fast 0 av 9 iterationer har utfall.

**Domen:** det är en händelselogg som sessionen skriver för hand, inte ett arkiv. När
sessionen hoppar över ett steg (uppladdaren 25/9) blir det hål. Minsta bygget som ger
Axel det han frågar efter:

1. `matstrumpor/arkiv.json`, committad: en post per Meta ad-id med tolkat namn (vinkel,
   format, nummer, hookvariant, version), koncept, parent, iteration, typ, kreatör,
   landningssida, adset, etikett, lärdom, brief, och `matningar[]` per avläsning (spend,
   köp, ROAS, CPA, visningar, klick, LPV, hook, hold, p25–p100, CTR, CPM, vinstbidrag).
   **Koden i `--hamta`/`--dom` skriver den, inte sessionen.**
2. `kor.mjs --arkiv`: varianter per löpnummer och koncept, kedjan förälder → barn,
   vinstbidrag per vinkel/format/hook-typ/kreatör/koncept, hit rate per källa
   (research/iteration/imitation), konceptstatus — rätträknad.
3. UPPLADDAD skrivs av en kodfunktion i `/matstrumpor` (inte `node -e`), med `landning`,
   `koncept`, `kreator`; OMDOPT uppdaterar brief → annons.
4. `meta.mjs`: `video_p25/p50/p75/p100_watched_actions`, `cpm`, `ctr`; läs alla
   `MATSTRUMP_<LAND>_SALES`; namnmönstret tillåter landskod.

## 2. Kursen modul för modul: vad är inbyggt?

| Modul | Läge | Kort |
|---|---|---|
| A2 Psychology (begär, awareness, sofistikering, tro) | Delvis | taggarna finns, men ingen regel väljer begär/nivå åt en brief; 11 av 12 Matstrumpor-briefer bär `begar=status` |
| A3 Research | **Lucka** | `/matstrumporkungen` briefar bara ur lärdomar: 10 av 12 är iterationer, 0 ur VoC. Enkäten live 1/10 men inget läser den. `/kommentarer` hoppar över Matstrumpor |
| A4 Structure Insights (Growth Guide, avatarer × begär) | Delvis per annons | ingen tavla på brandnivå: avatar × massbegär × awareness. Därför syns inte att alla briefer kanaliserar samma begär |
| A5 Plan Ads (angles, 3 testmetoder, Growth Guide) | Inbyggt | BRIEF-REGI + brieftaket. Men `/briefgranskning` undantar Matstrumpors hub ⇒ **Matstrumpors briefer granskas aldrig av en creative director** |
| A6 Make Ads | Delvis | redigeringshantverket (retention, safe zones) är inte regler |
| A7 Run Ads (3:2:2, champions, 7 dagar) | Delvis | regel 11 kommer härifrån. Men 51 av 96 etiketter är INGEN_LEVERANS: nya videor i `nya16`/`jul_video` fick 5 618 kr på 45 annonser, `09-17 UGC` 60 863 kr |
| A8 Manage Ads (scaling) | Med flit av | Axel skalar Matstrumpor själv (beslut 2026-09-21) |
| A9 Analyze Ads (learnings, iterations) | Inbyggt | etiketterna är Evolves; men `kalla` saknas i etikettraden ⇒ träffsäkerhet per idékälla går inte att mäta |
| A10 Get UGC (Insense, briefer till kreatörer, ambassadörer) | **Lucka** | enda breakthrough är en riktig människa (Nathalie); AI-personer är döda koncept; ändå föreslår kungen aldrig en UGC-beställning |
| A11 Whitelisted/partnership ads | Saknas | 0 träffar i repot |
| A13 Product Research | Delvis | produkttest-trappan finns, kursens metod inte |
| B Copywriting (principer, hookar, bridge, storytelling, positioning, toolkit) | **Saknas** | alla granskningar dömer mot Harry Dry (`docs/copy-regler.md`), inte Evolve. Programmet var inte läsbart förrän i dag |
| B7 How To Do Iterations | Delvis | CS-KLART 9/18: "tre iterationer på en vinnare". Playbooken (felkatalog per utfall, 9 manus- + 15 formatiterationer, 10 steg) fanns inte — nu i `ITERATIONS-PLAYBOOK.md` |

Frågor som redan ställts till Chadbot (fråga inte igen): Klaviyo/flöden (`klaviyo/evolve/`),
ägarens KPI:er, roller och team (`stonebite/evolve/`), tacksidans upsell
(`factory/tacksida/`), Messenger (`messenger/`), köparenkäten och CRO-enkäten
(`docs/os/evolve/`).

## 3. De fem största läckorna, i ordning

1. **Iterationerna görs utan playbook.** Nathalie är briefad till iteration 9, men ingen
   av 053–064 har en etikett i loggen än, och briefen väljer iteration utan Evolves
   diagnos (vilket av de 14 felen, vilken av de 24 iterationerna). Kursens regel: lärdomen
   först, sedan iterationen; "extended problem section" och "awareness levels" är de två
   första iterationerna på varje vinnare.
2. **Svälten.** Hälften av allt som laddats upp har aldrig fått leverans. Kursens 3:2:2
   säger: ett koncept = ett adset med 3 varianter, max koncept per vecka = budget ÷
   target-CPA, stäng på adset-nivå efter 7 dagar. Vi lägger nya videor i adsets som
   svälter bredvid `09-17 UGC`. Förslaget ROUTING (30/9) väntar på Axel.
3. **Research in i briefen.** Kursen: "most winners come from ideation", minst 1 av 10
   annonser ur ny research. Vi: 0 av 12 ur VoC. Enkäten, kommentarerna och recensionerna
   läses inte in i `/matstrumporkungen`.
4. **UGC-maskinen.** Kursens 2026-strategi är volym: kreatörer via Insense/Trybe, varje ny
   kreatör gör tre videor (kopiera vinnaren ordagrant, iterera på den, imitera dagens
   virala), vinnande kreatörer blir ambassadörer med feedback-loop. Vi har en kreatör som
   vann och ingen beställningsrutin.
5. **Copyn döms mot fel bok.** Tre-frågorstestet är Harry Dry. Evolves hookregel (känsla +
   nyfikenhetsgap + hög insats, 90 % kvar efter 6 s, börja i handlingen, noll backstory,
   begriplig utan ljud) och de nio komponenterna står inte i `copy-regler.md`.

## 4. UGC och ren produktvideo: vad vi vet och vad vi fördjupar

**Mätt (`products/matstrumpor/dna.md`, `lardomar.md`, 7d_click):**
- Nathalie (riktig kvinna, eget kök, vännen skrattar, "sålde slut i november"): breakthrough.
  Vecka 1: 5 001 kr, 29 köp, ROAS 2,42. 14 dagar till 26/9: 32 703 kr, 173 köp,
  +16 069 kr vinstbidrag, 88 % av spenden.
- `offer_static_d3` "Köp 2 – få 2" (bild): KPI winner, 6,7 % köp per LPV, bäst i kontot,
  drar tvålådsköpare (623 kr mot Nathalies 417 kr).
- `haikuh3` (klippkompilation, "tre skäl"): spend winner, ROAS 0,98, hold 77,5 % — håller
  publiken, konverterar inte. `haikuh2` "Stopp! Köp inte": loser. `s001h1` AI-kvinna:
  hook 9,8 %, ROAS 1,40 — dött koncept. `012v2` AI-bildspel: loser.
- Sofie (riktig kvinna utan musik, ensam i bild): 18 + 12 kr, ingen dom.
- Ren produktvideo har alltså **ingen mätt vinnare**. Det enda utan människa som tjänar
  pengar är bilden med erbjudande.

**Fördjupa, UGC (kursens playbook tillämpad på Nathalie):**
- Formatiteration #2: samma komponenter till **2–3 nya kreatörer**, tre videor var
  (kopiera / iterera / imitera). Sofie och Katarina är de två som finns; båda ska in i
  `09-17 UGC`, inte i ett svältande adset.
- Manusiterationer i ordning: #5 längre problemdel, #6 en awareness-nivå upp (problem-aware:
  "julklappen som alltid blir fel") och ner (product-aware: erbjudandet i bild),
  #7 invändningarna ur kommentarerna (leveranstid, "kina", material), #3 bridge på fakta.
- Komponentgranskning av Nathalie (steg 5 i tiostegsprocessen) innan nästa brief: vilken
  av de nio komponenterna bär den? Hypotesen i `lardomar.md` är "vännen skrattar" — det är
  valens/intensitet + social proof, inte mekanism.
- Kursens A10: kreatörsbrief med ramverk (hook/bridge/hold + B-roll-lista), ambassadörer,
  feedback-loop. Vi har en SOP (`SOP-03`) men ingen rutin som beställer.

**Fördjupa, ren produktvideo:**
- `haikuh3` är en spend winner och ska enligt playbooken få #9 urgency, #10 stakes och
  #11 funnel-kongruens (landningssidan säger inte samma sak som "tre skäl"). Inte fler
  hook-varianter.
- Formatiterationer utan människa som kursen rekommenderar: #1 VO ↔ text på skärm,
  #9 AI-narration OVANPÅ produktvideon (inte en låtsasperson), #11 native/kamouflage ur
  Nathalies manus, #6 AI-sång (billigt att prova).
- Bilden med erbjudande (d3) är KPI winner med låg spend-andel. Playbooken: det är väntat
  för en offer-annons; iterera den som bild (ny rubrik ur Nathalies hook, "Köp 2 – få 2"
  kvar) i stället för att försöka få den att skala.

## 5. Så kommer playbooken in i `/matstrumporkungen`

1. **Steg 5 i kommandot (lärdomen):** för varje KPI_WINNER/SPEND_WINNER/BREAKTHROUGH, och
   för LOSER med ≥ 300 kr: diagnos mot felkatalogen (nummer 1–14) + de nio komponenterna,
   skriven i LARDOM-raden som `fel: [..]`, `komponenter: {..}`. Hookarna ordagrant ur SRT
   (`pipeline/scribe.mjs`) — det är steg 4, och det kan koden göra.
2. **Steg 6 (briefen):** varje iteration pekar på ett fel och en iteration ur playbooken
   (`iteration_typ: manus-5` / `format-2`), `parent` = annonsen som itereras (inte roten),
   `typ` IDEA/ITER/IMIT i namnet. Första två iterationerna på en vinnare är alltid #5 och
   #6 om inte lärdomen säger annat.
3. **Namnregeln:** `_ITER<n>_<orig-nummer>` i annonsnamnet så kedjan går att läsa ur kontot
   (Evolves `ITER#N_BATCH#ORIG`). `namn.mjs` tolkar det, `--arkiv` räknar det.
4. **Etiketten omprövas vecka 2–3**, inte bara dag 7 (kursen: en KPI winner kan bli
   breakthrough vecka 2). `etikett.mjs` får ett andra fönster.
5. **Rapporten** visar per vinnare: utfall, diagnos, vilka iterationer som körts, vilka
   som återstår, och hit rate per källa.

Evolves egen skill (`ad-iteration-skill/SKILL.md`) bygger på Figma + Google Sheet och en
intervju med en människa. Det vi tar är frågorna (de nio komponenterna, hypotestonen,
"skriv tillbaka till Growth Guiden"); tavlan ersätts av `arkiv.json` + rapporten.

## 6. Automatisera och lägga på VA

**Kursmoduler som är VA-arbete rakt av** (engelska lektioner, action items per steg):
- A10 UGC: processa kreatörer, shortlist, skicka ramverk, följa upp, ladda upp innehåll,
  kontakta vinnande kreatörer, onboarda ambassadörer (lektionerna "How To Process
  Creators", "Sending Frameworks", "Follow Up & Upload", "Onboard Brand Ambassadors").
- A3 Research action items: Amazon/Reddit/YouTube/TikTok/Answer The Public-research in i
  ett research-dokument per produkt — vi har 0 `produkt.md`/`avatar.md` i `products/`.
- CRO-kursens "Customer Feedback" (giveaway + enkätdata i ett ark) och Q4:s
  sälj-checklista (annonsbarer, startsida, kassan visar besparing, QA).

**Det Axel gör själv i dag som kan flyttas** (ur repot): starta sessionen för
`/matstrumpor`-uppladdningen (kräver Adsmanager-MCP), ladda upp sin egen UGC, svara på
Matstrumpors kommentarer, leverantörsmejlen om kostnad per land, Judge.me-rättningarna
(polskan, felmärkta recensioner), schemalägga Spoks-utkasten (121 st), Shopify-ärendet om
Taiwans ID-fält, logga kvoten. **Stannar hos Axel:** besluten på förslagen (budget, pausar,
ROUTING), domänköp, annonsörsverifiering, app-tokens, nya produkter.

## 7. Trösklarna: Evolve mot `etikett.mjs`

*(fylls i ur dokumentjämförelsen — se nedan)*

## 8. Det som återstår att fråga Chadbot (inte ställt förut)

- Hur de hanterar en breakthrough-UGC när kreatören bara gjort EN video: beställa fler av
  samma person eller sprida manuset på nya kreatörer först?
- Spend winner med hög hold (77 %) men låg CVR på en lågprisprodukt (~45 USD): funnel eller
  urgency först?
- Hur de räknar hit rate per idékälla (research/iteration/imitation) och vilken nivå som
  är normal på $5–15k/mån.
