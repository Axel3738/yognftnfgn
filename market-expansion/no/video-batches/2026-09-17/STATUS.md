# NO-videobatch 2026-09-17 — rutinen `/translate-no`

⚠️ Den här filen ersätter den tomma STATUS som skrevs 04:19 (commit `1895667c`).
Då fanns 7 produktmappar i LAUNCHED och noll körbara kandidater. Vid omkörningen
senare samma morgon hade **tre nya produktmappar** lagts till i LAUNCHED — därför
blev natten inte tom.

## Fas 0 — Inventering

LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) listad: 10 produktmappar.
WINNERS, LOSERS och MAKE TO NORWAY exkluderade som mappar, inte kandidater.
MAKE TO NORWAY listad rekursivt inkl. undermappen WINNERS (34 + 3 NO-mappar).
Kampanjlistan i `act_1050941584152547` läst (42 kampanjer, oavsett status).

| Produktmapp | NO-mapp | Kampanj i NO-kontot | Dom |
|---|---|---|---|
| 5.1 Lövblåsare | ✅ | — | behandlad |
| 7 Infartslarm Trådlöst | ✅ | ✅ | behandlad |
| 7 Solcellslarm 2-pack | ✅ | ✅ | behandlad |
| 7 Stegstöd 2-pack | ✅ | ✅ | behandlad |
| 7 Termoskydd Husbil | ✅ | ✅ | behandlad |
| Staketstolpslagare | ✅ | ✅ | behandlad |
| 7 Sittkäpp Hopfällbar | ❌ | ❌ | **blockerad sedan 2026-09-16** — ingen Norge-frakt i batch-sheet #7, leverantören skriver "too large to deliver at all". Strukturellt, inte ett tomt fält. Ingen ny problemrapport (samma orsak som gårdagens, redan flaggad). |
| **10 Fågelmatare med kamera** | ❌ | ❌ | **KANDIDAT — körd** |
| **8 Solcellslampa 210 LED Sensor** | ❌ | ❌ | **KANDIDAT — körd** |
| **K Dinosauriekalender** | ❌ | ❌ | **HOPPAD** — saknas på beverbutikken.no. Problemrapport skickad till `#problems-no`. |

Tre kandidater i bokstavsordning: Dinosauriekalender (hoppad), Fågelmatare,
Solcellslampa. Ingen kö till nästa natt utöver Sittkäpp + Dinosauriekalender.

### Priser, COGS och BE-ROAS (verifierat mot beverbutikken.no + batch-sheeten)

