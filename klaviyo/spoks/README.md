# Spoks: Bäverbutikens och Matstrumpors mejl i Spoks i stället för Klaviyo

Två butiker, två workspaces, två konverterare (se ⚠️ under Matstrumpor). Bäverbutiken
först i den här filen, Matstrumpor efter strecket.

Axels order 2026-09-25/26: "bygg i spoks". Samma innehåll som Klaviyo
(`klaviyo/innehall/baverbutiken/`), konverterat till Spoks-block av
`konvertera.mjs` och uppladdat via Spoks-MCP:n. Det finns inget publikt Spoks-API,
så uppladdningen görs av en session, inte av ett skript.

```bash
node klaviyo/spoks/konvertera.mjs                    # innehall → baverbutiken/payload/*.json + plan.json (oförändrat sedan 2026-09-26)
node klaviyo/spoks/konvertera.mjs --brand carashell  # flerspråkigt: payload/<sprak>/ + plan.json med Spoks-filter, segment, inställningar
```

Workspace: Bäverbutiken `f716ae36-68ae-4f1c-a45e-96c35d5637a0` (Shopify 4snrw0-mg).

## Läget 2026-09-26 (mätt med get_flows / draft_campaign)

Allt är INAKTIVT. Spoks-MCP:n kan inte slå på flöden, aktivera mejlsteg eller
skicka kampanjer. Det görs bara i appen, av Axel.

| Flöde | Spoks-id | Startar på | Väntan |
|---|---|---|---|
| F01 Välkomst | `b8165fed-50a2-42e4-a275-494433d3f7f0` | ny kontakt, subscribed | 1 min, 2 d, 3 d |
| F02 Övergiven kassa | `df764d97-2fb0-4469-8675-6337edcb7b1b` | checkout, inget köp sedan | 3 h, 1 d, 2 d |
| F03 Webbhistorik | `f9001da7-60cb-4742-bd5a-8d4397cfb0e6` | produktvisning | 4 h, 1 d |
| F04 Efter köp | `786d2580-b0e1-4e98-bc3d-404c435db62a` | order skapad | 3 d, 16 d |
| F05 Vinna tillbaka | `d27ea9f1-a609-425a-a7f5-8d900fecc366` | order, inget köp sedan | 120 d, 14 d |
| F07 Motorhölje → båtmotorskydd | `84cd7589-d549-4ad7-ab9d-c711384a4396` | order med Marin Motorhölje | 21 d, 7 d (hoppar den som redan köpt båtmotorskyddet) |
| F08–F13 Tips (bälteslip, taköverdrag, termoskydd, båtmotorskydd, IBC, sätesöverdrag) | `c7dc0fb1…`, `de6d925c…`, `e09a5094…`, `a94ef839…`, `74c973b4…`, `f6186338…` | order med produkten | 14 d |
| F14 Recension Trustpilot | `23d2710c-1a33-44c3-bb25-df1f691b6161` | order skapad (max var 90:e dag) | 16 d, 18:00 |
| Dubblett, tom | `e2ff6c1d-f0fa-4659-bb97-2c9d8fdb8c46` | heter "RADERA dubblett (tom)" | raderas i appen |

Flödena F01–F13 fanns redan: Spoks importerade dem själv från Klaviyo med
innehållet. Sessionen rättade det importen missade: tipsflödena och F07 hade
ingen trigger alls, väntan 12 dagar i stället för 14, och F07 filtrerade på
"totalt antal ordrar" i stället för om kunden redan köpt båtmotorskyddet.

Kampanjerna K01–K22 ligger som utkast (Spoks: status draft, avregistreringslänk på).

## Klaviyo avstängt 2026-09-26

`node klaviyo/stang-av.mjs --ja`: 13 flöden till draft, K01 återkallad till utkast. Inget raderat.
Spoks: plan Paid (inget månadstak), avsändaradress ej satt vid mätningen.

## Uppvärmningen (Spoks segment, genererade av Axel 2026-09-26)

Mätt med `get_segments` samma dag, alla taggbaserade:

| Segment | Id | Kontakter |
|---|---|---|
| Warmup tier 1 | `c3d021c1-4cfd-423f-9d56-db2b3d0f9f4d` | 2 500 |
| Warmup tier 2 | `9c219ca9-fa16-4a58-af8a-2b2828b29cd1` | 5 000 |
| Warmup tier 3 | `d3308bc6-2b3e-43ee-9157-7ac5bd719fca` | 6 180 |
| All subscribed | `9902d9ef-0ea3-4077-bbd5-032851b37143` | 6 267 |

`preview_segment` på tier 1 OCH inte subscribed gav 0: tier 1 får kampanjer.
Mottagarna går INTE att sätta via MCP:n (`update_draft_campaign` har inget fält för
segment), så Axel väljer segmentet när han schemalägger.

Plan: vecka 1 (K01) tier 1, vecka 2 tier 1, vecka 3 tier 2, vecka 4 tier 2,
vecka 5 tier 3, därefter All subscribed. Titta på öppning och klagomål i Spoks
efter varje utskick; stiger klagomålen, stanna kvar ett steg till.

