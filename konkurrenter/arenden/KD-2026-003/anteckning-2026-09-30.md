# KD-2026-003: Bustatio-busto kör VÅRA färdiga annonser (2026-09-30)

**Axels order:** "Men vi måste anmäla Bustatio-busto … Kolla in bustatio-busto på
ad library. Gör din grej konkurrent dödaren."

## Vad som mättes

- **Sidan:** Bustatio-busto, sid-id `262424923617670`, butiken bustatio.com
  (Shopify, `service@bustatio.com`). Det är en svensk general store. Samma butik
  kör också sidorna Bustatio-se `140432945830076`, Bustatio-com
  `140201202520973`, Bustatio `106773485806170` och Bustatio-Eviel
  `242191758980875`. De sidorna är inte lästa.
- **Annonserna:** 58 aktiva och cirka 4 700 inaktiva. Alla 58 aktiva lästes med
  datumfönster (`adlibrary.mjs tackDatum`), eftersom bläddringsfrågan ströps.
  37 inaktiva lästes.
- **11 av de 58 aktiva annonserna är våra färdiga annonser**, uppladdade igen.
  `--klipp` gav samma bildruta vid exakt samma sekund (deras 0:05 = vår 0:05)
  med vår svenska text i bilden, och deras vattenstämpel "bustatio" ovanpå.
  Sessionen tittade på alla 32 paren.

| Deras annons | Produkt | Räckvidd | Vår film |
|---|---|---|---|
| 11 | Båtmotorskydd | 61 564 | Batmotor_SP_1_H5 (+ 7 ord ur Batmotor_SP_1_H14) |
| 29 | Bälteslipmaskin | 5 909 | Balteslipmaskin_G_1 |
| 56 | IBC-tanköverdrag | 2 896 | IBC_PD_Extra, IBC_GT_1_H1, IBC_SP_1_H2 |
| 54 | IBC-tanköverdrag | 2 229 | IBC_PD_1_H1 |
| 57 | IBC-tanköverdrag | 280 | IBC_PD_4_H2, IBC_PD_4_H1 |
| 55 | IBC-tanköverdrag | 111 | IBC_PD_1_H2 |
| 17 | Taköverdrag | 24 345 | Takoverdrag_SP_4_H1 |
| 52 | Taköverdrag | 1 234 | Takoverdrag_GT_2_H1 |
| 50 | Taköverdrag | 1 059 | Takoverdrag_PD_2_H1 |
| 51 | Taköverdrag | 449 | Takoverdrag_CS_1_H1 |
| 53 | Taköverdrag | 243 | Takoverdrag_GT_4_H1 |

Axels tröskel är klarad på båda sätten: 11 är live, och en annons har över
10 000 i räckvidd.

## Vad som anmäls, och vad som inte gör det

- **Anspråket är `redigering`.** Vår klippning och vår svenska text i bilden är
  våra. Filmklippen under texten är en blandning: AI-klipp som vi har gjort,
  leverantörens produktfilm (bälteslipen) och riktiga inspelningar som vi
  knappast gjort själva (husvagnen i den engelska trädgården). Anmälan säger
  därför "We make no claim to the underlying product footage".
- **6 anmälningar** (båtmotorskyddet, bälteslipen och fyra IBC). Alla har vår
  egen annons som original i annonsbiblioteket, med samma film till 100 %.
- **Taköverdragets 5 annonser (17, 50, 51, 52, 53) anmäls inte.** Det är
  sessionens beslut. Våra filmer bär Specialised Covers klipp och de två andra
  kända lånade inspelningarna. En anmälan där bjuder in samma motdrag som Eoka
  AB:s i KD-2026-001. Den drar också uppmärksamhet till de 54 aktiva annonser
  med Specialised Covers klipp som Axel valde att låta ligga (val B, samma
  morgon). Axel kan ändra det.
- **Inget brev och ingen faktura.** Axel sa "anmäla". Ett brev är hans beslut.

## Granskningen

https://claude.ai/artifact/AE7UJ5ne1DzEthN9eEwbLt har ett kort per anmälan.
Ja betyder att Axel intygar att annonsen till vänster är vår: vi har klippt den
och skrivit texten. Efter hans Ja skickas anmälningarna till Metas formulär.
Meta visar en säkerhetskontroll (captcha) vid Submit från containern, så
inskickningen går via `--anmal-cowork KD-2026-003` i Axels egen Chrome.

## Inskickningen

- **Axel sa Ja på alla 6 korten** 09:24–09:25 UTC, på kortens aktuella
  versioner (`--granska-svar` gav anmälan 1–6, 0 nej). Han skrev samma
  förmiddag: "Vi ska skicka in alla … de har mer än tio annonser som är snodda
  från oss." Han trodde att sidan låg under tröskeln. Mätt ligger den över på
  båda sätten: 11 live-kopior, och annons 11 har 61 564 i räckvidd.
