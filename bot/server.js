// Bygger om Discord-servern på beskrivning. "Jag vill ha en kanal per produkt
// under en kategori som heter Produkter" → plan → du ser exakt vad som händer
// → du trycker Kör.
//
// Tre lager, medvetet åtskilda så det farliga går att testa utan Discord:
//   planera()  frågar Claude och får tillbaka en strukturerad plan
//   validera() sållar bort allt som är skadligt eller omöjligt   <- ren funktion
//   beskriv()  skriver diffen du läser innan du trycker          <- ren funktion
//   utfor()    ringer Discord. Gör inget som validera() inte släppt igenom.
//
// GRUNDREGELN: boten raderar aldrig något. Den arkiverar. En kanal som flyttas
// till Arkiv går att flytta tillbaka; en raderad kanal tar med sig historiken.

import Anthropic from '@anthropic-ai/sdk';
import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { lasFil } from './repo.js';

const claude = new Anthropic({ maxRetries: 2, timeout: 120_000 });
const MODELL = 'claude-opus-5';

// Discords egna tak. Bryts de svarar API:t med fel mitt i bygget och du står
// med en halvbyggd server — bättre att säga nej innan något hänt.
export const MAX_KANALER = 500;
export const MAX_PER_KATEGORI = 50;

// En kanal får bytas namn 2 ggr per 10 minuter. Fler och Discord köar anropet i
// tiotals minuter utan att säga till.
export const MAX_NAMNBYTEN = 2;

export const ARKIVNAMN = 'arkiv';

/**
 * Rollnivåer. Rättigheter sätts ALDRIG en och en av modellen — den väljer en
 * nivå, och nivåerna står här i kod. Det är skillnaden mellan "Claude kan
 * justera roller" och "Claude kan dela ut Administrator".
 *
 * Ingen nivå innehåller Administrator, ManageGuild, ManageRoles, Kick eller Ban.
 * Vill Axel ge någon det gör han det själv i Discord.
 */
export const NIVAER = {
  // Läser och reagerar, skriver inte. För kanaler man bara ska följa.
  lasare: [
    PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ReadMessageHistory,
    PermissionFlagsBits.AddReactions, PermissionFlagsBits.UseExternalEmojis,
    PermissionFlagsBits.ChangeNickname, PermissionFlagsBits.UseApplicationCommands,
  ],
  // Vanlig i teamet. Röst och slash-kommandon är med med flit: utan dem kan
  // de varken ringa varandra eller använda /-kommandon, och det märks först
  // när någon försöker.
  medlem: [
    PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
    PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.AttachFiles,
    PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AddReactions,
    PermissionFlagsBits.UseExternalEmojis, PermissionFlagsBits.ChangeNickname,
    PermissionFlagsBits.CreatePublicThreads, PermissionFlagsBits.SendMessagesInThreads,
    PermissionFlagsBits.Connect, PermissionFlagsBits.Speak,
    PermissionFlagsBits.UseVAD, PermissionFlagsBits.Stream,
    PermissionFlagsBits.UseApplicationCommands,
  ],
  // Får städa i kanalerna och pinga @here. Inte @everyone.
  moderator: null,
};
NIVAER.moderator = [
  ...NIVAER.medlem,
  PermissionFlagsBits.ManageMessages,
  PermissionFlagsBits.MentionEveryone,
];

const bitsumma = (lista) => lista.reduce((a, b) => a | b, 0n);

