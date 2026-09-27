# /annonsvakt — vakten över alla annonskonton: nedstängt, avvisat, drar iväg (varje timme)

Argument: `$ARGUMENTS` — normalt `--discord` (rutinen). Utan flagga = torrt:
läser, dömer och visar larmet, men postar inget och skriver inget.
`--json <fil>` = hela resultatet. `--kolla` = nycklar, token:ens rättigheter
och vilka konton som svarar, inget mer.

```
/annonsvakt --discord      rutinen (varje timme :44)
/annonsvakt                provkör: allt utom post och minne
/annonsvakt --kolla        nycklar och konton
```

Uppdraget i en mening: **läs alla annonskonton token:en når, hitta det som
stoppar eller bränner pengar JUST NU — konto nedstängt eller borta, token som
dött, annons avvisad, adset eller kampanj med fel, annons som drar iväg med
spend utan köp — och säg det till Axel i Discord `#ad-alerts` (och i Slack när
den kanalen finns), en gång per sak.** Axels beställning 2026-09-27: "en rutin
som scannar alla annonskonton … efter problem med nedstängda annonser … rädda
mig ifall något annonskonto blir nedtaget, eller om annonsen blir nedtagen …
någon annons som drar åt helvete, som tar all spend".

⛔ **Läs-bara.** Vakten pausar, aktiverar, sänker och höjer ALDRIG något i
Meta — inte ens den annons som just bränt 17 000 kr utan köp. Den säger till;
Axel bestämmer (hans ord 2026-09-27: "Axels annonser pausas aldrig av en
session"). Facit för vad som larmas står i `annonsvakt/konfig.json`
(trösklar, ignorerade felkoder, kanal, Axels Discord-id:n) — ändra där, aldrig
i koden. Allt är beskrivet i `annonsvakt/README.md`.

⛔ **Tystnad är rätt svar när inget är fel.** Ett larm sägs EN gång (minnet
`annonsvakt/minne.json`), påminns efter `paminn_timmar` om det står kvar, och
får en ✅-rad när det försvinner. Spend-larmen kommer på fördubblingsnivåer
(1 500, 3 000, 6 000 kr …), aldrig varje timme. Första körningen varje dag
från 07 svensk tid postar ett 💓-hjärtslag så Axel ser att vakten lever.

CONNECTORS: inga. Meta läses med `META_ACCESS_TOKEN`, Discord postas med
`DISCORD_BOT_TOKEN`, Slack med `SLACK_WEBHOOK_URL` (valfri — utan den bara
Discord). Koppla ingen connector på rutinen.

## Gör i ordning

0. `git pull --rebase origin main`
   Rutinens session lever kvar mellan körningarna — utan pull kör den med ett
   gammalt minne och larmar om sådant som redan sagts. Misslyckas pullen
   (konflikt): `git rebase --abort`, skriv det i svaret, kör ändå.

1. `node annonsvakt/kor.mjs $ARGUMENTS`
   Skriptet gör allt: konton → problemannonser, aktiva kampanjer/adsets, dagens
   spend → reglerna → minnet avgör vad som är nytt → EN post i Discord bara om
   det finns något att säga → minnet skrivs (bara om det ändrats).
   Exit 4 = posten misslyckades: larmet står i terminalen och minnet är INTE
   skrivet, så det kommer igen nästa timme. Skriv orsaken i svaret.
   Ett konto som inte gick att läsa står som 🟡 `lasfel` i larmet — det är
   Metas rate limit eller token:ens rättigheter, aldrig ett skäl att gissa.

2. **Committa minnet om det ändrats.** `git status --porcelain annonsvakt/minne.json`
   tom ⇒ inget att committa, hoppa. Annars:
   `git pull --rebase origin main && git add annonsvakt/minne.json && git commit -m "Annonsvakten <datum> <HH:MM>: <N> nya, <M> påminda, <K> lösta, <H> händelser" && git push origin main`
   Minnet ÄR vakten: pushas det inte larmas samma sak om nästa timme, och
   sedan varje timme. Nekas pushen: skriv det som första rad i svaret.
   Committa aldrig något annat härifrån.

3. Svara Axel kort, på svenska: en rad per konto (spend i dag, fynd), vad som
   postades (eller "inget nytt"), och sist numrerat det som är HANS — ett
   avvisat annonsobjekt att överklaga, ett konto att titta på, en annons som
   drar iväg. Inga siffror ur huvudet: allt ur skriptets utskrift.

## Definition of done

- [ ] `git pull --rebase origin main` gjord (eller konflikten redovisad)
- [ ] `node annonsvakt/kor.mjs $ARGUMENTS` kördes — exit 0 (eller 4 med orsaken i svaret)
- [ ] Varje konto redovisat: spend i dag och fynd, eller läsfel med orsak
- [ ] Discord-post gjord BARA om det fanns något nytt, påmint, löst eller hjärtslag
- [ ] Minnet committat och pushat om det ändrades — annars inget committat
- [ ] Ingenting pausat, aktiverat eller ändrat i Meta
- [ ] Svaret till Axel på svenska, kort, hans uppgifter numrerade sist
