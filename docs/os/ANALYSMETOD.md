# Analysmetoden — hur data läses av. Obligatorisk, får aldrig kortas ner.

Detta dokument finns för att Claude har dömt vinnare som förlorare två gånger:
först på ROAS ensam, sedan på CPA ensam. **Enmetriks-domar är förbjudna.**

**Två halvor, båda obligatoriska:** steg 1–6 rangordnar med siffror (vem tjänade
pengar). Steg 6b river isär creativen (vad i den orsakade det). Siffrorna talar
om vad du ska göra mer av — bara teardownet talar om hur nästa brief ska skrivas.
En analys som stannar vid tabeller är inte creative strategy, den är bokföring.
Alla kommandon som bedömer annonser (`/cs`, `/forsta-batch`, `/checkin`) MÅSTE
följa stegen nedan i ordning, och visa tabellerna i sitt svar.

---

## Steg 0 — Hämta datan med rätt fält

Dessa fältnamn är verifierade mot MagiBorsten och fungerar på ad-nivå. Gissa
aldrig fältnamn; får du fältfel, kör `ads_get_field_context` — hitta ALDRIG på
siffror för att komma runt ett fel.

```
id, name, effective_status, amount_spent, actions:omni_purchase,
cost_per_omni_purchase, purchase_roas, omni_purchase_values, impressions,
ctr, cpm, frequency, video_play_actions, video_p50_watched_actions
```

Ogiltiga (vanlig felkälla): `spend`, `purchases`, `cost_per_purchase`.

**Hämta alltid hela kampanjen, sorterad på `amount_spent_descending`.** Att bara
titta på ett urval gör att spendfördelningen — den viktigaste signalen — försvinner.

## Steg 1 — Datakvalitetskontroll (gör FÖRE analysen)

⚠️ **`omni_purchase_values` är opålitligt i detta konto.** Verifierat 2026-08-05:
5 av 8 annonser i Motorhölje-kampanjen returnerade intäkten **100× för lågt**
(t.ex. 60,99 kr i stället för 6 099 kr). Summerar du det fältet får du skräp.

**Kontrollen, per annons:** `amount_spent × purchase_roas` ska ≈ `omni_purchase_values`.
- Stämmer det (±5 %): använd fältet.
- Stämmer det inte: **använd `amount_spent × purchase_roas` som intäkt** och
  skriv i rapporten vilka rader som var trasiga. Rapportera aldrig en AOV som
  är absurd (4 kr per order) utan att flagga den.

Räkna också: `amount_spent / actions:omni_purchase` och jämför med
`cost_per_omni_purchase`. Stora avvikelser = flagga, gå inte vidare tyst.

## Steg 2 — Signifikansgrind (FÖRE all rangordning)

Dela annonserna i två högar innan något jämförs:

| Hög | Villkor | Vad som får sägas |
|-----|---------|-------------------|
| **Bedömbara** | ≥300 kr spend **OCH** ≥3 köp | Får klassificeras |
| **För tidigt** | Allt annat | **Ingen dom.** Ingen ranking. Inga slutsatser om hook eller vinkel. |

En annons med ROAS 9,2 på 38 kr spend och 1 köp är **brus, inte en vinnare** —
den hör hemma i "för tidigt" och får aldrig användas som jämförelsenorm mot en
annons med 76 köp. Detta var felet som fick top spendern att se dålig ut.

### 2b — Marginal-CPA har en egen grind

Marginal-CPA (deltat mellan två avläsningar) är känsligare än livstidssiffran, för
Meta attribuerar köp bakåt i tiden. Det gör det senaste dygnet konstlat billigt.

**Marginal-CPA får bara räknas mellan snapshots med ≥3 dygns mellanrum OCH ≥5
inkrementella köp.** Signifikansgrinden gäller **deltat**, inte bara livstiden.