## Skillnader mot Klaviyo (Spoks kan inte)

- **Inget ordernummer i mejlet.** Spoks personalisering har bara kontaktfält,
  så F04:s knapp går till spårningssidan och kunden skriver numret själv.
- **Ingen "Fulfilled Order"-trigger.** F04, tipsflödena och F14 startar på
  *order skapad* med väntan räknad från köpet (F04 3 dagar, F14 16 dagar).
- **Inget orderradsblock.** "Det här fick du hem" i F14 utgår.
- **Ingen segmenttrigger.** F06 Sunset finns inte i Spoks. Den som inte öppnat
  på länge får fortfarande kampanjer tills Spoks egen suppression tar dem.
- Anonyma recensenter står som "Verifierad kund", aldrig "Anonymous".

## CaraShell (workspace `38f3d430-690c-4c0b-8419-8ec2e5272148`, UPPLADDAT 2026-09-26, allt avstängt)

✅ **Uppladdat 2026-09-26 10:45–11:36 CEST** (Axel bjöd in `kundsupport@baverbutiken.se` som
Admin i workspacen "Carashell" under sitt extra Spoks-konto; `whoami` visade den direkt efter,
Shopify `yitrbk-m3`, plan **Free = 5 000 mejl/mån**). Facit med varje id:
**`klaviyo/spoks/carashell/spoks-id.json`**. Mätt och byggt, i ordning:

- **Språkstyrningen håller:** 463 kontakter; Sweden + Denmark 219, utan land 30, Norway 94,
  US/UK/CA/AU/NZ/FI 120 (219 + 94 + 120 = alla 433 med land). Landsnamnen i Spoks är exakt
  brandfilens. Samtycke: **sv 15, nb 4, en 57** (76 totalt, samma som Shopify).
- **Produkterna:** Spoks-id och `fileId` för de fyra bilderna i `produkter.json`; katalogens
  SEK-priser (1 129 / 559 / 539 / 379 kr) stämde med carashell.se. Payloads omgenererade utan
  platshållare (`konvertera.mjs --brand carashell`, klaviyo-testerna 166/166).
- **Inställningarna:** avsändare **CaraShell <hello@carashell.com>** (reply-to samma), färger,
  layout, logga, Barlow + Source Sans 3, sidfoten med bolag och adress, avregistrering på tre
  språk. Avsändaradressen gick först inte (`custom_domain_not_valid`) men gick igenom 11:35 —
  domänen var då verifierad: carashell.com bär Spoks poster (`link` → `t7pzafpu.link.spoks.com`,
  `feed` → `0mjnbqxx.feed.spoks.com`, `kps`/`kps2._domainkey` → `u115622048.wl049.sendgrid.net`,
  `_dmarc` `v=DMARC1; p=none;`), mätt med Cloudflare DoH; NS/MX/A orörda (Loopia, Shopify).
  Rot-SPF:en saknar fortfarande `include:sendgrid.net` (SendGrids egen `em…`-CNAME bär SPF för
  avsändarvägen, och Spoks godkände domänen ändå). Webbsäkra reservtypsnitt står kvar på
  Helvetica/Arial Black (ändras inte via MCP:n, syns bara om Google Fonts inte laddar).
- **13 segment** (`SEG_samtycke_sv/nb/en` 15/4/57 …, `SEG_oengagerade_180d` inte valbart i kampanjer).
- **24 flöden, 45 mejl** (8 per språk), alla `isActive: false`, alla sändsteg `isEnabled: false`.
- **42 kampanjutkast** (14 per språk: 39 vid uppladdningen + K09B efter Black Week-beslutet),
  status draft, ingen publik, inget datum, `isOptOutEnabled`.
- **Kontroll:** tre oberoende granskare (en per språk) läste tillbaka varje flöde och varje mejl
  mot `plan.json` och `payload/`: 8/8 + 13/13 per språk, inga dubbletter. En rättning: F01 SV E1
  skapades före länkdomänen och hade spårningslänken `r.spoksmail.com` — omsparad, nu
  `link.carashell.com` som de andra 44. Går inte att läsa tillbaka via MCP:n: produktblockens
  knapptext och visningsinställningar (dolt pris i nb/en) — skickade exakt som payloaden,
  syns i appens förhandsvisning.
- ⚠️ Uppladdningen gjordes av en workflow med en agent per språk. **Ett avbrott i huvudsessionen
  (Axel skrev medan den körde, 11:16) dödade agenterna mitt i** — omstarten var idempotent
  (namn/titlar lästes först, halvfärdiga flöden byggdes klart) och inget blev dubbelt, men
  räkna alltid efter en omstart. Spoks svarade "Rate limit exceeded" ett par gånger med två
  agenter samtidigt; läs tillbaka och försök en gång till räckte.
