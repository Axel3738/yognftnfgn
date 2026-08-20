// NO Fiskespöhållaren — beverbutikken.no, launch 2026-08-20. Se fisk-common.mjs.
// ⚠️ Butikens jämförpris är trasigt: 148,75 NOK LIGGER UNDER priset 269 NOK.
// Ska rättas i Shopify — tills dess inga rabattpåståenden i copyn.
import { marknad } from './fisk-common.mjs';

const LP = 'https://beverbutikken.no/products/fiskestangholder-4-pakning-kraftig-oppbevaring';

export default marknad({
  m: 'NO', act: 'act_1050941584152547', page: '879054088633562',
  lp: LP, country: 'NO', beRoas: '1,36', dsa: false,
  texts: {
    PD: { message: 'Floker fiskestengene seg i båten – igjen? 🎣\nDenne lille klemmen løser det på 1 sekund.\n✅ Holder sammenslåtte stenger trygt lukket\n✅ Ingen flere flokete snører\n✅ Passer alle stenger\nBestill din 4-pakning i dag og slipp krøllet for godt. 👇',
      headline: 'Aldri mer flokete fiskestenger',
      description: 'Fire kraftige klemmer – orden i båten på sekunder.' },
    SO: { message: 'Floker stengene dine seg i båten? 🎣\nFiskestangholderen holder dem lukket og sikre.\n✅ 4-pakning for 269 kr\n✅ 30 dagers åpent kjøp\nBestill i dag – begrenset antall på lager. 👇',
      headline: 'Aldri mer flokete fiskestenger',
      description: '4-pakning for 269 kr.' },
    SP: { message: '«Endelig holder stanga seg sammenslått – ikke mer krøll!» 🎣\nSlik beskriver kundene våre fiskestangholderen.\n✅ Enkel å bruke\n✅ Holder stødig, gang etter gang\n✅ 30 dagers fornøyd-kunde-garanti\nSe hvorfor stadig flere fiskere bytter til denne løsningen. 👇',
      headline: 'Aldri mer flokete fiskestenger',
      description: 'Vurdert av fornøyde kunder – orden i båten hver gang.' },
    CS: { message: '⏰ LAGERRENSING – Fiskestangholder 4-pakning\n\nVi rydder lageret – nå kun 269 kr.\n🔥 Begrenset antall på lager\n🔥 Gjelder kun så lenge lageret rekker\nIkke vent – sikre din før den er utsolgt 👇',
      headline: 'Lagerrensing – nå 269 kr',
      description: 'Begrenset antall på lager.' },
    GT: { message: 'Vet du fortsatt ikke hva du skal gi ham som allerede har alt? 🎁\n\nVi har løsningen. Fiskestangholder 4-pakning er en gave han faktisk kommer til å bruke – hver gang han drar ut med båten eller setter bort stengene.\n\n😍 Han skjønner med en gang at du har lyttet til hva han trenger\n😍 Enkel gave, stort inntrykk\n😍 Kommer hjem i tide til anledningen\n\nBli den som fant den perfekte gaven i år – bestill i dag 👇',
      headline: 'Gaven han faktisk kommer til å bruke',
      description: 'Perfekt gave til ham som alltid fisker.' },
  },
});
