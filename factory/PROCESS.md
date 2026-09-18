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
   **Nivåerna är 1 / 2 / 4, inte 1 / 2 / 3** (Axels beslut 2026-09-10, gäller
   alla framtida OPS): största nivån är alltid 4-pack, med källans procent
   för toppnivån. **Produkter med varianter får en rullgardin per enhet i
   paketet** (1 par = 1 ruta, 2 = 2, 4 = 4) med variantbilden som miniatyr,
   som Kaching — temats pill-väljare göms. Kunden kan blanda färger; köpet
   lägger en rad per vald variant och rabattkoderna räknar antal per
   produkt, så koden gäller oavsett mix. Koden bor i
   `snippets/ms-paket.liquid` + `assets/ms-paket.js/.css` (i
   `factory/tema/ops-tema.zip`); produktmallen skickar `enhet: 'par'` (ordet
   i rutans etikett). `underrubrik` lämnas TOM på nivåer > 1 — styckpriset
   räknas i temat och följer valutan.
   ⚠️ Slå aldrig upp en befintlig rabattkod med `query: "code:X"` — sökningen
   är LUDDIG: mätt 2026-09-10 på DryTrek svarade den DAMASKER2PACK på
   sökningen efter DAMASKER4PACK och 2-packets kod skrevs över. `paket.mjs`
   räknar en träff bara vid exakt kodmatch — kontrollera ändå alla koder
   efter en körning.
8. ⚙️ Bilder: inbränd engelska bort. kie.ai klarar INTE svensk text — metoden
   är kie RENSAR text → `bildtext.mjs` (sharp) lägger vektortext. Gif =
   redigerarjobb.
9. 🖐 **Butiken skapas av VA:n** från jobb-Gmailen (ny FREE TRIAL per butik —
   ingen plan, inget kort; staff-inbjudningar kräver betald plan). Claude
   kopplas via butikens EGEN app (custom distribution låses till EN butik
   utanför Plus, mätt 2026-09-08); nycklarna läggs i miljön, aldrig i chatten.
   ⚠️ **Tokenen från `client_credentials` lever 24 timmar** (mätt 2026-09-10 på
   DryTrek: dagen efter bygget svarade allt 401 "Invalid API key or access
   token"). Det är inte butiken som ändrats — kör om anslutningen (steg 0 /
   `token.mjs` mintar en ny med samma client id/secret och skriver om `.env`),
   kontrollera `shop.name` och felsök inte butiken.
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
    **Har den svenska källprodukten noll recensioner: läs den NORSKA
    tvillingen först** (mätt 2026-09-09, DryTrek: baverbutiken.se 0 st,
    beverbutikken.no 10 st à 4,4 på samma produkt) — samma serverrenderade
    HTML (`jdgm-rev__body`, `data-score`, `jdgm-rev__author`), inget token
    behövs. Riktningen blir då omvänd: de norska importeras som original och
    fabriken översätter dem till svenska med svenska namn för huvudmarknaden.
    `reviewer_email` fylls med `<namn>@<brand>.invalid` (reserverad TLD) —
    Judge.me kräver en adress och knyter namnet till den.

## Fas 4 — Marknader (kedjans steg 16–17)

12. ⚙️ **SE huvudspråk + marknad Norge locale nb är STANDARD i varje OPS**
    (Axel 2026-09-08). `butik.marknader` i butiksfilen styr; `marknad.mjs`
    skapar marknad + locale (publicerad) + nb som alternateLocale på
    huvuddomänens webPresence. Lokal valuta (NOK) slås på i admin — ett
    mänskligt klick (checklistans avsnitt 5).
    ⚠️ **/nb är ett SPRÅK, inte en marknad** (mätt 2026-09-10 på DryTrek, efter
    en dag med 16 norska annonser live): huvuddomänens webPresence hör till
    Sverige, så `drytrek.se/nb/…` gav norsk text men SVENSKA priser (389 kr)
    och kassa i SEK — annonsen lovade 381 kr. Två saker krävs, båda:
    (1) koppla webbnärvaron till marknaden Norge —
    `marketUpdate(webPresencesToAdd: [<alla webPresence-id>])` i `marknad.mjs`
    — så Shopify väljer NOK på norsk IP; huvudmarknaden Sverige förblir
    default för alla andra (verifierat: `/products/<handle>` utan land = SEK).
    (2) alla norska annonslänkar bär `?country=NO` (`kampanj.mjs` gör det
    sedan 2026-09-10) — Shopify honorerar parametern server-side, så första
    renderingen är rätt oavsett IP.
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
    ⚠️ **Shopify faller TYST tillbaka på svenskan för varje sträng som saknar
    nb** — mitt i en annars norsk sida, utan felmeddelande. Axels bakläxa
    2026-09-09 (DryTrek): marknaden var uppe, paketen översatta, och ändå stod
    meny, sidfot, sidor, färgnamn, fraktmetoder och hela produktbeskrivningen
    på svenska för en norsk kund — dåvarande `oversatt.mjs` täckte 4 av 13
    resurstyper. Facit är därför alltid två saker: (a) `translatableResources`
    per resurstyp — PRODUCT, PRODUCT_OPTION, PRODUCT_OPTION_VALUE, COLLECTION,
    LINK, SHOP_POLICY, PAGE, BLOG, METAOBJECT, METAFIELD,
    DELIVERY_METHOD_DEFINITION, ONLINE_STORE_THEME_* — och varje rad med text
    ska ha en nb-rad (appgenererade metafält som Judge.me-widgetar,
    rabattkoder och Liquid räknas inte); (b) **`node factory/sprakkoll.mjs
    <butik> <handle> --losenord X`** läser de riktiga /nb-sidorna och slår
    larm på svenska former som inte finns i bokmål ("och", "är", "känga",
    "färger", "ångerrätt" …) och på svenska priser. Butiken får inga norska
    annonser förrän den är tom. Juridiken BYTS, översätts inte:
    distansavtalslagen → angrerettloven.
14. ⚙️ Bilder per marknad: alt-texten märks `[SV]`/`[NO]` (omärkt = alla),
    båda språkens bilder läggs som media, ms-head döljer fel språk per locale.
    Gjort på DryTrek 2026-09-09: norska tvillingar av textbilderna ritade med
    PIL + DejaVu Sans Bold (samma typsnitt som originalen, inget kie behövdes),
    inlagda med `productCreateMedia` (alt `[NO] …`), de svenska ommärkta
    `[SV] …` med `productUpdateMedia` och sorterade parvis med
    `productReorderMedia`. ⚠️ Reorder är ett JOBB — polla `job.done` innan
    tillbakaläsningen; första körningen lästes tillbaka för tidigt och såg
    oförändrad ordning ut.
15. ⚙️ Norge ska SYNAS i kundvyn (Axel 2026-09-08): "Fri frakt – Sverige &
    Norge" / "Gratis frakt i hele Norge". NOK-paketnivåer innan norska annonser.
16. ⚙️ **NOK-priset går att sätta via API när NOK är marknadens basvaluta**
    (CaraShell 2026-09-11, `API-GRANSER.md`): prislista + marknadskatalog +
    fasta priser (pris och jämförpris per variant). Jämförpriset är ägarens
    beslut — CaraShell fick 1 106 / 1 382,50 NOK (25 % över priset). Fasta
    priser följer inte kursen: ändras SEK-priset sätts NOK om för hand.
    Kontrollen görs som norsk kund (`POST /localization` med `_method=put`),
    inte via /nb på svensk IP — /nb byter bara språk, inte marknad.
17. ⚙️ **NOK-paketnivåerna är byggda (2026-09-12, Axels val "B").**
    `ekonomi.marknadspriser` i produktfilen (valuta + pris + jämförpris) ⇒
    `paket.mjs` räknar varje nivås pris i den valutan med samma procent och
    skriver det i metaobjektfältet `fastpris_valutor` ("NOK:1880.20");
    `tema.patchaMsPaketValuta` låter snippeten läsa det fältet när
    `cart.currency` inte är butikens valuta.
    ⚠️ **Mallen `ops-tema.zip` saknar både de norska orden och
    `fastpris_valutor` — det är med flit, inte en lucka.** Mallen hålls ren och
    `ops.mjs` steg `tema` patchar in båda vid VARJE bygge (`patchaMsPaket` +
    `patchaMsPaketValuta`, idempotenta). Lägg dem aldrig i zipen: då blir
    patcharna no-ops och två källor ska hållas i synk i stället för en.
    ⚠️ Men patcharna är TYSTA när de missar: båda svarar `null` både när
    jobbet redan är gjort och när ankaret saknas. Skrivs snippeten om så att
    raden `assign fast = niva.fastpris.value` ändras, försvinner NOK-priset
    utan felmeddelande och syns först som SEK-pris i en norsk kassa. Testet
    "zipens ms-paket.liquid bär ankaret för BÅDA bygg-patcharna"
    (`factory/test/tema.test.mjs`, skrivet 2026-09-13 efter att snippeten
    bytts mot rullgardinsversionen) kör patcherna mot den riktiga zipen och
    blir rött innan det når en butik. Rabattkoden blir en
    **procentkod** när nivån är en hel procent utan gratisrad — ett fast
    SEK-belopp räknas om med dagskursen i kassan och driver ifrån sidan
    (mätt: sidan 1 919,30, kassan 1 880,63). Med procent stämmer sida och
    kassa på öret i alla valutor: norsk kund 1 880,20 / 1 880,20, svensk
    kund 1 919,30 / 1 919,30 (mätt 2026-09-12). Gratis bonus ⇒ beloppskod
    som förut, och nivån visas bara i butikens valuta. Körs med
    `--igen tema,paket` efter att prislistan (punkt 16) finns.

