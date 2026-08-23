# AU-listiclesen (GemPages) — inventering 2026-08-23

Källa: agentinventering av temat `bbq-clinic-au-v2` (198851854719), read-only.
Arbetskopior av mallar/sektioner låg i sandboxens scratchpad och är EJ beständiga —
kör om inventeringen mot temat om de behövs igen.

---

INVENTORY OF GEMPAGES LISTICLES — theme `gid://shopify/OnlineStoreTheme/198851854719` ("bbq-clinic-au-v2 (engelska handles)", role UNPUBLISHED) on xr15w4-cz.myshopify.com. Read-only; nothing was written.

Local working copies (all files pulled to disk, nothing downloaded from CDNs):
- `/tmp/claude-0/-home-user-yognftnfgn/20b5f417-371b-59fe-8a40-bf214a8c96cd/scratchpad/tpl/` — 36 template JSONs
- `/tmp/claude-0/-home-user-yognftnfgn/20b5f417-371b-59fe-8a40-bf214a8c96cd/scratchpad/sec/` — 249 gp-section liquid files
- derived data: `map.json`, `report.json`, `detail.json`, `workload.json` in the same directory

=====================================================================
0. HEADLINE CORRECTIONS TO THE BRIEF
=====================================================================
- There are **36** `templates/page.gp-template-*.json`, not 19. 19 of them are multi-section (10–13 sections); 17 are single-section.
- There are **249** `sections/gp-section-*.liquid` (not 251). 244 are referenced by a template; **5 are orphans**.
- No section file is shared between two templates. Every template owns its own private clone of the section set — that is why the byte count is 9.6 MB for 36 pages.
- Confirmed dormant: `pages(first:50)` returns 6 pages, all with `templateSuffix: null`. No page uses any gp-template.
- Two extra GemPages files live in `snippets/`, not `sections/`: `snippets/gp-section-617120907516707819-0.liquid` (48,336 B) and `snippets/gp-section-626843926958965613-0.liquid` (21,283 B), rendered via `{% render 'gp-section-…-0' %}`.

Orphan sections (referenced by no template — dead weight, do not translate):
```
gp-section-617120906644292289.liquid   33,575 B
gp-section-617120906694624196.liquid   15,232 B
gp-section-617120906946282436.liquid   92,013 B
gp-section-617120907265049579.liquid   49,830 B
gp-section-617120907516707819.liquid  190,664 B   (its -0 snippet IS in snippets/)
```

