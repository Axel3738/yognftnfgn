# /nattkorning — den dagliga launch-rutinens hela uppdrag

Detta är facit för rutinen "Ad upload and structure". UI-promptens enda jobb är
att klona repot och peka hit — ALLT annat står här och underhålls via git.

## Steg 0 — Repot (läsning räcker)

Repot är redan klonat när du läser det här. **Launch-flödet skriver ALDRIG till
repot** — testa aldrig `git push`, kräv aldrig skrivbehörighet; 403 på push är
förväntat och irrelevant. CS OS:ets commit-regler i CLAUDE.md gäller
/cs-flödet, inte nattkörningen. Läs sedan: `docs/temu-launch-flow.md` och
`.claude/commands/launch.md` — launch.md är facit för varje produktkörning.

## Steg 1 — Aktiveringssvep (HÅRT AVGRÄNSAT — läs varje ord)

**Axels regel, ordagrant (2026-08-30): svepet får bara aktivera nya launcher
som aldrig kommit igång — aldrig kampanjer eller annonser som Axel,
skalningsronden eller åtgärdstrappan har stängt av.**

Det betyder att en kampanj/adset/annons får aktiveras av svepet ENBART om
BÅDA villkoren är uppfyllda:

1. **Den har aldrig kommit igång:** lifetime-spend är exakt 0 kr (hämta
   `amount_spent`/insights för kampanjen INNAN du rör status). Har den
   spenderat en enda krona har den varit igång — då är PAUSED ett beslut
   (Axels, skalningsrondens eller åtgärdstrappans) och statusen är HELIG.
   Besluten syns inte i någon metadata, så spend > 0 är enda säkra testet.
2. **Den är en ny launch:** skapad av DENNA körning i steg 3, eller har
   dagens datum i `Launch YYYY-MM-DD`-delen av namnet.

Faller något av villkoren: rör ALDRIG status. Inte "aktivera tillbaka",
inte "den ser halvfärdig ut", inget. Samma regel per NIVÅ: en enskild
annons som är PAUSED inne i en aktiv kampanj är avstängd med flit —
aktivera aldrig en annons som har spend > 0. (Detta hände 2026-08-29/30:
en för bred svepregel slog på ett dussin gamla manuellt avstängda
kampanjer, flera olönsamma. Det får aldrig hända igen.)

För kampanjer som klarar båda villkoren gäller som förut: aktivera uppifrån
och ner (kampanj → adsets → annonser, varje nivå explicit) när QA är grön.
PAUSED-orsaker som alltid respekteras: BE ROAS TBC (får aldrig aktiveras),
QA-stoppfel på enskilda annonser. Metas API tvångspausar vid budget-/
strukturändringar — verifiera med tillbakaläsning efter varje aktivering.

**Nödbroms:** vill svepet aktivera fler kampanjer än körningen själv skapade
i steg 3 plus TVÅ till — avbryt HELA svepet utan att röra något och skriv i
rapporten exakt vilka kampanjer det ville aktivera och varför. Ett svep som
"hittar" många kandidater är per definition trasigt. Dessutom: VARJE
statusändring körningen gör (aktivering och pausning, alla nivåer) listas
med namn + gammal→ny status under "Detaljer:" i slutrapporten, så att Axel
alltid kan se på morgonen exakt vad som slogs på och av.

## Steg 2 — Komplettera halvbyggda kampanjer

Kampanjer med saknade koncept-adsets eller utan annonser (Metas uppladdning
kan vara tillfälligt avstängd för kontot): försök ladda upp de saknade
creatives och bygg klart enligt launch.md. Funkar uppladdningen fortfarande
inte: notera och gå vidare.

## Steg 3 — Launch-kön (Axels kontrakt, ordagrant)

**Driven ÄR to-do-listan. Kampanjkontot är kvittot på vad som är gjort.**
Två källor, två olika jobb — blanda aldrig ihop dem:

