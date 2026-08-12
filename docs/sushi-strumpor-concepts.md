# Sushi strumpor — research + första koncepten

> **Brand:** Matstrumpor.se · brand-kod `MATSTRUMP` · **Produkt:** sushi-strumpor (product-kod `sushi`)
> **Valuta:** SEK · **Funnel:** TOF — det här är en impuls-/presentprodukt, inte en 999-kr-övervägd
> premiumpryl. Logiken är omvänd mot Mastern: här ska bilden *stoppa scrollen och roa*, inte krossa
> en sista invändning.

## Kontoläget (viktigt — blockerare)

Färsk dragning av tillgängliga ad accounts (2026-07-24):

| Konto | ID | Status | Betalmetod | Läsning |
|-------|----|--------|-----------|---------|
| **Sushi kanske?** | `1550615276530638` | 🟢 ACTIVE (SnarkLös-business) | ❌ saknas | Nytt konto, uppenbart skapat för det här. **Kan inte spendera förrän betalkort läggs på.** |
| nya kungen (Matstrumpor.se) | `730973156224390` | ⚠️ UNSETTLED | ✅ | Obetald balans → går inte ens att läsa via API. Reglera eller överge. |

**Rekommendation:** kör på **"Sushi kanske?"** — rent konto, ingen gammal skuld, ligger i samma
business som SnarkLös (där all vår bevisade data bor). Att reglera "nya kungen" är bara värt det
om det finns pixel-/köphistorik där vi vill bygga vidare på. **Du behöver: lägga till betalmetod.**

## Vad research:en visade (Meta Ad Library, 2026-07-24)

Sökningar: "sushi socks" (SE/US/GB/DE, aktiva) + "roliga strumpor" (SE, aktiva).

| Annonsör | Vad de kör | Signal |
|----------|-----------|--------|
| **Benighty.BN03** + **Gloryboom.op** | *"Sushi Box Funny Socks – The Perfect Gift & Fun Addition to Your Wardrobe!"* — identisk copy på båda sidorna | Klassiska dropshippers. Benighty kör **4 083 annonser** totalt — sushistrumporna är en SKU i en spray-and-pray-katalog (duschmattor, örhängen, gitarrhållare...). Ingen äger nischen. |
| **svenskhusman_socks** | "Mjölkstrumpor! Skaffa alla eller din favorit", "Tradition och glädje i varje steg", "Svensk Sommar" | Närmaste svenska granne: matstrumpor med **svensk-nostalgi-vinkel** (mjölkpaketet!). 3 aktiva annonser — liten men direkt konkurrent i "mat på fötterna"-idén. |
| **Tittut Strumpan** | "Inte som vanliga strumpor" | Generisk rolig-strumpa-positionering, låg aktivitet. |

**Totalt bara ~13 träffar globalt på "sushi socks" och ~5 på "roliga strumpor" i SE.**

### Nyckelinsikter

1. **Whitespace.** Ingen dedikerad sushistrumpe-annonsör existerar. De enda som kör produkten är
   katalog-dropshippers med en (1) trött copy: *"perfect gift & fun addition"*. Ribbban för att se
   ut som ett riktigt varumärke är extremt låg.
2. **Present-vinkeln är nischens default** — den enda vinkel som körs. Den funkar säkert, men den
   är också det enda vi *inte* är ensamma om.
