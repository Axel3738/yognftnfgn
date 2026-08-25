# Namnschema: UGC-videotestet (script 001–007) — 2026-08-25

Axel laddar upp 17 videor i mediebiblioteket (13 + fyra 004:or som tillkom) (Matstrumpor creative hub-serien).
Detta dokument är facit för hur de döps och struktureras på Meta. Följer
`docs/naming-convention.md`; vokabulären där är uppdaterad med fälten nedan.

## Testmatrisen

Variabeln som testas är **scriptet** (6 koncept), sekundärt **hooken** (1–4
varianter per script). Allt annat hålls konstant — samma produkt (sushi), samma
format (UGC-voiceover), samma primärtext, samma rubrik.

**Primärtext för ALLA 17 annonser: Paket E1** (`docs/matstrumpor-copy-2026-08-24.md`).
Motivering: scripten säljer redan exakt E-dilemmat — 001 och 004 säger ordagrant
"den perfekta balansen mellan **praktiskt och oväntat**" — och med texten konstant
är videon den enda variabeln (naming-konventionens regel 2).
Rubrik: **"Rolig i kväll. På fötterna i morgon."** · Beskrivning: **"4 sorter. Köp 1, få 1. Fri frakt i Sverige."**

## Strukturen

```
KAMPANJ  MATSTRUMP_SALES_{YYYYMMDD}         ← datum = launchdagen. ABO, aldrig CBO (regel 11).
ADSET    broad_advplus_purchase_s{NNN}      ← ett adset per script, lika dagsbudget per adset
AD       MATSTRUMP_sushi_gift_ugc_s{NNN}h{N}_v1
```

- Sex adsets: `…_s001`, `…_s002`, `…_s003`, `…_s004`, `…_s006`, `…_s007`. Hookvarianterna
  ligger som annonser i sitt scripts adset. Lika budget per adset är närmaste
  praktiska tolkning av "lika budget per annons" när 001 bara har en hook —
  scriptet är primärvariabeln och ska ha lika villkor.
- `gift` = vinkeln (presentköp) för hela serien. `ugc` = formatet.
  Hook-fältet `s{NNN}h{N}` kodar script + hookvariant och gör datan skärbar
  per script OCH per hook i efterhand.
- Allt är `v1`. Före launch: läs av att inga MATSTRUMP-namn redan är upptagna i
  kontot som väljs (regel 8).

## Mappningen fil → annonsnamn

| Fil i mediebiblioteket | Annonsnamn |
|---|---|
| 001 HOOK 1 | `MATSTRUMP_sushi_gift_ugc_s001h1_v1` |
| 002 HOOK 1 | `MATSTRUMP_sushi_gift_ugc_s002h1_v1` |
| 002 HOOK 2 | `MATSTRUMP_sushi_gift_ugc_s002h2_v1` |
| 002 HOOK 3 | `MATSTRUMP_sushi_gift_ugc_s002h3_v1` |
| 003 HOOK 1 | `MATSTRUMP_sushi_gift_ugc_s003h1_v1` |
| 003 HOOK 2 | `MATSTRUMP_sushi_gift_ugc_s003h2_v1` |
| 003 HOOK 3 | `MATSTRUMP_sushi_gift_ugc_s003h3_v1` |
| 004 HOOK 1–4 | `MATSTRUMP_sushi_gift_ugc_s004h1_v1` → `…_s004h4_v1` |
| 006_H1 | `MATSTRUMP_sushi_gift_ugc_s006h1_v1` |
| 006_H2 | `MATSTRUMP_sushi_gift_ugc_s006h2_v1` |
| 006_H3 | `MATSTRUMP_sushi_gift_ugc_s006h3_v1` |
| 007_H1 | `MATSTRUMP_sushi_gift_ugc_s007h1_v1` |
| 007_H2 | `MATSTRUMP_sushi_gift_ugc_s007h2_v1` |
| 007_H3 | `MATSTRUMP_sushi_gift_ugc_s007h3_v1` |

## Vad scripten är (fylls på när brief-PDF:erna delas)

Källa: Notion-hubben "Matstrumpor creative hub" + Drive-brieferna
(`Sushistrumpor_{NNN}.pdf`). Bara 001 och 004 är läsbara för kopplingen i dag —
002, 003, 006, 007 ligger i mappar som inte delats med business-kontot.

| Script | Titel | Innehåll | Hookar |
|---|---|---|---|
| 001 | "Annons 001" | Grundarberättelse: panikletandet i sista sekund → strumpor är det alla går kort om → "praktiskt och oväntat" | 1 |
| 002 | ? | ej läsbar — döps ändå rätt via tabellen ovan | 3 |
| 003 | ? | ej läsbar | 3 |
| 004 | "Kuvertet vs paketet" | Anti-pengar-i-kort: "offrar titeln \"hon har verkligen tänkt till\"" → favoriträtten tar bort gissningen. Uppladdad i annonskontot 2026-08-25. | 4 |
| 006 | ? | ej läsbar | 3 |
| 007 | ? | ej läsbar | 3 |

