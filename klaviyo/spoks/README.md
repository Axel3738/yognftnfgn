# Spoks: Bäverbutikens mejl i Spoks i stället för Klaviyo

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

**Axels klick** står i rapporten 2026-09-26 och upprepas i `PROMPT-carashell-upp.md`:
öppna CaraShells Shopify admin på en dator → Appar → Spoks (eller installera om från
https://apps.shopify.com/spoks med butiken yitrbk-m3 vald), skriv in
`kundsupport@baverbutiken.se` som adress i onboardingen, hoppa över Klaviyo-frågan,
och kontrollera i app.spoks.com att CaraShell syns bredvid Bäverbutiken.se och
Matstrumpor.se. Sedan kör en ny session uppladdningsprompten — steg 0 där vägrar
gå vidare tills `whoami` visar workspacen.
