// Hela körningen utan nät: falsk Meta-klient, falsk Discord. Bevisar att
// minnet skrivs bara när något ändrats, att ett larm sägs en gång, att det
// löses med ✅, att en misslyckad post INTE skriver minnet (larmas igen), och
// att torrt varken postar eller skriver.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, cpSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { kor, facitKonton, lasVerksamheter } from '../kor.mjs';
import { kvittera } from '../posta.mjs';

const HAR = new URL('.', import.meta.url).pathname;
const NU = new Date('2026-09-27T14:44:00Z'); // 16:44 i Stockholm — efter hjärtslagstimmen

function miljo() {
  const rot = mkdtempSync(join(tmpdir(), 'annonsvakt-'));
  mkdirSync(join(rot, 'stonebite'), { recursive: true });
  writeFileSync(join(rot, 'stonebite', 'varumarken.json'), JSON.stringify({ varumarken: [
    { id: 'baverbutiken', namn: 'Bäverbutiken', konton: [{ id: '1', namn: 'MagiBorsten' }, { id: '2', namn: 'Magiborsten UK' }] },
    { id: 'carashell', namn: 'CaraShell', konton: [{ id: '2', namn: 'Magiborsten UK' }] },
  ] }));
  const mapp = join(rot, 'annonsvakt');
  mkdirSync(mapp);
  cpSync(join(HAR, '..', 'konfig.json'), join(mapp, 'konfig.json'));
  return { rot, mapp, minnesfil: join(mapp, 'minne.json') };
}

const konto = (id, name, extra = {}) => ({ account_id: id, name, currency: 'SEK', account_status: 1, disable_reason: 0, ...extra });
const KAMP = { id: 'k1', name: 'Bälteslipmaskinen | BE ROAS 1.73 | Launch 2026-08-21', status: 'ACTIVE', effective_status: 'ACTIVE', daily_budget: '200000' };
const AVVISAD = { id: 'a1', name: 'Beltgrinder_REV_2_1', status: 'ACTIVE', effective_status: 'DISAPPROVED', updated_time: '2026-09-27T10:00:00+0200', ad_review_feedback: { global: { 'Unacceptable Business Practices': 'x' } }, campaign: { id: 'k1', name: KAMP.name, status: 'ACTIVE', effective_status: 'ACTIVE' }, adset: { id: 's1', name: 'REV', status: 'ACTIVE', effective_status: 'ACTIVE' } };
const RAD = { ad_id: 'a2', ad_name: 'Beltgrinder_PD_1_H1', adset_id: 's1', adset_name: 'PD', campaign_id: 'k1', campaign_name: KAMP.name, spend: '412.50', actions: [{ action_type: 'omni_purchase', value: '2' }], purchase_roas: [{ action_type: 'omni_purchase', value: '2.4' }] };

/** Falsk klient: svar per sökvägsprefix. Okänd sökväg ⇒ Meta-fel (#200). */
function klient(svar) {
  const fel = (p) => { const e = new Error(`Meta ${p.split('?')[0]}: (200) (#200) Ad account owner has NOT grant ads_management or ads_read permission`); e.meta = { code: 200, message: e.message }; throw e; };
  const slaUpp = (p) => { const k = Object.keys(svar).find((x) => p.startsWith(x)); return k === undefined ? fel(p) : (typeof svar[k] === 'function' ? svar[k]() : svar[k]); };
  return { get: async (p) => slaUpp(p), allaSidor: async (p) => { const v = slaUpp(p); return Array.isArray(v) ? v : (v.data ?? []); } };
}

const STANDARD = {
  'me/adaccounts': [konto('1', 'MagiBorsten'), konto('2', 'Magiborsten UK')],
  'act_1/ads': [AVVISAD], 'act_1/campaigns': [KAMP], 'act_1/adsets': [], 'act_1/insights': [RAD],
  'act_2/ads': [], 'act_2/campaigns': [], 'act_2/adsets': [], 'act_2/insights': [],
};

test('facit = registrets konton + minnets, utan dubbletter', () => {
  const { rot } = miljo();
  const v = lasVerksamheter(rot);
  assert.deepEqual(v.get('2'), { namn: 'Magiborsten UK', verksamheter: ['Bäverbutiken', 'CaraShell'] });
  const f = facitKonton(v, { konton: { 2: { namn: 'UK' }, 3: { namn: 'Gammalt' } } });
  assert.deepEqual(f.map((x) => x.id), ['1', '2', '3']);
});

