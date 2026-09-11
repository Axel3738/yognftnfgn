# OPS-PROCESSEN — så byggs en butik, brick by brick

**Kadensen** (Axels upplägg 2026-09-07): Axel väljer vinnarprodukter och
skickar produktgrupper ~2 gånger i veckan — ibland noll, ibland flera.
VA:n har **3 dagar per grupp** att launcha alla gruppens butiker; varje
produkt (eller nischgrupp av produkter) = en egen butik = en `/ny-ops`-körning
+ en checklista.

**Ordningen** (Axels beslut 2026-09-08, omordnad 2026-09-10): butik + app +
koppling FÖRST (checklistans avsnitt 1–3), sen startar `/ny-ops` och bygger
FÄRDIGT hela butiken. Domänen köps när Claude levererat namnet (avsnitt 6).
Skälet till varje position står i `VA-CHECKLIST.md` — ändra inte ordningen
utan att flytta skälet med den.

**Dokumenten hänger ihop så här:**

| Dokument | Roll |
|---|---|
| `factory/SA-FUNKAR-DET.md` | Kartan: hela flödet enkelt förklarat, vem som gör vad. Läs den först. |
| `factory/KEDJAN.md` | Kontraktet: modulägare, exporter, körordning. Koden följer den. |
| `factory/PROCESS.md` (detta) | Rutinen i prosa: faserna, besluten, reglerna som bevisats. |
| `.claude/commands/ny-ops.md` | Körordningen för den som kör (VA:n). |
| `factory/README.md` | Modulerna och hur de körs. |
| `factory/VA-CHECKLIST.md` → `output/<butik>/CHECKLISTA.md` | De manuella klicken, ifyllda per butik. Ordningen är ett kontrakt. |
| `factory/FAS2.md` + `/ny-annonser` | Annonsfasen efter bygget. |

⚙️ = fabriken/Claude gör det · 🖐 = en människas klick (VA:n eller Axel).
**Kedjan bokför varje 🖐 som "väntar på en människa" — aldrig som gjort.**

---

## Kedjan — körordningen som kod

Hela bygget är EN körning av `factory/ops.mjs` (Node ≥20, noll beroenden).
Stegen nedan är `STEG`-listan i `ops.mjs`, och den är exakt KEDJAN.md:s
tabell. Nivå `butik` körs en gång per butik, nivå `produkt` en gång per
produktfil. State per nivå i `factory/state/<butik>--_butik.json` och
`<butik>--<produkt>.json` (aldrig hemligheter).

```bash
node factory/ops.mjs factory/butiker/<butik>.yaml factory/produkter/<p1>.yaml [<p2>.yaml …] \
     [--dry-run] [--resume] [--igen <steg[,steg]>] [--launch] [--store-ready]
```

| # | steg | nivå | modul | vid hinder |
|---|---|---|---|---|
| 0 | `anslutning` | butik | `token.mjs` → "Connected: <domän> ✓" | stoppar (fel butik, gammal state, förbjuden domän). Hoppas aldrig över, inte ens med `--resume`. |
| 1 | `tema-upload` | butik | `tema-upload.mjs` → `arbetstemaId` i state | stoppar |
| 2 | `brand` | butik | `branding.mjs` + `tema.rensaSettings` (+ `settings_schema` med A/B-gruppen, skrivs först i eget anrop) | stoppar |
| 3 | `tema` | butik | `tema.mjs`: opf-sektioner, fabriksägda filer (`assets/ms-paket.js` m.fl.), produktmall, header-group, korg-upsell, gallerifilter | stoppar |
| 4 | `avbrandning` | butik | `avbranda.mjs` (källsektioner + text bort, skannar om) | stoppar |
| 5 | `logga` | butik | `logga.mjs` (`branding.logga` eller `output/<butik>/logga.png`) | manuell |
| 6 | `produkt` | produkt | `build-store.mjs` + `shopify.skapaProdukt` (idempotent på handle, ny = ACTIVE, befintlig behåller status) + `publiceraIButiken` | stoppar |
| 7 | `metafalt` | produkt | `metafalt.mjs` | stoppar |
| 8 | `lagerpolicy` | produkt | `lagerpolicy.mjs` (CONTINUE + tracked false, tillbakaläst) | stoppar |
| 9 | `bonus` | produkt | `bonus.mjs` (bara om `offer.bonus_produkt.handle`) | manuell "välj bonusprodukt" |
| 10 | `paket` | produkt | `paket.mjs` (valutaspärr mot `shop.currencyCode`) | manuell "byt valuta i admin, kör `--igen paket`" |
| 11 | `kollektion` | butik | `shopify.skrivKollektion` (bara flerprodukt) | stoppar |
| 12 | `startsida` | butik | `startsida.mjs` + `filer.mjs` (hero/trygghet/galleri upp i Files först) + sidfotens bolagsblock | stoppar |
| 13 | `sidor`, `policyer`, `meny`, `frakt`, `huvudmarknad` | butik | `policyer.mjs` (inkl. EU:s ångerknapp i returpolicyn), `shopify.skrivPolicy`, `meny.mjs` (Hem / [kollektion] / produkter / Frakt & retur / Kontakt) + sidfotsraden **Ångra köp** → `angerknappUrl()`, `frakt.mjs` (saknade zoner SKAPAS med länder, trialens zoner rivs — 2026-09-10), valutakontroll | stoppar (policyer utan scope `write_legal_policies` → manuell) |
| 14 | `kallskanning` | butik | `kallskanning-kor.mjs` + `kallskanning.mjs` på ALLA temafiler | stoppar — en träff = spärr |
| 15 | `recensioner` | produkt | `judgeme.mjs`: app-CSV med originaldatum alltid; API-import via `tools/judgeme-import.mjs` bara om butikens token finns i env | manuell (VA:n laddar upp filen i appen) |
| 16 | `marknad` | butik | `marknad.mjs`: marknad + locale + webPresence per rad i `butik.marknader` | stoppar (tom `butik.marknader` = stopp) |
| 17 | `oversatt` | butik | `oversattning.byggUnderlag` → saknas `oversattning-<locale>.json`: manuell "översätt med subagent"; finns: `marknad.oversattAllt` + `oversattning-granska` | manuell (läckor = manuellt tills filen täcker allt) |
| 18 | `qa` | produkt + butik | `kontroll.mjs` + `kundvy-kor.mjs`/`kundvy.mjs` (RIKTIG HTML) + `trippelkoll.mjs` | rött = inte klart; körs alltid färskt, aldrig ur state |
| 19 | `checklista` | butik | `checklista.mjs` → `output/<butik>/CHECKLISTA.md` (EN fil per butik) | — |
| 20 | `slutrapport` | butik | `state.byggSlutrapport`: **Gjort av mig / Väntar på en människa** | — |

