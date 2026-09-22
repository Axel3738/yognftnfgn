// Eskaleringsläsaren: det som hamnar i snapshoten committas till repot.
// Lösenord och kundadresser får aldrig följa med — det här är spärren.

import test from 'node:test';
import assert from 'node:assert/strict';
import { maskera, hamtaEskalering } from '../kallor/discord.mjs';

test('mejladresser och lösenord maskeras innan de sparas', () => {
  assert.equal(maskera('Skriv till kalle.anka@gmail.com'), 'Skriv till ka***@gmail.com');
  const m = maskera('For Finland majavakauppa.fi  Email: asiakaspalvelu@majavakauppa.fi  Password: AdgBNEXZZ123462.  Login Here: https://webbmail.loopia.se/');
  assert.ok(!m.includes('AdgBNEXZZ123462'), 'lösenordet får inte finnas kvar');
  assert.match(m, /Password: \[dolt\]/);
  assert.match(m, /as\*\*\*@majavakauppa\.fi/);
  assert.equal(maskera('Lösenord: hemligt123'), 'Lösenord: [dolt]');
  assert.equal(maskera('token=abc.def.ghi'), 'token=[dolt]');
  assert.equal(maskera('Paketet är på väg, inga problem.'), 'Paketet är på väg, inga problem.', 'vanlig text rörs inte');
});

test('läsaren utan token säger det, och maskerar meddelandena den läser', async () => {
  const utan = await hamtaEskalering([], { env: {} });
  assert.equal(utan.status, 'saknas');

  const svar = {
    '/users/@me/guilds': [{ id: 'g1', name: 'Bäverbutiken' }],
    '/guilds/g1/channels': [{ id: 'c1', name: 'customer-service', type: 0 }],
    '/channels/c1/messages?limit=12': [
      { timestamp: '2026-09-22T06:00:00Z', author: { username: 'Mechile', bot: false }, content: 'Kunden anna.b@hotmail.com frågar om #5763. Password: hemligt', attachments: [] },
      { timestamp: '2026-09-22T05:00:00Z', author: { username: 'Bävern', bot: true }, content: 'Rapport', attachments: [] },
    ],
  };
  const fetchImpl = async (url) => {
    const stig = url.replace('https://discord.com/api/v10', '');
    return { ok: true, status: 200, json: async () => svar[stig] ?? [] };
  };
  const r = await hamtaEskalering([{ id: 'baverbutiken', namn: 'Bäverbutiken', discord: [{ server: 'Bäverbutiken', eskalering: ['customer-service'] }] }], { env: { DISCORD_BOT_TOKEN: 'x' }, fetchImpl });
  assert.equal(r.status, 'ok');
  assert.equal(r.kanaler.length, 1);
  const text = r.kanaler[0].meddelanden[0].text;
  assert.match(text, /an\*\*\*@hotmail\.com/);
  assert.ok(!text.includes('hemligt'));
  assert.equal(r.kanaler[0].meddelanden[1].bot, true);
});
