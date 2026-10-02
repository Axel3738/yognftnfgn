# Prompt: Matstrumpor i Spoks — japanska och Belgien på franska (flöden v2)

Varför: sajtgranskningen 2026-10-01 (`matstrumpor/marknader/granskning/SAJT-2026-10-01.md`).
**S-017:** Belgien får nederländska Spoks-mejl, fast FR-kampanjen visar belgarna franska.
**S-018:** Japan får engelska Spoks-mejl, fast Shopifys egna mejl är japanska.

Förberett i repot 2026-10-02: `BE: fr` och `JP: ja` i `klaviyo/brands/matstrumpor.json` →
`spoks_sprak`, `spoks: false` borttaget på ja-raden i `sparning/butiker.json` (Taiwan står
kvar avstängt), `flodesversion: 2`, japanskans stopp i motorn. Flödena som är igång kan inte
ändras via MCP ("Cannot edit a step in an active flow"), och engelskans, franskans och
nederländskans landsfilter ändras. Därför byggs sex NYA flöden "… · alla språk v2" bredvid de
sex som går, och Cowork byter dem i appen. Tills dess gäller version 1: Japan får engelska och
Belgien nederländska.

Kräver Spoks-connectorn (`mcp__Spoks__*`) och Agent-verktyget (steg 1). Klistra in i en ny session:

```
Matstrumpor Spoks: japanska + Belgien på franska, bygg flödena v2. Följ klaviyo/spoks/PROMPT-matstrumpor-ja-be.md.
```

## Stegen

0. **Start.** `git pull` på `main`. Läs `klaviyo/spoks/README.md` → "Matstrumpor på alla språk",
   hela, med noten 2026-10-02. Ladda Spoks-verktygen (ToolSearch `+Spoks`) och kör `whoami`
   med storeId `71c2d4c8-b9ec-488a-b15c-5dfe8dbd2226`. Svarar den inte med arbetsytan
   "Matstrumpor.se": STOPPA och säg det till Axel. Följ Spoks egna instruktioner i
   verktygsbeskrivningarna (t.ex. `get_flow_blueprints` före `create_flow` om det står så).

1. **Japanskan.** `ja.json` finns sedan 2026-10-02 (sonnet-översättare + skeptisk granskare,
   huvudsessionen bedömde fynden). Kör `node klaviyo/spoks-sprak.mjs --brand matstrumpor --offline --sprak sv,ja`.
   Saknas `klaviyo/innehall/matstrumpor/sprak/ja.json`, eller säger bygget att ett mejl är gammalt
   ("ändrats sedan ja översattes"): starta översättaren (Agent, `model: "sonnet"`, prompten i
   Bilaga A), sedan en ANNAN subagent som granskar (sonnet, Bilaga B). Bedöm varje fynd själv:
   rätta de befogade i `ja.json`, skriv en rad om varför ett fynd avvisas, kör bygget igen tills
   "✅ Inga fel". Ingen annan språkfil rörs. Huvudsessionen skriver aldrig mejltext själv.

2. **Bygg.** `node klaviyo/spoks-sprak.mjs --brand matstrumpor` (live). Kravet: "✅ Inga fel",
   13 språk (ja: JP Japan, fr: FR, LU, BE), 6 flöden (169 sändsteg), 132 kampanjutkast,
   13 språksegment, flödesnamnen slutar på "· alla språk v2". Ladda aldrig upp ur ett rött bygge.
   v2 bär motorns länkar för ALLA språk. **Länkarna står kvar på `matstrumpor.se/<mapp>` med flit**
   (beslut 2026-10-02, granskningen S-002/S-003): temat (`snippets/ms-flytt.liquid`) skickar varje
   utlandsbesökare därifrån till matstrumpor.com med rätt språk och besökarens RIKTIGA land, mätt live.
   En statisk `?country=` per språksteg hade gett österrikare DE och belgare FR. Bygg v2 som den är.

3. **Segmenten**, ett anrop i taget, filter och beskrivning ur
   `klaviyo/output/matstrumpor/spoks/sprak/PLAN.json` → `segment`:
   - `preview_segment` + `create_segment` för `SEG_samtycke_ja`, med samma inställningar som de
     tolv andra (läs `SEG_samtycke_fr` med `get_segments` först, gissa inget fält).
   - `update_segment` på `SEG_samtycke_fr` `c7a97511-fdb6-446c-9ff6-519e2653c683` (Belgium in),
     `SEG_samtycke_nl` `ff7d9ef1-9758-46ca-8497-492f53286f12` (bara Netherlands) och
     `SEG_samtycke_en` `86d580af-aa5b-4b8d-ae77-20d3e9670ce0` (Japan läggs i nin-listan).
   - Läs tillbaka med `get_segments`. En rad per segment i
     `klaviyo/konto/matstrumpor/spoks-sprak-uppladdat.jsonl`
     (`{"tid","typ":"segment"|"segment_andrat","namn","segmentId","medlemmar"}`).