Steg 18–20 ligger inte i `STEG` utan körs av huvudflödet efter loopen, alltid
färskt — QA får aldrig bli "grön i state" (det var DryTrek-felet 2026-09-09).

**Flaggorna:** `--dry-run` beskriver varje steg utan nätverk (kör ändå
anslutningens spärrar torrt) · `--resume` hoppar över gröna steg · `--igen
<steg>` kör om exakt det steget och hoppar över övriga gröna · `--launch`
sätter produkterna ACTIVE + publicerade, vägrar om NÅGON produkt eller butiken
är röd i QA, och skriver ut vilket tema VA:n ska publicera · `--store-ready`
kör slutsteget (`store-ready.mjs`).

**Fristående kommandon för samma steg** (samma kod, för omkörning utanför
kedjan): `token.mjs --butik <id>`, `tema-upload.mjs`, `avbranda.mjs <butik-id>`,
`logga.mjs`, `lagerpolicy.mjs <handle>`, `bonus.mjs`, `paket.mjs`,
`kallskanning.mjs <butik-id>`, `marknad.mjs <butik-id>`, `oversattning.mjs`,
`oversattning-granska.mjs <locale>`, `kundvy-kor.mjs <butik-id> <produkt-id>`,
`trippelkoll.mjs <butik-id> <produkt-id>`, `store-ready.mjs <butik-id>`.
Hela listan i `factory/README.md`.

---

## Fas 1 — Grunden (sessionen, före kedjan)

1. ⚙️ **Anslutningen först — kommandots FÖRSTA handling.** `node factory/ops.mjs …`
   steg 0 (eller `node factory/token.mjs --butik <id>`): token mintas ur butikens
   EGEN app (`SHOPIFY_SHOP` + `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET` i
   miljön, VA:ns steg 2), spärrarna körs, "Connected: <domän> ✓" skrivs i chatten.
   Tre spärrar i `token.mjs`: förbjudna domäner (HeimGuard `pzjagy-mz`,
   Bäverbutikens fyra butiker), state-fil för ANNAN butik på samma domän, och
   butiksnamnet ur Shopify = ett brand som redan finns i `butiker/` eller
   `output/` för en annan butik. Tokenen skrivs i `factory/.env` som
   `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_ADMIN_TOKEN` + `SHOPIFY_ADMIN_TOKEN_<BUTIK>`
   (+ utgångstid och domän per butik) så gamla butiker förblir nåbara.
   **Fjärde spärren (2026-09-10): appens scopes.** `token.mjs` läser
   `currentAppInstallation.accessScopes` i samma anrop som `shop` och jämför
   mot `KRAVDA_SCOPES` (16 st). Saknas något stoppar steg 0 med "Connected ✓
   … men appen har N av 16 scopes" och raden att klistra in under Access
   scopes på dev.shopify.com. *(TackleBay 2026-09-10: rätt butik, rätt
   nycklar, token mintad — och NOLL scopes. Inte ens produkter gick att läsa,
   och felet var en rå `read_themes`-text. Checklistans avsnitt 3 bär nu
   scope-raden som ett eget klick.)*
2. ⚙️ **Hämta produktdata** från källan (Bäverbutik-sidan): `/products/<handle>.json`
   + Judge.me `reviews_for_widget` (originaldatum i `reviews[].created_at`).
   Källans Kaching-paketnivåer ligger som JSON i sidans HTML
   (`<script class="kaching-bundles-deal-block-settings">`: `dealBars[]` +
   `preselectedDealBarId`) — sparas som `output/<id>/kalla-kaching-paket.json`.
   **Läs produktbilderna innan copyn skrivs** — bilderna kommer från
   leverantören, texten kan vara skriven av någon som aldrig sett produkten.
   Aldrig påhittade specs, aldrig påhittade recensioner.
3. ⚙️ **Brand-steget**: köpare/emotion → `branding:`-block i butiksfilen.
   Brandingen byggs från noll per butik — strukturen återanvänds, brandingen
   aldrig. Namnregeln: helst ett HELT engelskt namn som svenskar och norrmän
   kan läsa och uttala, aldrig å/ä/ö; domänen kollas med RDAP innan namnet
   spikas. Tre loggvarianter (`logga-generera.mjs`, sharp) visas i chatten,
   Axel väljer. Namnet + domänen skickas till VA:n direkt (hennes steg 4–5).
4. ⚙️ **Konfig**: `butiker/<id>.yaml` + `produkter/<id>.yaml` ur mallarna,
   `--dry-run`. Flera produkter i samma nisch = flera produktfiler, en butik.

## Fas 2 — Shopify (kedjans steg 1–14)

5. ⚙️ CRO-temat ur `factory/tema/ops-tema.zip` (matstrumpor-cro-v5, incheckad
   2026-09-08) → staged upload som `FILE` → `themeCreate` som UNPUBLISHED med
   namnet `<Brand> – CRO v1`; id:t låses i state. Temat är strukturen —
   brandingen genereras alltid om (steg 2), källbutiken tvättas bort (steg 4)
   och skanningen (steg 14) är en spärr.
6. ⚙️ Produkten som **ACTIVE** med `inventoryPolicy: CONTINUE` +
   `inventoryItem.tracked: false` (Axels regel 2026-09-09) → metafält →
   opf-sektioner i produktmallen → startsida ur `butik.startsida` → menyer →
   policysidor (adress från allabolag.se) → fraktzoner. Trial-lösenordet
   skyddar butiken under bygget.
7. ⚙️ Paketen (steg 9–10): metaobjekt `ms_paketniva` (translatable PÅ från
   start) + riktiga rabattkoder som ger exakt paketpriset, ur `offer.paket` i
   produktfilen. A = källans Kaching-nivåer, B = testoffer, A/B via temats
   ms-ab. **Förvald nivå är ALLTID mitten** (⌈n/2⌉), aldrig första (Axel
   2026-09-07). Q4-ramverket (standard för VARJE OPS, Axel 2026-09-07): en
   billig komplementprodukt som (a) GRATIS bonus i paketnivåerna — antalet
   följer paketantalet, 2-pack ⇒ 2 gratis (Axel 2026-09-08) — och (b) betald
   upsell i varukorgen (`tema.byggKorgUpsell`). Nivå 1 får en betald
   tilläggs-kryssruta till FULLPRIS (`tema.byggTillagg`), aldrig rabatterad.
   Fältet: `offer.bonus_produkt`; `bonus.mjs` skriver id:n tillbaka i filen.
