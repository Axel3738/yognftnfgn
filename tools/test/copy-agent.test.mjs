import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MODELLER, SCHEMA, FALLBACK_BETA, MAX_TOKENS, API_URL, FORBJUDET_ALLTID,
  byggSystemprompt, byggUppdragstext, byggRequest, tolkaSvar, laddaRegler,
} from '../copy-agent.mjs';

// Testerna anropar ALDRIG API:t. Reglerna är en kort fixtur, inte docs-filen,
// så testet inte går sönder när Axel skriver om copy-reglerna.
const REGLER = '# Copy-reglerna (fixtur)\n\n1. Kan jag visualisera det?\n2. Kan det falsifieras?\n3. Kan ingen annan säga det?\n';

const UPPDRAG = {
  produkt: {
    namn: 'Motorhöljet',
    pris_text: '299 kr (ordinarie 367 kr)',
    dna_utdrag: '420D Oxfordtyg, dragsko runt hela kanten, passar 6–250 hk. Vattenavvisande, aldrig vattentät.',
    forbjudet: ['"vattentät" — the cover is water-repellent, never waterproof'],
  },
  briefer: [
    {
      namn: 'Enginecover_PD_22_H1', typ: 'video',
      hypotes: 'A structural copy of PD_1_H3 on new footage holds profit per 1 000 kr past 2 000 kr spend.',
      vinkel: 'problem/lösning', hook_ide: 'The engine sits uncovered at the dock between trips.',
      format: 'video 20 s, voiceover + b-roll', mal_langd_sek: 20,
      kept: 'PD_1_H3 beat order', changed: 'The footage only',
    },
    {
      namn: 'Enginecover_SP_9_1', typ: 'bild',
      hypotes: 'A size-range static beats the generic one.', vinkel: 'passform', hook_ide: 'Fits 6–250 hp',
      format: '4:5 static',
    },
  ],
};

test('modell-id:n är exakt de som skillens doc anger', () => {
  assert.deepEqual(MODELLER, { fable: 'claude-fable-5-1', sonnet: 'claude-sonnet-5' });
  assert.equal(FALLBACK_BETA, 'server-side-fallback-2026-07-01');
  assert.equal(MAX_TOKENS, 16000);
});

test('schemat följer structured-outputs-reglerna: alla objekt stängda, alla fält krävda', () => {
  const objekt = [];
  const ga = (nod) => {
    if (!nod || typeof nod !== 'object') return;
    if (nod.type === 'object') objekt.push(nod);
    for (const v of Object.values(nod)) {
      if (Array.isArray(v)) v.forEach(ga); else ga(v);
    }
  };
  ga(SCHEMA);
  assert.ok(objekt.length >= 6, `hittade bara ${objekt.length} objekt`);
  for (const o of objekt) {
    assert.equal(o.additionalProperties, false);
    assert.deepEqual([...o.required].sort(), Object.keys(o.properties).sort());
  }
  const text = JSON.stringify(SCHEMA);
  for (const forbjudet of ['minimum', 'maximum', 'minLength', 'maxLength', 'minItems', 'maxItems']) {
    assert.equal(text.includes(`"${forbjudet}"`), false, `${forbjudet} stöds inte av structured outputs`);
  }
  const brief = SCHEMA.properties.briefer.items.properties;
  assert.deepEqual(brief.typ.enum, ['video', 'bild']);
  assert.deepEqual(brief.manus.items.properties.beat.enum, ['HOOK', 'PROBLEM', 'MEKANISM', 'PROOF', 'CTA']);
  assert.deepEqual(Object.keys(brief.copy_card.properties), ['primary_text_sv', 'headline_sv', 'description_sv']);
  assert.deepEqual(Object.keys(brief.tre_fragor.items.properties), ['rad', 'visualisera', 'falsifiera', 'ingen_annan_kan_saga']);
  assert.ok(brief.bildtext.anyOf.some((a) => a.type === 'null'), 'bildtext är null för video');
});

test('systemprompten bär reglerna, förbuden, beaten och tre-frågorstestet', () => {
  const p = byggSystemprompt(REGLER, { forbjudet: UPPDRAG.produkt.forbjudet });
  assert.ok(p.includes(REGLER.trim()), 'copy-reglerna ska ligga ordagrant i prompten');
  for (const f of FORBJUDET_ALLTID) assert.ok(p.includes(f), `saknar förbudet: ${f}`);
  assert.ok(p.includes('"vattentät"'), 'produktens egna förbud ska med');
  assert.ok(p.includes('"509 kr", "636 kr" and "20 %"'));
  for (const beat of ['HOOK', 'PROBLEM', 'MEKANISM', 'PROOF', 'CTA']) assert.ok(p.includes(`| ${beat} |`));
  assert.match(p, /Kan jag visualisera det\?/);
  assert.match(p, /Kan det falsifieras\?/);
  assert.match(p, /Kan ingen annan säga det\?/);
  assert.match(p, /in SWEDISH/);
  assert.match(p, /make no strategy decisions/);
});

