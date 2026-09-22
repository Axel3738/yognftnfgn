# Autosvaret → en dashboard: datakontraktet

Skriven för den session som bygger dashboarden (samma repo). Allt här är
**läs-bart**. Dashboarden ska aldrig svara på mejl, aldrig skriva i loggen
och aldrig köra `autosvar.mjs` mot en brevlåda — se "Rör inte" längst ner.

## ✅ Byggd 2026-09-22 — sektionen "Auto-reply" på kundtjänstsidan

Sitter i **samma sida som veckorapporten** (`kundtjanst/rapport-sida.html` →
`rapport-publicerad.html`, länken i `rapportsida.json`), mellan arbetskön och
tvisterna, för den valda butiken:

- `kundtjanst/dashboard.mjs` → `samlaAutosvar()` läser loggmappen och lägger
  `oversikt()`:s objekt per butik under `DATA.autosvar.brands[<id>]` —
  **talen rörs inte** (regel 4); fritexten (ämne, fel, orsak) maskeras en gång
  till (regel 1). Butik utan logg ⇒ sidan säger att autosvaret inte kört.
- `kundtjanst/rapportsida.mjs` → `hamtaVaKo()` läser `INBOX.VA-PRIO` live per
  butik (källa 3): en listning, sedan utloggning, aldrig läs/flytta/radera.
  Utan nyckel står variabelnamnet som orsak i stället för ett tal;
  `--utan-brevlada` hoppar steget. Sidan visar loggens kö och brevlådans kö
  bredvid varandra — de ska stämma överens.
- Sidan: sex tal (mejl, skickade, arga, till VA:n, fel, kontaktformulär),
  torrkörningsrutan när `svar = 0` och `utkast > 0`, VA:ns kö med filter, arga
  kunder (order, X, vad svaret bar, utkast/skickat), besvarade, fel, per dag.
  Engelska etiketter med SV-knapp, ingen runtime-capability.
- Tester: `kundtjanst/test/rapportsida.test.mjs` (talen = `oversikt()`:s,
  maskeringen, `hamtaVaKo` mot en låtsasbrevlåda utan nät, mallen).

Publiceringen görs av måndagsrutinen `/kundtjanst` mot samma länk (steg 4 i
kommandot) — artefakten ägs av det kontot, inte av den session som byggde
sektionen.

## Vad systemet gör (en mening)

`kundtjanst/autosvar.mjs` läser butikens supportbrevlåda (Loopias webbmejl),
lägger varje nytt kundmejl i en hink — **ENKEL** (svaras med fakta ur Shopify
+ 17TRACK), **ARG** (empatiskt svar, eskalering, flaggas och flyttas till
VA-mappen), **SVÅR** (flaggas bara, VA:n tar det), **SKIP** (nyhetsbrev,
autosvar, systemmejl) — och loggar utfallet. `--torr` = utkast i Drafts,
`--skarpt` = skickas. Reglerna står i `.claude/commands/autosvar.md` och
`kundtjanst/README.md` → "SOP-avstämningen" + "Axels feedback".

## Källa 1: loggen (det dashboarden ska läsa)

`kundtjanst/autosvar/logg/<butik>.jsonl` — en JSON-rad per mejl och körning.
Committas till repot av rutinen. Samma Message-ID kan stå flera gånger
(kalibreringar, omprövningar): **senaste raden vinner**.

Fält per rad (alla finns inte på alla rader):

| Fält | Vad |
|---|---|
| `tid` | körningens tid (ISO). Alla rader i en körning har samma `tid` |
| `brand` | butiks-id (`baverbutiken`, `carashell`, `beverbutikken`, `baeverbutiken`, `majavakauppa`) |
| `uid`, `messageId` | mejlets uid i inkorgen (byts när mejlet flyttas!) och Message-ID (stabilt) |
| `kund` | kundens adress **maskerad** (`ka***@gmail.com`). Aldrig i klartext |
| `kundHash` | sha256 av adressen, 12 hex — "samma kund" utan adressen |
| `amne` | ämnesraden |
| `kontaktformular` | `true` när mejlet är Shopifys kontaktformulär (kunden i Reply-To) |
| `hink` | `ENKEL` / `ARG` / `SVÅR` / `SKIP` |
| `typ` | ENKEL-typen: `wismo`, `levererad`, `leveranstid`, `oppettider`, `adress`, `ordernummer`, `foretag`, `foton`, `retur` |
| `kategori` | klassificeringen (`var_ar_ordern`, `fel_vara`, `skadad_defekt`, `retur_angerratt`, `aterbetalning`, `ovrigt` …, `kundtjanst/klassificering.mjs`) |
| `ordernummer` | lista med nummer ur mejlet (utan `#`) |
| `sprak` | `sv` / `nb` / `da` / `fi` / `en` |
| `orsak` | varför hinken blev som den blev, svenska; `orsakEn` samma på engelska |
| `atgard` | `svar` (skickat), `utkast` (torrläge), `flaggad` (bara flagga), `hoppad` (SKIP), `fel` (svaret gick inte att spara/skicka — prövas igen) |
| `torr` | `true` = torrkörning (utkast, inget skickat) |
| `flaggad`, `flyttad` | stjärnan satt; mappen mejlet flyttades till (`INBOX.VA-PRIO`) |
| `till` | mottagaren av svaret, maskerad |
| `x` | ARG: vilken problemmening kunden fick (`som_pa_bilden`, `kvalitet`, `ej_levererad`, `vantat` …) |
| `lage`, `retur`, `opostadDagar`, `behoverOrdernummer` | ARG: om svaret bar spårningsläget, returinformationen, "opostad i N dagar", frågan efter ordernumret |
| `fakta` | varifrån faktan kom (`["Shopify #7123 på e-post", "17TRACK InTransit · sista biten DHL"]`) |
| `tradnyckel`, `tradIds` | trådens nyckel (hashad) och Message-ID:n i tråden |

