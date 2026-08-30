# Manuella steg i Shopify admin (klistra-in-färdigt)

Allt nedan gick inte att göra via API:t. Ordningen är prioritetsordning.

## 0. Publicera temat — ✅ KLART (Axel publicerade 2026-08-29)

## 0b. Publicera "Hjärtkompis v4 (utkast)" (ett klick)

Temat duplicerades via API:t (`themeDuplicate`) 2026-08-29 och det senaste
utkastet **"Hjärtkompis v4 (utkast)"** innehåller allt som inte gick att
skriva i live-temat (v2/v3 är redan publicerade av Axel — v4 lägger till
VoC-texterna på startsidan + FAQ-sektionen på produktsidan):
- One-product-startsida: sortiment-sektionen borttagen, båda CTA-knapparna
  går direkt till Tvillingkudden, UGC-bilder i galleriet, berättelse-texten
  rättad till plysch/vit kant.
- **USA-paletten** (Axels beslut, samma stil som förlagan): lila `#7C4EC4`
  på knappar/accent/marquee, gräddvit `#FFFDF4` bas, ljuslila `#F6F0FF` och
  ljusrosa `#F9D9E5` sektionsytor.

Förhandsgranska utkastet i Themes-listan → **Publish** när det ser bra ut.
(API:t får duplicera och skriva i utkast, men aldrig publicera.)
Vill du ha förlagans rundade, bubbliga typsnitt också: Customize →
Typography → t.ex. Baloo/Quicksand — typsnittsbyte är säkrast att göra i
temaredigeraren.

## 1. Byt butiksnamn (Settings → Store details)

Namn: **Twinpillow** *(Axels beslut 2026-08-30 — ersätter arbetsnamnet
Hjärtkompis. Motiv: varumärket ska funka i alla länder och även för
framtida människokuddar; produktnamnet per marknad är den lokala
översättningen — Tvillingkudden i Sverige.)*

Köp domänerna innan namnet används i annonser: **twinpillow.se** +
**twinpillow.com** (båda saknade DNS 2026-08-30 — verifiera i registrarens
sök, domäner kan vara registrerade utan hemsida).

## 2. Policyer (Settings → Policies)

### Returpolicy (Refund policy)

> **Retur- och återbetalningspolicy**
>
> **Ångerrätt.** Våra kuddar sys på beställning efter din egen bild och får
> därmed en tydlig personlig prägel. Enligt distansavtalslagen (2 kap. 11 §
> punkt 3) gäller därför ingen ångerrätt för dessa varor. Det berättar vi
> öppet på varje produktsida, innan du beställer.
>
> **Din trygghet i stället: garantitrappan.** Du godkänner alltid ett digitalt
> utkast av din kudde innan vi syr något. Vill du ändra något i utkastet
> justerar vi det utan kostnad, innan produktion. Blir den färdiga kudden fel
> mot det utkast du godkänt syr vi om den utan kostnad.
>
> **Reklamationsrätt.** Är varan felaktig eller går sönder i förtid gäller
> konsumentköplagens reklamationsrätt i tre år. Den påverkas inte av att
> ångerrätten är begränsad och går inte att avtala bort. Kontakta oss så
> löser vi det.

### Fraktpolicy (Shipping policy)

> **Fraktpolicy**
>
> Varje kudde sys på beställning efter din bild — vi har inget färdigt lager.
> Så snart du godkänt ditt digitala utkast påbörjas sömnaden.
>
> - **Leveranstid:** 8–12 arbetsdagar från godkänt utkast till leverans.
> - **Fraktkostnad:** fri frakt i hela Norden — Sverige, Norge, Danmark,
>   Finland och Island.
> - **Leverans:** spårbar leverans till utlämningsställe eller paketbox nära
>   dig. Du får avisering när paketet är på väg.
> - **Norge och Island:** lokal moms och eventuella hanteringsavgifter kan
>   tillkomma vid införsel — de tas i så fall ut av transportören vid
>   leverans, inte av oss.
>
> Blir något försenat hör vi av oss — du ska aldrig behöva jaga oss för att
> få veta var din kudde är.

## 3. Betalningar (Settings → Payments)

Aktivera Shopify Payments (kort) + Klarna. Copyn på sajten lovar "Klarna
eller kort" — lansera inte innan båda funkar i en testcheckout.

## 4. Startsidan — redan klar i temat

Startsidan sätts av det omskrivna temat (steg 0). Vill du justera något görs
det i temaredigeraren; alternativa rubriker och taglines finns i
`copy/namn-och-rubriker.md`. Bilderna ligger som butiksfiler
(`hjartkompis-*.png`) under Content → Files.

## 5. Före lansering (i ordning)

1. Temat publicerat (steg 0)
2. Betalningar aktiva (steg 3)
3. Policyer inklistrade (steg 2)
4. Leverantör verifierad — COGS och faktisk leveranstid mot löftet 8–12
   arbetsdagar (priserna antar COGS ≈ 250–350 kr)
5. Testorder hela vägen genom kassan
6. Ta bort lösenordsskyddet
