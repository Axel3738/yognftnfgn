# E-poststrategin — Bäverbutiken i Klaviyo

Skriven 2026-09-24 av huvudsessionen, innan första utskicket. Läses av varje
session som rör `klaviyo/` och av Axel. Motorns kontrakt är
`klaviyo/ARKITEKTUR.md`; VA:ns klick står i `klaviyo/sop/` (engelska);
kommandot är `/klaviyo` (`.claude/commands/klaviyo.md`).

**Källorna till siffrorna nedan** är kartläggningen 2026-09-24 (Shopify läst
20:18–20:20 UTC med appen `SHOPIFY_*_SE_BAVER_SE`, Klaviyo sett utifrån utan
nyckel, lagtext från lagen.nu, Klaviyos hjälpsidor) och repots egna filer.
Varje tal bär sin källa. **Inget är mätt i Klaviyo-kontot än** — ingen nyckel
fanns 2026-09-24. Allt märkt *startsiffra* är huvudsessionens val, inte en
mätning, och ska mätas om när fyra bedömbara utskick finns.

---

## 1. Syftet

Annonserna hittar kunden. Mejlen ska få kunden att köpa igen — och i dag gör
nästan ingen det:

| Mått | Värde | Källa |
|---|---|---|
| Kunder i Shopify | **8 367** (äldsta 2025-11-30, 7 653 med svensk adress) | Shopify `customers`, alla 34 sidor |
| Med e-postsamtycke `SUBSCRIBED` | **6 186** (73,9 %) · NOT_SUBSCRIBED 2 093 · UNSUBSCRIBED 36 · utan e-post 52 | `emailMarketingConsent`, räknat per kund |
| Köpare som köpt mer än en gång | **230 av 6 905 = 3,3 %** | `numberOfOrders` per kund |
| AOV, 30 dagar | **741,76 kr** (60 dagar: 631,95 kr, alltså stigande) | orders-query, 2 200 ordrar |
| Dagar mellan köp 1 och köp 2 | **median 13,0** (p25 2,0 · p75 23,3 · p90 34,0, n = 85) | ⚠️ skevt åt korta gap: appen saknar `read_all_orders`, så bara kunder vars båda ordrar ligger inom 60 dagar syns. Det riktiga medianavståndet är längre |
| Ordrar med två olika produkter | 279 av 3 732 (7,5 %) | orders-query, 60 dagar |

Kunderna köper **en** nischprodukt från en annons och kommer aldrig tillbaka.
Mejlens jobb är att sälja nästa sak i samma nisch (båt, husvagn/husbil,
trädgård/trimmer — de enda par som faktiskt köps ihop, kartläggningen
"Köpta tillsammans"), inte att "hålla kontakten".

Det är Evolve-metoden, samma som annonserna: **varje utskick har en
hypotes, varje utskick ger en skriven lärdom, och nästa utskick bygger på
lärdomen.** Ett utskick utan hypotes skickas inte.

---

## 2. De tre grupperna

| Grupp | Vad | Roll | Mätt/externt |
|---|---|---|---|
| **Flöden = pengamaskinen** | Sex automatiska serier som går av sig själva på en händelse (välkomst, övergiven kassa, webbhistorik, efter köp, vinback, sunset) | Byggs en gång, förbättras en variabel i taget | Externt: flöden ger ~41 % av e-postintäkten på 5,3 % av utskicken, intäkt per mottagare ~18× kampanjer (Klaviyo benchmarks 2026, 183 000 konton). **Inte våra data** |
| **Kampanjer = rytmen** | 3–5 koncept i veckan till ett segment, planerade | Där Evolve-loopen körs: hypotes → utskick → lärdom | Externt: placed order rate kampanj/flöde — hem & trädgård 1,34 % / 2,17 %, järnhandel 1,28 % / 1,96 %, fordon 1,03 % / 1,7 % (samma källa) |
| **Listan = tillgången** | 6 186 SUBSCRIBED, uppvärmning, sunset | Allt annat står på den. En bränd lista går inte att köpa tillbaka | Shopify-räkningen ovan |

⚠️ Klaviyo-kontot `TMFt7M` har **inga signup-formulär och formulären är
avstängda** (`form_settings.enabled: false`, mätt 2026-09-24). Enda vägen in
på listan i dag är samtycket i kassan och sajtens två Shopify-formulär
("Gå med i våran kundklubb"). Välkomstflödet får alltså låg volym tills ett
formulär finns — och ett formulär med rabatt är Axels beslut.

---

## 3. Samtyckesregeln — bara `subscribed`

**Varje kampanj går bara till profiler med `subscription: "subscribed"`.**
Det sitter i koden (`klaviyo/ARKITEKTUR.md`, järnregel 2): uppladdaren vägrar
ett kampanjsegment utan villkoret, och samma villkor ligger i varje
marknadsflödes filter.

