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
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { MathRenderer } from './MathRenderer';

// ----------------------------------------------------
// THƯ VIỆN XỬ LÝ CÔNG THỨC MATHTYPE TRỰC QUAN -> JAVASCRIPT
// ----------------------------------------------------

export function convertMathTypeToJs(raw: string): string {
  let s = raw.trim();

  // 1. Loại bỏ tiền tố "y =", "f(x) =", "$", "\(" "\)" nếu có
  s = s.replace(/^(?:y|f\s*\(\s*x\s*\))\s*=\s*/i, '');
  s = s.replace(/\$/g, '');
  s = s.replace(/\\\(|\\\)/g, '');
  s = s.trim();

  if (!s) return '0';

  // 2. Ký tự số mũ Unicode: ² -> ^2, ³ -> ^3, ⁴ -> ^4
  s = s.replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4');
  s = s.replace(/×/g, '*').replace(/÷/g, '/');

  // 3. Phân số MathType từ Word: \dfrac{a}{b} hoặc (a)/(b) -> (((a)/(b)))
  let prevS = '';
  while (s !== prevS && /\\(?:dfrac|frac)\{([^{}]+)\}\{([^{}]+)\}/.test(s)) {
    prevS = s;
    s = s.replace(/\\(?:dfrac|frac)\{([^{}]+)\}\{([^{}]+)\}/g, '((($1))/((($2))))');
  }

  // 4. Căn bậc hai: √(a), sqrt(a), \sqrt{a}
  s = s.replace(/√\s*\(([^()]+)\)/g, 'Math.sqrt($1)');
  s = s.replace(/√([a-zA-Z0-9]+)/g, 'Math.sqrt($1)');
  s = s.replace(/sqrt\s*\(([^()]+)\)/g, 'Math.sqrt($1)');
  while (/\\sqrt\{([^{}]+)\}/.test(s)) {
    s = s.replace(/\\sqrt\{([^{}]+)\}/g, 'Math.sqrt($1)');
  }

  // 5. Trị tuyệt đối: |a|, abs(a), \left|a\right|
  s = s.replace(/\\left\|([^\\|]+)\\right\|/g, 'Math.abs($1)');
  s = s.replace(/\|([^|]+)\|/g, 'Math.abs($1)');
  s = s.replace(/abs\s*\(([^()]+)\)/g, 'Math.abs($1)');

  // 6. Hàm lượng giác & Logarit: sin, cos, tan, cot, ln, log
  s = s.replace(/\\?sin\s*(?:\(([^()]+)\)|\{([^{}]+)\})/g, 'Math.sin($1$2)');
  s = s.replace(/\\?cos\s*(?:\(([^()]+)\)|\{([^{}]+)\})/g, 'Math.cos($1$2)');
  s = s.replace(/\\?tan\s*(?:\(([^()]+)\)|\{([^{}]+)\})/g, 'Math.tan($1$2)');
  s = s.replace(/\\?cot\s*(?:\(([^()]+)\)|\{([^{}]+)\})/g, '(1/Math.tan($1$2))');
  s = s.replace(/\\?ln\s*(?:\(([^()]+)\)|\{([^{}]+)\})/g, 'Math.log($1$2)');
  s = s.replace(/\\?log\s*(?:\(([^()]+)\)|\{([^{}]+)\})/g, 'Math.log10($1$2)');

  // 7. Hằng số π, e, hàm mũ exp
  s = s.replace(/\\pi\b|π/g, 'Math.PI');
  s = s.replace(/e\^\s*(?:\(([^()]+)\)|\{([^{}]+)\})/g, 'Math.exp($1$2)');
  s = s.replace(/e\^([a-zA-Z0-9]+)/g, 'Math.exp($1)');
  s = s.replace(/exp\s*\(([^()]+)\)/g, 'Math.exp($1)');

  // 8. Số mũ: ^{...} hoặc ^(...) hoặc ^2
  s = s.replace(/\^\{([^{}]+)\}/g, '**($1)');
  s = s.replace(/\^\(([^()]+)\)/g, '**($1)');
  s = s.replace(/\^([a-zA-Z0-9]+)/g, '**$1');

  // 9. Phép nhân ẩn (2x -> 2*x, 3(x+1) -> 3*(x+1), x(x-1) -> x*(x-1), (x-1)(x+2) -> (x-1)*(x+2))
  s = s.replace(/(\d)\s*([a-zA-Z\(])/g, '$1*$2');
  s = s.replace(/([xX\)])\s*([xX\(])/g, '$1*$2');
  s = s.replace(/([xX\)])\s*(Math\.)/g, '$1*$2');
  s = s.replace(/(\d)\s*(Math\.)/g, '$1*$2');

  // Chuẩn hóa biến x
  s = s.replace(/\bX\b/g, 'x');

  return s;
}