const PLANSCHEMA = {
  type: 'object',
  properties: {
    sammanfattning: { type: 'string', description: 'En mening om vad planen gör.' },
    atgarder: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          typ: {
            type: 'string',
            enum: ['skapa_kategori', 'skapa_kanal', 'byt_namn', 'flytta', 'satt_amne',
              'arkivera', 'las_kanal', 'las_upp_kanal', 'satt_roll'],
          },
          namn: { type: 'string', description: 'Namn på det som skapas, eller nuvarande namn på det som ändras.' },
          nytt_namn: { type: 'string', description: 'Bara för byt_namn.' },
          kategori: { type: 'string', description: 'Kategorin kanalen ska ligga i. Tom = ingen kategori.' },
          amne: { type: 'string', description: 'Kanalens ämnesrad. Frivillig.' },
          niva: {
            type: 'string',
            enum: ['lasare', 'medlem', 'moderator'],
            description: 'Bara för satt_roll. lasare = får läsa men inte skriva. '
              + 'medlem = vanlig chatt, filer, trådar, röst. moderator = medlem + '
              + 'städa meddelanden + pinga @here.',
          },
          motiv: { type: 'string', description: 'Kort: varför den här åtgärden.' },
        },
        required: ['typ', 'namn', 'motiv'],
        additionalProperties: false,
      },
    },
  },
  required: ['sammanfattning', 'atgarder'],
  additionalProperties: false,
};

const REGLER = `Du planerar om en Discord-server åt Axel, som driver e-handeln
Bäverbutiken. Han beskriver vad han vill ha; du returnerar en plan.

Regler:
- Kanalnamn i Discord: gemener, bindestreck i stället för mellanslag, inga
  svenska tecken i namn som ska funka överallt (å ä ö fungerar men undvik
  emoji i namnet). Max 100 tecken.
- Kategorinamn får ha versaler och mellanslag.
- Skapa kategorin FÖRE kanalerna som ska ligga i den.
- Radera aldrig. Vill han bli av med en kanal: arkivera.
- Rör inte kanaler som rutinerna postar i om han inte uttryckligen namnger dem.
- Föreslå aldrig fler åtgärder än han bett om. Ingen "medan vi ändå är här".
- Är önskemålet otydligt: gör den minsta rimliga tolkningen och skriv i
  motivet vad du antog.

Att låsa en kanal (las_kanal) betyder: teamet läser, bara Bävern skriver.
Använd det för kanaler där rutinerna postar rapporter — annars scrollar
dagens uppgift bort i chatten.

Roller sätts med en NIVÅ, aldrig med enskilda rättigheter. Det finns ingen
nivå som ger Administrator, och du kan inte hitta på en.`;

/**
 * Frågar Claude om en plan. Returnerar { sammanfattning, atgarder }.
 * Ingen validering här — det gör validera(), som är testad.
 */
export async function planera({ text, kanaler = [], kategorier = [], roller = [], botPosition = 0 }) {
  const laget = [
    'Serverns kategorier just nu:',
    kategorier.length ? kategorier.map((k) => `- ${k.namn}`).join('\n') : '(inga)',
    '',
    'Serverns kanaler just nu:',
    kanaler.length
      ? kanaler.map((k) => `- ${k.namn}${k.kategori ? ` (i ${k.kategori})` : ' (utan kategori)'}`).join('\n')
      : '(inga)',
    '',
    `Serverns roller (Bävern ligger på position ${botPosition} — allt på eller `
    + 'över den positionen går INTE att ändra):',
    roller.length
      ? [...roller].sort((a, b) => b.position - a.position)
        .map((r) => `- ${r.namn} (position ${r.position})`
          + `${r.egen ? ' ← Bäverns egen roll' : ''}`
          + `${r.position >= botPosition && !r.everyone && !r.egen ? ' ← går inte att ändra' : ''}`)
        .join('\n')
      : '(inga)',
  ].join('\n');

  const svar = await claude.messages.create({
    model: MODELL,
    max_tokens: 4096,
    system: REGLER,
    tools: [{
      name: 'lamna_plan',
      description: 'Lämnar den färdiga planen. Anropa alltid detta verktyg.',
      input_schema: PLANSCHEMA,
    }],
    tool_choice: { type: 'tool', name: 'lamna_plan' },
    messages: [{ role: 'user', content: `${laget}\n\nAxel vill:\n${text}` }],
  });

  const anrop = svar.content.find((b) => b.type === 'tool_use');
  if (!anrop) throw new Error('Claude lämnade ingen plan.');
  return anrop.input;
}

