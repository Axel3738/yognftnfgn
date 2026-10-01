# Vad som saknas — per butik, mot Evolve Finance

Skriven 2026-10-01 efter Axels order: "kolla igenom min business och se vad jag saknar för mina
olika butiker och vad vi kan implementera för att få bättre koll på våra siffror". Måttstocken är
Evolve Finance (`evolve/FINANCE.md`), Evolve Supply Chain (`evolve/SUPPLY-CHAIN.md`) och
Origins → Operations (P&L och kundanskaffning, `evolve/OVRIGT.md`). Talen är mätta samma dag med
`ekonomi/barometrar.mjs` (rapport: `rapporter/barometrar-2026-10-01.md`).

Äldre luckanalys för sajten: `stonebite/evolve/LUCKOR.md` (2026-09-26). Den här bygger vidare på den.

## Läget: september 2026

| | Omsättning | Reklam | MER | nCAC | Max CAC¹ | **Kvar per ny kund²** | Varukostnad | Avgifter | Om CAC +20 % |
|---|---|---|---|---|---|---|---|---|---|
| Beverbutikken (NO) | 696 480 kr | 323 066 kr | 2,16 | 358 kr | 428 kr | **70 kr** | 34,1 % | 4,5 % | **−1 kr** |
| Majavakauppa (FI) | 72 590 kr | 36 729 kr | 1,98 | 854 kr | 1 048 kr | **194 kr** | 30,0 % | 4,4 % | 23 kr |
| Matstrumpor | 214 487 kr | 112 418 kr | 1,91 | 234 kr | 302 kr | **68 kr** | 20,0 %³ | 3,2 % | 21 kr |
| CaraShell | 891 657 kr | 423 736 kr | 2,10 | 795 kr | 980 kr | **185 kr** | 34,9 % | 4,3 % | 26 kr |
| Bäverbutiken (SE) | går inte att läsa i en vanlig session (Shopify 403) — se lucka 2 | | | | | | 30,3 %⁴ | 2,9 %⁴ | |

¹ Bidraget på första ordern före reklam = det mesta en ny kund får kosta för att gå jämnt ut.
² Bidrag på första ordern minus nCAC: vad varje ny kund lämnar efter vara, frakt, avgift, tull och reklam.
³ Cost per item täcker bara 61 % av omsättningen; resten räknat med samma procent.
⁴ Snapshoten 24/9–1/10, inte barometrarna.

### Vad talen säger

1. **Alla butiker går plus på första ordern — men bara med 68–194 kr per ny kund.** Det är
   ungefär 10 % av ordervärdet.
2. **Ingen butik har återköp att luta sig mot.** Matstrumpor: 8 kr i återköpsbidrag per ny kund på
   90 dagar (3 550 kunder). Bäverbutiken och CaraShell: under 3 % återköp. Kursens "förlora på
   första ordern och ta igen det sen" gäller alltså **inte** oss. **Första ordern måste bära sig själv.**
3. **Bufferten är för liten för Q4.** Evolves Q4-dokument väntar en prestandadipp 6 november och
   en till 1 december, och de billigaste annonsvisningarna först 26/12–10/1. 20 % dyrare kunder gör
   Norge olönsamt och tar Matstrumpor och CaraShell nära noll.
4. **Varukostnaden ligger över kursens tak på 30 %** i Norge och CaraShell, och avgifterna på
   4,3–4,5 % mot kursens ~3 %. Det är de två spakarna som ger buffert utan att röra annonserna.

## Luckorna