3. **Trust är gratis differentiering.** Konkurrenterna heter "Benighty.BN03" och skeppar från
   andra sidan jorden. Vår bevisade trust-vinkel från SnarkLös (049, högst ROAS i skala: *"du får
   exakt vad du ser, vi skickar direkt"*) transponerar rakt av: **svenskt lager, snabb frakt,
   riktig site**. Samma mekanik, ny produkt.
4. **Produkten ÄR kroken.** Hoprullade sushistrumpor som ser ut som maki-bitar är ett färdigt
   thumbstop — visuellt självbärande på ett sätt Mastern aldrig var. Statics räcker långt här.
5. **Svensk-nostalgi (svenskhusman) visar en gångbar identitetsvinkel** — men deras spår är
   tradition. Vårt är det omvända: sushi = fredagsmys/afterwork/foodie-identitet.

## Koncepten (rankade efter min conviction)

Legend conviction: 🟢 hög · 🟡 medel · ⚪ situationsanpassad

### 🟢 S1 — Makirullen (produkten som krok)
- **Namn:** `MATSTRUMP_sushi_curiosity_product_makirulle_v1`
- **Vinkel/format:** curiosity · product — hoprullade strumpor plated som äkta maki-bricka,
  ätpinnar, ingefära. Först tror ögat att det är mat.
- **Krok:** *"Zooma in. Det är strumpor."*
- **Varför jag tror på den:** produktens hela existensberättigande är förväxlingen. Ingen
  konkurrent utnyttjar den — dropshippersen kör platta produktfoton. Billigast möjliga static
  (en bra bild + en rad text) med högst inbyggd thumbstop.
- **Vad jag INTE tror:** att den bär hela funneln själv — den stoppar scrollen men säljer inte
  stängningen. Paras med S3-trust i copyn.

### 🟢 S2 — Presenten (nischens bevisade default, gjort bättre)
- **Namn:** `MATSTRUMP_sushi_offer_product_giftbox_v1`
- **Vinkel/format:** offer/benefit · product — sushilåda öppnas, strumpor istället för sushi.
- **Krok:** *"Presenten till hen som redan har allt. Utom det här."*
- **Varför jag tror på den:** enda vinkeln med extern proof (båda dropshippersen kör den = den
  konverterar tillräckligt för att spraya). Vi gör den på svenska, med bättre foto och riktig
  avsändare. Säsongsspikar: julklapp/secret santa, men "rolig present" är evergreen.
- **Vad jag INTE tror:** att engelsk dropship-copy översatt rakt av räcker — differentieringen
  ligger i utförandet.

### 🟢 S3 — Svenskt & på riktigt (trust — transponerad från vår bästa SnarkLös-vinkel)
- **Namn:** `MATSTRUMP_sushi_authority_textheavy_svensklager_v1`
- **Vinkel/format:** authority/trust · textheavy.
- **Krok:** *"Beställ idag, på fötterna till fredagssushin. Svenskt lager. Du får exakt det du ser."*
- **Varför jag tror på den:** 049-mekaniken är vår **högsta ROAS i skala** på SnarkLös och
  konkurrentbilden här är ännu mer scam-ig än i grillnischen. Låg produktionskostnad (text på
  produktbild).
- **Vad jag INTE tror:** att den vinner som första intryck på kall publik — den är lager två,
  retarget + copy-footer på S1/S2.

### 🟡 S4 — Foodie-identiteten
- **Namn:** `MATSTRUMP_sushi_identity_lifestyle_extralax_v1`
- **Vinkel/format:** identity · lifestyle — fötter på soffbordet i sushistrumpor, riktig sushi bredvid.
- **Krok:** *"För dig som alltid beställer extra lax."*
- **Varför jag tror på den:** identitet driver delningar/taggar ("det här är SÅ du") vilket sänker
  effektiv CPM på TOF. svenskhusman bevisar att identitetsspåret bär i svensk strumpnisch.
- **Vad jag INTE tror:** att den slår S1/S2 på ren konvertering — den är räckviddsspelaren.

### 🟡 S5 — UGC-reaktionen
- **Namn:** `MATSTRUMP_sushi_social_ugc_reaktion_v1`
- **Vinkel/format:** social · ugc — mobilfoto: någon öppnar "sushilådan", förvirring → skratt.
- **Varför jag tror på den:** presentprodukters kärnbevis är mottagarens reaktion. Vill egentligen
  vara video — som static: skärmdump-estetik med citat.
- **Vad jag INTE tror:** att fejkad UGC håller — behöver riktiga kundbilder, alt. körs först när
  de finns.

### ⚪ S6 — Memen
- **Namn:** `MATSTRUMP_sushi_meme_meme_umami_v1`
- **Varför jag håller igen:** meme-format kan ge extremt billig CPM men bränner ut snabbt och
  bygger inget varumärke. Testas som wildcard när S1–S3 gett baslinje, inte före.

## Min rekommendation (var vi börjar)

1. **Lås upp ett konto först** — betalkort på "Sushi kanske?" (eller reglera "nya kungen"). Innan
   dess är allt annat teori.
2. **Våg 1 = S1 + S2 + S3** (tre statics, samma produktfoto-bas): ren angle-test enligt testregeln
   — curiosity vs offer vs trust, allt annat hålls lika. Higgsfield-pipelinen i `pipeline/` kan
   återanvändas rakt av med ny brand-config.
3. **S4 som våg 2** om våg 1 hittar en CTR-vinnare. S5 väntar på riktig UGC. S6 parkerad.

## Öppna frågor innan vi bygger

- **Sortiment:** finns bara sushi-modellen, eller fler matstrumpor (jfr svenskhusmans mjölkpaket)?
  Påverkar om vi säljer "en rolig produkt" eller "ett samlarbart sortiment" (AOV-frågan).
- **Pris & fraktlöfte:** vad kostar de och skickar vi faktiskt från svenskt lager? S3 står och
  faller med att löftet är sant — vi bygger inget påstående vi inte kan bevisa.
- **Produktfoto:** finns riktiga bilder på hoprullade strumpor i sushilåda, eller genererar vi
  basen i Higgsfield och komponerar text ovanpå som för Mastern?
- **Konto:** "Sushi kanske?" eller reglera "nya kungen"? (Min rek: Sushi kanske?, se ovan.)
