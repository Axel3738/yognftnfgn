# Stigestøtte 2-pk NO — förbeställning och läget 2026-09-24

Skrivet 2026-09-24 av en kartläggning i sju agenter (bara läsning, inget ändrat).
Axel har ännu INTE bekräftat att det är den här produkten eller gett leverantörens datum.
Allt nedan är MÄTT 2026-09-24 04:00–04:45 UTC om inget annat står.

## Produkten
- beverbutikken.no/products/stigestotte-2-pk-stigen-slutter-a-skli-sidelengs, id 15553084719479,
  SKU `BEVER-B7-STEGSTOD` (samma SKU som Stegstöd 2-pack i Bäverbutiken).
- 1 329 NOK, jämförpris 1 729 NOK (har aldrig varit ett försäljningspris). Kaching-nivåer 1 st / 2 st −15 % / 3 st −20 %.
- Lagret spåras inte (`tracked: false`, CONTINUE, saldo −48). Sidan säger "På lager – Begrenset antall".
- Annonskonto Magiborsten NO `act_1050941584152547` (SEK), kampanj `120252183673160233`, ACTIVE, 500 SEK/dag
  (sänkt 3 600 → 500 2026-09-23 08:00).

## Problemet (det Axel kallade "lite problem")
- 43 betalda ordrar, 48 st, 61 798,50 NOK (#1682–#2039, 11–22 sep). 21 av dem Klarna. Pengarna redan utbetalda.
- Dianxiaomi märkte alla som skickade inom ~13 h, och alla 43 fick Shopifys skickat-mejl.
- **0 av 47 paket har skannats** (17TRACK InfoReceived). Samma dagar, samma lager: 222 av 225 andra paket rör sig.
  Felet sitter i SKU:n. Att leverantören är slut är ANTAGET.
- Äldsta ordern 12,8 dagar. Butikens löfte (0–2 + 5–10 virkedager) passeras för de första 2026-09-29.
- Försäljningen föll 21 sep (add-to-cart 2,4–9,5 % → 0–0,7 %), före budgetsänkningen. Orsaken är inte mätt.

## Annonserna (vinstbidrag, BE-ROAS 1,63)
- Livstid 28 028 SEK, 42 köp, ROAS 2,27. Senaste tre dygnen 7 304 SEK, 3 köp.
- CS_3 är top spender (~80 % av vinsten, 14 d), men voiceovern säger "Nesten utsolgt … før de er utsolgt".
- CS-copyn "kun i dag" har gått varje dag sedan 11/9, och "23 %" räknas mot 1 729 NOK.
- **Köparna är män 55+** (39 av 42 köp, 28 av dem 65+). Män 45–54 har 0 köp.

## Norska regler (läsning av lagtext, inte advokatbedömning)
- Förbeställning med förskott är ok om leveranstiden står före köpet. Angiven tid = avtalat datum (fkjl § 6).
  Leverantörens fel är butikens ansvar (fkjl § 24).
- Ångerfristen (14 d) börjar när varan mottagits och kan inte förkortas.
- En "nästa batch"-räknare som flyttar sig varje dag är förbjuden (svartelistan pkt 7, Forbrukertilsynet mot Stayclassy 2022).
  Evolves steg 2 får bara byggas med äkta datum.
- Att annonsera en vara man vet inte kan levereras = lockannonsering (svartelistan pkt 5).

## Hinder för att bygga
1. **Dianxiaomi** märker varje ny order som skickad och skickar "Beregnet levering nå + 7–14 dager".
   Dianxiaomi finns inte i repot. Går det inte att stoppa för SKU:n spricker förbeställningen dag 1.
2. NO-appen "Bever No produkter claude" saknar `read/write_themes`, `read/write_shipping`, `write_orders`.
   Tema, eget fraktsätt och återbetalning via API går inte i dag.
3. Fraktsättet "Posten" gäller alla 223 produkter. Förbeställningens fraktnamn kräver en egen leveransprofil.
4. Autosvaret kör inte för NO. Skulle det slås på säger det "Pakken er sendt og på vei" för InfoReceived (fel i `fakta.mjs`,
   gäller alla butiker). Strängbugg: `leverans_dagar` i brandfil blir en sträng och ignoreras.
5. VA-SOP:en för avbeställning säger "skickad = kan inte avbrytas" och kräver ägarens ok, vilket krockar med "återbetala direkt".
6. Stigestødets 10 Judge.me-recensioner (5 stjärnor) är importerade, daterade 2026-09-04 med @example.com-adresser,
   innan produkten fanns i NO och innan någon fått varan. Juridisk risk (ANTAGET).
7. Fraktsidan anger fortfarande Beverbutikken@gmail.com, och brandfilens policy_url ger 404.

## Byggplan (kritikerns ordning)
1. Axel: produkt, leverantörens datum och antal, och vad som händer med kampanjen.
2. Axel + leverantör: stoppa Dianxiaomis autofulfillment för SKU:n. Återanvänds de 47 fraktsedlarna?
3. Mejl till de 43: ärlig status, nytt datum, "vill du fortfarande ha varan?" (fkjl § 22), full återbetalning på begäran.
4. Återbetalningsvägen: nya scopes på NO-appen (Cowork + Axels godkännande) och ny SOP "Pre-order / sold-out order".
5. Städa: dölj recensionerna, ta bort jämförpriset, kontrollera Judge.me:s recensionsförfrågan.
6. Tema: egen mall `product.preorder` (rör aldrig `claudeprodukter`, 218 produkter), datum ur ett metafält.
7. Egen leveransprofil med fraktsättet "Forhåndsbestilling – sendes innen [dato]". Gåvan i Kaching freeGifts.
8. Mejl: SKU-gren i fraktmallen och en norsk orderbekräftelse med förbeställningsvillkor.
9. Kod: InfoReceived = "fraktsedel bokad" i autosvar/sparning/tvistfakta, och förbeställningsläge per SKU.
10. Ny copy med äkta datum, skriven för män 55+. CS-voiceovern måste göras om.
