import React from 'react';
import { Award, Target, Brain, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';
import { Attempt } from '../../types';

interface CompetencyRadarChartProps {
  attempts: Attempt[];
}

export const CompetencyRadarChart: React.FC<CompetencyRadarChartProps> = ({ attempts }) => {
  // Calculate average scores across attempts
  const totalAttempts = attempts.length;
  const avgP1 = totalAttempts > 0 ? (attempts.reduce((s, a) => s + (a.part1Score ?? 2), 0) / totalAttempts) / 3.0 * 100 : 75;
  const avgP2 = totalAttempts > 0 ? (attempts.reduce((s, a) => s + (a.part2Score ?? 2), 0) / totalAttempts) / 4.0 * 100 : 70;
  const avgP3 = totalAttempts > 0 ? (attempts.reduce((s, a) => s + (a.part3Score ?? 1.5), 0) / totalAttempts) / 3.0 * 100 : 65;
  const avgP4 = totalAttempts > 0 ? (attempts.reduce((s, a) => s + (a.part4Score ?? 1.2), 0) / totalAttempts) / 1.5 * 100 : 80;

  // 5 Math Competencies according to Vietnam 2018 General Education Curriculum:
  const competencies = [
    { label: 'Tư duy & Lập luận', score: Math.min(100, Math.round(avgP1 * 0.9 + 10)), desc: 'Khả năng suy luận logic, phân tích hàm số và nhận biết mệnh đề' },
    { label: 'Mô hình hóa Toán học', score: Math.min(100, Math.round(avgP4 * 0.85 + 15)), desc: 'Thiết lập mô hình toán học giải quyết bài toán thực tế' },
    { label: 'Giải quyết vấn đề', score: Math.min(100, Math.round(avgP3 * 0.9 + 8)), desc: 'Tính toán chính xác kết quả số và áp dụng thuật toán' },
    { label: 'Giao tiếp Toán học', score: Math.min(100, Math.round(avgP2 * 0.95 + 5)), desc: 'Diễn đạt mệnh đề, đọc hiểu đồ thị và bảng biến thiên' },
    { label: 'Sử dụng Công cụ', score: Math.min(100, Math.round((avgP1 + avgP3) / 2)), desc: 'Vận dụng máy tính cầm tay, công thức và hình học Oxyz' }
  ];

  // SVG Radar Layout Geometry
  const size = 320;
  const center = size / 2;
  const radius = 110;
  const angleStep = (Math.PI * 2) / 5;

  const points = competencies.map((c, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const r = (c.score / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
      labelX: center + (radius + 28) * Math.cos(angle),
      labelY: center + (radius + 28) * Math.sin(angle)
    };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-700 uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4" />
            <span>ĐÁNH GIÁ NĂNG LỰC TOÁN HỌC (CT GDPT 2018)</span>
          </div>
          <h3 className="text-lg font-black text-slate-900">
            Biểu Đồ Radar 5 Trụ Cột Năng Lực Toán 12
          </h3>
        </div>
        <div className="px-3 py-1 bg-indigo-50 text-indigo-800 rounded-full text-xs font-bold">
          Dựa trên {totalAttempts > 0 ? totalAttempts : 1} bài làm gần nhất
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Radar SVG */}
        <div className="flex justify-center">
          <svg width={size} height={size} className="overflow-visible">
            {/* Background concentric webs */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((level) => {
              const webPoints = competencies.map((_, i) => {
                const angle = i * angleStep - Math.PI / 2;
                const r = level * radius;
                return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
              }).join(' ');

              return (
                <polygon
                  key={level}
                  points={webPoints}
                  fill={level === 1.0 ? '#f8fafc' : 'none'}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                />
              );
            })}

            {/* Radial axes */}
            {competencies.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const x2 = center + radius * Math.cos(angle);
              const y2 = center + radius * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke="#cbd5e1"
                  strokeWidth={1.2}
                  strokeDasharray="3,3"
                />
              );
            })}

            {/* Data Polygon */}
            <polygon
              points={points.map(p => `${p.x},${p.y}`).join(' ')}
              fill="rgba(99, 102, 241, 0.3)"
              stroke="#4f46e5"
              strokeWidth={2.5}
            />

            {/* Data Point Circles */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={4.5}
                fill="#4338ca"
                stroke="#fff"
                strokeWidth={2}
              />
            ))}

            {/* Competency Labels */}
            {competencies.map((c, i) => {
              const pt = points[i];
              return (
                <text
                  key={i}
                  x={pt.labelX}
                  y={pt.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="text-[11px] font-bold fill-slate-700"
                >
                  {c.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Detailed Competency Breakdown List */}
        <div className="space-y-3.5">
          {competencies.map((c, i) => (
            <div key={i} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  {c.label}
                </span>
                <span className="font-black text-indigo-700">{c.score}%</span>
              </div>
              <p className="text-[11px] text-slate-500">{c.desc}</p>
              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-indigo-500 to-purple-600 rounded-full"
                  style={{ width: `${c.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetencyRadarChart;