- **Black Week = B** (Axels svar samma eftermiddag: Bäverbutikens trappa). I CaraShells Shopify
  ligger tre automatiska rabatter, **"Black Week 10 %" / "20 %" / "30 %"** vid minst 1/2/3 varor,
  alla produkter, kombineras bara med fraktrabatter, schemalagda **2026-11-22T23:00Z →
  2026-12-01T08:00Z**. Titlarna saknar svenska ord för att kassan visar dem på alla språk. Slutet
  är sessionens beslut: tisdag 1/12 09:00 svensk tid = midnatt natten mot tisdag i Kalifornien.
  Engelska mejl lovar "through Monday, November 30", och med Bäverbutikens slut (00:00 svensk tid)
  hade rabatten försvunnit måndag 18:00 i New York — 54 av 57 engelska prenumeranter bor i USA.
  Skapade med `node klaviyo/black-week-trappa.mjs --butik carashell --ja` och lästa tillbaka på
  id (brandfilen `black_week.shopify`, `spoks-id.json → black_week`). Paketkoderna (15–25 %)
  kombineras inte med trappan; Shopify ger kunden den bästa, och trappan är alltid minst lika bra.
  I Spoks: **K09 omskriven på tre språk** (samma postId, nu om trappan) och **K09B Black Friday
  fredag 27/11 ny** på tre språk. `konvertera.mjs` släpper igenom 10/20/30 % bara i mejl med
  `rabatt: "black_week"` (testat), och `kolla-mejl.mjs` kör kontrollen på enstaka innehållsfiler.
  Efter uppdateringen räknat: 42 utkast, titlar och id stämmer mot `plan.json`, inga dubbletter.

**Inget är påslaget.** Att slå på ett flöde = sändstegen på ett i taget i flödesredigeraren,
sedan flödet (samma som Matstrumpor). F14 (recension) får inte slås på förrän Trustpilot-profilen
för carashell.se finns (evaluate-sidan svarade 404 2026-09-26 11:40; Axel skapar den).

Axels order 2026-09-26 (`PROMPT-carashell.md`): hela mejlsystemet för CaraShell i
Spoks, alla marknader och språk, allt som utkast. CaraShell är en egen verksamhet:
inget delas med Bäverbutiken (egen brandfil, eget innehåll, egna produkter, egen copy).

```bash
node klaviyo/innehall/carashell/skelett.mjs          # strukturen → innehall/carashell/{floden,kampanjer}/<sprak>/
node klaviyo/spoks/konvertera.mjs --brand carashell  # copykontroll + payload/<sprak>/ + plan.json (stoppar på copyfel)
node --test klaviyo/test/konvertera.test.mjs         # 9 tester: Bäverbutiken oförändrad, CaraShells språk och Spoks-form
```

**Historik — steg 0 stoppade först (löst samma dag, se ovan):** `whoami` visade bara Bäverbutiken.se (`f716ae36-…`) och
Matstrumpor.se (`71c2d4c8-…`) under MCP-användaren `kundsupport@baverbutiken.se`
(mätt två gånger 2026-09-26). Appen **Spoks står som installerad på CaraShells
Shopify** (yitrbk-m3, `appInstallations` läst med Admin API samma dag: Factory,
Dianxiaomi, Judge.me, wetracked, Messaging, StonePNL, **Spoks**) — men **Axel
bekräftade samma förmiddag att han aldrig skapat något Spoks-konto för CaraShell**,
så installationen avbröts innan onboardingen kördes och ingen workspace finns.
Inget storeId gissas; inget laddades upp i fel workspace. Uppladdningen är en egen
session: `PROMPT-carashell-upp.md`.

