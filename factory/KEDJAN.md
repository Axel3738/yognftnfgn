# KEDJAN — en fabrik, en kod, en körning

**Varför den här filen finns (2026-09-09).** Tre sessioner (TankGuard 09-08,
DryTrek 09-09, TackleBay 09-09) byggde varsin komplett fabrik på varsin gren.
`main` fick bara dokumentationen. Resultatet: tre `paket.mjs`, tre
`marknad`-moduler, fyra översättningsmoduler, två `filer.mjs`, två `logga.mjs`,
och en `/ny-ops` som beskrev steg som ingen kod på `main` kunde köra. Varje ny
session byggde om samma sak, med nya buggar. Det är rotorsaken till "halvdana
fixar som skapar nya problem".

Den här filen är **kontraktet**: vilken modul som äger vilken funktion, vilka
exporter andra moduler får luta sig mot, och i vilken ordning `ops.mjs` kör.
Bygg aldrig en parallell modul för något som står här — utöka den som finns.

---

## Regler som gäller hela kedjan

1. **Ett tema-id, låst i state.** `tema-upload` skriver `arbetstemaId` i
   state. Varje steg som rör temat använder `hamtaArbetstema(temaId)` ur
   `shopify.mjs`. Aldrig "första UNPUBLISHED". Efter varje skrivning läses
   filen tillbaka ur samma tema (`verifieraTemafiler`).
2. **Idempotent.** Varje steg tål att köras två gånger. Produkten slås upp på
   handle och uppdateras med id + befintlig status. Metaobjekt upsertas på
   handle. Rabattkoder uppdateras, aldrig dubbleras.
3. **Grön konfiguration är inte en grön butik.** QA-steget hämtar startsidans
   och produktsidans RIKTIGA HTML (`kundvy-kor.mjs`, storefront-lösenord ur
   env) och kör `kundvy.mjs`. Utan HTML: rött, aldrig grönt.
4. **Två listor i slutrapporten.** `Gjort av mig` / `Väntar på en människa`.
   Ett steg där en person ska klicka står aldrig i den första.
5. **Noll npm-beroenden i `factory/`.** `sharp` får bara användas i
   `logga-generera.mjs` och `bildtext.mjs`, som är valfria verktyg utanför
   kedjan och säger tydligt ifrån om `sharp` saknas.
6. **Copy skrivs av en subagent** (CLAUDE.md regel 6). Kedjan skriver
   underlag (`oversattning-sv.json`), stannar med "manuell: översätt", och
   läser sedan `oversattning-<locale>.json`. Koden översätter aldrig själv.
7. **Inga butiksspecifika hårdkodningar** i kedjans moduler: brandprefix,
   accentfärg, marknader, sidhandles och svenska markörord kommer ur
   `butiker/<id>.yaml` / `produkter/<id>.yaml`. Engångsskript för en butik
   ligger under `factory/output/<butik>/` eller tas bort.

---

## Modulägare (en modul per funktion)

