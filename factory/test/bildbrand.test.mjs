// Tester för factory/bildbrand.mjs — slutkortskollen (Axels beslut 2026-09-20,
// luckan som släppte igenom Bäverbutikens logga till Norge).
//
// Ingen ffmpeg, ingen OCR, ingen nätverkstrafik: både ffmpeg-körningen och
// OCR:en injiceras. Testerna mäter BESLUTET, och beslutet måste gå att mäta
// även i en container utan rapidocr — annars går grinden inte att lita på.
//
// Bildrutorna är syntetiska gråskalerutor: en "film" (rutor som skiljer sig
// åt) och ett "slutkort" (identiska rutor). Det är exakt vad modulen läser ur
// ffmpeg: RUTA×RUTA byte per bildruta, ingen bildavkodning.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  DOMAR, SLUT_SEK, RUTA, FPS, STILLA_TROSKEL, BYTE_TROSKEL, OKAND_EN, IKON,
  langdUrFfmpeg, delaRutor, medelDiff, storstaDiff, arSlutkort,
  butiksfynd, slutkortsdom, rapportrad, blockerar, slutSekUrFlagga,
  granskaSlutkort, granskaOmVideo,
} from '../bildbrand.mjs';

// ------------------------------------------------------------ byggstenar

const PER = RUTA * RUTA;
const ruta = (varde) => Buffer.alloc(PER, varde);
/** Rutor med brus så de skiljer sig åt — "filmen". */
const brusruta = (frö) => Buffer.from(Array.from({ length: PER }, (_, i) => (frö * 37 + i * 11) % 256));

/**
 * En falsk ffmpeg. `langd` sekunder, och rutorna byggs efter `harSlutkort`.
 * Anropen är desamma som modulen gör: `-i` (längd), rawvideo (rutor),
 * PNG-uttag (skriver filen).
 */
function falskFfmpeg({ langd = 11, harSlutkort = true, slutvarde = 200, stillaBrus = 0, pngFel = false } = {}) {
  return (args) => {
    if (args.length === 2 && args[0] === '-i') {
      const mm = String(Math.floor(langd / 60)).padStart(2, '0');
      const ss = (langd % 60).toFixed(2).padStart(5, '0');
      return { status: 1, stdout: Buffer.alloc(0), stderr: `  Duration: 00:${mm}:${ss}, start: 0.000000, bitrate: 2000 kb/s\n`, fel: null };
    }
    if (args.includes('-f') && args.includes('rawvideo')) {
      // Fönstret: FORE_SEK före slutkortet + slutkortet, FPS rutor/sekund.
      const antal = Math.round((SLUT_SEK + 1.2) * FPS);
      const kortStartIndex = Math.round(1.2 * FPS);
      const bitar = [];
      for (let i = 0; i < antal; i++) {
        if (i < kortStartIndex) bitar.push(brusruta(i));
        else if (harSlutkort) bitar.push(stillaBrus ? Buffer.from(ruta(slutvarde).map((v, j) => (j % 997 === 0 ? v - stillaBrus : v))) : ruta(slutvarde));
        else bitar.push(brusruta(i + 100));
      }
      return { status: 0, stdout: Buffer.concat(bitar), stderr: '', fel: null };
    }
    // PNG-uttaget: sista argumentet är filnamnet.
    if (!pngFel) writeFileSync(args[args.length - 1], 'inte en riktig png, men filen finns');
    return { status: pngFel ? 1 : 0, stdout: Buffer.alloc(0), stderr: '', fel: null };
  };
}

const falskOcr = (rader) => () => ({ rader, fel: null });
const trasigOcr = () => ({ rader: null, fel: 'rapidocr-onnxruntime saknas' });

function medVideofil(kor) {
  const mapp = mkdtempSync(join(tmpdir(), 'bildbrand-test-'));
  const fil = join(mapp, 'annons.mp4');
  writeFileSync(fil, 'filens innehåll läses aldrig — ffmpeg är injicerad');
  try { return kor(fil, mapp); } finally { rmSync(mapp, { recursive: true, force: true }); }
}

