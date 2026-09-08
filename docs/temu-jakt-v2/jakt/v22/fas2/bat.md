# Kluster BÅT (bat) — FAS 2, produktjakt V2.1 · 2026-09-04

**Uppdrag:** nya Temu-listningar åt Bäverbutiken i klustret båt/sjö/hamn, med upptagningssäsongen
(september–oktober) som huvudtillgång. Redan testade objekt i kontot uteslutna enligt uppdraget.

**Dataläge (viktigt för hur domarna ska läsas):**
- `temu.com/se/g-<id>.html` är blockerad för containerns IP → **material och SE-pris = `BLOCKED_SOURCE`**
  på samtliga listningar. Ett tekniskt fel, aldrig ett kommersiellt (V2.1 statusmodell).
  Ett enda anrop slank igenom (601099738026028) och det visade en **annan produkt än Google-titeln** —
  se avslag 3 nedan.
- **Nytt fynd som är värt att spara:** Temus SEO-listsidor renderas fortfarande. `WebFetch` på
  `https://www.temu.com/boat-cover-accessories-s.html` gav **38 listningar med titel, USD-pris och
  antal recensioner**. Det är den enda vägen till pris just nu. Slugen måste vara exakt; av 47 provade
  slugs svarade fyra med innehåll (`boat-cover-accessories`, `boat-storage`, `boat-accessories`,
  `trailer-dolly`) och bara den första renderade produktdata vid hämtning.
- **WebSearch-budgeten (200/session) tog slut efter 12 sökningar.** Resten kördes via Seznam (curl),
  PriceRunner (curl med `-L`) och biltema.se (curl, kategoriträdet svarar 200).
- Ekonomin räknad på **US-pris som proxy**: SE-Temu ≈ USD × 6,96–8,16, landad ≈ SE-Temu × 1,5
  (`economics_source = "us-proxy"`, status `PENDING_VERIFICATION`).

---

## a) Objektuniversumet jag jobbade från

Uppdragets lista plus de objekt jag lade till själv. "Höstpresens" = finns friktionen hos ägaren
i september–oktober 2026?

| Ägt objekt | Vad ägaren behöver just nu (skydda/fästa/rengöra/organisera/förvara/säkra/underhålla/nå/transportera/förbättra) | Höstpresens | Utfall |
|---|---|---|---|
| Båten som tas upp ur sjön | täcka, stötta presenningen, spola skrovet, tömma | ja | Biltema äger hela täckkategorin |
| Presenningen / täckställningen | stötta, spänna, ventilera, skydda mot skav | ja | stötta utesluten + Biltema; **luftare = Tier C** |
| Utombordaren som sitter kvar | säkra trim, låsa mot stöld, skydda propeller | ja | motorlås = Biltema egen underkategori |
| Motorn som konserveras | spola, byta olja, konservera | ja | spolmuff = Biltema **och** Jula Kayoba |
| Utombordaren som tas av | bära, ställa upprätt, förvara | ja | ELIM redan i V2 (Kayoba motorkärra) |
| Båttrailern | rangera på tomten, träffa rampen, nav, belysning, lås | ja | dolly = tung stålvara + vidaXL/VEVOR i svensk kanal |
| Batteriet som vintras | ladda utan el på platsen, bära hem | ja | solcellsladdare 280–675 kr i svensk marketplace |
| Båtens inre (kajuta/sittbrunn) | **ventilera, hålla mögel och fukt borta** | delvis | **Tier B — enda strukturella hålet i Biltemas båtavdelning** |
| Styrpulpeten / instrumenten | skydda | delvis | **Tier C** (ägaren måste mäta) |
| Soltaket / biminin | förvara nedfälld över vintern | ja | **Tier C** (publiken osäker) |
| Kapellet | förvara, knäppa, laga knappar | ja | knappsatser under priströskeln |
| Fendrarna | skydda, förvara | ja | Osculati fenderöverdrag 99–169 kr |
| Bryggan som ska tas upp | dra upp, vinterförvara Y-bom | ja | **0 Temu-listningar** (samma i V2) — enda objektet Biltema saknar kategori för |
| Ankaret / kättingen | förvara, märka | delvis | Biltema har ankare + kättingar som egna kategorier |
| Båtstegen / badstegen | tas in | nej (sommarprodukt) | VEVOR 729–1 513 kr i svensk kanal |
| Ekolodet / sjökortsplottern | tas hem, skyddas | delvis | elektronik, fel prisklass |
| Sjöboden | låsa, organisera | delvis | inte marint, faller utanför klustret |
| Kajaken / roddbåten | täcka, rulla, förvara | ja | överdrag uteslutet, vagn ELIM i V2 |
| Vattenskotern | täcka | ja | ELIM på publik i V2 |
| Båtvaggan / stöttorna | pallning, stötteplattor | ja | Biltema Båtstöttor = egen underkategori |
| Möss i den täckta båten | hålla gnagare borta | ja | bara förbrukningsvaror på Temu |

