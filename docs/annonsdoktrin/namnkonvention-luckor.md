## 1. Den exakta namnkonventionen (citerad ur `/home/user/yognftnfgn/docs/naming-convention.md`)

Tre nivåer: `CAMPAIGN → ADSET → AD`.

**Campaign:** `{BRAND}_{OBJECTIVE}_{YYYYMMDD}` — ex. `MAGI_SALES_20260703`
- BRAND — kort kod: `MAGI`, `SNARK`, `MATSTRUMP` (README lägger till `GRILL` för Grillkliniken)
- OBJECTIVE — `SALES`, `TRAFFIC`, `LEADS`, `AWARENESS`, `ENGAGE`
- YYYYMMDD — startdatum

**Ad set:** `{AUDIENCE}_{PLACEMENT}_{OPTIMIZATION}` — ex. `broad_advplus_purchase`, `LAL1-purchasers_reels_purchase`
- AUDIENCE — `broad`, `LAL1-purchasers`, `int-grilling`, `retarget-atc`
- PLACEMENT — `advplus`, `feed`, `reels`, `stories`
- OPTIMIZATION — `purchase`, `atc`, `lpv`, `lead`, `traffic`

**Ad (här bor testandet):** `{BRAND}_{PRODUCT}_{ANGLE}_{FORMAT}_{HOOK}_v{N}` — ex. `MAGI_brush_pain_beforeafter_stains_v1`

ANGLE (8 koder): `pain` (problem/smärtpunkt), `benefit` (konkret nytta/resultat), `social` (social proof, recensioner), `offer` (rabatt/deal), `curiosity` ("det här visste du inte"), `authority` (expert, testvinnare, garanti), `fomo` (brådska, slut i lager), `identity` ("för dig som är X").

FORMAT (8 koder): `product` (ren produktbild på bakgrund), `lifestyle` (produkt i verklig miljö), `ugc` ("Ser ut som kund-content, **mobilfoto**"), `beforeafter` (före/efter, split), `meme`, `textheavy` (grafik med stor rubriktext), `comparison` (vi vs dem), `collage`.

HOOK: "kort slug, fritt men konsekvent … Håll det till 1–2 ord: `stains`, `2sec`, `grossout`, `winter`, `giftidea`, `soldout`, `guarantee`."

De fyra reglerna, ordagrant:
1. Bara små bokstäver i ad-namn, `_` mellan fält, `-` inom ett fält.
2. Ändra en variabel i taget när du testar rent.
3. Döp aldrig om en annons som fått data — skapa ny med bumpat `v{N}`.
4. "Om ett fält inte passar in i vokabulären: lägg till det i listan här *först*, kör sen."

Parsern är **positionell** — namnet splittas på `_` till kolumnerna brand/product/angle/format/hook/version. Allt nytt måste alltså antingen rymmas i befintliga fält eller läggas **sist** för att inte bryta gamla namn.

En UGC-brief mappar därför rakt in som: `BRAND` = butik/marknad, `PRODUCT` = produktslug, `ANGLE` = manusets persuasionsvinkel, `FORMAT` = videoformat, `HOOK` = de första 3 sekunderna som slug, `v{N}` = klippversion.

## 2. Vokabulärvärden som saknas för UGC-video

**Det finns inga video-koder alls.** Konkret vad som fattas och förslag som följer systemets egen logik (regel 1 tillåter `-` inom ett fält, vilket gör alla tillägg nedan bakåtkompatibla med den positionella parsern):

**a) FORMAT är helt stillbilds-definierat — och `ugc` är redan upptaget av statics.** I `winning-lines.md` används `GRILL_mastern_social_ugc_citat_v1` för ett **citat-kort**, alltså en bild. Döper man video till `ugc` går photo-UGC och video-UGC inte att skilja åt i datan. Föreslagna tillägg till FORMAT-tabellen:

| Kod | Betydelse |
|---|---|
| `ugcvideo` | Kreatör i bild, mobilkamera, talar till kameran |
| `talkinghead` | Ren monolog, ingen produktdemo |
| `demo` | Produkten i drift, händer i bild, ev. voiceover |
| `unboxing` | Paket → produkt, förväntan/leverans |
| `voiceover` | B-roll/produktklipp + röst, ingen person i bild |
| `beforeafter-video` | Före/efter som rörlig sekvens (skiljd från statiska `beforeafter`) |
| `splitscreen` | Video-motsvarigheten till `comparison` |
| `slideshow` | Bildsekvens klippt som video (billigast, ingen kreatör krävs) |

