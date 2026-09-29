# Produktjakt 2026-09-29 — TEMARUNDA CARASHELL (husvagn/husbil-butiken)

Axels order kl 08: *"9-figure ecom-brand som säljer wheel covers för RV storage — hitta ett tiotal produkter, nischa in på RVs, en extra sneaky side batch bara för Carashell med 10+ produkter."*

## 0A Svar före sökningen (kl 11:00, dagens 11 kort): 7 ja / 0 kanske / 4 nej
**Ja:** husbilshyttens termomatta (K0358), sopkärlets lockrem (K0350), sopkärlets vägglist (K0351), vedmåttet (K0360), stentrumlaren (K0355), jerkysetet (K0356), surdegssetet (K0354).
**Nej:** kölskyddslisten (K0359), igelkotthuset (K0357), stuprörets gångjärn (K0352), ekorrbordet (K0353).
Läsning: **insidan av husbilshytten är öppen** (termomattan ja) → lins AR fick insidan som struktur. Sopkärlet 2/2 ja (objekt alla har + friktion). Igelkott/ekorre nej = vilda djur bara som "matning/skydd av det egna" (fågelautomaten ja, ekorrbordet nej). Båtens limmade slitlist nej (lim på skrovet = montering).

## Rundans regler (ORDER.md)
Formtaket lyft — `rank.py --tema --formtak 1.0` (ny flagga i dag; för en butik där skydd ÄR sortimentet). Fortfarande: max tre skyddsformer per lins på olika objekt, syskon max tre, standardutrustning död, golv = sortiment fäller.
`REDAN-PROVAT.md` byggd ur koncept.json: 61 husvagns-/husbilskoncept (vinnare taköverdrag + termoskydd, ja på front/taklucka/AC-huv/cykelhållare/fönstermatta/däckvaggor/kalender, nej på ramper + stödbensplattor).

## Linserna — sju + huvudsessionen

| Lins | Struktur | Levererat | Kärnfynd |
|---|---|---|---|
| AQ | Hjul/underrede/koppling vid uppställning | 2 → 0 (kopplingslås = standardutrustning; hjullås dubblett av AT) | Kedjan ligger UNDER Ali-landad på allt kring hjul/stödhjul (hjul 119, Wheel Saver 279, klossar 39–188). **Fiamma Wheel Saver 279 = golv under däckvaggorna K0335 (ja) — läs in före launch.** Stödhjul 48 mm saknar Ali-form. |
| AR | Insidan under vintern (fukt/möss/kyla) | 3 (tre Ducato-termogardiner) | Uppställningsinsidan är död (standard + originaldelar billigare än kopian). Det som lever: **kyla när bilen används** — hyttens tre köldbryggor, fackhandel 3 000–8 800, Ali 300–500. Madrassunderlägg = Alibaba-bulk, inte Ali. |
| AS | Vintercamping Sälen/Åre | 1 (vinterkjolen) | Vinterfelmoderna löses av original Truma/Dometic/Fiamma 144–640 kr som Ali inte kopierar. Uppvärmda lösningar (slang, tank, golv) saknar husvagnsform på Ali. |
| AT | Stöld på uppställningsplatsen | 3 (hjullås, dörrhasp, fönsterspärrar) | H06 bara på hjullåset (Milenco 1 619, kopior spridda 281–850 = inte sortiment). Stöldskydd = enda skyddsstruktur kontot aldrig belönat (Motorlåset 0,50). |
| AU | USA-katalogen | 3 (droppnäsor, Midi Heki-huv, tankvärmedyna) | USA-former som sitter PÅ vagnen utan EU-motsvarighet = lucka med passformsrisk; former som finns i SE finns som BILLIG OEM (Thermovent 215, dörrhållare 35, vinterlucka 145), inte som ankare. Hälften av USA-listan är sommarformer. |
| AV | Husbilens kaross utanpå (Ducato) | 4 → 3 (gnagarstaket, droppkantslist, vindavvisare; tankmatta dubblett) | Två oplöjda felmoder med äkta lucka: **möss i motorrummet** (bara ultraljud i SE) och **svarta ränder** (bara kemi + Fiamma 75 cm-bitar). |
| AW | Ordning/flerköp i vagnen | 3 → 2 (kylskåpsspärr, överskåpsspärr; markisklämmor fel säsong) | Fackhandeln säljer lås/fästen för skåp men inte "håll-kvar-innehållet"-formen — äkta H10 utan ankare. |
| HS | Spegelhuvarna Ducato (lins AN i går, lyftes ut av arketyptaket) | 1 | Milenco 1 116 = 1,6×. |

