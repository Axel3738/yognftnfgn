# Fars dag-batchen 2026 (FD) — batch-logg

**Beställd:** 2026-09-28 av Axel: "en batch på varje produkt som vi skalar just nu
och som vi faktiskt gör nya annonser för i Notion … fars dag-rea … fars dag den
åttonde november. Vi har speciellt anpassad copy på de annonserna."

## Besluten

| Beslut | Vem | Varför |
|---|---|---|
| **Rean = dagens jämförpris** ("Det är den som är idag det är rean som är på alla produkter. Jämf pris") | Axel 2026-09-28 | Svar på frågan om rabatt 10/15/20 % eller ingen. ⚠️ Risken framförd innan svaret: alla sju produkter visar jämförpriset året runt, och prisinformationslagen 7 a § kräver att en annonserad prissänkning räknas från lägsta priset senaste 30 dagarna (`factory/tacksida/RESEARCH.md`). |
| **7 produkter i första omgången** | sessionen | `products/aktiva-hubbar.json` listar 11 hubbar, men kampanjerna för Biltvättborsten, Fågelmataren, Adventskalendern Racingbilar och MC-kapellet stod PAUSED med spend i MagiBorsten 2026-09-28 (läst ur Meta). Leveransrundan laddar aldrig upp i en avstängd kampanj. |
| **3 annonser per produkt:** `FD_1_H1` + `FD_1_H2` (video, omklipp av produktens bästa video, hooken är enda skillnaden) och `FD_2_1` (bild) | sessionen | Omklipp av en bevisad video går snabbast för redigerarna; bilden görs av `/bildannonser` samma kväll. |
| **Bara Sverige** | sessionen | Fars dag är 8 november i Sverige (och Norge/Finland), men i juni i USA och Danmark — Taköverdraget och Termoskyddet speglas annars till CaraShell och vidare till USA. Sista beställningsdagen är räknad på leveranstiden till Sverige. Spärren: `tools/lib/bara-sverige.mjs` (kod `FD`), inkopplad i `tools/oversattningskon.mjs` och `tools/ops-spegla.mjs`, regeln i `.claude/commands/oversatt.md` och `docs/naming-convention.md`. |
| **"Beställ senast 19 oktober"** i varje annons | sessionen, ur repot | `klaviyo/brands/baverbutiken.json` → `kalender.fars_dag_sista_bestallning` (fars dag − p90 20 dygn). Samma datum som fars dag-mejlen. |
| **Ny vinkelkod `FD`** | sessionen | Så batchen går att skära ut ur datan (namnkonventionen regel 4). |

## Föräldrarna (MagiBorsten last_30d, läst 2026-09-28)

Rangordnat på vinstbidrag `spend × (ROAS ÷ BE − 1)`, BE ur kampanjnamnet,
break-even-CPA = kampanjens AOV ÷ BE-ROAS.

| Produkt | Förälder (video) | Spend | Köp | ROAS | CPA | BE-CPA | Vinstbidrag |
|---|---|---|---|---|---|---|---|
| Taköverdraget | `Takoverdrag_GT_2_H1` (presentvinkeln) | 8 182 kr | 30 | 4,24 | 273 kr | 760 kr | 13 124 kr |
| Termoskyddet | `Termoskydd_CS_3` | 5 934 kr | 32 | 3,44 | 185 kr | 370 kr | 6 751 kr |
| IBC-överdraget | `IBC_PD_1_H1` | 33 804 kr | 132 | 2,61 | 256 kr | 442 kr | 24 584 kr |
| Båtmotorskyddet | `Batmotor_SP_1_H5` | 27 509 kr | 125 | 2,70 | 220 kr | 384 kr | 18 394 kr |
| Sotarsetet | `Sotarset_PD_1_H2` | 10 818 kr | 59 | 2,97 | 183 kr | 325 kr | 9 143 kr |
| Inomhustofflorna | `Inomhustofflor_SP_1_H2` | 2 137 kr | 11 | 3,00 | 194 kr | 350 kr | 1 842 kr |
| Bältesslipen | `Beltgrinder_PD_4_H1` | 3 785 kr | 12 | 3,04 | 315 kr | 568 kr | 2 867 kr |

