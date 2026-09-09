# Beslut som väntar på Axel

Fabriken gissar aldrig i ägarfrågor. Här står de frågor där grenarna
2026-09-07 → 09-09 skrev OLIKA svar i yaml, och koden nu bär det senast
mätta värdet med en kommentar tills Axel avgjort. En rad per fråga:
ta bort raden när beslutet är fattat och skrivet i rätt fil.

| # | Fråga | Vad grenarna sa | Var det ligger nu |
|---|---|---|---|
| 1 | **Moms i break-even.** Räknas OPS-butikernas break-even-ROAS med eller utan moms? | skalningskungen: `moms_i_pris` styr (HeimGuard 1,49). mccarthy: samma tal, motsatt regel. heimguard-grenen: 2,11 med moms antagen. stoo16: TankGuard 2,07 med moms; jjwesr: 1,62 utan. CLAUDE.md: Bäverbutiken säljer UTAN moms. | `factory/produkter/tankguard.yaml` (`break_even_roas`, kommentar), `butiker/tankguard.yaml` (`moms_i_pris`) |
| 2 | **TankGuards jämförpris.** 636 kr eller inget? | 9cj76b: 636 kr live och i 11 videor. of4kxu: ägarbeslut "inget jämförpris", 636/23 % förbjudna i grinden. | `factory/produkter/tankguard.yaml` (`compare_at`), `factory/FAS2.md` |
| 3 | **TankGuards valuta för Norge.** NOK påslaget eller SEK tills vidare? | jjwesr STATUS: NOK aktiverat 2026-09-08. stoo16 (avläst ur butiken 09-09): SEK, "tills NOK slås på". | `factory/butiker/tankguard.yaml` (`marknader[].valuta`) — kedjan följer filen |
| 4 | **TankGuards inköpspris.** 155, 170 eller 188 kr? | main/stoo16: 155. 51zqlx: 170. jjwesr: 188. | `factory/produkter/tankguard.yaml` (`cogs_sek`, kommentar med källa) |
| 5 | **TackleBays inköpspriser och gratis bonusprodukt.** | Båda produktfilerna: COGS gissad 40 %, ingen bonusprodukt vald. | `factory/produkter/tacklebay-*.yaml` (`offer.bonus_produkt.handle` tomt → steget `bonus` rapporterar manuellt) |
| 6 | **DryTreks bonusprodukt** (reflexband föreslaget, inte sourcat). | damasker: Paket B och korg-upsell inte byggda i väntan på den. | `factory/produkter/damasker.yaml` (`offer.bonus_produkt`) |
| 7 | **Redigerare per OPS-butik.** Standby-listan har noll rader. | jjwesr/damasker: Discord byggs utan plockning, "ingen redigerare i standby-listan än". | `factory/redigerare/standby.md` |

Regel: står frågan här får ingen session skriva ett nytt värde i yaml utan
att också ta bort raden ovan och citera Axels besked med datum.
