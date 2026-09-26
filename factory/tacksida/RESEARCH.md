# Research: erbjudandet efter köpet (tacksidan / post-purchase)

Sex researchspår kördes 2026-09-26 (webbresearch mot primärkällor: shopify.dev,
help.shopify.com, Klarna, riksdagen.se, Konsumentverket, app-leverantörernas
egna dokument) för att avgöra hur CaraShells erbjudande efter köpet ska byggas.
Här står det som avgjorde bygget, med källor. Fullständiga fyndlistor ligger i
sessionens journal; det här är destillatet. **Läs det innan erbjudandet ändras.**

## 1. Plattformen: vad som går på en Grow-butik

| Fakta | Källa |
|---|---|
| Tacksidan (`purchase.thank-you.block.render`) och orderstatussidan (`customer-account.order-status.block.render`) går att bygga ut med checkout UI extensions på **alla planer utom Starter**; bara informations-/frakt-/betalstegen är Plus. | https://shopify.dev/docs/api/checkout-extensions · https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility |
| Tacksidans block är **läs-bara**: ordern går inte att ändra ("Write access isn't available on Thank you page targets"). Ett köp därifrån blir en ny kassa. | https://shopify.dev/docs/api/checkout-ui-extensions/2026-07/targets/thank-you/block |
| Legacy "Additional scripts" på orderstatussidan är borta: view-only sedan 2025-08-28, alla icke-Plus-butiker tvångsuppgraderade 2026-08-26. Script tags slutade köra på orderstatussidan 2026-08-26. | https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade · https://shopify.dev/docs/apps/build/online-store/blocking-script-tags |
| **Shopifys one-click "post-purchase"-sida** (`purchase.post.render`) visas INTE för: Klarna, Affirm, AfterPay, **Apple Pay, Amazon Pay, Google Pay**, presentkort/allt som inte är kort; PayPal Express bara med Reference Transactions; **"orders with duties and multiple currencies"** (alla leverantörer: ordrar i annan valuta än butikens); local delivery; andra kanaler än Online Store. | https://shopify.dev/docs/apps/build/checkout/product-offers · https://support.kachingappz.com/en/articles/9264498 · https://docs.aftersell.com/aftersell/does_multi_currency_checkout_impact_aftersell.md |
| Post-purchase är fortfarande **beta** med ansökan (Shopify-staff 2026-01-04: "currently in beta"); **"Only Plus merchants can install custom apps which use post-purchase checkout extensions"** — en egen app får bara använda den på Plus. Icke-Plus: bara publika App Store-appar. | https://shopify.dev/docs/apps/build/checkout/product-offers/build-a-post-purchase-offer · https://community.shopify.dev/t/post-purchase-extensions-still-in-beta/27721 |
| Klarna kan inte debiteras mer än det auktoriserade beloppet efteråt; en tillagd rad i en Klarna-order ger ett mejl med kassalänk och en NY Klarna-order. | https://docs.klarna.com/platform/shopify/payments/post-purchase-management/ · https://help.shopify.com/en/manual/fulfillment/managing-orders/payments/capturing-payments |
| Storefront API från extensionen: `shopify.query` med `api_access = true`, **bara queries**, `@inContext(country, language)` ger marknadens pris och språk. | https://shopify.dev/docs/api/checkout-ui-extensions/2026-07/target-apis/platform-apis/storefront-api |
| Cart-permalinks: `/{locale}/cart/<variant>:<antal>?discount=KOD&checkout[email]=…&checkout[shipping_address][…]=…&attributes[nyckel]=värde`. | https://shopify.dev/docs/apps/build/checkout/create-cart-permalinks |
| Inget API lägger in ett block på tacksidan — kassaredigeraren är enda vägen (Shopify-staff feb 2026). `default_placement` i toml är bara ett förslag. | https://shopify.dev/docs/api/checkout-ui-extensions/2026-07/targets/thank-you/block |
| Deploy i CI: **`SHOPIFY_APP_AUTOMATION_TOKEN`** (Dev Dashboard → appen → Settings → App Automation Token), `shopify app config link` först, `deploy --allow-updates`. Appversioner med extensions kan bara skapas med CLI. Legacy admin-skapade custom apps kan inte ha extensions alls (sedan 2026-01-01). | https://shopify.dev/docs/apps/launch/deployment/deploy-in-ci-cd-pipeline · https://shopify.dev/docs/apps/launch/distribution |

