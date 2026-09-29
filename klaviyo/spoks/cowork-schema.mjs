// Cowork-prompten som schemalägger kampanjutkast i Spoks-appen. Spoks MCP kan varken
// välja publik eller schemalägga, så varje mejl är några klick i appen; prompten låter
// Cowork (Claude i Axels webbläsare) göra klicken. Listan byggs ur innehållsfilerna och
// uppladdningsloggen, aldrig för hand, så tid, publik och länk inte kan glida isär från
// det som faktiskt ligger i Spoks.
//
//   node klaviyo/spoks/cowork-schema.mjs --brand matstrumpor --fran 2026-09-30
//   node klaviyo/spoks/cowork-schema.mjs --brand matstrumpor --bara V04,V05
//   node klaviyo/spoks/cowork-schema.mjs --brand matstrumpor --jamfor <svar.json> [--facit <fil.json>]
//
// Skriver klaviyo/spoks/cowork/<brand>-schema-<första dag>.txt (klistras in i Cowork) och
// .json (facit: kod, postId, segment, lokal tid, UTC). --jamfor läser ett search_campaigns-svar
// (fields title,status,publishDate,notify; en lista eller { campaigns: [...] }) och säger per
// mejl om Spoks stämmer med facit: schemalagd, rätt tid och notify true. Publiken syns inte i
// search_campaigns; den mäts med update_segment utan acknowledgeWarnings (postsUsingSegment),
// se klaviyo/spoks/README.md.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROT } from '../mallar.mjs';
import { lasInnehall } from '../bygg.mjs';
import { kodFor, spoksLankar, attGranska } from '../gallerier.mjs';

const VECKODAG = ['sön', 'mån', 'tis', 'ons', 'tor', 'fre', 'lör'];

// Spoks egna segment, som står bland mottagarvalen bredvid våra (mätt 2026-09-26: "All
// subscribed", "Warmup tier 1–3" m.fl.). Cowork får aldrig välja dem.
export const SPOKS_EGNA = ['All contacts', 'All subscribed', 'All customers', 'All repeat customers', 'VIP customers', 'Warmup tier 1', 'Warmup tier 2', 'Warmup tier 3'];

// Lokal tid i butikens tidszon, med zonen som Spoks pill visar: "CEST (UTC+2)" / "CET (UTC+1)".
export function lokalTid(iso, tidszon = 'Europe/Stockholm') {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const p = Object.fromEntries(new Intl.DateTimeFormat('sv-SE', { timeZone: tidszon, year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'longOffset' }).formatToParts(d).map((x) => [x.type, x.value]));
  const vd = new Date(Date.UTC(+p.year, +p.month - 1, +p.day)).getUTCDay();
  const m = String(p.timeZoneName ?? '').match(/([+-])(\d{2}):?(\d{2})?/);
  const tim = m ? (m[1] === '-' ? -1 : 1) * Number(m[2]) : 0;
  const zon = tim === 2 ? 'CEST' : tim === 1 ? 'CET' : `UTC${tim >= 0 ? '+' : ''}${tim}`;
  return {
    datum: `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`,
    dag: `${VECKODAG[vd]} ${Number(p.day)}/${Number(p.month)}`,
    pill: `${String(p.day).padStart(2, '0')}.${String(p.month).padStart(2, '0')}`,
    tid: `${p.hour}:${p.minute}`,
    zon,
    zonText: tim ? `${zon} (UTC${tim > 0 ? '+' : ''}${tim})` : zon,
    utc: d.toISOString(),
  };
}

