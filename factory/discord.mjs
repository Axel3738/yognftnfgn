// Discord-steget: varje ny OPS-butik får en egen, färdigstrukturerad
// Discord-server + en redigerare plockad ur standby-listan (Axels beslut
// 2026-09-07). Noll beroenden — inbyggda fetch mot Discords REST-API.
//
//   node factory/discord.mjs factory/butiker/<butik>.yaml --guild <id> [--ikon <logga.png>]
//   ... --torr        visa planen utan att röra Discord eller listan
//
// Kräver env DISCORD_BOT_TOKEN (bot-token, INTE webhook). ⚠️ Boten kan INTE
// skapa servrar: POST /guilds svarar 400 kod 20001 "Bots cannot use this
// endpoint" (mätt på TankGuard 2026-09-08, boten satt i 3 servrar — gränsen
// "färre än 10" gäller alltså inte längre). Servern skapas därför alltid av
// en människa (checklistans avsnitt 9) som auktoriserar boten via länken skriptet
// skriver ut utan --guild; sen bygger boten kanalerna med --guild <id>.
//
// Redigerarlistan bor i factory/redigerare/standby.md (byggs av
// rekryteringsmotorn, se factory/PLAN.md punkt 4). Första raden med status
// "redo" plockas och märks som tilldelad. Ingen lista = servern byggs ändå,
// plockningen rapporteras som manuell.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { lasYaml } from './yaml.mjs';
import { laddaEnv } from './env.mjs';

// Läs factory/.env precis som ops.mjs och meta-setup.mjs — utan den dog en
// rak körning på "Saknar DISCORD_BOT_TOKEN" fast tokenen låg tre rader bort.
laddaEnv();

const FACTORY_ROT = dirname(fileURLToPath(import.meta.url));
const STANDBY = join(FACTORY_ROT, 'redigerare', 'standby.md');
const API = 'https://discord.com/api/v10';

// Kanalstrukturen enligt Axels spec 2026-09-07. Ordningen är arbetsflödets:
// strategi → todo → uppladdning → granskning/ads → support. Konton-kanalen
// är PRIVAT (bara ägare + tilldelad redigerare ser den) — lösenord ska aldrig
// ligga i en kanal hela teamet läser.
export function byggKanalplan(brand) {
  return {
    servernamn: `${brand} — OPS`,
    kategorier: [
      {
        namn: 'PRODUKTION',
        kanaler: [
          { namn: 'creative-strategy', amne: 'Creative strategy, DNA, vinklar och info om produkten. Läs här innan du bygger något.' },
          { namn: 'ads-to-do', amne: 'Att göra-listan för annonser. En rad per uppgift, bocka av när klart.' },
          { namn: 'annons-uppladdning', amne: 'Ladda upp färdiga annonser här. En tråd per batch.' },
          { namn: 'ads', amne: 'Diskussion om annonserna: vad som är live, utfall, feedback.' },
        ],
      },
      {
        namn: 'DRIFT',
        kanaler: [
          { namn: 'konton', amne: 'Konton och inlogg. PRIVAT kanal — bara ägaren och butikens redigerare.', privat: true },
          { namn: 'customer-support', amne: 'Kundärenden: returer, leveransfrågor, reklamationer.' },
        ],
      },
    ],
  };
}

// Plockar första redigeraren med status "redo" ur standby-listan (ren funktion
// så den går att testa). Raderna är en markdown-tabell: | namn | kontakt | status |
export function valjNastaRedigerare(listtext, butik, datum) {
  const rader = String(listtext).split('\n');
  for (let i = 0; i < rader.length; i++) {
    const celler = rader[i].split('|').map((c) => c.trim());
    if (celler.length >= 4 && celler[3].toLowerCase() === 'redo') {
      const uppdaterad = [...rader];
      uppdaterad[i] = rader[i].replace(/\|\s*redo\s*\|/i, `| tilldelad ${butik} ${datum} |`);
      return { namn: celler[1], kontakt: celler[2], nyText: uppdaterad.join('\n') };
    }
  }
  return null;
}

async function discord(sokvag, { metod = 'GET', kropp = null } = {}) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error('Saknar DISCORD_BOT_TOKEN i miljön.');
  const svar = await fetch(`${API}${sokvag}`, {
    method: metod,
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: kropp ? JSON.stringify(kropp) : undefined,
  });
  const data = await svar.json().catch(() => ({}));
  if (!svar.ok) throw new Error(`Discord ${metod} ${sokvag} → ${svar.status}: ${JSON.stringify(data).slice(0, 200)}`);
  return data;
}

// Ett meddelande i en kanal boten redan ser. Används av startskottet
// (factory/startskott.mjs --discord) — larmet "KLAR FÖR OPS" till Axel.
// Returnerar Discords meddelandeobjekt (id + channel_id) som tillbakaläsning.
export async function skickaMeddelande(kanalId, innehall) {
  if (!kanalId) throw new Error('skickaMeddelande kräver ett kanal-id.');
  return discord(`/channels/${kanalId}/messages`, { metod: 'POST', kropp: { content: innehall } });
}

