# Taköverdraget — finska kampanjen, CaraShell-armen (A/B-test Bäver vs CaraShell, Axels beslut 2026-09-18)

Spec: `FI-KAMPANJ.md`. Byggd av `fi-kampanj/` (skripten där, alla texter i `copy/`, `vo/`, `bilder/`).

**Konto:** Magiborsten FI `act_1619718346388201` (valuta SEK — inte EUR som specen antog; budgetar anges i öre). **Sida:** CaraShell `1381171778405935`. **Pixel:** `28589207184025756` (CaraShell — eldar på carashell.se; ägs av business MagiBorsten och måste vara delad till ad-kontot i Business Manager). **Länk:** https://carashell.se/fi/products/takskyddet?country=FI. Verifierat i webbläsare 2026-09-18: 126,90/165,90 €, fri frakt till Finland, Klarna — men **14 päivän peruuttamisoikeus**, annonserna säger 30. Slutkorten i CO_1, RI_1, SP_4, UG_1 är NEUTRALA (ingen logga) i den här armen. Annonsnamnen är samma som i Bäver-armen så armarna går att jämföra rakt av, och de bär inte prefixet CaraShell_ så nattvakten rör inte testet. **Kampanj:** `CARASHELL_FI_Kattopeite Asuntovaunu | Launch 2026-09-18` → `120251784514940199`, CBO 1100 kr/dag (≈ 100 €) som platshållare, PAUSED.

Historik: armen byggdes först i OPS-kontot MagiBorsten DK (`act_915422744950975`, kampanj `120249155398780172`, PAUSED, 10 adsets/34 annonser) 2026-09-18 12:15. Axel: "Legg bare ut i Magiborsten FI" → samma kampanj byggd om i FI-kontot; DK-kampanjen ligger kvar PAUSED tills Axel säger radera.

⚠️ **Ofullständig:** kampanj + media uppladdade, 0 adsets, 0 annonser. Orsak: pixeln `28589207184025756` är inte delad till kontot — byggskriptet stoppar vid spärr 3. Kör om `bygg-kampanj.mjs` med samma manifest när pixeln är delad; state-filen gör att uppladdningen inte görs om.

## Adsets

| SE | FI | ID |
|---|---|---|
| CO | Notionrunda 2026-09-15 | CARASHELL_FI_Kattopeite - CO | 2026-09-15 | `—` |
| RI | Notionrunda 2026-09-16 | CARASHELL_FI_Kattopeite - RI | 2026-09-16 | `—` |
| Taköverdrag Husvagn 6,5 × 3 m | SP | 2026-09-09 | CARASHELL_FI_Kattopeite - SP | `—` |
| UG | Notionrunda 2026-09-16 | CARASHELL_FI_Kattopeite - UG | 2026-09-16 | `—` |
| Taköverdrag Husvagn 6,5 × 3 m | GT | 2026-09-09 | CARASHELL_FI_Kattopeite - GT | `—` |
| Taköverdrag Husvagn 6,5 × 3 m | PD | 2026-09-09 | CARASHELL_FI_Kattopeite - PD | `—` |
| BOF | Notionrunda 2026-09-15 | CARASHELL_FI_Kattopeite - BOF | 2026-09-15 | `—` |
| Taköverdrag Husvagn 6,5 × 3 m | CS | 2026-09-09 | CARASHELL_FI_Kattopeite - CS | `—` |
| LI | Notionrunda 2026-09-15 | CARASHELL_FI_Kattopeite - LI | 2026-09-15 | `—` |
| TR | Notionrunda 2026-09-15 | CARASHELL_FI_Kattopeite - TR | 2026-09-15 | `—` |

## Annonser