// Raderna prompten och facit bygger på. kampanjer = lasInnehall().kampanjer, spoks = Map
// mejl_id → postId (spoksLankar med mallen '{postId}'). bara = koder (V04, K05 …) som ensamma
// tas med, oavsett datum.
export function schemaRader({ kampanjer, spoks, tidszon = 'Europe/Stockholm', fran = null, bara = null }) {
  const koder = bara ? new Set(bara.map((k) => k.toUpperCase())) : null;
  const urval = koder
    ? [...kampanjer].filter((k) => koder.has(kodFor(k.id))).sort((a, b) => String(a.planerad).localeCompare(String(b.planerad)))
    : attGranska(kampanjer, fran);
  const rader = [];
  const fel = [];
  for (const k of urval) {
    const kod = kodFor(k.id);
    if (k.status_plan === 'parkerad') { fel.push(`${kod}: står på bänken (status_plan parkerad) och schemaläggs inte.`); continue; }
    const postId = spoks.get(k.id);
    if (!postId) { fel.push(`${kod}: inget Spoks-utkast i uppladdningsloggen (${k.id}).`); continue; }
    const seg = k.segment ?? [];
    if (seg.length !== 1) { fel.push(`${kod}: ${seg.length} segment i källfilen; Cowork väljer exakt ett.`); continue; }
    const t = lokalTid(k.planerad, tidszon);
    if (!t) { fel.push(`${kod}: planerad saknas eller går inte att läsa (${k.planerad}).`); continue; }
    rader.push({ kod, mejl_id: k.id, postId, segment: seg[0], amne: k.amnesrader?.[0]?.text ?? '', ...t });
  }
  if (koder) for (const kod of koder) if (!urval.some((k) => kodFor(k.id) === kod)) fel.push(`${kod}: finns inte bland kampanjfilerna.`);
  return { rader, fel };
}

// Segmentnamnen i arbetsytan ur uppladdningsloggen (typ segment), för listan "välj aldrig".
export function segmentNamn(loggText) {
  const namn = new Set();
  for (const rad of String(loggText).split('\n')) {
    if (!rad.trim()) continue;
    try { const r = JSON.parse(rad); if (r.typ === 'segment' && r.namn) namn.add(r.namn); } catch { /* trasig rad */ }
  }
  return [...namn];
}

