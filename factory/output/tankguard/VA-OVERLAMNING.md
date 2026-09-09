# TankGuard — ad review checklist (for the VA)

Both campaigns are built and **everything is PAUSED**. Nothing spends until
someone sets it live. Read this before you touch anything.

## What was built

| Campaign | Ads | Market | Landing page |
|---|--:|---|---|
| `TANKGUARD_SE_Tanköverdraget \| 2026-09-08` | 40 | Sweden | `https://tankguard.se/products/tankoverdraget` |
| `TANKGUARD_NO_Tanktrekket \| 2026-09-09` | 33 | Norway | `https://tankguard.se/nb/products/tankoverdraget` |

Both live in ad account **MagiBorsten DK `915422744950975`**, CBO,
1 000 kr/day, TankGuard's own page `1399193996606775` and TankGuard's own
pixel `2196132151319625`.

⚠️ This is **not** the MagiBorsten account that runs Bäverbutiken. The names
are almost identical; the accounts are different businesses. Check the ID.

## Your checks in Ads Manager

1. **Open the campaign.** Confirm the daily budget is 1 000 kr and the status
   is Paused.
2. **Open one ad in each ad set.** Click the link in the preview. It must land
   on **tankguard.se** — the Swedish ads on `/products/tankoverdraget`, the
   Norwegian ones on `/nb/products/tankoverdraget`. If any link goes to
   baverbutiken.se or beverbutikken.no, stop and report it.
3. **Check the page name on the ad.** It must say **TankGuard**, not
   Bäverbutiken.
4. **Check the pixel.** Ad set level → Conversion event. It must be
   TankGuard's pixel `2196132151319625`.
5. **Check the geo.** Swedish campaign = Sweden only. Norwegian campaign =
   Norway only.
6. **Watch three ads end to end** — one image, one video, one of the two that
   end on a product-page card. Nothing may say Bäverbutiken, show star
   ratings, quote a named customer, promise free shipping, Klarna or a 30-day
   return, or show a crossed-out price.

## What is NOT done, and must not be skipped

**Seventeen re-dubbed videos have not been listened to.**

The first version was rejected: the voice sped up and slowed down through the
film. The script had been packed several lines into one caption slot, and
HeyGen reads each slot in exactly that slot's time. All seventeen were rebuilt
with one line per slot and re-rendered in HeyGen's `quality` mode. Measured
pacing spread went from 2.16–10.29× down to 1.31–2.07×.

The measurement says the pacing is even. It says nothing about how the voice
sounds. These must be heard — hook, middle and end — before they go live:

- Swedish (9): `CS_1_H2`, `CS_1_H3`, `CS_4_H1`, `GT_1_H1`, `GT_1_H2`,
  `GT_1_H3`, `SP_1_H1`, `SP_1_H2`, `SP_1_H3`
- Norwegian (8): `CS_1_H2`, `CS_1_H3`, `GT_1_H1`, `GT_1_H2`, `GT_1_H3`,
  `SP_1_H1`, `SP_1_H2`, `SP_1_H3`

Six videos were left alone (`PD_1_H1/H2/H3` in both markets, plus Swedish
`SP_3_H1`): their pacing matches the source footage, so there was nothing to
fix.

**`TankGuard_PD_Extra` has no voiceover at all** — that is not a defect. It is
pure product footage: hands working the zip, the fabric, the cover on the tank.
HeyGen's transcription returns `No speaker is detected in the video`, and OCR
finds no burned-in text. The source ad earned ROAS 4.62 exactly like this. It is
live.

**Norwegian ads carry no price.** That is deliberate — the store has no NOK
price set, and inventing one is not allowed. The price is on the `/nb` page.

## Setting it live

**You set the campaign ACTIVE when your review is green** — and only after the
seventeen videos above have been heard. If anything on the list fails, report it
instead of fixing it in Ads Manager: the fix belongs in the build, so the next
store inherits it.