Varför:
- **Marknadsföringslagen 19 §:** reklam via e-post till en privatperson kräver
  samtycke i förväg. Undantaget för befintliga kunder kräver tre saker samtidigt:
  kunden har inte sagt nej, reklamen gäller "egna, likartade produkter", och
  kunden fick "klart och tydligt" säga nej vid köpet. Bäverbutiken säljer 248
  olika produkter (Shopify 2026-09-24) — "likartade" håller svagt.
- **20 §:** varje reklammejl ska ha en giltig adress för att avregistrera sig.
  Motorn stoppar en mall utan `{% unsubscribe %}` (järnregel 4).
- **Varför `any` är förbjudet:** i Klaviyos spec är `consent_status` något av
  `any`, `subscribed` eller `never_subscribed`. `any` släpper in dem som aldrig
  prenumererat — i vårt fall rimligen de 2 093 NOT_SUBSCRIBED — och Klaviyo
  stoppar inte en kampanj till dem (kritik.md, rättelse 1).
- **"Aldrig köpt" (`SEG_ej_kopt`) kräver också `subscribed`:** 1 462 kunder har
  0 ordrar och fick aldrig sin adress "i samband med försäljning", så undantaget
  gäller dem aldrig (kritik.md, rättelse 2).
- **GDPR:** rätten att invända mot direktmarknadsföring är absolut (IMY). En
  avregistrering verkställs direkt; Gmail/Yahoo kräver inom 2 dagar.

Ingen importerar kontakter, ingen bygger segment med `any` eller
`never_subscribed`, ingen "lägger till köpare utan samtycke för den här gången".
Köpare utan samtycke i kategoriflöden (alternativ B) är Axels beslut och byggs
inte förrän han sagt det.

---

## 4. Leveransbarheten

**Läget 2026-09-24 (DNS läst via dns.google):**

| Sak | Läge | Vad som krävs |
|---|---|---|
| DMARC på `baverbutiken.se` | **Saknas** (`_dmarc` svarar NXDOMAIN) | `v=DMARC1; p=none;` hos Loopia. Gmail, Yahoo och Microsoft kräver DMARC för den som skickar ≥ 5 000/dygn |
| Egen avsändardomän | **Saknas** — `send.baverbutiken.se` finns inte, Klaviyo skickar från sin delade domän ("via klaviyomail.com") | Klaviyos poster för `send.baverbutiken.se` hos Loopia (NS-delegering eller 3 CNAME + TXT), upp till 48 h |
| Avsändaren i Klaviyo | **`kundsupport@baverkoppling.se`** — en domän utan MX-post. Kunder som svarar hamnar ingenstans | Byts till `kundsupport@baverbutiken.se` (brandfilen `klaviyo/brands/baverbutiken.json`) |
| En-klicks-avregistrering | Klaviyo lägger till den, men bara med autentiserad domän + `{% unsubscribe %}` i mallen (sekundärkälla, ska verifieras) | Kommer av sig själv när domänen är på plats |
| Spamgräns | Gmail: under 0,30 %, helst under 0,10 % | Vårt larm: 0,3 % (se §8) |

**Inget utskick innan DMARC och avsändaren är rättade.** Det är Axels två klick
(Loopia + Klaviyo), inte något en session kan göra.

**Uppvärmningstrappan** (Klaviyos riktlinjer, help.klaviyo.com artikel
20413890435355). Räknas från dagen för **första utskicket från den nya
domänen**, inte från ett kalenderdatum:

| Period | Segment som får kampanjer | Villkor för att gå vidare |
|---|---|---|
| Vecka 1–2 | `SEG_uppvarmning_steg1` (engagerade 30 d) | Öppningsgrad över 30 % |
| Vecka 3–4 | `SEG_engagerade_60d` | Öppningsgrad håller minst 20 % |
| Från vecka 5 | `SEG_engagerade_90d` | Vidga två veckor i taget |
| När som helst | Faller öppningsgraden under 20 % | **Tillbaka till 30-dagarssegmentet** |

Första kampanjen går till färre än 10 000 (vi har ~6 186). Frekvens enligt
Klaviyo: 30 d dagligen, 60 d upp till 3/vecka, 90 d upp till 2/vecka, 120 d
veckovis, 180 d månadsvis.

⚠️ Uppvärmningen är **det enda ställe där öppningsgraden används**, och bara
för att Klaviyos trösklar är skrivna i den. Den dömer aldrig ett mejl (§8).

**Sunset:** `SEG_oengagerade_180d` (fått ≥ 5 mejl, 0 öppningar och 0 klick på
180 dagar) exkluderas från varje kampanj och får sunset-flödet (högst 3 mejl,
Klaviyos färdiga mall). Den som inte reagerar märks och får inga fler utskick.

