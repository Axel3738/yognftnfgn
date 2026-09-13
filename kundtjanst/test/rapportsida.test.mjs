// Tester för hemsidan: Markdown-delmängden, datainsamlingen och inbakningen.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { mdTillHtml, sektionsSlug, samlaData, byggSida, inline } from '../rapportsida.mjs';

const SVENSK = `# Kundtjänst Demobutiken — vecka 2026-W37

Period: **2026-09-05 – 2026-09-12** · körd 2026-09-12 · källa: webbmejl

## Siffrorna

| Vad | Denna vecka | Förra |
|---|---|---|
| Ärenden (spam borträknat) | 46 | — |
| **Chargeback-risk** | **🔴 Hög (100/100)** | — |

## Chargeback-varningar

- **Hot om bank:** 2 (24 p)
  - ka***@gmail.com (#5054)
  - an***@outlook.com
- **Aldrig levererad:** 8 (16 p)

## Det här ska VA:n göra, i ordning (på engelska — det är hennes lista)

1. Reply within 24h.
2. Send tracking <b>now</b>.

## Det här är Axels

1. Be VA:n skriva en SOP för **Aldrig levererad** i Notion.
`;

const ENGELSK = `**📬 Demobutiken customer service — week 2026-W37**
Period 2026-09-05 – 2026-09-12 · sources: webmail

**Numbers**
• Tickets: 46 · unanswered now: 36
• **Chargeback risk: 🔴 High (100/100)**

**Top tickets (recurring problems)**
1. Never delivered: 8 (8 unanswered)
   Customers write after three weeks without a parcel.
2. Threatens bank / dispute: 2

**⚠️ Chargeback warning signs**
• Threatens bank: 2 (24 pts)
   ◦ ka***@gmail.com (#5054)

**🔴 ACTION NEEDED <@42>**
1. Reply within 24h.
`;

test('fetstil och kod blir HTML, allt annat escapas', () => {
  assert.equal(inline('**Hot** mot <b> och `kod`'), '<strong>Hot</strong> mot &lt;b&gt; och <code>kod</code>');
});

test('rubrikerna sorteras till rätt avsnitt', () => {
  assert.equal(sektionsSlug('Det här är Axels'), 'axel');
  assert.equal(sektionsSlug('Det här ska VA:n göra, i ordning'), 'va');
  assert.equal(sektionsSlug('🔴 ACTION NEEDED <@42>'), 'action');
  assert.equal(sektionsSlug('⚠️ Kunde inte läsas'), 'varning');
  assert.equal(sektionsSlug('Siffrorna'), 'allman');
});

