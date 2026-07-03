// Wave 01 — första BOF-statics för Mastern.
// Varje ad: base-prompt (foto, engelska, lämnar mörk tomyta för texten) + overlay (svenska lines).
// Lines hämtade ur ../../docs/winning-lines.md. Namn enligt ../../docs/naming-convention.md.

export const wave = '01';

export const ads = [
  {
    name: 'GRILL_mastern_authority_textheavy_tusentals_v1',
    seed: 101,
    basePrompt:
      'Photorealistic close-up of a weathered grill technician\'s hands holding a black cordless electric grill brush over an open dirty BBQ grill, dusk backyard, moody cinematic side light, shallow depth of field, embers glowing, dark empty space in the lower third of the frame, Scandinavian, editorial product photography, high detail',
    overlay: {
      headline: 'Jag har öppnat tusentals grillar. Det första jag tittar på är aldrig brännarna — det är gallret.',
      footer: 'En knapp. 60 sekunder. Rent på riktigt.',
      position: 'bottom',
    },
  },
  {
    name: 'GRILL_mastern_curiosity_textheavy_smak_v1',
    seed: 102,
    basePrompt:
      'Extreme macro photograph of a dirty cast-iron BBQ grill grate caked with old burnt grease and carbon, dramatic low-key lighting, glossy texture, a faint juicy steak out of focus behind, dark negative space at the bottom, appetizing yet grimy, editorial food photography',
    overlay: {
      headline: 'Det är därför köttet smakar som det gör.',
      badge: '−34% smak · Journal of Food Science',
      position: 'bottom',
    },
  },
  {
    name: 'GRILL_mastern_pain_comparison_investering_v1',
    seed: 103,
    basePrompt:
      'Split comparison photograph, left half a rusted corroded BBQ grill grate with flaking enamel, right half a spotless shining clean grate, studio lighting, high contrast, clean center divide, dark band along the bottom for text, product editorial',
    overlay: {
      headline: 'Du skyller på köttet. Det var aldrig köttet.',
      footer: 'Rengör gallret — utan att skrapa sönder det.',
      position: 'bottom',
    },
  },
  {
    name: 'GRILL_mastern_social_ugc_citat_v1',
    seed: 104,
    basePrompt:
      'Warm authentic lifestyle photo of a relaxed middle-aged Scandinavian man sitting with a cold beer next to a clean modern gas grill at golden hour in a backyard, candid UGC smartphone aesthetic, soft bokeh, dark calm area in the lower half, natural',
    overlay: {
      headline: '”Förut slutade grillkvällen med en halvtimmes skrubbning. Nu tar det en minut — sen sätter jag mig med en öl.”',
      badge: '★★★★★ Kund',
      footer: '30 dagars öppet köp.',
      position: 'bottom',
    },
  },
  {
    name: 'GRILL_mastern_social_product_trust_v1',
    seed: 105,
    basePrompt:
      'Premium studio product photograph of a sleek black cordless electric grill brush with a rotating cleaning head, floating on a clean off-white seamless background, soft shadow, crisp commercial lighting, lots of clean empty space at the bottom, Apple-style product hero shot',
    overlay: {
      headline: 'Inte ett Rusta-fynd. Ett riktigt redskap.',
      footer: 'Du får exakt vad du ser. Vi skickar direkt.',
      position: 'bottom',
    },
  },
  {
    name: 'GRILL_mastern_problem_beforeafter_serentut_v1',
    seed: 106,
    basePrompt:
      'Photorealistic top-down shot of a BBQ grill grate that looks clean on the surface, with a small inset macro circle revealing hidden burnt grease trapped deep between the bars, dark dramatic lighting, empty dark space at the top of the frame, investigative editorial style',
    overlay: {
      headline: 'Ditt galler ser rent ut. Det är det inte.',
      footer: 'Snurrar istället för att skrapa. 400 varv/min.',
      position: 'top',
    },
  },
];
