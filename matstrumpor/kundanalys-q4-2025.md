# Matstrumpor.se — kundanalys: julen 2025 vs Q1 2026

**Skriven:** 2026-08-22. **Syfte:** underlag inför Q4 2026-relanseringen.
**Datakälla:** samtliga 3 407 ordrar i Shopify (matstrumpor.se) 2025-11-01 → 2026-03-31,
exporterade via Shopifys bulk-API, plus ShopifyQL-analytics (sessioner, kanaler, konvertering).
Aggregerad data ligger i `matstrumpor/data/`. Inga siffror i den här filen är uppskattade —
allt är räknat på orderdatan, utom ålder/kön som är en **förnamnsproxy** (se Metod).

---

## TL;DR

1. **Julförsäljningen var i praktiken 14 dagar: 2–17 december.** 1 270 av periodens
   1 665 ordrar (76 %) kom i det fönstret. Efter 17 dec (sista leveransdag före jul) dog allt.
   November gav bara 52 ordrar — enligt Axel (2026-08-22) för att butiken lanserades på
   riktigt först i månadsskiftet nov/dec; ordrarna 6–12 nov var förspelet. November och
   Black Friday är alltså **otestade**, inte bevisat svaga. Störst dag: 14 dec (121 ordrar).
2. **Julköparen är äldre än man tror.** Även i december var ~69 % av köparna 50+.
   Kön: 59 % kvinnor. Största segmenten: kvinnor 65+ (22 %), kvinnor 50–64 (21 %),
   män 35–49 (14 %), män 50–64 (14 %). Det här är mor-/farföräldrar och föräldrar som
   köper en rolig, ofarlig klapp — inte unga meme-köpare (under 35 = knappt 5 %).
3. **Q1-köparen blev ännu äldre och mer manlig — och köpte till sig själv.**
   65+ steg från 34 % till 40 % (kvinnor 65+ ensamt största segment: 28 %), männen från
   41 % till 44 %. Flerpacksandelen steg från 44 % till 51 % och AOV från 361 till 370 kr.
   Alla hjärtans dag-kampanj kördes ("En säker Alla hjärtans dag-idé") men **försäljningen
   toppade 24 jan–12 feb och dog 13 feb** — före själva dagen.
4. **Ingen återköpsprodukt.** Bara 10 av 1 609 julkunder (0,6 %) köpte igen i Q1.
   All tillväxt är nykund. Däremot finns nu ~3 300 kunder på listan att återaktivera i Q4.
5. **Bundle-trappan bar affären:** 1 st 5-pack 299 kr / 2 st 399 kr / 4 st 599 kr
   (+ gratis presentkort 150 kr i toppbundlen). Ätpinnarna (50 kr) lades till 3 feb och
   hamnade direkt i ~hälften av ordrarna — de höjde AOV utan att synbart sänka konverteringen.

---

## Metod och vad som INTE gick att få fram

- **Ålder/kön är en proxy via förnamn**, inte persondata från Meta. Alla förnamn med ≥2
  förekomster (349 namn, 83 % av ordrarna) klassificerades mot svenska namnkohorter
  (SCB-mönster) av tre oberoende bedömare med majoritetsröstning — alla tre var eniga om
  samtliga 349 namn. Nivåerna per åldersband har brus (en "Maria" kan vara 35 eller 70),
  men **förändringen mellan perioderna är pålitlig** eftersom exakt samma mappning använts
  på båda. Mappningen ligger i `data/names-map.json`.
- **Metas egen ålders-/könsstatistik gick inte att hämta.** Annonserna för julen 2025
  kördes inte från något ad-konto som dagens Meta-koppling når. Matstrumpor.se-kontot
  "nya kungen" (`730973156224390`) innehåller bara en gammal interaktionskampanj på
  1 373 kr utan köp. Kampanj-ID:na i ordrarnas UTM:er (t.ex. `120236400583400074`, 612
  ordrar i dec) finns inte i något åtkomligt konto. Ska Meta-demografin fram måste det
  gamla kontot återfås eller kollas manuellt i Ads Manager.
- Betalsätt säger inget här: 100 % Shopify Payments (ingen Klarna/Swish-split att läsa av).
- Ordrar under perioden: 100 % Sverige.

