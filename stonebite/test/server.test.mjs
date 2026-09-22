// Tester för servern: riktiga HTTP-anrop mot en riktig instans, med en egen
// användarfil i tmp. Inget nät ut, ingen snapshot krävs.
//
// Det här är testet som svarar på frågan "kan en redigerare se spenden om hen
// gissar adressen?". Svaret måste vara nej — och det ska bevisas, inte antas.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const tmp = mkdtempSync(join(tmpdir(), 'stonebite-test-'));
process.env.STONEBITE_ANVANDARE = join(tmp, 'anvandare.json');
process.env.STONEBITE_HEMLIGHET = 'test-hemlighet-som-ar-tillrackligt-lang';
// Föränderliga filer (insatser, personer) i tmp — testet får aldrig skriva i repot.
process.env.STONEBITE_DATA = tmp;

const { skapaServer } = await import('../server.mjs');
const anv = await import('../anvandare.mjs');

const FIL = process.env.STONEBITE_ANVANDARE;
writeFileSync(FIL, JSON.stringify({ anvandare: [] }));
anv.skapa(FIL, { namn: 'Axel Testsson', epost: 'axel@test.se', roll: 'agare', losenord: 'agarlosenord1' });
anv.skapa(FIL, { namn: 'Josh Redigerare', epost: 'josh@test.se', roll: 'redigerare', losenord: 'redigerare123' });
anv.skapa(FIL, { namn: 'Vera VA', epost: 'vera@test.se', roll: 'va', personId: 'vera', losenord: 'kundtjanst123' });
anv.skapa(FIL, { namn: 'Hanna Chef', epost: 'hanna@test.se', roll: 'support_chef', personId: 'hanna', losenord: 'supportchef1' });
anv.skapa(FIL, { namn: 'Pia Test', epost: 'pia@test.se', roll: 'produkttest', personId: 'pia', losenord: 'produkttest1' });

const server = skapaServer();
await new Promise((klar) => server.listen(0, '127.0.0.1', klar));
const bas = `http://127.0.0.1:${server.address().port}`;

test.after(() => {
  server.close();
  rmSync(tmp, { recursive: true, force: true });
});

/** Loggar in och ger tillbaka kakan. */
async function loggaIn(epost, losenord) {
  const forsta = await fetch(`${bas}/logga-in`, { redirect: 'manual' });
  const kaka = (forsta.headers.get('set-cookie') ?? '').split(';')[0];
  const html = await forsta.text();
  const csrf = /name="csrf" value="([^"]+)"/.exec(html)[1];
  const svar = await fetch(`${bas}/logga-in`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...(kaka ? { Cookie: kaka } : {}) },
    body: new URLSearchParams({ epost, losenord, csrf }).toString(),
  });
  return { svar, kaka: (svar.headers.get('set-cookie') ?? '').split(';')[0], csrf };
}

async function hamta(stig, kaka) {
  return fetch(`${bas}${stig}`, { redirect: 'manual', headers: kaka ? { Cookie: kaka } : {} });
}

/**
 * CSRF-nyckeln är bunden till sessionskakan, så den måste hämtas EFTER
 * inloggningen — precis som en riktig webbläsare gör när sidan renderas.
 */
async function farskCsrf(stig, kaka) {
  const html = await (await hamta(stig, kaka)).text();
  const m = /name="csrf" value="([^"]+)"/.exec(html);
  assert.ok(m, `hittade ingen csrf på ${stig}`);
  return m[1];
}

test('publika sidan svarar utan inloggning', async () => {
  const r = await hamta('/');
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.match(html, /Stonebite/);
  assert.doesNotMatch(html, /Översikt<\/a>/, 'publika sidan ska inte visa appens meny');
});

/**
 * Axels order 2026-09-21, efter att sidan legat live med alla elva butiker:
 * "du leakar ju fan alla mina butiker det får du inte göra". En konkurrent
 * som öppnar stonebite.org ska inte få en färdig lista på vad vi driver.
 * Testet läser profil.json och letar efter VARJE butiksnamn och VARJE domän
 * i den publika HTML:en — det fångar både listan och en siffra som råkar
 * skvallra ("Varumärken 11").
 */
