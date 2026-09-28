// Tester för pipeline/sprak.mjs — språket per marknad och språkkollen på SRT-text.
// Ren logik, inga nätanrop. Texterna nedan är HeyGens riktiga caption-rader
// ur CaraShell US-runda 7 (2026-09-20) och Norge-rundorna.

import test from 'node:test';
import assert from 'node:assert/strict';
import { HEYGEN_SPRAK_PER_MARKNAD, heygenSprakFor, sprakfamilj, srtText, gissaSprak, kollaSprak, sprakUrHeygenId } from '../sprak.mjs';

const ENGELSK_SRT = `1
00:00:00,100 --> 00:00:01,920
One person, that's all it takes.

2
00:00:01,920 --> 00:00:03,500
No help needed for the roof.

3
00:00:03,700 --> 00:00:08,560
Just the roof, not the whole trailer to wrestle alone, straps down with a drawcord at the edge.

4
00:00:09,460 --> 00:00:10,480
No one else needed. One hundred ninety-nine dollars.
`;

const NORSK = 'Bare taket, ikke hele vognen. En person er nok, og du trenger ingen hjelp. Stroppen og snoren holder det på plass når det blåser. Det er alt du trenger.';
const SVENSK = 'Bara taket, inte hela vagnen. En person räcker, och du behöver ingen hjälp. Remmen och dragskon håller det på plats när det blåser. Det är allt du behöver.';
const DANSK = 'Kun taget, ikke hele vognen. Én person er nok, og du har ikke brug for hjælp. Stroppen og snoren holder det på plads, når det blæser. Det er alt hvad du behøver.';

test('heygenSprakFor: tabellen ger marknadens språk, okänd kod ger null — aldrig ett tyst standardvärde', () => {
  assert.equal(heygenSprakFor('US'), 'English (United States)');
  assert.equal(heygenSprakFor('no'), 'Norwegian Bokmål (Norway)');
  assert.equal(heygenSprakFor('DK'), 'Danish (Denmark)');
  assert.equal(heygenSprakFor('UK'), 'English (UK)');
  assert.equal(heygenSprakFor('XX'), null);
  assert.equal(heygenSprakFor(''), null);
  assert.equal(Object.isFrozen(HEYGEN_SPRAK_PER_MARKNAD), true);
});

test('sprakfamilj: HeyGen-namn → familj', () => {
  assert.equal(sprakfamilj('English (United States)'), 'en');
  assert.equal(sprakfamilj('Norwegian Bokmål (Norway)'), 'nb');
  assert.equal(sprakfamilj('Danish (Denmark)'), 'da');
  assert.equal(sprakfamilj('Finnish (Finland)'), 'fi');
  assert.equal(sprakfamilj('Swedish'), 'sv');
  assert.equal(sprakfamilj('Klingon'), null);
});

test('srtText: index och tidskoder bort, texten kvar', () => {
  const t = srtText(ENGELSK_SRT);
  assert.ok(!/-->/.test(t));
  assert.ok(!/^\d+$/m.test(t));
  assert.ok(t.includes('Just the roof'));
});

test('gissaSprak: engelska, norska, svenska och danska känns igen', () => {
  assert.equal(gissaSprak(srtText(ENGELSK_SRT)).sprak, 'en');
  assert.equal(gissaSprak(SVENSK).sprak, 'sv');
  // Norska och danska delar nästan alla funktionsord: gissningen blir null
  // (jämnt) eller rätt — aldrig svenska eller engelska.
  for (const [t, egen] of [[NORSK, 'nb'], [DANSK, 'da']]) {
    const g = gissaSprak(t);
    assert.ok(g.sprak === egen || g.sprak === null, `${egen}: ${g.sprak}`);
    assert.ok(g.topp.includes(egen), `${egen} bland de två bästa: ${g.topp}`);
    assert.ok(g.poang[egen] > g.poang.sv && g.poang[egen] > g.poang.en);
  }
  assert.equal(gissaSprak('Hej').sprak, null, 'för kort text ger null, aldrig en gissning');
});

test('kollaSprak: felet 2026-09-20 — engelsk text i en norsk session stoppas', () => {
  const k = kollaSprak(srtText(ENGELSK_SRT), 'nb');
  assert.equal(k.ok, false);
  assert.equal(k.gissat, 'en');
  assert.match(k.skal, /engelska/);
});

test('kollaSprak: rätt språk är grönt, i alla fyra familjerna', () => {
  assert.equal(kollaSprak(srtText(ENGELSK_SRT), 'en').ok, true);
  assert.equal(kollaSprak(NORSK, 'nb').ok, true);
  assert.equal(kollaSprak(SVENSK, 'sv').ok, true);
  assert.equal(kollaSprak(DANSK, 'da').ok, true);
});

test('kollaSprak: svensk text i en norsk session stoppas (HeyGen översatte inte)', () => {
  const k = kollaSprak(SVENSK, 'nb');
  assert.equal(k.ok, false);
  assert.equal(k.gissat, 'sv');
});

test('kollaSprak: norska mot danska döms aldrig som fel — de delar orden, och en människa avgör', () => {
  assert.equal(kollaSprak(NORSK, 'da').ok, true);
  assert.equal(kollaSprak(DANSK, 'nb').ok, true);
});

test('kollaSprak: för lite text ger null med skäl — aldrig grönt, aldrig rött', () => {
  const k = kollaSprak('Bare taket.', 'en');
  assert.equal(k.ok, null);
  assert.match(k.skal, /för lite text/);
  assert.equal(kollaSprak(NORSK, 'xx').ok, null);
});