8. ⚙️ Bilder: inbränd engelska bort. kie.ai klarar INTE svensk text — metoden
   är kie RENSAR text → `bildtext.mjs` (sharp) lägger vektortext. Gif =
   redigerarjobb.
9. 🖐 **Butiken skapas av VA:n** från jobb-Gmailen (ny FREE TRIAL per butik —
   ingen plan, inget kort; staff-inbjudningar kräver betald plan). Claude
   kopplas via butikens EGEN app (custom distribution låses till EN butik
   utanför Plus, mätt 2026-09-08); nycklarna läggs i miljön, aldrig i chatten.
   Valuta, primärmarknad och primärspråk är ett mänskligt klick (avsnitt 2) — ingen
   av de tre går via API — och de kontrolleras FÖRE bygget, inte efter: bygget
   skriver priser, paket och rabattkoder i butikens valuta.
   Efter bygget, i den ordningen: tema publicerat + butiksnamn (avsnitt 5),
   domän + avsändarmejl (6), recensioner (7), ångerknappen (8), Meta (9),
   Meta-sidan OCH Discord-servern (9, ett besök — båda skapas av en
   människa och färdigställs av fabriken), "Store ready" (10), spårningen
   (11), testet bakom butikslösenordet (12). Allt det görs på free trial.
   **Ägarbytet är avsnitt 13 och delar listan i två** (Axels regel
   2026-09-10): Shopify Payments + Klarna (14) är ägarens bank och identitet,
   och butikslösenordet går inte att ta bort förrän ägaren valt plan (15).
   Därför testas kassan först i 15 — testet i 12 påstår aldrig att den är
   kontrollerad.

## Fas 3 — Recensioner (kedjans steg 15)

10. 🖐 VA:n installerar Judge.me, sätter språk och stjärnfärg **#00B77F**
    (`STJARNFARG` i `branding.mjs`; Judge.mes settings-API är läs-bart).
11. ⚙️ Fabriken skriver `output/<produkt>/judgeme-app-import.csv` i Judge.mes
    eget mallformat (dd/mm/yyyy, product_id + handle) — originalet + en
    översatt delmängd per marknad med lokala namn i EN fil — och 🖐 VA:n laddar
    upp den: Settings → Import reviews → Import from apps → Judge.me format.
    **Originaldatumen följer bara med appens import** — v1-API:t sätter alltid
    importögonblicket (`created_at` ignoreras på POST och PUT, mätt 2026-09-08
    på TankGuard). API-vägen (`tools/judgeme-import.mjs`) körs därför bara när
    butikens token finns i env (`butik.judgeme.token_env`); den varnar för
    rader utan datum och stoppar bara med `--krav-datum`. Judge.mes
    auto-översättning är paid och köps aldrig (Axel 2026-09-07).
    Widgeten i temats **Appyta** (ms-app-slot), stylas ALDRIG från temat.

## Fas 4 — Marknader (kedjans steg 16–17)

12. ⚙️ **SE huvudspråk + marknad Norge locale nb är STANDARD i varje OPS**
    (Axel 2026-09-08). `butik.marknader` i butiksfilen styr; `marknad.mjs`
    skapar marknad + locale (publicerad) + nb som alternateLocale på
    huvuddomänens webPresence. Lokal valuta (NOK) slås på i admin — ett
    mänskligt klick (checklistans avsnitt 5).
13. ⚙️ Översättningen: `oversattning.mjs` skriver `output/<butik>/oversattning-sv.json`
    (alla kundsynliga strängar, nycklade på produkthandle), en **subagent
    (sonnet)** översätter till `oversattning-<locale>.json` med samma nycklar,
    och `marknad.oversattAllt` registrerar ALLT via translationsRegister —
    produkt, metafält, varianter, kollektion, sidor, menyRADER, policyer,
    paket-metaobjekt, temats JSON-mallar, sektionsgrupper och inställningar.
    Matchningen görs på svenskt VÄRDE, så en ändrad källtext blir en läcka i
    rapporten i stället för fel text på /nb. `custom_liquid` är inte
    översättningsbart — trust- och leveransraden locale-branchas i Liquid
    (`tema.byggProduktTemplate`, nb ur samma fil). **Därför körs `--igen
    tema,oversatt` när nb-filen finns** — på första bygget skrivs mallen i
    steg 3 utan nb-fil, och trust-raden stod kvar på svenska på /nb
    (CaraShell 2026-09-10).
    ⚠️ **Temainställningen `brand_description` går inte att översätta på en
    trial-butik** (MÄTT CaraShell 2026-09-10: `translatableResources` gav 0
    resurser för `ONLINE_STORE_THEME_SETTINGS_CATEGORY` och 0 rader för
    `OnlineStoreThemeSettingsDataSections/<tema>`; TackleBay 2026-09-08 såg
    typen — den butiken hade plan). Sidfotens brandtext skrivs därför som ett
    **text-block** i `footer-group.json` (`startsida.byggFooterGroup`), som
    registreras i sektionsgruppen som vilken text som helst.
14. ⚙️ Bilder per marknad: alt-texten märks `[SV]`/`[NO]` (omärkt = alla),
    båda språkens bilder läggs som media, ms-head döljer fel språk per locale.
15. ⚙️ Norge ska SYNAS i kundvyn (Axel 2026-09-08): "Fri frakt – Sverige &
    Norge" / "Gratis frakt i hele Norge". NOK-paketnivåer innan norska annonser.
16. ⚙️ **NOK-priset går att sätta via API när NOK är marknadens basvaluta**
    (CaraShell 2026-09-11, `API-GRANSER.md`): prislista + marknadskatalog +
    fasta priser (pris och jämförpris per variant). Jämförpriset är ägarens
    beslut — CaraShell fick 1 106 / 1 382,50 NOK (25 % över priset). Fasta
    priser följer inte kursen: ändras SEK-priset sätts NOK om för hand.
    Kontrollen görs som norsk kund (`POST /localization` med `_method=put`),
    inte via /nb på svensk IP — /nb byter bara språk, inte marknad. ⚠️ Kvar:
    paketnivåerna och rabattkoderna står i SEK och visas med SEK-tal i den
    norska vyn (mätt: 1 919,30 för 2 st bredvid 1 106 per styck) — det är
    steget "NOK-paketnivåer" i punkt 15, fortfarande manuellt/obyggt.

## Fas 5 — Store ready (kedjans slutsteg)

