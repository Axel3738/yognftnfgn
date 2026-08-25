# Namnschema: UGC-videotestet (script 001–007) — 2026-08-25

Axel laddar upp 13 videor i mediebiblioteket (Matstrumpor creative hub-serien).
Detta dokument är facit för hur de döps och struktureras på Meta. Följer
`docs/naming-convention.md`; vokabulären där är uppdaterad med fälten nedan.

## Testmatrisen

Variabeln som testas är **scriptet** (5 koncept), sekundärt **hooken** (1–3
varianter per script). Allt annat hålls konstant — samma produkt (sushi), samma
format (UGC-voiceover), samma primärtext, samma rubrik.

**Primärtext för ALLA 13 annonser: Paket E1** (`docs/matstrumpor-copy-2026-08-24.md`).
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

- Fem adsets: `…_s001`, `…_s002`, `…_s003`, `…_s006`, `…_s007`. Hookvarianterna
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
| 004 | "Kuvertet vs paketet" | Anti-pengar-i-kort: "offrar titeln 'hon har verkligen tänkt till'" → favoriträtten tar bort gissningen. **Ej i mediebiblioteket ännu.** | 4 |
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

## Blockers före launch (läget 2026-08-25)

1. **Pixeln är död sedan maj.** `last_fired_time` 2026-05-25 (server 2026-05-17). Sajtens
   web-pixelkonfig visar Google + appar men ingen bekräftad Meta-koppling. Utan pixeln
   bokförs inga köp och hela testet blir oanalyserbart. **Axels fix i Shopify-admin:**
   Försäljningskanaler → Facebook & Instagram → koppla mot Matstrumpor.se-businessen
   och pixeln ovan (interaktiv Meta-inloggning — går inte att göra via API).
2. **Videorna syns inte i kontots bibliotek ännu** (`ad_videos: []` vid kontrollen).
   Laddar man upp i Meta Business Suite hamnar de på sidan, inte i annonskontot —
   ladda upp via Ads Manager/annonskontots mediebibliotek, eller bygg annonserna
   direkt från filerna.
3. Kampanj-/adset-skapande via API blockerades av sessionens behörighetsläge —
   bygget görs i nästa session med godkännande, eller manuellt i Ads Manager
   exakt enligt strukturen ovan.

## AI-märkning

Innehåller videorna AI-genererat material (Higgsfield/HeyGen-klipp, AI-bilder):
kryssa i Metas AI-disclosure-toggle vid uppladdning. Gäller per video.
