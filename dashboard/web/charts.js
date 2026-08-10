/**
 * Små SVG-charts, byggda för hand. Inga bibliotek — sidan ska fungera offline
 * och laddas direkt.
 *
 * Regler som följs genomgående:
 *  · tunna marks (staplar max 24 px), 4 px rundad topp, hårfina gridlinjer
 *  · 2 px mellanrum i ytfärgen mellan staplade segment och grannstaplar
 *  · text bär aldrig seriefärgen — färgen sitter i marken, identiteten i legenden
 *  · varje chart har hover + en tabellvy som visar exakt samma siffror
 */

const NS = 'http://www.w3.org/2000/svg';
const GAP = 2; // ytmellanrum mellan marks

export function el(tag, attrs = {}, children = []) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) continue;
    node.setAttribute(key, String(value));
  }
  for (const child of [].concat(children)) {
    if (child) node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

function css(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function seriesColor(index) {
  return `var(--series-${(index % 8) + 1})`;
}

/* --- Skalor och ticks ---------------------------------------------- */

function niceCeil(value) {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = 10 ** exp;
  const n = value / base;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * base;
}

export function ticks(max, count = 4) {
  const top = niceCeil(max || 1);
  const step = top / count;
  return Array.from({ length: count + 1 }, (_, i) => Math.round(i * step * 1000) / 1000);
}

/* --- Tooltip -------------------------------------------------------- */

const tooltipEl = () => document.getElementById('tooltip');

export function showTooltip(event, html) {
  const tip = tooltipEl();
  if (!tip) return;
  tip.innerHTML = html;
  tip.hidden = false;
  const pad = 14;
  const rect = tip.getBoundingClientRect();
  let x = event.clientX + pad;
  let y = event.clientY + pad;
  if (x + rect.width > window.innerWidth - 8) x = event.clientX - rect.width - pad;
  if (y + rect.height > window.innerHeight - 8) y = event.clientY - rect.height - pad;
  tip.style.left = `${Math.max(8, x)}px`;
  tip.style.top = `${Math.max(8, y)}px`;
}

export function hideTooltip() {
  const tip = tooltipEl();
  if (tip) tip.hidden = true;
}

function hoverable(node, html) {
  node.addEventListener('mousemove', (e) => showTooltip(e, html));
  node.addEventListener('mouseleave', hideTooltip);
  node.addEventListener('focus', (e) => {
    const r = node.getBoundingClientRect();
    showTooltip({ clientX: r.left + r.width / 2, clientY: r.top }, html);
  });
  node.addEventListener('blur', hideTooltip);
  node.setAttribute('tabindex', '0');
  return node;
}

export function swatch(color) {
  return `<span style="display:inline-block;width:9px;height:9px;border-radius:3px;background:${color}"></span>`;
}

/* --- Gemensamt ramverk ---------------------------------------------- */

function frame(container, { width = 720, height = 260, margin }) {
  container.textContent = '';
  const svg = el('svg', {
    viewBox: `0 0 ${width} ${height}`,
    preserveAspectRatio: 'xMidYMid meet',
    role: 'img',
  });
  container.appendChild(svg);
  return {
    svg,
    width,
    height,
    margin,
    plotW: width - margin.left - margin.right,
    plotH: height - margin.top - margin.bottom,
  };
}

function yAxis(ctx, scaleMax, format) {
  const { svg, margin, plotW, plotH } = ctx;
  for (const value of ticks(scaleMax)) {
    const y = margin.top + plotH - (value / scaleMax) * plotH;
    svg.appendChild(
      el('line', {
        x1: margin.left,
        x2: margin.left + plotW,
        y1: y,
        y2: y,
        stroke: value === 0 ? 'var(--axis)' : 'var(--grid)',
        'stroke-width': 1,
      }),
    );
    svg.appendChild(
      el(
        'text',
        {
          x: margin.left - 8,
          y: y + 4,
          'text-anchor': 'end',
          fill: 'var(--text-muted)',
          'font-size': 11,
          style: 'font-variant-numeric: tabular-nums',
        },
        format ? format(value) : String(value),
      ),
    );
  }
}

function legend(container, items) {
  if (items.length < 2) return;
  const box = document.createElement('div');
  box.className = 'legend';
  box.innerHTML = items
    .map(
      (item) =>
        `<span class="legend__item"><span class="legend__swatch" style="background:${item.color}"></span>${item.label}</span>`,
    )
    .join('');
  container.appendChild(box);
}

function columnPath(x, y, w, h, r = 4) {
  if (h <= 0) return null;
  const radius = Math.min(r, h, w / 2);
  return (
    `M${x},${y + h} L${x},${y + radius} Q${x},${y} ${x + radius},${y} ` +
    `L${x + w - radius},${y} Q${x + w},${y} ${x + w},${y + radius} L${x + w},${y + h} Z`
  );
}

/* --- 1. Staplade kolumner (output per dag) --------------------------- */

export function stackedColumns(container, { rows, series, formatValue = String, emptyText }) {
  container.textContent = '';
  if (!rows.length) return empty(container, emptyText);

  const margin = { top: 12, right: 12, bottom: 32, left: 44 };
  const width = 720;
  const height = 260;
  const ctx = frame(container, { width, height, margin });
  const max = Math.max(
    1,
    ...rows.map((row) => series.reduce((sum, s) => sum + (row.values[s.key] || 0), 0)),
  );
  const scaleMax = niceCeil(max);
  yAxis(ctx, scaleMax, formatValue);

  const band = ctx.plotW / rows.length;
  const barW = Math.min(24, Math.max(3, band - Math.max(2, band * 0.25)));

  rows.forEach((row, i) => {
    const x = margin.left + band * i + (band - barW) / 2;
    const stack = series
      .map((s) => ({ ...s, value: row.values[s.key] || 0 }))
      .filter((s) => s.value > 0);
    let cursor = margin.top + ctx.plotH;
    stack.forEach((segment, idx) => {
      const rawH = (segment.value / scaleMax) * ctx.plotH;
      const isTop = idx === stack.length - 1;
      const h = Math.max(1, rawH - (isTop ? 0 : GAP));
      const y = cursor - rawH;
      const path = columnPath(x, y, barW, h, isTop ? 4 : 0);
      if (path) {
        const node = el('path', { d: path, fill: segment.color });
        hoverable(
          node,
          `<strong>${row.label}</strong>` +
            stack
              .slice()
              .reverse()
              .map(
                (s) =>
                  `<div class="tooltip__row"><span class="tooltip__key">${swatch(s.color)}${s.label}</span>` +
                  `<span class="tooltip__value">${formatValue(s.value)}</span></div>`,
              )
              .join(''),
        );
        ctx.svg.appendChild(node);
      }
      cursor -= rawH;
    });
  });

  // X-etiketter: bara så många som får plats.
  const every = Math.ceil(rows.length / 10);
  rows.forEach((row, i) => {
    if (i % every !== 0 && i !== rows.length - 1) return;
    ctx.svg.appendChild(
      el(
        'text',
        {
          x: margin.left + band * i + band / 2,
          y: height - 12,
          'text-anchor': 'middle',
          fill: 'var(--text-muted)',
          'font-size': 11,
        },
        row.shortLabel || row.label,
      ),
    );
  });

  legend(container, series);
}

/* --- 2. Linjer (ledtid per vecka) ------------------------------------ */

export function multiLine(container, { points, series, formatValue = String, emptyText }) {
  container.textContent = '';
  if (!points.length) return empty(container, emptyText);

  const margin = { top: 12, right: 64, bottom: 32, left: 44 };
  const width = 720;
  const height = 260;
  const ctx = frame(container, { width, height, margin });
  const values = series.flatMap((s) => s.values.filter((v) => v !== null && v !== undefined));
  const scaleMax = niceCeil(Math.max(1, ...values));
  yAxis(ctx, scaleMax, formatValue);

  const x = (i) => margin.left + (points.length === 1 ? ctx.plotW / 2 : (ctx.plotW * i) / (points.length - 1));
  const y = (v) => margin.top + ctx.plotH - (v / scaleMax) * ctx.plotH;

  for (const s of series) {
    const segments = [];
    let current = [];
    s.values.forEach((v, i) => {
      if (v === null || v === undefined) {
        if (current.length) segments.push(current);
        current = [];
      } else current.push([x(i), y(v)]);
    });
    if (current.length) segments.push(current);
    for (const seg of segments) {
      if (seg.length === 1) {
        ctx.svg.appendChild(
          el('circle', { cx: seg[0][0], cy: seg[0][1], r: 4, fill: s.color, stroke: 'var(--surface-1)', 'stroke-width': 2 }),
        );
        continue;
      }
      ctx.svg.appendChild(
        el('path', {
          d: seg.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' '),
          fill: 'none',
          stroke: s.color,
          'stroke-width': 2,
          'stroke-linejoin': 'round',
          'stroke-linecap': 'round',
        }),
      );
    }
    // Ändpunkt + direktetikett för den sista serien-punkten.
    const lastIndex = [...s.values].reduce((acc, v, i) => (v !== null && v !== undefined ? i : acc), -1);
    if (lastIndex >= 0) {
      ctx.svg.appendChild(
        el('circle', {
          cx: x(lastIndex),
          cy: y(s.values[lastIndex]),
          r: 4,
          fill: s.color,
          stroke: 'var(--surface-1)',
          'stroke-width': 2,
        }),
      );
      if (s.label) {
        ctx.svg.appendChild(
          el(
            'text',
            {
              x: x(lastIndex) + 9,
              y: y(s.values[lastIndex]) + 4,
              fill: 'var(--text-secondary)',
              'font-size': 11,
            },
            s.short || s.label,
          ),
        );
      }
    }
  }

  // Crosshair: en osynlig träffyta per x-position.
  const band = ctx.plotW / Math.max(1, points.length - 1 || 1);
  points.forEach((point, i) => {
    const hit = el('rect', {
      x: x(i) - band / 2,
      y: margin.top,
      width: Math.max(band, 24),
      height: ctx.plotH,
      fill: 'transparent',
    });
    const rows = series
      .map((s) => ({ s, v: s.values[i] }))
      .filter((r) => r.v !== null && r.v !== undefined)
      .map(
        (r) =>
          `<div class="tooltip__row"><span class="tooltip__key">${swatch(r.s.color)}${r.s.label}</span>` +
          `<span class="tooltip__value">${formatValue(r.v)}</span></div>`,
      )
      .join('');
    hoverable(hit, `<strong>${point.label}</strong>${rows || '<em>inga leveranser</em>'}`);
    hit.addEventListener('mouseenter', () => {
      line.setAttribute('x1', x(i));
      line.setAttribute('x2', x(i));
      line.setAttribute('opacity', '1');
    });
    hit.addEventListener('mouseleave', () => line.setAttribute('opacity', '0'));
    ctx.svg.appendChild(hit);
  });
  const line = el('line', {
    x1: 0,
    x2: 0,
    y1: margin.top,
    y2: margin.top + ctx.plotH,
    stroke: 'var(--axis)',
    'stroke-width': 1,
    opacity: 0,
    'pointer-events': 'none',
  });
  ctx.svg.appendChild(line);

  const every = Math.ceil(points.length / 8);
  points.forEach((point, i) => {
    if (i % every !== 0 && i !== points.length - 1) return;
    ctx.svg.appendChild(
      el(
        'text',
        { x: x(i), y: height - 12, 'text-anchor': 'middle', fill: 'var(--text-muted)', 'font-size': 11 },
        point.shortLabel || point.label,
      ),
    );
  });

  legend(container, series);
}

/* --- 3. Liggande staplar (omgörningar per redigerare) ---------------- */

export function stackedBars(container, { rows, series, formatValue = String, reference, emptyText }) {
  container.textContent = '';
  if (!rows.length) return empty(container, emptyText);

  const rowH = 34;
  const margin = { top: 10, right: 56, bottom: 26, left: 120 };
  const width = 720;
  const height = margin.top + margin.bottom + rows.length * rowH;
  const ctx = frame(container, { width, height, margin });
  const totals = rows.map((row) => series.reduce((sum, s) => sum + (row.values[s.key] || 0), 0));
  const scaleMax = niceCeil(Math.max(0.05, ...totals, reference?.value || 0));
  const x = (v) => margin.left + (v / scaleMax) * ctx.plotW;

  for (const value of ticks(scaleMax)) {
    ctx.svg.appendChild(
      el('line', {
        x1: x(value),
        x2: x(value),
        y1: margin.top,
        y2: margin.top + ctx.plotH,
        stroke: value === 0 ? 'var(--axis)' : 'var(--grid)',
        'stroke-width': 1,
      }),
    );
    ctx.svg.appendChild(
      el(
        'text',
        { x: x(value), y: height - 10, 'text-anchor': 'middle', fill: 'var(--text-muted)', 'font-size': 11 },
        formatValue(value),
      ),
    );
  }

  const barH = Math.min(24, rowH - 14);
  rows.forEach((row, i) => {
    const y = margin.top + i * rowH + (rowH - barH) / 2;
    ctx.svg.appendChild(
      el(
        'text',
        { x: margin.left - 10, y: y + barH / 2 + 4, 'text-anchor': 'end', fill: 'var(--text-secondary)', 'font-size': 12 },
        row.label,
      ),
    );

    const stack = series.map((s) => ({ ...s, value: row.values[s.key] || 0 })).filter((s) => s.value > 0);
    let cursor = margin.left;
    stack.forEach((segment, idx) => {
      const rawW = (segment.value / scaleMax) * ctx.plotW;
      const isEnd = idx === stack.length - 1;
      const w = Math.max(1, rawW - (isEnd ? 0 : GAP));
      const path = isEnd
        ? `M${cursor},${y} L${cursor + Math.max(0, w - 4)},${y} Q${cursor + w},${y} ${cursor + w},${y + 4} ` +
          `L${cursor + w},${y + barH - 4} Q${cursor + w},${y + barH} ${cursor + Math.max(0, w - 4)},${y + barH} L${cursor},${y + barH} Z`
        : `M${cursor},${y} L${cursor + w},${y} L${cursor + w},${y + barH} L${cursor},${y + barH} Z`;
      const node = el('path', { d: path, fill: segment.color });
      hoverable(
        node,
        `<strong>${row.label}</strong>` +
          stack
            .map(
              (s) =>
                `<div class="tooltip__row"><span class="tooltip__key">${swatch(s.color)}${s.label}</span>` +
                `<span class="tooltip__value">${formatValue(s.value)}</span></div>`,
            )
            .join('') +
          (row.note ? `<div class="tooltip__row"><span class="tooltip__key">${row.note}</span></div>` : ''),
      );
      ctx.svg.appendChild(node);
      cursor += rawW;
    });

    ctx.svg.appendChild(
      el(
        'text',
        { x: cursor + 8, y: y + barH / 2 + 4, fill: 'var(--text-secondary)', 'font-size': 11, style: 'font-variant-numeric: tabular-nums' },
        formatValue(totals[i]),
      ),
    );
  });

  if (reference && reference.value > 0) {
    ctx.svg.appendChild(
      el('line', {
        x1: x(reference.value),
        x2: x(reference.value),
        y1: margin.top - 4,
        y2: margin.top + ctx.plotH + 4,
        stroke: 'var(--text-muted)',
        'stroke-width': 1,
      }),
    );
    ctx.svg.appendChild(
      el(
        'text',
        { x: x(reference.value), y: margin.top - 8, 'text-anchor': 'middle', fill: 'var(--text-muted)', 'font-size': 10 },
        reference.label,
      ),
    );
  }

  legend(container, series);
}

/* --- 4. Punktdiagram (fart mot träffsäkerhet) ------------------------ */

export function scatter(container, { points, xLabel, yLabel, formatX = String, formatY = String, emptyText }) {
  container.textContent = '';
  if (!points.length) return empty(container, emptyText);

  const margin = { top: 16, right: 24, bottom: 44, left: 52 };
  const width = 720;
  const height = 300;
  const ctx = frame(container, { width, height, margin });
  const xMax = niceCeil(Math.max(...points.map((p) => p.x), 1));
  const yMax = 1;
  const px = (v) => margin.left + (v / xMax) * ctx.plotW;
  const py = (v) => margin.top + ctx.plotH - (v / yMax) * ctx.plotH;

  for (const value of ticks(yMax)) {
    ctx.svg.appendChild(
      el('line', {
        x1: margin.left,
        x2: margin.left + ctx.plotW,
        y1: py(value),
        y2: py(value),
        stroke: value === 0 ? 'var(--axis)' : 'var(--grid)',
        'stroke-width': 1,
      }),
    );
    ctx.svg.appendChild(
      el(
        'text',
        { x: margin.left - 8, y: py(value) + 4, 'text-anchor': 'end', fill: 'var(--text-muted)', 'font-size': 11 },
        formatY(value),
      ),
    );
  }
  for (const value of ticks(xMax)) {
    ctx.svg.appendChild(
      el(
        'text',
        { x: px(value), y: height - 26, 'text-anchor': 'middle', fill: 'var(--text-muted)', 'font-size': 11 },
        formatX(value),
      ),
    );
  }

  ctx.svg.appendChild(
    el('text', { x: margin.left + ctx.plotW / 2, y: height - 6, 'text-anchor': 'middle', fill: 'var(--text-muted)', 'font-size': 11 }, xLabel),
  );
  ctx.svg.appendChild(
    el(
      'text',
      {
        x: 14,
        y: margin.top + ctx.plotH / 2,
        'text-anchor': 'middle',
        fill: 'var(--text-muted)',
        'font-size': 11,
        transform: `rotate(-90 14 ${margin.top + ctx.plotH / 2})`,
      },
      yLabel,
    ),
  );

  const maxSize = Math.max(...points.map((p) => p.size || 1), 1);
  // Etiketter får inte krocka med varandra eller med punkterna.
  const placed = points.map((p) => {
    const r = 5 + 9 * Math.sqrt((p.size || 1) / maxSize);
    return { cx: px(p.x), y: py(p.y), halfWidth: r + 2 };
  });
  points.forEach((point) => {
    const r = 5 + 9 * Math.sqrt((point.size || 1) / maxSize);
    const node = el('circle', {
      cx: px(point.x),
      cy: py(point.y),
      r,
      fill: point.color || 'var(--series-1)',
      stroke: 'var(--surface-1)',
      'stroke-width': 2,
      opacity: 0.92,
    });
    hoverable(node, `<strong>${point.label}</strong>${point.tooltip || ''}`);
    ctx.svg.appendChild(node);

    // Etiketten hamnar ovanför punkten, men flyttas under om den krockar.
    const halfWidth = point.label.length * 3.2 + 4;
    const cx = px(point.x);
    let ly = py(point.y) - r - 7;
    const collides = (y) =>
      placed.some((p) => Math.abs(p.y - y) < 13 && Math.abs(p.cx - cx) < p.halfWidth + halfWidth);
    if (collides(ly)) ly = py(point.y) + r + 14;
    if (collides(ly)) ly = py(point.y) - r - 21;
    placed.push({ cx, y: ly, halfWidth });

    ctx.svg.appendChild(
      el(
        'text',
        { x: cx, y: ly, 'text-anchor': 'middle', fill: 'var(--text-secondary)', 'font-size': 11 },
        point.label,
      ),
    );
  });
}

/* --- Sparkline (i tabellrader) --------------------------------------- */

export function sparkline(values, { width = 76, height = 20, color = 'var(--series-1)' } = {}) {
  const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, width, height, 'aria-hidden': 'true' });
  const clean = values.map((v) => (Number.isFinite(v) ? v : 0));
  const max = Math.max(1, ...clean);
  const step = clean.length > 1 ? width / (clean.length - 1) : width;
  const d = clean.map((v, i) => `${i ? 'L' : 'M'}${i * step},${height - (v / max) * (height - 3) - 1.5}`).join(' ');
  svg.appendChild(el('path', { d, fill: 'none', stroke: color, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }));
  return svg;
}

function empty(container, text) {
  const p = document.createElement('p');
  p.className = 'empty';
  p.textContent = text || 'Ingen data i perioden.';
  container.appendChild(p);
  return p;
}

export { css };
