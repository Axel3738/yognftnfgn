# enkat/ — köparenkäten (bara Matstrumpor)

Tre fritextfrågor direkt efter köpet. Svaren blir `voc` till briefer och mejl.
Axels beslut A 2026-10-01: **bara Matstrumpor, ingen belöning**. Planen, skälen
och källorna (kursen, Chadbot) står i `docs/os/evolve/ENKAT.md` och `SVAR.md`.

## Så går ett svar

1. Kunden får Matstrumpors svenska orderbekräftelse med rutan "Tre snabba frågor"
   (`cowork/orderbekraftelse.liquid`, klistras in av Cowork — Shopify har inget
   API för notisens huvudspråk). De 13 andra språken rörs inte.
2. Knappen går till den dolda sidan **https://matstrumpor.se/pages/enkat?k=ob&p=<produkt>**
   (`seo.hidden = 1`, ingen menylänk). Shopifys vanliga kontaktformulär, med
   `contact[email]` = `noreply@matstrumpor.se` och markören `ENKAT-v1`.
3. Shopify skickar "Nytt kundmeddelande" till kundsupport@matstrumpor.se.
   **Autosvaret hoppar över det** (noreply är systemadress; vakttestet i
   `test/enkat.test.mjs` stoppar `npm test` om det ändras).
4. `las.mjs --skarpt` hittar svaren på markören, flyttar dem till `INBOX.ENKAT`
   och sparar strukna svar i `output/` (gitignorerad). **Ett svar som bär ett
   orderärende flaggas och stannar i inkorgen hos VA:n.**

## Kommandon

```bash
node enkat/publicera.mjs              # torrt: vad som skulle ändras i butiken
node enkat/publicera.mjs --skarpt     # temafil + sida + seo.hidden, läser tillbaka som kund
node enkat/publicera.mjs --kontroll   # bara kundvyn
node enkat/orderbekraftelse.mjs       # läser mallen i Shopify, skriver cowork/orderbekraftelse.liquid
node enkat/las.mjs                    # torrt: hittar och tolkar svaren
node enkat/las.mjs --skarpt           # flyttar till INBOX.ENKAT, flaggar orderärenden
node --test enkat/test/*.test.mjs
```

## Regler som sitter i koden

- **Råsvaren committas aldrig.** De ligger i `INBOX.ENKAT` i högst 12 månader
  (GDPR-raden på sidan lovar det). `output/` är gitignorerad. Till repot går bara
  kodning och citat som sessionen läst och rensat (`stryk()`: butikens namn →
  `[butiken]`, e-post, telefon, adress och nummer maskas).
- **Vecka, aldrig datum** på ett sparat svar.
- **Inget svar kopplas till en annons, en order eller en e-postadress.** En brief
  pekar på ett lead (ett mönster), aldrig på ett enskilt svar.
- **Ingen belöning, inget säljande** i sidan eller rutan (testat). Ett svar blir
  aldrig ett kundcitat eller en recension.
- Ändra frågor eller text i `konfig.json`, aldrig i temafilen. Reservfrågan
  (`reserv.aktiv`) slås på när minst 80 % av de 50 första svaren på fråga 2 bara
  säger Facebook, Instagram eller annons.

## Läget

- 2026-10-01: sidan live och dold (`gid://shopify/Page/184085610835`, tema
  `207180890451`), kundvyn grön (formulär, markör, noreply, frågorna, GDPR-raden,
  noindex). Sessionens provsvar från Chromium i containern fastnade i butikens
  hCaptcha; **Coworks provsvar i Axels webbläsare gick igenom** (ingen synlig
  captcha). Notisen kom till kundsupport@matstrumpor.se 13.52 med fälten
  Landskod, E-post (noreply), Enkat, Kanal, Produkt, Fraga 1–3. `las.mjs` hittade
  det, tolkade alla fält, och `--skarpt` flyttade det till `INBOX.ENKAT`
  (tillbakaläst där). Hela vägen fungerar.
- **Integritetspolicyn är Shopifys automatiska** (Cowork 2026-10-01: textrutan
  är låst så länge automatiken är på). Sessionens beslut: automatiken står kvar,
  och informationen ges på själva enkätsidan där svaren samlas in (vem som
  frågar, varför, hur länge, inga namn/hälsa). Sidans länk säger därför bara
  "Våra allmänna villkor för personuppgifter står i integritetspolicyn", inte att
  policyn nämner enkäten. Vill Axel ha stycket i policyn måste automatiken av,
  och då uppdateras policyn inte längre av sig själv.
- Orderbekräftelsen med rutan är byggd men **inte inklistrad**. Kvar före
  inklistringen: timrutinen för `las.mjs --skarpt` byggd på `main`, sedan
  Cowork-prompten som klistrar in `cowork/orderbekraftelse.liquid`.
