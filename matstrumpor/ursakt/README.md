# Ursäktsmejlet om leveransförseningen (Matstrumpor, 2026-10-03)

Axels order 2026-10-03: "ett vi ber om ursäkt mail på matstrumpor … till alla kunder som köpt de
senaste 10 dagarna … det kan bli försenat med upp till 5 - 10 arbetsdagar på grund av en störning
i leveranskedjan. Och vi erbjuder alla som har ett paket som inte gått iväg än en full
återbetalning. Jag vill sätta upp ett flow som också kommer vara igång i 6 dagar till … Men skicka
eller lansera inget."

⛔ **Inget är skickat, schemalagt eller påslaget.** Allt ligger i Spoks som utkast och avstängt.

## Omskrivet 2026-10-03 förmiddag (Axels order)

Axel ville att kunderna ska känna med oss och hellre vänta än ta pengarna: ny svensk text av en
sonnet-skribent, plus hans tre tillägg (svara med ordernumret och skriv att du vill avbryta ordern och
få en återbetalning; MS-numret står i fraktmejlet; "Du kan spåra ditt paket via den här länken:").
Återbetalningen står kvar tydlig och utan skuld. Tolv språk översatta av sonnet, `bygg.mjs` grönt,
alla 13 kampanjutkast och 12 av 13 flödesmejl uppdaterade i Spoks och lästa tillbaka (`koll.mjs`
25 av 26). ⚠️ Flödets SVENSKA sändsteg är påslaget (Axel, 05:38 UTC) och Spoks vägrar då ändra mejlet:
det bär gamla texten tills steget slås av, uppdateras och slås på igen. Testkopian
"TEST av flödesmejlet sv" `ec246ff3-…` bär den nya texten.

## Vad som finns

| Del | Var | Läge |
|---|---|---|
| Texterna, 13 språk | `sprak/<kod>.json` | svenskan av en sonnet-skribent, de tolv andra av en sonnet-översättare, lästa av en skeptisk granskare |
| Kontrollerna + planen | `bygg.mjs` (`--kolla`), tester i `test/bygg.test.mjs` | stoppar tankstreck, andra tal än 5-10, okända tokens, japanskans stopp ur brandfilen |
| Tillbakaläsningen | `koll.mjs` | jämför Spoks egna svar ur sessionsloggen med planen: 26 av 26 lika 2026-10-03 |
| Segment per språk | Spoks, `SEG_ursakt_kopt_fran_23_9_<sprak>` | köpt från 23/9, alla köpare som inte tackat nej, landet → språket |
| Kampanjutkast per språk | Spoks, `URSAKT · <sprak> · …` | utkast, ingen publik, inget datum |
| Flödet | Spoks, "Ursäkt leveransförsening · alla språk · beställningar till och med 9/10" | AV, alla sändsteg AV |
| VA:ns instruktion | `kundtjanst/va-sop/matstrumpor-delivery-delay-refunds.md` (engelska) | i Notion 2026-10-03 (`3ee270ab-…`), Mechile meddelad i Discord `#customer-service` samma dag |
| Klicken i appen | `cowork/1-skicka.txt` | körs först när Axel säger till |

Id:n för allt som laddats upp står i `uppladdat.json`. Flödet:
https://app.spoks.com/matstrumpor/flows/7420cfc7-5ee8-416b-b1a6-08c7a2d301bb (26 steg, 13 sändsteg,
läst tillbaka med `get_flow` 2026-10-03: flödet, triggern och alla sändsteg av, 0 inrullade).
⚠️ Appens kampanjlista visar ämnesraden, inte titeln: den svenska heter där "Din leverans från
Matstrumpor kan dröja". Länkarna per språk står i `cowork/1-skicka.txt`.

Segmenten vid skapandet 2026-10-03 07:00: sv 466, pt 17, fi 9, en 8, ja 8, fr 7, it 6, de 5, da 4,
nl 4, es 4, pl 3, nb 1 = 542.

## Hur det är byggt

- **Publiken mäts på kontaktfältet `lastPurchase`**, inte på händelsen `orderedProducts`: händelserna
  finns bara sedan Spoks kopplades 26/9 (mätt 2026-10-03: 429 mot 559). Spoks tar bara `gt`, `lt`
  och `between` på fältet.
