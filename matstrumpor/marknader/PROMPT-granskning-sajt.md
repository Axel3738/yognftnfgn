# Granska Matstrumpors sajt i alla marknader — uppdrag till en fristående session

> Skrivet 2026-10-01 kväll av byggarsessionen ("Matstrumpor markets launch", grenen
> `claude/gallant-tesla-65cdwz`). Axels beställning samma kväll: "en prompt som granskar nu hela
> hemsidan och allting från alla marknader … så att .no-hemsidan visas som norska … att det inte
> omdirigeras till .se och att .com-domänerna fungerar i alla länder … kolla så att kassan ser bra
> ut från de olika marknaderna så att betalningsmetoden finns … och mer nödvändiga grejer om du tror
> att jag hade velat ha granskade och verkligen veta att de ser bra ut".
> Starta en ny session i miljön **Default DEFAULT** och skriv: *"Läs
> matstrumpor/marknader/PROMPT-granskning-sajt.md på main och gör exakt det som står där."*

## Uppdraget

Du är granskaren, inte byggaren. Sajten är **Matstrumpor** i Shopify-butiken `1r46tp-qx`, på fyra
domäner (matstrumpor.se, .com, .no och .eu), med sex marknader och 14 språk. **14 kampanjer i Meta
startar fredag 2026-10-02 00:01** och skickar köpare från 19 länder till sajten.

Axel vill veta att varje kund i varje land får rätt sida: rätt domän, språk, land, valuta och pris,
och en kassa som går att betala i med de betalsätt landet väntar sig. Tre saker har han pekat ut:

1. **matstrumpor.no** visas på norska för den som är i Norge och skickas aldrig vidare till .se.
2. **matstrumpor.com** fungerar i alla länder.
3. **Kassan** i varje marknad ser bra ut och har betalsätten.

Allt annat som en kund ser eller får hör också till granskningen: sidor, menyer, policyer,
mejl, mobilvy och Sverige, som inte får ha tagit skada.

Utgå från att det finns fel. Byggarens ✅ i README:erna räknas inte, och inte heller verktygens
gröna utskrifter. Mät själv mot det kunden ser och mot Shopify. Hitta aldrig på ett fel heller:
ett fynd utan bevis är inget fynd (CLAUDE.md regel 3). Ett falsklarm till Axel kostar lika mycket
förtroende som ett missat fel.

## ⛔ Du ändrar ingenting — granskningen är läs-bar

- **Meta:** bara `GET` mot graph.facebook.com.
  - Rör aldrig en kampanj, ett adset eller en annons. Starten 00:01 körs av byggarsessionen
    (`trig_01NVdXzi1vLMKY8id9FxzT9N`), aldrig av dig. Rör inte den triggern.
  - `annonser/schemalagg.mjs`, `annonser/bygg.mjs` och `annonser/nob.mjs` körs inte, inte ens torrt.
- **Shopifys Admin API:** bara GraphQL som börjar med `query`, aldrig `mutation`. Appen "Fabriken"
  har skrivrätt, så spärren är din. Klienten: `sparning/butik.mjs` (`lasButik('matstrumpor')`,
  `skapaKlient`).
  - Kör aldrig något som skriver i temat, översättningarna, prislistorna eller marknaderna:
    `marknader/bygg.mjs`, `domantema.mjs`, `temapatch.mjs`, `presentkort.mjs`, `paslag.mjs --skriv`,
    `matstrumpor/trustpilot.mjs`, `matstrumpor/varva.mjs` och allt i `sparning/` utom `butik.mjs`.
- **Som kund i Chromium eller med HTTP:**
  - Det här får du göra: välja land (`?country=` eller `POST /localization`), lägga i korgen och
    öppna kassan.
  - Skriv aldrig något i kassan: ingen e-post, inget namn, ingen adress, inget telefonnummer, inget
    kort och ingen rabattkod. Tryck aldrig på en betalknapp. Ett övergivet köp med e-post startar
    Spoks mejlflöde till en påhittad kund.
  - **Skicka aldrig ett formulär:** inte kontaktformuläret (kundtjänstboten på Railway svarar skarpt
    inom en minut, och köparenkätens rutin läser samma brevlåda), inte nyhetsbrevet (Spoks
    välkomstflöde), inte Judge.me:s recensionsformulär, inte Trustpilot och inte presentkortet.
    Skapa inget kundkonto och logga aldrig in.
  - Blockera Metas pixel i Chromium (`connect.facebook.net`, `facebook.com/tr`), så att granskningen
    inte bokförs som besök. Läs gärna pixelns id ur begäran innan du avbryter den.
