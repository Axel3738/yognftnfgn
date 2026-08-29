# Manuella steg i Shopify admin (klistra-in-färdigt)

Allt nedan gick inte att göra via API:t. Ordningen är prioritetsordning.

## 0. Publicera temat — ✅ KLART (Axel publicerade 2026-08-29)

## 0b. Startsidans one-product-version (två vägar, välj en)

Temat är live, och API:t får inte skriva i publicerade teman. Den färdiga
one-product-startsidan ligger i `svensk-butik/tema/index.json` (sortiment-
sektionen borttagen, båda CTA-knapparna → produktsidan, UGC-bilder i galleriet,
berättelse-texten rättad från "sammet/exakt silhuett" till plysch/vit kant).

**Väg A (enklast):** Online Store → Themes → ⋯ på det publicerade temat →
**Duplicate**. Säg till Claude — kopian går att skriva om via API:t på en
minut, sen publicerar du kopian.

**Väg B (själv i Customize, 4 ändringar):**
1. Ta bort sektionen "Kuddarna" (featured collection).
2. Hero-knappen: "Gör din egen kudde" → länka till produkten Tvillingkudden.
   Samma sak med knappen i "Hundar blir aldrig för gamla…"-sektionen.
3. Galleriet "Som de används": byt de tre bilderna till
   `hjartkompis-ugc-eldstad`, `hjartkompis-ugc-hund-nosar`,
   `hjartkompis-ugc-mormor` (finns under Content → Files); rubriker
   "Tvillingen" / "Igenkänningen" / "Presenten".
4. Berättelse-sektionen: byt texten till: "Vi skär kudden längs ditt husdjurs
   kontur, med en mjuk vit kant, och trycker bilden på mjuk plysch —
   dubbelsidigt, helsydd utan dragkedja." + "Den ligger i soffan som vilken
   kudde som helst. Tills någon tittar en gång till."

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
