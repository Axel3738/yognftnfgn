# Cowork-prompterna: lägg upp sajten och koppla stonebite.org

Två prompter, en per flik, i den här ordningen. Den andra behöver värden som
den första ger dig, så kör dem inte samtidigt.

| # | Flik | Fil | Vad den gör |
|---|---|---|---|
| 1 | Railway | `cowork/1-railway.txt` | Skapar tjänsten, miljövariablerna, volymen. Lämnar tillbaka DNS-värdena — ✅ körd 2026-09-21 |
| 2 | Google Workspace / domänen | `cowork/2-dns.txt` | Letar upp var DNS ligger, lägger in posterna, rör aldrig mejlen — ✅ körd 2026-09-21 (www fungerar, roten blev en 302) |
| 3 | Google Workspace / domänen | `cowork/3-rot.txt` | **Roten utan www:** ALIAS-post på `@` hos Squarespace mot Railways rotvärde, vidarebefordran + Squarespaces A-poster bort. Rör aldrig mejlen |
| 7 | Shopify Dev Dashboard + butikernas admin | `cowork/7-tvister-no-dk-fi.txt` | Lägger till `read_shopify_payments_disputes` på apparna för NO/DK/FI ("Bever No produkter claude", "DK claudeprodukter", "FI claudeprodukter"), släpper en ny version, godkänner i varje admin. Tar aldrig bort en rättighet — stoppar om Scopes-fältet är tomt. Fristående från 1–3 |

Råfilerna att kopiera (öppna, Ctrl+A, Ctrl+C):

- https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/stonebite/cowork/1-railway.txt
- https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/stonebite/cowork/2-dns.txt
- https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/stonebite/cowork/3-rot.txt
- https://raw.githubusercontent.com/Axel3738/yognftnfgn/main/stonebite/cowork/7-tvister-no-dk-fi.txt

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

## Verksamheten — Axels svar 2026-09-21, inskrivna i repot

| Fråga | Svar | Var det sitter |
|---|---|---|
| Kontaktmejl på publika sidan | `contact@stonebite.org` | `stonebite/profil.json` |
| VA:erna | **Mechile Delos Santos** — ansvarig för allt just nu | `bonus/personer.json` (`brands: ["*"]` = alla butiker) |
| Head of customer support | Mechile, alla butiker | samma rad, roll `support_chef` (tjänar VA-uppdragen direkt) |
| Produkttestarna | Josh och Annabelle tjänar på produkttest också: **15 dollar per färdig produkt** + sin vanliga 0,4 % på de egna annonserna (bara Sverige) | `extraRoller: ["produkttest"]`, `bonus/regler.json` → produkttest |
| Bonusbeloppen | Tvister halverade: **1 dollar besvarad, 5 dollar vunnen**. Tom inkorg 15 och svarstid 10 per vecka står kvar — men betalas en gång per vecka när **alla** butiker klarar det, inte per butik. Head of support 10 % av teamet, utan egna rader (noll medan hon är ensam) | `bonus/regler.json` |
| Trustpilot | Inget konto, och det behövs inte: Judge.me läses redan automatiskt. Skaffar Axel ett senare: `TRUSTPILOT_API_KEY` + `TRUSTPILOT_BUSINESS_UNITS` i Environments | `bonus/kallor.mjs` |

Det enda som inte står i repot är **Mechiles e-post** — den skriver Axel in
själv när han skapar hennes konto på sidan Konton (koppla till personen
`mechile` så räknas bonusen från dag ett).
