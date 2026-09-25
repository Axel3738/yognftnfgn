// klaviyo/klubb-sajt.mjs: sajtens anmälningsruta byts till klubben — bara de tre
// värdena, resten av temafilerna (kommentaren överst, formateringen) orörd.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bytNyckel, bytINewsletterBlock, nyaFiler, sajtVarden, sidanBar, FOOTER_FIL, LOCALE_FIL } from '../klubb-sajt.mjs';

const KOMMENTAR = '/*\n * IMPORTANT: The contents of this file are auto-generated.\n */\n';
const FOOTER = `${KOMMENTAR}{
  "name": "t:sections.footer.name",
  "type": "footer",
  "sections": {
    "footer": {
      "type": "footer",
      "settings": {
        "newsletter_enable": true,
        "newsletter_heading": "Missa inga nyheter",
        "enable_follow_on_shop": true
      }
    }
  },
  "order": ["footer"]
}
`;
const LOCALE = `${KOMMENTAR}{
  "general": { "password_page": { "login_form_heading": "Gå in i butiken med lösenord:" } },
  "contact": { "form": { "send": "Skicka" } },
  "newsletter": {
    "label": "E-post",
    "success": "Tack för att du prenumererar",
    "button_label": "Prenumerera"
  },
  "accessibility": { "skip_to_text": "Gå vidare till innehåll" }
}
`;
const VARDEN = { rubrik: 'Gå med i "klubben"', knapp: 'Gå med', bekraftelse: 'Välkommen' };

test('bytNyckel: första förekomsten byts, värdet eskapas som JSON, det gamla värdet kommer tillbaka', () => {
  const r = bytNyckel(FOOTER, 'newsletter_heading', VARDEN.rubrik);
  assert.equal(r.gammal, 'Missa inga nyheter');
  assert.ok(r.text.includes('"newsletter_heading": "Gå med i \\"klubben\\""'));
  assert.ok(r.text.startsWith(KOMMENTAR), 'kommentaren överst står kvar');
  assert.equal(r.text.replace('"Gå med i \\"klubben\\""', '"Missa inga nyheter"'), FOOTER, 'inget annat i filen rörs');
  assert.throws(() => bytNyckel(FOOTER, 'finns_inte', 'x'), /finns inte i filen/);
});

test('bytINewsletterBlock: bara nycklarna i newsletter-blocket byts, tomma värden hoppas', () => {
  const r = bytINewsletterBlock(LOCALE, { button_label: 'Gå med', success: null });
  assert.deepEqual(r.gamla, { button_label: 'Prenumerera' });
  assert.ok(r.text.includes('"button_label": "Gå med"'));
  assert.ok(r.text.includes('"success": "Tack för att du prenumererar"'), 'success rörs inte utan värde');
  assert.ok(r.text.includes('"send": "Skicka"'));
  assert.throws(() => bytINewsletterBlock('{ "contact": {} }', { button_label: 'x' }), /"newsletter"-blocket finns inte/);
});

test('nyaFiler: båda filerna räknas ut, före-värdena rapporteras, och körd två gånger är den stilla', () => {
  const ny = nyaFiler({ [FOOTER_FIL]: FOOTER, [LOCALE_FIL]: LOCALE }, VARDEN);
  assert.deepEqual(ny.fore, { rubrik: 'Missa inga nyheter', knapp: 'Prenumerera', bekraftelse: 'Tack för att du prenumererar' });
  assert.ok(ny.filer[LOCALE_FIL].includes('"success": "Välkommen"'));
  const igen = nyaFiler(ny.filer, VARDEN);
  assert.deepEqual(igen.filer, ny.filer, 'idempotent');
  assert.deepEqual(igen.fore, { rubrik: VARDEN.rubrik, knapp: VARDEN.knapp, bekraftelse: VARDEN.bekraftelse });
});

test('sajtVarden: brandfilen utan klubb.sajt stoppar, med den ger den värdena', () => {
  assert.throws(() => sajtVarden({ klubb: { namn: 'K' } }), /klubb\.sajt/);
  assert.deepEqual(sajtVarden({ klubb: { namn: 'K', sajt: { rubrik: 'R', knapp: 'B' } } }), { rubrik: 'R', knapp: 'B', bekraftelse: null });
});

test('sidanBar: kundens HTML granskas eskapad och oeskapad', () => {
  const html = '<h2 class="footer-block__heading">Gå med i &quot;klubben&quot;</h2><button>Gå med</button>';
  assert.deepEqual(sidanBar(html, VARDEN), { rubrik: true, knapp: true });
  assert.deepEqual(sidanBar('<h2>Missa inga nyheter</h2>', VARDEN), { rubrik: false, knapp: false });
});
