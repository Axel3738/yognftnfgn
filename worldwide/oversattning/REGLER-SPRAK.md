# Rules: English → de / fr / es / it / nl / pl / pt-PT for Beaver Store (worldwide)

You translate the store's **approved English texts** (`worldwide/oversattning/en/`) into one
European language. The English is already correct for the worldwide market (14-day returns,
no Klarna, free tracked shipping, no store name) — keep exactly those facts. Customers are in
that language's countries in Europe. Read `REGLER-EN.md` too: every rule there about facts,
numbers and HTML applies here as well.

## 1. Translate, never invent

- Same facts, same order, about the same length. No new claims, numbers or hype.
- Natural, native, plain shop language — how a good local webshop writes, not a word-for-word
  copy of the English. Short sentences. Use the polite/standard form each market expects:
  **de** "Sie" (formal, capitalized), **fr** "vous", **es** "tú", **it** "tu", **nl** "je",
  **pl** plain second person ("Ty"-forms without the pronoun), **pt-PT** European Portuguese
  (not Brazilian), "você"-free impersonal/"o seu".
- Keep every number and unit. Decimal separator follows the language: de/fr/es/it/nl/pl/pt use
  a comma (`2.5 m` → `2,5 m`). Thousands: write numbers ≥ 1000 without a separator (`1000 L`)
  unless the English has one — then use a non-breaking space (`1 000`). Keep `×` in dimensions.
- Never write "Bäverbutiken", "Beaver Store", a domain, "Klarna", "Swish" or a price in kronor.
- A fact about Sweden stays a fact about Sweden ("in Schweden", "en Suède"). "Nordic winter"
  → the language's "nordischer Winter" / "hiver nordique" / "invierno nórdico" / "inverno
  nordico" / "Scandinavische winter" / "skandynawska zima" / "inverno nórdico".

## 2. Fixed phrases (use exactly)

| English | de | fr | es | it | nl | pl | pt-PT |
|---|---|---|---|---|---|---|---|
| 14 days to change your mind | 14 Tage Rückgaberecht | 14 jours pour changer d'avis | 14 días para cambiar de opinión | 14 giorni per cambiare idea | 14 dagen bedenktijd | 14 dni na zmianę decyzji | 14 dias para mudar de ideia |
| free shipping | kostenloser Versand | livraison gratuite | envío gratis | spedizione gratuita | gratis verzending | darmowa dostawa | portes grátis |
| tracked delivery | Sendungsverfolgung | livraison suivie | envío con seguimiento | spedizione tracciata | verzending met track & trace | przesyłka z numerem śledzenia | envio com seguimento |
| secure checkout | sicherer Checkout | paiement sécurisé | pago seguro | pagamento sicuro | veilig afrekenen | bezpieczna płatność | pagamento seguro |
| customer service by email | Kundenservice per E-Mail | service client par e-mail | atención al cliente por e-mail | assistenza clienti via e-mail | klantenservice via e-mail | obsługa klienta przez e-mail | apoio ao cliente por e-mail |

## 3. Product words

| English | de | fr | es | it | nl | pl | pt-PT |
|---|---|---|---|---|---|---|---|
| caravan & RV | Wohnwagen & Wohnmobil | caravane & camping-car | caravana y autocaravana | roulotte e camper | caravan & camper | przyczepa kempingowa i kamper | caravana e autocaravana |
| motorhome | Wohnmobil | camping-car | autocaravana | camper | camper | kamper | autocaravana |
| outboard motor | Außenbordmotor | moteur hors-bord | motor fueraborda | motore fuoribordo | buitenboordmotor | silnik zaburtowy | motor fora de borda |
| ride-on mower | Aufsitzmäher | tondeuse autoportée | cortacésped con asiento | trattorino tagliaerba | zitmaaier | traktorek ogrodowy | trator corta-relva |
| cover | Abdeckung / Plane | housse / bâche | funda | telo / copertura | hoes | pokrowiec | capa |
| gaiters | Gamaschen | guêtres | polainas | ghette | beenkappen | stuptuty | polainas |
| whittling set | Schnitzset | kit de sculpture sur bois | set de tallado | set per intaglio | houtsnijset | zestaw do rzeźbienia | kit de talha |
| belt grinder | Bandschleifer | ponceuse à bande | lijadora de banda | levigatrice a nastro | bandschuurmachine | szlifierka taśmowa | lixadora de cinta |
| chimney sweep kit | Schornsteinfeger-Set | kit de ramonage | kit deshollinador | kit spazzacamino | schoorsteenveegset | zestaw kominiarski | kit de limpeza de chaminé |
| heated insoles | beheizbare Einlegesohlen | semelles chauffantes | plantillas calefactables | solette riscaldate | verwarmde inlegzolen | podgrzewane wkładki | palmilhas aquecidas |
| rod holder | Rutenhalter | porte-canne | portacañas | portacanne | hengelhouder | uchwyt na wędki | suporte para canas |
| IBC tote | IBC-Container | cuve IBC | depósito IBC | cisterna IBC | IBC-container | zbiornik IBC | depósito IBC |
| advent calendar | Adventskalender | calendrier de l'Avent | calendario de Adviento | calendario dell'Avvento | adventskalender | kalendarz adwentowy | calendário do Advento |

Colors and sizes in options: translate normally (Black → Schwarz / Noir / Negro / Nero / Zwart /
Czarny / Preto). Numbers and sizes (`XL`, `42`, `2-pack`) stay; "pack" → "er-Pack" (de),
"lot de" (fr), "pack de" (es), "confezione da" (it), "-pack" (nl), "zestaw" (pl), "pack de" (pt).

## 4. HTML

Exactly the same tags in the same order as the English file. Translate text and `alt` only.
Never touch `src`, `href`, `style`, `class`. Keep emoji and symbols.

## 5. Output

Mirror the input file, same file name, same JSON structure, same keys:

- `worldwide/oversattning/<locale>/<same file name>.json`
- product files: `handle` unchanged; `title`, `seo_title`, `seo_description`, `descriptionHtml`
  translated; in `options` keep `name` (Swedish) and put your translation in `name_en`
  (the field name stays `name_en` — the build reads it for every language); `values` keeps the
  Swedish keys, translated values.
- `_tema.json`, `_menyer.json` (Swedish → English maps): keep every **key** (Swedish) exactly,
  replace the **value** with your language.
- `_sidor-*`, `_integritet-*`, `_villkor-*`, `_policyer-*`, `_kollektioner`, `_shop`: keep the
  structure and every key, translate the text values (titles, bodies, descriptions).
- Valid JSON (escape `"` inside HTML as `\"`). One file per Write call.
- When done, run `node worldwide/oversattning/granska.mjs --locale <locale> --filer <your files>`
  and fix every ❌.
