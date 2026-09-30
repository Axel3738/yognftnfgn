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

## CaraShell (byggt 2026-09-26, INTE uppladdat — workspacen syns inte för MCP:n)

Axels order 2026-09-26 (`PROMPT-carashell.md`): hela mejlsystemet för CaraShell i
Spoks, alla marknader och språk, allt som utkast. CaraShell är en egen verksamhet:
inget delas med Bäverbutiken (egen brandfil, eget innehåll, egna produkter, egen copy).

```bash
node klaviyo/innehall/carashell/skelett.mjs          # strukturen → innehall/carashell/{floden,kampanjer}/<sprak>/
node klaviyo/spoks/konvertera.mjs --brand carashell  # copykontroll + payload/<sprak>/ + plan.json (stoppar på copyfel)
node --test klaviyo/test/konvertera.test.mjs         # 9 tester: Bäverbutiken oförändrad, CaraShells språk och Spoks-form
```

**Steg 0 stoppade:** `whoami` visar bara Bäverbutiken.se (`f716ae36-…`) och
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
översättningar, 24 flödesfiler + 39 kampanjfiler med copy, BRIEFER.md),
`klaviyo/spoks/carashell/` (PLAN.md, produkter.json, plan.json, payload/<sprak>/).
Planen i korthet står i `carashell/PLAN.md`: 8 flöden per språk (välkomst, övergiven
kassa med de tre frågorna, webbhistorik, efter köp, vinna tillbaka, levererat ×2 med
monteringen, recension) och 13 kampanjer per språk (tisdagar 29/9–29/12).
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

**Axels klick** (upprepas i `PROMPT-carashell-upp.md`): bjud in
`kundsupport@baverbutiken.se` som Admin i CaraShells workspace enligt ovan, kontrollera
i app.spoks.com (inloggad som kundsupport) att CaraShell syns bredvid Bäverbutiken.se
och Matstrumpor.se, kör sedan uppladdningsprompten i en ny session — steg 0 där
vägrar gå vidare tills `whoami` visar workspacen.

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
`1r46tp-qx.myshopify.com`, tidszon Europe/Stockholm, plan Free = 5 000 mejl per månad vid
bygget (**betald och obegränsad sedan samma eftermiddag**, se Axels klick punkt 6),
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
veckorna (Free-planens tak på 5 000 mejl per månad gällde vid bygget; planen är betald
sedan samma eftermiddag).

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
   ⚠️ **2026-09-29, två skärmdumpar samma förmiddag:** Messagings **mejllista** visade "You
   left items at checkout" och "We're happy to see you again" som **Aktiv**. **Messaging →
   Automatiseringar** visade däremot alla fyra automatiseringar **Inaktiv** (Tacka kunder efter
   att de har handlat, Merförsäljning till kunder efter deras första inköp, Tacka kunder efter
   ett köp, Återställ övergiven varukorg; den sista skickade 7 mejl de senaste 30 dagarna, före
   avstängningen 26/9). Sessionen läste först mejllistan och sa åt Axel att stänga av båda.
   Det var fel sida: det är Automatiseringar som skickar, och "Aktiv" på mejllistan är mejlets
   status. Det som återstår är **Flow-appen**: Shopifys ruta säger att Flow-automatiseringar
   fortsätter att köras efter flytten 1 maj, och Flow går inte att läsa via API
   (`marketingActivities` ger bara den frågande appens egna aktiviteter, mätt samma dag med
   Fabriken, och det finns ingen Flow-fråga). Axel tittar därför en gång i Flow och skickar en
   skärmdump om något arbetsflöde är på. Spoks F02 skickar själv (`get_flow` samma morgon: 20
   inrullade, 3 väntar efter E1, 17 efter E2). Skärmdumpen är Matstrumpors: apparna i menyn
   stämmer med `appInstallations` (Claude koppling, Conversion Bear, Flow, Judge.me, Messaging,
   StonePNL, WorkflowMail, wetracked.io); Klaviyo är också installerat men gick inte att läsa
   härifrån (`KLAVIYO_API_KEY_MATSTRUMPOR` saknas i sessionens miljö).
3. ✅ **Klart 2026-09-26 07:56–07:57:** F01, F03, F04, F05 och F07 live. (Spoks vägrar
   aktivera ett flöde vars sändsteg är av — rutan "Detta flöde har inga aktiva åtgärder";
   stegen slås på ett i taget i flödesredigeraren, sedan flödet.)
4. **Flows → F01 E1:** öppna mejlet → medlemskortet (sektionen med "MEDLEMSKORT") → mörk
   bakgrund, ljus text, orange ram — stilen går inte att sätta via MCP:n.
5. **K01** (https://app.spoks.com/matstrumpor/post/9aa10213-3bf1-42bc-b23e-315e088d92be/edit,
   i listan "De tittar två gånger, sen skrattar de"): fältet "Till:" → `SEG_samtycke` (inte
   `SEG_uppvarmning_steg1`, 19 st; se F06 E2-incidenten ovan för varför inte Warmup tier 1) →
   "TITTA IGENOM" → schemalägg tisdag 29/9 18:00. Sessionen kontrollerar efteråt med
   `search_campaigns publishedAfter` att K01 och BARA K01 står schemalagd. Sedan en kampanj i taget enligt
   `klaviyo/innehall/matstrumpor/KALENDER-2026.md`; F06 E1/E2 ligger kvar tills
   `SEG_oengagerade_180d` har medlemmar.
6. ✅ **Planen är betald sedan 2026-09-26** (mätt med `whoami` samma eftermiddag: `plan: Paid`,
   `monthlyEmailsLimit: 0` = obegränsat, 5 mejl skickade i september). November-toppen
   (K07–K10 ≈ 11 600 mejl) kräver alltså inget planbyte längre.

## Mätt 2026-09-26 eftermiddag (session på ett annat Claude-konto, samma Spoks-användare)

Spoks-connectorn fungerar från vilket Claude-konto som helst där den är kopplad: `whoami`
svarar samma MCP-användare `kundsupport@baverbutiken.se` och samma två workspaces.

- **Flödena:** alla sex `isActive: true`. Inrullade: F01 3, F04 5, F05 5, F07 5, F02 0, F03 0,
  inga avslutade än.
- **K01:** fortfarande `status: draft`, `publishDate: null` — inte schemalagd.
- **SEG_samtycke:** 2 930 (`preview_segment` med segmentets filter: alla i sampeln
  `emailMarketingConsent: subscribed`, `emailMarketingCanReceive: true`). 39 till har samtycke
  men kan inte ta emot (`emailMarketingCanReceive: false`, spärrade eller studsade) — de är
  redan utanför segmentet eller hoppas av Spoks själv.
- ⚠️ **Fältet `subscriptionStatus` i Spoks sampel är INTE mejlsamtycket.** Samma kontakter
  som har `emailMarketingConsent: subscribed` står som `subscriptionStatus: not_subscribed`
  (det är Spoks eget följarfält). Döm aldrig ett segment som fel på `subscriptionStatus` —
  läs `emailMarketingConsent` och `emailMarketingCanReceive`.
- **Fonten är Mochiy Pop P One igen** (`get_settings`: `headerGoogleFontFamily` och
  `regularGoogleFontFamily` = Mochiy Pop P One, reserv Arial Black) — någon har satt den i appen
  efter bygget. Tilt Warp + Nunito Sans nedan är alltså historik.

### Slutkollen av K01 före schemaläggning (workflow `k01-forhandskoll`, 2026-09-26)

Tre granskare (fakta mot butiken, länkar, copy mot källan) och två skeptiker per påstått fel.
Inget som stoppar utskicket:

- **Priset 399 kr stämmer** (`/products/sushi-strumpor.json`: 5 par 399,00, jämförpris 399,00 =
  ingen rea; 3 par 369 kr nämns inte). Fem par, ätpinnar av trä, onesize 36–44 står i
  produktbeskrivningen; 30 dagars retur står i `/policies/refund-policy`.
- **Båda recensionerna finns ordagrant i Judge.me** (widgeten i `klaviyo/recensioner.mjs`,
  produkt-id 10286130889043): "Jätte sköna strumpor" (Anonym, 5, verifierad, 2026-09-25) och
  "Underbara strumpor, mottagaren vart så glad." (Kent, 5, verifierad, 2026-09-16).
- **Alla länkar svarar 200**; produktkortets `1r46tp-qx.myshopify.com`-länk gör en 301 till
  matstrumpor.se. Bilden på storage.spoks.com svarar 200 (JPEG 800×800).
- **Texten är källfilen ordagrant**, inga tankstreck, ingen leveranstid, bara förnamnstoken.
- Produkten säljs med lagerpolicy CONTINUE (minussaldo), så "i lager" bevisar inget — men
  76 av 95 sushiordrar sedan 5/9 var skickade, och alla oskickade var från samma dag.

**Går bara att se i förhandsvisningen** (get_campaign visar inte fälten): att "Avregistrera dig"
står längst ner (`isOptOutEnabled` returneras aldrig av `get_campaign`, varken hos Matstrumpor
eller Bäverbutiken), att produktkortet har knappen "Till sushilådan" och att priset inte ritas
överstruket. Därför skärmdumpen före sista klicket.

**Publiken — Spoks egen uppvärmning:** hjälpartikeln *Warm-up guidelines*
(help.spoks.com/en/articles/15693117, läst 2026-09-26) säger "The first segment is your 2 500
warmest contacts, and each segment doubles from there", att segmenten "appear as recipient
options when you choose who a campaign goes to" (de syns inte under Contacts och inte i
`get_segments` — Matstrumpor hade inga Warmup-segment vid mätningen), att flöden inte räknas,
att nästa steg låses upp cirka 24 h efter förra utskicket beroende på betyget, och att gränserna
bara försvinner om man väljer "I'll handle warmup manually". **Sessionens val: K01 till Spoks
"Warmup tier 1" om den finns bland mottagarvalen, annars SEG_samtycke (2 930).** Skillnaden är
cirka 430 kontakter; kalenderns trappa (K01–K02 uppvärmning) är Klaviyos och ersätts i Spoks av
plattformens egen.

**Ej rättat (Spoks svarade "Rate limit exceeded" och sessionen slutade anropa):**
- Faktakolumnen har rubriken **"Ångerrätt"** över "30 dagars returrätt". Lagens ångerrätt är
  14 dagar; butikens 30 dagar är öppet köp (produktsidan: "30 dagars öppet köp"). Rubriken är
  hårdkodad i `spoks-paket.mjs:230` (och `mallar.mjs:533/651/875`, som Bäverbutiken delar). Förslag:
  brandfält, "Öppet köp" för Matstrumpor, och rätta utkasten K02–K14 med
  `update_draft_campaign_blocks`. Flödesmejlen är live och ändras inte utan att stängas av.
- `isOptOutEnabled: true` på K01 (försöket stoppades av rate limit) — onödigt om förhandsvisningen
  redan visar "Avregistrera dig". **Mätt samma eftermiddag i Axels skärmdump av F06 E2** (byggd av
  samma motor, utan `isOptOutEnabled`): sidfoten visar "Avregistrera dig" + klubbtexten, och
  rubrikerna ritas i Mochiy Pop P One. Sidfoten kommer alltså från workspacens inställning.
- F06 E2 (`662420f3`, källan `innehall/matstrumpor/floden/f06-sunset.json:90`) saknar ett
  kommatecken: "hör vi inget nu tar vi bort dig" ska vara "hör vi inget nu, tar vi bort dig".
  Rätta källan och Spoks-utkastet i samma körning (inte medan Axel har utkastet öppet i appen).
