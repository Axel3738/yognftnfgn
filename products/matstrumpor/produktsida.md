# Produktsidan och funneln mot köparens invändningar — mätt 2026-09-25

Underlag till Axels fråga samma dag: "Hur kan vi garantera att vi dödar
dessa invändningar på vår produktsida och i vår funnel?" Invändningarna är
de fem rädslorna och fem önskningarna i hans strategidokument (sidan 7,
"What they want, and what they fear"). Själva dokumentet finns inte i
repot, Drive, Notion eller artifact-listan — bara Axels utdrag.

Allt nedan är AVLÄST 2026-09-25: produktsidan och startsidan (HTML +
huvudtemat "Matstrumpor CRO + storleksrad 2026-09-17" via Shopify-API:t),
Shopify-ordrar via appen Fabriken, Judge.me:s widget, kundtjänstrapporten
W39. Ingen siffra är uppskattad.

---

## Vad sidan säger i dag (https://matstrumpor.se/products/sushi-strumpor)

| Element | I dag | Problem |
|---|---|---|
| Recensioner | **8 st** på sushi (5★ ×5, 4★ ×2, 3★ ×1, snitt 4,5), **0** på pizza/hamburgare/donut, inga foton. 7 av 8 kom via Shop-appen, **1 via butiksinbjudan** (Kent, 16/9) | Judge.me:s automatiska förfrågningar har troligen inte gått ut under säsongen (3 911 ordrar ⇒ 8 recensioner = 0,2 %). Sidan visar även "Lång leveranstid" som recension bredvid löftet 5–10 arbetsdagar |
| Bilder | 9 st. Riktiga foton: 1, 2, 3, 5, 9 (leverantörens WhatsApp-bilder). **AI/CGI: 4 (openart), 6 (avif), 7 (openart), 8 (avif)**. Ingen människa, ingen fot, ingen uppackning | Rädsla 4 ("ser sämre ut än i annonsen") och 5 ("tunna, fula utrullade") möts inte. Beskrivningen slutar med **"Soffbilden är en AI-genererad illustration."** — men ingen soffbild finns bland de nio; raden hänger kvar och underminerar |
| "Älskad av tusentals svenskar" | Står på **startsidan** (index.json: `ms_usp` och `ms_marquee`), inte på produktsidan. Sant i data: **3 776 kunder** med minst en order, 3 911 ordrar | Påståendet saknar bevis där det står; startsidans galleri "Som de används" har raden "Miljöbilderna är AI-genererade illustrationer." |
| Leverans | "5–10 arbetsdagar" i trust-raden, beskrivningen och FAQ (två gånger) | Mätt på 76 levererade ordrar sedan 1/8: **median 11,6 dygn, p90 15,0**, **16 % över 10 arbetsdagar, 0 under 5**. Ingenstans står varifrån paketet skickas (YunExpress, första skanning Rozenburg NL eller Malmö) |
| Skatt/tull | Varukorgen: "Skatter ingår. Rabatter och fraktkostnad beräknas i kassan." Shopify: `taxesIncluded: true`, varianterna `taxable: true`, **0 kr skatt på de 50 senaste ordrarna** (inga taxLines) | Kvittot säger "skatter ingår" men bär ingen momsrad. Kassan gick inte att kontrollera härifrån (kräver köpflöde). Villkoren nämner bara "avgifter via tredjepartsbetalningar" |
| Material | **Saknas helt** på alla fyra produktsidor. Enda raden: "Passar strl 36–44 · stretchigt material" | Tre kunder frågade om material/kvalitet 29/8, 8/9, 11/9 — **ingen fick svar** (W39: 10 ärenden, 0 besvarade, INBOX.Sent tomt sedan 2026-06-09) |
| Storlek | Variantväljare "Storlek: One Size" | En kund (29/8) trodde hon glömt fylla i storlek. Väljaren skapar tvivel utan att välja något |
| Erbjudandet | Köp 1 – Få 1 / Köp 2 – Få 2 med ätpinnar "värde 100/200 kr" | Priset "1,796 kr" har engelsk tusentalsavgränsare (ska vara "1 796 kr") — ser utländskt ut |
| Betalning | Klarna, kort, Apple/Google Pay, PayPal, Shop Pay i FAQ + ikoner | En kund frågade "Ska jag betala innan jag fått varorna" (15/9), obesvarad. Om Klarna faktura är på ska det stå vid köpknappen |
| Brådska | Ingen | Annonsens enda bevisade brådska, "dom sålde slut i november" (Nathalie, bekräftad av Axel 24/9), finns inte på sidan |

