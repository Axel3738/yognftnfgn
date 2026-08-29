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

Lista Products-mappen (id `1Gga4QfZ0UfVC-q06BGGHN_fkSFN0Iygm`) med
`python3 tools/drive-ls.py`. Kandidater = mappar som inte är
LAUNCHED/NOT USED/Winners/Losers/TEMU-referens eller "avvaktas". Kör /launch
(launch.md) på varje komplett kandidat tills kön är tom — dubblettspärren i
launch.md fas 0.5 gäller alltid. Radera nedladdad media ur scratchpad mellan
produkterna.

## Steg 4 — Drive-flytt

Flytta fullt launchade produkters mappar till LAUNCHED
(id `1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`). Permission-fel: flagga bara —
dubblettspärren skyddar mot omkörningar, flytten är städning.

## Steg 5 — Redigerarnotis

Problem som är redigerarnas (saknade filer, TEST-platshållarrecensioner,
QA-stoppfel i creatives): ETT sakligt engelskt meddelande via env
`SLACK_WEBHOOK_URL` om den finns. Slack-connectorn får bara användas efter
verifiering: sök "bäver" — noll träffar = fel workspace, avstå. Inga
@-pingar. Infrastrukturproblem går ALDRIG till teamet, bara till Axels rapport.

## Steg 6 — Slutrapport (svenska, kort)

Aktiverat (kampanj-id, BE, budget) · kompletterat · launchat nytt ·
PAUSED-lämnat med orsak · prisfixar · recensioner importerade · mappflyttar ·
Slack-status · det lilla som väntar på Axel. Inget nytt och inget att åtgärda
= "inget nytt i kön", inget mer.

## Fallbackar

Meta via `META_ACCESS_TOKEN` mot graph.facebook.com (mönster i
`pipeline/meta.mjs`); Shopify-token mintas av `tools/shopify-fix-compareat.mjs`
ur `SHOPIFY_CLIENT_ID_SE`/`SECRET`; Drive läses via publika länkar
(`tools/drive-ls.py` + export-URL:er); Judge.me via `JUDGEME_API_TOKEN`.
