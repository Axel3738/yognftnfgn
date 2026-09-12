# Batch 9 + 10 — två offertark (2026-09-12)

- **Ark A = batch 9:** "Leverantorsoffert-2026-09-10" — https://docs.google.com/spreadsheets/d/1Zs_KOAd5582aVIHt18g3tVkTWoxS7CrB-gidBrnpGx4
  (Axels länk hade ett stavfel i ID:t, `…g3lVk…` — rätt ID hittades via Drive-sökning.)
- **Ark B = batch 10:** "product batch #10" — https://docs.google.com/spreadsheets/d/1VJwBWO9Qt9Z7szCVg56-4Vj20BImzeZLhfi2UH-2x8Y

Axel: *"Kan du lägga upp alla dessa produkter på sidan i sverige och sen norge och sen lägga dom i
notion. Dom som står out of stock eller nån sjuk moq eller bara inte har en quote får du strunta i
och rapportera till mig."*

**21 rader i arken, 15 byggda** (SE + NO, snöskyffeln bara SE). Varje produkt har hero + detalj +
faktabild (SV/NO). AI-miljöbild + GIF gjordes i efterhand via **KIE** (Higgsfield var slut på credits,
Axel: *"Men du kan inte bara använda Kie Ai api då?"* — jo): `miljo-kie.mjs` → `miljo-in.mjs se|no bild`
→ `gif-kie.mjs` → `miljo-in.mjs se|no gif`.

| id | Batch | SE | NO | Läge |
|---|---|---|---|---|
| spakapell | 9 | 619 | 569 | ✅ bara svart |
| vedstallskapell | 9 | 529 | 479 | ✅ |
| solcellsladdare | 9 | 559 | 499 | ✅ |
| snoblasarkapell | 10 | 459 | 389 | ✅ |
| honsgardsduk | 10 | 459 | 379 | ✅ |
| snoflingor (**25**-pack) | 10 | 249 | 179 | ✅ Axels "25" stämde — leverantörens rutnät är 6+6+6+7 |
| vattenskal | 10 | 849 | 879 | ✅ NO dyrare än SE (offertens NO-pris) |
| atvkapell (3XL) | 10 | 579 | 539 | ✅ |
| snoskyffel (utan batteri) | 10 | 2 349 | — | ✅ bara SE — CWD: oversize till Norge |
| kajakhallare (2-pack) | 10 | 599 | 809 | ✅ 4 skruvar + 4 pluggar (räknade på bilden) |
| motorlas | 10 | 909 | 1 079 | ✅ |
| varmesits | 10 | 599 | 719 | ✅ |
| taljset (30 delar) | 10 | 869 | 1 039 | ✅ |
| varmeljus (24-pack, **utan fjärr**) | 10 | 379 | 519 | ⏸️ **DRAFT i båda butikerna** (Axel 2026-09-12: "ska bytas till en med fjärr") — CWD offererade bara 24-packet utan fjärr; ny offert behövs. Notion-kortet märkt VÄNTA |
| blockljus (3-pack, med fjärr) | 10 | 479 | 619 | ✅ |

**Byggs inte (rapporterat till Axel):** caravan front cover (ark A, out of stock) · deer hanger
pulley (ark A, out of stock) · snöskoterkapell (ark B, MOQ 50 custom) · takluckehuv 2-pack (ark B,
out of stock) · viltsläde (ark B, MOQ 100) · fågelmatare med kamera (ark B, CWD skrev "similar" —
annan produkt än länken).

## Filerna
- `fakta.mjs` — låsta fakta, SKU (`TEMU-B9-*` / `TEMU-B10-*`), verifierade kategori-GID. **Facit.**
- `priser.mjs` — prismatrisen; `ARK=a` (ark A) eller `ARK=b` (ark B, default). `--json` för skapa.mjs.
- `bilder-<id>.mjs` — beskär leverantörsbilden, bygger hero/detalj/fakta SV+NO (sharp, ingen AI).
- `copy.json` — färdig copy per produkt och språk (fem Sonnet-skribenter + en Sonnet-granskare +
  huvudsessionens slutläsning; enhetsformat, flerpack-format och sju sakrättningar).
- `skapa.mjs <se|no> [--skarp] [id]` — skapar produkten med 3 bilder, 7-blocksbeskrivning, cogs, publicering.

## Lärdomar
- **`=IMAGE()`-formlerna i arkets kolumn A pekar på `ae-pic-a1.aliexpress-media.com`** — den CDN:en
  går att hämta från molnet fast AliExpress-sidorna är blockerade. Fyra produkter fick sina enda
  bilder den vägen (spakapell, vedställskapell, snöslungekapell, hönsgårdsduk). Läs
  `xl/worksheets/sheet1.xml` i xlsx-exporten.
- **Räkna alltid själv, två gånger.** Snöflingorna: jag räknade 24 (6×4), Axel skrev 25, rutnätet
  är 6+6+6+7 = 25. Kajakhållaren: jag skrev 8 skruvar, bilden visar 4+4. Båda hittades av
  bildagenterna när utsnitten byggdes — inte av faktalistan. Zooma upp bilden innan antalet låses.
- **Leverantörens egen märkning på produkten** (vattenskålens "HEATED PET BOWL"-etikett, blockljusens
  fjärr med ON/OFF/TIMER) är inte reklamtext och står kvar — det är så produkten ser ut hemma hos kunden.
- **Snöslungekapellets hero är leverantörens vinterfoto,** inte vit bakgrund: den rena produktbilden
  har en spegelvänd logotyp på slungans kåpa som inte går att beskära bort.
- **Kajakhållarens hero visar krokarna beskurna upptill** — vattenstämpeln korsar krokarnas toppar och
  de gula ändskydden; inget målas över fotoyta. Vill Axel ha en hel krok krävs en ny källbild.
- **Vedställskapellets "outlet"** i offerten tolkades först som ett kabeluttag — bilden visar en
  framflik som rullas upp. Copyn säger det som syns, inte det som gissas.

## Notion (2026-09-12)
Femton kort i **Product test center SE BÄVER** (`collection://d80270ab-908c-839b-9dcc-8721c5f29570`),
namn `9 …` (ark A) och `10 …` (ark B), Status `Products`, Typ `Video - Pending Approval`, Landing
page = svenska produktsidan, låsta räkneord + bildnot + pris i kroppen (engelska, till redigerarna).
Snöflingorna heter `10 Snöflingor 25-pack`, värmeljusen `10 Värmeljus 24-pack` med noten att ingen
fjärr finns.