| Produkt | Pris | Jämförpris | Norge-COGS | BE-ROAS |
|---|---|---|---|---|
| Fuglemater Med Kamera Og Solcellepanel | 1 919 kr | 2 499 kr | 68,73 EUR → 742,18 kr (batch-sheet #10, NORWAY Qty 1, ingen tull) | **1,63** |
| Solcellelampe Med Bevegelsessensor, 210 LED | 559 kr | 729 kr | 19,78 EUR → 213,59 kr (batch-sheet #8, NORWAY Qty 1, ingen tull) | **1,62** |

Dagskurs EUR→NOK 10,798486 (open.er-api.com, 2026-09-17 00:02 UTC).
Claims kontrollerade mot produktsidorna: "30 dagers åpent kjøp" ✅ står i garantin,
"FRI FRAKT På ordre over 300 kr" ✅ (båda produkterna ligger över).
Rabattprocenten i CS-copyn matchar butikens egna jämförpriser (23 %) — **ingen
prisjustering behövdes**.

## Fas 1 — Proofread + lokalisering

22 videor proofread (12 Fågelmatare, 10 Solcellslampa). Solcellslampa fick köras
om: två parallella `proofread`-processer skriver till samma `batch.json.state.json`
och den sista skrev över den förstas poster. **Lärdom: kör aldrig två
`translate-batch`-processer mot samma manifest samtidigt.**

**Rättelser i SRT:erna** (skrivna av sonnet-subagent enligt modellpolicyn — HeyGen
översatte det svenska ljudet rakt av, så de svenska priserna stod kvar med norska
ord):

| Fil | Fel | Rättat till |
|---|---|---|
| fagelmatare_CS_1/2/3 | "to tusen ett hundre og femti-ni" (2159) | "to tusen fire hundre og nittini" (2499) |
| fagelmatare_CS_1/2/3 | "ett tusen seks hundre og femti-ni" (1659) | "ett tusen ni hundre og nitten" (1919) |
| fagelmatare_CS_1/2/3 | "fem hundre kroner i rabatt" (500) | "fem hundre og åtti kroner" (580) |
| fagelmatare_SP_2 | "Tusenvis av **svenske** hager" | "Tusenvis av **norske** hager" |
| solcellslampa_CS_2 | "761 kroner" / "581 kroner" | "syv hundre og tjueni" (729) / "fem hundre og femtini" (559) |
| solcellslampa_CS_3 | "sju hundre og sekstini" (769) / "fem hundre og åttini" (589) | samma som ovan |

Övriga 14 filer: inga sakfel, orörda. Alla 22 verifierade och uppladdade till
HeyGen (`apply` → "SRT verifierad" på samtliga).

## Fas 2 — Rendering + captions

22 renderingar, alla nedladdade (inget fastnade i moderering).
**Kvot: 5 737 → 4 728 api-krediter** (1 009 förbrukade, inkl. omkörningen av
solcellslampas proofread).

Alla 22 källvideor bär **inbränd svensk text** (UGC-captions synkade mot talet),
så captions var obligatoriskt. Brända med `pipeline/no-captions.py` i
Beltesliper-stilen. **Två videor underkändes av skriptets egen kontroll (exit 3)**
och kördes om med `--band=1180:1500`:

- `solcellslampa_PD_1` — automätningen hittade inget band i den mörka nattscenen
  och föll tillbaka på standardbandet 1361:1527, som satt för lågt: svensk text
  ("Ljus över 270 grader.") syntes ovanför bandet med den norska i egen ruta under.
- `solcellslampa_SP_1` — bandet mättes till 1264:1476, men den svenska textens
  överkant stack upp ovanför.

Båda rena efter omkörning. **Samtliga QA-bilder lästa** — ingen svensk bokstav kvar
i någon av dem. Slutkortssvep gjort på alla 22 (montage i `endcard-check/`):
inga svenska domäner eller priser i slutkorten.

## Fas 3 — Launch i Magiborsten NO (`act_1050941584152547`)

Dubblettspärren körd: ingen av produkterna hade kampanj i kontot sedan tidigare.

**Fågelmatare NO | BE-ROAS 1,63 | 2026-09-17** (`120252268516440233`)
CBO 1 000 kr/dag, LOWEST_COST_WITHOUT_CAP, ACTIVE. 4 adsets (CS/GT/PD/SP),
12 annonser, alla ACTIVE, enhancements OPT_OUT. Meta rate-limitade (fel 17) mitt
i körningen — skriptets backoff löste det.

**Solcellslampa NO | BE-ROAS 1,62 | 2026-09-17**
CBO 1 000 kr/dag, ACTIVE. 4 adsets (CS/G/PD/SP), 10 annonser.
Källmappen saknar CS_1 och G_2 — de koncepten har två hooks i stället för tre.

## Fas 3.2 — Bildannonserna

8 bildannonser (4 per produkt). Svensk text rensad med kie.ai
(`google/nano-banana-edit`), norsk text ritad deterministiskt med PIL i
`compose-no.py`. **Fågelmatares GT-bild fick köras om** — första rensningen lämnade
kvar "GE BORT GLÄDJE" i knappen; en skarpare prompt tog bort den.
Alla 8 granskade visuellt: rätt priser, rätt stavning, ingen svensk text kvar.

**Launchade i koncept-adseten med `no-image-ads.mjs`** (sekventiellt, ett
produkt-jobb i taget — kontot rate-limitade hela vägen, fel 17 med sex omförsök
per adset). **Verifierat mot API:t efter att spärren släppt: 8/8 bildannonser
ACTIVE.** Slutläge per adset: Fågelmatare CS/GT/PD/SP 4 annonser vardera (3 video
+ 1 bild); Solcellslampa PD/SP 4, CS/G 3 (2 video + 1 bild). Totalt 30 annonser
live. Skriptet vill ha filnamnet `<slug>_<K>_2_1_NO.png` — kopior med det namnet
ligger bredvid `NO_<slug>_<K>_2_1.png` i `bilder-no/`.

## Fas 3.5 — Drive-leverans

MAKE TO NORWAY fick två nya mappar, skapade av rutinen själv:
- **NO Fågelmatare** `15V4zobRLwX54WU-IIaI4VD4Z9md-dsWO`
- **NO Solcellslampa 210 LED Sensor** `13aVGiXegKYIYlzm-KuF8hntND5XUsMxL`

Videor, bildannonser och adcopy (`ADCOPY_NO_<K>_<produkt>.txt`) uppladdade via
`drive-push.mjs`. Inga källmappar flyttade. REVIEWS-arken kopierades inte (beslut
2026-08-29).
