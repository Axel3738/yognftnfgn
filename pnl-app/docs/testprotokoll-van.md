# Testprotokoll: första externa handlaren (Axels vän), 2026-09-08

Syfte: se appen genom en riktig handlares ögon, från installation till första
sanna vinstsiffra. Axel tittar, vännen klickar. Ingen hjälp förrän hen fastnar
— det är fastnandet som är datan.

## Innan vännen kommer (Axel, 10 min)

1. Planen **Friends 50%** finns i Partner Dashboard med vännens
   `namn.myshopify.com` under *Stores with plan access* (testbutiken kan stå
   kvar där också).
2. Provperioden på **basic** är 14 dagar (spelbokens punkt 1).
3. Railway: alla tjänster svarar `hero-v68` på `/healthz`.
4. Ha en anteckning öppen med tre kolumner: *Vad hen gjorde · Vad hen sa · Vad
   hen förväntade sig*. Skriv medan det händer, inte efteråt.
5. Filma skärmen (telefon räcker). Stoppuret går från "installera" till första
   siffran hen tror på.

## Under testet — vännen klickar, Axel är tyst

Säg bara: *"Installera appen och berätta högt vad du tänker. Fråga mig inget
förrän du sitter fast i en minut."*

Mät och notera:

| Moment | Notera |
|---|---|
| Hittar appen i App Store (sök "StonePNL") | Antal sökningar. Vad hen sökte på först. |
| Prissidan | Såg hen Friends 50%? Förstod hen vad som ingår? Tvekade hen? |
| Första skärmen efter installation | Första ordet hen säger. Förstår hen vad siffrorna betyder? |
| Kom igång-checklistan | Vilket steg börjar hen med? Vilket hoppar hen över? |
| Inköpspriser (Kostnader) | Har hen Juicy? Fungerade "Kommer du från Juicy?"-kortet? Hur många klick till första kostnad? Vad gjorde hen med mallen? |
| Meta-koppling | Logga in med Facebook: öppnades fönstret? Hittade hen sitt annonskonto i listan? Tid. |
| Fasta kostnader | Klickade hen på förslagen? Vilka kostnader hade hen som saknas i listan? |
| Panelen med riktiga tal | Tror hen på siffran? Jämför mot Juicy/Shopify Analytics — skillnad och varför. |
| Hero-kortet | Reaktion? Sätter hen ett mål? För mycket/för lite? |
| Kundvärde (LTV) | Vad förväntade hen sig bakom fliken? Läste hen låsta vyn? Hade hen betalat 5 USD till? |
| Tipsen | Kändes de relevanta eller generiska? Vilket skulle hen agera på? |
| Språk | Bytte hen till svenska? Var något på fel språk? |
| Mobil | Öppna Shopify-appen i mobilen: går panelen att läsa? |

Frågor att ställa **efter** varje moment (inte under):
- "Vad trodde du skulle hända när du klickade där?"
- "Vad saknar du just nu för att lita på talet?"
- "Vad har Juicy som du skulle sakna?" / "Vad har vi som Juicy inte har?"

## Sista tio minuterna

1. "Skulle du betala 9,99 dollar i månaden för det här? Varför/varför inte?"
2. "Vilken EN sak skulle få dig att öppna appen varje morgon?"
3. "Får jag citera dig i App Store-listningen?" (skriv ner exakt ordval)
4. Be om en recension **bara om hen själv säger att appen är bra** — och
   aldrig mot något i utbyte (Shopifys regler, spelboken avsnitt 4).

## Efteråt (Axel skickar till Claude)

- Anteckningen (tre kolumner), filmen eller skärmbilder, stopptiden.
- Vännens Juicy-export eller skärmbild av Juicys kostnadstabell — det är det
  enda som saknas för att bygga den automatiska Juicy-tolken.
- Vännens myshopify-domän (för att kontrollera att planen slog igenom och
  att KundOrder-bakfyllnaden startade).

Allt hen fastnade på blir en rad i `docs/granskning-<datum>.md` och nästa
bygge. Allt hen sa "wow" åt blir en rad i listningen.
