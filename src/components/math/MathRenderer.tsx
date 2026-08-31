import React, { useMemo } from 'react';
import katex from 'katex';
import { ContentBlock } from '../../types';

interface MathRendererProps {
  content?: string;
  blocks?: ContentBlock[];
  className?: string;
  inline?: boolean;
}

/**
 * Preprocesses raw text containing LaTeX, MathType, variation tables, and Word exports
 */
export function preprocessMathContent(rawText: string): string {
  if (!rawText) return '';
  let text = rawText;

  // 1. Strip \begin{center} and \end{center}
  text = text.replace(/\\begin\{center\}/gi, '');
  text = text.replace(/\\end\{center\}/gi, '');

  // 2. Convert \begin{tabular}... into \begin{array}... and wrap in $$...$$
  text = text.replace(/\\begin\{tabular\}(\[[^\]]*\])?(\{[^\}]*\})([\s\S]*?)\\end\{tabular\}/gi, (_match, _opt, cols, body) => {
    let cleanCols = cols ? cols.trim() : '{|c|c|c|c|c|c|}';
    cleanCols = cleanCols.replace(/c/g, 'c|').replace(/\|+/g, '|');
    if (!cleanCols.startsWith('{')) cleanCols = '{' + cleanCols;
    if (!cleanCols.endsWith('}')) cleanCols = cleanCols + '}';
    
    const cleanBody = body
      .replace(/\\hline/g, ' \\hline ')
      .replace(/\\nearrow/g, ' \\nearrow ')
      .replace(/\\searrow/g, ' \\searrow ')
      .replace(/\\rightarrow/g, ' \\rightarrow ')
      .trim();

    return `\n$$\n\\begin{array}${cleanCols}\n${cleanBody}\n\\end{array}\n$$\n`;
  });

  // 3. Ensure standalone \begin{array}... is enclosed in $$...$$
  text = text.replace(/(?<!\$\$[\s\S]*?)(\\begin\{array\}[\s\S]*?\\end\{array\})(?![\s\S]*?\$\$)/gi, (_match, arrayBody) => {
    return `\n$$\n${arrayBody}\n$$\n`;
  });

  // 4. Convert display math \[ ... \] into $$ ... $$
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, '\n$$\n$1\n$$\n');

  // 5. Convert inline math \( ... \) into $ ... $
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // 6. Convert Unicode superscripts/subscripts
  text = text
    .replace(/([a-zA-Z0-9\)])²/g, '$1^2')
    .replace(/([a-zA-Z0-9\)])³/g, '$1^3')
    .replace(/([a-zA-Z0-9\)])⁴/g, '$1^4')
    .replace(/([a-zA-Z0-9\)])⁵/g, '$1^5')
    .replace(/([a-zA-Z0-9\)])⁻¹/g, '$1^{-1}')
    .replace(/([a-zA-Z0-9\)])ⁿ/g, '$1^n')
    .replace(/([a-zA-Z])₀/g, '$1_0')
    .replace(/([a-zA-Z])₁/g, '$1_1')
    .replace(/([a-zA-Z])₂/g, '$1_2')
    .replace(/([a-zA-Z])₃/g, '$1_3');

  // 7. Upgrade all \frac to \dfrac (display fraction) for balanced spacing and exponent scaling
  text = text.replace(/\\frac(?=\{)/g, '\\dfrac');

  // 8. Auto-detect isolated LaTeX commands missing $ delimiters
  text = text.replace(/(?<!\$)(?:\\dfrac\{[^{}]+\}\{[^{}]+\}|\\sqrt(?:\[[^\]]+\])?\{[^{}]+\}|\\int_[^{}]+\^[^{}]+\s*\{[^{}]+\}|\\lim_\{[^{}]+\}\s*\{?[^{}]*\}?|\\vec\{[^{}]+\})(?!\$)/g, (match) => {
    return `$${match}$`;
  });

  return text;
}

let arrowIdCounter = 0;

/**
 * Generates bold, long, perfectly symmetrical LaTeX stealth vector arrows for variation tables
 */
