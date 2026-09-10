# TankGuard — status 2026-09-09

**BÅDA KAMPANJERNA ÄR LIVE sedan 2026-09-09.** Axel hörde om rösten och gav
klartecken. 73 annonser levererar, 2 000 kr/dag totalt. Räkningen med varje siffra:
`factory/output/tankguard/rakningen.md`. VA:ns granskningslista:
`factory/output/tankguard/VA-OVERLAMNING.md`.

| Marknad | Kampanj | Källa | Byggt | Status |
|---|---|--:|--:|---|
| Sverige | `TANKGUARD_SE_Tanköverdraget \| 2026-09-08` (`120248995235740172`) | 40 | **40** | ACTIVE — alla 40 levererar |
| Norge | `TANKGUARD_NO_Tanktrekket \| 2026-09-09` (`120249012213810172`) | 33 | **33** | ACTIVE — alla 33 levererar |

Konto: MagiBorsten DK `915422744950975`. Sida `1399193996606775`, pixel
`2196132151319625`, CBO 1 000 kr/dag per kampanj, sju adsets per marknad
(BOF, CO, CS, GT, PD, RV, SP).

**Trippelkollen är gjord** — kampanj, adsets och varje enskild annons lästa
tillbaka ur Meta: alla PAUSED, rätt geo, rätt pixel, rätt sida, rätt länk.
Noll avvikelser.

## Vad som hände vid live-sättningen

Meta strypte API-anropen hårt (upp till 300 sekunders backoff per försök), så
Axel slog på kampanjerna för hand i Ads Manager parallellt med skriptet.

⚠️ **`TankGuard_PD_Extra` följde med i den manuella markeringen och gick live.**
Den pausades igen samma kväll, och är nu påslagen på riktigt — se nedan.

**Lärdom:** en annons som ska hållas kvar pausad överlever inte en manuell
"markera alla". Ska något hållas undan vid live-sättning: flytta det till ett
eget adset, eller lyssna igenom det innan resten går på.

## `PD_Extra` — domen som saknades (avgjord 2026-09-09)

Annonsen hölls pausad för att "talet aldrig gick att läsa och det finns inget
transkript". **Det fanns inget tal.** Axel såg videon och sa "det där var ju en
ASMR-video — asså inge VO".

Mätt samma kväll:

| Kontroll | Utfall |
|---|---|
| HeyGen proofread (0 krediter) | `failed — No speaker is detected in the video` |
| Ljudnivå | −18,2 dB snitt, jämn över alla tio sekunderna — ingen tystnad, inga talpauser |
| Inbränd text (OCR) | ingen alls (`media-grind.json`: `fynd: []`, `ocrFanns: true`) |
| Bild | rena produktnärbilder: händer som drar blixtlåset, tyget, överdraget på tanken |

Videon är källannonsens fil oförändrad — ingen dubb, ingen captionbyte, inget
plåster. Källan `IBC_PD_Extra` gjorde 423 kr spend, 4 köp, ROAS 4,62, CPA 106 kr.
Den tjänade alltså pengar precis så här: utan röst och utan text.

Annonsen är ACTIVE sedan 2026-09-09 (`120249008687250172`, adset
`TANKGUARD_Tanköverdraget SE - PD`).

⚠️ **Lärdom — "tal (oläst)" är inte samma sak som "tal som inte gick att läsa".**
Brand-detektorn skrev `okänd` på en annons som helt saknar tal, och den domen
blockerade annonsen i ett dygn. Kontrollen är gratis och tar fem minuter:
skicka filen genom `proofreadCreate` och läs felmeddelandet. `No speaker is
detected` = ingen röst = ingen brandrisk i ljudet. Rendera aldrig — proofread
drar noll krediter (järnregel 1).

## Vad som återstår

1. **Sjutton videor är omrenderade. Axel bekräftade rösten 2026-09-09 och gav
   klartecken att köra.**

   Första omgången underkändes av Axel 2026-09-09: rösten rusade och bromsade.
   Orsaken var att manuset packades med flera repliker i samma textruta, och
   HeyGen läser varje ruta på exakt den rutans tid. Sjutton videor gjordes om
   med ett manus per ruta och i HeyGens `quality`-läge.

   | | Före | Efter |
   |---|---|---|
   | Tempospridning mellan rutor | 2,16–10,29× | **1,31–2,07×** |
   | HeyGen-läge | `fast` | `quality` (avatar-inferens) |

   - Svenska (9): `CS_1_H2`, `CS_1_H3`, `CS_4_H1`, `GT_1_H1`, `GT_1_H2`,
     `GT_1_H3`, `SP_1_H1`, `SP_1_H2`, `SP_1_H3`
   - Norska (8): `CS_1_H2`, `CS_1_H3`, `GT_1_H1`, `GT_1_H2`, `GT_1_H3`,
     `SP_1_H1`, `SP_1_H2`, `SP_1_H3`

   ⚠️ **Mätningen säger att tempot är jämnt. Den säger ingenting om hur rösten
   låter.** Järnregel 3 gäller: någon måste höra hook, mitt och slut.

   De sex `replikbyte`-videorna (`PD_1_H1/H2/H3` i båda marknaderna) rördes
   inte — de ligger på 1,45–2,62× och matchar källvideornas egen spridning.
   `SP_3_H1` ligger på 1,25× och rördes inte heller.
