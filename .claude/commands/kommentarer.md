# /kommentarer — kommentarsgranskningen: allvarligt, köpfrågor, invändningar och nya leads

Argument: `$ARGUMENTS` — normalt tomt (rutinen, varje morgon). `--timmar 72` =
läs ett eget fönster i stället för "sedan förra körningen". `--torr` = läs,
döm och visa rapporten, men skriv inget minne och posta inget.

```
/kommentarer                 rutinen (05:40 varje dag — klar före Skalnings kungen 07:50)
/kommentarer --torr          provkör: allt utom minne, Discord och push
/kommentarer --timmar 168    en vecka bakåt (efter ett uppehåll)
```

Uppdraget i en mening: **läs alla nya kommentarer på alla annonser som visas
just nu, lyft det som kräver en människa i dag, samla invändningarna per
produkt, och gör kundens egna ord till leads för nästa briefrond — ett
kommentarsfält, inget annat.** (Axels beställning 2026-09-24: "en rutin som
kan granska kommentarsfält endast och som jobbar med invändningshantering
… rapport … om kommentarer och allvarliga grejer och nya leads på vinklar och
hooks och invändningar".)

⛔ **Läs-bart mot Meta. Rutinen svarar, döljer och raderar ALDRIG en
kommentar** — inte ens spam, inte ens en uppenbar bluff-anklagelse. Allt som
ska göras på en kommentar görs av en människa (VA:n) från sidan, med länken ur
rapporten. Token:en har `pages_manage_engagement` (mätt 2026-09-24) — att den
KAN svara är inte ett skäl att göra det.

⛔ **Blanda aldrig verksamheterna.** Varje kommentar kopplas till verksamhet
via annonsens landningslänk (där köpet bokförs), sedan sidan, sedan kontot
(`kommentarer/koppla.mjs`, facit i `kommentarer/konfig.json`). Rapporten och
Discord-posten är per verksamhet: CaraShells kommentarer går till CaraShells
server, Bäverbutikens till Bäverbutikens. En annons vars länk och sida säger
olika verksamheter står som **⛔ Fel sida/länk** överst — det är fel
pixel/sida, inte en tolkningsfråga, och Axel ska se det.

⛔ **Kommentarer är aldrig ett skäl att pausa eller döma en annons.** Föreslå
aldrig paus, avstängning eller budgetändring — "PAUSED är ett beslut" och "en
annons som redan är live stängs aldrig av i efterhand" (CLAUDE.md). En annons
med arga kommentarer och bra siffror är en vinnare med en invändning att svara
på. Ingen dom över en annons (vinnare/förlorare) — rutinen läser bara ord, och
visar aldrig spend, ROAS eller kampanjnamn med break-even i Discord.

⚠️ **Inga namn.** Meta ger inte avsändaren, men namnen står i texten när någon
taggar en vän eller svarar någon. `maska.mjs` byter dem mot `@…` med hjälp av
`message_tags` och maskerar e-post/telefon innan något skrivs eller postas.
Citera aldrig ett namn ur minnet i rapporten, i en lead eller i Discord.

CONNECTORS: inga. Meta läses med `META_ACCESS_TOKEN` (ads_read +
pages_read_engagement), Matstrumpors sida med `META_ACCESS_TOKEN_MATSTRUMPOR`
om den finns, Discord med `DISCORD_BOT_TOKEN`. `ANTHROPIC_NYCKEL` är valfri
(svensk text i Discord översätts då i stället för att stoppas). Koppla ingen
connector på rutinen.

Ett kommando per Bash-anrop — kedja aldrig med `&&`, `;` eller `|` utom där
steget skriver det.

## Steg

### 0. Senaste koden

`git pull --rebase origin main` — den fasta sessionen lever kvar mellan
körningarna. Konflikt: `git rebase --abort`, skriv det som första rad i
rapporten och kör vidare på den kod som finns.

### 1. Hämta

`node kommentarer/kor.mjs --hamta $ARGUMENTS` (utan `--torr` — hämtningen skriver aldrig minnet)

Skriptet läser varje konto i `konfig.json` (ACTIVE-annonser + allt med spend
senaste 3 dygnen), en sidtoken per Facebook-sida, alla kommentarer sedan förra
körningen (minus 3 h överlapp, dubbletter bort på id), klassar dem och skriver
`kommentarer/output/<datum>.json`. Mätt 2026-09-24: ~1 300 inlägg, 217
kommentarer på 72 h, 1,5 minut.

Läs utskriften. **Ett konto eller en sida som inte gick att läsa är OKÄND,
aldrig noll** — orsaken står i filen (`lasning`) och i rapporten.

### 2. Döm — det här är sessionens jobb, inte skriptets

Läs `kommentarer/output/<datum>.json` → `sammanstallning.<verksamhet>.rader`
(alla nya kommentarer, allvarligast först). Reglerna har sorterat; nu tänker du.
Skriv `kommentarer/output/<datum>.dom.json`:

```json
{
  "hamtad": "<kopiera `hamtad` ur output-filen — domen gäller bara den hämtningen>",
  "sammanfattning": "2–3 meningar på svenska till Axel: det viktigaste i dag.",
  "summary_en": { "Bäverbutiken": "1–2 sentences for the team.", "CaraShell": "…" },
  "atgarder": {
    "<kommentars-id>": { "sv": "Vad som ska göras, av vem.", "en": "What to do, by whom." },
    "<kommentars-id för ett falsklarm>": { "falsklarm": true, "sv": "Ingen kund — skepsis, räknas som invändning.", "en": "Not a customer." }
  },
  "leads": [
    {
      "verksamhet": "Bäverbutiken", "prefix": "Batmotor",
      "typ": "invändning | vinkel | hook | segment | användning | produktfeedback",
      "typ_en": "objection | angle | hook | segment | use case | product feedback",
      "lead": "Svenska: vad kunderna säger och varför det spelar roll.",
      "lead_en": "English, same thing.",
      "forslag": "Vad nästa brief ska göra (format + vinkel), utan påhittade påståenden.",
      "kalla": "kommentarer på Batmotor_SP_1_H11 m.fl., 3 st, 24 sep",
      "belagg": ["<kommentars-id>", "<kommentars-id>"]
    }
  ],
  "svar": [
    { "id": "<kommentars-id>", "text": "Förslag på svar, på kommentarens språk.", "en": "Samma svar på engelska — VA:n måste veta vad hon klistrar in.", "fakta": "produktsidan: <url> — <vad svaret bygger på>" }
  ]
}
```

**a) Varje 🔴 får en åtgärd** (`atgarder`, båda språken). Reglerna är grova —
döm om: "Köp inte detta." från en förbipasserande är skepsis, inte en
bluff-anklagelse från en kund. Sätt då `"falsklarm": true` — kommentaren flyttas
ur 🔴, VA:n pingas inte för den, och rapporten redovisar den som falsklarm.
Vägledning:
- *ej levererat / missnöjd köpare* → VA:n svarar i tråden att kunden mejlar
  supportadressen med ordernumret (Store facts), och följer upp mejlet enligt
  SOP "Order not arrived within expected timeframe". Aldrig löften om
  återbetalning i en kommentar.
