// Voiceover-våg 01 — Mastern. Manus dras från vinnarna i docs/winning-lines.md.
// Varje klipp: { name (namnkonvention), text (svenska, det som läses upp), voice?, model? }.
//
// eleven_v3 förstår audio-tags i hakparenteser mitt i texten, t.ex. [paus], [allvarligt],
// [viskar]. Använd sparsamt — de färgar leveransen, de läses inte upp.

export const clips = [
  {
    // Auktoritet/expert — arbetshästen (ad 110 "Grillteknikern")
    name: 'VO-110-authority-grilltekniker',
    text:
      'Jag har öppnat tusentals grillar. [paus] Det första jag tittar på är aldrig brännarna. ' +
      'Det är gallret. Din stekyta blir aldrig som på restaurang — och det beror inte på köttet, ' +
      'temperaturen eller din teknik. Det beror på ytan du lägger köttet på.',
  },
  {
    // Curiosity/smak — högst CTR (ad 101 "Farfar")
    name: 'VO-101-curiosity-smak',
    text:
      'Du skyller på köttet. [allvarligt] Det var aldrig köttet. Inbränt fett på gallret ' +
      'försämrar smaken — det är därför köttet smakar som det gör.',
  },
  {
    // Förstör grillen — pivoten (ad 128 "Skydda investeringen")
    name: 'VO-128-forstor-grillen',
    text:
      'En Napoleon ska hålla i femton år. Med ett smutsigt galler håller den kanske sju. ' +
      'Inbränt fett är frätande — [paus] det bryter långsamt ner metallen underifrån. ' +
      'Du skyddar inte bara smaken. Du skyddar investeringen.',
  },
  {
    // Mekanism/USP — produktdemo (Mastern)
    name: 'VO-mastern-mekanism-usp',
    text:
      'Du behöver inte mer tryck. Du behöver rotation. Mastern snurrar istället för att skrapa — ' +
      'fyrahundra varv i minuten, ner i springorna. [glad] En knapp, sextio sekunder, rent på riktigt.',
  },
];
