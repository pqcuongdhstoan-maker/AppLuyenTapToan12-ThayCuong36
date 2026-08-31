import React, { useState } from 'react';
import { MathRenderer } from './MathRenderer';
import { Eye, Code2, HelpCircle, Copy, Check } from 'lucide-react';

interface MathEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  showPreview?: boolean;
}

export const MathEditor: React.FC<MathEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung hoặc công thức toán (ví dụ: Cho hàm số $y = \\frac{2x+1}{x-1}$)...',
  rows = 4,
  label,
  showPreview = true
}) => {
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('split');
  const [copied, setCopied] = useState(false);

  const mathSnippets = [
    { label: 'Phân số', snippet: '\\frac{a}{b}', preview: '\\frac{a}{b}' },
    { label: 'Số mũ', snippet: 'x^{2}', preview: 'x^{2}' },
    { label: 'Chỉ số', snippet: 'x_{1}', preview: 'x_{1}' },
    { label: 'Căn bậc hai', snippet: '\\sqrt{x}', preview: '\\sqrt{x}' },
    { label: 'Căn bậc n', snippet: '\\sqrt[n]{x}', preview: '\\sqrt[n]{x}' },
    { label: 'Đạo hàm', snippet: 'f\'(x)', preview: 'f\'(x)' },
    { label: 'Nguyên hàm', snippet: '\\int f(x)\\,dx', preview: '\\int f(x)dx' },
    { label: 'Tích phân', snippet: '\\int_{a}^{b} f(x)\\,dx', preview: '\\int_{a}^{b}' },
    { label: 'Giới hạn', snippet: '\\lim_{x \\to x_0} f(x)', preview: '\\lim_{x \\to x_0}' },
    { label: 'Vectơ', snippet: '\\vec{u} = (x; y; z)', preview: '\\vec{u}' },
    { label: 'Vô cực', snippet: '+\\infty', preview: '+\\infty' },
    { label: 'Tọa độ', snippet: 'A(x_0; y_0; z_0)', preview: 'A(x; y; z)' },
    { label: 'Hệ phương trình', snippet: '\\begin{cases} x + y = 1 \\\\ 2x - y = 3 \\end{cases}', preview: '\\begin{cases}' },
    { label: 'Thuộc / Không thuộc', snippet: 'x \\in \\mathbb{R}', preview: 'x \\in \\mathbb{R}' },
    { label: 'Tương đương', snippet: '\\Leftrightarrow', preview: '\\Leftrightarrow' },
    { label: 'Suy ra', snippet: '\\Rightarrow', preview: '\\Rightarrow' },
    { label: 'Khoảng', snippet: '(a; b)', preview: '(a; b)' },
    { label: 'Đoạn', snippet: '[a; b]', preview: '[a; b]' },
    { label: 'Góc', snippet: '\\widehat{ABC}', preview: '\\widehat{A}' },
    { label: 'Tổ hợp', snippet: 'C_n^k', preview: 'C_n^k' },
    { label: 'Xác suất P(A)', snippet: 'P(A|B) = \\frac{P(AB)}{P(B)}', preview: 'P(A|B)' }
  ];

  const handleInsert = (snippet: string) => {
    // Wrap in $...$ if not already surrounded
    const textToInsert = snippet.includes('\\begin') ? `\n$$\n${snippet}\n$$\n` : `$${snippet}$`;
    onChange(value ? `${value} ${textToInsert}` : textToInsert);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header toolbar */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        {label && <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{label}</span>}
        
        <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'write' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Soạn thảo
          </button>
          {showPreview && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-2.5 py-1 rounded-md transition-all hidden sm:flex items-center gap-1.5 ${
                  activeTab === 'split' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Song song
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeTab === 'preview' ? 'bg-white text-indigo-700 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Xem trước
              </button>
            </>
          )}
        </div>

        {value && (
          <button
            type="button"
            onClick={handleCopy}
            className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition-colors"
            title="Sao chép nội dung"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Đã chép' : 'Sao chép'}
          </button>
        )}
      </div>

      {/* Math Quick-Insert Toolbar */}
      <div className="px-3 py-2 bg-slate-100/70 border-b border-slate-200/80 overflow-x-auto flex items-center gap-1.5 scrollbar-thin">
        <span className="text-[11px] text-slate-500 font-medium whitespace-nowrap mr-1 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> Chèn ký hiệu:
        </span>
        {mathSnippets.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleInsert(item.snippet)}
            className="px-2 py-1 text-xs bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 rounded-md transition-all whitespace-nowrap shadow-2xs font-mono"
            title={`Chèn ${item.label}: ${item.snippet}`}
          >
            <MathRenderer content={`$${item.preview}$`} inline />
          </button>
        ))}
      </div>

      {/* Editor & Preview Area */}
      <div className={`grid ${activeTab === 'split' ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200' : 'grid-cols-1'}`}>
        {(activeTab === 'write' || activeTab === 'split') && (
          <div className="p-3">
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              className="w-full text-sm font-mono text-slate-800 focus:outline-hidden resize-y placeholder:text-slate-400 bg-transparent leading-relaxed"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
              <span>Hỗ trợ công thức MathType trực quan &amp; ký hiệu toán học</span>
              <span>{value.length} ký tự</span>
            </div>
          </div>
        )}

        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className="p-3 bg-slate-50/50 min-h-[100px] overflow-y-auto max-h-[350px]">
            <div className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Kết quả hiển thị:
            </div>
            {value.trim() ? (
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-800 text-sm">
                <MathRenderer content={value} />
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic p-3 text-center">
                Chưa có nội dung xem trước
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MathEditor;
