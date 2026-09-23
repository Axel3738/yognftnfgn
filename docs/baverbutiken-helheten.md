# Bäverbutiken – hela bilden (2026-09-23)

Sammanställt ur hela repot den 2026-09-23: CLAUDE.md, HANDOFF.md, `docs/os/`,
`products/*/`, `stonebite/data/snapshot.json`, `kundtjanst/`, `sparning/`,
`mejl/`, `listicle/`, `commission/`, `docs/ecomtalent/`. Allt står med källa
i de filerna. Det som är osäkert eller motsägelsefullt är märkt **[OSÄKERT]**.

Tre kapitel: **1. Framsidan** (det kunden ser), **2. Baksidan** (det som
driver butiken), **3. Siffror och läge**. Sist: **4. Öppna frågor**.
Meddelandet till Evolve-chattboten ligger i `docs/evolve-meddelande.md`.

---

## Grunden

| | |
|---|---|
| Butik | baverbutiken.se, Shopify, SEK, bara Sverige |
| Typ | Generalbutik (dropshipping, Temu-/Kina-källor), ~138 produkter (inventering 2026-08-06) |
| Bolag | Stonebite Ecom AB |
| Annonskonto | Meta "MagiBorsten" (SEK) – ett eget konto, blandas aldrig med andra verksamheter |
| Roll i dag | **Testbädd** (Axels beslut 2026-09-09, `factory/TRAPPAN.md`): produkter testas här, vinnare flyttas till egna en-produktsbutiker (OPS). Bara CaraShell finns kvar av OPS-butikerna |
| Systerbutiker | beverbutikken.no (aktiv), baeverbutiken.dk och majavakauppa.fi (pausade som marknad) |
| Team | Axel (ägare), 6 videoredigerare i Filippinerna, Mechile (VA + Head of Customer Support), UGC-ansvarig |

---

# KAPITEL 1 – FRAMSIDAN (det kunden ser)

## 1.1 Kundresan i en mening

Annons på Facebook/Instagram → produktsida (eller listicle-sida) → paketpris
via Kaching → kassa (Klarna m.fl.) → orderbekräftelse med lyckohjul →
fraktmejl med eget paketnummer `BB-…` → egen spårningssida → leveransmejl
med recensionsknapp → kundtjänst med AI-bot vid problem.

## 1.2 Annonserna (första mötet)

- **Format:** video (redigerare, UGC, leverantörsvideo med svenska captions) och
  bildannonser (genererade med kie.ai, text ovanpå).
- **Vinkelkoder i namnet** (räknat på 1 682 annonser 2026-09-21): PD
  produktdemo 484, SP social proof 332, CS prisankare 223, SO lösning 115,
  GT gåva 100, BOF funnel 48, OB invändning 4.
- **Copyregler** (`docs/copy-regler.md`): varje rad ska gå att se framför sig,
  gå att motbevisa och inte kunna sägas av en konkurrent. Butiksnamnet står
  aldrig i en annons. Retur beskrivs som "14 dagars ångerrätt enligt lag".
- **Det som vunnit, per produkt (augusti):**
  - Motorhöljet: lång demovideo `PD_1_H3` – 59 % av vinsten.
  - Strandtofflorna: ETT par på piedestal, tight beskuret, ingen text – 73 % av
    vinsten. Blöt mörk yta slog torr beige: CPA 63 kr mot 228 kr, samma bild.
  - Sätesöverdraget: rå leverantörsvideo MED inbrända svenska captions: ROAS
    2,50. Samma video utan captions: 0,99.
  - Axelbältet: äkta UGC i garage – 62 % av vinsten. Statiska bilder gav 383 kr
    vinst per 1 000 kr mot 177 kr för video.
  - Taköverdraget (nu störst): gåvovinkeln (GT) och prisvinkeln (CS) bäst.
- **Det som förlorat:** AI-ansikten, produkt beskuren på syntetisk gradient,
  text-tunga bilder, långa brand-videos, påhittade rabatter och påhittade
  kundcitat.

## 1.3 Butiken

- **Tema:** Impulse (Online Store 2.0). **[OSÄKERT]** exakt vilket temautkast
  som är publicerat – filerna säger olika saker.
- **Produktsida** (läst ur den norska kopian av den svenska mallen, **[OSÄKERT]**):
  Judge.me-stjärnor → pris → trust-badge → antal → 3 säljpunkter → lagerstatus
  → **Kaching-paket** → köpknapp → beskrivning → recensioner → testimonials →
  rekommendationer.
