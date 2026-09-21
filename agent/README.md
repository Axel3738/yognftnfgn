# `agent/` — dagens rond på annonskontot

Det här är den automatiska versionen av Bäverpanelens dagliga runda.
Den läser Meta, räknar ut vad panelens regler säger, och lämnar ett förslag.

**Den ändrar ingenting själv.** Varje ändring kräver att Axel säger ja.

## Så körs den

Skriv `/rond` i Claude Code. Kommandot ligger i `.claude/commands/rond.md`
och beskriver hela flödet steg för steg.

Vill du bara se om koden funkar, utan att hämta ny data:

```bash
node agent/rond.mjs          # rapport i terminalen
node agent/rond.mjs --json   # samma sak som maskindata
npm test                     # 69 tester, ska vara gröna
```

## Filerna

| Fil | Vad |
|---|---|
| `besked.mjs` | Beslutsmotorn. All matematik. Inga API-anrop, inget Claude. |
| `spendtjuv.mjs` | Spendtjuvsspärren. Avgör om en kampanj som går back bärs av ett par olönsamma annonser — då pausas de i stället för hela kampanjen. |
| `logg.mjs` | Läser och skriver budgetloggen. Räknar dagar sedan ändring och back-dagar i rad. |
| `rond.mjs` | Kör ihop det: kontroller, dom per kampanj, färdig rapport. |
| `produktkarta.json` | Vilka kampanjer som är test respektive drift. Sanningskällan. |
| `budgetlogg.jsonl` | Minnet. En rad per beslut, aldrig redigerad i efterhand. Färskaste kopian bor inbäddad i dashboard-artefakten (schemalagda körningar kan inte pusha till git); `minne.mjs` synkar. |
| `minne.mjs` | Läser tillbaka budgetloggen och filutkorgen ur dashboardens HTML. Källan med flest rader vinner. |
| `utkorg/` | Filbrygga: minnesfiler från schemalagda batchkörningar väntar här (inbäddade i dashboarden) tills en push-session committar dem och tömmer mappen. Gitignorerad. |
| `kontodata.json` | Dagens siffror ur Meta. Skrivs om varje rond, ligger inte i git. |
| `test/` | Testerna. |

## Varför koden räknar och inte Claude

Tre regler i CLAUDE.md finns för att en tidigare chatt gjorde fel:
ingen dom under 300 kr spend eller 3 köp, aldrig ranka på en enda siffra,
och hitta aldrig på data. Ligger räkningen i kod blir svaret detsamma varje
gång och går att testa. Claudes jobb är att hämta rätt siffror och lämna
dem oförändrade — inte att bedöma dem.

## Annonsnivån (sedan 2026-09-20 — Axels fyra ur Evolve-materialet)

**Bakkatalogen är etiketterad** (2026-09-21, `agent/etikett-backfill.mjs
--konto SE|NO|alla [--torr] [--cache <prefix>]`): 1 682 SE + 664 NO annonser
med komplett sjudagarsfönster, rader med `backfill: true`, rapport i
`agent/utdata/etiketter-backfill-2026-09-21.md`. Där budgethistoriken saknas i
fönstret (budgetloggen börjar 2026-08-28) står `osaker_breakthrough: true` —
aldrig gissat uppåt. Etikettraden bär sedan samma dag `utford_som_briefad`
(`ja`/`nej`/`okänd`) — sessionen läser den live creativen mot briefen.
Briefspärren (regi rad för rad + komponenttaggar) ligger på `main`:
`tools/briefgranskning.mjs --rad/--manifest`, mallen `docs/os/BRIEF-REGI.md`.

