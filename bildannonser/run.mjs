// Genererar Bäverbutikens bildannonser ur en jobbfil som /bildannonser-rutinen
// har byggt från Notion. Kör alltid från repo-roten:
//
//   node bildannonser/run.mjs --jobb=<fil.json>          skarpt (drar kie.ai-credits)
//   node bildannonser/run.mjs --jobb=<fil.json> --dry    visar planen, genererar inget
//   node bildannonser/run.mjs --jobb=<fil.json> --ut=<mapp>
//
// Jobbfilen: { "datum": "YYYY-MM-DD", "jobb": [ { namn, typ, hub, notion_url,
//              prompt, bildformat?, filformat?, referens_bilder? } ] }
//
// Skriver bilderna + _manifest.json till bildannonser/output/<datum>/.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { genereraBild, KieFel, TILLATNA_BILDFORMAT } from './kie.mjs';

// Enda Typ-värdet den här rutinen får röra. Videorader ligger i samma Notion-hubbar
// och ska ALDRIG genereras här — spärren sitter i koden, inte bara i kommandofilen.
export const TILLATEN_TYP = 'Image - Pending Approval';

export function tolkaArgument(argv) {
  const varde = (flagga) => {
    const träff = argv.find((a) => a.startsWith(`${flagga}=`));
    return träff ? träff.slice(flagga.length + 1) : null;
  };
  return {
    jobbfil: varde('--jobb'),
    utMapp: varde('--ut'),
    dry: argv.includes('--dry'),
    samtidiga: Number(varde('--samtidiga') || 2),
  };
}

// Validerar ett jobb innan en enda krona bränns. Kastar med ett svenskt,
// åtgärdbart felmeddelande — aldrig en tyst överhoppning.
export function granskaJobb(jobb, index) {
  const var_ = (f) => `Jobb #${index + 1}${jobb?.namn ? ` (${jobb.namn})` : ''}: ${f}`;
  if (!jobb || typeof jobb !== 'object') throw new Error(var_('inte ett objekt.'));
  if (!jobb.namn) throw new Error(var_('saknar namn.'));
  if (jobb.typ !== TILLATEN_TYP) {
    throw new Error(
      var_(`Typ är "${jobb.typ ?? 'saknas'}" men bara "${TILLATEN_TYP}" får genereras. ` +
        'Videoannonser görs av redigerarna, aldrig av den här rutinen.'),
    );
  }
  if (!jobb.prompt || !String(jobb.prompt).trim()) throw new Error(var_('tom prompt.'));
  const format = jobb.bildformat || '4:5';
  if (!TILLATNA_BILDFORMAT.includes(format)) {
    throw new Error(var_(`ogiltigt bildformat "${format}".`));
  }
  const referenser = jobb.referens_bilder || [];
  if (!Array.isArray(referenser)) throw new Error(var_('referens_bilder måste vara en lista.'));
  return {
    ...jobb,
    bildformat: format,
    filformat: jobb.filformat || 'png',
    referens_bilder: referenser,
  };
}

export function granskaJobbfil(data) {
  if (!data || !Array.isArray(data.jobb)) {
    throw new Error('Jobbfilen saknar listan "jobb".');
  }
  const namn = new Set();
  return data.jobb.map((j, i) => {
    const granskat = granskaJobb(j, i);
    if (namn.has(granskat.namn)) {
      throw new Error(`Dubblett i jobbfilen: "${granskat.namn}" finns två gånger.`);
    }
    namn.add(granskat.namn);
    return granskat;
  });
}

// Filnamn ur annonsnamnet: bara det som är säkert på disk.
export function tillFilnamn(namn, filformat) {
  const rent = String(namn).trim().replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '');
  return `${rent || 'annons'}.${filformat}`;
}

async function laddaNer(url, sokvag, fetchImpl = globalThis.fetch) {
  const svar = await fetchImpl(url);
  if (!svar.ok) throw new Error(`Kunde inte hämta bilden: HTTP ${svar.status}`);
  await writeFile(sokvag, Buffer.from(await svar.arrayBuffer()));
}