| # | Lucka (kursen) | Vad vi har | Vad som saknas | Vem gör vad |
|---|---|---|---|---|
| 1 | **Bidrag per order, första order mot återköp** (modul 1) | Vinst per dag på sajten för Bäverbutiken och CaraShell. Nu också uppdelat på första order och återköp (`barometrar.mjs`). | **Cost per item saknas**: Matstrumpor donut, pizza, hamburgare (+ ätpinnarnas försäljning) = 39 % av omsättningen; CaraShell Taköverdrag 6,5 × 3 m, Termoskydd och Fönstertermomatta (81 sålda utan kostnad på 30 dagar). Redigerarnas 0,4 % av spenden räknas inte. | **Axel:** skicka kostnaderna. Sessionen lägger in dem via API. |
| 2 | **nCAC ur Shopifys nya kunder och kohort-LTV** (modul 2, Origins "Customer Acquisition Tracking") | Byggt i dag: `ekonomi/barometrar.mjs`. | Körs bara för hand. Bäverbutiken SE går bara att läsa i `/stonebite`-rutinens miljö (`SHOPIFY_*_BAVERBUTIKEN_EMAILSCRAPER`). Inte på sajten, ingen daglig färg mot max CAC. | **Sessionen** (efter merge till `main`): kör barometrarna i `/stonebite`-rutinen en gång om dagen och lägg nCAC + kvar per ny kund på Översikt. |
| 3 | **Barometrarna och stresstestet** (modul 3) | Stresstestet räknas nu per butik. | **Varukostnad över 30 %** (NO 34,1 %, CaraShell 34,9 %). **Avgifter 4,3–4,5 %** (Klarna/PayPal-andelen?). **Låg AOV i Matstrumpor** (434 kr) — kursens "svåraste att laga": paket och tillägg, inte rabatt. | **Axel:** förhandla (`leverantor/`), kolla avgiftsavtalen. Prisändringar är ditt beslut. |
| 4 | **Kassaflödescykeln** (modul 4 + Meta Billing) | Inget. | **Alla sex annonskonton betalas med VISA-kort** (mätt via Meta API), ingen månadsfaktura. Utbetalningsschemat för Shopify Payments och Klarna går inte att läsa via API (mätt). Ingen kassaprognos, inget datum för när räkningarna kommer. Q4: Matstrumpor kör 13 000 kr/dag från 2/10 på kort. | Inte nu. Behövs inte före Q4 (Axel 2026-10-01). |
| 5 | **Lagret och slutförsäljning** (Supply Chain lektion 05, 15) | Byggt i dag: `lager/kor.mjs` läser CWD:s dagliga lagerark (49 dagar, 2 051 enheter). | **Matstrumpors lager är slut sedan 22–23/9**: 415 ordrar med 819 sushilådor väntar, Axels 1 000 kommer inom tre dagar och går nästan helt åt till dem (mätt i spårningen 2026-10-01 kväll; Shopifys "fulfilled" betyder inte skickat). Taköverdraget har inget lager hos CWD. Ingen plan för Black Friday-lagret. | **Axel:** skicka `leverantor/meddelanden/0-q4-minimum.md`. |
| 6 | **Pengar som ligger still** (modul 4) | Lagerplanen räknar överlager. | 18 938 kr överlager där kostnaden är känd, plus Mastern 650 st (222 dagars lager), sticker 291 st och D2-kopplingen 123 st som inte säljer alls. | **Axel:** besluta om de ska säljas ut, användas som gåva i paket eller ligga kvar. |
| 7 | **Leverantören: landad kostnad, villkor, defekter** (Supply Chain 02, 05, 12) | Inget skrivet. | Ingen prisuppdelning (vara/frakt/avgift), ingen jämförelseoffert, inga villkor, ingen defektrapport per produkt. | **Axel:** meddelande 3–5. **Sessionen** kan bygga defekter per produkt ur kundtjänstens logg. |
| 8 | **Daglig P&L till nettovinst** (Origins → "Understanding Your P&L") | Kvar efter reklam per butik. | **Fasta kostnader** (VA, redigerare, Head of support, verktyg, Railway, appar) finns inte någonstans, så det finns ingen nettovinst. | **Axel:** skicka listan över fasta kostnader per månad. Sessionen lägger dem per dag i sajtens vinst. |
| 9 | **Chargebacks som system** (Chargebacks-lektionen) | Tvisterna live per butik, tvistgrad 0,11 %, vinstgrad per typ (inquiries 29/29, chargebacks 1/4), tydlig deskriptor (`SP Baverbutiken.se`). | **Grundorsak per chargeback** taggas inte, och ingen veckovy per land, produkt och betalsätt ("Australien 10 % av omsättningen men 80 % av chargebacks"). | **Sessionen** kan bygga veckorapporten ur Shopify-tvisterna. |

## Per butik, kort

- **Bäverbutiken (SE):** största butiken (~818 000 kr inköp i månaden) men barometrarna går inte att
  köra här. Varukostnad 30,3 % — på taket.
- **Beverbutikken (NO):** mest känslig: 70 kr kvar per ny kund, CAC +20 % = förlust. Varukostnad
  34,1 % och avgifter 4,5 %. Taköverdraget och IBC-överdraget är största inköpen.
- **Majavakauppa (FI):** liten volym (44 ordrar), bäst marginal (194 kr) tack vare hög AOV (1 645 kr).
- **Bæverbutiken (DK):** 1 order på 30 dagar — inget att mäta.
- **CaraShell:** 185 kr kvar per ny kund, varukostnad 34,9 %. Taköverdraget är 100 % av inköpet
  och hälften av hela bolagets — **förhandla det först**.
- **Matstrumpor:** 68 kr kvar per ny kund i Sverige, och utlandet startar 2/10 med 13 000 kr/dag där
  frakten är dyrare. Lagret inför julen är okänt. Kinesiska nyåret ligger mitt i eftersäsongen.
- **Grillkliniken:** inga nycklar. 650 Mastern ligger förbetalda hos CWD.

## Det här är byggt i dag

| Verktyg | Vad | Kör |
|---|---|---|
| `ekonomi/barometrar.mjs` | Modul 1–4 per verksamhet: nCAC, bidrag första order/återköp, kohorter, stresstest | `node ekonomi/barometrar.mjs --skriv` |
| `lager/kor.mjs` | Lagerplanen ur CWD:s ark: slut, beställ, överlager, kinesiska nyåret, Matstrumpors säsong | `node lager/kor.mjs --skriv` |
| `leverantor/inkopsvarde.mjs` | Vilka produkter vi köper in mest av — var förhandlingen börjar | `node leverantor/inkopsvarde.mjs --skriv` |
| `leverantor/FORHANDLING.md` + `meddelanden/` | Strategin och fem färdiga meddelanden på engelska | — |
