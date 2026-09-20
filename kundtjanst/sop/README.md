# Tvist-SOP:erna — vad det här är och hur det flyttas till en ny butik

Den här mappen är VA:ns handbok för chargebacks och inquiries. **Allt utom den
här filen är på engelska** — VA:n läser engelska, du läser svenska.

Byggd 2026-09-20 ur Bäverbutikens 50 verkliga tvister, inte ur en mall.

---

## Det viktigaste fyndet först

| | Antal | Avgjorda | Vunna | Förlorade | Vinstgrad |
|---|---|---|---|---|---|
| **Inquiry** | 43 | 29 | 29 | **0** | **100 %** |
| **Chargeback** | 7 | 4 | 1 | **3** | **25 %** |

Allt som förlorats någonsin (1 435 kr) var **chargebacks**. Ni har aldrig
förlorat en inquiry.

Det betyder att hela spelet är att **stoppa inquiryn innan den blir en
chargeback** — inte att skicka in perfekta bevis. En obesvarad inquiry
förloras inte på plats; den eskalerar. Tre av era gjorde det: `#4914`,
`#5044` och `#4706`.

Och det som avgör en enskild tvist i er data är **en enda sak: finns det en
leveransskanning?** Elva av tolv granskade paket hade en. Det tolfte (`#5584`)
hade det inte — och det är det enda som inte gick att vinna.

---

## Filerna

| Fil | När VA:n öppnar den |
|---|---|
| `START-HERE.md` | Kartan. Hon börjar alltid här |
| `00-MASTER.md` | En tvist har landat — vad som händer första timmen |
| `10-NOT-RECEIVED.md` | "Varan kom aldrig" — den vanligaste och mest vinnbara |
| `11-UNACCEPTABLE.md` | "Varan var inte som utlovat" — den svåraste |
| `12-CREDIT-NOT-PROCESSED.md` | "Jag skulle få pengar tillbaka" |
| `13-FRAUD-UNRECOGNIZED.md` | "Jag känner inte igen köpet" / kortbedrägeri |
| `14-DUPLICATE-SUBSCRIPTION-OTHER.md` | Dubbeldebitering och de ovanliga koderna |
| `20-NO-CONTACT.md` | **Din fråga:** kunden har aldrig hört av sig |
| `30-EMAIL-TEMPLATES.md` | Färdiga kundmejl att klistra in |
| `40-EVIDENCE-PACK.md` | Vad som bifogas och var det hämtas |
| `50-PREVENTION.md` | Hur nästa tvist undviks — den här läser du, inte VA:n |
| `99-BACKLOG.md` | Vad systemet ännu inte täcker |
| `beslut/order-*.md` | Färdig dom per öppen tvist, med bevistext att klistra in |

---

## Så flyttas det till en ny butik

SOP-texten är **identisk på alla butiker**. Det enda som skiljer dem är
`{{PLATSHÅLLARNA}}`, och de fylls från ett enda block i butikens brandfil:

```yaml
# kundtjanst/brands/<butik>.yaml
tvister:
  returadress: "..."          # VA:n skickar den för hand — står sällan i policyn
  returfonster_dagar: 30      # butikens EGEN policy — LÄS den, gissa aldrig
  angerratt_dagar: 14         # lagstadgad ångerrätt (EU/Sverige)
  policy_url: "https://..."   # sidan kunden godkände i kassan
  billing_descriptor: "..."   # Shopify → Settings → Payments
  strid_lonar_sig_over: 0     # under detta belopp: återbetala i stället
```

Hela listan: `node kundtjanst/sop-koll.mjs --lista`

**Vakten:** `node kundtjanst/sop-koll.mjs` går igenom alla SOP-filer och felar
om någon platshållare glidit isär eller om ett butiksnamn smugit in i
procedurtexten. Den körs i `npm test`. Utan den spricker portabiliteten tyst
— när SOP:erna skrevs hade samma värde redan tre olika namn.

---

## Verktyget VA:n faktiskt kör

```bash
node kundtjanst/tvistfakta.mjs 4446 --brand baverbutiken
```

Hämtar order, tvist, återbetalningar och leveransskanning och skriver ut
**FIGHT / REFUND / ESCALATE** med bevislistan och risken — på engelska.
`--alla` tar hela kön. Läs-bart: ingenting ändras, inga pengar rör sig.

⚠️ **Spårning för gamla paket måste registreras hos 17TRACK först.** Alla tolv
tvistordrar svarade *"does not register, please register first"* — de var
äldre än spårningsrutinens fönster. `--registrera` gör det (kostar kvot).

---

## Två saker du måste bestämma

1. **Returadressen** finns ingenstans i repot. VA:n skickar den för hand.
   Utan den går mejlmallarna inte att skicka som de står.

2. **Returfönstret säger emot sig självt i praktiken.** Butikens policy säger
   **30 dagars retur** + **14 dagars lagstadgad ångerrätt**, båda räknat
   **från mottagandet**. VA:n bedömde `#5435` som "13 dagar efter
   orderbekräftelsen, inom 14-dagarspolicyn" — men varan var inte ens levererad
   då. Med 3–4 veckors leveranstid öppnar fönstret en månad efter köpet, och
   det är den detaljen som avgör om en kund har rätt eller inte.

---

## Och en sak som inte är en SOP-fråga

Butikens returpolicy ber kunderna mejla **`kundsupport@baverkoppling.se`**.
Den domänen saknar MX-post helt (mätt 2026-09-12 i repot, sidfotsadressen är
känd sedan tidigare) — **mejl dit landar ingenstans.** Policysidan är det
kunden läser när något gått fel, och just då skickas de till en brevlåda som
inte finns. Flera av tvisterna är märkta "no conversation"; en del av dem kan
vara kunder som faktiskt hörde av sig. Det är en rotorsak, inte ett
supportproblem.
