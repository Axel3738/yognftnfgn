# /ops-produkt – Lägg till EN produkt i en BEFINTLIG OPS-butik

Argument: `$ARGUMENTS` — butikens id, sedan länken till produkten på
Bäverbutiken. `--id <produkt-id>` och `--prefix <Prefix>` om du vill välja
själv; annars föreslås de. `--torr` = visa allt, skriv ingen fil.

```
/ops-produkt carashell https://baverbutiken.se/products/atv-kapell-storlek-3xl-256-110-120-cm-svart
/ops-produkt tacklebay https://baverbutiken.se/products/... --id fiskebox --prefix TackleBayBox
```

CONNECTORS: inga. Källan läses över HTTPS, bygget går via `factory/ops.mjs`
med Shopify-token i `factory/.env`, annonserna via `META_ACCESS_TOKEN`.

**Vad kommandot är, i en mening:** Axel hittar en produkt på Bäverbutiken som
passar en butik han redan har, skickar länken, och produkten hamnar i den
butiken — utan att en ny butik byggs. Detta är `/ny-ops` minus butiksstegen.

**Vad det INTE är:** en ny butik (det är `/ny-ops`), en ny testbatch på
Bäverbutiken (`/ny-produkt`), eller annonserna (`/ny-annonser`).

---

## Järnregler

1. **Kör ALDRIG bygget med bara den nya produktfilen.** Startsidan, menyn och
   produktmallen byggs om ur *produkterna i körningen* (`ops.mjs`
   `byggStartsida`, `huvudmenylankar`, `byggProduktTemplate`). Med en enda fil
   försvinner butikens gamla produkt ur startsidan och huvudmenyn — utan
   felmeddelande. `factory/ops-produkt.mjs` skriver ut körraden med samtliga
   produktfiler; använd den ordagrant.
2. **Eget `meta.creative_prefix` per produkt, alltid.** Prefixet är det ENDA
   fyra system skiljer produkter på: leveranskön, översättningskön,
   adsetuppslaget och commission. Delat prefix ⇒ nattvakten dömer den ena
   produktens annonser mot den andras break-even, varje natt, tyst.
   Skriptet vägrar ett prefix som redan används i butiken.
3. **Eget `kalla:`-block per produkt.** Källans annonsprefix hör till produkten,
   inte butiken. Ärver produkt 2 produkt 1:s `kalla.annonsprefix` byggs den av
   fel produkts annonser — och creativen ser helt rimlig ut.
4. **Egen kampanj per produkt.** `factory/kampanj.mjs` gör det redan
   (`{BRAND}_{MARKNAD}_{Produktnamn}`). Slå aldrig ihop två produkter i en
   kampanj: då går spenden inte att skära och break-even blir meningslös.
5. **Egen minut i rutinschemat.** Två produkter i samma butik fick identisk
   cron till 2026-09-14 — `platsFor` räknade bara på butiksdelen. Nu ärver en
   produktnyckel butiksplatsen bara i en enproduktsbutik; `setup` för produkt 2
   ska köras med flerproduktsflaggan så den får en egen plats.
6. **PAUSED med spend är ett beslut.** Bygget rör aldrig kontot; annonserna är
   `/ny-annonser` och de föds PAUSED.
7. Kör klart utan att fråga. Rapportera "Gjort av mig" / "Väntar på en
   människa". Axels uppgifter sist, numrerade.

---

## Gör i ordning

Färsk `main` först: `git fetch origin main && git checkout main && git reset --hard origin/main`.

### 1. Förarbetet — produktfilen ur källänken
```
node factory/ops-produkt.mjs <butik> <källänk> --torr     # läs planen
node factory/ops-produkt.mjs <butik> <källänk>            # skriv utkastet
```
Skriptet läser `/products/<handle>.json` på Bäverbutiken och skriver
`factory/produkter/<id>.yaml` ur mallen med det som går att läsa maskinellt:
namn, id, brand, pris, jämförpris, bilder, `kalla.produkt_*` och ett ledigt
`creative_prefix`. Det STOPPAR om butiken inte är byggd, om id:t eller
prefixet redan används, eller om länken inte svarar.