test('skarpt: larmet postas en gång med ping, minnet skrivs; nästa timme tystnad; sen ✅ när annonsen är rättad', async () => {
  const { rot, mapp, minnesfil } = miljo();
  const skickat = [];
  const sand = async (text, mentions) => { skickat.push({ text, mentions }); return { server: 'Bäverbutiken', kanal: 'ad-alerts', skapad: true, meddelandeId: 'm1' }; };
  const logg = () => {};

  const r1 = await kor({ rot, mapp, env: { META_ACCESS_TOKEN: 'x', DISCORD_BOT_TOKEN: 'y' }, nu: NU, torr: false, posta: true, klient: klient(STANDARD), sand, logg });
  assert.equal(r1.tokenFel, null);
  assert.equal(r1.konton.length, 2);
  assert.deepEqual(r1.nya.map((p) => p.nyckel), ['annons:a1:DISAPPROVED']);
  assert.equal(skickat.length, 1);
  assert.match(skickat[0].text, /🔴 \*\*AD ALERT/);
  assert.match(skickat[0].text, /Beltgrinder_REV_2_1.*DISAPPROVED by Meta — `Unacceptable Business Practices`/);
  assert.match(skickat[0].text, /💓 Daily check .*: 2 ad accounts read, 1 open problem\./);
  assert.deepEqual(skickat[0].mentions, ['1469423029783236689', '1543537450335477836']);
  assert.equal(r1.minneSkrivet, true);
  assert.equal(r1.slack.ok, false, 'ingen Slack-nyckel i miljön');
  assert.equal(r1.slack.vag, 'connector');
  assert.match(r1.slackText, /^\*\*🔴 ANNONSLARM · 27 sep 16:44\*\*\n1\. Annonsen `Beltgrinder_REV_2_1` i `Bälteslipmaskinen \| BE ROAS 1\.73 \| Launch 2026-08-21` är AVVISAD av Meta \(`Unacceptable Business Practices`\)\./);
  assert.ok(!r1.slackText.includes('💓'), 'hjärtslaget går aldrig till Slack');
  const ko = JSON.parse(readFileSync(join(mapp, 'output', 'att-posta.json'), 'utf8'));
  assert.equal(ko.kanalId, 'C0C4MTQNMT7');
  assert.deepEqual(ko.meddelanden.map((m) => m.id), [r1.slack.koad]);
  assert.equal(ko.meddelanden[0].text, r1.slackText);
  assert.match(ko.meddelanden[0].mrkdwn, /^\*🔴 ANNONSLARM/);
  const m1 = JSON.parse(readFileSync(minnesfil, 'utf8'));
  assert.ok(m1.oppna['annons:a1:DISAPPROVED']);
  assert.equal(m1.oppna['annons:a1:DISAPPROVED'].konto, '1');
  assert.equal(m1.oppna['annons:a1:DISAPPROVED'].rubrikSv, 'Annonsen `Beltgrinder_REV_2_1` AVVISAD');
  assert.deepEqual(Object.keys(m1.konton).sort(), ['1', '2']);
  assert.equal(m1.hjartslag, '2026-09-27');

  // En timme senare, samma läge: inget postas, minnet rörs inte.
  const r2 = await kor({ rot, mapp, env: { META_ACCESS_TOKEN: 'x', DISCORD_BOT_TOKEN: 'y' }, nu: new Date(NU.getTime() + 3_600_000), torr: false, posta: true, klient: klient(STANDARD), sand, logg });
  assert.equal(r2.text, null);
  assert.equal(skickat.length, 1);
  assert.equal(r2.minneAndrat, false);
  assert.equal(r2.minneSkrivet, false);

  // En timme senare, samma läge: inget postas, minnet rörs inte — och kön har kvar det opostade Slack-meddelandet.
  assert.deepEqual(JSON.parse(readFileSync(join(mapp, 'output', 'att-posta.json'), 'utf8')).meddelanden.map((m) => m.id), [r1.slack.koad]);

  // Två timmar senare är annonsen rättad: ✅ utan ping, minnet tömt — och ✅ även i Slack, på svenska, i kön efter det första.
  const r3 = await kor({ rot, mapp, env: { META_ACCESS_TOKEN: 'x', DISCORD_BOT_TOKEN: 'y' }, nu: new Date(NU.getTime() + 7_200_000), torr: false, posta: true, klient: klient({ ...STANDARD, 'act_1/ads': [] }), sand, logg });
  assert.deepEqual(r3.losta.map((l) => l.nyckel), ['annons:a1:DISAPPROVED']);
  assert.equal(skickat.length, 2);
  assert.match(skickat[1].text, /✅ \*\*Resolved since last check\*\*\n• Ad `Beltgrinder_REV_2_1` DISAPPROVED — no longer flagged by Meta\./);
  assert.deepEqual(skickat[1].mentions, []);
  assert.deepEqual(JSON.parse(readFileSync(minnesfil, 'utf8')).oppna, {});
  assert.equal(r3.slackText, '**✅ Löst · 27 sep 18:44**\n• Annonsen `Beltgrinder_REV_2_1` AVVISAD: borta ur Meta, inget mer att göra.');
  const ko3 = JSON.parse(readFileSync(join(mapp, 'output', 'att-posta.json'), 'utf8'));
  assert.deepEqual(ko3.meddelanden.map((m) => m.id), [r1.slack.koad, r3.slack.koad]);

  // Sessionen postar via connectorn och kvitterar: kön töms och filen försvinner.
  const kv = kvittera(join(mapp, 'output', 'att-posta.json'), [r1.slack.koad, r3.slack.koad]);
  assert.deepEqual(kv, { kvitterade: [r1.slack.koad, r3.slack.koad], kvar: 0 });
  assert.equal(existsSync(join(mapp, 'output', 'att-posta.json')), false);
});

