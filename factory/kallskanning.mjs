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

// Sektioner som tillhör källbutikens KAMPANJER, inte OPS-butikens funktion.
// De bär ingen text som skanningen hittar — de är typer i sektionsgrupperna,
// och följer därför tyst med i varje ny butik.
//
// ms-skrapkort  = "skrapa fram rabatten"-popup som byter rabattkod mot en
//                 mejladress. Matstrumpors e-postklubb, inte vår.
// ms-cookies    = källbutikens egen cookieruta.
// newsletter    = Dawns nyhetsbrevsblock i footern.
//
// Axel tog bort alla tre för hand på HeimGuard 2026-09-06 ("rensa-popups"),
// men de låg kvar i zip:en och kom tillbaka på nästa butik. Nu rensas de
// automatiskt av avbrandaSektionsgrupp().
export const KALLSEKTIONER = ['ms-skrapkort', 'ms-cookies', 'newsletter'];

// Tar bort källbutikens kampanjsektioner ur en sektionsgrupp (footer-group
// eller header-group). Returnerar { json, borttagna }.
export function avbrandaSektionsgrupp(rajson) {
  const data = typeof rajson === 'string' ? JSON.parse(rajson) : rajson;
  const borttagna = [];
  for (const [namn, sektion] of Object.entries(data.sections ?? {})) {
    if (KALLSEKTIONER.includes(sektion?.type)) {
      delete data.sections[namn];
      borttagna.push(`${namn} (${sektion.type})`);
    }
  }
  if (Array.isArray(data.order)) {
    data.order = data.order.filter((n) => n in (data.sections ?? {}));
  }
  return { json: data, borttagna };
}

// Skannar en sektionsgrupp efter källsektioner utan att ändra något.
export function skannaSektionsgrupp(namn, rajson) {
  const data = typeof rajson === 'string' ? JSON.parse(rajson) : rajson;
  return Object.entries(data.sections ?? {})
    .filter(([, s]) => KALLSEKTIONER.includes(s?.type))
    .map(([id, s]) => ({ fil: namn, rad: 0, ord: [s.type], text: `källsektion "${id}" av typen ${s.type}` }));
}

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
