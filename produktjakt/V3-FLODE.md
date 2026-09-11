# Produktfabriken V3 — det dagliga flödet (byggt 2026-09-11)

En körning per dag, med början och slut. Ingen körning söker utan att först ha lärt sig av gårdagen.

```
FÖREGÅENDE RESULTAT → LÄR → SÄSONG → UPPTÄCK → VERIFIERA → RANKA → LITEN BATCH → SAMLA SVAR → VÄNTA TILL I MORGON
```

## Vad som är kvar från V2 (orört)

| Del | Fil | Roll i V3 |
|---|---|---|
| AliExpress-klienten | `ali.py` | sök + LIVE-kontroll av produktsidan (titel + hero) |
| Objektuniversumet | `objekt.json` | startpunkt för discovery (ägare × objekt × hot × form × ankarkällor) |
| Offertarket | `offert.py` + `mall/offertmall.xlsx` | oförändrat format till leverantören, prisfälten tomma |
| Sidan med Ja/Kanske/Nej | `sida.py` + `sida-mall.html` | samma URL, samma knappar; nya fält på kortet |
| Axels svar | `feedback.py` → `feedback/feedback.json`, `vikter.json`, `LARDOMAR.md` | läses in varje morgon, nu även in i konceptregistret |
| Karantän + sedda | `anvanda-sokord.json`, `sedda.json` | dubblettkoll på listning |
| Körningshistoriken | `korningar/<datum>/` | varje dag bevaras; V3-filerna ligger i `korningar/<datum>/v3/` |
| Poängkortet K0–K12 | `MASTERPROMPT.md` §5 | **bevis, inte dom** — skrivs fortfarande per rad (`per_kriterium`), men dödar inte längre ensamt |
| Rutinen | trigger `trig_01ER8txR7LN7QegEuARvzue6`, fast session, gren `claude/fortsatta-pa-denna-c28bmv` | samma; kommandofilen är V3 |

## Vad som ersatts

| Gammalt | Nytt | Varför |
|---|---|---|
| `utfall.json` skrevs för hand ur minnet av kontot | `meta_facit.py hamta` — alla 84 kampanjer, alla fält, en snapshot per dag | "Two snapshots ≥ 3 dygn isär" går att räkna; inget glöms |
| Universell spendgräns 2 000 kr | Konfidensband mot produktens EGEN BE-CPA (TOO_EARLY / EARLY_SIGNAL / MEANINGFUL / HIGH) | 2 000 kr är 3× BE-CPA för ett hölje och 1× för ett taköverdrag |
| Kill-regler K0–K12 i fast ordning, fasta vikter | `LEARNING_STATE.md` (empiriska signaler + aktiva hypoteser) + `rank.py` (profil per slot) | Modellen refuterade taköverdraget och hade killat adventskalendern — båda REAL WINNERS |
| `vikter.json` Laplace-score på Axels klick | Klick är bevisnivå 3; Meta är nivå 1. Klick visas bredvid, styr inte ensamt | "Ett nej som sen printar lär oss mer än nejet" |
| Listning = produkt (`sedda.json` på id) | Koncept = objekt + form (`koncept.json`, K0001 …) med listningar, svar, prediktion, launch, facit | Samma sak kom tillbaka under nytt id; nej glömdes när listningen byttes |
| Månadsfönster i `objekt.json` | `sasong.json` + `sasong.py` — datum, topp, slut, region, veckor kvar, TIMING | "Fönstret 2–16 veckor fram" räknas från dagens datum, inte månadsnumret |
| Sök på sökord/uppslag, topp 12 | Discovery från ägare → objekt → friktion → hot; 70/30 exploit/explore; `--antal 0` skriver alla | Uppslag lyfte skräp; slumpen valde ankare |
| Sida: namn, pris, uppslag | + arketyp, slot, timing, säkerhet, "Frågan", "Kan gå för att", "Största risken" | Axel ska kunna svara på 12 kort på två minuter |

## Steg för steg

| # | Steg | Kommando | Skriver |
|---|---|---|---|
| 0A | Axels svar | `Artifact read_db` → `python3 feedback.py samla` | `feedback/`, `vikter.json`, `LARDOMAR.md`, `koncept.json` |
| 0B | Metas facit | `python3 meta_facit.py hamta && python3 meta_facit.py utfall && python3 koncept.py backfyll` | `facit/kampanjer.json`, `facit/FACIT.md`, `facit/snapshots/<datum>.json`, `utfall.json`, `koncept.json` |
| 0C | Lär | `python3 larande.py` | `LEARNING_STATE.md`, `larande.json` |
| 0D | Säsong | `python3 sasong.py` | `korningar/<datum>/SASONG.md` |
| 1 | Upptäck | 3–4 discovery-linser enligt `V3-AGENTPROTOKOLL.md` (ägare → objekt → friktion; 70 % exploit / 30 % explore) | `korningar/<datum>/v3/kandidater-*.json`, `v3/bilder/` |
| 2 | Verifiera | ingår i 1: `ali.py <id>` + hero sedd + pris ur sökträffen = `LIVE_VERIFIED` med UTC-stämpel | — |
| 3 | Svenska golvet + ankare + material + ekonomi | ingår i 1, med URL per pris | — |
| 4 | Ranka | `python3 rank.py --in korningar/<datum>/v3/kandidater-*.json --ut korningar/<datum>/v3/batch.json` | `batch.json` (5–8 exploit, 2–4 explore, 1–3 säsong; aldrig utfyllt) |
| 5 | Batch → gamla formatet | `python3 v3_till_fynd.py --batch korningar/<datum>/v3/batch.json` | `korningar/<datum>/fynd.json`, koncept-id per rad |
| 6 | Ark + sida | `python3 offert.py --fynd …` · `python3 sida.py --fynd …` · publicera mot samma URL med `downloads` + `db` | `Leverantorsoffert-<datum>.xlsx`, `sida.html` |
| 7 | Persistera | `STATUS.md`, raden i `LEARNING_STATE.md` (egna anteckningar), `RUTIN-KVITTO.md`, commit + push | grenen |
| 8 | Rapportera | Discord (`DISCORD_WEBHOOK_URL`), svaret till Axel | — |

## Metas feedbackloop — så läses en launch dag för dag

`meta_facit.py` klassar varje kampanj mot produktens egen BE-CPA (AOV ÷ BE-ROAS; under 3 köp används listpriset):

| Dag | Exempel | Band | Klass |
|---|---|---|---|
| 1–2 | 600 kr, 0 köp, BE-CPA 400 | TOO_EARLY | INSUFFICIENT_DATA |
| 3 | 900 kr, 0 köp | EARLY_SIGNAL (≥ 2× BE-CPA utan köp) | INSUFFICIENT_DATA, lutning negativ |
| 5 | 2 500 kr, 4 köp, CPA 625 | EARLY_SIGNAL (< 3× BE-CPA eller < 5 köp) | INSUFFICIENT_DATA, lutning negativ |
| 7 | 2 600 kr, 15 köp, ROAS 6,4 (V1) | MEANINGFUL (≥ 3× BE-CPA, ≥ 5 köp) | REAL_WINNER preliminär |
| 10 | samma + snapshot ≥ 3 dygn senare säger samma | MEANINGFUL/HIGH | REAL_WINNER **bekräftad** → väger 3 i `vikter.json` |

UNTESTED (< 300 kr) tränas aldrig som förlorare. INSUFFICIENT_DATA visas med lutning men räknas inte i signalerna.

## Definition of done per dag — se `.claude/commands/produktjakt.md`
