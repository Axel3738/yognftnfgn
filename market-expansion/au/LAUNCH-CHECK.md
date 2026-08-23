# The BBQ Clinic (AU) — Launch Check (fas 9, sanningskontroll)

Datum: 2026-08-23 · Butik: thebbqclinic.com (Shopify) · Utförd read-only via Admin GraphQL
(enda mutation: `draftOrderCalculate`, som inte skapar något)

---

## ✅ GODKÄNT

**1. Produkter**
- `productsCount(status:active vendor:'The BBQ Clinic')` = **42** — exakt som förväntat. Alla 42 har vendor "The BBQ Clinic".
- Stickprov 5/5 OK (elektrisk-grillborste, golf-grill-kit, grilltanger, bbq-redskapsset-for-grillen, forklade-lader):
  - Titlar på engelska ("The Master — Grates Gleaming. Beer Cold.", "Golf BBQ Kit…", "BBQ Tongs – Multiple Sizes", "BBQ Tool Set – 3, 5 or 9 Pieces", "Apron - Premium Leather").
  - Priser i AUD med .95-slut: 179.95 / 119.95 / 14.95 / 44.95–59.95 / 74.95.
  - `publishedOnPublication(gid://shopify/Publication/288556384639)` = **true** för alla 5.
  - descriptionHtml på idiomatisk AU-engelska ("barbie", "alfoil", "capsicum") — inga åäöæø.
- Fullscan av ALLA 42 aktiva produkter (titel + descriptionHtml): **0 träffar** på åäöæø, "Grillklinikken"/"Grillkliniken", "DKK", "SEK", "kr"-belopp, gamla mejladresser eller gamla domäner. "Free shipping Australia-wide" i produkttext stämmer med fraktzonen.

**2. Kollektioner**
- Exakt 4 kollektioner: Home page (frontpage, 1 produkt), BBQ Tools (13), Aprons (12), Knives & Chopping Boards (5). Alla har image != null och productsCount > 0.

**3. Sidor (6 st finns)**
- about-us, privacy-policy, returns-refunds, shipping, terms-of-service, warranty — alla publicerade 2026-08-17.
- "Free shipping Australia-wide, no minimum" (shipping + terms) ⇒ stämmer med fraktzonen (Free Shipping $0).
- GST nämns korrekt: "All prices include GST (10%)" (shipping, terms).
- ACL-referenser finns i returns-refunds, terms-of-service och warranty (obligatorisk ACL-text + ACCC-länkar + OAIC i privacy). Privacy-policyn refererar Privacy Act 1988/APPs.
- Inga danska texter; enda nordiska tecken är "Sjöhed" i den legitima svenska returadressen (OK).

**4. Menyer**
- main-menu: Home / BBQ Tools / Aprons / Knives & Chopping Boards / About Us — engelska, alla länkar pekar på existerande handles.
- footer: About Us / Shipping Policy / Returns & Refunds / Terms of Service / Warranty & Claims / Privacy Policy — engelska, alla handles existerar.

**5. Marknader**
- Australia = **ACTIVE** (AUD). Danmark = DRAFT (DKK), Sverige = DRAFT (SEK). Inga andra marknader.

**6. Frakt + checkout-simulering**
- Zon "Australia" (endast AU) med metod "Free Shipping", aktiv, pris 0.
- `draftOrderCalculate` — 2× BBQ Tongs till 123 Collins Street, Melbourne VIC 3000: total **29.90 AUD**, frakt **0.00 AUD**, enda fraktalternativ "Free Shipping" ($0), taxesIncluded = true. Presentment = AUD.

**7. Tema**
- "bbq-clinic-au-dev" har roll **MAIN** (= publicerat live-tema).
- settings_data.json ("current"): inga åäöæø-strängar, ingen "Grillkliniken". Announcement-bar: "FREE SHIPPING AUSTRALIA-WIDE / On every order, no minimum spend" + "30-day returns" — stämmer med frakt & retursida. Footer: "THE BBQ CLINIC CLUB", företagsinfo STONEBITE ECOM AB (org.nr 5595762401) — engelska.

**9. Appar**
- Judge.me: alla 5 stickprovsprodukter har judgeme-metafält (badge, widget, review_widget_data) och settings_data har aktivt app-block `judge-me-reviews` ⇒ installerat & aktivt.
- Kaching Bundles: aktivt app-embed `kaching-bundles` i settings_data ⇒ installerat & aktivt. (Även Klaviyo-embed aktivt.)

---

## ⚠️ VARNINGAR (behöver Axels blick)

