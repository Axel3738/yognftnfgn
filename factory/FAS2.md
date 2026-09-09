# OPS Factory — FAS 2: från byggd butik till snurrande annonser

**Skriven 2026-09-08** efter en kartläggning av repot (5 parallella granskare).
Fas 1 = bygga butiken (`PROCESS.md`, klar och bevisad på HeimGuard + TankGuard).
Fas 2 = få annonser, team och skalning på plats. Detta dokument är facit —
varje molnsession i fas 2 läser sitt avsnitt här i stället för att gissa.

Varje uppdrag nedan är ett eget avsnitt: **vad**, **återanvänd detta**,
**fallgropar**, **klart när**. Bygg aldrig ett nytt system där ett finns.

⚙️ **Kommandot som kör uppdrag A + A2 + C + B i ett svep är `/ny-annonser
<butik>`** (`.claude/commands/ny-annonser.md`, Axels beslut 2026-09-08 — VA:n
gör hela annonsfasen själv, precis som hon gör hela butiksbygget med
`/ny-ops`). Uppdragen nedan är fortfarande facit för HUR varje del görs;
kommandot är körordningen. Uppdrag D och E är systemarbete utanför det.

---

## Blockerare just nu (2026-09-09)

| Blockerare | Blockerar | Löses av |
|---|---|---|
| ~~Sidan går inte att annonsera med~~ — **LÖST 2026-09-08.** Meta vägrade skapa annonser med sida `1262406533629248` (*"Sidan du har valt för din annons är inte tillgänglig"*) trots att sidan låg i businessens `owned_pages` och pixeln avfyrade. Axel kopplade sidan till annonskontot i Business Manager och skapandet gick igenom direkt. ⚠️ **Kontots `promote_pages` är TOMT även nu när 38 annonser ligger uppe** — den kanten svarar alltså inte på frågan, och `client_pages`/`owned_pages` gör det inte heller. Det enda som svarar är ett skarpt `adcreatives`-anrop. Gör det tidigt i varje ny butik, med EN annons, innan hela mediabiblioteket laddas upp i onödan. | inget | — |
| ~~FB-kontot~~ — LÖST 2026-09-08: TankGuards Meta-sida är `1399193996606775` (verifierad i MagiBorstens `client_pages`), pixeln `2196132151319625` avfyrar och WeTracked är kopplat. ⚠️ "Verifierad i `client_pages`" visade sig INTE betyda att sidan går att annonsera med — se raden ovan. | inget | — |
| ~~`META_ACCESS_TOKEN`~~ — finns i MOLNETS miljö (Axels besked 2026-09-08). `env.mjs` sätter aldrig över en variabel som redan finns i miljön, så all Meta-kod funkar i molnet. Saknas bara LOKALT. | inget i molnet | — |
| ~~HeyGen-plånboken tom~~ — påfylld. **16 818 krediter mätt 2026-09-09** (siffran 13 var en ögonblicksbild 2026-09-08). Blockerade heller aldrig HeimGuard: 0 av 26 svenska transkript nämner brandet. | inget | — |
| HeimGuards NO-marknad betalar i SEK medan Bäverbutikens norska annonser är prissatta 899/1 169 NOK | den norska HeimGuard-kampanjen | Axel slår på NOK i Shopify admin och sätter NOK-paketnivåer |
| `standby.md` har ännu ingen ifylld rad | tilldelning av redigerare | Axel ger namnet på personen som redan står på standby |

**Läget 2026-09-09: A, B, C, D och E kan alla köra.** Uppdrag B är nu bevisat
hela vägen — HeimGuards svenska kampanj står i MagiBorsten DK med 9 adsets och
38 annonser, allt PAUSED och tillbakaläst. A2 väntar inte längre på krediter
heller: plånboken har **16 818** krediter (mätt 2026-09-09), inte 13.

⚠️ **Lärdomen är dyrköpt: bygg annonsen FÖRST i en ny butik.** Sidan och pixeln
såg klara ut i varje läsning som gjordes — sidan fanns i `owned_pages`, pixeln
avfyrade. Ingen av de kontrollerna säger något om huruvida kontot får annonsera
med sidan. Det enda som svarar på den frågan är ett skarpt `adcreatives`-anrop.
Gör det tidigt, med EN annons, innan 23 videor laddas upp i onödan.

---

## Ordningen

1. **A — Brand-detektorn** (gratis, läser bara). Ger listan över vad som måste göras om.
2. **C — Bildannonserna** (gratis, ingen väntan). Snabbaste vägen till färdiga creatives.
3. **B — Kampanjbygget** (bevisat hela vägen 2026-09-09 på HeimGuard).
   Det som gör att pengar rör sig.
4. **A2 — Videodubbningen** (krediter finns, 16 818 st).
5. **D — Notion + commission** (kod, ingen väntan). Måste vara klart INNAN redigeraren börjar.
6. **E — Skalningsrutinen** (kod). Kan byggas parallellt, används först när data finns.

---

## Uppdrag A — Brand-detektorn: vilka annonser måste göras om?

**Vad:** ett verktyg som för varje Bäverbutiks-annons till en OPS-produkt ger en dom
över **fyra ytor**, eftersom de kostar helt olika mycket att åtgärda:

| Yta | Hur den läses | Kostnad att fixa |
|---|---|---|
| 1. Ad copy (message/headline/description/link) | Meta creative | gratis (skriv om) |
| 2. Talet i videon | SRT-transkriptet | HeyGen-krediter |
| 3. Inbränd text + slutkort | frames | arbetstid |
| 4. Recensionsattribution i bild ("baverbutiken.se") | bilden | gratis (`oversatt-bild.py`) |

Klassa varje annons: `ren` / `bara-copy` / `kräver-omdubb` / `kräver-slutkortsbygge`.

