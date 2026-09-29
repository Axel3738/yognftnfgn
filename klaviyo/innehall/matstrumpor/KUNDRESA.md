# Kundresan på matstrumpor.se — mätt 2026-09-27

Axels fråga 2026-09-27: "Jag vet inte om mejlen går ut. Jag vill veta kundresan hos
Matstrumpor.se." Allt nedan är mätt (Spoks-MCP:n, Shopify Admin GraphQL via
`sparning/butik.mjs`, sajten live) den 27 september 2026 mellan 08:00 och 09:30 CEST.
Inga namn eller adresser; kunder räknas på Shopifys kund-id. Skriptet för Shopify-talen
låg i sessionens scratch-mapp (`aterkop-14d.mjs`), samma metod som
`klaviyo/evolve/ATERKOP-ANALYS-matstrumpor.md`.

## 1. Går mejlen ut? Ja — men nästan inget HAR gått ut än

| Mätt i Spoks (workspace Matstrumpor.se) | Värde |
|---|---|
| Mejl skickade i september, totalt | **39** (`whoami` → `sendCounts.currentMonthEmails`) |
| F01 Välkomst E1 "Du är invald i klubben" | **37 mottagare, 14 öppnade, 4 klickade, 0 köp** (`get_campaign_statistics`) |
| F02 Övergiven kassa E1 | 0 skickade (9 inrullade — alla köpte innan 3 h gått, eller väntar) |
| F03 Webbhistorik | **0 inrullade** på 27 timmar |
| F04 Efter köp | 49 inrullade — första mejlet går dag 3, alltså mån 29/9 för de första |
| F05 Vinna tillbaka | 49 inrullade — första mejlet dag 90 |
| F07 En låda till (sushi) | 45 inrullade — första mejlet dag 21 (17/10) |
| Kampanjer skickade | **0**. K01 är schemalagd tis 29/9 18:00 till SEG_samtycke (2 942) |

**Därför noll intäkt:** ingen kampanj har gått ut, och flödena är 27 timmar gamla. De
enda mejl som nått någon är 37 välkomstmejl. Intäkten börjar tisdag 29/9 18:00.

⚠️ **F03 (webbhistorik) har 0 inrullade** trots trafik på sajten. Hypotes, inte mätt:
Spoks kan bara koppla en produktvisning till en kontakt den känner igen (klickat i ett
Spoks-mejl eller identifierad på annat sätt), och inget kampanjmejl har gått ut än.
Läs av igen efter K01. Står den kvar på 0 efter 6/10 är det ett Spoks-supportärende.

## 2. Vem kommer in i klubben, och hur

Klubben = e-postsamtycke i Shopify (`SUBSCRIBED`) → kontakten synkas till Spoks →
F01 startar på `contact_created`. Två dörrar, båda mätta:

| Dörr | Mätt |
|---|---|
| Sidfotens ruta på sajten | Live 2026-09-27: **"Din plats i klubben väntar" / "Ta platsen"** (`klaviyo/klubb-sajt.mjs`) |
| Kassans samtyckesruta | **193 av 238 köpare (81 %) de senaste 14 dagarna är SUBSCRIBED** — nästan alla köpare blir medlemmar utan att märka det |
| Popup | Finns inte (Axels beslut 2026-09-25: sänker konverteringen) |

Alltså: **klubben är öppen för alla.** Den som handlar hamnar i den automatiskt. Det är
sant i dag, och det är därför copyn inte får säga "inte alla får vara med" förrän det
finns en mekanik som gör det sant (se KLUBB-PLAN nedan).

## 3. Dag för dag: vad som landar i inkorgen hos en ny kund som köper

Från order (dag 0). "Om inget nytt köp" = Spoks-filtret `lastPurchase` före flödets
start. Alla flöden kräver samtycke utom F04/F05/F07 som går på ordern (kundundantaget).

