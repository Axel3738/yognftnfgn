# Beslut som väntar på Axel

Fabriken gissar aldrig i ägarfrågor. Här står de frågor där grenarna
2026-09-07 → 09-09 skrev OLIKA svar i yaml, och koden nu bär det senast
mätta värdet med en kommentar tills Axel avgjort. En rad per fråga:
ta bort raden när beslutet är fattat och skrivet i rätt fil.

| # | Fråga | Vad grenarna sa | Var det ligger nu |
|---|---|---|---|
| 2 | **TankGuards jämförpris.** 636 kr eller inget? | 9cj76b: 636 kr live och i 11 videor. of4kxu: ägarbeslut "inget jämförpris", 636/23 % förbjudna i grinden. | `factory/produkter/tankguard.yaml` (`jamforpris`), `factory/FAS2.md` |
| 3 | **TankGuards valuta för Norge.** NOK påslaget eller SEK tills vidare? | jjwesr STATUS: NOK aktiverat 2026-09-08. stoo16 (avläst ur butiken 09-09): SEK, "tills NOK slås på". | `factory/butiker/tankguard.yaml` (`marknader[].valuta`) — kedjan följer filen |
| 4 | **TankGuards inköpspris.** 155 eller 188 kr? | main/stoo16: 155 (utan tull, avläst 09-09). jjwesr: 188 (med 2,9 EUR tull). Skillnaden är tullposten, inte två mätningar. Ingen har kontrollerat mot en riktig Temu-faktura. | `factory/produkter/tankguard.yaml` (`inkopskostnad: 155`) |
| 5 | **TackleBays inköpspriser och gratis bonusprodukt.** | Båda produktfilerna: COGS gissad till 40 % av priset, ingen bonusprodukt vald. | `factory/produkter/tacklebay-*.yaml` (`offer.bonus_produkt.handle` tomt → steget `bonus` rapporterar manuellt) |
| 6 | **DryTreks bonusprodukt** (reflexband föreslaget, inte sourcat). | damasker: Paket B och korg-upsell inte byggda i väntan på den. | `factory/produkter/damasker.yaml` (`offer.bonus_produkt`) |

Regel: står frågan här får ingen session skriva ett nytt värde i yaml utan
att också ta bort raden ovan och citera Axels besked med datum.

---

## Avgjort

**1. Momsen — UTAN moms** (Axels besked 2026-09-09).
Varje OPS-butik räknar break-even rakt på priset, samma regel som
Bäverbutiken och Grillkliniken. `ekonomi.moms_antagen: false` står i varje
produktfil och i mallen. Butikens `moms_i_pris` styr prisVISNINGEN och får
aldrig läsas som ett momsantagande — det är true i varje OPS-butiksfil, och
att låta det avgöra break-even vore precis det tysta valet regeln fanns för.

Talen efter beslutet:

| Produkt | Pris | Inköp | Break-even-CPA | Break-even-ROAS |
|---|---|---|---|---|
| HeimGuard (övervakningskameran) | 799 | 261 | 538 kr | 1,49 |
| TankGuard | 489 | 155 | 334 kr | 1,46 |
| DryTrek (damasker) | 389 | 146 | 243 kr | 1,60 |
| TackleBay spöhållaren | 289 | 116 | 173 kr | 1,67 |
| TackleBay kalendern | 469 | 188 | 281 kr | 1,67 |

⚠️ TackleBays två inköpspriser är fortfarande gissningar (fråga 5) — deras
break-even är alltså rätt räknad på fel indata tills Axel bekräftar COGS.

**7. Redigerare per OPS-butik — ingen tilldelad** (Axels besked 2026-09-09:
"tomt"). `factory/redigerare/standby.md` är tom med flit. Varje skalningsrond
skriver "ingen redigerare tilldelad" i stället för att nämna en person som
inte finns. Det är ett läge, inte en lucka — fråga inte om det igen förrän
Axel tar upp det.