**Lärdomen (`agent/lardom.mjs`, 2026-09-21 — Axels definition av klart,
`docs/os/CS-KLART.md`):** ingen annons är klar förrän lärdomen är skriven.
`--skelett` ger ett block per ETIKETT-rad utan LARDOM-rad med datan ifylld
(batch, utfall, spend annons/kampanj i samma fönster, hookar med hook/hold
rate, ROAS/CPA, konverteringsgrad, planerat mot utfört per komponent);
`--skriv` validerar (hypotes märkt gissning, konkreta nästa annonser) och
skriver `products/<id>/lardomar.md` + LARDOM-raden; `--brief` loggar varje
brief som BRIEF-rad med `lardom=L-…`, typ, parent, koncept och
iterationsnummer räknat ur loggen; `--status` ger rapportens rader. `rond.mjs
annonsbehov` läser den: `brieftak` (briefer ≤ lärdomar sedan förra batchen),
`mix` (80/20 ur etiketterna) och behovet `vidarebygg` (tre iterationer inom
14 dagar på en levande breakthrough). LARDOM/BRIEF/VIDAREBYGG_KLAR bär aldrig
`ny_budget`.

**UGC-förslaget (`agent/ugc.mjs`, CS-KLART punkt 20–22):** `--deadlines`
räknar säsongstopparna baklänges (tre veckors ledtid + två veckors test —
Black Friday 2026-11-27 ⇒ beställ senast 2026-10-23, för sent efter
2026-11-06) och larmar när ≤ 14 dagar återstår utan `UGC_BESTALLD`;
`--kandidater` prövar de tre villkoren per kampanj (bevisad vinnare ·
skalas sannolikt om fyra veckor · lärdomen säger att tro/auktoritet/tillit
saknas); `--bestallning <json>` skriver det färdiga engelska meddelandet
till Lovely (vinnaren, komponenterna, manuset, vad som måste synas på
kameran, deadline, Evolve-receptet vid flera videor). Rutinen beställer
aldrig själv. Etiketterna körs även för CaraShell-kampanjerna i DK/UK-kontona
(`etikett-backfill.mjs --konto spegel`, punkt 26).

Bakgrund: `docs/ecomtalent/SKALNINGSKUNGEN-FORSLAG.md` på `main`. Budgetmotorn
var inte problemet, annonsnivån var det. Fyra saker byggdes, i den ordning
Axel bad om:

1. **Klick-attribution.** Alla tre Meta-anropen med
   `action_attribution_windows: ["7d_click"]`; `rond.mjs` varnar när
   kontodatan saknar `attribution: "7d_click"`. Mätt 2026-09-20: 1,7 % på
   kontonivå, 18,6 % på Fiskespöhållaren.
2. **Etiketten dag 7** (`agent/etikett.mjs`): BREAKTHROUGH / SPEND_WINNER /
   KPI_WINNER / LOSER / INGEN_LEVERANS per annons, räknat på annonsens egna
   första vecka, med `bedombar` (300 kr / 3 köp) bredvid. Loggkod `ETIKETT`.
   Breakthrough-frekvensen `node agent/etikett.mjs --frekvens`, alltid som
   "3/21 (14 %)". Etiketten är ingen dom.
3. **Spendtjuven i gröna kampanjer** (`spendtjuv.mjs`, `lage: "gron"`):
   Axels grind — ≥ 300 kr och ≥ 3 köp under break-even, eller 0 köp över
   3 × break-even-CPA — mot en namngiven lista; nåd för etiketterad
   BREAKTHROUGH, takad; orsakskod per tjuv. Trappan behåller sin gamla grind.
4. **Mjuk manuell zon** (`besked.mjs`, `MANUELL_SANK`): över taket 4 000 kr
   ger förlust −20 % samma morgon, aldrig under taket, aldrig paus, larm.
   Kapning till 4 000 i ett steg avvisades av Axel.

## Spärrarna

- **Bara ett konto.** Ronden vägrar köra mot annat än MagiBorsten
  `1867947880635861`. Grillkliniken stoppas med ett felmeddelande.
- **Ingen dom utan break-even.** Står det `BE ROAS TBC` i kampanjnamnet
  säger ronden det rakt ut i stället för att gissa.
