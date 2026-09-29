# /annonsvakt — vakten över alla annonskonton: nedstängt, avvisat, drar iväg (varje timme)

Argument: `$ARGUMENTS` — normalt `--discord` (rutinen). Utan flagga = torrt:
läser, dömer och visar larmet, men postar inget och skriver inget.
`--json <fil>` = hela resultatet. `--kolla` = nycklar, token:ens rättigheter
och vilka konton som svarar, inget mer. `--postat <id …|alla>` = kvittera
Slack-meddelanden som sessionen postat via connectorn (steg 1b).

```
/annonsvakt --discord      rutinen (varje timme :44)
/annonsvakt                provkör: allt utom post och minne
/annonsvakt --kolla        nycklar och konton
```

Uppdraget i en mening: **läs alla annonskonton token:en når, hitta det som
stoppar eller bränner pengar JUST NU — konto nedstängt eller borta, token som
dött, annons avvisad, adset eller kampanj med fel, annons som drar iväg med
spend utan köp — och säg det till Axel: allt i Discord `#ad-alerts`, det röda
på svenska i Slack `#urgent`, en gång per sak, med länk till Ads Manager.**
Axels beställning 2026-09-27: "en rutin som scannar alla annonskonton … efter
problem med nedstängda annonser … rädda mig ifall något annonskonto blir
nedtaget, eller om annonsen blir nedtagen … någon annons som drar åt helvete,
som tar all spend".

⛔ **Läs-bara.** Vakten pausar, aktiverar, sänker och höjer ALDRIG något i
Meta — inte ens den annons som just bränt 17 000 kr utan köp. Den säger till;
Axel bestämmer (hans ord 2026-09-27: "Axels annonser pausas aldrig av en
session"). Facit för vad som larmas står i `annonsvakt/konfig.json`
(trösklar, ignorerade felkoder, kanaler, Axels Discord-id:n) — ändra där, aldrig
i koden. Allt är beskrivet i `annonsvakt/README.md`.

⛔ **Tystnad är rätt svar när inget är fel.** Ett larm sägs EN gång (minnet
`annonsvakt/minne.json`), påminns efter `paminn_timmar` om det står kvar, och
får en ✅-rad när det försvinner. Spend-larmen kommer på fördubblingsnivåer
(1 500, 3 000, 6 000 kr …), aldrig varje timme. Första körningen varje dag
från 07 svensk tid postar ett 💓-hjärtslag i Discord så Axel ser att vakten lever.

CONNECTORS: inga krävs. Meta läses med `META_ACCESS_TOKEN`, Discord postas med
`DISCORD_BOT_TOKEN`, Slack `#urgent` med `SLACK_WEBHOOK_URL` eller
`SLACK_BOT_TOKEN` i miljön. Saknas Slack-nyckeln läggs det röda i
`annonsvakt/output/att-posta.json`, och FINNS Slack-connectorn i sessionen
(`mcp__Slack__slack_send_message`) postar sessionen det i steg 1b. ⚠️ Mätt
2026-09-29: rutinens fasta session har inga Slack-verktyg och connectorn går
inte att koppla på en rutin — i rutinen är det nyckeln som gäller.

## Gör i ordning

0. `git pull --rebase origin main`
   Rutinens session lever kvar mellan körningarna — utan pull kör den med ett
   gammalt minne och larmar om sådant som redan sagts. Misslyckas pullen
   (konflikt): `git rebase --abort`, skriv det i svaret, kör ändå.

1. `node annonsvakt/kor.mjs $ARGUMENTS`
   Skriptet gör allt: konton → problemannonser, aktiva kampanjer/adsets, dagens
   spend → reglerna → minnet avgör vad som är nytt → EN post i Discord bara om
   det finns något att säga → det röda på svenska till Slack (nyckel i miljön,
   annars kön) → minnet skrivs (bara om det ändrats).
   Exit 4 = Discord-posten misslyckades: larmet står i terminalen och minnet
   är INTE skrivet, så det kommer igen nästa timme. Skriv orsaken i svaret.
   Ett konto som inte gick att läsa står som 🟡 `lasfel` i larmet — det är
   Metas rate limit eller token:ens rättigheter, aldrig ett skäl att gissa.

1b. **Kön till Slack, bara om rapporten säger `ATT POSTA via Slack-connectorn`.**
   Då finns `annonsvakt/output/att-posta.json` med `kanalId` och meddelanden
   (`id`, `text`). Finns verktyget `mcp__Slack__slack_send_message` i den här
   sessionen: för VARJE meddelande, ett i taget —
   - `mcp__Slack__slack_send_message` med `channel_id` = filens `kanalId`
     (`C0C4MTQNMT7`, #urgent) och `message` = meddelandets `text`, ordagrant.
   - Lyckades det: `node annonsvakt/kor.mjs --postat <id>` direkt. Kvittera
     aldrig ett meddelande som inte gick iväg, posta aldrig samma id två gånger.
   Saknas verktyget (rutinen): posta inget, låt filen ligga, och skriv i
   svaret att Slack väntar på nyckeln i miljön. Rader äldre än ett dygn faller
   bort av sig själva — Discord har dem.

2. **Committa minnet om det ändrats.** `git status --porcelain annonsvakt/minne.json`
   tom ⇒ inget att committa, hoppa. Annars:
   `git pull --rebase origin main && git add annonsvakt/minne.json && git commit -m "Annonsvakten <datum> <HH:MM>: <N> nya, <M> påminda, <K> lösta, <H> händelser" && git push origin main`
   Minnet ÄR vakten: pushas det inte larmas samma sak om nästa timme, och
   sedan varje timme. Nekas pushen: skriv det som första rad i svaret.
   Committa aldrig något annat härifrån — `annonsvakt/output/` är gitignorerad.

3. Svara Axel kort, på svenska: en rad per konto (spend i dag, fynd), vad som
   postades (Discord, Slack eller kö), och sist numrerat det som är HANS — ett
   avvisat annonsobjekt att överklaga, ett konto att titta på, en annons som
   drar iväg, med länken ur larmet. Inga siffror ur huvudet: allt ur skriptets utskrift.

## Definition of done

- [ ] `git pull --rebase origin main` gjord (eller konflikten redovisad)
- [ ] `node annonsvakt/kor.mjs $ARGUMENTS` kördes — exit 0 (eller 4 med orsaken i svaret)
- [ ] Varje konto redovisat: spend i dag och fynd, eller läsfel med orsak
- [ ] Discord-post gjord BARA om det fanns något nytt, påmint, löst eller hjärtslag
- [ ] Det röda i Slack `#urgent`: postat med nyckeln, eller ur kön via connectorn och kvitterat, eller "väntar på nyckeln" i svaret
- [ ] Minnet committat och pushat om det ändrades — annars inget committat
- [ ] Ingenting pausat, aktiverat eller ändrat i Meta
- [ ] Svaret till Axel på svenska, kort, hans uppgifter numrerade sist