---

## Siffrorna per period

|  | **Jul (nov–dec 2025)** | **Q1 (jan–mar 2026)** |
|---|---|---|
| Ordrar (ej cancellerade) | 1 665 | 1 734 |
| Omsättning (inkl. frakt) | 600 523 kr | 641 732 kr |
| AOV snitt / median | 361 kr / 299 kr | 370 kr / **399 kr** |
| Unika kunder | 1 609 | 1 682 |
| Kvinnor / män (namnproxy) | 59 % / 41 % | 56 % / 44 % |
| Under 35 / 35–49 / 50–64 / 65+ | 5 / 27 / 35 / 34 % | 5 / 21 / 34 / **40 %** |
| Flerpack (≥2 st 5-pack) | 43,9 % | 50,7 % |
| Toppbundle 599 kr | ~9 % av ordrarna | ~8 % av ordrarna |
| Rabattkoder | ~0 (1 order) | 0 |
| Returer/refunds | 4 ordrar (0,2 %) | 7 ordrar (0,4 %) |
| Konvertering (sessioner → köp) | dec: 4,8 % | jan 4,2 / feb 4,3 / mar 3,7 % |
| Mobilandel av sessioner | 91 % | 93 % |

**Kanaler (orderns referrer):** Jul: Facebook 41 %, Instagram 17 %, direkt/okänt 40 %,
Google 1 %. Q1: Facebook 33 %, **Instagram 23 %**, direkt/okänt 41 %, Google 2,5 %.
(Direkt/okänt är till största delen app-trafik utan referrer, dvs. i praktiken mest Meta.)

**Tid på dygnet (Stockholm-tid, båda perioderna nästan identiska):** förmiddag 06–11 är
störst (38–40 %, peaktimme kl. 9), därefter 12–17 (33–35 %), kväll 18–23 (25 %).
*Obs: hypotesen att januari–februari skulle vara mer "eftermiddagsköp" stämmer inte —
dygnsprofilen är i princip oförändrad mellan perioderna.*

**Veckodag:** jämnt — ingen dag sticker ut åt något håll i någon period.

**Geografi (leveransadressens postnummer):** Julen var mer storstad: Storstockholm 29 %,
Storgöteborg 11 %, Malmö/Skåne väst 4,5 %. I Q1 sjönk Storstockholm till 24 % och
Norrlandsregionerna steg från ~10 % till ~14,5 %. Tolkningen: julkampanjen nådde en
bredare storstadspublik; Q1-annonserna hittade en äldre publik i hela landet.
Ingen region är svag nog att uteslutas — kör nationellt.

**Gåvosignaler i adressdata:** bara ~4 % skickade till annat namn och ~3 % till annat
postnummer än fakturaadressen — i **båda** perioderna. Julklapparna skickades alltså hem
till köparen och slogs in där; att december var gåvodriven syns i timingen och copyn,
inte i leveransadresserna.

---

## Vad som faktiskt såldes (erbjudandets historik)

- **Sushi-Strumpor, 5-par-paket, 299 kr** var hela affären (2 576 av 2 624 sålda enheter
  i julperioden). Prisstege via Kaching Bundles: 1 st = 299, 2 st = 399, 4 st = 599 kr.
  Ordertotalerna bekräftar att trappan användes exakt så: 1 716 ordrar på 299 kr,
  1 295 på 399 kr, 290 på 599 kr över hela dataperioden.
- **599-bundlen innehöll ett gratis presentkort på 150 kr** (197 utdelade). Bara 3 ordrar
  under analysperioden betalades med presentkort — bonusen kostade alltså nästan ingenting
  i inlösen under perioden, men kan ha lösts in senare.
- **"Sushistrumpor" (dubblettsida med barnvinkel, "får barn att skratta")** testades
  1–18 jan, sålde 11 st, arkiverades. Barnvinkeln bevisades aldrig.
- **Äkta ätpinnar i trä, 50 kr,** skapades 3 feb och bundlades direkt: 419 ordrar
  (ungefär hälften av alla ordrar efter 3 feb), i snitt 2,4 ätpinnar och 2,4 strumppaket
  per sådan order, AOV 445 kr mot 370 kr totalt. Ätpinne-köparen är den tydligaste
  "köper till sig själv"-signalen i hela datasetet — man bunt-köper inte ätpinnar till
  en skämtklapp.