test('publika sidan nämner inte en enda butik', async () => {
  const { readFileSync } = await import('node:fs');
  const profil = JSON.parse(readFileSync(new URL('../profil.json', import.meta.url), 'utf8'));
  const marken = profil.varumarken ?? [];
  assert.ok(marken.length >= 5, 'profilen ska ha butikerna kvar — de visas inloggad');

  // Varje publik sida — även influencersidan får inte nämna en butik.
  for (const stig of ['/', '/influencers']) {
    const svar = await hamta(stig);
    assert.equal(svar.status, 200, `${stig} ska svara 200`);
    const html = await svar.text();
    for (const m of marken) {
      if (m.namn) assert.ok(!html.includes(m.namn), `butiksnamnet "${m.namn}" läcker på ${stig}`);
      const doman = String(m.url ?? '').replace(/^https?:\/\//, '').replace(/\/$/, '');
      if (doman) assert.ok(!html.includes(doman), `domänen "${doman}" läcker på ${stig}`);
    }
    assert.ok(!/Varumärken\s*<\/div>\s*<div[^>]*>\s*\d+/.test(html), 'antalet butiker ska inte stå som siffra');
    assert.ok(!html.includes('Butikerna vi driver'), 'butikssektionen ska vara borta');
  }
});

/**
 * Axels beslut 2026-09-22: "jag vill inte sälja några tjänster eller
 * mentorskap eller någonting, jag vill bara ha information om mitt företag".
 * Konsultsidan är borta. Det enda bolaget erbjuder andra är kontakter till
 * mikroinfluencers — och beloppen på sidan ska vara de som står i profilen,
 * aldrig påhittade.
 */
test('influencersidan är publik, visar priset ur profilen och länkar till kontaktadressen', async () => {
  const { readFileSync } = await import('node:fs');
  const profil = JSON.parse(readFileSync(new URL('../profil.json', import.meta.url), 'utf8'));
  const pris = profil.influencers?.pris ?? {};
  assert.ok(pris.fast && pris.andel, 'profilen ska bära båda prisalternativen');

  const r = await hamta('/influencers');
  assert.equal(r.status, 200);
  const html = await r.text();
  assert.match(html, /Så går det till/);
  assert.ok(html.includes(`<div class="pris-varde">${pris.fast}</div>`), `det fasta priset "${pris.fast}" ska stå som prisalternativ`);
  assert.ok(html.includes(`<div class="pris-varde">${pris.andel}</div>`), `andelen "${pris.andel}" ska stå som prisalternativ`);
  assert.match(html, /mailto:contact@stonebite\.org/);
  assert.doesNotMatch(html, /Översikt<\/a>/, 'influencersidan ska inte visa appens meny');
});

test('gamla adressen /tjanster skickas vidare till /influencers', async () => {
  const r = await hamta('/tjanster');
  assert.equal(r.status, 301);
  assert.equal(r.headers.get('location'), '/influencers');
});

/** Inga tjänster, inget mentorskap, ingen rådgivning — på någon publik sida. */
test('publika sidan säljer inga tjänster', async () => {
  for (const stig of ['/', '/influencers']) {
    const html = await (await hamta(stig)).text();
    assert.doesNotMatch(html, /konsult|mentorskap|rådgivning|tjänster/i, `${stig} ska inte tala om tjänster`);
  }
});

/** Ett tomt belopp i profilen ritas inte alls — hellre tomt än påhittat. */
test('ett tomt pris på influencersidan ritas inte', async () => {
  const { influencerSida } = await import('../vy/influencers.mjs');
  const { readFileSync } = await import('node:fs');
  const profil = JSON.parse(readFileSync(new URL('../profil.json', import.meta.url), 'utf8'));
  const utanFast = { ...profil, influencers: { ...profil.influencers, pris: { ...profil.influencers.pris, fast: '' } } };
  const html = influencerSida({ profil: utanFast });
  // Beloppet kan råka stå i annan text ("5 000 till 20 000 kr per samarbete"),
  // så det som ska vara borta är prisalternativet — kortet och prispunkten.
  assert.doesNotMatch(html, /class="pris-etikett">Fast pris/, 'kortet för fast pris ska vara borta');
  assert.doesNotMatch(html, /betalas i förskott/, 'texten till det fasta priset ska vara borta');
  assert.ok(!html.includes(`${profil.influencers.pris.fast} eller `), 'prispunkten ska inte längre säga "… eller …"');
  assert.ok(html.includes(`<div class="pris-varde">${profil.influencers.pris.andel}</div>`), 'andelen står kvar');
});

/**
 * YouTube-kanalen är en egen gren i bolaget (Axels beslut 2026-09-21) och ska
 * synas — men bara med en riktig adress. Tom url ⇒ texten står kvar, ingen
 * knapp och ingen länk till youtube.com. Sidan får aldrig hitta på en kanal.
 */
test('YouTube-sektionen länkar bara när adressen är ifylld', async () => {
  const { publikSida } = await import('../vy/publik.mjs');
  const { readFileSync } = await import('node:fs');
  const profil = JSON.parse(readFileSync(new URL('../profil.json', import.meta.url), 'utf8'));
  assert.ok(profil.youtube?.url, 'profilen ska bära kanalens adress');

  const med = publikSida({ profil });
  assert.match(med, /id="youtube"/);
  assert.ok(med.includes(`href="${profil.youtube.url}"`), 'kanalens adress ska stå som länk');
  assert.match(med, /rel="noopener"/);

  const utan = publikSida({ profil: { ...profil, youtube: { ...profil.youtube, url: '' } } });
  assert.match(utan, /id="youtube"/, 'sektionen står kvar utan adress');
  assert.doesNotMatch(utan, /youtube\.com/, 'ingen påhittad kanallänk');
  assert.doesNotMatch(utan, /Till kanalen/, 'ingen knapp utan adress');
});

/**
 * Varumärkessidorna bär spend, tvister och eskaleringar — bara ägare och chef.
 * En redigerare som gissar adressen ska mötas av 403 (eller skickas till sin
 * startsida), aldrig av innehållet.
 */
test('varumärkena är stängda för redigerare, öppna för ägaren', async () => {
  const red = await loggaIn('josh@test.se', 'redigerare123');
  const lista = await hamta('/app/varumarken', red.kaka);
  assert.ok([303, 403].includes(lista.status), `redigerare fick ${lista.status} på listan`);
  const brand = await hamta('/app/varumarke/carashell', red.kaka);
  assert.equal(brand.status, 403);

  const agare = await loggaIn('axel@test.se', 'agarlosenord1');
  const r = await hamta('/app/varumarken', agare.kaka);
  assert.equal(r.status, 200);
  const html = await r.text();
  for (const namn of ['Bäverbutiken', 'Grillkliniken', 'Matstrumpor', 'CaraShell']) assert.ok(html.includes(namn), `${namn} saknas på varumärkessidan`);

  const cs = await hamta('/app/varumarke/carashell?flik=rutiner', agare.kaka);
  assert.equal(cs.status, 200);
  const csHtml = await cs.text();
  assert.match(csHtml, /class="flikar"/);
  assert.match(csHtml, /aria-current="page"[^>]*>Rutiner/);
  const okand = await hamta('/app/varumarke/finns-inte', agare.kaka);
  assert.equal(okand.status, 404);
});

/**
 * Kalendern: alla har en egen. En redigerares rad syns aldrig för en annan
 * redigerare, och en redigerare kan inte smyga in en rad på ett varumärke.
 * Ägaren ser varumärkets rad på varumärkets sida.
 */
test('kalendern: egna rader är egna, varumärkesrader kräver ägare', async () => {
  const red = await loggaIn('josh@test.se', 'redigerare123');
  const csrf = await farskCsrf('/app/kalender', red.kaka);
  const skapa = await fetch(`${bas}/app/kalender/ny`, {
    method: 'POST', redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: red.kaka },
    body: new URLSearchParams({ csrf, text: 'Klipp reel imorgon kl 14', datum: '2026-01-01', typ: 'plan', brand: 'carashell', nasta: '/app/kalender' }).toString(),
  });
  assert.equal(skapa.status, 303);
  const egen = await (await hamta('/app/kalender', red.kaka)).text();
  assert.match(egen, /Klipp reel/, 'raden syns för den som skrev den');
  assert.match(egen, /14:00/, '"kl 14" blev 14:00');

  // En annan icke-privilegierad användare ser den inte.
  const va = await loggaIn('vera@test.se', 'kundtjanst123');
  const andra = await (await hamta('/app/kalender', va.kaka)).text();
  assert.doesNotMatch(andra, /Klipp reel/, 'en annan användares rad läcker');

  // Redigeraren fick INTE sätta varumärke — raden är personlig och syns inte på CaraShells sida.
  const agare = await loggaIn('axel@test.se', 'agarlosenord1');
  const csKal = await (await hamta('/app/varumarke/carashell?flik=kalender', agare.kaka)).text();
  assert.doesNotMatch(csKal, /Klipp reel/, 'redigerarens rad hamnade på varumärket');

  // Ägaren lägger en varumärkesrad, och den syns på varumärkets flik.
  const csrfA = await farskCsrf('/app/kalender', agare.kaka);
  const skapaA = await fetch(`${bas}/app/kalender/ny`, {
    method: 'POST', redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: agare.kaka },
    body: new URLSearchParams({ csrf: csrfA, text: 'Slå på US-kampanjen 15/10', datum: '2026-01-01', typ: 'deadline', brand: 'carashell', nasta: '/app/varumarke/carashell?flik=kalender' }).toString(),
  });
  assert.equal(skapaA.status, 303);
  assert.equal(skapaA.headers.get('location'), '/app/varumarke/carashell?flik=kalender');
  const csKal2 = await (await hamta('/app/varumarke/carashell?flik=kalender', agare.kaka)).text();
  assert.match(csKal2, /Slå på US-kampanjen/);
  assert.match(csKal2, /15<\/div>|2026-10-15/, 'datumordet 15/10 blev 15 oktober');

  // Redigeraren kan inte bocka av ägarens rad.
  const id = /name="id" value="([^"]+)"[^]*?Slå på US-kampanjen|Slå på US-kampanjen[^]*?name="id" value="([^"]+)"/.exec(csKal2);
  const radId = id?.[1] ?? id?.[2];
  assert.ok(radId, 'hittade radens id');
  const fusk = await fetch(`${bas}/app/kalender/klar`, {
    method: 'POST', redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: red.kaka },
    body: new URLSearchParams({ csrf: await farskCsrf('/app/kalender', red.kaka), id: radId, nasta: '/app/kalender' }).toString(),
  });
  assert.equal(fusk.status, 403);
});

