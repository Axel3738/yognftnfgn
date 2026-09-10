#!/usr/bin/env node
// Copy-agenten: skriver ad copy (hook, manus, COPY CARD) via Anthropic
// Messages API med RÅ HTTP — repot förbjuder beroenden, så inget SDK.
//
// Syfte (Axel 2026-09-10): A/B-testa Fable mot Sonnet för copy. Samma
// uppdrag, två modeller, två resultatfiler — sen avgör kontot.
//
//   node tools/copy-agent.mjs --modell fable|sonnet --uppdrag <fil.json> --ut <fil.json> [--torr]
//
// Uppdragsfilen:
//   {
//     produkt: { namn, pris_text, dna_utdrag, forbjudet: [..valfritt..] },
//     briefer: [ { namn, typ: "video" | "bild", hypotes, vinkel, hook_ide,
//                  format, mal_langd_sek, kept, changed } ]
//   }
// Copy-reglerna (docs/copy-regler.md) läses av skriptet självt — skicka
// dem inte i uppdraget.
//
// Arbetsdelning (regel 6 i CLAUDE.md): agenten skriver BARA text. Strategi,
// hypotes, vinkel och hook-idé kommer färdiga i uppdraget från huvudsessionen.
//
// Modellerna och deras request-form (ur claude-api-skillens doc, inte ur minnet):
//   fable  = claude-fable-5-1: INGEN `thinking` (alltid på, annan konfig → 400),
//            output_config.effort "high", fallbacks "default" + header
//            anthropic-beta: server-side-fallback-2026-07-01.
//   sonnet = claude-sonnet-5: thinking { type: "adaptive" }.
// Båda: max_tokens 16000, ingen streaming, JSON via
// output_config.format { type: "json_schema", schema }.
//
// Svaret kontrolleras på stop_reason FÖRE content läses:
//   refusal    → fel med stop_details
//   max_tokens → fel "öka max_tokens"
// Loggas: modell, input/output-tokens, response.model (om en fallback körde).
//
// Resultatfilen:
//   { modell_begard, modell_svarade, fallback_korde, briefer: [ { namn,
//     copy_modell, hook, manus | bildtext, copy_card, tre_fragor } ], usage }
//
// --torr visar systemprompt, uppdragstext och schema utan att anropa API:t.
// Testerna anropar aldrig API:t (tools/test/copy-agent.test.mjs).
//
// Noll beroenden. Kräver ANTHROPIC_API_KEY för skarp körning.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';

const ROT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const REGELFIL = join(ROT, 'docs', 'copy-regler.md');
export const API_URL = 'https://api.anthropic.com/v1/messages';
export const MAX_TOKENS = 16000;

/** Modellnycklarna Axel skriver på kommandoraden → riktiga modell-id:n. */
export const MODELLER = {
  fable: 'claude-fable-5-1',
  sonnet: 'claude-sonnet-5',
};

/** Beta-headern som hör ihop med `fallbacks: "default"` (skalärformen). */
export const FALLBACK_BETA = 'server-side-fallback-2026-07-01';

/** Uttryck som är förbjudna i all ny copy oavsett produkt (CLAUDE.md + copy-reglerna). */
export const FORBJUDET_ALLTID = [
  'any price or compare-at price other than the exact `pris_text` given for the product',
  '"509 kr", "636 kr" and "20 %" (old axelbältet numbers — banned in all new copy)',
  'invented customer counts, star ratings, review counts or quotes attributed to a person',
  '"innan lagret tar slut" (the only permitted urgency phrase is "så länge lagret räcker")',
  'empty adjectives such as "fantastisk", "enkel", "smart", "bättre" — point at a fact instead',
  'anything a competitor could sign with their own logo',
];

/** De fem beaten ur docs/creative-strategy.md, avsnitt 2. */
export const BEATS = [
  { beat: 'HOOK', sekunder: '0–3 s', jobb: 'Stop the scroll. Visual shock or a flat claim. No logo, no intro — start in the middle of the problem.' },
  { beat: 'PROBLEM', sekunder: '3–7 s', jobb: 'Name the pain or objection concretely.' },
  { beat: 'MEKANISM', sekunder: '7–14 s', jobb: 'Show WHY the product solves it. Motion sells here — this is why the video exists.' },
  { beat: 'PROOF', sekunder: '14–18 s', jobb: 'One hard fact, a customer quote we actually have, or before/after. Number > adjective.' },
  { beat: 'CTA', sekunder: '18–22 s', jobb: 'End card: product, price, risk reversal, button. Hold the price — the guarantee removes risk, not a discount.' },
];

