# REGEL — produktjakt Bäverbutiken: gate-ordning och LIVE-verifiering

**Axels beslut 2026-09-08.** Gäller varje slutlista ur en Temu-jakt, från och med nu. Den ersätter
gate-ordningen i `docs/temu-vinnar-dna.md` avsnitt 12 steg 2 och jaktinstruktionens hyllsteg
(`jakt/v23/JAKT-INSTRUKTION.md`). Grunden är fyndet i `jakt/v23/FYND-TEMU-RECENSIONER.md`:
Temus recensionsantal förutsäger utfallet **inverterat**, och hyllgaten som hård kill hade dödat
fyra av kontots nio vinnare.

## 1. Två krav. Båda. Alltid.

En produkt står på slutlistan bara om den klarar **både**

1. **stark vinnarhypotes** (avsnitt 2), och
2. **LIVE-verifierad Temu-listning** (avsnitt 3), verifierad **i samma körning** som listan skrivs.

Det ena utan det andra är inte en kandidat — det är en anteckning i `UNIVERSUM.csv`.

## 2. Gate-ordningen — billigast först, i den här ordningen

| # | Gate | Kill | Varning | Grönt | Källa |
|---|---|---|---|---|---|
| G1 | **Temu-recensioner** (antal, inte betyg) | > 800 | 300–800 | < 150 | JSON-LD `reviewCount` på **US-sajten** `temu.com/g-<id>.html`. SE-sajten räknar annorlunda — se avsnitt 5 |
| G2 | **Annonsörer i Sverige** | ≥ 3 aktiva | 2 | 0–1 | Meta Ad Library SE, `active_status=active`, sökt på ägarens svenska ord. Går den inte att nå (mätt 2026-09-08: WebFetch 403, Chromium connection reset, Ads-API utan behörighet) används **proxyn**: antal svenska DTC-butiker (inte kedja, inte marketplace) som säljer samma form — ≥ 3 = kill, och raden märks `annonsörer: proxy` |
| G3 | **Objekt + presens** (DNA steg 0–1) | ägaren äger inte objektet, det står inomhus, eller problemet syns inte i launchmånaden | — | — | Oförändrad. Det här är strukturella kills som fyndet inte ändrar |
| G4 | **Svenska hyllan** | **bara** när golvet ligger under vårt pris **OCH** inget märkesankare ≥ 1,6 × vårt pris finns i lager **OCH** G2 ≥ 3 | golv under vårt pris (marketplace räknas) | ingen svensk aktör i samma form | PriceRunner, Fyndiq, Amazon.se, CDON, vidaXL, Jula, Biltema, Clas, Rusta, Bauhaus, fackhandel |
| G5 | **Material** | leverantörsvideo visar annan fysisk produkt; inbränd utländsk text i heron som inte går att beskära | ingen video, packshot-hero | produkt i bruk ≤ 3 s, textfri hero | Bara ur live-hämtningen (hero + video sedda) |
| G6 | **Ekonomi** | landad > 420 kr, eller pris < 2,4 × landad, eller < 300 kr | 300–500 kr | > 500 kr | SE-Temu-pris × 1,5 = landad; utan moms |
| G7 | **Publik** | < 100 000 ägare (problemlösare) | 100–200 k | > 200 k | SCB, Trafikanalys, Jordbruksverket, branschorgan — med källa |

**Temu-betyg ignoreras helt.** 4,8 på kontots förlorare, 4,3 på dess bästa vinnare.

**Varför ordningen är den här:** G1 och G2 mäter samma sak — hur många som redan hittat produkten —
och G1 kostar noll (står på sidan), G2 kostar en sökning. Hyllan (G4) är en **släpande** indikator:
när Fyndiq har produkten är det redan för sent, och fyra av nio vinnare hade ändå ett billigare
svenskt alternativ i samma form (Jula 199 mot motorhöljets 299, Rusta 35 mot strandtofflornas 349,
Jula 349 mot axelbältets 599, Tapo 679 mot kamerans 799) och vann för att ett synligt märkesankare
låg 1,6–3 × över.

**Stark vinnarhypotes** = G1–G4 och G6–G7 passerade (G4 får stå på varning) **och** hypotesen kan
skrivas ut i tre delar utan att gissa: *ägaren + objektet + problemet som finns nu* (WINNER
HYPOTHESIS), *vad som får den att skriva ut pengar* (WHY IT COULD PRINT — ankare, hyllfrånvaro,
material, flerköp, prisutrymme) och *den ena risken som fäller den* (MAIN RISK). G5 avgörs vid
live-verifieringen, aldrig ur en titel.

## 3. LIVE-VERIFIERAD — definitionen

En listning är LIVE-verifierad när **alla sju** punkter är uppfyllda:

1. Den faktiska Temu-produktsidan öppnades (inte en sökträff, inte ett sökutdrag, inte en cache).
2. Listningen finns **nu** — svaret är en produktsida med `g-<id>` kvar i slutadressen, inte en omdirigering till startsidan och inte 404.
3. Den fysiska produkten är den kandidaten avser — **heron är nedladdad och sedd** av den som verifierar.
4. Produkten är inte otillgänglig eller borttagen (`availability` ≠ OutOfStock/Discontinued när Temu skickar fältet).
5. Listningen har en aktuell, användbar produktbild (heron finns och laddar).
6. Pris **eller** köpbarhet syns (JSON-LD `offers.price` + valuta).
7. Verifieringen gjordes **i den här körningen**, med tidsstämpel i UTC.

Teknik: `jakt/v24/verifiera-live.py <goods-id>` hämtar sidan som Googlebot, läser JSON-LD, laddar ner
hero + galleri, och skriver `jakt/v24/live/<id>/data.json` med `fetched`, `final_url`, `verdict`
(LIVE / BLOCKED / GONE / NO_PRICE / OUT_OF_STOCK / NO_IMAGE) och `verified`. `VERIFIED AT` i
slutlistan är `fetched` ur den filen — aldrig ett minne, aldrig gårdagens fil.

**Om Temu blockerar** (`BLOCKED` — tomt skal utan JSON-LD):
- länken räknas **inte** som verifierad, oavsett hur bra gårdagens data var;
- sök en annan live-listning av samma produktkoncept (`site:temu.com <engelska ord>` → nytt goods-id) och pröva den;
- fortsätt med alternativ tills en listning bekräftas;
- kan ingen listning bekräftas i körningen → produkten **utesluts** ur slutlistan och står i STATUS som "koncept lever, listning ej verifierad".

**Hämtbudgeten är verklig:** ~8 anrop per timme och IP, och IP:n delas mellan sessioner (mätt
2026-09-08 06:33 UTC: sex anrop från förmiddagens session + två från den här → block efter åtta;
blocket ligger 60–80 min och gäller alla marknadssajter, alla user-agents). Hämta **aldrig
parallellt**, aldrig från subagenter. Verifiera i prioritetsordning: hypotesens styrka först.

## 4. Leveransformatet — slutlistan

- **10–20 produkter.** Räcker verifieringen bara till 7, leverera 7. Fyll aldrig ut.
- Aldrig 50 råa kandidater, aldrig döda länkar, aldrig blockerade eller overifierade listningar.
- Varje rad har exakt de här sex fälten, i den här ordningen:

```
PRODUCT
LIVE TEMU LINK          https://www.temu.com/se/g-<id>.html  (SE-sajten — den Axel öppnar)
VERIFIED AT             <UTC-tidsstämpel ur live/<id>/data.json>
WINNER HYPOTHESIS       ägaren + objektet + problemet som finns nu + varför DNA:t säger att den vinner
WHY IT COULD PRINT      ankare / hyllfrånvaro / material / flerköp / prisutrymme — bara sådant som är mätt
MAIN RISK               den ena risken som fäller den
```

- Listan ska gå att öppna rad för rad och börja jobba från. Fil: `jakt/v24/SLUTLISTA-<datum>.md`.
- Allt som prövades men föll står i `jakt/v24/STATUS-<datum>.md` med orsak — det är kvittot, inte listan.

## 5. Kalibrering: SE-sajten räknar recensioner annorlunda än US-sajten

Trösklarna i G1 är mätta på US-sajten (`temu.com/g-<id>.html`). SE-sajten visar ett annat tal för
samma listning: kattkojan 601101118338671 = **72 (US) mot 410 (SE)**, samma dag (2026-09-08).
Tills tabellen nedan är fylld gäller: **G1 mäts på US-sajten**; SE-sajten används för pris i SEK och
för länken Axel öppnar.

| Produkt | Utfall | US-recensioner (2026-09-08) | SE-recensioner | Datum SE |
|---|---|---|---|---|
| IBC-tanköverdrag 601099590911868 | ROAS 2,94 | 13 | *mäts nästa fönster* | |
| PTZ-kamera 601100938731214 | ROAS 3,38 | 30 | | |
| Marin motorhölje 606445101752663 | ROAS 1,93 · ~523 köp | 244 | | |
| Fiskespöhållare 605991496175497 | ROAS 2,24 · 307 köp | 339 | | |
| Tofflor Ergonomiska 601099553900496 | **förlorare** ROAS 1,59 | 1 781 | | |
| Utekattkoja 601101118338671 | ej testad | 72 | 410 | 2026-09-08 06:28 |

## 6. Var sakerna ligger

| Vad | Var |
|---|---|
| Fyndet regeln bygger på | `jakt/v23/FYND-TEMU-RECENSIONER.md` |
| Omprövningsuniversumet (alla kandidater ur V2.1, V2.2, batch 1, v23 under de nya gaterna) | `jakt/v24/bygg-universum.py` → `UNIVERSUM.csv`, `UNIVERSUM-topp.md` |
| Live-verifieraren | `jakt/v24/verifiera-live.py` → `live/<id>/data.json` + `hero.jpg` |
| Slutlistan och kvittot | `jakt/v24/SLUTLISTA-<datum>.md`, `jakt/v24/STATUS-<datum>.md` |
| Vinnar-DNA:t (fingeravtrycket, negativa rymden) | `docs/temu-vinnar-dna.md` avsnitt 6 och 12 |