/** Discord kräver gemener och bindestreck. Gör om namnet i stället för att fela. */
export function kanalnamn(rå) {
  return String(rå || '')
    .trim().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}_-]/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100);
}

/**
 * Sållar planen. Allt som avvisas kommer med i `avvisade` med en anledning —
 * en tyst bortsållad åtgärd ser ut som att den kördes.
 *
 * `skyddade` = kanalnamn rutinerna postar i. De får inte byta namn, flyttas
 * eller arkiveras, för då postar rutinen i tomma luften utan felmeddelande.
 */
export function validera(plan, {
  skyddade = [], kanaler = [], kategorier = [], roller = [], botPosition = Infinity,
} = {}) {
  const atgarder = [];
  const avvisade = [];
  const skydd = new Set(skyddade.map((s) => kanalnamn(s)));

  // Speglar serverns läge medan vi går igenom planen, så en kanal som skapas i
  // steg 2 räknas som befintlig i steg 5.
  //
  // `nyckel` är kanalens identitet och ändras ALDRIG. Räknar man namnbyten på
  // nuvarande namn nollställs taket vid varje byte: a→b→c→d ser ut som fyra
  // olika kanaler med ett byte var, och Discord köar anropen i tysthet.
  const finns = new Map(kanaler.map((k) => [kanalnamn(k.namn), { ...k, nyckel: kanalnamn(k.namn) }]));
  const kategoriFinns = new Set(kategorier.map((k) => k.namn.toLowerCase()));
  const perKategori = new Map();
  for (const k of kanaler) {
    const key = (k.kategori || '').toLowerCase();
    perKategori.set(key, (perKategori.get(key) || 0) + 1);
  }
  let antalKanaler = kanaler.length;
  const namnbyten = new Map();

  const neka = (a, varfor) => avvisade.push({ ...a, varfor });

  for (const rå of plan?.atgarder || []) {
    const a = { ...rå };

    if (a.typ === 'skapa_kategori') {
      a.namn = String(a.namn || '').trim().slice(0, 100);
      if (!a.namn) { neka(a, 'tomt namn'); continue; }
      if (kategoriFinns.has(a.namn.toLowerCase())) { neka(a, 'kategorin finns redan'); continue; }
      kategoriFinns.add(a.namn.toLowerCase());
      atgarder.push(a);
      continue;
    }

    if (a.typ === 'skapa_kanal') {
      a.namn = kanalnamn(a.namn);
      if (!a.namn) { neka(a, 'namnet blev tomt efter städning'); continue; }
      if (finns.has(a.namn)) { neka(a, 'kanalen finns redan'); continue; }
      if (antalKanaler >= MAX_KANALER) { neka(a, `servern är full (${MAX_KANALER} kanaler)`); continue; }
      const key = (a.kategori || '').toLowerCase();
      if (a.kategori && !kategoriFinns.has(key)) { neka(a, `kategorin ${a.kategori} finns inte`); continue; }
      if ((perKategori.get(key) || 0) >= MAX_PER_KATEGORI) {
        neka(a, `kategorin rymmer max ${MAX_PER_KATEGORI} kanaler`); continue;
      }
      perKategori.set(key, (perKategori.get(key) || 0) + 1);
      antalKanaler += 1;
      finns.set(a.namn, { namn: a.namn, kategori: a.kategori || '', nyckel: `ny:${a.namn}` });
      atgarder.push(a);
      continue;
    }

    if (a.typ === 'satt_roll') {
      a.namn = String(a.namn || '').trim();
      if (!a.namn) { neka(a, 'tomt rollnamn'); continue; }
      if (!NIVAER[a.niva]) { neka(a, `okänd nivå: ${a.niva}`); continue; }
      // Discords rollhierarki är absolut. En roll på eller över botens egen
      // position går inte att röra ens med Administrator — säg det här i
      // stället för att låta Discord svara 403 mitt i bygget.
      const r = roller.find((x) => x.namn.toLowerCase() === a.namn.toLowerCase());
      if (!r) { neka(a, 'rollen finns inte'); continue; }
      if (r.egen) { neka(a, 'det är botens egen roll — den kan inte ändra sig själv'); continue; }
      if (r.position >= botPosition && !r.everyone) {
        neka(a, `ligger över Bävern i rollistan (position ${r.position}) — dra ner den först`);
        continue;
      }
      atgarder.push(a);
      continue;
    }

    // Härifrån och ner: åtgärder på något som redan finns.
    const mål = kanalnamn(a.namn);
    if (!finns.has(mål)) { neka(a, 'kanalen finns inte'); continue; }

    if (a.typ === 'las_kanal' || a.typ === 'las_upp_kanal') {
      // Låsning är TILLÅTEN på skyddade kanaler — det är precis dem som ska
      // låsas. Boten får explicit skrivrätt, så rutinerna postar som förut.
      atgarder.push(a);
      continue;
    }

    if (skydd.has(mål)) { neka(a, 'skyddad kanal — en rutin postar här'); continue; }

    if (a.typ === 'byt_namn') {
      a.nytt_namn = kanalnamn(a.nytt_namn);
      if (!a.nytt_namn) { neka(a, 'nytt_namn saknas'); continue; }
      if (a.nytt_namn === mål) { neka(a, 'namnet är redan så'); continue; }
      if (finns.has(a.nytt_namn)) { neka(a, 'det namnet är upptaget'); continue; }
      const post = finns.get(mål);
      const gjorda = namnbyten.get(post.nyckel) || 0;
      if (gjorda >= MAX_NAMNBYTEN) { neka(a, `max ${MAX_NAMNBYTEN} namnbyten per kanal och 10 min`); continue; }
      namnbyten.set(post.nyckel, gjorda + 1);
      finns.delete(mål);
      finns.set(a.nytt_namn, { ...post, namn: a.nytt_namn });
      atgarder.push(a);
      continue;
    }

    if (a.typ === 'flytta') {
      const key = (a.kategori || '').toLowerCase();
      if (a.kategori && !kategoriFinns.has(key)) { neka(a, `kategorin ${a.kategori} finns inte`); continue; }
      if ((perKategori.get(key) || 0) >= MAX_PER_KATEGORI) {
        neka(a, `kategorin rymmer max ${MAX_PER_KATEGORI} kanaler`); continue;
      }
      const post = finns.get(mål);
      perKategori.set((post.kategori || '').toLowerCase(), (perKategori.get((post.kategori || '').toLowerCase()) || 1) - 1);
      perKategori.set(key, (perKategori.get(key) || 0) + 1);
      post.kategori = a.kategori || '';
      atgarder.push(a);
      continue;
    }

    if (a.typ === 'satt_amne') {
      a.amne = String(a.amne || '').slice(0, 1024);
      atgarder.push(a);
      continue;
    }

    if (a.typ === 'arkivera') {
      atgarder.push(a);
      continue;
    }

    neka(a, `okänd åtgärdstyp: ${a.typ}`);
  }

  return { sammanfattning: plan?.sammanfattning || '', atgarder, avvisade };
}