// ------------------------------------------------------------ Schema

/** Ett objekt i schemat: alla fält krävs, inga extra (kravet för structured outputs). */
function objekt(properties) {
  return { type: 'object', properties, required: Object.keys(properties), additionalProperties: false };
}

const str = (description) => ({ type: 'string', description });

/**
 * JSON-schemat modellen tvingas följa. Bara stödda konstruktioner:
 * object/array/string/enum/anyOf, `additionalProperties: false` på varje
 * objekt, alla fält i `required`. Inga min/max — det stöds inte.
 */
export const SCHEMA = objekt({
  briefer: {
    type: 'array',
    description: 'One entry per brief in the assignment, same order, same `namn`.',
    items: objekt({
      namn: str('The brief name exactly as given in the assignment.'),
      typ: { type: 'string', enum: ['video', 'bild'] },
      hook: str('Swedish. Max 8 words. The line that opens the ad.'),
      manus: {
        type: 'array',
        description: 'Video only: one line per beat, in order HOOK → PROBLEM → MEKANISM → PROOF → CTA. Empty array for image briefs.',
        items: objekt({
          beat: { type: 'string', enum: ['HOOK', 'PROBLEM', 'MEKANISM', 'PROOF', 'CTA'] },
          sekunder: str('Time window, e.g. "0–3 s".'),
          sv: str('Swedish line, spoken word for word. This is what runs in the ad.'),
          en: str('English meaning for the editors — a translation, not a rewrite.'),
        }),
      },
      bildtext: {
        description: 'Image only: on-image text and caption. null for video briefs.',
        anyOf: [
          objekt({
            on_image_sv: str('Swedish text burned into the image. Max 7 words.'),
            on_image_en: str('English meaning of the on-image text.'),
            caption_sv: str('Swedish caption under the image (1–2 short lines).'),
            caption_en: str('English meaning of the caption.'),
          }),
          { type: 'null' },
        ],
      },
      copy_card: objekt({
        primary_text_sv: str('Swedish primary text, 3–5 short lines, each line on its own row.'),
        headline_sv: str('Swedish headline, max 6 words.'),
        description_sv: str('Swedish description, one short line.'),
      }),
      tre_fragor: {
        type: 'array',
        description: 'The three-question test for EVERY delivered line: hook, each script/on-image line, headline, each primary-text line.',
        items: objekt({
          rad: str('The Swedish line being tested, verbatim.'),
          visualisera: str('Can I picture it? Start with "✅" or "❌", then a short reason.'),
          falsifiera: str('Can it be proven false? Start with "✅" or "❌", then a short reason.'),
          ingen_annan_kan_saga: str('Could a competitor sign it? "✅" if NOT (unique to this product), "❌" if any competitor could say it. Short reason.'),
        }),
      },
    }),
  },
});

// ------------------------------------------------------------ Prompt

/** Läser docs/copy-regler.md. Skriptet läser reglerna självt — de skickas aldrig i uppdraget. */
export function laddaRegler(sokvag = REGELFIL) {
  return readFileSync(sokvag, 'utf8');
}

/**
 * Systemprompten: engelsk instruktion, svensk output. Modellen skriver text,
 * fattar inga strategibeslut — hypotes, vinkel och hook-idé är givna.
 */
