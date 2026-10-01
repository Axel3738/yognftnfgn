// enkat/test/enkat.test.mjs — köparenkätens rena funktioner + vakten mot autosvaret.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lasKonfig, byggMall, byggRuta, infogaRuta, tolkaFalt, arEnkat, svarUr, arProblem, arSpam, stryk, svarsId, vecka, aktivaFragor } from '../enkat.mjs';
import { kundUrKontaktformular, arKontaktformular } from '../../kundtjanst/autosvar/kontaktformular.mjs';
import { arSystem } from '../../kundtjanst/arenden.mjs';
import { hinka } from '../../kundtjanst/autosvar/hinkar.mjs';

const k = lasKonfig();

// Shopifys notis så som den kom i Matstrumpors inkorg (uid 1684, 2026-09-26),
// med enkätens fält i stället för Namn/Kommentar.
const NOTIS = [
  'Du har fått ett nytt meddelande från din webbshops',
  'kontaktformulär.',
  '',
  'Landskod:', 'SE', '',
  'E-post:', 'noreply@matstrumpor.se', '',
  'Enkat:', 'ENKAT-v1', '',
  'Kanal:', 'ob', '',
  'Produkt:', 'sushi-strumpor-5-par', '',
  'Fraga 1:', 'Min pappa fyller 60 och älskar sushi.', 'Ville ha något roligt.', '',
  'Fraga 2:', 'Såg en video på Facebook', '',
  'Fraga 3:', 'Till pappa, födelsedag',
].join('\n');

const MEJL = (text, svarTill = 'noreply@matstrumpor.se') => ({
  uid: 1, fran: { namn: 'Matstrumpor.se (Shopify)', adress: 'mailer@shopify.com' },
  svarTill: { namn: '', adress: svarTill }, amne: 'Nytt kundmeddelande den 1 oktober 2026 10.09',
  text, helText: text, messageId: '<x@shopify.com>', autosvar: false, listmejl: false,
});
const BRAND = { id: 'matstrumpor', namn: 'Matstrumpor', supportmail: 'kundsupport@matstrumpor.se', svar: {} };

test('vakten: autosvaret svarar ALDRIG på ett enkätsvar (noreply är systemadress)', () => {
  assert.equal(arSystem(k.noreply), true, `${k.noreply} måste räknas som systemadress`);
  const m = MEJL(NOTIS);
  assert.equal(kundUrKontaktformular(m), m, 'notisen lämnas orörd — ingen kund att svara');
  assert.equal(hinka({ mejl: m, brand: BRAND }).hink, 'SKIP');
});

test('vakten: formulärets e-postfält är noreply, aldrig ett fält kunden fyller i', () => {
  const mall = byggMall(k);
  assert.match(mall, new RegExp(`name="contact\\[email\\]" value="${k.noreply}"`));
  assert.equal((mall.match(/name="contact\[email\]"/g) ?? []).length, 1);
  assert.doesNotMatch(mall, /type="email"/);
  // Inga fält som autosvarets textetikett (Kommentar/Text/Body/Message) — då vore notisen ett kundmejl.
  assert.doesNotMatch(mall, /contact\[(kommentar|text|body|message|meddelande)\]/i);
});

test('mallen: tre frågor, markören, GDPR-raden, ingen belöning och inget butiksnamn', () => {
  const mall = byggMall(k);
  for (const f of k.fragor) assert.ok(mall.includes(`name="contact[${f.falt}]"`));
  assert.ok(mall.includes(`value="${k.version}"`));
  assert.ok(mall.includes('Skriv inga namn och inget om din hälsa'));
  assert.ok(mall.includes('Frågor om din order?'));
  assert.doesNotMatch(mall, /vinn|utlottning|presentkort|rabatt|kredit/i);
  assert.doesNotMatch(mall, /Sjöhed/);
  assert.doesNotMatch(mall.replace(k.noreply, ''), /matstrumpor/i, 'butikens namn står inte i sidan');
});

test('reservfrågan ersätter fråga 2 bara när den är aktiv', () => {
  assert.equal(aktivaFragor(k)[1].text, k.fragor[1].text);
  const med = aktivaFragor({ ...k, reserv: { ...k.reserv, aktiv: true } });
  assert.equal(med[1].text, k.reserv.text);
  assert.equal(med[1].falt, 'Fraga 2');
});

