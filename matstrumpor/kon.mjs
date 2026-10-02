// kon.mjs — Matstrumpors uppladdningskö: Notion-rader i "To be Reviewed" /
// "Creative strat review" → en plan i 3:2:2-form (Axels beslut ROUTING C 2026-10-02).
//
// Läsningen återanvänder tools/notion-kalla.mjs (samma filhämtning som
// /notionkorning: bilaga i "Filer och media", indraget mediablock, eller
// Drive-mapp i sidans kropp). Skillnaden är att HÄR läses BARA Matstrumpors
// egen hub — aldrig "alla databaser integrationen ser".
//
// Två steg, båda rena (testade i test/kon.test.mjs och test/struktur.test.mjs):
//
//   1. planera()        rad för rad: namnet följer mönstret, video eller bild,
//                        filen finns, priset, landningssidan. En rad som inte går
//                        att ladda upp hamnar i `stoppade` med skälet — tyst fel
//                        är värre än ett rapporterat.
//   2. planeraKoncept()  annonserna grupperas per löpnummer till KONCEPT (tre
//                        hookar = ett testadset), COPY CARD:et läses (2 rubriker +
//                        2 primärtexter), och de klara koncepten får de lediga
//                        platserna i strukturen. Över taket VÄGRAR planen — konceptet
//                        väntar i hubben.
//
// Före 2026-10-02 valde namnet en av fyra hinkar (video, bild, jul_video,
// jul_bild). Hinkarna tar inte längre emot något; ett julkoncept är ett koncept
// som alla andra, med vinkeln `jul` i adsetnamnet.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { klaraRader } from '../tools/notion-kalla.mjs';
import { tolka, mediatyp, bygg } from './namn.mjs';
import { grupperaKoncept, tilldelaPlatser, granskaCopy, lasCopyKort, regler } from './struktur.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const STOPPSKAL = {
  NAMN: 'namnet följer inte mönstret — går inte att para ihop med ett koncept',
  FORMAT: 'formatet i namnet är varken video eller bild i konfigen',
  UTLAND: 'utlandets annonser laddas upp av marknader/annonser/bygg.mjs, aldrig av den svenska uppladdaren',
  FIL: 'ingen fil: varken bilaga, mediablock eller Drive-länk på raden',
  PRIS: 'priset i annonsen avviker mer än 20 % från butikens pris',
  LANDNING: 'landningssidan pekar på en annan butik',
  HOOKRAD: 'raden är märkt som tre hookfiler men namnet bär redan en hook',
};

/** Steg 1, rad för rad. hookrader = id:n på rader som bär TRE hookfiler
 *  (H1/H2/H3 i filnamnen, Gilz mönster 2026-09-21): raden blir tre annonser
 *  `_h1 _h2 _h3`, och sessionen tar fil k till annons k. Ren. */
export function planera(rader, konfig, { prisavvikelse = () => null, hookrader = new Set() } = {}) {
  const r = regler(konfig);
  const klara = [];
  const stoppade = [];
  for (const rad of rader) {
    const skal = [];
    const tolkat = tolka(rad.namn);
    const typ = tolkat ? mediatyp(tolkat, konfig) : 'okand';
    if (!tolkat) skal.push(STOPPSKAL.NAMN);
    else if (tolkat.land) skal.push(STOPPSKAL.UTLAND);
    else if (typ === 'okand') skal.push(STOPPSKAL.FORMAT);
    if (rad.leverans === 'saknas') skal.push(STOPPSKAL.FIL);
    const avvikelse = prisavvikelse(rad);
    if (avvikelse !== null && avvikelse !== undefined && Math.abs(avvikelse) > 0.2) skal.push(`${STOPPSKAL.PRIS} (${(avvikelse * 100).toFixed(0)} %)`);
    if (rad.landning && !String(rad.landning).includes(new URL(konfig.butik).hostname)) skal.push(`${STOPPSKAL.LANDNING}: ${rad.landning}`);
    const hookrad = hookrader.has?.(rad.id) ?? false;
    if (hookrad && tolkat?.hook) skal.push(STOPPSKAL.HOOKRAD);

    if (skal.length) {
      // En rad som BARA saknar namn men har en fil är inte trasig — den är
      // odöpt. Redigerarna döper sina rader "022", "023" … (mätt 2026-09-15 på
      // Gilz fyra videor), och då är namngivningen uppladdarens jobb.
      const baraNamn = skal.length === 1 && (skal[0] === STOPPSKAL.NAMN || skal[0] === STOPPSKAL.FORMAT);
      stoppade.push({ ...rad, skal, behover_namn: baraNamn && rad.leverans !== 'saknas' });
      continue;
    }
    const bas = {
      notion_id: rad.id,
      url: rad.url,
      leverans: rad.leverans,
      mediatyp: typ,
      vinkel: tolkat.vinkel,
      landning: rad.landning ?? konfig.meta.landningssida,
      filer: rad.filer,
      media: rad.media,
      drive: rad.drive,
    };
    if (hookrad) {
      for (let k = 1; k <= r.annonser_per_adset; k++) {
        klara.push({ ...bas, namn: bygg({ vinkel: tolkat.vinkel, format: tolkat.format, nummer: tolkat.nummer, version: tolkat.version, hook: k, ...(tolkat.typ === 'ITER' ? { iteration: tolkat.iteration, foralder: tolkat.foralder } : {}), imitation: tolkat.typ === 'IMIT' }, konfig), fil_hook: k, fran_rad: rad.namn });
      }
    } else {
      klara.push({ ...bas, namn: rad.namn });
    }
  }
  klara.sort((a, b) => a.namn.localeCompare(b.namn));
  return { klara, stoppade, behover_namn: stoppade.filter((s) => s.behover_namn) };
}

