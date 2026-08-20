// DK Fiskespöhållaren — bæverbutiken.dk, launch 2026-08-20. Se fisk-common.mjs.
import { marknad } from './fisk-common.mjs';

const LP = 'https://xn--bverbutiken-98a.dk/products/fiskestangsholder-4-pak-kraftig-opbevaring';

export default marknad({
  m: 'DK', act: 'act_915422744950975', page: '1324465810740336',
  lp: LP, country: 'DK', beRoas: '1,52', dsa: true,
  texts: {
    PD: { message: 'Filtrer dine fiskestænger sammen i båden – igen? 🎣\nDenne lille klemme løser det på 1 sekund.\n✅ Holder sammenklappede stænger sikkert lukket\n✅ Ikke mere filtret line\n✅ Passer til alle stænger\nBestil din 4-pak i dag, og slip for bøvlet for altid. 👇',
      headline: 'Aldrig mere filtrede fiskestænger',
      description: 'Fire kraftige klemmer – orden i båden på sekunder.' },
    SO: { message: 'Filtrer dine stænger sammen i båden? 🎣\nFiskestangsholderen holder dem lukkede og sikre.\n✅ 4-pak for 209 kr.\n✅ 30 dages åbent køb\nBestil i dag – begrænset antal på lager. 👇',
      headline: 'Aldrig mere filtrede fiskestænger',
      description: '4-pak for 209 kr.' },
    SP: { message: '"Endelig holder stangen sig sammenklappet – ikke mere filtret line!" 🎣\nSådan beskriver vores kunder fiskestangsholderen.\n✅ Nem at bruge\n✅ Holder fast, gang efter gang\n✅ 30 dages tilfreds-kunde-garanti\nSe hvorfor flere og flere lystfiskere skifter til denne løsning. 👇',
      headline: 'Aldrig mere filtrede fiskestænger',
      description: 'Bedømt af tilfredse kunder – orden i båden hver gang.' },
    CS: { message: '⏰ LAGERRYDNING – Fiskestangsholder 4-pak\n\nVi rydder lageret – nu kun 209 kr.\n🔥 Begrænset antal på lager\n🔥 Gælder kun, så længe lager haves\nVent ikke – sikr dig din, før den er udsolgt 👇',
      headline: 'Lagerrydning – nu 209 kr.',
      description: 'Begrænset antal på lager.' },
    GT: { message: 'Ved du stadig ikke, hvad du skal give ham, der allerede har alt? 🎁\n\nVi har løsningen. Fiskestangsholder 4-pak er en gave, han faktisk kommer til at bruge – hver gang han tager ud med båden eller stiller stængerne væk.\n\n😍 Han forstår med det samme, at du har lyttet til, hvad han har brug for\n😍 Enkel gave, stort indtryk\n😍 Kommer hjem i god tid til anledningen\n\nBliv den, der fandt den perfekte gave i år – bestil i dag 👇',
      headline: 'Gaven, han faktisk kommer til at bruge',
      description: 'Perfekt gave til ham, der altid fisker.' },
  },
});
