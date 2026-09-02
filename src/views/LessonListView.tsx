import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Play,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  Award,
  ChevronRight,
  BookOpen,
  Upload,
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Lesson, User, UserRole, Attempt, AttemptStatus, QuestionType, Exam, CoreKnowledge } from '../types';
import { storageService } from '../services/storageService';
import { DocxParsedExam } from '../services/docxParser';
import { LessonExamUploadModal } from '../components/exam/LessonExamUploadModal';
import { WordPreviewModal } from './teacher/WordPreviewModal';
import { LessonKnowledgeModal } from '../components/knowledge/LessonKnowledgeModal';

interface LessonListViewProps {
  currentUser: User;
  onStartExam: (lesson: Lesson, resumeAttemptId?: string) => void;
}

export const LessonListView: React.FC<LessonListViewProps> = ({
  currentUser,
  onStartExam
}) => {
  const [selectedGrade, setSelectedGrade] = useState<10 | 11 | 12>(storageService.getSelectedGrade());
  const [semesterFilter, setSemesterFilter] = useState<'all' | 1 | 2>('all');
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Knowledge Modal State
  const [knowledgeModalLesson, setKnowledgeModalLesson] = useState<Lesson | null>(null);

  // Upload & Preview Modals state
  const [uploadModalLesson, setUploadModalLesson] = useState<Lesson | null>(null);
  const [previewParsedData, setPreviewParsedData] = useState<DocxParsedExam | null>(null);
  const [previewTargetLesson, setPreviewTargetLesson] = useState<Lesson | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const isTeacherOrAdmin = Boolean(
    currentUser && (
      currentUser.role === UserRole.TEACHER ||
      currentUser.role === UserRole.ADMIN ||
      String(currentUser.role) === 'TEACHER' ||
      String(currentUser.role) === 'ADMIN'
    )
  );

  const [exams, setExams] = useState<Exam[]>(storageService.getExams());
  
  // Lessons and Chapters based on selectedGrade
  const allGradeLessons = useMemo(() => {
    return storageService.getLessons(selectedGrade).filter(l => !l.isHidden);
  }, [selectedGrade]);

  const chapters = useMemo(() => {
    return storageService.getChapters(selectedGrade);
  }, [selectedGrade]);

  const studentAttempts = storageService.getAttemptsByStudent(currentUser.id);

  const refreshExams = () => {
    setExams(storageService.getExams());
  };

  const handleGradeChange = (grade: 10 | 11 | 12) => {
    setSelectedGrade(grade);
    storageService.setSelectedGrade(grade);
    setSelectedChapter('all');
    setSemesterFilter('all');
    setSearchQuery('');
  };

  // Group attempts by lesson
  const lessonStatsMap = useMemo(() => {
    const map = new Map<string, {
      status: AttemptStatus;
      highestScore?: number;
      attemptCount: number;
      lastAttemptDate?: string;
      inProgressAttempt?: Attempt;
      progressPercentage: number;
    }>();

    allGradeLessons.forEach((lesson) => {
      const attempts = studentAttempts.filter(a => a.lessonId === lesson.id);
      const inProgress = attempts.find(a => a.status === AttemptStatus.IN_PROGRESS);
      const completed = attempts.filter(a => a.status === AttemptStatus.COMPLETED);

      let status = AttemptStatus.NOT_STARTED;
      let highestScore: number | undefined = undefined;
      let progressPercentage = 0;

      if (inProgress) {
        status = AttemptStatus.IN_PROGRESS;
        progressPercentage = inProgress.progressPercentage || 0;
      } else if (completed.length > 0) {
        status = AttemptStatus.COMPLETED;
        progressPercentage = 100;
        const scores = completed.map(c => c.score ?? 0);
        highestScore = Math.max(...scores);
      }

      const lastAttempt = attempts.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())[0];

      map.set(lesson.id, {
        status,
        highestScore,
        attemptCount: attempts.length,
        lastAttemptDate: lastAttempt ? new Date(lastAttempt.startedAt).toLocaleDateString('vi-VN') : undefined,
        inProgressAttempt: inProgress,
        progressPercentage
      });
    });

    return map;
  }, [allGradeLessons, studentAttempts]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return allGradeLessons.filter((lesson) => {
      if (semesterFilter !== 'all' && lesson.semester !== semesterFilter) {
        return false;
      }
      if (selectedChapter !== 'all' && lesson.chapterNumber !== selectedChapter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = lesson.title.toLowerCase().includes(q);
        const matchesChapter = lesson.chapterTitle.toLowerCase().includes(q);
        const matchesNumber = `bài ${lesson.number}`.includes(q) || `${lesson.number}` === q;
        if (!matchesTitle && !matchesChapter && !matchesNumber) return false;
      }
      return true;
    });
  }, [allGradeLessons, semesterFilter, selectedChapter, searchQuery]);

  const sem1Count = allGradeLessons.filter(l => l.semester === 1).length;
  const sem2Count = allGradeLessons.filter(l => l.semester === 2).length;

  return (
    <div className="space-y-6">
      
      {/* GRADE SELECTOR BANNER */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-36 h-36 bg-yellow-400/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-yellow-400 text-slate-900 uppercase tracking-wide">
                Chương trình GDPT 2018
              </span>
              <span className="text-xs text-blue-200 font-medium">Toán THPT (Kết nối tri thức & Bộ GD&ĐT)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              <span>Hệ Thống Tự Luyện & Kiến Thức Toán THPT</span>
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
              Chọn khối lớp bên phải để xem toàn bộ danh mục bài học, tra cứu <strong>Kiến thức trọng tâm</strong> và luyện tập đề thi 4 phần chuẩn cấu trúc.
            </p>
          </div>

          {/* Grade Switcher Tabs */}
          <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-2xl backdrop-blur-md border border-white/20 self-stretch sm:self-auto justify-center">
            <button
              onClick={() => handleGradeChange(10)}
              className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 ${
                selectedGrade === 10
                  ? 'bg-white text-blue-900 shadow-lg scale-105'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Khối 10</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedGrade === 10 ? 'bg-blue-100 text-blue-800' : 'bg-white/20 text-white'
              }`}>27 bài</span>
            </button>

            <button
              onClick={() => handleGradeChange(11)}
              className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 ${
                selectedGrade === 11
                  ? 'bg-white text-indigo-900 shadow-lg scale-105'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Khối 11</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedGrade === 11 ? 'bg-indigo-100 text-indigo-800' : 'bg-white/20 text-white'
              }`}>31 bài</span>
            </button>

            <button
              onClick={() => handleGradeChange(12)}
              className={`px-4 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center gap-2 ${
                selectedGrade === 12
                  ? 'bg-white text-purple-900 shadow-lg scale-105'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Khối 12</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                selectedGrade === 12 ? 'bg-purple-100 text-purple-800' : 'bg-white/20 text-white'
              }`}>19 bài</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Semester Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setSemesterFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              semesterFilter === 'all'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả Khối {selectedGrade} ({allGradeLessons.length} bài)
          </button>
          <button
            onClick={() => setSemesterFilter(1)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              semesterFilter === 1
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HỌC KÌ I ({sem1Count} bài)
          </button>
          <button
            onClick={() => setSemesterFilter(2)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              semesterFilter === 2
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HỌC KÌ II ({sem2Count} bài)
          </button>
        </div>

        {/* Chapter dropdown & Search input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-full sm:w-56"
            >
              <option value="all">Tất cả {chapters.length} chương (Khối {selectedGrade})</option>
              {chapters.map((ch) => (
                <option key={ch.number} value={ch.number}>
                  Chương {ch.number}: {ch.title.substring(0, 28)}...
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên bài học hoặc chương..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {notificationMsg && (
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{notificationMsg}</span>
          </div>
          <button
            onClick={() => setNotificationMsg(null)}
            className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-lg"
          >
            &times;
          </button>
        </div>
      )}

      {/* 3-Column Responsive Lesson Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredLessons.map((lesson) => {
          const stats = lessonStatsMap.get(lesson.id) || {
            status: AttemptStatus.NOT_STARTED,
            attemptCount: 0,
            progressPercentage: 0
          };

          const exam = exams.find(e => e.lessonId === lesson.id || e.id === lesson.examId);
          const questions = exam?.questions || [];

          const mcqCount = questions.filter(q => q.part === 1).length || 10;
          const tfCount = questions.filter(q => q.part === 2).length || 2;
          const saCount = questions.filter(q => q.part === 3).length || 3;
          const essayCount = questions.filter(q => q.part === 4).length || 1;

          return (
            <div
              key={lesson.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header & Chapter Badge */}
              <div className="p-5 pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      BÀI {lesson.number} • HK{lesson.semester}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200/70" title={`Phiên bản đề thi: v${exam?.currentVersion || 1}`}>
                      v{exam?.currentVersion || 1}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {stats.status === AttemptStatus.COMPLETED && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      ĐÃ HOÀN THÀNH
                    </span>
                  )}
                  {stats.status === AttemptStatus.IN_PROGRESS && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200 animate-pulse">
                      <Clock className="w-3 h-3 text-orange-600" />
                      Đang làm dở – {Math.round(stats.progressPercentage)}%
                    </span>
                  )}
                  {stats.status === AttemptStatus.NOT_STARTED && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                      CHƯA LÀM
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2 min-h-[44px]">
                  {lesson.title}
                </h3>

                <div className="text-[11px] text-slate-500 font-medium mt-1 line-clamp-1">
                  Chương {lesson.chapterNumber}: {lesson.chapterTitle}
                </div>

                {/* Question Breakdown Pills */}
                <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-4 gap-1 text-center text-[10px]">
                  <div className="bg-slate-50 p-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">Trắc nghiệm</span>
                    <strong className="text-slate-800 text-xs">{mcqCount}</strong> câu
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">Đúng/Sai</span>
                    <strong className="text-slate-800 text-xs">{tfCount}</strong> câu
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">Trả lời ngắn</span>
                    <strong className="text-slate-800 text-xs">{saCount}</strong> câu
                  </div>
                  <div className="bg-slate-50 p-1.5 rounded-lg">
                    <span className="text-slate-400 block text-[9px]">Tự luận</span>
                    <strong className="text-slate-800 text-xs">{essayCount}</strong> câu
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-400 font-medium">Tiến độ bài học</span>
                    <span className="font-bold text-slate-700">{Math.round(stats.progressPercentage)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        stats.status === AttemptStatus.COMPLETED
                          ? 'bg-emerald-500'
                          : stats.status === AttemptStatus.IN_PROGRESS
                          ? 'bg-orange-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${stats.progressPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Statistics Footer Info */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    <span>Điểm cao nhất: <strong>{stats.highestScore !== undefined ? `${stats.highestScore}/10` : '--'}</strong></span>
                  </div>
                  <div>
                    {stats.attemptCount > 0 ? `${stats.attemptCount} lần làm` : 'Chưa làm lần nào'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
                {/* 1. View Core Knowledge Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setKnowledgeModalLesson(lesson);
                  }}
                  title="Xem tóm tắt lý thuyết, công thức cốt lõi và phương pháp giải"
                  className="py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 border border-purple-200 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  <span>Kiến thức</span>
                </button>

                {/* 2. Practice Exam Button */}
                {stats.status === AttemptStatus.IN_PROGRESS ? (
                  <button
                    onClick={() => onStartExam(lesson, stats.inProgressAttempt?.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>TIẾP TỤC</span>
                  </button>
                ) : stats.status === AttemptStatus.COMPLETED ? (
                  <button
                    onClick={() => onStartExam(lesson)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>LÀM LẠI</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onStartExam(lesson)}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>LUYỆN TẬP</span>
                  </button>
                )}

                {/* 3. Upload & Update Exam Button directly on card - ONLY FOR TEACHER & ADMIN */}
                {isTeacherOrAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadModalLesson(lesson);
                    }}
                    title="Upload đề thi mới (Word .docx, JSON hoặc Tạo bằng AI) - Không giới hạn số lượng đề"
                    className="py-2 px-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Nạp đề</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredLessons.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">Không tìm thấy bài học phù hợp</h4>
          <p className="text-xs text-slate-500 mt-1">Vui lòng thử đổi từ khóa tìm kiếm hoặc lọc theo chương khác.</p>
        </div>
      )}

      {/* MODAL 0: Lesson Knowledge Modal */}
      {knowledgeModalLesson && (
        <LessonKnowledgeModal
          isOpen={!!knowledgeModalLesson}
          lesson={knowledgeModalLesson}
          onClose={() => setKnowledgeModalLesson(null)}
          currentUser={currentUser}
          onSave={(lessonId, knowledge) => {
            storageService.saveLessonKnowledge(lessonId, knowledge);
            setNotificationMsg(`✅ Đã cập nhật kiến thức trọng tâm cho Bài ${knowledgeModalLesson.number}: ${knowledgeModalLesson.title}!`);
            setTimeout(() => setNotificationMsg(null), 5000);
          }}
          onStartExam={(lesson) => {
            setKnowledgeModalLesson(null);
            onStartExam(lesson);
          }}
        />
      )}

      {/* MODAL 1: Lesson Exam Upload (Word .docx, JSON, AI) */}
      {uploadModalLesson && (
        <LessonExamUploadModal
          isOpen={!!uploadModalLesson}
          onClose={() => setUploadModalLesson(null)}
          lesson={uploadModalLesson}
          onPreviewParsed={(parsed, lesson) => {
            setUploadModalLesson(null);
            setPreviewParsedData(parsed);
            setPreviewTargetLesson(lesson);
          }}
        />
      )}

      {/* MODAL 2: Word / Exam Preview & Publishing */}
      {previewParsedData && previewTargetLesson && (
        <WordPreviewModal
          isOpen={!!previewParsedData}
          onClose={() => {
            setPreviewParsedData(null);
            setPreviewTargetLesson(null);
          }}
          parsedData={previewParsedData}
          lesson={previewTargetLesson}
          onPublished={(newExam) => {
            setPreviewParsedData(null);
            setPreviewTargetLesson(null);
            refreshExams();
            setNotificationMsg(`✅ Đã xuất bản thành công phiên bản đề thi mới (v${newExam.currentVersion} - ${newExam.questions.length} câu) cho Bài ${previewTargetLesson.number}: ${previewTargetLesson.title}!`);
            setTimeout(() => setNotificationMsg(null), 6000);
          }}
        />
      )}
    </div>
  );
};

export default LessonListView;
