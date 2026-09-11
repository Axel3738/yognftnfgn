// Fönster- och dörrlarm 110 dB (id `fonsterlarm`) — bygger galleribilderna ur
// leverantörsbilden.
//
// Källan (/tmp/b8/bilder/image1.jpg, 800×800) är en studiobild på vit botten MED
// leverantörstext: röd rubrik "Anti-Theft Alarm" överst och cyan "Factory Supply
// In Stock" nederst (se fakta.mjs: båda måste bort). Texten målas INTE över —
// den beskärs bort. Pixelprofil på källan ger exakt var den slutar:
//     sista raden med röd text  y = 93
//     första raden med cyan text y = 704
//     produktens bbox i bandet däremellan: x 147–652, y 127–662
//     två objekt, helt separerade i x: fjärrkontroll x 147–322 (y 231–583)
//                                      larmenhet     x 382–652 (y 127–662)
// Varje ruta nedan ligger helt innanför y 94–703, alltså kan ingen
// leverantörstext följa med in i någon utdatabild.
//
// Siffrorna i infografiken kommer UTESLUTANDE ur temu/batch8/fakta.mjs
// (110 dB, vibrationssensor, fjärrkontroll, monteras på dörr/fönster/cykel).
// Inga mått, ingen vikt, ingen batteritid och ingen räckvidd står där — alltså
// påstås inget sådant någonstans.
//
// Kör:  node temu/batch8/bilder-fonsterlarm.mjs [källbild] [ut-sv] [ut-no]
import sharp from '../node_modules/sharp/dist/index.mjs';
import { mkdirSync } from 'node:fs';
import { FAKTA } from './fakta.mjs';

const SRC = process.argv[2] || '/tmp/b8/bilder/image1.jpg';
const UT_SV = process.argv[3] || '/tmp/b8/ut/fonsterlarm';
const UT_NO = process.argv[4] || '/tmp/b8/ut-no/fonsterlarm';
mkdirSync(UT_SV, { recursive: true });
mkdirSync(UT_NO, { recursive: true });

const F = FAKTA.fonsterlarm.latt;
const BLA = '#0b2a3d', GUL = '#ffd24a', GRA = '#5b6b76', SVART = '#12212b';
const S = 1600;

/* ---------- 1. utsnitt ur källbilden ----------
   Alla rutor: top ≥ 94 och top+height ≤ 703 → all leverantörstext utanför. */
const RUTA = {
  // båda delarna med luft runt om — blir hero
  hel: { left: 137, top: 117, width: 526, height: 556 },
  // fjärrkontrollen ensam — blir detalj (bär faktumet "fjärrkontroll")
  fjarr: { left: 137, top: 221, width: 196, height: 372 },
  // larmenheten ensam
  larm: { left: 372, top: 117, width: 290, height: 556 },
  // sirenkupan i närbild — bär faktumet 110 dB
  siren: { left: 385, top: 120, width: 230, height: 230 },
};

const skar = (r) => sharp(SRC).extract(r).png().toBuffer();

/* ---------- 2. hjälpare ---------- */
// Skalar in ett utsnitt i en ruta utan att förvränga det.
async function passa(png, maxW, maxH) {
  const m = await sharp(png).metadata();
  const s = Math.min(maxW / m.width, maxH / m.height);
  const w = Math.round(m.width * s), h = Math.round(m.height * s);
  return { buf: await sharp(png).resize(w, h).png().toBuffer(), w, h };
}
const txt = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const duk = () => sharp({ create: { width: S, height: S, channels: 3, background: '#ffffff' } });

// Lägger ett utsnitt centrerat på vit kvadrat.
async function pltta(ruta, maxW, maxH, fil) {
  const p = await passa(await skar(ruta), maxW, maxH);
  await duk().composite([{
    input: p.buf, left: Math.round((S - p.w) / 2), top: Math.round((S - p.h) / 2),
  }]).jpeg({ quality: 92 }).toFile(fil);
  console.log('✔', fil);
}

/* ---------- 3. hero: larm + fjärrkontroll, ingen text ---------- */
const hero = (fil) => pltta(RUTA.hel, 1320, 1320, fil);

/* ---------- 4. detalj: fjärrkontrollen ---------- */
const detalj = (fil) => pltta(RUTA.fjarr, 1180, 1260, fil);

/* ---------- 5. infografik ----------
   Varje rad: gul etikettruta, fet rubrik, grå undertext och ett utsnitt ur den
   riktiga bilden till höger. Fyra rader — en per låst faktum. */
const ORD = {
  sv: {
    rubrik: 'FÖNSTERLARM – SÅ FUNGERAR DET',
    rader: [
      [`${F.ljudnivaDb} DB`, 'Ljudnivå', 'Larmets angivna ljudstyrka', 'siren'],
      ['SENSOR', 'Vibrationssensor', 'Larmet reagerar på vibrationer', 'larm'],
      ['FJÄRR', 'Fjärrkontroll', 'Fjärrkontroll ingår', 'fjarr'],
      ['3 PLATSER', 'Dörr, fönster, cykel', 'De platser larmet är avsett för', 'hel'],
    ],
  },
  no: {
    rubrik: 'VINDUSALARM – SLIK FUNGERER DET',
    rader: [
      [`${F.ljudnivaDb} DB`, 'Lydnivå', 'Alarmens oppgitte lydstyrke', 'siren'],
      ['SENSOR', 'Vibrasjonssensor', 'Alarmen reagerer på vibrasjoner', 'larm'],
      ['FJERN', 'Fjernkontroll', 'Fjernkontroll følger med', 'fjarr'],
      ['3 STEDER', 'Dør, vindu, sykkel', 'Stedene alarmen er beregnet for', 'hel'],
    ],
  },
};