| När | Vad | Avsändare/system | Mätt läge |
|---|---|---|---|
| Dag 0, direkt | Orderbekräftelse | Shopify, standardmallen (inte ombyggd) | — |
| Dag 0, direkt | **F01 E1 "Du är invald i Matstrumpor-klubben"** med medlemskortet — om kunden är ny medlem | Spoks F01 | 37 skickade, 14 öppnade, 4 klick |
| Dag 0–1 (median 0,4 d) | **Fraktbekräftelse** med MS-numret och knappen till spårningssidan | Shopify-notis, egen mall (`mejl/output/butiker/matstrumpor/`, verifierad 22/9) | live |
| Dag 2 | F01 E2 "Det här skrev kunderna" — om inget nytt köp sedan anmälan | Spoks F01 | 18 väntar |
| Dag 3 | **F04 E1 "Din beställning är på väg"** → spårningssidan | Spoks F04 | första går 29/9 |
| Dag 5 | F01 E3 "Så funkar det när du beställer" — om inget nytt köp | Spoks F01 | — |
| Dag ~10–12 | **Ute för leverans / Levererat** (spårningsrutinen skriver skanningen i Shopify varje timme, notisen går på den) | Shopify-notis, egen mall | live |
| Dag 13 | F04 E2 "Kom allt fram som det ska?" | Spoks F04 | — |
| Dag 21 | **F07 "En låda till"** — bara sushiköpare, om inget nytt köp | Spoks F07 | 45 inrullade |
| Varje tisdag 18:00 | **Kampanj K01–K14** (kalendern) — bara medlemmar | Spoks | K01 schemalagd |
| Dag 90 / 104 | F05 "Vinna tillbaka" E1/E2 — om inget nytt köp | Spoks F05 | — |
| Vid avbruten kassa | F02 E1/E2/E3 efter 3 h / 1 d / 2 d — bara medlemmar, bara om inget köp | Spoks F02 | 9 inrullade, 0 skickade |
| Vid produktvisning | F03 E1/E2 efter 4 h / 1 d | Spoks F03 | 0 inrullade (se §1) |
| Mejl till kundsupport@matstrumpor.se | Autosvaret (TORRT: utkast, inget skickas) + VA:n | Railway-vakten | torrt sedan 23/9 |
| Efter 180 d utan öppning | F06 E1/E2 "Vill du vara kvar i klubben?" — för hand | Spoks-utkast | 0 i segmentet |

Recensionsförfrågan (uppdaterad 2026-09-28): **F09 Recensionen** (order_created + 16 d,
påslaget av Axel 2026-09-27) och kampanjen **K15** (utkast, fem stjärnor direkt till Judge.me,
ett kort personligt mejl som ber om ett omdöme, bra eller dåligt) ber båda via Judge.me:s
delbara länk. Judge.me installerades 2026-08-22 (mätt i Shopify) med automatiska
förfrågningsmejl på som standard, **inställningen är inte kontrollerad i appen**, så en
septemberköpare kan få både Judge.me:s mejl och F09. Vilket som ska gälla är Axels val
(`klaviyo/spoks/README.md` → Recensionerna). Bäverbutiken har F14 (Trustpilot).

## 4. Återköpen — vad Shopify säger

| Senaste 14 dagarna (13–26/9) | Värde |
|---|---|
| Ordrar / kunder | 239 / 238 |
| Kunder som handlat FÖRE fönstret | **6 = 2,5 %** (Axel läste 2,97 % i Shopifys panel — annan räkning, samma bild) |
| De sex: första köp | dec 2025 ×2, feb 2026 ×1, aug ×1, sep ×2 |
| De sex: samtycke | **6 av 6 medlemmar** |
| Rabattkod på ordern | SUSHI-K1F1 120, STRUMPOR-K1F1-P2 68, STRUMPOR-K1F1-P1 13, SUSHI-K2F2 8, STRUMPOR-K2F2-P4 7, DONUT-K1F1 7, PIZZA-K1F1 4 — **228 av 239 ordrar bär en Köp 1, få 1-kod** |