function createSvgArrow(type: 'up' | 'down' | 'right'): string {
  const markerId = `stealth_arr_${++arrowIdCounter}`;

  if (type === 'up') {
    return `<div class="w-full flex items-center justify-center min-w-[6rem] sm:min-w-[8.5rem] py-1 px-1">
      <svg viewBox="0 0 140 38" class="w-full max-w-[150px] h-7 sm:h-8 overflow-visible">
        <defs>
          <marker id="${markerId}" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8.5 5 L 0 8.5 L 2 5 Z" fill="#0f172a" />
          </marker>
        </defs>
        <line x1="4" y1="30" x2="132" y2="8" stroke="#0f172a" stroke-width="1.6" stroke-linecap="round" marker-end="url(#${markerId})" />
      </svg>
    </div>`;
  }
  if (type === 'down') {
    return `<div class="w-full flex items-center justify-center min-w-[6rem] sm:min-w-[8.5rem] py-1 px-1">
      <svg viewBox="0 0 140 38" class="w-full max-w-[150px] h-7 sm:h-8 overflow-visible">
        <defs>
          <marker id="${markerId}" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8.5 5 L 0 8.5 L 2 5 Z" fill="#0f172a" />
          </marker>
        </defs>
        <line x1="4" y1="8" x2="132" y2="30" stroke="#0f172a" stroke-width="1.6" stroke-linecap="round" marker-end="url(#${markerId})" />
      </svg>
    </div>`;
  }
  return `<div class="w-full flex items-center justify-center min-w-[6rem] sm:min-w-[8.5rem] py-1 px-1">
    <svg viewBox="0 0 140 22" class="w-full max-w-[150px] h-5 overflow-visible">
      <defs>
        <marker id="${markerId}" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8.5 5 L 0 8.5 L 2 5 Z" fill="#0f172a" />
        </marker>
      </defs>
      <line x1="4" y1="11" x2="132" y2="11" stroke="#0f172a" stroke-width="1.6" stroke-linecap="round" marker-end="url(#${markerId})" />
    </svg>
  </div>`;
}

/**
 * Formats math symbols into clean Unicode text for SVG rendering
 */
function formatMathForSvg(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\$/g, '')
    .replace(/\\infty/g, '∞')
    .replace(/\\minus|\\textminus|−/g, '−')
    .replace(/-\\infty/g, '−∞')
    .replace(/\+\\infty/g, '+∞')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
    .replace(/\\nearrow|\\searrow|\\rightarrow/g, '')
    .trim();
}

/**
 * Converts variation table into a high-precision vector SVG diagram
 * where arrows start EXACTLY at the source number and point EXACTLY at the destination number.
 */