// ------------------------------------------------------------ de tre domarna

test('dom 1: video utan slutkort är ren — och OCR körs aldrig', async () => {
  let ocrAnrop = 0;
  const g = await medVideofil((fil) => granskaSlutkort(fil, {
    kor: falskFfmpeg({ harSlutkort: false }),
    ocr: () => { ocrAnrop++; return { rader: [], fel: null }; },
  }));
  assert.equal(g.dom, DOMAR.ren);
  assert.equal(ocrAnrop, 0, 'en ren video får inte kosta ett OCR-anrop');
  assert.equal(rapportrad('Takoverdrag_GT_4_H1', g), null, 'rena videor ger ingen rad — annars drunknar fynden');
  assert.equal(blockerar(g.dom), false);
});

test('dom 2: slutkort utan butiksnamn — laddas upp, men namnges i rapporten', async () => {
  const g = await medVideofil((fil) => granskaSlutkort(fil, {
    kor: falskFfmpeg({}),
    ocr: falskOcr(['ASUNTOVAUNUN KATTOPEITE', '165,90  126,90', 'Varastossa - rajoitettu maara']),
  }));
  assert.equal(g.dom, DOMAR.utanBrand);
  assert.deepEqual(g.fynd, []);
  assert.equal(blockerar(g.dom), false, 'ett finskt ombyggt slutkort stoppar ingenting');
  assert.match(rapportrad('FI_Takoverdrag_CO_1_H1', g), /has an end card/);
});

test('dom 3: slutkort med källbutikens namn — stoppas före uppladdning och namnges', async () => {
  const g = await medVideofil((fil) => granskaSlutkort(fil, {
    kor: falskFfmpeg({}),
    ocr: falskOcr(['BAVERBUTIKEN', 'TAKOVERDRAG HUSVAGN 6,5*3 M', '★★★★★ 10 recensioner', '1 469 Kr 1 129 Kr']),
  }));
  assert.equal(g.dom, DOMAR.medBrand);
  assert.equal(g.fynd.length, 1);
  // sökBrand rapporterar den normaliserade formen (brandord.mjs) — samma
  // sträng som yta 1–4 i brand-detektorn skulle ha rapporterat.
  assert.equal(g.fynd[0].ord, 'baverbutiken');
  assert.match(g.fynd[0].satt, /kallbrand/);
  assert.equal(blockerar(g.dom), true, 'spärren gäller FÖRE uppladdning');
  assert.match(rapportrad('Takoverdrag_CO_1_H1', g), /NOT uploaded/);
});

test('dom 3 gäller även butikens EGET namn och domän (PD_5_H1: carashell.se)', async () => {
  const g = await medVideofil((fil) => granskaSlutkort(fil, {
    butiksord: ['carashell', 'carashell.se'],
    kor: falskFfmpeg({}),
    ocr: falskOcr(['carashell.se', 'CARASHELL', 'Takoverdrag Husvagn & Husbil 6,5 x 3 m']),
  }));
  assert.equal(g.dom, DOMAR.medBrand, 'ingen butik namnges i en annons — inte ens den egna');
  assert.deepEqual(g.fynd.map((f) => f.ord), ['carashell.se'], 'ett fynd per sak — inte samma butik tre gånger');
});

test('dom 4 (okänd): OCR saknas — raden namnges men stoppas inte', async () => {
  const g = await medVideofil((fil) => granskaSlutkort(fil, { kor: falskFfmpeg({}), ocr: trasigOcr }));
  assert.equal(g.dom, DOMAR.okand);
  assert.match(g.skal, /rapidocr/);
  assert.equal(blockerar(g.dom), false, 'ett saknat python-paket får aldrig stoppa hela Danmark');
  assert.match(rapportrad('Takoverdrag_RI_1_H1', g), /could not be checked/);
});

