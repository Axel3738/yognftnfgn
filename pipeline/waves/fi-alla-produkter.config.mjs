// FI — Magiborsten FI, majavakauppa.fi. Fyra kampanjer, 1000 kr/dag var (CBO).
//
// Ingen finsk copy fanns briefad i Notion. Texterna nedan är skrivna utifrån
// kontots etablerade koncept­struktur och den finska text som redan är inbränd i
// bilderna, så annons och creative säger samma sak.
//
// PRISER — hämtade från majavakauppa.fi 2026-08-12:
//   Merimoottorin suoja  29,95 €  (ord. 31,95 €)
//   Olkavyö trimmerille  59,95 €  (inget jämförpris i butiken)
//   Ajoleikkurin istuinsuoja 64,95 €  (ord. 70,95 €)
//   Rantatohvelit        34,95 €  (inget jämförpris i butiken)
// ⚠️ Bildernas jämförpriser stämmer INTE med butiken (bilderna visar 36,95 /
// 67,95 / 80,95). Copyn nedan anger därför bara det gällande priset och undviker
// jämförpris — samma disciplin som SE-briefsen kräver.

const LP_MOTOR = 'https://majavakauppa.fi/products/merimoottorin-suoja-420d-universaali-suoja';
const LP_OLKA  = 'https://majavakauppa.fi/products/olkavyo-trimmerille-saadettava-nailonvyo';
const LP_ISTU  = 'https://majavakauppa.fi/products/ajoleikkurin-istuinsuoja-kestava-600d-oxford';
const LP_TOHV  = 'https://majavakauppa.fi/products/rantatohvelit-miehille-liukumattomat-puutarhakengat';

const cbo = { objective: 'OUTCOME_SALES', status: 'PAUSED', dailyBudget: '100000' }; // 1000 kr/dag

