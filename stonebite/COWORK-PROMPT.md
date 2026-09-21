# Cowork-prompterna: lägg upp sajten och koppla stonebite.org

Två prompter, en per flik, i den här ordningen. Den andra behöver värden som
den första ger dig, så kör dem inte samtidigt.

| # | Flik | Fil | Vad den gör |
|---|---|---|---|
| 1 | Railway | `cowork/1-railway.txt` | Skapar tjänsten, miljövariablerna, volymen. Lämnar tillbaka DNS-värdena |
| 2 | Google Workspace / domänen | `cowork/2-dns.txt` | Letar upp var DNS ligger, lägger in posterna, rör aldrig mejlen |

Råfilerna att kopiera (öppna, Ctrl+A, Ctrl+C):

- https://raw.githubusercontent.com/Axel3738/yognftnfgn/claude/optimistic-noether-x1vnq8/stonebite/cowork/1-railway.txt
- https://raw.githubusercontent.com/Axel3738/yognftnfgn/claude/optimistic-noether-x1vnq8/stonebite/cowork/2-dns.txt

**Mellan de två:** prompt 1 slutar med att Cowork skriver ut exakt vilka
DNS-poster Railway vill ha. Kopiera de raderna och klistra in dem i prompt 2
där det står `<<< KLISTRA IN RAILWAYS RADER HÄR >>>`. Utan dem gissar Cowork,
och en gissad DNS-post kan slå ut mejlen.

Hela sjoket tar ungefär tjugo minuter, plus väntan på DNS.

⚠️ Mejlen på stonebite.org ligger i Google Workspace. Prompt 2 säger uttryckligen
åt Cowork att inte röra MX, SPF, DKIM eller verifieringsposterna — ta inte bort
den delen ur texten.

---

## Efter att Cowork är klar

Skriv till mig (Claude) så gör jag två saker:

1. **Rutinen som håller siffrorna färska.** Sajten läser en fil som hämtas med
   `node stonebite/hamta.mjs`. Jag sätter upp den som en rutin som kör varje
   timme, committar och pushar — då uppdaterar Railway sig själv.
2. **Kontona till teamet.** Du lägger till dem själv under **Konton** på
   sajten, men jag kan förbereda listan om du skickar namn, e-post och roll.

Ditt eget konto skapar du på `https://stonebite.org/kom-igang` — den sidan
stänger sig själv i samma sekund som kontot finns. Båda prompterna är skrivna
så att Cowork inte fyller i det formuläret åt dig.

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