const ORD = {
  skapa_kategori: (a) => `Ny kategori **${a.namn}**`,
  skapa_kanal: (a) => `Ny kanal **#${a.namn}**${a.kategori ? ` i ${a.kategori}` : ''}`,
  byt_namn: (a) => `Döp om **#${kanalnamn(a.namn)}** → **#${a.nytt_namn}**`,
  flytta: (a) => `Flytta **#${kanalnamn(a.namn)}** till ${a.kategori || '(ingen kategori)'}`,
  satt_amne: (a) => `Ämnesrad på **#${kanalnamn(a.namn)}**`,
  arkivera: (a) => `Arkivera **#${kanalnamn(a.namn)}** (raderas inte)`,
  las_kanal: (a) => `Lås **#${kanalnamn(a.namn)}** — teamet läser, bara Bävern skriver`,
  las_upp_kanal: (a) => `Lås upp **#${kanalnamn(a.namn)}** — alla får skriva igen`,
  satt_roll: (a) => `Rollen **${a.namn}** blir *${a.niva}*`,
};

/** Diffen Axel läser innan han trycker Kör. Ingen jargong, en rad per sak. */
export function beskriv({ sammanfattning, atgarder, avvisade }) {
  const rader = [];
  if (sammanfattning) rader.push(sammanfattning, '');

  if (!atgarder.length) rader.push('**Ingenting att göra.**');
  else {
    rader.push(`**Detta händer om du trycker Kör (${atgarder.length} st):**`);
    atgarder.forEach((a, i) => rader.push(`${i + 1}. ${(ORD[a.typ] || ((x) => x.typ))(a)}`));
  }

  if (avvisade?.length) {
    rader.push('', `**Struket (${avvisade.length} st):**`);
    for (const a of avvisade) rader.push(`- ${a.namn} — ${a.varfor}`);
  }

  rader.push('', 'Inget raderas. Arkiverade kanaler går att flytta tillbaka.');
  return rader.join('\n');
}

