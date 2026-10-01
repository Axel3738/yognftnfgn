// svenska-bilder.mjs — tar bort beskrivningsbilder med inbränd svensk text ur ÖVERSÄTTNINGARNA
// (oversattning/<språk>/<handle>.json → descriptionHtml) och byter båtmotorskyddets svenska
// storleksguide mot en tabell på kundens språk. Den svenska produkttexten rörs aldrig.
//
//   node worldwide/granskning/svenska-bilder.mjs            # torrt: vad som skulle ändras
//   node worldwide/granskning/svenska-bilder.mjs --skriv    # skriv filerna (sedan bygg.mjs --steg oversattningar --skarpt)
//
// Mätt 2026-10-01 med OCR på alla 49 beskrivningsbilder i de 16 annonsprodukterna: tio bar svensk
// text ("Effektiv fixering", "Fyra färgalternativ", "Storleksguide – utombordarskydd", "Setet i
// siffror", "Justerbart spänne under foten", "MÅTTSKISS", "Före/Efter", "Storlek 41–46"). Fakta i
// dem står redan i den översatta texten (mått, delar, storlekar) — utom storleksguiden, som blir tabell.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..', 'oversattning');
const SPRAK = ['en', 'de', 'fr', 'es', 'it', 'nl', 'pl', 'pt-PT'];

export const BORT = {
  'fiskespohallare-4-pack-kraftig-forvaring': ['hf_20260817_053307_df302002', 'hf_20260817_053329_603c77a7'],
  'ibc-tankoverdrag-1000-l-stoppar-alger-uv': ['klart-forefter-tankoverdrag-sv'],
  'sotarset-med-bojliga-stanger-rensar-rokkanal-och-kaminror': ['b8-sotarset-fakta-se'],
  'mc-kapell-220-120-regn-damm-uv': ['mc-matt-sv'],
  'damasker-vandring-haller-sno-vata-grus-ute': ['klart-spanne-benskydd-sv', 'klart-matt-benskydd-sv'],
  'taljset-30-delar-6-knivar-och-6-jarn': ['b10-taljset-fakta-se'],
  'varmesulor-med-fjarrkontroll-varma-fotter-pa-passet': ['15-sv'],
};

// Storleksguiden ur bilden batmotor-tabell-sv.jpg (avläst och kontrollerad mot bilden 2026-10-01).
const RADER = [['6–15', 140, 115], ['15–20', 150, 130], ['20–30', 165, 142], ['30–60', 180, 149], ['60–100', 200, 175], ['100–150', 226, 195], ['175–225', 248, 200]];
const GUIDE = {
  en: { t: 'Size guide – outboard motor cover', m: 'Motor', o: 'Circumference', h: 'Height', e: 'hp', n: 'Circumference is measured around the motor cowl. Measurements are approximate and may vary slightly.' },
  de: { t: 'Größentabelle – Außenborder-Abdeckung', m: 'Motor', o: 'Umfang', h: 'Höhe', e: 'PS', n: 'Der Umfang wird um die Motorhaube gemessen. Die Maße sind Circa-Angaben und können leicht abweichen.' },
  fr: { t: 'Guide des tailles – housse de moteur hors-bord', m: 'Moteur', o: 'Circonférence', h: 'Hauteur', e: 'ch', n: 'La circonférence se mesure autour du capot moteur. Les mesures sont approximatives et peuvent varier légèrement.' },
  es: { t: 'Guía de tallas – funda para motor fueraborda', m: 'Motor', o: 'Circunferencia', h: 'Altura', e: 'CV', n: 'La circunferencia se mide alrededor de la carcasa del motor. Las medidas son aproximadas y pueden variar ligeramente.' },
  it: { t: 'Guida alle taglie – copertura per motore fuoribordo', m: 'Motore', o: 'Circonferenza', h: 'Altezza', e: 'CV', n: 'La circonferenza si misura intorno alla calandra del motore. Le misure sono indicative e possono variare leggermente.' },
  nl: { t: 'Maattabel – buitenboordmotorhoes', m: 'Motor', o: 'Omtrek', h: 'Hoogte', e: 'pk', n: 'De omtrek meet je rond de motorkap. De maten zijn bij benadering en kunnen iets afwijken.' },
  pl: { t: 'Tabela rozmiarów – pokrowiec na silnik zaburtowy', m: 'Silnik', o: 'Obwód', h: 'Wysokość', e: 'KM', n: 'Obwód mierzy się wokół osłony silnika. Wymiary są przybliżone i mogą się nieznacznie różnić.' },
  'pt-PT': { t: 'Guia de tamanhos – capa para motor fora de borda', m: 'Motor', o: 'Perímetro', h: 'Altura', e: 'cv', n: 'O perímetro mede-se à volta da carenagem do motor. As medidas são aproximadas e podem variar ligeiramente.' },
};
export function storleksguide(l) {
  const g = GUIDE[l];
  const td = 'style="padding:6px 10px;border-bottom:1px solid #ddd;text-align:left"';
  return `<h3>${g.t}</h3><table style="border-collapse:collapse;width:100%;max-width:480px"><thead><tr><th ${td}>${g.m}</th><th ${td}>${g.o}</th><th ${td}>${g.h}</th></tr></thead><tbody>${RADER.map(([m, o, h]) => `<tr><td ${td}>${m} ${g.e}</td><td ${td}>${o} cm</td><td ${td}>${h} cm</td></tr>`).join('')}</tbody></table><p style="font-size:14px;color:#555">${g.n}</p>`;
}

