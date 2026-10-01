# Granska Matstrumpors utlandsbygge — uppdrag till en fristående session

> Skrivet 2026-09-30 av sessionen som byggde allt nedan ("Matstrumpor markets launch", grenen
> `claude/gallant-tesla-65cdwz`, 2026-09-27–30). Axels beställning samma dag: "Jag ska granska
> alla kampanjer snart. Om du skriver en prompt för en annan session att granska dig."
> Starta en ny session i miljön **Default DEFAULT** och skriv: *"Läs
> matstrumpor/marknader/PROMPT-granskning.md på main och gör exakt det som står där."*

## Uppdraget

Du är granskaren, inte byggaren. En annan session har byggt tre saker åt Matstrumpor:

- **Försäljning i 37 länder utanför Sverige** från samma Shopify-butik (`1r46tp-qx`, matstrumpor.se/.com/.no), med 13 språk och egna valutor.
- **15 kampanjer i Meta** med 112 annonser, i kontot "nya kungen" `730973156224390`. Allt är PAUSED.
- **Spårningssidan och fraktmejlen** på alla språken.

Axel granskar kampanjerna själv innan han slår på något. Men han läser inte japanska, polska eller finska, och han ser inte om en länk, en pixel eller ett land är fel. **Ditt jobb är att hitta allt som är fel innan en krona spenderas.**

Utgå från att det finns fel. Byggarens ✅ i README:erna räknas inte, och inte heller dess verktygs gröna utskrifter. Mät själv mot Meta, mot Shopify och mot det kunden ser. Hitta aldrig på ett fel heller: ett fynd utan bevis är inget fynd (CLAUDE.md regel 3). Ett falsklarm till Axel kostar lika mycket förtroende som ett missat fel.

## ⛔ Du ändrar ingenting — granskningen är läs-bar

- **Meta:** bara `GET` mot graph.facebook.com, aldrig `POST` eller `DELETE`.
  - Pausa, aktivera och ändra ingenting: ingen budget, text, målgrupp, video eller sida. PAUSED är ett beslut.
  - Hittar du något som är ACTIVE rapporterar du det överst. Du rör det aldrig (CLAUDE.md: "Axels annonser pausas aldrig av en session").
  - `annonser/bygg.mjs` får bara köras med `--lage`, aldrig med något annat argument, inte ens torrt. Torrkörningen skriver om `lage.json`.
- **Shopifys Admin API:** bara GraphQL-anrop som börjar med `query`, aldrig `mutation`. Appen "Fabriken" har skrivrätt, så spärren är din. Klienten finns i `sparning/butik.mjs` (`lasButik('matstrumpor')` och `skapaKlient`).
  - Kör aldrig `marknader/bygg.mjs` (butiken), `paslag.mjs --skriv`, `presentkort.mjs` eller något annat som skriver i temat, översättningarna eller prislistorna.
- **Som kund:** Chromium och HTTP går bra, även att välja land (`POST /localization`) och lägga i korgen.
  - Betala aldrig. Skriv aldrig in en e-postadress, ett namn, en adress eller ett kort i kassan. Ett övergivet köp med e-post startar Spoks mejlflöde till en påhittad kund.
  - Blockera Metas pixel i Chromium (`connect.facebook.net`, `facebook.com/tr`), så att granskningen inte bokförs som besök. Läs gärna pixelns id ur begäran innan du avbryter den.
- **Kostar pengar:** anropa aldrig HeyGen, ElevenLabs eller kie.ai.
- **Postar och skickar:** posta aldrig i Discord, Slack eller Notion, och skicka aldrig mejl. Spoks och Gmail får bara läsas.
- **Allmänt:**
  - Radera ingen fil och skriv aldrig ut en nyckel.
  - Skriv aldrig adressen Sjöhed 160 någonstans.
  - Kör inte `npm test` eller andra skript som inte står här. Ett test har publicerat över kundernas spårningssida förut.
- **Sverige:** de svenska annonserna och sidan Matstrumpor.se `820358954504320` får läsas, aldrig röras.
- **Taiwan:** kampanjen är tom med flit, eftersom Meta granskar bolaget som annonsör (se nedan). Försök inte ladda upp något.
  - Byggarsessionen har en egen check-in som försöker igen 2026-10-01 10:00 CEST (`trig_016d12cuKYbsvebNpC3MW22H`). Rör den inte.