test('kontakterna kan bara ägare och chef röra', async () => {
  const va = await loggaIn('vera@test.se', 'kundtjanst123');
  const csrf = await farskCsrf('/app/kalender', va.kaka);
  const r = await fetch(`${bas}/app/kontakter/ny`, {
    method: 'POST', redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: va.kaka },
    body: new URLSearchParams({ csrf, brand: 'carashell', namn: '@någon', nasta: '/app/varumarke/carashell?flik=kontakter' }).toString(),
  });
  assert.equal(r.status, 403);

  const agare = await loggaIn('axel@test.se', 'agarlosenord1');
  const csrfA = await farskCsrf('/app/varumarke/carashell?flik=kontakter', agare.kaka);
  const ok = await fetch(`${bas}/app/kontakter/ny`, {
    method: 'POST', redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: agare.kaka },
    body: new URLSearchParams({ csrf: csrfA, brand: 'carashell', namn: '@husvagnsliv', typ: 'influencer', plattform: 'TikTok', status: 'kontaktad', nastaSteg: 'skicka produkt', nastaDatum: '2099-01-05', nasta: '/app/varumarke/carashell?flik=kontakter' }).toString(),
  });
  assert.equal(ok.status, 303);
  const html = await (await hamta('/app/varumarke/carashell?flik=kontakter', agare.kaka)).text();
  assert.match(html, /@husvagnsliv/);
  assert.match(html, /skicka produkt/);
});

