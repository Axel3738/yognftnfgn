# E-post för Bäverbutiken — fraktmejl + flows

*Skapad 2026-08-23. Gäller svenska Bäverbutiken (baverbutiken.se). Mallarna är
byggda för att kunna återanvändas i de andra butikerna — se sist i filen.*

## Vad som ligger här

| Fil | Mejl | Skickas när |
|---|---|---|
| `mallar/frakt-bekraftelse.liquid` | **Fraktbekräftelse** — "Din order är på väg" | Ordern skickas (fulfillment skapas) |
| `mallar/ute-for-leverans.liquid` | **Ute för leverans** | Transportören är ute med paketet (avstängd som standard — slå på!) |
| `mallar/levererad.liquid` | **Levererad** | Paketet är framme (avstängd som standard — slå på!) |

Alla tre är brandade efter sajten: svart header/footer, röd knapp `#dd1d1d`,
typsnittet Anton, skarpa hörn — samma look som bäverbutiken.se (Impulse-temat).
**Spårningslänken är en stor röd knapp mitt i mejlet**, plus spårningsnumret i
klartext (klickbart). Finns ingen spårningslänk ännu faller mejlet tillbaka på
kundens ordersida, så knappen är aldrig död.

## Varför det inte gick att göra automatiskt

Shopify exponerar inte kundaviseringarna (notification-mallarna) i sitt API —
de kan bara redigeras inne i admin. Det är en Shopify-begränsning, inte ett
val. Därför: klistra in enligt nedan (tar ~2 min per mall).

Dessutom: Shopify-kopplingen i den här miljön pekar just nu på
**bæverbutiken.dk**, inte .se-butiken. Vill du att Claude ska kunna jobba
direkt mot .se-butiken framöver behöver kopplingen bytas (Claude säger till
när, det kräver att du godkänner i webbläsaren).

## Så klistrar du in (per mall)

1. Shopify admin för **baverbutiken.se** → **Inställningar** → **Aviseringar**
   → **Kundaviseringar**.
2. Öppna aviseringen (t.ex. **Fraktbekräftelse**, under rubriken Frakt) →
   **Redigera kod** (ligger bakom `⋯`/knappen uppe till höger).
3. Markera ALLT i kodrutan för e-postens brödtext, radera, och klistra in hela
   innehållet från motsvarande `.liquid`-fil här.
4. Byt **ämnesraden** till:
   - Fraktbekräftelse: `Din order {{ name }} är på väg 📦`
   - Ute för leverans: `Ditt paket är ute för leverans`
   - Levererad: `Ditt paket har levererats`
5. Klicka **Förhandsgranska** och **Skicka testmeddelande** till dig själv.
   Kolla att knappen syns och att svenskan ser rätt ut.
6. Spara.

För **Ute för leverans** och **Levererad**: de är avstängda som standard.
Slå på dem med reglaget på samma sida (Aviseringar → Frakt).

⚠️ **Spårningslänken kräver att spårningsnumret registreras när ordern
fulfillas** (görs det av 3PL:en/fraktappen sker det automatiskt). Shopify
känner igen PostNord m.fl. och bygger länken själv; skickar fraktappen en egen
tracking-URL används den. "Ute för leverans"/"Levererad" kräver dessutom att
transportören rapporterar status till Shopify — funkar det inte med er
transportör är det själva fraktbekräftelsen som gör jobbet, och den funkar
alltid.

## Behöver du Klaviyo? Nej — börja med Shopifys inbyggda

För flows räcker **Shopify Email + Marketing automations**, som redan ingår:

- **Gratis upp till 10 000 mejl/månad**, sedan ca 1 USD per 1 000. Klaviyo
  hade kostat hundratals kronor i månaden redan vid en liten lista.
- Finns i admin under **Marknadsföring** → **Automatiseringar**. Färdiga
  flows att slå på: **övergiven kassa** (abandoned checkout — störst effekt,
  slå på först), övergiven varukorg/browse, **välkomstmejl** vid nyregistrerad
  prenumerant, **win-back** ("vi saknar dig"), tack-efter-köp/upsell.
- Mejlen designas i samma drag-och-släpp-editor som kampanjmejl, med butikens
  logga och färger.

**Bygg ingen egen mejl-app.** Egen utskicksserver = spamfilter, GDPR-ansvar,
avregistreringshantering och deliverability-jobb — allt det ingår i Shopify
Email. Klaviyo blir motiverat först när du vill ha avancerad segmentering,
SMS i samma flöde eller A/B-test på flows — inte för att komma igång.

Aviseringsmejlen ovan (frakt osv.) är en separat sak: de är transaktionsmejl
som Shopify alltid skickar gratis, oavsett Email-appen.

## Nästa steg (i ordning)

1. Klistra in de tre mallarna + testskicka (ovan).
2. Slå på **övergiven kassa**-automationen under Marknadsföring →
   Automatiseringar och branda mejlet i editorn (samma färger: rött
   `#dd1d1d`, svart, Anton).
3. Vill du ha fler aviseringar brandade (orderbekräftelsen är den kunden ser
   mest!) — be Claude bygga dem på samma layout när du godkänt looken på de
   här tre.

## Återanvändning i andra butiker

Mallarna hårdkodar **inte** butiksnamn, mejladress eller länkar —
`{{ shop.name }}`, `{{ shop.email }}` och `{{ shop.url }}` hämtas från
butiken de klistras in i. Det enda som är Bäverbutiken-specifikt är
**färgerna och typsnittet**: sök på `#dd1d1d` (röd), `#000000`
(header/footer) och `Anton` och byt till den butikens brand. Texterna är
svenska — översätt för .dk/.no/.uk.
