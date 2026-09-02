// validera() är enda skyddet mellan "Claude föreslog något" och "servern
// byggdes om". Den testas hårt. utfor() testas mot en fejkad server längst ner
// — inte för att API-anropen är intressanta, utan för att ordningsfelen är det.

import test from 'node:test';
import assert from 'node:assert/strict';
import { ChannelType, PermissionsBitField } from 'discord.js';
import {
  validera, beskriv, kanalnamn, utfor, NIVAER, ARKIVNAMN,
  MAX_PER_KATEGORI, MAX_NAMNBYTEN,
} from '../server.js';

const LÄGE = {
  skyddade: ['skalning', 'ads-to-edit'],
  kategorier: [{ namn: 'Produkter' }],
  kanaler: [
    { namn: 'skalning', kategori: '' },
    { namn: 'ads-to-edit', kategori: '' },
    { namn: 'gammalt-skrap', kategori: '' },
    { namn: 'motorholjet', kategori: 'Produkter' },
  ],
};

const plan = (...atgarder) => ({ sammanfattning: 't', atgarder });

// Bäverns roll ligger på 6. Allt på eller över går inte att röra.
const ROLLAGE = {
  botPosition: 6,
  roller: [
    { namn: '@everyone', position: 0, everyone: true },
    { namn: 'CEO', position: 1 },
    { namn: 'Video editor', position: 3 },
    { namn: 'Bävern', position: 6, egen: true },
    { namn: 'Serverägare', position: 9 },
  ],
};

test('kanalnamn städas till något Discord accepterar', () => {
  assert.equal(kanalnamn('Nya Produkter!'), 'nya-produkter');
  assert.equal(kanalnamn('  a   b  '), 'a-b');
  assert.equal(kanalnamn('---x---'), 'x');
  assert.equal(kanalnamn('bälteslipmaskinen'), 'bälteslipmaskinen');
  assert.equal(kanalnamn('🔥🔥'), '');
  assert.equal(kanalnamn('x'.repeat(200)).length, 100);
});

test('skyddade kanaler går inte att röra — rutinen postar där', () => {
  const ut = validera(plan(
    { typ: 'byt_namn', namn: 'skalning', nytt_namn: 'skalningen', motiv: '' },
    { typ: 'arkivera', namn: 'ads-to-edit', motiv: '' },
    { typ: 'flytta', namn: 'skalning', kategori: 'Produkter', motiv: '' },
  ), LÄGE);

  assert.equal(ut.atgarder.length, 0, 'ingen av dem får släppas igenom');
  assert.equal(ut.avvisade.length, 3);
  for (const a of ut.avvisade) assert.match(a.varfor, /protected/);
});

test('åtgärder på kanaler som inte finns avvisas i stället för att krascha', () => {
  const ut = validera(plan(
    { typ: 'byt_namn', namn: 'finns-inte', nytt_namn: 'x', motiv: '' },
    { typ: 'arkivera', namn: 'inte-heller', motiv: '' },
  ), LÄGE);
  assert.equal(ut.atgarder.length, 0);
  assert.equal(ut.avvisade.length, 2);
});

test('en kategori som skapas i planen räknas som befintlig för senare steg', () => {
  const ut = validera(plan(
    { typ: 'skapa_kategori', namn: 'Tester', motiv: '' },
    { typ: 'skapa_kanal', namn: 'Nytt Test', kategori: 'Tester', motiv: '' },
  ), LÄGE);
  assert.equal(ut.atgarder.length, 2, 'kanalen ska inte avvisas för att kategorin är ny');
  assert.equal(ut.atgarder[1].namn, 'nytt-test');
});

test('kanal i en kategori som inte finns avvisas', () => {
  const ut = validera(plan(
    { typ: 'skapa_kanal', namn: 'x', kategori: 'Finns Inte', motiv: '' },
  ), LÄGE);
  assert.equal(ut.atgarder.length, 0);
  assert.match(ut.avvisade[0].varfor, /does not exist/);
});

test('dubbletter fångas — både mot servern och inom samma plan', () => {
  const ut = validera(plan(
    { typ: 'skapa_kanal', namn: 'motorholjet', motiv: '' },
    { typ: 'skapa_kanal', namn: 'helt-ny', motiv: '' },
    { typ: 'skapa_kanal', namn: 'Helt Ny', motiv: '' },
  ), LÄGE);
  assert.equal(ut.atgarder.length, 1);
  assert.equal(ut.avvisade.length, 2);
  for (const a of ut.avvisade) assert.match(a.varfor, /already exists/);
});

test('namnbyte frigör det gamla namnet och tar det nya', () => {
  const ut = validera(plan(
    { typ: 'byt_namn', namn: 'gammalt-skrap', nytt_namn: 'nytt-namn', motiv: '' },
    { typ: 'skapa_kanal', namn: 'gammalt-skrap', motiv: '' },
    { typ: 'skapa_kanal', namn: 'nytt-namn', motiv: '' },
  ), LÄGE);
  assert.equal(ut.atgarder.length, 2, 'gamla namnet blir ledigt, nya blir upptaget');
  assert.equal(ut.avvisade.length, 1);
  assert.equal(ut.avvisade[0].namn, 'nytt-namn');
  assert.match(ut.avvisade[0].varfor, /already exists/);
});