export function byggSystemprompt(regler, { forbjudet = [] } = {}) {
  const forbud = [...FORBJUDET_ALLTID, ...forbjudet.map(String)].map((f) => `- ${f}`).join('\n');
  const beats = BEATS.map((b) => `| ${b.beat} | ${b.sekunder} | ${b.jobb} |`).join('\n');
  return `You are a Swedish direct-response copywriter for a small e-commerce store. You write ONLY text. You make no strategy decisions: the hypothesis, angle, hook idea, format and what is kept/changed are given per brief and you follow them exactly.

OUTPUT LANGUAGE: every customer-facing line (hook, script lines, on-image text, captions, primary text, headline, description) is in SWEDISH. English fields (\`en\`, \`on_image_en\`, \`caption_en\`) are plain-meaning translations for English-speaking editors — a translation of the Swedish, never a different line.

HARD RULES
- Use ONLY the price text given in the assignment. Never any other number for price, compare-at price or percentage.
- Every fact must come from the product DNA excerpt or the brief. Never invent a fact, a customer, a rating, a quote or a study. If you have no fact for the PROOF beat, point at something concrete in the product (material, time, size) instead.
- Never write these:
${forbud}
- Spelling: å, ä, ö must be correct Swedish. Product names are spelled exactly as in the assignment.

VIDEO SCRIPTS (typ = "video"): five beats from docs/creative-strategy.md, in this order. Skip a beat only if the brief's format says so (a pure demo can be HOOK → MEKANISM → CTA), never reorder.
| Beat | Seconds | Job |
${beats}
Lines are spoken word for word and burned in as captions — short, plain, never announcer-style. One sentence per beat. Scale the time windows to \`mal_langd_sek\`.

IMAGE ADS (typ = "bild"): \`manus\` is an empty array. Give \`bildtext\`: on-image text (max 7 words, one thought) and a caption of 1–2 short lines.

COPY CARD (every brief): primary text = 3–5 short lines, one thought per line, ending with a call to action; headline max 6 words; description one line.

THE HOOK: max 8 Swedish words. It must pass all three questions below.

THREE-QUESTION TEST (mandatory on every line you deliver — from docs/copy-regler.md):
1. Kan jag visualisera det? Concrete beats abstract. If the reader cannot picture it, rewrite.
2. Kan det falsifieras? The line must be true or false, not an opinion.
3. Kan ingen annan säga det? Never write an ad a competitor can sign.
Fill \`tre_fragor\` with one entry per delivered Swedish line (hook, each script or on-image line, headline, each primary-text line). Three "❌" = rewrite before delivering. Do not deliver a line with any "❌" unless you cannot find a better one — then say so in the reason.

Rewrite each line several times before you settle. Cut every word that does not work (Kaplan's law). Point, don't talk: replace adjectives with things the reader can see.

THE COPY RULES (docs/copy-regler.md, verbatim, Swedish):
${regler.trim()}`;
}

/** Användarmeddelandet: produkten + briefarna, i ett format modellen inte kan missläsa. */
export function byggUppdragstext(uppdrag) {
  const p = uppdrag?.produkt ?? {};
  const briefer = Array.isArray(uppdrag?.briefer) ? uppdrag.briefer : [];
  if (!p.namn) throw new Error('Uppdraget saknar produkt.namn.');
  if (!p.pris_text) throw new Error('Uppdraget saknar produkt.pris_text — priset hämtas från produktsidan, aldrig ur minnet.');
  if (briefer.length === 0) throw new Error('Uppdraget har inga briefer.');

  const rader = [
    `PRODUCT: ${p.namn}`,
    `PRICE (use exactly this, nothing else): ${p.pris_text}`,
    '',
    'PRODUCT DNA (facts you may use — nothing outside this):',
    String(p.dna_utdrag ?? '(no DNA excerpt given — use only what each brief states)').trim(),
    '',
    `BRIEFS (${briefer.length}) — write copy for each, keep the names, same order:`,
  ];
  briefer.forEach((b, i) => {
    if (!b?.namn) throw new Error(`Brief ${i + 1} saknar namn.`);
    if (b.typ !== 'video' && b.typ !== 'bild') throw new Error(`Brief ${b.namn}: typ måste vara "video" eller "bild".`);
    rader.push('', `--- ${i + 1}. ${b.namn} (${b.typ}) ---`);
    const falt = [
      ['Hypothesis', b.hypotes], ['Angle', b.vinkel], ['Hook idea', b.hook_ide], ['Format', b.format],
      ['Target length (s)', b.mal_langd_sek], ['Kept', b.kept], ['Changed (isolated variable)', b.changed],
    ];
    for (const [namn, varde] of falt) {
      if (varde !== undefined && varde !== null && String(varde).trim() !== '') rader.push(`${namn}: ${String(varde).trim()}`);
    }
  });
  return rader.join('\n');
}

