// Sidfotens copyright-rad: de rena funktionerna, utan nät. Fixturerna är
// avlästa ur Bäverbutikens publicerade tema 2026-09-27 (sections/footer.liquid
// rad 112 och locales/sv.json rad 442 + 502).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nyLiquid, nyLocale, sidanBar, planera, liquidRad, BUTIKER } from '../sidfot-copyright.mjs';

const TEXT = BUTIKER.baverbutiken.text;

const FOOTER = `    {%- if section.settings.show_copyright -%}
      <p class="footer__small-text">
        &copy; {{ 'now' | date: '%Y' }} {{ shop.name }}
      </p>
    {%- endif -%}
    <p class="footer__small-text">{{ powered_by_link }}</p>

  </div>
</footer>
`;

const LOCALE = `{
  "shopify": {
    "links": {
      "powered_by_shopify": "© 2023 xoxo. Alla rättigheter förbehållna."
    },
    "checkout": {
      "general": {
        "full_price": "Slutsumma:",
        "all_rights_reserved": "© 2023 Hahahhaha. Alla rättigheter förbehållna.",
        "print_policies_link_label": "Skriv ut"
      }
    }
  }
}
`;

test('powered_by_link byts mot Liquid som räknar året, resten av filen står kvar', () => {
  const r = nyLiquid(FOOTER, TEXT);
  assert.equal(r.antal, 1);
  assert.ok(r.text.includes(`<p class="footer__small-text">&copy; {{ 'now' | date: '%Y' }} Bäverbutiken. Alla rättigheter förbehållna.</p>`));
  assert.ok(!r.text.includes('powered_by_link'));
  assert.ok(r.text.includes("{%- if section.settings.show_copyright -%}"), 'raderna runt omkring rörs inte');
  assert.equal(r.text.split('\n').length, FOOTER.split('\n').length);
});

test('en fil utan powered_by_link lämnas orörd (idempotent andra körning)', () => {
  const forsta = nyLiquid(FOOTER, TEXT).text;
  const andra = nyLiquid(forsta, TEXT);
  assert.equal(andra.antal, 0);
  assert.equal(andra.text, forsta);
});

test('två powered_by_link i samma fil stoppar i stället för att gissa', () => {
  assert.throws(() => nyLiquid(FOOTER + '{{ powered_by_link }}', TEXT), /2 gånger/);
});

test('locale: båda strängarna med fast år blir årslösa, formateringen står kvar', () => {
  const r = nyLocale(LOCALE, TEXT);
  assert.deepEqual(r.byten.map((b) => [b.nyckel, b.gammal, b.ny]), [
    ['powered_by_shopify', '© 2023 xoxo. Alla rättigheter förbehållna.', '© Bäverbutiken. Alla rättigheter förbehållna.'],
    ['all_rights_reserved', '© 2023 Hahahhaha. Alla rättigheter förbehållna.', '© Bäverbutiken. Alla rättigheter förbehållna.'],
  ]);
  assert.ok(r.text.includes('"powered_by_shopify": "© Bäverbutiken. Alla rättigheter förbehållna."'));
  assert.ok(r.text.includes('"all_rights_reserved": "© Bäverbutiken. Alla rättigheter förbehållna."'));
  assert.ok(r.text.includes('"full_price": "Slutsumma:"'), 'grannarna rörs inte');
  assert.doesNotThrow(() => JSON.parse(r.text), 'filen är fortfarande giltig JSON');
  assert.ok(!/20\d\d/.test(r.text), 'inget fast år kvar');
});

test('locale: en sträng utan fast år (Shopifys standard) lämnas orörd', () => {
  const std = LOCALE.replace('© 2023 xoxo. Alla rättigheter förbehållna.', 'Drivs med Shopify');
  const r = nyLocale(std, TEXT);
  assert.deepEqual(r.byten.map((b) => b.nyckel), ['all_rights_reserved']);
  assert.ok(r.text.includes('"powered_by_shopify": "Drivs med Shopify"'));
});

test('planera: bara filer som faktiskt ändras skrivs; assets och templates rörs aldrig', () => {
  const filer = {
    'sections/footer.liquid': FOOTER,
    'sections/header.liquid': '<header>{{ shop.name }}</header>',
    'locales/sv.json': LOCALE,
    'locales/en.default.json': '{ "shopify": { "links": { "powered_by_shopify": "Powered by Shopify" } } }',
    'assets/theme.css': null,
  };
  const p = planera(filer, TEXT);
  assert.deepEqual(Object.keys(p.skriv).sort(), ['locales/sv.json', 'sections/footer.liquid']);
  assert.deepEqual(p.liquidFiler, ['sections/footer.liquid']);
  assert.equal(p.localeByten.length, 2);
  assert.equal(p.redanKlart, false);
  const igen = planera({ ...filer, ...p.skriv }, TEXT);
  assert.deepEqual(Object.keys(igen.skriv), []);
  assert.equal(igen.redanKlart, true);
});

test('sidanBar känner igen årsraden både som &copy; och som ©, aldrig fel år', () => {
  assert.equal(sidanBar(`<p class="footer__small-text">&copy; 2026 ${TEXT}</p>`, TEXT, 2026), true);
  assert.equal(sidanBar(`<p class="footer__small-text">© 2026 ${TEXT}</p>`, TEXT, 2026), true);
  assert.equal(sidanBar(`<p class="footer__small-text">© 2023 xoxo. Alla rättigheter förbehållna.</p>`, TEXT, 2026), false);
  assert.equal(sidanBar(`<p>&copy; 2025 ${TEXT}</p>`, TEXT, 2026), false);
});

test('liquidRad bär butikens text och Liquid-året', () => {
  assert.equal(liquidRad('Beverbutikken. Alle rettigheter forbeholdt.'), "&copy; {{ 'now' | date: '%Y' }} Beverbutikken. Alle rettigheter forbeholdt.");
  for (const [id, b] of Object.entries(BUTIKER)) assert.ok(b.text && b.url.startsWith('https://'), id);
});
