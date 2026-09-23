# Batch 11–13 (2026-09-23) — MASTER-arket, flik "www"

Axel: *"Dessa ska upp på bäverbutiken. Både svenska och norska. Bara att börja kötta!"*
Offert: https://docs.google.com/spreadsheets/d/1zxPXYeyx228RVQ16-vrN19m-K2jKdq4x5snQ2KXAaj8
(44 rader, 41 med quote). Alla länkar utom fyra är **AliExpress** — molnet kan varken läsa
sidorna eller hämta bilder. Underlaget är därför arkets radnamn + leverantörsref, CWD:s
QC-fabriksbilder 2026-09-18 (`temu/qc/2026-09-18-cwd-qc.md`) och CWD:s svar 2026-09-19.

## Läget
**18 produkter live i SE + NO** (de som hade en riktig fabriksbild), **16 på VÄNTA** (Notion-kort
märkta `– VÄNTA: <orsak>`), **6 byggs inte**. Skördeprompten `temu/kaching-cli/BILDSKORD-BATCH11.md`
(33 produkter, nytt skript `ali-bilder.mjs` för AliExpress) levererades FÖRST enligt regeln.
Hero-bilderna är CWD:s QC-foton (500–1200 px, tillfälliga) — byts när skörden kommit.

| id | Batch | SE | NO | Bild nu | Läge |
|---|---|---|---|---|---|
| varmesulor | 11 | 869 | 799 | QC-kit | ✅ |
| krukvaxthuv (3-pack) | 11 | 589 | 569 | QC-förpackning | ✅ badge |
| bikupsjacka | 11 | 519 | 469 | QC | ✅ |
| ljusslingevindor (10-pack) | 11 | 409 | 359 | QC | ✅ badge |
| makitahallare (5-pack) | 11 | 359 | 319 | QC | ✅ badge |
| rcdrift | 12 | 689 | 679 | QC-kit | ✅ grå enligt bilden |
| rcoffroad | 12 | 999 | 1 099 | SE:s 5 gamla | ✅ **fanns i SE sedan 2026-07-22** — sidan omskriven (bort med "14 dagars ångerrätt"), cogs 239,59 → 300,00, alt-texter satta, klonad till NO |
| vedklyvshuv | 13 | 459 | 399 | QC (beskuren) | ✅ |
| poolpumphuv | 13 | 539 | 469 | QC-render 101×86×78 | ✅ |
| regnkedja (12 koppar) | 13 | 719 | 719 | QC | ✅ 12 koppar räknade |
| rullknivslip | 13 | 579 | 519 | QC | ✅ |
| highlandcow (24 fig) | 13 | 469 | 389 | QC (övre halvan — vattenstämpel nedtill) | ✅ asken tryckt 2026 |
| takachuv | 13 | 449 | 369 | QC-render | ✅ |
| buskjacka (2-pack) | 13 | 429 | 379 | QC + på kruka | ✅ 120×180 (CWD 09-19) |
| lovsilar (6-pack) | 13 | 379 | 309 | QC + i stuprör | ✅ badge |
| elcykeljacka (2-pack) | 13 | 349 | 299 | QC | ✅ badge |
| bordsfotboll (6 bollar) | 13 | 439 | 389 | QC fram + bak | ✅ 6 bollar (CWD 09-19) |
| magnetblock (200 st) | 13 | 799 | 809 | QC ask + kuber | ✅ **bara 200-pack** — 300-pack (29,12 USD) läggs till som variant när en 300-bild finns |

**VÄNTA (16):** bathuv, kamadohuv (QC-bilden är grå, vi säljer svart), kajakhuv, maskinhylla,
fonstertermomatta, varmemuff, laktarponcho, scooterkapell (bara hoppackad påse på bilden),
tradansikte, snosmaltmatta (spänning/EU-kontakt obekräftad), adelstenskalender (asken obekräftad),
krukbarrem, sorkkorgar, husbilskalender ("VOLKSWAGEN CAMPER" på asken — Axel avgör), slangboxhuv,
regntunnehuv. Byggs med `skapa.mjs` när skörden ligger i `temu/bildskord/<id>/` — sätt
`status: 'bygg'` + `qc:`/bildväg i `fakta.mjs`, skriv copy (subagent) och kör.

**Byggs inte (6):** dammvärmaren (bara US-version, CWD 09-19), minikedjesågen (ingen quote),
hönsluckan (ingen quote), fågelholken (MOQ 500), cykelhållarskyddet (CWD offererade ett ATV-kapell —
ny offert begärd), rad 62 "OUT OF STOCK … PRE ORDER" (namnlös rad, 35,51 USD — vilken produkt?).

## Filerna
- `fakta.mjs` — låsta fakta, SKU `TEMU-B11/B12/B13-*`, kategori-GID (slagna i taxonomin), status bygg/vanta + orsak, QC-bildvägar
- `priser.mjs` — SE = nio((landat + 2,9 €) × 3 × 9,4698), NO = nio(landat × 3 × 9,2989), jämför × 1,3
- `bilder.mjs` — QC-foto → 1000×1000 hero/detalj, beskärning per produkt, antalsbadge (sharp, SE/NO)
- `copy-1..3.json` → `granska-copy.mjs` → `copy.json` — tre Sonnet-skribenter (sv+no), skript-granskning
  (förbjudna ord, räkneord, flerpack i titel + första bullet, seo-längder) + huvudsessionens korrläsning
- `skapa.mjs <se|no> [--skarp] [id …]` — skapar/uppdaterar, rcoffroad = uppdatera SE + klona till NO
- `slutgranska.mjs` — läser allt live i SE + NO: mall, kategori, moms av, cogs, jämför > pris, media 200, alt, rester, garanti, storefront 200
- `notion-kort.mjs` — 34 Notion-kort (18 live + 16 VÄNTA) som JSON till notion-create-pages

## Rättningar i copyn (huvudsessionens korrläsning)
"aldrig/alltid" i regnkedjan och bordsfotbollen · "bygglen" → "byggen" · bikupsjackans "tål att sitta
ute genom vintern" (påstående utan underlag) · vedklyvshuvens "formsydd" (inte belagt) ·
norska "posten" → "jaktposten" (posten = postkontoret) · onödiga varningar borttagna.
