import React, { useState, useRef, useEffect } from 'react';
import {
  Sigma,
  Eye,
  Code2,
  Copy,
  Check,
  Undo2,
  Redo2,
  Trash2,
  Sparkles
} from 'lucide-react';
import { MathRenderer } from './MathRenderer';
import { VisualMathEditorModal } from './VisualMathEditorModal';

interface RichMathTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
  showPreview?: boolean;
  minHeight?: string;
  className?: string;
}

export const RichMathTextInput: React.FC<RichMathTextInputProps> = ({
  value,
  onChange,
  placeholder = 'Nhập nội dung hoặc nhấn "Chèn công thức"...',
  rows = 3,
  label,
  showPreview = true,
  minHeight = '90px',
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('editor');
  const [copied, setCopied] = useState(false);
  const [editingFormula, setEditingFormula] = useState<{ latex: string; displayMode: boolean; startIndex: number; endIndex: number } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Undo / Redo history
  const [history, setHistory] = useState<string[]>([value || '']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateValueWithHistory = (newVal: string) => {
    onChange(newVal);
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(newVal);
    if (newHist.length > 30) newHist.shift();
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
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

  // Open "Chèn công thức" modal
  const handleOpenInsertModal = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setEditingFormula(null);
      setIsModalOpen(true);
      return;
    }

    const cursorPos = textarea.selectionStart;
    const text = value || '';

    // Check if cursor is currently inside an existing formula $...$ or $$...$$
    // Regex to find all math tokens and their indexes
    const mathRegex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$)/g;
    let match: RegExpExecArray | null;
    let foundInside: { latex: string; displayMode: boolean; startIndex: number; endIndex: number } | null = null;

    while ((match = mathRegex.exec(text)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (cursorPos >= start && cursorPos <= end) {
        const rawToken = match[0];
        const isDisplay = rawToken.startsWith('$$');
        const cleanLatex = isDisplay ? rawToken.slice(2, -2).trim() : rawToken.slice(1, -1).trim();
        foundInside = {
          latex: cleanLatex,
          displayMode: isDisplay,
          startIndex: start,
          endIndex: end
        };
        break;
      }
    }

    setEditingFormula(foundInside);
    setIsModalOpen(true);
  };

  // Insert or update formula from modal
  const handleInsertFromModal = (latex: string, isDisplay: boolean) => {
    const textarea = textareaRef.current;
    const formulaToken = isDisplay ? `\n$$\n${latex}\n$$\n` : `$${latex}$`;

    if (editingFormula) {
      // Replace existing formula in-place
      const before = value.substring(0, editingFormula.startIndex);
      const after = value.substring(editingFormula.endIndex);
      const newValue = before + formulaToken + after;
      updateValueWithHistory(newValue);
    } else if (textarea) {
      // Insert at current cursor position
      const startPos = textarea.selectionStart;
      const endPos = textarea.selectionEnd;
      const before = value.substring(0, startPos);
      const after = value.substring(endPos);
      const newValue = before + formulaToken + after;
      updateValueWithHistory(newValue);

      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          const newPos = startPos + formulaToken.length;
          textarea.setSelectionRange(newPos, newPos);
        }
      }, 30);
    } else {
      updateValueWithHistory(value ? `${value} ${formulaToken}` : formulaToken);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs ${className}`}>
      {/* Top Toolbar */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {label && (
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {label}
            </span>
          )}

          {/* Prominent "∑ Chèn công thức" button */}
          <button
            type="button"
            onClick={handleOpenInsertModal}
            className="px-3 py-1.5 bg-white hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 active:scale-95 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Mở bảng soạn thảo công thức Toán học trực quan"
          >
            <Sigma className="w-4 h-4 text-teal-600 font-bold" />
            <span className="font-semibold text-xs text-slate-800">Chèn công thức</span>
          </button>
        </div>

        {/* Action buttons (Undo/Redo, Preview Tabs, Copy) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
            title="Hoàn tác"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-colors"
            title="Làm lại"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          {showPreview && (
            <div className="flex items-center gap-0.5 bg-slate-200/80 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-2 py-1 rounded-md transition-all ${
                  activeTab === 'editor'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Nhập
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('split')}
                className={`px-2 py-1 rounded-md transition-all hidden sm:inline-block ${
                  activeTab === 'split'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Song song
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-2 py-1 rounded-md transition-all ${
                  activeTab === 'preview'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
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
              className="text-xs text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Sao chép nội dung"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Editor & Live Preview Body */}
      <div
        className={`grid ${
          activeTab === 'split'
            ? 'grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200'
            : 'grid-cols-1'
        }`}
      >
        {(activeTab === 'editor' || activeTab === 'split') && (
          <div className="p-3">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => updateValueWithHistory(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              style={{ minHeight }}
              className="w-full text-sm font-sans text-slate-900 focus:outline-none resize-y placeholder:text-slate-400 bg-transparent leading-relaxed"
            />
          </div>
        )}

        {(activeTab === 'preview' || activeTab === 'split') && (
          <div className="p-3 bg-slate-50/50 min-h-[90px] overflow-y-auto max-h-[300px]">
            <div className="text-[11px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
              <Eye className="w-3 h-3 text-teal-600" /> Bản xem trước trực quan (MathJax):
            </div>
            {value.trim() ? (
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-900 text-sm leading-relaxed shadow-2xs">
                <MathRenderer content={value} allowZoom />
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic p-3 text-center">
                Chưa có nội dung xem trước
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual MathLive Editor Modal */}
      <VisualMathEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInsert={handleInsertFromModal}
        initialLatex={editingFormula ? editingFormula.latex : ''}
        initialDisplayMode={editingFormula ? editingFormula.displayMode : false}
      />
    </div>
  );
};

export default RichMathTextInput;
