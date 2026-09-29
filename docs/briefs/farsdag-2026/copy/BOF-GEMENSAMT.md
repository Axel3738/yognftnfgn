# Fars dag-batchen omgång 4 (BOF), 2026-09-29 — gemensamma regler för copyn

Läs FÖRST `copy/GEMENSAMT.md` i samma mapp: alla dess järnregler gäller ordagrant (tre-frågorstestet, hook = påstående, max tre ord per sekund, inget butiksnamn, inga recensioner, ingen påhittad brådska, inga tankstreck, bara tillåtna siffror, inga leverans-/frakt-/garantilöften, bara sidans fakta, "fars dag" / "Fars dag-rea").

## Vad som är annorlunda den här gången: BOF
Den här batchen är **bottom of funnel**: tittaren har redan sett produkten (retargeting) och vet vad den är. Hon eller han tvekar av ETT skäl — invändningen som står i uppdraget — eller väntar på ett skäl att köpa nu. Därför:
- Produkten får nämnas direkt i hooken (den behöver inte "introduceras").
- Hooken är fortfarande ett PÅSTÅENDE, aldrig en fråga. Invändningen skrivs som ett svar, inte som en fråga: inte "Passar den min motor?" utan "Nio storlekar. Mät motorn, välj rätt."
- Ingen storytelling, ingen scen med en person som pratar. Kort, konkret, sidans fakta.
- Fars dag ska höras inom tre sekunder ELLER stå på skärmen i rad 1 (skärmtexten får bära "fars dag" om hooken inte gör det — skriv då "text_pa_skarm" så).

## Videon FD_3 — 13 sekunder, fyra rader
| Rad | Tid | Vad | Ordgräns |
|---|---|---|---|
| 1 | 0–3 s | Hooken, tre varianter på OLIKA klipp (se bilderna i uppdraget) | 9 ord |
| 2 | 3–6 s | Svaret på invändningen: mekanismen/fakta som syns i bilden | 9 ord |
| 3 | 6–9 s | Vad han får / passform / storlek: fakta som syns i bilden | 9 ord |
| 4 | 9–13 s | Erbjudandet: "Fars dag-rea: X kr, ord. Y kr. Beställ senast 19 oktober." (skriv priset som i uppdraget) | 12 ord |
Rad 2–4 är identiska i H1, H2 och H3 — hooken är enda variabeln.

**Hooktyperna (en per variant, i den här ordningen):**
- **H1 = invändningen besvarad.** Ett påstående som stänger tvivlet med sidans fakta. Bilden under är föräldrahook 1.
- **H2 = priset först.** Priset och jämförpriset är hooken (siffrorna får stå), plus vad det är. Bilden under är föräldrahook 2.
- **H3 = sista dagen först.** "Beställ senast 19 oktober" som öppning, kopplat till fars dag och produkten (inte allmänt). Bilden under är det tredje klippet i uppdraget.
Varje hook ska passa sitt eget klipp: raden säger det bilden visar.

## Bilderna FD_4_1 till FD_4_4 — samma foto, samma badge, prisband och bottenrad; bara rubrik + underrad skiljer
| Bild | Jobb | Rubrik (max 8 ord) | Underrad (max 12 ord) |
|---|---|---|---|
| FD_4_1 | invändningen | svaret på tvivlet, som påstående | sidans fakta som bevisar det |
| FD_4_2 | priset först | priset mot jämförpriset ÄR rubriken ("579 kr till fars dag. Ord. 965 kr.") | vad han får |
| FD_4_3 | sista dagen | "Beställ senast 19 oktober" + fars dag + produkten | vad som hinner fram / varför just den |
| FD_4_4 | vad han får | innehållet/storleken/fakta som rubrik | resten av fakta-listan, kort |
Rubrikerna ska skilja sig tydligt från varandra och från de rubriker som redan finns på produkten (de står i uppdraget) — ingen får vara en omskrivning av en annan.

## COPY CARD (Metas primärtext, BOF)
2–4 korta meningar: börjar med invändningen besvarad (H1-raden eller nära den), sedan fakta, sista meningen "Fars dag-rea: X kr, ord. Y kr. Beställ senast 19 oktober." Rubrik max 6 ord. Beskrivning: "Fars dag-rea: X kr, ord. Y kr".

## Svara med EXAKT denna JSON i filen som uppdraget anger (inget annat i filen), svenska överallt utom "engelska":
{
  "hook_H1": {"rad": "...", "engelska": "...", "alternativ": ["...", "..."]},
  "hook_H2": {"rad": "...", "engelska": "...", "alternativ": ["...", "..."]},
  "hook_H3": {"rad": "...", "engelska": "...", "alternativ": ["...", "..."]},
  "rader": [ {"nr": 2, "rad": "...", "engelska": "..."}, {"nr": 3, "rad": "...", "engelska": "..."}, {"nr": 4, "rad": "<erbjudandet>", "engelska": "..."} ],
  "text_pa_skarm": { "1_H1": "...", "1_H2": "...", "1_H3": "...", "2": "...", "3": "..." },
  "bilder": {
    "FD_4_1": {"rubrik": "...", "underrad": "...", "engelska": {"rubrik": "...", "underrad": "..."}},
    "FD_4_2": {"rubrik": "...", "underrad": "...", "engelska": {"rubrik": "...", "underrad": "..."}},
    "FD_4_3": {"rubrik": "...", "underrad": "...", "engelska": {"rubrik": "...", "underrad": "..."}},
    "FD_4_4": {"rubrik": "...", "underrad": "...", "engelska": {"rubrik": "...", "underrad": "..."}}
  },
  "copy_card": {"primar": "...", "rubrik": "...", "beskrivning": "..."},
  "tretest": [ {"rad": "<varje unik svensk rad ovan: hookar, alternativ, rader, skärmtexter, alla rubriker och underrader, copy_card>", "visualisera": true, "falsifiera": true, "konkurrent_kan_signera": false, "kommentar": "..."} ]
}
text_pa_skarm: max 6 ord, samma som raden om den redan är kort. Räkna orden på varje rad (siffror räknas som ord, "1 129" är två ord) innan du svarar. Skriv om varje rad minst tre varv.
