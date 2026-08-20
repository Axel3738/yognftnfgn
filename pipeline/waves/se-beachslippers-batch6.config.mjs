// SE Strandtofflorna — Batch 6, 2026-08-19.
//
// Tolv statiska (bara 1:1), rakt in i den befintliga CBO-kampanjen
// "Strandtofflorna" (1500 kr/dag). Ingen budget på adsetnivå, inget minimum spend.
//
// COPY: briefarna ligger inte i Notion utan i Google Drive-mapparna som
// Notion-sidorna länkar till. Varje brief säger uttryckligen vilken copy som
// gäller, och de säger INTE samma sak:
//   · PD_2_7, PD_13_17, PD_18_1, PD_19_1, PD_20_1, SP_9_1/2/3
//       → "primary text and headline copied verbatim from PD_2_3" (= PD_13_1,
//         båda kör identisk text i kontot). Ärvd ordagrant.
//   · PD_2_9   → egen briefad copy, copy-rotation "the clearance"
//   · PD_13_19 → egen briefad copy, copy-rotation "convenience"
//   · SO_7_1 + SO_7_2 → egen briefad copy, ORDAGRANT IDENTISK mellan de två.
//         Briefen: "Do not improve the wording. Any difference between the two
//         plates destroys the comparison."
//
// PRISER kontrollerade mot butiken 2026-08-19: 349 kr, ordinarie 420 kr, på
// samtliga 36 varianter. Briefarna förbjuder procentsats, slutdatum och
// lagersiffror — enda tillåtna knapphet är "så långt lagret räcker".
//
// ADSET-INDELNING: briefarna styr, eftersom Axel sa "om inte notion säger något
// annat för dessa items". De kräver max 3 annonser per adset (kontots
// återkommande problem är att testarmar svälter), och tre specifika grupperingar:
//   · SO_7_1 + SO_7_2 måste ligga i SAMMA adset och launchas samma dag,
//     annars går paret inte att läsa.
//   · PD_2_9 ska ligga i samma adset som SO_7_2 — den testar samma erbjudande
//     fast bara i copyn i stället för som platta i bilden. Den heter PD men är
//     ett offer-test, och ligger därför i SO-adsetet.
//   · SP_9_1/2/3 ska ligga i "one shared ad set, these three only".
// Övriga PD delas i två set om tre: de tre som briefas till "PD statics ad set"
// och de tre som briefas till "own small ad set, max 3 ads".
//
// SAKNAS I META: Beachslippers_PD_2_8_1x1 och Beachslippers_PD_13_18_1x1 blev
// aldrig uppladdade (grannarna 2_7, 2_9, 13_17, 13_19 kom in 06:55). Båda har
// färdiga briefs med egen copy-rotation — "rinses clean" respektive "grip on wet
// surfaces". Ladda upp dem och kör om konfigen, så byggs bara de som saknas.

const LP = 'https://baverbutiken.se/products/strandtofflor-for-herr-halkfria-tradgardsskor';

// Ordagrant ur Beachslippers_PD_2_3 / PD_13_1 i kontot.
const COPY_PARENT = {
  message: 'Halkar du fortfarande på blöta altanen? 😬\nDessa tofflor har halkfri sula som greppar på blött däck, våt gräsmatta och hala stenar.\n✅ Mjukt EVA-material – skönt hela dagen\n✅ Kliv i på 2 sekunder, inga snören\n✅ Torkar snabbt, lätta att skölja rena\nBeställ dina idag och sluta oroa dig för nästa steg 👇',
  headline: 'Halkfria skor för trädgården & altanen',
  description: 'Grepp och komfort, oavsett underlag.',
  cta: 'SHOP_NOW', link: LP,
};

// Ordagrant ur brief_SO_7_1.md. Identisk för SO_7_2 enligt briefens uttryckliga krav.
const COPY_SO_7 = {
  message: 'Vi på Bäverbutiken beställde in för mycket och behöver frigöra lagerutrymme snabbt.\n✅ Mjuk och lätt EVA som känns skön mot foten hela dagen\n✅ Tjock, halkfri sula med grovt mönster som greppar säkert på blött underlag\n✅ Storlek 36 till 47 i svart, kaki och vit, med 30 dagars nöjd-kund-garanti\nHandla dina strandtofflor så långt lagret räcker 👉',
  headline: '349 kr istället för 420 kr',
  description: '', cta: 'SHOP_NOW', link: LP,
};

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
      // Befintlig CBO-kampanj, 1500 kr/dag — ingen create, inga adsetbudgetar.
      campaignName: 'Strandtofflorna',
      adsets: [
        // Briefade till "PD statics ad set". PD_13_19 bär egen copy-rotation.
        {
          name: 'Strandtofflor PD Batch 6',
          link: LP,
          motifs: [
            { name: 'Beachslippers_PD_2_7', copy: COPY_PARENT },
            { name: 'Beachslippers_PD_19_1', copy: COPY_PARENT },
            { name: 'Beachslippers_PD_13_19', copy: {
              message: 'Inga snören, inga spännen att fippla med. Kliv i på två sekunder och gå.\n✅ Mjukt lätt EVA som är skönt direkt från start\n✅ Perfekt när du är på väg ut till altanen eller bryggan\n✅ Tjock sula som dämpar utan att kännas klumpig\n👉 Beställ dina strandtofflor för 349 kr, ordinarie 420 kr, så långt lagret räcker',
              headline: 'Kliv i på två sekunder',
              description: '', cta: 'SHOP_NOW', link: LP } },
          ],
        },

        // Briefade till "own small ad set, max 3 ads". Alla tre ärver PD_2_3:s copy —
        // det är bilden som är variabeln, inte texten.
        {
          name: 'Strandtofflor PD Batch 6 - bevis',
          copy: COPY_PARENT, link: LP,
          motifs: ['Beachslippers_PD_13_17', 'Beachslippers_PD_18_1', 'Beachslippers_PD_20_1'],
        },

        // SO_7_1 och SO_7_2 måste ligga ihop och launchas samma dag.
        // PD_2_9 kör samma erbjudande men bara i copyn — briefen vill ha den här.
        {
          name: 'Strandtofflor SO Batch 6',
          link: LP,
          motifs: [
            { name: 'Beachslippers_SO_7_1', copy: COPY_SO_7 },
            { name: 'Beachslippers_SO_7_2', copy: COPY_SO_7 },
            { name: 'Beachslippers_PD_2_9', copy: {
              message: 'Butiken beställde in för många strandtofflor. Nu säljs resten ut för 349 kr, ordinarie 420 kr.\n✅ Samma halkfria toffla som vanligt, nu till lägre pris för dig\n✅ Grovt, däckliknande mönster som greppar på blött underlag\n✅ 30 dagars nöjd kund garanti om den inte passar\n👉 Så långt lagret räcker. Beställ dina strandtofflor för 349 kr redan idag',
              headline: 'Lagerutförsäljning: 349 kr',
              description: '', cta: 'SHOP_NOW', link: LP } },
          ],
        },

        // "One shared ad set, these three only." Texten på bilden är variabeln.
        {
          name: 'Strandtofflor SP Batch 6',
          copy: COPY_PARENT, link: LP,
          motifs: ['Beachslippers_SP_9_1', 'Beachslippers_SP_9_2', 'Beachslippers_SP_9_3'],
        },
      ],
    },
  ],
};
