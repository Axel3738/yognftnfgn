// Shopifys egna notiser: {{ shop.url }} byts mot språkets .com-adress i översättningarna,
// och japanskans "(ending in …)" blir japanska (mejl/notis-lankar.mjs). Inget nätverk.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lasButik } from '../../sparning/butik.mjs';
import { hemAdresser, kontrolleraAdresser, bytShopUrl, rattaSlutsiffror, rattaFyra, fyrorKvar, nyText, kontrolleraEfter, sokShopUrl, delaIBatcher, engelskaRader } from '../notis-lankar.mjs';

const DE = 'https://matstrumpor.com/de';

test('utskriftstaggen byts i alla stavningar, villkoret står kvar', () => {
  const mall = '{% if shop.url %}<a href="{{ shop.url }}">Logga</a> eller <a href="{{shop.url}}">Zu unserem Shop</a>{% endif %}';
  const r = bytShopUrl(mall, DE);
  assert.equal(r.text, `{% if shop.url %}<a href="${DE}">Logga</a> eller <a href="${DE}">Zu unserem Shop</a>{% endif %}`);
  assert.equal(r.lankar, 2);
  assert.equal(r.villkor, 1);
  assert.deepEqual(r.osakra, []);
  // En andra körning ändrar ingenting.
  assert.equal(bytShopUrl(r.text, DE).text, r.text);
  assert.equal(bytShopUrl(r.text, DE).lankar, 0);
});

test('whitespace control: blankstegen tas bort som Liquid hade gjort', () => {
  assert.equal(bytShopUrl('a  \n {{- shop.url -}} \n b', DE).text, `a${DE}b`);
  assert.equal(bytShopUrl('a {{ shop.url -}}   b', DE).text, `a ${DE}b`);
  assert.equal(bytShopUrl('a {{ shop.url }}   {{- shop.url }} b', DE).text, `a ${DE}${DE} b`);
});

test('filterkedjan får adressen som citerad sträng; allt annat är osäkert', () => {
  const f = bytShopUrl('<a href="{{ shop.url | append: \'/account\' }}">', DE);
  assert.equal(f.text, `<a href="{{ "${DE}" | append: '/account' }}">`);
  assert.equal(f.filter, 1);
  assert.deepEqual(f.osakra, []);
  for (const osaker of ['{% assign hem = shop.url %}{{ hem }}', '{% if shop.url contains "se" %}x{% endif %}', '{{ "x" | append: shop.url }}', '{% liquid\n if shop.url\n echo 1\n endif %}', 'text shop.url text']) {
    assert.ok(bytShopUrl(osaker, DE).osakra.length, `osäkert: ${osaker}`);
  }
  assert.throws(() => bytShopUrl('x', 'http://matstrumpor.com/de'), /Ogiltig adress/);
  assert.throws(() => bytShopUrl('x', 'https://matstrumpor.com/de"><script>'), /Ogiltig adress/);
});

test('japanskans betalrad blir japanska, utan talet fyra; kinesiskan får 末碼; andra språk orörda', () => {
  const rad = '{% capture transaction_name %}{{ transaction.payment_details.credit_card_company }} (ending in {{ transaction.payment_details.credit_card_last_four_digits }}){% endcapture %}';
  const ja = rattaSlutsiffror(rad, 'ja');
  assert.equal(ja.text, '{% capture transaction_name %}{{ transaction.payment_details.credit_card_company }}（末尾 {{ transaction.payment_details.credit_card_last_four_digits }}）{% endcapture %}');
  assert.equal(ja.antal, 1);
  assert.equal(rattaSlutsiffror(ja.text, 'ja').antal, 0, 'en andra körning gör ingenting');
  const zh = rattaSlutsiffror(rad.replace('ending in', 'ending with'), 'zh-TW');
  assert.ok(zh.text.includes('}}（末碼 {{ transaction.payment_details.credit_card_last_four_digits }}）'));
  for (const t of [ja.text, zh.text]) {
    const kundtext = t.replace(/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/g, '');
    assert.ok(!/[4四４]/.test(kundtext), `talet fyra i kundtexten: ${kundtext}`);
  }
  assert.equal(rattaSlutsiffror(rad, 'en').text, rad);
  assert.equal(rattaSlutsiffror(rad, 'de').antal, 0);
});

test('nyText + kontrolleraEfter: länk och betalrad i samma översättning, inget kvar efteråt', () => {
  const ja = '<a href="{{shop.url}}">ショップ</a>{% if shop.url %}{{ c }} (ending in {{ d }}){% endif %}';
  const r = nyText(ja, 'ja', 'https://matstrumpor.com/ja');
  assert.ok(r.andrad);
  assert.equal(r.lankar, 1);
  assert.equal(r.slutsiffror, 1);
  assert.deepEqual(kontrolleraEfter(r.text, 'ja'), []);
  assert.ok(kontrolleraEfter(ja, 'ja').length >= 2, 'före bytet: shop.url och "ending in" kvar');
  assert.equal(sokShopUrl(r.text).villkor, 1);
});