### Det viktigaste fyndet i klustret

**Biltema är hyllan för hela båtåret.** Kategoriträdet på biltema.se/bat/ (hämtat 2026-09-04) har
16 huvudkategorier: ankra båten (ankare, kättingar), båtkomfort (båtstolar), båtmotor (anoder,
bälgsatser, bränsletillbehör, elmotorer, impellrar, **motorfästen**, **motorlås**, **motorvård**,
sjövattenfilter, styrning), båttrailers, **båtuppläggning (båtöverdrag, båtpresenning, båtstöttor,
täckställning)**, båtvård (färger, epoxi, gelcoat, glasfiberväv, nätning, polyester, skrovvård,
tätning), däcksutrustning, elutrustning, förtöjning (fendrar), marinbatterier (batteriboxar),
pumpar, säkerhetsutrustning, tågvirke, teakdetaljer, vattensport, VVS (slangar).

Det förklarar varför **30 av 71 listningar föll på hyllan** — fler än på någon annan gate.
Det Biltema *inte* har någon kategori för är: **ventilation/avfuktning, brygga, kajak/kanot,
kapelltillbehör utöver överdrag, elektronik**. Fyra av de fem hålen ledde ingenstans i den här
körningen; det femte (ventilation) är klustrets enda Tier B.

---

## b) Sökfraserna

**Temu-listningsjakt — WebSearch `site:temu.com` (10):**
boat solar powered vent ventilator cabin moisture · boat fender cover storage bag rack holder ·
dock cart marine harbor trolley balloon wheels · boat trailer dolly mover hand tow jockey wheel ·
outboard motor flush bag winterizing engine muffs tank · boat hull cleaning brush scraper barnacle
bottom telescopic · boat center console cover steering wheel helm marine · boat battery solar trickle
charger maintainer 12v marine · rodent mouse repellent boat rv winter storage protection ·
boat boarding ladder folding telescoping marine stainless

**Temu-listningsjakt — Seznam `site:temu.com` (6):**
boat cover support pole winter storage · boat winterization winterize kit engine storage ·
marine dehumidifier moisture absorber boat cabin renewable · boat trailer bearing protector dust cap
grease · boat console cover center console waterproof · bimini top boot storage cover marine

**Temu SEO-sidor (WebFetch):** `boat-cover-accessories-s.html` (38 listningar med USD-pris) ·
`boat-tarp`, `trailer-accessories`, `dock-accessories`, `boat-storage`, `boat-accessories`,
`search_result.html` (renderade inte) · 47 slugs sondade via curl-titel.

**Svenska hyllan — ägarens svenska ord (5 WebSearch + 14 PriceRunner + Biltemas kategoriträd):**
motorlås utombordare stöldskydd biltema jula pris · motorspolare spolöron utombordare biltema jula pris ·
biltema båtuppläggning täckställning presenningsstöd bockar sortiment · solcellsventilator solcellsfläkt
båt vinterförvaring seasea watski · skavskydd kantskydd båtpresenning täckställning biltema seasea ·
PriceRunner: solcellsventilator · solcellsladdare 12v underhållsladdning · styrpulpetkapell ·
konsolkapell båt · fenderöverdrag · hamnvagn · trailerflyttare · båtstege uppläggning ·
presenningsventil båt · avfuktare båt vinterförvaring · motorlyft utombordare · bimini båt ·
kapellpåse båt · solcellsventilator båt marinco seatec ·
curl biltema.se: /bat/ + /batupplaggning/ + /battrailers/ + /batmotor/ + /dacksutrustning/ +
/marinbatterier-och-tillbehor/ + /fortojning/ + /batvard/

**Publikkälla:** transportstyrelsen.se, Båtlivsundersökningen 2025.

---

## c) Tratten