**Återanvänd detta:**
- `market-expansion/no/video-batches/*/srt-orig/*.orig.srt` — **217 svenska transkript
  ligger redan i repot.** Gratis facit för yta 2. Mätt 2026-09-08: 34 av 217 (16 %)
  säger brandnamnet, och det är **allt-eller-inget per produkt** (ibc 11/11,
  magnetplattor 12/12, motocentric 11/11).
  ⚠️ HeyGen hör fel: sök på `Bäverbutiken` (26 träffar), `Bawebutiken` (8), `Spavebutiken` (2).
- `tools/oversattningskon.mjs` — läser copy + media-URL + prefix ur en creative. Yta 1.
- `tools/qa-frames.py` — drar frames ur video (tätt i hooken). Yta 3.
- `pipeline/oversatt-bild.py --analys` — listar textformer i en bild. Yta 4.

**Fallgropar:**
- Källänken till Bäverbutiks-produkten står bara som en **kommentar** högst upp i
  `factory/produkter/<id>.yaml` — inget maskinläsbart fält. Lägg till
  `kalla.annonsprefix` + `kalla.produkt_id` i produktfilen, annars kan ingen körning
  veta vilka annonser som hör till butiken.
- Fel konto kostar pengar: källa = MagiBorsten `1867947880635861`, mål = MagiBorsten DK
  `915422744950975`. Kontrollera alltid `ad_account_id`, aldrig kontonamnet.

**Klart när:** en rapport per OPS-produkt listar varje källannons med sin dom på alla
fyra ytor, och `factory/produkter/<id>.yaml` bär källkopplingen maskinläsbart.

### ✅ BYGGT 2026-09-08 — TankGuard är kört

**34 källannonser i `IBC-Tanköverdraget | BE ROAS 1.51 | Launch 2026-08-28`, alla ACTIVE.
Alla fyra ytor lästa på alla 34, plus ögongranskade.** Rapport:
`factory/output/tankguard/brand-detektor.md`.

| Dom | Antal | Vilka |
|---|---|---|
| `ren` | 20 | alla bildannonserna (BOF ×6, RV ×4, CS ×3, PD ×4, GT_2, CO, SP_2) |
| `kräver-omdubb` | 11 | CS_1_H2/H3, GT_1_H1–H3, PD_1_H1–H3, SP_1_H1–H3 |
| `kräver-slutkortsbygge` | 2 | GT_3_H1, PD_3_H1 |
| `okänd` | 1 | PD_Extra — inget transkript finns, talet är oläst |

- **Yta 1 (copy): 0 träffar.** Ingen av de 34 nämner Bäverbutiken i text.
  Länken gör det däremot i alla 34 (se nedan).
- **Yta 2 (talet): 11 av 13 transkript** säger "Bäverbutiken" högt. GT_3_H1 och PD_3_H1
  är rena i talet. PD_Extra saknar transkript helt.
- **Yta 3 (inbränd text): 13 av 14 videor.** 11 har det som vanlig undertext, 2 har ett
  byggt slutkort med ordmärke, symbol och en mockup av produktsidan.
- **Yta 4 (bildattribution): 0 av 20.** Inga recensionskort tillskriver butiken.
- **Enda kvarvarande okända ytan:** talet i `IBC_PD_Extra` (10 s). Billigaste stängningen
  är att lyssna på den eller fråga redigeraren — inte att dubba om den i onödan.

### Så här kör du den

```bash
node factory/brand-detektor.mjs --produkt tankguard --hamta   # hämtar media + OCR:ar
node factory/brand-detektor.mjs --produkt tankguard           # kör om på sparad OCR
```

`--hamta` hämtar media, drar frames och OCR:ar. Utan flaggan läses den sparade OCR:en i
`factory/output/<id>/brand-ocr.json` — samma domar, ingen nedladdning. 0 kr, 0 krediter,
läser bara. Rapporten hamnar i `factory/output/<id>/brand-detektor.md` (+ `.json`).

Delarna: `factory/brandord.mjs` (EN matchare för alla fyra ytor),
`factory/brand-text.py` (lokal OCR, kräver `pip install rapidocr-onnxruntime`),
`factory/test/brand-detektor.test.mjs` (27 tester, ligger nu i `npm test`).

**Källkopplingen ligger nu i `kalla:`-blocket** i produktfilen — `annonsprefix`,
`produkt_id`, `annonskonto`, `kampanj_id` och `srt_slug`. Mallen står i
`factory/produkt-mall.yaml`. ⚠️ Förväxla inte `kalla:` (källbutiken) med `kallor:`
(produktens Drive-mapp) — de ligger bredvid varandra i filen.

**Ögongranskningen är ett eget lager: `factory/output/<id>/brand-syn.json`.**
OCR ser varken en logotyp utan text eller en textrad som ligger mellan två frames.
Detektorn väger ihop lagren med en regel: **en träff från endera står, men `ren` kräver
att den som läste inte hittade något.** Ögat får aldrig radera en maskinträff, och
tvärtom — ser de olika blir svaret "granska igen", aldrig "ren".

