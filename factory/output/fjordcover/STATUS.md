# FjordCover — läget 2026-09-13

Butik: `j0p8qz-kp.myshopify.com` · primär domän **fjordcover.se** (kopplad, SSL)
· SEK · plan **Shopify (betald)** · marknad Norge + språk nb publicerade.
Tema: **FjordCover – CRO v1** — MAIN (publicerat). Horizon ligger UNPUBLISHED.
Appen "Factory" har alla 16 krävda scopes (154 totalt).

Produkt: **Båtmotorskydd 420D – Heltäckande för Utombordare**, handle
`batmotorskyddet`, 579 kr (jämförpris 965 kr = −40 %), **9 varianter**
(0–5 … 250–350 hk), ACTIVE + publicerad, alla varianter CONTINUE + tracked
false. Bonus: **Batterifrånskiljare 12/24V** 189 kr (Q4-ramverket).

## ⚠️ Varför den här filen finns

**Butiken byggdes utanför repot och lämnade ingen konfig efter sig** — exakt
samma hål som TankGuard 2026-09-08. Vid kollen 2026-09-13 fanns FjordCover
**ingenstans**: inte i `factory/butiker/`, inte i `factory/produkter/`, inte i
`factory/state/`, inte i `factory/output/`, inte i `git log --all`, inte i
Notion. Bara fyra rader i Environments (`SHOPIFY_*_j0p8qz_kp`, **gemen tagg** —
ett versal-filter på `SHOPIFY_SHOP[A-Z_]*` missar dem).

`factory/butiker/fjordcover.yaml` och `factory/produkter/batmotorskyddet.yaml`
är därför **avlästa ur den live butiken**, inte skrivna ur en byggplan. Varje
fält är märkt MÄTT eller HÄRLETT. Analystexterna (positionering, tonalitet,
stil) är en rekonstruktion i efterhand — det finns ingen `BRAND.md`.

`upptackOps()` ser butiken sedan dess (`fjordcover/batmotorskyddet`, prefix
`FjordMotor`, konto 915422744950975). Den står som **`byggd: false`** eftersom
ingen state-fil finns — registret redovisar den men **rutinerna kör den
aldrig** i det läget. Det är avsiktligt skydd, inte ett fel.

## Kan butiken launchas i dag? Nej.

### 🖐 Axels klick
1. **Meta-sidan finns men Axel saknar ROLL på den.** Sidan "Fjordcover"
   `1368352486352053` ligger i businessens `owned_pages` (1164852855167090) —
   alltså ägd, bättre läge än TankGuard hade. Men `me/accounts` (45 sidor)
   listar den **inte**, och det är den enda kontroll som avgör om en annons
   går att skapa (FAS2 rad 489–500: `client_pages` = ser businessen den,
   `owned_pages` = äger den, `me/accounts` = har ANVÄNDAREN roll på den).
   Åtgärd: `business.facebook.com/settings/pages` → Fjordcover → Lägg till
   personer → Hantera sida. Sidan behöver alltså inte skapas.
2. **NOK är inte aktiverat.** `enabledPresentmentCurrencies` = `["SEK"]` — en
   norrman ser svenska kronor genom hela butiken. Settings → Markets → Norge.
3. **Lösenordsskyddet är på** (`fjordcover.se` → 302 `/password`). Planen är
   redan betald, så inget hindrar — men det tas bort sist av allt.
4. Shopify Payments + Klarna, de fyra ångerrätts-reglagen, varukorgen och
   mobilvyn: går inte att läsa via API:t.

### ⚙️ Fabriken
5. ~~Paketnivåerna är 1 / 2 / 3.~~ **RÄTTAT 2026-09-13** på Axels besked
   "ja, 1/2/4". Toppnivån bytt 3-pack → 4-pack med källans procent behållen:
   A 1 853 kr (−20 %, FJORD4A), B 1 737 kr (−25 %, FJORD4B). De gamla
   3-nivåerna städades bort (`paket.mjs --stada` — den varnar men tar inte
   bort av sig själv, och utan den stod butiken en stund med FYRA nivåer
   1/2/3/4). FJORD3A och FJORD3B är satta till EXPIRED, inte raderade: en
   kund med en sparad kod ska mötas av en död kod, inte av ett pris som inte
   finns. Alla sex priser och koder tillbakalästa mot admin.