/** Hämtar serverns läge i den form validera() och planera() vill ha det. */
export function lasLaget(guild) {
  const kategorier = [];
  const kanaler = [];
  for (const kanal of guild.channels.cache.values()) {
    if (kanal.type === ChannelType.GuildCategory) {
      kategorier.push({ namn: kanal.name, id: kanal.id });
    } else if (kanal.type === ChannelType.GuildText) {
      kanaler.push({ namn: kanal.name, id: kanal.id, kategori: kanal.parent?.name || '' });
    }
  }
  const roller = guild.roles.cache.map((r) => ({
    namn: r.name,
    position: r.position,
    everyone: r.id === guild.id,
    // Botens egen roll går inte att ändra av boten själv, hur högt den än ligger.
    egen: r.tags?.botId === guild.client.user.id,
  }));
  const minRoll = guild.members.me?.roles.highest;
  return { kategorier, kanaler, roller, botPosition: minRoll?.position ?? 0 };
}

/** Rutinernas kanaler. De får aldrig döpas om eller flyttas bort under fötterna. */
export async function skyddadeKanaler() {
  try {
    const rå = await lasFil('agent/discord.json');
    const konfig = JSON.parse(rå || '{}');
    return Object.values(konfig.alias || {});
  } catch {
    // Går filen inte att läsa skyddar vi hellre för mycket än för lite.
    return ['scaling', 'ads-to-edit', 'new-products-coing-out', 'general'];
  }
}

/**
 * Kör planen. Går ett steg fel fortsätter resten — en halvfärdig server som
 * säger vad som gick fel är bättre än en som stannar tyst i mitten.
 */