- **Rättningar:** du rättar inga fel, inte ens uppenbara. Varje rättning blir ett förslag i rapporten, och en annan session rättar efter Axels ok. Så vet Axel exakt vad granskningen sa.
- **Det enda du skriver:** rapportfilerna i `matstrumpor/marknader/granskning/`, plus ett återanvändbart läs-bart kontrollskript där om du bygger ett. Nedladdningar och arbetsfiler läggs i scratchpad. Undantaget är `egna/hamta.mjs`, som lägger de svenska källorna i `egna/kalla/`, en gitignorerad mapp.

## Facit: vad som byggdes och var det står

Läs först, i den här ordningen:

1. CLAUDE.md, stycket om Matstrumpor (laddas av sig självt).
2. `matstrumpor/marknader/README.md`, hela. De viktigaste avsnitten är "Priserna", "Domänerna", "QA som kund", "Facebook-sidan", "Fraktrutan", "Japan och Taiwan", "Kampanjerna i kontot" och "Annonserna i kontot".
3. `annonser/marknader.json`.
4. `egna/README.md` → Språkkoder.
5. `heygen/README.md` → "Japanska och kinesiska".
6. Copy-reglerna: `oversattning/REGLER.md`, `REGLER-EUROPA.md`, `REGLER-ASIEN.md` och `docs/copy-regler.md`.

| Vad | Facit i repot |
|---|---|
| Kampanj, adset, länder, länk, budget, sida, Instagram, pixel per marknad | `matstrumpor/marknader/annonser/marknader.json` |
| Annonstexterna (rubrik, brödtext, länkbeskrivning) per annons | `annonser/<KOD>.json` |
| Vilken fil, video, creative och annons varje annons bär (byggarens minne, inte facit) | `annonser/videor.json`, `annonser/lage.json` |
| Undertexterna i 001–003 (Nathalie, Sofie H1, Sofie H2, HeyGen `precision`) | `heygen/srt/<KOD>/matstrumpor_{nathalie,sofie_h1,sofie_h2}.srt` |
| Manus och bildtext i 004–007 (012v2, haikuh3, haikuh2, s001h1) | `egna/<KOD>/*.json` (i JP bär fältet `las` uttalet i hiragana) |
| Det svenska originalet: vad de svenska videorna säger, manusen, 012v2:s rutor | `transkript/` (`register.json` kopplar filerna), `egna/*.manus.json`, `egna/bildtexter.sv.json` |
| Bildannonsen 008 (D3 "Köp 2 – få 2") | `egna/d3/texter/<KOD>.json` |
| Marknader, länder, språk, valutor, fasta priser | `matstrumpor/marknader/konfig.json` |
| Sajtens texter per språk (207 per språk) | `matstrumpor/marknader/output/underlag-<locale>.json` |
| Spårningssidans fraser | `sparning/sprak/<kod>.json`, `sparning/butiker.json` → matstrumpor |
| Katarinas två svenska videor (får aldrig synas utomlands) | `heygen/kallor.json` → `katarina_unge`, `katarina_alskaren` |
| Varukostnad per land | `matstrumpor/cogs.json` |

**Konstanterna** (kontrollera dem också, citera dem inte bara):

- Konto `730973156224390` "nya kungen" (SEK).
- Pixel `1785935302094082`. Bäverbutikens `1554276343018184` får aldrig synas här.
- Utlandsannonsernas Facebook-sida är Matstrumpor `1285064981363590`. Instagram-identiteten är den sidburna `17841423405715219`.
- Sverige har sidan Matstrumpor.se `820358954504320`.

**Kampanjerna** (läget i `lage.json` 2026-09-30 13:02 UTC, 8 annonser per kampanj):

