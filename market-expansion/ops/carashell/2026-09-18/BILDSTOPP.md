# Bildöversättningen 2026-09-18 — CaraShell takskyddet

**Rättelse av gårdagens diagnos.** Igår skrev jag att `pipeline/oversatt-bild.py`
inte får bort den svenska texten och höll därför alla sju annonserna. **Det var
fel.** Suddsteget mätt i dag på den riktiga `SP_6_1`: bandet är helt platt
(std 0,00) utanför texten och 1,06 nivåer där texten satt — alltså under en
promille av 255, osynligt. Det jag tog för ett spöke fanns inte i datan.

Det verkliga felet igår var **mitt eget**: jag matade en form som har tre
textrader med bara två av dem, så verktyget radbröt om och geometrin sköt isär.
Med hela formens text blir samma bild ren. `SP_6_1` gick därför live i dag.

## Vad som faktiskt inte fungerar

Tre saker, alla i hur `oversatt-bild.py` MODELLERAR OPS-bildernas layout — inte
i suddet:

| Fel | Var det syns | Vad som händer |
|---|---|---|
| Fullbred rubrik över delad bild detekteras inte | `PD_6_1` | Detektorn hittar bara den högra mörka panelen (x 443–872). Rubriken spänner hela bredden, blir aldrig en form, och står kvar på svenska medan den norska ritas i panelen — två rubriker |
| ★ saknas i Liberation Sans | `SP_5_1`, `SP_7_1` | Stjärnraden ritas om som fyrkanter (□□□□□) och originalstjärnorna blir kvar |
| Prisbrickan modelleras inte | `CS_5_1`, `CS_6_1` | Detektorn tar den fullbreda vita remsan, inte det rundade chipet inuti. Den nya texten ritas över remsan och `1 469 kr → 1 129 kr` står kvar i chipet |
| Band och etiketter utanför formerna | `PD_7_1` | 3 former hittade av 5 — bottenbandet och vänsteretiketten står kvar på svenska |

`factory/bild-text.py` är inte heller en väg runt: den ritar sina element på
sina EGNA beräknade platser, inte där originalet hade dem. Ett försök att måla
om prisbrickan med den lade ett nytt priskort mitt i bilden och lämnade det
gamla chipet kvar — alltså två priser.

## Vad som levererades i dag

`CaraShellRoof_NO_SP_6_1` — annons `120249157622590172`, adset
`CARASHELL_NO_Takovertrekket - SP`, granskad i full storlek: all text norsk,
priset 1 106 kr (ord. 1 382,50 kr), inget svenskt kvar.

## Vad som hålls och varför

`PD_6_1`, `PD_7_1`, `SP_5_1`, `SP_7_1`, `CS_5_1`, `CS_6_1` — var och en faller
på en rad i tabellen ovan. Ingen Notion-status ändrad, inget uppladdat.

## Vad som behöver byggas

1. **Formdetektorn måste se fullbreda rubriker som ligger ovanpå delade foton**
   (`PD_6_1`) och smala chip inuti fullbreda remsor (`CS_*`).
2. **Ett typsnitt med ★**, eller en regel som lämnar stjärnrader helt orörda
   (de behöver ju inte översättas).
3. Kortast väg till alla tre: låt `/ops-bild` **spara `spec.json` + basfotot**
   bredvid annonsen i Notion. Då behöver Norge aldrig sudda något — textlagret
   ritar om samma spec med norska rader på samma foto, och layouten blir
   identisk per konstruktion.
