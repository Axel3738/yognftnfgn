// VA:ns checklista — de manuella klicken som varje ny OPS-butik kräver.
//
// Mallen är Axels egen (2026-09-07, omgjord 2026-09-08 i tre beslut:
// butiken + appen + kopplingen FÖRST, sen bygger /ny-ops allt; en app per
// butik eftersom custom distribution låses till EN butik utanför Plus;
// nycklarna läggs i miljön av VA:n, aldrig i chatten). På ENGELSKA — den
// som klickar är VA:n i Manila, inte Axel. Master-mallen med tomma fält
// ligger i factory/VA-CHECKLIST.md; den här modulen fyller i butikens
// värden och skriver output/<id>/CHECKLISTA.md efter varje bygge.
// ⚠️ VA:ns master är Google-dokumentet (länk i VA-CHECKLIST.md) — varje
// ändring här ska föras in i dokumentet i samma session.
//
// Håll varje rad till ETT handgrepp. Uppdatera listan när ett steg
// automatiseras bort — den ska krympa, aldrig växa av slentrian.

import { STJARNFARG } from './branding.mjs';

export function byggChecklista(p, butik) {
  const brand = p?.brand?.namn ?? butik?.butik?.brand ?? 'STORE NAME';
  const doman = p?.brand?.domanideer?.[0] ?? 'DOMAIN';
  const mail = butik?.butik?.supportmail ?? `hello@${doman}`;
  // Två olika adresser (VA:ns rättelse 2026-09-08, TankGuard): butiken
  // skapas och mejlen vidarebefordras till jobbinkorgen, men ÄGANDET förs
  // över till Axels egen adress — inte samma sak.
  const inkorg = 'subscriptions@stonebite.org';
  const agare = 'axelodhner.business@gmail.com';
  const stjarna = STJARNFARG.replace('#', '');
  return `# Store Launch Checklist — ${brand} (manual steps)

Do the steps in order, top to bottom. Tick each one.
Everything not on this list is done by Claude Code.

* STORE NAME: **${brand}**
* DOMAIN: **${doman}**
* STORE EMAIL: **${mail}**
* FORWARD TO: **${inkorg}**

## 1. Shopify – create the store
- [ ] Go to shopify.com → **Start free trial** → sign up with the work Gmail
- [ ] Stay on the free trial – never pick a plan, never enter any card
  Note: staff invites need a paid plan – the owner is added at hand over.

## 2. Shopify – connect Claude Code
- [ ] Go to **dev.shopify.com** → log in with the work Gmail → Apps → **Create app** → name it: **Fabriken** + the store's address start (example: Fabriken y1sj1i)
- [ ] The app → **Settings** → copy the **Client ID** and the **Client secret**
- [ ] Open the Claude session's **Environment** → set these 4 (overwrite the old values):
  \`SHOPIFY_SHOP\` = the store's .myshopify.com address
  \`SHOPIFY_CLIENT_ID\` = the Client ID
  \`SHOPIFY_CLIENT_SECRET\` = the Client secret
  \`SHOPIFY_STOREFRONT_PASSWORD\` = Online Store → Preferences → **Password** (the store password – Claude needs it to check the pages like a customer sees them)
- [ ] Back in the app → **Distribution** → Custom distribution → enter the store's .myshopify.com address → **Generate link** → open it → **Install app**
  Note: keys go ONLY in the Environment – never in chat or email.

## 3. Start the build
- [ ] Write **/ny-ops** + the product link in Claude Code
- [ ] Claude checks the connection, names the store and builds everything
- [ ] Claude tells you the STORE NAME and DOMAIN for the next steps

## 4. Domain (Loopia)
- [ ] Log in to Loopia
- [ ] Buy **${doman}** – registrant must be the company, not you
- [ ] Domain → Email → Forwarding → create **${mail}** → forward to **${inkorg}**
- [ ] Send a test email to **${mail}** – confirm it arrives

## 5. Shopify – basics
- [ ] Settings → General → Store name → **${brand}** → Save
- [ ] Settings → Domains → Connect existing domain → **${doman}** → follow the DNS steps → Set as primary
- [ ] Settings → Languages → make **Swedish** default
- [ ] Settings → Notifications → Sender email → **${mail}** → Save → click the verification link in the inbox

## 6. Shopify – payments
- [ ] Settings → Payments → Activate **Shopify Payments** → fill in the company + bank details Claude gives you
- [ ] Same page → **Klarna** → tick → Save
- [ ] Settings → Checkout → Customize → Logo → upload the logo Claude gives you → Save

## 7. Judge.me
- [ ] Apps → search "Judge.me" → Install (free plan)
- [ ] Judge.me → Settings → Language → **Swedish**
- [ ] Judge.me → Settings → Review Widget → star color: **${stjarna}**
- [ ] Judge.me → Settings → Import reviews → Import from apps → **Judge.me format** → upload the reviews file Claude gives you → Import
- [ ] Open the product page → check the reviews show their original dates (never "just now")

## 8. Meta
- [ ] business.facebook.com → Settings → Pages → Add → Create a new Page: **${brand}**
- [ ] Copy the **Page ID** → give to Claude Code
- [ ] The ad account is always **MagiBorsten DK** (915422744950975) – same for every OPS store, never pick another one, never add any card

## 9. Discord
- [ ] Discord → + → Create server: **${brand}**
- [ ] Open the invite link Claude Code gives you → **Authorize** the bot

## 10. Hand over
- [ ] Tell Claude Code: **"Store ready: ${brand}"** – it creates the pixel, builds Discord channels and imports reviews
- [ ] When Claude says the theme is ready: Online Store → Themes → the theme Claude names → **Publish**
- [ ] When Claude says the Norway market is ready: Settings → Markets → **Norway** → activate **NOK** → Save
- [ ] Install the **WeTracked** app from the Shopify App Store
- [ ] WeTracked → paste the **pixel ID** Claude gives you
- [ ] Events Manager → Data sources → **${brand}** → Settings → Conversions API → **Generate access token** → copy it
- [ ] WeTracked → paste the **Conversions API token** (never send it in chat or email)
- [ ] The owner logs in with the work Gmail, picks the plan and adds his card
- [ ] Then: Settings → Users → click the store owner's name → **Transfer store ownership** → **${agare}** → enter your password → confirm
- [ ] Owner changes the Loopia password afterwards
`;
}
