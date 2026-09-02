import React, { useState, useRef, useEffect } from 'react';
import { MathRenderer } from './MathRenderer';
import {
  Eye,
  Code2,
  HelpCircle,
  Copy,
  Check,
  Undo2,
  Redo2,
  Sparkles,
  Layers,
  AlertTriangle,
  Grid,
  Maximize2,
  Sigma
} from 'lucide-react';
import { validateMathSyntax } from '../../services/mathSyntaxValidator';
import { VisualMathEditorModal } from './VisualMathEditorModal';

interface MathEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  showPreview?: boolean;
  inline?: boolean;
}

type ToolbarCategory =
  | 'fraction_root'
  | 'power_sub'
  | 'brackets_abs'
  | 'calculus'
  | 'trig_log'
  | 'vectors_geometry'
  | 'matrix_cases'
  | 'sets_logic'
  | 'greek';

export const MathEditor: React.FC<MathEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung hoặc công thức toán (ví dụ: Cho hàm số $y = \\frac{2x+1}{x-1}$)...',
  rows = 4,
  label,
  showPreview = true,
  inline = false
}) => {
  const [mode, setMode] = useState<'visual' | 'latex'>('visual');
  const [activeTab, setActiveTab] = useState<'write' | 'preview' | 'split'>('split');
  const [activeCategory, setActiveCategory] = useState<ToolbarCategory>('fraction_root');
  const [copied, setCopied] = useState(false);
  const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);

  // Undo / Redo history
  const [history, setHistory] = useState<string[]>([value || '']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const updateWithHistory = (newVal: string) => {
    onChange(newVal);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newVal);
    if (newHistory.length > 30) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChange(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChange(next);
    }
  };

  // Syntax validation
  const validation = validateMathSyntax(value);

  // Grouped toolbars
  const TOOLBAR_GROUPS: {
    id: ToolbarCategory;
    name: string;
    items: { label: string; snippet: string; preview: string; cursorOffset?: number }[];
  }[] = [
    {
      id: 'fraction_root',
      name: 'Phân số & Căn',
      items: [
        { label: 'Phân số', snippet: '\\dfrac{a}{b}', preview: '\\dfrac{a}{b}', cursorOffset: 7 },
        { label: 'Phân số lồng', snippet: '\\dfrac{\\dfrac{a}{b}}{\\dfrac{c}{d}}', preview: '\\dfrac{\\frac{a}{b}}{\\frac{c}{d}}' },
        { label: 'Căn bậc 2', snippet: '\\sqrt{x}', preview: '\\sqrt{x}', cursorOffset: 6 },
        { label: 'Căn bậc n', snippet: '\\sqrt[n]{x}', preview: '\\sqrt[n]{x}', cursorOffset: 6 },
        { label: 'Căn lồng căn', snippet: '\\sqrt{x + \\sqrt{y}}', preview: '\\sqrt{x+\\sqrt{y}}' }
      ]
    },
    {
      id: 'power_sub',
      name: 'Mũ & Chỉ số',
      items: [
        { label: 'Số mũ', snippet: 'x^{2}', preview: 'x^{2}', cursorOffset: 3 },
        { label: 'Chỉ số dưới', snippet: 'x_{1}', preview: 'x_{1}', cursorOffset: 3 },
        { label: 'Mũ và chỉ số', snippet: 'x_{0}^{2}', preview: 'x_{0}^{2}', cursorOffset: 3 },
        { label: 'Hàm mũ e', snippet: 'e^{2x}', preview: 'e^{2x}', cursorOffset: 3 }
      ]
    },
    {
      id: 'brackets_abs',
      name: 'Ngoặc & Khoảng',
      items: [
        { label: 'Giá trị tuyệt đối', snippet: '|x|', preview: '|x|', cursorOffset: 1 },
        { label: 'Độ dài chuẩn', snippet: '\\|\\vec{u}\\|', preview: '\\|\\vec{u}\\|' },
        { label: 'Khoảng mở', snippet: '(a; b)', preview: '(a; b)' },
        { label: 'Đoạn đóng', snippet: '[a; b]', preview: '[a; b]' },
        { label: 'Nửa khoảng', snippet: '[a; b)', preview: '[a; b)' },
        { label: 'Tập hợp phần tử', snippet: '\\{x_1; x_2\\}', preview: '\\{x_1; x_2\\}' }
      ]
    },
    {
      id: 'calculus',
      name: 'Giải tích & Giới hạn',
      items: [
        { label: 'Giới hạn x -> x0', snippet: '\\lim_{x \\to x_0}{f(x)}', preview: '\\lim_{x \\to x_0}' },
        { label: 'Giới hạn vô cực', snippet: '\\lim_{x \\to +\\infty}{f(x)}', preview: '\\lim_{x \\to +\\infty}' },
        { label: 'Đạo hàm f\'(x)', snippet: 'f\'(x)', preview: "f'(x)" },
        { label: 'Đạo hàm cấp 2', snippet: 'f\'\'(x)', preview: "f''(x)" },
        { label: 'Nguyên hàm', snippet: '\\int f(x)\\,dx', preview: '\\int f(x)dx' },
        { label: 'Tích phân có cận', snippet: '\\int_{a}^{b} f(x)\\,dx', preview: '\\int_{a}^{b}f(x)dx' },
        { label: 'Tổng Sigma', snippet: '\\sum_{i=1}^{n}{a_i}', preview: '\\sum_{i=1}^{n}' },
        { label: 'Tích Pi', snippet: '\\prod_{i=1}^{n}{a_i}', preview: '\\prod_{i=1}^{n}' }
      ]
    },
    {
      id: 'trig_log',
      name: 'Lượng giác & Log',
      items: [
        { label: 'Sin', snippet: '\\sin(x)', preview: '\\sin(x)' },
        { label: 'Cos', snippet: '\\cos(x)', preview: '\\cos(x)' },
        { label: 'Tan', snippet: '\\tan(x)', preview: '\\tan(x)' },
        { label: 'Cot', snippet: '\\cot(x)', preview: '\\cot(x)' },
        { label: 'Logarit cơ số a', snippet: '\\log_{a}{b}', preview: '\\log_{a}{b}' },
        { label: 'Logarit tự nhiên ln', snippet: '\\ln(x)', preview: '\\ln(x)' }
      ]
    },
    {
      id: 'vectors_geometry',
      name: 'Hình học & Vectơ',
      items: [
        { label: 'Vectơ ngắn', snippet: '\\vec{u}', preview: '\\vec{u}' },
        { label: 'Vectơ AB', snippet: '\\overrightarrow{AB}', preview: '\\overrightarrow{AB}' },
        { label: 'Tọa độ Oxyz', snippet: 'M(x_0; y_0; z_0)', preview: 'M(x; y; z)' },
        { label: 'Tích vô hướng', snippet: '\\vec{u} \\cdot \\vec{v}', preview: '\\vec{u} \\cdot \\vec{v}' },
        { label: 'Góc', snippet: '\\widehat{ABC}', preview: '\\widehat{ABC}' },
        { label: 'Vuông góc', snippet: '\\perp', preview: '\\perp' },
        { label: 'Song song', snippet: '\\parallel', preview: '\\parallel' },
        { label: 'Tam giác Delta', snippet: '\\Delta ABC', preview: '\\Delta' }
      ]
    },
    {
      id: 'matrix_cases',
      name: 'Hệ & Ma trận',
      items: [
        { label: 'Hệ phương trình 2 ẩn', snippet: '\\begin{cases} ax + by = c \\\\ dx + ey = f \\end{cases}', preview: '\\begin{cases}' },
        { label: 'Hàm từng đoạn', snippet: 'f(x) = \\begin{cases} x^2 & \\text{khi } x \\ge 0 \\\\ -x & \\text{khi } x < 0 \\end{cases}', preview: 'f(x)=\\begin{cases}' },
        { label: 'Ma trận 2x2', snippet: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', preview: '\\begin{pmatrix}' },
        { label: 'Định thức 2x2', snippet: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', preview: '\\begin{vmatrix}' },
        { label: 'Chuỗi biến đổi aligned', snippet: '\\begin{aligned} A &= (x+1)^2 \\\\ &= x^2 + 2x + 1 \\end{aligned}', preview: '\\begin{aligned}' }
      ]
    },
    {
      id: 'sets_logic',
      name: 'Tập hợp & Logic',
      items: [
        { label: 'Tập số thực R', snippet: '\\mathbb{R}', preview: '\\mathbb{R}' },
        { label: 'Tập số nguyên Z', snippet: '\\mathbb{Z}', preview: '\\mathbb{Z}' },
        { label: 'Tập tự nhiên N', snippet: '\\mathbb{N}', preview: '\\mathbb{N}' },
        { label: 'Thuộc', snippet: '\\in', preview: '\\in' },
        { label: 'Không thuộc', snippet: '\\notin', preview: '\\notin' },
        { label: 'Tập con', snippet: '\\subset', preview: '\\subset' },
        { label: 'Hợp', snippet: '\\cup', preview: '\\cup' },
        { label: 'Giao', snippet: '\\cap', preview: '\\cap' },
        { label: 'Hiệu tập hợp', snippet: '\\setminus', preview: '\\setminus' },
        { label: 'Tương đương', snippet: '\\Leftrightarrow', preview: '\\Leftrightarrow' },
        { label: 'Suy ra', snippet: '\\Rightarrow', preview: '\\Rightarrow' },
        { label: 'Vô cực', snippet: '+\\infty', preview: '+\\infty' },
        { label: 'Âm vô cực', snippet: '-\\infty', preview: '-\\infty' },
        { label: 'Xác suất P(A|B)', snippet: 'P(A|B)', preview: 'P(A|B)' },
        { label: 'Tổ hợp C_n^k', snippet: 'C_n^k', preview: 'C_n^k' },
        { label: 'Chỉnh hợp A_n^k', snippet: 'A_n^k', preview: 'A_n^k' }
      ]
    },
    {
      id: 'greek',
      name: 'Ký tự Hy Lạp',
      items: [
        { label: 'Alpha', snippet: '\\alpha', preview: '\\alpha' },
        { label: 'Beta', snippet: '\\beta', preview: '\\beta' },
        { label: 'Gamma', snippet: '\\gamma', preview: '\\gamma' },
        { label: 'Delta', snippet: '\\Delta', preview: '\\Delta' },
        { label: 'Theta', snippet: '\\theta', preview: '\\theta' },
        { label: 'Lambda', snippet: '\\lambda', preview: '\\lambda' },
        { label: 'Pi', snippet: '\\pi', preview: '\\pi' },
        { label: 'Omega', snippet: '\\omega', preview: '\\omega' },
        { label: 'Phi', snippet: '\\varphi', preview: '\\varphi' },
        { label: 'Sigma', snippet: '\\sigma', preview: '\\sigma' }
      ]
    }
  ];

  const handleInsertSnippet = (snippet: string, offset?: number) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      const isBlock = snippet.includes('\\begin') || snippet.includes('\\dfrac{\\dfrac');
      const textToInsert = isBlock ? `\n$$\n${snippet}\n$$\n` : `$${snippet}$`;
      updateWithHistory(value ? `${value} ${textToInsert}` : textToInsert);
      return;
    }

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const isBlock = snippet.includes('\\begin') || snippet.includes('\\dfrac{\\dfrac');

    const textBefore = value.substring(0, startPos);
    const textAfter = value.substring(endPos);
    const dollarCountBefore = (textBefore.match(/\$/g) || []).length;
    const isInsideMath = dollarCountBefore % 2 === 1;

    let insertion = snippet;
    if (!isInsideMath) {
      insertion = isBlock ? `\n$$\n${snippet}\n$$\n` : `$${snippet}$`;
    }

    const newValue = textBefore + insertion + textAfter;
    updateWithHistory(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + (offset ? offset + (isInsideMath ? 0 : 1) : insertion.length);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const handleInsertFromVisualModal = (latex: string, isDisplay: boolean) => {
    const textarea = textareaRef.current;
    const token = isDisplay ? `\n$$\n${latex}\n$$\n` : `$${latex}$`;

    if (!textarea) {
      updateWithHistory(value ? `${value} ${token}` : token);
      return;
    }

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const textBefore = value.substring(0, startPos);
    const textAfter = value.substring(endPos);
    const newValue = textBefore + token + textAfter;
    updateWithHistory(newValue);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + token.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 20);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Header Toolbar */}
      <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {label && <span className="text-xs font-black text-slate-800 uppercase tracking-wider">{label}</span>}

          {/* Prominent "∑ Chèn công thức" button */}
          <button
            type="button"
            onClick={() => setIsVisualModalOpen(true)}
            className="px-3 py-1.5 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            title="Mở bảng soạn thảo công thức Toán học trực quan MathLive"
          >
            <Sigma className="w-4 h-4 text-teal-600 font-bold" />
            <span className="font-bold text-xs text-slate-800">Chèn công thức</span>
          </button>

          <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('visual')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                mode === 'visual' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Thanh phím</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('latex')}
              className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                mode === 'latex' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Mã LaTeX</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
              title="Hoàn tác (Undo)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
              title="Làm lại (Redo)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Tab Selector */}
          {showPreview && (
            <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('write')}
                className={`px-2 py-1 rounded-md transition-all ${
                  activeTab === 'write' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nhập
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-2 py-1 rounded-md transition-all hidden sm:inline-block ${
                  activeTab === 'split' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Song song
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2 py-1 rounded-md transition-all ${
                  activeTab === 'preview' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Xem trước
              </button>
            </div>
          )}

          {value && (
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors font-medium"
              title="Sao chép nội dung"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép' : 'Chép'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Visual Mode Group Tabs */}
      {mode === 'visual' && (
        <div className="bg-slate-100/70 border-b border-slate-200 text-xs">
          <div className="flex items-center gap-1 px-3 pt-2 overflow-x-auto scrollbar-thin">
            {TOOLBAR_GROUPS.map((grp) => (
              <button
                key={grp.id}
                type="button"
                onClick={() => setActiveCategory(grp.id)}
                className={`px-3 py-1.5 rounded-t-xl font-bold whitespace-nowrap transition-all text-[11px] ${
                  activeCategory === grp.id
                    ? 'bg-white text-indigo-700 border-t border-x border-slate-200 -mb-px'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {grp.name}
              </button>
            ))}
          </div>

          {/* Sub-toolbar with formula buttons */}
          <div className="p-2.5 bg-white border-t border-slate-200 overflow-x-auto flex items-center gap-2 scrollbar-thin">
            {TOOLBAR_GROUPS.find(g => g.id === activeCategory)?.items.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleInsertSnippet(item.snippet, item.cursorOffset)}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 border border-slate-200 rounded-xl transition-all whitespace-nowrap text-xs font-mono shadow-2xs flex items-center justify-center shrink-0 cursor-pointer"
                title={`Chèn ${item.label}: ${item.snippet}`}
              >
                <MathRenderer content={`$${item.preview}$`} inline />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Syntax Error Warning Banner */}
      {!validation.isValid && validation.errors.length > 0 && (
        <div className="px-3 py-1.5 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{validation.errors.join(' ')}</span>
        </div>
      )}

      {/* Editor & Preview Workspace */}
      <div className={`grid ${activeTab === 'split' ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200' : 'grid-cols-1'}`}>
        {(activeTab === 'write' || activeTab === 'split') && (
          <div className="p-3">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => updateWithHistory(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              className="w-full text-sm font-sans text-slate-800 focus:outline-none resize-y placeholder:text-slate-400 bg-transparent leading-relaxed"
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Bọc công thức trong <code>$...$</code> hoặc <code>$$...$$</code></span>
              <span>{value.length} ký tự</span>
            </div>
          </div>
        )}

        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className="p-3 bg-slate-50/60 min-h-[100px] overflow-y-auto max-h-[360px]">
            <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
              <Eye className="w-3 h-3 text-blue-600" /> Xem trước thời gian thực (MathJax):
            </div>
            {value.trim() ? (
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-900 text-sm leading-relaxed shadow-2xs">
                <MathRenderer content={value} allowZoom />
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic p-4 text-center">
                Chưa có nội dung xem trước
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Visual MathLive Modal */}
      <VisualMathEditorModal
        isOpen={isVisualModalOpen}
        onClose={() => setIsVisualModalOpen(false)}
        onInsert={handleInsertFromVisualModal}
      />
    </div>
  );
};

export default MathEditor;
