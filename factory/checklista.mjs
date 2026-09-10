// VA:ns checklista — de manuella klicken som varje ny OPS-butik kräver.
//
// Mallen är Axels egen (2026-09-07, omgjord 2026-09-08 i tre beslut:
// butiken + appen + kopplingen FÖRST, sen bygger /ny-ops allt; en app per
// butik eftersom custom distribution låses till EN butik utanför Plus;
// nycklarna läggs i miljön av VA:n, aldrig i chatten). På ENGELSKA — den
// som klickar är VA:n i Manila, inte Axel. Master-mallen med tomma fält
// ligger i factory/VA-CHECKLIST.md; den här modulen fyller i butikens
// värden och skriver output/<butik>/CHECKLISTA.md efter varje bygge.
// ⚠️ VA:ns master är Google-dokumentet (länk i VA-CHECKLIST.md) — varje
// ändring här ska föras in i dokumentet i samma session.
//
// EN fil per BUTIK (KEDJAN.md): en flerproduktsbutik (TackleBay 2026-09-09)
// är fortfarande en Shopify-butik, en domän, en Judge.me-app, en pixel.
// Produkterna listas i filen; det som skiljer per produkt (recensionsfilen)
// står som en rad per produkt.
//
// Inga butiksspecifika hårdkodningar (KEDJAN.md regel 7): valuta, land,
// språk och marknader kommer ur butiker/<id>.yaml. De tre tabellerna nedan
// är bara översättningar landskod → engelska (VA:n läser engelska).
//
// Håll varje rad till ETT handgrepp. Uppdatera listan när ett steg
// automatiseras bort — den ska krympa, aldrig växa av slentrian.

import { STJARNFARG } from './branding.mjs';

// Landskod → vad VA:n ser i Shopify-adminen (engelska).
const LAND_EN = { SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland', DE: 'Germany', GB: 'United Kingdom' };
const SPRAK_EN = { SE: 'Swedish', NO: 'Norwegian', DK: 'Danish', FI: 'Finnish', DE: 'German', GB: 'English' };
// Marknadens EGEN valuta — den VA:n slår på i admin när marknaden är klar
// (API-spärrat i unified markets; yaml:ens marknader[].valuta står SEK
// tills dess, se butik-mall.yaml).
const LOKAL_VALUTA = { SE: 'SEK', NO: 'NOK', DK: 'DKK', FI: 'EUR', DE: 'EUR', GB: 'GBP' };

// Två olika adresser (VA:ns rättelse 2026-09-08, TankGuard): butiken
// skapas och mejlen vidarebefordras till jobbinkorgen, men ÄGANDET förs
// över till Axels egen adress — inte samma sak. Bolagsnivå, inte butiksnivå.
const INKORG = 'subscriptions@stonebite.org';
const AGARE = 'axelodhner.business@gmail.com';

const text = (v) => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const lista = (v) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);