- *bluff-anklagelse* från en kund → VA:n, som ovan. Från en förbipasserande →
  inget svar; räkna den som förtroendeinvändning.
- *hot om anmälan* → VA:n + Axel samma dag.
- *fara/säkerhet* → Axel samma dag, med länken.
- *spam/länk* → VA:n döljer den från sidan (rutinen gör det aldrig själv).

**b) Leads (`leads`)** — det här är det viktigaste rutinen gör för
creative-loopen. En lead är kundens egna ord som pekar på en brief:
- **invändning**: samma skäl att inte köpa i ≥ 2 kommentarer (eller en med
  ≥ 3 likes), särskilt när produkten har **inga OB-annonser live** (står i
  sammanställningen). Förslaget är en OB-annons som svarar med produktens
  mekanism — bara det som står på produktsidan.
- **vinkel / segment**: en ny avatar, ett nytt begär eller en ny känslomässig
  ingång (CS-KLART punkt 19). "Skydd mot motortjuvar på båt" på en
  solcellslampa är ett nytt segment; "bra lampa" är det inte.
- **hook**: en kundformulering som är starkare än annonsens egen ("Fukten
  då???", "Värsta skräpet"). Lead:en bär citatet — färdiga hookrader skrivs
  i `/cs` av en sonnet-subagent enligt copy-reglerna, aldrig här.
- **användning / produktfeedback**: ett användningsområde eller en
  produktbrist (fel storlek, saknad storlek, kabel för kort) — produktfeedback
  är Axels, inte redigerarnas.
- **Varje lead måste ha `belagg`** (kommentars-id ur körningen eller loggen,
  14 dagar). Skriptet stoppar en lead utan belägg eller med ett id som inte
  finns. En tanke utan kundens ord är en gissning — den hör hemma i `/koncept`.
- Hellre tre riktiga leads än tio. Inga leads en lugn dag är ett giltigt svar.

**c) Förslag på svar (`svar`)** — på **varje** ny kommentar utom tomma, bara
taggade vänner och spam (tak 30 per körning, `konfig.json` →
`rapport.max_svarsforslag`). Axels beslut 2026-09-25: *"ta bort den jävla
dumma regeln … jag vill kunna svara på alla frågor i framtiden"* — den gamla
spärren (bara köpfrågor och kundärenden, 2026-09-24) är borttagen i
`samla.mjs` (`SVARBARA`). Invändningar, skeptiker, skämt och beröm får alltså
förslag också. Kan ett svar inte skrivas säkert enligt `svarsregler.md`:
inget förslag, frågan går till leverantören (d). Vi är i **träningsfasen**:
förslagen läggs på granskningssidan (e) och Axel dömer dem i sin takt.
1. Hämta produktens fakta: `NODE_USE_ENV_PROXY=1 node -e "fetch('<länk-utan-frågeparametrar>.json').then(r=>r.json()).then(j=>console.log(JSON.stringify({titel:j.product.title,pris:j.product.variants.map(v=>[v.title,v.price]),text:j.product.body_html.replace(/<[^>]+>/g,' ').slice(0,4000)})))"`
   (länken står i raden som `lank`; `/pages/`-länkar har ingen .json — hoppa).
