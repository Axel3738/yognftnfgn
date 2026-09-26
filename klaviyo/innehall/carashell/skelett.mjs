// Skelettet för CaraShells mejl: flöden och kampanjer i tre språk (sv, nb, en).
//
//   node klaviyo/innehall/carashell/skelett.mjs            # skriver floden/<sprak>/ + kampanjer/<sprak>/ där filen SAKNAS
//   node klaviyo/innehall/carashell/skelett.mjs --skriv-om # skriver över (kastar copyn — bara före copy-steget)
//
// Huvudsessionen äger strukturen här: trigger, filter, väntetider, block, hypotes
// (memo) och taggar. Copyn ("__COPY__"-fälten) skrivs av Sonnet-subagenter, ett
// språk i taget, mot docs/copy-regler.md och faktabladet i fakta/<sprak>.json.
// Formatet är klaviyo/ARKITEKTUR.md → Innehållsformatet, plus `sprak`, `brief`
// och `spoks` (triggern i Spoks form, se klaviyo/spoks/konvertera.mjs).
//
// Mätningen som styr planen (2026-09-26, Shopify yitrbk-m3, 90 dagar): 384 ordrar
// (SE 173, NO 82, US 59, AU 29, DK 23, FI 7, GB 6, NZ 3, CA 2), 76 kontakter med
// samtycke (54 i USA, 12 i Sverige, 4 i Norge), 0 återköp, 73 övergivna kassor,
// order → skickad median 0,5 dygn. Inget produktpar ⇒ inget korsförsäljningsflöde.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HAR = path.dirname(fileURLToPath(import.meta.url));
export const SPRAK = ['sv', 'nb', 'en'];
const C = '__COPY__';
const c = (hint) => `${C}: ${hint}`;

// ----------------------------------------------------------------- flöden
//
// Filternycklarna (löses av konvertera.mjs till Spoks kontaktfilter):
//   samtycke            emailMarketingConsent in [subscribed]
//   ej_avregistrerad    emailMarketingConsent nin [unsubscribed]  (köparflöden, MFL 19 § andra stycket)
//   sprak               country-filtret för språkgruppen (brands/carashell.json → sprak_grupper)
//   ej_kopt_sedan_start lastPurchase lt __flow_triggered__        (prövas före varje utskick)
//   ej_kassa_sedan_start lastCartUpdate lt __flow_triggered__

const TAG = (o) => ({ typ: 'M', kalla: 'egen-data', kalla_ref: null, lardom: null, awareness: 'product', urgency: 'ingen', confidence: 'medium', prefix: 'CaraShellRoof', kod: 'M', ...o });

