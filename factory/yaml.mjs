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
    } else if (LISTOBJEKT.test(rest)) {
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
    const slut = text.indexOf(text[0], 1);
    if (slut !== -1) return text.slice(0, slut + 1);
    return text;
  }
  const m = text.match(/^(.*?)\s+#.*$/);
  return m ? m[1].trim() : text;
}

function skalar(text) {
  if (text.startsWith('"') || text.startsWith("'")) return avcitera(text);
  if (text === 'null' || text === '~') return null;
  if (text === 'true') return true;
  if (text === 'false') return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) return Number(text);
  return text;
}

function avcitera(text) {
  if (
    text.length >= 2 &&
    (text[0] === '"' || text[0] === "'") &&
    text[text.length - 1] === text[0]
  ) {
    return text.slice(1, -1);
  }
  return text;
}
