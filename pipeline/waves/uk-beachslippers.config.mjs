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
      message: 'Still slipping on the wet patio? 😬 These sandals have a non-slip sole that grips wet decking, damp grass and slick stone. ✅ Soft EVA material — comfortable all day ✅ Slip them on in 2 seconds, no laces ✅ Quick-drying, easy to rinse clean Order yours today and stop worrying about your next step 👇',
      headline: 'Non-Slip Shoes for the Garden & Patio',
      description: 'Grip and comfort, whatever the surface.',
    },
    SP: {
      adset: 'Beachslippers UK - SP',
      message: '"I never slipped once in these — and my feet still felt great after a full day outside." 🙌 Hundreds of men have already switched to these non-slip beach sandals this summer. ✅ A non-slip sole that actually holds ✅ Light and comfortable all day long ✅ 30-day satisfaction guarantee See why they\'ve become a must-have in the garden and by the pool 👇',
      headline: "The Shoes Everyone's Talking About This Summer",
      description: 'Non-slip, comfortable and loved by our customers.',
    },
    SO: {
      adset: 'Beachslippers UK - SO',
      message: 'Stop slipping on wet surfaces this summer ☀️ These beach sandals grip securely on the patio, the lawn and by the pool. ✅ Soft, lightweight EVA material ✅ Quick-drying and easy to clean ✅ Free shipping over 300 kr + Klarna Now 339 kr — limited stock 👇',
      headline: 'Non-Slip Shoes for Summer Adventures',
      description: '29 pounds, free shipping and a 30-day guarantee.',
    },
  },
};