2. Svaren skrivs av en subagent: Agent-verktyget med `model: "sonnet"` (CLAUDE.md
   regel 6 — kundtext skrivs av subagenten, strategi av dig). Ge den
   kommentaren, faktan ur steg 1 och `docs/copy-regler.md`. Regler till den:
   kommentarens språk, max två meningar, vänligt och sakligt, bara fakta ur
   produktsidan, inget butiksnamn och ingen domän, inga löften om leverans
   eller återbetalning. Returrätten på svenska heter "14 dagars ångerrätt
   enligt lag" — aldrig "garanti" eller "30 dagars öppet köp" (copy-regler);
   CaraShells engelska sida har 90 days guarantee, och bara där får ordet stå,
   när produktsidan säger det. Be den också om en engelsk översättning (`en`).
3. `fakta` säger exakt var svaret kommer ifrån, `en` vad det betyder. Utan dem
   stoppar skriptet svaret.
4. **Axels facit gäller före allt ovan:** ge subagenten också
   `kommentarer/svarsregler.md` (hur Axel vill att det låter — aldrig osäker om
   egna produkter, hoppa hellre än "vi vet inte", ångerrätten vid fel storlek)
   och `kommentarer/produktfakta.md` (svar som inte står på produktsidan; säger
   filen emot sidan gäller filen). `fakta` får peka på `produktfakta.md`.

