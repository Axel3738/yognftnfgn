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
    thCurrency: "Currency",
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
  },

  stores: {
    title: "Stores",
    subtitleLinked: (n: number) => `${n} stores linked — combine them on the Profit page`,
    subtitleUnlinked: "Link your stores to see them in one combined calculation",
    thStore: "Store",
    thCurrency: "Currency",
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
  },

  group: {
    noCachedData: "figures are being fetched in the background — reload in a minute",
    fxUnavailable: (from: string, to: string) => `exchange rate ${from}→${to} could not be fetched`,
  },
};

export type Texts = typeof en;

const sv: Texts = {
  nav: {
    profit: "Vinst",
    costs: "Kostnader",
    fixedCosts: "Fasta kostnader",
    stores: "Butiker",
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
    thCurrency: "Valuta",
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
  },

  stores: {
    title: "Butiker",
    subtitleLinked: (n: number) => `${n} butiker ihopkopplade — summera dem på Vinst-sidan`,
    subtitleUnlinked: "Koppla ihop dina butiker för att se dem i en gemensam kalkyl",
    thStore: "Butik",
    thCurrency: "Valuta",
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
  },

  group: {
    noCachedData: "siffrorna hämtas i bakgrunden — ladda om om en minut",
    fxUnavailable: (from: string, to: string) => `växelkurs ${from}→${to} kunde inte hämtas`,
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