- **Paketpriser (Kaching):** "Köp fler – spara mer": 1 st / 2 st −15 % ("Mest
  populär", förvald) / 3 st −20 % ("Bäst värde"). Ibland "Köp 1, få 1 gratis".
- **Upsell i kassan:** "Garanti för säker frakt" 35 kr.
- **Meny:** Startsida · Bäverkoppling · Bävertratt · Alla produkter · Kontakta
  oss · Spåra paket. 8 kategorikollektioner finns men ligger inte i menyn.
- **Saknas:** Om oss-sida, FAQ-sida. Integritetspolicyn säger fortfarande
  "Bäverkoppling.se".
- **Pris och typiska produkter:** 49–3 349 kr, mest 150–700 kr. Bäst säljande
  7 dagar till 2026-09-15: Taköverdrag husvagn (1 129 kr), IBC-tanköverdrag
  (489), Fiskespöhållare 4-pack (289), Övervakningskamera (799), Termoskydd
  husbil (559), Adventskalender racingbilar (499), Båtmotorskydd 420D (579).
- **Snittorder:** 725 kr (30 dagar). **96 % av ordrarna har EN produkt.**
  Återköp 2–3,5 %.

## 1.4 Landningssidor (listiclar)

- Egna Shopify-sidor utan meny och sidfot, pixeln följer med.
- Tre koncept: **Lagerrensning**, **Vi testade X i N dagar**, **5/7
  anledningar**. Obrandade ("Anders på lagret", "OBS: Detta är reklam").
- Live på baverbutiken.se: lagerrensning för axelbältet, taköverdraget,
  termoskyddet och motorhöljet.
- Taköverdragets listicle-kampanj: 7 897 kr, 19 köp, ROAS 2,82 (7 dagar).
  Termoskyddets: ROAS 1,11 (under break-even).

## 1.5 Frakt, retur, betalning

- **Leveranslöfte:** 5–10 arbetsdagar (= 7–14 kalenderdagar). Uppmätt på 879
  levererade paket: median 10,1 dygn, 96 % inom 7–14.
- **Frakt:** fri frakt. Skickas från Kina med YunExpress/4PX, sista biten
  PostNord/DHL.
- **Retur:** 14 dagars ångerrätt från mottagandet (Axels beslut 2026-09-22,
  policysidan ändrad 2026-09-23). Kunden betalar returfrakten. ⚠️ "30 dagar"
  fanns kvar på 220 produktsidor, 12 listiclar, i videoannonser och i
  leveransmejlet vid granskningen 2026-09-19.
- **Betalning:** kort, Klarna, PayPal, Apple Pay, Google Pay.
- **Moms: [OSÄKERT].** CLAUDE.md säger att butiken säljer utan moms; brandfilen
  och villkorssidan säger "inkl. moms". Behöver redas ut.

## 1.6 Mejlen till kunden

- Åtta egna mallar (orderbekräftelse, frakt, fraktuppdatering, ute för
  leverans, levererad, återbetalning, avbruten, övergiven kassa).
- Röd `#dd1d1d`, svart, Impact-rubriker, logga med röd bäver.
- Personlig ton, grundarrad i första person.
- **Lyckohjulet** i orderbekräftelsen: "Snurra hjulet – vinn en gratis produkt,
  värde upp till 279 kr". Rabattkoden gäller köp ≥ 299 kr, bara återkommande
  kunder, en gång.
- **Mätt 2026-09-17: 434 ordrar, 0 använde koden, 0 via hjulet, 0 från mejlet.**
  Erbjudandet fungerar inte i dag.

## 1.7 Spårningssidan (baverbutiken.se/pages/spara)

- Egen sida, byggs om varje timme. Kunden ser eget nummer `BB-XXXXXXXX`,
  aldrig fraktbolagets nummer och aldrig "Kina".
- Fem steg: Ordern mottagen → På väg → Hos fraktbolaget → Ute för leverans →
  Levererat. Beräknad leverans visas. "Hämta ditt paket" med ombud när det är
  klart.
- **Upsell under paketet:** svart ruta "Vinn en gratisprodukt" → lyckohjulet.
- Samma sida finns i NO, DK, FI.

## 1.8 Recensioner

- Judge.me: 754 recensioner, snitt 4,45. En del är importerade vid lansering
  (`tools/judgeme-import.mjs`), inte bara organiska.

## 1.9 Kundtjänst som kunden upplever den

- kundsupport@baverbutiken.se. Signatur "Kundtjänst Bäverbutiken", aldrig "AI".
- **AI-bot skarp sedan 2026-09-23 13:18:** enkla frågor (var är min order)
  besvaras på under en minut med fakta ur Shopify och spårningen. Arga kunder
  får ett lugnande svar ("Jag förstår helt din frustration … svar inom 48
  timmar") och flyttas till VA:n. Svåra ärenden (retur, återbetalning) går
  direkt till VA:n.
- ⚠️ Gamla adressen kundsupport@**baverkoppling**.se står fortfarande på en del
  sidor – den domänen tar inte emot mejl alls.

---

# KAPITEL 2 – BAKSIDAN (det som driver butiken)

## 2.1 Creative strategy – kärnloopen

1. **Analys** (`docs/os/ANALYSMETOD.md`): ingen dom under 300 kr spend eller 3
   köp. Rangordning på **vinstbidrag** = (break-even-CPA − CPA) × köp, aldrig på
   ROAS ensamt. Enda kill-linjen är break-even-ROAS. Top spendern är benchmark.
2. **Etikett dag 7** per annons (Evolve-metoden): BREAKTHROUGH / SPEND_WINNER /
   KPI_WINNER / LOSER / INGEN_LEVERANS. Bakåtfyllt 2026-09-21 på 1 682 svenska
   annonser: **10 breakthroughs (0,6 %)**, 70 spend-vinnare, 170 KPI-vinnare,
   869 förlorare, 563 fick aldrig spend.
3. **Lärdom per etikett** → **brief pekar på en lärdom**. Antal briefer per rond
   får inte överstiga antal nya lärdomar.
4. **Briefer** på engelska till redigerarna, med regi rad för rad, taggar
   (vinkel, avatar, medvetenhetsnivå, mekanism, källa), och minst var 5:e nytt
   koncept ur kundernas egna ord (kommentarer, mejl).
5. **Invändningsmatris:** kommentarerna under annonserna läses; en invändning
   som ≥ 10 % tar upp måste få en brief. (Taköverdraget: 38 % av invändningarna
   handlar om fukt/kondens – ingen av 34 annonser svarade på det.)
6. **Briefgranskning** mån + tors: en AI-creative director dömer ronden och
   skriver tre regler till nästa rond.

## 2.2 Produktion och teamet

- 6 redigerare i Manila. Betalas **0,4 % av spenden** på sina annonser
  (commission var tredje dag). Topplista i USD, spend visas aldrig för dem.
- Commission 1–19 sep: Josh 470 kr, Annabelle 249 kr, övriga under 50 kr.
- Notion creative hubs, en per produkt. Status: Draft → In progress →
  Creative strat review → To be Reviewed → Approved.
- Brief-kvot per 3 dagar räknas ur budget och target-CPA (`pipeline/quota.mjs`).
- **Flaskhals nr 1 enligt actionplanen:** redigerarkapacitet mot kvoten.

## 2.3 Annonsdrift

- **Struktur (Axels beslut 2026-09-20, ur Evolve):** en CBO per produkt, ett
  adset per vinkel. Nya annonser läggs direkt i CBO:n. Ingen spend på 7 dygn =
  förlorare, släpps. Aldrig test-ABO.
- Kampanjnamn bär break-even: `Produkt | BE ROAS 1.63 | Launch 2026-09-09`.
- Ny produkt: 1 000 kr/dag i test, ~16 creatives (4 vinklar).
- **Rutiner som kör själva (svensk tid):**

| Tid | Vad |
|---|---|
| 04:15 | Norska videoversioner (HeyGen röstklon + lip-sync) |
| 05:30 | Norska recensioner |
| 06:00 | Commission |
| 07:30 | Tvistkoll + budgetrond ("Skalningskungen") |
| 13:20 | Leveransrundan: färdiga creatives från Notion → upp i Meta |
| 15:00 | Översättning till Norge |
| 20:00 | Bildannonser genereras med kie.ai |
| Varje timme | Spårningen, dashboarden |

- **Budgetregler:** max +20 % / −30 % per steg, låst i 3 dagar, pausat med spend
  slås aldrig på igen av en maskin.
- Norge: samma annonser översatta, eget konto.

## 2.4 Kundtjänst

- **AI-bot** på Railway, läser inkorgen varje minut. Tre hinkar: ENKEL / ARG /
  SVÅR. Ren regelkod, ingen språkmodell. Ett svar per tråd, aldrig löften.
- **Veckorapport** med chargeback-risk 0–100 (avstängd sedan 2026-09-15).
- **Tvistkoll varje morgon:** larm i Discord om en tvist har deadline inom 3
  dagar.
- **Tvisthandbok** (13 SOP:er, portabel till alla butiker). Mätt på 50 tvister:
  inquiries 29 av 29 vunna, chargebacks 1 av 4. Allt som förlorats var
  chargebacks. **Det som avgör: finns en leveransskanning.**
- **VA:ns SOP-bas i Notion:** 36 sidor, en sida med butiksfakta som byts per
  varumärke.
- **Bonus till VA:n:** $5 per recension med hennes namn, $5 per vunnen tvist,
  $15 tom inkorg osv. Bara 2 av 1 210 recensioner nämnde teamet.

## 2.5 Logistik och spårning

- Varje timme: skickade ordrar → 17TRACK → skanningarna skrivs in i Shopify
  (så att "Ute för leverans"/"Levererad"-mejlen går ut) → spårningssidan byggs om.
- 2 281 paket i systemet: 1 056 levererade, 754 på väg, 17 misslyckade.
- Dröjsmål bokning → första rörelse: median 4,1 dygn.

## 2.6 Ekonomi och uppföljning

- **Break-even-ROAS** per produkt ur Axels COGS-kalkyl (1,47–2,00).
- **StonePNL:** egen Shopify-app (publicerad i App Store 2026-09-05) som visar
  vinst per dag: försäljning − varukostnad − tull − avgifter − annonser.
- **stonebite.org:** intern dashboard med roller. Redigerare ser aldrig spend,
  VA:n ser aldrig ekonomi.

## 2.7 Kända problem

1. Redigerarkapaciteten räcker inte till kvoten.
2. Råmaterial för UGC saknas.
3. Ingen manager kör systemet – Axel är enda punkten.
4. Kundtjänsten: 195 av 293 ärenden obesvarade (30 dagar), svarstid 17 h,
   chargeback-risk 100/100. AI-boten är svaret, skarp sedan i dag.
5. Lyckohjulet/återköpserbjudandet ger 0 ordrar.
6. Gamla "30 dagar"-texter och döda mejladressen på sidor och i annonser.
7. Motsägelser i break-even-CPA mellan filerna (t.ex. axelbältet 299 mot 326 kr,
   båda räknade på gamla priset).
8. Incidenter som fångats: masspåslag av pausade kampanjer (aug), US-videor med
   norsk röst (sep), VA-konto som såg ekonomin (sep).

---

# KAPITEL 3 – SIFFROR OCH LÄGE (2026-09-23)

## Meta, MagiBorsten

| Period | Spend | Köp | ROAS | CPA |
|---|---|---|---|---|
| 30 dagar | 572 715 kr | 1 866 | 2,32 | 307 kr |
| Senaste 7 dagar | 214 161 kr | 630 | 2,55 | 340 kr |
| 7 dagarna innan | 118 785 kr | 387 | 2,67 | 307 kr |

- Spend har gått från ~12 000 kr/dag (slutet av augusti) till 31–37 000 kr/dag.
- **ROAS sjunker när spenden ökar:** 3,36 (09-16) → 2,08 (09-22).

## Shopify

- 30 dagar: 1 531 845 kr, 2 112 ordrar, snittorder 725 kr.
- Senaste 7 dagar: 634 871 kr, 730 ordrar (förra veckan 358 799 kr).
- Bästa dagen: 09-20, 111 846 kr.

## Kampanjerna som bär (7 dagar)

| Kampanj | Spend | Köp | ROAS | Break-even |
|---|---|---|---|---|
| Taköverdraget för husvagn | 87 390 kr | 216 | 3,08 | 1,63 |
| Båtmotorskyddet 420D | 19 473 kr | 90 | 2,84 | 1,62 |
| Termoskyddet husbil | 16 176 kr | 62 | 2,40 | 1,61 |
| Bältesslipmaskinen | 12 897 kr | 34 | 2,54 | 1,73 |
| Fiskespöhållaren | 10 538 kr | 49 | 2,12 | 1,50 |
| Sotarsetet | 7 878 kr | 55 | 3,58 | 1,61 |

- **Under break-even:** Vedklyvborren 0,67, Adventskalender DIY 0,97,
  Dinosauriekalendern 1,14, Biltvättborsten 1,21, Övervakningskameran 1,26,
  MC-kapellet 1,28, plus fem kampanjer med 0 köp (750–1 650 kr var).
- **Taköverdraget:** CPA gick 147 → 466 kr mellan 09-12 och 09-21 när dagsspenden
  femdubblades. Fortfarande klart över break-even.
- De fyra gamla skalningsprodukterna (motorhöljet, axelbältet, sätesöverdraget,
  strandtofflorna) är pausade sedan slutet av augusti.

## Testets ekonomi

- 40 kampanjer gav aldrig en bedömbar annons: 562 annonser, 68 550 kr i
  första veckans spend. **33 % av annonsarbetet gick till produkter som dog i
  test.**

---

# 4. Öppna frågor (Axels att bestämma)

1. Moms: säljer butiken med eller utan moms?
2. Vilken break-even-CPA gäller per produkt (filerna säger olika)?
3. Tröskeln för när en testprodukt får egen butik (TRAPPAN) är inte satt.
4. Ska lyckohjulet göras om eller tas bort (0 ordrar)?