| Kod | Kampanj-id | Adset-id | Länder | Språk | Länk |
|---|---|---|---|---|---|
| NO (A) | 120251749551520023 | 120251749551860023 | NO | nb | matstrumpor.com/nb/…?country=NO |
| NOB (B) | 120251777339520023 | 120251777678860023 | NO | nb | matstrumpor.no/…?country=NO |
| DK | 120251749599180023 | 120251749600560023 | DK | da | .com/da/…?country=DK |
| FI | 120251749604200023 | 120251749605630023 | FI | fi | .com/fi/…?country=FI |
| US | 120251749609010023 | 120251749610210023 | US | en | .com/…?country=US |
| WW | 120251749612350023 | 120251749614670023 | GB, AU, CA, NZ | en | .com/… utan land |
| DE | 120251750242530023 | 120251750243010023 | DE, AT, CH | de | .com/de/… utan land |
| FR | 120251750244370023 | 120251750244800023 | FR, BE, LU | fr | .com/fr/… utan land |
| NL | 120251750246440023 | 120251750247190023 | NL | nl | .com/nl/…?country=NL |
| ES | 120251750248310023 | 120251750249260023 | ES | es | .com/es/…?country=ES |
| IT | 120251750250830023 | 120251750251380023 | IT | it | .com/it/…?country=IT |
| PL | 120251750321130023 | 120251750322480023 | PL | pl | .com/pl/…?country=PL |
| PT | 120251750324340023 | 120251750325430023 | PT | pt-PT | .com/pt-pt/…?country=PT |
| JP | 120251797899280023 | 120251797901800023 | JP | ja | .com/ja/…?country=JP |
| TW | 120251796778420023 | — (inget adset än) | TW | zh-TW | .com/zh-tw/…?country=TW |

Annonserna heter `MATSTRUMP_<KOD>_sushi_<vinkel>_<format>_<nnn>_v1`:

| Nr | Innehåll | Hur den gjordes |
|---|---|---|
| 001 | Nathalie | HeyGen |
| 002 | Sofie H1 | HeyGen |
| 003 | Sofie H2, julvinkeln | HeyGen |
| 004 | 012v2, bildtext utan röst | egen rendering |
| 005–007 | haikuh3, haikuh2, s001h1 | ElevenLabs-röst |
| 008 | bildannonsen D3 | skarp text på `egna/d3/bas.png` |

NOB återanvänder NO:s videor och bilder.

## Kända beslut — inte fel

Allt nedan är beslutat av Axel eller av byggaren med skäl, och det står i filerna. Räkna det inte som fel. Kostar ett beslut pengar eller kunder enligt din mätning, lägg det under "Frågor till Axel" med ditt bevis.

1. **Allt är PAUSED.**
   - Budgetarna: NO 500 + NOB 500 kr/dag (A/B-testet), övriga 1 000 kr/dag.
   - JP och TW har platshållare, "EJ GIVEN" av Axel.
   - Inget slås på förrän Axel granskat ("jag vill inte att du aktiverar kampanjerna i meta för ens jag har granskat alla").
2. **A/B-testet i Norge:**
   - A = .com/nb med raden "Et svensk merke.".
   - B = matstrumpor.no, utan raden, samma videor.
   - B får aldrig påstå att butiken är norsk.
3. **Länderna och länkarna:**
   - WW bär bara GB, AU, CA och NZ ("en kampanj per marknad").
   - WW, DE och FR länkar utan `?country=`, eftersom kampanjerna har flera länder. Shopify väljer då land efter kundens IP.
   - Belgien ligger bara i FR, alltså på franska. Det är en öppen fråga till Axel sedan 2026-09-30 (`marknader.json` → FR `lank_not`).
   - IE, GR, CZ och tretton andra Europa-länder säljs i butiken men har ingen kampanj. Det är Axels beslut.
4. **Identitet och varumärke:**
   - Instagram visas via sidan (sidburen identitet utan profil att klicka på). Det är byggarens beslut.
   - Sidans namn "Matstrumpor" syns som annonsör. Det är identiteten, inte annonstext.
   - I annonstexten står butikens namn och domän aldrig.
   - Brödtextens sista rad är "svenskt varumärke" på marknadens språk. I Japan är det 「スウェーデン発のブランドです。」, aldrig スウェーデン製 ("tillverkad i Sverige").
5. **Moms, tull och siffran fyra:**
   - Ingen moms- eller tulltext någonstans, på Axels order ("Alltid noll moms och tull, det hanterar jag själv"). En saknad "inkl. moms" är alltså rätt.
   - Kassans egna skatterader är Shopifys. Rapportera dem, men föreslå aldrig ändrade skatteinställningar.
   - Siffran fyra (四) sägs och skrivs aldrig i japanska och kinesiska annonser (四 = död).
6. **Videorna:**
   - Katarinas UGC lämnar aldrig Sverige.
   - UGC (Nathalie, Sofie) är översatt i HeyGens dyraste läge.
   - Egna videor har egen röst, aldrig HeyGens översättning.
