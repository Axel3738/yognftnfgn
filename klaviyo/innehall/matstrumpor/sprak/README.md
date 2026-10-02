# Matstrumpors mejl på alla språk — översättningen

`KALLA.json` är allt kunden läser i Matstrumpors Spoks-mejl, på svenska, skrivet av
`node klaviyo/spoks-sprak.mjs --brand matstrumpor --kalla`. Varje språk har en egen fil
`<sprak>.json` här bredvid. Motorn (`klaviyo/spoks-sprak.mjs`) lägger översättningen på det
svenska innehållet: länkar, produkter, ordning och block kommer ALLTID ur svenskan, så en
översättning kan aldrig ändra ett mejls form, bara dess ord.

**Ett nytt språk** = en rad i `sparning/butiker.json` → `matstrumpor.mejl_sprak` (samma rad som
fraktmejlen läser) + en fil här, skriven av en sonnet-subagent med instruktionen nedan och läst
av en skeptisk granskare. **Ett nytt land** = en rad i `klaviyo/brands/matstrumpor.json` →
`spoks_sprak.lander`. Ingen fil här behöver röras för ett nytt land.

**När svenskan ändras:** kör `--kalla` igen. `--kolla` (eller ett vanligt bygge) säger vilka
mejl som ändrats sedan varje språk översattes (`kalla`-hashen), och bara de översätts om.

## Instruktionen till översättaren

Du översätter mejlen för Matstrumpor (strumpor som ser ut som mat: sushi, pizza, hamburgare,
donuts, i presentförpackning) från svenska till ett språk. Läs först
`matstrumpor/marknader/oversattning/REGLER.md` och `REGLER-EUROPA.md`. Deras ordlista, ton,
tilltal och järnregler gäller här också. Sedan det här:

**Filens form (exakt):**

```json
{
  "sprak": "<kod>",
  "ui": { "<samma nycklar som KALLA.ui>": "<text>" },
  "citat": { "<samma hash som KALLA.citat>": "<översatt recension>" },
  "mejl": {
    "<mejl-id>": {
      "kalla": "<kopiera KALLA.mejl[id].kalla tecken för tecken>",
      "amne": "…",
      "forhandstext": "…",
      "block": [ { "<samma nycklar som i KALLA, i samma ordning>": "…" } ]
    }
  }
}
```

- Varje mejl, varje block och varje nyckel i KALLA finns med. Ett tomt block `{}` i KALLA är ett
  tomt block `{}` hos dig. `punkter` är en lista.
- `null` betyder "ta bort den här texten på mitt språk". Använd det BARA enligt reglerna nedan.
- `{{fornamn}}` är kundens förnamn. Behåll den där den står, eller ta bort den (inte flytta in
  den i en mening där den inte fungerar). Inga andra `{{ }}`.

**Järnreglerna (motorn stoppar på 1–4):**

1. **Inga tal som inte står i den svenska texten.** Du får ta bort ett tal, aldrig lägga till.
   Ett svenskt räkneord (två–tolv) räknas som tal: "Fem par" får bli "5", aldrig "6".
2. **Inga tankstreck** (— eller –). Skriv om med komma, punkt eller kolon. Bindestreck i ord och
   i "36-44" är tillåtna.
