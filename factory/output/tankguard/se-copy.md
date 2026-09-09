# TankGuard SE — vad som faktiskt kan köras

Skriven 2026-09-08 av `/ny-annonser tankguard`. Underlaget är en workflow med
51 agenter (0 fel): sju copy-block omskrivna av en skribent (sonnet, modellpolicy
regel 6) och granskade av tre linser vardera, femton block motprövade mot
huvudsessionens klassning, och en slutkritiker över alltihop.

## Slutsatsen, på en rad

**Att skriva om annonstexten räcker inte.** 24 av 34 svenska creatives bär
källbutikens påståenden **inbränt i bilden eller uppläst i ljudet** — jämförpriset
636 kr, 23 %-rabatten, fri frakt, Klarna, öppet köp, stjärnbetyg, "lagret krymper"
eller namnet Bäverbutiken. Meta-texten kan vara oklanderlig och annonsen ändå ljuga
i pixlarna.

## Mediagrinden — dom per CREATIVE, inte per text

Join av `brand-ocr.json` + `brand-syn.json` mot alla 34 svenska källannonser.
Skriptet: `factory/output/tankguard/se-copy.json` fältet `mediagrind`.

### ✅ Rena creatives — 10 st

| Annons | Typ | Spend | Köp |
|---|---|--:|--:|
| `PD_Extra` | video | 423 | 4 |
| `PD_2_1` | bild | 362 | 0 |
| `CO_1_1` | bild | 193 | 0 |
| `PD_4_1` | bild | 109 | 0 |
| `PD_5_1` | bild | 31 | 0 |
| `BOF_3_1` | bild | 15 | 0 |
| `PD_3_1` | bild | 10 | 0 |
| `BOF_5_1` | bild | 7 | 0 |
| `GT_2_1` | bild | 0 | 0 |
| `BOF_4_1` | bild | 0 | 0 |

⚠️ Nio av tio är bildannonser med nästan ingen spend, och **ingen av dem har ett
enda köp**. Det som är rent är alltså också det som är obeprövat.

### ⛔ Smutsiga creatives — 24 st

| Annons | Typ | Spend | Köp | Vad som sitter i mediat |
|---|---|--:|--:|---|
| `PD_1_H1` | video | 16 997 | 77 | brandnamn |
| `CS_1_H3` | video | 589 | 3 | jämförpris, påhittad brådska, brandnamn |
| `PD_1_H2` | video | 310 | 0 | brandnamn |
| `CS_2_1` | bild | 99 | 0 | jämförpris, rabatt på enstyck |
| `SP_1_H1` | video | 94 | 0 | brandnamn |
| `SP_1_H3` | video | 89 | 1 | brandnamn |
| `BOF_1_1` | bild | 61 | 0 | jämförpris, rabatt på enstyck, frakt |
| `CS_1_H2` | video | 56 | 1 | jämförpris, påhittad brådska, brandnamn |
| `PD_1_H3` | video | 32 | 0 | brandnamn |
| `GT_1_H3` | video | 15 | 0 | brandnamn |
| `CS_3_1` | bild | 14 | 0 | jämförpris, rabatt på enstyck, frakt, betalsätt |
| `GT_1_H1` | video | 12 | 0 | brandnamn |
| `SP_2_1` | bild | 12 | 0 | öppet köp |
| `GT_1_H2` | video | 7 | 0 | brandnamn |
| `PD_3_H1` | video | 6 | 0 | jämförpris, socialt bevis, brandnamn, fel tygspec |
| `SP_1_H2` | video | 5 | 0 | brandnamn |
| `RV_2_1` | bild | 5 | 0 | socialt bevis |
| `GT_3_H1` | video | 4 | 0 | jämförpris, socialt bevis, brandnamn |
| `RV_1_1` | bild | 3 | 0 | socialt bevis |
| `BOF_6_1` | bild | 2 | 0 | frakt, betalsätt, öppet köp |
| `BOF_2_1` | bild | 2 | 0 | betalsätt, öppet köp |
| `CS_4_1` | bild | 1 | 0 | jämförpris, rabatt på enstyck |
| `RV_3_1` | bild | 1 | 0 | rabatt på enstyck, socialt bevis |
| `RV_4_1` | bild | 1 | 0 | socialt bevis |

