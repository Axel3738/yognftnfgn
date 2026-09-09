# Räkningen — TankGuard, steg 9 i `/ny-annonser`

Körd 2026-09-09. **Annonser räknade ur `act_915422744950975/ads`** — aldrig ur
`advideos`/`adimages`. Media i kontot är inte en annons.

## Källkontona — svepta på ALLA kampanjer, inte en per konto

| Konto | Annonser totalt | Med IBC-prefix | Antal kampanjer |
|---|--:|--:|--:|
| MagiBorsten SE `1867947880635861` | 1679 | 36 | 1 |
| Magiborsten NO `1050941584152547` | 572 | 33 | 1 |

SE: `IBC-Tanköverdraget | BE ROAS 1.51 | Launch 2026-08-28 [ACTIVE]`
NO: `IBC-tanktrekk NO | BE-ROAS 1,63 | 2026-08-29 [ACTIVE]`

**En kampanj per konto — inga fler.** Svepet gick på varje annons i båda kontona
och grupperade på `campaign_id`, inte på ett kampanjnamn jag valt i förväg.

## SVERIGE

| Dom | Källa | Ska bli | Uppe nu | Saknas |
|---|--:|--:|--:|--:|
| `ren` | 20 | 20 | 20 | 0 |
| `kräver-omdubb` | 11 | 11 | 0 | 11 |
| `kräver-slutkortsbygge` | 2 | 2 | 0 | 2 |
| `okänd` | 1 | 0 — får inte laddas upp | 1 | ⚠️ 1 uppe ändå |
| **Summa som ska byggas** | **33** | **33** | **20** | **13** |

⚠️ **Källan har växt.** Brand-detektorn kördes på 34 annonser 2026-09-08.
Kontot bär nu **36**. Två har tillkommit och saknar dom helt:
`PD_4_H2`, `PD_4_H1` — de är inte `ren`, de är **olästa**.
Kör brand-detektorn igen innan de får en plats i räkningen.

### Varje annons som saknas, och varför

| Annons | Dom | Varför den inte är byggd |
|---|---|---|
| `CS_1_H2` | kräver-omdubb | Videon säger "Bäverbutiken" högt OCH visar det i inbränd text. Måste dubbas om (HeyGen) och få undertextraden bytt (`no-precis.py`) innan den får bli en annons. |
| `CS_1_H3` | kräver-omdubb | Videon säger "Bäverbutiken" högt OCH visar det i inbränd text. Måste dubbas om (HeyGen) och få undertextraden bytt (`no-precis.py`) innan den får bli en annons. |
| `GT_1_H1` | kräver-omdubb | Videon säger "Bäverbutiken" högt OCH visar det i inbränd text. Måste dubbas om (HeyGen) och få undertextraden bytt (`no-precis.py`) innan den får bli en annons. |
| `GT_1_H2` | kräver-omdubb | Videon säger "Bäverbutiken" högt OCH visar det i inbränd text. Måste dubbas om (HeyGen) och få undertextraden bytt (`no-precis.py`) innan den får bli en annons. |
| `GT_1_H3` | kräver-omdubb | Videon säger "Bäverbutiken" högt OCH visar det i inbränd text. Måste dubbas om (HeyGen) och få undertextraden bytt (`no-precis.py`) innan den får bli en annons. |
| `PD_1_H1` | kräver-omdubb | Videon säger "Bäverbutiken" högt OCH visar det i inbränd text. Måste dubbas om (HeyGen) och få undertextraden bytt (`no-precis.py`) innan den får bli en annons. |
| `PD_1_H2` | kräver-omdubb | Videon säger "Bäverbutiken" högt OCH visar det i inbränd text. Måste dubbas om (HeyGen) och få undertextraden bytt (`no-precis.py`) innan den får bli en annons. |
| `PD_1_H3` | kräver-omdubb | Videon säger "Bäverbutiken" högt OCH visar det i inbränd text. Måste dubbas om (HeyGen) och få undertextraden bytt (`no-precis.py`) innan den får bli en annons. |
| `SP_1_H1` | kräver-omdubb | Videon säger "Bäverbutiken" högt OCH visar det i inbränd text. Måste dubbas om (HeyGen) och få undertextraden bytt (`no-precis.py`) innan den får bli en annons. |
| `SP_1_H2` | kräver-omdubb | Videon säger "Bäverbutiken" högt OCH visar det i inbränd text. Måste dubbas om (HeyGen) och få undertextraden bytt (`no-precis.py`) innan den får bli en annons. |
| `SP_1_H3` | kräver-omdubb | Videon säger "Bäverbutiken" högt OCH visar det i inbränd text. Måste dubbas om (HeyGen) och få undertextraden bytt (`no-precis.py`) innan den får bli en annons. |
| `GT_3_H1` | kräver-slutkortsbygge | Slutkortet visar ordmärket BÄVERBUTIKEN, bäversymbolen, "10 recensioner" och prisparet "636 kr 489 kr". Måste byggas om med `lager.py`. |
| `PD_3_H1` | kräver-slutkortsbygge | Slutkortet visar ordmärket BÄVERBUTIKEN, bäversymbolen, "10 recensioner" och prisparet "636 kr 489 kr". Måste byggas om med `lager.py`. |
| `PD_4_H2` | **oläst** | Tillkom i källkontot efter brand-detektorns körning. Ingen dom finns — får inte byggas förrän den är läst. |
| `PD_4_H1` | **oläst** | Tillkom i källkontot efter brand-detektorns körning. Ingen dom finns — får inte byggas förrän den är läst. |

⚠️ **Ingen av de 13 videorna ligger i målkontot ens som media.** Endast
`PD_Extra.mp4` är uppladdad. Kontrollerat i `act_915422744950975/advideos`.

### PD_Extra
Domen är `okänd` — talet gick aldrig att läsa, det finns inget transkript.
Den laddades upp och byggdes ändå i den första körningen. **Nu pausad**
(`120249008687250172`, PAUSED/PAUSED, verifierat mot Meta). Den ska inte gå
ACTIVE förrän någon lyssnat på de tio sekunderna och stängt ytan.

## NORGE

Källan är läst: **33 annonser**, alla ACTIVE, i en kampanj.
Ytorna 1 (copy), 2 (talet, ur de norska SRT:erna i repot) och 5 (pris) är lästa —
se `kallannonser.md`. Ytorna 3 och 4 är fortfarande olästa.

| | Antal |
|---|--:|
| Källannonser i Magiborsten NO | 33 |
| Byggda i TANKGUARD_NO | **0** |
| Kampanjen TANKGUARD_NO | finns inte |

**Varför noll:** TankGuard har inga NOK-priser i repot och ingen norsk
produktlänk. Den norska källan säljer för 439 kr / 586 kr / 25 % — det är
Bäverbutiken NO:s tal, inte TankGuards. Ett SEK-tal i en norsk annons räknar
fel, och priser får aldrig hittas på. `factory/butiker/tankguard.yaml` finns
inte, och det är den filen som bär marknader, valuta och paketnivåer.

## Summan, rakt ut

**Sverige: 20 av 33 byggda.** Alla 20 `ren` ligger uppe. De 13 videorna gör det inte.
**Norge: 0 av 33.** Kampanjen finns inte.
**Detta är delvis klart.**
