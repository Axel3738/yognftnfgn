// products/matstrumpor/ugc/pdf/bygg-liten.mjs — kreatörens brief som LITEN PDF, för mejl via
// Gmail-connectorn (2026-10-02).
//   node products/matstrumpor/ugc/pdf/bygg-liten.mjs Ebba [Sara …]
//
// Chromium-PDF:en ur bygg.mjs väger 78 kB = ~105 000 tecken base64. Bilagan går som base64 i
// connectorns verktygsanrop, och där ryms den inte säkert (samma lärdom som konkurrenter/textpdf.mjs:
// ett tecken fel i avskriften och PDF:en går sönder hos mottagaren). Här används PDF:ens
// standardtypsnitt Helvetica (inget bäddas in) och innehållet komprimeras: några kB.
// Innehållet är SAMMA som mall-kvinna.html — ändras briefen ska båda ändras.
// Inga npm-beroenden.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { TextPdf, radbryt } from '../../../../konkurrenter/textpdf.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));

/** Briefen för en kvinnlig kreatör: video 1 = vinnarmanuset ord för ord, video 2 = pranket. */
export const KVINNA = {
  lead: 'Film with your phone at home, vertical, daylight. You send us the raw files, no music, no captions, no filters. We cut everything. Everything below is in Swedish on camera; the English lines are only so you know what each line means.',
  regler: [
    'Only the sushi box. The other boxes are not in this round.',
    'Never say or show the store name. Cover the label on the parcel.',
    'No prices, no delivery time, no guarantees, nothing about material.',
    'The person who opens the box must not know what is inside. Film the reaction once. Never do it again.',
    'Ask them right after if we may use the clip. No yes, no clip.',
  ],
  skickar: [
    'Video 1: the script, one full take, about 30 seconds.',
    'Extra takes for video 1: five short clips, listed below.',
    'Video 2: the prank, about 20 seconds.',
    'Extra takes for video 2: three silent 3-second clips.',
    'Raw files in the folder Axel sends you.',
  ],
  video1: {
    intro: 'This is our best-selling video. Say the lines word for word, in your own rhythm, to the camera. Give the box to someone who does not know what is inside. If that person is a man, say "han" instead of "hon".',
    rader: [
      { ser: 'Close up: one salmon maki sock held to the lens. You pinch it.' },
      { sv: 'Det här är ditt tecken.', en: 'This is your sign.', ser: 'You unroll the sock in front of your face.' },
      { sv: 'Dom sålde slut i november.', en: 'They sold out in November.', ser: 'You hold the unrolled sock up by the cuff and laugh.' },
      { sv: 'Ge bort dom.', en: 'Give them away.', ser: 'You hold the closed box toward the lens.' },
      { sv: 'Ta med till kalaset eller spara till julstrumpan.', en: 'Bring them to the party or save them for the Christmas stocking.', ser: 'You open the lid and lift one tray out.' },
      { sv: 'När du ger bort dom här så är det som att du vet allt om personen, du visste ju deras favoriträtt.', en: 'When you give these it is like you know everything about the person. You knew their favourite dish.', ser: 'To camera, box in hand.' },
      { sv: 'Tio sushibitar med ätpinnar i trä.', en: 'Ten sushi pieces with wooden chopsticks.', ser: 'From above: the open tray, chopsticks laid across.' },
      { sv: 'Ja, hon blev verkligen överraskad.', en: 'Yes, she was really surprised.', ser: 'The person opens the box and laughs. Camera on their face the whole time.' },
      { sv: 'Rolig att öppna och används år efter år.', en: 'Fun to open and used year after year.', ser: 'The person lifts a sock out of the tray and holds it up.' },
      { sv: 'Dom som tog slut i november förra året, så säkra dina innan det händer igen.', en: 'The ones that sold out last November, so secure yours before it happens again.', ser: 'Wide: you on the sofa, feet up, the salmon socks on, laughing.' },
      { ser: 'ALL FIVE PAIRS. Unroll all five pairs and hold them up to the camera together, then one pair at a time. Five seconds, phone still.' },
    ],
  },
  extra1: {
    intro: 'Each one is its own clip. The three silent ones get a caption from us, so you say nothing in them.',
    tagningar: [
      { rubrik: 'A. The boring presents · about 6 seconds, you speak', text: 'Kitchen table. Put down a plain candle, a bar of soap and a pair of plain grey socks, one at a time. Then look at the camera and say:', saga: 'Men ingen av dom vet vad hon faktiskt gillar.', sagaEn: 'But none of them knows what she actually likes.', efter: 'Then drop all three into a drawer and shut it.' },
      { rubrik: 'B. The lid · 3 seconds, silent', text: 'Put the phone where the person will sit, pointing straight down at the closed box through the clear lid. No hands, no face. After two seconds, hands come in, lift the lid, pick one piece with the chopsticks and let it unroll into a sock.' },
      { rubrik: 'C. The box on the table · 3 seconds, silent', text: 'Phone still on the table. Two hands slide the closed box, chopsticks on the lid, to the middle of the table and go away. Nobody speaks, nobody laughs.' },
      { rubrik: 'D. After the meal · 3 seconds, silent', text: 'An empty plate and a fork pushed aside. Two hands slide the closed box into the free space. Then chopsticks lift one piece and it unrolls into a sock. Nothing else that looks like food in the picture.' },
      { rubrik: 'E. The stretch · 4 seconds, you speak · optional', text: 'Close up: stretch one unrolled sock wide in front of the lens, hold it, let it snap back. Say only:', saga: 'Material? Titta, jag drar i den.', sagaEn: 'Material? Look, I am pulling on it.', efter: 'Skip this one if the sock looks thin.' },
    ],
  },
  video2: {
    rubrik: 'The prank: "Jag tog med sushi"',
    intro: 'At a real fika table at work, or a dinner table at home. Prop the phone so both faces are in the picture. You put the box on the table and say you brought sushi. The other person knows nothing, lifts the lid and takes a piece with the chopsticks. Whatever happens is the video. At a dinner, say "vännen" instead of "kollegan" and "middagen" instead of "fikat".',
    rader: [
      { sv: 'Jag tog med sushi.', en: 'I brought sushi.', ser: 'You set the closed box in the middle of the table and say it to the other person, not to the camera.' },
      { sv: null, en: 'Their own words.', ser: 'Camera on their face. They lift the lid, look, pick up a piece. Do not help, do not explain.' },
      { sv: 'Dom sålde slut i november.', en: 'They sold out in November.', ser: 'You pick up the phone and hold one unrolled sock up by the cuff. The other person still in the picture.' },
      { sv: 'Ge bort dom. Eller ta med till fikat.', en: 'Give them away. Or bring them to the coffee break.', ser: 'You hold the closed box toward the lens.' },
    ],
    tagningar: [
      { rubrik: 'F. What they see first · silent', text: 'Phone in the other person\'s chair, pointing down at the closed box through the clear lid, a coffee cup in the corner. After two seconds, hands lift the lid and one piece unrolls into a sock. Film this alone, before or after the prank.' },
      { rubrik: 'G. Set it out and wait · silent', text: 'Phone still. Table with two coffee cups. Your hands set the closed box between the cups and go away. Then, filmed after the prank: the open box from above with one piece unrolled next to it.' },
      { rubrik: 'H. Twins · silent', text: 'From above: the closed box, pieces laid out so each one sits next to its twin of the same colour. After two seconds, hands lift the lid and one piece unrolls into a sock; its twin stays in the tray.' },
    ],
  },
  checklista: [
    'Video 1, one full take, with all five pairs at the end.',
    'Extra takes A, B, C, D (and E if you want).',
    'Video 2, the prank, one take.',
    'Extra takes F, G, H.',
    'The other person said yes to being in the video.',
    'No store name anywhere in the picture.',
  ],
};

