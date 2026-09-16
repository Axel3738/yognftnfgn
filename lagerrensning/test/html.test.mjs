import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { lasMall, copyUrMall, lasAvSida } from '../gempages.mjs';
import { renderaHtml, mallBilder, somDokument, CSS } from '../html.mjs';
import { lokalisera } from '../forhandsvisning.mjs';

const { mall, platser } = lasMall();
const MOTOR = { url: 'https://baverbutiken.se/products/marin-motorholje-420d-universellt-skydd', kortTitel: 'Motorhölje' };

test('mallBilder läser alla nio bildplatser ur mallen', () => {
  const b = mallBilder(mall, platser);
  assert.deepEqual(Object.keys(b).sort(), Object.keys(platser.bilder).sort());
  assert.match(b.hero.src, /hf_20260217/);
  assert.equal(b.hero.width, 1024);
  assert.match(b.sidfot.src, /Namnlos_design_3/);
});

test('renderaHtml bär varje text, alla åtta knappar och alla bilder ur mallen', () => {
  const copy = copyUrMall(mall, platser);
  const fasta = mallBilder(mall, platser);
  const html = renderaHtml({ copy, produkt: MOTOR, fasta, datum: '2026-08-04' });
  const rader = lasAvSida(mall);
  for (const r of rader) {
    if (r.tag === 'Heading' || r.tag === 'Button') {
      const ren = r.text.replace(/\*\*/g, '').trim();
      if (ren && ren !== 'Title') assert.ok(html.includes(ren.replace(/&/g, '&amp;')), `saknar: ${ren.slice(0, 60)}`);
    }
    if (r.tag === 'Image' && r.src) assert.ok(html.includes(r.src), `saknar bild ${r.src.slice(0, 60)}`);
  }
  assert.equal((html.match(/class="lr-cta"/g) ?? []).length, 8);
  assert.equal((html.match(new RegExp(`href="${MOTOR.url}"`, 'g')) ?? []).length, 8);
  assert.ok(html.includes('Senast uppdaterad 4 augusti 2026.'));
  assert.ok(html.includes('<strong>Sammanfattning:</strong>'));
  assert.ok(html.includes('<strong>oskyddad</strong>'), '**fet** → <strong>');
  assert.equal((html.match(/<section class="lr-punkt/g) ?? []).length, 5);
  assert.equal((html.match(/<section class="lr-punkt lr-omvand"/g) ?? []).length, 2, 'punkt 2 och 4 har bilden till höger');
  assert.ok(!html.includes('undefined') && !html.includes('null"'));
  assert.ok(html.startsWith('<!--') && html.includes('<style>') && html.trim().endsWith('</div>'));
  assert.ok(!/<html|<body/.test(html), 'fragmentet är inget dokument');
});

test('renderaHtml byter bilder per plats och escapar copyn', () => {
  const copy = copyUrMall(mall, platser);
  copy.punkter[0].rubrik = '1. Tuffare <än> & billigare';
  const fasta = mallBilder(mall, platser);
  const bilder = { punkt1: { src: 'https://cdn.shopify.com/x/ny.png', width: 1024, height: 1024 } };
  const html = renderaHtml({ copy, produkt: { url: 'https://baverbutiken.se/products/x', kortTitel: 'X' }, bilder, fasta, datum: '2026-09-16' });
  assert.ok(html.includes('src="https://cdn.shopify.com/x/ny.png" width="1024" height="1024"'));
  assert.ok(!html.includes(fasta.punkt1.src), 'mallens punkt1-bild är bytt');
  assert.ok(html.includes(fasta.punkt2.src), 'övriga platser faller tillbaka på mallen');
  assert.ok(html.includes('1. Tuffare &lt;än&gt; &amp; billigare'));
  assert.throws(() => renderaHtml({ copy, produkt: { url: 'https://x' }, bilder, fasta: {}, datum: '2026-09-16' }), /ingen bild för platsen/);
  const utan = copyUrMall(mall, platser); delete utan.riskfritt.knapp;
  assert.throws(() => renderaHtml({ copy: utan, produkt: MOTOR, fasta, datum: '2026-09-16' }), /riskfritt\.knapp/);
});

test('somDokument och CSS', () => {
  const dok = somDokument('<div class="lr">x</div>', { titel: 'T <1>' });
  assert.ok(dok.startsWith('<!doctype html>') && dok.includes('<title>T &lt;1&gt;</title>') && dok.includes('<div class="lr">x</div>'));
  assert.ok(CSS.includes('.lr-cta{') && CSS.includes('@media (max-width:767px)'));
  assert.ok(!/(^|\n)[a-z.#][^{]*\{/.test(CSS.replace(/\.lr[^{]*\{[^}]*\}/g, '').replace(/@media[^{]*\{/g, '').replace(/\n\}/g, '')), 'all CSS är scopad under .lr');
});

test('lokalisera byter https-bilder och fonter mot lokala filer', async () => {
  const mapp = mkdtempSync(join(tmpdir(), 'lr-fv-'));
  const hamtade = [];
  const hamtaFn = async (url) => {
    hamtade.push(url);
    if (url.includes('fonts.googleapis.com')) return Buffer.from("@font-face{font-family:'Anton';src:url(https://fonts.gstatic.com/s/anton/a.woff2) format('woff2')}");
    return Buffer.from('bild');
  };
  const fragment = `<style>\n@import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');\n.lr{}\n</style><img src="https://cdn.shopify.com/a.png?v=1"><img src="https://cdn.shopify.com/a.png?v=1"><img src="https://cdn.shopify.com/b.jpg">`;
  const ut = await lokalisera(fragment, mapp, { hamtaFn });
  assert.ok(!ut.includes('https://cdn.shopify.com'), 'inga bild-url:er kvar');
  assert.ok(ut.includes("@import url('fonter.css')"));
  assert.equal(hamtade.filter((u) => u.includes('a.png')).length, 1, 'samma bild hämtas en gång');
  assert.ok(existsSync(join(mapp, 'fonter.css')));
  assert.ok(readFileSync(join(mapp, 'fonter.css'), 'utf8').includes('.woff2') && !readFileSync(join(mapp, 'fonter.css'), 'utf8').includes('gstatic'));
});
