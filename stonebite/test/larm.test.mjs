// Pingen till VA:n: reglerna dömer snapshoten utan nät, minnet stoppar
// dubbletter, texten är engelsk och pingar bara de som ska pingas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { hittaLarm, formulera, mottagareFor, kanalFor, rensa, korLarm, lasSkickade, inlagg, REGLER } from '../larm.mjs';

const NU = new Date('2026-09-22T12:00:00Z');
const MECHILE = { id: 'mechile', namn: 'Mechile Delos Santos', roll: 'support_chef', brands: ['*'], discord: { id: '1543617780396593206' } };
const PERSONER = [
  MECHILE,
  { id: 'josh', namn: 'Josh', roll: 'redigerare', brands: [], discord: { id: '111' } },
  { id: 'va2', namn: 'Ana', roll: 'va', brands: ['carashell'], discord: { id: '222' } },
  { id: 'utan', namn: 'Utan Discord', roll: 'va', brands: ['*'] },
];

function kanal(brand, kanal, meddelanden, extra = {}) {
  return { brand, server: brand, serverId: 's1', kanal, kanalId: `k-${brand}-${kanal}`, roll: 'eskalering', lank: `https://discord.com/channels/s1/k-${brand}-${kanal}`, meddelanden, ...extra };
}
const m = (tidSedanTimmar, av, text, { bot = false, avId = null, id = null } = {}) => ({
  id: id ?? `m${tidSedanTimmar}-${av}`, tid: new Date(NU.getTime() - tidSedanTimmar * 3_600_000).toISOString(), av, avId: avId ?? `id-${av}`, bot, text, bilagor: 0,
});

test('mottagarna: support_chef och va med discord.id, för brandet eller "*" — aldrig redigerare', () => {
  assert.deepEqual(mottagareFor(PERSONER, 'baverbutiken').map((p) => p.id), ['mechile']);
  assert.deepEqual(mottagareFor(PERSONER, 'carashell').map((p) => p.id), ['mechile', 'va2']);
  assert.deepEqual(mottagareFor([], 'baverbutiken'), []);
});

test('rader från samma person inom en timme är ETT inlägg — botar räknas bort', () => {
  const ut = inlagg([
    m(5, 'Bävern', 'rapport', { bot: true }),
    m(3, 'Axel', 'For norway:'), m(2.95, 'Axel', 'Password: [dolt]'), m(2.9, 'Axel', 'Login here'),
    m(1, 'Axel', 'Ny fråga två timmar senare'),
    m(0.5, 'Josh', 'Svar'),
  ]);
  assert.deepEqual(ut.map((i) => [i.av, i.rader.length]), [['Axel', 3], ['Axel', 1], ['Josh', 1]]);
  assert.equal(ut[0].rader[0].id, 'm3-Axel', 'inlägget börjar med första raden');
});

test('obesvarat i eskaleringskanalen: kanalens senaste inlägg, två timmar utan svar, pingar EN gång — botar, VA:n själv, färskt och gammalt gör det inte', () => {
  const snapshot = { eskalering: { kanaler: [
    kanal('baverbutiken', 'customer-service', [
      m(80, 'Axel', 'Gammalt'),                                                  // historik
      m(5, 'Bävern', 'Dispute deadlines …', { bot: true }),                      // bot ⇒ räknas inte
      m(4, 'Mechile CS', 'Jag tar #5584 nu', { avId: '1543617780396593206' }),   // VA:n
      m(3, 'Axel', 'Kunden mo***@gmail.com hotar med banken på #6600'),         // Axel efter VA:n ⇒ VA:n är skyldig ett svar
      m(2.9, 'Axel', ''),                                                        // samma inlägg (tom rad med bilaga)
    ]),
    kanal('baverbutiken', 'norway-customer-support', [
      m(6, 'Axel', 'Kan du ta den norska kunden?'),
      m(4, 'Mechile CS', 'Ja, klart', { avId: '1543617780396593206' }),          // senaste inlägget är VA:ns ⇒ inget
    ]),
    kanal('carashell', 'customer-support', [m(1, 'Axel', 'Färskt — bara en timme')]),   // för färskt ⇒ väntar
    kanal('ops', 'customer-support', [m(80, 'Axel', 'Gammalt')]),                         // äldre än 72 h ⇒ historik
    kanal('baverbutiken', 'ads-launching', [m(10, 'Axel', 'annons')], { roll: 'annonser' }), // inte en eskaleringskanal
  ] } };
  const { larm, varningar } = hittaLarm({ snapshot, personer: PERSONER, nu: NU });
  assert.deepEqual(varningar, []);
  assert.equal(larm.length, 1);
  const l = larm[0];
  assert.equal(l.typ, 'eskalering');
  assert.equal(l.kanal, 'customer-service');
  assert.equal(l.timmar, 2, 'räknas från inläggets sista rad');
  assert.equal(l.av, 'Axel');
  assert.equal(l.antal, 2, 'två rader, ett inlägg, en ping');
  assert.match(l.utdrag, /^Kunden mo\*\*\*@gmail\.com/, 'första raden med text');
  assert.equal(l.nyckel, 'eskalering:k-baverbutiken-customer-service:m3-Axel', 'nyckeln är inläggets första rad');
  assert.match(l.lank, /\/m3-Axel$/, 'länken pekar på inläggets första rad');
  assert.deepEqual(l.mottagare.map((p) => p.id), ['mechile']);
});

