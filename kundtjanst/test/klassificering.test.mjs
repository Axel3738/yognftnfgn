// Tester för regelklassificeringen. Varje kategori har minst ett exempel
// per språk den ska klara — ändras ordlistan ska det synas här.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { klassificera, hittaOrdernummer, gissaSprak, KATEGORIER, KATEGORI } from '../klassificering.mjs';

const k = (amne, text = '') => klassificera({ amne, text }).kategori;

test('varje kategori har id, svenskt och engelskt namn, vikt och åtgärd', () => {
  for (const kat of KATEGORIER) {
    assert.ok(kat.id && kat.sv && kat.en && kat.atgard_en, kat.id);
    assert.ok(kat.vikt >= 0 && kat.vikt <= 3);
  }
  assert.equal(KATEGORI.chargeback_hot.vikt, 3);
  assert.equal(KATEGORI.produktfraga.vikt, 0);
});

test('svenska kundärenden hamnar rätt', () => {
  assert.equal(k('Var är min order #1042?', 'Har inte fått någon spårning. När kommer paketet?'), 'var_ar_ordern');
  assert.equal(k('Paketet har aldrig kommit', 'Beställde för tre veckor sedan.'), 'ej_levererad');
  assert.equal(k('Produkten kom trasig', 'Locket är sprucket.'), 'skadad_defekt');
  assert.equal(k('Fick fel storlek', 'Beställde L men fick M.'), 'fel_vara');
  assert.equal(k('Vill returnera – ångerrätt', 'Vart skickar jag den?'), 'retur_angerratt');
  assert.equal(k('Pengarna tillbaka', 'Jag vill ha återbetalning.'), 'aterbetalning');
  assert.equal(k('Avbeställ min order', 'Beställde av misstag.'), 'avbestallning');
  assert.equal(k('Ni har dragit pengar två gånger', 'Vill ha den ena tillbaka.'), 'okand_debitering');
  assert.equal(k('Passar den till 60 cm?', 'Funderar på att beställa.'), 'produktfraga');
  assert.equal(k('Rabattkod?', 'Har ni något erbjudande just nu?'), 'rabatt_kod');
  assert.equal(k('Fakturan från Klarna', 'Fick en påminnelse.'), 'faktura_klarna');
  assert.equal(k('Hej', 'Tack för hjälpen!'), 'ovrigt');
});

test('norska, danska och engelska', () => {
  assert.equal(k('Pakken har ikke kommet', 'Sporingen sier levert men jeg har ikke mottatt noe.'), 'ej_levererad');
  assert.equal(k('Hvor er pakken min?', 'Bestilte for en uke siden.'), 'var_ar_ordern');
  assert.equal(k('Vil returnere varen', 'Angrerett.'), 'retur_angerratt');
  assert.equal(k('Forkert vare', 'Jeg fik forkert størrelse.'), 'fel_vara');
  assert.equal(k('Where is my order 1047', 'Could you send tracking?'), 'var_ar_ordern');
  assert.equal(k('Item never arrived', 'Tracking says delivered but I have not received it.'), 'ej_levererad');
  assert.equal(k('Refund please', 'I want my money back.'), 'aterbetalning');
  assert.equal(k('Charged twice', 'You charged my card twice.'), 'okand_debitering');
});

test('hot om bank vinner över allt annat, och eskalering höjer poängen', () => {
  const r = klassificera({ amne: 'Order 1031 - third time writing', text: 'No one answers. If I do not hear back within 48 hours I will contact my bank and dispute the charge.' });
  assert.equal(r.kategori, 'chargeback_hot');
  assert.ok(r.eskalering >= 2, `eskalering ${r.eskalering}`);
  assert.equal(r.poang, 5);
  assert.deepEqual(r.ordernummer, ['1031']);
  assert.equal(k('Var är min order', 'Annars anmäler jag er till ARN.'), 'chargeback_hot');
  assert.equal(k('Retur', 'Jag bestrider köpet via min bank.'), 'chargeback_hot');
});

test('spam döljer aldrig ett kundärende, men fångar ren marknadsföring', () => {
  assert.equal(k('Increase your sales 300% with our SEO services', 'We are a digital agency. Unsubscribe here.'), 'spam');
  assert.equal(k('Paketet har aldrig kommit', 'Skickat från min iPhone. Unsubscribe'), 'ej_levererad');
});

test('"inte fått" utan vara är WISMO, med vara är aldrig levererad', () => {
  assert.equal(k('Order', 'Jag har inte fått någon orderbekräftelse'), 'var_ar_ordern');
  assert.equal(k('Order', 'Jag har inte fått paketet fast det står levererat'), 'ej_levererad');
});

test('ordernummer hittas i de vanliga formerna, aldrig för korta tal', () => {
  assert.deepEqual(hittaOrdernummer('order #1042 och ordernummer: 1043, beställning 1044, ordre 1045, #12'), ['1042', '1043', '1044', '1045']);
  assert.deepEqual(hittaOrdernummer('Order 1031 - third time'), ['1031']);
  assert.deepEqual(hittaOrdernummer('inget nummer här'), []);
});

test('språkgissningen skiljer svenska, norska och engelska', () => {
  assert.equal(gissaSprak('Hej, jag har inte fått min beställning och undrar'), 'sv');
  assert.equal(gissaSprak('Hei, jeg har ikke mottatt pakken min og lurer på noe'), 'no');
  assert.equal(gissaSprak('Hi, I have not received my order and would like to know'), 'en');
  assert.equal(gissaSprak('Hej, jeg har ikke modtaget pakken og vil gerne have noget af det'), 'da');
  assert.equal(gissaSprak('12345'), 'okänt');
});