- **Globalping** (api.globalping.io) får användas för läsningar från riktiga länder, helst genom
  `geokoll.mjs` (nedan). Kvoten är 250 mätningar i timmen per IP och delas av allt i containern.
  Låt därför bara EN agent använda den.
- **Kostar pengar:** anropa aldrig HeyGen, ElevenLabs eller kie.ai.
- **Postar och skickar:** posta aldrig i Discord, Slack eller Notion, och skicka aldrig mejl. Spoks
  och Gmail får bara läsas.
- **Allmänt:**
  - Radera ingen fil och skriv aldrig ut en nyckel.
  - Skriv aldrig adressen Sjöhed 160 någonstans.
  - Kör inte `npm test` eller andra skript som inte står här. Ett test har publicerat över
    kundernas spårningssida förut.
- **Rättningar:** du rättar inga fel, inte ens uppenbara. Varje rättning blir ett förslag i
  rapporten, och byggarsessionen rättar efter Axels ok.
- **Det enda du skriver:** rapportfilerna i `matstrumpor/marknader/granskning/`, plus läs-bara
  kontrollskript där om du bygger några. Arbetsfiler, skärmdumpar och JSON läggs i scratchpad.

## Facit: vad som finns och var det står

Läs först, i den här ordningen:

1. CLAUDE.md, stycket om Matstrumpor. Det laddas av sig självt.
2. `matstrumpor/marknader/README.md`. De viktigaste avsnitten är "Domänerna", "Allt utland via
   matstrumpor.com", "Sett från riktiga länder", "QA som kund", "Momsraden borta", "Loggan",
   "Judge.me på tolv språk", "Fraktrutan", "Trust Badges-appen", "Granskningens första fynd",
   "Japan och Taiwan", "Taiwans tull-ID" och "Start fredag 2026-10-02".
3. `matstrumpor/marknader/konfig.json` och `annonser/marknader.json`.
4. Förra granskningen, `granskning/GRANSKNING-2026-09-30.md`, delarna D, E och F. Fynden där är
   antingen rättade eller står kvar. Ett fynd som står kvar rapporteras som "kvar sedan 30/9", inte
   som nytt.
5. `mejl/README.md` → "Matstrumpor på tolv språk", `sparning/butiker.json` → matstrumpor
   (`mejl_sprak`), `matstrumpor/varva/README.md`, `matstrumpor/marknader/TAIWAN-TULL.md`.

**Marknaderna i Shopify** (läst med `query markets { webPresences }` 2026-10-01):

| Marknad | Länder | Domäner och språk |
|---|---|---|
| Sverige | SE | matstrumpor.se (sv) |
| Norge | NO | **matstrumpor.no (bara nb, A/B-testets B-sida)**, matstrumpor.com/nb, matstrumpor.se/nb |
| Europa | 29: EU utom SE, plus IS, LI, CH | matstrumpor.eu (en i roten + da, fi, de, fr, nl, es, it, pl, pt-PT), matstrumpor.com/<språk>, matstrumpor.se/<språk> |
| USA, UK, Australien, Kanada, Nya Zeeland | US, GB, AU, CA, NZ | matstrumpor.com (en i roten) |
| Japan | JP | matstrumpor.com/ja |
| Taiwan | TW | matstrumpor.com/zh-tw. **Inte lanserad** (`TW.lansering_stopp`), men marknaden är aktiv i Shopify |

Matstrumpor.com bär alla utlandsspråk. Mapparna är /nb, /da, /fi, /de, /fr, /nl, /es, /it, /pl,
/pt-pt, /ja och /zh-tw, och engelska ligger i roten. Alla utlandsannonser länkar dit, utom B-sidan
som länkar till .no. Matstrumpor.eu och .se/<språk> fungerar, men inget länkar dit.

**Kampanjerna som startar 00:01:** 14 stycken, varje kampanjs länk står i `annonser/marknader.json`
→ `kampanjer.<KOD>.lank`. Annonsländerna är NO, DK, FI, US, GB, CA, NZ, DE, AT, CH, FR, BE, LU, NL,
ES, IT, PL, PT och JP. Australien säljs i butiken men har inga annonser (`WW.geo_vantar`). Taiwan har
inga annonser.