**Summa: 20 → 16.** ~150 fraser, ~90 produktsidor, ~75 strukna i linserna + 4 av huvudsessionen. rank.py --tema --formtak 1.0: 16 → 16, inga kollisioner (hjullåsets objekt döptes om, SAK krockade med däckvaggorna). Gnagarstaketet fick K0153 (kandidat sedan 09-04, första leveransen).

## Batchen (sida v31 = 16 kort; ark `Leverantorsoffert-2026-09-29-carashell.xlsx` med bilder)

| # | Produkt | Pris · BE-CPA | Ankare / golv | Hyp. | Konf. | Största risken |
|---|---|---|---|---|---|---|
| 1 | Gnagarstaketet runt husbilen, 304-nät (K0153) | 979 · 532–613 | ingen i formen / ultraljud = annan sak | H10 | MEDEL | omkrets ej mätt (hero SUV, husbil 7 m); 979 utan ankare |
| 2 | Hyttavskiljaren — termogardin Ducato (K0361) | 1 199 · 666–763 | campingvaruhuset 2 995 (2,5×) / GoCamp 8 795 | H04 | MEDEL | inuti bilen — alla vinnare är utsida |
| 3 | Midi Heki-huven hagel & termo (K0362) | 599 · 406–441 | Silber 1 665 (2,8×) / Beisel 795 | H01 | MEDEL | syskon till takluckehuven 40×40; S/M mot 70×50 |
| 4 | Vinterkjolen 7 m med hjulhuskappor (K0363) | 599 · 327–377 | Thule Windslip 1 249 (2,1×) / markkappor 316–476 | H06 | MEDEL | "har redan" hos förtältsägare; hero utan snö |
| 5 | Skjutdörrsgardinen Ducato, magnetisk (K0364) | 999 · 632–699 | Reimo 4 290 (4,3×) / — | H06 | MEDEL | plåtisägare = delmängd; syskon 2+5+6 |
| 6 | Bakdörrsgardinerna Ducato, 2 delar (K0365) | 1 199 · 782–858 | Hindermann 6 121 (5,1×) / — | H06 | MEDEL | passform mot dörrkant |
| 7 | Husbilens spegelhuvar i par, Ducato (K0366) | 699 · 244–327 | Milenco 1 116 (1,6×) / — | H06 | LÅG | inget hårt datum |
| 8 | Vindavvisarna till Ducato-hytten, par (K0367) | 649 · 266–336 | ClimAir Boxer 1 175 (1,8×) / — | H10 | LÅG | clips; hooken måste vara regnet |
| 9 | Kylskåpsspärrarna 2-pack (K0368) | 499 · 244–290 | — / Thetford hyllklämma 125 (annan form) | H10 | MEDEL | ingen deadline, inne i vagnen |
| 10 | Överskåpsspärrarna 3-pack (K0369) | 499 · 194–250 | — / — | H11 | LÅG | lågt upplevt värde, skruv |
| 11 | Dörrhaspen med dolt hänglås (K0370) | 599 · 309–359 | Thule 870 (1,45×) / — | H06 | LÅG | fyra bultar genom dörren; lås 0/15 |
| 12 | Takrännans droppnäsor, 4-pack (K0371) | 429 · 245–279 | — / marknadsplats 92 | H10 | MEDEL | passform mot EU-takränna |
| 13 | Droppkantslisten mot svarta ränder, 2 × 3 m (K0372) | 699 · 315–385 | Fiamma Drip Stop 233 kr/m → 1 400 (2,0×) / 175 per bit | H03 | MEDEL | limning i kyla |
| 14 | Hjullåset för husvagn, Milenco-kopia (K0373) | 949 · 399–499 | Milenco Compact 1 619 (1,7×) / kopior 281–850 | H06 | MEDEL | lås 0/15, Motorlåset förlorade |
| 15 | Fönsterspärrarna Seitz/Dometic, 3 par (K0374) | 349 · 241–261 | Dometic 199/par (1,7×) / campingvaruhuset 159 | H08 | LÅG | liten plastbit |
| 16 | Vattentankens värmedyna 12 V (K0375) | 479 · 262–301 | — / — (kama.se oläst) | H10 | LÅG | lim + 12 V = montering 7/9 förlorare |

Alla LIVE_VERIFIED 11:30–12:20 UTC, hero sedd. Sex skyddsformer av 16 (38 %) — formtaket hade inte ens bitit. Tre Ducato-gardiner = syskon (max tre, gränsen hålls). Sex LÅG med flit (målet 10+; Axel avgör upplevt värde).

