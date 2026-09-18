// Tunn klient mot kie.ai:s jobb-API. Noll externa beroenden — använder inbyggda fetch.
//
// kie.ai kör allt asynkront och likadant för alla modeller:
//   POST /api/v1/jobs/createTask   { model, input }        -> { code, data: { taskId } }
//   GET  /api/v1/jobs/recordInfo?taskId=...                -> { code, data: { state, resultJson } }
// state går waiting -> queuing -> generating -> success | fail.
// En 200:a på createTask betyder BARA att jobbet lades i kö, aldrig att bilden finns.
//
// Kräver env KIE_API_KEY. Alla nätverksanrop går via injicerbar fetch så testerna
// kan köras utan nyckel och utan att bränna credits.

export const BAS_URL = process.env.KIE_BASE_URL || 'https://api.kie.ai';

// Modellerna vi använder. text2image när briefen inte har någon referensbild,
// edit-varianten när den pekar på en Winning Creative att matcha.
export const MODELL_TEXT = 'google/nano-banana';
export const MODELL_REDIGERA = 'google/nano-banana-edit';

// Metas statiska annonsformat. 4:5 är feed-standarden, 1:1 används av flera briefer.
export const TILLATNA_BILDFORMAT = [
  '1:1', '9:16', '16:9', '3:4', '4:3', '3:2', '2:3', '5:4', '4:5', '21:9', 'auto',
];

const SLUTLIGA_LAGEN = { success: 'klar', fail: 'fel' };

export class KieFel extends Error {
  constructor(meddelande, { taskId = null, kod = null } = {}) {
    super(meddelande);
    this.name = 'KieFel';
    this.taskId = taskId;
    this.kod = kod;
  }
}

export function hamtaNyckel(env = process.env) {
  const nyckel = env.KIE_API_KEY;
  if (!nyckel) {
    throw new KieFel(
      'Saknar KIE_API_KEY i miljön. Kör med --dry för att se planen utan att generera något.',
    );
  }
  return nyckel;
}

const sovStandard = (ms) => new Promise((r) => setTimeout(r, ms));

// Plockar ut nyttolasten ur kie.ais kuvert { code, msg, data } och felar tydligt.
function packaUpp(svar, vad) {
  if (!svar || typeof svar !== 'object') {
    throw new KieFel(`${vad}: tomt svar från kie.ai.`);
  }
  if (svar.code !== 200) {
    throw new KieFel(`${vad}: kie.ai svarade ${svar.code} — ${svar.msg || 'okänt fel'}.`, {
      kod: svar.code,
    });
  }
  return svar.data;
}

async function anropa(sokvag, { metod = 'GET', kropp = null, fetchImpl, env } = {}) {
  const doFetch = fetchImpl || globalThis.fetch;
  const svar = await doFetch(`${BAS_URL}${sokvag}`, {
    method: metod,
    headers: {
      Authorization: `Bearer ${hamtaNyckel(env)}`,
      'Content-Type': 'application/json',
    },
    ...(kropp ? { body: JSON.stringify(kropp) } : {}),
  });
  if (!svar.ok) {
    const text = await svar.text().catch(() => '');
    throw new KieFel(`HTTP ${svar.status} från ${sokvag}. ${text.slice(0, 300)}`, {
      kod: svar.status,
    });
  }
  return svar.json();
}

// Lägger ett genereringsjobb i kö och returnerar dess taskId.
export async function skapaJobb(
  { prompt, referensBilder = [], bildformat = '4:5', filformat = 'png', modell = null },
  { fetchImpl, env } = {},
) {
  if (!prompt || !prompt.trim()) throw new KieFel('Tom prompt — vägrar skapa jobb.');
  if (!TILLATNA_BILDFORMAT.includes(bildformat)) {
    throw new KieFel(
      `Ogiltigt bildformat "${bildformat}". Tillåtna: ${TILLATNA_BILDFORMAT.join(', ')}.`,
    );
  }
  if (referensBilder.length > 10) {
    throw new KieFel(`Max 10 referensbilder, fick ${referensBilder.length}.`);
  }

  const harReferens = referensBilder.length > 0;
  const valdModell = modell || (harReferens ? MODELL_REDIGERA : MODELL_TEXT);

  const input = { prompt, output_format: filformat, aspect_ratio: bildformat };
  if (harReferens) input.image_urls = referensBilder;

  const data = packaUpp(
    await anropa('/api/v1/jobs/createTask', {
      metod: 'POST',
      kropp: { model: valdModell, input },
      fetchImpl,
      env,
    }),
    'createTask',
  );
  if (!data?.taskId) throw new KieFel('createTask gav inget taskId.');
  return { taskId: data.taskId, modell: valdModell };
}

// resultJson kommer som JSON-STRÄNG från kie.ai, men vissa modeller ger objekt.
export function lasResultUrler(resultJson) {
  if (!resultJson) return [];
  let tolkat = resultJson;
  if (typeof resultJson === 'string') {
    try {
      tolkat = JSON.parse(resultJson);
    } catch {
      return [];
    }
  }
  const urler = tolkat?.resultUrls ?? tolkat?.result_urls ?? [];
  return Array.isArray(urler) ? urler.filter((u) => typeof u === 'string' && u) : [];
}

export async function hamtaJobb(taskId, { fetchImpl, env } = {}) {
  const data = packaUpp(
    await anropa(`/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
      fetchImpl,
      env,
    }),
    'recordInfo',
  );
  const lage = String(data?.state || '').toLowerCase();
  return {
    taskId,
    lage,
    klar: SLUTLIGA_LAGEN[lage] === 'klar',
    misslyckad: SLUTLIGA_LAGEN[lage] === 'fel',
    felmeddelande: data?.failMsg || data?.failMessage || null,
    urler: lasResultUrler(data?.resultJson),
  };
}

// Pollar tills jobbet är klart. Timeout är en hård gräns — ett hängande jobb
// får aldrig låsa nattens körning.
export async function vantaPaJobb(
  taskId,
  { fetchImpl, env, intervallMs = 5000, timeoutMs = 300000, sov = sovStandard, nu = Date.now } = {},
) {
  const start = nu();
  for (;;) {
    const status = await hamtaJobb(taskId, { fetchImpl, env });
    if (status.klar) {
      if (!status.urler.length) {
        throw new KieFel('Jobbet blev klart men innehöll ingen bild-URL.', { taskId });
      }
      return status;
    }
    if (status.misslyckad) {
      throw new KieFel(`Jobbet misslyckades: ${status.felmeddelande || 'okänd orsak'}.`, { taskId });
    }
    if (nu() - start >= timeoutMs) {
      throw new KieFel(
        `Timeout efter ${Math.round(timeoutMs / 1000)}s (senaste läge: ${status.lage || 'okänt'}).`,
        { taskId },
      );
    }
    await sov(intervallMs);
  }
}

// Skapa + vänta i ett svep. Returnerar { taskId, modell, urler }.
export async function genereraBild(jobb, valfritt = {}) {
  const { taskId, modell } = await skapaJobb(jobb, valfritt);
  const status = await vantaPaJobb(taskId, valfritt);
  return { taskId, modell, urler: status.urler };
}
