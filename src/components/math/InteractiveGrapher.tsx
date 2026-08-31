import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Rotate3d,
  Compass,
  TrendingUp,
  RefreshCw,
  Plus,
  Minus,
  Layers,
  Calculator,
  CheckCircle2
} from 'lucide-react';
import { MathRenderer } from './MathRenderer';

// ----------------------------------------------------
// MATH PARSER & EVALUATOR ENGINE (MATHTYPE / LATEX -> JS)
// ----------------------------------------------------

export function convertLatexToJs(raw: string): string {
  let s = raw.trim();

  // 1. Remove "y =", "f(x) =", "$", "\(" "\)"
  s = s.replace(/^(?:y|f\s*\(\s*x\s*\))\s*=\s*/i, '');
  s = s.replace(/\$/g, '');
  s = s.replace(/\\\(|\\\)/g, '');
  s = s.trim();

  if (!s) return '0';

  // 2. Normalize fractions: \dfrac{a}{b} and \frac{a}{b}
  let prevS = '';
  while (s !== prevS && /\\(?:dfrac|frac)\{([^{}]+)\}\{([^{}]+)\}/.test(s)) {
    prevS = s;
    s = s.replace(/\\(?:dfrac|frac)\{([^{}]+)\}\{([^{}]+)\}/g, '((($1))/((($2))))');
  }

  // 3. Roots: \sqrt[n]{a} and \sqrt{a}
  while (/\\sqrt\[([^\]]+)\]\{([^{}]+)\}/.test(s)) {
    s = s.replace(/\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g, 'Math.pow($2, 1/($1))');
  }
  while (/\\sqrt\{([^{}]+)\}/.test(s)) {
    s = s.replace(/\\sqrt\{([^{}]+)\}/g, 'Math.sqrt($1)');
  }
  s = s.replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)');

  // 4. Absolute value: \left|a\right| or |a| or abs(a)
  s = s.replace(/\\left\|([^\\|]+)\\right\|/g, 'Math.abs($1)');
  s = s.replace(/\|([^|]+)\|/g, 'Math.abs($1)');
  s = s.replace(/abs\(([^)]+)\)/g, 'Math.abs($1)');

  // 5. Trigonometric and Logarithmic functions
  s = s.replace(/\\sin(?:\s*\{([^{}]+)\}|\s*\(([^()]+)\)|\s*([a-zA-Z0-9]+))/g, (_m, g1, g2, g3) => `Math.sin(${g1 || g2 || g3})`);
  s = s.replace(/sin\s*\(([^()]+)\)/g, 'Math.sin($1)');
  s = s.replace(/\\cos(?:\s*\{([^{}]+)\}|\s*\(([^()]+)\)|\s*([a-zA-Z0-9]+))/g, (_m, g1, g2, g3) => `Math.cos(${g1 || g2 || g3})`);
  s = s.replace(/cos\s*\(([^()]+)\)/g, 'Math.cos($1)');
  s = s.replace(/\\tan(?:\s*\{([^{}]+)\}|\s*\(([^()]+)\)|\s*([a-zA-Z0-9]+))/g, (_m, g1, g2, g3) => `Math.tan(${g1 || g2 || g3})`);
  s = s.replace(/tan\s*\(([^()]+)\)/g, 'Math.tan($1)');
  s = s.replace(/\\cot(?:\s*\{([^{}]+)\}|\s*\(([^()]+)\)|\s*([a-zA-Z0-9]+))/g, (_m, g1, g2, g3) => `(1/Math.tan(${g1 || g2 || g3}))`);
  s = s.replace(/cot\s*\(([^()]+)\)/g, '(1/Math.tan($1))');
  s = s.replace(/\\ln(?:\s*\{([^{}]+)\}|\s*\(([^()]+)\)|\s*([a-zA-Z0-9]+))/g, (_m, g1, g2, g3) => `Math.log(${g1 || g2 || g3})`);
  s = s.replace(/ln\s*\(([^()]+)\)/g, 'Math.log($1)');
  s = s.replace(/\\log(?:\s*\{([^{}]+)\}|\s*\(([^()]+)\)|\s*([a-zA-Z0-9]+))/g, (_m, g1, g2, g3) => `Math.log10(${g1 || g2 || g3})`);
  s = s.replace(/log\s*\(([^()]+)\)/g, 'Math.log10($1)');

  // 6. Exponential and Constants
  s = s.replace(/\\pi\b|π/g, 'Math.PI');
  s = s.replace(/e\^\{([^{}]+)\}/g, 'Math.exp($1)');
  s = s.replace(/e\^([a-zA-Z0-9]+)/g, 'Math.exp($1)');
  s = s.replace(/exp\(([^)]+)\)/g, 'Math.exp($1)');

  // 7. Powers: ^{...} or ^...
  s = s.replace(/\^\{([^{}]+)\}/g, '**($1)');
  s = s.replace(/\^([a-zA-Z0-9]+)/g, '**$1');

  // 8. Implicit multiplications (2x -> 2*x, 3(x+1) -> 3*(x+1), x(x-1) -> x*(x-1), (x-1)(x+2) -> (x-1)*(x+2))
  s = s.replace(/(\d)\s*([a-zA-Z\(])/g, '$1*$2');
  s = s.replace(/([xX\)])\s*([xX\(])/g, '$1*$2');
  s = s.replace(/([xX\)])\s*(Math\.)/g, '$1*$2');
  s = s.replace(/(\d)\s*(Math\.)/g, '$1*$2');

  // Normalize variable x
  s = s.replace(/\bX\b/g, 'x');

  return s;
}