test('Discords tak på namnbyten per kanal respekteras', () => {
  const kedja = [];
  for (let i = 0; i < MAX_NAMNBYTEN + 2; i += 1) {
    kedja.push({ typ: 'byt_namn', namn: i === 0 ? 'gammalt-skrap' : `steg-${i - 1}`, nytt_namn: `steg-${i}`, motiv: '' });
  }
  const ut = validera(plan(...kedja), LÄGE);
  // Kedjan följer SAMMA kanal genom alla namn. Räknas taket på nuvarande namn
  // nollställs det vid varje byte och alla släpps igenom — då köar Discord
  // anropen i tysthet i tiotals minuter.
  assert.equal(ut.atgarder.length, MAX_NAMNBYTEN, 'taket räknas per kanal, inte per namn');
  assert.match(ut.avvisade[0].varfor, /renames/);
});

test('kategorier fylls inte över Discords gräns', () => {
  const fulla = Array.from({ length: MAX_PER_KATEGORI }, (_, i) => ({ namn: `k${i}`, kategori: 'Produkter' }));
  const ut = validera(
    plan({ typ: 'skapa_kanal', namn: 'en-till', kategori: 'Produkter', motiv: '' }),
    { ...LÄGE, kanaler: fulla },
  );
  assert.equal(ut.atgarder.length, 0);
  assert.match(ut.avvisade[0].varfor, new RegExp(`${MAX_PER_KATEGORI}`));
});

test('okända åtgärdstyper släpps aldrig igenom', () => {
  // Viktigast av alla: hittar Claude på "radera" ska den dö här.
  const ut = validera(plan(
    { typ: 'radera', namn: 'gammalt-skrap', motiv: '' },
    { typ: 'ban_alla', namn: 'gammalt-skrap', motiv: '' },
  ), LÄGE);
  assert.equal(ut.atgarder.length, 0);
  assert.equal(ut.avvisade.length, 2);
});

test('beskriv redovisar både det som körs och det som ströks', () => {
  const ut = validera(plan(
    { typ: 'skapa_kanal', namn: 'ny-kanal', motiv: '' },
    { typ: 'arkivera', namn: 'skalning', motiv: '' },
  ), LÄGE);
  const text = beskriv(ut);
  assert.match(text, /ny-kanal/);
  assert.match(text, /Dropped/, 'en tyst bortsållad åtgärd ser ut som att den kördes');
  assert.match(text, /skalning/);
  assert.match(text, /Nothing is deleted/);
});

test('tom plan går att beskriva utan att krascha', () => {
  const text = beskriv(validera(plan(), LÄGE));
  assert.match(text, /Nothing to do/);
  assert.doesNotMatch(beskriv({ atgarder: [], avvisade: [] }), /undefined/);
});

// ---- utfor() mot en fejkad Discord-server -------------------------------
// Poängen är kapplöpningen: cachen uppdateras INTE här, precis som den kan
// låta bli i verkligheten just efter att en kategori skapats.

function fejkGuild(befintliga = []) {
  const skapade = [];
  const anrop = [];
  const cache = befintliga.slice();
  const kanal = (o) => ({
    ...o,
    setName: async (n) => { anrop.push(`setName:${o.name}->${n}`); o.name = n; },
    setParent: async (id) => { anrop.push(`setParent:${o.name}->${id}`); o.parentId = id; },
    setTopic: async (t) => { anrop.push(`setTopic:${o.name}=${t}`); },
    permissionOverwrites: { edit: async () => { anrop.push(`lås:${o.name}`); } },
  });
  return {
    skapade,
    anrop,
    roles: { everyone: { id: '@everyone' } },
    channels: {
      // Cachen speglar ALDRIG det vi skapar — det är hela testet.
      cache: { find: (f) => cache.map(kanal).find(f) || undefined, values: () => cache.values() },
      create: async (o) => {
        skapade.push(o);
        return kanal({ ...o, id: `id-${skapade.length}` });
      },
    },
  };
}

test('en kanal hamnar i kategorin som skapades i samma körning', async () => {
  const guild = fejkGuild();
  const { gjort, misslyckades } = await utfor({
    atgarder: [
      { typ: 'skapa_kategori', namn: 'Produkter' },
      { typ: 'skapa_kanal', namn: 'motorholjet', kategori: 'Produkter' },
    ],
    guild,
  });
  assert.equal(misslyckades.length, 0, misslyckades.join('; '));
  assert.equal(gjort.length, 2);
  const kanal = guild.skapade[1];
  assert.equal(kanal.parent, 'id-1', 'utan detta landar kanalen på toppnivån, tyst');
});