=====================================================================
1. TEMPLATE MAP
=====================================================================
Sizes: template = UTF-8 bytes on disk; "section bytes" = sum of the liquid files it references. (Shopify's `size` field runs ~0.5–1% below the UTF-8 byte count on these files — e.g. API reports 17,217 for 617120899732079297 where the file is 17,338 UTF-8 bytes / 17,165 chars. I use disk bytes throughout for consistency.)

FAMILY A — multi-section GemPages listicles (19 templates)

| template id | tpl B | #sec | section B |
|---|---|---|---|
| 617120899732079297 | 17,338 | 12 | 469,791 |
| 619570877842850609 | 16,420 | 12 | 482,723 |
| 620302509063275167 | 16,811 | 12 | 487,961 |
| 620338208445563879 | 18,438 | 12 | 489,561 |
| 620621395537167335 | 16,813 | 12 | 487,956 |
| 621065327702180511 | 19,029 | 12 | 490,145 |
| 621092885420311199 | 19,001 | 12 | 490,128 |
| 621105591560963018 | 18,618 | 12 | 489,511 |
| 621645129530213322 | 18,307 | 12 | 489,423 |
| 621654614126625379 | 18,080 | 12 | 489,196 |
| 623149626727334680 | 17,623 | 12 | 488,734 |
| 623151464151253784 | 19,865 | 12 | 490,976 |
| 623152569501352481 | 19,372 | 12 | 490,481 |
| 623154757267096097 | 15,975 | 12 | 487,082 |
| 623155472295265048 | 21,251 | 13 | 507,657 |
| 624267177721070326 | 14,182 | 10 | 261,467 |
| 631303000391942918 | 18,517 | 12 | 487,298 |
| 632042898082235049 | 21,303 | 12 | 490,142 |
| 632042913248838594 | 21,586 | 12 | 490,503 |

FAMILY B — single-section templates (17 templates)

| template id | tpl B | section file | section B |
|---|---|---|---|
| 625316677424251479 | 730 | gp-section-625316722252972715 | 20,135 |
| 626525148932997803 | 730 | gp-section-626525186044199723 | 19,503 |
| 626527357989028523 | 730 | gp-section-626527389899293271 | 19,746 |
| 626528971370005079 | 730 | gp-section-626529022355964715 | 18,395 |
| 626533702947570475 | 730 | gp-section-626533740192990061 | 19,134 |
| 626548743788823405 | 730 | gp-section-626549168369828717 | 17,824 |
| 626560724130333271 | 730 | gp-section-626560764026553197 | 18,541 |
| 626569055058264875 | 730 | gp-section-626569097521398359 | 18,028 |
| 626633374324228695 | 730 | gp-section-626633468461187949 | 18,122 |
| 626637778225988183 | 730 | gp-section-626637835100750701 | 17,925 |
| 626641406886150955 | 730 | gp-section-626641446698484589 | 18,126 |
| 626645945156633387 | 730 | gp-section-626645987821093547 | 18,083 |
| 626648399864660651 | 730 | gp-section-626648437143634519 | 18,269 |
| 626843056439558743 | 730 | gp-section-626843195019363181 | 28,313 |
| 626843875956228779 | 1,267 | gp-section-626843926958965613 | 221,597 |
| 626984950364635947 | 730 | gp-section-626984986771194539 | 43,415 |
| 627712796158591588 | 730 | gp-section-627713009917100644 | 22,215 |

TOTALS: 36 templates = 361,476 B; referenced sections = 9,618,106 B; all 249 sections on disk = 9,999,420 B.

Family A section-id lists are in `map.json` (`secs` key). Representative example (617120899732079297, in render order): 617120906543629291 (12,999) · 617120906795287531 (38,249) · 617120906476520427 (29,559) · 617120906946282475 (24,050) · 617120906493297312 (34,808) · 617120906661069472 (24,220) · 617120906946282177 (29,270) · 617167825118692292 (34,119) · 617165642419667947 (168,390 — reviews) · 617120906761732768 (34,244) · 617120906677846721 (12,297) · 617120906711401412 (27,586 — footer/legal).

Every Family A template contains the same skeleton: one ~168 KB reviews carousel, one ~40–42 KB hero, one ~38 KB block, ~12 KB preload stub, and a ~27 KB footer/legal block. 623155472 has a 13th section (`gp-section-623205773912048632`, 5,665 B). 624267177 uses a foreign-prefix section `gp-section-624271646215111414` (32,146 B).

=====================================================================
2. IDENTIFY EACH LISTICLE
=====================================================================
All copy is Swedish. Layout `theme.gempages.footer` (Family A) / `theme.gempages.blank` (Family B). Product column = what the CTA links to.

FAMILY A — byline is consistently "Av Anders Johansson. Senast uppdaterad <date>". All Family A CTAs point at the relative handle `/products/the-master-electric-bbq-brush`.

1. **617120899732079297** — H1: "5 ANLEDNINGAR TILL VARFÖR TUSENTALS SVENSKA PAPPOR HAR BYTT UT SINA VANLIGA STÅLBORSTAR". Sub: "Weber återkallade 3,2 miljoner grillborstar i februari. Din ligger förmodligen fortfarande vid grillen." CTA "Läs innan du tänder grillen i år". Body opens "De hittade ett borststrå i maten — Det finns ingen varning på förpackningen. Ingen skylt hos Jula…"
 SV: *Borststrå-skräck / Weber-återkallelsen* · EN: **Wire-Bristle Scare — Weber Recall** · sells the-master-electric-bbq-brush
2. **619570877842850609** — "5 ANLEDNINGAR TILL VARFÖR VARANNAN GRILLARE HAR SLUTAT SKRUBBA FÖR HAND". "Varannan grillare rengör gallret bara fyra gånger per säsong…"
 SV: *Slutat skrubba för hand* · EN: **Half of Grillers Stopped Hand-Scrubbing** · the-master-electric-bbq-brush
3. **620302509063275167** — near-identical variant of #2 (same hero, tightened subheads: "DU SKJUTER UPP DET — OCH GRILLAR ÄNDÅ").
 SV: *Slutat skrubba (variant B)* · EN: **Stopped Hand-Scrubbing (Variant B)** · the-master-electric-bbq-brush
4. **620338208445563879** — "5 saker min farfar lärde mig om grillar — som ingen annars pratar om". "Han öppnade tusentals grillar under sin karriär…"
 SV: *Farfars fem lärdomar* · EN: **Five Things My Grandfather Taught Me** · the-master-electric-bbq-brush
5. **620621395537167335** — "5 ANLEDNINGAR TILL VARFÖR HAN SLUTADE SKYLLA PÅ KÖTTET OCH BÖRJADE TITTA PÅ GALLRET." "Hans dotter ställde en fråga han aldrig ställt sig själv."
 SV: *Dotterns fråga* · EN: **He Stopped Blaming the Meat** · the-master-electric-bbq-brush
6. **621065327702180511** — "5 ANLEDNINGAR TILL VARFÖR DITT GALLER FÖRGIFTAR MATEN DU SERVERAR DIN FAMILJ". "Nationella Cancerinstitutet klassar ämnena som sannolikt cancerframkallande."
 SV: *Gallret förgiftar maten (PAH/HCA)* · EN: **Your Grate Is Poisoning Your Family's Food** · the-master-electric-bbq-brush
7. **621092885420311199** — "5 ANLEDNINGAR TILL VARFÖR DITT KÖTT ALDRIG SMAKAR SOM DET BORDE — OAVSETT VAD DU GÖR".
 SV: *Köttet smakar aldrig rätt* · EN: **Why Your Meat Never Tastes Right** · the-master-electric-bbq-brush
8. **621105591560963018** — "5 ANLEDNINGAR TILL VARFÖR DIN GRILL LÅNGSAMT FÖRSTÖRS — OCH VAD DU GÖR ÅT DET". "Din Napoleon ska hålla i 15 år. Med ett smutsigt galler håller den kanske 7."
 SV: *Grillen förstörs långsamt* · EN: **Your BBQ Is Slowly Dying** · the-master-electric-bbq-brush
9. **621645129530213322** — "5 anledningar till varför ditt kött aldrig smakar som på restaurang…".
 SV: *Inte som på restaurang* · EN: **Never Tastes Like a Restaurant** · the-master-electric-bbq-brush
10. **621654614126625379** — "5 saker en kock med 30 års erfarenhet kollar på din grill — innan han ens pratar om köttet".
 SV: *Kockens checklista* · EN: **What a 30-Year Chef Checks First** · the-master-electric-bbq-brush
11. **623149626727334680** — "5 ANLEDNINGAR TILL VARFÖR GRANNEN ALLTID FÅR REAKTIONEN DU VÄNTAT PÅ". "Samma grill. Samma kött. Samma slaktare."
 SV: *Grannens hemlighet* · EN: **Why the Neighbour Always Wins** · the-master-electric-bbq-brush
12. **623151464151253784** — "5 ANLEDNINGAR TILL VARFÖR PAPPAS GRILL FÖRTJÄNAR BÄTTRE ÄN DU GER DEN". "Han höll den skinande i tjugo år. Du ärvde den för tre säsonger sedan."
 SV: *Pappas ärvda grill* · EN: **Dad's BBQ Deserves Better** · the-master-electric-bbq-brush
13. **623152569501352481** — "5 ANLEDNINGAR TILL VARFÖR DU ALDRIG RENGJORT GALLRET ORDENTLIGT — OCH VARFÖR DET INTE ÄR DITT FEL".
 SV: *Det är inte ditt fel* · EN: **It Was Never Your Fault** · the-master-electric-bbq-brush
14. **623154757267096097** — "JAG SKRUBBADE I SJU ÅR OCH GALLRET VAR FORTFARANDE SMUTSIGT". First-person confession format.
 SV: *Sju år av skrubbande* · EN: **I Scrubbed for Seven Years** · the-master-electric-bbq-brush
15. **623155472295265048** — "JAG TESTADE GRILLKLINIKENS MASTER I 30 DAGAR — HÄR ÄR DEN ÄRLIGA GENOMGÅNGEN". Day-by-day diary (DAG 1, DAG 3–7…). This is the long-form **product review**.
 SV: *30 dagars test av Mastern* · EN: **I Tested The Master for 30 Days** · the-master-electric-bbq-brush
16. **624267177721070326** — "5 misstag som gör att dina grillade grönsaker aldrig blir riktigt goda (nr 4 gör nästan alla)". Subheads: "Du litar på aluminiumfolien", "Du grillar grönsakerna som om de vore kött".
 SV: *5 misstag med grillade grönsaker* · EN: **5 Mistakes with Grilled Vegetables** · **sells a DIFFERENT product**: absolute link `https://grillkliniken.se/products/roterande-grillkorg-i-rostfritt-stal-perfekt-for-gronsaker-kott-tillbehor?_pos=1&_psq=grea&_ss=e&_v=1.0` (rotating stainless grill basket)
17. **631303000391942918** — "5 ANLEDNINGAR TILL VARFÖR DIN GRILL DÖR I VINTER — OCH VARFÖR SKADAN AVGÖRS I SEPTEMBER". Seasonal (winter-storage) angle.
 SV: *Grillen dör i vinter* · EN: **Your BBQ Dies Over Winter** · the-master-electric-bbq-brush · NOTE: northern-hemisphere seasonality — wrong for AU
18. **632042898082235049** — "5 ANLEDNINGAR TILL VARFÖR DIN GRILL INTE HÅLLER DE FEMTON ÅR DEN SKA".
 SV: *Femton år eller sju* · EN: **Why Your BBQ Won't Last 15 Years** · the-master-electric-bbq-brush
19. **632042913248838594** — "5 ANLEDNINGAR TILL VARFÖR DIN NYA GRILLS LIVSLÄNGD — SJU ÅR ELLER FEMTON — AVGÖRS DEN HÄR SOMMAREN". New-BBQ-owner angle.
 SV: *Nya grillens livslängd* · EN: **Your New BBQ's Lifespan Is Decided This Summer** · the-master-electric-bbq-brush

FAMILY B — single-section pages. Byline "Av Jonny från Grillkliniken · Senast uppdaterad: 1 juli 2026" on most; sticky sale bar at top. **All CTAs are absolute** to `https://grillkliniken.se/products/elektrisk-grillborste` (8 per page).

20. **625316677424251479** — bar "✨ LAGERRENSNING ✨ / 40 % RABATT + FRI FRAKT & EXTRA TILLBEHÖR" with a TIM/MIN/SEK countdown. H1: "Vi beställde för många Grillklinikens Master Kit — och nu får du 40 % rabatt så länge lagret räcker". Dated 23 juni 2026.
 SV: *Lagerrensning 40 %* · EN: **Overstock Clearance — 40% Off** · elektrisk-grillborste (+ a relative `/products/master`)
21. **626525148932997803** — "Därför smakar din grillmat bränt och beskt — och det är inte köttets fel". SV: *Bränd bismak* · EN: **Why Your BBQ Food Tastes Burnt and Bitter** · elektrisk-grillborste
22. **626527357989028523** — "Det osynliga metallstrået som kan ligga på ditt grillgaller just nu — och hamna i familjens mat". SV: *Det osynliga metallstrået* · EN: **The Invisible Wire Bristle** · elektrisk-grillborste
23. **626528971370005079** — "Jag var säker på att elektriska grillborstar var en gimmick — tills jag körde den mot min stålborste på samma galler". Head-to-head test. SV: *Gimmick-testet* · EN: **I Thought It Was a Gimmick — Head-to-Head Test** · elektrisk-grillborste
24. **626533702947570475** — "Vi testade alla typer av grillborstar på tre kriterier — bara en klarade alla". Comparison page. SV: *Borstjämförelsen* · EN: **We Tested Every Brush Type** · elektrisk-grillborste
25. **626548743788823405** — "\"Grillar du flera gånger i veckan utan att rengöra gallret ordentligt? Då behöver vi prata.\"" (note: its sale bar has stripped diacritics — "ARETS STORSTA REA … PA KOPET"). SV: *Vi behöver prata* · EN: **We Need to Talk About Your Grate** · elektrisk-grillborste
26. **626560724130333271** — "Du skrubbar inte fel — du skrubbar med fel verktyg". SV: *Fel verktyg, inte fel teknik* · EN: **Wrong Tool, Not Wrong Technique** · elektrisk-grillborste
27. **626569055058264875** — "5 anledningar att INTE köpa Grillklinikens Master" (reverse-psychology). SV: *5 skäl att INTE köpa* · EN: **5 Reasons NOT to Buy** · elektrisk-grillborste
28. **626633374324228695** — "Verktyget jag önskar att någon hade tipsat mig om för tre somrar sedan". SV: *Tipset jag önskar jag fått* · EN: **The Tool I Wish Someone Told Me About** · elektrisk-grillborste
29. **626637778225988183** — "Gästerna är fem minuter bort — och gallret ser ut som förra sommaren". SV: *Fem minuter till gästerna* · EN: **Guests Are Five Minutes Away** · elektrisk-grillborste
30. **626641406886150955** — "Grillen du fick lära dig på förtjänar bättre än du ger den". SV: *Arvegrillen* · EN: **The BBQ You Learned On** · elektrisk-grillborste
31. **626645945156633387** — "3 skäl att tusentals grillare slängt stålborsten — vilket är ditt?". SV: *3 skäl att slänga stålborsten* · EN: **3 Reasons Grillers Binned the Wire Brush** · elektrisk-grillborste
32. **626648399864660651** — "Presenten till grillaren som redan har allt…". Gift-guide angle. SV: *Presenten till grillaren* · EN: **The Gift for the Griller Who Has Everything** · elektrisk-grillborste
33. **626843056439558743** — masthead "GRILL GUIDEN · Test & Omdöme · Grilltillbehör". H1: "Sladdlös elektrisk grillborste: kraftskrubbning vs. ren armkraft". Editorial review with "Ögonblicksbilden / Vad köparna faktiskt säger" sections, price "999 kr". SV: *Grillguiden — test & omdöme* · EN: **BBQ Guide — Cordless Electric Brush Review** · links to `elektrisk-grillborste` (abs) AND relative `/products/mastern-risten-skinner-olet-er-kaldt` (a Norwegian/Danish handle)
34. **626843875956228779** — **not a listicle**. No `<h1>`. Renders "Product not found / Quantity / Add to cart / Out of stock" — this is the GemPages **product/funnel buy-box section** (`pageType":"GP_FUNNEL_PAGE"`), 221 KB, wired to `all_products['the-master-electric-bbq-brush']`. Mostly English UI strings. SV: *Produktblock (funnel)* · EN: **Product Buy-Box Block**
35. **626984950364635947** — "Sladdlös elektrisk grillborste: Kraftskrubbning vs. ren armkraft" with a sticky nav (Testet / Säkerhet / Omdömen / FAQ), "Spec-bladet", "Verifierade omdömen", "4,6/5 · 1 200+ nöjda grillare", prices "999 kr" and "1 665 kr". SV: *Officiell köpguide 2026* · EN: **Official Buyer's Guide 2026** · elektrisk-grillborste + `/products/mastern-risten-skinner-olet-er-kaldt`
36. **627712796158591588** — bar "Lagerrensning 2026 · 40 % rabatt · 🛡 Livstidsgaranti". H1: "Använder du fortfarande en stålborste 2026? Här är 5 skäl att byta idag". SV: *Fortfarande stålborste 2026?* · EN: **Still Using a Wire Brush in 2026?** · elektrisk-grillborste

Product summary — of the five product handles referenced, **only `the-master-electric-bbq-brush` exists in the AU store** (`gid://shopify/Product/15844621681023`, "The Master — Grates Gleaming. Beer Cold.", ACTIVE, one variant `gid://shopify/ProductVariant/58193663951231`, AUD 179.95). `elektrisk-grillborste`, `master`, `roterande-grillkorg-i-rostfritt-stal-perfekt-for-gronsaker-kott-tillbehor` and `mastern-risten-skinner-olet-er-kaldt` all return **null** on `productByIdentifier` — every Family B page's CTA and both review pages' secondary links are dead for AU.

=====================================================================
3. TRANSLATION WORKLOAD
=====================================================================
Two structurally different jobs. Counts below: "settings strings" = distinct `*_text` / `*_label` setting values carrying copy; "hardcoded nodes" = HTML text nodes written directly into the liquid body; "words" = visible words after stripping HTML/Liquid/CSS/SVG.

| template | settings strings | words in settings | hardcoded nodes | words hardcoded | total words |
|---|---|---|---|---|---|
| 617120899732079297 | 43 | 694 | 1 | 1 | 695 |
| 619570877842850609 | 43 | 673 | 1 | 1 | 674 |
| 620302509063275167 | 44 | 713 | 1 | 1 | 714 |
| 620338208445563879 | 44 | 943 | 1 | 1 | 944 |
| 620621395537167335 | 44 | 718 | 1 | 1 | 719 |
| 621065327702180511 | 44 | 1,064 | 1 | 1 | 1,065 |
| 621092885420311199 | 44 | 1,072 | 1 | 1 | 1,073 |
| 621105591560963018 | 44 | 1,022 | 1 | 1 | 1,023 |
| 621645129530213322 | 44 | 931 | 1 | 1 | 932 |
| 621654614126625379 | 44 | 914 | 1 | 1 | 915 |
| 623149626727334680 | 44 | 856 | 1 | 1 | 857 |
| 623151464151253784 | 44 | 1,174 | 1 | 1 | 1,175 |
| 623152569501352481 | 44 | 1,128 | 1 | 1 | 1,129 |
| 623154757267096097 | 44 | 590 | 1 | 1 | 591 |
| 623155472295265048 | 51 | 1,310 | 1 | 1 | 1,311 |
| 624267177721070326 | 25 | 1,094 | 1 | 1 | 1,095 |
| 631303000391942918 | 44 | 994 | 1 | 1 | 995 |
| 632042898082235049 | 44 | 1,090 | 1 | 1 | 1,091 |
| 632042913248838594 | 44 | 1,029 | 1 | 1 | 1,030 |
| 625316677424251479 | 0 | 0 | 47 | 710 | 710 |
| 626525148932997803 | 0 | 0 | 41 | 710 | 710 |
| 626527357989028523 | 0 | 0 | 41 | 725 | 725 |
| 626528971370005079 | 0 | 0 | 41 | 674 | 674 |
| 626533702947570475 | 0 | 0 | 49 | 631 | 631 |
| 626548743788823405 | 0 | 0 | 41 | 679 | 679 |
| 626560724130333271 | 0 | 0 | 41 | 677 | 677 |
| 626569055058264875 | 0 | 0 | 41 | 624 | 624 |
| 626633374324228695 | 0 | 0 | 41 | 651 | 651 |
| 626637778225988183 | 0 | 0 | 41 | 612 | 612 |
| 626641406886150955 | 0 | 0 | 41 | 638 | 638 |
| 626645945156633387 | 0 | 0 | 42 | 661 | 661 |
| 626648399864660651 | 0 | 0 | 41 | 626 | 626 |
| 626843056439558743 | 0 | 0 | 122 | 1,082 | 1,082 |
| 626843875956228779 | 9 | 31 | 2 | 427 | 436 |
| 626984950364635947 | 0 | 0 | 173 | 1,227 | 1,227 |
| 627712796158591588 | 0 | 0 | 63 | 1,033 | 1,033 |

**GRAND TOTAL: 831 settings strings + 927 hardcoded text nodes = 1,758 translatable units; ≈30,424 visible words.**

Multiply the settings-string figure by **2** for the edit count, because every value is duplicated (see §5a): 831 settings strings exist twice — once as a `default` in the section liquid, once as an override in the template JSON. Total *edits* if you translate in place: **831 × 2 + 927 = 2,589 string edits across 36 template JSONs and 244 liquid files.**

Word volume is small — 30k words is roughly one long report, i.e. 1–3 translation agents would suffice on volume alone. The cost driver is not words, it is the **244 files / 2,589 edit sites / 9.6 MB** of surrounding machine-generated markup. A sane split is by template (36 units of ~850 words each), because sections are not shared and templates are therefore independently parallelisable with zero merge conflicts.

Also note the heavy near-duplication in Family A: 15 of the 19 share the same reviews block (`168,368–168,390 B`, 7 fixed reviewers, ~23 `_text` settings) and the same footer/legal block. Translating those two blocks once and reusing the output across 18 templates cuts real translation effort by roughly 35–40%.

=====================================================================
4. WHAT ELSE IS SWEDISH BEYOND PROSE
=====================================================================

**a) Hardcoded absolute links to https://grillkliniken.se**
- Family A (19 templates): **0** absolute `https://grillkliniken.se` product links, except **624267177721070326 which has 4** (`https://grillkliniken.se/products/roterande-grillkorg-i-rostfritt-stal-perfekt-for-gronsaker-kott-tillbehor?_pos=1&_psq=grea&_ss=e&_v=1.0`). All other Family A CTAs use the safe relative form `/products/the-master-electric-bbq-brush`.
- Family A also carries **1 `mailto:kundsupport@grillkliniken.se` per template** in the footer block (18 templates → 38 raw occurrences across the section files).
- Family B: **8 absolute links per template** to `https://grillkliniken.se/products/elektrisk-grillborste` in templates 625316677424251479, 626525148932997803, 626527357989028523, 626528971370005079, 626533702947570475, 626548743788823405, 626560724130333271, 626569055058264875, 626633374324228695, 626637778225988183, 626641406886150955, 626645945156633387, 626648399864660651. Plus **9** in 626984950364635947, **6** in 627712796158591588, **1** in 626843056439558743.
- Repo-wide raw count: `120 × grillkliniken.se/products/elektrisk-grillborste`, `4 × grillkliniken.se/products/roterande-grillkorg-…`, `78 ×` bare `grillkliniken.se` (mostly the mailto).
- Every one of these leaks an AU visitor to the Swedish storefront mid-funnel.

