# Så funkar det — hela OPS-flödet, förklarat enkelt

Skrivet 2026-09-10 efter Axels egen beskrivning, rättat samma dag efter hans
feedback punkt för punkt. Det här är KARTAN. Detaljerna står i `PROCESS.md`
(hur fabriken bygger) och `VA-CHECKLIST.md` (varje klick, i rätt ordning).
Stämmer inte kartan med de filerna: kartan är fel, rätta den.

Tre som jobbar:
- **Fabriken** = Claude. Bygger butiken, annonserna, pixeln, Discord-kanalerna.
- **Klickaren** = Axel, eller nästa anställd. Gör det som bara en människa
  får göra (skapa konton, betala, klicka "Authorize").
- **Skalningskungen** = roboten som sköter budgetarna och larmar.

⚙️ = fabriken gör det själv · 🖐 = en människa klickar · ⚠️ = inte byggt än

---

## Steg 1 — Skalningskungen larmar

⚙️ Skalningskungen gör bara två saker: **dödar, skalar och ändrar budget** på
annonserna (Bäverbutiken och OPS-butikerna), och **larmar** när en produkt
ska bli en egen butik — ett test som går väldigt bra, eller en produkt utan
egen butik som går bra. Larmet är ETT meddelande i Discord-kanalen för
startskott, med ping till Axel: **"KLAR FÖR OPS: <produkt>"** + siffrorna +
kommandot att klistra in. Inga briefer, inga Notion-sidor, ingen butik.
Prompten: `.claude/commands/skalningskungen.md`. Larmet:
`node factory/startskott.mjs --jobb <fil> --discord`.

⚙️ Boten sköter Discord själv: hittar servern Bäverbutiken, skapar kanalen
`#ops-startskott` om den saknas och pingar serverägaren. Testat 2026-09-10.

## Steg 2 — Klickaren gör en tom butik (3 klick före bygget)

🖐 Avsnitt 1–3 i checklistan (mallen finns, följ den):
1. Skapa butiken på shopify.com (free trial, jobb-Gmailen, **bolagets**
   adress — adressen bestämmer valuta, språk och land).
2. Kolla valuta, marknad, språk. Fabriken kan **inte** ändra dem efteråt.
3. Skapa appen på dev.shopify.com, lägg de fyra nycklarna i sessionens
   Environment, **spara innan sessionen startas**, installera appen.

## Steg 3 — Bygget startas

🖐 Öppna en ny session. Döp om den till produktens namn. Skriv:
```
/ny-ops <länk till produkten på bäverbutiken.se>
Butiken måste vara <adressen>.myshopify.com
```
⚙️ Fabriken kopplar upp ("Connected ✓"), hämtar produkten, hittar på ett
brand + domän och visar **tre loggor**.
🖐 Den som kör väljer en logga. ⚙️ Valet loggas i `factory/LOGGA-FEEDBACK.md`
(`node factory/logga-feedback.mjs <butik> <a|b|c>`), och nästa butiks tre
loggor byggs på vad som valts hittills — den variant som aldrig väljs byts
ut. Så blir loggorna bättre för varje butik.

## Steg 4 — Fabriken bygger hela butiken

⚙️ Ungefär en timme. Tema, produktsida, paket, bonus, startsida, policyer,
recensioner, Norge-översättning. Allt sparas i repot. När bygget är klart
får klickaren **tre saker i chatten**:
- butiksnamn, domän, mejladress
- **Judge.me-filen** som bilaga (svenska + norska recensioner med rätt datum)
- **Discord-länken** för att släppa in boten

## Steg 5 — Klickaren gör det manuella (gratis, före ägarbytet)