Utskriften listar vad som är ifyllt och vad som återstår. Visa den listan i
chatten — den är arbetsordern för nästa steg.

### 2. Resten av produktfilen — kör på, fråga inte
Axels besked 2026-09-16: **COGS och ekonomin sköter han på annat håll.** Fyll i
`ekonomi.inkopskostnad` med talet han ger (eller det som redan står i källans
minne) och gå vidare — stanna inte upp för att be om det.

Resten skrivs av sessionen utan mellanfrågor: `vinkel.*`, `malgrupp.*`,
`beskrivning.*`, `leverantor.url`, `media.gif_*`, och `offer.paket` som
nivåerna 1 / 2 / 4 med mitten förvald. Copyn skrivs av en subagent enligt
CLAUDE.md regel 6 med `docs/copy-regler.md`.

Två fält kopieras alltid ur butikens ANDRA produktfil, aldrig någon annanstans
ifrån: **`meta.page_id` och `meta.pixel_id`** — de är butikens.

Sedan: `node factory/validera.mjs factory/produkter/<id>.yaml` — grönt innan du
går vidare.

### 3. Butiksfilen: kollektionsblocket
En butik som hittills burit EN produkt hoppar över sortimentskollektionen
(`arNischbutik` i `factory/butik.mjs` → steget bokförs `hoppadOver:
enproduktsbutik`). Lägg till i `factory/butiker/<butik>.yaml`, som
`factory/butiker/tacklebay.yaml`:
```yaml
  kollektion:
    handle: sortimentet
    titel: "Sortimentet"
    beskrivning: "<p>…</p>"
```
Utan det får startsidan ingen sortimentssektion och de två produkterna hänger
löst bredvid varandra.

### 4. Bygget — ALLA produktfiler
Kör raden `ops-produkt.mjs` skrev ut, först torrt:
```
node factory/ops.mjs factory/butiker/<butik>.yaml <alla produktfiler> --resume --igen kollektion,startsida,meny,tema --dry-run
```
sedan skarpt utan `--dry-run`. De fyra `--igen`-stegen är de som byggs ur
produkterna i körningen — utan dem känner butiken inte till den nya produkten.

Läs utskriften: den nya produktens sex produktsteg ska köras (`produkt`,
`metafalt`, `lagerpolicy`, `bonus`, `paket`, `recensioner`), butiksstegen ska
stå `⏭ redan grönt` utom de fyra.

### 5. QA på riktig HTML
```
node factory/kundvy-kor.mjs <butik> <ny-produkt-id>
node factory/kontroll.mjs <butik> <ny-produkt-id>
```
**Kolla båda produkterna**, inte bara den nya: att den gamla ligger kvar i
menyn och på startsidan är hela poängen med järnregel 1. Varukorgen är en
människa i en webbläsare — skriv "inte testad", aldrig "testad".

### 6. Registret
```
node factory/register.mjs skriv-in
node factory/register.mjs <butik>/<ny-produkt-id>
```
⚠️ **Så fort butiken bär två produkter kastar ett bart butiks-id.**
`hittaPost('carashell')` svarar "matchar 2 poster — ange produktens nyckel".
Det betyder att butikens BEFINTLIGA tre rutiner slutar fungera samma natt:
deras prompt är `/notionscalercs <butik>`. Skriv om dem med `update_trigger`
till `<butik>/<gamla-produkten>` **innan** den nya produkten får en state-fil,
och rapportera det under Axels uppgifter om det inte hinns med.

### 7. Annonserna — det här sköter sig själv, utom EN sak

