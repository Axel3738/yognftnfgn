#!/usr/bin/env node
// Lokalisering av videoannonser via HeyGen video translate.
// Kräver env: HEYGEN_API_KEY (skapas på app.heygen.com → Settings → API).
//
// Kommandon:
//   node localize.mjs check                     – verifiera API-nyckeln (kvar-kvot)
//   node localize.mjs langs                     – lista språk som stöds
//   node localize.mjs translate <videoUrl> <språk> [--title=...]
//   node localize.mjs status <videoTranslateId> – kolla jobbstatus + hämta output-URL

const API = 'https://api.heygen.com';

function apiKey() {
  const key = process.env.HEYGEN_API_KEY || process.env.KEY;
  if (!key) {
    throw new Error('Saknar HEYGEN_API_KEY i miljön. Skapa nyckeln på app.heygen.com → Settings → API.');
  }
  if (!process.env.HEYGEN_API_KEY) {
    console.warn('⚠️  Hittade nyckeln i env-variabeln KEY — döp om den till HEYGEN_API_KEY i environment-inställningarna.');
  }
  return key;
}

async function heygen(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'X-Api-Key': apiKey(),
      'Accept': 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  if (!res.ok) {
    throw new Error(`HeyGen svarade ${res.status} på ${path}: ${json?.error?.message ?? json?.message ?? text.slice(0, 300)}`);
  }
  return json;
}

async function check() {
  const q = await heygen('GET', '/v1/user/remaining_quota');
  console.log('✅ HeyGen-kopplingen funkar.');
  console.log(`   Kvar-kvot: ${JSON.stringify(q?.data ?? q)}`);
}

async function langs() {
  const r = await heygen('GET', '/v2/video_translate/target_languages');
  const list = r?.data?.languages ?? [];
  if (!list.length) {
    console.log('Inga språk i svaret:', JSON.stringify(r));
    return;
  }
  console.log(`${list.length} språk stöds för video translate:\n`);
  for (const lang of list) console.log(`  ${lang}`);
}

async function translate(videoUrl, language, { title } = {}) {
  if (!videoUrl || !language) {
    throw new Error('Användning: node localize.mjs translate <videoUrl> <språk> [--title=...]');
  }
  const r = await heygen('POST', '/v2/video_translate', {
    video_url: videoUrl,
    output_language: language,
    ...(title ? { title } : {}),
  });
  const id = r?.data?.video_translate_id;
  console.log(`🚀 Översättning startad: ${id}`);
  console.log(`   Kolla status: node localize.mjs status ${id}`);
}

async function status(id) {
  if (!id) throw new Error('Användning: node localize.mjs status <videoTranslateId>');
  const r = await heygen('GET', `/v2/video_translate/${id}`);
  const d = r?.data ?? r;
  console.log(`Status: ${d?.status}`);
  if (d?.url) console.log(`Output: ${d.url}`);
  if (d?.message) console.log(`Meddelande: ${d.message}`);
}

const [cmd, ...rest] = process.argv.slice(2);
const flags = Object.fromEntries(rest.filter(a => a.startsWith('--')).map(a => a.slice(2).split(/=(.*)/s).slice(0, 2)));
const args = rest.filter(a => !a.startsWith('--'));

const commands = { check, langs, translate: (u, l) => translate(u, l, flags), status };

try {
  const fn = commands[cmd];
  if (!fn) {
    console.log('Kommandon: check | langs | translate <videoUrl> <språk> | status <id>');
    process.exit(cmd ? 1 : 0);
  }
  await fn(...args);
} catch (err) {
  console.error(`❌ ${err.message}`);
  if (/fetch failed|CONNECT|403/.test(String(err.cause ?? err.message))) {
    console.error('   (Nätverksfel — kontrollera att api.heygen.com är tillåten i environmentets nätverkspolicy.)');
  }
  process.exit(1);
}