7. **Priserna:**
   - Utlandspriserna ligger minst 20 % över Sveriges pris i dagens kurs (`paslag.mjs`, sänker aldrig).
   - USA:s $69 är Axels eget pris.
   - Japan och Taiwan ligger "som i Europa".
8. **Löften och kända luckor:**
   - Leveranstiden är 5–10 arbetsdagar överallt. Löften som "framme till jul" finns bara på svenska.
   - Klarna är borttaget i Japan och Taiwan.
   - Trust Badges-appen (Klarna/Swish-raden) är dold utom på svenska.
   - Judge.me-recensionerna står på svenska tills Judge.me översatt dem, vilket kan ta upp till 48 h efter 2026-09-29. Byggaren stämmer av 1/10. Taiwans Judge.me-ruta är på engelska.
   - Spoks mejlflöden går på engelska till Japan och Taiwan tills innehållet är översatt (`spoks: false`).
   - Collaget "Nu i hela världen" på startsidan är en annan sessions sektion.
9. **Taiwan:**
   - Meta kräver en verifierad förmånstagare och betalare.
   - Cowork valde STONEBITE ECOM AB 2026-09-30 ~15:00 CEST, och Meta granskade fortfarande.
   - Kampanjen är tom tills dess. De åtta annonsfilerna finns: `annonser/TW.json`, `heygen/srt/TW/`, `egna/TW/` och `egna/d3/texter/TW.json`.
   - Videofilerna ligger bara i byggarens container (`annonser/klar/*.mp4` är gitignorerade).
   - Finns TW-annonserna i kontot när du kör: granska dem som de andra. Annars granskar du texterna, och ljudet hamnar under "kan inte mätas".

## Där byggaren själv är osäker — börja gärna här

Listan är byggarens egen blinda fläck, inte hela granskningen.

1. **Rösten i Taiwan** (005–007, den infödda rösten Anna Su) gav 0,78–0,85 i täckning replik för replik, lägre än Japans 0,88–0,91. Ett fel i en ton kan byta betydelse. Mätt med `pipeline/seglyssna.py`, siffrorna i `egna/README.md`.
2. **Japanskan i 001–003:** HeyGens läppsynk och uttal av produktordet 靴下. Syns det svenska undertexter kvar någonstans? De suddades bara i sin ruta, medan de syns.
3. **004 (012v2):** textrutor med långa tyska och finska ord samt CJK-radbrytning. Går texten utanför rutan?
4. **003 är julvinkeln.** Passar den i Japan och Taiwan?
5. **s001h1 (007):** en AI-röst berättar varför "hon" startade företaget. Är det ett påstående som inte håller, i något land?
6. **Erbjudandet i 008 och paketväljaren**, "Köp 2 – få 2" (4 lådor, betala för 2): ger korgen det i varje valuta, JPY och TWD inräknade?
7. **Lokala valutor som räknas om av Shopify** (CHF, PLN, DKK, GBP, AUD, CAD, NZD): håller de +20 %, och ser beloppen rimliga ut?

## Granskningen i sju delar

### A. Kontot i Meta (mekaniskt, alla objekt)

Läs med få, breda anrop:

- `act_730973156224390/campaigns`
- `…/adsets`
- `…/ads` med `creative{…}` expanderad

Använd `limit` och paginering. Meta stryper med kod 17 vid många anrop, så backa av, 30/60/120 s. Med curl: `--cacert /root/.ccr/ca-bundle.crt`, och `-g` så att `{}` inte tolkas. För egna node-skript: `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`.

1. **Status.** Alla 15 kampanjer, deras adsets och alla annonser: `status` PAUSED. Hittar du något ACTIVE, rapportera det överst och rör det inte.
2. **Strays.** Leta i hela kontot efter objekt som bär sidan `1285064981363590`, en .com- eller .no-länk, eller utlandsländer, men som inte ligger i de 15 kampanjerna. Det kan vara dubbletter från misslyckade körningar.
3. **Identitet.** Varje utlandsannons ska bära `page_id` 1285064981363590 och `instagram_user_id` 17841423405715219. Ingen svensk annons får bära 1285064981363590, och ingen utlandsannons 820358954504320.
4. **Länken.** Annonsens länk och knappens länk ska vara lika med `marknader.json` → `lank`, och svara 200. Om den landar rätt som kund prövas i del D.
5. **Målgruppen.**
   - `geo_locations.countries` ska vara lika med `marknader.json` → `geo`.
   - Sverige får inte finnas i någon utlandskampanj, och inget land får ligga i två utlandskampanjer. NO och NOB är A/B-testet och delar Norge med flit.
   - Rapportera ålder, Advantage+ audience och platstyper. Facit är `adset_mall`.
