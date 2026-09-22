# NO-videobatch 2026-09-21 — rutinen `/translate-no`

## Fas 0 — Inventering

Repot hade en trasig lokal `main` vid sessionsstart (ingen gemensam historik
med origin — en kvarglömd container). Synkad mot origin/main innan något
annat gjordes.

LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) listad: **Axel har gjort en stor
omstädning i Drive sedan förra körningen** — flera tidigare launchade
produkter (Infartslarm, Solcellslarm, Stegstöd, Lövblåsare, Vedklyvborr,
Sittkäpp, Dinosauriekalender m.fl.) har flyttats direkt in i LOSERS (floppade
i Sverige — påverkar inte att de redan är launchade i Norge, bara var
källmappen råkar ligga). Kvar direkt i LAUNCHED: 6 produktmappar.

MAKE TO NORWAY listad rekursivt (inkl. WINNERS-undermappen). Kampanjlistan i
`act_1050941584152547` läst (47 kampanjer, oavsett status).

| Produktmapp | NO-mapp | Kampanj i NO-kontot | Dom |
|---|---|---|---|
| 10 Fågelmatare med kamera | ✅ | ✅ | behandlad |
| 10 Snöskyffel utan batteri | ❌ | ❌ | **blockerad, oförändrat** — finns fortfarande inte på beverbutikken.no (202 produkter genomsökta). Ingen ny problemrapport (samma orsak flaggad tidigare). |
| 8 Solcellslampa 210 LED Sensor | ✅ | ✅ | behandlad |
| **8 Sotarset Böjliga Stänger** | ❌ | ❌ | **NY kandidat, körd** — norsk sida finns ("Feiesett Med Fleksible Stenger – Renser Pipe Og Røykrør"), batch-sheet #8 har fullständig NORWAY-kostnad |
| Biltvättborste Teleskop | ❌ | ❌ | **blockerad, oförändrat** — finns inte på beverbutikken.no (sökt på "bilvask"/"vaskebørste"/"teleskop", ingen träff). Ingen ny problemrapport (samma orsak flaggad tidigare). |
| Fodrade Inomhustofflor | ✅ | ✅ | behandlad |

**Enda körbara kandidaten: Sotarset Böjliga Stänger → Feiesett.** De två
strukturellt blockerade (Snöskyffel, Biltvättborste) är samma orsaker som
tidigare körningar flaggat — ingen ny problemrapport skickad.

## Kvot

HeyGen-kvot vid start: 2 369 api-krediter. Efter proofread + rendering av
12 videor: 1 983 (386 förbrukade).

## Fas 1 — Proofread + lokalisering

12 videor (CS/G/PD/SP × H1–H3), alla proofreads klara utan fel.

**Sonnet-subagent, SRT-korrigering:** HeyGens grova norska översättning hade
bara ordbytt de SVENSKA priserna (599/459 kr → "599/459 kroner") i stället
för att sätta det verkliga norska butikspriset — rättat till **509/389
kroner** (verifierat på beverbutikken.no) i CS_1_H1/H2/H3. Produktterm
inkonsekvent genom batchen: PD- och SP-filerna sa "feiersett" (felstavning,
extra r), CS/G sa rätt "feiesett" (butikens riktiga produktnamn) — normaliserat
till "feiesett" i alla 12 filer. "Fri frakt over 300 kroner" och "Betal med
Klarna" var redan verifierat korrekta villkor från tidigare batcher, rörda ej.

Alla 12 SRT-korrigeringar applicerade i HeyGen och verifierade — 0 mismatch.

**Tre-frågorstestet på prisraderna:** 389/509 kr är visualiserbart (exakt
belopp), sant (avläst live från beverbutikken.no, inte kursomräknat från
svenska), och unikt för produkten (Feiesettets faktiska pris).

## Fas 2 — Rendering + captions

12/12 renderade. `pipeline/no-captions.py` i Beltesliper-stilen:

- **10/12 grönt på första försöket** (standardmätning fångade källtexten,
  band 1233:1399 resp. 1245:1411).
- **CS_1_H2 och CS_1_H3 misslyckades vid första försöket** — svensk text
  ("Just nu 459 kronor." / "459 kroner.") låg kvar OVANFÖR den norska rutan,
  exakt motexemplet i skriptets egen dokumentation
  (`Overvåkingskamera_NO_CS_1`). Rotorsak: källtexten sitter på y≈1248–1340,
  precis vid ZON-gränsens nedre kant (1250) — bandmätningen filtrerade bort
  den och föll tillbaka på ett standardband som inte täckte texten.
  Kartlagt genom att skanna källvideon i 2 fps och hitta den vita textrutans
  exakta pixelposition (stabil genom hela klippet, 1248–1340 i båda). Kördes
  om med `--band=1230:1360`, grönt vid andra försöket — verifierat både av
  skriptets automatiska kontroll OCH manuell genomgång av alla 6 QA-bilder.

