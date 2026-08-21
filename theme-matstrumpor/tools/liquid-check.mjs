/* ==========================================================================
   liquid-check.mjs — statisk kontroll av Liquid-filerna i temat.

   Shopifys egen linter finns inte i den här miljön, så det här skriptet tar
   de fel som faktiskt går att hitta utan att rendera:

     1. Obalanserade block      {% if %} utan {% endif %} osv, även inuti
                                {% liquid %}-taggens radbaserade syntax.
     2. Fel ordning             {% endfor %} som stänger ett {% if %}.
     3. Filter i for-satser     {% for x in y | split: ',' %} är ogiltigt.
     4. Filter i render-argument{% render 'a', b: c | strip %} är opålitligt.
     5. Okända ikonnamn         render 'ms-icon' med namn som inte finns.
     6. Oparad {{ }}            ojämnt antal måsvingar.
     7. Schema-JSON             ogiltig JSON, dubblerade inställnings-id,
                                okända inställningstyper, presets som pekar
                                på blocktyper som inte finns.

   Körs med: node theme-matstrumpor/tools/liquid-check.mjs
   Avslutar med kod 1 om något är fel, så den kan användas som grind.
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

const PAIRS = {
  if: 'endif', unless: 'endunless', for: 'endfor', case: 'endcase',
  capture: 'endcapture', form: 'endform', paginate: 'endpaginate',
  tablerow: 'endtablerow', comment: 'endcomment', raw: 'endraw',
  schema: 'endschema', style: 'endstyle', javascript: 'endjavascript',
  stylesheet: 'endstylesheet', liquid: null
};
const MIDDLES = new Set(['else', 'elsif', 'when', 'break', 'continue']);
const CLOSERS = new Set(Object.values(PAIRS).filter(Boolean));

function iconNames() {
  const src = fs.readFileSync(path.join(ROOT, 'snippets/ms-icon.liquid'), 'utf8');
  const names = new Set();
  for (const m of src.matchAll(/\{%-?\s*when\s+'([^']+)'/g)) names.add(m[1]);
  return names;
}

function liquidFiles() {
  const out = [];
  for (const dir of ['snippets', 'sections', 'blocks', 'layout', 'templates']) {
    const d = path.join(ROOT, dir);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) {
      if (f.endsWith('.liquid')) out.push(path.join(d, f));
    }
  }
  return out.sort();
}

/* Plocka ut alla taggar, inklusive de rader som ligger inuti {% liquid %}. */
function tags(src) {
  const found = [];
  const re = /\{%-?\s*([\s\S]*?)\s*-?%\}/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const body = m[1];
    const line = src.slice(0, m.index).split('\n').length;
    const word = body.trim().split(/\s+/)[0];

    if (word === 'liquid') {
      // Radbaserad syntax: varje rad är en egen tagg.
      const inner = body.replace(/^liquid\s*/, '');
      let ln = line;
      for (const rawLine of inner.split('\n')) {
        ln++;
        const t = rawLine.trim().replace(/#.*$/, '');
        if (!t) continue;
        found.push({ word: t.split(/\s+/)[0], body: t, line: ln, inLiquid: true });
      }
      continue;
    }
    found.push({ word, body: body.trim(), line, inLiquid: false });

    // Hoppa över innehållet i råblock så deras text inte tolkas som taggar.
    if (word === 'comment' || word === 'raw' || word === 'schema') {
      const close = new RegExp(`\\{%-?\\s*end${word}\\s*-?%\\}`, 'g');
      close.lastIndex = re.lastIndex;
      const c = close.exec(src);
      if (c) {
        found.push({ word: 'end' + word, body: 'end' + word, line: src.slice(0, c.index).split('\n').length, inLiquid: false });
        re.lastIndex = close.lastIndex;
      }
    }
  }
  return found;
}

function checkFile(file, icons) {
  const rel = path.relative(ROOT, file);
  const src = fs.readFileSync(file, 'utf8');
  const problems = [];
  const stack = [];

  for (const t of tags(src)) {
    const { word, body, line } = t;

    if (PAIRS[word] !== undefined && PAIRS[word] !== null) {
      stack.push({ word, line });
    } else if (CLOSERS.has(word)) {
      const open = stack.pop();
      if (!open) {
        problems.push(`rad ${line}: {% ${word} %} utan matchande öppning`);
      } else if (PAIRS[open.word] !== word) {
        problems.push(`rad ${line}: {% ${word} %} stänger {% ${open.word} %} som öppnades på rad ${open.line}`);
      }
    } else if (MIDDLES.has(word)) {
      if (!stack.length) problems.push(`rad ${line}: {% ${word} %} utanför något block`);
    }

    if (word === 'for' && /\bin\b[^%]*\|/.test(body)) {
      problems.push(`rad ${line}: filter i for-satsen är ogiltig Liquid — gör en assign först`);
    }
    if (word === 'render' || word === 'include') {
      const args = body.replace(/^\w+\s+'[^']*'\s*,?/, '');
      if (args.includes('|')) {
        problems.push(`rad ${line}: filter i render-argument är opålitligt — gör en assign först`);
      }
      const icon = body.match(/render\s+'ms-icon'[^%]*?name:\s*'([^']+)'/);
      if (icon && !icons.has(icon[1])) {
        problems.push(`rad ${line}: ikonen '${icon[1]}' finns inte i ms-icon.liquid`);
      }
    }
  }

  for (const open of stack) {
    problems.push(`rad ${open.line}: {% ${open.word} %} stängs aldrig`);
  }

  // Oparade måsvingar utanför taggar.
  const stripped = src.replace(/\{%-?[\s\S]*?-?%\}/g, '');
  const opens = (stripped.match(/\{\{/g) || []).length;
  const closes = (stripped.match(/\}\}/g) || []).length;
  if (opens !== closes) {
    problems.push(`ojämnt antal {{ (${opens}) och }} (${closes})`);
  }

  problems.push(...checkSchema(src));

  return { rel, problems };
}

