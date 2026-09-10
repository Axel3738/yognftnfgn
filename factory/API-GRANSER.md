# Vad som går att automatisera — och vad ingen har provat

Axel 2026-09-09: *"Min förra session hade massa limiting beliefs och sade att
allt detta aldrig skulle gå att automatisera."*

Han har rätt att vara misstänksam. Repot bär minst ett fall där ett
"API-spärrat" påstående var falskt: temapublicering stod som omöjlig i flera
filer tills någon faktiskt provade 2026-09-09 och den fungerade.

**Regeln den här filen finns för:** skriv aldrig "API:t kan inte" utan att ha
provat. Skriv "OBEKRÄFTAT — ingen har provat" i stället. Det är ärligt, och
det är en uppgift någon kan ta.

Varje rad är märkt:

| Märkning | Betyder |
|---|---|
| **MÄTT** | Någon körde anropet och fick svaret. Datum och felkod står. |
| **OBEKRÄFTAT** | Påståendet är ärvt. Ingen i repots historik har provat. |
| **MÄNSKLIGT** | Kräver pengar, identitet eller ett samtycke. Ska inte automatiseras. |

---

## Shopify

| Steg | Läge | Vad som faktiskt vet |
|---|---|---|
| Publicera tema | **MÄTT: GÅR** | `themePublish` gav `role: MAIN`, noll userErrors (DryTrek 2026-09-09). Stod som "API-spärrat" i tre filer innan någon provade. |
| Ladda upp VIDEO (mp4-demo) till Files | **MÄTT: GÅR INTE på trial** | `fileCreate` med `contentType: VIDEO` svarar `The file is not supported on trial accounts. Select a plan to upload this file.` (AdventLane/kalender 2026-09-10). Två fynd på vägen: staged `VIDEO`-resourceUrl saknar ändelse, så `filename` avvisas i `fileCreate` ("extension must match original source") — sätts med `fileUpdate` efteråt. Koden finns (`filer.mjs → laddaUppVideo`, CLI tar `.mp4`). **OBEKRÄFTAT efter plan** — kör `node factory/filer.mjs <mp4>` när ägaren valt plan (checklistans steg 10) och byt `media.gif_problem` till den transkodade URL:en (`--igen metafalt`). Tills dess bär källans GIF demot. |
| Ladda upp tema | **MÄTT: GÅR** | `stagedUploadsCreate` med `resource: FILE` (INTE `THEME` — den finns inte i 2025-07) + `themeCreate`. |
| Läsa sida på handle | **MÄTT: GÅR INTE** | `pageByHandle` togs bort i 2025-07. Använd `pages(query: "handle:…")`. |
| Uppdatera villkorad fraktmetod | **MÄTT: GÅR INTE** | `deliveryProfileUpdate` avvisar dem. Riv och bygg ny i stället. |
| Byta butikens VALUTA | **OBEKRÄFTAT** | Ingen har provat ett anrop. Men frågan är fel ställd: valutan sätts av **butiksadressens land vid skapandet**. Skapas butiken med bolagets svenska adress blir den SEK från början, och problemet finns inte. Det är därför checklistans steg 1 numera kräver adressen. |
| Byta PRIMÄRSPRÅK | **OBEKRÄFTAT** | `shopLocaleEnable`/`shopLocaleUpdate` hanterar extra språk — om primärspråket går att byta har ingen provat. Samma sak här: rätt adress vid skapandet ger rätt språk. |
| Byta PRIMÄRMARKNAD | **OBEKRÄFTAT** | `marketCreate`/`marketUpdate` finns och används redan för Norge. Om primärmarknaden går att flytta har ingen provat. |
| Skapa butiken | **OBEKRÄFTAT** | Shopifys Partner API kan skapa development stores. Ingen i repot har provat. Skulle ta bort checklistans avsnitt 1 OCH garantera rätt land. **Den här är värd mest av alla — den fixar tre problem på en gång.** |
| Skapa appen + client id/secret | **OBEKRÄFTAT** | Partner API har app-endpoints. Ingen har provat. Skulle ta bort avsnitt 2 (fyra klick). |
| Koppla domän till butiken | **OBEKRÄFTAT** | Ingen har provat. |
| Aktivera Shopify Payments | **MÄNSKLIGT** | Kräver bolagets bankuppgifter och identitetskontroll. Ska inte automatiseras. |
| Installera Judge.me | **MÄNSKLIGT (delvis)** | Appinstallation kräver ett OAuth-samtycke. Efter installationen är API:t automatiserbart — det görs redan. |
| Ägarbyte | **MÄNSKLIGT** | Överlåter ett konto med pengar i. Ska klickas av en människa. |

## Meta

| Steg | Läge | Vad som faktiskt vet |
|---|---|---|
| Skapa pixel | **MÄTT: GÅR** | `act_<id>/adspixels`. ⚠️ Ett annonskonto tar bara EN pixel — fel #6200 på butik nr 3. Reserv: skapa på företaget och dela till kontot. |
| Tilldela CAPI-användare | **MÄTT: GÅR** | `assigned_users` på pixeln. |
| Skapa CAPI-token | **MÄTT: GÅR INTE** | Kräver `appsecret_proof`. Görs i Events Manager. |
| Skapa en SIDA | **OBEKRÄFTAT** | Står som omöjligt i PROCESS.md utan att någon citerat ett anrop eller en felkod. Metas API har sidendpoints med behörighetskrav. Ingen har provat. |

## Discord

| Steg | Läge | Vad som faktiskt vet |
|---|---|---|
| Skapa server | **MÄTT: GÅR INTE** | `POST /guilds` → felkod 20001 (2026-09-08). Boten får inte. |
| Skapa kanaler | **MÄTT: GÅR** | Med `--guild <id>` efter att en människa godkänt boten. |

## Loopia

| Steg | Läge | Vad som faktiskt vet |
|---|---|---|
| Köpa domän | **OBEKRÄFTAT** | Loopia har ett XML-RPC-API. Ingen har provat. |
| Sätta e-postvidarebefordran | **OBEKRÄFTAT** | Samma API. Ingen har provat. |

---

## Vad som är värt att prova härnäst, i ordning

1. **Skapa butiken via Partner API.** Tar bort avsnitt 1 och 2 (sex klick) och
   gör valuta-, språk- och marknadsfrågan omöjlig att göra fel. Störst effekt
   per timme.
2. **Loopia-API:t.** Tar bort avsnitt 4 (fyra klick).
3. **Meta-sidan.** Tar bort två klick och en väntan mitt i flödet.

Kvar som människans, oavsett hur mycket som automatiseras: pengarna (plan,
kort, Shopify Payments, Klarna), identiteten (KYC), samtycket (appinstallation,
Discord-boten) och ägarbytet. Det är ungefär tio klick av femtio, och de ska
vara en människas.

**Innan du lägger till en rad här: prova.** En rad med MÄTT är värd något. En
rad med OBEKRÄFTAT är en uppgift. Ett påstående utan märkning är en limiting
belief, och det var precis det som gjorde att ingen provade på ett halvår.
