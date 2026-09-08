# TankGuard — läget efter /ny-ops 2026-09-08

Butik: `y1sj1i-3d.myshopify.com` · primär domän **tankguard.se** (kopplad, SSL) · SEK · marknad Norge + språk nb LIVE.
Tema: **TankGuard – CRO v1 (utkast)** `gid://shopify/OnlineStoreTheme/198130270552` — OPUBLICERAT, VA:n publicerar (checklistans steg 10).

## Definition of done (kommandots lista)

Rättat 2026-09-08 efter Axels tre bakläxor: produkterna är ACTIVE + publicerade i Online Store (DRAFT gav 404); policyn är svensk lag överallt (14 dagars ångerrätt — inga "30 dagars öppet köp" kvar i produkt, metafält, sidor, policyer, tema eller norska översättningar); loggan är variant C (monogram TG, Axels val av tre).

- [x] Rätt Shopify-butik verifierad innan första skrivningen — Connected: y1sj1i-3d ✓, tom butik, ingen gammal state
- [x] Brand-config byggd från produkt + målgrupp, inte återanvänd — skogsgrön/sand, Archivo/Work Sans (`butiker/tankguard.yaml`)
- [x] Namnregeln: TankGuard, helt engelskt, inga å/ä/ö; tankguard.se kopplad, tankguard.no ledig (Norid RDAP 404)
- [x] Produktsida med alla opf-sektioner + Judge.me i Appyta (ms-app-slot), ostylad — Judge.me-appen är installerad
- [x] Paket A/B med riktiga koder (PAKET2/3, PAKET2B/3B), mitten förvald, bonus (Kranskydd Frost, 199 kr) + korg-upsell inne
- [x] Bilder utan engelsk text; före/efter i svensk + norsk version ([SV]/[NO]-alt, gallerifilter i ms-head)
- [x] Marknad Norge + locale nb publicerad, allt översatt via translationsRegister (produkt, metafält, sidor, menyer, paket, temamallar, sektionsgrupper)
- [ ] Trippelkollat mot /nb och svensk vy — **DELVIS**: strukturen verifierad via API; kundens riktiga vy kräver butikslösenordet (`SHOPIFY_STOREFRONT_PASSWORD`, trial-butik) → `node factory/kolla.mjs …`
- [x] CHECKLISTA.md genererad (`factory/output/tankoverdraget/CHECKLISTA.md`) — VA:n har STORE NAME + DOMAIN
- [x] Recensioner importerade 2026-09-08: 10 svenska + 6 norska (Kari, Ola, Bjørn, Ingrid, Lars, Silje) på produkten; 6 felimporterade (svenska namn) dolda som spam
- [ ] Pixel + Discord — vid "Store ready: TankGuard" (META_ACCESS_TOKEN finns i miljön; Discord-servern är VA:ns steg 9)
- [x] state (`factory/state/tankguard--tankoverdraget.json`) + PROCESS.md uppdaterade, pushat

## Kvar för hand (i checklistans ordning)

1. `SHOPIFY_STOREFRONT_PASSWORD` i sessionens Environment (Online Store → Preferences → Password) — sen kör Claude trippelkollen.
2. Judge.me → Settings → Integrations → API Token → i Environment som `JUDGEME_TANKGUARD_TOKEN`.
3. Online Store → Themes → **TankGuard – CRO v1 (utkast)** → Publish.
4. Settings → Markets → Norway → activate NOK → Save.
5. Meta: skapa sidan **TankGuard** i Business Manager → Page ID till Claude.
6. Discord: skapa servern **TankGuard** → auktorisera boten → "Store ready: TankGuard".

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
