import { test } from 'node:test';
import assert from 'node:assert/strict';
import { skannaVillkor, baraFel, talord, tiotalOchEntal } from '../villkorsskanning.mjs';

// HeimGuards riktiga villkor, ur factory/butiker/hemvakten.yaml.
const BUTIK = {
  frakt: { fri_globalt: true, leveranstid: '5–10 arbetsdagar' },
  retur: { oppet_kop_dagar: 30, angerratt_dagar: 14 },
};

test('fraktgränsen fångas i copy — butiken har fri frakt utan gräns', () => {
  const f = skannaVillkor([{ yta: 'copy', text: 'Fri frakt över 300 kr' }], BUTIK);
  assert.equal(f.length, 1);
  assert.equal(f[0].regel, 'fraktgräns');
});

test('öppet köp fångas på norska — "30 dagers åpent kjøp" mot en butik med 14', () => {
  const B14 = { ...BUTIK, retur: { oppet_kop_dagar: 14, angerratt_dagar: 14 } };
  const f = skannaVillkor([{ yta: 'copy', text: '✅ 30 dagers åpent kjøp' }], B14);
  assert.equal(f.length, 1);
  assert.equal(f[0].regel, 'öppet köp');
  assert.equal(skannaVillkor([{ yta: 'bild', text: 'Garanti: 30 dagers apent kjop – fornoyd eller pengene tilbake' }], B14).filter((x) => x.regel === 'öppet köp').length, 1);
  assert.deepEqual(skannaVillkor([{ yta: 'copy', text: '✅ 14 dagers angrerett' }], B14), []);
});

test('fraktgränsen fångas på norska', () => {
  const f = skannaVillkor([{ yta: 'inbränd', text: 'Gratis frakt over 300 kr' }], BUTIK);
  assert.equal(f.length, 1);
});

test('fraktgränsen fångas när den SÄGS i ord', () => {
  // Så här står den i transkriptet för CS_2 och CS_3 — siffran finns inte.
  const f = skannaVillkor([{ yta: 'tal', text: 'Få den nu, betala sen. Fri frakt över trehundra kronor.' }], BUTIK);
  assert.equal(f.length, 1);
  assert.equal(f[0].yta, 'tal');
});

test('fri frakt UTAN gräns är inget fel', () => {
  assert.deepEqual(skannaVillkor([{ yta: 'copy', text: 'Fri frakt i hela Sverige' }], BUTIK), []);
});

test('30 dagars öppet köp stämmer med butiken och larmar inte', () => {
  assert.deepEqual(skannaVillkor([{ yta: 'copy', text: '30 dagars öppet köp' }], BUTIK), []);
});

test('fel antal dagar fångas', () => {
  const f = skannaVillkor([{ yta: 'copy', text: '14 dagars öppet köp' }], BUTIK);
  assert.equal(f.length, 1);
  assert.equal(f[0].regel, 'öppet köp');
});

test('fel leveranstid fångas', () => {
  const f = skannaVillkor([{ yta: 'copy', text: 'Leverans 2–4 arbetsdagar' }], BUTIK);
  assert.equal(f.length, 1);
  assert.equal(f[0].regel, 'leveranstid');
});

test('rätt leveranstid larmar inte', () => {
  assert.deepEqual(skannaVillkor([{ yta: 'copy', text: '5–10 arbetsdagar med fri frakt' }], BUTIK), []);
});

test('en butik som HAR fraktgräns får inget larm för den', () => {
  const medGrans = { frakt: { fri_globalt: false }, retur: { oppet_kop_dagar: 30 } };
  assert.deepEqual(skannaVillkor([{ yta: 'copy', text: 'Fri frakt över 300 kr' }], medGrans), []);
});

test('brådska och lagerpåståenden fångas på alla ytor — en OPS-butik lovar aldrig tidsbegränsning', () => {
  // AdventLane 2026-09-10: hela CS-konceptet bar det i tal ("Lagret är
  // begränsat och priset gäller inte länge"), inbränt ("BEGRÄNSAT LAGER –
  // SLUT INNAN JUL") och copy ("23% rabatt – bara idag") utan att någon regel slog till.
  for (const [yta, text] of [
    ['copy', '23% rabatt – bara idag 🎄'],
    ['inbränd', 'BEGRÄNSAT LAGER – SLUT INNAN JUL'],
    ['inbränd', 'KÖP INNAN DEN TAR SLUT'],
    ['tal', 'Lagret är begränsat och priset gäller inte länge.'],
    ['tal', 'Sista chansen innan lagret tar slut.'],
    ['copy', 'Bestill før den er utsolgt'],
  ]) {
    const f = skannaVillkor([{ yta, text }], BUTIK);
    assert.equal(f.length, 1, `${yta}: ${text}`);
    assert.equal(f[0].regel, 'brådska');
    assert.equal(f[0].yta, yta);
    // …men som ANMÄRKNING. Axels regel 2026-09-10: bara Bäverbutiken, fel pris
    // och fel villkor ändrar en annons — brådska kopieras orörd, och ett öga
    // ska se den utan att domen tvingar fram omdubb. baraFel() sorterar bort den.
    assert.equal(f[0].anmarkning, true);
    assert.deepEqual(baraFel(f), []);
  }
  // Priset i sig är inget brådskepåstående.
  assert.deepEqual(skannaVillkor([{ yta: 'copy', text: '649 kr → 499 kr, spara 150 kr' }], BUTIK), []);
});