test('ett svar i ett samtal mellan två andra pingar inte — men samma person som skriver igen gör det', () => {
  const snapshot = { eskalering: { kanaler: [
    kanal('carashell', 'customer-support', [m(5, 'Axel', 'Första'), m(3, 'Axel', 'Ping igen?')]),   // två inlägg, samma person ⇒ senaste pingar
    kanal('baverbutiken', 'problems-no', [m(5, 'Axel', 'Första'), m(3, 'Josh', 'Jag kollar')]),      // Josh svarar Axel ⇒ ett samtal, inget
    kanal('baverbutiken', 'customer-service', [m(40, 'Josh', 'Gammalt ärende'), m(3, 'Axel', 'Ny fråga')]), // 37 h emellan ⇒ ny fråga, pingar
  ] } };
  const { larm } = hittaLarm({ snapshot, personer: PERSONER, nu: NU });
  assert.deepEqual(larm.map((l) => l.kanal).sort(), ['customer-service', 'customer-support']);
  assert.equal(larm.find((l) => l.kanal === 'customer-support').nyckel, 'eskalering:k-carashell-customer-support:m3-Axel', 'det senaste inlägget, inte det första');
});

test('tvister: deadline inom tre dagar eller passerad pingar, i varumärkets eskaleringskanal; utan egen server går det till Bäverbutikens', () => {
  const kanaler = [kanal('baverbutiken', 'customer-service', []), kanal('carashell', 'customer-support', [])];
  const snapshot = { eskalering: { kanaler }, oppnaTvister: [
    { order: '#5584', brand: 'baverbutiken', typ: 'chargeback', belopp: 348, valuta: 'SEK', deadline: '2026-09-23', oppen: true },
    { order: '#5122', brand: 'baverbutiken', typ: 'inquiry', belopp: 348, valuta: 'SEK', deadline: '2026-09-21', oppen: true },   // passerad
    { order: '#5763', brand: 'baverbutiken', typ: 'inquiry', belopp: 100, valuta: 'SEK', deadline: '2026-10-02', oppen: true },   // 10 dagar ⇒ inte än
    { order: '#9001', brand: 'carashell', typ: 'inquiry', belopp: 1129, valuta: 'SEK', deadline: '2026-09-24', oppen: true },
    { order: '#77', brand: 'matstrumpor', typ: 'chargeback', belopp: 462, valuta: 'SEK', deadline: '2026-09-22', oppen: true },   // ingen egen server
    { order: '#1', brand: 'baverbutiken', typ: 'chargeback', belopp: 1, valuta: 'SEK', deadline: '2026-09-22', oppen: false },    // stängd
  ] };
  const { larm, varningar } = hittaLarm({ snapshot, personer: PERSONER, nu: NU });
  assert.deepEqual(varningar, []);
  const per = Object.fromEntries(larm.map((l) => [l.order, l]));
  assert.deepEqual(Object.keys(per).sort(), ['#5122', '#5584', '#77', '#9001']);
  assert.equal(per['#5584'].kvar, 1);
  assert.equal(per['#5122'].kvar, -1);
  assert.equal(per['#9001'].kanal, 'customer-support', 'CaraShells egen kanal');
  assert.equal(per['#77'].kanal, 'customer-service', 'Matstrumpor har ingen server ⇒ Bäverbutikens kanal');
  assert.equal(per['#77'].brand, 'matstrumpor');
  assert.deepEqual(per['#9001'].mottagare.map((p) => p.id), ['mechile', 'va2']);
});

