# Kluster `hus` — FAS 2, husets utsida i september–oktober 2026

Körning 2026-09-04. Pipeline V2.1: gate 1 → 2 → **3 (svenska hyllan)** → Temu-listningsjakt →
material → ekonomi → variant → hook → publik.

**Två tekniska begränsningar, båda redovisade som tekniska och aldrig som kommersiella domar:**

1. `temu.com` HTML är blockerad för containern (DATAVAGAR.md). Bilder och leverantörsvideo går
   inte att se på någon ny listning. **Gate 4 MATERIAL = `BLOCKED_SOURCE` på samtliga 52
   listningar** — aldrig FAIL, aldrig PASS.
2. WebSearch-budgeten tog slut efter 15 sökningar (200/200 för sessionen). Resten kördes med
   WebFetch mot Seznam (Temu-pris/betyg), Yahoo SE och Bing (svensk hylla). Två hyllkontroller
   blev därför ofullständiga och står som `PENDING_VERIFICATION`, inte som PASS.

---

## a) Objektuniversumet jag jobbade från

Utgångsläget var uppdragets lista. Jag utökade den med fem objekt som saknades och som är
nya på svenska hus de senaste fem åren (markerade **NY**).

| Objekt (ägt, står ute) | Vad ägaren behöver i sept–okt | Blev koncept? |
|---|---|---|
| Takrännan | rensa löv, hindra propp i utloppet | `lovsil-stuprorsgaller`, `teleskop-rannrensare-takmossa` |
| Stupröret | leda vattnet bort från grunden | `lovsil-stuprorsgaller` |
| Stegen | nå rännan, ha händerna fria | `stege-verktygsbricka` |
| Taket / takpannorna | mossa på norrsidan | `teleskop-rannrensare-takmossa` |
| Skorstensbeslaget | regn och fåglar i skorstenen | sökt, föll på variant (måttet) |
| Fasaden | gröna alger på norrsidan, spindelnät | `fasadtvatt-teleskopstang` |
| Altandörren / ytterdörren | drag när det blir kallt | `dorrbottenlist-drag` |
| Fönstren | höstputs innan mörkret, tätning | `fasadtvatt-teleskopstang`, `dorrbottenlist-drag` |
| Brevinkastet | drag | sökt tillsammans med dörrlisten, samma hylla |
| Garageporten | drag, löv, möss under porten | `dorrbottenlist-drag` |
| Luftvärmepumpens utedel | löv i aggregatet, regn ovanifrån | sökt, föll på hyllan |
| Ventilationen | fågel/insektsnät i huvarna | sökt, inga listningar värda att bära vidare |
| Husgrunden / dräneringen | vatten som rinner fel | `lovsil-stuprorsgaller` |
| Krypgrunden | möss som flyttar in i oktober | `musnat-ventil-krypgrund` |
| Altantrallen | löv i springorna, hal av mossa | `trall-fogrensare` |
| Entrétrappan | halt i höstregnet | sökt, föll på hyllan |
| Utebelysningen / mörkret | se var man går, sladdar ute | `utomhus-elbox-sladdskarv` |
| Elmätarskåpet / utomhusuttaget | skarvar i regn och löv | `utomhus-elbox-sladdskarv`, `sladdskarvskydd-litet` |
| Vattenutkastaren / utekranen | — | **medvetet uteslutet, se kranskyddsfällan nedan** |
| Farstukvisten | regn, lera, mörker | `altantak-pergolatak` |
| **Solcellsanläggningen på taket** (NY) | duvor under panelerna, smuts | `fagelskydd-solceller` |
| **Markisen** (NY) | rullas in för sista gången nu | `markisoverdrag-vinter` |
| **Uterummet / altantaket** (NY) | löv och alger på glastaket | `fasadtvatt-teleskopstang`, `altantak-pergolatak` |
| **Presenningarna över vedhög/möbler** (NY) | blåser av i höstblåsten | `natklamror-presenning` |
| **Friggeboden / växthuset** (NY) | tömmas, säkras mot höststorm | inga listningar med prisrymd |

