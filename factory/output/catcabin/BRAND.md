# CatCabin — brandsteget (fas 1, steg 2–3)

Datum: 2026-09-11. Källa: `/ny-ops` med EN Bäverbutik-länk + butiksadressen
`ras1t2-2x.myshopify.com` i prompten (steg 0: "Connected: ras1t2-2x.myshopify.com ✓",
butik "My Store 5", **PHP**, Horizon (MAIN), inga produkter, appen "Factory" med
alla 16 krävda scopes). Enproduktsbutik — prompten säger inte nischbutik.
Brandtexterna får ändå aldrig låsa sig vid just den här kojan: nästa produkt
kan vara en värmedyna, en matstation eller en kattlucka för samma utekatt.

## Källprodukten

| | Isolerad Utekattkoja på Ben – Upphöjd Från Kall och Blöt Mark |
|---|---|
| Handle | `isolerad-utekattkoja-torr-och-vindtat-plats-utomhus` (id 16516655382877, skapad 2026-09-07) |
| Pris | 789 kr (jämförpris 1 039 kr) — samma pris i OPS-butiken, annonserna brand-swappas |
| Varianter | Grå (`TEMU-5030003647894-GR`), Gräsgrön (`-GG`), Svart (`-SV`) — bilderna visar den grå |
| Bilder | 1 leverantörsbild (genomskärning med värmepil), 3 AI-illustrationer (regn, kväll, snö — källan skriver själv "Livsstilsbilderna är AI-genererade illustrationer"), 2 infografiker med SVENSK text (fakta + färger, Bäverbutikens egna), 1 GIF (regn runt kojan) |
| Recensioner | 10 st i Judge.me, snitt 5,00, alla med titeln "Bra koja" — **alla `created_at` inom 11 sekunder 2026-09-08 22:48 UTC**, alltså API-importerade i källan dagen efter produkten skapades. Det är källans originaldatum enligt regeln; inga kunddatum finns. `output/utekattkojan/kalla-recensioner.json`. |
| Kaching | 1 st 0 % · **2 st 15 % "Mest populär" (förvald)** · 3 st 20 % = fabrikens standard-A. `output/utekattkojan/kalla-kaching-paket.json` |
| Källkampanj | MagiBorsten `120250147309170291` "Isolerade Utekattkojan \| BE ROAS 1.62 \| Launch 2026-09-09", 16 annonser ACTIVE, prefix `Utekattkoja_`, **2 760 kr spend / 9 köp / ROAS 2,57** t.o.m. 2026-09-11 (två dygn) |
| Leverantör | SKU säger Temu `5030003647894` (13 siffror — annat format än de andra produkternas 15). `goods.html?goods_id=5030003647894` svarar 200 men sidan säger "discontinued" (mätt 2026-09-11). Länken är oförifierad. |

**Inköpskostnaden är HÄRLEDD, inte kvitterad:** kampanjnamnets BE ROAS 1,62 och
formeln i `docs/temu-launch-flow.md` (pris / (pris − inköp)) ger
789 − 789/1,62 = **302 kr**. Axel bekräftar mot Temu-kvittot innan talet får döma annonser.
Med `moms_antagen: false` (produktmallen, Axels besked 2026-09-09) blir
täckningsbidraget 487 kr, break-even-ROAS 1,62 och break-even-CPA 487 kr.
Räknat MED moms (den öppna frågan i `factory/BESLUT-VANTAR.md` punkt 1):
789/1,25 − 302 = 329 kr ⇒ BE-ROAS 2,40. `ekonomi.mjs` skriver ut båda.

## Bilderna är facit

Leverantörsbilden (`kattkoja-hero`): grått Oxford-tyg, sadeltak som skjuter ut
över gaveln, välvd ingång med en orange nätflik innanför, svart metallstativ
med fyra ben, kojan står upphöjd med luft under golvet, lös liggmatta i
silvergrått bredvid, en orange pil som visar att värmen stannar inne. Bäverbutikens
infografik (svensk text, bara [SV]): 1 står på ben (stativ i metall), 2 sadeltak
i Oxford-tyg (lutande — vatten rinner av), 3 isolerade väggar (behåller värmen
katten själv avger), 4 öppning med flik (fliken bromsar draget i dörren),
5 lös liggmatta ingår (går att ta ut och skaka), 6 hopfällbar (tar liten plats
i förrådet över sommaren). Färgbilden: tre färger, bilderna visar den grå.