test('två tvister på samma order och deadline är EN ping med båda beloppen (#5053, 2026-09-25)', () => {
  const snapshot = { eskalering: { kanaler: [kanal('baverbutiken', 'customer-service', [])] }, oppnaTvister: [
    { tvistId: 'a', order: '#5053', brand: 'baverbutiken', typ: 'inquiry', belopp: 348, valuta: 'SEK', deadline: '2026-09-24', oppen: true },
    { tvistId: 'b', order: '#5053', brand: 'baverbutiken', typ: 'inquiry', belopp: 255, valuta: 'SEK', deadline: '2026-09-24', oppen: true },
  ] };
  const { larm } = hittaLarm({ snapshot, personer: PERSONER, nu: NU });
  assert.equal(larm.length, 1, 'en ping, inte två med samma nyckel');
  assert.equal(larm[0].belopp, 603);
  assert.equal(larm[0].antalTvister, 2);
  const text = formulera(larm[0]);
  assert.match(text, /2 inquiries on this order, 603 SEK in total/);
  assert.equal((text.match(/#5053/g) ?? []).length, 1);
});

test('minnet stoppar dubbletter — samma tvist och samma rad pingas aldrig två gånger', () => {
  const snapshot = { eskalering: { kanaler: [kanal('baverbutiken', 'customer-service', [m(3, 'Axel', 'Obesvarat')])] },
    oppnaTvister: [{ order: '#5584', brand: 'baverbutiken', typ: 'chargeback', belopp: 348, valuta: 'SEK', deadline: '2026-09-23', oppen: true }] };
  const forsta = hittaLarm({ snapshot, personer: PERSONER, nu: NU }).larm;
  assert.equal(forsta.length, 2);
  const skickade = forsta.map((l) => ({ nyckel: l.nyckel, tid: NU.toISOString() }));
  assert.equal(hittaLarm({ snapshot, skickade, personer: PERSONER, nu: NU }).larm.length, 0);
  // Ny deadline på samma tvist är ett nytt ärende.
  snapshot.oppnaTvister[0].deadline = '2026-09-24';
  assert.equal(hittaLarm({ snapshot, skickade, personer: PERSONER, nu: NU }).larm.length, 1);
  // Och minnet glömmer efter 30 dagar.
  assert.equal(rensa([{ nyckel: 'x', tid: '2026-08-01T00:00:00Z' }, { nyckel: 'y', tid: NU.toISOString() }], { nu: NU }).length, 1);
  assert.equal(REGLER.behallDagar, 30);
});

test('texten är engelsk, pingar bara mottagarna med <@id>, och skiljer chargeback från inquiry', () => {
  const tvist = formulera({ typ: 'tvist', brand: 'baverbutiken', order: '#5584', tvisttyp: 'chargeback', belopp: 348, valuta: 'SEK', deadline: '2026-09-23', kvar: 1, mottagare: [MECHILE] });
  assert.ok(tvist.startsWith('<@1543617780396593206> 🔴 **Chargeback deadline — #5584 (Bäverbutiken)**'), tvist);
  assert.match(tvist, /348 SEK · evidence due 2026-09-23 · 1 day left/);
  assert.match(tvist, /money is lost for good/);
  const inq = formulera({ typ: 'tvist', brand: 'carashell', order: '#9001', tvisttyp: 'inquiry', belopp: 1129, valuta: 'SEK', deadline: '2026-09-21', kvar: -1, mottagare: [MECHILE] });
  assert.match(inq, /🟡 \*\*Bank inquiry deadline/);
  assert.match(inq, /OVERDUE by 1 day\./);
  assert.match(inq, /escalates into a chargeback/);
  const esk = formulera({ typ: 'eskalering', brand: 'baverbutiken', kanal: 'customer-service', timmar: 26, av: 'Axel', antal: 3, utdrag: 'Kunden mo***@gmail.com hotar med banken', lank: 'https://discord.com/channels/1/2/3', mottagare: [MECHILE] });
  assert.match(esk, /^<@1543617780396593206> ⏰ \*\*Unanswered for 26 h in #customer-service\*\* \(Bäverbutiken\) — Axel wrote: "Kunden mo\*\*\*@gmail\.com hotar med banken" \(\+2 more messages\)\./);
  const rawId = formulera({ typ: 'tvist', brand: 'baverbutiken', order: '17587110379869', tvisttyp: 'inquiry', belopp: 1262.2, valuta: 'SEK', deadline: '2026-09-23', kvar: 1, mottagare: [] });
  assert.match(rawId, /Shopify order id 17587110379869/, 'ett internt id kallas för vad det är');
  assert.match(esk, /https:\/\/discord\.com\/channels\/1\/2\/3$/);
  // Våra egna ord är engelska — citatet räknas inte, det är kundens/kollegans.
  const egna = esk.replace(/"[^"]*"/g, '').replace(/Bäverbutiken/g, '');
  assert.ok(!/[åäöÅÄÖ]/.test(egna), egna);
  // Utan mottagare: ingen ping, men texten står ändå.
  assert.ok(formulera({ typ: 'eskalering', brand: 'ops', kanal: 'x', timmar: 2, av: 'A', utdrag: 'b', lank: 'l', mottagare: [] }).startsWith('⏰'));
});

test('korLarm: postar en gång per larm, minns det, och ett fel minns inte (pingas nästa körning)', async () => {
  const rot = mkdtempSync(join(tmpdir(), 'larm-'));
  mkdirSync(join(rot, 'stonebite', 'data'), { recursive: true });
  mkdirSync(join(rot, 'bonus'), { recursive: true });
  writeFileSync(join(rot, 'bonus', 'personer.json'), JSON.stringify({ personer: [MECHILE] }));
  const snapshot = { eskalering: { kanaler: [kanal('baverbutiken', 'customer-service', [m(3, 'Axel', 'Obesvarat')])] },
    oppnaTvister: [{ order: '#5584', brand: 'baverbutiken', typ: 'chargeback', belopp: 348, valuta: 'SEK', deadline: '2026-09-23', oppen: true }] };
  writeFileSync(join(rot, 'stonebite', 'data', 'snapshot.json'), JSON.stringify(snapshot));
  const skick = [];
  const skicka = async (kanalId, text, ids) => {
    skick.push({ kanalId, text, ids });
    if (text.includes('#5584')) throw new Error('Discord 403 på /channels/x/messages');
    return { id: `msg-${skick.length}` };
  };
  try {
    const torr = await korLarm({ rot, nu: NU, torr: true, skicka });
    assert.equal(torr.larm.length, 2);
    assert.equal(skick.length, 0, 'torrt postar inget');
    assert.deepEqual(lasSkickade(rot).skickade, [], 'torrt minns inget');

    const r = await korLarm({ rot, nu: NU, skicka });
    assert.equal(skick.length, 2);
    assert.deepEqual(skick[0].ids, ['1543617780396593206'], 'bara mottagarna får pingas');
    assert.equal(r.larm.filter((x) => x.status === 'skickad').length, 1);
    assert.equal(r.larm.filter((x) => x.status === 'fel').length, 1);
    assert.match(r.varningar.join(' '), /403/);
    const minne = lasSkickade(rot);
    assert.equal(minne.skickade.length, 1, 'bara det som gick iväg minns');
    assert.equal(minne.skickade[0].meddelandeId, 'msg-1');
    assert.ok(JSON.parse(readFileSync(join(rot, 'stonebite', 'data', 'larm.json'), 'utf8')).uppdaterad);

    // Nästa körning: det skickade tystnar, det som föll försöks igen.
    skick.length = 0;
    const igen = await korLarm({ rot, nu: new Date(NU.getTime() + 3_600_000), skicka: async () => ({ id: 'msg-x' }) });
    assert.equal(igen.larm.length, 1);
    assert.equal(igen.larm[0].typ, 'tvist');
    assert.equal(lasSkickade(rot).skickade.length, 2);
  } finally {
    rmSync(rot, { recursive: true, force: true });
  }
});

test('kanalFor: egen eskaleringskanal först, annars Bäverbutikens customer-service, annars någon eskaleringskanal', () => {
  const k = [kanal('carashell', 'customer-support', []), kanal('baverbutiken', 'customer-service', []), kanal('baverbutiken', 'problems-no', [])];
  assert.equal(kanalFor(k, 'carashell').kanal, 'customer-support');
  assert.equal(kanalFor(k, 'matstrumpor').kanal, 'customer-service');
  assert.equal(kanalFor([kanal('ops', 'customer-support', [])], 'matstrumpor').kanal, 'customer-support');
  assert.equal(kanalFor([], 'x'), null);
});