Sektionsordningen i produktmallen: huvudprodukt (trust-rad, leveransestimat,
paketblock, storleksrad, mix-block) → Judge.me → FAQ → sticky köpknapp.
Startsidan: hero → USP-rad → marquee → bästsäljare → berättelse → sortiment
→ AI-galleri → fyra handplockade recensioner → "Handla tryggt" → FAQ →
garanti.

## Funneln runt sidan

- **Annons → sida:** alla annonser landar på `/products/sushi-strumpor`
  (`matstrumpor/konfig.json`), copyn "Ingen jublar åt tvättmedel…" är samma
  som sidans. Konsekvent — men sidan bär inget av annonsens bevis (riktig
  människa, riktig reaktion, "sålde slut i november").
- **Efter köp:** spårningssidan `/pages/spara` är live, Klaviyo-flödena
  F01–F07 ligger som utkast (inget påslaget, postadress saknas i kontot).
  Fraktbolagets FAILURE-skanning skrivs som "Ett problem uppstod med
  leveransen. Mejla kundsupport@matstrumpor.se" — en brevlåda ingen svarar
  från.
- **Kundtjänst:** autosvaret kör TORRT på Railway sedan 23/9; produktfrågor
  klassas SVÅR och flaggas bara. Förköpsfrågor dör alltså i inkorgen.
- **Recensioner:** `klaviyo/PROMPT-matstrumpor-recension.md` bygger ett
  Trustpilot-flöde — men produktsidan visar Judge.me. Recensioner ska landa
  där sidan visar dem.

## Invändning → det som dödar den (förslag, inget genomfört)

| Invändning (Axels dokument) | Dödas av | Kräver |
|---|---|---|
| Rädsla 1: tyst uppackning | Riktig reaktion i bild på sidan: stillbilder/klipp ur Nathalies annons (verklig kreatör, vännen öppnar och skrattar) + recensionerna som nämner mottagaren ("mottagaren vart så glad", "Uppskattat och rolig present") lyfta överst | Klipp ur `advideos` (tools/qa-frames.py); Axels ok att använda Nathalies material på sidan |
| Rädsla 2: ser lat/stereotyp ut | Copyn finns redan ("Ingen jublar åt tvättmedel"). Bevis: lådan som "ser ut som takeaway" i första bild + dokumentets undersökningssiffra (Bring/Kantar Sifo) **bara om källan verifieras med år och länk** | Källkoll |
| Rädsla 3: kommer sent/krossat | Byt intervallet mot ett datum i säsong: "Beställ senast 8/12 för leverans till jul" (p90 15 dygn, `klaviyo/brands/matstrumpor.json`), skriv varifrån det skickas, foto på ytteremballaget, spårningssidan länkad från sidan | Foto på emballaget (Axel/leverantör); beslutet om datumet |
| Rädsla 4: sämre än annonsen | Ta bort de fyra AI-bilderna och AI-raden; ersätt med riktiga foton (kundfoton via Judge.me-förfrågan med bild, stillbilder ur UGC) | Riktiga bilder |
| Rädsla 5: tunna, fula utrullade | Materialsammansättning + tjocklek + tvättråd på sidan, foto på strumporna utrullade på en riktig fot | Materialet från leverantören/etiketten (finns inte i repot) |
| Önskan 1: ett riktigt skratt | Samma som rädsla 1 | — |
| Önskan 2: hamnar inte i lådan | Recensioner från användning ("Jätte sköna strumpor") + tvättråd + "5 par" i klartext | Fler recensioner |
| Önskan 3: "har allt"-personen snabbt | Köp 2 – Få 2 = fyra presenter klara; formulera det så | Copy |
| Önskan 4: vinna presentleken | "Förra året tog sushilådan slut i november" (sant) + riktigt antal köpare i stället för "tusentals" | Sant tal ur Shopify vid varje ändring |
| Önskan 5: "jag vet vad du älskar" | Mix-blocket (sushi/pizza/hamburgare/donut) med rubrik om favoriträtten | Copy |