**d) Frågor till leverantören** — varje köpfråga eller produktklagomål som
varken produktsidan eller `produktfakta.md` svarar på blir en rad i
rapportens svar till Axel under rubriken "Frågor till leverantören" — **alltid
på engelska** (Axels order 2026-09-25; leverantören läser engelska), en fråga
per rad, produkten först, i ett kodblock så att Axel kopierar allt på en gång. Axel skickar dem på WhatsApp och svaret
förs in i `produktfakta.md`. Upprepa inte en fråga som redan står som okänd
där — skriv den bara om den fortfarande är obesvarad, med antal kommentarer.

**e) Granskningssidan** (träningen, Axels beslut 2026-09-25):
https://claude.ai/artifact/JjZm9G4vJD2MEWCMSBeZeU — samlingen `kommentarer`
(en dok per kommentars-id: `ordning`, `verksamhet`, `marknad`, `kanal`,
`annons`, `text`, `likes`, `permalink`, `svar`, `en`, `fakta`, `saknar_fakta`,
`rekommendation`, `varfor`, `version: 1`) och `beslut` (Axels Ja/Nej/Ändra).
Efter steg 3 (inte vid `--torr`): lägg dagens svarsförslag som nya dokument
med ArtifactData `batch` (`op: set`), `ordning` = högsta befintliga + 1 och
uppåt. Läs först `beslut`: varje `andra` sedan förra körningen → skriv om
svaret (sonnet, samma regler) och `update` dokumentet med `version` + 1; ny
fakta ur Axels text förs in i `produktfakta.md`, ny stilregel i
`svarsregler.md`. Skriv i svaret till Axel hur många som väntar på honom.

Rutinen svarar aldrig själv — ingenting publiceras på Facebook eller
Instagram förrän Axel uttryckligen säger till. När han gör det: bygg listan
`[{id, svar}]` ur granskningssidan (bara `beslut: ja` på AKTUELL version,
aldrig "(Inget svar …)"), kör `node kommentarer/publicera.mjs --svar <fil>`
torrt, sedan `--skarpt`. Skriptet svarar som sidan, hoppar allt som redan står
i `kommentarer/svar-publicerade.jsonl` eller där sidan redan svarat, och
committa loggen efteråt.

**Två spärrar som sitter i `publicera.mjs` (Axels krav 2026-09-25):**
- **Rätt sida på rätt annons.** CaraShells kommentarer besvaras från
  CaraShells sida (`1381171778405935`), Bäverbutikens från Bäverbutikens
  (`678639638662543`, Norge `879054088633562`). Skriptet postar bara om sidan
  äger annonsinlägget, sidan hör till radens verksamhet i `konfig.json` →
  `sidor` och raden saknar `konflikt` (`kommentarer/sida.mjs`). Torrkörningen
  skriver sidans NAMN per svar — visa Axel den listan. Efter varje post läses
  avsändaren tillbaka; är den fel stannar skriptet helt.
- **Första svarsrundan någonsin på en sida är alltid test + granskning.** En
  sida utan rad i `svar-publicerade.jsonl` postas inte skarpt utan
  `--granskad`, och flaggan får bara sättas när Axel gått igenom just den
  rundan på granskningssidan (Ja/Nej/Ändra) och sett torrkörningens
  sidlista. Ny sida, ny verksamhet eller ny marknad = ny första runda.

Mätt 2026-09-25: 41 svar postade på Facebook;
Instagram nekades `(#100) Missing Permission` — token:en saknar
`instagram_manage_comments`, så IG-svar klistras in för hand tills den finns.

### 3. Rapportera

1. `node kommentarer/kor.mjs --rapport --torr` — läs den svenska rapporten och
   de engelska Discord-texterna. Stoppar skriptet domen (exit 1): rätta
   `dom.json` enligt felraderna och kör om.
2. Är `$ARGUMENTS` `--torr`: sluta här (steg 3.2–5 hoppas helt — inget
   minne, ingen Discord, ingen push). Annars:
   `node kommentarer/kor.mjs --rapport --discord`