test('bilderna serveras med rätt typ och lång cache', async () => {
  const r = await hamta('/webb/bilder/hero.jpg');
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('content-type'), 'image/jpeg');
  assert.match(r.headers.get('cache-control'), /max-age=86400/);
  const css = await hamta('/webb/stil.css');
  assert.match(css.headers.get('cache-control'), /max-age=300/);
});

test('säkerhetsrubrikerna sitter på varje svar', async () => {
  const r = await hamta('/');
  assert.equal(r.headers.get('x-frame-options'), 'DENY');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.match(r.headers.get('content-security-policy'), /default-src 'self'/);
  assert.match(r.headers.get('content-security-policy'), /frame-ancestors 'none'/);
});

test('appen kräver inloggning och skickar tillbaka dit man skulle', async () => {
  const r = await hamta('/app/annonser');
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('location'), '/logga-in?nasta=%2Fapp%2Fannonser');
});

test('fel lösenord ger 401 och avslöjar inte om adressen finns', async () => {
  const fel = await loggaIn('axel@test.se', 'fel-losenord');
  assert.equal(fel.svar.status, 401);
  const text = await fel.svar.text();
  assert.match(text, /Fel e-post eller lösenord/);

  const okand = await loggaIn('finns-inte@test.se', 'vadsomhelst');
  assert.equal(okand.svar.status, 401);
  assert.match(await okand.svar.text(), /Fel e-post eller lösenord/, 'samma text för okänd adress');
});

