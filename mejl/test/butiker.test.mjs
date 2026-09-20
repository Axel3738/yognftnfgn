// Fraktmejlen för de andra butikerna (bygg-butik.mjs): samma mallar som
// Bäverbutikens, utan erbjudande, på butikens språk, med butikens prefix och
// spårningssida. Inget nätverk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { byggButik, butikIndata, coworkPrompt, FRAKTMALLAR, lasSprak } from '../bygg-butik.mjs';
import { byggMall, sparningsKedja, BAVER_LIQUID } from '../mallar.mjs';
import { allaButiker } from '../../sparning/butik.mjs';
import { bavernummer } from '../../sparning/bavernummer.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ANDRA = allaButiker().filter((b) => !b.standard).map((b) => b.id);
const rakna = (s, re) => (s.match(re) ?? []).length;

test('registret: varje butik utom Bäverbutiken har brandfil, språkfil och support', () => {
  assert.ok(ANDRA.length >= 4, `minst fyra andra butiker, fick ${ANDRA.length}`);
  for (const id of ANDRA) {
    const { reg, brand, sprak } = butikIndata(id);
    assert.ok(brand.farg_rod && brand.farg_svart && brand.farg_ram && brand.font_rubrik, `${id}: färger + typsnitt`);
    assert.ok(brand.logga_url?.startsWith(`${reg.url}/cdn/shop/files/`), `${id}: loggan på butikens egen CDN`);
    assert.equal(sprak.kod, reg.sprak, `${id}: språkfilen matchar registret`);
    assert.ok(reg.support.includes('@'), `${id}: support`);
  }
});

test('språkfilerna: nb/da/fi bär alla ord, tolv månader och copy för de tre mallarna', () => {
  const nycklarSv = Object.keys(lasSprak('nb').ord);
  for (const kod of ['nb', 'da', 'fi']) {
    const s = lasSprak(kod);
    assert.deepEqual(Object.keys(s.ord), nycklarSv, `${kod}: samma ord som nb`);
    assert.equal(s.manader.length, 12, `${kod}: tolv månader`);
    for (const m of FRAKTMALLAR) {
      const c = s.mallar[m];
      assert.ok(c.amne.length >= 1 && c.rubrik && c.intro && c.knapp && c.preheader.length >= 1, `${kod}/${m}: copyn`);
      assert.ok(c.intro.includes('{{ordernummer}}'), `${kod}/${m}: ordernumret i intron`);
    }
    assert.ok(s.mallar.fraktbekraftelse.beraknad.includes('{{leverans_fran}}'), `${kod}: leveransfönstret`);
    assert.ok(s.sidfot.includes('{{support}}'), `${kod}: supportplatsen i sidfoten`);
    assert.ok(s.menyrad, `${kod}: menyraden`);
  }
  const sv = lasSprak('sv');
  assert.equal(sv.mallar, null, 'svenska tar copyn ur copy.json');
});