**Kranskyddsfällan — vad jag avsiktligt inte gjorde koncept av.** Följande objekt-friktioner
i huskluster har sin skada i november–februari och sattes till PRESENS = FAIL innan de fick
någon sökbudget: kranskydd/frostskydd till vattenutkastaren, snörasskydd och istappsskydd,
takrännans värmekabel, taksnöraka, isrivare, snökäppar till uppfarten, halkgrusspridare,
hänglåsets frostskydd, och helöverdraget till luftvärmepumpen (som dessutom är skadligt —
en svensk luftvärmepump går hela vintern och får inte kvävas). Det är samma struktur som
gav Kranskydd Frost 420D 7 416 kr spend, ROAS 1,59 mot break-even 1,49 och en paus.

---

## b) Sökfraserna (26 körda)

**WebSearch, Google — svensk hylla (5):**
`solpanelsborste teleskop rengöring solceller villatak biltema jula clas ohlson` ·
`skyddstak luftvärmepump utedel regntak köpa pris` ·
`halkskydd altantrall trappsteg utomhus halkskyddsremsor biltema jula rusta pris` ·
`lövskydd hängränna rännskydd rulle nät biltema jula pris takränna` ·
`vattenmatad teleskopstång fönsterputs borste 6 meter köpa Sverige pris` ·
`markisöverdrag skyddsöverdrag markis vinter köpa pris Sverige` ·
`fågelskydd solceller duvor nät solpaneler pris Sverige montera själv`

**WebSearch, Google — `site:temu.com` (8):**
`water fed pole telescopic window cleaning brush 20ft` ·
`ladder bucket hook tool tray holder rung` ·
`retractable awning cover protective waterproof` ·
`outdoor extension cord waterproof cover box connection protector` ·
`roof moss removal brush telescopic scraper long handle` ·
`solar panel bird proofing mesh critter guard clips roof` ·
`deck gap cleaning tool decking groove crevice brush patio` ·
`outdoor drain cover leaf guard gutter downspout filter strainer yard`

**WebFetch mot Seznam — pris/betyg/recensioner (7):**
`site:temu.com water fed pole window cleaning solar panel` ·
`site:temu.com 20ft water fed pole kit aluminum outdoor window cleaner` ·
`temu solar panel bird and squirrel protection PVC coated mesh roll stainless steel fasteners` ·
`temu 100ft solar panel bird wire mesh guard kit proofing pigeons pest clips net 6 inch` ·
`temu outdoor extension cord safety cover waterproof protector weatherproof electrical connection box` ·
`temu large outdoor extension cord box ip54 waterproof electrical cord connection safety protector hinged lid` ·
`temu metal ladder accessories tray expandable step ladder tool platform attachment` ·
`site:temu.com chimney cap rain cover stainless steel roof flue` ·
`site:temu.com outdoor door draft stopper letterbox mail slot cover brush seal`

**WebFetch mot Yahoo SE / Bing — svensk hylla (4, varav 2 misslyckade):**
`skarvskydd utomhus kabelskarv skyddskåpa eluttag regn biltema clas ohlson` ·
`verktygshållare hink till stege stegtillbehör hylla biltema jula bauhaus` ·
`fågelskydd solceller nät klämmor pris kr per meter köp` ·
`kabelbox utomhus väderskydd förlängningssladd låsbar låda pris` (Yahoo HTTP 503, Bing gav
orelaterade träffar — därför står `utomhus-elbox-sladdskarv` som `PENDING_VERIFICATION`).

---

## c) Trattarna

### Koncept-tratten

