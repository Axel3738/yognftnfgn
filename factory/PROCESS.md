# OPS-PROCESSEN — så byggs en butik, brick by brick

**Kadensen** (Axels upplägg 2026-09-07): Axel väljer vinnarprodukter och
skickar produktgrupper ~2 gånger i veckan — ibland noll, ibland flera.
VA:n har **3 dagar per grupp** att launcha alla gruppens butiker; varje
produkt = en egen butik = en `/ny-ops`-körning + en checklista.

**Ordningen från 2026-09-08 (Axels beslut):** VA:n gör butik + app +
koppling FÖRST (checklistans steg 1–2), sen startar `/ny-ops` och bygger
FÄRDIGT hela butiken. Domänen köps när Claude levererat namnet.

**Detta är rutinen under uppbyggnad** (Axels beslut 2026-09-07: uppdatera för
varje steg vi lyckas med — dokumentet ska så småningom bli en körbar rutin).
Varje steg är BEVISAT på Hemvakten→HeimGuard-bygget. Ordningen är den ordning
som funkade. ⚙️ = fabriken/Claude gör det · 🖐 = Axels klick (se CHECKLISTA.md
som genereras per bygge).

## Fas 1 — Grunden
1. ⚙️ Hämta produktdata från källan (Bäverbutik-sidan): namn, pris, varianter,
   bilder, beskrivningstexter, Judge.me-recensioner (`/products/<handle>.json`
   + `judge.me/reviews/reviews_for_widget`). Aldrig påhittade specs.
2. ⚙️ Brand-steget FÖRE bygget: analysera köpare/emotion → `branding:`-block i
   butiksfilen. Namnregeln (skärpt 2026-09-08): helst ett HELT engelskt namn
   som svenskar och norrmän ändå kan läsa och uttala, aldrig å/ä/ö.
   Kolla domänen med whois INNAN namnet spikas.
3. ⚙️ Skriv `butiker/<id>.yaml` + `produkter/<id>.yaml`, validera, dry-run.
4. ⚙️ Rund logga (mörk cirkel + ordmärke, qlmanage SVG→PNG) + favicon (initial).

## Fas 2 — Shopify
5. ⚙️ Ladda upp CRO-temat: zip:en ligger i repot som
   `factory/tema/ops-tema.zip` (matstrumpor-cro-v5 — samma zip HeimGuard
   byggdes från; incheckad 2026-09-08 så molnet alltid har den)
   → staged upload → themeCreate. Temat är
   strukturen — brandingen genereras alltid om (opf-brand.css + settings).
6. ⚙️ Produkt som **ACTIVE** med **`inventoryPolicy: CONTINUE`** och
   `inventoryItem.tracked: false` (Axels regel 2026-09-09 — Shopifys default
   DENY stoppar försäljningen tyst när saldot tar slut, medan annonserna
   fortsätter kosta pengar; dropshipping har inget eget lager) (Axels bakläxa 2026-09-08 på TankGuard:
   DRAFT ger 404 i menyn och "Exempel på produktnamn" i kundvyn —
   butiken är ändå lösenordsskyddad under trialen) → metafält →
   opf-sektioner → produktmall → startsida →
   meny → policysidor (adress från allabolag.se) → fraktzoner.
7. ⚙️ Paketen: metaobjekt `ms_paketniva` (translatable-capability PÅ från
   start!) + riktiga rabattkoder som ger exakt paketpriserna. A = originalets
   Kaching-nivåer, B = testoffer. A/B via temats ms-ab (test "paket",
   orderattribut "AB paket" mäter). **Förvald nivå är ALLTID mitten**
   (position ⌈n/2⌉), aldrig första — Axels beslut 2026-09-07, gäller varje
   OPS och båda A/B-varianterna.