export function renderVariationTableSvg(parsedRows: string[][]): string {
  if (parsedRows.length < 3) return '';

  const maxCols = Math.max(...parsedRows.map(r => r.length));
  if (maxCols < 3) return '';

  // Extract labels
  let xLabel = formatMathForSvg(parsedRows[0][0]) || 'x';
  let fPrimeLabel = formatMathForSvg(parsedRows[1][0]) || "f '(x)";
  let fLabel = formatMathForSvg(parsedRows[2][0]) || 'f(x)';

  if (fPrimeLabel.includes("'") && !fPrimeLabel.includes('(')) {
    fPrimeLabel = "y'";
  }
  if (fLabel === 'y' || fLabel === 'f') {
    fLabel = fLabel === 'y' ? 'y' : 'f(x)';
  }

  // Calculate layout geometry
  const headerWidth = 65;
  const numDataCols = maxCols - 1;
  const colWidth = Math.max(70, Math.min(100, Math.floor(480 / numDataCols)));
  const totalWidth = headerWidth + numDataCols * colWidth + 20;
  const totalHeight = 175;

  const row1Y = 27; // x row
  const row2Y = 67; // f'(x) row
  const line1Y = 42; // divide under x
  const line2Y = 84; // divide under f'(x)
  const topValY = 110; // f(x) top values
  const botValY = 154; // f(x) bottom values

  // Find column center coordinates
  const colX: number[] = [];
  for (let c = 1; c < maxCols; c++) {
    colX[c] = headerWidth + (c - 0.5) * colWidth;
  }

  // Extract f(x) points and arrows
  // In parsedRows:
  // parsedRows[2] has top values
  // parsedRows[3] (if exists) has bottom values and arrows
  const topRow = parsedRows[2] || [];
  const botRow = parsedRows[3] || [];

  interface VariationNode {
    col: number;
    x: number;
    y: number;
    val: string;
    level: 'top' | 'bottom';
  }

  const nodes: VariationNode[] = [];

  for (let c = 1; c < maxCols; c++) {
    const topCell = formatMathForSvg(topRow[c] || '');
    const botCell = formatMathForSvg(botRow[c] || '');

    if (topCell && !topCell.includes('↗') && !topCell.includes('↘')) {
      nodes.push({
        col: c,
        x: colX[c],
        y: topValY,
        val: topCell,
        level: 'top'
      });
    }
    if (botCell && !botCell.includes('↗') && !botCell.includes('↘')) {
      nodes.push({
        col: c,
        x: colX[c],
        y: botValY,
        val: botCell,
        level: 'bottom'
      });
    }
  }

  // Sort nodes by column index
  nodes.sort((a, b) => a.col - b.col);

  const markerId = `stealth_arr_${++arrowIdCounter}`;

  let svgContent = `<div class="my-6 overflow-x-auto flex justify-center py-2">
    <svg viewBox="0 0 ${totalWidth} ${totalHeight}" class="w-full max-w-2xl select-none font-serif" style="min-width: 320px;" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="${markerId}" viewBox="0 0 10 10" refX="7.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8.5 5 L 0 8.5 L 2 5 Z" fill="#0f172a" />
        </marker>
      </defs>

      <!-- 1 Vertical Dividing Line -->
      <line x1="${headerWidth}" y1="4" x2="${headerWidth}" y2="${totalHeight - 6}" stroke="#334155" stroke-width="1.2" />

      <!-- 2 Horizontal Dividing Lines -->
      <line x1="8" y1="${line1Y}" x2="${totalWidth - 8}" y2="${line1Y}" stroke="#334155" stroke-width="1.2" />
      <line x1="8" y1="${line2Y}" x2="${totalWidth - 8}" y2="${line2Y}" stroke="#334155" stroke-width="1.2" />

      <!-- Header Labels (Left Column) -->
      <text x="${headerWidth / 2}" y="${row1Y}" text-anchor="middle" font-size="16" font-style="italic" fill="#0f172a" font-weight="600">${xLabel}</text>
      <text x="${headerWidth / 2}" y="${row2Y}" text-anchor="middle" font-size="16" font-style="italic" fill="#0f172a" font-weight="600">${fPrimeLabel}</text>
      <text x="${headerWidth / 2}" y="${(line2Y + totalHeight) / 2 + 5}" text-anchor="middle" font-size="16" font-style="italic" fill="#0f172a" font-weight="600">${fLabel}</text>
  `;

  // Row 1: x values
  for (let c = 1; c < maxCols; c++) {
    const val = formatMathForSvg(parsedRows[0][c] || '');
    if (val) {
      svgContent += `<text x="${colX[c]}" y="${row1Y}" text-anchor="middle" font-size="15" fill="#0f172a">${val}</text>`;
    }
  }

  // Row 2: f'(x) signs (+, -, 0, ||)
  for (let c = 1; c < maxCols; c++) {
    const val = formatMathForSvg(parsedRows[1][c] || '');
    if (val === '||' || val === '|') {
      svgContent += `<line x1="${colX[c] - 2}" y1="${line1Y + 4}" x2="${colX[c] - 2}" y2="${line2Y - 4}" stroke="#64748b" stroke-width="1.2" />`;
      svgContent += `<line x1="${colX[c] + 2}" y1="${line1Y + 4}" x2="${colX[c] + 2}" y2="${line2Y - 4}" stroke="#64748b" stroke-width="1.2" />`;
    } else if (val === '+') {
      svgContent += `<text x="${colX[c]}" y="${row2Y}" text-anchor="middle" font-size="16" font-weight="bold" fill="#2563eb">+</text>`;
    } else if (val === '-' || val === '−') {
      svgContent += `<text x="${colX[c]}" y="${row2Y}" text-anchor="middle" font-size="16" font-weight="bold" fill="#e11d48">−</text>`;
    } else if (val) {
      svgContent += `<text x="${colX[c]}" y="${row2Y}" text-anchor="middle" font-size="15" fill="#0f172a">${val}</text>`;
    }
  }

  // Row 3: f(x) nodes (numbers)
  nodes.forEach(node => {
    svgContent += `<text x="${node.x}" y="${node.y}" text-anchor="middle" font-size="16" font-weight="500" fill="#0f172a">${node.val}</text>`;
  });

  // Row 3: Arrows connecting consecutive nodes directly!
  for (let i = 0; i < nodes.length - 1; i++) {
    const n1 = nodes[i];
    const n2 = nodes[i + 1];

    // Estimate text width offset so arrow starts directly from edge of number
    const textOffset1 = Math.max(10, n1.val.length * 5 + 4);
    const textOffset2 = Math.max(10, n2.val.length * 5 + 4);

    let startX = n1.x + textOffset1;
    let endX = n2.x - textOffset2;

    let startY = n1.y - 5;
    let endY = n2.y - 5;

    // Upward arrow: bottom to top
    if (n1.level === 'bottom' && n2.level === 'top') {
      startY = botValY - 6;
      endY = topValY - 2;
    }
    // Downward arrow: top to bottom
    else if (n1.level === 'top' && n2.level === 'bottom') {
      startY = topValY - 2;
      endY = botValY - 6;
    }

    if (endX > startX + 15) {
      svgContent += `<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="#0f172a" stroke-width="1.5" stroke-linecap="round" marker-end="url(#${markerId})" />`;
    }
  }

  svgContent += `</svg></div>`;
  return svgContent;
}

