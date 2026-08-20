// Wave 01 — första video-koncepten för Mastern (9:16 Reels, BOF).
// Varje koncept följer 5-beats-strukturen i ../../docs/creative-strategy.md.
// Shot.prompt = engelska (till Higgsfield), lämna text ur bilden. Caption = svenska,
// bränns in skarpt av compose. Namn enligt ../../docs/naming-convention.md.

export const wave = '01';

export const ads = [
  // ── C: hero-konceptet. Playbooken: transformationen är produktens kärnbevis och
  //    "vill egentligen vara video" (bof-concepts.md C). Testar benefit-vinkeln.
  {
    name: 'GRILL_mastern_benefit_beforeafter_90sec_v1',
    source: 'bof-concepts.md C · winning-lines: "Svart → skinande"',
    angle: 'benefit',
    premise: 'Ett smutsigt galler förvandlas till skinande på under 90 sek — bevis mot "funkar den på riktigt?".',
    endcard: { headline: 'Mastern', sub: '999 kr · 30 dagars öppet köp', cta: 'Handla nu' },
    shots: [
      { id: 's1', beat: 'HOOK', startSec: 0, endSec: 3,
        prompt: 'Extreme macro of a filthy cast-iron BBQ grate caked with black burnt grease, dramatic low-key light',
        motion: 'slow push-in, embers glowing', caption: 'Det här ska du äta på ikväll.' },
      { id: 's2', beat: 'DEMO', startSec: 3, endSec: 10,
        prompt: 'Black cordless electric grill brush with a spinning cleaning head gliding across the dirty grate, grease lifting away, sparks of debris flying',
        motion: 'rotating head 400 rpm, brush moves left to right, clean streak appears behind it',
        caption: 'En knapp. Huvudet snurrar 400 varv/min.' },
      { id: 's3', beat: 'PROOF', startSec: 10, endSec: 15,
        prompt: 'The same grate now spotless and shining, side-by-side dissolve from the dirty version, studio-clean',
        motion: 'timer overlay-space top-left, satisfying reveal', caption: 'Svart → skinande. På 90 sekunder.' },
      { id: 's4', beat: 'CTA', startSec: 15, endSec: 18,
        prompt: 'Hero product shot of the grill brush on clean seamless background, soft commercial light',
        motion: 'slow rotate', caption: 'Utan att skrapa sönder gallret.' },
    ],
  },

  // ── A: ny hjältevinkel — stålborsten förstör grillen (bof-concepts.md A, whitespace).
  //    ⚠️ Kräver materialverifiering innan "repar inte emaljen"-claim låses.
  {
    name: 'GRILL_mastern_pain_comparison_ruinsgrill_v1',
    source: 'bof-concepts.md A (whitespace) · playbook: skydda investeringen',
    angle: 'pain',
    premise: 'Stålborsten river emaljen → rost → dött galler. Mastern skyddar en grill värd tusenlappar.',
    endcard: { headline: 'Mastern', sub: 'Skonar gallret. 999 kr.', cta: 'Skydda din grill' },
    shots: [
      { id: 's1', beat: 'HOOK', startSec: 0, endSec: 3,
        prompt: 'Macro of a steel wire brush aggressively scraping a BBQ grate, tiny metal flakes and enamel chipping off, harsh light',
        motion: 'violent back-and-forth scrubbing', caption: 'Du skrubbar inte bort fettet.' },
      { id: 's2', beat: 'PROBLEM', startSec: 3, endSec: 8,
        prompt: 'Close-up of a corroded rusted grate with flaking porcelain enamel, bare metal exposed, moody',
        motion: 'slow pan across the rust', caption: 'Du skrubbar bort grillen.' },
      { id: 's3', beat: 'MEKANISM', startSec: 8, endSec: 14,
        prompt: 'The electric grill brush gliding gently over a grate, soft rotation, no scratching, premium feel',
        motion: 'smooth glide, no aggression', caption: 'Snurrar rent. River inte emaljen.' },
      { id: 's4', beat: 'CTA', startSec: 14, endSec: 18,
        prompt: 'A pristine intact grate next to the product, warm dusk backyard, premium',
        motion: 'gentle push-in', caption: 'En borste för 999. En grill värd 5000.' },
    ],
  },

  // ── B: spec sheet som kinetisk text (bof-concepts.md B — konkurrentens #1 scaler).
  //    authority-vinkel. Billigast att producera: produktfoto + brända fakta.
  {
    name: 'GRILL_mastern_authority_video_specsheet_v1',
    source: 'bof-concepts.md B · Grillhamster #1 scaler',
    angle: 'authority',
    premise: 'Ingen marknadsföring — bara specen. Hårda fakta till varma skeptiker.',
    endcard: { headline: 'Mastern', sub: '999 kr · 0 lösa borststrån', cta: 'Se specen' },
    shots: [
      { id: 's1', beat: 'HOOK', startSec: 0, endSec: 3,
        prompt: 'Clean studio product shot of the black electric grill brush slowly rotating on a seamless charcoal background, crisp commercial light, generous empty space for text',
        motion: 'slow 360 rotate', caption: 'Ingen marknadsföring.\nBara specen.' },
      { id: 's2', beat: 'PROOF', startSec: 3, endSec: 8,
        prompt: 'Detail of the rotating cleaning head and battery indicator, macro, product editorial, empty space',
        motion: 'rack focus across details', caption: '2600 mAh · 4–6 rengöringar / laddning' },
      { id: 's3', beat: 'PROOF', startSec: 8, endSec: 13,
        prompt: 'The brush next to several grill types (Weber, Napoleon), clean lineup, product editorial, empty space',
        motion: 'lateral dolly', caption: '90 sek · passar Weber / Napoleon / Broil King' },
      { id: 's4', beat: 'CTA', startSec: 13, endSec: 17,
        prompt: 'Hero product shot on clean background, soft shadow',
        motion: 'settle', caption: '10 säsonger · 0 lösa borststrån' },
    ],
  },
];
