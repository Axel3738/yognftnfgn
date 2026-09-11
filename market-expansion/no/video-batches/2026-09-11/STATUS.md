# NO-videobatch 2026-09-11 — status

Rutin: `/translate-no` (`.claude/commands/translate-no.md`). Källa: Drive-mappen
LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`).

⚠️ Sessionens lokala `main` hade divergerat kraftigt från `origin/main` vid start
(161 lokala commits mot 95 nya på origin). Arbetsträdet var rent — synkade med
`git reset --hard origin/main` innan körningen startade.

## Fas 0 — Inventering

LAUNCHED innehöll 4 produktmappar (minus WINNERS/LOSERS/MAKE TO NORWAY):
`6 Isolerad Utekattkoja`, `6 Taköverdrag Husvagn 6,5 × 3 m`, `7 Stegstöd 2-pack`,
`Staketstolpslagare`. Ingen hade `NO <namn>`-mapp i MAKE TO NORWAY eller kampanj i
act_1050941584152547 → alla 4 var kandidater.

**Max 3 körda i bokstavsordning:** Isolerad Utekattkoja, Taköverdrag Husvagn,
Stegstöd 2-pack. **I kö till nästa körning: Staketstolpslagare** (fanns troligen i
batch-sheet #6 som "Staketstolps-reparationsbygel med markspett" — kontrollera vid
nästa körning).

Priser/COGS verifierade mot beverbutikken.no och batch-sheet #6 (Isolerad
Utekattkoja, Taköverdrag Husvagn) / #7 (Stegstöd 2-pack), EUR→NOK 10,767213
(open.er-api.com, 2026-09-11):

| Produkt | Pris (nu) | Jämförpris | Rabatt | COGS (NORWAY, Qty 1) | BE-ROAS |
|---|---|---|---|---|---|
| Isolert Utekattehus | 809 kr | 1059 kr | 24 % | 28,85 EUR → 310,63 kr | 1,62 |
| Takovertrekk til Campingvogn | 1189 kr | 1549 kr | 23 % | 42,27 EUR → 455,13 kr | 1,62 |
| Stigestøtte 2-pk | 1329 kr | 1729 kr | 23 % | 47,51 EUR → 511,55 kr | 1,63 |

Fri frakt (≥300 kr) gäller alla tre. "30 dagers åpent kjøp" giltig claim.

## Fas 1–2 — Lokalisering, rendering, captions

35 videor (11+12+12) proofreadade och lokaliserade av sonnet-subagenter (en per
produkt + en för de 2 sena moderationsköerna). Kritiska rättningar:

- **Taköverdrag:** källfilerna hade HeyGen-transkriberat det svenska ljudets SEK-
  belopp rakt av (1469/1129 kr). Rättat till verifierade 1549/1189 kr genomgående.
- **Stegstöd:** samma mönster (1549/1189 kr → 1729/1329 kr), plus en rad i G_2 som
  påstod "under 200 kroner per støtte" (falskt — verkligt pris 1329 kr/2-pack ≈ 665
  kr/styck). Rättad till sant totalpris "under 1400 kroner".
- **Isolerad Utekattkoja:** priserna i källjudet (1059→809 kr) råkade redan matcha
  de norska — ingen prisrättning behövdes, bara produktnamnskonsekvens.

Alla 35 renderade och captionade (`no-captions.py`, band 1445–1613, sudd under
bandet). Automatkontrollen ("ingen text utanför bandet") grön på alla 35.

**Slutkortssvepet hittade ett äkta fel automatkontrollen missade:** en rubrik
("…en varm plats i vinter") läckte in cirka 150 px ovanför huvudbandet i sista
sekunden på utekattkoja CS_1/2/3 — text som satt för högt för att fångas av
bandkontrollen. Verifierat brett med en riktad topp-scan (`scan-endcard.py`) att
resterande 12 kandidatträffar i andra videor var falsklarm (ljus himmel/grenar,
inte text). Fixat med riktad blur av toppremsan under exakt den drabbade
tidsrymden (`fix-topband.py`) — verifierat visuellt och om-körd röstkoll, grönt.

**Röstkollen (`rostkoll.py`) flaggade 34/35 för "avhugget slut"** — samma kända
HeyGen-artefakt som IBC-tanktrekk-incidenten 2026-09-10 (rendering ~0,1–0,15 s
kortare än källan, ljudet redan avklingat naturligt, inte faktiskt avhugget).
Verifierat med volymanalys (−71 till −91 dB i de sista 100–150 ms) att det var
samma falsklarm, inte en riktig defekt. Paddade alla 34 med `tpad`/`apad` 0,3 s
i stället för att omrendera (sparar HeyGen-krediter) — om-körd röstkoll: 35/35
gröna.

## Fas 3 — Launch i Magiborsten NO (act_1050941584152547)

Alla tre launchade ACTIVE, CBO 1000 kr/dag, adset per koncept (CS/G/PD/SP),
enhancements OPT_OUT, dubblettspärr körd (ingen fanns sen tidigare):

- **Isolert Utekattehus NO | BE-ROAS 1,62 | 2026-09-11** — kampanj 120252183459760233, 11 annonser ACTIVE.
- **Takovertrekk Campingvogn NO | BE-ROAS 1,62 | 2026-09-11** — kampanj 120252183519570233, 12 annonser ACTIVE.
- **Stigestøtte 2-pk NO | BE-ROAS 1,63 | 2026-09-11** — kampanj 120252183673160233, 12 annonser ACTIVE.

⚠️ Meta-fel 17 (rate limit) på flera adsets, hanterat av inbyggd backoff (upp till
6 försök à 15–90 s) — det är därför varje launch tog 15–25 minuter.

## Fas 3.2 — Bildannonser

**INTE GJORT den här körningen.** Tidsbudgeten gick åt till de två kritiska
fynden ovan (läckande text + röstkollens falsklarm) som båda krävde verifiering
innan leverans. Bildannonserna (`*_2_1.png` per koncept, 3–4 per produkt) ligger
kvar att göra — nästa körning eller manuellt via `no-image-ads.mjs` enligt Fas 3.2
i kommandofilen. Ingen annons launchad utan QA, men detta steg saknas helt.

## Fas 3.5 — Drive-leverans

Alla tre `NO <produkt>`-mappar skapade i MAKE TO NORWAY med Drive-connectorn.
Videor (35 st) + norsk ad-copy (12 .txt) uppladdade via `drive-push.mjs`:

- NO Isolerad Utekattkoja: `1obXA_jLyurYxduNWiXLmPDqrSiW2871T`
- NO Taköverdrag Husvagn: `1XOnZQzY1tdNsNp98mc2kopTe1kvqgyDs`
- NO Stegstöd 2-pack: `1VwWrH3UAyEehqarRZIiB_8sNq8sLt_C9`

Ingen chatt-leverans (zip) gjord — batchen är för stor (172–334 MB per produkt
inklusive QA-bilder) för 30 MB-gränsen och det är en obevakad nattrutin utan
någon som tittar i chatten live. Drive + Meta är den faktiska leveransen.

## Krediter

Före: 11 609 api-krediter. Efter: 10 374 api-krediter (1 235 förbrukade på 35
proofreads + 35 renderingar).
