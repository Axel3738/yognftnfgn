# Video-lokalisering — mp4-annonser → HeyGen → Veed

Processen för att ta en färdig mp4-annons (t.ex. en vinnande Mastern-video på svenska),
översätta den till ett valt språk i **HeyGen**, lokalisera innehållet i proofread-steget,
och sedan bränna in captions i **Veed** innan leverans.

> Kärnprincipen: **översättning ≠ lokalisering.** En rakt översatt annons som säger
> "används mycket i Sverige" till en norsk tittare är en sämre annons. Proofread-steget
> är där vi gör om innehållet så att det stämmer för målmarknaden — *innan* videon renderas.

## Så beställer du (dump-flödet)

Starta en session på repot, bifoga mp4-filerna (eller klistra Drive-länkar med
"alla med länken kan visa") och skriv målspråket — t.ex. *"översätt dessa till norska"*.
Claude kör då hela kedjan per video och levererar tillbaka färdiga filer med captions,
plus en proofread-logg per annons.

OBS för API-körningar: HeyGen renderar direkt utan proofread-paus. Claude granskar
därför transkripten i efterhand, rättar captions-texten automatiskt och flaggar de
annonser där även **ljudet** behöver en omrendering i HeyGens UI (t.ex. felöversatta
varumärkesnamn). Beslut om omrendering tas per annons — varje render drar HeyGen-krediter.

## Flödet

**Järnregel 1: rendera ALDRIG före proofread.** Varje HeyGen-rendering drar krediter —
proofread-sessionen är gratis. Fel ordning = dubbla renderingar = dubbla krediter.

**Järnregel 2: skanna ALLTID källvideon efter inbränd svensk text INNAN leverans.**
HeyGen översätter bara ljudet — text som ligger i bilden följer med oöversatt. Kör
skannern nedan på varje ny källfil; hittas text måste den täckas och ersättas med
lokaliserade captions, annars är annonsen obrukbar (värsta fallet: gamla priser står
kvar i bild fast de tagits bort ur talet).

```bash
# Skanna hela klippet (2 bilder/sek) efter ljusa textplattor, ffmpeg + numpy/pillow:
#   ffmpeg -i FIL.mp4 -vf 'fps=2,scale=270:480' /tmp/fr/%04d.png
#   → rader där 40 < antal_vita_pixlar < 240 markerar en platta, inte vit bakgrund
# Täck sedan bandet med intilliggande bildinnehåll (INTE sudd — det ger grå skugga
# där den gamla plattan var bredare än den nya texten):
#   [0:v]crop=B:H:0:Y_KÄLLA,boxblur=6:1:6:1[b];[0:v][b]overlay=0:Y_BAND[v]
# och lägg lokaliserade captions ovanpå i samma stil som originalet.
# OBS: MarginV/FontSize i force_style tolkas i ASS-skalan (288 hög), inte i pixlar:
#   MarginV = (videohöjd - textbandets underkant) * 288 / videohöjd
```

```
1. VÄLJ         → vilka mp4:or + målspråk/marknad (loggas i tabellen nedan)
2. PROOFREAD    → `localize.mjs proofread` — HeyGen transkriberar + översätter
                  UTAN att rendera (0 krediter) och SRT:n laddas ner
3. LOKALISERA   → gå igenom SRT:n mot checklistan nedan, rätta allt som är
                  Sverige-specifikt + varumärkes-/språkfel → `apply-srt` (0 krediter)
4. RENDERA      → `render` — HeyGen dubbar från det godkända transkriptet
                  (röstklon + lip-sync). ENDA steget som drar krediter. → ladda ner mp4
5. CAPTIONS     → ENDAST när Axel uttryckligen ber om det: `burn` — bränn in den
                  rättade SRT:n med ffmpeg (gratis). Default = leverera UTAN captions.
6. LEVERERA     → döp filen enligt namnkonventionen (med marknadsfält) →
                  skicka till Axel → logga i tabellen nedan + ad-trackern
```

## Steg 3 — lokaliserings-checklistan (proofread)