8. ⚙️ Bonus-ramverket (Q4-videon, standard för VARJE OPS): en billig
   komplementprodukt (t.ex. varningsskyltar till kameran) som (a) GRATIS
   bonus i paketnivåerna — "köp mer, få mer" i stället för djupare rabatt —
   och (b) betald upsell i varukorgen. Rabattkoderna täcker bonusens värde.
   Bevisad implementation (HeimGuard v8): `tema.mjs → byggKorgUpsell` ger
   tre filer — upsell-snippet (inline-onclick, för innerHTML-omritningar),
   wrapper-sektion (replace_first på `<!-- Start blocks -->`, används av
   sektions-API:t vid varje cart-ändring) och ms-head-tillägget
   (omhämtar lådan en gång per sidladdning — layout/theme.liquid renderar
   snippeten direkt förbi wrappern, och den filen forkas inte).
   Fältet i produktfilen: `offer.bonus_produkt`.
   **Antalsregeln (Axel 2026-09-08):** gratis-antalet följer paketantalet
   — 2-pack ⇒ 2 gratis, 3-pack ⇒ 3 gratis — när bonusen har låg COGS och
   samfraktas med huvudprodukten. **Nivå 1 får en betald
   tilläggs-kryssruta** för bonusen till FULLPRIS (aldrig rabatterad —
   den håller "värde X kr"-berättelsen på paketen ärlig). Rabattkoderna
   räknas alltid om så kassapriset stämmer på öret.
   ⚠️ Ny temaklon tappar temats translationsRegister-rader — registrera om
   nb för index/product-mallarna OCH sektionsgrupperna
   (`gid://…SectionGroup/header-group?theme_id=<ny>`); nycklar och digests
   är stabila mellan kloner så v7-raderna kan spelas upp rakt av.
9. ⚙️ Bilder: inbränd engelska bort. kie.ai klarar INTE svensk text — metoden
   är kie REMOVE text → sharp lägger svensk vektortext (grid-overlay för
   koordinater). Gif kan inte fixas — redigerarjobb.
10. 🖐 **Butiken skapas av VA:n själv** från jobb-Gmailen (ny FREE TRIAL
    per butik — ingen plan, inget kort; staff-inbjudningar kräver betald
    plan, mätt 2026-09-08). Shopify-åtkomst är per butik — hon ser aldrig
    ägarens övriga butiker, och de gamla butikerna ligger på ägarens egen
    inloggning. I överlämningen loggar ägaren in med jobb-Gmailen, väljer
    plan med sitt kort och tar över ägarskapet (checklistans steg 2 + 9,
    beslut 2026-09-08). Sen: publicera tema, språk svenska, butiksnamn, domän,
    Shopify Payments + Klarna, avsändarmejl, kassalogga. Klicken är VA:ns
    (`factory/VA-CHECKLIST.md`, ifylld per butik i `output/<id>/CHECKLISTA.md`)
    — även Shopify Payments (Axels besked 2026-09-07: aktiveringen har
    aldrig krävt BankID, VA:n fyller i bolags- och bankuppgifterna).
    Claude kopplas till butiken via butikens EGEN app (en per butik —
    custom distribution låses till EN butik utanför Plus, mätt
    2026-09-08): VA:n skapar appen på dev.shopify.com, lägger
    SHOPIFY_SHOP + SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET i
    molnsessionens miljö och installerar via distributionslänken
    (checklistans steg 2) → Admin-token hämtas och
    `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_ADMIN_TOKEN` skrivs i
    `factory/.env`. Rutinen startas med `/ny-ops`; frasen
    "Store ready: <namn>" utlöser slutsteget (se kommandot).

## Fas 3 — Recensioner
11. 🖐 Installera Judge.me + språk + skicka API-token.
12. ⚙️ Import via `tools/judgeme-import.mjs` (--mejlsuffix <brand>.invalid —
    API:t kräver mejl numera). **Flerspråkiga recensioner utan betald plan**
    (Axels beslut 2026-09-07: Judge.mes auto-översättning är paid — köps
    aldrig): fabriken översätter själv en delmängd av recensionerna till
    marknadens språk och importerar dem som EGNA recensioner med lokala
    namn (Ola/Kari/Bjørn …). Blandningen sv+no i samma lista ser naturlig
    ut för en butik som säljer i båda länderna. Vid stort produkt-id krävs
    `--anda` (dubblettkollen kan inte göras per produkt — verifiera själv).
    Bevisat på HeimGuard: 6 norska importerade 2026-09-07. Widgeten läggs i temats egen **Appyta**
    (ms-app-slot) i produktmallen, stjärnbadgen som block under titeln
    (appblock-uuid är global). **Widgeten stylas ALDRIG med CSS från
    temat** (Axels beslut 2026-09-07) — utseendet ställs i Judge.me-appens
    inställningar. 🖐 Klicken där: Language **Svenska**, star color
    **#00B77F** (alltid, varje butik — `STJARNFARG` i branding.mjs).
    Judge.mes settings-API är läs-bara (skrivförsök ger 404), så de två
    fälten är klick i checklistan.