/** Steg 2: koncepten. kort = Map(annonsnamn → lasCopyKort-resultat eller null);
 *  lage = struktur.mjs strukturLage (null ⇒ strukturen lästes inte ⇒ inget
 *  laddas upp). Ren. */
export function planeraKoncept(klara, konfig, { kort = new Map(), lage = null, grupper = [] } = {}) {
  let koncept = grupperaKoncept(klara, konfig, { grupper });
  koncept = koncept.map((k) => {
    // COPY CARD per annons; saknas det på en annons gäller syskonets (de tre
    // hookarna delar normalt samma kort — samma 2 rubriker + 2 texter).
    const per = k.annonser.map((a) => ({ a, g: kort.has(a.namn) ? granskaCopy(kort.get(a.namn), konfig) : null }));
    const godkand = per.find((p) => p.g?.ok)?.g ?? null;
    const annonser = per.map(({ a, g }) => ({ ...a, copy: g?.ok ? g.copy : godkand?.copy ?? null, copy_kalla: g?.ok ? 'egen' : godkand ? 'syskon' : null, copy_anm: g?.anm ?? [] }));
    const fel = [...new Set(per.flatMap((p) => p.g?.fel ?? []))];
    let { status, skal } = k;
    if (status === 'klar' && annonser.some((a) => !a.copy)) {
      status = 'vantar_copy';
      skal = [...skal, ...(fel.length ? fel : ['inget COPY CARD hittades — varken i repots brief.md eller i Notion-sidan']), 'kungen (eller sessionen) låter en sonnet-subagent skriva rubrik 2 och text 2 mot docs/copy-regler.md och lägger dem i briefens COPY CARD']; // CLAUDE.md regel 6
    }
    return { ...k, annonser, status, skal };
  });
  if (!lage) {
    koncept = koncept.map((k) => (k.status === 'klar' ? { ...k, status: 'vantar_struktur', skal: [...k.skal, 'strukturen i kampanjen lästes inte (kor.mjs --struktur) — utan den vet ingen hur många adsets som levererar, och inget laddas upp'] } : k));
  } else {
    koncept = tilldelaPlatser(koncept, lage);
  }
  const rakna = (s) => koncept.filter((k) => k.status === s).length;
  return {
    koncept,
    att_bygga: koncept.filter((k) => k.status === 'klar'),
    vantar: koncept.filter((k) => k.status !== 'klar' && k.status !== 'stopp'),
    stopp: koncept.filter((k) => k.status === 'stopp'),
    struktur: lage,
    summa: { klara: rakna('klar'), vantar_plats: rakna('vantar_plats'), vantar_hookar: rakna('vantar_hookar'), vantar_copy: rakna('vantar_copy'), vantar_struktur: rakna('vantar_struktur'), stopp: rakna('stopp') },
  };
}

/** Briefens text för en annons: repots brief.md (BRIEF-raden i loggen, efter
 *  OMDOPT) först — den är facit och kräver inget nät. null om ingen finns. */