**b) Swedish collection handles** — **none.** `grep '/collections/'` over all 249 section files returns zero hits. Collections are not used by these pages at all.

**c) Swedish image filenames / burnt-in Swedish text.** 89 distinct media URLs, **all** on `https://cdn.shopify.com/s/files/1/0947/0174/8548/files/…`. That prefix is **not this store** — the AU store's CDN prefix is `1/0908/7769/0239` (verified against `files` and product media). So 100% of listicle imagery is hotlinked from the Swedish Grillkliniken store's Files. Filenames that indicate Swedish or Swedish-authored assets (not downloaded; burnt-in text inferred from the filename, and should be eyeballed before signoff):
```
…/Blev_mystiskt_sjuk_nu_varnar_Harriet_for_vanliga_grillverktyget_Tvingades_operera_bort_del_av_tunntarmen_Jag_hade_kunnat_fa_stomipase.png
…/Blev_mystiskt_sjuk_nu_varnar_Harriet_for_vanliga_grillverktyget_Tvingades_operera_bort_del_av_tunntarmen_Jag_hade_kunnat_fa_stomipase_1.png
        (a Swedish tabloid-style headline card — almost certainly burnt-in Swedish text)
…/Weber_erkanner_A_few_brush_hairs_may_fall_off_during_the_process.png          (used 1×)
…/Weber_erkanner_A_few_brush_hairs_may_fall_off_during_the_process_1.png        (used 6×)
…/Weber_erkanner_A_few_brush_hairs_may_fall_off_during_the_process_1.png?v=1777383995
        ("Weber erkänner" = "Weber admits" — Swedish caption over an English screenshot)
…/Fore.png                                (used 18×)  "Före" = "Before" — before/after label likely burnt in
…/Kopia_av_Fore.png?v=1783676009          (used 1×)
…/Lagg_till_en_rubrik_1.png               (used 18×)  Canva Swedish default "Lägg till en rubrik"
…/Lagg_till_en_rubrik_3.png               (used 18×)
…/Lagg_till_en_rubrik_4.png               (used 19×)
…/Kopia_av_Lagg_till_en_rubrik_3.png      (used 1×)
…/Skarmavbild_2026-06-24_kl._07.02.32.png?v=1782277377   (used 15×)  macOS Swedish screenshot
…/Skarmavbild_2026-06-24_kl._07.04.15.png?v=1782277481   (used 16×)
…/Skarmbild_2026-05-15_085739.png         (used 18×)  Windows Swedish screenshot
…/Namnlos_design_-_2026-06-16T172824.930.png · _-_2026-06-16T173122.968.png
…/Namnlos_design_-_2026-07-02T080249.408.png?v=1782972179
…/Namnlos_design_-_2026-08-04T060547.758.png · _-_2026-08-04T063116.503.png (3×)
…/Namnlos_design_-_2026-08-09T085711.891.png (2×)
…/Namnlos_design_53.png (+?v=1777366107) · _54.png · _74.png (9×, +?v=1779452096) · _75.png (2×, +?v=1779452216 3×) · _76.png
        ("Namnlös design" = Canva "Untitled design")
…/Bild_2026-06-24_kl._06.46.png?v=1782276462 (2×)
```
The remaining ~65 URLs have English/neutral filenames (`Grill_Brush.jpg`, `rusty-grill.webp`, `download_9.gif`, `e_4.gif`, `hf_2026…png`, `img_2001.webp`, etc.) but that says nothing about pixels — the before/after GIFs and the `Fore.png` pairing suggest at least the comparison graphics carry Swedish labels.

