import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
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

  // 7. Auto-detect isolated LaTeX commands missing $ delimiters
  text = text.replace(/(?<!\$)(?:\\frac\{[^{}]+\}\{[^{}]+\}|\\sqrt(?:\[[^\]]+\])?\{[^{}]+\}|\\int_[^{}]+\^[^{}]+\s*\{[^{}]+\}|\\lim_\{[^{}]+\}\s*\{?[^{}]*\}?|\\vec\{[^{}]+\})(?!\$)/g, (match) => {
    return `$${match}$`;
  });

  return text;
}

/**
 * Generates delicate, long SVG vector arrows for variation tables
 */
function createSvgArrow(type: 'up' | 'down' | 'right'): string {
  if (type === 'up') {
    return `<div class="w-full flex items-center justify-center min-w-[3.5rem] sm:min-w-[4.5rem] py-1">
      <svg viewBox="0 0 80 32" class="w-full max-w-[90px] h-6 sm:h-7 stroke-slate-800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="6" y1="26" x2="72" y2="6" stroke-width="1.2" stroke-linecap="round" />
        <polyline points="60,6 72,6 72,18" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>`;
  }
  if (type === 'down') {
    return `<div class="w-full flex items-center justify-center min-w-[3.5rem] sm:min-w-[4.5rem] py-1">
      <svg viewBox="0 0 80 32" class="w-full max-w-[90px] h-6 sm:h-7 stroke-slate-800" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="6" y1="6" x2="72" y2="26" stroke-width="1.2" stroke-linecap="round" />
        <polyline points="60,26 72,26 72,14" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>`;
  }
  return `<div class="w-full flex items-center justify-center min-w-[3.5rem] sm:min-w-[4.5rem] py-1">
    <svg viewBox="0 0 80 20" class="w-full max-w-[90px] h-4 stroke-slate-800" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="6" y1="10" x2="72" y2="10" stroke-width="1.2" stroke-linecap="round" />
      <polyline points="62,4 72,10 62,16" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>`;
}

/**
 * Converts LaTeX array/tabular and variation tables into crisp, textbook-grade HTML tables
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

  // Calculate max columns
  const maxCols = Math.max(...parsedRows.map(r => r.length));

  // Determine if row 2 (f(x)) has a sub-row for bottom values/arrows
  const hasSubRowForF = parsedRows.length >= 4 && parsedRows[3] && !parsedRows[3][0];

  // Build beautiful, textbook-style HTML table
  let html = `<div class="my-4 overflow-x-auto flex justify-center">
    <table class="border-collapse border border-slate-400 bg-white text-xs sm:text-sm font-sans shadow-xs rounded-xl overflow-hidden my-2 border-spacing-0">
      <tbody>`;

  parsedRows.forEach((row, rowIdx) => {
    // Pad row with empty cells if shorter than maxCols
    while (row.length < maxCols) {
      row.push('');
    }

    const isFirstRow = rowIdx === 0;
    const isSecondRow = rowIdx === 1;
    const isThirdRow = rowIdx === 2;
    const isFourthRow = rowIdx === 3;

    const hasBottomBorder = isFirstRow || isSecondRow || (hasSubRowForF ? isFourthRow : rowIdx === parsedRows.length - 1);

    html += `<tr class="${hasBottomBorder ? 'border-b border-slate-400' : ''}">`;

    row.forEach((cell, colIdx) => {
      const isHeaderCol = colIdx === 0;
      let cellContent = cell.trim();

      // If this is sub-row 4 and row 3 already spanned column 0, skip header cell
      if (hasSubRowForF && isFourthRow && isHeaderCol) {
        return;
      }

      // Convert arrows to thin, long SVG vector paths
      if (cellContent.includes('\\nearrow') || cellContent === '↗' || cellContent.includes('nearrow')) {
        cellContent = createSvgArrow('up');
      } else if (cellContent.includes('\\searrow') || cellContent === '↘' || cellContent.includes('searrow')) {
        cellContent = createSvgArrow('down');
      } else if (cellContent.includes('\\rightarrow') || cellContent === '→' || cellContent.includes('rightarrow')) {
        cellContent = createSvgArrow('right');
      } else if (cellContent === '||' || cellContent === '\\|\\|' || cellContent === '|') {
        cellContent = '<span class="text-slate-400 font-bold tracking-tighter text-sm">||</span>';
      } else if (cellContent === '+' || cellContent === '$+$') {
        cellContent = '<span class="text-blue-600 font-bold text-sm sm:text-base">+</span>';
      } else if (cellContent === '-' || cellContent === '$-$' || cellContent === '−') {
        cellContent = '<span class="text-rose-600 font-bold text-sm sm:text-base">−</span>';
      } else if (cellContent === '0' || cellContent === '$0$') {
        cellContent = '<span class="text-slate-800 font-bold">0</span>';
      } else if (cellContent) {
        // Render math for numbers, variables, expressions
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
        const rowSpanAttr = hasSubRowForF && isThirdRow ? 'rowspan="2"' : '';
        html += `<td ${rowSpanAttr} class="border-r border-slate-400 bg-slate-50 font-bold text-slate-800 px-3.5 sm:px-5 py-2.5 text-center whitespace-nowrap align-middle">${cellContent}</td>`;
      } else {
        const isArrowCell = cellContent.includes('<svg');
        html += `<td class="px-2 sm:px-3 py-1.5 text-center text-slate-800 font-medium ${isArrowCell ? 'min-w-[4rem] sm:min-w-[5rem]' : 'min-w-[2.2rem] sm:min-w-[2.8rem]'} align-middle">${cellContent}</td>`;
      }
    });

    html += '</tr>';
  });

  html += '</tbody></table></div>';
  return html;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', inline = false }) => {
  const renderedHtml = useMemo(() => {
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
  }, [content]);

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