**b) Hook-typ för rörligt saknas.** HOOK är definierat som "det första ögat/hjärnan fastnar på" i en bild. För video är hooken en *replik + öppningsbild* under 3 sekunder. Behåll slugen men lägg till en kontrollerad typprefix inom fältet: `{hooktyp}-{slug}`, t.ex. `pov-morgon`, `claim-2sek`, `q-vissteduatt`, `demo-lera`, `neg-kopintedenna`. Föreslagna hooktyper: `pov`, `claim`, `q` (fråga), `demo`, `problem`, `callout` ("för dig som…"), `neg` (varning/negativ), `story`.

**c) Kreatörs-ID saknas helt.** Det är den direkta blockeraren för en UGC-kreatörslista: utan kod i namnet går det inte att skära insights per kreatör, vilket är hela poängen med att ha en lista på vilka som funkar. Förslag: **valfritt sjunde fält sist**, `_c{NN}` (t.ex. `_c07`) — gamla namn saknar index 6 och parsern faller tillbaka på null utan att bryta.

**d) Marknad/språk saknas.** Fem kloner med samma sortiment och översatta titlar producerar **identiska ad-namn** i SE/NO/FI/UK/DK. Lös i BRAND-fältet med bindestreck (lagligt enligt regel 1, och grupperbart på prefix): `bever-se`, `bever-no`, `bever-fi`, `bever-uk`, `bever-dk`. Ingen ny brandkod finns idag för Bäverbutiken över huvud taget — vokabulären listar bara `MAGI`, `SNARK`, `MATSTRUMP` (+ `GRILL`).

**e) ANGLE saknar `trust`.** Playbookens **högsta ROAS i skala (2,47, ad 049)** är "Trust / anti-scam" — och den vinkeln har ingen kod. I `winning-lines.md` tvingades den in som `GRILL_mastern_social_product_trust_v1`, dvs. angle=`social`, hook=`trust`. Samma insikt kodas alltså på två olika sätt i två olika dokument. Föreslå `trust` som nionde ANGLE-kod (riskreversering, garanti, "du får exakt vad du ser") innan UGC-manus börjar skrivas — annars ärver UGC-flödet felkodningen.

**f) Ingen dimension för längd/format-ratio.** PLACEMENT har `reels`/`stories`, men inget säger 9:16 vs 4:5 eller 15s vs 30s. Pipelinen är dessutom hårdlåst till 4:5 (`pipeline/brand.mjs`: `CANVAS = { w: 1080, h: 1350 }`). Rekommendation: håll längd/ratio **utanför** namnet (det skulle bli ett sjunde variabelfält) och lägg det som kolumn i trackern istället.

**g) Ingen statuskod för "chill".** Legenden har `📝 draft · 🟢 live · ⏸️ paused · 💀 killed · 🚀 scaling`. Ägarens uttryckliga önskemål — "låta produkter chilla på en hög roas" — har ingen status. Föreslå `🧊 chill` = lönsam, budgetlåst, ingen skalning.

## 3. Så är ad-trackern strukturerad (kolumner volymmallen ska referera till)

`/home/user/yognftnfgn/docs/ad-tracker.md`, sex sektioner:

1. **Legend** — Status: `📝 draft · 🟢 live · ⏸️ paused · 💀 killed · 🚀 scaling`. Tro: `🤖 Claude · 🧑 Du · 🤝 båda`.
2. **Kontext** — Brand · Produkt · Ad account (konto-ID + valuta, med noten "kontonamn ≠ brand") · Funnel-fokus · länk till research.
3. **Pipeline (idéstadie)** — tabell: `# | Ad-namn | Angle | Format | Min tro 🤖 | Din tro 🧑 | Status`, status `💡` = idé, ej byggd. Conviction-legend `🟢 hög · 🟡 medel · ⚪ håll igen · 🔴 pensionerad`.
4. **Aktiva tester** — ett block per annons, med exakt dessa fält: `Status` · `Skapad: YYYY-MM-DD` · `Konto / kampanj` · `Variabler: angle=… · format=… · hook=…` · `Hypotes (varför vi tror på den)` · `Tro` · `Vad vi testar mot` · `Resultat: spend · CTR · CPC · CPM · CPA · ROAS` · `Verdict & lärdom (scaling / iterera / killed — och varför)`.
5. **Vågor** — tabell: `Våg | Datum | Vad vi testar | Antal ads | Status`. ← **Det här är kroken för volymmallen.** Kolumnen `Antal ads` är redan den storhet ägaren vill styra; volymmallen ska definiera den som funktion av spend och BE-ROAS istället för att införa en egen parallell tabell.
6. **Kyrkogård (killed)** — tabell: `Ad | Variabler | Varför dödad | Lärdom`.