**Konstanterna:**

- Pixeln är `1785935302094082`. Bäverbutikens `1554276343018184` får aldrig synas här.
- Kortutdragets descriptor är `SP Matstrumpor.se`.
- Brevlådan är kundsupport@matstrumpor.se.
- Bolaget: STONEBITE ECOM AB, Stenkolsgatan 1B, 417 07 Göteborg.

## Det byggaren redan mätt (2026-10-01 17:20–17:45 CEST) — mät om, lita inte på det

Mätt från riktiga länder med Globalping, som Facebook-appens webbläsare:

| | Vad | Mätt |
|---|---|---|
| ✅ | **matstrumpor.no från Norge** (Haugesund, Lyse Tele) | 200, nb, land NO, NOK. Gäller roten, produktsidan och NOB-annonsens länk, utan omdirigering. |
| ✅ | **matstrumpor.se från Sverige** | 200, sv, SE, SEK, 369 kr. matstrumpor.no från Sverige ger 302 → matstrumpor.se. |
| ✅ | **12 av 14 kampanjlänkar från sina länder** | Rätt språk, land och valuta: NO, NOB, DK, FI, US, WW (GB, CA, NZ), NL, ES, IT, PL, PT och JP. |
| ❌→✅ | **DE och FR, rättat samma kväll** | Länken saknade `?country=`, och Shopify skickade kunden i DE, AT, CH, FR och BE vidare (302) till den **engelska** produktsidan, med rätt land och valuta. Det gäller varje produktsida i en språkmapp på .com utan `?country=` (också /es och /nb), även när Facebooks `fbclid` sitter på länken. Startsidan `/de` och `/de/pages/spara` stannar på tyska. Rättat 18:2x CEST (Axels val A): länkarna bär `?country=DE` och `?country=FR` i alla 16 annonser, och mätningen gav 6 av 6 rätt. Priset är att österrikare och schweizare ser "Deutschland" i fraktrutan, och belgare och luxemburgare "France". |
| 🟡 | **En norrman på matstrumpor.se** | Får svensk text med NOK. På matstrumpor.com/ får hen engelska med NOK. |

Läs läget själv ändå. Bär DE- och FR-annonsernas länk i Meta `?country=DE` respektive `?country=FR`?
Mät det som är live med `geokoll.mjs --annonser`. En annonslänk till en språkmapp utan land är 🔴.
Att österrikare, schweizare, belgare och luxemburgare får grannlandet i fraktrutan och kassan är
känt (nedan). Mät det och lägg det som 🔵 med ett förslag, till exempel ett adset per land.

⚠️ **Lärdomen som gör att du ser det:** Shopify geolokaliserar inte en förfrågan som ser ut som en
bot. Med Globalpings egen User-Agent fick prober i DE, GB och FR landet US och dollar på .com, utan
omdirigering, alltså fel bild åt andra hållet. Skicka alltid en webbläsares User-Agent, Accept-Language
och Accept. `geokoll.mjs` gör det, och `--bot` visar botens svar.
⚠️ 429 är Shopifys botskydd mot datacenter-IP, inte ett fel på sajten. Mät med två eller tre prober
och läs den som svarade. Prober hos vanliga nätoperatörer (Lyse, T-Mobile, TeleNet) svarar bäst.
⚠️ Globalping och Shopify kan placera en prob i olika länder. Proben "Luxembourg" hos WEDOS blev CZ
hos Shopify. En sådan mätning säger inget om kunden i landet.

## Verktygen

- **`node matstrumpor/marknader/geokoll.mjs --annonser [--bara DE,FR]`** — varje kampanjlänk från
  varje land i kampanjens geo, med domen ✅/❌/⚪ (exit 1 vid ❌).
  `geokoll.mjs <url> --land NO,SE [--folj] [--limit 3] [--json <fil>]` mäter vilken adress som helst.
  Utskriften är status, Location, `<html lang>`, landet och valutan Shopify valde, og:price,
  certifikatet sett utifrån och svarstiden. Kroppen kapas vid 10 000 byte, så pris och text längre
  ner kräver Chromium.
- **`node matstrumpor/marknader/kundvy.mjs [--land NO]`** — byggarens kundvy i containern, där
  landet väljs med `POST /localization`. Den simulerar landet. Den visar inte vad Shopify gör med en
  riktig besökare.