test('okänd: för kort video går inte att döma — aldrig "ren"', async () => {
  const g = await medVideofil((fil) => granskaSlutkort(fil, { kor: falskFfmpeg({ langd: 3.0 }), ocr: falskOcr([]) }));
  assert.equal(g.dom, DOMAR.okand);
  assert.match(g.skal, /för kort/);
});

test('okänd: filen finns inte', async () => {
  const g = await granskaSlutkort('/finns/inte/alls.mp4', { kor: falskFfmpeg({}), ocr: falskOcr([]) });
  assert.equal(g.dom, DOMAR.okand);
});

// ------------------------------------------------------------ mätningen

test('langdUrFfmpeg läser Duration ur stderr (ffprobe -select_streams är trasig i containern)', () => {
  assert.equal(langdUrFfmpeg('  Duration: 00:00:11.03, start: 0.000000, bitrate: 2 000 kb/s'), 11.03);
  assert.equal(langdUrFfmpeg('  Duration: 01:02:03.00,'), 3723);
  assert.equal(langdUrFfmpeg('inget här'), null);
  assert.equal(langdUrFfmpeg(null), null);
});

test('delaRutor + medelDiff läser rå gråskala utan bildbibliotek', () => {
  const buf = Buffer.concat([ruta(10), ruta(20), ruta(20)]);
  const r = delaRutor(buf);
  assert.equal(r.length, 3);
  assert.equal(medelDiff(r[0], r[1]), 10);
  assert.equal(medelDiff(r[1], r[2]), 0);
  assert.equal(storstaDiff(r), 10);
  // Ofullständig sista ruta kastas — en halv bildruta är ingen bildruta.
  assert.equal(delaRutor(Buffer.concat([ruta(5), Buffer.alloc(17)])).length, 1);
});

test('arSlutkort: stillbild som byter från filmen', () => {
  const kort = [ruta(200), ruta(200), ruta(200)];
  const fore = [brusruta(1), brusruta(2)];
  const d = arSlutkort(kort, fore);
  assert.equal(d.slutkort, true);
  assert.ok(d.stilla < STILLA_TROSKEL && d.byte > BYTE_TROSKEL);
});

test('arSlutkort: rörligt slut är inget slutkort', () => {
  const d = arSlutkort([brusruta(1), brusruta(2), brusruta(3)], [brusruta(4), brusruta(5)]);
  assert.equal(d.slutkort, false);
  assert.match(d.skal, /rör sig/);
});

test('arSlutkort: en film som står stilla HELA vägen är inget slutkort', () => {
  // Utan referensfönstret hade en produktbild med voiceover blivit "slutkort".
  const d = arSlutkort([ruta(120), ruta(120), ruta(120)], [ruta(120), ruta(120)]);
  assert.equal(d.slutkort, false);
  assert.match(d.skal, /samma bild som före/);
});

test('arSlutkort: utan referensruta blir det aldrig ett tyst ja', () => {
  const d = arSlutkort([ruta(9), ruta(9)], []);
  assert.equal(d.slutkort, false);
  assert.match(d.skal, /referensruta/);
});

// ------------------------------------------------------------ textläsningen

test('butiksfynd hittar källbrandet även när OCR:en tappar tecken', () => {
  // Mätt på riktigt material: OCR:en läser "BAVERBUTIKEN" utan ä.
  assert.equal(butiksfynd(['BAVERBUTIKEN']).length, 1);
  assert.equal(butiksfynd(['Beverbutikken']).length, 1, 'norska formen ligger live i Norge');
  assert.equal(butiksfynd(['baverbutiken.se']).length, 1);
});

test('butiksfynd hittar vilken domän som helst — en .se i ett slutkort ÄR en butik', () => {
  const f = butiksfynd(['Besok tankguard.se i dag']);
  assert.deepEqual(f.map((x) => x.ord), ['tankguard.se']);
  assert.equal(f[0].satt, 'doman');
});

