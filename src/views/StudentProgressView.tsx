import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  TrendingUp,
  Award,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Layers,
  Target
} from 'lucide-react';
import { User, AttemptStatus } from '../types';
import { storageService } from '../services/storageService';
import { CompetencyRadarChart } from '../components/analytics/CompetencyRadarChart';

interface StudentProgressViewProps {
  currentUser: User;
}

export const StudentProgressView: React.FC<StudentProgressViewProps> = ({
  currentUser
}) => {
  const attempts = storageService.getAttemptsByStudent(currentUser.id);
  const lessons = storageService.getLessons();
  const progress = storageService.getStudentProgress(currentUser.id);
  const chapters = storageService.getChapters();

  // 1. Time-series score data for LineChart
  const scoreHistoryData = attempts
    .filter((a) => a.score !== undefined)
    .map((a, idx) => ({
      index: `Lần ${idx + 1}`,
      lesson: a.lessonTitle.substring(0, 15) + '...',
      score: a.score,
      part1: a.part1Score,
      part2: a.part2Score,
      part3: a.part3Score,
      part4: a.part4Score
    }));

  // 2. Chapter performance for BarChart
  const chapterPerformanceData = chapters.map((ch) => {
    const chapterLessonIds = new Set(ch.lessons.map((l) => l.id));
    const chAttempts = attempts.filter((a) => chapterLessonIds.has(a.lessonId) && a.score !== undefined);
    const avgScore = chAttempts.length > 0
      ? chAttempts.reduce((acc, curr) => acc + (curr.score || 0), 0) / chAttempts.length
      : 0;

    return {
      name: `Chương ${ch.number}`,
      fullName: ch.title,
      avgScore: Math.round(avgScore * 10) / 10,
      attemptsCount: chAttempts.length
    };
  });

  // 3. Question Type Competency for Radar Chart
  let totalP1 = 0, totalP2 = 0, totalP3 = 0, totalP4 = 0;
  let countP1 = 0, countP2 = 0, countP3 = 0, countP4 = 0;

  attempts.forEach((a) => {
    if (a.part1Score !== undefined) { totalP1 += (a.part1Score / 2.5) * 100; countP1++; }
    if (a.part2Score !== undefined) { totalP2 += (a.part2Score / 2.0) * 100; countP2++; }
    if (a.part3Score !== undefined) { totalP3 += (a.part3Score / 1.5) * 100; countP3++; }
    if (a.part4Score !== undefined) { totalP4 += (a.part4Score / 1.5) * 100; countP4++; }
  });

  const radarCompetencyData = [
    { subject: 'Trắc nghiệm 4 LC', score: countP1 ? Math.min(100, Math.round(totalP1 / countP1)) : 80 },
    { subject: 'Đúng / Sai', score: countP2 ? Math.min(100, Math.round(totalP2 / countP2)) : 75 },
    { subject: 'Trả lời ngắn', score: countP3 ? Math.min(100, Math.round(totalP3 / countP3)) : 70 },
    { subject: 'Tự luận thực tế', score: countP4 ? Math.min(100, Math.round(totalP4 / countP4)) : 85 }
  ];

  // 4. Pie data for lesson completion
  const pieData = [
    { name: 'Đã hoàn thành', value: progress.completedLessons, color: '#10b981' },
    { name: 'Đang làm dở', value: progress.inProgressLessons, color: '#f59e0b' },
    { name: 'Chưa làm', value: progress.notStartedLessons, color: '#94a3b8' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
          <TrendingUp className="w-4 h-4" />
          <span>PHÂN TÍCH NĂNG LỰC TOÁN 12 TOÀN DIỆN</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Tiến Trình & Biểu Đồ Năng Lực Học Tập
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi sát sao độ tiến bộ điểm số qua từng lần thi, phổ điểm từng chương và độ thành thạo 4 dạng câu hỏi.
        </p>
      </div>

      {/* Row 1: Charts (Line & Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score History Line Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center justify-between">
            <span>📈 Tiến trình điểm số qua các lần làm bài</span>
            <span className="text-xs font-bold text-indigo-600">{attempts.length} lần</span>
          </h3>
          <div className="h-64 w-full">
            {scoreHistoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreHistoryData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="index" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="Điểm số"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ fill: '#4f46e5', r: 5 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Chưa có dữ liệu làm bài để vẽ biểu đồ
              </div>
            )}
          </div>
        </div>

        {/* Chapter Performance Bar Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center justify-between">
            <span>📊 Điểm trung bình theo từng Chương</span>
            <span className="text-xs font-bold text-slate-500">Thang điểm 10</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chapterPerformanceData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="avgScore" name="Điểm TB" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Radar & Lesson Completion Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competency Radar */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-extrabold text-slate-800 mb-4 flex items-center justify-between">
            <span>🎯 Độ thành thạo theo 4 Dạng câu hỏi (%)</span>
            <span className="text-xs font-bold text-indigo-600">Độ chuẩn xác</span>
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarCompetencyData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar name="Năng lực" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lesson Completion Pie */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-extrabold text-slate-800 mb-2">
            📚 Tỉ lệ hoàn thành 19 Bài học Toán 12
          </h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Đã hoàn thành ({progress.completedLessons})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Đang làm ({progress.inProgressLessons})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <span>Chưa làm ({progress.notStartedLessons})</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Pillar Competency Radar Chart (CT GDPT 2018) */}
      <CompetencyRadarChart attempts={attempts} />
    </div>
  );
};

export default StudentProgressView;
