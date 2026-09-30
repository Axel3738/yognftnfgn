# Rules: Swedish → English for Beaver Store Co. (worldwide)

You translate Bäverbutiken's Swedish store content into English for the worldwide
store (beaverstoreco.com). Customers are in the US, UK, Canada, Australia, New
Zealand, Ireland and the rest of Europe. Write **neutral international English with
US spelling** (color, gray, center) and words both Americans and Brits understand.

## 1. Translate, never invent

- Same facts, same order, same length (±15 %). No new claims, no new numbers, no
  hype that is not in the Swedish. If the Swedish is plain, the English is plain.
- Short, concrete sentences, like the source. Contractions are fine ("don't", "it's").
- Keep every number and unit exactly. Metric stays metric (cm, m, L, kg, W, V).
  Decimal commas become points: `2,5 m` → `2.5 m`, `1,5 L` → `1.5 L`. Never add inches.
- Keep `×` in dimensions (`211 × 171 cm`).
- Do not add the store name anywhere. Never write "Bäverbutiken", "Beaver Store" or a
  domain in a product text unless the Swedish source has it (it never does).

## 2. The market's truth — these Swedish lines change meaning abroad

| Swedish | English |
|---|---|
| `Smidig leverans och trygg betalning med Klarna` | `Tracked delivery and secure checkout` (Klarna is not offered abroad) |
| any other "Klarna" mention | drop Klarna, keep the rest of the sentence |
| `Du har 14 dagars ångerrätt enligt lag, räknat från den dag du får varan` | `You have 14 days to change your mind, counted from the day you receive the item` |
| `14 dagars ångerrätt enligt lag` | `14 days to change your mind` |
| `30 dagars öppet köp – gillar du det inte får du pengarna tillbaka` | `14 days to change your mind – if you don't like it, you get your money back` (the store's return policy abroad is 14 days) |
| `fri frakt över 300 kr` or any free-shipping threshold in kronor | `free shipping` |
| a reference to the Swedish market or a Swedish fact (fuel cans "on the Swedish market", Swedish rules) | keep it as a fact about Sweden ("in Sweden"). Do not claim it fits other countries |
| Swedish climate ("svensk vinter", "svenska somrar") | `Nordic winter`, `Nordic summers` |
| `Sveriges snabbast växande hobby` and similar Sweden-only claims | keep as `Sweden's fastest-growing hobby` (it is the source's claim about Sweden) |
| `kundtjänst på svenska` | `customer service by email` |

Nothing else about delivery, shipping times, prices or guarantees may be added.

## 3. HTML

- Output HTML must have **exactly the same tags in the same order** as the input.
  Translate text nodes and the `alt` attribute only.
- Never change `src`, `href`, `style`, `class`, `loading` or any other attribute.
- Keep `<strong>`, `<em>`, `<br>`, lists and headings where they are.
- Keep emoji and symbols (✓ ✅ → ★) exactly.

## 4. Words to use

| Swedish | English |
|---|---|
| husvagn | caravan (US readers: add "& RV" in titles: "Caravan & RV Roof Cover") |
| husbil | motorhome (titles: "Motorhome & RV") |
| åkgräsklippare | ride-on mower |
| utombordare / utombordsmotor | outboard motor |
| bensindunk | fuel can |
| trimmer / grästrimmer | trimmer / string trimmer |
| kapell | cover |
| överdrag | cover |
| tofflor | slippers |
| damasker | gaiters |
| sotarset | chimney sweep kit |
| täljkniv / täljset | whittling knife / whittling set |
| bälteslip / bandslip | belt sander / belt grinder |
| adventskalender | advent calendar |
| värmesulor | heated insoles |
| IBC-tank | IBC tote / IBC tank |
| spöhållare | rod holder |
| Färg / Storlek / Längd / Antal / Modell | Color / Size / Length / Quantity / Model |
| Motorstorlek / Mönster / Motiv / Antal delar / Logofärg / Ansikte | Engine size / Pattern / Design / Number of pieces / Logo color / Face |
| Svart / Vit / Grå / Grön / Blå / Röd / Brun / Beige / Rosa / Gul / Orange / Lila / Silver / Guld | Black / White / Gray / Green / Blue / Red / Brown / Beige / Pink / Yellow / Orange / Purple / Silver / Gold |

## 5. Titles

The Swedish title pattern is `Product – Benefit` in Title Case. Keep the pattern and
the Title Case: `Taköverdrag Husvagn – Skyddar Den Dyraste Ytan` →
`Caravan & RV Roof Cover – Protects the Most Expensive Surface`. Keep sizes and pack
counts in the title (`2-pack`, `420D`, `1000 L`).

## 6. Output

One JSON file per product: `worldwide/oversattning/en/<handle>.json`

```json
{
  "handle": "<unchanged>",
  "title": "<English title>",
  "seo_title": "<English or null if the source is null>",
  "seo_description": "<English or null if the source is null>",
  "options": [ { "name": "<Swedish option name>", "name_en": "<English>", "values": { "<Swedish value>": "<English value>" } } ],
  "descriptionHtml": "<English HTML>"
}
```

- `options` lists every option from the source (skip none). Values that are already
  English, numbers or sizes map to themselves.
- Write the file with the Write tool, one product per call. Never put two products in
  one file. Valid JSON only (escape `"` inside HTML as `\"`).
- After the last file, run `node worldwide/oversattning/granska.mjs <your batch files>`
  and fix every ❌ it prints before you finish.
