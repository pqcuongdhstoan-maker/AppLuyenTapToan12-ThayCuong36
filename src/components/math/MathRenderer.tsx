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
          try {
            const isArrayTable = rawMath.includes('\\begin{array}');
            const mathHtml = katex.renderToString(rawMath, {
              displayMode: true,
              throwOnError: false,
              strict: false,
              trust: true,
              output: 'html'
            });

            if (isArrayTable) {
              return `<div class="my-3 overflow-x-auto p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 shadow-2xs text-center">${mathHtml}</div>`;
            }
            return `<div class="my-2 overflow-x-auto py-1 text-center">${mathHtml}</div>`;
          } catch {
            return `<div class="katex-error text-rose-500 font-mono text-xs my-1 p-2 bg-rose-50 rounded-lg">[Lỗi công thức: ${escapeHtml(rawMath)}]</div>`;
          }
        }

        // 3. Inline math: $...$
        if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
          const rawMath = part.slice(1, -1).trim();
          try {
            return katex.renderToString(rawMath, {
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

        // 4. Plain text: preserve line breaks and escape HTML
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