🖐 Avsnitt 5–12 i checklistan, i den ordningen. Påminnelserna (installera
Judge.me-appen, WeTracked osv.) står i Axels manuella SOP.
- Publicera temat + byt butiksnamnet (annars heter den "My Store 5")
- Köp domänen på Loopia, mejlvidarebefordran, koppla domänen i Shopify
- Judge.me: installera, ladda upp filen från chatten
- Ångerknappen: fyra reglage i Shopify (lag sedan 19 juni)
- Skapa **Meta-sidan** och **Discord-servern** — ett besök, båda på en gång
- Skriv **"Store ready: <namn>"** → ⚙️ fabriken gör pixeln + Discord-kanalerna
- WeTracked: klistra in pixel-ID + CAPI-token
- Testa butiken i telefonen bakom lösenordet

## Steg 6 — Annonserna kopieras (ny session)

🖐 Öppna en **ny** session och skriv `/ny-annonser <butiks-id> <länk>`.
⚙️ Fabriken kopierar **hela Bäverbutikens kampanj — varenda annons**, svensk
och norsk, till två kampanjer i MagiBorsten DK. Den lyssnar och läser varje
annons. Säger annonsen "Bäverbutiken", fel pris eller fel villkor ändras
**bara den ytan**. Säger den inget fel kopieras den orörd — ingen ny
voiceover, ingen ny video. Bara länken pekas om. **Allt PAUSED.**

## Steg 7 — Klickaren säger till Axel

🖐 "Butiken och annonserna är klara."

## Steg 8 — Axels lista

🖐 Avsnitt 13–15 i checklistan:
1. Logga in med jobb-Gmailen → välj plan → lägg in kortet.
2. Överför butiken till axelodhner.business@gmail.com. Byt Loopia-lösenord.
3. Shopify Payments + Klarna (måste vara ägarens).
4. Ta bort butikslösenordet → butiken är live.
5. Testa kassan i telefonen: SEK och Klarna syns.

## Steg 9 — Launch

🖐 Axel skriver **"Launch: <namn>"** i annons-sessionen.
⚙️ Fabriken kollar att butiken är live (inget lösenord) och att pixeln har
avfyrat, sätter sen kampanjerna ACTIVE och läser tillbaka statusen. Ingen
annan sätter något ACTIVE. Sen sköter skalningskungen budgetarna var tredje
dag.

---

## Det som fortfarande är manuellt, och varför

| Klick | Går det att automatisera? |
|---|---|
| Skapa butiken, appen, nycklarna | Nej — kräver inloggning och samtycke |
| Valuta, språk, marknad, butiksnamn | Nej — Shopifys API kan inte (mätt, 406) |
| Publicera temat | **Ja** — API:t kan (mätt), koden gör det bara inte än |
| Domänköp, DNS, avsändarmejl | Nej — Loopia + verifieringsmejl |
| Judge.me-uppladdningen | Nej — API:t förstör recensionsdatumen |
| Ångerknappens fyra reglage | Nej — Shopify-inställningar utan API |
| Meta-sidan, Discord-servern | Nej — men fabriken gör allt INUTI dem |
| WeTracked + CAPI-token | Nej — tokenen får aldrig passera chatten |
| Plan, kort, ägarbyte, Payments | Nej — pengar och identitet, alltid ägarens |
| Startskottet i Discord | Ja — byggt och testat 2026-09-10, boten skapar kanalen själv |
| "Launch: <namn>" | Ja — står i `/ny-annonser` steg 11b sedan 2026-09-10 |

## Tre saker som är lätta att blanda ihop

- **Två annonskonton som heter nästan samma sak.** OPS-butikerna kör ALLTID på
  MagiBorsten DK `915422744950975`. MagiBorsten `1867947880635861` är
  Bäverbutiken. Fel konto kostar riktiga pengar.
- **"Store ready" och "Launch" är två olika ord.** Store ready = pixel +
  Discord-kanaler. Launch = annonserna börjar spendera.
- **Grön i fabriken är inte grön i butiken.** Varukorgen och mobilvyn kan bara
  en människa i en telefon testa. Innan annonserna sätts igång.
