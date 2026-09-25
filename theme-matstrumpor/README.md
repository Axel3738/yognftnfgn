# Temat för Matstrumpor.se

Ett eget konverteringslager som gör samma jobb som ShrinePro, men skrivet från
grunden. All kod här är vår egen. Ingenting är kopierat ur ShrinePro, Impulse
eller något annat betaltema.

**Varför det här finns:** matstrumpor.se kör i dag temat
`theme-export-matstrumpor-se-shrine-2-01dec202`, som är Shrine 1.3.1. Ett eget
tema tar bort licensfrågan helt — och blir dessutom snabbare, eftersom vi bara
bygger det butiken faktiskt använder.

---

## Vad du får göra, juridiskt

Det här är hela poängen, så det står först.

| | |
|---|---|
| **Får kopieras** | Funktioner och idéer. Sticky köpknapp, paketrabatter, trygghetsikoner, nedräkning, jämförelsetabell. Ingen äger de sakerna. |
| **Får INTE kopieras** | Deras faktiska filer, deras grafik, deras namn. |

Vi har alltså byggt funktionerna, inte kopierat koden. Grunden är Shopifys eget
gratistema, som är fritt att bygga vidare på.

---

## Så är det byggt

Tre lager, och det är med flit att de går att byta ut var för sig:

```
assets/     Utseende och beteende
  ms-cro.css    designtokens + alla komponenter
  ms-cro.js     sticky köpknapp, paketväljare, leveransdatum, nedräkning
  ms-ab.js      A/B-motorn

snippets/   Själva innehållet. Här bor logiken.
blocks/     Tunna omslag så blocken går att lägga INUTI köpblocket
sections/   Tunna omslag så samma sak går att lägga som egen sektion

ab/         Avläsning av testerna
tools/      liquid-check.mjs — kontrollerar alla Liquid-filer
```

Varför både `blocks/` och `sections/` för samma sak: block kan ligga inne i
köprutan bredvid priset, sektioner kan bara ligga ovanför eller under. Vissa
saker, som paketväljaren, måste sitta bredvid knappen för att fungera. Logiken
finns bara på ett ställe — i `snippets/` — så det är ingen dubblering.

**En viktig princip:** blocken bygger aldrig ett eget köpflöde. De skriver in i
temats egna köpformulär. Sticky-knappen klickar på temats riktiga knapp. Det gör
att varianthantering, felmeddelanden och kundvagnen fungerar precis som vanligt,
och att allt överlever ett temabyte.

---

## Vad som ingår

**I köpblocket** (läggs in som block bredvid priset)

| Block | Vad det gör |
|---|---|
| Paketväljare | Korten som säljer 5-pack i stället för 3-pack. Räknar ut pris per par. |
| Säljpunkter | Bockade rader: "En storlek passar alla" |
| Trygghetsrad | Fri frakt / öppet köp / trygg betalning |
| Betalsätt | Butikens riktiga betalsätt, hämtade från Shopify |
| Leveransbesked | "Beräknad leverans 27 augusti – 3 september", räknat i arbetsdagar |
| Lagerindikator | Bara när lagret faktiskt spåras |
| Vanliga frågor | Dragspel |
| Garanti | 30 dagars öppet köp |

**På sidan** (läggs in som sektioner)

USP-rad · Rullande band · Omdömen · Jämförelsetabell · Vanliga frågor ·
Garantiblock · Fast köpknapp · **Appyta**

**Appyta** är platsen för Judge.me, Loox eller vilken annan app som helst.
Sektionen **Omdömen** tar också app-block, så en riktig recensionswidget kan
ligga ovanför de skrivna omdömena. Se `docs/appar.md` — där står också vad som
måste göras om efter ett temabyte, vilket är lätt att missa och tyst dödar
e-postinsamlingen.

---

## Ärlighetsreglerna i koden

De här är inbyggda, inte valfria. De finns för att den sortens fusk är
vilseledande marknadsföring och för att det förr eller senare kostar mer än det
smakar.

1. **Lagerindikatorn hittar inte på siffror.** Spårar produkten lager visas det
   verkliga antalet. Gör den inte det visas ingen siffra alls.
2. **Nedräkningen startar inte om vid varje besök.** Den räknar antingen till ett
   riktigt datum eller till dagens brytpunkt för packning.
3. **Paketväljaren visar aldrig ett rabattpris som kassan inte ger.** Ska
   "spara 15 %" stå där måste en riktig automatisk rabatt finnas i Shopify.