> Varför: `/cs`-körning nr 3 på axelbältet rapporterade marginal-CPA 138 kr på
> `PD_1_H1` ("accelererar, ska skalas") och 602 kr på `SO_1_H2`, och föreslog att
> flytta budget. Tre dygn senare var de verkliga talen 425 respektive 351 kr —
> **båda över break-even**, och rekommendationen var omvänd. Snapshotsen låg under
> ett dygn isär.

⚠️ Den här grinden bryts redan på flera håll i produktminnena — bland annat räknar
`products/satesoverdragaren/dna.md` marginell CPA på ett enda dygn. Litar du på en
befintlig marginal-CPA: kontrollera först hur långt isär mätningarna låg.

### 2c — Domar på 3–4 köp är preliminära

En annons som precis passerat grinden får en **preliminär** dom. Den måste överleva
nästa körning innan den skrivs in i Winning eller Losing DNA.

> Varför: "AI utan ansikte fungerar" skrevs in som BEVISAD på `PD_3_H1` med exakt
> 3 köp (+151 kr). Tre dygn senare låg annonsen på −26 kr.

## Steg 3 — Två olika linjer, inte en

Detta är den vanligaste källan till felaktiga kill-beslut:

| Linje | Vad den betyder | Vad den används till |
|-------|-----------------|----------------------|
| **Break-even-ROAS** (`break_even_roas`) | Under denna gör annonsen förlust. | **Kill-beslut.** Enda linjen som får döda en annons. |
| **Target-ROAS** (`target_roas_25pct`) | ROAS vid 25 % nettomarginal — ambitionsnivå. | Budgetallokering och skalningsbeslut. |

**Använd ROAS-tröskeln i första hand.** Den kommer ur COGS-strukturen och driver
inte när AOV rör sig. CPA-motsvarigheten (`break_even_cpa_sek` = `aov_sek /
break_even_roas`) är bekväm men måste räknas om varje gång AOV ändras — räkna om
den själv om AOV i products.json är äldre än analysperioden.

Nivåerna per produkt (Axels COGS-beräkning 2026-08-05):

| Produkt | Break-even-ROAS | Target-ROAS (25 %) | Break-even-CPA |
|---------|-----------------|--------------------|----------------|
| Motorhöljet | 1,63× | 2,74× | 210 kr |
| Axelbältet | 1,72× | 3,03× | 299 kr |
| Sätesöverdragaren | 1,47× | 2,32× | 478 kr |
| Strandtofflorna | 1,70× | 2,97× | 242 kr |
| Väggfästet | 2,00× | 4,00× | 284 kr |
| AI Glasögon | 1,34× | 2,01× | 1 395 kr |

Motorhöljet: break-even 1,63× / 210 kr, target 2,74× / 135 kr. En annons på
CPA 161 kr (ROAS 2,51) ligger sämre än target men klart över break-even och
tjänar **49 kr per order** — den ska skalas, inte dödas. **"Under target" är
ALDRIG i sig ett skäl att pausa.**

Kill-regeln: ROAS < break-even-ROAS (eller CPA > break-even-CPA), efter ≥500 kr
spend, och trenden håller i sig.

## Steg 4 — Rangordna på vinstbidrag, aldrig på en kvot

Bygg **alltid** denna tabell först, sorterad på vinstbidrag:

```
vinstbidrag = (break-even-CPA − CPA) × antal köp
```

| Annons | Spend | Andel spend | Köp | CPA | ROAS | Vinstbidrag | Andel vinst |
|--------|-------|-------------|-----|-----|------|-------------|-------------|

ROAS och CPA är **kvoter** — de säger hur effektiv en krona är, inte hur mycket
pengar annonsen tjänar. En annons kan ha dubbelt så hög ROAS och ändå bidra med
en tiondel av vinsten. Vinstbidraget är det som betalar dina räkningar.

**Verkligt exempel (Motorhölje, 14 dagar, 2026-08-05):**