| SE-namn | FI-namn | FI-ad-ID | Status |
|---|---|---|---|
| Takoverdrag_CO_1_H1 | FI_Takoverdrag_CO_1_H1 | `—` | ej uppladdad |
| Takoverdrag_RI_1_H1 | FI_Takoverdrag_RI_1_H1 | `—` | ej uppladdad |
| Takoverdrag_SP_4_H1 | FI_Takoverdrag_SP_4_H1 | `—` | ej uppladdad |
| Takoverdrag_UG_1_H1 | FI_Takoverdrag_UG_1_H1 | `—` | ej uppladdad |
| Takoverdrag_GT_4_H1 | FI_Takoverdrag_GT_4_H1 | `—` | ej uppladdad |
| Takoverdrag_PD_4_H1 | FI_Takoverdrag_PD_4_H1 | `—` | ej uppladdad |
| Takoverdrag_GT_5_H1 | FI_Takoverdrag_GT_5_H1 | `—` | ej uppladdad |
| Takoverdrag_BOF_2_1 | FI_Takoverdrag_BOF_2_1 | `—` | ej uppladdad |
| Takoverdrag_BOF_1_1 | FI_Takoverdrag_BOF_1_1 | `—` | ej uppladdad |
| Takoverdrag_CO_2_1 | FI_Takoverdrag_CO_2_1 | `—` | ej uppladdad |
| Takoverdrag_BOF_3_1 | FI_Takoverdrag_BOF_3_1 | `—` | ej uppladdad |
| Takoverdrag_CS_4_1 | FI_Takoverdrag_CS_4_1 | `—` | ej uppladdad |
| Takoverdrag_GT_6_1 | FI_Takoverdrag_GT_6_1 | `—` | ej uppladdad |
| Takoverdrag_CS_6_1 | FI_Takoverdrag_CS_6_1 | `—` | ej uppladdad |
| Takoverdrag_PD_5_1 | FI_Takoverdrag_PD_5_1 | `—` | ej uppladdad |
| Takoverdrag_LI_1_1 | FI_Takoverdrag_LI_1_1 | `—` | ej uppladdad |
| Takoverdrag_SP_5_1 | FI_Takoverdrag_SP_5_1 | `—` | ej uppladdad |
| Takoverdrag_TR_1_1 | FI_Takoverdrag_TR_1_1 | `—` | ej uppladdad |
| Takoverdrag_SP_2_1 | FI_Takoverdrag_SP_2_1 | `—` | ej uppladdad |
| Takoverdrag_SP_3_H1 | FI_Takoverdrag_SP_3_H1 | `—` | ej uppladdad |
| Takoverdrag_SP_2_H1 | FI_Takoverdrag_SP_2_H1 | `—` | ej uppladdad |
| Takoverdrag_SP_1_H1 | FI_Takoverdrag_SP_1_H1 | `—` | ej uppladdad |
| Takoverdrag_PD_2_1 | FI_Takoverdrag_PD_2_1 | `—` | ej uppladdad |
| Takoverdrag_PD_3_H1 | FI_Takoverdrag_PD_3_H1 | `—` | ej uppladdad |
| Takoverdrag_PD_2_H1 | FI_Takoverdrag_PD_2_H1 | `—` | ej uppladdad |
| Takoverdrag_PD_1_H1 | FI_Takoverdrag_PD_1_H1 | `—` | ej uppladdad |
| Takoverdrag_GT_2_1 | FI_Takoverdrag_GT_2_1 | `—` | ej uppladdad |
| Takoverdrag_GT_3_H1 | FI_Takoverdrag_GT_3_H1 | `—` | ej uppladdad |
| Takoverdrag_GT_2_H1 | FI_Takoverdrag_GT_2_H1 | `—` | ej uppladdad |
| Takoverdrag_GT_1_H1 | FI_Takoverdrag_GT_1_H1 | `—` | ej uppladdad |
| Takoverdrag_CS_2_1 | FI_Takoverdrag_CS_2_1 | `—` | ej uppladdad |
| Takoverdrag_CS_3_H1 | FI_Takoverdrag_CS_3_H1 | `—` | ej uppladdad |
| Takoverdrag_CS_2_H1 | FI_Takoverdrag_CS_2_H1 | `—` | ej uppladdad |
| Takoverdrag_CS_1_H1 | FI_Takoverdrag_CS_1_H1 | `—` | ej uppladdad |

## Lokaliseringslogg per annons (utöver ren översättning)

Rubrik/text/länkbeskrivning: sonnet-subagent (22 versioner för 34 annonser), granskad med skript (priser 126,90/165,90/39 €, förbjudna ord, "koskaan", recensioner, hastighetslöften) och läst av huvudsessionen. Tre-frågorstestet: `copy/fi-copy-test.md`.

- **Takoverdrag_CO_1_H1** (copyversion `Takoverdrag_CO_1_H1`)
  - copy: pris: 1 129 kr → 126,90 €, jämförpris 1 469 kr → 165,90 € · 'vattnet står aldrig' → 'vesi valuu pois ... ympäriltä' (förbjudet 'aldrig' om produktutfall) · '30 dagars öppet köp' → '30 päivän palautusoikeus', frakt bekräftad gratis till Finland
  - VO-manus: pris: 1129 kronor -> 126,90 euroa · 'vattnet blir aldrig stående' -> 'vesi valuu pois ... ympäriltä' · kortat till 232/252 tecken: 'skyddar den dyraste ytan' struken, upprepningar bort
  - video: VO 22.2 s (rå 19.8 s, 0 pauser kortade), tempo 1, Takoverdrag_CO_1_H1.mp4: 772 frames @ 30 fps, pillret hittat i 639 frames |   11 norska caption-cues; rostkoll ✅