## Parkerade (backlog)
- Markisdukklämmorna 2-pack (Thule 465 = 1,33×) → mars (markisen infälld okt–påsk).
- Ventilerande madrassunderlägg 3D-mesh (fyra svenska aktörer 800–1 295, Watski rullvara) → Alibaba-bulk, inte Ali-listning.
- Kylskåpsventilens vinterlucka (Dometic EWS 300 640 kr ankare) → ingen Ali-listning, bara clips.
- Frostfri vattenslang husvagn (VEVOR 706 golv, fackhandel 1 500–2 500) → ingen färdig Ali-form.
- Stödhjul 48 mm: huv/tvillinghjul (ankare 1 155) → ingen europeisk Ali-listning.
- Starlink-fodral husbil (17–30 USD) → resesäsong, inte uppställning.

## Metodfynd
1. **En nischbutik behöver eget formtak.** `--formtak 1.0` är nu en flagga; standard 40 % gäller Bäverbutiken. Det syntes ändå att linserna själva höll 38 % — regeln "max tre skyddsformer per lins på olika objekt" räcker.
2. **Uppställningen är genomsökt.** Fyra linser (AQ, AR, AS, AU) fann att kedjan/originaldelarna ligger under Ali-landad på nästan allt runt den STÅENDE vagnen. Det som lever är (a) den KÖRDA husbilen i kyla (Ducato-hytten: gardiner, vindavvisare, speglar), (b) felmoder utan svensk form (möss i motorrummet, svarta ränder, droppnäsor), (c) H06 med Milenco/Thule/Hindermann-ankare ≥ 1,6×.
3. **Fiamma Wheel Saver 279 kr ligger under däckvaggorna K0335 (ja)** — läs in ankaret före launch, annars är det Motorlåsets struktur (kedjeform).
4. **Lås är kontots olösta fråga**: tre låsrader i dag (hjul, dörr, fönster) är rena H06-test mot Motorlåset REAL_LOSER. Ett ja + Meta-facit avgör om "lås på uppställt objekt" är stängt.
5. **getcamping läses via `data-title`/`data-price`, campingvaruhuset via `/shop?funk=gor_sokning&term=`** (lins AR) — in i protokollet. kama.se, husvagnsexperten.se, Biltema, Jula = 403/000 hela rundan (oläst i varje rad).

## Tio kontrollfrågor (MASTERPROMPT §9)
1. Djur: gnagarstaketet är skydd MOT djur, ingen husdjursrad. Ja. 2. H04: hyttavskiljaren 1 199 mot 2 995-ankare, objekt husbil 500 tkr+ — märkt H04. Ja. 3. Inga kalendrar. Ja. 4–5. Inga verktyg i förrådet (vindavvisare/spärrar sitter PÅ vagnen). Ja. 6. Deadline: uppställning 10–31/10 (1,6 v) på 11 rader, första frost/vintercamping på 5. Ja. 7. Ankare 10 mätta med URL, 6 "ingen i formen" med PriceRunner + getcamping lästa (kama/husvagnsexperten/Biltema/Jula oläst = skrivet). Ja. 8. Hero alla sedda; packshots (tankdynan, hjullåset, dörrhaspen) anmärkta. Ja. 9. K0 mot katalog (termoskyddet ≠ gardinerna; taköverdraget ≠ Heki-huven; tak-AC-huven ≠ Heki), koncept.py, kontot. Ja. 10. K0361–K0375 + K0153 med taggar. Ja.

## Definition of done (Carashell-rundan)
- [x] 0A 11 svar inlästa före sökningen (7/0/4); läsning skriven; feedback.py samla + vikter
- [x] Discovery 7 linser + HS; REDAN-PROVAT.md (61 koncept) och ORDER.md lästa av alla
- [x] Varje rad LIVE_VERIFIED i dag med UTC-stämpel, hero sedd
- [x] Golvet läst med URL per rad (getcamping/campingvaruhuset/PriceRunner); olästa källor skrivna
- [x] Materialklass, ekonomi som intervall, BE-CPA ≥ 190 per rad
- [x] Batch 16 (Axels mål 10+), rank.py --tema --formtak 1.0; 4 rader strukna av huvudsessionen med skäl
- [x] Ark med bilder + sida v31 mot samma URL, downloads + db (inga obesvarade kort — alla 11 besvarade)
- [x] koncept.json K0361–K0375 (+ K0153 levererad)
- [x] STATUS + LEARNING_STATE-rad + LARDOMAR + RUTIN-KVITTO + backlog (6); protokoll (formtak-flaggan, getcamping/campingvaruhuset-receptet); committat och pushat
- [x] Discord-rapport skickad