/* --- {% schema %} ------------------------------------------------------- */

const SETTING_TYPES = new Set([
  'text', 'textarea', 'number', 'range', 'checkbox', 'select', 'radio',
  'color', 'color_background', 'color_scheme', 'color_scheme_group', 'font_picker',
  'collection', 'collection_list', 'product', 'product_list', 'blog', 'page',
  'article', 'link_list', 'url', 'video', 'video_url', 'image_picker',
  'richtext', 'inline_richtext', 'html', 'liquid', 'metaobject', 'metaobject_list',
  'text_alignment', 'style_layout_panel', 'style_size_panel', 'style_spacing_panel',
  'header', 'paragraph'
]);

function checkSchema(src) {
  const m = src.match(/\{%-?\s*schema\s*-?%\}([\s\S]*?)\{%-?\s*endschema\s*-?%\}/);
  if (!m) return [];

  let json;
  try {
    json = JSON.parse(m[1]);
  } catch (e) {
    return [`schema: ogiltig JSON — ${e.message}`];
  }

  const out = [];
  const ids = new Set();

  const walkSettings = (list, where) => {
    if (!Array.isArray(list)) return;
    for (const s of list) {
      if (!s || typeof s !== 'object') continue;
      if (!SETTING_TYPES.has(s.type)) {
        out.push(`schema: okänd inställningstyp '${s.type}' i ${where}`);
      }
      if (s.type === 'header' || s.type === 'paragraph') continue;
      if (!s.id) { out.push(`schema: inställning utan id i ${where}`); continue; }
      const key = where + '/' + s.id;
      if (ids.has(key)) out.push(`schema: dubblerat id '${s.id}' i ${where}`);
      ids.add(key);
      if (s.type === 'select' || s.type === 'radio') {
        if (!Array.isArray(s.options) || !s.options.length) {
          out.push(`schema: '${s.id}' är ${s.type} men saknar options`);
        } else if (s.default !== undefined &&
                   !s.options.some(o => o.value === s.default)) {
          out.push(`schema: standardvärdet '${s.default}' för '${s.id}' finns inte bland options`);
        }
      }
      if (s.type === 'range') {
        const { min, max, step, default: d } = s;
        if ([min, max, step].some(v => typeof v !== 'number')) {
          out.push(`schema: range '${s.id}' saknar min/max/step som tal`);
        } else {
          if ((max - min) % step !== 0) {
            out.push(`schema: range '${s.id}' — (max-min) går inte jämnt upp i step, Shopify avvisar det`);
          }
          if (typeof d === 'number' && (d < min || d > max)) {
            out.push(`schema: range '${s.id}' har standardvärde utanför min/max`);
          }
        }
      }
    }
  };

  walkSettings(json.settings, 'settings');

  const blockTypes = new Set();
  if (Array.isArray(json.blocks)) {
    for (const b of json.blocks) {
      if (b.type) blockTypes.add(b.type);
      walkSettings(b.settings, `block '${b.type}'`);
    }
  }

  if (Array.isArray(json.presets)) {
    for (const p of json.presets) {
      if (!p.name) out.push('schema: preset utan name');
      for (const b of p.blocks || []) {
        const t = typeof b === 'string' ? b : b.type;
        if (t && blockTypes.size && !blockTypes.has(t)) {
          out.push(`schema: preset pekar på blocktypen '${t}' som inte är definierad`);
        }
      }
    }
  }

  return out;
}

const icons = iconNames();
const files = liquidFiles();
let bad = 0;

for (const f of files) {
  const { rel, problems } = checkFile(f, icons);
  if (problems.length) {
    bad++;
    console.log(`\n✗ ${rel}`);
    for (const p of problems) console.log(`    ${p}`);
  } else {
    console.log(`✓ ${rel}`);
  }
}

console.log(`\n${files.length} filer kontrollerade, ${bad} med fel.`);
console.log(`Ikoner tillgängliga: ${[...icons].sort().join(', ')}`);
process.exit(bad ? 1 : 0);
