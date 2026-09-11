# Protokoll för discovery-agenter (V3) — läs hela innan du söker

Du arbetar i `/home/user/yognftnfgn/produktjakt` (gren `claude/fortsatta-pa-denna-c28bmv`). Du levererar
**kandidater i V3-KANDIDATSCHEMA.md** som en JSON-fil `korningar/<datum>/v3/kandidater-<din bokstav>.json`
(`{"agent": "...", "datum": "...", "kandidater": [...]}`), plus en kort STATUS-text i chatten.

## Läs först (i den här ordningen, allt ligger i mappen)
1. `LEARNING_STATE.md` — vad kontot belönar. Sök **strukturella kusiner** till REAL WINNERS, inte fler av samma.
2. `korningar/<datum>/SASONG.md` — fönstren NOW/EARLY/LATE i dag. Jaga aldrig gårdagens säsong.
3. `hypoteser.json` — exploration-kandidater ska peka på ett `hypotes_id`.
4. `objekt.json` — objektuniversumet (ägare, hot, skyddsform, ankarkällor, sökfraser). Nya objekt är välkomna: märk `"objekt": "NYTT: …"`.
5. `korningar/<datum>/v3/katalog-live.txt` — butikens katalog (K0: finns objekt + form redan? kolla på SAK, inte namn).
6. `koncept.py sok "<ord>"` — vad rutinen redan sett/levererat och vad Axel svarat. Ett koncept med status `nej`
   söks INTE igen om inte något i `aterupptas_om` ändrats (ny listning med bättre pris, ny säsong, nytt Meta-bevis).
7. `SIGNALER.md` §"sett innan" — standardutrustning som varje ägare redan har (ramper, kulskydd) är död.

## Discovery — så genereras kandidater (inte ur slumpade sökord)
Utgå från OWNER → OBJECT → PROBLEM/FAILURE MODE → vad blir irriterande de närmaste 2–16 veckorna → vilket dyrt objekt kan ett
billigt tillbehör skydda → vilken improvisation används i dag → vad finns utomlands men är inte kommoditiserat i Sverige →
vad har en ovanligt visuell demonstration. Abstrahera uppåt: två överdrag vann ⇒ leta *"formsydd form över dyrt objekt ute
inför ett datum"* på NYA objekt — inte tjugo överdrag.

## Verktygen (kör från `produktjakt/`)
- Sök AliExpress: `python3 ali.py "<engelsk fras>"` → titel, pris USD, länk, product_id. Vänta ≥ 1,5 s mellan sökningar. Formordet ska stå i frasen.
- Öppna produktsidan (LIVE-kontroll): `python3 ali.py <product_id>` → titel + heron (priset kommer bara från sökträffen).
- Ladda ner heron: `curl -sSL -A "Mozilla/5.0" -o korningar/<datum>/v3/bilder/<id>.jpg "<bild-url>"` och **titta på den med Read-verktyget** (det visar bilder). Bedöm: samma produkt som titeln, textfri?, i kontext?, ser den ut som sitt pris?
- Säsong för objektet: `python3 sasong.py --objekt "<objektrad>"`.
- Svenska golvet + ankaret: WebSearch/WebFetch mot pricerunner.se, prisjakt.nu, jula.se, biltema.se, clasohlson.se, rusta.com, bauhaus.se, fyndiq.se, cdon.se, amazon.se, vidaxl.se + fackhandel (getcamping.se, watski.se, hjertmans.se, granngarden.se, zoo.se, husqvarna.com, skogma.se, jaktia.se, lekia.se …). Skriv URL + pris + datum. Kolla **exakt samma form**, inte bara kategorin.
- Butikens katalog: `grep -i "<ord>" korningar/<datum>/v3/katalog-live.txt`.
- **Ingen Temu** (stryper till ~1 hämtning/timme). **Ingen bäverbutiken.se** (proxyn blockerar — katalogen står i filen).

## LIVE_VERIFIED — bara när ALLT detta gjorts i DENNA körning
produktsidan öppnad (`ali.py <id>` svarar med titel) · titeln är samma produkt som konceptet · heron nedladdad och sedd ·
pris i USD sett i sökträffen · varianter noterade ur titeln/sökträffen (en variant? universal? storlekar?) · tidsstämpel UTC.
Svarar produktsidan tomt: pröva en annan listning av samma koncept. Sätt aldrig LIVE_VERIFIED på en länk du inte öppnat —
märk `SOKTRAFF` eller `BLOCKED`. Blockerad ≠ död.

## Ekonomin
landad ≈ USD × 9,64 × 1,5 (frakt/avgifter; skriv intervall ±10 %). Pris: 0,4–0,85 × premiumankaret, avrundat till 9; saknas
ankare: landad × 2,4, minst 300. BE-CPA = pris − landad (utan moms). BE-ROAS = pris ÷ (pris − landad). Flerköp: finns fysiskt
skäl att köpa 2+? Returrisk: måste kunden mäta?

## Formtaket (Axels signal 2026-09-11: "för mycket överdrag")
Skyddsformer (överdrag, kapell, huv, skydd, tak, lock) får vara högst 40 % av dagens batch — `rank.py` lyfter ut resten.
Sök därför strukturer, inte former: **ordning/friktion på flera ägda saker** (spöklämman: kaos → ordning, flerköp),
**maskinen som gör jobbet** (bandslipen: ≥ 900 kr, ankare ≥ 2,4×, synlig payoff), **kroppsligt i säsongsjobbet**
(axelbältet, damaskerna), **synlig nyhet utan problem** (klistermärkena: noll friktion, < 300 kr, objekt alla har),
**djur/datum** (kojan, kalendern). En lins per struktur, aldrig fem linser på skydd.

## Vad du INTE gör
- Hittar på priser, ägarantal, ankare eller datum. Skriv "ej mätt".
- Levererar verktyg/prylar som läggs i förrådet efter jobbet (LEARNING_STATE: form=verktyg 1 vinnare / 2 förlorare / 7 för tidigt;
  Axels egna launcher Stegstödet & Solcellslarmet ligger under BE) — såvida det inte är en ren exploration med hypotes_id.
- Fyller ut. 4 bra slår 12 svaga. Leverera 3–7 kandidater som klarar grindarna, inte 12 som inte gör det.
- Rör Meta, Shopify, Notion eller Discord. Du skriver bara din JSON-fil och bilder.