| Gate | Kvar | Vad som föll |
|---|---|---|
| Råkandidater (listningar) | **71** | 63 nya + 2 redan kända (`602380619876633`, `603262161892743`) + 6 utan pris |
| 1 OBJEKT | 63 | 8 st: gnagarmedel ×5 (förbrukning), fuktabsorbent ×2 (förbrukning), förvaringsnät ombord |
| 2 PRESENS | 43 | 20 st: badstegar ×6, hamn-/strandvagnar ×6, biminitak ×5, EVA-däckmatta, mugghållare, rattöverdrag |
| 3 SVENSKA HYLLAN | **13** | **30 st** — kapell/överdrag ×15 (Biltema båtuppläggning), trailerdolly ×6, solcellsladdare ×4, presenningsstöd ×3, fenderöverdrag, dragkulskydd |
| 4 MATERIAL | 13 | 0 fällda — **alla 13 = `BLOCKED_SOURCE`**, ingen video och ingen hero gick att se |
| 5 EKONOMI | 9 | 4 st: presenningsvikt ($144,54 → landad 1 509–1 769 kr), vinschöverdrag ($4,48), knappsatser ×2 |
| 6 VARIANT | **7** | 2 st: konsolskydd ×2 — måtten står i tum och ägaren måste mäta pulpeten |
| 7 HOOK | 7 | 0 — alla sju fick en ägarfråga på ≤ 7 ord |
| 8 PUBLIK | 7 | 0 fällda; bimini-boot står som OSÄKER |
| **Tier A / B / C / ELIM** (listningar) | **0 / 4 / 5 / 62** | På konceptnivå: 26 koncept, varav **1 Tier B** och **3 Tier C** |

Koncepttratten: **26 koncept** → 23 efter objekt → 17 efter presens → **8 efter hyllan** → 7 efter
att bryggan föll på att listningar saknas → 4 efter ekonomi → **3 slutliga överlevare**
(B1 solcellsventilation, C1 presenningsluftare, C3 bimini-boot). Konsolskyddet (C2) föll på
variantgaten och redovisas som Tier C, inte som överlevare.
Fyra koncept fälldes av hyllan *innan* någon Temu-sökning gjordes (motorlås, spolmuff, skrovtvätt,
plus bryggan som föll på att listningar saknas helt) — det är V2.1-ordningen som fungerar: de kostade
noll hämtbudget.

---

## d) Fältmall — Tier B och Tier C

### B1. Solcellsdriven ventilation av vinterförvarad båt
Listningar: `601099699520443` (5 W, metallkåpa), `601099624855365` (10 W 12 V, rörmonterad),
`601099738026028` (2-pack RV-takventilator — se avslag 3), `601099521976797` (bilfönsterform).
Status: **`ALTERNATIVE_LISTING_REQUIRED`** — konceptet håller, ingen av listningarna är den marina
runda däcksventilatorn.

- **PRODUCT:** Solcellsdriven ventilationsfläkt som suger ut fuktig luft ur en täckt båt utan el.
- **TEMU URL:** https://www.temu.com/se/g-601099699520443.html
- **OBJECT/OWNER:** Båten som ligger uppallad under presenning oktober–april. 19 % av svenska hushåll
  äger minst en fritidsbåt.
- **EXISTING FRICTION:** Under en tät presenning står luften still. Kondens droppar på dynor, kapell
  och inredning; till våren luktar båten mögel och dynorna är fläckiga. Det finns ingen el på
  uppläggningsplatsen.
- **OLD WAY:** Fuktabsorbent i hink (1852 Marine Luftavfuktare **85 kr**, förbrukning), en glipa i
  presenningen, eller bära hem alla dynor.
- **PRODUCT'S ROLE:** Sätts i en lucka eller i presenningens öppning och går på dagsljus hela vintern.
- **WHY THE AD DOES NOT NEED TO CREATE DEMAND:** Halvsant — och det är kandidatens svaghet. Ägaren
  känner igen mögellukten, men *skadan* uppstår i februari–april. Det är samma struktur som kranskyddet,
  som gick över break-even och pausades.
- **TEMU MATERIAL:** `BLOCKED_SOURCE`. Indicium ur titlarna: 601099699520443 har metallkåpa och rund
  form (närmast ankarets utseende), 601099624855365 är rörmonterad och längre från den marina formen.
- **0–3 SECOND PROOF:** `BLOCKED_SOURCE`.
- **SWEDISH SHELF STATUS:** **PASS via ankarundantaget.** Biltemas båtavdelning har ingen
  ventilationskategori alls (kartlagt 2026-09-04). Svensk kanal = fackhandel: **Seatec solcellsventilator
  rostfri kåpa Ø191 mm 1 249 kr** (PriceRunner), Marinco 3"/4" hos SeaSea **2 792–3 550 kr**,
  Solar Plus Select RV Mini V2 3 056 kr. Vid 649 kr blir ankaret 1,92× (Seatec) till 4,4× (Marinco).
