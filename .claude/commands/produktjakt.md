# /produktjakt — hitta nya produkter, lägg dem i offertarket, lär av Axels svar

**Rutin, körs varje morgon 06:30 svensk tid** (cron `30 4 * * *` UTC), bunden till den fasta sessionen
`session_016jBJVGuyny8S3j2XPSM26Z` (tagg `routine:produktjakt`) som har repot som källa — annars kan
rutinen inte pusha. Uppdraget: hitta varor som liknar kontots vinnare (**inte** kedjevaror), räkna
ekonomin, lägga dem i leverantörens offertark på sidan Axel öppnar, och **bli bättre av varje svar han ger**.
Axel gör två saker: laddar ner arket, och trycker Ja/Kanske/Nej på varje produkt.

**`produktjakt/MASTERPROMPT.md` är ordern.** Den här filen är körordningen — vad som görs i vilken
ordning, med vilka skript. Säger de olika gäller MASTERPROMPT.md; skriv då om den här filen.

Argument (valfritt): `--antal <N>` (produkter, standard 12) · `--manad <M>` (annan månads fönster, för
planering) · `--fro <N>` (samma frö = samma sökord) · `--vitlista` (A6 kroppsskydd, bara när A1–A5 är uttömda).

⚠️ **Rutinen kör från grenen `claude/fortsatta-pa-denna-c28bmv`, inte från `main`.** `produktjakt/`
finns bara där. Börja därför varje körning med fetch + checkout mot grenen — containern kan ha startats om
och klonat `main`. Når koden `main`: byt tillbaka checkouten och pushen till `main` och stryk den här raden.

## Körordningen

### 0. Minnet och feedbacken — FÖRE varje sökning (MASTERPROMPT avsnitt 8)

```bash
cd /home/user/yognftnfgn && git fetch origin claude/fortsatta-pa-denna-c28bmv \
  && git checkout -B claude/fortsatta-pa-denna-c28bmv origin/claude/fortsatta-pa-denna-c28bmv
python3 -c "import openpyxl" || pip install openpyxl
cd produktjakt
```

1. **Axels svar från sidan.** `Artifact read_db` med `url` = sidans URL nedan, `db_op: list`,
   `collection: feedback`, `out_dir: /home/user/yognftnfgn/produktjakt/feedback/db`. Sedan
   `python3 feedback.py samla` — läser dokumenten, skriver `feedback/feedback.json`, räknar `vikter.json`
   och auto-delen i `LARDOMAR.md`. Svar Axel gett i chatten: `python3 feedback.py svar <datum> <product_id> nej "Verktyg / pryl"`.
2. **Kontots facit.** Läs kampanjnamnen i MagiBorsten `1867947880635861` (`META_ACCESS_TOKEN`,
   `act_1867947880635861/campaigns?fields=name,created_time,insights{spend,actions,purchase_roas}`).
   En kampanj med en levererad produkts prefix inom 14 dagar = `launchad`; var tredje dag, för kampanjer
   med ≥ 2 000 kr spend: `>=BE` / `<BE` (BE ur kampanjnamnet) / `svalt`. Skriv `utfall.json`
   (`{"utfall": {"<kampanjnamn>": {datum, spend, kop, roas, be, utfall, taggar}}}`) med produktens taggar ur
   dess `fynd.json`, och kör `python3 feedback.py vikter` igen. Metas facit väger tyngre än klick.
3. **Läs** `LARDOMAR.md` (hela), `SIGNALER.md`, `vikter.json` (`stopp`/`lyft`), `MEKANISM.md`, gårdagens
   `korningar/<datum>/STATUS.md` och `fynd.json`, `vinnare/FAKTA-*.md`. Allt under `stopp` söks inte.
   Rör aldrig `poang_max` i MASTERPROMPT på grund av klick (8.5).

### 1. Masterpromptens steg 1–6: kalender → objekt → ankare → sökfras

Följ MASTERPROMPT.md avsnitt 4 bokstavligt, steg 1–6, **innan** något skript körs:

- **Kalendern** (steg 1): dagens datum, varje hårt datum 2–12 veckor fram med veckotal. Säsongen bedöms
  mot **halvan av månaden**, inte månadsnumret *(Axels påpekande 2026-09-09)*: avställning och skydd säljs
  nu, utrustning för nästa säsong hör hemma i april–juni. Datum > 12 v → `backlog.json` med körningsvecka.
- **Objekten** (steg 2): filtrera `objekt.json` på `manader` som täcker fönstret. Nya objekt som kalendern
  ger men filen saknar: lägg till raden (schema i MASTERPROMPT 8.4). Verktygsrader finns inte och söks inte.
- **Dubblett på SAK** (steg 3): `KATALOG.md` **och** live `bäverbutiken.se/products.json`, kontots
  kampanjnamn 7 dagar, `vinnare/FAKTA-*.md`, gårdagens `fynd.json`. Samma vara har flera `product_id`
  — `sedda.json` räcker inte. *(Incident 2026-09-09: fyra av åtta stod på gårdagens ark.)* Träff →
  "finns redan: …" eller "syskon till vinnare: …" i STATUS, aldrig tyst; ägaren går till A5.