Det här är det viktigaste steget. Gå igenom **varje mening** i transkriptet och fråga:
*"stämmer det här för någon i målmarknaden?"* Ändra direkt i HeyGens proofread-läge.

| Kolla | Exempel på ändring |
|-------|--------------------|
| **Geo-referenser** | "den här grillborsten används mycket i Sverige" → "används mycket i till exempel Norge" |
| **Valuta & pris** | "999 kr" → rätt valuta OCH rätt prispunkt för marknaden (inte bara kursomräknat) |
| **Butik / domän** | grillkliniken.se → målmarknadens domän om den finns, annars ta bort/generalisera |
| **Social proof** | "10 000 svenska grillägare" → generalisera ("10 000 nöjda kunder") eller byt land om siffran håller |
| **Frakt & leverans** | "fri frakt i hela Sverige", "levereras på 2 dagar" → marknadens faktiska villkor |
| **Säsong & högtider** | midsommar, kräftskiva → målmarknadens motsvarigheter (eller neutralt "grillsäsongen") |
| **Juridik & garantier** | garanti-/ånger-claims måste stämma med målmarknadens regler |
| **Produktnamn & uttal** | kolla att "Mastern"/"Grillkliniken" inte betyder något konstigt på målspråket och uttalas rimligt i dubben |

Regel: **ändra hellre till något generellt än att gissa marknadsfakta.** Vet vi inte
norska fraktvillkor → skriv inget om frakt.

## Steg 5 — captions (burn-in)

**Standardväg — lokalt med ffmpeg (gratis, inget konto):** HeyGen levererar en SRT
med exakta tidkoder. Uppdatera den med proofread-ändringarna och bränn in:

```bash
node localize.mjs burn --video=output/localized/ad.mp4 --srt=output/localized/ad.srt
```

Stylingen (vit fet text, mörk platta, safe zone ovanför Reels/Stories-UI:t) ligger i
`burn`-kommandot i `localize.mjs` — justera `force_style` där.

**Alternativ när man vill handstyla — Veeds UI:**

1. Ladda upp mp4:n → `Subtitles → Upload subtitle file` (använd SRT:n — auto-subtitles
   stavar fel på egennamn som `Mastern`) eller `Auto Subtitles` på målspråket.
2. Granska rad för rad, styla, exportera med **inbrända** captions (kräver betalplan
   för export utan vattenstämpel).

**Alternativ för bulk — Veeds Subtitle API** (`captions`-kommandot, via fal.ai,
betala-per-användning ~$0.10/min, kräver `FAL_KEY`).

## Namngivning

Lokaliserade varianter får marknadsfältet enligt `naming-convention.md`:

```
GRILL_mastern_pain_comparison_ruinsgrill_no_v1
                                         └─ marknad (ISO-landskod, utelämnas för SE-original)
```

Filen döps likadant: `GRILL_mastern_pain_comparison_ruinsgrill_no_v1.mp4`.

## Verktyg & automation

- **HeyGen:** UI:t är huvudvägen eftersom proofread-steget (obligatoriskt i den här
  processen) görs där. För att lista språk, kolla jobb-status och ladda ner färdiga
  videor i bulk finns `pipeline/localize.mjs` (HeyGens API — kräver `HEYGEN_API_KEY`).
  OBS: API:t kan skicka och hämta översättningar men proofread-redigeringen görs i UI:t.
- **Veed:** UI. Auto-subtitles + styling + export enligt steg 5.

**Krav i Claude Code-environmentet** (för att skriptet ska funka i webbsessioner):

1. Miljövariabel `HEYGEN_API_KEY` = nyckeln från app.heygen.com → Settings → API
   (EN variabel: namnet i namn-fältet, nyckeln i värde-fältet).
2. Miljövariabel `FAL_KEY` = nyckeln från fal.ai → Dashboard → Keys (för Veeds
   Subtitle API, som körs via fal.ai; kostar ca $0.10/min video).
