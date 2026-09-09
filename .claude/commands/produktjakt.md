# /produktjakt — hitta nya produkter och lägg dem i ett offertark

**Rutin, körs varje morgon 06:30 svensk tid** (cron `30 4 * * *` UTC), bunden till den fasta sessionen
`session_016jBJVGuyny8S3j2XPSM26Z` (tagg `routine:produktjakt`, trigger `trig_01AnGMfca7s1thCUqNbMSRoR`)
som har repot som källa — annars kan rutinen inte pusha. Uppdraget: hitta nya varor som passar Bäverbutiken,
räkna ekonomin, skriva dem i leverantörens offertark och lägga arket där Axel kan hämta det.
Axel ska bara trycka på en knapp och skicka filen vidare.

Argument (valfritt): `--antal <N>` (hur många produkter, standard 12) · `--manad <M>` (kör en annan
månads sökord, för att planera framåt) · `--fro <N>` (samma frö ger samma sökord — för omkörning).

## Vad rutinen gör

### 1. Hitta produkterna

```bash
cd /home/user/yognftnfgn/produktjakt
python3 hitta.py --antal 12 --sokord 14
```

Skriptet drar dagens sökord ur `sokord.json` (bara grupper vars `manader` innehåller körningsmånaden),
söker AliExpress, och gallrar på det som går att räkna: negativa rymden (`STOPPORD`), ekonomin
(landad ≈ inköp × 1,5, svenskt pris ≥ 2,4 × landad och ≥ 300 kr, landad ≤ 420 kr) och dubbletter mot
`sedda.json`. Utdata: `korningar/<datum>/fynd.json`.

**Varför AliExpress och inte Temu:** Temu stryper containerns IP till ungefär en hämtning i timmen
(mätt hela 2026-09-08). Samma leverantörsvaror finns på AliExpress, som svarar utan strypning och
vars länkar går att öppna. Se `docs/temu-jakt-v2/REGEL.md` avsnitt 8.

### 2. Läs igenom fynden innan de går vidare

Skriptet kan bara räkna. Du ska läsa. Gå igenom `fynd.json` och **stryk** varje rad som faller på:

- **Fel kund.** Bäverbutikens köpare är man 45–70 med villa, båt, jakt, ved, fordon. Ligger produkten
  utanför `docs/temu-jakt-v2/jakt/v23/KATALOG.md` sex kollektioner: stryk den.
- **Redan i butiken.** Finns produkten eller en nära variant i KATALOG.md: stryk.
- **Negativa rymden** (`docs/temu-vinnar-dna.md` avsnitt 6): personlig passform, kit, förbrukning,
  N-i-1, lek, allt som förvaras inomhus, montering som kräver inlärning.
- **Kranskyddsfällan:** skadan inträffar nov–feb men produkten säljs nu. Flytta den till rätt månad
  i `sokord.json` i stället för att sälja den för tidigt.
- **Dubblett i sak** — två rader som är samma produkt från olika säljare. Behåll den med bäst uppslag.

Skriv en rad per struken produkt i körningens `STATUS.md` med orsaken. Det är kvittot.

### 3. Bygg offertarket

```bash
python3 offert.py --fynd korningar/<datum>/fynd.json
```

Arket är Axels egen mall (`mall/offertmall.xlsx`). Ett block om fyra rader per produkt: bild, namn,
länk, marknad SWEDEN och kvantitetstrappan 100/200/300. **Prisfälten lämnas tomma** — arket är en
förfrågan, det är leverantören som fyller i dem.

### 4. Bygg och publicera sidan

```bash
python3 sida.py --fynd korningar/<datum>/fynd.json
```

Publicera `korningar/<datum>/sida.html` som artefakt med `capabilities: {downloads: true}` och
**samma URL varje dag** (`url`-parametern — utan den blir det en ny länk och Axel tappar bort sig):

    https://claude.ai/code/artifact/1512b4cb-e82d-45fb-845d-dc4029616b17

Sidan bär arket inbakat och lämnar det till Axel via `downloads`-capability. En vanlig `<a download>`
är död i artefaktens sandlåda — därför just den vägen.

### 5. Spara och rapportera

Lägg först en rad i `produktjakt/RUTIN-KVITTO.md` — datum, kandidater, levererade,
strukna, sida publicerad, Discord. Kvittot är det en utomstående session läser för att
se att körningen gick hela vägen; utan raden ser en lyckad körning ut som en utebliven.

```bash
git add produktjakt && git commit -m "produktjakt <datum>: N produkter" \
  && git push -u origin claude/fortsatta-pa-denna-c28bmv
```

`sedda.json` måste med i commiten — annars föreslår rutinen samma varor i morgon.

⚠️ **Rutinen kör från grenen `claude/fortsatta-pa-denna-c28bmv`, inte från `main`.**
`produktjakt/` finns bara där. Rutinens prompt börjar därför alltid med
`git fetch` + `git checkout -B` mot den grenen — containern kan ha startats om och
klonat `main`, och då saknas allt. Når koden `main` någon gång: byt tillbaka både
checkouten och pushen ovan till `main` och ta bort de här raderna.

Skicka morgonrapporten till Discord (`DISCORD_WEBHOOK_URL`) med antal produkter och länken till sidan.

## Bevisad i skarp körning

Första riktiga rutinkörningen: **2026-09-09**. Två sökomgångar → 22 kandidater klarade ekonomin →
9 kvar efter läsningen, 13 strukna med orsak. Arket byggt, sidan publicerad mot rätt URL, `sedda.json`
(25 id:n) och en säsongsrättning i `sokord.json` pushade. Kedjan checkout → hitta → läs → offert →
sida → push fungerar hela vägen. Bygg inte om något av det utan att först läsa den körningens
`STATUS.md`.

## Definition of done

- [ ] `korningar/<datum>/fynd.json` finns och har minst en produkt
- [ ] Varje struken produkt står i `STATUS.md` med orsak
- [ ] `Leverantorsoffert-<datum>.xlsx` byggd, prisfälten tomma, en rad per produkt
- [ ] Sidan publicerad mot **samma URL** som föregående dag
- [ ] Nedladdningsknappen testad (öppna sidan, tryck, filen kommer)
- [ ] `sedda.json` uppdaterad och pushad till arbetsgrenen
- [ ] Raden i `RUTIN-KVITTO.md` skriven och med i commiten
- [ ] Discord-rapport skickad

## Svaret till Axel

Dyslexiformatet i `CLAUDE.md`: **Läget** med max tre rader, sen hur många saker han ska göra.
Normalfallet är en enda sak — öppna sidan och ladda ner arket. Skriv aldrig ut sökord, filnamn
eller kommandon till honom.

## Filerna

| Vad | Var |
|---|---|
| Sökordskatalogen (objekt per säsong) | `produktjakt/sokord.json` |
| AliExpress-klienten (sök + produktsida) | `produktjakt/ali.py` |
| Hittaren med gallringen | `produktjakt/hitta.py` |
| Offertarket | `produktjakt/offert.py`, mall i `produktjakt/mall/offertmall.xlsx` |
| Sidan Axel hämtar från | `produktjakt/sida.py`, `produktjakt/sida-mall.html` |
| Redan föreslagna produkter | `produktjakt/sedda.json` |
| Körningarna | `produktjakt/korningar/<datum>/` |
| Gate-ordningen och LIVE-regeln | `docs/temu-jakt-v2/REGEL.md` |
