# Axels checklista — innan VA:n får sin lista

Engångsgrejer. Gjorda en gång = aldrig igen.
Sen är ditt enda jobb per butik: välj produkt — och ta ägarskapet i överlämningen.

## 1. Bjud in henne
- [ ] Ge henne inloggen till Claude-kontot (Axels beslut 2026-09-07 — hon
      delar kontot i stället för egen plats; invändningen att kontot når
      Meta och allt annat är framförd och överkörd)
- [ ] Loopia → spara företagskortet → ge henne inloggningen

## 1b. Molnsessionens nycklar (en gång)
- [ ] Lägg in **KIE_API_KEY** och **DISCORD_BOT_TOKEN** i
      molnsessionens miljövariabler
- [ ] **META_ACCESS_TOKEN** läggs in när pixelskapandet ska börja
      (Shopify-nycklarna är VA:ns — hon lägger in dem per butik,
      hennes checklistas steg 2)

## 2. Meta klart
- [ ] Business Manager → **Betalningar** → lägg in företagskortet
- [ ] Bjud in henne med **Fullständig åtkomst** (Allt PÅ) — Axels beslut
      2026-09-07: hon får se betalningar; då skapar hon sidor själv i BM
      och Axels godkännande-klick per butik försvinner
- [x] Annonskontot är valt: **MagiBorsten DK** 915422744950975 — alla
      OPS-butiker, svenska och norska, kör på det (ditt beslut 2026-09-07)
- [ ] META_ACCESS_TOKEN hämtas av VA:N, inte Axel (Axels besked
      2026-09-07: "jag vill inte trycka") — hon har Fullständig åtkomst
      i BM och gör Systemanvändare → Generera token → ads_management +
      business_management → klistrar in i Claude. Claude guidar henne.

## 3. Per ny butik (ditt enda återkommande jobb)
- [ ] Säg vilken produkt: klistra produktlänken i Claude med **/ny-ops**
      (VA:n skapar butiken själv på free trial från jobb-Gmailen —
      personal-inbjudan går inte på trial och behövs inte)
- [ ] Ge henne bolags- och bankuppgifterna för Shopify Payments
- [ ] Vid överlämningen: logga in med jobb-Gmailen, välj plan, lägg in
      kortet och ta över ägarskapet (VA-checklistans steg 9)

Sen tar hon och fabriken allt annat.
Hennes lista: `factory/VA-CHECKLIST.md`.
