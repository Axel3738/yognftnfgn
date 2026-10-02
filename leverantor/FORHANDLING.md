# Förhandla med leverantören — strategin

Skriven 2026-10-01 efter Axels ord: "jag tycker det är svårt att förhandla priser med
leverantören, och jag har ingen bra strategi". Bygger på Evolve Supply Chain Program
(`ekonomi/evolve/SUPPLY-CHAIN.md`, främst lektion 03, 05, 07, 12, 14 och 15) och Evolve Finance
modul 3 (`ekonomi/evolve/FINANCE.md`). Färdiga meddelanden på engelska: `meddelanden/`.

## Vem vi förhandlar med

**CWD**, agenten i Kina. CWD köper varorna från fabrikerna, håller vårt förbetalda lager och
skickar varje paket med YunExpress. Vi pratar med dem i Slack (`cwd-yqg1304`, kanalen
`#axel-odhner-fulfill`, Colleen och Larry). Mechile är med i kanalen.

Kursen säger tre saker om just den sortens leverantör (lektion 02, 03, 12):

- En agent som både köper och skickar **lägger marginal på både varan och frakten**. Ett lågt
  styckpris kan ätas upp av dyrare frakt. Räkna alltid på landad kostnad och be om uppdelning.
- Agenter köper åt dussintals kunder hos samma fabriker. **"Jag lovar att de får villkor själva."**
  Säger de att det inte går: fråga varför.
- Vi har alltid ett alternativ: en annan agent. Evolve rekommenderar Matedropshipping.

## Varför det är värt det (mätt 2026-10-01)

- **Vi köper in för ungefär 1,9 miljoner kr i månaden** i dagens takt (Cost per item × sålda
  enheter, snapshoten 24/9–1/10): Bäverbutiken ~818 000 kr, CaraShell ~593 000 kr, Norge
  ~182 000 kr, Matstrumpor minst ~229 000 kr, Finland ~54 000 kr.
- **1 % lägre inköpspris = ~19 000 kr i månaden. 5 % = ~94 000 kr i månaden**, drygt en miljon på ett år.
- **Varukostnaden ligger över kursens tak på 30 %** (Evolve Finance modul 3): Bäverbutiken
  (NO+DK+FI) 33,6 %, CaraShell 34,9 %, Norge 34,1 % (`ekonomi/rapporter/`).
- **Marginalen efter reklam är tunn**: 68–194 kr per ny kund på första ordern. Blir annonserna
  20 % dyrare (det händer i november) går Norge till −1 kr och Matstrumpor till 21 kr.
  Ett lägre inköpspris är den buffert som saknas.

## Var vi börjar: produkterna med störst inköp

Ur `node leverantor/inkopsvarde.mjs` (30 dagar till 2026-10-01, utan Bäverbutiken SE som inte
går att läsa i en vanlig session):

| # | Produkt | Inköp 30 dagar |
|---|---|---|
| 1 | **Taköverdraget** (CaraShell 304 316 kr, Norge 54 879 kr, Finland 22 364 kr + Sverige) | **≥ 381 559 kr** |
| 2 | Sushistrumporna (Matstrumpor) | ≥ 70 312 kr |
| 3 | IBC-tanköverdraget (Norge, + Sverige) | ≥ 28 252 kr |
| 4 | Stegstödet 2-pack (Norge, + Sverige) | ≥ 22 555 kr |
| 5 | Båtmotorskyddet (Norge, + Sverige) | ≥ 16 664 kr |

**Taköverdraget är minst hälften av allt.** En prisförhandling om bara den produkten är värd mer
än allt annat tillsammans. Kör `node leverantor/inkopsvarde.mjs --skriv` i
`/stonebite`-rutinens miljö för att få med Sverige.

## Metoden, steg för steg

### Steg 1 — Känn dina siffror innan du frågar
För varje produkt i topp 5: vad betalar vi i dag, uppdelat i **vara, frakt och packning/avgift**?
Cost per item i Shopify är bara summan. Be CWD om uppdelningen (`meddelanden/3-prisgenomgang.md`).
Utan den vet du inte var marginalen sitter, och du kan inte jämföra med en annan agent.

### Steg 2 — Skaffa en riktig jämförelse
En offert från en annan agent på samma produkt till samma länder (`meddelanden/5-jamforelseoffert.md`
— Matedropshipping, Evolves egen leverantör). **Bluffa aldrig** med en offert du inte har.
En riktig offert är det starkaste du kan ha i handen, och du behöver inte byta — bara veta.