| Steg | Kvar | Föll | Vilka som föll |
|---|---|---|---|
| Råkandidater (listningar) | 52 | — | 47 nya, 5 redan kända |
| Koncept bildade | 13 | — | |
| 1 OBJEKT | 13 | 0 | |
| 2 PRESENS | 13 | 0 | (frost-koncepten sållades bort före konceptbildning, se a) |
| **3 SVENSKA HYLLAN** | **3** | **10** | fasadtvätt-stång, stege-bricka, markisöverdrag, teleskop-rännrensare, **fågelskydd solceller**, lövsil, trall-fogrensare, dörrbottenlist, musnät, litet skarvskydd |
| 4 MATERIAL | 3 | 0 | **ej körbar — Temu blockerad, alla `BLOCKED_SOURCE`** |
| 5 EKONOMI | 2 | 1 | nätklämmor ($5 → landat 52–61 kr, svenskt pris kan aldrig nå 300 kr) |
| 6 VARIANT | 1 | 1 | altantak/pergolatak (ägaren måste mäta altanen) |
| 7 HOOK | 1 | 0 | |
| 8 PUBLIK | 1 | 0 | står som `PENDING_VERIFICATION` — inget verifierat ägartal kunde hämtas |
| **Konceptöverlevare** | **1** | | `utomhus-elbox-sladdskarv`, status `PENDING_VERIFICATION` |

**Noll koncept fick verifierad hyll-PASS.** Tio föll på gaten, tre står som
`PENDING_VERIFICATION`. Det är klustrets viktigaste resultat och det utvecklas under (e).

### Listnings-tratten

| Steg | Antal |
|---|---|
| Kandidatkoncept | 13 |
| Listningar i dem | 52 (47 nya, 5 i `kanda-goods-id.txt`) |
| Listningar hämtade från temu.com | **0** — källan blockerad |
| Pris läst ur sökutdrag (Seznam) | 8 |
| Material PASS | **0** (52 st `BLOCKED_SOURCE`) |
| Ekonomi PASS | 2 (`601102831921599`, `601101311897045`) |
| Ekonomi FAIL på läst pris | 5 |
| Bästa listning vald (material + ekonomi PASS på samma listning) | **0** — går inte förrän blocket släpper |

**Tier: A 0 · B 2 · C 7 · ELIM 43.**

---

## d) Tier B — full fältmall

Ingen Tier A. Tier A kräver PASS i alla åtta gates och egen frame-granskning av materialet;
båda är omöjliga i dag.

### B1 — Stor låsbar väderskyddad eldosa för sladdskarven ute vid huset

- **PRODUCT:** Stor UV-tålig plastlåda med låsbart lock och sju kabelgenomföringar. Skarven
  mellan förlängningssladdar, en grendosa eller en timer läggs i lådan och locket stängs.
- **TEMU URL:** https://www.temu.com/se/g-601102831921599.html
  Alternativ listning (samma koncept, IP54, gångjärnslock): https://www.temu.com/se/g-601103857379570.html
- **OBJECT / OWNER:** Utomhusuttaget, förlängningssladdarna och grendosan vid fasaden. Ägs
  redan av varje villaägare som har trädgårdsbelysning, en pump eller en motorvärmare.
- **EXISTING FRICTION:** Höstregnet och löven ligger över sladdskarven vid husväggen just nu.
  Kontakterna korroderar och jordfelsbrytaren löser ut.
- **OLD WAY:** Plastpåse och tejp runt skarven, eller en hink upp och ner över den. Ren
  improvisation — samma mönster som "presenning som blåser av" och "handduk på sätet" i
  vinnargruppen (DNA kluster 4).
- **PRODUCT'S ROLE:** Flyttar skarven från marken in i en tät låda som kan låsas. Ingen
  montering, inget elarbete.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** Sladden ligger redan där. En bild på en
  skarvkontakt i en blöt lövhög vid en husvägg är självselekterande.
- **TEMU MATERIAL:** `BLOCKED_SOURCE` — går inte att se (DATAVAGAR.md avsnitt 4).
- **0–3 SECOND PROOF:** `BLOCKED_SOURCE`. Att verifiera när blocket släpper: att sladdarna
  läggs i lådan och locket stängs inom 3 s, och att ingen inbränd utländsk text finns.
- **SWEDISH SHELF STATUS:** `PENDING_VERIFICATION`. Yahoo gav bara en Clas Ohlson-video om
  kabelskarv (en skarvhylsa, inte en låda); Bing svarade med orelaterade träffar; andra
  Yahoo-försöket gav HTTP 503. **Små** skarvskydd finns sannolikt hos Biltema och Clas Ohlson
  — det är den **stora låsbara lådan** som är obekräftad. Ad Library SE: ej kontrollerad.