**d) Currency strings (kr / SEK / kronor).** No `money` filter is used for these — every price is a literal string in copy. Distinct literals across the section files: `999 kr` ×16, `99 kr` ×9, `12 000 kr` ×3, `13 000 kr`, `7 000 kr`, `69 kr` ×2, `1 665 kr`, the word `kronor` ×20, and the bare token `SEK` ×8 (7 of those are the countdown-timer "SEK" = seconds label in 625316677424251479, not currency — a real translation trap: "TIM / MIN / SEK" must become "HRS / MIN / SEC", not "AUD"). Per-template hits: 632042898082235049 (12 locale refs, 8× "kronor"), 617120899732079297 (18), 625316677424251479 (10). Full per-template breakdown is in `detail.json`.

**e) Swedish reviewer names.** One fixed cast of 7, appearing in the 168 KB reviews block of **18 templates** each: `- Tomas W.`, `- Rickard B.`, `- Peter N.`, `- Mikael T.`, `- Marcus A.`, `- Johan S.`, `- Christer F.` (each ×18 = 126 occurrences). Review bodies are Swedish and geographically Swedish ("Köpte en till stugan också", "Frun är nöjd att stålborsten försvann"). Rating header: "4.7 / 60 recensioner".

**f) Swedish dates.** One byline date per template, written as a Swedish literal string: `28 april 2026` (×4), `15 maj 2026` (×11), `3 Augusti 2026` (note the stray capital A), `4 juni 2026`, `3 juni 2026`, `23 juni 2026`, `1 juli 2026` (×12), `4 juli 2026` (×2).