Vad som **inte** finns i resultatraden och som volym-/skalningsmallen måste tillföra: **BE-ROAS**, **ROAS vs BE** (marginalen över break-even), **budgettak**, och **video-metrics**. Namnge dem som PNL-appen gör så att panelen och trackern talar samma språk — `pnl-app/app/lib/texts.ts` använder `thBeRoas: "BE ROAS"` och `thCmPerUnit: "TB/st (valuta)"`.

## 4. Bevisade angles/hooks som kan återanvändas som UGC-manus

Ur `playbook.md` (rankade på egen data) och `winning-lines.md` (SnarkLös top spenders 4 maj–3 juli 2026):

**Angles, rankade:** 1) Auktoritet/story (110 "Grilltekniker" ~115k, 101 "Farfar" ~136k — mest spend *och* högst CTR 4,8–6,6%) 2) Trust/anti-scam (049, ROAS **2,47**, högst i skala) 3) Problem → smak (088, ROAS 2,36) 4) Skydda investeringen (128, ~73k) 5) Social proof/kundcitat (050, ROAS 2,12).

**Hooks värda att bli talmanus (bank i `winning-lines.md`):** H1 "Jag har öppnat tusentals grillar…" (mest köpta), H2 "Det är därför köttet smakar som det gör." (högst CTR 5,7%), H3 "Du skyller på köttet. Det var aldrig köttet.", H5 "Frun säger att det smakar bränt. Du vet att du inte brände det.", H8 "Du kontrollerar temperaturen. Du vilar köttet. Och sen lägger du allt på den smutsigaste ytan i hela din setup."

**Bank-strukturen är det verkligt återanvändbara:** "Varje static = **1 hook** (störst text) + ev. **1 bevis** + **1 mekanism/CTA**. Plocka en ur varje hylla." Hyllorna är 🎣 HOOKS (H1–H8), 🛡️ BEVIS (B1–B5), ⚙️ MEKANISM (M1–M4), 💬 SOCIAL PROOF (S1–S3), ✅ TRUST/CTA (C1–C3). Ett UGC-manus mappar rakt på den: **hook (0–3s) → bevis (3–10s) → mekanism/demo (10–20s) → trust/CTA (20–30s)**, och varje rad i manuset kan citera bank-ID:t.

**Vad som är förbrukat och inte ska in i UGC-manus:** säkerhet/borststrån som huvudkrok (mättad — lever som bevis-rad B4), "tre anledningar"/ren mekanism (145, svagast ROAS 1,36), rabatt som huvudvinkel ("syns inte bland vinnarna; håll priset").

**Viktig varning:** all denna bevisade data kommer från **Grillkliniken/Mastern (999 kr, en produkt, BOF)** på SnarkLös-kontot — inte från Bäverbutiken. Det är *strukturen* (angle-rankningen, hylle-modellen, 2-testers-regeln) som överförs, inte lines:en.

## 5. Konkreta krockar och luckor mot ett UGC-flöde

1. **Hela repot är enproduktsystem, ägaren frågar om ett 119-produktsystem.** README: "Produkt vi kör ads för: Mastern … (enda produkten just nu)". Trackern har *ett* Kontext-block med *en* produkt och *ett* ad-konto. Med 119 produkter över 5 marknader behövs antingen en tracker-fil per butik eller en obligatorisk produktrad-nivå — annars kollapsar filen. Rekommendation: behåll `ad-tracker.md` som format och lägg volym/skalningsstyrning i ett eget dokument som *refererar* trackerns kolumner.

2. **`ugc` betyder redan "mobilfoto", inte video** (se 2a). Direkt namnkrock som måste lösas innan första UGC-vågen döps.

3. **Ingen kreatörsdimension någonstans** — inte i namnet, inte i trackern. Kreatörslistan blir ett dött dokument om man inte kan svara "vilken ROAS drar kreatör X över alla produkter". Kräver `_c{NN}` i namnet + en `Kreatör`-kolumn i pipeline-tabellen.

4. **Ingen produktekonomi i trackern.** Resultatraden är `spend · CTR · CPC · CPM · CPA · ROAS` — **utan BE-ROAS**. Med spannet 1,23x–3,11x är en ROAS på 1,9x en vinnare på en produkt och en förlust på en annan. Verdict-fältet ("scaling / iterera / killed") är alltså idag omöjligt att fylla i korrekt för Bäverbutiken. Måste bli `ROAS / BE-ROAS = marginalkvot` innan någon volym- eller skalningsregel kan skrivas.