## Gjort 2026-09-26 (Axels svar B på recensionsfrågan)

- **Sidan, live och tillbakaläst samma dag:** AI-soffbilden (`matstrumpor_52_alla_fotter_soffan.jpg`,
  inbäddad i beskrivningen — den visade dessutom strumpor som inte är våra) och raden
  "Soffbilden är en AI-genererad illustration" borta; **fyra AI/CGI-bilder borta ur
  galleriet** (media-id 57670893666643 `openart-f0afefca…_2.png`, 57670894158163
  `b9c28ae5…_2.avif`, 57670894485843 `openart-bc64e45b…_1.png`, 57670894616915
  `5c8d5bd4…_3.avif` — filnamnen står här så de går att lägga tillbaka), kvar är fem
  riktiga foton; raden **"Förra året tog sushilådan slut i november."** i beskrivningen
  (sant, Axel 2026-09-24); ny snippet `snippets/ms-sista-dag.liquid` + blocket
  `ms_sista_dag` efter leveransestimatet: **"Beställ senast 24 oktober så är paketet
  framme till fars dag."** till och med 24/10, sedan "8 december … till jul" till och med
  8/12, sedan inget (datumen = högtiden minus p90 15 dygn, samma som
  `klaviyo/brands/matstrumpor.json`); startsidans "Älskad av tusentals svenskar" →
  **"Över 3 700 kunder har beställt"** (3 776 kunder, Shopify 2026-09-25) i `ms_usp`
  och `ms_marquee`. Allt i det publicerade temat "Matstrumpor CRO + storleksrad
  2026-09-17" via `themeFilesUpsert`. Kvar i beskrivningen: öppnings-GIF:en
  `ezgif-5d1844bc3a0df8.webp` — **15 MB** animerad GIF; ett riktigt klipp, men tung på
  mobil, byt mot en kort mp4 (redigerarna).
- **Recensionsflödet F08** `FLOW_segment_recension_v1` byggt och uppladdat som utkast
  (se `klaviyo/README.md` → Matstrumpor): alla köpare som inte tackat nej, Judge.me på
  produktsidan, ett mejl, ingen belöning.
- **Sidkollen** `matstrumpor/sida-koll.mjs` + `leverans.mjs` byggda och inlagda i
  `/matstrumporkungen` steg 0 (varje dag, även utan rond). Första mätningen: 4 röda,
  alla Axels (material, leveranslöfte, valutaformat, prisformat) — se
  `matstrumpor/README.md` → Sidkollen.

## Så garanteras det (förslag)

1. **Sidkoll varje dag** i `/matstrumporkungen`: ett skript läser den publika
   sidan och felar om något bevis saknas (recensionsantal under tröskel,
   ordet "AI-genererad" kvar, materialrad saknas, leveranslöftet strider mot
   mätt p90, sista beställningsdag saknas i säsong, "1,796"). Samma princip
   som `stonebite/test/server.test.mjs`: regeln sitter i en test, inte i
   minnet.
2. **Leveranslöftet mäts om varje månad** mot `deliveredAt` (skriptet i
   den här sessionens scratch, samma fråga som `klaviyo/brands/matstrumpor.json`
   → `leverans_p90_comment`). Löftet på sidan får aldrig vara bättre än p90.
3. **Recensionerna:** Judge.me-förfrågningarna på (med bild), och ett
   engångsutskick till gamla köpare med Judge.me-länk. Vilka som får mejlet
   är Axels beslut (bara subscribed 2 890, eller alla 3 776 köpare enligt
   kundundantaget som F04/F05/F07 redan använder).
4. **Förköpsfrågor besvaras samma dag:** materialet på sidan tar bort
   frågan; resten ska VA:n svara på från Matstrumpors brevlåda.