export function promptText({ brand, arbetsyta, rader, lankMall, andraSegment = [], aldrig = [] }) {
  const anvanda = [...new Set(rader.map((r) => r.segment))];
  const forvaxla = [...new Set([...andraSegment.filter((s) => !anvanda.includes(s)), ...SPOKS_EGNA])];
  const zoner = [...new Set(rader.map((r) => r.zonText))];
  const lista = rader.map((r, i) => [
    `${String(i + 1).padStart(2, ' ')}. ${r.kod}  ${r.dag} kl ${r.tid}  (pillret: ${r.pill} kl ${r.tid} ${r.zonText})`,
    `    Till: ${r.segment}`,
    `    Ämnesrad: ${r.amne}`,
    `    ${lankMall.replace('{postId}', r.postId)}`,
  ].join('\n')).join('\n\n');
  const zonRad = zoner.length > 1
    ? `Sommartiden slutar natten mot söndag 25 oktober. Mejl före dess visar ${zoner.find((z) => z.startsWith('CEST')) ?? 'CEST (UTC+2)'} i pillret, mejl från 25/10 visar ${zoner.find((z) => z.startsWith('CET')) ?? 'CET (UTC+1)'}. Det är rätt. Skriv alltid klockslaget exakt som i listan och räkna aldrig om det.`
    : `Pillret ska visa ${zoner[0] ?? 'svensk tid'}. Skriv klockslaget exakt som i listan och räkna aldrig om det.`;
  const n = rader.length;
  return `Jag vill att du schemalägger ${n} färdiga ${n === 1 ? 'mejl' : 'mejl'} i Spoks för min butik ${brand.namn}. Innehållet är klart och granskat. Du ändrar ingen text och ingen bild. Du väljer bara mottagare och tid, ett mejl i taget. Gör allt i den här fliken och fråga mig om inloggning när du behöver den.

BAKGRUND, så du vet vad du tittar på.
Spoks är mitt mejlprogram, app.spoks.com. Butikens arbetsyta heter "${arbetsyta.namn}" och alla länkar nedan börjar med ${arbetsyta.app}/. Varje mejl ligger som ett utkast. Länken i listan öppnar utkastet direkt, så använd alltid länkarna: kampanjlistan i Spoks visar ämnesraden, inte koden. Ämnesraden står i listan så du kan känna igen mejlet. Ser du en titel, börjar den med koden (till exempel "${rader[0]?.kod ?? 'K02'} · …").
Spoks ritar bara upp sidan när fliken syns på skärmen. Är sidan helt vit: be mig ta fram fliken och ladda om den, och börja först när du ser Spoks meny. Ser du en inloggningssida: be mig logga in.
Arbetsytans tidszon är Stockholm. ${zonRad}

RÖR ALDRIG DE HÄR, oavsett vad du ser:
  - Skicka aldrig något direkt. Knappar som skickar eller publicerar NU (till exempel "Skicka nu", "Send now", "Publicera nu") trycker du aldrig på. Välj bara alternativet där du sätter datum och klockslag.
  - Ändra ingen text, ingen ämnesrad, ingen bild, inga produkter och inga länkar i mejlen.
  - Rör inga mejl som inte står i listan. Särskilt inte${aldrig.length ? ' ' + aldrig.join(', ') + ',' : ''} utkast vars titel börjar med "BÄNK" eller "SKICKAS INTE", och inget som redan är skickat.
  - Rör inga flöden (Flows / Flöden), inga inställningar, inga segment och inga kontakter. Skapa, ändra eller ta aldrig bort något segment.
  - Byt aldrig arbetsyta. Står det något annat än "${arbetsyta.namn}" som arbetsyta, eller börjar adressen inte med ${arbetsyta.app}/: stanna och fråga mig.
  - Ta aldrig bort något och kopiera aldrig ett mejl.

MOTTAGARNA.
Varje mejl går till EXAKT ett segment, och det heter exakt som i listan, tecken för tecken: ${anvanda.join(', ')}.
Det finns segment med nästan samma namn. Välj ALDRIG något av de här: ${forvaxla.join(', ')}.
Lägg inte till något under "exkludera" eller liknande. Står ett annat segment redan i fältet: ta bort det så att bara listans segment står kvar.
"Smart sending" ska vara AV på varje mejl. Med den på hoppar Spoks över alla som fått ett mejl de senaste 24 timmarna, och mejlen går ut varje dag kl 18, så den stryker nästan alla mottagare.
Visar Spoks en ruta om uppvärmning (warm-up, "I'll handle warmup manually" eller liknande): välj ingenting i rutan. Stanna och fråga mig, det är mitt beslut.

SÅ HÄR GÖR DU MED VARJE MEJL, i listans ordning:
  1. Öppna länken.
  2. Kontrollera att ämnesraden stämmer med listan (och koden, om du ser titeln). Stämmer det inte: gör ingenting med mejlet, skriv det i rapporten och ta nästa.
  3. Står det redan "Schemalagd kampanj" med ett pill "Kommer att publiceras …": ändra ingenting. Stämmer datum, klockslag och "Till:" med listan, skriv "redan schemalagd" i rapporten. Stämmer något inte, skriv exakt vad det står i rapporten. Ta nästa.
  4. Klicka i fältet "Till:" (på engelska "To:") och välj listans segment. Kontrollera att bara det står där.
  5. Klicka på "TITTA IGENOM" (på engelska "REVIEW"). Schemalägg aldrig utan att ha varit på granskningssidan: då publiceras mejlet på webben utan att någon får det.
  6. På granskningssidan: kontrollera ämnesraden och förhandstexten. Stäng av "Smart sending" (på svenska kanske "Smart sändning"). Kontrollera att antalet beräknade mottagare inte är 0.
  7. Klicka på "Planera" (på engelska "Schedule") längst ner på granskningssidan, välj datum och klockslag exakt som i listan och tryck "Tillämpa". Tryck aldrig "Publicera nu".
  8. Kontrollera resultatet: överst ska det stå "Schemalagd kampanj" och pillret ska säga "Kommer att publiceras <dag> <datum> kl <tid> …" med listans datum och klockslag, och "Till:" ska visa listans segment. Är tiden fel: rätta den med pennan bredvid pillret och kontrollera igen. Kan du läsa kampanjen bakom kulisserna: notify ska vara true. Står notify på false går mejlet inte ut: stanna och säg till mig.
  9. Skriv en rad i rapporten och ta nästa mejl.
Heter en knapp något annat än jag skrivit: leta på samma ställe, det är samma sak. Är du osäker på om en knapp skickar direkt: tryck inte, stanna och fråga mig.
Svarar Spoks med ett fel eller "försök igen": vänta en minut och försök en gång till. Går det inte då heller: stanna och skriv vid vilket mejl du stannade.

LISTAN (${n} mejl, i den ordning de går ut):

${lista}

NÄR DU ÄR KLAR.
Öppna ${arbetsyta.lankar?.kampanjer ?? `${arbetsyta.app}/campaigns`}, fliken med schemalagda kampanjer ("Planned" / "Planerade"). Räkna hur många som står där och ta en skärmdump av listan.
Rapportera sedan till mig i en tabell, en rad per mejl: kod | Till | datum och klockslag som pillret visar | schemalagd / redan schemalagd / hoppad och varför. Skriv under tabellen allt som såg konstigt ut, även om du löste det.
`;
}

