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
node matstrumpor/ringlista.mjs                   # ringlistan: kunder med 2+ ordrar → output/ringlista/ (se nedan)
node --test matstrumpor/test/*.test.mjs          # 80 tester
```

Inga npm-beroenden. Node ≥ 20.

## Ringlistan (byggd 2026-09-27)

Axels beställning: "en lista med alla kunder som köpt 2 gånger eller fler …
en ringlista … 1–3 frågor per kund", han ringer själv och skriver medan de
pratar (inget spelas in). `node matstrumpor/ringlista.mjs` läser alla ordrar
ur Shopify (appen "Fabriken", läs-bart) och skriver **`output/ringlista/`**:
`RINGLISTA.md` (läsbar), `ringlista.html` (tryck-för-att-ringa, statusknappar,
anteckningsfält per kund som sparas i webbläsaren, knappen *Kopiera
anteckningar* ger markdown att klistra in i chatten) och `ringlista.json`.
`--spara-ordrar` lägger råordrarna bredvid, `--fran <fil>` bygger om utan nät.

⛔ **Utdatan bär namn, telefonnummer och e-post.** Mappen är gitignorerad och
filerna får aldrig committas, postas i Discord eller läggas i Notion. Ett test
bevisar att utmappen ligger under `output/`.

Tre saker datan visade (4 012 ordrar, 2026-09-27):

| Fynd | Vad det betyder för listan |
|---|---|
| 70 av 71 `shopify_draft_order` är Donut-strumpor 299 kr, skapade 1–5 min efter en webborder (dec 2025–mars 2026) | Tacksidans tillägg, inte ett återköp. Ordrar inom en timme räknas som **samma köptillfälle**; kunden hamnar i gruppen *Tog donut-tillägget* |
| Butiken sålde Fixkliniken-produkter (Skrubbmattan, FixToes …) före strumporna: 322 ordrar | En order utan strumpor/ätpinnar/presentkort räknas inte — de kunderna är inte Matstrumpors |
| Kassan kräver inte telefon: 800 av 4 006 ordrar bär ett nummer | 114 kunder har 2+ ordrar, **37 går att ringa**; de 77 utan nummer står sist med e-post |

Grupperna, i den ordning de står i listan: **Kom tillbaka och köpte igen**
(42, 16 med telefon — två eller fler köptillfällen), **Två beställningar i
samma besök** (6, 3 med telefon — två identiska ordrar flaggas som möjligt
dubbelköp) och **Tog donut-tillägget direkt efter köpet** (66, 18 med telefon).
Frågorna är tre per kund, den mest specifika först (antal köp, byte av sort,
tid mellan köpen, tillägget eller dubbelordern), sedan alltid *Vem fick
strumporna, och hur reagerade den som fick dem?* och *Var det något som nästan
fick dig att inte köpa?* Manuset står överst i filen. Presentkortet i
"Köp 2 – få 2"-paketet räknas inte som en sort kunden valt.

Sammanfattningen efter samtalen skrivs av sessionen ur Axels anteckningar och
landar i `products/matstrumpor/` (avatarerna i `dna.md` bygger i dag på
hookar och ordrar, inte på en enda kundintervju — samtalen är den källan).

## Två saker att veta innan du ändrar något

**1. Meta läses via token, skrivs via MCP.** `META_ACCESS_TOKEN` har åtkomst
till kontot sedan 2026-09-22 (Axel gav användaren "API LONG TERM" rättigheten;
mätt med `GET act_730973156224390?fields=name` → `nya kungen`). Till och med
2026-09-21 nekades den (`(#200) Ad account owner has NOT granted
ads_management`). Sedan dess LÄSER ronden kontot via REST (`meta.mjs`,
`kor.mjs --hamta`) och **`/matstrumporkungen` går som rutin 07:00 varje dag**
(`kor.mjs --kordag` avgör om det är rond — var tredje dag från förra ronden).
Uppladdningen i `/matstrumpor` är inte ombyggd: den skriver fortfarande genom
`mcp__Adsmanager__*` i en session Axel startar. `meta.mjs` har inga
skrivfunktioner alls — ronden skalar aldrig, så det som inte finns kan inte
köras av misstag.

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
| `kanda-namn.json` | Ögonblicksbild av upptagna annonsnamn (reserven utan nät). `--namn` läser dessutom loggens UPPLADDAD-rader, kontot ur senaste `output/avlasning-*.json` och hubben live via `NOTION_TOKEN`, och skriver unionen tillbaka hit. ⚠️ Lärdom 2026-09-24/25: filen ensam gav 048 tre gånger i rad (rond 2:s Draft-briefer fanns bara i hubben) ⇒ nio annonser live med rond 2:s nummer, brieferna omdöpta 054–058 |

Produktminnet ligger i `products/matstrumpor/` (`dna.md`, `batch-log.md`,
`lardomar.md`) — som alla andra produkter i repot.

## E-posten (Klaviyo, byggd 2026-09-25)

Matstrumpor har ett eget Klaviyo-konto, **`UV6Rqg`** (nyckeln
`KLAVIYO_API_KEY_MATSTRUMPOR`), och samma motor som Bäverbutiken med `--brand
matstrumpor`. Brandfilen är `klaviyo/brands/matstrumpor.json`, innehållet
`klaviyo/innehall/matstrumpor/` (14 kampanjer K01–K14 + 7 flöden), analysen
`klaviyo/evolve/ATERKOP-ANALYS-matstrumpor.md`, läget i `klaviyo/README.md`.

```bash
node klaviyo/kolla.mjs --brand matstrumpor --profiler   # konto, metriker, samtycke
node klaviyo/bygg.mjs --brand matstrumpor               # mejlen ur innehållet + live-priser
node klaviyo/ladda-upp.mjs --brand matstrumpor          # torrt; --skarpt laddar upp som utkast
node klaviyo/sla-pa.mjs --brand matstrumpor <flöde …>   # bara på Axels ord, --ja
node klaviyo/schemalagg.mjs --brand matstrumpor K01     # bara på Axels ord, --ja
node klaviyo/rapport.mjs --brand matstrumpor            # vinstbidrag mot break-even 1,498
```

Det datan säger (hela orderhistoriken, 3 911 ordrar): **julprodukt** (dec 2025
1 613 ordrar, april–juli nästan noll), 1,2 % återköp och då **samma sushilåda
igen** (38 av 44), inget produktpar med stöd, leverans p90 15 dygn ⇒ sista
beställning fars dag 24/10 och jul 8/12. Black Week-trappan 10/20/30 % ligger i
Shopify som tre schemalagda automatiska rabatter 23–30/11 (Axels beslut).
⚠️ Kontot saknade postadress 2026-09-25, så inget är påslaget: villkoren och
Cowork-prompten står i `klaviyo/SISTA-STEGEN.md` → Matstrumpor.