test('rutan i orderbekräftelsen: före sidfoten, en gång, ingen belöning, inget butiksnamn', () => {
  const mall = `<html>\n<table class="row content">x</table>\n\n          <table class="row footer">\n<tr></tr></table>\n</html>`;
  const ny = infogaRuta(mall, k);
  assert.ok(ny.indexOf('ENKAT-v1 köparenkäten') < ny.indexOf('<table class="row footer">'));
  assert.equal(ny.replace(byggRuta(k), '').replace(/\n/g, ''), mall.replace(/\n/g, ''), 'inget annat ändras');
  assert.throws(() => infogaRuta(ny, k), /finns redan/);
  assert.throws(() => infogaRuta('<html></html>', k), /Ankaret/);
  const ruta = byggRuta(k);
  assert.doesNotMatch(ruta, /vinn|utlottning|presentkort|rabatt|kredit|matstrumpor/i);
  assert.match(ruta, /\/pages\/enkat\?k=ob/);
  assert.doesNotMatch(ruta, /customer\.email|\{\{ *email|order_name|\{\{ *name *\}\}/i, 'länken bär aldrig e-post eller ordernummer');
});

test('notisen tolkas: markören, kanal, produkt och svaren', () => {
  assert.equal(arEnkat(NOTIS, k), true);
  assert.equal(arEnkat('Kommentar:\nENKAT-v1 är ett ord i ett kundmejl', k), false);
  const s = svarUr(tolkaFalt(NOTIS), k);
  assert.equal(s.kanal, 'ob');
  assert.equal(s.produkt, 'sushi-strumpor-5-par');
  assert.equal(s.svar.f1, 'Min pappa fyller 60 och älskar sushi.\nVille ha något roligt.');
  assert.equal(s.svar.f3, 'Till pappa, födelsedag');
  assert.equal(s.tomt, false);
  assert.equal(svarUr(tolkaFalt('Enkat:\nENKAT-v1\n\nKanal:\n<script>x</script>'), k).kanal, 'scriptxscript');
});

test('orderärenden stannar hos VA:n, länkar är spam', () => {
  assert.equal(arProblem({ f1: 'Har inte fått paketet än, var är det?' }), true);
  assert.equal(arProblem({ f1: 'Vill returnera' }), true);
  assert.equal(arProblem({ f1: 'Order #1234' }), true);
  assert.equal(arProblem({ f1: 'Pappa älskar sushi', f2: 'Facebook', f3: 'Present till pappa' }), false);
  assert.equal(arSpam({ f1: 'köp billigt https://x.ru' }), true);
  assert.equal(arSpam({ f1: 'Instagram' }), false);
});

test('stryk: butikens namn, domäner, persondata och nummer', () => {
  assert.equal(stryk('Hittade Matstrumpor.se via Matstrumpor-klubben', k), 'Hittade [butiken] via [butiken]');
  assert.equal(stryk('mejla anna.svensson@gmail.com eller 070-123 45 67', k), 'mejla an***@gmail.com eller [telefon]');
  assert.equal(stryk('order 1234 och MS-AB12CD34', k), 'order [nummer] och [nummer]');
});

test('id och vecka: stabilt id, vecka i stället för datum', () => {
  assert.equal(svarsId('<a@b>'), svarsId('<a@b>'));
  assert.equal(svarsId('<a@b>').length, 16);
  assert.equal(vecka(new Date('2026-10-01T10:00:00Z')), '2026-W40');
  assert.equal(vecka(new Date('2027-01-01T10:00:00Z')), '2026-W53');
});

test('notisen utan markör är inte en enkät, och ett kundformulär är fortfarande ett kundformulär', () => {
  const kund = MEJL('Landskod:\nSE\n\nNamn:\nAnna\n\nE-post:\nanna@gmail.com\n\nKommentar:\nVar är min order?', 'anna@gmail.com');
  assert.equal(arEnkat(kund.helText, k), false);
  assert.equal(arKontaktformular(kund), true);
  assert.equal(kundUrKontaktformular(kund).fran.adress, 'anna@gmail.com');
});