export function compileMathTypeFunction(rawInput: string): (x: number) => number {
  try {
    const jsExpr = convertMathTypeToJs(rawInput);
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

/**
 * Hiển thị công thức MathType sang định dạng Toán học trực quan
 */
export function formatMathTypeToDisplay(rawInput: string): string {
  let s = rawInput.trim();
  if (!s) return 'y = 0';
  s = s.replace(/^(?:y|f\s*\(\s*x\s*\))\s*=\s*/i, '');
  s = s.replace(/\$/g, '');

  // Chuyển ký hiệu số mũ Unicode
  s = s.replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4');

  // Chuyển căn thức: √(expr) hoặc sqrt(expr)
  s = s.replace(/(?:√|sqrt)\s*\(([^()]+)\)/g, '\\sqrt{$1}');
  s = s.replace(/√([a-zA-Z0-9]+)/g, '\\sqrt{$1}');

  // Chuyển phân số: (expr1)/(expr2) -> \dfrac{expr1}{expr2}
  let prevS = '';
  while (s !== prevS && /\(([^()]+)\)\s*\/\s*\(([^()]+)\)/.test(s)) {
    prevS = s;
    s = s.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, '\\dfrac{$1}{$2}');
  }

  // Chuyển phân số đơn: a/b -> \dfrac{a}{b}
  s = s.replace(/\b(\d+|[a-zA-Z])\s*\/\s*(\d+|[a-zA-Z])\b/g, '\\dfrac{$1}{$2}');

  // Chuyển các hàm lượng giác & logarit
  s = s.replace(/\bsin\b/g, '\\sin');
  s = s.replace(/\bcos\b/g, '\\cos');
  s = s.replace(/\btan\b/g, '\\tan');
  s = s.replace(/\bcot\b/g, '\\cot');
  s = s.replace(/\bln\b/g, '\\ln');
  s = s.replace(/\blog\b/g, '\\log');
  s = s.replace(/π/g, '\\pi');

  // Trị tuyệt đối
  s = s.replace(/\|([^|]+)\|/g, '\\left|$1\\right|');

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
  const [sphereInput, setSphereInput] = useState({ a: 0, b: 0, c: 0, R: 3 }); // (x-a)^2 + (y-b)^2 + (z-c)^2 = R^2

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
    return compileMathTypeFunction(mathInput);
  }, [mathInput]);

  // Danh sách hàm số mẫu chuẩn MathType Toán 12
  const presets2d = [
    { label: 'Hàm bậc 3: y = x³ - 3x² + 2', formula: 'x^3 - 3x^2 + 2' },
    { label: 'Hàm bậc 3: y = -x³ + 3x - 1', formula: '-x^3 + 3x - 1' },
    { label: 'Hàm bậc 4: y = x⁴ - 2x² - 1', formula: 'x^4 - 2x^2 - 1' },
    { label: 'Nhất biến: y = (2x - 1) / (x + 1)', formula: '(2x - 1)/(x + 1)' },
    { label: 'Phân thức: y = (x² - x + 1) / (x - 1)', formula: '(x^2 - x + 1)/(x - 1)' },
    { label: 'Căn thức: y = √(4 - x²)', formula: '√(4 - x^2)' },
    { label: 'Lượng giác: y = 2sin(x) + 1', formula: '2sin(x) + 1' },
    { label: 'Hàm số mũ: y = e^x - 2', formula: 'e^x - 2' }
  ];

  // Chèn nhanh công thức MathType vào vị trí con trỏ
  const handleQuickInsert = (snippet: string) => {
    setMathInput((prev) => prev + snippet);
  };

  // ----------------------------------------------------
  // 1. VẼ ĐỒ THỊ HÀM SỐ 2D
  // ----------------------------------------------------
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

    // Lưới tọa độ
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

    // Trục Ox & Oy
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

    // Nhãn trục
    ctx.fillStyle = '#334155';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('x', width - 15, originY - 8);
    ctx.fillText('y', originX + 8, 15);
    ctx.fillText('O', originX - 14, originY + 16);

    // Vạch chia đơn vị
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

    // Vẽ đường cong đồ thị y = f(x)
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let isDrawing = false;
    for (let px = 0; px <= width; px += 1.5) {
      const x = (px - originX) / scale;
      const y = eval2dFunc(x);
      if (isNaN(y) || !isFinite(y) || Math.abs(y) > 100) {
        isDrawing = false;
        continue;
      }
      const py = originY - y * scale;
      if (py < -height || py > height * 2) {
        isDrawing = false;
        continue;
      }
      if (!isDrawing) {
        ctx.moveTo(px, py);
        isDrawing = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

    // Điểm rê chuột & Tọa độ M(x, y)
    if (hoverCoord) {
      const hpx = originX + hoverCoord.x * scale;
      const hpy = originY - hoverCoord.valY * scale;
      if (!isNaN(hoverCoord.valY) && hpy >= 0 && hpy <= height) {
        ctx.strokeStyle = '#a855f7';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(hpx, hpy);
        ctx.lineTo(hpx, originY);
        ctx.moveTo(hpx, hpy);
        ctx.lineTo(originX, hpy);
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

  // ----------------------------------------------------
  // 2. VẼ KHÔNG GIAN 3D OXYZ
  // ----------------------------------------------------
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

    // Lưới đáy
    ctx.strokeStyle = '#f1f5f9';
    for (let i = -5; i <= 5; i++) {
      const p1 = project(-5, 0, i);
      const p2 = project(5, 0, i);
      ctx.beginPath();
      ctx.moveTo(p1.px, p1.py);
      ctx.lineTo(p2.px, p2.py);
      ctx.stroke();
      const p3 = project(i, 0, -5);
      const p4 = project(i, 0, 5);
      ctx.beginPath();
      ctx.moveTo(p3.px, p3.py);
      ctx.lineTo(p4.px, p4.py);
      ctx.stroke();
    }

    // Các trục tọa độ
    const draw3dAxis = (from: [number, number, number], to: [number, number, number], color: string, label: string) => {
      const pFrom = project(...from);
      const pTo = project(...to);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pFrom.px, pFrom.py);
      ctx.lineTo(pTo.px, pTo.py);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.fillText(label, pTo.px + 5, pTo.py - 5);
    };

    draw3dAxis([0, 0, 0], [6, 0, 0], '#ef4444', 'Ox (Hoành)');
    draw3dAxis([0, 0, 0], [0, 6, 0], '#10b981', 'Oz (Cao)');
    draw3dAxis([0, 0, 0], [0, 0, 6], '#3b82f6', 'Oy (Tung)');

    // 1. Mặt phẳng (P)
    if (showPlane) {
      const { A, B, C, D } = planeInput;
      const pX = A !== 0 ? -D / A : 0;
      const pY = B !== 0 ? -D / B : 0;
      const pZ = C !== 0 ? -D / C : 0;
      const pt1 = project(pX, 0, 0);
      const pt2 = project(0, pZ, 0);
      const pt3 = project(0, 0, pY);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.22)';
      ctx.strokeStyle = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(pt1.px, pt1.py);
      ctx.lineTo(pt2.px, pt2.py);
      ctx.lineTo(pt3.px, pt3.py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4338ca';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText(`(P): ${A}x + ${B}y + ${C}z + ${D} = 0`, pt2.px + 6, pt2.py - 8);
    }

    // 2. Mặt cầu (S)
    if (showSphere) {
      const { a, b, c, R } = sphereInput;
      const pCenter = project(a, c, b);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.85)';
      ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
      ctx.beginPath();
      ctx.arc(pCenter.px, pCenter.py, R * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ca8a04';
      ctx.fillText(`I(${a}; ${b}; ${c}), R=${R}`, pCenter.px + 8, pCenter.py - 6);
    }

    // 3. Véc-tơ u
    if (showVector) {
      const { u1, u2, u3 } = vectorInput;
      const pO = project(0, 0, 0);
      const pV = project(u1, u3, u2);
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pO.px, pO.py);
      ctx.lineTo(pV.px, pV.py);
      ctx.stroke();
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(pV.px, pV.py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`u(${u1}; ${u2}; ${u3})`, pV.px + 8, pV.py - 6);
    }

    // 4. Hai điểm A và B
    if (showPoints) {
      const pA = project(ptA.x, ptA.z, ptA.y);
      const pB = project(ptB.x, ptB.z, ptB.y);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pA.px, pA.py);
      ctx.lineTo(pB.px, pB.py);
      ctx.stroke();
      ctx.fillStyle = '#db2777';
      ctx.beginPath();
      ctx.arc(pA.px, pA.py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`A(${ptA.x}; ${ptA.y}; ${ptA.z})`, pA.px + 8, pA.py - 6);
      ctx.beginPath();
      ctx.arc(pB.px, pB.py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`B(${ptB.x}; ${ptB.y}; ${ptB.z})`, pB.px + 8, pB.py - 6);
    }
  }, [activeTab, rotX, rotY, showPlane, planeInput, showSphere, sphereInput, showVector, vectorInput, showPoints, ptA, ptB]);

  // Sự kiện chuột 2D
  const handleMouseDown2d = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging2d.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

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

  const handleMouseUp2d = () => {
    isDragging2d.current = false;
  };

  // Sự kiện chuột 3D
  const handleMouseDown3d = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging3d.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove3d = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging3d.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setRotY((prev) => prev + dx * 0.5);
    setRotX((prev) => Math.max(-80, Math.min(80, prev - dy * 0.5)));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp3d = () => {
    isDragging3d.current = false;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>MÔ PHỎNG TRỰC QUAN TOÁN HỌC 12 • NHẬP CÔNG THỨC MATHTYPE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Phòng Thí Nghiệm Đồ Thị & Không Gian Oxyz
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl">
            Nhập trực tiếp công thức MathType trực quan (phân số, căn thức, số mũ) để khảo sát hàm số 2D và mô phỏng hình học không gian Oxyz.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/10 p-1.5 rounded-2xl flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('2d')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === '2d' ? 'bg-white text-indigo-900 shadow-md scale-102' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Đồ thị 2D (Hàm số)</span>
          </button>

          <button
            onClick={() => setActiveTab('3d')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === '3d' ? 'bg-white text-indigo-900 shadow-md scale-102' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <Rotate3d className="w-4 h-4" />
            <span>Không gian 3D (Oxyz)</span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* --- TAB 1: 2D FUNCTION GRAPH --- */}
      {/* ---------------------------------------------------- */}
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
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-600" />
                  <span>Nhập hàm số bằng MathType</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setMathInput('')}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                  title="Xóa trắng để nhập lại"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa
                </button>
              </div>

              {/* Ô gõ công thức MathType */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Gõ hoặc dán công thức MathType $y = f(x)$:
                </label>
                <input
                  type="text"
                  value={mathInput}
                  onChange={(e) => setMathInput(e.target.value)}
                  placeholder="Ví dụ: x^3 - 3x^2 + 2 hoặc (2x-1)/(x+1) hoặc √(4-x^2)"
                  className="w-full p-3 bg-slate-50 border border-indigo-200 rounded-2xl text-sm font-bold text-indigo-950 focus:bg-white focus:border-indigo-600 focus:outline-none shadow-2xs font-mono"
                />
              </div>

              {/* Khung hiển thị công thức MathType trực quan */}
              <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center min-h-[52px]">
                <div className="text-[11px] text-indigo-700 font-bold mb-0.5">Hiển thị công thức trực quan:</div>
                <div className="text-base font-serif text-indigo-950">
                  <MathRenderer content={`$$${formatMathTypeToDisplay(mathInput)}$$`} />
                </div>
              </div>

              {/* Bảng nút ký hiệu MathType trực quan */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-1.5">Bảng phím ký hiệu MathType:</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: '(a)/(b)', val: '()/()', title: 'Phân số' },
                    { label: '√x', val: '√()', title: 'Căn bậc hai' },
                    { label: 'x²', val: '^2', title: 'Bình phương' },
                    { label: 'x³', val: '^3', title: 'Lập phương' },
                    { label: 'xⁿ', val: '^()', title: 'Số mũ' },
                    { label: '|x|', val: '||', title: 'Trị tuyệt đối' },
                    { label: 'sin(x)', val: 'sin(x)', title: 'Hàm Sin' },
                    { label: 'cos(x)', val: 'cos(x)', title: 'Hàm Cos' },
                    { label: 'tan(x)', val: 'tan(x)', title: 'Hàm Tan' },
                    { label: 'ln(x)', val: 'ln(x)', title: 'Logarit tự nhiên' },
                    { label: 'eˣ', val: 'e^x', title: 'Hàm số mũ' },
                    { label: 'π', val: 'π', title: 'Số Pi' },
                    { label: '+', val: ' + ', title: 'Cộng' },
                    { label: '-', val: ' - ', title: 'Trừ' },
                    { label: '×', val: ' * ', title: 'Nhân' },
                    { label: '÷', val: ' / ', title: 'Chia' }
                  ].map((btn, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickInsert(btn.val)}
                      title={btn.title}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-900 text-slate-800 text-xs font-bold rounded-xl transition-all font-mono cursor-pointer text-center"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thư viện hàm số mẫu 12 */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-1.5">Mẫu hàm số Toán 12 thường gặp:</div>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
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
                      <span className="truncate">{p.label}</span>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${mathInput === p.formula ? 'text-white' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900">
              💡 <strong>Thuần MathType:</strong> Thầy/cô chỉ cần gõ công thức thông thường hoặc bấm các nút ký hiệu trực quan trên bàn phím, ứng dụng sẽ tự động vẽ đồ thị chính xác 100%!
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* --- TAB 2: 3D OXYZ GRAPH --- */}
      {/* ---------------------------------------------------- */}
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

          {/* Controls 3D Objects (Right 1 col) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 max-h-[580px] overflow-y-auto">
            <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Đối tượng Oxyz (Nhập trực tiếp)</span>
            </h3>

            {/* 1. Mặt phẳng (P) */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <label className="flex items-center gap-2 text-xs font-bold text-indigo-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPlane}
                  onChange={(e) => setShowPlane(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <span>Mặt phẳng $(P): Ax + By + Cz + D = 0$</span>
              </label>

              {showPlane && (
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: 'A', val: planeInput.A, key: 'A' },
                    { label: 'B', val: planeInput.B, key: 'B' },
                    { label: 'C', val: planeInput.C, key: 'C' },
                    { label: 'D', val: planeInput.D, key: 'D' }
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-[10px] font-bold text-slate-500 block text-center">{field.label}</label>
                      <input
                        type="number"
                        value={field.val}
                        onChange={(e) => setPlaneInput({ ...planeInput, [field.key]: Number(e.target.value) })}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Mặt cầu (S) */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              <label className="flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSphere}
                  onChange={(e) => setShowSphere(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <span>Mặt cầu $(S): (x-a)^2 + (y-b)^2 + (z-c)^2 = R^2$</span>
              </label>

              {showSphere && (
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { label: 'a', val: sphereInput.a, key: 'a' },
                    { label: 'b', val: sphereInput.b, key: 'b' },
                    { label: 'c', val: sphereInput.c, key: 'c' },
                    { label: 'R', val: sphereInput.R, key: 'R' }
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-[10px] font-bold text-slate-500 block text-center">{field.label}</label>
                      <input
                        type="number"
                        value={field.val}
                        onChange={(e) => setSphereInput({ ...sphereInput, [field.key]: Number(e.target.value) })}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                      />
                    </div>
                  ))}
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
                  {[
                    { label: 'u₁', val: vectorInput.u1, key: 'u1' },
                    { label: 'u₂', val: vectorInput.u2, key: 'u2' },
                    { label: 'u₃', val: vectorInput.u3, key: 'u3' }
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="text-[10px] font-bold text-slate-500 block text-center">{field.label}</label>
                      <input
                        type="number"
                        value={field.val}
                        onChange={(e) => setVectorInput({ ...vectorInput, [field.key]: Number(e.target.value) })}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                      />
                    </div>
                  ))}
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
                    {[
                      { label: 'x_A', val: ptA.x, key: 'x', obj: ptA, set: setPtA },
                      { label: 'y_A', val: ptA.y, key: 'y', obj: ptA, set: setPtA },
                      { label: 'z_A', val: ptA.z, key: 'z', obj: ptA, set: setPtA }
                    ].map((f, i) => (
                      <div key={i}>
                        <label className="text-[10px] font-bold text-slate-500 block text-center">{f.label}</label>
                        <input
                          type="number"
                          value={f.val}
                          onChange={(e) => f.set({ ...f.obj, [f.key]: Number(e.target.value) })}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { label: 'x_B', val: ptB.x, key: 'x', obj: ptB, set: setPtB },
                      { label: 'y_B', val: ptB.y, key: 'y', obj: ptB, set: setPtB },
                      { label: 'z_B', val: ptB.z, key: 'z', obj: ptB, set: setPtB }
                    ].map((f, i) => (
                      <div key={i}>
                        <label className="text-[10px] font-bold text-slate-500 block text-center">{f.label}</label>
                        <input
                          type="number"
                          value={f.val}
                          onChange={(e) => f.set({ ...f.obj, [f.key]: Number(e.target.value) })}
                          className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                        />
                      </div>
                    ))}
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