| Annons | Spend | Köp | CPA | ROAS | Vinstbidrag |
|--------|-------|-----|-----|------|-------------|
| `Motorhölje_PD_1_H3` | 12 240 kr (66 %) | 76 | 161 kr | 2,51 | **3 724 kr (47 %)** |
| `Motorhölje_SP_1_H1` | 1 738 kr | 15 | 116 kr | 3,51 | 1 410 kr |
| `Motorhölje_PD_EXTRA` | 712 kr | 8 | 89 kr | 4,53 | 968 kr |
| `Enginecover_SO_5_1` | 38 kr | 1 | 38 kr | **9,22** | 172 kr (för tidigt) |

(Räknat med break-even-CPA 210 kr. Totalt vinstbidrag i kampanjen: ~7 900 kr / 14 dagar.)

Annonsen med lägst ROAS av de bedömbara är den som tjänar **mer än hälften av
alla pengar**. Att pausa den hade halverat vinsten. Annonsen med ROAS 9,22 —
som ser bäst ut i varje ROAS-sorterad vy — bidrar med under 2 % och har ett
enda köp bakom sig.

## Steg 5 — Läs spendfördelningen som en signal

Meta flyttar budget till det som konverterar i skala. Att en annons har 66 % av
spenden är algoritmens dom, byggd på fler datapunkter än du har.

- **Top spendern är benchmark**, inte en kandidat att döma mot småannonser.
  Alla andra annonser jämförs MOT den — inte tvärtom.
- **Räkna med regression:** en annons med ROAS 4,5 på 712 kr kommer nästan
  säkert att landa lägre när den får 12 000 kr. Höga kvoter på låg spend är
  delvis tur och delvis att den bästa publiken nås först. Behandla dem som
  **skalningskandidater att testa**, inte som bevisade vinnare.
- Blir top spendern verkligen sämre över tid: kolla **frequency** och trend
  (jämför 7d mot 14d) innan du drar slutsatsen — det är utmattning, inte att
  creativen var dålig.

## Steg 6 — Metrik-diagnos: VAR tappar den (snabb, video-tung)

| Steg | Metrik | Lågt värde betyder |
|------|--------|--------------------|
| Stoppar scrollen | hook rate = `video_play_actions` / `impressions` | Första sekunden/bilden fungerar inte |
| Håller kvar | hold = `video_p50_watched_actions` / `video_play_actions` | Manuset tappar dem |
| Skapar klick | `ctr` | Löftet är för svagt |
| Konverterar | köp / klick | Annons ≠ landningssida, eller fel publik |
| Kostar att nå | `cpm` | Kreativ trötthet eller smal publik |

⚠️ **Detta steg är otillräckligt ensamt.** Bildannonser saknar hook/hold helt,
och för video säger metriken bara *var* det tappar — aldrig *vad i creativen*
som orsakade det. Steg 6 är en pekare, inte en slutsats. Gå alltid vidare till
steg 6b — det är där creative strategy faktiskt sker.

## Steg 6b — Creative-teardown: VAD i creativen orsakade utfallet (OBLIGATORISKT)

**Detta är det tyngst vägande steget i hela analysen.** Metriken rangordnar;
teardownet är det enda som gör nästa brief bättre. Hoppas det över är analysen
värdelös oavsett hur snygga tabellerna är.

### Titta på creativen på riktigt

- **Bildannonser:** ladda ner bilden och **granska den visuellt** — beskriv
  layout, vad ögat träffar först, textmängd och hierarki, produktens plats i
  bilden, kontrast, om erbjudandet syns, om texten är läsbar i mobilfeed.
  Detta går alltid att göra och är därför obligatoriskt för varje bedömbar bild.
- **Videoannonser:** manuset finns redan i **vår egen brief** — normalt längre upp
  i samma chatt där CS-rundan gjordes, annars i `products/<id>/` eller
  Notion-itemet. Läs den i stället för att gissa. Saknas den helt: lista vilka
  videor det gäller och be om manusen i en samlad fråga — transkribera aldrig på
  gissning. Granska även thumbnailen.

### Tagga variablerna och koppla dem till vinstbidraget

Varje bedömbar annons taggas med variablerna nedan. Sedan grupperas
vinstbidraget per variabelvärde — det är så mönster syns över flera annonser
i stället för anekdoter per annons.