// Bygger kanalstrukturen i servern guildId. Utan guildId försöks POST /guilds
// — det svarar 20001 för botar (mätt 2026-09-08), så huvud() släpper aldrig
// hit utan --guild; försöket ligger kvar bara för att ge Discords eget
// felmeddelande om läget någon gång ändras.
export async function byggServer(brand, guildId = null, ikonFil = null) {
  const plan = byggKanalplan(brand);
  let guild = guildId;
  if (!guild) {
    const skapad = await discord('/guilds', { metod: 'POST', kropp: { name: plan.servernamn } });
    guild = skapad.id;
  }
  const resultat = { guildId: guild, kanaler: [] };
  // Serverikonen: butikens logga (kräver Manage Server på boten).
  if (ikonFil) {
    const b64 = readFileSync(ikonFil).toString('base64');
    await discord(`/guilds/${guild}`, { metod: 'PATCH', kropp: { icon: `data:image/png;base64,${b64}` } })
      .then(() => { resultat.ikon = 'satt'; })
      .catch((e) => { resultat.ikon = `gick inte: ${e.message.slice(0, 80)}`; });
  }
  for (const kategori of plan.kategorier) {
    const kat = await discord(`/guilds/${guild}/channels`, {
      metod: 'POST',
      kropp: { name: kategori.namn, type: 4 },
    });
    for (const kanal of kategori.kanaler) {
      const kropp = { name: kanal.namn, type: 0, topic: kanal.amne, parent_id: kat.id };
      if (kanal.privat) {
        // @everyone nekas läsa — ägaren och redigerarrollen bjuds in för hand
        // (roll-id:n finns inte förrän servern har medlemmar).
        kropp.permission_overwrites = [{ id: guild, type: 0, deny: '1024' }];
      }
      await discord(`/guilds/${guild}/channels`, { metod: 'POST', kropp });
      resultat.kanaler.push(`${kategori.namn}/${kanal.namn}${kanal.privat ? ' (privat)' : ''}`);
    }
  }
  // Invite så Axel kan gå med direkt.
  const kanalLista = await discord(`/guilds/${guild}/channels`);
  const forsta = kanalLista.find((k) => k.type === 0);
  if (forsta) {
    const invite = await discord(`/channels/${forsta.id}/invites`, {
      metod: 'POST',
      kropp: { max_age: 0, max_uses: 0 },
    });
    resultat.invite = `https://discord.gg/${invite.code}`;
  }
  return resultat;
}

async function huvud() {
  const arg = process.argv.slice(2);
  const butiksfil = arg.find((a) => !a.startsWith('--'));
  const guildId = arg.includes('--guild') ? arg[arg.indexOf('--guild') + 1] : null;
  const ikonFil = arg.includes('--ikon') ? arg[arg.indexOf('--ikon') + 1] : null;
  const torr = arg.includes('--torr') || arg.includes('--dry');
  if (!butiksfil) {
    console.error('Användning: node factory/discord.mjs factory/butiker/<butik>.yaml [--guild <id>] [--torr]');
    process.exit(1);
  }
  const butik = lasYaml(readFileSync(butiksfil, 'utf8'));
  const brand = butik?.butik?.brand;
  const id = butik?.butik?.id;
  if (!brand) { console.error('Butiksfilen saknar butik.brand.'); process.exit(1); }

  const plan = byggKanalplan(brand);
  console.log(`\nDiscord-server för ${brand}:`);
  for (const kat of plan.kategorier) {
    for (const k of kat.kanaler) console.log(`  #${k.namn}${k.privat ? ' (privat)' : ''} — ${k.amne}`);
  }

  if (torr) { console.log('\n(torrkörning — inget skapades)'); return; }

  // Boten kan inte skapa servrar (20001) — utan --guild skrivs auktoriserings-
  // länken ut som VA:n öppnar efter att hon skapat servern (steg 9).
  if (!guildId) {
    const app = await discord('/oauth2/applications/@me');
    // Manage Channels + Manage Roles + Manage Guild (ikon) + Create Invite.
    const lank = `https://discord.com/oauth2/authorize?client_id=${app.id}&scope=bot&permissions=268435505`;
    console.log(`\n🖐 Boten kan inte skapa servrar (checklistans avsnitt 9). Skapa servern "${plan.servernamn}" i Discord, öppna länken och välj servern:`);
    console.log(`   ${lank}`);
    console.log('   Sen: node factory/discord.mjs <butik.yaml> --guild <server-id> [--ikon <logga.png>]');
    process.exit(1);
  }

  const resultat = await byggServer(brand, guildId, ikonFil);
  console.log(`\n✅ Server klar (guild ${resultat.guildId})`);
  if (resultat.invite) console.log(`   Invite: ${resultat.invite}`);
  if (resultat.ikon) console.log(`   Serverikon: ${resultat.ikon}`);

  if (existsSync(STANDBY)) {
    const val = valjNastaRedigerare(readFileSync(STANDBY, 'utf8'), id, new Date().toISOString().slice(0, 10));
    if (val) {
      writeFileSync(STANDBY, val.nyText);
      console.log(`✅ Redigerare plockad ur standby-listan: ${val.namn} (${val.kontakt}) — märkt tilldelad.`);
      console.log('   Bjud in hen till servern och ge åtkomst till #konton.');
    } else {
      console.log('🖐 Standby-listan har ingen med status "redo" — rekrytera (factory/PLAN.md punkt 4).');
    }
  } else {
    console.log('🖐 Ingen standby-lista ännu (factory/redigerare/standby.md) — redigeraren plockas för hand.');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  huvud().catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