- **Takoverdrag_RI_1_H1** (copyversion `Takoverdrag_RI_1_H1`)
  - copy: pris: 1 129 kr → 126,90 € · rubrik konkretiserad (tiivistemassan pehmenar) — originalet bröt ingen regel, ren kvalitetsöversättning
  - VO-manus: pris: 1129 kronor -> 126,90 euroa · kortat: upprepningen 'en person, bara taket. Täck bara taket' slagen ihop
  - video: VO 27.63 s (rå 26.67 s, 0 pauser kortade), tempo 1, Takoverdrag_RI_1_H1.mp4: 943 frames @ 30 fps, pillret hittat i 916 frames |   14 norska caption-cues; rostkoll ✅
- **Takoverdrag_SP_4_H1** (copyversion `Takoverdrag_SP_4_H1`)
  - copy: pris: 1 129 kr → 126,90 €, jämförpris 1 469 kr → 165,90 € · '5,0 av 5 på 10 recensioner' struken (ingen recension i FI) → ersatt med 'hihnat kaikilla neljällä sivulla' ur fakta.mjs · 'vattnet står aldrig' → 'vesi valuu pois ... ympäriltä'
  - VO-manus: '5,0 av 5 på tio recensioner' struken (ingen recension i FI) -> ersatt med 'hihnat kaikilla neljällä sivulla' ur fakta.mjs · 'vattnet blir aldrig stående' och 'bara taket, aldrig hela vagnen' -> omskrivna utan 'aldrig' · pris: 1129 kronor -> 126,90 euroa
  - video: VO 36 s (rå 36.05 s, 0 pauser kortade), tempo 1, Takoverdrag_SP_4_H1.mp4: 1194 frames @ 30 fps, pillret hittat i 1089 frames |   17 norska caption-cues; rostkoll ✅
- **Takoverdrag_UG_1_H1** (copyversion `Takoverdrag_UG_1_H1`)
  - copy: pris: 1 129 kr → 126,90 € · huvudsessionen 2026-09-18: 'koko katon' → 'koko vaunu' (SE-vinkeln är hela vagnen mot bara taket)
  - VO-manus: pris: 1129 kronor -> 126,90 euroa · kortat till 239/270 tecken: 'och jag gjorde det själv' och 'beställ taköverdraget' som eget utrop struket
  - video: VO 23.77 s (rå 20.35 s, 0 pauser kortade), tempo 1, Takoverdrag_UG_1_H1.mp4: 812 frames @ 30 fps, pillret hittat i 717 frames |   11 norska caption-cues; rostkoll ✅
- **Takoverdrag_GT_4_H1** (copyversion `Takoverdrag_GT_4_H1`)
  - copy: rubrik omskriven: '5,0/5 hos husvagnsägare' (recension, finns ej i FI) → 'Hopeapinnoite ottaa auringon vastaan' (belagt ur copy-fi.json) · '5,0 av 5 i betyg på 10 recensioner – riktiga husvagnsägare' struken → ersatt med hopeapinnoite-fakta · 'vattnet blir aldrig stående' → 'vesi valuu pois ... ympäriltä' · länkbeskrivning '5,0/5 på 10 recensioner' → 'Hopeapinnoitettu 210D-kangas'
  - VO-manus: pris: 1129 kronor -> 126,90 euroa, 'spara 340 kronor' -> 'säästät 39 euroa' · 'vattnet blir aldrig stående' -> 'vesi valuu pois ... ympäriltä' · kortat: 'tar ingen plats i förtältslådan' struken
  - video: VO 26.34 s (rå 28.84 s, 9 pauser kortade), tempo 1, Takoverdrag_GT_4_H1.mp4: 802 frames @ 30 fps, pillret hittat i 802 frames |   12 norska caption-cues; rostkoll ✅
- **Takoverdrag_PD_4_H1** (copyversion `Takoverdrag_PD_4_H1`)
  - copy: pris: 1 129 kr → 126,90 €, jämförpris 1 469 kr → 165,90 €, 'spara 340 kr' → 'säästät 39 €'
  - VO-manus: pris: 1129 kronor -> 126,90 euroa · 'det du aldrig ser' -> 'tarkistat harvimmin' (copy-fi.json-formulering) · kortat kraftigt (395 -> 275 tecken): '30 päivän palautusoikeus' och pressning-jämförelsen strukna för att rymmas inom 284 tecken
  - video: VO 25.12 s (rå 25.16 s, 0 pauser kortade), tempo 1, Takoverdrag_PD_4_H1.mp4: 762 frames @ 30 fps, pillret hittat i 741 frames |   11 norska caption-cues; rostkoll ✅