Samtliga 36 QA-bilder (10/50/90 % × 12 videor) genomgångna manuellt — utöver
den automatiska kontrollen, eftersom CS_1_H2/H3-incidenten visade att
standardmätningen kan missa. Slutkortssvep (sista sekunden × alla 12,
kontaktkarta) genomfört: inga svenska domäner, inga fel priser.

## Röstkollen (Axels regel 2026-09-08)

`pipeline/rostkoll.py` kört på alla 12 mot sina svenska källor: **12/12
grönt** — inga tysta spår, ingen längddrift, inget avhugget slut. Samtliga
hade en ofarlig anmärkning om exakt utfasningstid (< 0,15 s mot källan),
inget mätbart fel. ⚠️ Grönt betyder "inga mätbara fel" — miljön saknar
ljuduppspelning, så ingen bokstavlig avlyssning gjordes denna körning.

## Fas 3 — Launch i Magiborsten NO

**Feiesett NO | BE-ROAS 1,62 | 2026-09-21** (`120252321093160233`), ACTIVE,
CBO 1000 kr/dag, dubblettspärr kontrollerad (ingen befintlig kampanj för
"Sotarset"/"Feiesett" i kontot).

4 adsets, alla ACTIVE, 12 videoannonser (inga bildannonser i källmappen —
bara referensklipp i Assets-mappen, inga `*_2_1`-PNG:er):

- **Feiesett NO - PD** (`120252321093480233`) — 3 annonser
- **Feiesett NO - SP** (`120252321096360233`) — 3 annonser
- **Feiesett NO - CS** (`120252321102250233`) — 3 annonser
- **Feiesett NO - G** (`120252321177340233`) — 3 annonser

Alla verifierade ACTIVE i realtid av launch-skriptets egen kvittenslogg.
API-dubbelkoll på adset-nivå gick inte att göra direkt efteråt — kontot
hårt rate-limitat (fel 17) i flera minuter efter launchen, samma mönster
som tidigare körningar. Skriptet självt backade av och väntade (15→90 s)
genom två sådana perioder och slutförde ändå alla 12 annonser.

**BE-ROAS:** 389/(389 − 13,72 EUR × 10,8046 NOK/EUR) = 1,62. Batch-sheet #8,
NORWAY-blocket (produkt 4,55 € + frakt 9,17 € = 13,72 €). Dagskurs EUR→NOK
10,804623 (`open.er-api.com`, avläst vid körstart).

## Fas 3.2 — Bildannonser

Ingen — källmappen har bara 12 videoannonser + 4 adcopy-docs + en
Assets-mapp med 8 icke-relaterade referensklipp (`snaptik_*.mp4`), inga
`*_<vinkel>_2_1`-bildannonser att översätta.

## Drive-leverans

Ny mapp skapad av rutinen själv (Drive-connectorn) i MAKE TO NORWAY:
**NO Sotarset** (`1RRk3cCdiNpFqMRJO0N_QfjArGqH7ItWK`). 12 videor + 4
adcopy-txt uppladdade via `drive-push.mjs` (Apps Script-brevlådan), 16/16
filer, 0 fel.

## Leverans i chatten

12 videor i 8 zip-filer (≤30 MiB, `zip -0`), skickade med SendUserFile.

## Definition of done

- [x] LAUNCHED listad; WINNERS, LOSERS och MAKE TO NORWAY exkluderade;
      kandidater = utan NO-mapp OCH utan kampanj; max 3 körda (1 av 1
      körbara — de två andra strukturellt blockerade sedan tidigare)
- [x] Alla annonsvideor i produktmappen inventerade (12 st, inga
      bildannonser i källan)
- [x] Norsk produktsida + NOK-pris verifierade
- [x] Inga nya problemrapporter (de två blockerade produkterna hade redan
      fått sina rapporter i tidigare körningar)
- [x] Norge-COGS läst ur NORWAY-blocket, batch-sheet #8, utan tull
- [x] Kvot räckte (2 369 → 1 983), rapporterad
- [x] Proofread FÖRE rendering; alla SRT-rättelser redovisade
- [x] Copy/SRT-rader skrivna av sonnet-subagent, tre-frågorstestet redovisat
- [x] Inbränd svensk text skannad; captions diskret över befintligt band,
      max 2 rader — 2 videor krävde omkörning med explicit band, verifierat
      grönt
- [x] Röstkollen: 12/12 grönt (ingen bokstavlig avlyssning — miljöbegränsning)
- [x] Slutkortssvep gjort (kontaktkarta, alla 12)
- [x] Levererat i chatten som 8 zip-filer
- [x] Kampanj i act_1050941584152547: CBO 1000 kr/dag, adset per koncept,
      status ACTIVE, BE-ROAS + datum i namnet, dubblettspärren körd
- [x] Drive-leverans: NO Sotarset-mappen byggd och fylld
- [x] Körloggen uppdaterad, allt committat och pushat
- [x] Discord-brief skickad i `#translation-till-norge-av-nya-produkter`,
      i Axels läsformat, med ping
