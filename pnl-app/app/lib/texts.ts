/**
 * All användarsynlig UI-text, på båda språken.
 *
 * Ren ordbok utan beroenden — importeras av både loaders, actions och
 * komponenter. Engelska är standard; svenska är valbart per butik via
 * ShopSettings.language. Strängar med värden i är funktioner, så att
 * pluralisering och ordföljd kan skilja mellan språken.
 *
 * Nyckelstrukturen är nästlade objekt grupperade per sida. `Texts`-typen
 * härleds ur den engelska ordboken och tvingar den svenska att ha exakt
 * samma nycklar — en saknad nyckel är ett kompileringsfel.
 */

export type Lang = "en" | "sv";

const en = {
  nav: {
    profit: "Profit",
    costs: "Costs",
    fixedCosts: "Fixed costs",
    stores: "Stores",
    ltv: "Customer value (LTV)",
    settings: "Settings",
  },

  dashboard: {
    title: "Profit",
    loadingOrders: "Fetching orders",
    loadingText:
      "Fetching orders from Shopify — the 30-day view reads the entire order history and can take up to half a minute.",
    fatalTitle: "The dashboard could not fetch data",
    unknownError: "unknown error",
    fatalHelp: "Send a screenshot of this message — it points out exactly where it stops.",
    refresh: "Refresh",
    ranges: {
      today: "Today",
      yesterday: "Yesterday",
      d7: "7 days",
      d30: "30 days",
      d90: "90 days",
    },
    updatedAgo: (min: number, refreshing: boolean) =>
      `Figures were last updated ${min} min ago${
        refreshing ? " — a fresh fetch is running in the background, reload shortly" : ""
      }.`,
    combineStores: (n: number) => `Combine all ${n} stores`,
    combineHelp: (currency: string) =>
      `Adds up all linked stores into one calculation in ${currency}, using daily exchange rates.`,
    thStore: "Store",
    thCurrency: "Sells in",
    thSales: "Sales",
    thAds: "Ads",
    thNetProfit: "Net profit",
    missingStores: (n: number) => `${n} store(s) are not included in the total`,

    setup: {
      title: "Get started 🚀",
      progress: (done: number, total: number) => `${done} of ${total} done`,
      intro: "The dashboard is already calculating — but it only becomes true once these four are filled in.",
      stepCosts: "Enter product costs",
      costsHintNoOrders: "No orders in the period yet. This step clears once sold products have a cost.",
      costsHintMissing: (n: number) => `${n} sold units are missing a cost and count as free.`,
      costsHintDone: "All sold units have a cost.",
      ctaCosts: "Go to Costs",
      stepMeta: "Connect your ad account",
      metaHintDone: "Ad spend is fetched automatically every day.",
      metaHintTodo: "Without a connection ad spend counts as zero and profit reads too high.",
      metaHintPending: "Logged in with Facebook — pick the ad account under Settings to finish.",
      metaHintPendingManual: "A token is saved — enter the ad account ID under Settings to finish.",
      metaHintBroken: "Connected, but ad spend can't be fetched right now — see the message below and log in again if it says so.",
      ctaPickAccount: "Pick ad account",
      ctaSettings: "Go to Settings",
      stepFixed: "Enter fixed monthly costs",
      fixedHintDone: "Deducted from net profit, spread per day.",
      fixedHintTodo: "Subscriptions, apps, staff — everything that costs money regardless of sales.",
      ctaFixed: "View all",
      stepSettings: "Review duty and transaction fee",
      settingsHintDone: "Saved for this store.",
      settingsHintTodo: (tariff: string, currency: string) =>
        `Still running on the defaults (${tariff} ${currency} per order, 2.9 %). Are they right for this store?`,
      dismiss: "Hide checklist",
    },

    quickAdd: {
      nameLabel: "Name",
      namePlaceholder: "e.g. Shopify subscription",
      amountLabel: "Per month",
      amountPlaceholder: "per month",
      amountSuffix: "/mo",
      add: "Add",
    },

    kpi: {
      sales: "Sales",
      orders: "Orders",
      fixedCosts: "Fixed costs",
      adSpend: "Ad spend",
      cogs: "COGS",
      duty: "Duty",
      mer: "MER",
      netProfit: "Net profit",
      shippingOfWhich: (s: string) => `of which shipping ${s}`,
      avgOrder: (s: string) => `avg order ${s}`,
      perDay: "spread per day",
      cpa: (s: string) => `CPA ${s}`,
      missingDays: (n: number) => `⚠ missing ${n} days`,
      unitsNoCost: (n: number) => `${n} units without cost`,
      allUnitsCovered: "all units covered",
      ordersCount: (s: string) => `${s} orders`,
      breakEven: (s: string) => `break-even ${s}`,
      maxCpa: (pct: number, s: string) => `max CPA @ ${pct} %: ${s}`,
      profitTooHigh: "too high — ad data missing",
      vsPrev: "vs prev",
    },

    /* Annonskostnadens fel, per kod från meta.server — EN banner per läge. */
    spendErrors: {
      "no-connection": "Meta is not connected — ad spend is missing, so profit reads too high.",
      "no-account": "Logged in with Facebook, but no ad account chosen yet. Ad spend is not fetched until you pick one.",
      "no-account-manual": "A Meta token is saved, but no ad account chosen yet. Ad spend is not fetched until you enter one under Settings.",
      expired: "The Meta connection has expired — ad spend is no longer fetched. Renew it under Settings.",
      retrying: "Ad spend could not be fetched just now — retrying in a few minutes.",
      "fetch-failed": (reason: string) => `Could not fetch ad spend: ${reason}`,
    },
    fxTitle: "Ad spend could not be converted",
    fxBody: (spendCur: string, shopCur: string) =>
      `The ad account reports in ${spendCur}, the store in ${shopCur}, and the exchange rate could not be fetched right now. ` +
      `The amounts are added together as if they were the same currency — net profit, MER and CPA are wrong until the rate is available again. Reload in a while.`,
    convertedNote: (from: string, to: string) =>
      `Ad spend is paid in ${from} and converted to ${to} at each day's exchange rate.`,
    spendMissingTitle: "Contribution margin is too high",
    spendMissingBody: (days: string) =>
      `Ad spend is missing for ${days}. Those days count as zero ad spend, which makes profit misleading.`,
    costMissingTitle: "Cost missing",
    costMissingBody: (n: number) =>
      `${n} sold units have no cost in Shopify. They count as free, so COGS is too low and profit reads too high. Fill them in under Costs.`,
    cogsChange: (note: string) => `COGS: ${note}.`,
    cogsChangeWeighted: (note: string, newPct: number, oldPct: number) =>
      `COGS: ${note} — the period spans the change date, the cost is weighted ${newPct} % new / ${oldPct} % old by revenue per day.`,

    visualTitle: "Visual breakdown",
    detailTitle: "Detailed breakdown",
    revenue: "Revenue",
    productCost: "Product cost",
    ads: "Ads",
    txFees: "Transaction fees",
    grossProfit: "Gross profit",
    ofRevenue: "of revenue",
    donutAria: "Revenue breakdown",
    profitPerDay: "Profit per day",
    profitPerDayNote: "COGS, fees and duty allocated by each day's revenue — an estimate, not bookkeeping.",
    tipSales: "Sales",
    tipAds: "Ads",
    tipProfit: "Profit",

    thProduct: "Product",
    thUnits: "Units",
    thNet: "Net",
    thCogs: "COGS",
    thCm: "CM",
    thMargin: "Margin",
    thMultiple: "Multiple",
    missing: "missing",
  },

  costs: {
    title: "Costs",
    subtitle: (have: number, total: number) => `${have} of ${total} variants have a cost`,
    missingBannerTitle: (n: number) => `${n} variants are missing a cost`,
    missingBannerBody: "Without a cost the product counts as free and profit reads too high.",
    allHaveCost: "All variants have a cost.",
    sopTitle: "How to do it 📋",
    sop1: "Download the template below — it contains all of the store's products with the correct titles.",
    sop2: "Fill in the cost column. The file can be forwarded to your supplier, your bookkeeper, or an AI that fills it in for you.",
    sop3: "Drop the file back here. All costs are written to Shopify at once.",
    sop4:
      "Click a product in the list at the bottom to add dated entries — goods and shipping separately, with the date they took effect. " +
      "When a price changes, add a new entry instead of overwriting, so old statistics stay true.",
    importTitle: "Import costs",
    importBody:
      "Download the template — it contains the store's exact product titles. Fill in the cost column, or forward the file to whoever has " +
      "the purchase prices, and drop it back here. The cost is goods + shipping without duty; duty is per order and lives in Settings.",
    downloadTemplate: "⬇ Download template with your products",
    showAsText: "or view as text",
    hideTemplate: "Hide template",
    templateLabel: "Template to copy",
    templateHelp: "Select all and copy if the download is blocked by the browser.",
    tpl1: "# Costs — product title;variant title;cost;selling price",
    tpl2: "# Fill in the COST (third column). The price at the end is reference only and is ignored on import.",
    tpl3: "# The cost is goods + shipping, WITHOUT duty. Duty is per order and lives in Settings.",
    tpl4: "# Leave the variant title empty to set the same cost on all variants.",
    tpl5: "# Do not change the titles — they are matched against the store.",
    tpl6: "# Bundles: write the cost for 1, 2 and 3 units separated by | — e.g. 88.34|134.22|180.19 (total for the whole quantity).",
    pastedText: "Pasted text",
    dropReady: (n: number) => `${n} rows ready to be written`,
    chooseFile: "Choose CSV file",
    dragHint: "or drag the file here",
    pasteLabel: "…or paste the rows directly",
    pastePlaceholder: "Marine Motor Cover 420D – Universal Protection;Black / 40 - 60 hp;81.92\nBeach Sandals for Men – Non-slip Garden Shoes;;148.42",
    effectiveFromLabel: "Effective from (optional)",
    effectiveFromHelp:
      "If a date is set, the change is saved to the history, so periods before the date are calculated at the old cost. " +
      "Drop in a new version of the file when prices change and set the date they took effect.",
    writeToShopify: "Write to Shopify",
    thProduct: "Product",
    thVariant: "Variant",
    thPrice: "Price",
    thCost: "Cost",
    thCmPerUnit: (currency: string) => `CM/unit (${currency})`,
    thBeRoas: "BE ROAS",
    missingBadge: "missing",
    unprofitable: "unprofitable",
    firstRowParsed: (s: string) => ` The first row was parsed as: ${s}`,
    noValidRows: (sample: string) => `No valid rows found in the CSV.${sample}`,
    updatedMsg: (applied: number, skipped: number, names: string) =>
      `${applied} variants updated.` + (skipped ? ` ${skipped} were skipped: ${names}` : ""),
    costNote: (date: string) => `new cost from ${date}`,
    bundleHint:
      "Bundles: two or three units in the same order line usually cost less than two or three times the unit cost, because shipping is shared. " +
      "Write the costs separated by | in the cost column (1|2|3 units), or click a product below and add them under Cost per quantity.",
  },

  costDetail: {
    subtitle: "Cost per unit — goods and shipping separately",
    newEntry: "New entry",
    newEntryBody:
      "Enter what the goods and the shipping cost from a given date. Periods before the date are still calculated at the old cost, " +
      "so old statistics stay true.",
    productCostLabel: "Product cost",
    shippingLabel: "Shipping",
    effectiveFrom: "Effective from",
    appliesTo: "Applies to",
    allVariants: (n: number) => `All ${n} variants`,
    totalBanner: (total: string, goods: string, shipping: string) =>
      `Total unit cost: ${total} per unit — ${goods} goods + ${shipping} shipping. Duty is per order in Settings and does not belong here.`,
    totalBannerEmpty: "The total shows here once both fields are filled in. Duty should not be included — it is counted per order.",
    saveEntry: "Save entry",
    currentCost: "Current cost in Shopify",
    thVariant: "Variant",
    thPrice: "Price",
    thCost: "Cost",
    thMultiple: "Multiple",
    missingBadge: "missing",
    history: "History",
    thEffectiveFrom: "Effective from",
    thApplies: "Applies to",
    thGoods: "Goods",
    thShipping: "Shipping",
    thTotal: "Total",
    aVariant: "one variant",
    allVariantsShort: "all variants",
    remove: "Remove",
    emptyHistory:
      "No dated entries yet. The cost stored in Shopify then applies to the entire period. " +
      "Add an entry when the price changes, so old periods are calculated at the old price.",
    backLink: "← Back to all costs",
    entryDeleted: "The entry was removed. The current cost in Shopify is unchanged.",
    fillBoth: "Fill in both product cost and shipping.",
    enterDate: "Enter the date the cost takes effect.",
    savedPartial: (list: string) => `The entry was saved, but the cost could not be written to Shopify for: ${list}`,
    saved: (n: number, total: string, date: string) => `Saved. ${n} variant(s) now cost ${total} effective from ${date}.`,
    costNote: (goods: string, shipping: string) => `goods ${goods} + shipping ${shipping}`,
    tiersTitle: "Cost per quantity (bundles)",
    tiersBody:
      "What the supplier charges in total when 2 or 3 units ship in the same order. One unit is the cost in Shopify above. " +
      "Order lines with a quantity that has no entry are calculated from the nearest lower quantity plus the marginal cost.",
    tierUnits: "Units",
    tierTotal: "Total cost",
    tierAdd: "Add cost",
    tierSaved: (n: number, units: number, total: string) => `Saved. ${n} variant(s): ${units} units cost ${total} in total.`,
    tierInvalid: "Enter a quantity of at least 2 and a total cost.",
    tierDeleted: "The quantity cost was removed.",
    thUnits: "Units",
    thPerUnit: "Per unit",
    tiersEmpty: "No quantity costs yet. Every unit is calculated at the unit cost in Shopify.",
    oneUnit: "1 (Shopify)",
  },

  fixed: {
    title: "Fixed costs",
    subtitle: (monthly: string, daily: string) => `${monthly} per month → ${daily} per day in the calculation`,
    addTitle: "Add cost",
    addBody:
      "Subscriptions, apps, staff, bookkeeping — everything that costs per month regardless of sales. " +
      "The total is spread per day and deducted from net profit.",
    nameLabel: "Name",
    namePlaceholder: "e.g. Shopify subscription",
    amountLabel: "Cost per month",
    amountPlaceholder: "299",
    add: "Add",
    thName: "Name",
    thMonthly: "Per month",
    thDaily: "Per day",
    remove: "Remove",
    totalRows: (n: number) => `${n} items`,
    empty: "No fixed costs added yet. Net profit is calculated without them until you add some.",
    errInvalid: "Enter a name and a cost per month.",
    suggestTitle: "Common monthly costs",
    suggestBody:
      "The small subscriptions are the ones that never make it into the calculation. Click one to prefill the form — adjust the amount to what you actually pay, then Add.",
    yourPlan: "your plan",
    unverified: "list price from memory — check it",
    converted: (cur: string, rate: string, date: string) => `USD amounts converted to ${cur} at ${rate} (ECB, ${date}).`,
    notConverted: "Exchange rate unavailable right now — USD amounts are shown in USD; enter the amount in your currency.",
    forgotTitle: "Have you forgotten…?",
    forgotBody: "No costs entered in these categories yet. Most stores have at least one in each:",
    categories: {
      shopify: "Shopify & plan",
      ai: "AI tools",
      verktyg: "Tools & software",
      marknadsforing: "Marketing",
      appar: "Shopify apps",
      hosting: "Hosting & domains",
      ekonomi: "Accounting, bank, insurance",
      personal: "Staff & freelancers",
    },
  },

  stores: {
    title: "Stores",
    subtitleLinked: (n: number) => `${n} stores linked — combine them on the Profit page`,
    subtitleUnlinked: "Link your stores to see them in one combined calculation",
    thStore: "Store",
    thCurrency: "Sells in",
    thisOne: "this one",
    addTitle: "Add a store",
    addBody:
      "Here's how: create a code here, open the app in your next store, go to Stores and redeem the code there. " +
      "The same code works in every store you get to within 30 minutes — create one, redeem it in each store in turn. " +
      "The code is the only proof the stores are yours, which is why nothing is linked automatically.",
    createCode: "Create code",
    redeemTitle: "…or redeem a code here",
    codeLabel: "Code",
    link: "Link stores",
    unlinkTitle: "Unlink",
    unlinkBody: "Removes this store from the group. No data is deleted — the combined view just stops showing it.",
    unlinkButton: "Unlink this store",
    codeCreated: (code: string, min: number) => `Code created: ${code}. Valid for ${min} minutes.`,
    codeInvalid: "The code is no longer valid. Create a new one — codes expire after 30 minutes.",
    codeOwn: "The code was created in this store. Redeem it in another one.",
    merged: (n: number) => `${n} stores were merged into the group. `,
    added: "The store was added. ",
    nowLinked: (total: number) =>
      `${total} stores are now linked. The code keeps working in more stores until it expires — redeem it in the next one right away.`,
    unlinked: "This store was unlinked. No data was deleted.",
    unknownAction: "Unknown action.",
  },

  settings: {
    title: "Settings",
    languageLabel: "Language / Språk",
    costsPerOrder: "Costs per order",
    tariffLabel: (currency: string) => `Duty per order (${currency})`,
    tariffHelp: "Charged once per order, not per unit. That's why bundles have better margins.",
    feeLabel: "Transaction fee (%)",
    feeHelp: "Share of total order value. Shopify Payments is typically around 2.9 %.",
    marginLabel: "Target margin (%)",
    marginHelp: "Max CPA on the dashboard is calculated against this margin.",
    metaTitle: "Meta",
    adAccountLabel: "Ad account ID",
    adAccountHelp: "The digits, with or without the act_ prefix.",
    tokenLabel: "Access token",
    tokenHelpSaved: "A token is saved. Leave empty to keep it.",
    tokenHelpEmpty: "Long-lived token from developers.facebook.com. Without it no ad spend is shown.",
    metaBanner:
      "Without a Meta connection, sales and COGS show as usual, but the contribution margin is flagged as incomplete " +
      "instead of being calculated as if ad spend were zero.",
    encryptedNote: "🔒 The token is encrypted before it is stored.",
    unencryptedTitle: "Token is stored unencrypted",
    unencryptedBody:
      "The TOKEN_ENCRYPTION_KEY environment variable is not set on this server, so the token is stored in plain text. " +
      "Set it before anyone but you uses the app — it's someone else's ad account sitting in the database.",
    save: "Save",
    saved: "Saved.",

    /* Logga in med Facebook */
    loginButton: "Log in with Facebook",
    reconnectButton: "Log in again",
    loginHelp: "Opens Facebook in a new window. Approve read access to your ads, then pick the ad account below.",
    loginOpening: "Opening Facebook…",
    loginPopupBlocked: "The browser blocked the window. Use the link below instead.",
    loginOpenLink: "Open the Facebook login in a new tab",
    loginWaiting: "Waiting for the Facebook window… Finish the login there; this page updates by itself.",
    loginFailed: "The login could not be started. Reload the page and try again.",
    connectedAs: (name: string) => `Logged in as ${name}.`,
    connectedManual: "Connected with a pasted token.",
    expiresSoon: (days: number) =>
      days <= 0
        ? "The Facebook login expires today — log in again so ad spend keeps coming in."
        : `The Facebook login expires in ${days} ${days === 1 ? "day" : "days"} — log in again so ad spend keeps coming in.`,
    expiredTitle: "The Facebook login has expired",
    expiredBody: "Ad spend is no longer fetched. Log in again to continue.",
    expiredTitleManual: "The Meta token has expired",
    expiredBodyManual: "Ad spend is no longer fetched. Paste a new token below to continue.",
    loginCancelled: "Login cancelled — nothing was changed.",
    loginDeclined: "You didn't allow access to your ads — nothing was changed. Log in again and keep “Ads” allowed.",
    loginNoAccounts: "That Facebook account has no ad accounts — nothing was changed. Log in with the account that manages your ads.",
    loginAccountNotVisible: "That Facebook account can't see the saved ad account — nothing was changed.",
    loginMetaFailed: "Facebook did not accept the login — nothing was changed. Try again.",
    loginNothingBack:
      "Nothing came back from Facebook. Try again — if Facebook showed “app not available”, this app is not yet approved for your Facebook account; paste a token by hand instead.",
    accountSelectLabel: "Ad account",
    accountSelectPlaceholder: "Choose an ad account…",
    accountSelectHelp: "The accounts your Facebook login can see. Ad spend is read from the one you pick — saved as soon as you choose.",
    accountSaved: (name: string) => `Saved — ad spend is now read from ${name}.`,
    accountNotInList: (id: string) => `${id} (saved, but not visible to this login)`,
    accountsExpired: "Your Facebook login has expired. Log in again to continue.",
    accountsUnavailableRetry: "Couldn't load your ad accounts right now.",
    tryAgain: "Try again",
    accountStatus: (status: number) => {
      const s: Record<number, string> = {
        2: "disabled", 3: "unsettled", 7: "risk review", 8: "pending settlement",
        9: "grace period", 100: "closing", 101: "closed",
      };
      return s[status] ?? "inactive";
    },
    noAccounts: "This Facebook login has no ad accounts. Log in with the account that manages your ads, or paste a token below.",
    accountsUnavailable: (reason: string) => `The ad account list could not be fetched (${reason}). Enter the ID by hand below.`,
    pickAccountReminder: "Almost done — pick the ad account and save. Until then ad spend is not fetched.",
    disconnectButton: "Disconnect Meta",
    disconnectHelp: "Removes the token and the ad account. Cached ad spend is deleted.",
    disconnected: "Meta was disconnected.",
    unknownError: "Something went wrong. Reload the page and try again.",
    manualTitle: "Paste a token by hand instead",
    manualBody: "For system users or if the login above does not work for you.",
  },

  /* Popup-fönstret för Logga in med Facebook — renderas utanför Shopify. */
  metaLogin: {
    startTitle: "Log in with Facebook",
    redirecting: "Sending you to Facebook…",
    doneTitle: "Connected",
    doneBody: (name: string | null, shop: string) =>
      (name ? `Logged in as ${name}` : "Logged in") +
      ` — the store ${shop} can now read your ad spend. ` +
      "Go back to Settings and pick your ad account. This window closes by itself.",
    doneBodyAccount: (name: string | null, shop: string, account: string) =>
      (name ? `Logged in as ${name}` : "Logged in") +
      ` — the store ${shop} now reads ad spend from ${account}. You're done. This window closes by itself.`,
    closeWindow: "Close this window",
    errorTitle: "The login did not go through",
    expired: "The link has expired or was already used. Close this window and click the button again.",
    wrongBrowser: "This window was not opened from the app. Close it and click the button in Settings again.",
    cancelled: "You cancelled on Facebook. Nothing was changed. Close this window and try again when you want to connect.",
    declined: "You didn't allow access to your ads. Nothing was changed. Log in again and keep “Ads” allowed.",
    noAccounts:
      "This Facebook account has no ad accounts, so nothing was saved. Log in with the Facebook account that manages your ads.",
    accountNotVisible: (id: string) =>
      `This Facebook account can't see the ad account ${id} that the store already uses. Nothing was changed. ` +
      "Log in with the account that manages that ad account, or pick another account under Settings first.",
    metaFailed: (reason: string) => `Facebook did not accept the login: ${reason}. Close this window and try again.`,
    noCode: "Facebook returned no authorization code. The login configuration in the Meta app must use response type “code”.",
    notConfigured: "Facebook login is not set up on this server.",
    hostMismatch: (served: string, configured: string) =>
      `The app is served from ${served} but the server's SHOPIFY_APP_URL is ${configured}. The Facebook login only works when they match — fix the variable on the server.`,
  },

  group: {
    noCachedData: "figures are being fetched — the total fills in automatically",
    refreshFailed:
      "couldn't fetch this store's data — open its dashboard once; its access may need to be renewed",
    spendUnavailable:
      "ad spend could not be fetched — excluded so the total isn't overstated",
    loginExpired:
      "the Facebook login has expired — open that store's Settings and log in again; excluded until then",
    accountNotChosen:
      "Meta is connected but no ad account is chosen — open that store's Settings and pick one; excluded until then",
    loginExpiresSoon: (days: number) =>
      days <= 0
        ? "the Facebook login expires today — open that store's Settings and log in again"
        : `the Facebook login expires in ${days} ${days === 1 ? "day" : "days"} — open that store's Settings and log in again`,
    notesTitle: "Needs attention in another store",
    fxUnavailable: (from: string, to: string) => `exchange rate ${from}→${to} could not be fetched`,
    fxNote: (day: string) =>
      `Each day is converted at that day's ECB exchange rate. Latest rate: ${day}.`,
  },

  tips: {
    title: "Tips for what's lagging",
    intro: "Rules based on published benchmarks — the source is shown under each tip. Only shown when your own numbers support them.",
    source: "Source",
    severity: { critical: "Critical", warning: "Watch", info: "Idea", good: "Strength" },
  },

  juicy: {
    titleA: "Your costs are already here",
    bodyA: (have: number, total: number) =>
      `${have} of ${total} variants have a cost in Shopify — StonePNL is already using them. Nothing to import.`,
    noteA: "Check that the cost is goods + shipping without duty. Duty is per order in Settings.",
    ctaA: "Looks right",
    ctaA2: "Add bundle costs from Juicy",
    titleB: "Coming from Juicy?",
    bodyB:
      "Export your costs from Juicy and drop the file in the import box below. Titles, bundle costs and cost history come along. " +
      "No export in Juicy? Open Juicy's cost page, select the table, copy it and paste it into the text field below.",
    ctaB: "Go to import",
  },

  ltv: {
    title: "Customer value (LTV)",
    subtitle: (customers: number, orders: number) => `${customers} customers · ${orders} orders · all time`,
    loading: "Reading the order history — the first time can take a minute.",
    fatalTitle: "Customer value could not be calculated",
    // Lås
    lockedTitle: "What is a customer worth — not just the first order?",
    lockedBody:
      "Customer value follows each acquisition cohort month by month: how much the people who bought first in January have spent since, " +
      "and how much August's buyers will likely spend — based on your own customers, not industry averages.",
    lockedBullets: [
      "LTV at 30/60/90/180 days per cohort, observed and forecast clearly separated",
      "Repeat rate, orders per customer and value per customer, with confidence ranges",
      "Max CPA based on customer value instead of the first order",
      "Locked to real data — small cohorts show \"too little data\", never a number",
    ],
    upgrade: "Upgrade to Pro",
    upgradeHint: "Opens Shopify's plan page. Pro is Standard + customer value.",
    refreshPlan: "I upgraded — refresh",
    planUnknownTitle: "Your plan could not be read",
    planUnknownBody: (err: string) => `Shopify did not answer the plan check (${err}). Showing the locked view until it does — press refresh to try again.`,
    standardPreview: "On Standard you can see the data maturity meter and repeat rate below. Curve, cohort table and LTV-based max CPA are part of Pro.",
    // Datakvalitet
    dataTitle: "Data quality",
    dataRange: (from: string, to: string) => `Orders with customer from ${from} to ${to}.`,
    dataNone: "No orders with customer yet.",
    guestShare: (pct: string) => `${pct} of orders have no customer (guest checkout) — counted as one-time buyers.`,
    refundNote: "Refunds are booked on the order's day, as in the dashboard.",
    backfillRunning: "Fetching order history in the background — reload in a minute.",
    backfillDone: (when: string) => `History last fetched ${when}.`,
    backfillError: (err: string) => `History fetch failed: ${err}`,
    scopeMissing:
      "The app does not yet have permission to read customer IDs (read_customers). Open the app again after the new permissions are approved in Shopify — you will be asked to accept them.",
    tbMissing: (pct: string) => `${pct} of first orders lack a product cost, so contribution-margin LTV is based on the rest.`,
    // Tal
    kpiLtv: (h: number) => `${h}-day customer value`,
    kpiMaxCpa: (h: number) => `Max CPA (${h}-day LTV)`,
    kpiCpaNew: "CPA per new customer (30 d)",
    kpiRepeat: "Repeat rate",
    kpiRepeatSub: "customers with two or more orders",
    firstOrderMaxCpa: (v: string) => `first-order max CPA ${v}`,
    range: (low: string, high: string) => `${low}–${high}`,
    confidence: { good: "● Good confidence", low: "◐ Low confidence", hidden: "○ Too uncertain to show" },
    notEnough: "Not enough data yet",
    verdictUnder: (cpa: string, max: string, h: number) => `Your CPA (${cpa}) is under the ${h}-day max CPA (${max}): profitable within ${h} days.`,
    verdictOver: (cpa: string, max: string, h: number) => `Your CPA (${cpa}) is over the ${h}-day max CPA (${max}): customers do not pay back within ${h} days.`,
    verdictNoCpa: "Connect Meta and fetch 30 days of ad spend to compare CPA against customer value.",
    horizonLabel: "Horizon that drives max CPA",
    horizonHelp: "Days after the first order. 90 is the default for dropshipping.",
    daysUnit: (d: number) => `${d} days`,
    // Kurva
    curveTitle: "Customer value per customer",
    curveBody: "Cumulative net revenue (and contribution margin) per customer at 30/60/90/180 days after the first order, from the pool of mature cohorts.",
    curveRevenue: "Revenue",
    curveTb: "Contribution margin",
    curveEst: "est.",
    borrowedNote: (n: number, customers: number, h: number) =>
      `Repeat behaviour for cohorts younger than ${h} days is borrowed from your ${n} mature cohorts (${customers} customers).`,
    // Mognad
    maturityTitle: "Data maturity",
    maturityBody: "What is needed before the next horizon can be shown. Thresholds are absolute, not relative to your store.",
    needCohorts: (have: number, need: number) => `mature cohorts ${have}/${need}`,
    needCustomers: (have: number, need: number) => `customers observed ${have}/${need}`,
    needRepeats: (have: number, need: number) => `repeat orders ${have}/${need}`,
    needHistory: (h: number) => `needs order history beyond ${h} days — read_all_orders pending or still collecting`,
    ready: "ready",
    // Tabell
    tableTitle: "Cohorts",
    thCohort: "Cohort",
    thCustomers: "Customers",
    thAov1: "First order",
    thRepeat: (h: number) => `Repeat ${h}d`,
    thLtv: (h: number) => `LTV ${h}d`,
    thLtvTb: (h: number) => `CM-LTV ${h}d`,
    tooSmall: (n: number) => `N too small (${n})`,
    observedFor: (days: number, h: number) => `observed for ${days} of ${h} days`,
    tableNote: "Italic with est. = forecast (borrowed repeat behaviour, own first-order value). — = not observed yet. Rows under 50 customers show no figures.",
    saveHorizon: "Save",
    saved: "Saved.",
  },
};

