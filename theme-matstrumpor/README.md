# Temat för Matstrumpor.se

Ett eget konverteringslager som gör samma jobb som ShrinePro, men skrivet från
grunden. All kod här är vår egen. Ingenting är kopierat ur ShrinePro, Impulse
eller något annat betaltema.

**Varför det här finns:** matstrumpor.se kör i dag temat
`theme-export-matstrumpor-se-shrine-2-01dec202`, som är Shrine 1.3.1. Ett eget
tema tar bort licensfrågan helt — och blir dessutom snabbare, eftersom vi bara
bygger det butiken faktiskt använder.

---

## Vad du får göra, juridiskt

Det här är hela poängen, så det står först.

| | |
|---|---|
| **Får kopieras** | Funktioner och idéer. Sticky köpknapp, paketrabatter, trygghetsikoner, nedräkning, jämförelsetabell. Ingen äger de sakerna. |
| **Får INTE kopieras** | Deras faktiska filer, deras grafik, deras namn. |

Vi har alltså byggt funktionerna, inte kopierat koden. Grunden är Shopifys eget
gratistema, som är fritt att bygga vidare på.

---

## Så är det byggt

Tre lager, och det är med flit att de går att byta ut var för sig:

```
assets/     Utseende och beteende
  ms-cro.css    designtokens + alla komponenter
  ms-cro.js     sticky köpknapp, paketväljare, leveransdatum, nedräkning
  ms-ab.js      A/B-motorn

snippets/   Själva innehållet. Här bor logiken.
blocks/     Tunna omslag så blocken går att lägga INUTI köpblocket
sections/   Tunna omslag så samma sak går att lägga som egen sektion

ab/         Avläsning av testerna
tools/      liquid-check.mjs — kontrollerar alla Liquid-filer
```

Varför både `blocks/` och `sections/` för samma sak: block kan ligga inne i
köprutan bredvid priset, sektioner kan bara ligga ovanför eller under. Vissa
saker, som paketväljaren, måste sitta bredvid knappen för att fungera. Logiken
finns bara på ett ställe — i `snippets/` — så det är ingen dubblering.

**En viktig princip:** blocken bygger aldrig ett eget köpflöde. De skriver in i
temats egna köpformulär. Sticky-knappen klickar på temats riktiga knapp. Det gör
att varianthantering, felmeddelanden och kundvagnen fungerar precis som vanligt,
och att allt överlever ett temabyte.

---

## Vad som ingår

**I köpblocket** (läggs in som block bredvid priset)

| Block | Vad det gör |
|---|---|
| Paketväljare | Korten som säljer 5-pack i stället för 3-pack. Räknar ut pris per par. |
| Säljpunkter | Bockade rader: "En storlek passar alla" |
| Trygghetsrad | Fri frakt / öppet köp / trygg betalning |
| Betalsätt | Butikens riktiga betalsätt, hämtade från Shopify |
| Leveransbesked | "Beräknad leverans 27 augusti – 3 september", räknat i arbetsdagar |
| Lagerindikator | Bara när lagret faktiskt spåras |
| Vanliga frågor | Dragspel |
| Garanti | 30 dagars öppet köp |

**På sidan** (läggs in som sektioner)

USP-rad · Rullande band · Omdömen · Jämförelsetabell · Vanliga frågor ·
Garantiblock · Fast köpknapp

---

## Ärlighetsreglerna i koden

De här är inbyggda, inte valfria. De finns för att den sortens fusk är
vilseledande marknadsföring och för att det förr eller senare kostar mer än det
smakar.

1. **Lagerindikatorn hittar inte på siffror.** Spårar produkten lager visas det
   verkliga antalet. Gör den inte det visas ingen siffra alls.
2. **Nedräkningen startar inte om vid varje besök.** Den räknar antingen till ett
   riktigt datum eller till dagens brytpunkt för packning.
3. **Paketväljaren visar aldrig ett rabattpris som kassan inte ger.** Ska
   "spara 15 %" stå där måste en riktig automatisk rabatt finnas i Shopify.
4. **"Verifierat köp" är en ruta man aktivt måste kryssa i** per omdöme.
5. **Betalikonerna hämtas från butiken**, så de kan inte visa ett betalsätt ni
   inte har.

---

## Kommandon

```bash
npm run tema:check    # kontrollerar alla Liquid-filer
npm run tema:test     # 26 tester på A/B-matematiken
npm run tema:grind    # båda — kör den här före uppladdning
```

Det finns ingen byggkedja. Filerna laddas upp som de är.

---

## A/B-testning

Se `docs/ab-testning.md`. Kortversionen:

- Motorn ligger i temat. Ingen app, ingen månadskostnad.
- Varje besökare lottas en gång och ser samma variant vid återbesök.
- Varianten skrivs på ordern, så resultatet går att läsa i efterhand.
- Läs av med `/abtest` i chatten, eller `npm run tema:ab -- --test buybox --a 60 --b 95`.

**Innan du startar ett test, kolla att butiken har trafik nog.** Kör
`npm run tema:ab -- --planera --baslinje 0.03 --trafik <besökare per dag>`.
Får du "för långt" på alla rader är A/B-test fel verktyg just nu — bygg
förbättringen rakt av i stället.

---

## Att veta inför nästa session

- Butiken är **matstrumpor.se**, inte Bäverbutiken. Blanda inte ihop dem.
- Ägarbolag: STONEBITE ECOM AB, org.nr 5595762401.
- Märkets färger är avlästa från live-sajten: accent `#dd821d`, text `#121212`,
  typsnitt *Mochiy Pop P One*.
- Fem produkter: Sushi (3-par 369 kr / 5-par 399 kr), Pizza 449 kr,
  Hamburgare 299 kr, Donut 299 kr, Presentkort 150 kr.
- Sushi-varianterna heter `"3 - Par"` och `"5 - Par"`. Paketväljaren läser
  antalet ur variantnamnet — döps de om slutar priset per par att räknas.
- Klaviyo är installerat. Rör inte dess kod.