export const FLODEN = [
  {
    id: 'f01-valkomst', namnBas: 'FLOW_prenumerant_valkommen',
    memo: 'Välkomst till den som sagt ja i kassan eller i sidfoten. Tre mejl: grundaren hälsar, hur taköverdraget fungerar, hur det är att handla. Få mottagare utan popup (Axels beslut: ingen popup) — det är väntat.',
    spoks: { event: 'contact_created', filter: ['samtycke', 'sprak'], reenroll: false, reenrollEfter: null },
    steg: [
      { vanta: { enhet: 'minutes', varde: 0 } },
      { mejl: {
        id: 'f01-valkomst-e1', kod: 'M', hook: 'axel-har', format: 'rentext',
        memo: 'Grundaren presenterar sig kort: vem som skickar, vad butiken gör (skydd för husvagnen och husbilen när den står stilla: taköverdraget och termoskyddet), och att mejlen bara kommer när det finns ett skäl. Inga produktkort, ingen rea.',
        taggar: TAG({ kalla_ref: 'factory/butiker/carashell.yaml#branding.positionering', avatar: 'ny prenumerant, oftast en köpare som just sagt ja i kassan', begar: 'veta vem som skickar och varför', awareness: 'product' }),
        brief: 'Kort, personligt, rakt. En mening om vad överdraget gör (taket, inte hela vagnen), en om termoskyddet (rutan). Signaturen är grundare-blocket. Ingen leveranstid, inga siffror.',
        block: [
          { typ: 'text', rubrik: c('rubrik: Axel hälsar, t.ex. att det är han som skriver'), text: c('2–4 korta stycken från Axel: vem, vad butiken gör, varför mejlen kommer') },
          { typ: 'knapp', text: c('knapp till sortimentet'), lank: 'kollektion:sortimentet' },
          { typ: 'grundare', text: c('en avslutande rad: svara på mejlet om du undrar något, jag läser själv') },
        ],
      } },
      { vanta: { enhet: 'days', varde: 2 } },
      { mejl: {
        id: 'f01-valkomst-e2', kod: 'PD', hook: 'bara-taket-en-person',
        memo: 'Hur taköverdraget fungerar, med bara fakta ur faktabladet: nio längder, kanten 30–40 cm ner, vävda spännband med plastkrokar under karossens kant på alla fyra sidor, två extra band 10,5 m, en person. Konflikten mot helöverdraget (tungt, två personer) får bara sägas som vad VÅRT gör.',
        taggar: TAG({ typ: 'I', kalla_ref: 'products/carashell/takskyddet/dna.md (SP/PD-mönster 7, 11); factory/produkter/takskyddet.yaml#features', avatar: 'husvagns- eller husbilsägaren som ställer upp fordonet utomhus', begar: 'skydda-det-jag-ager', awareness: 'solution', kod: 'PD' }),
        brief: 'Hero med bild på taköverdraget. Tre punkter: storleken (mät taket front till bakkant, välj närmaste längd uppåt), fästet (banden, krokarna, alla fyra sidor), en person. Inga påståenden om att väven andas, ingen förvaringspåse, ingen dragsko.',
        block: [
          { typ: 'hero', rubrik: c('rubriken pekar på det som går att se: taket, kanten, banden'), text: c('1–2 meningar: vad överdraget täcker och vad det inte täcker'), bild: 'produkt:takskyddet', knapp: { text: c('knapp'), lank: 'produkt:takskyddet' } },
          { typ: 'punkter', rubrik: c('rubrik för tre punkter'), punkter: [c('storleken: nio längder 5,5–13,5 m, mät taket'), c('fästet: vävda spännband med plastkrokar under kanten, alla fyra sidor, två extra band'), c('en person sätter på det')] },
          { typ: 'fakta' },
        ],
      } },
      { vanta: { enhet: 'days', varde: 3 } },
      { mejl: {
        id: 'f01-valkomst-e3', kod: 'M', hook: 'sa-funkar-det-att-handla',
        memo: 'Tryggheten: ångerrätten/garantin exakt som butikens policy säger för marknaden, spårningssidan, att hello@carashell.com svarar. Skälet att finnas: den som tvekar på ett nytt varumärke behöver veta hur en retur går till innan köpet.',
        taggar: TAG({ kalla_ref: 'brands/carashell.json#per_sprak.*.angerratt_fran', avatar: 'prenumeranten som inte köpt än och undrar om butiken är seriös', begar: 'trygghet', awareness: 'product' }),
        brief: 'Fyra korta stycken: beställningen (bekräftelse på mejl, fraktmejl med paketnummer), spårningssidan (länk i fakta-blocket), ångerrätt/garanti EXAKT som policyn för språket (sv/nb: 14 dagar från mottagandet, kunden betalar returfrakten; en: 90-day guarantee, mejla först), support (hello@carashell.com). Ingen leveranstid.',
        block: [
          { typ: 'text', rubrik: c('rubrik'), text: c('stycken enligt briefen') },
          { typ: 'fakta' },
          { typ: 'knapp', text: c('knapp till taköverdraget'), lank: 'produkt:takskyddet' },
        ],
      } },
    ],
  },
  {
    id: 'f02-overgiven-kassa', namnBas: 'FLOW_checkout_overgiven',
    memo: 'Här ligger mest pengar: 73 övergivna kassor på 90 dagar mot 384 ordrar. Tre mejl: påminnelse, svaren på köparens tvekan (passar det min vagn, hur fäster det, klarar det vinden), sista mejlet från grundaren. Bara till subscribed (MFL 19 §): kassan är inget köp. Shopifys egen notis om övergiven kassa ska stängas av samma dag flödet slås på.',
    spoks: { event: 'checkout_created', filter: ['ej_kopt_sedan_start', 'samtycke', 'sprak'], reenroll: true, reenrollEfter: 'P7D' },
    steg: [
      { vanta: { enhet: 'hours', varde: 3 } },
      { mejl: {
        id: 'f02-overgiven-kassa-e1', kod: 'M', hook: 'kassan-ar-kvar',
        memo: 'Kort påminnelse, inga invändningar än. Varorna finns kvar, en väg tillbaka.',
        taggar: TAG({ avatar: 'kunden som lade överdraget i kassan men inte betalade', begar: 'hitta tillbaka till det man redan valt' }),
        brief: 'Två meningar och kassablocket. Ingen brådska, ingen rabatt.',
        block: [
          { typ: 'text', rubrik: c('rubrik: kassan är kvar'), text: c('1–2 meningar') },
          { typ: 'dynamisk', kalla: 'checkout_rader' },
        ],
      } },
      { vanta: { enhet: 'days', varde: 1 } },
      { mejl: {
        id: 'f02-overgiven-kassa-e2', kod: 'OB', hook: 'passar-det-min-vagn',
        memo: 'Det riktiga svaret på tvekan, ur kommentarsfälten (kommentarer/leads.md 2026-09-24–26: storleken syns inte, klarar det vinden, remmarna): passar det min vagn (nio längder, mät front till bakkant, närmaste längd uppåt, husvagn och husbil), hur fäster det (vävda spännband med plastkrokar under karossens kant, alla fyra sidor, justerbara, två extra band 10,5 m), klarar det vinden (ja, banden håller det på plats, inte gummi, töjs inte ut). En rad för termoskyddet sist (mät framrutan: 211 cm bred, 171 över mitten, 90 cm flikar, kläms i dörrkarmen).',
        taggar: TAG({ typ: 'I', kalla: 'voc', kalla_ref: 'kommentarer/leads.md 2026-09-24 (storlek, vind, remmar); factory/produkter/takskyddet.yaml#faq', avatar: 'kunden som stannade i kassan för att den inte vet om det passar', begar: 'veta att det passar innan man betalar', awareness: 'product', kod: 'OB' }),
        brief: 'Rubrik + tre punkter som var och en är fråga → svar. Bara faktabladets ord. Ventilation/kondens får INTE besvaras (leverantören har inte svarat). Fakta-blocket sist bär ångerrätt/garanti.',
        block: [
          { typ: 'text', rubrik: c('rubrik: tre frågor innan du betalar'), text: c('en mening som öppnar') },
          { typ: 'punkter', rubrik: null, punkter: [c('passar det min vagn → storlek'), c('hur fäster det → banden och krokarna'), c('klarar det vinden → ja, med faktabladets ord'), c('termoskyddet: måtten och dörrkarmen, en rad')] },
          { typ: 'dynamisk', kalla: 'checkout_rader' },
          { typ: 'fakta' },
        ],
      } },
      { vanta: { enhet: 'days', varde: 2 } },
      { mejl: {
        id: 'f02-overgiven-kassa-e3', kod: 'M', hook: 'sista-mejlet-fran-axel', format: 'rentext',
        memo: 'Sista mejlet. Ingen nedräkning, ingen "kassan töms". Grundaren: har du en fråga, svara på mejlet; annars hör du inget mer om den här kassan.',
        taggar: TAG({ avatar: 'kunden som lade överdraget i kassan men inte betalade', begar: 'en sista möjlighet att fråga innan man bestämmer sig' }),
        brief: 'Grundare-blocket bär hela texten (3–4 meningar). Kassablocket under.',
        block: [
          { typ: 'grundare', text: c('sista mejlet, svara på mejlet med frågor, annars inget mer om kassan') },
          { typ: 'dynamisk', kalla: 'checkout_rader' },
        ],
      } },
    ],
  },
  {
    id: 'f03-webbhistorik', namnBas: 'FLOW_visning_webbhistorik',
    memo: 'Den som tittat på en produkt utan att lägga i korgen. Bara identifierade besökare med samtycke — få, och det är väntat. sv/nb visar den visade produkten dynamiskt; en visar båda skydden som bilder eftersom katalogens titlar är svenska.',
    spoks: { event: 'product_viewed', filter: ['ej_kassa_sedan_start', 'ej_kopt_sedan_start', 'samtycke', 'sprak'], reenroll: true, reenrollEfter: 'P30D' },
    steg: [
      { vanta: { enhet: 'hours', varde: 4 } },
      { mejl: {
        id: 'f03-webbhistorik-e1', kod: 'M', hook: 'den-har-kikade-du-pa',
        memo: 'Kort: den här tittade du på, här är den igen.',
        taggar: TAG({ avatar: 'besökaren som tittade på ett skydd och gick', begar: 'hitta tillbaka' }),
        brief: 'Rubrik + en mening. Inget säljande.',
        block: (s) => [
          { typ: 'text', rubrik: c('rubrik'), text: c('en mening') },
          ...(s === 'en' ? [{ typ: 'produktrad', rubrik: null, handles: ['takskyddet', 'termoskyddet'] }] : [{ typ: 'dynamisk', kalla: 'visad_produkt' }]),
        ],
      } },
      { vanta: { enhet: 'days', varde: 1 } },
      { mejl: {
        id: 'f03-webbhistorik-e2', kod: 'OB', hook: 'storleken-avgor',
        memo: 'Den fråga som oftast stoppar köpet i kommentarerna: finns min storlek? Svaret: nio längder 5,5–13,5 m, mät taket front till bakkant, närmaste längd uppåt.',
        taggar: TAG({ typ: 'I', kalla: 'voc', kalla_ref: 'kommentarer/leads.md 2026-09-25 (storleksvalet syns inte)', avatar: 'besökaren som inte hittade sin storlek', begar: 'veta att det finns en storlek som passar', kod: 'OB' }),
        brief: 'Rubrik + 2 meningar om storlekarna + produkten igen + fakta.',
        block: (s) => [
          { typ: 'text', rubrik: c('rubrik: storleken'), text: c('två meningar: nio längder, hur man mäter') },
          ...(s === 'en' ? [{ typ: 'produktrad', rubrik: null, handles: ['takskyddet', 'termoskyddet'] }] : [{ typ: 'dynamisk', kalla: 'visad_produkt' }]),
          { typ: 'fakta' },
        ],
      } },
    ],
  },
  {
    id: 'f04-efter-kop', namnBas: 'FLOW_order_efterkop',
    memo: 'Köparflöde (alla som inte tackat nej). E1 dag 2: vad som händer nu, spårningssidan på kundens språk, svara på mejlet — supportmejlet innan kunden hinner bli orolig (WISMO-andelen i autosvarets logg mäter det). E2 dag 16: kom allt fram, och exakt vad man gör om något är fel — mejlet som förebygger tvister (Bäverbutiken har 58, CaraShell 0).',
    spoks: { event: 'order_created', filter: ['ej_avregistrerad', 'sprak'], reenroll: true, reenrollEfter: null },
    steg: [
      { vanta: { enhet: 'days', varde: 2 } },
      { mejl: {
        id: 'f04-efter-kop-e1', kod: 'M', hook: 'det-har-hander-nu',
        memo: 'Branded med tydlig knapp till spårningssidan (Axels dom på Bäverbutikens rentext-version: "man kan inte knappa, folk orkar inte läsa"). Ingen leveranstid. Paketnumret börjar på CS- och står i fraktmejlet.',
        taggar: TAG({ kalla_ref: 'sparning/butiker.json#carashell (prefix CS-, sidor per språk)', avatar: 'kunden som just beställt och inte hört något sen dess', begar: 'kunna se paketet själv utan att mejla', urgency: 'konsekvens' }),
        brief: 'Rubrik + 2 korta stycken: bekräftelsen och fraktmejlet med paketnumret (CS-…), knappen visar var paketet är. Grundare-raden: svara på mejlet om det känns långsamt. INGEN leveranstid, inga dagar.',
        block: [
          { typ: 'text', rubrik: c('rubrik'), text: c('två stycken') },
          { typ: 'knapp', text: c('knapp: följ ditt paket'), lank: 'sparning:' },
          { typ: 'grundare', text: c('en rad: svara på mejlet, jag läser själv') },
        ],
      } },
      { vanta: { enhet: 'days', varde: 14 } },
      { mejl: {
        id: 'f04-efter-kop-e2', kod: 'M', hook: 'kom-allt-fram',
        memo: 'Dag 16. Kom allt fram? Om inte: spårningssidan. Om något är fel: ångerrätt/garanti exakt som policyn, reklamation 3 år, mejla hello@carashell.com med ordernumret. Inga produktkort — det här är servicemejlet.',
        taggar: TAG({ kalla_ref: 'brands/carashell.json#per_sprak.*.angerratt_fran', avatar: 'kunden vars paket rimligen kommit fram', begar: 'trygghet' }),
        brief: 'Rubrik + tre korta stycken (kom det fram; inte än → knappen; fel → policyn för språket + ordernumret + adressen). Fakta-blocket sist.',
        block: [
          { typ: 'text', rubrik: c('rubrik: kom allt fram?'), text: c('tre stycken') },
          { typ: 'knapp', text: c('knapp: följ ditt paket'), lank: 'sparning:' },
          { typ: 'fakta' },
        ],
      } },
    ],
  },
  {
    id: 'f05-vinback', namnBas: 'FLOW_order_vinback',
    memo: 'GISSNING, märkt så: CaraShell har 0 återköp på 90 dagar (butiken är 15 dagar gammal). Produkternas säsonger ligger ett halvår isär (taket på hösten, rutan på resorna), så 180 dagar efter ett köp är den andra produktens tid. E1: vad som finns nu. E2: en fråga tillbaka (vad saknar du för vagnen) — kundens egna ord till nästa produkt.',
    spoks: { event: 'order_created', filter: ['ej_avregistrerad', 'sprak', 'ej_kopt_sedan_start'], reenroll: true, reenrollEfter: null },
    steg: [
      { vanta: { enhet: 'days', varde: 180 } },
      { mejl: {
        id: 'f05-vinback-e1', kod: 'S', hook: 'ett-halvar-senare',
        memo: 'Säsongsneutralt (kan landa i mars eller december): ett halvår efter köpet, det här har vi nu. Produktrad med de tre skydden.',
        taggar: TAG({ typ: 'S', kalla: 'gissning', kalla_ref: null, avatar: 'kunden som köpte för ett halvår sedan', begar: 'skydda-det-jag-ager', awareness: 'product', urgency: 'sasong', confidence: 'low', kod: 'S' }),
        brief: 'Rubrik + 2 stycken som fungerar oavsett årstid (en: aldrig winter/summer). Produktrad + fakta.',
        block: [
          { typ: 'text', rubrik: c('rubrik: ett halvår senare'), text: c('två stycken') },
          { typ: 'produktrad', rubrik: c('rubrik för produktraden'), handles: ['takskyddet', 'termoskyddet', 'fonstertermomatta-2-pack'] },
          { typ: 'fakta' },
        ],
      } },
      { vanta: { enhet: 'days', varde: 14 } },
      { mejl: {
        id: 'f05-vinback-e2', kod: 'M', hook: 'vad-saknar-du', format: 'rentext',
        memo: 'Frågan: vad saknar du för vagnen? Svara med en rad. Kundens ord blir underlag till nästa produkt (Evolve: kundens egna ord).',
        taggar: TAG({ kalla: 'gissning', avatar: 'kunden som köpte för ett halvår sedan', begar: 'bli lyssnad på', confidence: 'low' }),
        brief: 'Grundare-blocket: 3–4 meningar, en fråga, svara på mejlet. Inget annat.',
        block: [
          { typ: 'grundare', text: c('frågan från Axel') },
        ],
      } },
    ],
  },
  {
    id: 'f06-levererat-takskyddet', namnBas: 'FLOW_levererat_takskyddet',
    memo: 'Triggas när Shopify säger levererat (spårningsrutinen skriver leveransskanningen i Shopify varje timme). Dagen efter: så sätter du på taköverdraget. Skälet: en kund som sätter på det rätt ringer inte om vind och lack. ⚠️ Triggern order_delivered är inte mätt i CaraShells workspace: mät att flödet får inskrivningar första veckan, annars byt till order_created + 12 dagar.',
    spoks: { event: 'order_delivered', filter: ['ej_avregistrerad', 'sprak'], triggerFilter: { externalId: ['takskyddet'] }, reenroll: true, reenrollEfter: null },
    steg: [
      { vanta: { enhet: 'days', varde: 1 } },
      { mejl: {
        id: 'f06-levererat-takskyddet-e1', kod: 'M', hook: 'sa-satter-du-pa-det',
        memo: 'Monteringen med faktabladets ord: lägg det över taket med kanten 30–40 cm ner över sidorna, haka plastkrokarna under karossens kant längs sidorna (alla fyra sidor), dra åt de justerbara banden, de två extra banden på 10,5 m följer med för extra fäste. Inget om hur de extra banden dras (står inte i faktabladet).',
        taggar: TAG({ kalla_ref: 'factory/produkter/takskyddet.yaml#features, #faq', avatar: 'kunden som just fått paketet', begar: 'slippa-krangel' }),
        brief: 'Rubrik + en mening + fyra punkter i ordning + grundare-rad (blev något fel, svara på mejlet) + fakta.',
        block: [
          { typ: 'text', rubrik: c('rubrik: så sätter du på taköverdraget'), text: c('en mening') },
          { typ: 'punkter', rubrik: null, punkter: [c('lägg det över taket, kanten ner över sidorna'), c('haka krokarna under kanten, alla fyra sidor'), c('dra åt banden'), c('de två extra banden följer med')] },
          { typ: 'grundare', text: c('blev något inte som det skulle, svara på mejlet') },
          { typ: 'fakta' },
        ],
      } },
    ],
  },
  {
    id: 'f06-levererat-termoskyddet', namnBas: 'FLOW_levererat_termoskyddet',
    memo: 'Samma som takskyddets leveransflöde, för termoskyddet: spänns utvändigt över vindrutan och båda sidorutorna, flikarna kläms fast i dörrkarmen utan att dörrarna öppnas, håller i blåst.',
    spoks: { event: 'order_delivered', filter: ['ej_avregistrerad', 'sprak'], triggerFilter: { externalId: ['termoskyddet'] }, reenroll: true, reenrollEfter: null },
    steg: [
      { vanta: { enhet: 'days', varde: 1 } },
      { mejl: {
        id: 'f06-levererat-termoskyddet-e1', kod: 'M', hook: 'sa-monterar-du-termoskyddet',
        memo: 'Monteringen med faktabladets ord, tre punkter.',
        taggar: TAG({ kalla_ref: 'factory/produkter/termoskyddet.yaml#features, #faq', avatar: 'husbilsägaren som just fått termoskyddet', begar: 'slippa-krangel', prefix: 'CaraShellFront' }),
        brief: 'Rubrik + en mening + tre punkter + grundare-rad + fakta.',
        block: [
          { typ: 'text', rubrik: c('rubrik: så monterar du termoskyddet'), text: c('en mening') },
          { typ: 'punkter', rubrik: null, punkter: [c('utvändigt över vindrutan och båda sidorutorna'), c('flikarna i dörrkarmen, dörrarna stängda'), c('håller i blåst')] },
          { typ: 'grundare', text: c('blev något inte som det skulle, svara på mejlet') },
          { typ: 'fakta' },
        ],
      } },
    ],
  },
  {
    id: 'f14-recension', namnBas: 'FLOW_levererat_recension',
    memo: 'Tio dagar efter leveransen, klockan 18: vad tyckte du? Fem stjärnor som ALLA går till samma Trustpilot-sida (?stars=N förväljer betyget) — aldrig review gating. Plus grundarens rad: blev något fel, svara på mejlet först. ⚠️ Trustpilot har ingen profil för carashell.se (evaluate-sidan svarar 404, mätt 2026-09-26) — Axel gör anspråk på profilen innan flödet slås på.',
    spoks: { event: 'order_delivered', filter: ['ej_avregistrerad', 'sprak'], reenroll: true, reenrollEfter: 'P90D', tilHour: '18:00' },
    steg: [
      { vanta: { enhet: 'days', varde: 10 } },
      { mejl: {
        id: 'f14-recension-e1', kod: 'M', hook: 'vad-tyckte-du',
        memo: 'Transaktionell förfrågan: tre-frågorstestets "ingen annan kan säga det" får vara ❌ och redovisas.',
        taggar: TAG({ kalla_ref: 'klaviyo/innehall/baverbutiken/floden/f14-recension-trustpilot.json (samma konstruktion, egen copy)', avatar: 'köparen vars paket har hunnit fram', begar: 'säga vad man tyckte', confidence: 'low' }),
        brief: 'Rubrik + en mening (paketet har hunnit fram, ett klick räcker). Stjärnblocket: rubrik + rad om att alla omdömen hjälper lika mycket. Grundare: blev något fel, svara på mejlet.',
        block: [
          { typ: 'text', rubrik: c('rubrik: vad tyckte du?'), text: c('en mening') },
          { typ: 'stjarnor', rubrik: c('rubrik över stjärnorna'), lank: 'trustpilot:', text: c('en rad: alla omdömen hjälper lika mycket') },
          { typ: 'grundare', text: c('blev något inte som det skulle, svara på mejlet först') },
        ],
      } },
    ],
  },
];