**g) Other locale-bound content that isn't prose-generic.** Swedish retailers and authorities are named as proof points and will read as nonsense in AU: `Jula` ×8, `Biltema` ×6, `Konsumentverket` ×2 (the Swedish consumer agency), `Trustpilot` ×1. `Sverige` ×24, `svensk/svenska/svenskar` ×10 — including offer terms like "**Fri frakt inom Sverige**". Named Swedish towns in the narratives: Helsingborg, Örebro, Kilsbergen. Legal footer, hardcoded in the Family A footer block: `OBS: Detta är reklam. kundsupport@grillkliniken.se Org.nr: 5595762401 Grillkliniken drivs av Stonebite Ecom AB` — a Swedish company registration number and a Swedish support address on an AU page. Brand name `Grillkliniken/Grillklinikens` appears 2–6× per template in body copy (e.g. "Grillklinikens Master Kit").

=====================================================================
5. THE HAZARD LIST — confirmed / refuted with evidence
=====================================================================

**(a) Checksum — REFUTED as stated, and the reality is worse.**
The checksum is *not* confined to `.gempages` export files, and it is *not* an embedded JSON blob inside the section body. It is a **declared Shopify section setting whose value is stored in the template JSON.**

Evidence 1 — every section liquid declares it, with no default, inside `{% schema %}`:
```
{"type":"text","label":"Checksum","id":"checksum"}
```
Present in **249 of 249** section files (one occurrence each).

