// mail.mjs — CLI:n för supportbrevlådan på Loopia, läs-bara, över webbmejlen.
//
//   node kundtjanst/mail.mjs kolla                      logga in och ut — funkar nycklarna?
//   node kundtjanst/mail.mjs mappar                     mappnamnen (INBOX, Sent, Drafts …)
//   node kundtjanst/mail.mjs lista [--mapp INBOX] [--sida 1] [--antal 20]
//   node kundtjanst/mail.mjs las <uid> [--mapp INBOX] [--ra] [--max 4000]
//   node kundtjanst/mail.mjs sok "<ord …>" [--mapp INBOX] [--sidor 4] [--kropp]
//
// Gemensamt: --brand <id> (behövs bara när flera brevlådor är konfigurerade),
// --json (maskinläsbart, det MCP-servern och andra skript vill ha), --tyst.
//
// Nycklarna är samma som veckorapportens: KUNDTJANST_MAIL_PASS_<ID> (och
// KUNDTJANST_MAIL_USER_<ID> om användaren inte är supportmailen i brandfilen).
// Kör `node kundtjanst/setup.mjs` för att se vad som saknas.
//
// ⚠️ Kundadresser skrivs ut i klartext här — det är ett verktyg för den som
// redan har lösenordet till brevlådan. Klistra aldrig utdata rakt in i Discord
// eller Notion; rapporterna (run.mjs) maskerar av en anledning.

import { oppnaBrevlada } from './brevlada.mjs';

export function tolkaArgv(argv) {
  const val = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { val._.push(a); continue; }
    const namn = a.slice(2);
    const nasta = argv[i + 1];
    if (nasta !== undefined && !nasta.startsWith('--') && !['json', 'ra', 'kropp', 'tyst', 'hjalp', 'help'].includes(namn)) { val[namn] = nasta; i++; }
    else val[namn] = true;
  }
  return val;
}

const HJALP = `Brevlådan (Loopia webbmejl, läs-bara)

  node kundtjanst/mail.mjs kolla                          logga in och ut
  node kundtjanst/mail.mjs mappar                         mappnamnen
  node kundtjanst/mail.mjs lista [--mapp INBOX] [--sida 1] [--antal 20]
  node kundtjanst/mail.mjs las <uid> [--mapp INBOX] [--ra] [--max 4000]
  node kundtjanst/mail.mjs sok "<ord …>" [--mapp INBOX] [--sidor 4] [--kropp]

  --brand <id>   vilken brevlåda (bara när flera är konfigurerade)
  --json         maskinläsbart
  --tyst         inga loggrader på stderr
`;

function radTabell(rader) {
  const bredd = (n) => Math.min(n, 40);
  const fr = Math.max(4, ...rader.map((r) => bredd(r.fran.length)));
  return rader.map((r) => `${String(r.uid).padStart(6)}  ${r.last ? ' ' : '•'}  ${r.datum.padEnd(17).slice(0, 17)}  ${r.fran.slice(0, 40).padEnd(fr)}  ${r.amne}${r.traff === 'text' && r.utdrag ? `\n${' '.repeat(29 + fr)}↳ ${r.utdrag}` : ''}`);
}

export async function korKommando(kommando, val, brevlada) {
  switch (kommando) {
    case 'kolla': {
      await brevlada.loggaIn();
      const mappar = await brevlada.mappar();
      await brevlada.loggaUt();
      return { ok: true, brand: brevlada.id, user: brevlada.user, mappar };
    }
    case 'mappar': {
      const mappar = await brevlada.mappar();
      return { brand: brevlada.id, mappar };
    }
    case 'lista': {
      return brevlada.lista({ mapp: val.mapp, sida: Number(val.sida) || 1, antal: Number(val.antal) || 20 });
    }
    case 'las': {
      const uid = val._[1];
      if (!uid) throw new Error('las behöver ett uid: node kundtjanst/mail.mjs las 1234');
      return brevlada.las(uid, { mapp: val.mapp, ra: Boolean(val.ra), maxTecken: Number(val.max) || 0 });
    }
    case 'sok': {
      const fraga = val._.slice(1).join(' ');
      if (!fraga) throw new Error('sok behöver ett eller flera ord: node kundtjanst/mail.mjs sok "order 1042"');
      return brevlada.sok(fraga, { mapp: val.mapp, maxSidor: Number(val.sidor) || 4, kropp: Boolean(val.kropp), max: Number(val.max) || 50 });
    }
    default:
      throw new Error(`Okänt kommando "${kommando}".\n\n${HJALP}`);
  }
}

/** Utskriften för människor. JSON sköts av huvud(). */
export function skrivUt(kommando, r) {
  switch (kommando) {
    case 'kolla':
      return `✅ ${r.brand}: inloggad som ${r.user}, ${r.mappar.length} mappar (${r.mappar.join(', ')})`;
    case 'mappar':
      return r.mappar.map((m) => `  ${m}`).join('\n');
    case 'lista':
      return `${r.mapp} — sida ${r.sida} av ${r.sidor}, ${r.totalt} mejl${Number.isFinite(r.olasta) ? `, ${r.olasta} olästa` : ''}\n\n   uid  •  datum              från${' '.repeat(Math.max(0, Math.max(4, ...r.rader.map((x) => Math.min(x.fran.length, 40))) - 4))}  ämne\n${radTabell(r.rader).join('\n')}`;
    case 'las':
      return [
        `Från:  ${r.fran.namn ? `${r.fran.namn} <${r.fran.adress}>` : r.fran.adress}`,
        `Till:  ${r.till.map((t) => t.adress).join(', ')}`,
        `Datum: ${r.datum ?? '?'}`,
        `Ämne:  ${r.amne}`,
        `Mapp:  ${r.mapp} · uid ${r.uid}${r.autosvar ? ' · autosvar' : ''}${r.listmejl ? ' · listmejl' : ''}`,
        '',
        r.ra ?? r.helText,
      ].join('\n');
    case 'sok':
      return `${r.traffar.length} träffar på "${r.fraga}" i ${r.mapp} (${r.lasta} mejl lästa, sida 1–${r.sidorLasta} av ${r.sidor}${r.klippt ? ', klippt vid max' : ''})\n\n${radTabell(r.traffar).join('\n')}`;
    default:
      return JSON.stringify(r, null, 2);
  }
}

async function huvud() {
  const val = tolkaArgv(process.argv.slice(2));
  const kommando = val._[0];
  if (!kommando || val.hjalp || val.help) { console.log(HJALP); return; }
  const logg = val.tyst ? () => {} : (s) => console.error(`· ${s}`);
  const brevlada = oppnaBrevlada(val.brand, { logg });
  try {
    const r = await korKommando(kommando, val, brevlada);
    console.log(val.json ? JSON.stringify(r, null, 2) : skrivUt(kommando, r));
  } finally {
    await brevlada.loggaUt();
  }
}

if (process.argv[1] && process.argv[1].endsWith('mail.mjs')) {
  // Samma grepp som run.mjs: Nodes fetch läser inte HTTPS_PROXY själv i alla
  // versioner — starta om under flaggan så webbmejlen nås genom sessionens proxy.
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1') {
    const { spawnSync } = await import('node:child_process');
    // NODE_NO_WARNINGS: annars skriver Node "EnvHttpProxyAgent is experimental" på stderr vid varje körning.
    const r = spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' } });
    process.exit(r.status ?? 1);
  }
  huvud().catch((e) => { console.error(`✗ ${e.message}`); process.exit(1); });
}