test('inloggning utan CSRF-nyckel avvisas', async () => {
  const r = await fetch(`${bas}/logga-in`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ epost: 'axel@test.se', losenord: 'agarlosenord1' }).toString(),
  });
  assert.equal(r.status, 400);
});

test('ägaren kommer in och ser hela menyn', async () => {
  const { svar, kaka } = await loggaIn('axel@test.se', 'agarlosenord1');
  assert.equal(svar.status, 303);
  assert.equal(svar.headers.get('location'), '/app');
  assert.match(kaka, /^stonebite_session=/);

  const app = await hamta('/app', kaka);
  assert.equal(app.status, 200);
  const html = await app.text();
  for (const sida of ['Översikt', 'Butiker', 'Annonser', 'Konton']) {
    assert.match(html, new RegExp(sida), `ägaren ska se ${sida} i menyn`);
  }
});

test('kakan är HttpOnly och SameSite', async () => {
  const forsta = await fetch(`${bas}/logga-in`, { redirect: 'manual' });
  const html = await forsta.text();
  const csrf = /name="csrf" value="([^"]+)"/.exec(html)[1];
  const r = await fetch(`${bas}/logga-in`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ epost: 'axel@test.se', losenord: 'agarlosenord1', csrf }).toString(),
  });
  const kaka = r.headers.get('set-cookie') ?? '';
  assert.match(kaka, /HttpOnly/);
  assert.match(kaka, /SameSite=Lax/);
});

test('REDIGERAREN når inte annonser, butiker eller översikt', async () => {
  const { kaka, svar } = await loggaIn('josh@test.se', 'redigerare123');
  assert.equal(svar.headers.get('location'), '/app/redigerare', 'redigeraren landar på topplistan');

  for (const stig of ['/app', '/app/annonser', '/app/butiker', '/app/kundtjanst', '/app/leverans', '/app/konton']) {
    const r = await hamta(stig, kaka);
    assert.equal(r.status, 303, `${stig} ska inte visas för en redigerare`);
    assert.equal(r.headers.get('location'), '/app/redigerare');
  }
});

test('redigerarens egna sidor visar varken spend, ROAS eller satsen', async () => {
  const { kaka } = await loggaIn('josh@test.se', 'redigerare123');
  // Etiketterna är det som avslöjar ett tal. Satsen räknas också som spend:
  // med belopp OCH sats går spenden att räkna ut baklänges.
  const forbjudna = [/Reklam i dag/, /Vinstbidrag/, /ROAS/, />Sats</, /break-even/i, / kr</];
  for (const stig of ['/app/redigerare', '/app/mig']) {
    const html = await (await hamta(stig, kaka)).text();
    for (const m of forbjudna) assert.doesNotMatch(html, m, `${stig} läcker ${m}`);
  }
});

test('vanlig VA når sina sidor men ingen ekonomi och ingen bonusöversikt', async () => {
  const { kaka, svar } = await loggaIn('vera@test.se', 'kundtjanst123');
  assert.equal(svar.headers.get('location'), '/app/kundtjanst');
  for (const stig of ['/app/kundtjanst', '/app/leverans', '/app/recensioner', '/app/mig']) {
    assert.equal((await hamta(stig, kaka)).status, 200, `${stig} ska visas för en VA`);
  }
  for (const stig of ['/app/annonser', '/app/butiker', '/app/bonus', '/app/system', '/app/produkttest']) {
    assert.equal((await hamta(stig, kaka)).headers.get('location'), '/app/kundtjanst', `${stig} ska inte visas för en VA`);
  }
});

test('Head of support når bonusen men inte annonserna', async () => {
  const { kaka } = await loggaIn('hanna@test.se', 'supportchef1');
  assert.equal((await hamta('/app/bonus', kaka)).status, 200);
  assert.equal((await hamta('/app/kundtjanst', kaka)).status, 200);
  assert.equal((await hamta('/app/annonser', kaka)).headers.get('location'), '/app/kundtjanst');
  assert.equal((await hamta('/app/konton', kaka)).headers.get('location'), '/app/kundtjanst');
});

