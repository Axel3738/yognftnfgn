// Källbutiksskanningen: hittar text ur bas-temats ursprungsbutik som ligger
// kvar i en ny OPS-butiks tema.
//
// Bakgrunden (Axels bakläxa 2026-09-09, DryTrek): ops-tema.zip är exporterat
// från Matstrumpor, och tre mallar bär källbutikens innehåll — startsidans
// hero och kollektion (templates/index.json), footerns bolagsblock
// (sections/footer-group.json) och produktmallens supportmejl
// (templates/product.json). Ingen kod rörde dem, så varje ny butik ärvde
// Matstrumpors text tills en människa råkade se den. DryTrek gick hela vägen
// till förhandsvisning med "Kilometer fyra. Fortfarande torr strumpa."
//
// Regeln: ingen butik lämnas för publicering förrän skanningen är tom.

// Strängar som ENTYDIGT tillhör bas-temats ursprungsbutik.
//
// ⚠️ Skanna aldrig på vanliga produktord. "Strumpa" är källbutikens produkt
// men också en giltig NYTTA för andra produkter — DryTrek säljer damasker,
// och "torra strumpor" är precis vad de gör (Axel 2026-09-09). Ett falskt
// larm som tvingar en session att skriva om korrekt copy är lika dyrt som
// ett missat. Därför bara butiksnamn, mejl, handles och hela citat.
export const KALLORD = [
  'matstrumpor',
  'matstrumpor.se',
  'kundsupport@matstrumpor.se',
  'sushi-strumpor',
  'collections/strumporna',
  'strumpor som ser ut som mat',
  'strumpor man aldrig blandar ihop',
];

// Filer där källtexten bevisligen bor. Skanna alltid ALLA temats JSON-mallar
// och Liquid-filer — listan är var man börjar leta, inte var man slutar.
export const KANDA_SMITTADE = [
  'templates/index.json',
  'templates/product.json',
  'sections/footer-group.json',
];

// Skannar en temafil. Returnerar raderna med träff, med radnummer.
export function skannaFil(namn, innehall) {
  const rader = String(innehall).split(/\r?\n/);
  const traffar = [];
  rader.forEach((rad, i) => {
    const lag = rad.toLowerCase();
    const ord = KALLORD.filter((o) => lag.includes(o));
    if (ord.length > 0) {
      traffar.push({ fil: namn, rad: i + 1, ord: [...new Set(ord)], text: rad.trim().slice(0, 160) });
    }
  });
  return traffar;
}

// Skannar hela temat. `filer` är { sokvag: innehall }.
export function skannaTema(filer) {
  const traffar = [];
  for (const [namn, innehall] of Object.entries(filer)) {
    traffar.push(...skannaFil(namn, innehall));
  }
  return { rent: traffar.length === 0, traffar };
}

// Rapport att visa i chatten.
export function rapport(resultat) {
  if (resultat.rent) return '✅ Källskanning ren — ingen text från bas-temats ursprungsbutik.';
  const rader = resultat.traffar.map(
    (t) => `  ❌ ${t.fil}:${t.rad} [${t.ord.join(', ')}] ${t.text}`
  );
  return [
    `❌ ${resultat.traffar.length} rader bär text från bas-temats ursprungsbutik:`,
    ...rader,
    '',
    'Butiken får INTE lämnas för publicering förrän listan är tom.',
  ].join('\n');
}