test('sprakUrHeygenId: suffixet i HeyGen-id:t läses för rapporten', () => {
  assert.deepEqual(sprakUrHeygenId('89a6bc68cca5414db6df8c3aa79e49e2-nb-nb-NO'), { kod: 'nb', locale: 'nb-NO' });
  assert.deepEqual(sprakUrHeygenId('be76d1b3b9cd402f940b7f9f84a5be75-en-en-US'), { kod: 'en', locale: 'en-US' });
  assert.deepEqual(sprakUrHeygenId('3ef0251f76c9473ab691680c4023c355-nb'), { kod: 'nb', locale: null });
  assert.equal(sprakUrHeygenId('abc'), null);
});

// Europa-språken (2026-09-28, Matstrumpors UGC till sju nya språk). Texterna är
// Sofie H1-manuset som en människa skulle översätta det — samma innehåll på varje
// språk, så skillnaden i poäng kommer ur språket och inte ur ämnet.
const EUROPA = {
  de: 'Ich dachte ehrlich, das wäre echtes Sushi. Aber das sind tatsächlich Socken. Fünf Paar Sushi-Socken, verpackt wie eine echte Takeaway-Box, und sogar mit Essstäbchen. Mir fallen schon zehn Leute ein, denen ich das schenken könnte. Gerade bekommst du zwei Boxen zum Preis von einer.',
  fr: "Honnêtement, je pensais que c'était de vrais sushis. Mais ce sont en fait des chaussettes. Cinq paires de chaussettes sushi, emballées comme une vraie boîte à emporter, et même avec des baguettes. Je pense déjà à dix personnes à qui je pourrais les offrir. En ce moment, vous avez deux boîtes pour le prix d'une.",
  nl: 'Ik dacht echt dat dit echte sushi was. Maar het zijn eigenlijk sokken. Vijf paar sushisokken, verpakt als een echte afhaalbox, en zelfs met eetstokjes. Ik kan nu al tien mensen bedenken aan wie ik dit zou geven. Op dit moment krijg je twee dozen voor de prijs van één.',
  es: 'De verdad pensé que esto era sushi de verdad. Pero en realidad son calcetines. Cinco pares de calcetines de sushi, empaquetados como una caja de comida para llevar, y hasta con palillos. Ya se me ocurren diez personas a las que se lo regalaría. Ahora mismo te llevas dos cajas por el precio de una.',
  it: 'Pensavo davvero che fosse sushi vero. Ma in realtà sono calzini. Cinque paia di calzini sushi, confezionati come una vera scatola da asporto, e ci sono perfino le bacchette. Mi vengono già in mente dieci persone a cui potrei regalarli. In questo momento ricevi due scatole al prezzo di una.',
  pl: 'Naprawdę myślałam, że to prawdziwe sushi. Ale to są skarpetki. Pięć par skarpetek sushi zapakowanych jak prawdziwe pudełko na wynos, a nawet z pałeczkami. Już teraz przychodzi mi do głowy dziesięć osób, którym mogłabym to dać. Teraz dostajesz dwa pudełka w cenie jednego.',
  pt: 'Juro que pensei que isto era sushi a sério. Mas afinal são meias. Cinco pares de meias de sushi, embaladas como uma caixa de takeaway a sério, e até vêm com pauzinhos. Já me estou a lembrar de dez pessoas a quem podia oferecer isto. Neste momento recebes duas caixas pelo preço de uma.',
};

test('sprakfamilj: de sju Europa-språken har en familj — utan den kontrollerades SRT:n inte alls', () => {
  assert.equal(sprakfamilj(heygenSprakFor('DE')), 'de');
  assert.equal(sprakfamilj(heygenSprakFor('FR')), 'fr');
  assert.equal(sprakfamilj(heygenSprakFor('NL')), 'nl');
  assert.equal(sprakfamilj(heygenSprakFor('ES')), 'es');
  assert.equal(sprakfamilj(heygenSprakFor('IT')), 'it');
  assert.equal(sprakfamilj(heygenSprakFor('PL')), 'pl');
  assert.equal(sprakfamilj(heygenSprakFor('PT')), 'pt');
});

test('kollaSprak: varje Europa-språk är grönt i sin egen session och gissas rätt', () => {
  for (const [f, text] of Object.entries(EUROPA)) {
    assert.equal(kollaSprak(text, f).ok, true, `${f} i ${f}-session`);
    assert.equal(gissaSprak(text).sprak, f, `${f} gissas som ${f}`);
  }
});

test('kollaSprak: fel språk i en Europa-session stoppas — engelska, norska, svenska och grannspråket', () => {
  for (const f of Object.keys(EUROPA)) {
    assert.equal(kollaSprak(srtText(ENGELSK_SRT), f).ok, false, `engelska i ${f}-session`);
    assert.equal(kollaSprak(NORSK, f).ok, false, `norska i ${f}-session`);
    assert.equal(kollaSprak(SVENSK, f).ok, false, `svenska i ${f}-session`);
  }
  // Spanska och portugisiska delar mest — de ska ändå inte släppa igenom varandra.
  assert.equal(kollaSprak(EUROPA.es, 'pt').ok, false);
  assert.equal(kollaSprak(EUROPA.pt, 'es').ok, false);
  assert.equal(kollaSprak(EUROPA.it, 'es').ok, false);
  assert.equal(kollaSprak(EUROPA.nl, 'de').ok, false);
  assert.equal(kollaSprak(EUROPA.de, 'nl').ok, false);
});

test('gissaSprak: bokstäver utanför a–ö hålls ihop (não, się, très)', () => {
  assert.equal(gissaSprak('Não, não é isso. Não é mesmo, não.').poang.pt >= 4, true);
  assert.equal(gissaSprak('Ale to się nie da, bo się nie mieści.').poang.pl >= 5, true);
});
