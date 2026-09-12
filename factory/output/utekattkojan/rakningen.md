# Räkningen — utekattkojan · 2026-09-12

Annonser räknade ur `act_915422744950975/ads` — aldrig ur `advideos`/`adimages`. Media i kontot är inte en annons.

## SE

```
Källannonser:       16
  rena              12  → ska bli 12 annonser
  bara-copy          0  → ska bli 0 annonser
  kräver-omdubb      3  → ska bli 3 annonser
  slutkortsbygge     1  → ska bli 1 annonser
  okänd              0  → ska INTE laddas upp
  odömd              0  → ska INTE laddas upp
  uteslutna          0  → var och en NAMNGIVEN med vad som krävs
Uppladdade i kontot:  13  ← läst ur Meta, inte ur minnet
```

| Dom | Källa | Ska bli | Uppe | Saknas |
|---|--:|--:|--:|--:|
| `ren` | 12 | 12 | 12 | 0 |
| `bara-copy` | 0 | 0 | 0 | 0 |
| `kräver-omdubb` | 3 | 3 | 0 | 3 |
| `kräver-slutkortsbygge` | 1 | 1 | 1 | 0 |
| `okänd` | 0 | 0 | 0 | 0 |
| `odömd` | 0 | 0 | 0 | 0 |
| **Summa** | **16** | **16** | **13** | **3** |

### Saknas i kontot — 3 st, var och en namngiven

| Annons | Dom | Orsak |
|---|---|---|
| `Utekattkoja_CS_3_H1` | kräver-omdubb | VÄNTAR PÅ ÄGARBESLUT — samma som CS_1_H1, plus 'nästan slutsåld' och 'sista chansen till rabatterat pris' i både tal och inbränd text. Kräver nytt manus + omdubb + ny inbränd text. |
| `Utekattkoja_CS_1_H1` | kräver-omdubb | VÄNTAR PÅ ÄGARBESLUT — talet läser upp 'från 1059 kronor ner till 809' (butiken säljer 789, jämförpris 1039) och lovar 'erbjudandet gäller bara idag' + 'lagret krymper'. Samma påståenden är inbrända i bilden. Kräver nytt manus + omdubb (HeyGen har 10 148 krediter) + ny inbränd text via pipeline/no-precis.py — inte en prisswap, eftersom hela vinkeln är en kampanj butiken saknar. |
| `Utekattkoja_CS_2_H1` | kräver-omdubb | VÄNTAR PÅ ÄGARBESLUT — samma som CS_1_H1: '809 kronor istället för 1059, men bara idag' i talet och inbränt. Kräver nytt manus + omdubb + ny inbränd text. |

## NO

```
Källannonser:       11
  rena               0  → ska bli 0 annonser
  bara-copy          0  → ska bli 0 annonser
  kräver-omdubb      0  → ska bli 0 annonser
  slutkortsbygge     0  → ska bli 0 annonser
  okänd              0  → ska INTE laddas upp
  odömd             11  → ska INTE laddas upp
  uteslutna          0  → var och en NAMNGIVEN med vad som krävs
Uppladdade i kontot:   0  ← läst ur Meta, inte ur minnet
```

| Dom | Källa | Ska bli | Uppe | Saknas |
|---|--:|--:|--:|--:|
| `ren` | 0 | 0 | 0 | 0 |
| `bara-copy` | 0 | 0 | 0 | 0 |
| `kräver-omdubb` | 0 | 0 | 0 | 0 |
| `kräver-slutkortsbygge` | 0 | 0 | 0 | 0 |
| `okänd` | 0 | 0 | 0 | 0 |
| `odömd` | 11 | 0 | 0 | 11 |
| **Summa** | **11** | **0** | **0** | **11** |

### Saknas i kontot — 11 st, var och en namngiven

| Annons | Dom | Orsak |
|---|---|---|
| `Utekattehus_NO_PD_2` | odömd | ingen dom — brand-detektorn har inte läst annonsen (oläst är aldrig ren) |
| `Utekattehus_NO_PD_1` | odömd | ingen dom — brand-detektorn har inte läst annonsen (oläst är aldrig ren) |
| `Utekattehus_NO_CS_3` | odömd | ingen dom — brand-detektorn har inte läst annonsen (oläst är aldrig ren) |
| `Utekattehus_NO_CS_1` | odömd | ingen dom — brand-detektorn har inte läst annonsen (oläst är aldrig ren) |
| `Utekattehus_NO_PD_3` | odömd | ingen dom — brand-detektorn har inte läst annonsen (oläst är aldrig ren) |
| `Utekattehus_NO_G_1` | odömd | ingen dom — brand-detektorn har inte läst annonsen (oläst är aldrig ren) |
| `Utekattehus_NO_SP_1` | odömd | ingen dom — brand-detektorn har inte läst annonsen (oläst är aldrig ren) |
| `Utekattehus_NO_SP_3` | odömd | ingen dom — brand-detektorn har inte läst annonsen (oläst är aldrig ren) |
| `Utekattehus_NO_CS_2` | odömd | ingen dom — brand-detektorn har inte läst annonsen (oläst är aldrig ren) |
| `Utekattehus_NO_G_2` | odömd | ingen dom — brand-detektorn har inte läst annonsen (oläst är aldrig ren) |
| `Utekattehus_NO_SP_2` | odömd | ingen dom — brand-detektorn har inte läst annonsen (oläst är aldrig ren) |

⚠️ noll förväntade annonser för NO — varje källannons är okänd, odömd eller pausad.

---

**DELVIS KLART**
- SE: 3 saknas: Utekattkoja_CS_3_H1, Utekattkoja_CS_1_H1, Utekattkoja_CS_2_H1.
- NO: 11 saknas: Utekattehus_NO_PD_2, Utekattehus_NO_PD_1, Utekattehus_NO_CS_3, Utekattehus_NO_CS_1, Utekattehus_NO_PD_3, Utekattehus_NO_G_1, Utekattehus_NO_SP_1, Utekattehus_NO_SP_3, Utekattehus_NO_CS_2, Utekattehus_NO_G_2, Utekattehus_NO_SP_2.
