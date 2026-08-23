# E-post för Bäverbutiken — kundaviseringar + flows

*Skapad 2026-08-23, utökad samma dag. Gäller svenska Bäverbutiken
(baverbutiken.se). Mallarna är byggda för att kunna återanvändas i de andra
butikerna — se sist i filen.*

## Vad som ligger här

| Fil | Mejl | Skickas när |
|---|---|---|
| `mallar/orderbekraftelse.liquid` | **Orderbekräftelse** — tidslinje, grundarhälsning, FAQ, nyhetsbrev | Order läggs |
| `mallar/frakt-bekraftelse.liquid` | **Fraktbekräftelse** — "Din order är packad" | Leverantören markerar skickad (ofta före verklig avgång — se nedan) |
| `mallar/drip-pa-vag.html` | **Drip "På väg"** — lägesuppdatering | Automation: skickad + 4 dagar |
| `mallar/recensionsmail.html` | **Recensionsmejl** — stjärnstyrning Judge.me/kontakt vs Trustpilot | Automation: skickad + 14 dagar |
| `mallar/ute-for-leverans.liquid` | **Ute för leverans** | Transportören är ute med paketet (avstängd som standard — slå på!) |
| `mallar/levererad.liquid` | **Levererad** | Paketet är framme (avstängd som standard — slå på!) |
| `mallar/order-annullerad.liquid` | **Order annullerad** — återbetalning steg för steg, FAQ | Order annulleras |

Alla är brandade efter sajten: svart header/footer, röd knapp `#dd1d1d`,
typsnittet Anton, skarpa hörn (Impulse-temat). **Spårningslänken är en stor
röd knapp** i fraktmejlen, med kundens ordersida som fallback så knappen
aldrig är död.