- **`node matstrumpor/marknader/judgeme-koll.mjs`** — recensionsrutan på 14 språk och
  språkmärkningen. Rutan översätter bara recensioner som rullats fram.
- **`node matstrumpor/marknader/paslag.mjs`** utan argument är torrt: golvet Sverige + 20 % per
  marknad i dagens kurs.
- **Chromium** finns i `/opt/pw-browsers`. Kör med `--ignore-certificate-errors` och proxyn ur
  miljön. Containern går ut på nätet från USA, så sätt alltid landet. Utan land visar Shopify USA.
- För node-skript mot Meta: `NODE_USE_ENV_PROXY=1 NODE_EXTRA_CA_CERTS=/root/.ccr/ca-bundle.crt`.
  För curl: `--cacert /root/.ccr/ca-bundle.crt -g`. Containerns proxy byter ut alla certifikat, så
  certifikaten går bara att bedöma utifrån, med geokoll.

## Granskningen i sex delar

### A. Domänerna sedda från riktiga länder (geokoll, en enda agent)

1. **Kampanjlänkarna:** `geokoll.mjs --annonser`. Läs också länken i Meta för en annons per kampanj
   (`GET /{ad_id}?fields=creative{object_story_spec,url_tags}`). Den ska vara lika med
   `marknader.json` → `lank`.
2. **matstrumpor.no från Norge:**
   - Mät `/`, `/products/sushi-strumpor`, de andra strumporna, `/cart`, `/pages/contact`,
     `/policies/refund-policy` och `/pages/spara`, om sidan finns på .no.
   - Varje svar ska vara 200, nb, NO och NOK, utan Location till .se eller .com.
   - Följ länkarna på .no-sidan (meny, sidfot, produktkort) i Chromium med `?country=NO`. Leder
     någon till .se eller .com? Variant B ska hålla kunden på .no.
3. **Domänrötterna i alla länder:**
   - Mät https://matstrumpor.se/, .com/, .no/ och .eu/ från SE, NO, DK, FI, DE, AT, CH, FR, BE, NL,
     ES, IT, PL, PT, GB, IE, US, CA, AU, NZ, JP och TW, där prober finns.
   - Skriv status, vart en omdirigering går, språk, land och valuta.
   - Ingen slinga, inget 4xx eller 5xx, och kunden ska få sitt eget land. Det enda undantaget är .no,
     som bara säljer i Norge.
   - Säg vad som är trasigt och vad som är ett val (🔵). Ett exempel på ett val: en norrman på .se
     får svensk text.
4. **Regeln om språkmapparna:**
   - Mät varje produkt i varje språkmapp utan `?country=` från språkets land: sushi, pizza,
     hamburgare, donut, presentkort och ätpinnarna `sushipinnar-i-akta-tra`, som är olistade.
   - Mät också startsidan, `/collections/all` och `/pages/spara` i mappen.
   - Vilka sidtyper skickas vidare till engelska och vilka stannar? Det avgör var en länk utan land
     går fel: i delade länkar, i mejl och i Spoks.
5. **Länkarna i mejlen:**
   - Spårningsknappen i fraktmejlen är `https://matstrumpor.com/<mapp>/pages/spara?nummer=MS-…`
     (`mejl_sprak[].sida`). Mät den från varje språks land med ett påhittat nummer. Byggaren mätte
     de, nb, ja och da: alla 200 på rätt språk.
   - Har Spoks-mejlen produktlänkar in i språkmappar utan `?country=` (del D)? Mät några.
6. **Certifikaten och omdirigeringarna utifrån:**
   - Mät `www.` och utan `www.` för alla fyra domäner, plus http→https.
   - geokoll skriver `tls ok` och slutdatum per prob. Ett certifikat som går ut inom 30 dagar är 🟡.
7. **Svarstiden** (millisekunder per prob) är bara information. Över 2 sekunder från ett
   kampanjland nämns i rapporten.

Kvoten: planera för högst 200 mätningar. Mät aldrig i en slinga. Får du 429 från Globalping själv
är timkvoten slut. Vänta då till nästa timme, och skriv i rapporten vad som inte hann mätas.

### B. Hela sajten som kund, språk för språk (Chromium, landet satt)

Språken och var de bor: sv på .se; nb på .com/nb och .no; da, fi, de, fr, nl, es, it, pl, pt-PT,
ja och zh-TW på .com/<mapp>; en i .com-roten. Pröva varje språk med ett av dess kampanjländer
(zh-TW med TW).

