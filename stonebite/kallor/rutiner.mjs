// kallor/rutiner.mjs — rutinvakten: körde rutinerna som de skulle?
//
// Axels beställning 2026-09-22: "alla rutiner, allting riktigt bra strukturerat
// som uppdaterar varje dag och visar så att inget är CP och så att alla och
// allt jobbar på som de ska". En rutin som tyst slutar köra ser exakt ut som
// en som fungerar — ända tills någon läser loggarna. Den här modulen läser
// loggarna åt honom.
//
// Sanningen är spåren, inte schemat: nästan varje rutin committar till main
// med en igenkännbar rubrik ("sparning carashell: …", "Nattvakten DryTrek …").
// stonebite/rutiner.json bär mönstret per rutin och hur ofta den ska köra;
// här läses git-loggen och varje rutin döms:
//   ok       — senaste spåret ligger inom förväntat intervall (× 1,5 marginal)
//   sen      — mer än så, men mindre än tre intervall
//   saknas   — inget spår på tre intervall, eller aldrig på 14 dagar
//   avstangd — rutinen är avstängd med flit (Axels beslut) — inget väntas
//   omatbar  — rutinen lämnar inget spår i repot (t.ex. tvistkollen)
// Ingen hämtning kan göra en rutin grön: bara ett riktigt spår kan.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const TIMME = 3_600_000;
const DAG = 24 * TIMME;
const TIDSZON = 'Europe/Stockholm';

export function lasRutiner(rot) {
  return JSON.parse(readFileSync(join(rot, 'stonebite', 'rutiner.json'), 'utf8')).rutiner ?? [];
}

/** Commit-rubrikerna på main de senaste dagarna: [{ tid, rubrik }], nyast först. */
export function gitSpar(rot, { dagar = 14 } = {}) {
  try {
    const ut = execFileSync('git', ['log', `--since=${dagar}.days`, '--format=%cI%x09%s', 'HEAD', 'origin/main'], {
      cwd: rot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 20_000,
    });
    return ut.split('\n').filter(Boolean).map((rad) => {
      const [tid, ...rest] = rad.split('\t');
      return { tid, rubrik: rest.join('\t') };
    });
  } catch {
    // Utan origin/main (t.ex. en grund klon) — försök med bara HEAD.
    try {
      const ut = execFileSync('git', ['log', `--since=${dagar}.days`, '--format=%cI%x09%s'], {
        cwd: rot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 20_000,
      });
      return ut.split('\n').filter(Boolean).map((rad) => {
        const [tid, ...rest] = rad.split('\t');
        return { tid, rubrik: rest.join('\t') };
      });
    } catch {
      return [];
    }
  }
}

/** Förväntat intervall mellan två körningar, i millisekunder. */
export function intervall(schema) {
  switch (schema?.typ) {
    case 'timme': return TIMME;
    case 'dag': return DAG;
    case 'var3dag': return 3 * DAG;
    case 'vecka': return (7 / Math.max(1, schema.veckodagar?.length ?? 1)) * DAG;
    default: return DAG;
  }
}

function stockholm(nu) {
  const delar = new Intl.DateTimeFormat('sv-SE', {
    timeZone: TIDSZON, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, weekday: 'short',
  }).formatToParts(nu);
  const f = Object.fromEntries(delar.map((d) => [d.type, d.value]));
  const veckodag = { 'mån': 1, 'tis': 2, 'ons': 3, 'tors': 4, 'fre': 5, 'lör': 6, 'sön': 0 }[f.weekday.replace('.', '')] ?? new Date(nu).getDay();
  return { datum: `${f.year}-${f.month}-${f.day}`, timme: Number(f.hour === '24' ? 0 : f.hour), minut: Number(f.minute), veckodag };
}