## Fas 4 — Marknader (STANDARD i varje ny OPS, Axel 2026-09-08: SE huvudspråk + marknad Norge locale nb; fler marknader läggs till på samma sätt)
13. ⚙️ Marknad Norge + locale nb (publicerad) + nb som alternateLocale på
    huvuddomänens webPresence (`webPresenceUpdate` — INTE market-varianten).
    NOK slås på i admin (API-spärrat i unified markets).
14. ⚙️ ALLT översätts via translationsRegister — trippelkolla mot /nb:
    produkt+metafält, tema-JSON-mallar (index/product), sektionsgrupper
    (header/footer), menylänkar, sidor, paket-METAOBJEKT. locales/nb.json för
    temats köpsträngar. custom_liquid är EJ översättningsbart —
    locale-brancha i Liquid. Sektionsdefaults = locale-medvetna i opf-koden.
    ⚠️ Tema-översättningar är knutna till TEMA-ID — ny temaklon = registrera
    om (nycklar/digests är stabila mellan kloner).
15. ⚙️ Bilder per marknad (bevisat på HeimGuard 2026-09-07): språkversionera
    med husets metod (kie rensar text → sharp lägger vektortext, samma
    koordinater per språk). Tre lager, alla via API:
    - Metafält-bilder (opf-sektionerna): translationsRegister på METAFÄLTETS
      gid (`gid://shopify/Metafield/<id>`, key "value", värde = fil-URL).
    - Temats bildinställningar (hero, image-with-text): translationsRegister
      på JSON-mallen, värde `shopify://shop_images/<fil>` — tema-bundet,
      registrera på varje klon.
    - Produktgalleriet: språkmärk alt-texten (`[SV]`/`[NO]`, omärkt = alla
      marknader), lägg båda språkens bilder som media, och ms-head döljer
      fel språk med CSS `:has()` per locale. Dawns slider hoppar själv över
      dolda bilder (clientWidth-filtret), så pilar och räknare stämmer.
    ⚠️ Filtret bor i temat — tills nya klonen är publicerad ser LIVE-temat
    båda språkens galleribilder. Lägg median sist i bygget, publicera snabbt.
16. ⚙️ NOK-paketnivåer innan norska annonser (SEK-belopp räknar fel i NOK).
17. ⚙️ Norge ska SYNAS i kundvyn (Axel 2026-09-08): svenska USP-strippen
    säger "Fri frakt – Sverige & Norge", nb-versionen "Gratis frakt i
    hele Norge". Kunden ska aldrig behöva gissa att vi postar till Norge.

## Fas 5 — Kanaler
16. 🖐+⚙️ Discord: VA:n skapar servern och godkänner boten (checklistans
    steg 8) →
    `factory/discord.mjs --guild <id> --ikon <logga>` bygger de sex kanalerna
    och plockar redigerare ur standby-listan.
17. 🖐 Meta: VA:n har **Fullständig åtkomst** i Business Manager (Axels
    beslut 2026-09-07 — hon får se betalningarna) och skapar brandets SIDA
    direkt i BM själv (API:t kan fortfarande inte skapa sidor). **Annonskontot är alltid
    detsamma: "MagiBorsten DK" 915422744950975 — ETT gemensamt konto för
    ALLA OPS-butiker, svenska som norska** (Axels beslut 2026-09-07).
    Därför: kampanjnamnen prefixas ALLTID med brandet (HEIMGUARD_…) så
    datan går att skära per butik, och kontot döps aldrig om. Förväxla
    aldrig med MagiBorsten 1867947880635861 (Bäverbutiken SE). Kortet
    ligger redan i BM. ⚙️ Pixel per butik via `factory/meta-setup.mjs`
    när META_ACCESS_TOKEN finns. 🖐 WeTracked: nytt konto per butik,
    klistra in pixel-id.

