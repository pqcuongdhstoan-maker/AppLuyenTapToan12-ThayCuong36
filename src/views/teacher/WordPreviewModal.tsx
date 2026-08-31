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
  Check
} from 'lucide-react';
import { DocxParsedExam } from '../../services/docxParser';
import { Lesson, Exam, Question, QuestionType, QuestionOption, TrueFalseItem } from '../../types';
import { storageService } from '../../services/storageService';
import { MathRenderer } from '../../components/math/MathRenderer';
import { MathEditor } from '../../components/math/MathEditor';

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
  const [questions, setQuestions] = useState<Question[]>(parsedData?.questions || []);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
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

      // Check for unconvertible warning blocks
      if (q.contentBlocks?.some(b => b.type === 'warning')) {
        issues.push({ questionNumber: qNum, message: `Câu ${qNum}: Có đối tượng công thức/hình ảnh cần kiểm tra lại`, severity: 'warning' });
      }
    });

    return issues;
  }, [questions]);

  const errorCount = liveIssues.filter(i => i.severity === 'error').length;
  const warningCount = liveIssues.filter(i => i.severity === 'warning').length;

  const handleStartEdit = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditingContent(q.content);
    setEditingSolution(q.solution || '');
    setEditingOptions(q.options || [
      { id: 'A', content: '' },
      { id: 'B', content: '' },
      { id: 'C', content: '' },
      { id: 'D', content: '' }
    ]);
    setEditingCorrectOption(typeof q.correctOption === 'string' ? q.correctOption : 'A');
    setEditingTrueFalseItems(q.trueFalseItems || [
      { id: 'a', content: '', correctAnswer: true },
      { id: 'b', content: '', correctAnswer: false },
      { id: 'c', content: '', correctAnswer: true },
      { id: 'd', content: '', correctAnswer: false }
    ]);
    setEditingShortAnswer(q.shortAnswerConfig?.correctAnswers?.[0] || '');
    setEditingImageUrl(q.imageUrl || '');
  };

  const handleSaveEdit = (qId: string) => {
    const updated = questions.map((q) => {
      if (q.id === qId) {
        return {
          ...q,
          content: editingContent,
          solution: editingSolution,
          options: q.part === 1 ? editingOptions : q.options,
          correctOption: q.part === 1 ? editingCorrectOption : q.correctOption,
          trueFalseItems: q.part === 2 ? editingTrueFalseItems : q.trueFalseItems,
          shortAnswerConfig: q.part === 3 ? { correctAnswers: [editingShortAnswer.trim()].filter(Boolean) } : q.shortAnswerConfig,
          imageUrl: editingImageUrl || undefined,
          needsTeacherCheck: false
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
      // Re-index question numbers
      const reindexed = remaining.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
      setQuestions(reindexed);
      if (editingQuestionId === qId) {
        setEditingQuestionId(null);
      }
    }
  };

  const handlePublish = () => {
    if (errorCount > 0) {
      alert(`Đề thi vẫn còn ${errorCount} lỗi cần xử lý trước khi xuất bản. Vui lòng bấm "Sửa câu hỏi" để hoàn thiện đáp án/nội dung.`);
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
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>XEM TRƯỚC VÀ PHÊ DUYỆT ĐỀ THI (LATEX & RICH BLOCKS)</span>
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {parsedData.title || `Đề luyện tập: ${lesson.title}`}
            </h3>
            <p className="text-xs text-slate-500">
              Gán cho: <strong>Bài {lesson.number} – {lesson.title}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Detailed Stats Overview Bar */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-700">
            <span className="font-bold">Tổng số: {questions.length} câu</span>
            <span className="text-slate-300">|</span>
            <span>Phần I: <strong>{p1Count}</strong></span>
            <span>Phần II: <strong>{p2Count}</strong></span>
            <span>Phần III: <strong>{p3Count}</strong></span>
            <span>Phần IV: <strong>{p4Count}</strong></span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded">OMML: {stats.ommlCount}</span>
            <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded">MathType: {stats.mathTypeCount}</span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Ảnh: {stats.imageCount}</span>
            {stats.failedConversionsCount > 0 && (
              <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">Lỗi đối tượng: {stats.failedConversionsCount}</span>
            )}
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
                {liveIssues.slice(0, 4).map((iss, i) => (
                  <li key={i}>{iss.message}</li>
                ))}
                {liveIssues.length > 4 && (
                  <li>...và {liveIssues.length - 4} vấn đề khác bên dưới</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Scrollable Questions list */}
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-indigo-600 text-white">
                      CÂU {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {q.part === 1 && 'Trắc nghiệm 4 lựa chọn'}
                      {q.part === 2 && 'Trắc nghiệm Đúng / Sai'}
                      {q.part === 3 && 'Trả lời ngắn'}
                      {q.part === 4 && 'Tự luận'}
                    </span>
                    <span className="text-xs text-slate-400">({q.points} điểm)</span>
                    {q.part === 1 && !q.correctOption && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-extrabold rounded-md flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3" /> Chưa chọn đáp án
                      </span>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="flex items-center gap-1.5">
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
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung câu hỏi (MathType / LaTeX $...$):</label>
                      <MathEditor
                        value={editingContent}
                        onChange={setEditingContent}
                        placeholder="Nội dung câu hỏi..."
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

                    {/* Part I: Edit 4 Options & Correct Answer Radio */}
                    {q.part === 1 && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">Các phương án và chọn đáp án đúng:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {editingOptions.map((opt, oIdx) => (
                            <div
                              key={opt.id}
                              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                                opt.id === editingCorrectOption
                                  ? 'bg-emerald-50 border-emerald-300'
                                  : 'bg-slate-50 border-slate-200'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct_opt_${q.id}`}
                                checked={opt.id === editingCorrectOption}
                                onChange={() => setEditingCorrectOption(opt.id)}
                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              />
                              <span className="font-bold text-xs">{opt.id}.</span>
                              <input
                                type="text"
                                value={opt.content}
                                onChange={(e) => {
                                  const updated = [...editingOptions];
                                  updated[oIdx] = { ...opt, content: e.target.value };
                                  setEditingOptions(updated);
                                }}
                                className="flex-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                placeholder={`Nội dung phương án ${opt.id}...`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Part II: Edit True/False Items */}
                    {q.part === 2 && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-700">Các mệnh đề và tính Đúng / Sai:</label>
                        <div className="space-y-2">
                          {editingTrueFalseItems.map((tf, tfIdx) => (
                            <div key={tf.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                              <span className="font-bold uppercase text-xs w-6">{tf.id})</span>
                              <input
                                type="text"
                                value={tf.content}
                                onChange={(e) => {
                                  const updated = [...editingTrueFalseItems];
                                  updated[tfIdx] = { ...tf, content: e.target.value };
                                  setEditingTrueFalseItems(updated);
                                }}
                                className="flex-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                                placeholder={`Nội dung ý ${tf.id}...`}
                              />
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...editingTrueFalseItems];
                                    updated[tfIdx] = { ...tf, correctAnswer: true };
                                    setEditingTrueFalseItems(updated);
                                  }}
                                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                                    tf.correctAnswer === true
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
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
                                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                                    tf.correctAnswer === false
                                      ? 'bg-rose-600 text-white shadow-xs'
                                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
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

                    {/* Part III: Edit Short Answer */}
                    {q.part === 3 && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Đáp số đúng (số, phân số, tọa độ):</label>
                        <input
                          type="text"
                          value={editingShortAnswer}
                          onChange={(e) => setEditingShortAnswer(e.target.value)}
                          placeholder="Ví dụ: -199 hoặc 3/4 hoặc 0.75"
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:border-indigo-500 focus:outline-none font-bold"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Lời giải chi tiết (LaTeX):</label>
                      <MathEditor
                        value={editingSolution}
                        onChange={setEditingSolution}
                        placeholder="Lời giải chi tiết..."
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-slate-900 leading-relaxed font-medium">
                      <MathRenderer blocks={q.contentBlocks} content={q.content} />
                    </div>

                    {q.imageUrl && !q.content.includes(q.imageUrl) && (
                      <div className="my-2 flex justify-center">
                        <img src={q.imageUrl} alt="Hình minh họa" className="max-h-56 object-contain rounded-xl border border-slate-200 p-1 bg-white shadow-2xs" />
                      </div>
                    )}

                    {/* Action Sub-divider (Azota Style) */}
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

                    {/* Part I Options (Azota Layout) */}
                    {q.part === 1 && q.options && (
                      <div className="space-y-2.5 text-xs pt-1">
                        {q.options.map((opt) => (
                          <div
                            key={opt.id}
                            className="flex items-center gap-2.5"
                          >
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

                    {/* Part II True/False (Azota Layout) */}
                    {q.part === 2 && q.trueFalseItems && (
                      <div className="space-y-2 text-xs pt-1">
                        {q.trueFalseItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2.5"
                          >
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
                        <MathRenderer content={q.solution} />
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
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
              XUẤT BẢN ĐỀ THI MỚI (PHIÊN BẢN CHÍNH THỨC)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordPreviewModal;