// Butikens värden i den form checklistan skriver ut. Exporterad så testerna
// kan mäta härledningen (domän ur supportmail, marknader ur yaml) utan att
// tolka markdown.
export function checklistaVarden(butik, produkter = [], { pixelId = null, temaNamn = null } = {}) {
  const b = butik?.butik ?? {};
  const prods = lista(produkter);
  const brand = text(b.brand) ?? text(prods[0]?.brand?.namn) ?? 'STORE NAME';
  // Domänen: butiksfilen har ingen egen rad — supportmail är ALLTID
  // hello@<domän> (Axels beslut 2026-09-08, valideras i butik.mjs), så
  // domänen läses därifrån. Reserv: första produktens första domänidé.
  const doman =
    text(b.doman) ??
    (text(b.supportmail)?.match(/@(.+)$/)?.[1] ?? null) ??
    text(prods[0]?.brand?.domanideer?.[0]) ??
    'DOMAIN';
  const mail = text(b.supportmail) ?? `hello@${doman}`;
  const land = text(b.land)?.toUpperCase() ?? null;
  const valuta = text(b.valuta) ?? 'CURRENCY';
  const marknader = lista(b.marknader)
    .map((m) => {
      const kod = text(m?.land)?.toUpperCase();
      if (!kod) return null;
      return { kod, land: LAND_EN[kod] ?? kod, valuta: LOKAL_VALUTA[kod] ?? text(m.valuta) ?? 'the local currency', locale: text(m.locale) };
    })
    .filter(Boolean);
  return {
    id: text(b.id) ?? 'STORE-ID',
    // Samma id, i den form miljövariablerna bär det (envSuffix i token.mjs):
    // VERSALER, allt utom A-Z0-9 blir understreck.
    idStort: (text(b.id) ?? 'STORE-ID').toUpperCase().replace(/[^A-Z0-9]+/g, '_'),
    brand,
    doman,
    mail,
    inkorg: INKORG,
    agare: AGARE,
    stjarna: STJARNFARG.replace('#', ''),
    valuta,
    // Bolagets adress. Den avgör butikens valuta och språk VID SKAPANDET —
    // Shopify sätter dem efter butiksadressens land, inte efter kontot.
    // Står den inte i checklistan skriver den som registrerar sin EGEN adress,
    // och butiken föds i fel valuta. (TackleBay 2026-09-09: VA:n sitter i
    // Filippinerna, butiken blev PHP + engelska + hemmamarknad Filippinerna.)
    // Ångerfristen i dagar — samma tal som returpolicyn och Shopifys
    // returregler måste bära. Står de olika ger butiken två svar på samma
    // fråga, och det svar som gäller är kundens fördel.
    angerratt: Number(b.retur?.angerratt_dagar) > 0 ? Number(b.retur.angerratt_dagar) : 14,
    bolagsnamn: text(b.bolagsnamn) ?? 'THE COMPANY',
    adress: text(b.adress) ?? 'THE COMPANY ADDRESS',
    landKod: land ?? 'SE',
    huvudland: land ? (LAND_EN[land] ?? land) : (text(b.huvudmarknad) ?? 'the home market'),
    sprak: land ? (SPRAK_EN[land] ?? 'the home language') : 'the home language',
    marknader,
    produkter: prods.map((p) => ({
      namn: text(p?.produkt?.namn) ?? 'PRODUCT',
      id: text(p?.produkt?.id) ?? 'product-id',
    })),
    pixelId: text(pixelId),
    temaNamn: text(temaNamn),
  };
}