- **Takoverdrag_GT_5_H1** (copyversion `Takoverdrag_GT_5_H1`)
  - VO-manus: pris: 1129/1469 kronor -> 126,90/165,90 euroa · kortat till 244/259 tecken: '30 päivän palautusoikeus' struken för att rymmas (fri frakt/ilmainen toimitus kvar)
  - video: VO 22.18 s (rå 25.89 s, 10 pauser kortade), tempo 1, Takoverdrag_GT_5_H1.mp4: 695 frames @ 30 fps, pillret hittat i 680 frames |   9 norska caption-cues; rostkoll ✅
- **Takoverdrag_BOF_2_1** (copyversion `Takoverdrag_BOF_2_1`)
  - copy: pris: 1 129/1 469 kr → 126,90/165,90 €, 'spara 340 kr' → 'säästät 39 €' · Klarna kontrollerad och bekräftad i FI-kassan (uppdragets verifierade fakta)
  - bild: pris: 1 129/1 469 kr -> 126,90/165,90 €, 'spara 340 kr' -> 'säästät 39 €' · 'Fri frakt inom Sverige' -> 'Ilmainen toimitus Suomeen' (Sverige struket, sant för FI) · Klarna bekräftad i FI-kassan
- **Takoverdrag_BOF_1_1** (copyversion `Takoverdrag_BOF_1_1`)
  - copy: pris: 1 129/1 469 kr → 126,90/165,90 €, 'spara 340 kr' → 'säästät 39 €'
  - bild: pris: 1 469/1 129 kr -> 165,90/126,90 €, 'spara 340 kr' -> 'säästä 39 €'
- **Takoverdrag_CO_2_1** (copyversion `Takoverdrag_CO_2_1`)
  - bild: pris: 1 129 kr -> 126,90 €
- **Takoverdrag_BOF_3_1** (copyversion `Takoverdrag_BOF_3_1`)
  - copy: pris: 1 129 kr → 126,90 €
  - bild: pris: 1 129/1 469 kr -> 126,90/165,90 €
- **Takoverdrag_CS_4_1** (copyversion `Takoverdrag_CS_4_1`)
  - copy: pris: 1 469/1 129 kr → 165,90/126,90 €, 'spara 340 kr' → 'säästät 39 €'
  - bild: pris: 1 469/1 129 kr -> 165,90/126,90 € · 'stryk_del' (överstruket pris) gäller nu '165,90 €', samma numeriska del som SE · huvudsessionen 2026-09-18: fototext '126,90 € + toimitus' → '126,90 € – toimitus sisältyy' ('+ toimitus' läses som att frakt tillkommer) (motor: OK)
- **Takoverdrag_GT_6_1** (copyversion `Takoverdrag_GT_6_1`)
  - copy: pris: 1 129 kr → 126,90 €
  - bild: pris: 1 129/1 469 kr -> 126,90/165,90 €
- **Takoverdrag_CS_6_1** (copyversion `Takoverdrag_CS_6_1`)
  - copy: pris: 1 129/1 469 kr → 126,90/165,90 €, 'spara 340 kr' → 'säästät 39 €'
  - bild: pris: 1 129/1 469 kr -> 126,90/165,90 €, 'spara 340 kr' -> 'säästä 39 €' · frakt bekräftad gratis till Finland
- **Takoverdrag_PD_5_1** (copyversion `Takoverdrag_PD_5_1`)
  - copy: 'vattnet blir aldrig stående' → 'vesi valuu pois sen ympäriltä'
  - bild: pris: 1 129/1 469 kr -> 126,90/165,90 €
- **Takoverdrag_LI_1_1** (copyversion `Takoverdrag_LI_1_1`)
  - copy: rubrik 'Vattnet står aldrig vid takluckan' → 'Vesi valuu pois takaluukulta' (förbjudet 'aldrig' i rubriken, uttryckligen nämnt i uppdraget) · 'vattnet blir aldrig stående' i brödtext → 'vesi valuu pois ... sen sijaan että jäisi seisomaan'
  - bild: rubrik 'Vattnet blir aldrig stående' -> 'Vesi valuu pois ... ympäriltä' (förbjudet 'aldrig' om utfall) · pris: 1 129/1 469 kr -> 126,90/165,90 €