/** Svensk lokal tid → tidsstämpel. Räknar ut UTC-offset för just den dagen. */
function stockholmTillIso(datum, hh, mm) {
  const gissning = new Date(`${datum}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00Z`);
  const lokal = new Intl.DateTimeFormat('sv-SE', { timeZone: TIDSZON, hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(gissning);
  const f = Object.fromEntries(lokal.map((d) => [d.type, d.value]));
  const diff = ((Number(f.hour === '24' ? 0 : f.hour) * 60 + Number(f.minute)) - (hh * 60 + mm)) * 60_000;
  // Om gissningen "UTC = lokal" visade fel lokal tid är skillnaden offseten.
  let justerad = new Date(gissning.getTime() - diff);
  // Dygnsgräns (t.ex. 00:01 lokal ⇒ dagen före i UTC)
  if (Math.abs(diff) > 12 * TIMME) justerad = new Date(gissning.getTime() - diff + (diff > 0 ? DAG : -DAG));
  return justerad.toISOString();
}

/** Nästa förväntade körning enligt schemat, som ISO-tid. */
export function nastaKorning(schema, { nu = new Date() } = {}) {
  const s = stockholm(nu);
  if (!schema) return null;
  if (schema.typ === 'timme') {
    const minut = Number(schema.minut ?? 0);
    const kandidat = new Date(nu);
    kandidat.setUTCSeconds(0, 0);
    const nuMin = kandidat.getUTCMinutes();
    kandidat.setUTCMinutes(minut);
    if (minut <= nuMin) kandidat.setTime(kandidat.getTime() + TIMME);
    return kandidat.toISOString();
  }
  const [hh, mm] = String(schema.tid ?? '00:00').split(':').map(Number);
  const dagar = schema.typ === 'vecka' ? (schema.veckodagar ?? [1]) : null;
  for (let i = 0; i <= 8; i++) {
    const d = new Date(nu.getTime() + i * DAG);
    const sd = stockholm(d);
    if (dagar && !dagar.includes(sd.veckodag)) continue;
    if (i === 0 && (hh * 60 + mm) <= (s.timme * 60 + s.minut)) continue;
    if (schema.typ === 'var3dag' && schema.dagIManaden) {
      const dagNr = Number(sd.datum.slice(-2));
      if (!schema.dagIManaden(dagNr)) continue;
    }
    return stockholmTillIso(sd.datum, hh, mm);
  }
  return null;
}

/** Läsbar svensk tid för schemat: "varje timme :16", "13:20 varje dag", "07:00 mån + tors". */
export function schematext(schema) {
  const NAMN = ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'];
  switch (schema?.typ) {
    case 'timme': return `varje timme :${String(schema.minut ?? 0).padStart(2, '0')}`;
    case 'dag': return `${schema.tid} varje dag`;
    case 'var3dag': return `${schema.tid} var tredje dag`;
    case 'vecka': return `${schema.tid} ${(schema.veckodagar ?? []).map((d) => NAMN[d]).join(' + ')}`;
    default: return schema?.tid ?? '';
  }
}

/** Senaste commit som rörde en sökväg (för rutiner utan egen rubrik). */
export function sokvagSpar(rot, sokvag) {
  try {
    const ut = execFileSync('git', ['log', '-1', '--format=%cI', 'HEAD', 'origin/main', '--', sokvag], {
      cwd: rot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 20_000,
    }).trim();
    return ut || null;
  } catch {
    return null;
  }
}

/**
 * Dömer EN rutin mot spåren. Ren funktion — testas utan git.
 * @param rutin  posten ur rutiner.json
 * @param spar   [{ tid, rubrik }] ur gitSpar()
 * @param sokvagTid  senaste commit-tid för rutin.spar.sokvag (om typ sokvag)
 */
export function bedomRutin(rutin, spar, { nu = new Date(), dagar = 14, sokvagTid = null } = {}) {
  const bas = {
    id: rutin.id, namn: rutin.namn, brand: rutin.brand ?? null, kommando: rutin.kommando ?? null,
    schema: rutin.schema ?? null, schematext: schematext(rutin.schema), vad: rutin.vad ?? '',
    senast: null, antal: 0, nasta: nastaKorning(rutin.schema, { nu }), avstangd: Boolean(rutin.avstangd),
  };
  if (!rutin.spar || rutin.spar.typ === 'ingen') {
    if (rutin.avstangd) return { ...bas, status: 'avstangd', ord: rutin.avstangd_orsak ?? 'avstängd med flit', nasta: null };
    return { ...bas, status: 'omatbar', ord: rutin.spar?.orsak ?? 'lämnar inget spår i repot' };
  }

  let senast = null;
  let antal = 0;
  if (rutin.spar.typ === 'sokvag') {
    senast = sokvagTid;
    antal = senast ? 1 : 0;
  } else {
    const re = new RegExp(rutin.spar.monster, 'i');
    const traffar = spar.filter((s) => re.test(s.rubrik)).sort((a, b) => (a.tid < b.tid ? 1 : -1));
    senast = traffar[0]?.tid ?? null;
    antal = traffar.length;
  }
  const iv = intervall(rutin.schema);
  const alder = senast ? nu.getTime() - new Date(senast).getTime() : null;

  // Avstängd med flit: inget väntas. Men ett FÄRSKT spår vinner över flaggan —
  // då är registret gammalt, och det ska sidan säga i stället för att dölja
  // en rutin som faktiskt kör.
  if (rutin.avstangd) {
    if (alder !== null && alder <= iv * 1.5) {
      return { ...bas, status: 'ok', senast, antal, ord: `${statusord('ok', alder, iv)} — trots att registret säger avstängd; flaggan är gammal` };
    }
    return { ...bas, status: 'avstangd', senast, antal, ord: rutin.avstangd_orsak ?? 'avstängd med flit', nasta: null };
  }

  if (!senast) {
    return { ...bas, status: 'saknas', antal: 0, ord: `inget spår på ${dagar} dagar` };
  }
  const status = alder <= iv * 1.5 ? 'ok' : alder <= iv * 3 ? 'sen' : 'saknas';
  return { ...bas, status, senast, antal, ord: statusord(status, alder, iv) };
}

function statusord(status, alder, iv) {
  const tim = Math.round(alder / TIMME);
  const senastText = tim < 1 ? 'för mindre än en timme sedan' : tim < 48 ? `för ${tim} h sedan` : `för ${Math.round(alder / DAG)} dygn sedan`;
  if (status === 'ok') return `körde ${senastText}`;
  if (status === 'sen') return `sen — körde ${senastText}, väntat var ${Math.round(iv / TIMME)} h`;
  return `saknas — senast ${senastText}, väntat var ${Math.round(iv / TIMME)} h`;
}

/** Hela läget: alla rutiner dömda + summering. Det som hamnar i snapshoten. */
export function rutinlage(rot, { nu = new Date(), dagar = 14 } = {}) {
  let rutiner;
  try {
    rutiner = lasRutiner(rot);
  } catch (e) {
    return { status: 'fel', orsak: `stonebite/rutiner.json: ${e.message}`, rutiner: [], summering: null };
  }
  const spar = gitSpar(rot, { dagar });
  const domda = rutiner.map((r) => bedomRutin(r, spar, {
    nu, dagar, sokvagTid: r.spar?.typ === 'sokvag' ? sokvagSpar(rot, r.spar.sokvag) : null,
  }));
  const summering = { ok: 0, sen: 0, saknas: 0, avstangd: 0, omatbar: 0 };
  for (const d of domda) summering[d.status] = (summering[d.status] ?? 0) + 1;
  return {
    status: spar.length ? 'ok' : 'saknas',
    orsak: spar.length ? null : 'git-loggen gick inte att läsa — inga spår att döma mot',
    matt: nu.toISOString(),
    dagar,
    rutiner: domda,
    summering,
    // De senaste körningarna, som "det här hände" i kalendern.
    handelser: spar
      .map((s) => {
        const r = rutiner.find((x) => x.spar?.monster && new RegExp(x.spar.monster, 'i').test(s.rubrik));
        return r ? { tid: s.tid, rutin: r.id, namn: r.namn, brand: r.brand ?? null, rubrik: s.rubrik } : null;
      })
      .filter(Boolean)
      .slice(0, 400),
  };
}