| Funktion | Modul (ägare) | Byggd av | Borttaget / sammanslaget |
|---|---|---|---|
| Anslutning + token ur butikens app | `token.mjs` | jjwesr | — (51zqlx:s `losNycklar` i shopify.mjs tas inte in) |
| Tema-zip → UNPUBLISHED-tema, vänta på uppackning | `tema-upload.mjs` | iqneba | `tema-upp.mjs` (jjwesr) |
| Shopify Admin API (graphql, produkt, sidor, meny, kollektion, teman, frakt) | `shopify.mjs` | iqneba + damasker + jjwesr | — |
| Filer → `shopify://shop_images/<namn med ändelse>` (URL eller lokal fil, UUID-suffix, väntar på READY) | `filer.mjs` | damasker + jjwesr | — |
| Logga + favicon in i temat | `logga.mjs` | iqneba | `identitet.mjs` (damasker; menydelen flyttar till `meny`-steget i ops.mjs) |
| Tre loggvarianter som SVG/PNG (valfritt verktyg, sharp) | `logga-generera.mjs` | jjwesr (`logga.mjs`) | — |
| Vektortext på bild, [SV]/[NO] (valfritt verktyg, sharp) | `bildtext.mjs` | jjwesr | — |
| Tema-sektioner, produktmall (A/B-block, bonus-kryssruta), korg-upsell, header-group, settings-rensning, gallerifilter, ms-paket.js | `tema.mjs` | main + cart-drawer + jjwesr (`tema-mall.mjs`) | `tema-mall.mjs` |
| Av-brandning: ta bort källsektioner (ms-skrapkort, ms-cookies, newsletter_enable, header-annonser) + skriv om källtext/mejl/domän/sociala länkar | `avbranda.mjs` | damasker + main (`avbrandaSektionsgrupp`) | — |
| Källskanning (ren logik + CLI) | `kallskanning.mjs` | main (tre buggar rättade) | — |
| Hämta ALLA temafiler paginerat | `kallskanning-kor.mjs` | damasker | — |
| Startsida (index.json) + footer-group ur `butik.startsida` | `startsida.mjs` | iqneba | damasker `startsida.mjs`, `startsidor/<id>.json` (sv-copyn flyttar till `butiker/<id>.yaml`) |
| Paketnivåer A/B: metaobjekt, rabattkoder, mitten förvald, gratis bonus | `paket.mjs` | iqneba + jjwesr | damasker `paket.mjs`, `paketnivaer/<id>.json` |
| Bonusprodukten (Q4) som egen produkt | `bonus.mjs` | jjwesr | — |
| Lagerpolicy CONTINUE + tracked:false, tillbakaläsning | `lagerpolicy.mjs` | damasker | — |
| Marknad + locale + webPresence + translationsRegister på ALLT | `marknad.mjs` | iqneba + jjwesr (`marknader.mjs`) | `marknader.mjs`, `oversatt.mjs`, `oversatt-tema.mjs`, `oversatt-butik.mjs`, `oversattningar/` |
| Översättningsunderlag (`oversattning-sv.json`) + läsning av `oversattning-<locale>.json` | `oversattning.mjs` | jjwesr | — |
| Granska översättningstäckning per resurstyp (läs-bar) | `oversattning-granska.mjs` | stoo16 | — |
| Kundvy: hämta riktig HTML (lösenord, locale) | `kundvy-kor.mjs` | damasker + jjwesr (`kolla.mjs`) | `kolla.mjs`, `trippelkoll-tankguard.mjs` |
| Kundvy: kontroller på HTML (brand, logga, hero, meny, produkt, struktur, inga svenska markörer på /nb) | `kundvy.mjs` | main + jjwesr | — |
| Trippelkoll: läs tillbaka hela butiken ur API och jämför mot yaml | `trippelkoll.mjs` | damasker | — |
| Judge.me: API-import (kväll/rutin) och app-CSV med originaldatum | `judgeme.mjs` + `tools/judgeme-import.mjs` | main + jjwesr | — |
| Pixel (med fallback på företaget) + CAPI-användare | `meta-setup.mjs` | main + damasker + jjwesr | — |
| Discord-kanaler | `discord.mjs` | main + jjwesr | — |
| VA-checklistan (valuta först, storefront-lösenord, ägare) | `checklista.mjs` | iqneba + jjwesr | `va-checklist-docx.mjs` (51zqlx, tas inte in) |
| Konfig: mallar, validering, yaml-läsare, produktplan | `butik-mall.yaml`, `produkt-mall.yaml`, `validera.mjs`, `butik.mjs`, `yaml.mjs`, `build-store.mjs` | alla | — |
| Källannonser, media, villkor (FAS2, rörs inte i den här rundan) | `kallannonser.mjs`, `media-upload.mjs`, `villkorsskanning.mjs`, `kampanjkoll.mjs`, `brand-detektor.mjs`, `bygg-tankguard*.mjs`, `media-grind.mjs`, `srt-fixa.mjs` | — | — |

---

## Exportkontrakt (det andra moduler får luta sig mot)