6. **Pixel och optimering.**
   - `promoted_object` ska vara `{pixel_id: 1785935302094082, custom_event_type: PURCHASE}`, `optimization_goal` OFFSITE_CONVERSIONS och attributionen 7 dagars klick.
   - Kampanjen ska ha `objective` OUTCOME_SALES och `special_ad_categories` tomt.
7. **EU:s DSA.** Adset med EU-länder ska bära `dsa_beneficiary` och `dsa_payer`, som SE-adsetet (`STonebite`). Saknas de levererar Meta inte i EU, och det är 🔴.
8. **Metas egen granskning.** `ad_review_feedback` och `issues_info` på varje annons. Ett avslag är 🔴, med Metas text.
9. **Förbättringar.** `degrees_of_freedom_spec` på varje creative. Allt som Meta får ändra själv, som text, översättning, musik över rösten eller bildbeskärning, ska vara avslaget (`ingaEnhancements()` i `tools/meta-lib.mjs`). Är något påslaget, avgör om det kan ändra språket eller budskapet.
10. **Copy ur Meta.** Rubrik, brödtext och länkbeskrivning ur `object_story_spec`, inte ur repot, jämförda med `annonser/<KOD>.json`. Det kunden ser är Metas version. Varje skillnad är ett fynd.
11. **Namn och antal.** Åtta per kampanj (TW 0), numrerade 001–008. Samma nummer ska vara samma innehåll i alla marknader: jämför videons `title` med `videor.json` → `fil`.
12. **Budgetarna.** CBO-budget per kampanj ska vara lika med `budget_sek_dag`. Summera vad allt kostar per dag om allt slås på.
13. **Taiwan.** Är adsetet skapat när du kör: `regional_regulated_categories` ska vara `["TAIWAN_UNIVERSAL"]`, med förmånstagare och betalare.
14. **Domänerna.** Om API:t låter dig: är matstrumpor.com och .no verifierade i Business Manager Matstrumpor.se `3354502211392342` (`owned_domains`)? Annars hamnar det under "kan inte mätas".

### B. Innehållet i varje video och bild

Ladda ner exakt det Meta har, inte byggarens filer (de är gitignorerade):

- **Video:** `GET /{video_id}?fields=source,length,title`. `video_id` står i `object_story_spec.video_data.video_id`. Mätt 2026-09-30: `source` svarar för kontots egna videor.
- **Bild:** ta `image_hash` ur creativen och läs `act_730973156224390/adimages?hashes=[…]&fields=url`.
- Samma `video_id` i flera annonser (NOB/NO och kanske WW/US) mäts en gång.

1. **Tekniken** (ffprobe):
   - 9:16, upplösning, längd.
   - Ljudspår finns, är inte tyst och klipps inte av mitt i en replik.
   - `python3 pipeline/rostkoll.py` kräver den svenska källan. Egna källor hämtas med `node matstrumpor/marknader/egna/hamta.mjs`. UGC-källorna (`heygen/kallor.json`) hämtas samma väg, via den svenska annonsens förhandsvisning (`/{ad_id}/previews`). Går det inte, mät det du kan utan källa och skriv vad som saknas.
2. **Rösten, replik för replik:**
   - 001–003: `python3 pipeline/seglyssna.py <video> <srt> <språk>`, med SRT:n ur `heygen/srt/<KOD>/`.
   - 005–007: där finns ingen SRT med tider i repot. Transkribera hela filen med Whisper `medium` (`word_timestamps=True`, `condition_on_previous_text=False`) och lägg det bredvid manuset i `egna/<KOD>/*.json`.
   - Hörs marknadens språk? Går varje replik fram, och framför allt produktordet?
   - faster-whisper, opencc och modellerna small/medium fanns i containern 2026-09-30. Saknas de: `pip install faster-whisper opencc-python-reimplemented`.
   - Whisper medium på fyra kärnor tar ungefär videons längd. Kör flera processer om kärnorna räcker.