- **Ingen dom under grinden.** Under 300 kr spend eller 3 köp på tre dagar
  rörs ingenting.
- **Högst en ändring var tredje dag** per kampanj, räknat ur budgetloggen.
  Undantag uppåt: skalningszonen + ROAS ≥ 3 = snabbspår, får höjas dagligen
  (Axels beslut 2026-08-29). Aldrig snabbspår neråt.
- **Aldrig mer än 20 % åt gången** — utom **raketspåret**: ROAS ≥ 5 i
  skalningszonen höjer ×1,8 ("nästan dubbla", Axels beslut 2026-08-30;
  faktorn är ett antagande — säg till om det ska vara exakt 2,0).
  Kontospärren (+20 % total) släpper igenom exakt raketernas förklarade del.
  Avrundningen till jämna 50 kr går nedåt vid höjning och uppåt vid sänkning,
  så steget aldrig blir större än faktorn.
  (Bäverpanelens egen avrundning bryter mot den regeln: 605 → 750 kr är +24 %.)
- **Golv 500 kr, tak 4 000 kr.**
- **En testprodukt som går plus rörs aldrig** — testbudgeten ligger kvar tills
  den bevisat sig eller gått back. Tunn plusmarginal på en ny produkt är ett
  prisproblem, inte ett budgetproblem. (Axel 2026-08-29.)
- **Ändrad break-even utlöser aldrig ensam en sänkning.** Rättas kalkylen i
  efterhand (ny COGS) fryses kampanjen och PRISET åtgärdas först — annonser
  som säljer bra på fel kalkyl ska inte straffas. Frys: `frys_till` +
  `frys_motivering` i `produktkarta.json`, tinar av sig själv på datumet.
- **Spendtjuvsspärren går före varje avstängning.** Innan trappan stänger av en
  kampanj räknar `spendtjuv.mjs` bort de annonser som tagit ≥10 % av spenden på
  en ROAS minst 10 % under break-even. Ligger resten av kampanjen ÖVER
  break-even (och är själv bedömbar: ≥300 kr, ≥1 köp) pausas bara tjuvarna —
  kampanjen lever vidare. Taket är tre räddningar per 14 dagar.
  *(Axels larm 2026-09-14: den gamla kollen krävde en spendtjuv med noll köp.
  Övervakningskameran och Adventskalendern Racingbilar stängdes av samma morgon
  fast två–tre annonser med köp åt 89 % av spenden långt under break-even —
  resten låg på ROAS 3,62 respektive 2,03. Axel startade om båda för hand.)*
- **Orimliga siffror ger ingen dom.** ROAS utanför 0–15 flaggas i stället.
- **⚠ nära zongräns.** Ligger vinsten inom 3 procentenheter från en gräns
  flaggas raden — ROAS för de senaste dygnen revideras uppåt i efterhand.

## Det som inte är avgjort

- **Vilket break-even som gäller.** Ronden tar talet i tre steg: uträknat ur
  kostnadsblocket i `produktkarta.json` om det finns, annars ett fast tal där,
  annars talet i kampanjnamnet. `products/products.json` har andra tal för sina
  sex produkter — de kampanjerna är pausade i Meta och berör därför inte ronden
  idag. Skulle de startas om måste talen jämkas.
- **Bälteslipmaskinens nya break-even.** Inköpspriset höjdes till 40 USD
  2026-08-28, men det saknas besked om frakt och avgifter ovanpå. Break-even
  ligger någonstans mellan 1,73 och 2,06 — och det avgör om beskedet blir
  "låt vara" eller "sänk". Ronden kör vidare på det gamla talet 1,58 tills
  raden ur kostnadsarket finns.