// -------------------------------------------------------------- kampanjer
//
// Rytmen: en tisdag i veckan per språk, 29/9–29/12, julveckan tom. Svenska och
// norska 18:00 svensk tid; engelskan 16:00 svensk tid (10:00 New York — 54 av
// 60 engelska prenumeranter är i USA). Alla går till SEG_samtycke_<sprak>: listan
// är 76 personer, ingen uppvärmningstrappa behövs. Black Week (vecka 48) byggs
// UTAN rabatt tills Axel valt A/B/C.

const TID = { sv: 'T18:00:00+02:00', nb: 'T18:00:00+02:00', en: 'T16:00:00+02:00' };
const TID_CET = { sv: 'T18:00:00+01:00', nb: 'T18:00:00+01:00', en: 'T16:00:00+01:00' };
const nar = (datum, s) => `${datum}${datum >= '2026-10-25' ? TID_CET[s] : TID[s]}`;

// Engelskan skrivs för US, GB, CA, AU och NZ samtidigt: aldrig winter/summer/
// spring/autumn/fall som årstid, aldrig snö — vagnen "står parkerad", "mellan
// resorna". Månadsnamn är tillåtna när ett datum är riktigt (sista beställningsdag).
const EN_HEMISFAR = 'Engelskan gäller USA, Storbritannien, Kanada, Australien och Nya Zeeland samtidigt: inga årstider (winter/summer/spring/autumn/fall), ingen snö — skriv "while it is parked", "between trips", "off the road". Säg caravan där det passar (GB/AU/NZ), motorhome, och RV en gång som amerikansk synonym.';

