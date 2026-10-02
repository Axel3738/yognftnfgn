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
import { grupperaKoncept, tilldelaPlatser, granskaCopy, lasCopyKort, regler, sidNyckel, tolkaAdsetNamn, batchaUppladdning } from './struktur.mjs';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const STOPPSKAL = {
  NAMN: 'namnet följer inte mönstret — går inte att para ihop med ett koncept',
  FORMAT: 'formatet i namnet är varken video eller bild i konfigen',
  NUMMER: 'namnet saknar löpnummer (id:t börjar med bokstäver) — 3:2:2 parar hookarna på löpnumret: döp om med --namn <vinkel> <format> 1 och --dop',
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
  // Sid-id:n jämförs normaliserade: med eller utan bindestreck, eller en hel länk.
  const hookNycklar = new Set([...(hookrader ?? [])].map(sidNyckel));
  const traffade = new Set();
  for (const rad of rader) {
    const skal = [];
    const tolkat = tolka(rad.namn);
    const typ = tolkat ? mediatyp(tolkat, konfig) : 'okand';
    if (!tolkat) skal.push(STOPPSKAL.NAMN);
    else if (tolkat.land) skal.push(STOPPSKAL.UTLAND);
    else if (typ === 'okand') skal.push(STOPPSKAL.FORMAT);
    else if (tolkat.nummer === null) skal.push(STOPPSKAL.NUMMER);
    if (rad.leverans === 'saknas') skal.push(STOPPSKAL.FIL);
    const avvikelse = prisavvikelse(rad);
    if (avvikelse !== null && avvikelse !== undefined && Math.abs(avvikelse) > 0.2) skal.push(`${STOPPSKAL.PRIS} (${(avvikelse * 100).toFixed(0)} %)`);
    if (rad.landning && !String(rad.landning).includes(new URL(konfig.butik).hostname)) skal.push(`${STOPPSKAL.LANDNING}: ${rad.landning}`);
    const hookrad = hookNycklar.has(sidNyckel(rad.id));
    if (hookrad) traffade.add(sidNyckel(rad.id));
    if (hookrad && tolkat?.hook) skal.push(STOPPSKAL.HOOKRAD);

    if (skal.length) {
      // En rad som BARA saknar namn men har en fil är inte trasig — den är
      // odöpt. Redigerarna döper sina rader "022", "023" … (mätt 2026-09-15 på
      // Gilz fyra videor), och då är namngivningen uppladdarens jobb.
      const baraNamn = skal.length === 1 && [STOPPSKAL.NAMN, STOPPSKAL.FORMAT, STOPPSKAL.NUMMER].includes(skal[0]);
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
      // bygg() kastar på en vinkel/ett format som inte står i konfigen — då är
      // det raden som stoppas, inte hela kön.
      let utvidgad;
      try {
        utvidgad = Array.from({ length: r.annonser_per_adset }, (_, i) => ({ ...bas, namn: bygg({ vinkel: tolkat.vinkel, format: tolkat.format, nummer: tolkat.nummer, version: tolkat.version, hook: i + 1, ...(tolkat.typ === 'ITER' ? { iteration: tolkat.iteration, foralder: tolkat.foralder } : {}), imitation: tolkat.typ === 'IMIT' }, konfig), fil_hook: i + 1, fran_rad: rad.namn }));
      } catch (e) {
        stoppade.push({ ...rad, skal: [`--hookrad: ${e.message}`], behover_namn: false });
        continue;
      }
      klara.push(...utvidgad);
    } else {
      klara.push({ ...bas, namn: rad.namn });
    }
  }
  klara.sort((a, b) => a.namn.localeCompare(b.namn));
  const hookrader_utan_traff = [...(hookrader ?? [])].filter((h) => !traffade.has(sidNyckel(h)));
  return { klara, stoppade, behover_namn: stoppade.filter((s) => s.behover_namn), hookrader_utan_traff };
}

/** Steg 2: koncepten. kort = Map(annonsnamn → lasCopyKort-resultat eller null);
 *  lage = struktur.mjs strukturLage (null ⇒ strukturen lästes inte ⇒ inget
 *  laddas upp). Ren. */
