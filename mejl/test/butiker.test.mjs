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
      if (m.sprak) {
        // Flera marknader: EN mall som väljer språk på leveranslandet, varje
        // gren en hel mall med sin egen assign-rad och sitt eget <html lang>.
        assert.ok(m.html.startsWith('{% case shipping_address.country_code %}'), `${id}/${m.id}: case på leveranslandet först`);
        assert.ok(m.html.endsWith('{% endcase %}'), `${id}/${m.id}: endcase sist`);
        for (const kod of m.sprak) assert.ok(m.html.includes(`<html lang="${kod}">`), `${id}/${m.id}: gren för ${kod}`);
        assert.equal(rakna(m.html, /\{% assign fornamn/g), m.sprak.length, `${id}/${m.id}: en assign-rad per språk`);
        for (const rad of b.reg.mejl_marknader) {
          assert.ok(m.html.includes(`{% when ${rad.lander.map((l) => `'${l}'`).join(' or ')} %}`), `${id}/${m.id}: when för ${rad.lander.join('/')}`);
          if (rad.sida) assert.ok(m.html.includes(`${rad.sida}?nummer=`), `${id}/${m.id}: marknadens sida ${rad.sida}`);
        }
        assert.ok(m.amne.startsWith('{% case shipping_address.country_code %}') && m.amne.endsWith('{% endcase %}'), `${id}/${m.id}: ämnesraden väljer språk`);
      } else {
        assert.ok(m.html.startsWith('{% assign fornamn'), `${id}/${m.id}: assign först`);
      }
      assert.equal(rakna(m.html, /\{%\s*if\b/g), rakna(m.html, /\{%\s*endif\b/g), `${id}/${m.id}: if/endif`);
      assert.equal(rakna(m.html, /\{%\s*for\b/g), rakna(m.html, /\{%\s*endfor\b/g), `${id}/${m.id}: for/endfor`);
      assert.equal(rakna(m.html, /\{%\s*case\b/g), rakna(m.html, /\{%\s*endcase\b/g), `${id}/${m.id}: case/endcase`);
      assert.ok(m.html.includes(`${sida}?nummer=${sparningsKedja(b.reg.prefix)}`), `${id}/${m.id}: knappen till butikens sida med butikens prefix`);
      assert.ok(m.html.includes('{% else %}{{ order_status_url }}{% endif %}'), `${id}/${m.id}: reserv utan spårningsnummer`);
      assert.ok(m.html.includes(b.reg.support), `${id}/${m.id}: supportadressen`);
      assert.ok(m.html.includes(b.brand.logga_url), `${id}/${m.id}: loggan`);
      // ⚠️ Mönstret var `kundsupport@` utan domän fram till 2026-09-21 och föll
      // då på Matstrumpor, vars EGEN adress är kundsupport@matstrumpor.se.
      // Varje förekomst i Bäverbutikens copy är kundsupport@baverbutiken.se,
      // så domänen ska stå med — annars stoppar testet en riktig butik.
      assert.ok(!/baverbutiken|bäverbutiken|TACKIGEN|din-gratisprodukt|kundsupport@baverbutiken/i.test(m.html), `${id}/${m.id}: inget av Bäverbutiken`);
      assert.ok(!m.html.includes('shop_app_tracking_url'), `${id}/${m.id}: ingen Shop-knapp`);
      assert.ok(m.html.includes(`<html lang="${b.sprak.kod}">`), `${id}/${m.id}: lang`);
      assert.ok(!/\{\{(förnamn|ordernummer|leverans_fran|leverans_till|support)\}\}/.test(m.amne), `${id}/${m.id}: platshållare i ämnet`);
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
  assert.ok(frakt.includes('hello@carashell.com'), 'avsändaren hello@carashell.com (Axels beslut 2026-09-20)');
  // Rubrikstilen (30 px) är gemener och fet; etiketten i leveransrutan är
  // versal av sig själv, så sök på rubrikens egen sträng.
  assert.ok(frakt.includes('font-family: Arial,Helvetica,sans-serif; font-weight: bold; font-size: 30px'), 'fet rubrik i gemener');
  assert.ok(!frakt.includes('text-transform: uppercase; font-size: 30px'), 'ingen versal rubrik');
  assert.ok(frakt.includes('bgcolor="#ffffff" style="padding: 20px 24px 16px; border-bottom'), 'ljust sidhuvud med linje');
  assert.ok(frakt.includes('bgcolor="#1F6F8E"'), 'regnblå knapp');
  // Fyra språk i samma mall, styrda av leveranslandet; svenska är else-grenen.
  const m1 = b.liquid.find((m) => m.id === 'fraktbekraftelse');
  assert.deepEqual(m1.sprak, ['sv', 'nb', 'en', 'fi']);
  assert.ok(m1.amne.includes("{% when 'NO' %}Pakken din er på vei"));
  assert.ok(m1.amne.includes("{% when 'US' or 'GB' or 'CA' or 'AU' or 'NZ' %}Your parcel is on its way"));
  assert.ok(m1.amne.endsWith('{% else %}Ditt paket är på väg{% endcase %}'));
  assert.ok(frakt.includes('https://carashell.com/pages/spara?nummer=') && frakt.includes('https://carashell.se/nb/pages/spara?nummer='));
  assert.ok(frakt.includes('Track your parcel') && frakt.includes('Spor pakken') && frakt.includes('Seuraa pakettia'));
  assert.ok(b.exempelExtra.length === 9 && b.exempelExtra.every((e) => !e.html.includes('{{')), 'förhandsvisning per språk utan Liquid');
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
      if (m.sprak) assert.ok(p.includes('country_code') && p.includes('.amne.txt'), `${id}: flerspråkig ämnesrad`);
      else assert.ok(p.includes(`\`${m.amne}\``), `${id}: ämnesrad ${m.id}`);
      assert.ok(p.includes(`**${m.html.length.toLocaleString('sv-SE').replace(/ /g, ' ')}**`), `${id}: teckenantal ${m.id}`);
    }
    assert.ok(p.includes(`?nummer=${b.reg.prefix}`), `${id}: prefixet i testmejlskontrollen`);
    assert.ok(p.includes('Windows-dator'), `${id}: rätt dator`);
    assert.ok(!p.includes('Mac. Använd Cmd'));
    if (b.brand.meny_klar) assert.ok(p.includes('Redan gjord'), `${id}: menyn hoppas över`);
    else assert.ok(p.includes(`Namn: \`${b.sprak.menyrad}\``), `${id}: menyraden på butikens språk`);
    if (b.brand.byt_avsandare) assert.ok(p.includes('### 0. Avsändaradressen') && p.includes(b.brand.byt_avsandare), `${id}: avsändarbytet`);
    else assert.ok(!p.includes('### 0. Avsändaradressen'), `${id}: inget avsändarbyte`);
  }
});

test('Bäverbutikens åtta mallar bygger fortfarande utan k.sprak', () => {
  const konfig = JSON.parse(readFileSync(join(ROT, 'konfig.json'), 'utf8'));
  const copy = JSON.parse(readFileSync(join(ROT, 'copy.json'), 'utf8'));
  assert.ok(konfig.erbjudande && !konfig.sprak && !konfig.sparning);
});

// ---------------------------------------------------------------------------
// Matstrumpor på tolv språk (2026-09-29): svenska huvudmallen + elva
// översättningar som registreras i Shopify (mejl/notis-oversattning.mjs).
// ---------------------------------------------------------------------------

const ALLA_SPRAK = ['nb', 'da', 'fi', 'en', 'de', 'fr', 'nl', 'es', 'it', 'pl', 'pt'];

test('språkfilerna: alla elva bär samma nycklar som en.json, tolv månader och sidans knapp', () => {
  const en = lasSprak('en');
  const nycklar = (o) => Object.keys(o).sort();
  for (const kod of ALLA_SPRAK) {
    const s = lasSprak(kod);
    assert.equal(s.kod, kod);
    assert.deepEqual(Object.keys(s.ord), Object.keys(en.ord), `${kod}: samma ord`);
    assert.equal(s.manader.length, 12, `${kod}: tolv månader`);
    for (const m of FRAKTMALLAR) {
      assert.deepEqual(nycklar(s.mallar[m]), nycklar(en.mallar[m]), `${kod}/${m}: samma nycklar som en`);
      assert.equal(s.mallar[m].amne.length, 3, `${kod}/${m}: tre ämnesrader`);
      assert.ok(s.mallar[m].intro.includes('{{ordernummer}}'), `${kod}/${m}: ordernumret`);
    }
    assert.ok(s.sidfot.includes('{{support}}'), `${kod}: support i sidfoten`);
    // Knappen = den knapp spårningssidan hänvisar till ("under knappen …").
    const sida = JSON.parse(readFileSync(join(ROT, '..', 'sparning', 'sprak', `${kod}.json`), 'utf8'));
    const hanvisning = Object.entries(sida.ord).find(([sv]) => sv.startsWith('Paketnumret börjar med'))?.[1] ?? '';
    for (const m of FRAKTMALLAR) assert.ok(hanvisning.includes(s.mallar[m].knapp), `${kod}/${m}: knappen "${s.mallar[m].knapp}" är den sidan hänvisar till`);
    assert.equal(s.ord['Ditt paketnummer'].trim(), sida.mejl.paketnummer, `${kod}: paketnumrets etikett som på sidan`);
    // Inga tankstreck som pratpaus (" – ", " — ") i den copy som syns.
    for (const m of FRAKTMALLAR) {
      const c = s.mallar[m];
      for (const t of [c.rubrik, c.intro, c.tysta_dagar ?? '', ...c.amne, ...c.preheader]) assert.ok(!/\s[–—]\s/.test(t), `${kod}/${m}: tankstreck i "${t}"`);
    }
  }
});

test('Matstrumpor: svensk huvudmall utan leveransfönster, tretton översättningar med sin språkmapp', () => {
  const b = byggButik('matstrumpor');
  assert.equal(b.brand.leveransfonster, false);
  const frakt = b.liquid.find((m) => m.id === 'fraktbekraftelse').html;
  assert.ok(!frakt.includes('Beräknad leverans') && !frakt.includes('lev_fran_datum'), 'inget leveransfönster i mejlet som bär länken (Axel 2026-09-21)');
  assert.ok(frakt.includes('Spårningen visar ofta inget'), 'raden om tyst spårning står kvar');
  assert.ok(!/Sjöhed/i.test(JSON.stringify(b.liquid)), 'gamla adressen');
  assert.deepEqual(b.oversattningar.map((o) => o.locale), ['nb', 'da', 'fi', 'en', 'de', 'fr', 'nl', 'es', 'it', 'pl', 'pt-PT', 'ja', 'zh-TW']);
  // Facit är Shopifys egna rootUrls för matstrumpor.com (webPresences, läst 2026-09-30), inte en
  // regel räknad ur koden: testet räknade förut samma matstrumpor.se/<mapp> som koden, och
  // godkände därmed Taiwans knapp till .se/zh-tw — en sida som inte finns (.se bär zh-TW på /zh).
  const COM = { en: '', 'pt-PT': 'pt-pt/', 'zh-TW': 'zh-tw/' };
  for (const o of b.oversattningar) {
    const mapp = COM[o.locale] ?? `${o.locale}/`;
    assert.equal(o.sida, `https://matstrumpor.com/${mapp}pages/spara`, `${o.locale}: knappen går via .com (Axels regel för allt utland)`);
    for (const m of o.mallar) {
      assert.ok(m.html.startsWith('{% assign fornamn'), `${o.locale}/${m.id}: en hel mall, ingen case`);
      assert.ok(m.html.includes(`<html lang="${o.kod}">`), `${o.locale}/${m.id}: lang`);
      assert.ok(m.html.includes(`${o.sida}?nummer=${sparningsKedja('MS-')}`), `${o.locale}/${m.id}: knappen till språkmappen`);
      assert.ok(!/Beräknad|Estimated delivery|lev_fran_datum/.test(m.html), `${o.locale}/${m.id}: inget leveransfönster`);
      // "Hej" är också danska — bara de andra språken prövas på det ordet.
      assert.ok(!/Spåra paketet|Paketet är på väg|I paketet|Levereras till/.test(m.html), `${o.locale}/${m.id}: svensk text kvar`);
      if (o.kod !== 'da') assert.ok(!m.html.includes('Hej {{ fornamn }}'), `${o.locale}/${m.id}: svensk hälsning kvar`);
      assert.ok(m.html.includes('kundsupport@matstrumpor.se'), `${o.locale}/${m.id}: support`);
      assert.equal(rakna(m.html, /\{%\s*if\b/g), rakna(m.html, /\{%\s*endif\b/g), `${o.locale}/${m.id}: if/endif`);
      assert.ok(!/\{\{(förnamn|ordernummer|leverans_fran|leverans_till|support)\}\}/.test(m.html + m.amne), `${o.locale}/${m.id}: platshållare kvar`);
      for (const tagg of m.html.match(/\{\{[^}]*\}\}|\{%[^%]*%\}/g) ?? []) assert.ok(!tagg.includes('"'), `${o.locale}/${m.id}: citattecken i Liquid`);
    }
  }
  const es = b.oversattningar.find((o) => o.locale === 'es').mallar[0].html;
  assert.ok(es.includes('{% if fornamn != blank %}¡Hola, {{ fornamn }}!{% else %}¡Hola!{% endif %}'), 'spanskans egen hälsning');
});

test('mejl_sprak och mejl_marknader samtidigt stoppar, svenska i mejl_sprak stoppar', async () => {
  const { byggOversattningar } = await import('../bygg-butik.mjs');
  const bas = butikIndata('matstrumpor');
  assert.throws(() => byggOversattningar('matstrumpor', { ...bas, reg: { ...bas.reg, mejl_sprak: [{ locale: 'sv', sprak: 'sv' }] } }), /butikens eget språk/);
  assert.throws(() => byggOversattningar('matstrumpor', { ...bas, reg: { ...bas.reg, mejl_sprak: [{ locale: 'de', sprak: 'de' }, { locale: 'de', sprak: 'de' }] } }), /två gånger/);
});

test('notis-oversattning: läget per språk och spärren mot en främmande huvudmall', async () => {
  const { lageFor, arVarMall, lasFraga, kor, saknadeSprak } = await import('../notis-oversattning.mjs');
  assert.deepEqual(saknadeSprak([{ locale: 'sv', primary: true }, { locale: 'de' }, { locale: 'cs' }], ['de']), ['cs'], 'nytt språk utan fraktmall syns');
  const onskat = { title: 'T', body_html: 'B' };
  assert.equal(lageFor([], onskat), 'saknas');
  assert.equal(lageFor([{ key: 'title', value: 'Shopify' }, { key: 'body_html', value: 'std' }], onskat), 'annan');
  assert.equal(lageFor([{ key: 'title', value: 'T' }, { key: 'body_html', value: 'B', outdated: true }], onskat), 'inaktuell');
  assert.equal(lageFor([{ key: 'title', value: 'T' }, { key: 'body_html', value: 'B', outdated: false }], onskat), 'lika');
  const reg = { prefix: 'MS-', handle: 'spara' };
  assert.ok(arVarMall(`x ${sparningsKedja('MS-')} /pages/spara?nummer= y`, reg));
  assert.ok(!arVarMall('{% assign buyer_email_rtl = false %} Shopifys standard', reg));
  assert.ok(lasFraga(['pt-PT']).includes('l_pt_PT: translations(locale: "pt-PT")'));

  // Mot en låtsasklient: torrt skriver inget, skarpt registrerar och läser tillbaka.
  const b = byggButik('matstrumpor');
  const lager = {};
  const anrop = [];
  const huvud = b.liquid.find((m) => m.id === 'fraktbekraftelse').html;
  const klient = {
    graphql: async (q, v) => {
      anrop.push(q.startsWith('mutation') ? 'mutation' : 'query');
      if (q.startsWith('mutation')) {
        for (const t of v.t) (lager[`${v.id}|${t.locale}`] ??= []).push({ key: t.key, value: t.value, outdated: false });
        return { translationsRegister: { userErrors: [], translations: [] } };
      }
      if (q.includes('shopLocales')) return { shopLocales: [{ locale: 'sv', primary: true }, ...b.oversattningar.map((o) => ({ locale: o.locale }))] };
      const r = { resourceId: v.id, translatableContent: [{ key: 'title', value: 'x', digest: 'd1' }, { key: 'body_html', value: huvud, digest: 'd2' }] };
      for (const o of b.oversattningar) r[`l_${o.locale.replace(/[^a-z0-9]/gi, '_')}`] = lager[`${v.id}|${o.locale}`] ?? [];
      return { translatableResource: r };
    },
  };
  const torr = await kor('matstrumpor', { klient, logg: () => {} });
  assert.ok(!anrop.includes('mutation'), 'torrt skriver inget');
  assert.equal(torr.mallar.fraktbekraftelse.sprak.de.fore, 'saknas');
  const skarp = await kor('matstrumpor', { klient, skarpt: true, logg: () => {} });
  assert.equal(skarp.fel, 0);
  assert.equal(skarp.mallar.fraktbekraftelse.sprak['pt-PT'].efter, 'lika');
  anrop.length = 0;
  const igen = await kor('matstrumpor', { klient, skarpt: true, omInaktuell: true, logg: () => {} });
  assert.ok(!anrop.includes('mutation'), '--om-inaktuell gör inget när allt redan är vårt');
  assert.equal(igen.mallar.ute_for_leverans.registrerade.length, 0);
  const framling = { graphql: async (q, v) => ({ translatableResource: { resourceId: v.id, translatableContent: [{ key: 'title', value: 'x', digest: 'a' }, { key: 'body_html', value: 'Shopifys standard', digest: 'b' }] } }) };
  await assert.rejects(() => kor('matstrumpor', { klient: framling, skarpt: true, logg: () => {} }), /inte vår/);
});

test('loggans länk följer språkets adress: tyskan till matstrumpor.com/de, svenskan kvar på .se (granskningen G-D04)', () => {
  const sv = butikIndata('matstrumpor');
  assert.equal(sv.konfig.butik.url, 'https://matstrumpor.se');
  const de = butikIndata('matstrumpor', { sprakKod: 'de', sida: 'https://matstrumpor.com/de/pages/spara', hemFranSida: true });
  assert.equal(de.konfig.butik.url, 'https://matstrumpor.com/de');
  assert.equal(de.konfig.sparning.sida, 'https://matstrumpor.com/de/pages/spara');
  // En sida som inte är spårningssidan ändrar inte loggans länk.
  assert.equal(butikIndata('matstrumpor', { sprakKod: 'de', sida: 'https://exempel.se/annat', hemFranSida: true }).konfig.butik.url, 'https://matstrumpor.se');
  // CaraShells handinklistrade marknadsgrenar (utan hemFranSida) behåller butikens adress.
  assert.equal(butikIndata('matstrumpor', { sprakKod: 'de', sida: 'https://matstrumpor.com/de/pages/spara' }).konfig.butik.url, 'https://matstrumpor.se');
});
