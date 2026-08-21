# Appar i det nya temat

## Först: det som går sönder vid ett temabyte

**Appinställningar följer inte med när du byter tema.** De sparas per tema, inte
per butik. Publicerar du det nya temat utan att göra om dem slutar apparna
fungera — och det syns inte som ett felmeddelande, bara som att e-postlistan
plötsligt slutar växa.

På matstrumpor.se gäller det i dag:

| App | Typ | Måste göras om |
|---|---|---|
| **Klaviyo** | App embed | Slås på igen under Temainställningar → App embeds |
| **Kaching Bundles** | App block | Placeras ut igen på produktsidan |

Det här är alltså inte något jag missat i bygget — det är hur Shopify fungerar,
och det gäller vilket nytt tema du än publicerar, köpt eller byggt.

Checklistan ligger sist i det här dokumentet.

---

## De två sorternas appar

Shopify har två sätt att koppla in en app, och de sitter på olika ställen:

**App embed** — appen lägger sin kod på hela sajten. Popups, spårningsskript,
chattbubblor. Slås på under **Temainställningar → App embeds**. Ingen sektion
behövs. Klaviyo är en sådan.

**App block** — appen ritar något på en bestämd plats. Recensionsstjärnor,
paketväljare, storleksguide. Läggs in som ett block i en sektion, precis som
våra egna block.

---

## Judge.me

⚠️ **Judge.me är inte installerat på matstrumpor.se i dag.** Det ligger på
Bäverbutiken. Vill du ha det här måste det installeras först.

När det är installerat har det tre delar, och de ska på tre olika ställen:

| Del | Var den ska | Hur |
|---|---|---|
| Grundskriptet | Hela sajten | Temainställningar → App embeds → slå på Judge.me |
| Stjärnorna under titeln | Köpblocket | Lägg till block i temats produktsektion → Judge.me Preview Badge |
| Hela recensionslistan | Under köpblocket | Sektionen **Appyta** eller **Omdömen** → Lägg till block → Judge.me Review Widget |

Sektionen **Omdömen** tar både och: appens widget ritas i full bredd överst, och
våra egna skrivna omdömen under. Praktiskt i början, när appen bara har några få
riktiga recensioner och sidan ändå ska se bebodd ut.

---

## Vilken app som helst, var som helst

Sektionen **Appyta** finns för just det. Lägg till den var du vill på sidan,
klicka på *Lägg till block*, och alla installerade appar som erbjuder app-block
dyker upp under rubriken Appar.

Den funkar för Judge.me, Loox, Okendo, Yotpo, Kaching Bundles, Rebuy och de
flesta andra.

Sektionen har också fälten för A/B-test, så du kan testa en app mot ingen app —
t.ex. om recensionswidgeten faktiskt säljer mer eller bara gör sidan långsammare.

### Appar som saknar app-block

Äldre appar ger i stället en kodsnutt att klistra in. Då används Shopifys egen
sektion **Custom Liquid**, som finns i alla OS 2.0-teman.

Det här är den enda punkt där ett eget tema kostar dig något jämfört med ett
köpt: en app som skickar en kodsnutt måste klistras in för hand. Skicka snutten
till mig så lägger jag in den på rätt ställe.

---

## Om Kaching Bundles

Kaching gör i stort sett samma sak som vår paketväljare. Två vettiga vägar:

**Behåll vår väljare** om ni bara vill visa 3-par mot 5-par snyggt. Varianterna
finns redan, riktiga rabatter behövs inte, och sidan blir snabbare utan appen.

**Använd Kaching** om ni vill ha riktiga automatrabatter på produkter som bara
har en variant — "köp 2, spara 15 %" på pizza- och hamburgarstrumporna. Det kan
inte vår väljare göra på egen hand, för rabatten måste finnas i kassan.

**Kör inte båda på samma produkt.** Två paketväljare ovanpå varandra förvirrar
kunden och gör datan oläsbar.

---

## Checklista efter publicering

Gå igenom den här direkt när det nya temat publicerats. Det tar fem minuter och
räddar veckor av tyst bortfall.

- [ ] Klaviyo påslaget under App embeds
- [ ] Klaviyos popup dyker faktiskt upp på sajten
- [ ] Kaching Bundles utplacerad, eller medvetet borttagen
- [ ] Judge.me, om installerat: alla tre delarna på plats
- [ ] Lägg en testorder och kontrollera att orderbekräftelsen kommer
- [ ] Kontrollera att spårningen mäter köp — jämför ett köp mot Shopifys egen
      statistik samma dag