- **Alla köpare, inte bara klubbmedlemmar** (`emailMarketingConsent` subscribed eller not_subscribed,
  inte spärrad), som F04 Efter köp. Det är ett servicemejl om kundens egen order, så det bär ingen
  reklam. Mätt 2026-10-03: 559 köpare sedan 23/9, 542 nåbara (458 med samtycke, 84 utan), 17
  har tackat nej eller är spärrade och får inget.
- ⚠️ **Om Spoks skickar en KAMPANJ till kontakter utan samtycke är inte mätt.** Flöden gör det (F04).
  Cowork-prompten läser av mottagarantalet innan något skickas: visar Spoks ungefär antalet med
  samtycke i stället för hela segmentet, då når kampanjen inte de 84 utan samtycke, och det är
  Axels beslut hur de ska nås.
- **Flödet** startar på `order_created`, väntar ett dygn (Axels ändring i appen 2026-10-03, byggt med en timme) och har
  ett sändsteg per språk med samma landsfilter som de andra Matstrumpor-flödena
  (`klaviyo/spoks-sprak.mjs` → `sprakFilter`). Varje sändsteg kräver dessutom att kundens senaste
  köp är före 10/10 00:00 svensk tid (eller att fältet är tomt), så **flödet slutar skicka av sig
  självt efter sex dagar** utan att någon behöver komma ihåg att stänga det. Slås det på senare än
  3/10: ändra `flode_slut` i `konfig.json` och bygg om flödet innan det slås på.
- **Kampanjen säger att den som redan fått paketet kan bortse från mejlet**, flödet börjar med ett
  tack för beställningen. Allt annat är samma text.
- ⚠️ **Spoks sidfot är klubbens** ("Du får det här för att du själv anmälde dig till
  Matstrumpor-klubben"). Den finns en gång per arbetsyta och syns därför även i det här mejlet till
  köpare utan samtycke, precis som i F04 Efter köp sedan 2026-09-26.

## Återbetalningen

Mätt i Shopify 2026-10-03 07:00: 568 ordrar sedan 23/9, **45 inte skickade (25 733 kr)**, den
äldsta från 1/10.

⚠️ **"Skickad" i Shopify betyder bara att etiketten är gjord** (Axels fråga samma morgon, mätt med
17TRACK:s `gettrackinfo` på alla 523 spårningsnummer, 0 avvisade): **461 paket har bara händelsen
"Shipment information received"**, alltså att leverantören skapat etiketten men inte lämnat paketet
till fraktbolaget. Det gäller ordrar ända från 24/9. Bara 62 paket har en riktig skanning (exportklarerat,
flyget avgått, framme), varav 1 levererat; ingen order lagd efter 30/9 har rört sig. I pengar:

| Läge | Ordrar | Värde |
|---|---|---|
| Ingen etikett (ej skickad i Shopify) | 45 | 25 733 kr |
| Bara etikett, inget fraktbolag har skannat | 461 | 212 339 kr |
| Har rört sig hos fraktbolaget | 62 | 24 843 kr |

✅ **Axels beslut 2026-10-03: B — alla paket som inget fraktbolag skannat** (~506 ordrar, ~238 000 kr
vid mätningen), inte bara de 45 utan etikett. VA:n avgör per order på spårningssidans rubrik:
"Paketet är bokat" (bara etikett) eller ej skickad ⇒ full återbetalning; "Paketet är på väg" eller
senare ⇒ erbjudandet gäller inte. Kunden svarar på mejlet; autosvaret flaggar återbetalning till VA:n
(det återbetalar aldrig själv), och VA:n följer Notion-sidan "Matstrumpor delivery delay — who gets a
refund". ⚠️ Ett återbetalt paket med etikett kan ändå skickas av leverantören; att stoppa det är inte
löst.

⚠️ Autosvaret svarar fortfarande på "var är mitt paket" med det vanliga leveranslöftet
(`kundtjanst/brands/matstrumpor.yaml` → `svar`). Det har inte ändrats.