Innehållet följer "custom order confirmation"-upplägget: leveranstider,
FAQ, kontaktväg och grundarhälsning i orderbekräftelsen; återbetalnings-
tidslinje ("pengarna går automatiskt tillbaka till samma betalsätt, inom 10
arbetsdagar") i annulleringsmejlet. **Alla siffror är hämtade ur butikens
egen fraktpolicy och återbetalningspolicy** (lästa 2026-08-23) — ändras
policyn måste mallarna ändras. Annulleringsmejlet har medvetet **inget**
nyhetsbrevs-block — den som just fått en order annullerad ska inte få en
säljpitch.

## Ämnesrader (bytts i samma vy som koden)

Valda enligt copy-subagentens rekommendation (tre-frågorstestet kört på
varje rad, se `docs/copy-regler.md`): personaliserad hook på de positiva
mejlen, trygg klassisk på annulleringen — ett negativt besked ska förstås
i inkorgen, inte kräva ett klick.

| Mejl | Ämnesrad |
|---|---|
| Orderbekräftelse | `{{ customer.first_name }}, {{ name }} är mottagen – vi packar` |
| Fraktbekräftelse | `{{ customer.first_name }}, din order är packad` |
| Drip "På väg" (i automationen) | `Ditt paket är på väg` |
| Recensionsmejl (i automationen) | `1, 2 eller 5 stjärnor — vilken blir det?` |
| Ute för leverans | `{{ customer.first_name }}, {{ name }} kommer till dig idag` |
| Levererad | `{{ customer.first_name }}, {{ name }} är framme` |
| Order annullerad | `Order {{ name }} har annullerats` |

Reservvarianter (tryggare/hookigare) per mejl finns i copy-leveransen —
be Claude visa dem om du vill byta.

## Leverantören trycker "skickad" för tidigt — hela flödet

Leverantören markerar ordrar som distribuerade + arkiverade inom ~24 h, ofta
innan paketet fysiskt rör sig. Det styr hur varje mejl ska förhålla sig till
sanningen:

| När | Mejl | Trigger | Ärligt för att… |
|---|---|---|---|
| Dag 0 | Orderbekräftelse | Order läggs | Lovar bara "vi packar inom 0–2 dagar" + 5–10 dagars leverans |
| Dag 0–1 | Fraktbekräftelse | Leverantören trycker skickad | Omskriven: säger **"packad och överlämnad"**, aldrig "på väg", och förklarar att spårningen kan visa tomt tills första skanningen |
| Dag ~4 | Drip "På väg" | Automation: skickad + 4 dagar | Vid det laget rör sig paketet på riktigt |
| Verklig händelse | Ute för leverans / Levererad | **Transportörens skanningar** | Triggas av riktiga händelser, inte leverantörens klick — de kan aldrig gå för tidigt |
| Dag ~14 | Recensionsmejl | Automation: skickad + 14 dagar | 5–10 dagars leverans + några dagars användning har hunnit ske |

**"Paketet är i Sverige"-mejlet:** Shopify har ingen sådan händelse — de enda
transportörshändelserna är "ute för leverans" och "levererad", och de täcker
i praktiken exakt det du vill säga ("kommer inom kort"). Vill du ha ett äkta
"nu är det i Sverige"-mejl krävs en spårningsapp (t.ex. Parcel Panel eller
Track123) som läser transportörens hela händelsekedja — säg till så sätter vi
upp det, men börja utan: skanningsmejlen gör 90 % av jobbet.

### Sätta upp de två automationerna (drip + recension)

1. Shopify admin → **Marknadsföring → Automatiseringar → Skapa egen automatisering**.
2. Trigger: **Order fulfilled** → lägg till **Vänta**-steg: 4 dagar (drip)
   resp. 14 dagar (recension).
3. Åtgärd: skicka e-post → i e-posteditorn, lägg till ett **Custom HTML**-block
   och klistra in innehållet från `mallar/drip-pa-vag.html` resp.
   `mallar/recensionsmail.html`. Ämnesrader enligt tabellen ovan.
4. Testa på dig själv innan aktivering.

⚠️ **Två begränsningar att känna till:**
- Automationsmejl är **marknadsföringsmejl** — de går bara till kunder som
  godkänt marknadsföring i kassan. Aviseringsmejlen (`.liquid`-filerna) går
  däremot alltid till alla.
- Custom HTML-block kör inte Liquid, så drip-mejlet kan inte länka till just
  den kundens spårning — det pekar på fraktbekräftelsemejlet i stället.
  Vill du ha orderspecifik spårningslänk i drip-mejlet: bygg det i
  **Shopify Flow** (gratisapp) med "Send email"-åtgärden — enklare utseende
  men full tillgång till ordervariabler. Säg till så skriver vi den varianten.

### Recensionsmejlets stjärnstyrning

Fem klickbara stjärnor. Länkmål i `mallar/recensionsmail.html`:

- **1–3 stjärnor** → kontaktsidan (`/pages/contact`) — missnöjet fångas
  privat ("berätta vad som gick fel så fixar vi det") i stället för att bli
  en publik recension. Vill du hellre skicka dem till Judge.me: aktivera
  Judge.me:s **All Reviews Page** (är inte aktiverad idag — `/apps/judgeme`
  ger 404) och byt de tre första länkarna till den sidans URL.
- **4–5 stjärnor** → `https://se.trustpilot.com/evaluate/baverbutiken.se`.
  **Verifiera att Trustpilot-profilen finns** innan mejlet aktiveras —
  Trustpilot blockerade automatisk kontroll, så det är obekräftat.

⚠️ **Trustpilot-risk, läs innan aktivering:** att systematiskt bjuda in bara
nöjda kunder till Trustpilot ("review gating") strider mot Trustpilots
riktlinjer och kan leda till varningsflagg på profilen om det upptäcks.
Upplägget är vanligt i e-handel, men det är ditt beslut med öppna ögon.
Det säkra alternativet: låt alla stjärnor gå till Trustpilot och fånga
missnöje via en separat "svara på mejlet"-rad.

## Nyhetsbrev + rabattkod (kroken)

Orderbekräftelsen och alla tre fraktmejlen slutar med ett svart block:
**"10 % rabatt på nästa köp"** → knapp → sajtens nyhetsbrevsformulär i
sidfoten (`{{ shop.url }}/#newsletter-footer` — formuläret finns redan på
baverbutiken.se, inget behöver byggas).

**⚠️ Två saker måste finnas innan mejlen går live, annars lovar blocket
något som inte händer:**

1. **Rabattnivån är ett förslag.** 10 % står i mallarna — vill du ha en
   annan nivå: sök på `10 %` i `mallar/` och byt. Ditt beslut, din marginal.
2. **Välkomstautomationen delar ut koden.** Shopify admin →
   **Marknadsföring → Automatiseringar → Välkomstmejl till nya prenumeranter**
   (färdig mall). Slå på den och låt den skicka en rabattkod — automationen
   kan generera unika engångskoder åt dig, vilket är bättre än en delad kod
   som läcker till rabattkodssajter. Branda välkomstmejlet i editorn med
   samma färger (rött `#dd1d1d`, svart, Anton).

Utan steg 2: ta bort nyhetsbrevs-blocken ur mallarna tills det är klart
(sök på `Nyhetsbrevs-block` i `mallar/`).

## Så klistrar du in (per mall)

1. Shopify admin för **baverbutiken.se** → **Inställningar** → **Aviseringar**
   → **Kundaviseringar**.
2. Öppna aviseringen (t.ex. **Orderbekräftelse**) → **Redigera kod**.
3. Markera ALLT i kodrutan, radera, klistra in hela innehållet från
   motsvarande `.liquid`-fil här.
4. Byt **ämnesraden** enligt tabellen ovan.
5. **Förhandsgranska** + **Skicka testmeddelande** till dig själv. Kolla
   knapp, svenska och att siffrorna stämmer med policysidorna.
6. Spara. För **Ute för leverans** och **Levererad**: slå även på reglaget —
   de är avstängda som standard.

⚠️ **Spårningslänken kräver att spårningsnumret registreras när ordern
fulfillas** (3PL/fraktapp gör det oftast automatiskt). "Ute för leverans"/
"Levererad" kräver dessutom att transportören rapporterar status till
Shopify — funkar det inte med er transportör gör fraktbekräftelsen jobbet,
och den funkar alltid.

## Varför det inte gick att göra automatiskt

Shopify exponerar inte kundaviseringarna i sitt API — de kan bara redigeras
i admin. Dessutom pekar Shopify-kopplingen i den här miljön på
**bæverbutiken.dk**, inte .se-butiken. Byts kopplingen till .se kan Claude
göra rabattkoden och andra admin-saker direkt (kräver att du godkänner
bytet i webbläsaren).

## Behöver du Klaviyo? Nej — börja med Shopifys inbyggda

- **Shopify Email + Marketing automations ingår**: gratis upp till 10 000
  mejl/månad, sedan ca 1 USD per 1 000.
- Färdiga flows under **Marknadsföring → Automatiseringar**: **övergiven
  kassa** (störst effekt — slå på först), välkomstmejl (= rabattkoden ovan),
  win-back, tack-efter-köp.
- **Bygg ingen egen mejlapp** — spamfilter, GDPR och avregistrering ingår i
  Shopify Email. Klaviyo blir motiverat först vid avancerad segmentering,
  SMS eller A/B-test på flows.

Aviseringsmejlen i den här mappen är transaktionsmejl — de skickas alltid,
gratis, oavsett Email-appen.

## Nästa steg (i ordning)

1. Skapa välkomstautomationen med rabattkod (ovan) — **före** mallarna går live.
2. Klistra in de fem `.liquid`-mallarna + testskicka.
3. Sätt upp drip- och recensionsautomationerna (skickad + 4 resp. 14 dagar).
4. Verifiera Trustpilot-profilen och ta ställning till gating-risken ovan.
5. Slå på **övergiven kassa**-automationen och branda den i editorn.

## Återanvändning i andra butiker

**Finska butiken är redan gjord:** `email/majavakauppa/` innehåller alla sju
mallarna på finska, grundade i majavakauppa.fi:s egna policysidor (som skiljer
sig — inga dagssiffror, 14 dagars återbetalning). Läs den mappens README.

Mallarna hårdkodar inte butiksnamn, mejladress eller länkar —
`{{ shop.name }}`, `{{ shop.email }}`, `{{ shop.url }}` hämtas från butiken
de klistras in i. Butiksspecifikt som måste bytas per butik:

- **Färger + typsnitt**: sök på `#dd1d1d`, `#000000`, `Anton`.
- **Leveranstider och återbetalningstider** i orderbekräftelsen och
  annulleringsmejlet — hämta ur den butikens egna policysidor, gissa aldrig.
- **Nyhetsbrevslänken** `/#newsletter-footer` — kolla att målbutikens tema
  har formuläret i sidfoten, annars byt länkmål.
- **Grundarhälsningen** och texterna (svenska → översätt för .dk/.no/.uk).