3. **Inga datum och ingen leveranstid.** Svenska sista beställningsdagar ("beställ senast 8
   december", "24 oktober") är räknade på svensk leveranstid och stämmer inte i ditt land. Ta
   bort meningen (`null`) eller skriv om den utan datum och utan löfte om att paketet hinner fram
   ("Beställ i god tid före jul" är ok, "hinner fram till julafton" är inte ok).
4. **Fars dag finns inte på ditt språk.** Fars dag den 8 november är svensk. Nämn den aldrig;
   skriv om raden utan den, eller `null`.
5. **Inga nya löften.** Ingen rabatt, ingen gratis retur, ingen snabb leverans, inga "bästa",
   inga siffror, inget som inte står i svenskan. Returrätten heter som i ordlistan
   ("30 Tage Rückgaberecht", "30-day returns" …).
6. **Varumärket** skrivs alltid "Matstrumpor". Klubben (`ui.klubb`, "Matstrumpor-klubben") får
   ett naturligt namn på ditt språk med "Matstrumpor" kvar: en "the Matstrumpor Club", de
   "der Matstrumpor-Club" osv. Använd samma namn överallt i filen, också inne i mejltexterna.
   Klubbkänslan (ett exklusivt medlemskap) ska finnas kvar.
7. **Produktnamnen** ur ordlistan. "sushilådan", "pizzalådan" osv. är lådan som produkten kommer
   i — skriv det naturligt ("the sushi box").
8. **Storleken 36-44 är EU-storlek.** Engelskan skriver "EU 36-44".
9. **E-post och adresser orörda:** `kundsupport@matstrumpor.se`.
10. **Paketnumret börjar på MS** — "MS" står kvar.
11. **Ton:** kort, varm, lekfull, som en infödd copywriter skulle skriva ett mejl, inte en
    skolöversättning. Ämnesraden ska vara lika kort som den svenska eller kortare.
12. **Citaten (`citat`) är riktiga kunders ord.** Översätt troget, förstärk ingenting, rätta inte
    stavfel till beröm. Motorn märker dem "översatt från svenska" (`ui.oversatt`).
13. **ui-raderna:** `hej_reserv` står först i en mening när förnamnet saknas ("Hej, …"),
    `du_reserv` står mitt i en mening i stället för namnet ("…, du"), `medlem_reserv` står på
    medlemskortet när namnet saknas. `medlem_i` behåller `{klubb}` exakt. `fakta_retur_rubrik` är
    rubriken över returrätten, `fakta_retur_text` är ordlistans "30 dagars öppet köp"-rad.
    `ms_rad` säger var kunden hittar paketnumret (i mejlet om att paketet skickats).

### Japanska (ja), 2026-10-02

Allt ovan gäller, plus `matstrumpor/marknader/oversattning/REGLER-ASIEN.md` (です・ます調,
helbreddsinterpunktion 、。「」！？, halvbreddssiffror, inga mellanslag mellan japanska ord,
ordlistan). Motorn stoppar på det som står i brandfilens `spoks_sprak.stopp.ja`.

- **Talet fyra står aldrig i ett japanskt mejl**, i någon form (4, ４, 四, 肆), inte heller i
  "36-44" eller "4,5" (四 låter som 死). Skriv om: "Fyra sorter" ⇒ nämn sorterna eller 全種類,
  "Fyra par i en pizzakartong" ⇒ utan antalet, "Onesize 36-44" ⇒ bara フリーサイズ, "snitt 4,5"
  ⇒ stryk snittet.
- **Antal med halvbreddssiffror** (5足, 3つ, 8件), aldrig kanji (五足): motorn jämför siffrorna
  med svenskan, där räkneorden två–tolv räknas som tal ("Fem par" ⇒ 5足 går, 6足 stoppar).
  "en"/"ett" räknas inte (oftast artiklar): skriv ひとつ / もうひと箱, eller 1 där svenskan har
  siffran ("Köp 1, få 1" ⇒ 1つ買うともう1つ無料).
- **Tilltalet är `{{fornamn}}様`**, aldrig さん och aldrig namnet ensamt: `ui.du_reserv` är お客,
  så ett namn som saknas blir お客様. `ui.hej_reserv` krävs men används inte av japanskan.
- **Ordlistan för mejlen:** klubben Matstrumporクラブ (överallt), 寿司ソックス, ピザソックス,
  ハンバーガーソックス, ドーナツソックス (butikens egna titlar i
  `matstrumpor/marknader/output/underlag-ja.json`), lådorna 寿司ボックス / ピザボックス /
  ハンバーガーボックス / ドーナツボックス, 木製のお箸, 1つ買うともう1つ無料, 30日間返品OK.
- **Svenskt varumärke (Axels ord: "i Japan speciellt"):** välkomstmejlet `f01-valkomst-e1`
  block 0 får säga att Matstrumpor är スウェーデン発のブランド, som sajtens hero och Om oss
  och varje japansk annons. Ingen annanstans läggs det till, och スウェーデン製 är förbjudet.
- **Klarna och Swish nämns aldrig**, och inga belopp eller valutor.
- Japanska streck (―, ─, －) är tankstreck och stoppar som — och –. Katakanans ー är inget streck.

**Leverans:** skriv filen med `Write` till `klaviyo/innehall/matstrumpor/sprak/<kod>.json`, kör
`node klaviyo/spoks-sprak.mjs --brand matstrumpor --offline --sprak sv,<kod>` och rätta tills
den säger "✅ Inga fel". Svara sedan bara med JSON:
`{"fil": "<sökväg>", "mejl": <antal>, "noteringar": ["<max fem korta rader om val granskaren bör veta>"]}`.

## Granskaren

En annan subagent läser filen mot KALLA.json och reglerna ovan, som en infödd läsare som letar
fel: fel betydelse, stel översättning, datum/fars dag/leveranslöfte kvar, nya löften, fel ord ur
ordlistan, klubbnamnet olika på olika ställen, citat som förstärkts. Den rättar direkt i filen,
kör samma kommando tills det är grönt och svarar med en lista på vad den ändrade.