**CaraShell, mätt 2026-09-26 (senaste 384 ordrar):** Klarna 45 % (SE: 74 %),
Shop Pay 30 %, PayPal 7 %, Apple/Google Pay 7 %, kort direkt 7 %, MobilePay 3 %;
ordrar i annan valuta än SEK ≈ 40 %. ⇒ one-click-sidan hade nått kanske var
femte order, och krävt en publik app. **Beslut: tacksidan + orderstatussidan
med egen extension.** One-click via App Store-app kan läggas ovanpå senare för
svenska kortkunder.

## 2. Appar (om one-click ändå ska köpas till)

| App | Pris 2026 | Notering |
|---|---|---|
| Kaching Post Purchase Upsell | 4,99 $ (≤ 99 ordrar) … 36,99 $ (≤ 999) /mån | 5,0 (362 rec.), engelska, tacksideserbjudande skapar ny order |
| AfterSell (Rokt) | 34,99 $/mån för 200 ordrar, skalar | 4,8 (1 059), ett språk per funnel, tacksidan "merge or separate order" |
| Zipify OCU | 9,95–999 $ efter upsell-omsättning | 4,6 (565), tacksideserbjudande = obetald rad i befintlig order |
| ReConvert/Upsell.com | Free → 9,99 → 199 $ | 4,8 (3 093) men många klagomål på fakturering och partnererbjudanden i kassan |

Alla har samma one-click-spärrar (Klarna, wallets, annan valuta). Ingen har ett
API för att skapa erbjudanden. Shopifys egen Checkout Blocks ger på icke-Plus
bara statiskt/dynamiskt innehåll, inget produktblock.

## 3. Erbjudandets form (konvertering)

- **Take-rate-riktmärken:** one-click 4,7 % i snitt (topp 5 %: 28 %), tacksidan
  1,7 % (ReConvert, 40 000 butiker); optimerade one-click 8–16 % (Zipify,
  AfterSell-case); Digismoothie/Candy Rack (218 M visningar, 2026): median
  tacksida 0,7 %, one-click 0,3 % (räknat per visning). Att lägga tacksidan
  bredvid one-click dubblade post-purchase-omsättningen (AfterSell 2026).
  Källor: https://upsell.com/blog/the-impact-of-post-purchase-upselling-2023 ·
  https://www.digismoothie.com/blog/upsell-benchmarks ·
  https://aftersell.com/2026-revenue-report ·
  https://zipify.com/blog-post-purchase-upsells-shopify-2026/
- **Relevans slår rabattdjup.** AfterSell 2026: utan rabatt 17,9 % acceptans,
  djupare rabatt höjer bara gradvis. Digismoothie: 0 % och 1–20 % rabatt
  konverterar lika (2,3 / 2,0 %), 21–50 % lägre (1,5 %). Zipify: 15 % slog 20 %
  med 7,4 procentenheter. Leverantörerna: starta på 10–20 %.
- **Fast belopp uppfattas som mer än procent:** Firestone 6 $ av slog 15 % av
  (13,6 mot 10,3 %). https://zipify.com/winning-upsell-split-test-discounting-dollar-amount-vs-percentage/
- **Komplement slår mer-av-samma** (utom förbrukning); ett starkt erbjudande + ett
  till, aldrig tre ("gauntlet"). Kortet ska öppna med kunden, inte produkten;
  "Wait! Your order is not complete" ger ångerköp och supportmejl.
- **Timer:** inget kontrollerat test på post-purchase; timers som återställs vid
  omladdning lär kunden att inte lita på butiken. Shopifys egna UX-regler
  förbjuder urgency-språk på one-click-sidan.
- **Kunden ser tacksidan/orderstatussidan 2,2 gånger per order** — erbjudandet
  måste tåla att ses igen.
- **Mätning:** impressions, klick, attach rate, omsättning på tilläggsraden;
  ≈ 200 sessioner innan något läses, ≈ 460 för ±2 procentenheter, ≈ 2 200 per
  arm för att skilja 5 från 7 %. https://www.evanmiller.org/ab-testing/sample-size.html

## 4. Svensk lag — det som styrde copyn

