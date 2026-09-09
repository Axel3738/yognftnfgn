// rakning.mjs — avstämningen: källannonser per dom mot annonser som faktiskt
// ligger i målkontot.
//
//   node factory/rakning.mjs <produkt-id> [--marknad SE]
//
// Steg 9 i `/ny-annonser`, kommandots viktigaste spärr (Axels bakläxa
// 2026-09-09: TankGuard fick 10 annonser av 33 möjliga och rapporterades som
// klart). Varje källannons ska antingen ligga uppe eller stå namngiven med
// sin orsak.
//
// ⚠️ Annonserna räknas med `<kampanj>/ads` i Meta, ALDRIG ur en state-fil och
// aldrig ur `advideos`/`adimages` — uppladdad media är inte en annons.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';
import { api, alla } from '../tools/meta-lib.mjs';
import { MALKONTO } from './kallannonser.mjs';

const ROT = dirname(fileURLToPath(import.meta.url));

export function stamAv({ kallannonser, domar, media, byggda, marknad = 'SE' }) {
  const kalla = (kallannonser[marknad]?.annonser ?? []);
  const dom = new Map((domar.annonser ?? []).map((d) => [d.annons, d]));
  const uppe = new Set(Object.keys(media));
  // Annonsnamnen i kontot bär brandprefix: DryTrek_Damasker_PD_2_1.
  //
  // ⚠️ Matcha på SLUTET av namnet, aldrig med includes(). Källnamnen är
  // prefix av varandra — "Damasker_PD_2" ligger inne i
  // "DryTrek_Damasker_PD_2_1". Med includes() kapade den korta annonsen den
  // långas rad, och räkningen påstod att två annonser saknades trots att
  // alla 16 låg uppe (mätt 2026-09-09). En räkning som ljuger är värre än
  // ingen räkning alls.
  const byggdaNamn = new Map();
  for (const b of byggda) {
    const traff = kalla.find((k) => b.name === k.namn || b.name.endsWith(`_${k.namn}`));
    if (traff && !byggdaNamn.has(traff.namn)) byggdaNamn.set(traff.namn, b);
  }

  const rader = kalla.map((k) => {
    const d = dom.get(k.namn);
    return {
      namn: k.namn,
      typ: k.typ,
      // SE: `med` = ACTIVE hela vägen upp. NO: kampanjen är nedlagd med flit
      // (marknadsbeslut, 6 kr spend) — räkna annons + adset, som media-upload.
      aktiv: marknad === 'NO' ? k.status === 'ACTIVE' && k.adset?.status === 'ACTIVE' : k.med,
      status: k.status,
      dom: d?.dom ?? 'okänd',
      attgora: d?.attgöra ?? d?.attgora ?? null,
      media: uppe.has(k.namn),
      byggd: byggdaNamn.has(k.namn),
      annonsId: byggdaNamn.get(k.namn)?.id ?? null,
    };
  });

  const perDom = {};
  for (const r of rader) perDom[r.dom] = (perDom[r.dom] ?? 0) + 1;

  return {
    kalla: rader.length,
    perDom,
    media: rader.filter((r) => r.media).length,
    byggda: byggdaNamn.size,
    iKontot: byggda.length,
    rader,
    saknade: rader.filter((r) => !r.byggd),
  };
}

if (process.argv[1] && process.argv[1].endsWith('rakning.mjs')) {
  laddaEnv();
  const arg = process.argv.slice(2);
  const produktId = arg.find((a) => !a.startsWith('--') && !String(arg[arg.indexOf(a) - 1] ?? '').startsWith('--'));
  const marknad = arg.includes('--marknad') ? arg[arg.indexOf('--marknad') + 1] : 'SE';

  if (marknad !== 'SE' && marknad !== 'NO') throw new Error(`--marknad ${marknad} finns inte. Välj SE eller NO.`);
  // ⚠️ Varje marknad har EGNA domar och EGEN media. Mätt 2026-09-09: räkningen
  // för NO läste de svenska filerna, dömde alla 16 norska "okänd" och
  // rapporterade ändå grönt — för att inget skulle laddas upp och inget
  // saknades. En räkning som råkar bli rätt är ingen räkning.
  const suffix = marknad === 'NO' ? '-no' : '';
  const ut = join(ROT, 'output', produktId);
  for (const f of ['kallannonser.json', `brand-detektor${suffix}.json`, `media-i-malkontot${suffix}.json`]) {
    if (!existsSync(join(ut, f))) throw new Error(`Saknar ${f} — kör stegen före räkningen för ${marknad} först.`);
  }
  const kallannonser = JSON.parse(readFileSync(join(ut, 'kallannonser.json'), 'utf8'));
  const domar = JSON.parse(readFileSync(join(ut, `brand-detektor${suffix}.json`), 'utf8'));
  const media = JSON.parse(readFileSync(join(ut, `media-i-malkontot${suffix}.json`), 'utf8'));
  const p = lasYaml(readFileSync(join(ROT, 'produkter', `${produktId}.yaml`), 'utf8'));
  const brand = (p.brand?.namn ?? '').toUpperCase();

  // Annonserna läses ur META, inte ur minnet.
  const kampanjer = await alla(`act_${MALKONTO.id}/campaigns`, { fields: 'id,name,status' });
  const min = kampanjer.filter((c) => c.name.startsWith(`${brand}_${marknad}_`));
  const byggda = [];
  for (const c of min) {
    byggda.push(...(await alla(`${c.id}/ads`, { fields: 'id,name,status' }, 50)));
  }

  const r = stamAv({ kallannonser, domar, media, byggda, marknad });

  console.log(`\nRÄKNING — ${p.brand.namn} ${marknad}`);
  console.log(`Kampanj i kontot: ${min.map((c) => c.name).join(', ') || '(ingen)'}\n`);
  console.log(`Källannonser:        ${String(r.kalla).padStart(3)}`);
  for (const [d, n] of Object.entries(r.perDom).sort()) {
    const ska = d === 'okänd' ? 'ska INTE laddas upp' : `ska bli ${n} annonser`;
    console.log(`  ${d.padEnd(20)} ${String(n).padStart(3)}  → ${ska}`);
  }
  console.log(`Media i målkontot:   ${String(r.media).padStart(3)}`);
  console.log(`Uppladdade annonser: ${String(r.byggda).padStart(3)}  ← läst ur Meta (${r.iKontot} i kampanjen totalt)`);

  if (r.saknade.length === 0) {
    console.log('\n✅ Varje källannons som får laddas upp ligger uppe.');
  } else {
    console.log(`\n${r.saknade.length} källannonser ligger INTE uppe:`);
    for (const s of r.saknade) {
      const skal =
        s.dom === 'okänd'
          ? `dom "okänd" — ${s.attgora ?? 'en yta gick inte att läsa'}. En okänd dom laddas aldrig upp.`
          : !s.aktiv
            ? `källannonsen är ${s.status} — pausat är ett beslut`
            : 'okänd orsak — MÅSTE utredas';
      console.log(`   • ${s.namn.padEnd(20)} ${skal}`);
    }
  }

  const oforklarade = r.saknade.filter((s) => s.dom !== 'okänd' && s.aktiv);
  console.log(
    oforklarade.length === 0
      ? '\nAlla avvikelser är förklarade och namngivna.'
      : `\n⚠️  ${oforklarade.length} annonser saknas UTAN förklaring — delvis klart.`
  );
  process.exit(oforklarade.length === 0 ? 0 : 1);
}