**Sex saker som kostade tid, så nästa körning slipper dem:**
1. `/{video_id}?fields=source` svarar **(#10) permission** — men `act_<id>/advideos`
   lämnar ut samma `source`. Samma lärdom stod redan i `pipeline/no-drive-fran-meta.py`.
   Lägg till `title=<annonsprefix>` så blir det EN sida i stället för hela biblioteket.
2. Creativens `video_id` på toppnivå är **fel objekt**. Det är
   `object_story_spec.video_data.video_id` som finns i `advideos` (14 av 14 på IBC).
3. Transkripten ligger under **både svenskt och norskt slug** — `ibc_PD_1_H1` i
   `video-batches/`, `ibc-tanktrekk_GT_3_H1` i `notion-batches/`. Därför är `srt_slug`
   en lista. Sök i hela `market-expansion/`, inte bara i `no/video-batches/`.
4. OCR läser fel på slutkortens ordmärke ("bavobutiken", "baberbutiken", "Bavlbutiken").
   Fast ordlista missar dem tyst. Fuzzy-passet i `brandord.mjs` fångade **alla** — och
   hittade dessutom en 35:e felhörning i SRT-korpuset som FAS2:s ordlista missade
   ("Babe-butiken", `motocentric_GT_1_H1`). Ta aldrig bort fuzzy-passet.
5. ⚠️ **`qa-frames.py --tathet 1.5` är ett stickprov, inte en mätning.** Mätt på
   `IBC_SP_1_H2`: brandraden stod på skärmen 10,75–11,75 s och låg helt i glappet mellan
   frame 10,50 s och 12,00 s. OCR:en friade annonsen, ögat hittade raden direkt. Det var
   ett SAMPLINGSFEL, inte ett OCR-fel. Detektorn kör därför 0,3 s — och `qa-frames.py`
   har fått `--max-frames`, för taket på 60 glesade tyst ut 0,3 s till 0,6 s.
6. ⚠️ **`creative.thumbnail_url` är 64×64 px** (mätt i MagiBorsten 2026-09-08). Den får
   aldrig bli OCR-underlag — en bildannons läst på en 64-pixelsbild kommer tillbaka
   "ren". Saknas `image_url` hämtas bilden ur `act_<id>/adimages` på hashen i stället.

⚠️ **Länken räknas inte in i klassningen.** Varje källannons pekar på källbutiken, så
gör den det till dom blir varenda annons `bara-copy` och tabellen slutar säga något.
Länkbytet ingår i kampanjbygget (Uppdrag B) och står som en egen rad i rapporten.

⚠️ **`ren` betyder brandfri — inte "går att köra som den är".** De bildannonser som är
fria från Bäverbutikens namn bär ändå källbutikens **villkor**: 489 kr / 636 kr,
23 % rabatt, fri frakt över 300 kr, Klarna, 30 dagars öppet köp, "10 recensioner" och
namngivna Judge.me-kunder. Rapporten listar dem i en egen tabell (utanför FAS2:s fyra
ytor). De måste bytas mot OPS-butikens egna villkor innan något körs — annars lovar
TankGuard Bäverbutikens fraktgräns och visar Bäverbutikens recensenter.

⚠️ **Domen är den DYRASTE ytan, inte den enda.** Rapporten har därför en egen kolumn
"Måste åtgärdas" som räknar upp alla ytor. `IBC_SP_1_H2` är `kräver-omdubb` **och** bär
en inbränd brandrad; läser någon bara domen kommer den tillbaka från HeyGen med
Bäverbutiken kvar i bild.

### ✅ KÖRD 2026-09-08 — HeimGuard (butik nr 1)

**40 källannonser i `Övervakningskameran | BE ROAS 1.57 | Launch 2026-08-21`,
alla ACTIVE i ACTIVE adsets. 25 video, 15 bild.** Rapport:
`factory/output/overvakningskameran/brand-rapport.md`.

Fem saker den körningen lärde, som inte stod här förut:

1. ⚠️ **`advideos?title=<prefix>` hittar inte alla videor — och tiger om det.**
   Mätt: 13 av 25 videor bar prefixet i sin titel. Den första launchbatchens
   filer (SP_1/2/3, CS_1/2/3, PD_1/2/3, G_1/2/3) laddades upp under andra
   filnamn och saknades helt — och bland dem låg kampanjens **toppspender**
   (`SP_2`, 13 338 kr, ROAS 2,89). Yta 3 blev alltså oläst på precis den annons
   som betydde mest, medan rapporten bara sa "okänd". Detektorn faller nu
   tillbaka på hela videobiblioteket (1 076 rader i MagiBorsten) när ett id
   saknas efter titelfiltret. **Nolltröskeln i koden räckte inte** — larmet gick
   bara vid noll träffar, inte vid 13 av 25.
2. ⚠️ **Blanda aldrig `srt-orig/*.orig.srt` med `srt-fixed/*.srt`.** En
   fritextsökning över alla SRT:er för produkten gav fem träffar på
   "baverbutiken.se" och såg ut att kräva omdubbning av fem videor. Alla fem
   satt i de **norska** `srt-fixed`-filerna — översättningarna, inte det
   svenska källjudet. De svenska originalen: **0 av 26 träffar.** Skilj alltid
   på original och översättning innan du dömer yta 2, annars köper du HeyGen-
   krediter för ett problem som inte finns.
   *(Sidofynd värt att ta vidare: att de norska captionsen bär "baverbutiken.se"
   är en defekt i NO-batchen — den hör hemma i Bäverbutikens NO-konto, inte här.)*
3. ⚠️ **Priset kan vara identiskt — kolla innan du bygger en prisswapp.**
   HeimGuard säljer samma kamera till exakt samma 799 / 1 000 kr som
   Bäverbutiken. Noll pristal behövde ändras. TankGuards fall (489/636 mot eget
   pris) är inte regeln.
4. ⚠️ **Det som faktiskt måste bytas är villkoren och den sociala proofen.**
   Källan lovade "fri frakt över 300 kr" (HeimGuard har fri frakt utan gräns)
   och påstod "Tusentals nöjda hushåll i Sverige har redan bytt ut sina gamla
   system" plus ett kundcitat ingen kund sagt. En ny OPS-butik med tio
   recensioner kan inte skriva något av det. **Copy-subagenten behöll citatet
   i första försöket** — den måste få butikens riktiga recensioner ordagrant i
   prompten, annars saneras bara volymclaimet.
5. ⚠️ **Break-even skiljer sig mer mellan butikerna än man tror.** Bäverbutiken
   hade BE-ROAS 1,57 på produkten. HeimGuard landar på **2,11** — samma pris,
   men moms i priset. Utan moms hade det blivit 1,49. Skillnaden avgör varje
   kill-beslut, så talet ska bekräftas av Axel före första skalningsronden och
   aldrig kopieras mellan verksamheterna.

---

## Uppdrag A2 — Brand-swap av video

**Vad:** byt "Bäverbutiken" mot OPS-brandet i tal, inbränd text och slutkort.

### ⚠️ RÄTTELSE 2026-09-09: det är inte ett ord, det är hela manuset

Rubriken ovan har varit missvisande. När de elva svenska transkripten lästes ord
för ord (`market-expansion/no/video-batches/2026-08-29/srt-orig/`, gratis) visade
det sig att brandnamnet är den **minsta** delen av problemet. Tre olika jobb, inte
ett:

| Video | Vad talet faktiskt säger | Jobb |
|---|---|---|
| `PD_1_H1`, `PD_1_H2`, `PD_1_H3` | Ren produktmekanik hela vägen. **En enda** brandreplik på slutet: "Ett IBC-tanköverdrag från Bäverbutiken." | byt EN replik |
| `CS_1_H2`, `CS_1_H3` | Hela erbjudandet talas ut och är falskt för OPS-butiken: "25 % rabatt", "bara idag", "ordinarie pris 636 kronor, idag 489", "men lagret krymper snabbt", "innan det är slut" | **nytt manus** |
| `GT_1_H1/H2/H3` | Ett kundvittnesmål i jag-form, uppläst: "Min man … så jag beställde … han visar upp den för alla grannar" | **nytt manus** |
| `SP_1_H1/H2/H3` | Samma sak plus antal: "Innan hade jag alger … sen skaffade jag …", "Tusentals svenskar har redan löst sitt algproblem", "därför så många trädgårdsägare väljer" | **nytt manus** |

**Åtta av elva videor behöver alltså ett omskrivet manus, inte ett ordbyte.** En
ny OPS-butik har sålt noll enheter — varje talad mening som förutsätter en tidigare
kund är lika falsk som en påhittad recension, och den hörs dessutom högt.

**Läs transkripten FÖRST, innan någon budget läggs på omdubb.** De ligger gratis i
repot och avgör om jobbet är en replik eller tolv.

⚠️ **Svenska→svenska fungerar i HeyGen** (mätt 2026-09-09, sessions-id får suffixet
`-sv-sv-SE`). FAS2 sa tidigare att det var otestat — det är det inte längre.
Språknamnet är `Swedish (Sweden)`, och proofread kostar noll krediter.

⚠️ **Röstkontrollen (CLAUDE.md järnregel 3) kan inte göras av en molnsession** —
den kräver att någon lyssnar. En session kan rendera och lämna över; den kan
aldrig själv säga att rösten håller.

**Återanvänd detta:**
- `pipeline/translate-batch.mjs` + `pipeline/heygen.mjs` — hela HeyGen-kedjan med state
  till disk. Kör med `--lang="Swedish (Sweden)"` (samma språk in och ut —
  mätt 2026-09-09, se rättelsen ovan).
- `pipeline/no-precis.py` — byter inbränd text **exakt i sin egen ruta**. Detta ÄR
  verktyget för yta 3; bygg ingen ny caption-motor.
- `market-expansion/no/notion-batches/2026-09-05-video-batmotor/lager.py` — bevisad
  ombyggnad av telefonslutkortet (ordmärke, titel, badge, pris). Handmätta koordinater
  per video — **generalisera till ett brand-drivet verktyg**, den delen skalar inte.

**Fallgropar:** järnreglerna i `.claude/skills/translate/SKILL.md` gäller oförändrat —
rendera aldrig före proofread (rendering drar krediter, proofread är gratis), skanna
alltid källvideon efter inbränd text före leverans, spara session-ID till disk direkt.

⚠️ **Röstkontrollen är obligatorisk också här** (Axels besked 2026-09-08): lyssna på
hook, mitt och slut i varje renderad fil, och leverera aldrig en keff röst. Rösten går
inte att välja — HeyGen klonar källans röst och har ingen röstparameter — så den kan
bara fångas genom att någon lyssnar. Det väger extra tungt för TankGuard: en butik
utan en enda order har bara annonsen att bygga förtroende med.

**Mätt på TankGuards 14 videor 2026-09-08 (brand-detektorns ögongranskning) — två helt
olika jobb som lätt förväxlas:**
- **11 videor har brandet som vanlig inbränd undertext** mitt i bild, i samma vita
  captionplatta som resten av talet ("från bävöbutiken.", "från bäberbutiken."). Där
  finns INGET slutkort alls — de sista framesen är produktbild med vanlig undertext.
  Jobbet är `pipeline/no-precis.py` på en enda textrad, inte ett slutkortsbygge.
- **2 videor har ett riktigt byggt slutkort** (`IBC_PD_3_H1` 22,5–24,4 s,
  `IBC_GT_3_H1` 16,5–17,8 s): ordmärket i vita versaler med guldstreck på svart
  banderoll, **butikens symbol** (rött bäverhuvud som gnager på en gul gren) och under
  det en **mockup av produktsidan** med bildkarusell, stjärnbetyg och priset
  "636 kr 489 kr". Där är det `lager.py`-jobbet — ordmärke, symbol, titel, badge OCH
  pris — och symbolen är osynlig för all textbaserad detektion.
- ⚠️ En träff sent i filmen betyder alltså INTE slutkort. Positionen kan inte skilja
  dem åt; bara ett öga kan.

**Vad de två jobben konkret ska producera för TankGuard** (spikat 2026-09-08 när
butikens eget erbjudande blev känt — se `offer:` i produktfilen):

| Jobb | Antal | Verktyg | Vad som byts |
|---|---|---|---|
| Undertextraden | 11 videor | `pipeline/no-precis.py` + HeyGen-omdubb | ETT ord i ETT band: "från bäverbutiken" → "från TankGuard". Ingen prisändring — de elva har inget pris i bild. |
| Slutkortet | 2 videor (`IBC_GT_3_H1` 16,5–17,8 s, `IBC_PD_3_H1` 22,5–24,4 s) | `market-expansion/no/notion-batches/2026-09-05-video-batmotor/lager.py` | ordmärket · **bäversymbolen** (rött huvud som gnager på en gul gren — måste bort, den är osynlig för OCR) · "10 recensioner" (TankGuard har noll) · prisparet **"636 kr 489 kr" → "489 kr"** utan överstrykning, eftersom TankGuard inte har något jämförpris |

⚠️ **Prisparet på slutkortet är lika falskt som brandnamnet.** `636 kr` finns inte
i TankGuards butik — den överstrukna siffran på produktsidan är en paketsumma
(1 376 / 2 064 kr), inte ett enstyckspris. Byggs slutkortet om med bara ordmärket
bytt lovar TankGuard en rabatt butiken inte ger.

---

## Uppdrag B — Kampanjbygget i OPS-kontot

**Vad:** bygg OPS-butikens kampanj i MagiBorsten DK `915422744950975` med butikens
egen sida, egen pixel, egen produktlänk, ~1000 kr/dag.

**TankGuards värden (verifierade 2026-09-08, står i produktfilen):**
sida `1399193996606775` · pixel `2196132151319625` · länk = produktsidan på
tankguard.se · konto `915422744950975` (SEK) · 1000 kr/dag = `daily_budget: 100000`.

⚠️ **"Bara exportera kampanjerna" finns inte som knapp.** Ingen kod i repot läser en
hel kampanjstruktur ur ett konto. Och `image_hash`/`video_id` är **per annonskonto** —
Bäverbutikens creatives går inte att referera från OPS-kontot. Kedjan är:
hämta ner filen → brand-swappa → ladda upp på nytt till `act_915422744950975`.

**Återanvänd detta:**
- `pipeline/no-video-launch.mjs` — den ENDA koden som bygger en hel kampanjstruktur i ett
  målkonto (CBO, adset per koncept med `promoted_object`, idempotent, statusar explicit).
- `pipeline/no-image-launch.mjs` / `no-image-ads.mjs` — bildannonshalvan.
- `pipeline/waves/no-ibc-video.config.mjs` — **detta ÄR TankGuards produkt.** Färdig
  mall och färdig copy-struktur; byt `act`/`page`/`pixel`/`link`/`campaignName`.
- `tools/meta-lib.mjs` — allt Graph-anrop går genom detta lager. Spärrarna är dyrköpta:
  allt föds PAUSED, adset klonas ur syskon, enhancements OPT_OUT, backoff på fel 17.
- `tools/notion-till-marknad.mjs` — referensen för "ladda upp i ett ANNAT kontos
  befintliga kampanj", med fem spärrar. Kopiera spärrordningen rakt av.

**Fallgropar:**
- ⚠️ **OPS-kontot är INTE tomt.** `pipeline/waves/dk-*.config.mjs` byggde Bäverbutikens
  danska kampanjer i exakt `915422744950975` — med Bäverbutikens DK-sida
  `1324465810740336` och Bäverbutikens pixel `1554276343018184`. Varje mekanism som
  "hittar en kampanj i kontot" kan därför träffa fel verksamhet. Filtrera på brandprefix.
- ⚠️ Kontots valuta är **SEK, inte DKK** (mätt i commission-rapporterna 2026-09-04 och
  -09-07). `market-expansion/marknader.json` säger DKK — det är fel. 1000 kr/dag = `daily_budget: 100000`.
- ⚠️ `market-expansion/marknader.json` DK-blocket pekar på OPS-kontot med `page: null`
  och `pixel: null`, och sidspärren i `notion-till-marknad.mjs` är villkorad. Sätts DK
  `aktiv: true` launchar `/oversatt` Bäverbutikens danska annonser i OPS-kontot. Lös
  krocken innan DK aktiveras.
- ⚠️ Sätt status **explicit på alla tre nivåer**. `batch.mjs`/`multi-batch.mjs` sätter
  adset PAUSED men annonsen ACTIVE; `uk-wave.mjs` sätter båda ACTIVE; `mastern-batch.mjs`
  har ingen default alls.
- ⚠️ PAUSED med spend > 0 är ett BESLUT, aldrig ett fel att rätta.
- ⚠️ Meta tvångspausar vid varje budget-/strukturändring. Sätt ACTIVE igen och verifiera
  med tillbakaläsning.
- ⚠️ Länken får ALDRIG gissas — avbryt hellre än att falla tillbaka på startsidan.
- ⚠️ Kampanjnamnet prefixas med brandet (`TANKGUARD_…`); alla OPS-butiker delar ett konto.
  Tre konkurrerande namnregler finns i repot — spika en och skriv in den i PROCESS.md.
- ⚠️ EU-konton kräver `dsa_beneficiary`/`dsa_payor`. Ta reda på om OPS-kontot gör det
  innan första annonsen, annars faller skapandet.

**Klart när:** kampanjen är tillbakaläst ur kontot och `page_id`, `pixel_id`,
`daily_budget`, länk och status på alla tre nivåer matchar butikens konfig exakt.

### Utökat 2026-09-08 — copy per ANNONS, inte per adset

Källkontots annonser bär **egen copy per annons**, inte en gemensam per koncept:
40 HeimGuard-annonser hade 32 unika copyvarianter. Både `no-video-launch.mjs`
och `no-image-launch.mjs` antog en copy per adset, och `no-image-launch.mjs`
byggde dessutom bara EN annons per adset. Läggs allt under adsetets copy tappas
det som faktiskt spenderade pengarna.

Båda är därför utökade, bakåtkompatibelt (befintliga vågkonfigar är orörda):
- `no-video-launch.mjs`: `ad.copy` vinner över `adset.copy`. Saknas båda avbryts körningen.
- `no-image-launch.mjs`: `adset.ads[]` med `{ adName, img, copy }` per annons.
  Gamla formen (`adset.adName`/`img`/`copy`) fungerar oförändrat.

Kör video- och bildkonfigen mot **samma** `campaignName` och samma adsetnamn —
båda skripten återanvänder kampanj och adsets på namn, så bild- och
videoannonserna hamnar i samma adset i stället för i två parallella strukturer.
### ✅ Sidrollen — LÖST 2026-09-09

Axel gav full tillgång till sidan, och samma sekund gick alla tio annonserna
igenom. Avsnittet nedan står kvar för att **kontrollen** är återanvändbar — den
ska köras på varje ny OPS-butik innan media laddas upp.

### ⛔ Sidrollen — det som stoppade TankGuard (mätt 2026-09-08)

Kampanjen, sex adsets, tio uppladdade creatives och godkänd copy är på plats.
**Noll annonser kan ändå skapas.** Varje `adcreatives`-anrop svarar:

```
(#200) Application does not have permission for this action —
Om du vill skapa inlägg för sidan 1399193996606775 kontaktar du en
administratör för att få behörighet för rollen Annonsör eller högre.
```

**Rotorsaken, mätt 2026-09-09 — och den är inte den man först tror.**
Nyckelns användare är **Axel Odhner själv** (`2012328296147430`). Skillnaden mot
HeimGuard sitter i hur businessen `1164852855167090` håller de två sidorna:

| | Sida | Businessens relation | Axels roll | Går att annonsera med |
|---|---|---|---|---|
| HeimGuard | `1262406533629248` | **`owned_pages`** — businessen äger den | `MANAGE,CREATE_CONTENT,ADVERTISE,…` | ✅ |
| TankGuard | `1399193996606775` | **`client_pages`** — bara utlånad dit | **ingen alls** | ❌ |

`owned_pages` (4): HeimGuard · Bæverbutiken · BeaverShop · MagiBorsten
`client_pages` (2): Bäverbutiken.se · **TankGuard**

⚠️ **`client_pages` är inte ägarskap.** Den tidigare noteringen "sidan är verifierad
i MagiBorstens `client_pages`" (FAS2 rad 23) bevisade bara att businessen *ser*
sidan. Att skapa ett inlägg med den kräver att den enskilda **användaren** har en
roll på sidan, och `me/accounts` — 40 sidor per 2026-09-09 — listar den inte.
Tre kontroller som ser lika ut men svarar på olika frågor:

```
BIZ/client_pages   → ser businessen sidan?        (TankGuard: JA)
BIZ/owned_pages    → äger businessen sidan?       (TankGuard: NEJ)
me/accounts        → har ANVÄNDAREN roll på den?  (TankGuard: NEJ)  ← den som avgör
```

Bara den tredje avgör om en annons går att skapa. **Kör den kontrollen innan media
laddas upp**, inte efter — och lägg in den som ett eget steg i `/ny-ops`: en ny
OPS-sida är inte klar när den existerar, den är klar när `me/accounts` listar den.

**Åtgärd:** ge Axel rollen på TankGuard-sidan i Meta Business
(`business.facebook.com/settings/pages` → TankGuard → Lägg till personer →
Hantera sida). Alternativt flytta sidan från `client_pages` till `owned_pages`,
vilket är det HeimGuard redan har och skälet till att den fungerar.

### Läget 2026-09-08 kväll — skalet står, annonserna saknas

`/ny-annonser tankguard` läste båda källkontona och hela målkontot. Rapporten:
`factory/output/tankguard/kallannonser.md` (+ `.json`). Allt verifierat står nu
maskinläsbart i `factory/produkter/tankguard.yaml`.

**Kampanjskalet finns redan i målkontot** — `TANKGUARD_Tanköverdraget SE |
BE-ROAS 1,62 | 2026-09-08` (`120248995235740172`), byggt 11:18 samma dag av en
körning som aldrig pushade. CBO 1 000 kr/dag, fyra adsets (GT/CS/SP/PD med
id:n i produktfilen), rätt pixel, geo SE, allt PAUSED, **0 annonser, 0 kr
spend**. Nästa körning ska FYLLA det skalet — bygg aldrig ett nytt bredvid, då
står två TANKGUARD-kampanjer i kontot och datan går inte att skära.
Någon norsk TankGuard-kampanj finns inte ännu.

### ⚠️ Mediagrinden — den dyraste lärdomen i hela fas 2

**En ren annonstext är inte en ren annons.** Mätt 2026-09-08 på alla 34 svenska
källannonser (`factory/output/tankguard/se-copy.md`): **24 av 34 creatives bär
källbutikens påståenden inbränt i bilden eller uppläst i ljudet** — 636 kr,
23 %-rabatten, fri frakt, Klarna, öppet köp, stjärnbetyg, "lagret krymper" eller
namnet Bäverbutiken. Meta-texten kan vara oklanderlig och annonsen ändå ljuga i
pixlarna.

En hel copy-runda (51 agenter) skrev om sju block innan någon kontrollerade
mediat. Sex av de sju kunde ändå inte gå upp. **Kör grinden FÖRST** — den är
gratis, den är en join av `brand-ocr.json` mot annonslistan, och den avgör vad
det ens är lönt att skriva copy till:

```
✅ ren creative      → copyn kan skrivas, annonsen kan byggas
⛔ smutsig creative  → mediat måste göras om; copyn blir en brief, inte en annons
```

Tre saker grinden avslöjade som ingen textgranskning kunde:
1. **Arbetet lades på fel sju.** De omskrivna blocken var exakt de vars media är
   smutsig. De sex bevisat rena creativesen behövde ingen copy alls.
2. **Vinnaren är smutsig.** `PD_1_H1` (16 997 kr, 77 köp, ROAS 2,92) säger
   brandnamnet högt och visar det i bild — den kan inte köras förrän den dubbats om.
3. **Det som är rent är obeprövat.** Nio av tio rena creatives är bildannonser
   med noll köp. En OPS-butik kan alltså inte starta på "det som råkar vara rent";
   den måste städa vinnaren först.

En fjärde sak dök upp på köpet: att byta bort `636 kr` flyttade ankaret till
2-packet i fyra av sju block, vilket höjde ingångspriset i majoriteten av kontot
från 489 till 799 kr (+63 %). **Det är ett erbjudandebeslut, inte ett copybeslut** —
lägg det hos ägaren innan texterna skrivs, inte efter.

**Källorna, båda ACTIVE:** SE 34 annonser (`120250001079150291`, MagiBorsten,
2 300 kr/dag), NO 33 annonser (`120251996323340233`, Magiborsten NO,
1 000 kr/dag). Alla 67 är ACTIVE i ACTIVE-adsets — inget PAUSED-beslut att
respektera, hela materialet är kandidatmaterial.

**Tre saker NO-halvan visade som SE-halvan inte kunde visa:**
1. NO speglar SE annons för annons — samma 13 videokoncept, samma 20
   bildkoncept, och yta 2 faller ut identiskt (11 av 13 säger brandet,
   `GT_3_H1` och `PD_3_H1` är rena i talet och bär slutkortet i stället).
2. **Fem norska annonser har brandet i COPYN — noll svenska har det.** Fyra
   RV-annonser tillskriver recensionen `baverbutiken.se`, alltså den SVENSKA
   domänen i en norsk annons; felet finns redan i källan. `GT_3_H1` skriver
   `4,7 av 5 på beverbutikken.no`. Brand-detektorn läser bara SE-kampanjen —
   kör copy-ytan mot NO-kontot separat, annars går de fem obemärkta.
3. **Priserna skiljer per marknad:** SE `489/636 kr, 23 %`, NO `439/586 kr,
   25 %`, båda dessutom `300 kr` (fraktgräns) och `147 kr` (rabattbelopp).

⚠️ **Två ytor är OLÄSTA på de norska annonserna:** inbränd text (13 videor) och
bildattribution (20 bilder). `ffmpeg` och `rapidocr-onnxruntime` finns inte i
molncontainern, så de gick inte att OCR:a här. `❔ oläst` är aldrig `ren` — läs
dem innan något norskt laddas upp. Att den norska SRT:en säger `Beverbutikken`
gör det sannolikt att den inbrända undertexten gör det också; sannolikt är inte mätt.

---

## Uppdrag C — Bildannonserna (gratis, ingen väntan)

**Vad:** brand-swappa Bäverbutikens bildannonser till OPS-brandet, svenska och norska.

**Återanvänd detta:**
- `pipeline/oversatt-bild.py` — byter text i en bildannons **utan krediter**: hittar de
  enfärgade formerna, suddar texten med formens egen färg, ritar ny text i samma ruta.
  `--analys` ger formlistan, QA-bild SE|NY sida vid sida, exit 3 om text ligger utanför.
- `pipeline/oversatt-batch.py` + `overrides.json` — batchdrivaren.
- `bildannonser/text.py` — skarp vektortext med STILAR och autokrympning.
- `bildannonser/kie.mjs` — reservväg när brandtexten sitter direkt på fotot utan platta
  (formdetektorn hittar den aldrig). Saldo mätt 2026-09-08: 16 009 krediter.

**Fallgropar:** kie.ai klarar INTE svensk text — metoden är alltid "kie rensar text →
`text.py` lägger vektortext". Aldrig tvärtom.

---

## Uppdrag D — Notion, konton och commission

**Vad:** göra rutinerna medvetna om att det finns fler än en verksamhet.

⚠️ **Det viktigaste att förstå:** teamspacet skyddar ingenting i koden.
`hittaHubbar()` i `tools/notion-kalla.mjs` gör en REST-sökning **utan sökterm** och tar
varje databas integrationen ser — REST-API:t kan inte fråga på teamspace (står i
kommentaren rad 25–27). En OPS-hub i ett nytt teamspace kommer alltså med automatiskt
i Bäverbutikens rutiner. Det enda riktiga skyddet i dag är prefixkartan ur MagiBorsten
(`leveranskon.mjs` rad 175) — **och det skyddet brister för OPS, eftersom OPS-butiken
säljer samma produkt som Bäverbutiken.**

**Bygg:**
1. Ett **hubbregister** som binder hub → butik → teamspace → annonskonto → sida/pixel →
   prefix → landningssida. I dag ligger kopplingarna utspridda i `products/products.json`
   (4 hubbar), `commission/hubbar.json` (18), `products/prefix-alias.json` och
   `market-expansion/*/produkter.json` — ingen bär annonskonto per hub.
   `commission/hubbar.json` har redan `{ id, namn, verksamhet, marknad }` — utöka den.
2. **Kontoparametrisering** av `tools/notion-till-meta.mjs` (rad 39 hårdkodar
   `BAVERBUTIKEN_ACT`, rad 157 och 297 dödar körningen) och `tools/leveranskon.mjs`
   (rad 90, 96–100, 115). Riv aldrig spärren — byt den mot "kontot som butikens
   hubbregister anger".
3. **Commission för OPS.** `915422744950975` står i `UTLANDSKA_KONTON`
   (`commission/berakning.mjs` rad 35) — all OPS-spend ger 0 kr i dag. Raden kan inte
   bara tas bort: Bäverbutikens danska annonser ligger i samma konto, och de ska
   fortsatt vara utan commission (Axels beslut 2026-08-31). Filtret måste bli
   per brandprefix, inte per konto.

**Fallgropar:**
- ⚠️ Notion-åtkomst ges per sida. Ärvd behörighet från Bäverbutikens teamspace-toppsida
  **följer inte med** när databasen flyttas. Resultat: 404 = "inte inbjuden".
- ⚠️ `commission/run.mjs` (rad 227–233) **avbryter hela körningen** om en känd hub inte
  gick att läsa. `IBC Tank Cover creative hub` står i `hubbar.json` som Bäverbutiken —
  flyttas den utan att registret uppdateras dör commission-rutinen.
- ⚠️ Notions API kan **inte** skapa teamspaces, och databasflytt mellan teamspaces går
  bara i UI:t. De stegen är manuella klick i `CHECKLISTA.md` — skriv aldrig kod som
  låtsas göra dem.
- ⚠️ Uppladdad rad flyttas till `SE-ACTIVE to be translated`. En OPS-hub i den kön
  plockas upp av `/oversatt`, som slår upp annonsnamnet i MagiBorsten SE och rapporterar
  "inte uppe i Sverige". Bestäm vilken kö OPS-rader ska hamna i.
- ⚠️ Arkiverade databaser syns inte i `search()`. Därför golvet av hårdkodade id:n.

---

## Uppdrag E — Skalningsrutinen per OPS-butik

⚠️ **Kravspecen står i `factory/SKALNINGSKUNGEN.md`** (2026-09-09) — läs den
först, avsnittet nedan är bara återanvändning och fallgropar.

⚠️ **Uppgraderad 2026-09-09:** detta är inte längre en sidogrej. Enligt
`factory/TRAPPAN.md` sker ALL creative strategy på OPS-butikerna — den här
rutinen blir alltså husets HUVUDloop, en instans per butik, och `/cs` mot
Bäverbutikens produkter fasas ut i takt med att de får egna butiker.

**Vad:** en `/skalningskungen <butik>` som analyserar, skalar och briefar — en instans
per OPS-butik.

⚠️ **Den finns inte.** Verifierat med `git log --all --diff-filter=A -- .claude/commands/*`:
22 kommandofiler har någonsin skapats, ingen heter skalning/scaling. Ordet
"skalningsronden" förekommer 8 gånger men bara som **ägare av PAUSED-beslut** — en
mänsklig praxis, aldrig ett skript. Bygg från `/cs` som mall.

**Återanvänd detta:**
- `.claude/commands/cs.md` — kärnloopens fem steg. Byt fyra saker: annonskontot
  (rad 25 hårdkodar Bäverbutiken), kanalen, hubben, produktminnets sökväg.
- `docs/os/ANALYSMETOD.md` — **oförändrad och obligatorisk**, den är produktagnostisk.
  Enda Bäverbutiksspecifika delen är tabellen rad 100–109.
- `pipeline/quota.mjs` — ren matematik, fungerar för vilken produkt som helst med
  `daily_budget_sek` + `target_cpa_sek` + `cycle_start` + `launches[]`.
- `.claude/commands/forsta-batch.md` — formatet för butikens FÖRSTA runda.
- `products/<id>/dna.md` + `batch-log.md` + `backlog.md` — mappstrukturen kopieras per
  OPS-butik. **Bonus:** när en Bäverbutiks-annons brand-swappas följer dess bevisade
  DNA med — skriv in den ärvda historiken i `batch-log.md`, annars ser rutinens första
  körning 12 annonser utan hypoteser.

**Bygg:**
- **Ekonomiblocket** i `factory/produkter/<id>.yaml`: `aov_sek`, `break_even_roas`,
  `target_roas`, `break_even_cpa_sek`, `target_cpa_sek`. I dag finns bara `inkopskostnad`
  och `pris`. Utan dem kan rutinen varken rangordna eller döma.
  ⚠️ Räkna om från grunden — Bäverbutiken säljer UTAN moms, men
  `factory/butiker/*.yaml` säger `moms_i_pris: true`. Kopiera aldrig break-even-tal
  mellan verksamheterna.
- **Butiksfilter på det gemensamma kontot.** ANALYSMETOD steg 0 säger "hämta hela
  kampanjen sorterad på amount_spent" — men MagiBorsten DK bär ALLA OPS-butiker.
  Utan prefixfilter (`TANKGUARD_`) läser rutinen andra butikers annonser som om de
  vore samma produkt.
- **Beslut:** registreras OPS-produkter i `products/products.json` eller i ett eget
  register? `products.json` läses av elva skript — läggs OPS-produkter in där dras de
  tyst in i Bäverbutikens commission, kvot och dashboard.

**Fallgropar:** hela `ANALYSMETOD.md` gäller — enmetriks-domar förbjudna, rangordna på
vinstbidrag `(break-even-CPA − CPA) × köp`, signifikansgrind 300 kr/3 köp, regel 11
(nya tester i separat test-ABO), modellpolicyn (copy skrivs av subagent med `sonnet`).

---

## Uppdrag F — Redigeraren per butik

**Återanvänd:** `factory/discord.mjs` (bygger servern OCH plockar nästa `redo` ur
standby), `factory/rekrytering/jobbannons-video-editor.md` (hela ramverket, byt bara
codeword), `factory/redigerare/anstallningsavtal.md` (mallen, signerad 2026-09-04).

**Axels beslut 2026-09-08:**
1. **Ingen löpande beredskapsersättning.** Poolen byggs ur ansökningsflödet —
   jobbannonsen är ute, ansökningar kommer in, en person står redan på standby.
2. **Ingen redigerare tilldelad TankGuard än.** Butiken kör först på de
   brand-swappade Bäverbutiks-annonserna (uppdrag A/A2/C); redigerare tillsätts
   när det finns data att jobba mot.

**Kvarstående beslut:** får en OPS-redigerare commission på sin butiks **norska**
annonser? `FRAMMANDE_MARKNAD`-regexen filtrerar bort varje annonsnamn med
segmentet `NO`, men SE+NO är standard i varje OPS-butik och det är samma
redigerare. Frågan blir skarp först när någon anställs — men uppdrag D:s
commission-fix ska byggas så att svaret bara är en konfigrad.
