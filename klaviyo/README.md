# klaviyo/: Bäverbutikens och Matstrumpors e-postmarknadsföring (byggt 2026-09-24, Matstrumpor 2026-09-25)

Två butiker, två Klaviyo-konton, EN motor med `--brand <id>`: `baverbutiken` (`QZ4jLG`, standard)
och `matstrumpor` (`UV6Rqg`). Brandfilen `brands/<id>.json` bär allt som skiljer. Butiker blandas
aldrig: `kontrolleraKonto` stoppar en nyckel som hör till fel konto. Matstrumpors läge står i ett
eget avsnitt längre ner.

Axels beställning 2026-09-24: "Börja fixa email MARKETING på riktigt … köra claude
med klaviyo och börja köra massa kampanjer", kopplat till creative strategy och
Evolve-metoden. Bygget sker först med Claude, och utförandet flyttas till en VA
när rutinen fungerar (Arvids princip). Inga schemalagda rutiner byggs förrän Axel
säger till.

## Läget (2026-09-25 morgon, uppladdat till Klaviyo)

**Allt ligger i kontot `QZ4jLG` som utkast. Inget är schemalagt, inget är live, inget har skickats.**
Mätt med tillbakaläsning 2026-09-25: 14 kampanjer `Draft` utan `scheduled_at`, 6 flöden `draft`
med alla 14 flödesmejl `draft`, 30 mallar, 14 segment, listan `LISTA_nyhetsbrev`.
Id:n står i `konto/baverbutiken/uppladdat.jsonl`.

| Del | Status |
|---|---|
| Kampanjer K01–K14 (29 sep–1 dec) | ✅ Draft i Klaviyo. Ämnesrad B och C ska läggas in som A/B-test för hand. |
| Flöden | ✅ **13 st LIVE sedan 2026-09-25 ~10:40 CEST** (Axels ord: "Nu sätter vi igång alla fucking flows"), påslagna med `node klaviyo/sla-pa.mjs <namn …> --ja` och tillbakalästa (flöde + varje mejl `live`, logg i `konto/baverbutiken/pasatt.jsonl`): F01 Välkomst `XG6jqR`, F02 Övergiven kassa `Y9QRkG`, F03 Webbhistorik `YwY8V9`, F04 Efter köp `XciMkv` (Fulfilled Order, eget paket via `?k=`), F05 Vinback `Xzs4UW`, F06 Städning `Ruw7ru`, F07 Motorhölje → båtmotorskydd `Vx8qnh`, F08–F13 tips (bälteslip `RM28Ex`, taköverdrag `RGnSj9`, termoskydd `U3cy6R`, båtmotorskydd `SMasRB`, IBC `QU7iZJ`, sätesöverdrag `XZbAGg`). Mätt före påslagning: `SEG_samtycke` 6 202, `LISTA_nyhetsbrev` 2 591 och stilla i 10 min (importen fyller inte på välkomstlistan), `SEG_oengagerade_180d` 0. Leveranstiden är borttagen ur alla mejl (Axel 2026-09-25). Förhandsvisning: https://claude.ai/artifact/CMT1xEfoqLqm23AS6WxqAT **F14 Recension → Trustpilot `TaadnG` (v2, brandad: hero, kundens varor utan pris, stjärnor i svart panel, Axels rad) är ett UTKAST (draft)** sedan 2026-09-25 (v1 `UAKPrr` raderad): Fulfilled Order + 14 dagar, kundundantag, fem stjärnor som ALLA går till `se.trustpilot.com/evaluate/baverbutiken.se?stars=N` plus en rad om att svara på mejlet om något blev fel. Axels skiss skickade 1–3 stjärnor till Judge.me och 4–5 till Trustpilot; det är review gating, förbjudet enligt Trustpilots regler, och byggs aldrig (blocket `stjarnor` i `mallar.mjs` kan bara ha EN destination, testat). Trustpilot-adressen är inte verifierad. Slås bara på på Axels ord. |
| Segment | ✅ 14 st. `SEG_samtycke` 1 552 profiler, `SEG_uppvarmning_steg1` 216 (mätt 2026-09-25, synken pågår troligen, se EPOST-STRATEGI §4). |
| Motorn | ✅ Körd mot riktiga kontot. Tre gissningar rättade: `Items` (inte `ItemNames`) på Placed Order, `Name` (inte `ProductName`) på Ordered Product, väntan när Klaviyo bearbetar 5 segment. 96 tester gröna. Se ARKITEKTUR → "mätt 2026-09-25". |
| Kontot | ✅ Postadress och avsändare sparade 2026-09-25 (mätt i API:t: Sjöhed 160, Harestad, 44274, Sweden). Gatan står med liten bokstav och regionen som "Harestad" — Axel rättar. `template-render` fyller inte `organization.full_address`, så sidfoten går inte att mäta den vägen. |
| Innehåll | 14 kampanjer och 7 flöden. Copyn skrevs av Sonnet enligt `docs/copy-regler.md`. |
| Strategi | `docs/os/EPOST-STRATEGI.md` |
| VA-SOP:er | `klaviyo/sop/` (engelska, E00–E07) |
| Kommandot | `/klaviyo kolla|bygg|ladda-upp|rapport|cs` (`.claude/commands/klaviyo.md`) |
| Evolve | `klaviyo/evolve/`: botens svar, flödesresearchen, återköpsanalysen |
| Sista stegen | `klaviyo/SISTA-STEGEN.md`: Cowork-prompten och sessionsprompten |
| Kampanjschemat | `innehall/baverbutiken/KALENDER-2026.md` (K01–K22, 29/9–29/12, en tisdag i veckan + högtider). Sida: https://claude.ai/artifact/SYZSwihWS9g9LNTi2wqqMD |

