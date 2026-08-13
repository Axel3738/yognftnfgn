# Butikssidor grillforgeco.com (MX) – rapport över juridiska anpassningar

Datum: 2026-08-13
Källa: `market-expansion/grillkliniken/source-export/pages.bulk.jsonl` (Grillkliniken, SE)
Mål: 6 sidor på mexikansk spanska (tú-form), skapade via Shopify Admin API `pageCreate`.

## Skapade sidor

| Titel | Handle | ID |
|---|---|---|
| Sobre Nosotros | `sobre-nosotros` | gid://shopify/Page/711806648660 |
| Envíos | `envios` | gid://shopify/Page/711806681428 |
| Devoluciones y Reembolsos | `devoluciones` | gid://shopify/Page/711806779732 |
| Términos y Condiciones | `terminos-y-condiciones` | gid://shopify/Page/711806812500 |
| Garantía | `garantia` | gid://shopify/Page/711806943572 |
| Política de Privacidad | `politica-de-privacidad` | gid://shopify/Page/711807074644 |

Inga handles kolliderade med befintliga sidor – samtliga skapades med `pageCreate` (ingen `pageUpdate` behövdes). Alla sidor publicerade (`isPublished: true`).

## Juridiska anpassningar (SE → MX)

### Genomgående
- **Varumärke:** Grillkliniken → GrillForge Co överallt.
- **Bolagsinfo:** "GrillForge Co es operado por STONEBITE ECOM AB". Källans svenska personnummer "060504-1276" och felaktiga e-postadresser (kundsupport@gmail.com, kundsupport@grillkliniken.se) borttagna – ersatta med **contact@grillforgeco.com**.
- **Konsumenträtt:** Alla hänvisningar till svensk Konsumentköplag, EU:s 14-dagars ångerrätt och ARN borttagna. Ersatta med **Ley Federal de Protección al Consumidor (LFPC)** och tillsynsmyndigheten **PROFECO**, inkl. LFPC:s påföljder vid fel (reparación, reposición, reembolso, bonificación).
- **Moms:** "Todos los precios incluyen IVA (16%)". Valuta i villkoren: MXN.

### Devoluciones (från "Retur & återbetalnings policy")
- **30 días de devolución behållet** – uttryckligen markerat som frivilligt kommersiellt åtagande UTÖVER LFPC (generösare än lagen, aldrig begränsande).
- **EU:s 14-dagars ångerfrist-avsnitt helt borttaget** (irrelevant i Mexiko).
- **Returadress Sjöhed 160 (Harestad, Suecia) behållen**, men med tydligt krav: kunden ska ALLTID kontakta support på contact@grillforgeco.com innan retur; oanmälda returer accepteras inte.
- Undantagslistan (rea-varor/presentkort) försedd med förbehåll "salvo que la ley disponga lo contrario" så den inte kolliderar med LFPC vid defekta varor.
- Källans duplicerade textblock (samma policy två gånger) rensades till en ren version. Shopify-kontolänken för retur (grillkliniken-butikens konto-URL) togs bort.

### Envíos (från "Fraktpolicy")
- **"Envío gratis en todos los pedidos"** (fraktzonen är konfigurerad med fri frakt – påståendet är sant).
- **Leveranstid 7–14 días hábiles** för Mexiko (internationellt flöde), hanteringstid 1–2 días hábiles. Källans svenska "2–5 dagar / Postnord" borttaget.
- Källans "priser exklusive moms + kunden betalar tull/importavgifter" **borttaget** – ersatt med "Todos los precios incluyen IVA (16%)" (inkonsistent med IVA-inkluderad prissättning; obs för framtida granskning om DDP/DDU-upplägget ändras).

### Términos y Condiciones (från "Användarvillkor")
- Priser: SEK → **MXN, IVA (16%) incluido**; tillägg att exponerat pris respekteras enligt LFPC.
- Leverans: 2–5 dagar Sverige → **7–14 días hábiles México**, fri frakt.
- Reklamation: Konsumentköplagen + "2 månader" → **LFPC** (reparación/reposición/reembolso/bonificación) + hänvisning till **PROFECO**.
- Klarna (finns ej i MX) borttaget ur betalmetoder; kvar: VISA/Mastercard, PayPal, Apple Pay, Google Pay "según disponibilidad al finalizar la compra".
- Ansvarsbegränsning och force majeure försedda med "en la medida permitida por la ley" + att LFPC:s oavvisliga rättigheter inte begränsas.

### Garantía (från "Garanti- och reklamationspolicy")
- Hela strukturen (13 avsnitt) behållen och översatt; [Företagsnamn]/[org.nr]/[e-postadress]-platshållare ifyllda med GrillForge Co / STONEBITE ECOM AB / contact@grillforgeco.com.
- Avsnitt 12 "Förhållande till lagstadgade rättigheter": konsumentköplagen → **LFPC + PROFECO**; garantin markerad som frivillig och ALDRIG begränsande av garantía legal.
- Avsnitt 8 kompletterat med att bolagets val av åtgärd endast gäller den frivilliga garantin – LFPC:s valmöjligheter för kunden vid lagreklamation påverkas inte.
- Instruktion tillagd: kontakta alltid contact@grillforgeco.com innan produkt skickas in.
- Källans kvarglömda interna anteckning "Mastern 2 år livslängd." **borttagen** (intern produktnotis, hörde inte hemma i publicerad policy).

### Política de Privacidad (från "Integritetspolicy")
- Omskriven som **Aviso de Privacidad** enligt **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)** – Mexikos dataskyddslag (konsumentköpsdelen styrs av LFPC, men dataskydd styrs av LFPDPPP; detta är den korrekta mexikanska motsvarigheten).
- Rättighetskatalogen omgjord till **derechos ARCO** (Acceso, Rectificación, Cancelación, Oposición) + revocación del consentimiento + limitación de uso.
- **UK/EES-avsnitten borttagna**: invändning/begränsning enligt GDPR, EDPB-länken till EU:s tillsynsmyndigheter, standardavtalsklausuler/adekvansbeslut. Klagomålsvägen ersatt med **INAI** (mexikansk dataskyddsmyndighet).
- Internationella överföringar omskrivet till LFPDPPP:s regler (mottagare ska bindas av likvärdigt skydd enligt avisot).
- Ansvarig (responsable): GrillForge Co / STONEBITE ECOM AB, kontakt contact@grillforgeco.com, adress Sjöhed 160, Harestad, 442 74, Suecia. Shopify-relationen och Shopifys privacy-portal behållna (plattformsfakta, marknadsoberoende).
- "Senast uppdaterad" satt till 13 de agosto de 2026.

### Sobre Nosotros (från "Om Oss")
- Ingen juridik – kreativ transkreation till mexikansk spanska (asador, smash burgers, mandiles, "rey del carbón"), varumärke bytt till GrillForge Co.

## Kvarstående att bevaka
- Butiken har äldre engelska/svenska sidor kvar (`fraktpolicy`, `retur-aterbetalnings-policy`, `privacy-policy`, `contact` m.fl.) – tema-/footermenyer bör pekas om till de nya spanska handles och gamla sidor eventuellt avpubliceras.
- Om fraktupplägget ändras (t.ex. kund betalar importavgift) måste Envíos + Términos uppdateras – nuvarande text lovar IVA-inkluderade priser.
