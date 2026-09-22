// Bygger SOP-mappen till en samlad handbok + en fil per SOP, som HTML som
// LibreOffice sedan gör .docx och .pdf av.
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { md2html, STIL } from './md2html.mjs';

const SOP = process.env.SOP_MAPP ?? 'kundtjanst/sop';
const UT = process.argv[2] ?? './ut';
mkdirSync(join(UT, 'enskilda'), { recursive: true });

// Läsordningen: kartan först, sedan orsaksfilerna, sedan stödfilerna.
const ORDNING = [
  'README.md', 'START-HERE.md', '00-MASTER.md',
  '10-NOT-RECEIVED.md', '11-UNACCEPTABLE.md', '12-CREDIT-NOT-PROCESSED.md',
  '13-FRAUD-UNRECOGNIZED.md', '14-DUPLICATE-SUBSCRIPTION-OTHER.md',
  '20-NO-CONTACT.md', '30-EMAIL-TEMPLATES.md', '40-EVIDENCE-PACK.md',
  '50-PREVENTION.md', '60-ESCALATION.md', '99-BACKLOG.md',
];
const funna = readdirSync(SOP).filter((f) => f.endsWith('.md'));
const saknade = funna.filter((f) => !ORDNING.includes(f));
if (saknade.length) throw new Error(`Filer utanför läsordningen: ${saknade.join(', ')}`);
for (const f of ORDNING) if (!funna.includes(f)) throw new Error(`${f} saknas i ${SOP}`);

const beslut = readdirSync(join(SOP, 'beslut')).filter((f) => f.endsWith('.md')).sort();

const sida = (titel, kropp) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${titel}</title>${STIL}</head><body>${kropp}</body></html>`;

// En fil per SOP — det VA:n får enskilt.
for (const f of ORDNING) {
  const namn = f.replace(/\.md$/, '');
  writeFileSync(
    join(UT, 'enskilda', `${namn}.html`),
    sida(namn, md2html(readFileSync(join(SOP, f), 'utf8'))),
  );
}

// Den samlade handboken, med innehållsförteckning och sidbrytning per kapitel.
const brytning = '<p style="page-break-before: always;"/>';
const delar = [];
delar.push('<h1>Chargeback SOPs</h1>');
delar.push('<p><b>Bäverbutiken och alla butiker på samma backend.</b> Byggd ur 50 verkliga tvister 2026-09-20. Procedurtexten är identisk på alla butiker — bara <span class="k">{{PLATSHÅLLARNA}}</span> byts, ur butikens brandfil.</p>');
delar.push('<p><i>Källa: <span class="k">kundtjanst/sop/</span> i repot. Ändrar du något här kommer det inte tillbaka till repot av sig själv — säg vad du ändrat, eller be om en ny export efteråt.</i></p>');
delar.push('<h2>Innehåll</h2><ol>');
for (const f of ORDNING) delar.push(`<li>${f.replace(/\.md$/, '')}</li>`);
delar.push(`<li>Bilaga: beslutsblad per order (${beslut.length} st)</li>`);
delar.push('</ol>');

for (const f of ORDNING) {
  delar.push(brytning);
  delar.push(`<h1>${f.replace(/\.md$/, '')}</h1>`);
  delar.push(md2html(readFileSync(join(SOP, f), 'utf8')));
}
delar.push(brytning);
delar.push('<h1>Bilaga — beslutsblad per order</h1>');
delar.push('<p>En färdig dom per öppen tvist, med bevistext att klistra in i Shopify.</p>');
for (const f of beslut) {
  delar.push(`<h2>${f.replace(/\.md$/, '')}</h2>`);
  delar.push(md2html(readFileSync(join(SOP, 'beslut', f), 'utf8')));
}
writeFileSync(join(UT, 'Chargeback-SOP-handboken.html'), sida('Chargeback SOPs', delar.join('\n')));

console.log(`${ORDNING.length} SOP-filer + ${beslut.length} beslutsblad → ${UT}`);