**Okänt och därför aldrig påstått:** mått i cm, vikt, isoleringens material
och tjocklek, temperaturklass, om taket är avtagbart, "vattentät" (källan
säger "vatten rinner av" och "torr plats" — mer än så påstås inte), maxvikt
på katten. Frågor om storlek besvaras inte i FAQ:n.

## Köparanalys

Köparen har en utekatt och ett hus med tomt — villa, radhus, landet — 30–65 år.
Sekundärt: den som matar en hemlös katt som dyker upp i trädgården. Hen ser
katten smita in under altanen när det regnar, eller ligga hoprullad på en kall
betongtrapp, och står i fönstret på kvällen och undrar var den tog vägen när
temperaturen kryper nedåt. Katten har ingen egen plats ute — allt den har är
under bilen. Emotionen är oro som blir lättnad: en egen torr plats som är
kattens, synlig från köksfönstret. Alla tio recensioner är skrivna ur
ägarens perspektiv om katten ("skönt att katten har en torr plats ute",
"katten har börjat sova i den varje dag", "katten gillar den direkt").
Språket är "utekatt", "katten", "kojan", "under bilen", "torr", "varm", "mysig".

Källkampanjen bekräftar vinkeln: `Utekattkoja_PD_2_H1` (problem/demo) är top
spender med 1 453 kr, 4 köp, ROAS 2,17 mot BE 1,62 — den enda annonsen över
300 kr/3 köp och därmed den enda som får dömas. SP (social proof) `SP_3_H1`
ligger på 524 kr / 2 köp / ROAS 3,01 — lovande men under domgränsen. GT och CS
har tillsammans under 400 kr. Butikens vinkel är problemet först: katten under
bilen, kojan som kattens egen plats.

## Namnet

**CatCabin.**

- Helt engelskt, inga å/ä/ö. "Cat" läser alla; "cabin" är hytte-ordet
  norrmän älskar och stuga-ordet svenskar redan använder (cabin crew, log cabin).
- Allitterationen gör det lätt att säga och minnas — "kattkoja" på engelska.
- Bär kategorin (utekattens egen plats), inte just den här modellen. Rymmer en
  värmedyna eller matstation utan att byta namn.
- Inte ett fjärde "-Guard", och inte samma färgvärld som de fem tidigare
  butikerna (alla mörkblå eller mörkgröna).

**Bortvalda:** *CatHaven* — "haven" betyder "trädgården" på danska och äldre
norska; läses fel i Norge och uttalas fel i Sverige. *WarmPaws* — låser brandet
vid värme och låter som ett generiskt djurmärke. *CatLodge* — "lodge" är inte
vardagsengelska för svenskar. *CatDen* — "den" är ett svenskt ord och läses
som "Cat den" (katten den), fel direkt.

**Domänkoll 2026-09-11** (RDAP via rdap.org, 404 = ledig; DNS utan A-post):
`catcabin.se` LEDIG · `catcabin.no` LEDIG. Kontrolleras skarpt när domänen köps
(checklistans avsnitt 6). `catcabin.com` inte kontrollerad — .se är huvuddomän
som för de andra OPS-butikerna.

## Palett

Varm och omhändertagande, men rejäl — en koja som står ute hela vintern.
De fem tidigare butikerna är alla mörkblå/mörkgröna; CatCabin får en varm
kolgrå bas (kojans tyg, stativets svarta metall, skymning) och EN bärnstensgul
accent — ljuset i köksfönstret på kvällsbilden och värmen inne i kojan.