```
shopify.mjs
  graphql(query, variables) → data                (kastar på userErrors)
  kontrolleraAnslutning() → { name, myshopifyDomain, primaryDomain }
  hamtaArbetstema(temaId?) → { id, name, role }   id först; annars CRO-tema med role MAIN,
                                                   annars CRO UNPUBLISHED; annars kastar
  hamtaUtkastTema() → tema|null                    (bakåtkompatibel, används inte av kedjan)
  hamtaProduktViaHandle(handle) → { id, status, media:[{id, filnamn}] } | null
  skapaProdukt(input, { id?, status? }) → { id, handle, status, variantIds }
  publiceraIButiken(gid), publiceraProdukt(id)
  hamtaKollektion(handle), skrivKollektion(input)
  skrivSida(handle, {title, body}), skrivPolicy(typ, body)
  hamtaMeny(handle), skrivMeny(handle, rader)
  hamtaFraktzoner(), tillampaFraktatgarder(atgarder)   (villkorade metoder rivs + byggs om)
  hamtaTemafil(temaId, fil) → sträng|null
  skrivTemafiler(temaId, {fil: innehåll}), verifieraTemafiler(temaId, {fil: innehåll}) → { ok, fel:[] }
  skrivMetafalt(agareId, lista)

token.mjs
  mintaToken({ shop, clientId, clientSecret }) → { token, expiresAt }
  lasButik(shop, token) → { name, domain, teman }
  spärrar(butikId, shop) → { ok, skal }   state-fil för ANNAN butik på samma shop = stopp;
                                          förbjudna domäner (HeimGuard pzjagy-mz, Bäverbutiken) = stopp
  skrivEnv({ SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_TOKEN, SHOPIFY_ADMIN_TOKEN_<BUTIK> })

tema-upload.mjs
  laddaUppTema(namn) → { id, name }         stagedUpload FILE + themeCreate, väntar på uppackning
  TEMA_ZIP

filer.mjs
  laddaUppFiler([{ url|sokvag, alt? }]) → [{ namn, handle:'shopify://shop_images/<lagrat namn.ext>', url, id }]
                                            (.mp4/.webm/.mov i listan går via laddaUppVideo)
  laddaUppBild(sokvagEllerUrl, { alt? }) → samma objekt
  laddaUppVideo(sokvagEllerUrl, { alt? }) → { namn, handle:null, url, id, kallor }   url = transkodad mp4 (sources[])
                                            ⚠️ MÄTT 2026-09-10: Shopify tar inga videor på TRIAL (API-GRANSER.md)
  hittaBild(filnamn) → objekt|null          idempotens på filnamnsstam
  hittaVideo(filnamn) → objekt|null
  stagedUpload(sokvag, mime) → resourceUrl  resurs ur mime: IMAGE / VIDEO / FILE (stagedResurs)
  filnamnUrUrl(url) → 'namn.ext'

butik.mjs
  valideraButik(b) → { fel, varningar }, sammanfoga(butik, produkt)
  arNischbutik(butik, produkter) → bool     två+ produktfiler ELLER butik.kollektion.alltid: true —
                                            styr kollektion-steget, startsidan, huvudmenyn och
                                            översättningsunderlaget (AdventLane 2026-09-10)

logga.mjs
  laddaUppLogga(temaId, { logga, favicon?, bredd? }) → { logo, favicon }   skriver settings_data.json + läser tillbaka

tema.mjs
  SEKTIONER, TEMAFILER, SEKTIONSORDNING_TEMA
  byggProduktTemplate(befintlig, { produkt, butik }) → json   (A/B-paketblock + bonus-kryssruta när offer säger det)
  byggKorgUpsell(upsellHandle), byggTillagg(bonusHandle, texter)
  byggHeaderGroup(butik) → json                 (annonsrad + header, inga källsektioner)
  rensaSettings(settingsData, { logga?, favicon? }) → settingsData   (sociala länkar tömda, brand_description,
                                                                       app-embeds = enbart Judge.me)
  msHeadGallerifilter(locales) → liquid

avbranda.mjs
  avbranda(ctx, temaId, { torr }) → { borttagnaSektioner:[], omskrivnaFiler:[], kvar:[] }
  byggRegler(butik) (text/mejl/domän/brandnamn), stadaSettings, byggFooterblock

kallskanning.mjs
  KALLORD, KALLSEKTIONER, avbrandaSektionsgrupp(json) → { json, borttaget:[] }
  skannaFil(namn, innehåll) → träffar[], skannaTema(filer) → { rent, traffar }, rapport(...)
  CLI: node factory/kallskanning.mjs <butik-id> [--tema <id>]   exit 1 vid träff
kallskanning-kor.mjs
  hamtaAllaTemafiler(temaId) → { fil: innehåll }

startsida.mjs
  byggStartsida(butik, produkter, { hero }) → index.json    (flerprodukt = kollektion, enprodukt = featured-product)
  byggFooterGroup(befintlig, butik) → json
  startsideRader(...)

paket.mjs
  METAOBJEKT_TYP = 'ms_paketniva', FALT, NIVAER (default A/B, överstyrs av produkt.offer.paket)
  forvaldIndex(n) → ⌈n/2⌉−1
  byggPaketplan(produkt, butik) → { A:[niva], B:[niva] }   kastar om första nivån är förvald,
                                                             om fastpris > ordinarie, om bonus saknar pris
  byggPaket(ctx, produkt, { torr, tvinga }) → { nivaer, koder }   valutaspärr: shop.currencyCode ≠ butik.valuta = stopp
  sakerstallDefinition(), skrivNiva(...), sakerstallRabattkod(...)

bonus.mjs
  byggBonusInput(produkt) → productSet-input
  sakerstallBonus(ctx, produkt) → { produkt_id, variant_id }   (skriver tillbaka i produktfilen)

lagerpolicy.mjs
  lasVarianter(produktId), sattContinue(ctx, produktId, { torr }) → { andrade, verifierade }

marknad.mjs
  hamtaLage() → { locales, marknader, webPresences }
  sakerstallLocale(kod), sakerstallMarknad(marknad), laggTillAlternateLocale(kod)
  samlaResurser(ctx, temaId) → [{ id, typ }]    produkt, metafält, varianter, sidor, menyer, metaobjekt,
                                                  SHOP_POLICY, temats JSON-mallar + sektionsgrupper
  hamtaOversattbara(id) → [{ key, value, digest }]
  registrera(id, locale, [{ key, value, digest }])
  oversattAllt(ctx, locale, oversattning, { temaId, torr }) → { registrerade, saknade:[] }
  CLI: node factory/marknad.mjs <butik-id> [--locale nb] [--torr]

oversattning.mjs
  byggUnderlag(ctx, produkter) → skriver output/<butik>/oversattning-sv.json, returnerar objektet
  lasOversattning(butikId, locale) → objekt|null
oversattning-granska.mjs
  granska(locale, { allt }) → { perTyp:[{ typ, kallor, oversatta, saknade }] }

kundvy-kor.mjs
  hamtaSida(ctx, vag, { locale, losenord, temaId }) → html    (kakburk, /password, preview_theme_id bara om ej MAIN)
  hamtaStartsida(ctx, ...) , hamtaProduktsida(ctx, handle, ...)
kundvy.mjs
  kontrolleraKundvy(html, butik, produkt) → { ok, fel:[], varningar:[] }
  strukturkoll(html, { produkt, butik }) → { ok, fel:[] }     opf-sektioner, ms-paket, Judge.me, opf-brand.css
  svenskaMarkorer(html, markorer) → []                          markorer ur butik.yaml (markorer_sv), inte hårdkodade
  DEFAULTSPAR, byggKrav

trippelkoll.mjs
  samlaLage(ctx, butik, produkter) → { grona:[], fel:[], manuella:[] }   krav ur yaml (marknader), inte hårdkodade

judgeme.mjs
  byggJudgeMeCsv, byggJudgeMeAppCsv, byggJudgeMeCsvOversatt, judgeMeDatum, JUDGEME_KOLUMNER, JUDGEME_APP_KOLUMNER
tools/judgeme-import.mjs
  oförändrade flaggor för rutinerna (/no-recensioner, /launch kör utan nya krav);
  nytt: --mejlsuffix <domän>, --krav-datum (stoppar utan datum — opt-in, ALDRIG default)

meta-setup.mjs
  skapaPixel(namn, { kontoId, foretagId }) → { id }   fallback #6200 → pixel på företaget + shared_accounts
  hamtaPixlar(kontoId), tilldelaCapiAnvandare(pixelId)

checklista.mjs
  byggChecklista(butik, produkter, { pixelId?, temaNamn? }) → markdown   (butiksnivå, EN fil)

build-store.mjs
  byggPlan(produkt, butik) → { input }   status ACTIVE, inventoryPolicy CONTINUE, tracked false,
                                          files tål sträng eller { url, alt }
```

