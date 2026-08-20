// FI Fiskespöhållaren — majavakauppa.fi, launch 2026-08-20. Se fisk-common.mjs.
// ⚠️ Bilderna Fiskespöhållare_*_2_1_FI.jpg var inte uppladdade någonstans
// 2026-08-20 — kör om konfigen när de finns i FI-kontot, så byggs bara de.
import { marknad } from './fisk-common.mjs';

const LP = 'https://majavakauppa.fi/products/kalastusvapateline-4-kpl-kestava-sailytys';

export default marknad({
  m: 'FI', act: 'act_1619718346388201', page: '1317870104733246',
  lp: LP, country: 'FI', beRoas: '1,58', dsa: true,
  extra: { noFormatCustomization: true }, // sidan saknar IG-identitet
  texts: {
    PD: { message: 'Sotkeutuvatko vapasi veneessä – taas? 🎣\nTämä pieni pidike ratkaisee sen sekunnissa.\n✅ Pitää kootut vavat tukevasti kiinni\n✅ Ei enää sotkeutuneita siimoja\n✅ Sopii kaikille vavoille\nTilaa 4 kpl pakkaus tänään ja unohda sotkut lopullisesti. 👇',
      headline: 'Ei enää sotkeutuneita vapoja',
      description: 'Neljä kestävää pidikettä – järjestys veneeseen sekunneissa.' },
    SO: { message: 'Sotkeutuvatko vapasi veneessä? 🎣\nVapateline pitää ne kiinni ja turvassa.\n✅ 4 kpl 27,90 €\n✅ 30 päivän palautusoikeus\nTilaa tänään – rajoitettu erä varastossa. 👇',
      headline: 'Ei enää sotkeutuneita vapoja',
      description: '4 kpl 27,90 €.' },
    SP: { message: '"Vihdoinkin vapa pysyy kasassa – ei enää sotkua!" 🎣\nNäin asiakkaamme kuvailevat vapatelinettä.\n✅ Helppo käyttää\n✅ Pitää tukevasti, kerta toisensa jälkeen\n✅ 30 päivän tyytyväisyystakuu\nKatso, miksi yhä useampi kalastaja vaihtaa tähän ratkaisuun. 👇',
      headline: 'Ei enää sotkeutuneita vapoja',
      description: 'Tyytyväisten asiakkaiden arvioima – järjestys veneessä joka kerta.' },
    CS: { message: '⏰ VARASTONTYHJENNYS – Vapateline 4 kpl\n\nTyhjennämme varastoa – nyt vain 27,90 €.\n🔥 Rajoitettu erä varastossa\n🔥 Voimassa niin kauan kuin varastoa riittää\nÄlä odota – varmista omasi ennen kuin ne loppuvat 👇',
      headline: 'Varastontyhjennys – nyt 27,90 €',
      description: 'Rajoitettu erä varastossa.' },
    GT: { message: 'Etkö vieläkään tiedä, mitä antaa hänelle, jolla on jo kaikkea? 🎁\n\nMeillä on ratkaisu. Vapateline 4 kpl on lahja, jota hän oikeasti käyttää – aina kun hän lähtee veneelle tai laittaa vavat säilöön.\n\n😍 Hän tajuaa heti, että kuuntelit mitä hän tarvitsee\n😍 Yksinkertainen lahja, suuri vaikutus\n😍 Ehtii perille ennen juhlapäivää\n\nOle se, joka löysi täydellisen lahjan tänä vuonna – tilaa tänään 👇',
      headline: 'Lahja, jota hän oikeasti käyttää',
      description: 'Täydellinen lahja hänelle, joka aina kalastaa.' },
  },
});