1. **Vad som SKA göras** avgörs ENBART av Drive: mappar som ligger direkt i
   Products (id `1Gga4QfZ0UfVC-q06BGGHN_fkSFN0Iygm`), listade med
   `python3 tools/drive-ls.py`. Axel styr listan genom att lägga och flytta
   mappar. Det som inte ligger där finns inte på to-do-listan och rörs aldrig
   som ny launch. (LAUNCHED/NOT USED/Winners/Losers/TEMU-referens/"avvaktas"
   är aldrig to-do.)
2. **Vad som redan ÄR gjort** avgörs ENBART av kampanjlistan från MagiBorsten,
   hämtad INNAN någon mapp bedöms: matchar mappens produktnamn en befintlig
   kampanj är den GJORD — hoppa över TYST (mappen har bara inte flyttats än;
   flyttar nekas ibland på rättigheter). Aldrig omlaunch, aldrig om-QA,
   aldrig en rad på Axels lista.

Kandidat = ligger i Products (källa 1) OCH saknar kampanj (källa 2). Kör
/launch (launch.md) på varje komplett kandidat tills kön är tom. Radera
nedladdad media ur scratchpad mellan produkterna.

Underhåll av redan launchade kampanjer (steg 1–2: aktivering, komplettering av
saknade adsets) är INTE to-do-listan — det styrs av kampanjkontot och får läsa
sitt material varifrån mappen än ligger, LAUNCHED inräknat, via publika länkar.

## Steg 4 — Drive-flytt (tyst best-effort, städar hela efterslpet)