5. **Playbookens 2-testers-regel skalar inte till 119 produkter.** "En insikt får flytta in hit först när den bevisats i minst 2 oberoende tester." Med TB 189 kr/order och medianpris 329 kr kommer de flesta produkter aldrig få två rena tester. Insikter måste kunna bevisas **på tvärs** (kategori: fiske/båt/MC/trädgård, eller systemnivå) — annars fylls playbooken aldrig. Kräver ett explicit tillägg om bevisnivå: produkt / kategori / system.

6. **Regeln "ändra en variabel i taget" krockar med hur UGC produceras.** En kreatör levererar en färdig video där skådespelare, manus, hook och miljö ändras samtidigt. Behövs en UGC-specifik testregel: *samma manus + olika kreatör = kreatörstest; samma kreatör + olika hook = hooktest; allt annat = konceptstest (räknas inte som rent test)*.

7. **Regel 3 (aldrig döp om, bumpa `v{N}`) är tvetydig för video.** Vid UGC klipps ofta 5 hookvarianter ur *samma* råmaterial. Definiera: ny hookslug = ny annons; `v{N}` = ny klippversion av samma hook + samma kreatör.

8. **Benchmarks saknar video-metrics.** Playbookens tabell har `CTR (link)`, `CPM`, `Hook rate / thumbstop`, `CPA vs mål`, `ROAS` — men inga 3s-views/ThruPlay, hold rate eller genomsnittlig visningstid. Utan dem kan en UGC-video inte döms innan den hunnit få köp, vilket är just vad man behöver vid låga budgetar.

9. **Ingen budget-/skalningsdimension existerar i namnen.** Ad set-namnet (`{AUDIENCE}_{PLACEMENT}_{OPTIMIZATION}`) har varken budget, CBO/ABO eller tak. Ägarens "max budget per produkt så de inte tar över" kan alltså inte läsas ur konto-strukturen — den regeln måste bo i ett dokument + en trackerkolumn, och budgettaket bör sättas som funktion av produktens BE-ROAS (låg BE-ROAS = högre tak).

10. **"Chilla på hög ROAS" har ingen status.** `🚀 scaling` och `⏸️ paused` täcker inte "lönsam, rör den inte". Kräver `🧊 chill` i legenden + en definition (t.ex. ROAS ≥ 1,5× BE-ROAS, budget låst, ingen creative-rotation).

11. **Pipeline-koden är statics-only.** `pipeline/brand.mjs` är Grillkliniken-låst (färger, `LOGO_WORDMARK = 'GRILLKLINIKEN'`, 4:5-canvas), vågformatet `waves/wave-XX.mjs` bygger `basePrompt` + `overlay` — ingen struktur för videoklipp, brief eller kreatörsleverans. Pipelinens egen roadmap listar "Video-varianter via Higgsfields video-endpoints" som **ej byggt**. Ett UGC-flöde har alltså ingen kodmotsvarighet idag; manifest-formatet (`_manifest.json` per våg) är den naturliga platsen om det ska byggas.

12. **UGC-kostnaden bokförs ingenstans i annonssystemet.** Kreatörer köps per uppdrag; trackern har ingen kostnadskolumn. PNL-appen har däremot fasta kostnader (`prisma/migrations/20260811010000_fixed_cost`) — UGC-arvoden hör hemma där, annars ser en produkt lönsam ut trots att kreativet kostade 2 000 kr. Volymmallen bör peka ut var kostnaden loggas.

13. **Valuta-fällan är dokumenterad men ej kodad i namnen.** Annonskontona betalar i SEK även för NO/FI/UK/DK-butikerna medan intäkten är i NOK/EUR/GBP/DKK (PNL:s `spend_fx`/`spend_currency`-migrationer finns just därför). En ROAS läst rakt i Ads Manager för en utländsk butik är alltså inte jämförbar med BE-ROAS ur PNL. Varje volym-/skalningsregel måste explicit säga att ROAS läses ur **PNL**, inte ur Meta.

Relevanta filer: `/home/user/yognftnfgn/docs/naming-convention.md`, `/home/user/yognftnfgn/docs/playbook.md`, `/home/user/yognftnfgn/docs/ad-tracker.md`, `/home/user/yognftnfgn/docs/winning-lines.md`, `/home/user/yognftnfgn/docs/bof-concepts.md`, `/home/user/yognftnfgn/README.md`, `/home/user/yognftnfgn/pipeline/README.md`, `/home/user/yognftnfgn/pipeline/brand.mjs`, `/home/user/yognftnfgn/pipeline/waves/wave-01.mjs`, `/home/user/yognftnfgn/pnl-app/CLAUDE.md`, `/home/user/yognftnfgn/pnl-app/app/lib/texts.ts`.