// Slack-vägarna utan nät: nyckeln i miljön avgör vägen, postaSlack skickar
// rätt kropp till rätt adress, och kön till connectorn läggs, åldras och kvitteras.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { slackVag, postaSlack, lasKo, laggIKo, kvittera } from '../posta.mjs';

const KONFIG = { kanal: { slack: { kanal: 'urgent', kanalId: 'C0C4MTQNMT7', bot_token_env: 'SLACK_BOT_TOKEN', webhook_env: 'SLACK_WEBHOOK_URL' } } };
const M = { text: '**🔴 ANNONSLARM**\n1. x [Öppna](https://a)', mrkdwn: '*🔴 ANNONSLARM*\n1. x <https://a|Öppna>' };

test('slackVag: bot före webhook, annars null', () => {
  assert.equal(slackVag({}, KONFIG), null);
  assert.equal(slackVag({ SLACK_WEBHOOK_URL: 'https://hooks' }, KONFIG), 'webhook');
  assert.equal(slackVag({ SLACK_WEBHOOK_URL: 'https://hooks', SLACK_BOT_TOKEN: 'xoxb' }, KONFIG), 'bot');
});

test('postaSlack: webhooken får mrkdwn som { text }; boten chat.postMessage med kanal-id; utan nyckel kastas', async () => {
  const anrop = [];
  const fetchFn = async (url, init) => { anrop.push({ url, init }); return { ok: true, json: async () => ({ ok: true, ts: '1.2' }), text: async () => '' }; };
  const w = await postaSlack(M, { env: { SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/x' }, konfig: KONFIG, fetchFn });
  assert.deepEqual(w, { ok: true, vag: 'webhook', ts: null });
  assert.equal(anrop[0].url, 'https://hooks.slack.com/services/x');
  assert.deepEqual(JSON.parse(anrop[0].init.body), { text: M.mrkdwn });

  const b = await postaSlack(M, { env: { SLACK_BOT_TOKEN: 'xoxb-1' }, konfig: KONFIG, fetchFn });
  assert.deepEqual(b, { ok: true, vag: 'bot', ts: '1.2' });
  assert.equal(anrop[1].url, 'https://slack.com/api/chat.postMessage');
  assert.equal(anrop[1].init.headers.Authorization, 'Bearer xoxb-1');
  assert.deepEqual(JSON.parse(anrop[1].init.body), { channel: 'C0C4MTQNMT7', text: M.mrkdwn, unfurl_links: false, unfurl_media: false });

  const nekad = async () => ({ ok: true, json: async () => ({ ok: false, error: 'not_in_channel' }), text: async () => '' });
  await assert.rejects(postaSlack(M, { env: { SLACK_BOT_TOKEN: 'xoxb-1' }, konfig: KONFIG, fetchFn: nekad }), /not_in_channel — bjud in appen i #urgent/);
  const trasig = async () => ({ ok: false, status: 404, json: async () => ({}), text: async () => 'no_service' });
  await assert.rejects(postaSlack(M, { env: { SLACK_WEBHOOK_URL: 'https://hooks' }, konfig: KONFIG, fetchFn: trasig }), /Slack-webhooken svarade 404: no_service/);
  await assert.rejects(postaSlack(M, { env: {}, konfig: KONFIG, fetchFn }), /ingen Slack-nyckel i miljön \(SLACK_BOT_TOKEN \/ SLACK_WEBHOOK_URL\)/);
});

test('kön: läggs med kanal-id, gamla rader faller bort efter ett dygn, kvittering tömmer och tar bort filen', () => {
  const mapp = mkdtempSync(join(tmpdir(), 'annonsvakt-ko-'));
  try {
    const fil = join(mapp, 'output', 'att-posta.json');
    const t1 = new Date('2026-09-29T05:44:00Z');
    const a = laggIKo(fil, M, { konfig: KONFIG, nu: t1 });
    assert.equal(a.id, 's202609290544');
    const ko = JSON.parse(readFileSync(fil, 'utf8'));
    assert.equal(ko.kanalId, 'C0C4MTQNMT7');
    assert.deepEqual(ko.meddelanden.map((m) => m.id), ['s202609290544']);

    const t2 = new Date('2026-09-29T06:44:00Z');
    const b = laggIKo(fil, { ...M, text: 'två' }, { konfig: KONFIG, nu: t2 });
    assert.equal(b.kvar, 2);
    assert.deepEqual(lasKo(fil, { nu: t2 }).meddelanden.map((m) => m.text), [M.text, 'två']);

    // Ett dygn senare är det första för gammalt — Discord har det, #urgent ska inte få gammal skåpmat.
    const t3 = new Date('2026-09-30T06:00:00Z');
    assert.deepEqual(lasKo(fil, { nu: t3 }).meddelanden.map((m) => m.id), ['s202609290644']);
    assert.deepEqual(laggIKo(fil, M, { konfig: KONFIG, nu: t3 }).kvar, 2, 'den gamla föll bort när kön skrevs om');

    const kv = kvittera(fil, ['s202609290644'], { nu: t3 });
    assert.deepEqual(kv, { kvitterade: ['s202609290644'], kvar: 1 });
    assert.equal(JSON.parse(readFileSync(fil, 'utf8')).kanalId, 'C0C4MTQNMT7', 'kanal-id:t överlever kvitteringen');
    assert.deepEqual(kvittera(fil, ['alla'], { nu: t3 }), { kvitterade: ['s202609300600'], kvar: 0 });
    assert.equal(existsSync(fil), false);
    assert.deepEqual(kvittera(fil, ['x'], { nu: t3 }), { kvitterade: [], kvar: 0 }, 'tom kö är inte ett fel');
  } finally { rmSync(mapp, { recursive: true, force: true }); }
});
