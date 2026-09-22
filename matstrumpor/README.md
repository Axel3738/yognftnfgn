# `matstrumpor/` — uppladdaren och den lilla kungen

Två kommandon, ett konto, en produkt.

| Kommando | Vad |
|---|---|
| `/matstrumpor` | Hubbens `To be Reviewed` → rätt adset i **samma CBO** → `Approved` |
| `/matstrumporkungen` | Etikett → lärdom → 6 briefer per rond, var tredje dag + budgetrond |

**Kontot heter "nya kungen"** (`730973156224390`, portfölj Matstrumpor.se).
Inte Matstrumpor. Kolla alltid id:t.

## Hinkarna

Allt i kampanjen `MATSTRUMP_SALES_20260826` (CBO, 1 000 kr/dag). Adsetet väljs
**ur annonsnamnet** — `MATSTRUMP_sushi_<vinkel>_<format>_<nnn>_v<n>`:

```
vinkel jul + ugc/anim/beforeafter/comparison/lifestyle → broad_advplus_purchase_jul_video
vinkel jul + static/product/textheavy                  → broad_advplus_purchase_jul_bilder
annan vinkel + videoformat                             → broad_advplus_purchase_nya16
annan vinkel + bildformat                              → broad_advplus_purchase_bilder
```

Därför är namnet inte kosmetika: ett namn utanför mönstret går inte att routa
och laddas aldrig upp på gissning.

## Kommandon i terminalen

```bash
node matstrumpor/kor.mjs --kolla                 # konto, kampanj, adsets, nycklar, break-even
node matstrumpor/kor.mjs --ekonomi               # break-even, båda momslinjerna
node matstrumpor/kor.mjs --aov [--dagar 30]      # mät AOV ur Shopify på riktigt
node matstrumpor/kor.mjs --ko [--json]           # Notion-kön → uppladdningsplan
node matstrumpor/kor.mjs --namn jul ugc 3        # nästa lediga namn
node matstrumpor/kor.mjs --dop <sid-id> <namn>   # döp en odöpt rad i Notion
node matstrumpor/kor.mjs --dom <jobb.json>       # vinstbidrag + etiketter ur en avläsning
node matstrumpor/kor.mjs --status                # lärdomar, briefer, brieftak, mix
node --test matstrumpor/test/*.test.mjs          # 46 tester
```

Inga npm-beroenden. Node ≥ 20.

## Två saker att veta innan du ändrar något

**1. Meta skrivs bara via MCP.** `META_ACCESS_TOKEN` nekas på kontot (mätt
2026-09-21: `(#200) Ad account owner has NOT granted ads_management`). Därför
går varje skrivning genom `mcp__Adsmanager__*` i en session Axel startar —
och därför kan det här INTE bli en nattrutin förrän appen fått åtkomst till
kontot (rutiner har inga `mcp__*`-verktyg).

**2. Momsen är en öppen fråga.** Break-even är **1,50 utan moms** och **2,14
med moms**. Kampanjen låg på ROAS 1,392 senaste 14 dagarna (17 031 kr) —
alltså *under* break-even på båda linjerna. En annons som hamnar mellan
linjerna får domen `BEROR_PA_MOMS` och rörs inte förrän
`ekonomi.moms_antagen` är satt i `konfig.json`.

## Filerna

| Fil | Vad |
|---|---|
| `konfig.json` | Enda sanningskällan: konto, kampanj, adsets, pixel, priser, kostnader, grindar. Allt avläst 2026-09-21, med källa per fält |
| `ekonomi.mjs` | Break-even båda momslinjerna, dom, vinstbidrag, ranking, benchmark-skyddet |
| `etikett.mjs` | Etiketten dag 7 — samma trösklar som Skalnings kungens `agent/etikett.mjs` |
| `lardom.mjs` | Lärdomen, brieftaket, mixen, iterationsräkningen, konceptstatus |
| `namn.mjs` | Namnmönstret, nästa lediga nummer, adset-routingen |
| `kon.mjs` | Notion-kön → uppladdningsplan med stoppskäl |
| `kor.mjs` | CLI:n |
| `logg.jsonl` | Minnet: `UPPLADDAD`, `ETIKETT`, `LARDOM`, `BRIEF`, `BUDGET`, `ROND_KLAR` |
| `kanda-namn.json` | Ögonblicksbild av upptagna annonsnamn, så `--namn` fungerar utan nät |

Produktminnet ligger i `products/matstrumpor/` (`dna.md`, `batch-log.md`,
`lardomar.md`) — som alla andra produkter i repot.
