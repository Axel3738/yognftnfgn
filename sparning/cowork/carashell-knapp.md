# Cowork-prompt: byt Shop-knappen mot "Spåra paketet" i CaraShell

Axels beslut 2026-09-20 kväll: "Jag vill inte ha shop länken." Coworks
första körning (`carashell.md` → Utfall) lämnade Shopifys egen knapp
**"Spåra order med Shop"** (`shop_app_tracking_url`) orörd i de tre
fraktmallarna. Den leder till Shop-appen, inte till spårningssidan. Det här
steget byter den. Bäverbutikens v11-mallar har ingen sådan knapp (mätt i
`mejl/output/`), så det gäller bara CaraShell. Delen under linjen är prompten.

---

Du jobbar i Chrome i min inloggade Shopify-admin för butiken **CaraShell**
(carashell.se, yitrbk-m3.myshopify.com). En uppgift: byta knappen "Spåra
order med Shop" mot en knapp **Spåra paketet** som går till butikens egen
spårningssida. Rör ingenting annat i Shopify.

⚠️ **Datorn är en Windows-dator, inte en Mac.** ⚠️ **Kontrollera alltid
mot servern, inte mot redigeraren.** Klicka aldrig "Ignorera" på "Osparade
ändringar" utan att först ha läst vad servern har.

### Knappen (tre kundnotiser)

**Inställningar** → **Notiser** → **Kundaviseringar**. En mall i taget:
**Leveransbekräftelse** (Shipping confirmation), **Leveransuppdatering**
(Shipping update), **Ute för leverans** (Out for delivery). Inte "lokal
leverans", inte "Levererad".

I varje mall, **Redigera kod**, brödtexten (HTML):

1. Sök efter `shop_app_tracking_url`. Det står i ett block ungefär som
   `{% if shop_app_tracking_url %} … <a href="{{ shop_app_tracking_url }}" …>Spåra order med Shop</a> … {% endif %}`
   (texten kan vara "Track with Shop" eller "Track your order with Shop").
2. Byt **hela** `{% if shop_app_tracking_url %} … {% endif %}`-blocket mot
   samma knapp-HTML som stod inne i blocket, men med:
   - `href` exakt:
     `https://carashell.se/pages/spara?nummer={{ fulfillment.tracking_number | upcase | replace: ' ', '' | replace: '-', '' | sha256 | slice: 0, 8 | upcase | prepend: 'CS-' }}`
   - knapptexten **Spåra paketet**
   - utan `{% if shop_app_tracking_url %}` och utan `{% endif %}` runt —
     knappen ska alltid visas.
   Behåll knappens `class`, `style` och tabellstruktur så den ser ut som
   förut. Ta bort eventuell Shop-logga/ikon inne i knappen.
3. Finns det redan en annan knapp eller textlänk till
   `pages/spara?nummer=` i mallen (från förra körningen): låt den stå,
   men om båda blir knappar direkt under varandra, ta bort den mindre
   textlänken — en knapp räcker.
4. Sök en gång till i koden: `shop_app_tracking_url` ska ge **0 träffar**.

Rör inga andra rader, inte ämnesraden. **Spara**, läs sedan mallen ur
serverns mall-data: `shop_app_tracking_url` 0 träffar, "Spåra paketet"
minst 1, `pages/spara?nummer=` minst 1.

Om en mall inte innehåller `shop_app_tracking_url`: rör den inte, skriv
det i rapporten.

### Testmejlet

**Leveransbekräftelse** → **Skicka testmejl**. Bara den. Öppna mejlet och
kontrollera att knappen heter **Spåra paketet** och att länken börjar med
`https://carashell.se/pages/spara?nummer=CS-`. (Sidan säger "hittar inte"
för testmejlets påhittade nummer — det är väntat.)

### Rapportera tillbaka

1. Per mall: hittades `shop_app_tracking_url`, byttes den, och vad servern
   visar efteråt (träffar på `shop_app_tracking_url`, "Spåra paketet",
   `pages/spara?nummer=`).
2. Testmejlet: knappens text och länkens början.
3. Allt som såg konstigt ut.

Om Shopify vägrar spara: spara inte om, skriv exakt vad felmeddelandet sa.
