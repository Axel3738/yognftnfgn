// Betygssidan: fem stjärnor, ett mål, ingen header — och skriptet läser ?s=.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggBetygssida, granskaPublik, recensionKonfig, avpublicera, MALLSUFFIX } from '../recension/betygssida.mjs';

const MAL = 'https://judge.me/product_reviews/abc/new?source=shareable-link';
const brand = {
  id: 'testbutik',
  namn: 'Testbutiken',
  butik_url: 'https://testbutik.se',
  butiksrecension: { judgeme_lank: MAL, valj_knapp: 'Eller skriv en butiksrecension', betygssida: '/pages/betyg', rubrik: 'Hur många stjärnor får butiken bakom lådan?' },
};
const stil = { farg_rod: '#dd821d', farg_svart: '#121212', font_webb: { namn: 'Mochiy Pop P One', css: 'https://fonts.googleapis.com/css2?family=Mochiy+Pop+P+One&display=swap' }, logga_url: 'https://cdn/logga.png' };

test('konfigen kräver en https-länk och en /pages/<handle>-adress', () => {
  assert.equal(recensionKonfig(brand).handle, 'betyg');
  assert.throws(() => recensionKonfig({ butiksrecension: { judgeme_lank: 'http://x' } }), /https/);
  assert.throws(() => recensionKonfig({ butiksrecension: { judgeme_lank: MAL, betygssida: 'betyg' } }), /\/pages\/<handle>/);
});

test('sidan har fem stjärnor som ALLA går till samma formulär (ingen gating), och skriptet läser ?s=1…5', () => {
  const b = byggBetygssida(brand, stil);
  const hrefs = [...b.body.matchAll(/class="betyg-stjarna" href="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(hrefs.length, 5);
  assert.equal(new Set(hrefs).size, 1, 'en destination för alla betyg');
  assert.equal(hrefs[0], MAL);
  assert.ok(b.body.includes(`data-mal="${MAL}"`));
  assert.ok(b.body.includes('/[?&]s=([1-5])(?:&|$)/'), 'skriptet läser s=1…5 ur adressen');
  assert.ok(b.body.includes('window.location.replace(mal)'), 'vidare till målet, samma för alla');
  assert.ok(b.body.includes('prefers-reduced-motion'), 'rörelsen stängs av när kunden bett om det');
  assert.ok(b.body.includes('Hur många stjärnor får butiken bakom lådan?'));
  assert.ok(b.body.includes('Eller skriv en butiksrecension'));
  assert.ok(b.body.includes('Öppnas inget?'), 'synlig reservlänk');
  assert.ok(!/\{\{|\{%/.test(b.body), 'inget mallspråk i sidans innehåll');
  assert.ok(!/[—–]/.test(b.body.replace(/<!--[\s\S]*?-->/, '')), 'inga tankstreck i kundtexten');
});

test('layouten är bar (ingen header/footer/meny), noindex, med content_for_header och butikens font; mallen pekar på layouten', () => {
  const b = byggBetygssida(brand, stil);
  assert.ok(b.layout.includes('{{ content_for_header }}'));
  assert.ok(b.layout.includes('{{ content_for_layout }}'));
  assert.ok(b.layout.includes('name="robots" content="noindex"'));
  assert.ok(b.layout.includes('Mochiy+Pop+P+One'));
  assert.ok(!/section|render 'header'|render 'footer'/i.test(b.layout));
  assert.ok(b.mall.includes(`{% layout '${MALLSUFFIX}' %}`));
  assert.ok(b.mall.includes('{{ page.content }}'));
  assert.equal(b.handle, 'betyg');
});

test('granskningen godkänner en bar sida och stoppar header, temasektioner och gating', () => {
  const b = byggBetygssida(brand, stil);
  const bar = `<!doctype html><html><body class="betyg-sida">${b.body}</body></html>`;
  assert.deepEqual(granskaPublik(bar, { mal: MAL }), { ok: true, fel: [] });
  const medTema = bar.replace('<body class="betyg-sida">', '<body class="betyg-sida"><div id="shopify-section-header"><header><nav></nav></header></div>');
  const g = granskaPublik(medTema, { mal: MAL });
  assert.ok(!g.ok && g.fel.some((f) => f.includes('temasektioner')) && g.fel.some((f) => f.includes('<header>')));
  const gating = bar.replace(`class="betyg-stjarna" href="${MAL}" data-n="1"`, `class="betyg-stjarna" href="https://annat.se/privat" data-n="1"`);
  assert.ok(granskaPublik(gating, { mal: MAL }).fel.some((f) => f.includes('gating')));
  assert.ok(!granskaPublik('<html></html>', { mal: MAL }).ok);
});

// Axel 2026-09-28: mellansidan var inte det han ville ha. Avpubliceringen släcker sidan
// utan att radera något, och gör inget alls när sidan saknas eller redan är släckt.
test('avpublicera släcker sidan med isPublished:false, raderar inget och är idempotent', async () => {
  const anrop = [];
  const fejk = (sida) => ({
    async graphql(q, vars) {
      anrop.push({ q, vars });
      if (q.includes('pages(first')) return { pages: { nodes: sida ? [sida] : [] } };
      if (q.includes('pageUpdate')) {
        assert.deepEqual(vars, { id: sida.id, page: { isPublished: false } });
        return { pageUpdate: { page: { ...sida, isPublished: false }, userErrors: [] } };
      }
      throw new Error(`oväntat anrop: ${q.slice(0, 40)}`);
    },
  });
  const tyst = () => {};
  const live = await avpublicera({ brand, klient: fejk({ id: 'gid://shopify/Page/1', handle: 'betyg', isPublished: true }), logg: tyst });
  assert.deepEqual(live, { fanns: true, redan: false, id: 'gid://shopify/Page/1' });
  assert.ok(anrop.some((a) => a.q.includes('pageUpdate')), 'sidan uppdateras');
  assert.ok(!anrop.some((a) => /pageDelete|themeFilesDelete/.test(a.q)), 'inget raderas');

  const redan = await avpublicera({ brand, klient: fejk({ id: 'gid://shopify/Page/1', handle: 'betyg', isPublished: false }), logg: tyst });
  assert.deepEqual(redan, { fanns: true, redan: true, id: 'gid://shopify/Page/1' });

  const saknas = await avpublicera({ brand, klient: fejk(null), logg: tyst });
  assert.deepEqual(saknas, { fanns: false });
});