export const KAMPANJER = [
  {
    id: 'k01-regnet-vid-takluckan', datum: '2026-09-29', prefix: 'CaraShellRoof', kod: 'PD', nr: 1, awareness: 'problem', hook: 'regnet-vid-takluckan',
    memo: 'Problemvinkeln bär butikens egen data: PD/SP är de vinklar som köper hos CaraShell (dna.md mönster 11). Regnet står kvar vid takluckan, tätmassan mjuknar, fukttestet till våren. sv/nb: inför vinteruppställningen. en: vagnen står parkerad — ingen årstid.',
    taggar: { typ: 'I', kalla: 'egen-data', kalla_ref: 'products/carashell/takskyddet/dna.md mönster 11; factory/produkter/takskyddet.yaml#beskrivning', avatar: 'husvagns- eller husbilsägaren som ställer upp fordonet utomhus', begar: 'skydda-det-jag-ager', urgency: 'sasong', confidence: 'medium' },
    brief: (s) => `Hero (bild taköverdraget) med problemet ur faktabladet (regnet vid takluckan, tätmassan, fukttestet). Text: vad överdraget täcker (taket, kanten 30–40 cm ner) och inte täcker. Punkter: nio längder, banden, en person. Produktkort, ${s === 'en' ? 'ingen citat' : 'två citat'}, fakta, knapp. ${s === 'en' ? EN_HEMISFAR : 'Vintern får nämnas: uppställningen är riktig säsong (urgency sasong).'}`,
    block: (s) => [
      { typ: 'hero', rubrik: c('rubrik: regnet vid takluckan'), text: c('1–2 meningar'), bild: 'produkt:takskyddet', knapp: { text: c('knapp'), lank: 'produkt:takskyddet' } },
      { typ: 'text', rubrik: null, text: c('vad täcks och vad täcks inte') },
      { typ: 'punkter', rubrik: c('rubrik för tre punkter'), punkter: [c('nio längder'), c('banden och krokarna'), c('en person')] },
      { typ: 'produkt', handle: 'takskyddet', text: c('en mening under produktkortet'), knapp: c('knapp') },
      ...(s === 'en' ? [] : [{ typ: 'citat', handle: 'takskyddet', antal: 2 }]),
      { typ: 'fakta' },
      { typ: 'knapp', text: c('avslutande knapp'), lank: 'produkt:takskyddet' },
    ],
  },
  {
    id: 'k02-nio-langder', datum: '2026-10-06', prefix: 'CaraShellRoof', kod: 'OB', nr: 2, awareness: 'product', hook: 'nio-langder',
    memo: 'Kundernas egna ord i kommentarerna (25 sep, alla marknader): "bara 6,5 m", "only one size", "looking for 12×40". Storleksvalet syns inte för dem. Mejlet gör valet till huvudsaken: nio längder 5,5–13,5 m, alla 3 m breda, mät front till bakkant, välj närmaste längd uppåt.',
    taggar: { typ: 'I', kalla: 'voc', kalla_ref: 'kommentarer/leads.md 2026-09-25 + 2026-09-26 (storleksvalet syns inte)', avatar: 'ägaren som tror att överdraget bara finns i en storlek', begar: 'veta att det finns en storlek som passar', urgency: 'ingen', confidence: 'medium' },
    brief: (s) => `Hero: storleken är huvudsaken. Punkter: hur man mäter, längderna, bredden, husvagn och husbil. Produktkort, fakta. ${s === 'en' ? 'Mått i fot OCH meter som faktabladet skriver dem (18–44 ft, 10 ft). ' + EN_HEMISFAR : ''}`,
    block: [
      { typ: 'hero', rubrik: c('rubrik: nio längder / vilken passar din?'), text: c('1–2 meningar'), bild: 'produkt:takskyddet', knapp: { text: c('knapp'), lank: 'produkt:takskyddet' } },
      { typ: 'punkter', rubrik: c('rubrik: så väljer du'), punkter: [c('mät taket front till bakkant'), c('längderna och bredden'), c('husvagn och husbil')] },
      { typ: 'produkt', handle: 'takskyddet', text: c('en mening'), knapp: c('knapp') },
      { typ: 'fakta' },
    ],
  },
  {
    id: 'k03-imman-pa-rutan', datum: '2026-10-13', prefix: 'CaraShellFront', kod: 'PD', nr: 1, awareness: 'problem', hook: 'imman-mellan-gardin-och-glas',
    memo: 'Termoskyddet med sin egen problemrad ur faktabladet (imman sitter kvar mellan gardin och glas, trettio grader före frukost, insyn på rastplatsen) och nyheten fönstertermomatta 2-pack för smårutorna. Källans CS-manus (falsk brådska) används aldrig; PD är odömd hos CaraShell (dna.md mönster 2) — det här är testet.',
    taggar: { typ: 'N', kalla: 'egen-data', kalla_ref: 'products/carashell/termoskyddet/dna.md mönster 1–2; factory/produkter/termoskyddet.yaml#beskrivning', avatar: 'husbilsägaren som sover i bilen på ställplatser och rastplatser', begar: 'slippa-krangel', urgency: 'ingen', confidence: 'low' },
    brief: (s) => `Hero (bild termoskyddet) med imman. Punkter: utvändigt över vindrutan och sidorutorna, flikarna i dörrkarmen, mörklägger hela framvagnen. Produktrad med termoskyddet och fönstertermomattan (nyhet — säg bara namnet och måtten 70 × 80 cm, 2-pack; inget annat är känt om den). Fakta. ${s === 'en' ? EN_HEMISFAR + ' 86 °F som faktabladet skriver.' : 'Höst- och vinterresor får nämnas.'}`,
    block: [
      { typ: 'hero', rubrik: c('rubrik: imman'), text: c('1–2 meningar'), bild: 'produkt:termoskyddet', knapp: { text: c('knapp'), lank: 'produkt:termoskyddet' } },
      { typ: 'punkter', rubrik: c('rubrik'), punkter: [c('utvändigt'), c('dörrkarmen'), c('mörklägger')] },
      { typ: 'produktrad', rubrik: c('rubrik: rutan och smårutorna'), handles: ['termoskyddet', 'fonstertermomatta-2-pack'] },
      { typ: 'fakta' },
    ],
  },
  {
    id: 'k04-vecka-43', datum: '2026-10-20', prefix: 'CaraShellRoof',
    // sv/nb: fars dag (sista beställningsdag mån 26/10). en: vinden.
    perSprak: {
      sv: { kod: 'GT', nr: 1, awareness: 'solution', hook: 'fars-dag-26-okt', memo: 'Presenten till honom som ställer undan vagnen: fars dag 8/11, sista beställningsdag mån 26 oktober (10 arbetsdagar + 2). Riktig brådska med datum. Presentvinkeln är dödvikt i annonserna hos CaraShell (dna.md mönster 12) men i mejl går den till folk som redan känner butiken — hypotesen är att datumet, inte vinkeln, säljer.', taggar: { typ: 'I', kalla: 'egen-data', kalla_ref: 'products/carashell/takskyddet/dna.md mönster 12; brands/carashell.json#kalender', avatar: 'den som letar present till en pappa med husvagn eller husbil', begar: 'en present han faktiskt använder', urgency: 'konsekvens', confidence: 'low' } },
      nb: { kod: 'GT', nr: 1, awareness: 'solution', hook: 'farsdag-26-okt', memo: 'Samma som svenskan: farsdag 8/11 i Norge, siste bestillingsdag man 26. oktober.', taggar: { typ: 'I', kalla: 'egen-data', kalla_ref: 'brands/carashell.json#kalender', avatar: 'den som leter etter gave til en pappa med campingvogn eller bobil', begar: 'en present han faktiskt använder', urgency: 'konsekvens', confidence: 'low' } },
      en: { kod: 'OB', nr: 3, awareness: 'product', hook: 'does-it-stay-on-in-wind', memo: 'Vinden och remmarna är invändning nummer två i kommentarerna (sv/no/en/dk 24–26 sep: "straps break off", "sönderblåst", "Sebra"). Svaret med faktabladets ord: vävda spännband, inte elastiska, plastkrokar under karossens kant på alla fyra sidor, justerbara, två extra 10,5 m band, håller i blåst. Inget om lacken utöver faktabladet.', taggar: { typ: 'I', kalla: 'voc', kalla_ref: 'kommentarer/leads.md 2026-09-24 (remmarna), 2026-09-26 (fungerar det)', avatar: 'ägaren som undrar om det blåser av', begar: 'trygghet', urgency: 'ingen', confidence: 'medium' } },
    },
    brief: (s) => s === 'en'
      ? `Hero: frågan om vinden. Punkter: banden (webbing, not elastic), krokarna på fyra sidor, de två extra banden. Produktkort, fakta. ${EN_HEMISFAR}`
      : 'Hero: presenten. Text med datumet skrivet ut ("beställ senast måndag 26 oktober") och varför (så att paketet hinner fram till fars dag) — utan leveranstid i dagar. Produktrad: taköverdraget + termoskyddet. Fakta.',
    block: (s) => s === 'en'
      ? [
        { typ: 'hero', rubrik: c('rubrik: does it stay on in wind?'), text: c('1–2 meningar'), bild: 'produkt:takskyddet', knapp: { text: c('knapp'), lank: 'produkt:takskyddet' } },
        { typ: 'punkter', rubrik: c('rubrik'), punkter: [c('webbing straps, not elastic'), c('hooks under the edge, all four sides'), c('two extra straps')] },
        { typ: 'produkt', handle: 'takskyddet', text: c('en mening'), knapp: c('knapp') },
        { typ: 'fakta' },
      ]
      : [
        { typ: 'hero', rubrik: c('rubrik: presenten till honom med vagnen'), text: c('1–2 meningar'), bild: 'produkt:takskyddet', knapp: { text: c('knapp'), lank: 'produkt:takskyddet' } },
        { typ: 'text', rubrik: null, text: c('datumet: beställ senast måndag 26 oktober') },
        { typ: 'produktrad', rubrik: c('rubrik'), handles: ['takskyddet', 'termoskyddet'] },
        { typ: 'fakta' },
      ],
  },
  {
    id: 'k05-adventskalendern', datum: '2026-10-27', prefix: 'CaraShellCal', kod: 'GT', nr: 2, awareness: 'product', hook: 'retrobussar-24-luckor',
    memo: 'Ny produkt i butiken: adventskalender med retrobussar, 24 luckor (läst i Shopify 2026-09-26). Presenten till husvagnsfolket. Sista beställningsdag för lucka 1: fredag 13 november. Om kalenderns innehåll är BARA titeln känd (24 luckor, retrobussar) — inget mer får påstås.',
    taggar: { typ: 'N', kalla: 'gissning', kalla_ref: null, avatar: 'den som ger en kalender till någon med husvagn eller husbil', begar: 'en present som passar just den personen', urgency: 'konsekvens', confidence: 'low' },
    brief: (s) => `Hero (bild adventskalendern). Text: 24 luckor, retrobussar, datumet fredag 13 november skrivet ut. Produktkort, fakta. Inget om vad som finns bakom luckorna. ${s === 'en' ? EN_HEMISFAR : ''}`,
    block: [
      { typ: 'hero', rubrik: c('rubrik: adventskalendern'), text: c('1–2 meningar'), bild: 'produkt:adventskalender-retrobussar', knapp: { text: c('knapp'), lank: 'produkt:adventskalender-retrobussar' } },
      { typ: 'text', rubrik: null, text: c('datumet fredag 13 november för lucka 1') },
      { typ: 'produkt', handle: 'adventskalender-retrobussar', text: c('en mening'), knapp: c('knapp') },
      { typ: 'fakta' },
    ],
  },
  {
    id: 'k06-vecka-45', datum: '2026-11-03', prefix: 'CaraShellRoof',
    perSprak: {
      sv: { kod: 'OB', nr: 3, awareness: 'product', hook: 'sitter-det-kvar-i-blast', memo: 'Vinden och remmarna (kommentarerna 24–26 sep: "sönderblåst", "Sebra", "skaver inte alla remmar"). Svaret med faktabladets ord: vävda spännband, inte gummi, töjs inte ut, plastkrokar under karossens kant på alla fyra sidor, justerbara, två extra band 10,5 m, håller i blåst.', taggar: { typ: 'I', kalla: 'voc', kalla_ref: 'kommentarer/leads.md 2026-09-24 (Sebra), 2026-09-26 (fungerar det)', avatar: 'ägaren som undrar om det blåser av', begar: 'trygghet', urgency: 'ingen', confidence: 'medium' } },
      nb: { kod: 'OB', nr: 3, awareness: 'product', hook: 'sitter-det-fast-i-vind', memo: 'Samma som svenskan, norska kommentarer: "forsvant med nordvest kulingen", "svake strikk". Svaret: vevde bånd, ikke strikk.', taggar: { typ: 'I', kalla: 'voc', kalla_ref: 'kommentarer/rapporter/2026-09-26.md (Takovertrekk)', avatar: 'eieren som lurer på om det blåser av', begar: 'trygghet', urgency: 'ingen', confidence: 'medium' } },
      en: { kod: 'GT', nr: 1, awareness: 'solution', hook: 'the-gift-for-the-one-with-the-caravan', memo: 'Presenten till den som har vagnen: julen närmar sig, och överdraget är en present som används. Ingen farsdag på engelska (USA juni, UK mars). Sista beställningsdag för jul kommer i K10.', taggar: { typ: 'I', kalla: 'gissning', kalla_ref: null, avatar: 'den som letar present till någon med husvagn eller husbil', begar: 'en present som används', urgency: 'ingen', confidence: 'low' } },
    },
    brief: (s) => s === 'en'
      ? `Hero: presenten. Text: varför ett skydd är en present som används (bara faktabladets fakta). Produktrad: takskyddet + termoskyddet. Fakta. ${EN_HEMISFAR}`
      : 'Hero: frågan om vinden. Punkter: banden (vävda, inte gummi), krokarna på fyra sidor, de två extra banden. Produktkort, fakta. Inget om lacken utöver faktabladet.',
    block: (s) => s === 'en'
      ? [
        { typ: 'hero', rubrik: c('rubrik: the gift'), text: c('1–2 meningar'), bild: 'produkt:takskyddet', knapp: { text: c('knapp'), lank: 'produkt:takskyddet' } },
        { typ: 'text', rubrik: null, text: c('varför det är en present som används') },
        { typ: 'produktrad', rubrik: c('rubrik'), handles: ['takskyddet', 'termoskyddet'] },
        { typ: 'fakta' },
      ]
      : [
        { typ: 'hero', rubrik: c('rubrik: sitter det kvar i blåst?'), text: c('1–2 meningar'), bild: 'produkt:takskyddet', knapp: { text: c('knapp'), lank: 'produkt:takskyddet' } },
        { typ: 'punkter', rubrik: c('rubrik'), punkter: [c('vävda band, inte gummi'), c('krokar under kanten, fyra sidor'), c('två extra band')] },
        { typ: 'produkt', handle: 'takskyddet', text: c('en mening'), knapp: c('knapp') },
        { typ: 'fakta' },
      ],
  },
  {
    id: 'k07-fredag-sista-dagen-kalendern', datum: '2026-11-10', prefix: 'CaraShellCal', kod: 'GT', nr: 3, awareness: 'promo', hook: 'fredag-sista-dagen',
    memo: 'Riktig brådska: fredag 13 november är sista beställningsdag för att kalendern ska vara hemma till lucka 1. Efter fredagen lovar ingen text något om 1 december.',
    taggar: { typ: 'S', kalla: 'egen-data', kalla_ref: 'brands/carashell.json#kalender', avatar: 'den som tänkt ge kalendern men inte beställt', begar: 'hinna', urgency: 'konsekvens', confidence: 'medium' },
    brief: () => 'Hero med datumet. En mening om varför (lucka 1 är 1 december). Produktkort, fakta. Inga dagar-siffror om leverans.',
    block: [
      { typ: 'hero', rubrik: c('rubrik: fredag är sista dagen'), text: c('1–2 meningar'), bild: 'produkt:adventskalender-retrobussar', knapp: { text: c('knapp'), lank: 'produkt:adventskalender-retrobussar' } },
      { typ: 'produkt', handle: 'adventskalender-retrobussar', text: c('en mening'), knapp: c('knapp') },
      { typ: 'fakta' },
    ],
  },
  {
    id: 'k08-checklistan', datum: '2026-11-17', prefix: 'CaraShellMix', kod: 'S', nr: 1, awareness: 'solution', hook: 'innan-vagnen-stalls-undan',
    memo: 'Säsongslistan (Bäverbutikens K02 gav idén om en checklista per produkt, egen copy): taket, rutan, smårutorna. sv/nb: innan vagnen ställs undan för vintern. en: before it sits for a while / between trips.',
    taggar: { typ: 'S', kalla: 'egen-data', kalla_ref: 'factory/produkter/*.yaml', avatar: 'ägaren som ska ställa undan vagnen', begar: 'skydda-det-jag-ager', urgency: 'sasong', confidence: 'low' },
    brief: (s) => `Hero utan produktbild-krav (använd taköverdraget). Punkter: tre saker, en per produkt, med faktabladets ord. Produktrad med alla tre. Fakta. ${s === 'en' ? EN_HEMISFAR : ''}`,
    block: [
      { typ: 'hero', rubrik: c('rubrik: innan vagnen ställs undan'), text: c('1–2 meningar'), bild: 'produkt:takskyddet', knapp: { text: c('knapp'), lank: 'kollektion:sortimentet' } },
      { typ: 'punkter', rubrik: c('rubrik: tre saker'), punkter: [c('taket'), c('rutan'), c('smårutorna')] },
      { typ: 'produktrad', rubrik: null, handles: ['takskyddet', 'termoskyddet', 'fonstertermomatta-2-pack'] },
      { typ: 'fakta' },
    ],
  },
  {
    id: 'k09-black-week-utan-rabatt', datum: '2026-11-24', prefix: 'CaraShellRoof', kod: 'SP', nr: 1, awareness: 'product', hook: 'kundernas-ord',
    memo: 'Black Week-veckan UTAN rabatt (Axels beslut A/B/C väntar). sv/nb: social proof med butikens egna publicerade recensioner (SP är CaraShells vinkel, dna.md mönster 11). en: tryggheten i stället (90-day guarantee, free shipping, hur en retur går till) eftersom inga engelska recensioner finns att citera. Väljer Axel en rabatt skrivs det här mejlet om och ett Black Friday-mejl läggs till fre 27/11.',
    taggar: { typ: 'I', kalla: 'egen-data', kalla_ref: 'products/carashell/takskyddet/dna.md mönster 11 (SP_2_1); factory/produkter/takskyddet.yaml#reviews', avatar: 'prenumeranten som inte köpt än', begar: 'trygghet', urgency: 'ingen', confidence: 'medium' },
    brief: (s) => s === 'en'
      ? `Hero: tryggheten (90-day guarantee, free shipping — bara faktabladets ord). Punkter: guarantee, shipping, how to return (email first). Produktkort, fakta. ${EN_HEMISFAR} Inga recensioner, inga siffror om recensioner.`
      : 'Citat först (två), sedan hero med kundernas ord som rubrik, produktkort, fakta. Inga påhittade omdömen; blocket citat hämtar butikens egna.',
    block: (s) => s === 'en'
      ? [
        { typ: 'hero', rubrik: c('rubrik: tryggheten'), text: c('1–2 meningar'), bild: 'produkt:takskyddet', knapp: { text: c('knapp'), lank: 'produkt:takskyddet' } },
        { typ: 'punkter', rubrik: c('rubrik'), punkter: [c('guarantee'), c('shipping'), c('how to return')] },
        { typ: 'produkt', handle: 'takskyddet', text: c('en mening'), knapp: c('knapp') },
        { typ: 'fakta' },
      ]
      : [
        { typ: 'citat', handle: 'takskyddet', antal: 2 },
        { typ: 'hero', rubrik: c('rubrik: kundernas ord'), text: c('1–2 meningar'), bild: 'produkt:takskyddet', knapp: { text: c('knapp'), lank: 'produkt:takskyddet' } },
        { typ: 'produkt', handle: 'takskyddet', text: c('en mening'), knapp: c('knapp') },
        { typ: 'fakta' },
      ],
  },
  {
    id: 'k10-sista-dag-for-julklappar', datum: '2026-12-01', prefix: 'CaraShellMix', kod: 'GT', nr: 4, awareness: 'promo', hook: 'bestall-senast-mandag-7-dec',
    memo: 'Riktig brådska: måndag 7 december är sista beställningsdag för att paketet ska hinna fram till jul (10 arbetsdagar + 2). Efter det lovar ingen text något om jul.',
    taggar: { typ: 'S', kalla: 'egen-data', kalla_ref: 'brands/carashell.json#kalender', avatar: 'den som letar julklapp till någon med husvagn eller husbil', begar: 'hinna', urgency: 'konsekvens', confidence: 'medium' },
    brief: (s) => `Hero med datumet måndag 7 december. Produktrad med de tre skydden. Fakta. ${s === 'en' ? EN_HEMISFAR + ' Christmas är ok, det är en högtid, inte en årstid.' : ''}`,
    block: [
      { typ: 'hero', rubrik: c('rubrik: beställ senast måndag 7 december'), text: c('1–2 meningar'), bild: 'produkt:takskyddet', knapp: { text: c('knapp'), lank: 'kollektion:sortimentet' } },
      { typ: 'produktrad', rubrik: c('rubrik'), handles: ['takskyddet', 'termoskyddet', 'fonstertermomatta-2-pack'] },
      { typ: 'fakta' },
    ],
  },
  {
    id: 'k11-rutan-pa-resorna', datum: '2026-12-08', prefix: 'CaraShellFront', kod: 'PD', nr: 2, awareness: 'solution', hook: 'kylan-borta-fran-rutan',
    memo: 'Termoskyddet och fönstertermomattan för den som reser: håller kylan och solen borta från vindrutan och sidorutorna, mörklägger. sv/nb: vinterresor, fjällen får nämnas som plats men inga påståenden om isolervärde. en: the trips ahead — ingen årstid.',
    taggar: { typ: 'N', kalla: 'egen-data', kalla_ref: 'factory/produkter/termoskyddet.yaml#beskrivning', avatar: 'husbilsägaren som reser även när det är kallt', begar: 'njutning', urgency: 'ingen', confidence: 'low' },
    brief: (s) => `Hero (bild termoskyddet). Text: kylan och solen borta från rutan, ingen imma, mörkt när du sover. Produktrad: termoskyddet + fönstertermomattan. Fakta. Aldrig isolervärde, material eller vikt. ${s === 'en' ? EN_HEMISFAR : ''}`,
    block: [
      { typ: 'hero', rubrik: c('rubrik: rutan på resorna'), text: c('1–2 meningar'), bild: 'produkt:termoskyddet', knapp: { text: c('knapp'), lank: 'produkt:termoskyddet' } },
      { typ: 'produktrad', rubrik: c('rubrik'), handles: ['termoskyddet', 'fonstertermomatta-2-pack'] },
      { typ: 'fakta' },
    ],
  },
  {
    id: 'k12-efter-blasten', datum: '2026-12-15', prefix: 'CaraShellRoof', kod: 'M', nr: 1, awareness: 'product', hook: 'kolla-banden-efter-blasten',
    memo: 'Servicemejl utan produktkort: efter en storm, gå ut och kolla att krokarna sitter under kanten och att banden är åtdragna. Skälet: ett överdrag som sitter rätt håller (faktabladet: håller i blåst), och kunden ska höra av sig om något gått sönder. Ingen försäljning.',
    taggar: { typ: 'M', kalla: 'voc', kalla_ref: 'kommentarer/rapporter/2026-09-26.md (sönderblåst efter stormen)', avatar: 'kunden som har överdraget på vagnen', begar: 'kontroll', urgency: 'ingen', confidence: 'medium' },
    brief: (s) => `Rubrik + en mening. Punkter: tre saker att kolla (krokarna under kanten, banden åtdragna, de två extra banden). Grundare-rad: gick något sönder, svara på mejlet. Inga produktkort, ingen knapp. ${s === 'en' ? EN_HEMISFAR + ' "After strong wind" räcker.' : ''}`,
    block: [
      { typ: 'text', rubrik: c('rubrik: efter blåsten'), text: c('en mening') },
      { typ: 'punkter', rubrik: null, punkter: [c('krokarna under kanten'), c('banden åtdragna'), c('de extra banden')] },
      { typ: 'grundare', text: c('gick något sönder, svara på mejlet') },
    ],
  },
  {
    id: 'k13-nyarskoll', datum: '2026-12-29', prefix: 'CaraShellMix', kod: 'S', nr: 2, awareness: 'solution', hook: 'en-koll-innan-sasongen',
    memo: 'Mellandagarna: gå ut och titta på vagnen. sv/nb: står taket torrt, är rutan täckt. en: the start of the year check. Produktrad med alla tre.',
    taggar: { typ: 'S', kalla: 'gissning', kalla_ref: null, avatar: 'ägaren som inte tittat på vagnen sedan hösten', begar: 'kontroll', urgency: 'sasong', confidence: 'low' },
    brief: (s) => `Rubrik + två stycken. Produktrad med alla tre. Fakta. ${s === 'en' ? EN_HEMISFAR + ' Nyår är ok.' : ''}`,
    block: [
      { typ: 'text', rubrik: c('rubrik: en koll i mellandagarna / at the start of the year'), text: c('två stycken') },
      { typ: 'produktrad', rubrik: c('rubrik'), handles: ['takskyddet', 'termoskyddet', 'fonstertermomatta-2-pack'] },
      { typ: 'fakta' },
    ],
  },
];

