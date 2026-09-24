# NO-videobatch 2026-09-24 — rutinen `/translate-no`

## Fas 0 — Inventering

LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`) listad: 10 produktmappar (WINNERS,
LOSERS, MAKE TO NORWAY exkluderade). MAKE TO NORWAY listad rekursivt inkl.
undermappen WINNERS (45 NO-mappar vid start). Kampanjlistan i
`act_1050941584152547` läst (49 kampanjer, oavsett status).

Fyra kandidater (utan NO-mapp OCH utan kampanj): ATV-Kapell, Kajakhållare,
Kapell till snöslunga, Spabadskapell. Snöskyffel utan batteri och
Biltvättborste Teleskop kvarstår blockerade (kända sedan tidigare, ingen ny
produktsida på beverbutikken.no — omkontrollerade, oförändrat, ingen ny
problemrapport).

Tre körda i bokstavsordning: **ATV-Kapell, Kajakhållare, Kapell till
snöslunga**. **Spabadskapell i kö till nästa natt** (fjärde kandidaten,
max 3 per körning).

Alla tre bekräftade på beverbutikken.no innan start:
- ATV-Kapell → atv-trekk-storrelse-3xl-256-110-120-cm-svart, 539/709 kr
- Kajakhållare → kajakkholder-2-pk-veggkroker-som-taler-45-kg, 809/1059 kr
- Kapell till snöslunga → trekk-til-snofreser-120-82-60-cm-holder-skitt-unna, 389/509 kr

Norge-COGS ur batch-sheet #10 (NORWAY-blocket, Qty 1, ingen tull):
19,17 / 28,80 / 13,79 EUR. Dagskurs EUR→NOK 10,800056 vid uträkning.
BE-ROAS 1,62 för alla tre.

## Kvot

Vid start: **822 api-krediter**. Vid slut: **24**. Förbrukat: **798**.

⚠️ Ett eget processfel kostade krediter: proofread för alla tre produkter
kördes parallellt mot samma manifest/state-fil tidigt i körningen (exakt
racet CLAUDE.md varnar för under "Rutiner ärver inte..." / se avsnittet om
parallella körningar mot samma konto) — Kapell till snöslungas 12
proofreadId:n tappades och fick göras om från grunden. Grov spillkostnad:
~144 krediter. Lärdom skriven i `docs/video-localization.md`.

## Resultat per produkt

### ATV-Kapell — stoppad, kvot
Proofread + norsk SRT-lokalisering klar för alla 12 videor
(`srt-fixed/atv-kapell_*.srt`, committat). **Ingen rendering, ingen
Meta-aktivitet.** NO-mappen i Drive skapades och togs bort igen (var tom —
en tom mapp hade lurat morgondagens dubblettspärr att tro produkten var
klar). Proofread-id:n finns kvar i `batch.json.state.json` — nästa körning
kan gå direkt på `apply` + `render`, ingen ny proofread-kostnad.
Rättelser i SRT: HeyGens transkription hade fel SEK-pris (579/759 kr i
stället för 539/709 kr) i alla tre CS-videor; "Sverige"-omnämnande i
SP-konceptet borttaget.

### Kajakhållare — delvis, 4 av 10 videor live
**Verifierat mot Meta-API:t av orkestratorn (inte bara agentens egen
rapport):** kampanj `120252363909390233` "Kajakkholder NO | BE-ROAS 1,62 |
2026-09-24", **ACTIVE**, CBO 1000 kr/dag. 3 adsets ACTIVE (GT/CS/PD — inget
SP-adset, ingen SP-video klarade sig). 4 annonser ACTIVE/PENDING_REVIEW:
`Kajakkholder_NO_GT_1_H1`, `_GT_1_H3`, `_CS_1_H2`, `_PD_1_H1`.
Bildannonser (Fas 3.2): **0 — hann inte göras**, kvar till nästa körning.

Pris: jämförpriset höjt 1059 → **1349 kr** (verifierat live på
beverbutikken.no) eftersom HeyGens 40 %-rabattclaim i copyn inte stämde mot
butikens ursprungliga 24 %-rabatt — höjt enligt prispolicyn i stället för
att ändra claimet. Grundpriset 809 kr oförändrat. BE-ROAS 1,62 håller.

Drive: **NO Kajakhållare** (`1HHUOH_pSNxfCJxgCRUF_2cdc7xlJFmhS`) —
verifierat innehåll: 4 videor + 4 ADCOPY-txt (alla fyra koncept, även SP
trots att SP-videon inte launchades).

6 videor kvar till nästa körning: SP_1_H1, SP_1_H3, PD_1_H3 (RENDER FAIL,
kvot tog slut mitt i — proofreadId:n finns kvar) samt CS_1_H3, GT_1_H2,
PD_1_H2 (renderades men underkändes av röstkollen — avhugget slut, dubben
7–16 dB för hög i sista 100 ms — måste renderas om från proofread).

### Kapell till snöslunga — stoppad, kvot
Proofread gjord **två gånger** (se racet ovan) — alla 12 videor
omproofreadade och lokaliserade på nytt, `srt-fixed/kapell-till-snoslunga_*.srt`
committat. Källmappen saknade CS-adcopy-dokument — CS-copyn skriven av
huvudsessionen. **Ingen rendering, ingen Meta-aktivitet.** NO-mappen skapad
och borttagen igen (samma skäl som ATV-Kapell). Proofread-id:n finns kvar —
nästa körning går direkt på `apply` + `render`.
Rättelser i SRT: fel SEK-pris (450/599 → 389/509 kr), fel mått i ett fall
(120×80×60 → 120×82×60), fabricerade kundcitat mjukade till generiska
påståenden.

## Kö till nästa natt

1. **Spabadskapell** — fjärde kandidaten, aldrig påbörjad (max 3/natt).
2. **ATV-Kapell** — rendering + captions + launch, SRT klar.
3. **Kapell till snöslunga** — rendering + captions + launch, SRT klar.
4. **Kajakhållare** — 6 videor kvar (3 aldrig renderade, 3 underkända av
   röstkollen) + Fas 3.2 bildannonser.

Kör ALDRIG `translate-batch.mjs` för flera produkter parallellt mot samma
manifest/state-fil — kostade ~144 krediter i natt.