### Steg 3 — Börja med villkor, inte pris
Kursens viktigaste råd (lektion 12): **"Negotiate flexibility, not just price."** Villkor är
lättare att få och frigör pengar direkt:
- **Frakten fakturerad varannan vecka eller en gång i månaden** i stället för direkt. Hos oss är
  frakten ofta större än varan (offertarken: t.ex. 4,00 EUR vara + 8,50 EUR frakt), så det här
  är vår största villkorsspak.
- **Betala när det skickas (pay-as-you-ship)** för förbetalt lager: vi lägger en deposition på
  volymen, CWD håller lagret och vi betalar resten när paketen går. Mastern ligger på 650 st och
  räcker 222 dagar i dagens takt (`lager/rapporter/`) — det är pengar vi betalat för länge sedan.
- Stegvis: nästa order lite längre betalningstid, nästa lite till ("7 → 10 → 14 dagar").

### Steg 4 — Pris med en prognos
Fabriker och agenter räknar kortsiktigt tills de vet att du stannar (lektion 12). Visa dem:
- vad vi köpte förra månaden (antal per produkt),
- vad vi räknar med i Q4 och Q1 (lagerplanen ger talen),
- och fråga: **"vad blir priset vid den volymen?"** och **"vad behöver ni se från oss för att
  komma till X?"** — då får du en väg dit även om svaret i dag är nej.

Mallen ur kursen: *"Med dagens villkor gör vi X. Med Net 30 och Y i pris gör vi Z."*

### Steg 5 — Defekter är pengar
Varje procentenhet färre defekter ger 3–6 % mer vinst (lektion 05). Gör så här:
1. Kundtjänsten räknar defekter **per produkt** varje månad (i dag bara per butik).
2. Skicka CWD en enkel rapport: produkt, antal, typ av fel, bilder.
3. Be om en **garantipolicy**: kredit på nästa order för defekta, eller **överleverans** med samma
   procent (5 % defekter → 5 % extra nästa gång). Mallen: `meddelanden/4-villkor.md`.
4. Använd nästa order som hävstång: *"Vi är redo att lägga nästa order, men först behöver vi en
   lösning på X."*

### Steg 6 — Timing: Q4-volymen är din starkaste kort i januari
Kanary (lektion 14–15): ett Q4-tungt bolag kommer in i januari med mycket kassa och mycket
volym. **Lägg Q1-ordern i januari, var schysst i Q1, och förhandla pris och villkor för Q2 med
Q4-siffrorna i handen.** Efter mitten av Q2 har du ingen hävstång kvar.

## Regler när du pratar med dem

- Var vänlig och förutsägbar. Betala i tid — **särskilt före kinesiska nyåret**, då betalar
  fabrikerna ut bonusar.
- Överdriv aldrig prognosen. Säg hellre lite och leverera mer.
- En fråga i taget, i skrift (Slack), med siffror.
- Fråga alltid "vad krävs för att…" i stället för att kräva.
- **Tacka nej till "garanterat lägsta pris" utan specifikation.** Kursen: det betyder ofta sämre
  material, B-batteri i stället för A, eller en billigare fraktlinje med sämre leveransgrad
  (lektion 05, 13). Be om samma spec skriftligt.
- Skicka något svenskt till de som packar våra paket före nyåret (lektion 15: "ge till
  produktionscheferna, inte bara ägaren").

## Tidplanen

| När | Vad | Meddelande |
|---|---|---|
| **Nu, oktober** | Var ligger Matstrumpors lager och hur mycket finns inför julen? | `1-matstrumpor-lager.md` |
| **Nu, oktober** | CWD:s stängning och sista beställningsdag inför kinesiska nyåret 6/2 2027 | `2-nyaret.md` |
| Oktober | Prisuppdelning på taköverdraget och topp 5, plus volympriser | `3-prisgenomgang.md` |
| Oktober | Jämförelseoffert från en andra agent | `5-jamforelseoffert.md` |
| **9–16 november** | Black Friday-beställningen (CWD 2026-10-01: "minst 1–2 veckor i förväg", Black Week börjar 23/11). Deposition + rest vid leverans är redan erbjudet (`svar.md`) | — |
| November | Villkor: frakten varannan vecka, garantipolicy | `4-villkor.md` |
| December | Betala alla fakturor, skicka julpaket till packarna | — |
| **Januari** | Den stora förhandlingen: Q4-siffrorna, Q1-order, priser och villkor för Q2 | ny, byggs på Q4-utfallet |