- **Takoverdrag_SP_5_1** (copyversion `Takoverdrag_SP_5_1`)
  - copy: rubrik 'Kaksi ylimääräistä hihnaa mukana' ersätter '5,0 av 5 på 10 recensioner' (ingen recension i FI) — belagt ur fakta.mjs (två 10,5 m-hihnaa ingår) · 'på baverbutiken.se' struket helt · 'vattnet blir aldrig stående' → 'vesi ei jää seisomaan'
  - bild: rubrik '5,0 av 5 – 10 recensioner' struken (ingen recension i FI, stjärnorna är grafik och tas bort) -> 'Hihnat neljällä sivulla' (belagt ur fakta.mjs, samma teckenbudget) · 'vattnet blir aldrig stående' -> 'vesi valuu pois ... ympäriltä' · pris: 1 129 kr -> 126,90 €, 'spara 340 kr' -> 'säästä 39 €'
- **Takoverdrag_TR_1_1** (copyversion `Takoverdrag_TR_1_1`)
  - copy: rubrik '5,0 av 5 – och 340 kr billigare' (recension) → '126,90 € – ja vain katto' (belagt pris + positionering) · '5,0 av 5 på 10 recensioner på baverbutiken.se' struken helt · pris: 1 129/1 469 kr → 126,90/165,90 €, 'spara 340 kr' → 'säästät 39 €'
  - bild: rubrik '5,0 av 5 på 10 recensioner' struken (ingen recension i FI) -> '210D-kangas, ei ohut pressu' (belagt, samma teckenbudget) · pris: 1 129/1 469 kr -> 126,90/165,90 €, 'spara 340 kr' -> 'säästä 39 €'
- **Takoverdrag_SP_2_1** (copyversion `SP_social`)
  - copy: påhittat kundcitat '"Ångrar att jag inte köpte det här förra vintern"' struket (finns inte i FI) → ersatt med hihnat-fakta ur copy-fi.json · 'Så säger fler och fler husvagnsägare' (social proof) struken → generisk uppmaning utan sifferpåstående · länkbeskrivning 'Betygsatt av riktiga kunder' struken (ingen recension i FI) → 'Ilmainen toimitus Suomeen' · frakt bekräftad gratis till Finland
  - bild: påhittat kundcitat + fabricerad attribution ('Verifierad kund, 58 år') struket helt (ingen recension i FI) -> ersatt med tre belagda påståenden utan citattecken och utan 'kund', enligt uppdragets varning · hastighetslöfte 'fem minuter, helt själv' struket
- **Takoverdrag_SP_3_H1** (copyversion `SP_social`)
  - copy: påhittat kundcitat '"Ångrar att jag inte köpte det här förra vintern"' struket (finns inte i FI) → ersatt med hihnat-fakta ur copy-fi.json · 'Så säger fler och fler husvagnsägare' (social proof) struken → generisk uppmaning utan sifferpåstående · länkbeskrivning 'Betygsatt av riktiga kunder' struken (ingen recension i FI) → 'Ilmainen toimitus Suomeen' · frakt bekräftad gratis till Finland
  - VO-manus: FÖRLÄNGT från v1 (217->283 tecken) enligt koordinatorns nya målspann 260-290 · SE:s unika hook 'grannen frågade var jag hittat den här' behållen som scensättande fråga (ingen betygs- eller rekommendationsclaim, alltså ingen recension att stryka) · fortsatt inget hastighetslöfte, inget 'koskaan' · v2 2026-09-18: förlängt manus — v1 blev för kort för videon (tomma pillerrutor i slutet)
  - video: VO 22.73 s (rå 22.91 s, 7 pauser kortade), tempo 1, Takoverdrag_SP_3_H1.mp4: 687 frames @ 30 fps, pillret hittat i 682 frames |   13 norska caption-cues; rostkoll ✅
- **Takoverdrag_SP_2_H1** (copyversion `SP_social`)
  - copy: påhittat kundcitat '"Ångrar att jag inte köpte det här förra vintern"' struket (finns inte i FI) → ersatt med hihnat-fakta ur copy-fi.json · 'Så säger fler och fler husvagnsägare' (social proof) struken → generisk uppmaning utan sifferpåstående · länkbeskrivning 'Betygsatt av riktiga kunder' struken (ingen recension i FI) → 'Ilmainen toimitus Suomeen' · frakt bekräftad gratis till Finland
  - VO-manus: FÖRLÄNGT från v1 (229->301 tecken) enligt koordinatorns nya målspann 280-310 · SE:s unika hook 'fick mig att sova gott' med, resten som SP_1 · fortsatt inget påhittat kundcitat, ingen hastighetsangivelse · v2 2026-09-18: förlängt manus — v1 blev för kort för videon (tomma pillerrutor i slutet)
  - video: VO 24.56 s (rå 26.67 s, 9 pauser kortade), tempo 1, Takoverdrag_SP_2_H1.mp4: 742 frames @ 30 fps, pillret hittat i 737 frames |   14 norska caption-cues; rostkoll ✅