export function compileMathFunction(rawInput: string): (x: number) => number {
  try {
    const jsExpr = convertLatexToJs(rawInput);
    const fn = new Function('x', 'Math', `"use strict"; try { return Number(${jsExpr}); } catch(e) { return NaN; }`);
    return (x: number) => {
      try {
        const val = fn(x, Math);
        return isFinite(val) ? val : NaN;
      } catch {
        return NaN;
      }
    };
  } catch {
    return () => NaN;
  }
}

export function formatToLatexDisplay(rawInput: string): string {
  let s = rawInput.trim();
  if (!s) return 'y = 0';
  s = s.replace(/^(?:y|f\s*\(\s*x\s*\))\s*=\s*/i, '');
  s = s.replace(/\$/g, '');
  return `y = ${s}`;
}

export const InteractiveGrapher: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d');

  // --- 2D STATE ---
  const [mathInput, setMathInput] = useState<string>('x^3 - 3x^2 + 2');
  const [zoom2d, setZoom2d] = useState<number>(45); // px per unit
  const [pan2d, setPan2d] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; valY: number } | null>(null);

  // --- 3D STATE ---
  const [rotX, setRotX] = useState<number>(25);
  const [rotY, setRotY] = useState<number>(-35);

  const [showPlane, setShowPlane] = useState(true);
  const [planeInput, setPlaneInput] = useState({ A: 2, B: -1, C: 2, D: -6 }); // 2x - y + 2z - 6 = 0

  const [showSphere, setShowSphere] = useState(true);
  const [sphereInput, setSphereInput] = useState({ a: 0, b: 0, c: 0, R: 3 }); // x^2 + y^2 + z^2 = 9

  const [showVector, setShowVector] = useState(true);
  const [vectorInput, setVectorInput] = useState({ u1: 3, u2: 4, u3: 2 }); // u(3; 4; 2)

  const [showPoints, setShowPoints] = useState(true);
  const [ptA, setPtA] = useState({ x: 2, y: 3, z: 1 });
  const [ptB, setPtB] = useState({ x: -1, y: 2, z: 4 });

  const canvas2dRef = useRef<HTMLCanvasElement>(null);
  const canvas3dRef = useRef<HTMLCanvasElement>(null);
  const isDragging2d = useRef(false);
  const isDragging3d = useRef(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const eval2dFunc = useMemo(() => {
    return compileMathFunction(mathInput);
  }, [mathInput]);

  const presets2d = [
    { label: 'Bậc 3: y = x³ - 3x² + 2', formula: 'x^3 - 3x^2 + 2' },
    { label: 'Bậc 3: y = -x³ + 3x - 1', formula: '-x^3 + 3x - 1' },
    { label: 'Bậc 4: y = x⁴ - 2x² - 1', formula: 'x^4 - 2x^2 - 1' },
    { label: 'Nhất biến: y = \\dfrac{2x-1}{x+1}', formula: '\\dfrac{2x-1}{x+1}' },
    { label: 'Phân thức: y = \\dfrac{x^2-x+1}{x-1}', formula: '\\dfrac{x^2-x+1}{x-1}' },
    { label: 'Lượng giác: y = 2\\sin(x) + 1', formula: '2\\sin(x) + 1' },
    { label: 'Mũ & Log: y = e^x - 2', formula: 'e^x - 2' }
  ];

  const handleQuickInsert = (snippet: string) => {
    setMathInput((prev) => prev + snippet);
  };

  useEffect(() => {
    if (activeTab !== '2d') return;
    const canvas = canvas2dRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2 + pan2d.x;
    const originY = height / 2 + pan2d.y;
    const scale = zoom2d;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    const startX = originX % scale;
    for (let x = startX; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    const startY = originY % scale;
    for (let y = startY; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    ctx.fillStyle = '#334155';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('x', width - 15, originY - 8);
    ctx.fillText('y', originX + 8, 15);
    ctx.fillText('O', originX - 14, originY + 16);

    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    const minUnitX = Math.floor(-originX / scale);
    const maxUnitX = Math.ceil((width - originX) / scale);
    for (let i = minUnitX; i <= maxUnitX; i++) {
      if (i === 0) continue;
      const px = originX + i * scale;
      if (px > 0 && px < width) ctx.fillText(`${i}`, px - 4, originY + 14);
    }
    const minUnitY = Math.floor(-(height - originY) / scale);
    const maxUnitY = Math.ceil(originY / scale);
    for (let i = minUnitY; i <= maxUnitY; i++) {
      if (i === 0) continue;
      const py = originY - i * scale;
      if (py > 0 && py < height) ctx.fillText(`${i}`, originX - 16, py + 3);
    }

    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let isDrawing = false;
    for (let px = 0; px <= width; px += 1.5) {
      const x = (px - originX) / scale;
      const y = eval2dFunc(x);
      if (isNaN(y) || !isFinite(y) || Math.abs(y) > 100) { isDrawing = false; continue; }
      const py = originY - y * scale;
      if (py < -height || py > height * 2) { isDrawing = false; continue; }
      if (!isDrawing) { ctx.moveTo(px, py); isDrawing = true; } else { ctx.lineTo(px, py); }
    }
    ctx.stroke();

    if (hoverCoord) {
      const hpx = originX + hoverCoord.x * scale;
      const hpy = originY - hoverCoord.valY * scale;
      if (!isNaN(hoverCoord.valY) && hpy >= 0 && hpy <= height) {
        ctx.strokeStyle = '#a855f7';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(hpx, hpy); ctx.lineTo(hpx, originY);
        ctx.moveTo(hpx, hpy); ctx.lineTo(originX, hpy);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.arc(hpx, hpy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        const text = `M(${hoverCoord.x.toFixed(2)}; ${hoverCoord.valY.toFixed(2)})`;
        ctx.font = 'bold 11px Inter, sans-serif';
        const textW = ctx.measureText(text).width;
        ctx.fillRect(hpx + 8, hpy - 24, textW + 12, 20);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, hpx + 14, hpy - 10);
      }
    }
  }, [activeTab, mathInput, eval2dFunc, zoom2d, pan2d, hoverCoord]);

  useEffect(() => {
    if (activeTab !== '3d') return;
    const canvas = canvas3dRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const scale = 36;
    ctx.clearRect(0, 0, width, height);
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;
    const project = (x: number, y: number, z: number) => {
      const x1 = x * Math.cos(radY) + z * Math.sin(radY);
      const y1 = y;
      const z1 = -x * Math.sin(radY) + z * Math.cos(radY);
      const x2 = x1;
      const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
      return { px: cx + x2 * scale, py: cy - y2 * scale };
    };
    ctx.strokeStyle = '#f1f5f9';
    for (let i = -5; i <= 5; i++) {
      const p1 = project(-5, 0, i); const p2 = project(5, 0, i);
      ctx.beginPath(); ctx.moveTo(p1.px, p1.py); ctx.lineTo(p2.px, p2.py); ctx.stroke();
      const p3 = project(i, 0, -5); const p4 = project(i, 0, 5);
      ctx.beginPath(); ctx.moveTo(p3.px, p3.py); ctx.lineTo(p4.px, p4.py); ctx.stroke();
    }
    const draw3dAxis = (from: [number, number, number], to: [number, number, number], color: string, label: string) => {
      const pFrom = project(...from); const pTo = project(...to);
      ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(pFrom.px, pFrom.py); ctx.lineTo(pTo.px, pTo.py); ctx.stroke();
      ctx.fillStyle = color; ctx.font = 'bold 12px Inter, sans-serif'; ctx.fillText(label, pTo.px + 5, pTo.py - 5);
    };
    draw3dAxis([0, 0, 0], [6, 0, 0], '#ef4444', 'Ox');
    draw3dAxis([0, 0, 0], [0, 6, 0], '#10b981', 'Oz');
    draw3dAxis([0, 0, 0], [0, 0, 6], '#3b82f6', 'Oy');
    if (showPlane) {
      const { A, B, C, D } = planeInput;
      const pX = A !== 0 ? -D / A : 0; const pY = B !== 0 ? -D / B : 0; const pZ = C !== 0 ? -D / C : 0;
      const pt1 = project(pX, 0, 0); const pt2 = project(0, pZ, 0); const pt3 = project(0, 0, pY);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.22)'; ctx.strokeStyle = '#6366f1'; ctx.beginPath(); ctx.moveTo(pt1.px, pt1.py); ctx.lineTo(pt2.px, pt2.py); ctx.lineTo(pt3.px, pt3.py); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    if (showSphere) {
      const { a, b, c, R } = sphereInput;
      const pCenter = project(a, c, b);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.85)'; ctx.fillStyle = 'rgba(254, 240, 138, 0.15)'; ctx.beginPath(); ctx.arc(pCenter.px, pCenter.py, R * scale, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
  }, [activeTab, rotX, rotY, showPlane, planeInput, showSphere, sphereInput]);

  const handleMouseDown2d = (e: React.MouseEvent<HTMLCanvasElement>) => { isDragging2d.current = true; lastMousePos.current = { x: e.clientX, y: e.clientY }; };
  const handleMouseMove2d = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvas2dRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const originX = canvas.width / 2 + pan2d.x;
    const originY = canvas.height / 2 + pan2d.y;
    const mathX = (mouseX - originX) / zoom2d;
    setHoverCoord({ x: mathX, y: (originY - mouseY) / zoom2d, valY: eval2dFunc(mathX) });
    if (!isDragging2d.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setPan2d((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp2d = () => { isDragging2d.current = false; };

  const handleMouseDown3d = (e: React.MouseEvent<HTMLCanvasElement>) => { isDragging3d.current = true; lastMousePos.current = { x: e.clientX, y: e.clientY }; };
  const handleMouseMove3d = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging3d.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setRotY((prev) => prev + dx * 0.5);
    setRotX((prev) => Math.max(-80, Math.min(80, prev - dy * 0.5)));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp3d = () => { isDragging3d.current = false; };

  return (
    <div className="space-y-6">
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-black">Phòng Thí Nghiệm Đồ Thị & Không Gian Oxyz</h2>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setActiveTab('2d')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === '2d' ? 'bg-white text-indigo-900' : 'bg-white/10'}`}>Đồ thị 2D</button>
          <button onClick={() => setActiveTab('3d')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === '3d' ? 'bg-white text-indigo-900' : 'bg-white/10'}`}>Không gian 3D</button>
        </div>
      </div>

      {activeTab === '2d' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas View (Left 2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col items-center justify-center relative">
            {/* Toolbar Buttons */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs p-1.5 rounded-2xl border border-slate-200 shadow-xs z-10">
              <button
                onClick={() => setZoom2d((prev) => Math.min(120, prev + 10))}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Phóng to"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom2d((prev) => Math.max(15, prev - 10))}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Thu nhỏ"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setPan2d({ x: 0, y: 0 });
                  setZoom2d(45);
                }}
                className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Về gốc tọa độ"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <canvas
              ref={canvas2dRef}
              width={680}
              height={460}
              onMouseDown={handleMouseDown2d}
              onMouseMove={handleMouseMove2d}
              onMouseUp={handleMouseUp2d}
              onMouseLeave={() => {
                handleMouseUp2d();
                setHoverCoord(null);
              }}
              className="w-full max-w-[680px] aspect-4/3 rounded-2xl bg-white cursor-crosshair border border-slate-100 shadow-inner"
            />

            <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-500 px-2">
              <span>Kéo thả để di chuyển hệ trục • Rê chuột để xem tọa độ $(x; y)$</span>
              <span className="font-bold text-indigo-700">Tỉ lệ: 1 đơn vị = {zoom2d}px</span>
            </div>
          </div>

          {/* Controls & MathType Input (Right 1 col) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  <span>Nhập hàm số (MathType / LaTeX)</span>
                </h3>
              </div>

              {/* Formula input box */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nhập hàm số $y = f(x)$ trực tiếp (không dùng thanh trượt):
                </label>
                <input
                  type="text"
                  value={mathInput}
                  onChange={(e) => setMathInput(e.target.value)}
                  placeholder="Ví dụ: x^3 - 3x^2 + 2 hoặc \dfrac{2x+1}{x-1}"
                  className="w-full p-3 bg-slate-50 border border-indigo-200 rounded-2xl text-sm font-bold text-indigo-950 focus:bg-white focus:border-indigo-600 focus:outline-none shadow-2xs font-mono"
                />
              </div>

              {/* Rendered KaTeX Math Preview */}
              <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center min-h-[56px]">
                <div className="text-xs text-indigo-700 font-bold mb-1">Công thức hiển thị trực quan:</div>
                <div className="text-base font-serif text-indigo-950">
                  <MathRenderer content={`$$${formatToLatexDisplay(mathInput)}$$`} />
                </div>
              </div>

              {/* Quick Math Keyboard */}
              <div>
                <div className="text-xs font-bold text-slate-600 mb-2">Bàn phím ký hiệu toán học nhanh:</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'x²', val: '^2' },
                    { label: 'x³', val: '^3' },
                    { label: 'xⁿ', val: '^' },
                    { label: 'a/b', val: '\\dfrac{}{}' },
                    { label: '√x', val: '\\sqrt{}' },
                    { label: 'sin', val: '\\sin(x)' },
                    { label: 'cos', val: '\\cos(x)' },
                    { label: 'ln', val: '\\ln(x)' },
                    { label: 'eˣ', val: 'e^x' },
                    { label: '|x|', val: '|x|' },
                    { label: 'π', val: '\\pi' },
                    { label: '+', val: ' + ' }
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickInsert(btn.val)}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-900 text-slate-800 text-xs font-bold rounded-xl transition-all font-mono cursor-pointer"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 12th Grade Presets */}
              <div>
                <div className="text-xs font-bold text-slate-600 mb-2">Mẫu hàm số Toán 12 thường gặp:</div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {presets2d.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMathInput(p.formula)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        mathInput === p.formula
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{p.label}</span>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${mathInput === p.formula ? 'text-white' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900">
              💡 <strong>Mẹo:</strong> Thầy/cô có thể dán trực tiếp công thức MathType từ Word hoặc gõ tự do các hàm đa thức, phân thức, mũ, logarit, lượng giác!
            </div>
          </div>
        </div>
      )}

      {activeTab === '3d' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas 3D (Left 2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col items-center justify-center relative select-none">
            <canvas
              ref={canvas3dRef}
              width={680}
              height={460}
              onMouseDown={handleMouseDown3d}
              onMouseMove={handleMouseMove3d}
              onMouseUp={handleMouseUp3d}
              onMouseLeave={handleMouseUp3d}
              className="w-full max-w-[680px] aspect-4/3 rounded-2xl bg-white cursor-grab active:cursor-grabbing border border-slate-100 shadow-inner"
            />
            <div className="w-full mt-3 flex items-center justify-between text-xs text-slate-500 px-2">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-600 animate-spin" />
                <span>Kéo thả chuột xoay 360° tự do • Góc nhìn: ({rotX.toFixed(0)}°, {rotY.toFixed(0)}°)</span>
              </span>
              <button
                onClick={() => {
                  setRotX(25);
                  setRotY(-35);
                }}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Góc nhìn chuẩn
              </button>
            </div>
          </div>

          {/* Controls 3D Objects (Right 1 col) - No Sliders, Direct MathType Input */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 max-h-[580px] overflow-y-auto">
            <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Đối tượng Oxyz (Nhập trực tiếp)</span>
            </h3>

            {/* 1. Mặt phẳng (P) */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-indigo-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPlane}
                    onChange={(e) => setShowPlane(e.target.checked)}
                    className="w-4 h-4 accent-indigo-600 rounded"
                  />
                  <span>Mặt phẳng $(P): Ax + By + Cz + D = 0$</span>
                </label>
              </div>

              {showPlane && (
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block text-center">Hệ số A</label>
                    <input
                      type="number"
                      value={planeInput.A}
                      onChange={(e) => setPlaneInput({ ...planeInput, A: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block text-center">Hệ số B</label>
                    <input
                      type="number"
                      value={planeInput.B}
                      onChange={(e) => setPlaneInput({ ...planeInput, B: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block text-center">Hệ số C</label>
                    <input
                      type="number"
                      value={planeInput.C}
                      onChange={(e) => setPlaneInput({ ...planeInput, C: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block text-center">Hệ số D</label>
                    <input
                      type="number"
                      value={planeInput.D}
                      onChange={(e) => setPlaneInput({ ...planeInput, D: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Mặt cầu (S) */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showSphere}
                    onChange={(e) => setShowSphere(e.target.checked)}
                    className="w-4 h-4 accent-amber-600 rounded"
                  />
                  <span>Mặt cầu $(S): (x-a)^2 + (y-b)^2 + (z-c)^2 = R^2$</span>
                </label>
              </div>

              {showSphere && (
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block text-center">Tâm a</label>
                    <input
                      type="number"
                      value={sphereInput.a}
                      onChange={(e) => setSphereInput({ ...sphereInput, a: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block text-center">Tâm b</label>
                    <input
                      type="number"
                      value={sphereInput.b}
                      onChange={(e) => setSphereInput({ ...sphereInput, b: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block text-center">Tâm c</label>
                    <input
                      type="number"
                      value={sphereInput.c}
                      onChange={(e) => setSphereInput({ ...sphereInput, c: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block text-center">Bán kính R</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={sphereInput.R}
                      onChange={(e) => setSphereInput({ ...sphereInput, R: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold text-amber-700"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 3. Véc-tơ u */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <label className="flex items-center gap-2 text-xs font-bold text-purple-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVector}
                  onChange={(e) => setShowVector(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
                <span>Véc-tơ $\vec{u} = (u_1; u_2; u_3)$</span>
              </label>

              {showVector && (
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block text-center">u₁</label>
                    <input
                      type="number"
                      value={vectorInput.u1}
                      onChange={(e) => setVectorInput({ ...vectorInput, u1: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block text-center">u₂</label>
                    <input
                      type="number"
                      value={vectorInput.u2}
                      onChange={(e) => setVectorInput({ ...vectorInput, u2: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block text-center">u₃</label>
                    <input
                      type="number"
                      value={vectorInput.u3}
                      onChange={(e) => setVectorInput({ ...vectorInput, u3: Number(e.target.value) })}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 4. Đoạn thẳng & Điểm A, B */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <label className="flex items-center gap-2 text-xs font-bold text-pink-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPoints}
                  onChange={(e) => setShowPoints(e.target.checked)}
                  className="w-4 h-4 accent-pink-600 rounded"
                />
                <span>Hai điểm $A(x_A; y_A; z_A)$ và $B(x_B; y_B; z_B)$</span>
              </label>

              {showPoints && (
                <div className="space-y-2 pt-1">
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block text-center">x_A</label>
                      <input
                        type="number"
                        value={ptA.x}
                        onChange={(e) => setPtA({ ...ptA, x: Number(e.target.value) })}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block text-center">y_A</label>
                      <input
                        type="number"
                        value={ptA.y}
                        onChange={(e) => setPtA({ ...ptA, y: Number(e.target.value) })}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block text-center">z_A</label>
                      <input
                        type="number"
                        value={ptA.z}
                        onChange={(e) => setPtA({ ...ptA, z: Number(e.target.value) })}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block text-center">x_B</label>
                      <input
                        type="number"
                        value={ptB.x}
                        onChange={(e) => setPtB({ ...ptB, x: Number(e.target.value) })}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block text-center">y_B</label>
                      <input
                        type="number"
                        value={ptB.y}
                        onChange={(e) => setPtB({ ...ptB, y: Number(e.target.value) })}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block text-center">z_B</label>
                      <input
                        type="number"
                        value={ptB.z}
                        onChange={(e) => setPtB({ ...ptB, z: Number(e.target.value) })}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveGrapher;