- **TEMU PRICE:** `null` (blockerad).
- **PLAUSIBLE SWEDISH PRICE:** 599–699 kr.
- **ECONOMIC ROOM:** UNKNOWN tills priset finns. Flerköpsskäl finns (en fram, en akter).
- **VARIANT FRICTION:** Låg — en variant, ingen parameter att mäta.
- **≤7 WORD OWNERSHIP HOOK:** "Luktar båten mögel varje vår?" (5 ord)
- **WINNER-STRUCTURE MATCH:** 55 · **CATEGORY NOVELTY:** 80
- **TOP 3 REASONS:** (1) enda strukturella hålet i Biltemas båtavdelning, (2) ankare 1,9–4,4× över vårt
  pris i exakt den kanal kunden googlar, (3) en variant, ingen montering på den lucksatta varianten,
  publik på ~900 000 hushåll.
- **BIGGEST REASON IT COULD FAIL:** Fördröjd payoff (kranskyddsfällan) + den marina formen finns inte
  i någon av de fyra funna listningarna; en riktig rund däcksventilator kräver dessutom hål i däck.
- **CONFIDENCE:** MEDIUM.

### C1. Presenningens luftare/ventil
Listningar: `601102886923859` ($10,53, 2 rec.), `606169871528449` ($13,55).

- **PRODUCT:** Vattentät ventil som sätts i båtpresenningen så att luften cirkulerar.
- **TEMU URL:** https://www.temu.com/se/g-601102886923859.html
- **OBJECT/OWNER:** Presenningen över den uppallade båten. **FRICTION:** kondens under presenningen —
  och täckningen sker just nu, i oktober. **OLD WAY:** lämna en glipa eller skära ett hål.
- **TEMU MATERIAL:** `BLOCKED_SOURCE`. Indicium: en 10 cm plastdetalj, heron är sannolikt en packshot
  utan båt — svag annonskropp.
- **SWEDISH SHELF STATUS:** `PENDING_VERIFICATION`. Noll träffar på "presenningsventil båt" i
  PriceRunner; Biltemas täckställningskategori är JS-renderad och gick inte att produktläsa.
- **TEMU PRICE:** 10,53 USD (SEO-sidan) → SE-Temu 73–86 kr → **landad 110–129 kr**.
- **PLAUSIBLE SWEDISH PRICE:** 349 kr (2-pack) → uppslag **2,71–3,18×**, BE-CPA 220–239 kr → ekonomin
  klarar sig, till och med bra.
- **VARIANT FRICTION:** Ingen. **HOOK:** "Bildas det kondens under båtpresenningen?" (6 ord)
- **MATCH:** 40 · **NOVELTY:** 60 · **CONFIDENCE:** LOW.
- **BIGGEST REASON IT COULD FAIL:** Gratislösningen (en glipa) fungerar, och 349 kr för en plastventil
  är svårt att försvara i flödet. Ekonomiskt grönt, kommersiellt tunt.

### C2. Styrpulpet-/konsolskydd
Listningar: `602767166902424` (grå, upp till 36×44×60 tum), `602857361244554` (för T-top, 20 fot).

- **OBJECT/OWNER:** Styrpulpeten med ratt, reglage och instrument på en öppen styrpulpetbåt — den
  vanligaste svenska motorbåtstypen. **FRICTION:** pulpeten är det dyraste på en öppen båt och står
  blottad sent i säsongen. **OLD WAY:** helpresenning, eller ingenting.
- **SWEDISH SHELF STATUS:** `PENDING_VERIFICATION` — **noll träffar** på "styrpulpetkapell" och
  "konsolkapell båt" i PriceRunner; svensk kanal är kapellmakare som syr på mått. Biltema har bara
  båtöverdrag/båtpresenning. Ankarpriset är alltså troligt men overifierat.
- **TEMU PRICE / MATERIAL:** `BLOCKED_SOURCE`.
- **VARIANT FRICTION:** **FAIL.** Måtten står i tum och ägaren måste mäta pulpeten. Motorhöljets
  storlekstabell i bild kostade −869 kr; det här är samma fälla ett steg värre.
- **HOOK:** "Står styrpulpeten oskyddad i vinter?" (5 ord) · **MATCH:** 45 · **CONFIDENCE:** LOW.

### C3. Bimini-/soltakets förvaringsöverdrag ("boot")
Listning: `607430897443167`, $29,48.

- **FRICTION:** Det nedfällda soltaket ligger i en hög på däck hela vintern, skaver mot rören och
  möglar i vecken. Nedfällningen sker nu. **OLD WAY:** sopsäck och tejp.