16. 🖐 VA:n skriver **"Store ready: <namn>"** → ⚙️ `node factory/store-ready.mjs
    <butik-id> [--guild <id>]` (eller `ops.mjs --store-ready`): recensionerna
    (API-import om token, annars hennes klick), pixeln i det gemensamma
    OPS-annonskontot **MagiBorsten DK `915422744950975`** (`meta-setup.mjs`,
    fallback på företaget `1164852855167090` + `shared_accounts`, CAPI-
    systemanvändaren får pixeln, pixel-id:t skrivs i produktfilen) och
    Discord-kanalerna i servern VA:n skapat (`discord.mjs --guild <id>`; boten
    kan inte skapa servrar, `POST /guilds` → 20001, mätt 2026-09-08).
    WeTracked-kopplingen, CAPI-tokenen (Events Manager → Generate access
    token, passerar aldrig chatten) och Meta-sidan är ALLTID hennes.
17. 🖐 Meta-sidan skapar VA:n i Business Manager (API:t kan inte). Verifiera
    Page ID:t mot BÅDA `owned_pages` och `client_pages` — och innan annonser:
    att `me/accounts` listar den (FAS2.md). Kampanjnamn prefixas alltid med
    brandet; kontot döps aldrig om. Förväxla aldrig med MagiBorsten
    `1867947880635861` (Bäverbutiken).

## Fas 6 — Annonser

`/ny-annonser <butik>` i en NY session (`factory/FAS2.md`).

---

## Flerproduktsbutik (bevisat 2026-09-09, TackleBay)

Axels beslut: produkter som delar målgrupp delar EN butik som jämlika
produkter — lista bara fler produktfiler i samma körning. Brandet bär nischen,
startsidan blir kollektionen (`sortimentet`), huvudmenyn får en rad per
produkt, QA körs per produkt och `--launch` vägrar om NÅGON produkt är röd.
Motorn **stoppar** om två produkter delar `creative_prefix` — prefixet är det
ENDA fyra system (prefixkartan, översättningskön, adsetuppslaget,
commission-kopplingen) använder för att skilja produkter åt; brandet hör
hemma i kampanjnamnet. Break-even skrivs per produkt. `factory/FLERPRODUKT.md`
punkt 1–4 är avbockade.

---

## Nischbutik som startar med EN produkt (AdventLane 2026-09-10)

Axels beslut i prompten: "Nischbutik, inte one-product. Fler produkter i
samma nisch läggs in senare, så brandnamnet ska bära nischen." Kedjan avgjorde
förut flerprodukt på ANTALET produktfiler — en nischbutik med sin första
produkt hade byggts som enproduktsbutik (produkten direkt på startsidan,
ingen kollektion, ingen kollektionsrad i menyn) och byggts om när produkt
nr 2 kom. Nu: **`butik.kollektion.alltid: true`** i butiksfilen gör butiken
till nischbutik redan med en produkt (`butik.arNischbutik`): kollektionen
skapas och publiceras, startsidan visar kollektionen, huvudmenyn får
Hem / Kalendrarna / Racingkalendern / Frakt & retur / Kontakt, och
översättningsunderlaget bär kollektionen. Nästa kalender = en produktfil till
i samma körning, inget annat. Utan `alltid` gäller antalet som förr.

Produkttexterna får handla om produkten; **brandtexterna får aldrig låsa
brandet vid den första produkten** (AdventLanes startsida talar om
december-morgnar, inte om bilar).

