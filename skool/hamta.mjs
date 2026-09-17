#!/usr/bin/env node
// skool/hamta.mjs — hämtar en hel Skool-kurs (klassrum) ur Axels egen inloggade session:
// kursträdet, varje moduls text, videornas undertexter (Mux "English CC") och bilagorna.
//
//   node skool/hamta.mjs <klassrums-url> [--ut <mapp>] [--ljud]
//
// Kräver SKOOL_EMAIL + SKOOL_PASSWORD i miljön och Playwrights Chromium (globalt
// `playwright` + /opt/pw-browsers i claude.ai-containern). Inga npm-beroenden i repot.
//
// Utdata (standard skool/output/<grupp>/<kurs>/):
//   kurs.json                 hela strukturen + vad som hämtades per modul
//   moduler/NN-<slug>.md      modulens egen text (Skools [v2]-richtext → Markdown)
//   undertexter/NN-<slug>.vtt undertexten med tidkoder (råkällan till transkriptionen)
//   undertexter/NN-<slug>.txt samma text utan tidkoder, en rad
//   bilagor/<filnamn>         modulernas bilagor (PDF m.m.)
//   ljud/NN-<slug>.mp4        bara med --ljud: ljudspåret via yt-dlp (för Whisper)
//   RA-TRANSKRIPTION.md       allt ihopsatt i kursens ordning, ostädat
//
// Städningen (stycken, mellanrubriker, tidsstämplar) görs INTE här — den gör
// sessionen enligt .claude/commands/skool.md. Det här skriptet hittar aldrig på text.
//
// Kända fallgropar (mätt 2026-09-17):
// - api2.skool.com och Mux svarar 403 utan webbläsarens cookies (aws-waf-token) resp.
//   utan Referer https://www.skool.com/ — därför går allt genom Playwright-sessionen.
// - Nedladdningslänken för en bilaga hämtas med POST /files/<id>/download-url (GET ger 405)
//   och svaret är en JSON-sträng med den signerade URL:en.
// - Bakom claude.ai-proxyn måste Chromium lita på proxyns CA: flaggan
//   --ignore-certificate-errors-spki-list med CA-nyckelns SHA-256 (ingen allmän avstängning).

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const MUX_HEADERS = { Referer: 'https://www.skool.com/', Origin: 'https://www.skool.com' };

// ---------- argument ----------
const argv = process.argv.slice(2);
const url = argv.find(a => a.startsWith('http'));
const utArg = argv.includes('--ut') ? argv[argv.indexOf('--ut') + 1] : null;
const medLjud = argv.includes('--ljud');
if (!url) {
  console.error('Användning: node skool/hamta.mjs <klassrums-url> [--ut <mapp>] [--ljud]');
  process.exit(2);
}
if (!process.env.SKOOL_EMAIL || !process.env.SKOOL_PASSWORD) {
  console.error('SKOOL_EMAIL och SKOOL_PASSWORD saknas i miljön.');
  process.exit(2);
}
const u = new URL(url);
const [, grupp, , kursId] = u.pathname.split('/'); // /<grupp>/classroom/<kursId>
if (!grupp || !kursId) {
  console.error('Länken ska se ut som https://www.skool.com/<grupp>/classroom/<kurs-id>[?md=...]');
  process.exit(2);
}
const basUrl = `https://www.skool.com/${grupp}/classroom/${kursId}`;

// ---------- hjälpare ----------
function slug(s) {
  return String(s || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x00-\x7F]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'modul';
}
function nn(i) { return String(i).padStart(2, '0'); }

