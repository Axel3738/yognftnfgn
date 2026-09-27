// akut/slack.mjs — postningen till #urgent.
//
// Huvudvägen är Slack-connectorn: rutinens session postar meddelandena i
// akut/output/att-posta.json med mcp__Slack__slack_send_message och kvitterar
// med `node akut/kor.mjs --postat <id …>`. Den vägen behöver ingen nyckel i
// miljön — Slack kopplades av Axel 2026-09-27 och rutinen får connectorn
// vid bygget.
//
// Reservvägen är en nyckel i miljön, om Axel någon gång lägger in en:
//   SLACK_BOT_TOKEN   — en Slack-app med chat:write, inbjuden i kanalen
//   SLACK_WEBHOOK_URL — en Incoming Webhook låst till kanalen
// Finns någon av dem postar kor.mjs själv (`--slack`), och sessionen slipper
// verktygsanropet. Texten är samma; bara fetstilen renderas olika.

export function slackVag(env = process.env) {
  if (env.SLACK_BOT_TOKEN) return 'bot';
  if (env.SLACK_WEBHOOK_URL) return 'webhook';
  return null;
}

/** Postar ETT meddelande. Svarar { ok, ts, vag } eller kastar med orsaken. */
export async function postaSlack(meddelande, { env = process.env, konfig, fetchFn = fetch } = {}) {
  const vag = slackVag(env);
  const kanalId = konfig?.slack?.kanalId;
  if (vag === 'bot') {
    if (!kanalId) throw new Error('akut/konfig.json saknar slack.kanalId');
    const r = await fetchFn('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`, 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ channel: kanalId, text: meddelande.mrkdwn, unfurl_links: false, unfurl_media: false }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.ok) throw new Error(`Slack svarade ${j.error ?? r.status}${j.error === 'not_in_channel' ? ' — bjud in appen i #urgent (/invite @appen)' : ''}`);
    return { ok: true, ts: j.ts ?? null, vag };
  }
  if (vag === 'webhook') {
    const r = await fetchFn(env.SLACK_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: meddelande.mrkdwn }) });
    if (!r.ok) throw new Error(`Slack-webhooken svarade ${r.status}`);
    return { ok: true, ts: null, vag };
  }
  throw new Error('ingen Slack-nyckel i miljön (SLACK_BOT_TOKEN / SLACK_WEBHOOK_URL) — posta via Slack-connectorn och kvittera med --postat');
}