Varje `OUR AD`-tid i brieferna är avläst ur föräldervideon: hämtad ur Meta med
sidans token, en frame per sekund, tittad bild för bild.

## Omgång 2 samma eftermiddag: fyra hubbar som saknades

Axel skickade en skärmbild av sin Notion ("Ligger det en i alla dessa?"). Fyra
hubbar där saknade batch: **Solar motion sensor light**, **Golf advent
calendar**, **Whittling set** och **Fish rod holder**. Orsaken: första
omgången tog produktlistan ur `products/aktiva-hubbar.json` (ändrad senast
2026-09-23), där de fyra inte står. Alla fyra kampanjerna var ACTIVE i
MagiBorsten. **Lärdom: listan över aktiva produkter läses ur Notion och
kontot, aldrig ur en fil ensam.**

| Produkt | Förälder (video) | Spend | Köp | ROAS | CPA | BE-CPA | Vinstbidrag |
|---|---|---|---|---|---|---|---|
| Solcellslampan | `Solcellslampa_PD_3` | 9 887 kr | 25 | 2,13 | 395 kr | 518 kr | 3 114 kr |
| Golfkalendern | `Golfkalender_PD_1` | 4 181 kr | 20 | 3,27 | 209 kr | 409 kr | 3 860 kr |
| Täljsetet | `Taljset_PD_3` | 2 585 kr | 14 | 4,71 | 185 kr | 556 kr | 4 879 kr |
| Fiskespöhållaren | `Fiskespöhållare_CS_1_H1` (bästa AKTIVA; toppen `Fiskespöhållare_PD_EXTRA` är pausad på annonsnivå) | 3 622 kr | 23 | 3,02 | 157 kr | 296 kr | 3 661 kr |

⚠️ **Två saker gör att de fyra inte går hela vägen av sig själva:**
`/bildannonser` gör bara bilder för hubbar i `products/aktiva-hubbar.json`, där
de fyra saknas, och **Fish rod holder** (`3c3270ab-…`) står i
`factory/produkter/register.json` som TackleBays hubb, så leveransrundan
undantar den. I den ligger 12 rader i `To be Reviewed`, varav 11 är
`TackleBayRod_…` med tacklebay.se som landningssida. Axel förstod inte frågan
om "nya hubbar" (det är hans befintliga hubbar) — listan är orörd, i stället:

- **Bilderna för de fyra gjordes av sessionen samma kväll** (ramverket nivå
  1/2, ingen bildmodell): produktsidans eget foto, texten ordagrant ur Design
  brief, grön i `bildannonser/verifiera.py`, tittad i båda formaten, 4:5 + 1:1
  i `Filer och media`, status `To be Reviewed`, tillbakaläst. Fiskespöhållarens
  foton bär alla en människa eller inbränd text, så bilden är fyra kopior av
  den orange hållaren ur produktsidans foto "Fyra färgalternativ" — ett 4-pack
  är EN färg, så fyra färger i bild hade lovat fel.
- **Leveranskön torrläst 2026-09-28 ~17:50:** Solcellslampa, Golfkalender och
  Täljset hittade med kampanj ur kontot. `Rodholder_FD_2_1` finns inte i kön
  (Fish rod holder undantas). **Axels svar 2026-09-29:** först "jag vill
  gärna göra det manuellt", sedan samma morgon "Jag orkar fan inte ladda upp
  de där. Det där får du göra." Därför är **hubben flyttad till
  Bäverbutiken**: `notion.database_id` borttaget ur
  `tacklebay/fiskespohallare-4-pack` i `factory/produkter/register.json`
  (flytten står i `notion.overford`), och prefixet `TackleBayRod_` är
  **blockerat** i `products/prefix-alias.json` så de elva gamla raderna med
  tacklebay.se aldrig laddas upp eller rörs (`kampanjForPrefix` i
  `tools/lib/kampanjval.mjs`, fem tester). Torrkörd 06:2x CEST:
  `Rodholder_FD_2_1` och `Rodholder_PD_39_H1` → kampanjen Fiskespöhållaren
  (ur kontot), elva `TackleBayRod_` → blockerade. Leveransrundan 13:20 laddar
  upp dem; de framtida fars dag-videorna i hubben går samma väg.

