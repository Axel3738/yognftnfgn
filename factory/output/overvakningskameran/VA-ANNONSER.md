# HeimGuard — ad review checklist (Swedish campaign)

**Do not start this list yet.** It is blocked on one thing Axel has to do first
(see "Blocked on" at the bottom). Once he confirms it is done, run the two
commands below, then work through the checklist.

---

## What was built

| | |
|---|---|
| Ad account | **Magiborsten DK** `915422744950975` (this is the shared OPS account — it says DK but it carries every OPS store, and its currency is SEK) |
| Campaign | `HEIMGUARD_SE_Övervakningskameran \| BE-ROAS 2,11 \| 2026-09-08` |
| Budget | 1 000 SEK/day, campaign-level (CBO) |
| Ad sets | 9, one per concept: SP, CS, PD, LI, CO, BOF, AU, G, RI |
| Ads | 38 — 23 video, 15 image |
| Page | HeimGuard `1262406533629248` |
| Pixel | HeimGuard `1125401473242596` |
| Landing page | https://heimguard.se/products/overvakningskameran |
| Status | **everything PAUSED** — you set it live |

These are Bäverbutiken's own proven creatives for the same camera, re-branded
for HeimGuard. The source campaign spent 23 798 SEK and made 60 purchases.

## Finish the build (run these two)

```bash
cd pipeline
node no-video-launch.mjs waves/se-heimguard-video.config.mjs
node no-image-launch.mjs waves/se-heimguard-image.config.mjs --imgdir=../.scratch/heimguard/se/bild
cd .. && node factory/kampanjkoll.mjs pipeline/waves/se-heimguard-video.config.mjs pipeline/waves/se-heimguard-image.config.mjs
```

The last command must print **9 ad sets and 38 ads**, all PAUSED. If it does
not, stop and say so — do not set anything live on a partial build.

## Your review — check all six, in Ads Manager

1. **Right account.** Top left says **Magiborsten DK**. Not MagiBorsten.
   The two names look almost identical and they are different businesses.
2. **The link.** Open any ad → click the link. It must land on
   **heimguard.se**, on the camera product page. If it lands on
   baverbutiken.se, stop.
3. **The pixel.** Ad set → Conversion → the dataset must read **HeimGuard**.
   Not Bäverbutiken.se, not TankGuard. All three exist in this account.
4. **The page.** Every ad must post as **HeimGuard**.
5. **The budget.** Campaign level, **1 000 SEK per day**. No ad set has its own budget.
6. **The price in the ads.** They say **799 kr** (was 1 000 kr). That matches
   the product page. If any ad shows a different number, stop.

## Then

Set the campaign live: campaign → toggle ON → then the 9 ad sets → then the ads.
Meta pauses things again when you change a budget or structure, so after
switching on, refresh and confirm all three levels really are Active.

## Two things that were deliberately left out

- **`HeimGuard_SP_4_H1` and `HeimGuard_RI_1_H1` are not in the campaign.**
  Both have "BAVERBUTIKEN" burned into the end card of the video. They are not
  uploaded until that text is replaced. Do not add them by hand.
- **There is no Norwegian campaign.** The Norwegian source ads are priced in
  NOK (899 / 1 169) but heimguard.se/nb still charges in SEK (799). Running
  them would promise the customer a price the shop does not have.

## Blocked on

Axel has to give the **HeimGuard** page to the **Magiborsten DK** ad account in
Business Manager, and make himself an advertiser/admin on that page. Until then
Meta refuses to create the ads: *"The page you selected for your ad is not
available, or you may not have permission to see this page."*
