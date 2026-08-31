import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Clock,
  Save,
  Send,
  Flag,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  Trash2,
  HelpCircle,
  Sparkles,
  Maximize2,
  XCircle,
  FileText
} from 'lucide-react';
import {
  Exam,
  Lesson,
  User,
  Attempt,
  AttemptStatus,
  QuestionType,
  SubmitReason,
  FocusMode,
  ViolationLog,
  AnswerPayload
} from '../types';
import { storageService } from '../services/storageService';
import { MathRenderer } from '../components/math/MathRenderer';
import { MathEditor } from '../components/math/MathEditor';

interface ExamTakingViewProps {
  currentUser: User;
  lesson: Lesson;
  resumeAttemptId?: string;
  onFinish: (attempt: Attempt) => void;
  onExit: () => void;
}

export const ExamTakingView: React.FC<ExamTakingViewProps> = ({
  currentUser,
  lesson,
  resumeAttemptId,
  onFinish,
  onExit
}) => {
  const [exam, setExam] = useState<Exam | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [qId: string]: AnswerPayload }>({});
  const [violations, setViolations] = useState<ViolationLog[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [showMathEditorForEssay, setShowMathEditorForEssay] = useState(false);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);

  // Initialize Exam & Attempt
  useEffect(() => {
    let currentExam = storageService.getExamByLessonId(lesson.id);
    if (!currentExam) {
      // Create fallback exam if not found
      currentExam = {
        id: `exam_${lesson.id}`,
        lessonId: lesson.id,
        title: `Luyện tập: ${lesson.title}`,
        currentVersion: 1,
        versions: [{
          version: 1,
          createdAt: new Date().toISOString(),
          createdBy: 'GV. Phan Quốc Cường',
          questionsCount: 16
        }],
        settings: {
          timeLimitMinutes: 45,
          allowRetake: true,
          maxAttempts: 5,
          showAnswersAfterSubmit: true,
          shuffleQuestions: false,
          shuffleOptions: false,
          focusExamMode: true,
          focusModeType: FocusMode.WARNING_LIMIT,
          maxTabSwitches: 2,
          autoSubmitOnViolation: true,
          aiAssistanceEnabled: true,
          aiRevealAnswersAfterSubmit: true,
          isPublished: true
        },
        questions: storageService.getExams()[0]?.questions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    setExam(currentExam);

    // Check if resume or start new
    let activeAttempt: Attempt | undefined;
    if (resumeAttemptId) {
      activeAttempt = storageService.getAttemptById(resumeAttemptId);
    } else {
      activeAttempt = storageService.getActiveAttempt(currentUser.id, currentExam.id);
    }

    if (activeAttempt && activeAttempt.status === AttemptStatus.IN_PROGRESS) {
      // Resume existing
      setAttempt(activeAttempt);
      setAnswers(activeAttempt.answers || {});
      setViolations(activeAttempt.violations || []);
      setCurrentIndex(activeAttempt.currentQuestionIndex || 0);

      if (currentExam.settings.timeLimitMinutes > 0) {
        const elapsed = Math.floor((Date.now() - new Date(activeAttempt.startedAt).getTime()) / 1000);
        const total = currentExam.settings.timeLimitMinutes * 60;
        setSecondsRemaining(Math.max(0, total - elapsed));
      }
    } else {
      // Create new Attempt
      const newAttempt: Attempt = {
        id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        examId: currentExam.id,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        examVersion: currentExam.currentVersion,
        studentId: currentUser.id,
        studentName: currentUser.fullName,
        className: currentUser.className || '12TN1',
        status: AttemptStatus.IN_PROGRESS,
        startedAt: new Date().toISOString(),
        timeSpentSeconds: 0,
        currentQuestionIndex: 0,
        answers: {},
        answeredQuestionsCount: 0,
        totalQuestionsCount: currentExam.questions.length,
        progressPercentage: 0,
        violations: [],
        violationCount: 0,
        attemptNumber: (storageService.getAttemptsByStudent(currentUser.id).length || 0) + 1
      };

      storageService.saveAttempt(newAttempt);
      setAttempt(newAttempt);
      setAnswers({});
      setViolations([]);
      setCurrentIndex(0);

      if (currentExam.settings.timeLimitMinutes > 0) {
        setSecondsRemaining(currentExam.settings.timeLimitMinutes * 60);
      }
    }
  }, [lesson, currentUser, resumeAttemptId]);

  // Current Question
  const questions = exam?.questions || [];
  const currentQuestion = questions[currentIndex];

  // Calculate answered count
  const calculateProgress = useCallback((currentAnswers: { [qId: string]: AnswerPayload }) => {
    if (!questions.length) return { answered: 0, percentage: 0 };
    let answered = 0;
    questions.forEach((q) => {
      const a = currentAnswers[q.id];
      if (!a) return;
      if (q.part === 1 && a.selectedOption) answered++;
      else if (q.part === 2 && a.trueFalseAnswers && Object.keys(a.trueFalseAnswers).length > 0) answered++;
      else if (q.part === 3 && a.shortAnswer && a.shortAnswer.trim()) answered++;
      else if (q.part === 4 && ((a.essayText && a.essayText.trim()) || (a.essayFiles && a.essayFiles.length > 0))) answered++;
    });

    return {
      answered,
      percentage: Math.round((answered / questions.length) * 100)
    };
  }, [questions]);

  // Safe Save Function
  const saveState = useCallback((
    updatedAnswers?: { [qId: string]: AnswerPayload },
    newViolations?: ViolationLog[],
    newIndex?: number
  ) => {
    if (!attempt || !exam || isSubmittingRef.current) return;
    setIsSaving(true);

    const answersToSave = updatedAnswers || answers;
    const violationsToSave = newViolations || violations;
    const indexToSave = newIndex !== undefined ? newIndex : currentIndex;

    const { answered, percentage } = calculateProgress(answersToSave);
    const elapsed = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);

    const updatedAttempt: Attempt = {
      ...attempt,
      currentQuestionIndex: indexToSave,
      answers: answersToSave,
      violations: violationsToSave,
      violationCount: violationsToSave.length,
      answeredQuestionsCount: answered,
      progressPercentage: percentage,
      timeSpentSeconds: elapsed
    };

    storageService.saveAttempt(updatedAttempt);
    setAttempt(updatedAttempt);
    setLastSavedTime(new Date().toLocaleTimeString('vi-VN'));
    setIsSaving(false);
  }, [attempt, exam, answers, violations, currentIndex, calculateProgress]);

  // Submit Exam Function (Guards against double submit)
  const submitExam = useCallback((reason: SubmitReason = SubmitReason.NORMAL) => {
    if (isSubmittingRef.current || !attempt || !exam) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    // Save final answers before grading
    const { answered, percentage } = calculateProgress(answers);
    const elapsed = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);

    const finalAttempt: Attempt = {
      ...attempt,
      status: AttemptStatus.COMPLETED,
      submittedAt: new Date().toISOString(),
      timeSpentSeconds: elapsed,
      answers,
      violations,
      violationCount: violations.length,
      submitReason: reason,
      answeredQuestionsCount: answered,
      progressPercentage: percentage
    };

    // Auto-Grade
    const gradedAttempt = storageService.gradeAttempt(finalAttempt, exam);
    storageService.saveAttempt(gradedAttempt);
    storageService.logAudit(
      'EXAM_SUBMITTED',
      `Học sinh ${currentUser.fullName} (${currentUser.className}) đã nộp bài ${lesson.title} - Điểm: ${gradedAttempt.score}/10`
    );

    // Exit fullscreen if active
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    onFinish(gradedAttempt);
  }, [attempt, exam, answers, violations, calculateProgress, currentUser, lesson, onFinish]);

  // Timer countdown
  useEffect(() => {
    if (!exam || exam.settings.timeLimitMinutes <= 0 || isSubmitting) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam(SubmitReason.TIME_EXPIRED);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, isSubmitting, submitExam]);

  // Periodic Auto-Save
  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      saveState();
    }, (storageService.getSettings().autoSaveIntervalSeconds || 10) * 1000);

    return () => clearInterval(autoSaveTimer);
  }, [saveState]);

  // Focus Exam Mode & Violation Listeners
  useEffect(() => {
    if (!exam?.settings?.focusExamMode || isSubmitting) return;

    const handleViolation = (type: 'TAB_SWITCH' | 'WINDOW_BLUR' | 'FULLSCREEN_EXIT' | 'PAGE_HIDE', details: string) => {
      if (isSubmittingRef.current) return;

      const newViolation: ViolationLog = {
        id: `v_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type,
        details
      };

      const updatedViolations = [...violations, newViolation];
      setViolations(updatedViolations);
      saveState(undefined, updatedViolations);

      const maxAllowed = exam.settings.maxTabSwitches || 2;
      const currentCount = updatedViolations.length;

      if (exam.settings.focusModeType === FocusMode.AUTO_SUBMIT || (exam.settings.focusModeType === FocusMode.WARNING_LIMIT && currentCount >= maxAllowed)) {
        // Auto-submit immediately upon exceeding
        submitExam(SubmitReason.AUTO_SUBMIT_TAB_SWITCH);
      } else if (exam.settings.focusModeType === FocusMode.WARNING || exam.settings.focusModeType === FocusMode.WARNING_LIMIT) {
        setWarningMessage(`Bạn vừa rời khỏi màn hình làm bài (${details}). Hệ thống đã ghi nhận lần vi phạm thứ ${currentCount}/${maxAllowed}. Nếu tiếp tục chuyển tab, bài làm sẽ bị tự động nộp!`);
        setShowWarningModal(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('TAB_SWITCH', 'Chuyển tab trình duyệt hoặc ẩn cửa sổ');
      }
    };

    const handleWindowBlur = () => {
      handleViolation('WINDOW_BLUR', 'Mất tiêu điểm màn hình thi');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        handleViolation('FULLSCREEN_EXIT', 'Thoát chế độ toàn màn hình');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [exam, violations, isSubmitting, saveState, submitExam]);

  // Handlers for Answers
  const handleSelectOption = (qId: string, optId: string) => {
    const updated = {
      ...answers,
      [qId]: {
        questionId: qId,
        type: QuestionType.MULTIPLE_CHOICE,
        selectedOption: optId,
        isFlaggedForReview: answers[qId]?.isFlaggedForReview
      }
    };
    setAnswers(updated);
    saveState(updated);
  };

  const handleTrueFalseChange = (qId: string, itemId: string, value: boolean) => {
    const currentTf = answers[qId]?.trueFalseAnswers || {};
    const updatedTf = { ...currentTf, [itemId]: value };

    const updated = {
      ...answers,
      [qId]: {
        questionId: qId,
        type: QuestionType.TRUE_FALSE,
        trueFalseAnswers: updatedTf,
        isFlaggedForReview: answers[qId]?.isFlaggedForReview
      }
    };
    setAnswers(updated);
    saveState(updated);
  };

  const handleShortAnswerChange = (qId: string, val: string) => {
    const updated = {
      ...answers,
      [qId]: {
        questionId: qId,
        type: QuestionType.SHORT_ANSWER,
        shortAnswer: val,
        isFlaggedForReview: answers[qId]?.isFlaggedForReview
      }
    };
    setAnswers(updated);
    saveState(updated);
  };

  const handleEssayTextChange = (qId: string, val: string) => {
    const updated = {
      ...answers,
      [qId]: {
        ...answers[qId],
        questionId: qId,
        type: QuestionType.ESSAY,
        essayText: val,
        isFlaggedForReview: answers[qId]?.isFlaggedForReview
      }
    };
    setAnswers(updated);
    saveState(updated);
  };

  const handleToggleFlag = (qId: string) => {
    const current = answers[qId] || { questionId: qId, type: currentQuestion.type };
    const updated = {
      ...answers,
      [qId]: {
        ...current,
        isFlaggedForReview: !current.isFlaggedForReview
      }
    };
    setAnswers(updated);
    saveState(updated);
  };

  // Image / File Upload for Essay
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !currentQuestion) return;

    Array.from(files).forEach((file: File) => {
      // Check file size (under 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Kích thước tệp vượt quá 10MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const fileUrl = event.target?.result as string;
        const currentFiles = answers[currentQuestion.id]?.essayFiles || [];
        const newFiles = [
          ...currentFiles,
          {
            name: file.name,
            url: fileUrl,
            size: file.size,
            type: file.type
          }
        ];

        const updated = {
          ...answers,
          [currentQuestion.id]: {
            ...answers[currentQuestion.id],
            questionId: currentQuestion.id,
            type: QuestionType.ESSAY,
            essayFiles: newFiles
          }
        };
        setAnswers(updated);
        saveState(updated);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (qId: string, fileIdx: number) => {
    const currentFiles = answers[qId]?.essayFiles || [];
    const newFiles = currentFiles.filter((_, idx) => idx !== fileIdx);
    const updated = {
      ...answers,
      [qId]: {
        ...answers[qId],
        essayFiles: newFiles
      }
    };
    setAnswers(updated);
    saveState(updated);
  };

  // Request Fullscreen
  const handleRequestFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  if (!exam || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm border border-slate-100">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800">Đang chuẩn bị đề thi Toán 12...</h3>
          <p className="text-xs text-slate-500 mt-1">Đang tải câu hỏi và công thức toán...</p>
        </div>
      </div>
    );
  }

  const { answered, percentage } = calculateProgress(answers);
  const currentAnswer = answers[currentQuestion.id];
  const isFlagged = currentAnswer?.isFlaggedForReview;

  // Format time
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Lesson and Student info */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                saveState();
                onExit();
              }}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors text-xs font-semibold flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Trang chủ</span>
            </button>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                TRƯỜNG THPT ĐỨC HÒA • GV. PHAN QUỐC CƯỜNG
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
                {lesson.title}
              </h2>
              <div className="text-[11px] text-indigo-700 font-medium">
                Học sinh: <strong>{currentUser.fullName}</strong> ({currentUser.className})
              </div>
            </div>
          </div>

          {/* Right: Timer, Progress & Actions */}
          <div className="flex items-center gap-3">
            {/* Timer */}
            {exam.settings.timeLimitMinutes > 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-bold shadow-2xs border ${
                secondsRemaining < 300
                  ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{formattedTime}</span>
              </div>
            )}

            {/* Progress Badge */}
            <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-500">Tiến độ:</span>
              <strong className="text-indigo-700 font-bold">
                {answered}/{questions.length} câu ({percentage}%)
              </strong>
            </div>

            {/* Violation Alert Badge if any */}
            {violations.length > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-700 font-black text-xs rounded-lg border border-red-200 animate-bounce">
                VI PHẠM: {violations.length}
              </span>
            )}

            {/* Save indicator */}
            <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-400">
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Đang lưu...' : lastSavedTime ? `Đã lưu ${lastSavedTime}` : 'Tự động lưu'}</span>
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={handleRequestFullscreen}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
              title="Chế độ toàn màn hình"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>NỘP BÀI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center: Question Content (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            {/* Section Header (Azota Style) */}
            <div className="mb-5 pb-3 border-b border-slate-200">
              <div className="text-sm font-black text-slate-900 leading-snug">
                {currentQuestion.part === 1 && (
                  <>
                    <span>PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn</span>{' '}
                    <span className="font-normal italic text-slate-600 text-xs">
                      (học sinh trả lời các câu hỏi từ 1 đến 12, mỗi câu hỏi học sinh chỉ chọn một phương án)
                    </span>
                  </>
                )}
                {currentQuestion.part === 2 && (
                  <>
                    <span>PHẦN II. Câu trắc nghiệm đúng sai.</span>{' '}
                    <span className="font-normal italic text-slate-600 text-xs">
                      (Học sinh trả lời từ câu 1 đến câu 4. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chỉ chọn đúng hoặc sai).
                    </span>
                  </>
                )}
                {currentQuestion.part === 3 && (
                  <>
                    <span>PHẦN III. Câu trắc nghiệm trả lời ngắn.</span>{' '}
                    <span className="font-normal italic text-slate-600 text-xs">
                      (Thí sinh trả lời từ câu 1 đến câu 6).
                    </span>
                  </>
                )}
                {currentQuestion.part === 4 && (
                  <>
                    <span>PHẦN IV. Tự luận.</span>
                  </>
                )}
              </div>
            </div>

            {/* Question Title & Flag button */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-black text-slate-900">
                Câu {currentQuestion.questionNumber}
              </h3>

              <button
                onClick={() => handleToggleFlag(currentQuestion.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isFlagged
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>{isFlagged ? 'Đã đánh dấu' : 'Đánh dấu'}</span>
              </button>
            </div>

            {/* Question Body with KaTeX */}
            <div className="text-base text-slate-900 font-normal leading-relaxed mb-4">
              <MathRenderer blocks={currentQuestion.contentBlocks} content={currentQuestion.content} />
            </div>

            {/* Optional Image */}
            {currentQuestion.imageUrl && (
              <div className="mb-4">
                <img
                  src={currentQuestion.imageUrl}
                  alt={`Minh họa câu ${currentQuestion.questionNumber}`}
                  className="max-h-72 object-contain rounded-xl border border-slate-200 p-1 bg-white shadow-2xs"
                />
              </div>
            )}

            {/* Action Sub-divider (Azota Style) */}
            <div className="relative flex py-4 items-center my-3">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-slate-700 text-xs font-semibold">
                {currentQuestion.part === 1 && 'Chọn một đáp án đúng'}
                {currentQuestion.part === 2 && 'Chọn đúng hoặc sai'}
                {currentQuestion.part === 3 && 'Nhập đáp án'}
                {currentQuestion.part === 4 && 'Bài làm tự luận'}
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* --- Render Form based on Question Type (Azota Layout) --- */}

            {/* PART I: MULTIPLE CHOICE */}
            {currentQuestion.part === 1 && currentQuestion.options && (
              <div className="space-y-3 pt-1">
                {currentQuestion.options.map((opt) => {
                  const isSelected = currentAnswer?.selectedOption === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      {/* Circular letter button */}
                      <button
                        type="button"
                        className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm shrink-0 transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                            : 'border-slate-300 text-slate-700 group-hover:border-indigo-400 group-hover:bg-indigo-50/50 bg-white'
                        }`}
                      >
                        {opt.id}
                      </button>

                      {/* Rounded box wrapping option content */}
                      <div
                        className={`px-4 py-2.5 rounded-xl border transition-all text-sm font-medium text-slate-900 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/60 shadow-xs'
                            : 'border-slate-200 bg-white group-hover:border-slate-300 group-hover:bg-slate-50/50'
                        }`}
                      >
                        <MathRenderer blocks={opt.contentBlocks} content={opt.content} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PART II: TRUE / FALSE */}
            {currentQuestion.part === 2 && currentQuestion.trueFalseItems && (
              <div className="space-y-3 pt-1">
                {currentQuestion.trueFalseItems.map((item) => {
                  const currentChoice = currentAnswer?.trueFalseAnswers?.[item.id];
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3"
                    >
                      {/* Proposition content in rounded box */}
                      <div className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 flex items-start gap-2 shadow-2xs">
                        <span className="font-bold shrink-0">{item.id})</span>
                        <div className="leading-relaxed">
                          <MathRenderer blocks={item.contentBlocks} content={item.content} />
                        </div>
                      </div>

                      {/* Right toggle buttons: ( Đúng ) ( Sai ) */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleTrueFalseChange(currentQuestion.id, item.id, true)}
                          className={`px-4 py-2 rounded-full border text-xs font-bold transition-all shadow-2xs ${
                            currentChoice === true
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          Đúng
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTrueFalseChange(currentQuestion.id, item.id, false)}
                          className={`px-4 py-2 rounded-full border text-xs font-bold transition-all shadow-2xs ${
                            currentChoice === false
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          Sai
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* PART III: SHORT ANSWER */}
            {currentQuestion.part === 3 && (
              <div className="space-y-3 pt-1">
                <textarea
                  rows={4}
                  value={currentAnswer?.shortAnswer || ''}
                  onChange={(e) => handleShortAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Đáp án của bạn"
                  className="w-full p-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white shadow-2xs transition-all resize-y"
                />
              </div>
            )}

            {/* PART IV: ESSAY */}
            {currentQuestion.part === 4 && (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Trình bày bài làm tự luận:
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMathEditorForEssay(!showMathEditorForEssay)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{showMathEditorForEssay ? 'Soạn thảo văn bản thường' : 'Bật bộ gõ công thức Toán'}</span>
                  </button>
                </div>

                {showMathEditorForEssay ? (
                  <MathEditor
                    value={currentAnswer?.essayText || ''}
                    onChange={(val) => handleEssayTextChange(currentQuestion.id, val)}
                    placeholder="Nhập bài làm tự luận..."
                    rows={6}
                  />
                ) : (
                  <textarea
                    value={currentAnswer?.essayText || ''}
                    onChange={(e) => handleEssayTextChange(currentQuestion.id, e.target.value)}
                    placeholder="Đáp án hoặc bài làm của bạn..."
                    rows={6}
                    className="w-full p-4 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white shadow-2xs"
                  />
                )}
                {/* Upload Image / Document files for Essay */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      Đính kèm ảnh bài làm trên giấy (JPG, PNG, WEBP, DOCX)
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Chọn ảnh/file
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Uploaded files preview list */}
                  {currentAnswer?.essayFiles && currentAnswer.essayFiles.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {currentAnswer.essayFiles.map((f, fIdx) => (
                        <div key={fIdx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white p-2 text-center">
                          {f.type.startsWith('image/') ? (
                            <img src={f.url} alt={f.name} className="h-24 w-full object-cover rounded-lg mb-1" />
                          ) : (
                            <div className="h-24 w-full bg-indigo-50 flex items-center justify-center rounded-lg mb-1 text-indigo-600">
                              <FileText className="w-8 h-8" />
                            </div>
                          )}
                          <div className="text-[11px] text-slate-700 truncate font-medium">{f.name}</div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(currentQuestion.id, fIdx)}
                            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-md shadow-xs opacity-80 hover:opacity-100"
                            title="Xóa tệp"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-400">
                      Chưa có hình ảnh nào được đính kèm. Bạn có thể chụp ảnh bài làm trên giấy và tải lên.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Navigation between questions */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
              <button
                disabled={currentIndex === 0}
                onClick={() => {
                  const nextIdx = Math.max(0, currentIndex - 1);
                  setCurrentIndex(nextIdx);
                  saveState(undefined, undefined, nextIdx);
                }}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  currentIndex === 0
                    ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                CÂU TRƯỚC
              </button>

              <div className="text-xs text-slate-400 font-medium">
                Câu {currentIndex + 1} trên tổng số {questions.length} câu
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => {
                    const nextIdx = Math.min(questions.length - 1, currentIndex + 1);
                    setCurrentIndex(nextIdx);
                    saveState(undefined, undefined, nextIdx);
                  }}
                  className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  CÂU TIẾP
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  HOÀN THÀNH & NỘP
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Question Navigation Grid (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sticky top-20">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>BẢNG ĐIỀU HƯỚNG CÂU HỎI</span>
              <span className="text-indigo-600 font-bold">{answered}/{questions.length}</span>
            </h4>

            {/* Question Bubble Grid */}
            <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-4 gap-2 mb-4">
              {questions.map((q, idx) => {
                const ans = answers[q.id];
                let isAnswered = false;
                if (q.part === 1 && ans?.selectedOption) isAnswered = true;
                else if (q.part === 2 && ans?.trueFalseAnswers && Object.keys(ans.trueFalseAnswers).length > 0) isAnswered = true;
                else if (q.part === 3 && ans?.shortAnswer?.trim()) isAnswered = true;
                else if (q.part === 4 && (ans?.essayText?.trim() || ans?.essayFiles?.length)) isAnswered = true;

                const isFlag = ans?.isFlaggedForReview;
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      saveState(undefined, undefined, idx);
                    }}
                    className={`relative h-10 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
                      isCurrent
                        ? 'ring-2 ring-indigo-600 font-black shadow-md'
                        : ''
                    } ${
                      isFlag
                        ? 'bg-amber-100 text-amber-800 border-2 border-amber-400'
                        : isAnswered
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                    {isFlag && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Color Legend */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-indigo-600 shrink-0" />
                <span>Đã trả lời ({answered})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-slate-100 border border-slate-300 shrink-0" />
                <span>Chưa làm ({questions.length - answered})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-amber-100 border-2 border-amber-400 shrink-0" />
                <span>Đánh dấu xem lại ({(Object.values(answers) as AnswerPayload[]).filter(a => a.isFlaggedForReview).length})</span>
              </div>
            </div>

            {/* Submit CTA */}
            <div className="mt-5">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-3 px-4 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                NỘP BÀI THI
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                XÁC NHẬN NỘP BÀI
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Bạn có chắc chắn muốn nộp bài thi luyện tập này không?
              </p>
            </div>

            {/* Summary Statistics */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 mb-6 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span>Số câu đã trả lời:</span>
                <strong className="text-indigo-700 font-bold text-sm">{answered}/{questions.length} câu</strong>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Số câu chưa trả lời:</span>
                <strong className={`font-bold text-sm ${questions.length - answered > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                  {questions.length - answered} câu
                </strong>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Đánh dấu xem lại:</span>
                <strong className="text-amber-600 font-bold text-sm">
                  {(Object.values(answers) as AnswerPayload[]).filter(a => a.isFlaggedForReview).length} câu
                </strong>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                QUAY LẠI KIỂM TRA
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  submitExam(SubmitReason.NORMAL);
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                NỘP BÀI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOCUS EXAM WARNING MODAL */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-red-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-red-500 animate-in zoom-in-95 text-center">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-red-600 mb-2 uppercase">
              ⚠ CẢNH BÁO VI PHẠM
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 font-medium">
              {warningMessage}
            </p>
            <button
              onClick={() => {
                setShowWarningModal(false);
                handleRequestFullscreen();
              }}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all"
            >
              TÔI ĐÃ HIỂU & TIẾP TỤC LÀM BÀI
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTakingView;