1. **Gå igenom sajten.**
   - Börja på startsidan och följ varje intern länk i sidhuvudet, menyn och sidfoten, och på
     produktsidorna. Gå två steg djupt och ta varje adress en gång.
   - Per sida: status, slutadress (stannar den på samma domän och i samma språkmapp?) och
     `<html lang>`.
   - Svenska rester: använd `MARKORER_SV` i `kundvy.mjs`, eller svenskdetektorn i
     `factory/marknadskoll.mjs` om den går att importera.
   - Förbjudet:
     - Sjöhed, Harestad, Bäverbutiken, baverbutiken, sushisock och CaraShell.
     - "MATSTRUMPOR.SE" eller filen med .SE-loggan utanför Sverige.
     - Moms- och skatterader ("Skatter ingår", "Taxes included", "inkl. moms").
     - Klarna och Swish på ja och zh-TW.
   - Trasiga bilder (`naturalWidth` 0) och fel i konsolen.
2. **Produktsidorna** (de sex ovan):
   - Priset jämfört med `konfig.json` och golvet i `paslag.mjs`.
   - Paketväljarens texter och matematik.
   - Storlekarna.
   - Fraktrutan: kundens land och flagga, enligt "Fraktrutan" i README.
   - Leveranslöftet ska vara 5–10 arbetsdagar. zh-TW är ett känt stopp.
   - Trustpilot-raden och Judge.me-rutan (`judgeme-koll.mjs`).
   - FAQ:n på språket.
   - Bilder med text ska vara på sidans språk.
3. **Korgen** som sida och som sidolåda:
   - Lägg "Köp 2 – få 2" (4 lådor) och "Köp 1 – få 1" i paketväljaren.
   - Språk, valuta, rabattraden (paketkoderna `…-K1F1` och `…-K2F2`), summan och Trustpilot-raden.
   - Ingen momsrad.
   - Korgen ska ge det paketväljaren lovade, i marknadens valuta.
4. **Policyerna** på varje språk:
   - Adresserna: `/policies/refund-policy`, `shipping-policy`, `privacy-policy`, `terms-of-service`,
     `contact-information` och `legal-notice`.
   - Finns de, och är de på språket? Policyer är egna översättningar (`SHOP_POLICY`). Pröva särskilt
     ja och zh-TW, som kom till 2026-09-30.
   - Bolagsuppgifterna, och aldrig Sjöhed.
   - Stämmer returfönstret och ångerrätten med det produktsidan lovar?
   - **Japan:** finns en sida 特定商取引法に基づく表記 med säljare, adress, kontakt, pris, frakt och
     retur? Den lagen gäller postorder till japanska konsumenter. Saknas sidan blir det 🔵 till Axel.
   - **Tyskland och Österrike:** finns ett Impressum, alltså `legal-notice` med bolagets uppgifter?
     Saknas det blir det 🔵.
5. **Samtyckesrutan för kakor:**
   - Ser kunder i EU, EES, UK och CH Shopifys rutan på sitt språk?
   - Rutan styrs av besökarens IP, så den går kanske inte att se från USA. Pröva i Chromium med
     `?country=DE`.
   - Läs inställningen med en `query` om API:t visar den. Annars hamnar den under "kan inte mätas".
   - Sidan "Dina integritetsval" ska finnas på varje språk.
6. **Mobilen:**
   - Ta skärmdumpar i 390 × 844 per språk: startsidan, produktsidans första skärm, paketväljaren,
     korgens sidolåda och kassans första skärm.
   - **Titta på dem**, själv eller med en subagent.
   - Leta efter text som går utanför eller överlappar, långa tyska och finska ord, fyrkanter i
     stället för japanska och kinesiska tecken, sidhuvudets logga och knappar som inte syns.
7. **Övrigt:**
   - Sökningen `/search?q=sushi`.
   - 404-sidan.
   - Presentkortssidan, med egen mall utan strumpblock.
   - Spårningssidan `/pages/spara` med ett påhittat nummer. Den ska säga "hittar inte" på språket.
8. **Värva en vän:** pröva landningen `?van=` på två språk, men bara om `varva/README.md` beskriver
   ett säkert sätt utan riktig order. Annars hamnar den under "kan inte mätas".

### C. Kassan i varje land