- **Ankaret** (steg 4): fackhandelns dyraste märke i samma form (namn, pris, URL, i sortiment) → kedjornas
  och **svensk näthandels** golv (Biltema, Jula, Clas Ohlson, Rusta, Bauhaus, Fyndiq, CDON, Amazon.se,
  vidaXL, branschbutiker — vedklyvkonen föll på Jämtfire 169 kr, inte på en kedja) → annonsörer via
  proxyn i REGEL G2 (Ad Library bara om den svarar). **Skriv `ankare_sek` på raden i `objekt.json`** —
  utan det räknar `hitta.py` priset som landad × 2,4 med tak 420 kr, och då fälls ett taköverdrag.
- **Prisbandet** (steg 5) och **sökfraserna** (steg 6): formordet måste stå i frasen, verktygsord får inte.
  Karantän 14 dagar per fras (`anvanda-sokord.json`, `KARANTAN_DAGAR`).

### 2. Sök

```bash
python3 hitta.py --kalla objekt --antal 12 --sokord 14        # --vitlista bara för A6
```

`objekt.json` är standardkällan; `sokord.json` (185 ord, 20 grupper) är den gamla katalogen som gav
kedjevaror — dras bara med `--kalla sokord`/`bada`. Skriptet gallrar STOPPORD (med undantagen A4/A6),
ekonomin (ankare eller landad × 2,4), `sedda.json`, Axels `stopp`, och förrankar på uppslag × vikt.
Utdata `korningar/<datum>/fynd.json` med `taggar` (objekt, arketyp, form) per produkt.
Ladda ner varje `bild` till `korningar/<datum>/bilder/` — det är den enda bilden AliExpress ger
(produktsidorna svarar tomt, SIGNALER.md). Blockerad bild = "ej sedd", aldrig gissad.

### 3. Poängsätt varje kandidat — K0–K12 på bilden (MASTERPROMPT avsnitt 5)

Kill-reglerna i ordningen K0 → K1 → K2 → K3 → K4 → K5 → K6 → K7 → K8 → K10 → K11 → K12; första kill
avslutar raden med kriteriet som orsak i `STATUS.md`. Överlevarna får poäng 0–100 och
`rank_slutlig = poäng × Π score` (vikterna ur `vikter.json`). `MEKANISM.md` (åtta variabler, wow-testet:
händer något synligt inom tre sekunder?) är stödet för K5 och K10 — leverantörens film söks på
TikTok/YouTube bara när K5 = 5.

Skriv i `fynd.json` per produkt: `per_kriterium` K0–K12, alla åtta taggar (objekt, arketyp, form,
deadline_typ, deadline_klass, ankare_klass, ankare_kalla, prisband), `rank_slutlig`, ägarfrågan ≤ 7 ord
och efter-bilden ≤ 8 ord. Sortera på `rank_slutlig`.

**Arket är en förfrågan, inte ett launchbeslut** *(Axels beslut 2026-09-09 kväll)*: allt som överlever
kill-reglerna går på arket, i rankordning. ≥ 75 med K1/K2/K6 ≥ 10 = launch-kandidat (max 5, hellre 2);
55–74 = offertrad; < 55 = svag offertrad, sist och märkt. Domen står i `STATUS.md` så den som väljer ur
offerten vet. Fyll aldrig ut: 4 bra slår 12 svaga.

### 4. Bygg offertarket

```bash
python3 offert.py --fynd korningar/<datum>/fynd.json
```

Axels mall (`mall/offertmall.xlsx`): ett block om fyra rader per produkt — bild, namn, länk, SWEDEN,
kvantitetstrappan 100/200/300. **Prisfälten lämnas tomma** — leverantören fyller i dem.

### 5. Bygg och publicera sidan

```bash
python3 sida.py --fynd korningar/<datum>/fynd.json
```

Publicera `korningar/<datum>/sida.html` som artefakt med `capabilities: {downloads: true, db: {}}` mot
**samma URL varje dag** (`url`-parametern — utan den blir det en ny länk och Axel tappar bort sig):

    https://claude.ai/code/artifact/1512b4cb-e82d-45fb-845d-dc4029616b17

Sidan bär arket inbakat (`downloads`) och Axels knappar Ja/Kanske/Nej + orsaker (`db`, samlingen
`feedback`). Säger publiceringen att en nyare version finns: läs den, bygg om från dagens `fynd.json` och
publicera igen — skriv aldrig över med gårdagens sida.

### 6. Spara och rapportera

1. `korningar/<datum>/STATUS.md`: kvar (med poäng och dom) och strukna (med kriterium), dagens datum,
   parkerade objekt med körningsvecka, Meta-utfall.