## Fas 6 — Annonser (nästa fas, ej bevisad än)
18. ⚙️ Brand-swap av Bäverbutikens vinnare (PLAN.md punkt 1).
19. ⚙️ Q4-ramverket i annonsplanen: banka creatives i förväg (dubbla antalet),
    större PO innan säsong (PLAN.md punkt 6).

## Regler som bevisats den hårda vägen
- **Bas-zip:en bär MATSTRUMPORS TEXT i tre mallar** (mätt 2026-09-09):
  `templates/index.json` (hero, rubriker, kollektionen `strumporna`,
  produkten `sushi-strumpor`), `sections/footer-group.json` (bolagsblocket
  med `kundsupport@matstrumpor.se`) och `templates/product.json` (samma
  mejl). Kör **`factory/kallskanning.mjs`** mot hela temat innan butiken
  lämnas — rapporten ska vara tom. DryTrek nådde förhandsvisning med
  "Kilometer fyra. Fortfarande torr strumpa." som hero.
- **Bas-zip:ens startsida pekar på MATSTRUMPOR** (mätt 2026-09-09 i
  `factory/tema/ops-tema.zip`: `templates/index.json` har
  `produkt.product = "sushi-strumpor"` och `sortiment.collection =
  "strumporna"`). Ingen kod i `factory/*.mjs` rör `index.json` — startsidan
  byggs för hand av sessionen varje gång. Missas det får butiken en startsida
  som pekar på en produkt som inte finns. **Kontrollera startsidan i kundens
  vy innan "klart" sägs**, och bygg helst steget i fabriken (se
  `factory/FLERPRODUKT.md`).
- **`creative_prefix` ska vara per PRODUKT, aldrig per brand.** I dag står
  brandet där (`TankGuard`, `HeimGuard`). Det håller så länge en butik säljer
  en produkt — men prefixet är det ENDA fyra system använder för att skilja
  produkter åt (prefixkartan i `leveranskon.mjs`, översättningskön,
  adsetuppslaget i `notion-till-meta.mjs`, commission-kopplingen). Brandet
  hör hemma i kampanjnamnet, prefixet i produkten.
- **Alltid svensk lag, aldrig egna köplöften** (Axels beslut 2026-09-08:
  "30 dagars öppet köp" överallt har ruinerat folks trust). Standard är
  14 dagars ångerrätt — i policyn, i USP-strippen, i garantierna.
- **Loggan visas i chatten innan den sätts:** gör 3 varianter i
  brand-steget, välj bäst, visa bilden. Axel kan säga "ny logga" när som
  helst — bytet är ett API-anrop. (TankGuards första logga 2026-09-08
  underkändes.)
