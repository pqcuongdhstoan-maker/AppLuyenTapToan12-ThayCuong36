import React, { useState } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  X,
  Sparkles,
  Edit3,
  Save,
  Layers,
  ArrowRight,
  HelpCircle
} from 'lucide-react';
import { DocxParsedExam } from '../../services/docxParser';
import { Lesson, Exam, Question, QuestionType } from '../../types';
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
  const [timeLimit, setTimeLimit] = useState(45);

  if (!isOpen || !parsedData) return null;

  const handleStartEdit = (q: Question) => {
    setEditingQuestionId(q.id);
    setEditingContent(q.content);
    setEditingSolution(q.solution || '');
  };

  const handleSaveEdit = (qId: string) => {
    const updated = questions.map((q) => {
      if (q.id === qId) {
        return {
          ...q,
          content: editingContent,
          solution: editingSolution
        };
      }
      return q;
    });
    setQuestions(updated);
    setEditingQuestionId(null);
  };

  const handlePublish = () => {
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

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>XEM TRƯỚC VÀ PHÊ DUYỆT ĐỀ THI (LATEX & 4 PHẦN)</span>
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

        {/* Overview Stats Bar */}
        <div className="px-6 py-3 bg-indigo-50/60 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700">Tổng số câu: {questions.length}</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-600">Phần I (TN): <strong>{p1Count}</strong></span>
            <span className="text-slate-600">Phần II (Đ/S): <strong>{p2Count}</strong></span>
            <span className="text-slate-600">Phần III (TLN): <strong>{p3Count}</strong></span>
            <span className="text-slate-600">Phần IV (TL): <strong>{p4Count}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-700 font-semibold">Thời gian làm bài:</span>
            <input
              type="number"
              min={10}
              max={180}
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-bold text-slate-900"
            />
            <span>phút</span>
          </div>
        </div>

        {/* Scrollable Questions list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {questions.map((q, idx) => {
            const isEditing = editingQuestionId === q.id;

            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
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
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => handleStartEdit(q)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Sửa câu hỏi
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSaveEdit(q.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Lưu sửa đổi
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung câu hỏi (LaTeX):</label>
                      <MathEditor
                        value={editingContent}
                        onChange={setEditingContent}
                        placeholder="Nội dung câu hỏi..."
                        rows={3}
                      />
                    </div>
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
                      <MathRenderer content={q.content} />
                    </div>

                    {/* Part I Options */}
                    {q.part === 1 && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        {q.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                              opt.id === q.correctOption
                                ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="font-black">{opt.id}.</span>
                            <MathRenderer content={opt.content} />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Part II True/False */}
                    {q.part === 2 && q.trueFalseItems && (
                      <div className="space-y-1 text-xs pt-1">
                        {q.trueFalseItems.map((item) => (
                          <div
                            key={item.id}
                            className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold uppercase text-slate-800">{item.id})</span>
                              <MathRenderer content={item.content} />
                            </div>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              item.correctAnswer ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {item.correctAnswer ? 'ĐÚNG' : 'SAI'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Part III Short Answer */}
                    {q.part === 3 && q.shortAnswerConfig && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                        Đáp án đúng: <strong>{q.shortAnswerConfig.correctAnswers.join(' hoặc ')}</strong>
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

          <button
            onClick={handlePublish}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            XUẤT BẢN ĐỀ THI MỚI (PHIÊN BẢN CHÍNH THỨC)
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordPreviewModal;