test('produkttestaren ser sin pipeline och inget annat', async () => {
  const { kaka, svar } = await loggaIn('pia@test.se', 'produkttest1');
  assert.equal(svar.headers.get('location'), '/app/produkttest');
  assert.equal((await hamta('/app/produkttest', kaka)).status, 200);
  assert.equal((await hamta('/app/mig', kaka)).status, 200);
  for (const stig of ['/app', '/app/annonser', '/app/bonus', '/app/kundtjanst']) {
    assert.equal((await hamta(stig, kaka)).headers.get('location'), '/app/produkttest');
  }
});

test('en VA kan rapportera in en insats — men inte godkänna den själv', async () => {
  const { kaka } = await loggaIn('vera@test.se', 'kundtjanst123');
  const csrf = await farskCsrf('/app/mig', kaka);
  const skicka = await fetch(`${bas}/app/mig/rapportera`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: kaka },
    body: new URLSearchParams({ csrf, uppdrag: 'recension_med_namn', referens: 'https://trustpilot.com/reviews/1', text: 'Kunden skrev mitt namn' }).toString(),
  });
  assert.equal(skicka.status, 200);
  const html = await skicka.text();
  assert.match(html, /Inskickat/);

  const { lasInsatser } = await import('../../bonus/kor.mjs');
  const insatser = lasInsatser(join(tmp, 'insatser.jsonl'));
  assert.equal(insatser.length, 1);
  assert.equal(insatser[0].status, 'vantar');
  assert.equal(insatser[0].personId, 'vera');

  // VA:n försöker godkänna sin egen insats.
  const fusk = await fetch(`${bas}/app/bonus/godkann`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: kaka },
    body: new URLSearchParams({ csrf, id: insatser[0].id, beslut: 'godkand' }).toString(),
  });
  assert.equal(fusk.status, 403, 'en VA får aldrig godkänna sina egna pengar');
  assert.equal(lasInsatser(join(tmp, 'insatser.jsonl'))[0].status, 'vantar');
});

test('Head of support får inte godkänna sina EGNA insatser trots rätten att godkänna', async () => {
  // Mechile är både VA och Head of support (2026-09-21) — rätten 'godkanna'
  // får aldrig bli en väg till egna pengar.
  const { kaka } = await loggaIn('hanna@test.se', 'supportchef1');
  const csrf = await farskCsrf('/app/mig', kaka);
  const skicka = await fetch(`${bas}/app/mig/rapportera`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: kaka },
    body: new URLSearchParams({ csrf, uppdrag: 'recension_med_namn', referens: 'https://trustpilot.com/reviews/2', text: 'Kunden nämnde mig' }).toString(),
  });
  assert.equal(skicka.status, 200);
  const { lasInsatser } = await import('../../bonus/kor.mjs');
  const egen = lasInsatser(join(tmp, 'insatser.jsonl')).find((i) => i.personId === 'hanna');
  assert.ok(egen, 'chefens egen insats ska finnas');

  const fusk = await fetch(`${bas}/app/bonus/godkann`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: kaka },
    body: new URLSearchParams({ csrf, id: egen.id, beslut: 'godkand' }).toString(),
  });
  assert.equal(fusk.status, 403);
  assert.equal(lasInsatser(join(tmp, 'insatser.jsonl')).find((i) => i.id === egen.id).status, 'vantar');
});

test('Head of support godkänner insatsen och den blir utbetalbar', async () => {
  const { lasInsatser } = await import('../../bonus/kor.mjs');
  const insats = lasInsatser(join(tmp, 'insatser.jsonl')).find((i) => i.personId === 'vera');
  const { kaka } = await loggaIn('hanna@test.se', 'supportchef1');
  const csrf = await farskCsrf('/app/bonus', kaka);
  const svar = await fetch(`${bas}/app/bonus/godkann`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: kaka },
    body: new URLSearchParams({ csrf, id: insats.id, beslut: 'godkand' }).toString(),
  });
  assert.equal(svar.status, 200);
  const efter = lasInsatser(join(tmp, 'insatser.jsonl')).find((i) => i.id === insats.id);
  assert.equal(efter.status, 'godkand');
  assert.equal(efter.beslutAv, 'Hanna Chef');
});

