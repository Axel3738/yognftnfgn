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

## ⛔ Läget 2026-09-27 09:30 CEST — rättade kopior live, originalens triggers av (mätt med get_flows, get_flow och search_campaigns)

**Alla 13 flöden slogs på av Axel 2026-09-26 09:02–09:05 CEST** (`activated` 07:02:13–07:05:05 UTC).
Granskningen samma dag (`baverbutiken/KVAR.md`, 31 fynd) hittade falska "verifierad kund"-citat
(F01 mejl 2, K01), review gating (F14) och dubbel KREDIT100 vid återinträde (F04 v2) i det som
låg live — och Spoks-MCP:n kan varken slå på flöden, aktivera mejlsteg, skicka kampanjer eller
ändra ett aktivt flöde (`update_flow_step` svarar "Cannot edit a step in an active flow"). Den
kan bygga inaktiva flöden och stänga av sändsteg. Därför byggdes **rättade kopior inaktiva via
MCP** (2026-09-26 kväll; F14 v2 och F04 Levererat 2026-09-27 morgon), och **Axel slog på dem i
appen 2026-09-27 07:55–09:28 CEST** (sändstegen först, sedan flödet) och stängde av originalens
triggers plus de sändsteg som bar felen. **Varje klick är tillbakaläst med `get_flow`.**

### Det som skickar nu

| Flöde (namnet i flödeslistan) | Spoks-id | Startar på | Väntan | Inrullade 09:30 |
|---|---|---|---|---|
| **F01 Välkomst v2** | `f11d04ab-1789-4a88-9abb-a3aaf6e4219d` | ny kontakt, subscribed | 1 min, 2 d, 3 d; mejl 2 och 3 bara till den som inte köpt sedan inrullningen | 17 |
| **F02 Övergiven kassa v2** | `f98eb12e-f7a2-4b0b-ae02-f738776b5282` | checkout, inget köp sedan; återinträde tidigast efter 7 d | 3 h, 1 d, 2 d | 0 |
| F03 Webbhistorik (original) | `f9001da7-60cb-4742-bd5a-8d4397cfb0e6` | produktvisning | 4 h, 1 d | 1 |
| **F04 Efter köp v3 (kredit)** | `3c8443d3-4916-40ad-b83e-5345c8752c2e` | order skapad, **inget återinträde** | **5 d** → "Din beställning är på väg" med KREDIT100 (Axels ändring 09:02 CEST, se nedan); mejl 2 "Kom allt fram som det ska" **AV** | 15 |
| **F04 Levererat (kom allt fram)** | `0b2beeb0-5288-46cb-80a2-2845bd05b7c5` | **paketet levererat** (`order_delivered`) | 1 dygn, kl 10:00 | 0 — ⚠️ oprövat, se nedan |
| **F05 Vinna tillbaka v2** | `3ef1aab0-24b1-4c84-80a4-840f7a4cc637` | order, inget köp sedan | 120 d, 14 d | 0 |
| **F07 Motorhölje till båtmotorskydd v2** | `98d46ff1-fb25-44b6-8916-2297198e5ea6` | order med Marin Motorhölje; hoppar den som redan köpt båtmotorskyddet | 21 d, 7 d | 0 |
| F08 Tips bälteslip (original) | `c7dc0fb1-d866-48df-aecd-08657bf9ce06` | order med produkten | 21 d (Axels) | 6 |
| F09 Tips taköverdrag (original) | `de6d925c-35b1-41d3-8294-577425346734` | order med produkten | 21 d (Axels) | 24 |
| F10 Tips termoskydd (original) | `e09a5094-d309-4b60-8274-f76a23ab3bd4` | order med produkten | 21 d (Axels) | 11 |
| F11 Tips båtmotorskydd (original) | `a94ef839-d686-408b-b6d9-a5434e07932c` | order med produkten | 21 d (Axels) | 14 |
| F12 Tips IBC-överdrag (original) | `74c973b4-7024-478d-915f-88beccad5dd8` | order med produkten | 21 d (Axels) | 3 |
| **F13 Tips sätesöverdrag v2** | `ecdbd45a-b271-4443-939b-41905042895f` | order med produkten | 21 d | 0 |
| **F14 Recension Trustpilot v2** | `9bef2ef0-0cf8-46b1-95f8-012d0d406e2d` | order skapad, max var 90:e dag | 22 d, kl 18:00 | 8 |