// byggChecklista(butik, produkter, { pixelId?, temaNamn? }) → markdown.
// Bakåtkompatibelt med den gamla ordningen byggChecklista(produkt, butik)
// (produktfilen har `produkt:`, butiksfilen har `butik:`) tills varje
// anropare bytt — då tas skiftet bort.
export function byggChecklista(butik, produkter, val = {}) {
  if (butik?.produkt && !butik?.butik && produkter?.butik) {
    [butik, produkter] = [produkter, [butik]];
  }
  const v = checklistaVarden(butik, produkter, val);
  const fler = v.produkter.length > 1;
  const produktrader = v.produkter.map((p) => `* PRODUCT: **${p.namn}** (${p.id})`);
  const recensionsrader = v.produkter.length > 0
    ? v.produkter.map((p) => `- [ ] Judge.me → Settings → Import reviews → Import from apps → **Judge.me format** → upload the reviews file Claude gives you for **${p.namn}** → Import`)
    : ['- [ ] Judge.me → Settings → Import reviews → Import from apps → **Judge.me format** → upload the reviews file Claude gives you → Import'];
  const marknadsrader = v.marknader.map(
    (m) => `- [ ] When Claude says the ${m.land} market is ready: Settings → Markets → **${m.land}** → activate **${m.valuta}** → Save`
  );
  const pixelrad = v.pixelId
    ? `- [ ] WeTracked → paste the **pixel ID**: **${v.pixelId}**`
    : '- [ ] WeTracked → paste the **pixel ID** Claude gives you';
  const temarad = v.temaNamn
    ? `- [ ] When Claude says the theme is ready: Online Store → Themes → **${v.temaNamn}** → **Publish**`
    : '- [ ] When Claude says the theme is ready: Online Store → Themes → the theme Claude names → **Publish**';

  return `# Store Launch Checklist — ${v.brand} (manual steps)

Do the steps in order, top to bottom. Tick each one.
Everything not on this list is done by Claude Code.
${fler ? 'This store has several products – it is still ONE store, ONE domain, ONE checklist.\n' : ''}
* STORE NAME: **${v.brand}**
* DOMAIN: **${v.doman}**
* STORE EMAIL: **${v.mail}**
* FORWARD TO: **${v.inkorg}**
* OWNER (hand over to): **${v.agare}**
${produktrader.join('\n')}

## 1. Shopify – create the store
**The address you type here decides the currency, the language and the home
market.** Shopify takes them from the store address, not from your account.
Type the COMPANY address below – never your own, wherever you are sitting.
Get this right and section 5 is three checks instead of seven clicks.
- [ ] Go to shopify.com → **Start free trial** → sign up with the work Gmail
- [ ] When it asks where the business is located, enter:
      **${v.bolagsnamn}**, ${v.adress}, ${v.huvudland}
- [ ] Stay on the free trial – never pick a plan, never enter any card
  Note: staff invites need a paid plan – the owner is added at hand over.
- [ ] Settings → General → check it says **${v.valuta}** and **${v.huvudland}**.
      If it does not, the address went in wrong – fix it before you continue.
      Everything built on the wrong currency has to be built again.

## 2. Shopify – connect Claude Code
- [ ] Go to **dev.shopify.com** → log in with the work Gmail → Apps → **Create app** → name it: **Fabriken** + the store's address start (example: Fabriken y1sj1i)
- [ ] The app → **Settings** → copy the **Client ID** and the **Client secret**
- [ ] Look at the store's address. It ends in \`.myshopify.com\`. The part
  BEFORE that is the tag you use below — it is the same thing you typed when
  you named the app. Example: address \`ikf0tu-5e.myshopify.com\` → tag
  \`IKF0TU_5E\` (capitals, and \`-\` becomes \`_\`).
- [ ] Open the Claude session's **Environment** → ADD these 4. Do NOT touch the
  ones without a tag at the end — those belong to other stores:
  \`SHOPIFY_SHOP_<TAG>\` = the store's .myshopify.com address
  \`SHOPIFY_CLIENT_ID_<TAG>\` = the Client ID
  \`SHOPIFY_CLIENT_SECRET_<TAG>\` = the Client secret
  \`SHOPIFY_STOREFRONT_PASSWORD_<TAG>\` = Online Store → Preferences → **Password** (the store password – Claude needs it to check the pages like a customer sees them)
  Every session on the account shares ONE Environment. Without the tag, two
  builds fight over the same four rows and one writes to the wrong store.
  You do not have to remember the tag: you write the store ADDRESS in the
  command, and Claude finds the four rows from it.
- [ ] **Save the Environment BEFORE you start the session.** A session reads the
  Environment when it starts — saving into a running session changes nothing there.
- [ ] Back in the app → **Distribution** → Custom distribution → enter the store's .myshopify.com address → **Generate link** → open it → **Install app**
  Note: keys go ONLY in the Environment – never in chat or email.
  If a Client secret ever ends up in a chat: the app → Settings → Client secret
  → generate a new one → put the new value in the Environment. The build keeps
  running on the token it already has, so this never blocks anything.

## 3. Start the build
- [ ] Write **/ny-ops** + the product link in Claude Code, with the store address under it:
  \`\`\`
  /ny-ops <the product link>
  The store must be <the .myshopify.com address>. If the "Connected" line does
  not match that address: stop and tell me, build nothing.
  \`\`\`
  That address is how Claude finds the right keys. Leave it out and it reads
  the variables without a tag, and those may belong to another store.
- [ ] Claude checks the connection, names the store and builds everything
- [ ] Claude tells you the STORE NAME and DOMAIN for the next steps

## 4. Domain (Loopia)
- [ ] Log in to Loopia
- [ ] Buy **${v.doman}** – registrant must be the company, not you
- [ ] Domain → Email → Forwarding → create **${v.mail}** → forward to **${v.inkorg}**
- [ ] Send a test email to **${v.mail}** – confirm it arrives

## 5. Shopify – basics
The first three should ALREADY be right if you typed the company address in
section 1. Check them – do not skip them. Claude cannot change any of the
three, and the prices, the checkout and the discount codes are wrong until
they are correct.
- [ ] Settings → General → **Store currency** says **${v.valuta}**
      Wrong? Change it here, then write those exact words to Claude Code:
      **currency and language are set**
      The discount codes are stored in the store's currency and have to be
      written again, and that sentence is what starts it.
- [ ] Settings → Markets → **${v.huvudland}** is the primary market
- [ ] Settings → Languages → **${v.sprak}** is the default
- [ ] Settings → General → Store name → **${v.brand}** → Save
- [ ] Settings → Domains → Connect existing domain → **${v.doman}** → follow the DNS steps → Set as primary
- [ ] Settings → Notifications → Sender email → **${v.mail}** → Save → click the verification link in the inbox

## 5b. Shopify – the EU withdrawal button (required by law)
Since 19 June every EU store must have a clear "cancel my order" button the
customer can find, a two-step confirmation, and an automatic confirmation
email. Shopify's self-serve returns do all three — but only once you switch
them on. Claude writes the button into the return policy and the footer menu;
these four switches are yours.
Skipping this is not a cosmetic risk: the withdrawal period can stretch from
14 days to 12 months and 14 days, and fines reach 4% of annual turnover in
some member states.
- [ ] Settings → **Customer accounts** → turn customer accounts on
- [ ] Same page → turn on **Self-serve returns** (and cancellations)
- [ ] Settings → Policies → **Return rules** → return window **${v.angerratt} days**
      from delivery, and say who pays the return shipping
- [ ] Same page → **Cancellation window** → until the order is fulfilled
- [ ] Open the store and check: **Ångra köp** is in the footer, and it opens
      the account page. If it opens nothing, the account setting above is off.

## 6. Shopify – payments
- [ ] Settings → Payments → Activate **Shopify Payments** → fill in the company + bank details Claude gives you
- [ ] Same page → **Klarna** → tick → Save
- [ ] Settings → Checkout → Customize → Logo → upload the logo Claude gives you → Save

## 7. Judge.me
- [ ] Apps → search "Judge.me" → Install (free plan)
- [ ] Judge.me → Settings → Language → **${v.sprak}**
- [ ] Judge.me → Settings → Review Widget → star color: **${v.stjarna}**
${recensionsrader.join('\n')}
- [ ] Open the product page → check the reviews show their original dates (never "just now")

## 8. Meta
- [ ] business.facebook.com → Settings → Pages → Add → Create a new Page: **${v.brand}**
- [ ] Copy the **Page ID** → give to Claude Code
- [ ] The ad account is always **MagiBorsten DK** (915422744950975) – same for every OPS store, never pick another one, never add any card

## 9. Discord
- [ ] Discord → + → Create server: **${v.brand}**
- [ ] Open the invite link Claude Code gives you → **Authorize** the bot

## 10. Hand over
- [ ] Tell Claude Code: **"Store ready: ${v.brand}"** – it creates the pixel, builds Discord channels and imports reviews
${temarad}
${marknadsrader.length > 0 ? `${marknadsrader.join('\n')}\n` : ''}- [ ] Install the **WeTracked** app from the Shopify App Store
${pixelrad}
- [ ] Events Manager → Data sources → **${v.brand}** → Settings → Conversions API → **Generate access token** → copy it
- [ ] WeTracked → paste the **Conversions API token** (never send it in chat or email)
- [ ] The owner logs in with the work Gmail, picks the plan and adds his card
- [ ] Then: Settings → Users → click the store owner's name → **Transfer store ownership** → **${v.agare}** → enter your password → confirm
- [ ] Owner changes the Loopia password afterwards

## 11. Ads (a NEW session)
- [ ] Open a NEW Claude session — not the one you built the store in
- [ ] Write: **/ny-annonser ${v.id}** + the Bäverbutiken product link
- [ ] The link is needed once per store — after that just **/ny-annonser ${v.id}**
- [ ] Claude rebuilds the proven ads for this brand and builds the campaigns in MagiBorsten DK — everything PAUSED
- [ ] Check what Claude asks you to check in Ads Manager
- [ ] When it all looks right: set the campaigns ACTIVE
`;
}