- **Takoverdrag_SP_1_H1** (copyversion `SP_social`)
  - copy: påhittat kundcitat '"Ångrar att jag inte köpte det här förra vintern"' struket (finns inte i FI) → ersatt med hihnat-fakta ur copy-fi.json · 'Så säger fler och fler husvagnsägare' (social proof) struken → generisk uppmaning utan sifferpåstående · länkbeskrivning 'Betygsatt av riktiga kunder' struken (ingen recension i FI) → 'Ilmainen toimitus Suomeen' · frakt bekräftad gratis till Finland
  - VO-manus: FÖRLÄNGT från v1 (217->266 tecken) enligt koordinatorns nya målspann 270-300 · täcker mer av SE-innehållet: problem (fläckar/mossa), montering, skydd hela vintern, pris, frakt, öppet köp · fortsatt inget påhittat kundcitat, ingen hastighetsangivelse, inget 'koskaan' · v2 2026-09-18: förlängt manus — v1 blev för kort för videon (tomma pillerrutor i slutet)
  - video: VO 23.18 s (rå 24.84 s, 7 pauser kortade), tempo 1, Takoverdrag_SP_1_H1.mp4: 701 frames @ 30 fps, pillret hittat i 701 frames |   13 norska caption-cues; rostkoll ✅
- **Takoverdrag_PD_2_1** (copyversion `PD_skyddat`)
  - copy: rubrik 'helt skyddat' → 'suojattuna' (ordet 'helt' struket, absolut utfall förbjudet) · 'Spänns fast ... klart på minuter' (hastighetslöfte) struket → 'Kiinnitetään hihnalla ja koukulla reunassa' · 'en person klarar det helt själv' → 'yksi henkilö asentaa sen itse' ('helt' struket) · 'taket ... du aldrig kollar' → 'pinta, jota tarkistat harvimmin' (samma formulering som copy-fi.json, 'aldrig'/'koskaan' undviks)
  - bild: hastighetslöfte '5 minuter' struket, skriven om till tre versalrader enligt uppdragets varning (max 20 tecken/rad)
- **Takoverdrag_PD_3_H1** (copyversion `PD_skyddat`)
  - copy: rubrik 'helt skyddat' → 'suojattuna' (ordet 'helt' struket, absolut utfall förbjudet) · 'Spänns fast ... klart på minuter' (hastighetslöfte) struket → 'Kiinnitetään hihnalla ja koukulla reunassa' · 'en person klarar det helt själv' → 'yksi henkilö asentaa sen itse' ('helt' struket) · 'taket ... du aldrig kollar' → 'pinta, jota tarkistat harvimmin' (samma formulering som copy-fi.json, 'aldrig'/'koskaan' undviks)
  - VO-manus: hastighetslöfte 'på under en minut' struket ur rubrikmeningen -> 'Näin suojaat asuntovaunun katon itse' · kortat (628 -> 394 tecken), samma struken text som PD_1/PD_2
  - video: VO 37.58 s (rå 33.57 s, 0 pauser kortade), tempo 1, Takoverdrag_PD_3_H1.mp4: 1137 frames @ 30 fps, pillret hittat i 1117 frames |   17 norska caption-cues; rostkoll ✅
- **Takoverdrag_PD_2_H1** (copyversion `PD_skyddat`)
  - copy: rubrik 'helt skyddat' → 'suojattuna' (ordet 'helt' struket, absolut utfall förbjudet) · 'Spänns fast ... klart på minuter' (hastighetslöfte) struket → 'Kiinnitetään hihnalla ja koukulla reunassa' · 'en person klarar det helt själv' → 'yksi henkilö asentaa sen itse' ('helt' struket) · 'taket ... du aldrig kollar' → 'pinta, jota tarkistat harvimmin' (samma formulering som copy-fi.json, 'aldrig'/'koskaan' undviks)
  - VO-manus: samma kortning och 'koskaan'-undvikande som PD_1_H1 (622 -> 413 tecken)
  - video: VO 37.41 s (rå 33.8 s, 0 pauser kortade), tempo 1, Takoverdrag_PD_2_H1.mp4: 1128 frames @ 30 fps, pillret hittat i 1097 frames |   17 norska caption-cues; rostkoll ✅