1. **Länderna:**
   - De 19 annonsländerna, plus SE och AU.
   - IE och CZ, som exempel på Europa-länder utan kampanj.
   - TW bara för att se, eftersom marknaden är aktiv men inte lanserad.
   - Norge prövas på både .com/nb och .no.
2. **Per land:** sätt landet, lägg "Köp 2 – få 2" (4 lådor) i korgen och öppna kassan. **Skriv
   ingenting.**
3. **Skriv ner:**
   - Språk och valuta.
   - Summan, jämförd med korgen, och rabattraden.
   - Landet som är förvalt i leveransadressen. Det ska vara kundens land.
   - Fraktraden, om den syns utan adress.
   - Loggan ska vara "Matstrumpor". Skriv också flikens titel.
   - Expressknapparna: Shop Pay, PayPal och Google Pay. Apple Pay syns inte i Chromium.
   - Betalsätten i listan, med kortmärkena.
   - Shopifys egna skatte- och tullrader. De rapporteras, men ändrade skatteinställningar föreslås
     aldrig.
   - Fel som "vi skickar inte till …".
4. **Betalsätten jämfört med landets vanligaste.** Skriv tabellen ur egen kunskap och märk den som
   kunskap, inte mätning. Exempel på vad du jämför med:

   | Land | Vanliga betalsätt |
   |---|---|
   | NL | iDEAL |
   | BE | Bancontact |
   | PL | BLIK och Przelewy24 |
   | PT | MB WAY och Multibanco |
   | CH | TWINT |
   | DK | MobilePay |
   | FI | MobilePay och nätbank |
   | NO | Vipps |
   | DE | PayPal, Klarna och kauf auf Rechnung |
   | AT | EPS och Klarna |
   | JP | JCB-kort, konbini och PayPay |
   | SE | Swish och Klarna |

   - Ett betalsätt som saknas är 🔵 till Axel. Det slås på i Shopify Payments, och det är hans
     klick, aldrig ditt.
   - Läs med `query` vilka betalsätt som är påslagna, om API:t visar det. Annars hamnar det under
     "kan inte mätas".
5. **Fraktzonerna:**
   - Läs `query deliveryProfiles`. Varje land i varje marknad ska ha en gratis fraktsats, också
     Europa-länderna utan kampanj och AU.
   - Ett marknadsland utan fraktsats är 🔴, eftersom kassan då säger att den inte skickar dit.
6. **Taiwan:** finns ett fält för tull-ID (`TAIWAN-TULL.md`)? Det är ett känt stopp, bara information.

### D. Mejlen och länkarna kunden får

1. **Shopifys notiser:**
   - Gäller varje notis en vanlig order utlöser: orderbekräftelsen, de tre fraktnotiserna (skickad,
     ute för leverans, levererad), återbetalning, avbokning och presentkort.
   - Läs `query translatableResources(resourceType: EMAIL_TEMPLATE)` med `translations(locale: …)`.
   - Är mallen anpassad? Har varje språk en översättning, och på rätt språk?
   - **Orderbekräftelsen går ut först.** Den är inte lika granskad som de tre fraktnotiserna från
     2026-09-29.
2. **Länkarna i mejlen:** domän, språkmapp och `?country=`. Ett mejl som bär en produktlänk in i en
   språkmapp utan land skickar en kund i Europa till engelska (del A4).
3. **Spoks:** finns Spoks-verktygen eller `spoks-api` i sessionen, läs Matstrumpors flöden per språk
   (workspace `71c2d4c8-b9ec-488a-b15c-5dfe8dbd2226`) och deras länkar. Bara läsa. Finns de inte
   hamnar det under "kan inte mätas".

### E. Pixeln och annonsernas länk

1. **Pixeln** ska vara `1785935302094082` på varje domän och språk. Läs den i sidans
   web-pixel-konfiguration eller i den avbrutna begäran till `facebook.com/tr`, och skriv vilken
   väg du läste. Bäverbutikens pixel får aldrig synas.
2. **Annonsernas länk och url_tags** i Meta jämförs med `marknader.json`. Det görs i del A1.
3. **hreflang** pekar på .se, och det vet byggaren redan. Notera det bara.

### F. Sverige får inte ha tagit skada

1. Mät matstrumpor.se från Sverige med geokoll, och i Chromium med `?country=SE`. Allt ska vara som
   förut: svenska, SEK, loggan MATSTRUMPOR.SE, priserna, paketväljaren, Trust Badges-raden och
   kassan med Swish och Klarna.