Evidence 2 — the value lives in `templates/page.gp-template-*.json`, one per section instance, **244 total**:
```
"gp_section_617120906677846721": {
  "settings": {
    "checksum": "f078bb3a268e3aa725a077a01fbb34c3f30ea6f518cb2976abbf4872176a8762_1_1_0_0__1",
    "ggXVwZhmAuK_text": "<p><i><strong>Inga borststrån. Ingen risk. Ingen anledning att vänta.</strong></i>…"
  },
  "type": "gp-section-617120906677846721"
}
```
Format is `<64-hex>_<n>_<n>_<n>_<n>__<n>` (e.g. `bcaa9879f441f83457971015f1bd27a21b45c19f6ccaf05b4147c690cc3d2740_1_1_1_0__1`).

Evidence 3 — it is **inert at render time**: `grep 'settings.checksum'` across all 249 section bodies returns **0** references. Nothing in the liquid reads it. It exists purely so GemPages can detect whether the theme copy still matches what its editor believes it published.

Consequence: editing text in place will *not* break rendering, but it *will* silently desynchronise every edited section from GemPages. If anyone later opens the page in the GemPages editor and saves, GemPages regenerates the section from its own server-side document and **your translations are overwritten**. There is no way to recompute a valid checksum outside GemPages.

**And a second, bigger duplication hazard the brief did not ask about:** every translatable value exists in **two** places. I compared all 1,529 setting values in the 36 template JSONs against the `default` in the corresponding section schema:
```
template value == schema default: 1529
                       differs:      0
       present in template only:      0
  present in schema default only:     0
```
Byte-identical, 100%. Shopify renders the *template JSON* value (it overrides the schema default), so translating only the liquid changes nothing visible; translating only the template JSON works until someone re-adds the section in the theme editor and picks up the Swedish default. Both must be edited, consistently, or you get a page that is English today and half-Swedish after any editor touch.

