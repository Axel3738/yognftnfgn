#!/usr/bin/env node
// Skriver temu/takoverdrag/FI-KAMPANJ-LOGG.md ur körningens filer: manifest + state (FI-ad-ID, status),
// copy/manus/bildtext-ändringar (subagentens `andringar`), videoresultat (VO-längd, tempo, rostkoll) och bildresultat.
//
//   node temu/takoverdrag/fi-kampanj/logg.mjs --manifest <manifest.json> --video <arbete/resultat.json> --ut temu/takoverdrag/FI-KAMPANJ-LOGG.md
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
const args = process.argv.slice(2);
const val = (f) => args[args.indexOf(f) + 1];
const HAR = path.dirname(new URL(import.meta.url).pathname);
const M = JSON.parse(readFileSync(val('--manifest'), 'utf8'));
const st = existsSync(val('--manifest') + '.state.json') ? JSON.parse(readFileSync(val('--manifest') + '.state.json', 'utf8')) : { annonser: {}, adsets: {} };
const video = existsSync(val('--video')) ? JSON.parse(readFileSync(val('--video'), 'utf8')) : {};
const bild = JSON.parse(readFileSync(`${HAR}/bilder/resultat.json`, 'utf8'));
const copy = JSON.parse(readFileSync(`${HAR}/copy/fi-copy.json`, 'utf8')).versioner;
const manus = JSON.parse(readFileSync(`${HAR}/vo/fi-manus.json`, 'utf8'));
const texter = JSON.parse(readFileSync(`${HAR}/bilder/oversatt-output.json`, 'utf8'));
const DATUM = new Date().toISOString().slice(0, 10);

const copyAv = {}; for (const [k, v] of Object.entries(copy)) for (const n of v.annonser) copyAv[n] = { k, ...v };
const adIdAv = (n) => st.annonser?.[n] || '—';
const ver = st.verifiering;
const effAv = (n) => ver?.annonser?.find((x) => x[0] === `FI_${n}`)?.[1] || '—';

let md = `# Taköverdraget — finska kampanjen, körlogg (${DATUM})\n\n`;
md += `Spec: \`FI-KAMPANJ.md\`. Byggd av \`fi-kampanj/\` (skripten där, alla texter i \`copy/\`, \`vo/\`, \`bilder/\`).\n\n`;
md += `**Konto:** Magiborsten FI \`act_1619718346388201\` (valuta SEK — inte EUR som specen antog; budgetar anges i öre). `;
md += `**Sida:** Majavakauppa \`1317870104733246\`. **Pixel:** \`1554276343018184\` (Bäverbutiken.se — kontots enda köp-pixel, samma som Axels 19 befintliga FI-adsets; majavakauppa.fi skickar i dag ingen Meta-pixel alls — se frågan till Axel i leveransen). `;
md += `**Kampanj:** \`${M.kampanjnamn}\` → \`${st.kampanj || '—'}\`, CBO ${M.dagsbudget_ore / 100} kr/dag (≈ 100 €) som platshållare, PAUSED.\n\n`;
if (ver) {
  const pr = ver.annonser.filter((a) => a[1] === 'PENDING_REVIEW').length, ovr = ver.annonser.filter((a) => !['PAUSED', 'PENDING_REVIEW'].includes(a[1]));
  md += `Verifiering ${DATUM} (\`effective_status\`): kampanj \`${ver.kampanj.effective_status}\`, ${ver.adsets.length} adsets (${ver.adsets.every((a) => a[1] === 'PAUSED') ? 'alla PAUSED' : 'EJ ALLA PAUSED: ' + ver.adsets.filter((a) => a[1] !== 'PAUSED').map((a) => a[0]).join(', ')}), ${ver.annonser.length} annonser: ${ver.annonser.length - pr - ovr.length} PAUSED + ${pr} PENDING_REVIEW (alla skapade med \`status: PAUSED\`; PENDING_REVIEW är Metas granskning av nya annonser och levererar inte medan kampanj och adset är pausade)${ovr.length ? ` — ⚠️ AVVIKER: ${ovr.map((a) => a[0] + '=' + a[1]).join(', ')}` : ''}.\n\n`;
}

md += `## Adsets\n\n| SE | FI | ID |\n|---|---|---|\n`;
for (const a of M.adsets) md += `| ${a.se_namn} | ${a.fi_namn} | \`${st.adsets?.[a.se_namn] || '—'}\` |\n`;

