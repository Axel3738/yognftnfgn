// Tester för konceptet /invandningar (2026-09-27): pristabellen (en rad per
// variant, butiken ritar den vid visning), frågedelen, variantpriser i copy-
// granskningen, konceptets engelska suffix, sidmallens [[PRISTABELL]]-byte,
// utsnitten i förhandsvisningen — och nyckelparet i mejl/shopify.mjs som
// stoppade den första skarpa körningen (id från en app, secret från en annan).
// Inga nätanrop.

import test from 'node:test';
import assert from 'node:assert/strict';
import { lasMall, lasKoncept, kandaKoncept, valjPunkter, konceptHandle, granskaCopy, extraTexter, copyUrMall } from '../gempages.mjs';
import { renderaHtml, mallBilder, pristabellHtml, variantLank, CSS } from '../html.mjs';
import { konceptForSprak, PRISTABELL_TOKEN, sprakFor } from '../sprak.mjs';
import { temafiler } from '../butik.mjs';
import { UTSNITT } from '../forhandsvisning.mjs';
import { valjNycklar, kravEnv } from '../../mejl/shopify.mjs';

const { mall, platser } = lasMall();

const VARIANTER = [
  { id: 1, titel: '18 × 10 ft (5.5 × 3 m)', pris: 199, jamforpris: 249 },
  { id: 2, titel: '21 × 10 ft (6.5 × 3 m)', pris: 199, jamforpris: 249 },
  { id: 3, titel: '25 × 10 ft (7.5 × 3 m)', pris: 229, jamforpris: 289 },
  { id: 9, titel: '44 × 10 ft (13.5 × 3 m)', pris: 389, jamforpris: 489 },
];
const PRODUKT = {
  url: 'https://carashell.com/products/takskyddet?country=US', handle: 'takskyddet', kortTitel: 'Roof Cover', slug: 'roof-cover',
  valuta: 'USD', pris: 199, jamforpris: 249, prisText: '$199', jamforprisText: '$249', varianter: VARIANTER, bilder: [],
};
const OPT = { koncept: 'invandningar', punkter: 7, locale: 'en' };

const stycke = (s) => `${s} `.repeat(6).trim(); // ≥ 120 tecken så längdvarningen tiger

function copyEn(n = 7) {
  const punkter = [];
  for (let i = 1; i <= n; i += 1) punkter.push({ rubrik: `${i}. Objection number ${i}`, text: stycke(`An honest answer to objection ${i}.`), knapp: 'See the cover → from $199' });
  return {
    hero: { rubrik: '$199 is for the shortest cover. Here is the price for your length.', ingress: stycke('The same questions come back every day.'), knapp: 'See all nine sizes → from $199', sammanfattning: [stycke('Nine lengths from $199 to $389.'), stycke('Seven answers follow.')] },
    pristabell: { rubrik: 'Your length, your price', text: stycke('All nine are 10 ft wide.'), knapp: 'Open this size →', fot: 'Shorter than 18 ft? Then it is not for you.' },
    punkter,
    fragor: { rubrik: 'The short answers', lista: [{ fraga: 'Is it waterproof?', svar: 'Yes, 210D Oxford.' }, { fraga: 'How fast does it ship?', svar: '5 to 10 business days.' }] },
    lyckas: { rubrik: 'So what do the people who order do?', stycken: [stycke('They measure the body without the hitch.'), stycke('What arrives is black 210D Oxford fabric.')], knapp: 'Pick your length → from $199' },
    arlig: { rubrik: "I'll be honest:", stycken: [stycke('there are three things we still do not know.'), stycke('And the price is $199 for 18 and 21 ft, up to $389 for 44 ft.')] },
    riskfritt: { rubrik: "That's why you can try it risk-free.", text: stycke('You have 90 days to try it.'), knapp: 'Yes, I want one → 90-day guarantee' },
    tre_fragor: [{ rad: 'x', visualisera: '✅', falsifiera: '✅', ingen_annan_kan_saga: '✅' }],
  };
}

const fasta7 = () => { const f = mallBilder(mall, platser); f.punkt6 = f.punkt4; f.punkt7 = f.punkt5; return f; };

