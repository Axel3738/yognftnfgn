# Lokalisera Matstrumpors egna röstvideor till en ny marknad (2026-09-29)

Tre svenska annonser görs om på marknadens språk med **egen röst (ElevenLabs-dubbning)**:
en svensk AI-kvinnoröst berättar över klipp på sushistrumpor, och texten står inbränd i bild.
Du skriver det rösten ska säga på marknadens språk, **mening för mening med samma tider** som
den svenska, plus bildtexterna. ElevenLabs läser upp din text i samma tidsfönster, och samma
text blir undertexter i videon.

## Filerna

- Svenska manuset med tider: `matstrumpor/marknader/egna/<video>.manus.json` — `[{a, b, sv, stryk?}]` (a/b = sekunder).
  Ett segment med `"stryk": true` (butikens adress) ska INTE översättas — utelämna det.
- Svenska bildtexter: `bildtexter.sv.json` (`hook` = rutan i början, `rubriker` = tre
  avsnittsrubriker med versaler, `knapp` = knappen på slutbilden, `etikett` = slutetiketten).
- Marknadens annonstext (ton, tilltal, ordval): `matstrumpor/marknader/annonser/<KOD>.json`.
- Din fil: `<KOD>/<video>.json` med
  `{"segment": [{"a": …, "b": …, "sv": "…", "text": "…"}], "texter": {…samma nycklar som bildtexter.sv.json för videon…}}`
  — `a`, `b` och `sv` kopieras exakt ur manuset, `text` är din rad. Segment med `stryk` tas inte med.
- Maskinkontrollen: `node kolla-egna.mjs <KOD> <video>` (exit 0 = inga FEL).

## Videorna

- **haikuh3** (52 s): klipp på lådan och strumporna, några kvinnor som äter sushi och öppnar
  lådan. Berättaren gav strumporna till sin mamma och räknar upp tre skäl (ett/två/tre) som
  också står som rubriker i bild. Hook-rutan: "Jag gav min mamma den ultimata oväntade
  presenten men sen fattade jag...".
- **haikuh2** (48 s): samma tre skäl, men öppningen är omvänd psykologi: rösten säger "Tre
  anledningar att inte köpa sushistrumpor" och hook-rutan "Stopp! Köp inte sushistrumpor förrän
  du har sett det här". Slutbild med knappen "BESTÄLL NU".
- **s001h1** (42 s): en kvinna berättar varför hon startade företaget (hon väntar alltid till
  sista sekund med presenter; strumpor tar alltid slut; udda par). Slutetikett "Sushistrumpor".

## Regler (varje brott stoppar filen)

1. **Samma segment, samma tider.** Ett `text` per svenskt segment (utom `stryk`), inga nya,
   inga sammanslagningar. Varje segment ska säga det som det svenska segmentet säger.
2. **Hinns med i tiden.** Ungefär samma talade längd som svenskan: högst ~30 % fler tecken per
   segment än den svenska raden, och i normalt taltempo (ungefär 2,5–3,5 ord per sekund).
   Hellre en kortare, naturlig mening än en fullständig men hetsig.
3. **Inget butiksnamn och ingen webbadress** — aldrig "Matstrumpor", aldrig ".se". I s001h1
   blir "Jag startade Matstrumpor ur en ilska" en mening om att hon startade *det här* (företaget)
   av ren frustration, utan namn.
4. **Inga priser, belopp, valutor, rabattprocent, leveranstider.** "Värdet för pengarna är helt
   absurt" är ett omdöme, inget pris — det får stå naturligt.
5. **Inga nya löften** (ingen fri frakt, garanti, begränsat antal). Mammans omdöme och "hon vill
   redan ha fler" står kvar som berättarens egen historia.
6. **Inget "svensk", "Sverige", "skandinavisk".**
7. **Ingen svenska kvar.**
8. **Siffror som ord** ("fem par", "tre skäl"), inga symboler (%, &, /, tankstreck). Rubrikerna
   "ETT:/TVÅ:/TRE:" blir marknadens ord för ett/två/tre (versaler som originalet).
9. **Idiomatiskt och talat** — som en infödd kvinna som berättar i en TikTok/Reels-video: kort,
   varmt, pratigt. Inte översättningsspråk.
10. **Tilltal:** nb/da/nl du/je, de du, fr vous, es tú (Spanien), it tu, pl ty, pt europeisk
    portugisiska med tu-ton, fi sinä, en you (fungerar i USA, UK, Australien, Kanada, Nya Zeeland).
11. **Produktord ur butikens ordlista:**

| | NO (nb) | DK (da) | FI (fi) | US (en) | DE | FR | NL | ES (Spanien) | IT | PL | PT (Portugal) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| sushistrumpor | sushisokker | sushisokker | sushisukat | sushi socks | Sushi-Socken | chaussettes sushi | sushisokken | calcetines de sushi | calzini sushi | skarpetki sushi | meias de sushi |
| låda | boks | æske | rasia | box | Box | boîte | doos | caja | scatola | pudełko | caixa |
| strumpor | sokker | sokker | sukat | socks | Socken | chaussettes | sokken | calcetines | calzini | skarpetki | meias |

12. **Bildtexterna** ska rymmas där de svenska stod (högst ~30 % fler tecken) och låta som
    reklamtext på språket. `knapp` = marknadens vanliga knapptext för att beställa (versaler).