4. **Flödena v2**, ett i taget i ordningen F07, F03, F04, F05, F01, F02. För varje:
   - `create_flow` med `create` ur `…/sprak/uppdrag/<flöde>.json` (inaktivt). En rad
     `{"tid","typ":"flode","flode","flowId","namn","status":"inaktivt","version":2}` i
     `spoks-sprak-uppladdat.jsonl` direkt.
   - `add_flow_step` i ordning, steget ur `node klaviyo/spoks/sprak-steg.mjs <flöde> <index>`.
     Varje sändsteg fylls direkt: `update_draft_campaign` med `flowId`, `postId`,
     `currentHash` = svarets `postHash` och `postData` ur
     `node klaviyo/spoks/sprak-steg.mjs <flöde> <index> --post`.
   - Logga varje steg i `klaviyo/konto/matstrumpor/spoks-sprak/v2/<flöde>.jsonl`
     (`{"index","stepId","postId","postHash","ifylld"}`). v1-loggarna rörs inte.
   - Första "Rate limit exceeded" eller fel: stanna, försök inte runt det. Nästa körning
     fortsätter efter loggens sista index (läs flödet med `get_flow` först, bygg aldrig dubbelt).
   - `get_flow` efteråt, ett flöde i taget.

5. **Kampanjutkasten på japanska** (11 st: K01–K03, K05–K10, K13, K14). Ett i taget med
   `draft_campaign`, `postData` exakt ur filen:
   `node -e 'const u=require("./klaviyo/output/matstrumpor/spoks/sprak/uppdrag/kampanjer.json");const k=u.kampanjer.filter(x=>x.sprak==="ja")[N];console.log(JSON.stringify(require(k.post_fil)))'`
   Logga `{"id","sprak":"ja","postId"}` i `klaviyo/konto/matstrumpor/spoks-sprak/v2/kampanjer.jsonl`.
   Ingen publik, inget datum. När Axel schemalägger de japanska utkasten: 10:00 japansk tid (03:00 svensk
   sommartid, 02:00 vintertid). 18:00 svensk tid landar 01:00–02:00 i Japan (granskaren 2026-10-02).

6. **Kontroll**, med den här sessionens logg (`~/.claude/projects/-home-user-yognftnfgn/<id>.jsonl`):
   - `node klaviyo/spoks/sprak-floden-koll.mjs --logg <loggen>` → sex ✅ (v2, flöde, trigger och
     alla sändsteg AV).
   - `node klaviyo/spoks/sprak-koll.mjs --logg <loggen>` → 0 avvikelser.
   - `get_flows`: de sex "· alla språk" (v1) fortfarande på, de sex v2 av med 0 kunder.

7. **Dokumentera.** Skriv v2-id:na och utfallet under noten 2026-10-02 i README:n. Committa och
   pusha enligt CLAUDE.md.

8. **Svara Axel** kort på svenska. Sist, under "Det här gör du": klistra in
   `klaviyo/spoks/cowork/2-matstrumpor-ja-be.txt` i Cowork (texten i ett kodblock).

**Aldrig:** rör v1-flödena (89976b01…, 6b22283c…, 17aa6927…, 0594aa1b…, 32d23706…, 8c9c1204…),
de gamla svenska flödena, F08 eller F09. Slå aldrig på, schemalägg, skicka eller välj publik.
Radera ingenting. Rör aldrig Bäverbutikens (`f716ae36…`) eller CaraShells (`38f3d430…`)
arbetsytor. Bara en uppladdare åt gången (rate limit ~35 anrop per 45 s, mätt 2026-09-29).

## Bilaga A — översättaren (sonnet)

