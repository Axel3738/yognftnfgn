# /produktjakt — produktfabriken V3: lär av gårdagen, hitta dagens batch, samla svar

**Rutin, körs varje morgon 06:30 svensk tid** (cron `30 4 * * *` UTC), bunden till den fasta sessionen
`session_016jBJVGuyny8S3j2XPSM26Z` (tagg `routine:produktjakt`, trigger `trig_01ER8txR7LN7QegEuARvzue6`)
som har repot som källa — annars kan rutinen inte pusha. Uppdraget: **lära sig vad Bäverbutikens Meta-konto
faktiskt belönar** och leverera en liten daglig batch (10–15, hellre 7 bra än 12 svaga) på sidan Axel öppnar.
Axel gör två saker: laddar ner arket, och trycker Ja/Kanske/Nej på varje produkt.

**`produktjakt/V3-FLODE.md` är flödet, `produktjakt/LEARNING_STATE.md` är minnet, `produktjakt/MASTERPROMPT.md`
är bakgrunden** (DOA v3.1 — poängkortet K0–K12 är bevis, inte dom, sedan 2026-09-11). Den här filen är
körordningen. Bevishierarkin gäller alltid: Metas facit vid meningsfull spend > Axels klick > svensk
marknadsevidens > leverantörsevidens > gamla hypoteser > allmän e-handelsteori.

Argument (valfritt): `--max <N>` (batchstorlek, standard 15) · `--datum <YYYY-MM-DD>` · `--utan-discovery` (bara steg 0, för kontroll).

⚠️ **Rutinen kör från grenen `claude/fortsatta-pa-denna-c28bmv`, inte från `main`.** `produktjakt/`
finns bara där. Börja därför varje körning med fetch + checkout mot grenen — containern kan ha startats om
och klonat `main`. Når koden `main`: byt tillbaka checkouten och pushen till `main` och stryk den här raden.

## Körordningen

```bash
cd /home/user/yognftnfgn && git fetch origin claude/fortsatta-pa-denna-c28bmv \
  && git checkout -B claude/fortsatta-pa-denna-c28bmv origin/claude/fortsatta-pa-denna-c28bmv
python3 -c "import openpyxl" || pip install openpyxl
cd produktjakt && export DATUM=$(date +%F) && mkdir -p korningar/$DATUM/v3/bilder
```

### 0. LÄR FÖRE SÖKNING — obligatoriskt, aldrig hoppat

**0A. Axels svar.** `Artifact read_db` med `url` = sidans URL nedan, `db_op: list`, `collection: feedback`,
`out_dir: /home/user/yognftnfgn/produktjakt/feedback/db`. Sedan `python3 feedback.py samla` (skriver
`feedback/feedback.json`, `vikter.json`, `LARDOMAR.md` **och** `koncept.json`). Svar Axel gett i chatten:
`python3 feedback.py svar <datum> <product_id> nej "Verktyg / pryl"`. Läs varje nytt nej och **skriv ut varför**
(personlig preferens / kommersiellt / dubblett / leverantör / material / pris / svagt koncept / fel timing) i
STATUS.md — svartlista aldrig en hel kategori på ett klick. Ett nej på ett koncept (`koncept.py sok`) söks inte
igen förrän något i `aterupptas_om` ändrats.

**0B. Metas facit.** `python3 meta_facit.py hamta && python3 meta_facit.py utfall && python3 koncept.py backfyll`.
Läser ALLA kampanjer i MagiBorsten `1867947880635861` (`META_ACCESS_TOKEN`) med spend, köp, CPA, ROAS, CTR, CPC,
CPM, klassar mot produktens egen BE-CPA (`facit/FACIT.md`: UNTESTED / TOO_EARLY / EARLY_SIGNAL / MEANINGFUL / HIGH →
REAL_WINNER / REAL_LOSER / INSUFFICIENT_DATA / UNTESTED) och sparar dagens snapshot. En dom är bekräftad först
med två snapshots ≥ 3 dygn isär. Nya kampanjer utan produktkoppling står sist i FACIT.md — lägg in dem i
`facit/historik-taggar.json` (arketyp + variabler) samma morgon, annars räknas de inte.

**0C. Lär.** `python3 larande.py` → `LEARNING_STATE.md`. **Läs hela filen.** Jämför prediktion mot verklighet
(tabellen "PREDICTION VS REALITY"): en vinnare modellen refuterade väger tyngst. Ändras en hypotes status
(stärkt/försvagad) eller finns ett nytt motbevisat antagande: skriv in det i `hypoteser.json` med bevis och datum.

**0D. Säsong.** `python3 sasong.py` → `korningar/$DATUM/SASONG.md`. Jaga bara fönster med TIMING = NOW
(2–16 v till topp) eller LATE med pågående skada. EARLY → `backlog.json` med körningsvecka.

### 1. Upptäck — 70 % exploitation, 30 % exploration