2. Läs länken i en ACTIVE svensk annons med `GET` (kontot "nya kungen", kampanjen
   `MATSTRUMP_SALES_20260826`). Mät den från Sverige. Rör den aldrig.

## Kända beslut — inte fel

Allt nedan är beslutat av Axel eller av byggaren, med skäl, och står i filerna. Kostar ett beslut
kunder enligt din mätning: lägg det under "Frågor till Axel", med bevis.

1. **Moms och tull:** ingen moms- eller tulltext någonstans ("Alltid noll moms och tull, det hanterar
   jag själv"). Kassans egna rader är Shopifys och rapporteras bara.
2. **Variant B på matstrumpor.no:**
   - ingen språk- eller landsväljare;
   - inget världskollage;
   - elva norska omdömen i stället för Judge.me-rutan;
   - aldrig ett påstående om att butiken är norsk.
3. **Belgien och Luxemburg** ligger i FR-kampanjen, alltså på franska. DE-länken bär `?country=DE`
   och FR-länken `?country=FR` (Axels val A 2026-10-01). Därför ser AT och CH "Deutschland" och
   BE och LU "France" i fraktrutan, och kassan förväljer det landet.
4. **Australien** säljs men har inga annonser (`geo_vantar`).
5. **Taiwan** har inga annonser och lanseras inte (`lansering_stopp`). zh-TW lovar 5–10 dagar, medan
   leverantören säger 11–23. Det ändras före start.
6. **Trust Badges-appen** (Klarna- och Swish-raden) syns bara på svenska. Klarna är borta ur texterna
   på ja och zh-TW.
7. **Kassans logga** är MATSTRUMPOR, utan .SE, i alla länder, även Sverige. Butikens namn i kassans
   flik och i Shopifys mejl är Settings → General, och det är en öppen fråga till Axel.
8. **Små kända saker:**
   - Landväljarens namn på /nb är svenska, eftersom Shopify saknar bokmålsnamn.
   - Presentkortets pris utomlands är Shopifys omräkning av 150 kr.
   - Rabattkoderna har svenska namn (`HAMBURGARE-K1F1`).
   - hreflang pekar på .se.
9. **Judge.me:**
   - En recension översätts när den rullas fram, och det tar några sekunder.
   - Irénes recension på ätpinnarna är märkt engelska och får stå (Axel 2026-10-01).
10. **Inte en läcka:** kortutdragets descriptor `SP Matstrumpor.se` och brevlådan
    kundsupport@matstrumpor.se.

## Så kör du det

Kör parallellt: Agent-verktyget med flera subagenter i samma meddelande, eller Workflow om Axel har
bett om det.

1. **Samla in.** Sex agenter körs samtidigt:
   - A: domänerna från riktiga länder. Den enda agenten som använder Globalping.
   - B1: sv, nb, da, fi och en, på .se, .no och .com.
   - B2: de, fr och nl.
   - B3: es, it, pl och pt-PT.
   - B4: ja och zh-TW.
   - C: kassan i alla länder.
   - D, E och F tas av en sjätte agent eller av dig.

   Varje agent skriver sina mätningar till scratchpad som JSON, med bevis: adress, klockslag,
   utdrag och sökväg till skärmdumpen.
2. **Pröva varje 🔴 en gång till.** En ny agent försöker motbevisa fyndet med en egen mätning. Fynd
   som inte håller stryks eller sänks, med en rad om varför.
3. **Leta efter luckor.** En sista agent läser rapportutkastet mot checklistan nedan och säger vad
   som inte prövats. Det görs, eller hamnar under "kan inte mätas" med orsak.
4. **Skriv rapporten.**

Varje agent får ⛔-reglerna ovan ordagrant, och besked om att den inte får skriva något utanför
scratchpad.

## Formatet på ett fynd

Påhittat exempel, bara för formatet:

```
S-007 🔴  Kassan, NL (matstrumpor.com/nl, ?country=NL)
Vad:     Leveransadressen är förvald till Tyskland, och fraktraden säger "Ej tillgängligt".
Bevis:   Chromium 2026-10-02 08:14 UTC, skärmdump scratchpad/c/nl-kassa.png; deliveryProfiles saknar NL i zonen "Europa".
Förslag: Lägg NL i fraktzonen (byggarsessionen, efter Axels ok). Utförs aldrig av granskaren.
Vem:     byggarsessionen
```

- **🔴 stoppar en kampanj eller en försäljning:**
  - En kund i ett kampanjland landar på fel språk, land eller valuta.
  - Kassan går inte att nå eller skickar inte till landet.
  - Priset i korgen stämmer inte med sidan.
  - Något förbjudet syns: en annan butik, Sjöhed, eller en moms- eller tulltext.
  - .no skickas vidare.
  - Sverige har tagit skada.
  - Pixeln saknas eller är fel.
- **🟡 bör rättas:** svensk rest i liten text, en sida som saknar översättning, mobilvy som spricker,
  kosmetiska fel.
- **🔵 är en fråga till Axel**, till exempel betalsätt, Impressum eller 特商法.
- **"Kan inte mätas härifrån"** är en egen lista med orsak, aldrig grön och aldrig röd.

## Leveransen

1. **`matstrumpor/marknader/granskning/SAJT-<ÅÅÅÅ-MM-DD>.md`, på svenska.**
   - Överst "Kort", 3–5 punkter.
   - Sedan en tabell land × kontroll, med ✅/❌/– per ruta. Kolumnerna är domän och omdirigering,
     språk, valuta, pris, fraktruta, korg, kassa, betalsätt, mejl och mobil.
   - Sedan alla fynd, röda först, följda av "kan inte mätas", frågorna till Axel och "så granskade
     jag" (metod, klockslag, antal mätningar och sidor).
2. **Git:** commit med svenskt meddelande, push, PR och merge till `main`, med bara filerna i
   `granskning/`.
3. **Om Artifact-verktyget finns:** publicera gärna tabellen som en privat sida med en skärmdump per
   land, utan runtime-capabilities. Axel har dyslexi och läser en sida lättare än en lång fil.
4. **Svaret till Axel i chatten**, kort och på svenska:
   - Hur många röda och gula fynd, och om .no, .com och kassorna är rätt.
   - De värsta fynden, en mening var.
   - Sist, under rubriken **Din uppgift**, numrerat och en mening per rad:
     1. Klistra in i sessionen "Matstrumpor markets launch": *"Läs
        matstrumpor/marknader/granskning/SAJT-<datum>.md på main och rätta allt rött och gult."*
     2. Den enda viktigaste frågan till Axel, med svarsalternativ. Övriga frågor står i filen
        (CLAUDE.md: en fråga i taget).

## Definition of done — bocka av i svaret, ✅/❌ per rad

- [ ] Alla kampanjlänkar mätta från sina länder (`geokoll.mjs --annonser`), och länken i Meta
      jämförd med `marknader.json`.
- [ ] matstrumpor.no mätt från Norge: roten, produkterna, korgen, policyerna och länkarna på sidan.
      Ingen omdirigering till .se eller .com, eller ett 🔴.
- [ ] Rötterna .se, .com, .no och .eu mätta från alla länder med prober.
- [ ] Regeln om språkmapparna kartlagd per sidtyp, och mejlens spårningsknapp mätt per språk.
- [ ] Certifikat och www/http mätta utifrån.
- [ ] Alla 14 språk genomgångna i Chromium: länkar, svenska rester, förbjudet, priser, fraktrutan,
      paketväljaren, korgen, policyerna, sökningen, 404, presentkortet och spårningssidan.
- [ ] Mobilskärmdumpar tagna och tittade på för varje språk.
- [ ] Kassan öppnad i alla länder i del C, med språk, valuta, summa, förvalt land, logga och
      betalsätt. Ingenting inskrivet och ingenting betalt.
- [ ] Betalsätten jämförda med landets vanligaste. Saknade lagda som 🔵.
- [ ] Fraktzonerna lästa: gratis frakt till varje marknadsland.
- [ ] Notiserna lästa på alla språk, orderbekräftelsen först, och länkarna i mejlen prövade.
- [ ] Pixeln läst på varje domän.
- [ ] Sverige prövat: sidan, kassan och den svenska annonsens länk.
- [ ] Förra granskningens sajtfynd (D–F) märkta "rättat" eller "kvar sedan 30/9".
- [ ] Varje 🔴 prövad en gång till av en annan agent.
- [ ] Luckorna sökta, och allt omätbart listat med orsak.
- [ ] Rapporten på `main`. Inget annat ändrat i repot, i Meta, i Shopify eller någon annanstans.
- [ ] Svaret till Axel kort, med hans uppgifter sist.
