import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Users,
  GraduationCap,
  FileSpreadsheet,
  Upload,
  Sparkles,
  Send,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Check,
  Award,
  Layers,
  FileText
} from 'lucide-react';
import {
  User,
  Lesson,
  Attempt,
  AttemptStatus,
  SubmitReason,
  QuestionType,
  Exam,
  AnswerPayload
} from '../../types';
import { storageService } from '../../services/storageService';
import { WordImportModal } from './WordImportModal';
import { WordPreviewModal } from './WordPreviewModal';
import { DocxParsedExam } from '../../services/docxParser';
import { MathRenderer } from '../../components/math/MathRenderer';
import { exportExamToDocx, downloadSampleWordTemplate } from '../../services/docxExporter';
import { exportToMoodleXml, exportToMoodleAiken } from '../../services/moodleExporter';
import { exportLessonToPptx } from '../../services/pptxExporter';
import { CompetencyRadarChart } from '../../components/analytics/CompetencyRadarChart';
import { FileDown, Presentation, Code2, Download } from 'lucide-react';

interface TeacherDashboardViewProps {
  currentUser: User;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'monitor' | 'essay-grading' | 'class-stats' | 'ai-tools'>('monitor');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showWordImport, setShowWordImport] = useState(false);
  const [showWordPreview, setShowWordPreview] = useState(false);
  const [parsedWordData, setParsedWordData] = useState<DocxParsedExam | null>(null);
  const [selectedTargetLesson, setSelectedTargetLesson] = useState<Lesson | null>(null);

  // Essay grading state
  const [selectedEssayAttempt, setSelectedEssayAttempt] = useState<Attempt | null>(null);
  const [essayPoints, setEssayPoints] = useState<number>(1.25);
  const [essayFeedback, setEssayFeedback] = useState<string>('');
  const [isAiGrading, setIsAiGrading] = useState(false);

  // Sync state
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Data
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [classes, setClasses] = useState(storageService.getClasses());
  const lessons = storageService.getLessons();
  const exams = storageService.getExams();

  const refreshData = () => {
    setAttempts(storageService.getAttempts());
    setClasses(storageService.getClasses());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000); // Live polling every 5s
    return () => clearInterval(interval);
  }, []);

  // Filtered Attempts
  const filteredAttempts = attempts.filter((a) => {
    if (selectedClassFilter !== 'all' && a.className !== selectedClassFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.studentName.toLowerCase().includes(q) ||
        a.lessonTitle.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const liveMonitorList = storageService.getLiveClassroomStatus().filter((s) => {
    if (selectedClassFilter !== 'all' && s.className !== selectedClassFilter) return false;
    if (searchQuery.trim()) {
      return s.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Remote Submit Single Student
  const handleRemoteSubmitStudent = (attemptId: string) => {
    const target = storageService.getAttemptById(attemptId);
    const exam = storageService.getExamById(target?.examId || '');
    if (target && exam) {
      const graded = storageService.gradeAttempt(
        {
          ...target,
          status: AttemptStatus.COMPLETED,
          submittedAt: new Date().toISOString(),
          submitReason: SubmitReason.TEACHER_REMOTE_SUBMIT
        },
        exam
      );
      storageService.saveAttempt(graded);
      storageService.logAudit('TEACHER_FORCE_SUBMIT', `GV đã nộp bài từ xa cho học sinh ${target.studentName}`);
      refreshData();
    }
  };

  // Remote Submit All in-progress
  const handleRemoteSubmitAll = () => {
    if (!confirm('Bạn có chắc chắn muốn nộp bài cho TẤT CẢ học sinh đang làm bài thi trực tuyến?')) return;
    const inProgress = attempts.filter((a) => a.status === AttemptStatus.IN_PROGRESS);
    inProgress.forEach((att) => {
      const exam = storageService.getExamById(att.examId);
      if (exam) {
        const graded = storageService.gradeAttempt(
          {
            ...att,
            status: AttemptStatus.COMPLETED,
            submittedAt: new Date().toISOString(),
            submitReason: SubmitReason.TEACHER_REMOTE_SUBMIT
          },
          exam
        );
        storageService.saveAttempt(graded);
      }
    });
    storageService.logAudit('TEACHER_BATCH_SUBMIT', `GV đã nộp bài tập trung cho ${inProgress.length} học sinh`);
    refreshData();
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    const exportData = filteredAttempts.map((a) => ({
      'Mã bài thi': a.id,
      'Họ và tên': a.studentName,
      'Lớp': a.className,
      'Bài học': a.lessonTitle,
      'Điểm tổng': a.score ?? 0,
      'Phần I (TN)': a.part1Score ?? 0,
      'Phần II (Đ/S)': a.part2Score ?? 0,
      'Phần III (TLN)': a.part3Score ?? 0,
      'Phần IV (TL)': a.part4Score ?? 0,
      'Thời gian làm (phút)': Math.round((a.timeSpentSeconds || 0) / 60),
      'Số lần vi phạm tab': a.violationCount || 0,
      'Lý do nộp': a.submitReason || 'NORMAL',
      'Ngày làm': new Date(a.startedAt).toLocaleString('vi-VN')
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'KetQuaToan12');
    XLSX.writeFile(workbook, `KetQua_Toan12_THPT_DucHoa_${Date.now()}.xlsx`);
  };

  // Google Sheets Real Sync
  const handleSyncGoogleSheets = async () => {
    const settings = storageService.getSettings();
    if (!settings.googleSheetWebhookUrl) {
      alert('Vui lòng vào tab Quản Trị Hệ Thống để nhập Google Apps Script Webhook URL.');
      return;
    }

    setIsSyncingSheets(true);
    setSyncStatusMsg('Đang gửi dữ liệu bảng điểm tới Google Sheets...');

    try {
      const payload = {
        teacherName: currentUser.fullName,
        school: 'THPT Đức Hòa',
        syncTimestamp: new Date().toISOString(),
        totalRecords: attempts.length,
        records: attempts.map((a) => ({
          studentName: a.studentName,
          className: a.className,
          lessonTitle: a.lessonTitle,
          score: a.score ?? 0,
          part1Score: a.part1Score ?? 0,
          part2Score: a.part2Score ?? 0,
          part3Score: a.part3Score ?? 0,
          part4Score: a.part4Score ?? 0,
          violations: a.violationCount || 0,
          submittedAt: a.submittedAt || a.startedAt
        }))
      };

      const response = await fetch('/api/sync/google-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetWebhookUrl: settings.googleSheetWebhookUrl,
          syncPayload: payload
        })
      });

      const data = await response.json();
      if (data.success) {
        setSyncStatusMsg('✅ Đã đồng bộ thành công sang Google Sheets!');
        setTimeout(() => setSyncStatusMsg(null), 4000);
      } else {
        setSyncStatusMsg(`❌ Thất bại: ${data.message}`);
      }
    } catch (e: any) {
      setSyncStatusMsg(`❌ Lỗi đồng bộ: ${e.message}`);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // AI Essay Grading Assistant
  const handleAiEssayAssist = async (attempt: Attempt, essayQ: any) => {
    setIsAiGrading(true);
    try {
      const response = await fetch('/api/gemini/teacher-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ASSIST_ESSAY_GRADING',
          questionData: essayQ,
          essayContent: attempt.answers[essayQ.id]?.essayText || 'Không có bài làm văn bản (Học sinh có thể đã đính kèm ảnh bài giải)'
        })
      });
      const data = await response.json();
      if (data.success && data.result) {
        setEssayFeedback(data.result);
      } else {
        setEssayFeedback(data.message || 'Chưa cấu hình API Key');
      }
    } catch (e: any) {
      setEssayFeedback(`Lỗi: ${e.message}`);
    } finally {
      setIsAiGrading(false);
    }
  };

  // Submit Essay Grade
  const handleSaveEssayGrade = (attempt: Attempt, qId: string) => {
    storageService.gradeEssay(attempt.id, qId, {
      points: Number(essayPoints),
      feedback: essayFeedback,
      gradedBy: currentUser.fullName,
      gradedAt: new Date().toISOString()
    });
    setSelectedEssayAttempt(null);
    refreshData();
  };

  // Score Distribution data for Chart
  const scoreBins = [
    { range: '< 5.0 (Yếu)', count: 0 },
    { range: '5.0 - 6.4 (TB)', count: 0 },
    { range: '6.5 - 7.9 (Khá)', count: 0 },
    { range: '8.0 - 8.9 (Giỏi)', count: 0 },
    { range: '9.0 - 10.0 (Xuất sắc)', count: 0 }
  ];

  filteredAttempts.forEach((a) => {
    const s = a.score ?? 0;
    if (s < 5.0) scoreBins[0].count++;
    else if (s < 6.5) scoreBins[1].count++;
    else if (s < 8.0) scoreBins[2].count++;
    else if (s < 9.0) scoreBins[3].count++;
    else scoreBins[4].count++;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Teacher Dashboard Header Banner */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-5 h-5 text-amber-300" />
            <span>QUẢN TRỊ GIẢNG DẠY & KHẢO THÍ TOÁN 12</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">
            Bảng Điều Khiển Giáo Viên: GV. Phan Quốc Cường
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl">
            Giám sát phòng thi trực tuyến theo thời gian thực, chấm tự luận, nhập đề Word (.docx) công thức OMML chuẩn LaTeX và xuất bảng điểm.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowWordImport(true)}
            className="px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            NHẬP ĐỀ THI TỪ WORD (.DOCX)
          </button>

          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            XUẤT BẢNG ĐIỂM (EXCEL)
          </button>

          <button
            onClick={async () => {
              setIsSyncingSheets(true);
              setSyncStatusMsg('Đang đồng bộ danh sách lớp học từ Google Sheets...');
              const res = await storageService.syncClassesFromGoogleSheet();
              setIsSyncingSheets(false);
              if (res.success) {
                setSyncStatusMsg(`✅ Đã đồng bộ ${res.count} lớp học từ Google Sheets!`);
                refreshData();
                setTimeout(() => setSyncStatusMsg(null), 4000);
              } else {
                setSyncStatusMsg(`❌ ${res.message || 'Lỗi đồng bộ'}`);
              }
            }}
            disabled={isSyncingSheets}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingSheets ? 'animate-spin' : ''}`} />
            ĐỒNG BỘ LỚP HỌC (SHEETS)
          </button>

          <button
            onClick={handleSyncGoogleSheets}
            disabled={isSyncingSheets}
            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            GỬI ĐIỂM SANG SHEETS
          </button>
        </div>
      </div>

      {syncStatusMsg && (
        <div className="p-3 bg-indigo-50 text-indigo-900 rounded-2xl border border-indigo-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          <span>{syncStatusMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'monitor' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          GIÁM SÁT THI TRỰC TIẾP ({liveMonitorList.filter((s) => s.status === 'ONLINE_ACTIVE').length} ONLINE)
        </button>

        <button
          onClick={() => setActiveTab('essay-grading')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'essay-grading' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          CHẤM TỰ LUẬN (PHẦN IV)
        </button>

        <button
          onClick={() => setActiveTab('class-stats')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'class-stats' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          THỐNG KÊ PHỔ ĐIỂM CÁC LỚP
        </button>

        <button
          onClick={() => setActiveTab('competency-radar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'competency-radar' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          5 NĂNG LỰC TOÁN 12 (RADAR)
        </button>

        <button
          onClick={() => setActiveTab('export-tools')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'export-tools' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileDown className="w-4 h-4 text-emerald-400" />
          XUẤT BẢN WORD / PPTX / MOODLE
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Lọc theo Lớp:</span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            <option value="all">Tất cả các lớp khối 12</option>
            {classes.map((c) => (
              <option key={c.id} value={c.name}>
                Lớp {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm tên học sinh hoặc bài học..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* --- TAB 1: LIVE MONITORING --- */}
      {activeTab === 'monitor' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Danh Sách Học Sinh Trong Phòng Thi
            </h3>
            <button
              onClick={handleRemoteSubmitAll}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              NỘP BÀI TẤT CẢ HỌC SINH
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Học sinh</th>
                    <th className="px-4 py-3.5">Lớp</th>
                    <th className="px-4 py-3.5">Bài thi</th>
                    <th className="px-4 py-3.5">Tiến độ làm bài</th>
                    <th className="px-4 py-3.5">Cảnh báo Tab / Vi phạm</th>
                    <th className="px-4 py-3.5">Trạng thái thi</th>
                    <th className="px-4 py-3.5 text-right">Thao tác GV</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {liveMonitorList.map((item) => (
                    <tr key={item.attemptId} className="hover:bg-slate-50/80">
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {item.studentName}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-600">
                        Lớp {item.className}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-800">
                        {item.lessonTitle}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${item.progressPercentage}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800">
                            {item.answeredCount}/{item.totalCount} ({item.progressPercentage}%)
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {item.violationsCount > 0 ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 font-black rounded-lg border border-red-200 animate-pulse flex items-center gap-1 w-fit">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {item.violationsCount} lần rời màn hình
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Nghiêm túc
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {item.status === 'ONLINE_ACTIVE' && (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full border border-emerald-200 flex items-center gap-1 w-fit">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            Đang làm bài
                          </span>
                        )}
                        {item.status === 'SUBMITTED' && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold rounded-full">
                            Đã nộp bài
                          </span>
                        )}
                        {item.status === 'AWAY_VIOLATION' && (
                          <span className="px-2.5 py-1 bg-red-100 text-red-700 font-bold rounded-full">
                            Đang rời tab
                          </span>
                        )}
                        {item.status === 'IDLE' && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 font-medium rounded-full">
                            Chờ
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {item.status !== 'SUBMITTED' && (
                          <button
                            onClick={() => handleRemoteSubmitStudent(item.attemptId)}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors"
                          >
                            Nộp bài từ xa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {liveMonitorList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Hiện chưa có học sinh nào trong phòng thi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: ESSAY GRADING QUEUE --- */}
      {activeTab === 'essay-grading' && (
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">
            Hàng Đợi Chấm Bài Tự Luận (Phần IV)
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* List of Essay submissions */}
            <div className="lg:col-span-5 space-y-3">
              {filteredAttempts.filter(a => a.status === AttemptStatus.COMPLETED).map((att) => {
                const isSelected = selectedEssayAttempt?.id === att.id;
                return (
                  <div
                    key={att.id}
                    onClick={() => {
                      setSelectedEssayAttempt(att);
                      const qId = Object.keys(att.answers).find(k => att.answers[k].type === QuestionType.ESSAY) || 'q1_16';
                      const existingGrading = att.essayGrading?.[qId];
                      if (existingGrading) {
                        setEssayPoints(existingGrading.points);
                        setEssayFeedback(existingGrading.feedback);
                      } else {
                        setEssayPoints(1.25);
                        setEssayFeedback('');
                      }
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-sm text-slate-900">{att.studentName}</strong>
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                        Lớp {att.className}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium">{att.lessonTitle}</div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{new Date(att.startedAt).toLocaleDateString('vi-VN')}</span>
                      {att.part4Status === 'GRADED' ? (
                        <span className="text-emerald-600 font-bold">Đã chấm: {att.part4Score}đ</span>
                      ) : (
                        <span className="text-orange-600 font-bold">Chưa chấm điểm</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Essay Grading Detail Panel */}
            <div className="lg:col-span-7">
              {selectedEssayAttempt ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">
                        Chấm bài tự luận: {selectedEssayAttempt.studentName}
                      </h4>
                      <p className="text-xs text-slate-500">Lớp {selectedEssayAttempt.className} • {selectedEssayAttempt.lessonTitle}</p>
                    </div>

                    <button
                      onClick={() => {
                        const exam = exams.find(e => e.id === selectedEssayAttempt.examId);
                        const essayQ = exam?.questions.find(q => q.part === 4);
                        if (essayQ) handleAiEssayAssist(selectedEssayAttempt, essayQ);
                      }}
                      disabled={isAiGrading}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl border border-purple-200 flex items-center gap-1.5 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>{isAiGrading ? 'AI đang phân tích...' : '✨ Gợi ý điểm & nhận xét bằng AI'}</span>
                    </button>
                  </div>

                  {/* Student Answer Presentation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Bài làm tự luận của học sinh:
                    </label>
                    {(() => {
                      const essayEntry = (Object.values(selectedEssayAttempt.answers) as AnswerPayload[]).find(a => a.type === QuestionType.ESSAY);
                      return (
                        <div className="space-y-3">
                          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-900 font-mono whitespace-pre-wrap leading-relaxed">
                            {essayEntry?.essayText || '(Học sinh không gõ văn bản)'}
                          </div>

                          {essayEntry?.essayFiles && essayEntry.essayFiles.length > 0 && (
                            <div>
                              <div className="text-xs font-bold text-slate-700 mb-1.5">Ảnh bài làm đính kèm:</div>
                              <div className="grid grid-cols-2 gap-2">
                                {essayEntry.essayFiles.map((f, i) => (
                                  <a key={i} href={f.url} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-slate-200 hover:opacity-90">
                                    <img src={f.url} alt={f.name} className="h-36 w-full object-cover" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Grading Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Điểm số tự luận (Tối đa 1.5đ):
                      </label>
                      <input
                        type="number"
                        step={0.25}
                        min={0}
                        max={1.5}
                        value={essayPoints}
                        onChange={(e) => setEssayPoints(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-indigo-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nhận xét của Giáo viên:
                    </label>
                    <textarea
                      rows={3}
                      value={essayFeedback}
                      onChange={(e) => setEssayFeedback(e.target.value)}
                      placeholder="Góp ý các bước giải cho học sinh..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const qId = Object.keys(selectedEssayAttempt.answers).find(k => selectedEssayAttempt.answers[k].type === QuestionType.ESSAY) || 'q1_16';
                      handleSaveEssayGrade(selectedEssayAttempt, qId);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    LƯU ĐIỂM & GỬI KẾT QUẢ CHO HỌC SINH
                  </button>
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex items-center justify-center bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
                  Chọn một bài thi của học sinh bên trái để xem nội dung tự luận và chấm điểm.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 3: CLASS STATISTICS & SCORE DISTRIBUTION --- */}
      {activeTab === 'class-stats' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center justify-between">
              <span>Phổ Điểm Toàn Khối 12 ({filteredAttempts.length} lượt thi)</span>
              <span className="text-xs text-slate-500 font-medium">Lớp: {selectedClassFilter === 'all' ? 'Tất cả' : selectedClassFilter}</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreBins} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" name="Số học sinh" fill="#4f46e5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 4: 5-PILLAR COMPETENCY RADAR --- */}
      {activeTab === 'competency-radar' && (
        <div className="space-y-6">
          <CompetencyRadarChart attempts={filteredAttempts} />
        </div>
      )}

      {/* --- TAB 5: EXPORT TOOLS HUB (WORD, PPTX, MOODLE) --- */}
      {activeTab === 'export-tools' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                  <FileDown className="w-4 h-4" />
                  <span>TRUNG TÂM XUẤT BẢN TÀI LIỆU & BÀI GIẢNG TOÁN 12</span>
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  Xuất Đề Thi Word, Slide PowerPoint & LMS Moodle
                </h3>
                <p className="text-xs text-slate-500">
                  Tải về đề thi định dạng chuẩn Microsoft Word, Slide trình chiếu bài giảng, hoặc tệp nhập trực tiếp vào hệ thống LMS Moodle/Azota.
                </p>
              </div>

              <button
                type="button"
                onClick={downloadSampleWordTemplate}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Tải File Word Mẫu Chuẩn (.doc/.docx)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.map((lesson) => {
              const exam = exams.find(e => e.lessonId === lesson.id || e.id === lesson.examId);
              return (
                <div key={lesson.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700 mb-1">
                      <span>BÀI {lesson.number} • HK{lesson.semester}</span>
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-[10px]">
                        {exam ? `v${exam.currentVersion} (${exam.questions.length} câu)` : 'Chưa có đề'}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                      {lesson.title}
                    </h4>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200 text-[11px]">
                    {exam ? (
                      <>
                        <button
                          onClick={() => exportExamToDocx(exam, lesson)}
                          className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>Xuất Đề Word (.doc/.docx)</span>
                        </button>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => exportToMoodleXml(exam, lesson)}
                            className="py-1.5 px-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1 text-[10px]"
                            title="Xuất định dạng Moodle XML"
                          >
                            <Code2 className="w-3 h-3" />
                            <span>Moodle XML</span>
                          </button>

                          <button
                            onClick={() => exportToMoodleAiken(exam)}
                            className="py-1.5 px-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1 text-[10px]"
                            title="Xuất định dạng Aiken Text"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Aiken TXT</span>
                          </button>
                        </div>

                        <button
                          onClick={() => exportLessonToPptx(lesson, exam)}
                          className="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Presentation className="w-3.5 h-3.5" />
                          <span>Xuất Slide Bài Giảng (.pptx)</span>
                        </button>
                      </>
                    ) : (
                      <div className="text-center py-2 text-slate-400 text-xs italic">
                        Cần nạp đề thi trước khi xuất
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals for Word Import and Preview */}
      <WordImportModal
        isOpen={showWordImport}
        onClose={() => setShowWordImport(false)}
        onPreviewParsed={(parsed, lesson) => {
          setParsedWordData(parsed);
          setSelectedTargetLesson(lesson);
          setShowWordImport(false);
          setShowWordPreview(true);
        }}
      />

      {selectedTargetLesson && (
        <WordPreviewModal
          isOpen={showWordPreview}
          onClose={() => setShowWordPreview(false)}
          parsedData={parsedWordData}
          lesson={selectedTargetLesson}
          onPublished={(exam) => {
            setShowWordPreview(false);
            refreshData();
            alert(`Đã xuất bản thành công Đề thi phiên bản v${exam.currentVersion} cho bài: ${selectedTargetLesson.title}!`);
          }}
        />
      )}
    </div>
  );
};

export default TeacherDashboardView;