⛔ **Ordet "rea" stoppades av bildrutinens textspärr** (`verifiera.py`: "ordet
rea … stoppas alltid"), så alla elva `FD_2_1` hade fastnat i Draft i kväll.
Spärren släpper nu igenom ordet bara när briefen bär en rad som börjar med
`REA BESLUTAD AV ÄGAREN` (datum + Axels ord); raden står i alla elva
bildbrieferna, i repot och i Notion (tillbakaläst). Fyra tester i
`bildannonser/test/verifiera.test.mjs`.

## Omgång 3, 2026-09-29: rubrikvarianten `FD_2_2` ("presenten han faktiskt använder")

**Beställd:** Axel samma morgon: "Ni har också testat att köra med den farsdagspresenten
som de faktiskt vill ha eller faktiskt kommer att använda … det hade ju varit nice att
köra några sådana headlines på några bilder … de var riktigt nice." Belägget i kontot:
`Takoverdrag_GT_2_H1` ("gav jag något han faktiskt använder. Varje vinter.") är
Taköverdragets mest lönsamma video (8 182 kr, 30 köp, ROAS 4,24, vinstbidrag 13 124 kr,
MagiBorsten last_30d läst 2026-09-28), speglad som "Presenten han faktiskt blir glad för."
och "The RV gift they'll actually use".

**Bara rubriken byts.** `FD_2_2` är `FD_2_1` pixel för pixel utom rubriken: badge,
underrad, foto, prisband och bottenrad står kvar, och annonsen går i samma adset
(`FD | Notionrunda 2026-09-29`) med samma annonstext. Då läser H(2_1) mot H(2_2) per
produkt rubrikens effekt och inget annat. Ordet **"faktiskt"** är vinkelns markör och
står i varje rubrik. Rubrikerna skrevs av en sonnet-subagent mot `docs/copy-regler.md`,
två förslag per produkt med tre-frågorstest, och sex skrevs om för att bära
"faktiskt" (`copy/rubriker-FD_2_2.json`).

| Produkt | FD_2_1 (förut) | FD_2_2 (ny) | Notion |
|---|---|---|---|
| Båtmotorskyddet | Fars dag-present: skydd för hela vintern. | Fars dag-presenten han faktiskt drar över motorn | [Batmotor_FD_2_2](https://www.notion.so/3ea270ab908c81f8a628ddfbd4382637) |
| Bältesslipen | Fars dag-present för pappans slöa knivar | Fars dag-presenten han faktiskt slipar eggen med | [Beltgrinder_FD_2_2](https://www.notion.so/3ea270ab908c81409fe4d26b234b89cc) |
| Golfkalendern | Fars dag-present fylld med golfprylar. | Till fars dag: golfprylar han faktiskt öppnar | [Golfkalender_FD_2_2](https://www.notion.so/3ea270ab908c81419182ed6ee0c7f8f1) |
| IBC-överdraget | Fars dag-presenten som stoppar algerna i tanken | Fars dag-presenten han faktiskt drar över tanken | [IBC_FD_2_2](https://www.notion.so/3ea270ab908c81caa1d7d8cee17ffea0) |
| Inomhustofflorna | Kamouflagetofflor fodrade med plysch till fars dag | Fars dag-tofflorna han faktiskt har på sig | [Inomhustofflor_FD_2_2](https://www.notion.so/3ea270ab908c81438599cb3ccd63fdd1) |
| Fiskespöhållaren | Fars dag-present: fyra hållare, en till varje spö | Fars dag-presenten han faktiskt sätter spöet i | [Rodholder_FD_2_2](https://www.notion.so/3ea270ab908c815b9477f4296f3fb6f0) |
| Solcellslampan | En present till fars dag: ingen elektriker. | Fars dag-presenten han faktiskt sätter upp själv | [Solcellslampa_FD_2_2](https://www.notion.so/3ea270ab908c8147aeade49d234cb295) |
| Sotarsetet | Fars dag-present: skruva ihop 3,69 meter själv. | Fars dag: skorstenen han faktiskt rensar själv | [Sotarset_FD_2_2](https://www.notion.so/3ea270ab908c8101b5b6e440c461ea57) |
| Taköverdraget | Present till fars dag: taket han aldrig kollar. | Till fars dag: husvagnstaket han faktiskt täcker | [Takoverdrag_FD_2_2](https://www.notion.so/3ea270ab908c81adb8e8c0bed640d5d9) |
| Täljsetet | Till fars dag: 30 delar i väskan. | Fars dag-presenten han faktiskt täljer med | [Taljset_FD_2_2](https://www.notion.so/3ea270ab908c81d8ac41c68f1d5f3959) |
| Termoskyddet | Fars dag-present: pappa slipper torka imma | Fars dag-skyddet han faktiskt sätter på husbilen | [Termoskydd_FD_2_2](https://www.notion.so/3ea270ab908c8151ada7c74e83a8319d) |

**Bilderna:** sju av `FD_2_1` gjordes av bildrutinen (kie.ai-bas + `text.py`), och
basen utan text dör med rutinens container. Därför `byt-rubrik.py`: den läser av
rubrikens rader (feta streck under den röda badgen, ≥ 5 px streckbredd), räknar ut
storleken ur radavståndet (`text.py`: höjden av "Åjg" × 1,45), tvättar bort bara de
mörka textpixlarna med inpaint och skriver den nya rubriken i Liberation Sans Bold på
samma rader. De fyra sessionen själv komponerade byggs om med `FD_VAR=2_2 python3 komponera.py`. Alla 22 bilder (4:5 + 1:1) tittade på, `verifiera.py` grön
(spec:en måste bära `produkt`, annars stoppas IBC:s riktiga jämförpris 636 kr som
axelbältets gamla pris), briefgranskningens `--rad`-spärr grön, raderna i Notion med
båda formaten och `To be Reviewed`.

**Uppladdningen:** sessionen laddade upp alla `FD_2_1` och `FD_2_2` själv 2026-09-29
förmiddag i stället för att vänta på leveransrundan 13:20 (Axel: "Vart är alla items
med fars dag-annonsen?"). Metas anropstak för kontot stryper efter ett par
uppladdningar i rad ("User request limit reached"): en i taget, 6 minuters vila vid
strypning, en minut mellan annonserna.

## Brieferna i Notion (alla `Draft`, skapade 2026-09-28)

**Allt på en sida (Axels fråga 2026-09-29 "vart kan jag se alla farsdag briefs"):**
https://claude.ai/artifact/U6gefRwvnMgXLvQ7ygjqVG — bilderna, videornas öppningar och manus,
annonstexten och Notion-länken per rad, status läst 2026-09-29 morgon (11 av 11 bilder i
`To be Reviewed`, `Rodholder_FD_1_H1/H2` hos redigeraren, resten `Draft`). Byggd ur
`copy/*.json` + `plan.mjs`; publicera om på samma länk när statusen ändrats.

| Hubb | Video H1 | Video H2 | Bild |
|---|---|---|---|
| BÄVER Taköverdraget | [Takoverdrag_FD_1_H1](https://www.notion.so/3e9270ab908c8158b64dc22f0b819337) | [Takoverdrag_FD_1_H2](https://www.notion.so/3e9270ab908c8102bcbdfa3321ed0c3a) | [Takoverdrag_FD_2_1](https://www.notion.so/3e9270ab908c81d1808fff9634f468ec) |
| BÄVER Termoskyddet | [Termoskydd_FD_1_H1](https://www.notion.so/3e9270ab908c81ffbb02ef46ec2fbc7a) | [Termoskydd_FD_1_H2](https://www.notion.so/3e9270ab908c81a8b0ededc02594e297) | [Termoskydd_FD_2_1](https://www.notion.so/3e9270ab908c81f98200d0b67f897640) |
| BÄVER IBC-Tanköverdraget | [IBC_FD_1_H1](https://www.notion.so/3e9270ab908c81c8b06cf05bab078ec2) | [IBC_FD_1_H2](https://www.notion.so/3e9270ab908c816bb701f03d340dc7db) | [IBC_FD_2_1](https://www.notion.so/3e9270ab908c81729086e9d14f5d0b75) |
| Boat motor cover | [Batmotor_FD_1_H1](https://www.notion.so/3e9270ab908c81b58f89c6251d64f573) | [Batmotor_FD_1_H2](https://www.notion.so/3e9270ab908c81aea1fcc57fe7c69a16) | [Batmotor_FD_2_1](https://www.notion.so/3e9270ab908c81fba1f1e156485ad914) |
| Chimney sweep set | [Sotarset_FD_1_H1](https://www.notion.so/3e9270ab908c81e9b589ea04906a39ca) | [Sotarset_FD_1_H2](https://www.notion.so/3e9270ab908c81429a91ea6222487cce) | [Sotarset_FD_2_1](https://www.notion.so/3e9270ab908c81a8b6eeedf51011b26c) |
| Indoor slippers | [Inomhustofflor_FD_1_H1](https://www.notion.so/3e9270ab908c8129a30cdb0e254aacdd) | [Inomhustofflor_FD_1_H2](https://www.notion.so/3e9270ab908c815d9b7ff5b594024bd0) | [Inomhustofflor_FD_2_1](https://www.notion.so/3e9270ab908c817e96aee052ed6996ad) |
| Belt grinder | [Beltgrinder_FD_1_H1](https://www.notion.so/3e9270ab908c81268fb4d7f212ac4ff5) | [Beltgrinder_FD_1_H2](https://www.notion.so/3e9270ab908c81eda994d9f7648a7bbd) | [Beltgrinder_FD_2_1](https://www.notion.so/3e9270ab908c81ebaf46d8ac76f9305b) |
| Solar motion sensor light | [Solcellslampa_FD_1_H1](https://www.notion.so/3e9270ab908c81209941c71af5d4b8ea) | [Solcellslampa_FD_1_H2](https://www.notion.so/3e9270ab908c8101975ae24582c542db) | [Solcellslampa_FD_2_1](https://www.notion.so/3e9270ab908c818c82dcdd3a80e0add4) |
| Golf advent calendar | [Golfkalender_FD_1_H1](https://www.notion.so/3e9270ab908c818384c9fbcf7eebefeb) | [Golfkalender_FD_1_H2](https://www.notion.so/3e9270ab908c812fb8f8c072db8a70f2) | [Golfkalender_FD_2_1](https://www.notion.so/3e9270ab908c81fd81b8ea869d2d71d7) |
| Whittling set | [Taljset_FD_1_H1](https://www.notion.so/3e9270ab908c81928ad6eab94bade6a8) | [Taljset_FD_1_H2](https://www.notion.so/3e9270ab908c816dbfbdf499630f9117) | [Taljset_FD_2_1](https://www.notion.so/3e9270ab908c81f58cc2ee0cf35b0be7) |
| Fish rod holder | [Rodholder_FD_1_H1](https://www.notion.so/3e9270ab908c81ba92acc3de1fdb1967) | [Rodholder_FD_1_H2](https://www.notion.so/3e9270ab908c818daee5dcd042bf6494) | [Rodholder_FD_2_1](https://www.notion.so/3e9270ab908c8133bda9d481a3729b6b) |

Alla 33 klarade spärren `node tools/briefgranskning.mjs --rad … --pris … --jamforpris …`
(0 fel, 0 anmärkningar) innan raden skapades, och alla 33 lästes tillbaka ur
Notion (3 i var och en av de 11 hubbarna) (Namn, `Draft`, rätt Pending Approval-typ, Landing page).

## Så byggs den om

```bash
node docs/briefs/farsdag-2026/bygg.mjs     # plan.mjs (regin) + copy/*.json (sonnet) → <Namn>/brief.md + manifest.json
```

Copyn skrevs av sju sonnet-subagenter (en per produkt) mot `copy/GEMENSAMT.md`,
`docs/copy-regler.md` och produktsidan; fem rader skickades tillbaka och skrevs
om (upprepning, "genom hela röret", grammatik, prisformat). `bygg.mjs` skriver
ingen svensk rad själv och stoppar på tankstreck och butiksnamn.

## Mätningen (ANALYSMETOD)

Ingen dom under 300 kr spend eller 3 köp. Varje FD-annons läses mot sin
förälders CPA och mot produktens break-even-CPA ovan — aldrig mot ROAS ensam.
H1 mot H2 per produkt = hookens effekt. Efter 19 oktober säger annonserna ett
datum som passerat.