test('ägaren skapar ett konto och personen hamnar i bonusregistret', async () => {
  const { kaka } = await loggaIn('axel@test.se', 'agarlosenord1');
  const csrf = await farskCsrf('/app/konton', kaka);
  const svar = await fetch(`${bas}/app/konton/ny`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: kaka },
    body: new URLSearchParams({
      csrf, namn: 'Maria Santos', epost: 'maria@test.se', roll: 'va',
      fornamn: 'Maria', brands: 'baverbutiken, carashell', extraroll: 'produkttest',
    }).toString(),
  });
  assert.equal(svar.status, 200);
  const { lasPersoner } = await import('../../bonus/kor.mjs');
  const person = lasPersoner(undefined, join(tmp, 'personer-extra.json')).find((p) => p.id === 'maria');
  assert.ok(person, 'personen ska ha skapats i bonusregistret');
  assert.equal(person.roll, 'va');
  assert.deepEqual(person.brands, ['baverbutiken', 'carashell']);
  assert.deepEqual(person.extraRoller, ['produkttest']);
  assert.ok(anv.hittaPaEpost(FIL, 'maria@test.se'), 'inloggningen ska finnas');
});

test('ingen utom ägaren får ändra konton', async () => {
  const { kaka } = await loggaIn('josh@test.se', 'redigerare123');
  const csrf = await farskCsrf('/app/mig', kaka);
  const r = await fetch(`${bas}/app/konton/ny`, {
    method: 'POST',
    redirect: 'manual',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Cookie: kaka },
    body: new URLSearchParams({ csrf, namn: 'Smygaren', epost: 'smyg@test.se', roll: 'agare' }).toString(),
  });
  assert.ok([303, 400, 403].includes(r.status), `fick ${r.status}`);
  assert.equal(anv.hittaPaEpost(FIL, 'smyg@test.se'), null, 'kontot får inte ha skapats');
});

test('en pillad kaka loggar ut i stället för att släppa in', async () => {
  const { kaka } = await loggaIn('josh@test.se', 'redigerare123');
  const trasig = `${kaka.slice(0, -3)}xyz`;
  const r = await hamta('/app/redigerare', trasig);
  assert.equal(r.status, 303);
  assert.match(r.headers.get('location'), /^\/logga-in/);
});

test('avstängt konto kommer inte in med en giltig kaka', async () => {
  const { kaka } = await loggaIn('vera@test.se', 'kundtjanst123');
  assert.equal((await hamta('/app/kundtjanst', kaka)).status, 200);
  const konto = anv.hittaPaEpost(FIL, 'vera@test.se');
  anv.sattAktiv(FIL, konto.id, false);
  const r = await hamta('/app/kundtjanst', kaka);
  assert.equal(r.status, 303);
  assert.match(r.headers.get('location'), /^\/logga-in/);
  anv.sattAktiv(FIL, konto.id, true);
});

test('statiska filer serveras, men inte utanför webb-mappen', async () => {
  const css = await hamta('/webb/stil.css');
  assert.equal(css.status, 200);
  assert.match(css.headers.get('content-type'), /text\/css/);

  for (const ful of ['/webb/../data/anvandare.json', '/webb/..%2Fdata%2Fanvandare.json', '/webb/../../package.json']) {
    const r = await hamta(ful);
    assert.notEqual(r.status, 200, `${ful} skulle inte ha serverats`);
    const text = await r.text();
    assert.doesNotMatch(text, /scrypt\$/, 'ingen lösenordshash får läcka');
  }
});

test('hälsokollen svarar utan inloggning', async () => {
  const r = await hamta('/halsa');
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.ok, true);
  assert.equal(typeof j.konton, 'number');
});

test('uppstartssidan är stängd när kontot finns', async () => {
  const r = await hamta('/kom-igang');
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('location'), '/logga-in');
});

test('utloggning tar bort kakan', async () => {
  const { kaka } = await loggaIn('axel@test.se', 'agarlosenord1');
  const r = await hamta('/logga-ut', kaka);
  assert.equal(r.status, 303);
  assert.match(r.headers.get('set-cookie'), /Max-Age=0/);
});

test('okänd sida ger 404, inte ett kast', async () => {
  const { kaka } = await loggaIn('axel@test.se', 'agarlosenord1');
  assert.equal((await hamta('/finns-inte', kaka)).status, 404);
  assert.equal((await hamta('/app/finns-inte', kaka)).status, 404);
});