3. **Bilden, med egna ögon:**
   - Dra en ruta per sekund plus alla scenbyten, och bygg kontaktark (till exempel 4 × 4 med Pillow). Titta på varje ark, eller låt en subagent göra det.
   - Leta efter svensk text i bild (inbränd, suddad men läsbar, på slutkortet) och loggan "MATSTRUMPOR.SE".
   - Leta efter undertexter på fel språk, undertexter utanför bilden eller på mer än två rader, och fyrkanter i stället för CJK-tecken (saknad font).
   - Leta efter 四 i JP och TW och priser i bild.
   - Förpackningens tryckta "Sushi-Strumpor" är produkten, inte ett fel.
4. **Katarina.** Ingen utlandsvideo får visa henne. Hämta en bild ur hennes två svenska videor (via förhandsvisningen) och jämför med personerna i utlandsvideorna. Kontrollera också att ingen videotitel innehåller "katarina".
5. **Bildannonsen 008:**
   - Texten ska vara på marknadens språk och säga det paketet ger (4 lådor, betala för 2).
   - Inget pris, ingen butik, ingen domän. Sex lådor i bild, och inget 四 i JP och TW.

### C. Språket — en infödd granskare per språk

Språken är nb (NO + NOB), da, fi, en (US + WW), de, fr, nl, es, it, pl, pt-PT, ja och zh-TW. Varje granskare får ett paket:

1. Annonstexterna ur Meta (del A10).
2. Det som faktiskt sägs, ur transkripten i B2, och det som faktiskt står i bild, ur kontaktarken i B3.
3. Undertexterna och manusen i repot.
4. Bildannonsens text.
5. Det kunden läser på sajten på språket: produktsidan, paketväljaren, fraktrutan, korgen och spårningssidan ur del D. Policyerna är granskade två gånger och ingår inte.
6. Fraktmejlen ur del E.

Granskaren läser som en infödd kund och som en marknadsförare som kan konsumentlagen. Den letar efter:

- **Betydelsefel** mot det svenska originalet: `transkript/` (de svenska videornas tal), `egna/*.manus.json`, `egna/bildtexter.sv.json` och `output/underlag-sv.json`.
- **Onaturliga meningar**, stavfel, grammatik och tilltal. Du/ni och Sie/du ska vara konsekventa.
- **Formaten:** decimaltecken, valutaformat och datum.
- **Svenska rester.**
- **Påståenden som inte håller:**
  - "Tillverkad i Sverige" eller "designad i Sverige". Bara "svenskt varumärke" är sant.
  - Påhittade fakta och löften som inte finns i policyn.
  - Leveransdatum och löften om att det kommer fram till en högtid.
  - "Gratis" som korgen inte ger.
- **Det förbjudna:** butikens namn eller domän i annonsen, moms- eller tulltext, 四 i text, tal eller bild (JP/TW), スウェーデン製, och att B-sidan påstår att butiken är norsk.
- **Kulturen:** passar julvinkeln, presenttonen och siffrorna i landet?

Varje granskare lämnar två saker:

- **Fynden**, i formatet nedan.
- **Varje annons översatt tillbaka till svenska:** rubrik, brödtext, vad som sägs och vad som står i bild. Det blir Axels bilaga, så att han kan granska språk han inte läser.

### D. Sajten som kund, i varje land med kampanj

Kör byggarens `node matstrumpor/marknader/kundvy.mjs`. Pröva den sedan själv i Chromium (`/opt/pw-browsers`, `--ignore-certificate-errors`, proxyn ur miljön), minst i alla 21 kampanjländer. Öppna exakt annonsens länk ur Meta med landet satt:

- Använd `?country=` eller POST `/localization`, receptet står i `kundvy.mjs`.
- Containern går ut på nätet från USA. Utan landet visar Shopify USA, och .se skickar dig vidare till .com.

1. **Sidan:**
   - Språk och valuta.
   - Priset per paket mot `konfig.json` och mot golvet Sverige + 20 % i dagens kurs (`node matstrumpor/marknader/paslag.mjs` utan argument är torrt).
   - Fraktrutan med rätt land och flagga.
   - Loggan "Matstrumpor" (aldrig ".SE") utanför Sverige.
   - Ingen moms- eller skatterad och inga svenska ord.
   - I Japan och Taiwan varken Klarna eller Swish.
   - Trustpilot-raden på språket. Rapportera läget för Judge.me-rutan.
   - Pixelns id ska vara `1785935302094082`. Läs det i sidans web-pixel-konfiguration eller i en avbruten begäran till `facebook.com/tr`. Shopifys pixlar kan köras i en sandlåda som `page.route` inte ser, så skriv vilken väg du läste.
