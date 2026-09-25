// klaviyo/mallar.mjs: HTML ur block, i Klaviyo-läge och exempelläge. Inget nät.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { byggMejl, ersattFornamn, lank, erbjudandeVillkor } from '../mallar.mjs';
import { BRAND, PRODUKTER, RECENSIONER, KAMPANJ, FLODE, mejl } from './hjalp.mjs';

const bygg = (m, lage = 'klaviyo', extra = {}) => byggMejl(m, { brand: BRAND, produkter: PRODUKTER, recensioner: RECENSIONER, lage, ...extra });

test('Klaviyo-läget bär avregistrering, inställningar och organisationens adress', () => {
  const { html, text } = bygg(KAMPANJ);
  assert.match(html, /\{% unsubscribe 'Avregistrera dig' %\}/);
  assert.match(html, /\{% manage_preferences 'Ändra dina inställningar' %\}/);
  assert.match(html, /\{\{ organization\.full_address \}\}/);
  assert.match(html, /\{\{ organization\.name \}\}/);
  assert.match(html, /sagt ja till nyhetsbrev från Bäverbutiken/);
  assert.match(text, /\{% unsubscribe_link %\}/);
  assert.match(text, /organization\.full_address/);
});

test('exempelläget har inget mallspråk alls', () => {
  const { html, text } = bygg(KAMPANJ, 'exempel');
  assert.doesNotMatch(html, /\{%|\{\{/);
  assert.doesNotMatch(text, /\{%|\{\{/);
  assert.match(html, /Avregistrera dig/);
});

test('{{fornamn}} blir first_name i Klaviyo-läget och Anna i exempelläget', () => {
  const k = bygg(KAMPANJ).html;
  assert.ok(k.includes("{{ first_name|default:'' }}"));
  assert.ok(!k.includes('{{fornamn}}'));
  const e = bygg(KAMPANJ, 'exempel').html;
  assert.match(e, /Hej Anna,/);
  assert.ok(!e.includes('fornamn'));
});

test('förnamnet tar med mellanslaget bara när namnet finns', () => {
  assert.equal(ersattFornamn('Hej {{fornamn}}, kul', 'klaviyo'), "Hej{% if first_name %} {{ first_name|default:'' }}{% endif %}, kul");
  assert.equal(ersattFornamn('{{fornamn}}, kolla här', 'klaviyo'), "{% if first_name %}{{ first_name|default:'' }}, {% endif %}kolla här");
  assert.equal(ersattFornamn('Hej {{fornamn}}!', 'exempel'), 'Hej Anna!');
});

test('länkspråket: produkt, kollektion, sida, url, utan UTM', () => {
  const ctx = { brand: BRAND, produkt: (h) => PRODUKTER.find((p) => p.handle === h) ?? null, varningar: [] };
  assert.equal(lank('produkt:motorholje-test', ctx), 'https://baverbutiken.se/products/motorholje-test');
  assert.equal(lank('kollektion:alla-produkter', ctx), 'https://baverbutiken.se/collections/alla-produkter');
  assert.equal(lank('sida:/pages/spara', ctx), 'https://baverbutiken.se/pages/spara');
  assert.equal(lank('url:https://example.se/x', ctx), 'https://example.se/x');
  assert.doesNotMatch(bygg(KAMPANJ).html, /utm_/);
});

test('priset kommer ur Shopify-datan, med jämförpriset överstruket', () => {
  const { html } = bygg(KAMPANJ);
  assert.match(html, /299 kr <span[^>]*line-through[^>]*>399 kr<\/span>/);
});

test('citat: riktig recension med namn, annars utgår blocket med varning', () => {
  const med = bygg(KAMPANJ, 'exempel');
  assert.match(med.html, /Satt som en smäck/);
  assert.match(med.html, /Lars P\., verifierad kund/);
  const utan = byggMejl(KAMPANJ, { brand: BRAND, produkter: PRODUKTER, recensioner: {}, lage: 'exempel' });
  assert.doesNotMatch(utan.html, /verifierad kund/);
  assert.ok(utan.varningar.some((v) => /Inga riktiga recensioner/.test(v)));
});

test('fakta-blocket tar texterna ur brandfilen, men aldrig leveranstiden bredvid spårningslänken', () => {
  const { html, text } = bygg(mejl({ block: [{ typ: 'fakta' }] }));
  // Axels order 2026-09-21 och 2026-09-25: spårningssidan visar beräknad leverans själv.
  assert.doesNotMatch(html, /arbetsdagar/);
  assert.doesNotMatch(text ?? '', /arbetsdagar/);
  assert.match(html, /14 dagars ångerrätt/);
  assert.match(html, /https:\/\/baverbutiken\.se\/pages\/spara/);
});

test('dynamiska block är Django-taggar i Klaviyo-läget', () => {
  const e1 = FLODE.steg[1].mejl;
  const { html } = bygg(e1);
  assert.match(html, /\{% for item in event\.extra\.line_items %\}/);
  assert.match(html, /\{\{ item\.product\.title \}\}/);
  assert.match(html, /\{\{ item\.line_price\|floatformat:0 \}\}/);
  assert.match(html, /\{\{ item\.product\.images\.0\.src \}\}/);
  assert.match(html, /\{\{ event\.extra\.responsive_checkout_url \}\}/);
  assert.match(html, /\{% endfor %\}/);
  const e2 = bygg(FLODE.steg[3].mejl).html;
  assert.match(e2, /event\.ProductName/);
  assert.match(e2, /\{\{ event\.ImageURL \}\}/);
  assert.match(e2, /\{\{ event\.URL \}\}/);
  assert.match(e2, /event\.Price/);
});

test('dynamiska block visar två riktiga exempelprodukter i exempelläget', () => {
  const { html } = bygg(FLODE.steg[1].mejl, 'exempel');
  assert.doesNotMatch(html, /event\.|item\./);
  assert.match(html, /Motorhölje för båtmotor/);
  assert.match(html, /Spöhållare 4-pack/);
});

test('erbjudandet: villkoren och koden kommer ur konfigen, copyn är bara ingressen', () => {
  const { html, text } = bygg(mejl({ block: [{ typ: 'erbjudande', text: 'Tack för att du handlade.' }] }));
  assert.match(html, /TACKIGEN/);
  assert.match(html, /minst 299 kr/);
  assert.match(html, /https:\/\/baverbutiken\.se\/pages\/din-gratisprodukt/);
  assert.match(html, /Tack för att du handlade\./);
  assert.match(text, /Din gåvokod: TACKIGEN/);
  const v = erbjudandeVillkor({ minsta_kop_sek: 299, gratis_antal: 1, en_gang_per_kund: true }, 279);
  assert.match(v.kort, /värde upp till 279 kr/);
  assert.match(v.finstilt, /ett snurr per kund/);
});

test('okänd handle ger varning och inget trasigt block', () => {
  const r = bygg(mejl({ block: [{ typ: 'produkt', handle: 'finns-inte' }] }));
  assert.ok(r.varningar.some((v) => /finns-inte/.test(v)));
  assert.doesNotMatch(r.html, /finns-inte/);
});

test('förhandstexten ligger gömd först i body', () => {
  const { html } = bygg(KAMPANJ);
  assert.match(html, /<body[^>]*>\s*<div style="display: none;[^"]*">Vatten i elen/);
});

test('format "rentext": personligt mejl från Axel, ingen hero eller produktkort, samma juridiska sidfot', () => {
  const m = mejl({
    format: 'rentext',
    block: [
      { typ: 'text', text: 'Hej {{fornamn}},\n\nJag heter Axel och driver butiken.' },
      { typ: 'knapp', text: 'Se storsäljarna', lank: 'kollektion:storsaljare' },
      { typ: 'fakta' },
      { typ: 'hero', rubrik: 'SKA INTE SYNAS', bild: 'https://x/y.jpg' },
    ],
  });
  const { html, text, varningar } = bygg(m);
  assert.match(html, /font-family: Arial,Helvetica,sans-serif; font-size: 16px/);
  assert.match(html, /Axel, Bäverbutiken/);
  assert.match(text, /Axel, Bäverbutiken\n\n--/);
  assert.match(html, /\{% unsubscribe 'Avregistrera dig' %\}/);
  assert.match(html, /\{\{ organization\.full_address \}\}/);
  assert.match(text, /\{% unsubscribe_link %\}/);
  assert.doesNotMatch(html, /SKA INTE SYNAS/);
  assert.doesNotMatch(html, /class="kl-knapp"/); // länk, inte röd knapp
  assert.doesNotMatch(html, /<img /); // ingen logga, inga bilder
  assert.match(html, /\/collections\/storsaljare/);
  assert.ok(varningar.some((v) => /hero.*rentext/.test(v)));
  // Vanligt mejl oförändrat: loggraden och den svarta sidfoten finns kvar.
  assert.match(bygg(mejl()).html, /Frågor\? Svara på mejlet/);
});

test('länken sparning: bär kundens paketnummer base64-kodat, och bara ett exempelnummer i exemplet', async () => {
  const { lank } = await import('../mallar.mjs');
  const ctx = (lage) => ({ brand: { butik_url: 'https://baverbutiken.se' }, lage, varningar: [], produkt: () => null });
  const k = lank('sparning:', ctx('klaviyo'));
  assert.ok(k.startsWith('https://baverbutiken.se/pages/spara{% if event.extra.fulfillments.0.tracking_number %}?k={{ event.extra.fulfillments.0.tracking_number|base64_encode|urlencode }}'), k);
  assert.ok(!/["<>&]/.test(k), 'länken får inget tecken som eskapas sönder i href');
  assert.equal(lank('sparning:', ctx('exempel')), 'https://baverbutiken.se/pages/spara?k=WVQyNjI2MTAwNzA4Njc0Njkw');
  assert.equal(Buffer.from('WVQyNjI2MTAwNzA4Njc0Njkw', 'base64').toString(), 'YT2626100708674690');
});

test('stjärnblocket: alla fem stjärnor går till SAMMA ställe (ingen review gating)', async () => {
  const { stjarnLankar } = await import('../mallar.mjs');
  const ctx = { brand: { butik_url: 'https://baverbutiken.se' }, lage: 'exempel', varningar: [], produkt: () => null };
  const l = stjarnLankar({ lank: 'url:https://se.trustpilot.com/evaluate/baverbutiken.se' }, ctx);
  assert.equal(l.length, 5);
  assert.equal(new Set(l.map((x) => x.replace(/[?&]stars=\d$/, ''))).size, 1, 'en destination för alla betyg');
  assert.deepEqual(l.map((x) => x.match(/stars=(\d)$/)[1]), ['1', '2', '3', '4', '5']);
  const html = bygg(mejl({ block: [{ typ: 'stjarnor', lank: 'url:https://se.trustpilot.com/evaluate/baverbutiken.se' }] })).html;
  assert.equal((html.match(/evaluate\/baverbutiken\.se\?stars=/g) ?? []).length, 5);
});