const FG = '#1b1a17'; const MUTED = '#5d574f'; const LINE = '#ddd6c9'; const PANEL = '#f6f1e7'; const ACCENT = '#d9542b';
const MM = 72 / 25.4;

/** Briefen som A4-PDF (Buffer). Ren. */
export function litenPdf(brief, namn, { skapad = new Date() } = {}) {
  const pdf = new TextPdf();
  const V = 16 * MM; const H = pdf.bredd - 16 * MM; const B = H - V;
  const TOPP = 20 * MM; const BOTTEN = pdf.hojd - 22 * MM;
  let y = TOPP;
  const nySidaOm = (behov) => { if (y + behov <= BOTTEN) return; pdf.nySida(); y = TOPP; };
  const rader = (text, storlek, bredd = B, fet = false) => radbryt(text, bredd, storlek, { fet });
  const skriv = (text, { storlek = 10, fet = false, farg = FG, x = V, bredd = B, rad = Math.round(storlek * 1.35 * 10) / 10, efter = 0 } = {}) => {
    for (const r of rader(text, storlek, bredd, fet)) { nySidaOm(rad); pdf.text(x, y, r, { storlek, fet, farg }); y += rad; }
    y += efter;
  };
  const eyebrow = (t) => { nySidaOm(60); pdf.text(V, y, t.toUpperCase(), { storlek: 7.5, farg: ACCENT, sparr: 0.7 }); y += 15; };
  const rubrik2 = (t) => { for (const r of rader(t, 15, B, true)) { nySidaOm(20); pdf.text(V, y, r, { storlek: 15, fet: true }); y += 19; } y += 4; };

  // Ruta med rubrik och punkter (hela rutan hålls ihop på en sida).
  const ruta = (rubrik, punkter) => {
    const x = V + 10; const b = B - 20;
    const brutna = punkter.map((p) => rader(p, 9.5, b - 12));
    const h = 10 + 16 + brutna.reduce((s, r) => s + r.length * 12.5 + 3, 0) + 6;
    nySidaOm(h + 6);
    pdf.ruta(V, y - 12, B, h, { farg: PANEL });
    pdf.text(x, y + 2, rubrik, { storlek: 11.5, fet: true }); y += 18;
    for (const r of brutna) {
      // Numrerade punkter ("1. …") bär sitt eget tecken, de andra får en kula.
      if (!/^\d+\.\s/.test(r[0])) pdf.text(x, y, '•', { storlek: 9.5, farg: ACCENT });
      for (const rad of r) { pdf.text(x + 12, y, rad, { storlek: 9.5 }); y += 12.5; }
      y += 3;
    }
    y += 16;
  };

  // En manusrad: nummer, det som sägs (fet), vad det betyder (grått), vad vi ser.
  const manusrad = (nr, r) => {
    const x = V + 22; const b = B - 22;
    const sv = r.sv ? rader(r.sv, 10.5, b, true) : rader('(no words)', 10.5, b);
    const en = r.en ? rader(r.en, 9, b) : [];
    const ser = rader(`We see: ${r.ser}`, 9.5, b);
    const h = sv.length * 13 + en.length * 11.5 + ser.length * 12 + 9;
    nySidaOm(h);
    pdf.text(V, y, String(nr), { storlek: 10, fet: true, farg: ACCENT });
    for (const s of sv) { pdf.text(x, y, s, { storlek: 10.5, fet: !!r.sv, farg: r.sv ? FG : MUTED }); y += 13; }
    for (const s of en) { pdf.text(x, y, s, { storlek: 9, farg: MUTED }); y += 11.5; }
    for (const s of ser) { pdf.text(x, y, s, { storlek: 9.5 }); y += 12; }
    pdf.linje(V, y - 6, H, y - 6, { tjocklek: 0.4, farg: LINE }); y += 9;
  };

  // En extra tagning: rubrik, hur, ev. en replik (fet) med betydelse, ev. text efter.
  const tagning = (t) => {
    const x = V + 12; const b = B - 12;
    const delar = [
      [rader(t.rubrik, 10.5, b, true), 13.5, { storlek: 10.5, fet: true }],
      [rader(t.text, 9.5, b), 12.5, { storlek: 9.5 }],
      ...(t.saga ? [[rader(`Say: "${t.saga}"`, 10.5, b, true), 13.5, { storlek: 10.5, fet: true }], [rader(t.sagaEn, 9, b), 11.5, { storlek: 9, farg: MUTED }]] : []),
      ...(t.efter ? [[rader(t.efter, 9.5, b), 12.5, { storlek: 9.5 }]] : []),
    ];
    const h = delar.reduce((s, [r, rad]) => s + r.length * rad, 0) + 4;
    nySidaOm(h);
    pdf.ruta(V, y - 10, 3, h, { farg: ACCENT });
    for (const [r, rad, stil] of delar) for (const s of r) { pdf.text(x, y, s, stil); y += rad; }
    y += 10;
  };

  // Sidan.
  pdf.text(V, y, `SUSHI SOCKS · ${namn.toUpperCase()} · OCTOBER 2026`, { storlek: 7.5, farg: ACCENT, sparr: 0.7 }); y += 22;
  for (const r of rader(`${namn}: two videos, plus a few short extra takes`, 21, B, true)) { pdf.text(V, y, r, { storlek: 21, fet: true }); y += 25; }
  y += 4;
  skriv(brief.lead, { storlek: 10.5, efter: 14 });
  ruta('Five rules', brief.regler);
  ruta('What you send us', brief.skickar);

  eyebrow('Video 1 · about 30 seconds');
  rubrik2('The script');
  skriv(brief.video1.intro, { storlek: 10, efter: 10 });
  brief.video1.rader.forEach((r, i) => manusrad(i + 1, r));
  y += 6;

  eyebrow('Extra takes for video 1 · five short clips');
  rubrik2('Film these separately. We cut them in.');
  skriv(brief.extra1.intro, { storlek: 10, efter: 10 });
  brief.extra1.tagningar.forEach(tagning);
  y += 4;

  eyebrow('Video 2 · about 20 seconds');
  rubrik2(brief.video2.rubrik);
  skriv(brief.video2.intro, { storlek: 10, efter: 10 });
  brief.video2.rader.forEach((r, i) => manusrad(i + 1, r));
  y += 6;
  nySidaOm(40);
  pdf.text(V, y, 'Extra takes for video 2 · three silent 3-second clips', { storlek: 11.5, fet: true }); y += 18;
  brief.video2.tagningar.forEach(tagning);
  y += 4;

  ruta('Checklist before you send', brief.checklista.map((p, i) => `${i + 1}. ${p}`));
  skriv('Questions go to Axel. Thank you for filming.', { storlek: 9.5, farg: MUTED });

  // Sidfot med sidnummer.
  const antal = pdf.sidor.length; const aktuell = pdf.ops;
  pdf.sidor.forEach((ops, i) => {
    pdf.ops = ops;
    const yf = pdf.hojd - 13 * MM;
    pdf.linje(V, yf - 11, H, yf - 11, { tjocklek: 0.5, farg: LINE });
    pdf.text(V, yf, `Sushi socks · ${namn} · October 2026`, { storlek: 7.5, farg: MUTED });
    pdf.text(H, yf, `Page ${i + 1}/${antal}`, { storlek: 7.5, farg: MUTED, justera: 'hoger' });
  });
  pdf.ops = aktuell;
  return pdf.bytes({ titel: `${namn} · Sushi sock videos`, skapad });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const namn = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!namn.length) { console.error('Ange minst ett namn.'); process.exit(2); }
  for (const n of namn) {
    const bytes = litenPdf(KVINNA, n);
    const ut = join(ROT, `${n}-sushi-sock-briefs-liten.pdf`);
    writeFileSync(ut, bytes);
    console.log(`pdf ${ut} ${bytes.length} byte, base64 ${Math.ceil(bytes.length / 3) * 4} tecken`);
  }
}