test('varje butik: tre mallar, balanserad Liquid, eget prefix och egen sida, ingen Bäverbutiken, inget erbjudande', () => {
  for (const id of ANDRA) {
    const b = byggButik(id);
    assert.equal(b.liquid.length, 3);
    const sida = `${b.reg.url}/pages/${b.reg.handle}`;
    for (const m of b.liquid) {
      assert.ok(m.html.startsWith('{% assign fornamn'), `${id}/${m.id}: assign först`);
      assert.equal(rakna(m.html, /\{%\s*if\b/g), rakna(m.html, /\{%\s*endif\b/g), `${id}/${m.id}: if/endif`);
      assert.equal(rakna(m.html, /\{%\s*for\b/g), rakna(m.html, /\{%\s*endfor\b/g), `${id}/${m.id}: for/endfor`);
      assert.equal(rakna(m.html, /\{%\s*case\b/g), rakna(m.html, /\{%\s*endcase\b/g), `${id}/${m.id}: case/endcase`);
      assert.ok(m.html.includes(`${sida}?nummer=${sparningsKedja(b.reg.prefix)}`), `${id}/${m.id}: knappen till butikens sida med butikens prefix`);
      assert.ok(m.html.includes('{% else %}{{ order_status_url }}{% endif %}'), `${id}/${m.id}: reserv utan spårningsnummer`);
      assert.ok(m.html.includes(b.reg.support), `${id}/${m.id}: supportadressen`);
      assert.ok(m.html.includes(b.brand.logga_url), `${id}/${m.id}: loggan`);
      assert.ok(!/baverbutiken|bäverbutiken|TACKIGEN|din-gratisprodukt|kundsupport@/i.test(m.html), `${id}/${m.id}: inget av Bäverbutiken`);
      assert.ok(!m.html.includes('shop_app_tracking_url'), `${id}/${m.id}: ingen Shop-knapp`);
      assert.ok(m.html.includes(`<html lang="${b.sprak.kod}">`), `${id}/${m.id}: lang`);
      for (const tagg of m.html.match(/\{\{[^}]*\}\}|\{%[^%]*%\}/g) ?? []) {
        assert.ok(!tagg.includes('&quot;') && !tagg.includes('"'), `${id}/${m.id}: citattecken i Liquid: ${tagg}`);
      }
      assert.ok(!/\{\{(förnamn|ordernummer|leverans_fran|leverans_till|support)\}\}/.test(m.html), `${id}/${m.id}: platshållare kvar`);
    }
    for (const m of b.exempel) {
      assert.ok(!m.html.includes('{{') && !m.html.includes('{%'), `${id}/${m.id}: Liquid i förhandsvisningen`);
      assert.ok(m.html.includes(bavernummer('UA123456789SE', b.reg.prefix)), `${id}/${m.id}: exempelnumret med butikens prefix`);
    }
    if (b.reg.prefix !== 'BB-') {
      for (const m of b.liquid) assert.ok(!m.html.includes(BAVER_LIQUID), `${id}/${m.id}: inte Bäverbutikens kedja`);
    }
  }
});

test('språket följer butiken: inga svenska fasta ord i nb/da/fi, månaderna i Liquid på butikens språk', () => {
  for (const id of ANDRA) {
    const b = byggButik(id);
    if (b.sprak.kod === 'sv') continue;
    const s = lasSprak(b.sprak.kod);
    const frakt = b.liquid.find((m) => m.id === 'fraktbekraftelse').html;
    for (const [svenskt, oversatt] of Object.entries(s.ord)) {
      if (svenskt !== oversatt) assert.ok(!new RegExp(`>${svenskt}[ :<!]`).test(frakt), `${id}: "${svenskt}" står kvar på svenska`);
      assert.ok(frakt.includes(oversatt.replace(/\.$/, '')), `${id}: "${oversatt}" saknas`);
    }
    assert.ok(frakt.includes(`{% assign lev_fran_man = '${s.manader[8]}' %}`), `${id}: september på butikens språk i Liquid`);
    assert.ok(!frakt.includes("'september' %}") || s.manader[8] === 'september', `${id}: svensk månad kvar`);
    assert.ok(!/Spåra paketet|Paketet är på väg|I paketet|Levereras till/.test(frakt), `${id}: svensk copy kvar`);
  }
});

test('CaraShell: svensk copy ur copy.json, CS-prefix, lugn rubrikstil, vitt sidhuvud', () => {
  const b = byggButik('carashell');
  const frakt = b.liquid.find((m) => m.id === 'fraktbekraftelse').html;
  assert.ok(frakt.includes("prepend: 'CS-'"));
  assert.ok(frakt.includes('https://carashell.se/pages/spara?nummer='));
  assert.ok(frakt.includes('Spåra paketet') && frakt.includes('Beräknad leverans'));
  assert.ok(frakt.includes('hello@carashell.se'));
  // Rubrikstilen (30 px) är gemener och fet; etiketten i leveransrutan är
  // versal av sig själv, så sök på rubrikens egen sträng.
  assert.ok(frakt.includes('font-family: Arial,Helvetica,sans-serif; font-weight: bold; font-size: 30px'), 'fet rubrik i gemener');
  assert.ok(!frakt.includes('text-transform: uppercase; font-size: 30px'), 'ingen versal rubrik');
  assert.ok(frakt.includes('bgcolor="#ffffff" style="padding: 20px 24px 16px; border-bottom'), 'ljust sidhuvud med linje');
  assert.ok(frakt.includes('bgcolor="#1F6F8E"'), 'regnblå knapp');
  assert.equal(b.liquid.find((m) => m.id === 'fraktbekraftelse').amne, 'Ditt paket är på väg');
});

test('Bäverbutikens mallar är orörda av butiksbygget: ingen k.sprak, svart sidhuvud, BB-', () => {
  const konfig = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
  const copy = JSON.parse(readFileSync(join(ROT, 'copy.json'), 'utf8'));
  // Bara fraktuppdateringen behöver inga produkter (inget erbjudande) — den
  // räcker för att se att standardvägen är oförändrad.
  const m = byggMall('fraktuppdatering', { konfig, copy, produkter: null, lage: 'liquid' });
  assert.ok(m.html.includes('<html lang="sv">'));
  assert.ok(m.html.includes(`bgcolor="${konfig.butik.farg_svart}" style="padding: 16px 24px;"`), 'svart sidhuvud utan linje');
  assert.ok(m.html.includes(`font-family: ${konfig.butik.font_rubrik}; text-transform: uppercase; font-size: 30px`), 'Impact i versaler');
  assert.ok(m.html.includes(`https://baverbutiken.se/pages/spara?nummer=${BAVER_LIQUID}`));
  assert.ok(m.html.includes('Ditt paketnummer:') && m.html.includes('>I paketet<') && m.html.includes('Antal: '));
});

test('sparningsKedja vägrar ett prefix som inte följer mönstret', () => {
  assert.equal(sparningsKedja('BB-'), BAVER_LIQUID);
  assert.throws(() => sparningsKedja('bb-'));
  assert.throws(() => sparningsKedja('CS'));
});

test('Cowork-prompten: råfil-länkar på main, teckenantal, ämnesrad, prefix; menysteget bara när menyn inte är klar', () => {
  for (const id of ANDRA) {
    const b = byggButik(id);
    const p = coworkPrompt(b);
    for (const m of b.liquid) {
      assert.ok(p.includes(`/main/mejl/output/butiker/${id}/${m.id}.liquid`), `${id}: länk ${m.id}`);
      assert.ok(p.includes(`\`${m.amne}\``), `${id}: ämnesrad ${m.id}`);
      assert.ok(p.includes(`**${m.html.length.toLocaleString('sv-SE').replace(/ /g, ' ')}**`), `${id}: teckenantal ${m.id}`);
    }
    assert.ok(p.includes(`?nummer=${b.reg.prefix}`), `${id}: prefixet i testmejlskontrollen`);
    assert.ok(p.includes('Windows-dator'), `${id}: rätt dator`);
    assert.ok(!p.includes('Mac. Använd Cmd'));
    if (b.brand.meny_klar) assert.ok(p.includes('Redan gjord'), `${id}: menyn hoppas över`);
    else assert.ok(p.includes(`Namn: \`${b.sprak.menyrad}\``), `${id}: menyraden på butikens språk`);
  }
});

test('Bäverbutikens åtta mallar bygger fortfarande utan k.sprak', () => {
  const konfig = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
  const copy = JSON.parse(readFileSync(join(ROT, 'copy.json'), 'utf8'));
  assert.ok(konfig.erbjudande && !konfig.sprak && !konfig.sparning);
});
