// Minimal YAML-läsare för factorys produktfiler. Noll beroenden.
//
// Stödjer det produktfilerna behöver: nästlade objekt, listor (även listor av
// objekt), citerade strängar, tal, true/false, null och #-kommentarer.
// Stödjer INTE: flerradiga block (| och >), ankare (&/*), flow-syntax ({} []).
// Håll all text på en rad och citera den om den innehåller specialtecken.

export function lasYaml(text) {
  const rader = [];
  for (const rad of String(text).split(/\r?\n/)) {
    const trimmad = rad.trim();
    if (!trimmad || trimmad.startsWith('#')) continue;
    rader.push({ indent: rad.length - rad.trimStart().length, text: trimmad });
  }
  if (rader.length === 0) return {};
  const pos = { i: 0 };
  const resultat = lasBlock(rader, pos, rader[0].indent);
  if (pos.i < rader.length) {
    throw new Error(`Oväntad indentering på raden: "${rader[pos.i].text}"`);
  }
  return resultat;
}

function lasBlock(rader, pos, indent) {
  return arListrad(rader[pos.i].text)
    ? lasLista(rader, pos, indent)
    : lasObjekt(rader, pos, indent);
}

function arListrad(text) {
  return text === '-' || text.startsWith('- ');
}

// En nyckel är antingen citerad eller allt fram till första kolon.
const NYCKEL = /^("[^"]*"|'[^']*'|[^:]+):(.*)$/;
// Ett objekt i en lista: "- nyckel: ..." (kolon följt av blank eller radslut).
const LISTOBJEKT = /^("[^"]*"|'[^']*'|[^:]+):(\s|$)/;

// En HEL citerad sträng är alltid en skalär, aldrig ett objekt.
//
// Utan det här greppet vann `[^:]+`-alternativet i LISTOBJEKT så fort texten
// bar ett kolon: raden
//   - "Vi säljer det som löser något konkret: spön som inte trasslar."
// lästes som { '"Vi säljer det som löser något konkret': 'spön …"' } och
// renderades sedan som "[object Object]" på startsidan.
// (Hittat 2026-09-09 på TackleBays startsida.) Kolon i löptext är vanligt —
// buggen träffar benefits, problem och features precis lika lätt.
// Var den citerade strängen tar slut, eller -1. Inne i "…" är \" ett citattecken
// i texten och inte slutet, och inne i '…' betyder '' ett apostroftecken.
//
// ⚠️ Naiv indexOf här kostade riktig butikstext: raden
//   - "Locktexten på lådan är på engelska: \"Merry Christmas\""
// klipptes vid det första \" och blev `Locktexten på lådan är på engelska: \`
// — en halv mening med ett löst bakstreck, uppe i butiken som en punkt i
// produktens specifikation. (Mätt 2026-09-11 på tre av AdventLanes kalendrar;
// upptäckt av översättaren, inte av oss.)
export function slutCitat(text, start = 0) {
  const q = text[start];
  if (q !== '"' && q !== "'") return -1;
  for (let i = start + 1; i < text.length; i++) {
    if (q === '"' && text[i] === '\\') { i++; continue; }
    if (text[i] !== q) continue;
    if (q === "'" && text[i + 1] === "'") { i++; continue; }
    return i;
  }
  return -1;
}

function arHelCiteradStrang(text) {
  const q = text[0];
  if (q !== '"' && q !== "'") return false;
  return text.length >= 2 && slutCitat(text) === text.length - 1;
}

function lasObjekt(rader, pos, indent) {
  const objekt = {};
  while (pos.i < rader.length) {
    const rad = rader[pos.i];
    if (rad.indent !== indent || arListrad(rad.text)) break;
    const m = rad.text.match(NYCKEL);
    if (!m) throw new Error(`Kan inte läsa raden: "${rad.text}"`);
    const nyckel = avcitera(m[1].trim());
    const rest = taBortKommentar(m[2].trim());
    pos.i++;
    if (rest === '') {
      const nasta = rader[pos.i];
      if (nasta && nasta.indent > indent) {
        objekt[nyckel] = lasBlock(rader, pos, nasta.indent);
      } else if (nasta && nasta.indent === indent && arListrad(nasta.text)) {
        objekt[nyckel] = lasLista(rader, pos, indent);
      } else {
        objekt[nyckel] = null;
      }
    } else {
      objekt[nyckel] = skalar(rest);
    }
  }
  return objekt;
}

function lasLista(rader, pos, indent) {
  const lista = [];
  while (pos.i < rader.length) {
    const rad = rader[pos.i];
    if (rad.indent !== indent || !arListrad(rad.text)) break;
    const rest = taBortKommentar(rad.text === '-' ? '' : rad.text.slice(2).trim());
    if (rest === '') {
      pos.i++;
      const nasta = rader[pos.i];
      lista.push(nasta && nasta.indent > indent ? lasBlock(rader, pos, nasta.indent) : null);
    } else if (!arHelCiteradStrang(rest) && LISTOBJEKT.test(rest)) {
      // "- nyckel: värde" — skriv om raden som en objektrad två steg in,
      // så hamnar den och de djupare raderna under i samma objekt.
      rader[pos.i] = { indent: indent + 2, text: rest };
      lista.push(lasObjekt(rader, pos, indent + 2));
    } else {
      pos.i++;
      lista.push(skalar(rest));
    }
  }
  return lista;
}

function taBortKommentar(text) {
  if (text.startsWith('#')) return '';
  if (text.startsWith('"') || text.startsWith("'")) {
    const slut = slutCitat(text);
    if (slut !== -1) return text.slice(0, slut + 1);
    return text;
  }
  const m = text.match(/^(.*?)\s+#.*$/);
  return m ? m[1].trim() : text;
}

function skalar(text) {
  if (text.startsWith('"') || text.startsWith("'")) return avcitera(text);
  if (text === 'null' || text === '~') return null;
  // Tomma flow-värden: `videor: []` och `extra: {}` är vanliga sätt att säga
  // "inget här". Utan det här blev "[]" en STRÄNG och `.filter` kraschade
  // build-store (hittat 2026-09-09 på TankGuards `videor: []`). Fyllda
  // flow-listor ([a, b]) stöds fortfarande inte — skriv dem som radlistor.
  if (text === '[]') return [];
  if (text === '{}') return {};
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  return text;
}

// Tar bort citattecknen OCH läser escaperna innanför dem: \" blir ett
// citattecken i texten, \\ ett bakstreck, och '' inne i en apostrofsträng en
// apostrof. Okända escaper behåller tecknet efter bakstrecket, som i YAML.
function avcitera(text) {
  const q = text[0];
  if (text.length < 2 || (q !== '"' && q !== "'") || text[text.length - 1] !== q) return text;
  const inre = text.slice(1, -1);
  if (q === "'") return inre.replace(/''/g, "'");
  return inre.replace(/\\(.)/g, (_, c) => (c === 'n' ? '\n' : c === 't' ? '\t' : c === 'r' ? '\r' : c));
}
