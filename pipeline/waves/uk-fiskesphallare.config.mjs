// UK Fiskespöhållaren — beavershop.co.uk, launch 2026-08-20. Se fisk-common.mjs.
import { marknad } from './fisk-common.mjs';

const LP = 'https://beavershop.co.uk/products/fishing-rod-holder-4-pack-heavy-duty-storage';

export default marknad({
  m: 'UK', act: 'act_1107817401910319', page: '1305042582683792',
  lp: LP, country: 'GB', beRoas: '1,29', dsa: false,
  extra: { noFormatCustomization: true }, // BeaverShop saknar IG-identitet
  texts: {
    PD: { message: 'Rods tangled up in the boat – again? 🎣\nThis little clip fixes it in 1 second.\n✅ Keeps collapsed rods safely closed\n✅ No more tangled lines\n✅ Fits all rods\nOrder your 4-pack today and end the tangle for good. 👇',
      headline: 'No more tangled fishing rods',
      description: 'Four heavy-duty clips – an organised boat in seconds.' },
    SO: { message: 'Rods tangling up in the boat? 🎣\nThe rod holder keeps them closed and secure.\n✅ 4-pack for £20.99\n✅ 30-day money-back guarantee\nOrder today – limited stock. 👇',
      headline: 'No more tangled fishing rods',
      description: '4-pack for £20.99.' },
    SP: { message: '"Finally the rod stays collapsed – no more tangles!" 🎣\nThat\'s how our customers describe the rod holder.\n✅ Easy to use\n✅ Holds firm, time after time\n✅ 30-day money-back guarantee\nSee why more and more anglers are switching. 👇',
      headline: 'No more tangled fishing rods',
      description: 'Rated by happy customers – an organised boat every time.' },
    CS: { message: '⏰ STOCK CLEARANCE – Fishing Rod Holder 4-Pack\n\nWe\'re clearing the warehouse – now only £20.99.\n🔥 Limited stock\n🔥 Only while stocks last\nDon\'t wait – secure yours before they\'re gone 👇',
      headline: 'Stock clearance – now £20.99',
      description: 'Limited stock.' },
    GT: { message: 'Still don\'t know what to get the man who already has everything? 🎁\n\nWe\'ve got the answer. The Fishing Rod Holder 4-Pack is a gift he\'ll actually use – every time he takes the boat out or puts his rods away.\n\n😍 He\'ll know straight away you listened to what he needs\n😍 Simple gift, big impression\n😍 Arrives in time for the occasion\n\nBe the one who found the perfect gift this year – order today 👇',
      headline: 'The gift he\'ll actually use',
      description: 'The perfect gift for the man who\'s always fishing.' },
  },
});