// ------------------------------------------------------------ Request

/**
 * Hela HTTP-anropet för en modell: { url, headers, body }. Ren funktion så
 * formen går att testa utan nätverk.
 */
export function byggRequest(modellNyckel, uppdrag, regler, { nyckel = 'ANTHROPIC_API_KEY' } = {}) {
  const modell = MODELLER[modellNyckel];
  if (!modell) throw new Error(`Okänd modell "${modellNyckel}". Välj: ${Object.keys(MODELLER).join(' | ')}.`);
  const headers = {
    'content-type': 'application/json',
    'x-api-key': nyckel,
    'anthropic-version': '2023-06-01',
  };
  const body = {
    model: modell,
    max_tokens: MAX_TOKENS,
    system: byggSystemprompt(regler, { forbjudet: uppdrag?.produkt?.forbjudet ?? [] }),
    messages: [{ role: 'user', content: byggUppdragstext(uppdrag) }],
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
  };
  if (modellNyckel === 'fable') {
    // Fable: thinking är alltid på och får inte konfigureras. Effort styrs
    // separat. Fallback på policy-avslag: skalärformen + dess egen header.
    body.output_config.effort = 'high';
    body.fallbacks = 'default';
    headers['anthropic-beta'] = FALLBACK_BETA;
  } else {
    body.thinking = { type: 'adaptive' };
  }
  return { url: API_URL, headers, body };
}

// ------------------------------------------------------------ Svar

/**
 * Tolkar Messages-svaret till resultatfilens form. Kontrollerar stop_reason
 * FÖRE content: refusal och max_tokens är fel, aldrig halvresultat.
 */
export function tolkaSvar(svar, modellNyckel) {
  if (!svar || typeof svar !== 'object') throw new Error('Tomt svar från Messages API.');
  if (svar.type === 'error') {
    throw new Error(`Messages API-fel: ${svar.error?.type ?? '?'} — ${svar.error?.message ?? ''}`);
  }
  if (svar.stop_reason === 'refusal') {
    throw new Error(`Modellen avböjde (stop_reason: refusal). stop_details: ${JSON.stringify(svar.stop_details ?? null)}`);
  }
  if (svar.stop_reason === 'max_tokens') {
    throw new Error(`Svaret kapades (stop_reason: max_tokens vid ${MAX_TOKENS}) — öka max_tokens.`);
  }
  const text = (svar.content ?? []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  if (!text) throw new Error(`Inget textblock i svaret (stop_reason: ${svar.stop_reason ?? '?'}).`);
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(`Svaret var inte giltig JSON (${e.message}). Början: ${text.slice(0, 200)}`);
  }
  if (!Array.isArray(data.briefer)) throw new Error('JSON-svaret saknar fältet "briefer".');

  const modellBegard = MODELLER[modellNyckel];
  const fallbackBlock = (svar.content ?? []).some((b) => b.type === 'fallback');
  const fallbackIteration = (svar.usage?.iterations ?? []).some((i) => i?.type === 'fallback_message');
  const modellSvarade = svar.model ?? modellBegard;
  const fallbackKorde = fallbackBlock || fallbackIteration || (modellSvarade !== modellBegard);

  return {
    modell_begard: modellBegard,
    modell_svarade: modellSvarade,
    fallback_korde: fallbackKorde,
    briefer: data.briefer.map((b) => {
      const ut = { namn: b.namn, copy_modell: modellNyckel, hook: b.hook };
      if (b.typ === 'bild') ut.bildtext = b.bildtext;
      else ut.manus = b.manus;
      ut.copy_card = b.copy_card;
      ut.tre_fragor = b.tre_fragor;
      return ut;
    }),
    usage: {
      input_tokens: svar.usage?.input_tokens ?? null,
      output_tokens: svar.usage?.output_tokens ?? null,
      cache_read_input_tokens: svar.usage?.cache_read_input_tokens ?? 0,
    },
  };
}