3. Nätverkspolicyn (network egress) måste tillåta `api.heygen.com`,
   `upload.heygen.com`, `queue.fal.run` och `fal.media`. Nedladdningslänkar för
   färdiga videor ligger på `*.heygen.ai` resp. `*.fal.media` — blockeras en
   nedladdning, lägg till hosten som felmeddelandet visar.

```bash
cd pipeline
node localize.mjs check                                  # verifiera nyckeln + kvot
node localize.mjs langs                                  # vilka målspråk HeyGen stödjer

# Standardflödet (proofread FÖRE render — se järnregeln ovan):
node localize.mjs proofread --file=annons.mp4 --lang="Norwegian Bokmål (Norway)"
#  → rätta den nedladdade SRT:en enligt checklistan
node localize.mjs apply-srt --id=<proofread_id> --srt=rättad.srt
node localize.mjs render --id=<proofread_id>             # ⚠️ drar krediter
node localize.mjs status --id=<video_translation_id> --wait
node localize.mjs download --id=<video_translation_id>
node localize.mjs burn --video=nedladdad.mp4 --srt=rättad.srt
```

`submit` finns kvar men renderar direkt utan proofread — använd bara när transkriptet
inte behöver granskas. Det finns även ett officiellt HeyGen-CLI
(`curl -fsSL https://static.heygen.ai/cli/install.sh | bash`) med samma proofread-flöde
(`heygen video-translate proofreads …`) — bra som referens/felsökning.

**Captions-steget via API:** `captions` tar HeyGen-jobbets färdiga video + SRT
(HeyGens egen, eller en lokalt redigerad med proofread-ändringarna via `--srt=`)
och skickar dem till Veeds Subtitle API — SRT:n gör att Veed hoppar över egen
transkribering, så texten matchar dubben exakt. Veeds UI (steg 5 ovan) är kvar
som manuellt alternativ när man vill handstyla.

## Körningar (logg)

| Källannons | Marknad/språk | HeyGen | Proofread | Veed captions | Levererad | Anteckning |
|------------|---------------|--------|-----------|---------------|-----------|------------|
| `GRILL_mastern_video_ad01` (sv) | no / Norwegian Bokmål | ✅ 2026-08-08 | ✅ 3 rättningar (gjerne/bust/Mastern) via proofread-API | ✅ ffmpeg burn-in | ✅ levererad | proofread `fed87570…` → render `02a09df7…-nb` · inga geo/pris-referenser i källan · kostnad ~84 enheter (v1-felrendern oräknad) |
| Motorhöljet-batch: 8 videoannonser (MagiBorsten, hämtade via Meta Graph API) | no / Norwegian Bokmål | ✅ 2026-08-08 | ✅ 3 rättade (Knusktørr · motoroljer→motortrekk · avrundad slutmening), 5 rena | — (opt-in, ej beställt) | ✅ alla 8 levererade | proofread-först-flödet, EN render/video · ~356 enheter totalt · `PD_EXTRA` ej översatt (ingen röst i videon — endast musik) · ⚠️ priset "299 kroner" = NOK, bekräfta norsk prissättning |
| Axelbältet-batch: 4 videoannonser (hämtade via Meta Graph API) | no / Norwegian Bokmål | ✅ 2026-08-08 | ✅ 2 rättade (babbutiken.se→beverbutikken.no · pris→599 kroner), 2 rena | ✅ cover-captions (vit bård) | ✅ zip levererad | proofread-först · 2 omrenderingar efter Axels domän/pris-svar · Motorhöljet-prisfrågan (299) fortfarande öppen |
| Sätesöverdragaren-batch: 2 av 3 videoannonser (Meta Graph API) | no / Norwegian Bokmål | ✅ 2026-08-08 | ✅ 2 rättade i PD_1_3 (kjølerom→kjølelomme · angrer-meningen), PD_2_1 ren | ✅ blur-cover (kvadratformat, text utan platta) | ✅ zip levererad | PD_1_1 EJ dubbad — endast musik/sång, inget tal (0 krediter slösade) |
| Strandtofflor UGC (30MB .mov, bifogad i chatt) | no / Norwegian Bokmål | ✅ 2026-08-08 | ✅ 1 rättning (talspråksfiller) — fin UGC-norska f.ö. | — (utan captions, källan hade inga) | ✅ levererad (komprimerad till 26MB för chattgränsen) | .mov→mp4-konvertering före upload · HeyGen-output 42MB krävde omkodning för leverans |
| UK-batch: alla 15 talannonser från NO-körningarna (Mastern 1 · Motorhöljet 8 · Axelbältet 4 · Seatcover 2 · Strandtofflor 1) | uk / English (UK) | ✅ 2026-08-08 | ✅ 9 rättade (varumärke, Bone dry, £-priser 29/59, babbutiken→our online store, m.m.), 7 rena | ✅ per kampanjstil (box/bård/blur/clean) | ✅ alla 15 levererade (PD_7 släppt ur moderering efter ~1h) | £-priser från Axel · UK-engelskan höll hög klass ("does what it says on the tin") |
| DK-batch: alla 16 talannonser | dk / Danish (Denmark) | ✅ 2026-08-10 | ✅ 10 rättade (gerne, løg+folie, Mastern, Knastør, priser 259/429 DKK, i balance, kølelomme, webshop, m.m.), 5 rena | ✅ per kampanjstil | ✅ alla 16 levererade (2 släppta ur moderering — v2-API:t visade fel status, v3 hade rätt) | OBS: proofread-SRT måste ha samma antal block som originalet · dansk domän kvarstår som fråga |