2. **Korgen:**
   - Välj "Köp 2 – Få 2" (4 lådor) i paketväljaren och lägg i korgen.
   - Korgen ska visa 4 lådor, betalt för 2, med den summa paketväljaren lovade, i marknadens valuta. Ätpinnarna ska vara med om paketet lovar dem.
   - Öppna kassan utan att skriva något. Språk, valuta och summa, och frakten om den syns utan adress. Betala aldrig.
3. **Spårningssidan** `/pages/spara` på språket. Rubrik och texter ska vara på språket, och ett påhittat nummer ska ge "hittar inte" på språket.
4. **Fraktzonerna** (Admin API, `query deliveryProfiles`): varje kampanjland ska ha en gratis fraktsats. Annars är annonsernas och fraktrutans "fri frakt" falskt.
5. **Kan inte mätas härifrån:** vad Shopify väljer efter IP för länkarna utan land (WW, DE, FR). Du kan bara simulera landet.

### E. Mejlen

1. **Shopifys tre fraktnotiser** (skickad, ute för leverans, levererad) på alla 13 språken: `query translatableResources(resourceType: EMAIL_TEMPLATE)` med `translations(locale: …)`.
   - Finns översättningen, och är den på rätt språk?
   - Språkgranskaren i del C läser ämnet och brödtexten.
   - Bakgrunden står i `mejl/README.md` → "Matstrumpor på tolv språk".
2. **Spoks.** Om Spoks-verktygen finns i sessionen: läs Matstrumpors flöden per språk (workspace `71c2d4c8-b9ec-488a-b15c-5dfe8dbd2226`, `klaviyo/spoks/README.md` → "Matstrumpor på alla språk"). Bara läsa. Annars hamnar det under "kan inte mätas".

### F. Byggarens påståenden

Gå igenom Japan/Taiwan-stycket i CLAUDE.md och avsnitten "Japan och Taiwan", "Annonserna i kontot", "Facebook-sidan" och "Fraktrutan" i `marknader/README.md`. Pröva varje påstående som går att mäta mot verkligheten: antal, id:n, priser, länkar, språk och "läst tillbaka". Ett påstående som inte håller är ett fynd, även om sajten är rätt. Dokumentationen är nästa sessions minne.

### G. Pengarna (information, ingen dom)

Det här är bara information. Det finns ingen data på annonserna än, och CLAUDE.md regel 3 förbjuder domar utan data.

- Skriv vad det kostar per dag om allt slås på.
- Skriv break-even-ROAS per kampanjland ur `node matstrumpor/kor.mjs --ekonomi --marknad <LAND>`.
- Skriv vilka länder som saknar varukostnad i `cogs.json`, eftersom break-even inte går att räkna där.

## Så kör du det

Det här är en stor granskning. Kör den parallellt:

- Använd Workflow-verktyget om Axel bett om det.
- Annars: Agent-verktyget med flera subagenter i samma meddelande.

1. **Samla in** (tre agenter parallellt):
   - kontot (A),
   - media (B: nedladdning, röst, kontaktark),
   - sajten och mejlen (D + E).
   
   Varje agent skriver sina mätningar till scratchpad som JSON med bevis: id, URL, klockslag, utdrag.
2. **Döm per språk** (en agent per språk, 13 st): paketet ur steg 1 enligt del C. De kan starta så fort deras språks data finns.
3. **Pröva varje 🔴 en gång till**, med en ny agent som försöker motbevisa fyndet med en egen mätning. Fynd som inte håller stryks eller sänks, med en rad om varför.
4. **Leta efter luckor.** En sista agent läser rapportutkastet mot checklistan nedan och säger vad som inte prövats. Det görs, eller hamnar under "kan inte mätas" med orsak.
5. **Skriv rapporten** (nedan).

Varje agent får samma ⛔-regler som du, ordagrant. Säg till varje agent att den inte får skriva något utanför scratchpad.

## Formatet på ett fynd

Påhittat exempel, bara för formatet:

