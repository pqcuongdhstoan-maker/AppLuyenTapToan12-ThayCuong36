import React, { useState, useEffect } from 'react';
import { User, UserRole, Lesson, Attempt } from './types';
import { storageService } from './services/storageService';
import { Header } from './components/header/Header';
import { HeroBanner } from './components/hero/HeroBanner';
import { StudentInfoModal } from './components/student/StudentInfoModal';
import { LessonListView } from './views/LessonListView';
import { MockExamsView } from './views/MockExamsView';
import { ExamTakingView } from './views/ExamTakingView';
import { ExamResultView } from './views/ExamResultView';
import { StudentResultsView } from './views/StudentResultsView';
import { StudentProgressView } from './views/StudentProgressView';
import { AIAssistantView } from './views/AIAssistantView';
import { TeacherDashboardView } from './views/teacher/TeacherDashboardView';
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { SpeedMathBattleView } from './views/game/SpeedMathBattleView';
import { FormulaFlashcardsView } from './views/flashcards/FormulaFlashcardsView';
import { InteractiveGrapher } from './components/math/InteractiveGrapher';
import { School, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(storageService.getCurrentUser());
  const [activeView, setActiveView] = useState<string>('lessons');
  const [selectedLessonForExam, setSelectedLessonForExam] = useState<Lesson | null>(null);
  const [resumeAttemptId, setResumeAttemptId] = useState<string | undefined>(undefined);
  const [viewingResultAttempt, setViewingResultAttempt] = useState<Attempt | null>(null);
  const [showStudentInfoModal, setShowStudentInfoModal] = useState(false);
  const [pendingLessonToStart, setPendingLessonToStart] = useState<{ lesson: Lesson; resumeId?: string } | null>(null);

  // Sync current user on load
  useEffect(() => {
    setCurrentUser(storageService.getCurrentUser());
  }, []);

  const progress = storageService.getStudentProgress(currentUser.id);

  // Start exam handler with Student Info check
  const handleStartExamRequest = (lesson: Lesson, resumeId?: string) => {
    // If student has not yet confirmed class or full name
    if (!currentUser.className || !currentUser.fullName) {
      setPendingLessonToStart({ lesson, resumeId });
      setShowStudentInfoModal(true);
    } else {
      setSelectedLessonForExam(lesson);
      setResumeAttemptId(resumeId);
      setActiveView('taking-exam');
    }
  };

  const handleStudentInfoConfirmed = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setShowStudentInfoModal(false);
    if (pendingLessonToStart) {
      setSelectedLessonForExam(pendingLessonToStart.lesson);
      setResumeAttemptId(pendingLessonToStart.resumeId);
      setActiveView('taking-exam');
      setPendingLessonToStart(null);
    }
  };

  const handleExamFinish = (completedAttempt: Attempt) => {
    setViewingResultAttempt(completedAttempt);
    setActiveView('exam-result');
  };

  const handleReviewAttempt = (attempt: Attempt) => {
    setViewingResultAttempt(attempt);
    setActiveView('exam-result');
  };

  const handleRetakeLesson = (lessonId: string) => {
    const lesson = storageService.getLessonById(lessonId);
    if (lesson) {
      handleStartExamRequest(lesson);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Global Header (Hidden only when actively taking an exam to maintain focus) */}
      {activeView !== 'taking-exam' && (
        <Header
          currentUser={currentUser}
          onUserChange={(u) => setCurrentUser(u)}
          activeView={activeView}
          onNavigate={(view) => {
            setActiveView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Main App Content Area */}
      <main className="flex-1">
        {/* Fullscreen Exam Taking View */}
        {activeView === 'taking-exam' && selectedLessonForExam && (
          <ExamTakingView
            currentUser={currentUser}
            lesson={selectedLessonForExam}
            resumeAttemptId={resumeAttemptId}
            onFinish={handleExamFinish}
            onExit={() => setActiveView('lessons')}
          />
        )}

        {/* Regular Views */}
        {activeView !== 'taking-exam' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Hero banner shown on Lessons and Mock Exams view */}
            {(activeView === 'lessons' || activeView === 'mock-exams') && (
              <HeroBanner
                currentUser={currentUser}
                progress={progress}
                onExploreClick={() => {
                  const firstNotStarted = storageService.getLessons().find(l => {
                    const attempts = storageService.getAttemptsByStudent(currentUser.id);
                    return !attempts.some(a => a.lessonId === l.id && a.status === 'COMPLETED');
                  });
                  if (firstNotStarted) {
                    handleStartExamRequest(firstNotStarted);
                  }
                }}
              />
            )}

            {/* View Switching */}
            {activeView === 'lessons' && (
              <LessonListView
                currentUser={currentUser}
                onStartExam={handleStartExamRequest}
              />
            )}

            {activeView === 'speed-battle' && (
              <SpeedMathBattleView
                currentUser={currentUser}
                onBackToLessons={() => setActiveView('lessons')}
              />
            )}

            {activeView === 'flashcards' && (
              <FormulaFlashcardsView
                onBackToLessons={() => setActiveView('lessons')}
              />
            )}

            {activeView === 'interactive-grapher' && (
              <InteractiveGrapher />
            )}

            {activeView === 'mock-exams' && (
              <MockExamsView
                currentUser={currentUser}
                onStartExam={handleStartExamRequest}
              />
            )}

            {activeView === 'exam-result' && viewingResultAttempt && (
              <ExamResultView
                attempt={viewingResultAttempt}
                onRetake={() => {
                  const lesson = storageService.getLessonById(viewingResultAttempt.lessonId);
                  if (lesson) handleStartExamRequest(lesson);
                }}
                onBackToLessons={() => setActiveView('lessons')}
                onViewAllResults={() => setActiveView('results')}
              />
            )}

            {activeView === 'results' && (
              <StudentResultsView
                currentUser={currentUser}
                onReviewAttempt={handleReviewAttempt}
                onRetakeLesson={handleRetakeLesson}
              />
            )}

            {activeView === 'progress' && (
              <StudentProgressView
                currentUser={currentUser}
              />
            )}

            {activeView === 'ai-assist' && (
              <AIAssistantView
                currentUser={currentUser}
              />
            )}

            {activeView === 'teacher-dashboard' && (
              <TeacherDashboardView
                currentUser={currentUser}
              />
            )}

            {activeView === 'admin-dashboard' && (
              <AdminDashboardView
                currentUser={currentUser}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      {activeView !== 'taking-exam' && (
        <footer className="bg-white border-t border-slate-200 mt-auto py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <div className="flex items-center justify-center gap-2 font-bold text-slate-800">
              <School className="w-4 h-4 text-indigo-600" />
              <span>TRƯỜNG THPT ĐỨC HÒA • LUYỆN TẬP TOÁN 12 - KNTT</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Chương trình Giáo dục phổ thông 2018 – Bộ sách Kết nối tri thức với cuộc sống • Giáo viên phụ trách: <strong>GV. Phan Quốc Cường</strong>
            </p>
            <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <span>Hệ thống hỗ trợ khảo thí trực tuyến & KaTeX Math Render</span>
            </div>
          </div>
        </footer>
      )}

      {/* Student Info Modal for First time or missing class */}
      <StudentInfoModal
        currentUser={currentUser}
        isOpen={showStudentInfoModal}
        onClose={() => {
          setShowStudentInfoModal(false);
          setPendingLessonToStart(null);
        }}
        onConfirmed={handleStudentInfoConfirmed}
      />
    </div>
  );
}