Status per kolumn: ⏳ pågår · ✅ klar · ❌ fail. När en lokaliserad annons går live
loggas den dessutom som vanligt i `ad-tracker.md` (den är ett eget test).
| FI-batch: alla 16 talannonser | fi / Finnish (Finland) | ✅ 2026-08-12 | ✅ 6 rättade (Grillklinikenin Mastern, 420 D, tasapainossa, verkkokaupassamme, kadu-vändningen, filler), 6 rena | ✅ per kampanjstil | ✅ alla 16 levererade | Längdkoll: inget överspill trots finskans längre ord · tvåstegsleverans (prisfria först, prisannonser när €-priser kom) gav noll omrenderingar · Rutikuiva/Entä jos-fixar · priser 29,95 € / 59,95 € |
| NL-batch: alla 16 talannonser | nl / Dutch (Netherlands) | ✅ 2026-08-12 | ✅ 12 rättade (Mastern, Kurkdroog, motorolie→motorhoezen, alla priser strukna på begäran, spijt-vändningen, webshop), 4 rena | ✅ per kampanjstil | ✅ alla 16 levererade | 2 släpptes ur moderering i efterhand |
| MX-batch: alla 16 talannonser | mx / Spanish (Mexico) | ✅ 2026-08-13 | ✅ 10 rättade (El Mastern, coronas→pesos/strukna, 420 D, omkastad ordning, tienda en línea), 6 rena | ✅ per kampanjstil | ✅ alla 16 levererade | 2 containeromstarter — state-till-disk gjorde återupptagning möjlig utan omrendering |
| Drive-mapp: 3 Mastern-farsdagsannonser (100MB+ .mov via delad Drive-länk) | no / Norwegian Bokmål | ✅ 2026-08-13 | ✅ børstehår, rengjøre, stangen, sesong-grammatik | — (utan captions) | ✅ levererade | embeddedfolderview listar delad mapp utan API · komprimering 111MB→16MB före upload |
| MX2-batch: 17 Mastern-annonser (Drive-mapp, 3,5MB–143MB) | mx / Spanish (Mexico) | ✅ 2026-08-13 | ✅ 13 rättade: Grillkliniken→**La Clínica del Asador**, svenska kronor→pesos (grillvärden 25/30 tusen), "hasta 40% descuento"→**1,699 i st.f. 2,400 pesos**, master→Mastern | ✅ clean-stil på alla | ✅ alla 17 levererade | ⚠️ 40%-påståendet matchade inte 2400→1699 (=29%) — ersattes med faktiska priser · långa videor krävde hård komprimering för 30MB-gränsen |
| AU-batch: 19 Mastern-annonser (samma källor som MX2 + Rea_01 + Mastern_ad01) | au / English (Australia) | ✅ 2026-08-18 | ✅ alla 19 rättade per `au-localisation.md`: Grillkliniken→**The BBQ Clinic**, Mastern→**The Master**, "the grill"→BBQ/grate (aldrig grill som substantiv), AU-stavning, pris **$149.95**, grillvärden→$2,000/$3,000 (uppskattningar), "40% off"→"in our seasonal sale", slang ≤2 & barbie ≤1 · automatisk regex-verifierare körd tills grönt | ✅ clean/tight blur per kampanjstil, Rea_01-slutkort **ON SALE NOW** | ✅ 17/19 levererade (101_H2/H3 i moderationskö) | Verifierarens timecode-false-positives (1,699/2,400 i tidsstämplar) fixade · 3 SRT-uppladdningar behövde omtag pga CDN-lagg |
| Tofflor-batch: 12 ergonomiska tofflor-annonser (Drive-mapp, 1080×1920) | no + dk + fi + uk (48 översättningar) | ✅ 2026-08-18 | ✅ 24 rättade: alla belopp strukna (400→309 kr) och ersatta med **23 % rabatt**-formuleringar utan siffror, FI-produktterm enhetlig (tohvelit→**tossut**), DK/UK omvänd ordföljd i avslut ("Hjemmesko, ergonomiske"→"Ergonomiske hjemmesko"), NO påhittat "Ergotøfler"→"Ergonomiske tøfler", FI ordningstal 23:e→"kahdenkymmenenkolmen prosentin" | — (utan captions) | ✅ alla 48 levererade | ⚠️ **HeyGen-bugg:** PUT /srt svarade 200 men persisterade aldrig på 13 sessioner (retry hjälpte inte) — lösning: skapa NY proofread-session och lokalisera om mot det färska transkriptet · 2 UK krävde en tredje omgång |
| Mastern NO-batch: 9 unika videor ur Meta-export (14 annonser, 3 listicles + 2 dubbletter bortsorterade) | no / Norwegian Bokmål (Norway) | ✅ 2026-08-24 | ✅ 3 rättade: Grillklinikkens/Masteren→**Grillkliniken/Mastern**, nullbyte i 198_H10 (ø) lagad · rabatter 35/40 % behållna på Axels beslut | ✅ 8 av 9 hade inbrända svenska captions (193 ren): remsa-täckning + norska captions per uppmätt band · 198-seriens toppbanner ersatt med **ÅRETS STØRSTE SALG / 35 % RABATT — SLUTTER I KVELD** · ELECTRIC2: 3 overlay-texter ersatta (OVER 40 000 FORNØYDE GRILLERE, ÅRETS STØRSTE SALG 35%, 30 DAGERS FORNØYD-GARANTI); FRI FRAKT + 400 RPM identiska på norska, lämnades | ✅ alla 9 levererade | drawtext kräver `expansion=none` för %-tecken · ~1 050 credits · ⚠️ ~6 400 credits förbrukade utanför chatten mellan batcherna |
| Sushi-batch: 39 matstrumpor-annonser ur två Meta-exporter (SnarkLös + nya kungen) | en / English (generisk, US/UK/AU/Asien) | ✅ 2026-08-28 | ✅ alla pris/rabattnämningar→**buy one get one free**, säsong neutraliserad i tal (jul/alla hjärtans dag/påsk/november), talad domän→"the link below", feltranskriberingar rättade | ✅ EN-captions på alla · JULREA 50%-badge→**1+1 FREE** (asmr) · julstrumpa-banner→THE PERFECT GIFT · haiku-seriens textkort→engelska (kortbyten synkade mot VO:s One/Two/Three ur render-SRT) · s009h2 ordflashar→NOBEL PRIZE · FRI FRAKT→FREE SHIPPING · BESTÄLL NU→ORDER NOW | ✅ alla 39 levererade (asmr utan dubb — inget tal) | 17 videor låg på Matstrumpor.se-SIDAN, inte kontot: hämtade via annons-ID→creative→story-post→**page-token** ur /me/accounts · telefonslutkorten (somnet/november/opush) visar svenska butikssidan 399 kr — lämnade orörda i väntan på beslut · november har jultröja i bild (Axel körde ändå) |
| Sushi-batch runda 3: 29 av 39 ombyggda efter Axels granskning | en | ✅ 2026-08-28 | — | ✅ svenskt cream-slutkort (MATSTRUMPOR.SE + BESTÄLL NU) fanns i **26 videor** — ersatt med SUSHI SOCKS + maskot + ORDER NOW · telefonskärmarna med 399 kr täcks av slutkortet · julstrumpa/november-headlines översatta · fem karaoke-band breddat · FRI FRAKT-fönster breddade | ✅ ersättningsleverans skickad | ⚠️ disk-allowance tog slut mitt i bränningen → tysta moov-lösa stubbar; städa gamla batchar FÖRE stora omkodningar · ffmpeg split=N måste matcha antalet använda utgångar · slutkortssvepet (sista sekunden × alla videor) är nu obligatoriskt QA-steg |
| Sushi-batch runda 4: hook-headlines i 10 videor (s004/s006/s007) | en | ✅ 2026-08-28 | — | ✅ headlines översatta med **tajta plattor i pillrets exakta mått** (Axels krav: täck inte mer än nödvändigt) · s004h1/h3 gula ordflashar→blur + EN-rad · s004h2/h4 hook-captions ovanför bandet · s004h4 svart slide→GIFT CRISIS. | ✅ ersättningar levererade | pillergeometri mäts per video (position+intervall via numpy-profiler); blipintervall kan vara vita sceneobjekt — verifiera visuellt före täckning |
| Sushi-AU: 6 In Review-annonser ur Notion-hubben (8 videor) | au / English (Australia) | ✅ 2026-08-30 | ✅ 4 med tal: BOGO fanns redan, talad domän→"the link is below" · **4 utan tal** (bara musik) fångades gratis i proofread — enbart bildjobb | ✅ musikvideorna: ~26 svenska textkort ersatta (orange plattor/vit skuggtext i originalstil, mätta visuellt per kort med rutnätsoverlay) · slutkort→SUSHI SOCKS + ORDER NOW (1080-skala) · fable_h3 biloverlay översatt | ✅ alla 8 levererade | Notion-flöde: hubb→Typ-filter→sidornas "Finished Ad"-Drive-länkar · AI-b-roll-annonser = textkort varannan sekund, kräver kort-för-kort-mätning · **Fixrunda 2026-08-30:** Axel fångade svenska hook-headlines i övre delen av a016 + alla tre fable-hooks (bandskanningen täckte bara nedre tredjedelen) — ersatta med engelska kort/skuggtext i originalläge. Dessutom: HeyGens render-SRT levererar tokeniserade sammandragningar ("it 's", "ca n't") — måste alltid slås ihop före caption-bränning |
| EN-generisk: 20 Drive-videor (matstrumpor, mapp 1LXbVxyv…) | en / English (generisk) | ✅ 2026-09-02 | ✅ 18 med tal: domän→"the link below", "400 kronor"→"price of one" (BOGO-sant), jul→neutralt ("birthday present", "next time around"), sammandragningar ihopslagna före captions · 2 musikvideor gratis-fångade i proofread | ✅ per serie: karaoke-band täckta + EN-captions · hook-headlines (8 st) ersatta · a005:s svarta ordkort→statisk EN-text · a021:s telefon-UI ombyggt på engelska (blur under inflygning, vit skärm + BOGO-rader + Add to cart statiskt) · mascotflashar blurrade · alla cream-endcards→SUSHI SOCKS/ORDER NOW · musikvideor: orange plattor/kursiv text ersatt | ✅ 20 levererade i 18 zippar | Kvot 2233→621. Telefonmockupen landar statiskt efter ~2,5 s — mät settle-läget och bygg om skärmen där i stället för att jaga rörelsen |