| Variabel | Exempelvärden |
|----------|---------------|
| Vinkel | problem/lösning · rädsla för kostnad · bekvämlighet · status · nyfikenhet |
| Hook-typ | fråga · påstående · siffra/pris · före-efter · negation ("sluta…") |
| Format | UGC-tal · voiceover+broll · rå leverantörsvideo · listicle-bild · jämförelse · testimonial · offer-grafik |
| Proof | recension · demo · siffra · myndighet/expert · inget |
| Offer i creativen | pris syns · rabatt · frakt · ingen offer |
| Visuell stil (bild) | textfri produktbild · text-tung · split/före-efter · kollage · grafik+produkt |
| Textmängd (bild) | ingen · ≤5 ord · rubrik+underrubrik · lång listicle |
| Talare | ingen · creator kvinna · creator man · röst utan ansikte |

Leverera denna tabell — det är den som styr nästa batch:

| Variabelvärde | Antal annonser | Total spend | **Vinstbidrag** | Slutsats |
|---------------|----------------|-------------|-----------------|----------|

### Skriv slutsatsen på briefnivå, inte på metriknivå

Fel: *"PD_1_H3 har hook rate 0,95, bra hook."*
Rätt: *"PD_1_H3 öppnar med prisjämförelse i bild inom 1 sek och visar produkten
monterad före sek 3 — de två bilderna som saknar produktdemo i första rutan
ligger båda i förlusthögen. Hypotes: produkten i användning tidigt är den
bärande variabeln, inte hook-texten. Nästa batch isolerar det."*

Slutsatsen ska gå att skriva in i en brief. Kan den inte det är den värdelös.

### Regler

1. Varje bedömbar annons får ett teardown — ingen får bara en metrikrad.
2. Bilder granskas visuellt, alltid. "Kunde inte bedöma bilden" är inte
   acceptabelt när bild-ID finns i kontot.
3. Minst **3 variabelmönster** ska pekas ut per analys, var och en kopplad till
   vinstbidrag och märkt **bevisad** (≥2 annonser, ≥3 köp vardera) eller
   **hypotes**.
4. Varje mönster ska översättas till en konkret instruktion i nästa brief.

## Steg 7 — Skriv slutsatsen så den går att ifrågasätta

Varje dom ska ha formen:

> **[Annons]** — [klassificering] · Vinstbidrag X kr (Y % av totalen) ·
> CPA Z mot break-even B och target T · Diagnos: [var i kedjan] ·
> **Beslut:** [skala / iterera / lämna / pausa] · Detta bygger på [antal] köp.

Skilj alltid **data** (det datan visar) från **hypotes** (din tolkning). Skriv
ut osäkerheten: "76 köp — stabilt" vs "1 köp — ingen slutsats möjlig".

---

## Snabbchecklista (kopiera in i varje analyssvar)

- [ ] Hela kampanjen hämtad, sorterad på spend
- [ ] Datakvalitetskontroll körd (`spend × ROAS` vs `values`), trasiga rader flaggade
- [ ] Signifikansgrind: "för tidigt"-högen utpekad och utesluten ur rankingen
- [ ] Vinstbidragstabellen visad, sorterad på vinst — inte på ROAS eller CPA
- [ ] Break-even-CPA använd för kill-beslut, target-CPA för skalning
- [ ] Top spendern behandlad som benchmark
- [ ] Metrik-diagnos: var i kedjan varje bedömbar annons tappar
- [ ] **Creative-teardown gjort per bedömbar annons** — bilder visuellt granskade,
      videomanus lästa ur våra egna briefer
- [ ] **Variabeltabellen visad** (vinstbidrag grupperat per vinkel/hook/format/proof/visuell stil)
- [ ] Minst 3 variabelmönster utpekade, märkta bevisad/hypotes, var och en översatt
      till en konkret instruktion i nästa brief
- [ ] Data skild från hypotes, antal köp angivet bakom varje dom
