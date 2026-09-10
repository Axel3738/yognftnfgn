# NO-videobatch 2026-09-10 — status

Rutin: `/translate-no` (`.claude/commands/translate-no.md`). Källa: Drive-mappen
LAUNCHED (`1-vbYhYgTEv7zYptW5rGmgKAITmAz4l1X`).

⚠️ Sessionens lokala `main` hade divergerat kraftigt från `origin/main` (161
lokala commits mot 174 nya på origin). Kontrollerat: local-only-innehållet
(bl.a. 2026-09-04-batchen) finns redan i origin med identiskt träd-hash —
origin/main är alltså strikt före (bär bl.a. hela pnl-app, hemvakten,
tankguard som saknades lokalt). `main` synkades mot `origin/main` innan
körningen startade.

## Inventering (Fas 0)

LAUNCHED innehåller nu bara **2 produktmappar** (kraftigt nedstädat sedan
2026-09-07 då det låg 20 st där) — Axel har tydligen flyttat/städat resten:

- Adventskalender Racingbilar
- Pälsborste till Dyson-dammsugare

Båda har redan en `NO <namn>`-mapp i MAKE TO NORWAY OCH en kampanj i
act_1050941584152547 → **0 nya kandidater** enligt dubblettspärren.

## Komplettering (inte en ny launch)

Vid genomgång av de två befintliga NO-mapparna var **Pälsborste till
Dyson-dammsugares NO-mapp halvfärdig**: 12 videor + 4 adcopy fanns, men
**0 bildannonser** — och Meta-kampanjen (`Pelsbørste NO | BE-ROAS 1,64 |
2026-09-04`) hade bara de 12 video-annonserna, inga bildannonser. Källmappen
har bilder för G/PD/SP (ingen för CS — konsekvent, källan saknar CS-bild).

Kompletterat enligt Fas 3.2:
1. Pris/claims verifierade mot beverbutikken.no: 479 kr, jämförpris 623 kr,
   23 % rabatt — oförändrat sedan launch, matchar befintlig video-copy.
2. Svensk text i G/PD/SP-bilderna rensad med Kie AI (`google/nano-banana-edit`).
   G behövde en andra omgång — första passet missade underrubriken.
3. Norsk text skriven av sonnet-subagent (samstämmig med de norska
   video-annonsernas tonläge), tre-frågorstestet redovisat av subagenten.
   Norsk text ritad deterministiskt med PIL (`compose-no.py` i denna mapp).
   SP: Kie-rensningen tog bort hela den ljusa rutan (inte bara texten i den)
   — ritade om en halvgenomskinlig ruta i samma läge som originalet innan
   texten. ★-glyfen saknas i Liberation Sans (samma kända problem som
   ✓-tecknet) — stjärnorna är ritade som polygoner, inte textglyfer.
4. QA:ad visuellt (samtliga tre bilder) — inget svenskt kvar, ingen felstavning.
5. Levererat i chatten (zip). Uppladdat till Drive-mappen "NO Pälsborste till
   Dyson-dammsugare" (`1sYvv58NDuGlvJQS4N9qd5_BSXqBY1srK`) — G och PD fick
   göras om en gång efter ett HTML-svar från Drive-brevlådan (transient fel).
6. `node no-image-ads.mjs waves/no-palsborste-video.config.mjs
   --imgdir=… --slug=Palsborste` — 3 nya bildannonser (Pelsbørste_NO_G_2_1,
   _PD_2_1, _SP_2_1), ACTIVE, in i respektive befintliga koncept-adset.
   Verifierat efteråt i API:t: kampanjen har nu 15 annonser (12 video + 3
   bild), alla ACTIVE.

Ingen HeyGen-kredit förbrukad (ingen video renderades i natt).
Kvar innan/efter: 11 909 api-krediter (oförändrat).

## Adventskalender Racingbilar

Redan helt klar (16 annonser, 12 video + 4 bild, alla ACTIVE, launchad
2026-09-09). Ingen åtgärd.

Ingen kö till i morgon — LAUNCHED-mappen är tom på fler kandidater just nu.
