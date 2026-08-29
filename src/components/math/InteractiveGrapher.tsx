import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  Layers,
  Sparkles,
  Rotate3d,
  Maximize2,
  RefreshCw,
  Compass,
  Sliders,
  CheckCircle2,
  TrendingUp,
  Info
} from 'lucide-react';

export const InteractiveGrapher: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('2d');

  // 2D Function State
  const [funcType, setFuncType] = useState<'cubic' | 'quartic' | 'rational1' | 'rational2'>('cubic');
  const [paramA, setParamA] = useState<number>(1);
  const [paramB, setParamB] = useState<number>(0);
  const [paramC, setParamC] = useState<number>(-3);
  const [paramD, setParamD] = useState<number>(2);

  // 3D Oxyz State (Euler Angles & Objects)
  const [rotX, setRotX] = useState<number>(25);
  const [rotY, setRotY] = useState<number>(-35);
  const [showPlane, setShowPlane] = useState(true);
  const [showSphere, setShowSphere] = useState(false);
  const [showVector, setShowVector] = useState(true);

  const canvas2dRef = useRef<HTMLCanvasElement>(null);
  const canvas3dRef = useRef<HTMLCanvasElement>(null);
  const isDragging3d = useRef(false);
  const lastMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 1. Draw 2D Function Grapher
  useEffect(() => {
    if (activeTab !== '2d') return;
    const canvas = canvas2dRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const originX = width / 2;
    const originY = height / 2;
    const scale = 40; // 40px per 1 unit

    ctx.clearRect(0, 0, width, height);

    // Background Grid
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = originX % scale; x < width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = originY % scale; y < height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Axes Ox & Oy
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    // Ox
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
    // Oy
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Arrows & Labels
    ctx.fillStyle = '#475569';
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('x', width - 15, originY - 8);
    ctx.fillText('y', originX + 8, 15);
    ctx.fillText('O', originX - 14, originY + 16);

    // Axis Tick Labels
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = '#94a3b8';
    for (let i = -8; i <= 8; i++) {
      if (i === 0) continue;
      const px = originX + i * scale;
      const py = originY - i * scale;
      if (px > 0 && px < width) ctx.fillText(`${i}`, px - 3, originY + 14);
      if (py > 0 && py < height) ctx.fillText(`${i}`, originX - 15, py + 3);
    }

    // Evaluate y = f(x)
    const evalFunc = (x: number): number => {
      if (funcType === 'cubic') {
        return paramA * Math.pow(x, 3) + paramB * Math.pow(x, 2) + paramC * x + paramD;
      }
      if (funcType === 'quartic') {
        return paramA * Math.pow(x, 4) + paramB * Math.pow(x, 2) + paramC;
      }
      if (funcType === 'rational1') {
        const denom = paramC * x + paramD;
        if (Math.abs(denom) < 0.001) return NaN;
        return (paramA * x + paramB) / denom;
      }
      // rational 2
      const denom = x - paramD;
      if (Math.abs(denom) < 0.001) return NaN;
      return (paramA * Math.pow(x, 2) + paramB * x + paramC) / denom;
    };

    // Draw Function Curve
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3;
    ctx.beginPath();

    let isDrawing = false;
    for (let px = 0; px <= width; px += 2) {
      const x = (px - originX) / scale;
      const y = evalFunc(x);

      if (isNaN(y) || Math.abs(y) > 20) {
        isDrawing = false;
        continue;
      }

      const py = originY - y * scale;
      if (!isDrawing) {
        ctx.moveTo(px, py);
        isDrawing = true;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();

  }, [activeTab, funcType, paramA, paramB, paramC, paramD]);

  // 2. Draw 3D Oxyz Coordinate Visualizer
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
    const scale = 35;

    ctx.clearRect(0, 0, width, height);

    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;

    // 3D Projection to 2D
    const project = (x: number, y: number, z: number): { px: number; py: number; depth: number } => {
      // Rotate Y
      const x1 = x * Math.cos(radY) + z * Math.sin(radY);
      const y1 = y;
      const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

      // Rotate X
      const x2 = x1;
      const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
      const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

      // Isometric projection
      return {
        px: cx + x2 * scale,
        py: cy - y2 * scale,
        depth: z2
      };
    };

    // Draw 3D Grid Plane (Oxy or Oxz)
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
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

    // Axes: Ox (Red), Oy (Green), Oz (Blue)
    const draw3dAxis = (from: [number,number,number], to: [number,number,number], color: string, label: string) => {
      const pFrom = project(...from);
      const pTo = project(...to);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pFrom.px, pFrom.py);
      ctx.lineTo(pTo.px, pTo.py);
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.fillText(label, pTo.px + 5, pTo.py - 5);
    };

    draw3dAxis([0, 0, 0], [6, 0, 0], '#ef4444', 'Ox (Trục hoành)');
    draw3dAxis([0, 0, 0], [0, 6, 0], '#10b981', 'Oz (Trục cao)');
    draw3dAxis([0, 0, 0], [0, 0, 6], '#3b82f6', 'Oy (Trục tung)');

    // Optional: Vector u(3, 4, 2)
    if (showVector) {
      const pO = project(0, 0, 0);
      const pV = project(3, 4, 2);
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pO.px, pO.py);
      ctx.lineTo(pV.px, pV.py);
      ctx.stroke();

      // Arrow head
      ctx.fillStyle = '#8b5cf6';
      ctx.beginPath();
      ctx.arc(pV.px, pV.py, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText('véc-tơ u(3; 4; 2)', pV.px + 8, pV.py - 8);
    }

    // Optional: Plane (P): x + y + z - 3 = 0
    if (showPlane) {
      const ptA = project(3, 0, 0);
      const ptB = project(0, 3, 0);
      const ptC = project(0, 0, 3);
      ctx.fillStyle = 'rgba(99, 102, 241, 0.25)';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ptA.px, ptA.py);
      ctx.lineTo(ptB.px, ptB.py);
      ctx.lineTo(ptC.px, ptC.py);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#4338ca';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillText('(P): x + y + z - 3 = 0', ptB.px + 5, ptB.py - 10);
    }

    // Optional: Sphere (S): center (0,0,0) radius 2
    if (showSphere) {
      const pC = project(0, 0, 0);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.8)';
      ctx.fillStyle = 'rgba(254, 240, 138, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pC.px, pC.py, 2 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ca8a04';
      ctx.fillText('Mặt cầu (S): x² + y² + z² = 4', pC.px + 2 * scale + 5, pC.py);
    }

  }, [activeTab, rotX, rotY, showPlane, showSphere, showVector]);

  // Handle Mouse Drag for 3D rotation
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-xs font-bold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>MÔ PHỎNG TRỰC QUAN TOÁN HỌC 12</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Phòng Thí Nghiệm Đồ Thị & Không Gian Oxyz
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-2xl">
            Trực quan hóa đồ thị hàm số và không gian 3 chiều tương tác giúp hiểu sâu bản chất cực trị, tiệm cận, mặt phẳng và vectơ.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-white/10 p-1.5 rounded-2xl flex items-center gap-1">
          <button
            onClick={() => setActiveTab('2d')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === '2d' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Đồ thị 2D (Hàm số)</span>
          </button>

          <button
            onClick={() => setActiveTab('3d')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === '3d' ? 'bg-white text-indigo-900 shadow-md' : 'text-indigo-200 hover:bg-white/10'
            }`}
          >
            <Rotate3d className="w-4 h-4" />
            <span>Không gian 3D (Oxyz)</span>
          </button>
        </div>
      </div>

      {/* --- TAB 1: 2D FUNCTION GRAPH --- */}
      {activeTab === '2d' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas View */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col items-center justify-center relative">
            <canvas
              ref={canvas2dRef}
              width={650}
              height={440}
              className="w-full max-w-[650px] aspect-4/3 rounded-2xl bg-white"
            />
            <div className="absolute bottom-4 left-6 text-xs text-slate-400">
              Hệ trục tọa độ Descartes Oxy • Tỉ lệ chuẩn 1:1
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Tùy chỉnh Hàm số</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Loại hàm số:</label>
              <select
                value={funcType}
                onChange={(e) => setFuncType(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="cubic">Bậc ba: y = ax³ + bx² + cx + d</option>
                <option value="quartic">Bậc bốn trùng phương: y = ax⁴ + bx² + c</option>
                <option value="rational1">Nhất biến: y = (ax + b) / (cx + d)</option>
                <option value="rational2">Phân thức: y = (ax² + bx + c) / (x - d)</option>
              </select>
            </div>

            {/* Sliders */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Hệ số a:</span>
                  <span className="text-indigo-600">{paramA}</span>
                </div>
                <input
                  type="range"
                  min="-4"
                  max="4"
                  step="0.5"
                  value={paramA}
                  onChange={(e) => setParamA(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Hệ số b:</span>
                  <span className="text-indigo-600">{paramB}</span>
                </div>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  step="0.5"
                  value={paramB}
                  onChange={(e) => setParamB(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Hệ số c:</span>
                  <span className="text-indigo-600">{paramC}</span>
                </div>
                <input
                  type="range"
                  min="-6"
                  max="6"
                  step="0.5"
                  value={paramC}
                  onChange={(e) => setParamC(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Hệ số d:</span>
                  <span className="text-indigo-600">{paramD}</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.5"
                  value={paramD}
                  onChange={(e) => setParamD(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-xs text-indigo-900 font-medium">
              ✨ <strong>Công thức hiện tại:</strong><br />
              {funcType === 'cubic' && `y = (${paramA})x³ + (${paramB})x² + (${paramC})x + (${paramD})`}
              {funcType === 'quartic' && `y = (${paramA})x⁴ + (${paramB})x² + (${paramC})`}
              {funcType === 'rational1' && `y = [(${paramA})x + (${paramB})] / [(${paramC})x + (${paramD})]`}
              {funcType === 'rational2' && `y = [(${paramA})x² + (${paramB})x + (${paramC})] / [x - (${paramD})]`}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: 3D OXYZ GRAPH --- */}
      {activeTab === '3d' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas 3D */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col items-center justify-center relative select-none">
            <canvas
              ref={canvas3dRef}
              width={650}
              height={440}
              onMouseDown={handleMouseDown3d}
              onMouseMove={handleMouseMove3d}
              onMouseUp={handleMouseUp3d}
              onMouseLeave={handleMouseUp3d}
              className="w-full max-w-[650px] aspect-4/3 rounded-2xl bg-white cursor-grab active:cursor-grabbing border border-slate-100"
            />
            <div className="absolute bottom-4 left-6 text-xs text-slate-500 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-indigo-600 animate-spin" />
              <span>Kéo thả chuột để xoay không gian 3D tự do</span>
            </div>
          </div>

          {/* Controls 3D */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>Đối tượng Không gian Oxyz</span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={showVector}
                  onChange={(e) => setShowVector(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
                <span>Véc-tơ chỉ phương $\vec{u}(3; 4; 2)$</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={showPlane}
                  onChange={(e) => setShowPlane(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded"
                />
                <span>Mặt phẳng $(P): x + y + z - 3 = 0$</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={showSphere}
                  onChange={(e) => setShowSphere(e.target.checked)}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <span>Mặt cầu $(S): x^2 + y^2 + z^2 = 4$</span>
              </label>
            </div>

            <button
              onClick={() => {
                setRotX(25);
                setRotY(-35);
              }}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Khôi phục góc nhìn mặc định</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InteractiveGrapher;