- ⛔ **F06 E2 SCHEMALAGD AV MISSTAG 2026-09-26 11:14 CEST** (mätt med `get_campaign` +
  `search_campaigns publishedAfter` 11:2x): `status: waiting_to_be_published`,
  `publishDate 2026-09-29T16:00Z` (= tis 18:00), `notify: true` — "Sista mejlet om din plats i
  klubben" i stället för K01, som fortfarande är utkast. Inget annat var schemalagt. **MCP:n kan
  inte ta bort en schemaläggning** (`update_draft_campaign` kräver `draft`, inget verktyg för
  unschedule); Axel ombedd att ta bort den i appen (hjälpartikeln *Scheduling an email campaign*:
  schemalagda ligger under Campaigns → fliken **Planned**; hur man avbryter står inte där).
  Kontroller schemalagda i den här sessionen: `trig_013G65e8CvGdpybAJctqjCMc` mån 28/9 09:00
  och `trig_019jHo4yKekS39zXBqZtkfmq` tis 29/9 12:00 CEST (`send_later`).
  Axels skärmdump visade publiken: **SEG_samtycke (2 942)**. ✅ **Återställd 12:44 CEST samma dag**
  (Axel: "Jag har flyttat till utkast", via menyn på den schemalagda kampanjen; mätt med
  `search_campaigns publishedAfter`: `status: draft`). Utkastet bär nu publiken SEG_samtycke —
  schemaläggs det igen av misstag går det till alla. Appens knappar på en schemalagd kampanj:
  etiketten "Schemalagd kampanj", pillret "Kommer att publiceras tis. 29.09 kl 18:00 CEST
  (UTC+2)" med penna, menyn "•••" och "TITTA IGENOM"; mottagarna väljs i fältet "Till:".
  **Publiken för K01 är SEG_samtycke** (sessionens beslut samma dag): Spoks tog emot en
  schemaläggning till 2 942 utan uppvärmningsspärr, och SEG_samtycke är det enda segmentet som
  är mätt att bara innehålla samtycke — "Warmup tier 1" är omätt i Matstrumpors workspace.
- ✅ **K01 SCHEMALAGD 2026-09-26 12:49 CEST av Axel, kontrollerad av sessionen:**
  `search_campaigns publishedAfter` → K01 `waiting_to_be_published`, `publishDate
  2026-09-29T16:00Z` (tis 18:00), och ingen annan kampanj schemalagd (F06 E2 `draft`).
  **Kontrollerat igen 2026-09-28 07:01 UTC** av rutinen "Kolla Matstrumpors schemalagda mejl"
  (`trig_013G65e8CvGdpybAJctqjCMc`, samma `search_campaigns publishedAfter 2026-09-25`): K01
  `waiting_to_be_published` `2026-09-29T16:00Z`, F06 E2 `draft` — rätt, inget att göra.
  **Sista kollen 2026-09-29 10:20 UTC** (`trig_019jHo4yKekS39zXBqZtkfmq`, samma fråga): K01
  `waiting_to_be_published` `2026-09-29T16:00Z`, F06 E2 `draft`, K15 publicerad 28/9 09:18 UTC,
  inget annat schemalagt — rätt, inget att göra. K01:s titel i Spoks säger fortfarande
  `uppvarmning_steg1` (en schemalagd kampanj går inte att ändra via MCP:n); publiken är
  SEG_samtycke enligt ovan, och källfilen säger samtycke sedan samma dag.
  **Publiken mätt** med `update_segment` på SEG_samtycke UTAN `acknowledgeWarnings` och med
  identisk beskrivning (`applied: false`, inget ändrat): `postsUsingSegment` = K01 (schemalagd)
  + F06 E2 (utkast). Det är det enda sättet via MCP:n att se vilken publik en kampanj har —
  `get_campaign` visar den inte. Bäverbutikens K01 "Taket du aldrig går upp och kollar"
  `51c37c20-…` står också schemalagd till samma tid (mätt samma minut).
- **Mätt 2026-09-27 08–09 CEST (Axels fråga "går mejlen ut, hur ser kundresan ut"):**
  hela kundresan står i **`klaviyo/innehall/matstrumpor/KUNDRESA.md`** och på sidan
  *Kundresan Matstrumpor* (artifact, länk i chatten). Kort: `sendCounts.currentMonthEmails`
  **39**; F01 E1 **37 mottagare / 14 öppnade / 4 klick / 0 köp**; F02 E1 0 skickade (9
  inrullade); **F03 0 inrullade på 27 h** (hypotes: Spoks identifierar besökaren först efter
  ett mejlklick — läs av efter K01, supportärende om 0 kvarstår 6/10); F04 49, F05 49, F07 45
  inrullade; 0 kampanjer skickade. Shopify 14 d: 239 ordrar, 238 kunder, **6 återkommande
  (2,5 %)**, 193 av 238 köpare SUBSCRIBED (81 %). Förra säsongen (första köp nov 25–mar 26):
  3 277 kunder, **2 414 SUBSCRIBED i dag** — de får inget flöde, bara kampanjer.
  **Nytt segment `SEG_kopare_forra_sasongen` `0d1fa31d-993b-40cb-85e2-aa78356b174f`**
  (samtycke + `firstPurchase` 2025-11-01…2026-04-01, 2 415) — `firstPurchase` ÄR synkat från
  Shopify för importerade kontakter, till skillnad från händelserna. Kalendern ändrad: K04
  → samtycke, **K05–K06 → kopare_forra_sasongen**, K03 engagerade 60 d om ≥ 300 annars
  samtycke (`KALENDER-2026.md`). ⚠️ Kampanjtitlarna i Spoks bär fortfarande de gamla
  segmentnamnen (`… · engagerade_90d · …`) — rättas med `update_draft_campaign` i onsdagens
  runda, en i taget. ⚠️ `whoami` visar nu **tre** workspaces: **Carashell
  `38f3d430-690c-4c0b-8419-8ec2e5272148`** — inbjudan gjord; uppladdningen är en egen
  session (`PROMPT-carashell-upp.md`, steg 0 kan nu gå vidare).