- Donut-strumpor sålde 42 + 33 st, Pizza/Hamburgare enstaka. Fixkliniken-produkterna
  (Skrubbmattan, Multiband) låg i samma butik i december (59 + 28 enheter) men är en
  annan affär.

---

## Dagskurvan som planeringsunderlag

```
Nov 2025:  6–12 nov ~52 ordrar (förspel) → 13 nov–1 dec: 0 ordrar (butiken ännu inte
           lanserad på riktigt — Axels uppgift 2026-08-22; Black Friday därmed otestad)
Dec 2025:  2 dec 52 → 8 dec 114 → 14 dec 121 (topp) → 17 dec 78 → 19 dec 31 → julafton 3
Mellandagar–11 jan: 4–11/dag (organisk botten: nästan noll utan annonser)
Jan 2026:  upprampning från 12 jan → platå 24 jan–12 feb (44–67/dag, topp 1 feb 67)
Feb 2026:  tvärdöd 13 feb (4/dag) — FÖRE Alla hjärtans dag → svag svans 20 feb–mars
Mar 2026:  5–15/dag, sista annonsdrivna veckan ~22 mar (31), slut 31 mar
```

Tolkning: kurvan följer annonsbudgeten nästan 1:1. Organisk efterfrågan utan annonser är
~5 ordrar/dag i säsong och ~0 utanför. Det betyder också att "målgruppen" i varje period
är den målgrupp annonserna valde — skiftet mot äldre i Q1 speglar både vem som ville köpa
och vem Meta-algoritmen hittade när julmotivet försvann.

---

## Avatarerna

### Julen 2025 (nov–dec)

**1. Klappköperskan 50+ — "Eva, 63"** (~43 % av köparna: kvinnor 50–64 + 65+)
Vanligaste namnen: Maria, Anna, Eva, Lena, Karin, Gunilla, Kerstin, Birgitta.
Köper på mobilen (91 %), på förmiddagen (peak kl. 9), via Facebook-flödet. Köper oftast
1 st 5-pack (299 kr) som rolig, "säker" klapp till vuxna barn, barnbarn eller make —
en klapp som inte kan bli fel och som märks på julafton. Skickar hem till sig själv
och slår in. Kommer inte tillbaka (0,6 % återköp) — men hon kan köpa igen NÄSTA jul
om hon blir påmind.

**2. Familjemamman 35–49 — "Linda, 42"** (~13 %: kvinnor 35–49)
Namn som Linda, Jenny, Sara, Johanna, Camilla, Sofia. Julens extraköpare: klappar till
familjen, secret santa på jobbet, något kul i julstrumpan. **Det här segmentet är
julspecifikt — det försvann i Q1** (från 173 till 111 ordrar, −36 %, trots att Q1 hade
fler ordrar totalt). Vinns bara med julvinkel, inte med produktvinkel.

**3. Den roliga pappan/farfar — "Anders, 57"** (~28 %: män 35–64)
Anders, Johan, Fredrik, Magnus, Per, Mats. Köper oftare flerpack (47 % mot kvinnornas
41 %) och gärna 599-bundlen — "då är julklapparna till alla syskonen lösta". Samma
förmiddagsbeteende.

### Q1 2026 (jan–mar)

**4. Pensionärsparet som unnar sig — "Marianne & Lars, 68"** (65+ = 40 % av Q1)
Kvinnor 65+ blev ensamt största segment (28 % av alla klassificerade ordrar; Lars, Stefan,
Peter, Thomas, Inger, Marianne, Margareta, Yvonne rusade i namnlistan). Högst
flerpacksandel (54 %) och högst AOV (376 kr). Köper till sig själv och partnern —
Alla hjärtans dag-kampanjen ("En säker Alla hjärtans dag-idé") talade uppenbart till
etablerade par, inte unga. Mer utspridd över landet (Norrland +50 %), mindre storstad.
Instagram-andelen steg till 23 % — även äldre nås alltmer där.

