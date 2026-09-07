// Empty-state-QA för OPS-temat. Ren logik, ingen nätverkstrafik.
//
// Två kontroller:
//   qaSektionsfiler(SEKTIONER)  — Liquid-filerna: varje sektion ska gömma sig
//                                 själv utan data, och får aldrig bära
//                                 produkttexter, platshållare eller escaper.
//   qaRenderadSida(html)        — den byggda sidan: inga tomma sektioner,
//                                 inga trasiga bilder, inga tomma knappar,
//                                 aldrig "undefined", "null" eller [FYLL I].

// Ord som avslöjar att en gammal produkts text fastnat i mallen.
// Temat är en mall — ALL kundtext ska komma ur metafält eller settings.
const GAMLA_PRODUKTTEXTER =
  /nackmagnet|nacke|axelb[aä]lt|motorh[oö]lj|s[aä]tes[oö]verdrag|strandtoffl|grillklinik|mastern|b[aä]verbutik/i;
const PLATSHALLARE = /lorem|placeholder|TODO|FIXME|\[FYLL I\]/i;

export function qaSektionsfiler(sektioner) {
  const fel = [];
  for (const [namn, innehall] of Object.entries(sektioner)) {
    const kropp = innehall.split('{% schema %}')[0];

    // Sektionen ska villkora sin rendering — annars står en tom rubrik kvar
    // när produkten saknar datat. Sticky använder unless, resten if.
    const foreForstaDiv = kropp.split('<div')[0];
    if (!/\{%-?\s*(if|unless)\s/.test(foreForstaDiv)) {
      fel.push(`${namn}: saknar villkor före innehållet — sektionen kan renderas tom`);
    }

    if (GAMLA_PRODUKTTEXTER.test(kropp)) {
      fel.push(`${namn}: innehåller text från en specifik produkt — mallen ska vara produktneutral`);
    }
    if (PLATSHALLARE.test(innehall)) {
      fel.push(`${namn}: innehåller platshållartext`);
    }
    if (/\bundefined\b|>null</.test(kropp)) {
      fel.push(`${namn}: renderar "undefined" eller "null"`);
    }
    if (innehall.includes('\\')) {
      fel.push(`${namn}: innehåller en backslash-escape (förvanskas på vägen till Shopify)`);
    }
    // En länk eller knapp utan text är en död yta för kunden.
    if (/<(a|button)[^>]*>\s*<\/(a|button)>/.test(kropp)) {
      fel.push(`${namn}: har en tom knapp eller länk`);
    }
  }
  return fel;
}

export function qaRenderadSida(html) {
  const fel = [];
  const text = String(html);

  if (/\bundefined\b/.test(text)) fel.push('sidan innehåller "undefined"');
  // "null" som synlig text — inte som del av css-värden eller attribut.
  if (/>[^<]*\bnull\b[^<]*</.test(text)) fel.push('sidan innehåller "null" som text');
  if (PLATSHALLARE.test(text)) fel.push('sidan innehåller platshållartext');

  if (/<img[^>]*src=(""|'')/.test(text)) fel.push('en bild saknar källa (tom src)');
  if (/<(a|button)[^>]*class="[^"]*opf-cta[^"]*"[^>]*>\s*<\/(a|button)>/.test(text)) {
    fel.push('en köpknapp är tom');
  }
  if (/<section[^>]*>\s*<\/section>/.test(text)) fel.push('en sektion renderas tom');
  if (/<(h1|h2|h3)[^>]*>\s*<\/(h1|h2|h3)>/.test(text)) fel.push('en rubrik är tom');
  if (/:\s*(undefined|NaN)\b/.test(text)) fel.push('ett värde blev undefined eller NaN');

  return fel;
}
