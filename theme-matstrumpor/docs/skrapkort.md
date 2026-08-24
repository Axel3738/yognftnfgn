# Skrapkortet — e-postklubbens popup

> **Patch till redan installerade butiker:** `delat/FIXA-SKRAPKORT.md` — en
> sök-och-ersätt-instruktion som rättar besöksspärren och rubrikbrytningen
> utan att röra butikens egna texter och färger. Sökblocken är verifierade mot
> den version som skickades ut 2026-08-23.
>
> **Delbar version:** `delat/skrapkort-delbar.liquid` är en fristående,
> brandneutral kopia som Axel skickar till vänner med andra butiker.
> Färger och alla texter är sektionsinställningar, installationsguiden
> ligger som kommentar högst upp i filen. Uppdateras skrapkortet i skarp
> drift ska den delbara kopian följa med.

`sections/ms-skrapkort.liquid`, ligger i footer-gruppen så den följer med på
alla sidor. Självbärande: markup, stil, skript och inställningar i samma fil.
Byggd 2026-08-23 på Axels beställning (förebilden var en skrapkorts-app).

## Flödet

1. **Skrapa.** ~7 s efter sidladdning (inställbart; 6–7 s var Axels riktmärke
   från andra butiker) öppnas en **fullskärms**-`<dialog>` i märkesorange med
   ett guldigt skrapkort — guldgradient, glansband, skrapmärken och präglad
   text målas i canvasen. Krysset är medvetet lågmält (55 % opacitet) så
   kortet är det man interagerar med, men det är 44 px och alltid klickbart,
   och ESC fungerar. Foliet suddas med fingret (`destination-out`); vid ~40 %
   bortskrapat visas vinsten.
2. **Mejl.** Koden lämnas ut mot mejladress. Formuläret är Shopifys eget
   `{% form 'customer' %}` med taggarna `newsletter,skrapkort` — adressen blir
   en riktig prenumerant i Shopify och följer med till Klaviyo (tagga gärna
   segment på `skrapkort`). Shopify laddar om sidan efter POST; skriptet läser
   flaggan `form.posted_successfully?` och öppnar popupen igen i klart-läget.
3. **Klar.** Koden visas och knappen lägger den i kassan via
   `/discount/<kod>?redirect=/`.

## Rabattkoden

**`KLUBB10`** — riktig `DiscountCodeBasic` i Shopify, skapad 2026-08-23
(id `gid://shopify/DiscountCodeNode/1830184976723`):
10 % på hela köpet, **en gång per kund**, kombinerar inte med något.

⚠️ **Vi har skapat den koden.** Regeln "stäng av koder vi inte skapat" gäller
inte KLUBB10 (och inte GLÖMD).

⚠️ Shopify tar **en kod per köp**. Paketpriserna är också koder, så KLUBB10
kan aldrig staplas på ett paketpris — kassan tar den ena eller den andra.
Det står i popupens finstilt. Lova aldrig något annat i copy.

## Minnet — två lager

**Besöksspärren** (`sessionStorage` `ms-skrap-besok`): popupen visas **högst en
gång per besök**. Märket sätts i samma stund den öppnas — inte när den stängs.

**Mellan besök** (`localStorage` `ms-skrap`):

| Värde | Betyder |
|---|---|
| `klar` | prenumerant — visas aldrig igen |
| `skrapad` | skrapade klart men mejlade inte — mejlsteget återkommer nästa besök |
| `vila:<ms>` | aktivt nej tack — vilar i valt antal dagar (standard 3) |
| `visad:<ms>` | sedd men obesvarad — vilar lika länge som ett nej |

Postat formulär (`posted_successfully?`) och formulärfel kollas **före**
besöksspärren, annars skulle kunden som just mejlat aldrig få se sin kod.

## Fallgropar som redan är lösta

- **Paddingklick stängde popupen.** Klick med `target = dialogen` är både
  bakgrund OCH dialogens egen padding. När skrapsteget byttes mitt i
  gnuggandet landade nästa klick på paddingen och stängde allt. Därför
  koordinatkollen mot `getBoundingClientRect()` — bara äkta bakgrundsklick
  stänger. (I fullskärmsläget finns ingen bakgrund alls, så kollen är
  vilande — men den skyddar om dialogen någon gång görs mindre igen.)
- **Popupen kom tillbaka på varje ny sida (2026-08-24, Axel på skarp sajt).**
  Minnet skrevs bara i `close`-lyssnaren. Kunden som ser popupen och klickar
  vidare till en produktsida stänger aldrig något — inget sparades, och efter
  7 s på nästa sida öppnades den igen. Fixen är två spärrar: `visad:<tid>`
  skrivs i samma stund popupen öppnas, och en sessionsflagga stoppar den helt
  under resten av besöket. Regeln som sitter kvar: **skriv minnet när något
  visas, inte när någon svarar** — de flesta svarar aldrig.
- **Sista bokstaven hoppade ner på egen rad (2026-08-24).** Rubriken blev
  `VÄLKOMSTRABAT / T`. Temat sätter `word-break: break-word` på rubriker, så
  ett ord som är en aning för brett kapas mitt itu. Rubriken räknade dessutom
  sin storlek på skärmens bredd (`vw`) trots att rutan är smalare. Nu:
  `word-break: normal` (ord bryts aldrig), storlek i `cqw` (rutans bredd), och
  en JS-krympning som sista skydd. **ResizeObserver duger inte** som trigger —
  rubriken är alltid 100 % bred, så dess egen storlek ändras aldrig när texten
  växer; därför efterkontroller vid 150/600/1500 ms plus `document.fonts.ready`
  (butikens typsnitt laddas asynkront och är ofta bredare än reservtypsnittet).
- **Dawns fokusring gjorde krysset till en vit låda.** `showModal()`
  fokuserar första fokuserbara elementet = stängkrysset, och Dawn målar en
  vit ring + outline på fokus. Dialogen har `tabindex="-1"` och tar själv
  fokuset efter öppning; krysset har en egen diskret fokusstil för
  tangentbordsanvändare.
- **Fördröjningen ser trasig ut i lokala speglar.** På `file://` dröjer
  `DOMContentLoaded` ~10 s (defer-skripten misslyckas långsamt), så timern
  hinner fyra före första mätpunkten. På riktiga sajten är fördröjningen
  verklig — verifiera med `window.__timrar`-wrappen i stället för klockan.

## Inställningar (temaredigeraren → footer → Skrapkort e-postklubb)

Rubrik, underrubrik, rabattkod, rabattext, fördröjning (3–30 s),
vilodagar (1–30) och en avstängningskryssruta. Koden skapas INTE av popupen —
den måste finnas i Shopify och `rabatt_text` ska stämma med vad den ger.