Mätningar från samma bygge:
- **Shopify tappar avvisade filer TYST vid temauppackningen.** Första
  bygget ur den rensade zip:en (rensad 2026-09-09, aldrig använd skarpt förrän
  nu): `rensa-kalla.mjs` hade tömt löftena ur sex sektioners schema-defaults
  (`"default": ""`), Shopify avvisar det ("setting with id="items" default
  can't be blank") och lämnade filerna utanför temat — `processing: false`,
  ingen userError. Bygget stoppade elva steg senare i `startsida`: "Section
  type 'ms-usp-bar' does not refer to an existing section file". Två lagningar:
  `rensaBlankaDefaults` i rensa-kalla (textfält utan default i stället för
  blank; select med "" som alternativ rörs inte — fem sådana filer togs emot)
  och **`tema-upload` läser tillbaka uppackningen** (`kompletteraTema`: zip:ens
  filnamn mot temats, tappade filer skrivs in en och en så Shopify säger
  orsaken, kvarstående saknad = stopp). Körs på ett låst tema också, så
  `--igen tema-upload` lagar ett tema med hål. Ett test vaktar zip:en.
- **Fjorton läckor på /nb som underlaget inte bar.** Recensentnamnen i
  startsidans omdömesslider (identiska på norska, men "samma ord" räknas
  bara om nyckeln finns), sidfotens rubrik "Företaget" (ärvd ur zip:en, inte
  skriven), sticky-knappens "Köp nu" (product.json ur zip:en) och temats
  ENGELSKA defaults på mallar butiken inte skriver om (Share, Collections,
  Opening soon, password-texten) + Shopifys inbyggda kollektion "Home page".
  Matchningen sker på VÄRDE, så källtexten i underlaget måste vara exakt
  temats — därför står de engelska orden i `oversattning-sv.json` under
  `tema.default.*`. Ren Liquid (`{{ product.vendor }}`) räknas inte som läcka.
  Och den sista: trust- och leveransraden i produktmallen är `custom_liquid`
  som `tema.byggProduktTemplate` locale-branchar ur `nb['liquid.trust.<i>']`
  och `liquid.delivery.*` — underlaget skrev aldrig de nycklarna, så "Fri
  frakt" och "ångerrätt" stod kvar på /nb fast registreringen var grön.
  Nu skrivs de; **tema-steget måste köras om (`--igen tema`) när nb-filen
  kommit**, för produktmallen byggs i steg 3, långt före översättningen.
- **Loggans tillbakaläsning behöver några sekunder.** `settings_data.json`
  läst direkt efter skrivningen svarade `logo: ""` — värdet satt kvar strax
  efter. `logga.mjs` läser om upp till sex gånger med 2,5 s paus.
- **Video till Files går inte på trial.** `fileCreate` med `contentType:
  VIDEO` → "The file is not supported on trial accounts. Select a plan to
  upload this file." Koden finns (`filer.mjs laddaUppVideo`, `.mp4` i CLI:t)
  och två fällor är lösta (staged VIDEO-URL saknar ändelse ⇒ `filename`
  sätts efteråt med `fileUpdate`). Tills ägaren valt plan bär källans GIF
  demot; sen `node factory/filer.mjs <mp4>` + `--igen metafalt`. GIF → MP4
  görs med `imageio-ffmpeg` (pip) när `ffmpeg` saknas i containern.
- **Loggmotivet är per brand.** `logga-generera.mjs --motiv lucka` ritar en
  öppnad kalenderlucka; `droppe` (TankGuard) är standard, `ingen` finns.
  Typsnittet måste finnas i systemet — Poppins Bold fanns inte på jsDelivrs
  spegel (79 byte "not found") men på `raw.githubusercontent.com/google/fonts`.
- **Källans Judge.me-datum kan vara importtid.** Alla tio recensioner bar
  `created_at` inom tolv sekunder 2026-09-08 — Bäverbutiken API-importerade
  dem. Det ÄR källans originaldatum enligt regeln, men inga kunddatum finns;
  skriv det i produktfilen i stället för att hitta på spridning.
- **Inköpskostnaden går att härleda ur källkampanjens namn** när den bär
  "BE ROAS x.xx" (`docs/temu-launch-flow.md`: pris / (pris − inköp)). 1,62 på
  499 kr ⇒ 191 kr. Märks HÄRLEDD tills Axel bekräftat kvittot.

---

## Varukorgen — löst 2026-09-09

**Symptom** (Axel, HeimGuard + TankGuard, båda live): första gången kunden
lägger i varukorgen skickas hen till `/cart` i stället för att lådan glider
in. Tre hypoteser mättes i riktig Chromium mot båda butikerna och föll:
`cart-drawer.liquid` utan schema (sektions-API:t svarar 200 ändå),
`cart_type: 'drawer'` saknas (var redan satt på båda) och `product-form.js`
utan `<cart-drawer>` (elementet fanns, redirect-raden kördes aldrig).

**Rotorsaken satt i `assets/ms-paket.js`**, paketwidgetens egen köpväg:
(1) båda A/B-korten band sin köplyssnare till samma formulär, så ett klick gav
`/cart/add.js` två gånger — 4 kameror när kunden valt 2 — och två rabattkoder
efter varandra; (2) rabattkoden lades på FÖRE varorna, och `/discount/<kod>`
fäster inte på en tom vagn, så reservvägen `laddaOm()` navigerade till
`/discount/<kod>?redirect=/cart`. Det slår exakt vid första köpet.

**Fixen:** `factory/tema/assets/ms-paket.js` ägs av fabriken och skrivs över i
varje butik via `TEMAFILER` (steg 3): ett gömt kort köper aldrig, en submit
hanteras en gång (`stopImmediatePropagation`), varorna i vagnen FÖRST och
koden efter, lådan hämtas i ett eget `?sections=`-anrop. Ett test håller
zip:ens kopia byte-identisk. Verifierat i riktig webbläsare på alla fyra vyer
(sv + nb, båda butikerna): lådan glider in, 2 st, rätt pris.
`branding.byggSettingsPatch` sätter dessutom `cart_type: 'drawer'` explicit —
inte orsaken här, men en klon kan tappa inställningen.

**Regel:** varukorgen testas på RIKTIGT i kundens vy innan en butik får
annonser — tom korg, lägg i varan, lådan ska glida in, och **räkna varorna i
vagnen** (ett dubbelköp syns bara där). En molnsession kan inte göra det
(Playwright når inte ut, butiken är lösenordsskyddad, och ett köp på en
live-butik smutsar ner pixeln) — den skriver "varukorgen INTE testad — kräver
en människa i en webbläsare".

---

## Regler som bevisats den hårda vägen
- **"Butiken ser obrandad ut" är nästan aldrig brandingen — det är ett steg som
  inte kördes.** Mätt 2026-09-09 när Axel jämförde sina tre OPS-butiker och
  gillade DryTrek mest: TackleBays `branding:`-block är lika genomarbetat som
  DryTreks, färg för färg och regel för regel. Skillnaden låg i vad som blev
  gjort. DryTreks state har ett `logga`-steg; TackleBays har inget — dess tre
  loggvarianter ligger genererade i `factory/output/tacklebay/` och kom aldrig
  in i butiken, så headern visar butiksnamnet som text. HeimGuard har dessutom
  ett `rensa-popups`-steg som Axel körde för hand 2026-09-06.
  **Diagnosen görs i state-filen, inte i yaml:en:** jämför steglistan mot
  kedjans, och leta efter det som SAKNAS. Att skriva om ett branding-block som
  redan är rätt löser ingenting, och kostar en runda.
- **Demot i beskrivningen är en loopad MP4, aldrig en GIF eller WebP**
  (Axels beslut 2026-09-09). Samma sekvens som GIF är ofta 10–20× större och
  begränsad till 256 färger. Temat väljer på filändelsen: `.mp4`, `.webm` och
  `.mov` blir en ljudlös `<video autoplay muted loop playsinline>`, allt annat
  blir `<img>` — så gamla GIF:ar slutar aldrig fungera.
  `muted` och `playsinline` är inte valfria: utan dem vägrar iOS och Chrome
  starta, och kunden ser en svart ruta i stället för demot.
  Den som stängt av rörelse i sitt system får första bildrutan stilla.
  ⚠️ **Byt aldrig metafältsnamnen** (`gif_problem`, `media_losning`,
  `bild_lifestyle`) för att de låter som bilder. De ligger live på
  heimguard.se och tankguard.se — ett nyckelbyte tömmer båda butikernas
  beskrivningar utan ett enda felmeddelande. Det är renderingen som bytte.

Varje regel en gång, med datum. Koden bär dem; det här är varför.

**Tema och state**
- **Ett tema-id, låst i state** (TankGuard 2026-09-08: VA:n publicerade
  utkastet mitt i bygget, Horizon blev det opublicerade temat och ett steg
  patchade fel tema). `tema-upload` skriver `arbetstemaId`; varje temasteg
  går via `hamtaArbetstema(id)` — aldrig "första UNPUBLISHED", aldrig
  `hamtaUtkastTema()`. Utan id i state kastar kedjan.
- **Temat GÅR att publicera via API** (`themePublish` → `role: MAIN`, noll
  userErrors, DryTrek 2026-09-09) och Admin-API:t skriver mot MAIN-temat med
  butikens egen app (TankGuard 2026-09-08). Regeln "publicerat tema är
  API-låst" gällde MCP-kopplingen. Kedjan publicerar ändå inte temat själv —
  `--launch` skriver ut temanamnet och en människa klickar Publish
  (checklistans avsnitt 5 — första klicket efter bygget, så allt som
  kontrolleras senare kontrolleras mot kundens riktiga vy).
  ⚠️ Det är ett KODHÅL, inte en API-gräns: `shopify.mjs` saknar
  `publiceraTema` och `ops.mjs:1450` märker steget som manuellt. Kopplas
  anropet in försvinner klicket (`API-GRANSER.md` punkt 0).
- **En skrivning utan tillbakaläsning är inte gjord** (DryTrek 2026-09-09:
  temasteget rapporterade ✅ medan `templates/product.json` låg orörd — ett
  nyuppackat tema skriver över filen). Liquid/JS/CSS verifieras byte för
  byte, JSON som VÄRDEN (Shopify normaliserar JSON, 9 691 mot 13 070 byte i
  `settings_data.json`), och produktmallen skrivs om tills den sitter.
  `settings_schema.json` skrivs FÖRE `settings_data`, annars stryks
  `ms_ab_tests`.
- **Skriv aldrig egna nycklar i `factory/state/`** — en handskriven `brand`-
  nyckel lästes av `--resume` som "steget är klart" (2026-09-09).
- **Appinbäddningar bor i `settings_data.json` och dör i varje klon** (Judge.me
  fick aktiveras om två gånger v7→v9). `rensaSettings` sätter app-embeds =
  enbart Judge.me i varje bygge.
- **`brand_image` och `logo` är två olika inställningar** (DryTrek 2026-09-09:
  av-brandningen städade den ena och missade den andra). `logga.mjs` sätter
  `logo` + `favicon` och läser tillbaka värdena.

**Källbutiken i bas-zip:en**
- **Bas-temat är genomsyrat av Matstrumpor — 157 fynd i 50 filer**
  (2026-09-09, listan i `AVBRANDNING.md`): riktiga kundrecensioner i
  startsidan, deras sociala länkar, Klaviyo-embed, kampanjsektioner
  (`ms-skrapkort`, `ms-cookies`, `newsletter`) utan text som en skanning
  hittar, `header-group.json` med "Levereras presentklart", och villkoren
  ("Fri frakt i Sverige", "30 dagars öppet köp") som fallback i koden. Steg 4
  (`avbranda`) tar bort sektionerna och skriver om texten; steg 14 skannar
  ALLA filer och stoppar vid en träff. Beslutet om en ren bas-zip står kvar.
- **Startsidan byggs ur konfigen, aldrig ärvd** (DryTrek 2026-09-09 nådde
  förhandsvisning med "Kilometer fyra. Fortfarande torr strumpa." som hero).
  `startsida.mjs` skriver `templates/index.json` + sidfotens bolagsblock ur
  `butik.startsida`; omdömesslidern ritas bara med riktiga recensioner.
- **Loggan, faviconen och huvudmenyn sattes aldrig av fabriken** (DryTrek
  2026-09-09: `main-menu` kvar på Dawns Home/Catalog/Contact där Catalog går
  till en tom `/collections/all`). Nu steg 5 (`logga.mjs`) och steg 13
  (`meny.mjs`).
- **Trust-raden i produktmallen är `custom_liquid`** och därmed inte
  översättningsbar — `tema.byggProduktTemplate` locale-branchar den.
- **Temats egna svenska ord** i `ms-paket.liquid` ("Gratis på köpet", "Välj
  paket") och `ms-delivery-estimate` (månadsnamn via Intl sv-SE) syntes på /nb
  (TankGuard 2026-09-08) — `tema.patchaMsPaket` locale-branchar snippeten.

**Grön konfiguration är inte en grön butik**
- Fabrikens QA rapporterade "14 gröna, 0 fel" på en butik som hette **My
  Store 3**, saknade logga, visade Shopifys illustration som hero, hade Dawns
  meny och stod på engelska (DryTrek 2026-09-09). Varenda kontroll läste
  konfiguration. Steg 18 hämtar därför startsidans och produktsidans RIKTIGA
  HTML (`kundvy-kor.mjs`, storefront-lösenord ur `SHOPIFY_STOREFRONT_PASSWORD`
  — VA:ns steg 2) och kör `kundvy.mjs`. **Utan HTML: rött, aldrig grönt.**
- **Trippelkollen**: säg aldrig "klart" utan tre kontroller mot kundens
  riktiga vy (API-tillbakaläsning `trippelkoll.mjs`, kundvyn + markörskanning
  på /nb, visuell mobilkontroll — den sista är alltid en människa). Delvis
  klart heter delvis klart.
- **Svenska markörord på översatta sidor kommer ur `butik.markorer_sv`**, inte
  ur koden (KEDJAN regel 7). Saknas listan är skanningen manuell — den är
  inte grön.
- **Storefronten stryper täta anrop** (429 efter ~10 sidor/minut) —
  `kundvy-kor` pausar och väntar i stället för att rapportera rött. `429` på
  `/cart/add.js` från molnet är Cloudflares bot-utmaning, inte strypning —
  går inte att vänta bort och ska inte kringgås.
- **`onlineStorePreviewUrl` renderar alltid LIVE-temat** — `preview_theme_id`
  ignoreras där. Utkastet kollas mot riktiga storefronten bakom lösenordet.

**Shopify-API:t (2025-07)**
- `pageByHandle` finns inte — `pages(first:, query:)`. En deklarerad men
  oanvänd GraphQL-variabel avvisas. `webPresenceUpdate` tar `id` + `input`
  och `webPresences` läses på ROTNIVÅ (fältet under `markets` svarar tomt).
  `marketCreate` ger DRAFT — marknaden aktiveras separat. Tema-JSON kan bära
  ett `/* … */`-block överst. Mallarnas översättningsnycklar har prefixet
  `section.<mall>.json.` (singular). **Menyns RADER är egna resurser**
  (`gid://shopify/Link/…`) — översätts bara menyn får kunden svenska länkar.
- `stagedUploadsCreate` har ingen `THEME`-resurs — `FILE` fungerar för
  `themeCreate`.
- **`productSet` skapar på handle men UPPDATERAR bara på id** ("Handle
  already in use") — `skapaProdukt` slår upp id:t först och behåller
  butikens status.
- Fraktmetoder med villkor listas som `<id>?source=RateRangeCondition…` och
  kan varken uppdateras eller raderas — de rivs och byggs om (`frakt.mjs`).
- `MetaobjectDefinitionCreateInput` saknar `displayNameField`; `PUBLIC_READ`
  krävs för att `shop.metaobjects` ska se posterna.
- `productSet` med `files` synkar galleriet; alt-texten bär `[SV]`/`[NO]`.
- **`shopify://shop_images/<namn>` kräver FILÄNDELSEN och det LAGRADE
  filnamnet** — Shopify lägger på ett UUID när namnet redan finns
  (`benskydd-08.jpg` → `benskydd-08_3ecbd654-….jpg`), och det händer
  garanterat i en OPS-butik eftersom produktbilderna laddas upp från samma
  URL:er först. DryTrek 2026-09-09: alla fem startsidesbilder pekade på filer
  som inte fanns, temat ritade sin platshållare utan fel. `filer.mjs` läser
  tillbaka det faktiska namnet; steg 12 laddar upp innan mallen skrivs.
- **Ny temaklon tappar temats translationsRegister-rader** — registrera om
  för mallar OCH sektionsgrupper (nycklar/digests är stabila mellan kloner).
- **Kan INTE sättas via API** (klick i checklistan): butiksnamn (`shopUpdate`
  finns inte, REST ger 406), primärspråk, valuta, primärmarknad, shop-mejl,
  checkout-branding (Plus), Meta-sidor, CAPI-token, Discord-server,
  Judge.mes inställningar och token. `shopPolicyUpdate` kräver scopet
  `write_legal_policies` — saknas det blir policyerna manuella.
- **Kollektion + produkter uppdateras i två anrop** (mätt 2026-09-10):
  `collectionUpdate` avvisar `products` ("products cannot be specified
  during update"). `skrivKollektion` uppdaterar titel/beskrivning och lägger
  till saknade produkter med `collectionAddProducts`.
- **Tillbakaläsningen av en temafil kan komma före Shopifys egen skrivning**
  (TackleBay 2026-09-10: `brand_description` lästes som "" och stod i butiken
  tio sekunder senare). `skrivOchVerifiera` läser upp till tre gånger med
  paus — verifieringen är kvar, den dömer bara inte på första läsningen.
- **Paketblocken och paketnivåerna delar testnamn.** Standardstegen i
  `paket.mjs` ligger under `STANDARD_PAKETTEST = "paket"` (a/b) och mallen
  bygger A/B-blocken under samma namn — med '' renderar `ms-paket.liquid`
  noll nivåer. Flerproduktsbutik får blocken i den delade `product.json`
  när alla produkter delar test (ms-paket filtrerar på `product.id` själv);
  fullpris-kryssrutan är produktbunden och byggs bara i enproduktsläget.
- **Gamla paketnivåer dör inte av sig själva.** Byter handle-schemat
  (TackleBay: `tacklebayrod-*` → `fiskespohallare-4-pack-*`) ligger de
  gamla kvar och kunden ser sex nivåer. `paket.mjs --stada` river nivåer
  som pekar på produkten men inte står i planen; trippelkollen larmar med
  "2 förvalda".
- **Ägarens QA-undantag bor i produktfilen** (`qa.undantag` + obligatorisk
  `qa.undantag_motivering`, TackleBay 2026-09-10: "kalendern har inga
  annonser än — skippa den", "/gif_problem" = launch utan gif). Punkten
  blir manuell med motiveringen i rapporten, aldrig borttagen. Utan
  motivering gäller undantaget inte. Fabriken skriver aldrig in ett själv.
- **Översättningsunderlaget måste bygga settings MED butiken** —
  `rensaSettings({ current: {} }, { butik })`. Utan butiken blev
  `brand_description` tom i underlaget medan temat bar positioneringen, och
  launch-körningens läcksökning hittade "temainställning
  general.brand_description" på /nb (TackleBay 2026-09-10).
- **Bonussteget återanvänder en befintlig produkt.** Är `offer.bonus_produkt.handle`
  en produkt som redan finns i butiken och `bilder` är tom (betald
  korg-upsell = butikens andra produkt, TackleBay 2026-09-10, Axels beslut
  "ingen gratis bonus") skapas ingenting — id:n hämtas och skrivs tillbaka.
  Bara en bonus MED egna bilder byggs som ny produkt.
- **Recensionsdatum går inte att verifiera ur HTML** — Judge.me-widgeten
  renderas i webbläsaren, och `reviews_for_widget` svarade tomt för
  iahe0c-b1 (2026-09-10) trots att importen var gjord. Datumkollen efter
  app-importen är alltså ett öga på produktsidan, inte en kodkontroll.
- **Kundvyns gratis-rad och fullpris-kryssruta är villkorade** på
  produktfilen: gratis-raden bara när en nivå har `gratis_antal > 0`,
  kryssrutan bara vid `tillagg_kryssruta: true`. En betald korg-upsell
  (bonus_produkt = butikens andra produkt) ger inte rött.
- **Hero- och trygghetsbilder: bara källbilder UTAN inbränd svensk text.**
  Fyra av fem spöhållarbilder bar svenska rubriker — de läcker på /nb.
  Tomma bildfält = Shopifys placeholder-SVG = rött i kundvyn.
- **Appens scopes är ett klick, inte en självklarhet.** En app skapad på
  dev.shopify.com har inga scopes förrän någon skriver in dem under
  Configuration → Access scopes och släpper en version. Token-minten lyckas
  ändå, så felet syns först vid första läsningen. Listan bor på ETT ställe,
  `KRAVDA_SCOPES` i `token.mjs`; checklistan och steg 0 läser den därifrån.
  Ändras kedjan så att den behöver ett nytt scope: lägg till det där, aldrig
  i en doc-fil för hand.
- **En färsk trial-butik har `en` som primärspråk och VA:ns land/valuta**
  (DryTrek: `shopLocales` = bara `en`; TackleBay: `en`, Filippinerna, PHP,
  2026-09-09). Svensk text hamnar i `en`-slotten men kundvyn blir rätt;
  `sv` får ALDRIG publiceras tom. **Valutaspärren:** rabattkoder lagras i
  BUTIKENS valuta — TackleBays åtta koder blev PHP-belopp, osynligt i admin,
  fel i kassan. `paket.mjs` vägrar när `shop.currencyCode` ≠ konfigens
  valuta. **Byt valuta FÖRE paketsteget.**
- **`ops.mjs` skapar produkten ACTIVE** (`build-store.byggPlan`); en befintlig
  produkt behåller sin status (DRAFT satt av Axel är ett beslut). DRAFT ger
  404 i menyn och "Exempel på produktnamn" i kundvyn (TankGuard 2026-09-08).

**Judge.me, Meta, Discord**
- Judge.me knyter reviewer-NAMNET till mejladressen — samma syntetiska
  adress i sv- och no-CSV:n gav norska rader svenska namn (TankGuard
  2026-09-08). `tools/judgeme-import.mjs --mejlsuffix` bygger adressen av
  filstam + radnummer. Fel rader kan inte raderas via v1 — `PUT /reviews/<id>`
  med `hidden: true, curated: spam` döljer dem; nya butikers produkt-id ger
  422 i `/reviews?product_id=` — dubblettspärren faller tillbaka på butiksvid
  läsning. Judge.me-tokenen kan inte läsas via API.
- **Ett annonskonto kan bara ha EN pixel via `act_<id>/adspixels`** (#6200,
  2026-09-09) — skapa på företaget och dela med `shared_accounts`. Begär
  `fields=name` explicit; Bäverbutikens pixel `1554276343018184` ligger i
  samma konto. `last_fired_time` saknas tills WeTracked skickat första
  eventet. CAPI-tokenen kan inte skapas via API (kräver `appsecret_proof`).
- Metasidan ska ligga I företaget; `GET /<page_id>` direkt går inte med
  rutinernas token (kod 100) och säger inget om sidan. Ett id som saknas i
  både `owned_pages` och `client_pages` är fel (2026-09-08).
- Discord: invite-länk → `GET /invites/<kod>` ger `guild.id`; kolla i
  `GET /users/@me/guilds` att boten är inne innan `--guild`. Serverikonen
  hämtas ur Shopify Files — `output/` dör med containern.

**Miljön och verktygen**
- **Storefront-lösenordet slås upp på ADRESSENS miljösuffix, inte på
  butiks-id:t** (CaraShell 2026-09-10: nycklarna låg under `_yitrbk_m3`,
  id:t var `carashell`, och kundvyn blev röd med "Lösenordet avvisades" fast
  rätt lösenord stod i miljön). `anslut()` lyfter `SHOPIFY_STOREFRONT_PASSWORD_<suffix>`
  till `SHOPIFY_STOREFRONT_PASSWORD` i processen — samma suffix som gav
  Shopify-nycklarna.
- **Priskontrollen i kundvyn tål tusentalsavstånd.** Shopify renderar
  "1 129,00 kr"; `produktkoll` letade efter "1129" och var röd på varje pris
  ≥ 1 000 kr — det syntes först på CaraShell (2026-09-10), alla tidigare
  OPS-produkter kostade under 1 000 kr.
- **RDAP för .se och .no går inte att nå härifrån** (2026-09-10: `rdap.org`
  svarade 404 även på tankguard.se och google.se, `rdap.norid.no` 404 på
  tankguard.no). Domänkollen för .se/.no är DNS (`getent hosts`) — tomt svar
  är "troligen ledig", aldrig "ledig". `.com` fungerar i RDAP (200/404).
- **Loggan: Axel har valt variant c två gånger av två** (TackleBay, CaraShell
  2026-09-10) — det rena ordmärket/monogrammet utan symbol. Takmotivet (nytt
  för CaraShell, `--motiv tak`) föll: "de andra två passade inte produkten".
  Nästa butik: gör c till utgångsläge och pröva något NYTT i a/b, inte ett
  nytt motiv i samma komposition.
- **Playwright når inte ut på nätet i molnsessionen** (`ERR_CONNECTION_RESET`
  genom proxyn, 2026-09-09) — läs HTML med `curl`, plocka JSON ur den. Lokala
  `file://`-sidor fungerar (loggvarianterna).
- **`whois` finns inte** — RDAP `https://rdap.org/domain/<domän>` (404 = ledig)
  med `curl -L`; `rdap.iis.se` är proxyblockerad. Dubbelkolla med DNS.
- **Kaching-nivåerna läses ur JSON-scriptet i HTML:en**, inte ur en renderad
  widget (damaskerna 2026-09-09) — noll credits, ingen webbläsare.
- **YAML-läsaren**: `[]` läses som strängen `"[]"` — skriv tomma listor som
  mallen (nyckeln följd av `- ""`). En citerad listrad med kolon tolkades som
  objekt och renderades `[object Object]` — rättat i `yaml.mjs` med
  regressionstest.
- **Läs produktbilderna innan copyn skrivs** (TackleBay 2026-09-09: källans
  text sa "monteras på vägg", bilderna visade en klämma — hela sidan fick
  skrivas om).

**Axels regler**
- **Alltid svensk lag, aldrig egna köplöften** (2026-09-08): 14 dagars
  ångerrätt i policyn, USP-strippen och garantierna. "30 dagars öppet köp" är
  ett stoppord i kundvyn.
- **EU:s ångerknapp är obligatorisk sedan 19 juni** (2026-09-09): en synlig
  knapp kunden hittar, tvåstegsbekräftelse och automatiskt bekräftelsemejl.
  Fabriken skriver knappen i returpolicyn (`policyer.angerknapp`) och lägger
  raden **Ångra köp** i sidfotsmenyn; Shopifys självbetjäningsreturer gör
  själva jobbet och slås på för hand i checklistans **avsnitt 8**. Bygg ALDRIG en egen
  inloggningsfri returformulärsida — Shopifys eget utskick påstod att kunden
  inte får behöva logga in, men direktivet kräver bara att det inte är
  krångligare än att köpa. Utan knappen kan ångerfristen förlängas från 14
  dagar till 12 månader och 14 dagar, och böterna når 4 % av årsomsättningen.
- **Loggan visas i chatten innan den sätts** — tre varianter, Axel väljer
  (första TankGuard-loggan underkändes 2026-09-08). Bytet är ett API-anrop.
- **Widgeten stylas aldrig från temat** (2026-09-07) — Judge.mes egna
  inställningar, stjärnfärg #00B77F i varje butik.
- **Slutrapporten har TVÅ listor** (TankGuard 2026-09-08: pixeln var skapad,
  WeTracked inte kopplat, rapporten sa "Pixeln är klar"). Ett steg där en
  person klickar står aldrig under "Gjort av mig". Nämn aldrig en person som
  inte finns — `standby.md` utan `redo`-rad = "ingen redigerare i standby än".
- **Anslutningskontrollen dömer på butikens NAMN, inte på state-filen**
  (2026-09-09: miljön stod kvar på TankGuard, som saknade state-fil).
- **Masterkopian för den som klickar är Google-dokumentet** (länk i
  `VA-CHECKLIST.md`) — varje ändring i mallen förs in där i samma session
  (2026-09-08). Filnamnet säger VA men rollen är Axels eller nästa anställds
  sedan 2026-09-10.
- **Copy skrivs av en subagent** (CLAUDE.md regel 6) — kedjan skriver
  underlag och läser översättningen, koden översätter aldrig själv.
- **Shopify-MCP:n är förbjuden i `/ny-ops`** (incident 2026-09-07: MCP:n stod
  på HeimGuard och rutinen försökte `switch-shop`). All åtkomst via token i
  `factory/.env`.
