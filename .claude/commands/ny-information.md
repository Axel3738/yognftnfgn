# /ny-information – Ny information mot marknadssofistikeringen (steg 4)

Argument: `$ARGUMENTS` — produkt-id (mapp under `products/`) och produktsidans URL.
Exempel: `/ny-information matstrumpor https://matstrumpor.se/products/sushi-strumpor`

Facit: Schwartz steg 4 = kunden har hört både löftet och mekanismen; det som
når henne är NY INFORMATION om världen hon lever i (forskning, marknadsdata,
beteendeskiften) som gör en gammal produkt ny igen. Exemplen i Axels prompt:
Flow Pouches ("digestion kills X % of the benefit") och 18 Chestnuts ("soup
heals the gut"). Första körningen 2026-10-01: `products/matstrumpor/ny-information.md`
är mallen, läs den innan du börjar. Syskonkommando: `/mekanismer` (steg 3).

## Gör följande, hela kedjan utan att invänta godkännande

### 1. Läs läget
Produktsidan live, `products/<id>/dna.md`, `mekanismer.md` om den finns, och
konkurrenternas rader ur annonsbiblioteket. Skriv ner vilken grupp som köper
(avatarerna i `dna.md`) — researchen handlar om DERAS värld, inte om produkten.

### 2. Tre researchagenter parallellt, var och en med egen lins
1. **Vetenskapen** om köparens beteende (för presenter: gåvopsykologi; för
   skydd: materialforskning; för kök: livsmedelsstudier …): peer review,
   universitetens pressmeddelanden, 2024–2026 först, äldst 2022, äldre bara om
   oanvänd och klassisk.
2. **Svensk marknadsdata**: HUI, Svensk Handel, PostNord, Blocket, Tradera,
   Klarna, Konsumentverket, SCB, Wolt/foodora, YouGov/Novus/Kantar/Sifo, SVT/DN.
3. **Branschen och trenderna**: marknadsrapporter med metod, leverantörers
   och konkurrenters egna ord, kulturella skiften, förpackningsforskning,
   regelverk som får nämnas.
Varje agent levererar per fynd: rubrik · källa med utgivare, exakt datum och
URL · uppgiften med talen som källan skriver dem · varför ny · hur det kopplar
till produkten som utbildande vinkel · **OVERIFIERAT** när sidan inte gick att
öppna. Luckor skrivs som en rad, aldrig fylls.

### 3. Verifiera själv innan något används
Öppna varje bärande källa med WebFetch (datum, urval, exakta tal). Studier:
DOI mot Crossref (`api.crossref.org/works/<doi>`) eller Semantic Scholar.
Det som inte går att öppna hamnar under "Hittades inte", aldrig i ett fynd.
Sidor som svarar 403 (PostNord, Etsy, Wiley) är OVERIFIERADE tills en annan
väg hittats.

### 4. Skriv fynden (8–14)
Per fynd exakt: **Källa** (utgivare, datum, URL, märk äldre än 24 månader
"(äldre, oanvänd)") · **Varför ny** (sofistikeringsgapet: vad annonsörerna
säger i stället) · **Så används den etiskt** (utbilda, väck nyfikenhet, skräm
aldrig; fakta om världen, aldrig påståenden om vår produkts material eller
kvalitet) · **Hookar**. Färskast och mest svenskt först.

### 5. Hookarna (sonnet, regel 6)
En subagent med `model: "sonnet"` får fynden som låsta fakta, förbudslistan
(butikens namn, tal som inte står i fynden eller på sidan, skrämsel, "forskare
har just upptäckt" om studien inte är 2025–2026, rader som är live) och
`docs/copy-regler.md`: 3 hookar + 1 rubrik per fynd, svenska + engelsk
betydelse, tre-frågorstestet redovisat. Landet skrivs ut i raden när siffran
inte är svensk ("i USA", "av britterna"). ⚠️ Sonnet avslutar gärna varje rad
med "Ge <produkten>" — det är en krycka: faktumet är hooken, produkten andra
takten. Skriv det i regin.

### 6. Koppla till mekanismerna och ge en testordning
Tabell mekanism (`mekanismer.md`) · ny information som bär den · vad den
ändrar. Rekommenderad testordning: det mest svenska och konkreta först, bild +
erbjudande i vinnarens layout eller ny öppning på vinnarens kropp. Brieftaket
gäller (aldrig fler briefer än lärdomar).

### 7. Skriv filen och minnet, rapportera
`products/<id>/ny-information.md` + pekare i `dna.md`. Committa och pusha.
Rapport till Axel: tabell fynd · bästa hook, de viktigaste siffrorna, vad
som INTE gick att belägga. Hans uppgifter sist, numrerade.

## Regler
- Varje siffra i en annons skrivs exakt som källan skriver den, med land och
  år när den inte är svensk och färsk.
- "Mest" kräver belägg: sushi är topp tre i takeaway-Sverige, inte "mest
  beställd" (cheeseburgaren är). Den sortens fel fälls av ett faktum.
- Forskning om relationer skrivs som konstateranden, aldrig som löften
  ("för den du skrattar med", inte "gör er närmare").
- Uppdragsgivare som säljer det undersökningen gynnar (gåvoföretag,
  marknadsplatser) nämns i fyndet.
- Klyschor utan belägg ("strumpor på sämsta-listan") går inte in, åt något håll.

## DEFINITION OF DONE
- [ ] Tre linser körda, luckor redovisade som rader
- [ ] Varje bärande källa öppnad av huvudsessionen, DOI:er kontrollerade
- [ ] 8–14 fynd med källa, datum, URL, "varför ny" och "så används den etiskt"
- [ ] Hookar av sonnet, tre-frågorstestet redovisat, bara tre ✅ i filen
- [ ] Kopplingstabell till mekanismerna + testordning
- [ ] `products/<id>/ny-information.md` + pekare i `dna.md`, committat och pushat
- [ ] Rapport till Axel med hans uppgifter sist