**(b) gp-data attributes — CONFIRMED, and partly not valid JSON.**
Every GemPages element carries a single-quoted `gp-data` attribute holding a JSON object. Counts: **1,213** attributes across the 249 sections (1,207 parse as strict JSON, 6 do not); 59–62 per Family A template, 1 per Family B template, 16 in the funnel section. Zero double-quoted `gp-data=` — all single-quoted, with `"` used inside.

Simple case:
```
<gp-row gp-data='{"background":{},"uid":"g7gpJ3k0Xa"}' data-id="g7gpJ3k0Xa" id="g7gpJ3k0Xa" …>
```
Content-bearing case (94 attributes carry `btnLink`, i.e. a CTA destination lives in the JSON, not just in `href`):
```
gp-data='{"btnLink": {"link": "/products/the-master-electric-bbq-brush", "selectedTab": "products", "target": "_self", "type": "open-page"}}'
```
And critically, **6 of them are Liquid-in-JSON and cannot be round-tripped through a JSON parser at all**:
```
gp-data='{"variantSelected": {{ variant | json | escape }}, "quantity": 1, "productUrl":{{ product.url | json | escape }}, "productHandle":{{ product.handle | …
gp-data='{"priceType":"regular","uid":"gkHF9ifjhv","locale":"{{shop.locale}}","currency":"{{shop.currency}}","moneyFormat":"{{ shop.money_format | replace: …
```
(all in `sections/gp-section-626843926958965613.liquid`). A naive "parse gp-data → mutate → `json.dumps` → write back" pass will corrupt those six and will also reflow quoting/escaping/key order on the other 1,207, producing a 9.6 MB diff for a 30k-word change.

Also inside `gp-data`: 111 `"storage":"FILE_CONTENT"` records with 129 `backupFileKey` entries whose values are GemPages storage keys, and image `src` values that are themselves Liquid:
```
"image": {"backupFileKey": "gempages_617120062062527169-eaa1885a-c570-4eec-a80d-19ba45d41bc8.jpeg", "height": 5712,
          "src": "{{ section.settings.ggN_Y62y1x6_background_desktop_image_src }}", "storage": "FILE_C…
```
Practical guidance: `gp-data` needs re-serialising **only if you edit it**. None of the Swedish *prose* lives inside `gp-data` — all copy is in `section.settings.*` (Family A) or in plain HTML text nodes (Family B). The 94 `btnLink.link` values do need changing for AU (they are the CTA destinations), and those should be changed by **targeted string replacement inside the attribute**, never by round-tripping the object.

**(c) Ties to the Swedish shop / GemPages account — CONFIRMED, four separate bindings.**

1. **Swedish Shopify admin handle, in all 249 sections.** Every section's `{% schema %}` opens with a paragraph setting containing a deep link into the *Swedish* store's admin:
```
{"type":"paragraph","content":"Section design by GemPages. [Click here to start design](https://admin.shopify.com/store/cw0mid-qw/apps/gempages-cro/app/shopify/edit?pageType=GP_STATIC&editorId=617120899732079297&sectionId=617120906677846721)"}
```
`cw0mid-qw` appears **249 times, once per section, with no exceptions** — this store is `xr15w4-cz`. The link also embeds the **GemPages page id** (`editorId`, always equal to the template id — 36 distinct values, one per template) and the **section id** (`sectionId`, 249 occurrences). These are cosmetic in the theme editor sidebar, but they are proof the sections were generated against the Swedish shop and they are the handle GemPages would use to reclaim/overwrite them.

2. **GemPages account/project id in asset keys.** `gempages_617120062062527169` appears **108 times** (and `gempages_432750572815254551` 5 times) as the prefix of `backupFileKey` values, e.g. `gempages_617120062062527169-eaa1885a-c570-4eec-a80d-19ba45d41bc8.jpeg`. These identify the Swedish GemPages workspace's file storage.

3. **Swedish CDN as the image origin.** Every one of the 89 media URLs is `cdn.shopify.com/s/files/1/0947/0174/8548/…`; this store's own files serve from `1/0908/7769/0239`. The images will still load (Shopify CDN is public), but they are hosted by, and can be deleted by, the Swedish store.

4. **The AU store is not connected to GemPages at all.** `shop.metafields(namespace:"GEMPAGES")` returns **an empty list**. `snippets/gp-head.liquid` — the file that would load `gp-global.css` and the GemPages runtime — is gated on those metafields *and is not rendered by any layout*: neither `layout/theme.liquid` nor `theme.gempages.blank/header/footer.liquid` contains `render 'gp-head'`. So `assets/gp-global.css` (69,647 B, present in the theme) is currently **never loaded**, and `shop.metafields.GEMPAGES['gp_style_css']` / `ASSETS_VERSION` resolve to empty. The sections do each carry their own inline `<style>` block and do load per-component runtime scripts directly (`https://assets.gemcommerce.com/assets-v2/gp-button-v7-5.js?v=` ×96, `gp-hero-banner-v2-v7-5.js` ×37, `gp-carousel-v7-5.js` ×18, etc. — with an empty `?v=` cache-buster), so they will mostly render, but the global stylesheet gap is unverified visually and needs a preview check before launch.

