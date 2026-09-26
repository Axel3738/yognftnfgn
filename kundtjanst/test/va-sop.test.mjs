// Vaktar bryggan tvisthandbok → Notion: att butikens värden faktiskt fylls i,
// att inga {{PLATSHÅLLARE}} läcker ut till VA:n, och att mejlmallarna blir
// kodblock. Utan det sista klappar varje mall ihop till ett stycke och går
// inte att kopiera — och en mall som inte går att kopiera används inte.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fyll, butiksvarden, domanFor, brandFor, HÄR as SOPMAPP } from '../sop/fyll.mjs';
import { upptackBrands } from '../brands.mjs';
import { tillBlock, bytFilnamnMotTitlar, kallText, rentText } from '../va-sop/skriv.mjs';

const KONF = JSON.parse(readFileSync(new URL('../va-sop/notion.json', import.meta.url), 'utf8'));
const TVISTSIDOR = KONF.sidor.filter((s) => s.kalla);

test('butiksvärden: 0 som gräns skrivs ut som betydelse, inte som "0"', () => {
  const v = butiksvarden({ id: 'x', brand: 'X', valuta: 'SEK', tvister: { strid_lonar_sig_over: 0, godkannande_over: 0 } });
  assert.match(v.FIGHT_THRESHOLD, /fight every dispute/);
  assert.match(v.REFUND_APPROVAL_LIMIT, /decide refunds yourself/);
  const med = butiksvarden({ id: 'x', brand: 'X', valuta: 'SEK', tvister: { strid_lonar_sig_over: 200 } });
  assert.equal(med.FIGHT_THRESHOLD, '200 SEK');
});

test('domänen härleds ur spårningssidan, policyn eller mejladressen — aldrig gissad', () => {
  assert.equal(domanFor({ tvister: { sparningssida: 'https://baverbutiken.se/pages/spara' } }), 'baverbutiken.se');
  assert.equal(domanFor({ tvister: { policy_url: 'https://carashell.se/policies/refund-policy' } }), 'carashell.se');
  assert.equal(domanFor({ supportmail: 'kundsupport@matstrumpor.se' }), 'matstrumpor.se');
  assert.equal(domanFor({}), '');
});

test('ett värde som saknas blir en synlig ⚠️ OWNER-rad, aldrig ett tomrum', () => {
  const r = fyll('Descriptor: {{BILLING_DESCRIPTOR}}', { id: 'x', brand: 'X', valuta: 'SEK', tvister: {} });
  assert.match(r.text, /⚠️ OWNER: BILLING_DESCRIPTOR/);
  assert.deepEqual(r.saknade, ['BILLING_DESCRIPTOR']);
  assert.doesNotMatch(r.text, /\{\{/);
});

test('ärendets fält blir tomrum VA:n fyller i', () => {
  const r = fyll('Order {{ORDER_NUMBER}} på {{AMOUNT}} senast {{DATE_PLUS_3}}', brandFor('baverbutiken'));
  assert.match(r.text, /\[ORDER NUMBER\]/);
  assert.match(r.text, /\[AMOUNT\]/);
  assert.match(r.text, /\[today \+ 3 days\]/);
});

test('filnamn byts mot Notion-sidornas titlar — VA:n kan inte öppna en .md-fil', () => {
  const ut = bytFilnamnMotTitlar('Open 10-NOT-RECEIVED.md now', TVISTSIDOR);
  assert.match(ut, /“Dispute reason: product not received”/);
  assert.doesNotMatch(ut, /\.md/);
});

test('varje publicerad tvistsida renderas utan kvarlämnade platshållare', () => {
  assert.ok(TVISTSIDOR.length >= 12, `bara ${TVISTSIDOR.length} tvistsidor i notion.json`);
  for (const s of TVISTSIDOR) {
    const t = kallText(s, KONF.sidor, 'baverbutiken');
    // Kvar får bara metaplatshållarna vara — texten som pratar OM platshållare.
    const kvar = [...t.matchAll(/\{\{([A-Z_0-9]+)\}\}/g)].map((m) => m[1])
      .filter((n) => !['PLACEHOLDER', 'PLACEHOLDERS', 'LIKE_THIS'].includes(n));
    assert.deepEqual([...new Set(kvar)], [], `${s.kalla}: platshållare kvar`);
    assert.match(t, /generated from the dispute handbook/, `${s.kalla}: notisen saknas`);
    // Notisen ska ligga efter H1:an, annars slutar skrivarens självigenkänning
    // fungera och sidan går inte att uppdatera en andra gång.
    assert.match(t, /^#\s+.+\n\n>/, `${s.kalla}: notisen ligger inte direkt under rubriken`);
  }
});

test('mejlmallarna blir kodblock, med radbrytningarna kvar', () => {
  const b = tillBlock('# T\n\n```\nHi [NAME],\n\nLine two.\n```\n\nefter');
  const kod = b.find((x) => x.type === 'code');
  assert.ok(kod, 'inget kodblock');
  const t = kod.code.rich_text.map((x) => x.text.content).join('');
  assert.equal(t, 'Hi [NAME],\n\nLine two.');
  assert.equal(b[b.length - 1].type, 'paragraph');
});

test('kodblockets text är rå — ** och länkar rörs inte', () => {
  const r = rentText('**not bold** https://x.test/a');
  assert.equal(r.map((x) => x.text.content).join(''), '**not bold** https://x.test/a');
  assert.equal(r.length, 1);
});

test('handbokens källfiler bär kvar sina platshållare — portabiliteten är intakt', () => {
  const rå = readFileSync(join(SOPMAPP, '10-NOT-RECEIVED.md'), 'utf8');
  assert.match(rå, /\{\{STORE_ID\}\}/, 'källfilen har blivit ifylld — då är den inte portabel längre');
});

// Adressbytet 2026-09-26: boten och tvisthandboken läser brandfilen, VA:n läser
// Store facts och företags-SOP:en. Byts adressen bara på ena stället säger
// kunden och VA:n olika saker — det här testet gör det omöjligt.
test('Store facts och företags-SOP:en bär samma adress som brandfilerna', () => {
  const fakta = readFileSync(new URL('../va-sop/00-STORE-FACTS.md', import.meta.url), 'utf8');
  const foretagSop = readFileSync(new URL('../va-sop/company-information-requests.md', import.meta.url), 'utf8');
  const brands = upptackBrands();
  const medReturadress = brands.filter((b) => String(b.tvister?.returadress ?? '').trim());
  assert.ok(medReturadress.length > 0, 'inget brand bär en returadress');
  for (const b of medReturadress) {
    // "BOLAG, Gata 1, 123 45 Ort, Land": gata och postort ska stå i Store facts (landet står där på VA:ns språk).
    const [, gata, postort] = b.tvister.returadress.split(/\s*,\s*/);
    assert.ok(fakta.includes(gata) && fakta.includes(postort), `Store facts saknar ${b.id}s returadress (${gata}, ${postort})`);
  }
  for (const b of brands.filter((x) => x.svar?.foretag?.adress)) {
    assert.ok(foretagSop.includes(b.svar.foretag.adress), `company-information-requests.md saknar ${b.id}s företagsadress`);
  }
});