test('Matstrumpors adresser: tretton språk på matstrumpor.com, engelskan i roten, aldrig .se', () => {
  const a = hemAdresser(lasButik('matstrumpor'));
  assert.equal(Object.keys(a).length, 13);
  assert.equal(a.en, 'https://matstrumpor.com');
  assert.equal(a['zh-TW'], 'https://matstrumpor.com/zh-tw');
  assert.equal(a['pt-PT'], 'https://matstrumpor.com/pt-pt');
  assert.equal(a.de, DE);
  for (const [l, u] of Object.entries(a)) {
    assert.match(u, /^https:\/\/matstrumpor\.com(\/[a-z-]+)?$/, `${l}: ${u}`);
    assert.ok(!u.includes('?'), `${l}: ingen ?country=`);
  }
});

test('kontrolleraAdresser: stoppar huvuddomänen och adresser som inte är Shopifys rootUrls', () => {
  const narvaro = [{ domain: { host: 'matstrumpor.com' }, rootUrls: [{ locale: 'en', url: 'https://matstrumpor.com/' }, { locale: 'de', url: 'https://matstrumpor.com/de/' }] }];
  assert.deepEqual(kontrolleraAdresser({ en: 'https://matstrumpor.com', de: DE }, 'https://matstrumpor.se', narvaro), []);
  assert.ok(kontrolleraAdresser({ de: 'https://matstrumpor.com/tyska' }, 'https://matstrumpor.se', narvaro).some((f) => /rootUrl/.test(f)));
  assert.ok(kontrolleraAdresser({ de: 'https://matstrumpor.se/de' }, 'https://matstrumpor.se', narvaro).some((f) => /huvuddomänen/.test(f)));
  assert.ok(kontrolleraAdresser({ ja: 'https://matstrumpor.com/ja' }, 'https://matstrumpor.se', narvaro).some((f) => /bär inte språket/.test(f)));
});

test('delaIBatcher håller taket på tecken och antal', () => {
  const lista = [300, 100, 100, 250, 10].map((n, i) => ({ locale: `l${i}`, value: 'x'.repeat(n) }));
  const b = delaIBatcher(lista, { maxTecken: 300, maxAntal: 2 });
  assert.deepEqual(b.map((x) => x.map((y) => y.locale)), [['l0'], ['l1', 'l2'], ['l3', 'l4']]);
});

test('kortraden utan talet fyra: ja 下4桁 → 末尾 i alla fyra meningarna, zh-TW 末四碼 → 末碼, Liquid orört', () => {
  const RTL = '{% if buyer_email_rtl == true %}<span dir="ltr">{% endif %}';
  const SLUT = '{% if buyer_email_rtl == true %}</span>{% endif %}';
  const ja = [
    `ギフトカード (下4桁が${RTL}{{ transaction.payment_details.gift_card_last_four_digits }}${SLUT})`,
    `{{ c }} (カード番号下4桁: ${RTL}{{ transaction.payment_details.credit_card_last_four_digits }}${SLUT})`,
    `<img src="{{ x }}" height="24"> <span>下4桁${RTL}{{ transaction.payment_details.credit_card_last_four_digits }}${SLUT}</span>`,
    `{{ instrument.credit_card_company }} 下4桁${RTL}{{ instrument.credit_card_last_four_digits }}${SLUT}`,
    '{% if kod == "下4桁" %}orört{% endif %}',
  ].join('\n');
  const r = rattaFyra(ja, 'ja');
  assert.equal(r.antal, 4);
  assert.deepEqual(r.text.split('\n').map((x) => x.replace(/\{%[\s\S]*?%\}|\{\{[\s\S]*?\}\}|<[^>]+>/g, '')), ['ギフトカード (末尾 )', ' (カード番号末尾: )', ' 末尾 ', ' 末尾 ', 'orört']);
  assert.ok(r.text.includes('{% if kod == "下4桁" %}'), 'en Liquid-tagg rörs aldrig');
  assert.deepEqual(fyrorKvar(r.text), [], 'ingen fyra kvar i kundtexten');
  assert.equal(rattaFyra(r.text, 'ja').antal, 0, 'en andra körning gör ingenting');

  const zh = `{{ c }} (末四碼：${RTL}{{ d }}${SLUT})\n我們正在處理您的訂單，但無法從末四碼為 ${RTL}{{ failed_payment_last4 }}${SLUT} 的卡片收取`;
  const z = rattaFyra(zh, 'zh-TW');
  assert.equal(z.antal, 2);
  assert.ok(z.text.includes('(末碼：') && z.text.includes('無法從末碼為 '));
  assert.deepEqual(fyrorKvar(z.text), []);
  assert.deepEqual(kontrolleraEfter(z.text, 'zh-TW'), []);
  assert.ok(kontrolleraEfter(zh, 'zh-TW').some((f) => f.includes('末四碼')));
  assert.equal(rattaFyra(ja, 'de').text, ja, 'andra språk orörda');
  // Talet fyra som inte gäller kortet listas men byts inte.
  assert.deepEqual(fyrorKvar('<p>4 日以内</p><td style="width:4px">x</td>{{ 4 }}'), ['4 日以内']);
});

test('engelskaRader hittar engelska kvar i en japansk mall men inte varumärken', () => {
  const rader = engelskaRader('<td>Pickup location</td><td>Shop Pay</td><td>{{ x }} 合計</td>{% if a %}Tip{% endif %}');
  assert.deepEqual(rader, ['Pickup location', 'Tip']);
});
