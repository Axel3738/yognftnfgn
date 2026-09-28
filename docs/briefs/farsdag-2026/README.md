# Fars dag-batchen 2026 (FD) — batch-logg

**Beställd:** 2026-09-28 av Axel: "en batch på varje produkt som vi skalar just nu
och som vi faktiskt gör nya annonser för i Notion … fars dag-rea … fars dag den
åttonde november. Vi har speciellt anpassad copy på de annonserna."

## Besluten

| Beslut | Vem | Varför |
|---|---|---|
| **Rean = dagens jämförpris** ("Det är den som är idag det är rean som är på alla produkter. Jämf pris") | Axel 2026-09-28 | Svar på frågan om rabatt 10/15/20 % eller ingen. ⚠️ Risken framförd innan svaret: alla sju produkter visar jämförpriset året runt, och prisinformationslagen 7 a § kräver att en annonserad prissänkning räknas från lägsta priset senaste 30 dagarna (`factory/tacksida/RESEARCH.md`). |
| **7 produkter, inte 11** | sessionen | `products/aktiva-hubbar.json` listar 11 hubbar, men kampanjerna för Biltvättborsten, Fågelmataren, Adventskalendern Racingbilar och MC-kapellet stod PAUSED med spend i MagiBorsten 2026-09-28 (läst ur Meta). Leveransrundan laddar aldrig upp i en avstängd kampanj. |
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

## Brieferna i Notion (alla `Draft`, skapade 2026-09-28)

| Hubb | Video H1 | Video H2 | Bild |
|---|---|---|---|
| BÄVER Taköverdraget | [Takoverdrag_FD_1_H1](https://www.notion.so/3e9270ab908c8158b64dc22f0b819337) | [Takoverdrag_FD_1_H2](https://www.notion.so/3e9270ab908c8102bcbdfa3321ed0c3a) | [Takoverdrag_FD_2_1](https://www.notion.so/3e9270ab908c81d1808fff9634f468ec) |
| BÄVER Termoskyddet | [Termoskydd_FD_1_H1](https://www.notion.so/3e9270ab908c81ffbb02ef46ec2fbc7a) | [Termoskydd_FD_1_H2](https://www.notion.so/3e9270ab908c81a8b0ededc02594e297) | [Termoskydd_FD_2_1](https://www.notion.so/3e9270ab908c81f98200d0b67f897640) |
| BÄVER IBC-Tanköverdraget | [IBC_FD_1_H1](https://www.notion.so/3e9270ab908c81c8b06cf05bab078ec2) | [IBC_FD_1_H2](https://www.notion.so/3e9270ab908c816bb701f03d340dc7db) | [IBC_FD_2_1](https://www.notion.so/3e9270ab908c81729086e9d14f5d0b75) |
| Boat motor cover | [Batmotor_FD_1_H1](https://www.notion.so/3e9270ab908c81b58f89c6251d64f573) | [Batmotor_FD_1_H2](https://www.notion.so/3e9270ab908c81aea1fcc57fe7c69a16) | [Batmotor_FD_2_1](https://www.notion.so/3e9270ab908c81fba1f1e156485ad914) |
| Chimney sweep set | [Sotarset_FD_1_H1](https://www.notion.so/3e9270ab908c81e9b589ea04906a39ca) | [Sotarset_FD_1_H2](https://www.notion.so/3e9270ab908c81429a91ea6222487cce) | [Sotarset_FD_2_1](https://www.notion.so/3e9270ab908c81a8b6eeedf51011b26c) |
| Indoor slippers | [Inomhustofflor_FD_1_H1](https://www.notion.so/3e9270ab908c8129a30cdb0e254aacdd) | [Inomhustofflor_FD_1_H2](https://www.notion.so/3e9270ab908c815d9b7ff5b594024bd0) | [Inomhustofflor_FD_2_1](https://www.notion.so/3e9270ab908c817e96aee052ed6996ad) |
| Belt grinder | [Beltgrinder_FD_1_H1](https://www.notion.so/3e9270ab908c81268fb4d7f212ac4ff5) | [Beltgrinder_FD_1_H2](https://www.notion.so/3e9270ab908c81eda994d9f7648a7bbd) | [Beltgrinder_FD_2_1](https://www.notion.so/3e9270ab908c81ebaf46d8ac76f9305b) |

Alla 21 klarade spärren `node tools/briefgranskning.mjs --rad … --pris … --jamforpris …`
(0 fel, 0 anmärkningar) innan raden skapades, och alla 21 lästes tillbaka ur
Notion (Namn, `Draft`, rätt Pending Approval-typ, Landing page).

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