async function fakta(sprak, fil) {
  const o = ORD[sprak];
  const rader = o.rader, radH = Math.floor((S - 120) / rader.length);   // 370 px
  const lager = [], svg = [
    `<rect x="0" y="0" width="${S}" height="120" fill="${BLA}"/>`,
    `<text x="${S / 2}" y="78" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="44" fill="#ffffff" letter-spacing="2">${txt(o.rubrik)}</text>`,
  ];
  // alla etikettrutor får samma bredd som den längsta texten kräver — då står
  // rubrikerna i linje och ingen text klipps
  const bw = Math.max(...rader.map(([e]) => Math.round(e.length * 25) + 44), 150);
  for (let g = 0; g < rader.length; g++) {
    const [etikett, rubrik, under, bild] = rader[g];
    const y = 120 + g * radH;
    const mitt = y + Math.round(radH / 2);          // radens mittlinje
    if (g) svg.push(`<rect x="80" y="${y}" width="${S - 160}" height="2" fill="#e4e8ea"/>`);
    svg.push(`<rect x="84" y="${mitt - 36}" width="${bw}" height="72" rx="12" fill="${GUL}"/>`);
    svg.push(`<text x="${84 + bw / 2}" y="${mitt + 15}" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="38" fill="${SVART}">${txt(etikett)}</text>`);
    const tx = 84 + bw + 40;
    svg.push(`<text x="${tx}" y="${mitt - 10}" font-family="DejaVu Sans" font-weight="bold" font-size="42" fill="${BLA}">${txt(rubrik)}</text>`);
    svg.push(`<text x="${tx}" y="${mitt + 40}" font-family="DejaVu Sans" font-size="26" fill="${GRA}">${txt(under)}</text>`);
    const p = await passa(await skar(RUTA[bild]), 230, radH - 70);
    lager.push({ input: p.buf, top: mitt - Math.round(p.h / 2), left: 1300 + Math.round((230 - p.w) / 2) });
  }
  lager.push({ input: Buffer.from(`<svg width="${S}" height="${S}" xmlns="http://www.w3.org/2000/svg">${svg.join('')}</svg>`), top: 0, left: 0 });
  await duk().composite(lager).jpeg({ quality: 92 }).toFile(fil);
  console.log('✔', fil);
}

/* ---------- 6. kör ---------- */
for (const ut of [UT_SV, UT_NO]) {
  await hero(`${ut}/fonsterlarm-hero.jpg`);
  await detalj(`${ut}/fonsterlarm-detalj.jpg`);
}
await fakta('sv', `${UT_SV}/fonsterlarm-fakta.jpg`);
await fakta('no', `${UT_NO}/fonsterlarm-fakta.jpg`);

// Referensbild för Higgsfield (ren, textfri, båda delarna).
await hero('/tmp/b8/fonsterlarm-ref.jpg');

/* ---------- 7. miljöbild + GIF (Higgsfield, körs utanför det här skriptet) ----
   Miljöbilden och GIF:en är AI-genererade och byggs inte av sharp. Kört
   2026-09-11, stegen för att kunna göra om dem:

   1. Referensbild. Produkten har ingen publik käll-URL (offerten pekar på
      AliExpress 1005007345104914, som är blockerat från molnet), så referensen
      byggdes ur leverantörsbilden i stället: larmenheten ensam (RUTA.larm) på
      vit 1024×1024-duk, uppladdad med media_upload → curl PUT → media_confirm.
      AI:n har alltså sett den RIKTIGA produkten.
   2. generate_image  model "gpt_image_2", aspect_ratio "1:1", quality "high",
      resolution "2k", count 2, medias [{role:"image", value:<media_id>}].
      Scen: svenskt vardagsrum tidig höst, larmet monterat på den vitmålade
      fönsterkarmen, björk med gulnande löv utanför, fotorealistiskt, ingen
      text, inga logotyper. Bästa varianten skalades till 1600×1600 q92 och
      lades som fonsterlarm-miljo.jpg i BÅDA språkmapparna.
   3. media_import_url på miljöbildens resultat-URL → media_id.
   4. generate_video model "seedance_2_5", mode "omni_reference", duration 5,
      aspect_ratio "1:1", medias [{role:"start_image", value:<media_id>}].
      Rörelsen: stillastående kamera, larmet står still, den röda dioden pulsar
      och gardinen/löven rör sig svagt. Larmet ritas inte om — kontrollerat
      ruta för ruta. (Kom en "preset_recommendation" — skickades om med
      declined_preset_id.)
   5. GIF ur mp4:an med ffmpeg (2,35 MB, 50 rutor, 480×480):
        ffmpeg -i larm.mp4 -vf "fps=10,scale=480:-1:flags=lanczos,\
          palettegen=max_colors=200:stats_mode=diff" -frames:v 1 palett.png
        ffmpeg -i larm.mp4 -i palett.png -lavfi "fps=10,scale=480:-1:flags=lanczos[x];\
          [x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle" \
          -loop 0 fonsterlarm-miljo.gif                                       */
