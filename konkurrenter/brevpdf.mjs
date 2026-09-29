// konkurrenter/brevpdf.mjs — brevet som PDF-bilaga + en kort följetext utan länkar
// (2026-09-29). Gmail-connectorn skriver om VARJE länk och domän i ett mejl till
// Googles omdirigering (https://www.google.com/url?q=…&sa=E), både i text- och
// HTML-delen — mätt samma dag på två utkast: "orvo.se", "org.nr" och alla
// annonslänkar blev omdirigeringar. En länk vars text säger facebook.com men som
// går till google.com är precis det skräppostfilter letar efter, så ett varningsbrev
// med bevislänkar kan inte ligga i själva mejlet. Brevet går därför ordagrant som
// PDF (länkarna klickbara, rakt till källan) och mejlets text är en följetext utan
// en enda domän. Allt här är rent — skriver inget.

import { TextPdf, textbredd, radbryt } from './textpdf.mjs';

const ORD = {
  sv: { rubrik: 'Krav på borttagning', till: 'Till', fran: 'Från', datum: 'Datum', arende: 'Ärende', sida: 'Sida' },
  en: { rubrik: 'Demand for removal', till: 'To', fran: 'From', datum: 'Date', arende: 'Case', sida: 'Page' },
};

/**
 * Brevet som A4-PDF: brevhuvud (avsändare, mottagare, datum, ärende, ämne) och
 * brevtexten ordagrant, med klickbara länkar. `text` är brevets text exakt som
 * i brev.json. Returnerar en Buffer.
 */
export function brevPdf({ amne, text, till, fran, avsandare, datum, arende, sprak = 'sv', skapad = new Date() }) {
  const L = ORD[sprak] ?? ORD.sv;
  const pdf = new TextPdf();
  const MM = 72 / 25.4;
  const V = 20 * MM; const H = pdf.bredd - 20 * MM; const B = H - V;
  const TOPP = 20 * MM; const BOTTEN = pdf.hojd - 22 * MM;
  const MORK = '#151a21'; const GRA = '#5b6570'; const LJUS = '#d5dad2'; const LANK = '#1a4fb4';
  let y = TOPP;
  // Brevhuvudet.
  pdf.text(V, y + 14, avsandare?.namn ?? 'Stonebite Ecom AB', { storlek: 15, fet: true });
  const hoger = [avsandare?.adress, avsandare?.mail].filter(Boolean);
  hoger.forEach((t, i) => pdf.text(H, y + 4 + i * 12, t, { storlek: 9, farg: GRA, justera: 'hoger' }));
  y += 26; pdf.linje(V, y, H, y, { tjocklek: 1.2, farg: MORK }); y += 20;
  const meta = [[L.till, till], [L.fran, fran], [L.datum, datum], [L.arende, arende]].filter(([, v]) => v);
  const eb = Math.max(...meta.map(([e]) => textbredd(e, 9.5))) + 12;
  for (const [e, v] of meta) { pdf.text(V, y, e, { storlek: 9.5, farg: GRA }); pdf.text(V + eb, y, v, { storlek: 9.5 }); y += 13.5; }
  y += 8;
  for (const r of radbryt(amne, B, 12.5, { fet: true })) { pdf.text(V, y + 4, r, { storlek: 12.5, fet: true }); y += 17; }
  y += 10;
  // Brevtexten: rad för rad, indrag bevaras, länkar blir klickbara.
  const STORLEK = 10; const RAD = 14;
  const nySidaOm = (behov) => { if (y + behov <= BOTTEN) return; pdf.nySida(); y = TOPP; };
  for (const radText of String(text ?? '').split('\n')) {
    if (!radText.trim()) { y += RAD * 0.6; continue; }
    const indrag = radText.match(/^\s*/)[0].length;
    const x0 = V + Math.min(indrag, 8) * 3;
    const bitar = radbryt(radText.trim(), H - x0, STORLEK);
    for (const [i, bit] of bitar.entries()) {
      nySidaOm(RAD);
      const x = i === 0 ? x0 : x0 + (/^[•–\-\d]/.test(radText.trim()) ? 10 : 0);
      pdf.text(x, y, bit, { storlek: STORLEK });
      for (const m of bit.matchAll(/https?:\/\/[^\s)]+/g)) {
        const lank = m[0].replace(/[.,;:]+$/, '');
        const lx = x + textbredd(bit.slice(0, m.index), STORLEK);
        const lb = textbredd(lank, STORLEK);
        pdf.linje(lx, y + 1.5, lx + lb, y + 1.5, { tjocklek: 0.4, farg: LANK });
        pdf.lank(lx, y - STORLEK * 0.8, lb, STORLEK * 1.1, lank);
      }
      y += RAD;
    }
  }
  // Sidfot med sidnummer.
  const antal = pdf.sidor.length; const aktuell = pdf.ops;
  pdf.sidor.forEach((ops, i) => {
    pdf.ops = ops;
    const yf = pdf.hojd - 14 * MM;
    pdf.linje(V, yf - 11, H, yf - 11, { tjocklek: 0.5, farg: LJUS });
    pdf.text(V, yf, [avsandare?.namn, arende && `${L.arende} ${arende}`].filter(Boolean).join(' · '), { storlek: 7.5, farg: GRA });
    if (antal > 1) pdf.text(H, yf, `${L.sida} ${i + 1}/${antal}`, { storlek: 7.5, farg: GRA, justera: 'hoger' });
  });
  pdf.ops = aktuell;
  return pdf.bytes({ titel: `${L.rubrik} – ${arende ?? ''}`.trim(), skapad });
}

