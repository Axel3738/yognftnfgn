// Bävern — Discord-boten. Startas av Railway med `npm start`.
//
// Env som krävs:
//   DISCORD_BOT_TOKEN   botens token från Developer Portal
//   ANTHROPIC_API_KEY   nyckel från console.anthropic.com
//   GITHUB_TOKEN        fine-grained PAT, Contents:Read (krävs när repot är privat)
// Env som är valfri:
//   DISCORD_KANALER     kommaseparerade kanalnamn boten lyssnar i (default: alla den ser)
//   DISCORD_AGARE       kommaseparerade user-id som får prata med boten (default: alla)
//   GITHUB_GREN         gren att läsa från (default: arbetsgrenen)

import { Client, Events, GatewayIntentBits, DiscordAPIError } from 'discord.js';
import { dela } from './dela.js';
import { fraga, nollstallHistorik, MODELL } from './claude.js';

const KRÄVS = ['DISCORD_BOT_TOKEN', 'ANTHROPIC_API_KEY'];
const saknas = KRÄVS.filter((n) => !process.env[n]);
if (saknas.length) {
  console.error(`Startar inte: dessa env-variabler saknas: ${saknas.join(', ')}`);
  process.exit(1);
}

if (!process.env.GITHUB_TOKEN) {
  // 60 anrop/timme utan token. Boten läser fler än så på en normal dag och
  // börjar då svara "GitHub nekade läsning" mitt i en konversation.
  console.warn('VARNING: GITHUB_TOKEN saknas. Utan den ger GitHub bara 60 filläsningar/timme.');
}

const lista = (namn) => (process.env[namn] || '')
  .split(',').map((s) => s.trim().toLowerCase().replace(/^#/, '')).filter(Boolean);

const TILLÅTNA_KANALER = lista('DISCORD_KANALER');
const TILLÅTNA_ANVÄNDARE = lista('DISCORD_AGARE');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    // Privilegierad: måste ALLTID också vara påslagen i Developer Portal,
    // annars kommer meddelanden in med tom content och boten verkar död.
    GatewayIntentBits.MessageContent,
  ],
  // Boten ska aldrig kunna pinga @everyone för att Claude råkat skriva det.
  allowedMentions: { parse: [], repliedUser: false },
});

/** Kö: två snabba frågor efter varandra får inte interfoliera sina svar. */
let kö = Promise.resolve();

function skaSvara(message) {
  if (message.author.bot) return false;      // egna svar och andra bottar
  if (message.webhookId) return false;       // rutinernas rapporter — annars loop
  if (!message.content?.trim()) return false; // bara bilder/filer

  const kanal = message.channel?.name?.toLowerCase();
  if (TILLÅTNA_KANALER.length && !TILLÅTNA_KANALER.includes(kanal)) return false;
  if (TILLÅTNA_ANVÄNDARE.length && !TILLÅTNA_ANVÄNDARE.includes(message.author.id)) return false;
  return true;
}

/** Svarar på första biten, skickar resten i kanalen. */
async function svara(message, text) {
  const bitar = dela(text);
  for (let i = 0; i < bitar.length; i += 1) {
    if (i > 0) await new Promise((r) => setTimeout(r, 350)); // 5 msg / 5 s-gränsen
    if (i === 0) {
      try {
        await message.reply({ content: bitar[i], allowedMentions: { parse: [], repliedUser: false } });
        continue;
      } catch (fel) {
        // 10008 = frågan raderades medan Claude tänkte. Tappa inte svaret.
        if (!(fel instanceof DiscordAPIError && fel.code === 10008)) throw fel;
      }
    }
    await message.channel.send({ content: bitar[i], allowedMentions: { parse: [] } });
  }
}

client.on(Events.MessageCreate, (message) => {
  if (!skaSvara(message)) return;
  const text = message.content.trim();

  // Två små kommandon så Axel kan se skillnad på "boten är död" och
  // "Claude tänker" utan att läsa Railway-loggar.
  if (/^!ping\b/i.test(text)) {
    message.reply(`Vaken. Modell: ${MODELL}. Uppe i ${Math.round(process.uptime() / 60)} min.`).catch(() => {});
    return;
  }
  if (/^!glöm\b/i.test(text) || /^!glom\b/i.test(text)) {
    nollstallHistorik(message.channelId);
    message.reply('Glömde konversationen i den här kanalen. Vi börjar om.').catch(() => {});
    return;
  }

  kö = kö.then(async () => {
    // Typing-indikatorn håller bara ~10 sekunder och kan inte stängas av —
    // förnya var 8:e sekund, rensa alltid i finally.
    let puls = null;
    try {
      await message.channel.sendTyping().catch(() => {});
      puls = setInterval(() => message.channel.sendTyping().catch(() => {}), 8000);
      const svarstext = await fraga({
        text,
        kanalId: message.channelId,
        anvandare: message.author.username,
      });
      await svara(message, svarstext);
    } catch (fel) {
      console.error('[fel]', fel);
      await message.reply(`Det sket sig: ${String(fel.message).slice(0, 300)}`).catch(() => {});
    } finally {
      if (puls) clearInterval(puls);
    }
  }).catch((fel) => console.error('[kö]', fel));
});

client.once(Events.ClientReady, (c) => {
  console.log(`Bävern inloggad som ${c.user.tag}. Modell: ${MODELL}.`);
  console.log(`Kanaler: ${TILLÅTNA_KANALER.length ? TILLÅTNA_KANALER.join(', ') : 'alla boten ser'}`);
  console.log(`Användare: ${TILLÅTNA_ANVÄNDARE.length ? TILLÅTNA_ANVÄNDARE.join(', ') : 'alla'}`);
});

// discord.js sköter reconnect, heartbeat och rate limits själv. Vi loggar bara
// — en egen reconnect-loop ger dubbla anslutningar och dubbla svar.
client.on(Events.Error, (f) => console.error('[discord]', f));
client.on(Events.Warn, (f) => console.warn('[discord]', f));
client.on(Events.ShardDisconnect, (_, id) => console.warn(`[discord] shard ${id} tappade anslutningen`));
client.on(Events.ShardReconnecting, (id) => console.log(`[discord] shard ${id} återansluter`));
client.on(Events.Invalidated, () => {
  console.error('[discord] sessionen ogiltigförklarad — dör så Railway startar om');
  process.exit(1);
});

process.on('unhandledRejection', (f) => console.error('[unhandledRejection]', f));
process.on('uncaughtException', (f) => {
  // MÅSTE dö. Loggar vi bara fortsätter processen i trasigt tillstånd och
  // Railway ser en "grön" tjänst med en död bot.
  console.error('[uncaughtException]', f);
  process.exit(1);
});

client.login(process.env.DISCORD_BOT_TOKEN).catch((fel) => {
  console.error('Inloggning misslyckades:', fel.message);
  if (String(fel.message).includes('disallowed intents')) {
    console.error('→ Slå på MESSAGE CONTENT INTENT i Developer Portal → Bot.');
  }
  process.exit(1);
});