// Motorhöljets storlekstabell finns bara som galleribild med svensk text (Namnlosdesign.png, "Storlek på
// utombordsmotorkåpa", OCR 2026-10-01). Bilden döljs i världsläget (tema/patch.mjs → GALLERI), så måtten
// står i texten i stället, efter egenskapslistan. Avläst ur bilden: längd, bredd, höjd i cm och tum.
const MARIN = [['6–18', 27, 10.6, 52, 20.5, 32, 12.6], ['20–30', 30, 11.8, 56, 22.1, 40, 15.8], ['40–60', 36, 14.2, 62, 24.4, 49, 19.3], ['60–90', 40, 15.8, 68, 26.8, 53, 20.9], ['100–150', 46, 18.1, 74, 29.1, 58, 22.8], ['175–250', 50, 19.7, 82, 32.3, 60, 23.6]];
const MARIN_ORD = {
  en: ['Compatible motors', 'Length', 'Width', 'Height', 'Measurements are approximate and may vary slightly.'],
  de: ['Passende Motoren', 'Länge', 'Breite', 'Höhe', 'Die Maße sind Circa-Angaben und können leicht abweichen.'],
  fr: ['Moteurs compatibles', 'Longueur', 'Largeur', 'Hauteur', 'Les mesures sont approximatives et peuvent varier légèrement.'],
  es: ['Motores compatibles', 'Longitud', 'Anchura', 'Altura', 'Las medidas son aproximadas y pueden variar ligeramente.'],
  it: ['Motori compatibili', 'Lunghezza', 'Larghezza', 'Altezza', 'Le misure sono indicative e possono variare leggermente.'],
  nl: ['Geschikte motoren', 'Lengte', 'Breedte', 'Hoogte', 'De maten zijn bij benadering en kunnen iets afwijken.'],
  pl: ['Pasujące silniki', 'Długość', 'Szerokość', 'Wysokość', 'Wymiary są przybliżone i mogą się nieznacznie różnić.'],
  'pt-PT': ['Motores compatíveis', 'Comprimento', 'Largura', 'Altura', 'As medidas são aproximadas e podem variar ligeiramente.'],
};
export function marinGuide(l) {
  const g = GUIDE[l];
  const [m, lg, b, h, n] = MARIN_ORD[l];
  const td = 'style="padding:6px 10px;border-bottom:1px solid #ddd;text-align:left"';
  const mt = (cm, tum) => `${cm} cm / ${tum} in`;
  return `<h3>${g.t}</h3><table style="border-collapse:collapse;width:100%;max-width:560px"><thead><tr><th ${td}>${m}</th><th ${td}>${lg}</th><th ${td}>${b}</th><th ${td}>${h}</th></tr></thead><tbody>${MARIN.map(([mo, l1, l2, b1, b2, h1, h2]) => `<tr><td ${td}>${mo} ${g.e}</td><td ${td}>${mt(l1, l2)}</td><td ${td}>${mt(b1, b2)}</td><td ${td}>${mt(h1, h2)}</td></tr>`).join('')}</tbody></table><p style="font-size:14px;color:#555">${n}</p>`;
}
const MARIN_HANDLE = 'marin-motorholje-420d-universellt-skydd';

/** Tar bort <p> som bara bär bilden (eller bilden ensam) och byter storleksguiden. Ren funktion. */
export function rensa(html, handle, l) {
  let ut = html;
  for (const namn of BORT[handle] ?? []) {
    const re = new RegExp(`<p>\\s*<img[^>]*${namn}[^>]*>\\s*</p>|<img[^>]*${namn}[^>]*>`, 'g');
    ut = ut.replace(re, '');
  }
  if (handle === 'batmotorskydd-420d-heltackande-for-utombordare') {
    ut = ut.replace(/<p>\s*<img[^>]*batmotor-tabell-sv[^>]*>\s*<\/p>|<img[^>]*batmotor-tabell-sv[^>]*>/, storleksguide(l));
  }
  // Motorhöljet: tabellen efter första listan, en gång (körs både på källan och på översättningen).
  if (handle === MARIN_HANDLE && !ut.includes(GUIDE[l].t) && ut.includes('</ul>')) {
    ut = ut.replace('</ul>', `</ul>\n${marinGuide(l)}`);
  }
  return ut;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const skriv = process.argv.includes('--skriv');
  let andrade = 0;
  for (const l of SPRAK) for (const h of [...Object.keys(BORT), 'batmotorskydd-420d-heltackande-for-utombordare', MARIN_HANDLE]) {
    const f = join(ROT, l, `${h}.json`);
    if (!existsSync(f)) { console.log(`⚠️ ${l}/${h}: ingen fil`); continue; }
    const j = JSON.parse(readFileSync(f, 'utf8'));
    const fore = j.descriptionHtml ?? '';
    const efter = rensa(fore, h, l);
    const kvar = [...(BORT[h] ?? []), ...(h.startsWith('batmotorskydd') ? ['batmotor-tabell-sv'] : [])].filter((n) => efter.includes(n));
    if (kvar.length) console.log(`❌ ${l}/${h}: finns kvar ${kvar.join(', ')}`);
    if (efter === fore) continue;
    andrade++;
    console.log(`${skriv ? '✏️' : 'torrt'} ${l}/${h}: ${fore.length} → ${efter.length} tecken`);
    if (skriv) writeFileSync(f, JSON.stringify({ ...j, descriptionHtml: efter }, null, 2) + '\n');
  }
  console.log(`${andrade} filer ${skriv ? 'skrivna' : 'skulle ändras'}`);
}