F03 och F08–F12 är orörda original: granskningen hade inget fel i dem utöver F03 E2:s
förhandstext och F11 E1:s fasta pristext (båda små, öppna i KVAR.md). Väntetiderna 21 d i
tipsflödena och 22 d + 18:00 i F14 är Axels egna ändringar i appen 2026-09-26 och rörs inte.

### Originalen: triggern av, det här får de som redan låg i dem

| Original | Spoks-id | Sändstegen | Inrullade | Vad de får |
|---|---|---|---|---|
| F01 Välkomst | `b8165fed-50a2-42e4-a275-494433d3f7f0` | "Axel här. Jag driver Bäverbutiken." på (ingen ny rullar in), **"Tanköverdraget, slipmaskinen och två till" AV 07:55 CEST**, "Så funkar det när du handlar hos oss" AV 09:03 | 87 | ingenting mer — citatmejlet skulle ha gått mån 28/9 09:03 |
| F02 Övergiven kassa | `df764d97-2fb0-4469-8675-6337edcb7b1b` | "Din kundvagn är fortfarande packad" på, **"Tre frågor du kanske har innan du betalar" AV**, "Sista mejlet om din kassa" på | 2 | mejl 1 och 3 |
| F04 Efter köp | `786d2580-b0e1-4e98-bc3d-404c435db62a` | båda AV sedan 2026-09-26 10:17 | 11 | ingenting (lyckohjulet och "ADD COUPON HERE: TACKIGEN" hann aldrig gå ut) |
| F04 Efter köp v2 (kredit) | `bfc5beee-5ef6-40ee-8a80-634c59a7d695` | "Din beställning är på väg" **PÅ**, "Kom allt fram som det ska" AV | 96 | kreditmejlet 3 d efter ordern, med den gamla raden "exakt var ditt paket är" — valt hellre än att 96 köpare blir utan KREDIT100 |
| F05 Vinna tillbaka | `d27ea9f1-a609-425a-a7f5-8d900fecc366` | "Det har hänt en del sedan sist" **PÅ**, "Tre prylar för säsongen" AV | 123 | mejl 1, tidigast januari 2027 |
| F07 Motorhölje till båtmotorskydd | `84cd7589-d549-4ad7-ab9d-c711384a4396` | båda på | 0 | ingenting |
| F13 Tips sätesöverdrag | `f6186338-08a1-41e6-beed-e61689a2f2d0` | på | 1 | tipsmejlet med "fyra färger" |
| F14 Recension Trustpilot | `23d2710c-1a33-44c3-bb25-df1f691b6161` | AV | 115 | ingenting — ingen recensionsförfrågan alls (gating-mejlet skulle ha gått ~18/10) |

⚠️ **Den stora flödesknappen i appen stänger bara triggern** (`trigger.isActive=false`, flödets
`isActive` står kvar true) — de inrullade fortsätter genom stegen. Ett mejl som inte får gå ut
måste stängas av på sitt eget sändsteg. Det är därför tabellen ovan skiljer på trigger och steg.

### ⚠️ F04 Levererat är oprövat

