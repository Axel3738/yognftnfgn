// Bilderna i gallerierna. Artifact-visaren på claude.ai har en CSP som blockerar
// bilder från andra domäner (Shopifys CDN, butikens domän), och telefonramarna
// (iframe srcdoc) ärver den — så varje mejl i ett galleri visade trasiga bilder
// (Axels skärmdump 2026-09-25: "WHATAHELL … fixa alla direkt"). Därför:
//
//   1. varje bild-URL i de byggda mejlen hämtas EN gång och cachas i
//      output/<brand>/bilder/ (gitignorerat, index.json bär url → fil + typ),
//   2. i sidan byts src="https://…" mot src="bild:N" (platshållare), och
//   3. sidan bär varje bild EN gång som data-URI i ett JSON-block; ett litet
//      skript sätter in dem i varje telefonram vid laddning (data-srcdoc → srcdoc).
//
// Att bädda in bilderna statiskt i varje srcdoc mättes till 2–12 MB per sida
// (mallgalleriet 5,8 MB, bygg-galleriet 11,5 MB) — för tungt på en mobil. Med
// ett exemplar per sida landar sidorna på cirka 1 MB.
//
// En bild som inte går att hämta behåller sin riktiga URL i JSON-blocket, så
// sidan är aldrig sämre än förut — och hämtaren säger vilka som saknas.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const SRC = /src="(https?:\/\/[^"]+)"/g;
const avkoda = (u) => u.replace(/&amp;/g, '&');

export function bildUrlar(html) {
  const ut = new Set();
  for (const m of String(html).matchAll(SRC)) ut.add(avkoda(m[1]));
  return [...ut];
}

export function nyttRegister() {
  return { index: new Map(), lista: [] };
}

// Byter varje src="https://…" mot src="bild:N" och registrerar URL:en (avkodad).
export function medPlatshallare(html, register) {
  return String(html).replace(SRC, (_, ra) => {
    const url = avkoda(ra);
    if (!register.index.has(url)) {
      register.index.set(url, register.lista.length);
      register.lista.push(url);
    }
    return `src="bild:${register.index.get(url)}"`;
  });
}

const FILANDELSE = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/avif': 'avif' };

function lasIndex(cacheDir) {
  const fil = join(cacheDir, 'index.json');
  if (!existsSync(fil)) return {};
  try { return JSON.parse(readFileSync(fil, 'utf8')); } catch { return {}; }
}

// Hämtar varje URL en gång (cachen vinner), returnerar { bilder: Map<url, data-URI>, saknas: [{ url, orsak }] }.
export async function hamtaBilder({ urlar, cacheDir, fetchFn = globalThis.fetch, logg = () => {}, parallellt = 4 } = {}) {
  mkdirSync(cacheDir, { recursive: true });
  const index = lasIndex(cacheDir);
  const bilder = new Map();
  const saknas = [];
  const ko = [...new Set(urlar)];
  let hamtade = 0;

  async function en(url) {
    const post = index[url];
    if (post && existsSync(join(cacheDir, post.fil))) {
      bilder.set(url, `data:${post.typ};base64,${readFileSync(join(cacheDir, post.fil)).toString('base64')}`);
      return;
    }
    try {
      const svar = await fetchFn(url, { headers: { accept: 'image/*' } });
      const typ = String(svar.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase();
      if (!svar.ok) throw new Error(`HTTP ${svar.status}`);
      if (!typ.startsWith('image/')) throw new Error(`inte en bild (${typ || 'okänd typ'})`);
      const buf = Buffer.from(await svar.arrayBuffer());
      if (!buf.length) throw new Error('tom fil');
      const fil = `${createHash('sha1').update(url).digest('hex').slice(0, 16)}.${FILANDELSE[typ] ?? 'bin'}`;
      writeFileSync(join(cacheDir, fil), buf);
      index[url] = { fil, typ, bytes: buf.length, hamtad: new Date().toISOString() };
      bilder.set(url, `data:${typ};base64,${buf.toString('base64')}`);
      hamtade += 1;
    } catch (e) {
      saknas.push({ url, orsak: e.message });
      logg(`⚠️  bilden gick inte att hämta: ${url} (${e.message})`);
    }
  }

  // Några i taget — CDN:en tål det, och 15 bilder tar sekunder i stället för en halv minut.
  for (let i = 0; i < ko.length; i += parallellt) await Promise.all(ko.slice(i, i + parallellt).map(en));
  writeFileSync(join(cacheDir, 'index.json'), JSON.stringify(index, null, 2) + '\n');
  logg(`bilder: ${bilder.size} inbäddade (${hamtade} nyhämtade, ${bilder.size - hamtade} ur cachen)${saknas.length ? `, ${saknas.length} saknas` : ''}`);
  return { bilder, saknas };
}

// JSON-blocket + skriptet som fyller telefonramarna. Ramarna skrivs som
// <iframe data-srcdoc="…"> med platshållare; skriptet byter bild:N mot data-URI:n
// (eller den riktiga URL:en om bilden saknas) och sätter srcdoc. Höjden följer
// mejlets, så inget skrollas inuti ramen.
export function bildSkript(register, bilder = new Map()) {
  const lista = register.lista.map((url) => bilder.get(url) ?? url);
  // JSON i ett script-block: "</" får inte förekomma ograverat.
  const json = JSON.stringify(lista).replace(/<\//g, '<\\/');
  return `<script id="bilder" type="application/json">${json}</script>
<script>
  (function () {
    var BILDER = [];
    try { BILDER = JSON.parse(document.getElementById('bilder').textContent); } catch (e) {}
    var ramar = document.querySelectorAll('iframe[data-srcdoc]');
    for (var i = 0; i < ramar.length; i++) (function (f) {
      f.addEventListener('load', function () { try { var h = f.contentDocument.documentElement.scrollHeight; if (h > 200) f.style.height = h + 'px'; } catch (e) {} });
      f.srcdoc = f.getAttribute('data-srcdoc').replace(/src="bild:(\\d+)"/g, function (m, n) { return BILDER[n] ? 'src="' + BILDER[n] + '"' : m; });
      f.removeAttribute('data-srcdoc');
    })(ramar[i]);
  })();
</script>`;
}