| Roll | Hex | Varför |
|---|---|---|
| Mörk | `#2B2724` | Varm kolgrå — kojan i skymningen. Header, sidfot, loggan. |
| Yta | `#F5F0E8` | Varm cremeton — pälsen, köket. Aldrig kall grå. |
| Yta djup | `#EAE2D6` | Ett steg mörkare crème för växlande sektioner. |
| Accent | `#D97B2A` | Bärnsten — ljuset i fönstret, värmen inne. Den enda färgen som ropar. |
| God | `#3D7A55` | Mossgrön bock i trust-raderna. |
| Stjärnor | `#00B77F` | Husregel — Judge.me, varje butik. |

Typografi: **Nunito Bold** (`nunito_n7`) i ordmärket och rubrikerna — rundade
ändar, varm utan att bli barnslig; **Nunito Sans** (`nunito_sans_n4`) i brödtext.
Nunito (variabel TTF) och Poppins Bold installerades i containern från
google/fonts (raw.githubusercontent.com — jsDelivr saknar filerna) så sharp
kan rastrera loggan.

## Loggan

Tre varianter, se `loggor-jamforelse.png`. Loggfeedbacken (`--sammanfatta`,
2026-09-11: a 0, b 0, c 1 — TackleBay valde c för att "det var liv i den",
vågorna och det tvåradiga ordmärket gav rörelse; sigillet och det ensamma
motivet upplevdes stilla) styr valet av kompositioner:

- **Nytt motiv `koja`** i `logga-generera.mjs`: sadeltak med takutsprång,
  välvd ingång som lyser i bärnsten, två ben under. Droppen är TankGuards,
  luckan AdventLanes — kojan är CatCabins.
- **A — emblem** (`catcabin-logga-a.png`): kolgrå disk, kojan med tänd dörr
  ovanför CATCABIN, FOR OUTDOOR CATS spärrat under. Livet sitter i det tända
  fönstret.
- **B — sigill** (`catcabin-logga-b.png`): ljus disk med kolgrå ring, kojan
  liten ovanför CAT / CABIN i två rader (den tvåradiga kompositionen som vann
  på TackleBay), bärnstensstreck under.
- **C — motivet stort** (`catcabin-logga-c.png`): kolgrå disk, kojan stor med
  tänd dörr, ordmärket litet under. Ny komposition — den gamla c:n (monogram
  i två bokstäver) valdes aldrig och byts ut när brandet har ett eget motiv.
- Favicon: kojan ensam på kolgrå disk.

Axel väljer (a/b/c). Valet loggas med
`node factory/logga-feedback.mjs catcabin <a|b|c> --motiv koja --kommentar "…"`.
Tills han svarat sitter variant **A** provisoriskt i butiken — bytet är
ett API-anrop (`--igen logga`).

## Demot (MP4-regeln)

Källans GIF (`kattkoja-regn.gif`, 2,3 MB) konverterades till en 5-sekunders
loopad MP4 (`output/utekattkojan/catcabin-regn-demo.mp4`, 165 kB, h264 480²,
imageio-ffmpeg). Uppladdning till Shopify Files som video **går inte på trial**
(`API-GRANSER.md`, mätt 2026-09-10). Källans GIF bär demot tills ägaren valt
plan; sedan `node factory/filer.mjs factory/output/utekattkojan/catcabin-regn-demo.mp4`
+ `--igen metafalt`.

## Q4-ramverket — bonusprodukt SAKNAS

Bäverbutiken har 186 produkter och ingen billig kattprodukt (enda husdjurs-
raderna är hundmattan 459 kr och kojan själv). Ingen bonus hittas på — Axel
väljer (en värmedyna eller en extra liggmatta vore naturligt). Tills dess är
bonus-steget manuellt, paketen körs utan gratisdel och nivå 1 får ingen
tilläggs-kryssruta.

## Öppna frågor till Axel

1. Inköpskostnaden 302 kr är härledd ur BE ROAS 1,62 — stäm av mot kvittot.
2. Temu-länken ur SKU:n säger "discontinued" — ny leverantörslänk före inköp.
3. Bonusprodukt (Q4) — vilken?
4. Loggan — a, b eller c?
5. Momsen i break-even (BESLUT-VANTAR punkt 1) — filen står på `moms_antagen: false` enligt mallen.