// -------------------------------------------------------------- generatorn

const FILTER_KEYS = ['samtycke', 'ej_avregistrerad', 'sprak', 'ej_kopt_sedan_start', 'ej_kassa_sedan_start'];

function mejlSkelett(m, s, namn) {
  const block = (typeof m.block === 'function' ? m.block(s) : m.block).map((b) => JSON.parse(JSON.stringify(b)));
  return {
    id: `${m.id}`,
    namn,
    sprak: s,
    memo: m.memo,
    brief: typeof m.brief === 'function' ? m.brief(s) : m.brief,
    taggar: TAG({ ...m.taggar, ...(m.prefix ? { prefix: m.prefix } : {}), ...(m.kod ? { kod: m.kod } : {}) }),
    ...(m.format ? { format: m.format } : {}),
    amnesrader: [
      { text: c('ämnesrad A, eget begär'), begar: c('begäret') },
      { text: c('ämnesrad B, eget begär'), begar: c('begäret') },
      { text: c('ämnesrad C, eget begär'), begar: c('begäret') },
    ],
    forhandstext: c('förhandstext som fortsätter ämnesrad A utan att upprepa den'),
    block,
    tretest: [],
    version: 1,
  };
}

export function byggFlode(f, s) {
  for (const k of f.spoks.filter) if (!FILTER_KEYS.includes(k)) throw new Error(`${f.id}: okänd filternyckel ${k}`);
  const S = s.toUpperCase();
  const steg = f.steg.map((st, i) => {
    if (st.vanta) return { typ: 'vanta', enhet: st.vanta.enhet, varde: st.vanta.varde };
    const m = st.mejl;
    const e = f.steg.slice(0, i).filter((x) => x.mejl).length + 1;
    const namn = `${f.namnBas.replace('FLOW_', 'FLOW_')}_${S}_E${e}_${m.kod}_${m.hook}_v1`;
    return { typ: 'mejl', mejl: mejlSkelett(m, s, namn) };
  });
  return { id: f.id, namn: `${f.namnBas}_${S}_v1`, sprak: s, memo: f.memo, spoks: f.spoks, steg };
}

