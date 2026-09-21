# Cowork-prompten: lägg upp sajten och koppla stonebite.org

Så här gör du, Axel:

1. Öppna Cowork.
2. Kopiera **hela texten mellan de två streckade linjerna** nedan.
3. Klistra in den i Cowork och skicka.
4. Cowork frågar dig om inloggningar längs vägen — svara när den frågar.

Det tar ungefär tjugo minuter. När den är klar svarar `https://stonebite.org`.

⚠️ Två saker du behöver ha framme: inloggningen till **Railway** (eller det
hostingkonto du vill använda) och inloggningen till **domänleverantören där
stonebite.org ligger** (kolla om det är Loopia — det är där mejlen ligger).

---

Jag vill lägga upp en webbplats och koppla min domän stonebite.org till den.
Koden ligger i mitt GitHub-repo **Axel3738/yognftnfgn**, i mappen `stonebite/`.
Det är en vanlig Node-app utan byggsteg och utan npm-beroenden. Gör så här och
fråga mig om inloggningar när du behöver dem.

**Steg 1 — skapa tjänsten.**
Gå till railway.app, logga in med mitt konto, och skapa ett nytt projekt från
GitHub-repot Axel3738/yognftnfgn, branch `main`. Railway hittar `npm start`
själv (det startar `node stonebite/server.mjs`). Om Railway frågar efter ett
startkommando: skriv `npm start`. Node-version 20 eller senare.

**Steg 2 — miljövariabler.**
Lägg in de här variablerna på tjänsten (Variables):

- `STONEBITE_HEMLIGHET` — slumpa en lång sträng, minst 40 tecken, och spara den
  åt mig. Den signerar inloggningskakorna. Byts den loggas alla ut.
- `STONEBITE_DATA` — sätt till `/data`
- `STONEBITE_ANVANDARE` — sätt till `/data/anvandare.json`

**Steg 3 — en disk som överlever en ny version.**
Lägg till en Volume på tjänsten och montera den på `/data`. Det här steget är
viktigt: utan den försvinner alla inloggningar och alla inrapporterade
bonusinsatser varje gång en ny version läggs upp.

**Steg 4 — domänen.**
I Railway: Settings → Networking → Custom Domain. Lägg till `stonebite.org`
och `www.stonebite.org`. Railway ger dig ett CNAME-värde per domän.

Logga sedan in hos företaget där stonebite.org är registrerad (titta efter
Loopia först — mina mejl ligger där) och lägg in posterna Railway bad om:

- `www` → CNAME till värdet Railway gav
- rotdomänen `stonebite.org` → ALIAS/ANAME till Railway-värdet. Går inte det
  hos leverantören, använd deras vidarebefordran från `stonebite.org` till
  `www.stonebite.org` i stället.

⚠️ **Rör inte MX-posterna.** Där går mejlen. Ändra bara CNAME/ALIAS för webben.

**Steg 5 — kontrollera att det funkar.**
Vänta tills DNS slagit igenom (oftast tio minuter, ibland en timme) och kolla
sedan tre saker, en i taget, och berätta resultatet för mig:

1. `https://stonebite.org` visar en vit sida med rubriken "Vi bygger butiker
   som säljer." och ett hänglås i adressfältet.
2. `https://stonebite.org/halsa` svarar med en rad JSON som börjar
   `{"ok":true`.
3. `https://stonebite.org/kom-igang` visar ett formulär som heter
   "Skapa ägarkontot".

**Steg 6 — mitt konto.**
Öppna `https://stonebite.org/kom-igang` och säg till mig. Jag fyller i mitt
namn, min e-post och ett lösenord själv — skriv inte in några uppgifter åt mig
där. När jag är klar försvinner den sidan av sig själv.

Rapportera till sist: adressen till tjänsten, vilken hemlighet du satte,
och om något av de tre kontrollstegen inte gick igenom.

---

## Efter att Cowork är klar

Skriv till mig (Claude) så gör jag två saker:

1. **Rutinen som håller siffrorna färska.** Sajten läser en fil som hämtas med
   `node stonebite/hamta.mjs`. Jag sätter upp den som en rutin som kör varje
   timme, committar och pushar — då uppdaterar Railway sig själv.
2. **Kontona till teamet.** Du lägger till dem själv under **Konton** på
   sajten, men jag kan förbereda listan om du skickar namn, e-post och roll.

## Det jag behöver veta om verksamheten

Svara i chatten, en rad per fråga:

1. **Kontaktmejl till publika sidan.** Vilken adress ska stå på stonebite.org?
   (Just nu står ingen — jag vägrar publicera en privat gmail.)
2. **VA:erna.** Vad heter de, vilken e-post har de, och vilken butik svarar de
   för? Utan förnamn kan systemet inte koppla en recension till rätt person.
3. **Produkttestarna.** Samma sak: namn och e-post. Och ska Josh och Annabelle
   tjäna på produkttest också? De står som ansvariga på 25 produkter i Notion
   men får bara betalt som redigerare i dag.
4. **Head of customer support.** Vem är det, och vilka butiker har hen ansvar
   för?
5. **Bonusbeloppen.** Jag har satt dem så här — säg till om något ska ändras:
   5 dollar per recension med namn, 10 extra för tre på en vecka, 3 dollar per
   besvarad tvist, 10 för en vunnen, 15 för tom inkorg på fredagen, 10 för
   svarstid under 12 timmar. Produkttest: 2 / 5 / 25 / 100 dollar för godkänd,
   testad, lönsam, skalad. Head of support får 10 % av vad teamet tjänar.
6. **Trustpilot.** Har du ett Trustpilot Business-konto? I så fall behöver jag
   en API-nyckel och butikernas business unit-id, så läses recensionerna
   automatiskt. Utan det får VA:erna rapportera in dem själva på sajten — det
   fungerar, men någon måste godkänna varje rad.