test('misslyckad post skriver INTE minnet — larmet kommer igen nästa timme; torrt varken postar eller skriver', async () => {
  const { rot, mapp, minnesfil } = miljo();
  const logg = () => {};
  const r = await kor({ rot, mapp, env: { META_ACCESS_TOKEN: 'x', DISCORD_BOT_TOKEN: 'y' }, nu: NU, torr: false, posta: true, klient: klient(STANDARD), sand: async () => { throw new Error('Discord 403 på /channels/x/messages'); }, logg });
  assert.match(r.postFel, /Discord 403/);
  assert.equal(r.minneSkrivet, false);
  assert.equal(existsSync(minnesfil), false);

  let anrop = 0;
  const t = await kor({ rot, mapp, env: { META_ACCESS_TOKEN: 'x', DISCORD_BOT_TOKEN: 'y' }, nu: NU, torr: true, posta: true, klient: klient(STANDARD), sand: async () => { anrop += 1; return {}; }, logg });
  assert.equal(anrop, 0);
  assert.equal(t.torr, true);
  assert.match(t.text, /AD ALERT/);
  assert.equal(existsSync(minnesfil), false);
});

test('ett konto i facit som token:en inte längre når larmas 🔴; ett konto vars annonser inte gick att läsa blir 🟡 lasfel och löser sig själv', async () => {
  const { rot, mapp } = miljo();
  const skickat = [];
  const sand = async (text, mentions) => { skickat.push({ text, mentions }); return {}; };
  const logg = () => {};
  // Konto 2 borta ur listan och svarar #200 direkt; konto 1:s annonser svarar fel.
  const trasig = klient({ 'me/adaccounts': [konto('1', 'MagiBorsten')], 'act_1/campaigns': [KAMP], 'act_1/adsets': [], 'act_1/insights': [RAD] });
  const r = await kor({ rot, mapp, env: { META_ACCESS_TOKEN: 'x', DISCORD_BOT_TOKEN: 'y' }, nu: NU, torr: false, posta: true, klient: trasig, sand, logg });
  assert.deepEqual(r.olasta.map((o) => o.id), ['2']);
  assert.deepEqual(r.nya.map((p) => p.nyckel).sort(), ['konto:1:lasfel', 'konto:2:oatkomlig']);
  assert.match(skickat[0].text, /Ad account `Magiborsten UK` \(2, Bäverbutiken \/ CaraShell\) can no longer be read/);
  assert.match(skickat[0].text, /🟡 \*\*Warnings.*\n• Could not read the ads in `MagiBorsten`/s);
  assert.deepEqual(skickat[0].mentions, ['1469423029783236689', '1543537450335477836']);

  // Nästa timme svarar allt igen: båda löses, den avvisade annonsen i konto 1 larmas nu.
  const r2 = await kor({ rot, mapp, env: { META_ACCESS_TOKEN: 'x', DISCORD_BOT_TOKEN: 'y' }, nu: new Date(NU.getTime() + 3_600_000), torr: false, posta: true, klient: klient(STANDARD), sand, logg });
  assert.deepEqual(r2.losta.map((l) => l.nyckel).sort(), ['konto:1:lasfel', 'konto:2:oatkomlig']);
  assert.deepEqual(r2.nya.map((p) => p.nyckel), ['annons:a1:DISAPPROVED']);
});

