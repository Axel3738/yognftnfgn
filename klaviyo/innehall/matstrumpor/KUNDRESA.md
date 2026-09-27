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

Recensionsförfrågan: inget mejl i den här kedjan ber om en recension. De 8 recensionerna
kommer via Judge.me (Core), som har egna förfrågningsmejl — **inställningen är inte
kontrollerad**. Bäverbutiken har F14 (Trustpilot); Matstrumpor har inget recensionsflöde.

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
