import { writeFileSync } from 'node:fs';

const benefits = [
  "A dry roof until spring",
  "Peace of mind before the moisture check",
  "Goes on with just one person",
  "Stays put — no rubbing against the paint"
];

const features = [
  "Nine sizes: 18 to 44 ft (5.5 to 13.5 m) long, 10 ft (3 m) wide — measure your roof front to back and pick the next length up",
  "Black 210D Oxford fabric, waterproof and sun-resistant — water runs off instead of sitting",
  "Woven webbing straps (not elastic, they don't stretch out) on all four sides, 8 ft (2.5 m) and adjustable, with plastic hooks that latch under the edge of the body",
  "Two extra reinforced 34 ft (10.5 m) straps included — pulled across the roof",
  "The edge hangs about 30–40 cm (12–16 in) down over the sides, so the seam between roof and wall stays protected",
  "Folds down to an armful-sized bundle after the season"
];

const faq = [
  {
    fraga: "What size should I choose?",
    svar: "Measure your roof front to back and pick the length that's equal to it or the next one up. Nine lengths, 18 to 44 ft (5.5 to 13.5 m), all 10 ft (3 m) wide. Fits both travel trailers and motorhomes."
  },
  {
    fraga: "How do I put it on?",
    svar: "Three steps. Place the folded fabric in the middle of the roof and unfold it toward the front and back. Latch the webbing straps on all four sides under the edge of the body and adjust the length. Pull the two reinforced straps across the roof and tighten until the fabric lies flat. One person is enough."
  },
  {
    fraga: "Does it stay on in wind?",
    svar: "Yes. The webbing straps on all four sides latch under the edge of the body, and the two reinforced 34 ft (10.5 m) straps run across the roof. The straps are woven, not elastic, so they don't stretch out."
  },
  {
    fraga: "Can it stay on all winter?",
    svar: "Yes, it's made for winter storage. Brush off heavy wet snow if it builds up, just like you would without a cover."
  },
  {
    fraga: "Can I get to the door and windows?",
    svar: "Yes. The cover only sits on the roof and the edge hangs down 30–40 cm (12–16 in) — the door, windows, and hatches stay clear."
  },
  {
    fraga: "Can I mix sizes in one order?",
    svar: "Yes. In the bundle box, you pick a size for each cover — one for the travel trailer and one for the motorhome can go in the same bundle."
  },
  {
    fraga: "What if I change my mind?",
    svar: "Try it risk-free for 90 days. If it doesn't work for you, email hello@carashell.com and we'll arrange a return or refund."
  }
];

const out = {
  "metafalt.takskyddet.opf.problem_rubrik": "The roof is the part you never see — and the most expensive to repair",
  "metafalt.takskyddet.opf.problem_text": "Rain, leaves, and bird droppings land on the roof — exactly the surface you never climb up to check. Water sits around the roof hatches and seams all winter, and the sealant softens. Once moisture gets in, it's not a wash that's waiting for you in spring. It's a repair.",
  "metafalt.takskyddet.opf.losning_rubrik": "Cover just the roof — not the whole rig",
  "metafalt.takskyddet.opf.losning_text": "A full-body cover is heavy to get into place alone and rubs against the paint in the wind. CaraShell covers only the surface that takes the brunt of it: water runs off the waterproof 210D Oxford fabric, and the edge hangs down 30–40 cm (12–16 in) over the sides so the seam between roof and wall stays protected. Woven webbing straps with plastic hooks latch under the edge of the body, two reinforced straps pull across the roof — and one person can put it on alone.",
  "metafalt.takskyddet.opf.benefits": JSON.stringify(benefits),
  "metafalt.takskyddet.opf.features": JSON.stringify(features),
  "metafalt.takskyddet.opf.faq": JSON.stringify(faq)
};

writeFileSync(
  '/tmp/claude-0/-home-user-yognftnfgn/f239dc62-7898-5627-832f-f50aa197b197/scratchpad/oversatt-en.json',
  JSON.stringify(out, null, 2)
);
console.log('written');