## Fas 5 — Store ready (kedjans slutsteg)

16. 🖐 VA:n skriver **"Store ready: <namn>"** → ⚙️ `node factory/store-ready.mjs
    <butik-id> [--guild <id>]` (eller `ops.mjs --store-ready`): recensionerna
    (API-import om token, annars hennes klick), pixeln i det gemensamma
    OPS-annonskontot **MagiBorsten DK `915422744950975`** (`meta-setup.mjs`,
    fallback på företaget `1164852855167090` + `shared_accounts`, CAPI-
    systemanvändaren får pixeln, pixel-id:t skrivs i produktfilen) och
    Discord-kanalerna i servern VA:n skapat (`discord.mjs --guild <id>`; boten
    kan inte skapa servrar, `POST /guilds` → 20001, mätt 2026-09-08).
    Invite-länken till boten (Bävern, id 1543628123289952277 — `discord.mjs`
    skriver ut den utan `--guild`) ska bära **Manage Server**: utan det går
    kanalerna in men serverikonen får 403 (mätt 2026-09-09, DryTrek). Länken
    `discord.mjs` skriver ut bär `permissions=268435505` (Manage Channels +
    Manage Roles + Manage Server + Create Invite); fullt set med View + Send
    är `permissions=268438577`.
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
  `--motiv koja` (CatCabin 2026-09-11) ritar en utekattkoja på ben med tänd
  dörr i accentfärgen. Med ett eget motiv blir variant c motivet stort +
  ordmärket litet — monogrammet i två bokstäver hade aldrig valts
  (`LOGGA-FEEDBACK.md`: a 0, b 0, c 1 vid bygget), och feedbackloopen säger
  att en variant som aldrig väljs ska bytas mot något nytt.
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

## Enproduktsbutik med adressen i prompten (CatCabin 2026-09-11)

Första bygget där checklistans nya avsnitt 3–4 användes fullt ut: fyra rader
med adressens suffix i miljön (`…_ras1t2_2x`) och adressen i prompten, inget
butiks-id. Steg 0 hittade nycklarna ur adressen och svarade "Connected:
ras1t2-2x.myshopify.com ✓" med alla 16 scopes. Bygget gick steg 1–16 rakt
igenom på första körningen. Mätningar:

- **Lösenordet slogs upp på fel nyckel.** `anslut` hittade tokenen via
  adressens suffix men storefront-lösenordet via butiks-id:t (`catcabin`),
  som inte fanns — så det föll tillbaka på den allmänna raden, TackleBays.
  Kundvyn blev röd med "Lösenordet avvisades (HTTP 200, location saknas)"
  fast rätt lösenord låg i miljön. Rättat i `token.mjs` (suffixet ur
  adressen först) med regressionstest. Felraden var vilseledande: den
  pekade på lösenordet, inte på uppslaget.
- **Judge.mes `reviews_for_widget` svarar utan text och namn** (mätt
  2026-09-11 mot Bäverbutiken): JSON-svaret bär `rating`, `title` och
  `created_at`, men `body` och `reviewer` är `null` och nyckeln `html`
  saknas. Texterna och namnen ligger förrenderade i produktsidans HTML under
  `jdgm-rev-widg` (`jdgm-rev__author`, `jdgm-rev__body`,
  `jdgm-rev__timestamp data-content`). Läs båda: JSON för datum, HTML för
  text. Källans tio recensioner låg återigen inom elva sekunder (API-import
  dagen efter produkten skapades) — samma regel som AdventLane.
- **Nunito som variabel TTF räcker för sharp.** `Nunito[wght].ttf` från
  google/fonts (raw.githubusercontent.com; `static/Nunito-Bold.ttf` finns
  inte i repot, 14-byte "404") registreras av fontconfig med style=Bold och
  librsvg plockar vikten 700 ur den. Poppins Bold ligger fortfarande som
  statisk fil.
