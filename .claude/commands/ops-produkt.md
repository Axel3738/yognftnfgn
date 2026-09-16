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

Bevisat 2026-09-16 (CaraShell → termoskyddet), tre saker till i det här steget:
- **Källans Kaching-nivåer går inte alltid att läsa** — baverbutiken.se svarar med
  en bot-spärr på produktsidans HTML (`.json` går). Då: `offer.paket.test: "paket"`
  (standard A/B = källans nivåer för takskyddet) och skriv i filen att de inte lästes.
- **Butikens första produkt får `offer.bonus_produkt` = den nya** (handle, titel,
  pris, tom bildlista ⇒ bonus.mjs återanvänder produkten) och
  **`tillagg_kryssruta: false`** — fullpris-kryssrutan byggs bara i enproduktsläget,
  med true blir kundvyn röd på en ruta som aldrig ritas. Den nyas block lämnas tomt
  (temat bär EN korg-upsell per butik, första ifyllda handlet vinner).
- **`kalla.no_annonsprefix` bär `_NO`** (`Frontrutetrekk_NO`), annars läser
  `kampanj.mjs` "NO" som vinkel. Sätt `no_kampanjmonster` + `srt_slug` direkt.

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

**Sedan två steg körraden INTE täcker** (bevisat 2026-09-16):
1. **NOK-priset.** Prislistan "Norge" (`ekonomi.marknadspriser`) får inte produkt 2
   av sig själv — `priceListFixedPricesAdd` för den nya variantens gid, samma kurs
   som produkt 1 (API-GRANSER.md), läs tillbaka `originType: FIXED`.
2. **Norskan.** Kör `node factory/oversattning.mjs <butiksfil> <alla produktfiler>`,
   jämför nya sv-nycklar mot nb-filen OCH ändrade värden mot `git show
   HEAD:…/oversattning-sv.json` (hero, berättelse, statement, meny byts när
   butiken blir tvåprodukts), låt en subagent (sonnet) skriva bokmål för exakt de
   nycklarna, slå ihop, och kör `--igen oversatt`. Steget är grönt i state och
   hoppas annars över — och /nb visar svenska på allt nytt.

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
⚠️ **Så fort butiken bär två produkter kastar ett bart butiks-id** — om inte
butiksfilen pekar ut vilken produkt det betyder. Butikens BEFINTLIGA tre
rutiner har prompten `/notionscalercs <butik>` och ligger ofta på ett ANNAT
Claude-konto än sessionen (CaraShell: `list_triggers` här var tomt
2026-09-16), så de går inte att skriva om härifrån. Därför, **i samma steg**:
sätt `butik.huvudprodukt: <gamla-produktens-id>` i `factory/butiker/<butik>.yaml`
(Axels beslut 2026-09-16: de gamla rutinerna är den gamla produktens, den nya
får egna). `hittaPost('<butik>')` löser då upp till den gamla produkten och
rutinerna fortsätter gå orörda; den nya produkten nås bara på
`<butik>/<ny-produkt-id>`. Kontrollera med `node factory/register.mjs <butik>`
— raden `Huvudprodukt: ja` ska stå på den gamla produkten. Utan fältet kastar
uppslagningen med ett tips om fältet, och rutinerna stannar samma natt.

Egen rutinplats åt produkt 2: `node factory/rutin.mjs --tider <butik>/<ny-produkt-id>
--flerprodukt --skriv-in`. Utan `--flerprodukt` ärver nyckeln butikens minut och
två nattvakter startar samtidigt mot det delade kontot.

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
rutiner**. ⚠️ `tools/notion-hub.mjs` kräver en föräldersida som integrationen är
inbjuden till — 2026-09-16 såg "Bäverbutiken RUTINER" inga sidor alls, bara
hubbrader, så hubben blev Axels klick (duplicera butikens hub i Notion, döp om
till `<Brand> <Produkt> creative hub`, `•••` → Connections → Bäverbutiken
RUTINER), sedan `node factory/register.mjs notion <butik>/<produkt> <id>`.
Bygg inte rutinerna före hubben: nattvakten larmar "hub saknas" varje natt och
leveransrundan har inget att läsa. Kontrollera i utskriften att den fått en EGEN minut — delar den
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