/** Skarpt anrop. Kastar med Anthropics egen feltext vid annat än 200. */
export async function anropa(request) {
  const r = await fetch(request.url, { method: 'POST', headers: request.headers, body: JSON.stringify(request.body) });
  const kropp = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(`Messages API svarade ${r.status}: ${JSON.stringify(kropp).slice(0, 400)}`);
  }
  return kropp;
}

// ------------------------------------------------------------ CLI

function arg(argv, namn) {
  const i = argv.indexOf(namn);
  return i === -1 ? null : argv[i + 1] ?? null;
}

async function huvud(argv) {
  const modellNyckel = arg(argv, '--modell');
  const uppdragFil = arg(argv, '--uppdrag');
  const utFil = arg(argv, '--ut');
  const torr = argv.includes('--torr');
  if (!modellNyckel || !uppdragFil || (!utFil && !torr)) {
    console.error('Användning: node tools/copy-agent.mjs --modell fable|sonnet --uppdrag <fil.json> --ut <fil.json> [--torr]');
    process.exit(1);
  }
  let uppdrag;
  try {
    uppdrag = JSON.parse(readFileSync(uppdragFil, 'utf8'));
  } catch (e) {
    console.error(`Kunde inte läsa uppdragsfilen: ${e.message}`);
    process.exit(1);
  }
  const regler = laddaRegler();
  let request;
  try {
    request = byggRequest(modellNyckel, uppdrag, regler, { nyckel: process.env.ANTHROPIC_API_KEY ?? '' });
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }

  if (torr) {
    const { body, headers } = request;
    console.log(`--- modell: ${body.model} (${modellNyckel}) ---`);
    console.log(`headers: ${JSON.stringify({ ...headers, 'x-api-key': headers['x-api-key'] ? '<satt>' : '<saknas>' })}`);
    console.log(`request (utan system/messages/schema): ${JSON.stringify({ ...body, system: '…', messages: '…', output_config: { ...body.output_config, format: '…' } })}`);
    console.log('\n--- systemprompt ---\n' + body.system);
    console.log('\n--- uppdrag ---\n' + body.messages[0].content);
    console.log('\n--- schema ---\n' + JSON.stringify(SCHEMA, null, 2));
    console.log('\n[--torr] Inget anrop gjordes.');
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ANTHROPIC_API_KEY saknas i miljön — kan inte anropa Messages API. Kör med --torr för att se prompten.');
    process.exit(2);
  }

  const start = Date.now();
  const svar = await anropa(request);
  const resultat = tolkaSvar(svar, modellNyckel);
  writeFileSync(utFil, JSON.stringify(resultat, null, 2) + '\n');
  const s = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`✅ ${modellNyckel}: begärd ${resultat.modell_begard}, svarade ${resultat.modell_svarade}`
    + `${resultat.fallback_korde ? ' ⚠️ FALLBACK KÖRDE' : ''}`);
  console.log(`   tokens in/ut: ${resultat.usage.input_tokens} / ${resultat.usage.output_tokens}`
    + ` (cache-läs ${resultat.usage.cache_read_input_tokens}), ${s} s, stop_reason: ${svar.stop_reason}`);
  console.log(`   ${resultat.briefer.length} brief${resultat.briefer.length === 1 ? '' : 'er'} → ${utFil}`);
  for (const b of resultat.briefer) {
    const nej = (b.tre_fragor ?? []).filter((t) => [t.visualisera, t.falsifiera, t.ingen_annan_kan_saga].some((v) => String(v).startsWith('❌')));
    console.log(`   - ${b.namn}: hook "${b.hook}" — tre-frågorstestet: ${(b.tre_fragor ?? []).length} rader, ${nej.length} med ❌`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Inbyggda fetch följer HTTPS_PROXY bara med NODE_USE_ENV_PROXY — samma
  // omstart som tools/notify-discord.mjs.
  if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY !== '1' && !process.argv.includes('--torr')) {
    const r = spawnSync(process.execPath, process.argv.slice(1), {
      stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1' },
    });
    process.exit(r.status ?? 1);
  }
  huvud(process.argv.slice(2)).catch((e) => { console.error(`\n❌ ${e.message}\n`); process.exit(1); });
}