**Vinnaren är smutsig.** `PD_1_H1` — 16 997 kr, 77 köp, ROAS 2,92 — säger
"Bäverbutiken" högt och visar det i bild. Den kan inte köras förrän den är omdubbad.

### Vad det kostar att städa

| Jobb | Antal | Verktyg | Kostnad |
|---|--:|---|---|
| Bildannons: byt text i sin egen ruta | 11 | `pipeline/oversatt-bild.py` | gratis |
| Video: byt inbränd rad + dubba om | 11 | `pipeline/no-precis.py` + HeyGen | krediter (16 951 kvar) |
| Video: bygg om slutkortet | 2 | `lager.py` | arbetstid |

## De sju omskrivna texterna

Skrivna mot TankGuards eget erbjudande. Minimal ändring var kravet: byt bara det
som är falskt, lämna bevisad copy orörd.

### `CS_block` — IBC_CS_1_H2, IBC_CS_1_H3, IBC_CS_2_1

```
message:     🎁 PAKETPRIS — SPARA 18%
             
             799 kr för 2 st i stället för 978 kr. Plus 2 kranskydd Frost 420D på köpet — värde 398 kr.
             
             Frosten kommer — kranskydden skyddar utekranarna i vinter.
             
             Inga alger. Ingen spröd plast. 210D Oxford-tyg med blixtlås — på under två minuter.
             
             Beställ innan frosten tar kranarna 👇
title:       2 överdrag — spara 18%
description: 799 kr för 2 — inkl. 2 kranskydd Frost 420D, värde 398 kr.
```

Ändrat: Hook: '🎁 KÖP 2 — SPARA 18%' → '🎁 PAKETPRIS — SPARA 18%'. Tog bort köp-kommandot som första intryck (En-Mississippi-problemet), behöll emoji, tempo och siffran · Prisraden fick fullständigt produktnamn: 'kranskydd' → 'kranskydd Frost 420D'. Pekar på ett namngivet objekt i stället för ett vagt tillbehör. · Bytte hela säsongsraden: 'Vintern är på väg — skydda tanken och kranarna i samma köp' → 'Frosten kommer — kranskydden skyddar utekranarna i vinter'. Gamla raden

### `CS_3_1` — IBC_CS_3_1

```
message:     489 kr per överdrag, eller 3 för 1 099 kr. Tyget är 210D Oxford och stänger ute ljuset — algerna kommer aldrig igång. Köp 3, få 3 kranskydd på köpet — värde 597 kr.
title:       Köp 3, få 3 kranskydd gratis — 210D Oxford-tyg
description: Sitter på under två minuter.
```

Ändrat: Rad 1: bytte 'istället för 636 kr' (falskt jämförpris, finns inte för TankGuard) mot 'eller 3 för 1 099 kr' (sant paketpris) — behöll '489 kr' orört som ledtal  · Sista meningen: bytte '23 % rabatt.' mot 'Köp 3, få 3 kranskydd på köpet — värde 597 kr.' — en procentsats går inte att peka på och kan signeras av vem som hels · Titel: bytte '23 % rabatt — 210D Oxford-tyg' mot 'Köp 3, få 3 kranskydd gratis — 210D Oxford-tyg' — villkoret 'Köp 3' står nu i själva rubriken i stället för en

### `CS_4_1` — IBC_CS_4_1

```
message:     2 för 799 kr istället för 978 kr.
             179 kr mindre för samma 210D Oxford-tyg som stänger ute ljuset.
             Algerna kommer aldrig igång.
title:       2 för 799 kr istället för 978 kr
description: Spara 18 %. 2 Kranskydd Frost 420D på köpet – värde 398 kr.
```

Ändrat: Rad 2: återställde 'för samma 210D Oxford-tyg som stänger ute ljuset' som den underkända versionen strök — TankGuards egen produktfakta, och kausallänken rad 3: · Rad 2: bytte kronbeloppet 147 → 179 kr (skillnaden mellan paketpriset 799 kr och 2×489=978 kr) så meningen stämmer för paketet, inte styckpriset. · Splittade den underkända radens 'och'-mening ('179 kr mindre och 2 kranskydd på köpet') i två ytor: besparingen ligger kvar i rad 2 utan 'och', kranskyddet fick

