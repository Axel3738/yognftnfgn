// Kampanj: Axelbältet UK — trimmer shoulder strap
export default {
  campaignName: 'Axelbältet UK',
  link: 'https://beavershop.co.uk/products/trimmer-shoulder-strap-adjustable-nylon-harness?_pos=1&_psq=shoulder&_psid=3aa2a9cea&_ss=e',
  dailyBudget: '100000', // öre = 1000 kr/dag
  productRe: /shoulder-?belt|axelbalte|axelbälte|trimmerbelt/i,
  // SF finns inte som koncept — tolkas som SP tills annat sägs (enda SP-kandidaten).
  aliases: { SF: 'SP' },
  // UK_Shoulder-Belt.png saknar konceptkod — ren produktbild → PD.
  forceConcept: { 'UK_Shoulder-Belt': 'PD' },
  concepts: {
    PD: {
      adset: 'Axelbälte UK - PD',
      message: "Sore shoulders after a day in the garden? 😩\nThis belt spreads the trimmer's weight evenly across your shoulder. Less strain on your arms, neck and back. Adjustable for a fit that's right for you.\nTrim longer, without the ache. 👇 Order yours today.",
      headline: 'Trim Without the Shoulder Pain',
      description: 'Padded, adjustable shoulder belt for trimmers.',
    },
    SP: {
      adset: 'Axelbälte UK - SP',
      message: '"Best thing I\'ve bought for the garden this year." ⭐⭐⭐⭐⭐\nThousands of happy customers already trust this shoulder belt. Spreads the trimmer\'s weight — saves your shoulders and back. Adjustable, padded and built to last.\nSee why so many choose it. 👇',
      headline: 'Trim Without the Shoulder Pain',
      description: 'Trusted by thousands of gardeners.',
    },
    SO: {
      adset: 'Axelbälte UK - SO',
      message: "Garden season is here 🌿\nStop carrying the trimmer's full weight yourself. This belt spreads the pressure evenly across your shoulder. Adjustable — fits you, whatever your size.\nOn sale now. Order before stock runs out. 👇",
      headline: 'Trim Without the Shoulder Pain',
      description: 'Special price right now — limited stock.',
    },
  },
};
