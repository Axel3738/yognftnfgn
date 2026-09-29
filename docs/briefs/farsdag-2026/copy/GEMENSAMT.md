# Fars dag-batchen 2026-09-28 — gemensamma regler för copyn

Du skriver BARA svenska annonsrader. Huvudsessionen har redan bestämt bilderna (vilket klipp som ligger under varje rad). Din rad måste säga samma sak som bilden under den.

## Uppdraget
Butiken kör en fars dag-rea. Fars dag är söndag 8 november 2026. Sista dag att beställa om paketet ska hinna fram till fars dag är 19 oktober (mätt på leveranstiderna till Sverige). "Rean" är produktsidans nuvarande pris mot dess ordinarie pris (ägarens beslut) — skriv priset så här: "459 kr, ord. 599 kr" (byt siffrorna mot produktens).

Köparen är den som letar present till en pappa (barn eller partner) — ELLER pappan själv. Hooken ska inom tre sekunder säga att det här är en fars dag-present, och den ska vara konkret för just den här produkten och just den här pappan (vad han gör, var han står, vad han pratar om). Aldrig en allmän presentrad som vilken butik som helst kan skriva.

## Järnregler (bryts en = raden går inte ut)
1. Läs docs/copy-regler.md i repot /home/user/yognftnfgn och följ den. Varje rad klarar tre-frågorstestet: visualisera ✅, falsifiera ✅, "kan en konkurrent signera den?" ska vara ❌ (❌ är rätt svar).
2. En hook är ett PÅSTÅENDE, aldrig en fråga.
3. Max tre ord per sekund: en videorad på 3 sekunder har högst 9 ord (siffror räknas som ord).
4. Butikens namn, domän eller logga står ALDRIG någonstans.
5. Inga recensioner, inga stjärnor, inga citat från "kunder", inga "många har köpt", inga "älskad av".
6. Ingen påhittad brådska: inga "idag", "bara nu", "få kvar", "innan det tar slut", ingen nedräkning. Den ENDA brådskan är den riktiga: "Beställ senast 19 oktober" (valfritt: "… så hinner den fram till fars dag").
7. Inga tankstreck i en svensk rad (inget "–", inget "—"). Punkt eller "och" i stället.
8. Bara siffrorna som står under "Tillåtna siffror" för produkten, plus 8 (november), 19 (oktober). Inga procent om de inte står där.
9. Inga löften om leveranstid i dagar, ingen fri frakt, ingen Klarna, inget "öppet köp", ingen garanti.
10. Varje påstående om produkten ska finnas på produktsidan (faktafilen). Hitta aldrig på en mekanism, ett mått eller en egenskap.
11. Säg "fars dag" (två ord, gemener mitt i mening) och "Fars dag-rea" (så skrivs erbjudandet).

## Formatet
Videon är ett omklipp av en befintlig annons: föräldrens bild behålls, ny svensk voice-over och nya textrader. Rad 1 är hooken och finns i två versioner (H1 och H2) som ligger på OLIKA klipp — skriv varje hook för sitt eget klipp. Raderna 2 till sista är identiska i H1 och H2. Sista raden är erbjudandet.

Bildannonsen (static) har: rubrik (max 8 ord), underrad (max 12 ord), märket "Fars dag-rea", prisbandet, och en rad längst ner med sista beställningsdagen.

## Svara med EXAKT denna JSON (inget annat runt om), allt på svenska utom "engelska":
{
  "hook_H1": {"rad": "...", "engelska": "...", "alternativ": ["...", "..."]},
  "hook_H2": {"rad": "...", "engelska": "...", "alternativ": ["...", "..."]},
  "rader": [ {"nr": 2, "rad": "...", "engelska": "..."}, ... , {"nr": <sista>, "rad": "<erbjudandet>", "engelska": "..."} ],
  "text_pa_skarm": { "1_H1": "...", "1_H2": "...", "2": "...", ... }   // kortare version av raden för skärmen, max 6 ord; samma som raden om den redan är kort
  "bild": {"rubrik": "...", "underrad": "...", "marke": "Fars dag-rea", "prisband": "... kr, ord. ... kr", "sista_raden": "Beställ senast 19 oktober", "engelska": {"rubrik": "...", "underrad": "..."}},
  "copy_card": {"primar": "...", "rubrik": "...", "beskrivning": "..."},
  "tretest": [ {"rad": "<varje unik svensk rad ovan, även text_pa_skarm, bild och copy_card>", "visualisera": true, "falsifiera": true, "konkurrent_kan_signera": false, "kommentar": "..."} ]
}
copy_card.primar: 2–4 korta meningar, börjar med hooken H1 (påstående), sista meningen är "Fars dag-rea: X kr, ord. Y kr. Beställ senast 19 oktober." copy_card.rubrik max 6 ord. copy_card.beskrivning: "Fars dag-rea: X kr, ord. Y kr".
Räkna orden på varje videorad innan du svarar. Skriv om varje rad minst tre varv innan du bestämmer dig (copy-regler: skriv om, skriv om).