---

## Körordningen i `ops.mjs`

`node factory/ops.mjs factory/butiker/<butik>.yaml factory/produkter/<p1>.yaml [<p2>.yaml …] [--dry-run] [--resume] [--igen <steg>] [--launch]`

Nivå `butik` körs en gång, nivå `produkt` en gång per produktfil. State per nivå
(`<butik>--_butik.json`, `<butik>--<produkt>.json`).

| # | steg | nivå | modul | stoppar bygget vid fel? |
|---|---|---|---|---|
| 0 | `anslutning` | butik | token.mjs → "Connected: <domän> ✓" | ja — fel butik, gammal state, förbjuden domän |
| 1 | `tema-upload` | butik | tema-upload.mjs → `arbetstemaId` i state | ja |
| 2 | `brand` | butik | branding.mjs + tema.rensaSettings | ja |
| 3 | `tema` | butik | tema.mjs (SEKTIONER + TEMAFILER + header-group), verifierat med omförsök | ja |
| 4 | `avbrandning` | butik | avbranda.mjs (sektioner + text) | ja |
| 5 | `logga` | butik | logga.mjs (kräver `branding.logga` fil eller output/<butik>/logga.png; annars manuell) | nej → manuell |
| 6 | `produkt` | produkt | build-store + shopify.skapaProdukt (idempotent, ACTIVE) + publiceraIButiken | ja |
| 7 | `metafalt` | produkt | metafalt.mjs | ja |
| 8 | `lagerpolicy` | produkt | lagerpolicy.mjs (tillbakaläsning) | ja |
| 9 | `bonus` | produkt | bonus.mjs (bara om offer.bonus_produkt.handle) | nej → manuell "välj bonusprodukt" |
| 10 | `paket` | produkt | paket.mjs (valutaspärr) | nej → manuell "byt valuta i admin, kör --igen paket" |
| 11 | `kollektion` | butik | shopify.skrivKollektion (flerprodukt, eller nischbutik med `kollektion.alltid`) | ja |
| 12 | `startsida` | butik | startsida.mjs (+ hero via filer.mjs) | ja |
| 13 | `sidor`, `policyer`, `meny`, `frakt`, `huvudmarknad` | butik | som i dag (meny = huvudmeny Hem/<produkter>/Frakt & retur/Kontakt + sidfot) | ja |
| 14 | `kallskanning` | butik | kallskanning-kor + kallskanning på ALLA filer — spärr | ja |
| 15 | `recensioner` | produkt | judgeme.mjs: app-CSV alltid; API-import om token | nej → manuell |
| 16 | `marknad` | butik | marknad.mjs: marknad + locale + webPresence | ja |
| 17 | `oversatt` | butik | oversattning.byggUnderlag → saknas `oversattning-<locale>.json`: manuell "översätt med subagent"; finns: marknad.oversattAllt + oversattning-granska | nej → manuell |
| 18 | `qa` | produkt+butik | kontroll.mjs + kundvy-kor/kundvy (riktig HTML) + trippelkoll | rött = inte klart |
| 19 | `checklista` | butik | checklista.mjs → output/<butik>/CHECKLISTA.md | — |
| 20 | `slutrapport` | butik | två listor ur state: Gjort av mig / Väntar på en människa | — |

`--launch`: publicerar produkter i Online Store och skriver ut vilket tema
VA:n ska publicera. `--store-ready`: kör slutsteget (recensioner via API,
pixel + CAPI, Discord) — det som `Store ready: <namn>` utlöser.

---

## Vad som INTE togs in (och varför)

- `claude/ny-ops-ibc-tank-cover-51zqlx`: äldre än allt annat, ingen gemensam
  historik i klonen, förarbete som jjwesr gjorde om. Enda unika: Word-export
  av checklistan (kräver npm `docx`).
- jjwesr:s hårda stopp i `tools/judgeme-import.mjs` utan `--utan-datum`:
  skulle stoppa nattrutinen `/no-recensioner`. Datumkravet är opt-in.
- jjwesr:s `butiker/tankguard.yaml` (NOK som valuta): stoo16:s version är
  avläst ur live-butiken (SEK) och gäller.