// Jämför facit med ett search_campaigns-svar. Utfall per rad: ok, eller vad som skiljer.
export function jamfor(facit, svar) {
  const lista = Array.isArray(svar) ? svar : (svar?.campaigns ?? svar?.results ?? []);
  const perId = new Map(lista.map((c) => [c.id, c]));
  return facit.map((r) => {
    const c = perId.get(r.postId);
    if (!c) return { kod: r.kod, ok: false, fel: ['finns inte i svaret'] };
    const fel = [];
    if (!['waiting_to_be_published', 'published'].includes(c.status)) fel.push(`status ${c.status}`);
    const t = c.publishDate ? new Date(c.publishDate).getTime() : NaN;
    if (t !== new Date(r.utc).getTime()) fel.push(`tid ${c.publishDate ?? 'saknas'}, facit ${r.utc}`);
    if (c.notify !== true) fel.push(`notify ${c.notify}`);
    return { kod: r.kod, ok: fel.length === 0, fel };
  });
}

function arg(namn) {
  const i = process.argv.indexOf(namn);
  return i >= 0 ? process.argv[i + 1] : null;
}

async function main() {
  const brandId = arg('--brand') ?? 'matstrumpor';
  const utMapp = join(ROT, 'klaviyo', 'spoks', 'cowork');
  if (arg('--jamfor')) {
    const facitFil = arg('--facit') ?? (() => { throw new Error('--facit <fil.json> krävs tillsammans med --jamfor.'); })();
    const facit = JSON.parse(readFileSync(facitFil, 'utf8')).rader;
    const ut = jamfor(facit, JSON.parse(readFileSync(arg('--jamfor'), 'utf8')));
    for (const r of ut) console.log(`${r.ok ? '✅' : '❌'} ${r.kod.padEnd(6)} ${r.fel.join('; ')}`);
    const fel = ut.filter((r) => !r.ok).length;
    console.log(`${ut.length - fel} av ${ut.length} stämmer.`);
    if (fel) process.exit(1);
    return;
  }
  const brand = JSON.parse(readFileSync(join(ROT, 'klaviyo', 'brands', `${brandId}.json`), 'utf8'));
  const konto = join(ROT, 'klaviyo', 'konto', brandId);
  const arbetsyta = JSON.parse(readFileSync(join(konto, 'spoks.json'), 'utf8')).arbetsyta;
  const loggFil = join(konto, 'spoks-uppladdat.jsonl');
  const logg = existsSync(loggFil) ? readFileSync(loggFil, 'utf8') : '';
  const innehall = lasInnehall(join(ROT, 'klaviyo', 'innehall', brandId));
  if (innehall.fel.length) throw new Error(innehall.fel.join('\n'));
  const bara = arg('--bara') ? arg('--bara').split(',').map((s) => s.trim()).filter(Boolean) : null;
  const { rader, fel } = schemaRader({ kampanjer: innehall.kampanjer, spoks: spoksLankar(logg, '{postId}'), tidszon: brand.tidszon ?? arbetsyta.tidszon, fran: arg('--fran'), bara });
  for (const f of fel) console.log(`⚠️  ${f}`);
  if (!rader.length) throw new Error('Inga mejl att schemalägga.');
  // Det som redan gått eller står schemalagt utanför listan nämns vid namn i "rör aldrig".
  const aldrig = (arg('--aldrig') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const text = promptText({ brand, arbetsyta, rader, lankMall: arbetsyta.lankar.kampanj, andraSegment: segmentNamn(logg), aldrig });
  mkdirSync(utMapp, { recursive: true });
  const bas = join(utMapp, `${brandId}-schema-${rader[0].datum}${bara ? '-' + bara.join('-').toLowerCase() : ''}`);
  writeFileSync(`${bas}.txt`, text);
  writeFileSync(`${bas}.json`, JSON.stringify({ brand: brandId, byggd: new Date().toISOString(), rader }, null, 2) + '\n');
  console.log(`${bas}.txt: ${rader.length} mejl, ${rader[0].dag} till ${rader.at(-1).dag}`);
  console.log(`${bas}.json: facit (jämför efteråt med --jamfor <search_campaigns-svar.json> --facit ${bas}.json)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => { console.error(e.stack ?? e.message); process.exit(1); });
}