- **Cykelshorts break-even bygger på 5 köp.** Räkna om vid 30+.
- ~~Om ronden någon gång ska få ändra själv.~~ **Avgjort 2026-08-29: ja.**
  `/rond-auto` körs dagligen via en Routine och utför planen själv, med
  kontospärren, öre-verifieringen och trappan i `.claude/commands/rond-auto.md`.
  `/rond` finns kvar som manuellt läge. Dashboarden för människor:
  `agent/dashboard.mjs` → https://claude.ai/code/artifact/1e4b73e9-ce06-41ca-bd18-a2f17037de81

## Annons-triggern (tillbaka sedan 2026-09-13) + Startskottet

Ronden flaggar produkter som behöver nya annonser (`/rond-auto` steg 4b) —
**bara Sverige**. Alla förstabatcher och alla förfallna brief-rundor körs
samma morgon, utan tak. Rundan är dubbla veckokvoten, minst fyra, mest video.
Briefarna landar i produktens hub ur `produktkarta.json`; sedan 2026-09-13
bygger Axel hubbarna själv och döper dem **"BÄVER <produkt>"**.

*(Briefhalvan togs bort 2026-09-10 och lades tillbaka 2026-09-13 — Axel vill
skala på Bäverbutiken OCH bygga OPS-butiker, med fler videoredigerare.)*

## Startskottet (sedan 2026-09-10, körs vid sidan av briefsen)

När en produkt klarar testet postar ronden **dessutom ett Discord-meddelande**
i `#ops-startskott` som säger att produkten ska få en egen OPS-butik.

- **Klarat testet — 1 500 kr total spend OCH minst 20 % vinst** → första batchen
  (`/forsta-batch`) OCH ett startskott (`agent/startskott.mjs`, loggas som
  `OPS_STARTSKOTT`). Det är övergången test → skalning + egen butik; en förlorare vid tröskeln går åtgärdstrappan i stället.
  **Under 20 % vinst chillar produkten** och prövas om nästa dygn. Okänd vinst
  räknas aldrig som godkänd. Axels besked 2026-08-31.
  *(Kravet hette bara "över break-even" fram till dess. Det var för trubbigt:
  Plyschtofflorna låg 2,4 % över och fick 12 briefer byggda samma morgon som
  ronden själv skrev "tunn marginal, se över priset".)*
- **Bara Sverige.** En norsk kampanj utlöser aldrig ett startskott.
- `brief_runda`, `ersatt` och `mata_vinnare` körs som vanligt i steg 4b (`/cs`).

⚠️ **Listan kommer ur `startskottsbehov`, inte ur `annonsbehov`.**
`forsta_batch` ges bara till produkter som ALDRIG haft en batch. Byggde man
larmet på den skulle bara splitternya produkter larmas, medan de bevisade
produkter som redan fick briefer under det gamla systemet aldrig larmades.
*(Mätt 2026-09-10: 45 SE-kampanjer i loggen, 14 med batch.)*

Två koder tystar en produkt för gott: `OPS_STARTSKOTT` (larmet har gått) och
`OPS_FINNS_REDAN` (butiken fanns redan — seedad 2026-09-10 för
Övervakningskameran/HeimGuard och IBC-Tanköverdraget/TankGuard).

Ett skickat startskott loggas som `OPS_STARTSKOTT` och tystar produkten för
gott — larmet går en gång, aldrig igen.

Bildannonserna (`/bildannonser`, 20:00) och leveransrundan
(`/notionkorning`, 13:20) är egna rutiner och berörs inte.

## Så räknas break-even

```
break-even-ROAS = pris / (pris − kostnad per order)
```

Ingen moms — butiken säljer DDP till Sverige. Kostnaden per order läggs ihop av delar i USD, EUR och
kronor, med valutakurserna i `produktkarta.json`. Ändras ett inköpspris räcker
det att ändra ett tal där — ronden räknar om break-even själv.

Går produkten i flera prisnivåer (1-pack, 2-pack, 3-pack) är break-even olika
för varje nivå. Ronden använder ett blandat tal som utgår från den AOV Meta
faktiskt visar, och trappan sparas i `produktkarta.json` så det går att se hur
talet kom till.