⚠️ Loggen bär bara det **autosvaret** gjorde. VA:ns egna svar syns inte här —
de ligger i brevlådans Skickat. En rad `SVÅR` med orsak "tråden har redan ett
svar från oss" betyder att VA:n redan svarat.

## Källa 2: det färdiga räkneverket (använd det här i första hand)

```bash
node kundtjanst/autosvar/oversikt.mjs --alla --dagar 30 --json     # { [butik]: översikt }
node kundtjanst/autosvar/oversikt.mjs --brand baverbutiken         # svensk tabell
```

`kundtjanst/autosvar/oversikt.mjs` läser loggen, tar senaste raden per
Message-ID och ger per butik: `antal` (mejl, ärenden, per hink, svar, utkast,
flaggade, till VA:n utan svar, fel, kontaktformulär), `perTyp`,
`perKategori`, `perSprak`, `perAtgard`, `perDag` (en rad per datum),
`arga` (ARG-raderna nyast först, med `x`/`lage`/`retur`), `svarade`,
`tillVa` (flaggade utan svar = VA:ns kö enligt loggen), `fel`,
`senasteKorning`, `antalKorningar`. Ren funktion: `import { oversikt } from
'./kundtjanst/autosvar/oversikt.mjs'` med egna rader går också.

## Källa 3: brevlådans köer (live, kräver nyckel)

Läs-bara via `node kundtjanst/mail.mjs lista --brand <id> --mapp INBOX.VA-PRIO`
eller MCP-verktygen i `.mcp.json` (`mail_list`, `mail_read`, `mail_search`).
Kräver `KUNDTJANST_MAIL_PASS_<ID>`.

- `INBOX.VA-PRIO` = de arga (och foton/retur/adress/levererad-ärendena) som
  VA:n ska ta först. Antalet där = "öppna prioärenden".
- Flaggade mejl i `INBOX` = SVÅR-kön.
- `INBOX.Drafts` = torrkörningens utkast (innan skarpt läge).
- Kundadresser står i klartext i utdata — maskera (`kundtjanst/maskera.mjs`
  → `maskeraAdress`) innan något visas eller postas.

## Källa 4: resten av kundtjänsten (finns redan)

- Veckorapporten: `kundtjanst/korningar/<butik>/<vecka>.json` (byggd av
  `kundtjanst/dashboard.mjs`) + `kundtjanst/historik/<butik>.jsonl` —
  ärenden, obesvarat, svarstid, kategorier, chargeback-risk 0–100.
  Publicerad sida: `kundtjanst/rapport-publicerad.html` (mall
  `rapport-sida.html`, länk i `kundtjanst/rapportsida.json`).
- Tvister: `node kundtjanst/tvistfakta.mjs --alla --brand <id>` (FIGHT /
  REFUND / ESCALATE per öppen tvist), `kundtjanst/tvistkoll.mjs` (deadline
  inom 3 dagar). Kräver butikens Shopify-nycklar.
- Spårningen: `sparning/lage.json` (Bäverbutiken) och
  `sparning/butiker/<id>/lage.json` — aldrig skanningarna, bara läget.

## Regler för sidan

1. **Kundadresser aldrig i klartext.** Loggen är maskerad; allt annat
   maskeras med `maskeraAdress` innan det visas. Ordernumret är nyckeln.
2. **Engelska i gränssnittet** (VA:n läser den), svenska i koden och
   kommentarerna. Samma som `kundtjanst/rapport-sida.html`.
3. **Inga runtime-capabilities på en publicerad sida** som VA:n ska se —
   hon har inget Claude-konto, och en sida med `db` släcks för henne. Baka in
   datan i HTML:en och publicera om mot SAMMA URL (som leaderboarden och
   veckorapporten gör).
4. **Räkna aldrig om det loggen redan säger** — visa `oversikt.mjs`:s tal, så
   att sidan och terminalen aldrig säger olika saker.
5. Rader med `torr: true` är **utkast, inte skickade svar**. Visa dem som
   "utkast" tills skarpt läge är på (Axels ordning: 20 rätta utkast i rad
   först).

## Rör inte

- **Kör aldrig `kundtjanst/autosvar.mjs` från dashboard-sessionen.** En
  brevlåda, EN session i taget: två sessioner mot samma inkorg gav dubbla
  utkast 2026-09-21. Läs loggen, kör inte motorn.
- **Skriv aldrig i `kundtjanst/autosvar/logg/`** — det är motorns minne
  ("ett svar per tråd, någonsin"). Ett hopp i loggen kan ge en kund två svar.
- **Radera aldrig mejl, markera aldrig som läst** (mail.mjs kan inte ens).
- Koden ligger på grenen `claude/sharp-curie-f8m7wr` tills Axel mergat till
  `main`. Läs därifrån om `main` saknar `kundtjanst/autosvar/`.
