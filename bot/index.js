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

import {
  Client, Events, GatewayIntentBits, DiscordAPIError,
  ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags,
} from 'discord.js';
import { dela } from './dela.js';
import { fraga, nollstallHistorik, MODELL } from './claude.js';
import {
  planera, validera, beskriv, utfor, lasLaget, skyddadeKanaler,
} from './server.js';

const KRÄVS = ['DISCORD_BOT_TOKEN', 'ANTHROPIC_API_KEY'];
const saknas = KRÄVS.filter((n) => !process.env[n]);
if (saknas.length) {
  console.error(`Startar inte: dessa env-variabler saknas: ${saknas.join(', ')}`);
  process.exit(1);
}

/**
 * Nycklar går ut som HTTP-headers, och headers får bara innehålla tecken
 * 0-255. Ett enda • i värdet ger felet "Cannot convert argument to a
 * ByteString ..." vid VARJE anrop — ett meddelande som inte säger någonting
 * om vad som faktiskt är fel.
 *
 * Det händer på ett självklart sätt: kopierar man nyckeln från API keys-sidan
 * får man den maskerade versionen, sk-ant-a••••••••, och prickarna följer med
 * in i Railway. Den fällan kostade en kväll; nu fångas den vid start.
 */
for (const namn of KRÄVS) {
  const värde = process.env[namn];
  const i = [...värde].findIndex((t) => t.codePointAt(0) > 255);
  if (i !== -1) {
    console.error(
      `Startar inte: ${namn} innehåller tecknet "${[...värde][i]}" på plats ${i + 1}, `
      + 'som inte får finnas i en nyckel.',
    );
    console.error(
      värde.includes('•') || värde.includes('*')
        ? '→ Du har klistrat in den MASKERADE nyckeln (den med prickar). '
          + 'Hämta den riktiga: console.anthropic.com → API Keys → Create Key, '
          + 'och kopiera hela strängen direkt när den visas — den går inte att läsa igen sedan.'
        : '→ Kopiera om värdet, utan mellanslag eller radbrytningar.',
    );
    process.exit(1);
  }
  if (värde.trim() !== värde) {
    console.error(`Startar inte: ${namn} har blanksteg eller radbrytning i början eller slutet.`);
    process.exit(1);
  }
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

// Planer som väntar på att någon trycker Kör. Nyckeln är knappens id.
// Rensas efter TIMEOUT så en glömd plan inte kan köras en vecka senare mot en
// server som hunnit ändras.
const väntande = new Map();
const PLAN_TIMEOUT_MS = 5 * 60_000;

async function byggPlan(message, önskemål) {
  if (!message.guild) throw new Error('!bygg fungerar bara i en server, inte i DM.');
  const jag = message.guild.members.me;
  if (!jag?.permissions.has('ManageChannels')) {
    throw new Error(
      'Jag saknar rättigheten Hantera kanaler i den här servern. '
      + 'Serverinställningar → Roller → min roll → slå på "Hantera kanaler".',
    );
  }

  const { kanaler, kategorier } = lasLaget(message.guild);
  const [rå, skyddade] = await Promise.all([
    planera({ text: önskemål, kanaler, kategorier }),
    skyddadeKanaler(),
  ]);
  const plan = validera(rå, { skyddade, kanaler, kategorier });

  const id = `bygg:${message.id}`;
  väntande.set(id, { plan, ägare: message.author.id, guildId: message.guild.id });
  setTimeout(() => väntande.delete(id), PLAN_TIMEOUT_MS).unref?.();

  const knappar = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`${id}:kor`).setLabel('Kör').setStyle(ButtonStyle.Success)
      .setDisabled(plan.atgarder.length === 0),
    new ButtonBuilder().setCustomId(`${id}:avbryt`).setLabel('Avbryt').setStyle(ButtonStyle.Secondary),
  );

  const bitar = dela(beskriv(plan));
  for (let i = 0; i < bitar.length; i += 1) {
    const sista = i === bitar.length - 1;
    await message.channel.send({
      content: bitar[i],
      components: sista ? [knappar] : [],
      allowedMentions: { parse: [] },
    });
    if (!sista) await new Promise((r) => setTimeout(r, 350));
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton() || !interaction.customId.startsWith('bygg:')) return;
  const [, meddelandeId, vad] = interaction.customId.split(':');
  const id = `bygg:${meddelandeId}`;
  const post = väntande.get(id);

  if (!post) {
    await interaction.reply({ content: 'Planen har gått ut. Kör `!bygg` igen.', flags: MessageFlags.Ephemeral });
    return;
  }
  // Bara den som bad om planen får köra den — annars kan vem som helst i
  // servern trycka på någon annans knapp.
  if (interaction.user.id !== post.ägare) {
    await interaction.reply({ content: 'Det är inte din plan.', flags: MessageFlags.Ephemeral });
    return;
  }

  väntande.delete(id);
  if (vad === 'avbryt') {
    await interaction.update({ content: '❌ Avbrutet. Ingenting ändrades.', components: [] });
    return;
  }

  // Bygget tar längre tid än Discords 3-sekundersgräns för en knapp.
  await interaction.update({ content: '⏳ Bygger …', components: [] });
  try {
    const { gjort, misslyckades } = await utfor({ atgarder: post.plan.atgarder, guild: interaction.guild });
    const rader = [`✅ Klart: ${gjort.length} av ${post.plan.atgarder.length}.`];
    if (gjort.length) rader.push('', ...gjort.map((r) => `- ${r}`));
    if (misslyckades.length) rader.push('', `⚠️ Gick inte (${misslyckades.length}):`, ...misslyckades.map((r) => `- ${r}`));
    for (const bit of dela(rader.join('\n'))) {
      await interaction.followUp({ content: bit, allowedMentions: { parse: [] } });
    }
  } catch (fel) {
    console.error('[bygg]', fel);
    await interaction.followUp({ content: `Bygget sket sig: ${String(fel.message).slice(0, 300)}` }).catch(() => {});
  }
});

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

  const bygg = text.match(/^!bygg\b\s*([\s\S]*)$/i);
  if (bygg) {
    const önskemål = bygg[1].trim();
    if (!önskemål) {
      message.reply('Skriv vad du vill ha, t.ex. `!bygg en kanal per skalningsprodukt under en kategori Produkter`.').catch(() => {});
      return;
    }
    kö = kö.then(async () => {
      let puls = null;
      try {
        await message.channel.sendTyping().catch(() => {});
        puls = setInterval(() => message.channel.sendTyping().catch(() => {}), 8000);
        await byggPlan(message, önskemål);
      } catch (fel) {
        console.error('[bygg]', fel);
        await message.reply(`Kunde inte planera: ${String(fel.message).slice(0, 400)}`).catch(() => {});
      } finally {
        if (puls) clearInterval(puls);
      }
    }).catch((fel) => console.error('[kö]', fel));
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