export function byggKampanj(k, s) {
  const v = k.perSprak ? { ...k, ...k.perSprak[s] } : k;
  const S = s.toUpperCase();
  const datumKompakt = k.datum.replace(/-/g, '');
  const namn = `MAIL_${datumKompakt}_${v.prefix}_${S}_${v.kod}_${v.nr}_samtycke_${v.awareness}_${v.hook}_v1`;
  const mejl = mejlSkelett({ ...v, block: k.block, brief: k.brief, id: k.id }, s, namn);
  return {
    ...mejl,
    planerad: nar(k.datum, s),
    segment: [`SEG_samtycke_${s}`],
    exkludera: [],
    status_plan: k.id === 'k09-black-week-utan-rabatt' ? 'kraver-axel' : 'utkast-skrivs-om-efter-lardom',
    kraver_axel: k.id === 'k09-black-week-utan-rabatt' ? 'Black Week: rabatt eller inte är Axels beslut (A/B/C i rapporten 2026-09-26). Utkastet säljer utan rabatt.' : null,
  };
}

function main() {
  const skrivOm = process.argv.includes('--skriv-om');
  let skrivna = 0, hoppade = 0;
  for (const s of SPRAK) {
    for (const [mapp, lista, bygg] of [['floden', FLODEN, byggFlode], ['kampanjer', KAMPANJER, byggKampanj]]) {
      const dir = path.join(HAR, mapp, s);
      fs.mkdirSync(dir, { recursive: true });
      for (const x of lista) {
        const fil = path.join(dir, `${x.id}.json`);
        if (fs.existsSync(fil) && !skrivOm) { hoppade++; continue; }
        fs.writeFileSync(fil, JSON.stringify(bygg(x, s), null, 2) + '\n');
        skrivna++;
      }
    }
  }
  console.log(`${skrivna} skelett skrivna, ${hoppade} fanns redan (--skriv-om skriver över).`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