**5. Sushiälskaren som utrustar sig — "Mikael, 55"** (ätpinne-köparen, ~50 % av ordrarna efter 3 feb)
Köper 2 strumppaket + 2–4 riktiga ätpinnar i samma order (AOV 445 kr). Det här är
självköp/hemma-sushi-identitet, inte skämtklapp. Beviset för att produkten har ett
"vi älskar sushi hemma"-segment bortom giftsäsongen.

---

## Rekommendationer inför Q4 2026

1. **Starta annonserna senast v. 46–47 (mitten av november).** Förra året lanserades
   butiken först i månadsskiftet nov/dec — hela november och Black Friday är otestade.
   Svenskarna julhandlar från Black Friday — fönstret 28 nov–17 dec är sannolikt värt
   2–3× fjolårets december om rampen börjar tidigare. Planera för att **76 % av volymen kommer på ~14 dagar** och
   att allt är över den 17–18 dec (lyft "beställ senast X för leverans till jul" som
   deadline-hook sista veckan).
2. **Gör kreativet för en 50+-publik, inte en ung meme-publik.** Tala till mor-/far-
   föräldrar och föräldrar: "årets roligaste säkra kort", "klappen som får hela bordet
   att skratta på julafton". Stor text, tydlig produkt, inga snabba klipp. Kvinna 50+
   är huvudpersonen i creative 1; "lös alla syskonklappar på ett köp" (599-bundlen) till
   männen i creative 2. Under-35 är 5 % av köparna — lägg ingen budget på TikTok-tonalitet.
3. **Behåll bundle-trappan exakt som den var** (299/399/599 + gratis presentkort i toppen)
   — den gav 44–51 % flerpack utan rabattkoder. **Lägg in ätpinnarna från dag 1** som
   +50 kr-tillägg: i Q1 tog ~hälften av ordrarna dem och AOV steg ~45 kr utan synlig
   konverteringskostnad. (Dagens pris på sajten är 399 kr för 5-pack — räkna om trappan
   innan launch så marginalerna stämmer; fjolårets siffror bygger på 299 kr.)
4. **Mejla/retargeta fjolårets ~3 300 kunder i november.** Återköpen är noll under året
   (10 st på 3 400) men det är en presentprodukt — "förra julen skrattade de åt klappen,
   här är årets" + donut/pizza som nyhet är det billigaste testet som finns. Listan finns
   i Shopify.
5. **Efter jul: byt inte målgrupp — byt vinkel.** Q1 visade att produkten lever vidare
   hos 50+/65+ som självköp och parpresent (och ätpinnarna gör erbjudandet till "hemma-
   sushi-kit"). Planera januari-kreativ mot "unna er" och sushi-kväll-vinkeln i stället
   för att jaga den yngre klappköparen som inte finns då. Notera att fjolårets
   Alla hjärtans dag-topp låg **24 jan–12 feb** — inte veckan före 14 feb.
6. **Ordna Meta-kontofrågan före launch.** Fjolårets kampanjdata (och sannolikt
   pixelhistoriken) ligger i ett konto som inte längre nås; "nya kungen" är tomt och
   CLAUDE.md flaggar kontot som UNSETTLED (obetald faktura). Betala/återfå kontot eller
   bygg om pixel + Advantage+ från noll i god tid — annars startar algoritmen utan
   fjolårets inlärning.
7. **Timing-detalj:** lägg gärna högst budgettak på förmiddagarna om ni dagsstyr något
   manuellt — peaken är kl. 8–12 alla dagar, inte kvällar/helger. (Med Advantage+/CBO
   sköter Meta det själv.)

---

## Filer

| Fil | Innehåll |
|---|---|
| `data/summary.json` | Full aggregering per period: timmar, dagar, namn, städer, regioner, produkter, bundlar, gåvosignaler |
| `data/demografi.json` | Kön/ålder-korsningen (namnproxy) inkl. AOV och flerpack per segment |
| `data/extra.json` | Dagserie, presentkorts- och ätpinne-mekaniken, prishistorik |
| `data/names-map.json` | Namn → kön/ålderskohort-mappningen (349 namn, 3 eniga bedömare) |

Rådataexporten (orders.jsonl med persondata) är **medvetet inte** incheckad.
