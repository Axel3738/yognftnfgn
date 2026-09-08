# Fynd 2026-09-08: Temus recensionsantal förutsäger MARGINALEN — inte vinst/förlust

**Mätt mot kontots egna, kända utfall.** Vinnar-DNA:t avsnitt 11 skrev att Temus
popularitetssignaler "diskriminerar troligen svagt" och satte dem till UNKNOWN på alla tio.
Det stämmer inte. De diskriminerar — men på ett annat sätt än man tror, och svagare än
den första mätningen (5 produkter) antydde.

> ⚠️ **Rättelse.** Första versionen av den här filen byggde på 5 mätpunkter och påstod att
> högt recensionsantal ≈ förlorare. Med 9 mätpunkter håller det inte: **strandtofflorna har
> flest recensioner av alla (3 628) och är en vinnare.** Rätt slutsats står nedan.

## Datan — 9 av 10 mätta 2026-09-08

| Produkt | Temu rec | ★ | ROAS | BE-ROAS | Marginal | Utfall |
|---|---:|---:|---:|---:|---:|---|
| IBC-tanköverdrag | **13** | 4,5 | 2,94 | 1,51 | **+1,43** | vinnare |
| Sätesöverdrag åkgräsklippare | **25** | 4,8 | 2,15 | 1,47 | **+0,68** | vinnare |
| PTZ-kamera dubbellins | **30** | 4,3 | 3,38 | 1,57 | **+1,81** | vinnare |
| Axelbälte trimmer | 106 | 4,9 | 1,91 | 1,72 | +0,19 | vinnare |
| Marin motorhölje 420D | 244 | 4,7 | 1,93 | 1,63 | +0,30 | vinnare |
| Soptunneklistermärken | 297 | 4,7 | 2,05 | 1,67 | +0,38 | vinnare |
| Fiskespöhållare | 339 | 4,8 | 2,24 | 1,50 | +0,74 | vinnare |
| *Tofflor Ergonomiska* | 1 781 | 4,8 | 1,59 | 1,80 | **−0,21** | **FÖRLORARE** |
| Strandtofflorna | **3 628** | 4,8 | 2,10 | 1,70 | +0,40 | vinnare |

Bandslipen (601102681234291) återstår — Temu strypte. Källa: `temu-ld.py` mot JSON-LD,
rådata i `v23/material/<id>/data.json`. Utfall ur `docs/temu-vinnar-dna/data/ground-truth.md`.
Marginal = ROAS − break-even-ROAS, alltså hur långt över nollstrecket produkten gick.

## Slutsatsen

| Recensionsband | n | Medelmarginal | Förlorare |
|---|---:|---:|---:|
| **< 50** | 3 | **+1,31** | 0 |
| 100–350 | 4 | +0,40 | 0 |
| > 1 500 | 2 | +0,10 | 1 |

**Få recensioner ger tre gånger så tjock marginal.** Gradienten är monoton över alla tre band.
De tre listningar som hade under 50 recensioner blev kontots tre mest lönsamma produkter
per spenderad krona.

**Men det är inget kill-kriterium.** Kontot har tjänat pengar på 244, 297, 339 och till och med
3 628 recensioner. Ett högt tal betyder att marginalen pressas mot break-even — inte att
produkten är död.

**Betyget är brus.** Spannet är 4,3–4,9 och förloraren ligger på 4,8, medan den bästa
ROAS-produkten ligger på 4,3. Sluta använda betyg som kvalitetssignal.

## Vad som faktiskt skilde förloraren från vinnaren

Tofflor Ergonomiska (1 781 rec, förlorare) och Strandtofflorna (3 628 rec, vinnare) är
samma produktklass, samma betyg, samma prisläge. Recensionsantalet separerar dem inte —
det pekar till och med åt fel håll. Det som skilde dem (ur `analys/w9.md`):

- **Ad Library:** tofflor 9 hade **648 aktiva svenska annonsörer**. Strandtofflorna hade få.
- **Ankarläget:** strandtofflorna hade Crocs 289–600 kr **över** sitt pris 349.
  Tofflor 9 hade BilligaBoden 229 kr **under** sitt pris 309.

Det är den kombinationen som dödar: *någon annonserar redan* **och** *look-alike ligger under
vårt pris*. Inte recensionsantalet i sig.

## Vad som ska ändras i filtret

| Gate | Var | Ska bli |
|---|---|---|
| **Meta Ad Library SE** | HÖGT PREDIKTIV men kördes sist eller inte alls | **Första och enda hårda gaten.** ≥ 3 aktiva annonsörer i formen = kill. (7 av 8 vinnare hade 0–1; förloraren 648.) |
| **Temu-recensioner** | UNKNOWN, oanvänd | **Rankningssignal, inte kill.** < 50 = prioritera högt. > 1 500 = räkna med marginal nära break-even och kräv starkt ankare. Gratis att läsa. |
| **Svenska hyllan** | HÅRD KILL i 37 av 64 avslag | **Varning.** Kill bara när golvet ligger **under** vårt pris OCH inget ankare ≥ 1,6× finns OCH Ad Library ≥ 3. |
| **Temu-betyg** | användes som kvalitetstecken | **Ignorera.** |
| Material | HÖGT PREDIKTIV | oförändrad — men var blockerad i hela Q4-jakten |

## Hyllgaten som vi körde den hade dödat kontots egna vinnare

`docs/temu-vinnar-dna.md` rad 90, variabel E — vinnarnas egna värden:

- Motorhöljet **½** — Jula båtkapell 199 kr, vi sålde för 299
- Strandtofflorna **0** — Rusta EVA-clogs 35 kr, vi sålde för 349
- Axelbältet **0** — Jula 349 / Clas 499, vi sålde för 599
- PTZ-kameran **0** — Tapo 679, vi sålde för 799

**Fyra av nio vinnare hade ett billigare svenskt alternativ i samma form och vann ändå.**
DNA:t rad 180 skriver ut villkoret: det fungerar när ett märkesankare 1,6–3× högre finns
synligt *och vår produkt ser ut som ankaret*. I Q4-jakten tillämpades E som hård kill i
37 av 64 avslag och undantaget tillämpades inte. Det är körningens största metodfel.

## Kvarstående osäkerhet

- **n = 9.** Bandet "> 1 500" har två produkter. Bandet "< 50" har tre. Behandla
  gradienten som en riktning, inte som en formel.
- Recensionsantal blandar **ålder** och **popularitet**. En ny listning av en gammal produkt
  har få recensioner utan att vara outnyttjad — därför är Ad Library alltid överordnad.
- Motexemplet i vår egen lista: fiskeadventskalendern har 1 recension men 9 svenska
  annonsörer. Kategorin är mättad även när listningen är ny.
- Bandslipen är omätt (ROAS 2,30, BE 1,73, marginal +0,57).
