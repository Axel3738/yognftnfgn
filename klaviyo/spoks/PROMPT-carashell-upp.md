# Prompt: ladda upp CaraShells mejlsystem i Spoks (klistra in i en NY session)

Skriven 2026-09-26. Förutsättning: CaraShells workspace syns i `whoami` för
Spoks-MCP:n (Axels klick: bjud in MCP-användaren i CaraShells Spoks-workspace,
se `klaviyo/spoks/README.md` → CaraShell). Allt innehåll, planen och
kontrollerna ligger redan i repot. Allt under strecket är prompten.

---

Ladda upp CaraShells hela mejlsystem i Spoks: segment, flöden, kampanjer och
inställningar, allt som utkast och avstängt. Aktivera, schemalägg och skicka
ingenting. Hitta aldrig på ett storeId eller ett produkt-id.

Läs först: `CLAUDE.md` (klaviyo-avsnittet, raden om Spoks), `klaviyo/spoks/README.md`
(rubriken CaraShell), `klaviyo/spoks/carashell/PLAN.md`, `klaviyo/brands/carashell.json`
och `klaviyo/spoks/konvertera.mjs` (huvudkommentaren).

## Steg

0. **Workspace.** `whoami`. Välj workspacen som hör till yitrbk-m3.myshopify.com /
   carashell.se. Finns den inte: stoppa, skriv exakt vad som saknas (README → CaraShell
   → Axels klick) och gör inget mer. Finns den: skriv in `id` i
   `klaviyo/brands/carashell.json` → `spoks.workspace`, kör `get_flows`, `search_campaigns`
   (status draft) och `get_segments` — det som redan finns rättas, aldrig dupliceras.

1. **Mät språkstyrningen.** `preview_segment` med filtret `{country in ["Sweden"]}`,
   sedan `["Norway"]`, sedan `["United States","United Kingdom","Canada","Australia","New Zealand","Finland"]`,
   sedan `{country nis}`. Skriv antalen i README. Stämmer landsnamnen inte med
   Spoks form (sampleContacts visar hur landet skrivs): rätta `sprak_grupper` i brandfilen
   innan något skapas. Kör sedan `preview_segment` med `emailMarketingConsent in [subscribed]`
   per grupp och skriv antalen (mätt i Shopify 2026-09-26: sv 15, nb 4, en 57).

2. **Produkterna.** `products_search` (filter null, limit 20, fields externalId, title, price,
   currency, url, imageUrl). Skriv Spoks `id` per handle i `klaviyo/spoks/carashell/produkter.json`
   (`takskyddet`, `termoskyddet`, `fonstertermomatta-2-pack`, `adventskalender-retrobussar`),
   och kontrollera att `externalId` är Shopifys GID som filen redan bär. Ladda upp de fyra
   produktbilderna (`bild_url` i filen) med `upload_media` och skriv `fileId` i `bild`.
   Kontrollera priset i Spoks katalog mot butiken: SEK-priset ska vara 1 129 kr (takskyddet 5,5/6,5 m),
   559 kr (termoskyddet), 539 kr (mattan), 379 kr (kalendern) — läs dem live på carashell.se.
   Kör `node klaviyo/spoks/konvertera.mjs --brand carashell` — den stoppar på copyfel och
   säger om något id fortfarande saknas. `plan.json` och `payload/<sprak>/*.json` är nu färdiga.

3. **Inställningar.** `get_settings`. Lägg in `plan.json → installningar` med `update_settings`
   (läs verktygets schema först; fältnamnen är `get_settings`-svarets). Läs tillbaka med
   `get_settings`: avsändare `CaraShell <hello@carashell.com>`, reply-to samma, sidfoten med
   bolagsnamn och adress, avregistreringstexten på tre språk. Säger Spoks att avsändardomänen
   (carashell.com) behöver DNS: skriv exakt vilka CNAME/TXT-poster som ska in, på vilka
   underdomäner, i README och i rapporten. ⛔ Byt aldrig namnservrar. Ändra aldrig MX. SPF
   ändras bara genom att lägga till, aldrig ersätta (i dag `v=spf1 include:spf.loopia.se -all`
   på båda domänerna). Mät med dns.google efter varje ändring. DMARC saknas på carashell.se och
   carashell.com (mätt 2026-09-26): `_dmarc` TXT `v=DMARC1; p=none; rua=mailto:hello@carashell.com`
   är Axels klick hos Loopia, skriv det i rapporten.

4. **Segmenten.** För varje rad i `plan.json → segment`: `preview_segment` med filtret (skriv
   antalet), sedan `create_segment` med `name`, `description`, `filter`,
   `isTargetableInPosts: kampanj_ok`. Finns namnet redan i `get_segments`: `update_segment`.

5. **Flödena.** För varje rad i `plan.json → floden` (24 st): `create_flow` med
   `name: spoks.namn`, `trigger: { event, filter, triggerFilter }`, `reenrollEnabled`,
   `allowReenrolmentAfter`. Sedan `add_flow_step` i ordning: varje `delay` med `parameters`
   ur planen, varje `publish_flow_post_to_contact` med `parameters: {}` — svaret ger `postId`
   och `postHash`; fyll mejlet med `update_draft_campaign` (`flowId`, `postId`,
   `currentHash: postHash`, `postData: { title: mejlets namn, blocks: payloadens blocks,
   customizedNotification: { emailTitle, emailDescription } }`). Payloaden ligger i
   `payload/<sprak>/<mejl-id>.json`. Läs tillbaka varje flöde med `get_flow` och kontrollera:
   triggerns filter bär `emailMarketingConsent` (subscribed på F01/F02/F03, nin unsubscribed på
   köparflödena) OCH landsfiltret; F06 bär `triggerFilter externalId`; F14:s delay bär
   `tilHour 18:00`; `isActive: false`; alla send-steg `isEnabled: false`. Skriv flödes-id per
   språk i README.

6. **Kampanjerna.** För varje rad i `plan.json → kampanjer` (39 st): `draft_campaign` med
   `postData: { title: titel, blocks, deliveryChannel: "email", customizedNotification:
   { emailTitle, emailDescription, isOptOutEnabled: true } }`. Skriv id och editor-url per
   kampanj i README. Segmentet och sändtiden (`planerad`) sätts i appen av Axel — MCP:n kan
   inte schemalägga, och det ska den inte heller.

7. **Läs tillbaka.** `get_flows` ⇒ 24 flöden, alla inaktiva. `search_campaigns` status draft
   ⇒ 39 (plus Bäverbutikens? nej: annan workspace). `get_segments` ⇒ 13. Räkna, skriv
   antalen. Stämmer de inte: hitta felet, rätta, räkna igen.

8. **Dokumentera.** README (CaraShell-rubriken): workspace-id, antalen från steg 1, alla id:n,
   DNS-läget, vad som inte gick. `CLAUDE.md` → raden om Spoks. Committa, pusha, PR, merga.

## Järnregler
- Kampanjer bara till `SEG_samtycke_<sprak>`. Köparflöden (F04, F05, F06, F14) filtrerar
  bort avregistrerade; F01, F02, F03 kräver subscribed. Ändra aldrig det.
- Inget aktiveras, schemaläggs eller skickas. Send-steg skapas avstängda och kan inte slås
  på via MCP:n — säg det rakt ut i rapporten i stället för att försöka.
- Ett anrop i taget mot kontaktdatabasen (preview_segment, get_segments).
- Rör aldrig Bäverbutikens eller Matstrumpors workspace.

Avsluta med checklistan ✅/❌ punkt för punkt och Axels klick numrerade, en mening per rad,
med exakt knapp och länk (`get_links` ger adresserna).
