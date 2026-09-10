# Så funkar det — hela OPS-flödet, förklarat enkelt

Skrivet 2026-09-10 efter Axels egen beskrivning. Det här är KARTAN.
Detaljerna står i `PROCESS.md` (hur fabriken bygger) och `VA-CHECKLIST.md`
(varje klick, i rätt ordning). Stämmer inte kartan med de filerna: kartan
är fel, rätta den.

Tre som jobbar:
- **Fabriken** = Claude. Bygger butiken, annonserna, pixeln, Discord-kanalerna.
- **Klickaren** = Axel, eller nästa anställd. Gör det som bara en människa
  får göra (skapa konton, betala, klicka "Authorize").
- **Skalningskungen** = roboten som tittar på annonserna var tredje dag.

⚙️ = fabriken gör det själv · 🖐 = en människa klickar · ⚠️ = inte byggt än

---

## Steg 1 — Skalningskungen säger till

⚙️ Var tredje dag (eller när Axel ber) tittar den på Bäverbutikens
annonser. Säljer en produkt tillräckligt bra skriver den:
**"KLAR FÖR OPS: <produkt>"** + siffrorna + kommandot att klistra in.

⚠️ **Axels beslut 2026-09-10:** meddelandet ska gå till en **egen
Discord-kanal** och **pinga Axel**. Inget mer — inga Notion-sidor, inga
briefer för den produkten. Kanalen finns inte än och koden skickar inte till
Discord än (`factory/startskott.mjs` bara formaterar texten). Det är nästa
sak att bygga.

## Steg 2 — Klickaren gör butiken (3 klick före bygget)

🖐 Avsnitt 1–3 i checklistan, i den ordningen:
1. Skapa butiken på shopify.com (free trial, jobb-Gmailen, **bolagets**
   adress — adressen bestämmer valuta, språk och land).
2. Kolla valuta, marknad, språk. Fabriken kan **inte** ändra dem efteråt.
3. Skapa appen på dev.shopify.com, lägg de fyra nycklarna i sessionens
   Environment, **spara innan sessionen startas**, installera appen.

## Steg 3 — Bygget (en timme, allt automatiskt)

🖐 Öppna en ny session. Döp om den till produktens namn. Skriv:
```
/ny-ops <länk till produkten på bäverbutiken.se>
Butiken måste vara <adressen>.myshopify.com
```
⚙️ Fabriken: kopplar upp ("Connected ✓"), hämtar produkten, hittar på ett
brand + domän, visar **tre loggor** — 🖐 en människa väljer en — och bygger
sen hela butiken: tema, produktsida, paket, bonus, startsida, policyer,
recensioner, Norge-översättning. Allt sparas i repot.

⚙️ När bygget är klart får klickaren **tre saker i chatten**:
- butiksnamn, domän, mejladress
- **Judge.me-filen** som bilaga (svenska + norska recensioner med rätt datum)
- **Discord-länken** för att släppa in boten

## Steg 4 — Klickaren gör det manuella (gratis, före ägarbytet)

🖐 Avsnitt 5–12 i checklistan, i den ordningen:
- Publicera temat + byt butiksnamnet (annars heter den "My Store 5")
- Köp domänen på Loopia, mejlvidarebefordran, koppla domänen i Shopify
- Judge.me: installera, ladda upp filen från chatten
- Ångerknappen: fyra reglage i Shopify (lag sedan 19 juni)
- Skapa **Meta-sidan** och **Discord-servern** — ett besök, båda på en gång
- Skriv **"Store ready: <namn>"** → ⚙️ fabriken gör pixeln + Discord-kanalerna
- WeTracked: klistra in pixel-ID + CAPI-token
- Testa butiken i telefonen bakom lösenordet

## Steg 5 — Annonserna (ny session)

🖐 Öppna en **ny** session och skriv `/ny-annonser <butiks-id> <länk>`.
⚙️ Fabriken kopierar Bäverbutikens bevisade annonser, byter brand och pris,
och bygger två kampanjer (SE + NO) i MagiBorsten DK. **Allt PAUSED.**

## Steg 6 — Ägarbytet + Axels lista

🖐 Klickaren säger till Axel att butiken är klar.
🖐 **Axels lista** (avsnitt 13–15):
1. Logga in med jobb-Gmailen → välj plan → lägg in kortet.
2. Överför butiken till axelodhner.business@gmail.com. Byt Loopia-lösenord.
3. Shopify Payments + Klarna (måste vara ägarens).
4. Ta bort butikslösenordet → butiken är live.
5. Testa kassan i telefonen: SEK och Klarna syns.

## Steg 7 — Launch

🖐 Axel skriver **"Launch: <namn>"** i annons-sessionen.
⚠️ Ordet har ingen kod bakom sig än. I dag: kampanjerna sätts ACTIVE för hand
i Ads Manager (checklistans avsnitt 16). Sen tar skalningskungen över butiken
och kör creative-loopen var tredje dag.

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
| Startskott i Discord, "Launch" | **Ja** — inte byggt än |

## Tre saker som är lätta att blanda ihop

- **Två annonskonton som heter nästan samma sak.** OPS-butikerna kör ALLTID på
  MagiBorsten DK `915422744950975`. MagiBorsten `1867947880635861` är
  Bäverbutiken. Fel konto kostar riktiga pengar.
- **"Store ready" och "Launch" är två olika ord.** Store ready = pixel +
  Discord-kanaler. Launch = annonserna börjar spendera.
- **Grön i fabriken är inte grön i butiken.** Varukorgen och mobilvyn kan bara
  en människa i en telefon testa. Innan annonserna sätts igång.
