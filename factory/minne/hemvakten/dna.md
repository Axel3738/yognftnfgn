# Creative DNA — HeimGuard (övervakningskameran)

**Butik:** hemvakten · **Brand:** HeimGuard · **Konto:** MagiBorsten DK `915422744950975`
(delat OPS-konto — prefix `HEIMGUARD_`)

**Status 2026-09-08: INGEN DATA ÄN.** Butiken har noll annonser i kontot
(avläst 2026-09-08: kontots 69 annonser tillhör alla Bäverbutikens danska
kampanjer). Ingenting nedan är bevisat i den här butiken.

Filen fylls av `/skalningskungen hemvakten`. Skriv datum och vilken körning i
ordningen det var vid varje uppdatering.

---

## Linjerna (ur `factory/produkter/overvakningskameran.yaml`)

| | Värde | Används till |
|---|---|---|
| Break-even-ROAS | 1,49 | **KILL-beslut — enda linjen som får döda en annons** |
| Break-even-CPA | 538 kr | samma linje, i CPA-form |
| Target-ROAS | 2,36 | budgetallokering och skalning |
| Target-CPA | 338 kr | samma |

**Butiken säljer UTAN moms** (Axels besked 2026-09-08). Marginalen räknas rakt
på priset: 799 − 261 = 538 kr täckningsbidrag per order.

⚠️ Räknade på styckpriset 799 kr. **Butiken har ingen uppmätt AOV.**
2-packet är förvalt, så verklig AOV blir högre och break-even STRÄNGARE
(1,54 på A-paketet 1 342 kr, 1,64 på B-paketet 1 199 kr). Första körningen med
köp i kontot ska läsa verklig AOV **och** sätta `varukostnad_per_order` —
verktyget vägrar räkna på enbart AOV, eftersom antalet varor inte går att
härleda ur ett rabatterat paketpris.

⚠️ Talen ligger nära Bäverbutikens men är räknade härifrån. Kopiera aldrig ett
break-even-tal mellan produkter — nästa har annan COGS.

## Winning DNA (bevisat i DETTA konto)

*Tomt. Ett mönster får skrivas in här först när det har ≥2 annonser med ≥3 köp
vardera i HeimGuards egna annonser.*

## Losing DNA (bevisat i DETTA konto)

*Tomt.*

## Hypoteser att testa

Från produktfilens `meta.vinklar` (Axels prioritering 2026-09-07) — inget av
detta är testat:

| Kod | Vinkel | Källa |
|---|---|---|
| `TR` | Trygghet: otryggt läge, sov lugnt igen, veta i stället för att oroa sig | Axels huvudvinkel |
| `SR` | Senior: så enkel att mamma fixar det själv — eller köp och installera åt dina föräldrar | Axels vinkel för äldre + deras vuxna barn |
| `PD` | Nattljudet på tomten, veta i stället för att gissa | produktsidans bevisade copy på Bäverbutiken |
| `FD` | AI:n som skiljer människor från katter, demo av spårningen | produktsidans funktionslista |
| `SP` | Social proof, tio 5-stjärniga recensioner | produktfilens reviews |

## Ärvd historik (Bäverbutiken → HeimGuard)

*Inget inskrivet ännu.* Brand-swappas Bäverbutikens vinnare hit (FAS2 uppdrag
A/A2) ska deras hypoteser och utfall skrivas in i `batch-log.md` med källa och
datum, märkta `ÄRVD` — och behandlas som **hypotes**, aldrig som bevis. Annat
brand, annat pris, annan landningssida, annan publik.

## Regler som gäller creativen i den här butiken

- Tonaliteten står i `factory/butiker/hemvakten.yaml` → `branding.tonalitet`:
  saklig, lugn och rak, korta meningar, inga utropstecken, ingen hype.
- ⚠️ **Vinklar som pekar ut folkgrupper som hotet körs ALDRIG.** Meta fäller dem
  (diskriminering) och det bryter mot brandets tonalitet. Hotet är ljudet på
  tomten, aldrig vem.
- Priset hämtas från produktsidan vid varje körning, aldrig ur en äldre brief.