| Förra säsongens köpare | Kunder | Medlemmar i dag (SUBSCRIBED) |
|---|---:|---:|
| Första köp dec 2025 | 1 556 | **1 108 (71 %)** |
| Första köp nov 2025–mars 2026 | 3 277 | **2 414 (74 %)** |

I Spoks: `preview_segment` subscribed + `firstPurchase` mellan 2025-11-01 och 2026-04-01
= **2 415** — fältet är synkat från Shopify, så segmentet går att bygga. Skapat
2026-09-27 som **`SEG_kopare_forra_sasongen`** `0d1fa31d-993b-40cb-85e2-aa78356b174f`
(2 415 vid skapandet).

**Luckan som avgör julen:** de 2 415 får **inget flöde**. F04/F05/F07 startar bara på
NYA ordrar, och F05:s 90-dagarsmejl når en decemberköpare först i mars. De nås enbart av
kampanjerna — och kalendern adresserade oktober-mejlen K03–K06 till "engagerade"-segment
som i Spoks har **19 medlemmar** (Spoks har ingen händelsehistorik för importerade
kontakter). Rättat i kalendern 2026-09-27: K05 och K06 går till förra säsongens köpare,
K04 (fars dag-deadline) till alla medlemmar.

## 5. Vad "tredubbla" betyder i antal

2,5 % återkommande ⇒ mål ~7,5 %. Förra säsongen: 3 277 köpare. Om **8 % av de 2 415
nåbara köper igen i november–december = ~190 ordrar**, utöver F07 på höstens köpare.
Det som avgör (i ordning): (1) att köparmejlen faktiskt går till köparna, (2) den sanna
brådskan "sushilådan tog slut i november förra året" (K06), (3) att klubben känns som
något man har, inte något man råkade hamna i.

Mät om efter jul: kohorten dec 2025 mot dec 2026 (`/klaviyo cs`, samma skript).

## 6. Förra säsongens erbjudande (mätt 2026-09-27, styr årets)

| Månad | Ordrar | Med rabattkod | Rabatt per order | AOV |
|---|---:|---:|---:|---:|
| 2025-10 | 134 | 1 | 45 kr | 203 kr |
| 2025-11 | 52 | 0 | 105 kr | 209 kr |
| **2025-12** | **1 613** | **1** | **141 kr** | 366 kr |
| 2026-01 | 799 | 0 | 127 kr | 360 kr |
| 2026-02 (till 31/1-frågans slut) | 67 | 0 | 160 kr | 378 kr |

Rabatten förra säsongen låg som **automatisk rabatt** (ingen kod), i snitt 141 kr per
order i december. I dag är Köp 1, få 1 en kod på 228 av 239 ordrar. Evolve [D3]: "funnel
buyers wait for bigger sales; make BFCM superior" — förra årets köpare är vana vid en
gratis låda, så årets julerbjudande till dem måste vara synligt bättre, eller komma till
dem först (förturen). **Axels beslut 2026-09-27 kväll: B, trappan ligger kvar som den är**
(`klaviyo/README.md` → Black Week) — så det som gör årets erbjudande bättre för klubben är
förturen, inte rabatten.

## 7. Planen efter Evolves svar (svar 9 i `klaviyo/evolve/SVAR.md`)

1. **Förtur är kärnan.** Förra säsongens köpare (`SEG_kopare_forra_sasongen`, 2 415) får
   Black Week, restock och sista beställningsdagen före alla andra; övriga medlemmar före
   sajten. Sant, gratis, och det Evolve kallar "the proven mechanic".
   **Axels beslut 2026-09-27 kväll: alternativ C, båda.** (A) Black Week öppnar för klubben
   söndag 22/11 kl 18:00, ett dygn före alla andra, och bara medlemmarna får veta det; (B) nya
   sorter och påfyllning går till klubben först: mejlet går ut innan sorten syns på sajten och i
   annonserna. Kvar att bygga (nästa session, i den här ordningen): **F01 E1 v4** med de två
   sanna förmånerna (kräver nytt flöde i Spoks, ett aktivt flöde går inte att redigera via
   MCP:n, Axel byter reglage som för F08), **K16 "Förtur: Black Week öppnar i kväll"** söndag
   22/11 18:00 till samtycke, och **rabatternas starttid i Shopify flyttad** från mån 23/11 00:00
   till sön 22/11 18:00 (automatiska rabatter gäller alla på sajten; förturen är att bara klubben
   får veta). ✅ Black Week-frågan är avgjord (Axels beslut B 2026-09-27 kväll: trappan
   10/20/30 % ligger kvar, fast Köp 1, få 1 slår den på par), så K16 kan skrivas: den lovar
   förturen och tidpunkten, aldrig en procentsats som är sämre än butikens vanliga deal.
