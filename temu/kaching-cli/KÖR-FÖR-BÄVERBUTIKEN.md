# Klistra in det här i Claude Code PÅ DIN DATOR (i den här mappen)

---

Läs START-HÄR.md och api-map.json innan du gör något. Verktyget är granskat och
alla fem butikerna är ifyllda i stores.json.

Uppgiften (Axels schema 2026-08-22): stegen ska vara **1x ordinarie pris,
2 st −15 %, 3 st −20 %** i alla fem butiker. Jämförpriserna (+30 %) är redan
satta i Shopify av molnsessionen — 1x-raden visar rean automatiskt
(`useProductCompareAtPrice: true`). Siffrorna är marginalsäkrade mot
leverantörsofferten (max 18,4 % på 2-pack / 24,5 % på 3-pack på sämsta
produkten) — ändra dem inte utan att fråga mig.

Steg:
1. `node kaching.mjs status` — står det NOT LOGGED IN säger du till mig, så kör
   jag `node kaching.mjs login` själv. Du hanterar aldrig lösenord eller 2FA.
2. **Sverige — uppdatera LIVE-blocket i stället för att skapa nytt:**
   `node kaching.mjs update --store baverbutiken --id 38b39d0c-4f43-4103-88ae-d18654254905 --file payloads/baverbutiken-standardstege.json`
3. **Utlandsbutikerna — skapa fallback-stegen** (molnsessionen har verifierat
   2026-08-22 att appen är installerad + embedden på i alla fyra, och att ingen
   av de 8 nya produkterna täcks av något befintligt block — de gamla
   selected-products-blocken från 25-katalogen lämnas orörda):
   - `node kaching.mjs create --store beverbutikken --file payloads/beverbutikken-standardstege.json`
   - `node kaching.mjs create --store baeverbutiken --file payloads/baeverbutiken-standardstege.json`
   - `node kaching.mjs create --store majavakauppa --file payloads/majavakauppa-standardstege.json`
   - `node kaching.mjs create --store beavershop --file payloads/beavershop-standardstege.json`
4. Verifiera varje butik med storefront-lintaren:
   `node storefront.mjs <butik>` — 0 errors och exakt ETT all-products-block per butik.
5. Ta en skärmbild av en produktsida per butik (`node theme-preview.mjs …`) och
   visa mig innan du är klar.

Regler: ändra aldrig produktpriser. Hitta aldrig på rabattnivåer. Verifiera efter
varje skrivning. Rör inte deals du inte skapat — utlandsbutikernas gamla block
(uppdaterade 2026-08-20) tillhör 25-katalogen och ska lämnas i fred.

Anteckning: `preselectedDealBarId` är `st1a` (1x förvald) i alla payloader —
medvetet, eftersom `updateNativePrice: true` + förvald 2x gör att produktsidans
pris visar bundlepriset i stället för annonspriset. Vill Axel ha 2x förvald som
i sin gamla butik: byt till `st2b` i payloaden och kör om — men fråga först.

---

## Stiluppdateringen 2026-08-23 (Axels husstil på alla fem stegarna)

Payloaderna i `payloads/` är ombyggda med stilen fält för fält ur Axels egna
referensblock i respektive butik (hårda kanter `cornerRadius: 0`, garantirubriken
som `blockTitle`, butikens exakta `colors`/`fonts`/`spacing`, `Spar {{saved_total}}`-
platshållare). Dessutom: `preselectedDealBarId: "st2b"` (mittenvalet förvalt —
Axels beslut, riskfritt eftersom `updateNativePrice: false` som i referenserna),
`skipCart: false`, `showPricesWithoutDecimals: false`. Stilreferensblocken:
baverbutiken `a725f871-…`, beverbutikken `9c262b91-…`, baeverbutiken `f53d81a5-…`,
majavakauppa `876116b0-…`, beavershop `7ecfec05-…`. Fri frakt-chip är medvetet
utelämnade — bekräfta fraktgränsen per butik innan de läggs på ett
allt-produkter-block. Kör `update` mot varje butiks fallback-block med de nya
payloaderna och visa skärmbilder.