- **Nytt loggmotiv `koja` + motiv-ledd variant c** (se "Loggmotivet är per
  brand" nedan). Loggfeedbacken före genereringen: a 0, b 0, c 1.
- **Första varma paletten.** De fem tidigare butikerna är mörkblå eller
  mörkgröna; CatCabin är kolgrå + crème + bärnsten. Brandet får inte
  se ut som sina syskon — kunden ska inte känna igen "fabriken".
- **Subagentens marquee-rad "Skickas från Sverige" ströks av huvudsessionen.**
  Leveransen går på Temu-ledet (5–10 arbetsdagar), och påståendet går inte
  att belägga. AdventLanes startsida bär samma rad — den bör ses över.
  Huvudsessionen granskar varje faktapåstående i copyn, inte bara
  tre-frågorstestet.
- **Markörfiltret släpper bara HELA värden.** `filtreraMarkorer` tar bort ett
  markörord från /nb-skanningen bara om ordet är ett helt värde som är
  identiskt i sv- och nb-filen. "utekatt" och "under bilen" är samma ord på
  norska men står inne i meningar — de flaggades som läckor i två QA-rundor
  fast sidan var korrekt. Regeln för `markorer_sv` är därför: lista bara ord
  som faktiskt SKILJER sig på norska (kommentaren i mallen "filtreras bort av
  sig själva" gäller bara hela värden som "Köp nu").
- **Fel primärmarknad gör varje variant osäljbar — och kedjan såg det inte.**
  Efter checklistans avsnitt 2 (valuta PHP → SEK, "Sweden is the primary
  market") stod butiken med **Norge som primärmarknad** och den gamla
  Filippinerna-marknaden omdöpt till "Sweden" (handle `ph`, region Sverige).
  Kundvyn: `available: false` på alla tre varianter i VARJE marknadskontext
  (default, SE, NO, PH), `compare_at_price: null` — så `ms-paket.liquid` och
  `ms-sticky-atc.liquid`, som båda börjar med `{%- if p.available -%}`,
  renderade ingenting. Symptomet såg ut som ett temafel ("paketväljaren
  finns inte", "sticky köpknapp saknas") medan temat var helt. Uteslutet på
  vägen: temafilerna (product.json bar blocken), `ms_ab_tests` (kvar),
  metaobjektens access (PUBLIC_READ), lagerpolicyn (CONTINUE, untracked,
  lagernivå på aktiv plats), publiceringen (Online Store), katalogerna (även
  TackleBay saknar marknadskataloger och säljer) och platsens land (TackleBay
  har också Filippinerna). Det enda som skiljde mot TackleBay var
  primärflaggan. Primärmarknaden går INTE att sätta via API
  (`API-GRANSER.md`, mätt) — klicket är Settings → Markets → Sweden →
  Set as primary. Kedjans steg `huvudmarknad` kontrollerade bara valutan och
  var grönt hela tiden; nu kontrollerar det också att primärmarknadens region
  är butikens land (`marknad.kontrolleraPrimarmarknad`). Efter klicket var
  kundvyn grön igen (11 strukturpunkter) — men **Norge-marknaden var borta**
  (bara Sweden kvar): den försvann i admin-klicket. `--igen marknad` skapade
  om den på trettio sekunder (locale nb och alla registrerade översättningar
  låg kvar, de sitter på localen, inte på marknaden). Regel: efter varje
  Markets-klick av en människa, kör `--igen huvudmarknad,marknad` och läs
  trippelkollen.
- **Källkampanjen läses per annons innan vinkeln väljs.** 16 annonser,
  2 760 kr / 9 köp på två dygn: bara `Utekattkoja_PD_2_H1` (1 453 kr, 4 köp)
  låg över domgränsen 300 kr / 3 köp (CLAUDE.md regel 3). Problem-rubriken
  på produktsidan är därför ordagrant den annonsens vinkel. `creative{body}`
  var tomt på alla 16 — vinkelkoden i namnet är det som går att läsa.

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

## Marknaden är pausad av ägaren (skrivet 2026-09-13, HeimGuard NO)

Ett tillstånd som saknade rutin tills det inträffade: Axel pausar en marknads
kampanj för hand, och de tre rutinerna fortsätter köra varje dag. Så här gäller
det, för varje OPS-butik och varje marknad:

1. **Kön hålls.** Ingen rad flyttas, ingen status ändras i Notion, inget
   laddas upp. Raderna ligger kvar i sin status tills kampanjen är ACTIVE igen.
2. **Inget renderas.** HeyGen-credits dras aldrig för en marknad som är av.
   Spärren ska sitta FÖRE renderingen, inte efter.
3. **Rapporten säger vad som gäller**, inte "kampanjen saknas":
   `market paused by owner since <tid>, N rows held`, plus vad marknaden
   tjänade eller kostade innan pausen. Föreslå aldrig `/ny-annonser` —
   det bygger en andra kampanj bredvid den pausade.
4. **Bara ägaren slår på den igen.** PAUSED med spend är ett beslut. Först när
   kampanjen är ACTIVE tömmer nästa körning kön.
5. **Den andra marknaden påverkas inte.** SE-leveransen körs vidare som vanligt
   även när NO är av — mätt 2026-09-13: Axel pausade båda HeimGuards kampanjer
   11:06, slog på SE igen 15:06 och lät NO ligga kvar.

⚠️ **Nattvakten ser bara SE.** `budgetrond.mjs` kör med `STANDARDMARKNAD='SE'`,
så ingen NO-kampanj i något OPS-konto har någonsin varit med i en budgetrond
(mätt 2026-09-13: sex NO-kampanjer, 17 522 kr spend, tre ACTIVE). En pausad
NO-kampanj bevakas alltså inte heller — men en ACTIV gör det inte heller, och
det är det farliga fallet. Skriv aldrig i en rapport att butiken är bevakad
utan att säga vilken marknad som menas.

## Marknad utanför Norden — USA (byggt 2026-09-16, Axels fråga "husbilsgrejerna i USA")

Kommandot är **`/ny-marknad <butik> <LAND>`** (`.claude/commands/ny-marknad.md`):
Fas 4 körd i efterhand på en butik som redan är live. Det som byggdes för att
en icke-nordisk marknad skulle vara EN rad + en körning, inte ett nytt bygge:

1. ⚙️ **`factory/lander.mjs` — EN landstabell.** Till 2026-09-16 låg samma
   landskod → namn-karta kopierad i sex moduler (butik, checklista, frakt,
   marknad, startsida, tema) och ingen kände USA. Nu: `landsnamnSv`, `landEn`,
   `sprakEn`, `lokalValuta`, `standardLocale`, `landskodUrNamn`, `ochLista`.
   Nytt land = en rad där. Tre länder skrivs "Sverige, Norge & USA", aldrig
   "A & B & C"; två länder ser exakt ut som förut.
2. ⚙️ **Temat är N-språkigt, inte nb-eller-svenska.** `tema.localeBranch(sv,
   { nb, en })` ger `if/elsif/else`; sektionernas standardrubriker, upsellen,
   svensk-signalen, trust- och leveransraden och kryssrutan har en gren per
   språk i `butik.marknader`. Orden står i `TEMAORD` (sv/nb/en) — nytt språk =
   en kolumn, ingen if-sats. `patchaMsPaket(snippet, locales)` **avpatchar**
   en snippet som redan bär nb-grenen och bygger om med alla språk, så en
   butik som får USA i efterhand får sin en-gren vid `--igen tema` utan att
   någon rör snippeten för hand. `ops.mjs` steg `tema` läser
   `oversattning-<locale>.json` för VARJE marknadsspråk.
3. ⚙️ **Leveranstid per marknad.** `leveranstid` på raden i `butik.marknader`
   styr den översatta leveransraden på produktsidan. USA från Sverige är inte
   5–10 arbetsdagar — utan raden ärvs butikens tal och löftet blir falskt.
4. ⚙️ **`i_fraktraden: false`** på en marknadsrad håller landet utanför den
   SVENSKA fraktraden/startsidan. Standard för ett land utanför Norden: den
   svenska källtexten ändras då inte, så den norska filen matchar fortfarande
   och inget läcker på /nb; engelskan säger sitt i sin egen fil.
5. ⚙️ **Steget `prislista` (17b).** NOK-priset sattes 2026-09-11 med tre
   lösa anrop (API-GRANSER.md) och fanns aldrig som kod. Nu
   `factory/prislista.mjs`: prislista + marknadskatalog + fast pris/jämförpris
   per variant ur `ekonomi.marknadspriser`, idempotent, med tillbakaläsning.
   🖐 tills valutan är marknadens basvaluta i admin — då med klicket i
   klartext, inte Shopifys userError. **Första riktiga körningen 2026-09-16
   (CaraShell, `/ny-marknad carashell US`):** steget körde utan fel, läste
   `market.currencySettings.baseCurrency` på den nyskapade marknaden USA och
   fick **null** ("basvalutan är okänd") — en marknad som API:t just skapat
   har ingen basvaluta förrän klicket är gjort. Utfallet blev exakt det
   avsedda: 🖐 med klicket i klartext, noll prislisteanrop skickade, NOK-raden
   (redan FIXED) orörd. Produkt 2 utan USD-rad (termoskyddet) gav sin egen
   🖐 "kunden ser då SEK" — inte ett stopp. **Femton minuter senare var USD
   påslagen i admin** (mätt 06:58: `Shopify.currency` USD, kurs 0,1044 —
   klicket gjordes utanför sessionen), och `--igen prislista,paket` gick då
   hela vägen: prislistan `PriceList/33459372364` fick 199/249 fast, paket-
   nivåerna sina USD-rader, och som amerikansk kund stod **$199.00 /
   $249.00 / paket $338.30, $477.60**. Produkten utan USD-rad visas med
   Shopifys egen omräkning ($59.00 för 559 kr) — läsbart, men inte ett pris
   ägaren valt. Axel svarade "99 dollar" på rapportens fråga samma
   förmiddag; raden skrevs in och `--igen prislista,paket` gav **$99.00 /
   $124.00 / paket $168.30, $237.60** — samma prislista, en produkt till.
   Frågan-med-alternativ i rapporten fungerade: ett tal tillbaka, ett steg.
6. ⚙️ Kundvyn känner igen "Add to cart"/"Buy now" som köpknapp. `sprakkoll.mjs`
   är fortfarande bokmål-only — engelskan läses av markörskanningen
   (`markorer_sv`) och ett öga.
7. 🖐 **Det API:t inte kan, i ordning:** USD som marknadens valuta (Inställningar
   → Marknader → USA → Valuta), sales tax (Skatter och tullar → USA), Shopify
   Payments accepterar USD, fraktpriset till USA bekräftat hos leverantören.
   **Axels svar 2026-09-16 (CaraShell):** sales tax ska vara AV — "det löser
   jag i efterhand med min revisor, kunderna ska inte få något påslag", så
   köpvillkorens "prices include any applicable tax" står kvar som de är;
   Shopify Payments i USD är fixat; leverantören skickar till USA på 5–10
   arbetsdagar. Skriv aldrig in sales tax som ett klick igen för CaraShell.
8. ⚙️ **Annonserna — byggda samma dag (Axels beslut: "Detta blir Magiborsten
   UK till för").** Kontot är PER MARKNAD i `factory/opsmarknader.mjs`: SE/NO
   i OPS-kontot, **US i Magiborsten UK `1107817401910319`** (SEK, tidszon GB,
   avläst ur Meta 2026-09-16). Kedjan: `register.mjs annonsmarknader
   <nyckel> NO,US` → `kampanj.mjs <produkt> --marknad US --tom` (tom CBO-kampanj
   + ett adset per vinkel ur SE-kampanjen, geo US, länk `/en/products/<handle>?
   country=US`, allt PAUSED) → `/ops-oversatt <butik> --marknad US` varje dag
   17:05 (plats 5) fyller den ur samma kö som NO (`SE-ACTIVE to be translated`),
   HeyGen "English (United States)", USD-pris ur `ekonomi.marknadspriser`.
   Raden går till `Approved` först när ALLA butikens annonsmarknader bär
   annonsen (`klar_i` / `flytta_till_approved` i kön). **Mätt på CaraShell
   2026-09-16:** kampanj `120251436741400435` i UK-kontot, 5 adsets (CS, G,
   GT, PD, SP), 0 annonser; CaraShells pixel `28589207184025756` GODTOGS som
   promoted_object i UK-kontot utan delning i BM (adspixels-listan visade den
   inte, men anropet gick igenom). Rutin `trig_014kMRzqVj2yFArGEvGs3d9R`,
   fast session `session_01V7x9YoFdr4ph1PnTs8dno3`, cron `5 15 * * *`.
   ⚠️ **CBO-lärdom:** en kampanj skapad med `daily_budget` men UTAN
   `bid_strategy` får `LOWEST_COST_WITH_BID_CAP` av Meta, och varje adset
   svarar då 400 "bid_amount krävs" — strategin ska sättas på KAMPANJEN
   (`LOWEST_COST_WITHOUT_CAP`), aldrig på adsetet. `--tom` är idempotent och
   rättar det på en återanvänd kampanj. Kampanjen står PAUSED utan spend tills
   Axel slår på den — och det ska ske först när `/en` svarar (`/ny-marknad`);
   kön hålls annars av rutinen (priset läses på marknadens sida). Nattvakten
   ser fortfarande bara SE (`STANDARDMARKNAD`) — US-kampanjen bevakas inte av
   budgetronden.
9. ⚠️ Juridiken översätts, byts inte: den engelska policyn säger "under
   Swedish law" och behåller EU-tvistplattformen. Om amerikanska kunder ska ha
   en egen returpolicy är Axels beslut — rapporten flaggar det varje gång.
10. ⚙️ **Shopify skapar en sida själv när USA läggs till** (mätt CaraShell
   2026-09-16 06:42:53Z, samma minut som `marknad`-steget): "Dina
   integritetsval" (handle `data-sharing-opt-out`, amerikanska delstaters
   "Do not sell or share") + en sidfotslänk med samma titel, på butikens
   primärspråk. Ingen kod i repot skrev den, och den låg som **3 läckor på
   BÅDE /en och /nb** (titel, body, menylänk) — den norska sidan hade alltså
   fått en svensk sida utan att någon rört norskan. Sedan samma dag bär
   `factory/shopify-sidor.mjs` Shopifys text byte för byte, `oversattning.mjs`
   lägger nyckeln `sida.data-sharing-opt-out.*` i underlaget, och varje
   `oversattning-<locale>.json` ska ha den ifylld (en + nb skrivna av
   subagent). Med nyckeln ifylld: `--igen oversatt` ⇒ **0 läckor på /en och
   /nb**, `/en/pages/data-sharing-opt-out` svarar "Your privacy choices" och
   `/nb/…` "Dine personvernvalg" (mätt samma dag). Ändrar Shopify sin
   formulering syns sidan som läcka igen — läs om den med
   `page(id:…) { title body }` och byt texten i modulen. Sidan tas aldrig
   bort: den är USA-kundens lagstadgade opt-out.
11. ⚙️ **Enheter i engelskan är en substansfråga, inte en översättning.**
   Subagentens första version skrev "thirty degrees warmer" för "trettio
   grader varm" — för en amerikan är 30° kallt. Rättat till "86 °F (30 °C)".
   Ge subagenten de imperiala måtten färdigräknade i briefen (6,5 × 3 m =
   21.3 × 9.8 ft, 211 cm = 83 in …) och läs varje siffra i den engelska
   filen en gång själv; modellen räknar inte om enheter av sig själv.
12. ⚙️ **Kundvyn som amerikansk kund** (mätt 2026-09-16): `POST /localization`
   med `country_code=US`, `language_code=en`, `_method=put` → 302, sedan GET
   `/en/products/<handle>` → `Shopify.country = "US"`, `lang="en"`, "Add to
   cart"/"Buy now" — och `Shopify.currency = SEK` tills USD är påslagen
   (punkt 7). Tre svenska rester som kundvyn inte räknar men ögat ser:
   Judge.me-recensionerna (svenska tills VA:n importerat
   `output/<produkt>/judgeme-import-en.csv`), bildernas alt-texter (media-alt
   ligger inte i underlaget — samma lucka på /nb) och Judge.me-widgetens
   knapp "Köp nu" (appinställning, inte temat).
   **Recensionerna på /en — läst i Judge.mes hjälpcenter 2026-09-16 efter
   Axels fråga "går det inte att den auto-translatear?":** ja, men det är en
   betalfunktion. *Multi-language widgets* (knappar, rubriker, formulär på
   kundens språk) är gratis: Settings → Language → Widgets and translations →
   "Enable multi-language widgets". *Review translations* (själva
   recensionstexten översätts till språket kunden surfar på, med "Show
   original") kräver **Awesome-planen**: samma sida → "Enable review
   translations" → "Translate reviews automatically"; kräver nya Review
   Widget, språket publicerat i Shopify (en är det), upp till 48 h innan
   språket känns igen. ⚠️ Norska: widgetspråket triggas bara av locale `no`,
   inte `nb` — våra butiker har `nb`, så på /nb faller widgeten tillbaka på
   svenska även med funktionen på. Mätt samma dag på carashell.se: 10
   svenska recensioner live på både `/products/takskyddet` och `/en/…`,
   widgetknappen "Skriv en recension" även på /en ⇒ inget av detta var
   påslaget. **Alternativet i repot** (`judgeme.mjs byggJudgeMeAppCsv`) är
   att importera de översatta raderna som EGNA recensioner — då ser varje
   kund alla språk blandade (10 sv + 6 nb + 6 en på samma sida), vilket är
   precis det Axel inte vill ha. **Axels val samma dag: Awesome.** Han köpte
   planen och slog på multi-language widgets + "Translate reviews
   automatically"; Judge.me sa "upp till 48 timmar". Mätt minuter senare på
   `/en/products/takskyddet`: knappen "Write a review" fanns redan, texterna
   fortfarande svenska, ingen "Show original" ännu. Butiksfilen bär
   `judgeme.auto_oversattning: true`, och `ops.mjs` recensioner bygger då
   app-CSV:n med BARA originalen (de översatta CSV:erna skrivs som reserv).
   Sätt flaggan i varje ny butik som får planen — annars importerar VA:n
   blandade språk.
   ✅ **Verifierat 2026-09-17 09:10–09:40 UTC (påminnelsen), ~26 h efter
   påslaget, i headless Chrome från containerns amerikanska IP:**
   `carashell.com/products/takskyddet` — "Customer Reviews", "16 reviews",
   knappen "Write a review", rubriken "Reviews in Other Languages", texterna
   på engelska ("Simple solution and good fit.") med länken "Show original
   (Swedish)". `carashell.com/products/termoskyddet` — samma, "20 reviews",
   en rad med "Show original (Norwegian)" (en norsk originalrecension).
   `carashell.se/nb/products/takskyddet?country=NO` — "Kundeanmeldelser",
   "Skriv en anmeldelse", norska texter med "Vis original (svensk)".
   ⚠️ **Varningen ovan om `nb` var fel:** widgeten översätts till norska
   med locale `nb` också, både knappar och recensionstext. Stryk den ur
   huvudet. ⚠️ **Ny sak på /nb:** `/no-recensioner` importerade norska
   KOPIOR av de svenska recensionerna (Linda "Enkel løsning og god
   passform." ligger som egen norsk rad), och auto-översättningen visar
   nu den svenska originalraden på norska under "Anmeldelser på andre
   språk" — samma recension två gånger på sidan. För en butik med Awesome
   är den norska importen alltså överflödig; beslut om `/no-recensioner`
   ska hoppa över sådana butiker är Axels (fråga ställd 2026-09-17).

   ⚠️ **Judge.me går INTE att läsa av ur serverside-HTML.** Widgeten ritas
   av appens JavaScript efter att sidan laddats, så det som står i den råa
   HTML:en är ett förstadium som ingen kund ser.

   *Felet, för att det inte ska göras om (2026-09-18):* Axel såg
   "★★★★★ 16 recensioner" på /fi och frågade om auto-översättningen bara
   behövde tid. Sessionen hämtade tre adresser med `fetch`, såg
   "16 recensioner" i HTML:en på alla tre — även på carashell.com, där
   widgeten bevisligen är engelsk sedan 2026-09-17 — och drog slutsatsen
   att badgen aldrig översätts. **Fel.** Axel tittade i en riktig
   webbläsare och såg engelska på .com. Råtexten var densamma på båda;
   skillnaden uppstår först när JS kört.

   Vad HTML:en ÄNDÅ säger, och som är läsbart: Judge.mes konfigblock bär
   ett `"locale"`-fält. Mätt samma dag — /nb → `nb`, carashell.com → `en`,
   **/fi → `en`**. Ett språk appen känner igen står med sin egen kod; /fi
   faller tillbaka, vilket är väntat samma dag som språket publicerades
   (nytt språk tar upp till 48 h; engelska tog ~26 h). Det fältet duger
   som signal — den synliga texten gör det inte.

   ✅ **Svaret från Judge.mes support 2026-09-18, och lösningen:** finska ÄR
   ett stött språk. Appen upptäcker bara inte ett nytt Shopify-språk av sig
   själv — *"After publishing a language in Shopify, it can take up to 24 hours
   for our system to pick it up… your current widget language is set to
   Swedish, which is the fallback when a language isn't detected yet."*
   🖐 **Klicket, en gång per ny marknad: app.judge.me → Settings → Language →
   "Refresh list"**, sedan upp till 24 timmar. Ligger nu som eget steg i
   `.claude/commands/ny-marknad.md`. `locale`-fältet var alltså rätt signal
   hela tiden: det säger om appen känner igen språket, och supporten beskrev
   exakt samma fallback.

   ✅ **Löst samma dag 12:02 UTC — klicket räckte, väntan behövdes inte.**
   Axel klickade "Refresh list" och finskan slog igenom direkt; de "upp till
   24 timmar" supporten nämnde är ett tak, inte en väntetid. Mätt minuter
   efteråt på fyra adresser:

   | Sida | locale | |
   |---|---|---|
   | carashell.se/fi | `fi` | ✅ |
   | carashell.se/nb | `nb` | ✅ |
   | carashell.com | `en` | ✅ |

   **Räkna alltså inte bort ett nytt språk förrän klicket är gjort.** Hela
   dygnet mellan "finska publicerad i Shopify" och "widgeten finsk" var
   väntan på ett klick ingen visste om — inte en bugg och inte en
   detekteringstid.

   ⚠️ **Öppen observation, inte mätt färdigt:** butikens EGEN svenska vy
   (`carashell.se/` och båda produktsidorna med `?country=SE`) rapporterar
   `locale: en` medan `branding_text` samtidigt är svenskt
   ("Drivs av Judge.me"). De två säger emot varandra, och vad kunden faktiskt
   ser går inte att läsa ur HTML:en (widgeten ritas av JS). Troligen
   ofarligt — grundspråket behöver ingen detektering — men kolla den svenska
   produktsidan i en webbläsare nästa gång någon är där.

   🖐 **Kontrollen kräver en webbläsare, och containern klarar den inte.**
   Headless Chrome mot butiken ger `ERR_CERT_AUTHORITY_INVALID`: Playwrights
   Chromium läser inte proxyns CA-bundle, `certutil` finns inte och
   `libnss3-tools` går inte att installera (provat 2026-09-18). Att stänga
   av TLS-verifieringen är inte ett alternativ. Judge.me-språk verifieras
   därför av en människa i en vanlig webbläsare, eller där nätet är öppet —
   aldrig med `fetch` mot produktsidan.
   ⚠️ Mätmetod: recensionslistan laddas lazy — `--dump-dom` och Judge.mes
   `reviews_for_widget` gav 0 kroppar; det som fungerade var
   `--screenshot` med `--window-size=1280,9000` och en beskärning av
   widgetområdet (Pillow), sedan titta. curl ser bara `jdgmSettings`
   (knapptexterna), aldrig översättningen. `carashell.se/nb/…` utan
   `?country=NO` skickas från amerikansk IP om till carashell.com, och
   `/localization`-cookien gav 429 tre gånger — parametern räcker.
13. ⚙️ `kundvy-kor.mjs`:s reservkoll av rabattkoderna (`trippelkoll.kodkoll`)
   läste bara `amount` och dömde varje PROCENT-kod som "−NaN kr" — fyra röda
   rader på koder som stämde (CaraShell 2026-09-16). Rättad: jämför procent
   mot procent, belopp mot belopp, samma slag som `paket.mjs` skrev.
14. ⚙️ **Shopify väljer marknad efter besökarens IP — och containern står i
   USA.** Så fort USD var påslagen svarade `/` (svenska vyn) med
   `Shopify.country = "US"` och dollarpriser för kundvy-verktyget, och
   huvudspråkets priskoll blev röd ("1129 syns inte") fast butiken var rätt;
   curl utan browser-huvuden fick SE hela tiden, så felet syntes bara i
   verktyget (mätt 2026-09-16 07:0x). `kundvy-kor.landPerLocale` +
   `sattLokalisering` läser nu varje vy som kund i RÄTT land (`/` = butikens
   land, `/nb` = NO, `/en` = US) — deterministiskt oavsett var koden körs,
   och det är dessutom exakt vad `/ny-marknad` steg 7 vill se. Gäller QA:n i
   `ops.mjs` också (samma kctx).
15. ⚙️ **Varumärkesstrippen (`opf_svensk`) fick aldrig sin en-gren.** Blocket
   var "idempotent — finns det rörs inget", så en butik som fick ett språk i
   efterhand behöll bara nb-grenen: `/en/products/takskyddet` visade
   "🇸🇪 Svenskt varumärke – framtaget för svenska hem" (läst som amerikansk
   kund 2026-09-16, efter att Axel bett mig läsa sidan som amerikan).
   Kundvyn såg det inte — orden stod inte i `markorer_sv`. Rättat: blocket
   skrivs om ur dagens språk varje `--igen tema` (platsen behålls), test i
   `tema.test.mjs`, "Svenskt varumärke" som markör i CaraShells butiksfil.
   Engelskan byttes samtidigt till "Swedish brand – designed for Scandinavian
   conditions" — "Scandinavian homes" lät fel för ett taköverdrag.
16. 🖐 **Amerikanens tvekan — läst 2026-09-16 på `/en` som US-kund, Axels
   fråga "vad hade fått dig att tveka".** Kvar efter fixarna ovan, i
   fallande ordning; alla är ägarbeslut:
   - **Domänen `.se` och `hello@carashell.se`** — det första en amerikan ser.
     `carashell.com` var ledigt 2026-09-10 (BRAND.md); Shopify Markets kan
     ge USA-marknaden en egen domän.
   - **"14-day right of withdrawal under Swedish law"** står fem gånger
     (USP-rad, marquee, FAQ, garanti). EU-juridiska ord; amerikanen läser
     "utländsk butik, krångligt". Samma substans går att säga som "14-day
     return policy" i USP/marquee och behålla "under Swedish law" på
     policysidorna. Returfrakt till Sverige på kundens bekostnad står i
     returpolicyn — dyrt för en amerikan.
   - **Storleken:** 21.3 × 9.8 ft "covers the whole roof surface" — de flesta
     amerikanska travel trailers och motorhomes är 25–40 ft. Titeln lovar
     mer än måtten håller; "for rigs up to 21 ft" i titel/USP är sant och
     spar returer.
   - **Tull:** "Ships from Sweden" + "Free shipping to the US" — USA tog
     bort tullfriheten för småpaket 2025, så kunden kan få en avgift vid
     dörren om frakten inte är DDP. Fråga leverantören vem som betalar och
     skriv det på sidan.
   - **Recensionerna:** svenska namn + svensk/norsk text tills Judge.me
     översatt (48 h); "16 recensioner" i badgen är Judge.mes egen text och
     byter språk när widgeten synkat.
   - Bara mejl, inget telefonnummer; "Taxes included" är ovanligt i USA men
     inte fel (Axels beslut: inget påslag).
17. 🖐 **Pixeln måste delas med marknadens annonskonto** (mätt 2026-09-16,
    CaraShells första US-runda). Butikens pixel skapades i OPS-kontots
    business; `kampanj.mjs --tom` skrev in den i US-adsetens
    `promoted_object` och Meta accepterade bygget — men varje annons som
    laddas upp får HARD_ERROR 1815045 "Kontot har inte åtkomst till pixeln"
    (konto `1107817401910319` mot pixel `28589207184025756`), och kampanjen
    kan inte köra. Felet syns först på annonsnivå, aldrig vid kampanjbygget.
    Axels klick, en gång per butik: Business Settings → Data sources →
    Pixels → butikens pixel → Assigned assets → Add assets → annonskontot
    Magiborsten UK. Adsetens `promoted_object` behöver inte röras efteråt.
    Rutinen `/ops-oversatt … --marknad US` lägger raden under ACTION NEEDED
    tills den försvinner ur `issues_info`.
18. ⚙️ **Första US-annonserna för en produkt ligger ofta redan i `Approved`.**
    Raderna översattes till NO innan US fanns, och rutinen läser bara
    `SE-ACTIVE to be translated`. Kör kön en gång med `--status Approved`:
    `klar_i` dömer per rad vilka marknader som saknas, så inget laddas upp
    två gånger (dubblettspärren mot kontot håller också). Textlager-bilder
    ritas om från basfotot — se `.claude/commands/ops-oversatt.md` steg 3.
19. ⚠️ **Två konton på samma produkt samma dag = samma jobb två gånger.**
    Mätt 2026-09-16 på CaraShell US: den här sessionen och Axels andra konto
    körde `/ops-oversatt … --marknad US` parallellt, båda renderade alla tolv
    videor i HeyGen (dubbla krediter), och bara dubblettspärren i
    `tools/ops-till-meta.mjs` (annonsnamn mot kontots alla annonser) hindrade
    att kampanjen fick 24 videor. Innan en manuell körning: läs kontot
    (`ops-leveranskon … --status Approved`) — `finns_i_meta` säger vad som
    redan ligger uppe — och kolla `git log origin/main` för samma batchmapp.
    Rutinerna kolliderar inte (en fast session per butik och marknad).

19. ⚙️ **Egen domän per marknad — carashell.com för USA (Axels beslut
   2026-09-16, "domänen?").** Axel kopplade carashell.com + www i Shopify
   (Settings → Domains); den låg som 301 → carashell.se tills marknaden fick
   den. API:t KAN: `webPresenceCreate({ domainId, defaultLocale: "en",
   alternateLocales: [] })` + `marketUpdate(USA, { webPresencesToAdd: [ny],
   webPresencesToDelete: [.se-närvaron, myshopify-närvaron] })` — mätt samma
   dag, tillbakaläst `USA → carashell.com/en`, och `carashell.com/products/
   takskyddet` svarar 200 med `Shopify.locale en`, `Shopify.country US`, USD.
   `carashell.com/en/…` ger 404 (språket är standard på domänen — ingen
   mapp), `carashell.se/en/…` svarar fortfarande. Därför bär marknadsraden
   `doman: carashell.com` och `opsmarknader.marknadslank` bygger länken utan
   /en/ när raden har egen domän (`kampanj.mjs`, `ops-leveranskon`,
   `ops-till-meta` går alla den vägen). Mejlen på /en: hello@carashell.com.
   ⚠️ www.carashell.com svarar bara över IPv4 (301 → carashell.com); över
   IPv6 tog anslutningen inte — containerns nät, inte butiken.
20. 🖐→⚙️ **Axels USA-beslut 2026-09-16 efter tvekan-listan:** 90-dagars
   garanti ("90-day guarantee" / "Try it risk-free for 90 days") ersätter
   "14-day right of withdrawal" i HELA den engelska texten, inklusive
   returpolicy och köpvillkor — ett uttryckligt undantag från regeln "alltid
   svensk lag, aldrig egna köplöften" (2026-09-08), för USA-marknaden enbart;
   svenska och norska sidorna säger fortfarande 14 dagar. Returpolicyn
   säger INTE vem som betalar returfrakten till Sverige — det är fortfarande
   öppet (fråga till Axel i rapporten). "Ships from Sweden" struken ur
   marquee:n, "🇺🇸 Free shipping to the US" i stället. Titeln "Roof Cover
   for Travel Trailers & Motorhomes up to 21 ft (6.5 × 3 m)". Storleken,
   sales tax (av), telefon (inget) var hans övriga svar.
   ⚠️ Sidfotens "Ångra köp"-länk (Shopifys självbetjänade ångring,
   `angerratt.mjs`) stod som "Contact" i en-filen och "Kontakt" i nb-filen —
   subagenterna hade tappat en rad i sidfotsmenyn. Rättat: "Return an order"
   / "Angre kjøp". Läs sidfoten på varje /<locale> när menyn ändras.
21. ⚙️ **Cookie-rutan och Judge.me:s knapptexter — mätt 2026-09-16 kväll,
   inget ändrat (Axels order: vänta).** Två frågor från Axel, båda besvarade
   med mätningar i stället för gissningar:
   - **"Stäng av cookie-grejen i USA."** Den är redan av för amerikaner.
     `privacySettings.banner` är `autoManaged: true`, och Shopifys egen
     samtyckestabell (`consentPolicy`, 319 rader) säger `consentRequired:
     false` på alla 52 US-rader — bara `dataSaleOptOutRequired: true` i 15
     delstater (CA, CO, CT, DE, FL, IA, MT, NE, NH, NJ, OR, TN, TX, UT, VA),
     vilket ger en "Your privacy choices"-sida, ingen ruta. Renderat i
     headless Chrome från containerns IP (Ohio): ingen ruta, ingen
     integritetslänk i sidfoten. **Rutan följer besökarens land, inte
     domänen** — SE och NO står `consentRequired: true`, så Axel ser den på
     carashell.com för att han sitter i Sverige. Att ta bort den för honom
     vore att ta bort den för svenska kunder. Appen har
     `read_privacy_settings` + `write_privacy_settings` (fler än
     `KRAVDA_SCOPES`), så `consentPolicyUpdate` GÅR — men det finns inget
     att göra.
   - **"Gör engelska till primärspråk så Judge.me funkar."** Judge.me:s
     egen hjälpartikel (8389840) säger motsatsen: välj i **Settings →
     Language** det språk som matchar butikens *default published
     language* (svenska) i "Widget and notification emails language",
     bocka **"Enable multi-language widgets"** under "Widgets and
     translations", Spara — sedan översätts knapptexterna automatiskt per
     Shopify-språk (gratisplanen räcker; "Refresh list" eller upp till 24 h
     innan språket syns). Sidan bar 2026-09-16 kväll `jdgmSettings` med
     enbart svenska texter på /en ⇒ rutan är sannolikt inte ibockad.
     **Byte av primärspråk är dessutom dyrt och farligt:** Shopify raderar
     befintliga översättningar för språket man byter TILL (de 150 en-raderna),
     översätter inget själv, tar bort svenska som språk tills det läggs
     till igen som översättning — och hela fabriken är svensk-först
     (`oversattning.mjs` läser underlaget ur resurserna, `TEMAORD` med `''`
     = sv, `kundvy-kor`, alla andra OPS-butiker). Kassan är inget argument:
     Shopify översätter kassan per publicerat språk oavsett vilket som är
     primärt. Rekommendation: rutan i Judge.me, aldrig språkbytet.
22. ⚙️ **Ett ENGELSKT MARKNADSBLOCK — GB, CA, AU, NZ i USA-marknaden (byggt
   2026-09-17, Axels order "Nya Zeeland, Kanada, UK och Australien, samma
   annonser, lanserar i dag").** Fem mätningar styrde formen:
   - **En egen domän hör till EN marknad.** `marketUpdate(webPresencesToAdd:
     [carashell.com])` från en nyskapad GB-marknad svarade `RESOURCE_NOT_FOUND`
     på presencen. Egna marknader per land hade alltså krävt `carashell.se/en-gb/`
     (Axel sa nej till .se för USA) eller fyra subdomäner med DNS-klick. Därför:
     länderna läggs i USA-marknaden. Raden i `butik.marknader` bär det som
     `lander: [GB, CA, AU, NZ]` (blocklista — yaml-parsern tar inte `[a, b]`)
     + `lokala_valutor: true`; `marknad.mjs sakerstallMarknad` lägger till
     regionerna med `conditions.conditionsToAdd.regionsCondition.regions` och
     läser tillbaka.
   - **`currencySettings.localCurrencies: true` via API GÅR — och slog själv
     på AUD, CAD, GBP och NZD i Shopify Payments** (`enabledPresentmentCurrencies`
     gick från NOK,SEK,USD till AUD,CAD,GBP,NOK,NZD,SEK,USD i samma sekund).
     Axels "jag ordnar valutorna" behövdes inte.
   - **Priserna är Shopifys omräkning av de FASTA USD-priserna** (prislistan i
     marknadens basvaluta), inte av SEK: takskyddet $199 → £152 / C$285 /
     A$286 / NZ$354, termoskyddet $99 → £76 / A$143 / NZ$177 (mätt som kund
     per land med `?country=XX` på carashell.com, 2026-09-17 13:30 UTC; ECB
     samma dag $199 = £148 — Shopify lägger ~2–3 % och rundar till hela).
     Fasta x9-priser per valuta kräver en egen marknad per valuta = egna
     subdomäner. Inte gjort; Axels val.
   - **Frakten var redan klar:** zonen "Internationell" (`frakt.fri_globalt`)
     bar AU, CA, GB, NZ med "Fri frakt 0 SEK" sedan bygget.
   - **Den engelska texten är EN fil för alla fem** (locale en). "Free shipping
     to the US" / 🇺🇸 byttes av en sonnet-subagent till "🇺🇸 🇬🇧 🇨🇦 🇦🇺 🇳🇿 Free
     shipping", FAQ "Which countries do you ship to?", köpvillkoren "Prices are
     shown in your local currency (USD, GBP, CAD, AUD or NZD)". Leveransraden
     (5–10 business days) och 90-dagarsgarantin gäller därmed alla fem —
     substansfrågor till Axel, inte översättning.
   ⚠️ **Bugg hittad och rättad samma dag: `--igen marknad` bröt domänbeslutet.**
   `kopplaPresence` kopplade ALLA presences till varje marknad och
   `laggTillAlternateLocale` la nb på alla — så USA-marknaden fick .se +
   myshopify tillbaka och carashell.com fick /nb. Nu respekterar `marknad.mjs`
   radens `doman:`: bara den presencen på marknaden (andra kopplas loss), och
   andra marknaders egna domäner hoppas över (befintligt språk tas bort).
   Mätt efteråt: USA = carashell.com(en), Norge = .se + myshopify (sv+nb/en).
   ⚠️ **Två sessioner på samma butik samma förmiddag:** medan detta byggdes
   gjorde en annan session om takskyddet till nio storleksvarianter
   (5,5–13,5 m) med egen köpruta (`snippets/ms-paket.liquid` + css). Mitt
   första `--igen tema` gick med gammal kod och skrev den gamla köprutan;
   `main` mergades och stegen kördes om — kundvyn grön, väljaren kvar. Regeln
   "en session per butik" gäller fabriken lika mycket som annonserna.
   ⚠️ **Annonslänken bär LANDETS egen kod, aldrig USA:s:** `?country=US`
   låser valutan till USD för en britt. En kampanj per land (Axels väg
   2026-09-17: duplicera US-kampanjen, byt geo i adsetet) länkar
   `https://carashell.com/products/<handle>?country=GB` / `CA` / `AU` / `NZ`
   — mätt: parametern ger rätt valuta oavsett IP. Utan parameter väljer
   Shopify land på IP, vilket också fungerar men gör första renderingen
   IP-beroende.
   🖐→⚙️ **Axels beslut 2026-09-17 på rapportens tre frågor:** UK-momsen
   löser han själv, sälj ändå (alternativ C); leveranstiden är 5–10
   arbetsdagar till alla fem (leverantören) — den delade en-raden är alltså
   sann; annonserna byggs av honom som kopior av US-kampanjen per land.
   🖐 **Skatt och tull är det som återstår, och det är ägarens:** UK — varor
   ≤ £135 ska bära brittisk moms vid kassan och säljaren måste vara
   UK-momsregistrerad, utan omsättningsgräns (gov.uk, läst 2026-09-17);
   termoskyddet £76 faller under, takskyddet £152 över (då tar transportören
   importmoms + tull + avgift av kunden vid dörren). AU/NZ: GST bara över
   AUD 75 000 / NZD 60 000 per år, annars inget vid gränsen under
   AUD/NZD 1 000. CA: tull + GST/HST + transportörens avgift tas av kunden
   vid leverans (från Sverige gäller CAD 20-gränsen). Shopifys "collect
   duties at checkout" kräver Advanced-plan. Kvar i admin: Settings → Taxes
   and duties → United Kingdom (VAT), leveranstiden per land hos leverantören,
   Klarna i kassan per land (inte mätbart härifrån).
   Kvar hos den andra sessionen: optionens NAMN ("Variant"/"Title") saknar
   en/nb-översättning — rubriken över storleksväljaren står "Variant" på /en.
   ⚙️ **EN flagga för kundens land, inte fem (Axels order samma eftermiddag:
   "märk vilket land kunden kommer ifrån och visa bara den flaggan").**
   Ny fabriksägd snippet `snippets/ms-landtext.liquid` byter `[[flagga]]` och
   `[[land]]` i en textrad mot kundens land ur `localization.country`
   (US → "🇺🇸 … the US", GB → "🇬🇧 … the UK", CA/AU/NZ namnet, SE/NO
   engelska namnet, okänt land 🌍 + Shopifys landsnamn) och escapar utdata.
   De tre ställen som visar fraktraden renderar genom den och är därför
   fabriksägda kopior i `factory/tema/` (TEMAFILER + bas-zip:en, testade
   lika): `snippets/ms-trust-row.liquid` (USP-raden + köprutans trust),
   `sections/ms-marquee.liquid` och Dawns `sections/announcement-bar.liquid`.
   Engelskan bär tokens: "[[flagga]] Free shipping to [[land]]" (marquee,
   annonsrad, `liquid.trust.0`) och "truck:Free shipping to [[land]]" (USP);
   sv/nb har inga hakparenteser och passerar orörda. Mätt 2026-09-17 ~16:00
   UTC som kund per land: US "🇺🇸 Free shipping to the US" (3 träffar på
   startsidan, 2 på produktsidan), CA "🇨🇦 … Canada", AU "🇦🇺 … Australia",
   NZ "🇳🇿 … New Zealand", GB "🇬🇧 … the UK"; SE-sidan oförändrad
   ("Fri frakt – Sverige & Norge"). ⚠️ Shopify slår på botkontrollen
   ("Verifying your connection…", 9 kB) efter ~8 snabba curl-anrop från
   containern — vänta 10 s mellan sidor, eller ta headless Chrome.
   `[[` i sidkällan är Shopifys egna JS-arrayer, inte tokens.

19. ⚙️ **USA-marknaden får en egen domän, och pixeln är delad** (mätt 2026-09-16,
    termoskyddets US-runda). `carashell.com` är USA-marknadens domän i Shopify
    Markets: `carashell.se/en/products/<handle>?country=US` svarar 301 dit, och
    `carashell.com/products/<handle>.json` ger USD-priset. Annonserna ska peka
    på `.com` direkt (`ops-till-meta --lank`), annars går varje klick genom en
    omdirigering; `lankFor` (`opsmarknader.mjs`) och kön `ops-leveranskon`
    känner inte domänen än — kön stoppar på "omdirigerar" i priskollen. Lägg
    marknadens domän i butiksfilen och lär båda den innan `/ops-oversatt …
    --marknad US` körs på riktigt. Pixeln (punkt 17) är delad: `adspixels` i
    UK-kontot listar CaraShell, och `issues_info` är tomt på takskyddets fyra
    US-annonser. Termoskyddets 16 SE-annonser gick till engelska utan Notion —
    hela vägen står i `factory/FAS2.md` (samma dag, "16 annonser till USA").

## Regler som bevisats den hårda vägen
- **En NO-kampanj byggd före 2026-09-10 har länkar utan `?country=NO` och
  visar SVENSKA priser för norska kunder.** Fixen i Fas 4 (webbnärvaro +
  `?country=NO` i `kampanj.mjs`) landade 2026-09-10; allt som byggdes innan
  bär bara `/nb`-länken. Mätt 2026-09-13 på HeimGuard, vars NO-kampanj byggdes
  2026-09-09: `heimguard.se/nb/products/overvakningskameran` svarar 799,00 kr
  i **SEK**, samma sida med `?country=NO` svarar 781,00 **NOK** — NOK var
  alltså påslaget hela tiden, det var länken som saknade parametern. Alla 27
  NO-annonser pekade på den parameterlösa länken, medan DryTreks (byggda efter
  fixen) bär den. Utfallet: NO ROAS 1,28 mot SE 1,50 på samma produkt.
  **Kontrollera länken i varje NO-kampanj som byggdes före 2026-09-10** innan
  någon dömer creativen — felet ligger i kassan, inte i annonsen. Att rätta
  det kräver nya creatives på annonserna, och en ny creative nollställer
  annonsens gilla-markeringar och kommentarer; väg det mot hur mycket
  engagemang annonsen hunnit samla.
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
  *(Mätt igen 2026-09-11 på ras1t2-2x: samma anrop svarade med alla 16
  importerade recensioner — 10 sv "Bra koja" + 6 nb "Bra kattehus", snitt
  5,00, alla `created_at` 2026-09-07T16:00Z = 8 sep 00:00 i butikens
  tidszon, som fortfarande är Filippinerna från trialen. Svaret beror alltså
  på butiken/tidpunkten, inte på API:t — prova alltid, och läs datumen i
  butikens tidszon. ⚠️ Tidszonen är ett klick: Settings → General → Time
  zone → Stockholm, annars visas order- och recensionstider sex timmar fel.)*
  ⚠️ Samma anrop mot KÄLLAN (4snrw0-mg) gav 2026-09-11 bara betyg + datum —
  `body` och `reviewer` var null. Texterna och namnen står i stället
  färdigrenderade i produktsidans HTML (`jdgm-rev-widg` → `jdgm-rev__author`,
  `jdgm-rev__body`); `curl` sidan och läs dem därifrån.
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

---

## Andra produkten i en befintlig butik (bevisat 2026-09-16, CaraShell → termoskyddet)

`/ops-produkt <butik> <källänk>` är rutinen; `.claude/commands/ops-produkt.md` är
körordningen. Det som bevisades utöver kommandot, i ordning: utkast ur källans
`/products/<handle>.json` (Kaching-nivåerna gick INTE att läsa — källsidans HTML ligger
bakom en bot-spärr, `.json` går; standardnivåerna A/B användes) → copy av subagent →
`kollektion:`-block + brandnivå på startsidan (hero, berättelse, statement får inte låsa
brandet vid produkt 1) → bygget med ALLA produktfiler + `--igen kollektion,startsida,
meny,tema` → `priceListFixedPricesAdd` för produkt 2:s variant i NOK-prislistan →
nb-översättning av de nya + ÄNDRADE nycklarna (jämför mot HEAD-versionen av
`oversattning-sv.json`, inte bara mot nb-filen) → `--igen oversatt` → QA grön →
`register.mjs skriv-in` + `rutin.mjs --tider <nyckel> --flerprodukt --skriv-in` →
`/ny-annonser` (FAS2.md 2026-09-16) → minne per produktnyckel (`products/<butik>/README.md`).
Butikens gamla rutiner (`/notionscalercs <butik>`) slutar gå samma natt — de ska pekas
om till `<butik>/<produkt 1>` på det konto de ligger på.

## Två resurser översattes aldrig — fraktsättet och optionens namn (2026-09-18)

Axel öppnade varukorgen som finsk kund och pekade på tre saker. En var inget
fel, två var riktiga — och den ena hade drabbat USA lika länge som Finland.

**1. "Kassa" på knappen är FINSKA, inte svenska.** Temats `locales/fi.json`
säger `"checkout": "Kassa"`, svenskans säger `"Gå till kassan"`. Ordet stavas
likadant på båda språken. Innan något "rättas" i en språkfråga: läs temats
locale-fil, den är facit.

**2. `PRODUCT_OPTION` samlades aldrig in.** Varukorgen sa
**"Variant: 5,5 × 3 m"** på varje marknad — värdet översatt, etiketten svensk.
`samlaResurser` tog produktens `optionValues` men inte `options`. Optionens
namn är en EGEN translatable resurs.

**3. `DELIVERY_METHOD_DEFINITION` fanns inte i typlistan.** Fraktsättet heter
**"Fri frakt"**, och det stod oöversatt för finska, norska OCH amerikanska
kunder — mitt i kassan, i det steg där folk bestämmer sig. Det syns aldrig i
butiken, så varken kundvyn eller språkkollen kunde hitta det: de läser
produktsidan, och fraktsättets namn ritas först i kassan.

Rättat i fabriken, gäller varje butik:
- `marknad.mjs` → `samlaResurser` tar nu optionens id och typen
  `DELIVERY_METHOD_DEFINITION`.
- `oversattning.mjs` → underlaget får `produkt.<handle>.option.<namn>` och
  `frakt.metod.<namn>` (namnen läses ur `byggFraktplan`, inte avskrivna).
- `arLacka` undantar Shopifys egna `Title`/`Default Title` — annars larmar
  varje enproduktsbutik om två läckor som inte går att åtgärda.

Tillbakaläst ur Shopify efter körningen:

| Resurs | fi | nb | en |
|---|---|---|---|
| Optionen "Variant" | Koko | Størrelse | Size |
| Fraktsättet "Fri frakt" | Ilmainen toimitus | Gratis frakt | Free shipping |

Och i varukorgen som riktig kund: `Koko: 5,5 × 3 m` · `Størrelse: 5,5 × 3 m` ·
`Size: 18 × 10 ft (5.5 × 3 m)`.

⚠️ **Varje OPS-butik med fler än en marknad bär samma två luckor** tills den
kört `--igen oversatt` med de nya nycklarna i sina språkfiler. Koden är
gemensam; översättningsorden är per butik.

⚠️ **Svenska sidan säger fortfarande "Variant"** — det är optionens namn i
Shopify, inte en översättning. Vill man ha "Storlek" där måste produkten
skrivas om med ett annat optionsnamn; det är en produktändring, inte en
språkändring, och den är inte gjord.

## Kassans språk: läs adressen, inte texten (2026-09-18)

En annan session påstod att kassan visas på svenska för finska kunder och att
"finskan inte är publicerad för kassan". Mätt samma dag på CaraShell — det
stämmer inte:

1. `shopLocales` säger **`en, fi, nb, sv*`**, alla publicerade. Finskan ÄR på.
2. Lägger man en vara i korgen som finsk kund (`POST /localization` med
   `country_code=FI` + `language_code=fi`, sedan `/fi/cart/add.js`) slutar
   kassans adress på **`/checkouts/cn/<id>/fi-fi`**. Shopify dirigerar alltså
   till den finska kassan. Vore finskan opublicerad stod det `sv-se` där.

**Adressen är därför den mätbara signalen**: locale-suffixet efter checkout-id:t
säger vilket språk kassan körs på. Går det att läsa utan webbläsare.

⚠️ **Kassans TEXTER går inte att läsa härifrån.** Shopifys checkout svarar
**HTTP 403** på allt som inte är en riktig webbläsare, även med fullständiga
`sec-ch-ua`/`sec-fetch`-headers (provat 2026-09-18, 51 tecken tillbaka). Samma
vägg som Judge.me-widgeten. Vill någon veta vad kassan faktiskt säger krävs en
människa i en webbläsare — påstå aldrig något om kassatexter utifrån `fetch`.

🔑 **Kassan följer SPRÅKET kunden surfar på, inte landet.** En finsk kund som
kommer in på den svenska sidan får svensk kassa, hur finsk hens IP än är.
Därför måste varje annons mot Finland peka på `/fi` MED `?country=FI` — precis
som Norge-regeln. En annonslänk utan locale ger finsk valuta men svensk kassa.

Butiken kan inte översätta kassans standardtexter själv: bland
`TranslatableResourceType` finns bara `DELIVERY_METHOD_DEFINITION`,
`PAYMENT_GATEWAY` och `SHOP_POLICY` — "Lägg till rabatt" och "Kom ihåg mig" är
Shopifys egna strängar. Saknas de på ett språk är det ett Shopify-ärende, inte
något i det här repot.

## En sträng i en .js-fil är svensk för hela världen (2026-09-18)

Axel klickade "Lägg i varukorgen" på den finska sidan och knappen svarade
**"Lägger i…"**. Hans invändning är hela poängen: *"även om man bara ser det i
någon sekund hade jag känt mig otrygg om det var ett helt främmande språk när
man ska spendera massa pengar."*

**Rotorsaken:** `factory/tema/assets/ms-paket.js` är en ren .js-fil. Shopify
kör ingen Liquid i den, så `request.locale` finns inte och
`translationsRegister` når den inte. Varje sträng skriven direkt i filen når
alltså varje kund i världen på svenska — och ingen språkkoll fångade det,
för `kundvy.mjs` läser den renderade HTML:en och texten skrivs först när
kunden klickar.

Fyra ställen var svenska för alla marknader:

| Vad | Stod | Syntes när |
|---|---|---|
| Köpknappen medan den laddar | "Lägger i…" | vid varje klick |
| Styckpriset | "… per överdrag" | alltid, under varje paketnivå |
| Rabattraden | "Du sparar …" | på nivåer med rabatt |
| Felraden | "Det gick inte att lägga i varukorgen." | när köpet failar |
| Prisreserven | `toLocaleString('sv-SE') + ' kr'` | om ms-cro.js uteblir |

**Lösningen, och regeln framåt:** texten hör hemma i snippeten, inte i
JavaScriptet. `snippets/ms-paket.liquid` bär dem som attribut
(`data-laddar`, `data-spar`, `data-per`, `data-fel`), `MS_PAKET_ORD` i
`factory/tema.mjs` översätter dem på samma väg som `aria-label`, och JS:et
läser `this.dataset.*` med svenskan kvar som reserv för en butik vars tema
inte hunnit få attributen. Prisreserven tar sidans eget `lang` och kundens
valuta ur `data-valuta` (`cart.currency.iso_code`) — utan valuta skrivs bara
siffran, aldrig en påhittad symbol.

🔒 **Skriv aldrig en kundsynlig sträng i en .js-fil under `factory/tema/`.**
Ska JS:et visa text: lägg den som ett `data-`-attribut i snippeten och en rad
i `MS_PAKET_ORD`. Hittar du en kvarglömd sträng — sök på `textContent =` och
på `[åäö]` inom citattecken i `factory/tema/assets/`.

⚠️ **Bas-zippen:** `assets/ms-paket.js` ligger både i `TEMAFILER` och i
`factory/tema/ops-tema.zip`, och ett test kräver att de är identiska —
uppdatera zippen i samma commit. Snippeten är tvärtom: zipens
`ms-paket.liquid` ska vara OPATCHAD (inga `iso_code`-grenar), för motorn
patchar in dem vid bygget. Skriv alltså in JS-filen i zippen, aldrig
snippeten.

## Pris per storlek + ännu en marknad (bevisat 2026-09-18, CaraShell → Finland)

En produkt med nio storlekar fick nio olika priser — i fyra valutor — och
Finland blev butikens tredje marknad. Fem saker som är nya i fabriken:

1. ⚙️ **`factory/variantpris.mjs` — pris per variant.** Produktfilens
   `varianter[]` får `pris`, `jamforpris` och ett eget `marknadspriser`-block.
   Utan dem gäller `ekonomi`-blocket precis som förut, så inga andra butiker
   ändras. `build-store.mjs` skriver stegen i butikens valuta, `prislista.mjs`
   skriver den per variant i varje prislista, och `kontroll.mjs` +
   `trippelkoll.mjs` jämför **varje variant mot SITT pris** i stället för att
   godkänna "samma pris på alla".
   🔒 **Järnregeln: en halv stege stoppar bygget.** Har EN variant eget pris
   måste ALLA ha det, och då måste var och en också ha en rad i varje
   marknadsvaluta. `granskaVariantpriser` namnger varianten som saknas. Utan
   spärren säljer den dyraste storleken till den billigastes pris i precis ett
   land, utan felmeddelande.
2. ⚙️ **Marknadens basvaluta sätts nu via API:t.** Det stod som ett handklick
   ("API-spärrat i unified markets") och det var HALVT sant:
   `marketCurrencySettingsUpdate` svarar `This action is restricted if unified
   markets is enabled`, men **samma fält går igenom som
   `marketUpdate(input: { currencySettings: { baseCurrency } })`**. Mätt på
   CaraShells finska marknad: EUR satt och tillbakaläst i samma körning.
   `marknad.mjs` skriver den BARA när marknaden saknar egen valuta — en
   marknad som redan bär en valuta är ett beslut (Norge fick NOK för hand
   2026-09-11 medan butiksfilens rad fortfarande säger SEK) och rörs aldrig.
   Trippelkollen läser tillbaka den som ✅/❌, inte som ett 🖐.
3. 🔧 **`rabatt_procent` skrevs aldrig — paketrutan räknade fel.** Snippeten
   `ms-paket.liquid` har läst fältet sedan den skrevs, men det fanns varken i
   metaobjektsdefinitionen eller i skrivningen, så procentläget var dött och
   sidan räknade ett FAST BELOPP mot standardvarianten. Osynligt medan alla
   varianter kostade lika; med stegen visade ett 2-pack av 13,5 m 465,73 € på
   sidan medan kassans 15 %-kod tar 428,23 €. **Kolla `data-procent` i den
   renderade sidan** när en produkt får olika pris per variant — står det 0 på
   en nivå med rabattkod räknar sidan fel.
4. 🖐 **Domän per marknad är inte automatiskt rätt.** USA fick carashell.com
   ("`.se` säger utländsk butik" till en amerikan). Finland fick INGEN egen
   domän — Axels beslut: mellan nordiska grannar är en svensk butik inget
   hinder, och `/fi` fungerar precis som `/nb`. Fråga ägaren; bygg inte en
   domän för att förra marknaden fick en.
5. ⚠️ **Texten måste läsas om när en produkt får fler varianter.** Butikens
   titel var uppdaterad till "5,5–13,5 m", men produktsidans underrubrik och
   första FAQ-fråga sa fortfarande "6,5 × 3 m" på ALLA fyra språk. Ingen
   spärr fångade det — en översättningsfil är "komplett" så länge nyckeln
   finns, oavsett vad den säger. Läs igenom `oversattning-*.json` efter varje
   ändring av vad produkten ÄR, inte bara efter en ny marknad.

**Annonserna klarade sig** för att basstorleken behöll sitt pris: 6,5 m kostar
fortfarande 1 129 kr, och den första varianten i listan (5,5 m) lika mycket, så
sidans rubrikpris är oförändrat. Ligger annonspriset på en storlek som ÄNDRAS
måste annonserna skannas om (`brand-detektor.mjs`) innan stegen skrivs.
