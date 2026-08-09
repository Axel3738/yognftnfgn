// Kampanj: Strandtofflorna UK — men's non-slip beach sandals
// Copy-doc märkt DEMO / SOCIAL PROOF / SALE-OFFER → PD / SP / SO.
export default {
  campaignName: 'Strandtofflorna UK',
  link: 'https://beavershop.co.uk/products/mens-beach-sandals-non-slip-garden-shoes?_pos=3&_psq=beach&_psid=61950e839&_ss=e',
  dailyBudget: '100000', // öre = 1000 kr/dag
  productRe: /beachslippers|strandtofflor/i,
  // UK_Strandtofflor.png saknar konceptkod — ren produktbild → PD.
  forceConcept: { 'UK_Strandtofflor': 'PD' },
  concepts: {
    PD: {
      adset: 'Beachslippers UK - PD',
      message: 'Still slipping on the wet patio? 😬\n\nThese sandals have a non-slip sole that grips wet decking, damp grass and slick stone.\n✅ Soft EVA material — comfortable all day\n✅ Slip them on in 2 seconds, no laces\n✅ Quick-drying, easy to rinse clean\n\nOrder yours today and stop worrying about your next step 👇',
      headline: 'Non-Slip Shoes for the Garden & Patio',
      description: 'Grip and comfort, whatever the surface.',
    },
    SP: {
      adset: 'Beachslippers UK - SP',
      message: '"I never slipped once in these — and my feet still felt great after a full day outside." 🙌\n\nHundreds of men have already switched to these non-slip beach sandals this summer.\n✅ A non-slip sole that actually holds\n✅ Light and comfortable all day long\n✅ 30-day satisfaction guarantee\n\nSee why they\'ve become a must-have in the garden and by the pool 👇',
      headline: "The Shoes Everyone's Talking About This Summer",
      description: 'Non-slip, comfortable and loved by our customers.',
    },
    SO: {
      adset: 'Beachslippers UK - SO',
      message: 'Stop slipping on wet surfaces this summer ☀️\n\nThese beach sandals grip securely on the patio, the lawn and by the pool.\n✅ Soft, lightweight EVA material\n✅ Quick-drying and easy to clean\n✅ Free shipping + Klarna\n\nNow £29 — limited stock 👇',
      headline: 'Non-Slip Shoes for Summer Adventures',
      description: '29 pounds, free shipping and a 30-day guarantee.',
    },
  },
};
