# /nattkorning — den dagliga launch-rutinens hela uppdrag

Detta är facit för rutinen "Ad upload and structure". UI-promptens enda jobb är
att klona repot och peka hit — ALLT annat står här och underhålls via git.

## Steg 0 — Repot (läsning räcker)

Repot är redan klonat när du läser det här. **Launch-flödet skriver ALDRIG till
repot** — testa aldrig `git push`, kräv aldrig skrivbehörighet; 403 på push är
förväntat och irrelevant. CS OS:ets commit-regler i CLAUDE.md gäller
/cs-flödet, inte nattkörningen. Läs sedan: `docs/temu-launch-flow.md` och
`.claude/commands/launch.md` — launch.md är facit för varje produktkörning.

## Steg 1 — Aktiveringssvep

Hämta alla kampanjer i MagiBorsten (`1867947880635861`, SEK) skapade av det
här flödet (namnformat `| BE ROAS ... | Launch ...`). Varje kampanj som står
PAUSED **utan giltig orsak** aktiveras uppifrån och ner (kampanj → adsets →
annonser — varje nivå explicit). Giltiga orsaker att förbli PAUSED:
- break-even okänd (`BE ROAS TBC`) — får ALDRIG aktiveras
- enskilda annonser med QA-stoppfel (stavfel, styckprisfel, fel produktnamn)
Metas API tvångspausar kampanjer vid budget-/strukturändringar — verifiera
med tillbakaläsning efter varje aktivering.

## Steg 2 — Komplettera halvbyggda kampanjer

Kampanjer med saknade koncept-adsets eller utan annonser (Metas uppladdning
kan vara tillfälligt avstängd för kontot): försök ladda upp de saknade
creatives och bygg klart enligt launch.md. Funkar uppladdningen fortfarande
inte: notera och gå vidare.

## Steg 3 — Launch-kön

**FÖRST, innan någon mapp bedöms:** hämta hela kampanjlistan från MagiBorsten.
**En produkt vars namn redan finns i en kampanj är ALDRIG en kandidat** —
oavsett var mappen ligger, oavsett kampanjens status. Den ska inte launchas,
inte QA:as om, inte nämnas som något Axel ska göra. Mapparnas placering är
opålitlig (flyttar misslyckas på rättigheter, folk drar runt dem) —
**kampanjkontot är enda sanningen för vad som redan är gjort.** Halvbyggda
eller PAUSED-utan-beslut hanteras tyst i steg 1–2, inte här.

Sedan: lista Products-mappen (id `1Gga4QfZ0UfVC-q06BGGHN_fkSFN0Iygm`) med
`python3 tools/drive-ls.py`. Kandidater = mappar som INTE matchar någon
befintlig kampanj och inte är LAUNCHED/NOT USED/Winners/Losers/TEMU-referens
eller "avvaktas". Kör /launch (launch.md) på varje komplett kandidat tills kön
är tom. Radera nedladdad media ur scratchpad mellan produkterna.

## Steg 4 — Drive-flytt (tyst best-effort)

Försök flytta fullt launchade produkters mappar till LAUNCHED
(id `1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`). Misslyckas det: en (1) rad i
rapportens statusdel — **ALDRIG under "väntar på Axel"**. Dubblettspärren mot
annonskontot är skyddet; mapparna är ren städning och får aldrig bli Axels
uppgift eller framställas som ett problem.

## Steg 5 — Redigerarnotis

Problem som är redigerarnas (saknade filer, TEST-platshållarrecensioner,
QA-stoppfel i creatives): ETT sakligt engelskt meddelande via env
`SLACK_WEBHOOK_URL` om den finns. Slack-connectorn får bara användas efter
verifiering: sök "bäver" — noll träffar = fel workspace, avstå. Inga
@-pingar. Infrastrukturproblem går ALDRIG till teamet, bara till Axels rapport.

## Läsning av Drive sker ALLTID via publika länkar

`tools/drive-ls.py` + export-URL:erna fungerar utan connector-rättigheter på
alla produktmappar, var de än ligger (Products eller LAUNCHED). Påstå ALDRIG
att material är oåtkomligt utan att ha provat den publika vägen — connectorns
sök/åtkomst är inte sanningen för läsning.

## Steg 6 — Slutrapport (svenska, kort)

Aktiverat (kampanj-id, BE, budget) · kompletterat · launchat nytt ·
PAUSED-lämnat med orsak · prisfixar · recensioner importerade · mappflyttar ·
Slack-status · det lilla som väntar på Axel. Inget nytt och inget att åtgärda
= "inget nytt i kön", inget mer.

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