---

## 5. Kopplingen till creative strategy

Mejlen är inte en egen ö. De bär samma taggar som annonserna, föds ur samma
källfiler och skriver tillbaka till samma minne.

### 5a. Taggraden — på varje mejl, kampanj som flödessteg

Formatet är `taggar` i innehållsfilen (`klaviyo/ARKITEKTUR.md`,
"Innehållsformatet"), värdena ur `docs/os/ANALYSMETOD.md` → Komponenttaggarna:

| Tagg | Vad | Värden |
|---|---|---|
| `typ` | Vilken sorts test | `N` nytt koncept · `I` iteration av en annonsvinnare eller ett mejl · `IM` imitation · `M` mejlspecifikt (ingen annonsförlaga) · `S` säsong. ⚠️ I mejl betyder `M` och `S` något annat än i annonsbriefer (där messaging resp. statisk) — kontraktet i ARKITEKTUR gäller för mejl |
| `kalla` | Var idén kommer ifrån | `egen-data` · `winning-line` · `voc` · `swipe` · `gissning` |
| `kalla_ref` | Exakt fil:rad | t.ex. `products/carashell/takskyddet/dna.md:56-58` |
| `lardom` | Vilken mejllärdom det bygger på | `L-<MAIL-namn>` ur kampanjloggen, eller `null` innan första lärdomen finns |
| `avatar` | Vem det pratar med | slug ur produktens `dna.md` när listan finns, annars en mening |
| `begar` | Begäret | ANALYSMETOD:s fasta lista: `skydda-det-jag-ager` · `spara-pengar` · `spara-tid` · `slippa-krangel` · `trygghet` · `status` · `njutning` · `halsa` · `kontroll` · `tillhorighet` — så vinstbidraget går att gruppera per begär |
| `awareness` | Var i medvetandetrappan | `unaware` · `problem` · `solution` · `product` · `promo`. Följer segmentet: köpare och övergiven kassa är `product`/`promo`, prenumeranter utan köp `problem`/`solution` (Market Awareness [21:15], [1:36]: rabatt fungerar inte på den som inte vet vad produkten är) |
| `urgency` | Varför nu | `sasong` · `lager` · `pris` · `konsekvens` · `ingen` — aldrig påhittad (§10) |
| `confidence` | Hur säker | `high` · `medium` · `low` (low = gissning) |

Plus `memo` (hypotesen, en mening, aldrig tom — Evolves breakthrough memo),
`prefix` (produktens annonsprefix, samma som `/notionkorning` använder) och `kod`
(annonsens vinkelkod `PD/SP/CS/SO/GT/OB`).

### 5b. Källregeln — ett koncept föds aldrig ur tomma intet

Varje koncept pekar på en källa. Kan det inte det är det `kalla=gissning`,
`confidence=low`, och det står i memot.

**Bäverbutikens källfiler:**

| Fil | Vad den ger mejlet |
|---|---|
| `products/<id>/dna.md` | Winning/Losing DNA, bevisade vinklar, förbjudna påståenden — mejlets hook och påstående |
| `products/<id>/batch-log.md` | Vad som testats, med utfall — vad som redan är bevisat eller dött |
| `products/<id>/invandningar.md` | Kundens egna invändningar med andel — innehållet i övergiven kassa (`OB`, `kalla=voc`) |
| `products/<id>/lardomar.md`, `feedback.md`, `kommentarer.md` | Lärdomar per annons, briefrondens tre regler, kommentarskluster |
| `klaviyo/logg/baverbutiken/kampanjlogg.md` | Mejlens egna lärdomar |

⛔ **Aldrig `docs/playbook.md`, `docs/winning-lines.md` eller `docs/swipes/`** —
de bygger på Grillklinikens/Masterns data (SnarkLös-kontot, swipes med mål
`GRILL_mastern_…`). CLAUDE.md: två verksamheter, blanda dem aldrig. Metoden får
lånas, raderna aldrig.

**Täckningen 2026-09-24** (kartläggningen, "Topp 12 att bygga kampanjer på"):
av de tolv storsäljarna saknar fem DNA helt — båtmotorskyddet, bältesslipen,
sotarsetet, MC-kapellet, solcellslampan. Sju har bara en OPS-butiks fil med
ärvd Bäverbutiks-data (Taköverdraget och Termoskyddet via `carashell/`, IBC via
`tankguard/`, kameran via `hemvakten/`, spöhållaren via `tacklebay/`, damaskerna
via `drytrek/`, kalendern via `kalender/`). Siffrorna i de filerna är
Bäverbutikens källkampanjer och får användas som `egen-data`; mejl för de fem
utan fil är gissningar tills de har en.

