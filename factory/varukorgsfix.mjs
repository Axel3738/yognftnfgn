// Skriver fabrikens ms-paket.js till butikens LIVE-tema. Inget annat.
//
//   node factory/varukorgsfix.mjs <butik-id>            skriv + verifiera
//   node factory/varukorgsfix.mjs <butik-id> --torr     visa bara läget
//
// Varför den här filen finns: varukorgsfixen (2026-09-09) ägs av fabriken och
// skrivs över i varje butik av tema-steget — men tema-steget skriver till
// ARBETSTEMAT, och det som ligger publicerat är ett annat tema. TankGuard och
// HeimGuard stod därför live med den gamla filen dagen efter att buggen
// rapporterats löst. Mätt 2026-09-10 via CDN:en: båda butikerna serverade
// 5,9 kB minifierad kod med koden-före-varorna och dubbelköpet kvar.
//
// Regeln som gäller här (CLAUDE.md/PROCESS.md): en fabriksägd fil rättas i
// `factory/tema/assets/`, aldrig i en enskild butiks tema — och det här
// skriptet är vägen från repot till den publicerade butiken. Det rör BARA
// filerna i TEMAFILER. Sektioner, mallar, inställningar lämnas orörda.
import { anslut } from './token.mjs';
import { graphql, skrivTemafiler, verifieraTemafiler, hamtaTemafil } from './shopify.mjs';
import { TEMAFILER } from './tema.mjs';

// Ren logik, testad utan nätverk: exakt ett publicerat tema, annars stopp.
export function valjLiveTema(teman) {
  const live = (teman ?? []).filter((t) => String(t.role).toUpperCase() === 'MAIN');
  if (live.length !== 1) {
    const lista = (teman ?? []).map((t) => `${t.name} (${t.role})`).join(', ') || 'inga teman';
    throw new Error(`Hittar inte exakt ett publicerat tema (${live.length} st). Teman: ${lista}.`);
  }
  return live[0];
}

// Vad som skiljer live-filen från fabrikens — så rapporten säger något mer
// än "olika". De två markörerna är fixens två halvor.
export function jamforFil(live, fabrik) {
  const byte = (s) => Buffer.byteLength(s ?? '', 'utf8');
  return {
    identisk: live === fabrik,
    liveByte: byte(live),
    fabrikByte: byte(fabrik),
    harEnSubmit: (live ?? '').includes('stopImmediatePropagation'),
    harVarornaForst: /cart\/add\.js[\s\S]*?discount\//.test(live ?? '') && !/discount\/[\s\S]*?\.then[\s\S]*?cart\/add\.js/.test(live ?? ''),
  };
}

const sov = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const butik = process.argv[2];
  const torr = process.argv.includes('--torr');
  if (!butik) throw new Error('Ange butiks-id: node factory/varukorgsfix.mjs <butik-id>');

  // `tillatForbjuden`: Axels beslut 2026-09-10 — HeimGuard står i
  // FORBJUDNA_DOMANER för att ingen ska bygga en ny butik ovanpå den, men den
  // spärren höll också den här fixen borta medan butiken stod live med
  // dubbelköpet. Undantaget gäller enbart spärr 1 och enbart här: skriptet
  // skriver TEMAFILER till det publicerade temat och inget annat.
  const b = await anslut(butik, { utanEnvFil: true, sparrAlternativ: { tillatForbjuden: true } });
  const d = await graphql(`{ themes(first: 20) { nodes { id name role } } }`);
  const live = valjLiveTema(d.themes.nodes);
  console.log(`${b.name} (${b.domain}) · publicerat tema: "${live.name}"`);

  for (const [fil, fabrik] of Object.entries(TEMAFILER)) {
    const fore = jamforFil(await hamtaTemafil(live.id, fil), fabrik);
    console.log(
      `  ${fil}: ${fore.liveByte} byte i temat, ${fore.fabrikByte} i fabriken · ` +
        `identisk ${fore.identisk ? 'ja' : 'NEJ'} · en submit ${fore.harEnSubmit ? 'ja' : 'NEJ'} · varorna först ${fore.harVarornaForst ? 'ja' : 'NEJ'}`
    );
    if (fore.identisk) { console.log('  ✅ redan fabrikens fil — inget att göra.'); continue; }
    if (torr) { console.log('  (torr) skulle skriva fabrikens fil.'); continue; }

    await skrivTemafiler(live.id, { [fil]: fabrik });
    // Shopify hinner inte alltid före tillbakaläsningen (mätt på DryTrek) —
    // tre försök med paus, precis som tema-steget.
    let ok = false;
    for (let f = 1; f <= 3 && !ok; f++) {
      await sov(2000 * f);
      const v = await verifieraTemafiler(live.id, { [fil]: fabrik });
      ok = v.ok;
      if (!ok && f === 3) throw new Error(`Tillbakaläsningen stämmer inte: ${v.fel.join('; ')}`);
    }
    const efter = jamforFil(await hamtaTemafil(live.id, fil), fabrik);
    if (!efter.identisk) throw new Error(`${fil}: filen i temat är fortfarande inte fabrikens.`);
    console.log(`  ✅ skriven och tillbakaläst: ${efter.liveByte} byte, identisk med fabrikens.`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => { console.error(`❌ ${e.message}`); process.exit(1); });
}