export default {
  act: 'act_1619718346388201',   // Magiborsten FI (SEK)
  page: '1317870104733246',      // Majavakauppa — har inget IG-konto kopplat
  pixel: '1554276343018184',
  // Majavakauppa saknar Instagram-identitet, och Metas formatanpassning kräver en.
  // Bildannonserna byggs därför som vanliga enbildsannonser på 4:5.
  noFormatCustomization: true,
  dsaBeneficiary: 'Axel Odhner', // EU-krav
  targeting: {
    age_min: 18, age_max: 65,
    geo_locations: { countries: ['FI'], location_types: ['home', 'recent'] },
    targeting_automation: { advantage_audience: 1 },
  },
  adsetStatus: 'PAUSED',
  adStatus: 'PAUSED',
  campaigns: [
    {
      campaignName: 'Motorhöljet FI', create: cbo,
      adsets: [
        { name: 'Motorhölje FI - PD', link: LP_MOTOR, copy: {
            message: 'Sade, aurinko ja suola kuluttavat moottoriasi joka päivä ⛵\n\nTämä suoja pitää sään ja ruosteen loitolla.\nUniversaali istuvuus — sopii useimpiin perämoottoreihin.\nNopeasti päälle ja pois.\n\nSuojaa moottorisi jo tänään 👇',
            headline: 'Suojaa moottorisi — vuodesta toiseen',
            description: 'Kestävä 420D-kangas sadetta, aurinkoa ja suolaa vastaan.', link: LP_MOTOR },
          motifs: ['Enginecover_PD_16_1', 'Enginecover_PD_17_1',
                   'FI_Enginecover_PD_7_H1', 'FI_Motorholje_PD_1_H3'] },

        { name: 'Motorhölje FI - SP', link: LP_MOTOR, copy: {
            message: 'Veneilijät puhuvat tästä suojasta juuri nyt 🌊\n\nPysyy paikallaan myrskyssä ja kovassa tuulessa.\nPitää perämoottorin kuivana ja suojattuna.\n30 päivän tyytyväisyystakuu.\n\nKatso itse miksi 👇',
            headline: 'Suoja joka pysyy paikallaan',
            description: 'Vettä hylkivä 420D Oxford-kangas.', link: LP_MOTOR },
          motifs: ['Enginecover_SP_12_1', 'Enginecover_SP_12_2', 'Enginecover_SP_12_3',
                   'Enginecover_SP_14_1', 'FI_Enginecover_SP_5_H1',
                   'FI_Motorholje_SP_1_H1', 'FI_Motorholje_SP_1_H2'] },

        { name: 'Motorhölje FI - SO', link: LP_MOTOR, copy: {
            message: 'Tilasimme liikaa merimoottorin suojia 420D Oxford-kangasta ⚓\n\nNyt 29,95 €.\nVettä hylkivä suoja sadetta, aurinkoa ja pölyä vastaan.\nKiristysnyöri koko reunan ympäri tiiviiseen istuvuuteen.\nNopeasti päälle ja pois.\n\nNiin kauan kuin tavaraa riittää — tilaa suojasi nyt 👇',
            headline: 'Merimoottorin suoja nyt 29,95 €',
            description: 'Niin kauan kuin tavaraa riittää.', link: LP_MOTOR },
          motifs: ['Enginecover_SO_14_1', 'Enginecover_SO_14_2', 'Enginecover_SO_15_1',
                   'FI_Enginecover_SO_4_H1', 'FI_Motorholje_SO_1_H1', 'FI_Motorholje_SO_1_H2'] },
      ],
    },
    {
      campaignName: 'Axelbältet FI', create: cbo,
      adsets: [
        { name: 'Axelbälte FI - PD', link: LP_OLKA, copy: {
            message: 'Olkapäät kipeinä puutarhapäivän jälkeen? 😩\n\nTämä vyö jakaa trimmerin painon tasaisesti olkapäälle.\nVähemmän rasitusta käsille, niskalle ja selälle.\nSäädettävä, joten se istuu juuri sinulle.\n\nTrimmaa pidempään ilman kipua.\n👇 Tilaa omasi tänään.',
            headline: 'Trimmaa ilman olkapääkipua',
            description: 'Pehmustettu, säädettävä olkavyö trimmerille.', link: LP_OLKA },
          motifs: ['Trimmerbelt_PD_2_5', 'Trimmerbelt_PD_9_1', 'Trimmerbelt_PD_10_1',
                   'FI_Axelbalte_PD_1_H1', 'FI_Trimmerbelt_PD_3_H1'] },

        { name: 'Axelbälte FI - SP', link: LP_OLKA, copy: {
            message: 'Trimmerin paino ei kuulu käsivarsille 🙌\n\nOlkavyö siirtää painon olkapäälle ja selälle.\nSäädettävä, pehmustettu ja kestäväksi rakennettu.\nIlmainen toimitus ja 30 päivän palautusoikeus.\n\nKatso miksi niin moni valitsee sen 👇',
            headline: 'Trimmaa ilman olkapääkipua',
            description: 'Säädettävä olkavyö, pehmustetut hihnat.', link: LP_OLKA },
          motifs: ['FI_Axelbalte_SF_1_H1'] },

        { name: 'Axelbälte FI - SO', link: LP_OLKA, copy: {
            message: 'Puutarhakausi on täällä 🌿\n\nLopeta trimmerin koko painon kantaminen itse.\nVyö jakaa paineen tasaisesti olkapäälle ja selälle.\nSäädettävä — sopii sinulle koosta riippumatta.\n\nNyt 59,95 €, ilmainen toimitus. Tilaa tänään 👇',
            headline: 'Olkavyö trimmerille — 59,95 €',
            description: 'Ilmainen toimitus ja 30 päivän palautusoikeus.', link: LP_OLKA },
          motifs: ['Trimmerbelt_SO_2_7', 'FI_Axelbalte_SO_1_H2'] },
      ],
    },
    {
      campaignName: 'Sätesöverdraget FI', create: cbo,
      adsets: [
        { name: 'Seatcover FI - PD', link: LP_ISTU, copy: {
            message: 'Ajoleikkurin istuin on märkä joka aamu ja polttava joka iltapäivä. 😩\n\nIstuinsuojamme vedetään suoraan olemassa olevan pehmusteen päälle:\n✅ Vettä hylkivä 600D Oxford — kuiva istuin sateenkin jälkeen\n✅ Pehmustettu sisältä, ottaa töyssyt puolestasi\n✅ Säädettävät hihnat jotka eivät luista, epätasaisessakaan maastossa\n✅ Paikallaan alle 60 sekunnissa — ilman työkaluja\n\nSopii useimpiin ajoleikkureihin ja puutarhatraktoreihin. Neljä väriä.\n\n👉 Paina linkkiä ja katso miten helposti se menee paikalleen.',
            headline: 'Kuiva ja mukava istuin — koko kauden',
            description: 'Universaali istuvuus. Paikallaan alle minuutissa.', link: LP_ISTU },
          motifs: ['Seatcover_PD_14_1', 'FI_Seatcover_PD_1_3_H1', 'FI_Seatcover_PD_2_1_H1'] },

        { name: 'Seatcover FI - SO', link: LP_ISTU, copy: {
            message: 'Syksy tulee. Istuin ei ole valmis.\n\nSadetta ja kosteutta kuukausiksi eteenpäin.\nSuojaa istuin nyt — vältä uuden ostaminen keväällä.\nVettä hylkivä 600D Oxford, pehmustettu sisältä.\n\nNyt 64,95 €. Ilmainen toimitus, Klarna ja 30 päivän palautusoikeus 👇',
            headline: 'Istuinsuoja nyt 64,95 €',
            description: 'Ilmainen toimitus · Klarna · 30 päivän palautusoikeus.', link: LP_ISTU },
          motifs: ['Seatcover_SO_4_1'] },
      ],
    },
    {
      campaignName: 'Strandtofflorna FI', create: cbo,
      adsets: [
        { name: 'Beachslippers FI - PD', link: LP_TOHV, copy: {
            message: 'Liukastutko yhä märällä terassilla? 😬\n\nNäissä tohveleissa on liukumaton pohja joka pitää märällä laudalla, kostealla nurmella ja liukkaalla kivellä.\n✅ Pehmeä EVA-materiaali — mukavat koko päivän\n✅ Jalkaan 2 sekunnissa, ei nauhoja\n✅ Kuivuvat nopeasti, helppo huuhdella puhtaaksi\n\nTilaa omasi tänään 👇',
            headline: 'Liukumattomat kengät puutarhaan ja terassille',
            description: 'Pito ja mukavuus, alustasta riippumatta.', link: LP_TOHV },
          motifs: ['Beachslippers_PD_8_2', 'Beachslippers_PD_8_3', 'Beachslippers_PD_13_11',
                   'Beachslippers_PD_13_12', 'Beachslippers_PD_13_13', 'Beachslippers_PD_14_1',
                   'Beachslippers_PD_15_1', 'Beachslippers_PD_16_1'] },

        { name: 'Beachslippers FI - SP', link: LP_TOHV, copy: {
            message: 'Pito kuin rengaskuviolla 🙌\n\nLiukumaton pohja joka todella pitää — märällä terassilla, nurmella ja altaan reunalla.\n✅ Kevyet ja mukavat koko päivän\n✅ Kuivuvat nopeasti ja on helppo huuhdella\n✅ 30 päivän palautusoikeus\n\nKatso miksi niistä on tullut suosikki 👇',
            headline: 'Kesän liukumattomat suosikit',
            description: 'Liukumattomat, mukavat ja helppo huuhdella.', link: LP_TOHV },
          motifs: ['FI_Strandtofflor_UGC_1'] },
      ],
    },
  ],
};