Flytta **varje** mapp som ligger direkt i Products och redan har en kampanj i
MagiBorsten till LAUNCHED (id `1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) — inte bara
nattens egna launcher. Kampanjlistan från steg 3 är facit; mappar utan kampanj
rörs aldrig, och LAUNCHED/NOT USED/Winners/Losers/TEMU-referens hoppas över.
Så städas kvarliggande mappar av sig själva den natt rättigheten finns, utan
att någon behöver be om det.

Verktyget är `mcp__Google_Drive__update_file` med mappens `fileId` och
`parentId` satt till LAUNCHED-id:t. Läs tillbaka med `get_file_metadata` och
kontrollera att `parentId` ändrats — connectorn kan svara utan att ha flyttat.

Misslyckas en flytt: en (1) rad i rapportens statusdel — **ALDRIG under
"väntar på Axel"**. Dubblettspärren mot annonskontot är skyddet; mapparna är
ren städning och får aldrig bli Axels uppgift eller framställas som ett problem.

⚠️ **Rättighetsfel här är ett kontofel, inte ett kodfel — felsök aldrig koden.**
Vem connectorn är inloggad som avgör om flytten går igenom, och det syns med
`mcp__Google_Drive__search_files` på `owner = 'me'`.

Mätt 2026-09-01, två gånger samma dag: först var connectorn inloggad som
`axelodhner.business@gmail.com`, ett konto som varken äger käll-, mål- eller
produktmappen — då nekades varje flytt. Axel kopplade samma dag om connectorn
till `axel.odhner@stonebite.org`, kontot som äger både Products och LAUNCHED.
Produktmapparna ägs av redigeraren (`joshnaelga146@gmail.com`) och kommer att
fortsätta göra det — det är föräldramapparnas ägarskap som ger flytträtten.

Nekas en flytt ändå: skriv statusraden och gå vidare, felsök inte koden.
Kontrollera först vilket konto connectorn kör som; är det inte ägaren till
Products är det enda verkliga åtgärden att koppla om den igen.

## Steg 5 — Redigerarnotis (Axels lista ska ALDRIG innehålla "säg till redigerarna")

Problem som är redigerarnas (saknade filer, TEST-platshållarrecensioner,
QA-stoppfel i creatives): ETT sakligt engelskt meddelande. Gå igenom
kanalerna i ordning tills en fungerar — sluta aldrig efter första miss:

1. **Slack** via env `SLACK_WEBHOOK_URL` om den finns. Connectorn får bara
   användas efter verifiering: sök "bäver" — noll träffar = fel workspace,
   hoppa vidare till nästa kanal.
2. **Notion-kommentar på produktens sida** i data source
   `collection://d80270ab-908c-839b-9dcc-8721c5f29570`
   ("Product test center SE BÄVER"). Sidan har en **Ansvarig** — hen får
   notisen automatiskt. Detta är den kanal som fungerar utan Slack och
   ska användas så fort Slack inte går. En rad per fel: exakt vilka filer,
   exakt vad som är fel, exakt rätt stavning.
3. **Discord** via `node tools/notify-discord.mjs` som sista utväg.

Finns ingen Notion-sida för produkten: skriv felet i Discord-briefen och
gå vidare. **"Säg till redigerarna" får ALDRIG stå under "Väntar på Axel"** —
det är rutinens jobb, inte hans. Inga @-pingar. Infrastrukturproblem går
ALDRIG till teamet, bara till Axels rapport.

## Läsning av Drive sker ALLTID via publika länkar

`tools/drive-ls.py` + export-URL:erna fungerar utan connector-rättigheter på
alla produktmappar, var de än ligger (Products eller LAUNCHED). Påstå ALDRIG
att material är oåtkomligt utan att ha provat den publika vägen — connectorns
sök/åtkomst är inte sanningen för läsning.

## Steg 6 — Slutrapport (mobilformat — Axel läser den som push-notis)

⚠️ **Push-notisen får INTE vara en lång text.** Notisens hela innehåll är
första raden nedan — inget mer. En notis på fem meningar är ett fel, inte en
rapport. Samma sak i chatten: aldrig ett inledande stycke före "Läget."

**FÖRSTA RADEN är hela rapporten för mobilen.** Max 12 ord, börjar med ✅ eller
⚠️, säger vad som hände och om något väntar på Axel. Exempel:

- `✅ 2 launchade, 7 rullar, inget väntar på dig`
- `✅ Inget nytt i kön, allt rullar`
- `⚠️ 1 sak väntar: quote för Bordtennisnätet`

Sedan max 5 korta rader på vanlig svenska: vad som launchades/aktiverades/
kompletterades (produktnamn + budget, INGA id:n), vad som hoppades över och
varför, i en mening var. Inga tabeller, inga rubriker, inga tekniska termer.
Kampanj-id:n och tekniska detaljer läggs allra sist under en enda rad
"Detaljer:" — den delen är för felsökning, inte för Axel.

Inget nytt och inget att åtgärda = HELA rapporten är en rad:
`✅ Inget nytt i kön, allt rullar`.

**Briefen skickas ALLTID till Discord-kanalen `#new-products-coing-out`
efter varje körning** (Axels beslut 2026-08-30). Discord-versionen är den
ENKLA delen av rapporten: första raden + de max 5 korta raderna — **ALDRIG
"Detaljer:"-raderna**, de hör hemma i chattrapporten:

```bash
node tools/notify-discord.mjs "<första raden + de korta raderna>"
```

Verktyget hittar själv auth i environmentet (bot-token i första hand —
vilken env-variabel som helst med DISCORD i namnet — annars webhook) och
slår upp kanalen på namnet via boten; hittas den inte används "mamma jobb"
som reserv. Långa rapporter delas automatiskt. Misslyckas skicket (eller
saknas auth): nämn det på en rad i chattrapporten och fortsätt —
Discord-strul får aldrig stoppa körningen eller hamna under "Väntar på Axel".

**"Väntar på Axel" är en skyddad rubrik.** Där får BARA stå: leverantörsquotes
som saknas, riktiga ägarbeslut (pris, budget, ny målnivå), och redigerarfel som
inte kunnat skickas till teamet. ALDRIG: mappstädning, connector-rättigheter,
Metas uppladdnings-rollout (skriv "väntar på Meta"), eller något rutinen kan
lösa själv nästa körning. Varje rad där är ett avbrott i Axels dag — förtjäna den.

## Fallbackar

Meta via `META_ACCESS_TOKEN` mot graph.facebook.com (mönster i
`pipeline/meta.mjs`); Shopify-token mintas av `tools/shopify-fix-compareat.mjs`
ur `SHOPIFY_CLIENT_ID_SE`/`SECRET`; Drive läses via publika länkar
(`tools/drive-ls.py` + export-URL:er); Judge.me via `JUDGEME_API_TOKEN`.