2. ~~**`PD_Extra` har ingen dom.**~~ Avgjord 2026-09-09: annonsen har inget tal
   alls. Live sedan samma dag. Se avsnittet ovan.

## Öppna ägarfrågor

| Fråga | Varför den blockerar |
|---|---|
| Moms i TankGuards pris | Break-even 1,46 utan moms, 2,07 med. 42 % isär — ingen annons får dömas förrän frågan är avgjord. |
| NOK-nivåer | Saknas. Hela den norska uppsättningen är prisfri; priset står bara på `/nb`-sidan. |
| Jämförpriset 1 376 / 2 064 kr | Står på butikssidans paketnivåer men används inte i någon annons — det är paketsummor, inte enstyckspris. |

## Verktygen som byggdes den här körningen

| Fil | Vad |
|---|---|
| `factory/slutkort.py` | Bygger om produktsidans slutkort i en video. Noll HeyGen-credits. |
| `factory/bildplaster.py` | Byter en inbränd textrad i en bildannons, i dess egen ruta. |
| `factory/heygen-omdubb.sh` | Proofread → render → hämta, per marknad. |
| `factory/srt-fixa.mjs` | Lägger manuset på HeyGens cue-tider, grindar texten, **mäter manuslängden**. |
| `factory/captionbyte.mjs` | Konfig till `pipeline/no-precis.py` med uppmätt captionzon per uppsättning. |
| `factory/byt-video-tankguard.mjs` | Pekar om en byggd annons till en omrenderad video. |
| `factory/byt-bild-tankguard.mjs` | Pekar om en byggd annons till en omplåstrad bild. |
| `factory/rakna-tankguard.mjs` | Räkningen: källannonser per marknad mot `act/ads`. |
| `factory/cuebudget.mjs` | Golv och tak i tecken per cue — manuset skrivs mot den listan. |
| `factory/rostkoll.py` | Mäter tempospridningen mellan cues i en färdig fil. |
| `factory/rostsvep.sh` | Kör röstkollen på en hel uppsättning. |
| `factory/mediagrind.py` | Läser den FÄRDIGA filen och letar källbutikens påståenden. |

## Varukorgen — rättad i det publicerade temat 2026-09-10

Axel: *"checkout-glitchen eller varukorgs-glitchen är fortfarande där på
TankGuard."* Han hade rätt. Fixen från 2026-09-09 hade skrivits till
arbetstemat, inte till temat kunden ser.

| | Före | Efter |
|---|---|---|
| Fil i publicerat tema | 13 952 byte, äldre fabriksversion ("koden läggs på FÖRE varorna") | 16 516 byte, identisk med `factory/tema/assets/ms-paket.js` |
| Det kunden laddar (CDN) | 5 905 byte, `?v=…1788846832`, ingen `stopImmediatePropagation` | 6 315 byte, `?v=…1789064434`, en submit, varorna före koden |

Verktyg: `node factory/varukorgsfix.mjs tankguard`. Vakt: trippelkollens rad
`fabriksfiler i publicerat tema`.

**Testat av Axel i egen webbläsare 2026-09-10 efter fixen: "Nu funkar det
bra."** Härifrån gick det inte — egress-tunneln stänger Chromiums anslutning
efter sex sekunder (tre försök).

⚠️ **HeimGuard har samma bugg live** (5 906 byte gammal fil på
heimguard.se). Inte rättad: butikens nycklar saknas i den här sessionen.

Trippelkollen live 2026-09-10 efter fixen: `fabriksfiler i publicerat tema` ✅,
18 gröna. Två röda som INTE hör till varukorgen och stod röda redan innan:
`lagerpolicy` (1 variant på DENY — `factory/lagerpolicy.mjs` rättar) och
`paketnivåer` (butiken byggdes utanför repot, paketen ligger i temat och inte i
metaobjekt — raden vet inte om det). Orörda.