/**
 * Följetexten i själva mejlet — utan en enda länk eller domän (Gmail-connectorn
 * gör om dem till Google-omdirigeringar). Säger vad som är bifogat och fristen. Ren.
 */
export function foljetext({ sprak = 'sv', mottagare, arende, fakturaNr = null, belopp = null, frist, avsandare, paminnelse = false }) {
  const sign = [avsandare?.namn, avsandare?.adress, avsandare?.mail].filter(Boolean).join('\n');
  if (sprak === 'en') {
    const vad = paminnelse ? `our reminder of the demand for the removal of copyright-protected material (case ${arende})` : `our demand for the removal of copyright-protected material (case ${arende})`;
    return [
      `To the management / the person responsible for ${mottagare}`,
      '',
      `Attached is ${vad}${fakturaNr ? ` and invoice ${fakturaNr}${belopp ? ` of ${belopp}` : ''}` : ''}. The deadline is ${frist}. Please read the attached letter in full.`,
      '',
      'Kind regards',
      '',
      sign,
    ].join('\n');
  }
  const vad = paminnelse ? `vår påminnelse om kravet på borttagning av upphovsrättsskyddat material (ärende ${arende})` : `vårt krav på borttagning av upphovsrättsskyddat material (ärende ${arende})`;
  return [
    `Till företagsledningen / ansvarig för ${mottagare}`,
    '',
    `Bifogat finns ${vad}${fakturaNr ? ` och faktura ${fakturaNr}${belopp ? ` på ${belopp}` : ''}` : ''}. Fristen går ut ${frist}. Läs det bifogade brevet i sin helhet.`,
    '',
    'Med vänlig hälsning',
    '',
    sign,
  ].join('\n');
}

/** Finns något i texten som Gmail-connectorn gör om till en länk? (domän eller URL). Ren. */
export function harLankbartOrd(text) {
  return /https?:\/\/|www\.|\b[a-z0-9-]+\.(?:se|com|org|net|no|dk|fi|nr|eu|io|shop|store|nu)\b/i.test(String(text ?? '').replace(/[^\s@]+@[^\s@]+/g, ''));
}
