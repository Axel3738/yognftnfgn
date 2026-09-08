# TankGuard — faktablad för brand-swappen av IBC-bildannonserna

**Uppdrag:** FAS2 Uppdrag C. Bäverbutikens bildannonser för IBC-tanköverdraget
görs om till OPS-butiken **TankGuard**, svenska och norska.

Varje siffra och varje löfte nedan har en källa. Står det inget här får det
inte stå i en annons heller — hitta aldrig på ett villkor för TankGuard.

Mätt 2026-09-08.

---

## Butiken

| Vad | Värde | Källa |
|---|---|---|
| Brand | **TankGuard** | `factory/FAS2.md`, `factory/PROCESS.md` |
| Domän | tankguard.se | svarar 200 på `/password` (trial, lösenordsskyddad) |
| Shopify | `y1sj1i-3d.myshopify.com` (shopId 101276483928) | `Shopify.shop` i lösenordssidans JS |
| Annonskonto | MagiBorsten DK `915422744950975` | CLAUDE.md (OPS-regeln), `factory/LAUNCH-INPUT.yaml` |
| Marknader | SE (hemma) + NO (locale nb) | `factory/butik-mall.yaml`, standard i varje OPS |

⚠️ `factory/butiker/tankguard.yaml` finns **inte i repot** — TankGuard-bygget
committades aldrig. Butiksvillkoren nedan kommer därför ur fabriksmallen
`factory/butik-mall.yaml`, som är standard för varje OPS-butik.
`SHOPIFY_TOKEN_tankguard` i miljön ger 401 mot Admin-API:t, och storefronten är
lösenordsskyddad — butikens egna värden gick inte att läsa av den här sessionen.

---

## Produkten och priset

Priset hämtas ur källbutikens produktsida, enligt `factory/PROCESS.md` steg 1
("Hämta produktdata från källan (Bäverbutik-sidan): namn, pris, varianter").
Samma regel som gav HeimGuard 799/1000 kr.

| | Sverige | Norge |
|---|---|---|
| Produktnamn | IBC-tanköverdrag 1000 L – Stoppar Alger & UV | IBC-tanktrekk 1000 L – Stopper Alger & UV |
| Pris | **489 kr** | **439 kr** |
| Jämförpris | **636 kr** | **586 kr** |
| Rabatt | **23 %** | **25 %** |
| Du sparar | **147 kr** | **147 kr** |
| Källa | `baverbutiken.se/products/ibc-tankoverdrag-1000-l-stoppar-alger-uv.js` | `beverbutikken.no/products/ibc-tanktrekk-1000-l-stopper-alger-uv.js` |

⚠️ **Att bekräfta före launch:** TankGuards NO-marknad ska enligt
`butik-mall.yaml` prissättas i **NOK**. 439 kr är källbutikens norska pris —
samma regel som för SE, men TankGuards egen NOK-nivå är inte avläst.

---

## Villkoren — det som ALDRIG får kopieras från Bäverbutiken

Källa: `factory/butik-mall.yaml` (`retur`, `frakt`, `garantier`) och
`factory/PROCESS.md`. Detta är fabriksstandard för varje OPS-butik.

| Bäverbutiken säger | TankGuard säger (sv) | TankGuard säger (nb) | Varför |
|---|---|---|---|
| 30 dagars öppet köp | **14 dagars ångerrätt** | **14 dagers angrerett** | Axels beslut 2026-09-08: "alltid svensk lag, ALDRIG egna köplöften — '30 dagars öppet köp' överallt har ruinerat folks trust". `oppet_kop_dagar: 14` |
| Fri frakt inom Sverige | **Fri frakt** | **Gratis frakt i hele Norge** | `frakt.fri_globalt: true` — ingen gräns, ingen landbegränsning. PROCESS: "Gratis frakt i hele Norge (nb)" |
| Fri frakt över 300 kr | **Fri frakt** | **Gratis frakt** | samma — TankGuard har ingen fraktgräns |
| 5–10 arbetsdagar | **5–8 arbetsdagar** | **5–8 virkedager** | `frakt.leveranstid: "5–8 arbetsdagar"` |
| Klarna – betala sen | **stryks helt** | **stryks helt** | TankGuards betalsätt är inte avlästa. Ett betalningslöfte utan källa är påhittat. |
| 30 dagars öppet köp om den inte passar | **14 dagars ångerrätt om den inte passar** | **14 dagers angrerett hvis den ikke passer** | samma som ovan |

Ordet **"garanti"** används aldrig — varken på svenska eller norska.

---

## Recensionerna

De namngivna kunderna (Maria, Lena, Sofia, Johan) är äkta Judge.me-recensioner
på källprodukten — inget är påhittat, och citaten står kvar ordagrant.

⚠️ **Att bekräfta före launch:** att samma recensioner ligger i TankGuards
Judge.me. En import kördes mot TankGuard 2026-09-08 (`tools/judgeme-import.mjs`
— datumvakten i filen skrevs efter just den körningen), men TankGuards
Judge.me-token finns inte i miljön, så det gick inte att läsa av härifrån.
Saknas recensionen i butiken ska annonsen inte launchas.

- **Svensk annons:** namnet ensamt, precis som i originalet. Ingen domän.
- **Norsk annons:** namnet + källan, `Sofia, tankguard.se` — samma metod som
  NO-körningen 2026-09-08 använde (`Sofia, baverbutiken.se`), eftersom
  recensionen är skriven på svenska av en svensk kund.
- Skriv **aldrig** `baverbutiken.se` i en TankGuard-annons.

---

## Produktfakta (oförändrade — inte brandbundna)

210D Oxford-tyg · blixtlås · öppning upptill · 120 × 100 × 116 cm ·
passar standard 1000-liters IBC-tank · blockerar UV och stoppar alger ·
på plats på ca 2 minuter.

Norska produktord (från den bevisade NO-körningen 2026-09-08):

| Svenska | Bokmål |
|---|---|
| blixtlås / dragkedja | glidelås |
| gummiband | strikk |
| överdrag | trekk |
| Oxford-tyg | Oxford-stoff |
| öppning upptill | åpning på toppen |
| passar | passer |
| regnvatten | regnvann |
| stänger ute | stenger ute |
| arbetsdagar | virkedager |
| beställ | bestill |
| skydda | beskytt |
| grönska (om tanken) | gro igjen |

---

## Metoden

- **16 av 20 annonser** är 1080×1350-mallen med enfärgade plattor, band och
  knappar → `pipeline/oversatt-bild.py`. Noll krediter.
- **4 annonser** (`IBC_CS_2_1`, `IBC_SP_2_1`, `IBC_GT_2_1`, `IBC_PD_2_1`) är
  1024×1024 med text **direkt på fotot** → `bildannonser/kie.mjs` rensar texten,
  `bildannonser/text.py` lägger tillbaka skarp vektortext. Aldrig tvärtom —
  kie.ai kan inte skriva svensk eller norsk text.
- Varje levererad bild har en QA-bild: källa till vänster, TankGuard till höger.