- **SWEDISH SHELF:** `PENDING_VERIFICATION` — svensk kanal säljer själva biminin (vidaXL/VEVOR
  1 203–3 428 kr) men förvaringsöverdraget syns inte. Biltema har ingen biminikategori.
- **ECONOMICS:** landad 308–361 kr; vid 849 kr blir uppslaget **2,35–2,76×** (precis under 2,4 i den
  dyra änden), BE-CPA 488 kr. Vid 899 kr: 2,49–2,92×.
- **VARIANT:** längdklasser. **HOOK:** "Har du soltak på båten?" (5 ord) · **MATCH:** 50 ·
  **CONFIDENCE:** LOW.
- **BIGGEST REASON IT COULD FAIL:** Bimini är en amerikansk båtform. Hur många svenska hushåll som har
  en bimini att förvara är overifierat — svenska båtar har oftare helkapell. Och det är ännu ett kapell
  i en kategori kontot redan har flera produkter i.

---

## e) Lärorika avslag

**1. Motorlås och spolmuff — hela konserveringssäsongen är redan Biltemas.**
De två starkaste höstfriktionerna i klustret (låsa fast motorn på uppläggningsplatsen, spola motorn
med sötvatten vid upptagningen) föll båda på gate 3 innan en enda Temu-sökning gjordes. Biltema har
`/bat/batmotor/motorlas/` och `/bat/batmotor/motorvard/` som **egna underkategorier**, och Jula säljer
Kayoba Marine Spolmuff. Lärdomen: i båtklustret ska hyllan kollas som *kategoriträd*, inte som
produktsökning — Biltemas båtavdelning har 16 kategorier och täcker ankare, motor, uppläggning,
båtvård, förtöjning, batterier, pumpar, tågvirke och trailer. V2-rapporten kunde inte se det eftersom
PriceRunner inte indexerar Biltema; curl mot biltema.se/bat/ gör det på tio sekunder.

**2. Presenningsstöd — konceptet är dubbelt dött, inte bara hyllodött.**
V2 satte presenningsstöd som klustrets bästa kandidat (B1) med reservationen "Biltema obekräftat".
Nu är båda ändarna stängda: Biltema säljer **Presenningsstötta, teleskopisk** (art. 2000034614), och
SEO-sidan visar att Temus stöd kostar **54,55–84,52 USD**, alltså landad 702–823 kr. Ett svenskt pris
på 999 kr ger bara 1,21–1,42× — under 2,4-kravet. Produkten hade fallit på ekonomin även om hyllan
varit tom. Det är samma mönster som gummi-motorstödet i V2: skrymmande stål- och plastvaror i
båtsegmentet klarar inte uppslaget.

**3. `601099738026028` — Google-titeln och listningen är inte samma produkt.**
Ett enda `/se`-anrop slank igenom blockeringen. Google-titeln lovade "2-pack solar powered RV ceiling
vent fan"; sidan visade **"2 st Vita RV Ventilationsfläktblad, 15,24 cm, ersättning för 12V
D-skaftmotorer, 69,64 kr, 25 omdömen, ej tillgänglig för köp"** — alltså reservdelsblad, inte en
ventilator, och dessutom avpublicerad. Sökmotorns titel är ingen listningsdata. Skriv aldrig ett
produktpåstående på en sökträffstitel; det är precis det felet som gjorde att en leverantörsvideo av
fel produkt (soptunneklistermärkena) gav ROAS 0,56.

**4. Bryggan gav noll listningar för andra körningen i rad.**
Bryggan är det enda objektet i universumet där Biltemas båtavdelning inte har någon kategori alls, och
"ta upp bryggan före isen" är en verklig oktoberhandling. Både V2 och den här körningen hittade **noll**
Temu-listningar. Slutsatsen är att leverantörsledet saknar produkten, inte att hyllan är fri —
sluta lägga sökbudget här.

---

## Att göra när Temu släpper

Prioritetsordning för hämtning + frames: `601099699520443` → `601099624855365` → `601102886923859` →
`607430897443167` → `602767166902424` → `606169871528449`.
Alternativ listning behövs för B1: sök **rund marin däcksventilator i rostfritt/vit ABS**
("solar deck vent 3 inch stainless marine", "solar powered cowl vent boat hatch") — de fyra funna
listningarna har fel form.
Hyllkoll som återstår: Biltemas täckställningskategori på produktnivå (presenningsluftare finns den?),
priset på ett svenskt konsolkapell hos en kapellmakare, och Ad Library SE på "solcellsventilator".