## Så körs det

```bash
node klaviyo/kolla.mjs [--brand matstrumpor] [--profiler]   # nyckel, konto, metriker (+ samtycket) → konto/<brand>/lage.json
node klaviyo/kolla.mjs --prov       # första gången: mäter det obekräftade i ARKITEKTUR
node klaviyo/bygg.mjs [--brand …]   # innehåll + Shopify → output/<brand>/ (+ galleri index.html)
node klaviyo/gallerier.mjs --brand … [--lankar <fil.json>]   # de tre gallerierna + index.html med bilderna inbäddade (kräver nät första gången)
node klaviyo/schema-sida.mjs --brand matstrumpor --villkor <fil.json>   # schemasidan → output/<brand>/schema.html
node klaviyo/ladda-upp.mjs [--brand …]          # torrt: planen och exakta request-kroppar
node klaviyo/ladda-upp.mjs --brand … --skarpt   # skapar segment, mallar, kampanjer och flöden, ALLT som utkast
node klaviyo/ladda-upp.mjs --brand … --skarpt --uppdatera   # patchar mallar + Draft-kampanjer som finns (flöden skapas bara nya: byt version i namnet)
node klaviyo/stada.mjs --brand … [--ja]         # tar bort motorns ersatta utkast (äldre versioner av draft-flöden och mallar)
node klaviyo/klubb-sajt.mjs --brand … [--skarpt]   # butikens anmälningsruta → klubben (temat, tillbakaläst, publika sidan kollad)
node klaviyo/sla-pa.mjs --brand … <flöde …> [--ja]      # bara på Axels ord
node klaviyo/schemalagg.mjs --brand … K01 [--ja]        # bara på Axels ord
node klaviyo/rapport.mjs [--brand …]            # resultat → logg/<brand>/utfall.jsonl
node --test klaviyo/test/*.test.mjs             # 137 tester
```

## Det motorn aldrig gör

