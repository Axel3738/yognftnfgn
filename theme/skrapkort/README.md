# Skrapkortet — välkomstrabatt-popup för alla fem butiker

*Skapad 2026-08-24. Rekonstruerad ur den live, redan buggfixade versionen på
baverbutiken.se (`shopify-section-skrapkort`): besöksspärren (popupen återkommer
inte på varje sidbyte) och rubrikskyddet (inga kapade ord) ingår i alla filer.*

| Fil | Butik | Rabattkod i "klar"-steget |
|---|---|---|
| `se-skrapkort.liquid` | baverbutiken.se | `VALKOMMEN10` — **redan live, behöver inte installeras** |
| `dk-skrapkort.liquid` | bæverbutiken.dk | `VELKOMMEN10` |
| `no-skrapkort.liquid` | beverbutikken.no | `VELKOMMEN10` |
| `fi-skrapkort.liquid` | majavakauppa.fi | `TERVETULOA10` |
| `uk-skrapkort.liquid` | beavershop.co.uk | `WELCOME10` |

Alla texter, rabattkoden, fördröjningen (7 s) och vilodagarna (3) ligger som
temainställningar i sektionens schema — ändras i temaredigeraren utan kod.
Mejlen taggas `newsletter,skrapkort` i Shopify (syns på kundkortet).

## Installation som UTKAST (rör aldrig livetemat)

### Via API (när apparna fått `read_themes` + `write_themes`):
```bash
# 1. duplicera livetemat i admin (Webbshop → Teman → ⋯ → Duplicera)
# 2. hitta utkastets id:
node scripts/shopify-admin.mjs tema-lista DK
# 3. installera (lägger in sections/skrapkort.liquid + section-raden i layouten):
node scripts/shopify-admin.mjs tema-installera-skrapkort DK <temaId>
# 4. förhandsgranska utkastet i admin, publicera när det ser rätt ut
```
Skriptet vägrar skriva till MAIN-temat.

### Manuellt (funkar utan API-behörighet):
1. Webbshop → Teman → ⋯ på livetemat → **Duplicera**
2. På kopian: ⋯ → **Redigera kod**
3. Under **Sections**: *Add a new section* → döp den `skrapkort` → radera
   exempelinnehållet → klistra in hela filen för rätt språk → Spara
4. Öppna **layout/theme.liquid** → hitta `</body>` → lägg raden
   `{% section 'skrapkort' %}` direkt före → Spara
5. ⋯ på kopian → **Förhandsgranska** → testa skrapa + mejl + kod
6. Publicera kopian när allt ser rätt ut

## Testa (per butik, i inkognitofönster)
1. Popupen kommer efter ~7 s på startsidan.
2. Klicka vidare till en produktsida utan att röra den → den ska INTE komma tillbaka.
3. Skrapa → mejlsteget → skriv en riktig mejladress → koden visas.
4. Rubrikerna: inga kapade ord, ingen text utanför kanten (mobil + dator).
5. Nollställ för omtest: F12 → Console → `localStorage.clear(); sessionStorage.clear();` → ladda om.

⚠️ Rabattkoderna måste finnas i respektive butik (gjort 2026-08-24 enligt Axel).
⚠️ FI/DK/NO/UK-mejladresser hamnar i respektive butiks kundregister — koppla
   välkomstautomationen i varje butik så nya prenumeranter även får koden mejlad.