Axels fråga 2026-09-27 ("vi kör väl triggern på att när paketet kommit fram?") gav ett eget
flöde på `order_delivered` i stället för v3:s mejl 2 på dag 21. Händelsen har aldrig triggats i
den här workspacen: spårningsrutinen (`/sparning`, varje timme :16) skriver leveransskanningarna
in i Shopify som fulfillment-event, och Spoks ska läsa dem som levererat, men det är inte mätt
(söndag 27/9 levereras inget, så 0 inrullade säger inget än). **Kontroll: `get_flow
0b2beeb0-…` → `contactsEnrolledCount` ska stiga när måndagens leveranser skrivits in.** Står
den kvar på 0 tisdag 29/9: slå på "Kom allt fram som det ska" i F04 Efter köp v3 igen (Axels
klick, https://app.spoks.com/baverbutiken/flows/3c8443d3-4916-40ad-b83e-5345c8752c2e). Det
steget går 16 d efter kreditmejlet, så ingen köpare hinner passera det under tiden.

**Varför 5 dagar i F04 v3** (Axels fråga "säker på att tidshorisonten är rätt?"): ordern →
skickad går inte att mäta härifrån (Shopify svarar 403 för ordrar i den här miljön), men
brandfilen säger packtid 1–2 arbetsdagar och spårningsdatan att första skanningen kommer i
median 4,1 dygn efter bokningen (p90 7,3). Med 3 dagar hade var tredje kund fått "din
beställning är på väg" innan paketet rört sig. Axel satte 5 dagar (delay 432000000 ms, 09:02
CEST). Mät om när Shopify-ordrarna går att läsa.

### Kampanjerna

**K01 v2 `0c760c3e-3eec-4fc0-b40f-3ec16b37e330` är SCHEMALAGD tis 29/9 18:00**
(`waiting_to_be_published`, `publishDate` 2026-09-29T16:00Z, mätt 09:30 CEST). Publiken
Warmup tier 1 valde Axel i appen — publiken går inte att läsa via MCP. **Gamla K01
`51c37c20-e00c-48c2-b144-089e62f62d14` (med citaten) är återkallad till utkast** 08:17 CEST.
K02–K22 är utkast; K18 får inte schemaläggas utan ny topp 3-mätning (KVAR.md).

### Regler ur de två dagarna (för nästa som ger Axel klick)