test('död token: ett enda 🔴, inget löses, kontona läses inte', async () => {
  const { rot, mapp, minnesfil } = miljo();
  writeFileSync(minnesfil, JSON.stringify({ konton: { 1: { namn: 'MagiBorsten' } }, oppna: { 'annons:a1:DISAPPROVED': { typ: 'annons', niva: 'rod', rubrik: 'x', konto: '1', forst: '2026-09-20T00:00:00Z', larmat: '2026-09-27T14:00:00Z' } }, handelser: [], hjartslag: '2026-09-27' }));
  const skickat = [];
  const dod = { get: async () => { const e = new Error('Meta me/adaccounts: (190) Error validating access token: Session has expired'); e.meta = { code: 190, message: 'Error validating access token: Session has expired' }; throw e; } };
  dod.allaSidor = dod.get;
  const r = await kor({ rot, mapp, env: { META_ACCESS_TOKEN: 'x', DISCORD_BOT_TOKEN: 'y' }, nu: NU, torr: false, posta: true, klient: dod, sand: async (text, mentions) => { skickat.push({ text, mentions }); return {}; }, logg: () => {} });
  assert.match(r.tokenFel, /Session has expired/);
  assert.deepEqual(r.nya.map((p) => p.nyckel), ['token:ogiltig']);
  assert.deepEqual(r.losta, []);
  assert.match(skickat[0].text, /The Meta token \(META_ACCESS_TOKEN\) no longer works/);
  assert.ok(JSON.parse(readFileSync(minnesfil, 'utf8')).oppna['annons:a1:DISAPPROVED'], 'det gamla problemet står kvar — vi vet inget om det');
});

test('Slack får det röda på svenska när nyckeln finns; ett Slack-fel stoppar inte Discord utan lägger texten i kön', async () => {
  const { rot, mapp } = miljo();
  const slack = [];
  const r = await kor({ rot, mapp, env: { META_ACCESS_TOKEN: 'x', DISCORD_BOT_TOKEN: 'y', SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/x' }, nu: NU, torr: false, posta: true, klient: klient(STANDARD), sand: async () => ({}), sandSlack: async (m) => { slack.push(m); return { vag: 'webhook', ts: null }; }, logg: () => {} });
  assert.equal(slack.length, 1);
  assert.match(slack[0].mrkdwn, /^\*🔴 ANNONSLARM · 27 sep 16:44\*\n1\. Annonsen `Beltgrinder_REV_2_1` .* <https:\/\/adsmanager\.facebook\.com\/adsmanager\/manage\/ads\?act=1&selected_ad_ids=a1\|Öppna i Ads Manager>/);
  assert.deepEqual(r.slack, { ok: true, vag: 'webhook', ts: null });
  assert.equal(r.slackVag, 'webhook');
  assert.equal(existsSync(join(mapp, 'output', 'att-posta.json')), false, 'postat ⇒ ingen kö');

  const { rot: rot2, mapp: mapp2 } = miljo();
  const r2 = await kor({ rot: rot2, mapp: mapp2, env: { META_ACCESS_TOKEN: 'x', DISCORD_BOT_TOKEN: 'y', SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/x' }, nu: NU, torr: false, posta: true, klient: klient(STANDARD), sand: async () => ({}), sandSlack: async () => { throw new Error('Slack svarade 404'); }, logg: () => {} });
  assert.equal(r2.slack.ok, false);
  assert.match(r2.slack.fel, /404/);
  assert.equal(r2.minneSkrivet, true, 'Discord gick — minnet skrivs trots Slack-felet');
  assert.deepEqual(JSON.parse(readFileSync(join(mapp2, 'output', 'att-posta.json'), 'utf8')).meddelanden.map((m) => m.id), [r2.slack.koad], 'det som inte gick iväg ligger i kön');
});