test('den svenska rapporten: tabell med huvud, nästlade punkter, numrerat, Axels avsnitt', () => {
  const h = mdTillHtml(SVENSK);
  assert.match(h, /<h1>Kundtjänst Demobutiken — vecka 2026-W37<\/h1>/);
  assert.match(h, /<p>Period: <strong>2026-09-05 – 2026-09-12<\/strong> · körd/);
  assert.match(h, /<section data-sektion="allman">\n<h2>Siffrorna<\/h2>\n<div class="tabell"><table><thead><tr><th>Vad<\/th><th>Denna vecka<\/th><th>Förra<\/th><\/tr><\/thead><tbody><tr><td>Ärenden \(spam borträknat\)<\/td><td>46<\/td><td>—<\/td><\/tr>/);
  assert.match(h, /<td><strong>🔴 Hög \(100\/100\)<\/strong><\/td>/);
  assert.match(h, /<ul><li><strong>Hot om bank:<\/strong> 2 \(24 p\)<ul><li>ka\*\*\*@gmail.com \(#5054\)<\/li><li>an\*\*\*@outlook.com<\/li><\/ul><\/li><li><strong>Aldrig levererad:<\/strong> 8 \(16 p\)<\/li><\/ul>/);
  assert.match(h, /<section data-sektion="va">\n<h2>Det här ska VA:n göra[^<]*<\/h2>\n<ol><li>Reply within 24h\.<\/li><li>Send tracking &lt;b&gt;now&lt;\/b&gt;\.<\/li><\/ol>\n<\/section>/);
  assert.match(h, /<section data-sektion="axel">\n<h2>Det här är Axels<\/h2>\n<ol><li>Be VA:n skriva en SOP för <strong>Aldrig levererad<\/strong> i Notion\.<\/li><\/ol>\n<\/section>$/);
  assert.equal((h.match(/<section/g) || []).length, (h.match(/<\/section>/g) || []).length);
});

test('den engelska rapporten: fetstilsrader blir rubriker, • och ◦ blir listor, följdrader hängs på', () => {
  const h = mdTillHtml(ENGELSK);
  assert.match(h, /^<section data-sektion="allman">\n<h2>📬 Demobutiken customer service — week 2026-W37<\/h2>\n<p>Period 2026-09-05/);
  assert.match(h, /<h2>Numbers<\/h2>\n<ul><li>Tickets: 46 · unanswered now: 36<\/li><li><strong>Chargeback risk: 🔴 High \(100\/100\)<\/strong><\/li><\/ul>/);
  assert.match(h, /<ol><li>Never delivered: 8 \(8 unanswered\) Customers write after three weeks without a parcel\.<\/li><li>Threatens bank \/ dispute: 2<\/li><\/ol>/);
  assert.match(h, /<section data-sektion="varning">\n<h2>⚠️ Chargeback warning signs<\/h2>\n<ul><li>Threatens bank: 2 \(24 pts\)<ul><li>ka\*\*\*@gmail.com \(#5054\)<\/li><\/ul><\/li><\/ul>/);
  assert.match(h, /<section data-sektion="action">\n<h2>🔴 ACTION NEEDED &lt;@42&gt;<\/h2>\n<ol><li>Reply within 24h\.<\/li><\/ol>\n<\/section>$/);
});

function tempRepo() {
  const rot = mkdtempSync(join(tmpdir(), 'rapportsida-'));
  const korningar = join(rot, 'korningar');
  const historik = join(rot, 'historik');
  mkdirSync(join(korningar, 'demo'), { recursive: true });
  mkdirSync(join(korningar, '_ranking'), { recursive: true });
  mkdirSync(join(korningar, 'okand'), { recursive: true });
  mkdirSync(historik, { recursive: true });
  writeFileSync(join(korningar, 'demo', '2026-W37.md'), SVENSK);
  writeFileSync(join(korningar, 'demo', '2026-W37.en.md'), ENGELSK);
  writeFileSync(join(korningar, 'demo', 'anteckning.txt'), 'ignoreras');
  writeFileSync(join(korningar, 'okand', '2026-W37.md'), '# Okänd\n');
  writeFileSync(join(korningar, '_ranking', '2026-W37.md'), '# Ranking\n\n| Plats | Brand |\n|---|---|\n| 1 | Demobutiken |\n');
  writeFileSync(join(historik, 'demo.jsonl'), [
    JSON.stringify({ vecka: '2026-W37', riskPoang: 100, antalArenden: 46, larmObesvarade: 36, tvister: null, topp: ['ej_levererad'] }),
    JSON.stringify({ vecka: '2026-W36', riskPoang: 40, antalArenden: 30, larmObesvarade: 10, tvister: 0, topp: ['var_ar_ordern'] }),
    'trasig rad',
  ].join('\n') + '\n');
  return { rot, korningar, historik };
}

test('datan samlas per brand: rapporter, historik i veckoordning, ranking, kategorinamn, okänt brand får sitt id', () => {
  const { korningar, historik } = tempRepo();
  const brands = [{ id: 'demo', brand: 'Demobutiken', trosklar: { obesvarad_timmar: 24 } }];
  const d = samlaData({ korningar, historik, brands, nu: new Date('2026-09-12T20:00:00Z') });
  assert.equal(d.uppdaterad, '2026-09-12T20:00:00.000Z');
  assert.deepEqual(d.veckor, ['2026-W36', '2026-W37']);
  assert.deepEqual(d.brands.map((b) => b.id), ['demo', 'okand']);
  const demo = d.brands[0];
  assert.equal(demo.namn, 'Demobutiken');
  assert.equal(demo.trosklar.obesvarad_timmar, 24);
  assert.deepEqual(demo.historik.map((h) => h.vecka), ['2026-W36', '2026-W37']);
  assert.match(demo.veckor['2026-W37'].sv, /data-sektion="axel"/);
  assert.match(demo.veckor['2026-W37'].en, /ACTION NEEDED/);
  assert.equal(d.brands[1].namn, 'okand');
  assert.equal(d.brands[1].trosklar.obesvarad_timmar, 48);
  assert.match(d.ranking['2026-W37'], /<td>Demobutiken<\/td>/);
  assert.equal(d.kategorier.ej_levererad.sv, 'Aldrig levererad');
  assert.equal(d.kategorier.ej_levererad.en, 'Never delivered');
});

test('tomt repo ger en tom men giltig sida-data', () => {
  const rot = mkdtempSync(join(tmpdir(), 'rapportsida-tom-'));
  const d = samlaData({ korningar: join(rot, 'x'), historik: join(rot, 'y'), brands: [] });
  assert.deepEqual(d.veckor, []);
  assert.deepEqual(d.brands, []);
  assert.deepEqual(d.ranking, {});
});

test('sidan bakas in i mallen och </script> i datan kan inte bryta sidan', () => {
  const rot = mkdtempSync(join(tmpdir(), 'rapportsida-sida-'));
  const mall = join(rot, 'mall.html');
  const ut = join(rot, 'ut.html');
  writeFileSync(mall, '<script>const DATA = __DATA__;</script>');
  byggSida({ mall, ut, data: { veckor: [], brands: [{ id: 'x', veckor: { w: { sv: '<p></script>oj</p>' } } }] } });
  const html = readFileSync(ut, 'utf8');
  assert.ok(html.startsWith('<script>const DATA = {"veckor":[]'));
  assert.ok(!html.includes('</script>oj'), 'avslutstaggen i datan ska vara bruten');
  assert.match(html, /<\\\/script>oj/);
  writeFileSync(mall, '<p>utan platshållare</p>');
  assert.throws(() => byggSida({ mall, ut, data: {} }), /__DATA__/);
});

test('den riktiga mallen har platshållaren, titeln och ingen runtime-capability', () => {
  const mall = readFileSync(new URL('../rapport-sida.html', import.meta.url), 'utf8');
  assert.match(mall, /const DATA = __DATA__;/);
  assert.match(mall, /^<title>Kundtjänstläget<\/title>/);
  assert.ok(!/window\.claude/.test(mall), 'sidan ska funka utan Claude-konto');
});