md += `\n## Annonser\n\n| SE-namn | FI-namn | FI-ad-ID | Status |\n|---|---|---|---|\n`;
for (const ad of M.annonser) md += `| ${ad.se_namn} | ${ad.fi_namn} | \`${adIdAv(ad.se_namn)}\` | ${st.annonser?.[ad.se_namn] ? `uppladdad, ${effAv(ad.se_namn)}` : 'ej uppladdad'} |\n`;
for (const s of M.saknas || []) md += `| ${s.se_namn} | FI_${s.se_namn} | — | väntar redigerare — ${s.skal} |\n`;

md += `\n## Lokaliseringslogg per annons (utöver ren översättning)\n\n`;
md += `Rubrik/text/länkbeskrivning: sonnet-subagent (22 versioner för 34 annonser), granskad med skript (priser 126,90/165,90/39 €, förbjudna ord, "koskaan", recensioner, hastighetslöften) och läst av huvudsessionen. Tre-frågorstestet: \`copy/fi-copy-test.md\`.\n\n`;
for (const ad of M.annonser.concat((M.saknas || []).map((s) => ({ se_namn: s.se_namn })))) {
  const c = copyAv[ad.se_namn];
  const rader = [];
  if (c?.andringar?.length) rader.push(`copy: ${c.andringar.join(' · ')}`);
  const m = manus[ad.se_namn];
  if (m) { rader.push(`VO-manus: ${m.andringar?.length ? m.andringar.join(' · ') : 'ren översättning'}`); const v = video[ad.se_namn]; if (v) rader.push(`video: VO ${v.vo_s ?? '?'} s (rå ${v.vo_ra_s ?? '?'} s, ${v.pauser_klippta ?? 0} pauser kortade), tempo ${v.tempo ?? '?'}, ${v.precis ?? ''}; rostkoll ${v.rostkoll_ok ? '✅' : '❌ ' + (v.rostkoll || '')}`); }
  const t = texter[ad.se_namn];
  if (t) rader.push(`bild: ${t.andringar?.length ? t.andringar.join(' · ') : 'ren översättning'}${bild[ad.se_namn] ? ` (motor: ${bild[ad.se_namn].status}${bild[ad.se_namn].skal ? ' — ' + bild[ad.se_namn].skal : ''})` : ''}`);
  md += `- **${ad.se_namn}** ${c ? `(copyversion \`${c.k}\`)` : ''}\n${rader.map((r) => `  - ${r}`).join('\n')}\n`;
}
md += `\n## Gemensamt för alla videor\n\n- Röst: ElevenLabs **Martti – Calm & relaxed** (\`paqSK057kuKFy1kq3bdZ\`), modell \`eleven_v3\`, stability 0,5 — samma i alla 19. Vald 2026-09-18 bland kontots två finska röster (Henry Aflecht ~12 % långsammare). Sessionen kan inte lyssna; rösten är mätt (längd, tystnad, nivå), inte hörd — **lyssna på minst tre klipp innan aktivering.**\n- Ljudspåret är BYTT: bara finsk VO (loudnorm −16 LUFS). Källorna hade en tyst musik-/rumsbädd (~20 dB under talet, mono — går inte att separera med ffmpeg), den är borta i FI-versionerna. Vill Axel ha musikbädd: redigerarna lägger på en.\n- Finskan var för lång för videorna även efter kortning: eleven_v3 lägger 0,5–1,0 s tystnad efter varje mening, så pauser > 0,30 s kortas till 0,25 s (\`fi-video.mjs\`), därefter tempo ≤ 1,10 vid behov.\n- Captions: de svenska ordcaption-pillren målas vita per frame och den finska texten läggs där (\`pipeline/no-precis.py\`, samma teknik som NO 2026-09-16). Prisgrafik, "FRI FRAKT", "210D-VÄV" och slutkorten (CO_1, RI_1, SP_4, UG_1) suddas och ersätts med finska PNG-lager (\`lager-fi.py\`); slutkortets "★★★★★ 10 recensioner" blev "HIHNAT NELJÄLLÄ SIVULLA" och Bäverbutiken-märket blev MAJAVAKAUPPA. CS_1/2/3 har en 0,17 s blixtframe "RV ROOF COVER / 5-STAR REVIEW!" — suddad. SP_4:s stjärnanimation (29–34 s) suddad utan ersättning.\n`;
md += `\n## Kvoten\n\n\`pipeline/quota.mjs\` gäller inte — taköverdraget finns inte i \`products/products.json\` (Temu-produkt, ingen creative hub). Ingen loggning gjord.\n`;
writeFileSync(val('--ut'), md);
console.log('skrev', val('--ut'), md.length, 'tecken');