- **Takoverdrag_PD_1_H1** (copyversion `PD_skyddat`)
  - copy: rubrik 'helt skyddat' → 'suojattuna' (ordet 'helt' struket, absolut utfall förbjudet) · 'Spänns fast ... klart på minuter' (hastighetslöfte) struket → 'Kiinnitetään hihnalla ja koukulla reunassa' · 'en person klarar det helt själv' → 'yksi henkilö asentaa sen itse' ('helt' struket) · 'taket ... du aldrig kollar' → 'pinta, jota tarkistat harvimmin' (samma formulering som copy-fi.json, 'aldrig'/'koskaan' undviks)
  - VO-manus: 'ingen någonsin kollar' -> 'pinta, jota tarkistat harvimmin' (samma formulering som copy-fi.json, undviker 'koskaan') · kortat (631 -> 411 tecken): 'ingen tung presenning att dra över själv i blåsten' och 'ingen behöver hålla i andra änden' strukna
  - video: VO 37.44 s (rå 34.04 s, 0 pauser kortade), tempo 1, Takoverdrag_PD_1_H1.mp4: 1132 frames @ 30 fps, pillret hittat i 1109 frames |   17 norska caption-cues; rostkoll ✅
- **Takoverdrag_GT_2_1** (copyversion `GT_present`)
  - copy: frakt bekräftad gratis till Finland (i övrigt ren översättning, inga pris- eller recensionsrader i original)
  - bild: ren översättning inom teckenbudgeten (varning: max 22 tecken/rad på fototext-rubriken)
- **Takoverdrag_GT_3_H1** (copyversion `GT_present`)
  - copy: frakt bekräftad gratis till Finland (i övrigt ren översättning, inga pris- eller recensionsrader i original)
  - VO-manus: kortat (508 -> 306 tecken): samma mönster som GT_2/GT_1
  - video: VO 27 s (rå 22.83 s, 0 pauser kortade), tempo 1, Takoverdrag_GT_3_H1.mp4: 854 frames @ 30 fps, pillret hittat i 847 frames |   12 norska caption-cues; rostkoll ✅
- **Takoverdrag_GT_2_H1** (copyversion `GT_present`)
  - copy: frakt bekräftad gratis till Finland (i övrigt ren översättning, inga pris- eller recensionsrader i original)
  - VO-manus: kortat (517 -> 301 tecken): 'Jag har löst det' struken, dubblerad känslobeskrivning kortad
  - video: VO 27 s (rå 22.83 s, 0 pauser kortade), tempo 1, Takoverdrag_GT_2_H1.mp4: 832 frames @ 30 fps, pillret hittat i 802 frames |   12 norska caption-cues; rostkoll ✅
- **Takoverdrag_GT_1_H1** (copyversion `GT_present`)
  - copy: frakt bekräftad gratis till Finland (i övrigt ren översättning, inga pris- eller recensionsrader i original)
  - VO-manus: FÖRLÄNGT från v1 (316->362 tecken) enligt koordinatorns nya målspann 340-370 · mer av SE-innehållet med tillbaka: 'älskar husvagnen mer än jag vill erkänna', 'aidosti iloinen' etc. · fortsatt inget 'koskaan', ingen hastighetsangivelse · v2 2026-09-18: förlängt manus — v1 blev för kort för videon (tomma pillerrutor i slutet)
  - video: VO 29.27 s (rå 25.16 s, 0 pauser kortade), tempo 1, Takoverdrag_GT_1_H1.mp4: 887 frames @ 30 fps, pillret hittat i 858 frames |   14 norska caption-cues; rostkoll ✅
- **Takoverdrag_CS_2_1** (copyversion `CS_rabatt`)
  - copy: pris: 1469 kr → 1129 kr → 165,90 € → 126,90 € · 'Fri frakt inom Sverige' → 'Ilmainen toimitus Suomeen' (Sverige-referens struken) · rubrik omskriven från 'Husvagnstaket – helt skyddat i vinter' (delad rubrik med PD-gruppen i SE, 'helt' är ett förbjudet absolut utfall) till prisfokuserad rubrik
  - bild: pris: 1469/1129 kr -> 165,90/126,90 € (exakt formulering enligt uppdragets varning — 2 tecken över den mekaniska budgeten men given ordagrant i källan, prisraden får extra utrymme/fetstil enligt varningen) · 23% behållen (stämmer: 39/165,90=23,5%)