- **Klubbkänslan (Axels beställning 2026-09-27: "utvalda, urgent, slumpmässigt, inte alla
  får vara med"):** klubben är i dag öppen (sidfoten + kassans ruta, 81 % av köparna blir
  medlemmar), så "inte alla får vara med" är osant tills en mekanik gör det sant. Tre
  förslag, alla Axels beslut eftersom de kostar pengar eller lager: **A Förtur** (varje
  släpp + Black Week ett dygn före sajten — den automatiska rabatten startar sön 22/11 18:00
  och bara klubben får veta), **B Dragningen** (tio medlemmar dras slumpmässigt varje tisdag
  ur veckans mottagare, får en låda, eget mejl "du drogs"; riktig slump = ett skript över
  segmentet, aldrig påhittat), **C Medlemsreserven** (X lådor hålls undan för klubben till
  8/12 — sant bara om lagret faktiskt hålls undan). Copyn skrivs om (F01 E1, K05–K08) av en
  Sonnet-subagent enligt regel 6 FÖRST när Axel valt, så varje "utvald"-rad är falsifierbar.
  **Axels riktning samma förmiddag:** lutar åt **B (dragningen)**, med villkoret att
  vinnarna skickar bilder på sig själva med strumporna som får användas i mejl och annonser
  ("vi har noll kundbilder"), och att **Evolve-boten frågas först** (`klaviyo/evolve/FRAGOR.md`
  fråga 9; svaret sparas i `SVAR.md`). ROI-ramen: en låda kostar 80,61 kr inköp + 2,9 EUR
  tull per försändelse (≈ 33 kr) + frakt till kund (okänd, står inte i konfigen) ⇒ cirka
  115 kr + frakt per vinnare, ~1 150 kr + frakt i veckan för tio; jämför 5 000–20 000 kr per
  influencersamarbete (`stonebite/profil.json`). Mäts som (1) klick och köp i mejlen med
  vinnarbilder mot mejlen utan, (2) annonserna byggda på bilderna genom vanliga
  analysmetoden (vinstbidrag), (3) återköp bland medlemmar dec 2026 mot dec 2025. Spärrar
  som inte förhandlas: deltagandet är gratis och kräver inget köp (annars ett lotteri som
  kräver licens, spellagen), bildtillstånd i skrift i svaret ("bilden får användas i
  Matstrumpors mejl och annonser"), bara vuxna på bilderna, dragningen görs av ett skript
  över medlemslistan med loggat frö (aldrig handplockat), vinnarna namnges bara med förnamn
  och ort och bara med deras ok. Inget byggs förrän Evolves svar lästs och Axel sagt kör.
  **Evolves svar (samma förmiddag, `klaviyo/evolve/SVAR.md` svar 9) ändrar planen på tre
  punkter:** (1) exklusivitet kommer av TILLGÅNG, inte tur ⇒ **A Förtur är kärnan** (förra
  säsongens köpare får allt först: Black Week, restock, sista chansen), **B Dragningen är
  krydda** ovanpå; (2) dragningen ska ge intäkt: på dragningsdagen får icke-vinnarna ett
  tröstpris med 72 timmars gräns ("makes a lot of money") — ett tröstpris är en rabatt ⇒
  Axels beslut, frågan ställd; utan rabatt är trösten förturen; (3) måttet är LTV/återköp,
  inte öppningar: återköp per medlem dec 2026 mot dec 2025, plus tröstprisets intäkt 14
  dagar mot lådornas kostnad. Kundbilder: räkna med ojämn kvalitet, ge vinnarna tre
  exempelbilder utan manus. **Mätt i Shopify för "slå förra årets erbjudande":** okt 2025–feb
  2026 hade i praktiken **noll rabattkoder** (1 av 134, 0 av 52, 1 av 1 613, 0 av 799) men
  **141 kr rabatt per order i december** (AOV 366 kr) — rabatten låg som automatisk rabatt,
  inte kod. I dag bär 228 av 239 ordrar en Köp 1, få 1-kod. Förra årets köpare är alltså
  vana vid ett gratis-låda-erbjudande; årets julerbjudande till dem måste vara synligt
  bättre eller komma tidigare/först (förturen) för att dra tillbaka dem. Black Week-frågan
  A/B/C (`klaviyo/README.md`) hänger ihop med det här och står fortfarande öppen.
- **Nästa steg (påminnelse `trig_01AoYRfSaHJzbEicy2x49r9h`, ons 30/9 10:00 CEST):** K01:s
  statistik i båda butikerna, rätta "Ångerrätt" + F06 E2:s kommatecken (ovan), förbered
  Bäverbutikens K02 (tor 1/10) och Matstrumpors K02 (tis 6/10) med länk, utseende och publik.
  Kvar som Axels beslut/klick utan datum: CaraShells Spoks-inbjudan (rubriken CaraShell ovan)
  och Matstrumpors Black Week A/B/C (`klaviyo/README.md` → Black Week).
- **Recensionsflödet:** Matstrumpor HAR INGET (aldrig byggt — flödena är F01–F05, F07; F06 som
  utkast). Det enda är Bäverbutikens **F14 Recension Trustpilot** `23d2710c-…` i workspacen
  Bäverbutiken.se, mätt `isActive: true`, 24 inrullade (https://app.spoks.com/baverbutiken/flows/23d2710c-1a33-44c3-bb25-df1f691b6161).
  ⚠️ Samma mätning: ALLA Bäverbutikens flöden är live sedan 07:02–07:05, plus "F04 Efter köp v2
  (kredit)" `bfc5beee-…` — beskrivet av en annan session i commit `20dfe3d7` (ej på `main` vid
  mätningen); tabellen överst i den här filen säger fortfarande "Allt är INAKTIVT".
- ⚠️ Axel öppnade F06 E2 i tron att det var K01. Direktlänken är rätt (`get_links` →
  `send_campaign`: `https://app.spoks.com/matstrumpor/post/{postId}/edit`). Beskriv alltid hur
  mejlet ser ut (K01: stor bild på sushilådan, rubriken "Ser ut som sushi. Är strumpor.").

## Klubbdragningen — F08 (byggd 2026-09-27; v2 med tre vinnare + video samma eftermiddag)

Axels beslut 2026-09-27 (alternativ B efter Evolves svar 9): medlemmar dras varje tisdag
och får sushilådan, mot något Matstrumpor får använda i mejl och annonser. **Förmiddagen:
tio vinnare mot en bild på sig själva. Eftermiddagen, innan första testet körts (Axel:
"ändra så det blir 3 kunder, men dessa kunder måste då göra ugc videos eller bara göra
videos där de säger någon mening om produkten", sedan "Så kör vi"): TRE vinnare mot en
kort video** på sig själva med strumporna där de säger en mening om dem (UGC om de vill,
tio sekunder räcker). Förturen är kärnan (Evolve), dragningen krydda och intäktsmaskin.
Kommandot: **`/klubbdragning`** (`.claude/commands/klubbdragning.md`: torrt / `test <e-post>`
/ `kör`).

**Kedjan:** `klaviyo/klubb/dragning.mjs` (konfig `klaviyo/brands/matstrumpor.json` →
`klubb.dragning`, `antal: 3`) läser alla SUBSCRIBED-kunder ur Shopify (mätt 2026-09-27
förmiddag: 2 966, varav 2 768 med adress, 1 på egen domän = testkunden
`axel.odhner@stonebite.org`, 0 utanför Sverige; andra torrkörningen samma eftermiddag:
2 979 prenumeranter, 2 978 kandidater, 198 utan adress), drar med HMAC-SHA256(frö,
kund-id) stigande och loggar frö + kandidathash i `klaviyo/konto/matstrumpor/dragningar.jsonl`
(kund-hash och ordernamn, inga personuppgifter). Skarpt, per vinnare: draft order med lådan
(variant `gid://shopify/ProductVariant/52506473365843`, 100 % rabatt "Klubbdragningen
<datum>", fraktrad 0 kr, ordertaggar `klubb-dragning` + `klubb-dragning-<datum>`) → slutförs
till en 0-kronorsorder när adress finns (utan adress står utkastet kvar med noten ADRESS
SAKNAS, VA:n slutför när kunden svarat) → kundtaggar `klubb-vinnare` + `klubb-vinnare-<datum>`.
Skriptet vägrar om totalen inte är 0, om samma datum redan dragits skarpt (`--igen` krävs)
och läser aldrig annat än SUBSCRIBED; `--test <e-post>` kör kedjan på EN egen adress.
9 tester (`klaviyo/test/dragning.test.mjs`). Shopify-fälten avlästa med introspektion:
kunden sätts via `purchasingEntity.customerId`, frakten via `shippingLine.priceWithCurrency`,
`draftOrderComplete` tar bara `id`. VA:n sätter kundtaggen **`klubb-video-klar`** när videon
kommit (hette `klubb-bild-klar` i v1), då tystnar E2/E3.

**Flödet i Spoks, v2:** **F08 Klubbdragningen (vinnarna) · FLOW_tagg_klubbdragning_v2**
`1a3263e1-a12d-45dc-8e40-2f8b8bf85313`
(https://app.spoks.com/matstrumpor/flows/1a3263e1-a12d-45dc-8e40-2f8b8bf85313), trigger
`contact_tags_added` med triggerfilter `tags in [klubb-vinnare]`, inget återinträde (Spoks
tillåter inte det på den triggern). Steg: väntan 0 (`916387a6`) → **E1** "Du är en av tre
i dag" (steg `a978e20b`, post `55cddb09-fb18-4c96-95e6-14199cf41256`) → väntan 12 d,
tidigast 09:00 (`4c4c2cc8`) → **E2** "Vi väntar på din video" (steg `3b95381e`, post
`7ff0c5d5-93ac-411b-807e-ecdac7475201`) → väntan 6 d, tidigast 09:00 (`969e12bf`) → **E3**
"Sista påminnelsen om videon" (steg `ac31ad91`, post `bf9e74b3-b86b-4b64-92c1-aef439f57c3f`).
Alla tre sändstegen bär filtret `tags nin [klubb-video-klar]`. Mejlen fyllda 14:12–14:13
CEST med samma blockordning som motorn ger (`spoks-paket.mjs --offline`: 10 / 5 / 4 block).
⚠️ **v1 `27047445-dcab-4898-9f92-5f55f2b77be3`** (tio, bild, `klubb-bild-klar`) byggdes
07:38–07:52 UTC och **slogs på av Axel 13:37 CEST med alla tre stegen** innan ändringen kom.
Ett aktivt flöde går inte att ändra via MCP:n: `update_flow`, `update_flow_step` och
`update_draft_campaign` kräver alla ett inaktivt flöde med avstängt steg, och inget verktyg
kan slå av ett flöde (mätt i verktygens scheman 2026-09-27). Därför v2 i stället för lappning.
**v1 ska stå AV** (Axels klick) innan något körs skarpt: två aktiva flöden på samma tagg är två
E1 till samma vinnare. Kommandots steg 2 kräver v2 aktivt OCH v1 inaktivt. v1 kan raderas i
appen efteråt (MCP:n kan inte). Innehållet: `klaviyo/innehall/matstrumpor/floden/f08-klubbdragning.json`
(v2: en andra Sonnet-subagent mot `docs/copy-regler.md`, 0 ❌, huvudsessionen ändrade
ingenting; v1 av den första). Motorn `spoks-paket.mjs` har triggertypen `tagg`, filternyckeln
`utan_tagg:<tagg>` och F08:s namn (3 tester i `spoks-klubb.test.mjs`); `ladda-upp.mjs` hoppar
tagg-flöden (finns bara i Spoks). Inget faktablock i vinnarmejlen: rubriken "Ångerrätt" hör
inte hemma i ett gåvomejl.

✅ **Mätt 2026-09-27 14:40–14:42 CEST: Spoks avfyrar `contact_tags_added` för en tagg som
sätts i SHOPIFY.** Testet `/klubbdragning test axel.odhner@stonebite.org --skarpt` (kommandots
steg 3) skapade utkastet **#D101** utan adress och satte taggen `klubb-vinnare` +
`klubb-vinnare-2026-09-27` på Axels kund 14:40:54 CEST; `get_flow` på v2 inom två minuter:
`contactsEnrolledCount: 1` och `waitingContactsCount: 1` vid dag-12-väntan, alltså har
kontakten passerat väntan 0 och sändsteget E1. Inget mejl gick ur v1 (triggern av, stegen
av). Reservvägen (`order_created` + `orderTags in [klubb-dragning]`) behövs alltså inte.
Före testet var det omätt: taggarna som DATA synkades (`preview_segment tags is` gav 640
kontakter med Shopify-taggar som "Login with Shop"), men händelsen var inte bevisad.
⚠️ Steg 2 vid testet: v1 stod `isActive: true` på flödesnivå men med `trigger.isActive:
false` och alla tre sändstegen `isEnabled: false` (Axels klick 14:39 CEST). **Läs
`trigger.isActive` och stegens `isEnabled`, inte flödets `isActive`:** Axel slog av flödet i
appen två gånger (14:39 och igen 15:1x efter en ny uppmaning) och `isActive` stod kvar på
`true` båda gångerna — appens reglage syns som `trigger.isActive` i API:t, flödets `isActive`
verkar betyda "har aktiverats". Med triggern av tar v1 inte in någon och med stegen av
skickar det inget; det räckte, testet kördes. Kommandots steg 2 mäter därför triggern.

**Kända sidoeffekter, accepterade:** 0-kronorsordern rullar också in vinnaren i F04 (dag 3
"på väg", dag 13 "kom allt fram?") och F07 (dag 21 "en låda till") — inga krockar med
E1/E2/E3 (dag 0/12/18). Ordern räknas som en order i Shopify: räkna bort taggen
`klubb-dragning` i återköpsmätningar. Om Shopify mejlar en orderbekräftelse vid
`draftOrderComplete` är omätt, därför säger E1 "det KAN komma en orderbekräftelse där summan
är noll" (bygg.mjs tillåter inte ens "0 kr" i löptext).
Autosvaret för Matstrumpor är torrt; innan det slås skarpt: kontrollera att ett svar med
video (bilaga ⇒ SVÅR) och ett "nej tack" går till VA:n, och att ett adressvar inte tas som
adressbyte av boten.

**VA:n:** SOP `kundtjanst/va-sop/club-draw-winners.md` ("Club draw winners — videos,
consent, missing addresses", raden ligger i `notion.json` utan `notion_id` och publiceras
med `node kundtjanst/va-sop/skriv.mjs --bara club-draw-winners.md` när flödet ska på):
fem svarstyper (video med personen och en mening / video utan person, utan mening eller
en bild / adress / nej tack / barn), fem svenska mallar, videon + samtycket som kommentar
med bilaga på orderns tidslinje i Shopify (för stor fil ⇒ Drive-länk i kommentaren), taggarna
`klubb-video-klar` / `klubb-video-namn-ok` / `klubb-tackade-nej`. Vinnarnas svar landar i
kundsupport@matstrumpor.se (Spoks reply-to, `get_settings`).

**Kampanjerna:** blocket "Veckans dragning" (`klaviyo/innehall/matstrumpor/VECKANS-DRAGNING.md`,
Premiär första gången, sedan Återkommande, båda omskrivna för tre + video) läggs sist i varje
tisdagskampanj från och med den första skarpa dragningen — aldrig en tisdag utan dragning.
K01 (29/9, schemalagd) rörs inte; K02 (6/10) är första kandidaten. Vinnarvideor med skriftligt
ja byts in i blocket (förnamn + stad bara med taggen `klubb-video-namn-ok`), uppladdade med
`upload_media` (Spoks har ett videoblock).

**Tröstpriset (Axels beslut 2026-09-27: "kredit i vår butik, 100 eller 200 kr, under
Black Friday, till alla som aldrig vunnit"):** byggs i november som en Shopify-rabatt
(fast belopp, 72 h, minsta köp en låda) till Spoks-publiken samtycke + `tags nin
[klubb-vinnare]`. Marginalen på en 399-kronorsorder med Köp 1, få 1: kostnad ≈ 154 kr
(två lådor 120,92 + tull 2,9 EUR) ⇒ ≈ 245 kr före frakt; 100 kr kredit lämnar ≈ 145 kr,
200 kr lämnar ≈ 45 kr (troligen förlust efter frakt). Rekommendation 100 kr; beloppet är
Axels. Black Week-trappan A/B/C (`klaviyo/README.md`) hänger ihop med det.

**Kostnad:** tre lådor i veckan ≈ 80,61 kr inköp + ≈ 33 kr tull per låda + frakt ⇒ ≈ 345 kr
+ frakt per vecka (`matstrumpor/konfig.json`; tio lådor hade varit ≈ 1 150 kr). Mäts som
(1) klick och köp i mejl med vinnarvideor mot utan, (2) annonserna byggda på videorna med
vanliga analysmetoden, (3) medlemmarnas återköp dec 2026 mot dec 2025 (`KUNDRESA.md` §5).

**Spärrar (förhandlas inte):** deltagandet är gratis och kräver inget köp (annars lotteri
enligt spellagen); aldrig handplockat; en skarp dragning per datum; inga namn i repot,
Discord eller Notion; förnamn + stad bara med vinnarens ja; bara vuxna på video; skarpt utan
aktivt v2-flöde (eller med v1 fortfarande på) = fel, kommandot stoppar i steg 2.

**Axels klick, i ordning (läget 2026-09-27 14:45 CEST):** ✅ (1) v1 av 14:39 (`trigger.isActive:
false` + tre sändsteg av; flödets `isActive` står kvar `true` i API:t, det är inte reglaget); ✅ (2) v2 på med alla tre
sändstegen 14:39; ✅ (3) testet kört 14:40, kontakten inrullad, VA-SOP:en i Notion
(`3e8270ab-908c-817c-a874-f5e538f8339e`); Axel bekräftar E1 i sin inkorg; (4) säg "kör" en
tisdag morgon ⇒ första skarpa dragningen, tisdagens kampanj får Premiär-blocket samma
kväll; ✅ (5) beloppet på tröstpriset: 100 kr (Axels beslut 2026-09-27 kväll, V01 v2 säger det till klubben); ✅ (6) länken till Judge.me:s
butiksrecension (avsnittet Recensionerna nedan). En rutin (tisdag 07:30, `/klubbdragning
kör`) byggs först när det gått rätt tre veckor för hand (Arvids princip). Testkunden bär nu
taggen `klubb-vinnare`: ett nytt test kräver att taggen tas bort i Shopify först (skriptet
säger det självt), och utkastet #D101 kan raderas i Shopify när Axel läst mejlet.

## Recensionerna — K15 Butiksrecensionen + F09 Recensionen (byggda 2026-09-27, inget påslaget)

Axels två frågor samma eftermiddag: "Kan du inte också bara göra en kampanj som bara är att
folk ska lägga en butiksrecension?" och "Vi har inte heller något flow för att samla in
recensioner?????". Svaret på den andra: nej, Matstrumpor hade inget (F01–F05, F07, F08; bara
Bäverbutiken har F14 mot Trustpilot). Judge.me finns på matstrumpor.se (Core +
Recensionsmedaljer, 8 recensioner på sushilådan mot 3 911 ordrar) men ingen
`JUDGEME_API_TOKEN` för butiken, så om Judge.me:s egna recensionsmejl är på går inte att läsa
härifrån; siffran säger att de i praktiken inte drar.

**Länken (löst 2026-09-27 kväll):** en butiksrecension lämnas via Judge.me:s **delbara
recensionslänk** `https://judge.me/product_reviews/49abef4a-9c95-484f-ade2-4242ec2fc5e1/new?source=shareable-link`,
som Axel hämtade i Judge.me (Settings → Request reviews → Links, QR codes and point of sale
review collection) och klistrade in i chatten. **Verifierad i headless Chromium samma kväll**
(curl räcker inte, sidan är en Vue-app; Chromium kräver
`--ignore-certificate-errors-spki-list` med proxy-CA:ns nycklar eftersom containerns proxy
skriver om TLS): formuläret heter "Granska ditt senaste köp från Matstrumpor.se", frågar först
efter ett produktnamn och har knappen **"Eller skriv en butiksrecension"** under
(`template_enables_shop_reviews: true` i sidans inbäddade inställningar). Den knappen ÄR
butiksrecensionen, så K15 och F09 säger åt kunden att välja den. Butikssidan
`judge.me/reviews/matstrumpor.se` (och `…/reviews/stores/…`, `/pages/reviews`,
`/apps/judgeme/reviews`) svarar fortfarande 404: listningen är inte påslagen och behövs inte
med den här länken (den kan slås på under Settings → Google, SEO and AI → Judge.me Reviews
Site → Enable store listing om Axel vill ha en publik butikssida). Review links är publika
(vem som helst med länken kan recensera, `review_verification_flow_enabled: true` mejlar en
verifiering), därför bara köpare i publiken.

**K15 Butiksrecensionen:** Spoks-utkast `45e8e354-8672-4e83-ac11-c8b2ee3e3b85`
(https://app.spoks.com/matstrumpor/post/45e8e354-8672-4e83-ac11-c8b2ee3e3b85/edit), ämne A
"Maten är påhittad. Butiken är inte." (B "Skrattade du när paketet kom?", C "Landade skämtet,
eller inte?"), hero med sushilådan, **stjärnraden** (se nedan), "Ingen inloggning. Bara du,
stjärnorna och lådan." + grundarraden (svara på mejlet om något blev fel). Titeln i Spoks är
`K15 · kopare · Maten är påhittad. Butiken är inte.` (datumet 1/10 struket: Axel vill skicka
samma dag, 2026-09-27). Publik **SEG_kopare** (Axel väljer i appen). Innehållsfilen säger dessutom "utom SEG_oengagerade_180d", men det segmentet
kräver minst fem mottagna mejl och hade **0 medlemmar** vid mätningen 2026-09-26 — så bara
SEG_kopare är samma publik i dag, och Axel slipper leta efter en uteslutning i appen (beslutat
2026-09-27 kväll när instruktionen visade sig obegriplig). Uteslutningen blir aktuell först när
segmentet fått medlemmar, dvs. efter fem kampanjer. Innehåll
`klaviyo/innehall/matstrumpor/kampanjer/k15-butiksrecension.json`, `status_plan: kraver-axel`.

**Stjärnraden + betygssidan, v1 — ⚠️ mellansidan ersatt 2026-09-28, se stycket efter F09 (Axels order 2026-09-27 kväll: "5 stjärnor och jag kan länka på
varje så de bara trycker på en av stjärnorna sen kommer dom till recensionsformuläret … en
animation när man trycker på stjärnan och nån rörelse så det syns att man interagerar … jag
vill ha en annan knapp").** Knappen är borta ur K15. I stället: h2 "Hur många stjärnor får
butiken bakom lådan?", ett **h1-block med fem ★ som var och en är en inline-länk** till
`https://matstrumpor.se/pages/betyg?s=1` … `?s=5` (block `4dba0842`; en länk per stjärna, så de
går att ändra var för sig i Spoks redigerare, i redigerarens länkfärg #dd821d) och hjälpraden
"Klicka på en stjärna, så öppnas formuläret. 1 är dålig och 5 är bra." Motorn: blocktypen
`stjarnor` i `spoks-paket.mjs` (`stjarnLankarSpoks`: `{n}` i länken ⇒ en adress per stjärna,
annars Trustpilots `?stars=N`) och samma regel i `mallar.mjs stjarnLankar`. **Ett mejl kan inte
köra skript, så rörelsen bor på betygssidan** `https://matstrumpor.se/pages/betyg`
(`klaviyo/recension/betygssida.mjs`, Shopify-sidan `gid://shopify/Page/183830806867` med mallen
`page.betyg` + `layout/betyg.liquid` utan header/footer/meny, `content_for_header` kvar,
noindex; skrivna 2026-09-27 14:51 UTC via Fabrikens app, lästa tillbaka lika): sidan läser
`?s=`, tänder stjärnorna en i taget med en pop-animation, den valda störst med skugga, en orange
linje växer under, rubriken blir "Tack! N av 5." och efter 1,5 s skickas kunden till Judge.me-
länken (250 ms och ingen animation vid `prefers-reduced-motion`; synlig reservlänk om inget
händer; utan `?s=` är sidan en egen betygssida med fem klickbara stjärnor). **Alla fem stjärnor
går till SAMMA formulär** (`granskaPublik` stoppar annars; ingen review gating), och Judge.me
kan inte förfyllas med betyget (`?rating=` mätt utan verkan), så sidan säger att stjärnorna
sätts en gång till i formuläret. Mätt live i headless Chromium 2026-09-27: vid 400 ms
virtuell tid var fyra stjärnor tända, rubriken "Tack! 4 av 5.", inga temasektioner; vid 900 ms
hade sidan landat på Judge.me ("Judge.me Product Reviews"). Länken byts på ETT ställe:
`klaviyo/brands/matstrumpor.json` → `butiksrecension.judgeme_lank`, sedan `betygssida.mjs
--skarpt`. ⚠️ F09:s båda mejl har kvar knappen: flödet slogs på av Axel innan stjärnraden
fanns, och ett aktivt flöde går inte att ändra via MCP:n — stjärnor i F09 kräver en v2 (nytt
flöde) och Axels byte, som F08.

**F09 Recensionen (butiksomdöme) · FLOW_order_recension_v1** `4321f0d9-6c9a-4910-8444-743f1c5c6c75`
(https://app.spoks.com/matstrumpor/flows/4321f0d9-6c9a-4910-8444-743f1c5c6c75), ✅ **PÅSLAGET av
Axel 2026-09-27 14:16:54 UTC** (mätt med `get_flow` 14:40 UTC: `isActive: true`,
`trigger.isActive: true`, båda sändstegen `isEnabled: true`, 2 kontakter redan inrullade och
väntar vid 16-dygnssteget):
trigger `order_created` med kontaktfiltret kundundantag (`emailMarketingConsent in [subscribed,
not_subscribed]` och `state ne suppressed`, samma som motorn ger i `floden.json`), återinträde
P90D. Steg: väntan 16 d tidigast 18:00 (`3c07bad0`) → **E1** "Fortfarande strumpor när du
öppnade?" (steg `73d66227`, post `c5c8085c-7ddd-40a4-91ca-747ef25be2a6`) → väntan 7 d tidigast
18:00 (`7db4b838`) → **E2** "Lådan kom fram. Mejlet kanske inte." (steg `254732dc`, post
`dfab661f-34f8-44e2-9519-b3c0db58d9e2`) med stegfiltret `clickedEmail eq 0` för flowId = F09
(den som klickat i E1 får ingen påminnelse; motorn kan inte uttrycka stegfilter, det står i
Spoks och i memo). Innehåll `klaviyo/innehall/matstrumpor/floden/f09-recension.json`; motorn
har `FLODESNAMN['f09-recension']`. Timingen är Bäverbutikens F14 (16 d); Matstrumpors p90 för
leverans är 15 dygn.

**Copyn:** Sonnet-subagent mot `docs/copy-regler.md`. Rev 1 stoppades av byggaren på 15 rader
("Hur blev det?", "Kom paketet fram som det skulle?", "Missade du den här?" kunde vilken butik
som helst skriva); rev 2 gav 0 ❌ genom att hänga varje rad på lådan, avslöjandet eller ordet
"påhittad". Huvudsessionen bytte EN rad: knappen "Betygsätt lådan" → "Betygsätt butiken bakom
lådan" (länken går till butiksrecensionen, inte produkten). Ingen belöning, ingen styrning av
betyget (review gating), alla stjärnor till samma länk.

**2026-09-28: mellansidan bort, stjärnorna direkt till Judge.me, K15 v2.** Axels dom på
morgonen, med skärmdump av `/pages/betyg` ("Tack! 1 av 5."): "Först kommer man till denna
sidan. Sen blir man redirectad till Judgeme? Och jag ville ju ha animeringarna i mejlet. Jag
ville inte ha min egen recensionsinsamling på hemsidan, för det är bara dumt. Det är jättebra om
vi kan använda Judge Me … det känns som att det här mejlet kommer att kännas mer som ett säljigt
mejl som man kanske inte ens läser. Och jag vill verkligen få in både dåliga och bra recensioner
för att lära mig grejer. Så det är därför vi behöver vara tydliga med att de ska lämna ett
omdöme." Gjort samma förmiddag:
- **Betygssidan avpublicerad** (`node klaviyo/recension/betygssida.mjs --avpublicera`, ny
  flagga, testad): `gid://shopify/Page/183830806867` `isPublished: false`, publika adressen
  svarar 404, temafilerna `layout/betyg.liquid` + `templates/page.betyg.liquid` ligger kvar och
  gör inget, loggrad i `klaviyo/konto/matstrumpor/betygssida.jsonl`. Inget raderat; `--skarpt`
  publicerar den igen om Axel ändrar sig.
- **Animation i mejlet går inte, tre mätta skäl:** mejl kör inga skript (ingen klick-reaktion
  finns i något mejlprogram); Spoks tar ingen egen HTML/CSS i block (så inte ens hover); och
  `upload_media` gör om en animerad GIF till en **stilla PNG** (mätt 2026-09-28: testfilen blev
  `…/01816106-af02-44f7-ae03-414f10d0ac6f.png`, 89 175 byte; den ligger kvar i mediebiblioteket
  som "TEST-gif-animering-provas-raderas", inget MCP-verktyg raderar, Axel kan ta bort den i
  appen). Det som går är stjärnor som länkar, och det har K15.
- **K15 v2** (samma utkast `45e8e354`): inget hero, ingen produktbild, ingen butikslänk. Ett
  kort personligt mejl från grundaren som ber om ett omdöme, bra eller dåligt, fem ★ som
  länkar **direkt** till Judge.me-länken (`&stars=1…5` läggs på bara så Spoks klickstatistik
  visar vilken stjärna som trycktes; Judge.me ignorerar parametern och alla fem öppnar samma
  formulär, ingen gating) och grundarraden. Copyn av en Sonnet-subagent mot
  `docs/copy-regler.md` med två versioner (personlig / kort); huvudsessionen valde (memo i
  innehållsfilen). Patchad 2026-09-28 08:37 UTC med `update_draft_campaign`: titel `K15 · kopare
  · Landade skämtet, eller inte?`, hash `fff30224…`, sex block (7376fba7, d162eda4, 4f18b682,
  4dba0842, d49d2571, da3eb8f2; bildblocket 3ac0339c, h1 532e457f och h2 327c59a5 borttagna),
  raden i `klaviyo/konto/matstrumpor/spoks-uppladdat.jsonl`. ⚠️ **Före patchen pekade stjärna
  4 och 5 på Trustpilot** (`get_campaign` samma förmiddag: `updated 2026-09-28T06:41:51Z`,
  alltså ändrat i appen 08:41 svensk tid, inte av någon session; 1–3 pekade kvar på
  betygssidan, 4–5 på `se.trustpilot.com/evaluate/www.matstrumpor.se`). Det är **review
  gating**, höga betyg till en publik sajt och låga någon annanstans: Trustpilot förbjuder det i
  sina riktlinjer och det är vilseledande mot nästa kund, så patchen skrev över det. Alla fem
  stjärnor går till samma formulär. Vill Axel ha Trustpilot i stället för Judge.me ska alla fem
  dit (och Matstrumpor har ingen Trustpilot-profil vad sessionen sett), det byts i
  innehållsfilens `lank` och patchas om.
- **Judge.me:s egna recensionsmejl är alternativet**, läst i Judge.me:s hjälpcenter
  2026-09-28 (artiklarna 11887051 smart styling, 11792628 reminders, 8380029 past orders,
  8384957 store reviews, 11419250 review form, 8420621 languages): **Free-planen** har
  obegränsade förfrågningar, svenska (39 språk, Settings → Language → "Widget and notification
  emails language"), val av recensionstyp ("Type of review": produkt först och butik efteråt,
  eller bara butik; Free), avstängning av hjälptexten (Free), "Send sample email" och
  **utskick till gamla ordrar** (Settings → Request reviews → "Request reviews from previous
  Shopify orders" → Get started: startdatumet måste ligga FÖRE installationsdatumet, högst
  5 000 uppfyllda ordrar, redan skickade hoppas över, går iväg cirka 10 minuter efter
  schemaläggningen när väntetiden redan passerat; Free). **Stjärnorna i Judge.me:s mejl
  förfyller betyget i formuläret** ("When a customer clicks a star, the review form opens with
  that rating pre-filled, so they don't have to choose a rating twice"), det vår länk inte kan.
  **Awesome ($15/mån):** byta trigger (Stars / Button / In email form), ändra hjälptexten
  "Click a star to leave a review", påminnelser, egen styling, blocket Shop review. Om
  Free-mallen visar stjärnor som standard står inte i artikeln — Axel ser det med Send sample
  email. ⚠️ Judge.me mejlar ALLA köpare oavsett marknadsföringssamtycke; det är Axels
  MFL-beslut (samma som "alla kunder" ovan). **Judge.me installerades 2026-08-22** (mätt via
  Fabrikens app: butikens `judgeme`-metafält skapade 03:48 UTC den dagen; appen "Judge.me
  Reviews" i `appInstallations`, bredvid "Klaviyo Reviews") med automatiska förfrågningar på
  som standard (Fulfilled-trigger enligt artikel 8379844) — så septemberköparna kan redan ha
  fått Judge.me:s mejl, och F09 (16 d efter order) ber då en gång till; vilket som ska gälla
  är Axels val (Judge.me: Settings → Request scheduling; F09: Settings i flödet). Av de 5
  recensioner motorn cachar (de bästa av 8, `klaviyo/output/matstrumpor/recensioner.json`) är
  3 daterade före installationen (2/1, 7/1, 9/4: importerade eller från en tidigare app) och 2
  i september (16/9, 25/9); de andra tre är inte lästa. Vad som faktiskt skickats syns i
  Judge.me → Reviews → Review requests.
- ✅ **Axels beslut 2026-09-28 förmiddag: VÅRT EGET MEJL** ("VI SKA HA VÅRAT EGNA JÄVLA MAIL").
  K15 i Spoks är det som går ut; Judge.me:s egna recensionsmejl ovan är referens, ingen plan.
  Föreslå det aldrig igen.
- **Fråga 15 till Evolve-boten** (`klaviyo/evolve/FRAGOR.md`, omskriven efter beslutet): hur
  VÅRT recensionsmejl ska skrivas och skickas — svarsgrad på gamla köpare, ordval som får
  missnöjda att skriva, ämnesrader, struktur, stjärnor mot knapp, timing för en present.
  **Ställd samma förmiddag: boten hade inget underlag** ("I don't have any source material …
  Post the full six-question breakdown in the community"), `SVAR.md` → Svar 15. K15 v2 står
  som den är; facit blir Spoks klick per stjärna + nya recensioner i Judge.me efter två veckor.

**Bästa praxis för recensionsmejlet (research 2026-09-28, Judge.me/Trustpilot/Yotpo/Okendo/NN
g + Karaman 2021; hela underlaget i sessionens workflow-utdata, sammanfattat här):** 50–100
ord, från en namngiven person och helst en riktig avsändaradress, förnamn i tilltalet, en enda
uppmaning och inget annat klickbart (inga produktkort, ingen rabatt), en mening om varför
(nästa kund läser det, vi lär oss), säg rakt ut att ett dåligt omdöme är lika välkommet, bjud
in ALLA lika (ingen förhandssållning på nöjdhet: Trustpilots riktlinjer, UCPD bilaga I 23c /
MFL 8 §), publicera allt och svara offentligt på det dåliga. Stjärnor i mejlet tar bort
friktion men ska kallas "klicka för att börja", aldrig "det här är ditt betyg". Första
förfrågan räknas från LEVERANSEN, några dagar efter att paketet kommit (för Matstrumpor:
order + 18–21 dagar, eller `order_delivered` + 5–7 d), sedan EN påminnelse 3–7 dagar senare
till dem som inte klickat, sedan stopp. Mät på inskickade recensioner, aldrig på öppningar.
**K15 v2 mot listan:** klarar ord, avsändare, en uppmaning, inget klickbart, ärlighetsraden,
alla lika, stjärnornas hjälprad. Avvikelser: mejlet nämner inte vilken låda kunden köpte
(Spoks har ingen produkttoken i en kampanj) och går till gamla köpare i ett svep (Axels
beslut). **F09 mot listan:** 16 d efter order är tidigt när leveransens p90 är 15 dygn — en
v2 med 21 d (eller `order_delivered` + 7 d) är nästa justering när Axel vill, inte nu.
⚠️ MFL 12 c §: en butik som visar recensioner måste på sajten säga hur den säkerställer att
de kommer från riktiga köpare (Judge.me:s verifiering). Om matstrumpor.se säger det är inte
kontrollerat.

**Sidoeffekt att hålla koll på:** klubbdragningens 0-kronorsorder är en `order_created` ⇒
vinnaren rullar också in i F09 efter 16 dygn (och i F04/F07). Rimligt, de har fått lådan, men
räkna med det när recensionerna mäts. Vill Axel undvika det: triggerfilter `orderTags nin
[klubb-dragning]` på F09 (`update_flow` medan flödet är inaktivt).

**Axels klick:** ✅ (1) länken ur Judge.me, inklistrad och verifierad 2026-09-27 kväll, insatt i
K15 och F09:s båda mejl; (2) K15: välj publik SEG_kopare (uteslutningen kan vänta, se ovan) högst
upp i redigeraren → Review → skicka (Axels ord 2026-09-27 kväll: "skicka ut review requesten
idag faktiskt till alla tidigare kunder" — SEG_kopare är köparna med samtycke; "alla kunder"
inklusive dem utan samtycke är hans MFL-beslut, se `CLAUDE.md` → Klaviyo, kampanjer bara
subscribed); ✅ (3) F09: påslaget 2026-09-27 14:16 UTC, mätt (se ovan).

## Dagliga serien till fars dag — omgång 2 (2026-09-29): 28 utkast, 2 platshållare, 5 på bänken, inget schemalagt utöver K01

Axels order 2026-09-28, ordagrant: "BARA SPAMMAR mina kunder … kampanjer varje dag med produkter
skräddarsydda för våra kunder … REA mail för den pågående rean … massa fars dag kampanjer …
10 stycken minst." Tolkning: **Matstrumpor.** Bäverbutikens dagliga serie byggs av en annan
session samma dag (spåren i Spoks-ytan `f716ae36-…`: segmentet "Köpare båt",
`BRIEFER-DAGLIGA.md`, K24 2/10 … K34 17/10) — rör aldrig den ytan härifrån, då blir det
dubbletter. **"Rean" på Matstrumpor är det stående erbjudandet Köp 1, få 1** (18 aktiva
BOGO-koder som läggs på av produktsidan): mejlen säger "det står på produktsidan", aldrig en
kod, och erbjudandet tar aldrig slut ⇒ den enda brådskan i serien är sista beställningsdagen
**lör 24/10** (fars dag sön 8/11, p90 15 dygn, brandfilens `kalender`).

**Vad som finns.** 23 innehållsfiler i `klaviyo/innehall/matstrumpor/kampanjer/` (`fd01…fd20`,
`rea01…rea03`; samma block som k04: hero med förnamnet, text, produkt, produktrad, fakta;
`exkludera SEG_oengagerade_180d`; `status_plan kraver-axel`), copyn av sex Sonnet-subagenter mot
`docs/copy-regler.md` (regel 6), byggda med `node klaviyo/bygg.mjs --brand matstrumpor` (0 fel,
bara ämneslängdsvarningar), paketerade med `spoks-paket.mjs --brand matstrumpor --offline`
(titeln `FD01 · 30/9 · samtycke · <ämne>`; `KORT` läser prefixet ur id:t sedan samma dag) och
uppladdade som **23 utkast** via `draft_campaign` 2026-09-28 11:36–16:48 UTC. Tillbakalästa
med `search_campaigns` (status draft, nyast först): exakt 23 FD/REA-titlar, inga dubbletter.
Loggen: 23 rader i `klaviyo/konto/matstrumpor/spoks-uppladdat.jsonl` (id, hash, planerad dag,
segment). **Schemat med länkar: `klaviyo/innehall/matstrumpor/KALENDER-2026.md` → Dagliga
serien.** Tillsammans med tisdagarna K01–K04 (serien hoppar 6/10, 13/10 och 20/10 med flit) blir
det **ett mejl om dagen 29/9–25/10, 27 dagar utan lucka.**

**Omgång 2 (2026-09-29, efter Evolves svar 16 i `klaviyo/evolve/SVAR.md`).** Omgång 1 ovan var
ett mejl om dagen till hela listan, nästan bara fars dag. Nu: **de engagerade**
(`SEG_uppvarmning_steg1`, samtycke + aktiv i Spoks senaste 30 d, **1 305 mätt 29/9 06:1x UTC**
med `get_segment`; 0 vid bygget 26/9, 19 vid K01-förberedelsen) får ett mejl om dagen, **hela
listan** (`SEG_samtycke`) 2–3 i veckan (tisdagens K-mejl + veckans starkaste), mixen per vecka
är Evolves (v1 **3 sälj / 4 värde**, v2 **5 / 2**, v3 **6 / 1**, v4 bara sälj, räknat ur tabellen
nedan med veckor som börjar tisdag 29/9), och sista två dagarna är en blitz (fre 23/10
09:00 + 20:00, lör 24/10 09:00 + 13:00 + 20:00). Sex nya utkast skrivna av Sonnet-subagenter:
**V01** *Du är med i klubben* (30/9, alla), **V02** *Svara med ett ord* (3/10), **V03** *Så ser
lådan ut inuti* (5/10), **FD21–FD23** (blitzen). K03 flyttad 13/10 → **tor 1/10**, FD01 → sön 4/10,
FD08 → tor 8/10 (värdemejl), FD18 → 09:00; FD02–FD05 och FD07 till **bänken** (titeln
`BÄNK · …`, schemaläggs inte, återanvänds mot jul). K02 och K04 heter `… · samtycke · …` i
Spoks sedan samma dag (tisdagarna går till hela listan). **V04** (lör 10/10, engagerade) skrivs
fre 9/10 ur svaren på V01 och V02 i kundsupport@matstrumpor.se (reserv FD03); **V05** (tis 13/10,
alla) skrivs mån 12/10 ur de nya Judge.me-recensionerna (reserv FD02). Alla titlar tillbakalästa
med `search_campaigns` 29/9 06:0x UTC. Loggen: raderna 2026-09-29 i
`klaviyo/konto/matstrumpor/spoks-uppladdat.jsonl`.

| Kort | Dag | Publik | Typ | Spoks-id |
|---|---|---|---|---|
| K01 | tis 29/9 | samtycke | sälj | `9aa10213-3bf1-42bc-b23e-315e088d92be` |
| V01 | ons 30/9 | samtycke | värde | `1f01d495-8a67-4719-a6a0-817f1822295d` |
| K03 | tor 1/10 | uppvarmning_steg1 | värde | `920afd93-03be-4aba-9c25-8d6a12603f06` |
| REA01 | fre 2/10 | samtycke | sälj | `411d7f9e-a68b-4b69-a07b-4a9d32bb8b1d` |
| V02 | lör 3/10 | uppvarmning_steg1 | värde | `277058be-7182-4cfc-b36c-1522e84cdbb5` |
| FD01 | sön 4/10 | uppvarmning_steg1 | sälj | `fe8c9abf-4cbe-41fc-aaca-1d4400717049` |
| V03 | mån 5/10 | uppvarmning_steg1 | värde | `436d851d-3dac-4dd5-b733-984b2af584e1` |
| K02 | tis 6/10 | samtycke | sälj | `b7acd85c-236d-4b46-9469-2df548361492` |
| FD06 | ons 7/10 | uppvarmning_steg1 | sälj | `19db626c-e88e-4900-bb19-c2e5ca196144` |
| FD08 | tor 8/10 | uppvarmning_steg1 | värde | `f4696d2a-8358-4fcd-a67a-4b5ac280c0d5` |
| REA02 | fre 9/10 | samtycke | sälj | `9d41c29d-d7e4-42c7-aaaa-b8f49f17da12` |
| V04 | lör 10/10 | uppvarmning_steg1 | värde | skrivs fre 9/10, reserv FD03 |
| FD09 | sön 11/10 | uppvarmning_steg1 | sälj | `5317562c-2e88-4549-a23e-13329494c9a3` |
| FD10 | mån 12/10 | kopare_forra_sasongen | sälj | `f7e75509-9397-4ed6-bfb3-aabec4f0ea63` |
| V05 | tis 13/10 | samtycke | värde | skrivs mån 12/10, reserv FD02 |
| FD11 | ons 14/10 | uppvarmning_steg1 | sälj | `9a8e6ea5-f889-4df1-8109-ca5f665908ed` |
| FD12 | tor 15/10 | kopare | sälj | `69506961-866a-4f47-bb09-6c503672f9d8` |
| REA03 | fre 16/10 | samtycke | sälj | `45aabe88-d6c9-490d-a634-2ddfb936aeb0` |
| FD13 | lör 17/10 | samtycke | sälj | `f68abd56-a4bb-4608-b5ea-610375ca6e05` |
| FD14 | sön 18/10 | ej_kopt | sälj | `faaafae6-7469-4251-9dfe-0fb88588c461` |
| FD15 | mån 19/10 | uppvarmning_steg1 | sälj | `656f890e-5629-431d-9efa-5f6ef55a95dd` |
| K04 | tis 20/10 | samtycke | sälj | `6f1e2e50-43af-446b-8284-ff0ae91b4125` |
| FD16 | ons 21/10 | uppvarmning_steg1 | sälj | `56fb1045-5139-4d04-bb52-f2fd704c7d10` |
| FD17 | tor 22/10 | samtycke | sälj | `a2529b5a-c43b-4fc3-bc1e-5fbe2f5e9f59` |
| FD18 | fre 23/10 **09:00** | samtycke | sälj | `ea849786-ea60-43bc-8d8b-cc6ca4eceea8` |
| FD21 | fre 23/10 **20:00** | uppvarmning_steg1 | sälj | `bd3a0b77-3e86-42a4-a727-e360fa5b2592` |
| FD19 | lör 24/10 **09:00** | samtycke | sälj | `b91692ad-d7ab-4e71-b8db-1799f97af346` |
| FD22 | lör 24/10 **13:00** | uppvarmning_steg1 | sälj | `2acfa603-1aaa-4b45-b1ab-a242cd827d0f` |
| FD23 | lör 24/10 **20:00** | samtycke | sälj | `6aa3c5c6-6cea-417e-90b5-a89b829b4226` |
| FD20 | sön 25/10 | samtycke | sälj | `385b6fc9-f41c-43c3-bb02-96bd0970b849` |
| FD02 | **bänken** | samtycke | sälj | `4f1d87cf-633d-4ddd-870a-6710e73d7d59` |
| FD03 | **bänken** | samtycke | sälj | `f915735d-7f9d-41d5-b658-cddb15e02e20` |
| FD04 | **bänken** | samtycke | sälj | `35eda39a-52a8-4c72-8879-dabf3ef28b6e` |
| FD05 | **bänken** | samtycke | sälj | `11247ac0-87cf-4b4a-9c52-73e705aeef31` |
| FD07 | **bänken** | samtycke | sälj | `df000c31-0eb7-4572-b4c0-4891a53df843` |

**Skräddarsytt per segment där segment finns** (Spoks-storlekar vid bygget): FD10 till
`SEG_kopare_forra_sasongen` (2 396: "förra gången jul, den här gången fars dag" — så är
KUNDRESA §7 punkt 4, "börja tidigare med förra årets köpare", delvis löst två veckor före K05),
FD12 till `SEG_kopare` (2 700: "du har redan sushin, ge pappa pizzan"), FD14 till `SEG_ej_kopt`
(300). Kategorisegmenten (sushi 105, pizza 3, hamburgare 2, donut 9) är för små för egna mejl,
så sorterna fick varsin dag i omgång 1 (FD03 pizza, FD04 burgare, FD05 donut, FD16 burgare,
REA03 donut). I omgång 2 ligger FD03–FD05 på bänken, och sorterna bärs av FD16 (burgare), REA03
(donut), FD22 (pizza, sista dagen 13:00) och produktraden i nästan varje mejl. Vinklarna är olika
varje dag: mottagaren (pappa, svärfar, pappan som säger nej), kundcitaten (K03, FD08),
lådans innehåll (V03), Köp 1, få 1 (REA01–03, FD11), nedräkningen (FD09, FD13, FD15–FD19,
FD21–FD23) och presentkortet dagen efter sista dagen (FD20).

**Faktakollen som rättade agenterna — skriv aldrig om dem:** par per låda är **sushi 5, pizza
4, hamburgare 2, donut 3** (två agenter skrev "fem" på pizza och donut; produktsidorna lästa
2026-09-29: sushi "5 par strumpor, rullade som sushibitar", pizza "4 par", hamburgare "2 par",
donut "3 par", alla One Size, sushin "passar 36–44"); fd09 "äkta pizzakartong" ⇒ "ser ut som en
pizzakartong"; fd20 påstår inte att en låda beställd 25/10 missar fars dag, bara att den "kan
komma fram efter"; `klaviyo/validera.mjs` `ANDRA_VERKSAMHETER` stoppar ordet "grill"
(Grillkliniken-spärren) — fd03/fd04 skrevs om utan grillord och fd04 heter `burgarpappan`;
spärren är kvar med flit. Leveranstiden står aldrig i ett mejl; sushin har inget jämförpris så
ingen "rea" på sushin; butikens namn står inte i copyn.
⚠️ **Rättelse 2026-09-29 — ätpinnarna INGÅR i sushilådan.** Sessionen strök 2026-09-28 tre
ätpinnelöften ur fd06/fd14/fd18 med motiveringen "ätpinnar är inte lådans innehåll". Det var
fel: produktsidan matstrumpor.se/products/sushi-strumpor säger ordagrant *"Ätpinnar av trä
ingår, för hela illusionen"* (läst 2026-09-29, `/products/sushi-strumpor.json`). K01 ("med
ätpinnar bredvid", "Ätpinnar av trä ingår."), K05, F05 och F07 har alltså rätt och ska inte
röras. Strykningarna i den dagliga serien är ofarliga (ett sant argument mindre, inget falskt
kvar) och de sex nya mejlen (V01–V03, FD21–FD23) nämner inte ätpinnar. Bara sushilådan har
dem — pizza-, hamburgar- och donutsidorna nämner inga.
⚠️ **Rättelse 2026-09-29 — talen ur recensionerna blev fel på ett dygn.** K03, FD08 och F01 E2
sa "åtta recensioner" och "4,5 av 5 i snittbetyg" (sant 26/9). K15 gick ut 28/9 och gav tre nya
betyg (5, 4 och 3 stjärnor), så Judge.me-widgeten visade 29/9 **11 recensioner, snitt 4,36**.
K03 och FD08 bär inga tal längre (förhandstexten säger "Två verifierade kunder …"), och deras
citat är **valda med `valj`** i citatblocket (`klaviyo/citat.mjs`): K03 Kents "mottagaren vart så
glad" + "barnbarnen", FD08 Jonas "Uppskattat och rolig present" + "Jätte sköna". Utan `valj` tar
blocket alltid de två nyaste, och då hade K03 byggd 29/9 tappat Kents citat, som ämnesraden
"Recensionerna säger att mottagaren blev glad" bygger på. Ett valt citat som inte finns stoppar
Spoks-paketet (`fel`). Båda utkasten patchade i Spoks och tillbakalästa. **F01 E2 är live och
går inte att ändra via MCP:n:** repot säger nu "Två kunder, ordagrant. Ingen är skriven av oss.",
och Axel byter förhandstexten i appen. **Regeln:** skriv aldrig antal eller snitt ur
recensionerna i ett mejl som går ut senare än samma dag; recensionerna ändras av våra egna
utskick.

**Guardrails:** inget skickat av sessionen, och **schemaläggning bara på Axels order** (MCP:n kan
varken välja publik eller schemalägga). Spoks **publika API** kan det inte heller
(`https://api.spoks.com`, nyckel per arbetsyta i headern `x-api-key`, kontraktet på
https://docs.spoks.com/openapi.json, version 2026-07): det skapar och ändrar bara utkast, och docs
säger ordagrant "publish or schedule it from the app". `PATCH /campaigns/{id}` kan däremot sätta
**publiken** (`recipients.segmentIds`), vilket MCP:n inte kan. ✅ **Därför klickar roboten i
appen sedan 2026-09-30** (Axels order: "bygg en cli för att kunna interagera med hemsidan … och sen
scheduelar du alla"): `klaviyo/spoks/robot/`, se **Roboten** nedan. Sessionen avrådde först kvällen
innan (skört, mot Spoks upplägg, ett fel når ~3 000 direkt); det som gjorde det försvarbart är att
roboten går genom appens egna knappar i en inloggad webbläsare, aldrig genom interna anrop, och
att spärrarna sitter i koden. Bara segment med samtycke (MFL
19 §). Klaviyo-utkasten i `UV6Rqg` rörs inte. Sessionen raderar aldrig ett utkast.

**Stoppregeln finns redan — `LARM_LEVERANS` i `docs/os/EPOST-STRATEGI.md` §8:** spamklagomål
**över 0,3 %** eller avregistreringar **över 1 %** på ett utskick ⇒ stoppa nästa kampanj,
tillbaka till det engagerade segmentet, Axel pingas (0,3 % är Gmails gräns, 1 % en startsiffra).
Regeln läses efter VARJE utskick (`get_campaign_statistics` dagen efter). Två utskick i rad utan en enda
order ⇒ byt vinkel innan nästa. Öppningsgraden fäller aldrig en dom ensam (Evolve/Billy).
⚠️ **Takten mot vad vi vet (Axels fråga 2026-09-29 "är det såhär vi ska köra?"):** Klaviyos
riktlinje i samma dokument §4 är *dagligen bara till engagerade 30 d, upp till 3/vecka till
60 d, 2/vecka till 90 d* — ett mejl om dagen till HELA samtyckeslistan (aldrig mejlad, ny
avsändardomän i Spoks) ligger över den. Evolve-boten fick takt-frågan redan 2026-09-24
(fråga 4) och svarade "inget i källorna, ask the community directly"; det den HAR är Billys
lanseringskadens *nyfikenhet → teaser → avslöjande med datum → nedräkning → "missade du?"*
(svar 5), som är exakt seriens form. Fråga 16 i `klaviyo/evolve/FRAGOR.md` (2026-09-29) är
skriven för communityn OCH boten. Boten svarade samma dag (svar 16 i `klaviyo/evolve/SVAR.md`:
segmentera på engagemang, blanda värde och sälj per vecka, blitza de sista dagarna), och
omgång 2 ovan följer svaret.

**Kvar / nästa:** V04 skrivs fre 9/10 och V05 mån 12/10 (reserverna FD03 och FD02). Axel
schemalägger en vecka i taget, efter att sessionen läst föregående veckas siffror mot
`LARM_LEVERANS`. Påminnelser (`send_later` till sessionen som byggde serien, 08:30 CEST): mån
5/10 vecka 2-listan `trig_01EH4bY8pvLc4UPkaCMn5RGt`, fre 9/10 V04 `trig_01GoTUd9oR7vppKrahMMyZ51`,
mån 12/10 V05 + vecka 3 `trig_01M7GAcm5zvRmfcL1yDRQD4e`. Veckans
dragning-blocket hör till tisdagarna (K02 6/10 först), inte till de dagliga; K16 förtur + F01
E1 v4 (KUNDRESA §7). K15 skickades 28/9 11:18 CEST.

### Axels granskning 2026-09-29: V01 v2, inga svarsfrågor, ingen tas bort, en granskningslänk

Axel öppnade V01 först och underkände det ("Att de inte kommer att få en massa rabatter och
sånt, det kommer de ju visst få … det är skit"). Samma eftermiddag, när han skulle granska
resten: "jag vill bara kunna ha en länk för att granska dem", "jag tycker inte vi tar bort några
som inte svarar på mejlet" och "det är bara onödigt att vi ber dem svara på mejlen, för det
kommer bli kaos för kundsupporten". Fyra beslut, alla genomförda:

- **V01 v2** (ons 30/9, `SEG_samtycke`, Spoks `1f01d495`, hash `88ea66d1`): *Varje tisdag kan
  du vinna sushilådan. Du är med.* Fem daterade förmåner i stället för "Mejllistan kallar vi
  Matstrumpor-klubben … inga koder och inga poäng": dragningen varje tisdag från 6/10, Black
  Week för klubben sön 22/11 kl 18 (ett dygn före alla andra), 100 kr att handla för på Black
  Friday till den som inte vunnit, påminnelse om sista beställningsdagarna, nya sorter och
  påfyllning först. Copy av Sonnet mot copy-reglerna, 0 ❌. Löftena är sanna eller bokade:
  rabatternas starttid i Shopify flyttad till sön 22/11 17:00Z samma dag
  (`konto/matstrumpor/shopify-rabatter.jsonl`), tröstpriset 100 kr är Axels beslut 27/9 och
  byggs 2/11 tillsammans med K16 (påminnelse `trig_011Xqt44pRC5Ax5yg6ZkBJRA`), och första
  skarpa dragningen tis 6/10 är **godkänd av Axel samma dag** ("A, kör lotteriet 6/10"):
  påminnelsen `trig_017jCVjHEjJmkJP4qS51iNjE` kör `/klubbdragning kör` på morgonen utan ny
  fråga, efter kollen att F08 v2 är på och v1 av, och lägger Premiär-blocket i K02 om K02
  fortfarande är utkast. "100 kr" släpps igenom av `validera.mjs` bara för att
  mejlet listar beloppet i `tillatna_belopp` med källa. "Med ätpinnar av trä" struket ur
  dragningsraden: vinsten är en utkastorder med bara sushivarianten, och att ätpinnarna följer
  med den är inte mätt.
- **Inga mejl ber om svar.** V01:s svarsfråga borta, **V02 ersatt** (lör 3/10, engagerade,
  samma Spoks-utkast `277058be`): *Sex saker att veta innan du köper en låda*, raka svar ur
  produktsidans FAQ (ätpinnar, storlek, frakt, betalning, Köp 1, få 1 utan kod, den andra
  lådan valfri). Filen heter nu `v02-sex-saker-innan-du-koper.json`. **V04 byggs inte ur svar**
  längre: fre 9/10 skrivs den ur första dragningen om den körts 6/10, annars tar FD03 platsen
  (påminnelsen omskriven). Svar som ändå kommer landar i kundsupport@matstrumpor.se; autosvaret
  går torrt för Matstrumpor och skickar inget. K15 och F09 har kvar raden "Blev något fel?
  Svara …": den gäller den som har ett problem, inte alla, och F08:s vinnare svarar med video
  och adress (tre i veckan).
- **Ingen tas bort för att hen inte öppnar eller svarar.** F06 E1/E2 (sunset) skickas aldrig;
  titlarna i Spoks börjar `SKICKAS INTE · …` (`4fccb750`, `662420f3`) så de inte kan
  schemaläggas av misstag igen (F06 E2 schemalades en gång 26/9). Sessionen raderar dem inte.
  Deliverabilityn sköts i stället av publiken: dagligt bara till de engagerade, hela listan 2–3
  i veckan, och stoppregeln `LARM_LEVERANS`.
- **Rättelser i tio andra utkast** (Sonnet, läst tillbaka i Spoks): tic:en "Köp 1, få 1, det
  står på produktsidan" (åtta mejl: FD01, FD11, FD12, FD17, K07, REA01, REA02, REA03) säger nu
  vad erbjudandet gör; K03 slutade försäkra "inget påhittat" tre gånger; V03 tappade "Alla fyra
  lådorna är förpackningen" och jargongordet "dubbeltitten". **Faktum rättat: ett par
  ätpinnar per sushilåda** (produktsidan 2026-09-29: paketet Köp 1, få 1 visar "Ätpinnar i trä
  · 2 par" för två lådor, Köp 2, få 2 "4 par" för fyra); K07:s "fyra par ätpinnar" på två lådor
  var fel och säger nu två.
- **Granskningslänken** (en sida med alla mejl som ska ut, i utskicksordning, som i mobilen,
  med knapp till varje utkast i Spoks): `node klaviyo/gallerier.mjs --brand matstrumpor
  --granska --fran <datum>` skriver `klaviyo/output/matstrumpor/galleri-granska.html`, som
  publiceras som Artifact på samma länk varje gång: https://claude.ai/artifact/VgHANQtbtSFQZnVkogj9ma. Bänken (`parkerad`) och
  det som redan gått visas inte. Utseendet i Spoks (typsnitt, färger) kan skilja något; texten
  och bilderna är desamma. **Scheman läggs fortfarande av Axel i appen**: Spoks MCP har inget
  verktyg för att schemalägga eller skicka (`get_links` säger det själv: "sending a campaign"
  är en app-länk).

### Bilderna 2026-09-29: en egen bild överst i varje mejl

Axels dom samma eftermiddag: "det är bara samma bild i alla mejl, och ingen vill riktigt se
det där. Så alla kommer unsubscribea … du kan bara göra nya bilder också med API:n". Mätt i
innehållet: 29 av de 37 mejlen från 30/9 till 29/12 hade sushilådans produktbild
(`produkt:sushi-strumpor`, Spoks `572aba92`) överst, och produktkortet längre ner visade
samma bild en gång till.

- **37 egna bilder, en per mejl.** 31 nya ur kie.ai (`google/nano-banana-edit`, butikens
  riktiga produktfoton som referens, så lådorna ser ut som de gör) och 6 av butikens egna
  livsstilsbilder ur Shopify Files (familjen i soffan, morfar i fåtöljen, mormor som skrattar,
  paketet vid dörren, sushibordet, bambufatet). Motiven följer mejlet: tre lådor med
  guldrosett i V01 (veckans tre vinster), en tvättmedelsflaska mot sushilådan i K02,
  ätpinnar som doppar en laxbit i soja i FD06, frukost på sängen i K04, julstrumpan i K05,
  glögg vid brasan i K12 och så vidare. Hela listan med mejl, motiv och prompt:
  `klaviyo/innehall/matstrumpor/bildplan.json`.
- **Granskade av sessionen, bild för bild.** Underkända och gjorda om: donutlådan
  (strumporna svävade i luften), hyllan i K06 (såg ut som ett bord) och fyra-sorter-bilden
  (hamburgarlådan syntes inte; den godkända saknade först donutlådan och beskars sedan till
  2:1). Inga ansikten i de nya bilderna, ingen påhittad text; det tryck som syns ("PIZZA
  SOCKS", "DOUNT SOCKS") står på de riktiga förpackningarna.
- **Var bilderna ligger:** i Matstrumpors Shopify Files (`mejl-<namn>.jpg`, butikens CDN) och
  i Spoks mediebibliotek (samma namn). Registret `klaviyo/konto/matstrumpor/bilder.json` bär
  url, alt-text, länk och Spoks-id per bild. Innehållet pekar dit med `"bild": "bild:<namn>"`
  i hero-blocket; bilden länkar dit hero-knappen går.
- **Motorn:** `node klaviyo/mejlbilder.mjs --brand matstrumpor` (`--generera`, `--godkann`,
  `--befintlig`, `--spoks-lista`, `--spoks`, och utan flagga en kontroll).
  `validera.mjs` stoppar ett mejl vars bild saknas i registret, `spoks-paket.mjs` stoppar
  en bild utan Spoks-id, och **`bygg.mjs` stoppar två kampanjer som har samma bild överst
  inom 21 dygn** (brandfilens `bildregler`, från 30/9; produktbilder räknas också).
  Granskningssidan hämtar bilderna i 640 px (`bilder.mjs sidUrl`), så den väger 5 MB och
  inte 8.
- **I Spoks: alla 37 utkast har sin nya bild överst** (samma kväll, varje byte läst tillbaka
  och loggat med hash i `konto/matstrumpor/spoks-uppladdat.jsonl`, `atgard: hero-bild`). 35
  bytte bildblocket på plats (`update_draft_campaign_blocks`, blockets id och stil kvar);
  K03 och K13 hade ingen bild överst och fick den som nytt första block. K13:s bild länkade
  först till sushilådan och går nu till presentkortet (`--synka`). ⚠️ **Spoks har ett tak
  per minut:** tre arbetare samtidigt gav "Rate limit exceeded. Try again in 13 seconds"
  efter ungefär 25 ändringar; en enda arbetare, ett anrop i taget, tog de sista 12 utan
  stopp. Kör aldrig ändringar i Spoks parallellt.
- **Kvar som förut:** produktkorten längre ner i mejlen visar produktens egen bild (den
  hydreras av Spoks och går inte att byta per mejl). Flödena (F01–F09) har kvar sina
  produktbilder: de är aktiva, och ett aktivt flöde går inte att ändra via MCP:n.

### Schemaläggningen via Cowork 2026-09-29: alla 37 mejl på en gång

Axels order samma eftermiddag: "Skriv cowork prompt för att schemalägga allt". Spoks MCP kan
varken välja publik eller schemalägga, så klicken görs i appen, och Cowork (Claude i Axels
webbläsare) gör dem.

- **Prompten byggs, skrivs aldrig för hand:** `node klaviyo/spoks/cowork-schema.mjs --brand
  matstrumpor --fran 2026-09-30 --aldrig "K01,K15"` läser innehållsfilerna (datum, segment,
  ämnesrad A) och uppladdningsloggen (Spoks-id) och skriver
  `klaviyo/spoks/cowork/matstrumpor-schema-2026-09-30.txt` (klistras in i Cowork) och `.json`
  (facit med lokal tid och UTC). `--bara V04` ger en prompt för ett enda mejl. Bänken
  (`parkerad`), ett mejl utan Spoks-utkast eller med mer än ett segment stoppas med orsak.
- **Vad prompten låter Cowork göra:** per mejl länken → kolla ämnesraden → "Till:" exakt ett
  segment → "TITTA IGENOM" → schemalägg datum och klockslag → pillret "Kommer att publiceras …"
  kontrolleras. Aldrig skicka nu, aldrig ändra text, aldrig välja Warmup tier/All subscribed
  eller något förväxlingsbart segment, aldrig exkludera, och en uppvärmningsruta är Axels
  beslut (Cowork stannar och frågar). Sommartiden: CEST till och med 24/10, CET från 25/10.
- **Efteråt mäter sessionen, Cowork:s rapport räcker inte:** `search_campaigns` (status,
  `publishDate`, `notify`) mot facit med `cowork-schema.mjs --jamfor <svar.json> --facit
  <fil.json>`, och publiken med `update_segment` utan `acknowledgeWarnings`
  (`postsUsingSegment`). `notify: false` betyder att mejlet publiceras utan att någon får det
  (CaraShell nb 29/9), och det syns inte i redigeraren. Påminnelsen
  `trig_01AoYRfSaHJzbEicy2x49r9h` gör kollen ons 30/9 10:00.
- **Rättat före schemaläggningen (ett schemalagt mejl går inte att ändra via MCP:n):**
  faktarutans rubrik **"Ångerrätt" → "Öppet köp"** i 41 utkast (alla utom V01, som saknar
  rutan; brandfältet `angerratt_rubrik`, Bäverbutiken behåller sin), K06:s titel och källfil
  till `SEG_kopare_forra_sasongen` (K05 samma), FD20 till **18:00** den 25/10 (källfilen sa
  `+02:00`, alltså 17:00 efter omställningen). Loggen: `atgard: rubrik-oppet-kop` och `titel`.
- **Beslut som följer av "allt":** veckans dragning 6/10 kan inte läggas in i K02 i efterhand
  (K02 är schemalagd), så V04 lör 10/10 berättar om den. K05–K14 (`skrivs om efter lärdom`)
  är schemalagda som de står; ska ett skrivas om flyttas det först till utkast i appen
  (menyn "•••" på den schemalagda kampanjen), sedan MCP, sedan ny Cowork-prompt med `--bara`.
  V04 och V05 skrivs 9/10 och 12/10 och får egna prompter. K16 (förtur 22/11) och tröstpriset
  byggs 2/11. Stoppregeln `LARM_LEVERANS` gäller fortfarande: vid larm flyttas nästa
  schemalagda mejl till utkast.
- ⚠️ **Spoks ritar ingenting i en dold flik** (Coworks första försök 2026-09-29 ~17:15 CEST: vit
  sida, Chrome rapporterade fliken som `hidden`, ingen inloggningssida, inget ändrat). Fliken
  måste ligga överst i ett synligt fönster medan Cowork arbetar. Prompten säger det sedan dess
  och ber Cowork be om hjälp i stället för att gissa. **Samma kväll ~21 CEST, efter två vita
  sidor till:** varje gång Axel gick till sessionen med Coworks rapport hamnade ett annat fönster
  över Spoks, och Cowork stannade. Mätt med `search_campaigns` (`publishedAfter`): bara V01
  schemalagd. Sedan dess skriver Cowork ingenting mellan mejlen, bara en slutrapport (steg 9), en
  vit sida betyder "be Axel klicka en gång i Chrome-fönstret", och Axel lägger Chrome och Cowork
  sida vid sida: ett Chrome-fönster, ingen helskärm. Omstarten från K03 i en ny Cowork-chatt:
  `cowork/matstrumpor-schema-2026-10-01.txt` (`--fran 2026-10-01 --aldrig "K01,K15,V01"`, 36 mejl).
- ✅ **`notify: false` på ett SCHEMALAGT mejl är normalt — rättat samma kväll.** Efter Coworks första
  mejl läste sessionen V01 (`search_campaigns` 2026-09-29 ~20:4x CEST): `waiting_to_be_published`,
  `2026-09-30T16:00Z`, `notify: false`, `notificationRecipientsCount: 0`, och drog slutsatsen att V01
  inte skulle mejlas, med Smart sending som trolig orsak. **Båda delarna var fel.** Cowork hade gått
  rätt väg ("Till:" SEG_samtycke → "TITTA IGENOM" → Smart sending-rutan tom, "2971 beräknas skickas" →
  **"Planera"** → datum och tid → **"Tillämpa"**; "Publicera nu" rördes aldrig), och CaraShells K01 NB,
  som stod på `notify: false` efter tre omschemaläggningar 14:14–14:35, **publicerades 18:00 med
  `notify: true` och 17 mottagare** (mätt med `search_campaigns` i CaraShells yta samma kväll; sv 38,
  da 13, en 92). Spoks sätter alltså `notify` och mottagarantalet när mejlet går ut. Domen fälls därför
  bara på ett PUBLICERAT mejl (`cowork-schema.mjs --jamfor`: publicerat utan `notify` eller till 0
  mottagare = fel; schemalagt = bara status och tid). Prompten kräver granskningssidan, Smart sending
  av (rutan tom), "… beräknas skickas" över 0 och "Planera" → "Tillämpa". Smart sending är av på
  varje mejl (sessionens beslut: 24-timmarsregeln skulle stryka de aktiva varannan dag i en serie som
  går kl 18 varje dag). Hjälpartikeln *Scheduling an email campaign*
  (help.spoks.com/en/articles/13563019) beskriver samma väg: mottagare → Review → Schedule längst ner.
- **Stoppregeln läses varje morgon** av rutinen `trig_0184cEo3qqjRg5GxemevSEYf` (08:38 svensk tid,
  `CRON_TZ=Europe/Stockholm`, i den här sessionen, sedd i svaret från `create_trigger` 2026-09-29):
  gårdagens utskick mot `LARM_LEVERANS`, och `notify` på de närmaste 48 timmarnas mejl. Tyst utom
  en rad när allt är rätt; larm ⇒ vilka schemalagda mejl som ska till utkast, med Cowork-prompt.
  Raderar sig själv efter 31/12. Påminnelserna 30/9, 5/10, 6/10, 9/10, 12/10 och 2/11 är
  omskrivna samma dag: de ber aldrig Axel schemalägga för hand, utan ger en Cowork-prompt ur
  `cowork-schema.mjs --bara`.

### Roboten 2026-09-30: schemaläggningen i appen, utan Cowork

Axels order samma morgon, efter en kväll där Cowork fastnade på vita sidor ("bygg en cli för att
kunna interagera med hemsidan … och sen scheduelar du alla"). `klaviyo/spoks/robot/` kör en
Chromium-robot i containern (Playwright, `/opt/pw-browsers/chromium`) som klickar i Spoks-appen som
en människa. Den har inte Coworks problem: en robotflik är aldrig dold.

```bash
node klaviyo/spoks/robot/spoks-robot.mjs logga-in            # en gång per container
node klaviyo/spoks/robot/spoks-robot.mjs schemalagg --facit klaviyo/spoks/cowork/matstrumpor-schema-2026-10-01.json [--bara K03,V02] [--torr]
```

- **Inloggningen:** Spoks har ingen lösenordsinloggning, bara magisk länk, Google, telefon och
  Apple. `logga-in` begär en länk till Spoks-kontot `kundsupport@baverbutiken.se` (samma användare
  som MCP:n), läser mejlet "Sign in to Spoks requested at …" ur brevlådan med `kundtjanst/mail.mjs`
  (`KUNDTJANST_MAIL_PASS_BAVERBUTIKEN`) och öppnar länken i robotens profil. Profilen ligger i
  `~/.cache/spoks-robot/profil` (aldrig i repot; `SPOKS_PROFIL` byter plats). Länken skrivs aldrig ut.
- **Proxyn:** Chromium litar bara på containerproxyns egna CA:er (`--ignore-certificate-errors-spki-list`
  med SPKI-hasharna ur `/root/.ccr/ca-bundle.crt`, räknade av `spkiHashar`), aldrig på allt.
- **Appen är Flutter:** knapparna finns i DOM:en först när tillgänglighetsläget slås på
  (`flt-semantics-placeholder`), och de hittas på sin text. Datumväljaren har pilar utan text,
  dagknappar och fälten Timme och Minut där markören hoppar vidare efter två siffror.
- **Vägarna, mätta 2026-09-30:** ett utkast: "Till:" (tomt fält ⇒ roboten kryssar facits segment i
  listan, som skrollar och inte stängs av Esc) → "TITTA IGENOM" → Smart sending av → "Planera" →
  datum och tid → "Tillämpa", som sparar direkt (en PUT mot posten). Ett schemalagt mejl på fel tid:
  pillret → "Ändra publiceringstid" → datum och tid → "Tillämpa" → "TITTA IGENOM" →
  **"Uppdatera inlägg"**. "Tillämpa" ensam sparar INTE ett schemalagt mejl (mätt: ingen begäran
  alls, och efter omladdning stod den gamla tiden kvar).
- **Spärrar i koden:** `SKICKA_NU` vägrar varje knapp som "Publicera nu"/"Skicka nu"/"Send now";
  fel arbetsyta stoppar allt innan något rörs; fel eller tomt segment (0 kontakter) och påslagen
  Smart sending (färgen mitt i rutan, vit = av) stoppar mejlet; varje sparning måste synas som en
  PUT. Efteråt mäts allt med `search_campaigns` och `cowork-schema.mjs --jamfor`.
- **Fyndet samma morgon:** K03 var schemalagd för hand 07:08 på onsdag 30/9 kl 18:00, samma tid som
  V01 (datumväljaren öppnar på dagens datum). Roboten flyttade den till torsdag 1/10 kl 18:00,
  bekräftat med `search_campaigns` (`2026-10-01T16:00Z`, uppdaterad 07:33).
- **`notify`:** mejl som roboten schemalagt står med `notify: true`. V01 (Cowork 2026-09-29) står
  kvar på `false` även efter att roboten sparat om den med samma tid. Granskningen i appen visar
  samma sak för båda: Smart sending av och 2 971 som "beräknas skickas". Kvällens kontroll 18:20
  säger om V01 faktiskt mejlades.