- **Skickar kampanjer på eget initiativ.** Klienten vägrar varje anrop till `/api/campaign-send-jobs` utom från `schemalagg.mjs` (`node klaviyo/schemalagg.mjs K01 --ja`), som bara tar namngivna kampanjer som är Draft, har ett fast datum minst en timme fram och bara går till segment med samtycke (testat). K01 schemalagd 2026-09-25 på Axels ord: tis 29/9 18:00, 1 884 profiler. Flöden sätts bara live av `sla-pa.mjs`, med `--ja`, för exakt de flödes- och mejl-id:n den läst ur kontot — klienten släpper inget annat (`tillatLive`, testat).
- **Mejlar utan samtycke.** Varje kampanjsegment måste ha `subscription: "subscribed"`, annars stoppas det.
- **Tar en annan butiks konto.** `public_api_key` måste vara `QZ4jLG` innan något skrivs.

## Filerna

Se `ARKITEKTUR.md` (kontraktet), `innehall/baverbutiken/BRIEFER.md` (strategin per
mejl) och `logg/baverbutiken/kampanjlogg.md` (hypotes → utfall → lärdom).

## Matstrumpor (kontot `UV6Rqg`, byggt och uppladdat 2026-09-25)

**Allt ligger i kontot `UV6Rqg` som utkast. Inget är påslaget, inget schemalagt, inget skickat**
(Axels villkor 2026-09-25: postadress, plan, kundundantag, subscribed och ett renderat testmejl
måste alla vara gröna först; postadressen saknas och planen går inte att läsa via API:t, se
`SISTA-STEGEN.md` → Matstrumpor). Mätt med tillbakaläsning 2026-09-25 ~13:15 CEST:

| Del | Status |
|---|---|
| Kontot | `UV6Rqg` (sajten laddar `klaviyo.js?company_id=UV6Rqg`), Europe/Stockholm, SEK. 4 357 profiler, **2 890 subscribed**, 81 unsubscribed, 1 386 aldrig. Shopify-synken klar (Shopify: 2 892 av 4 362). ❌ **Postadress saknas** (landet står "United States"), avsändarmejl tomt. Planen syns inte via API:t. |
| Kampanjer K01–K14 (29 sep–29 dec) | ✅ 14 st `Draft`, `send_strategy static`, `scheduled_at` tomt. Id:n i `konto/matstrumpor/uppladdat.jsonl`. Schemat: `innehall/matstrumpor/KALENDER-2026.md`, sidan https://claude.ai/artifact/Ljyv3Ye89ipdPNCZbNKKLh. Ämnesrad B och C läggs in som A/B-test för hand. |
| Flöden | ✅ 7 st **v2** `draft` (tillbakalästa med `kolla.mjs` 2026-09-25 ~16:40 CEST): F01 Välkomst `TCpJ4W` (listan Email List, E1 = klubbvälkomsten), F02 Övergiven kassa `YdpPgY` (Checkout Started), F03 Webbhistorik `TEZYfP` (Viewed Product `R9yPAm`), F04 Efter köp `R6ixrV` (Fulfilled Order, egen spårningslänk `?k=`, kundundantag), F05 Vinback `WFsWR3` (Placed Order + 90 d, kundundantag), F06 Sunset `Vbx6zB` (SEG_oengagerade_180d, klubbton), F07 Återköp sushi `XgsZj9` (Placed Order med `Items` ∋ "Sushi-Strumpor", 21 d, kundundantag). **v1-utkasten (`SVdssi`, `S8VT8T`, `YAZ8cN`, `VtTT7F`, `U9exx3`, `R29irU`, `V4KBnH`) raderade med `stada.mjs --ja`** samma eftermiddag: flödesmallar kopieras in i flödet, så fonten krävde nya flöden. Inga tipsflöden: inget produktpar har stöd i datan. |
| Segment | ✅ 14 st: `SEG_samtycke` **2 890**, `SEG_uppvarmning_steg1` 175, `SEG_engagerade_60d` 175, `_90d` 176, `SEG_kopare` 2 596, `SEG_kopare_30d` 175, `SEG_flerkopare` 112, `SEG_ej_kopt` 294, `SEG_vinback_90d` 2 420, `SEG_oengagerade_180d` 0, kategorierna sushi 2 583 / donut 81 / pizza 10 / hamburgare 5 (mätt direkt efter skapandet). |
| Mallar | ✅ 29: 26 `TPL_*_v1` patchade med fonten (`--uppdatera`, 2026-09-25 eftermiddag) + 3 `_v2` med ny copy (`TPL_f01-valkomst-e1_v2` `Vjf7aL`, `TPL_f06-sunset-e1_v2` `Xn9ZKM`, `TPL_f06-sunset-e2_v2` `W87Uwx`; deras v1 raderade). Kampanjernas 14 meddelanden fick mallarna tilldelade på nytt i samma körning (68 uppdateringar, 0 stopp). K01 renderad via `template-render` på förmiddagen: förnamnet in, avregistreringslänk med, inget mallspråk kvar, adressraden tom (kontot saknar adress). |
| Gallerierna (Axels beställning 2026-09-25: "massa gallerier … jävligt nice") | **Kampanjerna** https://claude.ai/artifact/VdYq8VLTHqPW4kQm4gMKw1 · **Flödena** https://claude.ai/artifact/WLQKsyRR8soHCDusP8jtYx · **Mallarna** https://claude.ai/artifact/1KEuzFEai52gahdbpvGShN · **Schemat** https://claude.ai/artifact/Ljyv3Ye89ipdPNCZbNKKLh · **Galleriet ur `bygg.mjs`** https://claude.ai/artifact/MYCFYWgVAcwugj1tPFrmgR. Byggs av `node klaviyo/gallerier.mjs --brand matstrumpor --lankar <fil>` (telefonram per mejl, butikens font Mochiy Pop P One på rubrikerna + Atkinson Hyperlegible, Matstrumpors orange) och `schema-sida.mjs`; publiceras om på SAMMA länkar (`url`) vid varje ombygge — senast 2026-09-25 ~16:35 CEST med fonten och klubben (kampanjer/flöden/mallar version 4, galleriet version 3, schemat version 2). ⚠️ **Bilderna bäddas in** (`bilder.mjs`, sedan 2026-09-25 eftermiddag): artifact-visaren blockerar bilder från Shopifys CDN och butikens domän, så första versionen visade trasiga bilder i varje telefonram (Axel: "WHATAHELL … fixa alla direkt"). Varje bild hämtas en gång (cache `output/<brand>/bilder/`), ligger EN gång per sida som data-URI i ett JSON-block och sätts in i ramarna vid laddning; sidorna väger 0,7–1,9 MB i stället för 2–12 MB. |
| Innehåll | `innehall/matstrumpor/` — briefer (`BRIEFER.md`), 14 kampanjer, 7 flöden. Copyn skrevs av fyra Sonnet-subagenter mot `docs/copy-regler.md`; huvudsessionen skrev om K06:s ämnesrad B och förhandstext (tillverkad osäkerhet, fel ordning på "slut") och F05 E2:s ämnesrad B (ej falsifierbar). |
| Fonten (Axel 2026-09-25 eftermiddag: "Du har ju inte ens applyat våran font som är Mochiy Pop P One") | ✅ **Mochiy Pop P One** i alla 29 mallar och i gallerierna: `mejl/butiker/matstrumpor.json` → `font_webb` (temats font på både rubriker och brödtext, mätt live), `mallar.mjs webbfont()` laddar den från Google Fonts (`<link>` + `@import` i huvudet) och sätter den först på rubriker, brödtext och knappar; sidfotens finstilta rader är Arial. Fonten har en vikt, så rubrikerna får ingen syntetisk fetstil (`fet: false`). Gmail och Outlook laddar inga webbfonter och visar Trebuchet MS/Arial — Apple Mail, iOS Mail och gallerierna visar fonten. Fraktmejlen (`mejl/`) och spårningssidan är orörda. |
| Klubben (Axel 2026-09-25 eftermiddag: "det måste vara som ett medlemskap att vara med i Matstrumpors klubb") | ✅ **Matstrumpor-klubben** (namnet är sessionens val, `brands/matstrumpor.json` → `klubb`): raden "Matstrumpor-klubben" under loggan i varje mejl, sidfoten "Du får det här för att du själv anmälde dig till Matstrumpor-klubben.", F01 E1 v2 = klubbvälkomsten (hero "Välkommen till Matstrumpor-klubben", punkter "Det här får du som medlem": sista beställningsdag inför fars dag och jul, kundernas riktiga recensioner, vad som ligger i lådan, Black Week-mejlet), F06 v2 frågar om medlemmen vill vara kvar i klubben. Inga medlemsrabatter, koder eller poäng lovas — de finns inte. **Sajten:** `klubb-sajt.mjs --skarpt` bytte anmälningsrutan i sidfoten på matstrumpor.se ("Missa inga nyheter" → "Gå med i Matstrumpor-klubben", "Prenumerera" → "Gå med", bekräftelsen "Tack för att du prenumererar" → "Välkommen till Matstrumpor-klubben") i det publicerade temat "Matstrumpor CRO + storleksrad 2026-09-17" via `themeFilesUpsert`, läst tillbaka och sett på den publika sidan 16:35 CEST (`konto/matstrumpor/klubb-sajt.jsonl`). Copyn av en Sonnet-subagent mot copy-reglerna; huvudsessionen strök "Enkelt som så: du står på vår mejllista, inget mer". |
| Data | `evolve/ATERKOP-ANALYS-matstrumpor.md` (hela orderhistoriken: julprodukt, 1,2 % återköp, samma sushi igen, leverans p90 15 dygn) |
| Black Week | ✅ Tre schemalagda automatiska rabatter i Matstrumpors Shopify, exakt Bäverbutikens: `DiscountAutomaticNode` 1840765501779 (10 % vid 1 vara), 1840765534547 (20 % vid 2), 1840765567315 (30 % vid 3+), 2026-11-22T23:00Z–2026-11-30T23:00Z, kombineras bara med fraktrabatter. ⚠️ Matstrumpors vanliga erbjudande "Köp 1, få 1" är RABATTKODER (`SUSHI-K1F1` m.fl., 135 av 227 ordrar), och en kod som inte får kombineras med en automatisk rabatt stoppas i kassan under Black Week. Axels beslut: låt vara (trappan ersätter koderna den veckan) eller tillåt kombination (Shopify admin → Rabatter → varje Black Week-rabatt → Kombinationer → Produktrabatter). |
| Kvar | Cowork-prompten i `SISTA-STEGEN.md` (postadress, attribution, plan, testmejl), DNS separat (aldrig namnservrar), sedan sessionsprompten som slår på flödena och schemalägger K01. |