- **Appen visar ÄMNESRADEN**, på mejlsteg och på kampanjer. Våra koder ("F01", "K01 v2") syns
  bara i flödeslistans namn. Skriv ämnesraden eller direktlänken
  (`https://app.spoks.com/baverbutiken/flows/<id>`, `https://app.spoks.com/baverbutiken/post/<id>/edit`),
  aldrig "mejl 2" och aldrig "K01" (Axel 2026-09-27: kampanjerna "heter inte F01 eller F01V2, de
  heter 'taket du aldrig går upp och kollar på'").
- Steg som MCP:n byggt saknar `parameters.name` i `get_flow`; de importerade originalen har
  namnet = ämnesraden. Beskriv ett namnlöst steg med ämnesraden och ordningen.
- Sändsteg skapade via MCP är alltid av, och ett aktivt flöde går inte att ändra via MCP. Fel i
  ett live-flöde = bygg en rättad kopia inaktiv, Axel slår på kopian och av originalets trigger
  + de sändsteg som inte får gå ut. Be honom aldrig skriva om text i appen.
- Max fem klick per meddelande, en mening per rad, exakta namn — och läs varje klick tillbaka
  med `get_flow`/`search_campaigns` innan nästa lista. (Axel bröt själv femregeln till slut:
  "Jag har ju inte ens aktiverat alla flöden nu ju!" — då gavs de sista 17 på en gång.)
- Byt aldrig väntetiderna i F08–F14: de är Axels.

### Historik: varför F04 byttes 2026-09-26, KREDIT100, avsändaren, importen

**Varför F04 byttes (2026-09-26):** gamla F04 E1 bar lyckohjulet ("Snurra hjulet, vinn en
gratis produkt", knappen till `/pages/din-gratisprodukt`) och en trasig importrad från Klaviyo,
**"ADD COUPON HERE: TACKIGEN"**, i klartext. Hjulet ersattes samma morgon av butikskrediten
(Axels beslut, hjulet gav 0 köp), så en ny version byggdes: **v2 E1** "Din beställning är på
väg" med spårningsknappen och blocket "100 kr rabatt på nästa köp" → knappen HÄMTA MIN RABATT
till `https://baverbutiken.se/discount/KREDIT100?redirect=%2Fcollections%2Fall`; **v2 E2** "Kom
allt fram som det ska". Gamla E1 hann aldrig gå ut: första inrullningen var 09:02 och väntan
är 3 dagar, stegen stängdes av 10:17. ⚠️ De 11 som beställde 09:02–10:16 ligger kvar i gamla
F04 och får alltså inget F04-mejl alls (båda stegen av) — Shopifys egna ordermejl når dem ändå.
Dagen efter ersattes v2 i sin tur av v3 (kopian ovan), av skälen i KVAR.md.

**KREDIT100 i Shopify** (mätt med Spoks `discounts_search`, källa shopify): 100 kr av, köp från
299 kr, en gång per kund, kombineras bara med fraktrabatter, aktiv sedan 2026-09-26 08:03 UTC,
inget slutdatum.

**Avsändaren** (mätt med `get_settings` 2026-09-26): Bäverbutiken `kundsupport@baverbutiken.se`,
reply-to samma.

Flödena F01–F13 fanns redan: Spoks importerade dem själv från Klaviyo med
innehållet. Sessionen rättade det importen missade: tipsflödena och F07 hade
ingen trigger alls, väntan 12 dagar i stället för 14, och F07 filtrerade på
"totalt antal ordrar" i stället för om kunden redan köpt båtmotorskyddet.
Dubbletten `e2ff6c1d-…` ("RADERA dubblett (tom)") finns inte längre i `get_flows`.

Kampanjerna K01–K22 byggdes som utkast (Spoks: status draft, avregistreringslänk på).
Gamla K01 schemalades av Axel 2026-09-26 och återkallades 2026-09-27 när K01 v2 tog dess plats.

## Rättade kopior (v2/v3) — vad varje kopia rättar mot originalet

Granskningen i `baverbutiken/KVAR.md` hittade falska "verifierad kund"-citat (F01 E2, K01),
review gating (F14), ett brutet spårningslöfte och dubbelt KREDIT100 (F04 v2) och en rad
mindre fel (F02, F05, F07, F13). MCP:n kan inte ändra ett live-flöde (mätt 2026-09-26 18:29
CEST: `update_flow_step` på F01 svarar "Cannot edit a step in an active flow"), så varje flöde
fick en **rättad kopia byggd inaktiv via MCP**; Axel slog på kopiorna 2026-09-27 (tabellen
"Det som skickar nu" ovan). Väntetiderna är originalens, inklusive Axels 21 d i F13 och 22 d +
18:00 i F14 — utom F04 v3 där Axel satte 5 d.

| Kopia | Spoks-id | Post-id (E1, E2, E3) | Vad som rättats mot originalet |
|---|---|---|---|
| **F01 Välkomst v2** | `f11d04ab-1789-4a88-9abb-a3aaf6e4219d` | `491d1b99…`, `b1f70673…`, `03544d7c…` | E2 utan citaten (Karin/Erik), ny förhandstext; E3 utan "från beställning till dörren" och "jag svarar själv"; stegfilter på E2 och E3: inget köp ELLER köp före inrullningen |
| **F02 Övergiven kassa v2** | `f98eb12e-f7a2-4b0b-ae02-f738776b5282` | `c9376a0b…`, `518fe1b7…`, `ee9050d8…` | E2: kassans varor (abandonedCart) i stället för "senast visade produkt", de tre frågorna besvarade; E3 "så svarar vi"; återinträde tidigast efter 7 dagar |
| **F04 Efter köp v3 (kredit)** | `3c8443d3-4916-40ad-b83e-5345c8752c2e` | `46400d0d…`, `77dcaccd…` | E1: "skriv in paketnumret från leveransmejlet", villkoren en gång + "går inte ihop med andra rabatter", "så hjälper vi dig"; E2: rubriken "Tre prylar till att kika på" — **steget AV sedan 2026-09-27, ersatt av F04 Levererat**; **inget återinträde** (KREDIT100 är en gång per kund); väntan 5 d (Axel 2026-09-27) |
| **F04 Levererat (kom allt fram)** | `0b2beeb0-5288-46cb-80a2-2845bd05b7c5` | `1a15ed11…` | nytt flöde: "Kom allt fram som det ska" på `order_delivered` + 1 dygn kl 10:00, i stället för dag 21 efter ordern (Axels idé 2026-09-27); oprövat, se ovan |
| **F05 Vinna tillbaka v2** | `3ef1aab0-24b1-4c84-80a4-840f7a4cc637` | `dd221fc0…`, `e28604a8…` | E1: Bävertratten som belagt återköp + Marin Motorhölje och Fiskespöhållare i raden; E2: "Tre prylar till att kika på", Bävertratt i stället för adventskalendern |
| **F07 Motorhölje till båtmotorskydd v2** | `98d46ff1-fb25-44b6-8916-2297198e5ea6` | `897f1a24…`, `1e016b67…` | E1: motsäger inte längre produktsidan ("skyddet går ända ner över riggen"); E2: "Mer för båten", utan spöhållaren (inte båtprodukt, Axel 2026-09-25) och utan påhittat "andra båtägare"; priserna som Spoks produktblock (följer Shopify) |
| **F13 Tips sätesöverdrag v2** | `ecdbd45a-b271-4443-939b-41905042895f` | `c8a399d8…` | "Finns i flera färger" (bara grå och svart i lager) |
| **F14 Recension Trustpilot v2** | `9bef2ef0-0cf8-46b1-95f8-012d0d406e2d` | `34f9ce74…` | alla fem stjärnor till Trustpilot (Axels val A 2026-09-27 av A = allt till Trustpilot / B = allt till Judge.me), ingen Judge.me-länk; 22 d + 18:00 och återinträde 90 d som originalet |

Stegen i kopiorna saknar `parameters.name` i `get_flow` (MCP:n sätter inget) — i appen
identifieras de på ämnesraden. K01 v2 `0c760c3e-3eec-4fc0-b40f-3ec16b37e330` (utan citaten,
storleksraden "nio längder, 5,5 till 13,5 meter") ersätter gamla K01 `51c37c20-…`.

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

## CaraShell (workspace `38f3d430-690c-4c0b-8419-8ec2e5272148`, UPPLADDAT 2026-09-26, danskan 2026-09-27, allt avstängt)

✅ **Danska sedan 2026-09-27** (Axels order: "vi behöver liksom egentligen ha flows för alla
aktiva marknader bara. Så det är Sverige, Norge, Danmark, USA och Australien" + "utifrån de får
vi anpassa copyn"). Mätt före bygget: **25 av 26 danska ordrar har `customerLocale` da-DK** —
danskarna handlar på danska, så de fick inte längre de svenska mejlen. Fyra språkgrupper nu:
**sv** = Sweden + utan land, **nb** = Norway, **da** = Denmark, **en** = US/UK/CA/AU/NZ + Finland
(Finland: 7 ordrar, inte en aktiv marknad, står kvar i engelskan). Byggt och uppladdat samma
förmiddag, allt avstängt/utkast:
- **Danmark ut ur det svenska:** de 8 svenska flödenas triggerfilter (`update_flow`) och de 4
  svenska segmenten (`update_segment`, inga utkast använde dem): `SEG_samtycke_sv` 15 → 13.
- **4 danska segment, 8 danska flöden (15 mejl, alla sändsteg av), 14 danska kampanjutkast**,
  id:n i `spoks-id.json` (`da`). Titlarna följer de andra: `K01 DA …` internt — i appens lista
  syns ämnesraden, så **Axel söker på ämnesraden, aldrig på "K01"** (hans skärmdump 2026-09-27:
  sökningen "k01" gav 0 träffar).
- **Copyn:** två Sonnet-subagenter mot faktabladet `innehall/carashell/fakta/da.json` (butikens
  egna danska översättningar), granskad av huvudsessionen: fem språkrättningar ("den" syftade
  på paketet i monteringsmejlen, "bygger" → "laver", ordföljd) och K12 "hvor du bor" → "hvor
  vognen står". Danskan speglar engelskan i K04/K06 (ingen farsdag i november i Danmark: K04 =
  vinden, K06 = julklappen). **Inga svenska kundcitat i danska mejl** (`citat: false`, som
  engelskan — K01 och K09 tappar citatblocket). Ingen reklamationstid i danskan: den danska
  policysidan nämner bara fortrydelsesret, och ingen siffra hittas på.
- **Länkarna:** alla `carashell.se/da/…?country=DK` svarar 200 med `lang="da"` och DKK (även
  tilläggsprodukterna); Trustpilot `dk.trustpilot.com/evaluate/carashell.se?stars=1–5` 200.
  Black Week-rabatterna är inte marknadsbegränsade, så trappan gäller i DKK också.
- **Spårningssidan på danska:** `sparning/butiker.json` → carashell `sprak_extra` fick `da`, så
  `carashell.se/da/pages/spara` blir dansk vid nästa timkörning (test i `sparning/test/sida.test.mjs`).
  ⚠️ Shopifys egna fraktmejl till danska kunder är fortfarande svenska (`mejl_marknader` har ingen
  DK-rad) — en ny mall kräver en inklistring i Shopify (Cowork), inte gjort.
- **Kontroll:** `get_flows` 32 flöden (8 per språk), alla avstängda, 0 inskrivna; `get_flow` på
  alla 8 danska mot `plan.json`; `search_campaigns` 56 utkast, 0 publicerade; `get_segments`:
  samtycke sv 13 + nb 4 + en 61 + da 3 = **81 = Spoks "All subscribed"** — varje kund med
  samtycke hamnar i exakt ett språk.

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
  Rot-SPF:en saknade `include:sendgrid.net` vid uppladdningen (Spoks godkände domänen ändå, SendGrids
  egen `em…`-CNAME bär SPF för avsändarvägen); mätt 18:50 samma dag bär den
  `v=spf1 include:spf.loopia.se include:sendgrid.net -all`. carashell.se saknar DMARC, men mejlen
  går från carashell.com, som har den. Webbsäkra reservtypsnitt står kvar på
  Helvetica/Arial Black (ändras inte via MCP:n, syns bara om Google Fonts inte laddar).
- **13 segment** (`SEG_samtycke_sv/nb/en` 15/4/57 …, `SEG_oengagerade_180d` inte valbart i kampanjer).
  Sedan danskan 2026-09-27: **17** (sv/nb/en/da 13/4/61/3).
- **24 flöden, 45 mejl** (8 per språk), alla `isActive: false`, alla sändsteg `isEnabled: false`.
  Sedan danskan: **32 flöden, 60 mejl**.
- **42 kampanjutkast** (14 per språk: 39 vid uppladdningen + K09B efter Black Week-beslutet),
  status draft, ingen publik, inget datum, `isOptOutEnabled`. Sedan danskan: **56**.
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

⛔ **PÅSLAGET av Axel 2026-09-27 08:48–08:53 CEST: 29 av 32 flöden** (mätt med `get_flows`; alla
sändsteg på). Att slå på ett flöde = sändstegen på ett i taget i flödesredigeraren,
sedan flödet (samma som Matstrumpor). F14 (recension) väntade på Trustpilot: evaluate-sidan för
carashell.se svarade 404 2026-09-26 11:40 och **200 kl 18:50** ("Rate Carashell", Axel skapade
profilen), och alla 15 stjärnlänkar i F14 (3 språk × 5) svarade 200.
**Tre flöden var kvar 09:05 CEST** (Axels ord: "misclicks, jag minns inte vad jag tryckte på"):
`FLOW_prenumerant_valkommen_SV_v1` hade fått triggern **ändrad till `order_created`** (välkomstmejlen
hade gått till varje svensk köpare med samtycke i stället för till nya prenumeranter) — återställd
till `contact_created` med `update_flow` (filter och steg orörda, tillbakaläst), Axel slår på
triggern; `FLOW_levererat_termoskyddet_DA_v1` orörd men av (sändsteg + trigger = Axels klick);
`FLOW_visning_webbhistorik_SV_v1` var redan på och rätt (skärmdumpen var tagen före sista klicket).
25 av 32 flöden lästes tillbaka i detalj mot `plan.json` efter påslaget (event, land, väntetider,
steg): alla rätt. ⚠️ **Spoks rate-limitar `get_flow`** — 8 parallella anrop efter ~25 i följd gav
"Rate limit exceeded. Try again in 11 seconds"; de 7 danska lästes därför i en senare check-in,
EN I TAGET. **Kampanjerna:** de fyra första schemalagda av Axel samma morgon (`waiting_to_be_published`,
går inte att ändra via MCP:n — bara utkast): sv/nb/da tisdag 29/9 18:00 rätt, **engelskan hamnade på
söndag 27/9 18:00** (2026-09-27T16:00Z) i stället för tisdag 16:00 — Axel flyttar den själv; en
check-in 15:30 CEST läser om. Publiken (segmentet) syns inte i `get_campaign`, så den går inte att
kontrollera från en session.

**Samtycket per land, mätt i Shopify 2026-09-27** (487 kunder; `emailMarketingConsent` +
`consentUpdatedAt` mot orderns `createdAt`): **USA 59 av 77 (77 %)**, GB 1 av 5, **DK 3 av 28
(11 %), SE 12 av 198 (6 %), AU 2 av 32, NO 4 av 99 (4 %)**, FI 0 av 8, NZ 0 av 4, CA 0 av 3, 33
utan land 0. **Varje ja utanför USA gavs i kassan** (samma sekund som ordern, `SINGLE_OPT_IN`) —
rutan finns alltså i alla marknader; skillnaden är att den är **förikryssad bara i USA** (tillåtet
där), medan EU/EES, UK, AU, NZ och CA kräver att kunden själv kryssar, och då gör 4–11 % det.
Axels fråga "har jag glömt att samla in samtycke?" ⇒ nej. Kampanjerna når därför 81 av 488
kontakter; köparflödena (efter köp, levererat, recension, vinback) går till alla köpare som inte
tackat nej (egna kunder, MFL 19 § 2 st, samma beslut som 2026-09-25). Enda lagliga spaken för
fler ja är rutans egen text i kassan (Shopifys standardtext är "Skicka nyheter och erbjudanden
till mig via e-post") — inget popup (Axels regel).

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
kampanjerna. sv = Sweden + kontakter utan land; nb = Norway; da = Denmark (egen grupp
sedan 2026-09-27, var till dess i sv); en = United
States, United Kingdom, Canada, Australia, New Zealand, Finland (7 ordrar bär inte
ett finskt system). Ordrarnas `customerLocale` bekräftar att land ⇒ språk håller
(SE 173/173 sv, NO 67/82 nb, US 59/59 en, DK 25/26 da). ⚠️ Landsnamnen för de andra länderna är
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
- Trustpilot hade ingen profil för carashell.se vid bygget (`evaluate`-sidan 404, Bäverbutikens
  308). Profilen finns sedan 2026-09-26 eftermiddag (200, se ovan).
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
4. ✅ Trustpilot-profil för carashell.se (sidan svarade 200 kl 18:50, stjärnlänkarna fungerar).
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
