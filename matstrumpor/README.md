# `matstrumpor/` — uppladdaren och den lilla kungen

Två kommandon, ett konto, en produkt.

| Kommando | Vad |
|---|---|
| `/matstrumpor` | Hubbens `To be Reviewed` → **ett testadset per koncept** (3:2:2) i **samma CBO** → `Approved` |
| `/matstrumporkungen` | Etikett → lärdom → 2 koncept à 3 hookar per rond, var tredje dag + **domen per adset** och förslagen till Axel |

**Kontot heter "nya kungen"** (`730973156224390`, portfölj Matstrumpor.se).
Inte Matstrumpor. Kolla alltid id:t.

## Strukturen: 3:2:2 (Axels beslut ROUTING C 2026-10-02)

Allt i kampanjen `MATSTRUMP_SALES_20260826` (CBO). Kursen ("How To Set Up a 3:2:2
Campaign", läst 2026-10-02 — `docs/os/evolve/ITERATIONS-PLAYBOOK.md` avsnitt 11):

```
Champions   09-17 UGC (120251591832340023) — bevisade vinnare, tar aldrig emot en ny annons
Testadset   MATSTRUMP_T<nnn>_<vinkel>_<video|bild> — ETT koncept = tre annonser
            (samma kropp, tre hookar _h1 _h2 _h3), var och en med 2 rubriker + 2 primärtexter
Taket       högst 5 levererande adsets inkl. Champions, och aldrig fler än budgeten
            bär med 3 × break-even-CPA (≈ 925 kr) per adset och dag — det sjätte vägras
Domen       per ADSET (dom.mjs), aldrig per annons: test 7 dagar (max 14), stäng om det
            svultit eller missar KPI, flytta bästa annonsen till Champions vid ≥ 20 %
            av spenden vid KPI. Allt blir FÖRSLAG — Axel klickar
```

Bild och video blandas aldrig i ett adset. Inga dynamic creative-adsets (ordet DCT
finns inte i kursen) — de två rubrikerna och texterna är Ads Managers "flera
textalternativ" på en vanlig annons (`asset_feed_spec`, `DEGREES_OF_FREEDOM`).

**De gamla hinkarna** (`nya16`, `bilder`, `jul_video`, `jul_bild` — före 2026-10-02
valde annonsnamnet en av dem) tar inte längre emot något. De och de andra gamla
adseten (`nya8`, `nya20`, `alla17`, `batch03_bilder`) döms av kungen som vilket adset
som helst, på de senaste sju dagarna, och räknas mot taket så länge de levererar.
Ett gammalt adset som FUNGERAR (över break-even) föreslås aldrig stängt — kursen:
"DO NOT TURN OFF YOUR EXISTING ADS IF THEY ARE WORKING" — och ett som tappat en vecka
döms också på sitt 28-dagarssnitt. Läget 2026-10-02 (torrkörning): åtta adsets
levererar mot taket fem; kungen föreslår att fyra gamla stängs (`nya16` och `nya8`
under break-even även utzoomat, `jul_video` och `nya20` svultna). `bilder` och
`batch03_bilder` fungerar och står kvar; `alla17` svälter men hade bra snitt och står
så länge inget koncept väntar. Efter de fyra stängningarna finns en plats för ett
testadset, och fler när `alla17` får ge plats åt ett väntande koncept.

## Förbeställning medan lagret är slut (2026-10-03)

Axels beslut 2026-10-03: allt är slutsålt, nästa leverans är i lagret 11/10, och den säljer också
slut snabbt. Butiken säljer vidare (lagret står på "fortsätt sälja") men säger det ärligt, enligt
Evolve Q4 (`docs/os/evolve/Q4-2026.md` → Backend): annars tror kunden att paketet kommer om några
dagar, och det blir arga mejl och chargebacks.

- **Sajten:** `node matstrumpor/forbestallning.mjs --skarpt` (torrt utan flaggan). Rutan
  "Förbeställning … skickas från 13 oktober" på produktsidan, ovanför "Beräknad leverans", och en
  rad i varukorgslådan och på korgsidan, på alla fjorton språk. "Beräknad leverans" räknas från
  packningsdagen 12/10 (19–26 oktober) i stället för från i dag. Datumen står i
  `forbestallning/konfig.json`, texterna i `forbestallning/texter.json` (svenskan av sessionen,
  resten av en sonnet-subagent mot `marknader/oversattning/REGLER.md`).
- **Av och på:** shop-metafältet `matstrumpor.forbestallning` (`aktiv`, `packning_fran`,
  `skickas_fran`). Rutan släcker sig själv den dag `skickas_fran` inträffar; `--av --skarpt` släcker
  den direkt. Temafilerna står kvar och ritar ingenting.
- **Kundtjänstboten:** `svar.forbestallning.skickas_fran` i `kundtjanst/brands/matstrumpor.yaml`. En
  oskickad order får "förbeställning, nästa leverans skickas från 13 oktober" i stället för "packas
  inom 2 arbetsdagar", och går inte till VA:n förrän datumet passerat med packtid + 3 dagar.
  Railway kör `main`, så ändringen gäller först efter merge. Ta bort blocket när det är över.
- **Mätt 2026-10-03 som kund** (`--kundvy`): rutan på sv, en, de och ja, raden på korgsidan,
  leveransfönstret 19–26 oktober. Originalfilerna i `forbestallning/original/`.
- ⚠️ Shopifys lagersiffror säger inget om vad som är slut: alla varianter står på "fortsätt sälja"
  och sushilådan på −2 627 (mätt samma dag). Vad som är slut kommer från Axel, inte från Shopify.
- ⚠️ Kassan och orderbekräftelsen säger inget om förbeställningen (kassan kräver Plus, mejlmallen
  har inget API). Det kunden ser är produktsidan och korgen.

## Trustpilot på sajten (2026-09-29)

Axels beställning: "flexa Matstrumpors Trustpilot på hemsidan … lite widgets
utöver hemsidan". Profilen https://se.trustpilot.com/review/www.matstrumpor.se
är claimad (business unit `69458c03ae5298305b500fde`); vid bygget 4,2 av 5
("Bra"), 16 omdömen, 12 femstjärniga.

⚠️ **Trustpilots egna widgetar går inte att använda på gratisplanen.** Mätt
2026-09-29 mot `widget.trustpilot.com/trustbox-data`: bara mallen "Starter"
svarar med data, alla andra (Micro Combo, Mini, Carousel, Slider, Grid …)
svarar "BusinessUnit does not have access to that trustbox". Starter är rutan
"Lämna ett omdöme om oss på Trustpilot" — inget betyg, inga omdömen. Därför
ritar temat blocken självt, i Trustpilots gröna stjärnor, med namn, datum och
länk till varje omdöme (Trustpilots villkor för att visa omdömen utanför
deras widgetar). Betyget är alltid det aktuella; det uppdateras varje morgon.

| Var | Vad |
|---|---|
| Startsidan, under rullande bandet | kompakt rad: stjärnor · Bra · 4,2 av 5 · 16 omdömen på Trustpilot |
| Startsidan, där den handskrivna slidern stod | rubrik, betyg och de 6 senaste omdömena ≥ 4 stjärnor som kort + knapp. Slidern `omdomen` är gömd (`visible: false`), kvar i temaredigeraren |
| Produktsidan, under trygghetsraden | kompakt rad (block `ms_trustpilot` i `main-product`) |
| Varukorgslådan, ovanför "Gå till kassan" | kompakt rad (`snippets/cart-drawer.liquid`) |
| Varukorgssidan och kollektionssidan | rad-sektionen |

Korten (svensk text) ritas bara på sv, nb och da; övriga nio språk får
betyg, etikett (Trustpilots egen per språk: Great, Gut, Bien …) och knappen.
Texterna: `matstrumpor/trustpilot/sprak.json` (tolv språk).

```bash
node matstrumpor/trustpilot.mjs --hamta            # Trustpilot → trustpilot/data.json, inget skrivs i butiken
node matstrumpor/trustpilot.mjs --skarpt           # + shop-metafältet matstrumpor.trustpilot (bara vid ändring), tillbakaläst
node matstrumpor/trustpilot.mjs --tema [--skarpt]  # sektionen, snippeten och de fem mallarna (idempotent, torrt utan --skarpt)
node matstrumpor/trustpilot.mjs --kundvy           # startsidan publikt: raden, korten, betyget, namnen
node --test matstrumpor/test/trustpilot.test.mjs   # 17 tester utan nät
```

Så hänger det ihop: betyget kommer ur Starter-mallens JSON (stabil, utan
botspärr, en läsning per språk för etiketten); omdömena ur profilsidans
`__NEXT_DATA__` i Chromium (sidan svarar 403 på curl men bär innehållet, samma
som annonsbiblioteket). Går sidan inte att läsa står förra körningens omdömen
kvar och bara betyget byts. Temafilerna i repot är källan
(`trustpilot/ms-trustpilot.liquid`, `ms-trustpilot-rad.liquid`); `--tema`
byter platshållarna `{{{ sprak:… }}}` mot en `case` per språk och skriver bara
det som skiljer sig. **Uppdateringen är metafältet, aldrig temat** — därför
läser sektionen `shop.metafields.matstrumpor.trustpilot.value`. Körs varje
morgon av `/matstrumporkungen` steg 0 (före kördagsfrågan).

Trustpilot-rubriker som Trustpilot satt själva (textens början + "…") ritas
inte (`egenRubrik`); texter klipps vid 280 tecken på ordgräns. Bara omdömen
med ≥ 4 stjärnor visas som kort — betyget och fördelningen visas oavkortade.

## Varukorgslådan vid första köpet (2026-10-01)

Axels fel: "första gången man är inne på hemsidan i en ny session, när man lägger
till något i varukorgen, skickas man till varukorgssidan. Varukorgen öppnas inte i
en slide … andra gången i samma session fungerar det normalt."

**Återskapat i Chromium (ny session, sushi-strumpor, paketet 2-pack):** klick 1
landade på `/cart`, klick 2 öppnade lådan. Och det slår inte varje gång — det
är en kapplöpning mellan två skrivningar i vagnen.

**Orsaken, mätt:**

1. Paketväljaren `assets/ms-paket.js` la rabattkoden **först**
   (`/discount/<kod>?redirect=/cart.js`), sedan varorna (`/cart/add.js`), ritade
   lådan och kontrollerade sist att koden låg i vagnen (`kontrollera`). Saknades
   den tog den reservvägen `laddaOm()`: en riktig sidladdning till
   `/discount/<kod>?redirect=/cart`. Det är "teleporteringen".
2. I samma klick skriver A/B-motorn `assets/ms-ab.js` sin stämpel (`AB paket: b`)
   i vagnen **två gånger**: ett `fetch` på klicket och en `sendBeacon` på submit,
   båda `POST /cart/update.js`. Shopify skriver hela vagnen vid varje anrop. En
   skrivning som läste vagnen före koden och avslutade efter den skrev tillbaka
   vagnen **utan** koden.
3. I en ny session är koden ny för vagnen, så det är rabattskrivningen som
   försvinner. Andra gången ligger koden redan där innan någon läser, och inget
   går förlorat.

Mätvärdena: `/discount`-svaret visade koden på vagnen (`applicable: false`, tom
vagn); ms-ab:s `update.js` svarade 400 ms senare med `discount_codes: []`;
`/cart.js` efter `add.js`: 4 varor, 898 kr, inga koder → navigation till `/cart`,
där koden lades på igen (499 kr). Med rena HTTP-anrop, utan webbläsare: koden
överlever `add.js` i en tom vagn när inget annat skriver (4 av 4), men en
`update.js` som startar 0–400 ms efter `/discount` raderar den (3 av 3); startar
den 800 ms efter är koden kvar. Fabriken hade samma fel på heimguard.se
2026-09-09 och rättade `factory/tema/assets/ms-paket.js` — Matstrumpors kopia
(mixläget, ätpinnarna) fick aldrig rättningen.

**Rättningen, `matstrumpor/korglada.mjs` (två filer, idempotent, exakta träffar):**

- `ms-paket.js` `kop()`: A/B-stämpeln inväntas (`MS.ab.stamp()`) → varorna →
  koden (`fastKod`, läser tillbaka vagnen, ett omförsök efter 600 ms) → lådan
  hämtas färsk ur Shopifys sektions-API (`/?sections=cart-drawer,cart-icon-bubble`,
  rätt språk under `/de/`, `/nb/` — mätt) och ritas med det rabatterade priset.
  `kontrollera()` står kvar som sista nät; bara den kan nå `/cart`. Samma submit
  hanteras en gång (`stopImmediatePropagation`), som i fabrikens fil.
- `ms-ab.js`: `stampCart()` lämnar tillbaka den **pågående** skrivningen, så
  fetch-kroken före `/cart/add` väntar på den riktiga stämpeln; ingen beacon när
  klicket redan stämplat; `MS.ab.stamp` exponerad.

```bash
node --test matstrumpor/test/korglada.test.mjs     # 10 tester utan nät (originalen i korglada/original/)
node matstrumpor/korglada.mjs                      # torrt mot MAIN: visar byten, skriver output/korglada/<tid>/
node matstrumpor/korglada.mjs --tema <id> --skarpt # skriver i ett tema (originalen säkerhetskopierade), läser tillbaka
node matstrumpor/korglada.mjs --kundvy [--tema <id>]   # Chromium, ny session: klick ×2 → låda? navigation? koden? priset?
```

Provat i provkopian `208019554643` (PROV, gjord lika med MAIN för köpflödets
filer först), tre varv per A/B-variant, ny session varje gång, 2026-10-01 kväll:
**MAIN (utan rättning): 2 av 4 giltiga varv gick till `/cart`** (lådan hann
öppnas, sedan navigerade `kontrollera`); **PROV (med rättning): 0 av 5** —
lådan öppen, ingen navigation, koden tillämplig, 399 resp. 499 kr i lådan. Tre
varv gick inte att mäta (Playwright-timeout när två webbläsare körde samtidigt)
och räknas inte åt något håll. Kapplöpningen slår alltså inte varje gång, och
den beror på nätet — en telefon med långsammare skrivningar träffas oftare.
⚠️ `bygg.mjs --steg tema` patchar `ms-paket.js` på plats (`patchaPaketJs`) —
ankarna står kvar efter rättningen, testat.

✅ **Inlagt i det publicerade temat 2026-10-02 06:55 CEST (Axels "A")**: `korglada.mjs --skarpt`
skrev båda filerna och läste tillbaka dem identiskt (originalen i `output/korglada/2026-10-02T04-55-36-643Z/`).
Kundprov direkt efteråt mot det publicerade temat, ny session: standardvarianten (K1F1) och
tvingad variant b (SUSHI-2FOR499), båda klicken öppnade lådan utan navigation, koden tillämplig,
399 resp. 499 kr i lådan.

## Kommandon i terminalen

```bash
node matstrumpor/kor.mjs --kolla                 # konto, kampanj, adsets, nycklar, break-even
node matstrumpor/kor.mjs --ekonomi               # break-even, båda momslinjerna
node matstrumpor/kor.mjs --aov [--dagar 30]      # mät AOV ur Shopify på riktigt
node matstrumpor/kor.mjs --struktur             # 3:2:2-läget ur Meta: Champions, levererande adsets, taket, lediga platser
node matstrumpor/kor.mjs --ko [--json] [--grupp 063,066,067] [--hookrad <sid-id>]   # Notion-kön → koncept → testadsets (output/ko-<datum>.json)
node matstrumpor/kor.mjs --creative <namn> --video <id> --thumb <url>   # creative-JSON till ads_create_ad (2 + 2 texter)
node matstrumpor/kor.mjs --adset-skapad <id> <namn> --koncept <nnn>     # logga ett nytt testadset
node matstrumpor/kor.mjs --kontroll <adset-id>   # läs tillbaka testadsetet ur Meta (exit 1 vid fel)
node matstrumpor/kor.mjs --namn gift ugc 1 --hookar 3   # nästa koncept: _h1 _h2 _h3 på samma löpnummer
node matstrumpor/kor.mjs --dop <sid-id> <namn>   # döp en odöpt rad i Notion
node matstrumpor/kor.mjs --dom <jobb.json>       # vinstbidrag + etiketter + domen per adset ur en avläsning
node matstrumpor/kor.mjs --status                # lärdomar, briefer, koncepttak, mix
node --test matstrumpor/test/*.test.mjs          # 233 tester (2026-10-02)
```

Inga npm-beroenden. Node ≥ 20.

## Två saker att veta innan du ändrar något

**1. Meta läses via token, skrivs via MCP.** `META_ACCESS_TOKEN` har åtkomst
till kontot sedan 2026-09-22 (Axel gav användaren "API LONG TERM" rättigheten;
mätt med `GET act_730973156224390?fields=name` → `nya kungen`). Till och med
2026-09-21 nekades den (`(#200) Ad account owner has NOT granted
ads_management`). Sedan dess LÄSER ronden kontot via REST (`meta.mjs`,
`kor.mjs --hamta`) och **`/matstrumporkungen` går som rutin 07:00 varje dag**
(`kor.mjs --kordag` avgör om det är rond — var tredje dag från förra ronden).
Uppladdningen i `/matstrumpor` är inte ombyggd: den skriver fortfarande genom
`mcp__Adsmanager__*` i en session Axel startar. `meta.mjs` har inga
skrivfunktioner alls — ronden skalar aldrig, så det som inte finns kan inte
köras av misstag.

**2. Momsen är en öppen fråga.** Break-even är **1,50 utan moms** och **2,14
med moms**. Kampanjen låg på ROAS 1,392 senaste 14 dagarna (17 031 kr) —
alltså *under* break-even på båda linjerna. En annons som hamnar mellan
linjerna får domen `BEROR_PA_MOMS` och rörs inte förrän
`ekonomi.moms_antagen` är satt i `konfig.json`.

## Filerna

| Fil | Vad |
|---|---|
| `konfig.json` | Enda sanningskällan: konto, kampanj, adsets, pixel, priser, kostnader, grindar. Allt avläst 2026-09-21, med källa per fält |
| `ekonomi.mjs` | Break-even båda momslinjerna, dom, vinstbidrag, ranking, benchmark-skyddet |
| `etikett.mjs` | Etiketten dag 7 — samma trösklar som Skalnings kungens `agent/etikett.mjs` |
| `lardom.mjs` | Lärdomen, brieftaket, mixen, iterationsräkningen, konceptstatus |
| `namn.mjs` | Namnmönstret, nästa lediga nummer, hookvarianter och iterationskedjan |
| `struktur.mjs` | 3:2:2: strukturläget och taket, koncepten, adsetnamnet, COPY CARD 2 + 2, Meta-specarna, tillbakaläsningen |
| `dom.mjs` | Domen per ADSET (7/14 dagar, stäng, flytta till Champions) och förslagen till Axel |
| `kon.mjs` | Notion-kön → koncept → testadsets, med stoppskäl |
| `kor.mjs` | CLI:n |
| `logg.jsonl` | Minnet: `UPPLADDAD` (med `adset_id` och `koncept` sedan 3:2:2), `ADSET_SKAPAD`, `ADSET_DOM`, `FORSLAG`, `ETIKETT`, `LARDOM`, `BRIEF`, `ROND_KLAR` |
| `kanda-namn.json` | Ögonblicksbild av upptagna annonsnamn (reserven utan nät). `--namn` läser dessutom loggens UPPLADDAD-rader, kontot ur senaste `output/avlasning-*.json` och hubben live via `NOTION_TOKEN`, och skriver unionen tillbaka hit. ⚠️ Lärdom 2026-09-24/25: filen ensam gav 048 tre gånger i rad (rond 2:s Draft-briefer fanns bara i hubben) ⇒ nio annonser live med rond 2:s nummer, brieferna omdöpta 054–058 |

Produktminnet ligger i `products/matstrumpor/` (`dna.md`, `batch-log.md`,
`lardomar.md`) — som alla andra produkter i repot.

## Bruces vecko-SOP (2026-10-03)

Bruce (Gilz Bruce Biazon) jobbar bara på Matstrumpor och är creative
strategist där, så redigerarnas veckorapport gäller inte honom (Axels beslut
2026-10-03, `redigerarrapport/konfig.json` → `utan_redigerare`). I stället
utvärderar han sig själv varje måndag 15:00 Manila efter
**`sop/BRUCE-WEEKLY-SELF-REVIEW.md`** (engelska, en A4-sida, PDF bredvid):
sex steg i Growth Guide (grinden 300 kr OCH 3 köp, briefen mot klippet,
hook/hold mot kampanjens topp, "Guess:" i Anteckning, Beslut ur etiketten,
hit rate som bråk, ETT test i Nästa steg). Han skriver bara i de fyra
människokolumnerna; Skala är Axels. Texten byggdes av fyra läsare, tre
utkast, två domare och tre skeptiker (fakta mot `etikett.mjs`,
`growthguide.mjs`, `struktur.mjs`; enkelhet; repots regler). PDF:en byggs om
med `node matstrumpor/sop/bygg.mjs` (Chromium, samma väg som
`products/matstrumpor/ugc/pdf/bygg.mjs`). ⚠️ Om Bruce kan öppna Growth
Guide-sidan är inte mätt (API:t ser inte delningar): sidan ligger i
workspace-roten, och SOP:en säger "Cannot open one of them? Tell Axel".

## E-posten (Klaviyo, byggd 2026-09-25)

Matstrumpor har ett eget Klaviyo-konto, **`UV6Rqg`** (nyckeln
`KLAVIYO_API_KEY_MATSTRUMPOR`), och samma motor som Bäverbutiken med `--brand
matstrumpor`. Brandfilen är `klaviyo/brands/matstrumpor.json`, innehållet
`klaviyo/innehall/matstrumpor/` (14 kampanjer K01–K14 + 7 flöden), analysen
`klaviyo/evolve/ATERKOP-ANALYS-matstrumpor.md`, läget i `klaviyo/README.md`.

```bash
node klaviyo/kolla.mjs --brand matstrumpor --profiler   # konto, metriker, samtycke
node klaviyo/bygg.mjs --brand matstrumpor               # mejlen ur innehållet + live-priser
node klaviyo/ladda-upp.mjs --brand matstrumpor          # torrt; --skarpt laddar upp som utkast
node klaviyo/sla-pa.mjs --brand matstrumpor <flöde …>   # bara på Axels ord, --ja
node klaviyo/schemalagg.mjs --brand matstrumpor K01     # bara på Axels ord, --ja
node klaviyo/rapport.mjs --brand matstrumpor            # vinstbidrag mot break-even 1,498
```

Det datan säger (hela orderhistoriken, 3 911 ordrar): **julprodukt** (dec 2025
1 613 ordrar, april–juli nästan noll), 1,2 % återköp och då **samma sushilåda
igen** (38 av 44), inget produktpar med stöd, leverans p90 15 dygn ⇒ sista
beställning fars dag 24/10 och jul 8/12. Black Week-trappan 10/20/30 % ligger i
Shopify som tre schemalagda automatiska rabatter 23–30/11 (Axels beslut).
⚠️ Kontot saknade postadress 2026-09-25, så inget är påslaget: villkoren och
Cowork-prompten står i `klaviyo/SISTA-STEGEN.md` → Matstrumpor.

## Cookie-rutan: bara Shopifys sedan 2026-09-29

Axels order: "alla kunder får två stycken [cookie-rutor] varje gång … vi tar
bort våran custom cookie pop-up och så kör vi bara med Shopifys vanliga."
Mätt samma dag på tio butikers startsidor: bara matstrumpor.se hade två —
temats egen sektion `ms-cookies` (följde med källtemat; fabriken tar redan
bort den i varje OPS-butik, `factory/rensa-kalla.mjs`) plus Shopifys
samtyckesruta. Borttagen ur `sections/footer-group.json` i det publicerade
temat (`Matstrumpor CRO + storleksrad 2026-09-17`, `…/207180890451`) via
`themeFilesUpsert`: sektionen `ms_cookies` ur `sections` och `order`, inget
annat ändrat, tillbakaläst (bara `footer` kvar). Filen
`sections/ms-cookies.liquid` ligger kvar oanvänd. Publik HTML på
`/`, produktsidan, `/nb`, `/da`, `/en`, `/de`: `id="ms-cookies"` 0 gånger.
Samtycket sköts nu bara av Shopifys ruta (Inställningar → Kundsekretess).
Tillbaka: lägg `"ms_cookies": {"type": "ms-cookies", "settings": {"visible": true}}`
i `sections` och `"ms_cookies"` sist i `order`.
