import React, { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  X,
  Sparkles,
  Edit3,
  Save,
  Trash2,
  Layers,
  ArrowRight,
  HelpCircle,
  Plus,
  Image as ImageIcon,
  AlertOctagon,
  FileCode,
  Check,
  Split,
  Combine,
  FileText,
  Eye,
  Sliders,
  Sigma
} from 'lucide-react';
import { DocxParsedExam } from '../../services/docxParser';
import { Lesson, Exam, Question, QuestionType, QuestionOption, TrueFalseItem } from '../../types';
import { storageService } from '../../services/storageService';
import { MathRenderer } from '../../components/math/MathRenderer';
import { RichMathTextInput } from '../../components/math/RichMathTextInput';
import { validateMathSyntax } from '../../services/mathSyntaxValidator';

interface WordPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: DocxParsedExam | null;
  lesson: Lesson;
  onPublished: (exam: Exam) => void;
}

export const WordPreviewModal: React.FC<WordPreviewModalProps> = ({
  isOpen,
  onClose,
  parsedData,
  lesson,
  onPublished
}) => {
  const [activeTab, setActiveTab] = useState<'parsed' | 'raw'>('parsed');
  const [questions, setQuestions] = useState<Question[]>(parsedData?.questions || []);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form edit states
  const [editingPart, setEditingPart] = useState<1 | 2 | 3 | 4>(1);
  const [editingContent, setEditingContent] = useState('');
  const [editingSolution, setEditingSolution] = useState('');
  const [editingOptions, setEditingOptions] = useState<QuestionOption[]>([]);
  const [editingCorrectOption, setEditingCorrectOption] = useState<string | null>('A');
  const [editingTrueFalseItems, setEditingTrueFalseItems] = useState<TrueFalseItem[]>([]);
  const [editingShortAnswer, setEditingShortAnswer] = useState<string>('');
  const [editingImageUrl, setEditingImageUrl] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState(45);

  useEffect(() => {
    if (parsedData?.questions) {
      setQuestions(parsedData.questions);
    }
  }, [parsedData]);

  if (!isOpen || !parsedData) return null;

  // Live validation calculation
  const liveIssues = useMemo(() => {
    const issues: { questionNumber: number; message: string; severity: 'error' | 'warning' }[] = [];

    questions.forEach((q, idx) => {
      const qNum = idx + 1;
      if (!q.content || !q.content.trim()) {
        issues.push({ questionNumber: qNum, message: `Câu ${qNum}: Nội dung câu hỏi bị trống`, severity: 'error' });
      }

      // Syntax check
      const syntaxCheck = validateMathSyntax(q.content);
      if (!syntaxCheck.isValid) {
        issues.push({ questionNumber: qNum, message: `Câu ${qNum}: Cú pháp công thức chưa đóng mở đúng (${syntaxCheck.errors.join(' ')})`, severity: 'warning' });
      }

      if (q.part === 1) {
        if (!q.options || q.options.length < 2) {
          issues.push({ questionNumber: qNum, message: `Câu ${qNum}: Thiếu các phương án lựa chọn A, B, C, D`, severity: 'error' });
        } else if (q.options.some(o => !o.content || !o.content.trim())) {
          issues.push({ questionNumber: qNum, message: `Câu ${qNum}: Có phương án lựa chọn bị trống nội dung`, severity: 'error' });
        }
        if (!q.correctOption) {
          issues.push({ questionNumber: qNum, message: `Câu ${qNum}: Chưa chọn đáp án đúng (A, B, C hoặc D)`, severity: 'error' });
        }
      } else if (q.part === 2) {
        if (!q.trueFalseItems || q.trueFalseItems.length < 2) {
          issues.push({ questionNumber: qNum, message: `Câu ${qNum}: Thiếu các mệnh đề a, b, c, d`, severity: 'error' });
        } else if (q.trueFalseItems.some(i => i.correctAnswer === undefined)) {
          issues.push({ questionNumber: qNum, message: `Câu ${qNum}: Chưa xác định tính Đúng/Sai cho một số mệnh đề`, severity: 'warning' });
        }
      } else if (q.part === 3) {
        if (!q.shortAnswerConfig?.correctAnswers || q.shortAnswerConfig.correctAnswers.length === 0 || !q.shortAnswerConfig.correctAnswers[0]) {
          issues.push({ questionNumber: qNum, message: `Câu ${qNum}: Chưa có đáp số trả lời ngắn`, severity: 'error' });
        }
      }

      if (q.needsReview || q.needsTeacherCheck) {
        issues.push({ questionNumber: qNum, message: `Câu ${qNum}: Đánh dấu cần giáo viên kiểm tra lại`, severity: 'warning' });
      }
    });

    return issues;
  }, [questions]);

  const errorCount = liveIssues.filter(i => i.severity === 'error').length;
  const warningCount = liveIssues.filter(i => i.severity === 'warning').length;

  const handleStartEdit = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditingPart(q.part);
    setEditingContent(q.content);
    setEditingSolution(q.solution || '');
    setEditingOptions(q.options || [
      { id: 'A', label: 'A', content: '' },
      { id: 'B', label: 'B', content: '' },
      { id: 'C', label: 'C', content: '' },
      { id: 'D', label: 'D', content: '' }
    ]);
    setEditingCorrectOption(typeof q.correctOption === 'string' ? q.correctOption : 'A');
    setEditingTrueFalseItems(q.trueFalseItems || [
      { id: 'a', label: 'a', content: '', correctAnswer: true },
      { id: 'b', label: 'b', content: '', correctAnswer: false },
      { id: 'c', label: 'c', content: '', correctAnswer: true },
      { id: 'd', label: 'd', content: '', correctAnswer: false }
    ]);
    setEditingShortAnswer(q.shortAnswerConfig?.correctAnswers?.[0] || (q.correctAnswers?.[0] || ''));
    setEditingImageUrl(q.imageUrl || '');
  };

  const handleSaveEdit = (qId: string) => {
    const updated = questions.map((q) => {
      if (q.id === qId) {
        const newType =
          editingPart === 1
            ? QuestionType.MULTIPLE_CHOICE
            : editingPart === 2
            ? QuestionType.TRUE_FALSE
            : editingPart === 3
            ? QuestionType.SHORT_ANSWER
            : QuestionType.ESSAY;

        const newPoints = editingPart === 1 ? 0.25 : editingPart === 2 ? 1.0 : editingPart === 3 ? 0.5 : 1.5;

        return {
          ...q,
          part: editingPart,
          type: newType,
          points: newPoints,
          content: editingContent,
          solution: editingSolution,
          options: editingPart === 1 ? editingOptions : undefined,
          correctOption: editingPart === 1 ? editingCorrectOption : undefined,
          trueFalseItems: editingPart === 2 ? editingTrueFalseItems : undefined,
          statements: editingPart === 2 ? editingTrueFalseItems : undefined,
          shortAnswerConfig: editingPart === 3 ? { correctAnswers: [editingShortAnswer.trim()].filter(Boolean), expressionEquivalence: true } : undefined,
          correctAnswers: editingPart === 1 ? (editingCorrectOption ? [editingCorrectOption] : []) : editingPart === 3 ? [editingShortAnswer.trim()].filter(Boolean) : [],
          imageUrl: editingImageUrl || undefined,
          needsTeacherCheck: false,
          needsReview: false
        };
      }
      return q;
    });
    setQuestions(updated);
    setEditingQuestionId(null);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (window.confirm('Thầy/Cô có chắc chắn muốn xóa câu hỏi này khỏi đề thi?')) {
      const remaining = questions.filter(q => q.id !== qId);
      const reindexed = remaining.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
      setQuestions(reindexed);
      if (editingQuestionId === qId) {
        setEditingQuestionId(null);
      }
    }
  };

  // Merge Question i with Question i + 1
  const handleMergeWithNext = (index: number) => {
    if (index >= questions.length - 1) return;
    const q1 = questions[index];
    const q2 = questions[index + 1];

    if (window.confirm(`Gộp nội dung Câu ${index + 1} và Câu ${index + 2} thành một câu duy nhất?`)) {
      const mergedContent = `${q1.content}\n\n${q2.content}`.trim();
      const mergedSolution = [q1.solution, q2.solution].filter(Boolean).join('\n\n');
      const mergedBlocks = [...(q1.contentBlocks || []), ...(q2.contentBlocks || [])];

      const mergedQuestion: Question = {
        ...q1,
        content: mergedContent,
        contentBlocks: mergedBlocks,
        solution: mergedSolution || undefined,
        options: q1.options || q2.options,
        trueFalseItems: q1.trueFalseItems || q2.trueFalseItems,
        shortAnswerConfig: q1.shortAnswerConfig || q2.shortAnswerConfig,
        imageUrl: q1.imageUrl || q2.imageUrl
      };

      const updatedList = [
        ...questions.slice(0, index),
        mergedQuestion,
        ...questions.slice(index + 2)
      ].map((q, idx) => ({ ...q, questionNumber: idx + 1 }));

      setQuestions(updatedList);
    }
  };

  // Split Question into 2 Questions
  const handleSplitQuestion = (index: number) => {
    const q = questions[index];
    const parts = q.content.split(/\n\n+/);
    if (parts.length < 2) {
      alert('Để tách câu, nội dung câu hỏi cần có ít nhất 2 đoạn văn (cách nhau bởi một dòng trống). Thầy/Cô có thể bấm "Sửa câu hỏi" để chèn dòng trống.');
      return;
    }

    const firstHalf = parts[0];
    const secondHalf = parts.slice(1).join('\n\n');

    const q1: Question = {
      ...q,
      id: `${q.id}_p1_${Date.now()}`,
      content: firstHalf,
      questionNumber: index + 1
    };

    const q2: Question = {
      ...q,
      id: `${q.id}_p2_${Date.now()}`,
      content: secondHalf,
      questionNumber: index + 2
    };

    const updatedList = [
      ...questions.slice(0, index),
      q1,
      q2,
      ...questions.slice(index + 1)
    ].map((item, idx) => ({ ...item, questionNumber: idx + 1 }));

    setQuestions(updatedList);
  };

  const handlePublish = () => {
    if (errorCount > 0) {
      alert(`Đề thi vẫn còn ${errorCount} lỗi cần xử lý trước khi xuất bản. Vui lòng bấm "Sửa câu hỏi" để hoàn thiện.`);
      return;
    }

    const existingExam = storageService.getExamByLessonId(lesson.id);
    const newVersion = existingExam ? existingExam.currentVersion + 1 : 1;

    const newExam: Exam = {
      id: existingExam?.id || `exam_${lesson.id}`,
      lessonId: lesson.id,
      title: parsedData.title || `Luyện tập: ${lesson.title}`,
      currentVersion: newVersion,
      versions: [
        ...(existingExam?.versions || []),
        {
          version: newVersion,
          createdAt: new Date().toISOString(),
          createdBy: 'GV. Phan Quốc Cường',
          questionsCount: questions.length
        }
      ],
      settings: {
        timeLimitMinutes: timeLimit,
        allowRetake: true,
        maxAttempts: 5,
        showAnswersAfterSubmit: true,
        shuffleQuestions: false,
        shuffleOptions: false,
        focusExamMode: true,
        focusModeType: storageService.getSettings().defaultFocusMode,
        maxTabSwitches: 2,
        autoSubmitOnViolation: true,
        aiAssistanceEnabled: true,
        aiRevealAnswersAfterSubmit: true,
        isPublished: true
      },
      questions,
      createdAt: existingExam?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storageService.saveExam(newExam);
    onPublished(newExam);
  };

  const p1Count = questions.filter((q) => q.part === 1).length;
  const p2Count = questions.filter((q) => q.part === 2).length;
  const p3Count = questions.filter((q) => q.part === 3).length;
  const p4Count = questions.filter((q) => q.part === 4).length;

  const stats = parsedData.stats || {
    ommlCount: 0,
    mathTypeCount: 0,
    imageCount: 0,
    failedConversionsCount: 0
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>XEM TRƯỚC VÀ PHÊ DUYỆT ĐỀ THI (MATHJAX &amp; RICH BLOCKS)</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {parsedData.title || `Đề luyện tập: ${lesson.title}`}
            </h3>
            <p className="text-xs text-slate-500">
              Gán cho: <strong>Bài {lesson.number} – {lesson.title}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch: Parsed vs Raw Text */}
            <div className="bg-slate-200/80 p-0.5 rounded-xl flex items-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('parsed')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'parsed' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Đề thi phân tích</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'raw' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Văn bản gốc Word</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Detailed Stats Overview Bar */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-700">
            <span className="font-bold">Tổng: {questions.length} câu</span>
            <span className="text-slate-300">|</span>
            <span>Phần I: <strong>{p1Count}</strong></span>
            <span>Phần II: <strong>{p2Count}</strong></span>
            <span>Phần III: <strong>{p3Count}</strong></span>
            <span>Phần IV: <strong>{p4Count}</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">OMML: {stats.ommlCount}</span>
            <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-medium">MathType: {stats.mathTypeCount}</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">Ảnh: {stats.imageCount}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-700 font-semibold">Thời gian:</span>
            <input
              type="number"
              min={10}
              max={180}
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-14 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-900"
            />
            <span>phút</span>
          </div>
        </div>

        {/* Validation Issues Alert Banner */}
        {liveIssues.length > 0 && (
          <div className={`px-6 py-2.5 border-b text-xs flex items-start gap-2.5 ${
            errorCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${errorCount > 0 ? 'text-rose-600' : 'text-amber-600'}`} />
            <div className="flex-1">
              <div className="font-bold">
                {errorCount > 0 ? `Phát hiện ${errorCount} lỗi cần xử lý trước khi xuất bản đề thi:` : `Có ${warningCount} cảnh báo cần lưu ý:`}
              </div>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                {liveIssues.slice(0, 3).map((iss, i) => (
                  <li key={i}>{iss.message}</li>
                ))}
                {liveIssues.length > 3 && (
                  <li>...và {liveIssues.length - 3} vấn đề khác bên dưới</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Raw Extracted Word Text */}
        {activeTab === 'raw' && (
          <div className="p-6 overflow-y-auto flex-1 space-y-3">
            <div className="text-xs font-bold text-slate-700">Văn bản thô đã trích xuất từ file Word:</div>
            <pre className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
              {parsedData.rawText}
            </pre>
          </div>
        )}

        {/* Tab 1: Structured Questions list */}
        {activeTab === 'parsed' && (
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {questions.map((q, idx) => {
              const isEditing = editingQuestionId === q.id;
              const hasError = !q.content.trim() || (q.part === 1 && !q.correctOption);

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs space-y-3 transition-all ${
                    hasError ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200'
                  }`}
                >
                  {/* Question header bar */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-indigo-600 text-white">
                        CÂU {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {q.part === 1 && 'Phần I: 4 Lựa chọn'}
                        {q.part === 2 && 'Phần II: Đúng / Sai'}
                        {q.part === 3 && 'Phần III: Trả lời ngắn'}
                        {q.part === 4 && 'Phần IV: Tự luận'}
                      </span>
                      <span className="text-xs text-slate-400">({q.points} điểm)</span>

                      {q.needsReview && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-md flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" /> Cần kiểm tra
                        </span>
                      )}

                      {q.part === 1 && !q.correctOption && (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-extrabold rounded-md flex items-center gap-1">
                          <AlertOctagon className="w-3 h-3" /> Chưa chọn đáp án
                        </span>
                      )}
                    </div>

                    {!isEditing ? (
                      <div className="flex items-center gap-1.5">
                        {/* Merge with next */}
                        {idx < questions.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMergeWithNext(idx)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                            title={`Gộp Câu ${idx + 1} với Câu ${idx + 2}`}
                          >
                            <Combine className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                        )}

                        {/* Split */}
                        <button
                          type="button"
                          onClick={() => handleSplitQuestion(idx)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                          title="Tách câu này thành 2 câu"
                        >
                          <Split className="w-3.5 h-3.5 text-purple-600" />
                        </button>

                        <button
                          onClick={() => handleStartEdit(q)}
                          className="px-3 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                          Sửa câu hỏi
                        </button>

                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                          title="Xóa câu hỏi này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSaveEdit(q.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Lưu sửa đổi
                        </button>
                        <button
                          onClick={() => setEditingQuestionId(null)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors"
                        >
                          Hủy
                        </button>
                      </div>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      {/* Part switcher */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700">Chuyển loại câu hỏi:</label>
                        <select
                          value={editingPart}
                          onChange={(e) => setEditingPart(Number(e.target.value) as 1 | 2 | 3 | 4)}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value={1}>Phần I: Trắc nghiệm 4 lựa chọn</option>
                          <option value={2}>Phần II: Trắc nghiệm Đúng / Sai</option>
                          <option value={3}>Phần III: Trả lời ngắn</option>
                          <option value={4}>Phần IV: Tự luận</option>
                        </select>
                      </div>

                      {/* Content editor with prominent '∑ Chèn công thức' */}
                      <div>
                        <RichMathTextInput
                          label="Nội dung câu hỏi"
                          value={editingContent}
                          onChange={setEditingContent}
                          placeholder="Nhập nội dung câu hỏi..."
                          rows={3}
                        />
                      </div>

                      {/* Image URL / preview */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                          Hình ảnh đính kèm (URL hoặc Base64):
                        </label>
                        <input
                          type="text"
                          value={editingImageUrl}
                          onChange={(e) => setEditingImageUrl(e.target.value)}
                          placeholder="data:image/png;base64,... hoặc https://..."
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                        />
                        {editingImageUrl && (
                          <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded-xl flex justify-center">
                            <img src={editingImageUrl} alt="Preview" className="max-h-32 object-contain rounded-lg" />
                          </div>
                        )}
                      </div>

                      {/* Part I: Edit 4 Options with RichMathTextInput & Correct Answer Radio */}
                      {editingPart === 1 && (
                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-slate-700">Các phương án và chọn đáp án đúng:</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {editingOptions.map((opt, oIdx) => (
                              <div
                                key={opt.id}
                                className={`p-3 rounded-2xl border flex flex-col gap-2 ${
                                  opt.id === editingCorrectOption
                                    ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-100'
                                    : 'bg-slate-50/60 border-slate-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`correct_opt_${q.id}`}
                                      checked={opt.id === editingCorrectOption}
                                      onChange={() => setEditingCorrectOption(opt.id)}
                                      className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                    />
                                    <span className="font-extrabold text-xs">Phương án {opt.id} {opt.id === editingCorrectOption && '(Đáp án đúng)'}</span>
                                  </label>
                                </div>
                                <RichMathTextInput
                                  value={opt.content}
                                  onChange={(val) => {
                                    const updated = [...editingOptions];
                                    updated[oIdx] = { ...opt, content: val };
                                    setEditingOptions(updated);
                                  }}
                                  placeholder={`Nội dung phương án ${opt.id}...`}
                                  rows={1}
                                  minHeight="45px"
                                  showPreview={false}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Part II: Edit True/False Items with RichMathTextInput */}
                      {editingPart === 2 && (
                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-slate-700">Các mệnh đề và tính Đúng / Sai:</label>
                          <div className="space-y-3">
                            {editingTrueFalseItems.map((tf, tfIdx) => (
                              <div key={tf.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <span className="font-bold uppercase text-xs w-6 shrink-0">{tf.id})</span>
                                <div className="flex-1 w-full">
                                  <RichMathTextInput
                                    value={tf.content}
                                    onChange={(val) => {
                                      const updated = [...editingTrueFalseItems];
                                      updated[tfIdx] = { ...tf, content: val };
                                      setEditingTrueFalseItems(updated);
                                    }}
                                    placeholder={`Nội dung ý ${tf.id}...`}
                                    rows={1}
                                    minHeight="45px"
                                    showPreview={false}
                                  />
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...editingTrueFalseItems];
                                      updated[tfIdx] = { ...tf, correctAnswer: true };
                                      setEditingTrueFalseItems(updated);
                                    }}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                      tf.correctAnswer === true
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                                    }`}
                                  >
                                    Đúng
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...editingTrueFalseItems];
                                      updated[tfIdx] = { ...tf, correctAnswer: false };
                                      setEditingTrueFalseItems(updated);
                                    }}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                      tf.correctAnswer === false
                                        ? 'bg-rose-600 text-white shadow-xs'
                                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                                    }`}
                                  >
                                    Sai
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Part III: Edit Short Answer with RichMathTextInput */}
                      {editingPart === 3 && (
                        <div>
                          <RichMathTextInput
                            label="Đáp số đúng (số, phân số, căn thức, tọa độ)"
                            value={editingShortAnswer}
                            onChange={setEditingShortAnswer}
                            placeholder="Ví dụ: -199 hoặc 3/4 hoặc 0.75"
                            rows={1}
                            minHeight="45px"
                          />
                        </div>
                      )}

                      {/* Solution with RichMathTextInput */}
                      <div>
                        <RichMathTextInput
                          label="Lời giải chi tiết"
                          value={editingSolution}
                          onChange={setEditingSolution}
                          placeholder="Lời giải chi tiết..."
                          rows={2}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Rendered Question content */}
                      <div className="text-sm text-slate-900 leading-relaxed font-medium">
                        <MathRenderer blocks={q.contentBlocks} content={q.content} allowZoom />
                      </div>

                      {q.imageUrl && !q.contentBlocks?.some(b => b.type === 'image' && b.url === q.imageUrl) && !q.content.includes(q.imageUrl) && !q.imageUrl.startsWith('data:image/svg+xml') && (
                        <figure className="question-image my-3 flex flex-col items-center justify-center">
                          <img
                            src={q.imageUrl}
                            alt=""
                            className="max-h-72 max-w-full object-contain rounded-2xl border border-slate-200 shadow-xs bg-white p-2"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.parentElement) e.currentTarget.parentElement.style.display = 'none';
                            }}
                          />
                        </figure>
                      )}

                      {/* Sub-divider */}
                      <div className="relative flex py-3 items-center my-2">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-slate-700 text-xs font-semibold">
                          {q.part === 1 && 'Chọn một đáp án đúng'}
                          {q.part === 2 && 'Chọn đúng hoặc sai'}
                          {q.part === 3 && 'Nhập đáp án'}
                          {q.part === 4 && 'Hướng dẫn chấm / Tự luận'}
                        </span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      {/* Part I Options */}
                      {q.part === 1 && q.options && (
                        <div className="space-y-2.5 text-xs pt-1">
                          {q.options.map((opt) => (
                            <div key={opt.id} className="flex items-center gap-2.5">
                              <span
                                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                                  opt.id === q.correctOption
                                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                                    : 'border-slate-300 text-slate-700 bg-white'
                                }`}
                              >
                                {opt.id}
                              </span>
                              <div
                                className={`px-3.5 py-2 rounded-xl border text-xs font-medium ${
                                  opt.id === q.correctOption
                                    ? 'border-emerald-400 bg-emerald-50/80 font-bold text-emerald-950 shadow-2xs'
                                    : 'border-slate-200 bg-white text-slate-800'
                                }`}
                              >
                                <MathRenderer blocks={opt.contentBlocks} content={opt.content} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Part II True/False */}
                      {q.part === 2 && q.trueFalseItems && (
                        <div className="space-y-2 text-xs pt-1">
                          {q.trueFalseItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-2.5">
                              <div className="flex-1 p-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 flex items-start gap-2 shadow-2xs">
                                <span className="font-bold shrink-0">{item.id})</span>
                                <div className="leading-relaxed">
                                  <MathRenderer blocks={item.contentBlocks} content={item.content} />
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`px-3 py-1 rounded-full border text-[11px] font-bold ${
                                  item.correctAnswer === true
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                    : 'bg-white text-slate-600 border-slate-200'
                                }`}>
                                  Đúng
                                </span>
                                <span className={`px-3 py-1 rounded-full border text-[11px] font-bold ${
                                  item.correctAnswer === false
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                    : 'bg-white text-slate-600 border-slate-200'
                                }`}>
                                  Sai
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Part III Short Answer */}
                      {q.part === 3 && q.shortAnswerConfig && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                          Đáp án đúng: <strong className="text-indigo-700 font-mono text-sm">{q.shortAnswerConfig.correctAnswers.join(' hoặc ') || '(Chưa xác định)'}</strong>
                        </div>
                      )}

                      {/* Solution */}
                      {q.solution && (
                        <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-slate-700">
                          <strong className="text-indigo-900 block mb-1">Lời giải:</strong>
                          <MathRenderer blocks={q.solutionBlocks} content={q.solution} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Hủy bỏ
          </button>

          <div className="flex items-center gap-3">
            {errorCount > 0 && (
              <span className="text-xs text-rose-600 font-bold flex items-center gap-1">
                <AlertOctagon className="w-4 h-4" /> Còn {errorCount} lỗi cần sửa
              </span>
            )}

            <button
              onClick={handlePublish}
              disabled={errorCount > 0}
              className={`px-6 py-2.5 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 ${
                errorCount > 0
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              XÁC NHẬN NHẬP ĐỀ (XUẤT BẢN ĐỀ THI CHÍNH THỨC)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordPreviewModal;
