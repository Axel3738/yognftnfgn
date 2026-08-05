# Analysmetoden — hur data läses av. Obligatorisk, får aldrig kortas ner.

Detta dokument finns för att Claude har dömt vinnare som förlorare två gånger:
först på ROAS ensam, sedan på CPA ensam. **Enmetriks-domar är förbjudna.**
Alla kommandon som bedömer annonser (`/cs`, `/forsta-batch`, `/checkin`) MÅSTE
följa stegen nedan i ordning, och visa tabellerna i sitt svar.

---

## Steg 0 — Hämta datan med rätt fält

Dessa fältnamn är verifierade mot MagiBorsten och fungerar på ad-nivå. Gissa
aldrig fältnamn; får du fältfel, kör `ads_get_field_context` — hitta ALDRIG på
siffror för att komma runt ett fel.

```
id, name, effective_status, amount_spent, actions:omni_purchase,
cost_per_omni_purchase, purchase_roas, omni_purchase_values, impressions,
ctr, cpm, frequency, video_play_actions, video_p50_watched_actions
```

Ogiltiga (vanlig felkälla): `spend`, `purchases`, `cost_per_purchase`.

**Hämta alltid hela kampanjen, sorterad på `amount_spent_descending`.** Att bara
titta på ett urval gör att spendfördelningen — den viktigaste signalen — försvinner.

## Steg 1 — Datakvalitetskontroll (gör FÖRE analysen)

⚠️ **`omni_purchase_values` är opålitligt i detta konto.** Verifierat 2026-08-05:
5 av 8 annonser i Motorhölje-kampanjen returnerade intäkten **100× för lågt**
(t.ex. 60,99 kr i stället för 6 099 kr). Summerar du det fältet får du skräp.

**Kontrollen, per annons:** `amount_spent × purchase_roas` ska ≈ `omni_purchase_values`.
- Stämmer det (±5 %): använd fältet.
- Stämmer det inte: **använd `amount_spent × purchase_roas` som intäkt** och
  skriv i rapporten vilka rader som var trasiga. Rapportera aldrig en AOV som
  är absurd (4 kr per order) utan att flagga den.

Räkna också: `amount_spent / actions:omni_purchase` och jämför med
`cost_per_omni_purchase`. Stora avvikelser = flagga, gå inte vidare tyst.

## Steg 2 — Signifikansgrind (FÖRE all rangordning)

Dela annonserna i två högar innan något jämförs:

| Hög | Villkor | Vad som får sägas |
|-----|---------|-------------------|
| **Bedömbara** | ≥300 kr spend **OCH** ≥3 köp | Får klassificeras |
| **För tidigt** | Allt annat | **Ingen dom.** Ingen ranking. Inga slutsatser om hook eller vinkel. |

En annons med ROAS 9,2 på 38 kr spend och 1 köp är **brus, inte en vinnare** —
den hör hemma i "för tidigt" och får aldrig användas som jämförelsenorm mot en
annons med 76 köp. Detta var felet som fick top spendern att se dålig ut.

## Steg 3 — Två olika linjer, inte en

Detta är den vanligaste källan till felaktiga kill-beslut:

| Linje | Vad den betyder | Vad den används till |
|-------|-----------------|----------------------|
| **Break-even-CPA** (`break_even_cpa_sek`) | Täckningsbidrag per order. Över denna = förlust. | **Kill-beslut.** Enda linjen som får döda en annons. |
| **Target-CPA** (`target_cpa_sek`) | CPA vid 25 % nettomarginal — ambitionsnivå. | Budgetallokering och skalningsbeslut. |

Motorhöljet: target 135 kr, **break-even 236 kr**. En annons på CPA 161 kr ligger
över target men tjänar **75 kr per order** — den ska skalas, inte dödas.
"Över target-CPA" är ALDRIG i sig ett skäl att pausa.

Kill-regeln: CPA > break-even-CPA, efter ≥500 kr spend, och trenden håller i sig.

## Steg 4 — Rangordna på vinstbidrag, aldrig på en kvot

Bygg **alltid** denna tabell först, sorterad på vinstbidrag:

```
vinstbidrag = (break-even-CPA − CPA) × antal köp
```

| Annons | Spend | Andel spend | Köp | CPA | ROAS | Vinstbidrag | Andel vinst |
|--------|-------|-------------|-----|-----|------|-------------|-------------|

ROAS och CPA är **kvoter** — de säger hur effektiv en krona är, inte hur mycket
pengar annonsen tjänar. En annons kan ha dubbelt så hög ROAS och ändå bidra med
en tiondel av vinsten. Vinstbidraget är det som betalar dina räkningar.

