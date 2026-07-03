// Brand kit för Grillkliniken / Mastern-statics.
// Ändra här så slår det igenom i alla annonser.

export const CANVAS = { w: 1080, h: 1350 }; // Meta feed 4:5

export const COLOR = {
  charcoal: '#141210',   // nästan-svart, grill/kol
  ember:    '#E8551E',   // varm glöd-orange (accent/CTA)
  cream:    '#F4EFE7',   // off-white text
  smoke:    '#B7ADA0',   // dämpad text (footer)
  steel:    '#3A3733',   // scrim/paneler
};

// Typsnitt. SVG-rendering i sharp kräver att fonten finns installerad i systemet,
// annars faller den tillbaka på en generisk sans. Släpp en .ttf i assets/fonts och
// peka ut den här om du vill låsa exakt typsnitt (annars funkar systemets sans).
export const FONT = {
  display: "'DejaVu Sans', 'Liberation Sans', sans-serif", // rubrik (byts mot brandfont)
  body:    "'DejaVu Sans', 'Liberation Sans', sans-serif",
  weightHeavy: 800,
  weightBold: 700,
};

export const LOGO_WORDMARK = 'GRILLKLINIKEN';
