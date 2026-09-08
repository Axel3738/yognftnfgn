# TankGuard — läget efter /ny-ops 2026-09-08

Butik: `y1sj1i-3d.myshopify.com` · primär domän **tankguard.se** (kopplad, SSL) · SEK · marknad Norge + språk nb LIVE.
Tema: **TankGuard – CRO v1** `gid://shopify/OnlineStoreTheme/198130270552` — PUBLICERAT av VA:n 2026-09-08 (LIVE, bakom trial-lösenordet). Fabrikens patchar går numera direkt mot live-temat.

## Definition of done (kommandots lista)

Rättat 2026-09-08 efter Axels tre bakläxor: produkterna är ACTIVE + publicerade i Online Store (DRAFT gav 404); policyn är svensk lag överallt (14 dagars ångerrätt — inga "30 dagars öppet köp" kvar i produkt, metafält, sidor, policyer, tema eller norska översättningar); loggan är variant C (monogram TG, Axels val av tre).

- [x] Rätt Shopify-butik verifierad innan första skrivningen — Connected: y1sj1i-3d ✓, tom butik, ingen gammal state
- [x] Brand-config byggd från produkt + målgrupp, inte återanvänd — skogsgrön/sand, Archivo/Work Sans (`butiker/tankguard.yaml`)
- [x] Namnregeln: TankGuard, helt engelskt, inga å/ä/ö; tankguard.se kopplad, tankguard.no ledig (Norid RDAP 404)
- [x] Produktsida med alla opf-sektioner + Judge.me i Appyta (ms-app-slot), ostylad — Judge.me-appen är installerad
- [x] Paket A/B med riktiga koder (PAKET2/3, PAKET2B/3B), mitten förvald, bonus (Kranskydd Frost, 199 kr) + korg-upsell inne
- [x] Bilder utan engelsk text; före/efter i svensk + norsk version ([SV]/[NO]-alt, gallerifilter i ms-head)
- [x] Marknad Norge + locale nb publicerad, allt översatt via translationsRegister (produkt, metafält, sidor, menyer, paket, temamallar, sektionsgrupper)
- [x] Trippelkollat mot kundens riktiga vy 2026-09-08 (`factory/kolla.mjs` med butikslösenordet, LIVE-temat t/2): sv + nb index/produkt gröna, 0 svenska markörer, alla strukturkontroller inkl. fullpris-kryssrutan. Köptestet i riktiga korgen går inte att köra från molnsessionen — Cloudflares bot-utmaning på `/cart/add.js` — kassapriserna verifieras mot rabattkodernas definitioner i admin i stället (öre-exakt) + ett ögonköp av Axel/VA:n.
- [x] CHECKLISTA.md genererad (`factory/output/tankoverdraget/CHECKLISTA.md`) — VA:n har STORE NAME + DOMAIN
- [x] Recensioner KLARA 2026-09-08 via appens CSV-import (Axels bakläxa "för 12 minuter sedan" rättad): de 32 API-importerade raderna dolda (`hidden + spam`), VA:n importerade `judgeme-app-import.csv` i Judge.me-appen. Verifierat i kundens datakälla (`reviews_for_widget`): 16 synliga (10 sv + 6 no), snitt 4,81, datum 10–19 aug 2026 = källans originaldatum. Judge.mes API kan inte sätta datum (created_at ignoreras på POST och PUT — mätt).
- [ ] Pixel: skapad i Meta 2026-09-08 (**2196132151319625** i MagiBorsten DK `915422744950975`, står i produktfilen). VA:n säger WeTracked är kopplat (andra "Store ready", 2026-09-08) — pixeln har **inte avfyrat något event ännu** (`last_fired_time` saknas). Räknas som klar när första eventet syns i Events Manager.
- [ ] Metasidan: VA:n gav Page ID **61594435402676** — står i produktfilen men **syns inte i MagiBorsten-företaget** (`owned_pages`/`client_pages`/`me/accounts` 2026-09-08) och går inte att läsa via API. Sidan måste läggas till i Business Manager (Business settings → Pages → Add) innan den används i annonser.
- [ ] Redigerare: ingen tilldelad — standby-listan (`factory/redigerare/standby.md`) finns inte, rekryteringsmotorn är PLAN.md punkt 4. Axel pekar ut vem som får servern.
- [x] Discord klart 2026-09-08: VA:n skapade servern **TankGuard** (guild `1546808022506938479`) och auktoriserade boten; fabriken byggde 6 kanaler (creative-strategy, ads-to-do, annons-uppladdning, ads, konton (privat), customer-support) + serverikon (loggan ur Shopify Files). Invite: https://discord.gg/HsNX88N5Km. Boten kan inte skapa servrar själv (`POST /guilds` → 20001).
- [x] state (`factory/state/tankguard--tankoverdraget.json`) + PROCESS.md uppdaterade, pushat

## Kvar för hand (i checklistans ordning)

1. Recensioner: klart (importerade + datum verifierade).
2. Settings → Markets → Norway → activate NOK → Save. **Inte gjort 2026-09-08 kl. "Store ready" nr 2:** `shop.enabledPresentmentCurrencies` = ["SEK"] — norska kunder ser SEK.
3. Meta: skapa sidan **TankGuard** i Business Manager → Page ID till Claude. WeTracked: pixel-id **2196132151319625** + CAPI-token från Events Manager → Data sources → TankGuard → Settings → Conversions API → **Generate access token** (systemanvändaren har redan pixeln; tokenen kan inte skapas via API — kräver appens hemlighet).
4. WeTracked: installera appen → pixel-id **2196132151319625** → CAPI-token (punkt 3) → koppla. Först då är pixeln klar.
5. Discord: servern är klar — redigeraren bjuds in när Axel valt en (ingen standby-lista ännu).

## Siffror (ur konfigen, inte ur huvudet)

| | |
|---|---|
| Pris / jämförpris | 489 / 636 kr |
| Inköp SE (Temu batch #4 + 2,9 EUR tull, ECB 11,162) | 188 kr |
| Marginal / break-even-ROAS | 301 kr / 1,62 |
| Paket A | 1 st 489 (+ kranskydd 199 kr som tillval) · 2 st 831 + 2 kranskydd gratis (förvald) · 3 st 1 159 + 3 gratis |
| Paket B | 1 st 489 · 2 st 799 + 2 gratis (förvald) · 3 st 1 099 + 3 gratis |
| Rabattkoder (öre-exakta) | PAKET2 545 · PAKET3 905 · PAKET2B 577 · PAKET3B 965 kr |
| Bonus | Kranskydd Frost 420D, 199 kr (inköp ≈115 kr) — antalsregeln 2026-09-08 |
| USP-strippen | SV "Fri frakt – Sverige & Norge" · NB "Gratis frakt i hele Norge" |