**Verkligt exempel (Motorhölje, 14 dagar, 2026-08-05):**

| Annons | Spend | Köp | CPA | ROAS | Vinstbidrag |
|--------|-------|-----|-----|------|-------------|
| `Motorhölje_PD_1_H3` | 12 240 kr (66 %) | 76 | 161 kr | 2,51 | **5 692 kr (51 %)** |
| `Motorhölje_SP_1_H1` | 1 738 kr | 15 | 116 kr | 3,51 | 1 802 kr |
| `Motorhölje_PD_EXTRA` | 712 kr | 8 | 89 kr | 4,53 | 1 175 kr |
| `Enginecover_SO_5_1` | 38 kr | 1 | 38 kr | **9,22** | 198 kr (för tidigt) |

Annonsen med lägst ROAS av de bedömbara är den som tjänar **mer än hälften av
alla pengar**. Att pausa den hade halverat vinsten. Annonsen med ROAS 9,22 —
som ser bäst ut i varje ROAS-sorterad vy — bidrar med under 2 % och har ett
enda köp bakom sig.

## Steg 5 — Läs spendfördelningen som en signal

Meta flyttar budget till det som konverterar i skala. Att en annons har 66 % av
spenden är algoritmens dom, byggd på fler datapunkter än du har.

- **Top spendern är benchmark**, inte en kandidat att döma mot småannonser.
  Alla andra annonser jämförs MOT den — inte tvärtom.
- **Räkna med regression:** en annons med ROAS 4,5 på 712 kr kommer nästan
  säkert att landa lägre när den får 12 000 kr. Höga kvoter på låg spend är
  delvis tur och delvis att den bästa publiken nås först. Behandla dem som
  **skalningskandidater att testa**, inte som bevisade vinnare.
- Blir top spendern verkligen sämre över tid: kolla **frequency** och trend
  (jämför 7d mot 14d) innan du drar slutsatsen — det är utmattning, inte att
  creativen var dålig.

## Steg 6 — Diagnostisera VARFÖR (det är här creative strategy börjar)

Rangordningen säger vad som funkar. Detta steget säger varför — och det är det
enda som gör nästa batch bättre. Gå igenom kedjan per bedömbar annons:

| Steg | Metrik | Vad ett lågt värde betyder |
|------|--------|----------------------------|
| Stoppar scrollen | hook rate = `video_play_actions` / `impressions` | Hooken/första bilden fungerar inte |
| Håller kvar | hold = `video_p50_watched_actions` / `video_play_actions` | Manuset tappar dem — var? |
| Skapar klick | `ctr` | Löftet är inte tillräckligt starkt |
| Konverterar | köp / klick | Annons ≠ landningssida, eller fel publik |
| Kostar att nå | `cpm` | Kreativ trötthet eller smal publik |

Peka alltid ut **var i kedjan** en förlorare tappar. "Sämre hook" är inte en
analys — "hook rate 0,52 mot vinnarens 0,95, alltså stoppar den inte scrollen"
är en analys. Först då kan nästa batch isolera rätt variabel.

Exempel ur datan ovan: `Motorhölje_SP_1_H1` har CTR 1,75 % mot `PD_EXTRA`s
5,66 % — men bättre CPA än flera med högre CTR. Hög CTR utan köp är
nyfikenhetsklick; optimera aldrig mot CTR ensamt.

## Steg 7 — Skriv slutsatsen så den går att ifrågasätta

Varje dom ska ha formen:

> **[Annons]** — [klassificering] · Vinstbidrag X kr (Y % av totalen) ·
> CPA Z mot break-even B och target T · Diagnos: [var i kedjan] ·
> **Beslut:** [skala / iterera / lämna / pausa] · Detta bygger på [antal] köp.

Skilj alltid **data** (det datan visar) från **hypotes** (din tolkning). Skriv
ut osäkerheten: "76 köp — stabilt" vs "1 köp — ingen slutsats möjlig".

---

## Snabbchecklista (kopiera in i varje analyssvar)

- [ ] Hela kampanjen hämtad, sorterad på spend
- [ ] Datakvalitetskontroll körd (`spend × ROAS` vs `values`), trasiga rader flaggade
- [ ] Signifikansgrind: "för tidigt"-högen utpekad och utesluten ur rankingen
- [ ] Vinstbidragstabellen visad, sorterad på vinst — inte på ROAS eller CPA
- [ ] Break-even-CPA använd för kill-beslut, target-CPA för skalning
- [ ] Top spendern behandlad som benchmark
- [ ] Diagnos per bedömbar annons: var i kedjan den tappar
- [ ] Data skild från hypotes, antal köp angivet bakom varje dom