- **TEMU PRICE:** **$24**, betyg **4.4**, **88 % (79 recensioner)**, i lager
  (`seznam-snippet`, 2026-09-04). Sålt-tal: UNKNOWN.
- **PLAUSIBLE SWEDISH PRICE:** 749 kr.
- **ECONOMIC ROOM:** SE-Temu-pris 167–196 kr (×6,96–8,16) → landad kostnad **251–294 kr**.
  Uppslag **2,55–2,99×** (kravet 2,4×). **BE-CPA 455 kr** (kravet 190 kr). Ligger i
  >500-kr-zonen som aldrig förlorat i kontot. Flerköpsskäl finns fysiskt: fram- och baksida
  av huset, eller huset och friggeboden.
- **VARIANT FRICTION:** En storlek. Inga mått ägaren måste ta. Ingen friktion.
- **≤7 WORD OWNERSHIP HOOK:** "Ligger dina utesladdar i löven?" (5 ord)
- **WINNER-STRUCTURE MATCH:** 54/100.
- **TOP 3 REASONS:** (1) ekonomin är den enda verifierade PASS:en i hela klustret — 749 kr,
  uppslag 2,55–2,99×, BE-CPA 455 kr; (2) old way är improvisation (plastpåsen), vilket är
  fyra av vinnarnas mönster; (3) en variant, ingen montering, noll inlärning.
- **BIGGEST REASON IT COULD FAIL:** Behovet är **latent**. Ägaren har redan löst det med en
  plastpåse och tycker inte att det är ett problem förrän något smäller — och 55 % av kontots
  förlorare krävde att annonsen först skapade behovet. Näst största risken: objektet (en svart
  plastlåda och en sladd) är för generiskt för att Meta ska hitta ägaren på bilden, alltså
  tofflor-mönstret CPM 140–220 i stället för gallerkubens 82–127.
- **CONFIDENCE:** LOW. Ekonomin är HIGH, hyllan och publiken är obekräftade.

---

## e) Lärorika avslag

### 1. Fågelskydd för solceller (Tier C, 7 listningar) — det starkaste konceptet i klustret, fällt av Amazon.se

Konceptet klarar allt utom hyllan: objektet är solcellsanläggningen på villataket (ägd,
utomhus, 100 000–200 000 kr, omisskännlig i ett Meta-flöde), friktionen är duvor och kajor
som häckat under panelerna hela sommaren och vars spillning och kvistar syns på taket nu i
september, hooken skriver sig själv — **"Har du duvor under solpanelerna?"** (5 ord) — och
ingen av de fyra kedjorna (Biltema, Jula, Clas Ohlson, Rusta) för det.

Det som fäller det: **Amazon.se säljer exakt samma form och spec** — "15 cm × 30 m solpanel
fågelskydd, vinylbelagt galvaniserat, med fästklämmor" (B0B9B3JLYM) — och Skadedjursbutiken
säljer samma kit. Marketplace räknas som hylla; kunden googlar. Ankarundantaget går inte att
åberopa, eftersom varken ankarets eller look-alikens pris kunde hämtas, och risken är exakt
den som fällde tofflor 9: ett ankare finns, men en look-alike i samma prisklass står bredvid.

*Lärdomen:* när ett objekt är nytt i Sverige (solceller) är det inte bygghandeln som hunnit
först — det är Amazon och nischade fackbutiker. Hyllkontrollen måste därför alltid gå vidare
till marketplace även när alla fyra kedjorna är tomma. **Vill Axel ändå köra det krävs ett
utläst märkesankare ≥ 1,6 × vårt pris (skadedjursfirmans installationspris eller
Skadedjursbutikens kitpris) — det talet är inte hämtat.**

### 2. Vattenmatad teleskopborste 3,6–6 m (ELIM) — dubbelfall, och andra felet är inbyggt i produkten

