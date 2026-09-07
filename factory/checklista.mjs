// VA:ns checklista — de manuella klicken som varje ny OPS-butik kräver.
//
// Mallen är Axels egen (2026-09-07, justerad efter VA-granskningen samma
// kväll), på ENGELSKA — den som klickar är VA:n i Manila, inte Axel.
// Master-mallen med tomma fält ligger i factory/VA-CHECKLIST.md; den här
// modulen fyller i butikens värden och skriver output/<id>/CHECKLISTA.md
// efter varje bygge. Ordningen följer mallen exakt: domänen först
// (Shopify-stegen kräver den), Claude-kopplingen före allt Claude bygger,
// temapubliceringen som VA-klick i överlämningen (API:t kan inte
// publicera), och INGET kort i Meta-steget (kortet ligger redan i
// Business Manager — PLAN.md punkt 7.4).
//
// Håll varje rad till ETT handgrepp. Uppdatera listan när ett steg
// automatiseras bort — den ska krympa, aldrig växa av slentrian.

import { STJARNFARG } from './branding.mjs';

export function byggChecklista(p, butik) {
  const brand = p?.brand?.namn ?? butik?.butik?.brand ?? 'STORE NAME';
  const doman = p?.brand?.domanideer?.[0] ?? 'DOMAIN';
  const mail = butik?.butik?.supportmail ?? `hello@${doman}`;
  const agare = 'subscriptions@stonebite.org';
  const stjarna = STJARNFARG.replace('#', '');
  return `# Store Launch Checklist — ${brand} (manual steps)

Do the steps in order, top to bottom. Tick each one.
Everything not on this list is done by Claude Code.

* STORE NAME: **${brand}**
* DOMAIN: **${doman}**
* STORE EMAIL: **${mail}**
* FORWARD TO: **${agare}**

## 1. Domain (Loopia)
- [ ] Log in to Loopia
- [ ] Buy **${doman}** – registrant must be the company, not you
- [ ] Domain → Email → Forwarding → create **${mail}** → forward to **${agare}**
- [ ] Send a test email to **${mail}** – confirm it arrives

## 2. Shopify – create the store
- [ ] Go to shopify.com → **Start free trial** → sign up with the work Gmail
- [ ] Stay on the free trial – never pick a plan, never enter any card
  Note: staff invites need a paid plan – the owner is added at hand over.

## 3. Shopify – basics
- [ ] Settings → General → Store name → **${brand}** → Save
- [ ] Settings → Domains → Connect existing domain → **${doman}** → follow the DNS steps → Set as primary
- [ ] Settings → Languages → make **Swedish** default
- [ ] Settings → Notifications → Sender email → **${mail}** → Save → click the verification link in the inbox

## 4. Shopify – connect Claude Code
- [ ] Settings → Apps and sales channels → Develop apps → **Allow custom app development**
- [ ] Create app → name it **Fabriken** → Configure Admin API scopes → tick **ALL** scopes → Save
- [ ] Install app → reveal the **Admin API access token** → paste it into Claude Code when asked (never in chat or email)

## 5. Shopify – payments
- [ ] Settings → Payments → Activate **Shopify Payments** → fill in the company + bank details Claude gives you
- [ ] Same page → **Klarna** → tick → Save
- [ ] Settings → Checkout → Customize → Logo → upload the logo Claude gives you → Save

## 6. Judge.me
- [ ] Apps → search "Judge.me" → Install (free plan)
- [ ] Judge.me → Settings → Language → **Swedish**
- [ ] Judge.me → Settings → Review Widget → star color: **${stjarna}**
- [ ] Judge.me → Settings → Integrations → copy **API Token** → paste it into Claude Code when asked (never in chat or email)

## 7. Meta
- [ ] business.facebook.com → Settings → Pages → Add → Create a new Page: **${brand}**
- [ ] Copy the **Page ID** → give to Claude Code
- [ ] The ad account is always **MagiBorsten DK** (915422744950975) – same for every OPS store, never pick another one, never add any card

## 8. Discord
- [ ] Discord → + → Create server: **${brand}**
- [ ] Open the invite link Claude Code gives you → **Authorize** the bot

## 9. Hand over
- [ ] Tell Claude Code: **"Store ready: ${brand}"** – it creates the pixel, builds Discord channels and imports reviews
- [ ] When Claude says the theme is ready: Online Store → Themes → the theme Claude names → **Publish**
- [ ] When Claude says the Norway market is ready: Settings → Markets → **Norway** → activate **NOK** → Save
- [ ] Install the **WeTracked** app from the Shopify App Store
- [ ] WeTracked → paste the **pixel ID** Claude gives you
- [ ] WeTracked → connect the **Conversions API token** (WeTracked shows the steps)
- [ ] The owner logs in with the work Gmail, picks the plan and adds his card
- [ ] Then: Settings → Users and permissions → ⋯ → **Transfer ownership** → **${agare}**
- [ ] Owner changes the Loopia password afterwards
`;
}