4. **"Verifierat köp" är en ruta man aktivt måste kryssa i** per omdöme.
5. **Betalikonerna hämtas från butiken**, så de kan inte visa ett betalsätt ni
   inte har.

---

## Kommandon

```bash
npm run tema:check    # kontrollerar alla Liquid-filer
npm run tema:test     # 41 tester: A/B-matematiken + produktmallen
npm run tema:grind    # båda — kör den här före uppladdning

npm run tema:shop            # verifierar att vi är inne på matstrumpor.se
npm run tema:upp -- teman    # listar temana i butiken
npm run tema:upp -- allt     # laddar upp: steg 2–7 i docs/uppladdning.md

npm run tema:one-size              # visar vilka strumpor som saknar "Storlek: One Size"
npm run tema:one-size -- --skarpt  # lägger alternativet på dem och verifierar
```

Det finns ingen byggkedja. Filerna laddas upp som de är.

Åtkomsten går via `SHOPIFY_*_MATSTRUMPOR` i environmentet, inte via Shopify-MCP:n
— den dör med jämna mellanrum. Kör `node tools/atkomst.mjs` för att se vad appen
får göra just nu.

---

## A/B-testning

Se `docs/ab-testning.md`. Kortversionen:

- Motorn ligger i temat. Ingen app, ingen månadskostnad.
- Varje besökare lottas en gång och ser samma variant vid återbesök.
- Varianten skrivs på ordern, så resultatet går att läsa i efterhand.
- Läs av med `/abtest` i chatten, eller `npm run tema:ab -- --test buybox --a 60 --b 95`.

**Innan du startar ett test, kolla att butiken har trafik nog.** Kör
`npm run tema:ab -- --planera --baslinje 0.03 --trafik <besökare per dag>`.
Får du "för långt" på alla rader är A/B-test fel verktyg just nu — bygg
förbättringen rakt av i stället.

---

## Att veta inför nästa session

- Butiken är **matstrumpor.se**, inte Bäverbutiken. Blanda inte ihop dem.
- Ägarbolag: STONEBITE ECOM AB, org.nr 5595762401.
- Märkets färger är avlästa från live-sajten: accent `#dd821d`, text `#121212`,
  typsnitt *Mochiy Pop P One*.
- Fem produkter: Sushi (3-par 369 kr / 5-par 399 kr), Pizza 449 kr,
  Hamburgare 299 kr, Donut 299 kr, Presentkort 150 kr.
- Sushi-varianterna heter `"3 - Par"` och `"5 - Par"`. Paketväljaren läser
  antalet ur variantnamnets **första ord** — döps de om slutar priset per par att
  räknas. Sedan 2026-09-17 heter de `"3 - Par / One Size"`, vilket fungerar.
- **Storlek: One Size** (Axel 2026-09-16): kunder blev osäkra på storleken när de
  bara såg 3/5 par. `tools/one-size.mjs` lägger alternativet `Storlek` med det enda
  värdet `One Size` på alla strumpor, så Dawns variantväljare visar det under
  par-valet och det följer med till varukorg och kassa. Variant-id:n rörs inte.
  **Kört skarpt 2026-09-17:** Sushi-Strumpor, Pizza, Hamburgare, Donut och den
  opublicerade dubbletten "Sushistrumpor" fick alternativet; verifierat på sajten.
- **Storleksraden** (Axel 2026-09-17, spannet 36–44 bekräftat): ett Dawn-textblock
  `ms_storlek` (stil *subtitle*) direkt under variantväljaren, före paketkorten:
  "Passar strl 36–44 – materialet är stretchigt och ger lite extra åt båda hållen."
  Ligger i `templates/product.dawn.json` som referens. Sessionens behörighetsläge
  stoppade skrivning till det publicerade temat 2026-09-17, så raden lades i en
  **opublicerad kopia**: tema `207180890451` "Matstrumpor CRO + storleksrad
  2026-09-17", verifierad via förhandslänk på alla fyra strumporna. Axel
  publicerar den i adminen. Är den publicerad: ta bort den här punkten.
  Vanliga frågor säger samma spann.
- **A/B-motorn ligger live men inga tester rullar** (avläst 2026-09-17: `tests: []`).
  Trafiken var 68 besökare/dag och 4,45 % konvertering senaste 30 dagarna — för
  lite för att mäta annat än enorma lyft. Kör `/abtest planera` innan något test.