Rätt presens (höstputs av fönster, gröna alger på fasadens norrsida, löv på uterummets
glastak — allt fotograferbart i en svensk trädgård den här månaden) och en payoff som syns
direkt i bild. Men: CDON säljer MonsterShop 6,14 m vattenmatad fönsterputs, Amazon.se säljer
3,6/4,6/6 m med vattenanslutning, och fackhandeln (Fönsterputsredskap.se) tar 820–875 kr för
skaftet — hyllan är tagen i alla tre lagren.

Ekonomin fäller det en andra gång, och hårdare: verifierade priser **$89** (15,8 ft) och
**$110** (11,8 ft) ger landad kostnad **929–1 346 kr**, alltså långt över stoppgränsen 420 kr.
Det är inte en dålig listning utan en egenskap hos produkten — en 5–6 m aluminiumstång är
frakttung oavsett säljare. `failure_is_structural = true`; det är meningslöst att leta
alternativ listning.

*Lärdomen:* en lång stång i metall är samma sorts inbyggda ekonomiska fel som ett stålräcke.
Ta priset på **en** listning i familjen innan du lägger mer sökbudget på den.

### 3. Skyddstak till luftvärmepumpens utedel (ELIM) — hela den svenska specialisthandeln säljer formen

Objektet är klustrets bästa: över en miljon svenska hus har en luftvärmepump, utedelen står
ute, den är omisskännlig i bild och kostar 25 000–40 000 kr. Helöverdraget fälldes redan i
V2 (det kväver en pump som går hela vintern — annonsen hade skapat ett *skadligt* behov).
Skyddstaket, som inte har det problemet, faller i stället på hyllan: Bygghemma har en egen
kategori "Värmepumpsskydd", och Energifocus, Klimatshoppen, Qlimatteknik och SKVT säljer
plåttaket. Kategorin är dessutom väl positionerad i svensk sök — leverantörerna vet redan
vad de säljer, alltså finns inget titel-nytto-gap att ta marginal ur.

*Lärdomen:* när en produkt hör till en svensk installationsbransch (värmepump, solceller,
skorsten) finns hyllan i fackhandeln även när de fyra kedjorna är tomma — och fackhandeln
har ofta en extra spec som behövs i Sverige. Samma mönster som dropptråget med värmekabel.

---

## Strukturell slutsats om klustret `hus`

Tio av tretton koncept föll på gate 3, och inget enda fick verifierad hyll-PASS. Det är inte
otur — det är klustrets natur:

> **Byggnaden är svensk bygghandels hemmaplan.** Biltema, Jula, Clas Ohlson, Rusta, Bauhaus,
> Hornbach, Byggmax och Bygghemma täcker takavvattning, stegtillbehör, tätning, halkskydd,
> markisöverdrag och värmepumpsskydd i **samma form och spec**. Där kedjorna inte hunnit
> (solceller) står Amazon.se i stället.

Kontots nio vinnare är tillbehör till **maskiner, farkoster och kärl** — utombordaren,
åkgräsklipparen, IBC-tanken, spöna, trimmern. Inte till byggnader. De maskinlika objekten
vid ett svenskt hus (värmepumpen, solcellerna, laddboxen, robotklipparen, högtryckstvätten)
ligger dessutom antingen i andra kluster eller är redan avgjorda.

**Rekommendation:** lägg ingen ytterligare sökbudget på `hus` som byggnad. Den enda öppna
tråden är gate 3 på B1 (`kabelbox utomhus`, `kopplingsbox utomhus IP54` mot Biltema, Clas
Ohlson och Amazon.se) plus ett utläst ankarpris för fågelskyddet till solceller. Faller
någon av dem också är klustret stängt för säsongen.

## Vad huvudsessionen behöver köra när Temu släpper

`temu-ld.py --video` på **601102831921599** (B1) och **601103857379570** (B1:s alternativa
listning). Materialgaten avgör B1 helt: visar videon att sladdarna läggs i lådan och locket
stängs inom 3 s, utan inbränd utländsk text, är B1 klustrets enda kandidat. Hämta inte de
sju fågelskyddslistningarna förrän ankarpriset är utläst — konceptet är fällt på hyllan
tills dess.