test('butiksfynd friar vanlig slutkortstext (pris, mått, recensioner)', () => {
  const rent = ['TAKOVERDRAG HUSVAGN 6,5*3 M', '★★★★★ 10 recensioner', '1 469 Kr  1 129 Kr', 'Finns i lager - Begransat antal', '210D-vav'];
  assert.deepEqual(butiksfynd(rent, { butiksord: ['carashell', 'carashell.se'] }), []);
});

test('butiksfynd rapporterar ordet ORDAGRANT, en gång', () => {
  const f = butiksfynd(['carashell.se', 'CARASHELL.SE'], { butiksord: ['carashell.se'] });
  assert.equal(f.length, 1);
  assert.equal(f[0].ord, 'carashell.se');
});

test('slutkortsdom är ett rent beslutsträd', () => {
  assert.equal(slutkortsdom({ last: false, skal: 'trasig fil' }).dom, DOMAR.okand);
  assert.equal(slutkortsdom({ last: true, slutkort: false }).dom, DOMAR.ren);
  assert.equal(slutkortsdom({ last: true, slutkort: true, fynd: [] }).dom, DOMAR.utanBrand);
  const med = slutkortsdom({ last: true, slutkort: true, fynd: [{ ord: 'BAVERBUTIKEN', form: 'baverbutiken', satt: 'kallbrand/exakt' }] });
  assert.equal(med.dom, DOMAR.medBrand);
  assert.match(med.skal, /"BAVERBUTIKEN"/, 'fyndet namnges i klartext, det göms aldrig');
});

// ------------------------------------------------------------ kostnaden

test('granskaOmVideo rör bara video som faktiskt ska laddas upp', async () => {
  const aldrig = () => { throw new Error('ffmpeg fick inte köras'); };
  assert.equal(await granskaOmVideo({ fil: null, typ: 'video', kor: aldrig }), null, 'ingen fil = inget att granska');
  assert.equal(await granskaOmVideo({ fil: '/a/b.jpg', typ: 'bild', kor: aldrig }), null, 'bildannonser har inget slutkort att läsa');
  assert.equal(await granskaOmVideo({ fil: '/a/b.mp4', typ: 'video', hoppa: true, kor: aldrig }), null, 'redan uppe i Meta = ingen uppladdning = ingen kontroll');
  const g = await medVideofil((fil) => granskaOmVideo({ fil, typ: 'video', kor: falskFfmpeg({ harSlutkort: false }), ocr: falskOcr([]) }));
  assert.equal(g.dom, DOMAR.ren);
});

test('granskningen mäter sin egen tid (krav: nattrutinen får inte bli långsam)', async () => {
  // ⚠️ `typeof g.sekunder === 'number'` ensamt är ett test som inte kan fallera —
  //    fältet sätts alltid med Number(). Mät i stället att klockan verkligen går:
  //    en injicerad ffmpeg som sover 120 ms måste synas i talet.
  const sov = (kor) => (args) => { const t = Date.now(); while (Date.now() - t < 40); return kor(args); };
  const g = await medVideofil((fil) => granskaSlutkort(fil, { kor: sov(falskFfmpeg({ harSlutkort: false })), ocr: falskOcr([]) }));
  assert.equal(typeof g.sekunder, 'number');
  assert.ok(g.sekunder >= 0.08, `två ffmpeg-anrop à 40 ms ska synas i tiden, fick ${g.sekunder}`);
  assert.ok(g.sekunder < 30, `orimlig tid: ${g.sekunder}`);
});