**Så skapas workspacen (Spoks egna hjälpartiklar, lästa 2026-09-26:**
*Introduction: how to get started*, *How do I run several Shopify stores from one
Spoks login*, *Set up your domain*): Spoks installeras per butik från Shopify, och
varje butik blir en egen workspace. **Under installationen föreslår Spoks en
mejladress — den ska ÄNDRAS till `kundsupport@baverbutiken.se`**, samma adress som
Bäverbutikens och Matstrumpors workspaces, för då hamnar CaraShell under samma
inloggning och MCP-användaren ser den direkt (ingen team member-inbjudan behövs).
Första inloggningen måste göras **på en dator, genom att öppna Spoks från Shopify
admin** (Spoks ord: "Your first login must be done on a desktop computer, by opening
Spoks from your Shopify admin"). Onboardingen frågar om migrering från Klaviyo —
CaraShell har inget Klaviyo, hoppa över. Ser Axel "No Shop found" är han inloggad
med en annan adress än den han skrev in vid installationen. Blev den installerad
med fel adress: Spoks support gör `kundsupport@baverbutiken.se` till admin på
butiken om man skickar butiks-URL + adress (artikelns egen lösning).
Domänen kopplas i **Settings → Domain Settings → "Generate DNS records"** (Spoks
skickar via SendGrid: SPF:en ska få `include:sendgrid.net` **före** `-all`, alltså
`v=spf1 include:spf.loopia.se include:sendgrid.net -all` på carashell.com — läggs
till, ersätts aldrig). De exakta CNAME/TXT-posterna finns först när workspacen
finns; uppladdningssessionen läser dem med `get_settings` och skriver dem i rapporten.

**Mätt 2026-09-26 i Shopify (90 dagar):** 384 ordrar — SE 173, NO 82, US 59, AU 29,
DK 23, FI 7, GB 6, NZ 3, CA 2. 457 kunder, **76 med samtycke** (US 54, SE 12, NO 4,
DK 3, AU 2, GB 1; FI 0). **0 återköp** (2 kunder med två ordrar, båda inom en timme)
⇒ inget korsförsäljningsflöde. 73 övergivna kassor. Order → skickad median 0,5 dygn;
levererat bara 4 paket med `deliveredAt` (butiken är 15 dagar gammal). Fyra aktiva
produkter: takskyddet (9 storlekar), termoskyddet, fönstertermomatta 2-pack (ny),
adventskalender med retrobussar (ny). Priser per marknad lästa med `contextualPricing`
(SEK 1 129 / NOK 1 106 / USD 199 / GBP 154 / CAD 288 / AUD 289 / NZD 359 / EUR 126,90 /
DKK 819 för takskyddet 5,5–6,5 m) — de står ALDRIG i copyn.

**Språkstyrningen och hur den mättes:** Spoks har inget språkfält på kontakten.
`get_settings` (Bäverbutiken) visar `customFieldTokens: []`; `preview_segment` med
`{country is}` gav 7 766 kontakter och sampeln `country: "Sweden"` — landet lagras
som engelskt namn. Därför **ett flöde per språk** (landsfiltret i triggerns
kontaktfilter, återprövas före varje utskick) och ett segment per språk för
kampanjerna. sv = Sweden + Denmark + kontakter utan land; nb = Norway; en = United
States, United Kingdom, Canada, Australia, New Zealand, Finland (7 ordrar bär inte
ett finskt system). Ordrarnas `customerLocale` bekräftar att land ⇒ språk håller
(SE 173/173 sv, NO 67/82 nb, US 59/59 en). ⚠️ Landsnamnen för de andra länderna är
Shopifys engelska namn och ska kontrolleras med `preview_segment` i CaraShells
workspace innan något slås på (uppladdningsprompten steg 1).

**Byggt i repot:** `klaviyo/brands/carashell.json` (per språk: länkbas, spårningssida,
villkorstext, förnamnsreserv, knappar, Trustpilot; landsgrupperna; Spoks-inställningarna),
`klaviyo/innehall/carashell/` (skelett.mjs, faktablad per språk ur Shopifys egna
översättningar, 24 flödesfiler + 42 kampanjfiler med copy, BRIEFER.md),
`klaviyo/spoks/carashell/` (PLAN.md, produkter.json, plan.json, payload/<sprak>/).
Planen i korthet står i `carashell/PLAN.md`: 8 flöden per språk (välkomst, övergiven
kassa med de tre frågorna, webbhistorik, efter köp, vinna tillbaka, levererat ×2 med
monteringen, recension) och 14 kampanjer per språk (tisdagar 29/9–29/12 plus Black Friday
fredag 27/11).
**Copyn är ifylld och konverteraren grön 2026-09-26:** 84 payloadfiler (28 per språk:
15 flödesmejl + 13 kampanjer), 0 copyfel, `node --test klaviyo/test/konvertera.test.mjs`
9 av 9. De 8 varningarna "produkt-id/bilder saknas i Spoks" är väntade — id:n och
`fileId` finns först när workspacen finns (uppladdningsprompten steg 2). Den enda
regelrättningen under copyfasen: nb-faktabladets egen formulering "ikke strikk" släpps
igenom (negationen), medan ett påstående om elastiska band fortfarande stoppar.

**Spoks-fynd som styrde bygget:**
- Katalogen har EN valuta och ETT språk (products_search: `price, currency`), så
  produktkort i nb/en hade visat svensk titel och SEK. nb/en får bild + rubrik på
  språket + knapp (`per_sprak.*.produktkort: "bild"`); kassablocket döljer priset.
- Sidfoten och avregistreringstexten är EN per workspace (`get_settings`), inte per
  språk ⇒ språkneutral sidfot med bolag, adress (MFL 20 §) och mejl, tre ord på länken.
- `order_delivered` finns som trigger (blueprintlistan använder den inte). CaraShells
  spårningsrutin skriver leveransskanningen i Shopify varje timme, så F06 (montering)
  och F14 (recension) triggas på leverans — **omätt i CaraShells workspace**, se PLAN.md.
- Trustpilot har ingen profil för carashell.se (`evaluate`-sidan 404, Bäverbutikens 308).
  F14 slås inte på förrän profilen finns.
- Kassaflödet kräver subscribed (MFL 19 §) och når därför bara 7 % av svenska
  kassor. Det är lagen, inte ett fel.

⚠️ **Läget ändrades samma förmiddag:** Axel råkade skapa CaraShells workspace under
ett **eget, nytt Spoks-konto** (annan inloggning än `kundsupport@baverbutiken.se`),
så workspacen finns men syns varken i hans vanliga hubb (skärmdump: bytaren visar bara
Bäverbutiken.se och Matstrumpor.se) eller för MCP:n. **Lösningen är Spoks egen för
"redan installerad med fel adress":** logga in på det nya kontot → CaraShells workspace
→ **Settings → Team → "Invite team member"** → `kundsupport@baverbutiken.se` → rollen
**Admin** → skicka (hjälpartikeln *Managing team members*: inbjudan går på mejladress,
Admin = "Full access … and other team members"). Går det inte: Spoks support med
butiks-URL + adressen, "we will make the address you want an admin on all of them"
(artikeln *How do I run several Shopify stores from one Spoks login*). Sedan ska
`whoami` visa tre workspaces, och uppladdningssessionen (`PROMPT-carashell-upp.md`,
steg 0) kan gå vidare. Det extra kontot rörs inte av någon session.

**Axels klick efter uppladdningen** (allt i https://app.spoks.com/carashell):
1. ✅ Inbjudan av `kundsupport@baverbutiken.se` som Admin (gjord 2026-09-26 förmiddag).
2. ✅ Domänen carashell.com kopplad och verifierad (DNS-posterna ovan fanns 11:35).
3. ✅ Black Week: B (svar 2026-09-26). Trappan ligger i Shopify, K09 är omskriven och K09B tillagd.
   Rabatten gäller hela butiken, även för den som kommer från en annons.
4. Trustpilot-profil för carashell.se (Axel gör den), sedan F14.
5. Slå på flödena ett språk i taget (sändstegen först, sedan flödet); stäng först Shopifys egna
   automatiseringar för övergiven kassa (Marknadsföring → Automatiseringar), annars får kunden två mejl.
6. Kampanjerna: publik `SEG_samtycke_<sprak>` och tiden i `spoks-id.json → kampanjer.*.planerad`,
   en i taget, K01 tisdag 29/9.

---

# Matstrumpor i Spoks (workspace `71c2d4c8-b9ec-488a-b15c-5dfe8dbd2226`, byggt 2026-09-26)

Axels order 2026-09-26: "FÖRBERED BARA FÖR MATSTRUMPOR TILL SPOKS" + "Jag har inte
kopplat än" + "kör". Samma innehåll som Klaviyo (`klaviyo/innehall/matstrumpor/`),
konverterat till Spoks-block av **`klaviyo/spoks-paket.mjs`** (brand-parametriserad;
facit `klaviyo/konto/matstrumpor/spoks.json`, logg `klaviyo/konto/matstrumpor/spoks-uppladdat.jsonl`,
utdata gitignorerad i `klaviyo/output/matstrumpor/spoks/`) och uppladdat av sessionen via
Spoks-MCP:n. Bygget lämnades inaktivt; ⛔ **ALLA SEX FLÖDEN ÄR LIVE sedan 2026-09-26
07:51–07:57 CEST** — Axels egna klick i appen (sändstegen på, flödena aktiverade), mätt med
`get_flows` 08:0x: `isActive: true` på F01–F05 och F07, F02:s tre sändsteg `isEnabled: true`,
och F01/F04/F05/F07 hade redan varsin kontakt inrullad. Kampanjerna är utkast utan publik
och utan schema tills Axel schemalägger dem. Klaviyo-kontot `UV6Rqg` lämnades orört
(utkast där också, inget påslaget).

```bash
node klaviyo/spoks-paket.mjs --brand matstrumpor --offline   # innehåll → output/matstrumpor/spoks/<mejl>.json + floden.json + PAKET.json
node --test klaviyo/test/spoks-paket.test.mjs                 # 15 tester
```

⚠️ **Två konverterare finns sedan 2026-09-26**, byggda av två sessioner samma dag utan att
se varandra: `klaviyo/spoks/konvertera.mjs` (Bäverbutiken, skriver `baverbutiken/payload/`;
sedan samma dag även **CaraShell** med `--brand carashell`, flerspråkigt, se rubriken ovan)
och `klaviyo/spoks-paket.mjs` (Matstrumpor, brand-parametriserad). De ska slås ihop till en;
tills dess kör var och en bara sin butik — Bäverbutikens yta `f716ae36-…` rörs aldrig från
`spoks-paket.mjs`, och `konvertera.mjs` rör aldrig Matstrumpor.

**Ytan** (mätt med whoami/get_settings 2026-09-26): Matstrumpor.se, Shopify
`1r46tp-qx.myshopify.com`, tidszon Europe/Stockholm, **plan Free = 5 000 mejl per månad**,
4 370 kontakter varav **2 911 med samtycke**. Inställningarna satta via MCP:n: avsändare
"Matstrumpor", reply-to `kundsupport@matstrumpor.se`, loggan, färgerna (`#dd821d` på
`#f3ede2`, vitt sidhuvud), fonten **Tilt Warp + Nunito Sans** (Mochiy Pop P One finns inte i
Spoks lista), sidfoten Matstrumpor-klubben + "Avregistrera dig". `senderEmail` kräver en
verifierad egen domän i Spoks — det är DNS och Axels beslut (⛔ aldrig namnservrarna).

## Läget 2026-09-26 (mätt med get_flows, get_flow och search_campaigns)

| Flöde | Spoks-id | Startar på | Väntan | Mejl (sändstegen PÅ och flödet LIVE sedan 2026-09-26) |
|---|---|---|---|---|
| F01 Välkomst (Matstrumpor-klubben) | `4e8a9b59-4192-4bb4-8829-785e6af01f7c` | ny kontakt (`contact_created`), samtycke | 0, 2 d, 3 d | E1 med medlemskortet, E2, E3 (E2/E3 bara om inget köp sedan start) |
| F02 Övergiven kassa | `7e1dab93-5aba-4f69-b497-66636df338e2` | `checkout_created`, samtycke | 3 h, 1 d, 2 d | E1–E3 med kassablocket, bara om inget köp sedan start |
| F03 Webbhistorik | `dafa3c59-7a47-4a9e-a5cc-80eba2716612` | `product_viewed`, samtycke | 4 h, 1 d | E1, E2 (senast visade produkten; E2 bara om varken köp eller kassa sedan start) |
| F04 Efter köp | `d9f24905-8dab-43f3-a427-d8478701f315` | `order_created`, kundundantag (återinträde 30 d) | 3 d, 13 d | E1 spårningssidan + MS-raden, E2 |
| F05 Vinna tillbaka | `6728bb3b-fa5d-402b-8a66-f0f6ac360fca` | `order_created`, kundundantag (återinträde 90 d) | 90 d, 14 d | E1, E2 — bara om inget köp sedan start |
| F07 En låda till (sushi, dag 21) | `615a6e65-9a43-4a29-8af8-afc82ee7cd23` | `order_created` med Sushi-Strumpor (`triggerFilter externalId`), kundundantag (återinträde 60 d) | 21 d | E1 — bara om inget köp sedan start |

Flödesmejlens post-id:n och stegens id:n står i `spoks-uppladdat.jsonl` (rader `flodessteg`
och `flodesmejl`). Sändstegen skapas alltid avstängda av MCP:n och kan bara slås på i
flödesredigeraren i appen.

**Kampanjutkast (16, `status draft`, ingen publik vald, inget schema):** K01 29/9 `9aa10213`,
K02 6/10 `b7acd85c`, K03 13/10 `920afd93`, K04 20/10 `6f1e2e50`, K05 27/10 `c6b1d0b0`,
K06 3/11 `eeec137e`, K07 10/11 `f914fe1f`, K08 17/11 `960a9002`, K09 23/11 `34c4f671`,
K10 27/11 `eca0a6db`, K11 1/12 `2457c8d7`, K12 8/12 `3a072256`, K13 15/12 `45bd1681`,
K14 29/12 `5637c25a` — datum och tänkt segment står i titeln (`K01 · 29/9 · uppvarmning_steg1 · …`),
schemat i `klaviyo/innehall/matstrumpor/KALENDER-2026.md`. ⚠️ **Appens kampanjlista visar
INTE titeln** utan ämnesraden (`customizedNotification.emailTitle`), nyast överst — mätt
2026-09-26 när Axel letade efter "K01" och fick upp "Vem fyller år näst på listan?" (K14).
K01 står längst ner som "De tittar två gånger, sen skrattar de". Ge Axel alltid
direktlänken `https://app.spoks.com/matstrumpor/post/<hela id:t>/edit` (ur `get_links` →
`send_campaign`; hela id:n i `klaviyo/konto/matstrumpor/spoks-uppladdat.jsonl`) i stället
för ett namn att leta efter. **F06 Sunset** finns inte som
flöde (Spoks saknar segmenttrigger) utan som två utkast: `F06 E1 · för hand till
oengagerade_180d` `4fccb750` och `F06 E2 …` `662420f3` — skickas för hand till
`SEG_oengagerade_180d` när det segmentet fått medlemmar, E2 tidigast 7 dagar efter E1.
Fulla id:n i loggen.

**Segment (14, antal vid skapandet 2026-09-26):**

| Segment | Spoks-id | Antal | Not |
|---|---|---|---|
| SEG_samtycke | `6e67fe0f-6ff3-4c13-91f2-a41e08e61dfe` | 2 911 | kampanjernas grundpublik (subscribed, ej spärrad) |
| SEG_uppvarmning_steg1 | `e8f5a0ee-268e-4644-bcdc-d537eaf93f63` | 0 | aktiv 30 d — händelser i Spoks |
| SEG_engagerade_60d | `5acab85e-bbb8-4db8-af5a-3958dc5b4316` | 2 | aktiv 60 d |
| SEG_engagerade_90d | `f1411bd5-d67f-4740-82e9-7da3204d4876` | 2 | aktiv 90 d |
| SEG_kopare | `b20d55df-861b-4536-bdc8-aa341e717dfe` | 2 617 | `totalOrders ≥ 1` (kontaktfältet, funkar för importerade) |
| SEG_kopare_30d | `8f8fe8cf-5947-4a1c-bf45-5c6b7cff9d9f` | 2 | köp registrerat i Spoks senaste 30 d |
| SEG_ej_kopt | `b8ceaedb-257b-4aa1-93dd-bfd55c6113c6` | 295 | `totalOrders = 0` |
| SEG_flerkopare | `b1824090-b73f-49af-9a29-fefd65f70b9b` | 112 | `totalOrders ≥ 2` |
| SEG_vinback_90d | `89e02399-7016-4239-a656-70e85ebbc5af` | 2 616 | köpare utan Spoks-registrerat köp på 90 d — brett tills historiken finns |
| SEG_oengagerade_180d | `a34a23ab-03ab-4d6e-9f51-366796b8fe15` | 0 | bara exkludering + F06 |
| SEG_kategori_sushi | `1eae539b-f1c7-439e-8410-78d743f124ad` | 3 | köpt "sushi" (händelse) |
| SEG_kategori_pizza | `e25e8691-122a-4ecd-bde1-74d9742efff2` | 0 | köpt "pizza" |
| SEG_kategori_hamburgare | `d2668dde-f5dc-4244-92d9-d81d6529fdd0` | 0 | köpt "hamburgare" |
| SEG_kategori_donut | `586997f9-e2c8-45ca-85c0-ba08ca4763b9` | 1 | köpt "donut" |

⚠️ **Spoks har ingen händelsehistorik för importerade kontakter** (mätt 2026-09-26:
`orderedProducts ≥ 1` gav 0 av 4 370, och periodnotation på kontaktfält som `lastPurchase`
ger "Internal error"). Därför bygger köparsegmenten på kontaktfältet `totalOrders`, medan
engagemangs- och kategorisegmenten fylls på i takt med att Spoks registrerar egna
öppningar, klick, visningar och köp. I Klaviyo hade samma definitioner 175 (uppvärmning),
2 583 (sushi) och 81 (donut). **K01 och K02 går därför till `SEG_samtycke`** tills
`SEG_uppvarmning_steg1` har medlemmar; K03–K06 (engagerade) blir små utskick de första
veckorna, vilket också håller Free-planens 5 000 mejl per månad.

## Skillnader mot Klaviyo för Matstrumpor (Spoks kan inte)

- **Ingen "Fulfilled Order"-trigger** ⇒ F04 startar på `order_created`; Matstrumpor skickar
  samma dygn (median 0,4 dygn, brandfilen), så väntan är oförändrad.
- **Inget spårningsnummer i mejlet** (bara kontaktfält i personaliseringen) ⇒ F04 E1:s knapp
  går till `https://matstrumpor.se/pages/spara` och en rad säger att numret börjar på MS.
- **Ingen segmenttrigger** ⇒ F06 Sunset är två kampanjutkast för hand (ovan).
- **Fonten Mochiy Pop P One finns inte** ⇒ Tilt Warp (rubriker) + Nunito Sans (brödtext).
- **Ingen blockstil via MCP:n** ⇒ medlemskortet i F01 E1 ligger som en `section` med
  etikett, förnamn (`{{ contact.first_name | default: 'Medlem' }}`), rad, avdelare och
  fotnot — det mörka kortet ställs in i redigeraren.
- **Bara `{{ contact.first_name | default: '…' }}`** som personalisering; Klaviyos taggar
  stoppas av konverteraren (test 9).
- **Ett citat per quote-block**, max två ur Judge.me (sushi har 8 recensioner, resten 0).
- **Publik och schema väljs i appen**, inte via MCP:n — kampanjtitlarna bär datum + segment
  så att det går att välja rätt utan att öppna kalendern.
- **Spoks vägrar en konjunktion med en nod** — ett ensamt filter skickas bart
  (`eller()` i `spoks-paket.mjs` rättad 2026-09-26, kategorisegmenten skapades för hand med rätt form).

## Behörigheterna (Axels krav 2026-09-26: "jag pallar inte godkänna")

Connector-verktygen frågade om lov per anrop även med `mcp__Spoks__*` i
`.claude/settings.json` (listan gäller rutinerna, inte connector-prompterna i en interaktiv
session). Det som tog bort prompterna var Axels klick på **https://claude.ai/customize/connectors →
Spoks → verktygen på "Tillåt alltid"**. Därefter gick hela bygget utan en enda fråga.

## DNS för Spoks avsändardomän — Axels klick i Loopia (2026-09-26)

Spoks (SendGrid under huven) bad om sju poster på matstrumpor.se. **Mätt med dns.google
2026-09-26 innan något lades in:** NS ns1/ns2.loopia.se, A 23.227.38.65 (Shopify), MX
Loopia, EN SPF-TXT `v=spf1 include:spf.loopia.se -all`, ingen DMARC, ingen av de fem
underdomänerna fanns, inget `send.matstrumpor.se` (Klaviyos poster lades aldrig in).
Alla sju är alltså rätt att lägga in, och Axel gör det själv i Loopias DNS-editor
(Kundzon → matstrumpor.se → DNS-inställningar → "Add subdomain"; TTL 3600).

| Underdomän (före `.matstrumpor.se`) | Typ | Data |
|---|---|---|
| `em7588` | CNAME | `u115603739.wl240.sendgrid.net` |
| `kps._domainkey` | CNAME | `kps.domainkey.u115603739.wl240.sendgrid.net` |
| `kps2._domainkey` | CNAME | `kps2.domainkey.u115603739.wl240.sendgrid.net` |
| `link` | CNAME | `s0nrk5ox.link.spoks.com` |
| `feed` | CNAME | `ttc8rvuf.feed.spoks.com` |
| `_dmarc` | TXT | `v=DMARC1; p=none;` |
| *(roten, ingen underdomän)* | TXT, **ändra den som finns** | `v=spf1 include:spf.loopia.se include:sendgrid.net -all` |

⛔ Aldrig namnservrarna, aldrig A, MX eller CNAME www (Loopia-incidenten på
baverbutiken.se 2026-09-25). SPF:en ÄNDRAS — en andra `v=spf1`-post gör att all SPF
slutar fungera. **Mät efter:** `https://dns.google/resolve?name=matstrumpor.se&type=NS`
ska fortfarande svara ns1/ns2.loopia.se, och `type=TXT` ska ge exakt EN spf-rad. Sedan
Spoks → Settings → Custom domain → Verify (kan dröja upp till en timme, Loopias TTL).

✅ **Inlagt av Axel 2026-09-26, mätt av sessionen samma dag (Cloudflare DoH, TTL 3600 =
färskt från Loopias servrar):** alla fem CNAME pekar exakt rätt, `_dmarc` =
`v=DMARC1; p=none;`, roten har EN TXT `v=spf1 include:spf.loopia.se include:sendgrid.net -all`,
och NS (ns1/ns2.loopia.se), A (23.227.38.65) och MX (Loopia) är oförändrade. ⚠️ Google-
resolvern visade upp till en timme efteråt gamla svar (den gamla SPF-raden, "finns inte"
på `_dmarc`/`feed`/`kps*`) — det är resolverns cache från mätningen FÖRE inläggningen,
inte Loopia. Mät med Cloudflare (`https://cloudflare-dns.com/dns-query?name=…&type=…`,
header `accept: application/dns-json`) när Google nyss frågats. Verify i Spoks = Axels klick.
⚠️ **Avsändaradressen går inte att sätta förrän domänen är verifierad i appen:** mätt
2026-09-26 direkt efter DNS-mätningen — `update_settings` med
`emailSettings.senderEmail: kundsupport@matstrumpor.se` svarade
`custom_domain_not_valid: Feed does not have valid custom domain set` (`senderEmail` står
kvar `null`, reply-to är satt). Ordningen är alltså: DNS in → Verify i Spoks (Axels klick)
→ sedan sätts avsändaren via MCP:n eller i Settings → Email & SMS.
✅ **Domänen verifierad och avsändaren satt 2026-09-26** (Axel klickade Verify, sedan
`update_settings` → `applied: true`, läst tillbaka: `senderEmail` och `replyToEmail` båda
`kundsupport@matstrumpor.se`, `senderName` Matstrumpor). Spoks skickar alltså från
butikens egen domän när något slås på. Inget är påslaget.

## Axels klick (i ordning, allt i https://app.spoks.com/matstrumpor)

1. ✅ **Klart 2026-09-26:** DNS-posterna i Loopia (tabellen ovan), domänen verifierad i
   Spoks, avsändaren `kundsupport@matstrumpor.se` satt via MCP:n.
2. ✅ **Klart 2026-09-26 07:51:** F02 Övergiven kassa live med alla tre sändsteg på.
   ✅ **Shopifys egna automatiseringar avstängda samma förmiddag** (Axels klick, avläst
   ur hans skärmdump: Marknadsföring → Automatiseringar, alla sju arbetsflöden
   "Inaktiv", däribland tre "Återställ övergiven varukorg") — kunden får bara F02.
   ⚠️ Lärdom: mejlet om övergiven kassa ligger under **Marknadsföring →
   Automatiseringar**, inte under Inställningar → Aviseringar (där finns bara
   kassasystemets "Övergiven betalning i kassasystemet", som är den fysiska kassan).
3. ✅ **Klart 2026-09-26 07:56–07:57:** F01, F03, F04, F05 och F07 live. (Spoks vägrar
   aktivera ett flöde vars sändsteg är av — rutan "Detta flöde har inga aktiva åtgärder";
   stegen slås på ett i taget i flödesredigeraren, sedan flödet.)
4. **Flows → F01 E1:** öppna mejlet → medlemskortet (sektionen med "MEDLEMSKORT") → mörk
   bakgrund, ljus text, orange ram — stilen går inte att sätta via MCP:n.
5. **K01** (https://app.spoks.com/matstrumpor/post/9aa10213-3bf1-42bc-b23e-315e088d92be/edit,
   i listan "De tittar två gånger, sen skrattar de"): publik `SEG_samtycke` (inte
   `uppvarmning_steg1`, den är tom) → schemalägg tisdag 29/9 18:00. Sedan en kampanj i taget enligt
   `klaviyo/innehall/matstrumpor/KALENDER-2026.md`; F06 E1/E2 ligger kvar tills
   `SEG_oengagerade_180d` har medlemmar.
6. **Planen:** Free räcker till september–oktober (K01/K02 till alla = 2 × 2 911, K03–K06
   små). **November har fyra utskick till alla (K07–K10 ≈ 11 600 mejl) + flödena — det
   kräver ett planbyte före 10/11.** Pengar = Axels beslut.
