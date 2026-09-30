// Shopifys levererad-notiser: bara de uppräknade meningarna byts, och en
// andra körning ändrar ingenting (mejl/levererad-oversattning.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bytText, lasRattningar } from '../levererad-oversattning.mjs';

test('bytena görs i ordning och en andra körning är redan klar', () => {
  const zh = '{% capture email_body %}您的訂單已取消。追蹤您的貨件。{% endcapture %}';
  const byt = [['您', '你', null], ['你的訂單已取消。', '你的訂單已送達。', 1]];
  const forsta = bytText(zh, byt, 'zh');
  assert.equal(forsta.text, '{% capture email_body %}你的訂單已送達。追蹤你的貨件。{% endcapture %}');
  assert.ok(forsta.andrad);
  const andra = bytText(forsta.text, byt, 'zh');
  assert.equal(andra.andrad, false);
  assert.deepEqual(andra.gjort.map((g) => g.lage), ['redan', 'redan']);
});

test('stoppar när Shopifys text inte är den vi läste', () => {
  assert.throws(() => bytText('Har du ikke fått pakken?', [['motatt', 'mottatt', 1]], 'nb'), /finns inte/);
  assert.throws(() => bytText('a suivi: b suivi:', [['suivi:', 'suivi :', 3]], 'fr'), /2 gånger, väntade 3/);
});

test('Matstrumpors rättningar: den kinesiska "avbruten"-meningen och japanska "skickats" är med', () => {
  const r = lasRattningar('matstrumpor');
  const alla = JSON.stringify(r.rattningar);
  assert.ok(alla.includes('你的訂單已送達。'), 'zh-TW: hel order levererad, inte avbruten');
  assert.ok(alla.includes('ご注文{{ name }}の荷物が配達されました'), 'ja: ämnesraden säger levererat');
  for (const x of r.rattningar) assert.ok(r.mallar[x.mall], `${x.mall} finns i mallar`);
  assert.ok(!r.rattningar.some((x) => x.locale === 'pt-PT'), 'pt-PT:s tilltal är Axels val och rörs inte');
});
