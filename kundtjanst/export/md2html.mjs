// Markdown → HTML för LibreOffice-konvertering till .docx/.pdf.
// Täcker den delmängd SOP-filerna använder: rubriker, tabeller, listor,
// checkboxar, citat, kodblock, fetstil/kursiv/kod, länkar, genomstruket, hr.
// HTML-kommentarer (granskningsnoterna) tas bort — de ska inte in i dokumentet.

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Inline-formatering. Kod först, så inget formateras inuti `...`. */
function inline(text) {
  const kod = [];
  let t = text.replace(/`([^`]+)`/g, (_, k) => {
    kod.push(k);
    return `\u0000${kod.length - 1}\u0000`;
  });
  t = esc(t);
  t = t.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1');
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  t = t.replace(/\*\*\*([^*]+)\*\*\*/g, '<b><i>$1</i></b>');
  // Fetstil får bära kursiv inuti sig (**en *viktig* sak**) — därför inte [^*]+,
  // som slutade mitt i och lämnade stjärnor i texten.
  t = t.replace(/\*\*((?:(?!\*\*)[\s\S])+?)\*\*/g, '<b>$1</b>');
  t = t.replace(/(^|[^*\w])\*([^*\n]+)\*(?=[^*\w]|$)/g, '$1<i>$2</i>');
  t = t.replace(/~~([^~]+)~~/g, '<s>$1</s>');
  t = t.replace(/\u0000(\d+)\u0000/g, (_, i) => `<span class="k">${esc(kod[Number(i)])}</span>`);
  return t;
}

const CHECK = { '[x]': '☑', '[X]': '☑', '[ ]': '☐' };

function cell(c) {
  const t = c.trim().replace(/^\[([ xX])\]\s*/, (m) => CHECK[m.trim()] + ' ');
  return inline(t);
}

export function md2html(md) {
  const rader = md
    .replace(/<!--[\s\S]*?-->/g, '')          // granskningsnoterna bort
    .replace(/\r\n/g, '\n')
    .split('\n');
  const ut = [];
  let i = 0;
  let iKod = false;

  const stangListor = (stack) => { while (stack.length) ut.push(`</${stack.pop()}>`); };
  const listor = [];

  while (i < rader.length) {
    const rad = rader[i];

    // Kodblock
    if (/^\s*```/.test(rad)) {
      if (!iKod) { stangListor(listor); ut.push('<pre>'); iKod = true; } else { ut.push('</pre>'); iKod = false; }
      i++; continue;
    }
    if (iKod) { ut.push(esc(rad)); i++; continue; }

    // Tabell: rubrikrad + avgränsare
    if (/^\s*\|/.test(rad) && /^\s*\|[\s:|-]+\|\s*$/.test(rader[i + 1] ?? '')) {
      stangListor(listor);
      const delar = (r) => r.trim().replace(/^\||\|$/g, '').split('|');
      ut.push('<table border="1" cellpadding="4" cellspacing="0"><thead><tr>');
      for (const c of delar(rad)) ut.push(`<th>${cell(c)}</th>`);
      ut.push('</tr></thead><tbody>');
      i += 2;
      while (i < rader.length && /^\s*\|/.test(rader[i])) {
        ut.push('<tr>');
        for (const c of delar(rader[i])) ut.push(`<td>${cell(c)}</td>`);
        ut.push('</tr>');
        i++;
      }
      ut.push('</tbody></table>');
      continue;
    }

    // Rubrik
    const h = rad.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      stangListor(listor);
      ut.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
      i++; continue;
    }

    // Horisontell linje
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(rad)) {
      stangListor(listor); ut.push('<hr/>'); i++; continue;
    }

    // Citat (blockquote), flera rader i följd
    if (/^\s*>/.test(rad)) {
      stangListor(listor);
      const block = [];
      while (i < rader.length && /^\s*>/.test(rader[i])) {
        block.push(rader[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      // Radbrytning inuti ett citat är ingen ny paragraf — utan hopslagningen
      // bryts **fetstil** som spänner över två rader, och stjärnorna syns.
      const stycken = [];
      let akt = [];
      const stang = () => { if (akt.length) { stycken.push(akt.join(' ')); akt = []; } };
      for (const b of block) {
        if (!b.trim()) stang();
        else if (/^\s*([-*•]|\d+[.)])\s+/.test(b) || b.trimStart().startsWith('|')) { stang(); stycken.push(b.trim()); }
        else akt.push(b.trim());
      }
      stang();
      ut.push('<div class="cit">');
      for (const b of stycken) ut.push(`<p>${inline(b.replace(/^[-*]\s+/, '• '))}</p>`);
      ut.push('</div>');
      continue;
    }

    // Listrad (punkt eller nummer), med checkbox-stöd
    const li = rad.match(/^(\s*)([-*•]|\d+[.)])\s+(.*)$/);
    if (li) {
      const niva = Math.floor(li[1].replace(/\t/g, '  ').length / 2) + 1;
      const typ = /\d/.test(li[2]) ? 'ol' : 'ul';
      while (listor.length > niva) ut.push(`</${listor.pop()}>`);
      if (listor.length === niva && listor[niva - 1] !== typ) { ut.push(`</${listor.pop()}>`); }
      while (listor.length < niva) { ut.push(`<${typ}>`); listor.push(typ); }
      // Ombruten listrad hör till samma punkt, av samma skäl som citaten ovan.
      const bitar = [li[3]];
      i++;
      while (i < rader.length && rader[i].trim()
             && !/^\s*(#{1,6}\s|[-*•]\s|\d+[.)]\s|>|\||```|-{3,}|_{3,})/.test(rader[i])) {
        bitar.push(rader[i].trim()); i++;
      }
      const txt = bitar.join(' ').replace(/^\[([ xX])\]\s*/, (m) => CHECK[m.trim()] + ' ');
      ut.push(`<li>${inline(txt)}</li>`);
      continue;
    }

    // Tom rad
    if (!rad.trim()) { stangListor(listor); i++; continue; }

    // Vanlig paragraf
    stangListor(listor);
    const p = [rad];
    i++;
    while (i < rader.length && rader[i].trim() && !/^\s*(#{1,6}\s|[-*•]\s|\d+[.)]\s|>|\||```|-{3,})/.test(rader[i])) {
      p.push(rader[i]); i++;
    }
    ut.push(`<p>${inline(p.join(' '))}</p>`);
  }
  stangListor(listor);
  if (iKod) ut.push('</pre>');
  return ut.join('\n');
}

export const STIL = `
<style>
  body { font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1a1a1a; }
  h1 { font-size: 22pt; color: #14532d; margin: 24pt 0 8pt; }
  h2 { font-size: 15pt; color: #166534; margin: 18pt 0 6pt; border-bottom: 1px solid #d1d5db; padding-bottom: 3pt; }
  h3 { font-size: 12.5pt; color: #166534; margin: 14pt 0 4pt; }
  h4, h5, h6 { font-size: 11pt; margin: 12pt 0 4pt; }
  p { margin: 0 0 7pt; line-height: 1.4; }
  table { border-collapse: collapse; width: 100%; margin: 8pt 0 12pt; font-size: 10pt; }
  th { background: #e8f0e8; text-align: left; font-weight: bold; }
  th, td { border: 1px solid #9ca3af; padding: 4pt 5pt; vertical-align: top; }
  ul, ol { margin: 0 0 8pt 0; padding-left: 20pt; }
  li { margin-bottom: 3pt; line-height: 1.4; }
  pre { background: #f3f4f6; border: 1px solid #d1d5db; padding: 6pt; font-family: Consolas, monospace; font-size: 9.5pt; white-space: pre-wrap; margin: 8pt 0 12pt; }
  .k { font-family: Consolas, monospace; font-size: 10pt; background: #f3f4f6; }
  .cit { border-left: 3pt solid #166534; padding: 4pt 0 4pt 10pt; margin: 8pt 0 12pt; background: #f7faf7; }
  .cit p { margin: 0 0 4pt; }
  hr { border: none; border-top: 1px solid #d1d5db; margin: 14pt 0; }
  a { color: #1d4ed8; }
</style>`;
