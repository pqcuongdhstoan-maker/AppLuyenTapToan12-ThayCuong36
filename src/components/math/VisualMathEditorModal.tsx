import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  RotateCcw,
  CornerDownLeft,
  ChevronLeft,
  ChevronRight,
  Delete,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { MathRenderer } from './MathRenderer';

// MathLive custom element type declaration for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        ref?: any;
        class?: string;
        value?: string;
      };
    }
  }
}

interface VisualMathEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (latex: string, displayMode: boolean) => void;
  initialLatex?: string;
  initialDisplayMode?: boolean;
}

type TabCategory = '123' | 'func' | 'symbols' | 'abc' | 'greek';

export const VisualMathEditorModal: React.FC<VisualMathEditorModalProps> = ({
  isOpen,
  onClose,
  onInsert,
  initialLatex = '',
  initialDisplayMode = false
}) => {
  const [activeTab, setActiveTab] = useState<TabCategory>('123');
  const [displayMode, setDisplayMode] = useState<boolean>(initialDisplayMode);
  const [latexValue, setLatexValue] = useState<string>(initialLatex);
  const [isShiftActive, setIsShiftActive] = useState<boolean>(false);

  const mathFieldRef = useRef<any>(null);

  // Sync initial LaTeX when modal opens
  useEffect(() => {
    if (isOpen) {
      let clean = initialLatex.trim();
      // Remove wrapping $ or $$ if provided
      if (clean.startsWith('$$') && clean.endsWith('$$')) {
        clean = clean.slice(2, -2).trim();
        setDisplayMode(true);
      } else if (clean.startsWith('$') && clean.endsWith('$')) {
        clean = clean.slice(1, -1).trim();
        setDisplayMode(false);
      } else {
        setDisplayMode(initialDisplayMode);
      }
      setLatexValue(clean);

      // Initialize MathLive field value
      setTimeout(() => {
        if (mathFieldRef.current) {
          try {
            mathFieldRef.current.setValue(clean, { silenceNotifications: true });
            mathFieldRef.current.focus();
          } catch {}
        }
      }, 50);
    }
  }, [isOpen, initialLatex, initialDisplayMode]);

  // MathLive custom element input listener
  useEffect(() => {
    const mf = mathFieldRef.current;
    if (!mf) return;

    const handleInput = () => {
      const val = mf.getValue('latex-expanded') || mf.value || '';
      setLatexValue(val);
    };

    mf.addEventListener('input', handleInput);
    return () => {
      mf.removeEventListener('input', handleInput);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Insert command / snippet into MathLive math-field
  const executeMathAction = (action: { command?: string; insert?: string; latex?: string }) => {
    const mf = mathFieldRef.current;
    if (!mf) return;

    try {
      if (action.command) {
        mf.executeCommand(action.command);
      } else if (action.insert) {
        mf.insert(action.insert, { focus: true, mode: 'math' });
      } else if (action.latex) {
        mf.insert(action.latex, { focus: true, mode: 'math', format: 'latex' });
      }

      const currentVal = mf.getValue('latex-expanded') || mf.value || '';
      setLatexValue(currentVal);
      mf.focus();
    } catch (e) {
      console.warn('MathAction error:', e);
    }
  };

  const handleBackspace = () => {
    const mf = mathFieldRef.current;
    if (mf) {
      try {
        mf.executeCommand('deleteBackward');
        setLatexValue(mf.getValue('latex-expanded') || mf.value || '');
        mf.focus();
      } catch {}
    }
  };

  const handleMoveLeft = () => {
    const mf = mathFieldRef.current;
    if (mf) {
      try {
        mf.executeCommand('moveToPreviousChar');
        mf.focus();
      } catch {}
    }
  };

  const handleMoveRight = () => {
    const mf = mathFieldRef.current;
    if (mf) {
      try {
        mf.executeCommand('moveToNextChar');
        mf.focus();
      } catch {}
    }
  };

  const handleClear = () => {
    const mf = mathFieldRef.current;
    if (mf) {
      try {
        mf.setValue('', { silenceNotifications: true });
        setLatexValue('');
        mf.focus();
      } catch {}
    }
  };

  const handleInsertFormula = () => {
    const mf = mathFieldRef.current;
    const finalLatex = (mf ? (mf.getValue('latex-expanded') || mf.value) : latexValue).trim();
    if (!finalLatex) {
      onClose();
      return;
    }
    onInsert(finalLatex, displayMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] animate-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-800 tracking-tight">Soạn thảo công thức</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MathLive Visual Input Box */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white">
          <div className="relative">
            <math-field
              ref={mathFieldRef}
              class="w-full min-h-[75px] p-3 text-xl sm:text-2xl font-serif rounded-2xl border-2 border-slate-300 focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-100 bg-slate-50/30 transition-all outline-none"
            >
              {latexValue}
            </math-field>
          </div>

          {/* Options & Action Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            {/* Inline vs Display Mode options */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="math_display_mode"
                  checked={!displayMode}
                  onChange={() => setDisplayMode(false)}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span>Công thức trong dòng ($...$)</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="radio"
                  name="math_display_mode"
                  checked={displayMode}
                  onChange={() => setDisplayMode(true)}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500 cursor-pointer"
                />
                <span>Công thức riêng một dòng ($$...$$)</span>
              </label>
            </div>

            {/* Insert Button in Teal/Blue */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInsertFormula}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-teal-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4 font-extrabold" />
                <span>Chèn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Virtual Keyboard Area (Matching the 5 photos exactly) */}
        <div className="flex-1 bg-slate-200/70 flex flex-col overflow-y-auto">
          {/* Tab Navigation Header (Active Tab in Teal with underline) */}
          <div className="px-6 pt-3 flex items-center gap-8 border-b border-slate-300 text-sm font-bold select-none overflow-x-auto bg-slate-200/50">
            <button
              type="button"
              onClick={() => setActiveTab('123')}
              className={`pb-2.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === '123'
                  ? 'text-teal-700 border-b-2 border-teal-600 font-black'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              123
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('func')}
              className={`pb-2.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'func'
                  ? 'text-teal-700 border-b-2 border-teal-600 font-black'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              <span className="italic font-serif">f</span> ()
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('symbols')}
              className={`pb-2.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'symbols'
                  ? 'text-teal-700 border-b-2 border-teal-600 font-black'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              ∞ ≠ ∈
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('abc')}
              className={`pb-2.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'abc'
                  ? 'text-teal-700 border-b-2 border-teal-600 font-black'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              ABC
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('greek')}
              className={`pb-2.5 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'greek'
                  ? 'text-teal-700 border-b-2 border-teal-600 font-black'
                  : 'text-slate-600 hover:text-slate-900 font-semibold'
              }`}
            >
              α β γ
            </button>
          </div>

          {/* Keyboard Grid Content based on Tab */}
          <div className="p-3 sm:p-5 flex-1">
            {/* TAB 1: 123 (Exact layout of Photo 2) */}
            {activeTab === '123' && (
              <div className="grid grid-cols-12 gap-2 max-w-4xl mx-auto font-sans">
                {/* Left 2 cols: Variables, Inequalities, Brackets, Clear */}
                <div className="col-span-2 grid grid-cols-2 gap-1.5">
                  <KeyBtn onClick={() => executeMathAction({ insert: 'x' })} label="x" isItalic />
                  <KeyBtn onClick={() => executeMathAction({ insert: 'n' })} label="n" isItalic />
                  <KeyBtn onClick={() => executeMathAction({ insert: '<' })} label="<" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '>' })} label=">" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '(' })} label="(" />
                  <KeyBtn onClick={() => executeMathAction({ insert: ')' })} label=")" />
                  <KeyBtn onClick={handleClear} label="⭘" isSpecialRed />
                  <KeyBtn onClick={() => executeMathAction({ latex: '\\frac{#?}{#?}' })} label="□/□" isSpecialYellow />
                </div>

                {/* Center 5 cols: 7-9, 4-6, 1-3, 0 and Basic Ops */}
                <div className="col-span-5 grid grid-cols-4 gap-1.5">
                  <KeyBtn onClick={() => executeMathAction({ insert: '7' })} label="7" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '8' })} label="8" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '9' })} label="9" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\div' })} label="÷" isOp />

                  <KeyBtn onClick={() => executeMathAction({ insert: '4' })} label="4" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '5' })} label="5" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '6' })} label="6" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\times' })} label="×" isOp />

                  <KeyBtn onClick={() => executeMathAction({ insert: '1' })} label="1" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '2' })} label="2" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '3' })} label="3" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '-' })} label="−" isOp />

                  <KeyBtn onClick={() => executeMathAction({ insert: '0' })} label="0" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '.' })} label="." />
                  <KeyBtn onClick={() => executeMathAction({ insert: '=' })} label="=" isOp />
                  <KeyBtn onClick={() => executeMathAction({ insert: '+' })} label="+" isOp />
                </div>

                {/* Right 5 cols: Functions, Constants, Power, Roots, Navigation */}
                <div className="col-span-5 grid grid-cols-3 gap-1.5">
                  <KeyBtn onClick={() => executeMathAction({ insert: 'e' })} label="e" isItalic />
                  <KeyBtn onClick={() => executeMathAction({ insert: 'i' })} label="i" isItalic />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\pi' })} label="π" />

                  <KeyBtn onClick={() => executeMathAction({ latex: '{#?}^2' })} label="□²" />
                  <KeyBtn onClick={() => executeMathAction({ latex: 'x^{#?}' })} label="x^□" />
                  <KeyBtn onClick={() => executeMathAction({ latex: '\\sqrt{#?}' })} label="√□" />

                  <KeyBtn onClick={() => executeMathAction({ latex: '\\int_{0}^{\\infty}{#?}' })} label="∫₀^∞" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\forall' })} label="∀" />
                  <KeyBtn onClick={() => executeMathAction({ latex: '\\sqrt[#?]{#?}' })} label="ⁿ√□" />

                  <KeyBtn onClick={handleMoveLeft} label="‹" isControl />
                  <KeyBtn onClick={handleMoveRight} label="›" isControl />
                  <KeyBtn onClick={handleBackspace} label="⌫" isControl />
                </div>
              </div>
            )}

            {/* TAB 2: f() (Exact 9-column layout of Photo 3) */}
            {activeTab === 'func' && (
              <div className="grid grid-cols-9 gap-1.5 max-w-4xl mx-auto font-sans text-xs">
                {/* Row 1 */}
                <KeyBtn onClick={() => executeMathAction({ latex: '\\sin\\left(#?\\right)' })} label="sin" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\sin^{-1}\\left(#?\\right)' })} label="sin⁻¹" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\ln\\left(#?\\right)' })} label="ln" />
                <KeyBtn onClick={() => executeMathAction({ latex: 'e^{#?}' })} label="e^□" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\operatorname{lcm}\\left(#?\\right)' })} label="lcm()" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\operatorname{ceil}\\left(#?\\right)' })} label="ceil()" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\lim_{n \\to \\infty}{#?}' })} label="lim_{n→∞}" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\int{#?}\\,dx' })} label="∫" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\left|#?\\right|' })} label="abs()" />

                {/* Row 2 */}
                <KeyBtn onClick={() => executeMathAction({ latex: '\\cos\\left(#?\\right)' })} label="cos" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\cos^{-1}\\left(#?\\right)' })} label="cos⁻¹" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\log\\left(#?\\right)' })} label="log" />
                <KeyBtn onClick={() => executeMathAction({ latex: '10^{#?}' })} label="10^□" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\operatorname{gcd}\\left(#?\\right)' })} label="gcd()" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\operatorname{floor}\\left(#?\\right)' })} label="floor()" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\sum_{n=0}^{\\infty}{#?}' })} label="∑_{n=0}^∞" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\int_{0}^{\\infty}{#?}\\,dx' })} label="∫₀^∞" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\operatorname{sign}\\left(#?\\right)' })} label="sign()" />

                {/* Row 3 */}
                <KeyBtn onClick={() => executeMathAction({ latex: '\\tan\\left(#?\\right)' })} label="tan" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\tan^{-1}\\left(#?\\right)' })} label="tan⁻¹" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\log_{#?}\\left(#?\\right)' })} label="log_□" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\sqrt[#?]{#?}' })} label="ⁿ√□" />
                <KeyBtn onClick={() => executeMathAction({ insert: '\\bmod' })} label="mod" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\operatorname{round}\\left(#?\\right)' })} label="round()" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\prod_{n=0}^{\\infty}{#?}' })} label="∏_{n=0}^∞" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\frac{d#?}{dx}' })} label="d□/dx" />
                <KeyBtn onClick={() => executeMathAction({ latex: '\\frac{#?}{#?}' })} label="□/□" />

                {/* Row 4 */}
                <KeyBtn onClick={() => executeMathAction({ insert: '(' })} label="(" />
                <KeyBtn onClick={() => executeMathAction({ insert: ')' })} label=")" />
                <KeyBtn onClick={() => executeMathAction({ latex: 'x^{#?}' })} label="x^□" />
                <KeyBtn onClick={() => executeMathAction({ latex: 'x_{#?}' })} label="x_□" />
                <KeyBtn onClick={() => executeMathAction({ insert: ' ' })} label="Space" className="col-span-2" />
                <KeyBtn onClick={handleMoveLeft} label="‹" isControl />
                <KeyBtn onClick={handleMoveRight} label="›" isControl />
                <KeyBtn onClick={handleBackspace} label="⌫" isControl />
              </div>
            )}

            {/* TAB 3: ∞ ≠ ∈ (Exact layout of Photo 4) */}
            {activeTab === 'symbols' && (
              <div className="grid grid-cols-12 gap-1.5 max-w-4xl mx-auto font-sans text-xs">
                {/* Left 6 cols: Numbers, Delimiters, Operators */}
                <div className="col-span-6 grid grid-cols-6 gap-1.5">
                  <KeyBtn onClick={() => executeMathAction({ insert: '7' })} label="7" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '8' })} label="8" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '9' })} label="9" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\div' })} label="÷" isOp />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\{' })} label="{" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\}' })} label="}" />

                  <KeyBtn onClick={() => executeMathAction({ insert: '4' })} label="4" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '5' })} label="5" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '6' })} label="6" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\times' })} label="×" isOp />
                  <KeyBtn onClick={() => executeMathAction({ insert: '[' })} label="[" />
                  <KeyBtn onClick={() => executeMathAction({ insert: ']' })} label="]" />

                  <KeyBtn onClick={() => executeMathAction({ insert: '1' })} label="1" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '2' })} label="2" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '3' })} label="3" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '-' })} label="−" isOp />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\langle' })} label="⟨" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\rangle' })} label="⟩" />

                  <KeyBtn onClick={() => executeMathAction({ insert: '0' })} label="0" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '.' })} label="." />
                  <KeyBtn onClick={() => executeMathAction({ insert: '=' })} label="=" isOp />
                  <KeyBtn onClick={() => executeMathAction({ insert: '+' })} label="+" isOp />
                  <KeyBtn onClick={() => executeMathAction({ insert: ',' })} label="," />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\cdot' })} label="·" />
                </div>

                {/* Right 6 cols: Advanced Set, Geometry, Vector symbols */}
                <div className="col-span-6 grid grid-cols-6 gap-1.5">
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\leftarrow' })} label="←" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\rightarrow' })} label="→" />
                  <KeyBtn onClick={() => executeMathAction({ latex: '\\overline{#?}' })} label="x̄" />
                  <KeyBtn onClick={() => executeMathAction({ latex: '\\underline{#?}' })} label="x̲" />
                  <KeyBtn onClick={() => executeMathAction({ latex: '\\lceil#?\\rceil' })} label="⌈□⌉" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\nabla' })} label="∇" />

                  <KeyBtn onClick={() => executeMathAction({ insert: '\\in' })} label="∈" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\notin' })} label="∉" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\Re' })} label="ℜ" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\Im' })} label="ℑ" />
                  <KeyBtn onClick={() => executeMathAction({ latex: '\\lfloor#?\\rfloor' })} label="⌊□⌋" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\partial' })} label="∂" />

                  <KeyBtn onClick={() => executeMathAction({ insert: '\\subset' })} label="⊂" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\supset' })} label="⊃" />
                  <KeyBtn onClick={() => executeMathAction({ latex: '\\vec{#?}' })} label="v⃗" />
                  <KeyBtn onClick={() => executeMathAction({ latex: '\\left|#?\\right|' })} label="|□|" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '!' })} label="!" />
                  <KeyBtn onClick={() => executeMathAction({ insert: "'" })} label="'" />

                  <KeyBtn onClick={() => executeMathAction({ insert: '\\approx' })} label="≈" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\neq' })} label="≠" />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\pm' })} label="±" />
                  <KeyBtn onClick={handleMoveLeft} label="‹" isControl />
                  <KeyBtn onClick={handleMoveRight} label="›" isControl />
                  <KeyBtn onClick={handleBackspace} label="⌫" isControl />
                </div>
              </div>
            )}

            {/* TAB 4: ABC (Exact layout of Photo 5) */}
            {activeTab === 'abc' && (
              <div className="grid grid-cols-12 gap-1.5 max-w-4xl mx-auto font-sans text-xs">
                {/* Left side 4 cols */}
                <div className="col-span-4 grid grid-cols-4 gap-1.5">
                  <KeyBtn onClick={() => executeMathAction({ insert: '7' })} label="7" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '8' })} label="8" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '9' })} label="9" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\div' })} label="÷" isOp />

                  <KeyBtn onClick={() => executeMathAction({ insert: '4' })} label="4" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '5' })} label="5" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '6' })} label="6" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '\\times' })} label="×" isOp />

                  <KeyBtn onClick={() => executeMathAction({ insert: '1' })} label="1" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '2' })} label="2" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '3' })} label="3" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '-' })} label="−" isOp />

                  <KeyBtn onClick={() => executeMathAction({ insert: '0' })} label="0" isNumber />
                  <KeyBtn onClick={() => executeMathAction({ insert: '.' })} label="." />
                  <KeyBtn onClick={() => executeMathAction({ insert: '=' })} label="=" isOp />
                  <KeyBtn onClick={() => executeMathAction({ insert: '+' })} label="+" isOp />
                </div>

                {/* Right side Alphabet 8 cols */}
                <div className="col-span-8 flex flex-col gap-1.5">
                  {/* Row 1 */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {['p', 'y', 'f', 'g', 'c', 'r', 'l'].map((k) => (
                      <KeyBtn
                        key={k}
                        onClick={() => executeMathAction({ insert: isShiftActive ? k.toUpperCase() : k })}
                        label={isShiftActive ? k.toUpperCase() : k}
                        isItalic
                      />
                    ))}
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-10 gap-1.5">
                    {['a', 'o', 'e', 'u', 'i', 'd', 'h', 't', 'n', 's'].map((k) => (
                      <KeyBtn
                        key={k}
                        onClick={() => executeMathAction({ insert: isShiftActive ? k.toUpperCase() : k })}
                        label={isShiftActive ? k.toUpperCase() : k}
                        isItalic
                      />
                    ))}
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-9 gap-1.5">
                    {['q', 'j', 'k', 'x', 'b', 'm', 'w', 'v', 'z'].map((k) => (
                      <KeyBtn
                        key={k}
                        onClick={() => executeMathAction({ insert: isShiftActive ? k.toUpperCase() : k })}
                        label={isShiftActive ? k.toUpperCase() : k}
                        isItalic
                      />
                    ))}
                  </div>

                  {/* Row 4: Space, Shift, Del */}
                  <div className="grid grid-cols-8 gap-1.5">
                    <KeyBtn onClick={() => executeMathAction({ insert: ';' })} label=";" />
                    <KeyBtn onClick={() => executeMathAction({ insert: ',' })} label="," />
                    <KeyBtn onClick={() => executeMathAction({ insert: ' ' })} label="Khoảng trống (Space)" className="col-span-3" />
                    <KeyBtn
                      onClick={() => setIsShiftActive(!isShiftActive)}
                      label={isShiftActive ? '▲ SHIFT' : '⇧ shift'}
                      isControl
                    />
                    <KeyBtn onClick={handleMoveLeft} label="‹" isControl />
                    <KeyBtn onClick={handleBackspace} label="⌫" isControl />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: α β γ (Greek Alphabet) */}
            {activeTab === 'greek' && (
              <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 max-w-4xl mx-auto font-serif text-sm">
                {[
                  { label: 'α', tex: '\\alpha' },
                  { label: 'β', tex: '\\beta' },
                  { label: 'γ', tex: '\\gamma' },
                  { label: 'δ', tex: '\\delta' },
                  { label: 'ε', tex: '\\varepsilon' },
                  { label: 'ζ', tex: '\\zeta' },
                  { label: 'η', tex: '\\eta' },
                  { label: 'θ', tex: '\\theta' },
                  { label: 'ι', tex: '\\iota' },
                  { label: 'κ', tex: '\\kappa' },
                  { label: 'λ', tex: '\\lambda' },
                  { label: 'μ', tex: '\\mu' },
                  { label: 'ν', tex: '\\nu' },
                  { label: 'ξ', tex: '\\xi' },
                  { label: 'π', tex: '\\pi' },
                  { label: 'ρ', tex: '\\rho' },
                  { label: 'σ', tex: '\\sigma' },
                  { label: 'τ', tex: '\\tau' },
                  { label: 'υ', tex: '\\upsilon' },
                  { label: 'φ', tex: '\\varphi' },
                  { label: 'χ', tex: '\\chi' },
                  { label: 'ψ', tex: '\\psi' },
                  { label: 'ω', tex: '\\omega' },
                  { label: 'Δ', tex: '\\Delta' },
                  { label: 'Σ', tex: '\\Sigma' },
                  { label: 'Π', tex: '\\Pi' },
                  { label: 'Ω', tex: '\\Omega' },
                  { label: 'Γ', tex: '\\Gamma' },
                  { label: 'Θ', tex: '\\Theta' },
                  { label: 'Λ', tex: '\\Lambda' }
                ].map((item) => (
                  <KeyBtn
                    key={item.tex}
                    onClick={() => executeMathAction({ insert: item.tex })}
                    label={item.label}
                  />
                ))}
                <KeyBtn onClick={handleMoveLeft} label="‹" isControl />
                <KeyBtn onClick={handleMoveRight} label="›" isControl />
                <KeyBtn onClick={handleBackspace} label="⌫" isControl />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface KeyBtnProps {
  onClick: () => void;
  label: string;
  isNumber?: boolean;
  isOp?: boolean;
  isControl?: boolean;
  isItalic?: boolean;
  isSpecialRed?: boolean;
  isSpecialYellow?: boolean;
  className?: string;
}

const KeyBtn: React.FC<KeyBtnProps> = ({
  onClick,
  label,
  isNumber = false,
  isOp = false,
  isControl = false,
  isItalic = false,
  isSpecialRed = false,
  isSpecialYellow = false,
  className = ''
}) => {
  let bgClass = 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300/80 shadow-2xs';

  if (isControl) {
    bgClass = 'bg-slate-300/80 hover:bg-slate-300 text-slate-800 font-bold border-slate-400';
  } else if (isNumber) {
    bgClass = 'bg-white hover:bg-slate-50 text-slate-900 font-bold border-slate-300 shadow-xs';
  } else if (isOp) {
    bgClass = 'bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border-slate-300';
  } else if (isSpecialRed) {
    bgClass = 'bg-white hover:bg-rose-50 text-rose-600 font-bold border-slate-300 text-lg';
  } else if (isSpecialYellow) {
    bgClass = 'bg-white hover:bg-amber-50 text-amber-600 font-bold border-slate-300';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 sm:h-11 rounded-xl border flex items-center justify-center transition-all active:scale-95 text-xs sm:text-sm select-none cursor-pointer ${bgClass} ${
        isItalic ? 'font-serif italic' : ''
      } ${className}`}
    >
      {label}
    </button>
  );
};

export default VisualMathEditorModal;