- **Takoverdrag_CS_3_H1** (copyversion `CS_rabatt`)
  - copy: pris: 1469 kr → 1129 kr → 165,90 € → 126,90 € · 'Fri frakt inom Sverige' → 'Ilmainen toimitus Suomeen' (Sverige-referens struken) · rubrik omskriven från 'Husvagnstaket – helt skyddat i vinter' (delad rubrik med PD-gruppen i SE, 'helt' är ett förbjudet absolut utfall) till prisfokuserad rubrik
  - VO-manus: pris: 1469/1129 kronor -> 165,90/126,90 euroa · kraftigt kortat (481 SE-tecken text -> 241 FI): upprepad prisrad i öppningen slagen ihop till en mening
  - video: VO 28.89 s (rå 27.48 s, 0 pauser kortade), tempo 1, Takoverdrag_CS_3_H1.mp4: 875 frames @ 30 fps, pillret hittat i 788 frames |   15 norska caption-cues; rostkoll ✅
- **Takoverdrag_CS_2_H1** (copyversion `CS_rabatt`)
  - copy: pris: 1469 kr → 1129 kr → 165,90 € → 126,90 € · 'Fri frakt inom Sverige' → 'Ilmainen toimitus Suomeen' (Sverige-referens struken) · rubrik omskriven från 'Husvagnstaket – helt skyddat i vinter' (delad rubrik med PD-gruppen i SE, 'helt' är ett förbjudet absolut utfall) till prisfokuserad rubrik
  - VO-manus: pris: 1469/1129 kronor -> 165,90/126,90 euroa, 23 % behållen (stämmer: 39/165,90=23,5%) · kortat till 284/295 tecken
  - video: VO 26.68 s (rå 31.16 s, 9 pauser kortade), tempo 1.019, Takoverdrag_CS_2_H1.mp4: 790 frames @ 30 fps, pillret hittat i 721 frames |   14 norska caption-cues; rostkoll ✅
- **Takoverdrag_CS_1_H1** (copyversion `CS_rabatt`)
  - copy: pris: 1469 kr → 1129 kr → 165,90 € → 126,90 € · 'Fri frakt inom Sverige' → 'Ilmainen toimitus Suomeen' (Sverige-referens struken) · rubrik omskriven från 'Husvagnstaket – helt skyddat i vinter' (delad rubrik med PD-gruppen i SE, 'helt' är ett förbjudet absolut utfall) till prisfokuserad rubrik
  - VO-manus: pris: 1469/1129 kronor -> 165,90/126,90 euroa, 'över 300 kronor rabatt' -> 'säästät 39 euroa' · kortat: upprepad intro ('just nu, tak över dag...') förenklad
  - video: VO 28.27 s (rå 32.84 s, 9 pauser kortade), tempo 1.008, Takoverdrag_CS_1_H1.mp4: 850 frames @ 30 fps, pillret hittat i 798 frames |   15 norska caption-cues; rostkoll ✅

## Gemensamt för alla videor

- Röst: ElevenLabs **Martti – Calm & relaxed** (`paqSK057kuKFy1kq3bdZ`), modell `eleven_v3`, stability 0,5 — samma i alla 19. Vald 2026-09-18 bland kontots två finska röster (Henry Aflecht ~12 % långsammare). Sessionen kan inte lyssna; rösten är mätt (längd, tystnad, nivå), inte hörd — **lyssna på minst tre klipp innan aktivering.**
- Ljudspåret är BYTT: bara finsk VO (loudnorm −16 LUFS). Källorna hade en tyst musik-/rumsbädd (~20 dB under talet, mono — går inte att separera med ffmpeg), den är borta i FI-versionerna. Vill Axel ha musikbädd: redigerarna lägger på en.
- Finskan var för lång för videorna även efter kortning: eleven_v3 lägger 0,5–1,0 s tystnad efter varje mening, så pauser > 0,30 s kortas till 0,25 s (`fi-video.mjs`), därefter tempo ≤ 1,10 vid behov.
- Captions: de svenska ordcaption-pillren målas vita per frame och den finska texten läggs där (`pipeline/no-precis.py`, samma teknik som NO 2026-09-16). Prisgrafik, "FRI FRAKT", "210D-VÄV" och slutkorten (CO_1, RI_1, SP_4, UG_1) suddas och ersätts med finska PNG-lager (`lager-fi.py`); slutkortets "★★★★★ 10 recensioner" blev "HIHNAT NELJÄLLÄ SIVULLA" och Bäverbutiken-märket blev MAJAVAKAUPPA. CS_1/2/3 har en 0,17 s blixtframe "RV ROOF COVER / 5-STAR REVIEW!" — suddad. SP_4:s stjärnanimation (29–34 s) suddad utan ersättning.

## Kvoten

`pipeline/quota.mjs` gäller inte — taköverdraget finns inte i `products/products.json` (Temu-produkt, ingen creative hub). Ingen loggning gjord.