- **VA:ns master är Google-dokumentet** (https://docs.google.com/document/d/1gOfJGdyip0u6MqMuQxMLkXq39H-M4EvY/edit) —
  varje ändring i VA-CHECKLIST.md/checklista.mjs förs in där i samma
  session (Axels regel 2026-09-08). Repot är fabrikens sanning,
  dokumentet är VA:ns.
- Säg ALDRIG "klart" utan tre kontroller mot kundens riktiga vy
  (markörskanning + regressionstest + visuell mobilkontroll).
- **Publicerat tema går att skriva i — men bara med en custom app-token.**
  Mätt 2026-09-10 på HeimGuard: `themeFilesUpsert` mot det PUBLICERADE temat
  (`role: MAIN`) gick igenom med noll `userErrors`, filen lästes tillbaka
  identisk, och butiken serverade den nya på direkten. Ingen klon, ingen
  publicering, inget Judge.me-tapp.
  ⚠️ **Shopify-MCP:n kan det INTE** — den blockerar temaskrivningar mot
  live/MAIN och temapublicering med flit. Går du via connectorn måste du
  fortfarande bygga en klon som Axel publicerar. Välj vägen efter vad du har.
  Tidigare stod här "publicerat tema är API-låst" rakt av. Det stämde för
  MCP-vägen, inte för token-vägen.
- **`SHOPIFY_TOKEN_*` (`atkn_…`) ger 401 mot Admin API** — det är en
  CLI-token, inte en Admin-token. Mint en färsk `shpat_` per körning ur
  butikens custom app i stället:
  ```
  POST https://<shop>/admin/oauth/access_token
  {"client_id":…,"client_secret":…,"grant_type":"client_credentials"}
  ```
  Nycklarna heter `SHOPIFY_SHOP_<suffix>` / `SHOPIFY_CLIENT_ID_<suffix>` /
  `SHOPIFY_CLIENT_SECRET_<suffix>`. HeimGuard = `pzjagy_mz`,
  **TankGuard = de OSUFFIXADE** (`SHOPIFY_SHOP` = y1sj1i-3d). Samma recept
  som `tools/shopify-fix-compareat.mjs` och `docs/temu-launch-flow.md`.
- **Säkerhetskopiera temafilen före varje skrivning mot live**, och jämför
  den mot den version fabriken tror att butiken kör. Skiljer de sig har
  någon handredigerat i butiken, och då skriver du över deras arbete.
- **Testa aldrig kundflödet i hög takt mot en live-butik.** Cloudflare
  svarar 429 "Verifying your connection" efter ett tiotal snabba
  varukorgsanrop, och då ser en fungerande kassa trasig ut: `/discount/`
  faller, koden fäster inte, och reservvägen skickar kunden till /cart.
  *(2026-09-10: ett "misslyckat" TankGuard-test på /nb var enbart det här.)*
  Vila några minuter mellan körningarna och läs alltid HTTP-statusen innan
  du dömer ut butiken.
- **Appinbäddningar bor i settings_data.json och dör i varje klon.**
  Judge.me aktiveras som app embed (`current.blocks` → judgeme_core) — den
  raden finns bara i temat den aktiverades i. Varje ny klon utan raden =
  "Judge.me avaktiverad" igen (hände v7→v8→v9, Axel fick aktivera om två
  gånger). Regel: läs `current.blocks` ur LIVE-temats settings_data och
  kopiera in i varje ny klons settings_data INNAN den lämnas för publicering.
- API:t kan inte (custom app-token; Shopify-MCP:n är FÖRBJUDEN i /ny-ops):
  publicera teman mot live, shop-mejl, checkout-branding
  (Plus), shopPolicyUpdate (scope), Meta-sidor, byta primärspråk.
  *(Att SKRIVA filer i ett publicerat tema går däremot — se ovan.)*
- **Paketkodernas minimiantal räknar med bonusprodukten.** TankGuards
  `PAKET2` kräver `min 4 st` fast paketet heter 2-pack: kunden får 2 tankskydd
  + 2 kranskydd på köpet, alltså fyra rader i vagnen. HeimGuards `PAKET2`
  kräver `min 2 st` (bonusen är 1 skyltpaket, och kravet räknar bara kameror).
  Mätt 2026-09-10. Ändra aldrig ett minimiantal utan att räkna bonusraderna
  först — sätts det för högt faller rabatten tyst och kunden betalar fullpris.

## ✅ LÖST 2026-09-09 — varukorgen redirectade i stället för att poppa upp

**Symptom (Axel, HeimGuard + TankGuard, båda LIVE och spenderar):** första
gången kunden lägger i varukorgen skickas hen till `/cart` i stället för att
lådan glider in.

### Vad som MÄTTES på de publicerade temana 2026-09-09

Kört i riktig Chromium mot heimguard.se och tankguard.se, svenska och `/nb`,
med tom kundvagn. Tre hypoteser föll:

| Hypotes | Mätning | Dom |
|---|---|---|
| `sections/cart-drawer.liquid` saknar `{% schema %}` | `GET /?sections=cart-drawer` svarar 200 med `#CartDrawer` på båda butikerna | ❌ inte orsaken — sektions-API:t kräver inget schema |
| Publicerade temat saknar `cart_type: 'drawer'` | `component-cart-drawer.css`, `cart-drawer.js` och `<cart-drawer class="drawer is-empty">` finns alla i första laddningen — alla tre renderas bara när `cart_type == 'drawer'` | ❌ värdet var redan satt på båda |
| `product-form.js` hittar inget `<cart-drawer>` (rad 11 → rad 64 redirect) | `document.querySelector('cart-drawer')` ger elementet, och det är uppgraderat (`renderContents` finns) | ❌ rad 64 kördes aldrig |

Redirecten kom inte från temat alls, utan från `assets/ms-paket.js` — filen som
äger paketnivåerna. **Två fel, båda med samma symptom:**

**1. Båda A/B-korten köpte samtidigt.** `ms-ab.js` tar aldrig bort den
förlorande varianten, den sätter bara `hidden` på omslaget. Båda `<ms-paket>`
band därför sin köplyssnare till SAMMA formulär, och `ev.stopPropagation()`
når inte ett syskon som lyssnar på samma nod (`document`). Ett klick gav:

- `/cart/add.js` **två gånger** — kunden fick 4 kameror när hen valt 2
- `/discount/PAKET2` och `/discount/PAKET2B` efter varandra, sista vann

**2. Rabattkoden lades på FÖRE varorna.** `/discount/<kod>` fäster **inte** på
en TOM kundvagn. Koden föll bort, `kontrollera()` hittade den inte, och
reservvägen `laddaOm()` navigerade till `/discount/<kod>?redirect=/cart`.
**Det var redirecten** — och den slår exakt vid kundens FÖRSTA köp, precis som
Axel beskrev. Mätt på heimguard.se, 2-pack med PAKET2 i tom vagn:

```
koden först   → discount_codes []      · 0 kr rabatt   · 1 598 kr · redirect
varorna först → PAKET2 applicable=true · 405 kr rabatt · 1 193 kr · lådan glider in
```

### Fixen

`factory/tema/assets/ms-paket.js` ägs nu av fabriken och skrivs över i varje
butik via `TEMAFILER` i `factory/tema.mjs` (tema-steget i `ops.mjs`). Tre
spärrar + ändrad ordning:

1. `doljd()` — ett gömt kort köper aldrig, och skriver aldrig antal i det
   delade formuläret.
2. `ev.msPaketHanterad` + `stopImmediatePropagation()` — en submit hanteras
   en gång, hur många kort som än finns.
3. Varorna i vagnen FÖRST, rabattkoden efter, och lådan hämtas därefter i ett
   eget `?sections=`-anrop så den visar det rabatterade priset.

Bas-zip:en (`factory/tema/ops-tema.zip`) bär samma fil, och ett test jämför
dem byte för byte så zip:en inte kan halka efter.

**Verifierat efter fixen** (riktig webbläsare, tom korg, mobilvy):

| Vy | Före | Efter |
|---|---|---|
| heimguard.se | redirect · 4 st · 2 946 kr | ✅ lådan glider in · 2 st · 1 199 kr |
| heimguard.se/nb | redirect · 4 st · 2 946 kr | ✅ lådan glider in · 2 st · 1 342 kr |
| tankguard.se | redirect · 4+4 st · 2 175 kr | ✅ lådan glider in · 2 st · 799 kr |
| tankguard.se/nb | redirect · 4+4 st · 2 175 kr | ✅ lådan glider in · 2 st · 799 kr |

1-pack (utan rabattkod) testades separat på båda butikerna: lådan glider in.

### Utrullat till live 2026-09-10

| Butik | Tema | Väg | Läge |
|---|---|---|---|
| HeimGuard `pzjagy-mz` | `204086116700` HeimGuard – CRO v10 (MAIN) | `themeFilesUpsert` direkt mot publicerat tema | ✅ testad SE + /nb + 1-pack |
| TankGuard `y1sj1i-3d` | `198130270552` TankGuard – CRO v1 (MAIN) | Axel klistrade in filen i temaeditorn | ✅ testad SE + /nb |

Butikerna körde originalfilen byte för byte före bytet (jämförd mot
`ops-tema.zip` som den såg ut i commit `9ad60df`), så ingen handredigering
skrevs över. Säkerhetskopiorna togs före skrivningen.

### `cart_type: 'drawer'` sätts ändå

`byggSettingsPatch` i `factory/branding.mjs` sätter `cart_type: 'drawer'`
explicit. Det var **inte** orsaken här — båda butikerna hade redan värdet — men
en klon kan tappa inställningar precis som den tappar app-embeds, och då blir
`product-form.js` rad 64 en riktig redirect. Spärren står kvar.

**Regel:** varukorgen testas på RIKTIGT i kundens vy innan en butik får
annonser — tom korg, lägg i varan, se att lådan glider in, och **räkna varorna
i vagnen**. Ett dubbelköp syns inte på sidan, bara i vagnen. Det står i
`/ny-ops` Definition of done.