```
G-017 🔴  PL 003 (MATSTRUMP_PL_sushi_jul_ugc_003_v1, <annons-id>)
Vad:     Brödtexten lovar leverans före jul — ett leveranslöfte som bara får stå på svenska.
Bevis:   object_story_spec.video_data.message ur Meta 2026-10-01 09:12 UTC: "…"; PL.json rad 14 säger samma sak.
Förslag: Stryk meningen; ny rad skrivs av sonnet i rättningssessionen (CLAUDE.md regel 6). Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

- **🔴 stoppar kampanjen:**
  - Fel konto, land, länk, pixel eller sida.
  - Något ACTIVE.
  - Fel språk, eller pris eller erbjudande som inte stämmer med korgen.
  - Falskt påstående.
  - Något förbjudet: butik eller domän i annonsen, moms- eller tulltext, 四, スウェーデン製, Katarina, svensk text.
  - Metas avslag.
  - Trasig video eller ljud, eller ett produktord som inte går fram.
- **🟡 bör rättas:** onaturlig mening, stavfel, tonfall, svag replik, kosmetiskt på sajten.
- **🔵 fråga till Axel eller idé.**
- **"Kan inte mätas härifrån"** är en egen lista med orsak, aldrig grön och aldrig röd.

## Leveransen

1. **`matstrumpor/marknader/granskning/GRANSKNING-<ÅÅÅÅ-MM-DD>.md`**, på svenska.
   - Överst domen per kampanj i en tabell: kampanj, annonser, 🔴, 🟡, "klar att slå på: ja/nej" och länk till Ads Manager (`https://adsmanager.facebook.com/adsmanager/manage/ads?act=730973156224390&selected_campaign_ids=<id>`).
   - Sedan alla fynd, röda först.
   - Sedan "kan inte mätas", frågorna till Axel, pengarna (G) och "så granskade jag" (metod, klockslag, antal mätta objekt).
2. **`matstrumpor/marknader/granskning/<ÅÅÅÅ-MM-DD>-vad-annonserna-sager.md`:** varje annons på svenska, per kampanj.
3. **Git:** commit (svenskt meddelande), push, PR och merge till `main`, med bara filerna i `granskning/`. Rutinerna och nästa session läser `main`.
4. **Om Artifact-verktyget finns:** publicera gärna rapporten som en privat sida. En rad per annons med en bild, ✅/❌ och vad den säger på svenska. Axel har dyslexi och läser en sida lättare än en lång fil.
5. **Svaret till Axel i chatten:** kort och på svenska.
   - Hur många röda och gula fynd, och vilka kampanjer som är klara att slå på.
   - De värsta fynden, en mening var.
   - Sist, under rubriken **Din uppgift**, numrerat och en mening per rad:
     1. Klistra in i sessionen "Matstrumpor markets launch" (eller en ny session): *"Läs matstrumpor/marknader/granskning/GRANSKNING-<datum>.md på main och rätta allt rött och gult."*
     2. Granska annonserna i Ads Manager med länkarna i rapporten.
     3. Den enda viktigaste frågan till Axel, med svarsalternativ. Övriga frågor står i filen (CLAUDE.md: en fråga i taget).

## Definition of done — bocka av i svaret, ✅/❌ per rad

- [ ] Alla 15 kampanjer, deras adsets och alla annonser lästa ur Meta. Antal och status stämmer, eller avvikelsen är ett fynd.
- [ ] Strays sökta i hela kontot.
- [ ] Sida, Instagram, länk, länder, pixel, DSA, Metas granskning och förbättringarna kontrollerade på varje utlandsannons.
- [ ] Varje unik video nedladdad ur Meta, med teknik, röst replik för replik och kontaktark tittade på. Bildannonsen 008 tittad på i varje språk.
- [ ] Katarina uteslutet med bild, inte bara med namn.
- [ ] En infödd granskare per språk (13) har läst annonser, tal, bildtext, sajtens köptexter, spårningssidan och fraktmejlen.
- [ ] Sajten prövad som kund i alla 21 kampanjländer: språk, valuta, pris mot facit och golvet +20 %, fraktrutan, loggan, ingen momsrad, pixelns id.
- [ ] Korgen "Köp 2 – Få 2" prövad i varje valuta. Ingenting betalt och ingenting inskrivet i kassan.
- [ ] Fraktzonerna lästa: fri frakt till varje kampanjland.
- [ ] Byggarens påståenden i CLAUDE.md och README prövade.
- [ ] Varje 🔴 prövad en gång till av en annan agent.
- [ ] Luckorna sökta, och allt omätbart listat med orsak.
- [ ] Rapporten och bilagan på `main`. Inget annat ändrat i repot, i Meta, i Shopify eller någon annanstans.
- [ ] Svaret till Axel kort, med hans uppgifter sist.
