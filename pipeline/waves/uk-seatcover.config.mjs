// Kampanj: Sätesöverdraget UK — ride-on mower seat cover 600D
// OBS: samma copy på alla ads (per Axels instruktion), ads skapas PAUSADE (utkast).
const COPY = {
  message: "Your riding mower seat is soaked every morning and scorching every afternoon. 😩\nOur seat cover slips straight over your existing cushion: ✅ Water-repellent 600D Oxford — a dry seat even after rain ✅ Padded inside, so it takes the bumps for you ✅ Adjustable straps that won't slip, even on rough ground ✅ On in under 60 seconds — no tools needed Fits most riding mowers and garden tractors. Four colours.\n👉 Tap the link and see how easily it goes on.",
  headline: 'Dry, Comfortable Seat — All Season Long',
  description: 'Universal fit. Installs in under a minute.',
};

export default {
  campaignName: 'Sätesöverdraget UK',
  link: 'https://beavershop.co.uk/products/ride-on-mower-seat-cover-heavy-duty-600d-oxford?_pos=2&_psq=seat&_psid=40b96d897&_ss=e',
  dailyBudget: '100000', // öre = 1000 kr/dag
  productRe: /seatcover|sätesöverdrag|satesoverdrag/i,
  adStatus: 'PAUSED', // "lägg dom som utkast"
  adsetStatus: 'PAUSED',
  concepts: {
    PD: { adset: 'Seatcover UK - PD', ...COPY },
    SP: { adset: 'Seatcover UK - SP', ...COPY },
    SO: { adset: 'Seatcover UK - SO', ...COPY },
  },
};