```
Du översätter Matstrumpors Spoks-mejl från svenska till japanska (ja). Läs i den här ordningen:
klaviyo/innehall/matstrumpor/sprak/README.md (hela, särskilt "Japanska (ja), 2026-10-02"),
matstrumpor/marknader/oversattning/REGLER.md och REGLER-ASIEN.md, sedan källan
klaviyo/innehall/matstrumpor/sprak/KALLA.json. Ton och ord: sajtens japanska i
matstrumpor/marknader/output/underlag-ja.json (tema.index.*, paket.*, liquid.*) och
mejl/sprak/ja.json. Översätt från svenskan; en.json får bara visa hur datum och fars dag
lösts på andra språk.

Fallgroparna i just den här källan:
1. Talet fyra (motorn stoppar): K03 och F01 E2 förhandstext ("snitt 4,5": stryk snittet),
   K01 punkten "Onesize 36-44" och F02 E2 "alltså 36-44" (bara フリーサイズ), K08 förhandstext,
   block 0, 1 och 3 ("fyra sorter/mottagare/förslag", "Fyra par i en pizzakartong": utan antal),
   K11 block 1, K14 block 2, F05 E1 block 1, och K04:s "24 oktober" (försvinner med datumen).
2. "en/ett" räknas inte som tal: K09/K10 block 0 "En vara ger 10 %" (punktlistan har siffran 1),
   F01 E1 "Ett mejl om Black Week", K07 "En till mamma …", F07 "En låda till": skriv ひとつ /
   ひと箱 eller utan antal.
3. Inga datum och inga leveranslöften: K06 "I november 2025" (昨年, inga månader), K08 sista
   blocket, K09/K10 "till och med måndag 30 november", K13 "hinner inte fram till julafton",
   K14 "i januari som i december" (1月/12月 är tal som inte står i svenskan). K04, K11, K12 och
   F06 skickas bara på svenska men måste finnas: skriv om dem utan fars dag, datum och
   "hinner fram", som en.json.
4. F01 E1: medlemspunkten om sista beställningsdagen inför fars dag och jul blir null. Block 0
   får säga att Matstrumpor är スウェーデン発のブランド (enda stället).
5. K02: "Den tråkiga funkar. Den roliga glöms." = den praktiska presenten används,
   skämtpresenten glöms bort. Vänd den inte (fyra språk gjorde det 2026-09-29).
6. Citaten: riktiga kunders ord, troget och inte förstärkta. Motorn sätter citattecken och
   översättningsmärket.
7. Fasta ord: ui.du_reserv お客, ui.klubb Matstrumporクラブ, ui.fakta_retur_text 30日間返品OK,
   ui.fakta_sparning_rubrik 配送状況を確認, och {{fornamn}}様 överallt där namnet står kvar.

Skriv klaviyo/innehall/matstrumpor/sprak/ja.json och kör
node klaviyo/spoks-sprak.mjs --brand matstrumpor --offline --sprak sv,ja tills det står
"✅ Inga fel". Svara bara med JSON: {"fil": "...", "mejl": <antal>, "noteringar": ["max fem rader"]}.
```

## Bilaga B — granskaren (sonnet, en annan subagent)

```
Du är en skeptisk infödd japansk läsare och granskar klaviyo/innehall/matstrumpor/sprak/ja.json.
Anta att det finns fel och hitta dem. Läs klaviyo/innehall/matstrumpor/sprak/README.md (hela,
särskilt "Japanska (ja)" och "Granskaren") och matstrumpor/marknader/oversattning/REGLER-ASIEN.md.
Läs sedan KALLA.json och ja.json parvis: varje mejl, block, punkt, ui-rad och citat.
Kör node klaviyo/spoks-sprak.mjs --brand matstrumpor --offline --sprak sv,ja (exit 0 krävs).
Leta efter: ändrad, tillagd eller tappad betydelse; talet fyra i någon form; tal som inte står i
svenskan; datum, fars dag eller leveranslöften kvar; nya löften (rabatt, gratis retur, snabb
leverans, "bäst"); ordlistan och klubbnamnet inkonsekvent; {{fornamn}} utan 様; blandat
です・ます och vanlig form; stel skolöversättning; ämnesrader längre än svenskans; K02 vänd;
citat som förstärkts; スウェーデン発のブランド någon annanstans än F01 E1, eller スウェーデン製;
Klarna, Swish, belopp. Rätta INTE filen (README:ns granskare rättar själv, men här bedömer och
rättar huvudsessionen). Svara bara med JSON:
{"ok": true|false, "mekaniskt_exit": 0|1, "problem": [{"mejl": "...", "falt": "...",
"typ": "betydelse|tal|datum|lofte|ordlista|sprak|stil", "beskrivning": "...", "forslag": "..."}],
"sammanfattning": "en mening"}
```