2. Raden i `LARDOMAR.md` under **Egna anteckningar**, exakt enligt MASTERPROMPT 8.6.
3. Raden i `RUTIN-KVITTO.md` — datum, kandidater, levererade, strukna, sida publicerad, Discord.
4. Commit och push till grenen: `sedda.json`, `anvanda-sokord.json`, `objekt.json`, `backlog.json`,
   `feedback/feedback.json`, `vikter.json`, `utfall.json`, `LARDOMAR.md` och körningen måste med.

```bash
cd /home/user/yognftnfgn && git add produktjakt && git commit -m "produktjakt <datum>: N produkter" \
  && git push -u origin claude/fortsatta-pa-denna-c28bmv
```

5. Morgonrapport till Discord (`DISCORD_WEBHOOK_URL`): antal produkter, launch-kandidater, länken.

## Definition of done

- [ ] Steg 0 kört: Axels svar inlästa, `vikter.json` omräknad, `LARDOMAR.md` läst FÖRE sökningen
- [ ] Kalender + ankare skrivna i `objekt.json` (`ankare_sek`) innan `hitta.py` kördes
- [ ] `korningar/<datum>/fynd.json` finns; varje produkt har `per_kriterium`, åtta taggar, `rank_slutlig`, hook
- [ ] Varje struken produkt står i `STATUS.md` med kriterium; dubblettkoll gjord på SAK
- [ ] Inget verktyg/pryl levererat; ingen produkt utan datum eller pågående skada
- [ ] `Leverantorsoffert-<datum>.xlsx` byggd, prisfälten tomma
- [ ] Sidan publicerad mot **samma URL** med `downloads` + `db`; knapparna finns; nedladdningen testad
- [ ] Raden i `LARDOMAR.md` och `RUTIN-KVITTO.md` skriven; allt committat och pushat till grenen
- [ ] Discord-rapport skickad
- [ ] De tio kontrollfrågorna i MASTERPROMPT avsnitt 9 besvarade — nej på 1–3 betyder laga metoden först

## Svaret till Axel

Dyslexiformatet i `CLAUDE.md`: **Läget** med max tre rader, sen hur många saker han ska göra.
Normalfallet är en enda sak — öppna sidan, ladda ner arket och trycka Ja/Kanske/Nej. Skriv aldrig ut
sökord, filnamn, kommandon eller poäng till honom.

## Bevisat i skarp körning

**2026-09-09**, första dagen: kedjan checkout → sök → läs → offert → sida → push fungerade hela vägen
(3 sökomgångar, 82 kandidater, 9 på arket). Samma kväll: alla nio var verktyg/prylar — Axel kallade det
"slop" — och den nya sökregeln (MASTERPROMPT.md, DOA v3.1) byggdes ur hans tre senaste vinnare
(taköverdrag husvagn 1 129 kr, utekattkoja 789 kr, adventskalender racingbilar 499 kr). Backtest på 40
produkter: de tre vinnarna 90–96 poäng, 0 av 20 förlorare/slop släppta igenom
(`vinnare/BACKTEST-2026-09-09.md`). Axels första nio svar på sidan lästes in samma kväll.

## Filerna

| Vad | Var |
|---|---|
| **Ordern: uppdrag, köpare, arketyper, sökalgoritm, poängkort, negativ rymd, feedbackloop** | `produktjakt/MASTERPROMPT.md` |
| Objektuniversumet — objekt × månader × skyddsform × ankare × sökfraser | `produktjakt/objekt.json` |
| Faktapaketet om vinnarna och backtesten | `produktjakt/vinnare/` |
| Axels signaler (vad han sagt, och vad det inte betyder) | `produktjakt/SIGNALER.md` |
| Urvalsmallen — åtta variabler, wow-testet | `produktjakt/MEKANISM.md` |
| Lärdomar ur svaren (auto + egna rader) | `produktjakt/LARDOMAR.md` |
| Feedback: samla / svar / vikter | `produktjakt/feedback.py` → `feedback/feedback.json`, `vikter.json` |
| Metas facit per launchad produkt | `produktjakt/utfall.json` |
| AliExpress-klienten (sök + produktsida) | `produktjakt/ali.py` |
| Hittaren med gallringen | `produktjakt/hitta.py` |
| Gamla sökordskatalogen (reserv, ger kedjevaror) | `produktjakt/sokord.json` |
| Offertarket | `produktjakt/offert.py`, mall i `produktjakt/mall/offertmall.xlsx` |
| Sidan Axel hämtar från och svarar på | `produktjakt/sida.py`, `produktjakt/sida-mall.html` |
| Redan föreslagna id:n · sökordskarantän | `produktjakt/sedda.json`, `produktjakt/anvanda-sokord.json` |
| Körningarna | `produktjakt/korningar/<datum>/` |
| Kvittot per körning | `produktjakt/RUTIN-KVITTO.md` |
| Gate-ordningen och LIVE-regeln (Temu-tiden, bakgrund) | `docs/temu-jakt-v2/REGEL.md` |
| Vinnar-DNA:t (bakgrund; MASTERPROMPT är dess uppdatering) | `docs/temu-vinnar-dna.md` |
