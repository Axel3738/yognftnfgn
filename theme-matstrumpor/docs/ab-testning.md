# A/B-testning på matstrumpor.se

## Vad det är, och vad det inte är

Motorn testar **två varianter av samma sida mot varandra**, inuti det nya temat.
Halva besökarna ser A, halva ser B, och vi mäter vilken som säljer bäst.

Det den **inte** kan är att testa nya temat mot gamla temat. Shopify kan bara ha
ett publicerat tema åt gången, och att dela trafiken mellan två teman kräver en
betalapp (Shoplift eller Intelligems). Vill du jämföra gammalt mot nytt får det
bli före/efter — vilket inte är ett riktigt test, eftersom säsong och kampanjer
förorenar jämförelsen.

---

## Så mäts det

Det finns ingen server och ingen databas, och ändå går resultatet att läsa i
efterhand. Så här:

1. Ny besökare lottas till A eller B. Beslutet sparas i en kaka i 30 dagar.
2. Sidan renderar **båda** varianterna, där B ligger dold. Motorn vänder på det
   för B-besökare. Stängs JavaScript av ser man A — aldrig en trasig sida.
3. Vid köp skrivs varianten in som ett *cart attribute*. Det följer med till
   ordern och ligger kvar där för alltid.
4. Vi läser ordrarna ur Shopify och räknar.

Steg 3 är hela knepet. Vi behöver inte lagra något själva — Shopify gör det åt
oss, som en anteckning på ordern.

---

## Starta ett test

**1. Slå på testet.** Temainställningar → Matstrumpor A/B → ett test-id per rad:

```
buybox
```

Vill du rulla ut försiktigt går det att vikta: `buybox:90:10` ger 10 % till B.

**2. Märk vad som ska variera.** I temaredigeraren har varje sektion fälten
*Test-id* och *Visas för variant*. Lägg två versioner av sektionen, sätt den ena
till A och den andra till B.

**3. Granska båda innan du släpper på trafik.** Lägg till `?ms_ab=buybox:b` i
webbadressen för att tvinga fram B. Sådana besök märks i ordern och räknas
automatiskt bort ur resultatet.

---

## Läsa av

I chatten:

```
/abtest buybox
```

Eller själv, om du redan har siffrorna:

```bash
npm run tema:ab -- --test buybox --a 60 --b 95
npm run tema:ab -- --test buybox --ordrar ordrar.json --besokare-a 2100 --besokare-b 2080
```

---

## Hur svaret ska läsas

Verktyget svarar med ett av fyra besked, och skillnaden mellan dem är viktig:

| Besked | Betyder |
|---|---|
| **För få köp** | Under 25 köp per variant. Matematiken gäller inte än. |
| **B vinner / A vinner** | Säkerställt (p ≤ 0,05). Går att agera på. |
| **Fortsätt — vet inte** | Ingen skillnad syns, men underlaget räcker inte för att utesluta en liten. Det är *inte* samma sak som "ingen skillnad". |
| **Oavgjort** | Ingen skillnad, och underlaget räcker för att säga det. |

Ett säkerställt resultat gäller **även om du inte nått det planerade
underlaget**. Hittar du ett lyft på 60 % när du planerade för att kunna se 20 %
är svaret redan klart — då vore det att slänga bort en vinst att vänta ut
kalendern.

---

## Vad som är värt att testa

Rangordnat efter hur stor skillnad de brukar göra. Testa **stora** saker —
små skillnader kräver trafik som butiken inte har.

1. **Paketväljare mot vanlig variantmeny.** Störst effekt på snittordern.
2. **Hela köpblockets ordning.** Pris högt mot pris efter säljpunkterna.
3. **Förstabilden.** Produkt på vit bakgrund mot produkt i användning.
4. **Rubriken på produktsidan.** Vad produkten *är* mot vad den *gör*.
5. **Fast köpknapp på eller av.**

Testa **inte** knappfärger, radavstånd eller ordval i en enskild rad. Effekten
är för liten för att gå att mäta här, och testet binder upp trafik i veckor.

---

## Fällor

- **Kör ett test i taget per sida.** Två samtidiga tester på samma sida gör att
  du inte vet vilken ändring som gjorde skillnaden.
- **Ändra ingenting under tiden.** Pris, frakt eller annonsbudget mitt i testet
  förstör det.
- **Titta inte varje dag.** Ju oftare du kikar desto större chans att du råkar
  se en slumpmässig topp och tror att det är en vinst.
- **Låt det gå hela veckor.** Helgtrafik beter sig annorlunda än vardagstrafik.
