// kallor/discord.mjs — eskaleringskanalerna, lästa in i snapshoten.
//
// Axels beställning 2026-09-22: "koppla eskaleringskanalen". VA:n och
// rutinerna skriver i Discord — kundtjänstlarmen i #customer-service,
// leveransrapporterna i #ads-launching, problemen i #problem-and-revisions-ads,
// och varje OPS-butik har sin egen server med #customer-support och #ads.
// Utan den här läsningen måste Axel klicka sig in i elva servrar för att veta
// om något brinner. Nu läser hämtningen de senaste meddelandena per kanal och
// sidan visar dem per varumärke.
//
// Läs-bara. Boten måste vara med i servern (den är det i alla elva, mätt
// 2026-09-22). Kundadresser i texten maskeras innan de sparas — snapshoten
// committas till repot.

const API = 'https://discord.com/api/v10';

/**
 * Maskerar det som aldrig får in i snapshoten (den committas till repot):
 *   • mejladresser → ka***@gmail.com
 *   • lösenord, tokens och nycklar som står som "Password: xyz" → [dolt]
 * Mätt 2026-09-22: #norway-customer-support bar VA:ns brevlådelösenord i
 * klartext ("Password: …"). Utan den här raden hade det legat i git.
 */
export function maskera(text) {
  return String(text ?? '')
    .replace(/([A-Za-z0-9._%+-]{1,2})[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g, '$1***@$2')
    .replace(/\b(password|passw(?:or)?d|passord|lösenord|losenord|pwd|pin|token|api[_ -]?key|secret|hemlighet|nyckel)\b(\s*(?:is|är|er)?\s*[:=]?\s*)(\S+)/gi, '$1$2[dolt]');
}

async function api(stig, { env, fetchImpl = globalThis.fetch }) {
  const r = await fetchImpl(`${API}${stig}`, { headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` } });
  if (r.status === 429) {
    const vanta = Number((await r.json().catch(() => ({}))).retry_after ?? 1) * 1000;
    await new Promise((k) => setTimeout(k, Math.min(vanta, 10_000)));
    return api(stig, { env, fetchImpl });
  }
  if (!r.ok) throw new Error(`Discord ${r.status} på ${stig}`);
  return r.json();
}

/**
 * Läser kanalerna varje varumärke pekar ut i varumarken.json.
 * Returnerar { status, orsak, kanaler: [{ brand, server, kanal, roll, meddelanden }] }.
 * `roll` är 'eskalering' | 'annonser' | 'ovrigt' — samma ord som i registret.
 */
export async function hamtaEskalering(varumarken, { env = process.env, antal = 12, fetchImpl, logg = () => {} } = {}) {
  if (!env.DISCORD_BOT_TOKEN) return { status: 'saknas', orsak: 'DISCORD_BOT_TOKEN saknas i miljön', kanaler: [] };
  let servrar;
  try {
    servrar = await api('/users/@me/guilds', { env, fetchImpl });
  } catch (e) {
    return { status: 'fel', orsak: e.message, kanaler: [] };
  }
  const kanaler = [];
  const fel = [];
  for (const vm of varumarken) {
    for (const d of vm.discord ?? []) {
      const server = servrar.find((s) => s.id === d.server || s.name === d.server || s.name.toLowerCase() === String(d.server).toLowerCase());
      if (!server) { fel.push(`${vm.namn}: servern "${d.server}" syns inte för boten`); continue; }
      let lista;
      try {
        lista = (await api(`/guilds/${server.id}/channels`, { env, fetchImpl })).filter((k) => k.type === 0);
      } catch (e) { fel.push(`${vm.namn}: ${e.message}`); continue; }
      for (const roll of ['eskalering', 'annonser', 'ovrigt']) {
        for (const namn of d[roll] ?? []) {
          const k = lista.find((x) => x.name === namn);
          if (!k) { fel.push(`${vm.namn}: #${namn} finns inte i ${server.name}`); continue; }
          try {
            const m = await api(`/channels/${k.id}/messages?limit=${antal}`, { env, fetchImpl });
            kanaler.push({
              brand: vm.id, server: server.name, serverId: server.id, kanal: k.name, kanalId: k.id, roll,
              lank: `https://discord.com/channels/${server.id}/${k.id}`,
              meddelanden: m.map((x) => ({
                tid: x.timestamp,
                av: x.author?.global_name || x.author?.username || 'okänd',
                bot: Boolean(x.author?.bot),
                text: maskera(x.content || (x.embeds?.[0]?.description ?? x.embeds?.[0]?.title ?? '')).slice(0, 600),
                bilagor: (x.attachments ?? []).length,
              })),
            });
            logg(`  ${vm.namn} · ${server.name} #${k.name}: ${m.length} meddelanden`);
          } catch (e) {
            fel.push(`${vm.namn} #${namn}: ${e.message}`);
          }
        }
      }
    }
  }
  return {
    status: kanaler.length ? 'ok' : 'fel',
    orsak: fel.length ? fel.join(' · ') : null,
    hamtad: new Date().toISOString(),
    kanaler,
  };
}