5. Not a Swedish tie but a translation-adjacent break: the funnel/buy-box section binds via `all_products['the-master-electric-bbq-brush']` — a handle that **does** exist in AU. No hardcoded Shopify variant IDs exist anywhere. (I initially flagged `50881763700742` etc.; on inspection those are `data-id` attributes on inline `<svg>` numeral icons, not variant IDs. `grep 'cart/add'` returns zero files.)

**(d) No `.gempages` export files exist in this theme.** A full listing of `assets/*` and `config/*` returns 20 files, none with a `.gempages` extension; a `*.gempages` glob returns nothing. `.gempages` is an app-side export artefact, not a theme file — so "round-tripping through export/import" means going through the GemPages app UI, not through theme files.

=====================================================================
6. RECOMMENDATION
=====================================================================
**Editing the theme's gp-section liquid + template JSON directly is the more reliable route for producing the AU versions, provided the GemPages editor is never opened on these pages afterwards. Round-tripping through GemPages export/import is not currently available on this store without first buying and connecting the app, and even then it does not solve the parts that actually block launch.**

The reasoning, from what is in the files:

*Why direct editing is tractable here.* The content is unusually well-separated for machine-generated markup. In Family A (19 templates, ~55% of the words) **100% of the copy sits in named `section.settings.*_text` values** — 831 strings, zero prose in the HTML body (the "hardcoded nodes: 1" column is a stray artefact, one word per template). You never have to touch the 9.6 MB of Tailwind classes, CSS custom properties, inline `<style>` blocks or `gp-data`. In Family B (17 templates) the copy is in plain HTML text nodes inside recognisable wrappers (`<h1 class="lst-h1">`, `<p>`, `<a class="lst-cta">`) — 927 nodes, all editable by string replacement. Nothing needs re-serialisation. The `gp-data` risk in §5b only materialises if you choose to parse-and-rewrite those attributes; you do not need to, because the 94 `btnLink.link` values can be fixed by literal substring replacement of the URL.

*Why the GemPages route is the weaker option today.* Three concrete blockers. (i) The AU shop has **no GEMPAGES metafields at all** — the app is not installed/connected here, so there is no editor to import into and no `.gempages` file anywhere in the theme to start from. (ii) The pages belong to a *different* GemPages workspace: every section's admin link points at `admin.shopify.com/store/cw0mid-qw`, and the asset keys carry `gempages_617120062062527169`. Getting these into an AU GemPages account means re-importing 36 pages into a new workspace, which regenerates section ids, checksums and file keys — i.e. you are not "round-tripping", you are rebuilding, and the diff is total. (iii) Import would produce fresh sections whose `checksum` GemPages owns, which is the one genuine advantage — but you pay for it by re-doing all the AU-specific rewiring inside a visual editor, by hand, 36 times.

*The decisive asymmetry.* The checksum problem is real but one-directional and cheap to contain: because nothing reads `section.settings.checksum` (0 references in 249 files), a stale checksum costs you nothing at render time. It only bites if someone opens GemPages and saves. Since GemPages is not connected to this store, that risk is currently **zero** and stays zero as long as the app is not installed. By contrast, the GemPages route's costs are immediate and unavoidable. So: direct editing, with a hard operational rule — *do not install/connect GemPages on xr15w4-cz for these pages*, and if it is ever installed, treat these 36 templates as app-managed and re-do them in the editor.

*What direct editing must cover, or it will ship broken.* Translation alone is not sufficient; these are the non-prose changes that have to happen in the same pass:
1. Both copies of every string — 831 template-JSON overrides **and** the 831 identical schema `default`s. Translating one and not the other is the single most likely failure mode.
2. 128 absolute `https://grillkliniken.se/...` CTA links → relative AU paths. 4 of the 5 target handles do not exist in this store; only `the-master-electric-bbq-brush` resolves. Someone has to decide the AU target for `elektrisk-grillborste`, `master`, the grill basket and `mastern-risten-skinner-olet-er-kaldt` before translation starts, or 17 of 36 pages ship with dead CTAs.
3. The 94 `gp-data` `btnLink.link` values, by substring replacement inside the attribute — never by JSON re-serialisation (6 attributes contain raw Liquid and will not survive a parser).
4. 38 `mailto:kundsupport@grillkliniken.se`, `Org.nr: 5595762401`, "Grillkliniken drivs av Stonebite Ecom AB", "Fri frakt inom Sverige", "30 dagars öppet köp" → AU equivalents. These are legal/offer statements, not copy; they need a human decision, not a translator.
5. Prices: 30+ literal `kr` / `kronor` strings → AUD, reconciled against the real AU price (179.95). Watch the countdown labels `TIM / MIN / SEK` — `SEK` there means *seconds*.
6. Swedish proof-point institutions (Jula ×8, Biltema ×6, Konsumentverket ×2), place names (Helsingborg, Örebro, Kilsbergen), 7 reviewer names ×18, and the `Sverige`/`svensk*` references — these need AU substitutes chosen up front and applied consistently, or 18 review blocks will disagree with each other.
7. Imagery: all 89 assets are hotlinked from the Swedish store's CDN (`1/0947/0174/8548`). At minimum re-upload to this store's Files; the `Fore.png`, `Weber_erkanner_*` and the `Blev_mystiskt_sjuk_...Harriet...` headline card need visual inspection and probably re-creation, since they appear to carry burnt-in Swedish.
8. Seasonality: 631303000391942918 ("din grill dör i vinter … skadan avgörs i september") is northern-hemisphere. It needs rewriting, not translating.
9. Before launch, preview one page of each family — `gp-global.css` is currently not loaded by any layout, and that has not been visually verified.

Two efficiencies worth taking: shard the work by template (36 independent units, no shared section files, no merge conflicts), and translate the shared reviews block and footer/legal block **once** and propagate — they are byte-identical across 18 templates and account for roughly 35–40% of the raw string count.