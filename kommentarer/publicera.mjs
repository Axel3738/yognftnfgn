#!/usr/bin/env node
// Publicerar de svar Axel godkänt på granskningssidan som svar i kommentarsfältet.
// Axels beslut 2026-09-25 ("vi ska bara publicera dem nu då"). Bara rader där
// Axel tryckt Ja på den AKTUELLA versionen av svaret publiceras.
//
//   node kommentarer/publicera.mjs --svar <godkanda.json>          # torrt: visar vad som skulle postas
//   node kommentarer/publicera.mjs --svar <godkanda.json> --skarpt # postar
//
// <godkanda.json> = [{ id, svar }] — sessionen skriver den ur granskningssidans
// samlingar (kommentarer + beslut). Sidan (page) slås upp i loggen
// kommentarer/logg/<månad>.jsonl, aldrig gissas.
//
// Spärrar:
//  - Varje postat svar skrivs i kommentarer/svar-publicerade.jsonl. Ett id som
//    redan står där postas aldrig igen (omkörning = inga dubbletter).
//  - Innan ett svar postas läses tråden: har sidan redan svarat där, hoppas den.
//  - Facebook: POST /<kommentar>/comments. Instagram: POST /<ig-kommentar>/replies.
//    Båda med sidans egen token, så svaret kommer från sidan, inte från Axel.
//  - RÄTT SIDA (Axels krav 2026-09-25: "på CaraShells annons svarar du från
//    CaraShells sida, på Bäverbutikens från Bäverbutikens"): sidan måste vara den
//    som äger annonsinlägget (inläggets id börjar med sidans id), sidan måste höra
//    till radens verksamhet i konfig.json → sidor, och raden får inte bära en
//    konflikt länk ↔ sida. Annars postas inget. Efter postning läses svaret
//    tillbaka och avsändaren (from.id) måste vara sidan.
//  - FÖRSTA RUNDAN (Axels krav 2026-09-25): en sida som aldrig fått ett
//    publicerat svar kräver --granskad, alltså att Axel har gått igenom
//    rundan på granskningssidan först. Utan flaggan hoppas sidans rader.
import { readFileSync, readdirSync, appendFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { V } from './meta.mjs';
import { felSida } from './sida.mjs';

const HAR = dirname(fileURLToPath(import.meta.url));
const GRAPH = `https://graph.facebook.com/${V}`;
const LOGG = join(HAR, 'svar-publicerade.jsonl');
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const skarpt = process.argv.includes('--skarpt');
const granskad = process.argv.includes('--granskad');
const konfig = JSON.parse(readFileSync(join(HAR, 'konfig.json'), 'utf8'));
const token = process.env.META_ACCESS_TOKEN;
if (!token) { console.error('META_ACCESS_TOKEN saknas'); process.exit(1); }

const svar = JSON.parse(readFileSync(arg('--svar'), 'utf8'));
const rader = new Map();
for (const f of readdirSync(join(HAR, 'logg')).filter((f) => f.endsWith('.jsonl'))) {
  for (const l of readFileSync(join(HAR, 'logg', f), 'utf8').split('\n')) {
    if (!l.trim()) continue;
    try { const r = JSON.parse(l); rader.set(r.id, r); } catch {}
  }
}
const publicerade = existsSync(LOGG) ? readFileSync(LOGG, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];
const redan = new Set(publicerade.map((p) => p.id));
const sidorMedSvar = new Set(publicerade.map((p) => p.sida));


async function anrop(sokvag, tok, metod = 'GET', body = null) {
  const url = `${GRAPH}/${sokvag}${sokvag.includes('?') ? '&' : '?'}access_token=${encodeURIComponent(tok)}`;
  const res = await fetch(url, metod === 'GET' ? {} : { method: metod, body: new URLSearchParams(body) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.error) throw new Error(`(${j.error?.code ?? res.status}) ${j.error?.message ?? 'okänt fel'}`);
  return j;
}

const sidtoken = new Map();
const sidnamn = new Map();
async function tokenFor(sida) {
  if (!sidtoken.has(sida)) {
    const j = await anrop(`${sida}?fields=access_token,name`, token);
    sidtoken.set(sida, j.access_token);
    sidnamn.set(sida, j.name);
  }
  return sidtoken.get(sida);
}

let postade = 0, hoppade = 0, fel = 0;
for (const { id, svar: text } of svar) {
  const r = rader.get(id);
  const kort = `${id} "${String(text).slice(0, 60)}"`;
  if (!r) { console.log(`⚠️ ${kort}: finns inte i loggen — hoppar`); hoppade++; continue; }
  if (redan.has(id)) { console.log(`= ${kort}: redan publicerat`); hoppade++; continue; }
  if (!text || /^\(Inget svar/.test(text)) { console.log(`- ${kort}: inget svar att posta`); hoppade++; continue; }
  if (/[—–]/.test(text)) { console.log(`⛔ ${kort}: tankstreck i svaret — hoppar`); hoppade++; continue; }
  const fs = felSida(r, konfig.sidor);
  if (fs) { console.log(`⛔ ${kort}: fel sida — ${fs}`); hoppade++; continue; }
  if (skarpt && !granskad && !sidorMedSvar.has(r.sida)) {
    console.log(`⛔ ${kort}: första svarsrundan någonsin på sidan ${r.sida} (${r.verksamhet}) — kör torrt, låt Axel granska, kör sedan med --granskad`);
    hoppade++; continue;
  }
  try {
    const tok = await tokenFor(r.sida);
    const fran = `från sidan "${sidnamn.get(r.sida)}" (${r.sida})`;
    const ig = r.kanal === 'instagram';
    const mal = ig ? id.replace(/^ig_/, '') : id;
    // Har sidan redan svarat i tråden?
    const tråd = ig
      ? await anrop(`${mal}/replies?fields=username,text&limit=50`, tok)
      : await anrop(`${mal}/comments?fields=from{id},message&limit=50`, tok);
    const sidanSvarat = (tråd.data ?? []).some((x) => ig ? false : x.from?.id === r.sida);
    if (sidanSvarat) { console.log(`= ${kort}: sidan har redan svarat i tråden`); hoppade++; continue; }
    if (!skarpt) { console.log(`(torrt) ${r.verksamhet}/${r.kanal} ${fran} på annonsen ${r.annons ?? '?'} → ${kort}`); continue; }
    const ut = ig
      ? await anrop(`${mal}/replies`, tok, 'POST', { message: text })
      : await anrop(`${mal}/comments`, tok, 'POST', { message: text });
    // Tillbakaläsning: kom svaret från rätt sida?
    let avsandare = null;
    if (!ig) { try { avsandare = (await anrop(`${ut.id}?fields=from{id,name}`, tok)).from?.id ?? null; } catch {} }
    appendFileSync(LOGG, JSON.stringify({ id, svar_id: ut.id, sida: r.sida, sidnamn: sidnamn.get(r.sida), verksamhet: r.verksamhet, kanal: r.kanal, annons: r.annons ?? null, text, avsandare, tid: new Date().toISOString() }) + '\n');
    sidorMedSvar.add(r.sida);
    if (!ig && avsandare !== r.sida) { console.log(`❌ ${kort}: postat men avsändaren är ${avsandare}, inte ${r.sida} — STOPPAR`); fel++; break; }
    console.log(`✅ ${r.verksamhet}/${r.kanal} ${fran} → ${kort} (${ut.id})`);
    postade++;
    await new Promise((s) => setTimeout(s, 1500));
  } catch (e) { console.log(`❌ ${kort}: ${e.message}`); fel++; }
}
console.log(`\n${skarpt ? 'Postade' : 'Skulle posta'}: ${skarpt ? postade : svar.length - hoppade - fel} · hoppade ${hoppade} · fel ${fel}`);
process.exit(fel ? 1 : 0);
