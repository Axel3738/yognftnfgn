# Fynd 2026-09-08: Temus recensionsantal är INVERTERAT mot utfallet

**Mätt i dag mot kontots egna, kända utfall.** Vinnar-DNA:t avsnitt 11 skrev att Temus
popularitetssignaler "diskriminerar troligen svagt" och satte dem till UNKNOWN på alla tio.
Det var fel. De diskriminerar **starkt — men åt motsatt håll mot vad man tror.**

## Datan

| Produkt | Meta-utfall (verkligt) | Temu ★ | **Temu recensioner** |
|---|---|---|---|
| IBC-tanköverdrag | **ROAS 2,94** | 4,5 | **13** |
| PTZ-kamera dubbellins | **ROAS 3,38** (bäst i kontot) | 4,3 | **30** |
| Marin motorhölje 420D | ROAS 1,93 · ~523 köp (störst) | 4,7 | 244 |
| Fiskespöhållare | ROAS 2,24 · 307 köp · +43 700 kr | 4,8 | 339 |
| *Tofflor Ergonomiska* | **ROAS 1,59 mot BE 1,80 — FÖRLORARE** | 4,8 | **1 781** |
| — | — | — | — |
| Utekattkoja (kandidat) | ej testad | 4,9 | 72 |

Källa: `temu-ld.py` mot JSON-LD 2026-09-08 06:2x UTC (`v23/material/<id>/data.json`).
Utfallen ur `docs/temu-vinnar-dna/data/ground-truth.md`.

## Vad det betyder

**Under 50 recensioner → ROAS 2,9–3,4. Runt 250–350 → ROAS 1,9–2,2. Över 1 700 → förlorare.**

Kontots enda bekräftade förlorare i gruppen har **5× fler recensioner än den största vinnaren**
och ett av de högsta betygen. De två bästa ROAS-produkterna har de två LÄGSTA
recensionsantalen och de LÄGSTA betygen (4,3 och 4,5).

Mekanismen är enkel och förklarar något vi redan visste:

```
Många Temu-recensioner
  → produkten är redan hittad av hundratals dropshippers globalt
    → någon säljer den redan i Sverige (Fyndiq/Amazon/CDON-golvet)
      → någon annonserar den redan på Meta i Sverige
        → vi konkurrerar i stället för att sätta ankaret → förlorare
```

Det är exakt kedjan bakom tofflor 9: 1 781 Temu-recensioner → BilligaBoden 229 kr →
**648 aktiva Meta-annonsörer** → ROAS 1,59. Och baksidan: IBC med 13 recensioner hade
noll svenska konkurrenter och gjorde ROAS 2,94.

**Betyget är brus eller svagt inverterat.** 4,8 på förloraren, 4,3 på den bästa vinnaren.
Sluta använda det som kvalitetssignal.

## Varför det är viktigare än allt annat vi mätt

Recensionsantalet är **gratis, står på sidan, tar två sekunder** — och verkar förutsäga
samma sak som den svenska hyllkontrollen, som kostade agenterna timmar per produkt och
dessutom **missar 4 av 9 vinnare** (se nedan).

Det är en **ledande** indikator: den mäter mättnaden innan den syns i svensk handel.
Hyllkontrollen är en **släpande** indikator — när Fyndiq har produkten är det redan för sent.

## Samtidigt: hyllgaten som vi körde den hade dödat kontots egna vinnare

`docs/temu-vinnar-dna.md` rad 90, variabel E — de nio vinnarnas egna värden:

- Motorhöljet: **½** — Jula säljer båtkapell 199 kr, vi sålde för 299
- Strandtofflorna: **0** — Rusta säljer EVA-clogs 35 kr, vi sålde för 349
- Axelbältet: **0** — Jula 349 / Clas 499, vi sålde för 599
- PTZ-kameran: **0** — Tapo 679, vi sålde för 799

**Fyra av nio vinnare hade ett billigare svenskt alternativ i samma form och vann ändå.**
DNA:t skriver ut villkoret på rad 180: det fungerar när ett **märkesankare 1,6–3× högre**
finns synligt *och vår produkt ser ut som ankaret*.

I Q4-jakten tillämpades E som **hård kill i 37 av 64 avslag**. Undantaget tillämpades inte.
Det är det enskilt största metodfelet i körningen.

## Vad som ska ändras i filtret

| Gate | Var | Ska bli |
|---|---|---|
| Temu-recensioner | UNKNOWN, oanvänd | **FÖRSTA gaten. > ~800 = kill. 300–800 = varning. < 150 = grönt.** Gratis. |
| Meta Ad Library SE | HÖGT PREDIKTIV men kördes sist eller inte alls | **Andra gaten. ≥ 3 aktiva annonsörer = kill.** (7 av 8 vinnare hade 0–1; förloraren 648.) |
| Svenska hyllan | HÅRD KILL (37 av 64) | **Varning, inte kill.** Kill bara när golvet ligger under vårt pris OCH inget ankare ≥ 1,6× finns OCH Ad Library ≥ 3. |
| Temu-betyg | användes som kvalitetstecken | **Ignorera.** 4,8 på förloraren, 4,3 på bästa vinnaren. |
| Material | HÖGT PREDIKTIV | oförändrad — men den var blockerad i hela jakten, se nedan |

## Kvarstående osäkerhet — läs detta innan någon agerar

- **n = 5 vinnare + 1 förlorare.** Fem vinnare återstår att mäta (sätesöverdraget
  601101433025443, strandtofflorna 601099677938468, axelbältet 601101171339794,
  bandslipen 601102681234291, klistermärkena 601102867393554). Temu strypte efter sex anrop.
- **Recensionsantal blandar ålder och popularitet.** En ny listning av en gammal produkt har
  få recensioner utan att vara outnyttjad. Kontrollera alltid mot Ad Library.
- Fönstret som motsäger: fiskeadventskalendern har 1 recension men 9 svenska annonsörer —
  där är *kategorin* mättad även om *listningen* är ny. Ad Library fångar det, recensionerna inte.
