import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
  inline?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '', inline = false }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // If whole content is just pure latex (starts with $$ or \)
    try {
      // Split string by math delimiters ($$...$$ or $...$)
      // Regex matches $$...$$ or $...$
      const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
      const parts = content.split(regex);

      const htmlChunks = parts.map((part) => {
        if (!part) return '';

        // Block math: $$...$$
        if (part.startsWith('$$') && part.endsWith('$$') && part.length >= 4) {
          const rawMath = part.slice(2, -2).trim();
          try {
            return katex.renderToString(rawMath, {
              displayMode: true,
              throwOnError: false,
              output: 'html'
            });
          } catch {
            return `<div class="katex-error text-red-500 font-mono text-sm">[Lỗi công thức: ${escapeHtml(rawMath)}]</div>`;
          }
        }

        // Inline math: $...$
        if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
          const rawMath = part.slice(1, -1).trim();
          try {
            return katex.renderToString(rawMath, {
              displayMode: false,
              throwOnError: false,
              output: 'html'
            });
          } catch {
            return `<span class="katex-error text-red-500 font-mono text-xs">[${escapeHtml(rawMath)}]</span>`;
          }
        }

        // Plain text: escape HTML and preserve line breaks
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
