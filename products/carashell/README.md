# CaraShell — produktminne för en FLERPRODUKTSBUTIK

CaraShell fick sin andra produkt 2026-09-16 (`/ops-produkt carashell`, Axels
länk till Bäverbutikens termoskydd). Nattvakten (`/notionscalercs`),
leveransrundan och NO-översättningen körs per **produktnyckel**, inte per
butik, så minnet ligger per produkt med samma sökväg som nyckeln i
OPS-registret — precis som TackleBay (`products/tacklebay/README.md`).

| Nyckel | Prefix | Minne | Läge 2026-09-16 |
|---|---|---|---|
| `carashell/takskyddet` | `CaraShellRoof` | `products/carashell/takskyddet/` | annonser live sedan 2026-09-11, 3 400 kr/dag, 3 briefronder körda |
| `carashell/termoskyddet` | `CaraShellFront` | `products/carashell/termoskyddet/` | byggd i butiken 2026-09-16, annonser byggs av `/ny-annonser termoskyddet` (PAUSED tills Axel skriver "Launch") |

Varje mapp har `dna.md` (Creative DNA), `batch-log.md` (batcher + hypoteser +
utfall), `backlog.md` (koncept som väntar). Läs dem innan du agerar,
uppdatera dem efter, committa och pusha.

**Ett bart `carashell` betyder takskyddet** (Axels beslut 2026-09-16: de tre
befintliga rutinerna är takskyddets, termoskyddet får egna). Det står som
`butik.huvudprodukt: takskyddet` i `factory/butiker/carashell.yaml`, och
`register.mjs hittaPost` löser upp butiks-id:t (och brandet) till den
produkten. Takskyddets fyra rutiner på `claude5@stonebite.org` byggdes
dessutom om samma dag med `carashell/takskyddet` i prompten (annan session,
se CLAUDE.md rutintabellen) — huvudprodukten är säkerhetsnätet så att ett bart
`carashell` ändå fungerar, i en prompt eller när Axel skriver det för hand.
Termoskyddet nås ALDRIG via butiks-id:t — bara på
`carashell/termoskyddet`. En session som slår upp `carashell` ska läsa raden
`Huvudprodukt:` i registrets utskrift och använda minnet
`products/carashell/takskyddet/`, inte `products/carashell/`.

⚠️ **Pixeln är delad.** Metas Purchase-event bär ingen produkt, och de två
produkterna ligger 2× isär i pris (1 129 mot 559 kr). Döm aldrig en annons i
den här butiken på pixelns CPA ensam — läs köp per produkt ur Shopify och
skriv i rapporten att du gjort det (`factory/FLERPRODUKT.md`).

⚠️ `factory/budgetrond.mjs` och `factory/skalning.mjs --spara` skriver sina
underlag till `factory/output/carashell/…-<datum>.json` — samma fil för båda
produkterna samma dag. Läs `products/tacklebay/README.md` för samma varning.