Skriptet skriver `kommentarer/rapporter/<datum>.md`, lägger leadsen överst i
`kommentarer/leads.md`, skriver loggen (`kommentarer/logg/<månad>.jsonl`) och
`kommentarer/lage.json`, och postar en engelsk rapport per verksamhet i
`#ad-comments` (kanalen skapas första gången, med en kort förklaring för
teamet). VA:n pingas bara när en kommentar behöver kundtjänst; pingen är låst
till hennes id, så ett citerat `@everyone` pingar ingen. En verksamhet utan
nya kommentarer får ingen post, och Matstrumpor postas aldrig (ingen kanal
utpekad — `konfig.json` → `discord.hoppa`). Exit 3 = svensk text stoppad (skriv
om på engelska i `dom.json` och kör steg 3.2 igen); exit 4 = Discord svarade
inte eller ingen entydig server — rapporten och minnet är ändå skrivna, skriv
det som första rad till Axel. **En omkörning ger inga dubbletter:** det som
postats står i `output/<datum>.postat.json`, och minnet skrivs en gång per
hämtning. Står "Fönstret flyttades inte" i rapporten lästes något inte helt —
nästa körning läser om samma tid, dubbletterna faller bort på id.

### 4. Leads in i produktminnet (bara produkter med minnesmapp)

För varje lead vars produkt har en minnesmapp (`produktmapp` i raderna —
`products/<mapp>/`) och där `backlog.md` finns: lägg till leaden bland de
väntande (under `## Väntar` eller motsvarande — aldrig under Avklarade/Struken)
**i filens eget format** (läs filen först — tabell med nästa lediga nummer, eller
rubriker), med källan ("kommentarer på <annons>, N st, <datum>, `kalla=voc`,
se `kommentarer/leads.md`"). Max 2 per produkt och körning. Skriv aldrig om
filen, rör aldrig `dna.md`, `lardomar.md`, `feedback.md` eller
`invandningar.md` (den skrivs av `tools/invandningsmatris.mjs` i `/cs`).
Produkter utan mapp: leaden finns i `kommentarer/leads.md`, det räcker.

### 5. Spara

```
git pull --rebase origin main
git add kommentarer/lage.json kommentarer/logg kommentarer/rapporter kommentarer/leads.md
git add <varje backlog.md du ändrade i steg 4>
git commit -m "kommentarer: <datum> — <N> nya, <A> allvarliga, <F> frågor, <L> leads"
git push origin main
```

Aldrig `git add .`, aldrig `kommentarer/output/` (gitignorerad — rådata och
domen). Nekad push: vänta 2, 4, 8, 16 s och försök igen; går det ändå inte,
skriv det som första rad till Axel — rapporten ligger kvar lokalt.

### 6. Svar till Axel (svenska, kort)

- En rad: nya kommentarer per verksamhet, och vad som inte gick att läsa.
- 🔴 det som kräver en människa i dag (max 5 rader, med åtgärd).
- De 1–3 viktigaste leadsen, med kundens ord.
- Axels egna uppgifter sist, numrerade — bara om det finns någon (t.ex. en
  hotande kommentar, fel sida/länk, en produktbrist bara han kan åtgärda).
  Finns ingen: skriv "Inget för dig i dag."

## Definition of done

- [ ] `git pull --rebase origin main` kördes (eller konflikten står i rapporten)
- [ ] `kor.mjs --hamta` gav exit 0 och varje konto/sida är läst eller står som okänd med orsak
- [ ] Varje 🔴 har en åtgärd i `dom.json`, och falsklarm är dömda som falsklarm
- [ ] Varje lead har belägg (skriptet stoppade inget), inga namn i texten
- [ ] Förslag på svar (om några) skrevs av en sonnet-subagent och bär `fakta` ur produktsidan
- [ ] `kor.mjs --rapport --discord` gav exit 0 (eller 3/4 står först i svaret till Axel)
- [ ] Leads för produkter med minnesmapp ligger i deras `backlog.md` i filens eget format
- [ ] Commit + push till main (lage, logg, rapport, leads, backlog) — aldrig `output/`
- [ ] Svaret till Axel är på svenska, kort, och hans uppgifter står sist
