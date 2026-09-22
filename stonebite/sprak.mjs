// sprak.mjs — sajten på två språk.
//
// CLAUDE.md: "Språket följer läsaren, inte den här filen. Axel svaras på
// svenska, VA:n och redigerarna på engelska." Det gäller sajten också: ett
// system teamet inte förstår kommer de inte att använda, och då spelar det
// ingen roll hur bra bonusprogrammet är.
//
// Så fungerar det:
//   • Ordboken är svenska → engelska, hela meningar (inte nyckelkoder).
//   • Saknas en översättning visas den svenska texten. Sidan går aldrig
//     sönder av en glömd rad — den blir bara svensk på det stället.
//   • Ägare och chef får svenska som standard, alla andra engelska. Var och
//     en kan byta själv på Min sida.

export const SPRAKEN = Object.freeze({ sv: 'Svenska', en: 'English' });

/** Vem läser? Rollen avgör förvalet, kontots eget val vinner alltid. */
export function sprakFor(anvandare) {
  const valt = String(anvandare?.sprak ?? '').trim().toLowerCase();
  if (SPRAKEN[valt]) return valt;
  return ['agare', 'chef'].includes(anvandare?.roll) ? 'sv' : 'en';
}

const ORDBOK = {
  // --- skalet och menyn
  'Översikt': 'Overview',
  'Butiker': 'Stores',
  'Annonser': 'Ads',
  'Produkttest': 'Product testing',
  'Redigerare': 'Editors',
  'Kundtjänst': 'Customer support',
  'Recensioner': 'Reviews',
  'Leverans': 'Delivery',
  'Bonus': 'Bonus',
  'System': 'Systems',
  'Min sida': 'My page',
  'Konton': 'Accounts',
  'Logga ut': 'Log out',
  'Logga in': 'Log in',
  'Meny': 'Menu',
  'Byt mellan ljust och mörkt': 'Switch between light and dark',

  // --- inloggning
  'Interna dashboards för Stonebite Ecom AB.': 'Internal dashboards for Stonebite Ecom AB.',
  'E-post': 'Email',
  'Lösenord': 'Password',
  'Fel e-post eller lösenord.': 'Wrong email or password.',
  'Glömt lösenordet? Be Axel skapa ett nytt åt dig.': 'Forgot your password? Ask Axel to create a new one for you.',
  'Formuläret var för gammalt. Försök igen.': 'The form expired. Please try again.',

  // --- Min sida
  'Inloggad som': 'Logged in as',
  'Dina pengar den här månaden': 'Your money this month',
  'Varje rad går att klicka fram beviset för. Inget betalas utan underlag.':
    'Every line has proof behind it. Nothing is paid without evidence.',
  'Du har inte tjänat något än den här månaden — uppdragen nedan visar hur du gör.':
    'You have not earned anything yet this month — the tasks below show you how.',
  'Intjänat': 'Earned',
  'Betalas ut med lönen.': 'Paid out with your salary.',
  'på väg till dig': 'on its way to you',
  'inget än': 'nothing yet',
  'gång': 'time',
  'gånger': 'times',
  'den här månaden.': 'this month.',
  'Så tjänar du mer': 'How to earn more',
  'Så gör du:': 'How to do it:',
  'Dina bevis': 'Your proof',
  'Varje krona, och vad den kom ifrån.': 'Every dollar, and where it came from.',
  'Hittade du något systemet missade?': 'Did the system miss something?',
  'En Trustpilot-recension som nämner dig, eller en tvist du svarat på. Skicka in den så godkänner din chef — och pengarna dyker upp här.':
    'A Trustpilot review that mentions you, or a dispute you answered. Send it in, your manager approves it — and the money shows up here.',
  'Vad gäller det?': 'What is it about?',
  'Länk eller ordernummer': 'Link or order number',
  'Kort beskrivning': 'Short description',
  'Skicka in': 'Send in',
  'Kunden nämnde mig vid namn': 'The customer mentioned me by name',
  'Systemet läser Judge.me automatiskt. Trustpilot måste rapporteras in tills API-nyckeln finns på plats.':
    'The system reads Judge.me automatically. Trustpilot has to be reported manually until the API key is in place.',
  'Inskickat. Din chef ser det under Bonus och godkänner — sedan syns pengarna här.':
    'Sent. Your manager sees it under Bonus and approves it — then the money shows up here.',
  'Dina inrapporterade insatser': 'What you have reported',
  'godkänd': 'approved',
  'nekad': 'rejected',
  'väntar': 'pending',
  'Ditt konto': 'Your account',
  'Namn': 'Name',
  'Roll': 'Role',
  'Du ser': 'You can see',
  'Dina butiker': 'Your stores',
  'Alla butiker': 'All stores',
  'Tjänar även i': 'Also earns in',
  'Byt lösenord': 'Change password',
  'Du loggas ut från alla andra enheter när du byter.': 'You will be logged out of all other devices.',
  'Nuvarande lösenord': 'Current password',
  'Nytt lösenord (minst 8 tecken)': 'New password (at least 8 characters)',
  'Nytt lösenord igen': 'New password again',
  'Spara nytt lösenord': 'Save new password',
  'Lösenordet är bytt.': 'Password changed.',
  'Nuvarande lösenord stämmer inte.': 'Current password is wrong.',
  'De två nya lösenorden är inte lika.': 'The two new passwords do not match.',
  'Ditt konto är inte kopplat till en person än': 'Your account is not linked to a person yet',
  'Utan koppling kan systemet inte veta vilka recensioner, tvister eller produkter som är dina. Be Axel koppla kontot under Konton.':
    'Without the link the system cannot tell which reviews, disputes or products are yours. Ask Axel to link your account under Accounts.',
  'Språk': 'Language',
  'Spara': 'Save',
  'Språket är bytt.': 'Language changed.',

  // --- mallen som ska få kunden att skriva namnet
  'Be om recensionen så här': 'Ask for the review like this',
  'Kopiera texten': 'Copy the text',
  'Kopierat!': 'Copied!',
  'Skicka EFTER att kundens problem är löst — aldrig före.': 'Send it AFTER the customer\'s problem is solved — never before.',
  'Den här veckan': 'This week',
  'av': 'of',
  'recensioner med ditt namn': 'reviews with your name',

  // --- topplistan
  'Topplistan': 'Leaderboard',
  'Samma siffror som betalas ut. Listan nollställs den 1:a varje månad.':
    'The same numbers that get paid out. The list resets on the 1st of every month.',
  'Ersättning': 'Earnings',
  'Flytt': 'Move',
  'Etta just nu': 'Number one right now',
  'Annonser den här månaden': 'Ads this month',
  'Redigerare med ersättning': 'Editors earning',
  'Antal annonser som redigerarna har levererat och som har fått visas för kunder.':
    'Ads the editors delivered that have been shown to customers.',
  'Månaden pågår — siffrorna växer varje dag.': 'The month is still running — the numbers grow every day.',
  'Månaden är slutavräknad.': 'The month is settled.',
  'Din plats på topplistan': 'Your place on the leaderboard',
  'Din bästa annons': 'Your best ad',
  'Samma plats som sist.': 'Same place as last time.',

  // --- kundtjänst
  'Vad kunderna hör av sig om, och vad som brådskar.': 'What customers contact us about, and what is urgent.',
  'Tvister som brådskar': 'Urgent disputes',
  'Sorterade efter hur lite tid som är kvar. Chargebacks är de som faktiskt förloras.':
    'Sorted by how little time is left. Chargebacks are the ones actually lost.',
  'Order': 'Order',
  'Belopp': 'Amount',
  'Sista svarsdag': 'Response deadline',
  'Tid kvar': 'Time left',
  'dagar kvar': 'days left',
  'i dag': 'today',
  'passerad': 'passed',
  'Inget brådskar just nu': 'Nothing urgent right now',
  'Ingen tvist har svarsdag inom sju dagar.': 'No dispute has a deadline within seven days.',
  'Passerade svarsdagar': 'Passed deadlines',
  'Vad kunderna frågar om': 'What customers ask about',
  'Störst högar först. En hög som växer är något att fixa i butiken, inte bara i inkorgen.':
    'Biggest piles first. A pile that grows is something to fix in the store, not just in the inbox.',
  'Ärende': 'Ticket type',
  'Brand': 'Brand',
  'Antal': 'Count',
  'Obesvarade': 'Unanswered',
  'Rutin finns': 'Has a routine',
  'saknas': 'missing',
  'ja': 'yes',
  'Att göra den här veckan': 'To do this week',
  'hög risk': 'high risk',
  'medel': 'medium',
  'lugnt': 'calm',
  'obesvarade av': 'unanswered out of',
  'ärenden senaste': 'tickets in the last',
  'dagarna.': 'days.',

  // --- leverans
  'Paket på väg till kund.': 'Parcels on their way to customers.',
  'Paketen vi följer åt kunderna, butik för butik.': 'The parcels we track for customers, store by store.',
  'Paket vi följer': 'Parcels tracked',
  'På väg': 'On the way',
  'Framme': 'Delivered',
  'Utan skanning': 'No scan yet',
  'Per butik': 'Per store',
  'Paket': 'Parcels',
  'Senaste rundan': 'Last run',
  'normalt': 'normal',
  'kolla kvoten': 'check the quota',

  // --- recensioner
  'Vad kunderna skriver, och vem de tackar vid namn.': 'What customers write, and who they thank by name.',
  'Recensioner (60 dagar)': 'Reviews (60 days)',
  'Nämner någon i teamet': 'Mentions someone on the team',
  'Butiker med recensioner': 'Stores with reviews',
  'Källor': 'Sources',
  'Recensioner som gav någon pengar': 'Reviews that earned someone money',
  'Kunden skrev namnet — då vet systemet vem som ska ha betalt.':
    'The customer wrote the name — so the system knows who gets paid.',
  'Senaste recensionerna': 'Latest reviews',
  'ingen får betalt': 'nobody gets paid',
  'betalas ut': 'paid out',
  'Noll recensioner nämner någon i teamet': 'Zero reviews mention anyone on the team',
  'Snitt': 'Average',
  'Med namn': 'With a name',

  // --- produkttest
  'Trappan från hittad produkt till egen butik.': 'The ladder from found product to its own store.',
  'Produkter i trappan': 'Products on the ladder',
  'Fick sin chans': 'Got its chance',
  'Går med vinst': 'Profitable',
  'Skalas nu': 'Scaling now',
  'Trappan': 'The ladder',
  'Steg': 'Step',
  'Produkter': 'Products',
  'Vem hittar produkterna': 'Who finds the products',
  'Produkten': 'Product',
  'Ansvarig': 'Owner',
  'Status': 'Status',
  'Klarade steg': 'Steps passed',
  'Datum': 'Date',
  'Produkterna': 'The products',
  'Godkänd för test': 'Approved for testing',
  'Skalas': 'Scaling',
  'vinnare hittade': 'winner found',
  'ingen än': 'none yet',

  // --- bonus (chefens vy)
  'Vad alla tjänar utöver lönen.': 'What everyone earns on top of their salary.',
  'Att godkänna': 'To approve',
  'Insatser folk rapporterat in själva. Kontrollera länken innan du godkänner — pengarna betalas ut på ditt klick.':
    'Things people reported themselves. Check the link before approving — the money is paid on your click.',
  'Godkänn': 'Approve',
  'Neka': 'Reject',
  'öppna': 'open',
  'Vem tjänar vad': 'Who earns what',
  'Din intjäning': 'Your earnings',
  'Person': 'Person',
  'På vad': 'For what',
  'Vad pengarna går till': 'Where the money goes',
  'Uppdrag': 'Task',
  'Summa': 'Total',
  'Väntar på godkännande': 'Waiting for approval',
  'kräver ett klick': 'needs a click',
  'tomt': 'empty',
  'Programmen': 'The programs',
  'Pengar ingen fick': 'Money nobody got',

  // --- rollerna
  'Ägare': 'Owner',
  'Chef': 'Manager',
  'Videoredigerare': 'Video editor',
  'Head of customer support': 'Head of customer support',
  'Kundtjänst (VA)': 'Customer support (VA)',
  'Allt. Pengar, annonser, folk, bonus och konton.': 'Everything. Money, ads, people, bonuses and accounts.',
  'Allt utom vem som får logga in.': 'Everything except who gets to log in.',
  'Produkterna de testar och vad de tjänat på dem. Ingen spend, ingen omsättning.':
    'The products they test and what they earned on them. No spend, no revenue.',
  'Topplistan och sin egen sida. Ser aldrig spend eller omsättning.':
    'The leaderboard and their own page. Never sees spend or revenue.',
  'Kundtjänst, recensioner, paket och hela VA-teamets bonus. Godkänner insatser. Ingen ekonomi.':
    'Support, reviews, parcels and the whole VA team bonus. Approves submissions. No financials.',
  'Ärenden, tvister, paket och recensioner — plus sina egna uppdrag och pengar.':
    'Tickets, disputes, parcels and reviews — plus their own tasks and money.',

  // --- statusord
  'ingen inloggning': 'no login',
  'stängd dörr': 'closed door',
  'ingen data': 'no data',
  'Ingen topplista än': 'No leaderboard yet',
  'Inga recensioner lästes': 'No reviews were read',
  'Ingen produkttestdata': 'No product test data',
  'Ingen veckorapport än': 'No weekly report yet',
  'Ingen spårningsdata än': 'No tracking data yet',
  'Ingen bonus uträknad än': 'No bonus calculated yet',

  'Kopplad till': 'Linked to',
  '— ingen —': '— none —',
  'Rapport körd': 'Report run',
  'Senaste rundan': 'Last run',
  'Vecka': 'Week',
  'i potten': 'at stake',

  'ingen ansvarig': 'no owner',
  'Ingen enda recension nämner en medarbetare. Då kan heller ingen få de fem dollarna — be kunden skriva ditt namn.':
    'Not a single review mentions a team member. That means nobody can collect the five dollars — ask the customer to write your name.',
  'Det är därför bonusen aldrig betalas ut. Fem dollar per recension med ditt namn — men kunden skriver bara namnet om du ber om det. Be om det i varje avslutat ärende.':
    'That is why the bonus never pays out. Five dollars per review with your name — but the customer only writes the name if you ask. Ask in every ticket you close.',
  'De 60 senaste dagarna. En recension räknas som bonus först vid fyra stjärnor eller mer.':
    'The last 60 days. A review only counts as bonus at four stars or more.',
  'Godkänd för test': 'Approved for testing',
  'Fick sin chans': 'Got its chance',
  'Går med vinst': 'Profitable',
  'Skalas': 'Scaling',

  // --- gemensamt
  'Hämtat': 'Fetched',
  'Räknat': 'Calculated',
  'just nu': 'just now',
  'min sedan': 'min ago',
  'timme sedan': 'hour ago',
  'timmar sedan': 'hours ago',
  'i går': 'yesterday',
  'dagar sedan': 'days ago',
  'okänt': 'unknown',
  'Ingen data': 'No data',

  // --- varumärken och kalender (2026-09-22)
  'Varumärken': 'Brands',
  'Kalender': 'Calendar',
  'Alla varumärken': 'All brands',
  'Flikar': 'Tabs',
  'Rutiner': 'Routines',
  'Kontakter': 'Contacts',
  'Sålt 7 d': 'Sold 7 d',
  'Reklam 7 d': 'Ads 7 d',
  'Paket på väg': 'Parcels in transit',
  'Eskalering 48 h': 'Escalations 48 h',
  'läses inte': 'not readable',
  'ej kopplad': 'not connected',
  'ej kopplat': 'not connected',
  'Nästa': 'Next',
  'Förra': 'Previous',
  'allt rullar': 'all running',
  'något att titta på': 'worth a look',
  'kräver dig': 'needs you',
  'nu': 'now',
  'titta': 'look',
  'stängd dörr': 'closed door',
  'körde': 'ran',
  'sen': 'late',
  'saknas': 'missing',
  'avstängd': 'paused',
  'går inte att mäta': 'not measurable',
  'förfallen': 'overdue',
  'om': 'in',
  'i dag': 'today',
  'I dag': 'Today',
  'I morgon': 'Tomorrow',
  'senast': 'last',
  'Vad ska hända?': 'What should happen?',
  'Vad ska hända? T.ex. "Ring leverantören imorgon kl 14"': 'What should happen? E.g. "Call the supplier imorgon kl 14"',
  'Datumordet i texten vinner: "imorgon", "fredag", "15/10", "om 3 dagar", "kl 14". Utan datumord gäller datumfältet.': 'A Swedish date word in the text wins: "imorgon", "fredag", "15/10", "om 3 dagar", "kl 14". Without one, the date field applies.',
  'Datum': 'Date',
  'Tid': 'Time',
  'Typ': 'Type',
  'Varumärke': 'Brand',
  'Personligt': 'Personal',
  'Lägg till': 'Add',
  'Klar': 'Done',
  'Ångra': 'Undo',
  'Ta bort': 'Remove',
  'automatiskt': 'automatic',
  'Kommande två veckor': 'Next two weeks',
  'Det du lagt in och det systemet vet kommer hända. Försenat står överst.': 'What you added and what the system knows will happen. Overdue first.',
  'Ingenting planerat': 'Nothing planned',
  'Skriv en rad ovan.': 'Type a line above.',
  'Månaden': 'The month',
  'Längre fram': 'Further ahead',
  'Gjort': 'Done',
  'Det du bockat av. Senaste först.': 'What you ticked off. Latest first.',
  'Dina egna rader. Bara du ser dem.': 'Your own entries. Only you see them.',
  'Dina egna rader och alla varumärkens, på ett ställe.': 'Your own entries and every brand’s, in one place.',
  'sak i dag': 'item today',
  'saker i dag': 'items today',
  'tvist': 'dispute',
  'rutin': 'routine',
  'kontakt': 'contact',
  'ur tvisterna': 'from disputes',
  'rutin enligt schema': 'scheduled routine',
  'uppföljning av kontakt': 'contact follow-up',
  'mån': 'Mon',
  'tis': 'Tue',
  'ons': 'Wed',
  'tors': 'Thu',
  'fre': 'Fri',
  'lör': 'Sat',
  'sön': 'Sun',
  'januari': 'January',
  'februari': 'February',
  'mars': 'March',
  'april': 'April',
  'maj': 'May',
  'juni': 'June',
  'juli': 'July',
  'augusti': 'August',
  'september': 'September',
  'oktober': 'October',
  'november': 'November',
  'december': 'December',
  'Rutinerna i dag': 'Routines today',
  'Inga schemalagda rutiner det närmaste dygnet.': 'No scheduled routines in the next 24 hours.',
  'Namn': 'Name',
  'Plattform': 'Platform',
  'Länk': 'Link',
  'Kontaktväg': 'How to reach',
  'Läge': 'Status',
  'Nästa steg': 'Next step',
  'Följ upp senast': 'Follow up by',
  'Anteckning': 'Note',
  'Lägg till kontakt': 'Add contact',
  'Spara': 'Save',
  'kontakter': 'contacts',
  'Aktiva först.': 'Active first.',
  'inget nästa steg': 'no next step',
  'försenat': 'overdue',
  'Öppna i Discord': 'Open in Discord',
  'bot': 'bot',
  'bilagor': 'attachments',
  'eskalering': 'escalation',
  'annonser': 'ads',
  'övrigt': 'other',
  'passerad': 'passed',
  'dag kvar': 'day left',
  'dagar kvar': 'days left',
  'besvarad': 'answered',
  'obesvarad': 'unanswered',
  'ja': 'yes',
  'för lite data': 'too little data',
  'ingen break-even': 'no break-even',
  'tjänar pengar': 'making money',
  'går back': 'losing money',
  'Läses inte': 'Not readable',
};

/** Översätt en mening. Okänd mening returneras oförändrad. */
export function oversatt(text, sprak = 'sv') {
  if (sprak === 'sv' || !text) return text;
  return ORDBOK[text] ?? text;
}

/** Bekvämlighetsfunktion: `const t = tolk(sprak)` och sedan `t('Min sida')`. */
export function tolk(sprak = 'sv') {
  return (text) => oversatt(text, sprak);
}

/** Antal ord i ordboken — används av testet som vaktar täckningen. */
export function ordbokStorlek() {
  return Object.keys(ORDBOK).length;
}

export { ORDBOK };