6. **Variantbilderna saknas** — 60 tomma platshållare i rullgardinerna.
   Rullgardin-per-enhet i sig FUNGERAR (temats pill-väljare göms korrekt).
   De 9 varianterna är motorstorlekar, inte färger — ägarbeslut om det ens
   ska finnas en bild per storlek.
7. ~~Optionsnamnet "Motorstorlek" saknar nb-översättning.~~ **RÄTTAT
   2026-09-13** → `Motorstørrelse`, tillbakaläst.
8. **`snippets/opf-tillagg.liquid` är hårdkodad svenska** på /nb ("Lägg till
   batterifrånskiljare", "+ 189,00 kr"). Filens egen kommentar påstår att den
   är locale-branchad — den innehåller inget `iso_code`. **Drabbar varje
   OPS-butik med bonus-kryssruta**, inte bara den här.
9. ~~Bonusprodukten `batterifranskiljaren` står på DENY.~~ **RÄTTAT
   2026-09-13** → CONTINUE (tracked var redan false), tillbakaläst. Alla 9
   varianter på huvudprodukten låg redan rätt.
10. **Recensionerna går inte att reproducera ur repot.** Butiken bär **14**
    (5,0 snitt, svenska + norska) — produktfilen bär **8**, avlästa ur källan.
    Dry-run skrev `output/batmotorskyddet/judgeme-import.csv` med just de 8,
    och det är dessutom **API-formatet**, som enligt `ny-ops.md` steg 9b aldrig
    får laddas upp i appen (API:t skriver över originaldatumen). Någon
    importerade de 14 för hand utan att filen landade i repot.
    `JUDGEME_API_TOKEN` i miljön är **Bäverbutikens** och ger 401 här, så
    app-filen är enda vägen. Rör inte de 14 som redan ligger i butiken.

### Det som är grönt
Källskanningen är ren i **båda** temana (317 + 446 filer). Kundvyn är grön på
riktig HTML bakom lösenordet: brandet, loggan (variant c), egen hero, egen
meny, 4 produktbilder, köpknappen inte disabled. Alla 4 sidor och alla 4
policyer är helt rena på norska. Rabattmatten stämmer. Frakt: fri i alla tre
zoner. **Meta-pixeln finns** — `1774648277117873` "FjordCover", avfyrad
2026-09-13 16:32, senare än alla åtta andra butikers.

## Källkampanjen (för `/ny-annonser`)

| | SE | NO |
|---|---|---|
| Konto | MagiBorsten `1867947880635861` | Magiborsten NO `1050941584152547` |
| Kampanj | `Båtmotorskyddet 420D \| BE ROAS 1.62 \| Launch 2026-08-29` | `Båtmotortrekk NO \| BE-ROAS 1,63 \| 2026-09-02` |
| Status | ACTIVE, CBO 700 kr/dag | PAUSED, CBO 2 550 NOK/dag |
| Innehåll | 14 adsets · 46 annonser (alla ACTIVE) | 14 adsets · 47 annonser |
| Utfall | 20 689 kr · 90 köp · **ROAS 2,69** | 20 755 NOK · 80 köp · ROAS 2,24 |
| Prefix | `Batmotor` | `Batmotortrekk` |

**Priset är rent:** de svenska transkripten säger "579 kronor" och "ordinarie
965 kronor" / "40 procent rabatt" — FjordCover säljer för exakt 579/965.
Noll pristal behöver bytas. Brandet nämns inte i något tal (0 av 13 SRT).

Måste rättas vid kopiering: **"30 dagars öppet köp"** i ≥5 videor (kostar
HeyGen-krediter) och 8 SE-copyrader — FjordCover har 14 dagars ångerrätt.
Plus "Bäver"/"baverbutiken" i 4 SE- och 10 NO-copyrader, Klarna i 4+4, och
stjärnbetyg i 7+4.

⚠️ `kalla.no_kampanjmonster` är satt i produktfilen. Utan det faller
`factory/kallannonser.mjs` tillbaka på DryTreks mönster `gamasj|damask`.
