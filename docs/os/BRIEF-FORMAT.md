# Brief-formatet — normativt för ALLA briefer (video + bild)

**Axels beslut 2026-08-19.** Bakgrund: det har blivit missförstånd hos
redigerarna (Filippinerna) om vad som faktiskt ska hända i en annons — har den
voiceover eller inte, vad som är text-i-bild, vad som är instruktion. Briefen
ska vara skriven så att en 10-åring förstår den. Varje brief som inte följer
det här formatet är fel, oavsett hur bra innehållet är.

## De fyra reglerna

### 1. Ingen primärtext i briefer
Redigerarna rör aldrig primärtexten (texten ovanför annonsen i flödet) — den
sätts i Ads Manager vid launch och är **ingen testvariabel**.

- Primärtexten skrivs **EN gång per produkt** (av `/forsta-batch` eller
  `/ny-produkt`, via sonnet-subagenten enligt modellpolicyn) och sparas i
  `products/<id>/primary-text.md`. Samma text återanvänds på alla annonser.
- Primärtext testas **bara om Axel uttryckligen ber om det** i argumenten.
- Briefer och Notion-items innehåller aldrig primärtext.

### 2. Inga edit instructions
Redigerarna är bra på att själva hitta klipp som matchar texten — men dåliga på
att följa klipp-för-klipp-instruktioner de inte förstår. Därför:

- **Ingen shot list, ingen editing direction, ingen klipp-för-klipp-styrning**
  i redigerarbriefer. Briefen ger manuset (hooks + body) och text-overlays —
  redigeraren väljer klippen.
- Undantag: UGC-inspelningar med kreatör (`/ugc`) får inspelningsinstruktioner
  — kreatören ska ju filma nytt material, inte klippa befintligt.
- De globala reglerna gäller fortfarande och står i zip-README:n: rätt pris
  överallt, produkt i bild före sekund 4, svenska captions ord-för-ord,
  exportformat 9:16 + 4:5 (video) resp. 1:1 + 1080×1350 (bild).

### 3. Hooks testas på VIDEO, aldrig på bild — max 3 hooks per videokoncept
Video är dyrast att producera — därför ska varje videokoncept ge data på flera
hooks. Bilder är billiga och testas som varianter i stället.

- **Videokoncept: alltid 2–3 hookvarianter (aldrig bara 1, aldrig fler än 3)**:
  samma body, bara de första ~3 sekunderna byts. Naming: `_H1`, `_H2`, `_H3`
  på samma AD-ID. Ett videokoncept med en enda hook är slöseri.
- **Bildannonser testar ALDRIG hooks** — de får variantsiffror (`_1`, `_2` …),
  aldrig H-ID.
- Antalet koncept styrs av kvoten som vanligt — det här ändrar inte
  batchstorleken, bara att varje videokoncept bär flera hooks.
- Varje hook är en egen hypotes — skriv vad varje hookvariant testar.

### 4. "AT A GLANCE"-rutan — obligatorisk överst i varje brief
Första blocket i varje brief (engelska) svarar på allt en redigerare annars
måste gissa. Mall:

```
== AT A GLANCE ==
Ad name(s):      Enginecover_PD_9_H1 / _H2 / _H3
Format:          Video 9:16 (also export 4:5)   [or: Static image 1:1 + 1080x1350]
Length:          ~25 seconds
VOICEOVER:       YES — Swedish. Use the audio file in the folder / the script below.
                 [or: NO — no voice at all. Text on screen + music only.]
TEXT ON SCREEN:  YES — captions word for word from the "Swedish (use this)" column.
MUSIC:           Yes, calm background music (your choice).
HOOKS:           3 versions of this ad. Same body — ONLY the first 3 seconds differ.
YOUR JOB:        Pick clips from the source folder that match each line of the
                 script. You choose the clips — there are no shot-by-shot
                 instructions in this brief.
```

- **VOICEOVER: YES/NO ska alltid stå i versaler** — aldrig underförstått,
  aldrig utelämnat.
- **Vid voiceover: två separata tabeller, aldrig blandat.**
  `VOICEOVER SCRIPT — this is SPOKEN (generate/record exactly this)` och
  `TEXT ON SCREEN — this is WRITTEN in the video`. Det ska vara omöjligt att
  missförstå vilka rader som ska bli röst och vilka som ska bli text i bild.
  Säg exakt var VO-filen finns, eller att redigeraren ska generera den från
  VO-tabellen.
- Efter rutan: hook-tabellen (H1/H2/H3), body-manuset, text-overlays — allt
  svenskt i tabell `Swedish (use this) | English meaning` — samt "DO NOT"-listan
  (förbjudna priser m.m.). Inget annat.

## Video-briefer och bild-briefer har olika läsare — skriv därefter

| | **Video-brief** | **Bild-brief** |
|---|---|---|
| Läses av | Redigerarna (Filippinerna, engelska som andraspråk) | AI:n i bild-pipelinen (+ Axel som skummar) |
| Nivå | **För en 10-åring.** Kort, enkel engelska, inga fackord | Får vara hur teknisk och detaljerad som helst — AI läser AI |
| Krav | AT A GLANCE + VOICEOVER YES/NO + de två tabellerna | Börjar med **"WHAT THIS AD IS"** — 2–3 rader enkel svenska/engelska så Axel förstår vad annonsen handlar om. Resten fritt |
| Hooks | 2–3 per koncept | Aldrig — variantsiffror |

## Notion-itemets namn visar alltid typen

Redigerarna gör **bara videoannonser** — de ska se direkt i listan vad som är
deras. Itemnamnet i Notion är därför alltid:

- `VIDEO — Enginecover_PD_9_H1`
- `IMAGE — Enginecover_SO_3_2`

Prefixet i versaler + ` — ` + annonsnamnet exakt enligt naming-strukturen.
(Annonsnamnet i Ads Manager har inget prefix — det gäller bara Notion-itemet.)

## Checklista för varje brief (bockas av i leveransen)

- [ ] AT A GLANCE-ruta överst, VOICEOVER: YES/NO i versaler
- [ ] Vid voiceover: VOICEOVER SCRIPT-tabell och TEXT ON SCREEN-tabell separata
- [ ] Ingen primärtext
- [ ] Ingen shot list / editing direction (utom UGC-inspelning)
- [ ] Video: 2–3 hooks per koncept (aldrig 1, aldrig 4+). Bild: inga hooks alls
- [ ] Bild-brief börjar med "WHAT THIS AD IS" på 2–3 enkla rader
- [ ] Notion-itemnamn: `VIDEO — <annonsnamn>` eller `IMAGE — <annonsnamn>`
- [ ] Swedish/English-tabeller för allt som syns eller hörs i annonsen
- [ ] Video-briefen: en 10-åring (eller en stressad redigerare på engelska som
      andraspråk) kan läsa den och veta exakt vad som ska göras