async function laddaPlaywright() {
  try { return await import('playwright'); } catch {}
  const rot = execSync('npm root -g', { encoding: 'utf8' }).trim();
  return await import(pathToFileURL(path.join(rot, 'playwright', 'index.mjs')).href);
}
function hittaChromium() {
  if (process.env.SKOOL_CHROMIUM) return process.env.SKOOL_CHROMIUM;
  const rot = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (!fs.existsSync(rot)) return undefined;
  const kand = fs.readdirSync(rot).filter(d => /^chromium-\d+$/.test(d)).sort().reverse();
  for (const d of kand) {
    const p = path.join(rot, d, 'chrome-linux', 'chrome');
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}
function proxyArgs() {
  const proxy = process.env.HTTPS_PROXY;
  const ca = '/root/.ccr/agent-proxy-ca.crt';
  if (!proxy || !fs.existsSync(ca)) return { args: [], proxy: undefined };
  const spki = execSync(`openssl x509 -in ${ca} -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64`, { encoding: 'utf8' }).trim();
  return { args: ['--ignore-certificate-errors-spki-list=' + spki], proxy: { server: proxy } };
}

// Skools richtext "[v2][...]" → Markdown. Okända noder lämnas som kommentar, aldrig tysta.
function inline(noder) {
  let ut = '';
  for (const n of noder || []) {
    if (n.type === 'text') {
      let s = n.text || '';
      for (const m of n.marks || []) {
        if (m.type === 'bold') s = `**${s}**`;
        else if (m.type === 'italic') s = `*${s}*`;
        else if (m.type === 'code') s = '`' + s + '`';
        else if (m.type === 'link') s = `[${s}](${m.attrs?.href || ''})`;
      }
      ut += s;
    } else if (n.type === 'hardBreak') ut += '  \n';
    else ut += inline(n.content);
  }
  return ut;
}
function block(n) {
  switch (n.type) {
    case 'heading': return '#'.repeat((n.attrs?.level || 2) + 1) + ' ' + inline(n.content) + '\n\n';
    case 'paragraph': return inline(n.content) + '\n\n';
    case 'unorderedList': case 'bulletList': return (n.content || []).map(li => '- ' + listItem(li)).join('') + '\n';
    case 'orderedList': return (n.content || []).map((li, i) => `${i + 1}. ` + listItem(li)).join('') + '\n';
    case 'blockquote': return (n.content || []).map(block).join('').trim().split('\n').map(l => '> ' + l).join('\n') + '\n\n';
    case 'horizontalRule': return '---\n\n';
    case 'codeBlock': return '```\n' + inline(n.content) + '\n```\n\n';
    default: return `<!-- okänd nod ${n.type}: ${JSON.stringify(n).slice(0, 200)} -->\n\n`;
  }
}
function listItem(li) {
  return (li.content || []).map(c => block(c).trim()).filter(Boolean).join('\n  ') + '\n';
}
function descTillMarkdown(desc) {
  if (!desc) return '';
  if (!desc.startsWith('[v2]')) return desc + '\n';
  let doc;
  try { doc = JSON.parse(desc.slice(4)); } catch { return desc + '\n'; }
  return doc.map(block).join('');
}

// Plattar kursträdet: rot + barn i ordning, med djup.
function platta(node, djup, lista) {
  const c = node.course;
  lista.push({ id: c.id, titel: c.metadata?.title || '', djup, metadata: c.metadata || {} });
  for (const ch of node.children || []) platta(ch, djup + 1, lista);
  return lista;
}

// Slår ihop WebVTT-segmenten från Mux till en cue-lista utan dubbletter.
function slaIhopVtt(delar) {
  const cues = []; const sett = new Set();
  for (const del of delar) {
    for (const b of del.split(/\n\s*\n/)) {
      const rader = b.split('\n').map(l => l.trim()).filter(Boolean);
      const ti = rader.findIndex(l => l.includes('-->'));
      if (ti < 0) continue;
      const tid = rader[ti].split(' ')[0];
      const text = rader.slice(ti + 1).join(' ').replace(/<[^>]+>/g, '').trim();
      const nyckel = rader[ti] + '|' + text;
      if (text && !sett.has(nyckel)) { sett.add(nyckel); cues.push({ tid, rad: rader[ti], text }); }
    }
  }
  return cues;
}

// ---------- körning ----------
const { chromium } = await laddaPlaywright();
const { args, proxy } = proxyArgs();
const browser = await chromium.launch({ executablePath: hittaChromium(), args: ['--no-sandbox', ...args], proxy });
const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();

async function nextData() {
  const s = await page.evaluate(() => document.getElementById('__NEXT_DATA__')?.textContent || '');
  if (!s) throw new Error('Ingen __NEXT_DATA__ på sidan ' + page.url());
  return JSON.parse(s).props.pageProps;
}

// 1. Logga in
await page.goto('https://www.skool.com/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(1500);
await page.locator('input[type="email"], input[name="email"]').first().fill(process.env.SKOOL_EMAIL);
const losen = page.locator('input[type="password"]').first();
await losen.fill(process.env.SKOOL_PASSWORD);
await Promise.all([
  page.waitForURL(x => !String(x).includes('/login'), { timeout: 60000 }).catch(() => {}),
  losen.press('Enter'),
]);
await page.waitForTimeout(2000);
const cookies = await ctx.cookies();
if (!cookies.some(c => c.name === 'auth_token')) {
  console.error('Inloggningen gav ingen auth_token — fel lösenord eller ändrad inloggningssida. URL nu: ' + page.url());
  await browser.close(); process.exit(1);
}
console.log('Inloggad på Skool.');

// 2. Kursträdet
await page.goto(basUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(3000);
let pp = await nextData();
if (!pp.course) {
  console.error('Sidan har ingen kurs (pageProps.course saknas) — är kontot medlem i gruppen och kursen? Hamnade på ' + page.url());
  await browser.close(); process.exit(1);
}
const kursRot = pp.course.course;
const kursTitel = kursRot.metadata?.title || kursId;
const moduler = platta(pp.course, 0, []).slice(1); // roten själv är kursen
console.log(`Kurs: ${kursTitel} — ${moduler.length} moduler`);

const ut = utArg || path.join('skool', 'output', grupp, slug(kursTitel));
for (const d of ['moduler', 'undertexter', 'bilagor']) fs.mkdirSync(path.join(ut, d), { recursive: true });
if (medLjud) fs.mkdirSync(path.join(ut, 'ljud'), { recursive: true });

// 3. Modul för modul
const resultat = [];
for (let i = 0; i < moduler.length; i++) {
  const m = moduler[i];
  const namn = `${nn(i + 1)}-${slug(m.titel)}`;
  const r = { nr: i + 1, id: m.id, titel: m.titel, djup: m.djup, fil: namn, text_tecken: 0, video: null, undertext: null, bilagor: [], noteringar: [] };
  await page.goto(`${basUrl}?md=${m.id}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  pp = await nextData();
  const vald = platta(pp.course, 0, []).find(x => x.id === m.id);
  const md = vald?.metadata || m.metadata;
  if (md.hasAccess === 0) r.noteringar.push('ingen åtkomst till modulen (hasAccess=0)');

  // text
  const text = descTillMarkdown(md.desc);
  fs.writeFileSync(path.join(ut, 'moduler', namn + '.md'), text);
  r.text_tecken = text.length;

  // video + undertext
  const v = pp.video;
  if (v?.playbackId) {
    r.video = { videoId: v.id, playbackId: v.playbackId, duration_ms: v.duration, status: v.status };
    const master = await (await ctx.request.get(`https://stream.mux.com/${v.playbackId}.m3u8?token=${v.playbackToken}`, { headers: MUX_HEADERS })).text();
    const spar = [...master.matchAll(/#EXT-X-MEDIA:TYPE=SUBTITLES[^\n]*?URI="([^"]+)"/g)].map(x => ({ rad: x[0], uri: x[1] }));
    const eng = spar.find(s => /LANGUAGE="en/i.test(s.rad)) || spar[0];
    if (!eng) {
      r.noteringar.push('videon har ingen undertext i Mux — ladda ner ljudet (--ljud) och transkribera med Whisper');
    } else {
      const spel = await (await ctx.request.get(eng.uri, { headers: MUX_HEADERS })).text();
      const segment = spel.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));
      const delar = [];
      for (const s of segment) {
        const su = s.startsWith('http') ? s : new URL(s, eng.uri).href;
        delar.push(await (await ctx.request.get(su, { headers: MUX_HEADERS })).text());
      }
      const cues = slaIhopVtt(delar);
      fs.writeFileSync(path.join(ut, 'undertexter', namn + '.vtt'), 'WEBVTT\n\n' + cues.map(c => `${c.rad}\n${c.text}`).join('\n\n') + '\n');
      const txt = cues.map(c => c.text).join(' ');
      fs.writeFileSync(path.join(ut, 'undertexter', namn + '.txt'), txt + '\n');
      r.undertext = { sprak: (eng.rad.match(/LANGUAGE="([^"]+)"/) || [])[1] || '?', cues: cues.length, ord: txt.split(/\s+/).filter(Boolean).length };
    }
    if (medLjud) {
      const mal = path.join(ut, 'ljud', namn + '.%(ext)s');
      try {
        execSync(`yt-dlp --no-warnings --add-header "Referer:https://www.skool.com/" --add-header "Origin:https://www.skool.com" --user-agent "${UA}" -f bestaudio/best --hls-prefer-native -o "${mal}" "https://stream.mux.com/${v.playbackId}.m3u8?token=${v.playbackToken}"`, { stdio: 'pipe' });
        r.ljud = fs.readdirSync(path.join(ut, 'ljud')).find(f => f.startsWith(namn)) || null;
      } catch (e) { r.noteringar.push('yt-dlp misslyckades: ' + String(e.message).slice(0, 200)); }
    }
  } else if (md.videoLink) {
    r.video = { extern: md.videoLink };
    r.noteringar.push('extern video (' + md.videoLink + ') — hämtas inte av det här skriptet');
  }

  // bilagor — Skool lagrar `resources` som en JSON-STRÄNG i metadata, inte som en lista
  let resurser = md.resources || [];
  if (typeof resurser === 'string') { try { resurser = JSON.parse(resurser); } catch { resurser = []; } }
  if (!Array.isArray(resurser)) resurser = [];
  for (const res of resurser) {
    if (!res || typeof res !== 'object') continue;
    if (!res.file_id) { r.bilagor.push({ titel: res.title || null, lank: res.link || res.url || null }); continue; }
    try {
      const svar = await page.evaluate(async id => {
        const x = await fetch(`https://api2.skool.com/files/${id}/download-url?expire=28800`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' });
        return { status: x.status, body: await x.text() };
      }, res.file_id);
      // Svaret är en bar URL (mätt 2026-09-17), men tål även JSON {"url": …} eller en JSON-sträng.
      let lank = null; const kropp = (svar.body || '').trim();
      if (/^https?:\/\//.test(kropp)) lank = kropp;
      else { try { const j = JSON.parse(kropp); lank = typeof j === 'string' ? j : (j.url || j.download_url || null); } catch {} }
      if (!lank) throw new Error(`download-url gav ${svar.status}: ${kropp.slice(0, 120)}`);
      const fil = await ctx.request.get(lank);
      const filnamn = (res.file_name || res.title || res.file_id).replace(/[\/\\]/g, '_');
      fs.writeFileSync(path.join(ut, 'bilagor', filnamn), await fil.body());
      r.bilagor.push({ titel: res.title, fil: filnamn, typ: res.file_content_type || null });
    } catch (e) { r.noteringar.push(`bilagan "${res.title}" kunde inte hämtas: ${String(e.message).slice(0, 200)}`); }
  }

  const minuter = r.video?.duration_ms ? ` · ${Math.round(r.video.duration_ms / 60000)} min` : '';
  console.log(`${nn(i + 1)} ${m.titel}${minuter} · text ${r.text_tecken} tecken · undertext ${r.undertext ? r.undertext.ord + ' ord' : '–'} · bilagor ${r.bilagor.length}${r.noteringar.length ? ' · ⚠️ ' + r.noteringar.join('; ') : ''}`);
  resultat.push(r);
}
await browser.close();

// 4. kurs.json + RA-TRANSKRIPTION.md
const kurs = { hamtad: new Date().toISOString(), kalla: basUrl, grupp, kurs_id: kursId, titel: kursTitel, beskrivning: descTillMarkdown(kursRot.metadata?.desc), moduler: resultat };
fs.writeFileSync(path.join(ut, 'kurs.json'), JSON.stringify(kurs, null, 1));

let ra = `# ${kursTitel}\n\nKälla: ${basUrl} · hämtad ${kurs.hamtad.slice(0, 10)}\n\n${kurs.beskrivning}\n`;
for (const r of resultat) {
  ra += `\n---\n\n${'#'.repeat(Math.min(r.djup + 1, 4))} ${r.titel}\n\n`;
  const text = fs.readFileSync(path.join(ut, 'moduler', r.fil + '.md'), 'utf8');
  if (text.trim()) ra += text + '\n';
  if (r.video?.duration_ms) ra += `*Video, ${Math.round(r.video.duration_ms / 60000)} min.*\n\n`;
  if (r.undertext) ra += fs.readFileSync(path.join(ut, 'undertexter', r.fil + '.txt'), 'utf8') + '\n';
  for (const b of r.bilagor) ra += `Bilaga: ${b.titel}${b.fil ? ` (bilagor/${b.fil})` : b.lank ? ` (${b.lank})` : ''}\n\n`;
  for (const n of r.noteringar) ra += `⚠️ ${n}\n\n`;
}
fs.writeFileSync(path.join(ut, 'RA-TRANSKRIPTION.md'), ra);

const totMin = resultat.reduce((s, r) => s + (r.video?.duration_ms || 0), 0) / 60000;
const utanCc = resultat.filter(r => r.video && !r.undertext && !r.video.extern);
console.log(`\nKlart → ${ut}\n${resultat.length} moduler, ${resultat.filter(r => r.video).length} videor (${Math.round(totMin)} min), ${resultat.filter(r => r.undertext).length} med undertext, ${resultat.reduce((s, r) => s + r.bilagor.length, 0)} bilagor.`);
if (utanCc.length) console.log(`⚠️ ${utanCc.length} video(r) utan undertext: ${utanCc.map(r => r.titel).join(', ')} — kör om med --ljud och transkribera med Whisper.`);