- **Containern 09:38 UTC, anmälan 1:** torrkörningen fyllde alla fält. Den
  skarpa körningen begärde koden, och sessionen läste den ur Gmail. Meta visade
  då "Security check" vid Submit. **Inget är inskickat.** Skärmdumpen
  `1-sakerhetskontroll.png` är gitignorerad.
- **Vägen vidare:** `anmalan/COWORK-PROMPT.txt` (6 anmälningar, texterna
  kontrollerade ord för ord mot korten Axel godkände). Cowork fyller i Axels
  Chrome, och Axel gör säkerhetskontrollen. Kvittona skrivs med
  `--anmald KD-2026-003 --nr <n> --referens <r>` när Axel klistrar in Coworks
  lista.
- **Coworks första försök samma förmiddag: 0 av 6 inskickade.** Cowork svarade
  att Claude in Chrome inte var anslutet till chatten och stannade före första
  steget. Tillägget är av som standard i varje ny chatt. Prompten börjar nu med
  FÖRST, som säger exakt vad Axel slår på.
- **Coworks andra försök, 15:03 CEST:** anmälan 1 fylldes i och koden
  begärdes. Gmail i Axels Chrome var claude6@stonebite.org, så Cowork hittade
  inte koden, och Metas mejl hette dessutom "Verifiera din e-postadress" på
  svenska. Sessionen läste koden ur axel.odhner@stonebite.org och gav den till
  Axel. Regel 4 i prompten säger nu båda ämnesraderna, och att Cowork ska be
  Axel om koden när Gmail är ett annat konto. Facebook-inloggning behövs inte,
  för Cowork kom utloggad ända fram till koden.
- **Anmälan 1 är inskickad och har fått verkan.** Metas kvitto 15:18 CEST gav
  ärende 1098421112563587, och kvittot ekade rätt annons. Mejlet 15:26 sa "We
  removed the content". I annonsbiblioteket är annons 2899062230465261 (båtmotorskyddet,
  61 564 i räckvidd) nu `gated_type: TAKEN_DOWN` med texten "This content was removed".
- **Anmälan 2 är inte bevisad.** Cowork skrev att den skickades och att tacksidan
  inte visade något nummer. Meta har ett andra ärende från i dag, 921610674086655
  (kvittot kom cirka 15:51 och "We removed the content" 15:59). Men kvittot går inte
  att läsa via Gmail-connectorn ("The caller does not have permission"). Bälteslipens
  annons 1652495996287809 var dessutom fortfarande `ELIGIBLE` och aktiv 20:05, fyra
  timmar efter mejlet. Kvittot skrivs in först när Axel har läst `2/6` i Metas mejl.
  Står det `1/6` där skickades anmälan 1 två gånger, och då ska anmälan 2 skickas.
- **Axel tappade Cowork-chatten på kvällen.** Anmälan 3 var ifylld men inte
  skickad, för inget kvitto kom. Den nya prompten byggdes med `--anmal-cowork
  KD-2026-003 --bara 3,4,5,6` och innehåller bara anmälan 3–6. Den säger att 1 och
  2 redan är skickade, och alla 44 fält stämmer ord för ord mot korten Axel godkände.
- **Anmälan 3–6 skickades in samma kväll** från en ny Cowork-chatt, och Axel
  gjorde säkerhetskontrollerna. Metas tacksida visade "Tack!" utan nummer på
  alla fyra, och kodmejlen kom 20:34–22:05 CEST. Cowork skrev själv att
  beskrivningen i anmälan 3 kan ha tappat tecken, även i länkarna. Anmälan 4–6
  kontrollerades tecken för tecken före inskicket.
- **Utfallet i annonsbiblioteket 22:30 CEST (`gated_type`):** annons 1, 3 och 5
  är `TAKEN_DOWN` med texten "This content was removed because it didn't follow
  our Advertising Standards". Annons 2, 4 och 6 är fortfarande aktiva. Anmälan 3
  gick alltså igenom trots de tecken som kan ha tappats.
- **Kvittona för 3–6 skrevs in utan referens.** Metas kvittomejl syns inte för
  Gmail-connectorn, och inga nya trådar "Anmälan om immateriella rättigheter"
  syntes efter 15:59. Tiden i ärendet är när kvittot skrevs in (22:32 CEST),
  inte när anmälan skickades. Anmälan 2 står kvar som utkast tills Axel läst
  `1/6` eller `2/6` i Metas mejl.
- Taköverdragets 5 är fortfarande inte med.
