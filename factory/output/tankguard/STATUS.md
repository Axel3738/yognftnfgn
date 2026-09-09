# TankGuard — status 2026-09-09

**Båda kampanjerna är kompletta och pausade.** Räkningen med varje siffra:
`factory/output/tankguard/rakningen.md`. VA:ns granskningslista:
`factory/output/tankguard/VA-OVERLAMNING.md`.

| Marknad | Kampanj | Källa | Byggt | Status |
|---|---|--:|--:|---|
| Sverige | `TANKGUARD_SE_Tanköverdraget \| 2026-09-08` (`120248995235740172`) | 40 | **40** | allt PAUSED |
| Norge | `TANKGUARD_NO_Tanktrekket \| 2026-09-09` (`120249012213810172`) | 33 | **33** | allt PAUSED |

Konto: MagiBorsten DK `915422744950975`. Sida `1399193996606775`, pixel
`2196132151319625`, CBO 1 000 kr/dag per kampanj, sju adsets per marknad
(BOF, CO, CS, GT, PD, RV, SP).

**Trippelkollen är gjord** — kampanj, adsets och varje enskild annons lästa
tillbaka ur Meta: alla PAUSED, rätt geo, rätt pixel, rätt sida, rätt länk.
Noll avvikelser.

## Vad som återstår innan något går ACTIVE

1. **Sjutton omdubbade videor är inte avlyssnade.** Rösten går inte att välja i
   HeyGen, så en dålig röst kan bara fångas med örat (CLAUDE.md järnregel 3).
   - Svenska: `SP_3_H1`, `CS_4_H1`, `GT_1_H2`, `SP_1_H1`, `SP_1_H2`, `SP_1_H3`
   - Norska: alla elva omdubbade
   De elva första svenska godkändes av Axel 2026-09-09: *"Alla okej. Men inget
   super — bra, men helt okej liksom."*
2. **`PD_Extra` har ingen dom.** Talet gick aldrig att läsa. Pausad
   (`120249008687250172`), räknas inte som byggd.

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
