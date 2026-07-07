# Creative Strategy — från insikt till manus

Det här är **hjärnan** i video-pipelinen. `docs/playbook.md` säger *vad* som funkar
(vinklar/hooks/format). Det här dokumentet säger *hur* vi översätter en bevisad insikt
till ett **video-manus** som en människa kan läsa och en maskin (Higgsfield) kan generera.

> Loopen är samma som för statics — hypotes → bygg → testa → analysera → lär → iterera.
> Video byter bara ut *bygg*-steget: istället för en bild med overlay bygger vi en
> **kort klippsekvens med brända captions**.

---

## 1. Var idén kommer ifrån (aldrig ur tomma intet)

Ett video-koncept får bara födas ur en av tre källor — annars är det en gissning:

1. **Playbook-vinnare** (`playbook.md`) — en angle/hook som bevisats i ≥2 tester.
2. **Winning line** (`winning-lines.md`) — en punchline som redan spenderat pengar bra.
3. **Konkurrent-signal** (`bof-concepts.md`) — något en konkurrent *skalar* (lång runtime,
   många varianter) som vi inte äger än.

Varje koncept i `video/waves/wave-XX.mjs` ska kunna peka på sin källa i en kommentar.

---

## 2. Manus-strukturen (5 beats)

En BOF-video för varm publik är **kort** (12–25 s). Den introducerar inte produkten —
den krossar den sista invändningen. Fem beats, i den här ordningen:

| Beat | Sekund | Jobb | Regel |
|------|--------|------|-------|
| **HOOK** | 0–3 s | Stoppa scrollen. Visuell chock eller rak påstående-rad. | Ingen logga, ingen intro. Börja *mitt i* problemet. |
| **PROBLEM** | 3–7 s | Namnge smärtan/invändningen konkret. | Använd en bevisad line, inte en ny. |
| **MEKANISM/DEMO** | 7–14 s | Visa *varför* Mastern löser det. Rörelse säljer här. | Detta är videons existensberättigande — en still kan inte göra det. |
| **PROOF** | 14–18 s | En hård fakta, ett kundcitat eller före/efter-bevis. | Siffra > adjektiv. |
| **CTA** | 18–22 s | Endcard: produkt, pris, riskreversering, knapp. | Håll priset. Garantin tar bort risken, inte rabatt. |

Alla beats behövs inte i varje film. En ren **demo-film** kan vara HOOK → DEMO → CTA.
En **auktoritets-film** kan vara HOOK → PROBLEM → PROOF → CTA. Men ordningen är alltid
uppifrån och ner i tabellen.

---

## 3. Hook-second-regeln

95 % av avhoppet sker i de första 3 sekunderna. Därför testar vi hooken som en **egen
variabel**. Samma film, tre olika första 3-sekunders-shots = tre ads, samma `angle`,
olika `hook`-slug. Det är den billigaste lärdomen i hela systemet.

---

## 4. Två-stegs-produktion (samma filosofi som statics)

Statics: Higgsfield renderar bakgrunden, vi lägger **skarp vektortext** ovanpå (modellen
slipper rendera text den ändå är dålig på). Video gör exakt likadant:

```
  1. Higgsfield genererar RÖRELSEN per shot (image2video / text2video), ingen text i bild
  2. compose.mjs (ffmpeg) klistrar SKARPA captions + endcard ovanpå — pixelperfekt
```

Captions renderas som en **.ass-fil** (brand-färgad undertext) och bränns in med ffmpeg.
Endcardet byggs separat och konkateneras sist. Modellen ombeds *aldrig* rendera text.

---

## 5. Format & specs

| Sak | Värde | Varför |
|-----|-------|--------|
| Aspect | **9:16** (1080×1920) | Reels/Stories = det rörliga BOF-placementet |
| Längd | 12–25 s | BOF varm publik; kortare = fler completes |
| Ljud | Valfritt VO/musik, men **funka utan ljud** | Feed spelas mute → captions bär budskapet |
| Safe zone | Håll text inom mittersta 80 % | UI täcker topp/botten i Reels |
| Första frame | Måste stå på egna ben | Blir thumbnail + hook rate mäts här |

---

## 6. Namngivning (video)

Samma konvention som statics (`naming-convention.md`), med `FORMAT = video` (eller mer
specifikt `demo` / `beforeafter` / `talkinghead`). Placement blir `reels`.

```
GRILL_mastern_benefit_video_90sec_v1
│     │       │       │     │     └ iteration
│     │       │       │     └ hook-slug
│     │       │       └ format = video
│     │       └ angle
│     └ produkt
└ brand
```

Hook-testet: `..._video_90sec_v1`, `..._video_grossout_v1`, `..._video_steel_v1` —
samma film, olika 3-sek-hook.

---

## 7. Definition of done (innan vi spenderar på generering)

Ett koncept är redo att generera (live) först när `--dry` producerat och du godkänt:

- [ ] **Storyboard** (`storyboard-<name>.md`) — beats, shots, timing läsbart
- [ ] **Captions** (`<name>.captions.ass`) — alla lines stavade rätt, timade
- [ ] **Shot-prompts** (`<name>.shots.json`) — varje shot har prompt + rörelse
- [ ] Varje line finns eller härleds ur `winning-lines.md` (inga nya påståenden)
- [ ] Produktsanning backar varje claim (jfr materialfrågan i `bof-concepts.md` A)

Dry-läget kostar 0 kr och 0 API-anrop. Vi granskar kreativet *först*, genererar *sen*.
