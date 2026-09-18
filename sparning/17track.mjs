// 17TRACK:s spårnings-API (api.17track.net, v2.4, dokumentation läst
// 2026-09-18). Nyckeln heter `TRACK17_API_KEY` i Environments på claude.ai och
// skickas i headern `17token`. Max 40 nummer per anrop, 3 anrop/sekund —
// klienten köar själv och väntar vid 429.
//
// Två anrop används: /register (kostar kvot, en gång per paket) och
// /gettrackinfo (gratis, läser det 17TRACK samlat). /stoptrack finns för
// paket som inte ska följas längre.

const BAS = 'https://api.17track.net/track/v2.4';
const PER_ANROP = 40;
const PAUS_MS = 400;

export function nyckel(env = process.env) {
  return env.TRACK17_API_KEY ?? null;
}

let senast = 0;
async function anrop(sokvag, kropp, { forsok = 0 } = {}) {
  const k = nyckel();
  if (!k) throw new Error('TRACK17_API_KEY saknas i miljön — lägg in nyckeln i Environments på claude.ai (syns först i en ny container).');
  const vantetid = senast + PAUS_MS - Date.now();
  if (vantetid > 0) await new Promise((ok) => setTimeout(ok, vantetid));
  senast = Date.now();
  const r = await fetch(`${BAS}${sokvag}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', '17token': k },
    body: JSON.stringify(kropp),
  });
  if (r.status === 429 && forsok < 3) {
    await new Promise((ok) => setTimeout(ok, 1500 * (forsok + 1)));
    return anrop(sokvag, kropp, { forsok: forsok + 1 });
  }
  const text = await r.text();
  let j;
  try { j = JSON.parse(text); } catch { throw new Error(`17TRACK ${sokvag}: HTTP ${r.status}, inget JSON: ${text.slice(0, 200)}`); }
  if (!r.ok || (j.code !== undefined && j.code !== 0)) {
    throw new Error(`17TRACK ${sokvag}: HTTP ${r.status}, code ${j.code}: ${JSON.stringify(j.data ?? j).slice(0, 300)}`);
  }
  return j.data ?? {};
}

function batchar(lista) {
  const ut = [];
  for (let i = 0; i < lista.length; i += PER_ANROP) ut.push(lista.slice(i, i + PER_ANROP));
  return ut;
}

// poster: [{ number, carrier? }]. Returnerar { accepterade: [nummer],
// avvisade: [{ number, kod, fel }] }. Ett nummer som redan är registrerat
// avvisas av 17TRACK med en egen kod — det räknas här som accepterat, för
// det är registrerat.
export async function registrera(poster) {
  const accepterade = [];
  const avvisade = [];
  for (const b of batchar(poster)) {
    const d = await anrop('/register', b.map((p) => (p.carrier ? { number: p.number, carrier: p.carrier } : { number: p.number })));
    for (const a of d.accepted ?? []) accepterade.push(a.number);
    for (const r of d.rejected ?? []) {
      const kod = r.error?.code;
      const text = String(r.error?.message ?? '');
      if (/already|exist/i.test(text) || kod === -18019901) accepterade.push(r.number);
      else avvisade.push({ number: r.number, kod, fel: text });
    }
  }
  return { accepterade, avvisade };
}

// poster: [{ number, carrier? }]. Returnerar de accepterade råposterna (med
// track_info) plus de avvisade.
export async function hamta(poster) {
  const accepterade = [];
  const avvisade = [];
  for (const b of batchar(poster)) {
    const d = await anrop('/gettrackinfo', b.map((p) => (p.carrier ? { number: p.number, carrier: p.carrier } : { number: p.number })));
    accepterade.push(...(d.accepted ?? []));
    for (const r of d.rejected ?? []) avvisade.push({ number: r.number, kod: r.error?.code, fel: r.error?.message ?? '' });
  }
  return { accepterade, avvisade };
}

export async function slutaFolja(poster) {
  let antal = 0;
  for (const b of batchar(poster)) {
    const d = await anrop('/stoptrack', b.map((p) => (p.carrier ? { number: p.number, carrier: p.carrier } : { number: p.number })));
    antal += (d.accepted ?? []).length;
  }
  return antal;
}