⚠️ Två fällor i DNA-filerna, redan märkta där: kamerans `CS_2/CS_3` ("sista
chansen", "priset går upp") och termoskyddets `CS_3` ("bara idag") är **falsk
brådska** och får inte bli mejlcopy (`hemvakten/dna.md:146-149`,
`carashell/termoskyddet/dna.md:79-82`).

### 5c. Annonsvinnare blir mejlhooks

1. Läs produktens vinstbidragsranking i `dna.md` (ANALYSMETOD steg 4 — vinstbidrag,
   aldrig ROAS ensam). Annonsen som bär mest vinstbidrag är förlagan.
2. Hookens **påstående** blir ämnesrad A och hero-rubrik. Exempel ur kartläggningen:
   Taköverdragets present-vinkel `GT_2_H1` (14 köp, vinstbidrag 8 202 kr) eller
   problemet "taket du aldrig kollar" som bär mest spend
   (`products/carashell/takskyddet/dna.md:56-58,66-69`). Mejlet får `typ=I`,
   `kalla=egen-data`, `kod` = annonsens kod, och namnet bär annonsens `KOD_nr`.
3. Videons visuella hook kan inte följa med. Hero-bilden kommer ur Shopify
   (byggaren), aldrig en påhittad scen.
4. Invändningarna i `invandningar.md` blir mejlen i övergiven kassa: den största
   obesvarade först (Taköverdraget: fukt/kondens 38 %,
   `takoverdraget-husvagn/invandningar.md:18-22`), kod `OB`, `kalla=voc`.

### 5d. Mejlets lärdom skrivs tillbaka

- Lärdomen skrivs i `klaviyo/logg/baverbutiken/kampanjlogg.md` (mallen i §8e).
- Har produkten en `dna.md`: lägg en rad under rubriken `## E-post` där (skapa
  rubriken första gången), med datum, mejlnamn, etikett, lärdomen i en mening
  och om den är **bevisad** (≥ 2 utskick, grinden klarad på båda) eller
  **hypotes**. Data skild från hypotes, som resten av filen.
- Saknas `dna.md`: lärdomen stannar i kampanjloggen. Skapa ingen DNA-fil ur ett
  mejl — CLAUDE.md: en produkt utan minne briefas med `/ny-produkt`.
- Vinner en ämnesrad tydligt (etikett VINNARE eller BREAKTHROUGH) och bär ett
  begär annonserna inte testat: skriv den som koncept i produktens `backlog.md`
  med `kalla=egen-data (mejl <namn>)`. Kunskapen går åt båda hållen.

---

## 6. Evolve översatt till e-post

Citaten är ur `docs/ecomtalent/fynd.json` via kartläggningen (lektion + tid).
Kursen säger nästan inget om mejl — av 516 fynd nämner ett mejl rakt ut. Allt
här är en översättning från annonser.

| Regel för mejl | Varför (fynd) |
|---|---|
| **3–5 kampanjkoncept per vecka för hela butiken**, aldrig fler | Mar 13 [1:04:51]: "you really don't need more than five new concepts per week". Apr 24 [1:04:20]: taket är hur många lärdomar teamet hinner läsa |
| **En hypotes per utskick** (`memo`), annars inget utskick | Overview [25:53]: "what are you creating slash testing and what gives you confidence that this test will improve overall performance" |
| **Tre ämnesrader = tre begär**, testade som Klaviyo-A/B (variant A/B/C) | Feedback Loop [4:38]: "we always kind of run three variations". IMITATION [15:29]: tre rubriker, var och en mot ett eget begär |
| **Vänta på data** — läs på dag 7 efter utskicket, aldrig före attributionsfönstrets slut | How Do Ads Work? [4:41]: "at least three to seven days". Shaun & Spencer [43:43]: 7 dagar som läspunkt. Klaviyos standard är 5 dagar öppning / 5 dagar klick. **Vi ställer om till bara klick, 5 dagar, utan Apples öppningar** (Evolve-botens råd 2026-09-24, `klaviyo/evolve/SVAR.md`). Annars räknas köp från Apple-användare som aldrig öppnat. Det är Axels klick i Klaviyo → Settings → Attribution |
| **Inga fler nya koncept än skrivna lärdomar.** Vecka 1 får 3 koncept (startbatch, `status_plan: utkast-skrivs-om-efter-lardom`); därefter ≤ antalet lärdomar skrivna sedan förra veckan | Overview [6:17]: "from any ad that you run, you must learn something … you must close the feedback loop". CS-KLART punkt 8 |
| **Mixen ur etiketterna:** ingen levande mejlvinnare ⇒ 80 % nya koncept, 20 % iterationer. En BREAKTHROUGH finns ⇒ 80 % iterationer på den (nya ämnesrader, annan hero, annat segment), 20 % nytt | Dec 5 [52:17]: 80–90 % nytt utan vinnare, 80 % iteration med vinnare. CS-KLART punkt 7 |
| **Minst 1 av 5 nya koncept per vecka är `N` eller `voc`**, inte en kopia av något som redan går | Apr 24 [1:02:45]: minst 1 av 10 alltid ny research. IDEATION [0:52]: "most of our winning ads come from ideation" |
| **En imitation (`IM`) itereras aldrig** | IMITATION [0:46]: "we haven't found that much success by doing imitations". CS-KLART punkt 12 |
| **Kundens egna ord:** en enkät till köpare (koppla till lyckohjulet i `mejl/`) ger `voc` till både mejl och annonser — kräver Axels ok | Mar 13 [1:07:12]: "You can email you all of your existing customers … do like a giveaway … fill in the type form" — **det enda fyndet som nämner mejl** |
| **En människa godkänner** varje utskick innan det schemaläggs | Losing→Winning [33:23]: att låta Claude vara hela creative strategist "that's not how it works" |

---

## 7. Namnkonventionen

Samma idé som `docs/naming-convention.md`: namnet kodar variablerna så datan går
att skära per variabel, `_` mellan fält, `-` inom ett fält, döp aldrig om något
som fått data, ny version = bumpa `v{N}`. Formaten är ARKITEKTUR:s:

```
Kampanj:    MAIL_{YYYYMMDD}_{prefix}_{KOD}_{nr}_{segment}_{awareness}_{hook}_v{N}
            MAIL_20260929_Takoverdrag_PD_1_uppvarmning_problem_taket-du-aldrig-kollar_v1
Variant:    Klaviyos A/B-varianter A / B / C = de tre ämnesraderna (tre begär)
Flöde:      FLOW_{trigger}_{syfte}_v{N}              FLOW_checkout_overgiven_v1
Flödesmejl: FLOW_{trigger}_E{steg}_{KOD}_{hook}_v{N}  FLOW_checkout_E2_OB_fukt_v1
Mall:       TPL_{mejl-id}_v{N}
Segment:    SEG_{namn}                                SEG_kopare_30d
Lista:      LISTA_{namn}                              LISTA_nyhetsbrev
```

- `prefix` = produktens annonsprefix i kontot (`Takoverdrag`, `Enginecover` …),
  så mejl och annonser kan jämföras per produkt. En kampanj med flera produkter
  bär `Mix`.
- `KOD` och `nr` = annonskonceptet mejlet bygger på. Bygger det inte på en annons:
  `M` som kod och löpnummer per produkt.
- **Läs upptagna nummer** i Klaviyo, i `klaviyo/innehall/` och i kampanjloggen
  innan du numrerar (naming-convention.md: kontot ensamt räcker inte).

---

## 8. Analysmetoden för mejl

Samma princip som `docs/os/ANALYSMETOD.md`: **enmetriksdomar är förbjudna**,
datan kontrolleras först, grinden före rangordningen, rangordning på vinstbidrag.

### 8a. Datakontroll först
- Klaviyos konverteringsvärde för en kampanj stäms av mot Shopify-ordrar med
  `utm_source=klaviyo` samma dagar. Stor skillnad ⇒ flagga, döm inte.
- Levererade = mottagare − studsar. En kampanj med studsgrad över 2 %
  (*startsiffra*) är ett leveransproblem, inte ett copyutfall.

### 8b. Grinden
**Minst 3 konverteringar (Placed Order) OCH minst 500 levererade** innan någon
dom. 500 är en *startsiffra* (huvudsessionen 2026-09-24): vid 1,28 % placed order
rate (Klaviyos branschtal för järnhandel) ger 500 levererade ~6 ordrar, alltså
tröskeln 3 med marginal. Den mäts om när fyra kampanjer klarat grinden. Domar på
3–4 konverteringar är preliminära. Samma grind gäller per A/B-variant.

### 8c. Vinstbidrag

```
vinstbidrag = konverteringsvärde ÷ break_even_roas
```

- Varför: break-even-ROAS = 1 ÷ bidragsmarginalen, så värde ÷ break-even =
  kronorna som blir kvar efter varukostnaden. Motorhöljet: 1 ÷ 1,63 ≈ 61 %.
- **Utan moms** — Bäverbutiken säljer utan moms (CLAUDE.md), dra aldrig av 25 %.
- `break_even_roas` läses ur `products/products.json` (6 produkter).
  `factory/produkter/<id>.yaml` bär break-even för OPS-butikernas pris — det
  används för en Bäverbutiks-produkt bara när Axel bekräftat att det gäller.
- **Saknas break-even för någon produkt i ordrarna: vinstbidraget är "okänt,
  orsak: break-even saknas för <produkt>".** Aldrig en gissad marginal. Då
  rangordnas på konverteringsvärde per 1 000 levererade, märkt som reserv.
- Används ett erbjudande (TACKIGEN, gratisprodukt) dras dess kostnad av när den
  går att räkna; annars står det "före erbjudandekostnad".

### 8d. Rangordning, riktmärke, etiketter

- Rangordna de utskick som klarat grinden på **totalt vinstbidrag** (vad gjorde
  mest nytta) och på **vinstbidrag per 1 000 levererade** (effektivitet).
- **Riktmärket** är flödet som drar mest vinstbidrag (troligen övergiven kassa
  eller välkomst — inte mätt). Kampanjer jämförs mot det, aldrig tvärtom. Flöden
  läses på 30 dagar rullande.
- **Etiketterna** (skrivs dag 7). De fem första sätter `klaviyo/rapport.mjs`
  (`dom()`); de två sista sätter huvudsessionen i lärdomen, för de kräver omdöme
  skriptet inte har:

| Etikett | När (*startregler*, mäts om efter åtta bedömbara kampanjer) | Sätts av |
|---|---|---|
| `LARM_LEVERANS` | Spam över 0,3 % eller avreg över 1 % — oavsett grind | skriptet |
| `FOR_TIDIGT` | Under grinden (eller före dag 7) | skriptet |
| `BEDOMBAR` | Klarat grinden, men inget annat utskick av samma typ har gjort det än — ingen median att jämföra med | skriptet |
| `VINNARE` | Klarat grinden, intäkt per mottagare ≥ medianen av samma typ (kampanj mot kampanjer, flödesmejl mot flödesmejl) | skriptet |
| `FORLORARE` | Klarat grinden, under medianen | skriptet |
| `BREAKTHROUGH` | VINNARE med minst 2× medianen, och vinstbidraget känt | huvudsessionen |
| `INGEN_LEVERANS` | Studsgrad över 2 %, eller mejlet gick inte ut som planerat — utfallet säger inget om copyn | huvudsessionen |

Skriptet jämför på intäkt per mottagare; inom samma produkt och samma
break-even rangordnar det likadant som vinstbidrag per mottagare. Vid blandade
produkter avgör vinstbidraget i lärdomen, inte skriptets etikett. Innan fyra
kampanjer klarat grinden skrivs varje dom som **preliminär** och jämförs med
Klaviyos branschtal (placed order rate ovan) — som ytterram, aldrig som dom.

- **Larm, oavsett allt annat:** spamklagomål **över 0,3 %** eller avregistreringar
  **över 1 %** på ett utskick ⇒ stoppa nästa kampanj, tillbaka till
  30-dagarssegmentet, Axel pingas (VA-SOP E06). 0,3 % är Gmails gräns; 1 % är en
  *startsiffra*.
- **Öppningsgrad dömer aldrig ensam.** Apples Mail Privacy Protection registrerar
  öppningar automatiskt och blåser upp talet. Den används bara i uppvärmningen (§4).
- **Kill-linje för ett flödesmejl:** pausas bara om vinstbidraget är under noll
  efter grinden (erbjudandet kostar mer än det ger) eller vid larm — aldrig för att
  det ligger under ett mål.
- **Inkrementalitet — förslag, inte byggt:** Klaviyo tillskriver ett köp till
  mejlet om det sker inom fönstret efter en öppning eller ett klick; det bevisar
  inte att mejlet orsakade köpet. Förslaget är en slumpad holdout-grupp (10 %
  *startsiffra*) som inte får övergiven kassa och inte får en kampanj i månaden,
  så skillnaden i köp mellan grupperna kan mätas. Byggs först när Axel sagt ja,
  och hur i Klaviyo är obekräftat.
- **Diagnoskedjan:** leverans → (öppning, bara som pekare) → klick → konvertering
  per klick → intäkt per mottagare. Teardown av ämnesrad, hero, erbjudande, bild
  och knapp med taggarna — som ANALYSMETOD steg 6b.

### 8e. Lärdomen — en per utskick, i `klaviyo/logg/baverbutiken/kampanjlogg.md`

`rapport.mjs` föreslår siffrorna; **huvudsessionen skriver lärdomen**, inte skriptet.

```
### L-<MAIL-namn> — skriven <datum>, läst dag <N>
Etikett: <ETIKETT> (preliminär om 3–4 konverteringar)
Siffror: levererade · studs % · klick % · placed order rate · konverteringar ·
  konverteringsvärde · intäkt/mottagare · avreg % · spam %  — per variant A/B/C
Vinstbidrag: <kr> (värde ÷ break-even <x>) · per 1 000 levererade <kr> — eller okänt, orsak
Mot riktmärket: <flöde/median>
Planerat mot utfört: avatar, begär, awareness, urgency, segment, tid — stämde
  utskicket med briefen? Stämde det inte är det utförandet som föll, inte idén.
Vilket begär vann: <variant> — bara om varianten själv klarat grinden
Hypotes (gissning): <varför det blev så>
Nästa utskick: 1–3 konkreta (typ, segment, vad som ändras — en variabel)
Tillbaka till annonserna: <rad i products/<id>/backlog.md, eller "nej">
```

Slutar lärdomen inte med konkreta nästa utskick är den en dagbok, inte ett system
(CS-KLART punkt 4).

---

## 9. Copyreglerna för mejl

`docs/copy-regler.md` gäller varje rad. För mejl dessutom:

1. **Tre-frågorstestet** (visualisera / falsifiera / ingen annan kan säga det) på
   ämnesrader, förhandstext, rubriker och knappar. Redovisas i `tretest`; en rad
   med `false` stoppar bygget (ARKITEKTUR).
2. **Inga tankstreck** (— eller –) i kundtext, inte ens i intervall: "5-10
   arbetsdagar". Axels skäl: "det märker man direkt att det är AI".
3. **"14 dagars ångerrätt"** (enligt lag). Aldrig "30 dagars öppet köp", aldrig
   "garanti" ensamt. `mejl/konfig.json` säger fortfarande `retur_dagar: 30` —
   den är inaktuell; returfönstret är 14 dagar från mottagandet
   (`kundtjanst/brands/baverbutiken.yaml`).
4. **Leverans skrivs "5-10 arbetsdagar"**, aldrig "7–14 dagar".
5. **Inga kronbelopp i copyn.** Pris och jämförpris visas bara i produktblocken,
   som byggaren fyller ur Shopify vid varje bygge. En siffra med "kr" som inte är
   produktens pris just nu stoppar bygget.
6. **Butikens namn** står i avsändaren, loggan och sidfoten — **aldrig som
   budskapet**. Mejl om Taköverdraget och Termoskyddet (som också säljs hos
   CaraShell) namnger aldrig någon butik i brödtexten.
7. **Ingen falsk brådska.** "Bara idag", "sista chansen", "priset går upp" kräver
   en riktig orsak i `taggar.urgency`: `sasong` = ett riktigt datum (sista
   beställningsdag, §10); `lager` = bara när Shopifys lagersaldo visar det; `pris`
   = bara ett prisbyte Axel beslutat och datumsatt; `konsekvens` = vad som händer
   utan produkten (fukt i husvagnen), inte en klocka.
8. **Inga påhittade recensioner.** Citat kommer bara ur Judge.me via blocket
   `citat` (ordagrant, förnamn + initial). Finns inga försvinner blocket.
9. **Erbjudanden** bara de som står i `mejl/konfig.json → erbjudande` (TACKIGEN).
   Varje ny rabatt är Axels beslut.
10. **Modellpolicyn (CLAUDE.md regel 6):** all slutgiltig kundtext skrivs av en
    subagent med `model: "sonnet"` som får DNA-raden, hypotesen, hooken,
    formatkraven och hela `docs/copy-regler.md` + denna §9. Strategi, koncept,
    taggar och brief görs av huvudsessionen.

---

## 10. Kalendern Q4 2026

Veckodagarna kontrollerade med `date`. **Sista beställningsdag = högtiden minus
`leverans_p90_dygn` (20)** ur brandfilen — mätt i `sparning/`: bokning → första
rörelse p90 7,3 dygn + första rörelse → leverans p90 12,2 dygn. Huvudsessionens
beslut 2026-09-24; **Axels att ändra** i `klaviyo/brands/baverbutiken.json`.

| Datum | Vad | För mejlen |
|---|---|---|
| Nu–mitten okt | Båt upptagning, husvagn/husbil vinterförvaring (branschpraxis) | Taköverdrag, termoskydd, båtmotorskydd, IBC, MC-kapell: `urgency=sasong` — vintern är riktig. Sotarset inför eldningssäsongen |
| 1 okt (tor) | Dubbdäck tillåtna | — |
| 8 okt (tor) | Älgjakten i hela landet | Jaktvinklar bara med källa |
| 23 okt (fre) | Oktoberlönen (ej verifierad) | Lönehelg, inget erbjudande utan Axel |
| **19 okt (mån)** | **Sista beställningsdag fars dag** (8 nov − 20) | Present-vinkeln (`GT`, Taköverdragets `GT_2_H1`) 5–19 okt; sista-dag-mejlet 19 okt har en riktig orsak |
| 26–30 okt | Höstlov | — |
| **11 nov (ons)** | **Sista beställningsdag adventskalendern** (1 dec − 20, huvudsessionens räkning — Axel bekräftar) | Kalendern är död efter 24 dec; efter 11 nov får mejl inte lova den till 1 dec |
| 8 nov (sön) | Fars dag | Inga "hinner fram"-mejl efter 19 okt |
| 23–30 nov | Black Week (Black Friday 27 nov, Cyber Monday 30 nov, novemberlön 25 nov) | Erbjudande och rabatt = Axels beslut, planeras senast 2 nov |
| 29 nov (sön) | Första advent | — |
| **3 dec (tor)** | **Sista beställningsdag för julklappar** (23 dec − 20) | Julmejl 23 nov–3 dec; efter 3 dec får ingen text lova leverans före jul |
| 1 dec | Vinterdäckskrav | — |
| 24–26 dec | Jul | — |
| 27–31 dec | Mellandagsrea | Axels beslut |

Kartläggningen räknade "9 dec" med 10 arbetsdagar; den håller inte mot mätningen
(p90 ≈ 20 dygn från order). Vill Axel ha en "sista chansen"-rad 9 dec måste den
säga att leverans före jul inte kan garanteras.

---

## 11. Veckoloopen

Detaljerna och klicken står i `klaviyo/sop/E01-WEEKLY-LOOP.md`; kommandot är
`/klaviyo cs`. Kort:

| Dag | Steg |
|---|---|
| Måndag | `/klaviyo rapport` → läs förra veckans utskick (de som passerat dag 7) → en lärdom per utskick i kampanjloggen → `## E-post` i `dna.md` |
| Måndag | Välj 2–3 koncept (≤ antal nya lärdomar, max 5) med källa → briefer i `klaviyo/innehall/baverbutiken/BRIEFER.md` |
| Måndag–tisdag | Copy av Sonnet-subagent → kampanjfilerna → `/klaviyo bygg` → galleriet → `/klaviyo ladda-upp` (utkast) |
| Tisdag | QA (E03) → **Axels godkännande** → schemaläggning (E02) |
| Varje dag | Flöden och listhälsa, fem minuter (E05, E06) |

Inga schemalagda rutiner byggs förrän Axel säger till. Han kör det för hand först.

---

## 12. Vem gör vad — nu och sen

| Steg | Nu | Sen |
|---|---|---|
| Läsa rapporten, skriva lärdomen | Claude (`/klaviyo rapport`) | Claude skriver; VA:n läser siffrorna (E04) och flaggar larm |
| Välja koncept, brief, taggar | Claude (huvudsessionen) | Claude — det här är strategi och flyttas inte |
| Copy | Sonnet-subagent (regel 6) | Samma |
| Bygga + ladda upp som utkast | Claude (`/klaviyo bygg`, `ladda-upp`) | Claude |
| QA före utskick | Claude + Axel | **VA:n först** (E03) |
| A/B, segment, schemaläggning | Axel klickar | VA:n (E02) efter Axels ok |
| Godkännande | **Axel. Alltid.** | Axel. Alltid |
| Flödeskoll och listhälsa | Claude i rapporten | VA:n (E05, E06) |
| Rabatter, erbjudanden, Live på flöden, samtyckesgrund | Axel | Axel |

**Arvids princip:** ett steg flyttas från Claude till en människa **först när
Claude gjort det rätt tre veckor i rad** — rätt betyder QA-checklistan grön, inget
larm, i tid, och ingen rättelse från Axel. Sedan gör VA:n steget med Claude som
kontroll två veckor (*förslag*), och först därefter ensam. Stegens läge förs i
tabellen i `klaviyo/sop/README.md`. Ordningen VA:n lär sig i: E03 → E02 → E04 →
E05 → E06. Copy och strategi flyttas inte alls.

---

## 13. Beslut som väntar på Axel innan första utskicket

Ur `kritik.md` (2026-09-24). Inget skickas förrän 1–4 är besvarade.

1. **Vilka får kampanjmejl?** A: bara SUBSCRIBED (~6 186) — rekommenderas. B: A +
   köpare utan samtycke i kategoriflöden. C: alla köpare — avråds.
2. **Var kryssrutan för reklam i kassan förikryssad?** 73,9 % SUBSCRIBED är högt.
   En förikryssad ruta är inte giltigt samtycke.
3. **Avsändare och domän:** DMARC `p=none` + `send.baverbutiken.se` hos Loopia,
   avsändaren `kundsupport@baverbutiken.se` i Klaviyo.
4. **Klaviyo-planen:** gratisplanens gräns kan stoppa kampanjer som
   `Cancelled: Billing Limit` när 8 367 profiler synkas.
5. **Shopifys notis "Övergiven kassa"** stängs av när Klaviyo-flödet går live
   (annars får kunden två mejl).
6. **API-nyckeln:** Klaviyo → Settings → API keys → Create Private API Key (Full
   access), in på claude.ai som `KLAVIYO_API_KEY_BAVERBUTIKEN`.
7. **Kanal i Discord** för e-postlarm (VA-SOP E07 har en platshållare).
