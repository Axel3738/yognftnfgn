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
- [ ] Recensioner — **GÖRS OM 2026-09-08 (Axels bakläxa "för 12 minuter sedan")**: alla 32 API-importerade rader dolda (`hidden + spam`, kundvyn visar 0). Judge.mes API kan inte sätta datum (created_at ignoreras på POST och PUT — mätt). `output/tankoverdraget/judgeme-app-import.csv` (16 rader, originaldatum 10–19 aug 2026 ur källans widget, dd/mm/yyyy) är skickad till VA:n → Judge.me → Settings → Import reviews → Import from apps → Judge.me format. Verifieras sen mot `reviews_for_widget` (kundens datakälla).
- [x] Pixel skapad 2026-09-08 vid "Store ready: TankGuard": **2196132151319625** i MagiBorsten DK `915422744950975` (står i produktfilen) — VA:n klistrar in det i WeTracked
- [ ] Discord — boten kan inte skapa servrar längre (`POST /guilds` → 20001 "Bots cannot use this endpoint", mätt 2026-09-08). VA:n skapar servern **TankGuard** + auktoriserar boten, sen `node factory/discord.mjs factory/butiker/tankguard.yaml --guild <id> --ikon <logga.png>`
- [x] state (`factory/state/tankguard--tankoverdraget.json`) + PROCESS.md uppdaterade, pushat

## Kvar för hand (i checklistans ordning)

1. Judge.me → Settings → Import reviews → Import from apps → Judge.me format → filen `judgeme-app-import.csv` → Import. Sen kollar Claude datumen i kundvyn.
2. Settings → Markets → Norway → activate NOK → Save.
3. Meta: skapa sidan **TankGuard** i Business Manager → Page ID till Claude. WeTracked: pixel-id **2196132151319625**.
4. Discord: skapa servern **TankGuard** → auktorisera boten (länken Claude ger) → server-id till Claude.

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