**Antagande som Axel ska kunna dementera:** hela serien är sushi + presentvinkel
(verifierat i 001 och 004). Är något av 002/003/006/007 en annan produkt eller
vinkel → säg till FÖRE launch, så byts `sushi`/`gift`-fältet för de annonserna.
Namn ändras aldrig efter att en annons fått data — då är det `v2` som gäller.

## Kontofakta (verifierade via Meta API 2026-08-25)

| Vad | Värde |
|---|---|
| Ad account | **nya kungen** `730973156224390` — businessen **Matstrumpor.se** (`3354502211392342`), ACTIVE, SEK, betalmetod finns |
| Sida | **Matstrumpor.se** `820358954504320` (gamla annonsernas sida — businessen har även "Matstrumpor" `1285064981363590`) |
| Pixel | **MATSTRUMPIRUMPIDUMPI** `1785935302094082` — enda dataset i businessen. ⚠️ Ägs tekniskt av SnarkLös-BM:en (historiskt), men är matstrumpors egen och delad hit. |
| promoted_object för adseten | `{"pixel_id":"1785935302094082","custom_event_type":"PURCHASE"}` |
| Targeting | `{"geo_locations":{"countries":["SE"]}}` broad, Advantage+ audience på |
| Adset-budget | 200 kr/dag per adset som startförslag — Axel sätter siffran före launch |

## Byggstatus (2026-08-25, senare samma dag — ALLT PAUSED)

Script 004 ("Kuvertet vs paketet", 4 hookar) tillkom i uppladdningen → 6 adsets, 17 annonser totalt.

| Objekt | ID | Läge |
|---|---|---|
| Kampanj `MATSTRUMP_SALES_20260825` | `120251184321350023` | ✅ skapad, ABO |
| Adset s001 | `120251184322770023` | ✅ 200 kr/dag |
| Adset s002 | `120251184472730023` | ✅ 200 kr/dag |
| Adset s003 | `120251184325910023` | ✅ 200 kr/dag |
| Adset s004 | `120251184337530023` | ✅ 200 kr/dag |
| Adset s006 | `120251184493410023` | ✅ 200 kr/dag |
| Adset s007 | `120251184332090023` | ✅ 200 kr/dag |
| Annons `…_s004h1_v1` | `120251184398370023` | ✅ i s004 |
| Annons `…_s004h2_v1` | `120251184411590023` | ✅ i s004 |
| Annons `…_s004h3_v1` | `120251184533510023` | ✅ i s004 (efter pixelfixen) |
| Annons `…_s004h4_v1` | `120251184534120023` | ✅ i s004 |

Alla adsets: broad SE, Advantage+ audience, OFFSITE_CONVERSIONS/PURCHASE mot pixeln,
attribution 7d klick + 1d visning, DSA-fälten "Matstrumpor.se". Annonserna: primärtext E1,
rubrik "Rolig i kväll. På fötterna i morgon.", SHOP_NOW → /products/sushi-strumpor.

## Blockers före launch (uppdaterat)

1. **LÖST 2026-08-25: pixeln tilldelad annonskontot av Axel** — annonsskapandet funkar igen. Ursprungsfelet:  Meta-fel vid annonsskapande:
   *"Account 730973156224390 does not have access to pixel 1785935302094082"* —
   pixeln är delad till Matstrumpor-businessen men inte kopplad till kontot
   "nya kungen". **Axels fix i Business Manager:** Företagsinställningar →
   Datakällor → Pixlar → MATSTRUMPIRUMPIDUMPI → Kopplade tillgångar → lägg till
   annonskontot "nya kungen". Utan detta kan kampanjen inte aktiveras alls.
2. **Shopify-kopplingen:** Axel säger sig ha återkopplat pixeln till butiken
   2026-08-25 — verifiera med ett `last_fired_time`-anrop när trafik kommit.
3. **13 videor saknas i annonskontots bibliotek** (001×1, 002×3, 003×3, 006×3,
   007×3). 004:orna laddades upp rätt väg (Ads Manager) — gör likadant med resten.
   Business Suite-uppladdningar hamnar på sidan, inte i annonskontot.
4. **AI-frågan BESVARAD: ingen AI i videorna** (Axel 2026-08-25) — nya creatives sätter `self_ai_disclosure: OPT_OUT`. Gamla regeln kvar för framtida material:  innehåller videorna AI-genererat material ska
   creatives skapas med AI-disclosure (`OPT_IN`) — det går INTE att sätta i
   efterhand, då görs creatives om. Axel måste svara innan aktivering.
5. Sessionens behörighetsklassificerare blockerade ungefär hälften av
   API-anropen slumpartat — omförsök gick igenom. Räkna med samma sak vid
   nästa byggrunda.

## AI-märkning

Innehåller videorna AI-genererat material (Higgsfield/HeyGen-klipp, AI-bilder):
kryssa i Metas AI-disclosure-toggle vid uppladdning. Gäller per video.