- **Nycklarna till matstrumpor.se** ligger i environmentet som
  `SHOPIFY_SHOP_1r46tp_qx`, `SHOPIFY_CLIENT_ID_1r46tp_qx` och
  `SHOPIFY_CLIENT_SECRET_1r46tp_qx` (Axel 2026-09-17; de saknades helt dagen
  innan). `tools/shopify.mjs` läser både det namnet och `MATSTRUMPOR`. Butiken är
  `1r46tp-qx.myshopify.com`. Appen installerades på butiken 2026-09-17 och har
  sedan dess produkter, teman, ordrar och rapporter öppna (`npm run tema:shop`).
- **A/B-testet "sortval"** (Axel 2026-09-17): alla annonser till sushisidan. B-besökare
  får mixa och matcha inne i paketkorten: en dropdown per låda (två i Köp 1 – Få 1,
  fyra i Köp 2 – Få 2) med sushi/pizza/hamburgare/donut, synliga på det valda kortet.
  Kassan tar betalt för de dyraste lådorna och ger de billigaste gratis, korten
  räknar likadant. Ätpinnar följer bara med sushilådor (1 par per låda). A ser sidan
  som förut. Bygge: `ms-paket.liquid` (`mix`, `sorter`) + `ms-paket.js`
  (`mixRakna`, `inaktiv()`, koden får `-P<pinnar>`) + `ms-paket.css`. Mallen:
  `ms_paket` i `data-ms-ab="sortval:a"` med `variant: 'a'`, block `ms_sortval` i
  `sortval:b` med `variant: 'b', mix: true`; `ms_ab_tests = sortval`.
  **Shopify-sidan:** metaobjekten `mix-2`/`mix-4` (ab_variant b, måste vara ACTIVE —
  API-skapade hamnar som DRAFT) med koderna `STRUMPOR-K1F1`/`STRUMPOR-K2F2` som BAS;
  de riktiga koderna är `STRUMPOR-K1F1-P0…P2` och `STRUMPOR-K2F2-P0…P4` (en per antal
  ätpinnar), för Shopify ger de billigaste varorna gratis först och gratisantalet
  måste vara exakt vagnen minus de betalda lådorna — en kod med fast Y=3 blev "ej
  tillämplig" så fort lådorna var av olika sort. `sushi-2`/`sushi-4` står omärkta
  (ab tom) med flit: den publicerade sidan skickar ingen variant och skulle annars
  bli tom. Verifierat i Chromium 2026-09-17 (`scratchpad/e2e-mix.mjs`): pizza+sushi
  449 kr, pizza+donut 449 kr, 2 pizza+sushi+donut 898 kr, A-kontroll 399 kr — rätt
  kod på varje. Nyskapade koder tar ett par minuter innan butiken godtar dem.
  Ligger i kopian `207180890451`; förhandsvisa med `?ms_ab=sortval:a` / `:b`.
  Känt: galleriet visar sushins bilder oavsett sort.
- **Testet är LIVE sedan 2026-09-18** (Axel publicerade kopian; den är nu butikens
  publicerade tema). ⚠️ **Stämpeln föll bort på ca 3 av 7 ordrar** de första
  dygnen — köpvägar som aldrig passerar produktsidans kod. `ms-ab.js` fick
  därför `efterstampla()` 2026-09-19: vid varje sidvisning kontrolleras vagnen
  och saknad/fel stämpel skrivs om, plus en kontroll direkt efter varje köp.
  **Den fixen ligger i repot men är INTE uppladdad till det publicerade temat** —
  sessionens behörighetsläge stoppar skrivning dit. Ladda upp den innan
  avläsningen litar på stämpeln. Gamla ordrar läses via rabattkoden
  (`STRUMPOR-*-P*` = B, övriga = A), se `.claude/commands/abtest.md`.
- **Ekonomi och break-even** (2026-09-25): `tools/ekonomi.mjs` läser inköpspris,
  ordermix och break-even per paketnivå ur Shopify. Läget och de öppna frågorna
  står i `docs/matstrumpor-ekonomi.md`. ⚠️ `SHOPIFY_SHOP_1r46tp_qx` saknades i
  environmentet den dagen — då faller `tools/shopify.mjs` tillbaka på
  `MATSTRUMPOR`-appen, som bara har produkter öppna. Sätt variabeln till
  `1r46tp-qx.myshopify.com` i kommandot (exakt rad i ekonomi-dokumentet).
- Klaviyo är installerat. Rör inte dess kod.