1. **GST beräknas till 0.00 AUD i checkout-simuleringen.** Sidorna lovar "All prices include GST (10%)" och "GST is collected at checkout", men draftOrderCalculate gav totalTax = 0.00 (taxesIncluded = true). Det tyder på att GST-registrering/momssats för Australien inte är konfigurerad under Settings → Taxes. Om butiken inte är GST-registrerad (< 75k AUD-omsättning) är själva uppbörden OK att skippa — men då ska sidtexterna om GST justeras. Endera sidan måste ändras: konfigurationen eller löftet.
2. **Kundkonto-menyn är på svenska:** "Kundkontots huvudmeny" med "Ordrar" / "Profil" — syns för inloggade AU-kunder. Bör bytas till "Orders" / "Profile".
3. **Gamla frakt-zoner ligger kvar aktiva i profilen "Allmän profil":** "EU (Europeiska Unionen)" med metoden "Levering med DAO" (danska, 0 SEK), "Internationell/Posten" (0 SEK, 13 länder) och "Sverige/Normal" (49 SEK). De är onåbara så länge endast Australia-marknaden är ACTIVE, men blir skarpa (med gratis frakt worldwide!) samma sekund någon aktiverar DK/SE-marknaderna igen. Rekommenderas att städas.
4. **Free Shipping-raten för Australia är lagrad som 0.0 DKK** (fungerar eftersom 0 = 0, och checkout visar 0.00 AUD, men det är en dansk-era-rest i konfigurationen).
5. **Blandade kontaktadresser:** about-us och shipping använder hello@thebbqclinic.com medan policysidorna använder den gamla adressen (se BLOCKERARE). Efter fixen bör en enda adress användas konsekvent.
6. **Produkt-handles är fortfarande svenska** (elektrisk-grillborste, forklade-lader, grilltanger, bbq-redskapsset-for-grillen, roterande-grillkorg-i-rostfritt-stal-… osv.). Kundsynligt endast i URL:er — funkar, men ser oproffsigt ut i annonser/SEO. Byte kräver redirects, så beslut behövs före annonsstart.
7. **Header-logotypens fil heter "Kopia_av_La_clinica_del_asador.png"** (settings_data). Verifiera visuellt att det verkligen är The BBQ Clinic-logotypen som visas i headern och inte fel varumärke.
8. **Tema- och lokalväljare är påslagna** i header + footer (show_locale_selector / show_currency_selector). Med bara en aktiv marknad visar de troligen inget, men dubbelkolla att ingen DKK/SEK-väljare renderas.
9. Gamla teman ligger kvar opublicerade (bl.a. "theme-export-grillkliniken-se-wetransfer-theme", uppdaterad idag). Ingen kundexponering, men städa gärna efter lansering.

---

## ❌ BLOCKERARE (måste fixas före annonser)

1. **Gammal dansk-era-mejladress `kundeservice@grillklinikken.com` på 4 av 6 sidor** — kundsynlig och angiven som officiell kontakt/klagomålsväg:
   - Privacy Policy: kontaktsektionen ("please email us at kundeservice@grillklinikken.com") — dessutom den adress OAIC-klagomål hänvisas via.
   - Returns & Refunds: **5 förekomster** (inkl. "Always contact us before sending anything back").
   - Terms of Service: **4 förekomster** (Company information, Faulty products, Contact and complaints).
   - Warranty & Claims: **3 förekomster** (garantigivare + claim-instruktion).
   Om domänen/postlådan grillklinikken.com inte längre bevakas går ACL-reklamationer, returförfrågningar och privacy-förfrågningar rakt ner i ett svart hål. Byt till hello@thebbqclinic.com (som about-us och shipping redan använder) på samtliga ställen.

Inga andra blockerare hittades: 42/42 produkter, publicering, priser, marknader, frakt, tema och menyer klarar kontrollen.

---

## ✔️ ÅTGÄRDAT EFTER KONTROLLEN (2026-08-23)

1. **Blockeraren FIXAD:** `kundeservice@grillklinikken.com` → `hello@thebbqclinic.com` på alla 6 sidor —
   26 förekomster totalt (13 mailto-länkar + 13 synliga texter). Verifierat: 0 gamla adresser kvar,
   26 nya. MAIN-temat (bbq-clinic-au-dev) innehåller inga mejladresser alls, så inget att byta där.
2. **Varning 1 (GST) FIXAD på sidorna:** shipping-sidans "GST is collected at checkout" (falskt —
   checkouten tar 0 skatt) ersatt med "All prices are shown in Australian dollars and include any
   applicable taxes — the price you see at checkout is the total price you pay. Standard orders are
   below the AUD $1,000 import threshold, so you should not have to pay anything extra on delivery."
   Terms-of-service: "include GST (10%)" → samma neutrala formulering. Sidorna lovar nu inget som
   checkouten inte håller, oavsett om Axel GST-registrerar sig eller inte.
3. **Varning 5 (blandade adresser) LÖST** i och med punkt 1 — hello@thebbqclinic.com används nu konsekvent överallt.
4. **Varning 2 (kundkonto-menyn):** försökt via API (`menuUpdate` på gid://shopify/Menu/292289184127) —
   avvisas ("customer_account_page hittades inte"); den menytypen kan bara redigeras i admin.
   → Axels manuella lista: Ordrar→Orders, Profil→Profile under Innehåll → Menyer.

Kvarstående varningar (3, 4, 6, 7, 8, 9) är antingen kosmetiska eller kräver Axels beslut/ögon — se slutrapporten.
