// brand-swap.mjs — dubbar om en Bäverbutiks-videobatch så att TALET säger OPS-butikens
// brand i stället (FAS2 uppdrag A2). Samma språk in och ut: HeyGens proofread-flöde
// transkriberar gratis, brandordet byts i SRT:en, och först därefter renderas.
//
//   node pipeline/brand-swap.mjs proofread --mapp <arbetsmapp> --brand TankGuard
//   node pipeline/brand-swap.mjs render    --mapp <arbetsmapp> [namn ...]
//   node pipeline/brand-swap.mjs status    --mapp <arbetsmapp>
//
// Arbetsmappen ska ha käll-mp4:orna i <mapp>/kalla/. Skriptet skriver
// <mapp>/srt/<namn>.sv.srt (rättade transkript), <mapp>/heygen/<namn>.mp4 (renderade)
// och <mapp>/state.json.
//
// JÄRNREGLER (docs/video-localization.md + .claude/skills/translate/SKILL.md):
//  • Rendera ALDRIG före proofread — proofread är gratis, rendering drar krediter.
//  • Session-id till disk direkt efter varje anrop; containern kan dö mitt i.
//  • Captionpillret i bild säger också det gamla brandet — kör pipeline/brand-caption.py
//    på de renderade filerna efteråt. HeyGen rör bara ljudet.
//  • Fastnar en render i "video pending moderation by our team": det släpper oftast
//    inom en timme. Polla, rendera inte om — omrendering kostar krediter igen.

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

const flagga = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d; };
const ROT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const HÄR = path.resolve(flagga('mapp') || process.exit(console.error('✗ Ange --mapp <arbetsmapp> med käll-mp4:orna i <mapp>/kalla/') ?? 1));
const BRANDORD = flagga('brand', 'TankGuard');
const KÄLLA = path.join(HÄR, 'kalla');
const SRT = path.join(HÄR, 'srt');
const UT = path.join(HÄR, 'heygen');
const STATE = path.join(HÄR, 'state.json');
const SPRÅK = 'Swedish (Sweden)';

for (const d of [SRT, UT]) mkdirSync(d, { recursive: true });

// HeyGen hör brandnamnet fel på flera sätt — FAS2 uppdrag A listar formerna.
const BRAND = /B[äaå]\w*[\s-]?butiken|Bawebutiken|Spavebutiken|Bäver\s?butiken/gi;

const läs = () => (existsSync(STATE) ? JSON.parse(readFileSync(STATE, 'utf8')) : {});
const skriv = (s) => writeFileSync(STATE, JSON.stringify(s, null, 2));

const {
  proofreadCreate, proofreadStatus, proofreadGetSrt, proofreadUploadSrt,
  proofreadGenerate, getTranslateStatus, uploadAsset, downloadResult, checkQuota, fetchFresh,
} = await import(path.join(ROT, 'pipeline/heygen.mjs'));

const sov = (ms) => new Promise((r) => setTimeout(r, ms));
const videor = readdirSync(KÄLLA).filter((f) => f.endsWith('.mp4')).sort();
const kommando = process.argv[2] || 'status';
// Valfria namn efter kommandot begränsar körningen till just dem.
const bara = process.argv.slice(3).filter((a, i, arr) => !a.startsWith('--') && !(i > 0 && arr[i - 1].startsWith('--')));
const med = (namn) => bara.length === 0 || bara.includes(namn);

// ─────────────────────────────────────────────── proofread (0 krediter)
if (kommando === 'proofread') {
  const s = läs();
  for (const fil of videor) {
    const namn = fil.replace(/\.mp4$/, '');
    s[namn] ??= {};
    if (s[namn].proofreadId) { console.log(`· ${namn}: proofread finns (${s[namn].proofreadId})`); continue; }
    const url = await uploadAsset(path.join(KÄLLA, fil));
    const id = await proofreadCreate({ videoUrl: url, outputLanguage: SPRÅK, title: namn });
    s[namn].proofreadId = id;
    skriv(s);                                  // ← direkt till disk
    console.log(`✓ ${namn}: proofread startad (${id})`);
  }
  // vänta in transkripten och rätta brandnamnet
  for (const namn of Object.keys(s)) {
    if (s[namn].srtKlar) continue;
    for (let i = 0; i < 40; i++) {
      const st = await proofreadStatus(s[namn].proofreadId);
      if (st.status === 'success' || st.status === 'completed') break;
      if (st.status === 'failed') { s[namn].fel = st.failure_message || 'proofread failed'; skriv(s); break; }
      await sov(15000);
    }
    if (s[namn].fel) { console.log(`✗ ${namn}: ${s[namn].fel}`); continue; }
    const srtSvar = await proofreadGetSrt(s[namn].proofreadId);
    const rå = await fetchFresh(srtSvar.srt_url);
    const träffar = (rå.match(BRAND) || []).length;
    const rättad = rå.replace(BRAND, BRANDORD);
    const srtFil = path.join(SRT, `${namn}.sv.srt`);
    writeFileSync(srtFil, rättad, 'utf8');
    s[namn].srtKlar = true;
    s[namn].brandTraffar = träffar;
    skriv(s);
    console.log(`✓ ${namn}: SRT rättad — ${träffar} brandträff(ar) → TankGuard`);
    if (träffar === 0) console.log(`  ⚠ ${namn}: INGEN brandträff — kontrollera transkriptet för hand`);
  }
  console.log('\nProofread klart. Granska SRT:erna i .scratch/tankguard/srt/ före render.');
}

// ─────────────────────────────────────────────── render (drar krediter)
if (kommando === 'render') {
  const s = läs();
  console.log(`Kvot före: ${JSON.stringify((await checkQuota()).details ?? await checkQuota())}`);
  for (const namn of Object.keys(s)) {
    if (!med(namn)) continue;
    if (!s[namn].srtKlar) { console.log(`⏭ ${namn}: ingen rättad SRT`); continue; }
    if (s[namn].renderId) { console.log(`· ${namn}: render finns (${s[namn].renderId})`); continue; }
    await proofreadUploadSrt(s[namn].proofreadId, readFileSync(path.join(SRT, `${namn}.sv.srt`), 'utf8'));
    const id = await proofreadGenerate(s[namn].proofreadId);
    s[namn].renderId = id;
    skriv(s);                                  // ← direkt till disk
    console.log(`✓ ${namn}: render startad (${id})`);
  }
}

// ─────────────────────────────────────────────── status + nedladdning
if (kommando === 'status') {
  const s = läs();
  let klara = 0, väntar = 0, fel = 0;
  for (const namn of Object.keys(s)) {
    if (s[namn].nerladdad) { klara++; console.log(`✅ ${namn}: nerladdad`); continue; }
    if (!s[namn].renderId) { väntar++; console.log(`… ${namn}: inte renderad än`); continue; }
    const st = await getTranslateStatus(s[namn].renderId);
    if (st.status === 'success' && st.url) {
      const fil = path.join(UT, `${namn}.mp4`);
      await downloadResult(s[namn].renderId, fil);
      s[namn].nerladdad = fil;
      skriv(s);
      klara++;
      console.log(`✅ ${namn}: nerladdad → ${fil}`);
    } else if (st.status === 'failed') {
      fel++;
      console.log(`❌ ${namn}: ${st.failure_message || 'failed'}`);
    } else {
      väntar++;
      console.log(`⏳ ${namn}: ${st.status}`);
    }
  }
  console.log(`\nKlara ${klara} · väntar ${väntar} · fel ${fel} (av ${videor.length})`);
}