test('priset jämförs mot butikens egen prislista — NOK-tal i norska källannonser är fel pris', () => {
  const B = { ...BUTIK, priser: [499, 649] };
  const pris = (texter, butik = B) => skannaVillkor(texter, butik).filter((f) => f.regel === 'pris');
  // Rätt priser: inget fynd, oavsett form (mellanslag, pil, OCR utan mellanslag).
  assert.deepEqual(pris([{ yta: 'copy', text: '649 kr → 499 kr' }]), []);
  assert.deepEqual(pris([{ yta: 'inbränd', text: '649kr→499kr' }]), []);
  // Norska källans NOK-tal: båda talen är fel, var för sig, på rätt yta.
  const f = pris([{ yta: 'tal', text: 'Fra 579 kr ned til 439 kr.' }]);
  assert.equal(f.length, 2);
  assert.equal(f[0].yta, 'tal');
  assert.match(f[0].fel, /579 kr — butiken tar 499 \/ 649 kr/);
  assert.match(f[1].fel, /439 kr/);
  assert.equal(pris([{ yta: 'inbränd', text: '579kr→439kr' }]).length, 2);
  // Belopp som inte är priser jämförs inte: fraktgräns, spara, rabatt.
  assert.deepEqual(pris([{ yta: 'copy', text: 'Fri frakt över 300 kr' }]), []);
  assert.deepEqual(pris([{ yta: 'copy', text: 'spara 150 kr i dag' }]), []);
  assert.deepEqual(pris([{ yta: 'copy', text: 'Spar 140 kr' }]), []);
  // Ett belopp under halva lägsta priset är aldrig ett pris — OCR:en ser bara
  // "150 kronor på julens" när "spara" står i föregående caption-frame.
  assert.deepEqual(pris([{ yta: 'inbränd', text: '150 kronor pa julens' }]), []);
  // …men 300 kr utan "över" framför är nära nog att vara ett fel pris.
  assert.equal(pris([{ yta: 'inbränd', text: 'Nu 300 kr' }]).length, 1);
  // Utan prislista görs ingen jämförelse alls — hellre tyst än påhittad.
  assert.deepEqual(pris([{ yta: 'copy', text: 'kun 439 kr' }], BUTIK), []);
});

test('utskrivna priser i talet läses på svenska och bokmål', () => {
  assert.deepEqual(talord('femhundre og syttini til firehundre og trettini kroner').map((t) => t.tal), [579, 439]);
  assert.deepEqual(talord('sexhundrafyrtionio kronor blir fyrahundranittionio').map((t) => t.tal), [649, 499]);
  assert.deepEqual(talord('spara hundrafemtio kronor').map((t) => t.tal), [150]);
  assert.deepEqual(talord('hundratals bilar').map((t) => t.tal), []);
  assert.equal(tiotalOchEntal('nitton'), 19);
  assert.equal(tiotalOchEntal('syttini'), 79);
  const B = { ...BUTIK, priser: [499, 649] };
  const pris = (t) => skannaVillkor([{ yta: 'tal', text: t }], B).filter((f) => f.regel === 'pris');
  // NO CS_1 (2026-09-10): två NOK-priser i en mening, båda fel.
  const f = pris('I dag blir femhundre og syttini til firehundre og trettini kroner.');
  assert.equal(f.length, 2);
  assert.match(f[0].fel, /579 kr/);
  assert.match(f[1].fel, /439 kr/);
  // Rätt pris utskrivet: inget fel. Belopp under halva priset: inget fel.
  assert.deepEqual(pris('sexhundrafyrtionio kronor blir fyrahundranittionio kronor'), []);
  assert.deepEqual(pris('Bara i dag, spara hundrafemtio kronor'), []);
  // Fraktgränsen i talad form är fraktgränsens sak, inte prisregelns.
  assert.deepEqual(pris('fri frakt över trehundra kronor'), []);
});

test('ett citat märkt "Verifierad kund" måste finnas bland butikens egna recensioner', () => {
  const B = { ...BUTIK, recensioner: ['Superkul. En enkel och rolig adventskalender. Sonen längtar till varje dag.'] };
  const rec = (texter, butik = B) => skannaVillkor(texter, butik).filter((f) => f.regel === 'recension');
  // Påhittat citat (AdventLane SP_2_1, 2026-09-10): fel, på rätt yta.
  const f = rec([{ yta: 'bild', text: '"Han sprang ut ur sängen varje morgon för att öppna en lucka!" – Verifierad kund, 34 år' }]);
  assert.equal(f.length, 1);
  assert.equal(f[0].yta, 'bild');
  assert.match(f[0].fel, /påhittad kund/);
  // Norska formen.
  assert.equal(rec([{ yta: 'bild', text: 'han hoppet ut av sengen – Verifisert kunde, 34 år' }]).length, 1);
  // Ett riktigt citat ur butikens recensioner: inget fel, även med OCR-brus.
  assert.deepEqual(rec([{ yta: 'bild', text: '"Sonen langtar till varje dag" - Verifierad kund' }]), []);
  // Stjärnraden i copyn är också ett citat — attributionen står på raden under.
  assert.equal(rec([{ yta: 'copy', text: '⭐⭐⭐⭐⭐ "Han sprang ut ur sängen varje morgon för att öppna en lucka!"' }]).length, 1);
  assert.deepEqual(rec([{ yta: 'copy', text: '⭐⭐⭐⭐⭐ "Sonen längtar till varje dag."' }]), []);
  // Utan recensionslista görs ingen jämförelse.
  assert.deepEqual(rec([{ yta: 'copy', text: '– Verifierad kund, 34 år' }], BUTIK), []);
});

test('tomma texter ger inga fynd', () => {
  assert.deepEqual(skannaVillkor([], BUTIK), []);
  assert.deepEqual(skannaVillkor([{ yta: 'copy', text: '' }], BUTIK), []);
});
