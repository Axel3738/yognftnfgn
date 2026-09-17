# Bildöversättningen stoppade 2026-09-17 — CaraShell takskyddet

Sju rader låg i `SE-ACTIVE to be translated`. **Ingen laddades upp.** Copyn är
klar och sparad (`adcopy-NO.json`, `bildtexter-NO.json`); det som inte går är
att få bort den svenska texten ur bilderna.

## Vad som är fel

`pipeline/oversatt-bild.py` suddar den gamla texten genom att fylla textpixlarna
med formens egen färg och rita den nya texten i samma ruta. Det fungerar på
`/bildannonser`-bilderna (Bäverbutiken, `bildannonser/text.py`). På OPS-bilderna
— ritade av `factory/bild-text.py` sedan 2026-09-15 — **suddas glyferna inte
bort**: den nya norska texten ritas ovanpå den gamla svenska, som fortfarande
syns.

Mätt på tre av sju, alla med samma fel:

| Annons | Vad som syns |
|---|---|
| `SP_6_1` | "16 omdömen. Inte en" ligger kvar bakom "16 anmeldelser. Ikke en stjerne" — dubbelexponerad rubrik |
| `CS_5_1` | "1 469 kr → 1 129 kr" ligger kvar bakom "1 382,50 kr → 1 106 kr". Underraden försvann helt |
| `CS_6_1` | "1 129 kr" ligger kvar bakom det nya priset i prisbrickan |

Felet sitter i suddsteget, som är gemensamt för alla sju — de fyra ogranskade
har ingen anledning att bete sig annorlunda.

Dessutom hittar formdetektorn inte alla former i de här bilderna:
`PD_7_1` saknar bottenbandet och vänsteretiketten (3 former hittade, 5 finns),
och citatkortet i `SP_7_1`/`SP_5_1` detekteras med fler rader än det har, så
Lars citat blir kvar på svenska.

## Varför ingenting laddades upp ändå

En dubbelexponerad prisbricka som visar **både 1 129 kr och 1 106 kr** för en
norsk kund är värre än ingen annons alls. Kommandots regel är uttrycklig:
"Aldrig leverera en bild med fel." Raderna ligger därför kvar i
`SE-ACTIVE to be translated` och ingen Notion-status ändrades.

## Vad som behöver göras (kodändring, inte ett handgrepp)

`oversatt-bild.py` behöver känna igen `factory/bild-text.py`:s rendering —
sannolikt kantutjämningen: suddmasken plockar bara pixlar nära textfärgen
(`< 70` i summerad avvikelse), och OPS-textens halvgenomskinliga kantpixlar
faller utanför. Formdetektorn behöver dessutom hitta smala chip/etiketter
(prisbrickan ligger i en rundad ruta inuti en fullbred vit remsa — i dag
modelleras remsan, inte brickan).

Tills det är gjort kan ingen OPS-bildannons med inbränd text översättas
automatiskt.

## Det som ÄR klart och återanvänds nästa körning

- `adcopy-NO.json` — primary/headline/description på bokmål för alla sju
- `bildtexter-NO.json` — bildtexterna rad för rad på bokmål
- `oversatt-output.json` — tre-frågorstestet per annons
- **Priset är utrett:** Norge har eget pris, verifierat live samma dag mot
  `carashell.se/nb/products/takskyddet?country=NO` → `"price":110600`,
  `"compare_at_price":138250`, `"currencyCode":"NOK"`. Alltså **1 106 kr /
  1 382,50 kr / spar 276,50 kr / 20 %**. De svenska talen (1 129 / 1 469 /
  340 / 23 %) hör inte hemma i norsk copy — rabattprocenten skiljer sig.
  Det upphäver anteckningen i `dna.md` från 2026-09-14 ("skrivs utan pris
  tills det är utrett"): det är utrett nu.

---

## Rättelse 2026-09-17 kväll (US-rundan)

Slutsatsen "tills det är gjort kan ingen OPS-bildannons med inbränd text
översättas automatiskt" stämmer inte. **Samma sju bilder översattes till
amerikansk engelska 2026-09-16 kväll och gick live i US-kampanjen**, granskade
sida vid sida, utan spökskrift — med en annan väg än `oversatt-bild.py`:

`market-expansion/ops/carashell/2026-09-16-us-3/oversatt-us.py` räknar om
SE-layouten exakt med `factory/bild-text.py`:s egen `Duk` (ingen formdetektor),
suddar den svenska texten radvis inuti bandet/chipen och ritar den nya texten i
samma ruta med samma typsnitt, storlek, färg och justering. Chips som behöver
bli bredare ritas bredare i samma hörn. Sedan 2026-09-17 tar skriptet
`--batch <mapp> --marknad NO`.

**Nästa NO-runda gör så här:** skriv `textlager-no.json` i elementformatet
(`se-texter.json` i US-batchen är facit för typ och ordning per bild — kopiera den
till NO-batchen; texterna finns redan i `bildtexter-NO.json`, bara att lägga in
per `typ`: topprubrik → `rubrik`, underrad → `underrad`, prisbricka → `pris`,
bottenband → `botten`, citat/namn/stjärnor/badge som i SE), kör
`python3 market-expansion/ops/carashell/2026-09-16-us-3/oversatt-us.py --batch <NO-batch> --marknad NO`,
läs varje `.qa.png`, ladda upp med `--kampanj`. Ingen kodändring i
`oversatt-bild.py` behövs för det här.