### `GT_3_H1` — IBC_GT_3_H1

```
message:     Vet du någon som klagat på alger i sin IBC-tank i flera somrar?
             210D Oxford-tyg stänger ute solljuset – ingen alg får fäste.
             Ge bort skyddet i år. Ingen skrubbning nästa sommar.
             799 kr för 2 – ett åt dig, ett att ge bort.
title:       Ge skyddet i present. Slipp algskrubben.
description: (tom)
```

Ändrat: Bytte enbart sista raden: '489 kr (ord. 636 kr) · 4,4 av 5 på produktsidan.' → '799 kr för 2 – ett åt dig, ett att ge bort.' Jämförpriset 636 kr och betyget 4,4 · Återanvände inte 'sitter på under två minuter' från den underkända versionen: den raden svarar varken på algpåståendet eller på presentargumentet (Kaplans lag)  · Ersatte bevisledet med TankGuards egen verifierbara rabatt (2 st för 799 kr, 'Spara 18 %' mot 978 kr) — den enda äkta prisnedsättning som finns, och den operati

### `PD_3_H1` — IBC_PD_3_H1

```
message:     210D Oxford-tyg. Ingen sol når vattnet.
             210D Oxford-tyg stänger ute ljuset – algerna kommer aldrig igång.
             489 kr. Ett skydd, ingen grön tank i sommar.
title:       210D Oxford-tyg. Ingen alg.
description: (tom)
```