/**
 * Converts LaTeX array/tabular and variation tables into crisp, textbook-grade HTML/SVG tables
 */
export function renderLatexTableToHtml(rawTable: string): string {
  // Strip outer array / tabular / center wrappers
  const content = rawTable
    .replace(/\\begin\{center\}/gi, '')
    .replace(/\\end\{center\}/gi, '')
    .replace(/\\begin\{(?:tabular|array)\}(?:\[[^\]]*\])?(?:\{[^\}]*\})?/gi, '')
    .replace(/\\end\{(?:tabular|array)\}/gi, '')
    .trim();

  // Split into rows by \\
  const rawRows = content.split(/\\\\/g);
  const parsedRows: string[][] = [];

  for (const rawRow of rawRows) {
    const cleanRow = rawRow.replace(/\\hline/g, '').trim();
    if (!cleanRow) continue;

    // Split row into cells by &
    const rawCells = cleanRow.split('&');
    const cells = rawCells.map(c => c.replace(/\$/g, '').trim());
    parsedRows.push(cells);
  }

  if (parsedRows.length === 0) return '';

  // Check if this is a variation table (contains x, f'/y', and arrows or levels)
  const isVariationTable = (
    parsedRows.length >= 3 &&
    (parsedRows[0][0]?.includes('x') || parsedRows[0][0]?.includes('X')) &&
    (rawTable.includes('\\nearrow') || rawTable.includes('\\searrow') || rawTable.includes('↗') || rawTable.includes('↘') || parsedRows.length >= 4)
  );

  if (isVariationTable) {
    const svgTable = renderVariationTableSvg(parsedRows);
    if (svgTable) return svgTable;
  }

  // Fallback to HTML table for other generic mathematical tables / matrices
  const maxCols = Math.max(...parsedRows.map(r => r.length));
  let html = `<div class="my-4 overflow-x-auto flex justify-center py-1">
    <table class="border-collapse border border-slate-400 bg-white text-xs sm:text-sm font-sans shadow-xs rounded-xl overflow-hidden my-2 border-spacing-0">
      <tbody>`;

  parsedRows.forEach((row, rowIdx) => {
    while (row.length < maxCols) {
      row.push('');
    }

    const hasBottomBorder = rowIdx < parsedRows.length - 1;
    html += `<tr class="${hasBottomBorder ? 'border-b border-slate-300' : ''}">`;

    row.forEach((cell, colIdx) => {
      const isHeaderCol = colIdx === 0;
      let cellContent = cell.trim();

      if (cellContent) {
        try {
          cellContent = katex.renderToString(cellContent, {
            displayMode: false,
            throwOnError: false,
            strict: false,
            trust: true,
            output: 'html'
          });
        } catch {
          cellContent = escapeHtml(cellContent);
        }
      }

      if (isHeaderCol) {
        html += `<td class="border-r border-slate-300 bg-slate-50 font-bold text-slate-800 px-3.5 py-2 text-center whitespace-nowrap align-middle">${cellContent}</td>`;
      } else {
        html += `<td class="px-3 py-2 text-center text-slate-800 font-medium align-middle">${cellContent}</td>`;
      }
    });

    html += '</tr>';
  });

  html += '</tbody></table></div>';
  return html;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, blocks, className = '', inline = false }) => {
  const renderedHtml = useMemo(() => {
    // 1. If blocks array is provided, render each block sequentially
    if (blocks && blocks.length > 0) {
      const htmlList = blocks.map((block) => {
        if (block.type === 'text') {
          return escapeHtml(block.value || '').replace(/\n/g, '<br/>');
        }
        if (block.type === 'math') {
          const rawMath = (block.latex || '').trim();
          if (!rawMath) return '';
          if (rawMath.includes('\\begin{array}') || rawMath.includes('\\begin{tabular}') || (rawMath.includes('&') && rawMath.includes('\\\\'))) {
            return renderLatexTableToHtml(rawMath);
          }
          try {
            return katex.renderToString(rawMath.replace(/\$/g, ''), {
              displayMode: false,
              throwOnError: false,
              strict: false,
              trust: true,
              output: 'html'
            });
          } catch {
            return `<span class="katex-error text-rose-500 font-mono text-xs">[Lỗi công thức: ${escapeHtml(rawMath)}]</span>`;
          }
        }
        if (block.type === 'image') {
          return `<div class="my-3 flex flex-col items-center justify-center">
            <img src="${block.url}" alt="${escapeHtml(block.alt || 'Hình minh họa')}" class="max-h-72 object-contain rounded-2xl border border-slate-200 shadow-xs bg-white p-2" />
            <span class="text-[11px] text-slate-500 mt-1.5 font-medium italic">${escapeHtml(block.alt || 'Hình minh họa')}</span>
          </div>`;
        }
        if (block.type === 'warning') {
          return `<div class="my-2 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2 font-medium">
            <span>⚠️ ${escapeHtml(block.warningMessage || 'Cảnh báo đối tượng')}</span>
          </div>`;
        }
        return '';
      });
      return htmlList.join(' ');
    }

    // 2. Fallback to processing content string
    if (!content) return '';

    try {
      const processedText = preprocessMathContent(content);

      // Split text by markdown images: ![alt](url)
      // and math delimiters: $$...$$ or $...$
      const regex = /(!\[[^\]]*\]\([^)]+\)|\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
      const parts = processedText.split(regex);

      const htmlChunks = parts.map((part) => {
        if (!part) return '';

        // 1. Markdown Image: ![alt](url)
        const imgMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (imgMatch) {
          const alt = imgMatch[1] || 'Đồ thị / Hình vẽ minh họa';
          const src = imgMatch[2];
          return `<div class="my-3 flex flex-col items-center justify-center">
            <img src="${src}" alt="${escapeHtml(alt)}" class="max-h-72 object-contain rounded-2xl border border-slate-200 shadow-xs bg-white p-2 hover:scale-[1.02] transition-transform duration-200 cursor-pointer" />
            <span class="text-[11px] text-slate-500 mt-1.5 font-medium italic">${escapeHtml(alt)}</span>
          </div>`;
        }

        // 2. Block math: $$...$$ (including variation tables and matrices)
        if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
          const rawMath = part.slice(2, -2).trim();

          // Check if this block is a variation table or array table
          if (rawMath.includes('\\begin{array}') || rawMath.includes('\\begin{tabular}') || (rawMath.includes('&') && rawMath.includes('\\\\'))) {
            return renderLatexTableToHtml(rawMath);
          }

          try {
            // Strip inner $ if any
            const cleanMath = rawMath.replace(/\$/g, '');
            const mathHtml = katex.renderToString(cleanMath, {
              displayMode: true,
              throwOnError: false,
              strict: false,
              trust: true,
              output: 'html'
            });

            return `<div class="my-2 overflow-x-auto py-1 text-center">${mathHtml}</div>`;
          } catch {
            return `<div class="katex-error text-rose-500 font-mono text-xs my-1 p-2 bg-rose-50 rounded-lg">[Lỗi công thức: ${escapeHtml(rawMath)}]</div>`;
          }
        }

        // 3. Inline math: $...$
        if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
          const rawMath = part.slice(1, -1).trim();
          try {
            const cleanMath = rawMath.replace(/\$/g, '');
            return katex.renderToString(cleanMath, {
              displayMode: false,
              throwOnError: false,
              strict: false,
              trust: true,
              output: 'html'
            });
          } catch {
            return `<span class="katex-error text-rose-500 font-mono text-xs">[${escapeHtml(rawMath)}]</span>`;
          }
        }

        // 4. Plain text: check if plain text has un-delimited tabular or array
        if (part.includes('\\begin{tabular}') || part.includes('\\begin{array}')) {
          return renderLatexTableToHtml(part);
        }

        return escapeHtml(part).replace(/\n/g, '<br/>');
      });

      return htmlChunks.join('');
    } catch {
      return escapeHtml(content);
    }
  }, [content, blocks]);

  if (inline) {
    return (
      <span
        className={`math-content inline ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  return (
    <div
      className={`math-content leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default MathRenderer;