export async function utfor({ atgarder, guild }) {
  const gjort = [];
  const misslyckades = [];

  // Kategorier vi skapar just nu. Att leta upp dem i cachen i stället vore en
  // kapplöpning: hinner den inte uppdateras landar alla nya kanaler på
  // toppnivån i stället för i kategorin, utan att något felmeddelande syns.
  const nyaKategorier = new Map();
  const hittaKategori = (namn) => {
    if (!namn) return null;
    const key = namn.toLowerCase();
    return nyaKategorier.get(key) || guild.channels.cache.find(
      (k) => k.type === ChannelType.GuildCategory && k.name.toLowerCase() === key,
    ) || null;
  };
  // Samma kapplöpning för namnbyten: "döp om a till b" följt av "sätt ämne på
  // b" måste hitta b även innan gateway-eventet hunnit fram.
  const nyaNamn = new Map();
  const hittaKanal = (namn) => {
    const rent = kanalnamn(namn);
    return nyaNamn.get(rent) || guild.channels.cache.find(
      (k) => k.type === ChannelType.GuildText && k.name === rent,
    ) || null;
  };

  for (const a of atgarder) {
    try {
      if (a.typ === 'skapa_kategori') {
        const ny = await guild.channels.create({ name: a.namn, type: ChannelType.GuildCategory });
        nyaKategorier.set(a.namn.toLowerCase(), ny);
      } else if (a.typ === 'skapa_kanal') {
        await guild.channels.create({
          name: a.namn,
          type: ChannelType.GuildText,
          parent: hittaKategori(a.kategori)?.id ?? null,
          topic: a.amne ? String(a.amne).slice(0, 1024) : undefined,
        });
      } else if (a.typ === 'byt_namn') {
        const k = hittaKanal(a.namn);
        if (!k) throw new Error('kanalen hittades inte längre');
        await k.setName(a.nytt_namn);
        nyaNamn.set(a.nytt_namn, k);
      } else if (a.typ === 'flytta') {
        const k = hittaKanal(a.namn);
        if (!k) throw new Error('kanalen hittades inte längre');
        await k.setParent(hittaKategori(a.kategori)?.id ?? null, { lockPermissions: false });
      } else if (a.typ === 'satt_amne') {
        const k = hittaKanal(a.namn);
        if (!k) throw new Error('kanalen hittades inte längre');
        await k.setTopic(a.amne || null);
      } else if (a.typ === 'las_kanal' || a.typ === 'las_upp_kanal') {
        const k = hittaKanal(a.namn);
        if (!k) throw new Error('kanalen hittades inte längre');
        const las = a.typ === 'las_kanal';
        await k.permissionOverwrites.edit(guild.roles.everyone, {
          SendMessages: las ? false : null,
          CreatePublicThreads: las ? false : null,
          SendMessagesInThreads: las ? false : null,
        });
        // Boten måste få skriva explicit, annars tystnar rutinernas rapporter
        // i samma sekund som kanalen låses — och ingenting säger till.
        const jag = guild.members.me?.roles.botRole;
        if (las && jag) {
          await k.permissionOverwrites.edit(jag, { ViewChannel: true, SendMessages: true });
        }
      } else if (a.typ === 'satt_roll') {
        const roll = guild.roles.cache.find(
          (r) => r.name.toLowerCase() === String(a.namn).toLowerCase(),
        );
        if (!roll) throw new Error('rollen hittades inte längre');
        const niva = NIVAER[a.niva];
        if (!niva) throw new Error(`okänd nivå ${a.niva}`);
        await roll.setPermissions(bitsumma(niva));
      } else if (a.typ === 'arkivera') {
        const k = hittaKanal(a.namn);
        if (!k) throw new Error('kanalen hittades inte längre');
        let arkiv = hittaKategori(ARKIVNAMN);
        if (!arkiv) {
          arkiv = await guild.channels.create({ name: ARKIVNAMN, type: ChannelType.GuildCategory });
          nyaKategorier.set(ARKIVNAMN, arkiv);
        }
        await k.setParent(arkiv.id, { lockPermissions: false });
        // Läsbar för alla som såg den förut, men ingen kan skriva mer.
        await k.permissionOverwrites.edit(guild.roles.everyone, {
          [PermissionFlagsBits.SendMessages]: false,
        });
      }
      gjort.push((ORD[a.typ] || ((x) => x.typ))(a));
    } catch (fel) {
      misslyckades.push(`${(ORD[a.typ] || ((x) => x.typ))(a)} — ${fel.message}`);
    }
  }
  return { gjort, misslyckades };
}