test('konceptet invandningar: sju punkter som standard, fem tillåtet, blocken, engelskt suffix och handle', () => {
  assert.ok(kandaKoncept().includes('invandningar'));
  const k = lasKoncept('invandningar');
  assert.deepEqual(k.punkter, [7, 5]);
  assert.deepEqual(k.block, { pristabell: true, fragor: true });
  assert.ok(k.rubrik.pris && !k.jamforpris_behovs);
  assert.equal(valjPunkter('invandningar'), 7);
  assert.equal(valjPunkter('invandningar', 5), 5);
  assert.throws(() => valjPunkter('invandningar', 6), /7 eller 5 punkter/);
  assert.equal(konceptHandle('invandningar', PRODUKT, 7), 'roof-cover-innan-du-koper');
  const en = konceptForSprak(k, 'en');
  assert.equal(en.suffix, 'before-you-buy');
  assert.equal(en.sidtitel, 'Before you buy: {kortTitel}');
  assert.equal(en.forfattare_obrandad, 'Anders from the warehouse');
  assert.equal(konceptHandle(en, PRODUKT, 7), 'roof-cover-before-you-buy', 'marknadens suffix när konceptet är språkversionen');
  assert.equal(konceptForSprak(lasKoncept('lagerrensning'), 'en').suffix, 'lagerrensning', 'utan eget suffix på språket behålls det svenska');
  assert.deepEqual(lasKoncept('lagerrensning').block, {});
});

test('granskaCopy tillåter varje variants pris och jämförpris — och stoppar allt annat', () => {
  const ok = granskaCopy(copyEn(), PRODUKT, platser, OPT);
  assert.deepEqual(ok.fel, [], ok.fel.join('\n'));
  assert.ok(!ok.varningar.some((v) => /nämner inte priset/.test(v)), ok.varningar.join('\n'));
  const variant = copyEn();
  variant.punkter[0].text += ' The 25 ft one is $229 instead of $289.';
  assert.deepEqual(granskaCopy(variant, PRODUKT, platser, OPT).fel, []);
  const fel = copyEn();
  fel.punkter[1].text += ' Only $179 today.';
  const g = granskaCopy(fel, PRODUKT, platser, OPT);
  assert.ok(g.fel.some((f) => /punkt2\.text: priset \$179 finns inte på produktsidan \(tillåtet: \$199 \/ \$229 \/ \$249 \/ \$289 \/ \$389 \/ \$489\)/.test(f)), g.fel.join('\n'));
  // Utan varianter på produkten gäller bara pris + jämförpris — som förut.
  const utan = granskaCopy(copyEn(), { ...PRODUKT, varianter: [] }, platser, OPT);
  assert.ok(utan.fel.some((f) => /arlig\.stycken: priset \$389 finns inte på produktsidan \(tillåtet: \$199 \/ \$249\)/.test(f)), utan.fel.join('\n'));
});