`/ny-annonser <ny-produkt-id>` bygger EN kampanj per marknad för just den
produkten (`{BRAND}_SE_{Produkt}` / `{BRAND}_NO_{Produkt}`) ur källans ACTIVE
creatives, allt PAUSED. Inget behöver ändras för att det ska funka i en butik
som redan har en produkt:

- **Spenden delas rätt.** Egen kampanj ⇒ egen spend-rad.
- **Domen går på rätt produkt.** `budgetrond.mjs` filtrerar kontot på
  produktens `creative_prefix` (kampanjnamnet, eller annonsnamnen när
  kampanjen heter något annat) och räknar mot **produktfilens egen**
  break-even. Produkt 2 döms aldrig mot produkt 1:s tal.
- **Briefer, leverans och översättning** går på egen hub + egna tre rutiner
  (steg 8).

⚠️ **Det enda som INTE delar sig: köpen.** Pixeln är butikens, och Metas
Purchase-event bär ingen produkt. Meta bokför köpet på den kampanj som drev
klicket — även om kunden klickade på produkt 1:s annons och la produkt 2 i
korgen. I en enproduktsbutik är det samma sak. I en tvåproduktsbutik är det
inte det. Ingen kod i repot delar upp köp per produkt (omkollat 2026-09-16:
`content_ids|product_id` ger noll träffar i `skalning.mjs`, `budgetrond.mjs`,
`ekonomi.mjs`).

**Hur stort felet blir beror bara på prisavståndet.** Ligger produkterna nära
varandra i pris och marginal (samma nisch, samma prisklass) är korskrediteringen
i brus-nivå och domen håller. Skiljer de sig mycket — t.ex. 1 129 kr mot 199 kr
— subventionerar den billigas köpvolym den dyras annonser, CPA ser bra ut, och
felet syns aldrig som ett felmeddelande.

**Regel tills Shopify-uppdelningen är byggd:** lägg bara produkter i samma
OPS-butik om de ligger i samma prisklass. Gör de inte det — läs köp per produkt
ur **Shopify** innan någon annons döms, och skriv i rapporten att du gjort det.

### 8. Rutinerna
```
/notionscalercs setup <butik>/<ny-produkt-id>
```
Produkten behöver en **egen creative hub** i Notion (två produkters briefer i
samma databas laddas upp i fel kampanj av leveransrundan) och sina **egna tre
rutiner**. Kontrollera i utskriften att den fått en EGEN minut — delar den
minut med butikens första produkt startar två nattvakter samtidigt mot det
delade OPS-kontot och båda går i Metas rate limit.

### 9. Minnet, rapporten, pushen
- `products/<butik>/<ny-produkt-id>/dna.md`, `batch-log.md`, `backlog.md` —
  samma form som `products/hemvakten/dna.md`, varje ärvd siffra märkt **ÄRVD**
  med källa och datum.
- `factory/PROCESS.md` om något nytt steg bevisades.
- Commit + push till `main`.

---

## DEFINITION OF DONE

- [ ] Butiken fanns och var byggd; produkt-id och prefix lediga
- [ ] Produktfilen skriven, `validera.mjs` grön
- [ ] Eget `creative_prefix` och eget `kalla:`-block — inget delat med butikens andra produkt
- [ ] Kollektionsblocket i butiksfilen när butiken går från en till två produkter
- [ ] Bygget kört med ALLA produktfiler + `--igen kollektion,startsida,meny,tema`
- [ ] Kundvyn grön för BÅDA produkterna; gamla produkten kvar i meny och startsida
- [ ] Registret skriver nyckeln `<butik>/<produkt>`; butikens gamla rutiner omskrivna till sin produktnyckel
- [ ] Annonserna byggda som egen kampanj per produkt, allt PAUSED
- [ ] Egen creative hub och egna tre rutiner, med en EGEN minut i schemat
- [ ] Minnet skrivet, commit + push till `main`
- [ ] Slutrapport i två listor; Axels uppgifter sist, numrerade