Generera kandidater ur ägare → objekt → problem/felläge → vad blir irriterande de närmaste 2–16 veckorna →
dyrt objekt / billigt skydd → improvisationen i dag → finns utomlands men inte i Sverige → ovanligt visuell
demonstration. Inte ur slumpade sökord. Kör 3–4 discovery-linser (subagenter, `Agent` med
`V3-AGENTPROTOKOLL.md` som order): en per struktur som LEARNING_STATE pekar ut som stark (exploitation), en per
aktiv hypotes värd att testa (exploration), en för Q4/hobby/datum när SASONG.md har sådana fönster. Varje lins
söker AliExpress (`ali.py`), verifierar live, läser svenska golvet med URL, mäter ankaret, tittar på heron,
räknar ekonomin som intervall, och skriver `korningar/$DATUM/v3/kandidater-<X>.json` enligt
`V3-KANDIDATSCHEMA.md`. Abstrahera uppåt: två överdrag vann ⇒ leta *strukturen* på nya objekt, inte tjugo överdrag.

`hitta.py --kalla objekt --antal 0 --sokord 14` finns kvar som bred förrensning ur `objekt.json` (skriver alla
som klarat ekonomin till `korningar/$DATUM/fynd-bred.json`) — använd den som råmaterial åt linserna, aldrig som batch.

### 2–3. Verifiera, golv, ankare, material, ekonomi — ingår i steg 1

`LIVE_VERIFIED` bara när produktsidan öppnats (`ali.py <id>`), titeln stämmer, heron är nedladdad och sedd, priset
sett i sökträffen, varianter noterade, UTC-stämpel satt. Blockerad ≠ död: pröva annan listning. Ingen länk till Axel
utan detta (REGEL §8: tre overifierade länkar 09-08 var alla slutsålda). K0 på SAK mot
`korningar/$DATUM/v3/katalog-live.txt` (Shopify Admin API, `SHOPIFY_CLIENT_ID_SE`/`_SECRET_SE` — dumpas i steg 0)
+ `koncept.py sok` + kontot 7 dagar.

### 4. Ranka

```bash
python3 rank.py --in korningar/$DATUM/v3/kandidater-*.json --ut korningar/$DATUM/v3/batch.json --max 15
```

Tre hårda grindar (LIVE_VERIFIED · BE-CPA ≥ 190 · inte K0-dubblett), sedan profil per slot — aldrig en totalpoäng
som får döda en rad. Asymmetriska rader (en trea på någon axel) visas alltid. 5–8 exploitation, 2–4 exploration,
1–3 säsong. **Räcker det bara till 7: leverera 7.**

### 5–6. Batch → ark → sida

```bash
python3 v3_till_fynd.py --batch korningar/$DATUM/v3/batch.json      # → korningar/$DATUM/fynd.json + koncept-id per rad
python3 offert.py --fynd korningar/$DATUM/fynd.json                  # Axels mall, prisfälten tomma
python3 sida.py  --fynd korningar/$DATUM/fynd.json                   # kortet: bild, pris, arketyp, timing, säkerhet, frågan, kan gå för att, största risken
```

Publicera `korningar/$DATUM/sida.html` som artefakt med `capabilities: {downloads: true, db: {}}` mot
**samma URL varje dag**: https://claude.ai/code/artifact/1512b4cb-e82d-45fb-845d-dc4029616b17
Säger publiceringen att en nyare version finns: läs den, bygg om från dagens fynd.json, publicera igen.

### 7. Persistera och rapportera — sedan STOPP

1. `korningar/$DATUM/STATUS.md`: nya svar och varför-läsningen, Metas facit (nya band/klasser), hypoteser som
   ändrat status, säsongsfönstren som styrde, batchen per slot med rank-förklaring, strukna med orsak, parkerade.
2. En rad under **Egna anteckningar** i `LEARNING_STATE.md`:
   `- <datum>: svar <n> (ja/kanske/nej) · Meta: <nya domar> · hypoteser: <ändringar> · batch <n> (<exploit>/<explore>/<säsong>) · prediktion vs verklighet: <vad som lärdes> · i morgon: <vad som ändras i sökningen>`
3. Raden i `RUTIN-KVITTO.md`.
4. Commit + push: `korningar/$DATUM/`, `koncept.json`, `facit/`, `utfall.json`, `LEARNING_STATE.md`, `larande.json`,
   `hypoteser.json`, `feedback/`, `vikter.json`, `LARDOMAR.md`, `backlog.json`, `sedda.json`, `anvanda-sokord.json`, `objekt.json`.
   `cd /home/user/yognftnfgn && git add produktjakt .claude/commands/produktjakt.md && git commit -m "produktjakt <datum>: V3-batch N produkter" && git push -u origin claude/fortsatta-pa-denna-c28bmv`
5. Discord (`DISCORD_WEBHOOK_URL`, på engelska): antal, per slot, nya Meta-domar, länken.
6. **Sluta söka.** Batchen är levererad; nästa körning är i morgon.

## Definition of done