export function briefFil(namn, logg, repoRot = ROT) {
  const omdopt = new Map((logg ?? []).filter((r) => r.kod === 'OMDOPT').map((o) => [o.till, o.fran]));
  const t = tolka(namn);
  // Briefen loggas på konceptets namn; en hookvariant (_h2) kan sakna egen rad
  // och läser då syskonets — samma koncept, samma kort.
  const kandidater = [namn, omdopt.get(namn)].filter(Boolean);
  const briefer = (logg ?? []).filter((r) => r.kod === 'BRIEF' && r.brief);
  let rad = briefer.find((b) => kandidater.includes(b.annons));
  if (!rad && t?.nummer) rad = briefer.find((b) => { const bt = tolka(b.annons); return bt && !bt.land && bt.nummer === t.nummer; });
  if (!rad) return null;
  const fil = join(repoRot, rad.brief);
  return existsSync(fil) ? readFileSync(fil, 'utf8') : null;
}

/** Sidans text i Notion (briefen ligger som block i itemet). Reserven när
 *  repot saknar brief.md. Tabellrader som "a | b". Fel ⇒ null, aldrig krasch. */
export async function sidText(pageId, { fetchFn = fetch, djup = 0 } = {}) {
  const token = process.env.NOTION_TOKEN;
  if (!token || !pageId) return null;
  const rader = [];
  let cursor;
  try {
    do {
      const r = await fetchFn(`https://api.notion.com/v1/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ''}`, { headers: { Authorization: `Bearer ${token}`, 'Notion-Version': '2022-06-28' } });
      const j = await r.json();
      if (!r.ok || j.object === 'error') return rader.length ? rader.join('\n') : null;
      for (const b of j.results ?? []) {
        const inne = b[b.type] ?? {};
        const text = (lista) => (lista ?? []).map((x) => x.plain_text ?? '').join('');
        const t = b.type === 'table_row' ? (inne.cells ?? []).map((c) => text(c)).join(' | ') : text(inne.rich_text);
        if (t) rader.push((b.type?.startsWith('heading') ? '## ' : b.type === 'quote' ? '> ' : '') + t);
        if (b.has_children && djup < 2) { const under = await sidText(b.id, { fetchFn, djup: djup + 1 }); if (under) rader.push(under); }
      }
      cursor = j.has_more ? j.next_cursor : null;
    } while (cursor);
  } catch { return rader.length ? rader.join('\n') : null; }
  return rader.join('\n');
}

/** Titlarna på ALLA rader i Matstrumpors hub, oavsett status — för namn-
 *  motorn. En Draft-brief upptar sitt nummer lika mycket som en live annons.
 *  Kräver NOTION_TOKEN; utan den kastas ett fel som --namn fångar och säger. */
export async function hubbNamn(konfig, { fetchFn = fetch } = {}) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error('NOTION_TOKEN saknas i miljön — hubben går inte att läsa.');
  const titlar = [];
  let cursor;
  do {
    const r = await fetchFn(`https://api.notion.com/v1/databases/${konfig.notion.hub_id}/query`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_size: 100, ...(cursor ? { start_cursor: cursor } : {}) }),
    });
    const j = await r.json();
    if (!r.ok || j.object === 'error') throw new Error(`Notion svarade ${r.status}: ${j.message ?? JSON.stringify(j)}`);
    for (const sida of j.results) {
      const titel = Object.values(sida.properties ?? {}).find((p) => p.type === 'title');
      const text = (titel?.title ?? []).map((t) => t.plain_text).join('').trim();
      if (text) titlar.push(text);
    }
    cursor = j.has_more ? j.next_cursor : undefined;
  } while (cursor);
  return titlar;
}

/** Läser Matstrumpors hub, briefernas COPY CARD och planerar. Kräver NOTION_TOKEN.
 *  lage kommer från kor.mjs (strukturen läst ur Meta) — null ⇒ inget laddas upp. */
export async function hamtaKo(konfig, { logg = [], lage = null, grupper = [], hookrader = new Set(), prisavvikelse, ...val } = {}) {
  const hub = { id: konfig.notion.hub_id, titel: konfig.notion.hub_namn };
  const rader = await klaraRader(hub, { statusar: (konfig.notion.ko_statusar ?? [konfig.notion.ko_status]).map((s) => s.toLowerCase()), ...val });
  const plan = planera(rader, konfig, { prisavvikelse, hookrader });
  const kort = new Map();
  for (const a of plan.klara) {
    let text = briefFil(a.namn, logg) ?? (a.fran_rad ? briefFil(a.fran_rad, logg) : null);
    let kalla = text ? 'repo' : null;
    if (!text) { text = await sidText(a.notion_id); kalla = text ? 'notion' : null; }
    const k = text ? lasCopyKort(text) : null;
    kort.set(a.namn, k);
    a.copy_fil = kalla;
  }
  const koncept = planeraKoncept(plan.klara, konfig, { kort, lage, grupper });
  return { rader, plan: { ...plan, ...koncept } };
}