export function planeraKoncept(klara, konfig, { kort = new Map(), lage = null, grupper = [], logg = [], datum = null } = {}) {
  // Axels beslut 2026-10-02 (kväll): VARJE UPPLADDNING är ett eget adset, med
  // det som är klart just då — varianterna blir inte klara samtidigt, och ibland
  // laddas bara en upp. Koncepten (löpnumren) grupperas fortfarande för att
  // granska copy och hålla isär det som redan byggts; själva adseten är
  // uppladdningar (struktur.mjs batchaUppladdning), ett per mediatyp.
  let koncept = grupperaKoncept(klara, konfig, { grupper });
  const kasserade = new Set((logg ?? []).filter((r) => r.kod === 'ADSET_KASSERAT').map((r) => String(r.adset_id)));
  const skapade = (logg ?? []).filter((r) => r.kod === 'ADSET_SKAPAD' && !kasserade.has(String(r.adset_id)));
  const uppe = new Map((logg ?? []).filter((r) => r.kod === 'UPPLADDAD').map((r) => [String(r.annons).toLowerCase(), r]));
  const uppeAdset = new Set((logg ?? []).filter((r) => r.kod === 'UPPLADDAD' && r.adset_id).map((r) => String(r.adset_id)));
  const iKampanjen = new Map((lage?.adsets ?? []).map((a) => [a.namn, a]));
  // Ett bygge som inte publicerats (ADSET_SKAPAD, adsetet syns inte i kampanjen,
  // inget uppladdat) håller sina annonser: de byggs inte i ett nytt adset förrän
  // utkastet kasserats och kvitterats (--adset-kasserat), aldrig Approved.
  // Syns adsetet i kampanjen men inget är loggat UPPLADDAD har Axel publicerat
  // det (5c) — då ska det läsas tillbaka (--kontroll) och loggas, inte byggas igen.
  const hallna = new Map();
  for (const sk of skapade) {
    if (uppeAdset.has(String(sk.adset_id))) continue;
    for (const n of sk.annonser ?? []) hallna.set(String(n).toLowerCase(), sk);
  }
  const vantande = [];
  const redo = [];
  koncept = koncept.map((k) => {
    if (k.status === 'stopp') return k;
    // Gamla koncept-adset (före uppladdningsregeln) som loggats utan annonslista.
    const gammaltLoggat = skapade.find((r) => !r.annonser && ((k.adset_namn && r.adset_namn === k.adset_namn) || String(r.koncept ?? '') === k.nyckel) && !uppeAdset.has(String(r.adset_id)));
    // Ett koncept-adset från före uppladdningsregeln som redan finns i kampanjen.
    const gammaltIKampanjen = k.adset_namn ? iKampanjen.get(k.adset_namn) : null;
    const skal = [...k.skal];
    const kvar = [];
    for (const a of k.annonser) {
      const nyckel = a.namn.toLowerCase();
      const u = uppe.get(nyckel);
      if (u) { skal.push(`${a.namn} är redan uppladdad (${u.annons_id}) — raden ska ut ur kön: Approved, eller kommentar + Draft om något saknas`); continue; }
      const h = hallna.get(nyckel) ?? gammaltLoggat;
      const publicerad = h ? iKampanjen.get(h.adset_namn) : gammaltIKampanjen;
      if (publicerad) { skal.push(`${a.namn} ligger i adsetet ${publicerad.namn} (${publicerad.id}, ${publicerad.effective_status}) men är inte loggad som uppladdad — kör --kontroll ${publicerad.id}; exit 0 ⇒ logga med --uppladdad och sätt Approved. Byggs aldrig igen`); continue; }
      if (h) { skal.push(`${a.namn}: förra bygget publicerades inte — ADSET_SKAPAD ${h.adset_namn} (${h.adset_id}) ${h.datum}, adsetet syns inte i kampanjen. Väntar det på Axels publicering: vänta. Avbröts det: Axel kasserar utkastet och sessionen kör --adset-kasserat ${h.adset_id}. Raden stannar i kön (aldrig Approved)`); kvar.push({ ...a, hallen: true }); continue; }
      kvar.push(a);
    }
    // COPY CARD per annons. Syskonets kort gäller BARA när annonsen saknar eget
    // kort — ett eget kort som underkänns håller annonsen, med felet märkt.
    const granskat = kvar.map((a) => ({ a, g: kort.get(a.namn) ? granskaCopy(kort.get(a.namn), konfig) : null }));
    const godkand = granskat.find((p) => p.g?.ok)?.g ?? null;
    const annonser = granskat.map(({ a, g }) => ({ ...a, copy: g ? (g.ok ? g.copy : null) : godkand?.copy ?? null, copy_kalla: g ? (g.ok ? 'egen' : null) : godkand ? 'syskon' : null, copy_anm: g?.anm ?? [], copy_fel: g?.fel ?? [] }));
    for (const a of annonser) if (!a.hallen && a.copy) redo.push(a);
    const utanCopy = annonser.filter((a) => !a.hallen && !a.copy);
    const hallnaHar = annonser.filter((a) => a.hallen);
    if (utanCopy.length) {
      const fel = granskat.filter(({ a }) => utanCopy.some((x) => x.namn === a.namn)).flatMap(({ a, g }) => (g?.fel ?? []).map((f) => `${a.namn}: ${f}`));
      vantande.push({ ...k, annonser: utanCopy, status: 'vantar_copy', skal: [...skal, ...(fel.length ? fel : ['inget COPY CARD hittades — varken i repots brief.md eller i Notion-sidan']), 'kungen (eller sessionen) låter en sonnet-subagent skriva rubrik 2 och text 2 mot docs/copy-regler.md och lägger dem i briefens COPY CARD'] }); // CLAUDE.md regel 6
    }
    if (hallnaHar.length) vantande.push({ ...k, annonser: hallnaHar, status: 'stopp', utkast_opublicerat: true, skal });
    if (!utanCopy.length && !hallnaHar.length && skal.length > k.skal.length && !annonser.length) vantande.push({ ...k, annonser: [], status: 'stopp', redan_byggd: true, skal });
    return null;
  });
  const stoppade = koncept.filter((k) => k && k.status === 'stopp');
  const upptagna = new Set([...(lage?.adsets ?? []).map((a) => a.namn), ...skapade.map((r) => r.adset_namn)]);
  let batcher = redo.length ? batchaUppladdning(redo, konfig, { datum: datum ?? new Date().toISOString().slice(0, 10), upptagna }) : [];
  if (!lage) {
    batcher = batcher.map((k) => ({ ...k, status: 'vantar_struktur', skal: [...k.skal, 'strukturen i kampanjen lästes inte (kor.mjs --struktur) — utan den vet ingen hur många adsets som tar spend, och inget laddas upp'] }));
  } else {
    batcher = tilldelaPlatser(batcher, lage);
  }
  const alla = [...batcher, ...vantande, ...stoppade];
  const rakna = (st) => alla.filter((k) => k.status === st).length;
  return {
    koncept: alla,
    att_bygga: alla.filter((k) => k.status === 'klar'),
    vantar: alla.filter((k) => k.status !== 'klar' && k.status !== 'stopp'),
    stopp: alla.filter((k) => k.status === 'stopp'),
    struktur: lage,
    summa: { klara: rakna('klar'), vantar_plats: rakna('vantar_plats'), vantar_hookar: 0, vantar_copy: rakna('vantar_copy'), vantar_struktur: rakna('vantar_struktur'), stopp: rakna('stopp'), lediga: lage ? lage.lediga : null },
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
export async function hamtaKo(konfig, { logg = [], lage = null, grupper = [], hookrader = new Set(), prisavvikelse, datum = null, ...val } = {}) {
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
  const koncept = planeraKoncept(plan.klara, konfig, { kort, lage, grupper, logg, datum });
  return { rader, plan: { ...plan, ...koncept } };
}