// Kör jobben med begränsad samtidighet så vi inte spammar kie.ai.
export async function koraIPuljer(jobb, arbetare, samtidiga = 2) {
  const resultat = new Array(jobb.length);
  let nasta = 0;
  const trad = Array.from({ length: Math.max(1, Math.min(samtidiga, jobb.length)) }, async () => {
    for (;;) {
      const i = nasta++;
      if (i >= jobb.length) return;
      resultat[i] = await arbetare(jobb[i], i);
    }
  });
  await Promise.all(trad);
  return resultat;
}

export async function koraJobb(jobb, { utMapp, dry }) {
  const filnamn = tillFilnamn(jobb.namn, jobb.filformat);
  const fil = path.join(utMapp, filnamn);
  if (dry) {
    return {
      namn: jobb.namn,
      status: 'dry',
      hub: jobb.hub ?? null,
      notion_url: jobb.notion_url ?? null,
      bildformat: jobb.bildformat,
      referenser: jobb.referens_bilder.length,
      promptTecken: jobb.prompt.length,
      fil,
    };
  }
  try {
    const { taskId, modell, urler } = await genereraBild({
      prompt: jobb.prompt,
      referensBilder: jobb.referens_bilder,
      bildformat: jobb.bildformat,
      filformat: jobb.filformat,
    });
    await laddaNer(urler[0], fil);
    return {
      namn: jobb.namn,
      status: 'ok',
      hub: jobb.hub ?? null,
      notion_url: jobb.notion_url ?? null,
      taskId,
      modell,
      kalla: urler[0],
      fil,
    };
  } catch (fel) {
    return {
      namn: jobb.namn,
      status: 'fel',
      hub: jobb.hub ?? null,
      notion_url: jobb.notion_url ?? null,
      taskId: fel instanceof KieFel ? fel.taskId : null,
      fel: fel.message,
    };
  }
}

async function main() {
  const { jobbfil, utMapp: utArg, dry, samtidiga } = tolkaArgument(process.argv.slice(2));
  if (!jobbfil) {
    console.error('Använd: node bildannonser/run.mjs --jobb=<fil.json> [--dry] [--ut=<mapp>]');
    process.exit(2);
  }

  // Granskningen sker FÖRE första anropet: hittas ett trasigt jobb avbryts hela
  // körningen utan att en krona bränts, med ett läsbart fel i stället för en stacktrace.
  let data;
  let jobb;
  try {
    data = JSON.parse(await readFile(jobbfil, 'utf8'));
    jobb = granskaJobbfil(data);
  } catch (fel) {
    console.error(`Jobbfilen underkänd — inget genererat.\n  ${fel.message}`);
    process.exit(2);
  }

  const datum = data.datum || new Date().toISOString().slice(0, 10);
  const utMapp = utArg || path.join('bildannonser', 'output', datum);
  await mkdir(utMapp, { recursive: true });

  console.log(`${jobb.length} bildannonser${dry ? ' (DRY — inget genereras)' : ''} → ${utMapp}`);

  const resultat = await koraIPuljer(jobb, (j) => koraJobb(j, { utMapp, dry }), samtidiga);
  for (const r of resultat) {
    const ikon = r.status === 'ok' ? '✓' : r.status === 'dry' ? '·' : '✗';
    console.log(`  ${ikon} ${r.namn}${r.fel ? ` — ${r.fel}` : ''}`);
  }

  const manifest = { datum, dry, kord: new Date().toISOString(), resultat };
  await writeFile(path.join(utMapp, '_manifest.json'), JSON.stringify(manifest, null, 2));

  const ok = resultat.filter((r) => r.status === 'ok').length;
  const fel = resultat.filter((r) => r.status === 'fel').length;
  console.log(`Klart. ${ok} genererade, ${fel} fel → ${utMapp}/_manifest.json`);
  if (fel > 0) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await main();
}