## Lärdomar 2026-09-25 (Matstrumpor)

- **`lage.json`:s `senast` är rutinens kontrolltid, inte skanningens.** 60 av 71 levererade paket stod på 2026-09-21 (första körningen); räknat på det blev p90 25,6 dygn. Rätt källa är Shopifys `fulfillments.deliveredAt`, som spårningsrutinen skriver ur skanningen: p90 14,9 ⇒ 15.
- **`event.Price` på Viewed Product är text med valuta** i båda kontona ("1,129 kr", "299 kr"). `floatformat` gav tomt. Rättat i `mallar.mjs`; Bäverbutikens live F03 bär den gamla mallen och behöver en ny version.
- **En artifact kan inte visa bilder från nätet.** Visaren har en CSP som bara släpper `data:`-URI:er och sidans egna filer, och en `srcdoc`-iframe ärver den — alltså är varje mejlbild i ett galleri trasig tills den bäddas in. Att bädda in statiskt i varje ram mättes till 2–12 MB per sida; ett exemplar per sida (`bilder.mjs`) ger cirka 1 MB. Gäller alla sidor som publiceras som artifacts, inte bara Klaviyo.
- **Judge.me utan API-nyckel:** widgetens publika JSON (`reviews_for_widget`) ger produktsidans recensioner per Shopify-id. Brandfilen väljer källa (`recensioner.kalla`).
- **Reservfilen `mejl/produkter.json` är Bäverbutikens.** Utan den spärren hade Matstrumpors mejl byggts med Bäverbutikens produkter när Shopify inte svarade. Nu bara för det brand som har en reserv.
- **Bäverbutikens kategoriord hade gett fyra tomma segment** i Matstrumpors konto. Kategorierna kommer nu ur brandfilen.
- **Shopify-synkens lista heter "Email List"** i det nya kontot (2 891 profiler); brandfilen pekar dit så ingen tom `LISTA_nyhetsbrev` skapas.
- **`additional-fields[list]=profile_count` ger 400 på listningen** — bara per lista.
- **En ändrad mall når aldrig ett befintligt flöde.** Klaviyo kopierar mallen in i flödet när det skapas, så fonten (och all annan mallförändring) kräver ett nytt flöde: byt version i flödets namn (`_v2`), ladda upp, och ta bort det gamla utkastet med `stada.mjs --ja` — annars ligger två likadana utkast bredvid varandra och det gamla ser ut att kunna slås på. Kampanjer klarar sig med `--uppdatera` (mallen tilldelas meddelandet på nytt).
- **Webbfont i mejl = `<link>` + `@import` i huvudet, och fonten först i varje font-family.** Klienter som laddar webbfonter (Apple Mail, iOS Mail, Samsung Mail, artifact-visaren) visar den; Gmail och Outlook faller tyst tillbaka på reservstacken. Skriv aldrig `font-weight: bold` på en font som bara har en vikt — då syntetiserar klienten fetstilen och det blir smetigt.
- **Shopifys tema-JSON börjar med en `/* … */`-kommentar** ("auto-generated") och är inte ren JSON. Byt värden som strängbyten i råtexten och läs tillbaka värdena, inte hela filen (Shopify skriver om kommentaren). Sidfotens nyhetsbrevsrubrik ligger i `sections/footer-group.json` (`sections.footer.settings.newsletter_heading`), knappen och bekräftelsen i `locales/sv.json` (`newsletter.button_label`, `newsletter.success`) — Dawn 15.4.1, mätt 2026-09-25.