Ändrat: Tog bort '(ord. 636 kr)' i sista raden — jämförpris/rabatt är Bäverbutikens villkor, inte TankGuards. TankGuards enda pristrappa är 489/799/1099 kr, inget jämfö · Återställde mittraden till originalets lydelse ('stänger ute ljuset – algerna kommer aldrig igång') i stället för den underkända omskrivningen ('blockerar UV-lj

### `BOF_1_1` — IBC_BOF_1_1

```
message:     Två tanköverdrag: 799 kr i stället för 978 kr. 210D Oxford tar UV-strålningen i stället för plasten.
title:       18 % rabatt på tanköverdraget
description: Sitter på under 2 minuter. Köp 2, få 2 Kranskydd Frost 420D på köpet (värde 398 kr).
```

Ändrat: Message: bytte det falska '489 kr istället för 636 kr' mot 'Två tanköverdrag: 799 kr i stället för 978 kr' — TankGuards egen, sanna 2-pack-rabatt (18 %, kollbar · Message: kortade 'Tyget är 210D Oxford och tar UV-strålningen i stället för plasten' till '210D Oxford tar UV-strålningen i stället för plasten' — tog bort de f · Title: bytte tillbaka till erbjudande-vinkeln (samma form som originalet), bara talet ändrat: '23 %' -> '18 %'. Leder nu med produkten och slutar dubblera messa

### `BOF_3_1` — IBC_BOF_3_1

```
message:     Passar den på min tank? Måtten är 120 × 100 × 116 cm — standard för en 1000-literstank.
title:       120×100×116 cm, standard 1000L
description: Blockerar solljuset – stoppar algtillväxten i tanken.
```

Ändrat: Bytte description-raden 'Passar standard 1000-liters IBC-tank.' (tredje upprepningen av samma måttfaktum — Kaplans lag) mot 'Blockerar solljuset – stoppar algti · Nya raden hämtar ett sant, oanvänt produktfaktum (UV-block/algskydd) i stället för att lova ett returvillkor TankGuard inte har eller upprepa måtten en fjärde g

⚠️ **Sex av de sju kan ändå inte gå upp**, eftersom deras media är smutsig (se
grinden ovan). Bara `BOF_3_1` är ren i både text och creative. För de andra sex är
den nya copyn **briefen till det nya mediat**, inte en färdig annons.

## Två domar som motprovet rev

Motprovets uppdrag var att angripa huvudsessionens klassning, inte bekräfta den.
Tretton av femton höll. Två föll, och båda med rätta:

### `GT_block` — klassad REN, ska vara OMSKRIVNING

Presentannonsen är byggd som ett kundvittnesmål i första person: *"Jag gav min man
det här överdraget — utan att säga något"* och *"Nu visar han upp tanken för alla
grannar"*. Det förutsätter en genomförd order, en leverans och tillräckligt många
dagar för att grannarna ska ha sett tanken. **TankGuard har sålt noll enheter.**
Det är samma kategori som de förbjudna recensionerna, bara förpackat som UGC i
stället för som stjärnbetyg. Titeln *"Presenten han faktiskt använder"* påstår
dessutom ett utfall över kunder som butiken inte har.

Dessutom en krock ingen såg: 🎁-emojin och *"Hitta den perfekta presenten"* lovar en
gåva, men annonsen leder till enstycket — den enda nivån **utan** rabatt och **utan**
gratis kranskydd. Annonsen pekar bort från butikens erbjudande.

**Domen: omklassad till OMSKRIVNING.** Fyra annonser berörs.

### `SP_block` — klassad HÅLL, ska vara OMSKRIVNING

Här var jag för försiktig. Premissen är **inte** socialt bevis — den är en mekanik:
tyget stänger ute ljuset, därför inga alger. Det täcks ordagrant av TankGuards egna
produktfakta. Källbutiken sitter i exakt fyra fragment: stjärnraden, "hundratals
trädgårdsägare", "se varför kunderna älskar det" och description-raden. Hooken, hela
✓-blocket och titeln är noll procent källbutik.

Motprovet har rätt i en metodkritik också: jag dömde fyra annonser på **en** annons
copy. Det bryter mot regel 3 — inga slutsatser på data man inte läst.

**Domen: omklassad till OMSKRIVNING** — med ett tillägg motprovet missade.
Hooken *"Äntligen klart vatten i tanken — inga alger på hela sommaren!"* står inom
citattecken. Stryks bara stjärnorna läses den fortfarande som ett kundcitat.
**Citattecknen ska bort tillsammans med stjärnorna** — annars är det ett vittnesmål
utan vittne.

## Vad kritikern hittade som ingen lins såg

1. **Arbetet lades på fel sju.** De sju block som skrevs om är exakt de vars media är
   smutsig. De sex creatives som är bevisat rena (`PD_2_1`, `PD_4_1`, `PD_5_1`,
   `CO_1_1`, `BOF_4_1`, `BOF_5_1`) behövde ingen copy alls.
2. **Ingångspriset drev iväg.** För att bli av med 636 kr bytte fyra av sju block
   ankare till 2-packet och ett till 3-packet. Ingångspriset i majoriteten av kontot
   gick därmed från 489 kr till 799 kr — **+63 %**. Det är sant, men det är ett
   erbjudandebeslut, och det är Axels att fatta, inte skribentens.
3. **Motsägelse inuti samma annons.** `CS_block`s nya text säger "spara 18 %" medan
   videon under den säger "25 procent rabatt … bara idag" och "halva priset just nu".
4. **Landningssidan säger ett annat jämförtal.** Annonserna säger "799 kr i stället
   för 978 kr"; produktsidan visar överstruket **1 376 kr**. Någon måste bestämma om
   annonsen ska följa sidan eller sidan följa annonsen.
5. **Fel tygspec i en video.** `PD_3_H1` säger **220D** Oxford i inbränd text
   (11,7–14,4 s). Produktfaktan är 210D. Felet finns i källan och ingen har sett det.
6. **Bonusen är oprövad.** Fyra annonser lovar gratis Kranskydd Frost 420D. Ingen har
   kontrollerat att den faktiskt hamnar i korgen. En utlovad gratisprodukt som inte
   dyker upp i kassan är värre än något jämförpris.

## Vad som händer när butiksfilen kommer

Ordningen är given av grinden ovan, inte av vad som är lättast:

1. Bestäm ingångspriset (489 eller 799) och om annonsens jämförtal ska matcha sidans.
2. Städa de 11 bildannonserna — gratis, ingen väntan.
3. Dubba om de 13 videorna, med röstkontrollen på varje fil.
4. Bygg om de två slutkorten: ordmärke, bäversymbol, "10 recensioner", 636/489.
5. Ladda upp media i målkontot och fyll kampanjskalet som redan står där.