2. **Dragningen är krydda och intäktsmaskin**, inte strategin: **tre** medlemmar dras varje
   tisdag av ett skript med loggat frö; vinnarna får lådan mot **en kort video** på sig
   själva med strumporna där de säger en mening om dem (UGC om de vill, tio sekunder
   räcker; exempel, inget manus, tillstånd i svaret, bara vuxna). Var tio + bild till
   2026-09-27 eftermiddag; Axels ändring samma dag före första testet ("3 kunder … måste
   då göra ugc videos eller bara göra videos där de säger någon mening om produkten").
   **Icke-vinnarna får ett tröstpris på Black Friday** (kredit, beloppet är Axels).
3. **Måttet är återköp, inte öppningar:** medlemmarnas återköp dec 2026 mot dec 2025,
   tröstprisets intäkt inom 14 dagar mot kostnaden för tre lådor i veckan (≈ 345 kr + frakt),
   och videorna: annonser byggda på dem mäts med den vanliga analysmetoden.
4. **Börja tidigare med förra årets köpare:** första mejlet till dem tidigast möjligt i
   oktober (K05 27/10 är sent för en lista som "inte kommer tillbaka av sig själv", Evolve
   [C4]); flyttas i kalendern när copyn är skriven.
5. **Byggt 2026-09-27, dragningen (punkt 2):** `klaviyo/klubb/dragning.mjs` (torrkörd:
   2 965 kandidater, 197 utan adress) + Spoks-flödet **F08 Klubbdragningen**
   `27047445-dcab-4898-9f92-5f55f2b77be3` med E1/E2/E3 (dag 0/12/18, avstängda tills Axel
   slår på dem) + VA-SOP:en `kundtjanst/va-sop/club-draw-winners.md` + kommandot
   `/klubbdragning`. Allt, inklusive Axels klick och det som är omätt (att Spoks skickar
   `contact_tags_added` för en Shopify-satt tagg), i `klaviyo/spoks/README.md` →
   Klubbdragningen. **Förturen (punkt 1) är inte definierad än:** vad förra säsongens
   köpare får FÖRST (Black Week ett dygn tidigare? restock? sista beställningsdagen?) är
   Axels ord, och F01 E1 skrivs inte om förrän det är sant.
6. **Byggt 2026-09-28, dagliga serien till fars dag (Axels order "kampanjer varje dag …
   10 stycken minst"):** 23 kampanjutkast i Spoks, FD01–FD20 + REA01–REA03, 30/9–25/10, som
   tillsammans med K01–K04 ger **ett mejl om dagen 29/9–25/10** fram till sista
   beställningsdagen. Punkt 4 ovan är därmed delvis löst: **FD10 går till
   `SEG_kopare_forra_sasongen` redan 12/10**, två veckor före K05. Inget schemalagt: publik
   och Schedule per mejl är Axels klick. Schemat med länkar i `KALENDER-2026.md` → Dagliga
   serien; id:n, faktakollen och stoppregeln i `klaviyo/spoks/README.md` → Dagliga serien.
   **Omgång 2 samma vecka (2026-09-29, efter Evolves svar 16):** ett mejl om dagen bara till
   de engagerade (`SEG_uppvarmning_steg1`, 1 305), hela listan 2–3 i veckan, värdemejl
   blandade in (3/4, 5/2, 6/1, sedan bara sälj) och en blitz 23–24/10. Fem säljmejl ligger
   på bänken till jul.
