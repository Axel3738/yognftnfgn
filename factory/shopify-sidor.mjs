// Sidor Shopify skapar SJÄLV i butiken, på butikens primärspråk — och som
// därför aldrig finns i konfigen men ändå läcker på /nb och /en tills de
// översätts. Underlaget (oversattning.mjs) bär dem härifrån, så subagentens
// <locale>-fil får en nyckel att fylla och marknad.mjs matchar på värdet.
//
// ⚠️ Texten är Shopifys egen, avläst byte för byte ur butiken — inte skriven
// här. Ändrar Shopify sin formulering matchar värdet inte längre, och sidan
// syns då som läcka i oversatt-steget (aldrig tyst). Läs då om den med
// GraphQL (page(id:…) { title body }) och byt texten här.
//
// Mätt på CaraShell 2026-09-16 06:42:53Z: marknad-steget lade till USA, och
// samma minut fanns sidan "Dina integritetsval" (handle data-sharing-opt-out)
// + en sidfotslänk med samma titel, skapade av Shopify för amerikanska
// delstaters integritetslagar ("Do not sell or share"). Ingen kod i repot
// skrev den. Den låg som 3 läckor på BÅDE /en och /nb (titel, body, menylänk).
// Sidan ska finnas för USA-kunder — den översätts, tas aldrig bort.

export const SHOPIFY_SIDOR = [
  {
    handle: "data-sharing-opt-out",
    titel: "Dina integritetsval",
    skapas_av: "Shopify när en USA-marknad läggs till (mätt 2026-09-16)",
    body: "<link rel=\"stylesheet\" type=\"text/css\" href=\"https://cdn.shopify.com/shopifycloud/privacy-banner/data-sale-opt-out.css\">\n<meta charset=\"utf-8\"> <p>Som beskrivs i vår integritetspolicy samlar vi in personlig information från din interaktion med oss och vår webbplats, bland annat genom cookies och liknande teknik. Vi kan också komma att dela personuppgifterna med tredje part, bland annat reklampartner. Vi gör detta för att visa dig annonser på andra webbplatser som är mer relevanta för dina intressen och av andra skäl som beskrivs i vår integritetspolicy.</p> <p>Att dela personlig information för riktad reklam baserat på din interaktion på olika webbplatser kan betraktas som &quot;försäljning&quot;, &quot;delning&quot; eller &quot;riktad reklam&quot; enligt vissa amerikanska delstaters integritetsskyddslagar. Beroende på var du bor kan du ha rätt att tacka nej till dessa aktiviteter. Om du vill utnyttja denna rätt att tacka nej följer du instruktionerna nedan.</p> <p>Om du besöker vår webbplats med den globala integritetskontrollens signal att tacka aktiverad kommer vi beroende på var du befinner dig att behandla detta som en begäran om att tacka nej till aktiviteter som kan anses vara &quot;försäljning&quot; eller &quot;delning&quot; av personuppgifter eller annan användning som kan anses vara riktad reklam för den enhet och webbläsare du använde för att besöka vår webbplats.</p>\n<div id=\"pc--optOutFormContainer\" data-not-applicable='För att tacka nej till &quot;försäljning&quot; eller &quot;delning&quot; av dina personuppgifter som samlats in med hjälp av cookies och andra enhetsbaserade identifierare enligt beskrivningen ovan måste du surfa från en av de tillämpliga USA-staterna som nämns ovan.' data-description='Om du vill tacka nej till aktiviteter som kan anses vara en &quot;rea&quot; eller &quot;delning&quot; eller &quot;riktad reklam ska du skicka ett e-postmeddelande.' data-email-label='e-post' data-success='Tackat nej' data-error='Ett problem uppstod. Försök att skicka e-postmeddelandet igen' data-form-description='När du klickar på ”avregistrera dig” kommer inte webbläsaren på den här enheten att dela personuppgifter. Om du markerar kryssrutan och anger en e-postadress kommer även det tillhörande kundkontot att avregistreras.' data-form-email-label='E-post' data-form-opt-out-account-label=\"Dela inte uppgifter från mitt konto (valfritt)\" data-form-button-text='Avregistrera dig' data-form-opted-out='Webbläsaren på den här enheten har avregistrerats' data-form-success='Du har framgångsrikt avregistrerat dig' data-form-error='Ett fel uppstod. Försök igen' ></div>\n<script src=\"https://cdn.shopify.com/shopifycloud/privacy-banner/data-sale-opt-out.js\" defer></script> <script src=\"https://js.hcaptcha.com/1/api.js?onload=optOutOnLoad\" defer></script>",
  },
];
