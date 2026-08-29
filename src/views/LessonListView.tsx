import React, { useState, useMemo } from 'react';
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
  Layers
} from 'lucide-react';
import { Lesson, User, Attempt, AttemptStatus, QuestionType, Exam } from '../types';
import { storageService } from '../services/storageService';
import { DocxParsedExam } from '../services/docxParser';
import { LessonExamUploadModal } from '../components/exam/LessonExamUploadModal';
import { WordPreviewModal } from './teacher/WordPreviewModal';

interface LessonListViewProps {
  currentUser: User;
  onStartExam: (lesson: Lesson, resumeAttemptId?: string) => void;
}

export const LessonListView: React.FC<LessonListViewProps> = ({
  currentUser,
  onStartExam
}) => {
  const [semesterFilter, setSemesterFilter] = useState<'all' | 1 | 2>('all');
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload & Preview Modals state
  const [uploadModalLesson, setUploadModalLesson] = useState<Lesson | null>(null);
  const [previewParsedData, setPreviewParsedData] = useState<DocxParsedExam | null>(null);
  const [previewTargetLesson, setPreviewTargetLesson] = useState<Lesson | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const [exams, setExams] = useState<Exam[]>(storageService.getExams());
  const lessons = storageService.getLessons().filter(l => !l.isHidden);
  const chapters = storageService.getChapters();
  const studentAttempts = storageService.getAttemptsByStudent(currentUser.id);

  const refreshExams = () => {
    setExams(storageService.getExams());
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

    lessons.forEach((lesson) => {
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
  }, [lessons, studentAttempts]);

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
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
  }, [lessons, semesterFilter, selectedChapter, searchQuery]);

  return (
    <div className="space-y-6">
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
            Tất cả (19 bài)
          </button>
          <button
            onClick={() => setSemesterFilter(1)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              semesterFilter === 1
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HỌC KÌ I (Bài 1 - 10)
          </button>
          <button
            onClick={() => setSemesterFilter(2)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              semesterFilter === 2
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HỌC KÌ II (Bài 11 - 19)
          </button>
        </div>

        {/* Chapter dropdown & Search input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative">
            <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="pl-9 pr-8 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 w-full sm:w-48"
            >
              <option value="all">Tất cả các chương</option>
              {chapters.map((ch) => (
                <option key={ch.number} value={ch.number}>
                  Chương {ch.number}: {ch.title.substring(0, 30)}...
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

                {/* Upload & Update Exam Button directly on card */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadModalLesson(lesson);
                  }}
                  title="Upload đề thi (Word .docx, JSON hoặc Tạo bằng AI) cho bài học này"
                  className="py-2 px-3 rounded-xl bg-white hover:bg-indigo-50 text-indigo-700 hover:text-indigo-800 border border-slate-200 hover:border-indigo-300 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Nạp đề</span>
                </button>
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
