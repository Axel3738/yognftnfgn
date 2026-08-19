// SE Sätesöverdraget — Batch 6, 2026-08-19.
//
// Fem statiska, alla med 1:1 och 4:5. Två nya adsets, utspritt efter koncept.
//
// STRUKTUR enligt Axels instruktion: rakt in i den befintliga CBO-kampanjen
// "Sätesöverdragaren" (3000 kr/dag). Ingen ABO, ingen budget på adsetnivå —
// kampanjen fördelar. Inget minimum spend.
//
// COPY: samtliga fem har egna copy-cards i Notions "Mower seat creative hub",
// och texten är i varje fall skriven för att matcha den text som är inbränd i
// just den bilden — SO_9_1:s bild frågar om handduken på sätet och primärtexten
// gör detsamma, PD_21_1:s bild handlar om jackan och texten likaså. Generisk
// konceptcopy hade sagt något annat än bilden. Därför brief-copy per annons.
//
// ⚠️ Seatcover_PD_14_1 och Seatcover_SO_4_1 kör redan i kampanjen sedan batch 4
// (adset "Seatcover PD Batch 4" respektive "Seatcover SO Batch 4", båda ACTIVE).
// De byggs här igen enligt instruktionen, men det innebär att de konkurrerar mot
// sig själva i samma CBO-pott.

const LP = 'https://baverbutiken.se/products/satesoverdrag-for-akgrasklippare-slittaligt-600d-oxford';

export default {
  act: 'act_1867947880635861',     // MagiBorsten (SE)
  page: '678639638662543',         // Bäverbutiken.se
  instagram: '17841474144960111',
  pixel: '1554276343018184',
  link: LP,
  dsaBeneficiary: 'Axel Odhner',
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['SE'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'ACTIVE',
  adStatus: 'ACTIVE',
  campaigns: [
    {
      // Befintlig CBO-kampanj, 3000 kr/dag — ingen create, inga adsetbudgetar.
      campaignName: 'Sätesöverdragaren',
      adsets: [
        {
          name: 'Seatcover PD Batch 6',
          link: LP,
          motifs: [
            { name: 'Seatcover_PD_14_1', copy: {
              message: 'Det här är exakt vad du får i paketet. Ett sätesöverdrag i slittåligt 600D Oxford-tyg, vadderat på insidan och med justerbara remmar som håller det på plats. ✅ Vattenavvisande – skyddar mot regn och dagg ✅ Vadderad insida – skönare att sitta på ✅ Justerbara remmar – glider inte på ojämn mark. Fyra färger att välja mellan. 👉 Handla nu.',
              headline: 'Sätesöverdrag i 600D Oxford',
              description: '', cta: 'SHOP_NOW', link: LP } },

            { name: 'Seatcover_PD_21_1', copy: {
              message: 'Lägger du en gammal jacka eller filt över sätet för att skydda det? Den glider av, sitter löst och skyddar sällan hela dynan. Vårt sätesöverdrag är sytt i slittåligt 600D Oxfordtyg, vattenavvisande och vadderat på insidan, med justerbara remmar som håller det på plats. Det är på plats på under 60 sekunder, helt utan verktyg. Just nu 649 kr istället för ordinarie 811 kr, med fri frakt, Klarna och 30 dagars öppet köp. Beställ ett riktigt sätesöverdrag nu.',
              headline: 'Bättre skydd än en gammal jacka',
              description: '', cta: 'SHOP_NOW', link: LP } },
          ],
        },
        {
          name: 'Seatcover SO Batch 6',
          link: LP,
          motifs: [
            { name: 'Seatcover_SO_4_1', copy: {
              message: 'Hösten är på väg och sätet på åkgräsklipparen kommer stå ute i regn och fukt i månader framöver. Skydda det nu istället för att köpa ett nytt säte till våren. ✅ Vattenavvisande 600D Oxford – håller sätet torrt ✅ Vadderad insida – skönare att sitta på ✅ På plats under 60 sekunder – inga verktyg. 649 kr (ord. 811 kr), fri frakt inom Sverige. Begränsat antal i lager. 👉 Handla nu.',
              headline: 'Skydda sätet inför hösten',
              description: '', cta: 'SHOP_NOW', link: LP } },

            { name: 'Seatcover_SO_8_1', copy: {
              message: 'Vi beställde in fler sätesöverdrag för åkgräsklippare än vi behöver, och nu säljer vi ut lagret. Överdraget är sytt i slittåligt 600D Oxfordtyg, vattenavvisande och vadderat på insidan för extra skydd åt sätesdynan. Justerbara remmar håller det på plats oavsett modell, och du trär det över sätet på under 60 sekunder utan verktyg. Just nu 649 kr istället för ordinarie 811 kr, med fri frakt, Klarna och 30 dagars öppet köp. Beställ ditt sätesöverdrag nu, så långt lagret räcker.',
              headline: 'Lagerutförsäljning: 649 kr',
              description: '', cta: 'SHOP_NOW', link: LP } },

            { name: 'Seatcover_SO_9_1', copy: {
              message: 'Ligger det fortfarande en handduk på sätet på åkgräsklipparen? Ett nytt säte kostar flera tusenlappar, men ett bra överdrag kostar betydligt mindre. Vårt sätesöverdrag är sytt i slittåligt 600D Oxfordtyg, vattenavvisande och vadderat på insidan, med justerbara remmar för universell passform. Du trär det över den befintliga sätesdynan på under 60 sekunder, helt utan verktyg. Nu 649 kr istället för ordinarie 811 kr, med fri frakt, Klarna och 30 dagars öppet köp. Byt ut handduken mot ett riktigt överdrag nu.',
              headline: 'Släng handduken. Nu 649 kr.',
              description: '', cta: 'SHOP_NOW', link: LP } },
          ],
        },
      ],
    },
  ],
};
