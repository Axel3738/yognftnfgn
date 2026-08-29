# Manuella steg i Shopify admin (klistra-in-färdigt)

Allt nedan gick inte att göra via API:t. Ordningen är prioritetsordning.

## 1. Byt butiksnamn (Settings → Store details)

Namn: **Hjärtkompis**

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
> - **Fraktkostnad:** fri frakt i hela Sverige.
> - **Leverans:** spårbar leverans till utlämningsställe eller paketbox nära
>   dig. Du får avisering när paketet är på väg.
>
> Blir något försenat hör vi av oss — du ska aldrig behöva jaga oss för att
> få veta var din kudde är.

## 3. Betalningar (Settings → Payments)

Aktivera Shopify Payments (kort) + Klarna. Copyn på sajten lovar "Klarna
eller kort" — lansera inte innan båda funkar i en testcheckout.

## 4. Startsidan (Online Store → Customize, temat Horizon)

- Hero-bild: `svensk-butik/bilder/hero-soffa.png` (ligger redan på Shopifys
  CDN som Tvillingkuddens featured image)
- Hero-rubrik: **"En bit av din hund du får behålla."**
- Underrubrik: "Skicka din bästa bild — vi syr en kudde i exakt din hunds
  form. Du godkänner utkastet innan vi syr något alls."
- Sektion: Featured collection → "Alla kuddar"
- Alternativa rubriker och taglines: `copy/namn-och-rubriker.md`

## 5. När Higgsfield är påfyllt (~1 credit räcker)

Kör om de 8 strukna bilderna (prompter i `bilder/bilder.json` och i
workflow-scriptet). Prioritet:
1. `fotokudde` — låser upp Fotokudden ur DRAFT (sätt sedan status ACTIVE)
2. `katt-fatolj` — kattbild saknas helt i butiken
3. `tvilling`, `barnkram`, `minne`, `unboxing`, `katt-nyfiken`, `sortiment`

## 6. Före lansering (i ordning)

1. Betalningar aktiva (steg 3)
2. Policyer inklistrade (steg 2)
3. Startsidan uppsatt (steg 4)
4. Leverantör verifierad — COGS och faktisk leveranstid mot löftet 8–12
   arbetsdagar (products-priserna antar COGS ≈ 250–350 kr)
5. Testorder hela vägen genom kassan
6. Ta bort lösenordsskyddet
