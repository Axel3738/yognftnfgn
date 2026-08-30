// Testar hämtningslogiken utan att röra nätet. Ett skarpt anrop hade bara
// visat att lyckofallet fungerar — det är felfallen som avgör om boten står
// kvar när GitHub strular, och de går inte att framkalla på beställning.

import test from 'node:test';
import assert from 'node:assert/strict';
import { lasFil } from '../repo.js';

const riktigFetch = globalThis.fetch;

// Testerna får ALDRIG bero på vad som råkar ligga i environmentet. Kör någon
// med en GITHUB_TOKEN satt — vilket varje utvecklare har, och sandboxen här
// har en dummy — gick fem tester röda och koden såg trasig ut fast den var hel.
const sparadToken = process.env.GITHUB_TOKEN;
delete process.env.GITHUB_TOKEN;
test.after(() => {
  if (sparadToken !== undefined) process.env.GITHUB_TOKEN = sparadToken;
});

/** Bygger ett svar som liknar det fetch ger, med bara det vi läser. */
function svar(status, { text = '', etag = null, kvar = '4999' } = {}) {
  const h = new Map([['etag', etag], ['x-ratelimit-remaining', kvar], ['x-ratelimit-reset', '0']]);
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (n) => h.get(n) ?? null },
    text: async () => text,
  };
}

/** Kör fn med en stubbad fetch och returnerar anropen som gjordes. */
async function medFetch(svarsfoljd, fn) {
  const anrop = [];
  let i = 0;
  globalThis.fetch = async (url, init) => {
    anrop.push({ url, huvuden: init?.headers || {} });
    return svarsfoljd[Math.min(i++, svarsfoljd.length - 1)];
  };
  try {
    return { resultat: await fn(), anrop };
  } finally {
    globalThis.fetch = riktigFetch;
  }
}

test('200 ger filens text', async () => {
  const { resultat, anrop } = await medFetch(
    [svar(200, { text: '# hej', etag: 'W/"1"' })],
    () => lasFil('a/ett.md'),
  );
  assert.equal(resultat, '# hej');
  assert.match(anrop[0].url, /contents\/a\/ett\.md\?ref=/);
  assert.equal(anrop[0].huvuden['User-Agent'], 'bavern-discord-bot', 'utan User-Agent svarar GitHub 403');
});

test('cachen gör att andra frågan inte når GitHub alls', async () => {
  const { anrop } = await medFetch(
    [svar(200, { text: 'x', etag: 'W/"1"' })],
    async () => { await lasFil('a/tva.md'); await lasFil('a/tva.md'); },
  );
  assert.equal(anrop.length, 1, 'inom TTL ska ingen ny förfrågan skickas');
});

test('404 ger null — inte ett kastat fel', async () => {
  // Claude ska kunna gissa på en sökväg utan att boten dör.
  const { resultat } = await medFetch([svar(404)], () => lasFil('finns/inte.md'));
  assert.equal(resultat, null);
});

test('403 utan cachad kopia säger vad som är fel', async () => {
  const { resultat } = await medFetch(
    [svar(403, { kvar: '0' })],
    () => lasFil('a/tre.md').catch((e) => e.message),
  );
  assert.match(resultat, /Rate limit/i);
});

test('403 med cachad kopia serverar den gamla texten i stället för att dö', async () => {
  const { resultat } = await medFetch(
    [svar(200, { text: 'gammal men sann', etag: 'W/"1"' }), svar(403, { kvar: '0' })],
    async () => {
      const forsta = await lasFil('a/fyra.md');
      // Nolla TTL:n genom att låtsas att en minut gått: enklast är att be om
      // en fil till med samma cachepost via en andra hämtning efter TTL.
      return { forsta, andra: await lasFilEfterTtl('a/fyra.md') };
    },
  );
  assert.equal(resultat.forsta, 'gammal men sann');
  assert.equal(resultat.andra, 'gammal men sann', 'strular GitHub ska svaret bli det vi redan har');
});

// TTL:n är 60 s och testet ska inte ta 60 s. Vi flyttar klockan i stället.
async function lasFilEfterTtl(sökväg) {
  const nu = Date.now;
  Date.now = () => nu() + 120_000;
  try { return await lasFil(sökväg); } finally { Date.now = nu; }
}

test('sökvägar som klättrar uppåt stoppas', async () => {
  await assert.rejects(() => lasFil('../../etc/passwd'), /\.\./);
  await assert.rejects(() => lasFil('.env'), /skyddad/);
  await assert.rejects(() => lasFil('   '), /Tom sökväg/);
});
