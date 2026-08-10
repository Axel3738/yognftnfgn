/**
 * Slack-koppling. Två lägen:
 *
 *   1. Incoming webhook  (SLACK_WEBHOOK_URL) — enklast, postar i EN kanal.
 *   2. Bot-token         (SLACK_BOT_TOKEN)   — kan posta i valfri kanal OCH
 *                                              skicka DM till enskilda redigerare.
 *
 * DM-påminnelser kräver läge 2 (scopes: chat:write, im:write).
 * `--dry` skriver ut exakt det som skulle skickats, utan att skicka.
 */

const SLACK_API = 'https://slack.com/api/chat.postMessage';

export function createSlackClient({ dryRun = false, env = process.env, logger = console } = {}) {
  const webhookUrl = env.SLACK_WEBHOOK_URL || null;
  const botToken = env.SLACK_BOT_TOKEN || null;

  const send = async ({ channel, text, blocks, label }) => {
    if (dryRun) {
      logger.log(`\n── [DRY] ${label || 'meddelande'} → ${channel || 'webhook-kanal'} ─────────────`);
      logger.log(text);
      logger.log(JSON.stringify({ channel, text, blocks }, null, 2));
      return { ok: true, dryRun: true };
    }

    if (botToken && channel) {
      return withRetry(async () => {
        const res = await fetch(SLACK_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            Authorization: `Bearer ${botToken}`,
          },
          body: JSON.stringify({ channel, text, blocks, unfurl_links: false }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok || !body.ok) {
          throw new Error(`Slack svarade ${res.status}: ${body.error || 'okänt fel'}`);
        }
        return body;
      });
    }

    if (webhookUrl) {
      if (channel && channel.startsWith('U')) {
        throw new Error(
          'DM kräver SLACK_BOT_TOKEN — en incoming webhook kan bara posta i sin egen kanal. ' +
            'Kör med --dry för att se meddelandet, eller sätt SLACK_BOT_TOKEN.',
        );
      }
      return withRetry(async () => {
        const res = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, blocks }),
        });
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw new Error(`Slack-webhook svarade ${res.status}: ${body.slice(0, 200)}`);
        }
        return { ok: true };
      });
    }

    throw new Error(
      'Ingen Slack-konfiguration hittades. Sätt SLACK_WEBHOOK_URL eller SLACK_BOT_TOKEN ' +
        '(eller kör kommandot med --dry).',
    );
  };

  return {
    configured: Boolean(webhookUrl || botToken),
    canDm: Boolean(botToken),
    mode: dryRun ? 'dry' : botToken ? 'bot' : webhookUrl ? 'webhook' : 'none',
    send,
  };
}

async function withRetry(fn, attempts = 4) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const transient = /\b(429|50\d)\b|fetch failed|ECONNRESET|ETIMEDOUT/.test(String(err.message));
      if (!transient || i === attempts - 1) throw err;
      await new Promise((r) => setTimeout(r, 2000 * 2 ** i));
    }
  }
  throw lastError;
}