export type Texts = typeof en;

const sv: Texts = {
  nav: {
    profit: "Vinst",
    costs: "Kostnader",
    fixedCosts: "Fasta kostnader",
    stores: "Butiker",
    ltv: "Kundvärde (LTV)",
    settings: "Inställningar",
  },

  dashboard: {
    title: "Vinst",
    loadingOrders: "Hämtar ordrar",
    loadingText:
      "Hämtar ordrar från Shopify — 30-dagarsvyn läser hela orderhistoriken och kan ta upp till en halv minut.",
    fatalTitle: "Panelen kunde inte hämta data",
    unknownError: "okänt fel",
    fatalHelp: "Skicka en skärmbild av det här meddelandet — det pekar ut exakt var det stannar.",
    refresh: "Uppdatera",
    ranges: {
      today: "Idag",
      yesterday: "Igår",
      d7: "7 dagar",
      d30: "30 dagar",
      d90: "90 dagar",
    },
    updatedAgo: (min: number, refreshing: boolean) =>
      `Siffrorna uppdaterades för ${min} min sedan${
        refreshing ? " — ny hämtning pågår i bakgrunden, ladda om strax" : ""
      }.`,
    combineStores: (n: number) => `Summera alla ${n} butiker`,
    combineHelp: (currency: string) =>
      `Räknar ihop alla ihopkopplade butiker till en kalkyl i ${currency}, med dagskurs.`,
    thStore: "Butik",
    thCurrency: "Säljer i",
    thSales: "Försäljning",
    thAds: "Annonser",
    thNetProfit: "Nettovinst",
    missingStores: (n: number) => `${n} butik(er) är inte med i summan`,

    setup: {
      title: "Kom igång 🚀",
      progress: (done: number, total: number) => `${done} av ${total} klart`,
      intro: "Panelen räknar redan — men den blir sann först när de här fyra är ifyllda.",
      stepCosts: "Lägg in inköpspriser",
      costsHintNoOrders: "Inga ordrar i perioden än. Steget kvitteras när sålda produkter har inköpspris.",
      costsHintMissing: (n: number) => `${n} sålda enheter saknar inköpspris och räknas som gratis.`,
      costsHintDone: "Alla sålda enheter har inköpspris.",
      ctaCosts: "Till Kostnader",
      stepMeta: "Koppla annonskontot",
      metaHintDone: "Annonskostnaden hämtas automatiskt varje dag.",
      metaHintTodo: "Utan koppling räknas annonskostnaden som noll och vinsten blir för hög.",
      metaHintPending: "Inloggad med Facebook — välj annonskonto under Inställningar för att bli klar.",
      metaHintPendingManual: "En token är sparad — fyll i annonskonto-ID under Inställningar för att bli klar.",
      metaHintBroken: "Kopplad, men annonskostnaden går inte att hämta just nu — se meddelandet nedan och logga in igen om det står så.",
      ctaPickAccount: "Välj annonskonto",
      ctaSettings: "Till Inställningar",
      stepFixed: "Fyll i fasta månadskostnader",
      fixedHintDone: "Dras från nettovinsten, utslagna per dag.",
      fixedHintTodo: "Abonnemang, appar, anställda — allt som kostar oavsett försäljning.",
      ctaFixed: "Visa alla",
      stepSettings: "Granska tull och transaktionsavgift",
      settingsHintDone: "Sparat för den här butiken.",
      settingsHintTodo: (tariff: string, currency: string) =>
        `Kör fortfarande på standardvärdena (${tariff} ${currency} per order, 2,9 %). Stämmer de för den här butiken?`,
      dismiss: "Dölj checklistan",
    },

    quickAdd: {
      nameLabel: "Namn",
      namePlaceholder: "t.ex. Shopify-abonnemang",
      amountLabel: "Kr/månad",
      amountPlaceholder: "kr/månad",
      amountSuffix: "kr/mån",
      add: "Lägg till",
    },

    kpi: {
      sales: "Försäljning",
      orders: "Ordrar",
      fixedCosts: "Fasta kostnader",
      adSpend: "Annonskostnad",
      cogs: "COGS",
      duty: "Tull",
      mer: "MER",
      netProfit: "Nettovinst",
      shippingOfWhich: (s: string) => `varav frakt ${s}`,
      avgOrder: (s: string) => `snittorder ${s}`,
      perDay: "utslagna per dag",
      cpa: (s: string) => `CPA ${s}`,
      missingDays: (n: number) => `⚠ saknas ${n} dagar`,
      unitsNoCost: (n: number) => `${n} enheter utan kostnad`,
      allUnitsCovered: "alla enheter täckta",
      ordersCount: (s: string) => `${s} ordrar`,
      breakEven: (s: string) => `break-even ${s}`,
      maxCpa: (pct: number, s: string) => `max CPA @ ${pct} %: ${s}`,
      profitTooHigh: "för hög — annonsdata saknas",
      vsPrev: "vs förra",
    },

    /* Annonskostnadens fel, per kod från meta.server — EN banner per läge. */
    spendErrors: {
      "no-connection": "Meta är inte kopplat — annonskostnaden saknas, så vinsten blir för hög.",
      "no-account": "Inloggad med Facebook, men inget annonskonto valt än. Annonskostnaden hämtas inte förrän du valt ett.",
      "no-account-manual": "En Meta-token är sparad, men inget annonskonto valt än. Annonskostnaden hämtas inte förrän du fyllt i ett under Inställningar.",
      expired: "Meta-kopplingen har gått ut — annonskostnaden hämtas inte längre. Förnya den under Inställningar.",
      retrying: "Annonskostnaden gick inte att hämta just nu — nytt försök om några minuter.",
      "fetch-failed": (reason: string) => `Kunde inte hämta annonskostnaden: ${reason}`,
    },
    fxTitle: "Annonskostnaden kunde inte räknas om",
    fxBody: (spendCur: string, shopCur: string) =>
      `Annonskontot redovisar i ${spendCur}, butiken i ${shopCur}, och växelkursen gick inte att hämta just nu. ` +
      `Beloppen räknas därför ihop som om de vore samma valuta — nettovinst, MER och CPA stämmer inte förrän kursen är tillgänglig igen. Ladda om om en stund.`,
    convertedNote: (from: string, to: string) =>
      `Annonskostnaden betalas i ${from} och räknas om till ${to} med kursen för respektive dag.`,
    spendMissingTitle: "Täckningsbidraget är för högt",
    spendMissingBody: (days: string) =>
      `Annonskostnad saknas för ${days}. De dagarna räknas som noll i annonskostnad, vilket gör vinsten missvisande.`,
    costMissingTitle: "Kostnad saknas",
    costMissingBody: (n: number) =>
      `${n} sålda enheter har ingen inköpskostnad i Shopify. De räknas som gratis, så COGS är för låg och vinsten för hög. Fyll i under Kostnader.`,
    cogsChange: (note: string) => `COGS: ${note}.`,
    cogsChangeWeighted: (note: string, newPct: number, oldPct: number) =>
      `COGS: ${note} — perioden spänner över brytdatumet, kostnaden är vägd ${newPct} % ny / ${oldPct} % gammal efter omsättning per dag.`,

    visualTitle: "Visuell uppdelning",
    detailTitle: "Detaljerad uppdelning",
    revenue: "Omsättning",
    productCost: "Produktkostnad",
    ads: "Annonser",
    txFees: "Transaktionsavgifter",
    grossProfit: "Bruttovinst",
    ofRevenue: "av omsättningen",
    donutAria: "Fördelning av omsättningen",
    profitPerDay: "Vinst per dag",
    profitPerDayNote: "COGS, avgifter och tull fördelade per dags omsättning — uppskattning, inte bokföring.",
    tipSales: "Försäljning",
    tipAds: "Annonser",
    tipProfit: "Vinst",

    thProduct: "Produkt",
    thUnits: "Enheter",
    thNet: "Netto",
    thCogs: "COGS",
    thCm: "TB",
    thMargin: "Marginal",
    thMultiple: "Multipel",
    missing: "saknas",
  },

  costs: {
    title: "Kostnader",
    subtitle: (have: number, total: number) => `${have} av ${total} varianter har inköpspris`,
    missingBannerTitle: (n: number) => `${n} varianter saknar inköpspris`,
    missingBannerBody: "Utan inköpspris räknas produkten som gratis och vinsten blir för hög.",
    allHaveCost: "Alla varianter har inköpspris.",
    sopTitle: "Så här gör du 📋",
    sop1: "Ladda ner mallen nedan — den innehåller butikens alla produkter med rätt titlar.",
    sop2: "Fyll i kostnadskolumnen. Filen går att skicka vidare till leverantören, bokföringen eller en AI som fyller i den åt dig.",
    sop3: "Släpp tillbaka filen här. Alla kostnader skrivs till Shopify på en gång.",
    sop4:
      "Klicka på en produkt i listan längst ner för att lägga till daterade poster — vara och frakt var för sig, med datumet de började gälla. " +
      "Ändras ett pris lägger du till en ny post istället för att skriva över, så förblir gammal statistik sann.",
    importTitle: "Importera inköpspriser",
    importBody:
      "Ladda ner mallen — den innehåller butikens exakta produkttitlar. Fyll i kostnadskolumnen, eller skicka filen vidare till den som " +
      "sitter på inköpspriserna, och släpp den tillbaka här. Kostnaden är vara + frakt utan tull; tullen är per order och ligger i Inställningar.",
    downloadTemplate: "⬇ Ladda ner mall med dina produkter",
    showAsText: "eller visa som text",
    hideTemplate: "Dölj mallen",
    templateLabel: "Mall att kopiera",
    templateHelp: "Markera allt och kopiera om nedladdningen blockeras av webbläsaren.",
    tpl1: "# Inköpspriser — produkttitel;varianttitel;kostnad;försäljningspris",
    tpl2: "# Fyll i KOSTNAD (tredje kolumnen). Priset sist är bara referens och ignoreras vid import.",
    tpl3: "# Kostnaden är vara + frakt, UTAN tull. Tullen är per order och ligger i Inställningar.",
    tpl4: "# Lämna varianttiteln tom för att sätta samma kostnad på alla varianter.",
    tpl5: "# Ändra inte titlarna — de matchas mot butiken.",
    tpl6: "# Flerpack: skriv kostnaden för 1, 2 och 3 st med | emellan — t.ex. 88.34|134.22|180.19 (totalt för hela antalet).",
    pastedText: "Inklistrad text",
    dropReady: (n: number) => `${n} rader redo att skrivas`,
    chooseFile: "Välj CSV-fil",
    dragHint: "eller dra filen hit",
    pasteLabel: "…eller klistra in raderna direkt",
    pastePlaceholder: "Marin Motorhölje 420D – Universellt Skydd;Svart / 40 - 60 hk;81.92\nStrandtofflor för Herr – Halkfria Trädgårdsskor;;148.42",
    effectiveFromLabel: "Gäller från (valfritt)",
    effectiveFromHelp:
      "Sätts ett datum sparas ändringen i historiken, så att perioder före datumet räknas på den gamla kostnaden. " +
      "Släpp in en ny version av filen när priserna ändras och sätt datumet då de började gälla.",
    writeToShopify: "Skriv till Shopify",
    thProduct: "Produkt",
    thVariant: "Variant",
    thPrice: "Pris",
    thCost: "Inköp",
    thCmPerUnit: (currency: string) => `TB/st (${currency})`,
    thBeRoas: "BE ROAS",
    missingBadge: "saknas",
    unprofitable: "olönsam",
    firstRowParsed: (s: string) => ` Första raden tolkades som: ${s}`,
    noValidRows: (sample: string) => `Hittade inga giltiga rader i CSV:n.${sample}`,
    updatedMsg: (applied: number, skipped: number, names: string) =>
      `${applied} varianter uppdaterade.` + (skipped ? ` ${skipped} hoppades över: ${names}` : ""),
    costNote: (date: string) => `ny kostnad från ${date}`,
    bundleHint:
      "Flerpack: två eller tre stycken i samma orderrad kostar oftast mindre än två eller tre gånger styckpriset, eftersom frakten delas. " +
      "Skriv kostnaderna med | emellan i kostnadskolumnen (1|2|3 st), eller klicka på en produkt nedan och lägg in dem under Kostnad per antal.",
  },

  costDetail: {
    subtitle: "Inköpspris per enhet — vara och frakt var för sig",
    newEntry: "Ny post",
    newEntryBody:
      "Skriv in vad varan och frakten kostar från och med ett visst datum. Perioder före datumet räknas fortfarande på den gamla kostnaden, " +
      "så gammal statistik förblir sann.",
    productCostLabel: "Produktpris",
    shippingLabel: "Frakt",
    effectiveFrom: "Gäller från",
    appliesTo: "Gäller",
    allVariants: (n: number) => `Alla ${n} varianter`,
    totalBanner: (total: string, goods: string, shipping: string) =>
      `Total inköpskostnad: ${total} per enhet — ${goods} vara + ${shipping} frakt. Tullen ligger per order i Inställningar och ska inte in här.`,
    totalBannerEmpty: "Totalen visas här när du fyllt i båda fälten. Tull ska inte ingå — den räknas per order.",
    saveEntry: "Spara post",
    currentCost: "Nuvarande kostnad i Shopify",
    thVariant: "Variant",
    thPrice: "Pris",
    thCost: "Inköp",
    thMultiple: "Multipel",
    missingBadge: "saknas",
    history: "Historik",
    thEffectiveFrom: "Gäller från",
    thApplies: "Gäller",
    thGoods: "Vara",
    thShipping: "Frakt",
    thTotal: "Totalt",
    aVariant: "en variant",
    allVariantsShort: "alla varianter",
    remove: "Ta bort",
    emptyHistory:
      "Inga daterade poster än. Kostnaden som ligger i Shopify gäller då hela perioden. " +
      "Lägg till en post när priset ändras, så räknas gamla perioder på gamla priset.",
    backLink: "← Tillbaka till alla kostnader",
    entryDeleted: "Posten togs bort. Nuvarande kostnad i Shopify är oförändrad.",
    fillBoth: "Fyll i både produktpris och frakt.",
    enterDate: "Ange från vilket datum kostnaden gäller.",
    savedPartial: (list: string) => `Posten sparades, men kostnaden kunde inte skrivas till Shopify för: ${list}`,
    saved: (n: number, total: string, date: string) => `Sparat. ${n} variant(er) kostar nu ${total} från och med ${date}.`,
    costNote: (goods: string, shipping: string) => `vara ${goods} + frakt ${shipping}`,
    tiersTitle: "Kostnad per antal (flerpack)",
    tiersBody:
      "Vad leverantören tar totalt när 2 eller 3 stycken skickas i samma order. Ett styck är kostnaden i Shopify ovan. " +
      "Orderrader med ett antal som saknar post räknas från närmaste lägre antal plus marginalkostnaden.",
    tierUnits: "Antal",
    tierTotal: "Total kostnad",
    tierAdd: "Lägg till kostnad",
    tierSaved: (n: number, units: number, total: string) => `Sparat. ${n} variant(er): ${units} st kostar ${total} totalt.`,
    tierInvalid: "Ange ett antal på minst 2 och en total kostnad.",
    tierDeleted: "Antalskostnaden togs bort.",
    thUnits: "Antal",
    thPerUnit: "Per styck",
    tiersEmpty: "Inga antalskostnader än. Varje enhet räknas på styckpriset i Shopify.",
    oneUnit: "1 (Shopify)",
  },

  fixed: {
    title: "Fasta kostnader",
    subtitle: (monthly: string, daily: string) => `${monthly} kr/månad → ${daily} kr/dag i kalkylen`,
    addTitle: "Lägg till kostnad",
    addBody:
      "Abonnemang, appar, anställda, bokföring — allt som kostar per månad oavsett försäljning. " +
      "Summan slås ut per dag och dras från nettovinsten.",
    nameLabel: "Namn",
    namePlaceholder: "t.ex. Shopify-abonnemang",
    amountLabel: "Kostnad (kr/månad)",
    amountPlaceholder: "299",
    add: "Lägg till",
    thName: "Namn",
    thMonthly: "Kr/månad",
    thDaily: "Kr/dag",
    remove: "Ta bort",
    totalRows: (n: number) => `${n} poster`,
    empty: "Inga fasta kostnader inlagda än. Nettovinsten räknas utan dem tills du lägger till några.",
    errInvalid: "Ange ett namn och en kostnad i kronor per månad.",
    suggestTitle: "Vanliga månadskostnader",
    suggestBody:
      "De små abonnemangen är de som aldrig hamnar i kalkylen. Klicka på ett för att fylla i formuläret — justera beloppet till vad du faktiskt betalar och tryck Lägg till.",
    yourPlan: "din plan",
    unverified: "listpris ur minnet — kontrollera",
    converted: (cur: string, rate: string, date: string) => `USD-belopp omräknade till ${cur} med kurs ${rate} (ECB, ${date}).`,
    notConverted: "Växelkursen gick inte att hämta just nu — USD-belopp visas i USD; skriv beloppet i din valuta.",
    forgotTitle: "Har du glömt …?",
    forgotBody: "Inga kostnader inlagda i de här kategorierna än. De flesta butiker har minst en i varje:",
    categories: {
      shopify: "Shopify & plan",
      ai: "AI-verktyg",
      verktyg: "Verktyg & program",
      marknadsforing: "Marknadsföring",
      appar: "Shopify-appar",
      hosting: "Hosting & domäner",
      ekonomi: "Bokföring, bank, försäkring",
      personal: "Personal & frilansare",
    },
  },

  stores: {
    title: "Butiker",
    subtitleLinked: (n: number) => `${n} butiker ihopkopplade — summera dem på Vinst-sidan`,
    subtitleUnlinked: "Koppla ihop dina butiker för att se dem i en gemensam kalkyl",
    thStore: "Butik",
    thCurrency: "Säljer i",
    thisOne: "den här",
    addTitle: "Lägg till en butik",
    addBody:
      "Gör så här: skapa en kod här, öppna appen i nästa butik, gå till Butiker och lös in koden där. " +
      "Samma kod fungerar i alla butiker du hinner med på 30 minuter — skapa en, lös in den i tur och ordning. " +
      "Koden är enda beviset på att butikerna är dina, därför kopplas ingenting ihop automatiskt.",
    createCode: "Skapa kod",
    redeemTitle: "…eller lös in en kod härifrån",
    codeLabel: "Kod",
    link: "Koppla ihop",
    unlinkTitle: "Koppla loss",
    unlinkBody: "Tar bort den här butiken ur gruppen. Ingen data raderas — bara den gemensamma vyn slutar visa den.",
    unlinkButton: "Koppla loss den här butiken",
    codeCreated: (code: string, min: number) => `Kod skapad: ${code}. Giltig i ${min} minuter.`,
    codeInvalid: "Koden gäller inte längre. Skapa en ny — koden går ut efter 30 minuter.",
    codeOwn: "Koden skapades i den här butiken. Lös in den i en annan.",
    merged: (n: number) => `${n} butiker slogs ihop med gruppen. `,
    added: "Butiken är tillagd. ",
    nowLinked: (total: number) =>
      `${total} butiker är nu ihopkopplade. Koden fungerar i fler butiker tills den går ut — lös in den i nästa direkt.`,
    unlinked: "Butiken är frånkopplad. Ingen data raderades.",
    unknownAction: "Okänd åtgärd.",
  },

  settings: {
    title: "Inställningar",
    languageLabel: "Language / Språk",
    costsPerOrder: "Kostnader per order",
    tariffLabel: (currency: string) => `Tull per order (${currency})`,
    tariffHelp: "Tas ut en gång per order, inte per styck. Det är därför bundles har bättre marginal.",
    feeLabel: "Transaktionsavgift (%)",
    feeHelp: "Andel av totalt ordervärde. Shopify Payments ligger typiskt kring 2,9 %.",
    marginLabel: "Målmarginal (%)",
    marginHelp: "Max-CPA på panelen räknas mot den här marginalen.",
    metaTitle: "Meta",
    adAccountLabel: "Annonskonto-ID",
    adAccountHelp: "Siffrorna, med eller utan act_-prefix.",
    tokenLabel: "Access token",
    tokenHelpSaved: "En token är sparad. Lämna tomt för att behålla den.",
    tokenHelpEmpty: "Long-lived token från developers.facebook.com. Utan den visas ingen annonskostnad.",
    metaBanner:
      "Utan Meta-koppling visas försäljning och COGS som vanligt, men täckningsbidraget flaggas som ofullständigt " +
      "istället för att räknas som om annonskostnaden vore noll.",
    encryptedNote: "🔒 Token krypteras innan den sparas.",
    unencryptedTitle: "Token sparas okrypterad",
    unencryptedBody:
      "Miljövariabeln TOKEN_ENCRYPTION_KEY är inte satt på den här servern, så token lagras i klartext. " +
      "Sätt den innan appen används av andra än dig — det är någon annans annonskonto som ligger i databasen.",
    save: "Spara",
    saved: "Sparat.",

    /* Logga in med Facebook */
    loginButton: "Logga in med Facebook",
    reconnectButton: "Logga in igen",
    loginHelp: "Öppnar Facebook i ett nytt fönster. Godkänn läsåtkomst till dina annonser och välj sedan annonskonto nedan.",
    loginOpening: "Öppnar Facebook…",
    loginPopupBlocked: "Webbläsaren stoppade fönstret. Använd länken nedan i stället.",
    loginOpenLink: "Öppna Facebook-inloggningen i en ny flik",
    loginWaiting: "Väntar på Facebook-fönstret… Gör klart inloggningen där; den här sidan uppdateras av sig själv.",
    loginFailed: "Inloggningen kunde inte startas. Ladda om sidan och försök igen.",
    connectedAs: (name: string) => `Inloggad som ${name}.`,
    connectedManual: "Kopplad med en inklistrad token.",
    expiresSoon: (days: number) =>
      days <= 0
        ? "Facebook-inloggningen går ut idag — logga in igen så att annonskostnaden fortsätter komma in."
        : `Facebook-inloggningen går ut om ${days} ${days === 1 ? "dag" : "dagar"} — logga in igen så att annonskostnaden fortsätter komma in.`,
    expiredTitle: "Facebook-inloggningen har gått ut",
    expiredBody: "Annonskostnaden hämtas inte längre. Logga in igen för att fortsätta.",
    expiredTitleManual: "Meta-token har gått ut",
    expiredBodyManual: "Annonskostnaden hämtas inte längre. Klistra in en ny token nedan för att fortsätta.",
    loginCancelled: "Inloggningen avbröts — inget ändrades.",
    loginDeclined: "Du gav inte tillgång till dina annonser — inget ändrades. Logga in igen och låt ”Annonser” vara ibockat.",
    loginNoAccounts: "Det Facebook-kontot har inga annonskonton — inget ändrades. Logga in med kontot som sköter dina annonser.",
    loginAccountNotVisible: "Det Facebook-kontot ser inte det sparade annonskontot — inget ändrades.",
    loginMetaFailed: "Facebook godkände inte inloggningen — inget ändrades. Försök igen.",
    loginNothingBack:
      "Inget svar kom från Facebook. Försök igen — visade Facebook ”appen är inte tillgänglig” är appen inte godkänd för ditt Facebook-konto än; klistra in en token för hand i stället.",
    accountSelectLabel: "Annonskonto",
    accountSelectPlaceholder: "Välj annonskonto…",
    accountSelectHelp: "Kontona din Facebook-inloggning kan se. Annonskostnaden läses från det du väljer — sparas så fort du valt.",
    accountSaved: (name: string) => `Sparat — annonskostnaden läses nu från ${name}.`,
    accountNotInList: (id: string) => `${id} (sparat, men syns inte för den här inloggningen)`,
    accountsExpired: "Facebook-inloggningen har gått ut. Logga in igen för att fortsätta.",
    accountsUnavailableRetry: "Kunde inte hämta dina annonskonton just nu.",
    tryAgain: "Försök igen",
    accountStatus: (status: number) => {
      const s: Record<number, string> = {
        2: "avstängt", 3: "obetalt", 7: "riskgranskning", 8: "väntar på betalning",
        9: "respit", 100: "stängs", 101: "stängt",
      };
      return s[status] ?? "inaktivt";
    },
    noAccounts: "Den här Facebook-inloggningen har inga annonskonton. Logga in med kontot som sköter dina annonser, eller klistra in en token nedan.",
    accountsUnavailable: (reason: string) => `Listan över annonskonton gick inte att hämta (${reason}). Skriv in ID:t för hand nedan.`,
    pickAccountReminder: "Nästan klart — välj annonskonto och spara. Tills dess hämtas ingen annonskostnad.",
    disconnectButton: "Koppla bort Meta",
    disconnectHelp: "Tar bort token och annonskonto. Cachad annonskostnad raderas.",
    disconnected: "Meta kopplades bort.",
    unknownError: "Något gick fel. Ladda om sidan och försök igen.",
    manualTitle: "Klistra in en token för hand i stället",
    manualBody: "För systemanvändare, eller om inloggningen ovan inte fungerar för dig.",
  },

  /* Popup-fönstret för Logga in med Facebook — renderas utanför Shopify. */
  metaLogin: {
    startTitle: "Logga in med Facebook",
    redirecting: "Skickar dig till Facebook…",
    doneTitle: "Kopplat",
    doneBody: (name: string | null, shop: string) =>
      (name ? `Inloggad som ${name}` : "Inloggad") +
      ` — butiken ${shop} kan nu läsa din annonskostnad. ` +
      "Gå tillbaka till Inställningar och välj annonskonto. Fönstret stängs av sig självt.",
    doneBodyAccount: (name: string | null, shop: string, account: string) =>
      (name ? `Inloggad som ${name}` : "Inloggad") +
      ` — butiken ${shop} läser nu annonskostnaden från ${account}. Klart. Fönstret stängs av sig självt.`,
    closeWindow: "Stäng fönstret",
    errorTitle: "Inloggningen gick inte igenom",
    expired: "Länken har gått ut eller är redan använd. Stäng fönstret och klicka på knappen igen.",
    wrongBrowser: "Fönstret öppnades inte från appen. Stäng det och klicka på knappen i Inställningar igen.",
    cancelled: "Du avbröt hos Facebook. Inget ändrades. Stäng fönstret och försök igen när du vill koppla.",
    declined: "Du gav inte tillgång till dina annonser. Inget ändrades. Logga in igen och låt ”Annonser” vara ibockat.",
    noAccounts:
      "Det här Facebook-kontot har inga annonskonton, så inget sparades. Logga in med Facebook-kontot som sköter dina annonser.",
    accountNotVisible: (id: string) =>
      `Det här Facebook-kontot ser inte annonskontot ${id} som butiken redan använder. Inget ändrades. ` +
      "Logga in med kontot som sköter det annonskontot, eller välj ett annat konto under Inställningar först.",
    metaFailed: (reason: string) => `Facebook godkände inte inloggningen: ${reason}. Stäng fönstret och försök igen.`,
    noCode: "Facebook skickade ingen auktoriseringskod. Inloggningskonfigurationen i Meta-appen måste använda svarstypen ”code”.",
    notConfigured: "Facebook-inloggning är inte uppsatt på den här servern.",
    hostMismatch: (served: string, configured: string) =>
      `Appen visas från ${served} men serverns SHOPIFY_APP_URL är ${configured}. Facebook-inloggningen fungerar bara när de är samma — rätta variabeln på servern.`,
  },

  group: {
    noCachedData: "siffrorna hämtas just nu — summan fylls på automatiskt",
    refreshFailed:
      "butikens siffror gick inte att hämta — öppna dess panel en gång; åtkomsten kan behöva förnyas",
    spendUnavailable:
      "annonskostnaden gick inte att hämta — utesluten så att summan inte blir för hög",
    loginExpired:
      "Facebook-inloggningen har gått ut — öppna den butikens Inställningar och logga in igen; utesluten tills dess",
    accountNotChosen:
      "Meta är kopplat men inget annonskonto är valt — öppna den butikens Inställningar och välj ett; utesluten tills dess",
    loginExpiresSoon: (days: number) =>
      days <= 0
        ? "Facebook-inloggningen går ut idag — öppna den butikens Inställningar och logga in igen"
        : `Facebook-inloggningen går ut om ${days} ${days === 1 ? "dag" : "dagar"} — öppna den butikens Inställningar och logga in igen`,
    notesTitle: "Behöver göras i en annan butik",
    fxUnavailable: (from: string, to: string) => `växelkurs ${from}→${to} kunde inte hämtas`,
    fxNote: (day: string) =>
      `Varje dag räknas om med den dagens ECB-kurs. Senaste kurs: ${day}.`,
  },

  tips: {
    title: "Tips för det som lackar",
    intro: "Regler byggda på publicerade riktvärden — källan står under varje tips. Visas bara när dina egna siffror bär dem.",
    source: "Källa",
    severity: { critical: "Kritiskt", warning: "Bevaka", info: "Idé", good: "Styrka" },
  },

  juicy: {
    titleA: "Dina inköpspriser är redan här",
    bodyA: (have: number, total: number) =>
      `${have} av ${total} varianter har inköpspris i Shopify — StonePNL räknar redan på dem. Inget att importera.`,
    noteA: "Kontrollera att kostnaden är vara + frakt utan tull. Tullen är per order i Inställningar.",
    ctaA: "Ser rätt ut",
    ctaA2: "Lägg till flerpack från Juicy",
    titleB: "Kommer du från Juicy?",
    bodyB:
      "Exportera dina kostnader från Juicy och släpp filen i importrutan nedan. Titlar, flerpack och historik följer med. " +
      "Saknar Juicy export? Öppna Juicys kostnadssida, markera tabellen, kopiera och klistra in i textfältet nedan.",
    ctaB: "Till importen",
  },

  ltv: {
    title: "Kundvärde (LTV)",
    subtitle: (customers: number, orders: number) => `${customers} kunder · ${orders} ordrar · alla tider`,
    loading: "Läser orderhistoriken — första gången kan ta en minut.",
    fatalTitle: "Kundvärdet kunde inte räknas",
    lockedTitle: "Vad är en kund värd — inte bara första köpet?",
    lockedBody:
      "Kundvärde följer varje förvärvskohort månad för månad: hur mycket de som köpte första gången i januari har handlat för sedan dess, " +
      "och hur mycket augustis köpare sannolikt kommer att handla för — räknat på dina egna kunder, inte branschsnitt.",
    lockedBullets: [
      "LTV vid 30/60/90/180 dagar per kohort, observerat och prognos tydligt åtskilda",
      "Återköpsgrad, ordrar per kund och värde per kund, med konfidensspann",
      "Max-CPA räknad på kundvärde i stället för första ordern",
      "Låst på riktig data — små kohorter visas som \"för lite data\", aldrig som en siffra",
    ],
    upgrade: "Uppgradera till Pro",
    upgradeHint: "Öppnar Shopifys plansida. Pro är Standard + kundvärde.",
    refreshPlan: "Jag har uppgraderat — läs om",
    planUnknownTitle: "Planen kunde inte läsas",
    planUnknownBody: (err: string) => `Shopify svarade inte på plankontrollen (${err}). Låst vy visas tills dess — tryck läs om för att försöka igen.`,
    standardPreview: "På Standard ser du mognadsmätaren och återköpsgraden nedan. Kurva, kohorttabell och LTV-baserad max-CPA ingår i Pro.",
    dataTitle: "Datakvalitet",
    dataRange: (from: string, to: string) => `Ordrar med kund från ${from} till ${to}.`,
    dataNone: "Inga ordrar med kund ännu.",
    guestShare: (pct: string) => `${pct} av ordrarna saknar kund (gästkassa) — räknas som engångskunder.`,
    refundNote: "Återbetalningar bokförs på orderns dag, som i panelen.",
    backfillRunning: "Orderhistoriken hämtas i bakgrunden — ladda om om en minut.",
    backfillDone: (when: string) => `Historiken hämtades senast ${when}.`,
    backfillError: (err: string) => `Hämtningen av historiken misslyckades: ${err}`,
    scopeMissing:
      "Appen har ännu inte behörighet att läsa kund-ID (read_customers). Öppna appen igen när de nya behörigheterna är godkända i Shopify — du får då en fråga om att godkänna dem.",
    tbMissing: (pct: string) => `${pct} av första ordrarna saknar inköpspris, så LTV i täckningsbidrag bygger på resten.`,
    kpiLtv: (h: number) => `Kundvärde ${h} dagar`,
    kpiMaxCpa: (h: number) => `Max-CPA (${h}-dagars LTV)`,
    kpiCpaNew: "CPA per ny kund (30 d)",
    kpiRepeat: "Återköpsgrad",
    kpiRepeatSub: "kunder med två eller fler ordrar",
    firstOrderMaxCpa: (v: string) => `max-CPA första ordern ${v}`,
    range: (low: string, high: string) => `${low}–${high}`,
    confidence: { good: "● God säkerhet", low: "◐ Låg säkerhet", hidden: "○ För osäkert att visa" },
    notEnough: "För lite data än",
    verdictUnder: (cpa: string, max: string, h: number) => `Din CPA (${cpa}) är under ${h}-dagars max-CPA (${max}): lönsamt inom ${h} dagar.`,
    verdictOver: (cpa: string, max: string, h: number) => `Din CPA (${cpa}) är över ${h}-dagars max-CPA (${max}): kunderna betalar inte tillbaka inom ${h} dagar.`,
    verdictNoCpa: "Koppla Meta och hämta 30 dagars annonskostnad för att jämföra CPA mot kundvärdet.",
    horizonLabel: "Horisont som styr max-CPA",
    horizonHelp: "Dagar efter första ordern. 90 är standard för dropshipping.",
    daysUnit: (d: number) => `${d} dagar`,
    curveTitle: "Kundvärde per kund",
    curveBody: "Ackumulerad nettointäkt (och täckningsbidrag) per kund vid 30/60/90/180 dagar efter första ordern, ur poolen av mogna kohorter.",
    curveRevenue: "Omsättning",
    curveTb: "Täckningsbidrag",
    curveEst: "prognos",
    borrowedNote: (n: number, customers: number, h: number) =>
      `Återköpsbeteendet för kohorter yngre än ${h} dagar är lånat från dina ${n} mogna kohorter (${customers} kunder).`,
    maturityTitle: "Datamognad",
    maturityBody: "Vad som krävs innan nästa horisont kan visas. Trösklarna är absoluta, inte relativa till butiken.",
    needCohorts: (have: number, need: number) => `mogna kohorter ${have}/${need}`,
    needCustomers: (have: number, need: number) => `observerade kunder ${have}/${need}`,
    needRepeats: (have: number, need: number) => `återköpsordrar ${have}/${need}`,
    needHistory: (h: number) => `kräver orderhistorik bortom ${h} dagar — read_all_orders väntar eller insamling pågår`,
    ready: "klart",
    tableTitle: "Kohorter",
    thCohort: "Kohort",
    thCustomers: "Kunder",
    thAov1: "Första ordern",
    thRepeat: (h: number) => `Återköp ${h}d`,
    thLtv: (h: number) => `LTV ${h}d`,
    thLtvTb: (h: number) => `TB-LTV ${h}d`,
    tooSmall: (n: number) => `N för litet (${n})`,
    observedFor: (days: number, h: number) => `observerat ${days} av ${h} dagar`,
    tableNote: "Kursivt med prognos = lånat återköpsbeteende, eget första-ordervärde. — = inte observerat än. Rader under 50 kunder visar inga tal.",
    saveHorizon: "Spara",
    saved: "Sparat.",
  },
};

export const TEXTS = { en, sv } as const;

/** Slår upp rätt ordbok; okänt värde faller tillbaka på engelska. */
export function t(lang: Lang) {
  return TEXTS[lang] ?? TEXTS.en;
}

/** Normaliserar databasens strängfält till ett giltigt språk. */
export function asLang(v: string | null | undefined): Lang {
  return v === "sv" ? "sv" : "en";
}

/** Talformat följer språket: sv-SE ger mellanslag och kommadecimal. */
export function localeOf(lang: Lang): string {
  return lang === "sv" ? "sv-SE" : "en-US";
}