test('granskaCopy granskar pristabellen och frågedelen: form, varianter, butiksnamn, och varnar när konceptet väntar sig dem', () => {
  const utanKnapp = copyEn();
  delete utanKnapp.pristabell.knapp;
  assert.ok(granskaCopy(utanKnapp, PRODUKT, platser, OPT).fel.some((f) => /pristabell\.knapp: saknas/.test(f)));
  const enVariant = granskaCopy(copyEn(), { ...PRODUKT, varianter: [VARIANTER[0]] }, platser, OPT);
  assert.ok(enVariant.fel.some((f) => /pristabell: produktsidan har 1 variant\(er\)/.test(f)), enVariant.fel.join('\n'));
  const utanLista = copyEn();
  utanLista.fragor = { rubrik: 'Questions' };
  assert.ok(granskaCopy(utanLista, PRODUKT, platser, OPT).fel.some((f) => /fragor: ska vara \{ rubrik, lista/.test(f)));
  const tomLista = copyEn();
  tomLista.fragor.lista = [];
  assert.ok(granskaCopy(tomLista, PRODUKT, platser, OPT).fel.some((f) => /fragor\.lista: tom/.test(f)));
  const halvFraga = copyEn();
  halvFraga.fragor.lista.push({ fraga: 'Only a question?' });
  assert.ok(granskaCopy(halvFraga, PRODUKT, platser, OPT).fel.some((f) => /fragor\.3: fråga och svar krävs/.test(f)));
  const butik = copyEn();
  butik.fragor.lista[0].svar = 'Yes, CaraShell says so.';
  const gb = granskaCopy(butik, PRODUKT, platser, OPT);
  assert.ok(gb.fel.some((f) => /fragor\.1\.svar: nämner "källbutiken carashell\.com"/.test(f)), gb.fel.join('\n'));
  const html = copyEn();
  html.pristabell.text = 'All nine are <b>10 ft</b> wide.';
  assert.ok(granskaCopy(html, PRODUKT, platser, OPT).fel.some((f) => /pristabell\.text: innehåller HTML/.test(f)));
  // Konceptet väntar sig blocken — saknas de är det en varning, inte ett fel (copyn kan vara på väg).
  const utanBlock = copyEn();
  delete utanBlock.pristabell;
  delete utanBlock.fragor;
  const g = granskaCopy(utanBlock, PRODUKT, platser, OPT);
  assert.deepEqual(g.fel, []);
  assert.ok(g.varningar.some((v) => /pristabell saknas i copyn — \/invandningar/.test(v)) && g.varningar.some((v) => /fragor saknas i copyn/.test(v)), g.varningar.join('\n'));
  // Blocken är copy-styrda: ett annat koncept får bära dem utan varning, och saknar dem utan varning.
  const lager = granskaCopy(copyEn(5), PRODUKT, platser, { koncept: 'lagerrensning', punkter: 5, locale: 'en' });
  assert.ok(!lager.varningar.some((v) => /pristabell|fragor/.test(v)), lager.varningar.join('\n'));
  assert.equal(extraTexter(copyEn()).length, 4 + 1 + 2 * 2, 'pristabell rubrik/text/knapp/fot + fragor rubrik + fråga och svar per rad');
  assert.deepEqual(extraTexter({ hero: {} }), []);
});

test('renderaHtml: butikens body bär [[PRISTABELL]] + knappord, förhandsvisningen raderna; frågedelen mellan punkterna och slutblocket', () => {
  const copy = copyEn();
  const body = renderaHtml({ copy, produkt: PRODUKT, fasta: fasta7(), datum: '2026-09-27', koncept: 'invandningar', locale: 'en', stil: 'ingen', prisTokens: 'behall' });
  assert.ok(body.includes(PRISTABELL_TOKEN) && !body.includes('class="lr-pris-rad"'), 'butiken ritar raderna, inte motorn');
  assert.ok(body.includes('data-lp-knapp="Open this size →"') && body.includes('data-lp-slutsald="Sold out"'));
  assert.ok(body.includes('<span>Size</span><span>Price</span><span>Regular price</span>'));
  assert.ok(body.includes('data-lp-produkt="takskyddet"'));
  const i = (s) => body.indexOf(s);
  assert.ok(i('<section class="lr-hero"') < i('<section class="lr-pris"') && i('<section class="lr-pris"') < i('id="lr-punkt-1"'), 'tabellen direkt efter hero');
  assert.ok(i('id="lr-punkt-7"') < i('<section class="lr-fragor"') && i('<section class="lr-fragor"') < i('<section class="lr-slut"'), 'frågedelen efter punkterna, före slutblocket');
  assert.equal((body.match(/class="lr-fraga"/g) ?? []).length, 2);
  assert.ok(body.includes('<h3>Is it waterproof?</h3>') && body.includes('<p>5 to 10 business days.</p>'));
  assert.ok(body.includes('<div class="lr-pris-fot"><p>Shorter than 18 ft? Then it is not for you.</p></div>'));

  const fv = renderaHtml({ copy, produkt: PRODUKT, fasta: fasta7(), datum: '2026-09-27', koncept: 'invandningar', locale: 'en', stil: 'inline', prisTokens: 'ersatt' });
  assert.ok(!fv.includes(PRISTABELL_TOKEN));
  assert.equal((fv.match(/class="lr-pris-rad"/g) ?? []).length, VARIANTER.length);
  assert.ok(fv.includes('href="https://carashell.com/products/takskyddet?country=US&amp;variant=3"'));
  assert.ok(fv.includes('<span class="lr-pris-nu">$229</span>') && fv.includes('<span class="lr-pris-forr">$289</span>'));
  assert.ok(fv.includes('<span class="lr-pris-storlek">44 × 10 ft (13.5 × 3 m)</span>'));
  // Svenska ord på en svensk sida.
  const sv = renderaHtml({ copy, produkt: { ...PRODUKT, valuta: 'SEK', url: '/products/takskyddet' }, fasta: fasta7(), datum: '2026-09-27', koncept: 'invandningar', stil: 'ingen' });
  assert.ok(sv.includes('<span>Storlek</span><span>Pris</span><span>Ordinarie pris</span>') && sv.includes('data-lp-slutsald="Slutsåld"'));
  // Utan blocken i copyn ritas inget — de gamla sidorna är orörda.
  const gammal = renderaHtml({ copy: copyUrMall(mall, platser), produkt: { url: '/products/x', kortTitel: 'X' }, fasta: mallBilder(mall, platser), datum: '2026-09-27', stil: 'ingen' });
  assert.ok(!gammal.includes('lr-pris') && !gammal.includes('lr-fragor'), 'stil "ingen" = bara fragmentet, utan CSS:ens klassnamn');
  // Ofullständiga block stoppar.
  const trasig = copyEn();
  trasig.pristabell = { rubrik: 'Table' };
  assert.throws(() => renderaHtml({ copy: trasig, produkt: PRODUKT, fasta: fasta7(), datum: '2026-09-27', koncept: 'invandningar', locale: 'en' }), /pristabell behöver rubrik och knapp/);
});

test('pristabellHtml och variantLank: slutsåld rad, jämförpris bara när det är högre, varianten i länken', () => {
  const html = pristabellHtml({ varianter: [...VARIANTER, { id: 4, titel: '28 × 10 ft', pris: 259, jamforpris: 259 }], url: '/products/takskyddet', knapp: 'Open →', valuta: 'USD', locale: 'en', slut: [3] });
  assert.equal((html.match(/class="lr-pris-rad/g) ?? []).length, 5);
  assert.ok(html.includes('<div class="lr-pris-rad lr-pris-rad--slut">') && html.includes('<span class="lr-pris-knapp lr-pris-knapp--slut">Sold out</span>'));
  assert.ok(!html.includes('variant=3"'), 'ingen länk för en slutsåld variant');
  assert.ok(html.includes('href="/products/takskyddet?variant=1"'));
  assert.ok(html.includes('<span class="lr-pris-nu">$259</span>\n<span class="lr-pris-forr"></span>'), 'jämförpris lika med priset visas inte');
  assert.equal(variantLank('/products/x', 5), '/products/x?variant=5');
  assert.equal(variantLank('https://carashell.com/products/x?country=GB', 5), 'https://carashell.com/products/x?country=GB&variant=5');
  assert.equal(sprakFor('sv').tabell.slutsald, 'Slutsåld');
});

test('sidmallen ritar pristabellen ur data-lp-produkt, layouten släpper inte platsen till meta-beskrivningen, CSS:en är scopad', () => {
  const filer = temafiler();
  const sidmall = filer['templates/page.listicle.liquid'];
  assert.match(sidmall, /contains '\[\[PRISTABELL\]\]'/);
  assert.match(sidmall, /split: 'data-lp-knapp="'/);
  assert.match(sidmall, /split: 'data-lp-slutsald="'/);
  assert.match(sidmall, /for lp_v in lp_produkt\.variants/);
  assert.match(sidmall, /class="lr-pris-rad\{% unless lp_v\.available %\} lr-pris-rad--slut\{% endunless %\}"/);
  assert.match(sidmall, /\?variant=\{\{ lp_v\.id \}\}&amp;country=\{\{ localization\.country\.iso_code \}\}/);
  assert.match(sidmall, /replace: '\[\[PRISTABELL\]\]', lp_tabell/);
  assert.match(sidmall, /replace: '\[\[PRIS\]\]', lp_pris/, 'de gamla prisplatserna byts fortfarande');
  assert.match(filer['layout/listicle.liquid'], /replace: '\[\[PRISTABELL\]\]', ''/);
  assert.ok(filer['assets/listicle.css'].includes('.lr-pris-rad{') && filer['assets/listicle.css'].includes('.lr-fraga{'));
  assert.ok(!/(^|\n)[a-z.#][^{]*\{/.test(CSS.replace(/\.lr[^{]*\{[^}]*\}/g, '').replace(/@media[^{]*\{/g, '').replace(/\n\}/g, '')), 'all CSS är scopad under .lr');
  assert.deepEqual(UTSNITT.map(([namn]) => namn), ['hero', 'pris', 'punkt1', 'punkt2', 'fragor', 'slut', 'sidfot']);
});

test('valjNycklar: id och secret ur SAMMA app — ett halvt _SE_BAVER_SE-par faller tillbaka på _SE-paret', () => {
  const se = { SHOPIFY_SHOP_SE: 'x.myshopify.com', SHOPIFY_CLIENT_ID_SE: 'id-se', SHOPIFY_CLIENT_SECRET_SE: 'hemlig-se' };
  assert.deepEqual(valjNycklar(se), { id: 'id-se', secret: 'hemlig-se', nyApp: false, idNamn: 'SHOPIFY_CLIENT_ID_SE', secretNamn: 'SHOPIFY_CLIENT_SECRET_SE' });
  // Fallet 2026-09-27: id:t till den nya appen fanns, inte dess secret — förut blandades paren och Shopify svarade 400.
  const halvt = { ...se, SHOPIFY_CLIENT_ID_SE_BAVER_SE: 'ny-id' };
  assert.deepEqual(valjNycklar(halvt), valjNycklar(se));
  const bada = { ...halvt, SHOPIFY_CLIENT_SECRET_SE_BAVER_SE: 'ny-hemlig' };
  assert.deepEqual(valjNycklar(bada), { id: 'ny-id', secret: 'ny-hemlig', nyApp: true, idNamn: 'SHOPIFY_CLIENT_ID_SE_BAVER_SE', secretNamn: 'SHOPIFY_CLIENT_SECRET_SE_BAVER_SE' });
  assert.equal(valjNycklar({ SHOPIFY_CLIENT_ID_SE: 'id', SHOPIFY_CLIENT_SECRET_SE_BAVER_SE: 'x' }), null, 'två halva par är inget par');
  assert.throws(() => kravEnv({ SHOPIFY_SHOP_SE: 'x', SHOPIFY_CLIENT_ID_SE_BAVER_SE: 'id' }), /ett HELT par av SHOPIFY_CLIENT_ID_SE_BAVER_SE \+ SHOPIFY_CLIENT_SECRET_SE_BAVER_SE/);
  assert.equal(kravEnv(bada).secretNamn, 'SHOPIFY_CLIENT_SECRET_SE_BAVER_SE');
});

test('pristabell utan jämförpris (svensk sida 2026-09-28): ingen forr-kolumn, attributet till sidmallen, sidmallen hoppar kolumnen', () => {
  const utan = pristabellHtml({ varianter: VARIANTER, url: '/products/takskyddet', knapp: 'Öppna →', valuta: 'SEK', locale: 'sv', jamforpris: false });
  assert.doesNotMatch(utan, /lr-pris-forr/);
  const med = pristabellHtml({ varianter: VARIANTER, url: '/products/takskyddet', knapp: 'Öppna →', valuta: 'SEK', locale: 'sv' });
  assert.match(med, /lr-pris-forr/, 'standard är oförändrad (USA-sidan är fryst)');
  const sida = temafiler()['templates/page.listicle.liquid'];
  assert.match(sida, /data-lp-jmf="nej"/);
  assert.match(sida, /unless lp_utan_jmf/);
  assert.match(CSS, /lr-pris--utan-jmf/);
});