test('uppdragstexten bär pris, DNA och varje brief i ordning', () => {
  const t = byggUppdragstext(UPPDRAG);
  assert.match(t, /^PRODUCT: Motorhöljet\n/);
  assert.match(t, /PRICE \(use exactly this, nothing else\): 299 kr \(ordinarie 367 kr\)/);
  assert.match(t, /420D Oxfordtyg/);
  assert.ok(t.indexOf('--- 1. Enginecover_PD_22_H1 (video) ---') < t.indexOf('--- 2. Enginecover_SP_9_1 (bild) ---'));
  assert.match(t, /Target length \(s\): 20/);
  assert.match(t, /Changed \(isolated variable\): The footage only/);
  assert.throws(() => byggUppdragstext({ produkt: { namn: 'X' }, briefer: [{ namn: 'a', typ: 'video' }] }), /pris_text/);
  assert.throws(() => byggUppdragstext({ produkt: { namn: 'X', pris_text: '1 kr' }, briefer: [] }), /inga briefer/);
  assert.throws(() => byggUppdragstext({ produkt: { namn: 'X', pris_text: '1 kr' }, briefer: [{ namn: 'a', typ: 'gif' }] }), /video.*bild/);
});

test('fable-requesten: ingen thinking, effort high, fallbacks "default" + beta-header', () => {
  const r = byggRequest('fable', UPPDRAG, REGLER, { nyckel: 'sk-test' });
  assert.equal(r.url, API_URL);
  assert.equal(r.headers['x-api-key'], 'sk-test');
  assert.equal(r.headers['anthropic-version'], '2023-06-01');
  assert.equal(r.headers['anthropic-beta'], 'server-side-fallback-2026-07-01');
  assert.equal(r.body.model, 'claude-fable-5-1');
  assert.equal(r.body.max_tokens, 16000);
  assert.equal('thinking' in r.body, false, 'Fable: ingen thinking-parameter alls');
  assert.equal(r.body.fallbacks, 'default');
  assert.equal(r.body.output_config.effort, 'high');
  assert.deepEqual(r.body.output_config.format, { type: 'json_schema', schema: SCHEMA });
  assert.equal('stream' in r.body, false);
  assert.equal(r.body.messages.length, 1);
  assert.equal(r.body.messages[0].role, 'user');
  assert.equal(typeof r.body.system, 'string');
});

test('sonnet-requesten: adaptive thinking, inga fallbacks, ingen beta-header', () => {
  const r = byggRequest('sonnet', UPPDRAG, REGLER, { nyckel: 'sk-test' });
  assert.equal(r.body.model, 'claude-sonnet-5');
  assert.deepEqual(r.body.thinking, { type: 'adaptive' });
  assert.equal('fallbacks' in r.body, false);
  assert.equal('anthropic-beta' in r.headers, false);
  assert.equal('effort' in r.body.output_config, false);
  assert.deepEqual(r.body.output_config.format, { type: 'json_schema', schema: SCHEMA });
  assert.equal(r.body.max_tokens, 16000);
  for (const p of ['temperature', 'top_p', 'top_k']) assert.equal(p in r.body, false, `${p} ger 400 på Sonnet 5`);
});

test('okänd modell vägras', () => {
  assert.throws(() => byggRequest('opus', UPPDRAG, REGLER), /Okänd modell "opus"/);
});

