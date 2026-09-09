# Räkningen — TankGuard, steg 9 i `/ny-annonser`

Körd 2026-09-09. **Annonser räknade ur `act_915422744950975/ads`** — aldrig ur
`advideos`/`adimages`. Media i kontot är inte en annons.

## Källkontona — svepta på ALLA kampanjer, inte en per konto

| Konto | Annonser totalt | Med IBC-prefix | Kampanjer med prefixet |
|---|--:|--:|--:|
| MagiBorsten SE `1867947880635861` | 1 679 | 36 | 1 |
| Magiborsten NO `1050941584152547` | 572 | 33 | 1 |

SE: `IBC-Tanköverdraget | BE ROAS 1.51 | Launch 2026-08-28` (ACTIVE)
NO: `IBC-tanktrekk NO | BE-ROAS 1,63 | 2026-08-29` (ACTIVE)

Svepet gick på **varje annons** i båda kontona och grupperade på `campaign_id`,
inte på ett kampanjnamn valt i förväg. **En kampanj per konto — inga fler.**

---

## SVERIGE — `TANKGUARD_SE_Tanköverdraget | 2026-09-08`

| Dom | Källa | Ska bli | Uppe | Saknas |
|---|--:|--:|--:|--:|
| `ren` | 20 | 20 | **20** | 0 |
| `kräver-omdubb` | 11 | 11 | **11** | 0 |
| `kräver-slutkortsbygge` | 2 | 2 | **2** | 0 |
| `okänd` | 1 | 0 — får inte laddas upp | 1 ⚠️ | — |
| **Summa** | **34** | **33** | **33** | **0** |

**33 av 33. Ingen saknas.**

Sex adsets (BOF, CO, CS, GT, PD, SP), allt PAUSED, TankGuards egen pixel
`2196132151319625`, geo SE, CBO 1 000 kr/dag.

**Vad som gjordes med de 13 videorna:**

| Grupp | Antal | Åtgärd |
|---|--:|---|
| `PD_1_H1/H2/H3` | 3 | Omdubbade (HeyGen, svenska→svenska). Bara EN talreplik bar brandet. Den inbrända captionraden bytt från "från bäverbutiken." till "från TankGuard." |
| `CS_1_H2/H3`, `GT_1_H1/H2/H3`, `SP_1_H1/H2/H3` | 8 | **Nytt manus**, inte ordbyte — deras tal bar hela det falska erbjudandet respektive ett kundvittnesmål. Omdubbade OCH hela captionspåret utbytt med `no-precis.py`, eftersom rösten annars sagt en sak och texten en annan |
| `GT_3_H1`, `PD_3_H1` | 2 | Ingen omdubb — talet var rent. **Slutkortet ombyggt:** ordmärket, bäversymbolen, svenska flaggan, stjärnorna, "10 recensioner" och prisparet "636 kr 489 kr" → TANKGUARD-banderoll och "489 kr" |

De åtta caption-bytta OCR-grindades på 160 frames före uppladdning: **noll
träffar** på förbjudna påståenden.

### `PD_Extra` — uppe men pausad
Domen är `okänd`: talet gick aldrig att läsa, det finns inget transkript. Den
laddades upp i den första körningen innan räkningsspärren fanns. **Nu pausad**
(`120249008687250172`). Räknas inte mot målet och ska inte gå ACTIVE förrän
någon lyssnat på de tio sekunderna.

### Två källannonser utan dom
`PD_4_H1` och `PD_4_H2` tillkom i källkontot **efter** brand-detektorns körning
(34 → 36). De har ingen dom och är därför inte byggda. De är **olästa**, inte
rena. Kör brand-detektorn igen innan de får en plats i räkningen.

---

## NORGE — `TANKGUARD_NO_Tanktrekket | 2026-09-09`

Kampanjen byggd i **samma konto** som den svenska (`915422744950975`), PAUSED,
1 000 kr/dag, CBO. Fem adsets (BOF, CO, GT, PD, SP). Targeting läst ur den
norska källkampanjens eget adset — geo `["NO"]`, aldrig en fallback-geo.
Länk: `https://tankguard.se/nb/products/tankoverdraget`. Pixel: TankGuards egen.

| Grupp | Källa | Ska bli | Uppe | Saknas |
|---|--:|--:|--:|--:|
| Bild, **ren** media | 10 | 10 | **10** | 0 |
| Bild, **smutsig** media | 10 | 0 | 0 | — |
| Video | 13 | 13 | **0** | 13 |
| **Summa** | **33** | **23** | **10** | **13** |

### De 10 som hålls, och varför

| Creative | Vad som sitter inbränt i bilden |
|---|---|
| `BOF_1_1` | pris 439/586, 25 % rabatt, gratis frakt |
| `BOF_2_1` | Klarna, 30 dagers åpent kjøp |
| `BOF_6_1` | frakt, Klarna |
| `CS_2_1` | pris 439/586, 25 % |
| `CS_3_1` | pris, rabatt, frakt, Klarna |
| `CS_4_1` | pris 439/586, 147 kr, 25 % |
| `RV_1_1` · `RV_2_1` · `RV_4_1` | stjärnor + **`baverbutiken.se` inbränd i bilden** |
| `RV_3_1` | samma, plus 25 % rabatt |

⚠️ **NO-specifikt fynd:** de fyra norska RV-bilderna bär källbutikens domän
inbränd. De svenska gör det inte — den norska lokaliseringen lade till den.

### De 13 videorna som saknas

`CS_1_H2`, `CS_1_H3`, `GT_1_H1`, `GT_1_H2`, `GT_1_H3`, `GT_3_H1`, `PD_1_H1`,
`PD_1_H2`, `PD_1_H3`, `PD_3_H1`, `SP_1_H1`, `SP_1_H2`, `SP_1_H3`

**Orsak, gemensam för alla 13:** mediat är inte grindat. De svenska videorna
fick frame-OCR som visade exakt vad som satt inbränt; de norska har inte fått
den läsningen. Utan den vet ingen vilka som behöver omdubb och vilka som bara
behöver en textrad bytt — och `❔ oläst` är aldrig `ren`.

### Priset i den norska copyn
Den norska texten **nämner inget pris alls**. TankGuard har inget känt NOK-pris
i repot, och källans 439/586 kr är Bäverbutiken NO:s tal. Ett SEK-tal i en norsk
annons räknar fel, och ett påhittat NOK-tal är förbjudet. Priset står på
`/nb`-sidan i stället. Sätts NOK-nivåer i butiken kan pris läggas till.

---

## Summan

| Marknad | Byggt | Mål | Läge |
|---|--:|--:|---|
| Sverige | **33** | 33 | ✅ komplett |
| Norge | **10** | 23 | ⚠️ 13 videor saknas |

**DELVIS KLART.** Sverige är färdigt. Norge har sin kampanj och alla creatives
vars media är bevisat rena — de 13 videorna väntar på samma mediagrind som den
svenska sidan fick.

⚠️ **Röstkontrollen är inte gjord på de 11 svenska omdubbade videorna.**
CLAUDE.md järnregel 3 kräver att någon lyssnar på hook, mitt och slut. En
molnsession kan inte lyssna. De ligger PAUSED och ska inte gå ACTIVE förrän
någon hört dem.