- [ ] 0A Axels nya svar inlästa, varje nej läst med orsakstyp i STATUS.md
- [ ] 0B Metas facit hämtat i dag (`facit/snapshots/<datum>.json` finns), `utfall.json` + `koncept.json` uppdaterade, nya kampanjer taggade
- [ ] 0C `LEARNING_STATE.md` omskriven i dag och läst; prediktion vs verklighet kommenterad; `hypoteser.json` uppdaterad om något ändrats
- [ ] 0D `SASONG.md` skriven i dag; bara NOW/LATE-fönster jagade
- [ ] Discovery gjord från ägare → objekt → friktion (inte slumpade sökord), ≥ 3 linser, 70/30
- [ ] Varje rad på arket är LIVE_VERIFIED i dag med UTC-stämpel, hero sedd
- [ ] Svenska golvet läst med URL per rad; premiumankare eller "ingen svensk aktör" med kollade källor
- [ ] Leverantörsmaterialet bedömt (materialklass) per rad
- [ ] Ekonomin som intervall ur verifierat pris; BE-CPA ≥ 190 på varje rad
- [ ] Batch 10–15 (eller färre med motivering), per slot enligt `rank.py`; ingen utfyllnad
- [ ] Ark byggt (prisfälten tomma) + sida publicerad mot samma URL med `downloads` + `db`; knapparna finns
- [ ] `koncept.json` bär varje rad med koncept-id, listning, verifiering, prediktion
- [ ] `LEARNING_STATE.md` egna-raden + STATUS.md + RUTIN-KVITTO.md skrivna; allt committat och pushat
- [ ] Discord-rapport skickad (eller "ingen webhook" skrivet)

## Svaret till Axel

Dyslexiformatet i `CLAUDE.md`: **Läget** med max tre rader, sen hur många saker han ska göra.
Normalfallet är en enda sak — öppna sidan, ladda ner arket och trycka Ja/Kanske/Nej. Skriv aldrig ut
sökord, filnamn, kommandon eller poäng till honom.

## Filerna

| Vad | Var |
|---|---|
| **Flödet V3 — vad som är kvar, vad som ersatts, steg för steg** | `produktjakt/V3-FLODE.md` |
| **Minnet: vinnarmönster, förlorarmönster, signaler, hypoteser, prediktion vs verklighet** | `produktjakt/LEARNING_STATE.md` (auto ur `larande.py`) + `larande.json` |
| Hypoteser och motbevisade antaganden | `produktjakt/hypoteser.json` |
| Metas facit — alla kampanjer, band, klasser, snapshots | `produktjakt/meta_facit.py` → `facit/kampanjer.json`, `facit/FACIT.md`, `facit/snapshots/` |
| Produkttaggar för kontots historia (arketyp, objekt, form …) | `produktjakt/facit/historik-taggar.json` |
| BE för kampanjer utan BE i namnet · launch → koncept | `facit/be-override.json`, `facit/launch-koppling.json`, `facit/koncept-fro.json` |
| Konceptregistret (K0001 …) | `produktjakt/koncept.py` → `koncept.json` |
| Säsongskalendern | `produktjakt/sasong.json`, `sasong.py` |
| Kandidatschemat och agentprotokollet | `produktjakt/V3-KANDIDATSCHEMA.md`, `V3-AGENTPROTOKOLL.md` |
| Rankningen | `produktjakt/rank.py` |
| Batch → gamla formatet | `produktjakt/v3_till_fynd.py` |
| Bakgrund: DOA v3.1, poängkortet, negativ rymd | `produktjakt/MASTERPROMPT.md` |
| Objektuniversumet | `produktjakt/objekt.json` |
| Faktapaketet om V1–V3 och backtesten | `produktjakt/vinnare/` |
| Axels signaler | `produktjakt/SIGNALER.md` |
| Feedback: samla / svar / vikter | `produktjakt/feedback.py` → `feedback/feedback.json`, `vikter.json`, `LARDOMAR.md` |
| Metas facit per launchad forskningsprodukt (bakåtkompatibelt) | `produktjakt/utfall.json` |
| AliExpress-klienten · hittaren · offertarket · sidan | `ali.py` · `hitta.py` · `offert.py` + `mall/` · `sida.py` + `sida-mall.html` |
| Körningarna · kvittot | `produktjakt/korningar/<datum>/` (V3-filer i `v3/`) · `RUTIN-KVITTO.md` |
| Temu-tidens gate-ordning och LIVE-regel (bakgrund) | `docs/temu-jakt-v2/REGEL.md` |
| Vinnar-DNA:t (bakgrund) | `docs/temu-vinnar-dna.md` |

## Bevisat i skarp körning

**2026-09-09** (V2 första dagen): kedjan sök → ark → sida → push fungerade; alla nio var verktyg ("slop"); DOA v3.1 byggdes.
**2026-09-11** (V3 byggd, manuell valideringskörning): Metas facit hämtade 84 kampanjer → 76 produkter (18 REAL WINNER,
21 REAL LOSER, 33 INSUFFICIENT, 4 UNTESTED); taköverdraget (refuterat av v24 08-09-08) och adventskalendern (killad av
STOPPORD) stod som REAL WINNERS — modellens två största fel blev V3:s första motbevisade antaganden.