| Regel | Följd för kortet | Källa |
|---|---|---|
| **PIL 7 a §** (Omnibus): ett överstruket pris, "ordinarie pris", "erbjudande", "kampanj", "rea", "du sparar" = annonserad prissänkning ⇒ referensen måste vara **lägsta priset butiken tillämpat de senaste 30 dagarna**; produkt yngre än 30 dagar: lägsta priset under den tiden. KO förelade tio bolag 22 MSEK i maj 2025 för uppblåsta jämförpriser. EU-guidningen undantar **villkorade/kopplade erbjudanden** ("30 % när du köper tre") och äkta personliga rabatter, men Konsumentverket: erbjudanden som ser personliga ut men går till konsumenter i allmänhet måste följa 30-dagarsregeln. | Produkterna är NYA i butiken (2026-09-26) ⇒ **inget överstruket pris, inget "du sparar" på kortet** förrän de sålts till listpris i 30 dagar; kortet säger ett villkorat pris: "351 kr för dig som just beställt". Inställningen `visa_ordinarie_pris` slår på det överstrukna priset när det är lagligt — Axels beslut. **Inget jämförpris (compare-at) på de två produkterna** av samma skäl. | https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/prisinformationslag-2004347_sfs-2004-347/ · https://www.konsumentverket.se/for-foretag/prissattning-och-ta-betalt/prisinformationslagen/ · https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:52021XC1229(06) · https://via.tt.se/pressmeddelande/3917015 |
| **MFL bilaga I p. 7**: att oriktigt påstå att något bara finns under mycket begränsad tid eller på särskilda villkor under begränsad tid är alltid otillbörligt. | Ingen timer, inget "bara i dag/engångserbjudande". Kortet gömmer sig efter 48 h på orderstatussidan men påstår ingen deadline. | https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/tillkannagivande-2008487-med-anledning-av_sfs-2008-487/ |
| **DAL 2 kap 2–3, 9 §§**: före köpet: egenskaper, pris inkl. moms, fraktkostnad, ångerrätt; knappen som binder måste tydligt betyda betalningsskyldighet. | Kortets knapp binder inte — det gör Shopifys "Betala nu" i kassan, som visar allt. Kortet visar titel, en mening, pris, fri frakt, 14 dagars ångerrätt. | https://lagen.nu/2005:59 · https://lagen.nu/prop/2013/14:15 |
| **CRD art 22 / AVLK 13 §**: tillägg kräver aktivt ja, inga förbockade rutor. | Kortet lägger ingenting i någon korg förrän kunden klickar. | https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:02011L0083-20220528 |
| **DAL 2 kap 4 § / e-handelslagen 12 §**: bekräftelse på avtalet. | Ny order ⇒ Shopifys vanliga orderbekräftelse. | https://lagen.nu/2002:562 |
| ⚠️ **DAL 2 kap 10 a § (sedan 2026-06-19)**: varje avtal via webb kräver en tydligt märkt **ångerfunktion** ("ångra avtalet här") under hela ångerfristen. Shopify har ingen egen knapp — säger att returer/avbokningar "help meet" kravet. | **Butiksövergripande brist, alla butiker, inte bara upsellen.** Axels fråga att ta med sin jurist/Konsumentverket. | https://lagen.nu/2005:59 · https://help.shopify.com/en/manual/compliance/legal/eu-right-of-withdrawal |
| Klarna via Shopify Payments: SEK/NOK/DKK/EUR, inte USD. | US-kunder betalar aldrig med Klarna; Klarna-spärren gäller Norden. | https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/klarna |

## 5. Öppna frågor (kräver Axel eller en test)

1. Riktiga inköpspriser för de två produkterna (marginaltabellen i README bygger
   på ett antagande).
2. Rabattnivån (≈ 35 % valt) — researchen säger att relevans slår djup; en
   grundare rabatt kan testas när underlaget finns (≥ 460 kandidatordrar per
   variant).
3. Slå på överstruket pris (`visa_ordinarie_pris`) tidigast 2026-10-26, och bara
   om produkterna faktiskt legat till listpris hela tiden.
4. Ångerfunktionen (DAL 2 kap 10 a §) — butiksövergripande.
5. Det förbockade nyhetsbrevet i kassan (MFL 19 §) — butiksövergripande.
6. One-click-app (Kaching/AfterSell) för svenska kortkunder — bara om tacksidans
   take-rate visar att efterfrågan finns.