test('rapportraden är ENGELSK hela vägen — även när skälet är svenskt', async () => {
  // Discord-raderna går genom tools/lib/engelska.mjs, som stoppar svensk text
  // med exit 3 när ANTHROPIC_NYCKEL saknas (och den har saknats i varenda
  // OPS-container, se CLAUDE.md). `skal` är svenskt i hela modulen, så
  // `okand`-raden måste bära OKAND_EN[kod], aldrig skälet.
  const { serUtSomSvenska } = await import('../../tools/lib/engelska.mjs');
  for (const [kod, bygg] of [
    ['ocr-fel', (fil) => granskaSlutkort(fil, { kor: falskFfmpeg({}), ocr: trasigOcr })],
    ['for-kort', (fil) => granskaSlutkort(fil, { kor: falskFfmpeg({ langd: 3.0 }), ocr: falskOcr([]) })],
    ['ingen-bildruta', (fil) => granskaSlutkort(fil, { kor: falskFfmpeg({ pngFel: true }), ocr: falskOcr([]) })],
  ]) {
    const g = await medVideofil(bygg);
    assert.equal(g.dom, DOMAR.okand);
    assert.equal(g.kod, kod, `koden ska vara språkneutral och namngiven: ${g.skal}`);
    const rad = rapportrad('Takoverdrag_CO_1_H1', g);
    assert.ok(OKAND_EN[kod], `saknad engelsk orsak för ${kod}`);
    assert.ok(rad.includes(OKAND_EN[kod]), rad);
    assert.equal(serUtSomSvenska(rad), false, `svensk text i en Discord-rad: ${rad}`);
  }
  // Filen som inte finns går aldrig genom medVideofil.
  const saknad = await granskaSlutkort('/finns/inte/alls.mp4', { kor: falskFfmpeg({}), ocr: falskOcr([]) });
  assert.equal(saknad.kod, 'fil-saknas');
  assert.equal(serUtSomSvenska(rapportrad('X_1_H1', saknad)), false);
});

test('slutSekUrFlagga: NaN når aldrig ffmpeg -ss', () => {
  assert.equal(slutSekUrFlagga(undefined), SLUT_SEK, '--slut utan värde faller tillbaka på det mätta fönstret');
  assert.equal(slutSekUrFlagga(''), SLUT_SEK);
  assert.equal(slutSekUrFlagga('2.5'), 2.5);
  assert.throws(() => slutSekUrFlagga('abc'), /positivt tal/);
  assert.throws(() => slutSekUrFlagga('0'), /positivt tal/);
  assert.throws(() => slutSekUrFlagga('-3'), /positivt tal/);
});

test('IKON täcker varje dom — en femte dom får inte bli "?" i två tabeller av tre', () => {
  // Ikonen låg hårdkodad i CLI:n, i ops-spegla/tabell och i ops-leveranskon/tabell.
  for (const dom of Object.values(DOMAR)) assert.ok(IKON[dom], `ingen ikon för domen "${dom}"`);
  assert.equal(Object.keys(IKON).length, Object.keys(DOMAR).length);
});

test('domänen får inte fastna MITT i ett ord — å/ä/ö/æ bryter inte \\b i JS', () => {
  // Mätt 2026-09-20: med `\b` gav "Begrænsetantal.Se" fyndet "nsetantal.Se" och
  // "påLager.Se" gav "Lager.Se" — båda hade stoppat en rad före uppladdning.
  assert.deepEqual(butiksfynd(['Begrænsetantal.Se']), []);
  assert.deepEqual(butiksfynd(['påLager.Se']), []);
  assert.deepEqual(butiksfynd(['Begrænsetantal.Sehere']), [], 'OCR klistrar ihop orden — då är det ingen domän');
  // …men riktiga domäner ska fortfarande fällas, med och utan omgivande ord.
  assert.deepEqual(butiksfynd(['carashell.se']).map((f) => f.ord), ['carashell.se']);
  assert.deepEqual(butiksfynd(['Besok tankguard.se i dag']).map((f) => f.ord), ['tankguard.se']);
  assert.deepEqual(butiksfynd(['CARASHELL.SE']).map((f) => f.ord), ['CARASHELL.SE']);
});