## Lärdomar 2026-09-25 (Bäverbutiken)

- **Ändrad text i ett uppladdat mejl kräver `version` i mejlet.** Mallnamnet är `TPL_<id>_v<version>`, och med samma version återanvänder motorn den gamla mallen. Tre nya flöden fick den gamla texten innan det här upptäcktes. Nu bär manifestet `version`.
- **Klaviyos mallspråk saknar sha256** (mätt: `sha256`, `hash_sha256`, `hash`, `md5` ger renderfel, `base64_encode` och `urlencode` fungerar). Bävernumret kan därför inte räknas i Klaviyo. Länken `sparning:` skickar fraktbolagets nummer base64-kodat som `?k=`, och spårningssidan byter det mot bävernumret i adressen.
- **Spårningsnumret finns bara i Fulfilled Order** (`event.extra.fulfillments.0.tracking_number`), inte i Placed Order. Därför triggas F04 och tipsflödena av Fulfilled Order.
- **Klaviyos API kan inte skriva kontouppgifter** (`PATCH /api/accounts` → 404) och inte ändra ett flödes definition. Adressen är Axels klick, och ändrade flöden blir nya versioner.
- **Ett flödesmejl går inte att ändra på plats** (`PATCH /api/templates/<flödets kopia>` → 404) och **flow-actions kräver hela `definition`** för att byta status. Ändrad text i ett flöde = ny `version` på mejlet, nya mallar, radera flödesutkastet och skapa om det (så gjordes 2026-09-25 när leveranstiden togs bort).