test('arkivering skapar arkivkategorin en gång och låser kanalerna', async () => {
  const guild = fejkGuild([
    { name: 'gammal-a', type: ChannelType.GuildText },
    { name: 'gammal-b', type: ChannelType.GuildText },
  ]);
  const { gjort, misslyckades } = await utfor({
    atgarder: [{ typ: 'arkivera', namn: 'gammal-a' }, { typ: 'arkivera', namn: 'gammal-b' }],
    guild,
  });
  assert.equal(misslyckades.length, 0, misslyckades.join('; '));
  assert.equal(gjort.length, 2);
  const arkiv = guild.skapade.filter((k) => k.name === ARKIVNAMN);
  assert.equal(arkiv.length, 1, 'två arkivkategorier med samma namn är en röra');
  assert.equal(guild.anrop.filter((a) => a.startsWith('lås:')).length, 2);
});

test('ett steg som felar stoppar inte resten', async () => {
  const guild = fejkGuild();
  const { gjort, misslyckades } = await utfor({
    atgarder: [
      { typ: 'byt_namn', namn: 'finns-inte', nytt_namn: 'x' },
      { typ: 'skapa_kanal', namn: 'kommer-fram' },
    ],
    guild,
  });
  assert.equal(misslyckades.length, 1);
  assert.equal(gjort.length, 1, 'en halvfärdig server som säger vad som gick fel slår en som tystnar');
});

// ---- rollnivåer och kanallåsning --------------------------------------

test('ingen nivå kan dela ut Administrator eller något annat farligt', () => {
  // Hela poängen med nivåer i stället för lösa rättigheter: modellen väljer
  // ett namn, och vad namnet betyder står i kod som den inte kan röra.
  const förbjudet = ['Administrator', 'ManageGuild', 'ManageRoles', 'ManageChannels',
    'KickMembers', 'BanMembers', 'ManageWebhooks'];
  for (const [namn, bitar] of Object.entries(NIVAER)) {
    const p = new PermissionsBitField(bitar.reduce((a, b) => a | b, 0n));
    for (const f of förbjudet) assert.equal(p.has(f), false, `nivån ${namn} ger ${f}`);
  }
});

test('medlemsnivån har kvar röst och slash-kommandon', () => {
  // Glöms de bort märks det först när någon försöker ringa eller skriva /.
  const p = new PermissionsBitField(NIVAER.medlem.reduce((a, b) => a | b, 0n));
  for (const f of ['Connect', 'Speak', 'UseApplicationCommands', 'SendMessages']) {
    assert.ok(p.has(f), `medlem saknar ${f}`);
  }
});

test('läsarnivån kan inte skriva', () => {
  const p = new PermissionsBitField(NIVAER.lasare.reduce((a, b) => a | b, 0n));
  assert.equal(p.has('SendMessages'), false);
  assert.ok(p.has('ViewChannel'));
});

test('en roll över Bävern går inte att ändra', () => {
  const ut = validera(plan(
    { typ: 'satt_roll', namn: 'Serverägare', niva: 'medlem', motiv: '' },
    { typ: 'satt_roll', namn: 'Bävern', niva: 'medlem', motiv: '' },
  ), { ...LÄGE, ...ROLLAGE });
  assert.equal(ut.atgarder.length, 0);
  assert.match(ut.avvisade[0].varfor, /above Bävern/);
  assert.match(ut.avvisade[1].varfor, /own role/);
});

test('roller under Bävern går att sätta, och @everyone med', () => {
  const ut = validera(plan(
    { typ: 'satt_roll', namn: 'Video editor', niva: 'medlem', motiv: '' },
    { typ: 'satt_roll', namn: '@everyone', niva: 'medlem', motiv: '' },
    { typ: 'satt_roll', namn: 'Finns inte alls', niva: 'medlem', motiv: '' },
    { typ: 'satt_roll', namn: 'CEO', niva: 'gudanivå', motiv: '' },
  ), { ...LÄGE, ...ROLLAGE });
  assert.equal(ut.atgarder.length, 2);
  assert.match(ut.avvisade[0].varfor, /does not exist/);
  assert.match(ut.avvisade[1].varfor, /unknown level/);
});

test('skyddade kanaler FÅR låsas — det är precis de som ska låsas', () => {
  // Skyddet finns för att rutinen inte ska tappa sin kanal vid namnbyte eller
  // arkivering. Låsning gör tvärtom: den ger boten kanalen för sig själv.
  const ut = validera(plan(
    { typ: 'las_kanal', namn: 'skalning', motiv: '' },
    { typ: 'byt_namn', namn: 'skalning', nytt_namn: 'x', motiv: '' },
  ), LÄGE);
  assert.equal(ut.atgarder.length, 1, 'låsningen ska igenom');
  assert.equal(ut.atgarder[0].typ, 'las_kanal');
  assert.match(ut.avvisade[0].varfor, /protected/, 'namnbytet ska stoppas');
});

test('låsning av en kanal som inte finns avvisas', () => {
  assert.equal(validera(plan({ typ: 'las_kanal', namn: 'finns-inte', motiv: '' }), LÄGE).atgarder.length, 0);
});