const SVAR_JSON = {
  briefer: [
    {
      namn: 'Enginecover_PD_22_H1', typ: 'video', hook: 'Motorn står ute vid bryggan, oskyddad.',
      manus: [
        { beat: 'HOOK', sekunder: '0–3 s', sv: 'Motorn står ute vid bryggan, oskyddad.', en: 'The engine sits out at the dock, unprotected.' },
        { beat: 'MEKANISM', sekunder: '3–14 s', sv: 'Dragsko runt hela kanten håller höljet på plats.', en: 'A drawstring around the whole edge keeps the cover in place.' },
        { beat: 'CTA', sekunder: '14–20 s', sv: 'Skydda din utombordare – 299 kr.', en: 'Protect your outboard – 299 kr.' },
      ],
      bildtext: null,
      copy_card: { primary_text_sv: 'Rad 1\nRad 2', headline_sv: 'Gjord för större motorer', description_sv: '420D Oxfordtyg' },
      tre_fragor: [{ rad: 'Motorn står ute vid bryggan, oskyddad.', visualisera: '✅ en motor vid en brygga', falsifiera: '✅ den står där eller inte', ingen_annan_kan_saga: '❌ vilket hölje som helst' }],
    },
    {
      namn: 'Enginecover_SP_9_1', typ: 'bild', hook: 'Passar 6–250 hk',
      manus: [],
      bildtext: { on_image_sv: 'Passar 6–250 hk', on_image_en: 'Fits 6–250 hp', caption_sv: 'Sex storlekar. En dragsko.', caption_en: 'Six sizes. One drawstring.' },
      copy_card: { primary_text_sv: 'Rad 1', headline_sv: 'Sex storlekar', description_sv: '299 kr' },
      tre_fragor: [],
    },
  ],
};

function fixturSvar(extra = {}) {
  return {
    id: 'msg_01', type: 'message', role: 'assistant', model: 'claude-fable-5-1',
    content: [{ type: 'text', text: JSON.stringify(SVAR_JSON) }],
    stop_reason: 'end_turn', stop_sequence: null,
    usage: { input_tokens: 4321, output_tokens: 987, cache_read_input_tokens: 0 },
    ...extra,
  };
}

test('resultatparsern: video får manus, bild får bildtext, usage och modell följer med', () => {
  const r = tolkaSvar(fixturSvar(), 'fable');
  assert.equal(r.modell_begard, 'claude-fable-5-1');
  assert.equal(r.modell_svarade, 'claude-fable-5-1');
  assert.equal(r.fallback_korde, false);
  assert.deepEqual(r.usage, { input_tokens: 4321, output_tokens: 987, cache_read_input_tokens: 0 });
  assert.equal(r.briefer.length, 2);
  const [video, bild] = r.briefer;
  assert.equal(video.copy_modell, 'fable');
  assert.equal(video.hook, 'Motorn står ute vid bryggan, oskyddad.');
  assert.equal(video.manus.length, 3);
  assert.equal('bildtext' in video, false);
  assert.equal(bild.bildtext.on_image_sv, 'Passar 6–250 hk');
  assert.equal('manus' in bild, false);
  assert.equal(video.copy_card.headline_sv, 'Gjord för större motorer');
  assert.equal(video.tre_fragor[0].ingen_annan_kan_saga.startsWith('❌'), true);
});

test('resultatparsern: fallback syns som modell_svarade + fallback_korde', () => {
  const r = tolkaSvar(fixturSvar({
    model: 'claude-opus-4-8',
    content: [{ type: 'fallback', from: { model: 'claude-fable-5-1' }, to: { model: 'claude-opus-4-8' } }, { type: 'text', text: JSON.stringify(SVAR_JSON) }],
    usage: { input_tokens: 1, output_tokens: 2, iterations: [{ type: 'fallback_message' }] },
  }), 'fable');
  assert.equal(r.modell_svarade, 'claude-opus-4-8');
  assert.equal(r.fallback_korde, true);
  assert.equal(r.briefer.length, 2);
});

test('resultatparsern: refusal och max_tokens är fel, aldrig halvresultat', () => {
  assert.throws(
    () => tolkaSvar(fixturSvar({ stop_reason: 'refusal', stop_details: { category: 'cyber' }, content: [] }), 'fable'),
    /refusal.*"category":"cyber"/s,
  );
  assert.throws(() => tolkaSvar(fixturSvar({ stop_reason: 'max_tokens' }), 'sonnet'), /öka max_tokens/);
  assert.throws(() => tolkaSvar({ type: 'error', error: { type: 'invalid_request_error', message: 'bad' } }, 'sonnet'), /invalid_request_error — bad/);
  assert.throws(() => tolkaSvar(fixturSvar({ content: [{ type: 'text', text: '{"briefer": [' }] }), 'sonnet'), /inte giltig JSON/);
  assert.throws(() => tolkaSvar(fixturSvar({ content: [] }), 'sonnet'), /Inget textblock/);
});

test('copy-reglerna på disk går att läsa och innehåller tre-frågorstestet', () => {
  const regler = laddaRegler();
  assert.match(regler, /Tre-frågorstestet/);
  assert.match(regler, /Never write an ad a competitor can sign/);
});
